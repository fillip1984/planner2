export type Event = {
  id: string;
  start: Date;
  end: Date;
  description: string;
};

export type Timeslot = {
  hour: number; // 00 - 23
  date: Date;
  top: number;
  bottom: number;
};
