
import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, ChatState, UserProgress } from '../types';
import { geminiService } from '../services/geminiService';
import ChatMessage from './ChatMessage';
import { Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isThinking: true,
    error: null,
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const welcomeText = await geminiService.startChat();
        const welcomeMsg: Message = {
          id: '1',
          role: Role.INTERVIEWER,
          content: welcomeText || "Welcome to your OOP interview. Let's start with a scenario: Animals domain. How would you design the classes?",
          timestamp: new Date(),
        };
        setState(prev => ({
          ...prev,
          messages: [welcomeMsg],
          isThinking: false,
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: "Failed to connect to the interviewer. Please check your API key.",
          isThinking: false,
        }));
      }
    };

    initChat();
  }, []);

  const updateProgress = () => {
    const saved = localStorage.getItem('user_oop_progress');
    let current: UserProgress = saved ? JSON.parse(saved) : {
      completedChallenges: 0,
      correctSolutions: 0,
      interviewResponses: 0,
      lastActive: new Date().toLocaleDateString()
    };

    current.interviewResponses += 1;
    current.lastActive = new Date().toLocaleDateString();

    localStorage.setItem('user_oop_progress', JSON.stringify(current));
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || state.isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.CANDIDATE,
      content: input,
      timestamp: new Date(),
    };

    const thinkingMessage: Message = {
      id: 'thinking',
      role: Role.INTERVIEWER,
      content: '',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, thinkingMessage],
      isThinking: true,
    }));
    setInput('');
    updateProgress();

    try {
      await geminiService.sendMessageStream(input, (fullText) => {
        setState(prev => {
          const newMessages = [...prev.messages];
          const lastMsgIndex = newMessages.length - 1;
          if (newMessages[lastMsgIndex].id === 'thinking') {
            newMessages[lastMsgIndex] = {
              ...newMessages[lastMsgIndex],
              content: fullText,
              id: Date.now().toString(),
            };
          } else {
            newMessages[lastMsgIndex].content = fullText;
          }
          return { ...prev, messages: newMessages };
        });
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: "Message failed to send. Try again.",
      }));
    } finally {
      setState(prev => ({ ...prev, isThinking: false }));
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 tracking-tight">OOP Interview Simulator</h2>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Live Interview Session</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex space-x-2">
          <button onClick={() => window.location.reload()} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors font-semibold">
            Reset Session
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 bg-slate-50/50">
        {state.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {state.isThinking && state.messages.length > 0 && state.messages[state.messages.length - 1].content === '' && (
          <div className="flex items-center space-x-2 text-slate-400 p-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Evaluating...</span>
          </div>
        )}
        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {state.error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your design ideas or answer here..."
            className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-sm min-h-[52px] max-h-32"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || state.isThinking}
            className={`absolute right-2 p-2 rounded-lg transition-all ${
              !input.trim() || state.isThinking
                ? 'text-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-2 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Tip: Be specific with your answers to get better feedback.
          </p>
          <p className="text-[10px] text-slate-400">Enter to send</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
