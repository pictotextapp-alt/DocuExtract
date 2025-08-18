import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (email: string) => void;
  initialEmail?: string;
}

export function PaymentModal({ isOpen, onClose, onPaymentSuccess, initialEmail }: PaymentModalProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Update email when initialEmail prop changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handlePayPalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue with payment.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/payment/paypal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          amount: "4.99",
          currency: "USD"
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Payment failed");
      }

      toast({
        title: "Payment Successful!",
        description: "You can now create your premium account and start extracting text from images.",
        variant: "default"
      });

      onPaymentSuccess(email);
      onClose();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="payment-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Get unlimited image text extractions and 1GB of storage for just $4.99/month
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Premium Features</CardTitle>
            <CardDescription>
              Everything you need for professional text extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">1,500 extractions per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Advanced OCR processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Premium support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">No daily limits</span>
              </div>
            </div>

            <form onSubmit={handlePayPalPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-email">Email Address</Label>
                <Input
                  id="payment-email"
                  data-testid="input-payment-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This email will be used for your premium account
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Premium Monthly</span>
                  <span className="text-lg font-bold">$4.99</span>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                  data-testid="button-paypal-payment"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with PayPal - $4.99
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Secure payment processing via PayPal</p>
              <p>Cancel anytime from your account settings</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}