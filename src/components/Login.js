import { useState } from 'react';
import io from 'socket.io-client';
import Chats from './Chats';

const socket = io.connect('https://money-chat.onrender.com');
// const socket = io.connect('http://localhost:5000');  

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
        <div className='container mx-auto px-4 sm:px-6 md:p-0'>
            {
                !showChat && (
                    <div className='flex flex-col gap-y-4 w-full max-w-md h-screen justify-center mx-auto z-20 relative items-center px-4'>
                        <div className='w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] absolute opacity-30 filter rounded-full blur-[100px] bg-blue-600 -z-10'></div>

                        <h1 className='text-2xl sm:text-3xl md:text-4xl text-blue-700 mb-4 font-bold text-center italic font-sans'>Money Chat</h1>

                        <input
                            onChange={(e) => setName(e.target.value)}
                            onKeyPress={(e) => e.key == 'Enter' && handleJoinRoom()}
                            className='w-full px-4 py-3 outline-none border border-blue-500 text-white focus:ring-2 ring-blue-500 bg-transparent transition duration-200 rounded-lg text-base'
                            type="text"
                            placeholder='Your Name'
                        />

                        <input
                            onChange={(e) => setRoom(e.target.value)}
                            onKeyPress={(e) => e.key == 'Enter' && handleJoinRoom()}
                            className='w-full px-4 py-3 outline-none border border-blue-500 focus:ring-2 bg-transparent ring-blue-500 transition duration-200 rounded-lg text-white text-base'
                            type="text"
                            placeholder='Join or Create Room Code'
                        />

                        <button
                            onClick={handleJoinRoom}
                            className='w-full border border-blue-600 px-4 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 text-white font-medium text-base'
                        >
                            Start Chat
                        </button>
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
