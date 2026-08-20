
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zbeaver/beaver/ui/admin/components/ui/select"

// ─── Language List ───────────────────────────────────────────────────────────

// Common languages registered via lowlight's `common` bundle
const LANGUAGES = [
  { value: "auto", label: "Auto" },
  { value: "bash", label: "Bash" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "diff", label: "Diff" },
  { value: "go", label: "Go" },
  { value: "graphql", label: "GraphQL" },
  { value: "ini", label: "INI" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "kotlin", label: "Kotlin" },
  { value: "less", label: "Less" },
  { value: "lua", label: "Lua" },
  { value: "makefile", label: "Makefile" },
  { value: "markdown", label: "Markdown" },
  { value: "objectivec", label: "Objective-C" },
  { value: "perl", label: "Perl" },
  { value: "php", label: "PHP" },
  { value: "plaintext", label: "Plain Text" },
  { value: "python", label: "Python" },
  { value: "r", label: "R" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "scss", label: "SCSS" },
  { value: "shell", label: "Shell" },
  { value: "sql", label: "SQL" },
  { value: "swift", label: "Swift" },
  { value: "typescript", label: "TypeScript" },
  { value: "vbnet", label: "VB.NET" },
  { value: "wasm", label: "WebAssembly" },
  { value: "xml", label: "XML/HTML" },
  { value: "yaml", label: "YAML" },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function CodeBlockView({
  node,
  updateAttributes,
  extension,
}: ReactNodeViewProps) {
  const language = (node.attrs.language as string) || ""

  return (
    <NodeViewWrapper className="relative rounded-sm bg-muted my-2">
      {/* Language Selector */}
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <Select
          value={language || "auto"}
          onValueChange={(val) => updateAttributes({ language: val === "auto" ? "" : val })}
        >
          <SelectTrigger size="sm" className="h-6 w-auto min-w-[100px] border-none bg-transparent text-xs text-muted-foreground shadow-none">
            <SelectValue placeholder="Auto" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start">
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Code Content */}
      <pre className="p-4 font-mono text-sm overflow-x-auto !mt-0 !rounded-sm">
        <NodeViewContent className="hljs" />
      </pre>
    </NodeViewWrapper>
  )
}
