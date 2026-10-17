'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Brain,
  ListTodo,
  Calendar,
  Sparkles,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  ChevronRight,
  Clock,
  Target,
  ArrowRight,
  X,
  RefreshCw,
  Trophy,
  BookOpen,
  Award,
  BarChart3,
  Check,
  Shield,
  GraduationCap,
  Settings,
  Cpu,
  Key
} from 'lucide-react';

import { EXAM_PRESETS, MOTIVATIONAL_QUOTES } from '../lib/constants';
import FormattedMessage from '../components/FormattedMessage';
import {
  getProfile,
  saveProfile,
  getWeakTopics,
  saveWeakTopics,
  recordQuizResults,
  getTodos,
  saveTodos,
  getStreakTelemetry,
  saveStreakTelemetry,
  addStudyHours,
} from '../lib/storage';

export default function StudyStreakApp() {
  // Navigation: 'tutor' | 'planner' | 'streak' | 'landing'
  const [activeTab, setActiveTab] = useState('tutor');
  const [showLanding, setShowLanding] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Profile & Onboarding
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState('JEE');
  const [examDateInput, setExamDateInput] = useState('');
  const [customSubjects, setCustomSubjects] = useState([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  // Core 1: Tutor & Practice State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 Welcome to your BharatCode AI Tactical Tutor! Ask me any doubt or problem step-by-step, or hit **"Quiz Me"** to test yourself on 5 high-yield MCQs!`,
      time: 'Just now',
    },
  ]);
  const [doubtInput, setDoubtInput] = useState('');
  const [isDoubtLoading, setIsDoubtLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');

  // AI Engine & Custom Key Configuration
  const [showAiConfigModal, setShowAiConfigModal] = useState(false);
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState('auto');
  const [aiCustomUrl, setAiCustomUrl] = useState('');
  const [aiConfigStatus, setAiConfigStatus] = useState('');
  const [isTestingAiKey, setIsTestingAiKey] = useState(false);

  // Quiz Modal & Engine State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isOptionSubmitted, setIsOptionSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, wrong: 0 });
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Weak Topics
  const [weakTopics, setWeakTopics] = useState([]);

  // Core 2: Planner & To-Do State
  const [todos, setTodos] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('45m');
  const [newTaskPriority, setNewTaskPriority] = useState('high');
  const [isPlanningAi, setIsPlanningAi] = useState(false);
  const [plannerNotification, setPlannerNotification] = useState('');

  // Core 3: Streak & Telemetry State
  const [streakData, setStreakData] = useState(null);
  const [aiMotivationalQuote, setAiMotivationalQuote] = useState('');
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  // Chat scroll container
  const chatBottomRef = useRef(null);

  // Initialize data on mount
  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setSelectedExamId(p.examId || 'JEE');
    setExamDateInput(p.examDate || '');
    setCustomSubjects(p.subjects || []);
    setSelectedSubject(p.subjects?.[0] || 'Physics');

    // First visit prompt if not onboarded
    if (!p.hasCompletedOnboarding) {
      setShowLanding(true);
    }

    const wt = getWeakTopics(p.examId);
    setWeakTopics(wt);

    const td = getTodos();
    setTodos(td);

    const st = getStreakTelemetry();
    setStreakData(st);
    setAiMotivationalQuote(st?.aiMotivationalQuote || MOTIVATIONAL_QUOTES[0].quote);

    // Enforce 100% Tactical Dark ballistic theme
    document.documentElement.classList.add('dark');
    if (typeof window !== 'undefined') {
      localStorage.setItem('studystreak_theme', 'dark');
      const savedKey = localStorage.getItem('studystreak_ai_key') || '';
      const savedProv = localStorage.getItem('studystreak_ai_provider') || 'auto';
      const savedUrl = localStorage.getItem('studystreak_ai_url') || '';
      setAiApiKey(savedKey);
      setAiProvider(savedProv);
      setAiCustomUrl(savedUrl);
    }
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studystreak_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studystreak_theme', 'light');
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'tutor') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isDoubtLoading]);

  // Days remaining calculation
  const getDaysRemaining = () => {
    if (!profile?.examDate) return 45;
    const target = new Date(profile.examDate);
    const today = new Date();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Save Onboarding
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    const preset = EXAM_PRESETS.find((x) => x.id === selectedExamId) || EXAM_PRESETS[0];
    const updated = {
      ...profile,
      examId: preset.id,
      examName: preset.name,
      badge: preset.badge,
      subjects: customSubjects.length > 0 ? customSubjects : preset.defaultSubjects,
      examDate: examDateInput || profile.examDate,
      hasCompletedOnboarding: true,
    };
    setProfile(updated);
    saveProfile(updated);
    setSelectedSubject(updated.subjects[0] || 'Core');
    setShowOnboarding(false);
    setShowLanding(false);
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
  };

  // ----------------------------------------------------
  // CORE 1: TUTOR DOUBT SOLVING & QUIZ ENGINE
  // ----------------------------------------------------

  const handleSendDoubt = async (overridePrompt) => {
    const query = overridePrompt || doubtInput;
    if (!query.trim() || isDoubtLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setDoubtInput('');
    setIsDoubtLoading(true);

    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_key') : '';
      const savedProvider = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_provider') : '';
      const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_url') : '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedKey ? { 'x-api-key': savedKey } : {}),
          ...(savedProvider ? { 'x-api-provider': savedProvider } : {}),
          ...(savedUrl ? { 'x-api-url': savedUrl } : {}),
        },
        body: JSON.stringify({
          mode: 'doubt',
          prompt: query,
          examName: profile?.examName || 'JEE Advanced',
          subject: selectedSubject,
          daysRemaining: getDaysRemaining(),
          weakTopics,
          apiKey: savedKey,
          apiProvider: savedProvider,
          apiUrl: savedUrl,
        }),
      });

      const data = await res.json();
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.text || 'Unable to analyze step-by-step solution at this time. Please retry.',
        source: data.source || 'bharatcode-engine',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('Error fetching doubt answer', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: '⚡ Error contacting BharatCode API route. Please check your connectivity or environment settings.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsDoubtLoading(false);
    }
  };

  // Dynamic Subject-Aware Quick Prompt Suggestions
  const getDynamicSuggestions = (subject) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('physics') || s.includes('mechanic') || s.includes('optic') || s.includes('electro')) {
      return [
        { label: "⚡ Ohm's Law & Drude Model", prompt: "Explain Ohm's Law derivation from drift velocity with common examiner traps." },
        { label: "⚠️ Newton's Laws Traps", prompt: "Explain Newton's Laws of Motion, pseudo forces, and critical exam ambush points." },
        { label: "💡 Photoelectric Effect", prompt: "Derive Einstein's photoelectric equation and stopping potential relation." },
      ];
    }
    if (s.includes('chemistry') || s.includes('organic') || s.includes('inorganic')) {
      return [
        { label: "🧪 SN1 vs SN2 Mechanisms", prompt: "Compare SN1 vs SN2 mechanisms, stereochemistry, and carbocation rearrangement traps." },
        { label: "⚡ Le Chatelier Principle", prompt: "Explain Le Chatelier's principle with temperature and inert gas addition effects." },
        { label: "⚠️ Nernst Equation Traps", prompt: "Derive the Nernst equation for galvanic cells with standard electrode potential traps." },
      ];
    }
    if (s.includes('biology') || s.includes('physiol') || s.includes('genetics') || s.includes('cell')) {
      return [
        { label: "🫀 Cardiac Cycle & ECG", prompt: "Explain the human cardiac conduction system, SA node, and ECG wave correlation." },
        { label: "🧬 Mitosis vs Meiosis", prompt: "Explain the stages of Meiotic Prophase I with crossing over in pachytene." },
        { label: "⚡ DNA Replication Steps", prompt: "Explain semiconservative DNA replication machinery and Okazaki fragments." },
      ];
    }
    if (s.includes('polity') || s.includes('constitution') || s.includes('law')) {
      return [
        { label: "🏛️ Article 21 & Privacy", prompt: "Explain Article 21 evolution from Gopalan to Maneka Gandhi and Puttaswamy." },
        { label: "📜 5 Writs (Art 32 vs 226)", prompt: "Compare Article 32 and Article 226 writs with landmark Supreme Court rulings." },
        { label: "⚠️ Emergency Safeguards", prompt: "Explain 44th Amendment safeguards for National Emergency under Article 352." },
      ];
    }
    if (s.includes('economy') || s.includes('banking') || s.includes('finance')) {
      return [
        { label: "📈 Repo Rate vs Inflation", prompt: "Explain RBI monetary policy transmission: Repo Rate, CRR, and SLR." },
        { label: "🏦 CPI vs WPI Inflation", prompt: "What is the difference between CPI and WPI inflation in India?" },
        { label: "⚠️ Balance of Payments", prompt: "Explain Current Account Deficit (CAD) vs Capital Account in Balance of Payments." },
      ];
    }
    if (s.includes('math') || s.includes('algebra') || s.includes('calculus') || s.includes('quant') || s.includes('aptitude')) {
      return [
        { label: "🧮 Solve: 2x + 5 = 15", prompt: "Solve 2x + 5 = 15 step-by-step with sanity verification." },
        { label: "⏱️ Train Speed Shortcut", prompt: "Give me the speed shortcut formula for train crossing platform problems." },
        { label: "🎲 Bayes' Theorem Formula", prompt: "Explain Bayes' theorem for conditional probability with high-yield exam examples." },
      ];
    }
    return [
      { label: "⚡ Derivation & Traps", prompt: `Explain step-by-step derivation for ${subject || 'core'} high-yield formula with common mistakes to avoid.` },
      { label: "⚠️ Common Pitfalls", prompt: `What are the 3 most common mistakes aspirants make in ${subject || 'this subject'} questions?` },
      { label: "💡 Speed Shortcut", prompt: `Give me an exam-ready 30-second shortcut to eliminate options in ${subject || 'this subject'}.` },
    ];
  };

  // Launch Quiz
  const handleStartQuiz = async (targetTopic) => {
    const topicToUse = targetTopic || quizTopic.trim() || weakTopics[0]?.topic || selectedSubject;
    setQuizTopic(topicToUse);
    setIsQuizGenerating(true);
    setShowQuizModal(true);
    setQuizIndex(0);
    setSelectedOption(null);
    setIsOptionSubmitted(false);
    setQuizScore({ correct: 0, wrong: 0 });
    setIsQuizCompleted(false);

    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_key') : '';
      const savedProvider = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_provider') : '';
      const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_url') : '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedKey ? { 'x-api-key': savedKey } : {}),
          ...(savedProvider ? { 'x-api-provider': savedProvider } : {}),
          ...(savedUrl ? { 'x-api-url': savedUrl } : {}),
        },
        body: JSON.stringify({
          mode: 'quiz',
          topic: topicToUse,
          subject: selectedSubject,
          examName: profile?.examName || 'JEE Advanced',
          weakTopics,
          apiKey: savedKey,
          apiProvider: savedProvider,
          apiUrl: savedUrl,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setCurrentQuiz(data);
      } else {
        throw new Error('No questions returned');
      }
    } catch (err) {
      console.error('Failed to generate quiz', err);
      // Fallback questions guaranteed
      setCurrentQuiz({
        topic: topicToUse,
        questions: [
          {
            id: 1,
            question: `In ${topicToUse}, what is the critical condition for system conservation?`,
            options: [
              'Gradient vanishing along the boundary curve',
              'Internal entropy strictly increasing at zero Kelvin',
              'Isotropic reversible equilibrium without non-conservative dissipation',
              'Second derivative remaining strictly singular',
            ],
            correctIndex: 2,
            explanation: `Standard question in ${profile?.examName || 'exam'}: conservation requires no non-conservative dissipation under reversible equilibrium.`,
            trapWarning: `Watch out for option A which is only a local condition!`,
          },
        ],
      });
    } finally {
      setIsQuizGenerating(false);
    }
  };

  const handleSelectQuizOption = (optIndex) => {
    if (isOptionSubmitted) return;
    setSelectedOption(optIndex);
  };

  const handleSubmitQuizAnswer = () => {
    if (selectedOption === null || isOptionSubmitted) return;
    setIsOptionSubmitted(true);

    const currentQ = currentQuiz.questions[quizIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;

    const newScore = {
      correct: quizScore.correct + (isCorrect ? 1 : 0),
      wrong: quizScore.wrong + (isCorrect ? 0 : 1),
    };
    setQuizScore(newScore);

    if (isCorrect) {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < currentQuiz.questions.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsOptionSubmitted(false);
    } else {
      // Quiz complete!
      setIsQuizCompleted(true);
      recordQuizResults(
        currentQuiz.topic,
        selectedSubject,
        quizScore.correct,
        quizScore.wrong
      );
      setWeakTopics(getWeakTopics(profile?.examId));
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    }
  };

  // ----------------------------------------------------
  // CORE 2: PLANNER & TO-DO LIST
  // ----------------------------------------------------

  const handleToggleTodo = (id) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTodos(updated);
    saveTodos(updated);
  };

  const handleDeleteTodo = (id) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      subject: newTaskSubject || selectedSubject || 'General',
      priority: newTaskPriority,
      timeEstimate: newTaskTime || '45m',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...todos];
    setTodos(updated);
    saveTodos(updated);
    setNewTaskTitle('');
  };

  const handleAiPlanMyDay = async () => {
    setIsPlanningAi(true);
    setPlannerNotification('');

    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_key') : '';
      const savedProvider = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_provider') : '';
      const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('studystreak_ai_url') : '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedKey ? { 'x-api-key': savedKey } : {}),
          ...(savedProvider ? { 'x-api-provider': savedProvider } : {}),
          ...(savedUrl ? { 'x-api-url': savedUrl } : {}),
        },
        body: JSON.stringify({
          mode: 'planner',
          examName: profile?.examName || 'JEE Advanced',
          subject: selectedSubject,
          daysRemaining: getDaysRemaining(),
          weakTopics,
          apiKey: savedKey,
          apiProvider: savedProvider,
          apiUrl: savedUrl,
        }),
      });

      const data = await res.json();
      if (data.tasks && data.tasks.length > 0) {
        // Prepend AI tasks
        const updated = [...data.tasks, ...todos];
        setTodos(updated);
        saveTodos(updated);
        setPlannerNotification(`✨ AI generated ${data.tasks.length} tactical tasks focused on your weak areas!`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed to generate daily plan', err);
      setPlannerNotification('⚠️ Could not generate plan. Please try again.');
    } finally {
      setIsPlanningAi(false);
    }
  };

  // ----------------------------------------------------
  // CORE 3: STREAK & TELEMETRY
  // ----------------------------------------------------

  const handleQuickAddHours = (hrs) => {
    const updated = addStudyHours(hrs);
    setStreakData(updated);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleRefreshMotivation = async () => {
    setIsQuoteLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'motivation',
          examName: profile?.examName || 'Competitive Exam',
        }),
      });
      const data = await res.json();
      if (data.quote) {
        setAiMotivationalQuote(data.quote);
        if (streakData) {
          const updated = { ...streakData, aiMotivationalQuote: data.quote };
          setStreakData(updated);
          saveStreakTelemetry(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching motivational boost', err);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  // Calculate daily goal percentage
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const taskPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 50 : 25;
  const hoursPercent = streakData?.todayHours
    ? Math.min(50, (streakData.todayHours / (streakData.targetHours || 6)) * 50)
    : 25;
  const dailyGoalRingPercent = Math.min(100, Math.round(taskPercent + hoursPercent));

  // Current Exam preset
  const currentExamPreset =
    EXAM_PRESETS.find((e) => e.id === profile?.examId) || EXAM_PRESETS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f11] text-slate-100">
      {/* ---------------------------------------------------- */}
      {/* LANDING HERO OVERLAY (When on first visit or toggled) */}
      {/* ---------------------------------------------------- */}
      {showLanding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-lowest/95 backdrop-blur-2xl flex justify-center items-start p-4 sm:p-6 py-8 sm:py-16 text-slate-100 animate-in fade-in duration-300">
          <div className="max-w-2xl w-full text-center my-auto py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-glow/10 border border-brand-glow/30 text-brand-glow font-mono text-xs tracking-wider uppercase mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-glow" />
              <span>BharatCode AI Tactical Study Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading mb-4 leading-tight">
              Study<span className="text-brand-glow drop-shadow-[0_0_15px_rgba(0,255,102,0.6)]">Streak</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl max-w-xl mx-auto leading-relaxed mb-8">
              The high-velocity AI study companion engineered for aspirants of <span className="text-white font-semibold">JEE, NEET, UPSC, GATE, CAT, SSC & Banking</span>. 
              Zero login, 100% offline-ready in browser storage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-10 text-left">
              <div className="p-4 rounded-xl bg-surface-low border border-slate-800 flex flex-col gap-2">
                <Brain className="w-6 h-6 text-brand-glow" />
                <h3 className="font-heading font-semibold text-sm text-white">Socratic AI Tutor</h3>
                <p className="text-xs text-slate-400">Step-by-step doubt clearing + 5-MCQ precision drills on weak topics.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-low border border-slate-800 flex flex-col gap-2">
                <ListTodo className="w-6 h-6 text-accent-cyan" />
                <h3 className="font-heading font-semibold text-sm text-white">AI Day Planner</h3>
                <p className="text-xs text-slate-400">Generates today&apos;s timetable aligned with exam countdown and weak areas.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-low border border-slate-800 flex flex-col gap-2">
                <Flame className="w-6 h-6 text-accent-amber" />
                <h3 className="font-heading font-semibold text-sm text-white">Streak & Analytics</h3>
                <p className="text-xs text-slate-400">Weekly study graph, daily goal rings, and BharatCode motivational boosts.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowOnboarding(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-glow text-black font-heading font-bold text-base tracking-wide uppercase shadow-[0_0_25px_rgba(0,255,102,0.5)] hover:shadow-[0_0_35px_rgba(0,255,102,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 tap-target"
              >
                <span>Start Learning Now</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              {profile?.hasCompletedOnboarding && (
                <button
                  onClick={() => setShowLanding(false)}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-surface-high border border-slate-700 text-slate-200 font-heading font-medium text-sm hover:bg-surface-container transition-all tap-target"
                >
                  Resume Current Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ONBOARDING MODAL: PICK EXAM, SUBJECTS & EXAM DATE   */}
      {/* ---------------------------------------------------- */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 py-8 sm:py-14 flex justify-center items-start animate-in fade-in duration-200">
          <div className="max-w-xl w-full my-auto bg-surface-low border border-slate-700 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-high transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-brand-glow font-mono text-xs uppercase tracking-wider mb-2">
              <Target className="w-4 h-4" />
              <span>Target Exam Calibration</span>
            </div>
            <h2 className="text-2xl font-bold font-heading mb-1">Select Your Competitive Exam</h2>
            <p className="text-sm text-slate-400 mb-6">
              StudyStreak will calibrate questions, doubt explanations, and daily study schedules to your specific syllabus.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Exam Selection Pills */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                  1. Choose Your Target Exam
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXAM_PRESETS.map((preset) => {
                    const isSelected = selectedExamId === preset.id;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => {
                          setSelectedExamId(preset.id);
                          setCustomSubjects(preset.defaultSubjects);
                          setSelectedSubject(preset.defaultSubjects[0]);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand-glow/10 border-brand-glow text-white shadow-[0_0_15px_rgba(0,255,102,0.2)]'
                            : 'bg-surface-container border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-heading font-bold text-sm">{preset.badge}</span>
                        <span className="text-[11px] text-slate-400 truncate mt-1">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exam Date Picker */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                  2. Target Exam Date (For Countdown & Daily Sortie Planning)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={examDateInput}
                    onChange={(e) => setExamDateInput(e.target.value)}
                    className="w-full bg-surface-container border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-glow"
                  />
                </div>
              </div>

              {/* Subjects customizer */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                  3. Key Subjects
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {customSubjects.map((subj, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-surface-container border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5"
                    >
                      <span>{subj}</span>
                      <button
                        type="button"
                        onClick={() => setCustomSubjects(customSubjects.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add subject (e.g. Modern Physics, Reasoning)..."
                    value={newSubjectInput}
                    onChange={(e) => setNewSubjectInput(e.target.value)}
                    className="flex-1 bg-surface-container border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-glow"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubjectInput.trim()) {
                        setCustomSubjects([...customSubjects, newSubjectInput.trim()]);
                        setNewSubjectInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-high border border-slate-600 text-sm font-medium hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-glow text-black font-heading font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-brand-glow/40 transition-all flex items-center justify-center gap-2 tap-target"
                >
                  <Check className="w-5 h-5" />
                  <span>Lock In Target & Enter Cockpit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5-MCQ INTERACTIVE QUIZ MODAL                         */}
      {/* ---------------------------------------------------- */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-6 py-8 sm:py-14 flex justify-center items-start animate-in zoom-in-95 duration-200">
          <div className="max-w-2xl w-full bg-surface-low border border-slate-700 rounded-2xl p-5 sm:p-7 text-slate-100 shadow-2xl relative my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-glow/10 text-brand-glow">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-brand-glow uppercase tracking-wider">
                      5-MCQ Precision Drill
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-mono text-slate-400">
                      {profile?.badge || 'EXAM'}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    {quizTopic || 'Weak Topic Test'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-high transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quiz Body */}
            {isQuizGenerating ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-brand-glow/20 border-t-brand-glow animate-spin mb-4" />
                <h4 className="font-heading font-bold text-lg text-white mb-1">
                  BharatCode AI Generating Precision MCQs...
                </h4>
                <p className="text-xs font-mono text-slate-400 max-w-sm">
                  Analyzing past examination trends and formulating distractors for {quizTopic}.
                </p>
              </div>
            ) : isQuizCompleted ? (
              /* Quiz Summary Screen */
              <div className="py-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-brand-glow/10 text-brand-glow mb-4">
                  <Trophy className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2">Quiz Drill Completed!</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                  Telemetry updated in your browser storage. Your accuracy has been recalibrated on the Weak Topics Radar.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                  <div className="p-4 rounded-xl bg-surface-container border border-slate-800 text-center">
                    <span className="text-xs font-mono text-slate-400 uppercase">Score</span>
                    <div className="text-3xl font-heading font-bold text-brand-glow mt-1">
                      {quizScore.correct} / {currentQuiz?.questions?.length || 5}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container border border-slate-800 text-center">
                    <span className="text-xs font-mono text-slate-400 uppercase">Accuracy</span>
                    <div className="text-3xl font-heading font-bold text-accent-cyan mt-1">
                      {Math.round(
                        (quizScore.correct / (currentQuiz?.questions?.length || 5)) * 100
                      )}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => handleStartQuiz(quizTopic)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-glow text-black font-heading font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 tap-target"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retest This Topic</span>
                  </button>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-high border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-700 tap-target"
                  >
                    Back to Cockpit
                  </button>
                </div>
              </div>
            ) : currentQuiz?.questions?.[quizIndex] ? (
              /* Active Question View */
              <div>
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>
                    QUESTION {quizIndex + 1} OF {currentQuiz.questions.length}
                  </span>
                  <span>
                    SCORE: <strong className="text-brand-glow">{quizScore.correct}</strong> / {quizIndex}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-brand-glow transition-all duration-300"
                    style={{
                      width: `${((quizIndex + 1) / currentQuiz.questions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question Statement */}
                <div className="p-4 rounded-xl bg-surface-container border border-slate-800 mb-5">
                  <p className="font-heading text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {currentQuiz.questions[quizIndex].question}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-3 mb-6">
                  {currentQuiz.questions[quizIndex].options.map((optText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrectAnswer =
                      isOptionSubmitted &&
                      optIdx === currentQuiz.questions[quizIndex].correctIndex;
                    const isWrongSelection =
                      isOptionSubmitted && isSelected && !isCorrectAnswer;

                    let btnStyle =
                      'bg-surface-container border-slate-800 text-slate-200 hover:border-slate-700';
                    if (isSelected && !isOptionSubmitted) {
                      btnStyle = 'bg-brand-glow/10 border-brand-glow text-white';
                    }
                    if (isCorrectAnswer) {
                      btnStyle =
                        'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                    }
                    if (isWrongSelection) {
                      btnStyle =
                        'bg-rose-950/40 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectQuizOption(optIdx)}
                        disabled={isOptionSubmitted}
                        className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start gap-3 tap-target ${btnStyle}`}
                      >
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-snug">{optText}</span>
                        {isCorrectAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {isWrongSelection && (
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* AI Explanation Accordion / Callout after submitting */}
                {isOptionSubmitted && (
                  <div className="p-4 rounded-xl bg-surface-high border border-slate-700 space-y-3 mb-6 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-glow font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>BharatCode AI Pedagogical Breakdown</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {currentQuiz.questions[quizIndex].explanation}
                    </p>

                    {currentQuiz.questions[quizIndex].trapWarning && (
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Tactical Ambush Warning: </strong>
                          {currentQuiz.questions[quizIndex].trapWarning}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  {!isOptionSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={handleSubmitQuizAnswer}
                      className="px-6 py-3 rounded-xl bg-brand-glow text-black font-heading font-bold text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-brand-glow/40 transition-all tap-target"
                    >
                      Verify Answer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="px-6 py-3 rounded-xl bg-brand-glow text-black font-heading font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-brand-glow/40 transition-all tap-target"
                    >
                      <span>
                        {quizIndex + 1 < currentQuiz.questions.length
                          ? 'Next Question'
                          : 'View Scorecard'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* AI MODEL CONFIGURATION & KEY SETTINGS MODAL          */}
      {/* ---------------------------------------------------- */}
      {showAiConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 py-8 sm:py-14 flex justify-center items-start animate-in zoom-in-95 duration-200">
          <div className="max-w-lg w-full bg-surface-low border border-slate-700 rounded-2xl p-6 sm:p-7 text-slate-100 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-glow/10 text-brand-glow">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    AI Engine & Model Configuration
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    BharatCode Protocol // Offline & Live LLM Router
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiConfigModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-high transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-surface-container border border-slate-800 text-xs leading-relaxed text-slate-300">
                <p className="font-medium text-white mb-1">🛡️ StudyStreak Built-in Tactical Engine:</p>
                Zero-setup, instant, offline-ready pedagogical solver for 60+ competitive exam topics with step-by-step math derivations and examiner trap warnings. Works 100% out-of-the-box!
              </div>

              {/* Provider Selection */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 uppercase tracking-wide">
                  AI Model Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiProvider('auto')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      aiProvider === 'auto'
                        ? 'border-brand-glow bg-brand-glow/10 text-brand-glow'
                        : 'border-slate-800 bg-surface-container text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-white">⚡ Auto / Built-in</span>
                    <span>Offline Tactical Engine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('groq')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      aiProvider === 'groq'
                        ? 'border-brand-glow bg-brand-glow/10 text-brand-glow'
                        : 'border-slate-800 bg-surface-container text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-white">🚀 Groq (Free / Fast)</span>
                    <span>Llama 3.1 8B Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      aiProvider === 'gemini'
                        ? 'border-brand-glow bg-brand-glow/10 text-brand-glow'
                        : 'border-slate-800 bg-surface-container text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-white">✨ Google Gemini</span>
                    <span>Gemini 1.5 Flash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('openai')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      aiProvider === 'openai'
                        ? 'border-brand-glow bg-brand-glow/10 text-brand-glow'
                        : 'border-slate-800 bg-surface-container text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-white">🌐 BharatCode / Custom</span>
                    <span>Custom API Key / Proxy</span>
                  </button>
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wide">
                    Custom API Key (Optional)
                  </label>
                  {aiApiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiApiKey('');
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('studystreak_ai_key');
                        }
                        setAiConfigStatus('API Key cleared. Using built-in tactical engine.');
                      }}
                      className="text-[11px] font-mono text-rose-400 hover:underline"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder={
                    aiProvider === 'groq'
                      ? 'gsk_...'
                      : aiProvider === 'gemini'
                      ? 'AIzaSy...'
                      : 'sk-... or BharatCode API Key'
                  }
                  className="w-full bg-surface-container border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-glow"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Stored securely in browser localStorage only. Never exposed publicly.
                </p>
              </div>

              {/* Custom API URL (Optional) */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 uppercase tracking-wide">
                  Custom API URL / Endpoint (Optional)
                </label>
                <input
                  type="text"
                  value={aiCustomUrl}
                  onChange={(e) => setAiCustomUrl(e.target.value)}
                  placeholder="https://api.bharatcode.ai/v1/chat/completions"
                  className="w-full bg-surface-container border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-glow"
                />
              </div>

              {aiConfigStatus && (
                <div className="p-3 rounded-xl bg-surface-lowest border border-slate-800 text-xs font-mono text-brand-glow flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{aiConfigStatus}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isTestingAiKey}
                  onClick={async () => {
                    setIsTestingAiKey(true);
                    setAiConfigStatus('');
                    try {
                      const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          mode: 'doubt',
                          prompt: "Test query: What is Ohm's law?",
                          examName: profile?.examName || 'JEE Advanced',
                          subject: selectedSubject || 'Physics',
                          apiKey: aiApiKey,
                          apiProvider: aiProvider,
                          apiUrl: aiCustomUrl,
                        }),
                      });
                      const data = await res.json();
                      if (data.text) {
                        setAiConfigStatus(`✅ Connection Verified! Source: ${data.source || 'Engine'}`);
                      } else {
                        setAiConfigStatus('⚠️ Connected with fallback.');
                      }
                    } catch (e) {
                      setAiConfigStatus('❌ Test failed: ' + e.message);
                    } finally {
                      setIsTestingAiKey(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-surface-high border border-slate-700 text-xs font-mono text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  {isTestingAiKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-brand-glow" />}
                  <span>Test Connection</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      if (aiApiKey) {
                        localStorage.setItem('studystreak_ai_key', aiApiKey);
                      } else {
                        localStorage.removeItem('studystreak_ai_key');
                      }
                      localStorage.setItem('studystreak_ai_provider', aiProvider);
                      if (aiCustomUrl) {
                        localStorage.setItem('studystreak_ai_url', aiCustomUrl);
                      } else {
                        localStorage.removeItem('studystreak_ai_url');
                      }
                    }
                    setAiConfigStatus('Settings saved to browser storage!');
                    setTimeout(() => setShowAiConfigModal(false), 700);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-brand-glow text-black font-heading font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_20px_rgba(0,255,102,0.5)] transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TOP HEADER                                           */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b0f11]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLanding(true)}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-glow/10 border border-brand-glow/40 flex items-center justify-center text-brand-glow shadow-[0_0_12px_rgba(0,255,102,0.3)] group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 fill-brand-glow" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base tracking-tight leading-none flex items-center gap-1.5 text-white">
                  Study<span className="text-brand-glow">Streak</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-glow/10 text-brand-glow border border-brand-glow/30">
                    AI
                  </span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                  BHARATCODE POWERED
                </span>
              </div>
            </button>
          </div>

          {/* Central Target & Countdown Badge */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-3 py-1.5 rounded-lg bg-surface-low border border-slate-700 hover:border-brand-glow text-xs font-mono flex items-center gap-2 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-brand-glow animate-ping" />
              <span className="text-slate-300 uppercase">TARGET:</span>
              <strong className="text-white">{profile?.badge || 'JEE ADV'}</strong>
              <span className="text-slate-500">|</span>
              <span className="text-accent-cyan">T-MINUS {getDaysRemaining()}D</span>
            </button>
          </div>

          {/* Right Controls: Target Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnboarding(true)}
              className="md:hidden px-2.5 py-1.5 rounded-lg bg-surface-low border border-slate-700 text-xs font-mono text-brand-glow flex items-center gap-1"
            >
              <span>{profile?.badge || 'EXAM'}</span>
              <span className="text-slate-400 text-[10px]">{getDaysRemaining()}d</span>
            </button>

            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-high border border-slate-700 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-brand-glow" />
              <span>Change Exam</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN LAYOUT: DESKTOP SIDEBAR + CONTENT AREA          */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar (Command Matrix) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 p-4 shrink-0 bg-surface-lowest sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="mb-6">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
              COMMAND MATRIX
            </span>
            <div className="p-3 rounded-xl bg-surface-low border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">DEFCON STATUS</span>
                <span className="text-brand-glow font-bold">ARMED</span>
              </div>
              <div className="text-sm font-heading font-semibold text-white">
                {profile?.examName || 'JEE Main & Advanced'}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-brand-glow h-full"
                  style={{ width: `${Math.max(15, 100 - getDaysRemaining())}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                T-minus {getDaysRemaining()} days to exam
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('tutor')}
              className={`w-full p-3 rounded-xl text-left text-sm font-heading font-semibold flex items-center justify-between transition-all ${
                activeTab === 'tutor'
                  ? 'bg-brand-glow text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'text-slate-300 hover:bg-surface-low hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Brain className="w-4 h-4" />
                <span>Tutor & Practice</span>
              </div>
              <span className={`text-[10px] font-mono ${activeTab === 'tutor' ? 'text-black' : 'text-slate-500'}`}>
                01
              </span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`w-full p-3 rounded-xl text-left text-sm font-heading font-semibold flex items-center justify-between transition-all ${
                activeTab === 'planner'
                  ? 'bg-brand-glow text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'text-slate-300 hover:bg-surface-low hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ListTodo className="w-4 h-4" />
                <span>Daily Planner</span>
              </div>
              <span className={`text-[10px] font-mono ${activeTab === 'planner' ? 'text-black' : 'text-slate-500'}`}>
                02
              </span>
            </button>

            <button
              onClick={() => setActiveTab('streak')}
              className={`w-full p-3 rounded-xl text-left text-sm font-heading font-semibold flex items-center justify-between transition-all ${
                activeTab === 'streak'
                  ? 'bg-brand-glow text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'text-slate-300 hover:bg-surface-low hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4" />
                <span>Streak & Hours</span>
              </div>
              <span className={`text-[10px] font-mono ${activeTab === 'streak' ? 'text-black' : 'text-slate-500'}`}>
                03
              </span>
            </button>
          </nav>

          {/* Quick Stats Widget in Desktop Sidebar */}
          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-surface-low border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>STREAK LOCK</span>
                <span className="text-brand-glow font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-brand-glow" />
                  {streakData?.currentStreak || 7} DAYS
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>HOURS TODAY</span>
                <span className="text-accent-cyan font-bold">{streakData?.todayHours || 3.5}h / 6h</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Core Content Area */}
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-8 overflow-y-auto">
          {/* ==================================================== */}
          {/* TAB 1: TUTOR & PRACTICE                              */}
          {/* ==================================================== */}
          {activeTab === 'tutor' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner & Subject Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-low p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-brand-glow/10 text-brand-glow font-mono text-xs uppercase font-semibold">
                      Socratic AI Engine
                    </span>
                    <span className="text-xs text-slate-400">
                      Tailored to {profile?.examName || 'Competitive Exam'}
                    </span>
                  </div>
                  <h2 className="text-xl font-heading font-bold text-white">
                    Tutor & Practice Arena
                  </h2>
                </div>

                {/* Quick Subject Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {profile?.subjects?.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                        selectedSubject === sub
                          ? 'bg-brand-glow text-black font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                          : 'bg-surface-container text-slate-400 hover:text-white'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Left = Chat for Doubts; Right = Weak Topics Radar & Quiz Me */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Doubt Clearing Chat (7 cols) */}
                <div className="lg:col-span-7 flex flex-col bg-surface-low rounded-2xl border border-slate-800 overflow-hidden shadow-lg h-[620px]">
                  {/* Chat Header */}
                  <div className="p-3.5 bg-surface-container border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-brand-glow" />
                      <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wide">
                        Ask Any Doubt // {selectedSubject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAiConfigModal(true)}
                        className={`text-xs font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                          aiApiKey
                            ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/50'
                            : 'bg-surface-low border-slate-700 text-slate-300 hover:text-brand-glow hover:border-brand-glow/40'
                        }`}
                        title="Configure External AI Model or API Key"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{aiApiKey ? 'Custom AI Active' : 'AI Engine'}</span>
                      </button>
                      <button
                        onClick={() =>
                          setChatMessages([
                            {
                              id: 'welcome',
                              sender: 'ai',
                              text: `Chat cleared. Ask me any doubt or problem in ${selectedSubject}!`,
                              time: 'Just now',
                            },
                          ])
                        }
                        className="text-xs font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1 px-1.5 py-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.map((msg) => {
                      const isAi = msg.sender === 'ai';
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                        >
                          {isAi && (
                            <div className="w-7 h-7 rounded-lg bg-brand-glow/10 border border-brand-glow/30 flex items-center justify-center text-brand-glow shrink-0 mt-0.5">
                              <Brain className="w-4 h-4" />
                            </div>
                          )}

                          <div
                            className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                              isAi
                                ? 'bg-surface-container border border-slate-800 text-slate-200'
                                : 'bg-brand-glow text-black font-medium shadow-md'
                            }`}
                          >
                            {isAi ? (
                              <FormattedMessage text={msg.text} />
                            ) : (
                              <div className="whitespace-pre-wrap">{msg.text}</div>
                            )}
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/40 text-[10px] font-mono">
                              <span className={isAi ? 'text-slate-500' : 'text-slate-800'}>
                                {msg.time}
                              </span>
                              {isAi && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-lowest text-cyan-400 border border-slate-800">
                                  {msg.source === 'ai-external' ? '⚡ Live LLM' : '🛡️ BharatCode Engine'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isDoubtLoading && (
                      <div className="flex gap-3 justify-start items-center">
                        <div className="w-7 h-7 rounded-lg bg-brand-glow/10 border border-brand-glow/30 flex items-center justify-center text-brand-glow shrink-0">
                          <Brain className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-container border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-400">
                          <div className="w-2 h-2 rounded-full bg-brand-glow animate-ping" />
                          <span>BharatCode AI analyzing derivation & tactical traps...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Fast Prompt Suggestions */}
                  <div className="px-4 py-2 bg-surface-lowest border-t border-slate-800 flex gap-2 overflow-x-auto text-xs scrollbar-none">
                    {getDynamicSuggestions(selectedSubject).map((sugg, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendDoubt(sugg.prompt)}
                        className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-high text-slate-300 hover:text-white whitespace-nowrap text-[11px] font-mono border border-slate-800 transition-colors"
                      >
                        {sugg.label}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendDoubt();
                    }}
                    className="p-3 bg-surface-container border-t border-slate-800 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Ask doubt in ${selectedSubject} (e.g. "Derivation of moment of inertia...")`}
                      value={doubtInput}
                      onChange={(e) => setDoubtInput(e.target.value)}
                      className="flex-1 bg-surface-low border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-glow"
                    />
                    <button
                      type="submit"
                      disabled={!doubtInput.trim() || isDoubtLoading}
                      className="p-3 rounded-xl bg-brand-glow text-black disabled:opacity-40 hover:shadow-brand-glow/40 transition-all tap-target flex items-center justify-center shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Right: "Quiz Me" Command Card + Weak Topics Radar (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* "Quiz Me" Launch Card */}
                  <div className="p-5 rounded-2xl bg-surface-low border border-slate-800 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-glow/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-2 text-xs font-mono text-brand-glow uppercase tracking-wider mb-2">
                      <Zap className="w-4 h-4" />
                      <span>Precision Practice Protocol</span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-white mb-1">
                      5-MCQ Precision Air-Strike
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Create 5 tailored MCQs to test concept depth. The AI will immediately explain wrong answers with tactical traps.
                    </p>

                    <div className="space-y-3 mb-4">
                      <input
                        type="text"
                        placeholder="Enter topic (e.g. Rotational Dynamics)..."
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                        className="w-full bg-surface-container border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-glow"
                      />

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartQuiz()}
                          className="flex-1 py-3 px-4 rounded-xl bg-brand-glow text-black font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-brand-glow/40 transition-all flex items-center justify-center gap-2 tap-target"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Generate Quiz</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const topWeak = weakTopics[0]?.topic || 'High-Yield PYQs';
                            handleStartQuiz(topWeak);
                          }}
                          className="py-3 px-4 rounded-xl bg-surface-high border border-slate-700 text-xs font-heading font-semibold text-accent-cyan hover:bg-surface-container transition-all flex items-center justify-center gap-1.5 tap-target"
                        >
                          <Target className="w-4 h-4" />
                          <span>Target Weak Area</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Weak Topics Card */}
                  <div className="p-5 rounded-2xl bg-surface-low border border-slate-800 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-accent-amber" />
                        <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                          Weak Topics Radar
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        AUTO-CALIBRATED
                      </span>
                    </div>

                    <div className="space-y-3">
                      {weakTopics.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">
                          No weak topics logged yet. Take your first quiz above to calibrate!
                        </p>
                      ) : (
                        weakTopics.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-surface-container border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-semibold text-xs text-slate-200 truncate">
                                  {item.topic}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {item.subject}
                                </span>
                              </div>

                              {/* Accuracy progress bar */}
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      item.accuracy >= 70
                                        ? 'bg-emerald-400'
                                        : item.accuracy >= 45
                                        ? 'bg-amber-400'
                                        : 'bg-rose-400'
                                    }`}
                                    style={{ width: `${item.accuracy}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                  {item.accuracy}% acc ({item.wrong} blunders)
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartQuiz(item.topic)}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-high border border-slate-700 text-[11px] font-mono text-brand-glow hover:bg-slate-700 shrink-0"
                            >
                              Retest
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PLANNER & TO-DO                               */}
          {/* ==================================================== */}
          {activeTab === 'planner' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-low p-5 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan font-mono text-xs uppercase font-semibold">
                      Sortie Scheduler
                    </span>
                    <span className="text-xs text-slate-400">
                      T-Minus {getDaysRemaining()} Days to {profile?.badge || 'Exam'}
                    </span>
                  </div>
                  <h2 className="text-xl font-heading font-bold text-white">
                    Daily Tactical Planner & To-Do
                  </h2>
                </div>

                {/* AI Plan My Day Button */}
                <button
                  onClick={handleAiPlanMyDay}
                  disabled={isPlanningAi}
                  className="px-5 py-3 rounded-xl bg-brand-glow text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-brand-glow/40 transition-all flex items-center justify-center gap-2 tap-target disabled:opacity-50 shrink-0"
                >
                  {isPlanningAi ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI Plan My Day</span>
                    </>
                  )}
                </button>
              </div>

              {/* Notification Banner if AI generated tasks */}
              {plannerNotification && (
                <div className="p-3.5 rounded-xl bg-brand-glow/10 border border-brand-glow/30 text-brand-glow text-xs font-mono flex items-center justify-between">
                  <span>{plannerNotification}</span>
                  <button
                    onClick={() => setPlannerNotification('')}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Progress Bar for Today's Tasks */}
              <div className="p-4 rounded-2xl bg-surface-low border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-brand-glow/10 text-brand-glow flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-400 uppercase">
                      Today&apos;s Execution Velocity
                    </div>
                    <div className="font-heading font-bold text-base text-white">
                      {completedTasks} of {totalTasks} Tasks Completed (
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-glow h-full transition-all duration-300"
                    style={{
                      width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Add New Task Form */}
              <form
                onSubmit={handleAddTodo}
                className="p-4 rounded-2xl bg-surface-low border border-slate-800 flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  placeholder="Add a study task (e.g. Solve 20 PYQs on Rotational Motion)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-surface-container border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-glow"
                />

                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="bg-surface-container border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none"
                >
                  <option value="">Subject</option>
                  {profile?.subjects?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="bg-surface-container border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="med">Medium</option>
                  <option value="low">Low</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-brand-glow text-black font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 tap-target shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* To-Do List */}
              <div className="space-y-2.5">
                {todos.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks planned yet. Hit &quot;AI Plan My Day&quot; above!</p>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        todo.completed
                          ? 'bg-surface-container/50 border-slate-800/50 opacity-60'
                          : 'bg-surface-low border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTodo(todo.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                            todo.completed
                              ? 'bg-brand-glow border-brand-glow text-black'
                              : 'border-slate-600 hover:border-brand-glow'
                          }`}
                        >
                          {todo.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              todo.completed ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {todo.title}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            {todo.subject && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-slate-400">
                                {todo.subject}
                              </span>
                            )}
                            {todo.timeEstimate && (
                              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {todo.timeEstimate}
                              </span>
                            )}
                            {todo.priority === 'high' && (
                              <span className="text-[10px] font-mono text-rose-400">
                                High Priority
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: STREAK & TELEMETRY                            */}
          {/* ==================================================== */}
          {activeTab === 'streak' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
              {/* Top Banner: Big Fire Streak Counter */}
              <div className="p-6 rounded-2xl bg-surface-low border border-slate-800 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-brand-glow flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,255,102,0.4)] animate-bounce duration-1000">
                      <Flame className="w-12 h-12 fill-black" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-brand-glow uppercase tracking-wider mb-1">
                      <span className="w-2 h-2 rounded-full bg-brand-glow animate-ping" />
                      <span>DEFCON 1 CONSISTENCY PROTOCOL</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                      {streakData?.currentStreak || 7}-Day Streak
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Personal best: <strong className="text-white">{streakData?.longestStreak || 19} days</strong>. You are outworking 95% of competitors today!
                    </p>
                  </div>
                </div>

                {/* Quick Add Study Hours */}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <span className="text-[11px] font-mono text-slate-400 text-center sm:text-right">
                    Log Completed Focus:
                  </span>
                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <button
                      onClick={() => handleQuickAddHours(0.5)}
                      className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-high border border-slate-700 text-xs font-mono text-slate-200 tap-target"
                    >
                      +30m
                    </button>
                    <button
                      onClick={() => handleQuickAddHours(1.0)}
                      className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-high border border-slate-700 text-xs font-mono text-brand-glow font-bold tap-target"
                    >
                      +1 hr
                    </button>
                    <button
                      onClick={() => handleQuickAddHours(2.0)}
                      className="px-3 py-2 rounded-xl bg-brand-glow text-black font-heading font-bold text-xs uppercase tracking-wider tap-target shadow-md"
                    >
                      +2 hrs
                    </button>
                  </div>
                </div>
              </div>

              {/* 2-Column: Daily Goal Progress Ring + Weekly Bar Chart */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Daily Goal Ring (5 cols) */}
                <div className="md:col-span-5 p-6 rounded-2xl bg-surface-low border border-slate-800 flex flex-col items-center justify-center text-center shadow-lg">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">
                    Daily Goal Progress Ring
                  </span>

                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Animated Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-brand-glow transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={
                          2 * Math.PI * 40 * (1 - dailyGoalRingPercent / 100)
                        }
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-heading font-extrabold text-white">
                        {dailyGoalRingPercent}%
                      </span>
                      <span className="text-[10px] font-mono text-brand-glow uppercase">
                        COMPLETED
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-4">
                    <span>
                      Hours: <strong className="text-white">{streakData?.todayHours || 0}h</strong> / {streakData?.targetHours || 6}h
                    </span>
                    <span>•</span>
                    <span>
                      Tasks: <strong className="text-white">{completedTasks}</strong> / {totalTasks}
                    </span>
                  </div>
                </div>

                {/* Weekly Study-Hours Bar Chart (7 cols) */}
                <div className="md:col-span-7 p-6 rounded-2xl bg-surface-low border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">
                        Weekly Study Hours Telemetry
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Target: 6.0 hrs/day
                      </p>
                    </div>
                    <span className="text-xs font-mono text-accent-cyan">
                      TOTAL: {streakData?.weeklyHours?.reduce((acc, d) => acc + d.hours, 0).toFixed(1)} hrs
                    </span>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="flex items-end justify-between gap-2 h-44 pt-4 pb-2 border-b border-slate-800">
                    {streakData?.weeklyHours?.map((dayItem, idx) => {
                      const maxTarget = 8;
                      const heightPercent = Math.min(
                        100,
                        Math.round((dayItem.hours / maxTarget) * 100)
                      );
                      const isToday = idx === (streakData.weeklyHours.length - 1);

                      return (
                        <div key={dayItem.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[10px] font-mono text-slate-400">
                            {dayItem.hours}h
                          </span>
                          <div className="w-full max-w-[28px] bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                            <div
                              className={`w-full transition-all duration-500 rounded-t-lg ${
                                isToday
                                  ? 'bg-brand-glow shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                                  : dayItem.hours >= dayItem.target
                                  ? 'bg-accent-cyan'
                                  : 'bg-slate-600'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-mono ${
                              isToday ? 'text-brand-glow font-bold' : 'text-slate-400'
                            }`}
                          >
                            {dayItem.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI Daily Motivational Message Card */}
              <div className="p-5 rounded-2xl bg-surface-low border border-slate-800 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                      BHARATCODE AI MOTIVATIONAL INTEL
                    </span>
                    <p className="text-sm sm:text-base font-heading font-medium text-slate-200 italic">
                      &quot;{aiMotivationalQuote}&quot;
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRefreshMotivation}
                  disabled={isQuoteLoading}
                  className="px-4 py-2 rounded-xl bg-surface-high border border-slate-700 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 shrink-0 tap-target"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isQuoteLoading ? 'animate-spin' : ''}`} />
                  <span>Get AI Boost</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Large Tap Targets)     */}
      {/* ---------------------------------------------------- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-[#0b0f11]/95 backdrop-blur-xl pb-safe">
        <div className="grid grid-cols-3 h-16 items-center px-2">
          {/* Tab 1: Tutor & Practice */}
          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex flex-col items-center justify-center h-full tap-target transition-all ${
              activeTab === 'tutor'
                ? 'text-brand-glow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-heading font-medium">Tutor</span>
          </button>

          {/* Tab 2: Planner */}
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col items-center justify-center h-full tap-target transition-all ${
              activeTab === 'planner'
                ? 'text-brand-glow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-heading font-medium">Planner</span>
          </button>

          {/* Tab 3: Streak */}
          <button
            onClick={() => setActiveTab('streak')}
            className={`flex flex-col items-center justify-center h-full tap-target transition-all ${
              activeTab === 'streak'
                ? 'text-brand-glow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-heading font-medium">Streak</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
