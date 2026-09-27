export interface Topic {
  id: string;
  name: string;
  unitOrCategory?: string;
  estimatedMinutes: number;
  difficulty?: 'core' | 'advanced' | 'application' | 'revision';
  memoryLayout?: string;
  keyRoutine?: string;
  targetOutput?: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface StudyBlock {
  id: string;
  topicId: string;
  title: string;
  subtitle?: string;
  category?: string;
  durationMinutes: number;
  scheduledTimeStr?: string;
  status: 'ready' | 'in_session' | 'up_next' | 'scheduled' | 'completed';
  type: 'learning' | 'practice' | 'revision';
  badge?: string;
  weightTag?: string;
  prerequisiteTag?: string;
}

export interface DaySchedule {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // MON, TUE, WED, THU, FRI, SAT, SUN
  displayDate: string; // e.g. "28 SEP"
  fullDisplayDate: string; // e.g. "Monday, 28 September"
  isToday: boolean;
  isReviewDay: boolean;
  targetHours: number;
  blocks: StudyBlock[];
  summary?: string;
}

export interface AcademicReference {
  id: string;
  index: string;
  title: string;
  link?: string;
  checked?: boolean;
}

export interface SessionChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface StudyPlan {
  id: string;
  subject: string;
  courseCode: string;
  academicTerm: string;
  rawSyllabus: string;
  examDate: string; // YYYY-MM-DD
  dailyStudyHours: number;
  createdAt: string;
  availableDays: number;
  bufferDays: number;
  topics: Topic[];
  days: DaySchedule[];
  totalStudyHours: number;
  academicReferences: AcademicReference[];
  sessionChecklist: SessionChecklistItem[];
  primaryReadingNotes?: string;
  blueprintMemoryNotes?: string;
}

export type ViewMode = 'landing' | 'create' | 'synthesizing' | 'plan' | 'roadmap';
