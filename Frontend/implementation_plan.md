# Frontend UI Revamp Implementation Plan

We are completely overhauling the frontend's look and feel to be **modern**, **attractive**, and **dynamic**, without touching the backend code. The backend integration will remain exactly as it is.

## Goal Description
Create a premium, state-of-the-art web application design featuring:
- **Rich Aesthetics:** A cohesive, modern color palette (e.g., rich slate/zinc backgrounds with vibrant violet/indigo or emerald accents).
- **Dynamic Animations:** Micro-interactions and page transitions using `framer-motion` (already in [package.json](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/package.json)).
- **Glassmorphism:** Elegant use of backdrop blur and semi-transparent layers for cards and modals.
- **Modern Typography:** Using a clean, readable font like *Inter* or *Outfit*.
- **Premium Components:** Leveraging Tailwind CSS and the existing Radix UI primitives.

## User Review Required
> [!IMPORTANT]
> Since this is a complete visual overhaul, I want to confirm the overarching theme preference. I plan to build a sleek, slightly dark/glassmorphic "premium tech" aesthetic by default. If you prefer a bright, clean, "light mode" look, please let me know!
> No backend endpoints or business logic will be altered during this revamp.

## Proposed Changes

### Core Styling & Typography
---
#### [MODIFY] [index.css](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/index.css)
- Import modern Google Font (e.g., `Inter`).
- Define CSS variables for the advanced color palette.
- Add base custom utilities for glowing effects, glass panels, and custom scrollbars.

### Component Updates (UI Primitives & Layout)
---
These components will be upgraded to match the new design system:
#### [MODIFY] [App.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/App.jsx)
- Wrap root in standard Framer Motion `AnimatePresence` and ensure theme context is applied.

### Page Overhauls (Authentication)
---
#### [MODIFY] [HrLogin.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/hr/HrLogin.jsx)
#### [MODIFY] [HrRegister.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/hr/HrRegister.jsx)
- Redesign with a breathtaking split-screen layout or centered floating glassmorphism card.
- Add animated floating background shapes.
- Enhance input fields with focus animations.

### Page Overhauls (Public Job Portal)
---
#### [MODIFY] [JobBoard.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/public/JobBoard.jsx)
- Build a striking Hero Section with staggering text animations.
- Redesign Job Cards to be interactive with hover-lift effects.
#### [MODIFY] [JobApplication.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/public/JobApplication.jsx)
- Convert the application form into a clean, distraction-free modern interface.

### Page Overhauls (HR Dashboard)
---
#### [MODIFY] [HrDashboard.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/hr/HrDashboard.jsx)
- Implement a modern sidebar layout.
- Use animated stat cards and polished tables.
#### [MODIFY] [HrCandidates.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/hr/HrCandidates.jsx)
- Revamp the candidate list into a visually appealing grid or a highly legible table with profile avatars.
#### [MODIFY] [HrJobs.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/hr/HrJobs.jsx)
- Redesign job management UI.

### Page Overhauls (Interview)
---
#### [MODIFY] [InterviewRoom.jsx](file:///c:/Users/ankit/Desktop/New%20folder/PDP/Frontend/src/app/pages/interview/InterviewRoom.jsx)
- Convert to a modern, dark-themed "Focus Room" for video calls.
- Floating controls with blur backdrops.

## Verification Plan

### Automated Tests
- This codebase appears not to have a comprehensive unit test suite for components. We will rely heavily on Vite's HMR and manual visual verification.

### Manual Verification
1. Open the Vite dev server URL (usually `http://localhost:5173`) in the browser.
2. Navigate through the public `/jobs` route and visually verify the new Job Board and Application form.
3. Attempt to register (`/hr/register`) and login (`/hr/login`) to ensure the forms submit correctly to the unchanged backend.
4. Verify the HR Dashboard layout and candidate/job management sections.
5. Emphasize visual checks for responsiveness, contrast, and smooth animations.
