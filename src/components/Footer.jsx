import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ShieldCheck, ChevronRight } from 'lucide-react';

// Import local professional images
import heroBg1 from '../assets/hero_bg_1.png';

const Footer = () => {
    return (
        <footer className="relative bg-dark-bg text-gray-400 pt-16 pb-8 overflow-hidden">
            {/* Background Image & Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-10 grayscale"
                style={{ backgroundImage: `url(${heroBg1})` }}
            ></div>
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

                    {/* Column 1: Company About */}
                    <div>
                        <div className="flex items-center space-x-2 mb-6">
                            <ShieldCheck size={32} className="text-primary-red" />
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-white leading-tight">SecureVision</span>
                                <span className="text-xs text-primary-red font-semibold tracking-wider">CCTV SOLUTIONS</span>
                            </div>
                        </div>
                        <p className="mb-6 text-sm leading-relaxed text-gray-400">
                            Leading provider of advanced security solutions, offering professional CCTV installation, maintenance, and surveillance services for homes and businesses.
                        </p>
                    </div>


                    {/* Column 3: Quick Links */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-1 after:bg-primary-red">Quick Links</h3>
                        <ul className="space-y-3">
                            {['About Us', 'Latest Products', 'Contact Us'].map((link, idx) => (
                                <li key={idx} className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer text-sm">
                                    <ChevronRight size={14} className="text-primary-red" />
                                    <span>{link}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact & Map */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-1 after:bg-primary-red">Contact Info</h3>
                        <ul className="space-y-4 mb-6">
                            <li className="flex items-start space-x-3 text-sm">
                                <MapPin size={18} className="text-primary-red mt-1 flex-shrink-0" />
                                <span>123 Security Avenue, Tech District, New York, NY 10001</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm">
                                <Phone size={18} className="text-primary-red flex-shrink-0" />
                                <span>+1 (800) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm">
                                <Mail size={18} className="text-primary-red flex-shrink-0" />
                                <span>info@securevision.com</span>
                            </li>
                        </ul>
                        <div className="w-full h-24 bg-gray-700 rounded overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                                [Google Map Placeholder]
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} SecureVision CCTV Solutions. All rights reserved.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-red hover:text-white transition-all"><Facebook size={14} /></a>
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-red hover:text-white transition-all"><Twitter size={14} /></a>
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-red hover:text-white transition-all"><Instagram size={14} /></a>
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-red hover:text-white transition-all"><Linkedin size={14} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
