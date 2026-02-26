'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { assetPath } from '@/lib/utils';
import { generateContactPointSchema, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/schema';

const contactSchema = generateContactPointSchema();
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
]);
const pageSchema = generateWebPageSchema({
  name: 'Contact Us',
  description: 'Get in touch with Atrey Chambers of Law LLP for legal consultation.',
  url: '/contact',
});

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const validate = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'name': return !value.trim() ? 'Name is required' : '';
      case 'email': {
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      }
      case 'message': return !value.trim() ? 'Message is required' : '';
      default: return '';
    }
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touchedFields[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: validate(field, value) }));
    }
  }, [touchedFields, validate]);

  const handleBlur = useCallback((field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    setFieldErrors(prev => ({ ...prev, [field]: validate(field, formData[field as keyof typeof formData]) }));
  }, [formData, validate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validate('name', formData.name);
    const emailErr = validate('email', formData.email);
    const msgErr = validate('message', formData.message);
    setFieldErrors({ name: nameErr, email: emailErr, message: msgErr });
    setTouchedFields({ name: true, email: true, message: true });
    if (nameErr || emailErr || msgErr) return;

    const subject = encodeURIComponent(formData.subject || `Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\n${formData.message}`
    );
    window.open(`mailto:support@atreychambers.com?subject=${subject}&body=${body}`, '_blank');
  };

  const inputClasses = (field: string) =>
    `w-full rounded-lg border ${fieldErrors[field] ? 'border-red-400' : 'border-charcoal/15'} bg-white px-4 py-3 text-sm text-charcoal placeholder-charcoal/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Breadcrumbs items={[{ label: 'Home', href: assetPath('/') }, { label: 'Contact' }]} />

          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Get in <span className="text-gold">Touch</span>
            </h1>
            <div className="h-0.5 w-16 bg-gold mx-auto mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              Schedule a consultation or reach out with any inquiry
            </p>
          </div>

          {/* 3-Column Info Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            <div className="rounded-lg border border-charcoal/10 bg-white p-8 text-center hover:shadow-md hover:border-gold/30 transition-all">
              <div className="w-14 h-14 rounded-full bg-deepGreen/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-deepGreen">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-deepGreen mb-2">Call Us</h3>
              <a href="tel:+911122053080" className="block text-charcoal/70 hover:text-deepGreen transition-colors">+91-11-22053080</a>
              <a href="tel:+911122023821" className="block text-charcoal/70 hover:text-deepGreen transition-colors">+91-11-22023821</a>
            </div>
            <div className="rounded-lg border border-charcoal/10 bg-white p-8 text-center hover:shadow-md hover:border-gold/30 transition-all">
              <div className="w-14 h-14 rounded-full bg-deepGreen/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-deepGreen">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-deepGreen mb-2">Email Us</h3>
              <a href="mailto:support@atreychambers.com" className="text-charcoal/70 hover:text-deepGreen transition-colors">
                support@atreychambers.com
              </a>
              <p className="text-xs text-charcoal/40 mt-2">Typically respond within 24 hours</p>
            </div>
            <div className="rounded-lg border border-charcoal/10 bg-white p-8 text-center hover:shadow-md hover:border-gold/30 transition-all">
              <div className="w-14 h-14 rounded-full bg-deepGreen/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-deepGreen">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-deepGreen mb-2">Visit Us</h3>
              <p className="text-charcoal/70 text-sm">
                24, Gyan Kunj, Basement,<br />
                Laxmi Nagar, Delhi - 110092
              </p>
              <p className="text-xs text-charcoal/40 mt-2">Mon–Sat, 10 AM – 6 PM</p>
            </div>
          </div>

          {/* Contact Form + Map */}
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-lg border border-charcoal/10 bg-white p-8">
              <h2 className="text-xl font-display font-semibold text-deepGreen mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      aria-label="Your name"
                      aria-invalid={!!fieldErrors.name}
                      className={inputClasses('name')}
                    />
                    {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email *"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      aria-label="Your email"
                      aria-invalid={!!fieldErrors.email}
                      className={inputClasses('email')}
                    />
                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    aria-label="Phone number"
                    className={inputClasses('phone')}
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    aria-label="Subject"
                    className={inputClasses('subject')}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message *"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    aria-label="Your message"
                    aria-invalid={!!fieldErrors.message}
                    className={`${inputClasses('message')} resize-none`}
                  />
                  {fieldErrors.message && <p className="text-red-500 text-xs mt-1">{fieldErrors.message}</p>}
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-deepGreen px-8 py-3 text-sm font-semibold text-cream hover:bg-deepGreenLight transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden border border-charcoal/10 bg-white">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.1234567890!2d77.2773!3d28.6304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM3JzQ5LjQiTiA3N8KwMTYnMzguMyJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 400 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Atrey Chambers Office Location — Laxmi Nagar, Delhi"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
