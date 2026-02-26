'use client';

import { useState, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';

const SERVICES = [
  "Legal Consultation",
  "Case Review",
  "Document Verification",
  "Arbitration Meeting",
  "Other"
];

interface FieldErrors {
  name?: string;
  email?: string;
  date?: string;
}

export const ScheduleForm = () => {
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState<Date | null>(new Date());
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      default:
        return '';
    }
  }, []);

  const handleFieldChange = useCallback((field: 'name' | 'email', value: string) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  }, [validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateField('name', name);
    const emailError = validateField('email', email);
    const dateError = !date ? 'Please select a date' : '';
    const newErrors: FieldErrors = { name: nameError, email: emailError, date: dateError };
    setErrors(newErrors);
    setTouched({ name: true, email: true, date: true });

    if (nameError || emailError || dateError) return;

    setLoading(true);
    setStatus('idle');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('service', service);
      formData.append('date', date ? date.toISOString() : '');
      formData.append('message', message);
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/schedule', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to schedule');

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setFile(null);
      setErrors({});
      setTouched({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="card max-w-3xl mx-auto !bg-opacity-40 !backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden group"
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-deepGreen/10 rounded-full blur-3xl group-hover:bg-deepGreen/20 transition-all duration-1000" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-deepGreen/10 rounded-full blur-3xl group-hover:bg-deepGreen/20 transition-all duration-1000" />

      <div className="card__content text-left relative z-10">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-deepGreen mb-3 font-poppins tracking-tight">
            Schedule a Consultation
          </h2>
          <p className="text-charcoal/70 text-lg">
            Secure your slot with our legal experts.
          </p>
        </motion.div>

        {/* ARIA live region for form status */}
        <div aria-live="assertive" aria-atomic="true" className="sr-only">
          {status === 'success' && 'Your consultation request has been confirmed. A calendar invitation has been sent to your email.'}
          {status === 'error' && 'There was an error submitting your request. Please try again.'}
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center p-12 bg-white/30 rounded-3xl border border-white/50 backdrop-blur-md shadow-inner"
              role="status"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-3xl font-bold text-deepGreen mb-3">Request Confirmed!</h3>
              <p className="text-charcoal/80 text-lg mb-8 max-w-md mx-auto">
                We&apos;ve sent a calendar invitation to <span className="font-semibold text-deepGreen">{email}</span>.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="px-8 py-3 bg-white text-deepGreen font-semibold rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all transform hover:-translate-y-1"
              >
                Schedule Another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} className="space-y-2 group/input">
                  <label htmlFor="schedule-name" className="block text-sm font-bold text-deepGreen uppercase tracking-wider ml-1 group-focus-within/input:text-deepGreen/80 transition-colors">
                    Full Name
                  </label>
                  <div className={`card__input-wrapper !rounded-xl !p-1 !bg-white/40 hover:!bg-white/60 transition-all duration-300 focus-within:!ring-2 focus-within:!ring-deepGreen/20 ${errors.name ? '!border-red-500' : ''}`}>
                    <input
                      id="schedule-name"
                      type="text"
                      value={name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      onBlur={() => handleBlur('name', name)}
                      required
                      className="card__input !w-full !text-lg !font-medium placeholder:text-charcoal/30"
                      placeholder="e.g. John Doe"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-red-600 text-xs ml-1" role="alert">{errors.name}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2 group/input">
                  <label htmlFor="schedule-email" className="block text-sm font-bold text-deepGreen uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  <div className={`card__input-wrapper !rounded-xl !p-1 !bg-white/40 hover:!bg-white/60 transition-all duration-300 focus-within:!ring-2 focus-within:!ring-deepGreen/20 ${errors.email ? '!border-red-500' : ''}`}>
                    <input
                      id="schedule-email"
                      type="email"
                      value={email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleBlur('email', email)}
                      required
                      className="card__input !w-full !text-lg !font-medium placeholder:text-charcoal/30"
                      placeholder="e.g. john@company.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-red-600 text-xs ml-1" role="alert">{errors.email}</p>
                  )}
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-bold text-deepGreen uppercase tracking-wider ml-1">
                    Service Type
                  </label>
                  <div className="card__input-wrapper !rounded-xl !p-1 !bg-white/40 hover:!bg-white/60 transition-all duration-300 relative">
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="card__input !w-full !text-lg !font-medium bg-transparent cursor-pointer appearance-none relative z-10"
                    >
                      {SERVICES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-deepGreen pointer-events-none z-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-bold text-deepGreen uppercase tracking-wider ml-1">
                    Preferred Date & Time
                  </label>
                  <div className="card__input-wrapper !rounded-xl !p-1 !bg-white/40 hover:!bg-white/60 transition-all duration-300 relative z-20">
                    <DatePicker
                      selected={date}
                      onChange={(date) => setDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="card__input !w-full !text-lg !font-medium cursor-pointer bg-transparent"
                      wrapperClassName="w-full"
                      minDate={new Date()}
                      placeholderText="Select slot"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-bold text-deepGreen uppercase tracking-wider ml-1">
                  Case Details / Message
                </label>
                <div className="card__input-wrapper !rounded-xl !p-1 !bg-white/40 hover:!bg-white/60 transition-all duration-300 focus-within:!ring-2 focus-within:!ring-deepGreen/20">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="card__input !w-full min-h-[120px] resize-none !text-lg !font-medium placeholder:text-charcoal/30"
                    placeholder="Briefly describe your legal requirements..."
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-bold text-deepGreen uppercase tracking-wider ml-1">
                  Relevant Documents
                </label>
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-deepGreen/5 rounded-xl transform transition-transform group-hover:scale-[1.02]" />
                  <div className="card__input-wrapper !rounded-xl !p-4 border-2 border-dashed border-deepGreen/30 hover:border-deepGreen/60 transition-all duration-300 flex items-center justify-center bg-white/20">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center text-deepGreen/70 group-hover:text-deepGreen transition-colors">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <span className="font-medium">{file ? file.name : 'Click or Drag to Upload Document'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-6 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden group bg-deepGreen text-cream px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing Request...
                      </>
                    ) : (
                      <>
                        Confirm Schedule
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                </button>
              </motion.div>
            </form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
