import React, { useState } from 'react';

interface LandingPageProps {
  onStartCreate: (preset?: { subject: string; rawSyllabus: string }) => void;
  onViewDemoPlan: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreate,
  onViewDemoPlan,
}) => {
  // Interactive mock tasks state in the right-column card
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = 3;

  // Interactive Sandbox Simulator State
  const [activeSimulation, setActiveSimulation] = useState<'algorithms' | 'biochem' | 'constitutional'>('algorithms');

  const simulationData = {
    algorithms: {
      subject: 'Algorithms & Data Structures',
      input: `Week 1: Graph Theory Fundamentals
Week 2: Dijkstra, Bellman-Ford & Shortest Paths
Week 3: Minimum Spanning Trees (Prim / Kruskal)
Week 4: Network Flows & Ford-Fulkerson Cut theorem`,
      output: [
        { day: 'Day 1 • Graph Representations (Matrix vs Adjacency)', time: '40 min' },
        { day: 'Day 2 • Dijkstra Proof of Correctness + Edge Cases', time: '50 min' },
        { day: 'Day 3 • Spaced Review D1 + Bellman-Ford Cycles', time: '45 min' },
      ],
      pacedNote: 'Paced across target: 14 available days · 0 hours wasted',
    },
    biochem: {
      subject: 'Biochemistry',
      input: `Module A: Amino Acid Structures & pKa Buffers
Module B: Enzyme Kinetics (Michaelis-Menten & Lineweaver-Burk)
Module C: Glycolysis, Hexokinase Regulation & ATP Yield
Module D: Krebs Cycle, Pyruvate Dehydrogenase Complex`,
      output: [
        { day: 'Day 1 • 20 Amino Acid Side Chains + Isoelectric Point', time: '60 min' },
        { day: 'Day 2 • Km, Vmax & Competitive vs Non-Comp Inhibition', time: '45 min' },
        { day: 'Day 3 • Spaced Drill: pKa calculations + Glycolysis Steps 1-5', time: '50 min' },
      ],
      pacedNote: 'Paced across target: 18 available days · 0 hours wasted',
    },
    constitutional: {
      subject: 'Constitutional Law',
      input: `Topic 1: Judicial Review & Marbury v. Madison
Topic 2: Commerce Clause (Gibbons, Wickard, Lopez, Morrison)
Topic 3: Executive Powers & Youngstown Steel
Topic 4: Substantive Due Process & Equal Protection`,
      output: [
        { day: 'Day 1 • Case Brief: Marbury v. Madison (Art III bounds)', time: '45 min' },
        { day: 'Day 2 • Commerce Clause Substantial Effects Test', time: '55 min' },
        { day: 'Day 3 • Synthesis: Youngstown 3-Tier Jackson Framework', time: '40 min' },
      ],
      pacedNote: 'Paced across target: 16 available days · 0 hours wasted',
    },
  };

  const handleUseSimulation = () => {
    const cur = simulationData[activeSimulation];
    onStartCreate({
      subject: cur.subject,
      rawSyllabus: cur.input,
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#fbf8fc] text-[#1b1b1e]">
      {/* Top Announcement Bar / Micro-Trust Indicator */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b-2 border-[#1b1b1e]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#ffe169] text-[#1b1b1e] flex items-center justify-center font-display font-bold text-lg shadow-[2px_2px_0px_#1b1b1e] border border-[#1b1b1e]">
              S
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#1b1b1e]">
              SyllabusPlan
            </span>
            <span className="text-[11px] font-display uppercase bg-[#eae7eb] px-2 py-0.5 ml-2 border border-[#1b1b1e] text-[#1b1b1e] font-semibold">
              v2.4 Editorial Engine
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c3ecd7] text-[#002115] font-display text-xs border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]">
              <span className="w-2 h-2 rounded-full bg-[#416656] animate-pulse"></span>
              Used by 14,200+ students for finals &amp; board exams
            </span>
            <button
              onClick={onViewDemoPlan}
              className="text-xs font-display font-semibold hover:underline cursor-pointer hidden sm:inline"
            >
              Open Active Plan →
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-10 lg:pt-14 items-start">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Academic Discipline Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-[#dee2ef] text-[#171c25] text-xs font-display border border-[#1b1b1e] uppercase tracking-wider">
                Engineering
              </span>
              <span className="px-2.5 py-1 bg-[#f6f2f7] text-[#1b1b1e] text-xs font-display border border-[#1b1b1e] uppercase tracking-wider">
                Pre-Med &amp; USMLE
              </span>
              <span className="px-2.5 py-1 bg-[#f6f2f7] text-[#1b1b1e] text-xs font-display border border-[#1b1b1e] uppercase tracking-wider">
                Law / Bar
              </span>
              <span className="px-2.5 py-1 bg-[#ffe169] text-[#1b1b1e] text-xs font-display border border-[#1b1b1e] uppercase tracking-wider font-semibold">
                Semester Finals
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#1b1b1e] leading-[1.08]">
              Your syllabus is <br className="hidden sm:inline" />
              <span className="bg-[#ffe169] px-2 py-0.5 border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] inline-block -rotate-1 mt-1">
                not a study plan.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-body text-base sm:text-lg text-[#4c4736] max-w-xl leading-relaxed">
              Syllabi list what could be tested; they don't tell you what to read before 10 AM. Turn raw syllabus documents and PDF topic dumps into a sequenced daily schedule with spaced retention built in.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onStartCreate()}
                className="px-6 py-4 bg-[#ffe169] text-[#1b1b1e] font-display font-bold text-lg tracking-wide border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1b1b1e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create My Study Plan</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              <a
                href="#how-it-works"
                className="px-6 py-4 bg-white text-[#1b1b1e] font-display font-semibold text-base border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1b1b1e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all text-center cursor-pointer"
              >
                See How It Works ↓
              </a>
            </div>

            {/* Micro Social Proof Stats Block */}
            <div className="pt-6 border-t border-[#cec6b0] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="font-display font-bold text-2xl text-[#1b1b1e]">3.8x</div>
                <div className="font-body text-xs text-[#4c4736] leading-tight">
                  Faster syllabus breakdown than spreadsheet tracking
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-[#1b1b1e]">100%</div>
                <div className="font-body text-xs text-[#4c4736] leading-tight">
                  Deterministic ordering (zero hallucinated topics)
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-[#1b1b1e]">0 min</div>
                <div className="font-body text-xs text-[#4c4736] leading-tight">
                  Daily planning friction each morning
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Neo-Brutalist Daily Plan Mockup */}
          <div className="lg:col-span-5 relative" id="demo-app">
            {/* Decorative Backdrop Element */}
            <div className="absolute -top-3 -right-3 w-full h-full bg-[#c3ecd7] border-2 border-[#1b1b1e] pointer-events-none hidden sm:block"></div>

            {/* Main Plan Card */}
            <div className="relative bg-white border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] p-5 sm:p-6 flex flex-col gap-5">
              {/* Mockup Card Header */}
              <div className="flex items-start justify-between border-b-2 border-[#1b1b1e] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ba1a1a] border border-[#1b1b1e]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#ffe169] border border-[#1b1b1e]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#c3ecd7] border border-[#1b1b1e]"></span>
                    <span className="font-display font-bold text-xs uppercase tracking-wider text-[#1b1b1e] ml-1">
                      YOUR PLAN — TODAY
                    </span>
                  </div>
                  <p className="font-display font-bold text-lg text-[#1b1b1e] mt-2">
                    Monday, 28 September
                  </p>
                  <p className="font-body text-xs text-[#4c4736]">
                    Target workload: 3h 10m scheduled across 3 modules
                  </p>
                </div>
                <span className="px-2 py-1 bg-[#f0edf1] text-[#1b1b1e] text-xs font-display font-bold border border-[#1b1b1e]">
                  Day 14 of 32
                </span>
              </div>

              {/* Metric Indicator Pill */}
              <div className="flex items-center justify-between p-3 bg-[#ffe169] border-2 border-[#1b1b1e]">
                <div className="flex items-center gap-2 font-display text-sm font-semibold text-[#1b1b1e]">
                  <span className="material-symbols-outlined text-lg">hourglass_top</span>
                  <span>Final Exams in 18 days</span>
                </div>
                <span className="px-2 py-0.5 bg-white text-[#1b1b1e] text-xs font-display font-bold border border-[#1b1b1e]">
                  58% on track
                </span>
              </div>

              {/* Study Queue Items */}
              <div className="flex flex-col gap-3">
                {/* Block 1: Ready */}
                <div
                  className={`task-item p-3.5 border-2 border-[#1b1b1e] transition-all ${
                    completedTasks[1]
                      ? 'bg-[#c3ecd7]/40 opacity-70 line-through'
                      : 'bg-[#f6f2f7] hover:bg-[#f0edf1]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        aria-label="Mark completed"
                        onClick={() => toggleTask(1)}
                        className={`mt-0.5 w-5 h-5 rounded-none border-2 border-[#1b1b1e] flex items-center justify-center font-bold text-xs cursor-pointer ${
                          completedTasks[1] ? 'bg-[#ffe169]' : 'bg-white hover:bg-[#ffe169]'
                        }`}
                      >
                        {completedTasks[1] && (
                          <span className="material-symbols-outlined text-xs font-bold">check</span>
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-xs uppercase text-[#1b1b1e]">
                            09:00 AM
                          </span>
                          <span className="text-[11px] px-1.5 py-0.2 bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e] font-semibold">
                            Data Structures
                          </span>
                        </div>
                        <h4 className="font-display font-semibold text-base text-[#1b1b1e] mt-0.5">
                          Arrays &amp; Binary Searching
                        </h4>
                        <p className="font-body text-xs text-[#4c4736]">
                          Core theory + 4 leetcode pattern reviews
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-display bg-[#c3ecd7] text-[#002115] border border-[#1b1b1e] px-2 py-0.5 font-bold shrink-0">
                      {completedTasks[1] ? 'Done' : 'Ready'}
                    </span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#cec6b0] flex justify-between items-center text-xs text-[#4c4736] font-display">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> 45 min deep work
                    </span>
                    <span className="font-semibold text-[#1b1b1e]">Weight: High (Finals Q3)</span>
                  </div>
                </div>

                {/* Block 2: Up Next */}
                <div
                  className={`task-item p-3.5 border-2 border-[#1b1b1e] transition-all ${
                    completedTasks[2]
                      ? 'bg-[#c3ecd7]/40 opacity-70 line-through'
                      : 'bg-white hover:bg-[#f6f2f7]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        aria-label="Mark completed"
                        onClick={() => toggleTask(2)}
                        className={`mt-0.5 w-5 h-5 rounded-none border-2 border-[#1b1b1e] flex items-center justify-center font-bold text-xs cursor-pointer ${
                          completedTasks[2] ? 'bg-[#ffe169]' : 'bg-white hover:bg-[#ffe169]'
                        }`}
                      >
                        {completedTasks[2] && (
                          <span className="material-symbols-outlined text-xs font-bold">check</span>
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-xs uppercase text-[#1b1b1e]">
                            11:00 AM
                          </span>
                          <span className="text-[11px] px-1.5 py-0.2 bg-[#dee2ef] text-[#171c25] border border-[#1b1b1e] font-semibold">
                            Discrete Math
                          </span>
                        </div>
                        <h4 className="font-display font-semibold text-base text-[#1b1b1e] mt-0.5">
                          Equivalence Relations &amp; Hasse Diagrams
                        </h4>
                        <p className="font-body text-xs text-[#4c4736]">
                          Syllabus Section 3.2.1 · Lemma 4 proofs
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-display bg-[#ffe169] text-[#1b1b1e] border border-[#1b1b1e] px-2 py-0.5 font-bold shrink-0">
                      {completedTasks[2] ? 'Done' : 'Up Next'}
                    </span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#cec6b0] flex justify-between items-center text-xs text-[#4c4736] font-display">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> 40 min session
                    </span>
                    <span className="font-semibold text-[#1b1b1e]">Prerequisite for Chap 5</span>
                  </div>
                </div>

                {/* Block 3: Scheduled Later */}
                <div
                  className={`task-item p-3.5 border-2 border-[#1b1b1e] transition-all ${
                    completedTasks[3]
                      ? 'bg-[#c3ecd7]/40 opacity-70 line-through'
                      : 'bg-white opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        aria-label="Mark completed"
                        onClick={() => toggleTask(3)}
                        className={`mt-0.5 w-5 h-5 rounded-none border-2 border-[#1b1b1e] flex items-center justify-center font-bold text-xs cursor-pointer ${
                          completedTasks[3] ? 'bg-[#ffe169]' : 'bg-white hover:bg-[#ffe169]'
                        }`}
                      >
                        {completedTasks[3] && (
                          <span className="material-symbols-outlined text-xs font-bold">check</span>
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-xs uppercase text-[#1b1b1e]">
                            06:00 PM
                          </span>
                          <span className="text-[11px] px-1.5 py-0.2 bg-[#eae7eb] text-[#1b1b1e] border border-[#1b1b1e] font-semibold">
                            Operating Systems
                          </span>
                        </div>
                        <h4 className="font-display font-semibold text-base text-[#1b1b1e] mt-0.5">
                          Processes &amp; Context Switching Overhead
                        </h4>
                        <p className="font-body text-xs text-[#4c4736]">
                          Textbook pg 112–128 · Kernel trace examples
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-display bg-[#eae7eb] text-[#1b1b1e] border border-[#1b1b1e] px-2 py-0.5 font-bold shrink-0">
                      {completedTasks[3] ? 'Done' : 'Scheduled'}
                    </span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#cec6b0] flex justify-between items-center text-xs text-[#4c4736] font-display">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> 45 min session
                    </span>
                    <span className="font-semibold text-[#1b1b1e]">Flashcards Queued</span>
                  </div>
                </div>
              </div>

              {/* Micro Progress Segment Bar */}
              <div className="mt-1 pt-3 border-t border-[#1b1b1e] flex flex-col gap-2">
                <div className="flex justify-between items-center font-display text-xs">
                  <span className="font-bold text-[#1b1b1e]">Daily Pace Target</span>
                  <span className="font-bold text-[#1b1b1e]">
                    {completedCount} of {totalTasks} completed
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-3 bg-[#f0edf1] p-0.5 border border-[#1b1b1e]">
                  <div
                    className={`h-full border-r border-[#1b1b1e] transition-all ${
                      completedCount >= 1 ? 'bg-[#c3ecd7]' : 'bg-[#e4e1e6]'
                    }`}
                  ></div>
                  <div
                    className={`h-full border-r border-[#1b1b1e] transition-all ${
                      completedCount >= 2 ? 'bg-[#c3ecd7]' : 'bg-[#e4e1e6]'
                    }`}
                  ></div>
                  <div
                    className={`h-full transition-all ${
                      completedCount >= 3 ? 'bg-[#c3ecd7]' : 'bg-[#e4e1e6]'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Break Divider */}
        <div className="my-14 lg:my-20 border-t-2 border-[#1b1b1e] flex items-center justify-center">
          <span className="bg-[#fbf8fc] px-4 py-1 -mt-4 font-display font-bold text-xs tracking-widest text-[#1b1b1e] uppercase border border-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]">
            The Linear Execution Method
          </span>
        </div>

        {/* How It Works Section */}
        <section className="flex flex-col gap-10" id="how-it-works">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-display text-xs uppercase tracking-wider font-bold bg-[#ffe169] px-2 py-0.5 border border-[#1b1b1e]">
                3-Step Blueprint
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1b1b1e] mt-2">
                From messy course PDF to automated calendar blocks.
              </h2>
            </div>
            <p className="font-body text-sm sm:text-base text-[#4c4736] max-w-md">
              No ambiguous Notion templates. No rebuilding your calendar when you fall behind. One algorithm organizes topic hierarchy, workload sizing, and exam readiness.
            </p>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div>
                <div className="flex items-center justify-between pb-4 border-b-2 border-[#1b1b1e] mb-4">
                  <span className="font-display font-bold text-2xl text-[#1b1b1e]">01</span>
                  <span className="text-xs font-display px-2 py-0.5 bg-[#f0edf1] font-semibold border border-[#1b1b1e]">
                    RAW INGEST
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#1b1b1e] mb-2">
                  Paste or list your syllabus topics
                </h3>
                <p className="font-body text-sm text-[#4c4736] leading-relaxed">
                  Drop in your course outline, lecture list, textbook contents, or rough notes. SyllabusPlan cleans headers, separates sub-topics, and calculates difficulty weighting automatically.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-[#f6f2f7] border border-[#1b1b1e] p-3 text-xs text-[#1b1b1e]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <span className="material-symbols-outlined text-sm">file_download</span>
                  Accepted formats
                </div>
                <p className="text-[#4c4736]">
                  PDF, Markdown bullet lists, canvas lecture titles, or photo of physical course hand-outs.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div>
                <div className="flex items-center justify-between pb-4 border-b-2 border-[#1b1b1e] mb-4">
                  <span className="font-display font-bold text-2xl text-[#1b1b1e]">02</span>
                  <span className="text-xs font-display px-2 py-0.5 bg-[#ffe169] text-[#1b1b1e] font-semibold border border-[#1b1b1e]">
                    PARAMETERS
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#1b1b1e] mb-2">
                  Set exam deadline &amp; daily hours
                </h3>
                <p className="font-body text-sm text-[#4c4736] leading-relaxed">
                  Tell the planner how many realistic hours you can allocate per day (e.g. 2.5 hours on weekdays, 5 hours on Saturdays) and define hard test or midterm dates.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-[#f6f2f7] border border-[#1b1b1e] p-3 text-xs text-[#1b1b1e]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <span className="material-symbols-outlined text-sm">tune</span>
                  Dynamic buffer days
                </div>
                <p className="text-[#4c4736]">
                  Automatically reserves 20% of your pre-exam window strictly for mock tests and weak-area repair.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div>
                <div className="flex items-center justify-between pb-4 border-b-2 border-[#1b1b1e] mb-4">
                  <span className="font-display font-bold text-2xl text-[#1b1b1e]">03</span>
                  <span className="text-xs font-display px-2 py-0.5 bg-[#c3ecd7] text-[#002115] font-semibold border border-[#1b1b1e]">
                    EXECUTION
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#1b1b1e] mb-2">
                  Wake up and follow your exact study order
                </h3>
                <p className="font-body text-sm text-[#4c4736] leading-relaxed">
                  Zero decision paralysis. Open your terminal or dashboard, see exactly what block to complete first, finish it, and cross it off. If you miss a day, it recalculates without shame.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-[#f6f2f7] border border-[#1b1b1e] p-3 text-xs text-[#1b1b1e]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Spaced repetition hooks
                </div>
                <p className="text-[#4c4736]">
                  Past topics resurface at Day 3, Day 7, and Day 14 as 15-minute quick recall cards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Syllabus-to-Plan Sandbox Demo Snippet */}
        <section className="mt-14 bg-[#f6f2f7] border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="max-w-xl">
              <span className="text-xs font-display uppercase tracking-wider font-bold bg-[#e4e1e6] px-2 py-0.5 border border-[#1b1b1e] text-[#1b1b1e]">
                Instant Simulation
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#1b1b1e] mt-2">
                Test how your syllabus converts right now
              </h3>
              <p className="font-body text-sm text-[#4c4736] mt-1">
                Type or select a typical course outline below to preview how our deterministic scheduler partitions reading vs. problem sets.
              </p>
            </div>

            {/* Quick Template Selector */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveSimulation('algorithms')}
                className={`px-3 py-1.5 font-display text-xs border border-[#1b1b1e] font-semibold cursor-pointer transition-all ${
                  activeSimulation === 'algorithms'
                    ? 'bg-[#ffe169] text-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]'
                    : 'bg-white text-[#1b1b1e] hover:bg-[#ffe169]'
                }`}
              >
                Algorithms &amp; DS
              </button>
              <button
                onClick={() => setActiveSimulation('biochem')}
                className={`px-3 py-1.5 font-display text-xs border border-[#1b1b1e] font-semibold cursor-pointer transition-all ${
                  activeSimulation === 'biochem'
                    ? 'bg-[#ffe169] text-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]'
                    : 'bg-white text-[#1b1b1e] hover:bg-[#ffe169]'
                }`}
              >
                Biochemistry
              </button>
              <button
                onClick={() => setActiveSimulation('constitutional')}
                className={`px-3 py-1.5 font-display text-xs border border-[#1b1b1e] font-semibold cursor-pointer transition-all ${
                  activeSimulation === 'constitutional'
                    ? 'bg-[#ffe169] text-[#1b1b1e] shadow-[2px_2px_0px_#1b1b1e]'
                    : 'bg-white text-[#1b1b1e] hover:bg-[#ffe169]'
                }`}
              >
                Constitutional Law
              </button>
            </div>
          </div>

          {/* Interactive Box */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#1b1b1e] p-4 flex flex-col">
              <div className="flex justify-between items-center pb-2 border-b border-[#cec6b0] mb-2">
                <span className="font-display font-bold text-xs uppercase text-[#1b1b1e]">
                  Input: Syllabus Document
                </span>
                <span className="text-xs text-[#4c4736] font-mono">raw_syllabus.txt</span>
              </div>
              <textarea
                value={simulationData[activeSimulation].input}
                readOnly
                rows={5}
                className="w-full bg-[#f6f2f7] border border-[#1b1b1e] p-2.5 font-mono text-xs text-[#1b1b1e] focus:outline-none resize-none"
              />
            </div>
            <div className="bg-white border-2 border-[#1b1b1e] p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-[#cec6b0] mb-2">
                  <span className="font-display font-bold text-xs uppercase text-[#1b1b1e]">
                    Output: Daily Execution Matrix
                  </span>
                  <span className="text-xs font-display bg-[#c3ecd7] text-[#002115] px-1.5 font-bold border border-[#1b1b1e]">
                    Calculated
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-display">
                  {simulationData[activeSimulation].output.map((out, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between p-1.5 bg-[#f0edf1] border border-[#cec6b0]"
                    >
                      <span className="truncate pr-2">{out.day}</span>
                      <span className="font-bold shrink-0">{out.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#cec6b0]">
                <span className="text-xs text-[#4c4736]">
                  {simulationData[activeSimulation].pacedNote}
                </span>
                <button
                  onClick={handleUseSimulation}
                  className="px-2.5 py-1 bg-[#ffe169] text-[#1b1b1e] border border-[#1b1b1e] text-xs font-display font-bold hover:shadow-[2px_2px_0px_#1b1b1e] transition-all cursor-pointer"
                >
                  Load Into Plan Architect →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Testimonials / Student Evidence Grid */}
        <section className="mt-14 flex flex-col gap-6">
          <div className="border-b-2 border-[#1b1b1e] pb-3 flex justify-between items-end">
            <div>
              <span className="font-display text-xs uppercase font-bold text-[#1b1b1e] bg-[#dee2ef] px-2 py-0.5 border border-[#1b1b1e]">
                Field Reports
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#1b1b1e] mt-1">
                Built for high-stakes exam survivors.
              </h3>
            </div>
            <span className="hidden sm:inline font-body text-xs text-[#4c4736]">
              Real exam scores from 2024–2026 academic cycle
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#6f5d00] mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body text-sm text-[#1b1b1e] leading-snug">
                  "I used to spend 45 minutes every morning staring at an 8-page Anatomy syllabus wondering where to pick back up. Having a rigid, numbered queue removed all start-up friction."
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#cec6b0] flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-xs text-[#1b1b1e]">Elena V.</div>
                  <div className="font-body text-xs text-[#4c4736]">
                    Year 2 Medical Student · Johns Hopkins
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#c3ecd7] text-[#002115] text-xs font-display font-bold border border-[#1b1b1e]">
                  Step 1: Pass
                </span>
              </div>
            </div>

            <div className="p-5 bg-white border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#6f5d00] mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body text-sm text-[#1b1b1e] leading-snug">
                  "Engineering courses never sync their midterm schedules. SyllabusPlan balanced my Signals &amp; Systems assignments against Fluid Dynamics without cramming everything onto Sunday night."
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#cec6b0] flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-xs text-[#1b1b1e]">Karthik R.</div>
                  <div className="font-body text-xs text-[#4c4736]">
                    B.S. Electrical Engineering · Purdue
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#ffe169] text-[#1b1b1e] text-xs font-display font-bold border border-[#1b1b1e]">
                  3.94 GPA
                </span>
              </div>
            </div>

            <div className="p-5 bg-white border-2 border-[#1b1b1e] shadow-[3px_3px_0px_#1b1b1e] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#6f5d00] mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body text-sm text-[#1b1b1e] leading-snug">
                  "The hard offset shadow aesthetic matches how I think: clean, brutal, zero soft fluffy advice. Just give me the task, the estimated time, and let me study."
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#cec6b0] flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-xs text-[#1b1b1e]">Sarah M.</div>
                  <div className="font-body text-xs text-[#4c4736]">
                    1L Law Candidate · Georgetown Law
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#dee2ef] text-[#171c25] text-xs font-display font-bold border border-[#1b1b1e]">
                  Top 10% Rank
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action Hero Card */}
        <section className="mt-14 lg:mt-20 p-8 sm:p-12 bg-[#ffe169] border-2 border-[#1b1b1e] shadow-[6px_6px_0px_#1b1b1e] relative overflow-hidden">
          <div className="max-w-2xl relative z-10 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#1b1b1e] text-xs font-display font-bold uppercase w-fit">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
              Final exams approach in 3 weeks
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl lg:text-5xl text-[#1b1b1e] leading-tight">
              Stop rereading your syllabus. Start crossing off topics.
            </h2>
            <p className="font-body text-base sm:text-lg text-[#4c4736] max-w-lg">
              Generate your personal day-by-day roadmap in 60 seconds. Free for single courses, forever.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => onStartCreate()}
                className="px-8 py-4 bg-white text-[#1b1b1e] font-display font-bold text-base sm:text-lg tracking-wide border-2 border-[#1b1b1e] shadow-[4px_4px_0px_#1b1b1e] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1b1b1e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1b1b1e] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started Free — No Card Needed</span>
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </button>
            </div>
            <div className="flex items-center gap-6 pt-3 text-xs font-display text-[#1b1b1e]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">lock</span> No spam email
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">sync</span> Syncs with Google Calendar &amp; iCal
              </span>
            </div>
          </div>
        </section>

        {/* Grounded Editorial Footer */}
        <footer className="mt-14 pt-8 border-t-2 border-[#1b1b1e] pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#4c4736] text-xs font-display">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#1b1b1e]">SyllabusPlan</span>
            <span>·</span>
            <span>The Anti-Anxiety Academic Workflow</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-[#1b1b1e]">Syllabus Parser API</span>
            <span className="text-[#1b1b1e]">Spaced Repetition Guide</span>
            <span className="text-[#1b1b1e]">System Architecture</span>
            <span>© 2026 SyllabusPlan</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
