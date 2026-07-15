const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const EVENT_QUEUE = [];
const FAILED_EVENTS = [];
const BATCH_SIZE = 6;
const BATCH_TIMEOUT_MS = 2000;
const MAX_RETRIES = 3;

let batchTimer = null;
let isProcessing = false;

function scheduleBatchSend() {
  if (batchTimer) {
    return;
  }

  batchTimer = window.setTimeout(async () => {
    batchTimer = null;
    await processQueuedEvents();
  }, BATCH_TIMEOUT_MS);
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function sendEventsWithRetry(token, events, attempt = 1) {
  try {
    const response = await fetch(`${API_URL}/api/interview/proctoring/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    await delay(500 * attempt);
    return sendEventsWithRetry(token, events, attempt + 1);
  }
}

async function processQueuedEvents() {
  if (isProcessing || EVENT_QUEUE.length === 0) {
    return true;
  }

  isProcessing = true;
  const batch = EVENT_QUEUE.splice(0, BATCH_SIZE);
  const groupedByToken = batch.reduce((groups, item) => {
    if (!groups.has(item.token)) {
      groups.set(item.token, []);
    }

    groups.get(item.token).push(item.event);
    return groups;
  }, new Map());

  try {
    for (const [token, events] of groupedByToken.entries()) {
      await sendEventsWithRetry(token, events);
    }
    return true;
  } catch (error) {
    FAILED_EVENTS.push(...batch.map((item) => ({ ...item, error: error.message })));
    EVENT_QUEUE.unshift(...batch);
    return false;
  } finally {
    isProcessing = false;

    if (EVENT_QUEUE.length > 0) {
      scheduleBatchSend();
    }
  }
}

export async function queueProctoringEvent(token, event) {
  if (!token || !event?.eventType) {
    return;
  }

  EVENT_QUEUE.push({ token, event });

  if (EVENT_QUEUE.length >= BATCH_SIZE) {
    await processQueuedEvents();
    return;
  }

  scheduleBatchSend();
}

export function getProctoringQueueStats() {
  return {
    queued: EVENT_QUEUE.length,
    failed: FAILED_EVENTS.length
  };
}

export async function saveProctoringSummary(token, summary) {
  if (!token || !summary) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/interview/proctoring/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function saveInterviewSnapshot(token, imageData) {
  if (!token || !imageData) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/interview/snapshot/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageData
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function saveProctoringEvidenceSnapshot(token, payload) {
  if (!token || !payload?.imageData || !payload?.eventType) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/interview/evidence/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function flushProctoringEvents() {
  if (batchTimer) {
    window.clearTimeout(batchTimer);
    batchTimer = null;
  }

  while (EVENT_QUEUE.length > 0) {
    const processed = await processQueuedEvents();

    if (!processed) {
      break;
    }
  }
}
