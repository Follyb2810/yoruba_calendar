"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function NewOrisaPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitOrisa() {
    if (!name) return toast.error("Orisa name is required");

    setLoading(true);

    const createOrisa = async () => {
      const res = await fetch("/api/orisha", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create Orisa");
      }

      return res.json();
    };

    try {
      const data = await toast.promise(createOrisa(), {
        loading: "Creating Orisa...",
        success: (data) => `Orisa "${data.name}" created!`,
        error: (err) => err.message || "Something went wrong",
      });

      setName("");
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
