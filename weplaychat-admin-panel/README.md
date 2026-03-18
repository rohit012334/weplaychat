# NexaChat Admin Panel

A comprehensive admin dashboard for managing the NexaChat application, built with **Next.js**, **React**, **Redux Toolkit**, and **Firebase Authentication**.

---

## 🚀 Features

### Core Features
- **Dashboard** - Real-time analytics and statistics overview
- **User Management** - View, edit, block/unblock users
- **Host Management** - Manage hosts, their profiles, and earnings
- **Agency Management** - Create and manage agencies with commission tracking
- **VIP Plans** - Create and manage VIP subscription plans
- **Coin Plans** - Manage in-app currency packages
- **Gift Management** - Create and manage virtual gifts
- **Withdrawal Requests** - Process host/agency withdrawal requests
- **Notifications** - Send push notifications to users/hosts
- **Settings** - Configure app settings, payment gateways, and more

### Authentication
- Firebase Authentication integration
- Secure session management with Redux Persist
- Auto-redirect for authenticated/unauthenticated users

### UI/UX
- Modern, responsive design with TailwindCSS
- Dark/Light theme support
- Loading skeletons for better UX
- Toast notifications for user feedback

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React Framework |
| React 19 | UI Library |
| Redux Toolkit | State Management |
| Redux Persist | State Persistence |
| Firebase | Authentication |
| Axios | HTTP Client |
| TailwindCSS | Styling |
| React-Toastify | Notifications |
| React-DatePicker | Date Selection |
| React-Select | Dropdown Components |
| MUI (Material-UI) | UI Components |

---

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd admin

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The app will be available at `http://localhost:5001`

---

## 🔧 Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://api.nexachats.com/
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 📁 Project Structure

```
src/
├── api/                    # API configurations
├── assets/                 # Images, icons, styles
│   ├── images/
│   └── scss/
│       ├── custom/         # Custom CSS
│       ├── default/        # Default styles
│       └── style/          # Main styles
├── component/              # Reusable components
│   ├── agency/             # Agency-related components
│   ├── coinPlan/           # Coin plan components
│   ├── gift/               # Gift components
│   ├── history/            # History components
│   ├── host/               # Host components
│   ├── layout/             # Layout (Navbar, Sidebar)
│   ├── lib/                # Firebase config
│   ├── setting/            # Settings components
│   ├── Shimmer/            # Loading skeletons
│   ├── user/               # User components
│   └── vipPlan/            # VIP plan components
├── extra/                  # Extra UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Navigator.tsx
│   ├── Pagination.tsx
│   └── Table.tsx
├── pages/                  # Next.js pages
│   ├── Host/               # Host pages
│   ├── User/               # User pages
│   ├── _app.jsx            # App wrapper
│   ├── AuthCheck.tsx       # Auth guard
│   ├── dashboard.tsx       # Dashboard
│   ├── Login.tsx           # Login page
│   └── ...
├── store/                  # Redux store
│   ├── adminSlice.ts
│   ├── agencySlice.ts
│   ├── hostSlice.ts
│   ├── userSlice.ts
│   └── store.ts
└── utils/                  # Utility functions
    ├── ApiInstance.ts
    ├── config.ts
    └── toastServices.ts
```

---

## 🐛 Bug Fixes Changelog

### 🔴 Critical Security Fixes

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 1 | Password stored in sessionStorage | `adminSlice.ts` | ✅ Removed encrypted password storage |
| 2 | Password stored in sessionStorage | `agencySlice.ts` | ✅ Removed encrypted password storage |
| 3 | Console.log exposing sensitive data | Multiple files | ✅ Removed 30+ console statements |

### 🟠 High Priority Fixes

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 4 | ESLint v9 incompatibility | `package.json` | ✅ Downgraded to ESLint 8.57.0 |
| 5 | Dispatch used before declaration | `HostDialog.tsx` | ✅ Moved dispatch to top of component |
| 6 | Null reference on image | `AgencyDialog.tsx:65` | ✅ Added optional chaining `?.` |
| 7 | Image with empty src error | `Input.tsx:95-105` | ✅ Conditional rendering |
| 8 | JSON.parse without try-catch | `UserInfo.tsx` | ✅ Added try-catch wrapper |
| 9 | JSON.parse without try-catch | `CoinPlanHistory.tsx` | ✅ Added try-catch wrapper |
| 10 | Login persistence issue | `AuthCheck.tsx` | ✅ Added hydration check & sessionStorage backup |
| 11 | Early return without reset | `AgencyDialog.tsx` | ✅ Added `setIsSubmitting(false)` |
| 12 | Missing useEffect dependency | `HostDialog.tsx` | ✅ Added `dispatch` to dependency array |
| 13 | useEffect wrong dependency | `WithdrawRequest.tsx` | ✅ Changed `[statusType]` → `[type]` |

