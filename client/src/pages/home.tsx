import PhotoExtractor from "@/components/photo-extractor";

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
          Extract Text from Any Image
          <span className="block text-blue-600">Instantly & Accurately</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Powered by advanced AI technology, TextExtract Pro converts images to editable text with 99.9% accuracy. 
          Perfect for documents, screenshots, handwritten notes, and more.
        </p>
      </div>

      {/* Photo Extractor Component */}
      <div className="mb-16">
        <PhotoExtractor />
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <i className="fas fa-eye text-blue-600 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Advanced OCR</h3>
          <p className="text-slate-600">State-of-the-art optical character recognition technology with support for 100+ languages.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
            <i className="fas fa-bolt text-green-600 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Lightning Fast</h3>
          <p className="text-slate-600">Process images in seconds with our optimized cloud infrastructure and edge computing.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
            <i className="fas fa-shield-alt text-purple-600 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Secure & Private</h3>
          <p className="text-slate-600">Your documents are processed securely and automatically deleted after extraction.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-8">Trusted by Professionals Worldwide</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold mb-2" data-testid="stat-documents">2M+</div>
            <div className="text-blue-100">Documents Processed</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2" data-testid="stat-accuracy">99.9%</div>
            <div className="text-blue-100">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2" data-testid="stat-users">150K+</div>
            <div className="text-blue-100">Happy Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2" data-testid="stat-languages">100+</div>
            <div className="text-blue-100">Languages Supported</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
