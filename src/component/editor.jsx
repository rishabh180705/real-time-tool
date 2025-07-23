// import React, { useState } from "react";
// import Editor from "@monaco-editor/react";
// import { PanelLeft, Users, Send, MessageSquare, Terminal, Play, Code, Zap, Circle, Plus, X } from "lucide-react";

// export default function LiveCodeRoomUI() {
//   const [code, setCode] = useState("// Welcome to Live Code Room!\n// start coding here and collaborate in real-time\n\nfunction greet(name) {\n  return `Hello, ${name}! Ready to code together?`;\n}\n\nconsole.log(greet('World'));");
//   const [output, setOutput] = useState("Hello, World! Ready to code together?");
//   const [chatOpen, setChatOpen] = useState(false);
//   const [chatMsg, setChatMsg] = useState("");
//   const [chatLog, setChatLog] = useState([
//     { user: "Rishabh", msg: "Hey everyone! Ready to start coding?", time: "2:30 PM" },
//     { user: "Priya", msg: "Yes! Let's build something amazing together 🚀", time: "2:31 PM" },
//     { user: "Ankit", msg: "I'm working on the authentication logic", time: "2:32 PM" }
//   ]);
//   const [expandedEditor, setExpandedEditor] = useState(false);
//   const [expandedMessage, setExpandedMessage] = useState("");
//   const [expandedTitle, setExpandedTitle] = useState("");
//   const [messageBoxOpen, setMessageBoxOpen] = useState(false);
//   const [newMessage, setNewMessage] = useState("");

//   const participants = [
//     { name: "Rishabh", status: "online", color: "bg-green-500" },
//     { name: "Priya", status: "typing", color: "bg-yellow-500" },
//     { name: "Ankit", status: "online", color: "bg-green-500" },
//     { name: "Sara", status: "away", color: "bg-gray-500" }
//   ];

//   const sendChat = () => {
//     if (chatMsg.trim()) {
//       setChatLog([...chatLog, { user: "You", msg: chatMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
//       setChatMsg("");
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       sendChat();
//     }
//   };

//   const runCode = () => {
//     // Simulate code execution
//     setOutput("Code executed successfully!\n> " + code.split('\n').slice(-2).join('\n'));
//   };

//   const handleMessageClick = (msg, user) => {
//     setExpandedMessage(msg);
//     setExpandedTitle(`Message from ${user}`);
//     setExpandedEditor(true);
//   };

//   const closeExpandedEditor = () => {
//     setExpandedEditor(false);
//     setExpandedMessage("");
//     setExpandedTitle("");
//   };

//   const updateExpandedMessage = (newMessage) => {
//     setExpandedMessage(newMessage);
//   };

//   const openMessageBox = () => {
//     setMessageBoxOpen(true);
//   };

//   const closeMessageBox = () => {
//     setMessageBoxOpen(false);
//     setNewMessage("");
//   };

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
//       {/* Expanded Message Editor Modal */}
//       {expandedEditor && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
//             <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-white">{expandedTitle}</h3>
//               <button
//                 onClick={closeExpandedEditor}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="flex-1 p-4">
//               <textarea
//                 value={expandedMessage}
//                 onChange={(e) => updateExpandedMessage(e.target.value)}
//                 className="w-full h-full bg-gray-800 text-white rounded-lg p-4 border border-gray-700 focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm leading-relaxed"
//                 placeholder="Write your detailed message here..."
//               />
//             </div>
//             <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
//               <button
//                 onClick={closeExpandedEditor}
//                 className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   // Save the expanded message back to chat
//                   const updatedChatLog = chatLog.map(chat => 
//                     chat.msg === expandedMessage || chat.user === expandedTitle.replace('Message from ', '') 
//                       ? { ...chat, msg: expandedMessage }
//                       : chat
//                   );
//                   setChatLog(updatedChatLog);
//                   closeExpandedEditor();
//                 }}
//                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Message Box Overlay */}
//       {messageBoxOpen && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
//           <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl">
//             <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-white flex items-center gap-2">
//                 <MessageSquare size={20} className="text-indigo-400" />
//                 Send Message
//               </h3>
//               <button
//                 onClick={closeMessageBox}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-4 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Message
//                 </label>
//                 <textarea
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   className="w-full h-32 bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-indigo-500 focus:outline-none resize-none text-sm"
//                   placeholder="Type your message here..."
//                 />
//               </div>
//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={closeMessageBox}
//                   className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     // This is where you would handle sending the message
//                     console.log("Sending message:", newMessage);
//                     closeMessageBox();
//                   }}
//                   className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm flex items-center gap-2"
//                 >
//                   <Send size={16} />
//                   Send Message
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Sidebar */}
//       <div className="w-72 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
//         <div className="p-6 border-b border-gray-700/50">
//           <h2 className="text-xl font-bold flex items-center gap-3 text-white">
//             <div className="p-2 bg-indigo-600 rounded-lg">
//               <Code size={20} />
//             </div>
//             Live Code Room
//           </h2>
//           <p className="text-gray-400 text-sm mt-2">Collaborate in real-time</p>
//         </div>
        
