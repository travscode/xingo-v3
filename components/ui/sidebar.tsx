"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  isDesktop: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      setIsDesktop(query.matches);
    };

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const open = isDesktop ? desktopOpen : mobileOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (isDesktop) {
        setDesktopOpen(nextOpen);
        return;
      }

      setMobileOpen(nextOpen);
    },
    [isDesktop],
  );

  const toggle = React.useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return (
    <SidebarContext.Provider value={{ isDesktop, open, setOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { isDesktop, open } = useSidebar();

  return (
    <aside
      className={cn(
        "z-40 flex h-dvh flex-col bg-white/84 backdrop-blur-xl transition-[width,transform] duration-200 ease-out",
        isDesktop
          ? open
            ? "relative w-72 border-r border-line"
            : "relative w-0 overflow-hidden border-r border-transparent"
          : open
            ? "fixed inset-y-0 left-0 w-72 translate-x-0 border-r border-line shadow-[0_20px_60px_rgba(18,18,18,0.14)]"
            : "fixed inset-y-0 left-0 w-72 -translate-x-full border-r border-line",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {children}
      </div>
    </aside>
  );
}

export function SidebarInset({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("min-w-0 flex-1", className)}>{children}</div>;
}

export function SidebarTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          toggle();
        }
      }}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/90 text-foreground shadow-[0_10px_25px_rgba(18,18,18,0.06)] transition hover:bg-white",
        className,
      )}
      aria-label={props["aria-label"] ?? "Toggle sidebar"}
      {...props}
    >
      {children}
    </button>
  );
}
