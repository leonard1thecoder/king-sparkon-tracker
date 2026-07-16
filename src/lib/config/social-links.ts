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
    href: "https://www.facebook.com/people/Sizolwakhe-Leonard-Mthimunye/100008018418257/#",
    handle: "facebook.com/people/Sizolwakhe-Leonard-Mthimunye",
    label: "Follow Sizolwakhe Leonard Mthimunye on Facebook",
  },
  {
    platform: "Instagram",
    href: "https://www.instagram.com/kingsparkon.jar/",
    handle: "instagram.com/kingsparkon.jar",
    label: "Follow King Sparkon on Instagram",
  },
  {
    platform: "X",
    href: "https://x.com/Leonard1thecode",
    handle: "x.com/Leonard1thecode",
    label: "Follow Leonard The Coder on X",
  },
  {
    platform: "LinkedIn",
    href: "https://www.linkedin.com/in/sizolwakhe-mthimunye-372928167",
    handle: "linkedin.com/in/sizolwakhe-mthimunye-372928167",
    label: "Connect with Sizolwakhe Mthimunye on LinkedIn",
  },
  {
    platform: "GitHub",
    href: "https://github.com/leonard1thecoder",
    handle: "github.com/leonard1thecoder",
    label: "View the Leonard The Coder GitHub profile",
  },
];
