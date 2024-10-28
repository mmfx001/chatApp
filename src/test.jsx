import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUserCircle, FaTrash, FaEdit, FaPaperPlane, FaSmile } from 'react-icons/fa';
import { MdRecordVoiceOver, MdVideocam } from 'react-icons/md';
import EmojiPicker from 'emoji-picker-react';
import { PulseLoader } from 'react-spinners';
import EmailList from './Email';

const Messenger = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(localStorage.getItem('selectedNickName'));
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const [isRecordingVideo, setIsRecordingVideo] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [videoBlob, setVideoBlob] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
    }, [loggedInUser]);

    const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
            const response = await axios.get('https://insta-lvyt.onrender.com/messages');
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleUserClick = (user) => {
        localStorage.setItem('selectedNickName', user.nickName);
        setSelectedUser(user);
        setNewMessage('');
        setAudioBlob(null);
        setVideoBlob(null);
        setEditingMessageId(null);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() && !audioBlob && !videoBlob) return;

        setIsSendingMessage(true);
        const message = {
            sender: loggedInUser.nickName,
            receiver: selectedUser.nickName,
            text: newMessage,
            time: new Date().toLocaleString(),
            audio: audioBlob ? URL.createObjectURL(audioBlob) : null,
            video: videoBlob ? URL.createObjectURL(videoBlob) : null,
            status: "neprichitano"
        };

        try {
            await axios.post('https://insta-lvyt.onrender.com/messages', message);
            setMessages([...messages, message]);
            setNewMessage('');
            setAudioBlob(null);
            setVideoBlob(null);
            setEditingMessageId(null);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
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

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-800">
            {/* User List */}
            <EmailList onUserClick={handleUserClick} />

            {/* Messages */}
            <div className="md:w-2/3 w-full flex flex-col p-6 bg-gray-900 h-screen">
                {selectedUser ? (
                    <>
                        <div className='flex items-center justify-start gap-2 p-2'>
                            <button onClick={() => setSelectedUser(null)} className="text-2xl mr-4 text-white">←</button>
                            <h3 className="text-lg font-semibold text-white">{selectedUser.nickName}</h3>
                        </div>
                        <div className="border p-4 rounded-lg bg-gray-800 flex-grow overflow-y-auto shadow relative">
                            {isLoadingMessages ? (
                                <PulseLoader color="#4A90E2" size={10} />
                            ) : (
                                messages.filter(msg =>
                                    (msg.sender === loggedInUser.nickName && msg.receiver === selectedUser.nickName) ||
                                    (msg.sender === selectedUser.nickName && msg.receiver === loggedInUser.nickName)
                                ).map((msg, index) => (
                                    <div key={index} className={`mb-3 flex ${msg.sender === loggedInUser.nickName ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative ${msg.sender === loggedInUser.nickName ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} rounded-2xl py-4 px-4 max-w-xs shadow-md`}>
                                            {msg.text && <p>{msg.text}</p>}
                                            {msg.audio && <audio controls><source src={msg.audio} type="audio/mp3" /></audio>}
                                            {msg.video && <video controls width="250"><source src={msg.video} type="video/mp4" /></video>}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef}></div>
                        </div>
                        <div className="flex items-center justify-center px-4 py-3 mt-2 bg-gray-900 shadow-md rounded-lg">
                            <div className="flex items-center w-full border text-white border-gray-300 rounded-full">
                                <textarea
                                    className="border-none bg-transparent h-14 p-4 resize-none w-full placeholder-gray-400 focus:outline-none"
                                    rows="2"
                                    placeholder="Xabar yozing..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-white">
                                    <FaSmile />
                                </button>
                                <button onClick={sendMessage} className="p-2 text-white">
                                    <FaPaperPlane />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-20 right-10">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {isSendingMessage && <PulseLoader color="#4A90E2" size={8} />}
                    </>
                ) : (
                    <div className="text-center text-white">Foydalanuvchini tanlang</div>
                )}
            </div>
        </div>
    );
};

export default Messenger;
