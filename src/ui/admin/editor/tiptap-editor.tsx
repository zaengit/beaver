
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { common, createLowlight } from "lowlight"

import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import { TiptapToolbar } from "./tiptap-toolbar"
import { TiptapBubbleMenu } from "./tiptap-bubble-menu"
import { TiptapFloatingMenu } from "./tiptap-floating-menu"
import { CodeBlockView } from "./tiptap-code-block"

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

// ─── Props ───────────────────────────────────────────────────────────────────

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Using CodeBlockLowlight instead
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-sm max-w-full h-auto",
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-sm",
        },
        inline: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-2 min-w-[100px]",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-bold min-w-[100px]",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "list-none pl-0",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-sm bg-muted p-4 font-mono text-sm overflow-x-auto",
        },
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockView)
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none",
          "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_hr]:border-border [&_hr]:my-4",
          "[&_table]:border-collapse [&_table]:w-full",
          "[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-bold",
          "[&_td]:border [&_td]:border-border [&_td]:p-2",
          "[&_img]:rounded-sm [&_img]:max-w-full [&_img]:h-auto",
          "[&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-primary/50 [&_.ProseMirror-selectednode]:rounded-sm",
        ),
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return (
      <div className={cn("rounded-sm border", className)}>
        <div className="h-10 border-b bg-muted/30 animate-pulse" />
        <div className="min-h-[200px] p-4">
          <div className="h-4 w-3/4 bg-muted/30 rounded-sm animate-pulse" />
        </div>
      </div>
    )
  }

  const characters = editor.storage.characterCount.characters()
  const words = editor.storage.characterCount.words()

  return (
    <div className={cn("rounded-sm border", className)}>
      {/* Toolbar */}
      <TiptapToolbar editor={editor} />

      {/* Bubble Menu */}
      <TiptapBubbleMenu editor={editor} />

      {/* Floating Menu */}
      <TiptapFloatingMenu editor={editor} />

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Character & Word Count */}
      <div className="flex items-center justify-end gap-3 border-t px-3 py-1.5 text-xs text-muted-foreground">
        <span>{characters} characters</span>
        <span>{words} words</span>
      </div>
    </div>
  )
}
