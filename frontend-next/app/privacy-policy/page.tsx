import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { assetPath } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy of Atrey Chambers of Law LLP. Learn how we collect, use, and protect your personal information.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.atreychambers.com/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-4xl px-4 md:px-10">
          <Breadcrumbs items={[{ label: 'Home', href: assetPath('/') }, { label: 'Privacy Policy' }]} />

          <h1 className="text-3xl md:text-4xl font-display font-bold text-deepGreen mb-4">Privacy Policy</h1>
          <div className="h-0.5 w-16 bg-gold mb-8" />
          <p className="text-sm text-charcoal/50 mb-10">Last updated: February 2026</p>

          <div className="prose prose-charcoal max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">1. Introduction</h2>
              <p className="text-charcoal/70 leading-relaxed">
                Atrey Chambers of Law LLP (&quot;we,&quot; &quot;our,&quot; or &quot;the Firm&quot;) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (www.atreychambers.com) or engage our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">2. Information We Collect</h2>
              <p className="text-charcoal/70 leading-relaxed mb-3">We may collect the following categories of information:</p>
              <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and any information you provide through our contact forms or during consultations.</li>
                <li><strong>Case Information:</strong> Legal documents, case details, and other information shared in the course of our attorney-client relationship.</li>
                <li><strong>Technical Information:</strong> IP address, browser type, operating system, and browsing behavior collected automatically through cookies and analytics.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
                <li>To provide legal services and communicate about your matters</li>
                <li>To respond to inquiries submitted through our website</li>
                <li>To schedule consultations and manage appointments</li>
                <li>To send relevant legal updates and newsletters (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To comply with legal and regulatory obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">4. Attorney-Client Privilege</h2>
              <p className="text-charcoal/70 leading-relaxed">
                All information shared within the attorney-client relationship is protected by attorney-client privilege under the Advocates Act, 1961 and the Bar Council of India rules. We will never disclose privileged information without your express written consent, except as required by law or court order.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">5. Data Security</h2>
              <p className="text-charcoal/70 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of electronic transmission or storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">6. Cookies and Analytics</h2>
              <p className="text-charcoal/70 leading-relaxed">
                Our website may use cookies and similar tracking technologies to enhance your browsing experience and gather analytics. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">7. Third-Party Links</h2>
              <p className="text-charcoal/70 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of such external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">8. Your Rights</h2>
              <p className="text-charcoal/70 leading-relaxed">
                Under applicable Indian law including the Digital Personal Data Protection Act, 2023, you have the right to access, correct, and request deletion of your personal data. To exercise these rights, please contact us at the details below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">9. Changes to This Policy</h2>
              <p className="text-charcoal/70 leading-relaxed">
                We may update this Privacy Policy from time to time. The updated version will be indicated by the &quot;Last updated&quot; date. We encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">10. Contact Us</h2>
              <p className="text-charcoal/70 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us:<br />
                Atrey Chambers of Law LLP<br />
                24, Gyan Kunj, Basement, Laxmi Nagar, Delhi - 110092<br />
                Email: <a href="mailto:support@atreychambers.com" className="text-gold hover:underline">support@atreychambers.com</a><br />
                Phone: <a href="tel:+911122053080" className="text-gold hover:underline">+91-11-22053080</a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
