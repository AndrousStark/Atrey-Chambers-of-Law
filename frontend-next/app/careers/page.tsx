import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JOB_OPENINGS, BENEFITS } from '@/lib/data/careers';
import { assetPath } from '@/lib/utils';
import { generateWebPageSchema, generateBreadcrumbSchema, generateJobPostingSchema } from '@/lib/schema';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers — Join Our Legal Team',
  description:
    'Explore career opportunities at Atrey Chambers of Law LLP. Join a premier Indian law firm with Supreme Court practice, mentorship by Dr. Abhishek Atrey, and 29+ years of legal excellence.',
  keywords: [
    'law firm careers India',
    'legal jobs Delhi',
    'advocate vacancy Supreme Court',
    'law firm internship Delhi',
    'legal career opportunities',
    'Atrey Chambers careers',
  ],
  openGraph: {
    title: 'Careers at Atrey Chambers of Law LLP',
    description: 'Join a premier Indian law firm with direct Supreme Court exposure and mentorship.',
    url: 'https://www.atreychambers.com/careers',
  },
  alternates: { canonical: 'https://www.atreychambers.com/careers' },
};

export default function CareersPage() {
  const pageSchema = generateWebPageSchema({
    name: 'Careers',
    description: 'Career opportunities at Atrey Chambers of Law LLP',
    url: '/careers',
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Careers', url: '/careers' },
  ]);
  const jobSchemas = JOB_OPENINGS.map((job) =>
    generateJobPostingSchema({
      title: job.title,
      description: job.description,
      datePosted: job.datePosted,
      validThrough: job.validThrough,
      employmentType: job.type === 'Internship' ? 'INTERN' : 'FULL_TIME',
      experienceRequirements: job.experience,
    })
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {jobSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Breadcrumbs items={[{ label: 'Home', href: assetPath('/') }, { label: 'Careers' }]} />

          {/* Hero */}
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Join Our <span className="text-gold">Legal Team</span>
            </h1>
            <div className="h-0.5 w-16 bg-gold mx-auto mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              Build your legal career at a firm with 29+ years of Supreme Court excellence
            </p>
          </div>

          {/* Why Join Us */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-deepGreen mb-8 text-center">
              Why Join Atrey Chambers?
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="p-6 rounded-lg border border-charcoal/10 bg-white hover:border-gold/30 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-deepGreen/5 flex items-center justify-center mb-4">
                    <span className="text-xl text-deepGreen">&#9878;</span>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-deepGreen mb-2">{benefit.title}</h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-deepGreen mb-8 text-center">
              Open Positions
            </h2>
            <div className="space-y-6">
              {JOB_OPENINGS.map((job) => (
                <details key={job.id} className="group rounded-lg border border-charcoal/10 bg-white overflow-hidden">
                  <summary className="flex flex-col md:flex-row md:items-center justify-between cursor-pointer p-6 hover:bg-creamWarm/30 transition-colors">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-deepGreen group-hover:text-gold transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-charcoal/50 bg-cream rounded-full px-3 py-1">
                          {job.department}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-charcoal/50 bg-cream rounded-full px-3 py-1">
                          {job.type}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-charcoal/50 bg-cream rounded-full px-3 py-1">
                          {job.experience}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-charcoal/50 bg-cream rounded-full px-3 py-1">
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="flex-shrink-0 mt-2 md:mt-0 text-charcoal/30 transition-transform group-open:rotate-180"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 border-t border-charcoal/5">
                    <p className="mt-4 text-charcoal/70 leading-relaxed">{job.description}</p>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold text-deepGreen mb-3">Responsibilities</h4>
                        <ul className="space-y-2">
                          {job.responsibilities.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70">
                              <span className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-deepGreen mb-3">Qualifications</h4>
                        <ul className="space-y-2">
                          {job.qualifications.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70">
                              <span className="h-1.5 w-1.5 rounded-full bg-deepGreen mt-1.5 flex-shrink-0" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6">
                      <a
                        href={`mailto:support@atreychambers.com?subject=Application: ${encodeURIComponent(job.title)}`}
                        className="inline-block rounded bg-deepGreen px-6 py-2.5 text-sm font-semibold text-cream hover:bg-deepGreenLight transition-colors"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* General Application CTA */}
          <div className="rounded-lg bg-deepGreen p-8 md:p-12 text-center">
            <h3 className="text-xl md:text-2xl font-display font-bold text-cream mb-3">
              Don&apos;t See a Fit?
            </h3>
            <p className="text-cream/70 mb-6 max-w-lg mx-auto">
              We&apos;re always looking for talented legal professionals. Send us your resume and we&apos;ll keep you in mind for future opportunities.
            </p>
            <a
              href="mailto:support@atreychambers.com?subject=General Application — Atrey Chambers"
              className="inline-block rounded bg-gold px-8 py-3 text-sm font-semibold text-white hover:bg-goldLight transition-colors"
            >
              Send Your Resume
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
