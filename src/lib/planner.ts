import { DaySchedule, StudyBlock, StudyPlan, Topic } from '../types';

export interface PlanValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export function validatePlanInputs(
  subject: string,
  topics: string[],
  examDateStr: string,
  dailyHours: number
): PlanValidationResult {
  if (!subject.trim()) {
    return { isValid: false, error: 'Please enter a subject or course title.' };
  }

  if (!topics || topics.length === 0) {
    return {
      isValid: false,
      error: 'Please add at least one syllabus topic or module before generating.',
    };
  }

  if (!examDateStr) {
    return { isValid: false, error: 'Please select a target exam date.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = new Date(examDateStr);
  examDate.setHours(0, 0, 0, 0);

  if (isNaN(examDate.getTime())) {
    return { isValid: false, error: 'Invalid exam date format selected.' };
  }

  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isValid: false,
      error: 'The exam date is in the past. Please select an upcoming date.',
    };
  }

  if (diffDays === 0) {
    return {
      isValid: false,
      error:
        'Target exam date is today. There is insufficient time for a sequenced study plan with spaced retention.',
    };
  }

  if (!dailyHours || dailyHours <= 0) {
    return {
      isValid: false,
      error: 'Please select your daily available study time (e.g. 3 hrs/day).',
    };
  }

  // Workload capacity check
  const totalCapacityHours = diffDays * dailyHours;
  const estimatedHoursNeeded = topics.length * 1.5;

  let warning: string | undefined = undefined;
  if (estimatedHoursNeeded > totalCapacityHours * 1.4) {
    warning =
      'Your syllabus is larger than your available study capacity. The plan has prioritized topics and distributed the workload across your available time.';
  }

  return { isValid: true, warning };
}

export function parseSyllabusText(text: string): string[] {
  if (!text.trim()) return [];

  const rawLines = text.split(/\r?\n/);
  const topics: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Remove markdown list markers, numbering, roman numerals, unit prefixes
    const cleanLine = trimmed
      .replace(/^[\*\-\•\–\—]\s*/, '')
      .replace(/^unit\s*\d+[:\.\-]?\s*/i, '')
      .replace(/^module\s*[a-z0-9]+[:\.\-]?\s*/i, '')
      .replace(/^week\s*\d+[:\.\-]?\s*/i, '')
      .replace(/^topic\s*\d+[:\.\-]?\s*/i, '')
      .replace(/^chapter\s*\d+[:\.\-]?\s*/i, '')
      .replace(/^\d+[\.\)\-]\s*/, '')
      .trim();

    // If the line contains comma or semicolon separated items (e.g. "Arrays, Linked Lists, Stacks")
    if (cleanLine.includes(',') && !cleanLine.includes('http')) {
      const parts = cleanLine.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (part.length > 1 && !topics.includes(part)) {
          topics.push(part);
        }
      }
    } else if (cleanLine.length > 1 && !topics.includes(cleanLine)) {
      topics.push(cleanLine);
    }
  }

  return topics.filter((t) => t.length > 0);
}

