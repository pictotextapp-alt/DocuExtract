import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
          Extract Text from Any Image
          <span className="block text-blue-600">Instantly & Accurately</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Powered by advanced AI technology, TextExtract Pro converts images to editable text with 99.9% accuracy. 
          Perfect for documents, screenshots, handwritten notes, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/photo-extract">
            <button 
              data-testid="button-extract-photo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              <i className="fas fa-camera mr-2"></i>Extract from Photo
            </button>
          </Link>
          <Link href="/upload">
            <button 
              data-testid="button-start-extracting"
              className="border border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              <i className="fas fa-upload mr-2"></i>Upload Documents
            </button>
          </Link>
          <Link href="/premium">
            <button 
              data-testid="button-view-premium"
              className="border border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              <i className="fas fa-crown mr-2"></i>View Premium
            </button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <i className="fas fa-eye text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Advanced OCR</h3>
            <p className="text-slate-600">State-of-the-art optical character recognition technology with support for 100+ languages.</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-8">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <i className="fas fa-bolt text-green-600 text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Lightning Fast</h3>
            <p className="text-slate-600">Process images in seconds with our optimized cloud infrastructure and edge computing.</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-8">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <i className="fas fa-shield-alt text-purple-600 text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Secure & Private</h3>
            <p className="text-slate-600">Your documents are processed securely and automatically deleted after extraction.</p>
          </CardContent>
        </Card>
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
