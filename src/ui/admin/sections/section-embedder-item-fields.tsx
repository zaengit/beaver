
import { useEffect, useId, useState } from "react";
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button";
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input";
import { Label } from "@zbeaver/beaver/ui/admin/components/ui/label";
import { Textarea } from "@zbeaver/beaver/ui/admin/components/ui/textarea";
import { Checkbox } from "@zbeaver/beaver/ui/admin/components/ui/checkbox";
import { MediaPicker } from "@zbeaver/beaver/ui/admin/shared/media-picker";
import { safeAdminImageUrl } from "@zbeaver/beaver/ui/admin/shared/media-url";
import {
  ITEM_FIELD_LABELS,
  ITEM_FIELD_PLACEHOLDERS,
  normalizeItemLinks,
} from "./section-embedder-types";

function ItemLinksField({
  value,
  onItemChange,
}: {
  value: unknown;
  onItemChange: (val: unknown) => void;
}) {
  const [links, setLinks] = useState(() => normalizeItemLinks(value));

  useEffect(() => {
    setLinks(normalizeItemLinks(value));
  }, [value]);

  function updateLinks(nextLinks: { label: string; url: string }[]) {
    setLinks(nextLinks);
    onItemChange(nextLinks);
  }

  return (
    <div className="flex flex-col gap-1 sm:col-span-2">
      <Label className="text-xs">Links</Label>
      <div className="space-y-2">
        {links.map((link, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-2"
          >
            <Input
              value={link.label}
              onChange={(event) =>
                updateLinks(
                  links.map((current, currentIndex) =>
                    currentIndex === index
                      ? { ...current, label: event.target.value }
                      : current,
                  ),
                )
              }
              placeholder="Label"
              className="h-8 text-sm"
            />
            <Input
              type="url"
              value={link.url}
              onChange={(event) =>
                updateLinks(
                  links.map((current, currentIndex) =>
                    currentIndex === index
                      ? { ...current, url: event.target.value }
                      : current,
                  ),
                )
              }
              placeholder="https://..."
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ItemFieldRenderer({
  field,
  value,
  onItemChange,
}: {
  field: string;
  value: unknown;
  onItemChange: (val: unknown) => void;
}) {
  const formInquiryId = useId();
  const label = ITEM_FIELD_LABELS[field] || field;
  const strValue = value != null ? String(value) : "";

  if (field === "links")
    return <ItemLinksField value={value} onItemChange={onItemChange} />;

  if (field === "form_inquiry") {
    return (
      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox
          id={formInquiryId}
          checked={value === true}
          onCheckedChange={(checked) => onItemChange(checked === true)}
        />
        <Label htmlFor={formInquiryId} className="cursor-pointer text-xs">Show inquiry form</Label>
      </div>
    );
  }

  if (field === "text" || field === "embed" || field === "answer") {
    return (
      <div className="flex flex-col gap-1 sm:col-span-2">
        <Label className="text-xs">{label}</Label>
        <Textarea
          value={strValue}
          onChange={(event) => onItemChange(event.target.value || null)}
          placeholder={label}
          rows={2}
          className="text-sm"
        />
      </div>
    );
  }

  if (field === "image" || field === "bg_image") {
    const hasValue = Boolean(strValue);
    return (
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center gap-2">
          {hasValue && (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted">
              <img
                src={safeAdminImageUrl(strValue) ?? undefined}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <MediaPicker
            value={hasValue ? strValue : null}
            onChange={(media) => onItemChange(media ? media.url : null)}
            accept="image/*"
          />
          {hasValue && (
            <Button
              type="button"
              variant="outline"
              aria-label={`Remove ${label.toLowerCase()}`}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onItemChange(null)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (field === "bg_color") {
    return (
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={strValue || "#ffffff"}
            onChange={(event) => onItemChange(event.target.value || null)}
            className="h-8 w-8 rounded-sm border p-0.5"
          />
          <Input
            value={strValue}
            onChange={(event) => onItemChange(event.target.value || null)}
            placeholder="#000000"
            className="h-8 flex-1 text-sm"
          />
        </div>
      </div>
    );
  }

  if (field === "style_css_inline") {
    return (
      <div className="flex flex-col gap-1 sm:col-span-2">
        <Label className="text-xs">{label}</Label>
        <Input
          value={strValue}
          onChange={(event) => onItemChange(event.target.value || null)}
          placeholder="color: red; font-size: 14px;"
          className="h-8 text-sm"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs">{label}</Label>
      <Input
        value={strValue}
        onChange={(event) => onItemChange(event.target.value || null)}
        placeholder={ITEM_FIELD_PLACEHOLDERS[field] || label}
        className="h-8 text-sm"
      />
    </div>
  );
}
