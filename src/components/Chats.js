import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { IoImageOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import ScrollToBottom from 'react-scroll-to-bottom';
const Chats = ({ socket, name, room }) => {

    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [file, setFile] = useState({});
    const [saveLoading, setSaveLoading] = useState(false);
    const messageRef = useRef('');;

    const sendMessage = async () => {

        if (message !== '' && message !== ' ') {

            const msgData = {
                room,
                message,
                author: name,
                time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            };

            await socket.emit('send_message', msgData);
            setMessageList((list) => [...list, msgData]);

            messageRef.current.value = '';
            setMessage('');
        }

    };

    const handleImageUpload = async () => {
        setSaveLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        const { data, status } = await axios.post('https://api.imgbb.com/1/upload?key=812929724c8729ffb138047a50fb0851', formData);
        if (status === 200) {
            // img url response
            const uploadedImage = data.data.image.url;
            const msgData = {
                room,
                message,
                pic: uploadedImage,
                author: name,
                time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            };
            await socket.emit('send_message', msgData);
            setMessageList((list) => [...list, msgData]);
            setFile({});
            setSaveLoading(false);
        }
    };

    useEffect(() => {

        socket.on('receive_message', (data) => {
            setMessageList((list) => [...list, data]);
        });

        socket.on('message', (data) => {
            setMessageList((list) => [...list, data]);
        });

    }, [socket]);

    return (
        <div>

            <div className='h-[96vh] flex flex-col justify-center items-center' >

                <div className='w-full lg:w-4/6'>

                    <div className='p-2 bg-primary text-gray-200 rounded-t-lg border border-gray-800 border-b-0 grid grid-cols-3'>
                        <p><span className='font-bold'>User</span> : {name}</p>
                        <p className='text-center font-semibold'>Money Chat By <a target='_blank' className='underline' href="https://github.com/YeasarArefin" rel="noreferrer">YeasarArefin</a></p>
                        <p className='flex justify-end gap-x-1'><span className='font-bold'>Room</span> : <span className='text-blue-500'>{room}</span></p>
                    </div>

                    <div className='h-[500px] lg:h-[600px] border border-gray-800'>

                        <ScrollToBottom className='message_container'>
                            {
                                messageList.map((list) => {

                                    return (

                                        <div className={name == list?.author ? 'me' : 'you'}>
                                            {list?.pic && <div className='px-5'><img className='w-[300px] shadow-lg rounded-lg' src={list?.pic} alt="pic" /></div>}

                                            {list?.message && <div id={list?.message.length > 30 && 'big'} className={list?.author == 'System' ? 'system' : 'mx-5 text-lg px-4 py-1 bg-blue-700 text-white rounded-3xl'}>
                                                <p className={list?.author == 'System' && 'system'}>{list?.message}</p>
                                            </div>}

                                            <div className='flex items-center gap-x-2 text-xs mt-1 mx-6 text-white'>
                                                <p className='font-semibold text-sm'>{list?.author}</p>
                                                <p >{list?.time}</p>
                                            </div>

                                        </div>

                                    );

                                })
                            }
                        </ScrollToBottom>

                    </div>


                    <div className='flex'>

                        <input disabled={saveLoading} ref={messageRef} onKeyPress={(e) => e.key == 'Enter' && sendMessage()} className='px-4 py-2 outline-none w-full border border-gray-800 rounded-r-none border-t-0 rounded-bl-lg focus:ring-2 ring-blue-500 bg-primary text-white transition duration-200 ' onChange={(e) => setMessage(e.target.value)} type="text" placeholder='Say Something...' pattern="[^\s]+" />

                        <button disabled={saveLoading} onClick={() => setShowUpload(!showUpload)} className='border  border-l-0 border-t-0 py-2 px-2 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200'><IoImageOutline className='text-2xl font-bold text-blue-500' /></button>

                        <button disabled={saveLoading} onClick={sendMessage} className=' border rounded-br-lg  border-l-0 border-t-0 py-2 px-2 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200'><FiSend className='text-2xl text-blue-500' /></button>

                    </div>

                    {showUpload && <div className='flex flex-wrap gap-y-4 justify-between mt-5 p-2 border border-gray-800 rounded-lg'>
                        <div className='width'>
                            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} class="block w-full text-sm text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-blue-600" />
                        </div>
                        {!file?.name && <button className='px-[8px] py-[5px] text-sm rounded-full bg-red-600 text-white' onClick={() => setShowUpload(!showUpload)}><RxCross2 /></button>}

                        {file?.name && <button disabled={saveLoading} className='px-2  rounded-lg bg-blue-600 text-white' onClick={handleImageUpload}>Send</button>}
                    </div>}

                </div>

            </div>

        </div >
    );
};

export default Chats;
