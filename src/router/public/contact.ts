import nodemailer from "nodemailer"
import { z } from "zod"

import { getSiteSettings } from "@zaenpm/beaver/app/public/site"
import type { AdminRoute } from "@zaenpm/beaver/router/route"
import { clientAddress, isWithinRateLimit } from "@zaenpm/beaver/router/security"

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5000),
  turnstileToken: z.string().trim().min(1).max(2048).optional(),
})

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!)
}

async function verifyTurnstile(token: string | undefined, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return process.env.CONTACT_TURNSTILE_REQUIRED === "true" ? "Turnstile is not configured." : null
  if (!token) return "Turnstile verification is required."

  try {
    const body = new URLSearchParams({ secret, response: token })
    const remoteIp = clientAddress(request)
    if (remoteIp !== "unknown") body.set("remoteip", remoteIp)
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    })
    const result = await response.json() as { success?: boolean }
    return result.success === true ? null : "Turnstile verification failed."
  } catch {
    return "Turnstile verification is unavailable."
  }
}

export const POST: AdminRoute = async ({ request }) => {
  const client = clientAddress(request)
  if (!isWithinRateLimit(`contact:${client}`, 5, 15 * 60 * 1000)) {
    return Response.json({ success: false, message: "Too many requests. Please try again later." }, { status: 429 })
  }

  const parsed = contactSchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ success: false, message: "Please complete all required fields." }, { status: 422 })

  const turnstileError = await verifyTurnstile(parsed.data.turnstileToken, request)
  if (turnstileError) {
    return Response.json({ success: false, message: turnstileError }, { status: process.env.CONTACT_TURNSTILE_REQUIRED === "true" && !process.env.TURNSTILE_SECRET_KEY ? 503 : 403 })
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  const from = process.env.SMTP_FROM
  const recipients = getSiteSettings().email_notifications
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from || recipients.length === 0 || Boolean(user) !== Boolean(password)) {
    return Response.json({ success: false, message: "Contact email is not configured." }, { status: 503 })
  }

  const { name, email, subject, message } = parsed.data
  try {
    await nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE === "true", auth: user && password ? { user, pass: password } : undefined }).sendMail({
      to: recipients,
      from,
      replyTo: email,
      subject: `[Contact] ${subject || "New message"}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "-"}\n\n${message}`,
      html: `<h1>New contact message</h1><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Subject:</strong> ${escapeHtml(subject || "-")}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    })
  } catch (error) {
    console.error("Contact email delivery failed", error)
    return Response.json({ success: false, message: "Unable to send your message. Please try again." }, { status: 502 })
  }

  return Response.json({ success: true, message: "Message sent." }, { status: 201 })
}
