import React, { useState } from 'react';
import { Eye } from 'lucide-react';

// Import local professional images
import projectImg1 from '../assets/project_1.png';
import projectImg2 from '../assets/hero_bg_3.png';
import projectImg3 from '../assets/hero_bg_1.png';
import projectImg4 from '../assets/hero_bg_2.png';
import projectImg5 from '../assets/ptz_camera.png';
import projectImg6 from '../assets/bullet_camera.png';

const Projects = () => {
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', 'Home Security', 'Office Installation', 'Industrial Projects', 'Commercial Buildings'];

    const projects = [
        {
            id: 1,
            name: 'High-Rise Office Surveillance',
            category: 'Office Installation',
            image: projectImg1
        },
        {
            id: 2,
            name: 'Smart Home Security System',
            category: 'Home Security',
            image: projectImg2
        },
        {
            id: 3,
            name: 'Factory Monitoring Grid',
            category: 'Industrial Projects',
            image: projectImg3
        },
        {
            id: 4,
            name: 'Retail Store Security Setup',
            category: 'Commercial Buildings',
            image: projectImg4
        },
        {
            id: 5,
            name: 'Residential Perimeter Control',
            category: 'Home Security',
            image: projectImg5
        },
        {
            id: 6,
            name: 'Warehouse Camera Array',
            category: 'Industrial Projects',
            image: projectImg6
        }
    ];

    const filteredProjects = activeTab === 'All'
        ? projects
        : projects.filter(project => project.category === activeTab);

    return (
        <section id="projects" className="py-20 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-4 md:px-8">

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-red-700 font-bold uppercase tracking-wider text-sm mb-2 block">Our Portfolio</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0b2239] mb-4">Recent Installations</h2>
                    <div className="h-1 w-20 bg-red-700 mx-auto rounded"></div>
                </div>

                {/* Categories Tab */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
                    {categories.map((category, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(category)}
                            className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === category
                                ? 'bg-red-700 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="group relative rounded-lg overflow-hidden border border-gray-100 shadow-sm animate-fade-in-up">

                            <img
                                src={project.image}
                                alt={project.name}
                                className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-6">

                                <h3 className="text-xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{project.name}</h3>
                                <span className="text-sm font-medium text-red-300 uppercase tracking-wider mb-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{project.category}</span>

                                <button className="flex items-center space-x-2 bg-white text-red-900 px-6 py-2.5 rounded-sm font-medium hover:bg-transparent hover:text-white hover:border hover:border-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150">
                                    <Eye size={18} />
                                    <span>View Project</span>
                                </button>

                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Projects;
