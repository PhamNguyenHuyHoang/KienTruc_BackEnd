// src/components/ui/scroll-area.jsx
import * as React from "react";
import { cn } from "../../lib/utils"; // hoặc bỏ nếu không có hàm cn

export const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("overflow-auto rounded-md", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ScrollArea.displayName = "ScrollArea";
