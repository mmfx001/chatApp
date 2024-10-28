import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const userInfoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedLoggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (savedLoggedInUser) {
            setLoggedInUser(savedLoggedInUser);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userInfoRef.current && !userInfoRef.current.contains(event.target)) {
                setShowUserInfo(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        setLoggedInUser(null);
        navigate('/');
    };

    const handleUserInfoClick = () => {
        setShowUserInfo((prev) => !prev);
    };

    return (
        <div className="bg-gray-800 shadow-lg p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/messenger" className="text-white text-2xl font-bold w-32 text-center hover:text-orange-500 transition duration-300 ease-in-out">
                    <img src="https://cdn-icons-png.flaticon.com/512/6876/6876227.png" alt="Logo" className="h-10" />
                </Link>

                <div className="flex gap-4 items-center">
                    {!loggedInUser ? (
                        <Link to="/" className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition duration-300 ease-in-out">
                            <img
                                src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png"
                                alt="Login"
                                className="w-10 h-10"
                            />
                        </Link>
                    ) : (
                        <div className="relative">
                            <div
                                className="cursor-pointer w-12 h-12 bg-white hover:bg-gray-100 flex items-center justify-center rounded-full transition duration-300 ease-in-out"
                                onClick={handleUserInfoClick}
                            >
                                <img
                                    src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png"
                                    alt="User Info"
                                    className="w-10 h-10"
                                />
                            </div>
                            {showUserInfo && (
                                <div
                                    ref={userInfoRef}
                                    className="absolute right-0 mt-2 w-72 bg-gray-800 p-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
                                >
                                    <p className="font-medium text-white">Email: <span className="font-light">{loggedInUser.email}</span></p>
                                    <p className="font-medium text-white">ID: <span className="font-light">{loggedInUser.id}</span></p>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2 w-full transition duration-300 ease-in-out"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Navbar;
