---
name: Tactical HUD Operations
colors:
  surface: '#101416'
  surface-dim: '#101416'
  surface-bright: '#363a3c'
  surface-container-lowest: '#0b0f11'
  surface-container-low: '#181c1e'
  surface-container: '#1c2022'
  surface-container-high: '#262b2d'
  surface-container-highest: '#313538'
  on-surface: '#e0e3e5'
  on-surface-variant: '#b9ccb5'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#849581'
  outline-variant: '#3b4b3a'
  surface-tint: '#00e55b'
  primary: '#edffe8'
  on-primary: '#003911'
  primary-container: '#00ff66'
  on-primary-container: '#007128'
  inverse-primary: '#006e27'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#fff9f6'
  on-tertiary: '#472a00'
  tertiary-container: '#ffd7aa'
  on-tertiary-container: '#895600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff83'
  primary-fixed-dim: '#00e55b'
  on-primary-fixed: '#002107'
  on-primary-fixed-variant: '#00531b'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#101416'
  on-background: '#e0e3e5'
  surface-variant: '#313538'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: 0.06em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.04em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0.04em
  title-sm:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.06em
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: 0.02em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.1em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.12em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 10px
    letterSpacing: 0.15em
spacing:
  gutter: 0.75rem
  gutter-mobile: 0.5rem
  margin: 1.25rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an uncompromising, mission-critical operations aesthetic engineered for defense aerospace, command centers, and combat telemetry helmet displays. The interface establishes absolute situational awareness, rapid optical scanning, and zero-latency operational clarity. 

The aesthetic is built on high-contrast technical utilitarianism:
- **Surface Reality:** Matte ballistic carbon composites, radar absorption coatings, and low-reflectance surfaces replace consumer glossy conventions.
- **Visual Tenor:** Zero decorative fluff. Every pixel, tick mark, line fragment, and coordinate string functions as diagnostic data or target acquisition telemetry.
- **Tactical Atmosphere:** Phosphor night-vision emissions, tactical alert states, laser ranging markers, and micro-bracket containment systems construct a high-readiness operational posture.

## Colors

The palette reproduces night-vision phosphor tubes, military vector displays, and heads-up collimated glass readouts over deep, non-reflective tactical surfaces.

### Primary Role (Phosphor Night-Vision)
`#00ff66` anchors the system. It represents active flight channels, nominal operational parameters, verified telemetry nodes, reticles, and primary interactive vectors. On dark ballistic ground, it delivers instant target capture.

### Secondary Role (Laser Cyan Telemetry)
`#06b6d4` designates secondary instrument readouts, spatial coordinate systems, atmospheric data, sensor arrays, and orbital trajectories. It splits focus cleanly from primary fire-control green.

### Tertiary Role (Tactical Amber / High Alert)
`#f59e0b` governs advisory states, threat classification warnings, caution zones, and payload readiness. Escalated emergency alerts deploy hard orange-red (`#ff5722`) for fire-control locks, critical sensor failures, and incoming hazards.

### Surface & Substrate Matrix
The structural baseline operates strictly within a tiered dark spectrum:
- Base Substrate: `#080c0e` (Deep ballistic carbon)
- Primary Shell / Framing: `#0c1215` (Reinforced console plane)
- Elevated Pod / Flight Container: `#111a1f` (Active instrument surface)
- Muted Technical Grid / Reticle Lines: `#1e293b` with variable alpha opacity (20%–40%)

## Typography

The typographic hierarchy enforces rapid, zero-error interpretation under extreme duress:

- **Monospaced Numerical Integrity:** All data readouts, elevation tags, bearings, timestamps, and coordinates use `JetBrains Mono`. Monospaced tabular figures guarantee structural column alignment without jitter during real-time data streaming.
- **Display Structural Rigor:** Tactical section headers, quadrant labels, and alert titles utilize uppercase `Space Grotesk` with amplified letter-spacing to prevent visual crowding under synthetic night vision or high glare.
- **Casing Standards:** Labels, mode indicators, and micro-metadata must render in full uppercase (`UPPERCASE`). Body explanations and combat logs retain standard sentence casing for narrative scanning speed.

## Layout & Spacing

This design system uses a strict tactical HUD grid optimized for information density, peripheral line-of-sight scanning, and split-screen sensor feeds.

### Layout Model
- **Command Flight Deck:** Desktop and ultra-wide consoles adopt a 12-column, tight-gutter fluid grid with fixed instrument docks on the outer flanks (flight parameters left, weapons/telemetry right) and tactical spatial rendering in the main center aperture.
- **Tablet / Co-Pilot Terminal:** Reflows into an 8-column layout. Flank docks collapse into top and bottom telemetry bands.
- **Helmet/Handheld Mobile HUD:** 4-column compact stack. Critical diagnostic readouts lock into pinned tactical bars at the top and bottom edge, reserving center canvas for target elevation and situational messaging.

