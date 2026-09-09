import React from 'react';
import Header from './components/Header';
import InfoSidebar from './components/InfoSidebar';
import Footer from './components/Footer';
import PlanConfigurator from './components/PlanConfigurator';
import PlanSummary from './components/PlanSummary';
import StickyPlanBar from './components/StickyPlanBar';
import { usePlanState } from './hooks/usePlanState';
import { useShareLink } from './hooks/useShareLink';

const SUMMARY_ID = 'plan-summary';

const App: React.FC = () => {
  const { draft, applied, paceRows, draftPlan, appliedPlan, updateDraft, updateDraftMixedRows, applyDraft } =
    usePlanState();
  const { shareStatus, share } = useShareLink(applied);

  return (
    <div className="min-h-screen bg-tech-white text-tech-navy">
      <div className="mx-auto flex min-h-screen max-w-[1320px] flex-col px-4 py-4">
        <Header onShare={share} shareStatus={shareStatus} />

        <main className="dashboard-grid mt-3 grid flex-1 gap-4 pb-24 sm:pb-0 lg:grid-cols-[minmax(360px,1fr)_minmax(360px,1fr)_minmax(360px,1fr)]">
          <div className="order-2 sm:order-1">
            <PlanConfigurator
              draft={draft}
              paceRows={paceRows}
              isMixedIncomplete={draftPlan.isMixedIncomplete}
              onChange={updateDraft}
              onMixedRowsChange={updateDraftMixedRows}
              onApply={applyDraft}
            />
          </div>

          <div className="order-1 sm:order-2">
            <PlanSummary
              id={SUMMARY_ID}
              plan={appliedPlan.plan}
              programKey={applied.programKey}
              residency={applied.residency}
              paceMode={applied.paceMode}
            />
          </div>

          <div className="order-3">
            <InfoSidebar />
          </div>
        </main>

        <StickyPlanBar
          totalCost={appliedPlan.plan.totalCost}
          finishLabel={appliedPlan.plan.finishTerm.label}
          onCopyShare={share}
          onViewDetails={() => {
            document.getElementById(SUMMARY_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />

        <Footer />
      </div>
    </div>
  );
};

export default App;
