import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import type { 
  OCRRequest, 
  OCRResponse, 
  TextRegion, 
  InpaintRequest, 
  InpaintResponse,
  TextLayer 
} from "@shared/schema";

interface AdvancedTextEditorProps {
  originalImage: string;
  textRegions: TextRegion[];
  onTextLayersChange?: (layers: TextLayer[]) => void;
}

const AdvancedTextEditor = ({ originalImage, textRegions, onTextLayersChange }: AdvancedTextEditorProps) => {
  const [cleanedImage, setCleanedImage] = useState<string>("");
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const originalImgRef = useRef<HTMLImageElement>(null);
  const cleanedImgRef = useRef<HTMLImageElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize text layers from detected regions
  useEffect(() => {
    if (textRegions.length > 0 && textLayers.length === 0) {
      const initialLayers: TextLayer[] = textRegions.map(region => ({
        id: region.id,
        text: region.text,
        originalText: region.originalText,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        fontSize: Math.max(12, region.height * 0.8),
        fontFamily: "Arial",
        color: "#000000",
        isVisible: true,
        isEdited: false,
        rotation: 0,
      }));
      setTextLayers(initialLayers);
      onTextLayersChange?.(initialLayers);
    }
  }, [textRegions, textLayers.length, onTextLayersChange]);

  // Content-aware inpainting mutation
  const inpaintMutation = useMutation({
    mutationFn: async (inpaintRequest: InpaintRequest): Promise<InpaintResponse> => {
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inpaintRequest),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data: InpaintResponse) => {
      if (data.success) {
        setCleanedImage(data.cleanedImage);
        toast({
          title: "Background reconstruction complete",
          description: "Text has been removed and background reconstructed using content-aware inpainting.",
        });
      } else {
        toast({
          title: "Background reconstruction failed",
          description: data.error || "Failed to process the image.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Processing error",
        description: "An error occurred while processing your image. Please try again.",
        variant: "destructive",
      });
      console.error("Inpainting error:", error);
    },
  });

  const handleStartEditing = () => {
    if (!originalImage || textRegions.length === 0) return;
    
    const inpaintRequest: InpaintRequest = {
      originalImage,
      textRegions: textRegions.filter(region => !region.isDeleted), // Remove all text for clean background
    };
    
    inpaintMutation.mutate(inpaintRequest);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => {
      const updated = prev.map(layer => 
        layer.id === id 
          ? { ...layer, ...updates, isEdited: true }
          : layer
      );
      onTextLayersChange?.(updated);
      return updated;
    });
  };

  const deleteTextLayer = (id: string) => {
    setTextLayers(prev => {
      const updated = prev.filter(layer => layer.id !== id);
      onTextLayersChange?.(updated);
      return updated;
    });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  const getLayerStyle = (layer: TextLayer) => {
    const scaleX = cleanedImgRef.current?.offsetWidth || 1 / imageDimensions.width || 1;
    const scaleY = cleanedImgRef.current?.offsetHeight || 1 / imageDimensions.height || 1;
    
    return {
      position: 'absolute' as const,
      left: `${layer.x * scaleX}px`,
      top: `${layer.y * scaleY}px`,
      width: `${layer.width * scaleX}px`,
      height: `${layer.height * scaleY}px`,
      fontSize: `${layer.fontSize * Math.min(scaleX, scaleY)}px`,
      fontFamily: layer.fontFamily,
      color: layer.color,
      transform: `rotate(${layer.rotation}deg)`,
      cursor: 'pointer',
      border: selectedLayer === layer.id ? '2px solid #3b82f6' : '1px solid transparent',
      backgroundColor: selectedLayer === layer.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      display: layer.isVisible ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      pointerEvents: 'auto' as const,
    };
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Advanced Text Editor</h3>
            <Button 
              onClick={handleStartEditing}
              disabled={inpaintMutation.isPending || !originalImage}
              data-testid="button-start-editing"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {inpaintMutation.isPending ? "Processing..." : "Start Advanced Editing"}
            </Button>
          </div>
          <p className="text-sm text-slate-600">
            Click "Start Advanced Editing" to create a clean background image using content-aware inpainting. 
            Then edit text layers independently as separate DOM elements.
          </p>
        </CardContent>
      </Card>

      {/* Side-by-side Image Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image */}
        <Card>
          <CardContent className="p-4">
            <h4 className="text-md font-medium mb-3">Original Image</h4>
            <div className="relative bg-gray-50 rounded-lg overflow-hidden">
              <img
                ref={originalImgRef}
                src={originalImage}
                alt="Original"
                className="w-full h-auto"
                onLoad={handleImageLoad}
                data-testid="img-original"
              />
              {/* Text region overlays for reference */}
              {imageLoaded && textRegions.map(region => (
                <div
                  key={`orig-${region.id}`}
                  className="absolute border-2 border-red-400 bg-red-100 bg-opacity-30"
                  style={{
                    left: `${(region.x / imageDimensions.width) * 100}%`,
                    top: `${(region.y / imageDimensions.height) * 100}%`,
                    width: `${(region.width / imageDimensions.width) * 100}%`,
                    height: `${(region.height / imageDimensions.height) * 100}%`,
                  }}
                >
                  <span className="text-xs text-red-700 font-medium p-1">
                    {region.originalText}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edited Image with DOM Text Layers */}
        <Card>
          <CardContent className="p-4">
            <h4 className="text-md font-medium mb-3">Edited Image (Clean + Text Layers)</h4>
            <div 
              ref={editorRef}
              className="relative bg-gray-50 rounded-lg overflow-hidden"
              style={{ minHeight: '300px' }}
            >
              {cleanedImage ? (
                <>
                  <img
                    ref={cleanedImgRef}
                    src={cleanedImage}
                    alt="Clean background"
                    className="w-full h-auto"
                    data-testid="img-cleaned"
                  />
                  {/* DOM-based text layers */}
                  {textLayers.map(layer => (
                    <div
                      key={layer.id}
                      style={getLayerStyle(layer)}
                      onClick={() => setSelectedLayer(layer.id)}
                      data-testid={`text-layer-${layer.id}`}
                    >
                      <span className="text-center break-words">
                        {layer.text}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  Click "Start Advanced Editing" to generate clean background
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Text Layer Editor Panel */}
      {selectedLayer && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-medium mb-4">Edit Text Layer</h4>
            {textLayers
              .filter(layer => layer.id === selectedLayer)
              .map(layer => (
                <div key={layer.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Text Content</label>
                      <Input
                        value={layer.text}
                        onChange={(e) => updateTextLayer(layer.id, { text: e.target.value })}
                        data-testid={`input-text-${layer.id}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Size</label>
                      <Input
                        type="number"
                        value={layer.fontSize}
                        onChange={(e) => updateTextLayer(layer.id, { fontSize: Number(e.target.value) })}
                        data-testid={`input-font-size-${layer.id}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <Input
                        type="color"
                        value={layer.color}
                        onChange={(e) => updateTextLayer(layer.id, { color: e.target.value })}
                        data-testid={`input-color-${layer.id}`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => updateTextLayer(layer.id, { isVisible: !layer.isVisible })}
                      data-testid={`button-toggle-visibility-${layer.id}`}
                    >
                      {layer.isVisible ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteTextLayer(layer.id)}
                      data-testid={`button-delete-${layer.id}`}
                    >
                      Delete Layer
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Text Layers List */}
      {textLayers.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-medium mb-4">Text Layers ({textLayers.length})</h4>
            <div className="space-y-2">
              {textLayers.map(layer => (
                <div
                  key={layer.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedLayer === layer.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLayer(layer.id)}
                  data-testid={`layer-item-${layer.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {layer.text || layer.originalText}
                    </span>
                    <div className="flex items-center space-x-2">
                      {layer.isEdited && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Edited
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        layer.isVisible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {layer.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedTextEditor;