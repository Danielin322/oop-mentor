
import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import StudyCards from './components/StudyCards';
import CodePractice from './components/CodePractice';
import StudentProgress from './components/StudentProgress';
import { ActiveTab } from './types';
import { BookOpen, BrainCircuit, MessageSquare, GraduationCap, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('interview');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-full md:w-72 bg-slate-900 text-white p-6 flex flex-col hidden md:flex shrink-0">
        <div className="flex items-center space-x-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">OOP Mentor</h1>
        </div>

        <nav className="flex-1 space-y-6">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Navigation</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('interview')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    activeTab === 'interview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Interview Bot</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('cards')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    activeTab === 'cards' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Study Cards</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('practice')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    activeTab === 'practice' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Coding Lab</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('progress')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    activeTab === 'progress' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>My Progress</span>
                </button>
              </li>
            </ul>
          </section>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
          <p>© 2024 OOP Interview Master AI</p>
          <p className="mt-1">Powered by Gemini 3 Pro</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Mobile Header & Nav */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex flex-col shrink-0">
          <div className="flex items-center mb-3">
            <div className="bg-indigo-600 p-1.5 rounded-md mr-3">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-slate-800">OOP Mentor</h1>
          </div>
          <div className="flex space-x-1 overflow-x-auto pb-1">
            <button 
              onClick={() => setActiveTab('interview')}
              className={`flex-1 min-w-[80px] text-[10px] py-2 rounded-md font-bold uppercase tracking-wider ${activeTab === 'interview' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              Interview
            </button>
            <button 
              onClick={() => setActiveTab('cards')}
              className={`flex-1 min-w-[80px] text-[10px] py-2 rounded-md font-bold uppercase tracking-wider ${activeTab === 'cards' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              Cards
            </button>
            <button 
              onClick={() => setActiveTab('practice')}
              className={`flex-1 min-w-[80px] text-[10px] py-2 rounded-md font-bold uppercase tracking-wider ${activeTab === 'practice' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              Lab
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={`flex-1 min-w-[80px] text-[10px] py-2 rounded-md font-bold uppercase tracking-wider ${activeTab === 'progress' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              Stats
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-10 relative overflow-y-auto bg-slate-50">
          {activeTab === 'interview' && <ChatInterface />}
          {activeTab === 'cards' && <StudyCards />}
          {activeTab === 'practice' && <CodePractice />}
          {activeTab === 'progress' && <StudentProgress />}
        </div>
      </main>
    </div>
  );
};

export default App;
