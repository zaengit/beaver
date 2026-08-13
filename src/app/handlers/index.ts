/**
 * Barrel export — handlers.
 * Import from `zadm/app/handlers` instead of individual files.
 */

export { handlePasswordLogin } from "./auth"
export {
  handleListCategories,
  handleCreateCategory,
  handleGetCategory,
  handleUpdateCategory,
  handleDuplicateCategory,
  handleDeleteCategory,
  handleBulkDeleteCategories,
  handleBulkDuplicateCategories,
  handleBulkUpdateCategoryStatus,
} from "./categories"
export {
  handleListPosts,
  handleCreatePost,
  handleGetPost,
  handleUpdatePost,
  handleDuplicatePost,
  handleDeletePost,
  handleBulkDeletePosts,
  handleBulkPublishPosts,
  handleBulkUnpublishPosts,
  handleBulkDuplicatePosts,
} from "./posts"
export {
  handleListUsers,
  handleCreateUser,
  handleGetUser,
  handleUpdateUser,
  handleDuplicateUser,
  handleDeleteUser,
  handleBulkDeleteUsers,
  handleBulkDuplicateUsers,
} from "./users"
export {
  handleListRoles,
  handleCreateRole,
  handleGetRole,
  handleUpdateRole,
  handleDuplicateRole,
  handleDeleteRole,
  handleBulkDeleteRoles,
  handleBulkDuplicateRoles,
} from "./roles"
export { handleGetSettings, handleUpdateSettings } from "./settings"
export { handleUpdateProfile } from "./profile"
export {
  handleListMenus,
  handleCreateMenu,
  handleGetMenu,
  handleUpdateMenu,
  handleDeleteMenu,
  handleReorderMenus,
} from "./menus"
export {
  handleListMedia,
  handleGetMedia,
  handleUpdateMedia,
  handleDeleteMedia,
  handleBulkDeleteMedia,
  handleUploadMedia,
} from "./media"

export type { Session, HandlerResponse } from "./types"
export { mapServiceError } from "./error-mapper"
export { requireAuth, requirePermission, requireAnyPermission } from "./guard"
export { parseWithSchema, toFieldErrors } from "./utils"
