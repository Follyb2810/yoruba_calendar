import { prisma } from "@/utils/prisma-client";
import { sendEmail, formatNairaPlain } from "@/utils/email";
import { fulfillmentLabel } from "@/utils/serializeBook";

function feedbackUrl(token: string | null): string | null {
  if (!token) return null;
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/feedback/${token}`;
}

function paymentUrl(token: string | null): string | null {
  if (!token) return null;
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/books/orders/pay/${token}`;
}

export async function notifyBookOrderPlaced(orderId: number): Promise<void> {
  const order = await prisma.bookOrder.findUnique({
    where: { id: orderId },
    include: {
      book: { include: { user: { select: { email: true, name: true } } } },
      user: { select: { email: true, name: true } },
    },
  });

  if (!order || order.status !== "ORDERED") return;

  const buyerName = order.user.name ?? order.user.email;
  const fulfillment = fulfillmentLabel(order.fulfillmentMethod);

  await sendEmail({
    to: order.user.email,
    subject: `Order placed — ${order.book.title}`,
    text: `Hi ${buyerName},\n\nYour order for "${order.book.title}" is placed. Pay after you receive the book.\n\n— Kọ́jọ́dá`,
    html: `<p>Hi ${buyerName},</p><p>Order placed for <strong>${order.book.title}</strong>.</p><p><strong>Pay on receipt</strong> — you'll pay after delivery or pickup.</p>`,
  });

  await sendEmail({
    to: order.book.user.email,
    subject: `New book order — ${order.book.title}`,
    text: `New order from ${buyerName} (${order.user.email}). ${fulfillment}. Mark ready in Dashboard → Orders.\n\n— Kọ́jọ́dá`,
    html: `<p>New order for <strong>${order.book.title}</strong> from ${buyerName}.</p><p>Mark ready when sent or available for pickup.</p>`,
  });
}

export async function notifyBookOrderReadyForPayment(orderId: number): Promise<void> {
  const order = await prisma.bookOrder.findUnique({
    where: { id: orderId },
    include: { book: true, user: { select: { email: true, name: true } } },
  });

  if (!order || order.status !== "AWAITING_PAYMENT") return;

  const buyerName = order.user.name ?? order.user.email;
  const payLink = paymentUrl(order.paymentToken);
  const amount = formatNairaPlain(order.amount / 100);

  await sendEmail({
    to: order.user.email,
    subject: `Your book is ready — confirm & pay`,
    text: `Hi ${buyerName},\n\n"${order.book.title}" is ready (${amount}). Confirm receipt and pay: ${payLink}\n\n— Kọ́jọ́dá`,
    html: `<p>Hi ${buyerName},</p><p><strong>${order.book.title}</strong> is ready.</p><p><a href="${payLink}">Confirm I received it & pay ${amount}</a></p>`,
  });
}

export async function notifyBookOrderSuccess(orderId: number): Promise<void> {
  const order = await prisma.bookOrder.findUnique({
    where: { id: orderId },
    include: {
      book: { include: { user: { select: { email: true, name: true } } } },
      user: { select: { email: true, name: true } },
    },
  });

  if (!order || order.status !== "SUCCESS") return;

  const buyerName = order.user.name ?? order.user.email;
  const amount = formatNairaPlain(order.amount / 100);
  const rateLink = feedbackUrl(order.feedbackToken);

  await sendEmail({
    to: order.user.email,
    subject: `Payment confirmed — ${order.book.title}`,
    text: `Hi ${buyerName},\n\nPayment of ${amount} confirmed.${rateLink ? `\n\nRate your experience: ${rateLink}` : ""}\n\n— Kọ́jọ́dá`,
    html: `<p>Payment for <strong>${order.book.title}</strong> confirmed.</p>${rateLink ? `<p><a href="${rateLink}">Rate your experience</a></p>` : ""}`,
  });

  await sendEmail({
    to: order.book.user.email,
    subject: `Buyer paid — ${order.book.title}`,
    text: `${buyerName} confirmed receipt and paid ${amount} for "${order.book.title}".\n\n— Kọ́jọ́dá`,
    html: `<p>Buyer paid for <strong>${order.book.title}</strong>. Payout processing.</p>`,
  });
}

export async function notifyTicketOrderSuccess(orderId: number): Promise<void> {
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      ticket: true,
      festival: { include: { user: { select: { email: true, name: true } } } },
      user: { select: { email: true, name: true } },
    },
  });

  if (!order || order.status !== "SUCCESS") return;

  const buyerName = order.user.name ?? order.user.email;
  const organizerEmail = order.festival.user.email;
  const amount = order.amount === 0 ? "Free" : formatNairaPlain(order.amount / 100);
  const qtyLabel = order.quantity === 1 ? "1 ticket" : `${order.quantity} tickets`;

  await sendEmail({
    to: order.user.email,
    subject: `Ticket confirmed — ${order.festival.title}`,
    text: `Hi ${buyerName},\n\nTicket for "${order.festival.title}" confirmed.\n\n— Kọ́jọ́dá`,
    html: `<p>Ticket confirmed for <strong>${order.festival.title}</strong>.</p>`,
  });

  await sendEmail({
    to: organizerEmail,
    subject: `New ticket — ${order.festival.title}`,
    text: `New ticket order: ${buyerName}, ${qtyLabel}, ${amount}.\n\n— Kọ́jọ́dá`,
    html: `<p>New ticket order for <strong>${order.festival.title}</strong>.</p>`,
  });
}

export async function notifyTicketOrderFulfilled(orderId: number): Promise<void> {
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      ticket: true,
      festival: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!order?.fulfilledAt || order.status !== "SUCCESS") return;

  const buyerName = order.user.name ?? order.user.email;
  const rateLink = feedbackUrl(order.feedbackToken);

  await sendEmail({
    to: order.user.email,
    subject: `How was ${order.festival.title}?`,
    text: `Hi ${buyerName},\n\nConfirm you attended and rate the event: ${rateLink}\n\nOrganizer is paid after your feedback.\n\n— Kọ́jọ́dá`,
    html: `<p>Thanks for attending <strong>${order.festival.title}</strong>.</p><p><a href="${rateLink}">Confirm attendance & rate</a> — this releases payment to the organizer.</p>`,
  });
}
