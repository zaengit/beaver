import type { AdminRoute } from "zadm/router/route"

import { handleUploadMedia } from "zadm/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData()
    return handleUploadMedia(locals.session, formData)
  } catch {
    return Response.json({ success: false, message: "Internal server error." }, { status: 500 })
  }
}
