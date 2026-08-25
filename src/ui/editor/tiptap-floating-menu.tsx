
import { FloatingMenu } from "@tiptap/react/menus"
import type { Editor } from "@tiptap/react"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ImageIcon,
  Quote,
  Code2,
} from "lucide-react"

import { Button } from "@zbeaver/beaver/ui/components/ui/button"

// ─── Props ───────────────────────────────────────────────────────────────────

interface TiptapFloatingMenuProps {
  editor: Editor
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TiptapFloatingMenu({ editor }: TiptapFloatingMenuProps) {
  function handleImage() {
    const url = window.prompt("Enter image URL:", "https://")
    if (!url) return

    const alt = window.prompt("Enter alt text:", "") || ""
    editor.chain().focus().setImage({ src: url, alt }).run()
  }

  return (
    <FloatingMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-sm border bg-background p-1 shadow-md"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        aria-label="Heading 1"
        title="Heading 1"
      >
        <Heading1 className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        aria-label="Heading 2"
        title="Heading 2"
      >
        <Heading2 className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        aria-label="Heading 3"
        title="Heading 3"
      >
        <Heading3 className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet List"
        title="Bullet List"
      >
        <List className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered List"
        title="Ordered List"
      >
        <ListOrdered className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleImage}
        aria-label="Insert Image"
        title="Insert Image"
      >
        <ImageIcon className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
        title="Blockquote"
      >
        <Quote className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code Block"
        title="Code Block"
      >
        <Code2 className="size-4" />
      </Button>
    </FloatingMenu>
  )
}
