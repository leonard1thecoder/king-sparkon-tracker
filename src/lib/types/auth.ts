export type { TrackerUser, UserRole } from "./backend";

export type AuthResponse = {
  user?: import("./backend").TrackerUser;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  message?: string;
};
