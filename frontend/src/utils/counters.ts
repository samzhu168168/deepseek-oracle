/**
 * Lightweight social proof counters using localStorage.
 * Increments once per browser (per cookie-less unique visitor simulation).
 * Falls back to base values if localStorage is unavailable.
 */
const PROOF_KEY = "bond:proof_counters";

interface ProofCounters {
  /** Number of people who "discovered their pattern this month" */
  patternDiscoveries: number;
  /** Number of souls who "unlocked preview" */
  previewUnlocks: number;
}

const BASE_COUNTS: ProofCounters = {
  patternDiscoveries: 3241,
  previewUnlocks: 2847,
};

const INCREMENT_KEYS = {
  patternDiscoveries: "bond:incremented_pattern",
  previewUnlocks: "bond:incremented_preview",
};

function read(): ProofCounters {
  try {
    const raw = localStorage.getItem(PROOF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProofCounters;
      return {
        patternDiscoveries: Number.isFinite(parsed.patternDiscoveries)
          ? parsed.patternDiscoveries
          : BASE_COUNTS.patternDiscoveries,
        previewUnlocks: Number.isFinite(parsed.previewUnlocks)
          ? parsed.previewUnlocks
          : BASE_COUNTS.previewUnlocks,
      };
    }
  } catch {
    // ignore
  }
  return { ...BASE_COUNTS };
}

function write(counts: ProofCounters) {
  try {
    localStorage.setItem(PROOF_KEY, JSON.stringify(counts));
  } catch {
    // ignore
  }
}

/** Get the current pattern discoveries count, incrementing once per browser */
export function getPatternCount(): number {
  const counts = read();
  try {
    if (!localStorage.getItem(INCREMENT_KEYS.patternDiscoveries)) {
      counts.patternDiscoveries += 1;
      write(counts);
      localStorage.setItem(INCREMENT_KEYS.patternDiscoveries, "1");
    }
  } catch {
    // ignore
  }
  return counts.patternDiscoveries;
}

/** Get the current preview unlock count */
export function getPreviewUnlockCount(): number {
  const counts = read();
  try {
    if (!localStorage.getItem(INCREMENT_KEYS.previewUnlocks)) {
      counts.previewUnlocks += 1;
      write(counts);
      localStorage.setItem(INCREMENT_KEYS.previewUnlocks, "1");
    }
  } catch {
    // ignore
  }
  return counts.previewUnlocks;
}
