import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TextRegion } from "@shared/schema";

interface InteractiveTextOverlayProps {
  imageUrl: string;
  textRegions: TextRegion[];
  onTextRegionsChange: (regions: TextRegion[]) => void;
  onApplyChanges: () => void;
  modifiedImageUrl?: string;
  isProcessing?: boolean;
}

const InteractiveTextOverlay = ({ 
  imageUrl, 
  textRegions, 
  onTextRegionsChange,
  onApplyChanges,
  modifiedImageUrl,
  isProcessing = false
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
      region.id === regionId 
        ? { 
            ...region, 
            text: tempText, 
            isEdited: tempText !== region.originalText 
          } 
        : region
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
    const updatedRegions = textRegions.map(region =>
      region.id === regionId ? { ...region, isDeleted: true, isVisible: false } : region
    );
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
                  : region.isDeleted
                  ? 'border-red-600 bg-red-200 bg-opacity-80 opacity-60'
                  : region.isEdited
                  ? 'border-yellow-500 bg-yellow-100 bg-opacity-60 hover:bg-yellow-200'
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

        {/* Modified image overlay */}
        {modifiedImageUrl && (
          <div className="absolute top-0 right-0 m-4 max-w-md bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border-2 border-green-500">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-700 text-sm">
                  <i className="fas fa-check-circle mr-2"></i>Modified Image
                </h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-1"
                    onClick={() => {
                      const element = document.createElement("a");
                      element.href = modifiedImageUrl;
                      element.download = "modified_image.jpg";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    data-testid="download-modified-image"
                  >
                    <i className="fas fa-download text-xs"></i>
                  </Button>
                </div>
              </div>
              <img 
                src={modifiedImageUrl} 
                alt="Modified image" 
                className="w-full rounded border"
              />
              <div className="mt-2 text-xs text-green-600 text-center">
                Changes applied to original image
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control panel */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">
            <i className="fas fa-edit mr-2 text-blue-600"></i>
            Interactive Text Editor
          </h3>
          <Button 
            onClick={onApplyChanges}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            data-testid="apply-changes-button"
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing Image...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Apply Changes to Image
              </>
            )}
          </Button>
        </div>
        
        <div className="text-sm text-slate-600 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Instructions:</strong>
              <ul className="mt-1 space-y-1">
                <li>• <strong>Click once</strong> to select a text region</li>
                <li>• <strong>Click again</strong> on selected region to edit text</li>
                <li>• <strong>Delete:</strong> Remove text completely from image</li>
                <li>• <strong>Apply Changes:</strong> Process image with modifications</li>
              </ul>
            </div>
            <div>
              <strong>Legend:</strong>
              <ul className="mt-1 space-y-1">
                <li><span className="inline-block w-3 h-3 bg-green-200 border border-green-500 mr-2"></span>Original text</li>
                <li><span className="inline-block w-3 h-3 bg-yellow-200 border border-yellow-500 mr-2"></span>Edited text</li>
                <li><span className="inline-block w-3 h-3 bg-red-200 border border-red-600 mr-2"></span>Deleted text</li>
                <li><span className="inline-block w-3 h-3 bg-blue-200 border border-blue-500 mr-2"></span>Selected</li>
              </ul>
            </div>
            <div>
              <strong>Stats:</strong>
              <ul className="mt-1 space-y-1">
                <li>Total regions: {textRegions.length}</li>
                <li>Original: {textRegions.filter(r => !r.isEdited && !r.isDeleted).length}</li>
                <li>Edited: {textRegions.filter(r => r.isEdited && !r.isDeleted).length}</li>
                <li>Deleted: {textRegions.filter(r => r.isDeleted).length}</li>
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