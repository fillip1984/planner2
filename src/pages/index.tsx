import {
  areIntervalsOverlapping,
  eachHourOfInterval,
  endOfDay,
  format,
  getHours,
  isAfter,
  setHours,
  startOfDay,
} from "date-fns";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import EventCard from "~/components/EventCard";
import { type AgendaEvent, type Timeslot } from "~/types";
import { roundToNearestHundreth } from "~/utils/numberUtils";

export default function Home() {
  const hours = eachHourOfInterval({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  // hours render the slots on the screen, timeslots track pixel specific locations
  // for drag and resize and laying out of events
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);

  useEffect(() => {
    handleTimeslots();
  }, []);

  const handleTimeslots = () => {
    const calculatedTimeslots: Timeslot[] = [];
    const timeslotDivs = document.querySelectorAll("[data-timeslot") as unknown;

    (timeslotDivs as HTMLDivElement[]).forEach((timeslotDiv) => {
      if (!timeslotDiv.dataset.timeslot) {
        throw new Error(
          "Missing timeslot data, data attribute does not contain a value",
        );
      }
      const hour = parseInt(timeslotDiv.dataset.timeslot);
      calculatedTimeslots.push({
        hour,
        date: setHours(startOfDay(new Date()), hour),
        top: timeslotDiv.getBoundingClientRect().top,
        bottom:
          timeslotDiv.getBoundingClientRect().top +
          timeslotDiv.getBoundingClientRect().height,
      });
    });

    setTimeslots(calculatedTimeslots);
  };

  const [events, setEvents] = useState<AgendaEvent[]>([
    {
      id: "1",
      start: setHours(startOfDay(new Date()), 2),
      end: setHours(startOfDay(new Date()), 8),
      description: "First",
      left: 0,
      right: 0,
    },
    {
      id: "2",
      start: setHours(startOfDay(new Date()), 1),
      end: setHours(startOfDay(new Date()), 4),
      description: "Second",
      left: 0,
      right: 0,
    },
    // {
    //   id: "3",
    //   start: setHours(startOfDay(new Date()), 2),
    //   end: setHours(startOfDay(new Date()), 5),
    //   description: "Third",
    //   left: 0,
    //   right: 0,
    // },
    {
      id: "4",
      start: setHours(startOfDay(new Date()), 6),
      end: setHours(startOfDay(new Date()), 9),
      description: "Fourth",
      left: 0,
      right: 0,
    },
    {
      id: "5",
      start: setHours(startOfDay(new Date()), 9),
      end: setHours(startOfDay(new Date()), 10),
      description: "Fifth",
      left: 0,
      right: 0,
    },
  ]);

  const calculateHourBasedOnPosition = (clientY: number) => {
    const clientYOffset = clientY - agendaTopOffset;
    const timeslot = timeslots?.find(
      (timeslot) =>
        timeslot.top <= clientYOffset && timeslot.bottom >= clientYOffset,
    );

    return timeslot?.hour;
  };

  const calculatePositionBaseOnHour = (start: Date, end: Date) => {
    const firstTimeslot = timeslots.find(
      (timeslot) => timeslot.hour === getHours(start),
    );
    const secondTimeslot = timeslots.find(
      (timeslot) => timeslot.hour === getHours(end),
    );

    // timeslots not found, default to the top of the agenda
    if (!firstTimeslot || !secondTimeslot) {
      return { top: agendaTopOffset, bottom: agendaTopOffset };
    }

    return {
      top: firstTimeslot.top - agendaTopOffset,
      bottom: secondTimeslot.top - agendaTopOffset,
    };
  };

  const calculateWidthAndDepthPosition = () => {
    console.log("calc width and depth position run");
    // sort events by duration, longest to shortest, using id as tiebreaker
    // const eventsSortedByDuration = events
    //   .map((event) => ({
    //     event,
    //     durationInMinutes: differenceInMinutes(event.end, event.start),
    //     interval: { start: event.start, end: addSeconds(event.end, -1) },
    //   }))
    //   .sort((e1, e2) => {
    //     const diff = e2.durationInMinutes - e1.durationInMinutes;
    //     if (diff !== 0) {
    //       return diff;
    //     }
    //     return e1.event.id.localeCompare(e2.event.id);
    //   });

    const updates: { eventId: string; left: number; right: number }[] = [];

    // find events that overlap, indent conflicts
    events.forEach((event) => {
      const interval1 = { start: event.start, end: event.end };
      const conflicts = events.filter((anotherEvent) =>
        areIntervalsOverlapping(interval1, {
          start: anotherEvent.start,
          end: anotherEvent.end,
        }),
      );

      const conflictingEventsAfterThisEvent = conflicts.filter((anotherEvent) =>
        isAfter(anotherEvent.start, event.start),
      );

      conflictingEventsAfterThisEvent.forEach((anotherEvent) => {
        const existingUpdate = updates.find(
          (u) => u.eventId === anotherEvent.id,
        );
        if (existingUpdate) {
          updates.map((u) =>
            u.eventId === anotherEvent.id ? { ...u, left: u.left + 1 } : u,
          );
        } else {
          updates.push({
            eventId: anotherEvent.id,
            left: 1,
            right: 0,
          });
        }
      });
    });
    console.dir({ updates });

    // find events that start at the same time, split the line across them all
    timeslots
      .map((timeslot) => {
        return {
          timeslot,
          eventsThatStart: events.filter(
            (event) => getHours(event.start) === timeslot.hour,
          ),
        };
      })
      .filter((timeslotWE) => timeslotWE.eventsThatStart.length !== 0)
      .forEach((timeslotWE) => {
        // if only 1 then item is end to end
        if (
          timeslotWE.eventsThatStart.length === 1 &&
          timeslotWE.eventsThatStart[0]
        ) {
          // const id = timeslotWE.eventsThatStart[0].id;
          // // updates.splice({ eventId: id, left: 0, right: 0 });
          // const index = updates.findIndex((u) => (u.eventId = id));
          // updates.splice(index, 1, { eventId: id, left: 0, right: 0 });
        } else {
          let left = 0;
          let right = 0;
          let width = 0;
          timeslotWE.eventsThatStart.forEach((e) => {
            width = roundToNearestHundreth(
              100 / timeslotWE.eventsThatStart.length,
            );
            right = roundToNearestHundreth(100 - left - width);
            updates.push({ eventId: e.id, left, right });
            left += width;
          });
        }
      });

    setEvents((prev) => {
      return prev.map((prevEvent) => ({
        ...prevEvent,
        left:
          updates.find((update) => update.eventId === prevEvent.id)?.left ?? 0,
        right:
          updates.find((update) => update.eventId === prevEvent.id)?.right ?? 0,
      }));
    });
  };

  const handleEventUpdate = (start: Date, end: Date, eventId: string) => {
    setEvents((prev) => {
      return prev.map((prevEvent) =>
        prevEvent.id === eventId
          ? {
              ...prevEvent,
              start,
              end,
            }
          : prevEvent,
      );
    });
  };

  // when calculating hour or top/bottom of timeslots you have to take into account the top position
  // of the agenda. This is because drag and resize send Y coordinate of cursor on the screen which
  // then has to be offset by the agenda's top position to be accurate
  const agendaRef = useRef<HTMLDivElement | null>(null);
  const [agendaTopOffset, setAgendaTopOffset] = useState(0);
  useEffect(() => {
    if (agendaRef) {
      // TODO: discovered that this isn't working, returns 0
      // console.log(agendaRef.current?.clientTop);
      const agendaTop = agendaRef.current?.getBoundingClientRect().top ?? 0;
      setAgendaTopOffset(agendaTop);
    }
  }, [agendaRef]);

  return (
    <>
      <Head>
        <title>Planner 2 - twice the fun</title>
        <meta name="description" content="Generated by create-t3-app" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <div ref={agendaRef} className="flex">
        {/* Draw agenda slot headers (shows the time for each slow, displayed on the left or head of slot) */}
        <div className="flex flex-col">
          {hours.map((hour) => (
            <div
              key={hour.toISOString()}
              data-timeslot={format(hour, "H")}
              className="flex">
              <div className="flex h-20 w-16 flex-col items-end border-t border-grey/30 pr-1">
                <span className="-mb-1">{format(hour, "HH:mm")}</span>
                <span className="hidden text-sm text-grey">:15</span>
                <span className="hidden text-sm text-grey">:30</span>
                <span className="hidden text-sm text-grey">:45</span>
              </div>
            </div>
          ))}
        </div>

        {/* Draw agenda slots */}
        <div className="relative flex flex-1 flex-col">
          {hours.map((hour) => (
            <div key={hour.toISOString()} className="flex">
              <div className="flex h-20 flex-1 items-center justify-center border-t border-grey/30"></div>
            </div>
          ))}

          {/* Draw events */}
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              handleEventUpdate={handleEventUpdate}
              timeslots={timeslots}
              calculateHourBasedOnPosition={calculateHourBasedOnPosition}
              calculatePositionBaseOnHour={calculatePositionBaseOnHour}
              calculateWidthAndDepthPosition={calculateWidthAndDepthPosition}
            />
          ))}
        </div>
      </div>
    </>
  );
}
