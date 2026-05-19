# Project Refactoring Documentation

## Overview
Refactored "The Blog Zone" frontend to modern standards using Next.js 14, replacing custom HTML/CSS with **shadcn/ui** components and **Tailwind CSS**.

## 1. UI Framework & Theming
**What Changed:**
- Replaced custom CSS/Tailwind styles with `shadcn/ui` component library.
- Implemented System/Light/Dark mode switching.

**How:**
- Initialized shadcn: `npx shadcn@latest init`
- Installed `next-themes` and wrapped the app in a `ThemeProvider` (`src/components/theme-provider.jsx`).
- Created a `ModeToggle` component for user switching.
- Updated `src/app/layout.js` to include the `ThemeProvider`.

## 2. Component Integration
**What Changed:**
- Standardized UI elements (Buttons, Inputs, Cards, Dialogs) across the app.

**How:**
- Installed specific components via CLI:
  ```bash
  npx shadcn@latest add button card input label dropdown-menu avatar skeleton sheet textarea switch checkbox badge separator sonner tabs
  ```
- Replaced HTML tags (e.g., `<button>`, `<input>`) with imports:
  ```jsx
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  ```

## 3. Page-Specific Refactoring

### Dashboard (`src/app/dashboard/page.js`)
- **Grid Layout**: Converted post list to a responsive grid of `Card` components.
- **Search**: Added a collapsible search bar using `Input` and `DropdownMenu` for filtering by title/content.
- **Header**: Sticky header with `ModeToggle` and navigation.

### Authentication (`src/app/login/page.js`, `src/app/signup/page.js`)
- **Forms**: Wrapped in `Card` for better visual hierarchy.
- **Validation**: Added visual cues using `Input` variants and `sonner` toasts for error handling.

### Post Management (`create-blog`, `edit-blog`)
- **Privacy Toggle**: Replaced radio buttons with `Switch` component.
- **Layout**: Centered form in a `Card` for focus.

### Post Details (`src/app/dashboard/[id]/page.js`)
- **Typography**: Improved readability.
- **Comments**: Styled using `Card` and `Avatar`.
- **Feedback**: Integrated `sonner` for toast notifications on comment submission/deletion.

### Profile (`src/app/profile/page.js`)
- **Organization**: Used `Tabs` to separate "Personal Info" and "Security" settings.
- **UX**: Better feedback for password changes and profile updates.

## 4. Code Cleanup
- Removed unnecessary custom CSS from `globals.css`.
- Removed hardcoded colors in favor of Tailwind CSS variables (`bg-background`, `text-foreground`) to support theming.
