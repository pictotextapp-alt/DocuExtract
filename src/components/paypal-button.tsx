import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: "capture" | "subscription";
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function PayPalButton({ 
  amount, 
  currency, 
  intent, 
  onSuccess, 
  onError 
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create subscription order
      const orderResponse = await fetch('/api/paypal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          intent: 'subscription'
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const order = await orderResponse.json();
      
      // For now, simulate successful payment
      // In production, this would redirect to PayPal
      setTimeout(() => {
        onSuccess?.();
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(err);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-medium py-3"
        data-testid="button-paypal-pay"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with PayPal
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      
      <p className="text-xs text-slate-500 text-center">
        By clicking "Pay with PayPal", you'll be redirected to PayPal to complete your payment securely.
      </p>
    </div>
  );
}