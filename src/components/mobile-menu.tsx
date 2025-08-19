import { Link } from "wouter";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentLocation: string;
}

const MobileMenu = ({ isOpen, onClose, navItems, currentLocation }: MobileMenuProps) => {
  if (!isOpen) return null;

  const isActive = (path: string) => {
    if (path === "/" && currentLocation === "/") return true;
    if (path !== "/" && currentLocation.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden pb-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={onClose}
            data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive(item.path)
                ? "text-slate-900"
                : "text-slate-600 hover:text-blue-600"
            }`}
          >
            <i className={`${item.icon} mr-3`}></i>
            {item.label}
          </Link>
        ))}
        <Link
          href="/premium"
          onClick={onClose}
          data-testid="mobile-nav-link-premium"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-2"
        >
          <i className="fas fa-crown mr-3"></i>
          Premium
        </Link>
      </div>
    </div>
  );
};

export default MobileMenu;
