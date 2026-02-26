'use client';

import { useState } from 'react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (value: string): string => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched) {
      setEmailError(validateEmail(value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      setTouched(true);
      return;
    }
    setEmail('');
    setEmailError('');
    setTouched(false);
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-10">
      <div className="card">
        <div className="card__content">
          <p className="text-xs uppercase tracking-[0.3em] text-charcoal/40 mb-3">Stay Updated</p>
          <h2 className="card__title font-display">
            Legal Insights Newsletter
          </h2>
          <p className="card__description">
            Get expert analysis, case law updates, and regulatory changes delivered to your inbox
          </p>
          <form onSubmit={handleSubmit} className="card__form" noValidate>
            <div className={`card__input-wrapper ${emailError ? '!border-red-500 !shadow-red-500/20' : ''}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleBlur}
                placeholder="Enter your email address"
                required
                className="card__input"
                aria-label="Email address for newsletter"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'newsletter-error' : undefined}
              />
              <button type="submit" className="card__button" aria-label={subscribed ? 'Successfully subscribed' : 'Subscribe to newsletter'}>
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>
            {emailError && (
              <p id="newsletter-error" className="text-red-600 text-xs mt-2 text-left ml-2" role="alert">
                {emailError}
              </p>
            )}
          </form>
          {/* ARIA live region for subscription status */}
          <div aria-live="polite" aria-atomic="true">
            {subscribed && (
              <p className="mt-3 text-green-700 text-sm font-medium" role="status">
                You have been successfully subscribed to the newsletter.
              </p>
            )}
          </div>
          <p className="mt-4 text-xs text-charcoal/40">
            Join 500+ legal professionals. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};
