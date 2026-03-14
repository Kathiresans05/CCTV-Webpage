import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user and token from localStorage on mount
        const savedUserStr = localStorage.getItem('secureVisionUser');
        const savedToken = localStorage.getItem('secureVisionToken');
        if (savedUserStr && savedToken) {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);
            setToken(savedToken);

            if (savedUser.role === 'employee') {
                fetch('/api/attendance/checkin', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${savedToken}` }
                }).catch(err => console.error("Auto Check-in failed:", err));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('secureVisionUser', JSON.stringify(data.user));
                localStorage.setItem('secureVisionToken', data.token);

                // Auto-Attendance Logic: Check-in Employee automatically on login
                if (data.user.role === 'employee') {
                    try {
                        await fetch('/api/attendance/checkin', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${data.token}` }
                        });
                    } catch (err) {
                        console.error("Auto Check-in failed:", err);
                    }
                }

                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Could not connect to server.' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('secureVisionUser', JSON.stringify(data.user));
                localStorage.setItem('secureVisionToken', data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Could not connect to server.' };
        }
    };

    const logout = async () => {
        // Auto-Attendance Logic: Check-out Employee automatically on logout
        if (user && user.role === 'employee' && token) {
            try {
                await fetch('/api/attendance/checkout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Auto Check-out failed:", err);
            }
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem('secureVisionUser');
        localStorage.removeItem('secureVisionToken');
    };

    const updateProfile = (userData) => {
        setUser(userData);
        localStorage.setItem('secureVisionUser', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, signup, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
