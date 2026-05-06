// lib/mock-data/chat.ts
export interface ChatMessage {
  from: "driver" | "client";
  text: string;
  time: string;          // HH:mm
}

export const trackingChat: ChatMessage[] = [
  { from: "driver", text: "Bonjour, je suis en route 🛵", time: "14:17" },
  { from: "client", text: "Merci, je suis au RDC", time: "14:18" },
  { from: "driver", text: "OK, j'arrive dans 15 min", time: "14:18" },
];
