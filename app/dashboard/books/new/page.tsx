import BookForm from "@/components/dashboard/books/BookForm";

export default function NewBookPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">List a Physical Book</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload cover photos only — buyers receive the printed book via delivery or pickup
        </p>
      </div>
      <BookForm mode="create" />
    </section>
  );
}
