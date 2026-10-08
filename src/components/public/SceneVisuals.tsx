import { Scene } from "@/components/public/InView";

/* Shared palette, referenced by value so SVG fills work without CSS variables. */
const C = {
  ink: "#17231D",
  muted: "#647168",
  white: "#FFFFFF",
  lightGreen: "#BFE8C7",
  green: "#76C893",
  yellow: "#F8E16C",
  gold: "#E6B84A",
  sky: "#A9DDF5",
  line: "#E6ECE7",
} as const;

type GlyphKind = "ticket" | "package" | "briefcase";

function Glyph({ kind, cx, cy }: { kind: GlyphKind; cx: number; cy: number }) {
  if (kind === "ticket") {
    return <rect x={cx - 7} y={cy - 4.5} width="14" height="9" rx="1.5" fill={C.ink} />;
  }
  if (kind === "package") {
    return (
      <g>
        <rect x={cx - 6} y={cy - 6} width="12" height="12" rx="1.5" fill={C.ink} />
        <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={C.white} strokeWidth="1.2" />
      </g>
    );
  }
  return (
    <g>
      <rect x={cx - 7} y={cy - 3} width="14" height="10" rx="1.5" fill={C.ink} />
      <path d={`M${cx - 3} ${cy - 3} V${cy - 6} H${cx + 3} V${cy - 3}`} fill="none" stroke={C.ink} strokeWidth="1.4" />
    </g>
  );
}

function Node({ x, y, label, kind, fill }: { x: number; y: number; label: string; kind: GlyphKind; fill: string }) {
  return (
    <g className="ks-float" style={{ animationDelay: `${-(x % 7) * 0.6}s` }}>
      <rect x={x - 70} y={y - 27} width="140" height="54" rx="27" fill={C.white} stroke={C.gold} strokeWidth="1.5" />
      <circle cx={x - 40} cy={y} r="15" fill={fill} />
      <Glyph kind={kind} cx={x - 40} cy={y} />
      <text x={x - 16} y={y + 5} fontSize="14" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>
        {label}
      </text>
    </g>
  );
}

/* Hero: the platform as a living network. Three worlds orbit one core. */
export function HeroNetwork() {
  return (
    <svg viewBox="0 0 560 440" className="h-auto w-full" aria-hidden="true" focusable="false">
      <g stroke={C.green} strokeWidth="2" fill="none" strokeDasharray="6 10" className="ks-dash-flow">
        <path d="M280 220 C230 175 190 150 150 120" />
        <path d="M280 220 C330 175 370 150 410 120" />
        <path d="M280 220 C280 280 280 320 280 370" />
      </g>

      <g className="ks-orbit" style={{ transformOrigin: "280px 220px" }}>
        <circle cx="280" cy="220" r="170" fill="none" stroke={C.sky} strokeWidth="1.5" strokeDasharray="2 9" />
        <circle cx="450" cy="220" r="9" fill={C.yellow} />
        <circle cx="110" cy="220" r="6" fill={C.sky} />
      </g>

      <Node x={150} y={100} label="Events" kind="ticket" fill={C.lightGreen} />
      <Node x={410} y={100} label="Mall" kind="package" fill={C.sky} />
      <Node x={280} y={390} label="Job Posts" kind="briefcase" fill={C.yellow} />

      <g className="ks-pulse" style={{ transformOrigin: "280px 220px" }}>
        <circle cx="280" cy="220" r="56" fill={C.white} stroke={C.gold} strokeWidth="2" />
        <circle cx="280" cy="220" r="44" fill={C.lightGreen} opacity="0.5" />
        <text x="280" y="216" textAnchor="middle" fontSize="11" fontWeight="800" fill={C.ink} letterSpacing="1.5" style={{ fontFamily: "inherit" }}>KING</text>
        <text x="280" y="232" textAnchor="middle" fontSize="11" fontWeight="800" fill={C.ink} letterSpacing="1.5" style={{ fontFamily: "inherit" }}>SPARKON</text>
      </g>

      <g className="ks-float" style={{ animationDelay: "-2s" }}>
        <rect x="446" y="196" width="22" height="22" rx="4" fill="none" stroke={C.ink} strokeWidth="1.5" />
        <rect x="451" y="201" width="5" height="5" fill={C.ink} />
        <rect x="459" y="201" width="5" height="5" fill={C.ink} />
        <rect x="451" y="209" width="5" height="5" fill={C.ink} />
      </g>
    </svg>
  );
}

