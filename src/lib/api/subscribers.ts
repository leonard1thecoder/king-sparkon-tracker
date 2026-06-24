import axios from "axios";

const publicClient = axios.create({ withCredentials: true });

export function subscribe(payload: { contact: string; subscriberType: string; preferredChannel: string; affiliateRegistered?: boolean }) {
  return publicClient.post("/api/subscribers", payload).then((response) => response.data);
}

export function unsubscribe(contact: string) {
  return publicClient.delete(`/api/subscribers?contact=${encodeURIComponent(contact)}`).then((response) => response.data);
}
