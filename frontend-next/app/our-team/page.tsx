import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TEAM_MEMBERS } from '@/lib/data/team';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the team at Atrey Chambers of Law LLP — led by Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court of India.',
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
                href={`/our-team/${member.slug}`}
                className="group block rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm hover:shadow-lg hover:border-gold/30 transition-all"
              >
                <div className="mb-4 flex justify-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-28 h-28 rounded-full object-cover border-2 border-gold/20 group-hover:border-gold/50 transition-colors"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-deepGreen flex items-center justify-center border-2 border-gold/20">
                      <span className="text-3xl font-display font-bold text-cream">{member.initials}</span>
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
