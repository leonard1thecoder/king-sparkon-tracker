export type { TrackerUser, UserRole } from "./backend";

export type AuthResponse = {
  user?: import("./backend").TrackerUser;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  message?: string;
};

export type OAuthProviderStatus = {
  id: string;
  displayName: string;
  enabled: boolean;
};
