import { NextRequest, NextResponse } from "next/server";
import {
  failPaystackReference,
  resolvePaystackReference,
  verifyPaystackWebhookSignature,
} from "@/utils/paystack-webhook";
import { payoutService } from "@/module/Payout/payout.service";

type PaystackWebhookEvent = {
  event: string;
  data: {
    reference?: string;
    status?: string;
  };
};

// POST /api/paystack/webhook
// Register in Paystack Dashboard → Settings → Webhooks:
// https://yourdomain.com/api/paystack/webhook
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as PaystackWebhookEvent;
    const reference = event.data?.reference;

    switch (event.event) {
      case "charge.success":
        if (reference && event.data.status === "success") {
          await resolvePaystackReference(reference);
        }
        break;

      case "charge.failed":
        if (reference) await failPaystackReference(reference);
        break;

      case "transfer.success":
        if (reference) await payoutService.markTransferComplete(reference);
        break;

      case "transfer.failed":
      case "transfer.reversed":
        if (reference) await payoutService.markTransferFailed(reference);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paystack webhook]", err);
    return NextResponse.json({ received: true });
  }
}
