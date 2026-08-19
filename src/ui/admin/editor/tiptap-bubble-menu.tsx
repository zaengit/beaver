
import { BubbleMenu } from "@tiptap/react/menus"
import type { Editor } from "@tiptap/react"
import { Bold, Italic, Underline, Link2 } from "lucide-react"

import { Toggle } from "@zaenpm/beaver/ui/admin/components/ui/toggle"

// ─── Props ───────────────────────────────────────────────────────────────────

interface TiptapBubbleMenuProps {
  editor: Editor
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TiptapBubbleMenu({ editor }: TiptapBubbleMenuProps) {
  function handleLink() {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter URL:", previousUrl || "https://")

    if (url === null) return

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run()
  }

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-sm border bg-background p-1 shadow-md"
    >
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="size-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="size-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Underline"
      >
        <Underline className="size-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={handleLink}
        aria-label="Link"
      >
        <Link2 className="size-3.5" />
      </Toggle>
    </BubbleMenu>
  )
}
