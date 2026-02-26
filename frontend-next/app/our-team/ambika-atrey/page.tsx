'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AttorneyProfile } from '@/components/AttorneyProfile';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getTeamMember } from '@/lib/data/team';
import { assetPath } from '@/lib/utils';
import { generatePersonSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { notFound } from 'next/navigation';

export default function AmbikaAtreyPage() {
  const member = getTeamMember('ambika-atrey');
  if (!member) return notFound();

  const personSchema = generatePersonSchema(member);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Our Team', url: '/our-team' },
    { name: member.name, url: `/our-team/${member.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Breadcrumbs
            items={[
              { label: 'Home', href: assetPath('/') },
              { label: 'Our Team', href: assetPath('/our-team') },
              { label: member.name },
            ]}
          />
          <AttorneyProfile member={member} />
        </div>
      </main>
      <Footer />
    </>
  );
}
