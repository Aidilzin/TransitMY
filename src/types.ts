export type Language = "en" | "bm" | "zh" | "ta";

export type TabId = "arrivals" | "planner" | "network" | "ticketing" | "tips" | "fares" | "maps";

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  image?: {
    data: string; // Base64 string
    mimeType: string;
  };
  timestamp: Date;
  isError?: boolean;
}

export interface Timetable {
  id: string;
  line: string;
  color: string;
  destination: string;
  station: string;
  minutes: number;
  status: "On Time" | "Minor Delay" | "Delayed" | "Maintenance";
}

export interface Announcement {
  id: number;
  text: string;
  type: "warning" | "info";
}

export interface TransitLine {
  name: string;
  code: string;
  color: string;
  type: string;
  keyStops: string[];
}

export interface TicketingGuide {
  title: string;
  description: string;
  steps: string[];
}

export interface TransitTip {
  title: string;
  warning: string;
  solution: string;
}

export interface FareRange {
  lineType: string;
  range: string;
  notes: string;
}
