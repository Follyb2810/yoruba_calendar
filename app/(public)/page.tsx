import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <section className="text-center space-y-6">
        <p className="text-orange-600 font-medium tracking-wide uppercase text-sm">
          Kọ́jọ́dá — Yoruba Calendar
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Discover the Sacred Rhythm of the Yoruba Year
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Track festivals, honor the Orisa, and share cultural events with your
          community — all in one place.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link href="/calendar">Explore Calendar</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/festivals">Browse Festivals</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Join the Community</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-lg font-bold mb-2">Festival Tracking</h3>
          <p className="text-muted-foreground text-sm">
            See upcoming Yoruba festivals with accurate traditional dates and
            Orisa associations.
          </p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-lg font-bold mb-2">Orisa Guides</h3>
          <p className="text-muted-foreground text-sm">
            Learn about the deities — from Olokun to Orunmila — and their sacred
            celebrations.
          </p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-lg font-bold mb-2">Book Shop</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Buy books on Yoruba culture, Orisa, and tradition — pay securely with Paystack.
          </p>
          <Button asChild variant="link" className="p-0 h-auto text-orange-600">
            <Link href="/books">Browse Books →</Link>
          </Button>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-lg font-bold mb-2">Create Events</h3>
          <p className="text-muted-foreground text-sm">
            Organizers can publish festivals, set tickets, and reach the global
            Yoruba diaspora.
          </p>
        </div>
      </section>
    </div>
  );
}
