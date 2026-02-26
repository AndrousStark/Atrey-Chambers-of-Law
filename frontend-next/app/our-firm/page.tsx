'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatsSection } from '@/components/StatsSection';
import { NumberTicker } from '@/components/ui/NumberTicker';
import { Divider } from '@/components/ui/Divider';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';

const timeline = [
  { year: '1997', event: 'Dr. Abhishek Atrey enrolled with Bar Council of Delhi' },
  { year: '2006', event: 'Designated as Advocate-on-Record by Supreme Court of India' },
  { year: '2007', event: 'Appointed Standing Counsel for Govt. of Uttarakhand in Supreme Court' },
  { year: '2008', event: 'Atrey Chambers of Law LLP registered under LLP Act, 2008' },
  { year: '2009', event: 'Mrs. Ambika Atrey enrolled with Bar Council of Delhi; joins as Partner' },
  { year: '2014', event: "Appointed 'A' Panel Counsel for Government of India at Supreme Court" },
  { year: '2015', event: 'Appointed Standing Counsel for MoEFCC at National Green Tribunal' },
  { year: '2020', event: 'Appointed Panel Counsel for Association of Indian Universities' },
  { year: '2021', event: "Awarded 'Nyaymurti Prem Shankar Gupt Hindi Sahitya Samman'" },
  { year: '2022', event: 'Appointed Sr. Panel Counsel for CAQM — Delhi HC & NGT' },
];

const clientCategories = [
  {
    title: 'Government of India',
    clients: ['Union of India', 'Ministry of Environment, Forest & Climate Change', 'ISRO', 'Ministry of Railways', 'Indian Army', 'National Security Guard', 'Indian Postal Services', 'Comptroller and Auditor General'],
  },
  {
    title: 'State Governments',
    clients: ['State of Uttarakhand', 'NCT of Delhi', 'State of Punjab', 'Punjab Police', 'Chandigarh Administration'],
  },
  {
    title: 'Regulatory Bodies',
    clients: ['Commission for Air Quality Management (CAQM)', 'Association of Indian Universities (AIU)', 'NOIDA Authority'],
  },
  {
    title: 'International',
    clients: ['Tethys Systems Ltd. (Zurich, Switzerland)', 'Webieez Pte Ltd. (Singapore)'],
  },
];

export default function OurFirmPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-0 bg-cream min-h-screen">
        {/* Hero */}
        <div className="mx-auto max-w-7xl px-4 md:px-10 mb-16">
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              About Our Firm
            </h1>
            <Divider variant="gold" width="md" align="center" className="mb-4" />
            <p className="max-w-3xl mx-auto text-lg text-charcoal/70 font-accent italic">
              A legacy of legal excellence, built on integrity and dedication since 1997
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <p className="text-lg leading-relaxed text-charcoal/80 mb-6">
              <strong className="font-display">Atrey Chambers of Law LLP</strong> is a premier full-service Indian law firm registered under the Limited Liability Partnership Act, 2008. Founded by Dr. Abhishek Atrey, LL.D., Advocate-on-Record, our firm combines nearly three decades of distinguished legal practice with a commitment to delivering strategic, results-oriented legal counsel.
            </p>
            <p className="text-lg leading-relaxed text-charcoal/80 mb-6">
              With our founding partner designated as Advocate-on-Record by the Supreme Court of India, we provide direct filing and comprehensive representation before the apex court. Our deep relationships with government bodies — as &apos;A&apos; Panel Counsel for the Government of India, Standing Counsel for State Governments, and Panel Counsel for regulatory bodies — give us unmatched institutional expertise.
            </p>
            <p className="text-lg leading-relaxed text-charcoal/80">
              Our philosophy is simple: combine scholarly depth with courtroom experience, treat every client&apos;s cause as our own, and never compromise on integrity. This approach has earned us the trust of governments, corporations, institutions, and individuals for over two decades.
            </p>
          </motion.div>

          {/* Leadership preview */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3 mb-16"
          >
            <a href="/our-team/abhishek-atrey" className="group rounded-lg border border-gold/20 bg-white p-6 text-center hover:shadow-lg hover:border-gold/40 transition-all">
              <img src="/dr-abhishek-atrey.jpg" alt="Dr. Abhishek Atrey" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gold/20 group-hover:border-gold/50 transition-colors" />
              <h3 className="font-display font-bold text-deepGreen">Dr. Abhishek Atrey</h3>
              <p className="text-sm text-gold">Founder & Managing Partner</p>
              <p className="text-xs text-charcoal/50 mt-1">LL.D., AOR Supreme Court</p>
            </a>
            <a href="/our-team/ambika-atrey" className="group rounded-lg border border-gold/20 bg-white p-6 text-center hover:shadow-lg hover:border-gold/40 transition-all">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-deepGreen flex items-center justify-center border-2 border-gold/20">
                <span className="text-2xl font-display font-bold text-cream">AA</span>
              </div>
              <h3 className="font-display font-bold text-deepGreen">Mrs. Ambika Atrey</h3>
              <p className="text-sm text-gold">Partner</p>
              <p className="text-xs text-charcoal/50 mt-1">M.Com., LL.M.</p>
            </a>
            <a href="/our-team/aniruddh-atrey" className="group rounded-lg border border-gold/20 bg-white p-6 text-center hover:shadow-lg hover:border-gold/40 transition-all">
              <img src="/aniruddh-atrey.png" alt="Aniruddh Atrey" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gold/20 group-hover:border-gold/50 transition-colors" />
              <h3 className="font-display font-bold text-deepGreen">Aniruddh Atrey</h3>
              <p className="text-sm text-gold">Director of Technology</p>
              <p className="text-xs text-charcoal/50 mt-1">M.S. CS (UF), B.Tech</p>
            </a>
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-display font-bold text-deepGreen text-center mb-8">Our History</h2>
            <div className="max-w-3xl mx-auto">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6 mb-4 last:mb-0">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gold w-12 text-right">{item.year}</span>
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-gold/20 mt-2" />}
                  </div>
                  <p className="text-charcoal/80 pb-4">{item.event}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Client categories */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-display font-bold text-deepGreen text-center mb-8">Our Clientele</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {clientCategories.map((cat) => (
                <div key={cat.title} className="rounded-lg border border-charcoal/10 bg-white p-6">
                  <h3 className="font-display font-semibold text-gold mb-3">{cat.title}</h3>
                  <ul className="space-y-1.5">
                    {cat.clients.map((client) => (
                      <li key={client} className="flex items-start gap-2 text-sm text-charcoal/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-deepGreen mt-1.5 flex-shrink-0" />
                        {client}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Offices */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-display font-bold text-deepGreen text-center mb-8">Our Office</h2>
            <div className="max-w-lg mx-auto rounded-lg border border-charcoal/10 bg-white p-6 text-center">
              <h3 className="font-display font-semibold text-deepGreen mb-2">Delhi Office</h3>
              <p className="text-charcoal/70">24, Gyan Kunj, Basement, Laxmi Nagar, Delhi - 110092</p>
              <p className="text-charcoal/70 mt-1">+91-11-22053080, 22023821</p>
              <p className="text-charcoal/70 mt-1">support@atreychambers.com</p>
            </div>
          </motion.div>
        </div>

        <StatsSection />
      </main>
      <Footer />
    </>
  );
}
