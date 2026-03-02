
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isInterviewer = message.role === Role.INTERVIEWER;

  return (
    <div className={`flex w-full mb-6 ${isInterviewer ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isInterviewer ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isInterviewer ? 'bg-indigo-600 text-white mr-3' : 'bg-slate-800 text-white ml-3'
        }`}>
          {isInterviewer ? 'AI' : 'ME'}
        </div>
        
        <div className={`flex flex-col ${isInterviewer ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isInterviewer 
              ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'
          }`}>
            <div className="whitespace-pre-wrap">
              {message.content.split('```').map((part, index) => {
                if (index % 2 === 1) {
                  return (
                    <div key={index} className="my-2 p-3 bg-slate-900 text-indigo-300 font-mono text-xs rounded-md overflow-x-auto border border-slate-700">
                      <code>{part.trim()}</code>
                    </div>
                  );
                }
                return <span key={index}>{part}</span>;
              })}
            </div>
          </div>
          <span className="mt-1 text-[10px] text-slate-400 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
