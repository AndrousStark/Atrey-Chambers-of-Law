import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TEAM_MEMBERS } from '@/lib/data/team';
import { Badge } from '@/components/ui/Badge';
import { assetPath } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team — Dr. Abhishek Atrey, Mrs. Ambika Atrey & Mr. Aniruddh Atrey',
  description: 'Meet the Atrey family legal team at Atrey Chambers of Law LLP. Led by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Abhishek / Atrey), LL.D., Advocate-on-Record, Supreme Court of India. Mrs. Ambika Atrey serves as Senior Partner — wife of Dr. Abhishek Atrey. Mr. Aniruddh Atrey works as Associate — son of Dr. Abhishek Atrey and Mrs. Ambika Atrey. Mr. Atrey\'s leadership and 29+ years of experience guide every case. A family of legal professionals serving India.',
  keywords: ['Dr. Abhishek Atrey', 'Abhishek Atrey', 'Mr. Atrey', 'Mr. Abhishek', 'Abhishek', 'Atrey', 'Mrs. Ambika Atrey', 'Ambika Atrey', 'Mr. Aniruddh Atrey', 'Aniruddh Atrey', 'Atrey family', 'Atrey Chambers team', 'Dr. Atrey law firm team', 'Atrey advocates', 'A. Atrey', 'Mr. A. Atrey', 'son of Dr. Abhishek Atrey', 'wife of Abhishek Atrey'],
  openGraph: {
    title: 'Our Team — Dr. Abhishek Atrey, Mrs. Ambika Atrey & Mr. Aniruddh Atrey',
    description: 'The Atrey family legal team. Led by Advocate Abhishek Atrey, AOR Supreme Court. Mrs. Ambika Atrey, Mr. Aniruddh Atrey.',
    url: 'https://www.atreychambers.com/our-team',
  },
  alternates: { canonical: 'https://www.atreychambers.com/our-team' },
};

export default function OurTeamPage() {
  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          {/* Hero banner */}
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Our Team
            </h1>
            <div className="h-0.5 w-16 bg-gold mx-auto mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              A distinguished team of legal professionals dedicated to excellence
            </p>
          </div>

          {/* Team cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {TEAM_MEMBERS.map((member) => (
              <a
                key={member.slug}
                href={assetPath(`/our-team/${member.slug}`)}
                className="group block rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm hover:shadow-lg hover:border-gold/30 transition-all"
              >
                <div className="mb-5 flex justify-center">
                  {member.photo ? (
                    <div className="w-36 h-44 rounded-xl overflow-hidden border-2 border-gold/20 group-hover:border-gold/50 transition-colors shadow-sm">
                      <img
                        src={assetPath(member.photo!)}
                        alt={member.name}
                        className="w-full h-full object-cover object-[center_15%]"
                      />
                    </div>
                  ) : (
                    <div className="w-36 h-44 rounded-xl bg-deepGreen flex items-center justify-center border-2 border-gold/20">
                      <span className="text-4xl font-display font-bold text-cream">{member.initials}</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-display font-bold text-deepGreen mb-1">
                    {member.name}
                  </h2>
                  <p className="text-sm text-gold font-semibold mb-1">{member.title}</p>
                  <p className="text-xs text-charcoal/50 mb-3">{member.degrees}</p>
                  {member.slug === 'abhishek-atrey' && (
                    <Badge variant="gold" size="sm">Advocate-on-Record, Supreme Court</Badge>
                  )}
                  <p className="mt-4 text-sm text-deepGreen font-semibold group-hover:underline">
                    View Profile &rarr;
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
