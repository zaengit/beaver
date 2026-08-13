import { ulid } from "ulidx"

export function generateId(): string {
  return ulid()
}
