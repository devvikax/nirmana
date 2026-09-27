import React, { useState, useEffect } from 'react';
import {
  parseSyllabusText,
  calculateDaysRemaining,
  validatePlanInputs,
} from '../lib/planner';
import { getDefaultExamDate } from '../lib/storage';
import { StudyPlan } from '../types';

interface CreatePlanProps {
  existingPlan: StudyPlan | null;
  initialPreset?: { subject: string; rawSyllabus: string };
  onPlanGenerated: (planData: {
    subject: string;
    topics: string[];
    examDate: string;
    dailyHours: number;
  }) => void;
  onCancel?: () => void;
}

export const CreatePlan: React.FC<CreatePlanProps> = ({
  existingPlan,
  initialPreset,
  onPlanGenerated,
  onCancel,
}) => {
  // Form State
  const [subject, setSubject] = useState(
    initialPreset?.subject || existingPlan?.subject || 'Data Structures & Algorithms'
  );

  const [tags, setTags] = useState<string[]>(() => {
    if (initialPreset?.rawSyllabus) {
      return parseSyllabusText(initialPreset.rawSyllabus);
    }
    if (existingPlan?.topics && existingPlan.topics.length > 0) {
      return existingPlan.topics.map((t) => t.name);
    }
    return [
      'Arrays',
      'Linked Lists',
      'Stacks',
      'Queues',
      'Trees',
      'Graphs',
      'Sorting',
      'Searching',
    ];
  });

  const [newTagInput, setNewTagInput] = useState('');
  const [syllabusMode, setSyllabusMode] = useState<'tags' | 'paste'>('tags');
  const [rawPasteText, setRawPasteText] = useState(
    initialPreset?.rawSyllabus ||
      `1. Linear Data Structures: Arrays, Linked Lists, Stacks, Queues
2. Hierarchical Structures: Binary Search Trees, AVL Trees, Heaps
3. Relational & Graph Algorithms: BFS, DFS, Dijkstra, Topo-sort
4. Algorithmic Paradigms: Divide & Conquer, Sorting (Quick, Merge), Binary Search`
  );

  const [examDate, setExamDate] = useState(
    existingPlan?.examDate || getDefaultExamDate(18)
  );

  const [dailyHours, setDailyHours] = useState<number>(
    existingPlan?.dailyStudyHours || 3
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [isExtractingAI, setIsExtractingAI] = useState(false);

  // Dynamic calculations
  const availableDays = calculateDaysRemaining(examDate);
  const totalStudyHours = Math.round(availableDays * dailyHours);

  // Determine feasibility
  let pacingFeasibility = 'High';
  if (tags.length > 0) {
    const hoursPerTopic = totalStudyHours / tags.length;
    if (hoursPerTopic < 1.2) {
      pacingFeasibility = 'Tight';
    } else if (hoursPerTopic < 2.5) {
      pacingFeasibility = 'Moderate';
    } else {
      pacingFeasibility = 'High';
    }
  }

  // Update warnings dynamically
  useEffect(() => {
    const val = validatePlanInputs(subject, tags, examDate, dailyHours);
    if (!val.isValid) {
      setValidationError(null); // don't nag until submit
    } else if (val.warning) {
      setValidationWarning(val.warning);
    } else {
      setValidationWarning(null);
    }
  }, [subject, tags, examDate, dailyHours]);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleExtractFromPaste = async () => {
    if (!rawPasteText.trim()) return;

    // Fast deterministic extraction first
    const extracted = parseSyllabusText(rawPasteText);

    // If server AI is reachable, attempt enhancement
    setIsExtractingAI(true);
    try {
      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawPasteText }),
      });
      const data = await res.json();
      if (data?.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        setTags(data.topics);
        setSyllabusMode('tags');
        setIsExtractingAI(false);
        return;
      }
    } catch {
      // Fallback
    }

    if (extracted.length > 0) {
      setTags(extracted);
    }
    setSyllabusMode('tags');
    setIsExtractingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If in paste mode and tags are empty, attempt extraction first
    let activeTags = tags;
    if (syllabusMode === 'paste' && activeTags.length === 0 && rawPasteText.trim()) {
      activeTags = parseSyllabusText(rawPasteText);
      setTags(activeTags);
    }

    const validation = validatePlanInputs(subject, activeTags, examDate, dailyHours);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Please fill all required fields.');
      return;
    }

    setValidationError(null);

    // If an existing plan is already saved, ask for confirmation to regenerate
    if (existingPlan && existingPlan.subject) {
      setShowRegenModal(true);
    } else {
      executeGeneration(activeTags);
    }
  };

  const executeGeneration = (tagsToUse: string[]) => {
    setShowRegenModal(false);
    onPlanGenerated({
      subject,
      topics: tagsToUse,
      examDate,
      dailyHours,
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#fbf8fc] text-[#1b1b1e] py-8 px-4 md:px-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Breadcrumb & Step Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1.5 text-[#4c4736] font-display text-xs uppercase tracking-wider">
            <span className="flex items-center text-[#6f5d00] font-bold">
              <span className="material-symbols-outlined text-base mr-1">auto_stories</span>
              Curriculum Engine
            </span>
            <span>/</span>
            <span className="text-[#1b1b1e] font-semibold">Configurator</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[#c3ecd7] text-[#002115] font-display text-xs font-semibold shadow-sm border border-[#1b1b1e]">
              Step 01 / 02
            </span>
            <span className="text-[#4c4736] font-display text-xs hidden sm:inline">Active Draft</span>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs font-display font-semibold hover:underline ml-2 cursor-pointer"
              >
                Back to Plan
              </button>
            )}
          </div>
        </div>

        {/* Main Neo-Brutalist Frame */}
        <div className="bg-white rounded-xl shadow-[4px_4px_0px_#1b1b1e] border-2 border-[#1b1b1e] overflow-hidden">
          {/* Top Accent Banner */}
          <div className="bg-[#ffe169] px-6 py-4 border-b-2 border-[#1b1b1e] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-display text-xs text-[#766300] tracking-widest uppercase font-bold block mb-1">
                Interactive Syllabus Architect
              </span>
              <h1 className="font-display text-2xl sm:text-3xl text-[#1b1b1e] font-bold tracking-tight">
                Create Your Study Plan
              </h1>
              <p className="font-body text-sm text-[#4c4736] mt-0.5">
                Enter course details to generate your daily breakdown.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]">
              <span className="material-symbols-outlined text-[#6f5d00] text-xl">bolt</span>
              <span className="font-display text-xs text-[#1b1b1e] font-semibold tracking-tight">
                Instant Schedule Synthesis
              </span>
            </div>
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div className="bg-[#ffdad6] text-[#93000a] p-4 border-b-2 border-[#1b1b1e] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-display text-xs font-semibold">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{validationError}</span>
              </div>
              <button
                onClick={() => setValidationError(null)}
                className="text-xs font-bold hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {validationWarning && (
            <div className="bg-[#ffe169]/30 text-[#1b1b1e] p-3 border-b border-[#1b1b1e] flex items-center gap-2 font-display text-xs">
              <span className="material-symbols-outlined text-base text-[#6f5d00]">warning</span>
              <span>{validationWarning}</span>
            </div>
          )}

          {/* Form Body */}
          <form className="p-6 md:p-8 flex flex-col space-y-7" onSubmit={handleSubmit}>
            {/* Field 1: Subject Title */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="font-display text-base text-[#1b1b1e] font-bold flex items-center gap-2"
                  htmlFor="subject-title"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-[#f0edf1] text-[#1b1b1e] font-display text-xs border border-[#1b1b1e]">
                    1
                  </span>
                  Subject or Course Title
                </label>
                <span className="font-display text-xs text-[#4c4736]">Required</span>
              </div>
              <div className="relative">
                <input
                  id="subject-title"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Data Structures &amp; Algorithms"
                  className="w-full bg-white text-[#1b1b1e] font-body text-base px-4 py-3 rounded-lg border-2 border-[#1b1b1e] focus:outline-none focus:ring-2 focus:ring-[#ffe169] shadow-[2px_2px_0px_#1b1b1e] placeholder:text-[#71717a]"
                  required
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#4c4736] pointer-events-none">
                  school
                </span>
              </div>
              <p className="font-body text-xs text-[#4c4736]">
                We tailor spacing repetitions and memory weightings to the domain's cognitive load.
              </p>
            </div>

            {/* Field 2: Syllabus Topics Input */}
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-display text-base text-[#1b1b1e] font-bold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-[#f0edf1] text-[#1b1b1e] font-display text-xs border border-[#1b1b1e]">
                    2
                  </span>
                  Syllabus &amp; Core Modules
                </label>
                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#c3ecd7] text-[#002115] font-display text-xs font-semibold border border-[#1b1b1e] shadow-sm">
                  <span className="material-symbols-outlined text-sm">checklist</span>
                  <span>{tags.length} topics identified</span>
                </span>
              </div>

              {/* Segmented Toggle */}
              <div className="bg-[#f0edf1] p-1 rounded-lg flex items-center w-full sm:w-fit self-start border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]">
                <button
                  type="button"
                  onClick={() => setSyllabusMode('tags')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded font-display text-xs font-semibold transition-all cursor-pointer ${
                    syllabusMode === 'tags'
                      ? 'bg-white text-[#1b1b1e] shadow-[1px_1px_0px_#1b1b1e] border border-[#1b1b1e]'
                      : 'text-[#4c4736] hover:text-[#1b1b1e]'
                  }`}
                >
                  Add Topics as Tags
                </button>
                <button
                  type="button"
                  onClick={() => setSyllabusMode('paste')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded font-display text-xs font-semibold transition-all cursor-pointer ${
                    syllabusMode === 'paste'
                      ? 'bg-white text-[#1b1b1e] shadow-[1px_1px_0px_#1b1b1e] border border-[#1b1b1e]'
                      : 'text-[#4c4736] hover:text-[#1b1b1e]'
                  }`}
                >
                  Paste Syllabus
                </button>
              </div>

              {/* View: Tags Container */}
              {syllabusMode === 'tags' ? (
                <div className="bg-[#f6f2f7] p-4 rounded-xl border-2 border-[#1b1b1e] flex flex-col gap-3 shadow-inner">
                  <div className="flex flex-wrap gap-2 min-h-12 items-center">
                    {tags.length === 0 && (
                      <span className="text-xs text-[#71717a] font-body italic">
                        No topics added yet. Type a topic below and press Enter, or switch to "Paste Syllabus".
                      </span>
                    )}
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-white text-[#1b1b1e] px-3 py-1.5 rounded-lg border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] font-display text-xs font-semibold group hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors cursor-pointer"
                        onClick={() => handleRemoveTag(idx)}
                        title="Click to remove"
                      >
                        <span>{tag}</span>
                        <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">
                          close
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Add Tag Quick Action */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#cec6b0]">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Type topic and press Enter..."
                      className="flex-1 bg-white text-[#1b1b1e] font-body text-sm px-3.5 py-2.5 rounded-lg border border-[#1b1b1e] focus:outline-none focus:ring-1 focus:ring-[#ffe169] shadow-[1px_1px_0px_#1b1b1e] placeholder:text-[#71717a]"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2.5 bg-[#416656] text-white rounded-lg font-display text-xs font-semibold hover:bg-[#294e3f] transition-colors border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* View: Paste Textarea */
                <div className="flex flex-col space-y-2">
                  <textarea
                    rows={5}
                    value={rawPasteText}
                    onChange={(e) => setRawPasteText(e.target.value)}
                    placeholder="Paste raw curriculum, course syllabus, or table of contents here. Our parser automatically structures individual study blocks..."
                    className="w-full bg-white text-[#1b1b1e] font-mono text-xs p-4 rounded-xl border-2 border-[#1b1b1e] focus:outline-none focus:ring-2 focus:ring-[#ffe169] shadow-[2px_2px_0px_#1b1b1e] placeholder:text-[#71717a] resize-y"
                  />
                  <div className="flex justify-between items-center px-1 font-display text-xs text-[#4c4736]">
                    <span>Auto-detects chapters, bullets, or comma-separated lists</span>
                    <button
                      type="button"
                      onClick={handleExtractFromPaste}
                      disabled={isExtractingAI}
                      className="text-[#6f5d00] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {isExtractingAI ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          <span>Structuring...</span>
                        </>
                      ) : (
                        <span>Extract to tags →</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Field 3: Target Exam Date */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="font-display text-base text-[#1b1b1e] font-bold flex items-center gap-2"
                  htmlFor="exam-date"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-[#f0edf1] text-[#1b1b1e] font-display text-xs border border-[#1b1b1e]">
                    3
                  </span>
                  Target Exam Date
                </label>
                <span className="font-display text-xs text-[#4c4736]">Countdown target</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-7 relative">
                  <input
                    id="exam-date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-white text-[#1b1b1e] font-body text-base px-4 py-3 rounded-lg border-2 border-[#1b1b1e] focus:outline-none focus:ring-2 focus:ring-[#ffe169] shadow-[2px_2px_0px_#1b1b1e]"
                    required
                  />
                </div>
                {/* Helper Badge Pill */}
                <div className="md:col-span-5 flex items-center h-full">
                  <div className="w-full bg-[#ffe169]/40 p-3 rounded-lg border border-[#1b1b1e] flex items-center justify-between shadow-[2px_2px_0px_#1b1b1e]">
                    <div className="flex items-center gap-2 text-[#1b1b1e]">
                      <span className="text-xl">⚡</span>
                      <div>
                        <span className="font-display text-xs font-bold block">
                          {availableDays} available study days
                        </span>
                        <span className="font-body text-xs text-[#4c4736]">
                          Active calendar buffer applied
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#6f5d00] text-base">
                      verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Field 4: Daily Available Study Time */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-display text-base text-[#1b1b1e] font-bold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-[#f0edf1] text-[#1b1b1e] font-display text-xs border border-[#1b1b1e]">
                    4
                  </span>
                  Daily Available Study Time
                </label>
                <span className="font-display text-xs text-[#4c4736]">Paced for mastery</span>
              </div>

              {/* Segmented Radio Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5" role="radiogroup">
                {[
                  { hours: 1.5, label: '1.5 hrs', sub: 'Light' },
                  { hours: 2, label: '2 hrs', sub: 'Steady' },
                  { hours: 3, label: '3 hrs/day', sub: 'Selected', badge: 'Optimal' },
                  { hours: 4, label: '4 hrs', sub: 'Intense' },
                  { hours: 5, label: '5 hrs', sub: 'Sprint' },
                ].map((item) => {
                  const isSelected = dailyHours === item.hours;
                  return (
                    <button
                      key={item.hours}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setDailyHours(item.hours)}
                      className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-lg border-2 border-[#1b1b1e] transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#ffe169] text-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] scale-[1.02]'
                          : 'bg-[#f6f2f7] text-[#1b1b1e] hover:bg-[#eae7eb] shadow-[1px_1px_0px_#1b1b1e]'
                      }`}
                    >
                      {item.badge && isSelected && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-[#416656] text-white font-display text-[9px] rounded-full uppercase tracking-tighter border border-[#1b1b1e]">
                          {item.badge}
                        </span>
                      )}
                      <span className="font-display text-xs font-bold">{item.label}</span>
                      <span className="font-display text-[11px] text-[#4c4736]">
                        {isSelected ? 'Selected' : item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Pacing Calculation Note / Formula Callout */}
              <div className="bg-[#f0edf1] p-4 rounded-xl border-2 border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white text-[#6f5d00] border border-[#1b1b1e] shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">calculate</span>
                  </div>
                  <div>
                    <span className="font-display text-sm text-[#1b1b1e] font-bold block">
                      Estimated {totalStudyHours} total study hours before exam
                    </span>
                    <span className="font-body text-xs text-[#4c4736]">
                      {availableDays} days × {dailyHours.toFixed(1)} hrs/day • Includes review cycles
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-[#416656] font-display text-xs font-semibold border border-[#1b1b1e] shadow-sm">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#416656]"></span>
                  <span>Pacing Feasibility: {pacingFeasibility}</span>
                </div>
              </div>
            </div>

            {/* Academic Reference / Tip Block */}
            <div className="bg-[#f6f2f7] rounded-xl p-4 border border-[#1b1b1e] flex items-start gap-3.5">
              <span className="material-symbols-outlined text-[#6f5d00] text-2xl shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <div className="flex flex-col space-y-0.5">
                <span className="font-display text-xs text-[#1b1b1e] font-bold tracking-tight">
                  Active Recall &amp; Leitner Distribution
                </span>
                <p className="font-body text-xs text-[#4c4736]">
                  Your generated plan allocates 60% of total hours to active problem resolution and spaced interval check-ins rather than passive reading.
                </p>
              </div>
            </div>

            {/* Primary Action CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-[#ffe169] text-[#1b1b1e] font-display text-lg font-bold uppercase tracking-wider border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] hover:shadow-[5px_5px_0px_#1b1b1e] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Generate My Plan</span>
                <span className="material-symbols-outlined font-bold text-2xl group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
              <div className="flex items-center justify-center gap-4 mt-3 text-[#4c4736] font-display text-xs flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#416656]">check_circle</span>
                  No lock-in
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#416656]">check_circle</span>
                  Exportable to ICS / Notion
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#416656]">check_circle</span>
                  Adaptive pacing
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Plan Regeneration (Requirement 9) */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 bg-[#1b1b1e]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[6px_6px_0px_#1b1b1e] max-w-md w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ffe169] border border-[#1b1b1e] flex items-center justify-center text-[#1b1b1e] shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#1b1b1e]">
                  Regenerate Existing Plan?
                </h3>
                <p className="font-body text-xs text-[#4c4736] mt-1 leading-relaxed">
                  You already have an active plan for <strong>{existingPlan?.subject}</strong>. Generating will replace your current schedule, completed marks, and calendar roadmap.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#cec6b0]">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 bg-white text-[#1b1b1e] border-2 border-[#1b1b1e] font-display text-xs font-semibold hover:bg-[#f0edf1] transition-all cursor-pointer"
              >
                Keep Current Plan
              </button>
              <button
                type="button"
                onClick={() => executeGeneration(tags)}
                className="px-4 py-2 bg-[#ffe169] text-[#1b1b1e] border-2 border-[#1b1b1e] font-display text-xs font-bold shadow-[2px_2px_0px_#1b1b1e] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Proceed &amp; Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
