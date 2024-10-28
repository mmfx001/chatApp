import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUserCircle, FaTrash, FaEdit, FaPaperPlane, FaStop, FaFileAlt, FaSmile } from 'react-icons/fa';
import { MdRecordVoiceOver, MdVideocam } from 'react-icons/md';
import EmailList from './Email';
import EmojiPicker from 'emoji-picker-react';

const Messenger = () => {
    const [users, setUsers] = useState([]);
    const chatEndRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(localStorage.getItem('selectedEmail'));



    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const [isRecordingVideo, setIsRecordingVideo] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [videoBlob, setVideoBlob] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const mediaRecorderRef = useRef(null);
    const videoRecorderRef = useRef(null);

    const [isAtTop, setIsAtTop] = useState(false);

    // Scroll pozitsiyani kuzatish
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsAtTop(true); // 300px dan yuqoriga chiqqanda tugma paydo bo'ladi
            } else {
                setIsAtTop(false); // 300px dan pastga tushganda tugma yo'qoladi
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll); // Tozalash
        };
    }, []);

    // Chatni pastga tushirish
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        fetchMessages();
    }, [loggedInUser]);
    const handleUserClick = (user) => {
        // Store selected email in localStorage
        const updatedMessages = messages.map(msg => {
            if (msg.sender === user.email && msg.receiver == loggedInUser.email && msg.status == "neprichitano") {
                return { ...msg, status: "view" };
            }
            return msg;
        });

        setMessages(updatedMessages);
        updatedMessages.forEach(msg => {
            if (msg.sender === user.email && msg.receiver == loggedInUser.email && msg.status == "view") {
                axios.put(`https://insta-lvyt.onrender.com/messages/${msg.id}`, { ...msg, status: "view" })
                    .catch(error => console.error("Error updating message status:", error));
            }
        });
        localStorage.setItem('selectedEmail', user.email);
        setSelectedUser(user);
        setNewMessage('');
        setAudioBlob(null);
        setVideoBlob(null);
        setEditingMessageId(null);
        useEffect(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, [messages]); // Xabarlar o'zgarganda pastga tushadi

    };

    const fetchMessages = () => {
        if (!loggedInUser) return;

        axios.get('https://insta-lvyt.onrender.com/messages')
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => console.error("Error fetching messages:", error));
    };


    const getFilteredUsers = () => {
        return searchQuery
            ? users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()))
            : users;
    };



    const sendMessage = () => {
        if (!newMessage.trim() && !audioBlob && !videoBlob) return;

        const message = {
            sender: loggedInUser.email,
            receiver: selectedUser.email,
            text: newMessage,
            time: new Date().toLocaleString(),
            audio: audioBlob ? URL.createObjectURL(audioBlob) : null,
            video: videoBlob ? URL.createObjectURL(videoBlob) : null,
            status: "neprichitano"

        };

        axios.post('https://insta-lvyt.onrender.com/messages', message)
            .then(() => {
                setMessages([...messages, message]);
                setNewMessage('');
                setAudioBlob(null);
                setVideoBlob(null);
                setEditingMessageId(null);
            })
            .catch(error => console.error("Error sending message:", error));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const deleteMessage = (messageId) => {
        axios.delete(`https://insta-lvyt.onrender.com/messages/${messageId}`)
            .then(() => {
                setMessages(messages.filter(msg => msg.id !== messageId));
                setEditingMessageId(null);
            })
            .catch(error => console.error("Error deleting message:", error));
    };

    const startRecordingAudio = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.start();

                const audioChunks = [];
                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                    setAudioBlob(audioBlob);
                };

                setIsRecordingAudio(true);
            });
    };

    const stopRecordingAudio = () => {
        mediaRecorderRef.current.stop();
        setIsRecordingAudio(false);
    };

    const startVideoRecording = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRecorderRef.current = new MediaRecorder(stream);
                videoRecorderRef.current.start();

                const videoChunks = [];
                videoRecorderRef.current.ondataavailable = event => {
                    videoChunks.push(event.data);
                };

                videoRecorderRef.current.onstop = () => {
                    const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
                    setVideoBlob(videoBlob);
                };

                setIsRecordingVideo(true);
            });
    };

    const stopVideoRecording = () => {
        videoRecorderRef.current.stop();
        setIsRecordingVideo(false);
    };

    const handleEditMessage = (msg) => {
        setEditingMessageId(msg.id);
        setNewMessage(msg.text);
    };

    if (!loggedInUser) {
        return <div className="text-center p-4">Iltimos, xabarlarga kirish uchun tizimga kiring.</div>;
    }
    const handleBackClick = () => {
        // Remove selected email from localStorage
        localStorage.removeItem('selectedEmail');
        setSelectedUser(null); // Reset selected user
    };
    const [showMessageOptions, setShowMessageOptions] = useState(null); // State to track which message options to show

    const handleMessageClick = (msg) => {
        // Toggle the visibility of the edit/delete options for the clicked message
        setShowMessageOptions(showMessageOptions === msg.id ? null : msg.id);
    };
    const isMobileView = window.innerWidth <= 900;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const handleEmojiClick = (emojiObject) => {
        setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
    };
    return (
        <div className="flex flex-col md:flex-row h-[88.9vh] bg-gray-800">
            {/* User List */}
            {!isMobileView || !selectedUser ? (
                <EmailList onUserClick={handleUserClick} />
            ) : null}

            {/* Xabarlar */}
            <div
                className="md:w-2/3 w-full flex flex-col p-6 bg-gray-900 h-screen"
            >
                {selectedUser ? (
                    <>
                        <div className='flex items-center justify-start gap-2 p-2'>

                            <button onClick={handleBackClick} className="text-2xl  mr-4 text-white">←</button>

                            <h3 className="text-lg font-semibold text-white">{selectedUser.email}</h3>
                        </div>
                        <div className="border py-16 px-4 rounded-lg bg-gray-800 flex-grow overflow-y-auto shadow  ">
                            {messages.filter(msg =>
                                (msg.sender === loggedInUser.email && msg.receiver === selectedUser.email) ||
                                (msg.sender === selectedUser.email && msg.receiver === loggedInUser.email)
                            ).map((msg, index) => (
                                <div key={index} className={`mb-3 flex ${msg.sender === loggedInUser.email ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative ${msg.sender === loggedInUser.email ? 'bg-blue-500 text-white' : 'bg-gray-700  text-gray-300'} rounded-2xl py-4 px-4 max-w-xs shadow-md ` } onClick={() => handleMessageClick(msg)}>
                                        {msg.text && (
                                            <p className='w-full break-words'>
                                                {msg.text}
                                            </p>
                                        )} <div className="">
                                            {msg.audio && (
                                                <audio controls className="rounded-lg">
                                                    <source src={msg.audio} type="audio/mp3" />
                                                </audio>
                                            )}
                                            {msg.video && (
                                                <video controls width="250" className="rounded-lg">
                                                    <source src={msg.video} type="video/mp4" />
                                                </video>
                                            )}

                                        </div>
                                        {msg.sender === loggedInUser.email && (
                                            <p className="text-xs text-white mt-2 text-right">
                                                {msg.status === "neprichitano" ? '✓' : '✓✓'}
                                            </p>
                                        )}
                                        {msg.sender === loggedInUser.email && showMessageOptions === msg.id  && (
                                            <div className="absolute z-20 bg-gray-700 p-2 rounded-xl w-48 right-0 top-[-110px] opacity-100 transition-opacity duration-300 flex flex-col">
                                                <button onClick={() => handleEditMessage(msg)} className=" p-2 gap-2 rounded-lg text-white hover:bg-gray-800 transition duration-200 flex items-center">
                                                    <FaEdit /> <p className='text-sn'>Tahrirlash</p>
                                                </button>
                                                <button onClick={() => deleteMessage(msg.id)} className=" p-2 gap-2 rounded-lg text-white hover:bg-gray-800 transition duration-200 flex items-center">
                                                    <FaTrash /> <p className='text-sm'>O'chirish</p>
                                                </button>
                                                <div className="text-lg flex items-center gap-2 text-white  p-2 rounded-lg"> <FaFileAlt /> <p className='text-sm'>{msg.time}</p></div>
                                            </div>
                                        )}

                                    </div>

                                </div>

                            ))}
                            <button
                                onClick={scrollToBottom}
                                className='w-11 flex items-center justify-center p-2 h-11 rounded-full bg bg-gray-600 absolute bottom-28  hover:bg-gray-700 duration-150 shadow-xl  '
                            >
                                <img className='w-5' src="https://cdn-icons-png.flaticon.com/512/159/159666.png" alt="icn" />
                            </button>

                            <div ref={chatEndRef}></div>

                        </div>
                        <div className="flex items-center justify-center px-4 py-3 mt-2 mb-[-15px] bg-gray-900 shadow-md rounded-lg">
                            <div className="flex items-center w-full border text-white border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <textarea
                                    className="border-none bg-transparent h-14 p-4 resize-none w-full placeholder-gray-400 focus:outline-none"
                                    rows="2"
                                    placeholder="Xabar yozing..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="ml-1 text-white p-2 text-xl rounded-lg hover:text-white transition duration-200 flex items-center"
                                >
                                    <FaPaperPlane className="mr-1" />
                                </button>
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-white">
                                    <FaSmile />
                                </button>
                            
                                {showEmojiPicker && (
                                    <div className="absolute bottom-20 right-10">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                                <button
                                    onClick={isRecordingAudio ? stopRecordingAudio : startRecordingAudio}
                                    className={`text-white p-2 text-2xl hover:text-gray-900 transition duration-200 flex items-center ${isRecordingAudio ? 'bg-red-600' : 'text-white'}`}
                                >
                                    {isRecordingAudio ? <FaStop /> : <MdRecordVoiceOver />}
                                </button>
                                <button
                                    onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
                                    className={`text-white p-2 text-2xl mr-3 hover:text-gray-900 transition duration-200 flex items-center ${isRecordingVideo ? 'bg-red-600' : 'text-white'}`}
                                >
                                    {isRecordingVideo ? <FaStop /> : <MdVideocam />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    null
                )}
            </div>
        </div>

    );
};

export default Messenger;
