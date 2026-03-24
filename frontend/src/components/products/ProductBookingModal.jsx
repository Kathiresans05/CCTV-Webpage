import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, Banknote, MapPin, User, ChevronRight, Loader2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductBookingModal = ({ isOpen, onClose, product }) => {
    // --- State Variables ---
    const [currentStep, setCurrentStep] = useState(1);
    
    // Step 1: Details
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    
    // Step 2: Payment
    const [paymentMethod, setPaymentMethod] = useState(''); // 'cod' | 'online'
    const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'cod_confirmed' | 'paid' | 'failed'
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    // Step 3: Address
    const [addressData, setAddressData] = useState({
        phone: '',
        country: '',
        state: '',
        city: '',
        fullAddress: '',
        preferredDate: '',
        timeSlot: ''
    });
    
    // Step 4: Confirmation
    const [bookingStatus, setBookingStatus] = useState('');
    const [bookingId, setBookingId] = useState('');
    
    // Close Confirmation
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    // Reset state when modal is unexpectedly closed and reopened with a new product
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setCustomerName('');
            setCustomerEmail('');
            setPaymentMethod('');
            setPaymentStatus('pending');
            setAddressData({ phone: '', country: '', state: '', city: '', fullAddress: '', preferredDate: '', timeSlot: '' });
            setShowCloseConfirm(false);
            setBookingStatus('');
            setBookingId('');
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    // --- Validation Logic ---
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isStep1Valid = customerName.trim().length > 0 && isValidEmail(customerEmail);
    
    const isStep3Valid = 
        addressData.phone.trim().length >= 10 &&
        addressData.country.trim().length > 0 &&
        addressData.state.trim().length > 0 &&
        addressData.city.trim().length > 0 &&
        addressData.fullAddress.trim().length > 0 &&
        addressData.preferredDate.trim().length > 0 &&
        addressData.timeSlot.trim().length > 0;

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
        setCurrentStep(3); // Move directly to address
    };

    const handleProceedToPay = () => {
        setIsProcessingPayment(true);
        // Simulate Payment Gateway Delay
        setTimeout(() => {
            setIsProcessingPayment(false);
            setPaymentStatus('paid');
            toast.success("Payment successful!");
            setCurrentStep(3); // Move to address
        }, 2000);
    };

    const handleConfirmBooking = () => {
        // Simulate API Saving Booking
        setBookingId(`BKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
        setBookingStatus('confirmed');
        setCurrentStep(4);
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
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= s.step ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
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
                            <p className="text-gray-500 text-sm mb-6">Are you sure you want to close? Your current booking progress will be lost.</p>
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

                    {/* STEP 1: BASIC DETAILS */}
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                    <input 
                                        type="email" 
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400 ${customerEmailInitialsError ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                    {customerEmail.length > 0 && !isValidEmail(customerEmail) && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium">Please enter a valid email address.</p>
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
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={() => setPaymentMethod('online')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'online' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'online' ? 'bg-gray-900 text-white' : 'bg-blue-50 text-blue-500'}`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <span className="font-semibold text-gray-900 text-sm text-center">Pay Online<br/><span className="text-[10px] text-gray-400 font-normal">Cards, UPI, NetBanking</span></span>
                                </button>
                                
                                <button
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'cod' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-gray-900 text-white' : 'bg-green-50 text-green-600'}`}>
                                        <Banknote size={24} />
                                    </div>
                                    <span className="font-semibold text-gray-900 text-sm text-center">Cash on Delivery<br/><span className="text-[10px] text-gray-400 font-normal">Pay when it arrives</span></span>
                                </button>
                            </div>

                            {/* Payment specific actions */}
                            {paymentMethod === 'cod' && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="text-green-600 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="font-bold text-green-900 text-sm mb-1">You selected Cash on Delivery</h4>
                                            <p className="text-green-700 text-xs">Payment of ₹{product.price.toLocaleString('en-IN')} will be collected at the time of delivery or service confirmation.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleConfirmCOD}
                                        className="w-full mt-5 py-3 bg-gray-900 text-white font-bold rounded-lg shadow hover:bg-black transition-all"
                                    >
                                        Confirm COD & Proceed
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'online' && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-blue-900 font-medium text-sm">Booking Amount</span>
                                        <span className="text-xl font-bold text-blue-900">₹{product.price.toLocaleString('en-IN')}</span>
                                    </div>
                                    <p className="text-blue-700 text-xs mb-5">You will be redirected to our secure payment gateway to complete this transaction.</p>
                                    
                                    <button
                                        onClick={handleProceedToPay}
                                        disabled={isProcessingPayment}
                                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg shadow hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>Proceed to Pay ₹{product.price.toLocaleString('en-IN')}</>
                                        )}
                                    </button>
                                </div>
                            )}
                            
                            {!paymentMethod && (
                                <p className="text-center text-gray-400 text-sm my-8">Please select a payment method above</p>
                            )}
                        </div>
                    )}

                    {/* STEP 3: ADDRESS FORM */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Delivery Details</h3>
                                {paymentStatus === 'paid' && <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Paid Online</span>}
                                {paymentStatus === 'cod_confirmed' && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">COD Confirmed</span>}
                            </div>
                            
                            <div className="space-y-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                        <input 
                                            type="tel" 
                                            value={addressData.phone}
                                            onChange={(e) => setAddressData({...addressData, phone: e.target.value})}
                                            placeholder="+91 9876543210"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={addressData.country}
                                            onChange={(e) => setAddressData({...addressData, country: e.target.value})}
                                            placeholder="Eg. India"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={addressData.state}
                                            onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                                            placeholder="Eg. Maharashtra"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={addressData.city}
                                            onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                                            placeholder="Eg. Mumbai"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Address <span className="text-red-500">*</span></label>
                                    <textarea 
                                        value={addressData.fullAddress}
                                        onChange={(e) => setAddressData({...addressData, fullAddress: e.target.value})}
                                        placeholder="House No., Building Name, Street Area, Landmark"
                                        rows="2"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-sm resize-none custom-scrollbar"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Date <span className="text-red-500">*</span></label>
                                        <input 
                                            type="date" 
                                            value={addressData.preferredDate}
                                            onChange={(e) => setAddressData({...addressData, preferredDate: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Time Slot <span className="text-red-500">*</span></label>
                                        <select 
                                            value={addressData.timeSlot}
                                            onChange={(e) => setAddressData({...addressData, timeSlot: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEwIDEybC01LTVoMTBsLTUgNXoiIGZpbGw9IiM2YjcyODAiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_10px] pr-8"
                                        >
                                            <option value="">Select a slot</option>
                                            <option value="10:00 AM - 1:00 PM">Morning (10AM - 1PM)</option>
                                            <option value="1:00 PM - 4:00 PM">Afternoon (1PM - 4PM)</option>
                                            <option value="4:00 PM - 7:00 PM">Evening (4PM - 7PM)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={!isStep3Valid}
                                onClick={handleConfirmBooking}
                                className="w-full mt-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 hover:bg-black disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                Confirm Booking (Total: ₹{product.price.toLocaleString('en-IN')})
                                <Package size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {currentStep === 4 && (
                        <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-4">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-lg">
                                <CheckCircle size={40} className="animate-[bounce_1s_ease-in-out]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-gray-500 text-sm mb-6">Your booking has been placed successfully.</p>
                            
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-left mb-8 shadow-inner">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Booking ID</span>
                                    <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">{bookingId}</span>
                                </div>
                                <div className="space-y-2 text-sm">
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
                                Back to Products
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Custom variable declarations to prevent strict mode undefined errors temporarily */}
            <span className="hidden">{(() => { var customerEmailInitialsError; return ''; })()}</span>
        </div>
    );
};

export default ProductBookingModal;
