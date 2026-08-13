// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { PageForm } from "zadm/ui/admin/pages/page-form"

const { adminApiPost, adminApiPut, navigateToPath } = vi.hoisted(() => ({
  adminApiPost: vi.fn(),
  adminApiPut: vi.fn(),
  navigateToPath: vi.fn(),
}))

vi.mock("zadm/ui/admin/shared/api-client", () => ({ adminApiPost, adminApiPut }))
vi.mock("zadm/ui/admin/navigation", () => ({ navigateToPath }))
vi.mock("zadm/ui/admin/editor/tiptap-editor", () => ({
  TiptapEditor: () => <div>tiptap-editor</div>,
}))
vi.mock("zadm/ui/admin/sections/section-embedder", () => ({
  SectionEmbedder: () => <div>section-embedder</div>,
}))
vi.mock("zadm/ui/admin/layout/admin-page-shell", () => ({
  AdminPageHeader: ({ title, actions }: { title: string; actions?: React.ReactNode }) => <div><h1>{title}</h1>{actions}</div>,
}))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe("PageForm", () => {
  beforeEach(() => {
    adminApiPost.mockReset()
    navigateToPath.mockReset()
  })

  it("creates a page through the existing posts API", async () => {
    adminApiPost.mockResolvedValue({ success: true, message: "ok", data: { id: "page-1" } })

    render(<PageForm mode="create" />)
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Settings" }))
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "About us" } })
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Create Page" }))

    await waitFor(() => {
      expect(adminApiPost).toHaveBeenCalledWith(
        "/api/admin/posts",
        expect.objectContaining({ title: "About us", slug: "about-us", type: "page" }),
      )
      expect(navigateToPath).toHaveBeenCalledWith("/admin/posts/page")
    })
  })
})
