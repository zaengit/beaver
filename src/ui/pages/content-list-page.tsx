import { AdminContentListPage as SharedAdminContentListPage } from "@zbeaver/beaver/ui/shared/content-page"

export function AdminContentListPage() {
  return (
    <SharedAdminContentListPage
      contentType="page"
      pageTitle="Pages"
      createMode="dialog"
    />
  )
}
