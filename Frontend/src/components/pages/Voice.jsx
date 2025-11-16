import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "regenerator-runtime/runtime";
import microphoneAnimation from "../../assets/mic.webm";
import { TypeAnimation } from "react-type-animation";

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
            j % 2 === 1 ? <strong key={j} className="text-cyan-300">{part}</strong> : <span key={j}>{part}</span>
          )}
        </div>
      );
    }
    
    // Bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
      return (
        <div key={i} className="flex items-start mb-2 ml-2">
          <span className="text-cyan-400 mr-2 mt-1">•</span>
          <span className="flex-1">{line.replace(/^[•\-*]\s*/, '')}</span>
        </div>
      );
    }
    
    // Numbered lists
    if (/^\d+\./.test(line.trim())) {
      return (
        <div key={i} className="flex items-start mb-2 ml-2">
          <span className="text-cyan-400 mr-2 font-semibold">{line.match(/^\d+\./)[0]}</span>
          <span className="flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
        </div>
      );
    }
    
    // Headers (lines ending with :)
    if (line.trim().endsWith(':') && line.length < 100) {
      return <div key={i} className="font-semibold text-cyan-300 mt-3 mb-2">{line}</div>;
    }
    
    // Empty lines
    if (!line.trim()) {
      return <div key={i} className="h-2"></div>;
    }
    
    // Regular text
    return <div key={i} className="mb-2">{line}</div>;
  });
};

const VoiceBot = () => {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I'm your voice assistant. Ask me anything about your career." }
  ]);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [Listening, setListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <div>Your browser does not support speech recognition.</div>;
  }

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true }, setListening(true));

  const stopListening = () => {
    SpeechRecognition.stopListening();
    sendTranscript(transcript);
    resetTranscript();
    setListening(false);
  };

  const sendTranscript = async (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    // Add user message to history
    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch("http://localhost:8000/api/voice/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      });

      const data = await response.json();

      // Add bot response to history
      const botMessage = { role: "bot", content: data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { role: "bot", content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const voiceCommand = async () => {
    const response = await fetch("http://localhost:8000/api/bot/cmd/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data.message);
  };

  return (
    <div className="chat-bg-image flex flex-col items-center min-h-screen relative overflow-hidden px-6 py-8">
      <div className="bg-black/70 backdrop-blur-md px-12 py-6 rounded-2xl border-2 border-cyan-500/50 shadow-2xl mb-6">
        <h2 className="text-7xl font-black mb-3 text-center text-cyan-300 drop-shadow-[0_6px_16px_rgba(0,0,0,1)] tracking-tight">
          Voice Assistant
        </h2>
        <p className="text-cyan-400 text-xl font-semibold text-center drop-shadow-lg">AI-Powered Career Guidance</p>
      </div>
      <div className="relative my-6">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full blur-3xl opacity-20"></div>
        <video
          className="relative mx-auto cursor-pointer rounded-full border-2 border-cyan-400/40 shadow-2xl hover:scale-105 transition-all duration-300 hover:border-cyan-400/60"
          src={microphoneAnimation}
          autoPlay
          loop
          muted
          width="120"
          height="140"
          onClick={voiceCommand}
        ></video>
      </div>
      <div className="bg-black/60 backdrop-blur-sm px-8 py-4 rounded-xl border border-cyan-500/30 shadow-lg my-4">
        <h3 className="text-center text-2xl font-semibold text-white drop-shadow-[0_3px_8px_rgba(0,0,0,1)]">
          Ask anything about your career goals and get personalized guidance
        </h3>
      </div>
      <div className="text-center my-6 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg border border-cyan-500/20">
        <TypeAnimation
          sequence={[
            "Press Start Recording to begin . . . ",
            1000,
            "",
          ]}
          speed={50}
          repeat={Infinity}
          className="text-xl text-cyan-300 font-semibold tracking-wide drop-shadow-lg"
        />
      </div>

      <div className="flex flex-row my-6 justify-center gap-3">
        <button
          className="bg-cyan-600/80 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-lg shadow-xl border border-cyan-500/50 hover:bg-cyan-500/80 hover:shadow-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 min-w-[180px] justify-center"
          onClick={startListening}
          disabled={listening}
        >
          {Listening ? (
            <>
              <span className="animate-pulse">🔴</span>
              <span>Listening...</span>
            </>
          ) : (
            <>
              <span>🎤</span>
              <span>Start Recording</span>
            </>
          )}
        </button>
        <button
          className="bg-red-600/80 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-lg shadow-xl border border-red-500/50 hover:bg-red-500/80 hover:shadow-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 min-w-[180px] justify-center"
          onClick={stopListening}
          disabled={!listening}
        >
          <span>⏹</span>
          <span>Stop Recording</span>
        </button>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="w-full max-w-4xl mt-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-black/90 backdrop-blur-lg p-6 border-2 border-cyan-500/60 rounded-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-cyan-500/50 bg-cyan-500/10 -mx-6 -mt-6 px-6 pt-4 rounded-t-xl">
                <span className="text-cyan-300 text-2xl drop-shadow-lg">📝</span>
                <h3 className="text-xl font-bold text-cyan-300 drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">Live Transcript</h3>
              </div>
              <p className="text-white text-lg leading-relaxed font-medium drop-shadow-md">{transcript}</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversation History */}
      <div className="w-full max-w-4xl mt-6 mb-8">
        <div className="bg-black/85 backdrop-blur-xl shadow-2xl rounded-2xl border-2 border-cyan-500/70">
          <div className="p-6 h-[500px] overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-sm rounded-t-2xl">
            {messages.map((msg, index) => {
              const isBot = msg.role === "bot";
              
              if (isBot) {
                return (
                  <div key={index} className="flex justify-start mb-6 animate-fadeIn">
                    <div className="flex items-start max-w-4xl">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-red-600 flex items-center justify-center text-white font-bold shadow-2xl border-2 border-cyan-400 mr-3 hover:scale-110 transition-transform backdrop-blur-sm">
                        <span className="text-xl">🤖</span>
                      </div>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-red-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                        <div className="relative bg-black/80 backdrop-blur-md rounded-2xl rounded-tl-none shadow-2xl p-5 border-2 border-cyan-500/70 hover:border-cyan-400 transition-colors">
                          <div className="text-white text-base leading-relaxed drop-shadow-lg">
                            {formatContent(msg.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={index} className="flex justify-end mb-6 animate-fadeIn">
                  <div className="flex items-start max-w-2xl">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-70 transition duration-300"></div>
                      <div className="relative bg-gradient-to-br from-red-600/90 via-red-700/90 to-blue-600/90 backdrop-blur-md rounded-2xl rounded-tr-none shadow-2xl p-4 border-2 border-red-500/70 hover:border-red-400 transition-colors">
                        <div className="text-white text-base leading-relaxed font-medium drop-shadow-lg">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-blue-600 flex items-center justify-center text-white font-bold shadow-2xl border-2 border-red-400 ml-3 hover:scale-110 transition-transform backdrop-blur-sm">
                      <span className="text-xl">👤</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isProcessing && (
              <div className="flex justify-start mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg mr-3 border-2 border-cyan-500 backdrop-blur-sm">
                    AI
                  </div>
                  <div className="bg-black/80 backdrop-blur-md rounded-2xl rounded-tl-none shadow-lg p-5 border-2 border-cyan-500/70">
                    <div className="flex items-center text-cyan-400">
                      <div className="flex space-x-1 mr-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-white">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceBot;
