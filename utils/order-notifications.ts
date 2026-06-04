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
  const sellerEmail = order.book.user.email;
  const amount = formatNairaPlain(order.amount / 100);
  const fulfillment = fulfillmentLabel(order.fulfillmentMethod);

  const fulfillmentDetails =
    order.fulfillmentMethod === "DELIVERY"
      ? `Delivery to: ${order.deliveryAddress}, ${order.deliveryCity}. Phone: ${order.deliveryPhone}`
      : `Pickup: ${order.pickupLocation ?? "See seller for location"}`;

  await sendEmail({
    to: order.user.email,
    subject: `Order confirmed — ${order.book.title}`,
    text: `Hi ${buyerName},\n\nYour order for "${order.book.title}" is confirmed.\nAmount: ${amount}\n${fulfillment}\n${fulfillmentDetails}\n\nReference: ${order.paystackReference}\n\nThe seller will contact you with next steps.\n\n— Kọ́jọ́dá`,
    html: `<p>Hi ${buyerName},</p><p>Your order for <strong>${order.book.title}</strong> is confirmed.</p><p><strong>Amount:</strong> ${amount}<br/><strong>${fulfillment}</strong><br/>${fulfillmentDetails}</p><p>Reference: ${order.paystackReference}</p><p>The seller will contact you with next steps.</p><p>— Kọ́jọ́dá</p>`,
  });

  await sendEmail({
    to: sellerEmail,
    subject: `New book order — ${order.book.title}`,
    text: `New paid order for "${order.book.title}".\n\nBuyer: ${buyerName} (${order.user.email})\nAmount: ${amount}\n${fulfillment}\n${fulfillmentDetails}\n\nReference: ${order.paystackReference}\n\nView orders in your Kọ́jọ́dá dashboard.`,
    html: `<p>New paid order for <strong>${order.book.title}</strong>.</p><p><strong>Buyer:</strong> ${buyerName} (${order.user.email})<br/><strong>Amount:</strong> ${amount}<br/><strong>${fulfillment}</strong><br/>${fulfillmentDetails}</p><p>Reference: ${order.paystackReference}</p><p>View orders in your Kọ́jọ́dá dashboard.</p>`,
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
  const amount =
    order.amount === 0
      ? "Free"
      : formatNairaPlain(order.amount / 100);
  const qtyLabel =
    order.quantity === 1 ? "1 ticket" : `${order.quantity} tickets`;

  await sendEmail({
    to: order.user.email,
    subject: `Ticket confirmed — ${order.festival.title}`,
    text: `Hi ${buyerName},\n\nYour ticket for "${order.festival.title}" is confirmed.\nTicket: ${order.ticket.name}\nQuantity: ${qtyLabel}\nAmount: ${amount}\n\nReference: ${order.paystackReference}\n\nSee you at the event!\n\n— Kọ́jọ́dá`,
    html: `<p>Hi ${buyerName},</p><p>Your ticket for <strong>${order.festival.title}</strong> is confirmed.</p><p><strong>Ticket:</strong> ${order.ticket.name}<br/><strong>Quantity:</strong> ${qtyLabel}<br/><strong>Amount:</strong> ${amount}</p><p>Reference: ${order.paystackReference}</p><p>See you at the event!</p><p>— Kọ́jọ́dá</p>`,
  });

  await sendEmail({
    to: organizerEmail,
    subject: `New ticket order — ${order.festival.title}`,
    text: `New ticket order for "${order.festival.title}".\n\nBuyer: ${buyerName} (${order.user.email})\nTicket: ${order.ticket.name}\nQuantity: ${qtyLabel}\nAmount: ${amount}\n\nReference: ${order.paystackReference}\n\nView orders in your Kọ́jọ́dá dashboard.`,
    html: `<p>New ticket order for <strong>${order.festival.title}</strong>.</p><p><strong>Buyer:</strong> ${buyerName} (${order.user.email})<br/><strong>Ticket:</strong> ${order.ticket.name}<br/><strong>Quantity:</strong> ${qtyLabel}<br/><strong>Amount:</strong> ${amount}</p><p>Reference: ${order.paystackReference}</p><p>View orders in your Kọ́jọ́dá dashboard.</p>`,
  });
}

export async function notifyBookOrderFulfilled(orderId: number): Promise<void> {
  const order = await prisma.bookOrder.findUnique({
    where: { id: orderId },
    include: {
      book: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!order?.fulfilledAt || order.status !== "SUCCESS") return;

  const buyerName = order.user.name ?? order.user.email;
  const rateLink = feedbackUrl(order.feedbackToken);

  await sendEmail({
    to: order.user.email,
    subject: `Order fulfilled — ${order.book.title}`,
    text: `Hi ${buyerName},\n\nYour order for "${order.book.title}" has been delivered.\n\n${rateLink ? `Rate your experience: ${rateLink}\n\n` : ""}Reference: ${order.paystackReference}\n\n— Kọ́jọ́dá`,
    html: `<p>Hi ${buyerName},</p><p>Your order for <strong>${order.book.title}</strong> has been fulfilled.</p>${rateLink ? `<p><a href="${rateLink}">Rate your experience</a> — help us know you're satisfied.</p>` : ""}<p>Reference: ${order.paystackReference}</p><p>— Kọ́jọ́dá</p>`,
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
    subject: `Event complete — ${order.festival.title}`,
    text: `Hi ${buyerName},\n\nThanks for attending "${order.festival.title}".\n\n${rateLink ? `Rate your experience: ${rateLink}\n\n` : ""}Reference: ${order.paystackReference}\n\n— Kọ́jọ́dá`,
    html: `<p>Hi ${buyerName},</p><p>Thanks for attending <strong>${order.festival.title}</strong>.</p>${rateLink ? `<p><a href="${rateLink}">Rate your experience</a> — tell us how it went.</p>` : ""}<p>Reference: ${order.paystackReference}</p><p>— Kọ́jọ́dá</p>`,
  });
}
