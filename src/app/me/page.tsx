import { MeClient } from "@/components/me-client";
import { requireSessionUser } from "@/lib/server-auth";
import { ThreeBackground } from "@/components/three-background";

export default async function MePage() {
  const user = await requireSessionUser();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ThreeBackground />
      <MeClient email={user.email ?? null} />
    </main>
  );
}
