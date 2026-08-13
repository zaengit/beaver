// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { MenuBuilder } from "zadm/ui/admin/menus/menu-builder"

const { adminApiPost, adminApiPut, adminApiDelete, reloadPage } = vi.hoisted(() => ({
  adminApiPost: vi.fn(),
  adminApiPut: vi.fn(),
  adminApiDelete: vi.fn(),
  reloadPage: vi.fn(),
}))

vi.mock("zadm/ui/admin/shared/api-client", () => ({
  adminApiPost,
  adminApiPut,
  adminApiDelete,
}))

vi.mock("zadm/ui/admin/navigation", () => ({
  reloadPage,
}))

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PointerSensor: class {},
  KeyboardSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: {},
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  arrayMove: <T,>(items: T[]) => items,
  sortableKeyboardCoordinates: {},
}))

vi.mock("zadm/ui/admin/menus/sortable-menu-item", () => ({
  SortableMenuItem: ({
    item,
    onEdit,
    onDelete,
  }: {
    item: { id: string; depth: number }
    onEdit: (id: string, data: { title: string; url: string; cssClass: string; target: string }) => void
    onDelete: (id: string) => void
  }) => (
    <div data-testid={`item-${item.id}`} data-depth={item.depth}>
      <button
        type="button"
        onClick={() =>
          onEdit(item.id, {
            title: "Edited title",
            url: "/edited",
            cssClass: "",
            target: "",
          })}
      >
        edit-{item.id}
      </button>
      <button type="button" onClick={() => onDelete(item.id)}>
        delete-{item.id}
      </button>
    </div>
  ),
}))

describe("MenuBuilder", () => {
  beforeEach(() => {
    adminApiPost.mockReset()
    adminApiPut.mockReset()
    adminApiDelete.mockReset()
    reloadPage.mockClear()
  })

  it("keeps the update in local state after save without reloading the page", async () => {
    adminApiPost.mockResolvedValue({ success: true, data: null })
    adminApiPut.mockResolvedValue({ success: true, data: null })

    render(
      <MenuBuilder
        type="navbar"
        initialTree={[
          {
            id: "item-1",
            title: "Home",
            url: "/",
            position: 0,
            cssClass: null,
            target: null,
            image: null,
            status: "published" as const,
            parentId: null,
            children: [],
          },
        ]}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "edit-item-1" }))
    expect(screen.getByText("Unsaved changes")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Save Menu" }))

    await waitFor(() => {
      expect(adminApiPost).toHaveBeenCalledWith("/api/admin/menus/reorder", expect.any(Object))
      expect(adminApiPut).toHaveBeenCalledWith("/api/admin/menus/item-1", expect.objectContaining({
        title: "Edited title",
        url: "/edited",
      }))
    })

    await waitFor(() => {
      expect(screen.queryByText("Unsaved changes")).toBeNull()
    })

    expect(reloadPage).not.toHaveBeenCalled()
  })

  it("promotes a deleted item's subtree by one level", async () => {
    adminApiDelete.mockResolvedValue({ success: true, data: null })

    render(
      <MenuBuilder
        type="navbar"
        initialTree={[
          {
            id: "parent",
            title: "Parent",
            url: "/parent",
            position: 0,
            cssClass: null,
            target: null,
            image: null,
            status: "published" as const,
            parentId: null,
            children: [
              {
                id: "child",
                title: "Child",
                url: "/child",
                position: 0,
                cssClass: null,
                target: null,
                image: null,
                status: "published" as const,
                parentId: "parent",
                children: [
                  {
                    id: "grandchild",
                    title: "Grandchild",
                    url: "/grandchild",
                    position: 0,
                    cssClass: null,
                    target: null,
                    image: null,
                    status: "published" as const,
                    parentId: "child",
                    children: [],
                  },
                ],
              },
            ],
          },
        ]}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "delete-parent" }))

    await waitFor(() => {
      expect(adminApiDelete).toHaveBeenCalledWith("/api/admin/menus/parent")
      expect(screen.queryByTestId("item-parent")).toBeNull()
    })

    expect(screen.getByTestId("item-child")).toHaveAttribute("data-depth", "0")
    expect(screen.getByTestId("item-grandchild")).toHaveAttribute("data-depth", "1")
  })
})
