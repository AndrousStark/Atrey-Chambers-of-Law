'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BCI_CONSENT_KEY = 'bci-disclaimer-accepted';

export const BCIDisclaimer = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(BCI_CONSENT_KEY);
    if (!accepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(BCI_CONSENT_KEY, 'true');
    setShowDisclaimer(false);
  };

  return (
    <AnimatePresence>
      {showDisclaimer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bci-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg rounded-lg bg-cream p-8 shadow-2xl"
          >
            <h2
              id="bci-title"
              className="mb-4 text-xl font-display font-bold text-deepGreen"
            >
              Disclaimer
            </h2>
            <div className="mb-6 space-y-3 text-sm leading-relaxed text-charcoal/80">
              <p>
                As per the rules of the Bar Council of India, advocates and law firms are
                not permitted to solicit work or advertise. By clicking &quot;I Agree&quot;
                below, the user acknowledges the following:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  There has been no advertisement, personal communication, solicitation,
                  invitation, or inducement of any sort whatsoever from Atrey Chambers of
                  Law LLP or any of its members to solicit any work through this website.
                </li>
                <li>
                  The user wishes to gain more information about the firm for his/her own
                  information and use.
                </li>
                <li>
                  The information about the firm is provided to the user only on his/her
                  specific request and any information obtained or material downloaded from
                  this website is completely at the user&apos;s volition and any
                  transmission, receipt, or use of this website does not create any
                  lawyer-client relationship.
                </li>
                <li>
                  The contents of this website are the intellectual property of Atrey
                  Chambers of Law LLP.
                </li>
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleAccept}
                className="rounded bg-deepGreen px-6 py-2.5 text-sm font-semibold text-cream hover:bg-deepGreenLight transition-colors focus:outline-none focus:ring-2 focus:ring-deepGreen focus:ring-offset-2"
              >
                I Agree
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
