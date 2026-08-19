export interface Category {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  image: string | null
  createdAt: number
  updatedAt: number
}

export interface CategoryFilters {
  search?: string
  type?: string
  sortBy?: string
  sortOrder?: string
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  type?: string
  description?: string | null
  image?: string | null
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  type?: string
  description?: string | null
  image?: string | null
}
