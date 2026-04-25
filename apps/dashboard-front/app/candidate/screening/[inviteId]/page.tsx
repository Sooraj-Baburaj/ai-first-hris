import { ScreeningVoiceSession } from "@/app/components/organisms/ScreeningVoiceSession";

type Props = {
  params: Promise<{ inviteId: string }>;
};

export default async function CandidateScreeningPage({ params }: Props) {
  const { inviteId } = await params;
  return <ScreeningVoiceSession inviteId={inviteId} />;
}
