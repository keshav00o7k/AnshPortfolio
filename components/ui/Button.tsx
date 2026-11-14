import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  asLink = false,
  href,
  target,
  rel,
  children,
  className = "",
  style,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-tl-[6px] rounded-tr-[30px] rounded-br-[6px] rounded-bl-[30px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac";

  const sizeStyles = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm min-h-[44px]",
    lg: "px-8 py-3.5 text-base min-h-[48px]",
  };

  const variantStyles = {
    primary:
      "bg-violet text-white hover:bg-violet-hover hover:shadow-[0_4px_20px_rgba(63,19,69,0.25)] active:scale-98",
    secondary:
      "bg-transparent text-ink border border-line hover:border-lilac hover:text-violet active:scale-98",
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  const combinedStyles: React.CSSProperties = {
    borderRadius: "6px 30px 6px 30px",
    ...style,
  };

  if (asLink && href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={combinedClasses}
        style={combinedStyles}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClasses} style={combinedStyles} {...props}>
      {children}
    </button>
  );
};
