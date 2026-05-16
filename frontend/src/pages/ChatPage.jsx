import { useState } from "react";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Plus,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const demoChats = [
  {
    id: 1,
    name: "Maarif 5v5 Evening",
    isGroup: true,
    lastMessage: "Amine: I bring the ball guys.",
    time: "12:45",
    unread: 2,
    avatar: "M5",
  },
  {
    id: 2,
    name: "Omar",
    isGroup: false,
    lastMessage: "Are we still playing tomorrow?",
    time: "10:30",
    unread: 0,
    avatar: "O",
  },
  {
    id: 3,
    name: "FC Casablanca",
    isGroup: true,
    lastMessage: "Hamza: Next tournament on Saturday.",
    time: "Yesterday",
    unread: 0,
    avatar: "FC",
  },
  {
    id: 4,
    name: "Yassine",
    isGroup: false,
    lastMessage: "GG well played bro",
    time: "Mon",
    unread: 0,
    avatar: "Y",
  },
];

export function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);

  if (activeChat) {
    return <ChatRoom chat={activeChat} onBack={() => setActiveChat(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-xl mx-auto min-h-[80vh] flex flex-col pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black tracking-tight">
          Messages
        </h1>
        <button className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald hover:text-obsidian hover:border-emerald hover:shadow-glow transition-all">
          <Plus size={22} />
        </button>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search
            size={18}
            className="text-white/40 group-focus-within:text-emerald transition-colors"
          />
        </div>
        <input
          type="text"
          placeholder="Search chats, groups, players..."
          className="w-full bg-surface/50 border border-white/5 text-white rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-emerald/50 focus:bg-surface/80 shadow-inner transition-all"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 space-y-3 mt-4">
        {demoChats.map((chat, index) => (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className="w-full glass-panel flex items-center gap-4 p-4 rounded-[1.5rem] border border-white/5 hover:border-emerald/30 transition-all text-left relative overflow-hidden group"
          >
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald/0 via-emerald/5 to-emerald/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div
              className={`relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-black z-10 shadow-lg ${chat.isGroup ? "bg-gradient-to-br from-surface to-surfaceLight text-white border border-white/10" : "bg-gradient-to-br from-emerald to-[#00A643] text-obsidian border border-emerald/50"}`}
            >
              {chat.isGroup ? (
                chat.avatar
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${chat.name}&background=121212&color=fff&size=128`}
                  className="rounded-full w-full h-full object-cover opacity-90"
                  alt="avatar"
                />
              )}
              {chat.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan rounded-full border-2 border-obsidian flex items-center justify-center text-[10px] font-black text-obsidian shadow-[0_0_10px_rgba(5,213,255,0.5)]">
                  {chat.unread}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold truncate text-lg text-white group-hover:text-emerald transition-colors">
                  {chat.name}
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${chat.unread > 0 ? "text-cyan drop-shadow-md" : "text-white/40"}`}
                >
                  {chat.time}
                </span>
              </div>
              <p
                className={`text-sm truncate ${chat.unread > 0 ? "text-white font-medium drop-shadow-sm" : "text-white/50 font-medium"}`}
              >
                {chat.lastMessage}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ChatRoom({ chat, onBack }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello everyone!",
      sender: "Hamza",
      time: "12:00",
      isMe: false,
    },
    {
      id: 2,
      text: "Are we full for tonight?",
      sender: "Yassine",
      time: "12:05",
      isMe: false,
    },
    {
      id: 3,
      text: "Yes, 10 players confirmed. See you at 19:00",
      sender: "Me",
      time: "12:15",
      isMe: true,
    },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: message,
        sender: "Me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
      },
    ]);
    setMessage("");
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-40px)] max-w-xl mx-auto"
    >
      {/* Glass Header */}
      <div className="glass-panel rounded-b-3xl border-x border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-20 shadow-xl backdrop-blur-2xl bg-surface/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-black shadow-lg ${chat.isGroup ? "bg-gradient-to-br from-surface to-surfaceLight text-white border border-white/10" : "bg-gradient-to-br from-emerald to-[#00A643] text-obsidian border border-emerald/50"}`}
            >
              {chat.isGroup ? (
                chat.avatar
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${chat.name}&background=121212&color=fff&size=128`}
                  className="rounded-full w-full h-full object-cover opacity-90"
                  alt="avatar"
                />
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-tight drop-shadow-md">
                {chat.name}
              </h2>
              <p className="text-[10px] text-emerald font-black uppercase tracking-widest mt-0.5 animate-pulse">
                {chat.isGroup ? "10 members" : "Online"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-emerald hover:bg-emerald/10 transition-colors">
            <Phone size={20} />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-emerald hover:bg-emerald/10 transition-colors">
            <Video size={20} />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide flex flex-col justify-end">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
            >
              {!msg.isMe && chat.isGroup && (
                <span className="text-[10px] font-bold text-white/40 ml-3 mb-1.5">
                  {msg.sender}
                </span>
              )}
              <div
                className={`max-w-[80%] px-5 py-3 text-sm font-medium leading-relaxed shadow-lg ${
                  msg.isMe
                    ? "bg-gradient-to-br from-emerald to-[#00A643] text-obsidian rounded-2xl rounded-tr-sm shadow-[0_5px_15px_rgba(0,242,96,0.15)]"
                    : "bg-surfaceLight/80 backdrop-blur-md border border-white/5 text-white rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] font-bold text-white/30 mt-1.5 mx-2 uppercase tracking-wider">
                {msg.time}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2">
        <form
          onSubmit={handleSend}
          className="glass-panel p-2 rounded-[2rem] border border-white/10 flex items-center gap-2 shadow-2xl bg-surface/80 backdrop-blur-2xl"
        >
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-emerald hover:bg-emerald/10 transition-colors flex-shrink-0"
          >
            <Plus size={22} />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-cyan hover:bg-cyan/10 transition-colors flex-shrink-0 -ml-2"
          >
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 bg-black/20 rounded-2xl px-4 py-2 border border-white/5 shadow-inner">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-white/30"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!message.trim()}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald to-[#00d455] text-obsidian flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:from-surfaceLight disabled:to-surfaceLight disabled:text-white/20 transition-all shadow-glow disabled:shadow-none"
          >
            <Send size={20} className={message.trim() ? "ml-1" : ""} />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
