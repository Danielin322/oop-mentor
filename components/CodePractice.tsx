import React, { useState, useEffect } from 'react';
import { Language, CodeChallenge, CodeEvaluation, UserProgress } from '../types';
import { geminiService } from '../services/geminiService';
import { Terminal, RefreshCcw, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const CodePractice: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<Language>('C#');
  const [challenge, setChallenge] = useState<CodeChallenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchChallenge = async (lang: Language = selectedLang) => {
    setIsLoading(true);
    setEvaluation(null);
    setUserCode('');
    try {
      const result = await geminiService.generateCodeChallenge(lang);

      setChallenge({
        id: Date.now().toString(),
        language: lang,
        ...result,
      } as CodeChallenge);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const updateProgress = (isCorrect: boolean) => {
    const saved = localStorage.getItem('user_oop_progress');
    let current: UserProgress = saved
      ? JSON.parse(saved)
      : {
          completedChallenges: 0,
          correctSolutions: 0,
          interviewResponses: 0,
          lastActive: new Date().toLocaleDateString(),
        };

    current.completedChallenges += 1;
    if (isCorrect) current.correctSolutions += 1;
    current.lastActive = new Date().toLocaleDateString();

    localStorage.setItem('user_oop_progress', JSON.stringify(current));
  };

  const handleLangChange = (lang: Language) => {
    setSelectedLang(lang);
    fetchChallenge(lang);
  };

  const handleSubmit = async () => {
    if (!challenge || !userCode.trim()) return;
    setIsEvaluating(true);
    try {
      // Important: pass the full challenge object for better evaluation
      const result = await geminiService.evaluateCodeSolution(selectedLang, challenge as any, userCode);
      setEvaluation(result as any);
      updateProgress((result as any).isCorrect);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const languages: Language[] = ['C#', 'Java', 'Python', 'C++'];

  const renderChallenge = () => {
    if (!challenge) return null;

    const ch: any = challenge;

    return (
      <>
        <h3 className="text-lg font-bold text-slate-800 mb-3">{ch.title}</h3>

        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Input description</div>
            <p className="whitespace-pre-wrap">{ch.inputDescription}</p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Output description</div>
            <p className="whitespace-pre-wrap">{ch.outputDescription}</p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Constraints</div>
            <p className="whitespace-pre-wrap">{ch.constraints}</p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Example 1</div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Input</div>
              <pre className="whitespace-pre-wrap text-xs text-slate-700">{ch.example1Input}</pre>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 mb-1">Output</div>
              <pre className="whitespace-pre-wrap text-xs text-slate-700">{ch.example1Output}</pre>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Example 2</div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Input</div>
              <pre className="whitespace-pre-wrap text-xs text-slate-700">{ch.example2Input}</pre>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 mb-1">Output</div>
              <pre className="whitespace-pre-wrap text-xs text-slate-700">{ch.example2Output}</pre>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderEvaluationExtras = () => {
    if (!evaluation) return null;
    const ev: any = evaluation;

    return (
      <>
        {ev.confidence && (
          <div className="mt-2 pt-2 border-t border-slate-200/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confidence</span>
            <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{String(ev.confidence)}</p>
          </div>
        )}

        {Array.isArray(ev.failingCases) && ev.failingCases.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Failing cases</span>
            <ul className="mt-1 space-y-1 text-xs text-slate-600">
              {ev.failingCases.slice(0, 6).map((c: string, idx: number) => (
                <li key={idx} className="whitespace-pre-wrap">{c}</li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-indigo-600" />
            OOP Coding Lab
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
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
          onClick={() => fetchChallenge()}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-bold text-sm border border-slate-200"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          <span>New Task</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden min-h-0">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Generating a challenge...</p>
              </div>
            ) : challenge ? (
              renderChallenge()
            ) : null}
          </div>

          {evaluation && (
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300 ${
                (evaluation as any).isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {(evaluation as any).isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <span className={`font-bold text-sm ${(evaluation as any).isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {(evaluation as any).isCorrect ? 'Correct!' : 'Try Again'}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{(evaluation as any).feedback}</p>

              {(evaluation as any).improvements && (
                <div className="mt-2 pt-2 border-t border-slate-200/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tip</span>
                  <p className="text-xs text-slate-500 italic mt-1 whitespace-pre-wrap">{(evaluation as any).improvements}</p>
                </div>
              )}

              {renderEvaluationExtras()}
            </div>
          )}
        </div>

        <div className="w-full lg:w-2/3 flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-800">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedLang} Editor</div>
          </div>

          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            spellCheck={false}
            placeholder={`// Write your concise ${selectedLang} solution here...`}
            className="flex-1 bg-transparent text-emerald-400 font-mono text-sm p-6 focus:outline-none resize-none placeholder:text-slate-700"
          />

          <div className="p-4 bg-slate-800/50 flex justify-end border-t border-slate-800">
            <button
              onClick={handleSubmit}
              disabled={!userCode.trim() || isEvaluating || !challenge}
              className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Verify Solution</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePractice;


// import React, { useState, useEffect } from 'react';
// import { Language, CodeChallenge, CodeEvaluation, UserProgress } from '../types';
// import { geminiService } from '../services/geminiService';
// import { Terminal, RefreshCcw, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// const CodePractice: React.FC = () => {
//   const [selectedLang, setSelectedLang] = useState<Language>('C#');
//   const [challenge, setChallenge] = useState<CodeChallenge | null>(null);
//   const [userCode, setUserCode] = useState('');
//   const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isEvaluating, setIsEvaluating] = useState(false);

//   const fetchChallenge = async (lang: Language = selectedLang) => {
//     setIsLoading(true);
//     setEvaluation(null);
//     setUserCode('');
//     try {
//       const result = await geminiService.generateCodeChallenge(lang);
//       setChallenge({
//         id: Date.now().toString(),
//         language: lang,
//         ...result
//       });
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChallenge();
//   }, []);

//   const updateProgress = (isCorrect: boolean) => {
//     const saved = localStorage.getItem('user_oop_progress');
//     let current: UserProgress = saved ? JSON.parse(saved) : {
//       completedChallenges: 0,
//       correctSolutions: 0,
//       interviewResponses: 0,
//       lastActive: new Date().toLocaleDateString()
//     };

//     current.completedChallenges += 1;
//     if (isCorrect) current.correctSolutions += 1;
//     current.lastActive = new Date().toLocaleDateString();

//     localStorage.setItem('user_oop_progress', JSON.stringify(current));
//   };

//   const handleLangChange = (lang: Language) => {
//     setSelectedLang(lang);
//     fetchChallenge(lang);
//   };

//   const handleSubmit = async () => {
//     if (!challenge || !userCode.trim()) return;
//     setIsEvaluating(true);
//     try {
//       const result = await geminiService.evaluateCodeSolution(selectedLang, challenge.description, userCode);
//       setEvaluation(result);
//       updateProgress(result.isCorrect);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsEvaluating(false);
//     }
//   };

//   const languages: Language[] = ['C#', 'Java', 'Python', 'C++'];

//   return (
//     <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto">
//       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
//             <Terminal className="w-5 h-5 mr-2 text-indigo-600" />
//             OOP Coding Lab
//           </h2>
//           <div className="flex flex-wrap gap-2">
//             {languages.map(lang => (
//               <button
//                 key={lang}
//                 onClick={() => handleLangChange(lang)}
//                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
//                   selectedLang === lang
//                     ? 'bg-indigo-600 text-white shadow-md'
//                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                 }`}
//               >
//                 {lang}
//               </button>
//             ))}
//           </div>
//         </div>
        
//         <button 
//           onClick={() => fetchChallenge()}
//           disabled={isLoading}
//           className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-bold text-sm border border-slate-200"
//         >
//           {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
//           <span>New Task</span>
//         </button>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden min-h-0">
//         <div className="w-full lg:w-1/3 flex flex-col space-y-4">
//           <div className="bg-white border border-slate-200 rounded-xl p-6 flex-1 overflow-y-auto">
//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
//                 <Loader2 className="w-8 h-8 animate-spin" />
//                 <p className="text-sm font-medium">Generating a quick challenge...</p>
//               </div>
//             ) : challenge ? (
//               <>
//                 <h3 className="text-lg font-bold text-slate-800 mb-3">{challenge.title}</h3>
//                 <div className="prose prose-slate prose-sm text-slate-600">
//                   <p className="whitespace-pre-wrap leading-relaxed">{challenge.description}</p>
//                 </div>
//               </>
//             ) : null}
//           </div>
          
//           {evaluation && (
//             <div className={`p-4 rounded-xl border flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300 ${
//               evaluation.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
//             }`}>
//               <div className="flex items-center gap-2">
//                 {evaluation.isCorrect ? (
//                   <CheckCircle2 className="w-5 h-5 text-emerald-600" />
//                 ) : (
//                   <AlertCircle className="w-5 h-5 text-amber-600" />
//                 )}
//                 <span className={`font-bold text-sm ${evaluation.isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
//                   {evaluation.isCorrect ? 'Correct!' : 'Try Again'}
//                 </span>
//               </div>
//               <p className="text-sm text-slate-700 leading-relaxed">{evaluation.feedback}</p>
//               {evaluation.improvements && (
//                 <div className="mt-2 pt-2 border-t border-slate-200/50">
//                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tip</span>
//                   <p className="text-xs text-slate-500 italic mt-1">{evaluation.improvements}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="w-full lg:w-2/3 flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-800">
//           <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
//             <div className="flex space-x-1.5">
//               <div className="w-3 h-3 rounded-full bg-rose-500" />
//               <div className="w-3 h-3 rounded-full bg-amber-500" />
//               <div className="w-3 h-3 rounded-full bg-emerald-500" />
//             </div>
//             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedLang} Editor</div>
//           </div>
//           <textarea
//             value={userCode}
//             onChange={(e) => setUserCode(e.target.value)}
//             spellCheck={false}
//             placeholder={`// Write your concise ${selectedLang} solution here...`}
//             className="flex-1 bg-transparent text-emerald-400 font-mono text-sm p-6 focus:outline-none resize-none placeholder:text-slate-700"
//           />
//           <div className="p-4 bg-slate-800/50 flex justify-end border-t border-slate-800">
//             <button
//               onClick={handleSubmit}
//               disabled={!userCode.trim() || isEvaluating || !challenge}
//               className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50"
//             >
//               {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
//               <span>Verify Solution</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CodePractice;
