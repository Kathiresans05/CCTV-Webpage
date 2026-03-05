import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import local professional images
import heroBg1 from '../assets/hero_bg_1.png';
import heroBg2 from '../assets/hero_bg_2.png';
import heroBg3 from '../assets/hero_bg_3.png';
import bulletImg from '../assets/bullet_camera.png';
import domeImg from '../assets/dome_camera.png';
import ptzImg from '../assets/ptz_camera.png';

const slides = [
    {
        bg: heroBg1,
        theme: "dark",
        subtitle: "CP PLUS | WORLD EXPERIENCE CENTER",
        title: "COMMITTED\nTO SECURE",
        desc: "Come & Experience Where Technology Meets Possibilities",
        buttonText: "Our Services",
        accent: "text-red-500",
        layout: "center",
    },
    {
        bg: heroBg2,
        theme: "light",
        subtitle: "Full-COLOR GUARD+ SERIES",
        title: "CCTV Video Even In\nComplete Darkness",
        desc: "Large Aperture • Supplemental Light • Advanced Sensor",
        buttonText: "View Products",
        accent: "text-red-600",
        layout: "split",
        extraImg: domeImg
    },
    {
        bg: heroBg3,
        theme: "dark",
        subtitle: "illuMAX Dual Light",
        title: "Daylight Sharpness,\nNight Time Precision",
        desc: "5 MP Full HD Resolution | Dual light night vision | Built-in-Mic",
        buttonText: "Explore illuMAX",
        accent: "text-orange-500",
        layout: "left",
    },
    {
        bg: heroBg2,
        theme: "dark",
        subtitle: "Enterprise Grade Solutions",
        title: "AI Powered\nTracking Systems",
        desc: "Smart Motion & Human Detection for Commercial Spaces",
        buttonText: "Get Enterprise Quote",
        accent: "text-red-500",
        layout: "right",
    },
    {
        bg: heroBg3,
        theme: "light",
        subtitle: "Wireless Smart Solutions",
        title: "Wire-Free Setup\nZero Hassle",
        desc: "100% Wire-free • Solar Compatible • Cloud Storage",
        buttonText: "Buy Wireless",
        accent: "text-green-600",
        layout: "center",
    },
    {
        bg: heroBg1,
        theme: "dark",
        subtitle: "24/7 Professional Support",
        title: "Your Security\nOur Priority",
        desc: "Dedicated AMC Plans and Lifetime Expert Guidance",
        buttonText: "Contact Support",
        accent: "text-red-400",
        layout: "split",
        extraImg: bulletImg
    }
];

const Hero = () => {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
    const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(timer);
    }, [current]);

    return (
        <section className="relative h-[400px] md:h-[450px] bg-primary-navy overflow-hidden group">

            {/* Slider container */}
            <div
                className="w-full h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">

                        {/* Background Image / Overlay */}
                        <div className="absolute inset-0 z-0">
                            <img src={slide.bg} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                            {/* Adaptive overlay based on light/dark themes */}
                            <div className={`absolute inset-0 ${slide.theme === 'dark' ? 'bg-black/60 md:bg-black/40 bg-gradient-to-r from-black/80 to-transparent' : 'bg-white/80 md:bg-white/60 bg-gradient-to-r from-white/90 to-transparent'}`}></div>
                        </div>

                        {/* Slide Content */}
                        <div className="container mx-auto px-4 md:px-8 h-full relative z-10 flex items-center">

                            <div className={`w-full ${slide.layout === 'center' ? 'text-center flex flex-col items-center mx-auto max-w-4xl' : slide.layout === 'right' ? 'flex flex-col items-end text-right ml-auto' : 'max-w-3xl'}
                                       ${slide.theme === 'dark' ? 'text-white' : 'text-gray-900'}
                                       animate-fade-in-up transition-opacity duration-500`}
                            >
                                <span className={`font-bold uppercase tracking-widest text-sm md:text-base mb-3 block drop-shadow-sm ${slide.accent}`}>
                                    {slide.subtitle}
                                </span>
                                <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 whitespace-pre-line drop-shadow-md ${slide.theme === 'dark' ? 'text-white' : 'text-primary-navy'}`}>
                                    {slide.title}
                                </h1>
                                <p className={`text-base md:text-lg md:leading-relaxed mb-6 max-w-2xl font-medium drop-shadow-sm ${slide.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {slide.desc}
                                </p>
                                <button className={`px-6 py-2.5 rounded font-bold uppercase tracking-wider text-sm shadow-xl transition-transform hover:-translate-y-1 ${slide.theme === 'dark' ? 'bg-primary-red hover:bg-opacity-90 text-white' : 'bg-primary-navy hover:bg-primary-red text-white'}`}>
                                    {slide.buttonText}
                                </button>
                            </div>

                            {/* Optional side image for 'split' layout */}
                            {slide.layout === 'split' && slide.extraImg && (
                                <div className="hidden lg:block w-1/3 absolute right-10 top-1/2 transform -translate-y-1/2 animate-fade-in-up delay-300">
                                    <div className="w-full h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                                        <img src={slide.extraImg} alt="Feature" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 shadow-md ${current === idx ? 'bg-primary-red w-8' : 'bg-gray-300 hover:bg-white'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

        </section>
    );
};

export default Hero;