//         <div className="p-6 flex-1">
//           <div className="mb-8">
//             <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-300">
//               <Users size={16} />
//               Participants ({participants.length})
//             </h3>
//             <div className="space-y-3">
//               {participants.map((participant, i) => (
//                 <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-all duration-200">
//                   <div className="relative">
//                     <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
//                       {participant.name[0]}
//                     </div>
//                     <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${participant.color} rounded-full border-2 border-gray-900`}></div>
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm font-medium text-white">{participant.name}</div>
//                     <div className="text-xs text-gray-400 capitalize">{participant.status}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="space-y-3">
//             <button
//               onClick={runCode}
//               className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
//             >
//               <Play size={16} />
//               Run Code
//             </button>
            
//             <button
//               onClick={() => setChatOpen(!chatOpen)}
//               className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
//             >
//               <MessageSquare size={16} />
//               {chatOpen ? "Close Chat" : "Open Chat"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Editor Area */}
//       <div className="flex-1 flex flex-col relative">
//         {/* Header */}
//         <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-2">
//                 <Circle className="w-3 h-3 text-red-500 fill-current" />
//                 <Circle className="w-3 h-3 text-yellow-500 fill-current" />
//                 <Circle className="w-3 h-3 text-green-500 fill-current" />
//               </div>
//               <span className="text-sm font-medium text-gray-300">main.js</span>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2 text-xs text-gray-400">
//                 <Zap size={12} />
//                 <span>Live sync enabled</span>
//               </div>
//               <button
//                 onClick={openMessageBox}
//                 className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
//               >
//                 <Plus size={12} />
//                 Message
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Editor */}
//         <div className="flex-1 relative">
//           <Editor
//             height="100%"
//             language="javascript"
//             theme="vs-dark"
//             value={code}
//             onChange={setCode}
//             options={{
//               fontSize: 14,
//               minimap: { enabled: false },
//               lineNumbers: 'on',
//               roundedSelection: false,
//               scrollBeyondLastLine: false,
//               readOnly: false,
//               fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
//               padding: { top: 20, bottom: 20 }
//             }}
//           />
//         </div>

//         {/* Output Terminal */}
//         <div className="bg-black/90 backdrop-blur-sm border-t border-gray-700/50 p-4">
//           <div className="flex items-center gap-2 mb-3">
//             <Terminal size={16} className="text-green-400" />
//             <span className="text-sm font-medium text-green-400">Output</span>
//           </div>
//           <pre className="text-sm text-green-400 font-mono leading-relaxed">
//             {output || "// Output will appear here after running code"}
//           </pre>
//         </div>
//       </div>

//       {/* Chat Drawer */}
//       {chatOpen && (
//         <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-l border-gray-700/50 flex flex-col animate-slide-in">
//           <div className="p-4 border-b border-gray-700/50">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <MessageSquare size={18} className="text-indigo-400" />
//               Team Chat
//             </h2>
//           </div>
          
//           <div className="flex-1 overflow-y-auto p-4 space-y-3">
//             {chatLog.map((c, i) => (
//               <div
//                 key={i}
//                 onClick={() => handleMessageClick(c.msg, c.user)}
//                 className={`p-3 rounded-lg max-w-[85%] cursor-pointer hover:opacity-80 transition-opacity ${
//                   c.user === "You" 
//                     ? "bg-indigo-600 ml-auto" 
//                     : "bg-gray-800 mr-auto"
//                 }`}
//               >
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className="text-xs font-medium text-gray-300">{c.user}</span>
//                   <span className="text-xs text-gray-500">{c.time}</span>
//                 </div>
//                 <p className="text-sm text-white">{c.msg}</p>
//               </div>
//             ))}
//           </div>
          
