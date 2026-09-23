"use client";

import { useSyncExternalStore } from "react";
import { getStoredApiKey, subscribeToApiKeyChanges } from "@/lib/api-key-storage";

function getServerSnapshot(): string | null {
  return null;
}

export function useApiKey(): string | null {
  return useSyncExternalStore(subscribeToApiKeyChanges, getStoredApiKey, getServerSnapshot);
}
