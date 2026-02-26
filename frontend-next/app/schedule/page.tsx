import { ScheduleForm } from '@/components/ScheduleForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';

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