//           <div className="p-4 border-t border-gray-700/50">
//             <div className="flex gap-2">
//               <input
//                 value={chatMsg}
//                 onChange={(e) => setChatMsg(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 focus:border-indigo-500 focus:outline-none transition-colors"
//                 placeholder="Type a message..."
//               />
//               <button
//                 onClick={sendChat}
//                 className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"
//               >
//                 <Send size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       <style jsx>{`
//         @keyframes slide-in {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
        
//         .animate-slide-in {
//           animation: slide-in 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }


import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { FaPaperPlane, FaMicrophone, FaVideo, FaFileUpload } from "react-icons/fa";
import { BsFillCameraVideoOffFill, BsMicMuteFill } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";


const dummyMessages = [
  { id: 1, user: "Rishabh", text: "Hey team! Ready to code?", file: null },
  { id: 2, user: "Aisha", text: "Yep! Sharing a file...", file: "DesignDoc.pdf" },
];

const dummyParticipants = [
  { name: "Rishabh", status: "typing", avatar: "🧑‍💻" },
  { name: "Aisha", status: "online", avatar: "👩‍💼" },
];

export default function LiveCodeRoom() {
  const [code, setCode] = useState("// Start coding...");
  const [output, setOutput] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const [isMicOn, setMicOn] = useState(true);
  const [isCamOn, setCamOn] = useState(true);

  const runCode = () => {
    setOutput("🚀 Output:\nHello World!");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white font-sans">
      {/* Participants Sidebar */}
      {participantsOpen && (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Participants</h2>
            <button onClick={() => setParticipantsOpen(false)} className="text-gray-400 hover:text-white">
              <AiOutlineClose />
            </button>
          </div>
          {dummyParticipants.map((p) => (
            <div key={p.name} className="flex items-center gap-3 mb-4">
              <div className="text-xl">{p.avatar}</div>
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-green-400">{p.status}</p>
              </div>
            </div>
          ))}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Code Editor */}
        <div className="h-2/3 border-b border-gray-800">
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            value={code}
            onChange={(v) => setCode(v)}
            className="rounded"
          />
        </div>

        {/* Output Panel */}
        <div className="h-1/3 bg-gray-900 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold">Output</h3>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
              onClick={runCode}
            >
              Run Code
            </button>
          </div>
          <div className="bg-gray-800 p-3 rounded text-green-300 text-sm h-full overflow-y-auto">
            <pre>{output}</pre>
          </div>
        </div>
      </main>

      {/* Chat Drawer */}
      {chatOpen && (
        <aside className="w-96 bg-gray-900 border-l border-gray-800 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Team Chat</h2>
            <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">
              <AiOutlineClose />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto mb-4">
            {dummyMessages.map((msg) => (
              <div key={msg.id} className="bg-gray-800 p-3 rounded">
                <p className="font-semibold text-sm">{msg.user}</p>
                <p className="text-sm mt-1">{msg.text}</p>
                {msg.file && (
                  <a href="#" className="text-blue-400 underline text-xs mt-1 inline-block">📎 {msg.file}</a>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 rounded bg-gray-800 focus:outline-none text-sm"
            />
            <button className="text-blue-400 text-xl"><FaPaperPlane /></button>
            <button className="text-green-400 text-xl"><FaFileUpload /></button>
          </div>
        </aside>
      )}

      {/* Bottom Control Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 px-6 py-3 rounded-full shadow-xl flex items-center gap-6">
        <button onClick={() => setMicOn(!isMicOn)} className="text-xl">
          {isMicOn ? <FaMicrophone className="text-green-400" /> : <BsMicMuteFill className="text-red-400" />}
        </button>
        <button onClick={() => setCamOn(!isCamOn)} className="text-xl">
          {isCamOn ? <FaVideo className="text-green-400" /> : <BsFillCameraVideoOffFill className="text-red-400" />}
        </button>
        <button className="text-white px-4 py-1.5 bg-indigo-600 rounded hover:bg-indigo-700 transition">
          Open Whiteboard
        </button>
        <button onClick={() => setParticipantsOpen(!participantsOpen)} className="text-white text-xl">
          <FiUsers />
        </button>
        <button onClick={() => setChatOpen(!chatOpen)} className="text-white text-xl">
          💬
        </button>
      </div>
    </div>
  );
}
