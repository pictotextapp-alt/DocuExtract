import { AdContainer } from "./ad-container";

export function HeaderAdBanner() {
  return (
    <div className="bg-white border-b border-slate-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdContainer 
          size="leaderboard" 
          label="Sponsored Content"
          className="hidden md:block"
        />
        <AdContainer 
          size="mobile-banner" 
          label="Sponsored Content"
          className="block md:hidden"
        />
      </div>
    </div>
  );
}