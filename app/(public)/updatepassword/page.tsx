"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UpdatePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        setHasPassword(data.hasPassword);
      } catch {
        /* keep default */
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Update Password</h1>

      {hasPassword && (
        <div className="space-y-1">
          <Label htmlFor="current">Current Password</Label>
          <Input
            id="current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
      )}

      {!hasPassword && (
        <p className="text-sm text-muted-foreground">
          You signed in with a social account. Set a password to also sign in
          with email.
        </p>
      )}

      <div className="space-y-1">
        <Label htmlFor="new">New Password</Label>
        <Input
          id="new"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating…" : "Update Password"}
      </Button>

      {success && (
        <p className="text-green-600 text-sm">Password updated successfully!</p>
      )}
      {message && <p className="text-red-500 text-sm">{message}</p>}
    </form>
  );
}
