import React, { useEffect } from 'react';
import About from '../components/About';

const AboutPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#F5F7FA] min-h-screen pt-8">
            {/* Main Content: About Section */}
            <div>
                <About />
            </div>
        </div>
    );
};

export default AboutPage;
