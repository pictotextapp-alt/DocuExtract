import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using PictoText ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to these terms, you may not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              PictoText is an optical character recognition (OCR) service that extracts text from images. We offer:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Free Tier:</strong> 3 text extractions per day, no account required</li>
              <li><strong>Premium Tier:</strong> 1,500 text extractions per month with account registration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Premium Access</h2>
            <p className="mb-4">
              Premium access requires payment processing through PayPal before account creation. By upgrading to premium:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>You agree to provide accurate billing information</li>
              <li>You authorize us to charge your payment method monthly</li>
              <li>Account access is granted only after successful payment verification</li>
              <li>You may cancel your subscription at any time through your account settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="mb-4">
              You agree to use PictoText only for lawful purposes and in accordance with these Terms. You may not:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Upload images containing illegal, harmful, or copyrighted content without permission</li>
              <li>Attempt to reverse engineer, modify, or disrupt our service</li>
              <li>Use the service to process excessive volumes that could impact system performance</li>
              <li>Share your premium account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Security</h2>
            <p className="mb-4">
              We are committed to protecting your privacy. Please review our Privacy Policy to understand how we collect, 
              use, and safeguard your information. By using our service, you consent to the collection and use of information 
              as outlined in our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              PictoText is provided "as is" without warranties of any kind. We shall not be liable for any damages arising 
              from the use of our service, including but not limited to inaccurate OCR results, service interruptions, 
              or data loss.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
            <p className="mb-4">
              We reserve the right to terminate or suspend your account and access to the service immediately, without prior 
              notice, for conduct that we believe violates these Terms or is harmful to other users or our business.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting 
              to this page. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us at: 
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