// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { PostForm } from "@zbeaver/beaver/ui/admin/posts/post-form"

const { adminApiGet, adminApiPost, adminApiPut, navigateToPath } = vi.hoisted(() => ({
  adminApiGet: vi.fn(),
  adminApiPost: vi.fn(),
  adminApiPut: vi.fn(),
  navigateToPath: vi.fn(),
}))

vi.mock("@zbeaver/beaver/ui/admin/shared/api-client", () => ({
  adminApiGet,
  adminApiPost,
  adminApiPut,
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")
  return {
    ...actual,
  }
})

vi.mock("@zbeaver/beaver/ui/admin/navigation", () => ({
  navigateToPath,
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@zbeaver/beaver/ui/admin/posts/content-type-fields-renderer", () => ({
  ContentTypeFieldsRenderer: () => <div>template-fields</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/sections/section-embedder", () => ({
  SectionEmbedder: () => <div>section-embedder</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/shared/media-picker", () => ({
  MediaPicker: () => <button type="button">media-picker</button>,
}))

vi.mock("@zbeaver/beaver/ui/admin/editor/tiptap-editor", () => ({
  TiptapEditor: () => <div>tiptap-editor</div>,
}))

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: {},
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  arrayMove: <T,>(items: T[]) => items,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
  }),
  rectSortingStrategy: {},
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => "",
    },
  },
}))

vi.mock("@zbeaver/beaver/ui/admin/layout/admin-page-shell", () => ({
  AdminPageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AdminPageHeader: ({
    title,
    search,
    actions,
  }: {
    title: string
    search?: React.ReactNode
    actions?: React.ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {search}
      {actions}
    </div>
  ),
}))

describe("PostForm", () => {
  beforeEach(() => {
    adminApiGet.mockReset()
    adminApiPost.mockReset()
    adminApiPut.mockReset()
    navigateToPath.mockReset()
    adminApiGet.mockResolvedValue([{ slug: "post", detailTemplate: "default" }])
  })

  it("uses SPA navigation after a successful save", async () => {
    adminApiPost.mockResolvedValue({
      success: true,
      message: "ok",
      data: { id: "post-1" },
    })

    render(
      <MemoryRouter>
        <PostForm mode="create" categories={[]} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Hello World" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Create Post" }))

    await waitFor(() => {
      expect(adminApiPost).toHaveBeenCalled()
      expect(navigateToPath).toHaveBeenCalledWith("/admin/posts/post")
    })
  })

  it("omits null optional fields from the create payload", async () => {
    adminApiPost.mockResolvedValue({
      success: false,
      message: "Validation error.",
      errors: {},
    })

    render(
      <MemoryRouter>
        <PostForm mode="create" categories={[]} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Payload Check" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Create Post" }))

    await waitFor(() => {
      expect(adminApiPost).toHaveBeenCalledWith(
        "/api/admin/posts",
        expect.not.objectContaining({
          description: null,
          gallery: null,
        }),
      )
    })
  })
})
