import React from 'react';
import { Search, Map, Wrench, ShieldCheck } from 'lucide-react';

const Process = () => {
    const steps = [
        {
            num: '01',
            icon: <Search size={28} />,
            title: 'Site Inspection',
            desc: 'Our experts evaluate your premises to identify vulnerabilities.'
        },
        {
            num: '02',
            icon: <Map size={28} />,
            title: 'Security Planning',
            desc: 'We design a comprehensive and customized security strategy.'
        },
        {
            num: '03',
            icon: <Wrench size={28} />,
            title: 'Installation',
            desc: 'Professional and non-disruptive installation by certified engineers.'
        },
        {
            num: '04',
            icon: <ShieldCheck size={28} />,
            title: 'Maintenance',
            desc: 'Ongoing support, updates, and maintenance for peak performance.'
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-8">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-red-700 font-bold uppercase tracking-wider text-sm mb-2 block">How We Work</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0b2239] mb-4">Our Working Process</h2>
                    <div className="h-1 w-20 bg-red-700 mx-auto rounded"></div>
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-1 bg-gray-200 -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group">

                                {/* Circular Icon Step */}
                                <div className="relative w-[90px] h-[90px] rounded-full bg-white border-4 border-gray-100 flex items-center justify-center mb-6 
                              group-hover:border-red-700 group-hover:bg-[#0b2239] transition-all duration-300 shadow-md transform group-hover:-translate-y-2">
                                    <div className="text-red-700 group-hover:text-white transition-colors duration-300">
                                        {step.icon}
                                    </div>
                                    {/* Step Number Badge */}
                                    <div className="absolute -top-2 -right-2 bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow">
                                        {step.num}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-[#0b2239] mb-3">{step.title}</h3>
                                <p className="text-gray-600 text-sm max-w-[250px] mx-auto leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Process;
