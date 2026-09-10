# Campus DAO visual system

Direction: editorial landing page and matching dark club workspace. The generated concept guides the public surface; existing functional forms/tables are adapted to the same tokens.

- Background: #10120e; panel: #191c16; text: #f2f3e9; muted: #a7ae9e; accent: #d5ff70.
- Typography: system sans-serif, oversized tightly tracked headings, 13–16px controls and body text. No remote font dependency.
- Landing: quiet navigation, three-line hero, open orbital diagram, participation strip, three-step process, final call to action.
- Workspace: sidebar, responsive drawer/bottom navigation, open feature links, restrained panels for actual forms and tables.
- Motion: one-time cut reveals, intersection-based section reveals, slow orbit, hover translation. Reduced motion disables animation and reveals all content immediately.
- Inspiration: https://21st.dev/@danielpetho/components/vertical-cut-reveal and https://21st.dev/@minhxthanh/components/animated-infinity-background. No third-party component code copied.
- Intentional concept adjustments: vector geometry is implemented in CSS so it can animate; copy avoids suggesting the unconfigured preview is already deployed. Functional workspace navigation and wallet controls extend the concept.

Implementation: `app/visual-theme.css`, `app/page.tsx`, `components/reveal.tsx`, and shared workspace components.

## Visual verification — 2026-09-10

Compared the generated [concept](design-concept.png) with rendered [desktop](landing-desktop.png) and [mobile](landing-mobile.png) screenshots. The three-line hierarchy, split orbital hero, restrained palette, process strip, and closing action are retained. The implementation uses a taller hero and more generous vertical space than the concept; mobile stacks the orbital graphic below the actions. Active workspace labels were corrected to dark text on lime.

Browser checks cover eight routes at 390px with no horizontal overflow, landing navigation, and reduced-motion rendering. Screenshots show preview data, not deployment evidence.
