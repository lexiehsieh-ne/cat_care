import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ExternalLink, MapPin, MessageCircle, PawPrint } from "lucide-react";
import { Ribbon } from "@/components/Ribbon";
import { Polaroid } from "@/components/adoption/Polaroid";
import { PhotoCarousel } from "@/components/adoption/PhotoCarousel";
import { VideoPreview } from "@/components/adoption/VideoPreview";
import { ShareButton } from "@/components/adoption/ShareButton";

function fileExists(name: string) {
  return fs.existsSync(
    path.join(process.cwd(), "public", "images", name),
  );
}

const TRAITS = [
  "血檢過關",
  "第一劑預防針已完成",
  "體內外驅蟲已完成",
  "精神好、食慾佳，會自己使用貓砂",
  "姊妹感情超好，會互相梳毛、抱著睡覺",
];

const ADOPTION_NOTES = [
  "年滿 25 歲，收入穩定",
  "需施打晶片疫苗及絕育",
  "接受家訪",
  "需配合定期追蹤近況",
  "需簽署認養同意書",
];

const NOT_ACCEPTED = ["情侶、套房恕不適合", "不配合家訪、不做防護者恕不適合"];

// 愛媽的臉書：CTA 和下方聯絡列共用
const FOSTER_FACEBOOK_URL = "https://www.facebook.com/peng.lan.hui.988785";

