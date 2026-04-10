# ADR-0002: No third-party UI library on the frontend

## Status

Accepted — 2026-04-10.

## Context

The web app runs on Expo (managed) with the web target via `expo start --web`. We need a component and styling story. The realistic options were:

- **Tamagui** — universal UI library, compile-time CSS extraction, excellent desktop web output, ships with a full component primitive set
- **NativeWind v4** — Tailwind syntax for React Native + web, simpler setup than Tamagui
- **Plain React Native StyleSheet + owned components** — build on top of whatever Expo ships with, add a tiny set of shared components (Button, Card, etc.) on top
- **A DOM-based React UI library** (shadcn/ui, Mantine, MUI) — not actually an option because Expo Web renders via `react-native-web` and does not speak DOM components

## Decision

**No third-party UI / styling library.** We lean on whatever the Expo template provides, layer our own theme tokens on top (`apps/web/src/theme/`), and build a small set of shared components as they're needed (`apps/web/src/components/`).

## Rationale

- **Tamagui's setup complexity is real.** Babel and Metro plugin order is fragile, `tamagui.config.ts` is mandatory and non-trivial, TypeScript module augmentation is required for token autocomplete, Jest mocking is painful, font registration adds a layer, and the `tamagui / @tamagui/config / @tamagui/babel-plugin / @tamagui/metro-plugin` packages all have to be version-synced. The plan originally flagged this as "the fiddliest piece of the stack" and budgeted a fallback.
- **NativeWind is less fiddly but still buys us less than we'd pay.** Tailwind syntax in React Native is nice but doesn't give us component primitives, so we'd still build our own Button / Card / Dialog / etc. on top.
- **Owned components grow with the product.** We add primitives only when a screen demands one, which keeps the surface small and prevents the "we imported a huge library and use 3 components from it" trap.
- **Predictable output.** Nothing surprising happens at build time. What you write is what runs.

## Tradeoffs

- **More upfront work before the first screen lands.** A theme layer and a starter set of shared components (Button, Card, Heading, BodyText, Stack, Row, TextField, a loading indicator, a badge) have to exist before screens can be built. Budgeted explicitly as task #25.
- **Less polish out of the box.** Tamagui ships animated sheets, popovers, dropdowns, tooltips, and more. We'll build any of these we need by hand. That's a real cost — but also a real opportunity to avoid the "generic Material look" that component libraries give you.
- **Web hover / focus states are manual.** `Pressable`'s `({pressed, hovered, focused})` style callback is the RN way to handle these; we wire them into every interactive component ourselves.
- **Risk of a half-built design system** if we don't discipline ourselves. Mitigated by the rule that new screens cannot add inline magic numbers — they use theme tokens, and if a primitive is missing, it gets added in its own commit first.

## Alternatives considered

- **Tamagui** — rejected on setup complexity (see above).
- **NativeWind** — rejected because we'd still build our own component set; simpler, but doesn't save enough to justify another dependency with its own quirks.
- **Gluestack / RN Paper / other RN component libraries** — all opinionated looks that would fight our custom theme; not worth the lock-in.
- **Going back to a plain React + Vite web app** (instead of Expo) to get access to shadcn/ui et al. — rejected because we want the option of a native mobile app later from the same codebase. Explicitly chosen in the original plan questioning.

## Revisit if

- A screen turns out to need three or more complex primitives we'd have to build from scratch (e.g. accessible Combobox, Command Palette, Calendar, animated Sheet) and the cost of building them is measurably higher than adopting a library.
- The "avoid the generic Material look" argument stops feeling worth it when we're shipping real content.
