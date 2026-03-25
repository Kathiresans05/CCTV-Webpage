import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, User, MessageSquare, Clock } from 'lucide-react';

const Chat = ({ currentUser, targetUser, token }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initialize socket
        const newSocket = io(window.location.origin.replace('5173', '5000'), {
            transports: ['websocket'],
            upgrade: false
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
            newSocket.emit('join', currentUser.id || currentUser._id);
        });

        newSocket.on('new-message', (message) => {
            // Only add if relevant to current conversation
            const isRelevant = 
                (message.sender === currentUser.id || message.sender === currentUser._id || message.sender === targetUser.id || message.sender === targetUser._id) &&
                (message.receiver === currentUser.id || message.receiver === currentUser._id || message.receiver === targetUser.id || message.receiver === targetUser._id);
            
            if (isRelevant) {
                setMessages(prev => [...prev, message]);
            }
        });

        setSocket(newSocket);

        // Fetch history
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat/history/${currentUser.id || currentUser._id}/${targetUser.id || targetUser._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setMessages(data.data);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        fetchHistory();

        return () => newSocket.close();
    }, [targetUser, currentUser, token]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            senderId: currentUser.id || currentUser._id,
            receiverId: targetUser.id || targetUser._id,
            content: newMessage.trim()
        };

        socket.emit('send-message', messageData);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-border-soft overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border-soft bg-bg-soft/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-navy/10 flex items-center justify-center text-primary-navy font-bold">
                    {targetUser.name[0]}
                </div>
                <div>
                    <h3 className="font-bold text-primary-navy">{targetUser.name}</h3>
                    <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest">
                        {targetUser.role === 'admin' ? 'System Administrator' : 'Technician'}
                    </p>
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50 space-y-2">
                        <MessageSquare size={48} />
                        <p className="text-[14px] font-medium">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = msg.sender === (currentUser.id || currentUser._id);
                        return (
                            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                                    isMine 
                                        ? 'bg-primary-navy text-white rounded-tr-none' 
                                        : 'bg-white border border-border-soft text-primary-navy rounded-tl-none'
                                }`}>
                                    <p className="text-[14px] leading-relaxed">{msg.content}</p>
                                    <div className={`flex items-center gap-1 mt-2 text-[14px] ${isMine ? 'text-slate-400' : 'text-text-muted'} font-medium`}>
                                        <Clock size={10} />
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border-soft flex gap-3">
                <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 zoho-input h-12"
                />
                <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 bg-primary-navy rounded-[10px] flex items-center justify-center text-white hover:bg-navy-dark transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary-navy/20"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chat;
