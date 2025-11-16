import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../index.css";
import { TypeAnimation } from "react-type-animation";
import "regenerator-runtime/runtime";

const Message = ({ message }) => {
  const isBot = message.role === "bot";
  
  // Format bot response with markdown-style formatting
  const formatContent = (content) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold text: **text**
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={i} className="mb-2">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
            )}
          </div>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={i} className="flex items-start mb-2 ml-2">
            <span className="text-blue-500 mr-2 mt-1">•</span>
            <span className="flex-1">{line.replace(/^[•\-*]\s*/, '')}</span>
          </div>
        );
      }
      
      // Numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={i} className="flex items-start mb-2 ml-2">
            <span className="text-blue-500 mr-2 font-semibold">{line.match(/^\d+\./)[0]}</span>
            <span className="flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }
      
      // Headers (lines ending with :)
      if (line.trim().endsWith(':') && line.length < 100) {
        return <div key={i} className="font-semibold text-gray-900 mt-3 mb-2">{line}</div>;
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={i} className="h-2"></div>;
      }
      
      // Regular text
      return <div key={i} className="mb-2">{line}</div>;
    });
  };

  if (isBot) {
    return (
      <div className="flex justify-start mb-6 animate-fadeIn">
        <div className="flex items-start max-w-4xl">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-red-600 flex items-center justify-center text-white font-bold shadow-2xl border-2 border-cyan-400 mr-3 hover:scale-110 transition-transform backdrop-blur-sm">
            <span className="text-xl">🤖</span>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-red-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <div className="relative bg-black/80 backdrop-blur-md rounded-2xl rounded-tl-none shadow-2xl p-5 border-2 border-cyan-500/70 hover:border-cyan-400 transition-colors">
              <div className="text-white text-base leading-relaxed drop-shadow-lg">
                {formatContent(message.content)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end mb-6 animate-fadeIn">
      <div className="flex items-start max-w-2xl">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-70 transition duration-300"></div>
          <div className="relative bg-gradient-to-br from-red-600/90 via-red-700/90 to-blue-600/90 backdrop-blur-md rounded-2xl rounded-tr-none shadow-2xl p-4 border-2 border-red-500/70 hover:border-red-400 transition-colors">
            <div className="text-white text-base leading-relaxed font-medium drop-shadow-lg">
              {message.content}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-blue-600 flex items-center justify-center text-white font-bold shadow-2xl border-2 border-red-400 ml-3 hover:scale-110 transition-transform backdrop-blur-sm">
          <span className="text-xl">👤</span>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello, how can I assist you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle initial message from navigation state
  useEffect(() => {
    if (location.state?.initialMessage) {
      setInput(location.state.initialMessage);
      // Auto-send after a short delay
      setTimeout(() => {
        handleSendMessage(location.state.initialMessage);
      }, 500);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Special response for "Thank you"
    if (textToSend.trim().toLowerCase() === "thank you") {
      setMessages(prev => [
        ...prev,
        { role: "bot", content: "You are welcome, Good luck to your future!" },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();
      const botMessage = { role: "bot", content: data.response.output_text };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "Sorry, I'm having trouble connecting. Please make sure the backend server is running." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    await handleSendMessage(input);
  };

  return (
    <>
      <div className="chat-bg-image flex flex-col items-center min-h-screen relative overflow-hidden">
        <h1 className="text-7xl font-bold text-cyan-300 text-center mt-24 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] shadow-black">
          {" "}
          Chat with Personal Assistant
        </h1>
        
        {/* Voice Page Navigation Button */}
        <div className="mt-6 mb-8">
          <button
            onClick={() => navigate("/voice")}
            className="bg-green-600/90 backdrop-blur-md hover:bg-green-700/90 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-2xl border-2 border-green-500/50 hover:scale-105 drop-shadow-lg"
          >
            <span>🎤</span>
            <span>Try Voice Assistant</span>
          </button>
        </div>
        
        <TypeAnimation
          sequence={[
            "We assist for Software Development.",
            1000,
            "We assist for UI/UX Engineering.",
            1000,
            "We assist for Cyber Security.",
            1000,
            "We assist for Web Development.",
            1000,
            "We assist for Mobile Development.",
            1000,
            "We assist for DevOps Engineering.",
            1000,
            "We assist for Machine Learning.",
            1000,
            "We assist for AI Engineering.",
            1000,
            "We assist for Database Administration.",
            1000,
            "We assist for Cloud Computing.",
            1000,
          ]}
          speed={50}
          repeat={Infinity}
          className="text-5xl text-white font-semibold text-center mt-24 mb-10 drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]"
        />
        <div className="bg-black/85 backdrop-blur-xl shadow-2xl rounded-2xl w-full max-w-5xl z-10 border-2 border-cyan-500/70">
          <div className="p-6 h-[500px] overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-sm rounded-t-2xl">
            {messages.map((msg, index) => (
              <Message key={index} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg mr-3 border-2 border-cyan-500 backdrop-blur-sm">
                    AI
                  </div>
                  <div className="bg-black/80 backdrop-blur-md rounded-2xl rounded-tl-none shadow-lg p-5 border-2 border-cyan-500/70">
                    <div className="flex items-center text-blue-400">
                      <div className="flex space-x-1 mr-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-white">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-5 border-t-2 border-cyan-500/70 bg-black/60 backdrop-blur-md rounded-b-2xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-black/70 backdrop-blur-sm border-2 border-cyan-500/60 rounded-xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all shadow-inner"
                placeholder="Ask me anything about IT careers..."
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur-sm hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl px-8 py-3 font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-500/70"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;