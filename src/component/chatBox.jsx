import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, Hash, Settings, Search, Plus, Smile, Paperclip, Minimize2, Maximize2, MoreVertical } from 'lucide-react';

export default function TeamChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey team! Ready for the sprint planning?", from: 'Alice Johnson', avatar: 'AJ', timestamp: new Date(Date.now() - 300000), status: 'online' },
    { id: 2, text: "Yes! I've prepared the user stories", from: 'Mike Chen', avatar: 'MC', timestamp: new Date(Date.now() - 240000), status: 'online' },
    { id: 3, text: "Perfect! Let's start in 5 minutes", from: 'Sarah Wilson', avatar: 'SW', timestamp: new Date(Date.now() - 180000), status: 'away' },
    { id: 4, text: "Sounds good, I'll share my screen", from: 'You', avatar: 'YU', timestamp: new Date(Date.now() - 120000), status: 'online' },
    { id: 5, text: "Great! I have the latest designs ready to review", from: 'Emma Brown', avatar: 'EB', timestamp: new Date(Date.now() - 100000), status: 'online' },
    { id: 6, text: "Awesome! Let's make sure we cover all the edge cases this time", from: 'David Kim', avatar: 'DK', timestamp: new Date(Date.now() - 80000), status: 'busy' },
    { id: 7, text: "Definitely. I'll take notes during the meeting", from: 'Alice Johnson', avatar: 'AJ', timestamp: new Date(Date.now() - 60000), status: 'online' },
    { id: 8, text: "Perfect! Should we start with the user authentication flow?", from: 'Mike Chen', avatar: 'MC', timestamp: new Date(Date.now() - 40000), status: 'online' },
    { id: 9, text: "Yes, that's our highest priority item", from: 'Sarah Wilson', avatar: 'SW', timestamp: new Date(Date.now() - 20000), status: 'away' },
    { id: 10, text: "I'll pull up the mockups now", from: 'You', avatar: 'YU', timestamp: new Date(Date.now() - 10000), status: 'online' },
    { id: 11, text: "Looking forward to seeing the progress!", from: 'Emma Brown', avatar: 'EB', timestamp: new Date(Date.now() - 5000), status: 'online' },
    { id: 12, text: "This is going to be a great sprint!", from: 'David Kim', avatar: 'DK', timestamp: new Date(), status: 'busy' },
  ]);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [onlineUsers] = useState([
    { name: 'Alice Johnson', avatar: 'AJ', status: 'online' },
    { name: 'Mike Chen', avatar: 'MC', status: 'online' },
    { name: 'Sarah Wilson', avatar: 'SW', status: 'away' },
    { name: 'David Kim', avatar: 'DK', status: 'busy' },
    { name: 'Emma Brown', avatar: 'EB', status: 'online' },
    { name: 'Tom Anderson', avatar: 'TA', status: 'offline' },
    { name: 'Lisa Park', avatar: 'LP', status: 'online' },
    { name: 'John Smith', avatar: 'JS', status: 'away' },
    { name: 'Maria Garcia', avatar: 'MG', status: 'busy' },
    { name: 'Alex Thompson', avatar: 'AT', status: 'offline' },
  ]);
  const [unreadCount, setUnreadCount] = useState(2);
  const messagesEndRef = useRef(null);

  const channels = [
    { name: 'general', icon: Hash, unread: 2 },
    { name: 'development', icon: Hash, unread: 0 },
    { name: 'design', icon: Hash, unread: 1 },
    { name: 'random', icon: Hash, unread: 0 },
    { name: 'marketing', icon: Hash, unread: 3 },
    { name: 'support', icon: Hash, unread: 0 },
    { name: 'announcements', icon: Hash, unread: 1 },
    { name: 'qa-testing', icon: Hash, unread: 0 },
  ];

  const handleSend = () => {
    if (input.trim() !== '') {
      const newMessage = {
        id: messages.length + 1,
        text: input,
        from: 'You',
        avatar: 'YU',
        timestamp: new Date(),
        status: 'online'
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'busy': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
          title={isOpen ? 'Close Team Chat' : 'Open Team Chat'}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          
          {/* Unread Badge */}
          {!isOpen && unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* Online Indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
        </button>
      </div>

      {/* Chat Modal */}
      <div
        className={`fixed bottom-24 right-6 w-[5/12] max-w-7/12 bg-white shadow-2xl rounded-2xl flex overflow-hidden border border-gray-200 transition-all duration-300 z-50 ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
        } ${isMinimized ? 'h-16' : 'h-9/12'}`}
      >
        {/* Sidebar */}
        {!isMinimized && (
          <div className="w-60 bg-gray-900 text-white flex flex-col max-h-full">
            {/* Team Header */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold">
                  T
                </div>
                Team Workspace
              </h2>
              <p className="text-gray-400 text-sm mt-1">{onlineUsers.filter(u => u.status === 'online').length} online</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {/* Channels */}
              {/* <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Channels</span>
                  <Plus size={14} className="text-gray-400 hover:text-white cursor-pointer" />
                </div>
                <div className="space-y-1">
                  {channels.map((channel) => (
                    <button
                      key={channel.name}
                      onClick={() => setActiveChannel(channel.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        activeChannel === channel.name 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <channel.icon size={16} />
                        <span className="text-sm">#{channel.name}</span>
                      </div>
                      {channel.unread > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {channel.unread}
                        </div>
                      )}
                    </button>
                  ))}
                </div> */}
              {/* </div> */}

              {/* Online Users */}
              <div className="p-3 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Team Members</span>
                  <Users size={14} className="text-gray-400" />
                </div>
                <div className="space-y-1">
                  {onlineUsers.map((user, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-semibold">
                          {user.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-gray-900`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white max-h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Hash size={20} className="text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">#{activeChannel}</h3>
                <p className="text-xs text-gray-500">{messages.length} messages</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Search">
                <Search size={16} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
                <Settings size={16} className="text-gray-600" />
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {messages.map((msg, index) => (
                  <div key={msg.id} className="group">
                    {/* Show date separator */}
                    {index === 0 || new Date(messages[index-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString() && (
                      <div className="flex items-center my-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="px-3 text-xs text-gray-500 bg-gray-50">
                          {new Date(msg.timestamp).toDateString() === new Date().toDateString() ? 'Today' : new Date(msg.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                    )}

                    <div className="flex gap-3 hover:bg-white hover:shadow-sm rounded-lg p-2 -m-2 transition-all">
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          msg.from === 'You' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}>
                          {msg.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(msg.status)} rounded-full border-2 border-white`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{msg.from}</span>
                          <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed">{msg.text}</p>
                      </div>

                      {/* Message Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-none"
                        placeholder={`Message #${activeChannel}`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      />
                      
                      {/* Input Actions */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Attach file">
                          <Paperclip size={16} className="text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Add emoji">
                          <Smile size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={handleSend}
                          disabled={!input.trim()}
                          className={`p-1.5 rounded-lg transition-all ${
                            input.trim()
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          title="Send message"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}