"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { GranthaProvider } from "@/lib/grantha/context";

import { Inspector } from "./inspector";

/** Session state, toasts and the global detail drawer, mounted once around the shell. */
export function GranthaProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <GranthaProvider>
        {children}
        <Inspector />
      </GranthaProvider>
    </ToastProvider>
  );
}
