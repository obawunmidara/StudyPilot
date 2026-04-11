import {
  calculatePriorityScore,
  rankCourses,
  calculateTopicWeight,
  generateDailyPlan,
  checkAtRisk,
  getCourseProgress,
  calculateStreak,
  flagUrgent,
} from "./priorityEngine";

// ---- DUMMY DATA ----

const courses = [
  { id: "c1", name: "CSC 425", examDate: "2026-04-10", creditUnits: 4, confidence: 2, totalTopics: 3, remainingTopics: 3 },
  { id: "c2", name: "MAT 201", examDate: "2026-04-20", creditUnits: 3, confidence: 4, totalTopics: 2, remainingTopics: 2 },
  { id: "c3", name: "ENG 301", examDate: "2026-05-01", creditUnits: 2, confidence: 5, totalTopics: 2, remainingTopics: 1 },
];

const topics = [
  { id: "t1", courseId: "c1", name: "Process scheduling", difficulty: 5, estimatedTime: "2hr", status: "pending" },
  { id: "t2", courseId: "c1", name: "Memory management", difficulty: 4, estimatedTime: "1hr", status: "pending" },
  { id: "t3", courseId: "c1", name: "File systems", difficulty: 3, estimatedTime: "1hr", status: "pending" },
  { id: "t4", courseId: "c2", name: "Linear transformations", difficulty: 5, estimatedTime: "2hr", status: "pending" },
  { id: "t5", courseId: "c2", name: "Eigenvalues", difficulty: 4, estimatedTime: "2hr", status: "pending" },
  { id: "t6", courseId: "c3", name: "Report structure", difficulty: 2, estimatedTime: "30min", status: "pending" },
  { id: "t7", courseId: "c3", name: "Academic writing", difficulty: 1, estimatedTime: "30min", status: "done" },
];

const preferences = {
  maxDailyWeight: 6,
  maxHardTopics: 2,
};

const checkIns = [
  { date: "2026-04-01" },
  { date: "2026-03-31" },
  { date: "2026-03-30" },
  { date: "2026-03-28" }, // missed one day here
];

// ---- TESTS ----

console.log("=== PRIORITY SCORES ===");
courses.forEach(c => {
  console.log(`${c.name}: ${calculatePriorityScore(c)}`);
});

console.log("\n=== RANKED COURSES ===");
rankCourses(courses).forEach((c, i) => {
  console.log(`${i + 1}. ${c.name} — score: ${c.priorityScore}`);
});

console.log("\n=== TOPIC WEIGHTS ===");
topics.forEach(t => {
  console.log(`${t.name}: weight ${calculateTopicWeight(t)}`);
});

console.log("\n=== DAILY PLAN ===");
const plan = generateDailyPlan(courses, topics, preferences);
Object.entries(plan).forEach(([date, dayTopics]) => {
  console.log(`${date}:`);
  dayTopics.forEach(t => console.log(`  - ${t.name} (weight: ${calculateTopicWeight(t)})`));
});

console.log("\n=== AT RISK CHECK ===");
const pendingC1 = topics.filter(t => t.courseId === "c1" && t.status === "pending");
const atRisk = checkAtRisk(courses[0], pendingC1, preferences);
console.log(`CSC 425 at risk: ${atRisk}`);

console.log("\n=== COURSE PROGRESS ===");
courses.forEach(c => {
  console.log(`${c.name}: ${getCourseProgress(c.id, topics)}% done`);
});

console.log("\n=== STREAK ===");
console.log(`Current streak: ${calculateStreak(checkIns)} days`);

console.log("\n=== URGENT FLAG ===");
const urgentPlan = flagUrgent("c2", courses, topics, preferences);
console.log("Plan after flagging MAT 201 as urgent:");
Object.entries(urgentPlan).slice(0, 3).forEach(([date, dayTopics]) => {
  console.log(`${date}:`);
  dayTopics.forEach(t => console.log(`  - ${t.name}`));
});