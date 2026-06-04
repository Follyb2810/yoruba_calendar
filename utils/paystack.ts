import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to .env");
  return key;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${secretKey()}`,
    "Content-Type": "application/json",
  };
}

export function nairaToKobo(amountNaira: number): number {
  return Math.round(amountNaira * 100);
}

export function generateReference(prefix = "KJD") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateFeedbackToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function platformFeePercent(): number {
  const raw = process.env.PLATFORM_FEE_PERCENT ?? "10";
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 10;
}

export function calculateCreatorPayout(amountKobo: number): {
  creatorAmount: number;
  platformFee: number;
} {
  if (amountKobo <= 0) return { creatorAmount: 0, platformFee: 0 };
  const platformFee = Math.round((amountKobo * platformFeePercent()) / 100);
  return {
    platformFee,
    creatorAmount: amountKobo - platformFee,
  };
}

export async function initializePaystackPayment(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      currency: "NGN",
    }),
  });

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message ?? "Failed to initialize payment");
  }

  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function verifyPaystackPayment(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } }
  );

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message ?? "Verification failed");
  }

  return data.data as {
    status: string;
    reference: string;
    amount: number;
    metadata: Record<string, unknown>;
  };
}

export type PaystackBank = { name: string; code: string };

export async function listPaystackBanks(): Promise<PaystackBank[]> {
  const res = await fetch(`${PAYSTACK_BASE}/bank?country=nigeria`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? "Failed to load banks");
  return (data.data as PaystackBank[]).sort((a, b) => a.name.localeCompare(b.name));
}

export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      type: "nuban",
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: "NGN",
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message ?? "Could not verify bank account");
  }

  return data.data as {
    recipient_code: string;
    details: { account_number: string; bank_name: string; account_name: string };
  };
}

export async function initiatePaystackTransfer(params: {
  amountKobo: number;
  recipientCode: string;
  reason: string;
  reference: string;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transfer`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      source: "balance",
      amount: params.amountKobo,
      recipient: params.recipientCode,
      reason: params.reason,
      reference: params.reference,
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message ?? "Transfer failed");
  }

  return data.data as {
    reference: string;
    transfer_code: string;
    status: string;
  };
}
