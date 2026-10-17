import { EXAM_PRESETS } from './constants';

const STORAGE_KEYS = {
  PROFILE: 'studystreak_profile_v1',
  WEAK_TOPICS: 'studystreak_weak_topics_v1',
  TODOS: 'studystreak_todos_v1',
  STREAK: 'studystreak_telemetry_v1',
  CHAT_HISTORY: 'studystreak_chat_history_v1',
  THEME: 'studystreak_theme_mode_v1',
};

// Default Profile
export function getDefaultProfile() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 75); // ~75 days countdown default
  const defaultExam = EXAM_PRESETS[0];

  return {
    examId: defaultExam.id,
    examName: defaultExam.name,
    badge: defaultExam.badge,
    subjects: defaultExam.defaultSubjects,
    examDate: targetDate.toISOString().split('T')[0],
    targetGoal: 'Top 1% All India Rank',
    dailyTargetHours: 6,
    hasCompletedOnboarding: false,
  };
}

export function getProfile() {
  if (typeof window === 'undefined') return getDefaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return getDefaultProfile();
    return { ...getDefaultProfile(), ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading profile from localStorage', e);
    return getDefaultProfile();
  }
}

export function saveProfile(profile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to localStorage', e);
  }
}

// Weak Topics Tracking
// format: { [topicName]: { topic: string, subject: string, correct: number, wrong: number, total: number, accuracy: number, lastTrained: string } }
export function getWeakTopics(examId = 'JEE') {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEAK_TOPICS);
    if (!raw) {
      // Seed default weak topics for the exam
      const preset = EXAM_PRESETS.find(e => e.id === examId) || EXAM_PRESETS[0];
      const initial = preset.defaultWeakTopics.map((topic, idx) => ({
        topic,
        subject: preset.defaultSubjects[idx % preset.defaultSubjects.length] || 'Core',
        correct: Math.floor(Math.random() * 2) + 1,
        wrong: Math.floor(Math.random() * 3) + 2,
        total: 5,
        accuracy: 35 + idx * 8, // simulated initial diagnostic
        lastTrained: 'Yesterday',
      }));
      saveWeakTopics(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading weak topics', e);
    return [];
  }
}

export function saveWeakTopics(topics) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WEAK_TOPICS, JSON.stringify(topics));
  } catch (e) {
    console.error('Error saving weak topics', e);
  }
}

export function recordQuizResults(topicName, subjectName, numCorrect, numWrong) {
  if (typeof window === 'undefined') return;
  const current = getWeakTopics();
  const existingIdx = current.findIndex(t => t.topic.toLowerCase() === topicName.toLowerCase());
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (existingIdx >= 0) {
    const item = current[existingIdx];
    const totalCorrect = item.correct + numCorrect;
    const totalWrong = item.wrong + numWrong;
    const total = totalCorrect + totalWrong;
    const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;

    current[existingIdx] = {
      ...item,
      correct: totalCorrect,
      wrong: totalWrong,
      total,
      accuracy,
      lastTrained: `Today at ${now}`,
    };
  } else {
    const total = numCorrect + numWrong;
    const accuracy = total > 0 ? Math.round((numCorrect / total) * 100) : 0;
    current.push({
      topic: topicName,
      subject: subjectName || 'General',
      correct: numCorrect,
      wrong: numWrong,
      total,
      accuracy,
      lastTrained: `Today at ${now}`,
    });
  }

  saveWeakTopics(current);
}

// Daily To-Do Planner List
export function getTodos() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TODOS);
    if (!raw) {
      const initial = [
        {
          id: '1',
          title: 'Review Rotational Dynamics formulas & solve 15 PYQs',
          subject: 'Physics',
          completed: false,
          priority: 'high',
          timeEstimate: '90m',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Complete 5-MCQ Quiz on Ionic Equilibrium (Weak Topic)',
          subject: 'Chemistry',
          completed: true,
          priority: 'high',
          timeEstimate: '20m',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Practice Definite Integrals substitution tricks',
          subject: 'Calculus',
          completed: false,
          priority: 'med',
          timeEstimate: '60m',
          createdAt: new Date().toISOString(),
        },
      ];
      saveTodos(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading todos', e);
    return [];
  }
}

export function saveTodos(todos) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (e) {
    console.error('Error saving todos', e);
  }
}

// Telemetry & Streak
export function getStreakTelemetry() {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 7,
      longestStreak: 19,
      todayHours: 3.5,
      targetHours: 6.0,
      totalQuestionsSolved: 142,
      weeklyHours: [
        { day: 'Mon', hours: 4.5, target: 6 },
        { day: 'Tue', hours: 5.0, target: 6 },
        { day: 'Wed', hours: 6.2, target: 6 },
        { day: 'Thu', hours: 3.8, target: 6 },
        { day: 'Fri', hours: 5.5, target: 6 },
        { day: 'Sat', hours: 7.0, target: 6 },
        { day: 'Sun', hours: 3.5, target: 6 }, // Today
      ],
      lastActiveDate: new Date().toISOString().split('T')[0],
      aiMotivationalQuote: 'Every single problem you master today moves you ahead of 1,000 aspirants.',
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) {
      const initial = {
        currentStreak: 7,
        longestStreak: 19,
        todayHours: 3.5,
        targetHours: 6.0,
        totalQuestionsSolved: 142,
        weeklyHours: [
          { day: 'Mon', hours: 4.5, target: 6 },
          { day: 'Tue', hours: 5.0, target: 6 },
          { day: 'Wed', hours: 6.2, target: 6 },
          { day: 'Thu', hours: 3.8, target: 6 },
          { day: 'Fri', hours: 5.5, target: 6 },
          { day: 'Sat', hours: 7.0, target: 6 },
          { day: 'Sun', hours: 3.5, target: 6 },
        ],
        lastActiveDate: new Date().toISOString().split('T')[0],
        aiMotivationalQuote: 'Every single problem you master today moves you ahead of 1,000 aspirants.',
      };
      saveStreakTelemetry(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading streak telemetry', e);
    return null;
  }
}

export function saveStreakTelemetry(telemetry) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(telemetry));
  } catch (e) {
    console.error('Error saving streak telemetry', e);
  }
}

export function addStudyHours(hours) {
  const current = getStreakTelemetry();
  if (!current) return;
  const newToday = +(current.todayHours + hours).toFixed(1);
  const updatedWeekly = [...current.weeklyHours];
  // update Sunday / today
  const lastIndex = updatedWeekly.length - 1;
  if (lastIndex >= 0) {
    updatedWeekly[lastIndex].hours = newToday;
  }
  const updated = {
    ...current,
    todayHours: newToday,
    weeklyHours: updatedWeekly,
  };
  saveStreakTelemetry(updated);
  return updated;
}
