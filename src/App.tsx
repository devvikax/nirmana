import { useState, useEffect } from 'react';
import { ViewMode, StudyPlan } from './types';
import { loadActivePlan, saveActivePlan, loadAllPlans, resetToSeedPlan } from './lib/storage';
import { generatePlan } from './lib/planner';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { CreatePlan } from './components/CreatePlan';
import { SynthesisView } from './components/SynthesisView';
import { TodayPlan } from './components/TodayPlan';
import { WeeklyRoadmap } from './components/WeeklyRoadmap';
import { AdjustVelocityModal, SubjectsModal, SettingsModal } from './components/Modals';

export default function App() {
  // Load initial plan from storage or fallback to seed
  const [activePlan, setActivePlan] = useState<StudyPlan>(() => loadActivePlan());
  const [allPlans, setAllPlans] = useState<StudyPlan[]>(() => loadAllPlans());

  // Navigation View State
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    // If URL hash has a route, honor it
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'plan' || hash === 'roadmap' || hash === 'create') {
      return hash as ViewMode;
    }
    return 'landing';
  });

  // Preset to pass to CreatePlan if user clicked a template in landing
  const [initialPreset, setInitialPreset] = useState<{ subject: string; rawSyllabus: string } | undefined>(undefined);

  // Modals state
  const [isVelocityModalOpen, setIsVelocityModalOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Keep URL hash in sync with currentView
  useEffect(() => {
    window.location.hash = `#/${currentView}`;
  }, [currentView]);

  // Handle hashchange for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'landing' || hash === 'create' || hash === 'plan' || hash === 'roadmap') {
        setCurrentView(hash as ViewMode);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update plan in state and localStorage
  const handleUpdatePlan = (updated: StudyPlan) => {
    setActivePlan(updated);
    saveActivePlan(updated);
    setAllPlans(loadAllPlans());
  };

  // Switch to Create Plan flow
  const handleStartCreate = (preset?: { subject: string; rawSyllabus: string }) => {
    setInitialPreset(preset);
    setCurrentView('create');
  };

  // Called when Create Plan form is submitted
  const handlePlanGenerated = (data: {
    subject: string;
    topics: string[];
    examDate: string;
    dailyHours: number;
  }) => {
    const newPlan = generatePlan(data.subject, data.topics, data.examDate, data.dailyHours);
    handleUpdatePlan(newPlan);
    setCurrentView('synthesizing');
  };

  // Reset to default seed
  const handleResetToDefault = () => {
    const seed = resetToSeedPlan();
    setActivePlan(seed);
    setAllPlans(loadAllPlans());
    setCurrentView('plan');
  };

  return (
    <div className="min-h-screen bg-[#fbf8fc] text-[#1b1b1e] flex flex-col font-body selection:bg-[#ffe169] selection:text-[#1b1b1e]">
      {/* Universal Fixed Header (shown on plan and roadmap screens) */}
      {(currentView === 'plan' || currentView === 'roadmap') && (
        <Header
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onNewPlan={() => {
            setInitialPreset(undefined);
            setCurrentView('create');
          }}
          onOpenSubjects={() => setIsSubjectsModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        {currentView === 'landing' && (
          <LandingPage
            onStartCreate={handleStartCreate}
            onViewDemoPlan={() => setCurrentView('plan')}
          />
        )}

        {currentView === 'create' && (
          <CreatePlan
            existingPlan={activePlan}
            initialPreset={initialPreset}
            onPlanGenerated={handlePlanGenerated}
            onCancel={() => setCurrentView(activePlan ? 'plan' : 'landing')}
          />
        )}

        {currentView === 'synthesizing' && (
          <SynthesisView
            plan={activePlan}
            onComplete={() => setCurrentView('plan')}
          />
        )}

        {currentView === 'plan' && (
          <TodayPlan
            plan={activePlan}
            onUpdatePlan={handleUpdatePlan}
            onViewRoadmap={() => setCurrentView('roadmap')}
            onOpenSubjects={() => setIsSubjectsModalOpen(true)}
          />
        )}

        {currentView === 'roadmap' && (
          <WeeklyRoadmap
            plan={activePlan}
            onUpdatePlan={handleUpdatePlan}
            onResumeStudy={() => setCurrentView('plan')}
            onAdjustVelocity={() => setIsVelocityModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AdjustVelocityModal
        plan={activePlan}
        isOpen={isVelocityModalOpen}
        onClose={() => setIsVelocityModalOpen(false)}
        onSave={handleUpdatePlan}
      />

      <SubjectsModal
        currentPlan={activePlan}
        allPlans={allPlans}
        isOpen={isSubjectsModalOpen}
        onClose={() => setIsSubjectsModalOpen(false)}
        onSelectPlan={(selected) => {
          setActivePlan(selected);
          saveActivePlan(selected);
        }}
        onNewPlan={() => {
          setInitialPreset(undefined);
          setCurrentView('create');
        }}
      />

      <SettingsModal
        plan={activePlan}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onResetPlan={handleResetToDefault}
      />
    </div>
  );
}
