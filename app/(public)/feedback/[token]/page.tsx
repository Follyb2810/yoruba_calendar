import FeedbackForm from "@/components/feedback/FeedbackForm";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <FeedbackForm token={token} />;
}