/* Platform section: people, events, tickets, mall and jobs in one loop. */
export function PlatformNetwork() {
  const loop = "M80 210 C80 80 480 80 480 210 C480 340 80 340 80 210 Z";
  return (
    <div className="relative">
      <svg viewBox="0 0 560 420" className="h-auto w-full" aria-hidden="true" focusable="false">
        <path d={loop} fill="none" stroke={C.green} strokeWidth="2" strokeDasharray="5 9" className="ks-dash-flow" />
        <circle cx="80" cy="210" r="34" fill={C.white} stroke={C.sky} strokeWidth="2" />
        <circle cx="280" cy="78" r="34" fill={C.white} stroke={C.lightGreen} strokeWidth="2" />
        <circle cx="480" cy="210" r="34" fill={C.white} stroke={C.yellow} strokeWidth="2" />
        <circle cx="280" cy="342" r="34" fill={C.white} stroke={C.gold} strokeWidth="2" />
        <text x="80" y="214" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>People</text>
        <text x="280" y="82" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>Events</text>
        <text x="480" y="214" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>Mall</text>
        <text x="280" y="346" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>Jobs</text>
        <g className="ks-travel">
          <circle r="7" fill={C.gold}>
            <animateMotion dur="9s" repeatCount="indefinite" path={loop} />
          </circle>
          <circle r="5" fill={C.green}>
            <animateMotion dur="9s" begin="-4.5s" repeatCount="indefinite" path={loop} />
          </circle>
        </g>
      </svg>
      <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ks-muted)]">
        person → event → ticket → mall → job
      </p>
    </div>
  );
}

/* Events lifecycle: the event takes shape step by step as it scrolls into view. */
const eventSteps = [
  { title: "Event created", text: "A date, venue and ticket types take shape." },
  { title: "Artists connect", text: "The lineup is confirmed and linked to the event." },
  { title: "Tickets appear", text: "Ticket types go on sale with live availability." },
  { title: "QR activates", text: "Each ticket carries a code that scans at the gate." },
  { title: "Crowd arrives", text: "Check-ins and capacity update as people arrive." },
] as const;

export function EventsScene() {
  return (
    <Scene className="grid items-center gap-10 md:grid-cols-2">
      <svg viewBox="0 0 420 340" className="h-auto w-full" aria-hidden="true" focusable="false">
        <rect x="40" y="40" width="200" height="170" rx="16" fill={C.white} stroke={C.line} strokeWidth="2" />
        <rect x="40" y="40" width="200" height="34" rx="16" fill={C.lightGreen} />
        <text x="60" y="63" fontSize="13" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>Saturday · 20:00</text>
        <rect x="60" y="92" width="60" height="50" rx="6" fill={C.yellow} opacity="0.7" />
        <rect x="132" y="92" width="60" height="50" rx="6" fill={C.sky} opacity="0.7" />
        <rect x="60" y="152" width="132" height="36" rx="6" fill={C.white} stroke={C.gold} strokeWidth="1.5" />
        <g className="ks-float" style={{ animationDelay: "-1s" }}>
          <rect x="262" y="60" width="128" height="62" rx="10" fill={C.white} stroke={C.gold} strokeWidth="1.5" />
          <line x1="284" y1="60" x2="284" y2="122" stroke={C.gold} strokeDasharray="3 4" />
          <text x="296" y="98" fontSize="12" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>TICKET</text>
        </g>
        <g className="ks-float" style={{ animationDelay: "-3s" }}>
          <rect x="262" y="150" width="60" height="60" rx="6" fill={C.white} stroke={C.ink} strokeWidth="1.5" />
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].map((col) => (
              <rect key={`${row}-${col}`} x={270 + col * 14} y={158 + row * 14} width="8" height="8" fill={C.ink} opacity={(row + col) % 2 === 0 ? 1 : 0.35} />
            )),
          )}
        </g>
        <circle cx="340" cy="250" r="12" fill={C.yellow} />
        <circle cx="300" cy="280" r="9" fill={C.sky} />
        <circle cx="370" cy="290" r="10" fill={C.lightGreen} />
        <circle cx="160" cy="300" r="14" fill={C.gold} opacity="0.85" />
        <path d="M60 232 L360 232" stroke={C.line} strokeWidth="2" />
      </svg>

      <ol className="space-y-5">
        {eventSteps.map((step, index) => (
          <li key={step.title} className="ks-step flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--ks-line)] ks-surface text-sm font-bold">
              {index + 1}
            </span>
            <div>
              <p className="font-bold">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ks-muted)]">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Scene>
  );
}

