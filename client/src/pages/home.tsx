import SimpleTextExtractor from "@/components/simple-text-extractor";
import Footer from "@/components/footer";
import { AdContainer } from "@/components/ad-container";

const Home = () => {
  return (
    <div className="animate-fade-in">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
        {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-8">
          <svg width="100" height="100" viewBox="0 0 80 80" className="mr-6">
            <defs>
              <linearGradient id="heroLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <rect width="80" height="80" rx="16" fill="url(#heroLogoGradient)" />
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
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900">
            PictoText
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Professional OCR</span>
          </h1>
        </div>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Transform any image into editable text with enterprise-grade accuracy. Perfect for documents, screenshots, and handwritten notes.
        </p>
      </div>

            {/* Simple Text Extractor Component */}
            <div className="mb-16">
              <SimpleTextExtractor />
            </div>

            {/* In-content Ad Space */}
            <div className="mb-12">
              <AdContainer 
                size="banner" 
                label="Sponsored Content"
                className="hidden md:block"
              />
              <AdContainer 
                size="mobile-banner" 
                label="Sponsored Content"
                className="block md:hidden"
              />
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Enterprise-Grade OCR</h3>
          <p className="text-slate-600">Advanced AI-powered text recognition with intelligent preprocessing and confidence scoring for maximum accuracy.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Instant Processing</h3>
          <p className="text-slate-600">Extract text from images in seconds with automatic compression and smart filtering for clean results.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Professional Quality</h3>
          <p className="text-slate-600">Context-aware text extraction with intelligent filtering to remove UI noise and preserve meaningful content.</p>
              </div>
            </div>

            {/* Enhanced Features Section */}
            <div className="bg-white py-16">
              <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Modern Workflows</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional OCR technology with comprehensive features for all your text extraction needs
          </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Free Use</h3>
            <p className="text-slate-600">
              Get 3 free image extractions daily. No hidden costs or registration required to start.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Multiple Formats</h3>
            <p className="text-slate-600">
              Supports JPG, PNG, WEBP, GIF, and BMP formats up to 10MB for maximum compatibility
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Multi-Language Support</h3>
            <p className="text-slate-600">
              Recognize text in multiple languages including English, Spanish, French, German, and more
            </p>
          </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-8">Proven Performance</h2>
              <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold mb-2" data-testid="stat-accuracy">95%+</div>
            <div className="text-blue-100">Average Confidence</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2" data-testid="stat-formats">5+</div>
            <div className="text-blue-100">Image Formats</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2" data-testid="stat-processing">Under 5s</div>
                  <div className="text-blue-100">Processing Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar with Ad Space */}
          <div className="lg:w-80 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Sidebar Ad */}
              <AdContainer 
                size="rectangle" 
                label="Advertisement"
              />
              
              {/* Additional sidebar content */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Tips</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    Use high-resolution images for better accuracy
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    Ensure good lighting and contrast
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    Crop images to focus on text areas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer Ad Space */}
      <div className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdContainer 
            size="banner" 
            label="Advertisement"
            className="hidden md:block"
          />
          <AdContainer 
            size="mobile-banner" 
            label="Advertisement"
            className="block md:hidden"
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;