import SimpleTextExtractor from "@/components/simple-text-extractor";

const Home = () => {
  return (
    <div className="animate-fade-in">
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

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <i className="fas fa-eye text-blue-600 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Enterprise-Grade OCR</h3>
          <p className="text-slate-600">Advanced AI-powered text recognition with intelligent preprocessing and confidence scoring for maximum accuracy.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
            <i className="fas fa-bolt text-green-600 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Instant Processing</h3>
          <p className="text-slate-600">Extract text from images in seconds with automatic compression and smart filtering for clean results.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
            <i className="fas fa-shield-alt text-purple-600 text-xl"></i>
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
              <i className="fas fa-gift text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Free to Use</h3>
            <p className="text-slate-600">
              No registration required. Extract text from images instantly without any cost or limitations
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-images text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Multiple Formats</h3>
            <p className="text-slate-600">
              Supports JPG, PNG, WEBP, GIF, and BMP formats up to 10MB for maximum compatibility
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-globe text-white text-2xl"></i>
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

      {/* FAQ Section */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about PictoText OCR
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-safety');
                  const icon = document.getElementById('icon-safety');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">Is my data safe and private?</h3>
                <i id="icon-safety" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-safety" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  Yes, your privacy is our priority. Images are processed securely through encrypted connections and are never stored permanently on our servers. Your data is automatically deleted after processing.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-how-works');
                  const icon = document.getElementById('icon-how-works');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">How can you copy text from images?</h3>
                <i id="icon-how-works" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-how-works" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  Simply upload your image and PictoText automatically detects and extracts all text using advanced OCR technology. The extracted text appears in an editable box where you can select, copy, and paste it anywhere you need.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-mobile');
                  const icon = document.getElementById('icon-mobile');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">How do you turn image to text on mobile?</h3>
                <i id="icon-mobile" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-mobile" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  PictoText works perfectly on mobile devices. Simply open the website in your mobile browser, tap "Choose File" or drag and drop, then select a photo from your camera roll or take a new picture. The text extraction works the same way as on desktop.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-free');
                  const icon = document.getElementById('icon-free');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">Is PictoText really free to use?</h3>
                <i id="icon-free" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-free" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  Yes! PictoText is completely free with no registration required. Simply upload your image and extract text instantly without any limitations or hidden costs.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-accuracy');
                  const icon = document.getElementById('icon-accuracy');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">How accurate is the text recognition?</h3>
                <i id="icon-accuracy" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-accuracy" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  Our OCR technology achieves 95%+ confidence levels with intelligent filtering that removes UI noise and preserves meaningful content for clean, accurate results.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-formats');
                  const icon = document.getElementById('icon-formats');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">What file formats are supported?</h3>
                <i id="icon-formats" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-formats" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  PictoText supports JPG, PNG, WEBP, GIF, and BMP image formats. Files can be up to 10MB in size for optimal processing performance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-languages');
                  const icon = document.getElementById('icon-languages');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">What languages are supported?</h3>
                <i id="icon-languages" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-languages" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  PictoText recognizes text in multiple languages including English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, and many more.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => {
                  const content = document.getElementById('faq-speed');
                  const icon = document.getElementById('icon-speed');
                  if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                  } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">How long does processing take?</h3>
                <i id="icon-speed" className="fas fa-plus text-slate-400"></i>
              </button>
              <div id="faq-speed" className="hidden px-6 pb-6">
                <p className="text-slate-600">
                  Most images are processed in under 5 seconds. Processing time may vary slightly based on image size and complexity, but results are typically delivered very quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
