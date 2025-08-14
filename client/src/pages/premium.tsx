import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Premium = () => {
  const { toast } = useToast();

  const handleUpgradePro = () => {
    toast({
      title: "Redirecting to checkout",
      description: "You will be redirected to complete your Pro subscription.",
    });
  };

  const handleContactSales = () => {
    toast({
      title: "Contact Sales",
      description: "Our sales team will contact you shortly.",
    });
  };

  const features = [
    {
      feature: "Monthly Extractions",
      basic: "10",
      pro: "Unlimited",
      enterprise: "Unlimited"
    },
    {
      feature: "File Size Limit",
      basic: "5MB",
      pro: "50MB", 
      enterprise: "100MB"
    },
    {
      feature: "Batch Processing",
      basic: false,
      pro: true,
      enterprise: true
    },
    {
      feature: "API Access",
      basic: false,
      pro: true,
      enterprise: true
    },
    {
      feature: "Team Collaboration",
      basic: false,
      pro: false,
      enterprise: true
    }
  ];

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. All payments are processed securely."
    },
    {
      question: "Is there a free trial for premium plans?",
      answer: "Yes! We offer a 14-day free trial for all premium plans. No credit card required to start your trial."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <i className="fas fa-crown mr-2"></i>Premium Features
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
          Unlock the Full Power of
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TextExtract Pro
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Get unlimited extractions, advanced features, and priority support with our premium plans.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Basic Plan */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic</h3>
              <p className="text-slate-600 mb-6">Perfect for occasional use</p>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                Free
              </div>
              <p className="text-slate-500">Forever</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">10 extractions per month</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">Basic OCR accuracy</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">5MB file size limit</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">Standard support</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full" data-testid="button-current-plan">
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan (Highlighted) */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </div>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-blue-100 mb-6">For power users and professionals</p>
              <div className="text-4xl font-bold mb-2">
                $19
                <span className="text-xl font-normal">/month</span>
              </div>
              <p className="text-blue-200">Billed monthly</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-green-300 mr-3"></i>
                <span>Unlimited extractions</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-300 mr-3"></i>
                <span>Advanced OCR accuracy</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-300 mr-3"></i>
                <span>50MB file size limit</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-300 mr-3"></i>
                <span>Batch processing</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-300 mr-3"></i>
                <span>API access</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-300 mr-3"></i>
                <span>Priority support</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-white text-blue-600 hover:bg-blue-50" 
              onClick={handleUpgradePro}
              data-testid="button-upgrade-pro"
            >
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-600 mb-6">For teams and organizations</p>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                $99
                <span className="text-xl font-normal">/month</span>
              </div>
              <p className="text-slate-500">Per team</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">Everything in Pro</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">Team collaboration</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">Custom integrations</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                <span className="text-slate-700">24/7 dedicated support</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              onClick={handleContactSales}
              data-testid="button-contact-sales"
            >
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <Card className="mb-16">
        <CardContent className="p-0">
          <div className="px-8 py-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-8 font-semibold text-slate-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Basic</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {features.map((feature, index) => (
                  <tr key={index}>
                    <td className="py-4 px-8 text-slate-700">{feature.feature}</td>
                    <td className="py-4 px-6 text-center text-slate-600">
                      {typeof feature.basic === 'boolean' ? (
                        <i className={`fas ${feature.basic ? 'fa-check text-green-500' : 'fa-times text-red-500'}`}></i>
                      ) : (
                        feature.basic
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600">
                      {typeof feature.pro === 'boolean' ? (
                        <i className={`fas ${feature.pro ? 'fa-check text-green-500' : 'fa-times text-red-500'}`}></i>
                      ) : (
                        <span className={feature.pro === 'Unlimited' ? 'text-green-600' : 'text-slate-600'}>
                          {feature.pro}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600">
                      {typeof feature.enterprise === 'boolean' ? (
                        <i className={`fas ${feature.enterprise ? 'fa-check text-green-500' : 'fa-times text-red-500'}`}></i>
                      ) : (
                        <span className={feature.enterprise === 'Unlimited' ? 'text-green-600' : 'text-slate-600'}>
                          {feature.enterprise}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="bg-slate-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Premium;
