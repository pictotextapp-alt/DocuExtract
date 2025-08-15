import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import type { 
  TextRegion, 
  TextLine,
  InpaintRequest, 
  InpaintResponse,
  TextLayer,
  ExportRequest,
  ExportResponse
} from "@shared/schema";

interface CanvaTextEditorProps {
  originalImage: string;
  textRegions: TextRegion[];
  textLines?: TextLine[]; // Enhanced line-based processing
  cleanedImage?: string; // Auto-provided by PhotoExtractor
  onTextLayersChange?: (layers: TextLayer[]) => void;
}

const CanvaTextEditor = ({ originalImage, textRegions, textLines, cleanedImage: externalCleanedImage, onTextLayersChange }: CanvaTextEditorProps) => {
  const [cleanedImage, setCleanedImage] = useState<string>("");
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [exportQuality, setExportQuality] = useState(0.9);
  
  const originalImgRef = useRef<HTMLImageElement>(null);
  const cleanedImgRef = useRef<HTMLImageElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize text layers from detected lines (preferred) or regions with enhanced styling
  useEffect(() => {
    const sourceData = textLines && textLines.length > 0 ? textLines : textRegions;
    
    if (sourceData.length > 0 && textLayers.length === 0) {
      const initialLayers: TextLayer[] = sourceData.map((item, index) => ({
        id: item.id,
        text: item.text,
        originalText: 'originalText' in item ? item.originalText : item.text,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        fontSize: 'estimatedFontSize' in item ? item.estimatedFontSize : Math.max(12, item.height * 0.8),
        fontFamily: "Arial",
        fontWeight: 'estimatedFontWeight' in item ? item.estimatedFontWeight : "400",
        fontStyle: "normal",
        textAlign: "left",
        lineHeight: 1.2,
        letterSpacing: 'estimatedLetterSpacing' in item ? item.estimatedLetterSpacing : 0,
        color: 'estimatedColor' in item ? item.estimatedColor : "#000000",
        backgroundColor: "transparent",
        borderColor: "transparent",
        borderWidth: 0,
        borderRadius: 0,
        padding: 0,
        shadow: "none",
        opacity: 1,
        isVisible: true,
        isEdited: false,
        rotation: 0,
        zIndex: index + 1,
      }));
      setTextLayers(initialLayers);
      onTextLayersChange?.(initialLayers);
    }
  }, [textRegions, textLines, textLayers.length, onTextLayersChange]);

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
          title: "Text extracted successfully!",
          description: "Background cleaned and text elements are now editable. Move, style, and customize each text element independently.",
        });
      } else {
        toast({
          title: "Text extraction failed",
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

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (exportRequest: ExportRequest): Promise<ExportResponse> => {
      const response = await fetch("/api/export-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportRequest),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data: ExportResponse) => {
      if (data.success) {
        // Download the exported image
        const link = document.createElement('a');
        link.href = data.exportedImage;
        link.download = `edited-image.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export successful!",
          description: "Your edited image has been downloaded.",
        });
      } else {
        toast({
          title: "Export failed",
          description: data.error || "Failed to export the image.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Export error",
        description: "An error occurred while exporting your image.",
        variant: "destructive",
      });
    },
  });

  // Update cleaned image when provided by PhotoExtractor
  useEffect(() => {
    if (externalCleanedImage) {
      setCleanedImage(externalCleanedImage);
    } else if (originalImage && textLayers.length > 0 && !cleanedImage) {
      // Use the original image as background until inpainting completes
      setCleanedImage(originalImage);
    }
  }, [externalCleanedImage, originalImage, textLayers.length, cleanedImage]);

  const updateTextLayer = useCallback((id: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => {
      const updated = prev.map(layer => 
        layer.id === id 
          ? { ...layer, ...updates, isEdited: true }
          : layer
      );
      onTextLayersChange?.(updated);
      return updated;
    });
  }, [onTextLayersChange]);

  const deleteTextLayer = (id: string) => {
    setTextLayers(prev => {
      const updated = prev.filter(layer => layer.id !== id);
      onTextLayersChange?.(updated);
      return updated;
    });
    setSelectedLayer(null);
  };

  const duplicateTextLayer = (id: string) => {
    const layer = textLayers.find(l => l.id === id);
    if (!layer) return;
    
    const newLayer: TextLayer = {
      ...layer,
      id: `${id}-copy-${Date.now()}`,
      x: layer.x + 20,
      y: layer.y + 20,
      zIndex: Math.max(...textLayers.map(l => l.zIndex)) + 1,
    };
    
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  // Drag and drop functionality
  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = editorRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const layer = textLayers.find(l => l.id === layerId);
    if (!layer) return;
    
    setSelectedLayer(layerId);
    setIsDragging(true);
    
    const scaleX = cleanedImgRef.current?.offsetWidth || 1 / imageDimensions.width || 1;
    const scaleY = cleanedImgRef.current?.offsetHeight || 1 / imageDimensions.height || 1;
    
    setDragOffset({
      x: e.clientX - rect.left - layer.x * scaleX,
      y: e.clientY - rect.top - layer.y * scaleY,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedLayer || !editorRef.current) return;
    
    const rect = editorRef.current.getBoundingClientRect();
    const scaleX = cleanedImgRef.current?.offsetWidth || 1 / imageDimensions.width || 1;
    const scaleY = cleanedImgRef.current?.offsetHeight || 1 / imageDimensions.height || 1;
    
    const newX = Math.max(0, Math.min(
      imageDimensions.width - 100,
      (e.clientX - rect.left - dragOffset.x) / scaleX
    ));
    const newY = Math.max(0, Math.min(
      imageDimensions.height - 50,
      (e.clientY - rect.top - dragOffset.y) / scaleY
    ));
    
    updateTextLayer(selectedLayer, { x: newX, y: newY });
  }, [isDragging, selectedLayer, dragOffset, imageDimensions, updateTextLayer]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getLayerStyle = (layer: TextLayer) => {
    const scaleX = cleanedImgRef.current?.offsetWidth || 1 / imageDimensions.width || 1;
    const scaleY = cleanedImgRef.current?.offsetHeight || 1 / imageDimensions.height || 1;
    
    return {
      position: 'absolute' as const,
      left: `${layer.x * scaleX}px`,
      top: `${layer.y * scaleY}px`,
      width: `${Math.max(layer.width * scaleX, 50)}px`,
      minHeight: `${Math.max(layer.height * scaleY, 20)}px`,
      fontSize: `${layer.fontSize * Math.min(scaleX, scaleY)}px`,
      fontFamily: layer.fontFamily,
      fontWeight: layer.fontWeight,
      fontStyle: layer.fontStyle,
      textAlign: layer.textAlign as any,
      lineHeight: layer.lineHeight,
      letterSpacing: `${layer.letterSpacing}px`,
      color: layer.color,
      backgroundColor: layer.backgroundColor,
      borderColor: layer.borderColor,
      borderWidth: `${layer.borderWidth}px`,
      borderStyle: layer.borderWidth > 0 ? 'solid' : 'none',
      borderRadius: `${layer.borderRadius}px`,
      padding: `${layer.padding}px`,
      boxShadow: layer.shadow,
      opacity: layer.opacity,
      transform: `rotate(${layer.rotation}deg)`,
      cursor: isDragging && selectedLayer === layer.id ? 'grabbing' : 'grab',
      border: selectedLayer === layer.id ? '2px dashed #3b82f6' : 'none',
      outline: selectedLayer === layer.id ? '1px solid #3b82f6' : 'none',
      display: layer.isVisible ? 'block' : 'none',
      zIndex: selectedLayer === layer.id ? 1000 : layer.zIndex + 10,
      pointerEvents: 'auto' as const,
      userSelect: 'none' as const,
      whiteSpace: 'pre-wrap' as const,
      overflow: 'visible' as const,
    };
  };

  const handleExport = () => {
    if (!cleanedImage || textLayers.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Please grab text from an image first.",
        variant: "destructive",
      });
      return;
    }
    
    const exportRequest: ExportRequest = {
      cleanedImage,
      textLayers,
      format: exportFormat,
      quality: exportQuality,
    };
    
    exportMutation.mutate(exportRequest);
  };

  const selectedLayerData = textLayers.find(layer => layer.id === selectedLayer);

  return (
    <div className="space-y-6">
      {/* Header with Grab Text Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                🎨 Canva-Style Text Editor
              </h3>
              <p className="text-slate-600">
                Detect text, clean background, and edit each text element independently
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleGrabText}
                disabled={inpaintMutation.isPending || !originalImage}
                data-testid="button-grab-text"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg font-semibold"
              >
                {inpaintMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Grabbing Text...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Grab Text
                  </>
                )}
              </Button>
              
              {cleanedImage && (
                <Button 
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  data-testid="button-export"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-semibold"
                >
                  {exportMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Export
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {!cleanedImage && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <i className="fas fa-info-circle mr-2"></i>
                Upload an image and click "Grab Text" to extract all text as editable elements. 
                The background will be automatically cleaned using content-aware inpainting.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side-by-side Image Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image */}
        <Card>
          <CardContent className="p-4">
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <i className="fas fa-image text-blue-600 mr-2"></i>
              Original Image
            </h4>
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
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <i className="fas fa-edit text-green-600 mr-2"></i>
              Editable Text Layers
            </h4>
            <div 
              ref={editorRef}
              className="relative bg-gray-50 rounded-lg overflow-hidden select-none"
              style={{ minHeight: '300px', cursor: isDragging ? 'grabbing' : 'default' }}
            >
              {cleanedImage ? (
                <>
                  <img
                    ref={cleanedImgRef}
                    src={cleanedImage}
                    alt="Clean background"
                    className="w-full h-auto pointer-events-none"
                    data-testid="img-cleaned"
                  />
                  {/* DOM-based text layers */}
                  {textLayers.map(layer => (
                    <div
                      key={layer.id}
                      style={getLayerStyle(layer)}
                      onMouseDown={(e) => handleMouseDown(e, layer.id)}
                      onClick={() => setSelectedLayer(layer.id)}
                      data-testid={`text-layer-${layer.id}`}
                      suppressContentEditableWarning
                      contentEditable
                      onBlur={(e) => {
                        const newText = e.currentTarget.textContent || '';
                        if (newText !== layer.text) {
                          updateTextLayer(layer.id, { text: newText });
                        }
                      }}
                      className="cursor-grab hover:cursor-grab active:cursor-grabbing transition-all duration-200"
                    >
                      {layer.text}
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <div className="text-center">
                    <i className="fas fa-magic text-4xl mb-4 text-slate-400"></i>
                    <p>Click "Grab Text" to extract editable text elements</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Text Styling Panel */}
      {selectedLayerData && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold flex items-center">
                <i className="fas fa-palette text-purple-600 mr-2"></i>
                Text Styling - "{selectedLayerData.text.substring(0, 20)}..."
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateTextLayer(selectedLayerData.id)}
                  data-testid={`button-duplicate-${selectedLayerData.id}`}
                >
                  <i className="fas fa-copy mr-1"></i>
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTextLayer(selectedLayerData.id)}
                  data-testid={`button-delete-${selectedLayerData.id}`}
                >
                  <i className="fas fa-trash mr-1"></i>
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Text Content */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Text Content</Label>
                  <Textarea
                    value={selectedLayerData.text}
                    onChange={(e) => updateTextLayer(selectedLayerData.id, { text: e.target.value })}
                    className="mt-1"
                    rows={3}
                    data-testid={`input-text-${selectedLayerData.id}`}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Font Family</Label>
                  <Select
                    value={selectedLayerData.fontFamily}
                    onValueChange={(value) => updateTextLayer(selectedLayerData.id, { fontFamily: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Font Size: {selectedLayerData.fontSize}px</Label>
                  <Slider
                    value={[selectedLayerData.fontSize]}
                    onValueChange={([value]) => updateTextLayer(selectedLayerData.id, { fontSize: value })}
                    min={8}
                    max={120}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Weight</Label>
                    <Select
                      value={selectedLayerData.fontWeight}
                      onValueChange={(value) => updateTextLayer(selectedLayerData.id, { fontWeight: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="600">Semi Bold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                        <SelectItem value="900">Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Style</Label>
                    <Select
                      value={selectedLayerData.fontStyle}
                      onValueChange={(value) => updateTextLayer(selectedLayerData.id, { fontStyle: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="italic">Italic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Text Align</Label>
                  <Select
                    value={selectedLayerData.textAlign}
                    onValueChange={(value) => updateTextLayer(selectedLayerData.id, { textAlign: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Colors & Effects */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Text Color</Label>
                  <Input
                    type="color"
                    value={selectedLayerData.color}
                    onChange={(e) => updateTextLayer(selectedLayerData.id, { color: e.target.value })}
                    className="mt-1 h-10"
                    data-testid={`input-color-${selectedLayerData.id}`}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Background Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={selectedLayerData.backgroundColor === 'transparent' ? '#ffffff' : selectedLayerData.backgroundColor}
                      onChange={(e) => updateTextLayer(selectedLayerData.id, { backgroundColor: e.target.value })}
                      className="h-10 flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTextLayer(selectedLayerData.id, { backgroundColor: 'transparent' })}
                      className="px-3"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Opacity: {Math.round(selectedLayerData.opacity * 100)}%</Label>
                  <Slider
                    value={[selectedLayerData.opacity]}
                    onValueChange={([value]) => updateTextLayer(selectedLayerData.id, { opacity: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Rotation: {selectedLayerData.rotation}°</Label>
                  <Slider
                    value={[selectedLayerData.rotation]}
                    onValueChange={([value]) => updateTextLayer(selectedLayerData.id, { rotation: value })}
                    min={-180}
                    max={180}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Layers List */}
      {textLayers.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-layers text-indigo-600 mr-2"></i>
              Text Layers ({textLayers.length})
            </h4>
            <div className="space-y-2">
              {textLayers
                .sort((a, b) => b.zIndex - a.zIndex)
                .map(layer => (
                <div
                  key={layer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedLayer === layer.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedLayer(layer.id)}
                  data-testid={`layer-item-${layer.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="font-medium text-slate-900 truncate">
                        {layer.text || 'Empty Text'}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {layer.fontFamily} • {layer.fontSize}px • {layer.color}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTextLayer(layer.id, { isVisible: !layer.isVisible });
                        }}
                        className={`h-8 w-8 p-0 ${layer.isVisible ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        <i className={`fas ${layer.isVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </Button>
                      {layer.isEdited && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Edited
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                        Z:{layer.zIndex}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Settings */}
      {cleanedImage && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-download text-green-600 mr-2"></i>
              Export Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Format</Label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                    <SelectItem value="jpeg">JPEG (Smaller file)</SelectItem>
                    <SelectItem value="webp">WebP (Modern)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Quality: {Math.round(exportQuality * 100)}%</Label>
                <Slider
                  value={[exportQuality]}
                  onValueChange={([value]) => setExportQuality(value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="mt-3"
                  disabled={exportFormat === 'png'}
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {exportMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Download {exportFormat.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CanvaTextEditor;