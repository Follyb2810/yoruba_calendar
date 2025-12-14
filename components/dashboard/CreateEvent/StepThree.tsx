import { StepProps } from "./StepOne";

export function StepThree({ data, setData }: StepProps) {
  return (
    <>
      <label>
        <input
          type="radio"
          checked={data.ticketType === "free"}
          onChange={() => setData({ ...data, ticketType: "free" })}
        />
        Free
      </label>

      <label>
        <input
          type="radio"
          checked={data.ticketType === "single"}
          onChange={() => setData({ ...data, ticketType: "single" })}
        />
        Single Ticket
      </label>

      <label>
        <input
          type="radio"
          checked={data.ticketType === "group"}
          onChange={() => setData({ ...data, ticketType: "group" })}
        />
        Group Ticket
      </label>
    </>
  );
}
