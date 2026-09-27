import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onNewPlan: () => void;
  onOpenSubjects?: () => void;
  onOpenSettings?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onNewPlan,
  onOpenSubjects,
  onOpenSettings,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf8fc] border-b-2 border-[#1b1b1e]">
      <div className="h-16 max-w-[1280px] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-8 h-8 bg-[#ffe169] text-[#1b1b1e] flex items-center justify-center font-display font-bold text-lg border-2 border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight text-[#1b1b1e] leading-none">
              SyllabusPlan
            </span>
          </div>
        </button>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onNavigate('plan')}
            aria-current={currentView === 'plan' ? 'page' : undefined}
            className={`font-display text-sm font-semibold px-4 py-1.5 rounded-lg border-2 transition-all cursor-pointer ${
              currentView === 'plan'
                ? 'bg-[#ffe169] text-[#1b1b1e] border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]'
                : 'border-transparent text-[#4c4736] hover:text-[#1b1b1e] hover:border-[#1b1b1e]'
            }`}
          >
            Plan
          </button>
          <button
            onClick={() => onNavigate('roadmap')}
            aria-current={currentView === 'roadmap' ? 'page' : undefined}
            className={`font-display text-sm font-semibold px-4 py-1.5 rounded-lg border-2 transition-all cursor-pointer ${
              currentView === 'roadmap'
                ? 'bg-[#ffe169] text-[#1b1b1e] border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]'
                : 'border-transparent text-[#4c4736] hover:text-[#1b1b1e] hover:border-[#1b1b1e]'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={onOpenSubjects}
            className="font-display text-sm font-semibold px-4 py-1.5 rounded-lg border-2 border-transparent text-[#4c4736] hover:text-[#1b1b1e] hover:border-[#1b1b1e] transition-all cursor-pointer"
          >
            Subjects
          </button>
          <button
            onClick={onOpenSettings}
            className="font-display text-sm font-semibold px-4 py-1.5 rounded-lg border-2 border-transparent text-[#4c4736] hover:text-[#1b1b1e] hover:border-[#1b1b1e] transition-all cursor-pointer"
          >
            Settings
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Mobile Quick Nav */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => onNavigate('plan')}
              className={`px-2.5 py-1 text-xs font-display font-bold border ${
                currentView === 'plan'
                  ? 'bg-[#ffe169] border-[#1b1b1e]'
                  : 'bg-white border-[#1b1b1e]'
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => onNavigate('roadmap')}
              className={`px-2.5 py-1 text-xs font-display font-bold border ${
                currentView === 'roadmap'
                  ? 'bg-[#ffe169] border-[#1b1b1e]'
                  : 'bg-white border-[#1b1b1e]'
              }`}
            >
              Roadmap
            </button>
          </div>

          <button
            onClick={onNewPlan}
            className="bg-[#ffe169] text-[#1b1b1e] font-display text-xs md:text-sm font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1b1b1e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Plan</span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="User Profile"
            className="w-8 h-8 rounded-full bg-[#6f5d00] flex items-center justify-center border-2 border-[#1b1b1e] text-white hover:opacity-90 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