// 領養介紹頁內容（照 adoption 網站首頁複製，刪掉「延伸閱讀」區塊）
export function AdoptionContent() {
  const heroPhoto = fileExists("cat.png") ? "cat.png" : "sister.jpg";
  const aboutPhoto = fileExists("sister3.jpg") ? "sister3.jpg" : "older.jpg";
  const dailyVideos = [
    { file: "play.mp4", caption: "一起玩耍" },
    { file: "touch.mp4", caption: "討摸互動" },
    { file: "drink.mp4", caption: "喝水時間" },
  ].filter((video) => fileExists(video.file));

  const gallery = [
    "young.jpg",
    "older.jpg",
    "sister.jpg",
    "older2.jpg",
    "sister3.jpg",
    "older3.jpg",
    "sister2.jpg",
    "young2.jpg",
  ]
    .filter((file) => fileExists(file))
    .map((file) => `/images/${file}`);

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-5xl gap-16 px-6 pb-20 pt-16 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="flex items-center gap-3 text-blush">
            <span aria-hidden>♡</span>
            <span className="font-script text-2xl">兩隻小玳瑁</span>
            <span aria-hidden>♡</span>
          </div>

          <h1 className="mt-3 text-5xl font-black leading-[1.05] text-foreground sm:text-6xl">
            正在尋找
            <br />
            <span className="text-blush">永遠的家</span>
          </h1>

          <Ribbon className="mt-6">領養．陪伴．拯救一個生命</Ribbon>

          <p className="mt-6 max-w-md leading-7 text-foreground/70">
            兩隻玳瑁女生，約 3 個月大，血檢過關、疫苗驅蟲都已完成，健康活潑、食慾佳，姊妹感情超好，希望能找到願意長期照顧、給牠們一個安穩家庭的貓奴。
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-4 py-1.5 text-sm font-bold text-foreground">
            ⭐ 雙貓優先領養，姊妹一起帶走更安心
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={FOSTER_FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background shadow-lg transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              聯絡愛媽
            </a>
            <a
              href="#adopt"
              className="rounded-full border-2 border-foreground/20 bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-foreground/40"
            >
              認養須知
            </a>
            <Link
              href="/#cat-behavior"
              className="rounded-full border-2 border-foreground/20 bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-foreground/40"
            >
              先了解貓咪習性
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <Polaroid
            src={`/images/${heroPhoto}`}
            alt="玳瑁小姊妹與手繪插畫"
            className="aspect-[4/3] w-full rotate-2"
          />
          <div className="absolute -right-3 -top-3 z-10 flex h-20 w-20 rotate-6 flex-col items-center justify-center rounded-full border-4 border-dashed border-background bg-foreground text-center text-background shadow-lg sm:-right-6 sm:-top-6 sm:h-24 sm:w-24">
            <span className="text-[10px] font-bold leading-tight sm:text-[11px]">年齡</span>
            <span className="text-xs font-black leading-tight sm:text-sm">約 3 個月</span>
          </div>
        </div>
      </section>

      {/* About us */}
      <section className="border-y border-line bg-card/60">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Ribbon>🐾 關於我們</Ribbon>
            <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
              玳瑁貓是開盲盒，越長只會越驚艷！
            </h2>
            <p className="mt-3 max-w-lg text-foreground/70">
              很多人對玳瑁有偏見，但養過的都知道，玳瑁根本是「驚喜包」！小時候看似低調，長大毛色亮起來真的美爆，而且性格超級黏人又聰明，完全是貓界隱藏版極品。兩隻從小一起長大，會互相幫忙梳毛、打鬧、抱在一起睡覺——很適合新手雙貓家庭，一起帶走能大幅減少分離焦慮，主人上班也不用擔心牠們孤單。
            </p>

            <ul className="mt-6 space-y-3">
              {TRAITS.map((trait) => (
                <li
                  key={trait}
                  className="flex items-center gap-3 text-foreground/80"
                >
                  <PawPrint className="h-4 w-4 shrink-0 text-blush" />
                  {trait}
                </li>
              ))}
            </ul>
          </div>

          <Polaroid
            src={`/images/${aboutPhoto}`}
            alt="玳瑁小貓"
            className="mx-auto w-full max-w-xs -rotate-2"
          />
        </div>
      </section>

      {/* Daily life videos */}
      {dailyVideos.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <Ribbon>🎬 日常花絮</Ribbon>
          <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
            看看牠們平常在做什麼
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {dailyVideos.map((video) => (
              <VideoPreview
                key={video.file}
                src={`/images/${video.file}`}
                caption={video.caption}
              />
            ))}
          </div>
        </section>
      )}

      {/* Photo gallery */}
      {gallery.length > 0 && (
        <section className="w-full py-16">
          <div className="mx-auto max-w-5xl px-6">
            <Ribbon>📸 貓咪寫真區</Ribbon>
            <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
              越看越心動
            </h2>
          </div>

          <div className="mt-8">
            <PhotoCarousel photos={gallery} />
          </div>
        </section>
      )}

      {/* Adoption preference */}
      <section id="adopt" className="border-y border-line bg-card/60">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Ribbon>📋 認養須知</Ribbon>
          <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
            在決定認養之前
          </h2>

          <div className="mt-6 max-w-2xl rounded-2xl border-2 border-dashed border-foreground/25 bg-background p-6 text-sm leading-7 text-foreground/80">
            我們希望找到願意負責任的認養人，能給牠們一輩子的愛與安全感。請務必確定自己已經準備好，願意承擔長期照顧的責任，再考慮認養。
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {ADOPTION_NOTES.map((note) => (
              <li
                key={note}
                className="flex items-start gap-3 rounded-2xl border border-line bg-card p-5 text-sm leading-6 text-foreground/80"
              >
                <PawPrint className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {note}
              </li>
            ))}
          </ul>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-foreground/25 bg-background px-5 py-2 text-sm font-bold text-foreground">
            🏠 我們值得一個安全、不放養的室內家
          </div>

          {/* 禁止項目：上下粗線框起來的告示版面，右側蓋上「婉拒」朱紅印章 */}
          <div className="mt-10 border-y-2 border-foreground">
            <div className="flex items-center justify-between gap-4 border-b border-foreground/15 py-3">
              <p className="flex items-center gap-3 text-xl font-black tracking-[0.25em] text-seal sm:text-2xl">
                {/* 實心朱紅小方印，和右側「婉拒」印章呼應 */}
                <span aria-hidden className="flex size-7 items-center justify-center rounded-[3px] bg-seal text-sm tracking-normal text-background sm:size-8 sm:text-base">
                  禁
                </span>
                恕不考慮
              </p>
              <span className="font-display text-[11px] font-bold tracking-[0.35em] text-foreground/45">NOT ACCEPTED</span>
            </div>
            <ul className="divide-y divide-dashed divide-foreground/25">
              {NOT_ACCEPTED.map((note, i) => (
                <li key={note} className="flex items-center gap-4 py-5 pr-2 sm:gap-6 sm:py-6 sm:pr-3">
                  <span className="w-7 shrink-0 font-display text-sm font-bold tabular-nums text-foreground/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-lg font-black leading-snug text-balance text-foreground sm:text-2xl">{note}</span>
                  {/* 手蓋的方形印章：雙框、微傾斜 */}
                  <span
                    aria-hidden
                    className="flex size-12 shrink-0 -rotate-6 flex-col items-center justify-center rounded-[3px] border-2 border-seal text-[15px] font-black leading-[1.05] text-seal opacity-90 outline outline-1 outline-offset-2 outline-seal/60 sm:size-14 sm:text-[17px]"
                  >
                    <span>婉</span>
                    <span>拒</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA：聯絡愛媽預約和小貓互動 */}
      <section id="contact" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-foreground/25 bg-gold-soft px-4 py-12 text-center shadow-lg sm:px-12">
          <span aria-hidden className="pointer-events-none absolute -top-4 -left-2 text-7xl opacity-20 sm:text-8xl">🐾</span>
          <span aria-hidden className="pointer-events-none absolute -right-2 -bottom-4 text-7xl opacity-20 sm:text-8xl">🐾</span>

          <Ribbon>💌 想見見牠們嗎？</Ribbon>
          <h2 className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            聯絡愛媽，
            <span className="inline-block text-blush">預約和小貓互動</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-foreground/75">
            親自來摸摸牠們、陪牠們玩一下，看看是不是你命中注定的那一隻（或兩隻）。透過 Facebook 私訊愛媽彭蘭慧，約個時間到台北市松山區見面吧！
          </p>

          <a
            href={FOSTER_FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-foreground px-5 py-4 text-base font-black text-background shadow-xl transition hover:-translate-y-0.5 hover:opacity-95 sm:gap-3 sm:px-8 sm:text-lg"
          >
            <MessageCircle className="h-5 w-5" />
            聯絡愛媽預約和小貓互動
            <ExternalLink className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      {/* Contact bar */}
      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-5xl gap-8 divide-y divide-background/15 px-6 py-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-4 pt-6 first:pt-0 sm:justify-center sm:pt-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background/10">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-background/60">地點</p>
              <p className="font-bold">台北市松山區</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-6 sm:justify-center sm:pt-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background/10">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-background/60">聯絡方式</p>
              <a
                href={FOSTER_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline-offset-2 hover:underline"
              >
                FB 私訊：彭蘭慧
              </a>
            </div>
          </div>
          <div className="flex items-center pt-6 sm:justify-center sm:pt-0">
            <ShareButton />
          </div>
        </div>
      </section>
    </div>
  );
}
