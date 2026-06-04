const PAYSTACK_BASE = "https://api.paystack.co";

export function nairaToKobo(amountNaira: number): number {
  return Math.round(amountNaira * 100);
}

export function generateReference(prefix = "KJD") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function initializePaystackPayment(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to .env");
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
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
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Paystack is not configured");
  }

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
    }
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
