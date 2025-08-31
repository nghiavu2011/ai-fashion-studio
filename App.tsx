/**
 * © 2025 N&M_AI_ART. All Rights Reserved.
 */
import React, { useState, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFusedImage } from './services/geminiService';
import PolaroidCard from './components/PolaroidCard';
import Footer from './components/Footer';
import { locales, type Language } from './lib/locales';
import { logoBase64 } from './lib/logo';

type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

type AppState = 'idle' | 'generating' | 'results-shown';

const primaryButtonClasses = "font-semibold tracking-wide text-xl text-center text-white bg-[#4a5e5f] py-3 px-8 rounded-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#3a4e4f] hover:shadow-lg hover:shadow-[#4a5e5f]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#fff9ed] focus:ring-[#4a5e5f]";
const secondaryButtonClasses = "font-semibold tracking-wide text-xl text-center text-[#4a5e5f] bg-transparent border border-[#4a5e5f] py-3 px-8 rounded-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#4a5e5f] hover:text-white hover:shadow-lg hover:shadow-[#4a5e5f]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#fff9ed] focus:ring-[#4a5e5f]";
const langButtonClasses = "px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#fff9ed] focus:ring-neutral-500";

/**
 * Adds an image watermark to a base image.
 * @param imageUrl The URL of the image to watermark.
 * @returns A promise that resolves with the data URL of the watermarked image.
 */
const addWatermark = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const baseImage = new Image();
        baseImage.crossOrigin = 'anonymous';
        baseImage.onload = () => {
            const logoImage = new Image();
            logoImage.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }

                canvas.width = baseImage.width;
                canvas.height = baseImage.height;
                
                ctx.drawImage(baseImage, 0, 0);

                // Calculate logo size (e.g., 15% of canvas width)
                const logoWidth = canvas.width * 0.15;
                const logoHeight = logoImage.height * (logoWidth / logoImage.width);
                
                // Position at bottom right with padding
                const padding = canvas.width * 0.02;
                const x = canvas.width - logoWidth - padding;
                const y = canvas.height - logoHeight - padding;

                ctx.globalAlpha = 0.8; // Set opacity
                ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
                ctx.globalAlpha = 1.0; // Reset opacity

                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            logoImage.onerror = (err) => reject(new Error('Logo image could not be loaded.'));
            logoImage.src = logoBase64;
        };
        baseImage.onerror = (err) => reject(new Error(`Base image could not be loaded for watermarking: ${err}`));
        baseImage.src = imageUrl;
    });
};


