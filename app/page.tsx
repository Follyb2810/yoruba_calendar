import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold">
          Discover The Sacred Rhythm of the Yoruba Year
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Track festivals, honor the Orisa, and explore traditional dates all in
          one beautiful calendar.
        </p>

        <Button asChild size="lg">
          <a href="/calendar">Explore Calendar</a>
        </Button>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-lg font-bold">Festival Tracking</h3>
          <p className="text-muted-foreground">
            See upcoming Yoruba festivals with accurate traditional dates.
          </p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-lg font-bold">Orisa Guides</h3>
          <p className="text-muted-foreground">
            Learn about deities and their sacred associations.
          </p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-lg font-bold">Yoruba Calendar</h3>
          <p className="text-muted-foreground">
            A full calendar built on the Yoruba 4-day week cycle.
          </p>
        </div>
      </section>
    </div>
  );
}
