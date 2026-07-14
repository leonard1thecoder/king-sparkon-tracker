# Vision bubble collision motion

The landing-page Vision section uses three circular content bubbles for Trace every action, One owner workspace, and Transparent money.

## Motion rules

- Bubbles move continuously at a deliberately slow speed.
- Each bubble is constrained to the Vision stage and bounces from the stage boundary.
- Bubble-to-bubble contact resolves overlap first, then exchanges velocity along the collision normal with damping.
- Minimum and maximum speed limits prevent the bubbles from stopping or becoming visually distracting.
- Mobile and desktop use different starting positions to avoid immediate overlap.
- `prefers-reduced-motion` keeps the circles visible but disables continuous animation.

## Visual rules

- White circle surfaces only.
- Sky-blue borders, icons, glow, and shadow.
- No orange resting state.
- The stage clips all motion so circles cannot cover the heading or the following section.
