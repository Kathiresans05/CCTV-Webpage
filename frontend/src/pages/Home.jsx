import React from 'react';
import Hero from '../components/Hero';

import About from '../components/About';
import WhyChooseUs from '../components/WhyChooseUs';
import Products from '../components/Products';
import Projects from '../components/Projects';
import CTA from '../components/CTA';

const Home = () => {
    return (
        <div>
            <Hero />

            <About />
            <WhyChooseUs />
            <Products />
            <Projects />
            <CTA />
        </div>
    );
};

export default Home;
