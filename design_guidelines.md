# Office Tools Hub - Design Guidelines

## Design Approach
**System-Based with Productivity Tool References**
Drawing inspiration from modern SaaS tools like Notion, Linear, and Smallpdf, combined with Material Design principles for clarity and feedback. Focus on efficiency, visual hierarchy, and tool discoverability.

---

## Typography System

**Font Family:** Inter or DM Sans from Google Fonts (2 weights: 400, 600)

**Hierarchy:**
- H1 (Hero): text-5xl md:text-6xl font-semibold
- H2 (Section Titles): text-3xl md:text-4xl font-semibold
- H3 (Tool Categories): text-2xl font-semibold
- H4 (Tool Names): text-xl font-semibold
- Body: text-base leading-relaxed
- Small (Metadata): text-sm
- Buttons: text-sm font-medium uppercase tracking-wide

---

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 or p-8
- Section vertical spacing: py-16 md:py-24
- Grid gaps: gap-6 md:gap-8
- Container: max-w-7xl mx-auto px-4 md:px-8

**Grid Patterns:**
- Tool Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Category Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Feature Benefits: grid-cols-1 md:grid-cols-3
- Templates: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

---

## Component Library

### Navigation
- Sticky top nav: h-16, items-center, max-w-7xl container
- Logo left, main nav center, dark mode toggle + CTA button right
- Mobile: hamburger menu with slide-out drawer
- Footer: 4-column grid with links, newsletter signup, social icons

### Hero Section (Home Page)
- **Layout:** Two-column split on desktop (60/40), stacked on mobile
- **Left:** Headline + subheadline + 2-button CTA + trust indicators ("1M+ documents processed monthly")
- **Right:** Hero illustration/image showing tool interface mockup
- **Background:** Subtle gradient mesh or geometric pattern (non-distracting)
- Height: min-h-[600px]

### Tool Cards (Primary Component)
- Rounded corners: rounded-xl
- Padding: p-6
- Structure: Icon (top) → Tool Name → Brief description → "Use Tool" button
- Hover: Subtle lift effect (transform translate-y-[-4px] transition-transform)
- Icon size: w-12 h-12 (use Heroicons via CDN)

### Category Cards
- Similar to tool cards but larger: p-8
- Icon + Category name + Tool count badge + Arrow icon
- Full clickable area

### Upload Interface (Tool Pages)
- Dashed border drag-and-drop zone: min-h-[300px] rounded-xl border-2 border-dashed
- Center aligned: Icon + "Drag & drop or click to upload" + file type/size info
- Selected file preview area with file name, size, and remove button
- Process button: Prominent, full width on mobile

### Buttons
**Primary CTA:** px-8 py-3 rounded-lg font-medium
**Secondary:** px-6 py-2 rounded-lg border-2
**Icon Buttons:** p-3 rounded-lg (for dark mode toggle, actions)
**Hover States:** Implement subtle scale (hover:scale-105) and shadow changes

### Template Cards
- Thumbnail preview image (aspect-ratio-[3/4])
- Template name + category badge
- "Download" button
- 4-column grid on desktop, responsive

### Pricing Cards
- 3 tiers side-by-side on desktop
- Featured tier (Pro): Elevated with subtle border accent
- Feature list with checkmark icons
- Prominent CTA button per tier

---

## Page-Specific Layouts

### Home Page Sections (in order):
1. **Hero** (as described above)
2. **Categories Grid** - 6 main categories in 3-column grid, py-20
3. **Popular Tools** - Horizontal scroll or 4-column grid of top 12 tools, py-20
4. **Template Gallery Preview** - 4 template cards + "View All Templates" link, py-20
5. **Why Choose Us** - 3-column features (Free, No Login, Fast Processing) with icons, py-20
6. **Stats Banner** - Full-width, 4 stat counters in single row, py-16
7. **CTA Section** - Centered "Get Started Free" with supporting text, py-20

### Tool Category Pages
- Page header with category icon + name + description
- Tool grid below (3-4 columns)
- Sidebar: Quick navigation to other categories (desktop only)

### Individual Tool Pages
- Tool name + breadcrumb navigation
- Upload interface (primary focus)
- Processing status indicator (progress bar)
- Download section (appears after processing)
- "How to Use" accordion below
- Related tools grid at bottom

### Templates Page
- Filter tabs at top (All, Resume, Invoice, Forms, etc.)
- Template grid (4 columns)
- Preview modal on click with download button

---

## Icons & Assets

**Icon Library:** Heroicons via CDN (outline style for general UI, solid for emphasis)
- Tool category icons: 48x48px
- Feature icons: 32x32px
- UI icons: 20x24px

**Images:**
- Hero section: Custom illustration or tool interface mockup showing PDF/image processing
- Template previews: Document thumbnails
- Feature graphics: Abstract tech-themed illustrations (can use placeholder services initially)

---

## Interactions & Animations

**Minimal, Purposeful Animations:**
- Card hover: Subtle lift (4px)
- Button hover: Scale (1.02) + shadow increase
- File upload: Gentle pulse on drag-over
- Processing: Smooth progress bar animation
- Page transitions: None (instant load for speed)
- Dark mode toggle: Smooth 200ms transition

**NO animations on:** Text, backgrounds, excessive scroll effects

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Base (< 768px) - Single column, stacked layout, full-width CTAs
- Tablet: md (768px+) - 2-column grids, side-by-side elements
- Desktop: lg (1024px+) - 3-4 column grids, full layout
- Wide: xl (1280px+) - Maximum 4 columns, generous spacing

**Mobile-Specific:**
- Sticky bottom CTA bar on tool pages
- Hamburger navigation
- Expanded tap targets (min 44x44px)
- Simplified tool cards (icon + name only)

---

## Dark Mode Strategy

Implement via toggle button in nav, persist preference in localStorage, apply across all pages with consistent hierarchy maintenance (not color-dependent)

---

This design creates a professional, efficient tool hub that prioritizes usability while maintaining visual appeal through thoughtful hierarchy, generous whitespace, and strategic use of multi-column layouts.