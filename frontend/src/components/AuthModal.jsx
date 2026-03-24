import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, CheckCircle2, BadgePercent, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(10);
    const { requestOTP, verifyOTP } = useAuth();
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        let interval;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    if (!isOpen) return null;

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }
        setLoading(true);
        // Add a mock loader for feel
        setTimeout(async () => {
            const res = await requestOTP(phone);
            setLoading(false);
            if (res.success) {
                setStep('otp');
                setTimer(30);
                setTimeout(() => inputRefs[0].current?.focus(), 100);
            } else {
                toast.error(res.message || "Failed to send OTP");
            }
        }, 600);
    };

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 4) {
            toast.error("Please enter complete OTP");
            return;
        }
        setLoading(true);
        setTimeout(async () => {
            const res = await verifyOTP(phone, otpString);
            setLoading(false);
            if (res.success) {
                toast.success("Successfully logged in!");
                onClose();
            } else {
                toast.error(res.message || "Invalid OTP");
            }
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-[850px] mx-4 bg-[#6A4E46] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[480px]">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-800 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all md:text-gray-400 md:bg-transparent md:hover:bg-gray-100"
                >
                    <X size={20} className="md:text-gray-600" />
                </button>

                {/* Left Side (Dark Brown Banner) */}
                <div className="hidden md:flex flex-col items-center justify-center w-[55%] p-10 text-white relative">
                    <div className="text-center space-y-2 mb-8 mt-4">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <ShieldCheck size={40} className="text-yellow-400" />
                            <div className="flex flex-col text-left">
                                <span className="font-serif font-bold text-3xl leading-tight tracking-wide">SECURE</span>
                                <span className="font-serif font-bold text-3xl leading-tight tracking-wide">VISION</span>
                            </div>
                        </div>
                        <p className="font-semibold text-[15px] pt-4 tracking-wide text-white/90">Welcome! Register to avail the best deals!</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full px-2">
                        {/* Feature 1 */}
                        <div className="bg-[#594038] rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                            <div className="flex justify-center mb-2">
                                <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                                    <CheckCircle2 size={18} className="text-white" />
                                </div>
                            </div>
                            <h4 className="font-bold text-[13px] leading-tight mb-2 text-white">Zero Subscription Fees</h4>
                            <p className="text-[10px] text-white/70 font-medium leading-relaxed">Access to premium services without any charges</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#594038] rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                            <div className="flex justify-center mb-2">
                                <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                                    <BadgePercent size={18} className="text-white" />
                                </div>
                            </div>
                            <h4 className="font-bold text-[13px] leading-tight mb-2 text-white">Lowest price guaranteed</h4>
                            <p className="text-[10px] text-white/70 font-medium leading-relaxed">Explore unbeatable prices and unmatchable value</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-[#594038] rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                            <div className="flex justify-center mb-2">
                                <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                                    <Lock size={18} className="text-white" />
                                </div>
                            </div>
                            <h4 className="font-bold text-[13px] leading-tight mb-2 text-white">100% secure & spam free</h4>
                            <p className="text-[10px] text-white/70 font-medium leading-relaxed">Guaranteed data protection & spam-free inbox</p>
                        </div>
                    </div>
                </div>

                {/* Right Side (White Content) */}
                <div className="w-full md:w-[45%] bg-white m-2 rounded-xl flex flex-col items-center justify-center p-8 md:p-10 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                    
                    {step === 'phone' ? (
                        <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-[#0e1629] text-2xl font-bold mb-1 font-serif text-center leading-tight">Unlock Superior Discounts</h2>
                            <p className="text-[#6A4E46] text-[15px] font-semibold mb-8 text-center mt-2">Enter Mobile Number</p>

                            <form onSubmit={handlePhoneSubmit} className="w-full space-y-6">
                                <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#6A4E46] focus-within:ring-1 focus-within:ring-[#6A4E46] transition-all bg-white shadow-sm">
                                    <div className="flex items-center justify-center px-4 bg-gray-50 border-r border-gray-300 text-gray-700 font-semibold space-x-2 text-[15px]">
                                        <img src="https://flagcdn.com/w20/in.png" alt="India flag" className="w-5" />
                                        <span>+91</span>
                                    </div>
                                    <input 
                                        type="tel" 
                                        maxLength="10"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full px-4 py-3.5 focus:outline-none text-gray-800 font-medium text-[15px]"
                                        placeholder="Enter Mobile Number"
                                    />
                                </div>

                                <div className="flex items-start gap-2.5 px-1">
                                    <input 
                                        type="checkbox" 
                                        id="updates" 
                                        defaultChecked 
                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#6A4E46] focus:ring-[#6A4E46] cursor-pointer" 
                                    />
                                    <label htmlFor="updates" className="text-[13px] text-gray-600 font-medium cursor-pointer leading-tight">
                                        Notify me for any updates & offers
                                    </label>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading || phone.length < 10}
                                    className="w-full bg-[#8A5A44] hover:bg-[#6A4E46] text-white font-bold py-4 rounded-xl shadow-md transition-all uppercase tracking-wider text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Submit'}
                                </button>
                            </form>
                            
                            <div className="mt-10 text-center space-y-4 w-full">
                                <p className="text-[11px] text-gray-400 font-medium">
                                    I accept that I have read & understood SecureVision's <br/>
                                    <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">T&Cs</a>.
                                </p>
                                <button className="text-[13px] text-gray-400 font-semibold underline hover:text-[#6A4E46] transition-colors">
                                    Trouble logging in?
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-[#0e1629] text-2xl font-bold mb-4 font-serif text-center">OTP Verification</h2>
                            
                            <div className="text-center mb-8">
                                <p className="text-gray-500 text-[14px] font-medium leading-relaxed">
                                    We have sent verification code to
                                </p>
                                <div className="flex items-center justify-center space-x-2 mt-1">
                                    <span className="font-bold text-gray-800 text-[15px]">+91 {phone}</span>
                                    <button 
                                        onClick={() => setStep('phone')} 
                                        className="text-[13px] text-teal-600 font-bold border border-teal-600 px-2 py-0.5 rounded-full hover:bg-teal-50 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center gap-3 md:gap-4 mb-6 w-full">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={inputRefs[idx]}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#6A4E46] focus:ring-1 focus:ring-[#6A4E46] focus:outline-none transition-all shadow-sm bg-gray-50 focus:bg-white text-gray-800"
                                    />
                                ))}
                            </div>

                            <div className="w-full flex justify-center mb-6">
                                {timer > 0 ? (
                                    <p className="text-[13px] font-bold text-gray-500 flex items-center">
                                        ⏱ Resend OTP in {timer} Sec
                                    </p>
                                ) : (
                                    <button 
                                        onClick={() => setTimer(30)}
                                        className="text-[13px] font-bold text-[#6A4E46] flex items-center hover:underline"
                                    >
                                        Resend OTP Now
                                    </button>
                                )}
                            </div>

                            <button 
                                onClick={handleVerify}
                                disabled={loading || otp.join('').length < 4}
                                className="w-full bg-[#f1f2f4] text-[#a4a9b3] border border-gray-200 hover:bg-[#6A4E46] hover:text-white hover:border-[#6A4E46] font-bold py-4 rounded-xl shadow-sm transition-all uppercase tracking-wider text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>
                            
                            <div className="mt-8 text-center space-y-4 w-full">
                                <button className="text-[13px] text-gray-400 font-semibold underline hover:text-[#6A4E46] transition-colors">
                                    Trouble logging in?
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