### Spacing Discipline
The spacing rhythm favors compressed, machine-calibrated increments. Component padding strictly follows dense technical increments (`space-xs` through `space-md`), minimizing dead space while using sharp geometric dividers, crosshairs, and bounding brackets to isolate data streams.

## Elevation & Depth

Standard diffuse drop-shadows are strictly prohibited; physical drop shadows do not exist inside a collimated head-up display. Depth is achieved entirely through high-contrast outlines, technical alpha layering, and optical collimation.

### Depth Hierarchy
1. **Canvas Zero (Sensor Feed / Combat Ground):** `#080c0e` with optional 32px × 32px millimeter-thin vector grid overlay at 12% opacity.
2. **Structural Instrument Paneling:** `#0c1215` with crisp 1px borders of `#1e293b` or `#00ff66` at 25% opacity.
3. **Targeting Pods & Focused Modules:** `#111a1f` elevated strictly via an acute 1px neon vector trace (`#00ff66` or `#06b6d4`) and sharp cut-corner framing brackets.
4. **Collimated HUD Overlay (Virtual Infinite Focus):** Text, reticles, crosshairs, and indicators render without backgrounds, floating directly above imagery with a subtle optical bloom: `drop-shadow(0 0 4px rgba(0, 255, 102, 0.45))`.

## Shapes

The geometry is unapologetically severe, angular, and machined. Rounded radii are forbidden across all core interfaces.

### Geometric Rules
- **Absolute 0px Radius:** All standard buttons, containers, panels, and chips feature crisp 90-degree corners.
- **Chamfered / Beveled 45° Cuts:** Primary tactical frames, active fire-control triggers, and quadrant cards feature corner notches (4px to 8px 45-degree angle cutouts), mimicking military chassis machining and avionics housing.
- **Framing Brackets:** Container bounds are frequently defined not by full continuous borders, but by 4-corner L-brackets (crosshair framing) measuring 8px on each axis.

## Components

### Buttons & Action Triggers
- **Primary Fire/Engage:** Solid `#00ff66` fill, jet-black monospaced text (`#080c0e`), bold weight, uppercase, sharp corners or 45-degree chamfered top-right corner. On hover, inverse to black background with `#00ff66` text, crisp 1px phosphor border, and 6px phosphor bloom.
- **Secondary Telemetry Trigger:** Dark matte background (`#111a1f`), 1px solid `#06b6d4` border, cyan monospaced text.
- **Hazard / Abort:** High-alert amber (`#f59e0b`) or combat orange-red (`#ff5722`) with diagonal caution hazard micro-hashing along the outer 4px trim.

### Coordinate Chips & Badges
- Miniature, dense informational tags (`label-sm`).
- Enclosed in a 1px border with a corner index prefix (e.g., `[SYS:OK]`, `[LAT 42.109]`, `[IFF:FOE]`).
- Backgrounds remain dark semi-transparent (`rgba(17, 26, 31, 0.8)`).

### Input Fields & Terminal Prompts
- Dark ballistic background (`#080c0e`) with a bottom-only or bracketed 1px outline (`#06b6d4`).
- Label fixed strictly above the field in uppercase micro-type (`label-sm`), accompanied by a diagnostic reference ID (e.g., `INP.04 // HEADING`).
- Terminal-style block cursor blinking at a mechanical 1Hz frequency.

### Tactical Cards & Instrument Pods
- Background of `#0c1215` framed by 1px segmented borders.
- Top header includes an integrated technical status strip: a live blinking radar blip, channel name, and coordinate lock.
- Framing options: Continuous 1px borders or 4-corner targeting brackets (`+` or `L` marks at panel vertices).

### Checkboxes, Switches & Radio Indicators
- Square geometric toggles with 0px radius.
- Unchecked: 1px hollow frame in `#1e293b`.
- Checked: Solid `#00ff66` center square with an acute center crosshair; zero curved checkmarks.
- Rocker/Toggle switches render as mechanical two-state stepped slider bars with real-time numeric readouts (`0` / `1`).

### Telemetry Bars & Radar Gauges
- Horizontal and vertical segmented ladder meters (e.g., 20 discrete 2px-wide ticks separated by 1px gaps).
- Nominal levels illuminate in `#00ff66`; caution thresholds dynamically shift into `#f59e0b`; critical redlines ignite in `#ff5722`.
- Bearing compass rings and target acquisition rings render with fine 1px concentric paths, cardinal degree tick-marks, and dynamic crosshair overlays.