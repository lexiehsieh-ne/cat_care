import Link from "next/link";
import { CatMark } from "@/components/CatMark";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-soft text-gold">
        <CatMark className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-black text-foreground">鏟屎官養成所</span>
        <span className="mt-1 font-display text-[11px] font-bold tracking-wider text-gold">
          Purr Academy
        </span>
      </span>
    </Link>
  );
}
