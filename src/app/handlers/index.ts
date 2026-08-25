/**
 * Barrel export — handlers.
 * Import from `beaver/app/handlers` instead of individual files.
 */

export { handlePasswordLogin } from "./auth"
export {
  handleTwoFactorStatus,
  handleTwoFactorSetup,
  handleTwoFactorEnable,
  handleTwoFactorDisable,
} from "./two-factor"
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
  handleRestorePost,
  handlePermanentlyDeletePost,
  handleBulkDeletePosts,
  handleBulkRestorePosts,
  handleBulkPermanentlyDeletePosts,
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
  handleDisableUserTwoFactor,
  handleBulkDeleteUsers,
  handleBulkDuplicateUsers,
} from "./users"
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
export { handleListActivityLogs } from "./activity-logs"
