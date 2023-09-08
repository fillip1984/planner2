import {
  eachHourOfInterval,
  endOfDay,
  format,
  getHours,
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

  const calculateWidthAndElevationPosition = () => {
    console.clear();
    console.log("calc width and elevation position run");
    let elevation = 0;
    let ongoingEvents = 0;
    timeslots.forEach((ts) => {
      const eventsStarting = events.filter(
        (e) => getHours(e.start) === ts.hour,
      );
      // have to subtract 1 hr since end goes onto instead of up to next hour.
      // For example, an event that is scheduled to run from 1 - 4 really goes
      // from 1:00 until 3:59 but not 4:00 on the dot
      const eventsEnding = events.filter(
        (e) => getHours(e.end) - 1 === ts.hour,
      ).length;
      ongoingEvents += eventsStarting.length - eventsEnding;
      console.log({
        hour: ts.hour,
        eventsStarting: eventsStarting.length,
        eventsEnding,
        ongoingEvents,
      });
      if (ongoingEvents === 0) {
        elevation = 0;
      }

      eventsStarting.forEach((e) => (e.left = elevation));
      elevation += eventsStarting.length;

      // console.log({ hour: ts.hour, elevation, ongoingEvents });

      // console.dir({ hour: ts.hour, ongoingEvents, elevation });
      // const eventsStarting = events.filter(
      //   (e) => getHours(e.start) === ts.hour,
      // );
      // ongoingEvents = ongoingEvents.concat(eventsStarting);
      // eventsStarting.forEach((e) => ({ ...e, left: (e.left = elevation) }));
      // elevation += eventsStarting.length;
      // const eventsEnding = ongoingEvents.filter(
      //   (e) => getHours(e.end) === ts.hour,
      // );
      // ongoingEvents = ongoingEvents.filter((e) =>
      //   eventsEnding.find((ee) => e.id === ee.id),
      // );
      // if (elevation > 0 && ongoingEvents.length === 0) {
      //   console.log({ hour: ts.hour, msg: "resetting elevation" });
      //   elevation = 0;
      // }
      // console.dir({ hour: ts.hour, ongoingEvents, elevation });
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
              calculateWidthAndElevationPosition={
                calculateWidthAndElevationPosition
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}
