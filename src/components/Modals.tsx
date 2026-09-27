import React, { useState } from 'react';
import { StudyPlan } from '../types';
import { generatePlan } from '../lib/planner';

interface AdjustVelocityModalProps {
  plan: StudyPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: StudyPlan) => void;
}

export const AdjustVelocityModal: React.FC<AdjustVelocityModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSave,
}) => {
  const [hours, setHours] = useState(plan.dailyStudyHours);
  const [examDate, setExamDate] = useState(plan.examDate);

  if (!isOpen) return null;

  const handleApply = () => {
    // Regenerate plan with new velocity, preserving completion state of existing topics
    const topicNames = plan.topics.map((t) => t.name);
    const newPlan = generatePlan(plan.subject, topicNames, examDate, hours, plan.id);

    // Reapply completion marks
    const completedMap = new Map(plan.topics.map((t) => [t.id, t.completed]));
    newPlan.topics.forEach((t) => {
      if (completedMap.get(t.id)) {
        t.completed = true;
      }
    });

    onSave(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1b1b1e]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[6px_6px_0px_#1b1b1e] max-w-md w-full p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1b1b1e]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6f5d00] text-xl">tune</span>
            <h3 className="font-display font-bold text-lg text-[#1b1b1e]">
              Adjust Velocity &amp; Buffer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0edf1] text-[#1b1b1e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="font-display text-xs font-bold text-[#1b1b1e] block mb-1">
              Daily Study Hours
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1.5, 2, 3, 4, 5].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`py-2 text-xs font-display font-bold rounded border-2 border-[#1b1b1e] transition-all cursor-pointer ${
                    hours === h
                      ? 'bg-[#ffe169] text-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]'
                      : 'bg-[#f6f2f7] hover:bg-[#eae7eb]'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-display text-xs font-bold text-[#1b1b1e] block mb-1">
              Exam Deadline Target
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-white text-[#1b1b1e] font-body text-sm px-3 py-2 rounded-lg border-2 border-[#1b1b1e] focus:outline-none focus:ring-2 focus:ring-[#ffe169]"
            />
          </div>

          <div className="bg-[#f0edf1] p-3 rounded-lg border border-[#1b1b1e] text-xs font-display text-[#4c4736] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#416656]">verified</span>
            <span>Completed topic marks and progress will be preserved automatically.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cec6b0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-[#1b1b1e] border-2 border-[#1b1b1e] font-display text-xs font-semibold hover:bg-[#f0edf1] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-[#ffe169] text-[#1b1b1e] border-2 border-[#1b1b1e] font-display text-xs font-bold shadow-[2px_2px_0px_#1b1b1e] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

interface SubjectsModalProps {
  currentPlan: StudyPlan;
  allPlans: StudyPlan[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: StudyPlan) => void;
  onNewPlan: () => void;
}

export const SubjectsModal: React.FC<SubjectsModalProps> = ({
  currentPlan,
  allPlans,
  isOpen,
  onClose,
  onSelectPlan,
  onNewPlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1b1b1e]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[6px_6px_0px_#1b1b1e] max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1b1b1e]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6f5d00] text-xl">auto_stories</span>
            <h3 className="font-display font-bold text-lg text-[#1b1b1e]">Active Courses &amp; Decks</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0edf1] text-[#1b1b1e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {allPlans.length === 0 ? (
            <div className="p-4 bg-[#f6f2f7] rounded-lg border border-[#1b1b1e] text-center text-xs font-display">
              No saved subjects yet.
            </div>
          ) : (
            allPlans.map((p) => {
              const isActive = p.id === currentPlan.id;
              const doneCount = p.topics.filter((t) => t.completed).length;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPlan(p);
                    onClose();
                  }}
                  className={`p-3 rounded-lg border-2 border-[#1b1b1e] flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#ffe169]/40 shadow-[2px_2px_0px_#1b1b1e]'
                      : 'bg-white hover:bg-[#f6f2f7]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-display text-sm font-bold text-[#1b1b1e]">
                      {p.subject}
                    </span>
                    <span className="font-display text-[11px] text-[#4c4736]">
                      {p.topics.length} topics · {p.dailyStudyHours}h/day · Exam: {p.examDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white text-[#1b1b1e] text-xs font-display font-semibold border border-[#1b1b1e] rounded">
                      {doneCount}/{p.topics.length} done
                    </span>
                    {isActive && (
                      <span className="text-xs font-display font-bold text-[#416656]">Active</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#cec6b0]">
          <span className="text-xs font-display text-[#4c4736]">
            {allPlans.length} registered subject deck(s)
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNewPlan();
            }}
            className="px-4 py-2 bg-[#ffe169] text-[#1b1b1e] border-2 border-[#1b1b1e] font-display text-xs font-bold shadow-[2px_2px_0px_#1b1b1e] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Create New Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  plan: StudyPlan;
  isOpen: boolean;
  onClose: () => void;
  onResetPlan: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  plan,
  isOpen,
  onClose,
  onResetPlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1b1b1e]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border-2 border-[#1b1b1e] shadow-[6px_6px_0px_#1b1b1e] max-w-md w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1b1b1e]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6f5d00] text-xl">settings</span>
            <h3 className="font-display font-bold text-lg text-[#1b1b1e]">Planner Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0edf1] text-[#1b1b1e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 font-display text-xs">
          <div className="p-3 bg-[#f6f2f7] rounded-lg border border-[#1b1b1e] flex flex-col gap-1">
            <span className="text-[#4c4736] font-bold">Plan Configuration</span>
            <div className="text-[#1b1b1e] flex justify-between">
              <span>Active Course:</span>
              <strong>{plan.subject}</strong>
            </div>
            <div className="text-[#1b1b1e] flex justify-between">
              <span>Target Exam Date:</span>
              <strong>{plan.examDate}</strong>
            </div>
            <div className="text-[#1b1b1e] flex justify-between">
              <span>Daily Allocation:</span>
              <strong>{plan.dailyStudyHours} hours/day</strong>
            </div>
          </div>

          <div className="p-3 bg-[#f6f2f7] rounded-lg border border-[#1b1b1e] flex flex-col gap-1">
            <span className="text-[#4c4736] font-bold">Local Persistence</span>
            <p className="font-body text-xs text-[#4c4736]">
              All syllabus schedules, task completion marks, and progress survive page refreshes and browser reboots in your current device cache.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset to the default academic curriculum?')) {
                onResetPlan();
                onClose();
              }
            }}
            className="w-full py-2 bg-[#ffdad6] text-[#93000a] font-display text-xs font-bold rounded border border-[#1b1b1e] hover:bg-[#ffb4ab] transition-all cursor-pointer"
          >
            Reset to Default Syllabus Example
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#cec6b0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#ffe169] text-[#1b1b1e] border-2 border-[#1b1b1e] font-display text-xs font-bold shadow-[2px_2px_0px_#1b1b1e] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
