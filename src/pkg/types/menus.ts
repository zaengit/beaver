export interface Menu {
  id: string
  title: string
  url: string
  type: string
  position: number
  parentId: string | null
  cssClass: string | null
  target: string | null
  createdAt: number
  updatedAt: number
}

export interface MenuTree extends Menu {
  children: MenuTree[]
}

export interface CreateMenuInput {
  title: string
  url: string
  type: string
  position?: number
  parentId?: string | null
  cssClass?: string | null
  target?: string | null
}

export interface UpdateMenuInput {
  title?: string
  url?: string
  type?: string
  position?: number
  parentId?: string | null
  cssClass?: string | null
  target?: string | null
}
