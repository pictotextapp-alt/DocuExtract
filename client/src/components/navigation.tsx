import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, useUsage } from "@/hooks/useAuth";
import { AuthModal } from "./auth-modal";
import { PremiumUpgradeModal } from "./premium-upgrade-modal";
import { ComingSoonModal } from "./coming-soon-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Crown, Zap } from "lucide-react";
import MobileMenu from "./mobile-menu";

const Navigation = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { data: usage } = useUsage();

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg width="32" height="32" viewBox="0 0 80 80" className="mr-3">
                <defs>
                  <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <rect width="80" height="80" rx="16" fill="url(#navLogoGradient)" />
                <rect x="12" y="12" width="56" height="42" rx="4" fill="white" opacity="0.9" />
                <rect x="16" y="16" width="12" height="2" rx="1" fill="#3B82F6" />
                <rect x="16" y="20" width="20" height="2" rx="1" fill="#3B82F6" />
                <rect x="16" y="24" width="16" height="2" rx="1" fill="#3B82F6" />
                <rect x="16" y="28" width="24" height="2" rx="1" fill="#3B82F6" />
                <rect x="16" y="32" width="18" height="2" rx="1" fill="#3B82F6" />
                <rect x="16" y="36" width="14" height="2" rx="1" fill="#3B82F6" />
                <rect x="16" y="40" width="22" height="2" rx="1" fill="#3B82F6" />
                <rect x="16" y="44" width="20" height="2" rx="1" fill="#3B82F6" />
                <path d="M20 58 L32 66 L44 58 L56 66" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="24" cy="62" r="2" fill="white" />
                <circle cx="36" cy="62" r="2" fill="white" />
                <circle cx="48" cy="62" r="2" fill="white" />
              </svg>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PictoText</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-slate-900"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    <i className={`${item.icon} mr-2`}></i>
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/premium"
                  data-testid="nav-link-premium"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Premium
                </Link>
              </div>

              {/* Authentication Section */}
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                {isLoading ? (
                  <div className="animate-pulse bg-slate-200 h-8 w-20 rounded"></div>
                ) : isAuthenticated && user ? (
                  <div className="flex items-center space-x-3">
                    {/* Usage Badge for Free Users */}
                    {!user.isPremium && usage && (
                      <Badge variant="outline" className="text-xs">
                        {usage.imageCount}/{usage.dailyLimit} images
                      </Badge>
                    )}
                    
                    {/* Premium Badge */}
                    {user.isPremium && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid="user-menu-trigger">
                          <User className="w-4 h-4 mr-2" />
                          {user.username}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled className="font-medium">
                          {user.email}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!user.isPremium && (
                          <DropdownMenuItem 
                            onClick={() => setComingSoonModalOpen(true)}
                            data-testid="menu-upgrade"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Coming Soon - Premium Features
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={logout}
                          data-testid="menu-logout"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setComingSoonModalOpen(true)}
                    data-testid="button-sign-in"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Premium Sign In
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-button"
                className="text-slate-600 hover:text-slate-900 focus:outline-none focus:text-slate-900 p-2"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)}
          navItems={navItems}
          currentLocation={location}
        />
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        user={user}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        open={comingSoonModalOpen}
        onOpenChange={setComingSoonModalOpen}
      />
    </nav>
  );
};

export default Navigation;
