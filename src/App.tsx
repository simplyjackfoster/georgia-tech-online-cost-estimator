import React from 'react';
import Header from './components/Header';
import InfoSidebar from './components/InfoSidebar';
import PlanConfigurator from './components/PlanConfigurator';
import PlanSummary from './components/PlanSummary';
import { usePlanState } from './hooks/usePlanState';

const App: React.FC = () => {
  const {
    activePlan,
    draftProgramKey,
    draftStartTermKey,
    handleShare,
    isMixedIncomplete,
    mixedPlan,
    mixedRows,
    paceMode,
    paceRows,
    programKey,
    selectedPace,
    selectedProgram,
    shareStatus,
    setDraftProgramKey,
    setDraftStartTermKey,
    setMixedRows,
    setPaceMode,
    setProgramKey,
    setSelectedPace,
    setStartTermKey
  } = usePlanState();

  return (
    <div className="min-h-screen bg-tech-white text-tech-navy">
      <div className="mx-auto flex min-h-screen max-w-[1320px] flex-col px-4 py-4">
        <Header onShare={handleShare} shareStatus={shareStatus} />

        <main className="dashboard-grid mt-3 grid flex-1 gap-4 lg:grid-cols-[minmax(360px,1fr)_minmax(360px,1fr)_minmax(360px,1fr)]">
          <PlanConfigurator
            draftProgramKey={draftProgramKey}
            draftStartTermKey={draftStartTermKey}
            onDraftProgramChange={setDraftProgramKey}
            onDraftStartTermChange={setDraftStartTermKey}
            onApplyDraft={() => {
              setProgramKey(draftProgramKey);
              setStartTermKey(draftStartTermKey);
            }}
            paceMode={paceMode}
            onPaceModeChange={setPaceMode}
            paceRows={paceRows}
            selectedPace={selectedPace}
            onSelectPace={setSelectedPace}
            mixedRows={mixedRows}
            onMixedRowsChange={setMixedRows}
            mixedPlan={mixedPlan}
            programKey={programKey}
            isMixedIncomplete={isMixedIncomplete}
          />

          <PlanSummary
            activePlan={activePlan}
            selectedProgramKey={selectedProgram?.key}
            paceMode={paceMode}
            mixedSchedule={mixedPlan.schedule}
          />

          <InfoSidebar />
        </main>
      </div>
    </div>
  );
};

export default App;
