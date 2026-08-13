import { z } from "zod"
import { ulidRegex, emptyToNull, publishStatusEnum } from "zadm/app/validations/shared"

// Menu type enum (Req 7.1)
const menuTypeEnum = z.enum(["navbar", "footer", "sidebar"])

export const createMenuSchema = z.object({
  // Required: 1-100 characters (Req 7.1)
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),

  // Required: URL string
  url: z.string().min(1, "URL is required"),

  // Required: menu type (Req 7.1)
  type: menuTypeEnum,

  // Optional: non-negative integer, defaults to 0 (Req 7.1)
  position: z.number().int().min(0, "Position must be a non-negative integer").default(0),

  // Optional: parent menu item ID (ULID)
  parentId: z
    .string()
    .regex(ulidRegex, "Parent ID must be a valid ULID")
    .nullable()
    .optional(),

  // Optional: empty → null (Req 9.9)
  cssClass: emptyToNull,

  // Optional: empty → null (Req 9.9)
  target: emptyToNull,
  image: emptyToNull,
  status: publishStatusEnum.default("published"),
})

// Update schema: all fields optional (partial update)
export const updateMenuSchema = createMenuSchema.partial()

// Recursive tree item schema for drag-and-drop reorder (Req 7.5)
interface MenuTreeReorderInput {
  id: string
  parentId: string | null
  position: number
  children: MenuTreeReorderInput[]
}

const menuTreeItemSchema: z.ZodType<MenuTreeReorderInput> = z.lazy(() =>
  z.object({
    id: z.string().regex(ulidRegex, "Menu item ID must be a valid ULID"),
    parentId: z.string().regex(ulidRegex, "Parent ID must be a valid ULID").nullable(),
    position: z.number().int().min(0, "Position must be a non-negative integer"),
    children: z.array(menuTreeItemSchema),
  })
)

export const reorderMenusSchema = z.object({
  type: menuTypeEnum,
  tree: z.array(menuTreeItemSchema),
})

// Inferred types
export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
export type ReorderMenusInput = z.infer<typeof reorderMenusSchema>
