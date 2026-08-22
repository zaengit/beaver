"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type SyntheticEvent,
} from "react"

type FormStatus = { kind: "idle" | "success" | "error"; message?: string }

type TurnstileOptions = {
  sitekey: string
  action?: string
  theme?: "light" | "dark" | "auto"
  callback?: (token: string) => void
  "error-callback"?: (errorCode: string) => void
  "expired-callback"?: () => void
  "refresh-expired"?: "auto" | "manual" | "never"
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type TurnstileWidgetHandle = { reset: () => void }
type TurnstileWidgetProps = {
  onToken: (token: string) => void
  onError: (message: string) => void
}

const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || ""
let turnstileScriptPromise: Promise<void> | null = null

function loadTurnstileScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Turnstile is only available in the browser."))
  if (window.turnstile) return Promise.resolve()
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-turnstile-script]")
    const script = existingScript || document.createElement("script")
    const handleLoad = () => resolve()
    const handleError = () => {
      turnstileScriptPromise = null
      reject(new Error("Security verification could not be loaded."))
    }

    script.addEventListener("load", handleLoad, { once: true })
    script.addEventListener("error", handleError, { once: true })
    if (!existingScript) {
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.dataset.turnstileScript = "true"
      document.head.appendChild(script)
    }
  })

  return turnstileScriptPromise
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(function TurnstileWidget({ onToken, onError }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const onErrorRef = useRef(onError)
  onTokenRef.current = onToken
  onErrorRef.current = onError

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current)
      onTokenRef.current("")
    },
  }), [])

  useEffect(() => {
    if (!turnstileSiteKey) return
    let mounted = true

    void loadTurnstileScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: turnstileSiteKey,
          action: "contact",
          theme: "light",
          "refresh-expired": "auto",
          callback: (token) => onTokenRef.current(token),
          "error-callback": () => {
            onTokenRef.current("")
            onErrorRef.current("Security verification failed. Please try again.")
          },
          "expired-callback": () => {
            onTokenRef.current("")
            onErrorRef.current("Security verification expired. Please try again.")
          },
        })
      })
      .catch((error: unknown) => {
        if (mounted) onErrorRef.current(error instanceof Error ? error.message : "Security verification could not be loaded.")
      })

    return () => {
      mounted = false
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  if (!turnstileSiteKey) return null
  return <div ref={containerRef} className="mt-5 min-h-[65px]" aria-label="Security verification" />
})

export function InquiryForm({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  const isDark = theme === "dark"

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const formToken = values.get("cf-turnstile-response")
    const token = turnstileToken || (typeof formToken === "string" ? formToken : "")
    if (turnstileSiteKey && !token) {
      setStatus({ kind: "error", message: "Please complete the security verification." })
      return
    }
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
          turnstileToken: token || undefined,
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
      if (turnstileSiteKey) {
        turnstileRef.current?.reset()
        setTurnstileToken("")
      }
    }
  }

  const label = `grid gap-2 text-[11px] font-bold tracking-[0.01em] ${isDark ? "text-slate-800" : "text-slate-700"}`
  const input = "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/80 backdrop-blur sm:p-8" noValidate>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">Let’s talk</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">A better way starts here.</h3>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-lg text-indigo-600" aria-hidden="true">↗</span>
      </div>
      <div className="grid gap-4">
        <label className={label}>
          <span>Name <span className="text-indigo-600">*</span></span>
          <input required name="name" autoComplete="name" placeholder="Maya Chen" className={input} />
        </label>
        <label className={label}>
          <span>Work email <span className="text-indigo-600">*</span></span>
          <input required name="email" type="email" autoComplete="email" placeholder="maya@company.com" className={input} />
        </label>
        <label className={label}>
          <span>Subject</span>
          <input name="subject" maxLength={200} placeholder="Tell us a little about your team" className={input} />
        </label>
        <label className={label}>
          <span>Message <span className="text-indigo-600">*</span></span>
          <textarea required name="message" rows={4} maxLength={5000} placeholder="We’re looking for a calmer way to plan and ship…" className={`${input} resize-y`} />
        </label>
      </div>
      <TurnstileWidget
        ref={turnstileRef}
        onToken={setTurnstileToken}
        onError={(message) => {
          setTurnstileToken("")
          setStatus({ kind: "error", message })
        }}
      />
      <div className="mt-6">
        <button
          disabled={isSubmitting}
          type="submit"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-[#1769f5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : "Talk to sales"}
          {!isSubmitting && <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>}
        </button>
        {status.kind !== "idle" && (
          <div
            role="status"
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${
              status.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-slate-500">
          By submitting, you agree to our privacy policy. We’ll only use your details to reply to you.
        </p>
      </div>
    </form>
  )
}
