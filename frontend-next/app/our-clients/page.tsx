'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Divider } from '@/components/ui/Divider';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';

const clientCategories = [
  {
    title: 'Government of India',
    icon: '&#127470;&#127475;',
    clients: [
      'Union of India',
      'Ministry of Environment, Forest & Climate Change',
      'Indian Space Research Organization (ISRO)',
      'Ministry of Railways',
      'Indian Army',
      'National Security Guard (NSG)',
      'Indian Postal Services',
      'Comptroller and Auditor General',
    ],
  },
  {
    title: 'State Governments',
    icon: '&#127963;',
    clients: [
      'State of Uttarakhand',
      'NCT of Delhi',
      'State of Punjab',
      'Punjab Police',
      'Chandigarh Administration',
    ],
  },
  {
    title: 'Regulatory Bodies & Commissions',
    icon: '&#9878;',
    clients: [
      'Commission for Air Quality Management (CAQM)',
      'Association of Indian Universities (AIU)',
      'NOIDA Authority',
    ],
  },
  {
    title: 'Corporate & Infrastructure',
    icon: '&#127970;',
    clients: [
      'Mumbai International Airport Pvt. Ltd.',
      'Pipavav Railway Corporation',
      'Spirotech Heat Exchangers',
      'Chemet Companies (Ahmedabad)',
      'Kalptaru Builders (Mumbai)',
      'Azure Tree Township',
      'Uttarakhand Urban Sector Development Investment Agency (ADB-funded)',
      'Uttarakhand Jal Sansthan',
      'Improvement Trust of Ludhiana',
    ],
  },
  {
    title: 'International',
    icon: '&#127758;',
    clients: [
      'Tethys Systems Ltd. (Zurich, Switzerland)',
      'Webieez Pte Ltd. (Singapore)',
    ],
  },
  {
    title: 'Financial & Cooperative Institutions',
    icon: '&#127974;',
    clients: [
      'Co-operative Agriculture Development Bank (Punjab)',
      'Punjab State Cooperative Bank',
      'The Morinda Co-operative Sugar Mill Ltd.',
      'The Nawanshahr Co-operative Sugar Mill Ltd.',
      'The Jagraon Co-operative Sugar Mill Ltd.',
      'The Bhogpur Co-operative Sugar Mill Ltd.',
      'The Budhewal Co-operative Sugar Mill Ltd.',
      'The Batala Co-operative Sugar Mill Ltd.',
      'The Nakodar Co-operative Sugar Mill Ltd.',
      'The Gurdaspur Co-operative Sugar Mill Ltd.',
      'The Ajnala Co-operative Sugar Mill Ltd.',
      'The Faridkot Co-operative Sugar Mill Ltd.',
      'The Moga Co-operative Sugar Mill Ltd.',
      'The Zira Co-operative Sugar Mill Ltd.',
      'The Bhola Co-operative Sugar Mill Ltd.',
    ],
  },
  {
    title: 'NGOs & Foundations',
    icon: '&#10084;',
    clients: [
      'Nagrik Chetna Manch (NGO, Pune)',
      'Ramjas Foundation (Delhi)',
      'Dera Sachcha Sauda',
    ],
  },
];

export default function OurClientsPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Our Esteemed Clients
            </h1>
            <Divider variant="gold" width="md" align="center" className="mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              Trusted by government bodies, corporations, and institutions across India and internationally
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {clientCategories.map((category) => (
              <motion.div
                key={category.title}
                variants={prefersReducedMotion ? {} : fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: category.icon }} />
                  <h2 className="text-lg font-display font-semibold text-deepGreen">{category.title}</h2>
                </div>
                <Divider variant="gold" width="sm" align="left" className="mb-4" />
                <ul className="space-y-2">
                  {category.clients.map((client) => (
                    <li key={client} className="flex items-start gap-2 text-sm text-charcoal/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                      {client}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
