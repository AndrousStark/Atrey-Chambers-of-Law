'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AttorneyProfile } from '@/components/AttorneyProfile';
import { getTeamMember } from '@/lib/data/team';
import { notFound } from 'next/navigation';

export default function AmbikaAtreyPage() {
  const member = getTeamMember('ambika-atrey');
  if (!member) return notFound();

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <AttorneyProfile member={member} />
        </div>
      </main>
      <Footer />
    </>
  );
}
