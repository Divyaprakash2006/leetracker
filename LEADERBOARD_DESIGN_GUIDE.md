# 🏆 Dashboard Top 3 Leaderboard - Visual Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏆 Top Performers                              [View All Users]    │
│  Leading coders on the platform                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐            │
│  │  GOLD    │        │  SILVER  │        │  BRONZE  │            │
│  │  #1      │        │  #2      │        │  #3      │            │
│  │   🥇     │        │   🥈     │        │   🥉     │            │
│  └──────────┘        └──────────┘        └──────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Individual Card Design

### **First Place Card (#1 - Gold)**

```
┌─────────────────────────────────┐
│ ╔═══════════════════════════╗  │
│ ║   GOLD GRADIENT HEADER    ║  │  ← Yellow-Gold gradient
│ ║   (Yellow 400 → 600)      ║  │
│ ║                      [#1] ║  │  ← Yellow badge
│ ║   ╭───────╮              ║  │
│ ║  │   S   │               ║  │  ← Avatar (overlaps)
│ ╚══╰═══════╯═══════════════╝  │
│                                  │
│   shiyam28                       │  ← Username
│   📍 India                       │  ← Location
│                                  │
│   ┌──────────┐  ┌──────────┐   │
│   │    0     │  │   1500   │   │  ← Stats
│   │  Total   │  │  Rating  │   │
│   └──────────┘  └──────────┘   │
│                                  │
│   Easy:              0           │
│   Medium:            0           │  ← Difficulty
│   Hard:              0           │
│  ─────────────────────────────  │
│   Global Rank #999,999          │  ← Separator
│  ─────────────────────────────  │
│   [View Progress] [Submissions] │  ← Actions
└─────────────────────────────────┘
```

### **Second Place Card (#2 - Silver)**

```
┌─────────────────────────────────┐
│ ╔═══════════════════════════╗  │
│ ║  SILVER GRADIENT HEADER   ║  │  ← Gray-Silver gradient
│ ║   (Gray 300 → 500)        ║  │
│ ║                      [#2] ║  │  ← Gray badge
│ ║   ╭───────╮              ║  │
│ ║  │   B   │               ║  │  ← Avatar (overlaps)
│ ╚══╰═══════╯═══════════════╝  │
│                                  │
│   bharanisree_SV                 │
│   📍 India                       │
│                                  │
│   [Same stats layout...]         │
└─────────────────────────────────┘
```

### **Third Place Card (#3 - Bronze)**

```
┌─────────────────────────────────┐
│ ╔═══════════════════════════╗  │
│ ║  BRONZE GRADIENT HEADER   ║  │  ← Orange-Bronze gradient
│ ║   (Orange 400 → 600)      ║  │
│ ║                      [#3] ║  │  ← Orange badge
│ ║   ╭───────╮              ║  │
│ ║  │   M   │               ║  │  ← Avatar (overlaps)
│ ╚══╰═══════╯═══════════════╝  │
│                                  │
│   Mano3009                       │
│   📍 India                       │
│                                  │
│   [Same stats layout...]         │
└─────────────────────────────────┘
```

---

## Color Breakdown

### **Rank #1 - Gold Theme**
```
Header Background:
  from-yellow-400 (#FBBF24) 
  to-yellow-600   (#CA8A04)

Badge:
  bg-yellow-500 (#EAB308)
  border-white
  
Stats Cards:
  from-yellow-50  (#FEFCE8)
  to-yellow-100   (#FEF9C3)
  border-yellow-200
  text-yellow-900

Visual: 🥇 Gold Medal
```

### **Rank #2 - Silver Theme**
```
Header Background:
  from-gray-300 (#D1D5DB)
  to-gray-500   (#6B7280)

Badge:
  bg-gray-400 (#9CA3AF)
  border-white

Stats Cards:
  from-yellow-50  (#FEFCE8)
  to-yellow-100   (#FEF9C3)
  border-yellow-200
  text-yellow-900

Visual: 🥈 Silver Medal
```

### **Rank #3 - Bronze Theme**
```
Header Background:
  from-orange-400 (#FB923C)
  to-orange-600   (#EA580C)

Badge:
  bg-orange-500 (#F97316)
  border-white

Stats Cards:
  from-yellow-50  (#FEFCE8)
  to-yellow-100   (#FEF9C3)
  border-yellow-200
  text-yellow-900

Visual: 🥉 Bronze Medal
```

---

## Component Dimensions

### **Card**
```css
Width: Full (responsive)
Border: 2px solid gray-100
Border Radius: rounded-2xl (16px)
Shadow: shadow-xl
Hover Shadow: shadow-2xl
```

### **Header**
```css
Height: h-32 (128px)
Position: relative
Background: Gradient (rank-based)
```

### **Rank Badge**
```css
Size: w-12 h-12 (48px × 48px)
Position: absolute right-4 top-4
Border: 3px white
Font: text-lg font-bold
Shadow: shadow-lg
```

### **Avatar Circle**
```css
Size: w-24 h-24 (96px × 96px)
Position: absolute -bottom-12 left-6
Border: 4px white
Background: from-orange-500 to-orange-700
Font: text-4xl font-bold
Shadow: shadow-xl
```

