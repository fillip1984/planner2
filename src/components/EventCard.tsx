import { type Event } from "~/types";

export default function EventCard({ event }: { event: Event }) {
  return (
    <div className="absolute" style={{ top: 0, left: 0, right: 0 }}>
      {event.description}
    </div>
  );
}
