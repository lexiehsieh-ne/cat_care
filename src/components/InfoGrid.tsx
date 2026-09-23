import type { ReactNode } from "react";

type InfoItem = {
  emoji: string;
  icon?: ReactNode;
  title: string;
  description: string;
};

const ACCENTS = [
  { text: "text-blush", bg: "bg-blush-soft" },
  { text: "text-sage", bg: "bg-sage-soft" },
  { text: "text-gold", bg: "bg-gold-soft" },
];

const COLUMNS = 3;

export function InfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3">
      {items.map((item, index) => {
        const col = index % COLUMNS;
        const remainder = items.length % COLUMNS || COLUMNS;
        const isLastRow = index >= items.length - remainder;
        const accent = ACCENTS[col];

        const mobileBorder =
          index !== items.length - 1
            ? "border-b border-dashed border-line"
            : "";
        const desktopRightBorder =
          col !== COLUMNS - 1
            ? "sm:border-r sm:border-dashed sm:border-line"
            : "";
        const desktopBottomBorder = !isLastRow
          ? "sm:border-b sm:border-dashed sm:border-line"
          : "sm:border-b-0";

        return (
          <div
            key={item.title}
            className={`flex flex-col items-center px-6 py-8 text-center ${mobileBorder} ${desktopRightBorder} ${desktopBottomBorder}`}
          >
            <span
              className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl ${accent.bg}`}
            >
              {item.icon ?? item.emoji}
            </span>
            <h2 className={`mt-5 text-lg font-black ${accent.text}`}>
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/70">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
