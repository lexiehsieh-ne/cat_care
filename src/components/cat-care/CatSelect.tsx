"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Cat } from "./api";
import { CatAvatar } from "./PhotoUpload";

// 可以顯示大頭照的下拉選單（原生 <select> 無法放圖片）
// 鍵盤：↑↓ 移動、Enter／空白鍵選擇、Esc 關閉、Home／End 跳到頭尾
export function CatSelect({
  cats,
  value,
  onChange,
  label,
}: {
  cats: Cat[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const selected = cats.find((c) => c._id === value);

  function openList() {
    setActive(Math.max(0, cats.findIndex((c) => c._id === value)));
    setOpen(true);
  }

  function choose(index: number) {
    const cat = cats[index];
    if (cat) onChange(cat._id);
    setOpen(false);
    buttonRef.current?.focus();
  }

  // 點選單外面就關閉
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // 打開時把焦點移到清單；移動時讓目前選項保持在可見範圍
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    document.getElementById(`${baseId}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, baseId]);

  function onButtonKey(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  }

  function onListKey(e: KeyboardEvent) {
    const last = cats.length - 1;
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(last, i + 1)),
      ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => {
        setOpen(false);
        buttonRef.current?.focus();
      },
      Tab: () => setOpen(false),
    };
    const move = moves[e.key];
    if (!move) return;
    if (e.key !== "Tab") e.preventDefault();
    move();
  }

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1 text-sm">
      <span id={`${baseId}-label`} className="font-medium text-foreground/70">
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${baseId}-label ${baseId}-value`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKey}
        className="flex min-h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-line bg-card px-3 py-1.5 text-left text-base text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold-soft"
      >
        {selected ? (
          <>
            <CatAvatar src={selected.avatarUrl} name={selected.name} className="size-9 text-lg" />
            <span id={`${baseId}-value`} className="min-w-0 flex-1 truncate">
              {selected.name}
              <span className="ml-2 text-sm text-foreground/60">
                {selected.breed}・{selected.gender}・{selected.age}
              </span>
            </span>
          </>
        ) : (
          <span id={`${baseId}-value`} className="flex-1 text-foreground/60">
            請選擇貓咪（共 {cats.length} 隻）
          </span>
        )}
        <span aria-hidden className={`text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${baseId}-label`}
          aria-activedescendant={`${baseId}-opt-${active}`}
          onKeyDown={onListKey}
          className="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-line bg-card p-1 shadow-lg outline-none"
        >
          {cats.map((cat, i) => (
            <li
              key={cat._id}
              id={`${baseId}-opt-${i}`}
              role="option"
              aria-selected={cat._id === value}
              onPointerMove={() => setActive(i)}
              onClick={() => choose(i)}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 ${
                i === active ? "bg-gold-soft/50" : ""
              }`}
            >
              <CatAvatar src={cat.avatarUrl} name={cat.name} className="size-9 text-lg" />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{cat.name}</span>
                <span className="ml-2 text-sm text-foreground/60">
                  {cat.breed}・{cat.gender}・{cat.age}
                </span>
              </span>
              {cat._id === value && (
                <span aria-hidden className="text-gold">
                  ✓
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
