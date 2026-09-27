import React, { useState, useEffect } from 'react';
import { StudyPlan, Topic, StudyBlock } from '../types';

interface TodayPlanProps {
  plan: StudyPlan;
  onUpdatePlan: (updated: StudyPlan) => void;
  onViewRoadmap: () => void;
  onOpenSubjects: () => void;
}

export const TodayPlan: React.FC<TodayPlanProps> = ({
  plan,
  onUpdatePlan,
  onViewRoadmap,
  onOpenSubjects,
}) => {
  // Identify today's schedule
  const todaySchedule = plan.days.find((d) => d.isToday) || plan.days[0];

  // Active focus topic state (defaults to the first incomplete topic of today, or first topic)
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Sync active block when today's schedule changes
  useEffect(() => {
    if (todaySchedule?.blocks?.length) {
      const firstIncompleteIdx = todaySchedule.blocks.findIndex(
        (b) => b.status !== 'completed'
      );
      setActiveBlockIndex(firstIncompleteIdx >= 0 ? firstIncompleteIdx : 0);
    }
  }, [todaySchedule]);

  // Current active block and corresponding topic
  const currentBlock: StudyBlock | undefined = todaySchedule?.blocks[activeBlockIndex];
  const currentTopic: Topic | undefined =
    plan.topics.find((t) => t.id === currentBlock?.topicId) || plan.topics[0];

  // Reset timer duration when active block changes
  useEffect(() => {
    if (currentBlock) {
      setTimerSeconds(currentBlock.durationMinutes * 60);
      setIsTimerRunning(false);
    }
  }, [currentBlock?.id]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds((currentBlock?.durationMinutes || 45) * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mark block / topic completed
  const handleMarkCompleted = (blockIdxToComplete = activeBlockIndex) => {
    const targetBlock = todaySchedule.blocks[blockIdxToComplete];
    if (!targetBlock) return;

    // Update topic in plan.topics
    const updatedTopics = plan.topics.map((t) => {
      if (t.id === targetBlock.topicId) {
        return {
          ...t,
          completed: true,
          completedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    // Update block status in today's schedule and advance the next block to in_session
    const updatedDays = plan.days.map((d) => {
      if (d.dayNumber === todaySchedule.dayNumber) {
        const newBlocks = d.blocks.map((b, idx) => {
          if (idx === blockIdxToComplete) {
            return {
              ...b,
              status: 'completed' as const,
              badge: 'Completed',
            };
          }
          if (idx === blockIdxToComplete + 1 && b.status !== 'completed') {
            return {
              ...b,
              status: 'in_session' as const,
              badge: 'Active Now',
            };
          }
          return b;
        });
        return { ...d, blocks: newBlocks };
      }
      return d;
    });

    const updatedPlan: StudyPlan = {
      ...plan,
      topics: updatedTopics,
      days: updatedDays,
    };

    onUpdatePlan(updatedPlan);

    // Advance active block
    if (blockIdxToComplete + 1 < todaySchedule.blocks.length) {
      setActiveBlockIndex(blockIdxToComplete + 1);
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    const updatedChecklist = plan.sessionChecklist.map((item) => {
      if (item.id === id) {
        return { ...item, done: !item.done };
      }
      return item;
    });

    onUpdatePlan({
      ...plan,
      sessionChecklist: updatedChecklist,
    });
  };

  // Overall progress calculations
  const totalTopicsCount = plan.topics.length;
  const completedTopicsCount = plan.topics.filter((t) => t.completed).length;
  const overallPercentage =
    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // Track progress blocks (10 total indicators)
  const trackUnits = 10;
  const completedUnits = Math.round((overallPercentage / 100) * trackUnits);

  return (
    <div className="w-full bg-[#fbf8fc] text-[#1b1b1e] pt-20 pb-16 px-4 md:px-6">
      <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
        {/* Top Status / Course Deck Bar */}
        <section className="w-full bg-white shadow-[3px_3px_0px_#1b1b1e] border-2 border-[#1b1b1e] rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Course Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-xs uppercase tracking-wider text-[#4c4736]">
              Active Deck
            </span>
            <button
              onClick={onOpenSubjects}
              type="button"
              className="group flex items-center gap-2 bg-[#f0edf1] hover:bg-[#eae7eb] transition-all text-[#1b1b1e] px-4 py-1.5 rounded-lg border-2 border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffe169] inline-block border border-[#1b1b1e]"></span>
              <span className="font-display text-base font-bold text-[#1b1b1e]">
                {plan.subject}
              </span>
              <span className="material-symbols-outlined text-[20px] text-[#4c4736] group-hover:translate-y-0.5 transition-transform">
                arrow_drop_down
              </span>
            </button>
          </div>

          {/* Exam Countdown & Syllabus Health */}
          <div className="flex flex-wrap items-center gap-4 justify-between lg:justify-end">
            {/* Exam Countdown Pill */}
            <div className="inline-flex items-center gap-1.5 bg-[#ffdad6] text-[#93000a] px-3.5 py-1.5 rounded-full border-2 border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]">
              <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
              <span className="font-display text-xs tracking-tight">
                Final Exam: <strong>{plan.availableDays} days left</strong>
              </span>
            </div>

            {/* Overall Progress Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#f6f2f7] px-3.5 py-1.5 rounded-lg border border-[#1b1b1e]">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="font-display text-xs uppercase text-[#4c4736]">
                  Syllabus Target
                </span>
                <span className="font-display text-sm font-bold text-[#1b1b1e]">
                  {completedTopicsCount} / {totalTopicsCount} topics
                </span>
                <span className="font-display text-xs text-[#416656] font-bold">
                  ({overallPercentage}%)
                </span>
              </div>

              {/* Segmented Progress Track (10 units) */}
              <div className="flex items-center gap-1">
                {[...Array(trackUnits)].map((_, i) => {
                  const isDone = i < completedUnits;
                  const isCurrent = i === completedUnits && !isDone;
                  return (
                    <div
                      key={i}
                      className={`w-3.5 h-6 rounded border border-[#1b1b1e] transition-colors ${
                        isDone
                          ? 'bg-[#c3ecd7] shadow-[1px_1px_0px_#1b1b1e]'
                          : isCurrent
                          ? 'bg-[#ffe169] shadow-[1px_1px_0px_#1b1b1e]'
                          : 'bg-[#e4e1e6]'
                      }`}
                      title={`Unit ${i + 1}: ${isDone ? 'Completed' : 'Remaining'}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace Split: Focused Study Block + Visual Dashboard Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Action: Hero Focus Card & Today's Schedule (8 Cols) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* Big Hero Card: WHAT SHOULD I STUDY NEXT? */}
            <article className="relative w-full bg-[#ffe169] text-[#1b1b1e] rounded-xl border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
              {/* Subtle Background Accent Pattern */}
              <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/20 pointer-events-none"></div>

              {/* Card Header & Badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap z-10">
                <div className="inline-flex items-center gap-2 bg-white text-[#1b1b1e] px-3.5 py-1 rounded-full border-2 border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]">
                  <span className="w-2 h-2 rounded-full bg-[#416656] animate-pulse"></span>
                  <span className="font-display text-xs tracking-wide uppercase font-bold">
                    What Should I Study Next?
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 text-[#1b1b1e] px-3 py-1 rounded-lg border border-[#1b1b1e] text-xs font-display">
                  <span className="material-symbols-outlined text-[16px] text-[#4c4736]">
                    schedule
                  </span>
                  <span>
                    Block {activeBlockIndex + 1} of {todaySchedule?.blocks.length || 4} Today
                  </span>
                </div>
              </div>

              {/* Hero Main Content */}
              <div className="my-5 z-10 flex flex-col gap-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1b1b1e]">
                    #{String(activeBlockIndex + 1).padStart(2, '0')} {currentTopic?.name || 'Fundamentals'}
                  </span>
                  <span className="bg-white text-[#1b1b1e] font-display text-xs px-2.5 py-0.5 rounded border border-[#1b1b1e] shadow-[1px_1px_0px_#1b1b1e] font-semibold">
                    {currentTopic?.difficulty === 'advanced' ? 'Advanced Mastery' : 'Core Foundation'}
                  </span>
                </div>
                <p className="font-display text-base sm:text-lg text-[#1b1b1e] max-w-xl">
                  {currentBlock?.durationMinutes || 45} min • {currentBlock?.subtitle || 'Key concepts and active problem synthesis'}
                </p>

                {/* Topic Micro-Notes / Specs */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-white/90 p-3 rounded-lg border border-[#1b1b1e] shadow-[1px_1px_0px_#1b1b1e]">
                    <span className="font-display text-[11px] text-[#4c4736] block">
                      Memory Layout
                    </span>
                    <span className="font-body text-xs font-semibold text-[#1b1b1e]">
                      {currentTopic?.memoryLayout || 'Fixed O(1) Access'}
                    </span>
                  </div>
                  <div className="bg-white/90 p-3 rounded-lg border border-[#1b1b1e] shadow-[1px_1px_0px_#1b1b1e]">
                    <span className="font-display text-[11px] text-[#4c4736] block">
                      Key Routine
                    </span>
                    <span className="font-body text-xs font-semibold text-[#1b1b1e]">
                      {currentTopic?.keyRoutine || 'Zero-index Offsets'}
                    </span>
                  </div>
                  <div className="bg-white/90 p-3 rounded-lg border border-[#1b1b1e] shadow-[1px_1px_0px_#1b1b1e]">
                    <span className="font-display text-[11px] text-[#4c4736] block">
                      Target Output
                    </span>
                    <span className="font-body text-xs font-semibold text-[#1b1b1e]">
                      {currentTopic?.targetOutput || '5 Problem Implementations'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Hero Actions & Interactive Timer */}
              <div className="pt-4 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/50 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 p-6 sm:p-7 border-t-2 border-[#1b1b1e]">
                {/* Dynamic Timer Display */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border-2 border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px] text-[#1b1b1e]">
                      timer
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-[11px] text-[#4c4736] uppercase tracking-wider">
                      Allocated Block
                    </span>
                    <span className="font-display text-2xl font-bold tracking-tight text-[#1b1b1e]">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={toggleTimer}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white text-[#1b1b1e] font-display text-xs sm:text-sm font-bold px-4 py-2.5 rounded-lg border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1b1b1e] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isTimerRunning ? 'pause' : 'play_arrow'}
                    </span>
                    <span>{isTimerRunning ? 'Pause Timer' : 'Start 45m Timer'}</span>
                  </button>

                  {timerSeconds < (currentBlock?.durationMinutes || 45) * 60 && (
                    <button
                      type="button"
                      onClick={resetTimer}
                      title="Reset Timer"
                      className="p-2.5 bg-white border-2 border-[#1b1b1e] rounded-lg shadow-[2px_2px_0px_#1b1b1e] hover:bg-[#f0edf1] transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">replay</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMarkCompleted(activeBlockIndex)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#c3ecd7] text-[#002115] font-display text-xs sm:text-sm font-bold px-5 py-2.5 rounded-lg border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1b1b1e] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Mark Completed ✓</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Target Schedule List */}
            <div className="w-full bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#cec6b0] gap-2">
                <div>
                  <span className="font-display text-xs text-[#4c4736] uppercase tracking-wider block">
                    Target Schedule
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1b1e]">
                    {todaySchedule?.fullDisplayDate || 'Today’s Study Queue'}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#f0edf1] px-3 py-1 rounded border border-[#1b1b1e] font-display text-xs text-[#1b1b1e] self-start sm:self-auto shadow-xs">
                  <span className="material-symbols-outlined text-[16px]">pace</span>
                  <span>Total: {todaySchedule?.targetHours || 3} Hours Scheduled</span>
                </div>
              </div>

              {/* Schedule Cards Stack */}
              <div className="flex flex-col gap-3">
                {todaySchedule?.blocks.map((block, idx) => {
                  const isActiveNow = idx === activeBlockIndex;
                  const isDone = block.status === 'completed';

                  return (
                    <div
                      key={block.id}
                      onClick={() => setActiveBlockIndex(idx)}
                      className={`relative rounded-xl p-4 border-2 border-[#1b1b1e] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-[#c3ecd7]/30 opacity-75'
                          : isActiveNow
                          ? 'bg-[#ffe169]/30 shadow-[3px_3px_0px_#1b1b1e]'
                          : 'bg-white hover:bg-[#f6f2f7] shadow-[2px_2px_0px_#1b1b1e]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg font-display text-sm font-bold flex items-center justify-center shrink-0 border border-[#1b1b1e] shadow-xs ${
                            isDone
                              ? 'bg-[#c3ecd7] text-[#002115]'
                              : isActiveNow
                              ? 'bg-[#ffe169] text-[#1b1b1e]'
                              : 'bg-[#f0edf1] text-[#1b1b1e]'
                          }`}
                        >
                          {isDone ? (
                            <span className="material-symbols-outlined text-base">check</span>
                          ) : (
                            String(idx + 1).padStart(2, '0')
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-display font-semibold text-base text-[#1b1b1e] ${
                                isDone ? 'line-through text-[#4c4736]' : ''
                              }`}
                            >
                              {block.title}
                            </span>
                            {block.badge && (
                              <span
                                className={`text-[10px] font-display font-bold px-1.5 py-0.5 rounded border border-[#1b1b1e] ${
                                  isDone
                                    ? 'bg-[#c3ecd7] text-[#002115]'
                                    : isActiveNow
                                    ? 'bg-[#ffe169] text-[#1b1b1e]'
                                    : 'bg-[#dee2ef] text-[#171c25]'
                                }`}
                              >
                                {isDone ? 'Completed' : block.badge}
                              </span>
                            )}
                          </div>
                          <p className="font-body text-xs text-[#4c4736] mt-0.5 truncate">
                            {block.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                        <span className="font-display text-xs text-[#1b1b1e] bg-[#f0edf1] px-2 py-1 rounded border border-[#1b1b1e]">
                          {block.durationMinutes} min
                        </span>

                        {isDone ? (
                          <span className="inline-flex items-center gap-1 font-display text-xs text-[#416656] font-bold">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            <span>Finished</span>
                          </span>
                        ) : isActiveNow ? (
                          <span className="inline-flex items-center gap-1 font-display text-xs text-[#6f5d00] font-bold">
                            <span className="material-symbols-outlined text-[16px]">radio_button_checked</span>
                            <span>In Session</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveBlockIndex(idx);
                            }}
                            className="bg-[#f0edf1] hover:bg-[#ffe169] text-[#1b1b1e] font-display text-xs uppercase px-3 py-1 rounded border border-[#1b1b1e] shadow-xs active:translate-y-0.5 transition-all cursor-pointer font-semibold"
                          >
                            Start Block
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation to Weekly View */}
              <div className="mt-2 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#f0edf1] rounded-lg p-3.5 border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6f5d00] text-xl">
                    calendar_view_week
                  </span>
                  <span className="font-display text-xs sm:text-sm font-semibold text-[#1b1b1e]">
                    Planning further into the term?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onViewRoadmap}
                  className="inline-flex items-center gap-1 font-display text-xs sm:text-sm text-[#1b1b1e] hover:text-[#6f5d00] transition-colors underline decoration-2 underline-offset-4 font-bold cursor-pointer"
                >
                  <span>View 7-Day Weekly Roadmap</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: Micro Analytics, Reference & Tactical Tools (4 Cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Visual Study Rhythm Sparkline / Chart */}
            <div className="w-full bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs uppercase text-[#4c4736]">
                  Pacing Velocity
                </span>
                <span className="font-display text-xs bg-[#c3ecd7] text-[#002115] px-2 py-0.5 rounded border border-[#1b1b1e] font-semibold shadow-xs">
                  On Track
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#1b1b1e]">
                  {plan.dailyStudyHours.toFixed(1)}h
                </span>
                <span className="font-body text-xs text-[#4c4736]">
                  / 3.0h daily average target
                </span>
              </div>

              {/* Day of Week Bar Chart */}
              <div className="w-full h-24 bg-[#f6f2f7] rounded-lg p-2 flex items-end justify-between gap-1.5 border border-[#1b1b1e] shadow-inner">
                {[
                  { day: 'T', height: '40%', active: false },
                  { day: 'W', height: '60%', active: false },
                  { day: 'T', height: '50%', active: false },
                  { day: 'F', height: '85%', active: false },
                  { day: 'S', height: '70%', active: false },
                  { day: 'S', height: '35%', active: false },
                  { day: 'M', height: '95%', active: true },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className={`w-full rounded-t border-t border-x border-[#1b1b1e] transition-all ${
                        bar.active ? 'bg-[#ffe169]' : 'bg-[#c3ecd7]'
                      }`}
                      style={{ height: bar.height }}
                    />
                    <span
                      className={`font-display text-[10px] ${
                        bar.active ? 'font-bold text-[#1b1b1e]' : 'text-[#4c4736]'
                      }`}
                    >
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>

              <p className="font-body text-xs text-[#4c4736] leading-relaxed">
                Consistent retention rate at 88%. You are on schedule with active calendar buffer intact.
              </p>
            </div>

            {/* Academic Citation / Inset Note Block */}
            <div className="w-full bg-[#f6f2f7] rounded-xl border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs uppercase tracking-wider text-[#4c4736]">
                  Syllabus Anchor
                </span>
                <span className="bg-[#dee2ef] text-[#171c25] font-display text-[10px] px-2 py-0.5 rounded border border-[#1b1b1e]">
                  Ref #{plan.courseCode}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] flex flex-col gap-1.5">
                <span className="font-display text-xs font-bold text-[#1b1b1e]">
                  Primary Textbook Reading
                </span>
                <p className="font-body text-xs text-[#4c4736] italic leading-snug">
                  "{plan.primaryReadingNotes || 'Core Curated Readings & Foundational Theory'}"
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[#416656]">
                  <span className="material-symbols-outlined text-[16px]">bookmark_added</span>
                  <span className="font-display text-[11px] font-semibold text-[#1b1b1e]">
                    Pages flagged in syllabus outline
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Blueprint Card with clean workspace illustration */}
            <div className="w-full bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs uppercase text-[#4c4736]">
                  Memory Blueprint
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#4c4736]">
                  visibility
                </span>
              </div>
              <div className="w-full h-32 rounded-lg bg-[#f0edf1] border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#4c4736]">
                  <span>ADDR_RANGE: 0x0000 - 0x03FF</span>
                  <span className="px-1.5 py-0.5 bg-white border border-[#1b1b1e] rounded font-bold">
                    O(1) Indexed
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 my-2">
                  <div className="h-8 bg-[#c3ecd7] border border-[#1b1b1e] rounded flex items-center justify-center font-mono text-[11px] font-bold">
                    [0]
                  </div>
                  <div className="h-8 bg-[#ffe169] border border-[#1b1b1e] rounded flex items-center justify-center font-mono text-[11px] font-bold">
                    [1]
                  </div>
                  <div className="h-8 bg-white border border-[#1b1b1e] rounded flex items-center justify-center font-mono text-[11px] font-bold">
                    [2]
                  </div>
                  <div className="h-8 bg-[#f0edf1] border border-dashed border-[#1b1b1e] rounded flex items-center justify-center font-mono text-[11px] text-[#71717a]">
                    [N]
                  </div>
                </div>

                <div className="text-[10px] font-display font-semibold text-[#1b1b1e] bg-white/90 px-1.5 py-0.5 rounded border border-[#1b1b1e] self-start">
                  Linear Space O(N) · Contiguous Cache Line
                </div>
              </div>
              <p className="font-body text-xs text-[#4c4736] leading-relaxed">
                {plan.blueprintMemoryNotes ||
                  'Remember: Arrays guarantee contiguous address allocation. Look out for index out-of-bounds pitfalls in loop invariants.'}
              </p>
            </div>

            {/* Session Checklist */}
            <div className="w-full bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] p-5 flex flex-col gap-3">
              <span className="font-display text-xs uppercase text-[#4c4736] font-bold tracking-wider">
                Session Checklist
              </span>
              <div className="flex flex-col gap-2">
                {plan.sessionChecklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 bg-[#f6f2f7] hover:bg-[#f0edf1] rounded border border-[#1b1b1e] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-4 h-4 rounded border-2 border-[#1b1b1e] text-[#ffe169] accent-[#ffe169] focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`font-body text-xs text-[#1b1b1e] ${
                        item.done ? 'line-through text-[#4c4736]' : ''
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
