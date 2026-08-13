
import { toast } from "sonner"

type CrudAction = "create" | "update" | "delete"

export type AdminToastEntity =
  | "post"
  | "page"
  | "category"
  | "custom field"
  | "section"
  | "user"
  | "role"
  | "media"
  | "menu"
  | "menu item"
  | "profile"
  | "selected media"
  | "url"

const entityLabels: Record<AdminToastEntity, string> = {
  post: "Post",
  page: "Page",
  category: "Category",
  "custom field": "Custom field",
  section: "Section",
  user: "User",
  role: "Role",
  media: "Media",
  menu: "Menu",
  "menu item": "Menu item",
  profile: "Profile",
  "selected media": "Selected media",
  url: "URL",
}

const actionLabels: Record<CrudAction, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
}

export const adminToast = {
  success(action: CrudAction, entity: AdminToastEntity) {
    toast.success(`${entityLabels[entity]} ${actionLabels[action]}.`)
  },
  error(message: string) {
    toast.error(message)
  },
  uploaded(name: string) {
    toast.success(`Uploaded ${name}.`)
  },
  uploadedMany(count: number) {
    toast.success(count === 1 ? "Media uploaded." : `${count} files uploaded.`)
  },
  copied(entity: "url") {
    toast.success(`${entityLabels[entity]} copied.`)
  },
  published(entity: "post") {
    toast.success(`${entityLabels[entity]} published.`)
  },
  unpublished(entity: "post") {
    toast.success(`${entityLabels[entity]} unpublished.`)
  },
  saved(entity: "menu") {
    toast.success(`${entityLabels[entity]} saved.`)
  },
}
