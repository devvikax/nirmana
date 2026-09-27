import { StudyPlan } from '../types';
import { generatePlan } from './planner';

const STORAGE_KEY = 'syllabus_plan_active_v1';
const ALL_PLANS_KEY = 'syllabus_plans_catalog_v1';

export function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDefaultExamDate(daysFromNow = 18): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function createDefaultSeedPlan(): StudyPlan {
  const examDate = getDefaultExamDate(18);
  const defaultTopics = [
    'Arrays',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Trees',
    'Graphs',
    'Sorting',
    'Searching',
  ];

  const plan = generatePlan('Data Structures & Algorithms', defaultTopics, examDate, 3);
  // Mark the first topic (Arrays) as completed to match the mockup (1/4 done today)
  if (plan.topics.length > 0) {
    plan.topics[0].completed = true;
    plan.topics[0].completedAt = new Date().toISOString();
  }

  // Also in Day 1, mark the first block as completed
  if (plan.days[0]?.blocks[0]) {
    plan.days[0].blocks[0].status = 'completed';
    if (plan.days[0].blocks[1]) {
      plan.days[0].blocks[1].status = 'in_session';
      plan.days[0].blocks[1].badge = 'Active Now';
    }
  }

  return plan;
}

export function loadActivePlan(): StudyPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.topics) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading study plan from localStorage:', e);
  }

  // Pre-seed default plan and save
  const seed = createDefaultSeedPlan();
  saveActivePlan(seed);
  return seed;
}

export function saveActivePlan(plan: StudyPlan): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));

    // Also update catalogue
    const catalog = loadAllPlans();
    const existingIndex = catalog.findIndex((p) => p.id === plan.id);
    if (existingIndex >= 0) {
      catalog[existingIndex] = plan;
    } else {
      catalog.push(plan);
    }
    localStorage.setItem(ALL_PLANS_KEY, JSON.stringify(catalog));
  } catch (e) {
    console.error('Error saving study plan to localStorage:', e);
  }
}

export function loadAllPlans(): StudyPlan[] {
  try {
    const raw = localStorage.getItem(ALL_PLANS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading all plans:', e);
  }
  return [];
}

export function resetToSeedPlan(): StudyPlan {
  const seed = createDefaultSeedPlan();
  saveActivePlan(seed);
  return seed;
}
