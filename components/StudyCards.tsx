
import React, { useState, useEffect } from 'react';
import { Language, StudyCard } from '../types';
import { languageStudyData } from '../data/studyData';
import { geminiService } from '../services/geminiService';
import { ChevronRight, Code, RotateCw, Plus, X, Sparkles, Loader2 } from 'lucide-react';

const StudyCards: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<Language>('C#');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [customCards, setCustomCards] = useState<Record<Language, StudyCard[]>>(() => {
    const saved = localStorage.getItem('custom_oop_cards');
    return saved ? JSON.parse(saved) : { 'C#': [], 'Java': [], 'Python': [], 'C++': [] };
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCard, setNewCard] = useState({ term: '', definition: '', example: '' });

  useEffect(() => {
    localStorage.setItem('custom_oop_cards', JSON.stringify(customCards));
  }, [customCards]);

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAiGenerate = async () => {
    if (!newCard.term.trim()) return;
    setIsGenerating(true);
    try {
      const result = await geminiService.generateStudyCardContent(newCard.term, selectedLang);
      setNewCard(prev => ({
        ...prev,
        definition: result.definition,
        example: result.example
      }));
    } catch (error) {
      alert("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.term || !newCard.definition) return;

    const card: StudyCard = {
      id: `custom-${Date.now()}`,
      ...newCard
    };

    setCustomCards(prev => ({
      ...prev,
      [selectedLang]: [card, ...prev[selectedLang]]
    }));

    setNewCard({ term: '', definition: '', example: '' });
    setShowAddForm(false);
  };

  const languages: Language[] = ['C#', 'Java', 'Python', 'C++'];
  const allCards = [...(customCards[selectedLang] || []), ...languageStudyData[selectedLang]];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
            <Code className="w-5 h-5 mr-2 text-indigo-600" />
            OOP Knowledge Cards
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLang(lang);
                  setFlippedCards(new Set());
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedLang === lang
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-sm border border-indigo-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Card</span>
        </button>
      </div>

      {/* Add Card Form Modal-ish */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Add New {selectedLang} Term</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Term Name</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newCard.term}
                    onChange={e => setNewCard(prev => ({ ...prev, term: e.target.value }))}
                    placeholder="e.g. Encapsulation, Abstract Class..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={!newCard.term || isGenerating}
                    className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span className="text-xs font-bold whitespace-nowrap">AI Auto-Fill</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Definition</label>
                <textarea 
                  required
                  rows={3}
                  value={newCard.definition}
                  onChange={e => setNewCard(prev => ({ ...prev, definition: e.target.value }))}
                  placeholder="Explain the term simply..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Code Example (Optional)</label>
                <textarea 
                  rows={3}
                  value={newCard.example}
                  onChange={e => setNewCard(prev => ({ ...prev, example: e.target.value }))}
                  placeholder="Provide a small code snippet..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold text-sm"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
        {allCards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          const isCustom = card.id.startsWith('custom-');
          
          return (
            <div 
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="perspective-1000 h-64 w-full cursor-pointer group"
            >
              <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{selectedLang} Concept</span>
                    {isCustom && <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">My Card</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 text-center">{card.term}</h3>
                  <div className="mt-6 flex items-center text-slate-400 text-xs font-medium group-hover:text-indigo-500 transition-colors">
                    <RotateCw className="w-3 h-3 mr-1" />
                    Click to flip
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col p-6 overflow-hidden">
                  <div className="flex-1 overflow-y-auto pr-1">
                    <h4 className="text-indigo-400 font-bold text-[10px] uppercase tracking-wider mb-1">Definition</h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {card.definition}
                    </p>
                    {card.example && (
                      <>
                        <h4 className="text-indigo-400 font-bold text-[10px] uppercase tracking-wider mb-1">Example</h4>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                          <code className="text-[11px] text-emerald-400 font-mono whitespace-pre-wrap">
                            {card.example}
                          </code>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    Back to front
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default StudyCards;
