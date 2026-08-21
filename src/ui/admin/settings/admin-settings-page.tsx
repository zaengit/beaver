
import { useEffect, useState } from "react"
import { Save, Plus, Trash2 } from "lucide-react"

import { adminApiGet, adminApiPut } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { adminToast } from "@zbeaver/beaver/ui/admin/shared/admin-toast"
import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSectionCard,
} from "@zbeaver/beaver/ui/admin/layout/admin-page-shell"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zbeaver/beaver/ui/admin/components/ui/textarea"
import { Checkbox } from "@zbeaver/beaver/ui/admin/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@zbeaver/beaver/ui/admin/components/ui/select"
import { MediaPicker } from "@zbeaver/beaver/ui/admin/shared/media-picker"
import { safeAdminImageUrl } from "@zbeaver/beaver/ui/admin/shared/media-url"
import type { SiteSettings, SocialLink, OpenHours } from "@zbeaver/beaver/app/models/setting"

const TIMEZONES = Intl.supportedValuesOf?.("timeZone") ?? [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Jakarta",
  "Australia/Sydney",
  "Pacific/Auckland",
]

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Twitter / X",
  "Instagram",
  "LinkedIn",
  "YouTube",
  "TikTok",
  "GitHub",
  "Discord",
  "Telegram",
  "WhatsApp",
  "Custom",
] as const

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const TRANSLATE_COUNTRIES = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "ca", name: "Catalan" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "et", name: "Estonian" },
  { code: "tl", name: "Filipino" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "kn", name: "Kannada" },
  { code: "ko", name: "Korean" },
  { code: "la", name: "Latin" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "mk", name: "Macedonian" },
  { code: "ms", name: "Malay" },
  { code: "mt", name: "Maltese" },
  { code: "no", name: "Norwegian" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sr", name: "Serbian" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "es", name: "Spanish" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "yi", name: "Yiddish" },
]

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadSettings() {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApiGet<SiteSettings>("/api/admin/settings")
      setSettings(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  function updateField<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  // ─── Social Links ──────────────────────────────────────────────────────────

  function addSocialLink() {
    if (!settings) return
    updateField("links", [
      ...settings.links,
      { platform: "", url: "https://", icon: "" },
    ])
  }

  function updateSocialLink(index: number, field: keyof SocialLink, value: string) {
    if (!settings) return
    const updated = settings.links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    )
    updateField("links", updated)
  }

  function removeSocialLink(index: number) {
    if (!settings) return
    const updated = settings.links.filter((_, i) => i !== index)
    updateField("links", updated)
  }

  // ─── Open Hours ───────────────────────────────────────────────────────────

  function addOpenHours() {
    if (!settings) return
    updateField("open_hours", [
      ...settings.open_hours,
      { day: "Monday", open: "08:00", close: "17:00" },
    ])
  }

  function updateOpenHour(index: number, field: keyof OpenHours, value: string) {
    if (!settings) return
    const updated = settings.open_hours.map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    )
    updateField("open_hours", updated)
  }

  function removeOpenHour(index: number) {
    if (!settings) return
    const updated = settings.open_hours.filter((_, i) => i !== index)
    updateField("open_hours", updated)
  }

  // ─── Translate Countries ─────────────────────────────────────────────────

  function toggleTranslateCountry(code: string) {
    if (!settings) return
    const current = settings.translate_countries
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code]
    updateField("translate_countries", updated)
  }

  // ─── Save ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: settings.title,
        description: settings.description,
        meta_title: settings.meta_title,
        meta_description: settings.meta_description,
        maintenance_mode: settings.maintenance_mode,
        timezone: settings.timezone,
        logo: settings.logo,
        favicon: settings.favicon,
        links: settings.links,
        open_hours: settings.open_hours,
        custom_css: settings.custom_css,
        custom_javascript: settings.custom_javascript,
        translate_countries: settings.translate_countries,
        email_notifications: settings.email_notifications.join(","),
      }

      const result = await adminApiPut<SiteSettings>("/api/admin/settings", payload)
      if (result.success) {
        setSettings(result.data)
        adminToast.success("update", "settings")
      } else {
        adminToast.error(result.message)
      }
    } catch (e) {
      adminToast.error(e instanceof Error ? e.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (error) return <main className="p-6"><p className="text-destructive">Error: {error}</p></main>
  if (loading || !settings) return <AdminLoadingState />

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Settings"
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        }
      />

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]">
        {/* General Settings */}
        <AdminSectionCard
          title="General"
          description="Basic site information"
          className="lg:col-start-1 lg:row-start-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Site Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="My Website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => value && updateField("timezone", value)}>
                <SelectTrigger id="timezone"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>{TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="description">Site Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="A short description of your site"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              id="maintenance_mode"
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) =>
                updateField("maintenance_mode", checked === true)
              }
            />
            <Label htmlFor="maintenance_mode" className="cursor-pointer">
              Maintenance Mode (site shows maintenance page to visitors)
            </Label>
          </div>
        </AdminSectionCard>

        {/* SEO & Meta */}
        <AdminSectionCard
          title="SEO & Meta"
          description="Search engine optimization settings"
          className="lg:col-start-1 lg:row-start-3"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={settings.meta_title}
                onChange={(e) => updateField("meta_title", e.target.value)}
                placeholder="Page title shown in browser tab"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={settings.meta_description}
                onChange={(e) => updateField("meta_description", e.target.value)}
                placeholder="Brief page description for search engines"
                rows={3}
              />
            </div>
          </div>
        </AdminSectionCard>

        {/* Branding */}
        <AdminSectionCard
          title="Branding"
          description="Logo and favicon"
          className="lg:col-start-1 lg:row-start-2"
        >
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex flex-col gap-1.5">
              <Label>Logo</Label>
              <div className="rounded-sm border border-dashed bg-muted/30 p-4">
                <div className="flex items-start gap-4">
                  {settings.logo ? (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted">
                      <img
                        src={safeAdminImageUrl(settings.logo) ?? undefined}
                        alt="Logo preview"
                        className="object-contain h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground">
                      No logo
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <MediaPicker
                      key={settings.logo || "logo-empty"}
                      value={settings.logo || null}
                      onChange={(media) => {
                        updateField("logo", media ? media.url : "")
                      }}
                      accept="image/*"
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose a logo from the media library. Recommended: PNG or SVG.
                    </p>
                    {settings.logo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label="Remove logo"
                        className="w-fit text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => updateField("logo", "")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className="flex flex-col gap-1.5">
              <Label>Favicon</Label>
              <div className="rounded-sm border border-dashed bg-muted/30 p-4">
                <div className="flex items-start gap-4">
                  {settings.favicon ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted">
                      <img
                        src={safeAdminImageUrl(settings.favicon) ?? undefined}
                        alt="Favicon preview"
                        className="object-contain h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground">
                      No icon
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <MediaPicker
                      key={settings.favicon || "favicon-empty"}
                      value={settings.favicon || null}
                      onChange={(media) => {
                        updateField("favicon", media ? media.url : "")
                      }}
                      accept="image/*"
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose a favicon from the media library. Recommended: ICO or PNG (32x32).
                    </p>
                    {settings.favicon && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label="Remove favicon"
                        className="w-fit text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => updateField("favicon", "")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminSectionCard>

        {/* Social Media Links */}
        <AdminSectionCard
          title="Social Media Links"
          description="Links displayed in the footer or sidebar"
          className="lg:col-span-2 lg:row-start-4"
        >
          <div className="space-y-3">
            {settings.links.length === 0 && (
              <p className="text-sm text-muted-foreground">No social media links added yet.</p>
            )}
            {settings.links.map((link, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-sm bg-muted/30">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Platform</Label>
                    <Select value={link.platform || undefined} onValueChange={(value) => value && updateSocialLink(i, "platform", value)}>
                      <SelectTrigger><SelectValue placeholder="Select platform..." /></SelectTrigger>
                      <SelectContent>{SOCIAL_PLATFORMS.map((platform) => <SelectItem key={platform} value={platform}>{platform}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Icon Class (optional)</Label>
                    <Input
                      value={link.icon ?? ""}
                      onChange={(e) => updateSocialLink(i, "icon", e.target.value)}
                      placeholder="e.g. icon-facebook"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSocialLink(i)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSocialLink}>
              <Plus className="size-3" /> Add Social Link
            </Button>
          </div>
        </AdminSectionCard>

        {/* Open Hours */}
        <AdminSectionCard
          title="Open Hours"
          description="Business or office operating hours"
          className="lg:col-span-2 lg:row-start-5"
        >
          <div className="space-y-3">
            {settings.open_hours.length === 0 && (
              <p className="text-sm text-muted-foreground">No open hours added yet.</p>
            )}
            {settings.open_hours.map((hour, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border rounded-sm bg-muted/30"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Day</Label>
                    <Select value={hour.day} onValueChange={(value) => value && updateOpenHour(i, "day", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DAYS.map((day) => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Open Time</Label>
                    <Input
                      type="time"
                      value={hour.open}
                      onChange={(e) => updateOpenHour(i, "open", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Close Time</Label>
                    <Input
                      type="time"
                      value={hour.close}
                      onChange={(e) => updateOpenHour(i, "close", e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOpenHour(i)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOpenHours}>
              <Plus className="size-3" /> Add Hours
            </Button>
          </div>
        </AdminSectionCard>

        {/* Email Notifications */}
        <AdminSectionCard
          title="Email Notifications"
          description="Email addresses to receive notifications (separate with comma)"
          className="lg:col-start-2 lg:row-start-1"
        >
          <div className="space-y-2">
            <Label htmlFor="email_notifications">Recipient Emails</Label>
            <Input
              id="email_notifications"
              value={settings.email_notifications.join(", ")}
              onChange={(e) => {
                const emails = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                updateField("email_notifications", emails)
              }}
              placeholder="admin@example.com, editor@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple emails with commas.
            </p>
          </div>
        </AdminSectionCard>

        {/* Google Translate */}
        <AdminSectionCard
          title="Google Translate"
          description="Languages available for Google Translate widget"
          className="lg:col-start-2 lg:row-start-2"
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select which languages to include in the Google Translate dropdown. Leave empty to disable.
            </p>
            <div className="max-h-64 overflow-y-auto border rounded-sm p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRANSLATE_COUNTRIES.map((lang) => (
                  <label
                    key={lang.code}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded-sm px-2 py-1"
                  >
                    <Checkbox
                      checked={settings.translate_countries.includes(lang.code)}
                      onCheckedChange={() => toggleTranslateCountry(lang.code)}
                    />
                    {lang.name} ({lang.code})
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.translate_countries.length} language{settings.translate_countries.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        </AdminSectionCard>

        {/* Custom CSS */}
        <AdminSectionCard
          title="Custom CSS"
          description="Custom styles added site-wide"
          className="lg:col-span-2 lg:row-start-6"
        >
          <div className="space-y-2">
            <Label htmlFor="custom_css">CSS Code</Label>
            <Textarea
              id="custom_css"
              value={settings.custom_css}
              onChange={(e) => updateField("custom_css", e.target.value)}
              placeholder="/* Add your custom CSS here */"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </AdminSectionCard>

        {/* Custom JavaScript */}
        <AdminSectionCard
          title="Custom JavaScript"
          description="Custom scripts added before closing body tag"
          className="lg:col-span-2 lg:row-start-7"
        >
          <div className="space-y-2">
            <Label htmlFor="custom_javascript">JavaScript Code</Label>
            <Textarea
              id="custom_javascript"
              value={settings.custom_javascript}
              onChange={(e) => updateField("custom_javascript", e.target.value)}
              placeholder="// Add your custom JavaScript here"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </AdminSectionCard>
      </div>
    </AdminPageShell>
  )
}
