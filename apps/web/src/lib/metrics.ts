export const PLANS_GENERATED_PATH = '/api/metrics/plans-generated';

export const plansGeneratedUrl = (apiBaseUrl: string | undefined): string => {
  const base = apiBaseUrl?.replace(/\/$/, '') ?? '';
  return base ? `${base}${PLANS_GENERATED_PATH}` : '';
};

// Fire-and-forget: Umami gets the rich event, our API gets the durable count.
export const reportPlanGenerated = (apiBaseUrl: string | undefined): void => {
  window.umami?.track('plan_generated');

  const url = plansGeneratedUrl(apiBaseUrl);
  if (!url || typeof fetch !== 'function') {
    return;
  }
  try {
    fetch(url, { method: 'POST', keepalive: true }).catch(() => undefined);
  } catch (error) {
    // Counting is best-effort; never let it affect the planner.
  }
};
