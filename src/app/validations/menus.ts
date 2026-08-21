import { z } from "zod"
import { ulidRegex, emptyToNull, imageUrlSimpleSchema, publishStatusEnum, safeHrefSchema } from "@zbeaver/beaver/app/validations/shared"

// Menu type enum (Req 7.1)
const menuTypeEnum = z.enum(["navbar", "footer", "sidebar"])

export const createMenuSchema = z.object({
  // Required: 1-100 characters (Req 7.1)
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),

  // Required: URL string
  url: safeHrefSchema,

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
  target: z.preprocess(
    (value) => value === "" ? null : value,
    z.enum(["_self", "_blank", "_parent", "_top"]).nullable().optional(),
  ),
  image: imageUrlSimpleSchema,
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

const MAX_MENU_DEPTH = 20
const MAX_MENU_CHILDREN = 100
const MAX_MENU_NODES = 1_000

function menuTreeItemSchemaAtDepth(depth: number): z.ZodType<MenuTreeReorderInput> {
  const children = depth >= MAX_MENU_DEPTH
    ? z.array(z.never()).max(0)
    : z.array(menuTreeItemSchemaAtDepth(depth + 1)).max(MAX_MENU_CHILDREN)

  return z.object({
    id: z.string().regex(ulidRegex, "Menu item ID must be a valid ULID"),
    parentId: z.string().regex(ulidRegex, "Parent ID must be a valid ULID").nullable(),
    position: z.number().int().min(0, "Position must be a non-negative integer"),
    children,
  }) as z.ZodType<MenuTreeReorderInput>
}

const menuTreeItemSchema = menuTreeItemSchemaAtDepth(0)

export const reorderMenusSchema = z.object({
  type: menuTypeEnum,
  tree: z.array(menuTreeItemSchema).max(MAX_MENU_CHILDREN, "Too many top-level menu items"),
}).superRefine((value, context) => {
  let count = 0
  const visit = (nodes: MenuTreeReorderInput[]): boolean => {
    for (const node of nodes) {
      count += 1
      if (count > MAX_MENU_NODES) return true
      if (visit(node.children)) return true
    }
    return false
  }

  if (visit(value.tree)) {
    context.addIssue({ code: "custom", message: `At most ${MAX_MENU_NODES} menu items may be reordered.` })
  }
})

// Inferred types
export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
export type ReorderMenusInput = z.infer<typeof reorderMenusSchema>
