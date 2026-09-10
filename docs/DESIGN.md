# Campus DAO visual system

Direction: monochrome editorial landing page and matching dark club workspace. The generated concept guides the public surface; existing functional forms/tables use the same neutral tokens.

- Landing: true white and #080808. Workspace canvas: #080808; panel: #141414; text: #f5f5f5; muted: #a3a3a3. No colored accent.
- Typography: system sans-serif, oversized tightly tracked headings, 13–16px controls and body text. No remote font dependency.
- Landing: quiet navigation, three-line hero, interactive proposal Compose surface, three-step process, and final MetaMask call to action.
- Workspace: sidebar, responsive drawer/bottom navigation, open feature links, restrained panels for actual forms and tables.
- Motion: a slow conic focus ring on Compose and intersection-based section reveals. Reduced motion disables animation and reveals all content immediately.
- Component source: the user-supplied Compose specification, adapted with Campus DAO mentions, commands, copy, and login routing.
- Authentication: all workspace routes redirect to the dedicated MetaMask login surface until the signed session cookie passes HMAC and expiry validation.

Implementation: `app/visual-theme.css`, `app/page.tsx`, `components/reveal.tsx`, and shared workspace components.

## Visual verification — 2026-09-10

Compared the generated [concept](design-concept.png) with rendered [desktop](landing-desktop.png) and [mobile](landing-mobile.png) screenshots. The three-line hierarchy, proposal composer, true monochrome palette, process rail, closing action, and quiet footer are retained. Mobile stacks Compose below the headline and collapses its secondary hints.

Browser checks cover eight routes at 390px with no horizontal overflow, landing navigation, and reduced-motion rendering. Screenshots show preview data, not deployment evidence.
