import { apiApp } from "@zbeaver/beaver/server"

export const prerender = false

export const ALL = ({ request }: { request: Request }) => apiApp.fetch(request)
