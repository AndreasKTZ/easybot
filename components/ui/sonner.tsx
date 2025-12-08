"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  InformationSquareIcon,
  Loading03Icon,
  CancelCircleIcon,
  Alert02Icon,
} from "@hugeicons-pro/core-bulk-rounded"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-primary" />,
        info: <HugeiconsIcon icon={InformationSquareIcon} size={20} className="text-primary" />,
        warning: <HugeiconsIcon icon={Alert02Icon} size={20} className="text-warning" />,
        error: <HugeiconsIcon icon={CancelCircleIcon} size={20} className="text-destructive" />,
        loading: <HugeiconsIcon icon={Loading03Icon} size={20} className="text-primary animate-spin" />,
      }}
      toastOptions={{
        className: "cursor-grab active:cursor-grabbing",
        style: {
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          backgroundColor: "var(--card)",
          color: "var(--card-foreground)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          padding: "14px 16px",
          gap: "12px",
        },
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "oklch(0.96 0.03 145)",
          "--success-text": "oklch(0.3 0.1 145)",
          "--success-border": "oklch(0.85 0.08 145)",
          "--error-bg": "oklch(0.96 0.03 25)",
          "--error-text": "oklch(0.4 0.15 25)",
          "--error-border": "oklch(0.85 0.08 25)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
