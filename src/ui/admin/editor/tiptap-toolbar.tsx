
import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  Quote,
  Code2,
  List,
  ListOrdered,
  ListChecks,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  ImageIcon,
  Video,
  TableIcon,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  Merge,
  SplitSquareHorizontal,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react"

import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import { Toggle } from "@zbeaver/beaver/ui/admin/components/ui/toggle"
import { Separator } from "@zbeaver/beaver/ui/admin/components/ui/separator"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@zbeaver/beaver/ui/admin/components/ui/dropdown-menu"
import { MediaPicker, type MediaPickerMedia } from "@zbeaver/beaver/ui/admin/shared/media-picker"

// ─── Props ───────────────────────────────────────────────────────────────────

interface TiptapToolbarProps {
  editor: Editor
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  // ─── Link Handler ────────────────────────────────────────────────────────

  function handleLink() {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter URL:", previousUrl || "https://")

    if (url === null) return // cancelled

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

  // ─── Image Handler ───────────────────────────────────────────────────────

  function handleImageSelect(media: MediaPickerMedia | null) {
    if (!media) return

    const attrs: { src: string; alt?: string } = {
      src: media.url,
      alt: media.alt || media.name,
    }

    editor.chain().focus().setImage(attrs).run()
  }

  // ─── YouTube Handler ─────────────────────────────────────────────────────

  function handleYoutube() {
    const url = window.prompt("Enter YouTube URL:", "https://www.youtube.com/watch?v=")

    if (!url) return

    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  // ─── Table Handler ───────────────────────────────────────────────────────

  function handleInsertTable() {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5">
      {/* ─── Text Formatting (always visible) ─────────────────────── */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        aria-label="Bold"
        title="Bold"
      >
        <Bold className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        aria-label="Italic"
        title="Italic"
      >
        <Italic className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        aria-label="Underline"
        title="Underline"
      >
        <Underline className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("highlight")}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        disabled={!editor.can().chain().focus().toggleHighlight().run()}
        aria-label="Highlight"
        title="Highlight"
      >
        <Highlighter className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* ─── Headings (hidden on small screens) ───────────────────── */}
      <div className="hidden md:flex items-center gap-0.5">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Heading 1"
          title="Heading 1"
        >
          <Heading1 className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading 2"
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          aria-label="Heading 3"
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 4 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          aria-label="Heading 4"
          title="Heading 4"
        >
          <Heading4 className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("paragraph")}
          onPressedChange={() => editor.chain().focus().setParagraph().run()}
          aria-label="Paragraph"
          title="Paragraph"
        >
          <Pilcrow className="size-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />
      </div>

      {/* ─── Block Types (hidden on small screens) ────────────────── */}
      <div className="hidden md:flex items-center gap-0.5">
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          aria-label="Blockquote"
          title="Blockquote"
        >
          <Quote className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("codeBlock")}
          onPressedChange={() =>
            editor.chain().focus().toggleCodeBlock().run()
          }
          aria-label="Code Block"
          title="Code Block"
        >
          <Code2 className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          aria-label="Bullet List"
          title="Bullet List"
        >
          <List className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          aria-label="Ordered List"
          title="Ordered List"
        >
          <ListOrdered className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("taskList")}
          onPressedChange={() =>
            editor.chain().focus().toggleTaskList().run()
          }
          aria-label="Task List"
          title="Task List"
        >
          <ListChecks className="size-4" />
        </Toggle>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          aria-label="Horizontal Rule"
          title="Horizontal Rule"
        >
          <Minus className="size-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />
      </div>

      {/* ─── Text Alignment (hidden on small screens) ─────────────── */}
      <div className="hidden md:flex items-center gap-0.5">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "left" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          aria-label="Align Left"
          title="Align Left"
        >
          <AlignLeft className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "center" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
          aria-label="Align Center"
          title="Align Center"
        >
          <AlignCenter className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "right" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
          aria-label="Align Right"
          title="Align Right"
        >
          <AlignRight className="size-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "justify" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("justify").run()
          }
          aria-label="Justify"
          title="Justify"
        >
          <AlignJustify className="size-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />
      </div>

      {/* ─── Media & Embeds (hidden on small screens) ─────────────── */}
      <div className="hidden md:flex items-center gap-0.5">
        <Toggle
          size="sm"
          pressed={editor.isActive("link")}
          onPressedChange={handleLink}
          aria-label="Link"
          title="Link"
        >
          <Link2 className="size-4" />
        </Toggle>

        <MediaPicker
          value={null}
          onChange={handleImageSelect}
          accept="image/*"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Insert Image"
              title="Insert Image"
            >
              <ImageIcon className="size-4" />
            </Button>
          }
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleYoutube}
          aria-label="YouTube Video"
          title="YouTube Video"
        >
          <Video className="size-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />
      </div>

      {/* ─── Table Controls (hidden on small screens) ─────────────── */}
      <div className="hidden md:flex items-center gap-0.5">
        {editor.isActive("table") ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1 text-xs font-medium",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
            >
              <TableIcon className="size-4" />
              Table
              <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4}>
              <DropdownMenuLabel>Rows</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowBefore().run()}
              >
                <Plus className="size-4" />
                Add Row Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <Plus className="size-4" />
                Add Row After
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                <Trash2 className="size-4" />
                Delete Row
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnBefore().run()}
              >
                <Plus className="size-4" />
                Add Column Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <Plus className="size-4" />
                Add Column After
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                <Trash2 className="size-4" />
                Delete Column
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Cells</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
              >
                <Merge className="size-4" />
                Merge Cells
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
              >
                <SplitSquareHorizontal className="size-4" />
                Split Cell
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 className="size-4" />
                Delete Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleInsertTable}
            aria-label="Insert Table"
            title="Insert Table"
          >
            <TableIcon className="size-4" />
          </Button>
        )}

        <Separator orientation="vertical" className="mx-1 h-6" />
      </div>

      {/* ─── Overflow Menu (visible only on small screens) ────────── */}
      <div className="flex md:hidden items-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex items-center justify-center rounded-sm h-7 w-7",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            )}
            aria-label="More formatting options"
            title="More formatting options"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={4}>
            {/* Headings */}
            <DropdownMenuLabel>Headings</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="size-4" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="size-4" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="size-4" />
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            >
              <Heading4 className="size-4" />
              Heading 4
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              <Pilcrow className="size-4" />
              Paragraph
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Block Types */}
            <DropdownMenuLabel>Blocks</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="size-4" />
              Blockquote
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code2 className="size-4" />
              Code Block
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-4" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="size-4" />
              Ordered List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <ListChecks className="size-4" />
              Task List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <Minus className="size-4" />
              Horizontal Rule
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Alignment */}
            <DropdownMenuLabel>Alignment</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="size-4" />
              Align Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="size-4" />
              Align Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="size-4" />
              Align Right
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            >
              <AlignJustify className="size-4" />
              Justify
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Media & Embeds */}
            <DropdownMenuLabel>Media</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleLink}>
              <Link2 className="size-4" />
              Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const url = window.prompt("Enter image URL:", "https://")
              if (!url) return
              const alt = window.prompt("Enter alt text:", "") || ""
              editor.chain().focus().setImage({ src: url, alt }).run()
            }}>
              <ImageIcon className="size-4" />
              Insert Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleYoutube}>
              <Video className="size-4" />
              YouTube Video
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Table */}
            <DropdownMenuLabel>Table</DropdownMenuLabel>
            {editor.isActive("table") ? (
              <>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                >
                  <Plus className="size-4" />
                  Add Row Before
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  <Plus className="size-4" />
                  Add Row After
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  <Trash2 className="size-4" />
                  Delete Row
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                >
                  <Plus className="size-4" />
                  Add Column Before
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  <Plus className="size-4" />
                  Add Column After
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  <Trash2 className="size-4" />
                  Delete Column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().mergeCells().run()}
                  disabled={!editor.can().mergeCells()}
                >
                  <Merge className="size-4" />
                  Merge Cells
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().splitCell().run()}
                  disabled={!editor.can().splitCell()}
                >
                  <SplitSquareHorizontal className="size-4" />
                  Split Cell
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  <Trash2 className="size-4" />
                  Delete Table
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={handleInsertTable}>
                <TableIcon className="size-4" />
                Insert Table
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />
      </div>

      {/* ─── History (always visible) ─────────────────────────────── */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 className="size-4" />
      </Button>
    </div>
  )
}
