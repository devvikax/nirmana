import React, { useState } from 'react';
import { StudyPlan } from '../types';

interface WeeklyRoadmapProps {
  plan: StudyPlan;
  onUpdatePlan: (updated: StudyPlan) => void;
  onResumeStudy: () => void;
  onAdjustVelocity: () => void;
}

export const WeeklyRoadmap: React.FC<WeeklyRoadmapProps> = ({
  plan,
  onUpdatePlan,
  onResumeStudy,
  onAdjustVelocity,
}) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // Group days into 7-day chunks (weeks)
  const totalDays = plan.days.length;
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
  const weekDays = plan.days.slice(currentWeekIndex * 7, (currentWeekIndex + 1) * 7);

  // Pad to 7 days if the last week has fewer days
  const paddedDays = [...weekDays];
  while (paddedDays.length < 7 && paddedDays.length > 0) {
    const lastDay = paddedDays[paddedDays.length - 1];
    const nextDate = new Date(lastDay.date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    paddedDays.push({
      dayNumber: paddedDays.length + 1,
      date: nextDate.toISOString().split('T')[0],
      dayOfWeek: dayNames[nextDate.getDay()],
      displayDate: `${nextDate.getDate().toString().padStart(2, '0')} ${monthNames[nextDate.getMonth()]}`,
      fullDisplayDate: `${nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
      isToday: false,
      isReviewDay: nextDate.getDay() === 0,
      targetHours: plan.dailyStudyHours,
      blocks: [
        {
          id: `pad-${paddedDays.length}-1`,
          topicId: 'pad-top',
          title: nextDate.getDay() === 0 ? 'Weekly Consolidation & Review' : 'Focused Deep Work Block',
          subtitle: 'Active recall and retention verification',
          durationMinutes: 45,
          scheduledTimeStr: '09:00 AM',
          status: 'scheduled',
          type: nextDate.getDay() === 0 ? 'revision' : 'learning',
          badge: nextDate.getDay() === 0 ? 'Review Day' : 'Upcoming',
        },
      ],
      summary: 'Buffer day for retention',
    });
  }

  // Weekly metrics calculation
  const totalWeekHours = weekDays.reduce((acc, d) => acc + d.targetHours, 0) || Math.round(plan.dailyStudyHours * 7);
  const todaySchedule = plan.days.find((d) => d.isToday) || plan.days[0];
  const todayDoneBlocks = todaySchedule?.blocks.filter((b) => b.status === 'completed').length || 0;
  const todayTotalBlocks = todaySchedule?.blocks.length || 4;

  const totalTopicsCount = plan.topics.length;
  const completedTopicsCount = plan.topics.filter((t) => t.completed).length;
  const completionPercent = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // Toggle item completion directly from roadmap
  const handleToggleRoadmapBlock = (dayIndex: number, blockIndex: number) => {
    const targetDay = paddedDays[dayIndex];
    if (!targetDay) return;

    const targetBlock = targetDay.blocks[blockIndex];
    if (!targetBlock) return;

    const newStatus: 'completed' | 'scheduled' =
      targetBlock.status === 'completed' ? 'scheduled' : 'completed';

    const updatedDays = plan.days.map((d) => {
      if (d.dayNumber === targetDay.dayNumber) {
        const newBlocks = d.blocks.map((b, idx) => {
          if (idx === blockIndex) {
            return {
              ...b,
              status: newStatus,
              badge: newStatus === 'completed' ? 'Completed' : b.badge,
            };
          }
          return b;
        });
        return { ...d, blocks: newBlocks };
      }
      return d;
    });

    // Update topic if matched
    const updatedTopics = plan.topics.map((t) => {
      if (t.id === targetBlock.topicId) {
        return {
          ...t,
          completed: newStatus === 'completed',
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    onUpdatePlan({
      ...plan,
      topics: updatedTopics,
      days: updatedDays,
    });
  };

  // Export schedule handler
  const handleExportSchedule = () => {
    const textData = `SYLLABUS PLAN: ${plan.subject}\nTarget Exam: ${plan.examDate}\nDaily Commitment: ${plan.dailyStudyHours} hrs/day\n\nWEEKLY SCHEDULE:\n` +
      plan.days.map((d) => `${d.dayOfWeek} ${d.displayDate}: ${d.blocks.map((b) => b.title).join(' | ')}`).join('\n');

    navigator.clipboard.writeText(textData);
    alert('Study schedule outline copied to clipboard in markdown format!');
  };

  return (
    <div className="w-full bg-[#fbf8fc] text-[#1b1b1e] pt-16 pb-16 min-h-screen">
      {/* Interactive Top Action & Breadcrumb Strip */}
      <section className="w-full bg-[#f6f2f7] px-4 md:px-6 py-3 border-b-2 border-[#1b1b1e]">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-xs uppercase tracking-wider text-[#4c4736] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">school</span>
              {plan.courseCode}
            </span>
            <span className="text-[#4c4736] font-display text-xs">/</span>
            <span className="font-display text-xs bg-[#ffe169] text-[#1b1b1e] px-2 py-0.5 rounded border border-[#1b1b1e] font-semibold">
              {plan.subject}
            </span>
            <span className="text-[#4c4736] font-display text-xs">•</span>
            <span className="font-display text-xs text-[#1b1b1e] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#416656]">date_range</span>
              {plan.academicTerm}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded border border-[#1b1b1e] p-1 shadow-[2px_2px_0px_#1b1b1e]">
              <button
                disabled={currentWeekIndex === 0}
                onClick={() => setCurrentWeekIndex((prev) => Math.max(0, prev - 1))}
                className="px-2 py-0.5 font-display text-xs rounded hover:bg-[#f0edf1] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-0.5 cursor-pointer"
                title="Previous Week"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                Prev
              </button>
              <span className="px-2 font-display text-xs text-[#1b1b1e] font-bold">
                Week 0{currentWeekIndex + 1}
              </span>
              <button
                disabled={currentWeekIndex + 1 >= totalWeeks}
                onClick={() => setCurrentWeekIndex((prev) => Math.min(totalWeeks - 1, prev + 1))}
                className="px-2 py-0.5 font-display text-xs rounded hover:bg-[#f0edf1] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-0.5 cursor-pointer"
                title="Next Week"
              >
                Next
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            <button
              onClick={onAdjustVelocity}
              className="bg-white text-[#1b1b1e] font-display text-xs font-semibold px-3 py-1.5 rounded border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1b1b1e] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Adjust Velocity
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Hero Section */}
      <section className="w-full bg-[#fbf8fc] px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Main Title & Context */}
            <div className="lg:col-span-8 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 self-start bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e] px-3 py-1 rounded shadow-[2px_2px_0px_#1b1b1e]">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span className="font-display text-xs uppercase font-bold tracking-wider">
                  ⚡ On Pace to finish syllabus {plan.bufferDays} days before {plan.examDate} Exam
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1b1b1e] tracking-tight mt-1">
                Weekly Study Roadmap
              </h1>
              <p className="font-body text-sm sm:text-base text-[#4c4736] flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#1b1b1e]">
                  Week {currentWeekIndex + 1} of {totalWeeks}
                </span>
                <span>
                  ({paddedDays[0]?.displayDate} – {paddedDays[6]?.displayDate})
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7d7764]"></span>
                <span className="font-medium text-[#1b1b1e]">
                  {totalWeekHours} scheduled study hours
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7d7764]"></span>
                <span className="text-[#416656] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {todayDoneBlocks}/{todayTotalBlocks} Modules Complete Today
                </span>
              </p>
            </div>

            {/* Weekly Macro Metric Widget */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <div className="bg-white p-4 rounded-lg border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display text-xs uppercase font-bold text-[#1b1b1e]">
                    Weekly Milestone Velocity
                  </span>
                  <span className="font-display text-lg font-bold text-[#6f5d00]">
                    {completionPercent}%
                  </span>
                </div>

                {/* Segmented tactile progress bar (7 units) */}
                <div className="grid grid-cols-7 gap-1 h-3.5 bg-[#f0edf1] p-0.5 rounded border border-[#1b1b1e]">
                  {paddedDays.map((d, i) => {
                    const hasCompleted = d.blocks.some((b) => b.status === 'completed');
                    return (
                      <div
                        key={i}
                        className={`h-full rounded-xs transition-colors ${
                          hasCompleted ? 'bg-[#416656]' : 'bg-white'
                        }`}
                        title={`${d.dayOfWeek}: ${hasCompleted ? 'Active/Done' : 'Scheduled'}`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-2 text-[#4c4736] font-display text-xs">
                  <span>Goal: 4 Modules / 7 Days</span>
                  <span className="text-[#1b1b1e] font-semibold">
                    {plan.dailyStudyHours.toFixed(1)} hrs/day avg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Status Legend Filter Strip */}
          <div className="mt-6 pt-4 border-t-2 border-[#e4e1e6] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display text-xs uppercase text-[#4c4736] font-bold mr-1">
                Rhythm Status:
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#c3ecd7] border border-[#1b1b1e] rounded shadow-[1px_1px_0px_#1b1b1e]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#416656] border border-[#1b1b1e]"></span>
                <span className="font-display text-xs font-semibold text-[#002115]">
                  Completed Block
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ffe169] border border-[#1b1b1e] rounded shadow-[1px_1px_0px_#1b1b1e]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6f5d00] border border-[#1b1b1e]"></span>
                <span className="font-display text-xs font-semibold text-[#1b1b1e]">
                  Active Today
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#1b1b1e] rounded shadow-[1px_1px_0px_#1b1b1e]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e4e1e6] border border-[#1b1b1e]"></span>
                <span className="font-display text-xs font-semibold text-[#1b1b1e]">
                  Upcoming Scheduled
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-display text-xs text-[#4c4736] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Auto-adjusted daily at 23:59
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Day Sequential Rhythm Grid */}
      <section className="w-full bg-[#fbf8fc] px-4 md:px-6 pb-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-start">
            {paddedDays.map((day, dayIdx) => {
              const isToday = day.isToday;
              const isSunday = day.isReviewDay;
              const dayDoneCount = day.blocks.filter((b) => b.status === 'completed').length;
              const dayTotalCount = day.blocks.length;

              if (isToday) {
                // MONDAY / ACTIVE TODAY HERO CARD
                return (
                  <article
                    key={day.dayNumber}
                    className="lg:col-span-1 bg-white border-2 border-[#1b1b1e] rounded-lg shadow-[4px_4px_0px_#1b1b1e] relative overflow-hidden flex flex-col transition-all hover:-translate-y-0.5"
                  >
                    {/* Active Highlight Ribbon */}
                    <div className="bg-[#ffe169] px-3 py-2.5 border-b-2 border-[#1b1b1e] flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-bold text-[#1b1b1e]">
                          {day.dayOfWeek}
                        </span>
                        <span className="px-2 py-0.5 bg-white text-[#1b1b1e] border border-[#1b1b1e] rounded font-display text-xs font-bold">
                          {day.displayDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="inline-flex items-center gap-1 font-display text-[10px] font-extrabold uppercase tracking-wide text-[#766300] bg-white/90 px-1.5 py-0.5 rounded border border-[#1b1b1e]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6f5d00] animate-pulse"></span>
                          Today
                        </span>
                        <span className="font-display text-xs font-semibold text-[#1b1b1e]">
                          {day.targetHours} hrs total
                        </span>
                      </div>
                    </div>

                    {/* Body Card Content */}
                    <div className="p-3 flex flex-col gap-3 flex-grow">
                      {/* Progress Pill */}
                      <div className="bg-[#c3ecd7]/60 border border-[#1b1b1e] rounded p-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-[#416656]">
                            hourglass_bottom
                          </span>
                          <span className="font-display text-xs font-bold text-[#1b1b1e]">
                            In Progress
                          </span>
                        </div>
                        <span className="font-display text-[11px] px-1.5 bg-white border border-[#1b1b1e] rounded font-bold">
                          {dayDoneCount} / {dayTotalCount} done
                        </span>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="w-full bg-[#e4e1e6] h-2 rounded border border-[#1b1b1e] overflow-hidden">
                        <div
                          className="bg-[#416656] h-full transition-all"
                          style={{
                            width: dayTotalCount > 0 ? `${(dayDoneCount / dayTotalCount) * 100}%` : '25%',
                          }}
                        />
                      </div>

                      {/* Focus Sub-topics Checklist */}
                      <div className="flex flex-col gap-2 mt-1">
                        {day.blocks.map((b, bIdx) => {
                          const isBlockDone = b.status === 'completed';
                          const isBlockActive = b.status === 'in_session';

                          return (
                            <div
                              key={b.id}
                              onClick={() => handleToggleRoadmapBlock(dayIdx, bIdx)}
                              className={`group flex items-start gap-2 p-2 border rounded cursor-pointer transition-all ${
                                isBlockDone
                                  ? 'bg-[#c3ecd7]/30 border-[#1b1b1e] shadow-[1px_1px_0px_#1b1b1e]'
                                  : isBlockActive
                                  ? 'bg-[#ffe169]/30 border-2 border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]'
                                  : 'bg-white border-[#1b1b1e] hover:bg-[#f6f2f7]'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 mt-0.5 rounded-xs flex items-center justify-center border border-[#1b1b1e] shrink-0 ${
                                  isBlockDone
                                    ? 'bg-[#416656] text-white'
                                    : isBlockActive
                                    ? 'bg-white'
                                    : 'bg-white'
                                }`}
                              >
                                {isBlockDone && (
                                  <span className="material-symbols-outlined text-[12px] font-bold">
                                    check
                                  </span>
                                )}
                                {isBlockActive && !isBlockDone && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#6f5d00]"></span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span
                                  className={`font-body text-xs font-semibold truncate ${
                                    isBlockDone ? 'line-through text-[#4c4736]' : 'text-[#1b1b1e]'
                                  }`}
                                >
                                  {b.title}
                                </span>
                                <span className="font-display text-[10px] text-[#4c4736]">
                                  {b.durationMinutes} min · {isBlockDone ? 'Completed' : b.badge || 'Scheduled'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Immediate Action Button */}
                      <button
                        type="button"
                        onClick={onResumeStudy}
                        className="mt-2 w-full bg-[#ffe169] text-[#1b1b1e] font-display text-xs uppercase font-bold py-2 px-2 rounded border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1b1b1e] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        Resume Study
                      </button>
                    </div>
                  </article>
                );
              }

              if (isSunday) {
                // SUNDAY CONSOLIDATION / REVIEW DAY
                return (
                  <article
                    key={day.dayNumber}
                    className="lg:col-span-1 bg-[#f6f2f7] border-2 border-[#1b1b1e] rounded-lg shadow-[3px_3px_0px_#1b1b1e] flex flex-col transition-all hover:-translate-y-0.5"
                  >
                    <div className="bg-[#dee2ef] px-3 py-2.5 border-b-2 border-[#1b1b1e] flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-bold text-[#1b1b1e]">
                          {day.dayOfWeek}
                        </span>
                        <span className="px-2 py-0.5 bg-white text-[#1b1b1e] border border-[#1b1b1e] rounded font-display text-xs font-medium">
                          {day.displayDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-display text-xs font-bold text-[#1b1b1e]">
                          Consolidation
                        </span>
                        <span className="font-display text-xs font-bold text-[#1b1b1e]">
                          {day.targetHours} hrs
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-3 flex-grow">
                      {/* Review Day Status Pill */}
                      <div className="bg-white border border-[#1b1b1e] rounded px-2 py-1 flex items-center justify-between shadow-xs">
                        <span className="font-display text-xs font-bold text-[#1b1b1e] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#6f5d00]">
                            auto_mode
                          </span>
                          Review Day
                        </span>
                        <span className="font-display text-[11px] text-[#1b1b1e] font-semibold">
                          {day.targetHours} hours
                        </span>
                      </div>

                      {/* Topics List */}
                      <div className="flex flex-col gap-2 mt-1">
                        {day.blocks.map((b, bIdx) => (
                          <div
                            key={b.id}
                            onClick={() => handleToggleRoadmapBlock(dayIdx, bIdx)}
                            className="p-2 bg-white border border-[#1b1b1e] rounded shadow-xs cursor-pointer hover:bg-[#ffe169]/20 transition-colors"
                          >
                            <div className="font-body text-xs font-bold text-[#1b1b1e] leading-tight">
                              {b.title}
                            </div>
                            <div className="font-display text-[10px] text-[#4c4736] mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">quiz</span>
                              {b.durationMinutes} min · {b.subtitle || 'Practice Problem Set'}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-2 border-t border-[#e4e1e6] flex items-center justify-between text-[#4c4736] font-display text-xs">
                        <span className="flex items-center gap-1 font-semibold text-[#1b1b1e]">
                          <span className="material-symbols-outlined text-[14px] text-[#416656]">
                            trending_up
                          </span>
                          Week {currentWeekIndex + 1} Wrap-up
                        </span>
                      </div>
                    </div>
                  </article>
                );
              }

              // REGULAR SCHEDULED DAYS (TUE, WED, THU, FRI, SAT)
              return (
                <article
                  key={day.dayNumber}
                  className="lg:col-span-1 bg-white border-2 border-[#1b1b1e] rounded-lg shadow-[3px_3px_0px_#1b1b1e] flex flex-col transition-all hover:-translate-y-0.5"
                >
                  <div className="bg-[#f0edf1] px-3 py-2.5 border-b-2 border-[#1b1b1e] flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-bold text-[#1b1b1e]">
                        {day.dayOfWeek}
                      </span>
                      <span className="px-2 py-0.5 bg-white text-[#1b1b1e] border border-[#1b1b1e] rounded font-display text-xs font-medium">
                        {day.displayDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-display text-xs text-[#4c4736] font-medium">
                        Scheduled
                      </span>
                      <span className="font-display text-xs font-bold text-[#1b1b1e]">
                        {day.targetHours} hrs
                      </span>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col gap-3 flex-grow">
                    {/* Status Badge */}
                    <div className="bg-[#f6f2f7] border border-[#1b1b1e] rounded px-2 py-1 flex items-center justify-between">
                      <span className="font-display text-xs font-bold text-[#1b1b1e] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#5a5e69]">
                          schedule
                        </span>
                        Upcoming
                      </span>
                      <span className="font-display text-[11px] text-[#4c4736]">
                        {day.targetHours} hours
                      </span>
                    </div>

                    {/* Topics List */}
                    <div className="flex flex-col gap-2 mt-1">
                      {day.blocks.map((b, bIdx) => (
                        <div
                          key={b.id}
                          onClick={() => handleToggleRoadmapBlock(dayIdx, bIdx)}
                          className="p-2 bg-[#f6f2f7] border border-[#1b1b1e] rounded hover:bg-[#ffe169]/30 transition-colors cursor-pointer"
                        >
                          <div className="font-body text-xs font-semibold text-[#1b1b1e] leading-tight">
                            {b.title}
                          </div>
                          <div className="font-display text-[10px] text-[#4c4736] mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">timer</span>
                            {b.durationMinutes} min · {b.weightTag || 'Core Concept'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-2 border-t border-[#e4e1e6] flex items-center justify-between text-[#4c4736] font-display text-xs">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">assignment</span>
                        {day.blocks.length} problem sets
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Secondary Workstation: Resource & Velocity Insights */}
      <section className="w-full bg-[#f6f2f7] px-4 md:px-6 py-8 border-t-2 border-[#1b1b1e]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Academic Reference Block (Left Bento Card - 5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-lg border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xs uppercase font-bold tracking-wider text-[#4c4736]">
                  Curated Textbooks &amp; Problem Sets
                </span>
                <span className="font-display text-[10px] px-2 py-0.5 bg-[#dee2ef] rounded border border-[#1b1b1e] font-semibold">
                  Core Stack
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1b1b1e] mb-1.5">
                Primary Academic References
              </h3>
              <p className="font-body text-xs text-[#4c4736] mb-4">
                All 7 daily rhythms draw directly from algorithmic problem banks calibrated for the upcoming exam milestone.
              </p>

              <div className="flex flex-col gap-2">
                {plan.academicReferences.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-2.5 bg-[#fbf8fc] rounded border-l-4 border-l-[#1b1b1e] border border-[#cec6b0] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold bg-[#ffe169] text-[#1b1b1e] px-1.5 py-0.5 rounded border border-[#1b1b1e]">
                        {ref.index}
                      </span>
                      <span className="font-body text-xs font-semibold text-[#1b1b1e]">
                        {ref.title}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#416656]">
                      done_all
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e4e1e6] flex items-center justify-between">
              <span className="font-display text-xs text-[#4c4736] font-medium">
                Sync with Notion &amp; iCal Workspace
              </span>
              <button
                type="button"
                onClick={handleExportSchedule}
                className="font-display text-xs uppercase font-bold text-[#1b1b1e] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Export Schedule
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Velocity Burndown & Contingency Buffer (Right Bento Card - 7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-lg border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xs uppercase font-bold tracking-wider text-[#4c4736]">
                  Pacing Calculation &amp; Exam Margin
                </span>
                <span className="font-display text-xs px-2 py-0.5 bg-[#c3ecd7] text-[#002115] rounded border border-[#1b1b1e] font-bold">
                  {plan.bufferDays}.0 Days Safety Buffer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-[#fbf8fc] p-3 rounded border border-[#1b1b1e]">
                  <span className="font-display text-[10px] uppercase text-[#4c4736] font-medium">
                    Daily Target
                  </span>
                  <div className="font-display text-xl font-bold text-[#1b1b1e] mt-0.5">
                    {plan.dailyStudyHours.toFixed(1)} hrs
                  </div>
                  <span className="font-display text-[11px] text-[#416656] font-medium">
                    Within optimal focus zone
                  </span>
                </div>

                <div className="bg-[#fbf8fc] p-3 rounded border border-[#1b1b1e]">
                  <span className="font-display text-[10px] uppercase text-[#4c4736] font-medium">
                    Week Target
                  </span>
                  <div className="font-display text-xl font-bold text-[#1b1b1e] mt-0.5">
                    {totalWeekHours}.0 hrs
                  </div>
                  <span className="font-display text-[11px] text-[#4c4736] font-medium">
                    3 of 7 days intense
                  </span>
                </div>

                <div className="bg-[#fbf8fc] p-3 rounded border border-[#1b1b1e]">
                  <span className="font-display text-[10px] uppercase text-[#4c4736] font-medium">
                    Exam Date
                  </span>
                  <div className="font-display text-xl font-bold text-[#6f5d00] mt-0.5">
                    {plan.examDate.slice(5)}
                  </div>
                  <span className="font-display text-[11px] text-[#416656] font-bold">
                    Finishes on target
                  </span>
                </div>
              </div>

              {/* Estimated vs Actual Hours Trajectory SVG Chart */}
              <div className="w-full bg-[#f6f2f7] p-3.5 rounded border border-[#1b1b1e] flex flex-col gap-2">
                <div className="flex items-center justify-between font-display text-xs">
                  <span className="font-bold text-[#1b1b1e]">
                    Estimated vs Actual Hours Trajectory
                  </span>
                  <span className="text-[#4c4736]">
                    Week {currentWeekIndex + 1} of {totalWeeks}
                  </span>
                </div>

                <svg
                  className="w-full h-16 text-[#1b1b1e]"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 600 70"
                >
                  {/* Target Trajectory (Dashed) */}
                  <line
                    opacity="0.35"
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                    x1="20"
                    x2="580"
                    y1="60"
                    y2="12"
                  />
                  {/* Active Progress Actual Curve */}
                  <path
                    d="M 20 60 Q 70 56, 110 50"
                    fill="none"
                    stroke="#416656"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                  <circle cx="110" cy="50" fill="#ffe169" r="4" stroke="#1b1b1e" strokeWidth="2" />
                  <circle cx="20" cy="60" fill="#1b1b1e" r="3" />
                  <circle cx="200" cy="43" fill="#cec6b0" r="3" />
                  <circle cx="295" cy="35" fill="#cec6b0" r="3" />
                  <circle cx="390" cy="27" fill="#cec6b0" r="3" />
                  <circle cx="485" cy="20" fill="#cec6b0" r="3" />
                  <circle cx="580" cy="12" fill="#6f5d00" r="3" />
                </svg>

                <div className="flex justify-between font-display text-[10px] text-[#4c4736] px-1">
                  {paddedDays.map((d, i) => (
                    <span key={i} className={i === 6 ? 'font-bold text-[#1b1b1e]' : ''}>
                      {d.dayOfWeek} {d.displayDate.slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-body text-xs text-[#4c4736]">
                Pacing engine detects <strong className="text-[#1b1b1e]">zero schedule debt</strong>. Steady rhythm holds through Week {currentWeekIndex + 2}.
              </p>
              <button
                type="button"
                onClick={onAdjustVelocity}
                className="bg-[#f0edf1] text-[#1b1b1e] font-display text-xs uppercase font-bold px-3 py-1.5 rounded border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1b1b1e] transition-all cursor-pointer"
              >
                Reschedule Buffer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#fbf8fc] border-t-2 border-[#1b1b1e] py-6 px-4 md:px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[#4c4736] font-display text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#416656]"></span>
            <span>SyllabusPlan Editorial System • Active Term</span>
          </div>
          <span>© 2026 SyllabusPlan. Focused Academic Engine.</span>
        </div>
      </footer>
    </div>
  );
};
