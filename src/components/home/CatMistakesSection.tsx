import { Hospital } from "lucide-react";
import { Ribbon } from "@/components/Ribbon";
import { InfoGrid } from "@/components/InfoGrid";

const MISTAKES = [
  {
    emoji: "⚕️",
    icon: <Hospital className="h-9 w-9 text-blush" />,
    title: "沒有絕育",
    description:
      "未絕育容易出現亂尿標記地盤、發情嚎叫、攻擊性增加等行為問題，也可能造成不必要的繁殖與流浪動物問題，建議適齡帶去絕育。",
  },
  {
    emoji: "🪟",
    title: "門窗防護不足",
    description:
      "有紗窗不等於做好防護措施，一般紗窗擋不住貓咪的抓咬與衝撞力道，容易破洞或脫落，造成貓咪墜樓或走失。建議加裝專用防墜網、隱形鐵窗或加固型寵物紗窗，門口進出也要養成隨手關門的習慣。",
  },
  {
    emoji: "🚽",
    title: "貓砂盆沒有勤加清理",
    description:
      "貓咪對貓砂盆的乾淨度非常在意，長期不清理容易讓貓咪憋尿、亂尿尿，甚至引發泌尿道疾病。建議每天至少清理一次。",
  },
  {
    emoji: "💧",
    title: "忽略水分攝取",
    description:
      "貓咪天生飲水量偏少，長期水分不足容易導致腎臟與泌尿道問題。建議搭配濕食、多處放置水碗，或使用飲水機提高喝水意願。",
  },
  {
    emoji: "🍫",
    title: "隨意餵食人類食物",
    description:
      "洋蔥、大蒜、巧克力、葡萄、酒精、木糖醇等對貓咪是有毒的，即使少量也可能造成中毒，切勿因為貓咪討食就隨手分享食物。",
  },
  {
    emoji: "🪑",
    title: "沒有提供磨爪環境就責罵貓咪",
    description:
      "抓家具是貓咪的天性，不是故意搗蛋。沒有準備足夠的貓抓板卻責罵或體罰，只會讓貓咪感到困惑害怕，無法根本解決問題。",
  },
  {
    emoji: "💉",
    title: "忽略定期驅蟲、疫苗與健康檢查",
    description:
      "即使是室內貓也需要定期施打疫苗、體內外驅蟲，並安排年度健康檢查，許多疾病在早期沒有明顯症狀，定期檢查才能及早發現。",
  },
  {
    emoji: "🔇",
    title: "長時間忽略互動與陪伴",
    description:
      "貓咪雖然獨立，但仍需要適度的互動與玩耍。長期缺乏刺激與陪伴，容易導致肥胖、行為問題甚至憂鬱。",
  },
  {
    emoji: "✋",
    title: "用體罰或大聲斥責來糾正行為",
    description:
      "打罵不僅無法讓貓咪理解「錯在哪」，反而會破壞信任感，讓貓咪對人產生恐懼或攻擊性。應以正向引導、轉移注意力的方式糾正行為。",
  },
];

export function CatMistakesSection() {
  return (
    <section id="cat-mistakes" className="flex scroll-mt-20 flex-col items-center bg-background px-6 py-16 border-t border-line">
      <div className="w-full max-w-5xl">
        <Ribbon>⚠️ 飼養常見錯誤</Ribbon>
        <h2 className="mt-5 text-3xl font-black text-foreground sm:text-4xl">
          新手地雷區
        </h2>
        <p className="mt-2 font-script text-3xl text-sage">貓奴養成筆記</p>
        <p className="mt-3 max-w-2xl text-foreground/70">
          養貓新手最容易忽略的地方，提早避開能讓貓咪住得更安心健康。
        </p>

        <InfoGrid items={MISTAKES} />
      </div>
    </section>
  );
}
