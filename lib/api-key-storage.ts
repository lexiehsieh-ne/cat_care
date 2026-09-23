const STORAGE_KEY = "mockmate:openai-api-key";
const CHANGE_EVENT = "mockmate:api-key-change";

export function getStoredApiKey(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredApiKey(apiKey: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, apiKey);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function clearStoredApiKey(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function subscribeToApiKeyChanges(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return "••••••••";
  return `${apiKey.slice(0, 5)}••••${apiKey.slice(-4)}`;
}
