
import React, { useEffect, useState } from 'react';
import { UserProgress } from '../types';
import { Trophy, Target, MessageCircle, Calendar, Award } from 'lucide-react';

const StudentProgress: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>({
    completedChallenges: 0,
    correctSolutions: 0,
    interviewResponses: 0,
    lastActive: new Date().toLocaleDateString()
  });

  useEffect(() => {
    const saved = localStorage.getItem('user_oop_progress');
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const stats = [
    { label: 'Coding Lab Challenges', value: progress.completedChallenges, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Correct Solutions', value: progress.correctSolutions, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Interview Interactions', value: progress.interviewResponses, icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Last Active', value: progress.lastActive, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Learning Journey</h2>
            <p className="text-slate-500 text-sm">Tracking your mastery of Object Oriented Programming.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-slate-100 transition-all hover:shadow-md hover:scale-[1.02]`}>
              <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
              <div className="text-3xl font-black text-slate-800 leading-none mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
