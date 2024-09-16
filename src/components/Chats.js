import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { IoImageOutline } from "react-icons/io5";
import { MdAttachFile } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import ScrollToBottom from 'react-scroll-to-bottom';

const Chats = ({ socket, name, room }) => {

    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [imageFile, setImageFile] = useState({});
    const [saveImageLoading, setImageSaveLoading] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [file, setFile] = useState({});
    console.log("🚀 ~ Chats ~ file:", file);
    const [saveFileLoading, setFileSaveLoading] = useState(false);

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
        setImageSaveLoading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
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
            setImageFile({});
            setImageSaveLoading(false);
        }
    };

    const handleFileUpload = async () => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            const fileBuffer = reader.result;

            const msgData = {
                room,
                file: fileBuffer,
                filename: file.name,
                author: name, // Your name
            };

            // Emit file data to the server
            await socket.emit('send_file', msgData);

            // Show the sent file in your own chat (before receiving it from the server)
            const url = URL.createObjectURL(file);
            setMessageList((list) => [...list, {
                author: name, // Your name
                filename: file.name,
                fileUrl: url,
                time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            }]);

            // Reset file input
            setFile({});
            setShowFileUpload(false);
        };
    };

    useEffect(() => {
        const unloadCallback = (event) => {
            event.preventDefault();
            event.returnValue = "";
            return "";
        };

        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
    }, []);

    useEffect(() => {

        socket.on('receive_message', (data) => {
            setMessageList((list) => [...list, data]);
        });

        socket.on('receive_file', (data) => {
            const byteCharacters = atob(data.file); // Decode Base64 string
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            setMessageList((list) => [...list, {
                author: data.author, // Sender's name (could be you or another user)
                filename: data.filename,
                fileUrl: url,
                time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            }]);
        });

        socket.on('message', (data) => {
            setMessageList((list) => [...list, data]);
        });
    }, [socket]);

    return (
        <div>
            <div className='h-[100vh] flex flex-col justify-center items-center relative' >
                <div className='text-center font-semibold mb-3'>
                    <span className='font-sans italic text-2xl font-bold text-blue-600'>Money Chat</span>
                    <p className='text-xs text-white'>
                        <span>By </span>
                        <a target='_blank' className='underline' href="https://github.com/YeasarArefin" rel="noreferrer">YeasarArefin</a>
                    </p>
                </div>
                <div className='lg:w-[600px] lg:h-[600px] md:w-[300px] md:h-[300px] w-[200px] h-[200px] -rotate-45 absolute opacity-30 filter rounded-full blur-[100px] bg-blue-600'></div>
                <div className='w-full lg:w-4/6'>

                    <div className='p-2 bg-primary text-gray-200 rounded-t-lg border border-gray-800 border-b-0 grid grid-cols-3'>
                        <p><span className='font-bold'>User</span> : {name}</p>
                        <span></span>
                        <p className='flex justify-end gap-x-1'>
                            <span className='font-bold'>Room</span> :
                            <span className='text-blue-500 underline'>{room}</span>
                        </p>
                    </div>

                    <div className='h-[500px] lg:h-[600px] border border-gray-800'>

                        <ScrollToBottom className='message_container'>
                            {messageList.map((list, index) => (
                                <div key={index} className={name === list?.author ? 'me' : 'you'}>
                                    {list?.pic && <div className='px-5'><img className='w-[300px] shadow-lg rounded-lg' src={list?.pic} alt="pic" /></div>}

                                    {list?.fileUrl && (
                                        <div className='px-5 mb-1'>
                                            <a href={list.fileUrl} download={list.filename} className='text-white bg-blue-600 px-4 py-1 rounded-2xl underline '>File: {list.filename}</a>
                                        </div>
                                    )}
                                    {list?.message && (
                                        <div id={list?.message.length > 30 ? 'big' : ''} className={list?.author === 'System' ? 'system' : 'mx-5 text-lg px-4 py-1 bg-blue-700 text-white rounded-3xl'}>
                                            <p>{list?.message}</p>
                                        </div>
                                    )}
                                    <div className='flex items-center gap-x-2 text-xs mt-1 mx-6 text-white'>
                                        <p className='font-semibold text-sm'>{list?.author}</p>
                                        <p>{list?.time}</p>
                                    </div>
                                </div>
                            ))}

                        </ScrollToBottom>

                    </div>


                    <div className='flex'>

                        <input disabled={saveImageLoading} ref={messageRef} onKeyPress={(e) => e.key == 'Enter' && sendMessage()} className='px-4 py-2 outline-none w-full border border-gray-800 rounded-r-none border-t-0 rounded-bl-lg focus:ring-2 ring-blue-500 bg-primary text-white transition duration-200 ' onChange={(e) => setMessage(e.target.value)} type="text" placeholder='Say Here . . .' pattern="[^\s]+" />

                        <button disabled={saveFileLoading} onClick={() => {
                            setShowFileUpload(!showFileUpload);
                            if (showImageUpload) {
                                setShowImageUpload(!showImageUpload);
                                setImageFile({});
                            }
                        }} className='border  border-l-0 border-t-0 py-2 px-2 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200'><MdAttachFile className='text-2xl font-bold text-blue-500' /></button>

                        <button disabled={saveImageLoading} onClick={() => {
                            setShowImageUpload(!showImageUpload);
                            if (showFileUpload) {
                                setShowFileUpload(!showFileUpload);
                                setFile({});
                            }
                        }} className='border  border-l-0 border-t-0 py-2 px-2 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200'><IoImageOutline className='text-2xl font-bold text-blue-500' /></button>

                        <button disabled={saveImageLoading} onClick={sendMessage} className=' border rounded-br-lg  border-l-0 border-t-0 py-2 px-2 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200'><FiSend className='text-2xl text-blue-500' /></button>

                    </div>

                    {showFileUpload && <div className='flex flex-wrap gap-y-4 justify-between mt-5 p-2 border border-gray-800 rounded-lg'>
                        <div className='width'>
                            <input type="file" accept=".txt,.pdf,.js,.java,.py,.cpp,.c,.doc" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-blue-600" />
                        </div>
                        {!file?.name && <button className='px-[8px] py-[5px] text-sm rounded-full bg-red-600 text-white' onClick={() => setShowFileUpload(!showFileUpload)}><RxCross2 /></button>}

                        {file?.name && <button disabled={saveFileLoading} className='px-2  rounded-lg bg-blue-600 text-white' onClick={handleFileUpload}>Send</button>}
                    </div>}

                    {showImageUpload && <div className='flex flex-wrap gap-y-4 justify-between mt-5 p-2 border border-gray-800 rounded-lg'>
                        <div className='width'>
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="block w-full text-sm text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-blue-600" />
                        </div>
                        {!imageFile?.name && <button className='px-[8px] py-[5px] text-sm rounded-full bg-red-600 text-white' onClick={() => setShowImageUpload(!showImageUpload)}><RxCross2 /></button>}

                        {imageFile?.name && <button disabled={saveImageLoading} className='px-2  rounded-lg bg-blue-600 text-white' onClick={handleImageUpload}>Send</button>}
                    </div>}

                </div>

            </div>

        </div >
    );
};

export default Chats;
