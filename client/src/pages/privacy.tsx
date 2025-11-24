export default function Privacy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-semibold mb-8" data-testid="text-page-title">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              Office Tools Hub is committed to protecting your privacy. We collect minimal information necessary to provide our services.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Anonymous usage statistics</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Your Files</h2>
            <p className="text-muted-foreground leading-relaxed">
              All file processing happens entirely in your browser. We do not upload, store, or have access to any files you process using our tools. Your files never leave your device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to remember your preferences (such as dark mode settings). We do not use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use third-party services for analytics and performance monitoring. These services are configured to respect user privacy and do not collect personally identifiable information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect against unauthorized access or disclosure of information. Since all processing happens in your browser, your files are as secure as your local device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of analytics</li>
              <li>Update your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@officetoolshub.com
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-8 border-t">
            Last updated: November 22, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
