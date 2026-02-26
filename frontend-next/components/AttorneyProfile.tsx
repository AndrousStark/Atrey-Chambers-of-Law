'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { type TeamMember } from '@/lib/data/team';
import { assetPath } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';

interface AttorneyProfileProps {
  member: TeamMember;
}

type TabKey = 'overview' | 'credentials' | 'practice' | 'publications' | 'media' | 'awards';

export const AttorneyProfile = ({ member }: AttorneyProfileProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: 'overview', label: 'Overview', show: true },
    { key: 'credentials', label: 'Credentials', show: true },
    { key: 'practice', label: 'Practice Areas', show: member.practiceAreas.length > 0 },
    { key: 'publications', label: 'Publications', show: !!(member.books?.length || member.articles?.length || member.publications?.length) },
    { key: 'media', label: 'Media', show: !!(member.mediaAppearances?.length) },
    { key: 'awards', label: 'Awards', show: !!(member.achievements?.length) },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] overflow-x-hidden">
      {/* Main content */}
      <div>
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          {member.photo ? (
            <img
              src={assetPath(member.photo!)}
              alt={member.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover shadow-md border-2 border-gold/20"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-deepGreen flex items-center justify-center shadow-md">
              <span className="text-4xl font-display font-bold text-cream">{member.initials}</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-deepGreen mb-1">
              {member.name}
            </h1>
            <p className="text-lg text-gold font-semibold mb-1">{member.title}</p>
            <p className="text-charcoal/60 mb-3">{member.subtitle}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="gold">{member.degrees}</Badge>
              {member.empanelments && <Badge variant="green">AOR, Supreme Court</Badge>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-charcoal/10 mb-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-gold text-deepGreen'
                    : 'border-transparent text-charcoal/50 hover:text-charcoal hover:border-charcoal/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {member.bio.map((para, i) => (
                  <p key={i} className="text-charcoal/80 leading-relaxed">{para}</p>
                ))}
              </div>
            )}

            {activeTab === 'credentials' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Education</h3>
                  <div className="space-y-3">
                    {member.education.map((edu, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-creamWarm/50">
                        <div className="h-2 w-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-charcoal">{edu.degree}</p>
                          <p className="text-sm text-charcoal/60">{edu.institution}{edu.year ? ` (${edu.year})` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Experience</h3>
                  <div className="space-y-3">
                    {member.experience.map((exp, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-creamWarm/50">
                        <div className="h-2 w-2 rounded-full bg-deepGreen mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-charcoal">{exp.role}</p>
                          <p className="text-sm text-gold">{exp.org}</p>
                          {exp.period && <p className="text-xs text-charcoal/50">{exp.period}</p>}
                          {exp.detail && <p className="text-sm text-charcoal/60 mt-1">{exp.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {member.empanelments && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Government Empanelments</h3>
                    <ul className="space-y-2">
                      {member.empanelments.map((emp, i) => (
                        <li key={i} className="flex items-start gap-3 text-charcoal/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                          {emp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'practice' && (
              <div className="grid gap-3 md:grid-cols-2">
                {member.practiceAreas.map((area, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-deepGreen/10 hover:border-gold/30 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-gold flex-shrink-0" />
                    <span className="font-medium text-charcoal">{area}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'publications' && (
              <div className="space-y-8">
                {member.books && member.books.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Books</h3>
                    <div className="space-y-4">
                      {member.books.map((book, i) => (
                        <div key={i} className="p-4 rounded-lg border border-gold/20 bg-gradient-to-r from-creamWarm/50 to-transparent">
                          <p className="font-semibold text-charcoal font-display">{book.title}</p>
                          <p className="text-sm text-charcoal/60 mt-1">{book.publisher} ({book.year})</p>
                          {book.foreword && (
                            <p className="text-sm text-gold mt-1 font-accent italic">Foreword by {book.foreword}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {member.articles && member.articles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Articles ({member.articles.length})</h3>
                    <div className="space-y-2">
                      {member.articles.map((article, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-charcoal/5 last:border-0">
                          <span className="text-xs text-charcoal/40 w-20 flex-shrink-0">{article.year}</span>
                          <div>
                            <p className="text-sm font-medium text-charcoal">{article.title}</p>
                            <p className="text-xs text-charcoal/50">{article.source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {member.publications && member.publications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Publications</h3>
                    <div className="space-y-2">
                      {member.publications.map((pub, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-charcoal/5 last:border-0">
                          <span className="text-xs text-charcoal/40 w-12 flex-shrink-0">{pub.year}</span>
                          <div>
                            <p className="text-sm font-medium text-charcoal">{pub.title}</p>
                            <p className="text-xs text-charcoal/50">{pub.source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'media' && member.mediaAppearances && (
              <div>
                <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">
                  Television Appearances ({member.mediaAppearances.length} shows)
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {member.mediaAppearances.map((appearance, i) => (
                    <div key={i} className="p-4 rounded-lg border border-charcoal/10 hover:border-gold/30 transition-colors">
                      <p className="font-semibold text-charcoal">{appearance.show}</p>
                      <p className="text-sm text-gold">{appearance.channel}</p>
                      <p className="text-xs text-charcoal/50 mt-1">{appearance.dates}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'awards' && member.achievements && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Achievements & Awards</h3>
                  <div className="space-y-3">
                    {member.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-creamWarm/50">
                        <span className="text-gold text-lg">&#9733;</span>
                        <p className="text-charcoal/80">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {member.speakingEngagements && member.speakingEngagements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-deepGreen mb-4">Speaking Engagements</h3>
                    <ul className="space-y-2">
                      {member.speakingEngagements.map((engagement, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-charcoal/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-deepGreen mt-1.5 flex-shrink-0" />
                          {engagement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <div className="rounded-lg border border-gold/20 bg-gradient-to-b from-creamWarm to-cream p-6">
          <h3 className="font-display font-semibold text-deepGreen mb-4">Contact</h3>
          <div className="space-y-3">
            {member.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-deepGreen transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {link.label}
              </a>
            ))}
          </div>
          <Divider variant="gold" width="full" className="my-4" />
          <a
            href="/schedule"
            className="block w-full text-center rounded bg-deepGreen py-2.5 text-sm font-semibold text-cream hover:bg-deepGreenLight transition-colors"
          >
            Schedule Consultation
          </a>
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
          <h3 className="font-display font-semibold text-deepGreen mb-3">Office</h3>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            24, Gyan Kunj, Basement,<br />
            Laxmi Nagar, Delhi - 110092
          </p>
          <p className="text-sm text-charcoal/70 mt-2">
            +91-11-22053080, 22023821
          </p>
        </div>
      </aside>
    </div>
  );
};
