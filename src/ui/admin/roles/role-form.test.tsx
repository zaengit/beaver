// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { RoleForm } from "@zaenpm/beaver/ui/admin/roles/role-form"

const { adminApiPost, adminApiPut, navigateToPath } = vi.hoisted(() => ({
  adminApiPost: vi.fn(),
  adminApiPut: vi.fn(),
  navigateToPath: vi.fn(),
}))

vi.mock("@zaenpm/beaver/ui/admin/shared/api-client", () => ({
  adminApiPost,
  adminApiPut,
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")
  return {
    ...actual,
  }
})

vi.mock("@zaenpm/beaver/ui/admin/navigation", () => ({
  navigateToPath,
}))

vi.mock("@zaenpm/beaver/ui/admin/roles/permission-matrix", () => ({
  PermissionMatrix: () => <div>permission-matrix</div>,
}))

vi.mock("@zaenpm/beaver/ui/admin/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button">toggle</button>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSidebar: () => ({ open: true, setOpen: vi.fn() }),
}))

describe("RoleForm", () => {
  beforeEach(() => {
    adminApiPost.mockReset()
    adminApiPut.mockReset()
    navigateToPath.mockReset()
  })

  it("uses SPA navigation after a successful save", async () => {
    adminApiPost.mockResolvedValue({
      success: true,
      message: "ok",
      data: { id: "role-1" },
    })

    render(
      <MemoryRouter>
        <RoleForm mode="create" groupedPermissions={{}} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Editor" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Create Role" }))

    await waitFor(() => {
      expect(adminApiPost).toHaveBeenCalled()
      expect(navigateToPath).toHaveBeenCalledWith("/admin/roles")
    })
  })
})
