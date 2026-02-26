'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Divider } from '@/components/ui/Divider';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';

const legalAwards = [
  {
    title: "Nyaymurti Prem Shankar Gupt Hindi Sahitya Samman",
    org: "Akhil Bhartiya Hindi Vidhi Pratishthan",
    year: "2021",
    description: "Awarded for outstanding contribution to Hindi legal literature, recognizing Dr. Atrey's books and articles advancing legal scholarship in Hindi.",
  },
  {
    title: "Drafted Municipal Bye-Laws for NOIDA Authority",
    org: "NOIDA Authority",
    year: "",
    description: "Entrusted with drafting the comprehensive municipal bye-laws for one of India's largest planned cities, reflecting deep expertise in administrative and municipal law.",
  },
];

const governmentTimeline = [
  { year: '1997', title: 'Bar Council of Delhi Enrollment', detail: 'Enrolled as Advocate' },
  { year: '2006', title: 'Advocate-on-Record, Supreme Court', detail: 'Designated by the Supreme Court of India' },
  { year: '2007', title: 'Standing Counsel, Govt. of Uttarakhand', detail: 'Supreme Court of India' },
  { year: '2014', title: "'A' Panel Counsel, Government of India", detail: 'Supreme Court of India' },
  { year: '2015', title: 'Standing Counsel, MoEFCC', detail: 'National Green Tribunal (2015–2018)' },
  { year: '2020', title: 'Panel Counsel, AIU', detail: 'Supreme Court & Delhi High Court' },
  { year: '2022', title: 'Sr. Panel Counsel, CAQM', detail: 'Delhi High Court & NGT' },
];

const techAwards = [
  {
    title: '2025 Webby Awards Winner — Best Home Page',
    recipient: 'Aniruddh Atrey',
    description: 'International recognition for outstanding web design and user experience.',
  },
  {
    title: 'GSAP Site of the Month — Oct & Nov 2024',
    recipient: 'Aniruddh Atrey',
    description: 'Recognized by GreenSock for exceptional animation implementation.',
  },
];

export default function AwardsPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Awards & Recognition
            </h1>
            <Divider variant="gold" width="md" align="center" className="mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              A legacy of excellence recognized across legal, academic, and technology domains
            </p>
          </div>

          {/* Legal Awards */}
          <motion.section
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-display font-bold text-deepGreen mb-8">Legal Awards & Achievements</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {legalAwards.map((award, i) => (
                <div key={i} className="rounded-lg border border-gold/20 bg-white p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl text-gold">&#9733;</span>
                    <div>
                      <h3 className="font-display font-semibold text-deepGreen">{award.title}</h3>
                      <p className="text-sm text-gold">{award.org} {award.year && `(${award.year})`}</p>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal/70 leading-relaxed">{award.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Government Appointments Timeline */}
          <motion.section
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-display font-bold text-deepGreen mb-8">Government Appointments</h2>
            <div className="max-w-3xl mx-auto">
              {governmentTimeline.map((item, i) => (
                <div key={i} className="flex gap-6 mb-6 last:mb-0">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-display font-bold text-gold w-12 text-right">{item.year}</span>
                    {i < governmentTimeline.length - 1 && <div className="w-px flex-1 bg-gold/20 mt-2" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-charcoal">{item.title}</p>
                    <p className="text-sm text-charcoal/50">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Technology Awards */}
          <motion.section
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-display font-bold text-deepGreen mb-8">Technology Awards</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {techAwards.map((award, i) => (
                <div key={i} className="rounded-lg border border-charcoal/10 bg-white p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-display font-semibold text-deepGreen mb-1">{award.title}</h3>
                  <p className="text-sm text-gold mb-2">{award.recipient}</p>
                  <p className="text-sm text-charcoal/70">{award.description}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  );
}
