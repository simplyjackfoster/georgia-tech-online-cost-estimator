import { useCallback, useMemo, useState } from 'react';
import { reportPlanGenerated } from '../lib/metrics';
import type { MixedLoadRow } from '../lib/mixedRows';
import { buildPaceRows, parseSelection, resolvePlan, type PlanSelection } from '../lib/plan';

/**
 * Holds the user's draft selection and the last applied one. Edits go to the
 * draft; "Update My Plan" copies it to applied, which drives the summary.
 */
export const usePlanState = (initialSearch: string = window.location.search) => {
  const [applied, setApplied] = useState<PlanSelection>(() => parseSelection(initialSearch));
  const [draft, setDraft] = useState<PlanSelection>(applied);

  const updateDraft = useCallback((patch: Partial<PlanSelection>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateDraftMixedRows = useCallback(
    (updater: (rows: MixedLoadRow[]) => MixedLoadRow[]) => {
      setDraft((prev) => ({ ...prev, mixedRows: updater(prev.mixedRows) }));
    },
    []
  );

  const paceRows = useMemo(
    () => buildPaceRows(draft),
    // buildPaceRows only reads these three fields.
    [draft.programKey, draft.residency, draft.startTermKey]
  );
  const draftPlan = useMemo(() => resolvePlan(draft), [draft]);
  const appliedPlan = useMemo(() => resolvePlan(applied), [applied]);

  const applyDraft = useCallback(() => {
    setApplied(draft);
    if (!draftPlan.isMixedIncomplete) {
      reportPlanGenerated(import.meta.env.VITE_API_BASE_URL);
    }
  }, [draft, draftPlan.isMixedIncomplete]);

  return {
    draft,
    applied,
    paceRows,
    draftPlan,
    appliedPlan,
    updateDraft,
    updateDraftMixedRows,
    applyDraft
  };
};
