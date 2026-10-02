import {
  BriefcaseBusiness,
  GraduationCap,
  HeartPulse,
  Laptop,
  Megaphone,
  PackageOpen,
  Plane,
  ShieldCheck,
  UserCheck,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ProgramIcon as ProgramIconKey, RequestBehavior } from "@/data/spend-programs";
import { cn } from "@/lib/cn";

const icons: Record<ProgramIconKey, LucideIcon> = {
  software: Laptop,
  travel: Plane,
  meals: Utensils,
  office: PackageOpen,
  events: Megaphone,
  learning: GraduationCap,
  hardware: BriefcaseBusiness,
  wellness: HeartPulse,
};

export const programIconOptions = Object.keys(icons) as ProgramIconKey[];

/** Program glyph in a soft square tile. */
export function ProgramIcon({ icon, size = 36, className }: { icon: ProgramIconKey; size?: number; className?: string }) {
  const Icon = icons[icon];
  return (
    <span
      style={{ width: size, height: size }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[6px] bg-muted text-ink-1", className)}
    >
      <Icon style={{ width: size * 0.45, height: size * 0.45 }} className="stroke-[1.5]" />
    </span>
  );
}

const behaviorIcons: Record<RequestBehavior, LucideIcon> = {
  approval: UserCheck,
  auto: Zap,
  admin: ShieldCheck,
};

export function RequestBehaviorIcon({ behavior, className }: { behavior: RequestBehavior; className?: string }) {
  const Icon = behaviorIcons[behavior];
  return <Icon className={cn("size-3.5 shrink-0 stroke-[1.5] text-ink-2", className)} />;
}