function App() {
    const [characterImage, setCharacterImage] = useState<string | null>(null);
    const [propImage, setPropImage] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
    const [appState, setAppState] = useState<AppState>('idle');
    const [isMobile, setIsMobile] = useState(false);
    const [lang, setLang] = useState<Language>('vi');
    const [cameraAngle, setCameraAngle] = useState<string>('full_body');

    const t = locales[lang];

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1024); // Use lg breakpoint
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const handleImageUpload = (setter: React.Dispatch<React.SetStateAction<string | null>>) => (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
                setGeneratedImage(null);
                setAppState('idle');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateClick = async () => {
        if (!characterImage || !propImage || !backgroundImage) return;

        setAppState('generating');
        setGeneratedImage({ status: 'pending' });
        
        const cameraAngleText = t.cameraAngleOptions[cameraAngle as keyof typeof t.cameraAngleOptions];

        try {
            const resultUrl = await generateFusedImage(characterImage, propImage, backgroundImage, lang, cameraAngleText);
            const watermarkedUrl = await addWatermark(resultUrl);
            setGeneratedImage({ status: 'done', url: watermarkedUrl });
            setAppState('results-shown');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
            setGeneratedImage({ status: 'error', error: errorMessage });
            setAppState('results-shown');
            console.error(`Không thể tạo ảnh:`, err);
        }
    };

    const handleReset = () => {
        setCharacterImage(null);
        setPropImage(null);
        setBackgroundImage(null);
        setGeneratedImage(null);
        setAppState('idle');
    };

    const handleDownloadImage = () => {
        if (generatedImage?.status === 'done' && generatedImage.url) {
            const link = document.createElement('a');
            link.href = generatedImage.url;
            link.download = `N-M_AI_ART_creation.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    return (
        <main className="bg-[#fff9ed] text-[#010000] min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative">
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
                <div className="w-full max-w-7xl text-center mb-10 relative">
                     <div className="absolute top-0 right-4 flex space-x-2 bg-black/5 p-1 rounded-lg">
                        <button onClick={() => setLang('vi')} className={`${langButtonClasses} ${lang === 'vi' ? 'bg-white/50 text-[#010000]' : 'bg-transparent text-neutral-500 hover:bg-black/10'}`}>VI</button>
                        <button onClick={() => setLang('en')} className={`${langButtonClasses} ${lang === 'en' ? 'bg-white/50 text-[#010000]' : 'bg-transparent text-neutral-500 hover:bg-black/10'}`}>EN</button>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-[#010000] font-dancing-script">{t.title}</h1>
                    <p className="text-neutral-600 mt-4 text-lg md:text-xl font-light tracking-wider">{t.tagline}</p>
                </div>

                <AnimatePresence mode="wait">
                    {appState === 'idle' ? (
                        <motion.div
                            key="idle"
                            className="flex flex-col items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3 } }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex flex-col lg:flex-row items-start justify-center gap-8 mb-8">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                                    <label htmlFor="character-upload" className="cursor-pointer group transform hover:scale-105 transition-transform duration-300">
                                        <PolaroidCard imageUrl={characterImage} caption={t.characterImageCaption} placeholderText={t.placeholderText} placeholderColor="#4a5e5f" status="done" isMobile={isMobile} />
                                    </label>
                                    <input id="character-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload(setCharacterImage)} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                     <label htmlFor="prop-upload" className="cursor-pointer group transform hover:scale-105 transition-transform duration-300">
                                        <PolaroidCard imageUrl={propImage} caption={t.propImageCaption} placeholderText={t.placeholderText} placeholderColor="#b37a83" status="done" isMobile={isMobile} />
                                    </label>
                                    <input id="prop-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload(setPropImage)} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                                    <label htmlFor="background-upload" className="cursor-pointer group transform hover:scale-105 transition-transform duration-300">
                                        <PolaroidCard imageUrl={backgroundImage} caption={t.backgroundImageCaption} placeholderText={t.placeholderText} placeholderColor="#2b2525" status="done" isMobile={isMobile} />
                                    </label>
                                    <input id="background-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload(setBackgroundImage)} />
                                </motion.div>
                            </div>

                            {characterImage && propImage && backgroundImage && (
                                <motion.div 
                                    className="flex flex-col items-center gap-6 mt-4" 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ duration: 0.4, delay: 0.3 }}
                                >
                                    <div className="flex items-center gap-3 bg-black/5 p-3 rounded-lg">
                                        <label htmlFor="camera-angle-select" className="text-neutral-700 font-medium text-lg whitespace-nowrap">{t.cameraAngleLabel}:</label>
                                        <select
                                            id="camera-angle-select"
                                            value={cameraAngle}
                                            onChange={(e) => setCameraAngle(e.target.value)}
                                            className="bg-white/80 border border-neutral-300 text-[#010000] text-base rounded-md focus:ring-[#b37a83] focus:border-[#b37a83] block w-full p-2.5 transition-colors duration-200"
                                        >
                                            {Object.entries(t.cameraAngleOptions).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={handleReset} className={secondaryButtonClasses}>{t.resetButton}</button>
                                        <button onClick={handleGenerateClick} className={primaryButtonClasses}>{t.generateButton}</button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            className="flex flex-col items-center gap-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                            transition={{ duration: 0.5 }}
                        >
                            <PolaroidCard
                                caption={appState === 'generating' ? t.generatingState : t.resultState}
                                placeholderText={t.placeholderText}
                                status={generatedImage?.status || 'pending'}
                                imageUrl={generatedImage?.url}
                                error={generatedImage?.error}
                                onDownload={handleDownloadImage}
                                isMobile={isMobile}
                                isGeneratedResult
                            />
                            <div className="flex items-center gap-4 mt-4 h-20">
                                <AnimatePresence>
                                {appState === 'results-shown' && (
                                    <motion.div 
                                        className="flex items-center gap-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <button onClick={handleReset} className={secondaryButtonClasses}>{t.newButton}</button>
                                        {generatedImage?.status === 'done' && (
                                            <button onClick={handleDownloadImage} className={primaryButtonClasses}>{t.downloadButton}</button>
                                        )}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <Footer lang={lang} />
        </main>
    );
}

export default App;