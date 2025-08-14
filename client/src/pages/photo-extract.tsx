import PhotoExtractor from "@/components/photo-extractor";

const PhotoExtract = () => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Photo Text Extraction</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Upload any photo containing text and extract it instantly with our advanced OCR technology. 
          Perfect for documents, signs, receipts, business cards, and handwritten notes.
        </p>
      </div>
      
      <PhotoExtractor />
      
      {/* Tips Section */}
      <div className="mt-12 max-w-4xl mx-auto">
        <div className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 text-center">
            <i className="fas fa-lightbulb mr-2"></i>Tips for Better Results
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div className="flex items-start">
                <i className="fas fa-check text-blue-600 mr-3 mt-1"></i>
                <div>
                  <strong className="text-blue-900">Good Lighting:</strong>
                  <p className="text-blue-800">Ensure your image is well-lit with minimal shadows</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-check text-blue-600 mr-3 mt-1"></i>
                <div>
                  <strong className="text-blue-900">High Contrast:</strong>
                  <p className="text-blue-800">Dark text on light backgrounds works best</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <i className="fas fa-check text-blue-600 mr-3 mt-1"></i>
                <div>
                  <strong className="text-blue-900">Straight Angle:</strong>
                  <p className="text-blue-800">Take photos straight-on rather than at an angle</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-check text-blue-600 mr-3 mt-1"></i>
                <div>
                  <strong className="text-blue-900">High Resolution:</strong>
                  <p className="text-blue-800">Clear, sharp images produce more accurate results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoExtract;