import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" data-testid="link-home">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PictoText
              </span>
            </Link>
            <Button variant="ghost" size="sm" asChild data-testid="button-back">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. No Refund Policy</h2>
            <p className="mb-4">
              <strong>Important:</strong> All payments made to PictoText are final and non-refundable. We do not provide 
              refunds for any premium subscriptions, regardless of usage or circumstances.
            </p>
            <p className="mb-4">
              By making a payment for premium access, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>All sales are final</li>
              <li>No refunds will be issued under any circumstances</li>
              <li>You understand the service features before purchasing</li>
              <li>You have tested the free tier before upgrading to premium</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Cancellation Policy</h2>
            <p className="mb-4">
              While we do not offer refunds, you may cancel your premium subscription at any time:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>How to Cancel:</strong> Contact us at pictotextapp@gmail.com with your account email</li>
              <li><strong>Effective Date:</strong> Cancellation takes effect at the end of your current billing cycle</li>
              <li><strong>Access Continuation:</strong> You retain premium access until your paid period expires</li>
              <li><strong>No Partial Refunds:</strong> You will not receive a refund for the unused portion of your subscription</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Free Trial Alternative</h2>
            <p className="mb-4">
              To help you make an informed decision, we provide a generous free tier:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Free Access:</strong> 3 text extractions per day, no account required</li>
              <li><strong>Full Features:</strong> Same OCR technology as premium users</li>
              <li><strong>No Time Limit:</strong> Free tier never expires</li>
              <li><strong>Test Before Purchase:</strong> Evaluate our service quality before upgrading</li>
            </ul>
            <p className="mb-4">
              We strongly recommend testing the free tier thoroughly before purchasing premium access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Technical Issues</h2>
            <p className="mb-4">
              If you experience technical issues with our service:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Report Issues:</strong> Contact us immediately at pictotextapp@gmail.com</li>
              <li><strong>Support Response:</strong> We will work to resolve technical problems promptly</li>
              <li><strong>Service Credits:</strong> In rare cases of extended outages, we may provide service credits</li>
              <li><strong>No Refunds:</strong> Technical issues do not qualify for refunds, but we will provide support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Account Termination</h2>
            <p className="mb-4">
              If we terminate your account for violations of our Terms of Service:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>No refunds will be provided</li>
              <li>Access to premium features will be immediately revoked</li>
              <li>Outstanding subscription fees remain due and payable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Billing Disputes</h2>
            <p className="mb-4">
              For billing questions or disputes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Contact Us First:</strong> Email pictotextapp@gmail.com within 30 days of billing</li>
              <li><strong>PayPal Disputes:</strong> You may also contact PayPal directly for payment issues</li>
              <li><strong>Documentation:</strong> We will provide transaction records upon request</li>
              <li><strong>Resolution:</strong> We will work with you to resolve legitimate billing errors</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
            <p className="mb-4">
              We reserve the right to modify this refund policy at any time. Changes will be effective immediately 
              upon posting to this page. Your continued use of the service after changes constitutes acceptance 
              of the new policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Legal Disclaimer</h2>
            <p className="mb-4">
              This no-refund policy is designed to protect our business model while providing a generous free tier 
              for testing. By purchasing premium access, you agree to these terms and waive any right to request 
              a refund through your payment provider or any other means.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="mb-4">
              For questions about cancellations, billing issues, or this refund policy, please contact us at:
              <a href="mailto:pictotextapp@gmail.com" className="text-blue-600 hover:text-blue-800 ml-1">
                pictotextapp@gmail.com
              </a>
            </p>
            <p className="mb-4">
              We are committed to providing excellent customer service and will respond to all inquiries promptly.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}