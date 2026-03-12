import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

// Import local professional images
import mapBg from '../../assets/hero_bg_1.png';

const ContactInfo = () => {
    const contactDetails = [
        { icon: <MapPin className="text-red-700" />, title: 'Headquarters', detail1: '123 Security Avenue, Tech District', detail2: 'New York, NY 10001' },
        { icon: <Phone className="text-red-700" />, title: 'Phone Numbers', detail1: '+1 (800) 123-4567', detail2: '+1 (555) 987-6543' },
        { icon: <Mail className="text-red-700" />, title: 'Email Address', detail1: 'info@securevision.com', detail2: 'support@securevision.com' },
        { icon: <Clock className="text-red-700" />, title: 'Working Hours', detail1: 'Mon - Fri: 9:00 AM - 6:00 PM', detail2: 'Sat: 10:00 AM - 4:00 PM' },
    ];

    return (
        <div className="flex flex-col h-full space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {contactDetails.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            {item.icon}
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-[#0b0f1a] mb-1">{item.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.detail1}</p>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.detail2}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-8 border-t border-gray-100">
                <h4 className="text-lg font-bold text-[#0b0f1a] mb-6">Follow Our Socials</h4>
                <div className="flex space-x-4">
                    {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                        <a key={idx} href="#" className="w-10 h-10 bg-[#0b0f1a] text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-md">
                            <Icon size={18} />
                        </a>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex-grow min-h-[250px] relative">
                {/* Mock Map Placeholder */}
                <div className="w-full h-full bg-gray-200 relative flex items-center justify-center">
                    <img
                        src={mapBg}
                        alt="Map"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
                    />
                    <div className="relative z-10 bg-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 border border-red-100">
                        <MapPin size={20} className="text-red-700" />
                        <span className="font-bold text-gray-800">Visit Us Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactInfo;
