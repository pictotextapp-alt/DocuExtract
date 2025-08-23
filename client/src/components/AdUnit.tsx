import { useEffect } from "react";

interface AdUnitProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "banner";
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdUnit({ 
  adSlot, 
  adFormat = "auto", 
  className = "", 
  style = {}, 
  responsive = true 
}: AdUnitProps) {
  useEffect(() => {
    try {
      // Initialize AdSense ad
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense initialization error:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <p className="text-xs text-muted-foreground mb-2 text-center">Advertisement</p>
      <ins 
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6883316870591501"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
        data-testid={`ad-unit-${adSlot}`}
      />
    </div>
  );
}

// Post-results ad component (shows after OCR results)
export function PostResultsAd({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="bg-card rounded-lg shadow-sm border p-4 mt-6">
      <AdUnit 
        adSlot="1234567890" 
        adFormat="auto"
        className="w-full"
      />
    </div>
  );
}

// Sidebar ad component
export function SidebarAd() {
  return (
    <div className="bg-card rounded-lg shadow-sm border p-4">
      <AdUnit 
        adSlot="0987654321" 
        adFormat="rectangle"
        className="w-full"
      />
    </div>
  );
}

// Mobile bottom ad component
export function MobileBottomAd() {
  return (
    <div className="lg:hidden bg-card border-t p-4 mt-8">
      <AdUnit 
        adSlot="1122334455" 
        adFormat="banner"
        className="w-full"
      />
    </div>
  );
}
