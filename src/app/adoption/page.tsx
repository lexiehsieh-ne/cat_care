import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/Header";
import { MarketingFooter } from "@/components/marketing/Footer";
import { AdoptionContent } from "@/components/adoption/AdoptionContent";

export const metadata: Metadata = {
  title: "領養小玳瑁｜鏟屎官養成所",
  description: "兩隻約 3 個月大的玳瑁小姊妹，血檢過關、疫苗驅蟲完成，正在尋找永遠的家。",
};

export default function AdoptionPage() {
  return (
    <>
      <MarketingHeader />
      <AdoptionContent />
      <MarketingFooter />
    </>
  );
}
