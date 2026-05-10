import { useState } from 'react';
import { Send, Search, Phone, Video, MoreVertical, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const demoChats = [
  { id: 1, name: 'Maarif 5v5 Evening', isGroup: true, lastMessage: 'Amine: I bring the ball guys.', time: '12:45', unread: 2, avatar: 'M5' },
  { id: 2, name: 'Omar', isGroup: false, lastMessage: 'Are we still playing tomorrow?', time: '10:30', unread: 0, avatar: 'O' },
  { id: 3, name: 'FC Casablanca', isGroup: true, lastMessage: 'Hamza: Next tournament on Saturday.', time: 'Yesterday', unread: 0, avatar: 'FC' },
  { id: 4, name: 'Yassine', isGroup: false, lastMessage: 'GG well played bro', time: 'Mon', unread: 0, avatar: 'Y' }
];

export function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);

  if (activeChat) {
    return <ChatRoom chat={activeChat} onBack={() => setActiveChat(null)} />;
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button className="icon-button w-10 h-10">
          <Plus size={20} className="text-emerald" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-white/40" />
        </div>
        <input 
          type="text" 
          placeholder="Search chats, groups, players..." 
          className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 space-y-2 mt-4">
        {demoChats.map((chat) => (
          <button 
            key={chat.id} 
            onClick={() => setActiveChat(chat)}
            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[#1E1E1E] transition-colors text-left"
          >
            <div className={`relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-black ${chat.isGroup ? 'bg-gradient-to-br from-[#333333] to-[#111111] text-white border border-[#444444]' : 'bg-emerald text-obsidian'}`}>
              {chat.isGroup ? chat.avatar : <img src={`https://ui-avatars.com/api/?name=${chat.name}&background=00F260&color=0A0A0C&size=128`} className="rounded-full w-full h-full" alt="avatar" />}
              {chat.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan rounded-full border-2 border-obsidian flex items-center justify-center text-[10px] font-bold text-obsidian">
                  {chat.unread}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold truncate text-base">{chat.name}</h3>
                <span className={`text-xs whitespace-nowrap ${chat.unread > 0 ? 'text-cyan font-bold' : 'text-white/40'}`}>
                  {chat.time}
                </span>
              </div>
              <p className={`text-sm truncate ${chat.unread > 0 ? 'text-white font-medium' : 'text-white/50'}`}>
                {chat.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatRoom({ chat, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello everyone!', sender: 'Hamza', time: '12:00', isMe: false },
    { id: 2, text: 'Are we full for tonight?', sender: 'Yassine', time: '12:05', isMe: false },
    { id: 3, text: 'Yes, 10 players confirmed. See you at 19:00', sender: 'Me', time: '12:15', isMe: true },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      text: message,
      sender: 'Me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-40px)] max-w-xl mx-auto bg-obsidian">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${chat.isGroup ? 'bg-[#333333] text-white' : 'bg-emerald text-obsidian'}`}>
              {chat.isGroup ? chat.avatar : <img src={`https://ui-avatars.com/api/?name=${chat.name}&background=00F260&color=0A0A0C&size=128`} className="rounded-full w-full h-full" alt="avatar" />}
            </div>
            <div>
              <h2 className="font-bold text-sm">{chat.name}</h2>
              <p className="text-[10px] text-emerald font-medium">{chat.isGroup ? '10 members' : 'Online'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-white/50 hover:text-white"><Phone size={18} /></button>
          <button className="p-2 text-white/50 hover:text-white"><Video size={18} /></button>
          <button className="p-2 text-white/50 hover:text-white"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide flex flex-col justify-end">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
          >
            {!msg.isMe && chat.isGroup && (
              <span className="text-[10px] text-white/40 ml-2 mb-1">{msg.sender}</span>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.isMe ? 'bg-emerald text-obsidian rounded-tr-sm shadow-glow' : 'bg-[#1E1E1E] border border-[#333333] text-white rounded-tl-sm'}`}>
              {msg.text}
            </div>
            <span className="text-[9px] text-white/30 mt-1 mx-1">{msg.time}</span>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="pt-2 pb-safe border-t border-[#333333] flex items-end gap-2">
        <button type="button" className="p-3 text-white/40 hover:text-white flex-shrink-0">
          <Plus size={22} />
        </button>
        <div className="flex-1 bg-[#1E1E1E] border border-[#333333] rounded-3xl min-h-[44px] flex items-center px-4">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..." 
            className="w-full bg-transparent text-sm focus:outline-none py-3"
          />
        </div>
        <button 
          type="submit" 
          disabled={!message.trim()}
          className="w-11 h-11 rounded-full bg-emerald text-obsidian flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:bg-[#333333] disabled:text-white/40 transition-colors"
        >
          <Send size={18} className={message.trim() ? "ml-1" : ""} />
        </button>
      </form>
    </div>
  );
}
