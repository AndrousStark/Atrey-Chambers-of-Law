'use client';

import { motion } from 'framer-motion';

interface ResourceCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    delay?: number;
}

export const ResourceCard = ({ title, description, icon, delay = 0 }: ResourceCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            viewport={{ once: true }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative w-full h-[400px] perspective-1000"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(14,59,47,0.2)] overflow-hidden">
                {/* Dynamic Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-deepGreen/5 via-transparent to-deepGreen/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="h-full flex flex-col p-8 relative z-10">
                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-left">
                        <div className="w-16 h-16 bg-deepGreen/10 rounded-2xl flex items-center justify-center text-deepGreen">
                            {icon}
                        </div>
                    </div>

                    <h3 className="text-3xl font-bold text-deepGreen mb-4 font-poppins group-hover:translate-x-2 transition-transform duration-300">
                        {title}
                    </h3>

                    <p className="text-charcoal/70 text-lg leading-relaxed mb-auto">
                        {description}
                    </p>

                    <div className="mt-8">
                        <button className="flex items-center gap-2 text-deepGreen font-semibold group-hover:gap-4 transition-all duration-300">
                            Explore Collection
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
