import { jsx as e, jsxs as a, Fragment as He } from "react/jsx-runtime";
import * as ye from "react";
import { createContext as Jn, useContext as Yn, useState as d, useRef as Re, useCallback as q, useEffect as te, lazy as me, Suspense as xa, useTransition as yt, forwardRef as Xn, useMemo as Ot, useImperativeHandle as Qn, useId as Zn } from "react";
import { useNavigate as Qe, Routes as es, Route as ne, Navigate as st, useParams as Ve, useLocation as dt, Outlet as ts, BrowserRouter as as, Link as fe } from "react-router";
import { XIcon as cn, PanelLeftIcon as ns, LayoutDashboard as Na, Image as dn, Menu as ss, Users as rs, Shield as is, Globe as ls, CircleDot as ta, Hash as Ma, Settings as os, FolderTree as un, FileText as Bt, ChevronDown as wt, UserRound as cs, LogOut as ds, LoaderCircle as us, Loader2Icon as ms, OctagonXIcon as hs, TriangleAlertIcon as gs, InfoIcon as ps, CircleCheckIcon as fs, ArrowRight as bs, Check as Ht, ChevronDownIcon as mn, CheckIcon as vs, ChevronUpIcon as xs, ArrowUp as We, ArrowDown as Je, ArrowUpDown as Ye, Upload as Ns, FileIcon as Nt, Loader2 as hn, X as Vt, Search as gn, Trash2 as we, ImageIcon as Pt, Copy as ya, GripVertical as Gt, ChevronRight as ys, Pencil as pn, Settings2 as wa, ChevronUp as fn, Plus as $e, Save as ws, Bold as bn, Italic as vn, Underline as xn, Strikethrough as Cs, Highlighter as ks, Heading1 as la, Heading2 as oa, Heading3 as ca, Heading4 as Ra, Pilcrow as $a, Quote as da, Code2 as ua, List as ma, ListOrdered as ha, ListChecks as Oa, Minus as Ba, AlignLeft as ja, AlignCenter as Ua, AlignRight as Fa, AlignJustify as Ha, Link2 as ga, Video as Va, TableIcon as aa, Merge as Ga, SplitSquareHorizontal as qa, MoreHorizontal as Ss, Undo2 as Ps, Redo2 as _s } from "lucide-react";
import { Collapsible as Ca } from "@base-ui/react/collapsible";
import { useTheme as As } from "next-themes";
import { Toaster as zs, toast as tt } from "sonner";
import { useSensors as ka, useSensor as jt, PointerSensor as Sa, KeyboardSensor as Is, DndContext as Pa, closestCenter as _a, DragOverlay as Ts } from "@dnd-kit/core";
import { useSortable as qt, sortableKeyboardCoordinates as Ds, arrayMove as xt, SortableContext as Kt, verticalListSortingStrategy as Aa, rectSortingStrategy as Es } from "@dnd-kit/sortable";
import { CSS as Wt } from "@dnd-kit/utilities";
import { mergeProps as Jt } from "@base-ui/react/merge-props";
import { useRender as Yt } from "@base-ui/react/use-render";
import { cva as _t } from "class-variance-authority";
import { clsx as Ls } from "clsx";
import { twMerge as Ms } from "tailwind-merge";
import { Input as Rs } from "@base-ui/react/input";
import { Separator as $s } from "@base-ui/react/separator";
import { Dialog as ve } from "@base-ui/react/dialog";
import { Tooltip as vt } from "@base-ui/react/tooltip";
import { NodeViewWrapper as Os, NodeViewContent as Bs, useEditor as js, ReactNodeViewRenderer as Us, EditorContent as Fs } from "@tiptap/react";
import Hs from "@tiptap/starter-kit";
import Vs from "@tiptap/extension-underline";
import Gs from "@tiptap/extension-highlight";
import qs from "@tiptap/extension-text-align";
import Ks from "@tiptap/extension-link";
import Ws from "@tiptap/extension-image";
import Js from "@tiptap/extension-youtube";
import { TableRow as Ys, Table as Xs, TableCell as Qs, TableHeader as Zs } from "@tiptap/extension-table";
import er from "@tiptap/extension-task-list";
import tr from "@tiptap/extension-task-item";
import ar from "@tiptap/extension-code-block-lowlight";
import nr from "@tiptap/extension-placeholder";
import sr from "@tiptap/extension-character-count";
import { createLowlight as rr, common as ir } from "lowlight";
import { Button as lr } from "@base-ui/react/button";
import { Menu as nt } from "@base-ui/react/menu";
import { Select as Me } from "@base-ui/react/select";
import { Tabs as Xt } from "@base-ui/react/tabs";
import { BubbleMenu as or, FloatingMenu as cr } from "@tiptap/react/menus";
async function dr() {
  const t = await fetch("/api/admin/auth/session", {
    credentials: "include"
  });
  return t.ok ? (await t.json()).data : null;
}
let $t = null, Nn = null;
function Ka(t) {
  Nn = t;
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
  r.status === 401 && await ur() && (r = await fetch(t, i)), r.status === 401 && Nn?.();
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
async function ue(t) {
  const n = await Qt(t);
  if (!n.success)
    throw new Error(n.message);
  return n.data;
}
function Le(t, n) {
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
function yn(t) {
  return Qt(t, {
    method: "DELETE"
  });
}
const wn = Jn({
  loading: !0,
  session: null,
  setSession() {
  },
  async refreshSession() {
    return null;
  }
}), mr = 600 * 1e3;
function hr({ children: t }) {
  const [n, s] = d(!0), [l, i] = d(null), r = Re(null), o = Re(!0), c = q(async () => {
    const u = await dr();
    return o.current && (i(u), !u && r.current && (clearInterval(r.current), r.current = null)), u;
  }, []);
  return te(() => (o.current = !0, Ka(() => {
    o.current && (i(null), r.current && (clearInterval(r.current), r.current = null));
  }), c().finally(() => {
    o.current && s(!1);
  }), r.current = setInterval(() => {
    c();
  }, mr), () => {
    o.current = !1, Ka(null), r.current && (clearInterval(r.current), r.current = null);
  }), [c]), /* @__PURE__ */ e(wn.Provider, { value: { loading: n, session: l, setSession: i, refreshSession: c }, children: t });
}
function Ze() {
  return Yn(wn);
}
const na = 768;
function gr() {
  const [t, n] = ye.useState(void 0);
  return ye.useEffect(() => {
    const s = window.matchMedia(`(max-width: ${na - 1}px)`), l = () => {
      n(window.innerWidth < na);
    };
    return s.addEventListener("change", l), n(window.innerWidth < na), () => s.removeEventListener("change", l);
  }, []), !!t;
}
function S(...t) {
  return Ms(Ls(t));
}
const At = _t(
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
  const r = l == null || ye.isValidElement(l) && typeof l.type == "string" && l.type === "button";
  return /* @__PURE__ */ e(
    lr,
    {
      "data-slot": "button",
      nativeButton: r,
      className: S(At({ variant: n, size: s, className: t })),
      render: l,
      ...i
    }
  );
}
function G({ className: t, type: n, ...s }) {
  return /* @__PURE__ */ e(
    Rs,
    {
      type: n,
      "data-slot": "input",
      className: S(
        "h-8 w-full min-w-0 rounded-sm border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        t
      ),
      ...s
    }
  );
}
function it({
  className: t,
  orientation: n = "horizontal",
  ...s
}) {
  return /* @__PURE__ */ e(
    $s,
    {
      "data-slot": "separator",
      orientation: n,
      className: S(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        t
      ),
      ...s
    }
  );
}
function pr({ ...t }) {
  return /* @__PURE__ */ e(ve.Root, { "data-slot": "sheet", ...t });
}
function fr({ ...t }) {
  return /* @__PURE__ */ e(ve.Portal, { "data-slot": "sheet-portal", ...t });
}
function br({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    ve.Backdrop,
    {
      "data-slot": "sheet-overlay",
      className: S(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        t
      ),
      ...n
    }
  );
}
function vr({
  className: t,
  children: n,
  side: s = "right",
  showCloseButton: l = !0,
  ...i
}) {
  return /* @__PURE__ */ a(fr, { children: [
    /* @__PURE__ */ e(br, {}),
    /* @__PURE__ */ a(
      ve.Popup,
      {
        "data-slot": "sheet-content",
        "data-side": s,
        className: S(
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
                  cn,
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
function xr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sheet-header",
      className: S("flex flex-col gap-0.5 p-4", t),
      ...n
    }
  );
}
function Nr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    ve.Title,
    {
      "data-slot": "sheet-title",
      className: S(
        "font-heading text-base font-medium text-foreground",
        t
      ),
      ...n
    }
  );
}
function yr({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    ve.Description,
    {
      "data-slot": "sheet-description",
      className: S("text-sm text-muted-foreground", t),
      ...n
    }
  );
}
function Cn({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "skeleton",
      className: S("animate-pulse rounded-sm bg-muted", t),
      ...n
    }
  );
}
function wr({ ...t }) {
  return /* @__PURE__ */ e(vt.Root, { "data-slot": "tooltip", ...t });
}
function Cr({ ...t }) {
  return /* @__PURE__ */ e(vt.Trigger, { "data-slot": "tooltip-trigger", ...t });
}
function kr({
  className: t,
  side: n = "top",
  sideOffset: s = 4,
  align: l = "center",
  alignOffset: i = 0,
  children: r,
  ...o
}) {
  return /* @__PURE__ */ e(vt.Portal, { children: /* @__PURE__ */ e(
    vt.Positioner,
    {
      align: l,
      alignOffset: i,
      side: n,
      sideOffset: s,
      className: "isolate z-50",
      children: /* @__PURE__ */ a(
        vt.Popup,
        {
          "data-slot": "tooltip-content",
          className: S(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-sm bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            t
          ),
          ...o,
          children: [
            r,
            /* @__PURE__ */ e(vt.Arrow, { className: "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-sm-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" })
          ]
        }
      )
    }
  ) });
}
const Sr = "sidebar_state", Pr = 3600 * 24 * 7, _r = "16rem", Ar = "18rem", zr = "3rem", Ir = "b", kn = ye.createContext(null);
function za() {
  const t = ye.useContext(kn);
  if (!t)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return t;
}
function Tr({
  defaultOpen: t = !0,
  open: n,
  onOpenChange: s,
  className: l,
  style: i,
  children: r,
  ...o
}) {
  const c = gr(), [u, m] = ye.useState(!1), [y, _] = ye.useState(t), h = n ?? y, E = ye.useCallback(
    (b) => {
      const p = typeof b == "function" ? b(h) : b;
      s ? s(p) : _(p), document.cookie = `${Sr}=${p}; path=/; max-age=${Pr}`;
    },
    [s, h]
  ), z = ye.useCallback(() => c ? m((b) => !b) : E((b) => !b), [c, E, m]);
  ye.useEffect(() => {
    const b = (p) => {
      p.key === Ir && (p.metaKey || p.ctrlKey) && (p.preventDefault(), z());
    };
    return window.addEventListener("keydown", b), () => window.removeEventListener("keydown", b);
  }, [z]);
  const O = h ? "expanded" : "collapsed", R = ye.useMemo(
    () => ({
      state: O,
      open: h,
      setOpen: E,
      isMobile: c,
      openMobile: u,
      setOpenMobile: m,
      toggleSidebar: z
    }),
    [O, h, E, c, u, m, z]
  );
  return /* @__PURE__ */ e(kn.Provider, { value: R, children: /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": _r,
        "--sidebar-width-icon": zr,
        ...i
      },
      className: S(
        "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
        l
      ),
      ...o,
      children: r
    }
  ) });
}
function Dr({
  side: t = "left",
  variant: n = "sidebar",
  collapsible: s = "offcanvas",
  className: l,
  children: i,
  dir: r,
  ...o
}) {
  const { isMobile: c, state: u, openMobile: m, setOpenMobile: y } = za();
  return s === "none" ? /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar",
      className: S(
        "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
        l
      ),
      ...o,
      children: i
    }
  ) : c ? /* @__PURE__ */ e(pr, { open: m, onOpenChange: y, ...o, children: /* @__PURE__ */ a(
    vr,
    {
      dir: r,
      "data-sidebar": "sidebar",
      "data-slot": "sidebar",
      "data-mobile": "true",
      className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
      style: {
        "--sidebar-width": Ar
      },
      side: t,
      children: [
        /* @__PURE__ */ a(xr, { className: "sr-only", children: [
          /* @__PURE__ */ e(Nr, { children: "Sidebar" }),
          /* @__PURE__ */ e(yr, { children: "Displays the mobile sidebar." })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex h-full w-full flex-col", children: i })
      ]
    }
  ) }) : /* @__PURE__ */ a(
    "div",
    {
      className: "group peer hidden text-sidebar-foreground md:block",
      "data-state": u,
      "data-collapsible": u === "collapsed" ? s : "",
      "data-variant": n,
      "data-side": t,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ e(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: S(
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
            className: S(
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
function Er({
  className: t,
  onClick: n,
  ...s
}) {
  const { toggleSidebar: l } = za();
  return /* @__PURE__ */ a(
    x,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon-sm",
      className: S(t),
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
function Lr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "main",
    {
      "data-slot": "sidebar-inset",
      className: S(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-sm md:peer-data-[variant=inset]:shadow-sm",
        t
      ),
      ...n
    }
  );
}
function Mr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: S("flex flex-col gap-2 p-2", t),
      ...n
    }
  );
}
function Rr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      className: S("flex flex-col gap-2 p-2", t),
      ...n
    }
  );
}
function $r({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: S(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        t
      ),
      ...n
    }
  );
}
function Or({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: S("relative flex w-full min-w-0 flex-col p-2", t),
      ...n
    }
  );
}
function Br({
  className: t,
  render: n,
  ...s
}) {
  return Yt({
    defaultTagName: "div",
    props: Jt(
      {
        className: S(
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
function jr({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      className: S("w-full text-sm", t),
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
      className: S("flex w-full min-w-0 flex-col gap-0", t),
      ...n
    }
  );
}
function lt({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: S("group/menu-item relative", t),
      ...n
    }
  );
}
const Ur = _t(
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
function pt({
  render: t,
  isActive: n = !1,
  variant: s = "default",
  size: l = "default",
  tooltip: i,
  className: r,
  ...o
}) {
  const { isMobile: c, state: u } = za(), m = Yt({
    defaultTagName: "button",
    props: Jt(
      {
        className: S(Ur({ variant: s, size: l }), r)
      },
      o
    ),
    render: i ? /* @__PURE__ */ e(Cr, { render: t }) : t,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size: l,
      active: n
    }
  });
  return i ? (typeof i == "string" && (i = {
    children: i
  }), /* @__PURE__ */ a(wr, { children: [
    m,
    /* @__PURE__ */ e(
      kr,
      {
        side: "right",
        align: "center",
        hidden: u !== "collapsed" || c,
        ...i
      }
    )
  ] })) : m;
}
function Fr({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "ul",
    {
      "data-slot": "sidebar-menu-sub",
      "data-sidebar": "menu-sub",
      className: S(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        t
      ),
      ...n
    }
  );
}
function Wa({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    "li",
    {
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item",
      className: S("group/menu-sub-item relative", t),
      ...n
    }
  );
}
function Ja({
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
        className: S(
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
function Hr({ ...t }) {
  return /* @__PURE__ */ e(Ca.Root, { "data-slot": "collapsible", ...t });
}
function Vr({ ...t }) {
  return /* @__PURE__ */ e(Ca.Trigger, { "data-slot": "collapsible-trigger", ...t });
}
function Gr({ ...t }) {
  return /* @__PURE__ */ e(Ca.Panel, { "data-slot": "collapsible-content", ...t });
}
const qr = [], Kr = [], Wr = {
  contentTypes: qr,
  templates: Kr
};
let Jr = Wr;
function Yr(t) {
  return typeof t == "object" && t !== null && Array.isArray(t.contentTypes) && Array.isArray(t.templates);
}
function Zt() {
  const t = globalThis.__CMS_CONTENT_TYPE_REGISTRY__;
  return Yr(t) ? t : Jr;
}
const Ya = {
  FileText: Bt,
  Layout: Na,
  Image: dn,
  FolderTree: un,
  Settings: os,
  Star: ta,
  Bookmark: ta,
  Tag: Ma,
  Hash: Ma,
  Bell: ta
}, Xr = [
  { title: "Dashboard", href: "/admin", icon: Na, permission: null },
  { title: "Media", href: "/admin/media", icon: dn, permission: "media.view" },
  { title: "Menus", href: "/admin/menus", icon: ss, permission: "menus.view" },
  { title: "Users", href: "/admin/users", icon: rs, permission: "users.view" },
  { title: "Roles & Permissions", href: "/admin/roles", icon: is, permission: "roles.view" },
  { title: "Settings", href: "/admin/settings", icon: ls, permission: "settings.manage" }
];
function Qr({ user: t, permissions: n, roleName: s, pathname: l }) {
  const i = [
    { id: "page", name: "page", label: "Pages", slug: "page", icon: "Layout", position: 0 },
    ...Zt().contentTypes.map((h) => ({ ...h, id: h.slug }))
  ], r = Qe(), { setSession: o } = Ze(), c = Xr.filter(
    (h) => h.permission === null || n.includes(h.permission)
  );
  function u(h) {
    return h === "/admin" ? l === "/admin" : l === h || l.startsWith(h + "/");
  }
  function m(h) {
    return l.startsWith(`/admin/posts/${h}`) || h !== "page" && l.startsWith(`/admin/categories/${h}`);
  }
  function y(h) {
    return m(h);
  }
  async function _() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" }), o(null), r("/admin/login", { replace: !0 });
  }
  return /* @__PURE__ */ a(Dr, { variant: "inset", children: [
    /* @__PURE__ */ e(Mr, { className: "gap-3 px-3 pt-3", children: /* @__PURE__ */ e(sa, { children: /* @__PURE__ */ e(lt, { children: /* @__PURE__ */ a(pt, { size: "lg", className: "rounded-sm", onClick: () => r("/admin"), children: [
      /* @__PURE__ */ e("div", { className: "flex aspect-square size-9 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground shadow-sm", children: /* @__PURE__ */ e(Na, { className: "size-4" }) }),
      /* @__PURE__ */ a("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [
        /* @__PURE__ */ e("span", { className: "truncate font-semibold", children: "Beaver" }),
        /* @__PURE__ */ e("span", { className: "truncate text-xs text-sidebar-foreground/65", children: "Editorial control center" })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ e($r, { children: /* @__PURE__ */ e(Or, { children: /* @__PURE__ */ e(jr, { children: /* @__PURE__ */ a(sa, { children: [
      c.map((h) => /* @__PURE__ */ e(lt, { children: /* @__PURE__ */ a(
        pt,
        {
          isActive: u(h.href),
          tooltip: h.title,
          className: "rounded-sm",
          onClick: () => r(h.href),
          children: [
            /* @__PURE__ */ e(h.icon, {}),
            /* @__PURE__ */ e("span", { children: h.title })
          ]
        }
      ) }, h.href)),
      /* @__PURE__ */ e(lt, { className: "mt-3 pt-3 border-t border-sidebar-border", children: /* @__PURE__ */ e(Br, { className: "px-1 pb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50", children: "CONTENT" }) }),
      i.map((h) => {
        const E = h.icon && Ya[h.icon] ? Ya[h.icon] : Bt, z = n.includes(`content.${h.slug}.view`), O = n.includes(`category.${h.slug}.view`);
        if (!z && !O) return null;
        if (h.slug === "page") {
          if (!z) return null;
          const b = l.startsWith(`/admin/posts/${h.slug}`);
          return /* @__PURE__ */ e(lt, { children: /* @__PURE__ */ a(
            pt,
            {
              tooltip: h.label,
              className: "rounded-sm",
              isActive: b,
              onClick: () => r(`/admin/posts/${h.slug}`),
              children: [
                /* @__PURE__ */ e(E, {}),
                /* @__PURE__ */ e("span", { children: h.label })
              ]
            }
          ) }, h.id);
        }
        const R = y(h.slug);
        return /* @__PURE__ */ e(Hr, { defaultOpen: R, className: "group/collapsible", children: /* @__PURE__ */ a(lt, { children: [
          /* @__PURE__ */ a(
            Vr,
            {
              render: /* @__PURE__ */ e(
                pt,
                {
                  tooltip: h.label,
                  className: "rounded-sm",
                  isActive: m(h.slug)
                }
              ),
              children: [
                /* @__PURE__ */ e(E, {}),
                /* @__PURE__ */ e("span", { children: h.label }),
                /* @__PURE__ */ e(wt, { className: "ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" })
              ]
            }
          ),
          /* @__PURE__ */ e(Gr, { children: /* @__PURE__ */ a(Fr, { children: [
            z && /* @__PURE__ */ e(Wa, { children: /* @__PURE__ */ a(
              Ja,
              {
                isActive: l.startsWith(`/admin/posts/${h.slug}`) || !l.includes("/") && h.slug === "post",
                className: "rounded-sm",
                onClick: () => r(`/admin/posts/${h.slug}`),
                children: [
                  /* @__PURE__ */ e(Bt, { className: "size-3.5" }),
                  /* @__PURE__ */ e("span", { children: h.label })
                ]
              }
            ) }),
            O && /* @__PURE__ */ e(Wa, { children: /* @__PURE__ */ a(
              Ja,
              {
                isActive: l.startsWith(`/admin/categories/${h.slug}`),
                className: "rounded-sm",
                onClick: () => r(`/admin/categories/${h.slug}`),
                children: [
                  /* @__PURE__ */ e(un, { className: "size-3.5" }),
                  /* @__PURE__ */ e("span", { children: "Categories" })
                ]
              }
            ) })
          ] }) })
        ] }) }, h.id);
      })
    ] }) }) }) }),
    /* @__PURE__ */ e(Rr, { children: /* @__PURE__ */ a(sa, { children: [
      /* @__PURE__ */ e(lt, { children: /* @__PURE__ */ a(pt, { className: "rounded-sm", onClick: () => r("/admin/profile"), children: [
        /* @__PURE__ */ e(cs, {}),
        /* @__PURE__ */ e("span", { children: "Profile" })
      ] }) }),
      /* @__PURE__ */ e(lt, { children: /* @__PURE__ */ a(pt, { className: "rounded-sm", onClick: _, children: [
        /* @__PURE__ */ e(ds, {}),
        /* @__PURE__ */ e("span", { children: "Logout" })
      ] }) })
    ] }) })
  ] });
}
function ge({ className: t = "p-6" }) {
  return /* @__PURE__ */ e("main", { className: `grid min-h-[50vh] place-items-center ${t}`, "aria-busy": "true", children: /* @__PURE__ */ e(us, { className: "size-7 animate-spin text-muted-foreground", "aria-label": "Loading" }) });
}
const Be = typeof globalThis.__CMS_ADMIN_PATH__ == "string" ? globalThis.__CMS_ADMIN_PATH__ : "/admin";
function Pe({
  className: t,
  size: n = "default",
  ...s
}) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card",
      "data-size": n,
      className: S(
        "group/card flex flex-col gap-4 overflow-hidden rounded-sm bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-sm *:[img:last-child]:rounded-sm",
        t
      ),
      ...s
    }
  );
}
function _e({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-header",
      className: S(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-sm px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        t
      ),
      ...n
    }
  );
}
function Ae({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-title",
      className: S(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        t
      ),
      ...n
    }
  );
}
function Ia({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-description",
      className: S("text-sm text-muted-foreground", t),
      ...n
    }
  );
}
function ze({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "card-content",
      className: S("px-4 group-data-[size=sm]/card:px-3", t),
      ...n
    }
  );
}
function L({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "label",
    {
      "data-slot": "label",
      className: S(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        t
      ),
      ...n
    }
  );
}
function Zr() {
  const { refreshSession: t } = Ze(), n = Qe(), [s, l] = d(""), [i, r] = d(""), [o, c] = d("");
  async function u(m) {
    m.preventDefault(), c("");
    const y = await fetch("/api/admin/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: s, password: i })
    });
    if (!y.ok) {
      const _ = await y.json().catch(() => null);
      c(_?.message || `Login failed (${y.status}).`);
      return;
    }
    try {
      if (!await t()) {
        c("Login berhasil, tetapi sesi tidak dapat diverifikasi. Silakan coba lagi.");
        return;
      }
      n(Be, { replace: !0 });
    } catch {
      c("Sesi tidak dapat diverifikasi. Silakan coba lagi.");
    }
  }
  return /* @__PURE__ */ e("main", { className: "mx-auto flex min-h-screen max-w-md items-center px-6", children: /* @__PURE__ */ e("form", { className: "w-full", onSubmit: u, children: /* @__PURE__ */ a(Pe, { className: "border-border/60 shadow-sm", children: [
    /* @__PURE__ */ e(_e, { children: /* @__PURE__ */ e(Ae, { children: "Login" }) }),
    /* @__PURE__ */ a(ze, { className: "space-y-4", children: [
      o ? /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: o }) : null,
      /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ e(L, { htmlFor: "login-email", children: "Email" }),
        /* @__PURE__ */ e(G, { id: "login-email", type: "email", value: s, onChange: (m) => l(m.target.value), placeholder: "Email" })
      ] }),
      /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ e(L, { htmlFor: "login-password", children: "Password" }),
        /* @__PURE__ */ e(G, { id: "login-password", type: "password", value: i, onChange: (m) => r(m.target.value), placeholder: "Password" })
      ] }),
      /* @__PURE__ */ e(x, { className: "w-full", type: "submit", children: "Sign in" })
    ] })
  ] }) }) });
}
const ei = me(async () => ({ default: (await Promise.resolve().then(() => zi)).AdminDashboardPage })), Xa = me(async () => ({ default: (await Promise.resolve().then(() => Mi)).AdminContentListPage })), ti = me(async () => ({ default: (await Promise.resolve().then(() => $i)).AdminUsersPage })), ai = me(async () => ({ default: (await Promise.resolve().then(() => Pn)).AdminUserCreatePage })), ni = me(async () => ({ default: (await Promise.resolve().then(() => Pn)).AdminUserEditPage })), si = me(async () => ({ default: (await Promise.resolve().then(() => Fi)).AdminMediaPage })), Qa = me(async () => ({ default: (await Promise.resolve().then(() => Vi)).AdminCategoriesPage })), ri = me(async () => ({ default: (await Promise.resolve().then(() => ol)).AdminMenusPage })), ii = me(async () => ({ default: (await Promise.resolve().then(() => dl)).AdminRolesPage })), li = me(async () => ({ default: (await Promise.resolve().then(() => ml)).AdminProfilePage })), Za = me(async () => ({ default: (await Promise.resolve().then(() => In)).AdminCategoryCreatePage })), oi = me(async () => ({ default: (await Promise.resolve().then(() => In)).AdminCategoryEditPage })), en = me(async () => ({ default: (await Promise.resolve().then(() => Mn)).AdminPostCreatePage })), ci = me(async () => ({ default: (await Promise.resolve().then(() => Mn)).AdminPostEditPage })), di = me(async () => ({ default: (await Promise.resolve().then(() => Il)).AdminContentListPage })), ui = me(async () => ({ default: (await Promise.resolve().then(() => $n)).AdminPageCreatePage })), mi = me(async () => ({ default: (await Promise.resolve().then(() => $n)).AdminPageEditPage })), hi = me(async () => ({ default: (await Promise.resolve().then(() => jn)).AdminRoleCreatePage })), gi = me(async () => ({ default: (await Promise.resolve().then(() => jn)).AdminRoleEditPage })), pi = me(async () => ({ default: (await Promise.resolve().then(() => Hl)).AdminSettingsPage }));
function fi() {
  return /* @__PURE__ */ e(xa, { fallback: /* @__PURE__ */ e(ge, {}), children: /* @__PURE__ */ a(es, { children: [
    /* @__PURE__ */ e(ne, { path: `${Be}/login`, element: /* @__PURE__ */ e(bi, {}) }),
    /* @__PURE__ */ a(ne, { path: Be, element: /* @__PURE__ */ e(vi, {}), children: [
      /* @__PURE__ */ e(ne, { index: !0, element: /* @__PURE__ */ e(ei, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts", element: /* @__PURE__ */ e(Xa, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/new", element: /* @__PURE__ */ e(en, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/:id/edit", element: /* @__PURE__ */ e(an, {}) }),
      /* @__PURE__ */ e(ne, { path: "users", element: /* @__PURE__ */ e(ti, {}) }),
      /* @__PURE__ */ e(ne, { path: "users/new", element: /* @__PURE__ */ e(ai, {}) }),
      /* @__PURE__ */ e(ne, { path: "users/:id/edit", element: /* @__PURE__ */ e(Ni, {}) }),
      /* @__PURE__ */ e(ne, { path: "media", element: /* @__PURE__ */ e(si, {}) }),
      /* @__PURE__ */ e(ne, { path: "categories", element: /* @__PURE__ */ e(Qa, {}) }),
      /* @__PURE__ */ e(ne, { path: "categories/new", element: /* @__PURE__ */ e(Za, {}) }),
      /* @__PURE__ */ e(ne, { path: "categories/:id/edit", element: /* @__PURE__ */ e(tn, {}) }),
      /* @__PURE__ */ e(ne, { path: "menus", element: /* @__PURE__ */ e(ri, {}) }),
      /* @__PURE__ */ e(ne, { path: "profile", element: /* @__PURE__ */ e(li, {}) }),
      /* @__PURE__ */ e(ne, { path: "roles", element: /* @__PURE__ */ e(ii, {}) }),
      /* @__PURE__ */ e(ne, { path: "roles/new", element: /* @__PURE__ */ e(hi, {}) }),
      /* @__PURE__ */ e(ne, { path: "roles/:id/edit", element: /* @__PURE__ */ e(yi, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/page", element: /* @__PURE__ */ e(di, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/page/new", element: /* @__PURE__ */ e(ui, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/page/:id/edit", element: /* @__PURE__ */ e(xi, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/:type", element: /* @__PURE__ */ e(Xa, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/:type/new", element: /* @__PURE__ */ e(en, {}) }),
      /* @__PURE__ */ e(ne, { path: "posts/:type/:id/edit", element: /* @__PURE__ */ e(an, {}) }),
      /* @__PURE__ */ e(ne, { path: "categories/:type", element: /* @__PURE__ */ e(Qa, {}) }),
      /* @__PURE__ */ e(ne, { path: "categories/:type/new", element: /* @__PURE__ */ e(Za, {}) }),
      /* @__PURE__ */ e(ne, { path: "categories/:type/:id/edit", element: /* @__PURE__ */ e(tn, {}) }),
      /* @__PURE__ */ e(ne, { path: "settings", element: /* @__PURE__ */ e(pi, {}) })
    ] }),
    /* @__PURE__ */ e(ne, { path: "*", element: /* @__PURE__ */ e(st, { to: Be, replace: !0 }) })
  ] }) });
}
function bi() {
  const { loading: t, session: n } = Ze();
  return t ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ e(st, { to: Be, replace: !0 }) : /* @__PURE__ */ e(Zr, {});
}
function vi() {
  const { loading: t, session: n } = Ze(), s = dt();
  return t ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ a(Tr, { children: [
    /* @__PURE__ */ e(
      Qr,
      {
        user: n.user,
        permissions: n.permissions,
        roleName: n.roleName,
        pathname: s.pathname
      }
    ),
    /* @__PURE__ */ e(Lr, { children: /* @__PURE__ */ e("div", { className: "flex min-h-svh flex-1 flex-col bg-background", children: /* @__PURE__ */ e(ts, {}) }) })
  ] }) : /* @__PURE__ */ e(st, { to: `${Be}/login`, replace: !0 });
}
function tn() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(oi, { id: t }) : /* @__PURE__ */ e(st, { to: `${Be}/categories`, replace: !0 });
}
function an() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(ci, { id: t }) : /* @__PURE__ */ e(st, { to: `${Be}/posts`, replace: !0 });
}
function xi() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(mi, { id: t }) : /* @__PURE__ */ e(st, { to: `${Be}/posts/page`, replace: !0 });
}
function Ni() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(ni, { id: t }) : /* @__PURE__ */ e(st, { to: `${Be}/users`, replace: !0 });
}
function yi() {
  const { id: t } = Ve();
  return t ? /* @__PURE__ */ e(gi, { id: t }) : /* @__PURE__ */ e(st, { to: `${Be}/roles`, replace: !0 });
}
const wi = ({ ...t }) => {
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
function Ci(t) {
  return t != null && t !== "" && t !== "all";
}
function Ce(t, n) {
  if (!n)
    return t;
  const s = n instanceof URLSearchParams ? new URLSearchParams(n.toString()) : new URLSearchParams();
  if (!(n instanceof URLSearchParams))
    for (const [i, r] of Object.entries(n))
      Ci(r) && s.set(i, String(r));
  const l = s.toString();
  return l ? `${t}?${l}` : t;
}
let pa = null;
function nn(t) {
  pa = t;
}
function ki(t, n) {
  if (pa) {
    pa(t, n);
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
function Xe(t, n) {
  ki(Ce(t, n));
}
function Si() {
  const t = Qe();
  return te(() => (nn((n, s) => {
    t(n, { replace: s?.replace });
  }), () => {
    nn(null);
  }), [t]), null;
}
function Oo({ pathname: t }) {
  return /* @__PURE__ */ a(as, { children: [
    /* @__PURE__ */ e(wi, { richColors: !0, position: "top-right" }),
    /* @__PURE__ */ e(Si, {}),
    /* @__PURE__ */ e(hr, { children: /* @__PURE__ */ e(fi, {}) })
  ] });
}
function et({
  children: t,
  className: n
}) {
  return /* @__PURE__ */ e("main", { className: S("flex min-h-full flex-1 flex-col bg-background", n), children: t });
}
function Se({
  title: t,
  search: n,
  actions: s
}) {
  return /* @__PURE__ */ a("header", { className: "z-10 flex min-h-13 items-center gap-3 border-b border-border/70 bg-background px-4", children: [
    /* @__PURE__ */ e(Er, {}),
    /* @__PURE__ */ e("h1", { className: "min-w-0 truncate text-sm font-medium text-foreground", children: t }),
    n || s ? /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
      n,
      s
    ] }) : null
  ] });
}
function Pi({
  children: t
}) {
  return /* @__PURE__ */ e("section", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: t });
}
function ft({
  label: t,
  value: n,
  hint: s
}) {
  return /* @__PURE__ */ a(Pe, { className: "bg-card shadow-sm", children: [
    /* @__PURE__ */ a(_e, { className: "gap-2", children: [
      /* @__PURE__ */ e(Ia, { className: "text-xs uppercase tracking-[0.2em]", children: t }),
      /* @__PURE__ */ e(Ae, { className: "text-2xl", children: n })
    ] }),
    /* @__PURE__ */ e(ze, { className: "pt-0 text-sm text-muted-foreground", children: s })
  ] });
}
function Ge({
  title: t,
  description: n,
  children: s,
  className: l
}) {
  return /* @__PURE__ */ a(Pe, { className: S("bg-card shadow-sm", l), children: [
    /* @__PURE__ */ a(_e, { className: "border-b border-border/70", children: [
      /* @__PURE__ */ e(Ae, { children: t }),
      n ? /* @__PURE__ */ e(Ia, { children: n }) : null
    ] }),
    /* @__PURE__ */ e(ze, { className: "", children: s })
  ] });
}
function _i() {
  const [t, n] = d(null), [s, l] = d(null), { session: i } = Ze(), r = [
    { label: "Pages", slug: "page" },
    { label: "Posts", slug: "post" },
    ...Zt().contentTypes.filter(
      (c) => c.slug !== "page" && c.slug !== "post"
    )
  ];
  r.find(
    (c) => i?.permissions.includes(`content.${c.slug}.create`)
  ), i?.permissions.includes("media.view");
  async function o() {
    l(null);
    const c = await ue("/api/admin/dashboard");
    n(c);
  }
  return te(() => {
    o().catch((c) => l(c.message));
  }, []), s ? /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) }) : t ? /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Dashboard"
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a(Pi, { children: [
        /* @__PURE__ */ e(
          ft,
          {
            label: "Total Content",
            value: String(t.totalPosts),
            hint: "All content across every status"
          }
        ),
        /* @__PURE__ */ e(
          ft,
          {
            label: "Published",
            value: String(t.publishedPosts),
            hint: "Content visible to visitors"
          }
        ),
        /* @__PURE__ */ e(
          ft,
          {
            label: "Drafts",
            value: String(t.draftPosts),
            hint: "Content waiting to be finished"
          }
        ),
        /* @__PURE__ */ e(
          ft,
          {
            label: "Media",
            value: String(t.totalMedia),
            hint: "Uploaded files and images"
          }
        ),
        /* @__PURE__ */ e(
          ft,
          {
            label: "Users",
            value: String(t.totalUsers),
            hint: "Registered admin accounts"
          }
        ),
        /* @__PURE__ */ e(
          ft,
          {
            label: "Categories",
            value: String(t.totalCategories),
            hint: "Content taxonomies"
          }
        )
      ] }),
      /* @__PURE__ */ e("section", { children: /* @__PURE__ */ e(
        Ge,
        {
          title: "Content workspace",
          description: "Start, review, and organize the content you can access.",
          children: /* @__PURE__ */ a("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            r.filter((c) => i?.permissions.includes(`content.${c.slug}.view`)).map((c) => /* @__PURE__ */ e(
              Ai,
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
function Ai({
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
const zi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminDashboardPage: _i
}, Symbol.toStringTag, { value: "Module" })), Ii = _t(
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
function Ue({
  className: t,
  variant: n = "default",
  render: s,
  ...l
}) {
  return Yt({
    defaultTagName: "span",
    props: Jt(
      {
        className: S(Ii({ variant: n }), t)
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
const xe = ye.forwardRef(
  ({ className: t, checked: n, onCheckedChange: s, disabled: l, ...i }, r) => /* @__PURE__ */ a(
    "label",
    {
      "data-slot": "checkbox",
      className: S(
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
const Ie = Me.Root;
function Te({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    Me.Value,
    {
      "data-slot": "select-value",
      className: S("flex flex-1 text-left", t),
      ...n
    }
  );
}
function De({
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
      className: S(
        "flex w-fit items-center justify-between gap-1.5 rounded-sm border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-sm-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...l,
      children: [
        s,
        /* @__PURE__ */ e(
          Me.Icon,
          {
            render: /* @__PURE__ */ e(mn, { className: "pointer-events-none size-4 text-muted-foreground" })
          }
        )
      ]
    }
  );
}
function Ee({
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
          className: S("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", t),
          ...c,
          children: [
            /* @__PURE__ */ e(Ti, {}),
            /* @__PURE__ */ e(Me.List, { children: n }),
            /* @__PURE__ */ e(Di, {})
          ]
        }
      )
    }
  ) });
}
function re({
  className: t,
  children: n,
  ...s
}) {
  return /* @__PURE__ */ a(
    Me.Item,
    {
      "data-slot": "select-item",
      className: S(
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
function Ti({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    Me.ScrollUpArrow,
    {
      "data-slot": "select-scroll-up-button",
      className: S(
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
function Di({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    Me.ScrollDownArrow,
    {
      "data-slot": "select-scroll-down-button",
      className: S(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        t
      ),
      ...n,
      children: /* @__PURE__ */ e(
        mn,
        {}
      )
    }
  );
}
function zt({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto rounded-lg border border-border/70 bg-card",
      children: /* @__PURE__ */ e(
        "table",
        {
          "data-slot": "table",
          className: S("w-full table-auto caption-bottom text-sm", t),
          ...n
        }
      )
    }
  );
}
function It({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "thead",
    {
      "data-slot": "table-header",
      className: S("[&_tr]:border-b", t),
      ...n
    }
  );
}
function Tt({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "tbody",
    {
      "data-slot": "table-body",
      className: S("[&_tr:last-child]:border-0", t),
      ...n
    }
  );
}
function ke({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "tr",
    {
      "data-slot": "table-row",
      className: S(
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
      className: S(
        "h-10 px-2 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        t
      ),
      ...n
    }
  );
}
function se({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "td",
    {
      "data-slot": "table-cell",
      className: S(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        t
      ),
      ...n
    }
  );
}
const kt = {
  post: "Post",
  page: "Page",
  category: "Category",
  "custom field": "Custom field",
  section: "Section",
  user: "User",
  role: "Role",
  media: "Media",
  menu: "Menu",
  "menu item": "Menu item",
  profile: "Profile",
  "selected media": "Selected media",
  url: "URL"
}, Ei = {
  create: "created",
  update: "updated",
  delete: "deleted"
}, W = {
  success(t, n) {
    tt.success(`${kt[n]} ${Ei[t]}.`);
  },
  error(t) {
    tt.error(t);
  },
  uploaded(t) {
    tt.success(`Uploaded ${t}.`);
  },
  uploadedMany(t) {
    tt.success(t === 1 ? "Media uploaded." : `${t} files uploaded.`);
  },
  copied(t) {
    tt.success(`${kt[t]} copied.`);
  },
  published(t) {
    tt.success(`${kt[t]} published.`);
  },
  unpublished(t) {
    tt.success(`${kt[t]} unpublished.`);
  },
  saved(t) {
    tt.success(`${kt[t]} saved.`);
  }
};
function Li({ contentType: t, pageTitle: n }) {
  const [s, l] = d(null), [i, r] = d(null), [o, c] = d([]), [u, m] = d(!1), y = dt(), _ = Qe(), { type: h } = Ve(), E = t ?? h ?? "post", z = t || h ? `/admin/posts/${E}` : "/admin/posts", [O, R] = d(
    new URLSearchParams(y.search).get("search") ?? ""
  ), [b, p] = d(
    new URLSearchParams(y.search).get("status") ?? "all"
  ), [g, N] = d(
    new URLSearchParams(y.search).get("sortBy") ?? ""
  ), [P, U] = d(
    new URLSearchParams(y.search).get("sortOrder") ?? ""
  );
  async function k() {
    r(null);
    const D = new URLSearchParams();
    O && D.set("search", O), b && b !== "all" && D.set("status", b), g && D.set("sortBy", g), P && D.set("sortOrder", P), D.set("type", E);
    const Y = D.toString() ? `?${D.toString()}` : "", K = await ue(`/api/admin/posts${Y}`);
    l(K), c([]);
  }
  te(() => {
    k().catch((D) => r(D.message));
  }, [y.search, E]);
  function C() {
    _(Ce(z, { search: O, status: b, sortBy: g, sortOrder: P }));
  }
  function f(D) {
    const Y = g === D && P === "asc" ? "desc" : "asc";
    N(D), U(Y), _(Ce(z, { search: O, status: b, sortBy: D, sortOrder: Y }));
  }
  function I(D) {
    D.key === "Enter" && (D.preventDefault(), C());
  }
  const B = Re(!0);
  te(() => {
    if (B.current) {
      B.current = !1;
      return;
    }
    const D = setTimeout(() => {
      C();
    }, 400);
    return () => clearTimeout(D);
  }, [O, b, E]);
  const V = q((D) => {
    s?.data && c(D ? s.data.map((Y) => Y.id) : []);
  }, [s]), M = q((D, Y) => {
    c(
      (K) => Y ? [...K, D] : K.filter((Z) => Z !== D)
    );
  }, []), w = s?.data?.length > 0 && o.length === s.data.length, A = o.length > 0;
  async function v(D, Y) {
    if (o.length === 0) return;
    m(!0);
    const K = await Le(D, { ids: o });
    m(!1), K.success ? (W.success("update", "post"), await k()) : W.error(K.message);
  }
  const Q = q(async () => {
    o.length !== 0 && confirm(`Delete ${o.length} post(s)? This action cannot be undone.`) && await v("/api/admin/posts/bulk/delete");
  }, [o]), T = q(async () => {
    await v("/api/admin/posts/bulk/publish");
  }, [o]), $ = q(async () => {
    await v("/api/admin/posts/bulk/unpublish");
  }, [o]), J = q(async () => {
    await v("/api/admin/posts/bulk/duplicate");
  }, [o]);
  if (i) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    i
  ] }) });
  if (!s) return /* @__PURE__ */ e(ge, {});
  const j = s.data ?? [];
  function X(D) {
    return Ce(z, { search: O, status: b, sortBy: g, sortOrder: P, page: D });
  }
  return /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: n ?? "Posts",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by title...",
            value: O,
            onChange: (D) => R(D.target.value),
            onKeyDown: I,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ a(fe, { to: `${z}/new`, className: S(At({ size: "lg" })), children: [
          "New ",
          E.charAt(0).toUpperCase() + E.slice(1)
        ] })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ a(Ie, { value: b, onValueChange: (D) => {
          D && p(D);
        }, children: [
          /* @__PURE__ */ e(De, { className: "w-[140px]", children: /* @__PURE__ */ e(Te, { placeholder: "Status" }) }),
          /* @__PURE__ */ a(Ee, { children: [
            /* @__PURE__ */ e(re, { value: "all", children: "All Status" }),
            /* @__PURE__ */ e(re, { value: "draft", children: "Draft" }),
            /* @__PURE__ */ e(re, { value: "published", children: "Published" })
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: C, children: "Filter" })
      ] }),
      A && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
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
              onClick: T,
              disabled: u,
              children: "Publish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: $,
              disabled: u,
              children: "Unpublish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: J,
              disabled: u,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: Q,
              disabled: u,
              children: "Delete"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => c([]),
              disabled: u,
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ a(zt, { children: [
        /* @__PURE__ */ e(It, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: w,
              onCheckedChange: (D) => V(D === !0),
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
                g === "title" ? P === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
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
                g === "updatedAt" ? P === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Published" })
        ] }) }),
        /* @__PURE__ */ e(Tt, { children: j.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(se, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No content found." }) }) : j.map((D) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(se, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: o.includes(D.id),
              onCheckedChange: (Y) => M(D.id, Y === !0),
              "aria-label": `Select ${D.title}`
            }
          ) }),
          /* @__PURE__ */ e(se, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
            D.featuredImage ? /* @__PURE__ */ e("img", { src: D.featuredImage, alt: "", className: "size-10 rounded-sm border object-cover" }) : /* @__PURE__ */ e("div", { className: "size-10 rounded-sm border bg-muted" }),
            /* @__PURE__ */ e(fe, { to: `${z}/${D.id}/edit`, className: "underline", children: D.title })
          ] }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(
            Ue,
            {
              variant: D.status === "published" ? "default" : "secondary",
              className: D.status === "published" ? "border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300" : "capitalize",
              children: D.status
            }
          ) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(D.updatedAt * 1e3).toLocaleDateString() }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: D.publishedAt ? new Date(D.publishedAt).toLocaleDateString() : "—" })
        ] }, D.id)) })
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
const Mi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminContentListPage: Li
}, Symbol.toStringTag, { value: "Module" }));
function Ri() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), u = dt(), m = Qe(), [y, _] = d(
    new URLSearchParams(u.search).get("search") ?? ""
  ), [h, E] = d(
    new URLSearchParams(u.search).get("roleId") ?? "all"
  ), [z, O] = d(
    new URLSearchParams(u.search).get("sortBy") ?? ""
  ), [R, b] = d(
    new URLSearchParams(u.search).get("sortOrder") ?? ""
  );
  async function p() {
    l(null);
    const v = await ue(`/api/admin/users${u.search}`);
    n(v), r([]);
  }
  te(() => {
    p().catch((v) => l(v.message));
  }, [u.search]);
  function g() {
    m(Ce("/admin/users", { search: y, roleId: h, sortBy: z, sortOrder: R }));
  }
  function N(v) {
    const Q = z === v && R === "asc" ? "desc" : "asc";
    O(v), b(Q), m(Ce("/admin/users", { search: y, roleId: h, sortBy: v, sortOrder: Q }));
  }
  function P(v) {
    v.key === "Enter" && (v.preventDefault(), g());
  }
  const U = Re(!0);
  te(() => {
    if (U.current) {
      U.current = !1;
      return;
    }
    const v = setTimeout(() => {
      g();
    }, 400);
    return () => clearTimeout(v);
  }, [y, h]);
  const k = q((v) => {
    t?.data && r(v ? t.data.map((Q) => Q.id) : []);
  }, [t]), C = q((v, Q) => {
    r(
      (T) => Q ? [...T, v] : T.filter(($) => $ !== v)
    );
  }, []), f = t?.data?.length > 0 && i.length === t.data.length, I = i.length > 0;
  async function B(v) {
    if (i.length === 0) return;
    c(!0);
    const Q = await Le(v, { ids: i });
    c(!1), Q.success ? (W.success("update", "user"), await p()) : W.error(Q.message);
  }
  const V = q(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} user(s)? This action cannot be undone.`) && await B("/api/admin/users/bulk/delete");
  }, [i]), M = q(async () => {
    await B("/api/admin/users/bulk/duplicate");
  }, [i]);
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const w = t.data ?? [];
  function A(v) {
    return Ce("/admin/users", { search: y, roleId: h, sortBy: z, sortOrder: R, page: v });
  }
  return /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Users",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by name...",
            value: y,
            onChange: (v) => _(v.target.value),
            onKeyDown: P,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ e(fe, { to: "/admin/users/new", className: S(At({ size: "lg" })), children: "New User" })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ a(Ie, { value: h, onValueChange: (v) => {
          v && E(v);
        }, children: [
          /* @__PURE__ */ e(De, { className: "w-[160px]", children: /* @__PURE__ */ e(Te, { placeholder: "Role" }) }),
          /* @__PURE__ */ a(Ee, { children: [
            /* @__PURE__ */ e(re, { value: "all", children: "All Roles" }),
            t.roles?.map((v) => /* @__PURE__ */ e(re, { value: v.id, children: v.name }, v.id))
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: g, children: "Filter" })
      ] }),
      I && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
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
              onClick: M,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: V,
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
      /* @__PURE__ */ a(zt, { children: [
        /* @__PURE__ */ e(It, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: f,
              onCheckedChange: (v) => k(v === !0),
              "aria-label": "Select all users"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => N("name"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Name",
                z === "name" ? R === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Email" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Role" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => N("updatedAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Updated",
                z === "updatedAt" ? R === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Tt, { children: w.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(se, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No users found." }) }) : w.map((v) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(se, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(v.id),
              onCheckedChange: (Q) => C(v.id, Q === !0),
              "aria-label": `Select ${v.name}`
            }
          ) }),
          /* @__PURE__ */ e(se, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `/admin/users/${v.id}/edit`, className: "underline", children: v.name }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: v.email }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(Ue, { variant: "outline", className: "capitalize", children: v.roleName ?? "No role" }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(v.updatedAt * 1e3).toLocaleDateString() })
        ] }, v.id)) })
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
          t.meta.currentPage > 1 && /* @__PURE__ */ e(fe, { to: A(t.meta.currentPage - 1), className: "hover:text-foreground hover:underline", children: "Previous" }),
          t.meta.currentPage < t.meta.lastPage && /* @__PURE__ */ e(fe, { to: A(t.meta.currentPage + 1), className: "hover:text-foreground hover:underline", children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
const $i = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminUsersPage: Ri
}, Symbol.toStringTag, { value: "Module" }));
function Dt({
  children: t,
  className: n
}) {
  return /* @__PURE__ */ e("div", { className: S("grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]", n), children: t });
}
function Et({ children: t, className: n }) {
  return /* @__PURE__ */ e("div", { className: S("min-w-0 space-y-4", n), children: t });
}
function Lt({ children: t, className: n }) {
  return /* @__PURE__ */ e("aside", { className: S("min-w-0 space-y-4", n), children: t });
}
function je({
  title: t,
  description: n,
  children: s,
  className: l,
  contentClassName: i
}) {
  return /* @__PURE__ */ a(Pe, { className: S("overflow-hidden border-border/60 shadow-sm", l), children: [
    /* @__PURE__ */ a(_e, { children: [
      /* @__PURE__ */ e(Ae, { className: "text-base", children: t }),
      n ? /* @__PURE__ */ e(Ia, { children: n }) : null
    ] }),
    /* @__PURE__ */ e(ze, { className: S("space-y-5", i), children: s })
  ] });
}
function Sn({ user: t, roles: n = [], mode: s, pageTitle: l }) {
  const [i, r] = yt(), [o, c] = d({}), [u, m] = d(null), [y, _] = d(t?.name ?? ""), [h, E] = d(t?.email ?? ""), [z, O] = d(""), [R, b] = d(t?.roleId ?? ""), p = n.find((N) => N.id === R)?.name;
  function g(N) {
    N.preventDefault(), c({}), m(null);
    const P = {
      name: y,
      email: h
    };
    z && (P.password = z), R && (P.roleId = R), r(async () => {
      let U;
      s === "edit" && t ? U = await rt(`/api/admin/users/${t.id}`, P) : U = await Le("/api/admin/users", P), U.success ? (W.success(s === "edit" ? "update" : "create", "user"), Xe("/admin/users")) : U.errors && Object.keys(U.errors).length > 0 ? (c(U.errors), W.error(U.message)) : (m(U.message), W.error(U.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: g, className: "", children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: l || "Users",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: i, children: i ? s === "edit" ? "Saving…" : "Creating…" : s === "edit" ? "Save Changes" : "Create User" }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Xe("/admin/users"),
              disabled: i,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    u && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: u }),
    /* @__PURE__ */ a(Dt, { children: [
      /* @__PURE__ */ e(Et, { children: /* @__PURE__ */ e(je, { title: "User details", children: /* @__PURE__ */ a("div", { className: "grid gap-5", children: [
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a(L, { htmlFor: "name", children: [
            "Name ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "name",
              value: y,
              onChange: (N) => _(N.target.value),
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
          /* @__PURE__ */ a(L, { htmlFor: "email", children: [
            "Email ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "email",
              type: "email",
              value: h,
              onChange: (N) => E(N.target.value),
              placeholder: "user@example.com",
              required: !0,
              "aria-invalid": !!o.email,
              "aria-describedby": o.email ? "email-error" : void 0
            }
          ),
          o.email && /* @__PURE__ */ e("p", { id: "email-error", className: "text-xs text-destructive", children: o.email[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a(L, { htmlFor: "password", children: [
            "Password",
            " ",
            s === "create" && /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "password",
              type: "password",
              value: z,
              onChange: (N) => O(N.target.value),
              placeholder: s === "edit" ? "Leave blank to keep current" : "Minimum 8 characters",
              required: s === "create",
              minLength: s === "create" ? 8 : void 0,
              maxLength: 128,
              "aria-invalid": !!o.password,
              "aria-describedby": o.password ? "password-error" : void 0
            }
          ),
          o.password && /* @__PURE__ */ e("p", { id: "password-error", className: "text-xs text-destructive", children: o.password[0] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ e(je, { title: "Organization", children: /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ e(L, { htmlFor: "role", children: "Role" }),
        n.length > 0 ? /* @__PURE__ */ a(Ie, { value: R || "none", onValueChange: (N) => b(N === "none" || !N ? "" : N), children: [
          /* @__PURE__ */ e(De, { id: "role", children: /* @__PURE__ */ e(Te, { placeholder: "Select role", children: p ?? (R ? "No role" : void 0) }) }),
          /* @__PURE__ */ a(Ee, { children: [
            /* @__PURE__ */ e(re, { value: "none", children: "No role" }),
            n.map((N) => /* @__PURE__ */ e(re, { value: N.id, children: N.name }, N.id))
          ] })
        ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No roles available." }),
        o.roleId && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: o.roleId[0] })
      ] }) }) })
    ] })
  ] });
}
function Oi() {
  const [t, n] = d([]), [s, l] = d(!0);
  return te(() => {
    ue("/api/admin/roles").then((i) => {
      n(i.roles), l(!1);
    });
  }, []), s ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    Sn,
    {
      mode: "create",
      roles: t,
      pageTitle: "Create User"
    }
  ) });
}
function Bi({ id: t }) {
  const [n, s] = d(null), [l, i] = d([]), [r, o] = d(!0);
  return te(() => {
    Promise.all([
      ue(`/api/admin/users/${t}`),
      ue("/api/admin/roles")
    ]).then(([c, u]) => {
      s(c), i(u.roles), o(!1);
    });
  }, [t]), r ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    Sn,
    {
      mode: "edit",
      user: n,
      roles: l,
      pageTitle: "Edit User"
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "User not found." });
}
const Pn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminUserCreatePage: Oi,
  AdminUserEditPage: Bi
}, Symbol.toStringTag, { value: "Module" }));
function _n({
  onUploadComplete: t,
  onUploadError: n,
  accept: s,
  className: l,
  compact: i = !1
}) {
  const [r, o] = d(!1), [c, u] = d([]), m = Re(null), y = q((b) => {
    b.preventDefault(), b.stopPropagation(), o(!0);
  }, []), _ = q((b) => {
    b.preventDefault(), b.stopPropagation(), o(!1);
  }, []), h = q(
    async (b) => {
      const p = Math.random().toString(36).slice(2);
      u((g) => [...g, { id: p, file: b, progress: 0 }]);
      try {
        const g = new FormData();
        g.append("file", b);
        const P = await (await fetch("/api/admin/media/upload", {
          method: "POST",
          body: g
        })).json();
        if (!P.success) {
          const U = P.message || "Upload failed";
          return u(
            (k) => k.map(
              (C) => C.id === p ? { ...C, error: U } : C
            )
          ), n?.(U), W.error(U), null;
        }
        return u((U) => U.filter((k) => k.id !== p)), t?.(P.data), W.uploaded(b.name), P.data;
      } catch {
        const g = "Upload failed. Please try again.";
        return u(
          (N) => N.map(
            (P) => P.id === p ? { ...P, error: g } : P
          )
        ), n?.(g), W.error(g), null;
      }
    },
    [t, n]
  ), E = q(
    async (b) => {
      b.preventDefault(), b.stopPropagation(), o(!1);
      const p = Array.from(b.dataTransfer.files);
      if (p.length !== 0)
        for (const g of p)
          s && !ji(g.type, s) || await h(g);
    },
    [s, h]
  ), z = q(
    async (b) => {
      const p = Array.from(b.target.files || []);
      if (p.length !== 0) {
        for (const g of p)
          await h(g);
        m.current && (m.current.value = "");
      }
    },
    [h]
  ), O = q(() => {
    m.current?.click();
  }, []), R = q((b) => {
    u((p) => p.filter((g) => g.id !== b));
  }, []);
  return /* @__PURE__ */ a("div", { className: S("space-y-2", l), children: [
    /* @__PURE__ */ a(
      "div",
      {
        onDragOver: y,
        onDragLeave: _,
        onDrop: E,
        onClick: O,
        role: "button",
        tabIndex: 0,
        onKeyDown: (b) => {
          (b.key === "Enter" || b.key === " ") && (b.preventDefault(), O());
        },
        "aria-label": "Upload media files",
        className: S(
          "relative cursor-pointer rounded-sm border-2 border-dashed transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          r && "border-primary bg-primary/5",
          i ? "p-4" : "p-8",
          "flex flex-col items-center justify-center gap-2 text-center"
        ),
        children: [
          /* @__PURE__ */ e(
            Ns,
            {
              className: S(
                "text-muted-foreground",
                i ? "h-5 w-5" : "h-8 w-8"
              )
            }
          ),
          !i && /* @__PURE__ */ a(He, { children: [
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
        onChange: z,
        className: "hidden",
        "aria-hidden": "true"
      }
    ),
    c.length > 0 && /* @__PURE__ */ e("div", { className: "space-y-1", children: c.map((b) => /* @__PURE__ */ a(
      "div",
      {
        className: S(
          "flex items-center gap-2 rounded-sm border px-3 py-2 text-sm",
          b.error ? "border-destructive/50 bg-destructive/10" : "border-border"
        ),
        children: [
          b.error ? /* @__PURE__ */ e(Nt, { className: "h-4 w-4 text-destructive" }) : /* @__PURE__ */ e(hn, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
          /* @__PURE__ */ a("span", { className: "flex-1 truncate", children: [
            b.file.name,
            b.error && /* @__PURE__ */ e("span", { className: "ml-2 text-destructive", children: b.error })
          ] }),
          b.error && /* @__PURE__ */ e(
            x,
            {
              variant: "ghost",
              size: "icon-sm",
              onClick: (p) => {
                p.stopPropagation(), R(b.id);
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
function ji(t, n) {
  return n ? n.split(",").map((l) => l.trim()).some((l) => {
    if (l.endsWith("/*")) {
      const i = l.replace("/*", "/");
      return t.startsWith(i);
    }
    return t === l;
  }) : !0;
}
function Ui() {
  const t = dt(), n = Qe(), [s, l] = d(null), [i, r] = d(!1), [o, c] = d(
    new URLSearchParams(t.search).get("search") ?? ""
  ), [u, m] = d(1), [y, _] = d(/* @__PURE__ */ new Set()), [h, E] = d([]);
  function z(f) {
    const I = u, B = new URLSearchParams(t.search);
    o && B.set("search", o), B.set("page", String(I)), B.set("perPage", "30"), ue(`/api/admin/media?${B.toString()}`).then(l);
  }
  te(() => {
    z();
  }, [t.search, u]);
  const O = Re(!0);
  te(() => {
    if (O.current) {
      O.current = !1;
      return;
    }
    const f = setTimeout(() => {
      const I = new URLSearchParams(t.search);
      o ? I.set("search", o) : I.delete("search"), I.delete("page"), m(1), n(`/admin/media?${I.toString()}`);
    }, 400);
    return () => clearTimeout(f);
  }, [o]);
  function R(f, I) {
    confirm(`Delete "${I}"?`) && yn(`/api/admin/media/${f}`).then((B) => {
      B.success ? (W.success("delete", "media"), z()) : W.error(B.message);
    });
  }
  const b = s != null && s.data.length > 0 && h.length === s.data.length, p = h.length > 0;
  function g(f) {
    !s?.data || s == null || E(f ? s.data.map((I) => I.id) : []);
  }
  function N(f, I) {
    E(I ? (B) => [...B, f] : (B) => B.filter((V) => V !== f));
  }
  function P() {
    E([]);
  }
  function U() {
    h.length !== 0 && confirm(`Delete ${h.length} item(s)? This cannot be undone.`) && Le("/api/admin/media/bulk/delete", { ids: h }).then((f) => {
      f.success ? (W.success("delete", "selected media"), E([]), z()) : W.error(f.message);
    });
  }
  function k(f) {
    navigator.clipboard.writeText(f).then(() => W.copied("url"));
  }
  function C(f) {
    return f < 1024 ? `${f} B` : f < 1024 * 1024 ? `${(f / 1024).toFixed(1)} KB` : `${(f / (1024 * 1024)).toFixed(1)} MB`;
  }
  return /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Media",
        search: /* @__PURE__ */ a("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ e(gn, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
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
      i && /* @__PURE__ */ e(_n, { onUploadComplete: () => {
        r(!1), z();
      } }),
      p && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
        /* @__PURE__ */ a("span", { className: "text-sm text-muted-foreground", children: [
          h.length,
          " selected"
        ] }),
        /* @__PURE__ */ a("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ a(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: U,
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
              onClick: P,
              children: "Clear"
            }
          )
        ] })
      ] }),
      s ? s.data.length === 0 ? /* @__PURE__ */ a("div", { className: "flex flex-col items-center justify-center py-16", children: [
        /* @__PURE__ */ e(Pt, { className: "h-12 w-12 text-muted-foreground/40" }),
        /* @__PURE__ */ e("p", { className: "mt-3 text-sm text-muted-foreground", children: "No media found." })
      ] }) : /* @__PURE__ */ a(He, { children: [
        /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e(
            xe,
            {
              checked: b,
              onCheckedChange: (f) => g(f === !0),
              "aria-label": "Select all media"
            }
          ),
          /* @__PURE__ */ e("span", { className: "text-xs text-muted-foreground", children: b ? `${h.length} selected` : "Select all" })
        ] }),
        /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: s.data.map((f) => {
          const I = f.mimeType.startsWith("image/"), B = y.has(f.id);
          return /* @__PURE__ */ a(
            "div",
            {
              className: "group relative overflow-hidden rounded-sm border bg-muted/30",
              children: [
                /* @__PURE__ */ a("div", { className: "aspect-square", children: [
                  I && !B ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: f.thumbnailUrl || f.url,
                      alt: f.alt || f.name,
                      className: "h-full w-full object-cover",
                      onError: () => _((V) => new Set(V).add(f.id))
                    }
                  ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(Nt, { className: "h-10 w-10 text-muted-foreground/50" }) }),
                  /* @__PURE__ */ e(
                    "div",
                    {
                      className: S(
                        "absolute top-1.5 left-1.5 z-10",
                        !p && "opacity-0 group-hover:opacity-100 transition-opacity"
                      ),
                      onClick: (V) => V.stopPropagation(),
                      children: /* @__PURE__ */ e(
                        xe,
                        {
                          checked: h.includes(f.id),
                          onCheckedChange: (V) => N(f.id, V === !0),
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
                      children: /* @__PURE__ */ e(ya, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ e(
                    x,
                    {
                      type: "button",
                      size: "icon-sm",
                      variant: "ghost",
                      onClick: () => R(f.id, f.name),
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
                    C(f.size),
                    f.width && f.height && ` · ${f.width}×${f.height}`
                  ] })
                ] })
              ]
            },
            f.id
          );
        }) })
      ] }) : /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: Array.from({ length: 12 }).map((f, I) => /* @__PURE__ */ e(Cn, { className: "aspect-square rounded-sm" }, I)) }),
      s && s.meta.lastPage > 1 && /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-3 pt-2", children: [
        /* @__PURE__ */ e(
          x,
          {
            variant: "outline",
            size: "sm",
            disabled: u <= 1,
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
            disabled: u >= s.meta.lastPage,
            onClick: () => m((f) => f + 1),
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
const Fi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminMediaPage: Ui
}, Symbol.toStringTag, { value: "Module" }));
function Hi() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), u = dt(), m = Qe(), { type: y = "post" } = Ve(), [_, h] = d(
    new URLSearchParams(u.search).get("search") ?? ""
  ), [E, z] = d(
    new URLSearchParams(u.search).get("sortBy") ?? ""
  ), [O, R] = d(
    new URLSearchParams(u.search).get("sortOrder") ?? ""
  );
  async function b() {
    l(null);
    const A = new URLSearchParams();
    _ && A.set("search", _), E && A.set("sortBy", E), O && A.set("sortOrder", O), A.set("type", y);
    const v = A.toString() ? `?${A.toString()}` : "", Q = await ue(`/api/admin/categories${v}`);
    n(Q), r([]);
  }
  te(() => {
    b().catch((A) => l(A.message));
  }, [u.search, y]);
  function p() {
    m(Ce(`/admin/categories/${y}`, { search: _, sortBy: E, sortOrder: O }));
  }
  function g(A) {
    const v = E === A && O === "asc" ? "desc" : "asc";
    z(A), R(v), m(Ce(`/admin/categories/${y}`, { search: _, sortBy: A, sortOrder: v }));
  }
  function N(A) {
    A.key === "Enter" && (A.preventDefault(), p());
  }
  const P = Re(!0);
  te(() => {
    if (P.current) {
      P.current = !1;
      return;
    }
    const A = setTimeout(() => {
      p();
    }, 400);
    return () => clearTimeout(A);
  }, [_]);
  const U = q((A) => {
    t && r(A ? t.map((v) => v.id) : []);
  }, [t]), k = q((A, v) => {
    r(
      (Q) => v ? [...Q, A] : Q.filter((T) => T !== A)
    );
  }, []), C = t?.length > 0 && i.length === t.length, f = i.length > 0;
  async function I(A, v = {}) {
    if (i.length === 0) return;
    c(!0);
    const Q = await Le(A, { ids: i, ...v });
    c(!1), Q.success ? (W.success("update", "category"), await b()) : W.error(Q.message);
  }
  const B = q(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} category(ies)? This action cannot be undone.`) && await I("/api/admin/categories/bulk/delete");
  }, [i]), V = q(async () => {
    await I("/api/admin/categories/bulk/duplicate");
  }, [i]), M = q(async (A) => {
    await I("/api/admin/categories/bulk/status", { status: A });
  }, [i]);
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const w = t ?? [];
  return /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Categories",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by name...",
            value: _,
            onChange: (A) => h(A.target.value),
            onKeyDown: N,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ e(fe, { to: `/admin/categories/${y}/new`, className: S(At({ size: "lg" })), children: "New Category" })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ e("div", { className: "flex flex-wrap items-center gap-3", children: /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: p, children: "Filter" }) }),
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
              onClick: V,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(x, { variant: "outline", size: "sm", onClick: () => M("published"), disabled: o, children: "Publish" }),
          /* @__PURE__ */ e(x, { variant: "outline", size: "sm", onClick: () => M("draft"), disabled: o, children: "Unpublish" }),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: B,
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
      /* @__PURE__ */ a(zt, { children: [
        /* @__PURE__ */ e(It, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: C,
              onCheckedChange: (A) => U(A === !0),
              "aria-label": "Select all categories"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => g("name"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Name",
                E === "name" ? O === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Slug" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Status" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => g("createdAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Created",
                E === "createdAt" ? O === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Tt, { children: w.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(se, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No categories found." }) }) : w.map((A) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(se, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(A.id),
              onCheckedChange: (v) => k(A.id, v === !0),
              "aria-label": `Select ${A.name}`
            }
          ) }),
          /* @__PURE__ */ e(se, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `/admin/categories/${A.id}/edit`, className: "underline", children: A.name }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: A.slug }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(Ue, { variant: A.status === "published" ? "secondary" : "outline", children: A.status === "published" ? "Published" : "Unpublished" }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(A.createdAt * 1e3).toLocaleDateString() })
        ] }, A.id)) })
      ] })
    ] })
  ] });
}
const Vi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminCategoriesPage: Hi
}, Symbol.toStringTag, { value: "Module" }));
function ut(t) {
  return /* @__PURE__ */ e(ve.Root, { "data-slot": "dialog", ...t });
}
function Mt({ ...t }) {
  return /* @__PURE__ */ e(ve.Trigger, { "data-slot": "dialog-trigger", ...t });
}
function Gi({ ...t }) {
  return /* @__PURE__ */ e(ve.Portal, { "data-slot": "dialog-portal", ...t });
}
function qi({ ...t }) {
  return /* @__PURE__ */ e(ve.Close, { "data-slot": "dialog-close", ...t });
}
function Ki({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    ve.Backdrop,
    {
      "data-slot": "dialog-overlay",
      className: S(
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
  return /* @__PURE__ */ a(Gi, { children: [
    /* @__PURE__ */ e(Ki, {}),
    /* @__PURE__ */ a(
      ve.Popup,
      {
        "data-slot": "dialog-content",
        className: S(
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
                  cn,
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
      className: S("flex flex-col gap-2", t),
      ...n
    }
  );
}
function Ct({
  className: t,
  showCloseButton: n = !1,
  children: s,
  ...l
}) {
  return /* @__PURE__ */ a(
    "div",
    {
      "data-slot": "dialog-footer",
      className: S(
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
      className: S(
        "font-heading text-base leading-none font-medium",
        t
      ),
      ...n
    }
  );
}
function Ta({
  className: t,
  ...n
}) {
  return /* @__PURE__ */ e(
    ve.Description,
    {
      "data-slot": "dialog-description",
      className: S(
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
      className: S(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        t
      ),
      ...s
    }
  );
}
const Wi = _t(
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
      className: S(Wi({ variant: n }), t),
      ...s
    }
  );
}
function qe({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    Xt.Tab,
    {
      "data-slot": "tabs-trigger",
      className: S(
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
function Ke({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    Xt.Panel,
    {
      "data-slot": "tabs-content",
      className: S("flex-1 text-sm outline-none", t),
      ...n
    }
  );
}
function Fe({
  value: t,
  onChange: n,
  onSelect: s,
  accept: l,
  multiple: i = !1,
  maxFiles: r = 10,
  trigger: o
}) {
  const [c, u] = d(!1);
  return /* @__PURE__ */ a(ut, { open: c, onOpenChange: u, children: [
    /* @__PURE__ */ e(
      Mt,
      {
        render: o || /* @__PURE__ */ a(x, { type: "button", variant: "outline", className: "gap-2", children: [
          /* @__PURE__ */ e(Pt, { className: "h-4 w-4" }),
          t ? "Change Media" : "Select Media"
        ] })
      }
    ),
    /* @__PURE__ */ e(
      Ji,
      {
        open: c,
        onOpenChange: u,
        onSelect: (m) => {
          i && s?.(m), m.length > 0 && n(m[0]), u(!1);
        },
        accept: l,
        multiple: i,
        maxFiles: r
      }
    )
  ] });
}
function Ji({
  open: t,
  onOpenChange: n,
  onSelect: s,
  accept: l,
  multiple: i = !1,
  maxFiles: r = 10
}) {
  const [o, c] = d([]), [u, m] = d(!1), [y, _] = d(""), [h, E] = d(""), [z, O] = d(l ?? "all"), [R, b] = d(1), [p, g] = d(1), [N, P] = d([]), [U, k] = d("library");
  te(() => {
    t && f();
  }, [t, h, z, R]);
  const C = Re(!0);
  te(() => {
    if (C.current) {
      C.current = !1;
      return;
    }
    const M = setTimeout(() => {
      b(1), E(y);
    }, 400);
    return () => clearTimeout(M);
  }, [y]), te(() => {
    t && (P([]), k("library"), b(1));
  }, [t]);
  async function f() {
    m(!0);
    try {
      const M = new URLSearchParams();
      h && M.set("search", h), M.set("page", String(R)), M.set("perPage", "24"), z && z !== "all" && M.set("mimeType", z);
      const w = await ue(`/api/admin/media?${M.toString()}`);
      c(w.data), g(w.meta.lastPage ?? 1);
    } catch {
      c([]), g(1);
    }
    m(!1);
  }
  function I(M) {
    P(i ? (w) => w.find((v) => v.id === M.id) ? w.filter((v) => v.id !== M.id) : w.length >= r ? w : [...w, M] : [M]);
  }
  function B() {
    s(N);
  }
  function V(M) {
    P(i ? (w) => w.length >= r ? w : [...w, M] : [M]), k("library"), f();
  }
  return /* @__PURE__ */ a(mt, { className: "sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "Select Media" }) }),
    /* @__PURE__ */ a(Ut, { value: U, onValueChange: k, className: "flex-1 overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ a(Ft, { children: [
        /* @__PURE__ */ e(qe, { value: "library", children: "Media Library" }),
        /* @__PURE__ */ e(qe, { value: "upload", children: "Upload" })
      ] }),
      /* @__PURE__ */ a(Ke, { value: "library", className: "flex-1 overflow-hidden flex flex-col mt-3", children: [
        /* @__PURE__ */ a("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ a("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ e(gn, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ e(
              G,
              {
                value: y,
                onChange: (M) => _(M.target.value),
                placeholder: "Search…",
                className: "pl-8 h-8"
              }
            )
          ] }),
          !l && /* @__PURE__ */ a(Ie, { value: z, onValueChange: (M) => {
            M && (O(M), b(1));
          }, children: [
            /* @__PURE__ */ e(De, { className: "w-[120px] h-8", children: /* @__PURE__ */ e(Te, { placeholder: "All types" }) }),
            /* @__PURE__ */ a(Ee, { children: [
              /* @__PURE__ */ e(re, { value: "all", children: "All types" }),
              /* @__PURE__ */ e(re, { value: "image/*", children: "Images" }),
              /* @__PURE__ */ e(re, { value: "video/mp4", children: "Video" }),
              /* @__PURE__ */ e(re, { value: "application/pdf", children: "PDF" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex-1 overflow-y-auto", children: u ? /* @__PURE__ */ e("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ e("div", { className: "grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: Array.from({ length: 6 }).map((M, w) => /* @__PURE__ */ e(Cn, { className: "aspect-square w-full rounded-sm" }, w)) }) }) : o.length === 0 ? /* @__PURE__ */ a("div", { className: "flex flex-col items-center justify-center py-12", children: [
          /* @__PURE__ */ e(Nt, { className: "h-10 w-10 text-muted-foreground/50" }),
          /* @__PURE__ */ e("p", { className: "mt-2 text-sm text-muted-foreground", children: "No media found." })
        ] }) : /* @__PURE__ */ e("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: o.map((M) => {
          const w = N.some((A) => A.id === M.id);
          return /* @__PURE__ */ e(
            Yi,
            {
              item: M,
              isSelected: w,
              onClick: () => I(M)
            },
            M.id
          );
        }) }) }),
        p > 1 && /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-2 pt-2 border-t mt-2", children: [
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              disabled: R <= 1,
              onClick: () => b((M) => Math.max(1, M - 1)),
              children: "Previous"
            }
          ),
          /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
            "Page ",
            R,
            " of ",
            p
          ] }),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              disabled: R >= p,
              onClick: () => b((M) => M + 1),
              children: "Next"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e(Ke, { value: "upload", className: "mt-3", children: /* @__PURE__ */ e(
        _n,
        {
          onUploadComplete: V,
          accept: l
        }
      ) })
    ] }),
    N.length > 0 && /* @__PURE__ */ a("div", { className: "border-t pt-3 mt-2", children: [
      !i && N.length === 1 && /* @__PURE__ */ e(Xi, { item: N[0] }),
      i && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 flex-wrap", children: [
        N.map((M) => /* @__PURE__ */ a(
          "div",
          {
            className: "relative h-10 w-10 rounded-sm border overflow-hidden",
            children: [
              M.mimeType.startsWith("image/") ? /* @__PURE__ */ e(
                "img",
                {
                  src: M.thumbnailUrl || M.url,
                  alt: M.alt || M.name,
                  className: "object-cover h-full w-full"
                }
              ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center bg-muted", children: /* @__PURE__ */ e(Nt, { className: "h-4 w-4 text-muted-foreground" }) }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => P(
                    (w) => w.filter((A) => A.id !== M.id)
                  ),
                  className: "absolute -top-1 -right-1 rounded-sm bg-destructive p-0.5 text-destructive-foreground",
                  children: /* @__PURE__ */ e(Vt, { className: "h-2.5 w-2.5" })
                }
              )
            ]
          },
          M.id
        )),
        /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
          N.length,
          " selected",
          r && ` (max ${r})`
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e(Ct, { children: /* @__PURE__ */ e(
      x,
      {
        onClick: B,
        disabled: N.length === 0,
        children: i ? `Insert Selected (${N.length})` : "Insert"
      }
    ) })
  ] });
}
function Yi({
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
      className: S(
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
            src: t.thumbnailUrl || t.url,
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
function Xi({ item: t }) {
  return /* @__PURE__ */ a("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ e("div", { className: "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted", children: t.mimeType.startsWith("image/") ? /* @__PURE__ */ e(
      "img",
      {
        src: t.thumbnailUrl || t.url,
        alt: t.alt || t.name,
        className: "object-cover h-full w-full"
      }
    ) : /* @__PURE__ */ e("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e(Nt, { className: "h-6 w-6 text-muted-foreground/60" }) }) }),
    /* @__PURE__ */ a("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ e("p", { className: "truncate text-sm font-medium", children: t.name }),
      /* @__PURE__ */ a("p", { className: "text-xs text-muted-foreground", children: [
        t.mimeType,
        " · ",
        Qi(t.size),
        t.width && t.height && ` · ${t.width}×${t.height}`
      ] })
    ] })
  ] });
}
function Qi(t) {
  return t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${(t / 1024).toFixed(1)} KB` : `${(t / (1024 * 1024)).toFixed(1)} MB`;
}
function Zi({
  item: t,
  maxDepth: n,
  onToggleCollapse: s,
  onEdit: l,
  onDelete: i,
  onKeyAction: r
}) {
  const { session: o } = Ze(), [c, u] = d(!1), [m, y] = d(t.title), [_, h] = d(t.url), [E, z] = d(t.cssClass ?? ""), [O, R] = d(t.target ?? ""), [b, p] = d(t.image ?? ""), [g, N] = d(t.status), P = o?.permissions.includes("menus.publish") ?? !1, U = o?.permissions.includes("menus.unpublish") ?? !1, k = g === "published" ? U : P, {
    attributes: C,
    listeners: f,
    setNodeRef: I,
    setActivatorNodeRef: B,
    transform: V,
    transition: M,
    isDragging: w
  } = qt({ id: t.id }), A = {
    transform: Wt.Transform.toString(V),
    transition: M,
    marginLeft: `${t.depth * 30}px`
  }, v = q(() => {
    l(t.id, {
      title: m,
      url: _,
      cssClass: E,
      target: O,
      image: b,
      status: g
    }), u(!1);
  }, [t.id, m, _, E, O, b, g, l]), Q = q(() => {
    y(t.title), h(t.url), z(t.cssClass ?? ""), R(t.target ?? ""), p(t.image ?? ""), N(t.status), u(!1);
  }, [t]), T = q(() => {
    y(t.title), h(t.url), z(t.cssClass ?? ""), R(t.target ?? ""), p(t.image ?? ""), N(t.status), u(!0);
  }, [t]), $ = q(
    (j) => {
      if (!c)
        switch (j.key) {
          case "ArrowUp":
            j.preventDefault(), r(t.id, "moveUp");
            break;
          case "ArrowDown":
            j.preventDefault(), r(t.id, "moveDown");
            break;
          case "Tab":
            j.preventDefault(), j.shiftKey ? r(t.id, "outdent") : r(t.id, "indent");
            break;
          case "Enter":
            j.preventDefault(), T();
            break;
          case "Delete":
            j.preventDefault(), confirm("Delete this menu item?") && i(t.id);
            break;
        }
    },
    [c, t.id, r, T, i]
  ), J = t.depth >= n - 1;
  return /* @__PURE__ */ a(
    "div",
    {
      ref: I,
      style: A,
      ...C,
      className: S(
        "rounded-sm border bg-background transition-shadow",
        w && "opacity-50 shadow-lg",
        J && "border-amber-300/50"
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
              ref: B,
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
              children: t.collapsed ? /* @__PURE__ */ e(ys, { className: "h-4 w-4" }) : /* @__PURE__ */ e(wt, { className: "h-4 w-4" })
            }
          ) : /* @__PURE__ */ e("span", { className: "w-4" }),
          /* @__PURE__ */ a("div", { className: "flex-1 min-w-0", children: [
            t.image ? /* @__PURE__ */ e("img", { src: t.image, alt: "", className: "mr-2 inline-block size-8 rounded-sm object-cover" }) : null,
            /* @__PURE__ */ e("span", { className: "font-medium text-sm", children: t.title }),
            /* @__PURE__ */ e("span", { className: "ml-2 text-xs text-muted-foreground truncate", children: t.url.length > 40 ? t.url.slice(0, 40) + "…" : t.url }),
            /* @__PURE__ */ e(Ue, { variant: t.status === "published" ? "secondary" : "outline", className: "ml-2", children: t.status === "published" ? "Published" : "Unpublished" })
          ] }),
          J && /* @__PURE__ */ e("span", { className: "text-xs text-amber-600", title: "Maximum depth reached", children: "Max depth" }),
          /* @__PURE__ */ a("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ e(
              x,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: T,
                "aria-label": "Edit menu item",
                children: /* @__PURE__ */ e(pn, { className: "h-3.5 w-3.5" })
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
              /* @__PURE__ */ e(L, { htmlFor: `edit-title-${t.id}`, children: "Title" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-title-${t.id}`,
                  value: m,
                  onChange: (j) => y(j.target.value),
                  placeholder: "Title"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(L, { children: "Image" }),
              /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                b ? /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: b, alt: "", className: "h-full w-full object-cover" }) }) : null,
                /* @__PURE__ */ e(Fe, { value: b || null, onChange: (j) => p(j?.url ?? ""), accept: "image/*" }),
                b ? /* @__PURE__ */ e(
                  x,
                  {
                    type: "button",
                    variant: "outline",
                    "aria-label": "Remove image",
                    className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive",
                    onClick: () => p(""),
                    children: "Remove"
                  }
                ) : null
              ] })
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(L, { htmlFor: `edit-url-${t.id}`, children: "URL" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-url-${t.id}`,
                  value: _,
                  onChange: (j) => h(j.target.value),
                  placeholder: "/url"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(L, { htmlFor: `edit-css-${t.id}`, children: "CSS Class" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-css-${t.id}`,
                  value: E,
                  onChange: (j) => z(j.target.value),
                  placeholder: "Optional CSS class"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(L, { htmlFor: `edit-target-${t.id}`, children: "Target" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: `edit-target-${t.id}`,
                  value: O,
                  onChange: (j) => R(j.target.value),
                  placeholder: "_blank, _self, etc."
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-1", children: [
              /* @__PURE__ */ e(L, { htmlFor: `edit-status-${t.id}`, children: "Status" }),
              /* @__PURE__ */ a("select", { id: `edit-status-${t.id}`, value: g, disabled: !k, onChange: (j) => N(j.target.value), className: "h-9 w-full rounded-sm border bg-background px-3 text-sm disabled:opacity-60", children: [
                /* @__PURE__ */ e("option", { value: "published", disabled: !P && g !== "published", children: "Published" }),
                /* @__PURE__ */ e("option", { value: "draft", disabled: !U && g !== "draft", children: "Unpublished" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ a("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ a(x, { size: "sm", onClick: v, children: [
              /* @__PURE__ */ e(Ht, { className: "h-3.5 w-3.5 mr-1" }),
              "Apply"
            ] }),
            /* @__PURE__ */ a(x, { size: "sm", variant: "ghost", onClick: Q, children: [
              /* @__PURE__ */ e(Vt, { className: "h-3.5 w-3.5 mr-1" }),
              "Cancel"
            ] })
          ] })
        ] })
      ]
    }
  );
}
function Da(t, n = null, s = 0, l = /* @__PURE__ */ new Set()) {
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
    }), !l.has(r.id) && r.children.length > 0 && i.push(...Da(r.children, r.id, s + 1, l));
  }
  return i;
}
function el(t) {
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
const St = 3, bt = 30, tl = Xn(function({ type: n, initialTree: s, onStatusChange: l }, i) {
  const [r, o] = d(/* @__PURE__ */ new Set()), [c, u] = d(
    () => Da(s, null, 0, /* @__PURE__ */ new Set())
  ), [m, y] = d(null), [_, h] = d(!1), [E, z] = d(!1), [O, R] = d(!1), [b, p] = d(""), [g, N] = d(""), P = Re(0), U = Re(null), k = Ot(() => c.map(($) => $.id), [c]), C = ka(
    jt(Sa, {
      activationConstraint: { distance: 8 }
    }),
    jt(Is, {
      coordinateGetter: Ds
    })
  ), f = q(
    ($) => {
      o((J) => {
        const j = new Set(J);
        return j.has($) ? j.delete($) : j.add($), j;
      }), u((J) => {
        const j = sn(J);
        An(j);
        const X = new Set(r);
        return X.has($) ? X.delete($) : X.add($), o(X), al(j, X);
      });
    },
    [r]
  ), I = q(($) => {
    y(String($.active.id));
    const J = $.activatorEvent;
    P.current = J?.clientX ?? 0;
  }, []), B = q(
    ($) => {
      const J = $.delta;
      if (J && m) {
        const j = J.x, X = c.find((Y) => Y.id === m);
        if (!X) return;
        let D = X.depth;
        j > bt ? D = Math.min(X.depth + 1, St - 1) : j < -bt && (D = Math.max(X.depth - 1, 0)), U.current = D;
      }
    },
    [m, c]
  ), V = q(
    ($) => {
      const { active: J, over: j, delta: X } = $;
      if (!j || J.id === j.id) {
        if (X && m) {
          const K = X.x, Z = c.findIndex((de) => de.id === m);
          if (Z === -1) {
            y(null), U.current = null;
            return;
          }
          const Ne = c[Z];
          if (K > bt && Z > 0) {
            const de = ra(c, Z);
            de && Ne.depth < St - 1 && (u((ce) => {
              const F = [...ce];
              return F[Z] = {
                ...F[Z],
                parentId: de.id,
                depth: Ne.depth + 1
              }, ct(F, Z), F;
            }), h(!0));
          } else K < -bt && Ne.depth > 0 && (u((de) => {
            const ce = [...de], F = ce[Z].parentId, he = de.find((be) => be.id === F);
            return ce[Z] = {
              ...ce[Z],
              parentId: he?.parentId ?? null,
              depth: Math.max(0, Ne.depth - 1)
            }, ct(ce, Z), ce;
          }), h(!0));
        }
        y(null), U.current = null;
        return;
      }
      const D = c.findIndex((K) => K.id === String(J.id)), Y = c.findIndex((K) => K.id === String(j.id));
      D !== -1 && Y !== -1 && (u((K) => {
        const Z = xt(K, D, Y), Ne = X?.x ?? 0, de = Z[Y];
        if (Ne > bt && Y > 0) {
          const ce = ra(Z, Y);
          ce && de.depth < St - 1 && (Z[Y] = {
            ...Z[Y],
            parentId: ce.id,
            depth: de.depth + 1
          }, ct(Z, Y));
        } else if (Ne < -bt && de.depth > 0) {
          const ce = Z.find((F) => F.id === de.parentId);
          Z[Y] = {
            ...Z[Y],
            parentId: ce?.parentId ?? null,
            depth: Math.max(0, de.depth - 1)
          }, ct(Z, Y);
        } else {
          const ce = K[Y];
          ce && (Z[Y] = {
            ...Z[Y],
            parentId: ce.parentId,
            depth: ce.depth
          });
        }
        return Z;
      }), h(!0)), y(null), U.current = null;
    },
    [m, c]
  ), M = q(
    async ($, J) => {
      u(
        (j) => j.map(
          (X) => X.id === $ ? { ...X, title: J.title, url: J.url, cssClass: J.cssClass || null, target: J.target || null, image: J.image || null, status: J.status } : X
        )
      ), h(!0);
    },
    []
  ), w = q(
    async ($) => {
      const J = await yn(`/api/admin/menus/${$}`);
      J.success ? (u((j) => {
        const X = j.find((K) => K.id === $);
        if (!X) return j;
        const D = /* @__PURE__ */ new Set(), Y = [$];
        for (; Y.length > 0; ) {
          const K = Y.pop();
          for (const Z of j)
            Z.parentId === K && (D.add(Z.id), Y.push(Z.id));
        }
        return j.filter((K) => K.id !== $).map(
          (K) => D.has(K.id) ? {
            ...K,
            parentId: K.parentId === $ ? X.parentId : K.parentId,
            depth: Math.max(0, K.depth - 1)
          } : K
        );
      }), h(!0), W.success("delete", "menu item")) : W.error(J.message);
    },
    []
  ), A = q(async () => {
    if (!b.trim() || !g.trim()) return;
    R(!0);
    const $ = await Le("/api/admin/menus", {
      title: b.trim(),
      url: g.trim(),
      type: n,
      position: c.filter((J) => J.parentId === null).length
    });
    if ($.success) {
      const J = {
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
      u((j) => [...j, J]), p(""), N(""), W.success("create", "menu item");
    } else
      W.error($.message);
    R(!1);
  }, [b, g, n, c]), v = q(async () => {
    z(!0);
    const $ = sn(c), J = el($), j = await Le("/api/admin/menus/reorder", {
      type: n,
      tree: J
    });
    if (j.success) {
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
      h(!1), W.saved("menu");
    } else
      W.error(j.message);
    z(!1);
  }, [c, r, n]), Q = q(
    ($, J) => {
      const j = c.findIndex((X) => X.id === $);
      j !== -1 && (u((X) => {
        const D = [...X], Y = D[j];
        switch (J) {
          case "moveUp":
            if (j > 0)
              return xt(D, j, j - 1);
            break;
          case "moveDown":
            if (j < D.length - 1)
              return xt(D, j, j + 1);
            break;
          case "indent": {
            const K = ra(D, j);
            K && Y.depth < St - 1 && (D[j] = {
              ...Y,
              parentId: K.id,
              depth: Y.depth + 1
            }, ct(D, j));
            break;
          }
          case "outdent": {
            if (Y.depth > 0) {
              const K = D.find((Z) => Z.id === Y.parentId);
              D[j] = {
                ...Y,
                parentId: K?.parentId ?? null,
                depth: Y.depth - 1
              }, ct(D, j);
            }
            break;
          }
        }
        return D;
      }), h(!0));
    },
    [c]
  ), T = m ? c.find(($) => $.id === m) : null;
  return te(() => l?.({ hasChanges: _, saving: E }), [_, E, l]), Qn(i, () => ({ save: v }), [v]), /* @__PURE__ */ a("div", { className: "space-y-4", children: [
    _ && /* @__PURE__ */ a("div", { className: "flex items-center gap-3 px-4 mt-3", children: [
      /* @__PURE__ */ e(Ue, { variant: "secondary", className: "animate-pulse", children: "Unsaved changes" }),
      /* @__PURE__ */ e(x, { onClick: v, disabled: E, children: E ? "Saving..." : "Save Menu" })
    ] }),
    /* @__PURE__ */ a(Dt, { children: [
      /* @__PURE__ */ e(Et, { children: /* @__PURE__ */ e(je, { title: "Menu items", description: "Drag items to reorder. Drag right to nest, or left to outdent.", children: c.length === 0 ? /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed p-8 text-center", children: /* @__PURE__ */ e("p", { className: "text-muted-foreground", children: "No menu items yet. Add your first item from the panel." }) }) : /* @__PURE__ */ a(
        Pa,
        {
          sensors: C,
          collisionDetection: _a,
          onDragStart: I,
          onDragOver: B,
          onDragEnd: V,
          children: [
            /* @__PURE__ */ e(Kt, { items: k, strategy: Aa, children: /* @__PURE__ */ e("div", { className: "space-y-2", role: "list", "aria-label": "Menu items", children: c.map(($) => /* @__PURE__ */ e(
              Zi,
              {
                item: $,
                maxDepth: St,
                onToggleCollapse: f,
                onEdit: M,
                onDelete: w,
                onKeyAction: Q
              },
              $.id
            )) }) }),
            /* @__PURE__ */ e(Ts, { children: T ? /* @__PURE__ */ a("div", { className: "rounded-sm border bg-background p-3 shadow-lg opacity-90", children: [
              /* @__PURE__ */ e("span", { className: "font-medium", children: T.title }),
              /* @__PURE__ */ e("span", { className: "ml-2 text-xs text-muted-foreground truncate", children: T.url })
            ] }) : null })
          ]
        }
      ) }) }),
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ a(je, { title: "Add menu item", description: "New items are added to the top level.", children: [
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "new-title", children: "Title" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "new-title",
              placeholder: "Menu item title",
              value: b,
              onChange: ($) => p($.target.value),
              onKeyDown: ($) => {
                $.key === "Enter" && A();
              }
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "new-url", children: "URL" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "new-url",
              placeholder: "/page-url",
              value: g,
              onChange: ($) => N($.target.value),
              onKeyDown: ($) => {
                $.key === "Enter" && A();
              }
            }
          )
        ] }),
        /* @__PURE__ */ e(x, { className: "w-full", onClick: A, disabled: O || !b.trim() || !g.trim(), children: O ? "Adding..." : "Add" })
      ] }) })
    ] })
  ] });
});
function ra(t, n) {
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
function sn(t, n) {
  return t;
}
function An(t) {
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
function al(t, n) {
  const s = An(t);
  return Da(s, null, 0, n);
}
const nl = [
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
function sl(t) {
  return Array.isArray(t);
}
function rl() {
  const t = globalThis.__CMS_MENU_GROUP_REGISTRY__;
  return sl(t) ? t : nl;
}
function il(t) {
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
function ll() {
  const t = rl(), [n, s] = d(null), [l, i] = d(null), [r, o] = d("navbar"), c = Re(null), [u, m] = d({ hasChanges: !1, saving: !1 }), y = q(async () => {
    i(null);
    try {
      const h = await ue("/api/admin/menus");
      s(h);
    } catch (h) {
      i(h.message);
    }
  }, []);
  if (te(() => {
    y();
  }, [y]), l) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    l
  ] }) });
  const _ = n ? il(n.filter((h) => h.type === r)) : null;
  return /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Menus",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ a(Ie, { value: r, onValueChange: (h) => h && o(h), children: [
            /* @__PURE__ */ e(De, { className: "w-40", children: /* @__PURE__ */ e(Te, {}) }),
            /* @__PURE__ */ e(Ee, { children: t.map((h) => /* @__PURE__ */ e(re, { value: h.type, children: h.label }, h.type)) })
          ] }),
          /* @__PURE__ */ e(x, { onClick: () => c.current?.save(), disabled: !u.hasChanges || u.saving, children: u.saving ? "Saving..." : "Save Menu" })
        ] })
      }
    ),
    _ ? /* @__PURE__ */ e(tl, { ref: c, type: r, initialTree: _, onStatusChange: m }, r) : /* @__PURE__ */ e(ge, {})
  ] });
}
const ol = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminMenusPage: ll
}, Symbol.toStringTag, { value: "Module" }));
function cl() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), u = dt(), m = Qe(), [y, _] = d(
    new URLSearchParams(u.search).get("search") ?? ""
  ), [h, E] = d(
    new URLSearchParams(u.search).get("sortBy") ?? ""
  ), [z, O] = d(
    new URLSearchParams(u.search).get("sortOrder") ?? ""
  );
  async function R() {
    l(null);
    const w = await ue(`/api/admin/roles${u.search}`);
    n(w), r([]);
  }
  te(() => {
    R().catch((w) => l(w.message));
  }, [u.search]);
  function b() {
    m(Ce("/admin/roles", { search: y, sortBy: h, sortOrder: z }));
  }
  function p(w) {
    const A = h === w && z === "asc" ? "desc" : "asc";
    E(w), O(A), m(Ce("/admin/roles", { search: y, sortBy: w, sortOrder: A }));
  }
  function g(w) {
    w.key === "Enter" && (w.preventDefault(), b());
  }
  const N = Re(!0);
  te(() => {
    if (N.current) {
      N.current = !1;
      return;
    }
    const w = setTimeout(() => {
      b();
    }, 400);
    return () => clearTimeout(w);
  }, [y]);
  const P = q((w) => {
    t?.roles && r(w ? t.roles.map((A) => A.id) : []);
  }, [t]), U = q((w, A) => {
    r(
      (v) => A ? [...v, w] : v.filter((Q) => Q !== w)
    );
  }, []), k = t?.roles?.length > 0 && i.length === t.roles.length, C = i.length > 0;
  async function f(w, A) {
    if (i.length === 0) return;
    c(!0);
    const v = await Le(w, { ids: i });
    c(!1), v.success ? (W.success("update", "role"), await R()) : W.error(v.message);
  }
  const I = q(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} role(s)? This action cannot be undone.`) && await f("/api/admin/roles/bulk/delete");
  }, [i]), B = q(async () => {
    await f("/api/admin/roles/bulk/duplicate");
  }, [i]);
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const V = t.roles ?? [];
  function M(w) {
    return Ce("/admin/roles", { search: y, sortBy: h, sortOrder: z, page: w });
  }
  return /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Roles",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by name or slug...",
            value: y,
            onChange: (w) => _(w.target.value),
            onKeyDown: g,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ e(fe, { to: "/admin/roles/new", className: S(At({ size: "lg" })), children: "New Role" })
      }
    ),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      C && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
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
              onClick: B,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: I,
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
      /* @__PURE__ */ a(zt, { children: [
        /* @__PURE__ */ e(It, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: k,
              onCheckedChange: (w) => P(w === !0),
              "aria-label": "Select all roles"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => p("name"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Name",
                h === "name" ? z === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Slug" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Users" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => p("createdAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Created",
                h === "createdAt" ? z === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Tt, { children: V.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(se, { colSpan: 6, className: "px-4 py-8 text-center text-muted-foreground", children: "No roles found." }) }) : V.map((w) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(se, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(w.id),
              onCheckedChange: (A) => U(w.id, A === !0),
              "aria-label": `Select ${w.name}`
            }
          ) }),
          /* @__PURE__ */ e(se, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `/admin/roles/${w.id}/edit`, className: "underline", children: w.name }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: w.slug }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(Ue, { variant: "secondary", children: w.userCount }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(w.createdAt * 1e3).toLocaleDateString() })
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
          t.meta.currentPage > 1 && /* @__PURE__ */ e(fe, { to: M(t.meta.currentPage - 1), className: "hover:text-foreground hover:underline", children: "Previous" }),
          t.meta.currentPage < t.meta.lastPage && /* @__PURE__ */ e(fe, { to: M(t.meta.currentPage + 1), className: "hover:text-foreground hover:underline", children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
const dl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminRolesPage: cl
}, Symbol.toStringTag, { value: "Module" }));
function ul() {
  const t = Qe(), { session: n, refreshSession: s } = Ze(), [l, i] = yt(), [r, o] = d({}), c = n?.user;
  function u(m) {
    m.preventDefault(), o({});
    const y = new FormData(m.currentTarget), _ = String(y.get("name") ?? "").trim(), h = String(y.get("email") ?? "").trim(), E = String(y.get("password") ?? "");
    i(async () => {
      const z = { name: _, email: h };
      E && (z.password = E);
      const O = await rt("/api/admin/auth/profile", z);
      if (!O.success) {
        O.errors ? o(O.errors) : o({ _form: [O.message] }), W.error(O.message);
        return;
      }
      await s(), W.success("update", "profile");
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: u, className: "", children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Profile",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ a(x, { type: "submit", disabled: l, children: [
            l && /* @__PURE__ */ e(hn, { className: "mr-2 size-4 animate-spin" }),
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
    /* @__PURE__ */ a(Dt, { children: [
      /* @__PURE__ */ e(Et, { children: /* @__PURE__ */ a(je, { title: "Account information", description: "Update your name and email.", children: [
        r._form && /* @__PURE__ */ e("div", { className: "rounded-sm bg-destructive/10 p-3 text-sm text-destructive", children: r._form[0] }),
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ a(L, { htmlFor: "profile-name", children: [
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
          /* @__PURE__ */ a(L, { htmlFor: "profile-email", children: [
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
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ e(je, { title: "Password", description: "Leave empty to keep your current password.", children: /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ e(L, { htmlFor: "profile-password", children: "New Password" }),
        /* @__PURE__ */ e(
          G,
          {
            id: "profile-password",
            name: "password",
            type: "password",
            placeholder: "Leave blank to keep current",
            minLength: 8,
            maxLength: 128,
            "aria-invalid": !!r.password
          }
        ),
        r.password && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: r.password[0] }),
        /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Minimum 8 characters. Leave empty to keep your current password." })
      ] }) }) })
    ] })
  ] });
}
const ml = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminProfilePage: ul
}, Symbol.toStringTag, { value: "Module" }));
function Oe({ className: t, ...n }) {
  return /* @__PURE__ */ e(
    "textarea",
    {
      "data-slot": "textarea",
      className: S(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        t
      ),
      ...n
    }
  );
}
function Ea(t) {
  let n = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return n.length > 200 && (n = n.slice(0, 200).replace(/-+$/, "")), n;
}
function zn({ category: t, mode: n, pageTitle: s, defaultType: l }) {
  const { session: i } = Ze(), [r, o] = yt(), [c, u] = d({}), [m, y] = d(null), [_, h] = d(t?.name ?? ""), [E, z] = d(t?.slug ?? ""), [O, R] = d(!!t?.slug), [b, p] = d(t?.type ?? l ?? "post"), [g, N] = d(t?.description ?? ""), [P, U] = d(t?.image ?? ""), [k, C] = d(t?.status ?? "published"), f = i?.permissions.includes(`category.${b}.publish`) ?? !1, I = i?.permissions.includes(`category.${b}.unpublish`) ?? !1, B = k === "published" ? I : f;
  te(() => {
    n === "create" && !f && C("draft");
  }, [f, n]), te(() => {
    !O && n === "create" && z(Ea(_));
  }, [_, O, n]);
  function V(w) {
    R(!0), z(w);
  }
  function M(w) {
    w.preventDefault(), u({}), y(null);
    const A = {
      name: _,
      type: b,
      status: k
    };
    g.trim() && (A.description = g), P ? A.image = P : A.image = null, E && (A.slug = E), o(async () => {
      let v;
      n === "edit" && t ? v = await rt(`/api/admin/categories/${t.id}`, A) : v = await Le("/api/admin/categories", A), v.success ? (W.success(n === "edit" ? "update" : "create", "category"), Xe(`/admin/categories/${b}`)) : v.errors && Object.keys(v.errors).length > 0 ? (u(v.errors), W.error(v.message)) : (y(v.message), W.error(v.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: M, className: "", children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: s || "Categories",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: r, children: r ? n === "edit" ? "Saving…" : "Creating…" : n === "edit" ? "Save Changes" : "Create Category" }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Xe(`/admin/categories/${b}`),
              disabled: r,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    m && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: m }),
    /* @__PURE__ */ a(Dt, { children: [
      /* @__PURE__ */ e(Et, { children: /* @__PURE__ */ a(je, { title: "Basic information", children: [
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a(L, { htmlFor: "name", children: [
            "Name ",
            /* @__PURE__ */ e("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ e(
            G,
            {
              id: "name",
              value: _,
              onChange: (w) => h(w.target.value),
              placeholder: "Category name",
              "aria-invalid": !!c.name,
              "aria-describedby": c.name ? "name-error" : void 0
            }
          ),
          c.name && /* @__PURE__ */ e("p", { id: "name-error", className: "text-xs text-destructive", children: c.name[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "slug", children: "Slug" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "slug",
              value: E,
              onChange: (w) => V(w.target.value),
              placeholder: "category-url-slug",
              "aria-invalid": !!c.slug,
              "aria-describedby": c.slug ? "slug-error" : void 0
            }
          ),
          c.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: c.slug[0] }),
          !O && n === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from name. Edit to customize." })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ e(
            Oe,
            {
              id: "description",
              value: g,
              onChange: (w) => N(w.target.value),
              placeholder: "Optional description",
              rows: 4,
              "aria-invalid": !!c.description,
              "aria-describedby": c.description ? "description-error" : void 0
            }
          ),
          c.description && /* @__PURE__ */ e("p", { id: "description-error", className: "text-xs text-destructive", children: c.description[0] })
        ] })
      ] }) }),
      /* @__PURE__ */ a(Lt, { children: [
        /* @__PURE__ */ e(je, { title: "Status", children: /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "status", children: "Visibility" }),
          /* @__PURE__ */ a("select", { id: "status", value: k, disabled: !B, onChange: (w) => C(w.target.value), className: "h-9 rounded-sm border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60", children: [
            /* @__PURE__ */ e("option", { value: "published", disabled: !f && k !== "published", children: "Published" }),
            /* @__PURE__ */ e("option", { value: "draft", disabled: !I && k !== "draft", children: "Unpublished" })
          ] }),
          !B && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Your role cannot change this status." })
        ] }) }),
        /* @__PURE__ */ a(je, { title: "Image", children: [
          /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
            P ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
              "img",
              {
                src: P,
                alt: "Category image preview",
                className: "object-cover h-full w-full"
              }
            ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No image" }),
            /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
              /* @__PURE__ */ e(
                Fe,
                {
                  value: P || null,
                  onChange: (w) => {
                    U(w ? w.url : "");
                  },
                  accept: "image/*"
                },
                P || "empty"
              ),
              /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose an image from the media library." }),
              P && /* @__PURE__ */ e(
                x,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  "aria-label": "Remove image",
                  className: "w-fit text-destructive hover:bg-destructive/10 hover:text-destructive",
                  onClick: () => U(""),
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
function hl() {
  const { type: t = "post" } = Ve(), [n, s] = d(!0);
  return te(() => {
    const l = setTimeout(() => s(!1), 0);
    return () => clearTimeout(l);
  }, []), n ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    zn,
    {
      mode: "create",
      pageTitle: "Create Category",
      defaultType: t
    }
  ) });
}
function gl({ id: t }) {
  const { type: n = "post" } = Ve(), [s, l] = d(null), [i, r] = d(!0);
  return te(() => {
    ue(`/api/admin/categories/${t}`).then((o) => {
      l(o), r(!1);
    });
  }, [t]), i ? /* @__PURE__ */ e(ge, {}) : s ? /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    zn,
    {
      mode: "edit",
      category: s,
      pageTitle: "Edit Category",
      defaultType: n
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Category not found." });
}
const In = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminCategoryCreatePage: hl,
  AdminCategoryEditPage: gl
}, Symbol.toStringTag, { value: "Module" }));
function pl({ detailTemplate: t, values: n, onChange: s }) {
  const l = Zt(), i = t ? l.templates.find((r) => r.id === t && r.kind === "detail")?.fieldSlots ?? [] : [];
  return i.length === 0 ? null : /* @__PURE__ */ e("div", { className: "space-y-4", children: i.map((r) => /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ e(L, { htmlFor: `template-field-${r.key}`, children: r.label }),
    r.type === "rich-text" ? /* @__PURE__ */ e(Oe, { id: `template-field-${r.key}`, value: String(n[r.key] ?? ""), onChange: (o) => s({ ...n, [r.key]: o.target.value }) }) : r.type === "boolean" ? /* @__PURE__ */ e("input", { id: `template-field-${r.key}`, type: "checkbox", checked: n[r.key] === !0, onChange: (o) => s({ ...n, [r.key]: o.target.checked }), className: "rounded-sm border-input" }) : r.type === "image" ? /* @__PURE__ */ a("div", { className: "space-y-2", children: [
      /* @__PURE__ */ e(Fe, { value: typeof n[r.key] == "string" ? String(n[r.key]) : null, onChange: (o) => s({ ...n, [r.key]: o?.url ?? "" }), accept: "image/*" }),
      typeof n[r.key] == "string" && String(n[r.key]) && /* @__PURE__ */ a("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ e("img", { src: n[r.key], alt: r.label, className: "h-32 w-48 rounded-sm border object-cover" }),
        /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => s({ ...n, [r.key]: "" }), children: "Remove image" })
      ] })
    ] }) : /* @__PURE__ */ e(G, { id: `template-field-${r.key}`, type: r.type === "number" ? "number" : r.type === "date" ? "date" : "text", value: String(n[r.key] ?? ""), onChange: (o) => s({ ...n, [r.key]: r.type === "number" && o.target.value ? Number(o.target.value) : o.target.value }) })
  ] }, r.key)) });
}
const fl = [];
function bl(t) {
  return Array.isArray(t);
}
function Tn() {
  const t = globalThis.__CMS_SECTION_REGISTRY__;
  return bl(t) ? t : fl;
}
const Dn = {
  question: "Question",
  answer: "Answer",
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
}, vl = {
  map: "Latitude, longitude (example: -6.208763, 106.845599)"
}, fa = [
  { label: "", url: "" },
  { label: "", url: "" }
];
function ba(t) {
  return Object.keys(t).reduce(
    (n, s) => ({
      ...n,
      [s]: s === "links" ? fa.map((l) => ({ ...l })) : s === "form_inquiry" ? !1 : ""
    }),
    {}
  );
}
function va(t) {
  if (Array.isArray(t)) {
    const n = t.slice(0, 2).map((s) => {
      if (s && typeof s == "object") {
        const l = s;
        return { label: String(l.label ?? ""), url: String(l.url ?? "") };
      }
      return { label: "", url: "" };
    });
    return [...n, ...fa.slice(n.length).map((s) => ({ ...s }))];
  }
  if (typeof t == "string" && t.trim())
    try {
      const n = JSON.parse(t);
      if (Array.isArray(n)) return va(n);
    } catch {
    }
  return fa.map((n) => ({ ...n }));
}
function xl({
  value: t,
  onItemChange: n
}) {
  const [s, l] = d(() => va(t));
  te(() => {
    l(va(t));
  }, [t]);
  function i(r) {
    l(r), n(r);
  }
  return /* @__PURE__ */ a("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
    /* @__PURE__ */ e(L, { className: "text-xs", children: "Links" }),
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
                  (u, m) => m === o ? { ...u, label: c.target.value } : u
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
                  (u, m) => m === o ? { ...u, url: c.target.value } : u
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
function ia({
  field: t,
  value: n,
  onItemChange: s
}) {
  const l = Zn(), i = Dn[t] || t, r = n != null ? String(n) : "";
  if (t === "links")
    return /* @__PURE__ */ e(xl, { value: n, onItemChange: s });
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
      /* @__PURE__ */ e(L, { htmlFor: l, className: "cursor-pointer text-xs", children: "Show inquiry form" })
    ] });
  if (t === "text" || t === "embed" || t === "answer")
    return /* @__PURE__ */ a("div", { className: "flex flex-col gap-1 sm:col-span-2", children: [
      /* @__PURE__ */ e(L, { className: "text-xs", children: i }),
      /* @__PURE__ */ e(
        Oe,
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
      /* @__PURE__ */ e(L, { className: "text-xs", children: i }),
      /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
        o && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
          "img",
          {
            src: r,
            alt: "",
            className: "h-full w-full object-cover"
          }
        ) }),
        /* @__PURE__ */ e(
          Fe,
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
    /* @__PURE__ */ e(L, { className: "text-xs", children: i }),
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
    /* @__PURE__ */ e(L, { className: "text-xs", children: i }),
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
    /* @__PURE__ */ e(L, { className: "text-xs", children: i }),
    /* @__PURE__ */ e(
      G,
      {
        value: r,
        onChange: (o) => s(o.target.value || null),
        placeholder: vl[t] || i,
        className: "h-8 text-sm"
      }
    )
  ] });
}
function Nl({
  id: t,
  item: n,
  itemIdx: s,
  itemTemplate: l,
  onUpdateItemField: i,
  onRemove: r,
  isExpanded: o,
  onToggleExpanded: c,
  onDuplicate: u
}) {
  const { attributes: m, listeners: y, setNodeRef: _, transform: h, transition: E, isDragging: z } = qt({ id: t }), O = Object.keys(l || n), R = O.filter((g) => ["style_css", "style_css_inline", "style_id"].includes(g)), b = O.filter((g) => ["bg_color", "bg_image"].includes(g)), p = [
    { value: "text", label: "Text", fields: O.filter((g) => ["caption", "title", "text"].includes(g)) },
    { value: "image", label: "Image", fields: O.filter((g) => ["image", "alt_image"].includes(g)) },
    ...O.filter((g) => !["caption", "title", "text", "image", "alt_image", "style_css", "style_css_inline", "style_id", "bg_color", "bg_image"].includes(g)).map((g) => ({ value: g, label: Dn[g] || g, fields: [g] }))
  ].filter((g) => g.fields.length > 0);
  return /* @__PURE__ */ a(
    "div",
    {
      ref: _,
      style: { transform: Wt.Transform.toString(h), transition: E },
      className: `overflow-hidden rounded-sm border ${z ? "z-10 opacity-50" : ""}`,
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
                ...y,
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
                onClick: (g) => {
                  g.stopPropagation(), u(s);
                },
                children: /* @__PURE__ */ e(ya, { className: "h-3.5 w-3.5 text-muted-foreground" })
              }
            ),
            (R.length > 0 || b.length > 0) && /* @__PURE__ */ a(ut, { children: [
              /* @__PURE__ */ e(
                Mt,
                {
                  render: /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": "Open style settings", children: /* @__PURE__ */ e(wa, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
                }
              ),
              /* @__PURE__ */ a(mt, { children: [
                /* @__PURE__ */ a(ht, { children: [
                  /* @__PURE__ */ e(gt, { children: "Style settings" }),
                  /* @__PURE__ */ e(Ta, { children: "Set background and custom styling for this column." })
                ] }),
                /* @__PURE__ */ a(Ut, { defaultValue: R.length > 0 ? "style" : "background", className: "gap-0", children: [
                  /* @__PURE__ */ a(Ft, { className: "w-full justify-start", "aria-label": "Style settings", children: [
                    R.length > 0 && /* @__PURE__ */ e(qe, { value: "style", className: "shrink-0 px-2 text-xs", children: "Style" }),
                    b.length > 0 && /* @__PURE__ */ e(qe, { value: "background", className: "shrink-0 px-2 text-xs", children: "Background" })
                  ] }),
                  R.length > 0 && /* @__PURE__ */ e(Ke, { value: "style", className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: R.map((g) => /* @__PURE__ */ e(ia, { field: g, value: n[g] ?? null, onItemChange: (N) => i(s, g, N) }, g)) }) }),
                  b.length > 0 && /* @__PURE__ */ e(Ke, { value: "background", className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: b.map((g) => /* @__PURE__ */ e(ia, { field: g, value: n[g] ?? null, onItemChange: (N) => i(s, g, N) }, g)) }) })
                ] }),
                /* @__PURE__ */ e(Ct, { showCloseButton: !0 })
              ] })
            ] }),
            /* @__PURE__ */ e(
              x,
              {
                type: "button",
                variant: "ghost",
                size: "icon-sm",
                "aria-label": "Remove column",
                onClick: (g) => {
                  g.stopPropagation(), r(s);
                },
                children: /* @__PURE__ */ e(we, { className: "h-3.5 w-3.5 text-destructive" })
              }
            ),
            /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": o ? "Collapse column" : "Expand column", onClick: c, children: o ? /* @__PURE__ */ e(fn, { className: "h-3.5 w-3.5 text-muted-foreground" }) : /* @__PURE__ */ e(wt, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
          ] })
        ] }),
        o && p.length > 0 ? /* @__PURE__ */ a(Ut, { defaultValue: p[0].value, className: "gap-0", children: [
          /* @__PURE__ */ e(Ft, { className: "w-full justify-start", "aria-label": `Column ${s + 1} fields`, children: p.map((g) => /* @__PURE__ */ e(qe, { value: g.value, className: "shrink-0 px-2 text-xs", children: g.label }, g.value)) }),
          p.map((g) => /* @__PURE__ */ e(Ke, { value: g.value, className: "p-4", children: /* @__PURE__ */ e("div", { className: "space-y-4", children: g.fields.map((N) => /* @__PURE__ */ e(
            ia,
            {
              field: N,
              value: n[N] ?? null,
              onItemChange: (P) => i(s, N, P)
            },
            N
          )) }) }, g.value))
        ] }) : o && /* @__PURE__ */ e("p", { className: "p-4 text-xs text-muted-foreground", children: "No template fields defined for this section." })
      ]
    }
  );
}
function yl(t, n, s) {
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
function wl({
  section: t,
  index: n,
  isExpanded: s,
  itemTemplate: l,
  availableSections: i,
  template: r,
  onToggleExpanded: o,
  onRemove: c,
  onDuplicate: u,
  onUpdateField: m,
  onUpdateItemField: y,
  collapsedItems: _,
  onToggleItemExpanded: h,
  onCollapseItems: E,
  onExpandItems: z
}) {
  const O = Tn(), R = yl(l, t, i), b = r ?? O.find((T) => T.type === t.type) ?? null, p = !!b?.contentType, g = b?.itemMode !== "none", N = b?.itemMode === "single", P = new Set(b?.sectionFields ?? ["caption", "title", "text"]), U = b?.columns, k = U ? U.desktop ?? U.tablet ?? U.mobile : void 0, C = t.links?.[0] ?? { label: "", url: "" }, [f, I] = d([]), B = f.find(
    (T) => T.id === t.category || T.name === t.category
  ), { attributes: V, listeners: M, setNodeRef: w, transform: A, transition: v, isDragging: Q } = qt({ id: t._instanceId });
  return te(() => {
    if (!p) {
      I([]);
      return;
    }
    ue(`/api/admin/categories?type=${encodeURIComponent(t.type)}`).then((T) => I(Array.isArray(T) ? T : [])).catch(() => I([]));
  }, [t.type, p]), /* @__PURE__ */ a(Pe, { ref: w, style: { transform: Wt.Transform.toString(A), transition: v }, className: `gap-0 overflow-hidden rounded-sm border-border/70 bg-card py-0 shadow-sm ${Q ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ a(_e, { className: "flex flex-row items-center justify-between border-b py-3 px-3 cursor-pointer select-none", onClick: o, children: [
      /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e("button", { type: "button", className: "cursor-grab text-muted-foreground hover:text-foreground", "aria-label": "Drag to reorder", ...V, ...M, children: /* @__PURE__ */ e(Gt, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ e(Ae, { className: "text-sm", children: b?.label ?? t.type ?? `Section #${n + 1}` })
      ] }),
      /* @__PURE__ */ a("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ e(
          x,
          {
            type: "button",
            variant: "ghost",
            size: "icon-sm",
            "aria-label": "Duplicate section",
            onClick: (T) => {
              T.stopPropagation(), u();
            },
            children: /* @__PURE__ */ e(ya, { className: "h-4 w-4 text-muted-foreground" })
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
                  onClick: (T) => T.stopPropagation(),
                  children: /* @__PURE__ */ e(wa, { className: "h-4 w-4 text-muted-foreground" })
                }
              )
            }
          ),
          /* @__PURE__ */ a(mt, { className: "max-h-[90vh] overflow-y-auto sm:max-w-xl", children: [
            /* @__PURE__ */ a(ht, { children: [
              /* @__PURE__ */ e(gt, { children: "Section settings" }),
              /* @__PURE__ */ e(Ta, { children: "Configure media, display options, link, and custom styling for this section." })
            ] }),
            /* @__PURE__ */ a(Ut, { defaultValue: "style", className: "gap-0", children: [
              /* @__PURE__ */ a(Ft, { className: "w-full justify-start", "aria-label": "Section settings", children: [
                /* @__PURE__ */ e(qe, { value: "style", className: "shrink-0 px-2 text-xs", children: "Style" }),
                p && /* @__PURE__ */ e(qe, { value: "filter", className: "shrink-0 px-2 text-xs", children: "Filter" }),
                P.has("image") && /* @__PURE__ */ e(qe, { value: "image", className: "shrink-0 px-2 text-xs", children: "Image" }),
                P.has("links") && /* @__PURE__ */ e(qe, { value: "link", className: "shrink-0 px-2 text-xs", children: "Link" }),
                (P.has("bg_color") || P.has("bg_image")) && /* @__PURE__ */ e(qe, { value: "background", className: "shrink-0 px-2 text-xs", children: "Background" })
              ] }),
              /* @__PURE__ */ e(Ke, { value: "style", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "space-y-4", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Custom Class" }),
                  /* @__PURE__ */ e(G, { value: t.style_css ?? "", onChange: (T) => m("style_css", T.target.value || null), placeholder: "custom-class" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Custom Style" }),
                  /* @__PURE__ */ e(G, { value: t.style_css_inline ?? "", onChange: (T) => m("style_css_inline", T.target.value || null), placeholder: "color: red;" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Custom ID" }),
                  /* @__PURE__ */ e(G, { value: t.style_id ?? "", onChange: (T) => m("style_id", T.target.value || null), placeholder: "#my-id" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Alignment" }),
                  /* @__PURE__ */ a(Ie, { value: t.alignment ?? "", onValueChange: (T) => m("alignment", T || null), children: [
                    /* @__PURE__ */ e(De, { children: /* @__PURE__ */ e(Te, { placeholder: "Select alignment" }) }),
                    /* @__PURE__ */ a(Ee, { children: [
                      /* @__PURE__ */ e(re, { value: "left", children: "Left" }),
                      /* @__PURE__ */ e(re, { value: "center", children: "Center" }),
                      /* @__PURE__ */ e(re, { value: "right", children: "Right" })
                    ] })
                  ] })
                ] })
              ] }) }),
              p && /* @__PURE__ */ e(Ke, { value: "filter", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Category" }),
                  /* @__PURE__ */ a(Ie, { value: B?.id ?? t.category ?? "all", onValueChange: (T) => m("category", T === "all" ? null : T), children: [
                    /* @__PURE__ */ e(De, { children: /* @__PURE__ */ e(Te, { children: B?.name ?? "All categories" }) }),
                    /* @__PURE__ */ a(Ee, { children: [
                      /* @__PURE__ */ e(re, { value: "all", children: "All categories" }),
                      f.map((T) => /* @__PURE__ */ e(re, { value: T.id, children: T.name }, T.id))
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Sort By" }),
                  /* @__PURE__ */ a(Ie, { value: t.sort_by ?? "created_at", onValueChange: (T) => m("sort_by", T), children: [
                    /* @__PURE__ */ e(De, { children: /* @__PURE__ */ e(Te, {}) }),
                    /* @__PURE__ */ a(Ee, { children: [
                      /* @__PURE__ */ e(re, { value: "created_at", children: "Created at" }),
                      /* @__PURE__ */ e(re, { value: "title", children: "Title" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Order" }),
                  /* @__PURE__ */ a(Ie, { value: t.sort_order ?? "desc", onValueChange: (T) => m("sort_order", T), children: [
                    /* @__PURE__ */ e(De, { children: /* @__PURE__ */ e(Te, {}) }),
                    /* @__PURE__ */ a(Ee, { children: [
                      /* @__PURE__ */ e(re, { value: "asc", children: "Ascending" }),
                      /* @__PURE__ */ e(re, { value: "desc", children: "Descending" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Limit" }),
                  /* @__PURE__ */ e(G, { type: "number", min: 0, value: t.limit ?? "", onChange: (T) => m("limit", T.target.value ? Number(T.target.value) : null), placeholder: "Max items" })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Sort" }),
                  /* @__PURE__ */ e(G, { type: "number", min: 0, value: t.sort, onChange: (T) => m("sort", Number(T.target.value) || 0) })
                ] })
              ] }) }),
              P.has("image") && /* @__PURE__ */ e(Ke, { value: "image", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Image" }),
                  /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                    t.image && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: t.image, alt: "", className: "h-full w-full object-cover" }) }),
                    /* @__PURE__ */ e(Fe, { value: t.image ?? null, onChange: (T) => m("image", T ? T.url : null), accept: "image/*" }),
                    t.image && /* @__PURE__ */ e(x, { type: "button", variant: "outline", "aria-label": "Remove image", className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive", onClick: () => m("image", null), children: "Remove" })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Alt Image" }),
                  /* @__PURE__ */ e(G, { value: t.alt_image ?? "", onChange: (T) => m("alt_image", T.target.value || null), placeholder: "Alt text" })
                ] })
              ] }) }),
              P.has("links") && /* @__PURE__ */ e(Ke, { value: "link", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-2 sm:grid-cols-3", children: [
                /* @__PURE__ */ e(G, { value: C.label, onChange: (T) => m("links", [{ ...C, label: T.target.value }]), placeholder: "Label" }),
                /* @__PURE__ */ e(G, { value: C.url, onChange: (T) => m("links", [{ ...C, url: T.target.value }]), placeholder: "https://...", className: "sm:col-span-2" })
              ] }) }),
              (P.has("bg_color") || P.has("bg_image")) && /* @__PURE__ */ e(Ke, { value: "background", className: "p-1 pt-4", children: /* @__PURE__ */ a("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Background Image" }),
                  /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                    t.bg_image && /* @__PURE__ */ e("div", { className: "relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e("img", { src: t.bg_image, alt: "", className: "h-full w-full object-cover" }) }),
                    /* @__PURE__ */ e(Fe, { value: t.bg_image ?? null, onChange: (T) => m("bg_image", T ? T.url : null), accept: "image/*" }),
                    t.bg_image && /* @__PURE__ */ e(x, { type: "button", variant: "outline", "aria-label": "Remove background image", className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive", onClick: () => m("bg_image", null), children: "Remove" })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Background Color" }),
                  /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ e("input", { type: "color", value: t.bg_color ?? "#ffffff", onChange: (T) => m("bg_color", T.target.value || null), className: "h-9 w-10 rounded-sm border p-1" }),
                    /* @__PURE__ */ e(G, { value: t.bg_color ?? "", onChange: (T) => m("bg_color", T.target.value || null), placeholder: "#000000" })
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ e(Ct, { showCloseButton: !0 })
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", onClick: (T) => {
          T.stopPropagation(), c();
        }, children: /* @__PURE__ */ e(we, { className: "h-4 w-4 text-destructive" }) }),
        s ? /* @__PURE__ */ e(fn, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ e(wt, { className: "h-4 w-4 text-muted-foreground" })
      ] })
    ] }),
    s && /* @__PURE__ */ a(ze, { className: "space-y-5 px-3 py-4", children: [
      (P.has("caption") || P.has("title") || P.has("text")) && /* @__PURE__ */ a("div", { className: "space-y-4", children: [
        P.has("caption") && /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { children: "Caption" }),
          /* @__PURE__ */ e(G, { value: t.caption ?? "", onChange: (T) => m("caption", T.target.value || null), placeholder: "Enter your caption..." })
        ] }),
        P.has("title") && /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { children: "Heading" }),
          /* @__PURE__ */ e(G, { value: t.title ?? "", onChange: (T) => m("title", T.target.value || null), placeholder: "Enter your heading..." })
        ] }),
        P.has("text") && /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { children: "Text" }),
          /* @__PURE__ */ e(Oe, { value: t.text ?? "", onChange: (T) => m("text", T.target.value || null), placeholder: "Enter your text...", rows: 3 })
        ] })
      ] }),
      g && /* @__PURE__ */ a("div", { className: "space-y-3 border-t pt-5", children: [
        /* @__PURE__ */ a("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ a("div", { className: "space-y-1", children: [
            /* @__PURE__ */ a(L, { className: "text-sm font-semibold", children: [
              "Items",
              k ? ` · up to ${k} columns per row` : ""
            ] }),
            /* @__PURE__ */ a("div", { className: "flex items-center gap-3 text-xs font-medium text-muted-foreground", children: [
              /* @__PURE__ */ e("button", { type: "button", onClick: E, className: "hover:text-foreground", children: "Collapse all" }),
              /* @__PURE__ */ e("button", { type: "button", onClick: z, className: "hover:text-foreground", children: "Expand all" })
            ] })
          ] }),
          /* @__PURE__ */ a(
            x,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              disabled: N && (t.item?.length ?? 0) >= 1,
              onClick: (T) => {
                T.stopPropagation();
                const $ = R ? ba(R) : {};
                m("item", [...t.item ?? [], $]);
              },
              className: "gap-1",
              children: [
                /* @__PURE__ */ e($e, { className: "h-3.5 w-3.5" }),
                "Add Item"
              ]
            }
          )
        ] }),
        t.item && t.item.length > 0 ? /* @__PURE__ */ e(
          Kt,
          {
            items: (t.item ?? []).map((T, $) => `${t._instanceId}-item-${$}`),
            strategy: Aa,
            children: /* @__PURE__ */ e("div", { className: "grid gap-3 lg:grid-cols-2", children: t.item.map((T, $) => /* @__PURE__ */ e(
              Nl,
              {
                id: `${t._instanceId}-item-${$}`,
                item: T,
                itemIdx: $,
                itemTemplate: R,
                onUpdateItemField: y,
                onRemove: (J) => m(
                  "item",
                  (t.item ?? []).filter((j, X) => X !== J)
                ),
                isExpanded: !_.has(`${t._instanceId}-item-${$}`),
                onToggleExpanded: () => h(`${t._instanceId}-item-${$}`),
                onDuplicate: (J) => m("item", [...t.item ?? [], { ...(t.item ?? [])[J] }])
              },
              `${t._instanceId}-item-${$}`
            )) })
          }
        ) : /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: 'No items added. Click "Add Item" to create one.' })
      ] }),
      t.links && t.links.length > 0 && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ a(Ue, { variant: "secondary", children: [
          t.links.length,
          " links"
        ] }),
        /* @__PURE__ */ e("span", { children: "embedded" })
      ] })
    ] })
  ] });
}
function Cl(t) {
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
function En({ embeddedSections: t, onChange: n }) {
  const s = Tn(), [l] = d(() => s.map(Cl)), [i, r] = d(!1), [o, c] = d(/* @__PURE__ */ new Set()), [u, m] = d(/* @__PURE__ */ new Set()), [y, _] = d(/* @__PURE__ */ new Map()), h = ka(
    jt(Sa, { activationConstraint: { distance: 6 } })
  );
  function E(k) {
    const C = l.find((v) => v.id === k);
    if (!C) return;
    let f = null, I = null, B = null;
    const V = C.template?.itemMode !== "none";
    try {
      C.links && (f = JSON.parse(C.links));
    } catch {
    }
    const M = C.template?.demo?.items;
    V && M?.length && (B = { ...C.item }, I = M.map((v) => ({
      ...v,
      links: Array.isArray(v.links) ? v.links.map((Q) => ({ ...Q })) : v.links
    })));
    try {
      if (V && !I && C.item) {
        const v = typeof C.item == "string" ? JSON.parse(C.item) : C.item;
        v && !Array.isArray(v) ? (B = { ...v }, I = [ba({ ...v })]) : Array.isArray(v) && (I = v, B = v.length > 0 ? { ...v[0] } : null);
      }
    } catch {
    }
    V && !I && B && (I = [ba(B)]);
    const w = {
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      id: C.id,
      type: C.type,
      caption: C.caption,
      title: C.title,
      text: C.text,
      image: C.image,
      alt_image: C.alt_image,
      bg_color: C.bg_color,
      bg_image: C.bg_image,
      style_css: C.style_css,
      style_css_inline: C.style_css_inline,
      style_id: C.style_id,
      alignment: C.alignment,
      limit: C.limit,
      sort: C.sort ?? 0,
      sort_by: C.sort_by,
      sort_order: C.sort_order,
      category: C.category,
      links: f,
      item: V ? I && I.length > 0 ? I : [] : null
    }, A = t.length;
    n([...t, w]), r(!1), V && B && _((v) => new Map(v).set(A, B)), c((v) => new Set(v).add(A));
  }
  function z(k) {
    n(t.filter((C, f) => f !== k));
  }
  function O(k) {
    const C = t[k];
    if (!C) return;
    const f = {
      ...C,
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      links: C.links?.map((I) => ({ ...I })) ?? null,
      item: C.item?.map((I) => ({ ...I })) ?? null
    };
    n([
      ...t.slice(0, k + 1),
      f,
      ...t.slice(k + 1)
    ]), c((I) => {
      const B = /* @__PURE__ */ new Set();
      return I.forEach((V) => B.add(V > k ? V + 1 : V)), B.add(k + 1), B;
    }), _((I) => {
      const B = /* @__PURE__ */ new Map();
      I.forEach((M, w) => {
        B.set(w > k ? w + 1 : w, M);
      });
      const V = I.get(k);
      return V && B.set(k + 1, { ...V }), B;
    });
  }
  function R(k, C, f) {
    n(t.map((I, B) => B === k ? { ...I, [C]: f } : I));
  }
  function b(k, C, f, I) {
    n(
      t.map((B, V) => V !== k || !B.item ? B : {
        ...B,
        item: B.item.map((M, w) => w === C ? { ...M, [f]: I } : M)
      })
    );
  }
  function p(k) {
    c((C) => {
      const f = new Set(C);
      return f.has(k) ? f.delete(k) : f.add(k), f;
    });
  }
  function g(k) {
    m((C) => {
      const f = new Set(C);
      return f.has(k) ? f.delete(k) : f.add(k), f;
    });
  }
  function N() {
    c(/* @__PURE__ */ new Set()), m(new Set(
      t.flatMap(
        (k) => (k.item ?? []).map((C, f) => `${k._instanceId}-item-${f}`)
      )
    ));
  }
  function P() {
    c(new Set(t.map((k, C) => C))), m(/* @__PURE__ */ new Set());
  }
  function U(k) {
    const { active: C, over: f } = k;
    if (!f || C.id === f.id) return;
    const I = String(C.id), B = String(f.id);
    if (!I.includes("-item-") && !B.includes("-item-")) {
      const V = t.findIndex((w) => w._instanceId === I), M = t.findIndex((w) => w._instanceId === B);
      if (V === -1 || M === -1) return;
      n(xt(t, V, M));
      return;
    }
    if (I.includes("-item-") && B.includes("-item-")) {
      const V = I.split("-item-")[0], M = B.split("-item-")[0];
      if (V !== M) return;
      const w = t.findIndex(($) => $._instanceId === V);
      if (w === -1) return;
      const A = t[w];
      if (!A.item) return;
      const v = parseInt(I.split("-item-")[1], 10), Q = parseInt(B.split("-item-")[1], 10);
      if (isNaN(v) || isNaN(Q)) return;
      const T = xt(A.item, v, Q);
      n(
        t.map(
          ($, J) => J === w ? { ...$, item: T } : $
        )
      );
      return;
    }
  }
  return /* @__PURE__ */ a("div", { className: "space-y-3", children: [
    t.length > 0 && /* @__PURE__ */ a("div", { className: "flex items-center gap-3 px-0.5 text-xs font-medium", children: [
      /* @__PURE__ */ e("button", { type: "button", onClick: N, className: "text-muted-foreground transition-colors hover:text-foreground", children: "Collapse all" }),
      /* @__PURE__ */ e("button", { type: "button", onClick: P, className: "text-muted-foreground transition-colors hover:text-foreground", children: "Expand all" })
    ] }),
    /* @__PURE__ */ a(ut, { open: i, onOpenChange: r, children: [
      /* @__PURE__ */ e(
        Mt,
        {
          render: /* @__PURE__ */ a(x, { type: "button", variant: "outline", className: "gap-1.5", children: [
            /* @__PURE__ */ e($e, { className: "h-3.5 w-3.5" }),
            "Add Section"
          ] })
        }
      ),
      /* @__PURE__ */ a(mt, { className: "sm:max-w-lg", children: [
        /* @__PURE__ */ a(ht, { children: [
          /* @__PURE__ */ e(gt, { children: "Add Section" }),
          /* @__PURE__ */ e(Ta, { children: "Select a developer-provided section template. Its fields and layout are defined in code." })
        ] }),
        /* @__PURE__ */ a("div", { className: "max-h-[60vh] space-y-2 overflow-y-auto pr-1", children: [
          l.map((k) => /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              className: "h-auto w-full justify-start px-3 py-3 text-left",
              onClick: () => E(k.id),
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
    t.length > 0 && /* @__PURE__ */ e(Pa, { sensors: h, collisionDetection: _a, onDragEnd: U, children: /* @__PURE__ */ e(Kt, { items: t.map((k) => k._instanceId), strategy: Aa, children: /* @__PURE__ */ e("div", { className: "space-y-3", children: t.map((k, C) => /* @__PURE__ */ e(
      wl,
      {
        section: k,
        index: C,
        isExpanded: o.has(C),
        itemTemplate: y.get(C) ?? null,
        availableSections: l,
        template: s.find((f) => f.type === k.type) ?? null,
        onToggleExpanded: () => p(C),
        onRemove: () => z(C),
        onDuplicate: () => O(C),
        onUpdateField: (f, I) => R(C, f, I),
        onUpdateItemField: (f, I, B) => b(C, f, I, B),
        collapsedItems: u,
        onToggleItemExpanded: g,
        onCollapseItems: () => m((f) => /* @__PURE__ */ new Set([...f, ...(k.item ?? []).map((I, B) => `${k._instanceId}-item-${B}`)])),
        onExpandItems: () => m((f) => {
          const I = new Set(f);
          return (k.item ?? []).forEach((B, V) => I.delete(`${k._instanceId}-item-${V}`)), I;
        })
      },
      k._instanceId
    )) }) }) }),
    t.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No sections embedded. Pick one from above." })
  ] });
}
function kl({
  options: t,
  selected: n,
  onChange: s,
  placeholder: l = "Select...",
  className: i
}) {
  const [r, o] = ye.useState(!1), c = ye.useRef(null);
  ye.useEffect(() => {
    function _(h) {
      c.current && !c.current.contains(h.target) && o(!1);
    }
    return document.addEventListener("mousedown", _), () => document.removeEventListener("mousedown", _);
  }, []);
  function u(_) {
    n.includes(_) ? s(n.filter((h) => h !== _)) : s([...n, _]);
  }
  function m(_) {
    s(n.filter((h) => h !== _));
  }
  const y = t.filter((_) => n.includes(_.value)).map((_) => _.label);
  return /* @__PURE__ */ a("div", { ref: c, className: S("relative", i), children: [
    /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: () => o(!r),
        className: S(
          "flex min-h-[40px] w-full items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          y.length === 0 && "text-muted-foreground"
        ),
        children: [
          y.length > 0 ? /* @__PURE__ */ a("div", { className: "flex flex-1 flex-wrap gap-1", children: [
            y.slice(0, 3).map((_) => /* @__PURE__ */ a(
              Ue,
              {
                variant: "secondary",
                className: "px-1.5 py-0 text-xs font-normal",
                children: [
                  _,
                  /* @__PURE__ */ e(
                    "button",
                    {
                      type: "button",
                      onClick: (h) => {
                        h.stopPropagation();
                        const E = t.find((z) => z.label === _);
                        E && m(E.value);
                      },
                      className: "ml-1 rounded-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      children: /* @__PURE__ */ e(Vt, { className: "h-3 w-3 text-muted-foreground hover:text-foreground" })
                    }
                  )
                ]
              },
              _
            )),
            y.length > 3 && /* @__PURE__ */ a(Ue, { variant: "secondary", className: "px-1.5 py-0 text-xs font-normal", children: [
              "+",
              y.length - 3
            ] })
          ] }) : /* @__PURE__ */ e("span", { className: "flex-1 text-left", children: l }),
          /* @__PURE__ */ e(
            wt,
            {
              className: S(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                r && "rotate-180"
              )
            }
          )
        ]
      }
    ),
    r && /* @__PURE__ */ e("div", { className: "absolute z-50 mt-1 w-full rounded-sm border border-border bg-popover p-1 shadow-md", children: t.length === 0 ? /* @__PURE__ */ e("p", { className: "px-2 py-4 text-center text-sm text-muted-foreground", children: "No options available." }) : /* @__PURE__ */ e("div", { className: "max-h-48 overflow-y-auto", children: t.map((_) => {
      const h = n.includes(_.value);
      return /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          onClick: () => u(_.value),
          className: S(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:bg-accent focus-visible:text-accent-foreground",
            h && "bg-accent/50"
          ),
          children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: S(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                  h ? "border-primary bg-primary text-primary-foreground" : "border-input"
                ),
                children: h && /* @__PURE__ */ e(Ht, { className: "h-3 w-3" })
              }
            ),
            /* @__PURE__ */ e("span", { children: _.label })
          ]
        },
        _.value
      );
    }) }) })
  ] });
}
const Sl = me(async () => ({ default: (await Promise.resolve().then(() => Un)).TiptapEditor }));
function Ln({ post: t, categories: n = [], mode: s, pageTitle: l, defaultType: i }) {
  const { session: r } = Ze(), [o, c] = yt(), [u, m] = d({}), [y, _] = d(null), [h, E] = d(t?.title ?? ""), [z, O] = d(t?.status === "published" ? "published" : "draft"), [R, b] = d(t?.publishedAt ?? null), [p, g] = d(!1), N = z === "published" && !!R && R > Date.now(), [P, U] = d(t?.slug ?? ""), [k, C] = d(!!t?.slug), [f, I] = d(t?.type ?? i ?? "post"), B = r?.permissions.includes(`content.${f}.publish`) ?? !1, V = r?.permissions.includes(`content.${f}.unpublish`) ?? !1, [M, w] = d(t?.excerpt ?? ""), [A, v] = d(t?.description ?? ""), [Q, T] = d(() => {
    if (t?.tags)
      try {
        const H = JSON.parse(t.tags);
        return Array.isArray(H) ? H.join(", ") : "";
      } catch {
        return "";
      }
    return "";
  }), [$, J] = d(() => t?.categories?.map((H) => H.id) ?? []), [j, X] = d(t?.metaTitle ?? ""), [D, Y] = d(t?.metaDescription ?? ""), [K, Z] = d(t?.featuredImage ?? ""), [Ne, de] = d(() => {
    if (!t?.gallery) return [];
    try {
      const H = JSON.parse(t.gallery);
      return Array.isArray(H) ? H.filter((pe) => typeof pe == "string") : [];
    } catch {
      return [];
    }
  }), [ce, F] = d(() => {
    if (t?.customFieldValues)
      try {
        return JSON.parse(t.customFieldValues);
      } catch {
        return {};
      }
    return {};
  }), [he, be] = d(() => {
    if (t?.sections)
      try {
        const H = JSON.parse(t.sections);
        return (Array.isArray(H) ? H : []).map((ae) => ({
          ...ae,
          _instanceId: ae._instanceId || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        }));
      } catch {
        return [];
      }
    return [];
  }), [ea, Fn] = d(!1), [Hn, Vn] = d(null), Gn = ka(
    jt(Sa, { activationConstraint: { distance: 6 } })
  );
  te(() => {
    !k && s === "create" && U(Ea(h));
  }, [h, k, s]), te(() => {
    const H = Zt();
    let pe = !1;
    const ae = H.contentTypes.find((ie) => ie.slug === f)?.detailTemplate;
    return pe || (Vn(ae ?? null), Fn(ae ? H.templates.find((ie) => ie.id === ae && ie.kind === "detail")?.sectionsEnabled === !0 : !1)), () => {
      pe = !0;
    };
  }, [f]);
  function qn(H) {
    C(!0), U(H);
  }
  function Kn(H) {
    const { active: pe, over: ae } = H;
    !ae || pe.id === ae.id || de((ie) => {
      const Rt = ie.indexOf(String(pe.id)), La = ie.indexOf(String(ae.id));
      return Rt === -1 || La === -1 ? ie : xt(ie, Rt, La);
    });
  }
  function Wn(H) {
    H.preventDefault(), m({}), _(null);
    const pe = Q.split(",").map((ie) => ie.trim()).filter((ie) => ie.length > 0), ae = {
      title: h,
      type: f,
      status: z
    };
    M.trim() && (ae.excerpt = M), A.trim() && (ae.description = A), j.trim() && (ae.metaTitle = j), D.trim() && (ae.metaDescription = D), K.trim() && (ae.featuredImage = K), P && (ae.slug = P), pe.length > 0 && (ae.tags = pe), $.length > 0 && (ae.categoryIds = $), Object.keys(ce).length > 0 && (ae.customFieldValues = ce), he.length > 0 && (ae.sections = he.map(({ _instanceId: ie, ...Rt }) => Rt)), Ne.length > 0 && (ae.gallery = Ne), z === "published" && R && (ae.publishedAt = R), c(async () => {
      let ie;
      s === "edit" && t ? ie = await rt(`/api/admin/posts/${t.id}`, ae) : ie = await Le("/api/admin/posts", ae), ie.success ? (W.success(s === "edit" ? "update" : "create", f), Xe(`/admin/posts/${f}`)) : ie.errors && Object.keys(ie.errors).length > 0 ? (m(ie.errors), W.error(ie.message)) : (_(ie.message), W.error(ie.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: Wn, className: "", children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: l || "Projects",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: o, children: o ? s === "edit" ? "Saving…" : "Creating…" : s === "edit" ? "Save Changes" : `Create ${f.charAt(0).toUpperCase() + f.slice(1)}` }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Xe("/admin/posts"),
              disabled: o,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "p-4 space-y-4", children: /* @__PURE__ */ a("div", { className: "space-y-4", children: [
      y && /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: y }),
      /* @__PURE__ */ a("div", { className: "grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]", children: [
        /* @__PURE__ */ a("div", { className: "space-y-4", children: [
          /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(_e, { className: "", children: /* @__PURE__ */ a(Ae, { className: "text-base", children: [
              f.charAt(0).toUpperCase() + f.slice(1),
              " Details"
            ] }) }),
            /* @__PURE__ */ a(ze, { className: "space-y-5", children: [
              /* @__PURE__ */ a("div", { className: "space-y-5", children: [
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { htmlFor: "title", children: "Title" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      id: "title",
                      value: h,
                      onChange: (H) => E(H.target.value),
                      placeholder: `${f.charAt(0).toUpperCase() + f.slice(1)} title`,
                      "aria-invalid": !!u.title,
                      "aria-describedby": u.title ? "title-error" : void 0
                    }
                  ),
                  u.title && /* @__PURE__ */ e("p", { id: "title-error", className: "text-xs text-destructive", children: u.title[0] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { htmlFor: "slug", children: "Slug" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      id: "slug",
                      value: P,
                      onChange: (H) => qn(H.target.value),
                      placeholder: `${f}-url-slug`,
                      "aria-invalid": !!u.slug,
                      "aria-describedby": u.slug ? "slug-error" : void 0
                    }
                  ),
                  u.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: u.slug[0] }),
                  !k && s === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from title. Edit to customize." })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5 md:col-span-2", children: [
                  /* @__PURE__ */ e(L, { htmlFor: "excerpt", children: "Excerpt" }),
                  /* @__PURE__ */ e(
                    Oe,
                    {
                      id: "excerpt",
                      value: M,
                      onChange: (H) => w(H.target.value),
                      placeholder: `Brief summary of the ${f}...`,
                      rows: 3,
                      "aria-invalid": !!u.excerpt,
                      "aria-describedby": u.excerpt ? "excerpt-error" : void 0
                    }
                  ),
                  u.excerpt && /* @__PURE__ */ e("p", { id: "excerpt-error", className: "text-xs text-destructive", children: u.excerpt[0] })
                ] })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(L, { children: "Content" }),
                /* @__PURE__ */ e(
                  xa,
                  {
                    fallback: /* @__PURE__ */ e("div", { className: "min-h-64 rounded-sm border bg-muted/20", "aria-busy": "true" }),
                    children: /* @__PURE__ */ e(
                      Sl,
                      {
                        content: A,
                        onChange: v,
                        placeholder: `Write your ${f} content here...`
                      }
                    )
                  }
                ),
                u.description && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.description[0] })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(L, { htmlFor: "gallery", children: "Gallery" }),
                /* @__PURE__ */ a("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4 space-y-3", children: [
                  /* @__PURE__ */ e(
                    Fe,
                    {
                      value: Ne[0] ?? null,
                      onChange: (H) => {
                        if (!H) {
                          de([]);
                          return;
                        }
                        de((pe) => [H.url, ...pe.filter((ae) => ae !== H.url)]);
                      },
                      onSelect: (H) => {
                        de((pe) => {
                          const ae = [...pe];
                          for (const ie of H)
                            ae.includes(ie.url) || ae.push(ie.url);
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
                  Ne.length > 0 && /* @__PURE__ */ e(
                    Pa,
                    {
                      sensors: Gn,
                      collisionDetection: _a,
                      onDragEnd: Kn,
                      children: /* @__PURE__ */ e(Kt, { items: Ne, strategy: Es, children: /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2", children: Ne.map((H) => /* @__PURE__ */ e(
                        Pl,
                        {
                          url: H,
                          onRemove: () => de((pe) => pe.filter((ae) => ae !== H))
                        },
                        H
                      )) }) })
                    }
                  )
                ] }),
                u.gallery && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.gallery[0] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(_e, { className: "", children: /* @__PURE__ */ e(Ae, { className: "text-base", children: "SEO" }) }),
            /* @__PURE__ */ a(ze, { className: "space-y-5", children: [
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(L, { htmlFor: "metaTitle", children: "Meta Title" }),
                /* @__PURE__ */ e(
                  G,
                  {
                    id: "metaTitle",
                    value: j,
                    onChange: (H) => X(H.target.value),
                    placeholder: "SEO title (max 60 characters)",
                    maxLength: 60,
                    "aria-invalid": !!u.metaTitle,
                    "aria-describedby": u.metaTitle ? "metaTitle-error" : void 0
                  }
                ),
                /* @__PURE__ */ a("div", { className: "flex justify-between", children: [
                  u.metaTitle ? /* @__PURE__ */ e("p", { id: "metaTitle-error", className: "text-xs text-destructive", children: u.metaTitle[0] }) : /* @__PURE__ */ e("span", {}),
                  /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
                    j.length,
                    "/60"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(L, { htmlFor: "metaDescription", children: "Meta Description" }),
                /* @__PURE__ */ e(
                  Oe,
                  {
                    id: "metaDescription",
                    value: D,
                    onChange: (H) => Y(H.target.value),
                    placeholder: "SEO description (max 160 characters)",
                    maxLength: 160,
                    rows: 4,
                    "aria-invalid": !!u.metaDescription,
                    "aria-describedby": u.metaDescription ? "metaDescription-error" : void 0
                  }
                ),
                /* @__PURE__ */ a("div", { className: "flex justify-between", children: [
                  u.metaDescription ? /* @__PURE__ */ e("p", { id: "metaDescription-error", className: "text-xs text-destructive", children: u.metaDescription[0] }) : /* @__PURE__ */ e("span", {}),
                  /* @__PURE__ */ a("span", { className: "text-xs text-muted-foreground", children: [
                    D.length,
                    "/160"
                  ] })
                ] })
              ] })
            ] })
          ] }),
          ea && /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(_e, { className: "", children: /* @__PURE__ */ e(Ae, { className: "text-base", children: "Sections" }) }),
            /* @__PURE__ */ a(ze, { className: "", children: [
              /* @__PURE__ */ e(
                En,
                {
                  embeddedSections: he,
                  onChange: be
                }
              ),
              u.sections && /* @__PURE__ */ e("p", { className: "text-xs text-destructive mt-2", children: u.sections[0] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-4", children: [
          /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(_e, { children: /* @__PURE__ */ e(Ae, { className: "text-base", children: "Visibility" }) }),
            /* @__PURE__ */ a(ze, { className: "space-y-3", children: [
              /* @__PURE__ */ a("button", { type: "button", disabled: !B, className: "flex items-center gap-2 text-sm disabled:opacity-50", onClick: () => {
                O("published"), b(null);
              }, children: [
                /* @__PURE__ */ e("span", { className: `size-4 rounded-full border-4 ${z === "published" && !N ? "border-foreground" : "border-transparent ring-1 ring-border"}` }),
                "Publish"
              ] }),
              /* @__PURE__ */ a("button", { type: "button", disabled: !V, className: "flex items-center gap-2 text-sm disabled:opacity-50", onClick: () => {
                O("draft"), b(null);
              }, children: [
                /* @__PURE__ */ e("span", { className: `size-4 rounded-full border-4 ${z === "draft" || N ? "border-foreground" : "border-transparent ring-1 ring-border"}` }),
                "Draft"
              ] }),
              N ? /* @__PURE__ */ a("div", { className: "ml-6 flex items-start justify-between gap-2 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ a("span", { children: [
                  "Will publish on ",
                  new Date(R).toLocaleString()
                ] }),
                /* @__PURE__ */ a("div", { className: "flex", children: [
                  /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": "Edit publish date", disabled: !B, onClick: () => g(!0), children: /* @__PURE__ */ e(pn, {}) }),
                  /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "icon-sm", "aria-label": "Remove publish date", disabled: !V, onClick: () => {
                    O("draft"), b(null);
                  }, children: /* @__PURE__ */ e(we, {}) })
                ] })
              ] }) : /* @__PURE__ */ e(x, { type: "button", variant: "ghost", size: "sm", className: "ml-5", disabled: !B, onClick: () => g(!0), children: "Schedule publish" })
            ] })
          ] }),
          /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(_e, { children: /* @__PURE__ */ e(Ae, { className: "text-base", children: "Image" }) }),
            /* @__PURE__ */ a(ze, { className: "space-y-5", children: [
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
                K ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: K,
                    alt: "Featured image preview",
                    className: "object-cover h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No image" }),
                /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Fe,
                    {
                      value: K,
                      onChange: (H) => {
                        Z(H ? H.url : "");
                      },
                      accept: "image/*"
                    },
                    K || "empty"
                  ),
                  /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Choose a hero image from the media library." }),
                  K && /* @__PURE__ */ e(
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
              u.featuredImage && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.featuredImage[0] })
            ] })
          ] }),
          /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(_e, { children: /* @__PURE__ */ e(Ae, { className: "text-base", children: "Organization" }) }),
            /* @__PURE__ */ a(ze, { className: "flex flex-col gap-5", children: [
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(L, { htmlFor: "tags", children: "Tags" }),
                /* @__PURE__ */ e(
                  G,
                  {
                    id: "tags",
                    value: Q,
                    onChange: (H) => T(H.target.value),
                    placeholder: "tag1, tag2, tag3 (comma-separated)",
                    "aria-invalid": !!u.tags,
                    "aria-describedby": u.tags ? "tags-error" : void 0
                  }
                ),
                u.tags && /* @__PURE__ */ e("p", { id: "tags-error", className: "text-xs text-destructive", children: u.tags[0] }),
                Q && /* @__PURE__ */ e("div", { className: "flex flex-wrap gap-1 mt-1", children: Q.split(",").map((H) => H.trim()).filter((H) => H.length > 0).map((H, pe) => /* @__PURE__ */ e(Ue, { variant: "outline", className: "text-xs", children: H }, pe)) })
              ] }),
              /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ e(L, { children: "Categories" }),
                n.length > 0 ? /* @__PURE__ */ e(
                  kl,
                  {
                    options: n.map((H) => ({
                      value: H.id,
                      label: H.name
                    })),
                    selected: $,
                    onChange: J,
                    placeholder: "Select categories..."
                  }
                ) : /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No categories available. Create categories first." }),
                u.categoryIds && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: u.categoryIds[0] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
            /* @__PURE__ */ e(_e, { children: /* @__PURE__ */ e(Ae, { className: "text-base", children: "Custom fields" }) }),
            /* @__PURE__ */ e(ze, { children: /* @__PURE__ */ e(pl, { detailTemplate: Hn, values: ce, onChange: F }) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ e(ut, { open: p, onOpenChange: g, children: /* @__PURE__ */ a(mt, { children: [
      /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "Set visibility date" }) }),
      /* @__PURE__ */ e("input", { type: "datetime-local", className: "w-full rounded-sm border px-3 py-2", value: R ? new Date(R - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "", onChange: (H) => b(H.target.value ? new Date(H.target.value).getTime() : null) }),
      /* @__PURE__ */ a(Ct, { children: [
        /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => g(!1), children: "Cancel" }),
        /* @__PURE__ */ e(x, { type: "button", disabled: !R, onClick: () => {
          O("published"), g(!1);
        }, children: "Set visibility date" })
      ] })
    ] }) })
  ] });
}
function Pl({
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
        /* @__PURE__ */ e("div", { className: "relative aspect-square", children: /* @__PURE__ */ e("img", { src: t, alt: "Gallery image", className: "object-cover h-full w-full" }) })
      ]
    }
  );
}
function _l() {
  const { type: t = "post" } = Ve(), [n, s] = d([]), [l, i] = d(!0);
  return te(() => {
    const r = new URLSearchParams();
    r.set("type", t), ue(`/api/admin/categories?${r.toString()}`).then((o) => {
      s(o), i(!1);
    });
  }, [t]), l ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    Ln,
    {
      mode: "create",
      categories: n,
      pageTitle: `Create ${t.charAt(0).toUpperCase() + t.slice(1)}`,
      defaultType: t
    }
  ) });
}
function Al({ id: t }) {
  const { type: n = "post" } = Ve(), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!0);
  return te(() => {
    Promise.all([
      ue(`/api/admin/posts/${t}`),
      ue("/api/admin/categories")
    ]).then(([u, m]) => {
      l(u), r(m), c(!1);
    });
  }, [t]), o ? /* @__PURE__ */ e(ge, {}) : s ? /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    Ln,
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
  AdminPostCreatePage: _l,
  AdminPostEditPage: Al
}, Symbol.toStringTag, { value: "Module" }));
function zl() {
  const [t, n] = d(null), [s, l] = d(null), [i, r] = d([]), [o, c] = d(!1), [u, m] = d(!1), [y, _] = d(""), [h, E] = d(null), [z, O] = d(!1), R = dt(), b = Qe(), p = "page", g = "/admin/posts/page", [N, P] = d(
    new URLSearchParams(R.search).get("search") ?? ""
  ), [U, k] = d(
    new URLSearchParams(R.search).get("status") ?? "all"
  ), [C, f] = d(
    new URLSearchParams(R.search).get("sortBy") ?? ""
  ), [I, B] = d(
    new URLSearchParams(R.search).get("sortOrder") ?? ""
  );
  async function V() {
    l(null);
    const F = new URLSearchParams();
    N && F.set("search", N), U && U !== "all" && F.set("status", U), C && F.set("sortBy", C), I && F.set("sortOrder", I), F.set("type", p);
    const he = F.toString() ? `?${F.toString()}` : "", be = await ue(`/api/admin/posts${he}`);
    n(be), r([]);
  }
  te(() => {
    V().catch((F) => l(F.message));
  }, [R.search, p]);
  function M() {
    b(Ce(g, { search: N, status: U, sortBy: C, sortOrder: I }));
  }
  function w(F) {
    const he = C === F && I === "asc" ? "desc" : "asc";
    f(F), B(he), b(Ce(g, { search: N, status: U, sortBy: F, sortOrder: he }));
  }
  function A(F) {
    F.key === "Enter" && (F.preventDefault(), M());
  }
  const v = Re(!0);
  te(() => {
    if (v.current) {
      v.current = !1;
      return;
    }
    const F = setTimeout(() => {
      M();
    }, 400);
    return () => clearTimeout(F);
  }, [N, U, p]);
  const Q = q((F) => {
    t?.data && r(F ? t.data.map((he) => he.id) : []);
  }, [t]), T = q((F, he) => {
    r(
      (be) => he ? [...be, F] : be.filter((ea) => ea !== F)
    );
  }, []), $ = t?.data?.length > 0 && i.length === t.data.length, J = i.length > 0;
  function j(F) {
    m(F), F || (_(""), E(null));
  }
  async function X(F) {
    F.preventDefault();
    const he = y.trim();
    if (!he) {
      E("Title is required.");
      return;
    }
    E(null), O(!0);
    const be = await Le("/api/admin/posts", {
      title: he,
      type: p,
      status: "draft"
    });
    if (O(!1), be.success) {
      W.success("create", "page"), b(`${g}/${be.data.id}/edit`);
      return;
    }
    E(be.errors?.title?.[0] ?? be.message), W.error(be.message);
  }
  async function D(F, he) {
    if (i.length === 0) return;
    c(!0);
    const be = await Le(F, { ids: i });
    c(!1), be.success ? (W.success("update", "page"), await V()) : W.error(be.message);
  }
  const Y = q(async () => {
    i.length !== 0 && confirm(`Delete ${i.length} page(s)? This action cannot be undone.`) && await D("/api/admin/posts/bulk/delete");
  }, [i]), K = q(async () => {
    await D("/api/admin/posts/bulk/publish");
  }, [i]), Z = q(async () => {
    await D("/api/admin/posts/bulk/unpublish");
  }, [i]), Ne = q(async () => {
    await D("/api/admin/posts/bulk/duplicate");
  }, [i]);
  if (s) return /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    s
  ] }) });
  if (!t) return /* @__PURE__ */ e(ge, {});
  const de = t.data ?? [];
  function ce(F) {
    return Ce(g, { search: N, status: U, sortBy: C, sortOrder: I, page: F });
  }
  return /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: "Pages",
        search: /* @__PURE__ */ e(
          G,
          {
            placeholder: "Search by title...",
            value: N,
            onChange: (F) => P(F.target.value),
            onKeyDown: A,
            className: "max-w-xs"
          }
        ),
        actions: /* @__PURE__ */ a(x, { type: "button", size: "lg", onClick: () => m(!0), children: [
          "New ",
          p.charAt(0).toUpperCase() + p.slice(1)
        ] })
      }
    ),
    /* @__PURE__ */ e(ut, { open: u, onOpenChange: j, children: /* @__PURE__ */ a(mt, { children: [
      /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "New Page" }) }),
      /* @__PURE__ */ a("form", { onSubmit: X, className: "space-y-4", children: [
        /* @__PURE__ */ a("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "new-page-title", children: "Title" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "new-page-title",
              value: y,
              onChange: (F) => {
                _(F.target.value), h && E(null);
              },
              placeholder: "Page title",
              autoFocus: !0,
              "aria-invalid": !!h,
              "aria-describedby": h ? "new-page-title-error" : void 0
            }
          ),
          h && /* @__PURE__ */ e("p", { id: "new-page-title-error", className: "text-xs text-destructive", children: h })
        ] }),
        /* @__PURE__ */ a(Ct, { children: [
          /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => j(!1), disabled: z, children: "Cancel" }),
          /* @__PURE__ */ e(x, { type: "submit", disabled: z, children: z ? "Creating…" : "Create Page" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ a("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ a("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ a(Ie, { value: U, onValueChange: (F) => {
          F && k(F);
        }, children: [
          /* @__PURE__ */ e(De, { className: "w-[140px]", children: /* @__PURE__ */ e(Te, { placeholder: "Status" }) }),
          /* @__PURE__ */ a(Ee, { children: [
            /* @__PURE__ */ e(re, { value: "all", children: "All Status" }),
            /* @__PURE__ */ e(re, { value: "draft", children: "Draft" }),
            /* @__PURE__ */ e(re, { value: "published", children: "Published" })
          ] })
        ] }),
        /* @__PURE__ */ e(x, { type: "button", variant: "secondary", size: "sm", onClick: M, children: "Filter" })
      ] }),
      J && /* @__PURE__ */ a("div", { className: "flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2", children: [
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
              onClick: K,
              disabled: o,
              children: "Publish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: Z,
              disabled: o,
              children: "Unpublish"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "outline",
              size: "sm",
              onClick: Ne,
              disabled: o,
              children: "Duplicate"
            }
          ),
          /* @__PURE__ */ e(
            x,
            {
              variant: "destructive",
              size: "sm",
              onClick: Y,
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
      /* @__PURE__ */ a(zt, { children: [
        /* @__PURE__ */ e(It, { children: /* @__PURE__ */ a(ke, { className: "bg-muted/35 hover:bg-muted/35", children: [
          /* @__PURE__ */ e(oe, { className: "w-10 px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: $,
              onCheckedChange: (F) => Q(F === !0),
              "aria-label": "Select all pages"
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => w("title"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Title",
                C === "title" ? I === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: "Status" }),
          /* @__PURE__ */ e(oe, { className: "w-px px-4 py-3", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => w("updatedAt"),
              className: "inline-flex items-center gap-1 hover:text-foreground",
              children: [
                "Updated",
                C === "updatedAt" ? I === "asc" ? /* @__PURE__ */ e(We, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Je, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ e(Ye, { className: "h-3.5 w-3.5 text-muted-foreground/50" })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ e(Tt, { children: de.length === 0 ? /* @__PURE__ */ e(ke, { children: /* @__PURE__ */ e(se, { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No pages found." }) }) : de.map((F) => /* @__PURE__ */ a(ke, { className: "hover:bg-muted/25", children: [
          /* @__PURE__ */ e(se, { className: "px-4 py-3", children: /* @__PURE__ */ e(
            xe,
            {
              checked: i.includes(F.id),
              onCheckedChange: (he) => T(F.id, he === !0),
              "aria-label": `Select ${F.title}`
            }
          ) }),
          /* @__PURE__ */ e(se, { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ e(fe, { to: `${g}/${F.id}/edit`, className: "underline", children: F.title }) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3", children: /* @__PURE__ */ e(
            Ue,
            {
              variant: F.status === "published" ? "default" : "secondary",
              className: F.status === "published" ? "border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300" : "capitalize",
              children: F.status
            }
          ) }),
          /* @__PURE__ */ e(se, { className: "w-px px-4 py-3 text-muted-foreground", children: new Date(F.updatedAt * 1e3).toLocaleDateString() })
        ] }, F.id)) })
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
          t.meta.currentPage > 1 && /* @__PURE__ */ e(fe, { to: ce(t.meta.currentPage - 1), className: "hover:text-foreground hover:underline", children: "Previous" }),
          t.meta.currentPage < t.meta.lastPage && /* @__PURE__ */ e(fe, { to: ce(t.meta.currentPage + 1), className: "hover:text-foreground hover:underline", children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
const Il = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminContentListPage: zl
}, Symbol.toStringTag, { value: "Module" })), Tl = me(async () => ({ default: (await Promise.resolve().then(() => Un)).TiptapEditor }));
function Dl(t) {
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
function Rn({ page: t, mode: n }) {
  const [s, l] = yt(), [i, r] = d({}), [o, c] = d(null), [u, m] = d(!1), [y, _] = d(t?.title ?? ""), [h, E] = d(t?.slug ?? ""), [z, O] = d(!!t?.slug), [R, b] = d(t?.description ?? ""), [p, g] = d(
    () => Dl(t?.sections)
  );
  te(() => {
    !z && n === "create" && E(Ea(y));
  }, [y, z, n]);
  function N(P) {
    P.preventDefault(), r({}), c(null);
    const U = {
      title: y,
      type: "page",
      status: t?.status ?? "draft"
    };
    h && (U.slug = h), R.trim() && (U.description = R), p.length > 0 && (U.sections = p.map(({ _instanceId: k, ...C }) => C)), l(async () => {
      const k = n === "edit" && t ? await rt(`/api/admin/posts/${t.id}`, U) : await Le("/api/admin/posts", U);
      if (k.success) {
        W.success(n === "edit" ? "update" : "create", "post"), Xe("/admin/posts/page");
        return;
      }
      k.errors && Object.keys(k.errors).length > 0 ? r(k.errors) : c(k.message), W.error(k.message);
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: N, className: "", children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: n === "edit" ? "Edit Page" : "Create Page",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: s, children: s ? n === "edit" ? "Saving…" : "Creating…" : n === "edit" ? "Save Changes" : "Create Page" }),
          /* @__PURE__ */ a(ut, { open: u, onOpenChange: m, children: [
            /* @__PURE__ */ e(
              Mt,
              {
                render: /* @__PURE__ */ a(x, { type: "button", variant: "outline", disabled: s, children: [
                  /* @__PURE__ */ e(wa, {}),
                  "Settings"
                ] })
              }
            ),
            /* @__PURE__ */ a(mt, { className: "sm:max-w-2xl", showCloseButton: !1, children: [
              /* @__PURE__ */ e(ht, { children: /* @__PURE__ */ e(gt, { children: "Page Details" }) }),
              /* @__PURE__ */ a("div", { className: "space-y-5", children: [
                /* @__PURE__ */ a("div", { className: "grid gap-5", children: [
                  /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                    /* @__PURE__ */ e(L, { htmlFor: "title", children: "Title" }),
                    /* @__PURE__ */ e(G, { id: "title", value: y, onChange: (P) => _(P.target.value), placeholder: "Page title", "aria-invalid": !!i.title, "aria-describedby": i.title ? "title-error" : void 0 }),
                    i.title && /* @__PURE__ */ e("p", { id: "title-error", className: "text-xs text-destructive", children: i.title[0] })
                  ] }),
                  /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                    /* @__PURE__ */ e(L, { htmlFor: "slug", children: "Slug" }),
                    /* @__PURE__ */ e(G, { id: "slug", value: h, onChange: (P) => {
                      O(!0), E(P.target.value);
                    }, placeholder: "page-url-slug", "aria-invalid": !!i.slug, "aria-describedby": i.slug ? "slug-error" : void 0 }),
                    i.slug && /* @__PURE__ */ e("p", { id: "slug-error", className: "text-xs text-destructive", children: i.slug[0] }),
                    !z && n === "create" && /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Auto-generated from title. Edit to customize." })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ e(L, { children: "Content" }),
                  /* @__PURE__ */ e(xa, { fallback: /* @__PURE__ */ e("div", { className: "min-h-64 rounded-sm border bg-muted/20", "aria-busy": "true" }), children: /* @__PURE__ */ e(Tl, { content: R, onChange: b, placeholder: "Write your page content here..." }) }),
                  i.description && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: i.description[0] })
                ] })
              ] }),
              /* @__PURE__ */ e(Ct, { children: /* @__PURE__ */ e(qi, { render: /* @__PURE__ */ e(x, { type: "button", variant: "outline" }), children: "Done" }) })
            ] })
          ] }),
          /* @__PURE__ */ e(x, { type: "button", variant: "outline", onClick: () => Xe("/admin/posts/page"), disabled: s, children: "Cancel" })
        ] })
      }
    ),
    /* @__PURE__ */ a("div", { className: "space-y-4 p-4", children: [
      o && /* @__PURE__ */ e("div", { className: "rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: o }),
      /* @__PURE__ */ a(Pe, { className: "overflow-hidden border-border/60 shadow-sm", children: [
        /* @__PURE__ */ e(_e, { children: /* @__PURE__ */ e(Ae, { className: "text-base", children: "Sections" }) }),
        /* @__PURE__ */ a(ze, { className: "", children: [
          /* @__PURE__ */ e(En, { embeddedSections: p, onChange: g }),
          i.sections && /* @__PURE__ */ e("p", { className: "mt-2 text-xs text-destructive", children: i.sections[0] })
        ] })
      ] })
    ] })
  ] });
}
function El() {
  return /* @__PURE__ */ e(Rn, { mode: "create" });
}
function Ll({ id: t }) {
  const [n, s] = d(null), [l, i] = d(!0);
  return te(() => {
    ue(`/api/admin/posts/${t}`).then((r) => {
      s(r), i(!1);
    });
  }, [t]), l ? /* @__PURE__ */ e(ge, {}) : n ? /* @__PURE__ */ e(Rn, { mode: "edit", page: n }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Page not found." });
}
const $n = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminPageCreatePage: El,
  AdminPageEditPage: Ll
}, Symbol.toStringTag, { value: "Module" }));
function Ml({
  groupedPermissions: t,
  selectedIds: n,
  onChange: s
}) {
  const l = Object.keys(t).sort();
  function i(c) {
    n.includes(c) ? s(n.filter((u) => u !== c)) : s([...n, c]);
  }
  function r(c) {
    const u = t[c].map((y) => y.id);
    if (u.every((y) => n.includes(y)))
      s(n.filter((y) => !u.includes(y)));
    else {
      const y = /* @__PURE__ */ new Set([...n, ...u]);
      s(Array.from(y));
    }
  }
  function o(c) {
    return t[c].map((m) => m.id).every((m) => n.includes(m));
  }
  return /* @__PURE__ */ e("div", { className: "grid gap-4 sm:grid-cols-2", children: l.map((c) => {
    const u = t[c], m = o(c);
    return /* @__PURE__ */ a(Pe, { size: "sm", children: [
      /* @__PURE__ */ e(_e, { className: "border-b", children: /* @__PURE__ */ a("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ e(Ae, { className: "capitalize", children: c }),
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
      /* @__PURE__ */ e(ze, { className: "pt-3", children: /* @__PURE__ */ e("div", { className: "flex flex-col gap-2", children: u.map((y) => /* @__PURE__ */ a(
        "label",
        {
          className: "flex items-center gap-2 text-sm cursor-pointer",
          children: [
            /* @__PURE__ */ e(
              xe,
              {
                checked: n.includes(y.id),
                onCheckedChange: () => i(y.id)
              }
            ),
            /* @__PURE__ */ e("span", { children: y.name })
          ]
        },
        y.id
      )) }) })
    ] }, c);
  }) });
}
function On({ mode: t, role: n, groupedPermissions: s, pageTitle: l }) {
  const [i, r] = yt(), [o, c] = d({}), [u, m] = d(null), [y, _] = d(n?.name ?? ""), [h, E] = d(n?.description ?? ""), [z, O] = d(
    () => n?.permissions?.map((b) => b.id) ?? []
  );
  function R(b) {
    b.preventDefault(), c({}), m(null), r(async () => {
      const p = {
        name: y,
        description: h,
        permissionIds: z
      };
      let g;
      t === "edit" && n ? g = await rt(`/api/admin/roles/${n.id}`, p) : g = await Le("/api/admin/roles", p), g.success ? (W.success(t === "edit" ? "update" : "create", "role"), Xe("/admin/roles")) : g.errors && Object.keys(g.errors).length > 0 ? (c(g.errors), W.error(g.message)) : (m(g.message), W.error(g.message));
    });
  }
  return /* @__PURE__ */ a("form", { onSubmit: R, className: "", children: [
    /* @__PURE__ */ e(
      Se,
      {
        title: l || "Roles",
        actions: /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e(x, { type: "submit", disabled: i, children: i ? t === "edit" ? "Saving…" : "Creating…" : t === "edit" ? "Save Changes" : "Create Role" }),
          /* @__PURE__ */ e(
            x,
            {
              type: "button",
              variant: "outline",
              onClick: () => Xe("/admin/roles"),
              disabled: i,
              children: "Cancel"
            }
          )
        ] })
      }
    ),
    u && /* @__PURE__ */ e("div", { className: "mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: u }),
    /* @__PURE__ */ a(Dt, { children: [
      /* @__PURE__ */ e(Et, { children: /* @__PURE__ */ a(je, { title: "Permissions", description: "Select the permissions this role should have.", children: [
        o.permissionIds && /* @__PURE__ */ e("p", { className: "text-xs text-destructive", children: o.permissionIds[0] }),
        /* @__PURE__ */ e(Ml, { groupedPermissions: s, selectedIds: z, onChange: O })
      ] }) }),
      /* @__PURE__ */ e(Lt, { children: /* @__PURE__ */ a(je, { title: "Role details", children: [
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "name", children: "Name" }),
          /* @__PURE__ */ e(
            G,
            {
              id: "name",
              value: y,
              onChange: (b) => _(b.target.value),
              placeholder: "e.g. Editor, Author, Moderator",
              "aria-invalid": !!o.name,
              "aria-describedby": o.name ? "name-error" : void 0
            }
          ),
          o.name && /* @__PURE__ */ e("p", { id: "name-error", className: "text-xs text-destructive", children: o.name[0] })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ e(L, { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ e(
            Oe,
            {
              id: "description",
              value: h,
              onChange: (b) => E(b.target.value),
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
function Bn(t) {
  return t.reduce((n, s) => {
    const l = s.group || "general";
    return n[l] || (n[l] = []), n[l].push(s), n;
  }, {});
}
function Rl() {
  const [t, n] = d(null), [s, l] = d(!0);
  te(() => {
    ue("/api/admin/roles").then((r) => {
      n(r.permissions), l(!1);
    });
  }, []);
  const i = Ot(
    () => Bn(t ?? []),
    [t]
  );
  return s ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    On,
    {
      mode: "create",
      groupedPermissions: i,
      pageTitle: "Create Role"
    }
  ) });
}
function $l({ id: t }) {
  const [n, s] = d(null), [l, i] = d(null), [r, o] = d(!0);
  te(() => {
    Promise.all([
      ue(`/api/admin/roles/${t}`),
      ue("/api/admin/roles")
    ]).then(([m, y]) => {
      s(m.role), i(y.permissions), o(!1);
    });
  }, [t]);
  const c = Ot(
    () => Bn(l ?? []),
    [l]
  ), u = Ot(() => !n || !l ? null : {
    ...n,
    permissions: l.filter((m) => n.permissionIds.includes(m.id))
  }, [l, n]);
  return r ? /* @__PURE__ */ e(ge, {}) : u ? /* @__PURE__ */ e(He, { children: /* @__PURE__ */ e(
    On,
    {
      mode: "edit",
      role: u,
      groupedPermissions: c,
      pageTitle: "Edit Role"
    }
  ) }) : /* @__PURE__ */ e("main", { className: "p-6", children: "Role not found." });
}
const jn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminRoleCreatePage: Rl,
  AdminRoleEditPage: $l
}, Symbol.toStringTag, { value: "Module" })), Ol = Intl.supportedValuesOf?.("timeZone") ?? [
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
], Bl = [
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
], jl = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
], Ul = [
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
function Fl() {
  const [t, n] = d(null), [s, l] = d(!0), [i, r] = d(!1), [o, c] = d(null);
  async function u() {
    l(!0), c(null);
    try {
      const p = await ue("/api/admin/settings");
      n(p);
    } catch (p) {
      c(p instanceof Error ? p.message : "Failed to load settings");
    } finally {
      l(!1);
    }
  }
  te(() => {
    u();
  }, []);
  function m(p, g) {
    t && n({ ...t, [p]: g });
  }
  function y() {
    t && m("links", [
      ...t.links,
      { platform: "", url: "https://", icon: "" }
    ]);
  }
  function _(p, g, N) {
    if (!t) return;
    const P = t.links.map(
      (U, k) => k === p ? { ...U, [g]: N } : U
    );
    m("links", P);
  }
  function h(p) {
    if (!t) return;
    const g = t.links.filter((N, P) => P !== p);
    m("links", g);
  }
  function E() {
    t && m("open_hours", [
      ...t.open_hours,
      { day: "Monday", open: "08:00", close: "17:00" }
    ]);
  }
  function z(p, g, N) {
    if (!t) return;
    const P = t.open_hours.map(
      (U, k) => k === p ? { ...U, [g]: N } : U
    );
    m("open_hours", P);
  }
  function O(p) {
    if (!t) return;
    const g = t.open_hours.filter((N, P) => P !== p);
    m("open_hours", g);
  }
  function R(p) {
    if (!t) return;
    const g = t.translate_countries, N = g.includes(p) ? g.filter((P) => P !== p) : [...g, p];
    m("translate_countries", N);
  }
  async function b() {
    if (t) {
      r(!0);
      try {
        const p = {
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
        }, g = await rt("/api/admin/settings", p);
        g.success ? (n(g.data), W.success("update", "settings")) : W.error(g.message);
      } catch (p) {
        W.error(p instanceof Error ? p.message : "Failed to save settings");
      } finally {
        r(!1);
      }
    }
  }
  return o ? /* @__PURE__ */ e("main", { className: "p-6", children: /* @__PURE__ */ a("p", { className: "text-destructive", children: [
    "Error: ",
    o
  ] }) }) : s || !t ? /* @__PURE__ */ e(ge, {}) : /* @__PURE__ */ a(et, { children: [
    /* @__PURE__ */ e(
      Se,
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
        Ge,
        {
          title: "General",
          description: "Basic site information",
          className: "lg:col-start-1 lg:row-start-1",
          children: [
            /* @__PURE__ */ a("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ a("div", { className: "space-y-2", children: [
                /* @__PURE__ */ e(L, { htmlFor: "title", children: "Site Title" }),
                /* @__PURE__ */ e(
                  G,
                  {
                    id: "title",
                    value: t.title,
                    onChange: (p) => m("title", p.target.value),
                    placeholder: "My Website"
                  }
                )
              ] }),
              /* @__PURE__ */ a("div", { className: "space-y-2", children: [
                /* @__PURE__ */ e(L, { htmlFor: "timezone", children: "Timezone" }),
                /* @__PURE__ */ a(Ie, { value: t.timezone, onValueChange: (p) => p && m("timezone", p), children: [
                  /* @__PURE__ */ e(De, { id: "timezone", children: /* @__PURE__ */ e(Te, { placeholder: "Select timezone" }) }),
                  /* @__PURE__ */ e(Ee, { children: Ol.map((p) => /* @__PURE__ */ e(re, { value: p, children: p }, p)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-2 mt-4", children: [
              /* @__PURE__ */ e(L, { htmlFor: "description", children: "Site Description" }),
              /* @__PURE__ */ e(
                Oe,
                {
                  id: "description",
                  value: t.description,
                  onChange: (p) => m("description", p.target.value),
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
                  onCheckedChange: (p) => m("maintenance_mode", p === !0)
                }
              ),
              /* @__PURE__ */ e(L, { htmlFor: "maintenance_mode", className: "cursor-pointer", children: "Maintenance Mode (site shows maintenance page to visitors)" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e(
        Ge,
        {
          title: "SEO & Meta",
          description: "Search engine optimization settings",
          className: "lg:col-start-1 lg:row-start-3",
          children: /* @__PURE__ */ a("div", { className: "space-y-4", children: [
            /* @__PURE__ */ a("div", { className: "space-y-2", children: [
              /* @__PURE__ */ e(L, { htmlFor: "meta_title", children: "Meta Title" }),
              /* @__PURE__ */ e(
                G,
                {
                  id: "meta_title",
                  value: t.meta_title,
                  onChange: (p) => m("meta_title", p.target.value),
                  placeholder: "Page title shown in browser tab"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "space-y-2", children: [
              /* @__PURE__ */ e(L, { htmlFor: "meta_description", children: "Meta Description" }),
              /* @__PURE__ */ e(
                Oe,
                {
                  id: "meta_description",
                  value: t.meta_description,
                  onChange: (p) => m("meta_description", p.target.value),
                  placeholder: "Brief page description for search engines",
                  rows: 3
                }
              )
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ge,
        {
          title: "Branding",
          description: "Logo and favicon",
          className: "lg:col-start-1 lg:row-start-2",
          children: /* @__PURE__ */ a("div", { className: "space-y-6", children: [
            /* @__PURE__ */ a("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ e(L, { children: "Logo" }),
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
                t.logo ? /* @__PURE__ */ e("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: t.logo,
                    alt: "Logo preview",
                    className: "object-contain h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No logo" }),
                /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Fe,
                    {
                      value: t.logo || null,
                      onChange: (p) => {
                        m("logo", p ? p.url : "");
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
              /* @__PURE__ */ e(L, { children: "Favicon" }),
              /* @__PURE__ */ e("div", { className: "rounded-sm border border-dashed bg-muted/30 p-4", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-4", children: [
                t.favicon ? /* @__PURE__ */ e("div", { className: "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted", children: /* @__PURE__ */ e(
                  "img",
                  {
                    src: t.favicon,
                    alt: "Favicon preview",
                    className: "object-contain h-full w-full"
                  }
                ) }) : /* @__PURE__ */ e("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground", children: "No icon" }),
                /* @__PURE__ */ a("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
                  /* @__PURE__ */ e(
                    Fe,
                    {
                      value: t.favicon || null,
                      onChange: (p) => {
                        m("favicon", p ? p.url : "");
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
        Ge,
        {
          title: "Social Media Links",
          description: "Links displayed in the footer or sidebar",
          className: "lg:col-span-2 lg:row-start-4",
          children: /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            t.links.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No social media links added yet." }),
            t.links.map((p, g) => /* @__PURE__ */ a("div", { className: "flex items-center gap-3 p-3 border rounded-sm bg-muted/30", children: [
              /* @__PURE__ */ a("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
                /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(L, { className: "text-xs", children: "Platform" }),
                  /* @__PURE__ */ a(Ie, { value: p.platform || void 0, onValueChange: (N) => N && _(g, "platform", N), children: [
                    /* @__PURE__ */ e(De, { children: /* @__PURE__ */ e(Te, { placeholder: "Select platform..." }) }),
                    /* @__PURE__ */ e(Ee, { children: Bl.map((N) => /* @__PURE__ */ e(re, { value: N, children: N }, N)) })
                  ] })
                ] }),
                /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(L, { className: "text-xs", children: "URL" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      value: p.url,
                      onChange: (N) => _(g, "url", N.target.value),
                      placeholder: "https://..."
                    }
                  )
                ] }),
                /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ e(L, { className: "text-xs", children: "Icon Class (optional)" }),
                  /* @__PURE__ */ e(
                    G,
                    {
                      value: p.icon ?? "",
                      onChange: (N) => _(g, "icon", N.target.value),
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
                  onClick: () => h(g),
                  className: "shrink-0 text-destructive hover:text-destructive",
                  children: /* @__PURE__ */ e(we, { className: "size-4" })
                }
              )
            ] }, g)),
            /* @__PURE__ */ a(x, { variant: "outline", size: "sm", onClick: y, children: [
              /* @__PURE__ */ e($e, { className: "size-3" }),
              " Add Social Link"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ge,
        {
          title: "Open Hours",
          description: "Business or office operating hours",
          className: "lg:col-span-2 lg:row-start-5",
          children: /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            t.open_hours.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "No open hours added yet." }),
            t.open_hours.map((p, g) => /* @__PURE__ */ a(
              "div",
              {
                className: "flex items-center gap-3 p-3 border rounded-sm bg-muted/30",
                children: [
                  /* @__PURE__ */ a("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
                    /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(L, { className: "text-xs", children: "Day" }),
                      /* @__PURE__ */ a(Ie, { value: p.day, onValueChange: (N) => N && z(g, "day", N), children: [
                        /* @__PURE__ */ e(De, { children: /* @__PURE__ */ e(Te, {}) }),
                        /* @__PURE__ */ e(Ee, { children: jl.map((N) => /* @__PURE__ */ e(re, { value: N, children: N }, N)) })
                      ] })
                    ] }),
                    /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(L, { className: "text-xs", children: "Open Time" }),
                      /* @__PURE__ */ e(
                        G,
                        {
                          type: "time",
                          value: p.open,
                          onChange: (N) => z(g, "open", N.target.value)
                        }
                      )
                    ] }),
                    /* @__PURE__ */ a("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ e(L, { className: "text-xs", children: "Close Time" }),
                      /* @__PURE__ */ e(
                        G,
                        {
                          type: "time",
                          value: p.close,
                          onChange: (N) => z(g, "close", N.target.value)
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ e(
                    x,
                    {
                      variant: "ghost",
                      size: "icon",
                      onClick: () => O(g),
                      className: "shrink-0 text-destructive hover:text-destructive",
                      children: /* @__PURE__ */ e(we, { className: "size-4" })
                    }
                  )
                ]
              },
              g
            )),
            /* @__PURE__ */ a(x, { variant: "outline", size: "sm", onClick: E, children: [
              /* @__PURE__ */ e($e, { className: "size-3" }),
              " Add Hours"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ge,
        {
          title: "Email Notifications",
          description: "Email addresses to receive notifications (separate with comma)",
          className: "lg:col-start-2 lg:row-start-1",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(L, { htmlFor: "email_notifications", children: "Recipient Emails" }),
            /* @__PURE__ */ e(
              G,
              {
                id: "email_notifications",
                value: t.email_notifications.join(", "),
                onChange: (p) => {
                  const g = p.target.value.split(",").map((N) => N.trim()).filter(Boolean);
                  m("email_notifications", g);
                },
                placeholder: "admin@example.com, editor@example.com"
              }
            ),
            /* @__PURE__ */ e("p", { className: "text-xs text-muted-foreground", children: "Separate multiple emails with commas." })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ge,
        {
          title: "Google Translate",
          description: "Languages available for Google Translate widget",
          className: "lg:col-start-2 lg:row-start-2",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground", children: "Select which languages to include in the Google Translate dropdown. Leave empty to disable." }),
            /* @__PURE__ */ e("div", { className: "max-h-64 overflow-y-auto border rounded-sm p-3", children: /* @__PURE__ */ e("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: Ul.map((p) => /* @__PURE__ */ a(
              "label",
              {
                className: "flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded-sm px-2 py-1",
                children: [
                  /* @__PURE__ */ e(
                    xe,
                    {
                      checked: t.translate_countries.includes(p.code),
                      onCheckedChange: () => R(p.code)
                    }
                  ),
                  p.name,
                  " (",
                  p.code,
                  ")"
                ]
              },
              p.code
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
        Ge,
        {
          title: "Custom CSS",
          description: "Custom styles added site-wide",
          className: "lg:col-span-2 lg:row-start-6",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(L, { htmlFor: "custom_css", children: "CSS Code" }),
            /* @__PURE__ */ e(
              Oe,
              {
                id: "custom_css",
                value: t.custom_css,
                onChange: (p) => m("custom_css", p.target.value),
                placeholder: "/* Add your custom CSS here */",
                rows: 8,
                className: "font-mono text-sm"
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ e(
        Ge,
        {
          title: "Custom JavaScript",
          description: "Custom scripts added before closing body tag",
          className: "lg:col-span-2 lg:row-start-7",
          children: /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e(L, { htmlFor: "custom_javascript", children: "JavaScript Code" }),
            /* @__PURE__ */ e(
              Oe,
              {
                id: "custom_javascript",
                value: t.custom_javascript,
                onChange: (p) => m("custom_javascript", p.target.value),
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
const Hl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdminSettingsPage: Fl
}, Symbol.toStringTag, { value: "Module" })), Vl = _t(
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
      className: S(Vl({ variant: n, size: s, className: t })),
      onClick: (c) => {
        i?.(!l), r?.(c);
      },
      ...o
    }
  );
}
function rn({ ...t }) {
  return /* @__PURE__ */ e(nt.Root, { "data-slot": "dropdown-menu", ...t });
}
function ln({ ...t }) {
  return /* @__PURE__ */ e(nt.Trigger, { "data-slot": "dropdown-menu-trigger", ...t });
}
function on({
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
          className: S("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", i),
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
      className: S(
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
      className: S(
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
      className: S("-mx-1 my-1 h-px bg-border", t),
      ...n
    }
  );
}
function Gl({ editor: t }) {
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
        children: /* @__PURE__ */ e(bn, { className: "size-4" })
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
        children: /* @__PURE__ */ e(vn, { className: "size-4" })
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
        children: /* @__PURE__ */ e(xn, { className: "size-4" })
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
    /* @__PURE__ */ e(it, { orientation: "vertical", className: "mx-1 h-6" }),
    /* @__PURE__ */ a("div", { className: "hidden md:flex items-center gap-0.5", children: [
      /* @__PURE__ */ e(
        le,
        {
          size: "sm",
          pressed: t.isActive("heading", { level: 1 }),
          onPressedChange: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
          "aria-label": "Heading 1",
          title: "Heading 1",
          children: /* @__PURE__ */ e(la, { className: "size-4" })
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
          children: /* @__PURE__ */ e(oa, { className: "size-4" })
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
          children: /* @__PURE__ */ e(ca, { className: "size-4" })
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
          children: /* @__PURE__ */ e(Ra, { className: "size-4" })
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
          children: /* @__PURE__ */ e($a, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(it, { orientation: "vertical", className: "mx-1 h-6" })
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
          children: /* @__PURE__ */ e(da, { className: "size-4" })
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
          children: /* @__PURE__ */ e(ua, { className: "size-4" })
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
          children: /* @__PURE__ */ e(ma, { className: "size-4" })
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
          children: /* @__PURE__ */ e(ha, { className: "size-4" })
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
          children: /* @__PURE__ */ e(Oa, { className: "size-4" })
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
          children: /* @__PURE__ */ e(Ba, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(it, { orientation: "vertical", className: "mx-1 h-6" })
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
          children: /* @__PURE__ */ e(ja, { className: "size-4" })
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
          children: /* @__PURE__ */ e(Ua, { className: "size-4" })
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
          children: /* @__PURE__ */ e(Fa, { className: "size-4" })
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
          children: /* @__PURE__ */ e(Ha, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(it, { orientation: "vertical", className: "mx-1 h-6" })
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
          children: /* @__PURE__ */ e(ga, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(
        Fe,
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
              children: /* @__PURE__ */ e(Pt, { className: "size-4" })
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
          children: /* @__PURE__ */ e(Va, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ e(it, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ a("div", { className: "hidden md:flex items-center gap-0.5", children: [
      t.isActive("table") ? /* @__PURE__ */ a(rn, { children: [
        /* @__PURE__ */ a(
          ln,
          {
            className: S(
              "inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1 text-xs font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            ),
            children: [
              /* @__PURE__ */ e(aa, { className: "size-4" }),
              "Table",
              /* @__PURE__ */ e(wt, { className: "size-3" })
            ]
          }
        ),
        /* @__PURE__ */ a(on, { align: "start", sideOffset: 4, children: [
          /* @__PURE__ */ e(at, { children: "Rows" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().addRowBefore().run(),
              children: [
                /* @__PURE__ */ e($e, { className: "size-4" }),
                "Add Row Before"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().addRowAfter().run(),
              children: [
                /* @__PURE__ */ e($e, { className: "size-4" }),
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
                /* @__PURE__ */ e($e, { className: "size-4" }),
                "Add Column Before"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().addColumnAfter().run(),
              children: [
                /* @__PURE__ */ e($e, { className: "size-4" }),
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
                /* @__PURE__ */ e(Ga, { className: "size-4" }),
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
                /* @__PURE__ */ e(qa, { className: "size-4" }),
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
      /* @__PURE__ */ e(it, { orientation: "vertical", className: "mx-1 h-6" })
    ] }),
    /* @__PURE__ */ a("div", { className: "flex md:hidden items-center", children: [
      /* @__PURE__ */ a(rn, { children: [
        /* @__PURE__ */ e(
          ln,
          {
            className: S(
              "inline-flex items-center justify-center rounded-sm h-7 w-7",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            ),
            "aria-label": "More formatting options",
            title: "More formatting options",
            children: /* @__PURE__ */ e(Ss, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ a(on, { align: "start", sideOffset: 4, children: [
          /* @__PURE__ */ e(at, { children: "Headings" }),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 1 }).run(),
              children: [
                /* @__PURE__ */ e(la, { className: "size-4" }),
                "Heading 1"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 2 }).run(),
              children: [
                /* @__PURE__ */ e(oa, { className: "size-4" }),
                "Heading 2"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 3 }).run(),
              children: [
                /* @__PURE__ */ e(ca, { className: "size-4" }),
                "Heading 3"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleHeading({ level: 4 }).run(),
              children: [
                /* @__PURE__ */ e(Ra, { className: "size-4" }),
                "Heading 4"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setParagraph().run(),
              children: [
                /* @__PURE__ */ e($a, { className: "size-4" }),
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
                /* @__PURE__ */ e(da, { className: "size-4" }),
                "Blockquote"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleCodeBlock().run(),
              children: [
                /* @__PURE__ */ e(ua, { className: "size-4" }),
                "Code Block"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleBulletList().run(),
              children: [
                /* @__PURE__ */ e(ma, { className: "size-4" }),
                "Bullet List"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleOrderedList().run(),
              children: [
                /* @__PURE__ */ e(ha, { className: "size-4" }),
                "Ordered List"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().toggleTaskList().run(),
              children: [
                /* @__PURE__ */ e(Oa, { className: "size-4" }),
                "Task List"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setHorizontalRule().run(),
              children: [
                /* @__PURE__ */ e(Ba, { className: "size-4" }),
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
                /* @__PURE__ */ e(ja, { className: "size-4" }),
                "Align Left"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setTextAlign("center").run(),
              children: [
                /* @__PURE__ */ e(Ua, { className: "size-4" }),
                "Align Center"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setTextAlign("right").run(),
              children: [
                /* @__PURE__ */ e(Fa, { className: "size-4" }),
                "Align Right"
              ]
            }
          ),
          /* @__PURE__ */ a(
            ee,
            {
              onClick: () => t.chain().focus().setTextAlign("justify").run(),
              children: [
                /* @__PURE__ */ e(Ha, { className: "size-4" }),
                "Justify"
              ]
            }
          ),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Media" }),
          /* @__PURE__ */ a(ee, { onClick: n, children: [
            /* @__PURE__ */ e(ga, { className: "size-4" }),
            "Link"
          ] }),
          /* @__PURE__ */ a(ee, { onClick: () => {
            const r = window.prompt("Enter image URL:", "https://");
            if (!r) return;
            const o = window.prompt("Enter alt text:", "") || "";
            t.chain().focus().setImage({ src: r, alt: o }).run();
          }, children: [
            /* @__PURE__ */ e(Pt, { className: "size-4" }),
            "Insert Image"
          ] }),
          /* @__PURE__ */ a(ee, { onClick: l, children: [
            /* @__PURE__ */ e(Va, { className: "size-4" }),
            "YouTube Video"
          ] }),
          /* @__PURE__ */ e(ot, {}),
          /* @__PURE__ */ e(at, { children: "Table" }),
          t.isActive("table") ? /* @__PURE__ */ a(He, { children: [
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().addRowBefore().run(),
                children: [
                  /* @__PURE__ */ e($e, { className: "size-4" }),
                  "Add Row Before"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().addRowAfter().run(),
                children: [
                  /* @__PURE__ */ e($e, { className: "size-4" }),
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
                  /* @__PURE__ */ e($e, { className: "size-4" }),
                  "Add Column Before"
                ]
              }
            ),
            /* @__PURE__ */ a(
              ee,
              {
                onClick: () => t.chain().focus().addColumnAfter().run(),
                children: [
                  /* @__PURE__ */ e($e, { className: "size-4" }),
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
                  /* @__PURE__ */ e(Ga, { className: "size-4" }),
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
                  /* @__PURE__ */ e(qa, { className: "size-4" }),
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
      /* @__PURE__ */ e(it, { orientation: "vertical", className: "mx-1 h-6" })
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
function ql({ editor: t }) {
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
            children: /* @__PURE__ */ e(bn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          le,
          {
            size: "sm",
            pressed: t.isActive("italic"),
            onPressedChange: () => t.chain().focus().toggleItalic().run(),
            "aria-label": "Italic",
            children: /* @__PURE__ */ e(vn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          le,
          {
            size: "sm",
            pressed: t.isActive("underline"),
            onPressedChange: () => t.chain().focus().toggleUnderline().run(),
            "aria-label": "Underline",
            children: /* @__PURE__ */ e(xn, { className: "size-3.5" })
          }
        ),
        /* @__PURE__ */ e(
          le,
          {
            size: "sm",
            pressed: t.isActive("link"),
            onPressedChange: n,
            "aria-label": "Link",
            children: /* @__PURE__ */ e(ga, { className: "size-3.5" })
          }
        )
      ]
    }
  );
}
function Kl({ editor: t }) {
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
            children: /* @__PURE__ */ e(la, { className: "size-4" })
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
            children: /* @__PURE__ */ e(oa, { className: "size-4" })
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
            children: /* @__PURE__ */ e(ca, { className: "size-4" })
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
            children: /* @__PURE__ */ e(ma, { className: "size-4" })
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
            children: /* @__PURE__ */ e(ha, { className: "size-4" })
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
            children: /* @__PURE__ */ e(Pt, { className: "size-4" })
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
            children: /* @__PURE__ */ e(da, { className: "size-4" })
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
            children: /* @__PURE__ */ e(ua, { className: "size-4" })
          }
        )
      ]
    }
  );
}
const Wl = [
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
function Jl({
  node: t,
  updateAttributes: n,
  extension: s
}) {
  const l = t.attrs.language || "";
  return /* @__PURE__ */ a(Os, { className: "relative rounded-sm bg-muted my-2", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between border-b border-border/50 px-3 py-1.5", children: /* @__PURE__ */ a(
      Ie,
      {
        value: l || "auto",
        onValueChange: (i) => n({ language: i === "auto" ? "" : i }),
        children: [
          /* @__PURE__ */ e(De, { size: "sm", className: "h-6 w-auto min-w-[100px] border-none bg-transparent text-xs text-muted-foreground shadow-none", children: /* @__PURE__ */ e(Te, { placeholder: "Auto" }) }),
          /* @__PURE__ */ e(Ee, { side: "bottom", align: "start", children: Wl.map((i) => /* @__PURE__ */ e(re, { value: i.value, children: i.label }, i.value)) })
        ]
      }
    ) }),
    /* @__PURE__ */ e("pre", { className: "p-4 font-mono text-sm overflow-x-auto !mt-0 !rounded-sm", children: /* @__PURE__ */ e(Bs, { className: "hljs" }) })
  ] });
}
const Yl = rr(ir);
function Xl({
  content: t,
  onChange: n,
  placeholder: s = "Start writing...",
  editable: l = !0,
  className: i
}) {
  const r = js({
    extensions: [
      Hs.configure({
        codeBlock: !1
        // Using CodeBlockLowlight instead
      }),
      Vs,
      Gs.configure({
        multicolor: !1
      }),
      qs.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"]
      }),
      Ks.configure({
        openOnClick: !1,
        autolink: !0,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer"
        }
      }),
      Ws.configure({
        HTMLAttributes: {
          class: "rounded-sm max-w-full h-auto"
        }
      }),
      Js.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-sm"
        },
        inline: !1
      }),
      Xs.configure({
        resizable: !0,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full"
        }
      }),
      Ys,
      Qs.configure({
        HTMLAttributes: {
          class: "border border-border p-2 min-w-[100px]"
        }
      }),
      Zs.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-bold min-w-[100px]"
        }
      }),
      er.configure({
        HTMLAttributes: {
          class: "list-none pl-0"
        }
      }),
      tr.configure({
        nested: !0,
        HTMLAttributes: {
          class: "flex items-start gap-2"
        }
      }),
      ar.configure({
        lowlight: Yl,
        HTMLAttributes: {
          class: "rounded-sm bg-muted p-4 font-mono text-sm overflow-x-auto"
        }
      }).extend({
        addNodeView() {
          return Us(Jl);
        }
      }),
      nr.configure({
        placeholder: s
      }),
      sr
    ],
    content: t,
    editable: l,
    onUpdate: ({ editor: u }) => {
      n(u.getHTML());
    },
    editorProps: {
      attributes: {
        class: S(
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
    return /* @__PURE__ */ a("div", { className: S("rounded-sm border", i), children: [
      /* @__PURE__ */ e("div", { className: "h-10 border-b bg-muted/30 animate-pulse" }),
      /* @__PURE__ */ e("div", { className: "min-h-[200px] p-4", children: /* @__PURE__ */ e("div", { className: "h-4 w-3/4 bg-muted/30 rounded-sm animate-pulse" }) })
    ] });
  const o = r.storage.characterCount.characters(), c = r.storage.characterCount.words();
  return /* @__PURE__ */ a("div", { className: S("rounded-sm border", i), children: [
    /* @__PURE__ */ e(Gl, { editor: r }),
    /* @__PURE__ */ e(ql, { editor: r }),
    /* @__PURE__ */ e(Kl, { editor: r }),
    /* @__PURE__ */ e(Fs, { editor: r }),
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
const Un = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TiptapEditor: Xl
}, Symbol.toStringTag, { value: "Module" }));
export {
  Oo as AdminApp
};
