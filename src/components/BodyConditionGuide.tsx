const FUR_FILL = "#cbb89f";
const STRIPE_COLOR = "#8a6a4a";
const OUTLINE = "#4a2f1f";

type Band = {
  label: string;
  color: string;
  bg: string;
};

const BANDS: Band[] = [
  { label: "低於理想體態", color: "#2f9e6a", bg: "#d7f0e2" },
  { label: "理想體態", color: "#c8933f", bg: "#f2dfb8" },
  { label: "高於理想體態", color: "#d9636f", bg: "#fbdde0" },
];

type Tier = {
  key: string;
  bandIndex: number;
  sideBody: string;
  sideStripes: string;
  sideDotX: number;
  sideDotY: number;
  waistHalf: number;
  topStripes: string;
  desc: string;
};

const CHEST_HALF = 9;
const CENTER_Y = 20;

function topBodyPath(waistHalf: number): string {
  const top = CENTER_Y - CHEST_HALF;
  const bottom = CENTER_Y + CHEST_HALF;
  const waistTop = CENTER_Y - waistHalf;
  const waistBottom = CENTER_Y + waistHalf;
  return [
    `M8,${CENTER_Y}`,
    `C 8,${CENTER_Y - 4} 14,${CENTER_Y - 4} 18,${CENTER_Y - 3}`,
    `C 22,${CENTER_Y - 5} 26,${top} 30,${top}`,
    `C 38,${top} 44,${waistTop} 50,${waistTop}`,
    `C 56,${waistTop} 62,${top} 70,${top}`,
    `C 76,${top} 82,${CENTER_Y - 4} 86,${CENTER_Y - 2}`,
    `L86,${CENTER_Y + 2}`,
    `C 82,${CENTER_Y + 4} 76,${bottom} 70,${bottom}`,
    `C 62,${bottom} 56,${waistBottom} 50,${waistBottom}`,
    `C 44,${waistBottom} 38,${bottom} 30,${bottom}`,
    `C 26,${bottom} 22,${CENTER_Y + 5} 18,${CENTER_Y + 3}`,
    `C 14,${CENTER_Y + 4} 8,${CENTER_Y + 4} 8,${CENTER_Y}`,
    "Z",
  ].join(" ");
}

function sideBodyPath(bellyPath: string): string {
  return `M15,15 C 35,8 75,8 102,17 C 108,22 102,29 ${bellyPath} C 18,29 11,21 15,15 Z`;
}

const TOP_STRIPES_DEFAULT =
  "M25,13 L25,27 M35,11 L35,29 M45,11 L45,29 M55,11 L55,29 M65,12 L65,28";

const TIERS: Tier[] = [
  {
    key: "very-thin",
    bandIndex: 0,
    sideBody: sideBodyPath("92,32 C 84,29 76,20 60,18 C 44,16 35,35 23,32"),
    sideStripes: "M40,12 q1,5 -1,9 M55,11 q1,6 -1,11 M70,12 q1,5 -1,9",
    sideDotX: 57,
    sideDotY: 22,
    waistHalf: 1.5,
    topStripes: TOP_STRIPES_DEFAULT,
    desc: "肋骨、脊椎與骨盆明顯凸出，幾乎摸不到脂肪，腰腹部明顯凹陷",
  },
  {
    key: "thin",
    bandIndex: 0,
    sideBody: sideBodyPath("92,33 C 83,30 75,23 60,21 C 45,19 35,36 23,33"),
    sideStripes: "M40,13 q1,6 -1,11 M55,12 q1,7 -1,13 M70,13 q1,6 -1,11",
    sideDotX: 57,
    sideDotY: 25,
    waistHalf: 3.5,
    topStripes: TOP_STRIPES_DEFAULT,
    desc: "肋骨、腰椎明顯可見，觸摸容易感覺到骨頭，肋骨後方腰身明顯",
  },
  {
    key: "ideal",
    bandIndex: 1,
    sideBody: sideBodyPath("92,34 C 82,31 72,29 60,28 C 48,27 35,35 23,33"),
    sideStripes: "M40,13 q1,7 -0.5,13 M55,12 q1,8 -0.5,15 M70,13 q1,7 -0.5,13",
    sideDotX: 58,
    sideDotY: 27,
    waistHalf: 6.5,
    topStripes: TOP_STRIPES_DEFAULT,
    desc: "看不到肋骨、但輕壓可摸到；從上方看肋骨後方有自然腰身曲線（腰椎骨、肋骨、腹部比例勻稱）",
  },
  {
    key: "chubby",
    bandIndex: 2,
    sideBody: sideBodyPath("93,34 C 85,33 78,35 65,34 C 50,33 35,38 23,33"),
    sideStripes: "M40,13 q1,8 -0.5,15 M55,12 q1,9 -0.5,17 M70,13 q1,8 -0.5,15",
    sideDotX: 58,
    sideDotY: 29,
    waistHalf: 8.5,
    topStripes: TOP_STRIPES_DEFAULT,
    desc: "肋骨不易觸摸到，有一層脂肪覆蓋，腰身不明顯、肚子略圓",
  },
  {
    key: "obese",
    bandIndex: 2,
    sideBody: sideBodyPath("94,35 C 85,40 78,45 65,45 C 50,45 35,41 23,34"),
    sideStripes: "M40,13 q1,9 -0.5,17 M55,12 q1,10 -0.5,19 M70,13 q1,9 -0.5,17",
    sideDotX: 58,
    sideDotY: 32,
    waistHalf: 11,
    topStripes: TOP_STRIPES_DEFAULT,
    desc: "完全摸不到肋骨，脂肪堆積於軀幹與四肢，沒有腰身、腹部明顯下垂膨大",
  },
];

