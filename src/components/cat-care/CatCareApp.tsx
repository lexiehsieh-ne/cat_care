"use client";

import { useState } from "react";
import { useList, type Cat, type User } from "./api";
import { AuthForm } from "./AuthForm";
import { FeedingPanel } from "./FeedingPanel";
import { EditCatForm, NewCatForm } from "./NewCatForm";
import { CatAvatar, CatAvatarUpload } from "./PhotoUpload";
import { WeightPanel } from "./WeightPanel";
import { CatSelect } from "./CatSelect";
import { Button, ErrorBanner } from "./ui";
import { useCurrentUser } from "./useCurrentUser";

// 只記住「上次選的貓」；登入狀態在 HTTP-only Cookie，前端碰不到
const STORAGE_KEY = "cat-care:last-cat";

type Stored = { userId?: string; catId?: string };

// localStorage 在無痕模式或封鎖網站資料時可能無法使用
function readStored(): Stored {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function writeStored(value: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
}

// 上方兩個並排的方框共用樣式；h-full 讓同一列的方框一樣高
// min-w-0：避免很長的網址把手機版的單欄撐寬
const cardClass = "flex h-full min-w-0 flex-col rounded-3xl border border-line bg-card p-5 shadow-sm sm:p-6";

type Tab = "feeding" | "weight";

// 選好的貓：基本資料、編輯，以及過去的飲食／體重紀錄
function CatRecords({ cat, user, onCatUpdated }: { cat: Cat; user: User; onCatUpdated: () => void }) {
  const [tab, setTab] = useState<Tab>("feeding");
  const [editing, setEditing] = useState(false);
  const tabs: { id: Tab; label: string }[] = [
    { id: "feeding", label: "🍽️ 飲食" },
    { id: "weight", label: "⚖️ 體重" },
  ];

  return (
    <section aria-label={`${cat.name} 的紀錄`} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <CatAvatar src={cat.avatarUrl} name={cat.name} className="size-12 text-2xl" />
          <h2 className="min-w-0 text-2xl font-black break-words">
            {cat.name} 的紀錄
            <span className="block text-sm font-normal text-foreground/60 sm:ml-2 sm:inline sm:text-base">
              {cat.breed}・{cat.gender}・{cat.age}
            </span>
          </h2>
        </div>
        {!editing && (
          <Button variant="ghost" onClick={() => setEditing(true)} className="-mr-3 text-blush">
            ✏️ 編輯資料
          </Button>
        )}
      </div>

      {editing && (
        <div className="rounded-3xl border border-gold bg-gold-soft/40 p-4 sm:p-5">
          <h3 className="mb-4 text-lg font-black">編輯「{cat.name}」的資料</h3>
          <EditCatForm
            cat={cat}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              onCatUpdated();
              setEditing(false);
            }}
          />
        </div>
      )}

      <nav role="tablist" className="flex gap-1 rounded-full bg-line/70 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 flex-1 rounded-full text-sm font-bold transition-colors sm:min-h-10 sm:pointer-coarse:min-h-11 ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "feeding" ? <FeedingPanel cat={cat} user={user} /> : <WeightPanel cat={cat} user={user} />}
    </section>
  );
}

// 登入後的主畫面：上方「選擇貓咪｜登錄新貓咪」並排，選好貓後下方顯示牠的紀錄
function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { items: cats, error, reload } = useList<Cat>("/api/cats");
  // 這個元件只在瀏覽器端登入後才出現，可以直接讀 localStorage 還原上次選的貓
  const [catId, setCatId] = useState(() => {
    const stored = readStored();
    return stored.userId === user._id ? (stored.catId ?? "") : "";
  });
  const [justCreated, setJustCreated] = useState<{ cat: Cat; avatarError: string | null } | null>(null);
  const cat = cats?.find((c) => c._id === catId) ?? null;

  function selectCat(id: string) {
    setCatId(id);
    setJustCreated(null);
    writeStored({ userId: user._id, catId: id });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-3 rounded-full border border-line bg-card py-1.5 pr-1.5 pl-5">
        <p className="min-w-0 truncate text-sm text-foreground/60">
          🐾 已登入：<span className="font-bold text-foreground">{user.name}</span>
          {user.email && <span className="hidden sm:inline">（{user.email}）</span>}
        </p>
        <Button variant="ghost" onClick={onLogout} className="shrink-0 border border-line">
          登出
        </Button>
      </div>

      {/* 平板以上左右並排、方框等寬等高；手機上下排列 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className={cardClass}>
          <h2 className="mb-4 text-lg font-black">選擇貓咪</h2>
          <ErrorBanner message={error} />
          {cats === null && !error && <p className="text-sm text-foreground/60">載入中…</p>}
          {cats?.length === 0 && <p className="text-sm text-foreground/60">你還沒有登錄任何貓咪，請先在「登錄新貓咪」填寫資料。</p>}
          {cats && cats.length > 0 && <CatSelect label="我的貓" cats={cats} value={cat ? catId : ""} onChange={selectCat} />}
          {justCreated && (
            <div role="status" className="mt-3 flex flex-col gap-2 rounded-lg bg-gold-soft/50 px-3 py-2 text-sm text-foreground">
              已登錄「{justCreated.cat.name}」並幫你選好了，可以在下方開始記錄。
              {justCreated.avatarError && (
                <span className="text-red-700">大頭照沒有上傳成功（{justCreated.avatarError}），可以在下面重新上傳。</span>
              )}
            </div>
          )}
          {cats && cats.length > 0 && !cat && (
            <p className="mt-3 text-sm text-foreground/60">選好貓咪後，牠過去的飲食和體重紀錄會顯示在下方。</p>
          )}
          {cat && (
            <p className="mt-3 text-sm text-foreground/60">
              ⬇ 下方是「{cat.name}」的飲食和體重紀錄
            </p>
          )}
          {cat && (
            <div className="mt-5 border-t border-line pt-4">
              <CatAvatarUpload key={cat._id} cat={cat} onUpdated={() => reload()} />
            </div>
          )}
        </section>

        <section className={`${cardClass} border-dashed border-line bg-card/60`}>
          <h2 className="mb-1 text-lg font-black">登錄新貓咪</h2>
          <p className="mb-4 text-sm text-foreground/60">登錄後會自動選好這隻貓。</p>
          <NewCatForm
            onCreated={async (created, avatarError) => {
              await reload();
              selectCat(created._id);
              setJustCreated({ cat: created, avatarError });
            }}
          />
        </section>
      </div>

      {/* 以貓咪 id 當 key，換貓時重新載入紀錄並回到飲食分頁 */}
      {cat && <CatRecords key={cat._id} cat={cat} user={user} onCatUpdated={reload} />}
    </div>
  );
}

export function CatCareApp() {
  const { user, setUser, error, logout } = useCurrentUser();

  async function handleLogout() {
    writeStored({});
    await logout();
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-md">
        <ErrorBanner message={`無法載入資料：${error}`} />
      </div>
    );
  }
  if (user === undefined) return <p className="py-10 text-center text-sm text-foreground/60">載入中…</p>;
  if (!user) return <AuthForm onAuthed={(u) => setUser(u)} />;
  return <Dashboard key={user._id} user={user} onLogout={handleLogout} />;
}
