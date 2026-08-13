// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { AdminLoginPage } from "zadm/ui/admin/auth/admin-login-page"
import { ADMIN_PATH } from "zadm/app/admin/admin-path"

const { navigateMock, refreshSessionMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  refreshSessionMock: vi.fn(),
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock("zadm/ui/admin/auth/admin-session-provider", () => ({
  useAdminSession: () => ({
    refreshSession: refreshSessionMock,
  }),
}))

describe("AdminLoginPage", () => {
  beforeEach(() => {
    navigateMock.mockReset()
    refreshSessionMock.mockReset()
    vi.restoreAllMocks()
    refreshSessionMock.mockResolvedValue({ user: {}, permissions: [], roleName: null })
  })

  it("refreshes admin session before redirecting after login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    } as Response)

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    )

    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!)

    await waitFor(() => {
      expect(refreshSessionMock).toHaveBeenCalledTimes(1)
      expect(navigateMock).toHaveBeenCalledWith(ADMIN_PATH, { replace: true })
    })
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/admin/auth/login", expect.objectContaining({ credentials: "include" }))
  })

  it("keeps the user on login when the new session cannot be verified", async () => {
    refreshSessionMock.mockResolvedValue(null)
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    )

    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!)

    await waitFor(() => {
      expect(screen.getByText("Login berhasil, tetapi sesi tidak dapat diverifikasi. Silakan coba lagi.")).toBeTruthy()
    })
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