### 🟡 Medium Priority Fixes

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 14 | Password input type="text" | `Login.tsx:154` | ✅ Changed to type="password" |
| 15 | localStorage key conflict | `Setting.tsx` | ✅ Changed `planType` → `settingType` |
| 16 | Password icon position | `custom.css` | ✅ Fixed positioning in dialogs |
| 17 | Login error handling | `Login.tsx` | ✅ Reset loading on validation failure |

### 🟢 Minor Fixes

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 18 | Typo "Follwing List" | `UserInfoPage.tsx:58` | ✅ Fixed to "Following List" |
| 19 | Unused Image import | `UserInfo.tsx` | ✅ Removed |
| 20 | Unused Image import | `VipPlan.tsx` | ✅ Removed |
| 21 | Unused Image import | `CoinPlan.tsx` | ✅ Removed |
| 22 | SVG attribute `fill-rule` | `user.tsx` | ✅ Changed to `fillRule` |
| 23 | SVG attributes in Navbar | `Navbar.tsx` | ✅ Changed to camelCase |
| 24 | Missing key props | `Sidebar.tsx` | ✅ Added React.Fragment keys |
| 25 | `borderRadiuse` typo | `adminProfile.tsx` | ✅ Fixed to `borderRadius` |

### 🎨 UI/UX Fixes

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 26 | Dashboard text cutoff | `style.css` | ✅ Added overflow visible |
| 27 | "No Data Found" not centered | `style.css` | ✅ Added text-align center |
| 28 | Admin profile image cutoff | `adminProfile.tsx` | ✅ Reduced size to 200px |
| 29 | VIP Plan button alignment | `Plan.tsx` | ✅ Added justify-content-end |
| 30 | Date picker cutoff | `style.css` | ✅ Added min-width |
| 31 | Setting submit button | `style.css` | ✅ Added margin/padding |
| 32 | Sidebar icons alignment | `style.css` | ✅ Reverted to left alignment |
| 33 | Pagination position | `style.css` | ✅ Reverted to original |
| 34 | Dashboard icons too large | `dashboard.tsx` | ✅ Reduced from 56px to 28px |
| 35 | Password icon position in dialog | `custom.css` | ✅ Fixed with absolute positioning |
| 36 | Sidebar collapse icons not centered | `style.css` | ✅ Added flexbox centering |
| 37 | Dashboard cards redesign | `dashboard.tsx` | ✅ Original purple color (#F8F6FF), proper padding/gap |
| 38 | Avatar dropdown in header | `Navbar.tsx` | ✅ Added dynamic dropdown with admin data |
| 39 | Header logout functionality | `Navbar.tsx` | ✅ Added logout button in dropdown |
| 40 | Password icon position | `custom.css` | ✅ Consistent bottom positioning for all fields |
| 41 | Add Identity Proof button spacing | `DocumentType.tsx` | ✅ Added proper padding |
| 42 | Logout at bottom of sidebar | `Sidebar.tsx` | ✅ Fixed position at bottom with flex layout |
| 43 | Viewport metadata warning | `layout.tsx` | ✅ Moved viewport to separate export |
| 44 | Double scrollbar in sidebar | `style.css` | ✅ Hidden inner scrollbar, reduced outer width |
| 45 | Dashboard cards icon color | `dashboard.tsx` | ✅ Purple gradient on icon, white background on card |

### 🔧 Code Optimization Fixes

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 46 | Multiple setState in useEffect | `AdminSetting.tsx` | ✅ Combined useEffects with early return |
| 47 | 20+ setState in useEffect | `PaymentSetting.tsx` | ✅ Combined useEffects with early return |
| 48 | Redundant useEffects | `WithdrawRequest.tsx` | ✅ Combined localStorage effects |
| 49 | Missing router dependency | `UserInfoPage.tsx` | ✅ Added router to dependency array |
| 50 | Missing router dependency | `Setting.tsx` | ✅ Added router to dependency array |
| 51 | Non-serializable Redux warning | `adminSlice.ts` | ✅ Return response.data instead of full axios response |
| 52 | Dashboard/Sidebar gradient color | `dashboard.tsx`, `style.css` | ✅ Changed to solid purple (#9f5aff) |
| 53 | Router used before declaration | `dashboard.tsx` | ✅ Moved router declaration before useEffect |
| 54 | Password toggle not working | `Login.tsx` | ✅ Fixed input type to use showPassword state |
| 55 | Registration page image mismatch | `Registration.tsx` | ✅ Using same Unsplash image as Login page |

### 🔐 Authentication System Fixes

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 56 | Token read at module load time | `adminSlice.ts` | ✅ Changed to dynamic getter functions |
| 57 | apiInstanceFetch missing headers support | `ApiInstance.ts` | ✅ Added config parameter for custom headers |
| 58 | 401 infinite redirect loop | `ApiInstance.ts` | ✅ Skip redirect on login page/request |
| 59 | Missing PersistGate | `Provider.tsx` | ✅ Added PersistGate for proper rehydration |
| 60 | Stale auth state not cleared | `AuthCheck.tsx` | ✅ Clear auth when token missing |
| 61 | Axios missing dynamic token | `_app.jsx` | ✅ Added request/response interceptors |
| 62 | Dashboard API calls without auth | `dashboard.tsx` | ✅ Added token check before API calls |
| 63 | Bearer prefix missing | `_app.jsx` | ✅ Added Bearer prefix to Authorization header |

### 🎨 UI Component Improvements

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| 64 | Tooltip undefined children | `Navigator.tsx` | ✅ Conditional render when children exists |
| 65 | fill-rule SVG warning | `dailyCheckInReward.tsx`, `plan.tsx`, `vipplan_benefits.tsx` | ✅ Changed to fillRule (React JSX) |
| 66 | Login image not showing | `style.css` | ✅ Added height: 100vh to image-section |
| 67 | Password fields inconsistent | Multiple files | ✅ Created reusable PasswordInput component |
| 68 | PasswordInput TypeScript error | `PasswordInput.tsx` | ✅ Made value prop optional (string \| undefined) |
| 69 | Password icon not centered | `PasswordInput.tsx` | ✅ Wrapped input in relative div with transform translateY(-50%) |
| 70 | Registration form not scrollable | `Registration.tsx` | ✅ Added overflowY: auto and maxHeight: 100vh |
| 71 | redux-persist SSR warning | `store.ts` | ✅ Created noop storage for server-side rendering |
| 72 | Registration form cutoff | `Registration.tsx` | ✅ Added padding top/bottom 40px, removed justify-content-center |
| 73 | Build failing - unescaped apostrophe | `Login.tsx` | ✅ Changed `Let's` to `Let&apos;s` |
| 74 | Build failing - img element warnings | `eslint.config.mjs` | ✅ Disabled @next/next/no-img-element rule |

---

## 📝 Console Statements Removed

| File | Count |
|------|-------|
| `AgencyDialog.tsx` | 15 |
| `Registration.tsx` | 5 |
| `HostDialog.tsx` | 3 |
| `adminSlice.ts` | 3 |
| `ApiInstance.ts` | 3 |
| `ForgotPassword.tsx` | 2 |
| `Login.tsx` | 1 |
| **Total** | **32** |

---

## ⚠️ Known Issues / Recommendations

### Security (Requires Manual Action)
1. **Move credentials to `.env.local`** - `config.ts` has hardcoded API keys
2. **Firebase config exposed** - Move to environment variables

### Code Quality
1. **470+ uses of `any` type** - Add proper TypeScript types
2. **jQuery in React** - Replace with React patterns in `Input.tsx` and `Sidebar.tsx`

---

## 🔐 Authentication Flow

1. User enters credentials on Login page
2. Firebase authenticates user
3. Token stored in sessionStorage
4. Redux state updated with `isAuth: true`
5. Redux Persist saves auth state to localStorage
6. AuthCheck component guards protected routes
7. On page refresh, hydration restores auth state

---

## 📜 Scripts

```bash
# Development
pnpm dev          # Start dev server on port 5001

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Linting
pnpm lint         # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Developer Notes

- Always run `pnpm install` after pulling changes
- Check `AuthCheck.tsx` for authentication logic
- Redux store is configured in `src/store/store.ts`
- API instance is in `src/utils/ApiInstance.ts`

---

**Last Updated:** January 2, 2026  
**Version:** 1.0.2#   n e x a c h a t - a d m i n 
 
 #   n e x a c h a t - a d m i n 
 
 
