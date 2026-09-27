import React, { useEffect, useState } from 'react';
import { StudyPlan } from '../types';

interface SynthesisViewProps {
  plan: StudyPlan;
  onComplete: () => void;
}

export const SynthesisView: React.FC<SynthesisViewProps> = ({ plan, onComplete }) => {
  const [elapsed, setElapsed] = useState(0.0);
  const [phase, setPhase] = useState(1);
  const [progress, setProgress] = useState(25);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const diffSec = (now - startTime) / 1000;
      setElapsed(diffSec);

      if (diffSec < 0.6) {
        setPhase(1);
        setProgress(28);
      } else if (diffSec < 1.4) {
        setPhase(2);
        setProgress(52);
      } else if (diffSec < 2.2) {
        setPhase(3);
        setProgress(78);
      } else if (diffSec < 3.0) {
        setPhase(4);
        setProgress(94);
      } else {
        setPhase(5);
        setProgress(100);
        setIsDone(true);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const radius = 19;
  const circumference = 2 * Math.PI * radius; // ~119.38
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <div className="w-full min-h-screen bg-[#fbf8fc] text-[#1b1b1e] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6">
        {/* Top System Telemetry Bar */}
        <div className="w-full flex items-center justify-between mb-4 text-[#4c4736] font-display text-xs uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#416656] animate-ping"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#416656] -ml-2"></span>
            <span>Neural Engine · Model v4.2 Synth</span>
          </div>
          <div className="flex items-center gap-2 font-display text-xs">
            <span className="text-[#4c4736]">Session ID:</span>
            <span className="bg-[#f0edf1] px-2 py-0.5 rounded text-[#1b1b1e] border border-[#1b1b1e] font-mono">
              #{plan.courseCode}-{plan.id.slice(-4)}
            </span>
          </div>
        </div>

        {/* Main Neo-Brutalist Synthesis Card */}
        <div className="w-full bg-white rounded-xl shadow-[6px_6px_0px_#1b1b1e] border-2 border-[#1b1b1e] p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
          {/* Subtle Decorative Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6f5d00] via-[#ffe169] to-[#416656]"></div>

          {/* Card Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#ffe169] text-[#1b1b1e] font-display text-xs tracking-wide uppercase border border-[#1b1b1e] shadow-xs animate-pulse">
                  <span
                    className="material-symbols-outlined text-sm leading-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    settings_suggest
                  </span>
                  Synthesizing Curriculum
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#c3ecd7] text-[#002115] font-display text-xs border border-[#1b1b1e]">
                  <span className="material-symbols-outlined text-xs">tune</span>
                  Auto-Adaptive
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl text-[#1b1b1e] font-bold tracking-tight mt-1">
                Generating your day-by-day study roadmap...
              </h1>
              <p className="font-body text-sm text-[#4c4736]">
                Balancing prerequisite mastery with deliberate spaced repetition to prevent exam fatigue.
              </p>
            </div>

            {/* Real-time Progress Ring & Percentage */}
            <div className="flex items-center gap-3 bg-[#f6f2f7] px-4 py-3 rounded-lg border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] self-start md:self-auto shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    className="text-[#e4e1e6]"
                    cx="24"
                    cy="24"
                    fill="transparent"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="text-[#6f5d00] transition-all duration-300 ease-out"
                    cx="24"
                    cy="24"
                    fill="transparent"
                    r={radius}
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
                <span className="absolute font-display text-xs text-[#1b1b1e] font-bold">
                  {progress}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[10px] text-[#4c4736] uppercase tracking-wider">
                  Phase {Math.min(5, phase)} of 5
                </span>
                <span className="font-display text-sm font-semibold text-[#1b1b1e]">
                  00:0{elapsed.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>

          {/* Segmented Block Bar Progress Track */}
          <div className="w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-display text-xs text-[#4c4736]">
              <span>PIPELINE EXECUTION STATE</span>
              <span className="text-[#416656] font-semibold">
                {isDone ? 'Synthesis Complete' : 'Est. 1.2s remaining'}
              </span>
            </div>
            <div className="w-full grid grid-cols-4 gap-2 h-3">
              <div className="bg-[#c3ecd7] h-full rounded-sm border border-[#1b1b1e]"></div>
              <div
                className={`h-full rounded-sm border border-[#1b1b1e] transition-all ${
                  phase >= 2 ? 'bg-[#c3ecd7]' : 'bg-[#e4e1e6]'
                }`}
              ></div>
              <div
                className={`h-full rounded-sm border border-[#1b1b1e] transition-all ${
                  phase >= 3 ? 'bg-[#c3ecd7]' : 'bg-[#e4e1e6]'
                }`}
              ></div>
              <div
                className={`h-full rounded-sm border border-[#1b1b1e] transition-all relative overflow-hidden ${
                  phase >= 4 ? 'bg-[#ffe169]' : 'bg-[#e4e1e6]'
                }`}
              >
                {!isDone && phase >= 4 && (
                  <div className="absolute inset-0 bg-[#6f5d00] opacity-20 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Step-by-Step Live Processing Checklist */}
          <div className="flex flex-col gap-3">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#f6f2f7] border border-[#1b1b1e] shadow-xs">
              <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e]">
                <span
                  className="material-symbols-outlined text-base font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-semibold text-sm text-[#1b1b1e]">
                    Reading syllabus topics
                  </span>
                  <span className="px-2 py-0.5 rounded font-display text-[11px] bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e] shrink-0">
                    Done · 0.4s
                  </span>
                </div>
                <p className="font-body text-xs text-[#4c4736] mt-0.5">
                  {plan.topics.length} core topics detected:{' '}
                  {plan.topics.slice(0, 7).map((t) => t.name).join(', ')}
                  {plan.topics.length > 7 ? '...' : '.'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-start gap-4 p-4 rounded-lg border border-[#1b1b1e] transition-all ${
                phase >= 2 ? 'bg-[#f6f2f7]' : 'bg-white opacity-60'
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e]">
                <span
                  className="material-symbols-outlined text-base font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-semibold text-sm text-[#1b1b1e]">
                    Organizing prerequisite hierarchy
                  </span>
                  <span className="px-2 py-0.5 rounded font-display text-[11px] bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e] shrink-0">
                    Done · 0.9s
                  </span>
                </div>
                <p className="font-body text-xs text-[#4c4736] mt-0.5">
                  Created dependency graph. Mapped fundamental principles prior to advanced application units.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`flex items-start gap-4 p-4 rounded-lg border border-[#1b1b1e] transition-all ${
                phase >= 3 ? 'bg-[#f6f2f7]' : 'bg-white opacity-60'
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e]">
                <span
                  className="material-symbols-outlined text-base font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-semibold text-sm text-[#1b1b1e]">
                    Calculating available study days
                  </span>
                  <span className="px-2 py-0.5 rounded font-display text-[11px] bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e] shrink-0">
                    Done · 1.1s
                  </span>
                </div>
                <p className="font-body text-xs text-[#4c4736] mt-0.5">
                  Accounted for {plan.availableDays} calendar days through {plan.examDate}. Reserved {plan.bufferDays} buffer days for mock problem sets.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div
              className={`flex items-start gap-4 p-4 rounded-lg border-2 border-[#1b1b1e] relative overflow-hidden transition-all shadow-[2px_2px_0px_#1b1b1e] ${
                isDone ? 'bg-[#f6f2f7]' : 'bg-[#f0edf1]'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6f5d00]"></div>
              <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded bg-[#ffe169] text-[#1b1b1e] border border-[#1b1b1e]">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isDone ? 'check' : 'bolt'}
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-semibold text-sm text-[#1b1b1e] flex items-center gap-2">
                    Assembling prioritized daily schedule blocks
                    {!isDone && <span className="inline-flex w-2 h-2 rounded-full bg-[#6f5d00] animate-ping"></span>}
                  </span>
                  <span className="px-2 py-0.5 rounded font-display text-[11px] bg-[#ffe169] text-[#1b1b1e] font-semibold border border-[#1b1b1e] shrink-0">
                    {isDone ? 'Done' : 'In Progress'}
                  </span>
                </div>
                <p className="font-body text-xs text-[#4c4736] mt-0.5">
                  Calibrating active recall windows, pomodoro checkpoints, and weekly retention review checkpoints...
                </p>

                {/* Inline Micro Metric Ticker */}
                <div className="mt-3 flex items-center gap-4 flex-wrap font-display text-xs bg-white p-2.5 rounded border border-[#1b1b1e]">
                  <div className="flex items-center gap-1.5 text-[#1b1b1e]">
                    <span className="material-symbols-outlined text-sm text-[#416656]">view_timeline</span>
                    <span>
                      Intervals: <strong>{plan.days.reduce((acc, d) => acc + d.blocks.length, 0)} Blocks</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1b1b1e]">
                    <span className="material-symbols-outlined text-sm text-[#6f5d00]">psychology</span>
                    <span>
                      Spaced Repetition: <strong>Leitner Box-3</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1b1b1e]">
                    <span className="material-symbols-outlined text-sm text-[#5a5e69]">history_toggle_off</span>
                    <span>
                      Rest Ratio: <strong>15m / 90m</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Pacing Summary Banner */}
          <div className="w-full bg-[#f0edf1] rounded-lg p-4 border border-[#1b1b1e] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded bg-[#416656] text-white flex items-center justify-center shrink-0 border border-[#1b1b1e]">
                <span className="material-symbols-outlined text-lg">event_available</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-display text-[10px] text-[#4c4736] uppercase tracking-wider">
                  Pacing Allocation Profile
                </span>
                <span className="font-body text-xs sm:text-sm text-[#1b1b1e] font-semibold truncate">
                  Allocating {plan.dailyStudyHours.toFixed(1)}h/day for {plan.subject} · Target: {plan.examDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="px-2.5 py-1 rounded bg-white text-[#1b1b1e] font-display text-xs border border-[#1b1b1e] font-bold shadow-xs">
                {plan.totalStudyHours}h Total Capacity
              </span>
            </div>
          </div>

          {/* Interactive Preview & CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#cec6b0]">
            <div className="flex items-center gap-2 text-[#4c4736] font-body text-xs">
              <span className="material-symbols-outlined text-base text-[#416656]">verified_user</span>
              <span>Adaptive rescheduling available anytime during your term.</span>
            </div>
            <button
              type="button"
              onClick={onComplete}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ffe169] text-[#1b1b1e] font-display text-sm font-bold uppercase rounded-lg border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] hover:shadow-[4px_4px_0px_#1b1b1e] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all cursor-pointer"
            >
              <span>Continue to Plan</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* System Annotation Footer */}
        <div className="w-full mt-4 flex items-center justify-between text-[#4c4736] font-display text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>Curriculum schema validated against academic domain guidelines</span>
          </div>
          <div className="flex items-center gap-1 hover:text-[#1b1b1e]">
            <span>Session ID: #{plan.courseCode}-{plan.id.slice(-4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
