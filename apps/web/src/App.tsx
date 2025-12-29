import React from 'react';
import Header from './components/Header';
import InfoSidebar from './components/InfoSidebar';
import Footer from './components/Footer';
import PlanConfigurator from './components/PlanConfigurator';
import PlanSummary from './components/PlanSummary';
import StickyPlanBar from './components/StickyPlanBar';
import { usePlanState } from './hooks/usePlanState';

const App: React.FC = () => {
  const {
    activePlan,
    draftMixedRows,
    draftPaceMode,
    draftProgramKey,
    draftSelectedPace,
    draftStartTermKey,
    handleApplyDraft,
    handleShare,
    isDraftMixedIncomplete,
    mixedPlan,
    paceMode,
    paceRows,
    selectedProgram,
    shareStatus,
    setDraftMixedRows,
    setDraftPaceMode,
    setDraftProgramKey,
    setDraftSelectedPace,
    setDraftStartTermKey
  } = usePlanState();

  return (
    <div className="min-h-screen bg-tech-white text-tech-navy">
      <div className="mx-auto flex min-h-screen max-w-[1320px] flex-col px-4 py-4">
        <Header onShare={handleShare} shareStatus={shareStatus} />

        <main className="dashboard-grid mt-3 grid flex-1 gap-4 pb-24 sm:pb-0 lg:grid-cols-[minmax(360px,1fr)_minmax(360px,1fr)_minmax(360px,1fr)]">
          <div className="order-2 sm:order-1">
            <PlanConfigurator
              draftProgramKey={draftProgramKey}
              draftStartTermKey={draftStartTermKey}
              onDraftProgramChange={setDraftProgramKey}
              onDraftStartTermChange={setDraftStartTermKey}
              onApplyDraft={handleApplyDraft}
              paceMode={draftPaceMode}
              onPaceModeChange={setDraftPaceMode}
              paceRows={paceRows}
              selectedPace={draftSelectedPace}
              onSelectPace={setDraftSelectedPace}
              mixedRows={draftMixedRows}
              onMixedRowsChange={setDraftMixedRows}
              programKey={draftProgramKey}
              isMixedIncomplete={isDraftMixedIncomplete}
            />
          </div>

          <div className="order-1 sm:order-2">
            <PlanSummary
              id="plan-summary"
              activePlan={activePlan}
              selectedProgramKey={selectedProgram?.key}
              paceMode={paceMode}
              mixedSchedule={mixedPlan.schedule}
            />
          </div>

          <div className="order-3">
            <InfoSidebar />
          </div>
        </main>

        <StickyPlanBar
          totalCost={activePlan.totalCost}
          finishLabel={activePlan.finishTerm.label}
          onCopyShare={handleShare}
          onViewDetails={() => {
            document.getElementById('plan-summary')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }}
        />

        <Footer />
      </div>
    </div>
  );
};

export default App;
