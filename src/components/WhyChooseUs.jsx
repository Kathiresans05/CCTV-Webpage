import React from 'react';
import { MonitorPlay, Smartphone, Clock, ShieldCheck } from 'lucide-react';

// Import local professional images
import heroBg2 from '../assets/hero_bg_2.png';

const WhyChooseUs = () => {
    const reasons = [
        {
            icon: <MonitorPlay size={40} />,
            title: 'HD Monitoring',
            description: 'Crystal clear high-definition video quality ensures you never miss a detail, day or night.'
        },
        {
            icon: <Smartphone size={40} />,
            title: 'Remote Mobile Access',
            description: 'View live feeds and manage your security system from anywhere using your smartphone.'
        },
        {
            icon: <Clock size={40} />,
            title: 'Quick Installation',
            description: 'Our expert team ensures fast, non-disruptive installation tailored to your premises.'
        },
        {
            icon: <ShieldCheck size={40} />,
            title: 'Warranty Support',
            description: 'Comprehensive warranty coverage and dedicated support for your peace of mind.'
        }
    ];

    return (
        <section className="relative py-24 bg-[#0b0f1a] overflow-hidden">
            {/* Background Image & Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-fixed opacity-40"
                style={{ backgroundImage: `url(${heroBg2})` }}
            >
                <div className="absolute inset-0 bg-[#0b0f1a]/80 mix-blend-multiply"></div>
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 items-center">

                    {/* Header Content */}
                    <div className="lg:w-1/3 text-left">
                        <span className="text-red-400 font-bold uppercase tracking-wider text-sm mb-2 block">Why Choose Us</span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                            Trusted Security Solutions
                        </h2>
                        <div className="h-1 w-20 bg-red-700 mb-6 rounded"></div>
                        <p className="text-gray-300 mb-8 text-lg">
                            We provide advanced, reliable, and user-friendly security systems backed by exceptional customer service. Protect what's yours with confidence.
                        </p>
                        <button className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded font-medium shadow min-w-[200px] transition-colors">
                            Get A Quote
                        </button>
                    </div>

                    {/* Cards */}
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {reasons.map((reason, idx) => (
                            <div key={idx} className="bg-[#131521] border border-white/5 p-8 rounded-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-red-500 mb-6">
                                        {reason.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-white">
                                        {reason.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {reason.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
