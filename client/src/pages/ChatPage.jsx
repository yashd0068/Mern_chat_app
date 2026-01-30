// import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Chat/Sidebar';
// import ChatWindow from '../components/Chat/ChatWindow';
// import { useChat } from '../context/ChatContext';

// const ChatPage = () => {
//     const { selectedChat, setSelectedChat } = useChat();
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//     // Save selected chat to localStorage
//     useEffect(() => {
//         if (selectedChat) {
//             localStorage.setItem('selectedChat', JSON.stringify(selectedChat));
//         }
//     }, [selectedChat]);

//     // Load selected chat from localStorage on mount
//     useEffect(() => {
//         const savedChat = localStorage.getItem('selectedChat');
//         if (savedChat) {
//             try {
//                 const chat = JSON.parse(savedChat);
//                 setSelectedChat(chat);
//             } catch (error) {
//                 console.error('Error loading saved chat:', error);
//                 localStorage.removeItem('selectedChat');
//             }
//         }
//     }, []);

//     const handleSelectChat = (chat) => {
//         setSelectedChat(chat);
//         setIsMobileMenuOpen(false);
//     };

//     const handleBackToChats = () => {
//         setSelectedChat(null);
//         localStorage.removeItem('selectedChat');
//     };

//     return (
//         <div className="h-screen flex flex-col md:flex-row overflow-hidden">
//             {/* Mobile Menu Toggle */}
//             <button
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg"
//             >
//                 <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//             </button>

//             {/* Sidebar for Mobile */}
//             <div className={`md:hidden fixed inset-0 z-40 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
//                 <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
//                 <div className="absolute inset-y-0 left-0 w-80 bg-white dark:bg-gray-900">
//                     <Sidebar
//                         onSelectChat={handleSelectChat}
//                         selectedChat={selectedChat}
//                     />
//                 </div>
//             </div>

//             {/* Desktop Sidebar - Hide when chat is selected on mobile */}
//             <div className={`
//     ${selectedChat ? 'hidden' : 'block'}
//     md:block md:w-80 md:border-r dark:border-gray-700
//     h-full
// `}>
//                 <Sidebar
//                     onSelectChat={handleSelectChat}
//                     selectedChat={selectedChat}
//                 />
//             </div>


//             {/* Chat Window */}
//             <div className={`
//     ${isMobileMenuOpen ? 'hidden' : 'block'}
//     md:block flex-1 h-full
// `}>
//                 <ChatWindow chat={selectedChat} onBack={handleBackToChats} />
//             </div>


//             {/* Mobile: Show back button when chat is selected */}
//             {selectedChat && (
//                 <button
//                     onClick={handleBackToChats}
//                     className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg"
//                 >
//                     <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                     </svg>
//                 </button>
//             )}
//         </div>
//     );
// };

// export default ChatPage;

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Chat/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import { useChat } from '../context/ChatContext';

const ChatPage = () => {
    const { selectedChat, setSelectedChat } = useChat();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Save selected chat to localStorage
    useEffect(() => {
        if (selectedChat) {
            localStorage.setItem('selectedChat', JSON.stringify(selectedChat));
        }
    }, [selectedChat]);

    // Load selected chat from localStorage on mount
    useEffect(() => {
        const savedChat = localStorage.getItem('selectedChat');
        if (savedChat) {
            try {
                const chat = JSON.parse(savedChat);
                setSelectedChat(chat);
            } catch (error) {
                console.error('Error loading saved chat:', error);
                localStorage.removeItem('selectedChat');
            }
        }
    }, []);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setIsMobileMenuOpen(false);
    };

    const handleBackToChats = () => {
        setSelectedChat(null);
        localStorage.removeItem('selectedChat');
    };

    return (
        <div className="h-screen flex bg-white dark:bg-gray-900 overflow-hidden">
            {/* Mobile Menu Toggle - Only show when sidebar is hidden */}
            {!selectedChat && (
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                    <div className="absolute inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 shadow-xl">
                        <Sidebar
                            onSelectChat={handleSelectChat}
                            selectedChat={selectedChat}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className={`
                hidden md:block md:w-80 lg:w-96
                ${selectedChat ? 'md:hidden lg:block' : ''}
                h-full border-r dark:border-gray-700
            `}>
                <Sidebar
                    onSelectChat={handleSelectChat}
                    selectedChat={selectedChat}
                />
            </div>

            {/* Chat Window */}
            <div className={`
                flex-1 h-full
                ${isMobileMenuOpen ? 'hidden' : 'block'}
            `}>
                <ChatWindow chat={selectedChat} onBack={handleBackToChats} />
            </div>

            {/* Mobile: Show back button when chat is selected */}
            {selectedChat && (
                <button
                    onClick={handleBackToChats}
                    className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default ChatPage;