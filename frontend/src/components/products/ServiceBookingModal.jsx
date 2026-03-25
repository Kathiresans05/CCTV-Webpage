import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, Banknote, MapPin, User, ChevronRight, Loader2, Package, Landmark, ShieldCheck, Lock, Smartphone, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ServiceBookingModal = ({ product, onClose }) => {
    const { user, isAuthenticated, token } = useAuth();

    // --- State Variables ---
    const [currentStep, setCurrentStep] = useState(1);
    
    // Step 1: Details
    const [customerName, setCustomerName] = useState(user?.name || '');
    const [customerEmail, setCustomerEmail] = useState(user?.email || '');
    
    // Step 2: Payment
    const [paymentMethod, setPaymentMethod] = useState(''); // 'cod' | 'online'
    const [onlineMethod, setOnlineMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
    const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'cod_confirmed' | 'paid' | 'failed'
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    // Step 3: Address
    const [addressData, setAddressData] = useState({
        phone: user?.phone || '',
        country: 'India',
        state: '',
        city: '',
        fullAddress: ''
    });
    
    // Step 4: Confirmation
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingStatus, setBookingStatus] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Close Confirmation
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    if (!product) return null;

    // --- Validation Logic ---
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isStep1Valid = customerName.trim().length > 0 && isValidEmail(customerEmail);
    
    const isStep3Valid = 
        addressData.phone.trim().length >= 10 &&
        addressData.country.trim().length > 0 &&
        addressData.state.trim().length > 0 &&
        addressData.city.trim().length > 0 &&
        addressData.fullAddress.trim().length > 0;

    // --- Handlers ---
    const handleCloseAttempt = () => {
        if (currentStep > 1 && currentStep < 4 && !showCloseConfirm) {
            setShowCloseConfirm(true);
        } else {
            onClose();
        }
    };

    const handleConfirmCOD = () => {
        setPaymentStatus('cod_confirmed');
        toast.success("Cash on Delivery selected successfully!");
        setCurrentStep(3);
    };

    const handleProceedToPay = () => {
        setIsProcessingPayment(true);
        // Simulate Payment Gateway Delay
        setTimeout(() => {
            setIsProcessingPayment(false);
            setPaymentStatus('paid');
            toast.success("Payment successful!");
            setCurrentStep(3);
        }, 1500);
    };

    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const combinedAddress = `${addressData.fullAddress}, ${addressData.state}, ${addressData.country}`;
            const headers = { 'Content-Type': 'application/json' };
            if (token && token !== 'null' && token !== 'undefined') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    productName: product.name,
                    productId: product.id || product._id || 0,
                    productPrice: product.price,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    customerPhone: addressData.phone,
                    address: combinedAddress,
                    city: addressData.city,
                    notes: `Payment Method: ${paymentMethod}, Payment Status: ${paymentStatus}`
                })
            });

            const data = await response.json();

            if (data.success) {
                setBookingStatus('confirmed');
                setBookingId(data.data?.bookingId || `BKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
                setCurrentStep(4);
            } else {
                toast.error(data.message || 'Something went wrong while booking.');
                setErrorMessage(data.message || 'Failed to place booking.');
            }
        } catch (error) {
            console.error("Booking error", error);
            toast.error('Could not connect to the server. Please try again.');
            setErrorMessage('Network error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Helpers ---
    const StepIndicator = () => (
        <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0 rounded"></div>
            <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-900 z-0 rounded transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
            
            {[
                { step: 1, label: "Details", icon: <User size={14} /> },
                { step: 2, label: "Payment", icon: <CreditCard size={14} /> },
                { step: 3, label: "Address", icon: <MapPin size={14} /> },
                { step: 4, label: "Done", icon: <CheckCircle size={14} /> }
            ].map((s) => (
                <div key={s.step} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                        currentStep >= s.step 
                            ? 'bg-gray-900 border-gray-900 text-white' 
                            : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                        {currentStep > s.step ? <CheckCircle size={16} /> : s.icon}
                    </div>
                    <span className={`text-[14px] font-bold uppercase tracking-wider ${currentStep >= s.step ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseAttempt}
        >
            <div 
                className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 p-2 flex-shrink-0">
                            <img 
                                src={product.image || (product.productImages && product.productImages[0]) || '/fallback-camera.png'} 
                                alt={product.name} 
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">{product.name}</h2>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-xl font-extrabold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                    {currentStep < 4 && (
                        <button 
                            onClick={handleCloseAttempt}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors self-start"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Close Confirmation Overlay */}
                {showCloseConfirm && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                        <div className="max-w-sm">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                            <p className="text-gray-500 text-[14px] mb-6">Are you sure you want to close? Your current booking progress will be lost.</p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowCloseConfirm(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                                >
                                    Continue Booking
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scrollable Body */}
                <div className="px-5 md:px-8 py-6 overflow-y-auto custom-scrollbar flex-grow">
                    <StepIndicator />

                    {/* Error Display */}
                    {errorMessage && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-[14px] font-semibold flex items-center gap-2">
                           <X size={16} /> {errorMessage}
                        </div>
                    )}

                    {/* STEP 1: BASIC DETAILS */}
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                    <input 
                                        type="email" 
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400 border-gray-200`}
                                    />
                                    {customerEmail.length > 0 && !isValidEmail(customerEmail) && (
                                        <p className="text-red-500 text-[14px] mt-1.5 font-medium">Please enter a valid email address.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                disabled={!isStep1Valid}
                                onClick={() => setCurrentStep(2)}
                                className="w-full mt-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 hover:bg-black disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                Continue to Payment
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: PAYMENT METHOD */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-lg mx-auto">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-[#1e293b] mb-1">Select Payment Method</h3>
                                <p className="text-gray-400 text-[13px]">Choose your preferred payment option:</p>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Main Option Selection - Subtle pills */}
                                <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
                                    <button
                                        onClick={() => setPaymentMethod('online')}
                                        className={`flex-1 py-2.5 rounded-lg font-bold text-[14px] transition-all ${paymentMethod === 'online' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Pay Online
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`flex-1 py-2.5 rounded-lg font-bold text-[14px] transition-all ${paymentMethod === 'cod' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Cash on Delivery
                                    </button>
                                </div>

                                {/* Pay Online - Detailed Panel */}
                                {paymentMethod === 'online' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        {[
                                            { 
                                                id: 'upi', 
                                                label: 'UPI', 
                                                desc: 'Pay via UPI Apps', 
                                                rightIcon: (
                                                    <div className="flex items-center gap-1 italic font-black text-[#666666]">
                                                        <span className="text-blue-600 text-lg">UPI</span>
                                                        <div className="w-0.5 h-4 bg-gray-200 mx-1"></div>
                                                        <ChevronRight size={14} className="text-green-500" />
                                                    </div>
                                                )
                                            },
                                            { 
                                                id: 'card', 
                                                label: 'Credit / Debit Card', 
                                                desc: 'Pay with your card', 
                                                rightIcon: (
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-[#1a1f71] text-white px-1.5 py-0.5 rounded text-[8px] font-bold italic">VISA</div>
                                                        <div className="flex -space-x-1">
                                                            <div className="w-4 h-4 rounded-full bg-red-500 opacity-90"></div>
                                                            <div className="w-4 h-4 rounded-full bg-orange-400 opacity-90"></div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            { 
                                                id: 'netbanking', 
                                                label: 'Net Banking', 
                                                desc: 'Pay via Internet Banking', 
                                                rightIcon: <Landmark size={24} className="text-gray-400/60" /> 
                                            },
                                            { 
                                                id: 'wallet', 
                                                label: 'Wallets', 
                                                desc: 'Pay via Wallets', 
                                                rightIcon: (
                                                    <div className="flex items-center gap-2 opacity-60">
                                                        <div className="bg-blue-500 text-white px-1 py-0.5 rounded text-[7px] font-bold">Paytm</div>
                                                        <div className="bg-purple-600 text-white px-1 py-0.5 rounded text-[7px] font-bold">PhonePe</div>
                                                        <div className="flex items-center gap-0.5 bg-gray-100 px-1 py-0.5 rounded text-[7px] font-bold">
                                                            <span className="text-blue-500">G</span><span className="text-red-500">Pay</span>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        ].map((m) => (
                                            <label 
                                                key={m.id}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${onlineMethod === m.id ? 'border-blue-600 bg-blue-50/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <input 
                                                        type="radio" 
                                                        name="onlineMethod"
                                                        checked={onlineMethod === m.id}
                                                        onChange={() => setOnlineMethod(m.id)}
                                                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div className="flex-grow">
                                                    <p className="font-bold text-[#1e293b] text-[15px] leading-tight">{m.label}</p>
                                                    <p className="text-gray-400 text-[12px] mt-0.5">{m.desc}</p>
                                                </div>

                                                <div className="ml-auto">
                                                    {m.rightIcon}
                                                </div>
                                            </label>
                                        ))}

                                        <div className="pt-6">
                                            <button
                                                onClick={handleProceedToPay}
                                                disabled={isProcessingPayment}
                                                className="w-full py-4 bg-[#2563eb] text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isProcessingPayment ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <>Proceed to Pay</>
                                                )}
                                            </button>

                                            {/* Trust Indicators */}
                                            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
                                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                                    <ShieldCheck size={14} className="text-gray-600" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Secure Payment</span>
                                                </div>
                                                <div className="w-px h-3 bg-gray-200"></div>
                                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                                    <Lock size={12} className="text-gray-600" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">128-bit SSL</span>
                                                </div>
                                                <div className="w-px h-3 bg-gray-200"></div>
                                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                                    <CheckCircle size={14} className="text-gray-600" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">100% Safe & Trusted</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Cash on Delivery - Panel */}
                                {paymentMethod === 'cod' && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 text-center mb-6">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-50 text-green-600 shadow-sm">
                                                <Banknote size={32} />
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-1">Pay when it arrives</h4>
                                            <p className="text-gray-500 text-[14px] px-4">Your order will be processed and payment will be collected at delivery.</p>
                                        </div>
                                        <button
                                            onClick={handleConfirmCOD}
                                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-900/10 hover:bg-black transition-all"
                                        >
                                            Continue to Address
                                        </button>
                                    </div>
                                )}
                                
                                {!paymentMethod && (
                                    <div className="py-12 text-center text-gray-300">
                                        <CreditCard size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="font-medium text-[14px]">Please select a payment method</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ADDRESS FORM */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Delivery Details</h3>
                                {paymentStatus === 'paid' && <span className="bg-green-100 text-green-700 text-[14px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Paid Online</span>}
                                {paymentStatus === 'cod_confirmed' && <span className="bg-orange-100 text-orange-700 text-[14px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">COD Confirmed</span>}
                            </div>
                            
                            <div className="space-y-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[14px] font-semibold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                        <input 
                                            type="tel" 
                                            value={addressData.phone}
                                            onChange={(e) => setAddressData({...addressData, phone: e.target.value})}
                                            placeholder="+91 9876543210"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-[14px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-semibold text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={addressData.country}
                                            onChange={(e) => setAddressData({...addressData, country: e.target.value})}
                                            placeholder="Eg. India"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-[14px]"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[14px] font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={addressData.state}
                                            onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                                            placeholder="Eg. Maharashtra"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-[14px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={addressData.city}
                                            onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                                            placeholder="Eg. Mumbai"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-[14px]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[14px] font-semibold text-gray-700 mb-1">Full Address <span className="text-red-500">*</span></label>
                                    <textarea 
                                        value={addressData.fullAddress}
                                        onChange={(e) => setAddressData({...addressData, fullAddress: e.target.value})}
                                        placeholder="House No., Building Name, Street Area, Landmark"
                                        rows="2"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-[14px] resize-none custom-scrollbar"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                disabled={!isStep3Valid || isSubmitting}
                                onClick={handleConfirmBooking}
                                className="w-full mt-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 hover:bg-black disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={18} className="animate-spin" /> Confirming...</>
                                ) : (
                                    <>Confirm Booking (Total: ₹{product.price.toLocaleString('en-IN')}) <Package size={18} /></>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {currentStep === 4 && (
                        <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-4">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-lg">
                                <CheckCircle size={40} className="animate-[bounce_1s_ease-in-out]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Request Submitted!</h2>
                            <p className="text-gray-500 text-[14px] mb-6">Our team will contact you shortly with the delivery / installation date and time.</p>
                            
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-left mb-8 shadow-inner">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                                    <span className="text-[14px] text-gray-500 font-semibold uppercase tracking-wider">Booking ID</span>
                                    <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">{bookingId}</span>
                                </div>
                                <div className="space-y-2 text-[14px]">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Product:</span>
                                        <span className="font-semibold text-gray-900 text-right w-1/2 truncate" title={product.name}>{product.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Customer:</span>
                                        <span className="font-semibold text-gray-900">{customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Payment:</span>
                                        <span className="font-bold text-gray-900 uppercase">{paymentMethod === 'online' ? 'Online Paid' : 'Cash on Delivery'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                                        <span className="text-gray-500">Total Amount:</span>
                                        <span className="font-black text-gray-900 text-base">₹{product.price.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all"
                            >
                                Back to Details
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceBookingModal;
