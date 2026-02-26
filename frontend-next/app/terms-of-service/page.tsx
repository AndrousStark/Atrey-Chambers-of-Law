import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { assetPath } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for the Atrey Chambers of Law LLP website. Please read these terms carefully before using our website.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.atreychambers.com/terms-of-service' },
};

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-4xl px-4 md:px-10">
          <Breadcrumbs items={[{ label: 'Home', href: assetPath('/') }, { label: 'Terms of Service' }]} />

          <h1 className="text-3xl md:text-4xl font-display font-bold text-deepGreen mb-4">Terms of Service</h1>
          <div className="h-0.5 w-16 bg-gold mb-8" />
          <p className="text-sm text-charcoal/50 mb-10">Last updated: February 2026</p>

          <div className="prose prose-charcoal max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">1. Acceptance of Terms</h2>
              <p className="text-charcoal/70 leading-relaxed">
                By accessing and using the website of Atrey Chambers of Law LLP (www.atreychambers.com), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">2. BCI Disclaimer</h2>
              <p className="text-charcoal/70 leading-relaxed">
                As per the rules of the Bar Council of India, law firms are not permitted to solicit work or advertise. This website is meant solely for the purpose of information and not for the purpose of advertising. By clicking &quot;I Agree&quot; on our disclaimer, the user acknowledges that the information is being provided voluntarily and that no advertising, solicitation, or inducement is intended.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">3. No Attorney-Client Relationship</h2>
              <p className="text-charcoal/70 leading-relaxed">
                Use of this website or communication through it does not create an attorney-client relationship between you and Atrey Chambers of Law LLP. An attorney-client relationship is only established through a formal written engagement agreement signed by both parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">4. Informational Purpose Only</h2>
              <p className="text-charcoal/70 leading-relaxed">
                The content on this website is provided for general informational purposes only and does not constitute legal advice. The information may not reflect the most current legal developments. You should not act or rely on any information on this website without seeking the advice of a qualified attorney.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">5. Intellectual Property</h2>
              <p className="text-charcoal/70 leading-relaxed">
                All content on this website — including text, graphics, logos, icons, images, and software — is the property of Atrey Chambers of Law LLP and is protected by applicable copyright, trademark, and intellectual property laws. Unauthorized reproduction, distribution, or use of any content is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">6. Limitation of Liability</h2>
              <p className="text-charcoal/70 leading-relaxed">
                Atrey Chambers of Law LLP shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from or related to your use of this website. We do not guarantee the accuracy, completeness, or timeliness of any information on this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">7. External Links</h2>
              <p className="text-charcoal/70 leading-relaxed">
                This website may contain links to external websites. We have no control over the content or availability of such sites. Inclusion of any link does not imply endorsement by Atrey Chambers of Law LLP.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">8. Governing Law</h2>
              <p className="text-charcoal/70 leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts in Delhi, India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">9. Modifications</h2>
              <p className="text-charcoal/70 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on this website. Your continued use of the website after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-3">10. Contact</h2>
              <p className="text-charcoal/70 leading-relaxed">
                For questions about these Terms of Service, please contact us:<br />
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
