"use client"

import { useState, type FormEvent } from "react"

type FormStatus = { kind: "idle" | "success" | "error"; message?: string }

export function SaasContactForm({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setIsSubmitting(true)
    setStatus({ kind: "idle" })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          subject: values.get("subject"),
          message: values.get("message"),
        }),
      })
      const result = await response.json().catch(() => null) as { message?: string } | null
      if (!response.ok) throw new Error(result?.message || "We could not send your message. Please try again.")
      form.reset()
      setStatus({ kind: "success", message: result?.message || "Thanks — we’ll be in touch shortly." })
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "We could not send your message. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const label = "grid gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]"
  const input = "w-full border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-3 text-[14px] font-medium text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:bg-[var(--bg)]"

  return (
    <form onSubmit={submit} className="border border-[var(--line-strong)] bg-[var(--bg)] p-6 sm:p-7" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          <span>Name <span className="text-[var(--ink)]">*</span></span>
          <input required name="name" autoComplete="name" placeholder="Maya Chen" className={input} />
        </label>
        <label className={label}>
          <span>Work email <span className="text-[var(--ink)]">*</span></span>
          <input required name="email" type="email" autoComplete="email" placeholder="maya@company.com" className={input} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span>Subject</span>
          <input name="subject" maxLength={200} placeholder="Tell us a little about your team" className={input} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span>Message <span className="text-[var(--ink)]">*</span></span>
          <textarea required name="message" rows={4} maxLength={5000} placeholder="We’re looking for a calmer way to plan and ship…" className={`${input} resize-y`} />
        </label>
      </div>
      <div className="mt-6">
        <button
          disabled={isSubmitting}
          type="submit"
          className="inline-flex w-full items-center justify-center border border-[var(--line-strong)] bg-[var(--ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : "Talk to sales →"}
        </button>
        {status.kind !== "idle" && (
          <div
            role="status"
            className={`mt-4 border px-4 py-3 text-[13px] font-semibold leading-6 ${
              status.kind === "success"
                ? "border-[var(--line-strong)] bg-[var(--paper)] text-[var(--ink)]"
                : "border-red-800 bg-red-50 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}
        <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">
          By submitting, you agree to our privacy policy. We’ll only use your details to reply to you.
        </p>
      </div>
    </form>
  )
}
