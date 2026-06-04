"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

type Bank = { code: string; name: string };

export default function CreatorPayoutForm() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [account, setAccount] = useState<{
    bankName: string;
    accountName: string;
    accountLast4: string;
  } | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/paystack/banks").then((r) => r.json()),
      fetch("/api/creator/payout-account").then((r) => r.json()),
    ])
      .then(([banksData, accountData]) => {
        setBanks(banksData.banks ?? []);
        if (accountData.account?.configured) {
          setAccount(accountData.account);
        }
      })
      .catch(() => toast.error("Could not load payout settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/creator/payout-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode, accountNumber, accountName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      toast.success(data.message);
      setAccount(data.account);
      setAccountNumber("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground py-8 text-center">Loading…</p>;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-orange-500" />
          Payout account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your bank to receive payment when orders are fulfilled. Platform fee (default 10%) is deducted before transfer.
        </p>

        {account && (
          <div className="rounded-lg border bg-green-50/50 border-green-200 p-4 text-sm">
            <p className="font-medium text-green-800">Account connected</p>
            <p className="text-muted-foreground mt-1">
              {account.accountName} · {account.bankName} · ****{account.accountLast4}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Bank</Label>
            <Select value={bankCode} onValueChange={setBankCode} required>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {banks.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="acct">Account number</Label>
            <Input
              id="acct"
              inputMode="numeric"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="10 digits"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Account name</Label>
            <Input
              id="name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="As on bank account"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600 w-full"
          >
            {submitting ? "Verifying…" : account ? "Update account" : "Save payout account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
