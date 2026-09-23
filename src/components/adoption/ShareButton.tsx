"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied or unavailable; nothing to fall back to
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="group flex items-center gap-4 text-left"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background/10">
        {copied ? (
          <Check className="h-5 w-5" />
        ) : (
          <Share2 className="h-5 w-5" />
        )}
      </span>
      <span>
        <span className="block text-xs text-background/60">
          {copied ? "已複製連結！" : "無法認養？"}
        </span>
        <span className="block font-bold underline-offset-2 group-hover:underline">
          {copied ? "貼給朋友分享出去吧" : "幫忙分享出去"}
        </span>
      </span>
    </button>
  );
}
