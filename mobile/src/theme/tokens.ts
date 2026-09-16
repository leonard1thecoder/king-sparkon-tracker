// Shared design tokens — must match web `src/styles/tokens.css`.
// No gradients, no glass panels. Signal = scan/action accent only.
// Confirm = verified / paid / approved / success.
export const tokens = {
  ink: "#14161A",
  paper: "#F1EFE6",
  signal: "#FF4D2E",
  signalSoft: "#FFE9E2",
  signalStrong: "#C93316",
  confirm: "#1C7C54",
  confirmSoft: "#E2F2E9",
  steel: "#5B6470",
  muted: "#8A8F98",
  line: "#D8D3C4",
  lineStrong: "#B9B2A0",
  card: "#FFFFFF",
  danger: "#B3261E",
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
} as const;

export type Tokens = typeof tokens;
