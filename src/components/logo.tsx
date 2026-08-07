import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-primary/30">
        <ShoppingBag className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          TILE<span className="brand-gradient-text">TA</span>
        </span>
      )}
    </div>
  );
}
