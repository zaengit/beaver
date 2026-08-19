// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { MediaLibraryClient } from "@zaenpm/beaver/ui/admin/media/media-library-client"

const {
  adminApiPost,
  adminApiPut,
  getCurrentSearchParams,
  navigateTo,
  reloadPage,
} = vi.hoisted(() => ({
  adminApiPost: vi.fn(),
  adminApiPut: vi.fn(),
  getCurrentSearchParams: vi.fn(() => new URLSearchParams("page=1")),
  navigateTo: vi.fn(),
  reloadPage: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@zaenpm/beaver/ui/admin/shared/api-client", () => ({
  adminApiPost,
  adminApiPut,
}))

vi.mock("@zaenpm/beaver/ui/admin/navigation", () => ({
  getCurrentSearchParams,
  navigateTo,
  reloadPage,
}))

vi.mock("@zaenpm/beaver/ui/admin/media/media-grid", () => ({
  MediaGrid: ({
    items,
    onSelect,
  }: {
    items: Array<{ id: string; name: string }>
    onSelect: (id: string) => void
  }) => (
    <div>
      <div>grid-count-{items.length}</div>
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onSelect(item.id)}>
          select-{item.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock("@zaenpm/beaver/ui/admin/shared/media-upload-zone", () => ({
  MediaUploadZone: ({ onUploadComplete }: { onUploadComplete: () => void }) => (
    <button type="button" onClick={onUploadComplete}>
      upload-complete
    </button>
  ),
}))

describe("MediaLibraryClient", () => {
  beforeEach(() => {
    adminApiPost.mockReset()
    adminApiPut.mockReset()
    getCurrentSearchParams.mockClear()
    navigateTo.mockClear()
    reloadPage.mockClear()
    vi.stubGlobal("fetch", vi.fn())
  })

  it("refreshes media items after a successful bulk delete without reloading the page", async () => {
    adminApiPost
      .mockResolvedValueOnce({ success: true, data: [] })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        meta: null,
      }),
    })
    vi.stubGlobal("confirm", vi.fn(() => true))

    render(
      <MemoryRouter>
        <MediaLibraryClient
          initialItems={[
            {
              id: "media-1",
              name: "Hero",
              fileName: "hero.jpg",
              mimeType: "image/jpeg",
              size: 1024,
              url: "/hero.jpg",
              thumbnailUrl: null,
              alt: null,
              caption: null,
              width: null,
              height: null,
              folder: null,
              createdAt: 0,
              updatedAt: 0,
            },
          ]}
          meta={null}
        />
      </MemoryRouter>
    )

    expect(screen.getByText("grid-count-1")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "select-Hero" }))
    fireEvent.click(screen.getByRole("button", { name: /delete/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/media?page=1", { credentials: "include" })
      expect(screen.getByText("grid-count-0")).toBeTruthy()
    })

    expect(reloadPage).not.toHaveBeenCalled()
  })
})
