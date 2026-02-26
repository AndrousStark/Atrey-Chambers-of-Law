'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LegalParticles } from './LegalParticles';

// Resources sections - all 4 sections including News Telecast
// Version: 2024-12-24 - Ensure all 4 sections are included
const SECTIONS = [
    {
        id: 1,
        title: "Legal Books",
        subtitle: "The Foundation of Law",
        description: "Access a comprehensive library of legal commentaries, acts, and reference books authored by leading experts. Our collection spans centuries of legal wisdom, providing the bedrock for solid legal arguments.",
        color: "#EFEBE9",
        slug: "legal-books"
    },
    {
        id: 2,
        title: "Research Articles",
        subtitle: "Scholarly Analysis",
        description: "Deep dive into complex legal topics with our collection of scholarly articles and research papers. Stay ahead with cutting-edge legal analysis and peer-reviewed perspectives.",
        color: "#E0F2F1",
        slug: "research-articles"
    },
    {
        id: 3,
        title: "Legal Posts & Blogs",
        subtitle: "Current Insights",
        description: "Stay updated with the latest trends, simplified legal concepts, and firm announcements. Bite-sized knowledge designed for the modern legal mind to consume on the go.",
        color: "#E3F2FD",
        slug: "legal-posts-blogs"
    },
    {
        id: 4,
        title: "News Telecast",
        subtitle: "Visual Intelligence",
        description: "Watch legal news, interviews, and expert discussions on significant court proceedings. Visual learning for the digital age, bringing the courtroom to your screen.",
        color: "#FBE9E7",
        slug: "news-telecast"
    }
] as const;

// Explicitly verify we have 4 sections - this will cause build error if missing
if (SECTIONS.length !== 4) {
    throw new Error(`ResourcesLayout: Must have exactly 4 sections, found ${SECTIONS.length}`);
}

export const ResourcesLayout = () => {
    // Ensure we have all 4 sections - validation
    if (SECTIONS.length !== 4) {
        console.error('ResourcesLayout: Expected 4 sections, got', SECTIONS.length);
    }
    
    const [activeIndex, setActiveIndex] = useState(0);
    const prevIndexRef = useRef(0);

    useEffect(() => {
        // Debug: Log sections on mount
        console.log('ResourcesLayout mounted with', SECTIONS.length, 'sections:', SECTIONS.map(s => s.title));
        
        const handleScroll = () => {
            const scrollPos = window.scrollY;
            const windowHeight = window.innerHeight;
            const sectionHeight = windowHeight;
            const totalHeight = SECTIONS.length * sectionHeight;
            
            // Calculate index - ensure we can reach all 4 sections (0, 1, 2, 3)
            const rawIndex = scrollPos / sectionHeight;
            let index = Math.floor(rawIndex);
            
            // Special handling for the last section - ensure we can reach index 3
            // Use lower threshold (70%) and also check rawIndex >= 2.9
            if (scrollPos >= totalHeight * 0.70 || rawIndex >= 2.9) {
                index = SECTIONS.length - 1; // Force to last section (index 3)
            } else {
                // For other sections, use normal calculation
                index = Math.floor(rawIndex);
            }
            
            // Clamp to valid range (0 to 3)
            index = Math.min(Math.max(index, 0), SECTIONS.length - 1);
            
            // Only log when index changes or when near bottom
            if (index !== prevIndexRef.current || scrollPos > totalHeight * 0.7) {
                console.log('Scroll Debug:', {
                    scrollPos: Math.round(scrollPos),
                    windowHeight: Math.round(windowHeight),
                    totalHeight: Math.round(totalHeight),
                    rawIndex: rawIndex.toFixed(2),
                    calculatedIndex: index,
                    maxPossibleIndex: SECTIONS.length - 1,
                    sectionTitle: SECTIONS[index]?.title,
                    threshold70: scrollPos >= totalHeight * 0.70,
                    rawIndexCheck: rawIndex >= 2.9
                });
                prevIndexRef.current = index;
            }
            
            setActiveIndex(index);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Safety check to prevent out-of-bounds access
    const safeActiveIndex = Math.min(Math.max(activeIndex, 0), SECTIONS.length - 1);
    const activeSection = SECTIONS[safeActiveIndex];
    const isRight = safeActiveIndex % 2 === 1;
    
    // Ensure height matches section count - explicitly 400vh for 4 sections
    const containerHeight = SECTIONS.length * 100;
    
    // Additional runtime validation
    if (typeof window !== 'undefined' && SECTIONS.length !== 4) {
        console.error('CRITICAL: ResourcesLayout has', SECTIONS.length, 'sections but should have 4');
        console.error('Sections:', SECTIONS.map(s => ({ id: s.id, title: s.title })));
    }

    return (
        <div className="relative min-h-screen" style={{ height: `${containerHeight}vh` }}>
            {/* Dynamic Background */}
            <div 
                className="fixed inset-0 z-0 transition-colors duration-1000 ease-in-out"
                style={{ backgroundColor: activeSection.color }}
            >
                {/* Dynamic Particles - appear only on scroll */}
                <LegalParticles activeSection={activeIndex} backgroundColor={activeSection.color} />
            </div>

            {/* Fixed Card Container - Only shows active card */}
            <div className="fixed inset-0 z-10 flex items-center px-4 md:px-16">
                <div className={`w-full flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={safeActiveIndex}
                            initial={{ opacity: 0, x: isRight ? 100 : -100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: isRight ? -100 : 100, scale: 0.9 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full max-w-md"
                        >
                            <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <h3 className="text-xl font-bold text-deepGreen mb-2">
                                            {activeSection.subtitle}
                                        </h3>
                                        <p className="text-neutral-600 text-sm mb-4">
                                            {activeSection.title}
                                        </p>
                                        <div className="h-40 w-full bg-gradient-to-br from-deepGreen/10 to-transparent rounded-lg flex items-center justify-center mb-6">
                                            <span className="text-6xl">⚖️</span>
                                        </div>
                                        <p className="text-charcoal/90 leading-relaxed mb-8">
                                            {activeSection.description}
                                        </p>
                                <div className="flex justify-end items-center">
                                            <a 
                                                href={`/resources/${activeSection.slug}`}
                                                className="px-6 py-2 rounded-lg bg-deepGreen text-white text-sm font-bold hover:bg-deepGreen/90 transition-colors"
                                            >
                                                Explore
                                            </a>
                                        </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Scroll Spacers - Creates scrollable sections */}
            {SECTIONS.map((_, index) => (
                <div key={index} className="h-screen" />
            ))}
        </div>
    );
};
