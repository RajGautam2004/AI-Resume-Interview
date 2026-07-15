/**
 * Event Reporter with Queue, Retry, and Batch Support
 * Handles reliable event delivery to backend
 */

const EVENT_QUEUE = [];
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 5000; // 5 seconds

let batchTimer = null;
let isProcessing = false;
let failedEvents = [];

/**
 * Report a proctoring event
 * Events are queued and sent in batches
 * @param {string} event - Event type
 * @param {Object} metadata - Additional event data
 */
export async function reportEvent(event, metadata = {}) {
  try {
    const eventData = {
      event,
      timestamp: Date.now(),
      ...metadata,
    };

    // Add to queue
    EVENT_QUEUE.push(eventData);
    console.log(`📝 Event queued: ${event}`);

    // Send immediately if queue is full, or schedule batch send
    if (EVENT_QUEUE.length >= BATCH_SIZE) {
      await processBatch();
    } else {
      scheduleBatchSend();
    }
  } catch (error) {
    console.error("Event queue error:", error);
    failedEvents.push({ event, error: error.message });
  }
}

/**
 * Schedule batch send with timeout
 */
function scheduleBatchSend() {
  if (batchTimer) return; // Already scheduled

  batchTimer = setTimeout(async () => {
    if (EVENT_QUEUE.length > 0) {
      await processBatch();
    }
    batchTimer = null;
  }, BATCH_TIMEOUT);
}

/**
 * Process and send batch of events
 */
async function processBatch() {
  if (isProcessing || EVENT_QUEUE.length === 0) return;

  isProcessing = true;
  const batch = EVENT_QUEUE.splice(0, BATCH_SIZE);

  try {
    await sendEventsWithRetry(batch);
    console.log(`✅ Sent ${batch.length} events`);
  } catch (error) {
    console.error("Batch send failed:", error);
    // Re-queue failed events
    EVENT_QUEUE.unshift(...batch);
    failedEvents.push(...batch.map((e) => ({ ...e, error: error.message })));
  } finally {
    isProcessing = false;
  }
}

/**
 * Send events with retry logic
 * @param {Array} events - Events to send
 * @param {number} attempt - Current attempt number
 */
async function sendEventsWithRetry(events, attempt = 1) {
  try {
    const response = await fetch(
      `${API_URL}/api/proctoring-event`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events,
          batchId: generateBatchId(),
          timestamp: Date.now(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.warn(
        `⚠️ Retry ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY}ms...`
      );
      await delay(RETRY_DELAY * attempt);
      return sendEventsWithRetry(events, attempt + 1);
    }
    throw error;
  }
}

/**
 * Delay utility
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate unique batch ID
 */
function generateBatchId() {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current statistics
 */
export function getEventStats() {
  return {
    queued: EVENT_QUEUE.length,
    failed: failedEvents.length,
    failedEvents,
  };
}

/**
 * Clear failed events list
 */
export function clearFailedEvents() {
  failedEvents = [];
}

/**
 * Force send all queued events
 */
export async function flushEvents() {
  while (EVENT_QUEUE.length > 0) {
    await processBatch();
  }
}
