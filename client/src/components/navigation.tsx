import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMenu from "./mobile-menu";

const Navigation = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/upload", label: "Upload", icon: "fas fa-upload" },
    { path: "/photo-extract", label: "Photo Extract", icon: "fas fa-camera" },
    { path: "/extract", label: "Extract Text", icon: "fas fa-magic" },
    { path: "/history", label: "History", icon: "fas fa-history" },
    { path: "/settings", label: "Settings", icon: "fas fa-cog" },
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
              <i className="fas fa-file-text text-2xl text-blue-600 mr-3"></i>
              <span className="font-bold text-xl text-slate-900">TextExtract Pro</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="ml-10 flex items-baseline space-x-4">
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
                <i className="fas fa-crown mr-2"></i>
                Premium
              </Link>
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
    </nav>
  );
};

export default Navigation;
