import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SkillNavigation } from "@/components/vault/skill-navigation";

export default async function SkillLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ skill: string }>;
}) {
  const session = await getServerSession(authOptions);
  // console.log("The session is here: ", session);
  // if (!session) {
  //   redirect("/auth/signin");
  // }
  const { skill: skillId } = await params;
  return (
    <div>
      <SkillNavigation skillId={skillId} />
      {children}
    </div>
  );
}
