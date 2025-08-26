import { cn } from "@/lib/utils";

interface AdContainerProps {
  size: "leaderboard" | "rectangle" | "banner" | "mobile-banner";
  className?: string;
  label?: string;
}

const adSizes = {
  leaderboard: "w-full max-w-[728px] h-[90px]", // 728x90
  rectangle: "w-[300px] h-[250px]", // 300x250
  banner: "w-full max-w-[728px] h-[90px]", // 728x90
  "mobile-banner": "w-full max-w-[320px] h-[50px]", // 320x50
};

export function AdContainer({ size, className, label = "Advertisement" }: AdContainerProps) {
  return (
    <div className={cn("mx-auto", className)}>
      <div 
        className={cn(
          "border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center relative overflow-hidden",
          adSizes[size]
        )}
        data-testid={`ad-container-${size}`}
      >
        {/* Placeholder content */}
        <div className="text-center">
          <div className="text-xs text-slate-400 font-medium mb-1">
            {label}
          </div>
          <div className="text-xs text-slate-300">
            {size === "leaderboard" && "728 × 90"}
            {size === "rectangle" && "300 × 250"}
            {size === "banner" && "728 × 90"}
            {size === "mobile-banner" && "320 × 50"}
          </div>
        </div>
        
        {/* Corner indicator */}
        <div className="absolute top-1 right-1 text-xs text-slate-300 opacity-50">
          AD
        </div>
      </div>
    </div>
  );
}