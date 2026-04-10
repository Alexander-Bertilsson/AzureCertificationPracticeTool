# Design System Document: Azure Certification Study App

## 1. Overview & Creative North Star: "The Architectural Cloud"

This design system moves away from the "flat" web and toward a sophisticated, multi-dimensional workspace. The Creative North Star is **The Architectural Cloud**. It treats information not as text on a page, but as layered data structures floating in a vast, atmospheric environment.

By leveraging intentional asymmetry, oversized editorial type scales, and tonal depth, we transform a standard study tool into a premium learning environment. We prioritize cognitive ease through high-contrast typography and "spatial breathing room," ensuring that complex technical Azure concepts feel approachable and structured.

---

## 2. Colors: Tonal Atmosphere

The palette is inspired by the depth of the Azure ecosystem—transitioning from deep "Atmospheric" blues to "Luminous" teals.

### The "No-Line" Rule

**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to create a visual break without a "box" look.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers. Use the following hierarchy to define importance:

- **Base Layer:** `surface` (#f9f9f9)
- **Content Zones:** `surface-container-low` (#f3f3f3)
- **Interactive Cards:** `surface-container-lowest` (#ffffff) – This creates a "lift" effect.
- **Overlays/Modals:** `surface-container-highest` (#e2e2e2)

### The "Glass & Gradient" Rule

To evoke a "Cloud" feel, use **Glassmorphism** for floating elements (like progress bars or navigation rails). Apply a backdrop-blur (12px–20px) to `surface` colors at 80% opacity.

- **Signature Textures:** For Hero CTAs and "Success" states, use a linear gradient: `primary` (#005faa) to `primary-container` (#0078d4) at a 135-degree angle.

---

## 3. Typography: Technical Authority

We use a dual-font strategy to balance high-end editorial feel with technical precision.

- **Display & Headline (Manrope):** Use Manrope for all headers. Its wide apertures and geometric shapes feel modern and tech-forward.
  - _Role:_ Conveys brand authority and creates clear entry points for study modules.
- **Body & Label (Inter):** Use Inter for all functional text. It is optimized for high readability at small sizes, essential for long technical documentation.
  - _Role:_ Ensures zero eye strain during intense quiz sessions.

**Editorial Scaling:** Use `display-lg` (3.5rem) for section headers with tight letter-spacing (-0.02em) to create an "Azure Whitepaper" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often cluttered. This system uses **Tonal Layering** and **Ambient Shadows**.

- **The Layering Principle:** Place a `surface-container-lowest` (pure white) card on top of a `surface-container-low` (light grey) background. The contrast alone provides the "lift."
- **Ambient Shadows:** If a shadow is required for a floating Quiz Card, use a "Cloud Shadow":
  - _Blur:_ 32px | _Y-Offset:_ 12px | _Color:_ `on-surface` (#1a1c1c) at 4% opacity. This mimics natural light.
- **The "Ghost Border" Fallback:** For disabled states or secondary inputs, use a "Ghost Border": `outline-variant` (#c0c7d4) at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Functional Primitives

### Cards (The Study Topic Unit)

- **Style:** No borders. Use `surface-container-lowest` background.
- **Layout:** Intentional asymmetry. Place the topic icon (Teal `tertiary`) in the top-right, with the `headline-sm` title aligned to the bottom-left.
- **Interaction:** On hover, shift the background to `primary-fixed` (#d3e3ff) and increase the Ambient Shadow opacity to 8%.

### Progress Indicators (The Momentum Bar)

- **Track:** `surface-container-highest`.
- **Indicator:** A gradient from `secondary` (#00658d) to `secondary-container` (#2fbcfe).
- **Glass Effect:** Wrap the progress bar in a semi-transparent glass container for a "floating" look in the dashboard.

### Quiz Interfaces

- **Option Buttons:** Use `surface-container-low`. On selection, transition to `primary` with `on-primary` text.
- **Feedback:** Use `error_container` for incorrect answers and `tertiary_fixed` for correct ones. Avoid harsh reds/greens; stay within the refined Azure palette.

### Buttons

- **Primary:** `primary` background, `on-primary` text. Radius: `md` (0.375rem).
- **Secondary:** `secondary_container` background, `on-secondary_container` text.
- **Tertiary/Ghost:** No background. Use `primary` text.

### Inputs & Text Fields

- **Style:** Subtle `surface-container-high` background. No border.
- **Focus State:** A 2px "glow" using `primary` at 30% opacity, rather than a hard stroke.

---

## 6. Do’s and Don’ts

### Do

- **Do** use vertical white space (64px+) to separate major study sections instead of horizontal lines.
- **Do** use `tertiary` (Teal) for "Success" or "Completion" actions to differentiate from the "Azure Blue" primary actions.
- **Do** ensure all typography maintains a minimum contrast ratio of 4.5:1 against its background.

### Don’t

- **Don’t** use the `DEFAULT` (0.25rem) radius for everything. Use `full` for chips and `xl` (0.75rem) for large study cards to create a softer, modern feel.
- **Don’t** use pure black (#000000). Always use `on-background` (#1a1c1c) for text to reduce eye fatigue.
- **Don’t** center-align large blocks of text. Stick to left-aligned "Architectural" grids for technical clarity.
