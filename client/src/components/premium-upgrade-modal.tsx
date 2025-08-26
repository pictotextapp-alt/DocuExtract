import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Star, Zap, Shield, Mail } from "lucide-react";

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: { email?: string } | null;
}

export function PremiumUpgradeModal({ open, onOpenChange, user }: PremiumUpgradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/premium-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Thank You!",
          description: "We'll notify you when premium features are available.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save email");
      }

    } catch (error) {
      console.error("Email submission error:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      title: "Unlimited Extractions",
      description: "Process unlimited documents and images",
    },
    {
      icon: <Shield className="w-5 h-5 text-green-500" />,
      title: "Priority Support",
      description: "Get help faster with premium support",
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: "Advanced Features",
      description: "Access to premium OCR engines and formats",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Coming Soon - Premium Features
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
                  Coming Soon
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Premium Features
              </CardTitle>
              <p className="text-slate-600 text-sm">
                Professional OCR with unlimited processing
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  {feature.icon}
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-slate-600 text-xs">
                      {feature.description}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {!isSubmitted ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Get notified when premium features launch
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  data-testid="input-premium-email"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3"
                data-testid="button-notify-me"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Notify Me When Available
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Thank You!</h3>
              <p className="text-slate-600 text-sm">
                We'll notify you as soon as premium features are available.
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-400">
              Join the waitlist • Be the first to know • No spam
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}