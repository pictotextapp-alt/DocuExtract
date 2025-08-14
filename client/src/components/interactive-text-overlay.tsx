import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TextRegion } from "@shared/schema";

interface InteractiveTextOverlayProps {
  imageUrl: string;
  textRegions: TextRegion[];
  onTextRegionsChange: (regions: TextRegion[]) => void;
  onGenerateFinalText: () => void;
}

const InteractiveTextOverlay = ({ 
  imageUrl, 
  textRegions, 
  onTextRegionsChange,
  onGenerateFinalText 
}: InteractiveTextOverlayProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [tempText, setTempText] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const updateDisplayDimensions = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setDisplayDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDisplayDimensions();
    window.addEventListener('resize', updateDisplayDimensions);
    return () => window.removeEventListener('resize', updateDisplayDimensions);
  }, [imageDimensions]);

  const scaleX = displayDimensions.width / imageDimensions.width || 1;
  const scaleY = displayDimensions.height / imageDimensions.height || 1;

  const handleRegionClick = (region: TextRegion, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRegion === region.id) {
      // If already selected, start editing
      setEditingRegion(region.id);
      setTempText(region.text);
      setSelectedRegion(null);
    } else {
      // Select the region
      setSelectedRegion(region.id);
      setEditingRegion(null);
    }
  };

  const handleRegionDoubleClick = (region: TextRegion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRegion(region.id);
    setTempText(region.text);
    setSelectedRegion(null);
  };

  const handleTextSave = (regionId: string) => {
    const updatedRegions = textRegions.map(region =>
      region.id === regionId ? { ...region, text: tempText } : region
    );
    onTextRegionsChange(updatedRegions);
    setEditingRegion(null);
    setTempText("");
  };

  const handleTextCancel = () => {
    setEditingRegion(null);
    setTempText("");
  };

  const handleRegionToggle = (regionId: string) => {
    const updatedRegions = textRegions.map(region =>
      region.id === regionId ? { ...region, isVisible: !region.isVisible } : region
    );
    onTextRegionsChange(updatedRegions);
  };

  const handleRegionDelete = (regionId: string) => {
    const updatedRegions = textRegions.filter(region => region.id !== regionId);
    onTextRegionsChange(updatedRegions);
    setSelectedRegion(null);
    setEditingRegion(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, regionId: string) => {
    if (e.key === 'Enter') {
      handleTextSave(regionId);
    } else if (e.key === 'Escape') {
      handleTextCancel();
    }
  };

  const handleContainerClick = () => {
    setSelectedRegion(null);
    setEditingRegion(null);
  };

  return (
    <div className="relative">
      {/* Image with overlay */}
      <div ref={containerRef} className="relative inline-block" onClick={handleContainerClick}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="OCR Image"
          className="max-w-full h-auto rounded-lg shadow-md"
          draggable={false}
          data-testid="ocr-image-with-overlay"
        />
        
        {/* Text region overlays */}
        {displayDimensions.width > 0 && textRegions.map((region) => (
          <div key={region.id}>
            {/* Text region box */}
            <div
              className={`absolute border-2 cursor-pointer transition-all ${
                selectedRegion === region.id
                  ? 'border-blue-600 bg-blue-200 bg-opacity-70 shadow-lg'
                  : editingRegion === region.id
                  ? 'border-orange-500 bg-orange-100 bg-opacity-50'
                  : region.isVisible 
                  ? 'border-green-500 bg-green-100 bg-opacity-40 hover:bg-green-200 hover:bg-opacity-60'
                  : 'border-red-500 bg-red-100 bg-opacity-40 opacity-50'
              }`}
              style={{
                left: `${region.x * scaleX}px`,
                top: `${region.y * scaleY}px`,
                width: `${region.width * scaleX}px`,
                height: `${region.height * scaleY}px`,
              }}
              onClick={(e) => handleRegionClick(region, e)}
              onDoubleClick={(e) => handleRegionDoubleClick(region, e)}
              data-testid={`text-region-${region.id}`}
            />
            
            {/* Editable text input */}
            {editingRegion === region.id && (
              <div
                className="absolute z-10"
                style={{
                  left: `${region.x * scaleX}px`,
                  top: `${(region.y + region.height) * scaleY + 5}px`,
                  minWidth: `${Math.max(region.width * scaleX, 150)}px`,
                }}
              >
                <div className="bg-white border-2 border-blue-500 rounded-md shadow-lg p-2">
                  <Input
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, region.id)}
                    className="mb-2 text-sm"
                    autoFocus
                    data-testid={`edit-input-${region.id}`}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleTextSave(region.id)}
                      className="text-xs px-2 py-1"
                      data-testid={`save-button-${region.id}`}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTextCancel}
                      className="text-xs px-2 py-1"
                      data-testid={`cancel-button-${region.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Text label */}
            {region.isVisible && editingRegion !== region.id && (
              <div
                className="absolute text-xs bg-white bg-opacity-90 px-1 py-0.5 rounded border pointer-events-none"
                style={{
                  left: `${region.x * scaleX}px`,
                  top: `${region.y * scaleY - 20}px`,
                  maxWidth: `${region.width * scaleX}px`,
                }}
              >
                <span className="truncate block">{region.text}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Control panel */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">
            <i className="fas fa-edit mr-2 text-blue-600"></i>
            Interactive Text Editor
          </h3>
          <Button 
            onClick={onGenerateFinalText}
            className="bg-green-600 hover:bg-green-700"
            data-testid="generate-final-text"
          >
            <i className="fas fa-check mr-2"></i>
            Generate Final Text
          </Button>
        </div>
        
        <div className="text-sm text-slate-600 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Instructions:</strong>
              <ul className="mt-1 space-y-1">
                <li>• <strong>Click once</strong> to select a text region</li>
                <li>• <strong>Click again</strong> on selected region to edit</li>
                <li>• <strong>Delete:</strong> Use red delete button below</li>
                <li>• <strong>Click outside</strong> to deselect</li>
              </ul>
            </div>
            <div>
              <strong>Legend:</strong>
              <ul className="mt-1 space-y-1">
                <li><span className="inline-block w-3 h-3 bg-green-200 border border-green-500 mr-2"></span>Visible text</li>
                <li><span className="inline-block w-3 h-3 bg-red-200 border border-red-500 mr-2"></span>Hidden text</li>
                <li><span className="inline-block w-3 h-3 bg-blue-200 border border-blue-500 mr-2"></span>Selected</li>
              </ul>
            </div>
            <div>
              <strong>Stats:</strong>
              <ul className="mt-1 space-y-1">
                <li>Total regions: {textRegions.length}</li>
                <li>Visible: {textRegions.filter(r => r.isVisible).length}</li>
                <li>Hidden: {textRegions.filter(r => !r.isVisible).length}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Selected region controls */}
        {selectedRegion && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-2">Selected Region Actions</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const region = textRegions.find(r => r.id === selectedRegion);
                  if (region) {
                    setEditingRegion(region.id);
                    setTempText(region.text);
                    setSelectedRegion(null);
                  }
                }}
                data-testid="edit-selected-region"
              >
                <i className="fas fa-edit mr-1"></i>Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegionToggle(selectedRegion)}
                data-testid="toggle-selected-region"
              >
                <i className={`fas ${textRegions.find(r => r.id === selectedRegion)?.isVisible ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>
                {textRegions.find(r => r.id === selectedRegion)?.isVisible ? 'Hide' : 'Show'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRegionDelete(selectedRegion)}
                data-testid="delete-selected-region"
              >
                <i className="fas fa-trash mr-1"></i>Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTextOverlay;