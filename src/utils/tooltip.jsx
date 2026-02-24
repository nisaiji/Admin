import React, { useState, useRef } from "react";

export function TooltipProvider({ children }) {
  // kept only for API compatibility
  return <>{children}</>;
}

export function Tooltip({ children }) {
  const [open, setOpen] = useState(false);

  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child, {
      open,
      setOpen,
    });
  });
}

export function TooltipTrigger({ children, asChild, open, setOpen }) {
  const triggerProps = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, triggerProps);
  }

  return (
    <span {...triggerProps} className="inline-flex">
      {children}
    </span>
  );
}

export function TooltipContent({
  children,
  className = "",
  sideOffset = 8,
  open,
}) {
  if (!open) return null;

  return (
    <div
      className={`absolute z-50 mt-2 ${className}`}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  );
}
