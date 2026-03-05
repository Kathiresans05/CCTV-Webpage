import React from 'react';

// Import local professional images
import heroBg1 from '../assets/hero_bg_1.png';

const CTA = () => {
    return (
        <section className="relative py-24 bg-gray-900 overflow-hidden">
            {/* Background Image & Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
                style={{ backgroundImage: `url(${heroBg1})` }}
            >
                <div className="absolute inset-0 bg-[#0b0f1a]/70 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-transparent to-transparent opacity-60"></div>
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
                    Secure Your Property Today With Professional CCTV Solutions
                </h2>
                <p className="text-red-100 mb-10 text-lg max-w-2xl mx-auto">
                    Don't leave your security to chance. Get a customized, state-of-the-art surveillance system tailored to your specific needs.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button className="bg-white text-[#0b2239] hover:bg-gray-100 px-8 py-4 rounded font-bold shadow-xl transition-all w-full sm:w-auto text-lg whitespace-nowrap">
                        Request Free Quote
                    </button>
                    <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0b2239] px-8 py-4 rounded font-bold transition-all w-full sm:w-auto text-lg whitespace-nowrap">
                        Call Us Now
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTA;
