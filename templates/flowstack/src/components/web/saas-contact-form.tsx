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

  return (
    <form onSubmit={submit} className={`mt-10 grid gap-5 text-left sm:grid-cols-2 rounded-[28px] p-6 sm:p-8 border shadow-sm backdrop-blur-md ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-100/80 border-slate-200/80"}`} noValidate>
      <label className={`grid gap-2 text-sm font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
        <span>Name <span className="text-indigo-600">*</span></span>
        <input
          required
          name="name"
          autoComplete="name"
          placeholder="Maya Chen"
          className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-xs ${theme === "dark" ? "border-white/15 bg-white/8 text-white placeholder:text-slate-500" : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"}`}
        />
      </label>
      <label className={`grid gap-2 text-sm font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
        <span>Work email <span className="text-indigo-600">*</span></span>
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@company.com"
          className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-xs ${theme === "dark" ? "border-white/15 bg-white/8 text-white placeholder:text-slate-500" : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"}`}
        />
      </label>
      <label className={`grid gap-2 text-sm font-bold sm:col-span-2 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
        <span>Subject</span>
        <input
          name="subject"
          maxLength={200}
          placeholder="Tell us a little about your team"
          className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-xs ${theme === "dark" ? "border-white/15 bg-white/8 text-white placeholder:text-slate-500" : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"}`}
        />
      </label>
      <label className={`grid gap-2 text-sm font-bold sm:col-span-2 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
        <span>Message <span className="text-indigo-600">*</span></span>
        <textarea
          required
          name="message"
          rows={4}
          maxLength={5000}
          placeholder="We’re looking for a calmer way to plan and ship…"
          className={`w-full resize-y rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-xs ${theme === "dark" ? "border-white/15 bg-white/8 text-white placeholder:text-slate-500" : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"}`}
        />
      </label>
      <div className="sm:col-span-2">
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Sending…</span>
            </>
          ) : (
            <>
              <span>Talk to sales</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
        {status.kind !== "idle" && (
          <div
            role="status"
            className={`mt-4 rounded-full px-5 py-3 text-sm font-semibold text-center flex items-center justify-center gap-2 ${
              status.kind === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {status.kind === "success" ? (
              <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span>{status.message}</span>
          </div>
        )}
        <p className="mt-3 text-center text-xs leading-5 text-slate-500 font-medium">
          By submitting, you agree to our privacy policy. We’ll only use your details to reply to you.
        </p>
      </div>
    </form>
  )
}
