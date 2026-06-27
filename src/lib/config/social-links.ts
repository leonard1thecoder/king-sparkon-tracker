export type SocialPlatform = "Facebook" | "Instagram" | "X" | "LinkedIn" | "GitHub";

export type SocialLink = {
  platform: SocialPlatform;
  href: string;
  handle: string;
  label: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "Facebook",
    href: "https://www.facebook.com/leonard1thecoder",
    handle: "facebook.com/leonard1thecoder",
    label: "Follow King Sparkon Tracker on Facebook",
  },
  {
    platform: "Instagram",
    href: "https://www.instagram.com/leonard1thecoder",
    handle: "instagram.com/leonard1thecoder",
    label: "Follow King Sparkon Tracker on Instagram",
  },
  {
    platform: "X",
    href: "https://x.com/leonard1thecoder",
    handle: "x.com/leonard1thecoder",
    label: "Follow King Sparkon Tracker on X",
  },
  {
    platform: "LinkedIn",
    href: "https://www.linkedin.com/in/leonard1thecoder",
    handle: "linkedin.com/in/leonard1thecoder",
    label: "Connect with King Sparkon Tracker on LinkedIn",
  },
  {
    platform: "GitHub",
    href: "https://github.com/leonard1thecoder",
    handle: "github.com/leonard1thecoder",
    label: "View the Leonard The Coder GitHub profile",
  },
];
