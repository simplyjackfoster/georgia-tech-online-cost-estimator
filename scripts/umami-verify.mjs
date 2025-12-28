#!/usr/bin/env node

const UMAMI_BASE_URL = 'https://api.umami.is/v1';
const PAGE_SIZE = 200;
const MAX_PAGES = 100;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = { event: 'plan_generated', minutes: 120 };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--event' && args[i + 1]) {
      options.event = args[i + 1];
      i += 1;
    } else if (arg === '--minutes' && args[i + 1]) {
      const minutes = Number(args[i + 1]);
      if (!Number.isNaN(minutes)) {
        options.minutes = minutes;
      }
      i += 1;
    }
  }
  return options;
};

const extractEvents = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const data = payload.data;
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter((item) => typeof item === 'object' && item !== null);
};

const fetchEventsPage = async ({ apiKey, websiteId, page, startAt, endAt }) => {
  const params = new URLSearchParams({
    startAt: String(startAt),
    endAt: String(endAt),
    page: String(page),
    pageSize: String(PAGE_SIZE)
  });
  const url = `${UMAMI_BASE_URL}/websites/${websiteId}/events?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-umami-api-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Umami API error: ${response.status}`);
  }

  const data = await response.json();
  return extractEvents(data);
};

const main = async () => {
  const { event, minutes } = parseArgs();
  const apiKey = process.env.UMAMI_API_KEY;
  const websiteId = process.env.UMAMI_WEBSITE_ID;

  if (!apiKey) {
    console.error('Missing UMAMI_API_KEY');
    process.exit(1);
  }
  if (!websiteId) {
    console.error('Missing UMAMI_WEBSITE_ID');
    process.exit(1);
  }

  const endAt = Date.now();
  const startAt = endAt - minutes * 60 * 1000;

  let page = 1;
  const events = [];

  while (page <= MAX_PAGES) {
    const pageEvents = await fetchEventsPage({
      apiKey,
      websiteId,
      page,
      startAt,
      endAt
    });
    if (pageEvents.length === 0) {
      break;
    }
    events.push(...pageEvents);
    if (pageEvents.length < PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  const matching = events.filter(
    (item) => item.eventType === 2 && item.eventName === event
  );
  const sessionIds = new Set(matching.map((item) => item.sessionId).filter(Boolean));
  const lastFive = [...matching]
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 5)
    .map((item) => ({
      createdAt: item.createdAt,
      country: item.country,
      device: item.device,
      browser: item.browser
    }));

  console.log(`Event: ${event}`);
  console.log(`Window (minutes): ${minutes}`);
  console.log(`Total events: ${matching.length}`);
  console.log(`Unique sessions: ${sessionIds.size}`);
  console.log('Last 5 events:');
  if (lastFive.length === 0) {
    console.log('  (none)');
  } else {
    lastFive.forEach((item) => {
      console.log(
        `  - ${item.createdAt} | ${item.country ?? 'unknown'} | ${item.device ?? 'unknown'} | ${item.browser ?? 'unknown'}`
      );
    });
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
