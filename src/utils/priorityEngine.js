// ============================================
// PRIORITY ENGINE — Full Page
// ============================================

// Calculates how urgent each course is
export const calculatePriorityScore = (course) => {
  const today = new Date();
  const examDate = new Date(course.examDate);
  const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

  const urgency = daysLeft > 0 ? 1 / daysLeft : 999;
  const creditUnits = course.creditUnits || 0;
  const lowConfidence = 5 - (course.confidence || 0);
  const remainingLoad =
    course.totalTopics > 0
      ? (course.remainingTopics || 0) / course.totalTopics
      : 0;

  const score = urgency * 0.4 + creditUnits * 0.2 + lowConfidence * 0.2 + remainingLoad * 0.2;
  return Math.round(score * 1000) / 1000;
};

// Ranks all courses by priority score, highest first
export const rankCourses = (courses = []) => {
  return [...courses]
    .map((course) => ({
      ...course,
      priorityScore: calculatePriorityScore(course),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
};

// Calculates how heavy a topic is based on difficulty and estimated time
export const calculateTopicWeight = (topic) => {
  const timeMap = {
    "30min": 0.5,
    "1hr": 1,
    "2hr": 2,
  };

  const time = timeMap[topic.estimatedTime] || 1;
  const difficulty = topic.difficulty || 1;

  return Math.round((time + difficulty * 0.5) * 10) / 10;
};

// Calculates dynamic max daily weight based on remaining topics and hard topics
export const calculateDynamicDailyWeight = (topics = [], preferences = {}) => {
  const totalTopics = topics.length;
  const hardTopics = topics.filter((t) => t.difficulty >= 4).length;

  // Base weight per topic (simplified)
  const baseWeight = 1.5;
  const hardFactor = preferences.hardTopicWeightFactor || 1.2;

  return totalTopics * baseWeight + hardTopics * hardFactor;
};

// Generates a day-by-day study plan
export const generateDailyPlan = (courses = [], topics = [], preferences = {}) => {
  const today = new Date();
  const plan = {};

  // Rank courses by priority
  const ranked = rankCourses(courses);

  // Group topics by courseId
  const topicsByCourse = {};
  topics.forEach((topic) => {
    if (!topicsByCourse[topic.courseId]) topicsByCourse[topic.courseId] = [];
    topicsByCourse[topic.courseId].push(topic);
  });

  // Sort topics within each course — hardest first
  Object.keys(topicsByCourse).forEach((courseId) => {
    topicsByCourse[courseId].sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
  });

  // Build a flat queue of pending topics in priority order
  const queue = [];
  ranked.forEach((course) => {
    const courseTopics = topicsByCourse[course.id] || [];
    const pending = courseTopics.filter((t) => t.status === "pending");
    queue.push(...pending);
  });

  // Assign topics to days
  let dayOffset = 0;
  let dailyWeight = 0;
  let hardTopicsToday = 0;
  const maxDailyWeight = preferences.maxDailyWeight || calculateDynamicDailyWeight(topics, preferences);
  const maxHardTopics = preferences.maxHardTopics || 2;

  queue.forEach((topic) => {
    const dateKey = new Date(today);
    dateKey.setDate(today.getDate() + dayOffset);
    const key = formatDate(dateKey);
    if (!plan[key]) plan[key] = [];

    const weight = calculateTopicWeight(topic);
    const isHard = (topic.difficulty || 0) >= 4;

    const tooHeavy = dailyWeight + weight > maxDailyWeight;
    const tooManyHard = isHard && hardTopicsToday >= maxHardTopics;

    if (tooHeavy || tooManyHard) {
      dayOffset++;
      dailyWeight = 0;
      hardTopicsToday = 0;

      const newDate = new Date(today);
      newDate.setDate(today.getDate() + dayOffset);
      const newKey = formatDate(newDate);
      if (!plan[newKey]) plan[newKey] = [];
      plan[newKey].push(topic);
    } else {
      plan[key].push(topic);
    }

    dailyWeight += weight;
    if (isHard) hardTopicsToday++;
  });

  return plan;
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Rollover — redistributes missed topics
export const rollover = (missedTopics = [], courses = [], topics = [], preferences = {}) => {
  const updatedTopics = topics.map((t) => {
    const wasMissed = missedTopics.find((m) => m.id === t.id);
    return wasMissed ? { ...t, status: "pending" } : t;
  });
  return generateDailyPlan(courses, updatedTopics, preferences);
};

// Check if a course is at risk
export const checkAtRisk = (course, remainingTopics = [], preferences = {}) => {
  const today = new Date();
  const examDate = new Date(course.examDate);
  const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

  const totalWeight = (remainingTopics || []).reduce((sum, topic) => sum + calculateTopicWeight(topic), 0);
  const maxCoverable = daysLeft * (preferences.maxDailyWeight || calculateDynamicDailyWeight(remainingTopics, preferences));

  return totalWeight > maxCoverable;
};

// Sort topics for the day — hardest first
export const sortTopicsForDay = (topics = []) => {
  return [...topics].sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
};

// Get today's plan
export const getTodaysPlan = (plan = {}) => {
  const today = new Date();
  const key = formatDate(today);
  return plan[key] || [];
};

// Calculate overall progress per course
export const getCourseProgress = (courseId, topics = []) => {
  const courseTopics = topics.filter((t) => t.courseId === courseId);
  if (courseTopics.length === 0) return 0;
  const done = courseTopics.filter((t) => t.status === "done").length;
  return Math.round((done / courseTopics.length) * 100);
};

// Streak logic
export const calculateStreak = (checkIns = []) => {
  if (!checkIns.length) return 0;

  const sorted = [...checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let expected = new Date();
  expected.setHours(0, 0, 0, 0);

  for (const checkIn of sorted) {
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);

    const diff = Math.round((expected - checkInDate) / (1000 * 60 * 60 * 24));
    if (diff === 0 || diff === 1) {
      streak++;
      expected = checkInDate;
    } else {
      break;
    }
  }
  return streak;
};

// Urgent flag — bumps a course to top priority
export const flagUrgent = (courseId, courses = [], topics = [], preferences = {}) => {
  const updatedCourses = courses.map((c) => {
    if (c.id === courseId) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { ...c, examDate: tomorrow.toISOString().split("T")[0] };
    }
    return c;
  });
  return generateDailyPlan(updatedCourses, topics, preferences);
};