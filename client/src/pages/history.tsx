import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  words: number;
  confidence: number;
  preview: string;
  type: 'image' | 'pdf' | 'handwritten';
}

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("30days");
  const { toast } = useToast();

  // Mock data - in real app this would come from API
  const historyItems: HistoryItem[] = [
    {
      id: "1",
      title: "Business_Document_01.pdf",
      date: "2 hours ago",
      words: 245,
      confidence: 98.5,
      preview: "This is a preview of the extracted text content from the document. The full text can be viewed by clicking the view button...",
      type: 'pdf'
    },
    {
      id: "2",
      title: "Screenshot_Receipt.png",
      date: "yesterday",
      words: 87,
      confidence: 96.2,
      preview: "Receipt from Tech Store - Total: $299.99 - Date: 2024-01-15 - Payment method: Credit Card ending in 4532...",
      type: 'image'
    },
    {
      id: "3",
      title: "Handwritten_Notes.jpg",
      date: "3 days ago",
      words: 156,
      confidence: 92.8,
      preview: "Meeting notes from project discussion - Key points: budget approval, timeline adjustments, team assignments...",
      type: 'handwritten'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'fas fa-file-pdf text-blue-600';
      case 'image': return 'fas fa-image text-green-600';
      case 'handwritten': return 'fas fa-pen text-purple-600';
      default: return 'fas fa-file text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-blue-100';
      case 'image': return 'bg-green-100';
      case 'handwritten': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  const handleExportAll = () => {
    toast({
      title: "Export started",
      description: "Your extraction history is being exported.",
    });
  };

  const handleClearHistory = () => {
    toast({
      title: "History cleared",
      description: "All extraction history has been removed.",
      variant: "destructive",
    });
  };

  const handleView = (item: HistoryItem) => {
    toast({
      title: "Opening document",
      description: `Viewing ${item.title}`,
    });
  };

  const handleDownload = (item: HistoryItem) => {
    toast({
      title: "Download started",
      description: `${item.title} is being downloaded.`,
    });
  };

  const handleDelete = (item: HistoryItem) => {
    toast({
      title: "Document deleted",
      description: `${item.title} has been removed from history.`,
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Extraction History</h1>
          <p className="text-xl text-slate-600">View and manage your previous text extractions.</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button onClick={handleExportAll} data-testid="button-export-all">
            <i className="fas fa-download mr-2"></i>Export All
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleClearHistory}
            data-testid="button-clear-history"
          >
            <i className="fas fa-trash mr-2"></i>Clear History
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search extractions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40" data-testid="select-type-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="handwritten">Handwritten</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-40" data-testid="select-date-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Items */}
      <div className="space-y-4 mb-8">
        {historyItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${getTypeColor(item.type)} rounded-lg flex items-center justify-center`}>
                    <i className={getTypeIcon(item.type)}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900" data-testid={`item-title-${item.id}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600" data-testid={`item-date-${item.id}`}>
                      Extracted {item.date}
                    </p>
                    <p className="text-sm text-slate-500" data-testid={`item-stats-${item.id}`}>
                      {item.words} words • {item.confidence}% confidence
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(item)}
                    data-testid={`button-view-${item.id}`}
                  >
                    <i className="fas fa-eye"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(item)}
                    data-testid={`button-download-${item.id}`}
                  >
                    <i className="fas fa-download"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700 line-clamp-2" data-testid={`item-preview-${item.id}`}>
                  {item.preview}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600" data-testid="pagination-info">
          Showing 1 to 3 of 24 results
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" data-testid="button-prev">
            Previous
          </Button>
          <Button size="sm" className="bg-blue-600 text-white" data-testid="button-page-1">
            1
          </Button>
          <Button variant="outline" size="sm" data-testid="button-page-2">
            2
          </Button>
          <Button variant="outline" size="sm" data-testid="button-page-3">
            3
          </Button>
          <Button variant="outline" size="sm" data-testid="button-next">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default History;
