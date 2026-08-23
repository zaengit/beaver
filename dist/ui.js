import { jsx as e, jsxs as a, Fragment as Ge } from "react/jsx-runtime";
import * as Ne from "react";
import { createContext as Jn, useContext as Yn, useState as d, useRef as Oe, useCallback as J, useEffect as te, lazy as ce, Suspense as ya, useTransition as wt, forwardRef as Xn, useMemo as Ot, useImperativeHandle as Qn, useId as Zn } from "react";
import { useNavigate as Ze, Routes as es, Route as se, Navigate as st, useParams as qe, useLocation as dt, Outlet as ts, BrowserRouter as as, Link as fe } from "react-router";
import { XIcon as dn, PanelLeftIcon as ns, LayoutDashboard as Na, Image as un, Menu as ss, Users as rs, Shield as is, Globe as ls, CircleDot as ta, Hash as Ma, Settings as os, FolderTree as mn, FileText as Bt, ChevronDown as Ct, UserRound as cs, LogOut as ds, LoaderCircle as us, Loader2Icon as ms, OctagonXIcon as hs, TriangleAlertIcon as gs, InfoIcon as ps, CircleCheckIcon as fs, ArrowRight as bs, Check as Ht, ChevronDownIcon as hn, CheckIcon as vs, ChevronUpIcon as xs, ArrowUp as Ye, ArrowDown as Xe, ArrowUpDown as Qe, Upload as ys, FileIcon as Nt, Loader2 as gn, X as Vt, Search as pn, Trash2 as we, ImageIcon as At, Copy as wa, GripVertical as Gt, ChevronRight as Ns, Pencil as fn, Settings2 as Ca, ChevronUp as bn, Plus as Be, Save as ws, Bold as vn, Italic as xn, Underline as yn, Strikethrough as Cs, Highlighter as ks, Heading1 as oa, Heading2 as ca, Heading3 as da, Heading4 as $a, Pilcrow as Oa, Quote as ua, Code2 as ma, List as ha, ListOrdered as ga, ListChecks as Ba, Minus as ja, AlignLeft as Ua, AlignCenter as Fa, AlignRight as Ha, AlignJustify as Va, Link2 as pa, Video as Ga, TableIcon as aa, Merge as qa, SplitSquareHorizontal as Ka, MoreHorizontal as Ss, Undo2 as Ps, Redo2 as _s } from "lucide-react";
import { Collapsible as ka } from "@base-ui/react/collapsible";
import { useTheme as As } from "next-themes";
import { Toaster as zs, toast as pt } from "sonner";
import { useSensors as Sa, useSensor as jt, PointerSensor as Pa, KeyboardSensor as Is, DndContext as _a, closestCenter as Aa, DragOverlay as Ts } from "@dnd-kit/core";
import { useSortable as qt, sortableKeyboardCoordinates as Ds, arrayMove as yt, SortableContext as Kt, verticalListSortingStrategy as za, rectSortingStrategy as Es } from "@dnd-kit/sortable";
import { CSS as Wt } from "@dnd-kit/utilities";
import { mergeProps as Jt } from "@base-ui/react/merge-props";
import { useRender as Yt } from "@base-ui/react/use-render";
import { cva as zt } from "class-variance-authority";
import { Dialog as ve } from "@base-ui/react/dialog";
import { Tooltip as xt } from "@base-ui/react/tooltip";
import { NodeViewWrapper as Ls, NodeViewContent as Rs, useEditor as Ms, ReactNodeViewRenderer as $s, EditorContent as Os } from "@tiptap/react";
import Bs from "@tiptap/starter-kit";
import js from "@tiptap/extension-underline";
import Us from "@tiptap/extension-highlight";
import Fs from "@tiptap/extension-text-align";
import Hs from "@tiptap/extension-link";
import Vs from "@tiptap/extension-image";
import Gs from "@tiptap/extension-youtube";
import { TableRow as qs, Table as Ks, TableCell as Ws, TableHeader as Js } from "@tiptap/extension-table";
import Ys from "@tiptap/extension-task-list";
import Xs from "@tiptap/extension-task-item";
import Qs from "@tiptap/extension-code-block-lowlight";
import Zs from "@tiptap/extension-placeholder";
import er from "@tiptap/extension-character-count";
import { createLowlight as tr, common as ar } from "lowlight";
import { clsx as nr } from "clsx";
import { twMerge as sr } from "tailwind-merge";
import { Separator as rr } from "@base-ui/react/separator";
import { Button as ir } from "@base-ui/react/button";
import { Menu as nt } from "@base-ui/react/menu";
import { Input as lr } from "@base-ui/react/input";
import { Select as Me } from "@base-ui/react/select";
import { Tabs as Xt } from "@base-ui/react/tabs";
import { BubbleMenu as or, FloatingMenu as cr } from "@tiptap/react/menus";
async function dr() {
  const t = await fetch("/api/admin/auth/session", {
    credentials: "include"
  });
  return t.ok ? (await t.json()).data : null;
}
let $t = null, Nn = null, wn = null;
function Wa(t) {
  Nn = t;
}
function Ja(t) {
  wn = t;
}
async function ur() {
  return $t || ($t = fetch("/api/admin/auth/refresh", {
    method: "POST",
    credentials: "include"
  }).then((t) => t.ok).catch(() => !1).finally(() => {
    $t = null;
  })), $t;
}
async function Qt(t, n = {}) {
  const s = new Headers(n.headers), l = typeof FormData < "u" && n.body instanceof FormData;
  n.body && !l && !s.has("content-type") && s.set("content-type", "application/json");
  const i = {
    ...n,
    headers: s,
    credentials: "include"
  };
  let r = await fetch(t, i);
  r.status === 401 && await ur() && (r = await fetch(t, i)), r.status === 401 && Nn?.(), r.status === 403 && wn?.();
  const o = {
    success: !1,
    message: `Request failed: ${r.status}`
  }, c = await r.json().catch(() => o);
  return typeof c?.success == "boolean" ? c : r.ok ? {
    success: !0,
    message: "OK",
    data: c
  } : o;
}
async function de(t) {
  const n = await Qt(t);
  if (!n.success)
    throw new Error(n.message);
  return n.data;
}
function Se(t, n) {
  return Qt(t, {
    method: "POST",
    ...n !== void 0 ? { body: JSON.stringify(n) } : {}
  });
}
function rt(t, n) {
  return Qt(t, {
    method: "PUT",
    ...n !== void 0 ? { body: JSON.stringify(n) } : {}
  });
}
function Cn(t) {
  return Qt(t, {
    method: "DELETE"
  });
}
const $e = typeof globalThis.__CMS_ADMIN_PATH__ == "string" ? globalThis.__CMS_ADMIN_PATH__ : "/admin";
function mr(t) {
  return t != null && t !== "" && t !== "all";
}
function Ce(t, n) {
  if (!n)
    return t;
  const s = n instanceof URLSearchParams ? new URLSearchParams(n.toString()) : new URLSearchParams();
  if (!(n instanceof URLSearchParams))
    for (const [i, r] of Object.entries(n))
      mr(r) && s.set(i, String(r));
  const l = s.toString();
  return l ? `${t}?${l}` : t;
}
let fa = null;
function Ya(t) {
  fa = t;
}
function hr(t, n) {
  if (fa) {
    fa(t, n);
    return;
  }
  if (typeof window < "u") {
    const s = window.location.origin || "http://localhost", l = new URL(t, s);
    if (l.origin === s && l.pathname.startsWith("/admin") && typeof window.history?.pushState == "function" && typeof window.dispatchEvent == "function") {
      const i = `${l.pathname}${l.search}${l.hash}`, r = window.history.state ?? {}, o = typeof r.idx == "number" ? r.idx : 0, c = {
        ...r,
        idx: o + 1
      };
      window.history.pushState(c, "", i), window.dispatchEvent(new PopStateEvent("popstate", { state: c }));
      return;
    }
    window.location.assign(t);
  }
}
function Fe(t, n) {
  hr(Ce(t, n));
}
const kn = Jn({
  loading: !0,
  session: null,
  setSession() {
  },
  async refreshSession() {
    return null;
  }
}), gr = 600 * 1e3;
function pr({ children: t }) {
  const [n, s] = d(!0), [l, i] = d(null), r = Oe(null), o = Oe(!0), c = J(async () => {
    const h = await dr();
    return o.current && (i(h), !h && r.current && (clearInterval(r.current), r.current = null)), h;
  }, []);
  return te(() => (o.current = !0, Wa(() => {
    o.current && (i(null), r.current && (clearInterval(r.current), r.current = null));
  }), Ja(() => {
    o.current && Fe(`${$e}/403`);
  }), c().finally(() => {
    o.current && s(!1);
  }), r.current = setInterval(() => {
    c();
  }, gr), () => {
    o.current = !1, Wa(null), Ja(null), r.current && (clearInterval(r.current), r.current = null);
  }), [c]), /* @__PURE__ */ e(kn.Provider, { value: { loading: n, session: l, setSession: i, refreshSession: c }, children: t });
}
function et() {
  return Yn(kn);
}
const na = 768;
function fr() {
  const [t, n] = Ne.useState(void 0);
  return Ne.useEffect(() => {
    const s = window.matchMedia(`(max-width: ${na - 1}px)`), l = () => {
      n(window.innerWidth < na);
    };
    return s.addEventListener("change", l), n(window.innerWidth < na), () => s.removeEventListener("change", l);
  }, []), !!t;
}
function P(...t) {
  return sr(nr(t));
}
const kt = zt(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-sm-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-sm-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-sm-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-sm-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-sm",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function x({
  className: t,
  variant: n = "default",
  size: s = "default",
  render: l,
  ...i
}) {
  const r = l == null || Ne.isValidElement(l) && typeof l.type == "string" && l.type === "button";
  return /* @__PURE__ */ e(
    ir,
    {
      "data-slot": "button",
      nativeButton: r,
      className: P(kt({ variant: n, size: s, className: t })),
      render: l,
      ...i
    }
  );
}
function br({ ...t }) {
  return /* @__PURE__ */ e(ve.Root, { "data-slot": "sheet", ...t });
}
function vr({ ...t }) {
  return /* @__PURE__ */ e(ve.Portal, { "data-slot": "sheet-portal", ...t });
}
function xr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    ve.Backdrop,
    {
      "data-slot": "sheet-overlay",
      className: P(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        t
      ),
      ...n
    }
  );
}
function yr({
  className: t,
  children: n,
  side: s = "right",
  showCloseButton: l = !0,
  ...i
}) {
  return /* @__PURE__ */ a(vr, { children: [
    /* @__PURE__ */ e(xr, {}),
    /* @__PURE__ */ a(
      ve.Popup,
      {
        "data-slot": "sheet-content",
        "data-side": s,
        className: P(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          t
        ),
        ...i,
        children: [
          n,
          l && /* @__PURE__ */ a(
            ve.Close,
            {
              "data-slot": "sheet-close",
              render: /* @__PURE__ */ e(
                x,
                {
                  variant: "ghost",
                  className: "absolute top-3 right-3",
                  size: "icon-sm"
                }
              ),
              children: [
                /* @__PURE__ */ e(
                  dn,
                  {}
                ),
                /* @__PURE__ */ e("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function Nr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sheet-header",
      className: P("flex flex-col gap-0.5 p-4", t),
      ...n
    }
  );
}
function wr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    ve.Title,
    {
      "data-slot": "sheet-title",
      className: P(
        "font-heading text-base font-medium text-foreground",
        t
      ),
      ...n
    }
  );
}
function Cr({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    ve.Description,
    {
      "data-slot": "sheet-description",
      className: P("text-sm text-muted-foreground", t),
      ...n
    }
  );
}
function kr({ ...t }) {
  return /* @__PURE__ */ e(xt.Root, { "data-slot": "tooltip", ...t });
}
function Sr({ ...t }) {
  return /* @__PURE__ */ e(xt.Trigger, { "data-slot": "tooltip-trigger", ...t });
}
function Pr({
  className: t,
  side: n = "top",
  sideOffset: s = 4,
  align: l = "center",
  alignOffset: i = 0,
  children: r,
  ...o
}) {
  return /* @__PURE__ */ e(xt.Portal, { children: /* @__PURE__ */ e(
    xt.Positioner,
    {
      align: l,
      alignOffset: i,
      side: n,
      sideOffset: s,
      className: "isolate z-50",
      children: /* @__PURE__ */ a(
        xt.Popup,
        {
          "data-slot": "tooltip-content",
          className: P(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-sm bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            t
          ),
          ...o,
          children: [
            r,
            /* @__PURE__ */ e(xt.Arrow, { className: "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-sm-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" })
          ]
        }
      )
    }
  ) });
}
const _r = "sidebar_state", Ar = 3600 * 24 * 7, zr = "16rem", Ir = "18rem", Tr = "3rem", Dr = "b", Sn = Ne.createContext(null);
function Ia() {
  const t = Ne.useContext(Sn);
  if (!t)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return t;
}
function Er({
  defaultOpen: t = !0,
  open: n,
  onOpenChange: s,
  className: l,
  style: i,
  children: r,
  ...o
}) {
  const c = fr(), [h, m] = Ne.useState(!1), [p, S] = Ne.useState(t), y = n ?? p, z = Ne.useCallback(
    (b) => {
      const g = typeof b == "function" ? b(y) : b;
      s ? s(g) : S(g), document.cookie = `${_r}=${g}; path=/; max-age=${Ar}`;
    },
    [s, y]
  ), I = Ne.useCallback(() => c ? m((b) => !b) : z((b) => !b), [c, z, m]);
  Ne.useEffect(() => {
    const b = (g) => {
      g.key === Dr && (g.metaKey || g.ctrlKey) && (g.preventDefault(), I());
    };
    return window.addEventListener("keydown", b), () => window.removeEventListener("keydown", b);
  }, [I]);
  const E = y ? "expanded" : "collapsed", M = Ne.useMemo(
    () => ({
      state: E,
      open: y,
      setOpen: z,
      isMobile: c,
      openMobile: h,
      setOpenMobile: m,
      toggleSidebar: I
    }),
    [E, y, z, c, h, m, I]
  );
  return /* @__PURE__ */ e(Sn.Provider, { value: M, children: /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": zr,
        "--sidebar-width-icon": Tr,
        ...i
      },
      className: P(
        "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
        l
      ),
      ...o,
      children: r
    }
  ) });
}
function Lr({
  side: t = "left",
  variant: n = "sidebar",
  collapsible: s = "offcanvas",
  className: l,
  children: i,
  dir: r,
  ...o
}) {
  const { isMobile: c, state: h, openMobile: m, setOpenMobile: p } = Ia();
  return s === "none" ? /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar",
      className: P(
        "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
        l
      ),
      ...o,
      children: i
    }
  ) : c ? /* @__PURE__ */ e(br, { open: m, onOpenChange: p, ...o, children: /* @__PURE__ */ a(
    yr,
    {
      dir: r,
      "data-sidebar": "sidebar",
      "data-slot": "sidebar",
      "data-mobile": "true",
      className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
      style: {
        "--sidebar-width": Ir
      },
      side: t,
      children: [
        /* @__PURE__ */ a(Nr, { className: "sr-only", children: [
          /* @__PURE__ */ e(wr, { children: "Sidebar" }),
          /* @__PURE__ */ e(Cr, { children: "Displays the mobile sidebar." })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex h-full w-full flex-col", children: i })
      ]
    }
  ) }) : /* @__PURE__ */ a(
    "div",
    {
      className: "group peer hidden text-sidebar-foreground md:block",
      "data-state": h,
      "data-collapsible": h === "collapsed" ? s : "",
      "data-variant": n,
      "data-side": t,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ e(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: P(
              "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              n === "floating" || n === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ e(
          "div",
          {
            "data-slot": "sidebar-container",
            "data-side": t,
            className: P(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
              // Adjust the padding for floating and inset variants.
              n === "floating" || n === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              l
            ),
            ...o,
            children: /* @__PURE__ */ e(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: "flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-sm group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border",
                children: i
              }
            )
          }
        )
      ]
    }
  );
}
function Rr({
  className: t,
  onClick: n,
  ...s
}) {
  const { toggleSidebar: l } = Ia();
  return /* @__PURE__ */ a(
    x,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon-sm",
      className: P(t),
      onClick: (i) => {
        n?.(i), l();
      },
      ...s,
      children: [
        /* @__PURE__ */ e(ns, {}),
        /* @__PURE__ */ e("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function Mr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "main",
    {
      "data-slot": "sidebar-inset",
      className: P(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-sm md:peer-data-[variant=inset]:shadow-sm",
        t
      ),
      ...n
    }
  );
}
function $r({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: P("flex flex-col gap-2 p-2", t),
      ...n
    }
  );
}
function Or({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      className: P("flex flex-col gap-2 p-2", t),
      ...n
    }
  );
}
function Br({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: P(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        t
      ),
      ...n
    }
  );
}
function jr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: P("relative flex w-full min-w-0 flex-col p-2", t),
      ...n
    }
  );
}
function Ur({
  className: t,
  render: n,
  ...s
}) {
  return Yt({
    defaultTagName: "div",
    props: Jt(
      {
        className: P(
          "flex h-8 shrink-0 items-center rounded-sm px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          t
        )
      },
      s
    ),
    render: n,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label"
    }
  });
}
function Fr({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      className: P("w-full text-sm", t),
      ...n
    }
  );
}
function sa({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: P("flex w-full min-w-0 flex-col gap-0", t),
      ...n
    }
  );
}
function it({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: P("group/menu-item relative", t),
      ...n
    }
  );
}
const Hr = zt(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function ft({
  render: t,
  isActive: n = !1,
  variant: s = "default",
  size: l = "default",
  tooltip: i,
  className: r,
  ...o
}) {
  const { isMobile: c, state: h } = Ia(), m = Yt({
    defaultTagName: "button",
    props: Jt(
      {
        className: P(Hr({ variant: s, size: l }), r)
      },
      o
    ),
    render: i ? /* @__PURE__ */ e(Sr, { render: t }) : t,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size: l,
      active: n
    }
  });
  return i ? (typeof i == "string" && (i = {
    children: i
  }), /* @__PURE__ */ a(kr, { children: [
    m,
    /* @__PURE__ */ e(
      Pr,
      {
        side: "right",
        align: "center",
        hidden: h !== "collapsed" || c,
        ...i
      }
    )
  ] })) : m;
}
function Vr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "ul",
    {
      "data-slot": "sidebar-menu-sub",
      "data-sidebar": "menu-sub",
      className: P(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        t
      ),
      ...n
    }
  );
}
function Xa({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    "li",
    {
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item",
      className: P("group/menu-sub-item relative", t),
      ...n
    }
  );
}
function Qa({
  render: t,
  size: n = "md",
  isActive: s = !1,
  className: l,
  ...i
}) {
  return Yt({
    defaultTagName: "a",
    props: Jt(
      {
        className: P(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-sm px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          l
        )
      },
      i
    ),
    render: t,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size: n,
      active: s
    }
  });
}
function Gr({ ...t }) {
  return /* @__PURE__ */ e(ka.Root, { "data-slot": "collapsible", ...t });
}
function qr({ ...t }) {
  return /* @__PURE__ */ e(ka.Trigger, { "data-slot": "collapsible-trigger", ...t });
}
function Kr({ ...t }) {
  return /* @__PURE__ */ e(ka.Panel, { "data-slot": "collapsible-content", ...t });
}
const Wr = [], Jr = [], Yr = {
  contentTypes: Wr,
  templates: Jr
};
let Xr = Yr;
function Qr(t) {
  return typeof t == "object" && t !== null && Array.isArray(t.contentTypes) && Array.isArray(t.templates);
}
function Zt() {
  const t = globalThis.__CMS_CONTENT_TYPE_REGISTRY__;
  return Qr(t) ? t : Xr;
}
const Zr = "0.1.19", ei = {
  version: Zr
}, Za = {
  FileText: Bt,
  Layout: Na,
  Image: un,
  FolderTree: mn,
  Settings: os,
  Star: ta,
  Bookmark: ta,
  Tag: Ma,
  Hash: Ma,
  Bell: ta
}, ti = [
  { title: "Dashboard", href: "/admin", icon: Na, permission: "dashboard.view" },
  { title: "Media", href: "/admin/media", icon: un, permission: "media.view" },
  { title: "Menus", href: "/admin/menus", icon: ss, permission: "menus.view" },
  { title: "Users", href: "/admin/users", icon: rs, permission: "users.view" },
  { title: "Roles & Permissions", href: "/admin/roles", icon: is, permission: "roles.view" },
  { title: "Settings", href: "/admin/settings", icon: ls, permission: "settings.manage" }
];
function ai({ permissions: t, pathname: n }) {
  const s = [
    { id: "page", name: "page", label: "Pages", slug: "page", icon: "Layout", position: 0 },
    ...Zt().contentTypes.map((p) => ({ ...p, id: p.slug }))
  ], l = Ze(), { setSession: i } = et(), r = ti.filter(
    (p) => p.permission === null || t.includes(p.permission)
  );
  function o(p) {
    return p === "/admin" ? n === "/admin" : n === p || n.startsWith(p + "/");
  }
  function c(p) {
    return n.startsWith(`/admin/posts/${p}`) || p !== "page" && n.startsWith(`/admin/categories/${p}`);
  }
  function h(p) {
    return c(p);
  }
  async function m() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" }), i(null), l("/admin/login", { replace: !0 });
  }
  return /* @__PURE__ */ a(Lr, { variant: "inset", children: [
    /* @__PURE__ */ e($r, { className: "gap-3 px-3 pt-3", children: /* @__PURE__ */ e(sa, { children: /* @__PURE__ */ e(it, { children: /* @__PURE__ */ a(ft, { size: "lg", className: "rounded-sm", onClick: () => l("/admin"), children: [
      /* @__PURE__ */ e("div", { className: "flex aspect-square size-9 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground shadow-sm", children: /* @__PURE__ */ e(Na, { className: "size-4" }) }),
      /* @__PURE__ */ a("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [
        /* @__PURE__ */ e("span", { className: "truncate font-semibold", children: "Beaver" }),
        /* @__PURE__ */ e("span", { className: "truncate text-xs text-sidebar-foreground/65", children: "Editorial control center" })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ e(Br, { children: /* @__PURE__ */ e(jr, { children: /* @__PURE__ */ e(Fr, { children: /* @__PURE__ */ a(sa, { children: [
      r.map((p) => /* @__PURE__ */ e(it, { children: /* @__PURE__ */ a(
        ft,
        {
          isActive: o(p.href),
          tooltip: p.title,
          className: "rounded-sm",
          onClick: () => l(p.href),
          children: [
            /* @__PURE__ */ e(p.icon, {}),
            /* @__PURE__ */ e("span", { children: p.title })
          ]
        }
      ) }, p.href)),
      /* @__PURE__ */ e(it, { className: "mt-3 pt-3 border-t border-sidebar-border", children: /* @__PURE__ */ e(Ur, { className: "px-1 pb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50", children: "CONTENT" }) }),
      s.map((p) => {
        const S = p.icon && Za[p.icon] ? Za[p.icon] : Bt, y = t.includes(`content.${p.slug}.view`), z = t.includes(`category.${p.slug}.view`);
        if (!y && !z) return null;
        if (p.slug === "page") {
          if (!y) return null;
          const E = n.startsWith(`/admin/posts/${p.slug}`);
          return /* @__PURE__ */ e(it, { children: /* @__PURE__ */ a(
            ft,
            {
              tooltip: p.label,
              className: "rounded-sm",
              isActive: E,
              onClick: () => l(`/admin/posts/${p.slug}`),
              children: [
                /* @__PURE__ */ e(S, {}),
                /* @__PURE__ */ e("span", { children: p.label })
              ]
            }
          ) }, p.id);
        }
        const I = h(p.slug);
        return /* @__PURE__ */ e(Gr, { defaultOpen: I, className: "group/collapsible", children: /* @__PURE__ */ a(it, { children: [
          /* @__PURE__ */ a(
            qr,
            {
              render: /* @__PURE__ */ e(
                ft,
                {
                  tooltip: p.label,
                  className: "rounded-sm",
                  isActive: c(p.slug)
                }
              ),
              children: [
                /* @__PURE__ */ e(S, {}),
                /* @__PURE__ */ e("span", { children: p.label }),
                /* @__PURE__ */ e(Ct, { className: "ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" })
              ]
            }
          ),
          /* @__PURE__ */ e(Kr, { children: /* @__PURE__ */ a(Vr, { children: [
            y && /* @__PURE__ */ e(Xa, { children: /* @__PURE__ */ a(
              Qa,
              {
                isActive: n.startsWith(`/admin/posts/${p.slug}`) || !n.includes("/") && p.slug === "post",
                className: "rounded-sm",
                onClick: () => l(`/admin/posts/${p.slug}`),
                children: [
                  /* @__PURE__ */ e(Bt, { className: "size-3.5" }),
                  /* @__PURE__ */ e("span", { children: p.label })
                ]
              }
            ) }),
            z && /* @__PURE__ */ e(Xa, { children: /* @__PURE__ */ a(
              Qa,
              {
                isActive: n.startsWith(`/admin/categories/${p.slug}`),
                className: "rounded-sm",
                onClick: () => l(`/admin/categories/${p.slug}`),
                children: [
                  /* @__PURE__ */ e(mn, { className: "size-3.5" }),
                  /* @__PURE__ */ e("span", { children: "Categories" })
                ]
              }
            ) })
          ] }) })
        ] }) }, p.id);
      })
    ] }) }) }) }),
    /* @__PURE__ */ a(Or, { children: [
      /* @__PURE__ */ a(sa, { children: [
        /* @__PURE__ */ e(it, { children: /* @__PURE__ */ a(ft, { className: "rounded-sm", onClick: () => l("/admin/profile"), children: [
          /* @__PURE__ */ e(cs, {}),
          /* @__PURE__ */ e("span", { children: "Profile" })
        ] }) }),
        /* @__PURE__ */ e(it, { children: /* @__PURE__ */ a(ft, { className: "rounded-sm", onClick: m, children: [
          /* @__PURE__ */ e(ds, {}),
          /* @__PURE__ */ e("span", { children: "Logout" })
        ] }) })
      ] }),
      /* @__PURE__ */ a("p", { className: "px-3 pt-3 text-xs text-sidebar-foreground/50", children: [
        "Beaver v",
        ei.version
      ] })
    ] })
  ] });
}
function ge({ className: t = "p-6" }) {
  return /* @__PURE__ */ e("main", { className: `grid min-h-[50vh] place-items-center ${t}`, "aria-busy": "true", children: /* @__PURE__ */ e(us, { className: "size-7 animate-spin text-muted-foreground", "aria-label": "Loading" }) });
}
function Ae({
  className: t,
  size: n = "default",
  ...s
}) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card",
      "data-size": n,
      className: P(
        "group/card flex flex-col gap-4 overflow-hidden rounded-sm bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-sm *:[img:last-child]:rounded-sm",
        t
      ),
      ...s
    }
  );
}
function ze({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-header",
      className: P(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-sm px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        t
      ),
      ...n
    }
  );
}
function Ie({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-title",
      className: P(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        t
      ),
      ...n
    }
  );
}
function Ta({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-description",
      className: P("text-sm text-muted-foreground", t),
      ...n
    }
  );
}
function Te({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-content",
      className: P("px-4 group-data-[size=sm]/card:px-3", t),
      ...n
    }
  );
}
function G({ className: t, type: n, ...s }) {
  return /* @__PURE__ */ e(
    lr,
    {
      type: n,
      "data-slot": "input",
      className: P(
        "h-8 w-full min-w-0 rounded-sm border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        t
      ),
      ...s
    }
  );
}
function R({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "label",
    {
      "data-slot": "label",
      className: P(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        t
      ),
      ...n
    }
  );
}
function ni() {
  const { refreshSession: t } = et(), n = Ze(), [s, l] = d(""), [i, r] = d(""), [o, c] = d("");
  async function h(m) {
    m.preventDefault(), c("");
    const p = await fetch("/api/admin/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: s, password: i })
    });
    if (!p.ok) {
      const S = await p.json().catch(() => null);
      c(S?.message || `Login failed (${p.status}).`);
      return;
    }
    try {
      if (!await t()) {
        c("Login berhasil, tetapi sesi tidak dapat diverifikasi. Silakan coba lagi.");
        return;
      }
      n($e, { replace: !0 });
    } catch {
      c("Sesi tidak dapat diverifikasi. Silakan coba lagi.");
    }
  }
  return /* @__PURE__ */ e("main", { className: "mx-auto flex min-h-screen max-w-md items-center px-6", children: /* @__PURE__ */ e("form", { className: "w-full", onSubmit: h, children: /* @__PURE__ */ a(Ae, { className: "border-border/60 shadow-sm", children: [
    /* @__PURE__ */ e(ze, { children: /* @__PURE__ */ e(Ie, { children: "Login" }) }),
    /* @__PURE__ */ a(Te, { className: "space-y-4", children: [
      o ? /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: o }) : null,
      /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ e(R, { htmlFor: "login-email", children: "Email" }),
        /* @__PURE__ */ e(G, { id: "login-email", type: "email", value: s, onChange: (m) => l(m.target.value), placeholder: "Email" })
      ] }),
      /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ e(R, { htmlFor: "login-password", children: "Password" }),
        /* @__PURE__ */ e(G, { id: "login-password", type: "password", value: i, onChange: (m) => r(m.target.value), placeholder: "Password" })
      ] }),
      /* @__PURE__ */ e(x, { className: "w-full", type: "submit", children: "Sign in" })
    ] })
  ] }) }) });
}
const si = ce(async () => ({ default: (await Promise.resolve().then(() => Di)).AdminDashboardPage })), en = ce(async () => ({ default: (await Promise.resolve().then(() => Oi)).AdminContentListPage })), ri = ce(async () => ({ default: (await Promise.resolve().then(() => ji)).AdminUsersPage })), ii = ce(async () => ({ default: (await Promise.resolve().then(() => _n)).AdminUserCreatePage })), li = ce(async () => ({ default: (await Promise.resolve().then(() => _n)).AdminUserEditPage })), oi = ce(async () => ({ default: (await Promise.resolve().then(() => Gi)).AdminMediaPage })), tn = ce(async () => ({ default: (await Promise.resolve().then(() => Ki)).AdminCategoriesPage })), ci = ce(async () => ({ default: (await Promise.resolve().then(() => ml)).AdminMenusPage })), di = ce(async () => ({ default: (await Promise.resolve().then(() => gl)).AdminRolesPage })), ui = ce(async () => ({ default: (await Promise.resolve().then(() => fl)).AdminProfilePage })), an = ce(async () => ({ default: (await Promise.resolve().then(() => Tn)).AdminCategoryCreatePage })), mi = ce(async () => ({ default: (await Promise.resolve().then(() => Tn)).AdminCategoryEditPage })), nn = ce(async () => ({ default: (await Promise.resolve().then(() => Mn)).AdminPostCreatePage })), hi = ce(async () => ({ default: (await Promise.resolve().then(() => Mn)).AdminPostEditPage })), gi = ce(async () => ({ default: (await Promise.resolve().then(() => Ll)).AdminContentListPage })), pi = ce(async () => ({ default: (await Promise.resolve().then(() => On)).AdminPageCreatePage })), fi = ce(async () => ({ default: (await Promise.resolve().then(() => On)).AdminPageEditPage })), bi = ce(async () => ({ default: (await Promise.resolve().then(() => Un)).AdminRoleCreatePage })), vi = ce(async () => ({ default: (await Promise.resolve().then(() => Un)).AdminRoleEditPage })), xi = ce(async () => ({ default: (await Promise.resolve().then(() => Kl)).AdminSettingsPage })), yi = ce(async () => ({ default: (await Promise.resolve().then(() => Jl)).AdminForbiddenPage }));
function Ni() {
  return /* @__PURE__ */ e(ya, { fallback: /* @__PURE__ */ e(ge, {}), children: /* @__PURE__ */ a(es, { children: [
    /* @__PURE__ */ e(se, { path: `${$e}/login`, element: /* @__PURE__ */ e(wi, {}) }),
    /* @__PURE__ */ a(se, { path: $e, element: /* @__PURE__ */ e(Ci, {}), children: [
      /* @__PURE__ */ e(se, { index: !0, element: /* @__PURE__ */ e(si, {}) }),
      /* @__PURE__ */ e(se, { path: "posts", element: /* @__PURE__ */ e(en, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/new", element: /* @__PURE__ */ e(nn, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/:id/edit", element: /* @__PURE__ */ e(rn, {}) }),
      /* @__PURE__ */ e(se, { path: "users", element: /* @__PURE__ */ e(ri, {}) }),
      /* @__PURE__ */ e(se, { path: "users/new", element: /* @__PURE__ */ e(ii, {}) }),
      /* @__PURE__ */ e(se, { path: "users/:id/edit", element: /* @__PURE__ */ e(Si, {}) }),
      /* @__PURE__ */ e(se, { path: "media", element: /* @__PURE__ */ e(oi, {}) }),
      /* @__PURE__ */ e(se, { path: "categories", element: /* @__PURE__ */ e(tn, {}) }),
      /* @__PURE__ */ e(se, { path: "categories/new", element: /* @__PURE__ */ e(an, {}) }),
      /* @__PURE__ */ e(se, { path: "categories/:id/edit", element: /* @__PURE__ */ e(sn, {}) }),
      /* @__PURE__ */ e(se, { path: "menus", element: /* @__PURE__ */ e(ci, {}) }),
      /* @__PURE__ */ e(se, { path: "profile", element: /* @__PURE__ */ e(ui, {}) }),
      /* @__PURE__ */ e(se, { path: "403", element: /* @__PURE__ */ e(yi, {}) }),
      /* @__PURE__ */ e(se, { path: "roles", element: /* @__PURE__ */ e(di, {}) }),
      /* @__PURE__ */ e(se, { path: "roles/new", element: /* @__PURE__ */ e(bi, {}) }),
      /* @__PURE__ */ e(se, { path: "roles/:id/edit", element: /* @__PURE__ */ e(Pi, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/page", element: /* @__PURE__ */ e(gi, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/page/new", element: /* @__PURE__ */ e(pi, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/page/:id/edit", element: /* @__PURE__ */ e(ki, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/:type", element: /* @__PURE__ */ e(en, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/:type/new", element: /* @__PURE__ */ e(nn, {}) }),
      /* @__PURE__ */ e(se, { path: "posts/:type/:id/edit", element: /* @__PURE__ */ e(rn, {}) }),
      /* @__PURE__ */ e(se, { path: "categories/:type", element: /* @__PURE__ */ e(tn, {}) }),
      /* @__PURE__ */ e(se, { path: "categories/:type/new", element: /* @__PURE__ */ e(an, {}) }),
      /* @__PURE__ */ e(se, { path: "categories/:type/:id/edit", element: /* @__PURE__ */ e(sn, {}) }),
      /* @__PURE__ */ e(se, { path: "settings", element: /* @__PURE__ */ e(xi, {}) })
    ] }),
    /* @__PURE__ */ e(se, { path: "*", element: /* @__PURE__ */ e(st, { to: $e, replace: !0 }) })
  ] }) });
}
function wi() {
  const { loading: t, session: n } = et();
  return t ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ e(st, { to: $e, replace: !0 }) : /* @__PURE__ */ e(ni, {});
}
function Ci() {
  const { loading: t, session: n } = et(), s = dt();
  return t ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ a(Er, { children: [
    /* @__PURE__ */ e(
      ai,
      {
        permissions: n.permissions,
        pathname: s.pathname
      }
    ),
    /* @__PURE__ */ e(Mr, { children: /* @__PURE__ */ e("div", { className: "flex min-h-svh flex-1 flex-col bg-background", children: /* @__PURE__ */ e(ts, {}) }) })
  ] }) : /* @__PURE__ */ e(st, { to: `${$e}/login`, replace: !0 });
}
function sn() {
  const { id: t } = qe();
  return t ? /* @__PURE__ */ e(mi, { id: t }) : /* @__PURE__ */ e(st, { to: `${$e}/categories`, replace: !0 });
}
function rn() {
  const { id: t } = qe();
  return t ? /* @__PURE__ */ e(hi, { id: t }) : /* @__PURE__ */ e(st, { to: `${$e}/posts`, replace: !0 });
}
function ki() {
  const { id: t } = qe();
  return t ? /* @__PURE__ */ e(fi, { id: t }) : /* @__PURE__ */ e(st, { to: `${$e}/posts/page`, replace: !0 });
}
function Si() {
  const { id: t } = qe();
  return t ? /* @__PURE__ */ e(li, { id: t }) : /* @__PURE__ */ e(st, { to: `${$e}/users`, replace: !0 });
}
function Pi() {
  const { id: t } = qe();
  return t ? /* @__PURE__ */ e(vi, { id: t }) : /* @__PURE__ */ e(st, { to: `${$e}/roles`, replace: !0 });
}
const _i = ({ ...t }) => {
  const { theme: n = "system" } = As();
  return /* @__PURE__ */ e(
    zs,
    {
      theme: n,
      className: "toaster group",
      icons: {
        success: /* @__PURE__ */ e(fs, { className: "size-4" }),
        info: /* @__PURE__ */ e(ps, { className: "size-4" }),
        warning: /* @__PURE__ */ e(gs, { className: "size-4" }),
        error: /* @__PURE__ */ e(hs, { className: "size-4" }),
        loading: /* @__PURE__ */ e(ms, { className: "size-4 animate-spin" })
      },
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)"
      },
      toastOptions: {
        classNames: {
          toast: "cn-toast"
        }
      },
      ...t
    }
  );
};
function Ai() {
  const t = Ze();
  return te(() => (Ya((n, s) => {
    t(n, { replace: s?.replace });
  }), () => {
    Ya(null);
  }), [t]), null;
}
function Vo() {
  return /* @__PURE__ */ a(as, { children: [
    /* @__PURE__ */ e(_i, { richColors: !0, position: "top-right", closeButton: !0 }),
    /* @__PURE__ */ e(Ai, {}),
    /* @__PURE__ */ e(pr, { children: /* @__PURE__ */ e(Ni, {}) })
  ] });
}
function tt({
  children: t,
  className: n
}) {
  return /* @__PURE__ */ e("main", { className: P("flex min-h-full flex-1 flex-col bg-background", n), children: t });
}
function Pe({
  title: t,
  search: n,
  actions: s
}) {
  return /* @__PURE__ */ a("header", { className: "z-10 flex min-h-13 items-center gap-3 border-b border-border/70 bg-background px-4", children: [
    /* @__PURE__ */ e(Rr, {}),
    /* @__PURE__ */ e("h1", { className: "min-w-0 truncate text-sm font-medium text-foreground", children: t }),
    n || s ? /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
      n,
      s
    ] }) : null
  ] });
}
function zi({
  children: t
}) {
  return /* @__PURE__ */ e("section", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: t });
}
function bt({
  label: t,
  value: n,
  hint: s
}) {
  return /* @__PURE__ */ a(Ae, { className: "bg-card shadow-sm", children: [
    /* @__PURE__ */ a(ze, { className: "gap-2", children: [
      /* @__PURE__ */ e(Ta, { className: "text-xs uppercase tracking-[0.2em]", children: t }),
      /* @__PURE__ */ e(Ie, { className: "text-2xl", children: n })
    ] }),
    /* @__PURE__ */ e(Te, { className: "pt-0 text-sm text-muted-foreground", children: s })
  ] });
}
function Ke({
  title: t,
  description: n,
  children: s,
  className: l
}) {
  return /* @__PURE__ */ a(Ae, { className: P("bg-card shadow-sm", l), children: [
    /* @__PURE__ */ a(ze, { className: "border-b border-border/70", children: [
      /* @__PURE__ */ e(Ie, { children: t }),
      n ? /* @__PURE__ */ e(Ta, { children: n }) : null
    ] }),
    /* @__PURE__ */ e(Te, { className: "", children: s })
  ] });
}
function Ii() {
  const [t, n] = d(null), [s, l] = d(null), { session: i } = et(), r = [
    { label: "Pages", slug: "page" },
    { label: "Posts", slug: "post" },
    ...Zt().contentTypes.filter(
      (c) => c.slug !== "page" && c.slug !== "post"
    )
  ];
  async function o() {
    l(null);
    const c = await de("/api/admin/dashboard");
    n(c);
  }
  return te(() => {
    o().catch((c) => l(c.message));
  }, []), s ? /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) }) : t ? /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Dashboard"
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a(zi, { children: [
        /* @__PURE__ */ e(
          bt,
          {
            label: "Total Content",
            value: String(t.totalPosts),
            hint: "All content across every status"
          }
        ),
        /* @__PURE__ */ e(
          bt,
          {
            label: "Published",
            value: String(t.publishedPosts),
            hint: "Content visible to visitors"
          }
        ),
        /* @__PURE__ */ e(
          bt,
          {
            label: "Drafts",
            value: String(t.draftPosts),
            hint: "Content waiting to be finished"
          }
        ),
        /* @__PURE__ */ e(
          bt,
          {
            label: "Media",
            value: String(t.totalMedia),
            hint: "Uploaded files and images"
          }
        ),
        /* @__PURE__ */ e(
          bt,
          {
            label: "Users",
            value: String(t.totalUsers),
            hint: "Registered admin accounts"
          }
        ),
        /* @__PURE__ */ e(
          bt,
          {
            label: "Categories",
            value: String(t.totalCategories),
            hint: "Content taxonomies"
          }
        )
      ] }),
      /* @__PURE__ */ e("section", { children: /* @__PURE__ */ e(
        Ke,
        {
          title: "Content workspace",
          description: "Start, review, and organize the content you can access.",
          children: /* @__PURE__ */ a("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            r.filter((c) => i?.permissions.includes(`content.${c.slug}.view`)).map((c) => /* @__PURE__ */ e(
              Ti,
              {
                to: `/admin/posts/${c.slug}`,
                title: c.label,
                description: `Manage ${c.label.toLowerCase()} and their publishing status.`,
                icon: Bt
              },
              c.slug
            )),
            r.every((c) => !i?.permissions.includes(`content.${c.slug}.view`)) ? /* @__PURE__ */ e("p", { className: "text-sm leading-6 text-muted-foreground", children: "Your role does not currently have access to a content type." }) : null
          ] })
        }
      ) })
    ] })
  ] }) : /* @__PURE__ */ e(ge, {});
}
function Ti({
  to: t,
  title: n,
  description: s,
  icon: l
}) {
  return /* @__PURE__ */ a(
    fe,
    {
      to: t,
      className: "group rounded-sm border border-border/70 bg-muted/20 p-4 transition hover:border-foreground/15 hover:bg-muted/45",
      children: [
        /* @__PURE__ */ e("div", { className: "mb-3 flex size-10 items-center justify-center rounded-sm bg-background text-foreground ring-1 ring-border/70", children: /* @__PURE__ */ e(l, { className: "size-4" }) }),
        /* @__PURE__ */ a("div", { className: "space-y-1", children: [
          /* @__PURE__ */ a("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
            /* @__PURE__ */ e("span", { children: n }),
            /* @__PURE__ */ e(bs, { className: "size-3.5 transition group-hover:translate-x-0.5" })
          ] }),
          /* @__PURE__ */ e("p", { className: "text-sm leading-6 text-muted-foreground", children: s })
        ] })
      ]
    }
  );
}
const Di = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminDashboardPage: Ii
}, Symbol.toStringTag, { value: "Module" })), Ei = zt(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function He({
  className: t,
  variant: n = "default",
  render: s,
  ...l
}) {
  return Yt({
    defaultTagName: "span",
    props: Jt(
      {
        className: P(Ei({ variant: n }), t)
      },
      l
    ),
    render: s,
    state: {
      slot: "badge",
      variant: n
    }
  });
}
const xe = Ne.forwardRef(
  ({ className: t, checked: n, onCheckedChange: s, disabled: l, ...i }, r) => /* @__PURE__ */ a(
    "label",
    {
      "data-slot": "checkbox",
      className: P(
        "group inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        n && "border-primary bg-primary text-primary-foreground",
        t
      ),
      children: [
        /* @__PURE__ */ e(
          "input",
          {
            ref: r,
            type: "checkbox",
            checked: n,
            onChange: (o) => s?.(o.target.checked),
            disabled: l,
            className: "sr-only",
            ...i
          }
        ),
        n && /* @__PURE__ */ e(Ht, { className: "size-3" })
      ]
    }
  )
);
xe.displayName = "Checkbox";
const De = Me.Root;
function Ee({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    Me.Value,
    {
      "data-slot": "select-value",
      className: P("flex flex-1 text-left", t),
      ...n
    }
  );
}
function Le({
  className: t,
  size: n = "default",
  children: s,
  ...l
}) {
  return /* @__PURE__ */ a(
    Me.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": n,
      className: P(
        "flex w-fit items-center justify-between gap-1.5 rounded-sm border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-sm-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...l,
      children: [
        s,
        /* @__PURE__ */ e(
          Me.Icon,
          {
            render: /* @__PURE__ */ e(hn, { className: "pointer-events-none size-4 text-muted-foreground" })
          }
        )
      ]
    }
  );
}
function Re({
  className: t,
  children: n,
  side: s = "bottom",
  sideOffset: l = 4,
  align: i = "center",
  alignOffset: r = 0,
  alignItemWithTrigger: o = !0,
  ...c
}) {
  return /* @__PURE__ */ e(Me.Portal, { children: /* @__PURE__ */ e(
    Me.Positioner,
    {
      side: s,
      sideOffset: l,
      align: i,
      alignOffset: r,
      alignItemWithTrigger: o,
      className: "isolate z-50",
      children: /* @__PURE__ */ a(
        Me.Popup,
        {
          "data-slot": "select-content",
          "data-align-trigger": o,
          className: P("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", t),
          ...c,
          children: [
            /* @__PURE__ */ e(Li, {}),
            /* @__PURE__ */ e(Me.List, { children: n }),
            /* @__PURE__ */ e(Ri, {})
          ]
        }
      )
    }
  ) });
}
function ie({
  className: t,
  children: n,
  ...s
}) {
  return /* @__PURE__ */ a(
    Me.Item,
    {
      "data-slot": "select-item",
      className: P(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-sm py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        t
      ),
      ...s,
      children: [
        /* @__PURE__ */ e(Me.ItemText, { className: "flex flex-1 shrink-0 gap-2 whitespace-nowrap", children: n }),
        /* @__PURE__ */ e(
          Me.ItemIndicator,
          {
            render: /* @__PURE__ */ e("span", { className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center" }),
            children: /* @__PURE__ */ e(vs, { className: "pointer-events-none" })
          }
        )
      ]
    }
  );
}
function Li({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    Me.ScrollUpArrow,
    {
      "data-slot": "select-scroll-up-button",
      className: P(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...n,
      children: /* @__PURE__ */ e(
        xs,
        {}
      )
    }
  );
}
function Ri({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    Me.ScrollDownArrow,
    {
      "data-slot": "select-scroll-down-button",
      className: P(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...n,
      children: /* @__PURE__ */ e(
        hn,
        {}
      )
    }
  );
}
function It({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto rounded-lg border border-border/70 bg-card",
      children: /* @__PURE__ */ e(
        "table",
        {
          "data-slot": "table",
          className: P("w-full table-auto caption-bottom text-sm", t),
          ...n
        }
      )
    }
  );
}
function Tt({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "thead",
    {
      "data-slot": "table-header",
      className: P("[&_tr]:border-b", t),
      ...n
    }
  );
}
function Dt({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "tbody",
    {
      "data-slot": "table-body",
      className: P("[&_tr:last-child]:border-0", t),
      ...n
    }
  );
}
function ke({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "tr",
    {
      "data-slot": "table-row",
      className: P(
        "border-b transition-colors hover:bg-muted/35 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        t
      ),
      ...n
    }
  );
}
function oe({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "th",
    {
      "data-slot": "table-head",
      className: P(
        "h-10 px-2 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        t
      ),
      ...n
    }
  );
}
function re({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "td",
    {
      "data-slot": "table-cell",
      className: P(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        t
      ),
      ...n
    }
  );
}
const ra = {
  post: "Post",
  page: "Page",
  category: "Category",
  settings: "Settings",
  user: "User",
  role: "Role",
  permission: "Permissions",
  media: "Media",
  menu: "Menu",
  "menu item": "Menu item",
  profile: "Profile",
  "selected media": "Selected media",
  url: "URL"
}, Mi = {
  create: "created",
  update: "updated",
  delete: "deleted"
}, Y = {
  success(t, n) {
    pt.success(`${ra[n]} ${Mi[t]}.`);
  },
  error(t) {
    pt.error(t);
  },
  close(t) {
    pt.dismiss(t);
  },
  uploaded(t) {
    pt.success(`Uploaded ${t}.`);
  },
  copied(t) {
    pt.success(`${ra[t]} copied.`);
  },
  saved(t) {
    pt.success(`${ra[t]} saved.`);
  }
};
function be(t) {
  if (typeof t != "string") return null;
  const n = t.trim();
  if (!n || /[\u0000-\u001f\u007f\\]/.test(n) || n.startsWith("//")) return null;
  if (n.startsWith("/")) return n;
  try {
    return ["http:", "https:"].includes(new URL(n).protocol) ? n : null;
  } catch {
    return null;
  }
}
function $i({ contentType: t, pageTitle: n }) {
  const [s, l] = d(null), [i, r] = d(null), [o, c] = d([]), [h, m] = d(!1), p = dt(), S = Ze(), { type: y } = qe(), z = t ?? y ?? "post", I = t || y ? `/admin/posts/${z}` : "/admin/posts", [E, M] = d(
    new URLSearchParams(p.search).get("search") ?? ""
  ), [b, g] = d(
    new URLSearchParams(p.search).get("status") ?? "all"
  ), [u, v] = d(
    new URLSearchParams(p.search).get("sortBy") ?? ""
  ), [T, O] = d(
    new URLSearchParams(p.search).get("sortOrder") ?? ""
  );
  async function k() {
    r(null);
    const L = new URLSearchParams();
    E && L.set("search", E), b && b !== "all" && L.set("status", b), u && L.set("sortBy", u), T && L.set("sortOrder", T), L.set("type", z);
    const q = L.toString() ? `?${L.toString()}` : "", Z = await de(`/api/admin/posts${q}`);
    l(Z), c([]);
  }
  te(() => {
    k().catch((L) => r(L.message));
  }, [p.search, z]);
  function N() {
    S(Ce(I, { search: E, status: b, sortBy: u, sortOrder: T }));
  }
  function f(L) {
    const q = u === L && T === "asc" ? "desc" : "asc";
    v(L), O(q), S(Ce(I, { search: E, status: b, sortBy: L, sortOrder: q }));
  }
  function A(L) {
    L.key === "Enter" && (L.preventDefault(), N());
  }
  const j = Oe(!0);
  te(() => {
    if (j.current) {
      j.current = !1;
      return;
    }
    const L = setTimeout(() => {
      N();
    }, 400);
    return () => clearTimeout(L);
  }, [E, b, z]);
  const _ = J((L) => {
    s?.data && c(L ? s.data.map((q) => q.id) : []);
  }, [s]), F = J((L, q) => {
    c(
      (Z) => q ? [...Z, L] : Z.filter((Q) => Q !== L)
    );
  }, []), K = s !== null && s.data.length > 0 && o.length === s.data.length, D = o.length > 0;
  async function w(L) {
    if (o.length === 0) return;
    m(!0);
    const q = await Se(L, { ids: o });
    m(!1), q.success ? (Y.success("update", "post"), await k()) : Y.error(q.message);
  }
  const B = J(async () => {
    o.length !== 0 && confirm(`Delete ${o.length} post(s)? This action cannot be undone.`) && await w("/api/admin/posts/bulk/delete");
  }, [o]), C = J(async () => {
    await w("/api/admin/posts/bulk/publish");
  }, [o]), $ = J(async () => {
    await w("/api/admin/posts/bulk/unpublish");
  }, [o]), W = J(async () => {
    await w("/api/admin/posts/bulk/duplicate");
  }, [o]);
  if (i) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    i
  ] }) });
  if (!s) return /* @__PURE__ */ e(ge, {});
  const U = s.data ?? [];
  function X(L) {
    return Ce(I, { search: E, status: b, sortBy: u, sortOrder: T, page: L });
  }
  return /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: n ?? "Posts",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by title...",
            value: E,
            onChange: (L) => M(L.target.value),
            onKeyDown: A,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ a(fe, { to: `${I}/new`, className: P(kt({ size: "lg" })), children: [
          "New ",
          z.charAt(0).toUpperCase() + z.slice(1)
        ] })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ a(De, { value: b, onValueChange: (L) => {
          L && g(L);
        }, children: [
          /* @__PURE__ */ e(Le, { className: "w-[140px]", children: /* @__PURE__ */ e(Ee, { placeholder: "Status" }) }),
          /* @__PURE__ */ a(Re, { children: [
            /* @__PURE__ */ e(ie, { value: "all", children: "All Status" }),
            /* @__PURE__ */ e(ie, { value: "draft", children: "Draft" }),
            /* @__PURE__ */ e(ie, { value: "published", children: "Published" })
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: N, children: "Filter" })
      ] }),
      D && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          o.length,
          " selected"
        ] }),
        /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: C,
              disabled: h,
              children: "Publish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: $,
              disabled: h,
              children: "Unpublish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: W,
              disabled: h,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: B,
              disabled: h,
              children: "Delete"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => c([]),
              disabled: h,
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ a(It, { children: [
        /* @__PURE__ */ e(Tt, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: K,
              onCheckedChange: (L) => _(L === !0),
              "aria-label": "Select all content"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => f("title"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Title",
                u === "title" ? T === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Visibility" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => f("updatedAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Updated",
                u === "updatedAt" ? T === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Published" })
        ] }) }),
        /* @__PURE__ */ e(Dt, { children: U.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(re, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No content found." }) }) : U.map((L) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(re, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: o.includes(L.id),
              onCheckedChange: (q) => F(L.id, q === !0),
              "aria-label": `Select ${L.title}`
            }
          ) }),
          /* @__PURE__ */ e(re, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
            be(L.featuredImage) ? /* @__PURE__ */ e("img", { src: be(L.featuredImage) ?? void 0, alt: "", className: "size-10 rounded-sm border object-cover" }) : /* @__PURE__ */ e("div", { className: "size-10 rounded-sm border bg-muted" }),
            /* @__PURE__ */ e(fe, { to: `${I}/${L.id}/edit`, className: "underline", children: L.title })
          ] }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(
            He,
            {
              variant: L.status === "published" ? "default" : "secondary",
              className: L.status === "published" ? "border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300" : "capitalize",
              children: L.status
            }
          ) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(L.updatedAt * 1e3).toLocaleDateString() }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: L.publishedAt ? new Date(L.publishedAt).toLocaleDateString() : "—" })
        ] }, L.id)) })
      ] }),
      s.meta && /* @__PURE__ */ a("div", { className: "flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ a("span", { children: [
          "Showing ",
          s.meta.from,
          "–",
          s.meta.to,
          " of ",
          s.meta.total
        ] }),
        /* @__PURE__ */ a("div", { className: "flex gap-2", children: [
          s.meta.currentPage > 1 && /* @__PURE__ */ e(fe, { to: X(s.meta.currentPage - 1), className: "hover:text-foreground hover:underline", children: "Previous" }),
          s.meta.currentPage < s.meta.lastPage && /* @__PURE__ */ e(fe, { to: X(s.meta.currentPage + 1), className: "hover:text-foreground hover:underline", children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
const Oi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminContentListPage: $i
}, Symbol.toStringTag, { value: "Module" }));
function Bi() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), h = dt(), m = Ze(), [p, S] = d(
    new URLSearchParams(h.search).get("search") ?? ""
  ), [y, z] = d(
    new URLSearchParams(h.search).get("roleId") ?? "all"
  ), [I, E] = d(
    new URLSearchParams(h.search).get("sortBy") ?? ""
  ), [M, b] = d(
    new URLSearchParams(h.search).get("sortOrder") ?? ""
  );
  async function g() {
    l(null);
    const w = await de(`/api/admin/users${h.search}`);
    n(w), r([]);
  }
  te(() => {
    g().catch((w) => l(w.message));
  }, [h.search]);
  function u() {
    m(Ce("/admin/users", { search: p, roleId: y, sortBy: I, sortOrder: M }));
  }
  function v(w) {
    const B = I === w && M === "asc" ? "desc" : "asc";
    E(w), b(B), m(Ce("/admin/users", { search: p, roleId: y, sortBy: w, sortOrder: B }));
  }
  function T(w) {
    w.key === "Enter" && (w.preventDefault(), u());
  }
  const O = Oe(!0);
  te(() => {
    if (O.current) {
      O.current = !1;
      return;
    }
    const w = setTimeout(() => {
      u();
    }, 400);
    return () => clearTimeout(w);
  }, [p, y]);
  const k = J((w) => {
    t?.data && r(w ? t.data.map((B) => B.id) : []);
  }, [t]), N = J((w, B) => {
    r(
      (C) => B ? [...C, w] : C.filter(($) => $ !== w)
    );
  }, []), f = t !== null && t.data.length > 0 && i.length === t.data.length, A = i.length > 0;
  async function j(w) {
    if (i.length === 0) return;
    c(!0);
    const B = await Se(w, { ids: i });
    c(!1), B.success ? (Y.success("update", "user"), await g()) : Y.error(B.message);
  }
  const _ = J(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} user(s)? This action cannot be undone.`) && await j("/api/admin/users/bulk/delete");
  }, [i]), F = J(async () => {
    await j("/api/admin/users/bulk/duplicate");
  }, [i]);
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const K = t.data ?? [];
  function D(w) {
    return Ce("/admin/users", { search: p, roleId: y, sortBy: I, sortOrder: M, page: w });
  }
  return /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Users",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by name...",
            value: p,
            onChange: (w) => S(w.target.value),
            onKeyDown: T,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ e(fe, { to: "/admin/users/new", className: P(kt({ size: "lg" })), children: "New User" })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ a(De, { value: y, onValueChange: (w) => {
          w && z(w);
        }, children: [
          /* @__PURE__ */ e(Le, { className: "w-[160px]", children: /* @__PURE__ */ e(Ee, { placeholder: "Role" }) }),
          /* @__PURE__ */ a(Re, { children: [
            /* @__PURE__ */ e(ie, { value: "all", children: "All Roles" }),
            t.roles?.map((w) => /* @__PURE__ */ e(ie, { value: w.id, children: w.name }, w.id))
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: u, children: "Filter" })
      ] }),
      A && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          i.length,
          " selected"
        ] }),
        /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: F,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: _,
              disabled: o,
              children: "Delete"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => r([]),
              disabled: o,
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ a(It, { children: [
        /* @__PURE__ */ e(Tt, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: f,
              onCheckedChange: (w) => k(w === !0),
              "aria-label": "Select all users"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => v("name"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Name",
                I === "name" ? M === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Email" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Role" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => v("updatedAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Updated",
                I === "updatedAt" ? M === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Dt, { children: K.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(re, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No users found." }) }) : K.map((w) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(re, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(w.id),
              onCheckedChange: (B) => N(w.id, B === !0),
              "aria-label": `Select ${w.name}`
            }
          ) }),
          /* @__PURE__ */ e(re, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `/admin/users/${w.id}/edit`, className: "underline", children: w.name }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: w.email }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(He, { variant: "outline", className: "capitalize", children: w.roleName ?? "No role" }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(w.updatedAt * 1e3).toLocaleDateString() })
        ] }, w.id)) })
      ] }),
      t.meta && /* @__PURE__ */ a("div", { className: "flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ a("span", { children: [
          "Showing ",
          t.meta.from,
          "–",
          t.meta.to,
          " of ",
          t.meta.total
        ] }),
        /* @__PURE__ */ a("div", { className: "flex gap-2", children: [
          t.meta.currentPage > 1 && /* @__PURE__ */ e(fe, { to: D(t.meta.currentPage - 1), className: "hover:text-foreground hover:underline", children: "Previous" }),
          t.meta.currentPage < t.meta.lastPage && /* @__PURE__ */ e(fe, { to: D(t.meta.currentPage + 1), className: "hover:text-foreground hover:underline", children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
const ji = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminUsersPage: Bi
}, Symbol.toStringTag, { value: "Module" }));
function Et({
  children: t,
  className: n
}) {
  return /* @__PURE__ */ e("div", { className: P("grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]", n), children: t });
}
function Lt({ children: t, className: n }) {
  return /* @__PURE__ */ e("div", { className: P("min-w-0 space-y-4", n), children: t });
}
function Rt({ children: t, className: n }) {
  return /* @__PURE__ */ e("aside", { className: P("min-w-0 space-y-4", n), children: t });
}
function Ue({
  title: t,
  description: n,
  children: s,
  className: l,
  contentClassName: i
}) {
  return /* @__PURE__ */ a(Ae, { className: P("overflow-hidden border-border/60 shadow-sm", l), children: [
    /* @__PURE__ */ a(ze, { children: [
      /* @__PURE__ */ e(Ie, { className: "text-base", children: t }),
      n ? /* @__PURE__ */ e(Ta, { children: n }) : null
    ] }),
    /* @__PURE__ */ e(Te, { className: P("space-y-5", i), children: s })
  ] });
}
function Pn({ user: t, roles: n = [], mode: s, pageTitle: l }) {
  const [i, r] = wt(), [o, c] = d({}), [h, m] = d(null), [p, S] = d(t?.name ?? ""), [y, z] = d(t?.email ?? ""), [I, E] = d(""), [M, b] = d(t?.roleId ?? ""), g = n.find((v) => v.id === M)?.name;
  function u(v) {
    v.preventDefault(), c({}), m(null);
    const T = {
      name: p,
      email: y
    };
    I && (T.password = I), M && (T.roleId = M), r(async () => {
      let O;
      s === "edit" && t ? O = await rt(`/api/admin/users/${t.id}`, T) : O = await Se("/api/admin/users", T), O.success ? (Y.success(s === "edit" ? "update" : "create", "user"), Fe("/admin/users")) : O.errors && Object.keys(O.errors).length > 0 ? (c(O.errors), Y.error(O.message)) : (m(O.message), Y.error(O.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: u, className: "", children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: l || "Users",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: i, children: i ? s === "edit" ? "Saving…" : "Creating…" : s === "edit" ? "Save Changes" : "Create User" }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Fe("/admin/users"),
              disabled: i,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    h && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: h }),
    /* @__PURE__ */ a(Et, { children: [
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ e(Ue, { title: "User details", children: /* @__PURE__ */ a("div", { className: "grid gap-5", children: [
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a(R, { htmlFor: "name", children: [
            "Name ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "name",
              value: p,
              onChange: (v) => S(v.target.value),
              placeholder: "Full name",
              required: !0,
              maxLength: 100,
              "aria-invalid": !!o.name,
              "aria-describedby": o.name ? "name-error" : void 0
            }
          ),
          o.name && /* @__PURE__ */ e("p", { id: "name-error", className: "text-xs text-destructive", children: o.name[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a(R, { htmlFor: "email", children: [
            "Email ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "email",
              type: "email",
              value: y,
              onChange: (v) => z(v.target.value),
              placeholder: "user@example.com",
              required: !0,
              "aria-invalid": !!o.email,
              "aria-describedby": o.email ? "email-error" : void 0
            }
          ),
          o.email && /* @__PURE__ */ e("p", { id: "email-error", className: "text-xs text-destructive", children: o.email[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a(R, { htmlFor: "password", children: [
            "Password",
            " ",
            s === "create" && /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "password",
              type: "password",
              value: I,
              onChange: (v) => E(v.target.value),
              placeholder: s === "edit" ? "Leave blank to keep current" : "Minimum 12 characters",
              required: s === "create",
              minLength: s === "create" ? 12 : void 0,
              maxLength: 128,
              "aria-invalid": !!o.password,
              "aria-describedby": o.password ? "password-error" : void 0
            }
          ),
          o.password && /* @__PURE__ */ e("p", { id: "password-error", className: "text-xs text-destructive", children: o.password[0] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ e(Rt, { children: /* @__PURE__ */ e(Ue, { title: "Organization", children: /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ e(R, { htmlFor: "role", children: "Role" }),
        n.length > 0 ? /* @__PURE__ */ a(De, { value: M || "none", onValueChange: (v) => b(v === "none" || !v ? "" : v), children: [
          /* @__PURE__ */ e(Le, { id: "role", children: /* @__PURE__ */ e(Ee, { placeholder: "Select role", children: g ?? (M ? "No role" : void 0) }) }),
          /* @__PURE__ */ a(Re, { children: [
            /* @__PURE__ */ e(ie, { value: "none", children: "No role" }),
            n.map((v) => /* @__PURE__ */ e(ie, { value: v.id, children: v.name }, v.id))
          ] })
        ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No roles available." }),
        o.roleId && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: o.roleId[0] })
      ] }) }) })
    ] })
  ] });
}
function Ui() {
  const [t, n] = d([]), [s, l] = d(!0);
  return te(() => {
    de("/api/admin/roles").then((i) => {
      n(i.roles), l(!1);
    });
  }, []), s ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    Pn,
    {
      mode: "create",
      roles: t,
      pageTitle: "Create User"
    }
  ) });
}
function Fi({ id: t }) {
  const [n, s] = d(null), [l, i] = d([]), [r, o] = d(!0);
  return te(() => {
    Promise.all([
      de(`/api/admin/users/${t}`),
      de("/api/admin/roles")
    ]).then(([c, h]) => {
      s(c), i(h.roles), o(!1);
    });
  }, [t]), r ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    Pn,
    {
      mode: "edit",
      user: n,
      roles: l,
      pageTitle: "Edit User"
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "User not found." });
}
const _n = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminUserCreatePage: Ui,
  AdminUserEditPage: Fi
}, Symbol.toStringTag, { value: "Module" }));
function An({
  onUploadComplete: t,
  onUploadError: n,
  accept: s,
  className: l,
  compact: i = !1
}) {
  const [r, o] = d(!1), [c, h] = d([]), m = Oe(null), p = J((b) => {
    b.preventDefault(), b.stopPropagation(), o(!0);
  }, []), S = J((b) => {
    b.preventDefault(), b.stopPropagation(), o(!1);
  }, []), y = J(
    async (b) => {
      const g = Math.random().toString(36).slice(2);
      h((u) => [...u, { id: g, file: b, progress: 0 }]);
      try {
        const u = new FormData();
        u.append("file", b);
        const T = await (await fetch("/api/admin/media/upload", {
          method: "POST",
          body: u
        })).json();
        if (!T.success) {
          const O = T.message || "Upload failed";
          return h(
            (k) => k.map(
              (N) => N.id === g ? { ...N, error: O } : N
            )
          ), n?.(O), Y.error(O), null;
        }
        return h((O) => O.filter((k) => k.id !== g)), t?.(T.data), Y.uploaded(b.name), T.data;
      } catch {
        const u = "Upload failed. Please try again.";
        return h(
          (v) => v.map(
            (T) => T.id === g ? { ...T, error: u } : T
          )
        ), n?.(u), Y.error(u), null;
      }
    },
    [t, n]
  ), z = J(
    async (b) => {
      b.preventDefault(), b.stopPropagation(), o(!1);
      const g = Array.from(b.dataTransfer.files);
      if (g.length !== 0)
        for (const u of g)
          s && !Hi(u.type, s) || await y(u);
    },
    [s, y]
  ), I = J(
    async (b) => {
      const g = Array.from(b.target.files || []);
      if (g.length !== 0) {
        for (const u of g)
          await y(u);
        m.current && (m.current.value = "");
      }
    },
    [y]
  ), E = J(() => {
    m.current?.click();
  }, []), M = J((b) => {
    h((g) => g.filter((u) => u.id !== b));
  }, []);
  return /* @__PURE__ */ a("div", { className: P("space-y-2", l), children: [
    /* @__PURE__ */ a(
      "div",
      {
        onDragOver: p,
        onDragLeave: S,
        onDrop: z,
        onClick: E,
        role: "button",
        tabIndex: 0,
        onKeyDown: (b) => {
          (b.key === "Enter" || b.key === " ") && (b.preventDefault(), E());
        },
        "aria-label": "Upload media files",
        className: P(
          "relative cursor-pointer rounded-sm border-2 border-dashed transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          r && "border-primary bg-primary/5",
          i ? "p-4" : "p-8",
          "flex flex-col items-center justify-center gap-2 text-center"
        ),
        children: [
          /* @__PURE__ */ e(
            ys,
            {
              className: P(
                "text-muted-foreground",
                i ? "h-5 w-5" : "h-8 w-8"
              )
            }
          ),
          !i && /* @__PURE__ */ a(Ge, { children: [
            /* @__PURE__ */ e("p", { className: "text-sm font-medium", children: "Drag & drop files here, or click to browse" }),
            /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Max 10MB per file. Supported: images, PDF, video, audio." })
          ] }),
          i && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Drop files or click to upload" })
        ]
      }
    ),
    /* @__PURE__ */ e(
      "input",
      {
        ref: m,
        type: "file",
        multiple: !0,
        accept: s,
        onChange: I,
        className: "hidden",
        "aria-hidden": "true"
      }
    ),
    c.length > 0 && /* @__PURE__ */ e("div", { className: "space-y-1", children: c.map((b) => /* @__PURE__ */ a(
      "div",
      {
        className: P(
          "flex items-center gap-2 rounded-sm border px-3 py-2 text-sm",
          b.error ? "border-destructive/50 bg-destructive/10" : "border-border"
        ),
        children: [
          b.error ? /* @__PURE__ */ e(Nt, { className: "h-4 w-4 text-destructive" }) : /* @__PURE__ */ e(gn, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
          /* @__PURE__ */ a("span", { className: "flex-1 truncate", children: [
            b.file.name,
            b.error && /* @__PURE__ */ e("span", { className: "ml-2 text-destructive", children: b.error })
          ] }),
          b.error && /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "icon-sm",
              onClick: (g) => {
                g.stopPropagation(), M(b.id);
              },
              children: /* @__PURE__ */ e(Vt, { className: "h-3 w-3" })
            }
          )
        ]
      },
      b.id
    )) })
  ] });
}
function Hi(t, n) {
  return n ? n.split(",").map((l) => l.trim()).some((l) => {
    if (l.endsWith("/*")) {
      const i = l.replace("/*", "/");
      return t.startsWith(i);
    }
    return t === l;
  }) : !0;
}
function zn({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "skeleton",
      className: P("animate-pulse rounded-sm bg-muted", t),
      ...n
    }
  );
}
function Vi() {
  const t = dt(), n = Ze(), [s, l] = d(null), [i, r] = d(!1), [o, c] = d(
    new URLSearchParams(t.search).get("search") ?? ""
  ), [h, m] = d(1), [p, S] = d(/* @__PURE__ */ new Set()), [y, z] = d([]);
  function I(f) {
    const A = h, j = new URLSearchParams(t.search);
    o && j.set("search", o), j.set("page", String(A)), j.set("perPage", "30"), de(`/api/admin/media?${j.toString()}`).then(l);
  }
  te(() => {
    I();
  }, [t.search, h]);
  const E = Oe(!0);
  te(() => {
    if (E.current) {
      E.current = !1;
      return;
    }
    const f = setTimeout(() => {
      const A = new URLSearchParams(t.search);
      o ? A.set("search", o) : A.delete("search"), A.delete("page"), m(1), n(`/admin/media?${A.toString()}`);
    }, 400);
    return () => clearTimeout(f);
  }, [o]);
  function M(f, A) {
    confirm(`Delete "${A}"?`) && Cn(`/api/admin/media/${f}`).then((j) => {
      j.success ? (Y.success("delete", "media"), I()) : Y.error(j.message);
    });
  }
  const b = s != null && s.data.length > 0 && y.length === s.data.length, g = y.length > 0;
  function u(f) {
    !s?.data || s == null || z(f ? s.data.map((A) => A.id) : []);
  }
  function v(f, A) {
    z(A ? (j) => [...j, f] : (j) => j.filter((_) => _ !== f));
  }
  function T() {
    z([]);
  }
  function O() {
    y.length !== 0 && confirm(`Delete ${y.length} item(s)? This cannot be undone.`) && Se("/api/admin/media/bulk/delete", { ids: y }).then((f) => {
      f.success ? (Y.success("delete", "selected media"), z([]), I()) : Y.error(f.message);
    });
  }
  function k(f) {
    navigator.clipboard.writeText(f).then(() => Y.copied("url"));
  }
  function N(f) {
    return f < 1024 ? `${f} B` : f < 1024 * 1024 ? `${(f / 1024).toFixed(1)} KB` : `${(f / (1024 * 1024)).toFixed(1)} MB`;
  }
  return /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Media",
        search: /* @__PURE__ */ a("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ e(pn, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ e(
            G,
            {
              value: o,
              onChange: (f) => c(f.target.value),
              placeholder: "Search media…",
              className: "pl-8"
            }
          )
        ] }),
        actions: /* @__PURE__ */ e(x, { type: "button", size: "lg", onClick: () => r((f) => !f), children: i ? "Hide Upload" : "Upload" })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      i && /* @__PURE__ */ e(An, { onUploadComplete: () => {
        r(!1), I();
      } }),
      g && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          y.length,
          " selected"
        ] }),
        /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ a(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: O,
              children: [
                /* @__PURE__ */ e(we, { className: "mr-1 h-4 w-4" }),
                "Delete"
              ]
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "sm",
              onClick: T,
              children: "Clear"
            }
          )
        ] })
      ] }),
      s ? s.data.length === 0 ? /* @__PURE__ */ a("div", { className: "flex flex-col items-center justify-center py-16", children: [
        /* @__PURE__ */ e(At, { className: "h-12 w-12 text-muted-foreground/40" }),
        /* @__PURE__ */ e("p", { className: "mt-3 text-sm text-muted-foreground", children: "No media found." })
      ] }) : /* @__PURE__ */ a(Ge, { children: [
        /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            xe,
            {
              checked: b,
              onCheckedChange: (f) => u(f === !0),
              "aria-label": "Select all media"
            }
          ),
          /* @__PURE__ */ e("span", { className: "text-xs text-muted-foreground", children: b ? `${y.length} selected` : "Select all" })
        ] }),
        /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: s.data.map((f) => {
          const A = f.mimeType.startsWith("image/"), j = p.has(f.id);
          return /* @__PURE__ */ a(
            "div",
            {
              className: "group relative overflow-hidden rounded-sm border bg-muted/30",
              children: [
                /* @__PURE__ */ a("div", { className: "aspect-square", children: [
                  A && !j ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: be(f.thumbnailUrl || f.url) ?? void 0,
                      alt: f.alt || f.name,
                      className: "h-full w-full object-cover",
                      onError: () => S((_) => new Set(_).add(f.id))
                    }
                  ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(Nt, { className: "h-10 w-10 text-muted-foreground/50" }) }),
                  /* @__PURE__ */ e(
                    "div",
                    {
                      className: P(
                        "absolute top-1.5 left-1.5 z-10",
                        !g && "opacity-0 group-hover:opacity-100 transition-opacity"
                      ),
                      onClick: (_) => _.stopPropagation(),
                      children: /* @__PURE__ */ e(
                        xe,
                        {
                          checked: y.includes(f.id),
                          onCheckedChange: (_) => v(f.id, _ === !0),
                          "aria-label": `Select ${f.name}`
                        }
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ e("div", { className: "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100", children: /* @__PURE__ */ a("div", { className: "flex items-center justify-end gap-1 p-2", children: [
                  /* @__PURE__ */ e(
                    x,
                    {
                      type: "button",
                      size: "icon-sm",
                      variant: "ghost",
                      onClick: () => k(f.url),
                      className: "h-8 w-8 text-white hover:bg-white/20",
                      "aria-label": "Copy URL",
                      children: /* @__PURE__ */ e(wa, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ e(
                    x,
                    {
                      type: "button",
                      size: "icon-sm",
                      variant: "ghost",
                      onClick: () => M(f.id, f.name),
                      className: "h-8 w-8 text-white hover:bg-destructive/80",
                      "aria-label": "Delete",
                      children: /* @__PURE__ */ e(we, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }) }),
                /* @__PURE__ */ a("div", { className: "px-2.5 py-2", children: [
                  /* @__PURE__ */ e("p", { className: "truncate text-xs font-medium", children: f.name }),
                  /* @__PURE__ */ a("p", { className: "text-[11px] text-muted-foreground", children: [
                    f.mimeType,
                    " · ",
                    N(f.size),
                    f.width && f.height && ` · ${f.width}×${f.height}`
                  ] })
                ] })
              ]
            },
            f.id
          );
        }) })
      ] }) : /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: Array.from({ length: 12 }).map((f, A) => /* @__PURE__ */ e(zn, { className: "aspect-square rounded-sm" }, A)) }),
      s && s.meta.lastPage > 1 && /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-3 pt-2", children: [
        /* @__PURE__ */ e(
          x,
          {
            variant: "outline",
            size: "sm",
            disabled: h <= 1,
            onClick: () => m((f) => Math.max(1, f - 1)),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          "Page ",
          s.meta.currentPage,
          " of ",
          s.meta.lastPage
        ] }),
        /* @__PURE__ */ e(
          x,
          {
            variant: "outline",
            size: "sm",
            disabled: h >= s.meta.lastPage,
            onClick: () => m((f) => f + 1),
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
const Gi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminMediaPage: Vi
}, Symbol.toStringTag, { value: "Module" }));
function qi() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), h = dt(), m = Ze(), { type: p = "post" } = qe(), [S, y] = d(
    new URLSearchParams(h.search).get("search") ?? ""
  ), [z, I] = d(
    new URLSearchParams(h.search).get("sortBy") ?? ""
  ), [E, M] = d(
    new URLSearchParams(h.search).get("sortOrder") ?? ""
  );
  async function b() {
    l(null);
    const D = new URLSearchParams();
    S && D.set("search", S), z && D.set("sortBy", z), E && D.set("sortOrder", E), D.set("type", p);
    const w = D.toString() ? `?${D.toString()}` : "", B = await de(`/api/admin/categories${w}`);
    n(B), r([]);
  }
  te(() => {
    b().catch((D) => l(D.message));
  }, [h.search, p]);
  function g() {
    m(Ce(`/admin/categories/${p}`, { search: S, sortBy: z, sortOrder: E }));
  }
  function u(D) {
    const w = z === D && E === "asc" ? "desc" : "asc";
    I(D), M(w), m(Ce(`/admin/categories/${p}`, { search: S, sortBy: D, sortOrder: w }));
  }
  function v(D) {
    D.key === "Enter" && (D.preventDefault(), g());
  }
  const T = Oe(!0);
  te(() => {
    if (T.current) {
      T.current = !1;
      return;
    }
    const D = setTimeout(() => {
      g();
    }, 400);
    return () => clearTimeout(D);
  }, [S]);
  const O = J((D) => {
    t && r(D ? t.map((w) => w.id) : []);
  }, [t]), k = J((D, w) => {
    r(
      (B) => w ? [...B, D] : B.filter((C) => C !== D)
    );
  }, []), N = t !== null && t.length > 0 && i.length === t.length, f = i.length > 0;
  async function A(D, w = {}) {
    if (i.length === 0) return;
    c(!0);
    const B = await Se(D, { ids: i, ...w });
    c(!1), B.success ? (Y.success("update", "category"), await b()) : Y.error(B.message);
  }
  const j = J(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} category(ies)? This action cannot be undone.`) && await A("/api/admin/categories/bulk/delete");
  }, [i]), _ = J(async () => {
    await A("/api/admin/categories/bulk/duplicate");
  }, [i]), F = J(async (D) => {
    await A("/api/admin/categories/bulk/status", { status: D });
  }, [i]);
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const K = t;
  return /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Categories",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by name...",
            value: S,
            onChange: (D) => y(D.target.value),
            onKeyDown: v,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ e(fe, { to: `/admin/categories/${p}/new`, className: P(kt({ size: "lg" })), children: "New Category" })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ e("div", { className: "flex flex-wrap items-center gap-3", children: /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: g, children: "Filter" }) }),
      f && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          i.length,
          " selected"
        ] }),
        /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: _,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(x, { variant: "outline", size: "sm", onClick: () => F("published"), disabled: o, children: "Publish" }),
          /* @__PURE__ */ e(x, { variant: "outline", size: "sm", onClick: () => F("draft"), disabled: o, children: "Unpublish" }),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: j,
              disabled: o,
              children: "Delete"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => r([]),
              disabled: o,
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ a(It, { children: [
        /* @__PURE__ */ e(Tt, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: N,
              onCheckedChange: (D) => O(D === !0),
              "aria-label": "Select all categories"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => u("name"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Name",
                z === "name" ? E === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Slug" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Status" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => u("createdAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Created",
                z === "createdAt" ? E === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Dt, { children: K.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(re, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No categories found." }) }) : K.map((D) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(re, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(D.id),
              onCheckedChange: (w) => k(D.id, w === !0),
              "aria-label": `Select ${D.name}`
            }
          ) }),
          /* @__PURE__ */ e(re, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `/admin/categories/${D.id}/edit`, className: "underline", children: D.name }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: D.slug }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(He, { variant: D.status === "published" ? "secondary" : "outline", children: D.status === "published" ? "Published" : "Unpublished" }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(D.createdAt * 1e3).toLocaleDateString() })
        ] }, D.id)) })
      ] })
    ] })
  ] });
}
const Ki = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminCategoriesPage: qi
}, Symbol.toStringTag, { value: "Module" }));
function ut(t) {
  return /* @__PURE__ */ e(ve.Root, { "data-slot": "dialog", ...t });
}
function Mt({ ...t }) {
  return /* @__PURE__ */ e(ve.Trigger, { "data-slot": "dialog-trigger", ...t });
}
function Wi({ ...t }) {
  return /* @__PURE__ */ e(ve.Portal, { "data-slot": "dialog-portal", ...t });
}
function Ji({ ...t }) {
  return /* @__PURE__ */ e(ve.Close, { "data-slot": "dialog-close", ...t });
}
function Yi({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    ve.Backdrop,
    {
      "data-slot": "dialog-overlay",
      className: P(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        t
      ),
      ...n
    }
  );
}
function mt({
  className: t,
  children: n,
  showCloseButton: s = !0,
  ...l
}) {
  return /* @__PURE__ */ a(Wi, { children: [
    /* @__PURE__ */ e(Yi, {}),
    /* @__PURE__ */ a(
      ve.Popup,
      {
        "data-slot": "dialog-content",
        className: P(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-sm bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          t
        ),
        ...l,
        children: [
          n,
          s && /* @__PURE__ */ a(
            ve.Close,
            {
              "data-slot": "dialog-close",
              render: /* @__PURE__ */ e(
                x,
                {
                  variant: "ghost",
                  className: "absolute top-2 right-2",
                  size: "icon-sm"
                }
              ),
              children: [
                /* @__PURE__ */ e(
                  dn,
                  {}
                ),
                /* @__PURE__ */ e("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function ht({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "dialog-header",
      className: P("flex flex-col gap-2", t),
      ...n
    }
  );
}
function St({
  className: t,
  showCloseButton: n = !1,
  children: s,
  ...l
}) {
  return /* @__PURE__ */ a(
    "div",
    {
      "data-slot": "dialog-footer",
      className: P(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-sm border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        t
      ),
      ...l,
      children: [
        s,
        n && /* @__PURE__ */ e(ve.Close, { render: /* @__PURE__ */ e(x, { variant: "outline" }), children: "Close" })
      ]
    }
  );
}
function gt({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    ve.Title,
    {
      "data-slot": "dialog-title",
      className: P(
        "font-heading text-base leading-none font-medium",
        t
      ),
      ...n
    }
  );
}
function Da({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    ve.Description,
    {
      "data-slot": "dialog-description",
      className: P(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        t
      ),
      ...n
    }
  );
}
function Ut({
  className: t,
  orientation: n = "horizontal",
  ...s
}) {
  return /* @__PURE__ */ e(
    Xt.Root,
    {
      "data-slot": "tabs",
      "data-orientation": n,
      className: P(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        t
      ),
      ...s
    }
  );
}
const Xi = zt(
  "group/tabs-list flex max-w-full flex-wrap items-center gap-2 rounded-sm p-2 text-muted-foreground group-data-horizontal/tabs:h-auto group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        line: "bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Ft({
  className: t,
  variant: n = "default",
  ...s
}) {
  return /* @__PURE__ */ e(
    Xt.List,
    {
      "data-slot": "tabs-list",
      "data-variant": n,
      className: P(Xi({ variant: n }), t),
      ...s
    }
  );
}
function We({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    Xt.Tab,
    {
      "data-slot": "tabs-trigger",
      className: P(
        "relative inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium whitespace-nowrap text-foreground/70 transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:border-foreground/25 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:border-border dark:group-data-[variant=line]/tabs-list:data-active:border-border dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:border-foreground/20 data-active:bg-muted data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        t
      ),
      ...n
    }
  );
}
function Je({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    Xt.Panel,
    {
      "data-slot": "tabs-content",
      className: P("flex-1 text-sm outline-none", t),
      ...n
    }
  );
}
function Ve({
  value: t,
  onChange: n,
  onSelect: s,
  accept: l,
  multiple: i = !1,
  maxFiles: r = 10,
  trigger: o
}) {
  const [c, h] = d(!1);
  return /* @__PURE__ */ a(ut, { open: c, onOpenChange: h, children: [
    /* @__PURE__ */ e(
      Mt,
      {
        render: o || /* @__PURE__ */ a(x, { type: "button", variant: "outline", className: "gap-2", children: [
          /* @__PURE__ */ e(At, { className: "h-4 w-4" }),
          t ? "Change Media" : "Select Media"
        ] })
      }
    ),
    /* @__PURE__ */ e(
      Qi,
      {
        open: c,
        onSelect: (m) => {
          i && s?.(m), m.length > 0 && n(m[0]), h(!1);
        },
        accept: l,
        multiple: i,
        maxFiles: r
      }
    )
  ] });
}
function Qi({
  open: t,
  onSelect: n,
  accept: s,
  multiple: l = !1,
  maxFiles: i = 10
}) {
  const [r, o] = d([]), [c, h] = d(!1), [m, p] = d(""), [S, y] = d(""), [z, I] = d(s ?? "all"), [E, M] = d(1), [b, g] = d(1), [u, v] = d([]), [T, O] = d("library");
  te(() => {
    t && N();
  }, [t, S, z, E]);
  const k = Oe(!0);
  te(() => {
    if (k.current) {
      k.current = !1;
      return;
    }
    const _ = setTimeout(() => {
      M(1), y(m);
    }, 400);
    return () => clearTimeout(_);
  }, [m]), te(() => {
    t && (v([]), O("library"), M(1));
  }, [t]);
  async function N() {
    h(!0);
    try {
      const _ = new URLSearchParams();
      S && _.set("search", S), _.set("page", String(E)), _.set("perPage", "24"), z && z !== "all" && _.set("mimeType", z);
      const F = await de(`/api/admin/media?${_.toString()}`);
      o(F.data), g(F.meta.lastPage ?? 1);
    } catch {
      o([]), g(1);
    }
    h(!1);
  }
  function f(_) {
    v(l ? (F) => F.find((D) => D.id === _.id) ? F.filter((D) => D.id !== _.id) : F.length >= i ? F : [...F, _] : [_]);
  }
  function A() {
    n(u);
  }
  function j(_) {
    v(l ? (F) => F.length >= i ? F : [...F, _] : [_]), O("library"), N();
  }
  return /* @__PURE__ */ a(mt, { className: "sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "Select Media" }) }),
    /* @__PURE__ */ a(Ut, { value: T, onValueChange: O, className: "flex-1 overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ a(Ft, { children: [
        /* @__PURE__ */ e(We, { value: "library", children: "Media Library" }),
        /* @__PURE__ */ e(We, { value: "upload", children: "Upload" })
      ] }),
      /* @__PURE__ */ a(Je, { value: "library", className: "flex-1 overflow-hidden flex flex-col mt-3", children: [
        /* @__PURE__ */ a("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ a("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ e(pn, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ e(
              G,
              {
                value: m,
                onChange: (_) => p(_.target.value),
                placeholder: "Search…",
                className: "pl-8 h-8"
              }
            )
          ] }),
          !s && /* @__PURE__ */ a(De, { value: z, onValueChange: (_) => {
            _ && (I(_), M(1));
          }, children: [
            /* @__PURE__ */ e(Le, { className: "w-[120px] h-8", children: /* @__PURE__ */ e(Ee, { placeholder: "All types" }) }),
            /* @__PURE__ */ a(Re, { children: [
              /* @__PURE__ */ e(ie, { value: "all", children: "All types" }),
              /* @__PURE__ */ e(ie, { value: "image/*", children: "Images" }),
              /* @__PURE__ */ e(ie, { value: "video/mp4", children: "Video" }),
              /* @__PURE__ */ e(ie, { value: "application/pdf", children: "PDF" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex-1 overflow-y-auto", children: c ? /* @__PURE__ */ e("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ e("div", { className: "grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: Array.from({ length: 6 }).map((_, F) => /* @__PURE__ */ e(zn, { className: "aspect-square w-full rounded-sm" }, F)) }) }) : r.length === 0 ? /* @__PURE__ */ a("div", { className: "flex flex-col items-center justify-center py-12", children: [
          /* @__PURE__ */ e(Nt, { className: "h-10 w-10 text-muted-foreground/50" }),
          /* @__PURE__ */ e("p", { className: "mt-2 text-sm text-muted-foreground", children: "No media found." })
        ] }) : /* @__PURE__ */ e("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: r.map((_) => {
          const F = u.some((K) => K.id === _.id);
          return /* @__PURE__ */ e(
            Zi,
            {
              item: _,
              isSelected: F,
              onClick: () => f(_)
            },
            _.id
          );
        }) }) }),
        b > 1 && /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-2 pt-2 border-t mt-2", children: [
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              disabled: E <= 1,
              onClick: () => M((_) => Math.max(1, _ - 1)),
              children: "Previous"
            }
          ),
          /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
            "Page ",
            E,
            " of ",
            b
          ] }),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              disabled: E >= b,
              onClick: () => M((_) => _ + 1),
              children: "Next"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e(Je, { value: "upload", className: "mt-3", children: /* @__PURE__ */ e(
        An,
        {
          onUploadComplete: j,
          accept: s
        }
      ) })
    ] }),
    u.length > 0 && /* @__PURE__ */ a("div", { className: "border-t pt-3 mt-2", children: [
      !l && u.length === 1 && /* @__PURE__ */ e(el, { item: u[0] }),
      l && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 flex-wrap", children: [
        u.map((_) => /* @__PURE__ */ a(
          "div",
          {
            className: "relative h-10 w-10 rounded-sm border overflow-hidden",
            children: [
              _.mimeType.startsWith("image/") ? /* @__PURE__ */ e(
                "img",
                {
                  src: be(_.thumbnailUrl || _.url) ?? void 0,
                  alt: _.alt || _.name,
                  className: "object-cover h-full w-full"
                }
              ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(Nt, { className: "h-4 w-4 text-muted-foreground" }) }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => v(
                    (F) => F.filter((K) => K.id !== _.id)
                  ),
                  className: "absolute -top-1 -right-1 rounded-sm bg-destructive p-0.5 text-destructive-foreground",
                  children: /* @__PURE__ */ e(Vt, { className: "h-2.5 w-2.5" })
                }
              )
            ]
          },
          _.id
        )),
        /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
          u.length,
          " selected",
          i && ` (max ${i})`
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e(St, { children: /* @__PURE__ */ e(
      x,
      {
        onClick: A,
        disabled: u.length === 0,
        children: l ? `Insert Selected (${u.length})` : "Insert"
      }
    ) })
  ] });
}
function Zi({
  item: t,
  isSelected: n,
  onClick: s
}) {
  const [l, i] = d(!1), r = t.mimeType.startsWith("image/");
  return /* @__PURE__ */ a(
    "button",
    {
      type: "button",
      onClick: s,
      className: P(
        "relative aspect-square overflow-hidden rounded-sm border transition-all",
        "hover:ring-2 hover:ring-primary/50",
        n && "ring-2 ring-primary"
      ),
      "aria-label": t.name,
      "aria-selected": n,
      children: [
        r && !l ? /* @__PURE__ */ e(
          "img",
          {
            src: be(t.thumbnailUrl || t.url) ?? void 0,
            alt: t.alt || t.name,
            className: "object-cover h-full w-full",
            onError: () => i(!0)
          }
        ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(Nt, { className: "h-6 w-6 text-muted-foreground/60" }) }),
        n && /* @__PURE__ */ e("div", { className: "absolute inset-0 flex items-center justify-center bg-primary/20", children: /* @__PURE__ */ e("div", { className: "rounded-sm bg-primary p-1", children: /* @__PURE__ */ e(Ht, { className: "h-3 w-3 text-primary-foreground" }) }) }),
        /* @__PURE__ */ e("div", { className: "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1", children: /* @__PURE__ */ e("p", { className: "truncate text-[9px] text-white", children: t.name }) })
      ]
    }
  );
}
function el({ item: t }) {
  return /* @__PURE__ */ a("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ e("div", { className: "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted", children: t.mimeType.startsWith("image/") ? /* @__PURE__ */ e(
      "img",
      {
        src: be(t.thumbnailUrl || t.url) ?? void 0,
        alt: t.alt || t.name,
        className: "object-cover h-full w-full"
      }
    ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e(Nt, { className: "h-6 w-6 text-muted-foreground/60" }) }) }),
    /* @__PURE__ */ a("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ e("p", { className: "truncate text-sm font-medium", children: t.name }),
      /* @__PURE__ */ a("p", { className: "text-xs text-muted-foreground", children: [
        t.mimeType,
        " · ",
        tl(t.size),
        t.width && t.height && ` · ${t.width}×${t.height}`
      ] })
    ] })
  ] });
}
function tl(t) {
  return t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${(t / 1024).toFixed(1)} KB` : `${(t / (1024 * 1024)).toFixed(1)} MB`;
}
function al({
  item: t,
  maxDepth: n,
  onToggleCollapse: s,
  onEdit: l,
  onDelete: i,
  onKeyAction: r
}) {
  const { session: o } = et(), [c, h] = d(!1), [m, p] = d(t.title), [S, y] = d(t.url), [z, I] = d(t.cssClass ?? ""), [E, M] = d(t.target ?? ""), [b, g] = d(t.image ?? ""), [u, v] = d(t.status), T = o?.permissions.includes("menus.publish") ?? !1, O = o?.permissions.includes("menus.unpublish") ?? !1, k = u === "published" ? O : T, {
    attributes: N,
    listeners: f,
    setNodeRef: A,
    setActivatorNodeRef: j,
    transform: _,
    transition: F,
    isDragging: K
  } = qt({ id: t.id }), D = {
    transform: Wt.Transform.toString(_),
    transition: F,
    marginLeft: `${t.depth * 30}px`
  }, w = J(() => {
    l(t.id, {
      title: m,
      url: S,
      cssClass: z,
      target: E,
      image: b,
      status: u
    }), h(!1);
  }, [t.id, m, S, z, E, b, u, l]), B = J(() => {
    p(t.title), y(t.url), I(t.cssClass ?? ""), M(t.target ?? ""), g(t.image ?? ""), v(t.status), h(!1);
  }, [t]), C = J(() => {
    p(t.title), y(t.url), I(t.cssClass ?? ""), M(t.target ?? ""), g(t.image ?? ""), v(t.status), h(!0);
  }, [t]), $ = J(
    (U) => {
      if (!c)
        switch (U.key) {
          case "ArrowUp":
            U.preventDefault(), r(t.id, "moveUp");
            break;
          case "ArrowDown":
            U.preventDefault(), r(t.id, "moveDown");
            break;
          case "Tab":
            U.preventDefault(), U.shiftKey ? r(t.id, "outdent") : r(t.id, "indent");
            break;
          case "Enter":
            U.preventDefault(), C();
            break;
          case "Delete":
            U.preventDefault(), confirm("Delete this menu item?") && i(t.id);
            break;
        }
    },
    [c, t.id, r, C, i]
  ), W = t.depth >= n - 1;
  return /* @__PURE__ */ a(
    "div",
    {
      ref: A,
      style: D,
      ...N,
      className: P(
        "rounded-sm border bg-background transition-shadow",
        K && "opacity-50 shadow-lg",
        W && "border-amber-300/50"
      ),
      role: "listitem",
      tabIndex: 0,
      onKeyDown: $,
      "aria-label": `Menu item: ${t.title}`,
      children: [
        /* @__PURE__ */ a("div", { className: "flex items-center gap-2 p-3", children: [
          /* @__PURE__ */ e(
            "button",
            {
              ref: j,
              className: "cursor-grab touch-none text-muted-foreground hover:text-foreground",
              "aria-label": "Drag to reorder",
              ...f,
              children: /* @__PURE__ */ e(Gt, { className: "h-4 w-4" })
            }
          ),
          t.children.length > 0 ? /* @__PURE__ */ e(
            "button",
            {
              onClick: () => s(t.id),
              className: "text-muted-foreground hover:text-foreground",
              "aria-label": t.collapsed ? "Expand children" : "Collapse children",
              children: t.collapsed ? /* @__PURE__ */ e(Ns, { className: "h-4 w-4" }) : /* @__PURE__ */ e(Ct, { className: "h-4 w-4" })
            }
          ) : /* @__PURE__ */ e("span", { className: "w-4" }),
          /* @__PURE__ */ a("div", { className: "flex-1 min-w-0", children: [
            be(t.image) ? /* @__PURE__ */ e("img", { src: be(t.image) ?? void 0, alt: "", className: "mr-2 inline-block size-8 rounded-sm object-cover" }) : null,
            /* @__PURE__ */ e("span", { className: "font-medium text-sm", children: t.title }),
            /* @__PURE__ */ e("span", { className: "ml-2 text-xs text-muted-foreground truncate", children: t.url.length > 40 ? t.url.slice(0, 40) + "…" : t.url }),
            /* @__PURE__ */ e(He, { variant: t.status === "published" ? "secondary" : "outline", className: "ml-2", children: t.status === "published" ? "Published" : "Unpublished" })
          ] }),
          W && /* @__PURE__ */ e("span", { className: "text-xs text-amber-600", title: "Maximum depth reached", children: "Max depth" }),
          /* @__PURE__ */ a("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ e(
              x,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: C,
                "aria-label": "Edit menu item",
                children: /* @__PURE__ */ e(fn, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ e(
              x,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 text-destructive hover:text-destructive",
                onClick: () => {
                  confirm("Delete this menu item?") && i(t.id);
                },
                "aria-label": "Delete menu item",
                children: /* @__PURE__ */ e(we, { className: "h-3.5 w-3.5" })
              }
            )
          ] })
        ] }),
        c && /* @__PURE__ */ a("div", { className: "border-t p-3 space-y-3", children: [
          /* @__PURE__ */ a("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(R, { htmlFor: `edit-title-${t.id}`, children: "Title" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-title-${t.id}`,
                  value: m,
                  onChange: (U) => p(U.target.value),
                  placeholder: "Title"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(R, { children: "Image" }),
              /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                b ? /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: be(b) ?? void 0, alt: "", className: "h-full w-full object-cover" }) }) : null,
                /* @__PURE__ */ e(Ve, { value: b || null, onChange: (U) => g(U?.url ?? ""), accept: "image/*" }),
                b ? /* @__PURE__ */ e(
                  x,
                  {
                    type: "button",
                    variant: "outline",
                    "aria-label": "Remove image",
                    className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive",
                    onClick: () => g(""),
                    children: "Remove"
                  }
                ) : null
              ] })
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(R, { htmlFor: `edit-url-${t.id}`, children: "URL" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-url-${t.id}`,
                  value: S,
                  onChange: (U) => y(U.target.value),
                  placeholder: "/url"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(R, { htmlFor: `edit-css-${t.id}`, children: "CSS Class" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-css-${t.id}`,
                  value: z,
                  onChange: (U) => I(U.target.value),
                  placeholder: "Optional CSS class"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(R, { htmlFor: `edit-target-${t.id}`, children: "Target" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-target-${t.id}`,
                  value: E,
                  onChange: (U) => M(U.target.value),
                  placeholder: "_blank, _self, etc."
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(R, { htmlFor: `edit-status-${t.id}`, children: "Status" }),
              /* @__PURE__ */ a("select", { id: `edit-status-${t.id}`, value: u, disabled: !k, onChange: (U) => v(U.target.value), className: "h-9 w-full rounded-sm border bg-background px-3 text-sm disabled:opacity-60", children: [
                /* @__PURE__ */ e("option", { value: "published", disabled: !T && u !== "published", children: "Published" }),
                /* @__PURE__ */ e("option", { value: "draft", disabled: !O && u !== "draft", children: "Unpublished" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ a("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ a(x, { size: "sm", onClick: w, children: [
              /* @__PURE__ */ e(Ht, { className: "h-3.5 w-3.5 mr-1" }),
              "Apply"
            ] }),
            /* @__PURE__ */ a(x, { size: "sm", variant: "ghost", onClick: B, children: [
              /* @__PURE__ */ e(Vt, { className: "h-3.5 w-3.5 mr-1" }),
              "Cancel"
            ] })
          ] })
        ] })
      ]
    }
  );
}
function Ea(t, n = null, s = 0, l = /* @__PURE__ */ new Set()) {
  const i = [];
  for (const r of t) {
    const o = r.children.map((c) => c.id);
    i.push({
      id: r.id,
      parentId: r.parentId ?? n,
      depth: s,
      title: r.title,
      url: r.url,
      cssClass: r.cssClass,
      target: r.target,
      image: r.image,
      status: r.status,
      collapsed: l.has(r.id),
      children: o
    }), !l.has(r.id) && r.children.length > 0 && i.push(...Ea(r.children, r.id, s + 1, l));
  }
  return i;
}
function nl(t) {
  const n = /* @__PURE__ */ new Map(), s = [];
  for (const i of t)
    n.set(i.id, {
      id: i.id,
      parentId: i.parentId,
      position: 0,
      children: []
    });
  for (const i of t) {
    const r = n.get(i.id);
    i.parentId && n.has(i.parentId) ? n.get(i.parentId).children.push(r) : (r.parentId = null, s.push(r));
  }
  function l(i) {
    i.forEach((r, o) => {
      r.position = o, l(r.children);
    });
  }
  return l(s), s;
}
const _t = 3, vt = 30, sl = Xn(function({ type: n, initialTree: s, onStatusChange: l }, i) {
  const [r, o] = d(/* @__PURE__ */ new Set()), [c, h] = d(
    () => Ea(s, null, 0, /* @__PURE__ */ new Set())
  ), [m, p] = d(null), [S, y] = d(!1), [z, I] = d(!1), [E, M] = d(!1), [b, g] = d(""), [u, v] = d(""), T = Oe(0), O = Oe(null), k = Ot(() => c.map(($) => $.id), [c]), N = Sa(
    jt(Pa, {
      activationConstraint: { distance: 8 }
    }),
    jt(Is, {
      coordinateGetter: Ds
    })
  ), f = J(
    ($) => {
      o((W) => {
        const U = new Set(W);
        return U.has($) ? U.delete($) : U.add($), U;
      }), h((W) => {
        const U = W, X = new Set(r);
        return X.has($) ? X.delete($) : X.add($), o(X), il(U, X);
      });
    },
    [r]
  ), A = J(($) => {
    p(String($.active.id));
    const W = $.activatorEvent;
    T.current = W?.clientX ?? 0;
  }, []), j = J(
    ($) => {
      const W = $.delta;
      if (W && m) {
        const U = W.x, X = c.find((q) => q.id === m);
        if (!X) return;
        let L = X.depth;
        U > vt ? L = Math.min(X.depth + 1, _t - 1) : U < -vt && (L = Math.max(X.depth - 1, 0)), O.current = L;
      }
    },
    [m, c]
  ), _ = J(
    ($) => {
      const { active: W, over: U, delta: X } = $;
      if (!U || W.id === U.id) {
        if (X && m) {
          const Z = X.x, Q = c.findIndex((me) => me.id === m);
          if (Q === -1) {
            p(null), O.current = null;
            return;
          }
          const ye = c[Q];
          if (Z > vt && Q > 0) {
            const me = ia(c, Q);
            me && ye.depth < _t - 1 && (h((ue) => {
              const H = [...ue];
              return H[Q] = {
                ...H[Q],
                parentId: me.id,
                depth: ye.depth + 1
              }, ct(H, Q), H;
            }), y(!0));
          } else Z < -vt && ye.depth > 0 && (h((me) => {
            const ue = [...me], H = ue[Q].parentId, he = me.find((_e) => _e.id === H);
            return ue[Q] = {
              ...ue[Q],
              parentId: he?.parentId ?? null,
              depth: Math.max(0, ye.depth - 1)
            }, ct(ue, Q), ue;
          }), y(!0));
        }
        p(null), O.current = null;
        return;
      }
      const L = c.findIndex((Z) => Z.id === String(W.id)), q = c.findIndex((Z) => Z.id === String(U.id));
      L !== -1 && q !== -1 && (h((Z) => {
        const Q = yt(Z, L, q), ye = X?.x ?? 0, me = Q[q];
        if (ye > vt && q > 0) {
          const ue = ia(Q, q);
          ue && me.depth < _t - 1 && (Q[q] = {
            ...Q[q],
            parentId: ue.id,
            depth: me.depth + 1
          }, ct(Q, q));
        } else if (ye < -vt && me.depth > 0) {
          const ue = Q.find((H) => H.id === me.parentId);
          Q[q] = {
            ...Q[q],
            parentId: ue?.parentId ?? null,
            depth: Math.max(0, me.depth - 1)
          }, ct(Q, q);
        } else {
          const ue = Z[q];
          ue && (Q[q] = {
            ...Q[q],
            parentId: ue.parentId,
            depth: ue.depth
          });
        }
        return Q;
      }), y(!0)), p(null), O.current = null;
    },
    [m, c]
  ), F = J(
    async ($, W) => {
      h(
        (U) => U.map(
          (X) => X.id === $ ? { ...X, title: W.title, url: W.url, cssClass: W.cssClass || null, target: W.target || null, image: W.image || null, status: W.status } : X
        )
      ), y(!0);
    },
    []
  ), K = J(
    async ($) => {
      const W = await Cn(`/api/admin/menus/${$}`);
      W.success ? (h((U) => {
        const X = U.find((Z) => Z.id === $);
        if (!X) return U;
        const L = /* @__PURE__ */ new Set(), q = [$];
        for (; q.length > 0; ) {
          const Z = q.pop();
          for (const Q of U)
            Q.parentId === Z && (L.add(Q.id), q.push(Q.id));
        }
        return U.filter((Z) => Z.id !== $).map(
          (Z) => L.has(Z.id) ? {
            ...Z,
            parentId: Z.parentId === $ ? X.parentId : Z.parentId,
            depth: Math.max(0, Z.depth - 1)
          } : Z
        );
      }), y(!0), Y.success("delete", "menu item")) : Y.error(W.message);
    },
    []
  ), D = J(async () => {
    if (!b.trim() || !u.trim()) return;
    M(!0);
    const $ = await Se("/api/admin/menus", {
      title: b.trim(),
      url: u.trim(),
      type: n,
      position: c.filter((W) => W.parentId === null).length
    });
    if ($.success) {
      const W = {
        id: $.data.id,
        parentId: null,
        depth: 0,
        title: $.data.title,
        url: $.data.url,
        cssClass: $.data.cssClass ?? null,
        target: $.data.target ?? null,
        image: null,
        status: "published",
        collapsed: !1,
        children: []
      };
      h((U) => [...U, W]), g(""), v(""), Y.success("create", "menu item");
    } else
      Y.error($.message);
    M(!1);
  }, [b, u, n, c]), w = J(async () => {
    I(!0);
    const $ = c, W = nl($), U = await Se("/api/admin/menus/reorder", {
      type: n,
      tree: W
    });
    if (U.success) {
      for (const X of $)
        await rt(`/api/admin/menus/${X.id}`, {
          title: X.title,
          url: X.url,
          cssClass: X.cssClass ?? "",
          target: X.target ?? "",
          image: X.image ?? "",
          status: X.status,
          parentId: X.parentId,
          type: n
        });
      y(!1), Y.saved("menu");
    } else
      Y.error(U.message);
    I(!1);
  }, [c, r, n]), B = J(
    ($, W) => {
      const U = c.findIndex((X) => X.id === $);
      U !== -1 && (h((X) => {
        const L = [...X], q = L[U];
        switch (W) {
          case "moveUp":
            if (U > 0)
              return yt(L, U, U - 1);
            break;
          case "moveDown":
            if (U < L.length - 1)
              return yt(L, U, U + 1);
            break;
          case "indent": {
            const Z = ia(L, U);
            Z && q.depth < _t - 1 && (L[U] = {
              ...q,
              parentId: Z.id,
              depth: q.depth + 1
            }, ct(L, U));
            break;
          }
          case "outdent": {
            if (q.depth > 0) {
              const Z = L.find((Q) => Q.id === q.parentId);
              L[U] = {
                ...q,
                parentId: Z?.parentId ?? null,
                depth: q.depth - 1
              }, ct(L, U);
            }
            break;
          }
        }
        return L;
      }), y(!0));
    },
    [c]
  ), C = m ? c.find(($) => $.id === m) : null;
  return te(() => l?.({ hasChanges: S, saving: z }), [S, z, l]), Qn(i, () => ({ save: w }), [w]), /* @__PURE__ */ a("div", { className: "space-y-4", children: [
    S && /* @__PURE__ */ a("div", { className: "flex items-center gap-3 px-4 mt-3", children: [
      /* @__PURE__ */ e(He, { variant: "secondary", className: "animate-pulse", children: "Unsaved changes" }),
      /* @__PURE__ */ e(x, { onClick: w, disabled: z, children: z ? "Saving..." : "Save Menu" })
    ] }),
    /* @__PURE__ */ a(Et, { children: [
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ e(Ue, { title: "Menu items", description: "Drag items to reorder. Drag right to nest, or left to outdent.", children: c.length === 0 ? /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed p-8 text-center", children: /* @__PURE__ */ e("p", { className: "text-muted-foreground", children: "No menu items yet. Add your first item from the panel." }) }) : /* @__PURE__ */ a(
        _a,
        {
          sensors: N,
          collisionDetection: Aa,
          onDragStart: A,
          onDragOver: j,
          onDragEnd: _,
          children: [
            /* @__PURE__ */ e(Kt, { items: k, strategy: za, children: /* @__PURE__ */ e("div", { className: "space-y-2", role: "list", "aria-label": "Menu items", children: c.map(($) => /* @__PURE__ */ e(
              al,
              {
                item: $,
                maxDepth: _t,
                onToggleCollapse: f,
                onEdit: F,
                onDelete: K,
                onKeyAction: B
              },
              $.id
            )) }) }),
            /* @__PURE__ */ e(Ts, { children: C ? /* @__PURE__ */ a("div", { className: "rounded-sm border bg-background p-3 shadow-lg opacity-90", children: [
              /* @__PURE__ */ e("span", { className: "font-medium", children: C.title }),
              /* @__PURE__ */ e("span", { className: "ml-2 text-xs text-muted-foreground truncate", children: C.url })
            ] }) : null })
          ]
        }
      ) }) }),
      /* @__PURE__ */ e(Rt, { children: /* @__PURE__ */ a(Ue, { title: "Add menu item", description: "New items are added to the top level.", children: [
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "new-title", children: "Title" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "new-title",
              placeholder: "Menu item title",
              value: b,
              onChange: ($) => g($.target.value),
              onKeyDown: ($) => {
                $.key === "Enter" && D();
              }
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "new-url", children: "URL" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "new-url",
              placeholder: "/page-url",
              value: u,
              onChange: ($) => v($.target.value),
              onKeyDown: ($) => {
                $.key === "Enter" && D();
              }
            }
          )
        ] }),
        /* @__PURE__ */ e(x, { className: "w-full", onClick: D, disabled: E || !b.trim() || !u.trim(), children: E ? "Adding..." : "Add" })
      ] }) })
    ] })
  ] });
});
function ia(t, n) {
  if (n <= 0) return null;
  const s = t[n];
  for (let l = n - 1; l >= 0; l--)
    if (t[l].depth <= s.depth)
      return t[l];
  return null;
}
function ct(t, n) {
  const s = t[n], l = s.id, i = s.depth;
  for (let r = n + 1; r < t.length; r++)
    if (t[r].parentId === l)
      t[r] = { ...t[r], depth: i + 1 }, ct(t, r);
    else if (t[r].depth <= i)
      break;
}
function rl(t) {
  const n = /* @__PURE__ */ new Map(), s = [];
  for (const l of t)
    n.set(l.id, {
      id: l.id,
      title: l.title,
      url: l.url,
      position: 0,
      cssClass: l.cssClass,
      target: l.target,
      image: l.image,
      status: l.status,
      parentId: l.parentId,
      children: []
    });
  for (const l of t) {
    const i = n.get(l.id);
    l.parentId && n.has(l.parentId) ? n.get(l.parentId).children.push(i) : s.push(i);
  }
  return s;
}
function il(t, n) {
  const s = rl(t);
  return Ea(s, null, 0, n);
}
const ll = [
  {
    type: "navbar",
    label: "Navbar",
    description: "Primary site navigation."
  },
  {
    type: "footer",
    label: "Footer",
    description: "Footer navigation."
  },
  {
    type: "sidebar",
    label: "Sidebar",
    description: "Sidebar navigation."
  }
];
function ol(t) {
  return Array.isArray(t);
}
function cl() {
  const t = globalThis.__CMS_MENU_GROUP_REGISTRY__;
  return ol(t) ? t : ll;
}
function dl(t) {
  const n = /* @__PURE__ */ new Map(), s = [];
  for (const i of t)
    n.set(i.id, {
      id: i.id,
      title: i.title,
      url: i.url,
      position: i.position,
      cssClass: i.cssClass,
      target: i.target,
      image: i.image,
      status: i.status,
      parentId: i.parentId,
      children: []
    });
  for (const i of t) {
    const r = n.get(i.id);
    r && (i.parentId && n.has(i.parentId) ? n.get(i.parentId)?.children.push(r) : s.push(r));
  }
  const l = (i) => i.sort((r, o) => r.position - o.position).map((r) => ({
    ...r,
    children: l(r.children)
  }));
  return l(s);
}
function ul() {
  const t = cl(), [n, s] = d(null), [l, i] = d(null), [r, o] = d("navbar"), c = Oe(null), [h, m] = d({ hasChanges: !1, saving: !1 }), p = J(async () => {
    i(null);
    try {
      const y = await de("/api/admin/menus");
      s(y);
    } catch (y) {
      i(y.message);
    }
  }, []);
  if (te(() => {
    p();
  }, [p]), l) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    l
  ] }) });
  const S = n ? dl(n.filter((y) => y.type === r)) : null;
  return /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Menus",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ a(De, { value: r, onValueChange: (y) => y && o(y), children: [
            /* @__PURE__ */ e(Le, { className: "w-40", children: /* @__PURE__ */ e(Ee, {}) }),
            /* @__PURE__ */ e(Re, { children: t.map((y) => /* @__PURE__ */ e(ie, { value: y.type, children: y.label }, y.type)) })
          ] }),
          /* @__PURE__ */ e(x, { onClick: () => c.current?.save(), disabled: !h.hasChanges || h.saving, children: h.saving ? "Saving..." : "Save Menu" })
        ] })
      }
    ),
    S ? /* @__PURE__ */ e(sl, { ref: c, type: r, initialTree: S, onStatusChange: m }, r) : /* @__PURE__ */ e(ge, {})
  ] });
}
const ml = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminMenusPage: ul
}, Symbol.toStringTag, { value: "Module" }));
function hl() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), [h, m] = d(!1), p = dt(), S = Ze(), [y, z] = d(
    new URLSearchParams(p.search).get("search") ?? ""
  ), [I, E] = d(
    new URLSearchParams(p.search).get("sortBy") ?? ""
  ), [M, b] = d(
    new URLSearchParams(p.search).get("sortOrder") ?? ""
  );
  async function g() {
    l(null);
    const B = await de(`/api/admin/roles${p.search}`);
    n(B), r([]);
  }
  te(() => {
    g().catch((B) => l(B.message));
  }, [p.search]);
  function u() {
    S(Ce("/admin/roles", { search: y, sortBy: I, sortOrder: M }));
  }
  function v(B) {
    const C = I === B && M === "asc" ? "desc" : "asc";
    E(B), b(C), S(Ce("/admin/roles", { search: y, sortBy: B, sortOrder: C }));
  }
  function T(B) {
    B.key === "Enter" && (B.preventDefault(), u());
  }
  const O = Oe(!0);
  te(() => {
    if (O.current) {
      O.current = !1;
      return;
    }
    const B = setTimeout(() => {
      u();
    }, 400);
    return () => clearTimeout(B);
  }, [y]);
  const k = J((B) => {
    t?.roles && r(B ? t.roles.map((C) => C.id) : []);
  }, [t]), N = J((B, C) => {
    r(
      ($) => C ? [...$, B] : $.filter((W) => W !== B)
    );
  }, []), f = t !== null && t.roles.length > 0 && i.length === t.roles.length, A = i.length > 0;
  async function j(B) {
    if (i.length === 0) return;
    c(!0);
    const C = await Se(B, { ids: i });
    c(!1), C.success ? (Y.success("update", "role"), await g()) : Y.error(C.message);
  }
  const _ = J(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} role(s)? This action cannot be undone.`) && await j("/api/admin/roles/bulk/delete");
  }, [i]), F = J(async () => {
    await j("/api/admin/roles/bulk/duplicate");
  }, [i]);
  async function K() {
    if (confirm("Sync permissions from the content type registry? Permissions for removed content types will be removed from roles.")) {
      m(!0);
      try {
        const B = await Se("/api/admin/roles/sync-permissions");
        B.success ? (Y.success("update", "permission"), await g()) : Y.error(B.message);
      } finally {
        m(!1);
      }
    }
  }
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const D = t.roles ?? [];
  function w(B) {
    return Ce("/admin/roles", { search: y, sortBy: I, sortOrder: M, page: B });
  }
  return /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Roles",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by name or slug...",
            value: y,
            onChange: (B) => z(B.target.value),
            onKeyDown: T,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e(x, { type: "button", variant: "outline", size: "lg", onClick: K, disabled: h, children: h ? "Syncing…" : "Sync Permissions" }),
          /* @__PURE__ */ e(fe, { to: "/admin/roles/new", className: P(kt({ size: "lg" })), children: "New Role" })
        ] })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      A && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          i.length,
          " selected"
        ] }),
        /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: F,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: _,
              disabled: o,
              children: "Delete"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => r([]),
              disabled: o,
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ a(It, { children: [
        /* @__PURE__ */ e(Tt, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: f,
              onCheckedChange: (B) => k(B === !0),
              "aria-label": "Select all roles"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => v("name"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Name",
                I === "name" ? M === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Slug" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Users" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => v("createdAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Created",
                I === "createdAt" ? M === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Dt, { children: D.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(re, { colSpan: 6, className: "px-4 py-8 text-center text-muted-foreground", children: "No roles found." }) }) : D.map((B) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(re, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(B.id),
              onCheckedChange: (C) => N(B.id, C === !0),
              "aria-label": `Select ${B.name}`
            }
          ) }),
          /* @__PURE__ */ e(re, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `/admin/roles/${B.id}/edit`, className: "underline", children: B.name }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: B.slug }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(He, { variant: "secondary", children: B.userCount }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(B.createdAt * 1e3).toLocaleDateString() })
        ] }, B.id)) })
      ] }),
      t.meta && /* @__PURE__ */ a("div", { className: "flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ a("span", { children: [
          "Showing ",
          t.meta.from,
          "–",
          t.meta.to,
          " of ",
          t.meta.total
        ] }),
        /* @__PURE__ */ a("div", { className: "flex gap-2", children: [
          t.meta.currentPage > 1 && /* @__PURE__ */ e(fe, { to: w(t.meta.currentPage - 1), className: "hover:text-foreground hover:underline", children: "Previous" }),
          t.meta.currentPage < t.meta.lastPage && /* @__PURE__ */ e(fe, { to: w(t.meta.currentPage + 1), className: "hover:text-foreground hover:underline", children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
const gl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminRolesPage: hl
}, Symbol.toStringTag, { value: "Module" }));
function pl() {
  const t = Ze(), { session: n, refreshSession: s } = et(), [l, i] = wt(), [r, o] = d({}), c = n?.user;
  function h(m) {
    m.preventDefault(), o({});
    const p = new FormData(m.currentTarget), S = String(p.get("name") ?? "").trim(), y = String(p.get("email") ?? "").trim(), z = String(p.get("password") ?? "");
    i(async () => {
      const I = { name: S, email: y };
      z && (I.password = z);
      const E = await rt("/api/admin/auth/profile", I);
      if (!E.success) {
        E.errors ? o(E.errors) : o({ _form: [E.message] }), Y.error(E.message);
        return;
      }
      await s(), Y.success("update", "profile");
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: h, className: "", children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Profile",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ a(x, { type: "submit", disabled: l, children: [
            l && /* @__PURE__ */ e(gn, { className: "mr-2 size-4 animate-spin" }),
            l ? "Saving…" : "Save Changes"
          ] }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => t("/admin"),
              disabled: l,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ a(Et, { children: [
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ a(Ue, { title: "Account information", description: "Update your name and email.", children: [
        r._form && /* @__PURE__ */ e("div", { className: "rounded-sm bg-destructive/10 p-3 text-sm text-destructive", children: r._form[0] }),
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ a(R, { htmlFor: "profile-name", children: [
            "Name ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "profile-name",
              name: "name",
              defaultValue: c?.name ?? "",
              placeholder: "Full name",
              required: !0,
              maxLength: 100,
              "aria-invalid": !!r.name
            }
          ),
          r.name && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: r.name[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ a(R, { htmlFor: "profile-email", children: [
            "Email ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "profile-email",
              name: "email",
              type: "email",
              defaultValue: c?.email ?? "",
              placeholder: "user@example.com",
              required: !0,
              "aria-invalid": !!r.email
            }
          ),
          r.email && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: r.email[0] })
        ] })
      ] }) }),
      /* @__PURE__ */ e(Rt, { children: /* @__PURE__ */ e(Ue, { title: "Password", description: "Leave empty to keep your current password.", children: /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ e(R, { htmlFor: "profile-password", children: "New Password" }),
        /* @__PURE__ */ e(
          G,
          {
            id: "profile-password",
            name: "password",
            type: "password",
            placeholder: "Leave blank to keep current",
            minLength: 12,
            maxLength: 128,
            "aria-invalid": !!r.password
          }
        ),
        r.password && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: r.password[0] }),
        /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Minimum 12 characters. Leave empty to keep your current password." })
      ] }) }) })
    ] })
  ] });
}
const fl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminProfilePage: pl
}, Symbol.toStringTag, { value: "Module" }));
function je({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "textarea",
    {
      "data-slot": "textarea",
      className: P(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        t
      ),
      ...n
    }
  );
}
function La(t) {
  let n = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return n.length > 200 && (n = n.slice(0, 200).replace(/-+$/, "")), n;
}
function In({ category: t, mode: n, pageTitle: s, defaultType: l }) {
  const { session: i } = et(), [r, o] = wt(), [c, h] = d({}), [m, p] = d(null), [S, y] = d(t?.name ?? ""), [z, I] = d(t?.slug ?? ""), [E, M] = d(!!t?.slug), [b] = d(t?.type ?? l ?? "post"), [g, u] = d(t?.description ?? ""), [v, T] = d(t?.image ?? ""), [O, k] = d(t?.status ?? "published"), N = i?.permissions.includes(`category.${b}.publish`) ?? !1, f = i?.permissions.includes(`category.${b}.unpublish`) ?? !1, A = O === "published" ? f : N;
  te(() => {
    n === "create" && !N && k("draft");
  }, [N, n]), te(() => {
    !E && n === "create" && I(La(S));
  }, [S, E, n]);
  function j(F) {
    M(!0), I(F);
  }
  function _(F) {
    F.preventDefault(), h({}), p(null);
    const K = {
      name: S,
      type: b,
      status: O
    };
    g.trim() && (K.description = g), v ? K.image = v : K.image = null, z && (K.slug = z), o(async () => {
      let D;
      n === "edit" && t ? D = await rt(`/api/admin/categories/${t.id}`, K) : D = await Se("/api/admin/categories", K), D.success ? (Y.success(n === "edit" ? "update" : "create", "category"), Fe(`/admin/categories/${b}`)) : D.errors && Object.keys(D.errors).length > 0 ? (h(D.errors), Y.error(D.message)) : (p(D.message), Y.error(D.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: _, className: "", children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: s || "Categories",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: r, children: r ? n === "edit" ? "Saving…" : "Creating…" : n === "edit" ? "Save Changes" : "Create Category" }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Fe(`/admin/categories/${b}`),
              disabled: r,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    m && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: m }),
    /* @__PURE__ */ a(Et, { children: [
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ a(Ue, { title: "Basic information", children: [
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a(R, { htmlFor: "name", children: [
            "Name ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "name",
              value: S,
              onChange: (F) => y(F.target.value),
              placeholder: "Category name",
              "aria-invalid": !!c.name,
              "aria-describedby": c.name ? "name-error" : void 0
            }
          ),
          c.name && /* @__PURE__ */ e("p", { id: "name-error", className: "text-xs text-destructive", children: c.name[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "slug", children: "Slug" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "slug",
              value: z,
              onChange: (F) => j(F.target.value),
              placeholder: "category-url-slug",
              "aria-invalid": !!c.slug,
              "aria-describedby": c.slug ? "slug-error" : void 0
            }
          ),
          c.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: c.slug[0] }),
          !E && n === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from name. Edit to customize." })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ e(
            je,
            {
              id: "description",
              value: g,
              onChange: (F) => u(F.target.value),
              placeholder: "Optional description",
              rows: 4,
              "aria-invalid": !!c.description,
              "aria-describedby": c.description ? "description-error" : void 0
            }
          ),
          c.description && /* @__PURE__ */ e("p", { id: "description-error", className: "text-xs text-destructive", children: c.description[0] })
        ] })
      ] }) }),
      /* @__PURE__ */ a(Rt, { children: [
        /* @__PURE__ */ e(Ue, { title: "Status", children: /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "status", children: "Visibility" }),
          /* @__PURE__ */ a("select", { id: "status", value: O, disabled: !A, onChange: (F) => k(F.target.value), className: "h-9 rounded-sm border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60", children: [
            /* @__PURE__ */ e("option", { value: "published", disabled: !N && O !== "published", children: "Published" }),
            /* @__PURE__ */ e("option", { value: "draft", disabled: !f && O !== "draft", children: "Unpublished" })
          ] }),
          !A && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Your role cannot change this status." })
        ] }) }),
        /* @__PURE__ */ a(Ue, { title: "Image", children: [
          /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
            v ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
              "img",
              {
                src: be(v) ?? void 0,
                alt: "Category image preview",
                className: "object-cover h-full w-full"
              }
            ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No image" }),
            /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
              /* @__PURE__ */ e(
                Ve,
                {
                  value: v || null,
                  onChange: (F) => {
                    T(F ? F.url : "");
                  },
                  accept: "image/*"
                },
                v || "empty"
              ),
              /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose an image from the media library." }),
              v && /* @__PURE__ */ e(
                x,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  "aria-label": "Remove image",
                  className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                  onClick: () => T(""),
                  children: "Remove"
                }
              )
            ] })
          ] }) }),
          c.image && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: c.image[0] })
        ] })
      ] })
    ] })
  ] });
}
function bl() {
  const { type: t = "post" } = qe(), [n, s] = d(!0);
  return te(() => {
    const l = setTimeout(() => s(!1), 0);
    return () => clearTimeout(l);
  }, []), n ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    In,
    {
      mode: "create",
      pageTitle: "Create Category",
      defaultType: t
    }
  ) });
}
function vl({ id: t }) {
  const { type: n = "post" } = qe(), [s, l] = d(null), [i, r] = d(!0);
  return te(() => {
    de(`/api/admin/categories/${t}`).then((o) => {
      l(o), r(!1);
    });
  }, [t]), i ? /* @__PURE__ */ e(ge, {}) : s ? /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    In,
    {
      mode: "edit",
      category: s,
      pageTitle: "Edit Category",
      defaultType: n
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Category not found." });
}
const Tn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminCategoryCreatePage: bl,
  AdminCategoryEditPage: vl
}, Symbol.toStringTag, { value: "Module" }));
function xl({ detailTemplate: t, values: n, onChange: s }) {
  const l = Zt(), i = t ? l.templates.find((r) => r.id === t && r.kind === "detail")?.fieldSlots ?? [] : [];
  return i.length === 0 ? null : /* @__PURE__ */ e("div", { className: "space-y-4", children: i.map((r) => /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ e(R, { htmlFor: `template-field-${r.key}`, children: r.label }),
    r.type === "rich-text" ? /* @__PURE__ */ e(je, { id: `template-field-${r.key}`, value: String(n[r.key] ?? ""), onChange: (o) => s({ ...n, [r.key]: o.target.value }) }) : r.type === "boolean" ? /* @__PURE__ */ e("input", { id: `template-field-${r.key}`, type: "checkbox", checked: n[r.key] === !0, onChange: (o) => s({ ...n, [r.key]: o.target.checked }), className: "rounded-sm border-input" }) : r.type === "image" ? /* @__PURE__ */ a("div", { className: "space-y-2", children: [
      /* @__PURE__ */ e(Ve, { value: typeof n[r.key] == "string" ? String(n[r.key]) : null, onChange: (o) => s({ ...n, [r.key]: o?.url ?? "" }), accept: "image/*" }),
      typeof n[r.key] == "string" && String(n[r.key]) && /* @__PURE__ */ a("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ e("img", { src: be(n[r.key]) ?? void 0, alt: r.label, className: "h-32 w-48 rounded-sm border object-cover" }),
        /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => s({ ...n, [r.key]: "" }), children: "Remove image" })
      ] })
    ] }) : /* @__PURE__ */ e(G, { id: `template-field-${r.key}`, type: r.type === "number" ? "number" : r.type === "date" ? "date" : "text", value: String(n[r.key] ?? ""), onChange: (o) => s({ ...n, [r.key]: r.type === "number" && o.target.value ? Number(o.target.value) : o.target.value }) })
  ] }, r.key)) });
}
const yl = [];
function Nl(t) {
  return Array.isArray(t);
}
function Dn() {
  const t = globalThis.__CMS_SECTION_REGISTRY__;
  return Nl(t) ? t : yl;
}
const En = {
  icon: "Icon",
  caption: "Caption",
  title: "Title",
  text: "Text",
  image: "Image",
  alt_image: "Alt Image",
  video: "Video URL",
  map: "Coordinate",
  form_inquiry: "Form Inquiry",
  embed: "Embed Code",
  bg_color: "Background Color",
  bg_image: "Background Image",
  links: "Links",
  style_css: "Style CSS Class",
  style_css_inline: "Style CSS Inline",
  style_id: "Style ID"
}, wl = {
  map: "Latitude, longitude (example: -6.208763, 106.845599)"
}, ba = [
  { label: "", url: "" },
  { label: "", url: "" }
];
function va(t) {
  return Object.keys(t).reduce(
    (n, s) => ({
      ...n,
      [s]: s === "links" ? ba.map((l) => ({ ...l })) : s === "form_inquiry" ? !1 : ""
    }),
    {}
  );
}
function xa(t) {
  if (Array.isArray(t)) {
    const n = t.slice(0, 2).map((s) => {
      if (s && typeof s == "object") {
        const l = s;
        return { label: String(l.label ?? ""), url: String(l.url ?? "") };
      }
      return { label: "", url: "" };
    });
    return [...n, ...ba.slice(n.length).map((s) => ({ ...s }))];
  }
  if (typeof t == "string" && t.trim())
    try {
      const n = JSON.parse(t);
      if (Array.isArray(n)) return xa(n);
    } catch {
    }
  return ba.map((n) => ({ ...n }));
}
function Cl({
  value: t,
  onItemChange: n
}) {
  const [s, l] = d(() => xa(t));
  te(() => {
    l(xa(t));
  }, [t]);
  function i(r) {
    l(r), n(r);
  }
  return /* @__PURE__ */ a("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
    /* @__PURE__ */ e(R, { className: "text-xs", children: "Links" }),
    /* @__PURE__ */ e("div", { className: "space-y-2", children: s.map((r, o) => /* @__PURE__ */ a(
      "div",
      {
        className: "grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-2",
        children: [
          /* @__PURE__ */ e(
            G,
            {
              value: r.label,
              onChange: (c) => i(
                s.map(
                  (h, m) => m === o ? { ...h, label: c.target.value } : h
                )
              ),
              placeholder: "Label",
              className: "h-8 text-sm"
            }
          ),
          /* @__PURE__ */ e(
            G,
            {
              type: "url",
              value: r.url,
              onChange: (c) => i(
                s.map(
                  (h, m) => m === o ? { ...h, url: c.target.value } : h
                )
              ),
              placeholder: "https://...",
              className: "h-8 text-sm"
            }
          )
        ]
      },
      o
    )) })
  ] });
}
function la({
  field: t,
  value: n,
  onItemChange: s
}) {
  const l = Zn(), i = En[t] || t, r = n != null ? String(n) : "";
  if (t === "links")
    return /* @__PURE__ */ e(Cl, { value: n, onItemChange: s });
  if (t === "form_inquiry")
    return /* @__PURE__ */ a("div", { className: "flex items-center gap-2 sm:col-span-2", children: [
      /* @__PURE__ */ e(
        xe,
        {
          id: l,
          checked: n === !0,
          onCheckedChange: (o) => s(o === !0)
        }
      ),
      /* @__PURE__ */ e(R, { htmlFor: l, className: "cursor-pointer text-xs", children: "Show inquiry form" })
    ] });
  if (t === "text" || t === "embed")
    return /* @__PURE__ */ a("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
      /* @__PURE__ */ e(R, { className: "text-xs", children: i }),
      /* @__PURE__ */ e(
        je,
        {
          value: r,
          onChange: (o) => s(o.target.value || null),
          placeholder: i,
          rows: 2,
          className: "text-sm"
        }
      )
    ] });
  if (t === "image" || t === "bg_image") {
    const o = !!r;
    return /* @__PURE__ */ a("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ e(R, { className: "text-xs", children: i }),
      /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
        o && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
          "img",
          {
            src: be(r) ?? void 0,
            alt: "",
            className: "h-full w-full object-cover"
          }
        ) }),
        /* @__PURE__ */ e(
          Ve,
          {
            value: o ? r : null,
            onChange: (c) => s(c ? c.url : null),
            accept: "image/*"
          }
        ),
        o && /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "outline",
            "aria-label": `Remove ${i.toLowerCase()}`,
            className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
            onClick: () => s(null),
            children: "Remove"
          }
        )
      ] })
    ] });
  }
  return t === "bg_color" ? /* @__PURE__ */ a("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ e(R, { className: "text-xs", children: i }),
    /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "color",
          value: r || "#ffffff",
          onChange: (o) => s(o.target.value || null),
          className: "h-8 w-8 rounded-sm border p-0.5"
        }
      ),
      /* @__PURE__ */ e(
        G,
        {
          value: r,
          onChange: (o) => s(o.target.value || null),
          placeholder: "#000000",
          className: "h-8 flex-1 text-sm"
        }
      )
    ] })
  ] }) : t === "style_css_inline" ? /* @__PURE__ */ a("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
    /* @__PURE__ */ e(R, { className: "text-xs", children: i }),
    /* @__PURE__ */ e(
      G,
      {
        value: r,
        onChange: (o) => s(o.target.value || null),
        placeholder: "color: red; font-size: 14px;",
        className: "h-8 text-sm"
      }
    )
  ] }) : /* @__PURE__ */ a("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ e(R, { className: "text-xs", children: i }),
    /* @__PURE__ */ e(
      G,
      {
        value: r,
        onChange: (o) => s(o.target.value || null),
        placeholder: wl[t] || i,
        className: "h-8 text-sm"
      }
    )
  ] });
}
function kl({
  id: t,
  item: n,
  itemIdx: s,
  itemTemplate: l,
  onUpdateItemField: i,
  onRemove: r,
  isExpanded: o,
  onToggleExpanded: c,
  onDuplicate: h
}) {
  const { attributes: m, listeners: p, setNodeRef: S, transform: y, transition: z, isDragging: I } = qt({ id: t }), E = Object.keys(l || n), M = E.filter((u) => ["style_css", "style_css_inline", "style_id"].includes(u)), b = E.filter((u) => ["bg_color", "bg_image"].includes(u)), g = [
    { value: "text", label: "Text", fields: E.filter((u) => ["caption", "title", "text"].includes(u)) },
    { value: "image", label: "Image", fields: E.filter((u) => ["image", "alt_image"].includes(u)) },
    ...E.filter((u) => !["caption", "title", "text", "image", "alt_image", "style_css", "style_css_inline", "style_id", "bg_color", "bg_image"].includes(u)).map((u) => ({ value: u, label: En[u] || u, fields: [u] }))
  ].filter((u) => u.fields.length > 0);
  return /* @__PURE__ */ a(
    "div",
    {
      ref: S,
      style: { transform: Wt.Transform.toString(y), transition: z },
      className: `overflow-hidden rounded-sm border ${I ? "z-10 opacity-50" : ""}`,
      children: [
        /* @__PURE__ */ a("div", { className: "flex items-center justify-between border-b px-3 py-2.5", children: [
          /* @__PURE__ */ a("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cursor-grab text-muted-foreground hover:text-foreground",
                "aria-label": "Drag to reorder item",
                ...m,
                ...p,
                children: /* @__PURE__ */ e(Gt, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ a("span", { className: "text-xs font-medium", children: [
              "Column #",
              s + 1
            ] })
          ] }),
          /* @__PURE__ */ a("div", { className: "flex items-center gap-0.5", children: [
            /* @__PURE__ */ e(
              x,
              {
                type: "button",
                variant: "ghost",
                size: "icon-sm",
                "aria-label": "Duplicate column",
                onClick: (u) => {
                  u.stopPropagation(), h(s);
                },
                children: /* @__PURE__ */ e(wa, { className: "h-3.5 w-3.5 text-muted-foreground" })
              }
            ),
            (M.length > 0 || b.length > 0) && /* @__PURE__ */ a(ut, { children: [
              /* @__PURE__ */ e(
                Mt,
                {
                  render: /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": "Open style settings", children: /* @__PURE__ */ e(Ca, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
                }
              ),
              /* @__PURE__ */ a(mt, { children: [
                /* @__PURE__ */ a(ht, { children: [
                  /* @__PURE__ */ e(gt, { children: "Style settings" }),
                  /* @__PURE__ */ e(Da, { children: "Set background and custom styling for this column." })
                ] }),
                /* @__PURE__ */ a(Ut, { defaultValue: M.length > 0 ? "style" : "background", className: "gap-0", children: [
                  /* @__PURE__ */ a(Ft, { className: "w-full justify-start", "aria-label": "Style settings", children: [
                    M.length > 0 && /* @__PURE__ */ e(We, { value: "style", className: "shrink-0 px-2 text-xs", children: "Style" }),
                    b.length > 0 && /* @__PURE__ */ e(We, { value: "background", className: "shrink-0 px-2 text-xs", children: "Background" })
                  ] }),
                  M.length > 0 && /* @__PURE__ */ e(Je, { value: "style", className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: M.map((u) => /* @__PURE__ */ e(la, { field: u, value: n[u] ?? null, onItemChange: (v) => i(s, u, v) }, u)) }) }),
                  b.length > 0 && /* @__PURE__ */ e(Je, { value: "background", className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: b.map((u) => /* @__PURE__ */ e(la, { field: u, value: n[u] ?? null, onItemChange: (v) => i(s, u, v) }, u)) }) })
                ] }),
                /* @__PURE__ */ e(St, { showCloseButton: !0 })
              ] })
            ] }),
            /* @__PURE__ */ e(
              x,
              {
                type: "button",
                variant: "ghost",
                size: "icon-sm",
                "aria-label": "Remove column",
                onClick: (u) => {
                  u.stopPropagation(), r(s);
                },
                children: /* @__PURE__ */ e(we, { className: "h-3.5 w-3.5 text-destructive" })
              }
            ),
            /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": o ? "Collapse column" : "Expand column", onClick: c, children: o ? /* @__PURE__ */ e(bn, { className: "h-3.5 w-3.5 text-muted-foreground" }) : /* @__PURE__ */ e(Ct, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
          ] })
        ] }),
        o && g.length > 0 ? /* @__PURE__ */ a(Ut, { defaultValue: g[0].value, className: "gap-0", children: [
          /* @__PURE__ */ e(Ft, { className: "w-full justify-start", "aria-label": `Column ${s + 1} fields`, children: g.map((u) => /* @__PURE__ */ e(We, { value: u.value, className: "shrink-0 px-2 text-xs", children: u.label }, u.value)) }),
          g.map((u) => /* @__PURE__ */ e(Je, { value: u.value, className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: u.fields.map((v) => /* @__PURE__ */ e(
            la,
            {
              field: v,
              value: n[v] ?? null,
              onItemChange: (T) => i(s, v, T)
            },
            v
          )) }) }, u.value))
        ] }) : o && /* @__PURE__ */ e("p", { className: "p-4 text-xs text-muted-foreground", children: "No template fields defined for this section." })
      ]
    }
  );
}
function Sl(t, n, s) {
  if (t && Object.keys(t).length > 0) return t;
  if (n.item && n.item.length > 0) return { ...n.item[0] };
  const l = s.find((i) => i.id === n.id);
  if (l?.item)
    try {
      const i = typeof l.item == "string" ? JSON.parse(l.item) : l.item;
      if (i && !Array.isArray(i)) return { ...i };
      if (Array.isArray(i) && i.length > 0) return { ...i[0] };
    } catch {
    }
  return null;
}
function Pl({
  section: t,
  index: n,
  isExpanded: s,
  itemTemplate: l,
  availableSections: i,
  template: r,
  onToggleExpanded: o,
  onRemove: c,
  onDuplicate: h,
  onUpdateField: m,
  onUpdateItemField: p,
  collapsedItems: S,
  onToggleItemExpanded: y,
  onCollapseItems: z,
  onExpandItems: I
}) {
  const E = Dn(), M = Sl(l, t, i), b = r ?? E.find((C) => C.type === t.type) ?? null, g = !!b?.contentType, u = b?.itemMode !== "none", v = b?.itemMode === "single", T = new Set(b?.sectionFields ?? ["caption", "title", "text"]), O = b?.columns, k = O ? O.desktop ?? O.tablet ?? O.mobile : void 0, N = t.links?.[0] ?? { label: "", url: "" }, [f, A] = d([]), j = f.find(
    (C) => C.id === t.category || C.name === t.category
  ), { attributes: _, listeners: F, setNodeRef: K, transform: D, transition: w, isDragging: B } = qt({ id: t._instanceId });
  return te(() => {
    if (!g) {
      A([]);
      return;
    }
    de(`/api/admin/categories?type=${encodeURIComponent(t.type)}`).then((C) => A(Array.isArray(C) ? C : [])).catch(() => A([]));
  }, [t.type, g]), /* @__PURE__ */ a(Ae, { ref: K, style: { transform: Wt.Transform.toString(D), transition: w }, className: `gap-0 overflow-hidden rounded-sm border-border/70 bg-card py-0 shadow-sm ${B ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ a(ze, { className: "flex flex-row items-center justify-between border-b py-3 px-3 cursor-pointer select-none", onClick: o, children: [
      /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e("button", { type: "button", className: "cursor-grab text-muted-foreground hover:text-foreground", "aria-label": "Drag to reorder", ..._, ...F, children: /* @__PURE__ */ e(Gt, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ e(Ie, { className: "text-sm", children: b?.label ?? t.type ?? `Section #${n + 1}` })
      ] }),
      /* @__PURE__ */ a("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            "aria-label": "Duplicate section",
            onClick: (C) => {
              C.stopPropagation(), h();
            },
            children: /* @__PURE__ */ e(wa, { className: "h-4 w-4 text-muted-foreground" })
          }
        ),
        /* @__PURE__ */ a(ut, { children: [
          /* @__PURE__ */ e(
            Mt,
            {
              render: /* @__PURE__ */ e(
                x,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon-sm",
                  "aria-label": "Open section style settings",
                  onClick: (C) => C.stopPropagation(),
                  children: /* @__PURE__ */ e(Ca, { className: "h-4 w-4 text-muted-foreground" })
                }
              )
            }
          ),
          /* @__PURE__ */ a(mt, { className: "max-h-[90vh] overflow-y-auto sm:max-w-xl", children: [
            /* @__PURE__ */ a(ht, { children: [
              /* @__PURE__ */ e(gt, { children: "Section settings" }),
              /* @__PURE__ */ e(Da, { children: "Configure media, display options, link, and custom styling for this section." })
            ] }),
            /* @__PURE__ */ a(Ut, { defaultValue: "style", className: "gap-0", children: [
              /* @__PURE__ */ a(Ft, { className: "w-full justify-start", "aria-label": "Section settings", children: [
                /* @__PURE__ */ e(We, { value: "style", className: "shrink-0 px-2 text-xs", children: "Style" }),
                g && /* @__PURE__ */ e(We, { value: "filter", className: "shrink-0 px-2 text-xs", children: "Filter" }),
                T.has("image") && /* @__PURE__ */ e(We, { value: "image", className: "shrink-0 px-2 text-xs", children: "Image" }),
                T.has("links") && /* @__PURE__ */ e(We, { value: "link", className: "shrink-0 px-2 text-xs", children: "Link" }),
                (T.has("bg_color") || T.has("bg_image")) && /* @__PURE__ */ e(We, { value: "background", className: "shrink-0 px-2 text-xs", children: "Background" })
              ] }),
              /* @__PURE__ */ e(Je, { value: "style", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "space-y-4", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Custom Class" }),
                  /* @__PURE__ */ e(G, { value: t.style_css ?? "", onChange: (C) => m("style_css", C.target.value || null), placeholder: "custom-class" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Custom Style" }),
                  /* @__PURE__ */ e(G, { value: t.style_css_inline ?? "", onChange: (C) => m("style_css_inline", C.target.value || null), placeholder: "color: red;" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Custom ID" }),
                  /* @__PURE__ */ e(G, { value: t.style_id ?? "", onChange: (C) => m("style_id", C.target.value || null), placeholder: "#my-id" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Alignment" }),
                  /* @__PURE__ */ a(De, { value: t.alignment ?? "", onValueChange: (C) => m("alignment", C || null), children: [
                    /* @__PURE__ */ e(Le, { children: /* @__PURE__ */ e(Ee, { placeholder: "Select alignment" }) }),
                    /* @__PURE__ */ a(Re, { children: [
                      /* @__PURE__ */ e(ie, { value: "left", children: "Left" }),
                      /* @__PURE__ */ e(ie, { value: "center", children: "Center" }),
                      /* @__PURE__ */ e(ie, { value: "right", children: "Right" })
                    ] })
                  ] })
                ] })
              ] }) }),
              g && /* @__PURE__ */ e(Je, { value: "filter", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Category" }),
                  /* @__PURE__ */ a(De, { value: j?.id ?? t.category ?? "all", onValueChange: (C) => m("category", C === "all" ? null : C), children: [
                    /* @__PURE__ */ e(Le, { children: /* @__PURE__ */ e(Ee, { children: j?.name ?? "All categories" }) }),
                    /* @__PURE__ */ a(Re, { children: [
                      /* @__PURE__ */ e(ie, { value: "all", children: "All categories" }),
                      f.map((C) => /* @__PURE__ */ e(ie, { value: C.id, children: C.name }, C.id))
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Sort By" }),
                  /* @__PURE__ */ a(De, { value: t.sort_by ?? "created_at", onValueChange: (C) => m("sort_by", C), children: [
                    /* @__PURE__ */ e(Le, { children: /* @__PURE__ */ e(Ee, {}) }),
                    /* @__PURE__ */ a(Re, { children: [
                      /* @__PURE__ */ e(ie, { value: "created_at", children: "Created at" }),
                      /* @__PURE__ */ e(ie, { value: "title", children: "Title" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Order" }),
                  /* @__PURE__ */ a(De, { value: t.sort_order ?? "desc", onValueChange: (C) => m("sort_order", C), children: [
                    /* @__PURE__ */ e(Le, { children: /* @__PURE__ */ e(Ee, {}) }),
                    /* @__PURE__ */ a(Re, { children: [
                      /* @__PURE__ */ e(ie, { value: "asc", children: "Ascending" }),
                      /* @__PURE__ */ e(ie, { value: "desc", children: "Descending" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Limit" }),
                  /* @__PURE__ */ e(G, { type: "number", min: 0, value: t.limit ?? "", onChange: (C) => m("limit", C.target.value ? Number(C.target.value) : null), placeholder: "Max items" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Sort" }),
                  /* @__PURE__ */ e(G, { type: "number", min: 0, value: t.sort, onChange: (C) => m("sort", Number(C.target.value) || 0) })
                ] })
              ] }) }),
              T.has("image") && /* @__PURE__ */ e(Je, { value: "image", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Image" }),
                  /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                    t.image && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: be(t.image) ?? void 0, alt: "", className: "h-full w-full object-cover" }) }),
                    /* @__PURE__ */ e(Ve, { value: t.image ?? null, onChange: (C) => m("image", C ? C.url : null), accept: "image/*" }),
                    t.image && /* @__PURE__ */ e(x, { type: "button", variant: "outline", "aria-label": "Remove image", className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive", onClick: () => m("image", null), children: "Remove" })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Alt Image" }),
                  /* @__PURE__ */ e(G, { value: t.alt_image ?? "", onChange: (C) => m("alt_image", C.target.value || null), placeholder: "Alt text" })
                ] })
              ] }) }),
              T.has("links") && /* @__PURE__ */ e(Je, { value: "link", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-2 sm:grid-cols-3", children: [
                /* @__PURE__ */ e(G, { value: N.label, onChange: (C) => m("links", [{ ...N, label: C.target.value }]), placeholder: "Label" }),
                /* @__PURE__ */ e(G, { value: N.url, onChange: (C) => m("links", [{ ...N, url: C.target.value }]), placeholder: "https://...", className: "sm:col-span-2" })
              ] }) }),
              (T.has("bg_color") || T.has("bg_image")) && /* @__PURE__ */ e(Je, { value: "background", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Background Image" }),
                  /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                    t.bg_image && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: be(t.bg_image) ?? void 0, alt: "", className: "h-full w-full object-cover" }) }),
                    /* @__PURE__ */ e(Ve, { value: t.bg_image ?? null, onChange: (C) => m("bg_image", C ? C.url : null), accept: "image/*" }),
                    t.bg_image && /* @__PURE__ */ e(x, { type: "button", variant: "outline", "aria-label": "Remove background image", className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive", onClick: () => m("bg_image", null), children: "Remove" })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Background Color" }),
                  /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ e("input", { type: "color", value: t.bg_color ?? "#ffffff", onChange: (C) => m("bg_color", C.target.value || null), className: "h-9 w-10 rounded-sm border p-1" }),
                    /* @__PURE__ */ e(G, { value: t.bg_color ?? "", onChange: (C) => m("bg_color", C.target.value || null), placeholder: "#000000" })
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ e(St, { showCloseButton: !0 })
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", onClick: (C) => {
          C.stopPropagation(), c();
        }, children: /* @__PURE__ */ e(we, { className: "h-4 w-4 text-destructive" }) }),
        s ? /* @__PURE__ */ e(bn, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ e(Ct, { className: "h-4 w-4 text-muted-foreground" })
      ] })
    ] }),
    s && /* @__PURE__ */ a(Te, { className: "space-y-5 px-3 py-4", children: [
      (T.has("caption") || T.has("title") || T.has("text")) && /* @__PURE__ */ a("div", { className: "space-y-4", children: [
        T.has("caption") && /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { children: "Caption" }),
          /* @__PURE__ */ e(G, { value: t.caption ?? "", onChange: (C) => m("caption", C.target.value || null), placeholder: "Enter your caption..." })
        ] }),
        T.has("title") && /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { children: "Heading" }),
          /* @__PURE__ */ e(G, { value: t.title ?? "", onChange: (C) => m("title", C.target.value || null), placeholder: "Enter your heading..." })
        ] }),
        T.has("text") && /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { children: "Text" }),
          /* @__PURE__ */ e(je, { value: t.text ?? "", onChange: (C) => m("text", C.target.value || null), placeholder: "Enter your text...", rows: 3 })
        ] })
      ] }),
      u && /* @__PURE__ */ a("div", { className: "space-y-3 border-t pt-5", children: [
        /* @__PURE__ */ a("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ a("div", { className: "space-y-1", children: [
            /* @__PURE__ */ a(R, { className: "text-sm font-semibold", children: [
              "Items",
              k ? ` · up to ${k} columns per row` : ""
            ] }),
            /* @__PURE__ */ a("div", { className: "flex items-center gap-3 text-xs font-medium text-muted-foreground", children: [
              /* @__PURE__ */ e("button", { type: "button", onClick: z, className: "hover:text-foreground", children: "Collapse all" }),
              /* @__PURE__ */ e("button", { type: "button", onClick: I, className: "hover:text-foreground", children: "Expand all" })
            ] })
          ] }),
          /* @__PURE__ */ a(
            x,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              disabled: v && (t.item?.length ?? 0) >= 1,
              onClick: (C) => {
                C.stopPropagation();
                const $ = M ? va(M) : {};
                m("item", [...t.item ?? [], $]);
              },
              className: "gap-1",
              children: [
                /* @__PURE__ */ e(Be, { className: "h-3.5 w-3.5" }),
                "Add Item"
              ]
            }
          )
        ] }),
        t.item && t.item.length > 0 ? /* @__PURE__ */ e(
          Kt,
          {
            items: (t.item ?? []).map((C, $) => `${t._instanceId}-item-${$}`),
            strategy: za,
            children: /* @__PURE__ */ e("div", { className: "grid gap-3 lg:grid-cols-2", children: t.item.map((C, $) => /* @__PURE__ */ e(
              kl,
              {
                id: `${t._instanceId}-item-${$}`,
                item: C,
                itemIdx: $,
                itemTemplate: M,
                onUpdateItemField: p,
                onRemove: (W) => m(
                  "item",
                  (t.item ?? []).filter((U, X) => X !== W)
                ),
                isExpanded: !S.has(`${t._instanceId}-item-${$}`),
                onToggleExpanded: () => y(`${t._instanceId}-item-${$}`),
                onDuplicate: (W) => m("item", [...t.item ?? [], { ...(t.item ?? [])[W] }])
              },
              `${t._instanceId}-item-${$}`
            )) })
          }
        ) : /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: 'No items added. Click "Add Item" to create one.' })
      ] }),
      t.links && t.links.length > 0 && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ a(He, { variant: "secondary", children: [
          t.links.length,
          " links"
        ] }),
        /* @__PURE__ */ e("span", { children: "embedded" })
      ] })
    ] })
  ] });
}
function _l(t) {
  const n = t.demo?.section ?? {}, s = (l) => typeof n[l] == "string" ? n[l] : null;
  return {
    id: `template-${t.type}`,
    type: t.type,
    caption: s("caption"),
    title: s("title"),
    text: s("text"),
    image: s("image"),
    alt_image: s("alt_image"),
    bg_color: s("bg_color"),
    bg_image: s("bg_image"),
    style_css: s("style_css"),
    style_css_inline: s("style_css_inline"),
    style_id: s("style_id"),
    alignment: s("alignment"),
    limit: null,
    sort: 0,
    sort_by: null,
    sort_order: null,
    category: null,
    links: null,
    item: Object.fromEntries(t.itemFields.map((l) => [l, null])),
    template: t
  };
}
function Ln({ embeddedSections: t, onChange: n }) {
  const s = Dn(), [l] = d(() => s.map(_l)), [i, r] = d(!1), [o, c] = d(/* @__PURE__ */ new Set()), [h, m] = d(/* @__PURE__ */ new Set()), [p, S] = d(/* @__PURE__ */ new Map()), y = Sa(
    jt(Pa, { activationConstraint: { distance: 6 } })
  );
  function z(k) {
    const N = l.find((w) => w.id === k);
    if (!N) return;
    let f = null, A = null, j = null;
    const _ = N.template?.itemMode !== "none";
    try {
      N.links && (f = JSON.parse(N.links));
    } catch {
    }
    const F = N.template?.demo?.items;
    _ && F?.length && (j = { ...N.item }, A = F.map((w) => ({
      ...w,
      links: Array.isArray(w.links) ? w.links.map((B) => ({ ...B })) : w.links
    })));
    try {
      if (_ && !A && N.item) {
        const w = typeof N.item == "string" ? JSON.parse(N.item) : N.item;
        w && !Array.isArray(w) ? (j = { ...w }, A = [va({ ...w })]) : Array.isArray(w) && (A = w, j = w.length > 0 ? { ...w[0] } : null);
      }
    } catch {
    }
    _ && !A && j && (A = [va(j)]);
    const K = {
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      id: N.id,
      type: N.type,
      caption: N.caption,
      title: N.title,
      text: N.text,
      image: N.image,
      alt_image: N.alt_image,
      bg_color: N.bg_color,
      bg_image: N.bg_image,
      style_css: N.style_css,
      style_css_inline: N.style_css_inline,
      style_id: N.style_id,
      alignment: N.alignment,
      limit: N.limit,
      sort: N.sort ?? 0,
      sort_by: N.sort_by,
      sort_order: N.sort_order,
      category: N.category,
      links: f,
      item: _ ? A && A.length > 0 ? A : [] : null
    }, D = t.length;
    n([...t, K]), r(!1), _ && j && S((w) => new Map(w).set(D, j)), c((w) => new Set(w).add(D));
  }
  function I(k) {
    n(t.filter((N, f) => f !== k));
  }
  function E(k) {
    const N = t[k];
    if (!N) return;
    const f = {
      ...N,
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      links: N.links?.map((A) => ({ ...A })) ?? null,
      item: N.item?.map((A) => ({ ...A })) ?? null
    };
    n([
      ...t.slice(0, k + 1),
      f,
      ...t.slice(k + 1)
    ]), c((A) => {
      const j = /* @__PURE__ */ new Set();
      return A.forEach((_) => j.add(_ > k ? _ + 1 : _)), j.add(k + 1), j;
    }), S((A) => {
      const j = /* @__PURE__ */ new Map();
      A.forEach((F, K) => {
        j.set(K > k ? K + 1 : K, F);
      });
      const _ = A.get(k);
      return _ && j.set(k + 1, { ..._ }), j;
    });
  }
  function M(k, N, f) {
    n(t.map((A, j) => j === k ? { ...A, [N]: f } : A));
  }
  function b(k, N, f, A) {
    n(
      t.map((j, _) => _ !== k || !j.item ? j : {
        ...j,
        item: j.item.map((F, K) => K === N ? { ...F, [f]: A } : F)
      })
    );
  }
  function g(k) {
    c((N) => {
      const f = new Set(N);
      return f.has(k) ? f.delete(k) : f.add(k), f;
    });
  }
  function u(k) {
    m((N) => {
      const f = new Set(N);
      return f.has(k) ? f.delete(k) : f.add(k), f;
    });
  }
  function v() {
    c(/* @__PURE__ */ new Set()), m(new Set(
      t.flatMap(
        (k) => (k.item ?? []).map((N, f) => `${k._instanceId}-item-${f}`)
      )
    ));
  }
  function T() {
    c(new Set(t.map((k, N) => N))), m(/* @__PURE__ */ new Set());
  }
  function O(k) {
    const { active: N, over: f } = k;
    if (!f || N.id === f.id) return;
    const A = String(N.id), j = String(f.id);
    if (!A.includes("-item-") && !j.includes("-item-")) {
      const _ = t.findIndex((K) => K._instanceId === A), F = t.findIndex((K) => K._instanceId === j);
      if (_ === -1 || F === -1) return;
      n(yt(t, _, F));
      return;
    }
    if (A.includes("-item-") && j.includes("-item-")) {
      const _ = A.split("-item-")[0], F = j.split("-item-")[0];
      if (_ !== F) return;
      const K = t.findIndex(($) => $._instanceId === _);
      if (K === -1) return;
      const D = t[K];
      if (!D.item) return;
      const w = parseInt(A.split("-item-")[1], 10), B = parseInt(j.split("-item-")[1], 10);
      if (isNaN(w) || isNaN(B)) return;
      const C = yt(D.item, w, B);
      n(
        t.map(
          ($, W) => W === K ? { ...$, item: C } : $
        )
      );
      return;
    }
  }
  return /* @__PURE__ */ a("div", { className: "space-y-3", children: [
    t.length > 0 && /* @__PURE__ */ a("div", { className: "flex items-center gap-3 px-0.5 text-xs font-medium", children: [
      /* @__PURE__ */ e("button", { type: "button", onClick: v, className: "text-muted-foreground transition-colors hover:text-foreground", children: "Collapse all" }),
      /* @__PURE__ */ e("button", { type: "button", onClick: T, className: "text-muted-foreground transition-colors hover:text-foreground", children: "Expand all" })
    ] }),
    /* @__PURE__ */ a(ut, { open: i, onOpenChange: r, children: [
      /* @__PURE__ */ e(
        Mt,
        {
          render: /* @__PURE__ */ a(x, { type: "button", variant: "outline", className: "gap-1.5", children: [
            /* @__PURE__ */ e(Be, { className: "h-3.5 w-3.5" }),
            "Add Section"
          ] })
        }
      ),
      /* @__PURE__ */ a(mt, { className: "sm:max-w-lg", children: [
        /* @__PURE__ */ a(ht, { children: [
          /* @__PURE__ */ e(gt, { children: "Add Section" }),
          /* @__PURE__ */ e(Da, { children: "Select a developer-provided section template. Its fields and layout are defined in code." })
        ] }),
        /* @__PURE__ */ a("div", { className: "max-h-[60vh] space-y-2 overflow-y-auto pr-1", children: [
          l.map((k) => /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              className: "h-auto w-full justify-start px-3 py-3 text-left",
              onClick: () => z(k.id),
              children: /* @__PURE__ */ a("span", { className: "flex flex-col items-start gap-0.5", children: [
                /* @__PURE__ */ e("span", { children: k.template?.label ?? k.type }),
                k.template?.description && /* @__PURE__ */ e("span", { className: "text-xs font-normal text-muted-foreground", children: k.template.description })
              ] })
            },
            k.id
          )),
          l.length === 0 && /* @__PURE__ */ e("p", { className: "py-6 text-center text-sm text-muted-foreground", children: "No sections available." })
        ] })
      ] })
    ] }),
    t.length > 0 && /* @__PURE__ */ e(_a, { sensors: y, collisionDetection: Aa, onDragEnd: O, children: /* @__PURE__ */ e(Kt, { items: t.map((k) => k._instanceId), strategy: za, children: /* @__PURE__ */ e("div", { className: "space-y-3", children: t.map((k, N) => /* @__PURE__ */ e(
      Pl,
      {
        section: k,
        index: N,
        isExpanded: o.has(N),
        itemTemplate: p.get(N) ?? null,
        availableSections: l,
        template: s.find((f) => f.type === k.type) ?? null,
        onToggleExpanded: () => g(N),
        onRemove: () => I(N),
        onDuplicate: () => E(N),
        onUpdateField: (f, A) => M(N, f, A),
        onUpdateItemField: (f, A, j) => b(N, f, A, j),
        collapsedItems: h,
        onToggleItemExpanded: u,
        onCollapseItems: () => m((f) => /* @__PURE__ */ new Set([...f, ...(k.item ?? []).map((A, j) => `${k._instanceId}-item-${j}`)])),
        onExpandItems: () => m((f) => {
          const A = new Set(f);
          return (k.item ?? []).forEach((j, _) => A.delete(`${k._instanceId}-item-${_}`)), A;
        })
      },
      k._instanceId
    )) }) }) }),
    t.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No sections embedded. Pick one from above." })
  ] });
}
function Al({
  options: t,
  selected: n,
  onChange: s,
  placeholder: l = "Select...",
  className: i
}) {
  const [r, o] = Ne.useState(!1), c = Ne.useRef(null);
  Ne.useEffect(() => {
    function S(y) {
      c.current && !c.current.contains(y.target) && o(!1);
    }
    return document.addEventListener("mousedown", S), () => document.removeEventListener("mousedown", S);
  }, []);
  function h(S) {
    n.includes(S) ? s(n.filter((y) => y !== S)) : s([...n, S]);
  }
  function m(S) {
    s(n.filter((y) => y !== S));
  }
  const p = t.filter((S) => n.includes(S.value)).map((S) => S.label);
  return /* @__PURE__ */ a("div", { ref: c, className: P("relative", i), children: [
    /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: () => o(!r),
        className: P(
          "flex min-h-[40px] w-full items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          p.length === 0 && "text-muted-foreground"
        ),
        children: [
          p.length > 0 ? /* @__PURE__ */ a("div", { className: "flex flex-1 flex-wrap gap-1", children: [
            p.slice(0, 3).map((S) => /* @__PURE__ */ a(
              He,
              {
                variant: "secondary",
                className: "px-1.5 py-0 text-xs font-normal",
                children: [
                  S,
                  /* @__PURE__ */ e(
                    "button",
                    {
                      type: "button",
                      onClick: (y) => {
                        y.stopPropagation();
                        const z = t.find((I) => I.label === S);
                        z && m(z.value);
                      },
                      className: "ml-1 rounded-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      children: /* @__PURE__ */ e(Vt, { className: "h-3 w-3 text-muted-foreground hover:text-foreground" })
                    }
                  )
                ]
              },
              S
            )),
            p.length > 3 && /* @__PURE__ */ a(He, { variant: "secondary", className: "px-1.5 py-0 text-xs font-normal", children: [
              "+",
              p.length - 3
            ] })
          ] }) : /* @__PURE__ */ e("span", { className: "flex-1 text-left", children: l }),
          /* @__PURE__ */ e(
            Ct,
            {
              className: P(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                r && "rotate-180"
              )
            }
          )
        ]
      }
    ),
    r && /* @__PURE__ */ e("div", { className: "absolute z-50 mt-1 w-full rounded-sm border border-border bg-popover p-1 shadow-md", children: t.length === 0 ? /* @__PURE__ */ e("p", { className: "px-2 py-4 text-center text-sm text-muted-foreground", children: "No options available." }) : /* @__PURE__ */ e("div", { className: "max-h-48 overflow-y-auto", children: t.map((S) => {
      const y = n.includes(S.value);
      return /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          onClick: () => h(S.value),
          className: P(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:bg-accent focus-visible:text-accent-foreground",
            y && "bg-accent/50"
          ),
          children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: P(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                  y ? "border-primary bg-primary text-primary-foreground" : "border-input"
                ),
                children: y && /* @__PURE__ */ e(Ht, { className: "h-3 w-3" })
              }
            ),
            /* @__PURE__ */ e("span", { children: S.label })
          ]
        },
        S.value
      );
    }) }) })
  ] });
}
const zl = ce(async () => ({ default: (await Promise.resolve().then(() => Fn)).TiptapEditor }));
function Rn({ post: t, categories: n = [], mode: s, pageTitle: l, defaultType: i }) {
  const { session: r } = et(), [o, c] = wt(), [h, m] = d({}), [p, S] = d(null), [y, z] = d(t?.title ?? ""), [I, E] = d(t?.status === "published" ? "published" : "draft"), [M, b] = d(t?.publishedAt ?? null), [g, u] = d(!1), v = I === "published" && !!M && M > Date.now(), [T, O] = d(t?.slug ?? ""), [k, N] = d(!!t?.slug), [f] = d(t?.type ?? i ?? "post"), A = r?.permissions.includes(`content.${f}.publish`) ?? !1, j = r?.permissions.includes(`content.${f}.unpublish`) ?? !1, [_, F] = d(t?.excerpt ?? ""), [K, D] = d(t?.description ?? ""), [w, B] = d(() => {
    if (t?.tags)
      try {
        const V = JSON.parse(t.tags);
        return Array.isArray(V) ? V.join(", ") : "";
      } catch {
        return "";
      }
    return "";
  }), [C, $] = d(() => t?.categories?.map((V) => V.id) ?? []), [W, U] = d(t?.metaTitle ?? ""), [X, L] = d(t?.metaDescription ?? ""), [q, Z] = d(t?.featuredImage ?? ""), [Q, ye] = d(() => {
    if (!t?.gallery) return [];
    try {
      const V = JSON.parse(t.gallery);
      return Array.isArray(V) ? V.filter((pe) => typeof pe == "string") : [];
    } catch {
      return [];
    }
  }), [me, ue] = d(() => {
    if (t?.customFieldValues)
      try {
        return JSON.parse(t.customFieldValues);
      } catch {
        return {};
      }
    return {};
  }), [H, he] = d(() => {
    if (t?.sections)
      try {
        const V = JSON.parse(t.sections);
        return (Array.isArray(V) ? V : []).map((ae) => {
          const ne = ae && typeof ae == "object" ? ae : {};
          return {
            ...ne,
            _instanceId: ne._instanceId || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          };
        });
      } catch {
        return [];
      }
    return [];
  }), [_e, ea] = d(!1), [Hn, Vn] = d(null), Gn = Sa(
    jt(Pa, { activationConstraint: { distance: 6 } })
  );
  te(() => {
    !k && s === "create" && O(La(y));
  }, [y, k, s]), te(() => {
    const V = Zt();
    let pe = !1;
    const ae = V.contentTypes.find((ne) => ne.slug === f)?.detailTemplate;
    return pe || (Vn(ae ?? null), ea(ae ? V.templates.find((ne) => ne.id === ae && ne.kind === "detail")?.sectionsEnabled === !0 : !1)), () => {
      pe = !0;
    };
  }, [f]);
  function qn(V) {
    N(!0), O(V);
  }
  function Kn(V) {
    const { active: pe, over: ae } = V;
    !ae || pe.id === ae.id || ye((ne) => {
      const Pt = ne.indexOf(String(pe.id)), Ra = ne.indexOf(String(ae.id));
      return Pt === -1 || Ra === -1 ? ne : yt(ne, Pt, Ra);
    });
  }
  function Wn(V) {
    V.preventDefault(), m({}), S(null);
    const pe = w.split(",").map((ne) => ne.trim()).filter((ne) => ne.length > 0), ae = {
      title: y,
      type: f,
      status: I
    };
    _.trim() && (ae.excerpt = _), K.trim() && (ae.description = K), W.trim() && (ae.metaTitle = W), X.trim() && (ae.metaDescription = X), q.trim() && (ae.featuredImage = q), T && (ae.slug = T), pe.length > 0 && (ae.tags = pe), C.length > 0 && (ae.categoryIds = C), Object.keys(me).length > 0 && (ae.customFieldValues = me), H.length > 0 && (ae.sections = H.map((ne) => {
      const Pt = { ...ne };
      return Reflect.deleteProperty(Pt, "_instanceId"), Pt;
    })), Q.length > 0 && (ae.gallery = Q), I === "published" && M && (ae.publishedAt = M), c(async () => {
      let ne;
      s === "edit" && t ? ne = await rt(`/api/admin/posts/${t.id}`, ae) : ne = await Se("/api/admin/posts", ae), ne.success ? (Y.success(s === "edit" ? "update" : "create", f), Fe(`/admin/posts/${f}`)) : ne.errors && Object.keys(ne.errors).length > 0 ? (m(ne.errors), Y.error(ne.message)) : (S(ne.message), Y.error(ne.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: Wn, className: "", children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: l || "Projects",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: o, children: o ? s === "edit" ? "Saving…" : "Creating…" : s === "edit" ? "Save Changes" : `Create ${f.charAt(0).toUpperCase() + f.slice(1)}` }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Fe("/admin/posts"),
              disabled: o,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "p-4 space-y-4", children: /* @__PURE__ */ a("div", { className: "space-y-4", children: [
      p && /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: p }),
      /* @__PURE__ */ a("div", { className: "grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]", children: [
        /* @__PURE__ */ a("div", { className: "space-y-4", children: [
          /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(ze, { className: "", children: /* @__PURE__ */ a(Ie, { className: "text-base", children: [
              f.charAt(0).toUpperCase() + f.slice(1),
              " Details"
            ] }) }),
            /* @__PURE__ */ a(Te, { className: "space-y-5", children: [
              /* @__PURE__ */ a("div", { className: "space-y-5", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { htmlFor: "title", children: "Title" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      id: "title",
                      value: y,
                      onChange: (V) => z(V.target.value),
                      placeholder: `${f.charAt(0).toUpperCase() + f.slice(1)} title`,
                      "aria-invalid": !!h.title,
                      "aria-describedby": h.title ? "title-error" : void 0
                    }
                  ),
                  h.title && /* @__PURE__ */ e("p", { id: "title-error", className: "text-xs text-destructive", children: h.title[0] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { htmlFor: "slug", children: "Slug" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      id: "slug",
                      value: T,
                      onChange: (V) => qn(V.target.value),
                      placeholder: `${f}-url-slug`,
                      "aria-invalid": !!h.slug,
                      "aria-describedby": h.slug ? "slug-error" : void 0
                    }
                  ),
                  h.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: h.slug[0] }),
                  !k && s === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from title. Edit to customize." })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5 md:col-span-2", children: [
                  /* @__PURE__ */ e(R, { htmlFor: "excerpt", children: "Excerpt" }),
                  /* @__PURE__ */ e(
                    je,
                    {
                      id: "excerpt",
                      value: _,
                      onChange: (V) => F(V.target.value),
                      placeholder: `Brief summary of the ${f}...`,
                      rows: 3,
                      "aria-invalid": !!h.excerpt,
                      "aria-describedby": h.excerpt ? "excerpt-error" : void 0
                    }
                  ),
                  h.excerpt && /* @__PURE__ */ e("p", { id: "excerpt-error", className: "text-xs text-destructive", children: h.excerpt[0] })
                ] })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(R, { children: "Content" }),
                /* @__PURE__ */ e(
                  ya,
                  {
                    fallback: /* @__PURE__ */ e("div", { className: "min-h-64 rounded-sm border bg-muted/20", "aria-busy": "true" }),
                    children: /* @__PURE__ */ e(
                      zl,
                      {
                        content: K,
                        onChange: D,
                        placeholder: `Write your ${f} content here...`
                      }
                    )
                  }
                ),
                h.description && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: h.description[0] })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(R, { htmlFor: "gallery", children: "Gallery" }),
                /* @__PURE__ */ a("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4 space-y-3", children: [
                  /* @__PURE__ */ e(
                    Ve,
                    {
                      value: Q[0] ?? null,
                      onChange: (V) => {
                        if (!V) {
                          ye([]);
                          return;
                        }
                        ye((pe) => [V.url, ...pe.filter((ae) => ae !== V.url)]);
                      },
                      onSelect: (V) => {
                        ye((pe) => {
                          const ae = [...pe];
                          for (const ne of V)
                            ae.includes(ne.url) || ae.push(ne.url);
                          return ae;
                        });
                      },
                      accept: "image/*",
                      multiple: !0,
                      maxFiles: 20,
                      trigger: /* @__PURE__ */ e(x, { type: "button", variant: "outline", className: "gap-2", children: "Add Media" })
                    }
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Add multiple images and reorder them visually. Stored as JSON." }),
                  Q.length > 0 && /* @__PURE__ */ e(
                    _a,
                    {
                      sensors: Gn,
                      collisionDetection: Aa,
                      onDragEnd: Kn,
                      children: /* @__PURE__ */ e(Kt, { items: Q, strategy: Es, children: /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2", children: Q.map((V) => /* @__PURE__ */ e(
                        Il,
                        {
                          url: V,
                          onRemove: () => ye((pe) => pe.filter((ae) => ae !== V))
                        },
                        V
                      )) }) })
                    }
                  )
                ] }),
                h.gallery && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: h.gallery[0] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(ze, { className: "", children: /* @__PURE__ */ e(Ie, { className: "text-base", children: "SEO" }) }),
            /* @__PURE__ */ a(Te, { className: "space-y-5", children: [
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(R, { htmlFor: "metaTitle", children: "Meta Title" }),
                /* @__PURE__ */ e(
                  G,
                  {
                    id: "metaTitle",
                    value: W,
                    onChange: (V) => U(V.target.value),
                    placeholder: "SEO title (max 60 characters)",
                    maxLength: 60,
                    "aria-invalid": !!h.metaTitle,
                    "aria-describedby": h.metaTitle ? "metaTitle-error" : void 0
                  }
                ),
                /* @__PURE__ */ a("div", { className: "flex justify-between", children: [
                  h.metaTitle ? /* @__PURE__ */ e("p", { id: "metaTitle-error", className: "text-xs text-destructive", children: h.metaTitle[0] }) : /* @__PURE__ */ e("span", {}),
                  /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
                    W.length,
                    "/60"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(R, { htmlFor: "metaDescription", children: "Meta Description" }),
                /* @__PURE__ */ e(
                  je,
                  {
                    id: "metaDescription",
                    value: X,
                    onChange: (V) => L(V.target.value),
                    placeholder: "SEO description (max 160 characters)",
                    maxLength: 160,
                    rows: 4,
                    "aria-invalid": !!h.metaDescription,
                    "aria-describedby": h.metaDescription ? "metaDescription-error" : void 0
                  }
                ),
                /* @__PURE__ */ a("div", { className: "flex justify-between", children: [
                  h.metaDescription ? /* @__PURE__ */ e("p", { id: "metaDescription-error", className: "text-xs text-destructive", children: h.metaDescription[0] }) : /* @__PURE__ */ e("span", {}),
                  /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
                    X.length,
                    "/160"
                  ] })
                ] })
              ] })
            ] })
          ] }),
          _e && /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(ze, { className: "", children: /* @__PURE__ */ e(Ie, { className: "text-base", children: "Sections" }) }),
            /* @__PURE__ */ a(Te, { className: "", children: [
              /* @__PURE__ */ e(
                Ln,
                {
                  embeddedSections: H,
                  onChange: he
                }
              ),
              h.sections && /* @__PURE__ */ e("p", { className: "text-xs text-destructive mt-2", children: h.sections[0] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-4", children: [
          /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(ze, { children: /* @__PURE__ */ e(Ie, { className: "text-base", children: "Visibility" }) }),
            /* @__PURE__ */ a(Te, { className: "space-y-3", children: [
              /* @__PURE__ */ a("button", { type: "button", disabled: !A, className: "flex items-center gap-2 text-sm disabled:opacity-50", onClick: () => {
                E("published"), b(null);
              }, children: [
                /* @__PURE__ */ e("span", { className: `size-4 rounded-full border-4 ${I === "published" && !v ? "border-foreground" : "border-transparent ring-1 ring-border"}` }),
                "Publish"
              ] }),
              /* @__PURE__ */ a("button", { type: "button", disabled: !j, className: "flex items-center gap-2 text-sm disabled:opacity-50", onClick: () => {
                E("draft"), b(null);
              }, children: [
                /* @__PURE__ */ e("span", { className: `size-4 rounded-full border-4 ${I === "draft" || v ? "border-foreground" : "border-transparent ring-1 ring-border"}` }),
                "Draft"
              ] }),
              v ? /* @__PURE__ */ a("div", { className: "ml-6 flex items-start justify-between gap-2 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ a("span", { children: [
                  "Will publish on ",
                  new Date(M).toLocaleString()
                ] }),
                /* @__PURE__ */ a("div", { className: "flex", children: [
                  /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": "Edit publish date", disabled: !A, onClick: () => u(!0), children: /* @__PURE__ */ e(fn, {}) }),
                  /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": "Remove publish date", disabled: !j, onClick: () => {
                    E("draft"), b(null);
                  }, children: /* @__PURE__ */ e(we, {}) })
                ] })
              ] }) : /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "sm", className: "ml-5", disabled: !A, onClick: () => u(!0), children: "Schedule publish" })
            ] })
          ] }),
          /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(ze, { children: /* @__PURE__ */ e(Ie, { className: "text-base", children: "Image" }) }),
            /* @__PURE__ */ a(Te, { className: "space-y-5", children: [
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
                q ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: be(q) ?? void 0,
                    alt: "Featured image preview",
                    className: "object-cover h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No image" }),
                /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Ve,
                    {
                      value: q,
                      onChange: (V) => {
                        Z(V ? V.url : "");
                      },
                      accept: "image/*"
                    },
                    q || "empty"
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose a hero image from the media library." }),
                  q && /* @__PURE__ */ e(
                    x,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "aria-label": "Remove image",
                      className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                      onClick: () => Z(""),
                      children: "Remove"
                    }
                  )
                ] })
              ] }) }),
              h.featuredImage && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: h.featuredImage[0] })
            ] })
          ] }),
          /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(ze, { children: /* @__PURE__ */ e(Ie, { className: "text-base", children: "Organization" }) }),
            /* @__PURE__ */ a(Te, { className: "flex flex-col gap-5", children: [
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(R, { htmlFor: "tags", children: "Tags" }),
                /* @__PURE__ */ e(
                  G,
                  {
                    id: "tags",
                    value: w,
                    onChange: (V) => B(V.target.value),
                    placeholder: "tag1, tag2, tag3 (comma-separated)",
                    "aria-invalid": !!h.tags,
                    "aria-describedby": h.tags ? "tags-error" : void 0
                  }
                ),
                h.tags && /* @__PURE__ */ e("p", { id: "tags-error", className: "text-xs text-destructive", children: h.tags[0] }),
                w && /* @__PURE__ */ e("div", { className: "flex flex-wrap gap-1 mt-1", children: w.split(",").map((V) => V.trim()).filter((V) => V.length > 0).map((V, pe) => /* @__PURE__ */ e(He, { variant: "outline", className: "text-xs", children: V }, pe)) })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(R, { children: "Categories" }),
                n.length > 0 ? /* @__PURE__ */ e(
                  Al,
                  {
                    options: n.map((V) => ({
                      value: V.id,
                      label: V.name
                    })),
                    selected: C,
                    onChange: $,
                    placeholder: "Select categories..."
                  }
                ) : /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No categories available. Create categories first." }),
                h.categoryIds && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: h.categoryIds[0] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(ze, { children: /* @__PURE__ */ e(Ie, { className: "text-base", children: "Custom fields" }) }),
            /* @__PURE__ */ e(Te, { children: /* @__PURE__ */ e(xl, { detailTemplate: Hn, values: me, onChange: ue }) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ e(ut, { open: g, onOpenChange: u, children: /* @__PURE__ */ a(mt, { children: [
      /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "Set visibility date" }) }),
      /* @__PURE__ */ e("input", { type: "datetime-local", className: "w-full rounded-sm border px-3 py-2", value: M ? new Date(M - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "", onChange: (V) => b(V.target.value ? new Date(V.target.value).getTime() : null) }),
      /* @__PURE__ */ a(St, { children: [
        /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => u(!1), children: "Cancel" }),
        /* @__PURE__ */ e(x, { type: "button", disabled: !M, onClick: () => {
          E("published"), u(!1);
        }, children: "Set visibility date" })
      ] })
    ] }) })
  ] });
}
function Il({
  url: t,
  onRemove: n
}) {
  const { attributes: s, listeners: l, setNodeRef: i, transform: r, transition: o, isDragging: c } = qt({ id: t });
  return /* @__PURE__ */ a(
    "div",
    {
      ref: i,
      style: {
        transform: Wt.Transform.toString(r),
        transition: o
      },
      className: `overflow-hidden rounded-sm border bg-muted ${c ? "opacity-60" : ""}`,
      children: [
        /* @__PURE__ */ a("div", { className: "flex items-center justify-between border-b bg-background/70 px-2 py-1", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cursor-grab text-muted-foreground hover:text-foreground",
              "aria-label": "Drag to reorder",
              ...s,
              ...l,
              children: /* @__PURE__ */ e(Gt, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", onClick: n, children: /* @__PURE__ */ e(we, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ e("div", { className: "relative aspect-square", children: /* @__PURE__ */ e("img", { src: be(t) ?? void 0, alt: "Gallery image", className: "object-cover h-full w-full" }) })
      ]
    }
  );
}
function Tl() {
  const { type: t = "post" } = qe(), [n, s] = d([]), [l, i] = d(!0);
  return te(() => {
    const r = new URLSearchParams();
    r.set("type", t), de(`/api/admin/categories?${r.toString()}`).then((o) => {
      s(o), i(!1);
    });
  }, [t]), l ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    Rn,
    {
      mode: "create",
      categories: n,
      pageTitle: `Create ${t.charAt(0).toUpperCase() + t.slice(1)}`,
      defaultType: t
    }
  ) });
}
function Dl({ id: t }) {
  const { type: n = "post" } = qe(), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!0);
  return te(() => {
    Promise.all([
      de(`/api/admin/posts/${t}`),
      de("/api/admin/categories")
    ]).then(([h, m]) => {
      l(h), r(m), c(!1);
    });
  }, [t]), o ? /* @__PURE__ */ e(ge, {}) : s ? /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    Rn,
    {
      mode: "edit",
      post: s,
      categories: i,
      pageTitle: `Edit ${n.charAt(0).toUpperCase() + n.slice(1)}`,
      defaultType: n
    }
  ) }) : /* @__PURE__ */ a("main", { className: "p-6", children: [
    n.charAt(0).toUpperCase() + n.slice(1),
    " not found."
  ] });
}
const Mn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminPostCreatePage: Tl,
  AdminPostEditPage: Dl
}, Symbol.toStringTag, { value: "Module" }));
function El() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), [h, m] = d(!1), [p, S] = d(""), [y, z] = d(null), [I, E] = d(!1), M = dt(), b = Ze(), g = "page", u = "/admin/posts/page", [v, T] = d(
    new URLSearchParams(M.search).get("search") ?? ""
  ), [O, k] = d(
    new URLSearchParams(M.search).get("status") ?? "all"
  ), [N, f] = d(
    new URLSearchParams(M.search).get("sortBy") ?? ""
  ), [A, j] = d(
    new URLSearchParams(M.search).get("sortOrder") ?? ""
  );
  async function _() {
    l(null);
    const H = new URLSearchParams();
    v && H.set("search", v), O && O !== "all" && H.set("status", O), N && H.set("sortBy", N), A && H.set("sortOrder", A), H.set("type", g);
    const he = H.toString() ? `?${H.toString()}` : "", _e = await de(`/api/admin/posts${he}`);
    n(_e), r([]);
  }
  te(() => {
    _().catch((H) => l(H.message));
  }, [M.search, g]);
  function F() {
    b(Ce(u, { search: v, status: O, sortBy: N, sortOrder: A }));
  }
  function K(H) {
    const he = N === H && A === "asc" ? "desc" : "asc";
    f(H), j(he), b(Ce(u, { search: v, status: O, sortBy: H, sortOrder: he }));
  }
  function D(H) {
    H.key === "Enter" && (H.preventDefault(), F());
  }
  const w = Oe(!0);
  te(() => {
    if (w.current) {
      w.current = !1;
      return;
    }
    const H = setTimeout(() => {
      F();
    }, 400);
    return () => clearTimeout(H);
  }, [v, O, g]);
  const B = J((H) => {
    t?.data && r(H ? t.data.map((he) => he.id) : []);
  }, [t]), C = J((H, he) => {
    r(
      (_e) => he ? [..._e, H] : _e.filter((ea) => ea !== H)
    );
  }, []), $ = t !== null && t.data.length > 0 && i.length === t.data.length, W = i.length > 0;
  function U(H) {
    m(H), H || (S(""), z(null));
  }
  async function X(H) {
    H.preventDefault();
    const he = p.trim();
    if (!he) {
      z("Title is required.");
      return;
    }
    z(null), E(!0);
    const _e = await Se("/api/admin/posts", {
      title: he,
      type: g,
      status: "draft"
    });
    if (E(!1), _e.success) {
      Y.success("create", "page"), b(`${u}/${_e.data.id}/edit`);
      return;
    }
    z(_e.errors?.title?.[0] ?? _e.message), Y.error(_e.message);
  }
  async function L(H) {
    if (i.length === 0) return;
    c(!0);
    const he = await Se(H, { ids: i });
    c(!1), he.success ? (Y.success("update", "page"), await _()) : Y.error(he.message);
  }
  const q = J(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} page(s)? This action cannot be undone.`) && await L("/api/admin/posts/bulk/delete");
  }, [i]), Z = J(async () => {
    await L("/api/admin/posts/bulk/publish");
  }, [i]), Q = J(async () => {
    await L("/api/admin/posts/bulk/unpublish");
  }, [i]), ye = J(async () => {
    await L("/api/admin/posts/bulk/duplicate");
  }, [i]);
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const me = t.data ?? [];
  function ue(H) {
    return Ce(u, { search: v, status: O, sortBy: N, sortOrder: A, page: H });
  }
  return /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Pages",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by title...",
            value: v,
            onChange: (H) => T(H.target.value),
            onKeyDown: D,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ a(x, { type: "button", size: "lg", onClick: () => m(!0), children: [
          "New ",
          g.charAt(0).toUpperCase() + g.slice(1)
        ] })
      }
    ),
    /* @__PURE__ */ e(ut, { open: h, onOpenChange: U, children: /* @__PURE__ */ a(mt, { children: [
      /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "New Page" }) }),
      /* @__PURE__ */ a("form", { onSubmit: X, className: "space-y-4", children: [
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "new-page-title", children: "Title" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "new-page-title",
              value: p,
              onChange: (H) => {
                S(H.target.value), y && z(null);
              },
              placeholder: "Page title",
              autoFocus: !0,
              "aria-invalid": !!y,
              "aria-describedby": y ? "new-page-title-error" : void 0
            }
          ),
          y && /* @__PURE__ */ e("p", { id: "new-page-title-error", className: "text-xs text-destructive", children: y })
        ] }),
        /* @__PURE__ */ a(St, { children: [
          /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => U(!1), disabled: I, children: "Cancel" }),
          /* @__PURE__ */ e(x, { type: "submit", disabled: I, children: I ? "Creating…" : "Create Page" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ a(De, { value: O, onValueChange: (H) => {
          H && k(H);
        }, children: [
          /* @__PURE__ */ e(Le, { className: "w-[140px]", children: /* @__PURE__ */ e(Ee, { placeholder: "Status" }) }),
          /* @__PURE__ */ a(Re, { children: [
            /* @__PURE__ */ e(ie, { value: "all", children: "All Status" }),
            /* @__PURE__ */ e(ie, { value: "draft", children: "Draft" }),
            /* @__PURE__ */ e(ie, { value: "published", children: "Published" })
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: F, children: "Filter" })
      ] }),
      W && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          i.length,
          " selected"
        ] }),
        /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: Z,
              disabled: o,
              children: "Publish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: Q,
              disabled: o,
              children: "Unpublish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: ye,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: q,
              disabled: o,
              children: "Delete"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => r([]),
              disabled: o,
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ a(It, { children: [
        /* @__PURE__ */ e(Tt, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: $,
              onCheckedChange: (H) => B(H === !0),
              "aria-label": "Select all pages"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => K("title"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Title",
                N === "title" ? A === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Status" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => K("updatedAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Updated",
                N === "updatedAt" ? A === "asc" ? /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Xe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Qe, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Dt, { children: me.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(re, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No pages found." }) }) : me.map((H) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(re, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(H.id),
              onCheckedChange: (he) => C(H.id, he === !0),
              "aria-label": `Select ${H.title}`
            }
          ) }),
          /* @__PURE__ */ e(re, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `${u}/${H.id}/edit`, className: "underline", children: H.title }) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(
            He,
            {
              variant: H.status === "published" ? "default" : "secondary",
              className: H.status === "published" ? "border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300" : "capitalize",
              children: H.status
            }
          ) }),
          /* @__PURE__ */ e(re, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(H.updatedAt * 1e3).toLocaleDateString() })
        ] }, H.id)) })
      ] }),
      t.meta && /* @__PURE__ */ a("div", { className: "flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ a("span", { children: [
          "Showing ",
          t.meta.from,
          "–",
          t.meta.to,
          " of ",
          t.meta.total
        ] }),
        /* @__PURE__ */ a("div", { className: "flex gap-2", children: [
          t.meta.currentPage > 1 && /* @__PURE__ */ e(fe, { to: ue(t.meta.currentPage - 1), className: "hover:text-foreground hover:underline", children: "Previous" }),
          t.meta.currentPage < t.meta.lastPage && /* @__PURE__ */ e(fe, { to: ue(t.meta.currentPage + 1), className: "hover:text-foreground hover:underline", children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
const Ll = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminContentListPage: El
}, Symbol.toStringTag, { value: "Module" })), Rl = ce(async () => ({ default: (await Promise.resolve().then(() => Fn)).TiptapEditor }));
function Ml(t) {
  if (!t) return [];
  try {
    const n = JSON.parse(t);
    return Array.isArray(n) ? n.map((s) => ({
      ...s,
      _instanceId: s._instanceId || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    })) : [];
  } catch {
    return [];
  }
}
function $n({ page: t, mode: n }) {
  const [s, l] = wt(), [i, r] = d({}), [o, c] = d(null), [h, m] = d(!1), [p, S] = d(t?.title ?? ""), [y, z] = d(t?.slug ?? ""), [I, E] = d(!!t?.slug), [M, b] = d(t?.description ?? ""), [g, u] = d(
    () => Ml(t?.sections)
  );
  te(() => {
    !I && n === "create" && z(La(p));
  }, [p, I, n]);
  function v(T) {
    T.preventDefault(), r({}), c(null);
    const O = {
      title: p,
      type: "page",
      status: t?.status ?? "draft"
    };
    y && (O.slug = y), M.trim() && (O.description = M), g.length > 0 && (O.sections = g.map((k) => {
      const N = { ...k };
      return Reflect.deleteProperty(N, "_instanceId"), N;
    })), l(async () => {
      const k = n === "edit" && t ? await rt(`/api/admin/posts/${t.id}`, O) : await Se("/api/admin/posts", O);
      if (k.success) {
        Y.success(n === "edit" ? "update" : "create", "post"), Fe("/admin/posts/page");
        return;
      }
      k.errors && Object.keys(k.errors).length > 0 ? r(k.errors) : c(k.message), Y.error(k.message);
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: v, className: "", children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: n === "edit" ? "Edit Page" : "Create Page",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: s, children: s ? n === "edit" ? "Saving…" : "Creating…" : n === "edit" ? "Save Changes" : "Create Page" }),
          /* @__PURE__ */ a(ut, { open: h, onOpenChange: m, children: [
            /* @__PURE__ */ e(
              Mt,
              {
                render: /* @__PURE__ */ a(x, { type: "button", variant: "outline", disabled: s, children: [
                  /* @__PURE__ */ e(Ca, {}),
                  "Settings"
                ] })
              }
            ),
            /* @__PURE__ */ a(mt, { className: "sm:max-w-2xl", showCloseButton: !1, children: [
              /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "Page Details" }) }),
              /* @__PURE__ */ a("div", { className: "space-y-5", children: [
                /* @__PURE__ */ a("div", { className: "grid gap-5", children: [
                  /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                    /* @__PURE__ */ e(R, { htmlFor: "title", children: "Title" }),
                    /* @__PURE__ */ e(G, { id: "title", value: p, onChange: (T) => S(T.target.value), placeholder: "Page title", "aria-invalid": !!i.title, "aria-describedby": i.title ? "title-error" : void 0 }),
                    i.title && /* @__PURE__ */ e("p", { id: "title-error", className: "text-xs text-destructive", children: i.title[0] })
                  ] }),
                  /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                    /* @__PURE__ */ e(R, { htmlFor: "slug", children: "Slug" }),
                    /* @__PURE__ */ e(G, { id: "slug", value: y, onChange: (T) => {
                      E(!0), z(T.target.value);
                    }, placeholder: "page-url-slug", "aria-invalid": !!i.slug, "aria-describedby": i.slug ? "slug-error" : void 0 }),
                    i.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: i.slug[0] }),
                    !I && n === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from title. Edit to customize." })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(R, { children: "Content" }),
                  /* @__PURE__ */ e(ya, { fallback: /* @__PURE__ */ e("div", { className: "min-h-64 rounded-sm border bg-muted/20", "aria-busy": "true" }), children: /* @__PURE__ */ e(Rl, { content: M, onChange: b, placeholder: "Write your page content here..." }) }),
                  i.description && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: i.description[0] })
                ] })
              ] }),
              /* @__PURE__ */ e(St, { children: /* @__PURE__ */ e(Ji, { render: /* @__PURE__ */ e(x, { type: "button", variant: "outline" }), children: "Done" }) })
            ] })
          ] }),
          /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => Fe("/admin/posts/page"), disabled: s, children: "Cancel" })
        ] })
      }
    ),
    /* @__PURE__ */ a("div", { className: "space-y-4 p-4", children: [
      o && /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: o }),
      /* @__PURE__ */ a(Ae, { className: "overflow-hidden border-border/60 shadow-sm", children: [
        /* @__PURE__ */ e(ze, { children: /* @__PURE__ */ e(Ie, { className: "text-base", children: "Sections" }) }),
        /* @__PURE__ */ a(Te, { className: "", children: [
          /* @__PURE__ */ e(Ln, { embeddedSections: g, onChange: u }),
          i.sections && /* @__PURE__ */ e("p", { className: "mt-2 text-xs text-destructive", children: i.sections[0] })
        ] })
      ] })
    ] })
  ] });
}
function $l() {
  return /* @__PURE__ */ e($n, { mode: "create" });
}
function Ol({ id: t }) {
  const [n, s] = d(null), [l, i] = d(!0);
  return te(() => {
    de(`/api/admin/posts/${t}`).then((r) => {
      s(r), i(!1);
    });
  }, [t]), l ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ e($n, { mode: "edit", page: n }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Page not found." });
}
const On = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminPageCreatePage: $l,
  AdminPageEditPage: Ol
}, Symbol.toStringTag, { value: "Module" }));
function Bl({
  groupedPermissions: t,
  selectedIds: n,
  onChange: s
}) {
  const l = Object.keys(t).sort();
  function i(c) {
    n.includes(c) ? s(n.filter((h) => h !== c)) : s([...n, c]);
  }
  function r(c) {
    const h = t[c].map((p) => p.id);
    if (h.every((p) => n.includes(p)))
      s(n.filter((p) => !h.includes(p)));
    else {
      const p = /* @__PURE__ */ new Set([...n, ...h]);
      s(Array.from(p));
    }
  }
  function o(c) {
    return t[c].map((m) => m.id).every((m) => n.includes(m));
  }
  return /* @__PURE__ */ e("div", { className: "grid gap-4 sm:grid-cols-2", children: l.map((c) => {
    const h = t[c], m = o(c);
    return /* @__PURE__ */ a(Ae, { size: "sm", children: [
      /* @__PURE__ */ e(ze, { className: "border-b", children: /* @__PURE__ */ a("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ e(Ie, { className: "capitalize", children: c }),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "xs",
            onClick: () => r(c),
            children: m ? "Deselect All" : "Select All"
          }
        )
      ] }) }),
      /* @__PURE__ */ e(Te, { className: "pt-3", children: /* @__PURE__ */ e("div", { className: "flex flex-col gap-2", children: h.map((p) => /* @__PURE__ */ a(
        "label",
        {
          className: "flex items-center gap-2 text-sm cursor-pointer",
          children: [
            /* @__PURE__ */ e(
              xe,
              {
                checked: n.includes(p.id),
                onCheckedChange: () => i(p.id)
              }
            ),
            /* @__PURE__ */ e("span", { children: p.name })
          ]
        },
        p.id
      )) }) })
    ] }, c);
  }) });
}
function Bn({ mode: t, role: n, groupedPermissions: s, pageTitle: l }) {
  const [i, r] = wt(), [o, c] = d({}), [h, m] = d(null), [p, S] = d(n?.name ?? ""), [y, z] = d(n?.description ?? ""), [I, E] = d(
    () => n?.permissions?.map((b) => b.id) ?? []
  );
  function M(b) {
    b.preventDefault(), c({}), m(null), r(async () => {
      const g = {
        name: p,
        description: y,
        permissionIds: I
      };
      let u;
      t === "edit" && n ? u = await rt(`/api/admin/roles/${n.id}`, g) : u = await Se("/api/admin/roles", g), u.success ? (Y.success(t === "edit" ? "update" : "create", "role"), Fe("/admin/roles")) : u.errors && Object.keys(u.errors).length > 0 ? (c(u.errors), Y.error(u.message)) : (m(u.message), Y.error(u.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: M, className: "", children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: l || "Roles",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: i, children: i ? t === "edit" ? "Saving…" : "Creating…" : t === "edit" ? "Save Changes" : "Create Role" }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Fe("/admin/roles"),
              disabled: i,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    h && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: h }),
    /* @__PURE__ */ a(Et, { children: [
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ a(Ue, { title: "Permissions", description: "Select the permissions this role should have.", children: [
        o.permissionIds && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: o.permissionIds[0] }),
        /* @__PURE__ */ e(Bl, { groupedPermissions: s, selectedIds: I, onChange: E })
      ] }) }),
      /* @__PURE__ */ e(Rt, { children: /* @__PURE__ */ a(Ue, { title: "Role details", children: [
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "name", children: "Name" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "name",
              value: p,
              onChange: (b) => S(b.target.value),
              placeholder: "e.g. Editor, Author, Moderator",
              "aria-invalid": !!o.name,
              "aria-describedby": o.name ? "name-error" : void 0
            }
          ),
          o.name && /* @__PURE__ */ e("p", { id: "name-error", className: "text-xs text-destructive", children: o.name[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(R, { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ e(
            je,
            {
              id: "description",
              value: y,
              onChange: (b) => z(b.target.value),
              placeholder: "Brief description of this role's purpose...",
              rows: 3,
              "aria-invalid": !!o.description,
              "aria-describedby": o.description ? "description-error" : void 0
            }
          ),
          o.description && /* @__PURE__ */ e("p", { id: "description-error", className: "text-xs text-destructive", children: o.description[0] })
        ] })
      ] }) })
    ] })
  ] });
}
function jn(t) {
  return t.reduce((n, s) => {
    const l = s.group || "general";
    return n[l] || (n[l] = []), n[l].push(s), n;
  }, {});
}
function jl() {
  const [t, n] = d(null), [s, l] = d(!0);
  te(() => {
    de("/api/admin/roles").then((r) => {
      n(r.permissions), l(!1);
    });
  }, []);
  const i = Ot(
    () => jn(t ?? []),
    [t]
  );
  return s ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    Bn,
    {
      mode: "create",
      groupedPermissions: i,
      pageTitle: "Create Role"
    }
  ) });
}
function Ul({ id: t }) {
  const [n, s] = d(null), [l, i] = d(null), [r, o] = d(!0);
  te(() => {
    Promise.all([
      de(`/api/admin/roles/${t}`),
      de("/api/admin/roles")
    ]).then(([m, p]) => {
      s(m.role), i(p.permissions), o(!1);
    });
  }, [t]);
  const c = Ot(
    () => jn(l ?? []),
    [l]
  ), h = Ot(() => !n || !l ? null : {
    ...n,
    permissions: l.filter((m) => n.permissionIds.includes(m.id))
  }, [l, n]);
  return r ? /* @__PURE__ */ e(ge, {}) : h ? /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ e(
    Bn,
    {
      mode: "edit",
      role: h,
      groupedPermissions: c,
      pageTitle: "Edit Role"
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Role not found." });
}
const Un = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminRoleCreatePage: jl,
  AdminRoleEditPage: Ul
}, Symbol.toStringTag, { value: "Module" })), Fl = Intl.supportedValuesOf?.("timeZone") ?? [
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
  "Pacific/Auckland"
], Hl = [
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
  "Custom"
], Vl = [
  "Monday - Friday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
], Gl = [
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
  { code: "yi", name: "Yiddish" }
];
function ql() {
  const [t, n] = d(null), [s, l] = d(!0), [i, r] = d(!1), [o, c] = d(null);
  async function h() {
    l(!0), c(null);
    try {
      const g = await de("/api/admin/settings");
      n(g);
    } catch (g) {
      c(g instanceof Error ? g.message : "Failed to load settings");
    } finally {
      l(!1);
    }
  }
  te(() => {
    h();
  }, []);
  function m(g, u) {
    t && n({ ...t, [g]: u });
  }
  function p() {
    t && m("links", [
      ...t.links,
      { platform: "", url: "https://", icon: "" }
    ]);
  }
  function S(g, u, v) {
    if (!t) return;
    const T = t.links.map(
      (O, k) => k === g ? { ...O, [u]: v } : O
    );
    m("links", T);
  }
  function y(g) {
    if (!t) return;
    const u = t.links.filter((v, T) => T !== g);
    m("links", u);
  }
  function z() {
    t && m("open_hours", [
      ...t.open_hours,
      { day: "Monday", open: "08:00", close: "17:00" }
    ]);
  }
  function I(g, u, v) {
    if (!t) return;
    const T = t.open_hours.map(
      (O, k) => k === g ? { ...O, [u]: v } : O
    );
    m("open_hours", T);
  }
  function E(g) {
    if (!t) return;
    const u = t.open_hours.filter((v, T) => T !== g);
    m("open_hours", u);
  }
  function M(g) {
    if (!t) return;
    const u = t.translate_countries, v = u.includes(g) ? u.filter((T) => T !== g) : [...u, g];
    m("translate_countries", v);
  }
  async function b() {
    if (t) {
      r(!0);
      try {
        const g = {
          title: t.title,
          description: t.description,
          meta_title: t.meta_title,
          meta_description: t.meta_description,
          maintenance_mode: t.maintenance_mode,
          timezone: t.timezone,
          logo: t.logo,
          favicon: t.favicon,
          links: t.links,
          open_hours: t.open_hours,
          custom_css: t.custom_css,
          custom_javascript: t.custom_javascript,
          translate_countries: t.translate_countries,
          email_notifications: t.email_notifications.join(",")
        }, u = await rt("/api/admin/settings", g);
        u.success ? (n(u.data), Y.success("update", "settings")) : Y.error(u.message);
      } catch (g) {
        Y.error(g instanceof Error ? g.message : "Failed to save settings");
      } finally {
        r(!1);
      }
    }
  }
  return o ? /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    o
  ] }) }) : s || !t ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ a(tt, { children: [
    /* @__PURE__ */ e(
      Pe,
      {
        title: "Settings",
        actions: /* @__PURE__ */ a(x, { onClick: b, disabled: i, children: [
          /* @__PURE__ */ e(ws, { className: "size-4" }),
          i ? "Saving..." : "Save Settings"
        ] })
      }
    ),
    /* @__PURE__ */ a("div", { className: "grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]", children: [
      /* @__PURE__ */ a(
        Ke,
        {
          title: "General",
          description: "Basic site information",
          className: "lg:col-start-1 lg:row-start-1",
          children: [
            /* @__PURE__ */ a("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ a("div", { className: "space-y-2", children: [
                /* @__PURE__ */ e(R, { htmlFor: "title", children: "Site Title" }),
                /* @__PURE__ */ e(
                  G,
                  {
                    id: "title",
                    value: t.title,
                    onChange: (g) => m("title", g.target.value),
                    placeholder: "My Website"
                  }
                )
              ] }),
              /* @__PURE__ */ a("div", { className: "space-y-2", children: [
                /* @__PURE__ */ e(R, { htmlFor: "timezone", children: "Timezone" }),
                /* @__PURE__ */ a(De, { value: t.timezone, onValueChange: (g) => g && m("timezone", g), children: [
                  /* @__PURE__ */ e(Le, { id: "timezone", children: /* @__PURE__ */ e(Ee, { placeholder: "Select timezone" }) }),
                  /* @__PURE__ */ e(Re, { children: Fl.map((g) => /* @__PURE__ */ e(ie, { value: g, children: g }, g)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-2 mt-4", children: [
              /* @__PURE__ */ e(R, { htmlFor: "description", children: "Site Description" }),
              /* @__PURE__ */ e(
                je,
                {
                  id: "description",
                  value: t.description,
                  onChange: (g) => m("description", g.target.value),
                  placeholder: "A short description of your site",
                  rows: 3
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "flex items-center gap-2 mt-4", children: [
              /* @__PURE__ */ e(
                xe,
                {
                  id: "maintenance_mode",
                  checked: t.maintenance_mode,
                  onCheckedChange: (g) => m("maintenance_mode", g === !0)
                }
              ),
              /* @__PURE__ */ e(R, { htmlFor: "maintenance_mode", className: "cursor-pointer", children: "Maintenance Mode (site shows maintenance page to visitors)" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "SEO & Meta",
          description: "Search engine optimization settings",
          className: "lg:col-start-1 lg:row-start-3",
          children: /* @__PURE__ */ a("div", { className: "space-y-4", children: [
            /* @__PURE__ */ a("div", { className: "space-y-2", children: [
              /* @__PURE__ */ e(R, { htmlFor: "meta_title", children: "Meta Title" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: "meta_title",
                  value: t.meta_title,
                  onChange: (g) => m("meta_title", g.target.value),
                  placeholder: "Page title shown in browser tab"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-2", children: [
              /* @__PURE__ */ e(R, { htmlFor: "meta_description", children: "Meta Description" }),
              /* @__PURE__ */ e(
                je,
                {
                  id: "meta_description",
                  value: t.meta_description,
                  onChange: (g) => m("meta_description", g.target.value),
                  placeholder: "Brief page description for search engines",
                  rows: 3
                }
              )
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "Branding",
          description: "Logo and favicon",
          className: "lg:col-start-1 lg:row-start-2",
          children: /* @__PURE__ */ a("div", { className: "space-y-6", children: [
            /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ e(R, { children: "Logo" }),
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
                t.logo ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: be(t.logo) ?? void 0,
                    alt: "Logo preview",
                    className: "object-contain h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No logo" }),
                /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Ve,
                    {
                      value: t.logo || null,
                      onChange: (g) => {
                        m("logo", g ? g.url : "");
                      },
                      accept: "image/*"
                    },
                    t.logo || "logo-empty"
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose a logo from the media library. Recommended: PNG or SVG." }),
                  t.logo && /* @__PURE__ */ e(
                    x,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "aria-label": "Remove logo",
                      className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                      onClick: () => m("logo", ""),
                      children: "Remove"
                    }
                  )
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ e(R, { children: "Favicon" }),
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
                t.favicon ? /* @__PURE__ */ e("div", { className: "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: be(t.favicon) ?? void 0,
                    alt: "Favicon preview",
                    className: "object-contain h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No icon" }),
                /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Ve,
                    {
                      value: t.favicon || null,
                      onChange: (g) => {
                        m("favicon", g ? g.url : "");
                      },
                      accept: "image/*"
                    },
                    t.favicon || "favicon-empty"
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose a favicon from the media library. Recommended: ICO or PNG (32x32)." }),
                  t.favicon && /* @__PURE__ */ e(
                    x,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "aria-label": "Remove favicon",
                      className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                      onClick: () => m("favicon", ""),
                      children: "Remove"
                    }
                  )
                ] })
              ] }) })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "Social Media Links",
          description: "Links displayed in the footer or sidebar",
          className: "lg:col-span-2 lg:row-start-4",
          children: /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            t.links.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No social media links added yet." }),
            t.links.map((g, u) => /* @__PURE__ */ a("div", { className: "flex items-center gap-3 p-3 border rounded-sm bg-muted/30", children: [
              /* @__PURE__ */ a("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
                /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(R, { className: "text-xs", children: "Platform" }),
                  /* @__PURE__ */ a(De, { value: g.platform || void 0, onValueChange: (v) => v && S(u, "platform", v), children: [
                    /* @__PURE__ */ e(Le, { children: /* @__PURE__ */ e(Ee, { placeholder: "Select platform..." }) }),
                    /* @__PURE__ */ e(Re, { children: Hl.map((v) => /* @__PURE__ */ e(ie, { value: v, children: v }, v)) })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(R, { className: "text-xs", children: "URL" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      value: g.url,
                      onChange: (v) => S(u, "url", v.target.value),
                      placeholder: "https://..."
                    }
                  )
                ] }),
                /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(R, { className: "text-xs", children: "Icon Class (optional)" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      value: g.icon ?? "",
                      onChange: (v) => S(u, "icon", v.target.value),
                      placeholder: "e.g. icon-facebook"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ e(
                x,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => y(u),
                  className: "shrink-0 text-destructive hover:text-destructive",
                  children: /* @__PURE__ */ e(we, { className: "size-4" })
                }
              )
            ] }, u)),
            /* @__PURE__ */ a(x, { variant: "outline", size: "sm", onClick: p, children: [
              /* @__PURE__ */ e(Be, { className: "size-3" }),
              " Add Social Link"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "Open Hours",
          description: "Business or office operating hours",
          className: "lg:col-span-2 lg:row-start-5",
          children: /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            t.open_hours.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No open hours added yet." }),
            t.open_hours.map((g, u) => /* @__PURE__ */ a(
              "div",
              {
                className: "flex items-center gap-3 p-3 border rounded-sm bg-muted/30",
                children: [
                  /* @__PURE__ */ a("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
                    /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(R, { className: "text-xs", children: "Day" }),
                      /* @__PURE__ */ a(De, { value: g.day, onValueChange: (v) => v && I(u, "day", v), children: [
                        /* @__PURE__ */ e(Le, { children: /* @__PURE__ */ e(Ee, {}) }),
                        /* @__PURE__ */ e(Re, { children: Vl.map((v) => /* @__PURE__ */ e(ie, { value: v, children: v }, v)) })
                      ] })
                    ] }),
                    /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(R, { className: "text-xs", children: "Open Time" }),
                      /* @__PURE__ */ e(
                        G,
                        {
                          type: "time",
                          value: g.open,
                          onChange: (v) => I(u, "open", v.target.value)
                        }
                      )
                    ] }),
                    /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(R, { className: "text-xs", children: "Close Time" }),
                      /* @__PURE__ */ e(
                        G,
                        {
                          type: "time",
                          value: g.close,
                          onChange: (v) => I(u, "close", v.target.value)
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ e(
                    x,
                    {
                      variant: "ghost",
                      size: "icon",
                      onClick: () => E(u),
                      className: "shrink-0 text-destructive hover:text-destructive",
                      children: /* @__PURE__ */ e(we, { className: "size-4" })
                    }
                  )
                ]
              },
              u
            )),
            /* @__PURE__ */ a(x, { variant: "outline", size: "sm", onClick: z, children: [
              /* @__PURE__ */ e(Be, { className: "size-3" }),
              " Add Hours"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "Email Notifications",
          description: "Email addresses to receive notifications (separate with comma)",
          className: "lg:col-start-2 lg:row-start-1",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(R, { htmlFor: "email_notifications", children: "Recipient Emails" }),
            /* @__PURE__ */ e(
              G,
              {
                id: "email_notifications",
                value: t.email_notifications.join(", "),
                onChange: (g) => {
                  const u = g.target.value.split(",").map((v) => v.trim()).filter(Boolean);
                  m("email_notifications", u);
                },
                placeholder: "admin@example.com, editor@example.com"
              }
            ),
            /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Separate multiple emails with commas." })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "Google Translate",
          description: "Languages available for Google Translate widget",
          className: "lg:col-start-2 lg:row-start-2",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Select which languages to include in the Google Translate dropdown. Leave empty to disable." }),
            /* @__PURE__ */ e("div", { className: "max-h-64 overflow-y-auto border rounded-sm p-3", children: /* @__PURE__ */ e("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: Gl.map((g) => /* @__PURE__ */ a(
              "label",
              {
                className: "flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded-sm px-2 py-1",
                children: [
                  /* @__PURE__ */ e(
                    xe,
                    {
                      checked: t.translate_countries.includes(g.code),
                      onCheckedChange: () => M(g.code)
                    }
                  ),
                  g.name,
                  " (",
                  g.code,
                  ")"
                ]
              },
              g.code
            )) }) }),
            /* @__PURE__ */ a("p", { className: "text-xs text-muted-foreground", children: [
              t.translate_countries.length,
              " language",
              t.translate_countries.length !== 1 ? "s" : "",
              " selected"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "Custom CSS",
          description: "Custom styles added site-wide",
          className: "lg:col-span-2 lg:row-start-6",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(R, { htmlFor: "custom_css", children: "CSS Code" }),
            /* @__PURE__ */ e(
              je,
              {
                id: "custom_css",
                value: t.custom_css,
                onChange: (g) => m("custom_css", g.target.value),
                placeholder: "/* Add your custom CSS here */",
                rows: 8,
                className: "font-mono text-sm"
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ke,
        {
          title: "Custom JavaScript",
          description: "Custom scripts added before closing body tag",
          className: "lg:col-span-2 lg:row-start-7",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(R, { htmlFor: "custom_javascript", children: "JavaScript Code" }),
            /* @__PURE__ */ e(
              je,
              {
                id: "custom_javascript",
                value: t.custom_javascript,
                onChange: (g) => m("custom_javascript", g.target.value),
                placeholder: "// Add your custom JavaScript here",
                rows: 8,
                className: "font-mono text-sm"
              }
            )
          ] })
        }
      )
    ] })
  ] });
}
const Kl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminSettingsPage: ql
}, Symbol.toStringTag, { value: "Module" }));
function Wl() {
  return /* @__PURE__ */ e("main", { className: "flex min-h-[60vh] items-center justify-center p-6", children: /* @__PURE__ */ a("div", { className: "max-w-md space-y-4 text-center", children: [
    /* @__PURE__ */ e("p", { className: "text-6xl font-semibold tracking-tight", children: "403" }),
    /* @__PURE__ */ e("h1", { className: "text-2xl font-semibold", children: "Forbidden" }),
    /* @__PURE__ */ e("p", { className: "text-muted-foreground", children: "You do not have permission to access this page." }),
    /* @__PURE__ */ e(fe, { to: $e, className: P(kt({ variant: "outline" })), children: "Back to dashboard" })
  ] }) });
}
const Jl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminForbiddenPage: Wl
}, Symbol.toStringTag, { value: "Module" })), Yl = zt(
  "inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-8 px-2.5 min-w-8",
        sm: "h-7 px-2 min-w-7",
        lg: "h-9 px-3 min-w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function le({
  className: t,
  variant: n,
  size: s,
  pressed: l,
  onPressedChange: i,
  onClick: r,
  ...o
}) {
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      role: "button",
      "aria-pressed": l,
      "data-state": l ? "on" : "off",
      className: P(Yl({ variant: n, size: s, className: t })),
      onClick: (c) => {
        i?.(!l), r?.(c);
      },
      ...o
    }
  );
}
function lt({
  className: t,
  orientation: n = "horizontal",
  ...s
}) {
  return /* @__PURE__ */ e(
    rr,
    {
      "data-slot": "separator",
      orientation: n,
      className: P(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        t
      ),
      ...s
    }
  );
}
function ln({ ...t }) {
  return /* @__PURE__ */ e(nt.Root, { "data-slot": "dropdown-menu", ...t });
}
function on({ ...t }) {
  return /* @__PURE__ */ e(nt.Trigger, { "data-slot": "dropdown-menu-trigger", ...t });
}
function cn({
  align: t = "start",
  alignOffset: n = 0,
  side: s = "bottom",
  sideOffset: l = 4,
  className: i,
  ...r
}) {
  return /* @__PURE__ */ e(nt.Portal, { children: /* @__PURE__ */ e(
    nt.Positioner,
    {
      className: "isolate z-50 outline-none",
      align: t,
      alignOffset: n,
      side: s,
      sideOffset: l,
      children: /* @__PURE__ */ e(
        nt.Popup,
        {
          "data-slot": "dropdown-menu-content",
          className: P("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", i),
          ...r
        }
      )
    }
  ) });
}
function at({
  className: t,
  inset: n,
  ...s
}) {
  return /* @__PURE__ */ e(
    nt.GroupLabel,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": n,
      className: P(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        t
      ),
      ...s
    }
  );
}
function ee({
  className: t,
  inset: n,
  variant: s = "default",
  ...l
}) {
  return /* @__PURE__ */ e(
    nt.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": n,
      "data-variant": s,
      className: P(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-sm px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        t
      ),
      ...l
    }
  );
}
function ot({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    nt.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: P("-mx-1 my-1 h-px bg-border", t),
      ...n
    }
  );
}
function Xl({ editor: t }) {
  function n() {
    const r = t.getAttributes("link").href, o = window.prompt("Enter URL:", r || "https://");
    if (o !== null) {
      if (o === "") {
        t.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      t.chain().focus().extendMarkRange("link").setLink({ href: o }).run();
    }
  }
  function s(r) {
    if (!r) return;
    const o = {
      src: r.url,
      alt: r.alt || r.name
    };
    t.chain().focus().setImage(o).run();
  }
  function l() {
    const r = window.prompt("Enter YouTube URL:", "https://www.youtube.com/watch?v=");
    r && t.chain().focus().setYoutubeVideo({ src: r }).run();
  }
  function i() {
    t.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: !0 }).run();
  }
  return /* @__PURE__ */ a("div", { className: "flex flex-wrap items-center gap-0.5 border-b p-1.5", children: [
    /* @__PURE__ */ e(
      le,
      {
        size: "sm",
        pressed: t.isActive("bold"),
        onPressedChange: () => t.chain().focus().toggleBold().run(),
        disabled: !t.can().chain().focus().toggleBold().run(),
        "aria-label": "Bold",
        title: "Bold",
        children: /* @__PURE__ */ e(vn, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      le,
      {
        size: "sm",
        pressed: t.isActive("italic"),
        onPressedChange: () => t.chain().focus().toggleItalic().run(),
        disabled: !t.can().chain().focus().toggleItalic().run(),
        "aria-label": "Italic",
        title: "Italic",
        children: /* @__PURE__ */ e(xn, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      le,
      {
        size: "sm",
        pressed: t.isActive("underline"),
        onPressedChange: () => t.chain().focus().toggleUnderline().run(),
        disabled: !t.can().chain().focus().toggleUnderline().run(),
        "aria-label": "Underline",
        title: "Underline",
        children: /* @__PURE__ */ e(yn, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      le,
      {
        size: "sm",
        pressed: t.isActive("strike"),
        onPressedChange: () => t.chain().focus().toggleStrike().run(),
        disabled: !t.can().chain().focus().toggleStrike().run(),
        "aria-label": "Strikethrough",
        title: "Strikethrough",
        children: /* @__PURE__ */ e(Cs, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      le,
      {
        size: "sm",
        pressed: t.isActive("highlight"),
        onPressedChange: () => t.chain().focus().toggleHighlight().run(),
        disabled: !t.can().chain().focus().toggleHighlight().run(),
        "aria-label": "Highlight",
        title: "Highlight",
        children: /* @__PURE__ */ e(ks, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(lt, { orientation: "vertical", className: "mx-1 h-6" }),
    /* @__PURE__ */ a("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 1 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
          "aria-label": "Heading 1",
          title: "Heading 1",
          children: /* @__PURE__ */ e(oa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 2 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 2 }).run(),
          "aria-label": "Heading 2",
          title: "Heading 2",
          children: /* @__PURE__ */ e(ca, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 3 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 3 }).run(),
          "aria-label": "Heading 3",
          title: "Heading 3",
          children: /* @__PURE__ */ e(da, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 4 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 4 }).run(),
          "aria-label": "Heading 4",
          title: "Heading 4",
          children: /* @__PURE__ */ e($a, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("paragraph"),
          onPressedChange: () => t.chain().focus().setParagraph().run(),
          "aria-label": "Paragraph",
          title: "Paragraph",
          children: /* @__PURE__ */ e(Oa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(lt, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ a("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("blockquote"),
          onPressedChange: () => t.chain().focus().toggleBlockquote().run(),
          "aria-label": "Blockquote",
          title: "Blockquote",
          children: /* @__PURE__ */ e(ua, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("codeBlock"),
          onPressedChange: () => t.chain().focus().toggleCodeBlock().run(),
          "aria-label": "Code Block",
          title: "Code Block",
          children: /* @__PURE__ */ e(ma, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("bulletList"),
          onPressedChange: () => t.chain().focus().toggleBulletList().run(),
          "aria-label": "Bullet List",
          title: "Bullet List",
          children: /* @__PURE__ */ e(ha, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("orderedList"),
          onPressedChange: () => t.chain().focus().toggleOrderedList().run(),
          "aria-label": "Ordered List",
          title: "Ordered List",
          children: /* @__PURE__ */ e(ga, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("taskList"),
          onPressedChange: () => t.chain().focus().toggleTaskList().run(),
          "aria-label": "Task List",
          title: "Task List",
          children: /* @__PURE__ */ e(Ba, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        x,
        {
          type: "button",
          variant: "ghost",
          size: "icon-sm",
          onClick: () => t.chain().focus().setHorizontalRule().run(),
          "aria-label": "Horizontal Rule",
          title: "Horizontal Rule",
          children: /* @__PURE__ */ e(ja, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(lt, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ a("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "left" }),
          onPressedChange: () => t.chain().focus().setTextAlign("left").run(),
          "aria-label": "Align Left",
          title: "Align Left",
          children: /* @__PURE__ */ e(Ua, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "center" }),
          onPressedChange: () => t.chain().focus().setTextAlign("center").run(),
          "aria-label": "Align Center",
          title: "Align Center",
          children: /* @__PURE__ */ e(Fa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "right" }),
          onPressedChange: () => t.chain().focus().setTextAlign("right").run(),
          "aria-label": "Align Right",
          title: "Align Right",
          children: /* @__PURE__ */ e(Ha, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "justify" }),
          onPressedChange: () => t.chain().focus().setTextAlign("justify").run(),
          "aria-label": "Justify",
          title: "Justify",
          children: /* @__PURE__ */ e(Va, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(lt, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ a("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("link"),
          onPressedChange: n,
          "aria-label": "Link",
          title: "Link",
          children: /* @__PURE__ */ e(pa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        Ve,
        {
          value: null,
          onChange: s,
          accept: "image/*",
          trigger: /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "ghost",
              size: "icon-sm",
              "aria-label": "Insert Image",
              title: "Insert Image",
              children: /* @__PURE__ */ e(At, { className: "size-4" })
            }
          )
        }
      ),
      /* @__PURE__ */ e(
        x,
        {
          type: "button",
          variant: "ghost",
          size: "icon-sm",
          onClick: l,
          "aria-label": "YouTube Video",
          title: "YouTube Video",
          children: /* @__PURE__ */ e(Ga, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(lt, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ a("div", { className: "hidden md:flex items-center gap-0.5", children: [
      t.isActive("table") ? /* @__PURE__ */ a(ln, { children: [
        /* @__PURE__ */ a(
          on,
          {
            className: P(
              "inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1 text-xs font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            ),
            children: [
              /* @__PURE__ */ e(aa, { className: "size-4" }),
              "Table",
              /* @__PURE__ */ e(Ct, { className: "size-3" })
            ]
          }
        ),
        /* @__PURE__ */ a(cn, { align: "start", sideOffset: 4, children: [
          /* @__PURE__ */ e(at, { children: "Rows" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().addRowBefore().run(),
              children: [
                /* @__PURE__ */ e(Be, { className: "size-4" }),
                "Add Row Before"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().addRowAfter().run(),
              children: [
                /* @__PURE__ */ e(Be, { className: "size-4" }),
                "Add Row After"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              variant: "destructive",
              onClick: () => t.chain().focus().deleteRow().run(),
              children: [
                /* @__PURE__ */ e(we, { className: "size-4" }),
                "Delete Row"
              ]
            }
          ),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Columns" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().addColumnBefore().run(),
              children: [
                /* @__PURE__ */ e(Be, { className: "size-4" }),
                "Add Column Before"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().addColumnAfter().run(),
              children: [
                /* @__PURE__ */ e(Be, { className: "size-4" }),
                "Add Column After"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              variant: "destructive",
              onClick: () => t.chain().focus().deleteColumn().run(),
              children: [
                /* @__PURE__ */ e(we, { className: "size-4" }),
                "Delete Column"
              ]
            }
          ),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Cells" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().mergeCells().run(),
              disabled: !t.can().mergeCells(),
              children: [
                /* @__PURE__ */ e(qa, { className: "size-4" }),
                "Merge Cells"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().splitCell().run(),
              disabled: !t.can().splitCell(),
              children: [
                /* @__PURE__ */ e(Ka, { className: "size-4" }),
                "Split Cell"
              ]
            }
          ),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ a(
            ee,
            {
              variant: "destructive",
              onClick: () => t.chain().focus().deleteTable().run(),
              children: [
                /* @__PURE__ */ e(we, { className: "size-4" }),
                "Delete Table"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ e(
        x,
        {
          type: "button",
          variant: "ghost",
          size: "icon-sm",
          onClick: i,
          "aria-label": "Insert Table",
          title: "Insert Table",
          children: /* @__PURE__ */ e(aa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(lt, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ a("div", { className: "flex md:hidden items-center", children: [
      /* @__PURE__ */ a(ln, { children: [
        /* @__PURE__ */ e(
          on,
          {
            className: P(
              "inline-flex items-center justify-center rounded-sm h-7 w-7",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            ),
            "aria-label": "More formatting options",
            title: "More formatting options",
            children: /* @__PURE__ */ e(Ss, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ a(cn, { align: "start", sideOffset: 4, children: [
          /* @__PURE__ */ e(at, { children: "Headings" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
              children: [
                /* @__PURE__ */ e(oa, { className: "size-4" }),
                "Heading 1"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 2 }).run(),
              children: [
                /* @__PURE__ */ e(ca, { className: "size-4" }),
                "Heading 2"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 3 }).run(),
              children: [
                /* @__PURE__ */ e(da, { className: "size-4" }),
                "Heading 3"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 4 }).run(),
              children: [
                /* @__PURE__ */ e($a, { className: "size-4" }),
                "Heading 4"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setParagraph().run(),
              children: [
                /* @__PURE__ */ e(Oa, { className: "size-4" }),
                "Paragraph"
              ]
            }
          ),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Blocks" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleBlockquote().run(),
              children: [
                /* @__PURE__ */ e(ua, { className: "size-4" }),
                "Blockquote"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleCodeBlock().run(),
              children: [
                /* @__PURE__ */ e(ma, { className: "size-4" }),
                "Code Block"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleBulletList().run(),
              children: [
                /* @__PURE__ */ e(ha, { className: "size-4" }),
                "Bullet List"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleOrderedList().run(),
              children: [
                /* @__PURE__ */ e(ga, { className: "size-4" }),
                "Ordered List"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleTaskList().run(),
              children: [
                /* @__PURE__ */ e(Ba, { className: "size-4" }),
                "Task List"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setHorizontalRule().run(),
              children: [
                /* @__PURE__ */ e(ja, { className: "size-4" }),
                "Horizontal Rule"
              ]
            }
          ),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Alignment" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setTextAlign("left").run(),
              children: [
                /* @__PURE__ */ e(Ua, { className: "size-4" }),
                "Align Left"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setTextAlign("center").run(),
              children: [
                /* @__PURE__ */ e(Fa, { className: "size-4" }),
                "Align Center"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setTextAlign("right").run(),
              children: [
                /* @__PURE__ */ e(Ha, { className: "size-4" }),
                "Align Right"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setTextAlign("justify").run(),
              children: [
                /* @__PURE__ */ e(Va, { className: "size-4" }),
                "Justify"
              ]
            }
          ),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Media" }),
          /* @__PURE__ */ a(ee, { onClick: n, children: [
            /* @__PURE__ */ e(pa, { className: "size-4" }),
            "Link"
          ] }),
          /* @__PURE__ */ a(ee, { onClick: () => {
            const r = window.prompt("Enter image URL:", "https://");
            if (!r) return;
            const o = window.prompt("Enter alt text:", "") || "";
            t.chain().focus().setImage({ src: r, alt: o }).run();
          }, children: [
            /* @__PURE__ */ e(At, { className: "size-4" }),
            "Insert Image"
          ] }),
          /* @__PURE__ */ a(ee, { onClick: l, children: [
            /* @__PURE__ */ e(Ga, { className: "size-4" }),
            "YouTube Video"
          ] }),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Table" }),
          t.isActive("table") ? /* @__PURE__ */ a(Ge, { children: [
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().addRowBefore().run(),
                children: [
                  /* @__PURE__ */ e(Be, { className: "size-4" }),
                  "Add Row Before"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().addRowAfter().run(),
                children: [
                  /* @__PURE__ */ e(Be, { className: "size-4" }),
                  "Add Row After"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                variant: "destructive",
                onClick: () => t.chain().focus().deleteRow().run(),
                children: [
                  /* @__PURE__ */ e(we, { className: "size-4" }),
                  "Delete Row"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().addColumnBefore().run(),
                children: [
                  /* @__PURE__ */ e(Be, { className: "size-4" }),
                  "Add Column Before"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().addColumnAfter().run(),
                children: [
                  /* @__PURE__ */ e(Be, { className: "size-4" }),
                  "Add Column After"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                variant: "destructive",
                onClick: () => t.chain().focus().deleteColumn().run(),
                children: [
                  /* @__PURE__ */ e(we, { className: "size-4" }),
                  "Delete Column"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().mergeCells().run(),
                disabled: !t.can().mergeCells(),
                children: [
                  /* @__PURE__ */ e(qa, { className: "size-4" }),
                  "Merge Cells"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().splitCell().run(),
                disabled: !t.can().splitCell(),
                children: [
                  /* @__PURE__ */ e(Ka, { className: "size-4" }),
                  "Split Cell"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                variant: "destructive",
                onClick: () => t.chain().focus().deleteTable().run(),
                children: [
                  /* @__PURE__ */ e(we, { className: "size-4" }),
                  "Delete Table"
                ]
              }
            )
          ] }) : /* @__PURE__ */ a(ee, { onClick: i, children: [
            /* @__PURE__ */ e(aa, { className: "size-4" }),
            "Insert Table"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e(lt, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ e(
      x,
      {
        type: "button",
        variant: "ghost",
        size: "icon-sm",
        onClick: () => t.chain().focus().undo().run(),
        disabled: !t.can().chain().focus().undo().run(),
        "aria-label": "Undo",
        title: "Undo",
        children: /* @__PURE__ */ e(Ps, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      x,
      {
        type: "button",
        variant: "ghost",
        size: "icon-sm",
        onClick: () => t.chain().focus().redo().run(),
        disabled: !t.can().chain().focus().redo().run(),
        "aria-label": "Redo",
        title: "Redo",
        children: /* @__PURE__ */ e(_s, { className: "size-4" })
      }
    )
  ] });
}
function Ql({ editor: t }) {
  function n() {
    const s = t.getAttributes("link").href, l = window.prompt("Enter URL:", s || "https://");
    if (l !== null) {
      if (l === "") {
        t.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      t.chain().focus().extendMarkRange("link").setLink({ href: l }).run();
    }
  }
  return /* @__PURE__ */ a(
    or,
    {
      editor: t,
      className: "flex items-center gap-0.5 rounded-sm border bg-background p-1 shadow-md",
      children: [
        /* @__PURE__ */ e(
          le,
          {
            size: "sm",
            pressed: t.isActive("bold"),
            onPressedChange: () => t.chain().focus().toggleBold().run(),
            "aria-label": "Bold",
            children: /* @__PURE__ */ e(vn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          le,
          {
            size: "sm",
            pressed: t.isActive("italic"),
            onPressedChange: () => t.chain().focus().toggleItalic().run(),
            "aria-label": "Italic",
            children: /* @__PURE__ */ e(xn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          le,
          {
            size: "sm",
            pressed: t.isActive("underline"),
            onPressedChange: () => t.chain().focus().toggleUnderline().run(),
            "aria-label": "Underline",
            children: /* @__PURE__ */ e(yn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          le,
          {
            size: "sm",
            pressed: t.isActive("link"),
            onPressedChange: n,
            "aria-label": "Link",
            children: /* @__PURE__ */ e(pa, { className: "size-3.5" })
          }
        )
      ]
    }
  );
}
function Zl({ editor: t }) {
  function n() {
    const s = window.prompt("Enter image URL:", "https://");
    if (!s) return;
    const l = window.prompt("Enter alt text:", "") || "";
    t.chain().focus().setImage({ src: s, alt: l }).run();
  }
  return /* @__PURE__ */ a(
    cr,
    {
      editor: t,
      className: "flex items-center gap-0.5 rounded-sm border bg-background p-1 shadow-md",
      children: [
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
            "aria-label": "Heading 1",
            title: "Heading 1",
            children: /* @__PURE__ */ e(oa, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleHeading({ level: 2 }).run(),
            "aria-label": "Heading 2",
            title: "Heading 2",
            children: /* @__PURE__ */ e(ca, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleHeading({ level: 3 }).run(),
            "aria-label": "Heading 3",
            title: "Heading 3",
            children: /* @__PURE__ */ e(da, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleBulletList().run(),
            "aria-label": "Bullet List",
            title: "Bullet List",
            children: /* @__PURE__ */ e(ha, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleOrderedList().run(),
            "aria-label": "Ordered List",
            title: "Ordered List",
            children: /* @__PURE__ */ e(ga, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: n,
            "aria-label": "Insert Image",
            title: "Insert Image",
            children: /* @__PURE__ */ e(At, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleBlockquote().run(),
            "aria-label": "Blockquote",
            title: "Blockquote",
            children: /* @__PURE__ */ e(ua, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleCodeBlock().run(),
            "aria-label": "Code Block",
            title: "Code Block",
            children: /* @__PURE__ */ e(ma, { className: "size-4" })
          }
        )
      ]
    }
  );
}
const eo = [
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
  { value: "yaml", label: "YAML" }
];
function to({
  node: t,
  updateAttributes: n
}) {
  const s = t.attrs.language || "";
  return /* @__PURE__ */ a(Ls, { className: "relative rounded-sm bg-muted my-2", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between border-b border-border/50 px-3 py-1.5", children: /* @__PURE__ */ a(
      De,
      {
        value: s || "auto",
        onValueChange: (l) => n({ language: l === "auto" ? "" : l }),
        children: [
          /* @__PURE__ */ e(Le, { size: "sm", className: "h-6 w-auto min-w-[100px] border-none bg-transparent text-xs text-muted-foreground shadow-none", children: /* @__PURE__ */ e(Ee, { placeholder: "Auto" }) }),
          /* @__PURE__ */ e(Re, { side: "bottom", align: "start", children: eo.map((l) => /* @__PURE__ */ e(ie, { value: l.value, children: l.label }, l.value)) })
        ]
      }
    ) }),
    /* @__PURE__ */ e("pre", { className: "p-4 font-mono text-sm overflow-x-auto !mt-0 !rounded-sm", children: /* @__PURE__ */ e(Rs, { className: "hljs" }) })
  ] });
}
const ao = tr(ar);
function no({
  content: t,
  onChange: n,
  placeholder: s = "Start writing...",
  editable: l = !0,
  className: i
}) {
  const r = Ms({
    extensions: [
      Bs.configure({
        codeBlock: !1
        // Using CodeBlockLowlight instead
      }),
      js,
      Us.configure({
        multicolor: !1
      }),
      Fs.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"]
      }),
      Hs.configure({
        openOnClick: !1,
        autolink: !0,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer"
        }
      }),
      Vs.configure({
        HTMLAttributes: {
          class: "rounded-sm max-w-full h-auto"
        }
      }),
      Gs.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-sm"
        },
        inline: !1
      }),
      Ks.configure({
        resizable: !0,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full"
        }
      }),
      qs,
      Ws.configure({
        HTMLAttributes: {
          class: "border border-border p-2 min-w-[100px]"
        }
      }),
      Js.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-bold min-w-[100px]"
        }
      }),
      Ys.configure({
        HTMLAttributes: {
          class: "list-none pl-0"
        }
      }),
      Xs.configure({
        nested: !0,
        HTMLAttributes: {
          class: "flex items-start gap-2"
        }
      }),
      Qs.configure({
        lowlight: ao,
        HTMLAttributes: {
          class: "rounded-sm bg-muted p-4 font-mono text-sm overflow-x-auto"
        }
      }).extend({
        addNodeView() {
          return $s(to);
        }
      }),
      Zs.configure({
        placeholder: s
      }),
      er
    ],
    content: t,
    editable: l,
    onUpdate: ({ editor: h }) => {
      n(h.getHTML());
    },
    editorProps: {
      attributes: {
        class: P(
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none",
          "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_hr]:border-border [&_hr]:my-4",
          "[&_table]:border-collapse [&_table]:w-full",
          "[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-bold",
          "[&_td]:border [&_td]:border-border [&_td]:p-2",
          "[&_img]:rounded-sm [&_img]:max-w-full [&_img]:h-auto",
          "[&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-primary/50 [&_.ProseMirror-selectednode]:rounded-sm"
        )
      }
    },
    immediatelyRender: !1
  });
  if (!r)
    return /* @__PURE__ */ a("div", { className: P("rounded-sm border", i), children: [
      /* @__PURE__ */ e("div", { className: "h-10 border-b bg-muted/30 animate-pulse" }),
      /* @__PURE__ */ e("div", { className: "min-h-[200px] p-4", children: /* @__PURE__ */ e("div", { className: "h-4 w-3/4 bg-muted/30 rounded-sm animate-pulse" }) })
    ] });
  const o = r.storage.characterCount.characters(), c = r.storage.characterCount.words();
  return /* @__PURE__ */ a("div", { className: P("rounded-sm border", i), children: [
    /* @__PURE__ */ e(Xl, { editor: r }),
    /* @__PURE__ */ e(Ql, { editor: r }),
    /* @__PURE__ */ e(Zl, { editor: r }),
    /* @__PURE__ */ e(Os, { editor: r }),
    /* @__PURE__ */ a("div", { className: "flex items-center justify-end gap-3 border-t px-3 py-1.5 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ a("span", { children: [
        o,
        " characters"
      ] }),
      /* @__PURE__ */ a("span", { children: [
        c,
        " words"
      ] })
    ] })
  ] });
}
const Fn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TiptapEditor: no
}, Symbol.toStringTag, { value: "Module" }));
export {
  Vo as AdminApp
};
