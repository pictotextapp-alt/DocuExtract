import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us and information we obtain automatically when you use our service.
            </p>
            
            <h3 className="text-lg font-semibold mb-3">Information You Provide:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Information:</strong> Email address, username, and password for premium accounts</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through PayPal</li>
              <li><strong>Images:</strong> Images you upload for text extraction</li>
              <li><strong>Communications:</strong> Messages you send to our support team</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">Information Collected Automatically:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage Data:</strong> Number of extractions, service usage patterns</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Session Data:</strong> Temporary cookies for free tier usage tracking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our OCR service</li>
              <li>Process your text extraction requests</li>
              <li>Manage your account and subscription</li>
              <li>Send service-related communications</li>
              <li>Monitor usage limits and prevent abuse</li>
              <li>Improve our service and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Image Processing and Storage</h2>
            <p className="mb-4">
              <strong>Important:</strong> We process your images to extract text but do not permanently store your uploaded images. 
              Images are:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Processed immediately upon upload</li>
              <li>Temporarily cached during processing</li>
              <li>Automatically deleted after text extraction is complete</li>
              <li>Never stored on our servers beyond the processing session</li>
              <li>Not used for training or improving our AI models without explicit consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="mb-4">We do not sell, trade, or rent your personal information. We may share information in these limited circumstances:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Service Providers:</strong> Third-party services that help us operate (OCR.space API, PayPal)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encrypted data transmission using HTTPS</li>
              <li>Secure password hashing for account credentials</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information by our team</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Access:</strong> Request information about the data we have about you</li>
              <li><strong>Correct:</strong> Update or correct your account information</li>
              <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
              <li><strong>Cancel:</strong> Cancel your premium subscription at any time</li>
              <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Track daily usage limits for free tier users</li>
              <li>Maintain your login session for premium accounts</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze service usage and performance</li>
            </ul>
            <p className="mb-4">
              You can control cookies through your browser settings, but this may affect service functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="mb-4">
              Your information may be processed and stored in countries other than your own. We ensure appropriate 
              safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the 
              new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
              <a href="mailto:pictotextapp@gmail.com" className="text-blue-600 hover:text-blue-800 ml-1">
                pictotextapp@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}