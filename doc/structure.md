src/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── (home)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── class/
│   │       └── [classId]/
│   │           └── page.tsx
│   └── api/
│       ├── [[...route]]/
│       │   └── route.ts
│       ├── class/
│       │   ├── create/
│       │   │   └── route.ts
│       │   ├── join/
│       │   │   └── route.ts
│       │   └── list/
│       │       └── route.ts
├── components/
│   └── ui/
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
├── db/
│   ├── index.ts
│   └── schema.ts
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── modules/
│   ├── auth/
│   │   └── ui/
│   │       └── components/
│   │           └── auth-button.tsx
│   ├── class/
│   │   └── ui/
│   │       └── components/
│   │           ├── announcement/
│   │           │   └── announcement-table.tsx
│   │           ├── attendance/
│   │           │   └── attendance-record.tsx
│   │           ├── create/
│   │           │   └── create-class-button.tsx
│   │           └── join/
│   │               └── join-class-button.tsx
│   └── home/
│       └── ui/
│           ├── components/
│           │   ├── home-navbar/
│           │   │   └── index.tsx
│           │   └── home-sidebar/
│           │       ├── class-list.tsx
│           │       └── index.tsx
│           └── layouts/
│               └── home-layout.tsx
├── index.ts
