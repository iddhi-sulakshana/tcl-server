# Design System Document: The Luminescent Interface

## 1. Overview & Creative North Star

### Creative North Star: "The Neon Observatory"
This design system moves away from the sterile, flat "SaaS-blue" world into a high-fidelity, cinematic experience. It is built on the philosophy of **The Neon Observatory**: a dark, vast environment where data doesn't just sit on a screen—it glows with purpose. We prioritize depth through light emission rather than shadow, using glassmorphism and tonal layering to create a UI that feels like a premium physical console in a futuristic cockpit.

### Editorial Direction
We break the traditional grid by embracing **intentional asymmetry** and **tonal depth**. Instead of boxing content with rigid lines, we use light as a structural element. Elements should feel "docked" or "floating" within the deep navy void, using high-contrast typography scales (Plus Jakarta Sans for impact, Inter for utility) to guide the eye through the information hierarchy.

---

## 2. Colors

The palette is anchored in a monochromatic navy-black abyss, allowing vibrant, emissive accents to define the interactive landscape.

### Core Palette (Material Design Tokens)
- **Background:** `#020f1e` (The primary void)
- **Primary:** `#5eb4ff` (Electric Blue / Active States)
- **Secondary:** `#ff7162` (System Power / Critical Actions)
- **Tertiary:** `#aaffdc` (Status / Cooling / Eco)
- **Surface:** `#020f1e`
- **Surface Container Highest:** `#12273d` (Floating Cards)
- **On-Surface:** `#d8e6fc` (High-legibility text)

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off parts of the UI. Separation must be achieved via:
1. **Background Shifts:** Placing a `surface-container-high` card against the `background`.
2. **Tonal Transitions:** Using subtle shifts between `surface-container-low` and `surface-container-lowest`.
3. **Inner Glows:** Using a 1px inner stroke with 10-20% opacity of the `primary` color to define edges.

### Signature Textures
Main CTAs and critical readouts (like the 31°C display) must utilize **Radial Gradients**. Transition from `primary` (#5eb4ff) to `primary-container` (#2aa7ff) to provide a "pulsing" soul to the interface.

---

## 3. Typography

The system utilizes a dual-font strategy to balance high-end editorial aesthetics with technical precision.

| Token | Font Family | Size | Weight | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | Plus Jakarta Sans | 3.5rem | Bold | Large Temperature Readouts |
| **Headline-MD** | Plus Jakarta Sans | 1.75rem | Bold | Section Headers / Device Names |
| **Title-LG** | Inter | 1.375rem | Medium | Card Titles / Primary Modals |
| **Body-MD** | Inter | 0.875rem | Regular | Descriptions / Metadata |
| **Label-MD** | Inter | 0.75rem | Bold | All-caps functional labels (e.g., "FAN SPEED") |

**The Identity Logic:** Plus Jakarta Sans provides the "Futuristic" character for data display, while Inter ensures that utility-driven text remains readable even at low opacities or against blurred backgrounds.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering** rather than drop shadows.
- **Level 0 (Base):** `background` (#020f1e).
- **Level 1 (Sections):** `surface-container-low` (#041425).
- **Level 2 (Cards):** `surface-container-highest` (#12273d) with a 15% opacity.
- **Level 3 (Floating/Active):** Glassmorphism. Semi-transparent surface colors with a `backdrop-blur` of 20px–40px.

### Ambient Shadows & "Ghost Borders"
- **Shadows:** When an element must float, use an extra-diffused shadow (Blur: 40px, Spread: -10px) using the `on-surface` color at 6% opacity.
- **Ghost Borders:** For accessibility on interactive cards, use the `outline-variant` token at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
- **Primary (Action):** Full-bleed `primary` gradient. High-emissivity glow (Drop shadow: `primary` at 30% opacity).
- **Secondary (Power):** Use `secondary` (#ff7162) with a "Red Alert" glow.
- **Tertiary (Ghost):** No background. `primary` text. Border appears only on hover as a "Ghost Border."

### Glassmorphism Cards
- **Construction:** `surface-container-highest` at 40% opacity + 24px Background Blur.
- **Corners:** `xl` (1.5rem / 24px) for main containers; `lg` (1rem / 16px) for nested items.
- **Interactive State:** Upon selection, the card gains a 1px inner stroke of `primary` and an outer glow.

### Input Fields & Controls
- **Input Fields:** Deep `surface-container-lowest` backgrounds. No bottom line. Use `label-sm` for floating titles.
- **Checkboxes/Radio:** Replaced by "Glow Toggles." Active states should radiate light onto the surrounding surface.
- **Lists:** **Forbidden:** 1px divider lines. Separation must be achieved through `1rem` (lg) spacing or subtle background alternates.

### Additional Components: "The Command Hub"
- **The Mode Orb:** A circular control for AC modes using thin-line iconography and a rotating glow-ring indicating active state.
- **Visual Feedback Sliders:** Progress bars (e.g., Fan Speed) must use a gradient fill from `primary_dim` to `primary`.

---

## 6. Do's and Don'ts

### Do
*   **Do** use variable opacity to create hierarchy in text (e.g., use 70% opacity for `body-sm` metadata).
*   **Do** leverage "Light Leak" gradients in corners of the screen to suggest a world beyond the display.
*   **Do** ensure all thin-line icons have a minimum stroke width of 1.5px for legibility against dark backgrounds.

### Don't
*   **Don't** use pure white (#FFFFFF). Use `on-surface` (#d8e6fc) to prevent eye strain in dark environments.
*   **Don't** use "Standard" drop shadows. If it looks like a 2010 web button, it’s wrong. Light must feel ambient.
*   **Don't** use sharp corners. This system is "Soft Futuristic"; everything should feel ergonomic and rounded.
*   **Don't** use high-contrast dividers. Use white space or tonal shifts to separate content.