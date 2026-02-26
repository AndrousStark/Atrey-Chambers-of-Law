'use client';

import { useState, useCallback } from 'react';
import { Divider } from '@/components/ui/Divider';
import { assetPath } from '@/lib/utils';

export const Footer = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const validateFooterField = useCallback((field: string, value: string): string => {
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

  const handleFooterFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touchedFields[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: validateFooterField(field, value) }));
    }
  }, [touchedFields, validateFooterField]);

  const handleFooterBlur = useCallback((field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    setFieldErrors(prev => ({ ...prev, [field]: validateFooterField(field, formData[field as keyof typeof formData]) }));
  }, [formData, validateFooterField]);

  return (
    <footer className="relative bg-deepGreen text-cream overflow-hidden">
      {/* Subtle grain overlay */}
      <div className="section-grain absolute inset-0 pointer-events-none" />

      {/* Decorative top gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 md:px-10 md:py-20">
        {/* 4-column grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-14">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src={assetPath("/logo ac.png")}
                alt="Atrey Chambers Logo"
                className="h-10 w-10 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div>
                <span className="font-display font-bold text-lg text-cream block leading-tight">Atrey Chambers</span>
                <span className="text-[10px] text-cream/40 uppercase tracking-widest">of Law LLP</span>
              </div>
            </div>
            <p className="text-sm text-cream/50 leading-relaxed mb-5">
              A premier full-service Indian law firm led by Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court of India. Delivering legal excellence since 1997.
            </p>
            <Divider variant="cream" width="sm" align="left" />

            {/* Social indicators */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs text-cream/30 uppercase tracking-wider">Recognized by</span>
              <span className="text-xs text-gold/60">BCI</span>
              <span className="text-cream/20">|</span>
              <span className="text-xs text-gold/60">Supreme Court</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-cream mb-5 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Our Firm', href: '/our-firm' },
                { label: 'Our Team', href: '/our-team' },
                { label: 'Practice Areas', href: '/practice-area' },
                { label: 'Publications', href: '/publications' },
                { label: 'Awards', href: '/awards' },
                { label: 'Our Clients', href: '/our-clients' },
                { label: 'Schedule Call', href: '/schedule' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-cream/50 hover:text-cream hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="h-px w-3 bg-gold/30 group-hover:w-5 group-hover:bg-gold transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Office Address */}
          <div>
            <h3 className="font-display font-semibold text-cream mb-5 text-sm uppercase tracking-wider">Office</h3>
            <div className="text-sm text-cream/50 space-y-4">
              <div className="p-4 rounded-lg border border-cream/10 bg-cream/5">
                <p className="text-cream/70 font-medium mb-1.5 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Delhi Office
                </p>
                <p className="leading-relaxed">24, Gyan Kunj, Basement,<br />Laxmi Nagar, Delhi - 110092</p>
              </div>
              <div>
                <p className="text-cream/70 font-medium mb-1.5">Contact</p>
                <p>
                  <a href="tel:+911122053080" className="hover:text-cream transition-colors">
                    +91-11-22053080
                  </a>
                </p>
                <p>
                  <a href="tel:+911122023821" className="hover:text-cream transition-colors">
                    +91-11-22023821
                  </a>
                </p>
                <p className="mt-1">
                  <a href="mailto:support@atreychambers.com" className="hover:text-cream transition-colors text-gold/60">
                    support@atreychambers.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="font-display font-semibold text-cream mb-5 text-sm uppercase tracking-wider">Send a Message</h3>
            <form
              className="space-y-3"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                // Validate all
                const nameErr = validateFooterField('name', formData.name);
                const emailErr = validateFooterField('email', formData.email);
                const msgErr = validateFooterField('message', formData.message);
                setFieldErrors({ name: nameErr, email: emailErr, message: msgErr });
                setTouchedFields({ name: true, email: true, message: true });
                if (nameErr || emailErr || msgErr) return;

                setIsSubmitting(true);
                setSubmitStatus('idle');
                setSubmitMessage('');

                try {
                  const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                  });
                  const data = await response.json();

                  if (response.ok) {
                    setSubmitStatus('success');
                    setSubmitMessage(data.message || 'Message sent successfully!');
                    setFormData({ name: '', email: '', message: '' });
                    setFieldErrors({});
                    setTouchedFields({});
                  } else {
                    setSubmitStatus('error');
                    setSubmitMessage(data.error || 'Failed to send. Please try again.');
                  }
                } catch {
                  setSubmitStatus('error');
                  setSubmitMessage('An error occurred. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={(e) => handleFooterFieldChange('name', e.target.value)}
                  onBlur={() => handleFooterBlur('name')}
                  aria-label="Your name"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'footer-name-error' : undefined}
                  className={`w-full rounded-lg border ${fieldErrors.name ? 'border-red-400' : 'border-cream/15'} bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors`}
                />
                {fieldErrors.name && <p id="footer-name-error" className="text-red-400 text-[0.65rem] mt-0.5 ml-1" role="alert">{fieldErrors.name}</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => handleFooterFieldChange('email', e.target.value)}
                  onBlur={() => handleFooterBlur('email')}
                  aria-label="Your email address"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'footer-email-error' : undefined}
                  className={`w-full rounded-lg border ${fieldErrors.email ? 'border-red-400' : 'border-cream/15'} bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors`}
                />
                {fieldErrors.email && <p id="footer-email-error" className="text-red-400 text-[0.65rem] mt-0.5 ml-1" role="alert">{fieldErrors.email}</p>}
              </div>
              <div>
                <textarea
                  placeholder="Your message..."
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => handleFooterFieldChange('message', e.target.value)}
                  onBlur={() => handleFooterBlur('message')}
                  aria-label="Your message"
                  aria-invalid={!!fieldErrors.message}
                  aria-describedby={fieldErrors.message ? 'footer-msg-error' : undefined}
                  className={`w-full rounded-lg border ${fieldErrors.message ? 'border-red-400' : 'border-cream/15'} bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors resize-none`}
                />
                {fieldErrors.message && <p id="footer-msg-error" className="text-red-400 text-[0.65rem] mt-0.5 ml-1" role="alert">{fieldErrors.message}</p>}
              </div>
              {/* ARIA live region for form submission status */}
              <div aria-live="polite" aria-atomic="true">
                {submitMessage && (
                  <p className={`text-xs ${submitStatus === 'success' ? 'text-green-300' : 'text-red-300'}`} role="status">
                    {submitMessage}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-goldLight transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream/35">
            <p>&copy; {new Date().getFullYear()} Atrey Chambers of Law LLP. All rights reserved.</p>
            <p className="text-center max-w-md">
              As per the rules of the Bar Council of India, law firms are not permitted to solicit work or advertise.
            </p>
            <p>
              Designed by{' '}
              <a
                href="https://aniruddhatrey.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold/50 hover:text-gold transition-colors"
              >
                Aniruddh Atrey
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
