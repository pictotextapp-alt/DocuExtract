import { useState } from "react";
import { useAuth, useUsage } from "@/hooks/useAuth";
import { PremiumUpgradeModal } from "@/components/premium-upgrade-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, Archive, Infinity, Star } from "lucide-react";

export default function Premium() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { data: usage } = useUsage();

  const features = [
    {
      icon: <Infinity className="h-6 w-6 text-green-500" />,
      title: "Unlimited OCR Extractions",
      description: "Process as many images as you need with no daily limits",
      free: "3 per day",
      premium: "Unlimited"
    },
    {
      icon: <Archive className="h-6 w-6 text-blue-500" />,
      title: "1GB Storage History",
      description: "Keep your extraction history and original images safely stored",
      free: "No storage",
      premium: "1GB included"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Priority Processing",
      description: "Faster OCR processing with enhanced accuracy algorithms",
      free: "Standard speed",
      premium: "Priority queue"
    },
    {
      icon: <Star className="h-6 w-6 text-purple-500" />,
      title: "Advanced Features",
      description: "Access to premium OCR engines and advanced text formatting",
      free: "Basic OCR",
      premium: "Advanced OCR"
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <Crown className="h-16 w-16 text-amber-500 mr-4" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            PictoText Premium
          </h1>
        </div>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Unlock unlimited OCR extractions and professional features for serious users
        </p>
      </div>

      {/* Current Status */}
      {isAuthenticated && (
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Current Plan</h3>
                {user?.isPremium ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                    <span className="text-slate-600">Unlimited usage</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Free Plan</Badge>
                    <span className="text-slate-600">
                      {usage ? `${usage.imageCount}/${usage.dailyLimit}` : "0/3"} images today
                    </span>
                  </div>
                )}
              </div>
              {!user?.isPremium && (
                <Button 
                  onClick={() => setUpgradeModalOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  data-testid="button-upgrade-hero"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Card */}
      <div className="max-w-md mx-auto mb-12">
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
            <div className="text-4xl font-bold text-amber-600 mt-2">
              $4.99
              <span className="text-lg font-normal text-slate-500">/month</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center mb-6">
              {!isAuthenticated ? (
                <p className="text-slate-600 mb-4">Sign in to upgrade to Premium</p>
              ) : user?.isPremium ? (
                <div className="text-center">
                  <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white mb-2">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  <p className="text-slate-600">You're already a Premium member!</p>
                </div>
              ) : (
                <Button 
                  onClick={() => setUpgradeModalOpen(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 text-lg"
                  data-testid="button-upgrade-main"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Get Premium Now
                </Button>
              )}
            </div>
            <div className="text-sm text-slate-500 text-center">
              Cancel anytime • Secure payment via PayPal
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Comparison */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center mb-3">
                  {feature.icon}
                  <CardTitle className="text-lg ml-3">{feature.title}</CardTitle>
                </div>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Free:</span>
                    <span className="text-sm">{feature.free}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Premium:</span>
                    <span className="text-sm font-semibold text-amber-600">{feature.premium}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">What happens to my free extractions when I upgrade?</h4>
            <p className="text-slate-600">Your usage counter resets immediately upon upgrading, giving you unlimited extractions right away.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can I cancel my subscription anytime?</h4>
            <p className="text-slate-600">Yes, you can cancel your Premium subscription at any time. You'll continue to have Premium access until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is my payment information secure?</h4>
            <p className="text-slate-600">Absolutely. All payments are processed securely through PayPal. We never store your payment information on our servers.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What file formats are supported?</h4>
            <p className="text-slate-600">We support all major image formats including JPG, PNG, WEBP, GIF, and BMP with files up to 10MB.</p>
          </div>
        </CardContent>
      </Card>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentUsage={usage}
      />
    </div>
  );
}