"use client";

import { useToast } from "@/hooks/useToast";
import { useState } from "react";

export default function NewOrisaPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { success: SuccessToast, error: ErrToast } = useToast();
  async function submitOrisa() {
    if (!name) return ErrToast("Orisa name is required");
    setLoading(true);

    try {
      const res = await fetch("/api/orisha", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create Orisa");
      const data = await res.json();
      SuccessToast(`Orisa "${data.name}" created!`);
      setName("");
    } catch (err: any) {
      ErrToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <h1 className="text-xl font-bold">Create New Orisa</h1>
      <input
        className="w-full p-2 border rounded"
        placeholder="Orisa Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-primary text-white rounded"
        disabled={loading}
        onClick={submitOrisa}
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </section>
  );
}