/* Mall: product → cart → order → event, with packages travelling along the flow. */
const mallStages = [
  { label: "Product", text: "Listed with price and stock." },
  { label: "Cart", text: "Items gathered for one checkout." },
  { label: "Order", text: "Payment confirmed and recorded." },
  { label: "Event", text: "Collected at the counter or the event." },
] as const;

export function MallScene() {
  return (
    <Scene className="relative">
      <div className="relative grid gap-4 md:grid-cols-4">
        {mallStages.map((stage, index) => (
          <div key={stage.label} className="ks-step relative">
            <div className="ks-card h-full">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ks-muted)]">Step {index + 1}</p>
              <p className="mt-2 text-lg font-extrabold">{stage.label}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">{stage.text}</p>
            </div>
            {index < mallStages.length - 1 ? (
              <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 border-t-2 border-dashed border-[var(--ks-green)] md:block" />
            ) : null}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 -top-10 hidden h-10 md:block" aria-hidden="true">
        {[12, 38, 62, 86].map((left, index) => (
          <span
            key={left}
            className="ks-float absolute block h-5 w-5 rounded-[4px] border-2 border-[var(--ks-ink)] bg-[var(--ks-yellow)]"
            style={{ left: `${left}%`, animationDelay: `${-index * 1.1}s` }}
          />
        ))}
      </div>
    </Scene>
  );
}

/* Job Posts: a post travels to a confirmed connection. */
const jobSteps = [
  { title: "Job posted", text: "A business publishes an open role." },
  { title: "Person discovers it", text: "Job seekers find it on the Job Posts page." },
  { title: "Applies", text: "The application is sent and tracked." },
  { title: "Employer reviews", text: "The business reviews each application." },
  { title: "Connection confirmed", text: "Both sides see the outcome." },
] as const;

export function JobsScene() {
  return (
    <Scene className="relative grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
      <svg viewBox="0 0 300 300" className="h-auto w-full max-w-sm justify-self-center" aria-hidden="true" focusable="false">
        <path d="M60 40 C 120 80, 180 40, 240 90 S 260 220, 170 240 S 60 270, 70 200" fill="none" stroke={C.green} strokeWidth="2" strokeDasharray="6 10" className="ks-dash-flow" />
        <circle cx="60" cy="40" r="20" fill={C.white} stroke={C.gold} strokeWidth="2" />
        <circle cx="240" cy="90" r="20" fill={C.white} stroke={C.gold} strokeWidth="2" />
        <circle cx="170" cy="240" r="20" fill={C.lightGreen} stroke={C.gold} strokeWidth="2" />
        <circle cx="70" cy="200" r="20" fill={C.yellow} stroke={C.gold} strokeWidth="2" />
        <path d="M163 240 l6 6 l12 -12" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <ol className="relative space-y-5 border-l-2 border-dashed border-[var(--ks-line)] pl-6">
        {jobSteps.map((step, index) => (
          <li key={step.title} className="ks-step relative">
            <span className="absolute -left-[33px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--ks-gold)] ks-surface text-[10px] font-bold">
              {index + 1}
            </span>
            <p className="font-bold">{step.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ks-muted)]">{step.text}</p>
          </li>
        ))}
      </ol>
    </Scene>
  );
}

/* UIF: a workflow of records, shown as a flow, not as a government form. */
const uifSteps = ["Employment", "Contribution", "Record", "Support"] as const;

