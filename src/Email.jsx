import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const EmailList = ({ onUserClick, selectedUser }) => {
    const [usersWithMessages, setUsersWithMessages] = useState([]); // Xabar almashgan foydalanuvchilar
    const [allUsers, setAllUsers] = useState([]); // Barcha foydalanuvchilar
    const [searchQueryMessages, setSearchQueryMessages] = useState(''); // Xabarlar bo'yicha qidirish
    const [searchQueryAllUsers, setSearchQueryAllUsers] = useState(''); // Barcha foydalanuvchilar uchun qidirish
    const [loading, setLoading] = useState(true);
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (loggedInUser) {
            fetchMessages();
        }
    }, [loggedInUser]);

    const fetchMessages = () => {
        axios.get('https://insta-lvyt.onrender.com/messages')
            .then(response => {
                const messages = response.data;
                const filteredUsers = messages
                    .filter(msg => msg.sender === loggedInUser.email || msg.receiver === loggedInUser.email)
                    .map(msg => msg.sender === loggedInUser.email ? msg.receiver : msg.sender)
                    .filter((email, index, self) => self.indexOf(email) === index); // Takrorlanuvchilarni olib tashlash

                // Xabar almashgan foydalanuvchilarni o'rnating
                setUsersWithMessages(allUsers.filter(user => filteredUsers.includes(user.email)));
            })
            .catch(error => console.error("Xabarlarni olishda xato:", error));
    };

    const fetchUsers = () => {
        axios.get('https://insta-lvyt.onrender.com/users')
            .then(response => {
                setAllUsers(response.data);
                setLoading(false);
                fetchMessages(); // Foydalanuvchilarni yuklagandan so'ng, xabarlarni yuklang
            })
            .catch(error => {
                console.error("Foydalanuvchilarni olishda xato:", error);
                setLoading(false);
            });
    };

    // Foydalanuvchilarni xabarlar bo'yicha filtrlash
    const getFilteredUsersByMessages = () => {
        return usersWithMessages.filter(user => 
            user.email.toLowerCase().includes(searchQueryMessages.toLowerCase())
        );
    };

    // Barcha foydalanuvchilarni filtrlash
    const getFilteredAllUsers = () => {
        return allUsers.filter(user => 
            user.email.toLowerCase().includes(searchQueryAllUsers.toLowerCase())
        );
    };

    const handleUserClick = (user) => {
        onUserClick(user);
    };

    return (
        <div className="md:w-1/3 w-full border-r border-gray-300 bg-gray-900 flex flex-col">
            
            <input
                type="text"
                placeholder="Barcha foydalanuvchilarni qidirish...   (_sherbek_off)"
                className="p-2 m-4 rounded-full border border-gray-400 bg-gray-800 text-white placeholder-gray-300 placeholder:font-bold px-5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={searchQueryAllUsers}
                onChange={(e) => setSearchQueryAllUsers(e.target.value)}
            />
            <input
                type="text"
                placeholder="Xabarlar bo'yicha qidirish..."
                className="p-2 m-4 rounded-full border border-gray-400 bg-gray-800 text-white placeholder-gray-300 placeholder:font-bold px-5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={searchQueryMessages}
                onChange={(e) => {
                    setSearchQueryMessages(e.target.value);
                    fetchMessages(); // Qidiruv o'zgarganda xabarlarni qayta yuklang
                }}
            />
            
            <div className="flex-grow overflow-y-auto">
                {loading ? (
                    <div className="animate-pulse">
                        <div className="flex items-center py-3 px-4 bg-gray-700 text-white">
                            <div className="rounded-full bg-gray-600 h-8 w-8 mr-2"></div>
                            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        </div>
                        <div className="flex items-center py-3 px-4 bg-gray-700 text-white">
                            <div className="rounded-full bg-gray-600 h-8 w-8 mr-2"></div>
                            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        </div>
                        <div className="flex items-center py-3 px-4 bg-gray-700 text-white">
                            <div className="rounded-full bg-gray-600 h-8 w-8 mr-2"></div>
                            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Barcha foydalanuvchilarni qidirish */}
                        {searchQueryAllUsers && getFilteredAllUsers().map(user => (
                            <div
                                key={user.email}
                                className={`flex items-center py-3 px-4 cursor-pointer transition-colors duration-200 ease-in-out 
                                ${selectedUser === user.email ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-white'}`}
                                onClick={() => handleUserClick(user)}
                            >
                                <FaUserCircle className="text-gray-400 mr-2 text-2xl" />
                                <span className="font-medium">{user.email}</span>
                            </div>
                        ))}
                        {/* Xabarlar bo'yicha filtrlash */}
                        {getFilteredUsersByMessages().map(user => (
                            <div
                                key={user.email}
                                className={`flex items-center py-3 px-4 cursor-pointer transition-colors duration-200 ease-in-out 
                                ${selectedUser === user.email ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-white'}`}
                                onClick={() => handleUserClick(user)}
                            >
                                <FaUserCircle className="text-gray-400 mr-2 text-2xl" />
                                <span className="font-medium">{user.email}</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailList;
