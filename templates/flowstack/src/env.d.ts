/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session?: Awaited<ReturnType<typeof import("@zaen3/beaver/server").validateSession>>
  }
}
