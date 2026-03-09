import React, { useEffect } from 'react';
import About from '../components/About';
import FeaturesSlider from '../components/FeaturesSlider';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import professional CCTV background
import aboutHero from '../assets/cctv_about_bg.png';

const AboutPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#F5F7FA] min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="bg-[#0b0f1a] py-16 relative overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${aboutHero})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f1a]/80 to-[#0b0f1a]"></div>
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">About Our Company</h1>
                    <nav className="flex items-center justify-center space-x-3 text-gray-400">
                        <Link to="/" className="hover:text-red-500 transition-colors flex items-center">
                            <Home size={16} className="mr-1" /> Home
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">About Us</span>
                    </nav>
                </div>
            </div>

            {/* Main Content: About Section */}
            <div>
                <About />
            </div>
        </div>
    );
};

export default AboutPage;
