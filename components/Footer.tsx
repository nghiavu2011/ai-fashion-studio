/**
 * © 2024 N&M_AI_ART. All Rights Reserved.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { locales, type Language } from '../lib/locales';

const primaryButtonClasses = "font-semibold text-sm sm:text-base text-center text-white bg-[#4a5e5f] py-2 px-4 rounded-sm transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#3a4e4f] hover:shadow-md hover:shadow-[#4a5e5f]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#fff9ed] focus:ring-[#4a5e5f] whitespace-nowrap";
const secondaryButtonClasses = "font-semibold text-sm sm:text-base text-center text-[#4a5e5f] bg-transparent border border-[#4a5e5f] py-2 px-4 rounded-sm transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#4a5e5f] hover:text-white hover:shadow-md hover:shadow-[#4a5e5f]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#fff9ed] focus:ring-[#4a5e5f] whitespace-nowrap";


const Footer = ({ lang }: { lang: Language }) => {
    const [index, setIndex] = useState(0);
    const t = locales[lang];
    const REMIX_IDEAS = t.remixIdeas;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % REMIX_IDEAS.length);
        }, 3500); // Change text every 3.5 seconds

        return () => clearInterval(intervalId);
    }, [REMIX_IDEAS.length]);
     
    // Reset index when ideas array changes (language switch)
    useEffect(() => {
        setIndex(0);
    }, [lang]);

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-[#fff9ed]/80 backdrop-blur-lg p-3 z-50 text-neutral-700 text-xs sm:text-sm border-t border-black/10">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4 px-4">
                {/* Left Side */}
                 <div className="hidden md:flex flex-col items-start gap-1 text-neutral-500">
                    <p dangerouslySetInnerHTML={{ __html: t.followMessage }} />
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                        <span>{t.copyright}</span>
                        <span aria-hidden="true">|</span>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-[#b37a83] transition-colors duration-200">{t.termsOfService}</a>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex-grow flex justify-end items-center gap-4 sm:gap-6">
                    <div className="hidden lg:flex items-center gap-2 text-neutral-500 text-right min-w-0">
                        <span className="flex-shrink-0">{t.remixIdeasTitle}</span>
                        <div className="relative w-72 h-5">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index + lang}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="absolute inset-0 font-medium text-neutral-800 whitespace-nowrap text-left"
                                >
                                    {REMIX_IDEAS[index]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <a
                            href="https://aistudio.google.com/apps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={primaryButtonClasses}
                        >
                            {t.openInAIStudio}
                        </a>
                        <a
                            href="https://gemini.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={secondaryButtonClasses}
                        >
                            {t.chatWithGemini}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;