### **Stats Cards**
```css
Grid: grid-cols-2 gap-3
Padding: p-4
Border Radius: rounded-xl
Font Size: text-3xl (value), text-xs (label)
```

### **Action Buttons**
```css
Grid: grid-cols-2 gap-2
Padding: py-3
Border Radius: rounded-lg
Font: text-sm font-semibold
```

---

## Spacing & Padding

```
Card:
  px-6 (horizontal padding)
  pt-16 (top padding after header)
  pb-4, pb-6 (bottom padding)

Header:
  h-32 (height)
  
Avatar Overlap:
  -bottom-12 (overlaps header by 48px)
  
Stats Section:
  gap-3 (12px gap between cards)
  
Difficulty Section:
  space-y-2 (8px between rows)
```

---

## Typography

### **Headings**
```css
Username: text-xl font-bold text-gray-900
Location: text-sm text-gray-500
Section Title: text-3xl font-bold text-gray-800
Subtitle: text-gray-600
```

### **Stats**
```css
Values: text-3xl font-bold text-yellow-900
Labels: text-xs font-semibold text-yellow-700
```

### **Difficulty**
```css
Labels: text-sm font-semibold
Values: text-lg font-bold
Easy: green-600/700
Medium: orange-600/700
Hard: red-600/700
```

### **Buttons**
```css
text-sm font-semibold text-white
```

---

## Hover Effects

### **Card**
```css
hover:shadow-2xl         /* Deeper shadow */
transition-all           /* Smooth transition */
duration-300             /* 300ms */
```

### **Buttons**
```css
View Progress:
  hover:bg-green-600
  hover:shadow-md

Submissions:
  hover:bg-indigo-600
  hover:shadow-md
```

---

## Responsive Breakpoints

### **Mobile** (< 1024px)
```
Layout: Single column
Cards: Stack vertically
Full width cards
Gap: 6 (24px)
```

### **Desktop** (≥ 1024px)
```
Layout: 3 columns (lg:grid-cols-3)
Cards: Side by side
Equal width distribution
Gap: 6 (24px)
```

---

## Animation & Transitions

### **Card Entry**
```css
transition-all duration-300
/* Smooth appearance */
```

### **Hover State**
```css
hover:shadow-2xl
/* Shadow grows on hover */
```

### **Button Hover**
```css
transition-all
hover:bg-[darker-shade]
hover:shadow-md
/* Color darkens, shadow appears */
```

---

## Accessibility Features

### **Contrast**
- White text on colored backgrounds
- Dark text on light backgrounds
- Minimum 4.5:1 ratio

### **Focus States**
- All interactive elements focusable
- Clear focus indicators

### **Semantic HTML**
- Proper heading hierarchy
- Links vs buttons distinction

---

## Icon Usage

### **Location**
```tsx
<svg className="w-4 h-4">
  <path d="..." /> {/* Map pin icon */}
</svg>
```

### **Trophy** (In header)
```tsx
🏆 Top Performers
```

---

## Z-Index Layers

```
Layer 1: Card background (z-0)
Layer 2: Header gradient (z-0)
Layer 3: Rank badge (z-10 implied)
Layer 4: Avatar circle (z-10 implied, overlaps header)
Layer 5: Content (z-0)
```

---

## Grid Layout Math

### **3-Column Layout**
```
Total Width: 1200px (max-w-[1200px])
Gap: 24px × 2 = 48px
Card Width: (1200 - 48) / 3 = 384px per card
```

### **Mobile Layout**
```
Total Width: 100% - 32px padding
Card Width: 100%
```

---

## Special Effects

### **Gradient Headers**
```css
bg-gradient-to-br    /* Diagonal gradient */
from-[color]-400     /* Light shade */
to-[color]-600       /* Dark shade */
```

### **Avatar Border**
```css
border-4 border-white
/* Creates "cut out" effect */
```

### **Shadow Depth**
```css
shadow-xl       /* Card default */
shadow-2xl      /* Card hover */
shadow-lg       /* Badge & avatar */
```

---

## Complete Card Code Structure

```tsx
<div className="rounded-2xl bg-white shadow-xl hover:shadow-2xl">
  
  {/* Header with gradient */}
  <div className="relative h-32 bg-gradient-to-br from-yellow-400 to-yellow-600">
    
    {/* Rank badge */}
    <div className="absolute right-4 top-4">
      <div className="w-12 h-12 rounded-full bg-yellow-500 border-white">
        #1
      </div>
    </div>
    
    {/* Avatar (overlaps header) */}
    <div className="absolute -bottom-12 left-6">
      <div className="w-24 h-24 rounded-full border-4 border-white">
        S
      </div>
    </div>
  </div>
  
  {/* User info (extra padding for avatar) */}
  <div className="px-6 pt-16 pb-4">
    <h3>Username</h3>
    <p>📍 Location</p>
  </div>
  
  {/* Stats, Difficulty, Rank, Buttons... */}
  
</div>
```

---

**Design**: Medal-Inspired Leaderboard  
**Ranks**: Gold, Silver, Bronze  
**Cards**: 3 Maximum  
**Style**: Modern, Professional, Competitive
