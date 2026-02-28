import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { FaCopy, FaRegFileLines } from "react-icons/fa6";
import { FiSend } from 'react-icons/fi';
import { IoImageOutline } from "react-icons/io5";
import { MdAttachFile } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import ScrollToBottom from 'react-scroll-to-bottom';
import { PulseLoader } from 'react-spinners';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Code detection and formatting component
const CodeBlock = ({ code, language, isAutoDetected = false }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative bg-gray-900 rounded-lg overflow-hidden my-2 max-w-full min-w-0 ${isAutoDetected ? 'auto-detected-code' : ''}`}>
            <div className="flex justify-between items-center px-3 sm:px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-300 font-mono">
                    {language || 'code'}
                </span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-xs text-gray-300 hover:text-white transition-colors"
                >
                    <FaCopy />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter
                language={language || 'text'}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '12px 16px',
                    background: '#1e1e1e',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowX: 'auto',
                    maxWidth: '100%'
                }}
                showLineNumbers={true}
                wrapLines={true}
                wrapLongLines={true}
                PreTag="div"
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

// Function to automatically detect programming language
const detectLanguage = (code) => {
    const lowerCode = code.toLowerCase();

    // Count pattern matches for better accuracy
    let scores = {
        javascript: 0,
        python: 0,
        java: 0,
        cpp: 0,
        csharp: 0,
        html: 0,
        css: 0,
        sql: 0,
        json: 0,
        php: 0,
        bash: 0,
        typescript: 0
    };

    // JavaScript/TypeScript patterns
    if (/\b(function|const|let|var|=>|console\.log|document\.|window\.)\b/.test(code)) scores.javascript += 2;
    if (/\b(require\(|import\s+.*from|export\s+(default\s+)?)\b/.test(code)) scores.javascript += 2;
    if (/\.(map|filter|forEach|reduce|find)\s*\(/.test(code)) scores.javascript += 2;
    if (/\b(React|useState|useEffect|Component)\b/.test(code)) scores.javascript += 3;
    if (/\$\{.*\}/.test(code)) scores.javascript += 2; // Template literals
    if ((/\{[\s\S]*\}/.test(code) && /;\s*$/.test(code.trim()))) scores.javascript += 1;

    // TypeScript specific
    if (/\b(interface|type\s+\w+\s*=|as\s+\w+|<\w+>)\b/.test(code)) scores.typescript += 3;
    if (/:\s*(string|number|boolean|any|void|object)\b/.test(code)) scores.typescript += 2;

    // Python patterns
    if (/\b(def |import |from |print\()\b/.test(code)) scores.python += 2;
    if (/\b(if __name__|range\(|len\(|str\(|int\(|float\()\b/.test(code)) scores.python += 2;
    if (/\.(append|join|split|strip)\s*\(/.test(code)) scores.python += 2;
    if (/^\s*#[^#]/.test(code)) scores.python += 1; // Comments
    if (/:\s*$/.test(code.trim()) && /^\s{4}/.test(code)) scores.python += 2; // Indentation
    if (/\bfor\s+\w+\s+in\s+/.test(code)) scores.python += 2;
    if (/\b(True|False|None|self|cls)\b/.test(code)) scores.python += 2;

    // Java patterns
    if (/\b(public\s+class|private\s+|protected\s+|static\s+)\b/.test(code)) scores.java += 2;
    if (/\b(public\s+static\s+void\s+main|System\.out\.println)\b/.test(code)) scores.java += 3;
    if (/\b(extends|implements|new\s+\w+\s*\()\b/.test(code)) scores.java += 2;
    if (/\b(String|Integer|Boolean|ArrayList|HashMap)\b/.test(code)) scores.java += 2;
    if (/\bclass\s+\w+\s*\{/.test(code)) scores.java += 1;

    // C# patterns
    if (/\b(using\s+System|namespace\s+|Console\.WriteLine)\b/.test(code)) scores.csharp += 3;
    if (/\b(public\s+static\s+void\s+Main|string\s+\w+)\b/.test(code)) scores.csharp += 2;
    if (/\b(var\s+\w+\s*=|List<|Dictionary<)\b/.test(code)) scores.csharp += 2;

    // C/C++ patterns
    if (/\b(#include|int\s+main|printf|scanf)\b/.test(code)) scores.cpp += 2;
    if (/#include\s*<.*>/.test(code)) scores.cpp += 2;
    if (/\b(malloc|free|struct\s+|typedef\s+)\b/.test(code)) scores.cpp += 2;
    if (/\b(std::|cout|cin|endl)\b/.test(code)) scores.cpp += 2;
    if (/\*\w+|&\w+/.test(code)) scores.cpp += 1; // Pointers and references

    // HTML patterns
    if (/<\/?[a-z][\s\S]*>/i.test(code)) scores.html += 2;
    if (/<!DOCTYPE|<html|<head|<body/.test(lowerCode)) scores.html += 3;
    if (/<(div|span|p|h[1-6]|a|img|form|input)[\s>]/.test(lowerCode)) scores.html += 2;
    if (/class\s*=\s*["']|id\s*=\s*["']/.test(code)) scores.html += 1;

    // CSS patterns
    if (/\{[\s\S]*:[^:;]+;[\s\S]*\}/.test(code)) scores.css += 2;
    if (/\.([\w-]+)\s*\{|#[\w-]+\s*\{/.test(code)) scores.css += 2;
    if (/@(media|import|keyframes|font-face)/.test(code)) scores.css += 2;
    if (/(margin|padding|color|background|font-size|display|position):\s*/.test(code)) scores.css += 1;

    // SQL patterns
    if (/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\b/i.test(code)) scores.sql += 3;
    if (/\b(CREATE|DROP|ALTER|TABLE|DATABASE|INDEX)\b/i.test(code)) scores.sql += 2;
    if (/\b(JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP BY|ORDER BY)\b/i.test(code)) scores.sql += 2;

    // JSON patterns
    if (/^\s*[{[][\s\S]*[}\]]\s*$/.test(code.trim())) scores.json += 2;
    if (/"[\w\s]*"\s*:\s*/.test(code)) scores.json += 2;
    if (/"[\w\s]*"\s*:\s*"[\s\S]*"/.test(code)) scores.json += 1;

    // PHP patterns
    if (/^\s*<\?php|\$\w+/.test(code)) scores.php += 3;
    if (/\b(echo|print|var_dump|isset|empty)\b/.test(code)) scores.php += 2;
    if (/\b(function\s+\w+\s*\(|\$this->)\b/.test(code)) scores.php += 2;

    // Bash/Shell patterns
    if (/^#!\/bin\/(bash|sh)/.test(code)) scores.bash += 3;
    if (/\b(echo|grep|awk|sed|cat|ls|cd|mkdir)\b/.test(code)) scores.bash += 2;
    if (/\$\{?\w+\}?|\$[0-9]/.test(code)) scores.bash += 2;
    if (/^\s*#/.test(code) && !/^\s*#include/.test(code)) scores.bash += 1;

    // Find the language with the highest score
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore < 2) return 'text'; // Not confident enough

    const detectedLanguage = Object.keys(scores).find(lang => scores[lang] === maxScore);

    // Special handling for TypeScript vs JavaScript
    if (detectedLanguage === 'typescript' && scores.javascript > 0) {
        return scores.typescript > scores.javascript ? 'typescript' : 'javascript';
    }

    return detectedLanguage || 'text';
};

// Function to detect if text is likely code (automatic detection)
const isLikelyCode = (text) => {
    // Skip very short text
    if (text.trim().length < 10) return false;

    // Check for common programming patterns
    const codePatterns = [
        // Functions and methods
        /\b(function|def|public|private|protected|static|void|int|string|bool|var|let|const)\b/,
        // Control structures
        /\b(if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*\{|catch\s*\(|else\s*\{)\b/,
        // Object-oriented patterns
        /\b(class|interface|extends|implements|new\s+\w+\s*\()\b/,
        // Common programming symbols and patterns
        /[{}]\s*$|;\s*$|::\w+|->\w+/,
        // Web technologies
        /<\/?[a-z][^>]*>|<\w+\s+.*>/i,
        // Import/include statements
        /\b(import|#include|require\(|from\s+[\w'"./]+)/,
        // Comments
        /\/\/.*$|\/\*[\s\S]*?\*\/|#.*$|<!--[\s\S]*?-->/,
        // Multiple brackets/braces indicating structure
        /.*\{.*\{.*\}.*\}|.*\[.*\[.*\].*\]/,
        // Assignment with operators
        /\w+\s*[+\-*/]?=\s*[\w[(]/,
        // Method calls
        /\w+\.\w+\s*\(/
    ];

    // Count matches
    let matchCount = 0;
    for (const pattern of codePatterns) {
        if (pattern.test(text)) {
            matchCount++;
        }
    }

    // Also check for code-like structure (indentation, semicolons, brackets)
    const lines = text.split('\n');
    let structureScore = 0;

    // Check for consistent indentation
    const indentedLines = lines.filter(line => /^\s{2,}/.test(line));
    if (indentedLines.length > 0) structureScore++;

    // Check for semicolons at end of lines
    const semicolonLines = lines.filter(line => /;\s*$/.test(line.trim()));
    if (semicolonLines.length > 1) structureScore++;

    // Check for brackets
    const bracketCount = (text.match(/[{}()[\]]/g) || []).length;
    if (bracketCount > 4) structureScore++;

    // Check for multiple assignment operators
    const assignmentCount = (text.match(/\w+\s*[=+\-*/]=/g) || []).length;
    if (assignmentCount > 1) structureScore++;

    // Determine if it's likely code
    return matchCount >= 2 || (matchCount >= 1 && structureScore >= 2);
};

// Function to detect if text contains code
const detectCodeBlocks = (text) => {
    // Check for code blocks with triple backticks - improved regex to handle various formats
    const codeBlockRegex = /```(\w+)?\s*\n?([\s\S]*?)\n?```/g;
    // Check for inline code with single backticks
    const inlineCodeRegex = /`([^`\n]+)`/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    // First, handle code blocks with triple backticks
    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            const beforeText = text.slice(lastIndex, match.index);
            if (beforeText.trim()) {
                parts.push({ type: 'text', content: beforeText });
            }
        }

        // Add code block
        const language = match[1] || 'text';
        let code = match[2];

        // Preserve original formatting and indentation
        if (code) {
            // Remove leading/trailing empty lines but preserve internal structure
            code = code.replace(/^\n+/, '').replace(/\n+$/, '');
        }

        parts.push({ type: 'codeblock', content: code || '', language, isAutoDetected: false });

        lastIndex = match.index + match[0].length;
    }

    // Reset regex for inline code detection
    codeBlockRegex.lastIndex = 0;

    // If no explicit code blocks found, check for automatic detection
    if (parts.length === 0) {
        // Check if the entire text is likely code
        if (isLikelyCode(text)) {
            const detectedLanguage = detectLanguage(text);
            parts.push({ type: 'codeblock', content: text.trim(), language: detectedLanguage, isAutoDetected: true });
            return parts;
        }

        // Check for inline code with backticks
        let tempText = text;
        let tempLastIndex = 0;

        while ((match = inlineCodeRegex.exec(text)) !== null) {
            // Add text before inline code
            if (match.index > tempLastIndex) {
                const beforeText = tempText.slice(tempLastIndex, match.index);
                if (beforeText.trim()) {
                    parts.push({ type: 'text', content: beforeText });
                }
            }

            // Add inline code
            parts.push({ type: 'inlinecode', content: match[1] });
            tempLastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (tempLastIndex < text.length) {
            const remainingText = text.slice(tempLastIndex);
            if (remainingText.trim()) {
                parts.push({ type: 'text', content: remainingText });
            }
        }

        // If no inline code found either, treat as normal text
        if (parts.length === 0) {
            parts.push({ type: 'text', content: text });
        }
    } else {
        // Add remaining text after last code block
        if (lastIndex < text.length) {
            const remainingText = text.slice(lastIndex);
            if (remainingText.trim()) {
                parts.push({ type: 'text', content: remainingText });
            }
        }
    }

    return parts;
};

const Chats = ({ socket, name, room }) => {

    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [imageFile, setImageFile] = useState({});
    const [saveImageLoading, setImageSaveLoading] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [file, setFile] = useState({});
    const [saveFileLoading, setFileSaveLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    const messageRef = useRef('');

    // Send typing event
    const handleTyping = () => {
        // setIsTyping(true);
        socket.emit('typing', { room, name });
        setTimeout(() => {
            // setIsTyping(false);
            socket.emit('stop_typing', { room, name });
        }, 2000); // Stops typing after 2 seconds of inactivity
    };

    const sendMessage = async () => {
        if (message.trim() !== '') {
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

            // Reset textarea height to original size
            if (messageRef.current) {
                messageRef.current.style.height = '44px';
            }
        }
    };

    const handleImageUpload = async () => {
        setImageSaveLoading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        const { data, status } = await axios.post('https://api.imgbb.com/1/upload?key=812929724c8729ffb138047a50fb0851', formData);
        if (status === 200) {
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
        // if (file.size > (100 * 1000000)) {
        //     alert("Upload Less Then 50MB");
        //     return;
        // }
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            const fileBuffer = reader.result;

            const msgData = {
                room,
                file: fileBuffer,
                filename: file.name,
                author: name,
            };

            await socket.emit('send_file', msgData);
            const url = URL.createObjectURL(file);
            setMessageList((list) => [...list, {
                author: name,
                filename: file.name,
                fileUrl: url,
                time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            }]);
            setFile({});
            setShowFileUpload(false);
        };
    };


    useEffect(() => {
        socket.on('receive_message', (data) => {
            setMessageList((list) => [...list, data]);
        });

        socket.on('receive_file', (data) => {
            const byteCharacters = atob(data.file);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            setMessageList((list) => [...list, {
                author: data.author,
                filename: data.filename,
                fileUrl: url,
                time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            }]);
        });

        socket.on('message', (data) => {
            setMessageList((list) => [...list, data]);
        });

        socket.on('typing', (user) => {
            setTypingUsers((prevUsers) => [...new Set([...prevUsers, user.name])]);
        });

        socket.on('stop_typing', (user) => {
            setTypingUsers((prevUsers) => prevUsers.filter(u => u !== user.name));
        });

    }, [socket]);


    return (
        <div className='min-h-screen flex flex-col'>
            {/* Header Section - Fixed */}
            <div className='fixed top-0 left-0 right-0 z-20 bg-primary/95 backdrop-blur-sm border-b border-gray-700 p-3 sm:p-4'>
                <div className='max-w-4xl mx-auto'>
                    <div className='text-center font-semibold mb-3'>
                        <span className='font-sans italic text-xl sm:text-2xl font-bold text-blue-600'>Money Chat</span>
                        <p className='text-xs text-white'>
                            <span>By </span>
                            <a target='_blank' className='underline' href="https://github.com/YeasarArefin" rel="noreferrer">YeasarArefin</a>
                        </p>
                    </div>

                    {/* User and Room Info */}
                    <div className='block sm:hidden space-y-2'>
                        <div className='flex justify-between items-center text-gray-200'>
                            <p className='text-sm'><span className='font-bold'>User:</span> {name}</p>
                            <p className='text-sm'>
                                <span className='font-bold'>Room:</span>
                                <span className='text-blue-500 underline ml-1'>{room}</span>
                            </p>
                        </div>
                        {typingUsers.length > 0 && (
                            <div className="text-white flex items-center justify-center gap-x-2 text-xs">
                                <h1 className='font-semibold'>{typingUsers.join(', ')} </h1>
                                <h1>{typingUsers.length > 1 ? 'are' : 'is'} typing </h1>
                                <PulseLoader color="#ffffff" size={3} />
                            </div>
                        )}
                    </div>

                    {/* Desktop Layout */}
                    <div className='hidden sm:grid grid-cols-3 items-center text-gray-200'>
                        <p className='text-sm'><span className='font-bold'>User:</span> {name}</p>
                        <div className='text-xs text-center flex justify-center items-center'>
                            {typingUsers.length > 0 && (
                                <div className="text-white flex items-center justify-center gap-x-2">
                                    <h1 className='font-semibold'>{typingUsers.join(', ')} </h1>
                                    <h1>{typingUsers.length > 1 ? 'are' : 'is'} typing </h1>
                                    <PulseLoader color="#ffffff" size={5} />
                                </div>
                            )}
                        </div>
                        <p className='flex justify-end gap-x-1 text-sm'>
                            <span className='font-bold'>Room:</span>
                            <span className='text-blue-500 underline'>{room}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Background Effect */}
            <div className='lg:w-[600px] lg:h-[600px] md:w-[300px] md:h-[300px] w-[200px] h-[200px] -rotate-45 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30 filter rounded-full blur-[100px] bg-blue-600 pointer-events-none'></div>

            {/* Messages Area - Scrollable between fixed header and input */}
            <div className='flex-1 overflow-hidden relative pt-28 pb-20 sm:pt-32 sm:pb-24 md:pt-36 md:pb-28'>
                <ScrollToBottom className='h-full p-3 sm:p-4 overflow-y-auto'>
                    <div>
                        {messageList.map((list, index) => (
                            <div key={index} className={name === list?.author ? 'me' : 'you'}>
                                {list?.pic && (
                                    <div className='px-3 sm:px-5'>
                                        <img
                                            className='w-full max-w-[200px] sm:max-w-[300px] shadow-lg rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                                            src={list?.pic}
                                            alt="pic"
                                            onClick={() => window.open(list?.pic, '_blank')}
                                        />
                                    </div>
                                )}

                                {list?.fileUrl && (
                                    <div className={list?.author === 'System' ? 'system bg-red-600' : 'mx-3 sm:mx-5 text-base sm:text-lg bg-blue-700 text-white rounded-xl max-w-[90%] sm:max-w-[85%]'}>
                                        <div className='flex items-center gap-x-2 sm:gap-x-5 py-2 bg-gray-700 px-3 sm:px-4 rounded-lg border-2 border-slate-700'>
                                            <div className='flex-shrink-0'>
                                                <FaRegFileLines className='text-sm sm:text-base' />
                                            </div>
                                            <a
                                                href={list.fileUrl}
                                                download={list.filename}
                                                className='hover:underline text-sm sm:text-base font-medium truncate flex-1 min-w-0'
                                                title={list.filename}
                                            >
                                                {list.filename}
                                            </a>
                                            {list.fileSize && <p className='text-xs sm:text-sm flex-shrink-0'>{list.fileSize}</p>}
                                        </div>
                                    </div>
                                )}
                                {list?.message && (
                                    (() => {
                                        const messageParts = detectCodeBlocks(list.message);
                                        const hasCodeBlock = messageParts.some(part => part.type === 'codeblock');

                                        // Different styling for messages with code blocks vs regular messages
                                        const messageContainerClass = list?.author === 'System'
                                            ? 'system bg-red-600'
                                            : hasCodeBlock
                                                ? 'mx-3 sm:mx-5 max-w-[95%] sm:max-w-[90%] md:max-w-[85%]' // No background/padding for code blocks
                                                : 'mx-3 sm:mx-5 text-sm sm:text-lg px-3 sm:px-4 py-2 bg-blue-700 text-white rounded-3xl max-w-[85%] sm:max-w-[80%]'; // Regular message styling

                                        return (
                                            <div className={messageContainerClass}>
                                                {hasCodeBlock ? (
                                                    <div className='message-with-code'>
                                                        {messageParts.map((part, index) => {
                                                            if (part.type === 'codeblock') {
                                                                return (
                                                                    <CodeBlock
                                                                        key={index}
                                                                        code={part.content}
                                                                        language={part.language}
                                                                        isAutoDetected={part.isAutoDetected}
                                                                    />
                                                                );
                                                            } else if (part.type === 'inlinecode') {
                                                                return (
                                                                    <code
                                                                        key={index}
                                                                        className='bg-gray-800 text-yellow-300 px-1 py-0.5 rounded text-sm font-mono'
                                                                    >
                                                                        {part.content}
                                                                    </code>
                                                                );
                                                            } else {
                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        className='text-sm sm:text-lg px-3 sm:px-4 py-2 bg-blue-700 text-white rounded-3xl break-words whitespace-pre-wrap mb-2'
                                                                    >
                                                                        {part.content}
                                                                    </div>
                                                                );
                                                            }
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div id='big' className='break-words whitespace-pre-wrap'>
                                                        {list.message}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()
                                )}
                                <div className='flex items-center gap-x-2 text-xs mt-1 mx-4 sm:mx-6 text-white opacity-75'>
                                    <p className='font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none'>{list?.author}</p>
                                    <p className='text-xs flex-shrink-0'>{list?.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollToBottom>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className='fixed bottom-0 left-0 right-0 z-20 bg-primary/95 backdrop-blur-sm border-t border-gray-700 p-3 sm:p-4'>
                <div className='max-w-4xl mx-auto'>
                    <div className='flex items-end border-t border-gray-800 rounded-lg'>

                        <textarea
                            disabled={saveImageLoading}
                            ref={messageRef}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            className='px-3 sm:px-4 py-2 sm:py-3 outline-none w-full border border-gray-800 rounded-r-none border-t-0 rounded-bl-lg focus:ring-2 ring-blue-500 bg-primary text-white transition duration-200 text-sm sm:text-base resize-none overflow-auto'
                            onChange={(e) => {
                                setMessage(e.target.value);
                                handleTyping();
                                // Auto-resize textarea
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            placeholder='Type a message...'
                            rows="1"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />


                        <button
                            disabled={saveFileLoading}
                            onClick={() => {
                                setShowFileUpload(!showFileUpload);
                                if (showImageUpload) {
                                    setShowImageUpload(!showImageUpload);
                                    setImageFile({});
                                }
                            }}
                            className='border border-l-0 border-t-0 py-2 px-2 sm:px-3 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center self-end'
                        >
                            <MdAttachFile className='text-xl sm:text-2xl font-bold text-blue-500' />
                        </button>

                        <button
                            disabled={saveImageLoading}
                            onClick={() => {
                                setShowImageUpload(!showImageUpload);
                                if (showFileUpload) {
                                    setShowFileUpload(!showFileUpload);
                                    setFile({});
                                }
                            }}
                            className='border border-l-0 border-t-0 py-2 px-2 sm:px-3 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center self-end'
                        >
                            <IoImageOutline className='text-xl sm:text-2xl font-bold text-blue-500' />
                        </button>

                        <button
                            disabled={saveImageLoading}
                            onClick={sendMessage}
                            className='border rounded-br-lg border-l-0 border-t-0 py-2 px-2 sm:px-3 border-gray-800 focus:ring-2 ring-blue-500 transition duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center self-end'
                        >
                            <FiSend className='text-xl sm:text-2xl text-blue-500' />
                        </button>                    </div>

                    {showFileUpload && (
                        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-3 sm:mt-5 p-3 sm:p-4 border border-gray-800 rounded-lg'>
                            <div className='flex-1'>
                                <input
                                    type="file"
                                    accept=".txt,.pdf,.html,.css,.js,.jsx,.ts,.tsx,.java,.py,.cpp,.c,.doc,.ppt,.zip,.rar,.mp3,.mp4,.mkv"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-blue-600"
                                />
                            </div>
                            <div className='flex gap-2 justify-end sm:justify-start'>
                                {!file?.name && (
                                    <button
                                        className='px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center min-w-[44px]'
                                        onClick={() => setShowFileUpload(!showFileUpload)}
                                    >
                                        <RxCross2 />
                                    </button>
                                )}
                                {file?.name && (
                                    <button
                                        disabled={saveFileLoading}
                                        className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium'
                                        onClick={handleFileUpload}
                                    >
                                        {saveFileLoading ? 'Sending...' : 'Send'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {showImageUpload && (
                        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-3 sm:mt-5 p-3 sm:p-4 border border-gray-800 rounded-lg'>
                            <div className='flex-1'>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-blue-600"
                                />
                            </div>
                            <div className='flex gap-2 justify-end sm:justify-start'>
                                {!imageFile?.name && (
                                    <button
                                        className='px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center min-w-[44px]'
                                        onClick={() => setShowImageUpload(!showImageUpload)}
                                    >
                                        <RxCross2 />
                                    </button>
                                )}
                                {imageFile?.name && (
                                    <button
                                        disabled={saveImageLoading}
                                        className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium'
                                        onClick={handleImageUpload}
                                    >
                                        {saveImageLoading ? 'Uploading...' : 'Send'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                </div>

            </div>

        </div >
    );
};

export default Chats;