function SideSilhouette({ tier, dotColor }: { tier: Tier; dotColor: string }) {
  return (
    <svg viewBox="0 0 120 60" className="h-10 w-full" aria-hidden="true">
      <path d={tier.sideBody} fill={FUR_FILL} stroke={OUTLINE} strokeWidth={2} />
      <path
        d="M9,17 Q7,10 5,6 Q11,9 15,14 Z"
        fill={FUR_FILL}
        stroke={OUTLINE}
        strokeWidth={1.6}
      />
      <path
        d="M21,15 Q25,8 29,5 Q26,10 23,15 Z"
        fill={FUR_FILL}
        stroke={OUTLINE}
        strokeWidth={1.6}
      />
      <circle cx="17" cy="23" r="9" fill={FUR_FILL} stroke={OUTLINE} strokeWidth={2} />
      <circle cx="14" cy="22" r="1" fill={OUTLINE} />
      <path
        d={tier.sideStripes}
        fill="none"
        stroke={STRIPE_COLOR}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <path
        d="M27,36 L25,52 M21,52 L29,52 M90,37 L94,52 M90,52 L98,52"
        fill="none"
        stroke={OUTLINE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M102,17 C 112,20 118,10 114,3"
        fill="none"
        stroke={OUTLINE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={tier.sideDotX} cy={tier.sideDotY} r="2.6" fill={dotColor} />
    </svg>
  );
}

function TopSilhouette({ tier, dotColor }: { tier: Tier; dotColor: string }) {
  const dotY = Math.max(12, Math.min(28, 20 - tier.waistHalf + 2));
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" aria-hidden="true">
      <path d={topBodyPath(tier.waistHalf)} fill={FUR_FILL} stroke={OUTLINE} strokeWidth={2} />
      <path
        d="M9,15 L5,6 L16,12 Z"
        fill={FUR_FILL}
        stroke={OUTLINE}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M9,25 L5,34 L16,28 Z"
        fill={FUR_FILL}
        stroke={OUTLINE}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d={tier.topStripes}
        fill="none"
        stroke={STRIPE_COLOR}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <path
        d="M86,20 C 95,14 97,28 88,27"
        fill="none"
        stroke={OUTLINE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx="50" cy={dotY} r="2.4" fill={dotColor} />
    </svg>
  );
}

export function BodyConditionGuide() {
  return (
    <div className="flex flex-col gap-3">
      {BANDS.map((band, bandIndex) => (
        <div key={band.label} className="flex flex-col gap-2">
          <span className="text-xs font-black" style={{ color: band.color }}>
            {band.label}
          </span>
          {TIERS.filter((t) => t.bandIndex === bandIndex).map((tier) => (
            <div
              key={tier.key}
              className="flex items-center gap-3 rounded-xl p-2.5"
              style={{ backgroundColor: band.bg }}
            >
              <div className="flex w-24 shrink-0 flex-col gap-1.5">
                <SideSilhouette tier={tier} dotColor={band.color} />
                <TopSilhouette tier={tier} dotColor={band.color} />
              </div>
              <p className="min-w-0 flex-1 text-[11px] leading-snug text-foreground/70">
                {tier.desc}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
