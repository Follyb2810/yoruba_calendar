type Props = {
  step: number;
};

export default function StepNavigation({ step }: Props) {
  const steps = [
    { id: 1, label: "Event Details" },
    { id: 2, label: "Date & Location" },
    { id: 3, label: "Tickets" },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((s, index) => (
        <div key={s.id} className="flex items-center w-full">
          {/* Step Circle */}
          <div
            className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${
                step >= s.id
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }
            `}
          >
            {s.id}
          </div>

          {/* Step Label */}
          <span
            className={`ml-2 text-sm ${
              step >= s.id ? "text-gray-900 font-medium" : "text-gray-400"
            }`}
          >
            {s.label}
          </span>

          {/* Connector Line */}
          {index !== steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-4 ${
                step > s.id ? "bg-orange-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
