// Mock transport. Replace each service method body with real API calls later.
// Append ?simulate=error or ?simulate=empty to any URL to preview error / empty states.
const LATENCY = 450;

const simulateFlag = () => new URLSearchParams(window.location.search).get("simulate");

export function respond(data, { latency = LATENCY, mutation = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const flag = simulateFlag();
      if (flag === "error") return reject(new Error("We couldn't load this data. The service may be temporarily unavailable."));
      if (flag === "empty" && !mutation && Array.isArray(data)) return resolve([]);
      resolve(data === undefined ? undefined : structuredClone(data));
    }, latency);
  });
}

export const reject = (message, latency = LATENCY) =>
  new Promise((_, rej) => setTimeout(() => rej(new Error(message)), latency));

export const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
