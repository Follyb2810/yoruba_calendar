import { StepProps } from "./StepOne";

export function StepTwo({ data, setData }: StepProps) {
  return (
    <>
      <select
        value={data.country}
        onChange={(e) => setData({ ...data, country: e.target.value })}
      >
        <option value="">Country</option>
      </select>

      <div>
        <label>
          <input
            type="radio"
            checked={data.eventType === "physical"}
            onChange={() => setData({ ...data, eventType: "physical" })}
          />
          Physical
        </label>
        <label>
          <input
            type="radio"
            checked={data.eventType === "virtual"}
            onChange={() => setData({ ...data, eventType: "virtual" })}
          />
          Virtual
        </label>
      </div>

      {data.eventType === "physical" && (
        <input
          placeholder="Event location"
          onChange={(e) => setData({ ...data, location: e.target.value })}
        />
      )}

      {data.eventType === "virtual" && (
        <input
          placeholder="Event link"
          onChange={(e) => setData({ ...data, eventLink: e.target.value })}
        />
      )}

      <input type="datetime-local" />
      <input type="datetime-local" />

      <input type="file" />
      <input type="file" />
    </>
  );
}
