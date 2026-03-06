import type { Metadata } from 'next';
import { ScheduleForm } from '@/components/ScheduleForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';

export const metadata: Metadata = {
  title: 'Schedule a Consultation with Dr. Abhishek Atrey — Book an Appointment',
  description: 'Schedule a legal consultation with Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey), LL.D., Advocate-on-Record, Supreme Court of India. Book an appointment with Advocate Abhishek Atrey for constitutional law, environmental cases, criminal defence, corporate advisory, PIL, arbitration, and family law. Mr. Atrey, Mrs. Ambika Atrey, and Mr. Aniruddh Atrey at Atrey Chambers provide personalized legal strategy.',
  keywords: ['schedule Dr. Abhishek Atrey', 'book Mr. Atrey consultation', 'Mr. Abhishek appointment', 'Abhishek consultation', 'Atrey appointment', 'A. Atrey meeting', 'consult Atrey advocate', 'Abhishek Atrey legal consultation', 'Atrey Chambers appointment', 'Supreme Court lawyer appointment Delhi'],
  openGraph: {
    title: 'Consult Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Book an appointment with Advocate Abhishek Atrey, AOR Supreme Court. Expert legal advice across all practice areas.',
    url: 'https://www.atreychambers.com/schedule',
  },
  alternates: { canonical: 'https://www.atreychambers.com/schedule' },
};

export default function SchedulePage() {
    return (
        <main className="min-h-screen bg-cream relative overflow-hidden">
            <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
            <TechBackground />

            <Header />

            <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold text-deepGreen mb-4 font-poppins">
                            Let's Connect
                        </h1>
                        <p className="text-xl text-charcoal/80 max-w-2xl mx-auto">
                            Schedule a time that works for you. We'll handle the rest.
                        </p>
                    </div>

                    <ScheduleForm />
                </div>
            </div>

            <Footer />
        </main>
    );
}
