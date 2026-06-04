import OrdersDashboard from "@/components/dashboard/orders/OrdersDashboard";

export default function OrdersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Book and ticket sales — mark fulfilled after delivery or event
        </p>
      </div>
      <OrdersDashboard />
    </section>
  );
}
