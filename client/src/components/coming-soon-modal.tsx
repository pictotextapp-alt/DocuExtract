import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Bell } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComingSoonModal({ open, onOpenChange }: ComingSoonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Coming Soon
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600">
            Premium features are in development
          </DialogDescription>
        </DialogHeader>

        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">Premium Features</h3>
            <p className="text-slate-600 text-sm">
              Premium features are currently in development. We're working hard to bring you enhanced OCR capabilities and unlimited processing.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              data-testid="button-close-coming-soon"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me When Ready
            </Button>
            
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full"
              data-testid="button-close"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}