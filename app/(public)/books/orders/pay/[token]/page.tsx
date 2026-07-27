import BookPayPanel from "@/components/books/BookPayPanel";

export default async function BookOrderPayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <BookPayPanel paymentToken={token} />;
}
