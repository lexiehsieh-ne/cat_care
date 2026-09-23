import { Ribbon } from "@/components/Ribbon";
import { InfoGrid } from "@/components/InfoGrid";

const HABITS = [
  {
    emoji: "🌙",
    title: "晨昏活動型動物",
    description:
      "貓咪並非完全夜行性，而是在黎明與黃昏時分最活躍（曙暮性），白天和深夜大多在睡覺，一天可睡上 12～16 小時。",
  },
  {
    emoji: "🪵",
    title: "磨爪是天性",
    description:
      "磨爪能磨除舊爪鞘、伸展肌肉，並透過爪間腺體留下氣味標記地盤，不是壞習慣，務必提供貓抓板或貓抓柱。",
  },
  {
    emoji: "🧼",
    title: "理毛行為",
    description:
      "貓咪每天花大量時間舔毛，除了清潔，也有調節體溫、緩解壓力的作用。過度理毛（舔到掉毛）可能是焦慮或皮膚問題的警訊。",
  },
  {
    emoji: "🐾",
    title: "領域性強",
    description:
      "貓咪對氣味與空間非常敏感，會用臉頰、身體磨蹭家具或人來標記氣味，環境或家具大搬動可能讓牠們一時緊張不安。",
  },
  {
    emoji: "🏔️",
    title: "喜歡垂直空間",
    description:
      "貓咪在野外會利用高處觀察環境、躲避威脅，家中提供貓跳台、貓咪走道能滿足牠們居高臨下的安全感。",
  },
  {
    emoji: "📦",
    title: "熱愛狹小空間",
    description:
      "紙箱、袋子、櫃子縫隙對貓咪來說是絕佳的躲藏處，狹小空間能帶來包覆感與安全感，是天生的行為，不是怪癖。",
  },
  {
    emoji: "😼",
    title: "肢體語言會說話",
    description:
      "尾巴直立代表自信愉快、尾巴快速甩動代表不耐煩或警戒；耳朵朝後貼平多半是害怕或防禦；呼嚕聲除了滿足，有時也代表緊張或自我安撫。",
  },
  {
    emoji: "🎯",
    title: "狩獵本能",
    description:
      "即使是家貓也保有狩獵天性，會對移動的小物體（逗貓棒、雷射點、蟲子）產生強烈興趣，每天安排玩耍時間有助紓解精力與壓力。",
  },
  {
    emoji: "🐈",
    title: "翻肚不代表想讓你摸肚子",
    description:
      "貓咪把肚子露出來通常是放鬆、信任的表現，但不一定代表想被摸——貿然摸肚子很容易被巴或咬，摸之前建議先觀察牠的反應。",
  },
];

export function CatBehaviorSection() {
  return (
    <section id="cat-behavior" className="flex scroll-mt-20 flex-col items-center bg-background px-6 py-16">
      <div className="w-full max-w-5xl">
        <Ribbon>🐾 貓咪習性介紹</Ribbon>
        <h2 className="mt-5 text-3xl font-black text-foreground sm:text-4xl">
          習性小百科
        </h2>
        <p className="mt-2 font-script text-3xl text-sage">喵星人的日常</p>
        <p className="mt-3 max-w-2xl text-foreground/70">
          認識貓咪的天性，才能給牠們真正需要的生活環境。
        </p>

        <InfoGrid items={HABITS} />
      </div>
    </section>
  );
}
