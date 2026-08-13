import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("zadm/app/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      rolePermissions: {
        findMany: vi.fn(),
      },
    },
  },
}));

import { db } from "zadm/app/db";
import {
  getUserPermissions,
  can,
  canAny,
  canAll,
  requirePermission,
  clearPermissionCache,
} from "zadm/app/admin/permissions";

describe("rbac", () => {
  beforeEach(() => {
    clearPermissionCache();
    vi.clearAllMocks();
  });

  describe("getUserPermissions", () => {
    it("should return empty array if user not found", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue(undefined as any);

      const result = await getUserPermissions("nonexistent-user");
      expect(result).toEqual([]);
    });

    it("should return empty array if user has no roleId", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({ roleId: null } as any);

      const result = await getUserPermissions("user-no-role");
      expect(result).toEqual([]);
    });

    it("should return permission slugs for user with role", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
        { permission: { slug: "posts.create" } },
        { permission: { slug: "media.view" } },
      ] as any);

      const result = await getUserPermissions("user-with-role");
      expect(result).toEqual(["posts.view", "posts.create", "media.view"]);
    });

    it("should re-read permissions so revocations apply immediately", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      await getUserPermissions("cached-user");
      await getUserPermissions("cached-user");

      expect(db.query.users.findFirst).toHaveBeenCalledTimes(2);
      expect(db.query.rolePermissions.findMany).toHaveBeenCalledTimes(2);
    });

    it("should not share cache between different userIds", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      await getUserPermissions("user-a");
      await getUserPermissions("user-b");

      expect(db.query.users.findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe("can", () => {
    it("should return true if user has the permission", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.create" } },
        { permission: { slug: "posts.view" } },
      ] as any);

      expect(await can("user-1", "posts.create")).toBe(true);
    });

    it("should return false if user does not have the permission", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      expect(await can("user-1", "posts.delete")).toBe(false);
    });

    it("should return false if user has no role", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({ roleId: null } as any);

      expect(await can("user-no-role", "posts.view")).toBe(false);
    });
  });

  describe("canAny", () => {
    it("should return true if user has at least one of the permissions", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      expect(await canAny("user-1", ["posts.view", "posts.create"])).toBe(true);
    });

    it("should return false if user has none of the permissions", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "media.view" } },
      ] as any);

      expect(await canAny("user-1", ["posts.view", "posts.create"])).toBe(false);
    });

    it("should return false for empty permissions array", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      expect(await canAny("user-1", [])).toBe(false);
    });
  });

  describe("canAll", () => {
    it("should return true if user has all of the permissions", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
        { permission: { slug: "posts.create" } },
        { permission: { slug: "posts.delete" } },
      ] as any);

      expect(await canAll("user-1", ["posts.view", "posts.create"])).toBe(true);
    });

    it("should return false if user is missing any of the permissions", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      expect(await canAll("user-1", ["posts.view", "posts.create"])).toBe(false);
    });

    it("should return true for empty permissions array", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      expect(await canAll("user-1", [])).toBe(true);
    });
  });

  describe("requirePermission", () => {
    it("should return null if user has the permission", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.create" } },
      ] as any);

      const result = await requirePermission("user-1", "posts.create");
      expect(result).toBeNull();
    });

    it("should return forbidden ErrorResponse if user lacks the permission", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      const result = await requirePermission("user-1", "posts.delete");
      expect(result).not.toBeNull();
      expect(result!.success).toBe(false);
      expect(result!.status).toBe(403);
      expect(result!.message).toBe("Insufficient permissions.");
    });
  });

  describe("clearPermissionCache", () => {
    it("should clear cached permissions so next call queries DB again", async () => {
      vi.mocked(db.query.users.findFirst).mockReturnValue({
        roleId: "role-1",
      } as any);
      vi.mocked(db.query.rolePermissions.findMany).mockReturnValue([
        { permission: { slug: "posts.view" } },
      ] as any);

      await getUserPermissions("user-1");
      expect(db.query.users.findFirst).toHaveBeenCalledTimes(1);

      clearPermissionCache();

      await getUserPermissions("user-1");
      expect(db.query.users.findFirst).toHaveBeenCalledTimes(2);
    });
  });
});
