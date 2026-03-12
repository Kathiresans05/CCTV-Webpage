import React from 'react';
import {
    Sun,
    TouchpadIcon,
    Volume2,
    Monitor,
    Cpu,
    Smartphone,
    Globe,
    Maximize
} from 'lucide-react';

const FeaturesSlider = () => {
    const features = [
        { icon: <Sun size={32} />, text: '450 nits Brightness' },
        { icon: <TouchpadIcon size={32} />, text: '40 Point Multi Touch' },
        { icon: <Volume2 size={32} />, text: '2 x 20W Speakers' },
        { icon: <Monitor size={32} />, text: 'Ultra HD Display' },
        { icon: <Cpu size={32} />, text: 'Upto 8 GB Ram' },
        { icon: <Smartphone size={32} />, text: 'Android 13' },
        { icon: <Globe size={32} />, text: 'Remote Access' },
        { icon: <Maximize size={32} />, text: '178° Viewing Angle' },
    ];

    // Duplicate for infinite scroll effect
    const displayFeatures = [...features, ...features];

    return (
        <section className="py-12 bg-gray-50 overflow-hidden border-t border-gray-200">
            <div className="container mx-auto px-4 mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 uppercase tracking-wider">
                    Top Features of All In One Computer
                </h2>
            </div>

            <div className="relative flex overflow-x-hidden">
                <div className="flex animate-scroll whitespace-nowrap">
                    {displayFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-44 h-44 mx-4 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-6 transition-all duration-300 hover:border-primary-red hover:shadow-xl group cursor-default"
                        >
                            <div className="mb-4 text-gray-700 group-hover:text-primary-red transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <p className="text-sm font-semibold text-gray-800 text-center whitespace-normal leading-tight">
                                {feature.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}} />
        </section>
    );
};

export default FeaturesSlider;
