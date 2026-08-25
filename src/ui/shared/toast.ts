
import { toast } from "sonner"

type CrudAction = "create" | "update" | "delete"

export type AdminToastEntity =
  | "post"
  | "page"
  | "category"
  | "settings"
  | "user"
  | "role"
  | "permission"
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
  settings: "Settings",
  user: "User",
  role: "Role",
  permission: "Permissions",
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
  message(message: string) {
    toast.success(message)
  },
  close(id?: string | number) {
    toast.dismiss(id)
  },
  uploaded(name: string) {
    toast.success(`Uploaded ${name}.`)
  },
  copied(entity: "url") {
    toast.success(`${entityLabels[entity]} copied.`)
  },
  saved(entity: "menu") {
    toast.success(`${entityLabels[entity]} saved.`)
  },
}