export function UifScene() {
  return (
    <Scene className="flex flex-wrap items-center justify-center gap-3">
      {uifSteps.map((step, index) => (
        <div key={step} className="flex items-center gap-3">
          <div className="ks-step ks-float flex h-20 w-32 flex-col items-center justify-center rounded-[14px] border border-[var(--ks-line)] ks-surface text-center shadow-[0_10px_20px_-18px_rgba(23,35,29,0.6)]" style={{ animationDelay: `${-index * 0.8}s` }}>
            <span className="h-1.5 w-8 rounded-full bg-[var(--ks-yellow)]" aria-hidden="true" />
            <span className="mt-3 text-sm font-bold">{step}</span>
          </div>
          {index < uifSteps.length - 1 ? (
            <span aria-hidden="true" className="hidden h-px w-8 border-t-2 border-dashed border-[var(--ks-green)] sm:block" />
          ) : null}
        </div>
      ))}
    </Scene>
  );
}

/* Audience: four identities move between the three worlds. Mapping from the product spec. */
const identities = ["User", "Artist", "Business", "Worker"] as const;
const worlds = ["Events", "Mall", "Jobs"] as const;
const connections: Array<[(typeof identities)[number], (typeof worlds)[number]]> = [
  ["User", "Events"],
  ["User", "Mall"],
  ["User", "Jobs"],
  ["Artist", "Events"],
  ["Business", "Events"],
  ["Business", "Mall"],
  ["Business", "Jobs"],
  ["Worker", "Events"],
  ["Worker", "Jobs"],
];

const identityX: Record<(typeof identities)[number], number> = { User: 70, Artist: 210, Business: 350, Worker: 490 };
const worldX: Record<(typeof worlds)[number], number> = { Events: 110, Mall: 280, Jobs: 450 };

export function AudienceMap() {
  return (
    <Scene>
      <svg viewBox="0 0 560 230" className="h-auto w-full" aria-hidden="true" focusable="false">
        {connections.map(([from, to]) => {
          const x1 = identityX[from];
          const x2 = worldX[to];
          const d = `M${x1} 66 C${x1} 120, ${x2} 116, ${x2} 166`;
          return (
            <g key={`${from}-${to}`}>
              <path d={d} fill="none" stroke={C.green} strokeWidth="1.5" strokeDasharray="4 7" className="ks-dash-flow" />
              <circle r="4" fill={C.gold} className="ks-travel">
                <animateMotion dur="5s" repeatCount="indefinite" path={d} begin={`-${(x1 + x2) % 5}s`} />
              </circle>
            </g>
          );
        })}
        {identities.map((name) => (
          <g key={name}>
            <rect x={identityX[name] - 52} y="30" width="104" height="36" rx="18" fill={C.white} stroke={C.lightGreen} strokeWidth="2" />
            <text x={identityX[name]} y="53" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.ink} style={{ fontFamily: "inherit" }}>{name}</text>
          </g>
        ))}
        {worlds.map((name) => (
          <g key={name}>
            <rect x={worldX[name] - 56} y="166" width="112" height="40" rx="20" fill={C.ink} />
            <text x={worldX[name]} y="191" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.white} style={{ fontFamily: "inherit" }}>{name}</text>
          </g>
        ))}
      </svg>
    </Scene>
  );
}

/* Final CTA: the three product worlds converge into the King Sparkon mark. */
export function ConvergeScene() {
  const worldsFinal = [
    { label: "EVENTS", fx: "-140px", fy: "-40px" },
    { label: "MALL", fx: "0px", fy: "-70px" },
    { label: "JOBS", fx: "140px", fy: "-40px" },
  ];
  return (
    <Scene className="relative flex flex-col items-center gap-8 py-6">
      <div className="relative flex h-48 w-full max-w-md items-center justify-center">
        <div className="absolute flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--ks-gold)] ks-surface text-xs font-extrabold tracking-[0.1em]">
          KS
        </div>
        {worldsFinal.map((world) => (
          <span
            key={world.label}
            className="ks-converge absolute rounded-full bg-[var(--ks-ink)] px-4 py-2 text-xs font-bold tracking-[0.14em] text-white"
            style={{ ["--fx" as string]: world.fx, ["--fy" as string]: world.fy }}
          >
            {world.label}
          </span>
        ))}
      </div>
    </Scene>
  );
}
