import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Star, Zap, Shield, CreditCard } from "lucide-react";

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: { email?: string } | null;
}

export function PremiumUpgradeModal({ open, onOpenChange, user }: PremiumUpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Handle PayPal return after payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for payment success/cancel
    const paymentStatus = urlParams.get('payment');
    const token = urlParams.get('token');
    const PayerID = urlParams.get('PayerID');

    console.log("PayPal return parameters:", { paymentStatus, token, PayerID });

    if (paymentStatus === 'success' && token && PayerID) {
      console.log("Processing successful PayPal payment");
      handlePayPalReturn(token, PayerID);
    } else if (paymentStatus === 'cancel') {
      console.log("PayPal payment was cancelled");
      toast({
        title: "Payment Cancelled",
        description: "You cancelled the payment process.",
        variant: "default",
      });
    } else if (token && PayerID) {
      // Legacy support for direct PayPal redirect (without payment parameter)
      console.log("Processing PayPal return (legacy)");
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
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">
                $4.99<span className="text-lg font-normal text-slate-600">/month</span>
              </CardTitle>
              <p className="text-slate-600 text-sm">
                Unlimited OCR processing for your business
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

          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-medium py-3"
              data-testid="button-paypal-pay"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay with PayPal - $4.99
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              By clicking "Pay with PayPal", you'll be redirected to PayPal to complete your payment securely.
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-400">
              Cancel anytime • Secure payments • Money-back guarantee
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}