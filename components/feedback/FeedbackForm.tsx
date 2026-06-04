"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle } from "lucide-react";

type Preview = {
  orderType: string;
  title: string;
  subtitle: string;
  alreadySubmitted: boolean;
  rating: number | null;
};

export default function FeedbackPage({ token }: { token: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/feedback/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.preview) {
          setPreview(data.preview);
          if (data.preview.rating) setRating(data.preview.rating);
          if (data.preview.alreadySubmitted) setDone(true);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function submit() {
    if (rating < 1) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      toast.success("Thank you for your feedback!");
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-center py-20 text-muted-foreground">Loading…</p>;
  }

  if (!preview) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        This feedback link is invalid or expired.
      </p>
    );
  }

  if (done) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Thank you!</h1>
        <p className="text-muted-foreground">
          Your feedback for <strong>{preview.title}</strong> helps creators improve.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">How was your experience?</h1>
        <p className="text-muted-foreground">
          {preview.title}
          <span className="block text-sm">{preview.subtitle}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="p-1 transition hover:scale-110"
            aria-label={`Rate ${n} stars`}
          >
            <Star
              className={`h-10 w-10 ${
                n <= rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comments (optional)</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what went well or what could improve…"
          rows={4}
        />
      </div>

      <Button
        onClick={submit}
        disabled={submitting || rating < 1}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        {submitting ? "Submitting…" : "Submit feedback"}
      </Button>
    </div>
  );
}
