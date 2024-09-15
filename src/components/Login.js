import React, { useState } from 'react';
import io from 'socket.io-client';
import Chats from './Chats';
// const socket = io.connect('https://money-chat.onrender.com');
const socket = io.connect('http://localhost:5000');

const Login = () => {

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [showChat, setShowChat] = useState(false);

    const handleJoinRoom = () => {

        if (name === '' && room === '') {
            alert('Enter Name and Room Code');
        }

        if (name === '') {
            alert('Enter A Name');
        }

        if (room === '') {
            alert('Enter Room Code');
        }

        if (name !== '' && room !== '') {
            socket.emit('join_room', { room, name });
            setShowChat(true);
        }

    };

    return (
        <div className='container mx-auto p-5'>

            {
                !showChat && (
                    <div className='flex flex-col gap-y-4 lg:w-96 h-screen justify-center mx-auto'>
                        <h1 className='text-2xl md:text-4xl text-blue-700 mb-4 font-bold text-center italic font-sans'>Money Chat</h1>
                        <input onChange={(e) => setName(e.target.value)} onKeyPress={(e) => e.key == 'Enter' && handleJoinRoom()} className='px-4 py-2 outline-none border border-blue-500 text-white focus:ring-2 ring-blue-500 bg-primary transition duration-200 rounded-lg' type="text" placeholder='Your Name' />
                        <input onChange={(e) => setRoom(e.target.value)} onKeyPress={(e) => e.key == 'Enter' && handleJoinRoom()} className='px-4 py-2 outline-none border border-blue-500 focus:ring-2 bg-primary ring-blue-500 transition duration-200 rounded-lg text-white' type="text" placeholder='Room Code' />
                        <button onClick={handleJoinRoom} className='border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 text-white'>Join Chat</button>
                    </div>
                )
            }

            {
                showChat && <Chats socket={socket} name={name} room={room} />
            }

        </div>
    );
};

export default Login;
