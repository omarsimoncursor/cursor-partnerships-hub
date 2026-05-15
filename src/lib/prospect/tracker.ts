// Client-side engagement tracker for /p/[slug].
//
// Posts events to `POST /api/p/[slug]/track`. Events get queued in
// memory and flushed in micro-batches so a chatty interaction (e.g. ROI
// slider drag) doesn't fan out into one request per change. On
// page-unload we fall back to `navigator.sendBeacon` so the last batch
// still lands even if the prospect closes the tab mid-flush.

export type TrackEventType =
  | 'page.view'
  | 'page.unlocked'
  | 'unlock.attempt'
  | 'unlock.success'
  | 'unlock.failure'
  | 'cta.click'
  | 'vendor.run'
  | 'vendor.reset'
  | 'vendor.complete'
  | 'vendor.card.click'
  | 'vendor.modal.open'
  | 'vendor.modal.close'
  | 'sdk.starter_loaded'
  | 'sdk.run'
  | 'sdk.complete'
  | 'sdk.artifact_opened'
  | 'sdk.reset'
  | 'roi.changed'
  | 'roi.pricing_assumptions_viewed'
  | 'nav.section_anchor'
  | 'page.exit';

type QueuedEvent = {
  type: TrackEventType;
  data?: Record<string, unknown>;
  session_id?: string;
};

const FLUSH_DEBOUNCE_MS = 600;
const MAX_BATCH = 25;

class Tracker {
  private slug: string | null = null;
  private sessionId: string | null = null;
  private queue: QueuedEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private unloadHandlerAttached = false;

  setSlug(slug: string): void {
    if (this.slug === slug) return;
    this.slug = slug;
    if (!this.sessionId) {
      this.sessionId = makeSessionId();
    }
    this.attachUnloadHandler();
  }

  track(type: TrackEventType, data?: Record<string, unknown>): void {
    if (!this.slug) return;
    this.queue.push({ type, data, session_id: this.sessionId ?? undefined });
    if (this.queue.length >= MAX_BATCH) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  flush(): void {
    if (!this.slug || this.queue.length === 0) return;
    const url = `/api/p/${this.slug}/track`;
    const payload = JSON.stringify({ events: this.queue.splice(0, MAX_BATCH) });
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    try {
      // Prefer fetch with keepalive so a SPA navigation doesn't abort
      // the in-flight request.
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // ignore — the next track() will retry by virtue of re-queueing
        // if it cares. We deliberately don't reinsert here because the
        // most common failure is the user simply navigating away, in
        // which case the unload-time sendBeacon already covers us.
      });
    } catch {
      // ignore
    }
  }

  /** Fired by the page on unload. Uses sendBeacon if available. */
  flushBeacon(): void {
    if (!this.slug || this.queue.length === 0) return;
    const url = `/api/p/${this.slug}/track`;
    const payload = JSON.stringify({ events: this.queue.splice(0) });
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        return;
      }
    } catch {
      // fall through to keepalive fetch
    }
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    } catch {
      // best-effort only
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, FLUSH_DEBOUNCE_MS);
  }

  private attachUnloadHandler(): void {
    if (this.unloadHandlerAttached || typeof window === 'undefined') return;
    this.unloadHandlerAttached = true;
    window.addEventListener('pagehide', () => {
      this.track('page.exit');
      this.flushBeacon();
    });
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushBeacon();
      }
    });
  }
}

const tracker = new Tracker();

export function configureTracker(slug: string): void {
  tracker.setSlug(slug);
}

export function track(type: TrackEventType, data?: Record<string, unknown>): void {
  tracker.track(type, data);
}

export function flushTracker(): void {
  tracker.flush();
}

function makeSessionId(): string {
  // ~12-char base36 ID is unique enough for grouping events from a
  // single tab session. No need for cryptographic strength here.
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
