import { Link } from "wouter";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PictoText
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Professional OCR technology for extracting and manipulating text from images. 
              Fast, accurate, and secure text recognition powered by advanced AI.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-terms"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-privacy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/refund-policy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-refund"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Support</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href="mailto:pictotextapp@gmail.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-support-email"
                >
                  pictotextapp@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PictoText. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with advanced OCR technology
          </p>
        </div>
      </div>
    </footer>
  );
}