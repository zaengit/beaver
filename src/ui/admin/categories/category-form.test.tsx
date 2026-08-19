// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { CategoryForm } from "@zaenpm/beaver/ui/admin/categories/category-form"

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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@zaenpm/beaver/ui/admin/shared/media-picker", () => ({
  MediaPicker: () => <button type="button">media-picker</button>,
}))

vi.mock("@zaenpm/beaver/ui/admin/layout/admin-page-shell", () => ({
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

describe("CategoryForm", () => {
  beforeEach(() => {
    adminApiPost.mockReset()
    adminApiPut.mockReset()
    navigateToPath.mockReset()
  })

  it("uses SPA navigation after a successful save", async () => {
    adminApiPost.mockResolvedValue({
      success: true,
      message: "ok",
      data: { id: "cat-1" },
    })

    render(
      <MemoryRouter>
        <CategoryForm mode="create" />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "News" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Create Category" }))

    await waitFor(() => {
      expect(adminApiPost).toHaveBeenCalled()
      expect(navigateToPath).toHaveBeenCalledWith("/admin/categories/post")
    })
  })

  it("shows validation errors from the API", async () => {
    adminApiPost.mockResolvedValue({
      success: false,
      message: "Validation error.",
      errors: { name: ["Name is required."] },
    })

    render(
      <MemoryRouter>
        <CategoryForm mode="create" />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Create Category" }))

    await waitFor(() => {
      expect(screen.getByText("Name is required.")).toBeInTheDocument()
    })
  })
})
