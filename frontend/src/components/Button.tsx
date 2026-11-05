import React from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "quiet";

interface BaseButtonProps {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  className?: string;
}

interface ActionButtonProps
  extends BaseButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

interface LinkButtonProps extends BaseButtonProps {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
}

type ButtonProps = ActionButtonProps | LinkButtonProps;

export function Button({
  variant = "primary",
  children,
  icon,
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-1 select-none shrink-0 shadow-xs";

  const variantClasses = {
    primary:
      "bg-terracotta hover:bg-terracotta-hover text-white active:bg-terracotta-hover disabled:opacity-60 disabled:pointer-events-none",
    secondary:
      "bg-surface hover:bg-surface-subtle text-ink border border-hairline hover:border-hairline-strong active:bg-surface-subtle disabled:opacity-60 disabled:pointer-events-none",
    quiet:
      "bg-transparent hover:bg-surface-subtle text-ink active:bg-surface-subtle disabled:opacity-60 disabled:pointer-events-none shadow-none",
  }[variant];

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={combinedClasses}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  const { type = "button", onClick } = props as ActionButtonProps;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
