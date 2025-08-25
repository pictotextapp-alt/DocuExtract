import React, { useState, useEffect } from "react";
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
        setIsProcessing(true);

        try {
          // Create PayPal order with return URLs
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
          console.log("PayPal order created:", orderData);

          // Find the approval URL from PayPal response
          const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href;

          if (!approvalUrl) {
            throw new Error("PayPal approval URL not found");
          }

          // Store payment info for verification when user returns
          sessionStorage.setItem('pendingPayment', JSON.stringify({
            orderId: orderData.id,
            email: user?.email || 'guest@example.com'
          }));

          // Redirect to PayPal for actual payment
          window.location.href = approvalUrl;

        } catch (error) {
          console.error("Payment setup error:", error);
          toast({
            title: "Payment Error",
            description: error instanceof Error ? error.message : "Payment setup failed. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      };

  // Handle PayPal return after payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const PayerID = urlParams.get('PayerID');

    if (token && PayerID) {
      console.log("PayPal return detected:", { token, PayerID });
      handlePayPalReturn(token, PayerID);
    }
  }, []);

  const handlePayPalReturn = async (paypalOrderId: string, payerID: string) => {
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (!pendingPayment) {
      console.error("No pending payment found");
      return;
    }

    const paymentData = JSON.parse(pendingPayment);
    setIsProcessing(true);

    try {
      console.log("Verifying PayPal payment:", { paypalOrderId, payerID, email: paymentData.email });

      const response = await fetch("/api/payment/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: paymentData.email,
          paypalOrderId: paypalOrderId,
          payerID: payerID
        }),
      });

      if (response.ok) {
        sessionStorage.removeItem('pendingPayment');
        toast({
          title: "Welcome to Premium!",
          description: "Your payment was successful. Enjoy unlimited OCR processing!",
        });

        // Clear URL parameters and refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => window.location.reload(), 2000);

      } else {
        const errorData = await response.json();
        console.error("Payment verification failed:", errorData);
        throw new Error(errorData.error || "Payment verification failed");
      }

    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Payment Verification Failed",
        description: error instanceof Error ? error.message : "Please contact support if payment was deducted.",
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