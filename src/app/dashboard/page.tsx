import { DashboardClient } from "@/components/dashboard-client";
import { requireSessionUser } from "@/lib/server-auth";
import { ThreeBackground } from "@/components/three-background";

export default async function DashboardPage() {
  const user = await requireSessionUser();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ThreeBackground />
      <DashboardClient email={user.email ?? null} />
    </main>
  );
}
