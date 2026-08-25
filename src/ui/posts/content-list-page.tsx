import {
  AdminContentListPage as SharedAdminContentListPage,
  type AdminContentListPageProps,
} from "@zbeaver/beaver/ui/shared/content-page"

export type { AdminContentListPageProps }

export function AdminContentListPage(props: AdminContentListPageProps) {
  return <SharedAdminContentListPage {...props} />
}
