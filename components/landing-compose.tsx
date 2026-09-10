"use client";

import { useRouter } from "next/navigation";
import { Compose } from "@/components/ui/compose";

const mentions = [{ id: "club", label: "club-members", sublabel: "the whole collective" }, { id: "admin", label: "club-admin", sublabel: "membership manager" }];
const commands = [{ id: "fund", label: "fund", hint: "Request Test POL" }, { id: "event", label: "event", hint: "Propose a club event" }, { id: "vote", label: "vote", hint: "Open a governance vote" }];

export function LandingCompose() {
  const router = useRouter();
  return <Compose mentions={mentions} commands={commands} defaultValue="Propose the next open-source night for @club-members " onSubmit={() => router.push("/login")} />;
}
