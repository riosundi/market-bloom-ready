import { cn } from "@/lib/utils";
import logoAsset from "@/assets/tileta-3d-logo.png.asset.json";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-lg ring-1 ring-white/20">
        <img 
          src={logoAsset.url} 
          alt="TILETA Logo" 
          className="h-full w-full object-cover p-0.5"
        />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          TILE<span className="brand-gradient-text">TA</span>
        </span>
      )}
    </div>
  );
}
