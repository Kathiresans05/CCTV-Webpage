import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ShieldCheck, ChevronRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0F172A] text-[#E5E7EB] border-t border-gray-800 pt-12 pb-6">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">

                    {/* Column 1: Company Information */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <ShieldCheck size={28} className="text-[#EF4444]" />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-white leading-tight">SecureVision</span>
                                <span className="text-xs text-[#EF4444] font-semibold tracking-wider uppercase">CCTV Solutions</span>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-[#E5E7EB]/70 max-w-xs">
                            Leading provider of advanced security solutions, offering professional CCTV installation, maintenance, and surveillance services for homes and businesses.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-white text-base font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-[#EF4444]">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'About Us', path: '/about' },
                                { name: 'Latest Products', path: '/products' },
                                { name: 'Contact Us', path: '/contact' }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <a 
                                        href={link.path} 
                                        className="flex items-center space-x-2 text-white hover:text-[#EF4444] transition-colors duration-300 text-sm font-medium group"
                                    >
                                        <ChevronRight size={14} className="text-[#EF4444] group-hover:translate-x-1 transition-transform" />
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-white text-base font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-[#EF4444]">Contact Info</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <div className="bg-gray-800/50 p-1.5 rounded-lg">
                                    <MapPin size={16} className="text-[#EF4444]" />
                                </div>
                                <span className="text-sm leading-relaxed">123 Security Avenue, Tech District, NY 10001</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="bg-gray-800/50 p-1.5 rounded-lg">
                                    <Phone size={16} className="text-[#EF4444]" />
                                </div>
                                <span className="text-sm">+1 (800) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="bg-gray-800/50 p-1.5 rounded-lg">
                                    <Mail size={16} className="text-[#EF4444]" />
                                </div>
                                <span className="text-sm">info@securevision.com</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800/50 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-xs text-[#E5E7EB]/50 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} SecureVision CCTV Solutions. All rights reserved.
                    </p>
                    <div className="flex space-x-3">
                        {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                            <a 
                                key={idx} 
                                href="#" 
                                className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center text-[#E5E7EB] hover:bg-[#EF4444] hover:text-white transition-all duration-300 shadow-lg transform hover:-translate-y-1"
                            >
                                <Icon size={14} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
