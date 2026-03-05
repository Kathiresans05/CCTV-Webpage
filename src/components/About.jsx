import React from 'react';
import { CheckCircle } from 'lucide-react';

// Import local professional images
import aboutImg from '../assets/project_1.png';

const About = () => {
    return (
        <section id="about" className="py-12 bg-white">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-center">

                    {/* Image Side */}
                    <div className="lg:w-1/2 relative">
                        <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src={aboutImg}
                                alt="Professional CCTV Installation"
                                className="w-full h-[500px] object-cover"
                            />
                            <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply"></div>
                        </div>
                        {/* Experience Badge */}
                        <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 bg-primary-red text-white p-6 md:p-8 rounded-lg shadow-xl z-20 flex flex-col items-center justify-center border-4 border-white">
                            <span className="text-4xl md:text-5xl font-bold mb-1">10+</span>
                            <span className="text-sm md:text-base font-medium uppercase tracking-wider opacity-90 text-center">Years of<br />Experience</span>
                        </div>
                        {/* Decorative background box */}
                        <div className="absolute -top-6 -left-6 w-full h-full border-4 border-red-100 rounded-lg -z-10"></div>
                    </div>

                    {/* Content Side */}
                    <div className="lg:w-1/2 mt-12 lg:mt-0">
                        <span className="text-primary-red font-bold uppercase tracking-wider text-sm mb-2 block">About Our Company</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-6 leading-tight">
                            Leading the Way in Modern Security & Surveillance
                        </h2>
                        <div className="h-1 w-20 bg-primary-red mb-6 rounded"></div>

                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                            SecureVision is a premier security solutions provider dedicated to safeguarding what matters most. With over a decade of industry expertise, we deliver state-of-the-art CCTV and access control systems for residential, commercial, and industrial clients.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Our commitment to excellence ensures that every installation meets the highest standards of reliability and performance. We don't just sell cameras; we design comprehensive security ecosystems tailored to your specific needs.
                        </p>

                        {/* Bullet Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                            {[
                                'Expert Technical Team',
                                'Advanced Technologies',
                                'Customized Solutions',
                                '24/7 Monitoring Available',
                                'Guaranteed Maintenance',
                                'Affordable Pricing'
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex items-center space-x-3 text-gray-800 font-medium">
                                    <CheckCircle size={20} className="text-red-700 flex-shrink-0" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {/* Counters */}
                        <div className="flex flex-wrap gap-8 md:gap-12 pt-8 border-t border-gray-100">
                            <div>
                                <div className="text-4xl font-bold text-primary-navy mb-1">1500+</div>
                                <div className="text-primary-red font-medium">Projects Completed</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-primary-navy mb-1">1200+</div>
                                <div className="text-primary-red font-medium">Happy Clients</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