export function calculateDaysRemaining(examDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = new Date(examDateStr);
  examDate.setHours(0, 0, 0, 0);

  if (isNaN(examDate.getTime())) return 18;

  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function generatePlan(
  subject: string,
  topicNames: string[],
  examDateStr: string,
  dailyHours: number,
  existingPlanId?: string
): StudyPlan {
  const availableDays = calculateDaysRemaining(examDateStr);
  const bufferDays = Math.max(1, Math.min(3, Math.floor(availableDays * 0.15)));
  const effectiveStudyDays = Math.max(1, availableDays - bufferDays);

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const fullDayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ];

  // Create Topic records
  const topics: Topic[] = topicNames.map((name, index) => {
    let memoryLayout = 'Fixed O(1) Access';
    let keyRoutine = 'Zero-index Offsets';
    let targetOutput = '3 Conceptual Drills';

    const lower = name.toLowerCase();
    if (lower.includes('tree') || lower.includes('graph') || lower.includes('bst')) {
      memoryLayout = 'Non-linear Pointer Graph';
      keyRoutine = 'Recursive Traversal & Depth';
      targetOutput = 'Diagram & Edge Cases';
    } else if (lower.includes('list') || lower.includes('stack') || lower.includes('queue')) {
      memoryLayout = 'Linear Node References';
      keyRoutine = 'In-place Pointer Rewiring';
      targetOutput = '4 Core Problem Implementations';
    } else if (lower.includes('sort') || lower.includes('search') || lower.includes('dijkstra')) {
      memoryLayout = 'Logarithmic Partitioning';
      keyRoutine = 'Divide & Conquer Recursion';
      targetOutput = 'Big-O Proof + Practice Set';
    } else if (lower.includes('acid') || lower.includes('enzyme') || lower.includes('cell')) {
      memoryLayout = 'Chemical Kinetics & Stoichiometry';
      keyRoutine = 'Pathway Substrate Regulation';
      targetOutput = 'Flashcard Synthesis & Formulas';
    } else if (lower.includes('court') || lower.includes('law') || lower.includes('clause') || lower.includes('amendment')) {
      memoryLayout = 'Statutory & Case Law Precedent';
      keyRoutine = 'IRAC Multi-tier Doctrine Analysis';
      targetOutput = 'Case Brief & Outline Synthesis';
    }

    return {
      id: `topic-${index + 1}`,
      name,
      estimatedMinutes: 45,
      difficulty: index === 0 ? 'core' : index < 4 ? 'core' : 'advanced',
      memoryLayout,
      keyRoutine,
      targetOutput,
      completed: false,
      notes: `Focus on fundamental principles and edge cases for ${name}.`,
    };
  });

  // Distribute topics into study days
  const days: DaySchedule[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // How many study blocks per day based on dailyHours?
  // 1.5h -> 2 blocks; 2h -> 2-3 blocks; 3h -> 3-4 blocks; 4h -> 4-5 blocks; 5h -> 5-6 blocks
  const blocksPerDay = Math.max(2, Math.round(dailyHours / 0.75));

  // Determine topic allocation across available days
  // If small syllabus (e.g. 4 topics for 14 days), don't create empty void days:
  // condense topics with spaced drills & reviews
  let topicCursor = 0;

  for (let i = 0; i < Math.min(availableDays, 21); i++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + i);

    const dowIndex = dayDate.getDay();
    const dow = dayNames[dowIndex];
    const isToday = i === 0;
    const isSunday = dowIndex === 0;
    const isBufferDay = i >= effectiveStudyDays;
    const isReviewDay = isSunday || isBufferDay;

    const displayDate = `${dayDate.getDate().toString().padStart(2, '0')} ${monthNames[dayDate.getMonth()].toUpperCase()}`;
    const fullDisplayDate = `${fullDayNames[dowIndex]}, ${dayDate.getDate()} ${fullMonthNames[dayDate.getMonth()]}`;

    const blocks: StudyBlock[] = [];

    if (isReviewDay) {
      // Review / consolidation day
      blocks.push({
        id: `block-${i}-1`,
        topicId: topics[Math.min(topics.length - 1, Math.max(0, topicCursor - 1))]?.id || 'rev-1',
        title: 'Weekly Consolidation & Problem Bank',
        subtitle: 'Practice Problem Set #1 & Core Checkpoint',
        category: subject,
        durationMinutes: 60,
        scheduledTimeStr: '09:00 AM',
        status: isToday ? 'ready' : 'scheduled',
        type: 'practice',
        badge: 'Review Day',
        weightTag: 'High (Mock Exam Prep)',
      });
      blocks.push({
        id: `block-${i}-2`,
        topicId: topics[Math.min(topics.length - 1, Math.max(0, topicCursor - 2))]?.id || 'rev-2',
        title: 'Retention Self-Audit & Flashcards',
        subtitle: 'Spaced recall interval across previous modules',
        category: subject,
        durationMinutes: 45,
        scheduledTimeStr: '11:30 AM',
        status: isToday ? 'up_next' : 'scheduled',
        type: 'revision',
        badge: 'Retention Drill',
        weightTag: 'Active Recall',
      });
      if (dailyHours >= 3) {
        blocks.push({
          id: `block-${i}-3`,
          topicId: 'rev-weak',
          title: 'Weak-Area Repair & Synthesis',
          subtitle: 'Revisit missed problems and tricky lemma proofs',
          category: subject,
          durationMinutes: 45,
          scheduledTimeStr: '04:00 PM',
          status: 'scheduled',
          type: 'revision',
          badge: 'Wrap-up',
          weightTag: 'Buffer Zone',
        });
      }
    } else {
      // Learning day: pull topics or create practice drills
      const dayTopicsCount = Math.min(
        topics.length - topicCursor,
        Math.max(1, Math.floor(blocksPerDay * 0.7))
      );

      const dayTopics: Topic[] = [];
      for (let t = 0; t < dayTopicsCount; t++) {
        if (topicCursor < topics.length) {
          dayTopics.push(topics[topicCursor]);
          topicCursor++;
        }
      }

      // If we finished all topics early, cycle back for deep practice
      if (dayTopics.length === 0) {
        const cycleTopic = topics[i % topics.length];
        dayTopics.push(cycleTopic);
      }

      // Build blocks for the day
      dayTopics.forEach((t, tIndex) => {
        const timeSlots = ['09:00 AM', '11:00 AM', '02:30 PM', '06:00 PM', '08:00 PM'];
        const slot = timeSlots[tIndex] || '09:00 AM';

        blocks.push({
          id: `block-${i}-${tIndex}`,
          topicId: t.id,
          title: t.name,
          subtitle: `${t.memoryLayout} · ${t.keyRoutine}`,
          category: subject,
          durationMinutes: t.estimatedMinutes,
          scheduledTimeStr: slot,
          status: isToday
            ? tIndex === 0
              ? 'in_session'
              : tIndex === 1
              ? 'up_next'
              : 'scheduled'
            : 'scheduled',
          type: 'learning',
          badge: isToday
            ? tIndex === 0
              ? 'Active Now'
              : tIndex === 1
              ? 'Up Next'
              : 'Scheduled'
            : 'Scheduled',
          weightTag: tIndex === 0 ? 'Weight: High (Finals Core)' : 'Core Concept',
          prerequisiteTag: tIndex > 0 ? `Builds on ${dayTopics[tIndex - 1].name}` : undefined,
        });
      });

      // Add a practice or revision block at end of day
      const wrapTime = blocks.length >= 2 ? '06:00 PM' : '11:30 AM';
      blocks.push({
        id: `block-${i}-wrap`,
        topicId: dayTopics[0]?.id || 'daily-rev',
        title: 'Daily Synthesis & Flashcard Drill',
        subtitle: `Review ${dayTopics.map((dt) => dt.name).join(' + ')} invariants`,
        category: subject,
        durationMinutes: 30,
        scheduledTimeStr: wrapTime,
        status: isToday ? 'scheduled' : 'scheduled',
        type: 'revision',
        badge: 'Wrap-up',
        weightTag: 'End of Day',
      });
    }

    days.push({
      dayNumber: i + 1,
      date: dayDate.toISOString().split('T')[0],
      dayOfWeek: dow,
      displayDate,
      fullDisplayDate,
      isToday,
      isReviewDay,
      targetHours: dailyHours,
      blocks,
      summary: isReviewDay
        ? 'Consolidation & Weak Area Repair'
        : `Scheduled ${blocks.length} modules across ${dailyHours} hours`,
    });
  }

  // Pre-configured Academic References
  const academicReferences = [
    {
      id: 'ref-1',
      index: '[01]',
      title: `${subject} Core Reference · Chapters 1–4 Fundamentals`,
      link: '#',
      checked: false,
    },
    {
      id: 'ref-2',
      index: '[02]',
      title: `Curated High-Yield Exam Problem Bank · ${topics.length} Key Domains`,
      link: '#',
      checked: true,
    },
  ];

  // Session Checklist
  const firstTopic = topics[0]?.name || 'Core Fundamentals';
  const sessionChecklist = [
    { id: 'chk-1', text: `Review ${firstTopic} time & space complexity invariants`, done: true },
    { id: 'chk-2', text: `Diagram key memory representations & edge cases`, done: false },
    { id: 'chk-3', text: `Solve active recall problem bank without looking at solutions`, done: false },
  ];

  return {
    id: existingPlanId || `plan-${Date.now()}`,
    subject,
    courseCode: subject.toLowerCase().includes('data')
      ? 'CS-302'
      : subject.toLowerCase().includes('bio')
      ? 'MCB-201'
      : subject.toLowerCase().includes('law')
      ? 'LAW-101'
      : 'ACAD-101',
    academicTerm: 'Fall Term 2026',
    rawSyllabus: topicNames.join('\n'),
    examDate: examDateStr,
    dailyStudyHours: dailyHours,
    createdAt: new Date().toISOString(),
    availableDays,
    bufferDays,
    topics,
    days,
    totalStudyHours: Math.round(availableDays * dailyHours),
    academicReferences,
    sessionChecklist,
    primaryReadingNotes: `Introduction to ${subject}, Core Principles & Foundation Readings`,
    blueprintMemoryNotes: `Ensure contiguous mental model before advancing. Guard against edge-case loop invariants and index exceptions.`,
  };
}
