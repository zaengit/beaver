import { describe, it, expect } from "vitest"
import { sanitizeHtml } from "./sanitize"

describe("sanitizeHtml", () => {
  it("returns empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("")
    expect(sanitizeHtml(null as unknown as string)).toBe("")
    expect(sanitizeHtml(undefined as unknown as string)).toBe("")
  })

  it("preserves safe HTML content", () => {
    const html = "<p>Hello <strong>world</strong></p>"
    expect(sanitizeHtml(html)).toBe(html)
  })

  it("preserves headings, lists, and formatting", () => {
    const html = "<h1>Title</h1><ul><li>Item 1</li></ul><em>italic</em>"
    expect(sanitizeHtml(html)).toBe(html)
  })

  it("removes script tags and their content", () => {
    const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>'
    expect(sanitizeHtml(html)).toBe("<p>Hello</p><p>World</p>")
  })

  it("removes script tags with attributes", () => {
    const html = '<script type="text/javascript">document.cookie</script>'
    expect(sanitizeHtml(html)).toBe("")
  })

  it("removes event handler attributes", () => {
    const html = '<img src="image.jpg" onerror="alert(1)" />'
    expect(sanitizeHtml(html)).toBe('<img src="image.jpg" />')
  })

  it("removes onclick handlers", () => {
    const html = '<button onclick="stealData()">Click</button>'
    expect(sanitizeHtml(html)).toBe("<button>Click</button>")
  })

  it("removes onload handlers", () => {
    const html = '<body onload="malicious()">'
    expect(sanitizeHtml(html)).toBe("")
  })

  it("removes javascript: URLs in href", () => {
    const html = '<a href="javascript:alert(1)">Click</a>'
    expect(sanitizeHtml(html)).toBe("<a>Click</a>")
  })

  it("removes javascript: URLs in src", () => {
    const html = '<iframe src="javascript:alert(1)"></iframe>'
    expect(sanitizeHtml(html)).toBe("")
  })

  it("removes data: URLs in src attributes", () => {
    const html = '<img src="data:text/html,<script>alert(1)</script>" />'
    expect(sanitizeHtml(html)).toBe("<img />")
  })

  it("removes object tags", () => {
    const html = '<object data="malicious.swf"></object>'
    expect(sanitizeHtml(html)).toBe("")
  })

  it("removes embed tags", () => {
    const html = '<embed src="malicious.swf" />'
    expect(sanitizeHtml(html)).toBe("")
  })

  it("removes applet tags", () => {
    const html = "<applet code=\"Malicious.class\"></applet>"
    expect(sanitizeHtml(html)).toBe("")
  })

  it("keeps trusted YouTube iframes", () => {
    const html = '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315"></iframe>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it("keeps trusted Vimeo iframes", () => {
    const html = '<iframe src="https://player.vimeo.com/video/123456"></iframe>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it("removes untrusted iframes", () => {
    const html = '<iframe src="https://evil.com/phishing"></iframe>'
    expect(sanitizeHtml(html)).toBe("")
  })

  it("removes iframes without src", () => {
    const html = "<iframe></iframe>"
    expect(sanitizeHtml(html)).toBe("")
  })

  it("removes entity-encoded javascript URLs", () => {
    expect(sanitizeHtml('<a href="&#x6a;avascript:alert(1)">Click</a>')).toBe("<a>Click</a>")
  })

  it("handles multiple dangerous elements in one string", () => {
    const html = '<p>Safe</p><script>bad()</script><img onerror="x" src="ok.jpg" /><a href="javascript:void(0)">link</a>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain("<script")
    expect(result).not.toContain("onerror")
    expect(result).not.toContain("javascript:")
    expect(result).toContain("<p>Safe</p>")
    expect(result).toContain("ok.jpg")
  })
})
