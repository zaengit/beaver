import { jsx as e, jsxs as n, Fragment as Pe } from "react/jsx-runtime";
import * as Se from "react";
import { createContext as xr, useContext as yr, useState as p, useRef as qe, useCallback as Y, useEffect as ae, lazy as ie, Suspense as Ra, useTransition as St, forwardRef as Nr, useMemo as wr, useImperativeHandle as Cr, useId as kr } from "react";
import { useNavigate as Je, Routes as Sr, Route as te, Navigate as Oe, useParams as Ve, useLocation as pt, Outlet as Ar, BrowserRouter as _r, Link as Ee } from "react-router";
import { XIcon as Ln, PanelLeftIcon as Pr, LayoutDashboard as Oa, Image as Mn, Menu as zr, Users as Tr, History as Ir, Globe as Dr, CircleDot as da, Hash as nn, Settings as Er, FolderTree as $n, FileText as Lt, UserRound as Lr, LogOut as Mr, LoaderCircle as $r, Loader2Icon as Rr, OctagonXIcon as Or, TriangleAlertIcon as Fr, InfoIcon as jr, CircleCheckIcon as Br, ArrowRight as Ur, ChevronDownIcon as Rn, CheckIcon as On, ChevronUpIcon as Hr, Check as Fa, ArrowUp as Vr, ArrowDown as Gr, ArrowUpDown as qr, ChevronLeft as Kr, MoreHorizontal as Fn, ChevronRight as jn, Upload as Wr, FileIcon as gt, Loader2 as Bn, X as ja, Search as Un, ImageIcon as kt, Copy as Ba, Trash2 as ye, GripVertical as Ot, ChevronDown as At, Pencil as Hn, Settings2 as Ua, ChevronUp as Vn, Plus as Ie, Save as Jr, Eye as Yr, Bold as Gn, Italic as qn, Underline as Kn, Strikethrough as Xr, Highlighter as Qr, Heading1 as wa, Heading2 as Ca, Heading3 as ka, Heading4 as rn, Pilcrow as sn, Quote as Sa, Code2 as Aa, List as _a, ListOrdered as Pa, ListChecks as ln, Minus as on, AlignLeft as cn, AlignCenter as dn, AlignRight as un, AlignJustify as mn, Link2 as za, Video as hn, TableIcon as ua, Merge as gn, SplitSquareHorizontal as pn, Undo2 as Zr, Redo2 as es } from "lucide-react";
import { useTheme as ts } from "next-themes";
import { Toaster as as, toast as nt } from "sonner";
import { useSensors as Ha, useSensor as Mt, PointerSensor as Va, KeyboardSensor as ns, DndContext as Ga, closestCenter as qa, DragOverlay as rs } from "@dnd-kit/core";
import { useSortable as Ft, sortableKeyboardCoordinates as ss, arrayMove as mt, SortableContext as jt, verticalListSortingStrategy as Ka, rectSortingStrategy as is } from "@dnd-kit/sortable";
import { CSS as Bt } from "@dnd-kit/utilities";
import { QRCodeSVG as ls } from "qrcode.react";
import { Radio as fn } from "@base-ui/react/radio";
import { RadioGroup as os } from "@base-ui/react/radio-group";
import { mergeProps as Ut } from "@base-ui/react/merge-props";
import { useRender as Ht } from "@base-ui/react/use-render";
import { cva as _t } from "class-variance-authority";
import { Dialog as ge } from "@base-ui/react/dialog";
import { Tooltip as ut } from "@base-ui/react/tooltip";
import { NodeViewWrapper as cs, NodeViewContent as ds, useEditor as us, ReactNodeViewRenderer as ms, EditorContent as hs } from "@tiptap/react";
import gs from "@tiptap/starter-kit";
import ps from "@tiptap/extension-underline";
import fs from "@tiptap/extension-highlight";
import bs from "@tiptap/extension-text-align";
import vs from "@tiptap/extension-link";
import xs from "@tiptap/extension-image";
import ys from "@tiptap/extension-youtube";
import { TableRow as Ns, Table as ws, TableCell as Cs, TableHeader as ks } from "@tiptap/extension-table";
import Ss from "@tiptap/extension-task-list";
import As from "@tiptap/extension-task-item";
import _s from "@tiptap/extension-code-block-lowlight";
import Ps from "@tiptap/extension-placeholder";
import zs from "@tiptap/extension-character-count";
import { createLowlight as Ts, common as Is } from "lowlight";
import { clsx as Ds } from "clsx";
import { twMerge as Es } from "tailwind-merge";
import { Separator as Ls } from "@base-ui/react/separator";
import { Button as Ms } from "@base-ui/react/button";
import { Menu as He } from "@base-ui/react/menu";
import { Input as $s } from "@base-ui/react/input";
import { Select as Ae } from "@base-ui/react/select";
import { Tabs as Vt } from "@base-ui/react/tabs";
import { BubbleMenu as Rs, FloatingMenu as Os } from "@tiptap/react/menus";
async function Fs() {
  const t = await fetch("/api/admin/auth/session", {
    credentials: "include"
  });
  return t.ok ? (await t.json()).data : null;
}
let It = null, Wn = null, Jn = null;
function bn(t) {
  Wn = t;
}
function vn(t) {
  Jn = t;
}
async function js() {
  return It || (It = fetch("/api/admin/auth/refresh", {
    method: "POST",
    credentials: "include"
  }).then((t) => t.ok).catch(() => !1).finally(() => {
    It = null;
  })), It;
}
async function Gt(t, a = {}) {
  const r = new Headers(a.headers), i = typeof FormData < "u" && a.body instanceof FormData;
  a.body && !i && !r.has("content-type") && r.set("content-type", "application/json");
  const s = {
    ...a,
    headers: r,
    credentials: "include"
  };
  let l = await fetch(t, s);
  l.status === 401 && await js() && (l = await fetch(t, s)), l.status === 401 && Wn?.(), l.status === 403 && Jn?.();
  const o = {
    success: !1,
    message: `Request failed: ${l.status}`
  }, d = await l.json().catch(() => o);
  return typeof d?.success == "boolean" ? d : l.ok ? {
    success: !0,
    message: "OK",
    data: d
  } : o;
}
async function fe(t) {
  const a = await Gt(t);
  if (!a.success)
    throw new Error(a.message);
  return a.data;
}
function _e(t, a) {
  return Gt(t, {
    method: "POST",
    ...a !== void 0 ? { body: JSON.stringify(a) } : {}
  });
}
function ot(t, a) {
  return Gt(t, {
    method: "PUT",
    ...a !== void 0 ? { body: JSON.stringify(a) } : {}
  });
}
function Wa(t) {
  return Gt(t, {
    method: "DELETE"
  });
}
function Bs(t) {
  return t != null && t !== "" && t !== "all";
}
function Ct(t, a) {
  if (!a)
    return t;
  const r = a instanceof URLSearchParams ? new URLSearchParams(a.toString()) : new URLSearchParams();
  if (!(a instanceof URLSearchParams))
    for (const [s, l] of Object.entries(a))
      Bs(l) && r.set(s, String(l));
  const i = r.toString();
  return i ? `${t}?${i}` : t;
}
let Ta = null;
function xn(t) {
  Ta = t;
}
function Us(t, a) {
  if (Ta) {
    Ta(t, a);
    return;
  }
  if (typeof window < "u") {
    const r = window.location.origin || "http://localhost", i = new URL(t, r);
    if (i.origin === r && i.pathname.startsWith("/admin") && typeof window.history?.pushState == "function" && typeof window.dispatchEvent == "function") {
      const s = `${i.pathname}${i.search}${i.hash}`, l = window.history.state ?? {}, o = typeof l.idx == "number" ? l.idx : 0, d = {
        ...l,
        idx: o + 1
      };
      window.history.pushState(d, "", s), window.dispatchEvent(new PopStateEvent("popstate", { state: d }));
      return;
    }
    window.location.assign(t);
  }
}
function Ke(t, a) {
  Us(Ct(t, a));
}
const Hs = "/admin", Yn = xr({
  loading: !0,
  session: null,
  setSession() {
  },
  async refreshSession() {
    return null;
  }
}), Vs = 600 * 1e3;
function Gs({ children: t }) {
  const [a, r] = p(!0), [i, s] = p(null), l = qe(null), o = qe(!0), d = Y(async () => {
    const u = await Fs();
    return o.current && (s(u), !u && l.current && (clearInterval(l.current), l.current = null)), u;
  }, []);
  return ae(() => (o.current = !0, bn(() => {
    o.current && (s(null), l.current && (clearInterval(l.current), l.current = null));
  }), vn(() => {
    o.current && Ke(`${Hs}/403`);
  }), d().finally(() => {
    o.current && r(!1);
  }), l.current = setInterval(() => {
    d();
  }, Vs), () => {
    o.current = !1, bn(null), vn(null), l.current && (clearInterval(l.current), l.current = null);
  }), [d]), /* @__PURE__ */ e(Yn.Provider, { value: { loading: a, session: i, setSession: s, refreshSession: d }, children: t });
}
function ze() {
  return yr(Yn);
}
const ma = 768;
function qs() {
  const [t, a] = Se.useState(void 0);
  return Se.useEffect(() => {
    const r = window.matchMedia(`(max-width: ${ma - 1}px)`), i = () => {
      a(window.innerWidth < ma);
    };
    return r.addEventListener("change", i), a(window.innerWidth < ma), () => r.removeEventListener("change", i);
  }, []), !!t;
}
function k(...t) {
  return Es(Ds(t));
}
const ft = _t(
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
function w({
  className: t,
  variant: a = "default",
  size: r = "default",
  render: i,
  ...s
}) {
  const l = i == null || Se.isValidElement(i) && typeof i.type == "string" && i.type === "button";
  return /* @__PURE__ */ e(
    Ms,
    {
      "data-slot": "button",
      nativeButton: l,
      className: k(ft({ variant: a, size: r, className: t })),
      render: i,
      ...s
    }
  );
}
function Ks({ ...t }) {
  return /* @__PURE__ */ e(ge.Root, { "data-slot": "sheet", ...t });
}
function Ws({ ...t }) {
  return /* @__PURE__ */ e(ge.Portal, { "data-slot": "sheet-portal", ...t });
}
function Js({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    ge.Backdrop,
    {
      "data-slot": "sheet-overlay",
      className: k(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        t
      ),
      ...a
    }
  );
}
function Ys({
  className: t,
  children: a,
  side: r = "right",
  showCloseButton: i = !0,
  ...s
}) {
  return /* @__PURE__ */ n(Ws, { children: [
    /* @__PURE__ */ e(Js, {}),
    /* @__PURE__ */ n(
      ge.Popup,
      {
        "data-slot": "sheet-content",
        "data-side": r,
        className: k(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          t
        ),
        ...s,
        children: [
          a,
          i && /* @__PURE__ */ n(
            ge.Close,
            {
              "data-slot": "sheet-close",
              render: /* @__PURE__ */ e(
                w,
                {
                  variant: "ghost",
                  className: "absolute top-3 right-3",
                  size: "icon-sm"
                }
              ),
              children: [
                /* @__PURE__ */ e(
                  Ln,
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
function Xs({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sheet-header",
      className: k("flex flex-col gap-0.5 p-4", t),
      ...a
    }
  );
}
function Qs({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    ge.Title,
    {
      "data-slot": "sheet-title",
      className: k(
        "font-heading text-base font-medium text-foreground",
        t
      ),
      ...a
    }
  );
}
function Zs({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    ge.Description,
    {
      "data-slot": "sheet-description",
      className: k("text-sm text-muted-foreground", t),
      ...a
    }
  );
}
function ei({ ...t }) {
  return /* @__PURE__ */ e(ut.Root, { "data-slot": "tooltip", ...t });
}
function ti({ ...t }) {
  return /* @__PURE__ */ e(ut.Trigger, { "data-slot": "tooltip-trigger", ...t });
}
function ai({
  className: t,
  side: a = "top",
  sideOffset: r = 4,
  align: i = "center",
  alignOffset: s = 0,
  children: l,
  ...o
}) {
  return /* @__PURE__ */ e(ut.Portal, { children: /* @__PURE__ */ e(
    ut.Positioner,
    {
      align: i,
      alignOffset: s,
      side: a,
      sideOffset: r,
      className: "isolate z-50",
      children: /* @__PURE__ */ n(
        ut.Popup,
        {
          "data-slot": "tooltip-content",
          className: k(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-sm bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            t
          ),
          ...o,
          children: [
            l,
            /* @__PURE__ */ e(ut.Arrow, { className: "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-sm-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" })
          ]
        }
      )
    }
  ) });
}
const ni = "sidebar_state", ri = 3600 * 24 * 7, si = "16rem", ii = "18rem", li = "3rem", oi = "b", Xn = Se.createContext(null);
function qt() {
  const t = Se.useContext(Xn);
  if (!t)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return t;
}
function ci({
  defaultOpen: t = !0,
  open: a,
  onOpenChange: r,
  className: i,
  style: s,
  children: l,
  ...o
}) {
  const d = qs(), [u, h] = Se.useState(!1), [M, I] = Se.useState(t), C = a ?? M, c = Se.useCallback(
    (v) => {
      const m = typeof v == "function" ? v(C) : v;
      r ? r(m) : I(m), document.cookie = `${ni}=${m}; path=/; max-age=${ri}`;
    },
    [r, C]
  ), P = Se.useCallback(() => d ? h((v) => !v) : c((v) => !v), [d, c, h]);
  Se.useEffect(() => {
    const v = (m) => {
      m.key === oi && (m.metaKey || m.ctrlKey) && (m.preventDefault(), P());
    };
    return window.addEventListener("keydown", v), () => window.removeEventListener("keydown", v);
  }, [P]);
  const O = C ? "expanded" : "collapsed", z = Se.useMemo(
    () => ({
      state: O,
      open: C,
      setOpen: c,
      isMobile: d,
      openMobile: u,
      setOpenMobile: h,
      toggleSidebar: P
    }),
    [O, C, c, d, u, h, P]
  );
  return /* @__PURE__ */ e(Xn.Provider, { value: z, children: /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": si,
        "--sidebar-width-icon": li,
        ...s
      },
      className: k(
        "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
        i
      ),
      ...o,
      children: l
    }
  ) });
}
function di({
  side: t = "left",
  variant: a = "sidebar",
  collapsible: r = "offcanvas",
  className: i,
  children: s,
  dir: l,
  ...o
}) {
  const { isMobile: d, state: u, openMobile: h, setOpenMobile: M } = qt();
  return r === "none" ? /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar",
      className: k(
        "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
        i
      ),
      ...o,
      children: s
    }
  ) : d ? /* @__PURE__ */ e(Ks, { open: h, onOpenChange: M, ...o, children: /* @__PURE__ */ n(
    Ys,
    {
      dir: l,
      "data-sidebar": "sidebar",
      "data-slot": "sidebar",
      "data-mobile": "true",
      className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
      style: {
        "--sidebar-width": ii
      },
      side: t,
      children: [
        /* @__PURE__ */ n(Xs, { className: "sr-only", children: [
          /* @__PURE__ */ e(Qs, { children: "Sidebar" }),
          /* @__PURE__ */ e(Zs, { children: "Displays the mobile sidebar." })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex h-full w-full flex-col", children: s })
      ]
    }
  ) }) : /* @__PURE__ */ n(
    "div",
    {
      className: "group peer hidden text-sidebar-foreground md:block",
      "data-state": u,
      "data-collapsible": u === "collapsed" ? r : "",
      "data-variant": a,
      "data-side": t,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ e(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: k(
              "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              a === "floating" || a === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ e(
          "div",
          {
            "data-slot": "sidebar-container",
            "data-side": t,
            className: k(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
              // Adjust the padding for floating and inset variants.
              a === "floating" || a === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              i
            ),
            ...o,
            children: /* @__PURE__ */ e(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: "flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-sm group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border",
                children: s
              }
            )
          }
        )
      ]
    }
  );
}
function ui({
  className: t,
  onClick: a,
  ...r
}) {
  const { toggleSidebar: i } = qt();
  return /* @__PURE__ */ n(
    w,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon-sm",
      className: k(t),
      onClick: (s) => {
        a?.(s), i();
      },
      ...r,
      children: [
        /* @__PURE__ */ e(Pr, {}),
        /* @__PURE__ */ e("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function mi({
  className: t,
  onClick: a,
  ...r
}) {
  const { toggleSidebar: i } = qt();
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      "data-sidebar": "rail",
      "data-slot": "sidebar-rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      title: "Toggle Sidebar",
      className: k(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        t
      ),
      onClick: (s) => {
        a?.(s), i();
      },
      ...r
    }
  );
}
function hi({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "main",
    {
      "data-slot": "sidebar-inset",
      className: k(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-sm md:peer-data-[variant=inset]:shadow-sm",
        t
      ),
      ...a
    }
  );
}
function gi({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: k("flex flex-col gap-2 p-2", t),
      ...a
    }
  );
}
function pi({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      className: k("flex flex-col gap-2 p-2", t),
      ...a
    }
  );
}
function fi({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: k(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        t
      ),
      ...a
    }
  );
}
function ha({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: k("relative flex w-full min-w-0 flex-col p-2", t),
      ...a
    }
  );
}
function ga({
  className: t,
  render: a,
  ...r
}) {
  return Ht({
    defaultTagName: "div",
    props: Ut(
      {
        className: k(
          "flex h-8 shrink-0 items-center rounded-sm px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          t
        )
      },
      r
    ),
    render: a,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label"
    }
  });
}
function pa({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      className: k("w-full text-sm", t),
      ...a
    }
  );
}
function Nt({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: k("flex w-full min-w-0 flex-col gap-0", t),
      ...a
    }
  );
}
function rt({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: k("group/menu-item relative", t),
      ...a
    }
  );
}
const bi = _t(
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
function st({
  render: t,
  isActive: a = !1,
  variant: r = "default",
  size: i = "default",
  tooltip: s,
  className: l,
  ...o
}) {
  const { isMobile: d, state: u } = qt(), h = Ht({
    defaultTagName: "button",
    props: Ut(
      {
        className: k(bi({ variant: r, size: i }), l)
      },
      o
    ),
    render: s ? /* @__PURE__ */ e(ti, { render: t }) : t,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size: i,
      active: a
    }
  });
  return s ? (typeof s == "string" && (s = {
    children: s
  }), /* @__PURE__ */ n(ei, { children: [
    h,
    /* @__PURE__ */ e(
      ai,
      {
        side: "right",
        align: "center",
        hidden: u !== "collapsed" || d,
        ...s
      }
    )
  ] })) : h;
}
function vi({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "ul",
    {
      "data-slot": "sidebar-menu-sub",
      "data-sidebar": "menu-sub",
      className: k(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        t
      ),
      ...a
    }
  );
}
function yn({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    "li",
    {
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item",
      className: k("group/menu-sub-item relative", t),
      ...a
    }
  );
}
function Nn({
  render: t,
  size: a = "md",
  isActive: r = !1,
  className: i,
  ...s
}) {
  return Ht({
    defaultTagName: "a",
    props: Ut(
      {
        className: k(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-sm px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          i
        )
      },
      s
    ),
    render: t,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size: a,
      active: r
    }
  });
}
const xi = [], yi = [], Ni = {
  contentTypes: xi,
  templates: yi
};
let wi = Ni;
function Ci(t) {
  return typeof t == "object" && t !== null && Array.isArray(t.contentTypes) && Array.isArray(t.templates);
}
function Kt() {
  const t = globalThis.__CMS_CONTENT_TYPE_REGISTRY__;
  return Ci(t) ? t : wi;
}
const ki = "0.2.0", Si = {
  version: ki
}, wn = {
  FileText: Lt,
  Layout: Oa,
  Image: Mn,
  FolderTree: $n,
  Settings: Er,
  Star: da,
  Bookmark: da,
  Tag: nn,
  Hash: nn,
  Bell: da
}, Ai = [
  { title: "Dashboard", href: "/admin", icon: Oa, permission: "dashboard.view" },
  { title: "Media", href: "/admin/media", icon: Mn, permission: "media.view" },
  { title: "Menus", href: "/admin/menus", icon: zr, permission: "menus.view" }
], _i = [
  { title: "Users", href: "/admin/users", icon: Tr, permission: "users.view" },
  { title: "Activity Log", href: "/admin/activity-log", icon: Ir, permission: "activity-log.view" },
  { title: "Settings", href: "/admin/settings", icon: Dr, permission: "settings.manage" }
];
function Pi({ permissions: t, pathname: a, role: r }) {
  const i = [
    { id: "page", name: "page", label: "Pages", slug: "page", icon: "Layout", position: 0 },
    ...Kt().contentTypes.map((c) => ({ ...c, id: c.slug }))
  ], s = Je(), { setSession: l } = ze(), o = Ai.filter(
    (c) => c.permission === null || t.includes(c.permission)
  ), d = _i.filter(
    (c) => c.permission === null || t.includes(c.permission)
  ), u = r !== "author", h = i.filter(
    (c) => t.includes(`content.${c.slug}.view`) || u && t.includes(`category.${c.slug}.view`)
  );
  function M(c) {
    return c === "/admin" ? a === "/admin" : a === c || a.startsWith(c + "/");
  }
  function I(c) {
    return a.startsWith(`/admin/posts/${c}`) || c !== "page" && a.startsWith(`/admin/categories/${c}`);
  }
  async function C() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" }), l(null), s("/admin/login", { replace: !0 });
  }
  return /* @__PURE__ */ n(di, { children: [
    /* @__PURE__ */ e(gi, { className: "px-3 pt-3", children: /* @__PURE__ */ e(Nt, { children: /* @__PURE__ */ e(rt, { children: /* @__PURE__ */ n(st, { size: "lg", className: "rounded-md", onClick: () => s("/admin"), children: [
      /* @__PURE__ */ e("div", { className: "flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground", children: /* @__PURE__ */ e(Oa, { className: "size-4" }) }),
      /* @__PURE__ */ n("div", { className: "flex flex-col gap-0.5 text-left leading-none", children: [
        /* @__PURE__ */ e("span", { className: "truncate font-semibold", children: "Beaver" }),
        /* @__PURE__ */ n("span", { className: "truncate text-xs text-sidebar-foreground/65", children: [
          "v",
          Si.version
        ] })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ n(fi, { children: [
      /* @__PURE__ */ n(ha, { children: [
        /* @__PURE__ */ e(ga, { children: "Workspace" }),
        /* @__PURE__ */ e(pa, { children: /* @__PURE__ */ e(Nt, { className: "gap-1", children: o.map((c) => /* @__PURE__ */ e(rt, { children: /* @__PURE__ */ n(
          st,
          {
            isActive: M(c.href),
            tooltip: c.title,
            className: "rounded-md font-medium",
            onClick: () => s(c.href),
            children: [
              /* @__PURE__ */ e(c.icon, {}),
              /* @__PURE__ */ e("span", { children: c.title })
            ]
          }
        ) }, c.href)) }) })
      ] }),
      h.length > 0 ? /* @__PURE__ */ n(ha, { children: [
        /* @__PURE__ */ e(ga, { children: "Content" }),
        /* @__PURE__ */ e(pa, { children: /* @__PURE__ */ e(Nt, { className: "gap-1", children: h.map((c) => {
          const P = c.icon && wn[c.icon] ? wn[c.icon] : Lt, O = t.includes(`content.${c.slug}.view`), z = u && t.includes(`category.${c.slug}.view`);
          if (c.slug === "page") {
            if (!O) return null;
            const v = a.startsWith(`/admin/posts/${c.slug}`);
            return /* @__PURE__ */ e(rt, { children: /* @__PURE__ */ n(
              st,
              {
                tooltip: c.label,
                className: "rounded-md font-medium",
                isActive: v,
                onClick: () => s(`/admin/posts/${c.slug}`),
                children: [
                  /* @__PURE__ */ e(P, {}),
                  /* @__PURE__ */ e("span", { children: c.label })
                ]
              }
            ) }, c.id);
          }
          return /* @__PURE__ */ n(rt, { children: [
            /* @__PURE__ */ n(
              st,
              {
                tooltip: c.label,
                className: "rounded-md font-medium",
                isActive: I(c.slug),
                onClick: () => s(`/admin/posts/${c.slug}`),
                children: [
                  /* @__PURE__ */ e(P, {}),
                  /* @__PURE__ */ e("span", { children: c.label })
                ]
              }
            ),
            /* @__PURE__ */ n(vi, { children: [
              O && /* @__PURE__ */ e(yn, { children: /* @__PURE__ */ n(
                Nn,
                {
                  href: `/admin/posts/${c.slug}`,
                  isActive: a.startsWith(`/admin/posts/${c.slug}`),
                  className: "rounded-md",
                  onClick: (v) => {
                    v.preventDefault(), s(`/admin/posts/${c.slug}`);
                  },
                  children: [
                    /* @__PURE__ */ e(Lt, { className: "size-3.5" }),
                    /* @__PURE__ */ e("span", { children: c.label })
                  ]
                }
              ) }),
              z && /* @__PURE__ */ e(yn, { children: /* @__PURE__ */ n(
                Nn,
                {
                  href: `/admin/categories/${c.slug}`,
                  isActive: a.startsWith(`/admin/categories/${c.slug}`),
                  className: "rounded-md",
                  onClick: (v) => {
                    v.preventDefault(), s(`/admin/categories/${c.slug}`);
                  },
                  children: [
                    /* @__PURE__ */ e($n, { className: "size-3.5" }),
                    /* @__PURE__ */ e("span", { children: "Categories" })
                  ]
                }
              ) })
            ] })
          ] }, c.id);
        }) }) })
      ] }) : null,
      d.length > 0 ? /* @__PURE__ */ n(ha, { children: [
        /* @__PURE__ */ e(ga, { children: "Administration" }),
        /* @__PURE__ */ e(pa, { children: /* @__PURE__ */ e(Nt, { className: "gap-1", children: d.map((c) => /* @__PURE__ */ e(rt, { children: /* @__PURE__ */ n(
          st,
          {
            isActive: M(c.href),
            tooltip: c.title,
            className: "rounded-md font-medium",
            onClick: () => s(c.href),
            children: [
              /* @__PURE__ */ e(c.icon, {}),
              /* @__PURE__ */ e("span", { children: c.title })
            ]
          }
        ) }, c.href)) }) })
      ] }) : null
    ] }),
    /* @__PURE__ */ e(pi, { children: /* @__PURE__ */ n(Nt, { className: "gap-1", children: [
      /* @__PURE__ */ e(rt, { children: /* @__PURE__ */ n(st, { className: "rounded-md", onClick: () => s("/admin/profile"), children: [
        /* @__PURE__ */ e(Lr, {}),
        /* @__PURE__ */ e("span", { children: "Profile" })
      ] }) }),
      /* @__PURE__ */ e(rt, { children: /* @__PURE__ */ n(st, { className: "rounded-md", onClick: C, children: [
        /* @__PURE__ */ e(Mr, {}),
        /* @__PURE__ */ e("span", { children: "Logout" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ e(mi, {})
  ] });
}
function be({ className: t = "p-6" }) {
  return /* @__PURE__ */ e("main", { className: `grid min-h-[50vh] place-items-center ${t}`, "aria-busy": "true", children: /* @__PURE__ */ e($r, { className: "size-7 animate-spin text-muted-foreground", "aria-label": "Loading" }) });
}
function Ne({
  className: t,
  size: a = "default",
  ...r
}) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card",
      "data-size": a,
      className: k(
        "group/card flex flex-col gap-4 overflow-hidden rounded-sm bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-sm *:[img:last-child]:rounded-sm",
        t
      ),
      ...r
    }
  );
}
function we({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-header",
      className: k(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-sm px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        t
      ),
      ...a
    }
  );
}
function Ce({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-title",
      className: k(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        t
      ),
      ...a
    }
  );
}
function Ja({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-description",
      className: k("text-sm text-muted-foreground", t),
      ...a
    }
  );
}
function ke({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-content",
      className: k("px-4 group-data-[size=sm]/card:px-3", t),
      ...a
    }
  );
}
function F({ className: t, type: a, ...r }) {
  return /* @__PURE__ */ e(
    $s,
    {
      type: a,
      "data-slot": "input",
      className: k(
        "h-8 w-full min-w-0 rounded-sm border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        t
      ),
      ...r
    }
  );
}
function A({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "label",
    {
      "data-slot": "label",
      className: k(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        t
      ),
      ...a
    }
  );
}
function zi() {
  const { refreshSession: t } = ze(), a = Je(), [r, i] = p(""), [s, l] = p(""), [o, d] = p(""), [u, h] = p(!1), [M, I] = p("");
  async function C(c) {
    c.preventDefault(), I("");
    const P = await fetch(
      u ? "/api/admin/auth/2fa/verify" : "/api/admin/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u ? { code: o } : { email: r, password: s })
      }
    );
    if (!P.ok) {
      const z = await P.json().catch(() => null);
      I(z?.message || `Login failed (${P.status}).`);
      return;
    }
    const O = await P.json().catch(() => null);
    if (!u && O?.data?.requiresTwoFactor) {
      h(!0), d("");
      return;
    }
    try {
      if (!await t()) {
        I("Login succeeded, but the session could not be verified. Please try again.");
        return;
      }
      a("/admin", { replace: !0 });
    } catch {
      I("The session could not be verified. Please try again.");
    }
  }
  return /* @__PURE__ */ e("main", { className: "mx-auto flex min-h-screen max-w-md items-center px-6", children: /* @__PURE__ */ e("form", { className: "w-full", onSubmit: C, children: /* @__PURE__ */ n(Ne, { className: "border-border/60 shadow-sm", children: [
    /* @__PURE__ */ e(we, { children: /* @__PURE__ */ e(Ce, { children: u ? "Verify your identity" : "Log in" }) }),
    /* @__PURE__ */ n(ke, { className: "space-y-4", children: [
      M ? /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: M }) : null,
      u ? /* @__PURE__ */ n(Pe, { children: [
        /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Enter the 6-digit code from your authenticator app." }),
        /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "login-2fa-code", children: "Verification code" }),
          /* @__PURE__ */ e(
            F,
            {
              id: "login-2fa-code",
              inputMode: "numeric",
              autoComplete: "one-time-code",
              pattern: "[0-9]{6}",
              maxLength: 6,
              value: o,
              onChange: (c) => d(c.target.value.replace(/\D/g, "").slice(0, 6)),
              placeholder: "000000",
              autoFocus: !0
            }
          )
        ] }),
        /* @__PURE__ */ e(w, { className: "w-full", type: "submit", children: "Verify and continue" }),
        /* @__PURE__ */ e(w, { className: "w-full", type: "button", variant: "outline", onClick: () => {
          h(!1), I("");
        }, children: "Use another account" })
      ] }) : /* @__PURE__ */ n(Pe, { children: [
        /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "login-email", children: "Email address" }),
          /* @__PURE__ */ e(F, { id: "login-email", type: "email", autoComplete: "email", value: r, onChange: (c) => i(c.target.value), placeholder: "you@example.com" })
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "login-password", children: "Password" }),
          /* @__PURE__ */ e(F, { id: "login-password", type: "password", autoComplete: "current-password", value: s, onChange: (c) => l(c.target.value), placeholder: "Enter your password" })
        ] }),
        /* @__PURE__ */ e(w, { className: "w-full", type: "submit", children: "Log in" })
      ] })
    ] })
  ] }) }) });
}
const Le = "/admin", Ti = ie(async () => ({ default: (await Promise.resolve().then(() => nl)).AdminDashboardPage })), Cn = ie(async () => ({ default: (await Promise.resolve().then(() => xl)).AdminContentListPage })), Ii = ie(async () => ({ default: (await Promise.resolve().then(() => Nl)).AdminUsersPage })), Di = ie(async () => ({ default: (await Promise.resolve().then(() => ir)).AdminUserCreatePage })), Ei = ie(async () => ({ default: (await Promise.resolve().then(() => ir)).AdminUserEditPage })), Li = ie(async () => ({ default: (await Promise.resolve().then(() => Al)).AdminMediaPage })), kn = ie(async () => ({ default: (await Promise.resolve().then(() => Pl)).AdminCategoriesPage })), Mi = ie(async () => ({ default: (await Promise.resolve().then(() => Vl)).AdminMenusPage })), $i = ie(async () => ({ default: (await Promise.resolve().then(() => ql)).AdminProfilePage })), Sn = ie(async () => ({ default: (await Promise.resolve().then(() => dr)).AdminCategoryCreatePage })), Ri = ie(async () => ({ default: (await Promise.resolve().then(() => dr)).AdminCategoryEditPage })), An = ie(async () => ({ default: (await Promise.resolve().then(() => pr)).AdminPostCreatePage })), Oi = ie(async () => ({ default: (await Promise.resolve().then(() => pr)).AdminPostEditPage })), Fi = ie(async () => ({ default: (await Promise.resolve().then(() => ho)).AdminContentListPage })), ji = ie(async () => ({ default: (await Promise.resolve().then(() => br)).AdminPageCreatePage })), Bi = ie(async () => ({ default: (await Promise.resolve().then(() => br)).AdminPageEditPage })), Ui = ie(async () => ({ default: (await Promise.resolve().then(() => Co)).AdminSettingsPage })), Hi = ie(async () => ({ default: (await Promise.resolve().then(() => Po)).AdminActivityLogPage })), Vi = ie(async () => ({ default: (await Promise.resolve().then(() => To)).AdminTrashPage })), Gi = ie(async () => ({ default: (await Promise.resolve().then(() => Do)).AdminForbiddenPage }));
function qi() {
  return /* @__PURE__ */ e(Ra, { fallback: /* @__PURE__ */ e(be, {}), children: /* @__PURE__ */ n(Sr, { children: [
    /* @__PURE__ */ e(te, { path: `${Le}/login`, element: /* @__PURE__ */ e(Ki, {}) }),
    /* @__PURE__ */ n(te, { path: Le, element: /* @__PURE__ */ e(Ji, {}), children: [
      /* @__PURE__ */ e(te, { index: !0, element: /* @__PURE__ */ e(Ti, {}) }),
      /* @__PURE__ */ e(te, { path: "posts", element: /* @__PURE__ */ e(Cn, {}) }),
      /* @__PURE__ */ e(te, { path: "posts/new", element: /* @__PURE__ */ e(An, {}) }),
      /* @__PURE__ */ e(te, { path: "posts/:id/edit", element: /* @__PURE__ */ e(Pn, {}) }),
      /* @__PURE__ */ e(te, { path: "users", element: /* @__PURE__ */ e(Ii, {}) }),
      /* @__PURE__ */ e(te, { path: "users/new", element: /* @__PURE__ */ e(Di, {}) }),
      /* @__PURE__ */ e(te, { path: "users/:id/edit", element: /* @__PURE__ */ e(Xi, {}) }),
      /* @__PURE__ */ e(te, { path: "media", element: /* @__PURE__ */ e(Li, {}) }),
      /* @__PURE__ */ e(te, { path: "categories", element: /* @__PURE__ */ e(kn, {}) }),
      /* @__PURE__ */ e(te, { path: "categories/new", element: /* @__PURE__ */ e(Sn, {}) }),
      /* @__PURE__ */ e(te, { path: "categories/:id/edit", element: /* @__PURE__ */ e(_n, {}) }),
      /* @__PURE__ */ e(te, { path: "menus", element: /* @__PURE__ */ e(Mi, {}) }),
      /* @__PURE__ */ e(te, { path: "profile", element: /* @__PURE__ */ e($i, {}) }),
      /* @__PURE__ */ e(te, { path: "trash", element: /* @__PURE__ */ e(Wi, { children: /* @__PURE__ */ e(Vi, {}) }) }),
      /* @__PURE__ */ e(te, { path: "403", element: /* @__PURE__ */ e(Gi, {}) }),
      /* @__PURE__ */ e(te, { path: "posts/page", element: /* @__PURE__ */ e(Dt, { permission: "content.page.view", children: /* @__PURE__ */ e(Fi, {}) }) }),
      /* @__PURE__ */ e(te, { path: "posts/page/new", element: /* @__PURE__ */ e(Dt, { permission: "content.page.create", children: /* @__PURE__ */ e(ji, {}) }) }),
      /* @__PURE__ */ e(te, { path: "posts/page/:id/edit", element: /* @__PURE__ */ e(Dt, { permission: "content.page.view", children: /* @__PURE__ */ e(Yi, {}) }) }),
      /* @__PURE__ */ e(te, { path: "posts/:type", element: /* @__PURE__ */ e(Cn, {}) }),
      /* @__PURE__ */ e(te, { path: "posts/:type/new", element: /* @__PURE__ */ e(An, {}) }),
      /* @__PURE__ */ e(te, { path: "posts/:type/:id/edit", element: /* @__PURE__ */ e(Pn, {}) }),
      /* @__PURE__ */ e(te, { path: "categories/:type", element: /* @__PURE__ */ e(kn, {}) }),
      /* @__PURE__ */ e(te, { path: "categories/:type/new", element: /* @__PURE__ */ e(Sn, {}) }),
      /* @__PURE__ */ e(te, { path: "categories/:type/:id/edit", element: /* @__PURE__ */ e(_n, {}) }),
      /* @__PURE__ */ e(te, { path: "settings", element: /* @__PURE__ */ e(Ui, {}) }),
      /* @__PURE__ */ e(te, { path: "activity-log", element: /* @__PURE__ */ e(Dt, { permission: "activity-log.view", children: /* @__PURE__ */ e(Hi, {}) }) })
    ] }),
    /* @__PURE__ */ e(te, { path: "*", element: /* @__PURE__ */ e(Oe, { to: Le, replace: !0 }) })
  ] }) });
}
function Ki() {
  const { loading: t, session: a } = ze();
  return t ? /* @__PURE__ */ e(be, {}) : a ? /* @__PURE__ */ e(Oe, { to: Le, replace: !0 }) : /* @__PURE__ */ e(zi, {});
}
function Dt({ permission: t, children: a }) {
  const { session: r } = ze();
  return r?.permissions.includes(t) ? a : /* @__PURE__ */ e(Oe, { to: `${Le}/403`, replace: !0 });
}
function Wi({ children: t }) {
  const { session: a } = ze();
  return a?.permissions.some((i) => i.startsWith("content.") && (i.endsWith(".delete") || i.endsWith(".delete-own"))) ? t : /* @__PURE__ */ e(Oe, { to: `${Le}/403`, replace: !0 });
}
function Ji() {
  const { loading: t, session: a } = ze(), r = pt();
  return t ? /* @__PURE__ */ e(be, {}) : a ? /* @__PURE__ */ n(ci, { children: [
    /* @__PURE__ */ e(
      Pi,
      {
        permissions: a.permissions,
        pathname: r.pathname,
        role: a.user.role
      }
    ),
    /* @__PURE__ */ e(hi, { children: /* @__PURE__ */ e("div", { className: "flex min-h-svh flex-1 flex-col bg-background", children: /* @__PURE__ */ e(Ar, {}) }) })
  ] }) : /* @__PURE__ */ e(Oe, { to: `${Le}/login`, replace: !0 });
}
function _n() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(Ri, { id: t }) : /* @__PURE__ */ e(Oe, { to: `${Le}/categories`, replace: !0 });
}
function Pn() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(Oi, { id: t }) : /* @__PURE__ */ e(Oe, { to: `${Le}/posts`, replace: !0 });
}
function Yi() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(Bi, { id: t }) : /* @__PURE__ */ e(Oe, { to: `${Le}/posts/page`, replace: !0 });
}
function Xi() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(Ei, { id: t }) : /* @__PURE__ */ e(Oe, { to: `${Le}/users`, replace: !0 });
}
const Qi = ({ ...t }) => {
  const { theme: a = "system" } = ts();
  return /* @__PURE__ */ e(
    as,
    {
      theme: a,
      className: "toaster group",
      icons: {
        success: /* @__PURE__ */ e(Br, { className: "size-4" }),
        info: /* @__PURE__ */ e(jr, { className: "size-4" }),
        warning: /* @__PURE__ */ e(Fr, { className: "size-4" }),
        error: /* @__PURE__ */ e(Or, { className: "size-4" }),
        loading: /* @__PURE__ */ e(Rr, { className: "size-4 animate-spin" })
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
function Zi() {
  const t = Je();
  return ae(() => (xn((a, r) => {
    t(a, { replace: r?.replace });
  }), () => {
    xn(null);
  }), [t]), null;
}
function Pc() {
  return /* @__PURE__ */ n(_r, { children: [
    /* @__PURE__ */ e(Qi, { richColors: !0, position: "top-right", closeButton: !0 }),
    /* @__PURE__ */ e(Zi, {}),
    /* @__PURE__ */ e(Gs, { children: /* @__PURE__ */ e(qi, {}) })
  ] });
}
function Xe({
  className: t,
  orientation: a = "horizontal",
  ...r
}) {
  return /* @__PURE__ */ e(
    Ls,
    {
      "data-slot": "separator",
      orientation: a,
      className: k(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        t
      ),
      ...r
    }
  );
}
function Qe({
  children: t,
  className: a
}) {
  return /* @__PURE__ */ e("main", { className: k("flex min-h-full flex-1 flex-col bg-background", a), children: t });
}
function Te({
  title: t,
  search: a,
  actions: r
}) {
  return /* @__PURE__ */ n("header", { className: "z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background", children: [
    /* @__PURE__ */ n("div", { className: "flex min-w-0 items-center gap-2 px-3", children: [
      /* @__PURE__ */ e(ui, { className: "-ml-1" }),
      /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mr-2 h-4" }),
      /* @__PURE__ */ e("h1", { className: "min-w-0 truncate text-sm font-medium text-foreground", children: t })
    ] }),
    a || r ? /* @__PURE__ */ n("div", { className: "ml-auto flex items-center gap-2 px-3", children: [
      a,
      r
    ] }) : null
  ] });
}
function el({
  children: t
}) {
  return /* @__PURE__ */ e("section", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: t });
}
function ct({
  label: t,
  value: a,
  hint: r
}) {
  return /* @__PURE__ */ n(Ne, { className: "bg-card shadow-sm", children: [
    /* @__PURE__ */ n(we, { className: "gap-2", children: [
      /* @__PURE__ */ e(Ja, { className: "text-xs uppercase tracking-[0.2em]", children: t }),
      /* @__PURE__ */ e(Ce, { className: "text-2xl", children: a })
    ] }),
    /* @__PURE__ */ e(ke, { className: "pt-0 text-sm text-muted-foreground", children: r })
  ] });
}
function Fe({
  title: t,
  description: a,
  children: r,
  className: i
}) {
  return /* @__PURE__ */ n(Ne, { className: k("bg-card shadow-sm", i), children: [
    /* @__PURE__ */ n(we, { className: "border-b border-border/70", children: [
      /* @__PURE__ */ e(Ce, { children: t }),
      a ? /* @__PURE__ */ e(Ja, { children: a }) : null
    ] }),
    /* @__PURE__ */ e(ke, { className: "", children: r })
  ] });
}
function tl() {
  const [t, a] = p(null), [r, i] = p(null), { session: s } = ze(), l = s?.user?.role === "author", o = [
    { label: "Pages", slug: "page" },
    { label: "Posts", slug: "post" },
    ...Kt().contentTypes.filter(
      (u) => u.slug !== "page" && u.slug !== "post"
    )
  ];
  async function d() {
    i(null);
    const u = await fe("/api/admin/dashboard");
    a(u);
  }
  return ae(() => {
    d().catch((u) => i(u.message));
  }, []), r ? /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ n("p", { className: "text-destructive", children: [
    "Error: ",
    r
  ] }) }) : t ? /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Dashboard"
      }
    ),
    /* @__PURE__ */ n("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ n(el, { children: [
        /* @__PURE__ */ e(
          ct,
          {
            label: l ? "My Content" : "Total Content",
            value: String(t.totalPosts),
            hint: l ? "Your content across every status" : "All content across every status"
          }
        ),
        /* @__PURE__ */ e(
          ct,
          {
            label: "Published",
            value: String(t.publishedPosts),
            hint: "Content visible to visitors"
          }
        ),
        /* @__PURE__ */ e(
          ct,
          {
            label: "Drafts",
            value: String(t.draftPosts),
            hint: "Content waiting to be finished"
          }
        ),
        /* @__PURE__ */ e(
          ct,
          {
            label: "Media",
            value: String(t.totalMedia),
            hint: "Uploaded files and images"
          }
        ),
        l ? null : /* @__PURE__ */ n(Pe, { children: [
          /* @__PURE__ */ e(
            ct,
            {
              label: "Users",
              value: String(t.totalUsers),
              hint: "Registered admin accounts"
            }
          ),
          /* @__PURE__ */ e(
            ct,
            {
              label: "Categories",
              value: String(t.totalCategories),
              hint: "Content taxonomies"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e("section", { children: /* @__PURE__ */ e(
        Fe,
        {
          title: "Content workspace",
          description: "Start, review, and organize the content you can access.",
          children: /* @__PURE__ */ n("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            o.filter((u) => s?.permissions.includes(`content.${u.slug}.view`)).map((u) => /* @__PURE__ */ e(
              al,
              {
                to: `/admin/posts/${u.slug}`,
                title: u.label,
                description: `Manage ${u.label.toLowerCase()} and their publishing status.`,
                icon: Lt
              },
              u.slug
            )),
            o.every((u) => !s?.permissions.includes(`content.${u.slug}.view`)) ? /* @__PURE__ */ e("p", { className: "text-sm leading-6 text-muted-foreground", children: "Your role does not currently have access to a content type." }) : null
          ] })
        }
      ) })
    ] })
  ] }) : /* @__PURE__ */ e(be, {});
}
function al({
  to: t,
  title: a,
  description: r,
  icon: i
}) {
  return /* @__PURE__ */ n(
    Ee,
    {
      to: t,
      className: "group rounded-sm border border-border/70 bg-muted/20 p-4 transition hover:border-foreground/15 hover:bg-muted/45",
      children: [
        /* @__PURE__ */ e("div", { className: "mb-3 flex size-10 items-center justify-center rounded-sm bg-background text-foreground ring-1 ring-border/70", children: /* @__PURE__ */ e(i, { className: "size-4" }) }),
        /* @__PURE__ */ n("div", { className: "space-y-1", children: [
          /* @__PURE__ */ n("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
            /* @__PURE__ */ e("span", { children: a }),
            /* @__PURE__ */ e(Ur, { className: "size-3.5 transition group-hover:translate-x-0.5" })
          ] }),
          /* @__PURE__ */ e("p", { className: "text-sm leading-6 text-muted-foreground", children: r })
        ] })
      ]
    }
  );
}
const nl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminDashboardPage: tl
}, Symbol.toStringTag, { value: "Module" })), rl = _t(
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
function $e({
  className: t,
  variant: a = "default",
  render: r,
  ...i
}) {
  return Ht({
    defaultTagName: "span",
    props: Ut(
      {
        className: k(rl({ variant: a }), t)
      },
      i
    ),
    render: r,
    state: {
      slot: "badge",
      variant: a
    }
  });
}
function Ze(t) {
  return /* @__PURE__ */ e(ge.Root, { "data-slot": "dialog", ...t });
}
function Pt({ ...t }) {
  return /* @__PURE__ */ e(ge.Trigger, { "data-slot": "dialog-trigger", ...t });
}
function sl({ ...t }) {
  return /* @__PURE__ */ e(ge.Portal, { "data-slot": "dialog-portal", ...t });
}
function il({ ...t }) {
  return /* @__PURE__ */ e(ge.Close, { "data-slot": "dialog-close", ...t });
}
function ll({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    ge.Backdrop,
    {
      "data-slot": "dialog-overlay",
      className: k(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        t
      ),
      ...a
    }
  );
}
function et({
  className: t,
  children: a,
  showCloseButton: r = !0,
  ...i
}) {
  return /* @__PURE__ */ n(sl, { children: [
    /* @__PURE__ */ e(ll, {}),
    /* @__PURE__ */ n(
      ge.Popup,
      {
        "data-slot": "dialog-content",
        className: k(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-sm bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          t
        ),
        ...i,
        children: [
          a,
          r && /* @__PURE__ */ n(
            ge.Close,
            {
              "data-slot": "dialog-close",
              render: /* @__PURE__ */ e(
                w,
                {
                  variant: "ghost",
                  className: "absolute top-2 right-2",
                  size: "icon-sm"
                }
              ),
              children: [
                /* @__PURE__ */ e(
                  Ln,
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
function tt({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "dialog-header",
      className: k("flex flex-col gap-2", t),
      ...a
    }
  );
}
function bt({
  className: t,
  showCloseButton: a = !1,
  children: r,
  ...i
}) {
  return /* @__PURE__ */ n(
    "div",
    {
      "data-slot": "dialog-footer",
      className: k(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-sm border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        t
      ),
      ...i,
      children: [
        r,
        a && /* @__PURE__ */ e(ge.Close, { render: /* @__PURE__ */ e(w, { variant: "outline" }), children: "Close" })
      ]
    }
  );
}
function at({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    ge.Title,
    {
      "data-slot": "dialog-title",
      className: k(
        "font-heading text-base leading-none font-medium",
        t
      ),
      ...a
    }
  );
}
function Wt({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    ge.Description,
    {
      "data-slot": "dialog-description",
      className: k(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        t
      ),
      ...a
    }
  );
}
const fa = {
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
}, ol = {
  create: "created",
  update: "updated",
  delete: "deleted"
}, q = {
  success(t, a) {
    nt.success(`${fa[a]} ${ol[t]}.`);
  },
  error(t) {
    nt.error(t);
  },
  message(t) {
    nt.success(t);
  },
  close(t) {
    nt.dismiss(t);
  },
  uploaded(t) {
    nt.success(`Uploaded ${t}.`);
  },
  copied(t) {
    nt.success(`${fa[t]} copied.`);
  },
  saved(t) {
    nt.success(`${fa[t]} saved.`);
  }
};
function he(t) {
  if (typeof t != "string") return null;
  const a = t.trim();
  if (!a || /[\u0000-\u001f\u007f\\]/.test(a) || a.startsWith("//")) return null;
  if (a.startsWith("/")) return a;
  try {
    return ["http:", "https:"].includes(new URL(a).protocol) ? a : null;
  } catch {
    return null;
  }
}
function Et(t) {
  return t == null || !Number.isFinite(t) ? null : Math.abs(t) < 1e10 ? t * 1e3 : t;
}
const ce = Ae.Root;
function de({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    Ae.Value,
    {
      "data-slot": "select-value",
      className: k("flex flex-1 text-left", t),
      ...a
    }
  );
}
function ue({
  className: t,
  size: a = "default",
  children: r,
  ...i
}) {
  return /* @__PURE__ */ n(
    Ae.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": a,
      className: k(
        "flex w-fit items-center justify-between gap-1.5 rounded-sm border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-sm-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...i,
      children: [
        r,
        /* @__PURE__ */ e(
          Ae.Icon,
          {
            render: /* @__PURE__ */ e(Rn, { className: "pointer-events-none size-4 text-muted-foreground" })
          }
        )
      ]
    }
  );
}
function me({
  className: t,
  children: a,
  side: r = "bottom",
  sideOffset: i = 4,
  align: s = "center",
  alignOffset: l = 0,
  alignItemWithTrigger: o = !0,
  ...d
}) {
  return /* @__PURE__ */ e(Ae.Portal, { children: /* @__PURE__ */ e(
    Ae.Positioner,
    {
      side: r,
      sideOffset: i,
      align: s,
      alignOffset: l,
      alignItemWithTrigger: o,
      className: "isolate z-50",
      children: /* @__PURE__ */ n(
        Ae.Popup,
        {
          "data-slot": "select-content",
          "data-align-trigger": o,
          className: k("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", t),
          ...d,
          children: [
            /* @__PURE__ */ e(cl, {}),
            /* @__PURE__ */ e(Ae.List, { children: a }),
            /* @__PURE__ */ e(dl, {})
          ]
        }
      )
    }
  ) });
}
function Z({
  className: t,
  children: a,
  ...r
}) {
  return /* @__PURE__ */ n(
    Ae.Item,
    {
      "data-slot": "select-item",
      className: k(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-sm py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        t
      ),
      ...r,
      children: [
        /* @__PURE__ */ e(Ae.ItemText, { className: "flex flex-1 shrink-0 gap-2 whitespace-nowrap", children: a }),
        /* @__PURE__ */ e(
          Ae.ItemIndicator,
          {
            render: /* @__PURE__ */ e("span", { className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center" }),
            children: /* @__PURE__ */ e(On, { className: "pointer-events-none" })
          }
        )
      ]
    }
  );
}
function cl({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    Ae.ScrollUpArrow,
    {
      "data-slot": "select-scroll-up-button",
      className: k(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...a,
      children: /* @__PURE__ */ e(
        Hr,
        {}
      )
    }
  );
}
function dl({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    Ae.ScrollDownArrow,
    {
      "data-slot": "select-scroll-down-button",
      className: k(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...a,
      children: /* @__PURE__ */ e(
        Rn,
        {}
      )
    }
  );
}
function Qn(t, a = 400) {
  const [r, i] = p(t);
  return ae(() => {
    const s = setTimeout(() => i(t), a);
    return () => clearTimeout(s);
  }, [a, t]), r;
}
function zt(t, a = {}) {
  const r = new URLSearchParams();
  for (const [i, s] of Object.entries({ ...t, ...a }))
    s !== void 0 && s !== "" && s !== "all" && r.set(i, String(s));
  return r;
}
function Ya(t) {
  const a = Number(new URLSearchParams(t).get("page") ?? "1");
  return Number.isSafeInteger(a) && a > 0 ? a : 1;
}
function Tt({
  locationSearch: t,
  navigate: a,
  path: r,
  defaults: i,
  debounceKeys: s = ["search"]
}) {
  function l() {
    const z = new URLSearchParams(t);
    return Object.fromEntries(
      Object.entries(i).map(([v, m]) => [
        v,
        z.get(v) ?? m
      ])
    );
  }
  const [o, d] = p(l), u = qe(o);
  u.current = o, ae(() => {
    d(l());
  }, [t]);
  const h = Y((z, v) => {
    d((m) => ({ ...m, [z]: v }));
  }, []), M = Y(() => {
    a(Ct(r, o));
  }, [o, a, r]), I = Y(
    (z) => {
      const v = o.sortBy === z && o.sortOrder === "asc" ? "desc" : "asc", m = {
        ...o,
        sortBy: z,
        sortOrder: v
      };
      d(m), a(Ct(r, m));
    },
    [o, a, r]
  ), C = Y(
    (z) => {
      z.key === "Enter" && (z.preventDefault(), M());
    },
    [M]
  ), c = s.map((z) => `${z}:${o[z] ?? ""}`).join("\0"), P = qe(!0), O = Qn(c);
  return ae(() => {
    if (P.current) {
      P.current = !1;
      return;
    }
    a(Ct(r, u.current));
  }, [O, a, r]), {
    filters: o,
    setFilter: h,
    handleFilter: M,
    handleSort: I,
    handleKeyDown: C,
    buildPageUrl: (z) => Ct(r, { ...o, page: z })
  };
}
function Zn({
  value: t,
  onValueChange: a,
  showScheduled: r = !0,
  showTrash: i = !1
}) {
  return /* @__PURE__ */ n(
    ce,
    {
      value: t,
      onValueChange: (s) => {
        s && a(s);
      },
      children: [
        /* @__PURE__ */ e(ue, { className: "w-[140px]", children: /* @__PURE__ */ e(de, { placeholder: "Status" }) }),
        /* @__PURE__ */ n(me, { children: [
          /* @__PURE__ */ e(Z, { value: "all", children: "All Status" }),
          /* @__PURE__ */ e(Z, { value: "draft", children: "Draft" }),
          r && /* @__PURE__ */ e(Z, { value: "scheduled", children: "Scheduled" }),
          /* @__PURE__ */ e(Z, { value: "published", children: "Published" }),
          i && /* @__PURE__ */ e(Z, { value: "trash", children: "Trash" })
        ] })
      ]
    }
  );
}
const We = Se.forwardRef(
  ({ className: t, checked: a, onCheckedChange: r, disabled: i, ...s }, l) => /* @__PURE__ */ n(
    "label",
    {
      "data-slot": "checkbox",
      className: k(
        "group inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        a && "border-primary bg-primary text-primary-foreground",
        t
      ),
      children: [
        /* @__PURE__ */ e(
          "input",
          {
            ref: l,
            type: "checkbox",
            checked: a,
            onChange: (o) => r?.(o.target.checked),
            disabled: i,
            className: "sr-only",
            ...s
          }
        ),
        a && /* @__PURE__ */ e(Fa, { className: "size-3" })
      ]
    }
  )
);
We.displayName = "Checkbox";
function er({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto rounded-lg border border-border/70 bg-card",
      children: /* @__PURE__ */ e(
        "table",
        {
          "data-slot": "table",
          className: k("w-full table-auto caption-bottom text-sm", t),
          ...a
        }
      )
    }
  );
}
function tr({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "thead",
    {
      "data-slot": "table-header",
      className: k("[&_tr]:border-b", t),
      ...a
    }
  );
}
function ar({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "tbody",
    {
      "data-slot": "table-body",
      className: k("[&_tr:last-child]:border-0", t),
      ...a
    }
  );
}
function ht({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "tr",
    {
      "data-slot": "table-row",
      className: k(
        "border-b transition-colors hover:bg-muted/35 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        t
      ),
      ...a
    }
  );
}
function Ge({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "th",
    {
      "data-slot": "table-head",
      className: k(
        "h-10 px-2 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        t
      ),
      ...a
    }
  );
}
function De({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "td",
    {
      "data-slot": "table-cell",
      className: k(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        t
      ),
      ...a
    }
  );
}
function ul({
  label: t,
  column: a,
  sortBy: r,
  sortOrder: i,
  onSort: s
}) {
  return /* @__PURE__ */ n(
    w,
    {
      type: "button",
      variant: "ghost",
      size: "sm",
      onClick: () => s(a),
      className: "h-auto gap-1 p-0 font-normal hover:bg-transparent",
      children: [
        t,
        r === a ? i === "asc" ? /* @__PURE__ */ e(Vr, { className: "size-3.5" }) : /* @__PURE__ */ e(Gr, { className: "size-3.5" }) : /* @__PURE__ */ e(qr, { className: "size-3.5 text-muted-foreground/50" })
      ]
    }
  );
}
function Xa({
  items: t,
  columns: a,
  selectedIds: r,
  isAllSelected: i,
  onSelectAll: s,
  onSelectOne: l,
  selectAllLabel: o,
  selectItemLabel: d,
  emptyMessage: u,
  sortBy: h,
  sortOrder: M,
  onSort: I
}) {
  return /* @__PURE__ */ n(er, { children: [
    /* @__PURE__ */ e(tr, { children: /* @__PURE__ */ n(ht, { className: "bg-muted/35 hover:bg-muted/35", children: [
      /* @__PURE__ */ e(Ge, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
        We,
        {
          checked: i,
          onCheckedChange: (C) => s(C === !0),
          "aria-label": o
        }
      ) }),
      a.map((C) => /* @__PURE__ */ e(
        Ge,
        {
          className: C.headerClassName ?? "px-4 py-3",
          children: C.sortKey ? /* @__PURE__ */ e(
            ul,
            {
              label: C.label,
              column: C.sortKey,
              sortBy: h,
              sortOrder: M,
              onSort: I
            }
          ) : C.label
        },
        C.key
      ))
    ] }) }),
    /* @__PURE__ */ e(ar, { children: t.length === 0 ? /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(
      De,
      {
        colSpan: a.length + 1,
        className: "px-4 py-8 text-center text-muted-foreground",
        children: u
      }
    ) }) : t.map((C) => /* @__PURE__ */ n(ht, { className: "hover:bg-muted/25", children: [
      /* @__PURE__ */ e(De, { className: "px-4 py-3", children: /* @__PURE__ */ e(
        We,
        {
          checked: r.includes(C.id),
          onCheckedChange: (c) => l(C.id, c === !0),
          "aria-label": d(C)
        }
      ) }),
      a.map((c) => /* @__PURE__ */ e(
        De,
        {
          className: c.cellClassName ?? "px-4 py-3",
          children: c.render(C)
        },
        c.key
      ))
    ] }, C.id)) })
  ] });
}
function Jt({
  selectedIds: t,
  entity: a,
  onSuccess: r,
  successAction: i = "update"
}) {
  const [s, l] = p(!1), o = Y(
    async (d, u = {}) => {
      if (!(t.length === 0 || s)) {
        l(!0);
        try {
          const h = await _e(d, { ids: t, ...u });
          h.success ? (q.success(i, a), await r()) : q.error(h.message);
        } finally {
          l(!1);
        }
      }
    },
    [a, s, r, t, i]
  );
  return { isPending: s, performBulkAction: o };
}
function Yt({
  selectedCount: t,
  isPending: a,
  actions: r,
  onClear: i
}) {
  return /* @__PURE__ */ n("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
    /* @__PURE__ */ n("span", { className: "text-sm text-muted-foreground", children: [
      t,
      " selected"
    ] }),
    /* @__PURE__ */ n("div", { className: "ml-auto flex items-center gap-2", children: [
      r.map((s) => /* @__PURE__ */ e(
        w,
        {
          type: "button",
          variant: s.variant ?? "outline",
          size: "sm",
          onClick: s.onClick,
          disabled: a,
          children: s.label
        },
        s.label
      )),
      /* @__PURE__ */ e(
        w,
        {
          type: "button",
          variant: "ghost",
          size: "sm",
          onClick: i,
          disabled: a,
          children: "Clear"
        }
      )
    ] })
  ] });
}
function Xt(t) {
  const [a, r] = p([]), i = Y(
    (o) => {
      t && r(o ? t.map((d) => d.id) : []);
    },
    [t]
  ), s = Y((o, d) => {
    r(
      (u) => d ? u.includes(o) ? u : [...u, o] : u.filter((h) => h !== o)
    );
  }, []), l = Y(() => r([]), []);
  return {
    selectedIds: a,
    clearSelection: l,
    handleSelectAll: i,
    handleSelectOne: s,
    isAllSelected: t !== null && t.length > 0 && a.length === t.length,
    isSomeSelected: a.length > 0
  };
}
function ml({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "nav",
    {
      role: "navigation",
      "aria-label": "pagination",
      "data-slot": "pagination",
      className: k("mx-auto flex w-full justify-center", t),
      ...a
    }
  );
}
function hl({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "ul",
    {
      "data-slot": "pagination-content",
      className: k("flex flex-row items-center gap-1", t),
      ...a
    }
  );
}
function ba({ className: t, ...a }) {
  return /* @__PURE__ */ e("li", { "data-slot": "pagination-item", className: k("", t), ...a });
}
function Qa({
  className: t,
  isActive: a,
  size: r = "icon",
  render: i,
  ...s
}) {
  const l = {
    ...s,
    "aria-current": a ? "page" : void 0,
    "data-slot": "pagination-link",
    className: k(
      ft({
        variant: a ? "outline" : "ghost",
        size: r
      }),
      t
    )
  };
  return i ? Se.cloneElement(i, l) : /* @__PURE__ */ e("a", { ...l });
}
function gl({
  className: t,
  render: a,
  ...r
}) {
  return /* @__PURE__ */ n(
    Qa,
    {
      "aria-label": "Go to previous page",
      size: "default",
      className: k("gap-1 pl-2.5", t),
      render: a,
      ...r,
      children: [
        /* @__PURE__ */ e(Kr, { className: "size-4" }),
        /* @__PURE__ */ e("span", { children: "Previous" })
      ]
    }
  );
}
function pl({
  className: t,
  render: a,
  ...r
}) {
  return /* @__PURE__ */ n(
    Qa,
    {
      "aria-label": "Go to next page",
      size: "default",
      className: k("gap-1 pr-2.5", t),
      render: a,
      ...r,
      children: [
        /* @__PURE__ */ e("span", { children: "Next" }),
        /* @__PURE__ */ e(jn, { className: "size-4" })
      ]
    }
  );
}
function fl({ className: t, ...a }) {
  return /* @__PURE__ */ n(
    "span",
    {
      "aria-hidden": !0,
      "data-slot": "pagination-ellipsis",
      className: k("flex size-8 items-center justify-center", t),
      ...a,
      children: [
        /* @__PURE__ */ e(Fn, { className: "size-4" }),
        /* @__PURE__ */ e("span", { className: "sr-only", children: "More pages" })
      ]
    }
  );
}
function bl(t, a) {
  return a <= 7 ? Array.from({ length: a }, (r, i) => i + 1) : t <= 4 ? [1, 2, 3, 4, 5, "ellipsis", a] : t >= a - 3 ? [1, "ellipsis", a - 4, a - 3, a - 2, a - 1, a] : [1, "ellipsis", t - 1, t, t + 1, "ellipsis", a];
}
function Qt({
  meta: t,
  getPageUrl: a
}) {
  if (!t) return null;
  const r = bl(t.currentPage, t.lastPage);
  return /* @__PURE__ */ n("div", { className: "flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ n("span", { children: [
      "Showing ",
      t.from,
      "–",
      t.to,
      " of ",
      t.total
    ] }),
    t.lastPage > 1 && /* @__PURE__ */ e(ml, { className: "mx-0 w-auto justify-end", children: /* @__PURE__ */ n(hl, { children: [
      t.currentPage > 1 && /* @__PURE__ */ e(ba, { children: /* @__PURE__ */ e(gl, { render: /* @__PURE__ */ e(Ee, { to: a(t.currentPage - 1) }) }) }),
      r.map((i, s) => /* @__PURE__ */ e(ba, { children: i === "ellipsis" ? /* @__PURE__ */ e(fl, {}) : /* @__PURE__ */ e(
        Qa,
        {
          render: /* @__PURE__ */ e(Ee, { to: a(i) }),
          isActive: i === t.currentPage,
          "aria-label": `Go to page ${i}`,
          children: i
        }
      ) }, i === "ellipsis" ? `ellipsis-${s}` : i)),
      t.currentPage < t.lastPage && /* @__PURE__ */ e(ba, { children: /* @__PURE__ */ e(pl, { render: /* @__PURE__ */ e(Ee, { to: a(t.currentPage + 1) }) }) })
    ] }) })
  ] });
}
function Zt({ message: t }) {
  return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ n("p", { className: "text-destructive", children: [
    "Error: ",
    t
  ] }) });
}
function nr({
  contentType: t,
  pageTitle: a,
  createMode: r = "link"
}) {
  const [i, s] = p(null), [l, o] = p(null), [d, u] = p(!1), [h, M] = p(""), [I, C] = p(null), [c, P] = p(!1), [O, z] = p(null), v = pt(), m = Je(), { type: g } = Ve(), { session: _ } = ze(), T = new URLSearchParams(v.search).get("trash"), L = T === "1" || T === "true", y = _?.permissions.some((E) => E.startsWith("content.") && (E.endsWith(".delete") || E.endsWith(".delete-own"))) ?? !1, b = t ?? g ?? (L ? void 0 : "post"), N = b === "page", f = t || g ? `/admin/posts/${b}` : "/admin/posts", x = N ? "page" : b ?? "content", $ = N ? "page" : "post", {
    filters: j,
    setFilter: K,
    handleSort: ne,
    handleKeyDown: X,
    buildPageUrl: ve
  } = Tt({
    locationSearch: v.search,
    navigate: m,
    path: f,
    defaults: { search: "", status: "all", trash: "", sortBy: "", sortOrder: "" },
    debounceKeys: ["search", "status", "trash"]
  }), {
    selectedIds: S,
    clearSelection: D,
    handleSelectAll: V,
    handleSelectOne: R,
    isAllSelected: G,
    isSomeSelected: re
  } = Xt(i?.data ?? null);
  async function J() {
    o(null);
    const U = zt(j, {
      page: Ya(v.search),
      ...b ? { type: b } : {}
    }).toString(), W = await fe(
      `/api/admin/posts${U ? `?${U}` : ""}`
    );
    s(W), D();
  }
  const { isPending: ee, performBulkAction: H } = Jt({
    selectedIds: S,
    entity: $,
    onSuccess: J
  });
  ae(() => {
    L && !y || J().catch((E) => o(E.message));
  }, [v.search, L, y, b]);
  function pe(E) {
    u(E), E || (M(""), C(null));
  }
  async function oe(E) {
    E.preventDefault();
    const U = h.trim();
    if (!U) {
      C("Title is required.");
      return;
    }
    C(null), P(!0);
    const W = await _e("/api/admin/posts", {
      title: U,
      type: b,
      status: "draft"
    });
    if (P(!1), W.success) {
      q.success("create", $), m(`${f}/${W.data.id}/edit`);
      return;
    }
    C(W.errors?.title?.[0] ?? W.message), q.error(W.message);
  }
  const le = Y(async () => {
    S.length !== 0 && confirm(`Move ${S.length} ${x}(s) to trash?`) && await H("/api/admin/posts/bulk/delete");
  }, [H, x, S]), xe = Y(async () => {
    S.length !== 0 && await H("/api/admin/posts/bulk/restore");
  }, [H, S.length]), vt = Y(async () => {
    S.length !== 0 && confirm(`Permanently delete ${S.length} ${x}(s)? This action cannot be undone.`) && await H("/api/admin/posts/bulk/permanent-delete");
  }, [H, x, S.length]);
  async function xt(E) {
    if (O) return;
    z(`restore:${E}`);
    const U = await _e(`/api/admin/posts/${E}/restore`);
    if (z(null), !U.success) {
      q.error(U.message);
      return;
    }
    q.message("Content restored."), await J();
  }
  async function na(E, U) {
    if (O || !confirm(`Permanently delete “${U}”? This action cannot be undone.`)) return;
    z(`delete:${E}`);
    const W = await Wa(`/api/admin/posts/${E}/permanent-delete`);
    if (z(null), !W.success) {
      q.error(W.message);
      return;
    }
    q.message("Content permanently deleted."), await J();
  }
  const ra = Y(async () => {
    await H("/api/admin/posts/bulk/publish");
  }, [H]), sa = Y(async () => {
    await H("/api/admin/posts/bulk/unpublish");
  }, [H]), ia = Y(async () => {
    await H("/api/admin/posts/bulk/duplicate");
  }, [H]);
  if (l) return /* @__PURE__ */ e(Zt, { message: l });
  if (L && !y) return /* @__PURE__ */ e(Oe, { to: "/admin/403", replace: !0 });
  if (!i) return /* @__PURE__ */ e(be, {});
  const la = i.data ?? [], oa = L ? "Trash" : a ?? (N ? "Pages" : "Posts"), ca = L ? "Trash is empty." : N ? "No pages found." : "No content found.";
  function B(E) {
    if (E === "trash") {
      K("status", "all"), K("trash", "true");
      return;
    }
    K("status", E), K("trash", "");
  }
  return /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: oa,
        search: /* @__PURE__ */ e(
          F,
          {
            placeholder: "Search by title...",
            value: j.search,
            onChange: (E) => K("search", E.target.value),
            onKeyDown: X,
            className: "max-w-xs"
          }
        ),
        actions: L ? void 0 : r === "dialog" ? /* @__PURE__ */ n(w, { type: "button", size: "lg", onClick: () => u(!0), children: [
          "New ",
          x.charAt(0).toUpperCase() + x.slice(1)
        ] }) : /* @__PURE__ */ n(Ee, { to: `${f}/new`, className: k(ft({ size: "lg" })), children: [
          "New ",
          x.charAt(0).toUpperCase() + x.slice(1)
        ] })
      }
    ),
    !L && r === "dialog" && /* @__PURE__ */ e(Ze, { open: d, onOpenChange: pe, children: /* @__PURE__ */ n(et, { children: [
      /* @__PURE__ */ e(tt, { children: /* @__PURE__ */ e(at, { children: "New Page" }) }),
      /* @__PURE__ */ n("form", { onSubmit: oe, className: "space-y-4", children: [
        /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "new-page-title", children: "Title" }),
          /* @__PURE__ */ e(
            F,
            {
              id: "new-page-title",
              value: h,
              onChange: (E) => {
                M(E.target.value), I && C(null);
              },
              placeholder: "Page title",
              autoFocus: !0,
              "aria-invalid": !!I,
              "aria-describedby": I ? "new-page-title-error" : void 0
            }
          ),
          I && /* @__PURE__ */ e("p", { id: "new-page-title-error", className: "text-xs text-destructive", children: I })
        ] }),
        /* @__PURE__ */ n(bt, { children: [
          /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "outline",
              onClick: () => pe(!1),
              disabled: c,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ e(w, { type: "submit", disabled: c, children: c ? "Creating…" : "Create Page" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ n("div", { className: "space-y-4 p-4", children: [
      /* @__PURE__ */ e("div", { className: "flex flex-wrap items-center gap-3", children: /* @__PURE__ */ e(
        Zn,
        {
          value: j.trash === "1" || j.trash === "true" ? "trash" : j.status,
          onValueChange: B,
          showTrash: y
        }
      ) }),
      re && /* @__PURE__ */ e(
        Yt,
        {
          selectedCount: S.length,
          isPending: ee,
          actions: L ? [
            { label: "Restore", onClick: xe },
            { label: "Delete permanently", onClick: vt, variant: "destructive" }
          ] : [
            { label: "Publish", onClick: ra },
            { label: "Unpublish", onClick: sa },
            { label: "Duplicate", onClick: ia },
            { label: "Move to trash", onClick: le, variant: "destructive" }
          ],
          onClear: D
        }
      ),
      /* @__PURE__ */ e(
        Xa,
        {
          items: la,
          selectedIds: S,
          isAllSelected: G,
          onSelectAll: V,
          onSelectOne: R,
          selectAllLabel: `Select all ${L ? "trashed content" : N ? "pages" : "content"}`,
          selectItemLabel: (E) => `Select ${E.title}`,
          emptyMessage: ca,
          sortBy: j.sortBy,
          sortOrder: j.sortOrder,
          onSort: ne,
          columns: [
            {
              key: "title",
              label: "Title",
              sortKey: "title",
              cellClassName: "px-4 py-3 font-medium",
              render: (E) => /* @__PURE__ */ n("div", { className: "flex items-center gap-3", children: [
                !N && (he(E.featuredImage) ? /* @__PURE__ */ e(
                  "img",
                  {
                    src: he(E.featuredImage) ?? void 0,
                    alt: "",
                    className: "size-10 rounded-sm border object-cover"
                  }
                ) : /* @__PURE__ */ e("div", { className: "size-10 rounded-sm border bg-muted" })),
                L ? /* @__PURE__ */ e("span", { children: E.title }) : /* @__PURE__ */ e(Ee, { to: `${f}/${E.id}/edit`, className: "underline", children: E.title })
              ] })
            },
            ...L ? [{
              key: "type",
              label: "Type",
              cellClassName: "w-px px-4 py-3 capitalize",
              render: (E) => E.type
            }] : [],
            {
              key: "status",
              label: L || N ? "Status" : "Visibility",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (E) => /* @__PURE__ */ e(
                $e,
                {
                  variant: E.status === "published" ? "default" : "secondary",
                  className: E.status === "published" ? "border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300" : E.status === "scheduled" ? "border-0 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300" : "capitalize",
                  children: E.status === "scheduled" ? "Scheduled" : E.status
                }
              )
            },
            {
              key: "updatedAt",
              label: "Updated",
              sortKey: "updatedAt",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (E) => {
                const U = Et(E.updatedAt);
                return U === null ? "—" : new Date(U).toLocaleDateString();
              }
            },
            ...N ? [] : [{
              key: "publishedAt",
              label: "Published",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (E) => {
                const U = Et(E.publishedAt);
                return U === null ? "—" : new Date(U).toLocaleDateString();
              }
            }],
            ...L ? [{
              key: "deletedAt",
              label: "Deleted",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (E) => {
                const U = Et(E.deletedAt);
                return U === null ? "—" : new Date(U).toLocaleDateString();
              }
            }, {
              key: "actions",
              label: "",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (E) => /* @__PURE__ */ n("div", { className: "flex items-center justify-end gap-2", children: [
                /* @__PURE__ */ e(
                  w,
                  {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    disabled: O !== null,
                    onClick: () => {
                      xt(E.id);
                    },
                    children: "Restore"
                  }
                ),
                /* @__PURE__ */ e(
                  w,
                  {
                    type: "button",
                    variant: "destructive",
                    size: "sm",
                    disabled: O !== null,
                    onClick: () => {
                      na(E.id, E.title);
                    },
                    children: "Delete permanently"
                  }
                )
              ] })
            }] : []
          ]
        }
      ),
      /* @__PURE__ */ e(Qt, { meta: i.meta, getPageUrl: ve })
    ] })
  ] });
}
function vl(t) {
  return /* @__PURE__ */ e(nr, { ...t });
}
const xl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminContentListPage: vl
}, Symbol.toStringTag, { value: "Module" })), Za = [
  {
    slug: "super-admin",
    name: "Super Admin",
    description: "Full system access."
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Manages users, settings, media, menus, and all content."
  },
  {
    slug: "editor",
    name: "Editor",
    description: "Manages all content and publication."
  },
  {
    slug: "author",
    name: "Author",
    description: "Creates, edits, publishes, unpublishes, and deletes their own posts, but cannot access pages."
  }
];
new Map(Za.map((t) => [t.slug, t.name]));
function yl() {
  const [t, a] = p(null), [r, i] = p(null), s = pt(), l = Je(), o = "/admin/users", {
    filters: d,
    setFilter: u,
    handleSort: h,
    handleKeyDown: M,
    buildPageUrl: I
  } = Tt({
    locationSearch: s.search,
    navigate: l,
    path: o,
    defaults: { search: "", role: "all", sortBy: "", sortOrder: "" },
    debounceKeys: ["search", "role"]
  }), {
    selectedIds: C,
    clearSelection: c,
    handleSelectAll: P,
    handleSelectOne: O,
    isAllSelected: z,
    isSomeSelected: v
  } = Xt(t?.data ?? null), { isPending: m, performBulkAction: g } = Jt({
    selectedIds: C,
    entity: "user",
    onSuccess: _
  });
  async function _() {
    i(null);
    const b = zt(d, {
      page: Ya(s.search)
    }).toString(), N = await fe(`/api/admin/users${b ? `?${b}` : ""}`);
    a(N), c();
  }
  ae(() => {
    _().catch((b) => i(b.message));
  }, [s.search]);
  const T = Y(async () => {
    C.length !== 0 && confirm(`Delete ${C.length} user(s)? This action cannot be undone.`) && await g("/api/admin/users/bulk/delete");
  }, [g, C]), L = Y(async () => {
    await g("/api/admin/users/bulk/duplicate");
  }, [g]);
  if (r) return /* @__PURE__ */ e(Zt, { message: r });
  if (!t) return /* @__PURE__ */ e(be, {});
  const y = t.data ?? [];
  return /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Users",
        search: /* @__PURE__ */ e(
          F,
          {
            placeholder: "Search by name...",
            value: d.search,
            onChange: (b) => u("search", b.target.value),
            onKeyDown: M,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ e(Ee, { to: "/admin/users/new", className: k(ft({ size: "lg" })), children: "New User" })
      }
    ),
    /* @__PURE__ */ n("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ e("div", { className: "flex flex-wrap items-center gap-3", children: /* @__PURE__ */ n(ce, { value: d.role, onValueChange: (b) => {
        b && u("role", b);
      }, children: [
        /* @__PURE__ */ e(ue, { className: "w-[160px]", children: /* @__PURE__ */ e(de, { placeholder: "Role" }) }),
        /* @__PURE__ */ n(me, { children: [
          /* @__PURE__ */ e(Z, { value: "all", children: "All Roles" }),
          Za.filter((b) => b.slug !== "super-admin").map((b) => /* @__PURE__ */ e(Z, { value: b.slug, children: b.name }, b.slug))
        ] })
      ] }) }),
      v && /* @__PURE__ */ e(
        Yt,
        {
          selectedCount: C.length,
          isPending: m,
          actions: [
            { label: "Duplicate", onClick: L },
            { label: "Delete", onClick: T, variant: "destructive" }
          ],
          onClear: c
        }
      ),
      /* @__PURE__ */ e(
        Xa,
        {
          items: y,
          selectedIds: C,
          isAllSelected: z,
          onSelectAll: P,
          onSelectOne: O,
          selectAllLabel: "Select all users",
          selectItemLabel: (b) => `Select ${b.name}`,
          emptyMessage: "No users found.",
          sortBy: d.sortBy,
          sortOrder: d.sortOrder,
          onSort: h,
          columns: [
            {
              key: "name",
              label: "Name",
              sortKey: "name",
              cellClassName: "px-4 py-3 font-medium",
              render: (b) => /* @__PURE__ */ e(Ee, { to: `/admin/users/${b.id}/edit`, className: "underline", children: b.name })
            },
            {
              key: "email",
              label: "Email",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (b) => b.email
            },
            {
              key: "role",
              label: "Role",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (b) => /* @__PURE__ */ e($e, { variant: "outline", className: "capitalize", children: b.roleName ?? "No role" })
            },
            {
              key: "updatedAt",
              label: "Updated",
              sortKey: "updatedAt",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (b) => new Date(b.updatedAt * 1e3).toLocaleDateString()
            }
          ]
        }
      ),
      /* @__PURE__ */ e(Qt, { meta: t.meta, getPageUrl: I })
    ] })
  ] });
}
const Nl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminUsersPage: yl
}, Symbol.toStringTag, { value: "Module" }));
function ea({
  children: t,
  className: a
}) {
  return /* @__PURE__ */ e("div", { className: k("grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]", a), children: t });
}
function ta({ children: t, className: a }) {
  return /* @__PURE__ */ e("div", { className: k("min-w-0 space-y-4", a), children: t });
}
function aa({ children: t, className: a }) {
  return /* @__PURE__ */ e("aside", { className: k("min-w-0 space-y-4", a), children: t });
}
function Me({
  title: t,
  description: a,
  children: r,
  className: i,
  contentClassName: s
}) {
  return /* @__PURE__ */ n(Ne, { className: k("overflow-hidden border-border/60 shadow-sm", i), children: [
    /* @__PURE__ */ n(we, { children: [
      /* @__PURE__ */ e(Ce, { className: "text-base", children: t }),
      a ? /* @__PURE__ */ e(Ja, { children: a }) : null
    ] }),
    /* @__PURE__ */ e(ke, { className: k("space-y-5", s), children: r })
  ] });
}
function rr({ user: t, roles: a = [], mode: r, pageTitle: i }) {
  const { session: s } = ze(), [l, o] = St(), [d, u] = p({}), [h, M] = p(null), [I, C] = p(t?.name ?? ""), [c, P] = p(t?.email ?? ""), [O, z] = p(""), [v, m] = p(t?.role ?? "author"), [g, _] = p(t?.twoFactorEnabled === !0), T = a.filter((N) => N.slug !== "super-admin"), L = T.find((N) => N.slug === v)?.name;
  function y() {
    !t || !window.confirm(`Disable two-factor authentication for ${t.name}?`) || o(async () => {
      const N = await _e(`/api/admin/users/${t.id}/2fa/disable`);
      if (!N.success) {
        q.error(N.message);
        return;
      }
      _(!1), q.message("Two-factor authentication disabled.");
    });
  }
  function b(N) {
    N.preventDefault(), u({}), M(null);
    const f = {
      name: I,
      email: c
    };
    O && (f.password = O), f.role = v, o(async () => {
      let x;
      r === "edit" && t ? x = await ot(`/api/admin/users/${t.id}`, f) : x = await _e("/api/admin/users", f), x.success ? (q.success(r === "edit" ? "update" : "create", "user"), Ke("/admin/users")) : x.errors && Object.keys(x.errors).length > 0 ? (u(x.errors), q.error(x.message)) : (M(x.message), q.error(x.message));
    });
  }
  return /* @__PURE__ */ n("form", { onSubmit: b, className: "", children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: i || "Users",
        actions: /* @__PURE__ */ n("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(w, { type: "submit", disabled: l, children: l ? r === "edit" ? "Saving…" : "Creating…" : r === "edit" ? "Save Changes" : "Create User" }),
          /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "outline",
              onClick: () => Ke("/admin/users"),
              disabled: l,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    h && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: h }),
    /* @__PURE__ */ n(ea, { children: [
      /* @__PURE__ */ e(ta, { children: /* @__PURE__ */ e(Me, { title: "User details", children: /* @__PURE__ */ n("div", { className: "grid gap-5", children: [
        /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ n(A, { htmlFor: "name", children: [
            "Name ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            F,
            {
              id: "name",
              value: I,
              onChange: (N) => C(N.target.value),
              placeholder: "Full name",
              required: !0,
              maxLength: 100,
              "aria-invalid": !!d.name,
              "aria-describedby": d.name ? "name-error" : void 0
            }
          ),
          d.name && /* @__PURE__ */ e("p", { id: "name-error", className: "text-xs text-destructive", children: d.name[0] })
        ] }),
        /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ n(A, { htmlFor: "email", children: [
            "Email ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            F,
            {
              id: "email",
              type: "email",
              value: c,
              onChange: (N) => P(N.target.value),
              placeholder: "user@example.com",
              required: !0,
              "aria-invalid": !!d.email,
              "aria-describedby": d.email ? "email-error" : void 0
            }
          ),
          d.email && /* @__PURE__ */ e("p", { id: "email-error", className: "text-xs text-destructive", children: d.email[0] })
        ] }),
        /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ n(A, { htmlFor: "password", children: [
            "Password",
            " ",
            r === "create" && /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            F,
            {
              id: "password",
              type: "password",
              value: O,
              onChange: (N) => z(N.target.value),
              placeholder: r === "edit" ? "Leave blank to keep current" : "Minimum 12 characters",
              required: r === "create",
              minLength: r === "create" ? 12 : void 0,
              maxLength: 128,
              "aria-invalid": !!d.password,
              "aria-describedby": d.password ? "password-error" : void 0
            }
          ),
          d.password && /* @__PURE__ */ e("p", { id: "password-error", className: "text-xs text-destructive", children: d.password[0] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ n(aa, { children: [
        /* @__PURE__ */ e(Me, { title: "Organization", children: /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "role", children: "Role" }),
          T.length > 0 ? /* @__PURE__ */ n(ce, { value: v, onValueChange: (N) => {
            N && N !== "super-admin" && m(N);
          }, children: [
            /* @__PURE__ */ e(ue, { id: "role", children: /* @__PURE__ */ e(de, { placeholder: "Select role", children: L }) }),
            /* @__PURE__ */ e(me, { children: T.map((N) => /* @__PURE__ */ e(Z, { value: N.slug, children: N.name }, N.slug)) })
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No roles available." }),
          d.role && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: d.role[0] })
        ] }) }),
        r === "edit" && t ? /* @__PURE__ */ e(
          Me,
          {
            title: "Two-factor authentication",
            description: "Manage this user's authenticator requirement.",
            children: t.role === "super-admin" ? /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Super Admin 2FA is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET." }) : t.id === s?.user.id ? /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Manage your own 2FA from your Profile page." }) : g ? /* @__PURE__ */ n("div", { className: "space-y-3", children: [
              /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Two-factor authentication is enabled for this user." }),
              /* @__PURE__ */ e(
                w,
                {
                  type: "button",
                  variant: "outline",
                  onClick: y,
                  disabled: l,
                  children: l ? "Disabling…" : "Disable 2FA"
                }
              )
            ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Two-factor authentication is not enabled for this user." })
          }
        ) : null
      ] })
    ] })
  ] });
}
const sr = Za.filter((t) => t.slug !== "super-admin");
function wl() {
  return /* @__PURE__ */ e(rr, { mode: "create", roles: sr, pageTitle: "Create User" });
}
function Cl({ id: t }) {
  const [a, r] = p(null), [i, s] = p(!0);
  return ae(() => {
    fe(`/api/admin/users/${t}`).then((l) => {
      r(l), s(!1);
    });
  }, [t]), i ? /* @__PURE__ */ e(be, {}) : a ? /* @__PURE__ */ e(Pe, { children: /* @__PURE__ */ e(
    rr,
    {
      mode: "edit",
      user: a,
      roles: sr,
      pageTitle: "Edit User"
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "User not found." });
}
const ir = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminUserCreatePage: wl,
  AdminUserEditPage: Cl
}, Symbol.toStringTag, { value: "Module" }));
function lr({
  onUploadComplete: t,
  onUploadError: a,
  accept: r,
  className: i,
  compact: s = !1
}) {
  const [l, o] = p(!1), [d, u] = p([]), h = qe(null), M = Y((v) => {
    v.preventDefault(), v.stopPropagation(), o(!0);
  }, []), I = Y((v) => {
    v.preventDefault(), v.stopPropagation(), o(!1);
  }, []), C = Y(
    async (v) => {
      const m = Math.random().toString(36).slice(2);
      u((g) => [...g, { id: m, file: v, progress: 0 }]);
      try {
        const g = new FormData();
        g.append("file", v);
        const T = await (await fetch("/api/admin/media/upload", {
          method: "POST",
          body: g
        })).json();
        if (!T.success) {
          const L = T.message || "Upload failed";
          return u(
            (y) => y.map(
              (b) => b.id === m ? { ...b, error: L } : b
            )
          ), a?.(L), q.error(L), null;
        }
        return u((L) => L.filter((y) => y.id !== m)), t?.(T.data), q.uploaded(v.name), T.data;
      } catch {
        const g = "Upload failed. Please try again.";
        return u(
          (_) => _.map(
            (T) => T.id === m ? { ...T, error: g } : T
          )
        ), a?.(g), q.error(g), null;
      }
    },
    [t, a]
  ), c = Y(
    async (v) => {
      v.preventDefault(), v.stopPropagation(), o(!1);
      const m = Array.from(v.dataTransfer.files);
      if (m.length !== 0)
        for (const g of m)
          r && !kl(g.type, r) || await C(g);
    },
    [r, C]
  ), P = Y(
    async (v) => {
      const m = Array.from(v.target.files || []);
      if (m.length !== 0) {
        for (const g of m)
          await C(g);
        h.current && (h.current.value = "");
      }
    },
    [C]
  ), O = Y(() => {
    h.current?.click();
  }, []), z = Y((v) => {
    u((m) => m.filter((g) => g.id !== v));
  }, []);
  return /* @__PURE__ */ n("div", { className: k("space-y-2", i), children: [
    /* @__PURE__ */ n(
      w,
      {
        type: "button",
        variant: "outline",
        onDragOver: M,
        onDragLeave: I,
        onDrop: c,
        onClick: O,
        "aria-label": "Upload media files",
        className: k(
          "relative h-auto w-full cursor-pointer rounded-sm border-2 border-dashed transition-colors whitespace-normal",
          "hover:border-primary/50 hover:bg-muted/50",
          l && "border-primary bg-primary/5",
          s ? "p-4" : "p-8",
          "flex flex-col items-center justify-center gap-2 text-center"
        ),
        children: [
          /* @__PURE__ */ e(
            Wr,
            {
              className: k(
                "text-muted-foreground",
                s ? "h-5 w-5" : "h-8 w-8"
              )
            }
          ),
          !s && /* @__PURE__ */ n(Pe, { children: [
            /* @__PURE__ */ e("p", { className: "text-sm font-medium", children: "Drag & drop files here, or click to browse" }),
            /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Max 10MB per file. Supported: images, PDF, video, audio." })
          ] }),
          s && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Drop files or click to upload" })
        ]
      }
    ),
    /* @__PURE__ */ e(
      F,
      {
        ref: h,
        type: "file",
        multiple: !0,
        accept: r,
        onChange: P,
        className: "hidden",
        "aria-hidden": "true"
      }
    ),
    d.length > 0 && /* @__PURE__ */ e("div", { className: "space-y-1", children: d.map((v) => /* @__PURE__ */ n(
      "div",
      {
        className: k(
          "flex items-center gap-2 rounded-sm border px-3 py-2 text-sm",
          v.error ? "border-destructive/50 bg-destructive/10" : "border-border"
        ),
        children: [
          v.error ? /* @__PURE__ */ e(gt, { className: "h-4 w-4 text-destructive" }) : /* @__PURE__ */ e(Bn, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
          /* @__PURE__ */ n("span", { className: "flex-1 truncate", children: [
            v.file.name,
            v.error && /* @__PURE__ */ e("span", { className: "ml-2 text-destructive", children: v.error })
          ] }),
          v.error && /* @__PURE__ */ e(
            w,
            {
              variant: "ghost",
              size: "icon-sm",
              onClick: (m) => {
                m.stopPropagation(), z(v.id);
              },
              children: /* @__PURE__ */ e(ja, { className: "h-3 w-3" })
            }
          )
        ]
      },
      v.id
    )) })
  ] });
}
function kl(t, a) {
  return a ? a.split(",").map((i) => i.trim()).some((i) => {
    if (i.endsWith("/*")) {
      const s = i.replace("/*", "/");
      return t.startsWith(s);
    }
    return t === i;
  }) : !0;
}
function or({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "skeleton",
      className: k("animate-pulse rounded-sm bg-muted", t),
      ...a
    }
  );
}
function Sl() {
  const t = pt(), a = Je(), [r, i] = p(null), [s, l] = p(!1), [o, d] = p(/* @__PURE__ */ new Set()), u = Number(new URLSearchParams(t.search).get("page") ?? "1"), h = Number.isFinite(u) && u > 0 ? u : 1, { filters: M, setFilter: I, buildPageUrl: C } = Tt({
    locationSearch: t.search,
    navigate: a,
    path: "/admin/media",
    defaults: { search: "" }
  }), {
    selectedIds: c,
    clearSelection: P,
    handleSelectAll: O,
    handleSelectOne: z,
    isAllSelected: v,
    isSomeSelected: m
  } = Xt(r?.data ?? null);
  function g(f) {
    const $ = zt(M, {
      page: f ?? h,
      perPage: 10
    });
    fe(`/api/admin/media?${$.toString()}`).then((j) => {
      i(j), P();
    });
  }
  const { isPending: _, performBulkAction: T } = Jt({
    selectedIds: c,
    entity: "selected media",
    successAction: "delete",
    onSuccess: g
  });
  ae(() => {
    g();
  }, [t.search, h]);
  function L(f, x) {
    confirm(`Delete "${x}"?`) && Wa(`/api/admin/media/${f}`).then(($) => {
      $.success ? (q.success("delete", "media"), g()) : q.error($.message);
    });
  }
  function y() {
    c.length !== 0 && confirm(`Delete ${c.length} item(s)? This cannot be undone.`) && T("/api/admin/media/bulk/delete");
  }
  function b(f) {
    navigator.clipboard.writeText(f).then(() => q.copied("url"));
  }
  function N(f) {
    return f < 1024 ? `${f} B` : f < 1024 * 1024 ? `${(f / 1024).toFixed(1)} KB` : `${(f / (1024 * 1024)).toFixed(1)} MB`;
  }
  return /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Media",
        search: /* @__PURE__ */ n("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ e(Un, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ e(
            F,
            {
              value: M.search,
              onChange: (f) => I("search", f.target.value),
              placeholder: "Search media…",
              className: "pl-8"
            }
          )
        ] }),
        actions: /* @__PURE__ */ e(w, { type: "button", size: "lg", onClick: () => l((f) => !f), children: s ? "Hide Upload" : "Upload" })
      }
    ),
    /* @__PURE__ */ n("div", { className: "p-4 space-y-4", children: [
      s && /* @__PURE__ */ e(lr, { onUploadComplete: () => {
        l(!1), g();
      } }),
      m && /* @__PURE__ */ e(
        Yt,
        {
          selectedCount: c.length,
          isPending: _,
          actions: [{ label: "Delete", onClick: y, variant: "destructive" }],
          onClear: P
        }
      ),
      r ? r.data.length === 0 ? /* @__PURE__ */ n("div", { className: "flex flex-col items-center justify-center py-16", children: [
        /* @__PURE__ */ e(kt, { className: "h-12 w-12 text-muted-foreground/40" }),
        /* @__PURE__ */ e("p", { className: "mt-3 text-sm text-muted-foreground", children: "No media found." })
      ] }) : /* @__PURE__ */ n(Pe, { children: [
        /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            We,
            {
              checked: v,
              onCheckedChange: (f) => O(f === !0),
              "aria-label": "Select all media"
            }
          ),
          /* @__PURE__ */ e("span", { className: "text-xs text-muted-foreground", children: v ? `${c.length} selected` : "Select all" })
        ] }),
        /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: r.data.map((f) => {
          const x = f.mimeType.startsWith("image/"), $ = o.has(f.id);
          return /* @__PURE__ */ n(
            "div",
            {
              className: "group relative overflow-hidden rounded-sm border bg-muted/30",
              children: [
                /* @__PURE__ */ n("div", { className: "aspect-square", children: [
                  x && !$ ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: he(f.thumbnailUrl || f.url) ?? void 0,
                      alt: f.alt || f.name,
                      className: "h-full w-full object-cover",
                      onError: () => d((j) => new Set(j).add(f.id))
                    }
                  ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(gt, { className: "h-10 w-10 text-muted-foreground/50" }) }),
                  /* @__PURE__ */ e(
                    "div",
                    {
                      className: k(
                        "absolute top-1.5 left-1.5 z-10",
                        !m && "opacity-0 group-hover:opacity-100 transition-opacity"
                      ),
                      onClick: (j) => j.stopPropagation(),
                      children: /* @__PURE__ */ e(
                        We,
                        {
                          checked: c.includes(f.id),
                          onCheckedChange: (j) => z(f.id, j === !0),
                          "aria-label": `Select ${f.name}`
                        }
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ e("div", { className: "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100", children: /* @__PURE__ */ n("div", { className: "flex items-center justify-end gap-1 p-2", children: [
                  /* @__PURE__ */ e(
                    w,
                    {
                      type: "button",
                      size: "icon-sm",
                      variant: "ghost",
                      onClick: () => b(f.url),
                      className: "h-8 w-8 text-white hover:bg-white/20",
                      "aria-label": "Copy URL",
                      children: /* @__PURE__ */ e(Ba, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ e(
                    w,
                    {
                      type: "button",
                      size: "icon-sm",
                      variant: "ghost",
                      onClick: () => L(f.id, f.name),
                      className: "h-8 w-8 text-white hover:bg-destructive/80",
                      "aria-label": "Delete",
                      children: /* @__PURE__ */ e(ye, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }) }),
                /* @__PURE__ */ n("div", { className: "px-2.5 py-2", children: [
                  /* @__PURE__ */ e("p", { className: "truncate text-xs font-medium", children: f.name }),
                  /* @__PURE__ */ n("p", { className: "text-[11px] text-muted-foreground", children: [
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
      ] }) : /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: Array.from({ length: 10 }).map((f, x) => /* @__PURE__ */ e(or, { className: "aspect-square rounded-sm" }, x)) }),
      /* @__PURE__ */ e(Qt, { meta: r?.meta, getPageUrl: C })
    ] })
  ] });
}
const Al = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminMediaPage: Sl
}, Symbol.toStringTag, { value: "Module" }));
function _l() {
  const [t, a] = p(null), [r, i] = p(null), s = pt(), l = Je(), { type: o = "post" } = Ve(), d = `/admin/categories/${o}`, {
    filters: u,
    setFilter: h,
    handleFilter: M,
    handleSort: I,
    handleKeyDown: C
  } = Tt({
    locationSearch: s.search,
    navigate: l,
    path: d,
    defaults: { search: "", status: "all", sortBy: "", sortOrder: "" },
    debounceKeys: ["search", "status"]
  }), {
    selectedIds: c,
    clearSelection: P,
    handleSelectAll: O,
    handleSelectOne: z,
    isAllSelected: v,
    isSomeSelected: m
  } = Xt(t), { isPending: g, performBulkAction: _ } = Jt({
    selectedIds: c,
    entity: "category",
    onSuccess: T
  });
  async function T() {
    i(null);
    const f = zt(u, { type: o }), x = f.toString() ? `?${f.toString()}` : "", $ = await fe(`/api/admin/categories${x}`);
    a($), P();
  }
  ae(() => {
    T().catch((f) => i(f.message));
  }, [s.search, o]);
  const L = Y(async () => {
    c.length !== 0 && confirm(`Delete ${c.length} category(ies)? This action cannot be undone.`) && await _("/api/admin/categories/bulk/delete");
  }, [_, c]), y = Y(async () => {
    await _("/api/admin/categories/bulk/duplicate");
  }, [_]), b = Y(async (f) => {
    await _("/api/admin/categories/bulk/status", { status: f });
  }, [_]);
  if (r) return /* @__PURE__ */ e(Zt, { message: r });
  if (!t) return /* @__PURE__ */ e(be, {});
  const N = t;
  return /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Categories",
        search: /* @__PURE__ */ e(
          F,
          {
            placeholder: "Search by name...",
            value: u.search,
            onChange: (f) => h("search", f.target.value),
            onKeyDown: C,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ e(Ee, { to: `${d}/new`, className: k(ft({ size: "lg" })), children: "New Category" })
      }
    ),
    /* @__PURE__ */ n("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ n("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ e(
          Zn,
          {
            value: u.status,
            onValueChange: (f) => h("status", f),
            showScheduled: !1
          }
        ),
        /* @__PURE__ */ e(w, { type: "button", variant: "secondary", size: "sm", onClick: M, children: "Filter" })
      ] }),
      m && /* @__PURE__ */ e(
        Yt,
        {
          selectedCount: c.length,
          isPending: g,
          actions: [
            { label: "Duplicate", onClick: y },
            { label: "Publish", onClick: () => b("published") },
            { label: "Unpublish", onClick: () => b("draft") },
            { label: "Delete", onClick: L, variant: "destructive" }
          ],
          onClear: P
        }
      ),
      /* @__PURE__ */ e(
        Xa,
        {
          items: N,
          selectedIds: c,
          isAllSelected: v,
          onSelectAll: O,
          onSelectOne: z,
          selectAllLabel: "Select all categories",
          selectItemLabel: (f) => `Select ${f.name}`,
          emptyMessage: "No categories found.",
          sortBy: u.sortBy,
          sortOrder: u.sortOrder,
          onSort: I,
          columns: [
            {
              key: "name",
              label: "Name",
              sortKey: "name",
              cellClassName: "px-4 py-3 font-medium",
              render: (f) => /* @__PURE__ */ e(Ee, { to: `/admin/categories/${f.id}/edit`, className: "underline", children: f.name })
            },
            {
              key: "slug",
              label: "Slug",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (f) => f.slug
            },
            {
              key: "status",
              label: "Status",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (f) => /* @__PURE__ */ e($e, { variant: f.status === "published" ? "secondary" : "outline", children: f.status === "published" ? "Published" : "Unpublished" })
            },
            {
              key: "createdAt",
              label: "Created",
              sortKey: "createdAt",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (f) => new Date(f.createdAt * 1e3).toLocaleDateString()
            }
          ]
        }
      )
    ] })
  ] });
}
const Pl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminCategoriesPage: _l
}, Symbol.toStringTag, { value: "Module" }));
function $t({
  className: t,
  orientation: a = "horizontal",
  ...r
}) {
  return /* @__PURE__ */ e(
    Vt.Root,
    {
      "data-slot": "tabs",
      "data-orientation": a,
      className: k(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        t
      ),
      ...r
    }
  );
}
const zl = _t(
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
function Rt({
  className: t,
  variant: a = "default",
  ...r
}) {
  return /* @__PURE__ */ e(
    Vt.List,
    {
      "data-slot": "tabs-list",
      "data-variant": a,
      className: k(zl({ variant: a }), t),
      ...r
    }
  );
}
function je({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    Vt.Tab,
    {
      "data-slot": "tabs-trigger",
      className: k(
        "relative inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium whitespace-nowrap text-foreground/70 transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:border-foreground/25 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:border-border dark:group-data-[variant=line]/tabs-list:data-active:border-border dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:border-foreground/20 data-active:bg-muted data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        t
      ),
      ...a
    }
  );
}
function Be({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    Vt.Panel,
    {
      "data-slot": "tabs-content",
      className: k("flex-1 text-sm outline-none", t),
      ...a
    }
  );
}
function Re({
  value: t,
  onChange: a,
  onSelect: r,
  accept: i,
  multiple: s = !1,
  maxFiles: l = 10,
  trigger: o
}) {
  const [d, u] = p(!1);
  return /* @__PURE__ */ n(Ze, { open: d, onOpenChange: u, children: [
    /* @__PURE__ */ e(
      Pt,
      {
        render: o || /* @__PURE__ */ n(w, { type: "button", variant: "outline", className: "gap-2", children: [
          /* @__PURE__ */ e(kt, { className: "h-4 w-4" }),
          t ? "Change Media" : "Select Media"
        ] })
      }
    ),
    /* @__PURE__ */ e(
      Tl,
      {
        open: d,
        onSelect: (h) => {
          s && r?.(h), h.length > 0 && a(h[0]), u(!1);
        },
        accept: i,
        multiple: s,
        maxFiles: l
      }
    )
  ] });
}
function Tl({
  open: t,
  onSelect: a,
  accept: r,
  multiple: i = !1,
  maxFiles: s = 10
}) {
  const [l, o] = p([]), [d, u] = p(!1), [h, M] = p(""), I = Qn(h), [C, c] = p(r ?? "all"), [P, O] = p(1), [z, v] = p(1), [m, g] = p([]), [_, T] = p("library"), L = qe(I);
  ae(() => {
    if (!t) return;
    const x = L.current !== I;
    if (L.current = I, x && P !== 1) {
      O(1);
      return;
    }
    y();
  }, [t, I, C, P]), ae(() => {
    t && (g([]), T("library"), O(1));
  }, [t]);
  async function y() {
    u(!0);
    try {
      const x = new URLSearchParams();
      I && x.set("search", I), x.set("page", String(P)), x.set("perPage", "10"), C && C !== "all" && x.set("mimeType", C);
      const $ = await fe(`/api/admin/media?${x.toString()}`);
      o($.data), v($.meta.lastPage ?? 1);
    } catch {
      o([]), v(1);
    }
    u(!1);
  }
  function b(x) {
    g(i ? ($) => $.find((K) => K.id === x.id) ? $.filter((K) => K.id !== x.id) : $.length >= s ? $ : [...$, x] : [x]);
  }
  function N() {
    a(m);
  }
  function f(x) {
    g(i ? ($) => $.length >= s ? $ : [...$, x] : [x]), T("library"), y();
  }
  return /* @__PURE__ */ n(et, { className: "sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ e(tt, { children: /* @__PURE__ */ e(at, { children: "Select Media" }) }),
    /* @__PURE__ */ n($t, { value: _, onValueChange: T, className: "flex-1 overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ n(Rt, { children: [
        /* @__PURE__ */ e(je, { value: "library", children: "Media Library" }),
        /* @__PURE__ */ e(je, { value: "upload", children: "Upload" })
      ] }),
      /* @__PURE__ */ n(Be, { value: "library", className: "flex-1 overflow-hidden flex flex-col mt-3", children: [
        /* @__PURE__ */ n("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ n("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ e(Un, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ e(
              F,
              {
                value: h,
                onChange: (x) => M(x.target.value),
                placeholder: "Search…",
                className: "pl-8 h-8"
              }
            )
          ] }),
          !r && /* @__PURE__ */ n(ce, { value: C, onValueChange: (x) => {
            x && (c(x), O(1));
          }, children: [
            /* @__PURE__ */ e(ue, { className: "w-[120px] h-8", children: /* @__PURE__ */ e(de, { placeholder: "All types" }) }),
            /* @__PURE__ */ n(me, { children: [
              /* @__PURE__ */ e(Z, { value: "all", children: "All types" }),
              /* @__PURE__ */ e(Z, { value: "image/*", children: "Images" }),
              /* @__PURE__ */ e(Z, { value: "video/mp4", children: "Video" }),
              /* @__PURE__ */ e(Z, { value: "application/pdf", children: "PDF" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex-1 overflow-y-auto", children: d ? /* @__PURE__ */ e("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ e("div", { className: "grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: Array.from({ length: 6 }).map((x, $) => /* @__PURE__ */ e(or, { className: "aspect-square w-full rounded-sm" }, $)) }) }) : l.length === 0 ? /* @__PURE__ */ n("div", { className: "flex flex-col items-center justify-center py-12", children: [
          /* @__PURE__ */ e(gt, { className: "h-10 w-10 text-muted-foreground/50" }),
          /* @__PURE__ */ e("p", { className: "mt-2 text-sm text-muted-foreground", children: "No media found." })
        ] }) : /* @__PURE__ */ e("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: l.map((x) => {
          const $ = m.some((j) => j.id === x.id);
          return /* @__PURE__ */ e(
            Il,
            {
              item: x,
              isSelected: $,
              onClick: () => b(x)
            },
            x.id
          );
        }) }) }),
        z > 1 && /* @__PURE__ */ n("div", { className: "flex items-center justify-center gap-2 pt-2 border-t mt-2", children: [
          /* @__PURE__ */ e(
            w,
            {
              variant: "outline",
              size: "sm",
              disabled: P <= 1,
              onClick: () => O((x) => Math.max(1, x - 1)),
              children: "Previous"
            }
          ),
          /* @__PURE__ */ n("span", { className: "text-xs text-muted-foreground", children: [
            "Page ",
            P,
            " of ",
            z
          ] }),
          /* @__PURE__ */ e(
            w,
            {
              variant: "outline",
              size: "sm",
              disabled: P >= z,
              onClick: () => O((x) => x + 1),
              children: "Next"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e(Be, { value: "upload", className: "mt-3", children: /* @__PURE__ */ e(
        lr,
        {
          onUploadComplete: f,
          accept: r
        }
      ) })
    ] }),
    m.length > 0 && /* @__PURE__ */ n("div", { className: "border-t pt-3 mt-2", children: [
      !i && m.length === 1 && /* @__PURE__ */ e(Dl, { item: m[0] }),
      i && /* @__PURE__ */ n("div", { className: "flex items-center gap-2 flex-wrap", children: [
        m.map((x) => /* @__PURE__ */ n(
          "div",
          {
            className: "relative h-10 w-10 rounded-sm border overflow-hidden",
            children: [
              x.mimeType.startsWith("image/") ? /* @__PURE__ */ e(
                "img",
                {
                  src: he(x.thumbnailUrl || x.url) ?? void 0,
                  alt: x.alt || x.name,
                  className: "object-cover h-full w-full"
                }
              ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(gt, { className: "h-4 w-4 text-muted-foreground" }) }),
              /* @__PURE__ */ e(
                w,
                {
                  type: "button",
                  variant: "destructive",
                  size: "icon-xs",
                  onClick: () => g(
                    ($) => $.filter((j) => j.id !== x.id)
                  ),
                  className: "absolute -top-1 -right-1 rounded-sm p-0.5",
                  children: /* @__PURE__ */ e(ja, { className: "h-2.5 w-2.5" })
                }
              )
            ]
          },
          x.id
        )),
        /* @__PURE__ */ n("span", { className: "text-xs text-muted-foreground", children: [
          m.length,
          " selected",
          s && ` (max ${s})`
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e(bt, { children: /* @__PURE__ */ e(
      w,
      {
        onClick: N,
        disabled: m.length === 0,
        children: i ? `Insert Selected (${m.length})` : "Insert"
      }
    ) })
  ] });
}
function Il({
  item: t,
  isSelected: a,
  onClick: r
}) {
  const [i, s] = p(!1), l = t.mimeType.startsWith("image/");
  return /* @__PURE__ */ n(
    w,
    {
      type: "button",
      variant: "outline",
      onClick: r,
      className: k(
        "relative h-auto aspect-square w-full overflow-hidden rounded-sm p-0 transition-all",
        "hover:ring-2 hover:ring-primary/50",
        a && "ring-2 ring-primary"
      ),
      "aria-label": t.name,
      "aria-selected": a,
      children: [
        l && !i ? /* @__PURE__ */ e(
          "img",
          {
            src: he(t.thumbnailUrl || t.url) ?? void 0,
            alt: t.alt || t.name,
            className: "object-cover h-full w-full",
            onError: () => s(!0)
          }
        ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(gt, { className: "h-6 w-6 text-muted-foreground/60" }) }),
        a && /* @__PURE__ */ e("div", { className: "absolute inset-0 flex items-center justify-center bg-primary/20", children: /* @__PURE__ */ e("div", { className: "rounded-sm bg-primary p-1", children: /* @__PURE__ */ e(Fa, { className: "h-3 w-3 text-primary-foreground" }) }) }),
        /* @__PURE__ */ e("div", { className: "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1", children: /* @__PURE__ */ e("p", { className: "truncate text-[9px] text-white", children: t.name }) })
      ]
    }
  );
}
function Dl({ item: t }) {
  return /* @__PURE__ */ n("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ e("div", { className: "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted", children: t.mimeType.startsWith("image/") ? /* @__PURE__ */ e(
      "img",
      {
        src: he(t.thumbnailUrl || t.url) ?? void 0,
        alt: t.alt || t.name,
        className: "object-cover h-full w-full"
      }
    ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e(gt, { className: "h-6 w-6 text-muted-foreground/60" }) }) }),
    /* @__PURE__ */ n("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ e("p", { className: "truncate text-sm font-medium", children: t.name }),
      /* @__PURE__ */ n("p", { className: "text-xs text-muted-foreground", children: [
        t.mimeType,
        " · ",
        El(t.size),
        t.width && t.height && ` · ${t.width}×${t.height}`
      ] })
    ] })
  ] });
}
function El(t) {
  return t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${(t / 1024).toFixed(1)} KB` : `${(t / (1024 * 1024)).toFixed(1)} MB`;
}
function Ll({
  item: t,
  maxDepth: a,
  onToggleCollapse: r,
  onEdit: i,
  onDelete: s,
  onKeyAction: l
}) {
  const { session: o } = ze(), [d, u] = p(!1), [h, M] = p(t.title), [I, C] = p(t.url), [c, P] = p(t.cssClass ?? ""), [O, z] = p(t.target ?? ""), [v, m] = p(t.image ?? ""), [g, _] = p(t.status), T = o?.permissions.includes("menus.publish") ?? !1, L = o?.permissions.includes("menus.unpublish") ?? !1, y = g === "published" ? L : T, {
    attributes: b,
    listeners: N,
    setNodeRef: f,
    setActivatorNodeRef: x,
    transform: $,
    transition: j,
    isDragging: K
  } = Ft({ id: t.id }), ne = {
    transform: Bt.Transform.toString($),
    transition: j,
    marginLeft: `${t.depth * 30}px`
  }, X = Y(() => {
    i(t.id, {
      title: h,
      url: I,
      cssClass: c,
      target: O,
      image: v,
      status: g
    }), u(!1);
  }, [t.id, h, I, c, O, v, g, i]), ve = Y(() => {
    M(t.title), C(t.url), P(t.cssClass ?? ""), z(t.target ?? ""), m(t.image ?? ""), _(t.status), u(!1);
  }, [t]), S = Y(() => {
    M(t.title), C(t.url), P(t.cssClass ?? ""), z(t.target ?? ""), m(t.image ?? ""), _(t.status), u(!0);
  }, [t]), D = Y(
    (R) => {
      if (!d)
        switch (R.key) {
          case "ArrowUp":
            R.preventDefault(), l(t.id, "moveUp");
            break;
          case "ArrowDown":
            R.preventDefault(), l(t.id, "moveDown");
            break;
          case "Tab":
            R.preventDefault(), R.shiftKey ? l(t.id, "outdent") : l(t.id, "indent");
            break;
          case "Enter":
            R.preventDefault(), S();
            break;
          case "Delete":
            R.preventDefault(), confirm("Delete this menu item?") && s(t.id);
            break;
        }
    },
    [d, t.id, l, S, s]
  ), V = t.depth >= a - 1;
  return /* @__PURE__ */ n(
    "div",
    {
      ref: f,
      style: ne,
      ...b,
      className: k(
        "rounded-sm border bg-background transition-shadow",
        K && "opacity-50 shadow-lg",
        V && "border-amber-300/50"
      ),
      role: "listitem",
      tabIndex: 0,
      onKeyDown: D,
      "aria-label": `Menu item: ${t.title}`,
      children: [
        /* @__PURE__ */ n("div", { className: "flex items-center gap-2 p-3", children: [
          /* @__PURE__ */ e(
            w,
            {
              type: "button",
              ref: x,
              variant: "ghost",
              size: "icon-sm",
              className: "cursor-grab touch-none text-muted-foreground hover:text-foreground",
              "aria-label": "Drag to reorder",
              ...N,
              children: /* @__PURE__ */ e(Ot, { className: "h-4 w-4" })
            }
          ),
          t.children.length > 0 ? /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "ghost",
              size: "icon-sm",
              onClick: () => r(t.id),
              className: "text-muted-foreground hover:text-foreground",
              "aria-label": t.collapsed ? "Expand children" : "Collapse children",
              children: t.collapsed ? /* @__PURE__ */ e(jn, { className: "h-4 w-4" }) : /* @__PURE__ */ e(At, { className: "h-4 w-4" })
            }
          ) : /* @__PURE__ */ e("span", { className: "w-4" }),
          /* @__PURE__ */ n("div", { className: "flex-1 min-w-0", children: [
            he(t.image) ? /* @__PURE__ */ e("img", { src: he(t.image) ?? void 0, alt: "", className: "mr-2 inline-block size-8 rounded-sm object-cover" }) : null,
            /* @__PURE__ */ e("span", { className: "font-medium text-sm", children: t.title }),
            /* @__PURE__ */ e("span", { className: "ml-2 text-xs text-muted-foreground truncate", children: t.url.length > 40 ? t.url.slice(0, 40) + "…" : t.url }),
            /* @__PURE__ */ e($e, { variant: t.status === "published" ? "secondary" : "outline", className: "ml-2", children: t.status === "published" ? "Published" : "Unpublished" })
          ] }),
          V && /* @__PURE__ */ e("span", { className: "text-xs text-amber-600", title: "Maximum depth reached", children: "Max depth" }),
          /* @__PURE__ */ n("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ e(
              w,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: S,
                "aria-label": "Edit menu item",
                children: /* @__PURE__ */ e(Hn, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ e(
              w,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 text-destructive hover:text-destructive",
                onClick: () => {
                  confirm("Delete this menu item?") && s(t.id);
                },
                "aria-label": "Delete menu item",
                children: /* @__PURE__ */ e(ye, { className: "h-3.5 w-3.5" })
              }
            )
          ] })
        ] }),
        d && /* @__PURE__ */ n("div", { className: "border-t p-3 space-y-3", children: [
          /* @__PURE__ */ n("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ n("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(A, { htmlFor: `edit-title-${t.id}`, children: "Title" }),
              /* @__PURE__ */ e(
                F,
                {
                  id: `edit-title-${t.id}`,
                  value: h,
                  onChange: (R) => M(R.target.value),
                  placeholder: "Title"
                }
              )
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(A, { children: "Image" }),
              /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
                v ? /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: he(v) ?? void 0, alt: "", className: "h-full w-full object-cover" }) }) : null,
                /* @__PURE__ */ e(Re, { value: v || null, onChange: (R) => m(R?.url ?? ""), accept: "image/*" }),
                v ? /* @__PURE__ */ e(
                  w,
                  {
                    type: "button",
                    variant: "outline",
                    "aria-label": "Remove image",
                    className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive",
                    onClick: () => m(""),
                    children: "Remove"
                  }
                ) : null
              ] })
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(A, { htmlFor: `edit-url-${t.id}`, children: "URL" }),
              /* @__PURE__ */ e(
                F,
                {
                  id: `edit-url-${t.id}`,
                  value: I,
                  onChange: (R) => C(R.target.value),
                  placeholder: "/url"
                }
              )
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(A, { htmlFor: `edit-css-${t.id}`, children: "CSS Class" }),
              /* @__PURE__ */ e(
                F,
                {
                  id: `edit-css-${t.id}`,
                  value: c,
                  onChange: (R) => P(R.target.value),
                  placeholder: "Optional CSS class"
                }
              )
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(A, { htmlFor: `edit-target-${t.id}`, children: "Target" }),
              /* @__PURE__ */ e(
                F,
                {
                  id: `edit-target-${t.id}`,
                  value: O,
                  onChange: (R) => z(R.target.value),
                  placeholder: "_blank, _self, etc."
                }
              )
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(A, { htmlFor: `edit-status-${t.id}`, children: "Status" }),
              /* @__PURE__ */ n(
                ce,
                {
                  value: g,
                  disabled: !y,
                  onValueChange: (R) => _(R),
                  children: [
                    /* @__PURE__ */ e(ue, { id: `edit-status-${t.id}`, className: "w-full", children: /* @__PURE__ */ e(de, {}) }),
                    /* @__PURE__ */ n(me, { children: [
                      /* @__PURE__ */ e(Z, { value: "published", disabled: !T && g !== "published", children: "Published" }),
                      /* @__PURE__ */ e(Z, { value: "draft", disabled: !L && g !== "draft", children: "Unpublished" })
                    ] })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ n("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ n(w, { size: "sm", onClick: X, children: [
              /* @__PURE__ */ e(Fa, { className: "h-3.5 w-3.5 mr-1" }),
              "Apply"
            ] }),
            /* @__PURE__ */ n(w, { size: "sm", variant: "ghost", onClick: ve, children: [
              /* @__PURE__ */ e(ja, { className: "h-3.5 w-3.5 mr-1" }),
              "Cancel"
            ] })
          ] })
        ] })
      ]
    }
  );
}
function en(t, a = null, r = 0, i = /* @__PURE__ */ new Set()) {
  const s = [];
  for (const l of t) {
    const o = l.children.map((d) => d.id);
    s.push({
      id: l.id,
      parentId: l.parentId ?? a,
      depth: r,
      title: l.title,
      url: l.url,
      cssClass: l.cssClass,
      target: l.target,
      image: l.image,
      status: l.status,
      collapsed: i.has(l.id),
      children: o
    }), !i.has(l.id) && l.children.length > 0 && s.push(...en(l.children, l.id, r + 1, i));
  }
  return s;
}
function Ml(t) {
  const a = /* @__PURE__ */ new Map(), r = [];
  for (const s of t)
    a.set(s.id, {
      id: s.id,
      parentId: s.parentId,
      position: 0,
      children: []
    });
  for (const s of t) {
    const l = a.get(s.id);
    s.parentId && a.has(s.parentId) ? a.get(s.parentId).children.push(l) : (l.parentId = null, r.push(l));
  }
  function i(s) {
    s.forEach((l, o) => {
      l.position = o, i(l.children);
    });
  }
  return i(r), r;
}
const wt = 3, dt = 30, $l = Nr(function({ type: a, initialTree: r, onStatusChange: i }, s) {
  const [l, o] = p(/* @__PURE__ */ new Set()), [d, u] = p(
    () => en(r, null, 0, /* @__PURE__ */ new Set())
  ), [h, M] = p(null), [I, C] = p(!1), [c, P] = p(!1), [O, z] = p(!1), [v, m] = p(""), [g, _] = p(""), T = qe(0), L = qe(null), y = wr(() => d.map((D) => D.id), [d]), b = Ha(
    Mt(Va, {
      activationConstraint: { distance: 8 }
    }),
    Mt(ns, {
      coordinateGetter: ss
    })
  ), N = Y(
    (D) => {
      o((V) => {
        const R = new Set(V);
        return R.has(D) ? R.delete(D) : R.add(D), R;
      }), u((V) => {
        const R = V, G = new Set(l);
        return G.has(D) ? G.delete(D) : G.add(D), o(G), Ol(R, G);
      });
    },
    [l]
  ), f = Y((D) => {
    M(String(D.active.id));
    const V = D.activatorEvent;
    T.current = V?.clientX ?? 0;
  }, []), x = Y(
    (D) => {
      const V = D.delta;
      if (V && h) {
        const R = V.x, G = d.find((J) => J.id === h);
        if (!G) return;
        let re = G.depth;
        R > dt ? re = Math.min(G.depth + 1, wt - 1) : R < -dt && (re = Math.max(G.depth - 1, 0)), L.current = re;
      }
    },
    [h, d]
  ), $ = Y(
    (D) => {
      const { active: V, over: R, delta: G } = D;
      if (!R || V.id === R.id) {
        if (G && h) {
          const ee = G.x, H = d.findIndex((oe) => oe.id === h);
          if (H === -1) {
            M(null), L.current = null;
            return;
          }
          const pe = d[H];
          if (ee > dt && H > 0) {
            const oe = va(d, H);
            oe && pe.depth < wt - 1 && (u((le) => {
              const xe = [...le];
              return xe[H] = {
                ...xe[H],
                parentId: oe.id,
                depth: pe.depth + 1
              }, lt(xe, H), xe;
            }), C(!0));
          } else ee < -dt && pe.depth > 0 && (u((oe) => {
            const le = [...oe], xe = le[H].parentId, vt = oe.find((xt) => xt.id === xe);
            return le[H] = {
              ...le[H],
              parentId: vt?.parentId ?? null,
              depth: Math.max(0, pe.depth - 1)
            }, lt(le, H), le;
          }), C(!0));
        }
        M(null), L.current = null;
        return;
      }
      const re = d.findIndex((ee) => ee.id === String(V.id)), J = d.findIndex((ee) => ee.id === String(R.id));
      re !== -1 && J !== -1 && (u((ee) => {
        const H = mt(ee, re, J), pe = G?.x ?? 0, oe = H[J];
        if (pe > dt && J > 0) {
          const le = va(H, J);
          le && oe.depth < wt - 1 && (H[J] = {
            ...H[J],
            parentId: le.id,
            depth: oe.depth + 1
          }, lt(H, J));
        } else if (pe < -dt && oe.depth > 0) {
          const le = H.find((xe) => xe.id === oe.parentId);
          H[J] = {
            ...H[J],
            parentId: le?.parentId ?? null,
            depth: Math.max(0, oe.depth - 1)
          }, lt(H, J);
        } else {
          const le = ee[J];
          le && (H[J] = {
            ...H[J],
            parentId: le.parentId,
            depth: le.depth
          });
        }
        return H;
      }), C(!0)), M(null), L.current = null;
    },
    [h, d]
  ), j = Y(
    async (D, V) => {
      u(
        (R) => R.map(
          (G) => G.id === D ? { ...G, title: V.title, url: V.url, cssClass: V.cssClass || null, target: V.target || null, image: V.image || null, status: V.status } : G
        )
      ), C(!0);
    },
    []
  ), K = Y(
    async (D) => {
      const V = await Wa(`/api/admin/menus/${D}`);
      V.success ? (u((R) => {
        const G = R.find((ee) => ee.id === D);
        if (!G) return R;
        const re = /* @__PURE__ */ new Set(), J = [D];
        for (; J.length > 0; ) {
          const ee = J.pop();
          for (const H of R)
            H.parentId === ee && (re.add(H.id), J.push(H.id));
        }
        return R.filter((ee) => ee.id !== D).map(
          (ee) => re.has(ee.id) ? {
            ...ee,
            parentId: ee.parentId === D ? G.parentId : ee.parentId,
            depth: Math.max(0, ee.depth - 1)
          } : ee
        );
      }), C(!0), q.success("delete", "menu item")) : q.error(V.message);
    },
    []
  ), ne = Y(async () => {
    if (!v.trim() || !g.trim()) return;
    z(!0);
    const D = await _e("/api/admin/menus", {
      title: v.trim(),
      url: g.trim(),
      type: a,
      position: d.filter((V) => V.parentId === null).length
    });
    if (D.success) {
      const V = {
        id: D.data.id,
        parentId: null,
        depth: 0,
        title: D.data.title,
        url: D.data.url,
        cssClass: D.data.cssClass ?? null,
        target: D.data.target ?? null,
        image: null,
        status: "published",
        collapsed: !1,
        children: []
      };
      u((R) => [...R, V]), m(""), _(""), q.success("create", "menu item");
    } else
      q.error(D.message);
    z(!1);
  }, [v, g, a, d]), X = Y(async () => {
    P(!0);
    const D = d, V = Ml(D), R = await _e("/api/admin/menus/reorder", {
      type: a,
      tree: V
    });
    if (R.success) {
      for (const G of D)
        await ot(`/api/admin/menus/${G.id}`, {
          title: G.title,
          url: G.url,
          cssClass: G.cssClass ?? "",
          target: G.target ?? "",
          image: G.image ?? "",
          status: G.status,
          parentId: G.parentId,
          type: a
        });
      C(!1), q.saved("menu");
    } else
      q.error(R.message);
    P(!1);
  }, [d, l, a]), ve = Y(
    (D, V) => {
      const R = d.findIndex((G) => G.id === D);
      R !== -1 && (u((G) => {
        const re = [...G], J = re[R];
        switch (V) {
          case "moveUp":
            if (R > 0)
              return mt(re, R, R - 1);
            break;
          case "moveDown":
            if (R < re.length - 1)
              return mt(re, R, R + 1);
            break;
          case "indent": {
            const ee = va(re, R);
            ee && J.depth < wt - 1 && (re[R] = {
              ...J,
              parentId: ee.id,
              depth: J.depth + 1
            }, lt(re, R));
            break;
          }
          case "outdent": {
            if (J.depth > 0) {
              const ee = re.find((H) => H.id === J.parentId);
              re[R] = {
                ...J,
                parentId: ee?.parentId ?? null,
                depth: J.depth - 1
              }, lt(re, R);
            }
            break;
          }
        }
        return re;
      }), C(!0));
    },
    [d]
  ), S = h ? d.find((D) => D.id === h) : null;
  return ae(() => i?.({ hasChanges: I, saving: c }), [I, c, i]), Cr(s, () => ({ save: X }), [X]), /* @__PURE__ */ n("div", { className: "space-y-4", children: [
    I && /* @__PURE__ */ n("div", { className: "flex items-center gap-3 px-4 mt-3", children: [
      /* @__PURE__ */ e($e, { variant: "secondary", className: "animate-pulse", children: "Unsaved changes" }),
      /* @__PURE__ */ e(w, { onClick: X, disabled: c, children: c ? "Saving..." : "Save Menu" })
    ] }),
    /* @__PURE__ */ n(ea, { children: [
      /* @__PURE__ */ e(ta, { children: /* @__PURE__ */ e(Me, { title: "Menu items", description: "Drag items to reorder. Drag right to nest, or left to outdent.", children: d.length === 0 ? /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed p-8 text-center", children: /* @__PURE__ */ e("p", { className: "text-muted-foreground", children: "No menu items yet. Add your first item from the panel." }) }) : /* @__PURE__ */ n(
        Ga,
        {
          sensors: b,
          collisionDetection: qa,
          onDragStart: f,
          onDragOver: x,
          onDragEnd: $,
          children: [
            /* @__PURE__ */ e(jt, { items: y, strategy: Ka, children: /* @__PURE__ */ e("div", { className: "space-y-2", role: "list", "aria-label": "Menu items", children: d.map((D) => /* @__PURE__ */ e(
              Ll,
              {
                item: D,
                maxDepth: wt,
                onToggleCollapse: N,
                onEdit: j,
                onDelete: K,
                onKeyAction: ve
              },
              D.id
            )) }) }),
            /* @__PURE__ */ e(rs, { children: S ? /* @__PURE__ */ n("div", { className: "rounded-sm border bg-background p-3 shadow-lg opacity-90", children: [
              /* @__PURE__ */ e("span", { className: "font-medium", children: S.title }),
              /* @__PURE__ */ e("span", { className: "ml-2 text-xs text-muted-foreground truncate", children: S.url })
            ] }) : null })
          ]
        }
      ) }) }),
      /* @__PURE__ */ e(aa, { children: /* @__PURE__ */ n(Me, { title: "Add menu item", description: "New items are added to the top level.", children: [
        /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "new-title", children: "Title" }),
          /* @__PURE__ */ e(
            F,
            {
              id: "new-title",
              placeholder: "Menu item title",
              value: v,
              onChange: (D) => m(D.target.value),
              onKeyDown: (D) => {
                D.key === "Enter" && ne();
              }
            }
          )
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "new-url", children: "URL" }),
          /* @__PURE__ */ e(
            F,
            {
              id: "new-url",
              placeholder: "/page-url",
              value: g,
              onChange: (D) => _(D.target.value),
              onKeyDown: (D) => {
                D.key === "Enter" && ne();
              }
            }
          )
        ] }),
        /* @__PURE__ */ e(w, { className: "w-full", onClick: ne, disabled: O || !v.trim() || !g.trim(), children: O ? "Adding..." : "Add" })
      ] }) })
    ] })
  ] });
});
function va(t, a) {
  if (a <= 0) return null;
  const r = t[a];
  for (let i = a - 1; i >= 0; i--)
    if (t[i].depth <= r.depth)
      return t[i];
  return null;
}
function lt(t, a) {
  const r = t[a], i = r.id, s = r.depth;
  for (let l = a + 1; l < t.length; l++)
    if (t[l].parentId === i)
      t[l] = { ...t[l], depth: s + 1 }, lt(t, l);
    else if (t[l].depth <= s)
      break;
}
function Rl(t) {
  const a = /* @__PURE__ */ new Map(), r = [];
  for (const i of t)
    a.set(i.id, {
      id: i.id,
      title: i.title,
      url: i.url,
      position: 0,
      cssClass: i.cssClass,
      target: i.target,
      image: i.image,
      status: i.status,
      parentId: i.parentId,
      children: []
    });
  for (const i of t) {
    const s = a.get(i.id);
    i.parentId && a.has(i.parentId) ? a.get(i.parentId).children.push(s) : r.push(s);
  }
  return r;
}
function Ol(t, a) {
  const r = Rl(t);
  return en(r, null, 0, a);
}
const Fl = [
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
function jl(t) {
  return Array.isArray(t);
}
function Bl() {
  const t = globalThis.__CMS_MENU_GROUP_REGISTRY__;
  return jl(t) ? t : Fl;
}
function Ul(t) {
  const a = /* @__PURE__ */ new Map(), r = [];
  for (const s of t)
    a.set(s.id, {
      id: s.id,
      title: s.title,
      url: s.url,
      position: s.position,
      cssClass: s.cssClass,
      target: s.target,
      image: s.image,
      status: s.status,
      parentId: s.parentId,
      children: []
    });
  for (const s of t) {
    const l = a.get(s.id);
    l && (s.parentId && a.has(s.parentId) ? a.get(s.parentId)?.children.push(l) : r.push(l));
  }
  const i = (s) => s.sort((l, o) => l.position - o.position).map((l) => ({
    ...l,
    children: i(l.children)
  }));
  return i(r);
}
function Hl() {
  const t = Bl(), [a, r] = p(null), [i, s] = p(null), [l, o] = p("navbar"), d = qe(null), [u, h] = p({ hasChanges: !1, saving: !1 }), M = Y(async () => {
    s(null);
    try {
      const C = await fe("/api/admin/menus");
      r(C);
    } catch (C) {
      s(C.message);
    }
  }, []);
  if (ae(() => {
    M();
  }, [M]), i) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ n("p", { className: "text-destructive", children: [
    "Error: ",
    i
  ] }) });
  const I = a ? Ul(a.filter((C) => C.type === l)) : null;
  return /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Menus",
        actions: /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ n(ce, { value: l, onValueChange: (C) => C && o(C), children: [
            /* @__PURE__ */ e(ue, { className: "w-40", children: /* @__PURE__ */ e(de, {}) }),
            /* @__PURE__ */ e(me, { children: t.map((C) => /* @__PURE__ */ e(Z, { value: C.type, children: C.label }, C.type)) })
          ] }),
          /* @__PURE__ */ e(w, { onClick: () => d.current?.save(), disabled: !u.hasChanges || u.saving, children: u.saving ? "Saving..." : "Save Menu" })
        ] })
      }
    ),
    I ? /* @__PURE__ */ e($l, { ref: d, type: l, initialTree: I, onStatusChange: h }, l) : /* @__PURE__ */ e(be, {})
  ] });
}
const Vl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminMenusPage: Hl
}, Symbol.toStringTag, { value: "Module" }));
function Gl() {
  const t = Je(), { session: a, refreshSession: r, setSession: i } = ze(), [s, l] = St(), [o, d] = p({}), [u, h] = p(null), [M, I] = p(""), [C, c] = p(""), [P, O] = p(""), z = a?.user, v = z?.role === "super-admin";
  function m(y) {
    y.preventDefault(), d({});
    const b = new FormData(y.currentTarget), N = String(b.get("name") ?? "").trim(), f = String(b.get("email") ?? "").trim(), x = String(b.get("password") ?? "");
    l(async () => {
      const $ = { name: N, email: f };
      x && ($.password = x);
      const j = await ot("/api/admin/auth/profile", $);
      if (!j.success) {
        j.errors ? d(j.errors) : d({ _form: [j.message] }), q.error(j.message);
        return;
      }
      await r(), q.success("update", "profile");
    });
  }
  function g() {
    i(null), t("/admin/login", { replace: !0 });
  }
  function _() {
    l(async () => {
      const y = await _e("/api/admin/auth/2fa/setup");
      if (!y.success) {
        q.error(y.message);
        return;
      }
      h(y.data), I("");
    });
  }
  function T() {
    l(async () => {
      const y = await _e("/api/admin/auth/2fa/enable", { code: M });
      if (!y.success) {
        q.error(y.message);
        return;
      }
      q.message("Two-factor authentication enabled."), g();
    });
  }
  function L() {
    l(async () => {
      const y = await _e("/api/admin/auth/2fa/disable", {
        password: C,
        code: P
      });
      if (!y.success) {
        q.error(y.message);
        return;
      }
      q.message("Two-factor authentication disabled."), g();
    });
  }
  return /* @__PURE__ */ n("form", { onSubmit: m, className: "", children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Profile",
        actions: /* @__PURE__ */ n("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ n(w, { type: "submit", disabled: s || v, children: [
            s && /* @__PURE__ */ e(Bn, { className: "mr-2 size-4 animate-spin" }),
            s ? "Saving…" : "Save Changes"
          ] }),
          /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "outline",
              onClick: () => t("/admin"),
              disabled: s,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ n(ea, { children: [
      /* @__PURE__ */ e(ta, { children: /* @__PURE__ */ n(
        Me,
        {
          title: "Account information",
          description: v ? "Super Admin is managed by ADMIN_EMAIL and ADMIN_NAME." : "Update your name and email.",
          children: [
            o._form && /* @__PURE__ */ e("div", { className: "rounded-sm bg-destructive/10 p-3 text-sm text-destructive", children: o._form[0] }),
            /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ n(A, { htmlFor: "profile-name", children: [
                "Name ",
                /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
              ] }),
              /* @__PURE__ */ e(
                F,
                {
                  id: "profile-name",
                  name: "name",
                  defaultValue: z?.name ?? "",
                  placeholder: "Full name",
                  required: !0,
                  maxLength: 100,
                  disabled: v,
                  "aria-invalid": !!o.name
                }
              ),
              o.name && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: o.name[0] })
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ n(A, { htmlFor: "profile-email", children: [
                "Email ",
                /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
              ] }),
              /* @__PURE__ */ e(
                F,
                {
                  id: "profile-email",
                  name: "email",
                  type: "email",
                  defaultValue: z?.email ?? "",
                  placeholder: "user@example.com",
                  required: !0,
                  disabled: v,
                  "aria-invalid": !!o.email
                }
              ),
              o.email && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: o.email[0] })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ n(aa, { children: [
        /* @__PURE__ */ e(
          Me,
          {
            title: "Password",
            description: v ? "Super Admin password is managed by ADMIN_PASSWORD." : "Leave empty to keep your current password.",
            children: /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ e(A, { htmlFor: "profile-password", children: "New Password" }),
              /* @__PURE__ */ e(
                F,
                {
                  id: "profile-password",
                  name: "password",
                  type: "password",
                  placeholder: "Leave blank to keep current",
                  minLength: 12,
                  maxLength: 128,
                  disabled: v,
                  "aria-invalid": !!o.password
                }
              ),
              o.password && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: o.password[0] }),
              /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Minimum 12 characters. Leave empty to keep your current password." })
            ] })
          }
        ),
        /* @__PURE__ */ e(
          Me,
          {
            title: "Two-factor authentication",
            description: v ? "Super Admin 2FA is managed by environment variables." : "Protect admin sign-in with a code from an authenticator app.",
            children: v ? /* @__PURE__ */ n("div", { className: "space-y-3", children: [
              /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: a?.twoFactorEnabled ? "Super Admin 2FA is enabled and is not stored in the users database." : "Configure TOTP outside the admin panel so the Super Admin remains environment-managed." }),
              a?.twoFactorEnabled ? /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "To disable it, set ADMIN_2FA_ENABLED=false and restart the application." }) : /* @__PURE__ */ n(Pe, { children: [
                /* @__PURE__ */ n("p", { className: "text-xs text-muted-foreground", children: [
                  "Run ",
                  /* @__PURE__ */ e("code", { children: "npx @zbeaver/beaver 2fa:setup" }),
                  ", copy the generated values to the application environment, and restart."
                ] }),
                /* @__PURE__ */ n("code", { className: "block rounded-sm bg-muted px-2 py-1 text-xs", children: [
                  "ADMIN_2FA_ENABLED=true",
                  /* @__PURE__ */ e("br", {}),
                  "ADMIN_2FA_SECRET=…"
                ] })
              ] })
            ] }) : a?.twoFactorEnabled ? /* @__PURE__ */ n("div", { className: "space-y-3", children: [
              /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Two-factor authentication is enabled for this account." }),
              /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ e(A, { htmlFor: "disable-2fa-password", children: "Current password" }),
                /* @__PURE__ */ e(
                  F,
                  {
                    id: "disable-2fa-password",
                    type: "password",
                    value: C,
                    onChange: (y) => c(y.target.value),
                    placeholder: "Current password",
                    disabled: s
                  }
                )
              ] }),
              /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ e(A, { htmlFor: "disable-2fa-code", children: "Authenticator code" }),
                /* @__PURE__ */ e(
                  F,
                  {
                    id: "disable-2fa-code",
                    inputMode: "numeric",
                    autoComplete: "one-time-code",
                    pattern: "[0-9]{6}",
                    maxLength: 6,
                    value: P,
                    onChange: (y) => O(y.target.value.replace(/\D/g, "").slice(0, 6)),
                    placeholder: "000000",
                    disabled: s
                  }
                )
              ] }),
              /* @__PURE__ */ e(w, { type: "button", variant: "outline", onClick: L, disabled: s, children: "Disable 2FA" })
            ] }) : u ? /* @__PURE__ */ n("div", { className: "space-y-3", children: [
              /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Scan this QR code with your authenticator app, or enter the secret manually." }),
              /* @__PURE__ */ e("div", { className: "flex justify-center rounded-sm bg-white p-3", children: /* @__PURE__ */ e(
                ls,
                {
                  value: u.otpauthUrl,
                  size: 192,
                  level: "M",
                  includeMargin: !0,
                  "aria-label": "Two-factor authentication setup QR code"
                }
              ) }),
              /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Manual secret" }),
              /* @__PURE__ */ e("code", { className: "block break-all rounded-sm bg-muted px-2 py-1 text-xs", children: u.secret }),
              /* @__PURE__ */ e("a", { className: "text-sm text-primary underline underline-offset-4", href: u.otpauthUrl, children: "Open in authenticator app" }),
              /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ e(A, { htmlFor: "enable-2fa-code", children: "Authenticator code" }),
                /* @__PURE__ */ e(
                  F,
                  {
                    id: "enable-2fa-code",
                    inputMode: "numeric",
                    autoComplete: "one-time-code",
                    pattern: "[0-9]{6}",
                    maxLength: 6,
                    value: M,
                    onChange: (y) => I(y.target.value.replace(/\D/g, "").slice(0, 6)),
                    placeholder: "000000",
                    disabled: s
                  }
                )
              ] }),
              /* @__PURE__ */ n("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ e(w, { type: "button", onClick: T, disabled: s, children: "Enable 2FA" }),
                /* @__PURE__ */ e(w, { type: "button", variant: "outline", onClick: () => h(null), disabled: s, children: "Cancel" })
              ] })
            ] }) : /* @__PURE__ */ e(w, { type: "button", onClick: _, disabled: s, children: "Set up 2FA" })
          }
        )
      ] })
    ] })
  ] });
}
const ql = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminProfilePage: Gl
}, Symbol.toStringTag, { value: "Module" }));
function Ue({ className: t, ...a }) {
  return /* @__PURE__ */ e(
    "textarea",
    {
      "data-slot": "textarea",
      className: k(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        t
      ),
      ...a
    }
  );
}
function tn(t) {
  let a = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return a.length > 200 && (a = a.slice(0, 200).replace(/-+$/, "")), a;
}
function cr({ category: t, mode: a, pageTitle: r, defaultType: i }) {
  const { session: s } = ze(), [l, o] = St(), [d, u] = p({}), [h, M] = p(null), [I, C] = p(t?.name ?? ""), [c, P] = p(t?.slug ?? ""), [O, z] = p(!!t?.slug), [v] = p(t?.type ?? i ?? "post"), [m, g] = p(t?.description ?? ""), [_, T] = p(t?.image ?? ""), [L, y] = p(t?.status ?? "published"), b = s?.permissions.includes(`category.${v}.publish`) ?? !1, N = s?.permissions.includes(`category.${v}.unpublish`) ?? !1, f = L === "published" ? N : b;
  ae(() => {
    a === "create" && !b && y("draft");
  }, [b, a]), ae(() => {
    !O && a === "create" && P(tn(I));
  }, [I, O, a]);
  function x(j) {
    z(!0), P(j);
  }
  function $(j) {
    j.preventDefault(), u({}), M(null);
    const K = {
      name: I,
      type: v,
      status: L
    };
    m.trim() && (K.description = m), _ ? K.image = _ : K.image = null, c && (K.slug = c), o(async () => {
      let ne;
      a === "edit" && t ? ne = await ot(`/api/admin/categories/${t.id}`, K) : ne = await _e("/api/admin/categories", K), ne.success ? (q.success(a === "edit" ? "update" : "create", "category"), Ke(`/admin/categories/${v}`)) : ne.errors && Object.keys(ne.errors).length > 0 ? (u(ne.errors), q.error(ne.message)) : (M(ne.message), q.error(ne.message));
    });
  }
  return /* @__PURE__ */ n("form", { onSubmit: $, className: "", children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: r || "Categories",
        actions: /* @__PURE__ */ n("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(w, { type: "submit", disabled: l, children: l ? a === "edit" ? "Saving…" : "Creating…" : a === "edit" ? "Save Changes" : "Create Category" }),
          /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "outline",
              onClick: () => Ke(`/admin/categories/${v}`),
              disabled: l,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    h && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: h }),
    /* @__PURE__ */ n(ea, { children: [
      /* @__PURE__ */ e(ta, { children: /* @__PURE__ */ n(Me, { title: "Basic information", children: [
        /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ n(A, { htmlFor: "name", children: [
            "Name ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            F,
            {
              id: "name",
              value: I,
              onChange: (j) => C(j.target.value),
              placeholder: "Category name",
              "aria-invalid": !!d.name,
              "aria-describedby": d.name ? "name-error" : void 0
            }
          ),
          d.name && /* @__PURE__ */ e("p", { id: "name-error", className: "text-xs text-destructive", children: d.name[0] })
        ] }),
        /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "slug", children: "Slug" }),
          /* @__PURE__ */ e(
            F,
            {
              id: "slug",
              value: c,
              onChange: (j) => x(j.target.value),
              placeholder: "category-url-slug",
              "aria-invalid": !!d.slug,
              "aria-describedby": d.slug ? "slug-error" : void 0
            }
          ),
          d.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: d.slug[0] }),
          !O && a === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from name. Edit to customize." })
        ] }),
        /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ e(
            Ue,
            {
              id: "description",
              value: m,
              onChange: (j) => g(j.target.value),
              placeholder: "Optional description",
              rows: 4,
              "aria-invalid": !!d.description,
              "aria-describedby": d.description ? "description-error" : void 0
            }
          ),
          d.description && /* @__PURE__ */ e("p", { id: "description-error", className: "text-xs text-destructive", children: d.description[0] })
        ] })
      ] }) }),
      /* @__PURE__ */ n(aa, { children: [
        /* @__PURE__ */ e(Me, { title: "Status", children: /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(A, { htmlFor: "status", children: "Visibility" }),
          /* @__PURE__ */ n(
            ce,
            {
              value: L,
              disabled: !f,
              onValueChange: (j) => y(j),
              children: [
                /* @__PURE__ */ e(ue, { id: "status", className: "w-full", children: /* @__PURE__ */ e(de, {}) }),
                /* @__PURE__ */ n(me, { children: [
                  /* @__PURE__ */ e(Z, { value: "published", disabled: !b && L !== "published", children: "Published" }),
                  /* @__PURE__ */ e(Z, { value: "draft", disabled: !N && L !== "draft", children: "Unpublished" })
                ] })
              ]
            }
          ),
          !f && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Your role cannot change this status." })
        ] }) }),
        /* @__PURE__ */ n(Me, { title: "Image", children: [
          /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ n("div", { className: "flex items-start gap-4", children: [
            _ ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
              "img",
              {
                src: he(_) ?? void 0,
                alt: "Category image preview",
                className: "object-cover h-full w-full"
              }
            ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No image" }),
            /* @__PURE__ */ n("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
              /* @__PURE__ */ e(
                Re,
                {
                  value: _ || null,
                  onChange: (j) => {
                    T(j ? j.url : "");
                  },
                  accept: "image/*"
                },
                _ || "empty"
              ),
              /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose an image from the media library." }),
              _ && /* @__PURE__ */ e(
                w,
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
          d.image && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: d.image[0] })
        ] })
      ] })
    ] })
  ] });
}
function Kl() {
  const { type: t = "post" } = Ve(), [a, r] = p(!0);
  return ae(() => {
    const i = setTimeout(() => r(!1), 0);
    return () => clearTimeout(i);
  }, []), a ? /* @__PURE__ */ e(be, {}) : /* @__PURE__ */ e(Pe, { children: /* @__PURE__ */ e(
    cr,
    {
      mode: "create",
      pageTitle: "Create Category",
      defaultType: t
    }
  ) });
}
function Wl({ id: t }) {
  const { type: a = "post" } = Ve(), [r, i] = p(null), [s, l] = p(!0);
  return ae(() => {
    fe(`/api/admin/categories/${t}`).then((o) => {
      i(o), l(!1);
    });
  }, [t]), s ? /* @__PURE__ */ e(be, {}) : r ? /* @__PURE__ */ e(Pe, { children: /* @__PURE__ */ e(
    cr,
    {
      mode: "edit",
      category: r,
      pageTitle: "Edit Category",
      defaultType: a
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Category not found." });
}
const dr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminCategoryCreatePage: Kl,
  AdminCategoryEditPage: Wl
}, Symbol.toStringTag, { value: "Module" }));
function Jl({ detailTemplate: t, values: a, onChange: r }) {
  const i = Kt(), s = t ? i.templates.find((l) => l.id === t && l.kind === "detail")?.fieldSlots ?? [] : [];
  return s.length === 0 ? null : /* @__PURE__ */ e("div", { className: "space-y-4", children: s.map((l) => /* @__PURE__ */ n("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ e(A, { htmlFor: `template-field-${l.key}`, children: l.label }),
    l.type === "rich-text" ? /* @__PURE__ */ e(Ue, { id: `template-field-${l.key}`, value: String(a[l.key] ?? ""), onChange: (o) => r({ ...a, [l.key]: o.target.value }) }) : l.type === "boolean" ? /* @__PURE__ */ e(
      We,
      {
        id: `template-field-${l.key}`,
        checked: a[l.key] === !0,
        onCheckedChange: (o) => r({ ...a, [l.key]: o })
      }
    ) : l.type === "image" ? /* @__PURE__ */ n("div", { className: "space-y-2", children: [
      /* @__PURE__ */ e(Re, { value: typeof a[l.key] == "string" ? String(a[l.key]) : null, onChange: (o) => r({ ...a, [l.key]: o?.url ?? "" }), accept: "image/*" }),
      typeof a[l.key] == "string" && String(a[l.key]) && /* @__PURE__ */ n("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ e("img", { src: he(a[l.key]) ?? void 0, alt: l.label, className: "h-32 w-48 rounded-sm border object-cover" }),
        /* @__PURE__ */ e(w, { type: "button", variant: "outline", onClick: () => r({ ...a, [l.key]: "" }), children: "Remove image" })
      ] })
    ] }) : /* @__PURE__ */ e(F, { id: `template-field-${l.key}`, type: l.type === "number" ? "number" : l.type === "date" ? "date" : "text", value: String(a[l.key] ?? ""), onChange: (o) => r({ ...a, [l.key]: l.type === "number" && o.target.value ? Number(o.target.value) : o.target.value }) })
  ] }, l.key)) });
}
const Yl = [];
function Xl(t) {
  return Array.isArray(t);
}
function ur() {
  const t = globalThis.__CMS_SECTION_REGISTRY__;
  return Xl(t) ? t : Yl;
}
const mr = {
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
}, Ql = {
  map: "Latitude, longitude (example: -6.208763, 106.845599)"
}, Ia = [
  { label: "", url: "" },
  { label: "", url: "" }
];
function Da(t) {
  return Object.keys(t).reduce(
    (a, r) => ({
      ...a,
      [r]: r === "links" ? Ia.map((i) => ({ ...i })) : r === "form_inquiry" ? !1 : ""
    }),
    {}
  );
}
function Ea(t) {
  if (Array.isArray(t)) {
    const a = t.slice(0, 2).map((r) => {
      if (r && typeof r == "object") {
        const i = r;
        return { label: String(i.label ?? ""), url: String(i.url ?? "") };
      }
      return { label: "", url: "" };
    });
    return [...a, ...Ia.slice(a.length).map((r) => ({ ...r }))];
  }
  if (typeof t == "string" && t.trim())
    try {
      const a = JSON.parse(t);
      if (Array.isArray(a)) return Ea(a);
    } catch {
    }
  return Ia.map((a) => ({ ...a }));
}
function Zl({
  value: t,
  onItemChange: a
}) {
  const [r, i] = p(() => Ea(t));
  ae(() => {
    i(Ea(t));
  }, [t]);
  function s(l) {
    i(l), a(l);
  }
  return /* @__PURE__ */ n("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
    /* @__PURE__ */ e(A, { className: "text-xs", children: "Links" }),
    /* @__PURE__ */ e("div", { className: "space-y-2", children: r.map((l, o) => /* @__PURE__ */ n(
      "div",
      {
        className: "grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-2",
        children: [
          /* @__PURE__ */ e(
            F,
            {
              value: l.label,
              onChange: (d) => s(
                r.map(
                  (u, h) => h === o ? { ...u, label: d.target.value } : u
                )
              ),
              placeholder: "Label",
              className: "h-8 text-sm"
            }
          ),
          /* @__PURE__ */ e(
            F,
            {
              type: "url",
              value: l.url,
              onChange: (d) => s(
                r.map(
                  (u, h) => h === o ? { ...u, url: d.target.value } : u
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
function xa({
  field: t,
  value: a,
  onItemChange: r
}) {
  const i = kr(), s = mr[t] || t, l = a != null ? String(a) : "";
  if (t === "links")
    return /* @__PURE__ */ e(Zl, { value: a, onItemChange: r });
  if (t === "form_inquiry")
    return /* @__PURE__ */ n("div", { className: "flex items-center gap-2 sm:col-span-2", children: [
      /* @__PURE__ */ e(
        We,
        {
          id: i,
          checked: a === !0,
          onCheckedChange: (o) => r(o === !0)
        }
      ),
      /* @__PURE__ */ e(A, { htmlFor: i, className: "cursor-pointer text-xs", children: "Show inquiry form" })
    ] });
  if (t === "text" || t === "embed")
    return /* @__PURE__ */ n("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
      /* @__PURE__ */ e(A, { className: "text-xs", children: s }),
      /* @__PURE__ */ e(
        Ue,
        {
          value: l,
          onChange: (o) => r(o.target.value || null),
          placeholder: s,
          rows: 2,
          className: "text-sm"
        }
      )
    ] });
  if (t === "image" || t === "bg_image") {
    const o = !!l;
    return /* @__PURE__ */ n("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ e(A, { className: "text-xs", children: s }),
      /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
        o && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
          "img",
          {
            src: he(l) ?? void 0,
            alt: "",
            className: "h-full w-full object-cover"
          }
        ) }),
        /* @__PURE__ */ e(
          Re,
          {
            value: o ? l : null,
            onChange: (d) => r(d ? d.url : null),
            accept: "image/*"
          }
        ),
        o && /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "outline",
            "aria-label": `Remove ${s.toLowerCase()}`,
            className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
            onClick: () => r(null),
            children: "Remove"
          }
        )
      ] })
    ] });
  }
  return t === "bg_color" ? /* @__PURE__ */ n("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ e(A, { className: "text-xs", children: s }),
    /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ e(
        F,
        {
          type: "color",
          value: l || "#ffffff",
          onChange: (o) => r(o.target.value || null),
          className: "h-8 w-8 p-0.5"
        }
      ),
      /* @__PURE__ */ e(
        F,
        {
          value: l,
          onChange: (o) => r(o.target.value || null),
          placeholder: "#000000",
          className: "h-8 flex-1 text-sm"
        }
      )
    ] })
  ] }) : t === "style_css_inline" ? /* @__PURE__ */ n("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
    /* @__PURE__ */ e(A, { className: "text-xs", children: s }),
    /* @__PURE__ */ e(
      F,
      {
        value: l,
        onChange: (o) => r(o.target.value || null),
        placeholder: "color: red; font-size: 14px;",
        className: "h-8 text-sm"
      }
    )
  ] }) : /* @__PURE__ */ n("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ e(A, { className: "text-xs", children: s }),
    /* @__PURE__ */ e(
      F,
      {
        value: l,
        onChange: (o) => r(o.target.value || null),
        placeholder: Ql[t] || s,
        className: "h-8 text-sm"
      }
    )
  ] });
}
function eo({
  id: t,
  item: a,
  itemIdx: r,
  itemTemplate: i,
  onUpdateItemField: s,
  onRemove: l,
  isExpanded: o,
  onToggleExpanded: d,
  onDuplicate: u
}) {
  const { attributes: h, listeners: M, setNodeRef: I, transform: C, transition: c, isDragging: P } = Ft({ id: t }), O = Object.keys(i || a), z = O.filter((g) => ["style_css", "style_css_inline", "style_id"].includes(g)), v = O.filter((g) => ["bg_color", "bg_image"].includes(g)), m = [
    { value: "text", label: "Text", fields: O.filter((g) => ["caption", "title", "text"].includes(g)) },
    { value: "image", label: "Image", fields: O.filter((g) => ["image", "alt_image"].includes(g)) },
    ...O.filter((g) => !["caption", "title", "text", "image", "alt_image", "style_css", "style_css_inline", "style_id", "bg_color", "bg_image"].includes(g)).map((g) => ({ value: g, label: mr[g] || g, fields: [g] }))
  ].filter((g) => g.fields.length > 0);
  return /* @__PURE__ */ n(
    "div",
    {
      ref: I,
      style: { transform: Bt.Transform.toString(C), transition: c },
      className: `overflow-hidden rounded-sm border ${P ? "z-10 opacity-50" : ""}`,
      children: [
        /* @__PURE__ */ n("div", { className: "flex items-center justify-between border-b px-3 py-2.5", children: [
          /* @__PURE__ */ n("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ e(
              w,
              {
                type: "button",
                variant: "ghost",
                size: "icon-sm",
                className: "cursor-grab text-muted-foreground hover:text-foreground",
                "aria-label": "Drag to reorder item",
                ...h,
                ...M,
                children: /* @__PURE__ */ e(Ot, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ n("span", { className: "text-xs font-medium", children: [
              "Column #",
              r + 1
            ] })
          ] }),
          /* @__PURE__ */ n("div", { className: "flex items-center gap-0.5", children: [
            /* @__PURE__ */ e(
              w,
              {
                type: "button",
                variant: "ghost",
                size: "icon-sm",
                "aria-label": "Duplicate column",
                onClick: (g) => {
                  g.stopPropagation(), u(r);
                },
                children: /* @__PURE__ */ e(Ba, { className: "h-3.5 w-3.5 text-muted-foreground" })
              }
            ),
            (z.length > 0 || v.length > 0) && /* @__PURE__ */ n(Ze, { children: [
              /* @__PURE__ */ e(
                Pt,
                {
                  render: /* @__PURE__ */ e(w, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": "Open style settings", children: /* @__PURE__ */ e(Ua, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
                }
              ),
              /* @__PURE__ */ n(et, { children: [
                /* @__PURE__ */ n(tt, { children: [
                  /* @__PURE__ */ e(at, { children: "Style settings" }),
                  /* @__PURE__ */ e(Wt, { children: "Set background and custom styling for this column." })
                ] }),
                /* @__PURE__ */ n($t, { defaultValue: z.length > 0 ? "style" : "background", className: "gap-0", children: [
                  /* @__PURE__ */ n(Rt, { className: "w-full justify-start", "aria-label": "Style settings", children: [
                    z.length > 0 && /* @__PURE__ */ e(je, { value: "style", className: "shrink-0 px-2 text-xs", children: "Style" }),
                    v.length > 0 && /* @__PURE__ */ e(je, { value: "background", className: "shrink-0 px-2 text-xs", children: "Background" })
                  ] }),
                  z.length > 0 && /* @__PURE__ */ e(Be, { value: "style", className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: z.map((g) => /* @__PURE__ */ e(xa, { field: g, value: a[g] ?? null, onItemChange: (_) => s(r, g, _) }, g)) }) }),
                  v.length > 0 && /* @__PURE__ */ e(Be, { value: "background", className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: v.map((g) => /* @__PURE__ */ e(xa, { field: g, value: a[g] ?? null, onItemChange: (_) => s(r, g, _) }, g)) }) })
                ] }),
                /* @__PURE__ */ e(bt, { showCloseButton: !0 })
              ] })
            ] }),
            /* @__PURE__ */ e(
              w,
              {
                type: "button",
                variant: "ghost",
                size: "icon-sm",
                "aria-label": "Remove column",
                onClick: (g) => {
                  g.stopPropagation(), l(r);
                },
                children: /* @__PURE__ */ e(ye, { className: "h-3.5 w-3.5 text-destructive" })
              }
            ),
            /* @__PURE__ */ e(w, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": o ? "Collapse column" : "Expand column", onClick: d, children: o ? /* @__PURE__ */ e(Vn, { className: "h-3.5 w-3.5 text-muted-foreground" }) : /* @__PURE__ */ e(At, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
          ] })
        ] }),
        o && m.length > 0 ? /* @__PURE__ */ n($t, { defaultValue: m[0].value, className: "gap-0", children: [
          /* @__PURE__ */ e(Rt, { className: "w-full justify-start", "aria-label": `Column ${r + 1} fields`, children: m.map((g) => /* @__PURE__ */ e(je, { value: g.value, className: "shrink-0 px-2 text-xs", children: g.label }, g.value)) }),
          m.map((g) => /* @__PURE__ */ e(Be, { value: g.value, className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: g.fields.map((_) => /* @__PURE__ */ e(
            xa,
            {
              field: _,
              value: a[_] ?? null,
              onItemChange: (T) => s(r, _, T)
            },
            _
          )) }) }, g.value))
        ] }) : o && /* @__PURE__ */ e("p", { className: "p-4 text-xs text-muted-foreground", children: "No template fields defined for this section." })
      ]
    }
  );
}
function to(t, a, r) {
  if (t && Object.keys(t).length > 0) return t;
  if (a.item && a.item.length > 0) return { ...a.item[0] };
  const i = r.find((s) => s.id === a.id);
  if (i?.item)
    try {
      const s = typeof i.item == "string" ? JSON.parse(i.item) : i.item;
      if (s && !Array.isArray(s)) return { ...s };
      if (Array.isArray(s) && s.length > 0) return { ...s[0] };
    } catch {
    }
  return null;
}
function ao({
  section: t,
  index: a,
  isExpanded: r,
  itemTemplate: i,
  availableSections: s,
  template: l,
  onToggleExpanded: o,
  onRemove: d,
  onDuplicate: u,
  onUpdateField: h,
  onUpdateItemField: M,
  collapsedItems: I,
  onToggleItemExpanded: C,
  onCollapseItems: c,
  onExpandItems: P
}) {
  const O = ur(), z = to(i, t, s), v = l ?? O.find((S) => S.type === t.type) ?? null, m = !!v?.contentType, g = v?.itemMode !== "none", _ = v?.itemMode === "single", T = new Set(v?.sectionFields ?? ["caption", "title", "text"]), L = v?.columns, y = L ? L.desktop ?? L.tablet ?? L.mobile : void 0, b = t.links?.[0] ?? { label: "", url: "" }, [N, f] = p([]), x = N.find(
    (S) => S.id === t.category || S.name === t.category
  ), { attributes: $, listeners: j, setNodeRef: K, transform: ne, transition: X, isDragging: ve } = Ft({ id: t._instanceId });
  return ae(() => {
    if (!m) {
      f([]);
      return;
    }
    fe(`/api/admin/categories?type=${encodeURIComponent(t.type)}`).then((S) => f(Array.isArray(S) ? S : [])).catch(() => f([]));
  }, [t.type, m]), /* @__PURE__ */ n(Ne, { ref: K, style: { transform: Bt.Transform.toString(ne), transition: X }, className: `gap-0 overflow-hidden rounded-sm border-border/70 bg-card py-0 shadow-sm ${ve ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ n(we, { className: "flex flex-row items-center justify-between border-b py-3 px-3 cursor-pointer select-none", onClick: o, children: [
      /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e(w, { type: "button", variant: "ghost", size: "icon-sm", className: "cursor-grab text-muted-foreground hover:text-foreground", "aria-label": "Drag to reorder", ...$, ...j, children: /* @__PURE__ */ e(Ot, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ e(Ce, { className: "text-sm", children: v?.label ?? t.type ?? `Section #${a + 1}` })
      ] }),
      /* @__PURE__ */ n("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            "aria-label": "Duplicate section",
            onClick: (S) => {
              S.stopPropagation(), u();
            },
            children: /* @__PURE__ */ e(Ba, { className: "h-4 w-4 text-muted-foreground" })
          }
        ),
        /* @__PURE__ */ n(Ze, { children: [
          /* @__PURE__ */ e(
            Pt,
            {
              render: /* @__PURE__ */ e(
                w,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon-sm",
                  "aria-label": "Open section style settings",
                  onClick: (S) => S.stopPropagation(),
                  children: /* @__PURE__ */ e(Ua, { className: "h-4 w-4 text-muted-foreground" })
                }
              )
            }
          ),
          /* @__PURE__ */ n(et, { className: "max-h-[90vh] overflow-y-auto sm:max-w-xl", children: [
            /* @__PURE__ */ n(tt, { children: [
              /* @__PURE__ */ e(at, { children: "Section settings" }),
              /* @__PURE__ */ e(Wt, { children: "Configure media, display options, link, and custom styling for this section." })
            ] }),
            /* @__PURE__ */ n($t, { defaultValue: "style", className: "gap-0", children: [
              /* @__PURE__ */ n(Rt, { className: "w-full justify-start", "aria-label": "Section settings", children: [
                /* @__PURE__ */ e(je, { value: "style", className: "shrink-0 px-2 text-xs", children: "Style" }),
                m && /* @__PURE__ */ e(je, { value: "filter", className: "shrink-0 px-2 text-xs", children: "Filter" }),
                T.has("image") && /* @__PURE__ */ e(je, { value: "image", className: "shrink-0 px-2 text-xs", children: "Image" }),
                T.has("links") && /* @__PURE__ */ e(je, { value: "link", className: "shrink-0 px-2 text-xs", children: "Link" }),
                (T.has("bg_color") || T.has("bg_image")) && /* @__PURE__ */ e(je, { value: "background", className: "shrink-0 px-2 text-xs", children: "Background" })
              ] }),
              /* @__PURE__ */ e(Be, { value: "style", className: "p-1 pt-4", children: /* @__PURE__ */ n("div", { className: "space-y-4", children: [
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Custom Class" }),
                  /* @__PURE__ */ e(F, { value: t.style_css ?? "", onChange: (S) => h("style_css", S.target.value || null), placeholder: "custom-class" })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Custom Style" }),
                  /* @__PURE__ */ e(F, { value: t.style_css_inline ?? "", onChange: (S) => h("style_css_inline", S.target.value || null), placeholder: "color: red;" })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Custom ID" }),
                  /* @__PURE__ */ e(F, { value: t.style_id ?? "", onChange: (S) => h("style_id", S.target.value || null), placeholder: "#my-id" })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Alignment" }),
                  /* @__PURE__ */ n(ce, { value: t.alignment ?? "", onValueChange: (S) => h("alignment", S || null), children: [
                    /* @__PURE__ */ e(ue, { children: /* @__PURE__ */ e(de, { placeholder: "Select alignment" }) }),
                    /* @__PURE__ */ n(me, { children: [
                      /* @__PURE__ */ e(Z, { value: "left", children: "Left" }),
                      /* @__PURE__ */ e(Z, { value: "center", children: "Center" }),
                      /* @__PURE__ */ e(Z, { value: "right", children: "Right" })
                    ] })
                  ] })
                ] })
              ] }) }),
              m && /* @__PURE__ */ e(Be, { value: "filter", className: "p-1 pt-4", children: /* @__PURE__ */ n("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Category" }),
                  /* @__PURE__ */ n(ce, { value: x?.id ?? t.category ?? "all", onValueChange: (S) => h("category", S === "all" ? null : S), children: [
                    /* @__PURE__ */ e(ue, { children: /* @__PURE__ */ e(de, { children: x?.name ?? "All categories" }) }),
                    /* @__PURE__ */ n(me, { children: [
                      /* @__PURE__ */ e(Z, { value: "all", children: "All categories" }),
                      N.map((S) => /* @__PURE__ */ e(Z, { value: S.id, children: S.name }, S.id))
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Sort By" }),
                  /* @__PURE__ */ n(ce, { value: t.sort_by ?? "created_at", onValueChange: (S) => h("sort_by", S), children: [
                    /* @__PURE__ */ e(ue, { children: /* @__PURE__ */ e(de, {}) }),
                    /* @__PURE__ */ n(me, { children: [
                      /* @__PURE__ */ e(Z, { value: "created_at", children: "Created at" }),
                      /* @__PURE__ */ e(Z, { value: "title", children: "Title" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Order" }),
                  /* @__PURE__ */ n(ce, { value: t.sort_order ?? "desc", onValueChange: (S) => h("sort_order", S), children: [
                    /* @__PURE__ */ e(ue, { children: /* @__PURE__ */ e(de, {}) }),
                    /* @__PURE__ */ n(me, { children: [
                      /* @__PURE__ */ e(Z, { value: "asc", children: "Ascending" }),
                      /* @__PURE__ */ e(Z, { value: "desc", children: "Descending" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Limit" }),
                  /* @__PURE__ */ e(F, { type: "number", min: 0, value: t.limit ?? "", onChange: (S) => h("limit", S.target.value ? Number(S.target.value) : null), placeholder: "Max items" })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Sort" }),
                  /* @__PURE__ */ e(F, { type: "number", min: 0, value: t.sort, onChange: (S) => h("sort", Number(S.target.value) || 0) })
                ] })
              ] }) }),
              T.has("image") && /* @__PURE__ */ e(Be, { value: "image", className: "p-1 pt-4", children: /* @__PURE__ */ n("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Image" }),
                  /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
                    t.image && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: he(t.image) ?? void 0, alt: "", className: "h-full w-full object-cover" }) }),
                    /* @__PURE__ */ e(Re, { value: t.image ?? null, onChange: (S) => h("image", S ? S.url : null), accept: "image/*" }),
                    t.image && /* @__PURE__ */ e(w, { type: "button", variant: "outline", "aria-label": "Remove image", className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive", onClick: () => h("image", null), children: "Remove" })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Alt Image" }),
                  /* @__PURE__ */ e(F, { value: t.alt_image ?? "", onChange: (S) => h("alt_image", S.target.value || null), placeholder: "Alt text" })
                ] })
              ] }) }),
              T.has("links") && /* @__PURE__ */ e(Be, { value: "link", className: "p-1 pt-4", children: /* @__PURE__ */ n("div", { className: "grid gap-2 sm:grid-cols-3", children: [
                /* @__PURE__ */ e(F, { value: b.label, onChange: (S) => h("links", [{ ...b, label: S.target.value }]), placeholder: "Label" }),
                /* @__PURE__ */ e(F, { value: b.url, onChange: (S) => h("links", [{ ...b, url: S.target.value }]), placeholder: "https://...", className: "sm:col-span-2" })
              ] }) }),
              (T.has("bg_color") || T.has("bg_image")) && /* @__PURE__ */ e(Be, { value: "background", className: "p-1 pt-4", children: /* @__PURE__ */ n("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Background Image" }),
                  /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
                    t.bg_image && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: he(t.bg_image) ?? void 0, alt: "", className: "h-full w-full object-cover" }) }),
                    /* @__PURE__ */ e(Re, { value: t.bg_image ?? null, onChange: (S) => h("bg_image", S ? S.url : null), accept: "image/*" }),
                    t.bg_image && /* @__PURE__ */ e(w, { type: "button", variant: "outline", "aria-label": "Remove background image", className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive", onClick: () => h("bg_image", null), children: "Remove" })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Background Color" }),
                  /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ e(F, { type: "color", value: t.bg_color ?? "#ffffff", onChange: (S) => h("bg_color", S.target.value || null), className: "h-9 w-10 p-1" }),
                    /* @__PURE__ */ e(F, { value: t.bg_color ?? "", onChange: (S) => h("bg_color", S.target.value || null), placeholder: "#000000" })
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ e(bt, { showCloseButton: !0 })
          ] })
        ] }),
        /* @__PURE__ */ e(w, { type: "button", variant: "ghost", size: "icon-sm", onClick: (S) => {
          S.stopPropagation(), d();
        }, children: /* @__PURE__ */ e(ye, { className: "h-4 w-4 text-destructive" }) }),
        r ? /* @__PURE__ */ e(Vn, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ e(At, { className: "h-4 w-4 text-muted-foreground" })
      ] })
    ] }),
    r && /* @__PURE__ */ n(ke, { className: "space-y-5 px-3 py-4", children: [
      (T.has("caption") || T.has("title") || T.has("text")) && /* @__PURE__ */ n("div", { className: "space-y-4", children: [
        T.has("caption") && /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(A, { children: "Caption" }),
          /* @__PURE__ */ e(F, { value: t.caption ?? "", onChange: (S) => h("caption", S.target.value || null), placeholder: "Enter your caption..." })
        ] }),
        T.has("title") && /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(A, { children: "Heading" }),
          /* @__PURE__ */ e(F, { value: t.title ?? "", onChange: (S) => h("title", S.target.value || null), placeholder: "Enter your heading..." })
        ] }),
        T.has("text") && /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(A, { children: "Text" }),
          /* @__PURE__ */ e(Ue, { value: t.text ?? "", onChange: (S) => h("text", S.target.value || null), placeholder: "Enter your text...", rows: 3 })
        ] })
      ] }),
      g && /* @__PURE__ */ n("div", { className: "space-y-3 border-t pt-5", children: [
        /* @__PURE__ */ n("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ n("div", { className: "space-y-1", children: [
            /* @__PURE__ */ n(A, { className: "text-sm font-semibold", children: [
              "Items",
              y ? ` · up to ${y} columns per row` : ""
            ] }),
            /* @__PURE__ */ n("div", { className: "flex items-center gap-3 text-xs font-medium text-muted-foreground", children: [
              /* @__PURE__ */ e(w, { type: "button", variant: "link", size: "sm", onClick: c, className: "h-auto p-0 text-muted-foreground hover:text-foreground", children: "Collapse all" }),
              /* @__PURE__ */ e(w, { type: "button", variant: "link", size: "sm", onClick: P, className: "h-auto p-0 text-muted-foreground hover:text-foreground", children: "Expand all" })
            ] })
          ] }),
          /* @__PURE__ */ n(
            w,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              disabled: _ && (t.item?.length ?? 0) >= 1,
              onClick: (S) => {
                S.stopPropagation();
                const D = z ? Da(z) : {};
                h("item", [...t.item ?? [], D]);
              },
              className: "gap-1",
              children: [
                /* @__PURE__ */ e(Ie, { className: "h-3.5 w-3.5" }),
                "Add Item"
              ]
            }
          )
        ] }),
        t.item && t.item.length > 0 ? /* @__PURE__ */ e(
          jt,
          {
            items: (t.item ?? []).map((S, D) => `${t._instanceId}-item-${D}`),
            strategy: Ka,
            children: /* @__PURE__ */ e("div", { className: "grid gap-3 lg:grid-cols-2", children: t.item.map((S, D) => /* @__PURE__ */ e(
              eo,
              {
                id: `${t._instanceId}-item-${D}`,
                item: S,
                itemIdx: D,
                itemTemplate: z,
                onUpdateItemField: M,
                onRemove: (V) => h(
                  "item",
                  (t.item ?? []).filter((R, G) => G !== V)
                ),
                isExpanded: !I.has(`${t._instanceId}-item-${D}`),
                onToggleExpanded: () => C(`${t._instanceId}-item-${D}`),
                onDuplicate: (V) => h("item", [...t.item ?? [], { ...(t.item ?? [])[V] }])
              },
              `${t._instanceId}-item-${D}`
            )) })
          }
        ) : /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: 'No items added. Click "Add Item" to create one.' })
      ] }),
      t.links && t.links.length > 0 && /* @__PURE__ */ n("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ n($e, { variant: "secondary", children: [
          t.links.length,
          " links"
        ] }),
        /* @__PURE__ */ e("span", { children: "embedded" })
      ] })
    ] })
  ] });
}
function no(t) {
  const a = t.demo?.section ?? {}, r = (i) => typeof a[i] == "string" ? a[i] : null;
  return {
    id: `template-${t.type}`,
    type: t.type,
    caption: r("caption"),
    title: r("title"),
    text: r("text"),
    image: r("image"),
    alt_image: r("alt_image"),
    bg_color: r("bg_color"),
    bg_image: r("bg_image"),
    style_css: r("style_css"),
    style_css_inline: r("style_css_inline"),
    style_id: r("style_id"),
    alignment: r("alignment"),
    limit: null,
    sort: 0,
    sort_by: null,
    sort_order: null,
    category: null,
    links: null,
    item: Object.fromEntries(t.itemFields.map((i) => [i, null])),
    template: t
  };
}
function hr({ embeddedSections: t, onChange: a }) {
  const r = ur(), [i] = p(() => r.map(no)), [s, l] = p(!1), [o, d] = p(/* @__PURE__ */ new Set()), [u, h] = p(/* @__PURE__ */ new Set()), [M, I] = p(/* @__PURE__ */ new Map()), C = Ha(
    Mt(Va, { activationConstraint: { distance: 6 } })
  );
  function c(y) {
    const b = i.find((X) => X.id === y);
    if (!b) return;
    let N = null, f = null, x = null;
    const $ = b.template?.itemMode !== "none";
    try {
      b.links && (N = JSON.parse(b.links));
    } catch {
    }
    const j = b.template?.demo?.items;
    $ && j?.length && (x = { ...b.item }, f = j.map((X) => ({
      ...X,
      links: Array.isArray(X.links) ? X.links.map((ve) => ({ ...ve })) : X.links
    })));
    try {
      if ($ && !f && b.item) {
        const X = typeof b.item == "string" ? JSON.parse(b.item) : b.item;
        X && !Array.isArray(X) ? (x = { ...X }, f = [Da({ ...X })]) : Array.isArray(X) && (f = X, x = X.length > 0 ? { ...X[0] } : null);
      }
    } catch {
    }
    $ && !f && x && (f = [Da(x)]);
    const K = {
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      id: b.id,
      type: b.type,
      caption: b.caption,
      title: b.title,
      text: b.text,
      image: b.image,
      alt_image: b.alt_image,
      bg_color: b.bg_color,
      bg_image: b.bg_image,
      style_css: b.style_css,
      style_css_inline: b.style_css_inline,
      style_id: b.style_id,
      alignment: b.alignment,
      limit: b.limit,
      sort: b.sort ?? 0,
      sort_by: b.sort_by,
      sort_order: b.sort_order,
      category: b.category,
      links: N,
      item: $ ? f && f.length > 0 ? f : [] : null
    }, ne = t.length;
    a([...t, K]), l(!1), $ && x && I((X) => new Map(X).set(ne, x)), d((X) => new Set(X).add(ne));
  }
  function P(y) {
    a(t.filter((b, N) => N !== y));
  }
  function O(y) {
    const b = t[y];
    if (!b) return;
    const N = {
      ...b,
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      links: b.links?.map((f) => ({ ...f })) ?? null,
      item: b.item?.map((f) => ({ ...f })) ?? null
    };
    a([
      ...t.slice(0, y + 1),
      N,
      ...t.slice(y + 1)
    ]), d((f) => {
      const x = /* @__PURE__ */ new Set();
      return f.forEach(($) => x.add($ > y ? $ + 1 : $)), x.add(y + 1), x;
    }), I((f) => {
      const x = /* @__PURE__ */ new Map();
      f.forEach((j, K) => {
        x.set(K > y ? K + 1 : K, j);
      });
      const $ = f.get(y);
      return $ && x.set(y + 1, { ...$ }), x;
    });
  }
  function z(y, b, N) {
    a(t.map((f, x) => x === y ? { ...f, [b]: N } : f));
  }
  function v(y, b, N, f) {
    a(
      t.map((x, $) => $ !== y || !x.item ? x : {
        ...x,
        item: x.item.map((j, K) => K === b ? { ...j, [N]: f } : j)
      })
    );
  }
  function m(y) {
    d((b) => {
      const N = new Set(b);
      return N.has(y) ? N.delete(y) : N.add(y), N;
    });
  }
  function g(y) {
    h((b) => {
      const N = new Set(b);
      return N.has(y) ? N.delete(y) : N.add(y), N;
    });
  }
  function _() {
    d(/* @__PURE__ */ new Set()), h(new Set(
      t.flatMap(
        (y) => (y.item ?? []).map((b, N) => `${y._instanceId}-item-${N}`)
      )
    ));
  }
  function T() {
    d(new Set(t.map((y, b) => b))), h(/* @__PURE__ */ new Set());
  }
  function L(y) {
    const { active: b, over: N } = y;
    if (!N || b.id === N.id) return;
    const f = String(b.id), x = String(N.id);
    if (!f.includes("-item-") && !x.includes("-item-")) {
      const $ = t.findIndex((K) => K._instanceId === f), j = t.findIndex((K) => K._instanceId === x);
      if ($ === -1 || j === -1) return;
      a(mt(t, $, j));
      return;
    }
    if (f.includes("-item-") && x.includes("-item-")) {
      const $ = f.split("-item-")[0], j = x.split("-item-")[0];
      if ($ !== j) return;
      const K = t.findIndex((D) => D._instanceId === $);
      if (K === -1) return;
      const ne = t[K];
      if (!ne.item) return;
      const X = parseInt(f.split("-item-")[1], 10), ve = parseInt(x.split("-item-")[1], 10);
      if (isNaN(X) || isNaN(ve)) return;
      const S = mt(ne.item, X, ve);
      a(
        t.map(
          (D, V) => V === K ? { ...D, item: S } : D
        )
      );
      return;
    }
  }
  return /* @__PURE__ */ n("div", { className: "space-y-3", children: [
    t.length > 0 && /* @__PURE__ */ n("div", { className: "flex items-center gap-3 px-0.5 text-xs font-medium", children: [
      /* @__PURE__ */ e(w, { type: "button", variant: "link", size: "sm", onClick: _, className: "h-auto p-0 text-muted-foreground transition-colors hover:text-foreground", children: "Collapse all" }),
      /* @__PURE__ */ e(w, { type: "button", variant: "link", size: "sm", onClick: T, className: "h-auto p-0 text-muted-foreground transition-colors hover:text-foreground", children: "Expand all" })
    ] }),
    /* @__PURE__ */ n(Ze, { open: s, onOpenChange: l, children: [
      /* @__PURE__ */ e(
        Pt,
        {
          render: /* @__PURE__ */ n(w, { type: "button", variant: "outline", className: "gap-1.5", children: [
            /* @__PURE__ */ e(Ie, { className: "h-3.5 w-3.5" }),
            "Add Section"
          ] })
        }
      ),
      /* @__PURE__ */ n(et, { className: "sm:max-w-lg", children: [
        /* @__PURE__ */ n(tt, { children: [
          /* @__PURE__ */ e(at, { children: "Add Section" }),
          /* @__PURE__ */ e(Wt, { children: "Select a developer-provided section template. Its fields and layout are defined in code." })
        ] }),
        /* @__PURE__ */ n("div", { className: "max-h-[60vh] space-y-2 overflow-y-auto pr-1", children: [
          i.map((y) => /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "outline",
              className: "h-auto w-full justify-start px-3 py-3 text-left",
              onClick: () => c(y.id),
              children: /* @__PURE__ */ n("span", { className: "flex flex-col items-start gap-0.5", children: [
                /* @__PURE__ */ e("span", { children: y.template?.label ?? y.type }),
                y.template?.description && /* @__PURE__ */ e("span", { className: "text-xs font-normal text-muted-foreground", children: y.template.description })
              ] })
            },
            y.id
          )),
          i.length === 0 && /* @__PURE__ */ e("p", { className: "py-6 text-center text-sm text-muted-foreground", children: "No sections available." })
        ] })
      ] })
    ] }),
    t.length > 0 && /* @__PURE__ */ e(Ga, { sensors: C, collisionDetection: qa, onDragEnd: L, children: /* @__PURE__ */ e(jt, { items: t.map((y) => y._instanceId), strategy: Ka, children: /* @__PURE__ */ e("div", { className: "space-y-3", children: t.map((y, b) => /* @__PURE__ */ e(
      ao,
      {
        section: y,
        index: b,
        isExpanded: o.has(b),
        itemTemplate: M.get(b) ?? null,
        availableSections: i,
        template: r.find((N) => N.type === y.type) ?? null,
        onToggleExpanded: () => m(b),
        onRemove: () => P(b),
        onDuplicate: () => O(b),
        onUpdateField: (N, f) => z(b, N, f),
        onUpdateItemField: (N, f, x) => v(b, N, f, x),
        collapsedItems: u,
        onToggleItemExpanded: g,
        onCollapseItems: () => h((N) => /* @__PURE__ */ new Set([...N, ...(y.item ?? []).map((f, x) => `${y._instanceId}-item-${x}`)])),
        onExpandItems: () => h((N) => {
          const f = new Set(N);
          return (y.item ?? []).forEach((x, $) => f.delete(`${y._instanceId}-item-${$}`)), f;
        })
      },
      y._instanceId
    )) }) }) }),
    t.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No sections embedded. Pick one from above." })
  ] });
}
function La({ ...t }) {
  return /* @__PURE__ */ e(He.Root, { "data-slot": "dropdown-menu", ...t });
}
function Ma({ ...t }) {
  return /* @__PURE__ */ e(He.Trigger, { "data-slot": "dropdown-menu-trigger", ...t });
}
function $a({
  align: t = "start",
  alignOffset: a = 0,
  side: r = "bottom",
  sideOffset: i = 4,
  className: s,
  ...l
}) {
  return /* @__PURE__ */ e(He.Portal, { children: /* @__PURE__ */ e(
    He.Positioner,
    {
      className: "isolate z-50 outline-none",
      align: t,
      alignOffset: a,
      side: r,
      sideOffset: i,
      children: /* @__PURE__ */ e(
        He.Popup,
        {
          "data-slot": "dropdown-menu-content",
          className: k("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", s),
          ...l
        }
      )
    }
  ) });
}
function Ye({
  className: t,
  inset: a,
  ...r
}) {
  return /* @__PURE__ */ e(
    He.GroupLabel,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": a,
      className: k(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        t
      ),
      ...r
    }
  );
}
function Q({
  className: t,
  inset: a,
  variant: r = "default",
  ...i
}) {
  return /* @__PURE__ */ e(
    He.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": a,
      "data-variant": r,
      className: k(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-sm px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        t
      ),
      ...i
    }
  );
}
function ro({
  className: t,
  children: a,
  ...r
}) {
  return /* @__PURE__ */ n(
    He.CheckboxItem,
    {
      "data-slot": "dropdown-menu-checkbox-item",
      className: k(
        "relative flex cursor-default items-center gap-1.5 rounded-sm py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        t
      ),
      ...r,
      children: [
        /* @__PURE__ */ e("span", { className: "pointer-events-none absolute left-1.5 flex size-4 items-center justify-center", children: /* @__PURE__ */ e(He.CheckboxItemIndicator, { children: /* @__PURE__ */ e(On, { className: "size-4" }) }) }),
        a
      ]
    }
  );
}
function it({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    He.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: k("-mx-1 my-1 h-px bg-border", t),
      ...a
    }
  );
}
function so({
  options: t,
  selected: a,
  onChange: r,
  placeholder: i = "Select...",
  className: s
}) {
  function l(d) {
    a.includes(d) ? r(a.filter((u) => u !== d)) : r([...a, d]);
  }
  const o = t.filter((d) => a.includes(d.value)).map((d) => d.label);
  return /* @__PURE__ */ e("div", { className: k("relative", s), children: /* @__PURE__ */ n(La, { children: [
    /* @__PURE__ */ n(
      Ma,
      {
        render: /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "outline",
            "aria-label": i,
            className: k(
              "min-h-10 w-full justify-between gap-2 px-3 py-2",
              o.length === 0 && "text-muted-foreground"
            )
          }
        ),
        children: [
          o.length > 0 ? /* @__PURE__ */ n("span", { className: "flex min-w-0 flex-1 flex-wrap gap-1 text-left", children: [
            o.slice(0, 3).map((d) => /* @__PURE__ */ e(
              $e,
              {
                variant: "secondary",
                className: "max-w-full px-1.5 py-0 text-xs font-normal",
                children: /* @__PURE__ */ e("span", { className: "truncate", children: d })
              },
              d
            )),
            o.length > 3 && /* @__PURE__ */ n(
              $e,
              {
                variant: "secondary",
                className: "px-1.5 py-0 text-xs font-normal",
                children: [
                  "+",
                  o.length - 3
                ]
              }
            )
          ] }) : /* @__PURE__ */ e("span", { className: "flex-1 text-left", children: i }),
          /* @__PURE__ */ e(At, { className: "size-4 shrink-0 text-muted-foreground" })
        ]
      }
    ),
    /* @__PURE__ */ e(
      $a,
      {
        align: "start",
        className: "w-(--anchor-width) min-w-48",
        children: t.length === 0 ? /* @__PURE__ */ e("p", { className: "px-2 py-4 text-center text-sm text-muted-foreground", children: "No options available." }) : t.map((d) => /* @__PURE__ */ e(
          ro,
          {
            checked: a.includes(d.value),
            onCheckedChange: () => l(d.value),
            children: d.label
          },
          d.value
        ))
      }
    )
  ] }) });
}
function io({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    os,
    {
      "data-slot": "radio-group",
      className: k("grid gap-3", t),
      ...a
    }
  );
}
function zn({
  className: t,
  ...a
}) {
  return /* @__PURE__ */ e(
    fn.Root,
    {
      "data-slot": "radio-group-item",
      className: k(
        "aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:border-primary data-checked:bg-primary",
        t
      ),
      ...a,
      children: /* @__PURE__ */ e(
        fn.Indicator,
        {
          "data-slot": "radio-group-indicator",
          className: "relative flex size-full items-center justify-center after:size-2 after:rounded-full after:bg-primary-foreground"
        }
      )
    }
  );
}
const lo = ie(async () => ({ default: (await Promise.resolve().then(() => vr)).TiptapEditor }));
function gr({ post: t, categories: a = [], mode: r, pageTitle: i, defaultType: s }) {
  const { session: l } = ze(), [o, d] = St(), [u, h] = p({}), [M, I] = p(null), [C, c] = p(t?.title ?? ""), [P, O] = p(
    t?.status === "published" || t?.status === "scheduled" ? "published" : "draft"
  ), [z, v] = p(() => Et(t?.publishedAt)), [m, g] = p(!1), _ = P === "published" && !!z && z > Date.now(), [T, L] = p(t?.slug ?? ""), [y, b] = p(!!t?.slug), [N] = p(t?.type ?? s ?? "post"), f = l ? l.permissions.includes(`content.${N}.publish`) || l.permissions.includes(`content.${N}.publish-own`) : !1, x = l ? l.permissions.includes(`content.${N}.unpublish`) || l.permissions.includes(`content.${N}.unpublish-own`) : !1, [$, j] = p(t?.excerpt ?? ""), [K, ne] = p(t?.description ?? ""), [X, ve] = p(() => {
    if (t?.tags)
      try {
        const B = JSON.parse(t.tags);
        return Array.isArray(B) ? B.join(", ") : "";
      } catch {
        return "";
      }
    return "";
  }), [S, D] = p(() => t?.categories?.map((B) => B.id) ?? []), [V, R] = p(t?.metaTitle ?? ""), [G, re] = p(t?.metaDescription ?? ""), [J, ee] = p(t?.featuredImage ?? ""), [H, pe] = p(() => {
    if (!t?.gallery) return [];
    try {
      const B = JSON.parse(t.gallery);
      return Array.isArray(B) ? B.filter((E) => typeof E == "string") : [];
    } catch {
      return [];
    }
  }), [oe, le] = p(() => {
    if (t?.customFieldValues)
      try {
        return JSON.parse(t.customFieldValues);
      } catch {
        return {};
      }
    return {};
  }), [xe, vt] = p(() => {
    if (t?.sections)
      try {
        const B = JSON.parse(t.sections);
        return (Array.isArray(B) ? B : []).map((U) => {
          const W = U && typeof U == "object" ? U : {};
          return {
            ...W,
            _instanceId: W._instanceId || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          };
        });
      } catch {
        return [];
      }
    return [];
  }), [xt, na] = p(!1), [ra, sa] = p(null), ia = Ha(
    Mt(Va, { activationConstraint: { distance: 6 } })
  );
  ae(() => {
    !y && r === "create" && L(tn(C));
  }, [C, y, r]), ae(() => {
    const B = Kt();
    let E = !1;
    const U = B.contentTypes.find((W) => W.slug === N)?.detailTemplate;
    return E || (sa(U ?? null), na(U ? B.templates.find((W) => W.id === U && W.kind === "detail")?.sectionsEnabled === !0 : !1)), () => {
      E = !0;
    };
  }, [N]);
  function la(B) {
    b(!0), L(B);
  }
  function oa(B) {
    const { active: E, over: U } = B;
    !U || E.id === U.id || pe((W) => {
      const yt = W.indexOf(String(E.id)), an = W.indexOf(String(U.id));
      return yt === -1 || an === -1 ? W : mt(W, yt, an);
    });
  }
  function ca(B) {
    B.preventDefault(), h({}), I(null);
    const E = X.split(",").map((W) => W.trim()).filter((W) => W.length > 0), U = {
      title: C,
      type: N,
      status: P
    };
    $.trim() && (U.excerpt = $), K.trim() && (U.description = K), V.trim() && (U.metaTitle = V), G.trim() && (U.metaDescription = G), J.trim() && (U.featuredImage = J), T && (U.slug = T), E.length > 0 && (U.tags = E), S.length > 0 && (U.categoryIds = S), Object.keys(oe).length > 0 && (U.customFieldValues = oe), xe.length > 0 && (U.sections = xe.map((W) => {
      const yt = { ...W };
      return Reflect.deleteProperty(yt, "_instanceId"), yt;
    })), H.length > 0 && (U.gallery = H), P === "published" && z && (U.publishedAt = z), d(async () => {
      let W;
      r === "edit" && t ? W = await ot(`/api/admin/posts/${t.id}`, U) : W = await _e("/api/admin/posts", U), W.success ? (q.success(r === "edit" ? "update" : "create", N), Ke(`/admin/posts/${N}`)) : W.errors && Object.keys(W.errors).length > 0 ? (h(W.errors), q.error(W.message)) : (I(W.message), q.error(W.message));
    });
  }
  return /* @__PURE__ */ n("form", { onSubmit: ca, className: "", children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: i || "Projects",
        actions: /* @__PURE__ */ n("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(w, { type: "submit", disabled: o, children: o ? r === "edit" ? "Saving…" : "Creating…" : r === "edit" ? "Save Changes" : `Create ${N.charAt(0).toUpperCase() + N.slice(1)}` }),
          /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "outline",
              onClick: () => Ke("/admin/posts"),
              disabled: o,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "p-4 space-y-4", children: /* @__PURE__ */ n("div", { className: "space-y-4", children: [
      M && /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: M }),
      /* @__PURE__ */ n("div", { className: "grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]", children: [
        /* @__PURE__ */ n("div", { className: "space-y-4", children: [
          /* @__PURE__ */ n(Ne, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(we, { className: "", children: /* @__PURE__ */ n(Ce, { className: "text-base", children: [
              N.charAt(0).toUpperCase() + N.slice(1),
              " Details"
            ] }) }),
            /* @__PURE__ */ n(ke, { className: "space-y-5", children: [
              /* @__PURE__ */ n("div", { className: "space-y-5", children: [
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { htmlFor: "title", children: "Title" }),
                  /* @__PURE__ */ e(
                    F,
                    {
                      id: "title",
                      value: C,
                      onChange: (B) => c(B.target.value),
                      placeholder: `${N.charAt(0).toUpperCase() + N.slice(1)} title`,
                      "aria-invalid": !!u.title,
                      "aria-describedby": u.title ? "title-error" : void 0
                    }
                  ),
                  u.title && /* @__PURE__ */ e("p", { id: "title-error", className: "text-xs text-destructive", children: u.title[0] })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { htmlFor: "slug", children: "Slug" }),
                  /* @__PURE__ */ e(
                    F,
                    {
                      id: "slug",
                      value: T,
                      onChange: (B) => la(B.target.value),
                      placeholder: `${N}-url-slug`,
                      "aria-invalid": !!u.slug,
                      "aria-describedby": u.slug ? "slug-error" : void 0
                    }
                  ),
                  u.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: u.slug[0] }),
                  !y && r === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from title. Edit to customize." })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5 md:col-span-2", children: [
                  /* @__PURE__ */ e(A, { htmlFor: "excerpt", children: "Excerpt" }),
                  /* @__PURE__ */ e(
                    Ue,
                    {
                      id: "excerpt",
                      value: $,
                      onChange: (B) => j(B.target.value),
                      placeholder: `Brief summary of the ${N}...`,
                      rows: 3,
                      "aria-invalid": !!u.excerpt,
                      "aria-describedby": u.excerpt ? "excerpt-error" : void 0
                    }
                  ),
                  u.excerpt && /* @__PURE__ */ e("p", { id: "excerpt-error", className: "text-xs text-destructive", children: u.excerpt[0] })
                ] })
              ] }),
              /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(A, { children: "Content" }),
                /* @__PURE__ */ e(
                  Ra,
                  {
                    fallback: /* @__PURE__ */ e("div", { className: "min-h-64 rounded-sm border bg-muted/20", "aria-busy": "true" }),
                    children: /* @__PURE__ */ e(
                      lo,
                      {
                        content: K,
                        onChange: ne,
                        placeholder: `Write your ${N} content here...`
                      }
                    )
                  }
                ),
                u.description && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.description[0] })
              ] }),
              /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(A, { htmlFor: "gallery", children: "Gallery" }),
                /* @__PURE__ */ n("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4 space-y-3", children: [
                  /* @__PURE__ */ e(
                    Re,
                    {
                      value: H[0] ?? null,
                      onChange: (B) => {
                        if (!B) {
                          pe([]);
                          return;
                        }
                        pe((E) => [B.url, ...E.filter((U) => U !== B.url)]);
                      },
                      onSelect: (B) => {
                        pe((E) => {
                          const U = [...E];
                          for (const W of B)
                            U.includes(W.url) || U.push(W.url);
                          return U;
                        });
                      },
                      accept: "image/*",
                      multiple: !0,
                      maxFiles: 20,
                      trigger: /* @__PURE__ */ e(w, { type: "button", variant: "outline", className: "gap-2", children: "Add Media" })
                    }
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Add multiple images and reorder them visually. Stored as JSON." }),
                  H.length > 0 && /* @__PURE__ */ e(
                    Ga,
                    {
                      sensors: ia,
                      collisionDetection: qa,
                      onDragEnd: oa,
                      children: /* @__PURE__ */ e(jt, { items: H, strategy: is, children: /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2", children: H.map((B) => /* @__PURE__ */ e(
                        oo,
                        {
                          url: B,
                          onRemove: () => pe((E) => E.filter((U) => U !== B))
                        },
                        B
                      )) }) })
                    }
                  )
                ] }),
                u.gallery && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.gallery[0] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ n(Ne, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(we, { className: "", children: /* @__PURE__ */ e(Ce, { className: "text-base", children: "SEO" }) }),
            /* @__PURE__ */ n(ke, { className: "space-y-5", children: [
              /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(A, { htmlFor: "metaTitle", children: "Meta Title" }),
                /* @__PURE__ */ e(
                  F,
                  {
                    id: "metaTitle",
                    value: V,
                    onChange: (B) => R(B.target.value),
                    placeholder: "SEO title (max 60 characters)",
                    maxLength: 60,
                    "aria-invalid": !!u.metaTitle,
                    "aria-describedby": u.metaTitle ? "metaTitle-error" : void 0
                  }
                ),
                /* @__PURE__ */ n("div", { className: "flex justify-between", children: [
                  u.metaTitle ? /* @__PURE__ */ e("p", { id: "metaTitle-error", className: "text-xs text-destructive", children: u.metaTitle[0] }) : /* @__PURE__ */ e("span", {}),
                  /* @__PURE__ */ n("span", { className: "text-xs text-muted-foreground", children: [
                    V.length,
                    "/60"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(A, { htmlFor: "metaDescription", children: "Meta Description" }),
                /* @__PURE__ */ e(
                  Ue,
                  {
                    id: "metaDescription",
                    value: G,
                    onChange: (B) => re(B.target.value),
                    placeholder: "SEO description (max 160 characters)",
                    maxLength: 160,
                    rows: 4,
                    "aria-invalid": !!u.metaDescription,
                    "aria-describedby": u.metaDescription ? "metaDescription-error" : void 0
                  }
                ),
                /* @__PURE__ */ n("div", { className: "flex justify-between", children: [
                  u.metaDescription ? /* @__PURE__ */ e("p", { id: "metaDescription-error", className: "text-xs text-destructive", children: u.metaDescription[0] }) : /* @__PURE__ */ e("span", {}),
                  /* @__PURE__ */ n("span", { className: "text-xs text-muted-foreground", children: [
                    G.length,
                    "/160"
                  ] })
                ] })
              ] })
            ] })
          ] }),
          xt && /* @__PURE__ */ n(Ne, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(we, { className: "", children: /* @__PURE__ */ e(Ce, { className: "text-base", children: "Sections" }) }),
            /* @__PURE__ */ n(ke, { className: "", children: [
              /* @__PURE__ */ e(
                hr,
                {
                  embeddedSections: xe,
                  onChange: vt
                }
              ),
              u.sections && /* @__PURE__ */ e("p", { className: "text-xs text-destructive mt-2", children: u.sections[0] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-4", children: [
          /* @__PURE__ */ n(Ne, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(we, { children: /* @__PURE__ */ e(Ce, { className: "text-base", children: "Visibility" }) }),
            /* @__PURE__ */ n(ke, { className: "space-y-3", children: [
              /* @__PURE__ */ n(
                io,
                {
                  value: P,
                  onValueChange: (B) => {
                    O(B), v(null);
                  },
                  "aria-label": "Visibility",
                  className: "gap-2",
                  children: [
                    /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ e(
                        zn,
                        {
                          id: "visibility-published",
                          value: "published",
                          disabled: !f
                        }
                      ),
                      /* @__PURE__ */ e(A, { htmlFor: "visibility-published", className: "text-sm font-normal", children: "Publish" })
                    ] }),
                    /* @__PURE__ */ n("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ e(
                        zn,
                        {
                          id: "visibility-draft",
                          value: "draft",
                          disabled: !x
                        }
                      ),
                      /* @__PURE__ */ e(A, { htmlFor: "visibility-draft", className: "text-sm font-normal", children: "Draft" })
                    ] })
                  ]
                }
              ),
              _ ? /* @__PURE__ */ n("div", { className: "ml-6 flex items-start justify-between gap-2 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ n("span", { children: [
                  "Will publish on ",
                  new Date(z).toLocaleString()
                ] }),
                /* @__PURE__ */ n("div", { className: "flex", children: [
                  /* @__PURE__ */ e(
                    w,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "icon-sm",
                      "aria-label": "Edit publish date",
                      disabled: !f,
                      onClick: () => g(!0),
                      children: /* @__PURE__ */ e(Hn, {})
                    }
                  ),
                  /* @__PURE__ */ e(
                    w,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "icon-sm",
                      "aria-label": "Remove publish date",
                      disabled: !x,
                      onClick: () => {
                        O("draft"), v(null);
                      },
                      children: /* @__PURE__ */ e(ye, {})
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ e(
                w,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  className: "ml-6",
                  disabled: !f,
                  onClick: () => g(!0),
                  children: "Schedule publish"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ n(Ne, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(we, { children: /* @__PURE__ */ e(Ce, { className: "text-base", children: "Image" }) }),
            /* @__PURE__ */ n(ke, { className: "space-y-5", children: [
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ n("div", { className: "flex items-start gap-4", children: [
                J ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: he(J) ?? void 0,
                    alt: "Featured image preview",
                    className: "object-cover h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No image" }),
                /* @__PURE__ */ n("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Re,
                    {
                      value: J,
                      onChange: (B) => {
                        ee(B ? B.url : "");
                      },
                      accept: "image/*"
                    },
                    J || "empty"
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose a hero image from the media library." }),
                  J && /* @__PURE__ */ e(
                    w,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "aria-label": "Remove image",
                      className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                      onClick: () => ee(""),
                      children: "Remove"
                    }
                  )
                ] })
              ] }) }),
              u.featuredImage && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.featuredImage[0] })
            ] })
          ] }),
          /* @__PURE__ */ n(Ne, { className: "overflow-visible border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(we, { children: /* @__PURE__ */ e(Ce, { className: "text-base", children: "Organization" }) }),
            /* @__PURE__ */ n(ke, { className: "flex flex-col gap-5", children: [
              /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(A, { htmlFor: "tags", children: "Tags" }),
                /* @__PURE__ */ e(
                  F,
                  {
                    id: "tags",
                    value: X,
                    onChange: (B) => ve(B.target.value),
                    placeholder: "tag1, tag2, tag3 (comma-separated)",
                    "aria-invalid": !!u.tags,
                    "aria-describedby": u.tags ? "tags-error" : void 0
                  }
                ),
                u.tags && /* @__PURE__ */ e("p", { id: "tags-error", className: "text-xs text-destructive", children: u.tags[0] }),
                X && /* @__PURE__ */ e("div", { className: "flex flex-wrap gap-1 mt-1", children: X.split(",").map((B) => B.trim()).filter((B) => B.length > 0).map((B, E) => /* @__PURE__ */ e($e, { variant: "outline", className: "text-xs", children: B }, E)) })
              ] }),
              /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(A, { children: "Categories" }),
                a.length > 0 ? /* @__PURE__ */ e(
                  so,
                  {
                    options: a.map((B) => ({
                      value: B.id,
                      label: B.name
                    })),
                    selected: S,
                    onChange: D,
                    placeholder: "Select categories..."
                  }
                ) : /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No categories available. Create categories first." }),
                u.categoryIds && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.categoryIds[0] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ n(Ne, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(we, { children: /* @__PURE__ */ e(Ce, { className: "text-base", children: "Custom fields" }) }),
            /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(Jl, { detailTemplate: ra, values: oe, onChange: le }) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ e(Ze, { open: m, onOpenChange: g, children: /* @__PURE__ */ n(et, { children: [
      /* @__PURE__ */ e(tt, { children: /* @__PURE__ */ e(at, { children: "Set visibility date" }) }),
      /* @__PURE__ */ n("div", { className: "space-y-2", children: [
        /* @__PURE__ */ e(A, { htmlFor: "published-at", children: "Publication date" }),
        /* @__PURE__ */ e(
          F,
          {
            id: "published-at",
            type: "datetime-local",
            value: z ? new Date(z - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "",
            onChange: (B) => v(B.target.value ? new Date(B.target.value).getTime() : null)
          }
        )
      ] }),
      /* @__PURE__ */ n(bt, { children: [
        /* @__PURE__ */ e(w, { type: "button", variant: "outline", onClick: () => g(!1), children: "Cancel" }),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            disabled: !z,
            onClick: () => {
              O("published"), g(!1);
            },
            children: "Set visibility date"
          }
        )
      ] })
    ] }) })
  ] });
}
function oo({
  url: t,
  onRemove: a
}) {
  const { attributes: r, listeners: i, setNodeRef: s, transform: l, transition: o, isDragging: d } = Ft({ id: t });
  return /* @__PURE__ */ n(
    "div",
    {
      ref: s,
      style: {
        transform: Bt.Transform.toString(l),
        transition: o
      },
      className: `overflow-hidden rounded-sm border bg-muted ${d ? "opacity-60" : ""}`,
      children: [
        /* @__PURE__ */ n("div", { className: "flex items-center justify-between border-b bg-background/70 px-2 py-1", children: [
          /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "ghost",
              size: "icon-sm",
              className: "cursor-grab text-muted-foreground hover:text-foreground",
              "aria-label": "Drag to reorder",
              ...r,
              ...i,
              children: /* @__PURE__ */ e(Ot, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ e(w, { type: "button", variant: "ghost", size: "icon-sm", onClick: a, children: /* @__PURE__ */ e(ye, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ e("div", { className: "relative aspect-square", children: /* @__PURE__ */ e("img", { src: he(t) ?? void 0, alt: "Gallery image", className: "object-cover h-full w-full" }) })
      ]
    }
  );
}
function co() {
  const { type: t = "post" } = Ve(), [a, r] = p([]), [i, s] = p(!0);
  return ae(() => {
    const l = new URLSearchParams();
    l.set("type", t), fe(`/api/admin/categories?${l.toString()}`).then((o) => {
      r(o), s(!1);
    });
  }, [t]), i ? /* @__PURE__ */ e(be, {}) : /* @__PURE__ */ e(Pe, { children: /* @__PURE__ */ e(
    gr,
    {
      mode: "create",
      categories: a,
      pageTitle: `Create ${t.charAt(0).toUpperCase() + t.slice(1)}`,
      defaultType: t
    }
  ) });
}
function uo({ id: t }) {
  const { type: a = "post" } = Ve(), [r, i] = p(null), [s, l] = p([]), [o, d] = p(!0);
  return ae(() => {
    Promise.all([
      fe(`/api/admin/posts/${t}`),
      fe("/api/admin/categories")
    ]).then(([u, h]) => {
      i(u), l(h), d(!1);
    });
  }, [t]), o ? /* @__PURE__ */ e(be, {}) : r ? /* @__PURE__ */ e(Pe, { children: /* @__PURE__ */ e(
    gr,
    {
      mode: "edit",
      post: r,
      categories: s,
      pageTitle: `Edit ${a.charAt(0).toUpperCase() + a.slice(1)}`,
      defaultType: a
    }
  ) }) : /* @__PURE__ */ n("main", { className: "p-6", children: [
    a.charAt(0).toUpperCase() + a.slice(1),
    " not found."
  ] });
}
const pr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminPostCreatePage: co,
  AdminPostEditPage: uo
}, Symbol.toStringTag, { value: "Module" }));
function mo() {
  return /* @__PURE__ */ e(
    nr,
    {
      contentType: "page",
      pageTitle: "Pages",
      createMode: "dialog"
    }
  );
}
const ho = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminContentListPage: mo
}, Symbol.toStringTag, { value: "Module" })), go = ie(async () => ({ default: (await Promise.resolve().then(() => vr)).TiptapEditor }));
function po(t) {
  if (!t) return [];
  try {
    const a = JSON.parse(t);
    return Array.isArray(a) ? a.map((r) => ({
      ...r,
      _instanceId: r._instanceId || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    })) : [];
  } catch {
    return [];
  }
}
function fr({ page: t, mode: a }) {
  const [r, i] = St(), [s, l] = p({}), [o, d] = p(null), [u, h] = p(!1), [M, I] = p(t?.title ?? ""), [C, c] = p(t?.slug ?? ""), [P, O] = p(!!t?.slug), [z, v] = p(t?.description ?? ""), [m, g] = p(
    () => po(t?.sections)
  );
  ae(() => {
    !P && a === "create" && c(tn(M));
  }, [M, P, a]);
  function _(T) {
    T.preventDefault(), l({}), d(null);
    const L = {
      title: M,
      type: "page",
      status: t?.status ?? "draft"
    };
    C && (L.slug = C), z.trim() && (L.description = z), m.length > 0 && (L.sections = m.map((y) => {
      const b = { ...y };
      return Reflect.deleteProperty(b, "_instanceId"), b;
    })), i(async () => {
      const y = a === "edit" && t ? await ot(`/api/admin/posts/${t.id}`, L) : await _e("/api/admin/posts", L);
      if (y.success) {
        q.success(a === "edit" ? "update" : "create", "post"), Ke("/admin/posts/page");
        return;
      }
      y.errors && Object.keys(y.errors).length > 0 ? l(y.errors) : d(y.message), q.error(y.message);
    });
  }
  return /* @__PURE__ */ n("form", { onSubmit: _, className: "", children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: a === "edit" ? "Edit Page" : "Create Page",
        actions: /* @__PURE__ */ n("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(w, { type: "submit", disabled: r, children: r ? a === "edit" ? "Saving…" : "Creating…" : a === "edit" ? "Save Changes" : "Create Page" }),
          /* @__PURE__ */ n(Ze, { open: u, onOpenChange: h, children: [
            /* @__PURE__ */ e(
              Pt,
              {
                render: /* @__PURE__ */ n(w, { type: "button", variant: "outline", disabled: r, children: [
                  /* @__PURE__ */ e(Ua, {}),
                  "Settings"
                ] })
              }
            ),
            /* @__PURE__ */ n(et, { className: "sm:max-w-2xl", showCloseButton: !1, children: [
              /* @__PURE__ */ e(tt, { children: /* @__PURE__ */ e(at, { children: "Page Details" }) }),
              /* @__PURE__ */ n("div", { className: "space-y-5", children: [
                /* @__PURE__ */ n("div", { className: "grid gap-5", children: [
                  /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                    /* @__PURE__ */ e(A, { htmlFor: "title", children: "Title" }),
                    /* @__PURE__ */ e(F, { id: "title", value: M, onChange: (T) => I(T.target.value), placeholder: "Page title", "aria-invalid": !!s.title, "aria-describedby": s.title ? "title-error" : void 0 }),
                    s.title && /* @__PURE__ */ e("p", { id: "title-error", className: "text-xs text-destructive", children: s.title[0] })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                    /* @__PURE__ */ e(A, { htmlFor: "slug", children: "Slug" }),
                    /* @__PURE__ */ e(F, { id: "slug", value: C, onChange: (T) => {
                      O(!0), c(T.target.value);
                    }, placeholder: "page-url-slug", "aria-invalid": !!s.slug, "aria-describedby": s.slug ? "slug-error" : void 0 }),
                    s.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: s.slug[0] }),
                    !P && a === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from title. Edit to customize." })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(A, { children: "Content" }),
                  /* @__PURE__ */ e(Ra, { fallback: /* @__PURE__ */ e("div", { className: "min-h-64 rounded-sm border bg-muted/20", "aria-busy": "true" }), children: /* @__PURE__ */ e(go, { content: z, onChange: v, placeholder: "Write your page content here..." }) }),
                  s.description && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: s.description[0] })
                ] })
              ] }),
              /* @__PURE__ */ e(bt, { children: /* @__PURE__ */ e(il, { render: /* @__PURE__ */ e(w, { type: "button", variant: "outline" }), children: "Done" }) })
            ] })
          ] }),
          /* @__PURE__ */ e(w, { type: "button", variant: "outline", onClick: () => Ke("/admin/posts/page"), disabled: r, children: "Cancel" })
        ] })
      }
    ),
    /* @__PURE__ */ n("div", { className: "space-y-4 p-4", children: [
      o && /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: o }),
      /* @__PURE__ */ n(Ne, { className: "overflow-hidden border-border/60 shadow-sm", children: [
        /* @__PURE__ */ e(we, { children: /* @__PURE__ */ e(Ce, { className: "text-base", children: "Sections" }) }),
        /* @__PURE__ */ n(ke, { className: "", children: [
          /* @__PURE__ */ e(hr, { embeddedSections: m, onChange: g }),
          s.sections && /* @__PURE__ */ e("p", { className: "mt-2 text-xs text-destructive", children: s.sections[0] })
        ] })
      ] })
    ] })
  ] });
}
function fo() {
  return /* @__PURE__ */ e(fr, { mode: "create" });
}
function bo({ id: t }) {
  const [a, r] = p(null), [i, s] = p(!0);
  return ae(() => {
    fe(`/api/admin/posts/${t}`).then((l) => {
      r(l), s(!1);
    });
  }, [t]), i ? /* @__PURE__ */ e(be, {}) : a ? /* @__PURE__ */ e(fr, { mode: "edit", page: a }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Page not found." });
}
const br = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminPageCreatePage: fo,
  AdminPageEditPage: bo
}, Symbol.toStringTag, { value: "Module" })), vo = Intl.supportedValuesOf?.("timeZone") ?? [
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
], xo = [
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
], yo = [
  "Monday - Friday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
], No = [
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
function wo() {
  const [t, a] = p(null), [r, i] = p(!0), [s, l] = p(!1), [o, d] = p(null);
  async function u() {
    i(!0), d(null);
    try {
      const m = await fe("/api/admin/settings");
      a(m);
    } catch (m) {
      d(m instanceof Error ? m.message : "Failed to load settings");
    } finally {
      i(!1);
    }
  }
  ae(() => {
    u();
  }, []);
  function h(m, g) {
    t && a({ ...t, [m]: g });
  }
  function M() {
    t && h("links", [
      ...t.links,
      { platform: "", url: "https://", icon: "" }
    ]);
  }
  function I(m, g, _) {
    if (!t) return;
    const T = t.links.map(
      (L, y) => y === m ? { ...L, [g]: _ } : L
    );
    h("links", T);
  }
  function C(m) {
    if (!t) return;
    const g = t.links.filter((_, T) => T !== m);
    h("links", g);
  }
  function c() {
    t && h("open_hours", [
      ...t.open_hours,
      { day: "Monday", open: "08:00", close: "17:00" }
    ]);
  }
  function P(m, g, _) {
    if (!t) return;
    const T = t.open_hours.map(
      (L, y) => y === m ? { ...L, [g]: _ } : L
    );
    h("open_hours", T);
  }
  function O(m) {
    if (!t) return;
    const g = t.open_hours.filter((_, T) => T !== m);
    h("open_hours", g);
  }
  function z(m) {
    if (!t) return;
    const g = t.translate_countries, _ = g.includes(m) ? g.filter((T) => T !== m) : [...g, m];
    h("translate_countries", _);
  }
  async function v() {
    if (t) {
      l(!0);
      try {
        const m = {
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
        }, g = await ot("/api/admin/settings", m);
        g.success ? (a(g.data), q.success("update", "settings")) : q.error(g.message);
      } catch (m) {
        q.error(m instanceof Error ? m.message : "Failed to save settings");
      } finally {
        l(!1);
      }
    }
  }
  return o ? /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ n("p", { className: "text-destructive", children: [
    "Error: ",
    o
  ] }) }) : r || !t ? /* @__PURE__ */ e(be, {}) : /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Settings",
        actions: /* @__PURE__ */ n(w, { onClick: v, disabled: s, children: [
          /* @__PURE__ */ e(Jr, { className: "size-4" }),
          s ? "Saving..." : "Save Settings"
        ] })
      }
    ),
    /* @__PURE__ */ n("div", { className: "grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]", children: [
      /* @__PURE__ */ n(
        Fe,
        {
          title: "General",
          description: "Basic site information",
          className: "lg:col-start-1 lg:row-start-1",
          children: [
            /* @__PURE__ */ n("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ n("div", { className: "space-y-2", children: [
                /* @__PURE__ */ e(A, { htmlFor: "title", children: "Site Title" }),
                /* @__PURE__ */ e(
                  F,
                  {
                    id: "title",
                    value: t.title,
                    onChange: (m) => h("title", m.target.value),
                    placeholder: "My Website"
                  }
                )
              ] }),
              /* @__PURE__ */ n("div", { className: "space-y-2", children: [
                /* @__PURE__ */ e(A, { htmlFor: "timezone", children: "Timezone" }),
                /* @__PURE__ */ n(ce, { value: t.timezone, onValueChange: (m) => m && h("timezone", m), children: [
                  /* @__PURE__ */ e(ue, { id: "timezone", children: /* @__PURE__ */ e(de, { placeholder: "Select timezone" }) }),
                  /* @__PURE__ */ e(me, { children: vo.map((m) => /* @__PURE__ */ e(Z, { value: m, children: m }, m)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-2 mt-4", children: [
              /* @__PURE__ */ e(A, { htmlFor: "description", children: "Site Description" }),
              /* @__PURE__ */ e(
                Ue,
                {
                  id: "description",
                  value: t.description,
                  onChange: (m) => h("description", m.target.value),
                  placeholder: "A short description of your site",
                  rows: 3
                }
              )
            ] }),
            /* @__PURE__ */ n("div", { className: "flex items-center gap-2 mt-4", children: [
              /* @__PURE__ */ e(
                We,
                {
                  id: "maintenance_mode",
                  checked: t.maintenance_mode,
                  onCheckedChange: (m) => h("maintenance_mode", m === !0)
                }
              ),
              /* @__PURE__ */ e(A, { htmlFor: "maintenance_mode", className: "cursor-pointer", children: "Maintenance Mode (site shows maintenance page to visitors)" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e(
        Fe,
        {
          title: "SEO & Meta",
          description: "Search engine optimization settings",
          className: "lg:col-start-1 lg:row-start-3",
          children: /* @__PURE__ */ n("div", { className: "space-y-4", children: [
            /* @__PURE__ */ n("div", { className: "space-y-2", children: [
              /* @__PURE__ */ e(A, { htmlFor: "meta_title", children: "Meta Title" }),
              /* @__PURE__ */ e(
                F,
                {
                  id: "meta_title",
                  value: t.meta_title,
                  onChange: (m) => h("meta_title", m.target.value),
                  placeholder: "Page title shown in browser tab"
                }
              )
            ] }),
            /* @__PURE__ */ n("div", { className: "space-y-2", children: [
              /* @__PURE__ */ e(A, { htmlFor: "meta_description", children: "Meta Description" }),
              /* @__PURE__ */ e(
                Ue,
                {
                  id: "meta_description",
                  value: t.meta_description,
                  onChange: (m) => h("meta_description", m.target.value),
                  placeholder: "Brief page description for search engines",
                  rows: 3
                }
              )
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Fe,
        {
          title: "Branding",
          description: "Logo and favicon",
          className: "lg:col-start-1 lg:row-start-2",
          children: /* @__PURE__ */ n("div", { className: "space-y-6", children: [
            /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ e(A, { children: "Logo" }),
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ n("div", { className: "flex items-start gap-4", children: [
                t.logo ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: he(t.logo) ?? void 0,
                    alt: "Logo preview",
                    className: "object-contain h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No logo" }),
                /* @__PURE__ */ n("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Re,
                    {
                      value: t.logo || null,
                      onChange: (m) => {
                        h("logo", m ? m.url : "");
                      },
                      accept: "image/*"
                    },
                    t.logo || "logo-empty"
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose a logo from the media library. Recommended: PNG or SVG." }),
                  t.logo && /* @__PURE__ */ e(
                    w,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "aria-label": "Remove logo",
                      className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                      onClick: () => h("logo", ""),
                      children: "Remove"
                    }
                  )
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ n("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ e(A, { children: "Favicon" }),
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ n("div", { className: "flex items-start gap-4", children: [
                t.favicon ? /* @__PURE__ */ e("div", { className: "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: he(t.favicon) ?? void 0,
                    alt: "Favicon preview",
                    className: "object-contain h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No icon" }),
                /* @__PURE__ */ n("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Re,
                    {
                      value: t.favicon || null,
                      onChange: (m) => {
                        h("favicon", m ? m.url : "");
                      },
                      accept: "image/*"
                    },
                    t.favicon || "favicon-empty"
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose a favicon from the media library. Recommended: ICO or PNG (32x32)." }),
                  t.favicon && /* @__PURE__ */ e(
                    w,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "aria-label": "Remove favicon",
                      className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                      onClick: () => h("favicon", ""),
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
        Fe,
        {
          title: "Social Media Links",
          description: "Links displayed in the footer or sidebar",
          className: "lg:col-span-2 lg:row-start-4",
          children: /* @__PURE__ */ n("div", { className: "space-y-3", children: [
            t.links.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No social media links added yet." }),
            t.links.map((m, g) => /* @__PURE__ */ n("div", { className: "flex items-center gap-3 p-3 border rounded-sm bg-muted/30", children: [
              /* @__PURE__ */ n("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
                /* @__PURE__ */ n("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(A, { className: "text-xs", children: "Platform" }),
                  /* @__PURE__ */ n(ce, { value: m.platform || void 0, onValueChange: (_) => _ && I(g, "platform", _), children: [
                    /* @__PURE__ */ e(ue, { children: /* @__PURE__ */ e(de, { placeholder: "Select platform..." }) }),
                    /* @__PURE__ */ e(me, { children: xo.map((_) => /* @__PURE__ */ e(Z, { value: _, children: _ }, _)) })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(A, { className: "text-xs", children: "URL" }),
                  /* @__PURE__ */ e(
                    F,
                    {
                      value: m.url,
                      onChange: (_) => I(g, "url", _.target.value),
                      placeholder: "https://..."
                    }
                  )
                ] }),
                /* @__PURE__ */ n("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(A, { className: "text-xs", children: "Icon Class (optional)" }),
                  /* @__PURE__ */ e(
                    F,
                    {
                      value: m.icon ?? "",
                      onChange: (_) => I(g, "icon", _.target.value),
                      placeholder: "e.g. icon-facebook"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ e(
                w,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => C(g),
                  className: "shrink-0 text-destructive hover:text-destructive",
                  children: /* @__PURE__ */ e(ye, { className: "size-4" })
                }
              )
            ] }, g)),
            /* @__PURE__ */ n(w, { variant: "outline", size: "sm", onClick: M, children: [
              /* @__PURE__ */ e(Ie, { className: "size-3" }),
              " Add Social Link"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Fe,
        {
          title: "Open Hours",
          description: "Business or office operating hours",
          className: "lg:col-span-2 lg:row-start-5",
          children: /* @__PURE__ */ n("div", { className: "space-y-3", children: [
            t.open_hours.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No open hours added yet." }),
            t.open_hours.map((m, g) => /* @__PURE__ */ n(
              "div",
              {
                className: "flex items-center gap-3 p-3 border rounded-sm bg-muted/30",
                children: [
                  /* @__PURE__ */ n("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
                    /* @__PURE__ */ n("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(A, { className: "text-xs", children: "Day" }),
                      /* @__PURE__ */ n(ce, { value: m.day, onValueChange: (_) => _ && P(g, "day", _), children: [
                        /* @__PURE__ */ e(ue, { children: /* @__PURE__ */ e(de, {}) }),
                        /* @__PURE__ */ e(me, { children: yo.map((_) => /* @__PURE__ */ e(Z, { value: _, children: _ }, _)) })
                      ] })
                    ] }),
                    /* @__PURE__ */ n("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(A, { className: "text-xs", children: "Open Time" }),
                      /* @__PURE__ */ e(
                        F,
                        {
                          type: "time",
                          value: m.open,
                          onChange: (_) => P(g, "open", _.target.value)
                        }
                      )
                    ] }),
                    /* @__PURE__ */ n("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(A, { className: "text-xs", children: "Close Time" }),
                      /* @__PURE__ */ e(
                        F,
                        {
                          type: "time",
                          value: m.close,
                          onChange: (_) => P(g, "close", _.target.value)
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ e(
                    w,
                    {
                      variant: "ghost",
                      size: "icon",
                      onClick: () => O(g),
                      className: "shrink-0 text-destructive hover:text-destructive",
                      children: /* @__PURE__ */ e(ye, { className: "size-4" })
                    }
                  )
                ]
              },
              g
            )),
            /* @__PURE__ */ n(w, { variant: "outline", size: "sm", onClick: c, children: [
              /* @__PURE__ */ e(Ie, { className: "size-3" }),
              " Add Hours"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Fe,
        {
          title: "Email Notifications",
          description: "Email addresses to receive notifications (separate with comma)",
          className: "lg:col-start-2 lg:row-start-1",
          children: /* @__PURE__ */ n("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(A, { htmlFor: "email_notifications", children: "Recipient Emails" }),
            /* @__PURE__ */ e(
              F,
              {
                id: "email_notifications",
                value: t.email_notifications.join(", "),
                onChange: (m) => {
                  const g = m.target.value.split(",").map((_) => _.trim()).filter(Boolean);
                  h("email_notifications", g);
                },
                placeholder: "admin@example.com, editor@example.com"
              }
            ),
            /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Separate multiple emails with commas." })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Fe,
        {
          title: "Google Translate",
          description: "Languages available for Google Translate widget",
          className: "lg:col-start-2 lg:row-start-2",
          children: /* @__PURE__ */ n("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Select which languages to include in the Google Translate dropdown. Leave empty to disable." }),
            /* @__PURE__ */ e("div", { className: "max-h-64 overflow-y-auto border rounded-sm p-3", children: /* @__PURE__ */ e("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: No.map((m) => /* @__PURE__ */ n(
              "label",
              {
                className: "flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded-sm px-2 py-1",
                children: [
                  /* @__PURE__ */ e(
                    We,
                    {
                      checked: t.translate_countries.includes(m.code),
                      onCheckedChange: () => z(m.code)
                    }
                  ),
                  m.name,
                  " (",
                  m.code,
                  ")"
                ]
              },
              m.code
            )) }) }),
            /* @__PURE__ */ n("p", { className: "text-xs text-muted-foreground", children: [
              t.translate_countries.length,
              " language",
              t.translate_countries.length !== 1 ? "s" : "",
              " selected"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Fe,
        {
          title: "Custom CSS",
          description: "Custom styles added site-wide",
          className: "lg:col-span-2 lg:row-start-6",
          children: /* @__PURE__ */ n("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(A, { htmlFor: "custom_css", children: "CSS Code" }),
            /* @__PURE__ */ e(
              Ue,
              {
                id: "custom_css",
                value: t.custom_css,
                onChange: (m) => h("custom_css", m.target.value),
                placeholder: "/* Add your custom CSS here */",
                rows: 8,
                className: "font-mono text-sm"
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Fe,
        {
          title: "Custom JavaScript",
          description: "Custom scripts added before closing body tag",
          className: "lg:col-span-2 lg:row-start-7",
          children: /* @__PURE__ */ n("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(A, { htmlFor: "custom_javascript", children: "JavaScript Code" }),
            /* @__PURE__ */ e(
              Ue,
              {
                id: "custom_javascript",
                value: t.custom_javascript,
                onChange: (m) => h("custom_javascript", m.target.value),
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
const Co = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminSettingsPage: wo
}, Symbol.toStringTag, { value: "Module" })), ko = [
  ["all", "All resources"],
  ["auth", "Authentication"],
  ["profile", "Profile"],
  ["post", "Posts"],
  ["category", "Categories"],
  ["user", "Users"],
  ["media", "Media"],
  ["menu", "Menus"],
  ["settings", "Settings"]
], So = [
  ["all", "All actions"],
  ["login", "Login"],
  ["login_2fa", "2FA login"],
  ["logout", "Logout"],
  ["create", "Create"],
  ["update", "Update"],
  ["delete", "Delete"],
  ["duplicate", "Duplicate"],
  ["publish", "Publish"],
  ["unpublish", "Unpublish"],
  ["upload", "Upload"],
  ["reorder", "Reorder"],
  ["setup_2fa", "Setup 2FA"],
  ["enable_2fa", "Enable 2FA"],
  ["disable_2fa", "Disable 2FA"],
  ["bulk_create", "Bulk create"],
  ["bulk_update", "Bulk update"],
  ["bulk_delete", "Bulk delete"],
  ["bulk_duplicate", "Bulk duplicate"],
  ["bulk_publish", "Bulk publish"],
  ["bulk_unpublish", "Bulk unpublish"],
  ["bulk_status", "Bulk status"],
  ["publish_scheduled", "Scheduled publish"]
];
function ya(t) {
  return t.split("_").map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(" ");
}
function Tn(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function In(t) {
  return t.actorName || t.actorEmail || "Unknown actor";
}
function Ao(t) {
  return !!(t && typeof t == "object" && !Array.isArray(t) && "before" in t && "after" in t);
}
function Dn(t) {
  const a = t.metadata?.changes;
  return !a || typeof a != "object" || Array.isArray(a) ? [] : Object.entries(a).filter(([, r]) => Ao(r));
}
function Na(t) {
  return t === null ? "—" : typeof t == "string" ? t || "(empty)" : typeof t == "object" ? JSON.stringify(t, null, 2) : String(t);
}
function En(t) {
  return Object.entries(t.metadata ?? {}).filter(([a]) => a !== "changes" && a !== "path");
}
function _o() {
  const [t, a] = p(null), [r, i] = p(null), [s, l] = p(null), o = pt(), d = Je(), {
    filters: u,
    setFilter: h,
    handleKeyDown: M,
    buildPageUrl: I
  } = Tt({
    locationSearch: o.search,
    navigate: d,
    path: "/admin/activity-log",
    defaults: {
      search: "",
      action: "all",
      resource: "all",
      success: "all",
      from: "",
      to: ""
    },
    debounceKeys: ["search", "action", "resource", "success", "from", "to"]
  });
  async function C() {
    i(null);
    const c = zt(u, {
      page: Ya(o.search),
      perPage: 10
    }).toString(), P = await fe(
      `/api/admin/activity-logs${c ? `?${c}` : ""}`
    );
    a(P);
  }
  return ae(() => {
    C().catch((c) => {
      i(c instanceof Error ? c.message : "Failed to load activity log");
    });
  }, [o.search]), r ? /* @__PURE__ */ e(Zt, { message: r }) : t ? /* @__PURE__ */ n(Qe, { children: [
    /* @__PURE__ */ e(
      Te,
      {
        title: "Activity Log",
        search: /* @__PURE__ */ e(
          F,
          {
            placeholder: "Search activity...",
            value: u.search,
            onChange: (c) => h("search", c.target.value),
            onKeyDown: M,
            className: "max-w-xs"
          }
        )
      }
    ),
    /* @__PURE__ */ n("div", { className: "space-y-4 p-4", children: [
      /* @__PURE__ */ n("div", { className: "flex flex-wrap items-end gap-3", children: [
        /* @__PURE__ */ n("div", { className: "space-y-1", children: [
          /* @__PURE__ */ e(A, { htmlFor: "activity-resource-filter", className: "text-xs text-muted-foreground", children: "Resource" }),
          /* @__PURE__ */ n(ce, { value: u.resource, onValueChange: (c) => {
            c && h("resource", c);
          }, children: [
            /* @__PURE__ */ e(ue, { id: "activity-resource-filter", className: "w-[160px]", children: /* @__PURE__ */ e(de, { placeholder: "Resource" }) }),
            /* @__PURE__ */ e(me, { children: ko.map(([c, P]) => /* @__PURE__ */ e(Z, { value: c, children: P }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-1", children: [
          /* @__PURE__ */ e(A, { htmlFor: "activity-action-filter", className: "text-xs text-muted-foreground", children: "Action" }),
          /* @__PURE__ */ n(ce, { value: u.action, onValueChange: (c) => {
            c && h("action", c);
          }, children: [
            /* @__PURE__ */ e(ue, { id: "activity-action-filter", className: "w-[160px]", children: /* @__PURE__ */ e(de, { placeholder: "Action" }) }),
            /* @__PURE__ */ e(me, { children: So.map(([c, P]) => /* @__PURE__ */ e(Z, { value: c, children: P }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-1", children: [
          /* @__PURE__ */ e(A, { htmlFor: "activity-result-filter", className: "text-xs text-muted-foreground", children: "Result" }),
          /* @__PURE__ */ n(ce, { value: u.success, onValueChange: (c) => {
            c && h("success", c);
          }, children: [
            /* @__PURE__ */ e(ue, { id: "activity-result-filter", className: "w-[140px]", children: /* @__PURE__ */ e(de, { placeholder: "Result" }) }),
            /* @__PURE__ */ n(me, { children: [
              /* @__PURE__ */ e(Z, { value: "all", children: "All results" }),
              /* @__PURE__ */ e(Z, { value: "true", children: "Success" }),
              /* @__PURE__ */ e(Z, { value: "false", children: "Failed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-1", children: [
          /* @__PURE__ */ e(A, { htmlFor: "activity-from-filter", className: "text-xs text-muted-foreground", children: "From" }),
          /* @__PURE__ */ e(F, { id: "activity-from-filter", type: "date", value: u.from, onChange: (c) => h("from", c.target.value), className: "w-[150px]" })
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-1", children: [
          /* @__PURE__ */ e(A, { htmlFor: "activity-to-filter", className: "text-xs text-muted-foreground", children: "To" }),
          /* @__PURE__ */ e(F, { id: "activity-to-filter", type: "date", value: u.to, onChange: (c) => h("to", c.target.value), className: "w-[150px]" })
        ] })
      ] }),
      /* @__PURE__ */ n(er, { children: [
        /* @__PURE__ */ e(tr, { children: /* @__PURE__ */ n(ht, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(Ge, { className: "px-4 py-3", children: "Time" }),
          /* @__PURE__ */ e(Ge, { className: "px-4 py-3", children: "Actor" }),
          /* @__PURE__ */ e(Ge, { className: "px-4 py-3", children: "Action" }),
          /* @__PURE__ */ e(Ge, { className: "px-4 py-3", children: "Resource" }),
          /* @__PURE__ */ e(Ge, { className: "px-4 py-3", children: "Result" }),
          /* @__PURE__ */ e(Ge, { className: "px-4 py-3", children: "IP address" }),
          /* @__PURE__ */ e(Ge, { className: "px-4 py-3 text-right", children: "Details" })
        ] }) }),
        /* @__PURE__ */ e(ar, { children: t.data.length === 0 ? /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(De, { colSpan: 7, className: "px-4 py-8 text-center text-muted-foreground", children: "No activity found." }) }) : t.data.map((c) => /* @__PURE__ */ n(ht, { children: [
          /* @__PURE__ */ e(De, { className: "px-4 py-3 text-muted-foreground", children: new Date(c.createdAt * 1e3).toLocaleString() }),
          /* @__PURE__ */ n(De, { className: "px-4 py-3", children: [
            /* @__PURE__ */ e("div", { className: "font-medium", children: In(c) }),
            c.actorName && c.actorEmail ? /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground", children: c.actorEmail }) : null
          ] }),
          /* @__PURE__ */ e(De, { className: "px-4 py-3 font-medium", children: ya(c.action) }),
          /* @__PURE__ */ e(De, { className: "px-4 py-3", children: /* @__PURE__ */ e("span", { children: Tn(c.resource) }) }),
          /* @__PURE__ */ e(De, { className: "px-4 py-3", children: /* @__PURE__ */ e($e, { variant: c.success ? "outline" : "destructive", children: c.success ? "Success" : `Failed (${c.statusCode})` }) }),
          /* @__PURE__ */ e(De, { className: "px-4 py-3 text-muted-foreground", children: c.ipAddress || "Unknown" }),
          /* @__PURE__ */ e(De, { className: "px-4 py-3 text-right", children: /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "ghost",
              size: "icon-sm",
              "aria-label": `View details for ${ya(c.action)}`,
              title: "View changes",
              onClick: () => l(c),
              children: /* @__PURE__ */ e(Yr, {})
            }
          ) })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ e(Qt, { meta: t.meta, getPageUrl: I })
    ] }),
    /* @__PURE__ */ e(Ze, { open: !!s, onOpenChange: (c) => {
      c || l(null);
    }, children: /* @__PURE__ */ e(et, { className: "w-[calc(100%-1rem)] max-w-6xl sm:max-w-6xl", children: s ? /* @__PURE__ */ n(Pe, { children: [
      /* @__PURE__ */ n(tt, { children: [
        /* @__PURE__ */ e(at, { children: "Activity details" }),
        /* @__PURE__ */ n(Wt, { children: [
          ya(s.action),
          " · ",
          Tn(s.resource),
          " · ",
          new Date(s.createdAt * 1e3).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ n("div", { className: "max-h-[65vh] space-y-5 overflow-y-auto pr-1", children: [
        /* @__PURE__ */ n("div", { className: "grid gap-3 rounded-sm border bg-muted/20 p-3 text-sm sm:grid-cols-3", children: [
          /* @__PURE__ */ n("div", { children: [
            /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground", children: "Actor" }),
            /* @__PURE__ */ e("div", { className: "font-medium", children: In(s) })
          ] }),
          /* @__PURE__ */ n("div", { children: [
            /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground", children: "Resource ID" }),
            /* @__PURE__ */ e("div", { className: "break-all font-medium", children: s.resourceId || "—" })
          ] }),
          /* @__PURE__ */ n("div", { children: [
            /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground", children: "Result" }),
            /* @__PURE__ */ e($e, { variant: s.success ? "outline" : "destructive", children: s.success ? "Success" : `Failed (${s.statusCode})` })
          ] })
        ] }),
        /* @__PURE__ */ n("section", { className: "space-y-2", children: [
          /* @__PURE__ */ e("h3", { className: "text-sm font-medium", children: "Changes" }),
          Dn(s).length > 0 ? /* @__PURE__ */ n("div", { className: "overflow-hidden rounded-sm border", children: [
            /* @__PURE__ */ n("div", { className: "grid grid-cols-[minmax(120px,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground", children: [
              /* @__PURE__ */ e("span", { children: "Field" }),
              /* @__PURE__ */ e("span", { children: "Before" }),
              /* @__PURE__ */ e("span", { children: "After" })
            ] }),
            Dn(s).map(([c, P]) => /* @__PURE__ */ n("div", { className: "grid grid-cols-[minmax(120px,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b px-3 py-3 last:border-b-0", children: [
              /* @__PURE__ */ e("span", { className: "break-words text-sm font-medium", children: c }),
              /* @__PURE__ */ e("pre", { className: "max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-red-50 p-2 text-xs text-red-900 dark:bg-red-500/10 dark:text-red-200", children: Na(P.before) }),
              /* @__PURE__ */ e("pre", { className: "max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-emerald-50 p-2 text-xs text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200", children: Na(P.after) })
            ] }, c))
          ] }) : /* @__PURE__ */ e("p", { className: "rounded-sm border border-dashed p-4 text-sm text-muted-foreground", children: "No change details were recorded for this entry." })
        ] }),
        En(s).length > 0 ? /* @__PURE__ */ n("section", { className: "space-y-2", children: [
          /* @__PURE__ */ e("h3", { className: "text-sm font-medium", children: "Metadata" }),
          /* @__PURE__ */ e("div", { className: "grid gap-2 rounded-sm border p-3 text-sm sm:grid-cols-2", children: En(s).map(([c, P]) => /* @__PURE__ */ n("div", { className: "min-w-0", children: [
            /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground", children: c }),
            /* @__PURE__ */ e("pre", { className: "mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs", children: Na(P) })
          ] }, c)) })
        ] }) : null
      ] })
    ] }) : null }) })
  ] }) : /* @__PURE__ */ e(be, {});
}
const Po = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminActivityLogPage: _o
}, Symbol.toStringTag, { value: "Module" }));
function zo() {
  return /* @__PURE__ */ e(Oe, { to: "/admin/posts?trash=true", replace: !0 });
}
const To = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminTrashPage: zo
}, Symbol.toStringTag, { value: "Module" }));
function Io() {
  return /* @__PURE__ */ e("main", { className: "flex min-h-[60vh] items-center justify-center p-6", children: /* @__PURE__ */ n("div", { className: "max-w-md space-y-4 text-center", children: [
    /* @__PURE__ */ e("p", { className: "text-6xl font-semibold tracking-tight", children: "403" }),
    /* @__PURE__ */ e("h1", { className: "text-2xl font-semibold", children: "Forbidden" }),
    /* @__PURE__ */ e("p", { className: "text-muted-foreground", children: "You do not have permission to access this page." }),
    /* @__PURE__ */ e(Ee, { to: "/admin", className: k(ft({ variant: "outline" })), children: "Back to dashboard" })
  ] }) });
}
const Do = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminForbiddenPage: Io
}, Symbol.toStringTag, { value: "Module" })), Eo = _t(
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
function se({
  className: t,
  variant: a,
  size: r,
  pressed: i,
  onPressedChange: s,
  onClick: l,
  ...o
}) {
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      role: "button",
      "aria-pressed": i,
      "data-state": i ? "on" : "off",
      className: k(Eo({ variant: a, size: r, className: t })),
      onClick: (d) => {
        s?.(!i), l?.(d);
      },
      ...o
    }
  );
}
function Lo({ editor: t }) {
  function a() {
    const l = t.getAttributes("link").href, o = window.prompt("Enter URL:", l || "https://");
    if (o !== null) {
      if (o === "") {
        t.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      t.chain().focus().extendMarkRange("link").setLink({ href: o }).run();
    }
  }
  function r(l) {
    if (!l) return;
    const o = {
      src: l.url,
      alt: l.alt || l.name
    };
    t.chain().focus().setImage(o).run();
  }
  function i() {
    const l = window.prompt("Enter YouTube URL:", "https://www.youtube.com/watch?v=");
    l && t.chain().focus().setYoutubeVideo({ src: l }).run();
  }
  function s() {
    t.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: !0 }).run();
  }
  return /* @__PURE__ */ n("div", { className: "flex flex-wrap items-center gap-0.5 border-b p-1.5", children: [
    /* @__PURE__ */ e(
      se,
      {
        size: "sm",
        pressed: t.isActive("bold"),
        onPressedChange: () => t.chain().focus().toggleBold().run(),
        disabled: !t.can().chain().focus().toggleBold().run(),
        "aria-label": "Bold",
        title: "Bold",
        children: /* @__PURE__ */ e(Gn, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      se,
      {
        size: "sm",
        pressed: t.isActive("italic"),
        onPressedChange: () => t.chain().focus().toggleItalic().run(),
        disabled: !t.can().chain().focus().toggleItalic().run(),
        "aria-label": "Italic",
        title: "Italic",
        children: /* @__PURE__ */ e(qn, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      se,
      {
        size: "sm",
        pressed: t.isActive("underline"),
        onPressedChange: () => t.chain().focus().toggleUnderline().run(),
        disabled: !t.can().chain().focus().toggleUnderline().run(),
        "aria-label": "Underline",
        title: "Underline",
        children: /* @__PURE__ */ e(Kn, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      se,
      {
        size: "sm",
        pressed: t.isActive("strike"),
        onPressedChange: () => t.chain().focus().toggleStrike().run(),
        disabled: !t.can().chain().focus().toggleStrike().run(),
        "aria-label": "Strikethrough",
        title: "Strikethrough",
        children: /* @__PURE__ */ e(Xr, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      se,
      {
        size: "sm",
        pressed: t.isActive("highlight"),
        onPressedChange: () => t.chain().focus().toggleHighlight().run(),
        disabled: !t.can().chain().focus().toggleHighlight().run(),
        "aria-label": "Highlight",
        title: "Highlight",
        children: /* @__PURE__ */ e(Qr, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mx-1 h-6" }),
    /* @__PURE__ */ n("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 1 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
          "aria-label": "Heading 1",
          title: "Heading 1",
          children: /* @__PURE__ */ e(wa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 2 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 2 }).run(),
          "aria-label": "Heading 2",
          title: "Heading 2",
          children: /* @__PURE__ */ e(Ca, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 3 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 3 }).run(),
          "aria-label": "Heading 3",
          title: "Heading 3",
          children: /* @__PURE__ */ e(ka, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 4 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 4 }).run(),
          "aria-label": "Heading 4",
          title: "Heading 4",
          children: /* @__PURE__ */ e(rn, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("paragraph"),
          onPressedChange: () => t.chain().focus().setParagraph().run(),
          "aria-label": "Paragraph",
          title: "Paragraph",
          children: /* @__PURE__ */ e(sn, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ n("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("blockquote"),
          onPressedChange: () => t.chain().focus().toggleBlockquote().run(),
          "aria-label": "Blockquote",
          title: "Blockquote",
          children: /* @__PURE__ */ e(Sa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("codeBlock"),
          onPressedChange: () => t.chain().focus().toggleCodeBlock().run(),
          "aria-label": "Code Block",
          title: "Code Block",
          children: /* @__PURE__ */ e(Aa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("bulletList"),
          onPressedChange: () => t.chain().focus().toggleBulletList().run(),
          "aria-label": "Bullet List",
          title: "Bullet List",
          children: /* @__PURE__ */ e(_a, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("orderedList"),
          onPressedChange: () => t.chain().focus().toggleOrderedList().run(),
          "aria-label": "Ordered List",
          title: "Ordered List",
          children: /* @__PURE__ */ e(Pa, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("taskList"),
          onPressedChange: () => t.chain().focus().toggleTaskList().run(),
          "aria-label": "Task List",
          title: "Task List",
          children: /* @__PURE__ */ e(ln, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        w,
        {
          type: "button",
          variant: "ghost",
          size: "icon-sm",
          onClick: () => t.chain().focus().setHorizontalRule().run(),
          "aria-label": "Horizontal Rule",
          title: "Horizontal Rule",
          children: /* @__PURE__ */ e(on, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ n("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "left" }),
          onPressedChange: () => t.chain().focus().setTextAlign("left").run(),
          "aria-label": "Align Left",
          title: "Align Left",
          children: /* @__PURE__ */ e(cn, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "center" }),
          onPressedChange: () => t.chain().focus().setTextAlign("center").run(),
          "aria-label": "Align Center",
          title: "Align Center",
          children: /* @__PURE__ */ e(dn, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "right" }),
          onPressedChange: () => t.chain().focus().setTextAlign("right").run(),
          "aria-label": "Align Right",
          title: "Align Right",
          children: /* @__PURE__ */ e(un, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive({ textAlign: "justify" }),
          onPressedChange: () => t.chain().focus().setTextAlign("justify").run(),
          "aria-label": "Justify",
          title: "Justify",
          children: /* @__PURE__ */ e(mn, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ n("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        se,
        {
          size: "sm",
          pressed: t.isActive("link"),
          onPressedChange: a,
          "aria-label": "Link",
          title: "Link",
          children: /* @__PURE__ */ e(za, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        Re,
        {
          value: null,
          onChange: r,
          accept: "image/*",
          trigger: /* @__PURE__ */ e(
            w,
            {
              type: "button",
              variant: "ghost",
              size: "icon-sm",
              "aria-label": "Insert Image",
              title: "Insert Image",
              children: /* @__PURE__ */ e(kt, { className: "size-4" })
            }
          )
        }
      ),
      /* @__PURE__ */ e(
        w,
        {
          type: "button",
          variant: "ghost",
          size: "icon-sm",
          onClick: i,
          "aria-label": "YouTube Video",
          title: "YouTube Video",
          children: /* @__PURE__ */ e(hn, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ n("div", { className: "hidden md:flex items-center gap-0.5", children: [
      t.isActive("table") ? /* @__PURE__ */ n(La, { children: [
        /* @__PURE__ */ n(
          Ma,
          {
            className: k(
              "inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1 text-xs font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            ),
            children: [
              /* @__PURE__ */ e(ua, { className: "size-4" }),
              "Table",
              /* @__PURE__ */ e(At, { className: "size-3" })
            ]
          }
        ),
        /* @__PURE__ */ n($a, { align: "start", sideOffset: 4, children: [
          /* @__PURE__ */ e(Ye, { children: "Rows" }),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().addRowBefore().run(),
              children: [
                /* @__PURE__ */ e(Ie, { className: "size-4" }),
                "Add Row Before"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().addRowAfter().run(),
              children: [
                /* @__PURE__ */ e(Ie, { className: "size-4" }),
                "Add Row After"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              variant: "destructive",
              onClick: () => t.chain().focus().deleteRow().run(),
              children: [
                /* @__PURE__ */ e(ye, { className: "size-4" }),
                "Delete Row"
              ]
            }
          ),
          /* @__PURE__ */ e(it, {}),
          /* @__PURE__ */ e(Ye, { children: "Columns" }),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().addColumnBefore().run(),
              children: [
                /* @__PURE__ */ e(Ie, { className: "size-4" }),
                "Add Column Before"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().addColumnAfter().run(),
              children: [
                /* @__PURE__ */ e(Ie, { className: "size-4" }),
                "Add Column After"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              variant: "destructive",
              onClick: () => t.chain().focus().deleteColumn().run(),
              children: [
                /* @__PURE__ */ e(ye, { className: "size-4" }),
                "Delete Column"
              ]
            }
          ),
          /* @__PURE__ */ e(it, {}),
          /* @__PURE__ */ e(Ye, { children: "Cells" }),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().mergeCells().run(),
              disabled: !t.can().mergeCells(),
              children: [
                /* @__PURE__ */ e(gn, { className: "size-4" }),
                "Merge Cells"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().splitCell().run(),
              disabled: !t.can().splitCell(),
              children: [
                /* @__PURE__ */ e(pn, { className: "size-4" }),
                "Split Cell"
              ]
            }
          ),
          /* @__PURE__ */ e(it, {}),
          /* @__PURE__ */ n(
            Q,
            {
              variant: "destructive",
              onClick: () => t.chain().focus().deleteTable().run(),
              children: [
                /* @__PURE__ */ e(ye, { className: "size-4" }),
                "Delete Table"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ e(
        w,
        {
          type: "button",
          variant: "ghost",
          size: "icon-sm",
          onClick: s,
          "aria-label": "Insert Table",
          title: "Insert Table",
          children: /* @__PURE__ */ e(ua, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ n("div", { className: "flex md:hidden items-center", children: [
      /* @__PURE__ */ n(La, { children: [
        /* @__PURE__ */ e(
          Ma,
          {
            className: k(
              "inline-flex items-center justify-center rounded-sm h-7 w-7",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            ),
            "aria-label": "More formatting options",
            title: "More formatting options",
            children: /* @__PURE__ */ e(Fn, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ n($a, { align: "start", sideOffset: 4, children: [
          /* @__PURE__ */ e(Ye, { children: "Headings" }),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
              children: [
                /* @__PURE__ */ e(wa, { className: "size-4" }),
                "Heading 1"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 2 }).run(),
              children: [
                /* @__PURE__ */ e(Ca, { className: "size-4" }),
                "Heading 2"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 3 }).run(),
              children: [
                /* @__PURE__ */ e(ka, { className: "size-4" }),
                "Heading 3"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 4 }).run(),
              children: [
                /* @__PURE__ */ e(rn, { className: "size-4" }),
                "Heading 4"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().setParagraph().run(),
              children: [
                /* @__PURE__ */ e(sn, { className: "size-4" }),
                "Paragraph"
              ]
            }
          ),
          /* @__PURE__ */ e(it, {}),
          /* @__PURE__ */ e(Ye, { children: "Blocks" }),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleBlockquote().run(),
              children: [
                /* @__PURE__ */ e(Sa, { className: "size-4" }),
                "Blockquote"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleCodeBlock().run(),
              children: [
                /* @__PURE__ */ e(Aa, { className: "size-4" }),
                "Code Block"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleBulletList().run(),
              children: [
                /* @__PURE__ */ e(_a, { className: "size-4" }),
                "Bullet List"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleOrderedList().run(),
              children: [
                /* @__PURE__ */ e(Pa, { className: "size-4" }),
                "Ordered List"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().toggleTaskList().run(),
              children: [
                /* @__PURE__ */ e(ln, { className: "size-4" }),
                "Task List"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().setHorizontalRule().run(),
              children: [
                /* @__PURE__ */ e(on, { className: "size-4" }),
                "Horizontal Rule"
              ]
            }
          ),
          /* @__PURE__ */ e(it, {}),
          /* @__PURE__ */ e(Ye, { children: "Alignment" }),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().setTextAlign("left").run(),
              children: [
                /* @__PURE__ */ e(cn, { className: "size-4" }),
                "Align Left"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().setTextAlign("center").run(),
              children: [
                /* @__PURE__ */ e(dn, { className: "size-4" }),
                "Align Center"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().setTextAlign("right").run(),
              children: [
                /* @__PURE__ */ e(un, { className: "size-4" }),
                "Align Right"
              ]
            }
          ),
          /* @__PURE__ */ n(
            Q,
            {
              onClick: () => t.chain().focus().setTextAlign("justify").run(),
              children: [
                /* @__PURE__ */ e(mn, { className: "size-4" }),
                "Justify"
              ]
            }
          ),
          /* @__PURE__ */ e(it, {}),
          /* @__PURE__ */ e(Ye, { children: "Media" }),
          /* @__PURE__ */ n(Q, { onClick: a, children: [
            /* @__PURE__ */ e(za, { className: "size-4" }),
            "Link"
          ] }),
          /* @__PURE__ */ n(Q, { onClick: () => {
            const l = window.prompt("Enter image URL:", "https://");
            if (!l) return;
            const o = window.prompt("Enter alt text:", "") || "";
            t.chain().focus().setImage({ src: l, alt: o }).run();
          }, children: [
            /* @__PURE__ */ e(kt, { className: "size-4" }),
            "Insert Image"
          ] }),
          /* @__PURE__ */ n(Q, { onClick: i, children: [
            /* @__PURE__ */ e(hn, { className: "size-4" }),
            "YouTube Video"
          ] }),
          /* @__PURE__ */ e(it, {}),
          /* @__PURE__ */ e(Ye, { children: "Table" }),
          t.isActive("table") ? /* @__PURE__ */ n(Pe, { children: [
            /* @__PURE__ */ n(
              Q,
              {
                onClick: () => t.chain().focus().addRowBefore().run(),
                children: [
                  /* @__PURE__ */ e(Ie, { className: "size-4" }),
                  "Add Row Before"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                onClick: () => t.chain().focus().addRowAfter().run(),
                children: [
                  /* @__PURE__ */ e(Ie, { className: "size-4" }),
                  "Add Row After"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                variant: "destructive",
                onClick: () => t.chain().focus().deleteRow().run(),
                children: [
                  /* @__PURE__ */ e(ye, { className: "size-4" }),
                  "Delete Row"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                onClick: () => t.chain().focus().addColumnBefore().run(),
                children: [
                  /* @__PURE__ */ e(Ie, { className: "size-4" }),
                  "Add Column Before"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                onClick: () => t.chain().focus().addColumnAfter().run(),
                children: [
                  /* @__PURE__ */ e(Ie, { className: "size-4" }),
                  "Add Column After"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                variant: "destructive",
                onClick: () => t.chain().focus().deleteColumn().run(),
                children: [
                  /* @__PURE__ */ e(ye, { className: "size-4" }),
                  "Delete Column"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                onClick: () => t.chain().focus().mergeCells().run(),
                disabled: !t.can().mergeCells(),
                children: [
                  /* @__PURE__ */ e(gn, { className: "size-4" }),
                  "Merge Cells"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                onClick: () => t.chain().focus().splitCell().run(),
                disabled: !t.can().splitCell(),
                children: [
                  /* @__PURE__ */ e(pn, { className: "size-4" }),
                  "Split Cell"
                ]
              }
            ),
            /* @__PURE__ */ n(
              Q,
              {
                variant: "destructive",
                onClick: () => t.chain().focus().deleteTable().run(),
                children: [
                  /* @__PURE__ */ e(ye, { className: "size-4" }),
                  "Delete Table"
                ]
              }
            )
          ] }) : /* @__PURE__ */ n(Q, { onClick: s, children: [
            /* @__PURE__ */ e(ua, { className: "size-4" }),
            "Insert Table"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e(Xe, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ e(
      w,
      {
        type: "button",
        variant: "ghost",
        size: "icon-sm",
        onClick: () => t.chain().focus().undo().run(),
        disabled: !t.can().chain().focus().undo().run(),
        "aria-label": "Undo",
        title: "Undo",
        children: /* @__PURE__ */ e(Zr, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ e(
      w,
      {
        type: "button",
        variant: "ghost",
        size: "icon-sm",
        onClick: () => t.chain().focus().redo().run(),
        disabled: !t.can().chain().focus().redo().run(),
        "aria-label": "Redo",
        title: "Redo",
        children: /* @__PURE__ */ e(es, { className: "size-4" })
      }
    )
  ] });
}
function Mo({ editor: t }) {
  function a() {
    const r = t.getAttributes("link").href, i = window.prompt("Enter URL:", r || "https://");
    if (i !== null) {
      if (i === "") {
        t.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      t.chain().focus().extendMarkRange("link").setLink({ href: i }).run();
    }
  }
  return /* @__PURE__ */ n(
    Rs,
    {
      editor: t,
      className: "flex items-center gap-0.5 rounded-sm border bg-background p-1 shadow-md",
      children: [
        /* @__PURE__ */ e(
          se,
          {
            size: "sm",
            pressed: t.isActive("bold"),
            onPressedChange: () => t.chain().focus().toggleBold().run(),
            "aria-label": "Bold",
            children: /* @__PURE__ */ e(Gn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          se,
          {
            size: "sm",
            pressed: t.isActive("italic"),
            onPressedChange: () => t.chain().focus().toggleItalic().run(),
            "aria-label": "Italic",
            children: /* @__PURE__ */ e(qn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          se,
          {
            size: "sm",
            pressed: t.isActive("underline"),
            onPressedChange: () => t.chain().focus().toggleUnderline().run(),
            "aria-label": "Underline",
            children: /* @__PURE__ */ e(Kn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          se,
          {
            size: "sm",
            pressed: t.isActive("link"),
            onPressedChange: a,
            "aria-label": "Link",
            children: /* @__PURE__ */ e(za, { className: "size-3.5" })
          }
        )
      ]
    }
  );
}
function $o({ editor: t }) {
  function a() {
    const r = window.prompt("Enter image URL:", "https://");
    if (!r) return;
    const i = window.prompt("Enter alt text:", "") || "";
    t.chain().focus().setImage({ src: r, alt: i }).run();
  }
  return /* @__PURE__ */ n(
    Os,
    {
      editor: t,
      className: "flex items-center gap-0.5 rounded-sm border bg-background p-1 shadow-md",
      children: [
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
            "aria-label": "Heading 1",
            title: "Heading 1",
            children: /* @__PURE__ */ e(wa, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleHeading({ level: 2 }).run(),
            "aria-label": "Heading 2",
            title: "Heading 2",
            children: /* @__PURE__ */ e(Ca, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleHeading({ level: 3 }).run(),
            "aria-label": "Heading 3",
            title: "Heading 3",
            children: /* @__PURE__ */ e(ka, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleBulletList().run(),
            "aria-label": "Bullet List",
            title: "Bullet List",
            children: /* @__PURE__ */ e(_a, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleOrderedList().run(),
            "aria-label": "Ordered List",
            title: "Ordered List",
            children: /* @__PURE__ */ e(Pa, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: a,
            "aria-label": "Insert Image",
            title: "Insert Image",
            children: /* @__PURE__ */ e(kt, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleBlockquote().run(),
            "aria-label": "Blockquote",
            title: "Blockquote",
            children: /* @__PURE__ */ e(Sa, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ e(
          w,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            onClick: () => t.chain().focus().toggleCodeBlock().run(),
            "aria-label": "Code Block",
            title: "Code Block",
            children: /* @__PURE__ */ e(Aa, { className: "size-4" })
          }
        )
      ]
    }
  );
}
const Ro = [
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
function Oo({
  node: t,
  updateAttributes: a
}) {
  const r = t.attrs.language || "";
  return /* @__PURE__ */ n(cs, { className: "relative rounded-sm bg-muted my-2", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between border-b border-border/50 px-3 py-1.5", children: /* @__PURE__ */ n(
      ce,
      {
        value: r || "auto",
        onValueChange: (i) => a({ language: i === "auto" ? "" : i }),
        children: [
          /* @__PURE__ */ e(ue, { size: "sm", className: "h-6 w-auto min-w-[100px] border-none bg-transparent text-xs text-muted-foreground shadow-none", children: /* @__PURE__ */ e(de, { placeholder: "Auto" }) }),
          /* @__PURE__ */ e(me, { side: "bottom", align: "start", children: Ro.map((i) => /* @__PURE__ */ e(Z, { value: i.value, children: i.label }, i.value)) })
        ]
      }
    ) }),
    /* @__PURE__ */ e("pre", { className: "p-4 font-mono text-sm overflow-x-auto !mt-0 !rounded-sm", children: /* @__PURE__ */ e(ds, { className: "hljs" }) })
  ] });
}
const Fo = Ts(Is);
function jo({
  content: t,
  onChange: a,
  placeholder: r = "Start writing...",
  editable: i = !0,
  className: s
}) {
  const l = us({
    extensions: [
      gs.configure({
        codeBlock: !1
        // Using CodeBlockLowlight instead
      }),
      ps,
      fs.configure({
        multicolor: !1
      }),
      bs.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"]
      }),
      vs.configure({
        openOnClick: !1,
        autolink: !0,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer"
        }
      }),
      xs.configure({
        HTMLAttributes: {
          class: "rounded-sm max-w-full h-auto"
        }
      }),
      ys.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-sm"
        },
        inline: !1
      }),
      ws.configure({
        resizable: !0,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full"
        }
      }),
      Ns,
      Cs.configure({
        HTMLAttributes: {
          class: "border border-border p-2 min-w-[100px]"
        }
      }),
      ks.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-bold min-w-[100px]"
        }
      }),
      Ss.configure({
        HTMLAttributes: {
          class: "list-none pl-0"
        }
      }),
      As.configure({
        nested: !0,
        HTMLAttributes: {
          class: "flex items-start gap-2"
        }
      }),
      _s.configure({
        lowlight: Fo,
        HTMLAttributes: {
          class: "rounded-sm bg-muted p-4 font-mono text-sm overflow-x-auto"
        }
      }).extend({
        addNodeView() {
          return ms(Oo);
        }
      }),
      Ps.configure({
        placeholder: r
      }),
      zs
    ],
    content: t,
    editable: i,
    onUpdate: ({ editor: u }) => {
      a(u.getHTML());
    },
    editorProps: {
      attributes: {
        class: k(
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
  if (!l)
    return /* @__PURE__ */ n("div", { className: k("rounded-sm border", s), children: [
      /* @__PURE__ */ e("div", { className: "h-10 border-b bg-muted/30 animate-pulse" }),
      /* @__PURE__ */ e("div", { className: "min-h-[200px] p-4", children: /* @__PURE__ */ e("div", { className: "h-4 w-3/4 bg-muted/30 rounded-sm animate-pulse" }) })
    ] });
  const o = l.storage.characterCount.characters(), d = l.storage.characterCount.words();
  return /* @__PURE__ */ n("div", { className: k("rounded-sm border", s), children: [
    /* @__PURE__ */ e(Lo, { editor: l }),
    /* @__PURE__ */ e(Mo, { editor: l }),
    /* @__PURE__ */ e($o, { editor: l }),
    /* @__PURE__ */ e(hs, { editor: l }),
    /* @__PURE__ */ n("div", { className: "flex items-center justify-end gap-3 border-t px-3 py-1.5 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ n("span", { children: [
        o,
        " characters"
      ] }),
      /* @__PURE__ */ n("span", { children: [
        d,
        " words"
      ] })
    ] })
  ] });
}
const vr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TiptapEditor: jo
}, Symbol.toStringTag, { value: "Module" }));
export {
  Pc as AdminApp
};
