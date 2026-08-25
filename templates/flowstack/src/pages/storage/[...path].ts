import { readStorageFile } from "@zbeaver/beaver/server"

export const prerender = false

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
}

function contentType(filePath: string) {
  const extension = filePath.split(".").at(-1)?.toLowerCase() ?? ""
  return CONTENT_TYPES[extension] ?? "application/octet-stream"
}

async function serveStorageFile(path: string | undefined) {
  if (!path) return new Response("Not Found", { status: 404 })

  try {
    const contents = await readStorageFile(path)
    if (!contents) return new Response("Not Found", { status: 404 })

    return new Response(contents as unknown as BodyInit, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(contents.byteLength),
        "Content-Type": contentType(path),
      },
    })
  } catch {
    return new Response("Not Found", { status: 404 })
  }
}

export const GET = ({ params }: { params: { path?: string } }) => serveStorageFile(params.path)
export const HEAD = ({ params }: { params: { path?: string } }) => serveStorageFile(params.path)
