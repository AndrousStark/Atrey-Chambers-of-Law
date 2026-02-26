'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ICONS = [
    {
        id: 1,
        label: "Justice",
        // SVG for Scales of Justice
        path: "M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z",
        color: "#FFD700" // Gold
    },
    {
        id: 2,
        label: "Advocate",
        // SVG for Gavel
        path: "M2 2h20v20H2z", // Placeholder square, will replace with proper path below
        color: "#C0C0C0" // Silver
    },
    {
        id: 3,
        label: "Constitution",
        // SVG for Book
        path: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z",
        color: "#CD7F32" // Bronze
    },
    {
        id: 4,
        label: "Supreme Court",
        // SVG for Building
        path: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
        color: "#E5E4E2" // Platinum
    }
];

// Better paths
const SCALES_PATH = "M12,2L1,12h3v9h6v-6h4v6h6v-9h3L12,2z M10,20H6v-7h4V20z M18,20h-4v-7h4V20z"; // Simple building/balance
const GAVEL_PATH = "M21.5,13.8l-8.3-8.3c-1-1-2.6-1-3.5,0L8.2,7l2.8,2.8L9.6,11.2L6.8,8.4L5.4,9.8l2.8,2.8l-1.4,1.4L4,11.2l-2.8,2.8 c-1,1-1,2.6,0,3.5l8.3,8.3c1,1,2.6,1,3.5,0l9.9-9.9C22.5,16.4,22.5,14.8,21.5,13.8z M11.6,24.4l-8.3-8.3l9.9-9.9l8.3,8.3L11.6,24.4z";
const BOOK_PATH = "M18,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V4C20,2.9,19.1,2,18,2z M18,20H6V4h5v8l2.5-1.5L16,12V4h2 V20z";
const COURT_PATH = "M12,3L2,12h3v8h14v-8h3L12,3z M17,18h-2v-6H9v6H7v-7.8l5-4.5l5,4.5V18z";

export const RevolvingIcons = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <div ref={containerRef} className="h-[60vh] flex items-center justify-center relative perspective-1000 overflow-hidden">
            <motion.div
                style={{ opacity, scale }}
                className="relative w-64 h-64 md:w-96 md:h-96 preserve-3d"
            >
                <motion.div
                    style={{ rotateY: rotate }}
                    className="w-full h-full absolute inset-0 preserve-3d"
                >
                    {ICONS.map((icon, index) => {
                        const angle = (index / ICONS.length) * 360;
                        const translateZ = 200; // Distance from center

                        return (
                            <div
                                key={icon.id}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
                                style={{
                                    transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`
                                }}
                            >
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(14,59,47,0.3)] p-4">
                                    <svg viewBox="0 0 24 24" fill={icon.color} className="w-full h-full drop-shadow-lg">
                                        <path d={index === 0 ? SCALES_PATH : index === 1 ? GAVEL_PATH : index === 2 ? BOOK_PATH : COURT_PATH} />
                                    </svg>
                                </div>
                                <span className="mt-4 text-deepGreen font-bold text-lg bg-cream/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                                    {icon.label}
                                </span>
                            </div>
                        );
                    })}
                </motion.div>
            </motion.div>

            {/* Central Axis Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-full bg-gradient-to-b from-transparent via-deepGreen/20 to-transparent blur-xl" />
        </div>
    );
};
