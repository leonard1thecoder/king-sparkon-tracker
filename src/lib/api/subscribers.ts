import axios from "axios";

const publicClient = axios.create({ withCredentials: true });

export type SubscribePayload = {
  contact: string;
  subscriberType: "CLIENT" | "AFFILIATE" | "KINGSPARKON_SUBSCRIBER";
  preferredChannel: "EMAIL" | "WHATSAPP" | "ANY";
  affiliateRegistered?: boolean;
};

export function subscribe(payload: SubscribePayload) {
  return publicClient.post("/api/subscribers", payload).then((response) => response.data);
}

export function unsubscribe(contact: string) {
  return publicClient.delete(`/api/subscribers?contact=${encodeURIComponent(contact)}`).then((response) => response.data);
}
