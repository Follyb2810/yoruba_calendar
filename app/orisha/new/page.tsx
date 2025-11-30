"use client";

import { useState } from "react";

export default function NewOrisaPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitOrisa() {
    if (!name) return setMessage("Orisa name is required");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/orisha", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create Orisa");
      const data = await res.json();
      setMessage(`Orisa "${data.name}" created!`);
      setName("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
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
      {message && <p>{message}</p>}
    </div>
  );
}
