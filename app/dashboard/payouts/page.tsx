import CreatorPayoutForm from "@/components/dashboard/payouts/CreatorPayoutForm";

export default function PayoutsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your bank to receive payment when orders are fulfilled
        </p>
      </div>
      <CreatorPayoutForm />
    </section>
  );
}
