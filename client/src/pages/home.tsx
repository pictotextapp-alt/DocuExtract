import SimpleTextExtractor from "@/components/simple-text-extractor";

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
          Professional OCR Solutions
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Built for Professionals</span>
        </h1>
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

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-8">Built for Modern Workflows</h2>
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
  );
};

export default Home;
