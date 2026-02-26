'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getTeamMember } from '@/lib/data/team';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { notFound } from 'next/navigation';

export default function AniruddhAtreyPage() {
  const member = getTeamMember('aniruddh-atrey');
  if (!member) return notFound();

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Main content */}
            <div>
              {/* Header */}
              <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                {member.photo && (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover shadow-md border-2 border-gold/20"
                  />
                )}
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-deepGreen mb-1">
                    {member.name}
                  </h1>
                  <p className="text-lg text-gold font-semibold mb-1">{member.title}</p>
                  <p className="text-charcoal/60 mb-3">{member.subtitle}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="gold">{member.degrees}</Badge>
                    <Badge variant="green">Webby Winner 2025</Badge>
                    <Badge variant="green">GSAP SOTM</Badge>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4 mb-10">
                {member.bio.map((para, i) => (
                  <p key={i} className="text-charcoal/80 leading-relaxed">{para}</p>
                ))}
              </div>

              {/* Certifications Grid */}
              {member.certifications && (
                <div className="mb-10">
                  <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">
                    Certifications ({member.certifications.length}+)
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {member.certifications.map((cert, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-charcoal/10 hover:border-gold/30 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-charcoal">{cert.name}</p>
                          <p className="text-xs text-charcoal/50">{cert.issuer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {member.skills && (
                <div className="mb-10">
                  <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">Technical Expertise</h2>
                  <div className="space-y-4">
                    {member.skills.map((category, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider mb-2">
                          {category.category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((skill, j) => (
                            <Badge key={j} variant="subtle" size="sm">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publications */}
              {member.publications && member.publications.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">Publications</h2>
                  <div className="space-y-3">
                    {member.publications.map((pub, i) => (
                      <div key={i} className="p-4 rounded-lg border border-charcoal/10">
                        <p className="font-medium text-charcoal">{pub.title}</p>
                        <p className="text-sm text-charcoal/50 mt-1">{pub.source} ({pub.year})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {member.achievements && (
                <div>
                  <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">Achievements</h2>
                  <div className="space-y-3">
                    {member.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-creamWarm/50">
                        <span className="text-gold">&#9733;</span>
                        <p className="text-charcoal/80">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-lg border border-gold/20 bg-gradient-to-b from-creamWarm to-cream p-6">
                <h3 className="font-display font-semibold text-deepGreen mb-4">Connect</h3>
                <div className="space-y-3">
                  {member.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-deepGreen transition-colors"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-charcoal/10 p-6">
                <h3 className="font-display font-semibold text-deepGreen mb-4">Key Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  {member.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-2xl font-display font-bold text-gold">{stat.value}</p>
                      <p className="text-xs text-charcoal/60 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-charcoal/10 p-6">
                <h3 className="font-display font-semibold text-deepGreen mb-3">Education</h3>
                {member.education.map((edu, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <p className="text-sm font-medium text-charcoal">{edu.degree}</p>
                    <p className="text-xs text-charcoal/50">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
