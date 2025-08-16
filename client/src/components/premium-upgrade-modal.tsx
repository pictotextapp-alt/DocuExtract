import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap, Shield, Clock } from "lucide-react";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage?: {
    imageCount: number;
    dailyLimit: number;
  };
}

export function PremiumUpgradeModal({ 
  isOpen, 
  onClose, 
  currentUsage 
}: PremiumUpgradeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create PayPal order
      const orderResponse = await fetch("/api/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: "4.99",
          currency: "USD",
          intent: "CAPTURE"
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // For development, simulate immediate payment success
      // In production, this would redirect to PayPal
      const captureResponse = await fetch(`/api/paypal/order/${orderData.id}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!captureResponse.ok) {
        throw new Error("Payment processing failed");
      }

      toast({
        title: "Success!",
        description: "Welcome to PictoText Premium! You now have unlimited image extractions.",
        duration: 5000,
      });

      onClose();

      // Refresh page to update user status
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error("Upgrade error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Unlimited Extractions",
      description: "No daily limits - extract text from as many images as you need"
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      title: "Priority Processing",
      description: "Your images get processed faster with premium priority"
    },
    {
      icon: <Shield className="h-5 w-5 text-green-500" />,
      title: "Advanced OCR",
      description: "Access to enhanced OCR features and better accuracy"
    },
    {
      icon: <Crown className="h-5 w-5 text-purple-500" />,
      title: "Premium Support",
      description: "Priority customer support and feature requests"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Upgrade to PictoText Premium
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Usage Alert */}
          {currentUsage && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    Daily Limit Reached: {currentUsage.imageCount}/{currentUsage.dailyLimit} images used today
                  </span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Upgrade now to continue extracting text without waiting!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pricing Card */}
          <Card className="relative overflow-hidden border-2 border-primary">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1">
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-2">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Premium Plan</CardTitle>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">$4.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.icon}
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="button-upgrade-premium"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Crown className="mr-2 h-5 w-5" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Free Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  3 images per day
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-muted-foreground/20"></span>
                  Basic OCR accuracy
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-muted-foreground/20"></span>
                  Standard processing
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Premium Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Unlimited images
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Enhanced OCR accuracy
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Priority processing
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Secure payment processed by PayPal</p>
            <p>Cancel anytime • No long-term commitments</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}