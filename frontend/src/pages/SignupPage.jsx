import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, RotateCw, AlertCircle } from 'lucide-react';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signup(name, email, password);
        if (result.success) {
            const pendingAction = sessionStorage.getItem('pendingAction');
            const returnUrl = sessionStorage.getItem('returnUrl');
            if (pendingAction === 'bookNow' && returnUrl) {
                navigate(returnUrl);
                return;
            }
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center mb-6">
                <h1 className="text-2xl font-bold text-[#111827] mb-1">Create Account</h1>
                <p className="text-gray-500 text-base font-medium">Join us to start your security journey!</p>
            </div>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-3 rounded-2xl flex items-center gap-3 text-[13px] font-semibold">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E11D48] transition-colors" size={18} />
                            <input
                                type="text" required
                                value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:border-[#E11D48] transition-all text-[#111827] placeholder:text-gray-400 font-medium"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E11D48] transition-colors" size={18} />
                            <input
                                type="email" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:border-[#E11D48] transition-all text-[#111827] placeholder:text-gray-400 font-medium"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E11D48] transition-colors" size={18} />
                            <input
                                type="password" required
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:border-[#E11D48] transition-all text-[#111827] placeholder:text-gray-400 font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-[#E11D48] text-white font-bold py-3.5 rounded-2xl uppercase tracking-wider text-[13px] flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        {loading ? (
                            <RotateCw className="animate-spin" size={18} />
                        ) : 'Create Your Account'}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-gray-400 text-sm font-bold">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#E11D48] hover:underline">Log In</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
