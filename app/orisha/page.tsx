"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Orisa {
  id: number;
  name: string;
  festivals?: { id: number; title: string }[];
}

export default function OrisaListPage() {
  const [orisas, setOrisas] = useState<Orisa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrisas() {
      try {
        const res = await fetch("/api/orisha");
        if (!res.ok) throw new Error("Failed to fetch Orisas");
        const data = await res.json();
        setOrisas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrisas();
  }, []);

  if (loading) return <p className="p-6">Loading Orisas...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Orisas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {orisas.map((orisa) => (
          <div
            key={orisa.id}
            className="p-4 border rounded shadow hover:shadow-lg transition"
          >
            <Link key={orisa.id} href={`/orisa/${orisa.id}`}>
              <div className="p-4 border rounded shadow hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-semibold">{orisa.name}</h2>
              </div>
            </Link>
            {orisa.festivals && orisa.festivals.length > 0 && (
              <div className="mt-2">
                <h3 className="font-medium">Festivals:</h3>
                <ul className="list-disc ml-5 text-sm">
                  {orisa.festivals.map((f) => (
                    <li key={f.id}>{f.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {!orisa.festivals?.length && (
              <p className="mt-2 text-sm text-muted-foreground">
                No festivals assigned.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";

// interface Orisa {
//   id: number;
//   name: string;
//   festivals: Festival[];
// }

// interface Festival {
//   id: number;
//   title: string;
//   startMonth: number;
//   startDay: number;
//   endMonth: number;
//   endDay: number;
// }

// export default function OrisasPage() {
//   const [orisas, setOrisas] = useState<Orisa[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchOrisas() {
//       try {
//         const res = await fetch("/api/orisas?limit=50");
//         if (!res.ok) throw new Error("Failed to fetch Orisas");
//         const data = await res.json();
//         setOrisas(data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchOrisas();
//   }, []);

//   if (loading) return <p>Loading Orisas...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Orisas</h1>
//       <ul>
//         {orisas.map((orisa) => (
//           <li key={orisa.id} className="mb-4 border-b pb-2">
//             <h2 className="text-xl font-semibold">{orisa.name}</h2>
//             <h3 className="font-medium">Festivals:</h3>
//             <ul className="ml-4 list-disc">
//               {orisa.festivals.map((f) => (
//                 <li key={f.id}>
//                   {f.title} ({f.startMonth}/{f.startDay} - {f.endMonth}/
//                   {f.endDay})
//                 </li>
//               ))}
//             </ul>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
