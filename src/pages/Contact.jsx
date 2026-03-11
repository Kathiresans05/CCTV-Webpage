import React, { useEffect } from 'react';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import local professional images

const Contact = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">

            {/* Header / Breadcrumbs */}
            <div className="bg-[#0F172A] pt-14 pb-20 relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Contact Us</h1>
                    <nav className="flex items-center justify-center space-x-3 text-gray-300">
                        <Link to="/" className="hover:text-red-400 transition-colors flex items-center">
                            <Home size={16} className="mr-1" /> Home
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">Contact</span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 md:px-8 -mt-16 pb-24 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
                    {/* Form Column */}
                    <div className="lg:w-7/12 order-2 lg:order-1 flex flex-col">
                        <ContactForm />
                    </div>

                    {/* Information Column */}
                    <div className="lg:w-5/12 order-1 lg:order-2 flex flex-col">
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 h-full">
                            <ContactInfo />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
