import React, { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

const ContactForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const submissionData = {
                ...formData,
                name: `${formData.firstName} ${formData.lastName}`.trim()
            };

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    subject: 'General Inquiry',
                    message: ''
                });
                // Reset message after 10 seconds
                setTimeout(() => setIsSubmitted(false), 10000);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError('Unable to connect to the server. Please ensure the backend is running.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-8">Thank you for reaching out. Hello sir/Mam I am recived your queries I am contact immediately.</p>
                <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-red-700 font-bold hover:underline"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 h-full flex flex-col">
            <h3 className="text-2xl font-bold text-[#0b0f1a] mb-6">Send Us a Message</h3>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-700 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                            placeholder="John"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-700 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                            placeholder="Doe"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-700 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                            placeholder="john@example.com"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-700 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                            placeholder="+91 (555) 000-0000"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-700 focus:ring-2 focus:ring-red-100 transition-all outline-none bg-white appearance-none"
                    >
                        <option>General Inquiry</option>
                        <option>Technical Support</option>
                        <option>Product Quote</option>
                        <option>Installation Request</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                    <textarea
                        rows="5"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-700 focus:ring-2 focus:ring-red-100 transition-all outline-none resize-none"
                        placeholder="How can we help you?"
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-bold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center space-x-2 group ${isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-[#0b0f1a] hover:bg-red-800 text-white hover:shadow-xl'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>Send Message</span>
                            <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
