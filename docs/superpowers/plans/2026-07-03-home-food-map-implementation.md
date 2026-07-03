# Home Food Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a trial web version of "家里还有啥": a mobile-first household food location map with family sharing, expiry reminders, voice-assisted entry, photo date recognition, and one-tap inventory actions.

**Architecture:** Create a new full-stack web project at `D:\Learning\home-food-map`. Use Next.js for the trial web app, Prisma with SQLite for local development storage, server actions for mutation/query boundaries, and focused domain modules so the same business logic can later be reused by a WeChat mini-program API layer. Voice and photo recognition stay behind adapters and always feed a confirmation screen before inventory is saved.

**Tech Stack:** Next.js + React + TypeScript, Tailwind CSS, Prisma, SQLite, Vitest, React Testing Library, Playwright, browser `SpeechRecognition` where available, `tesseract.js` for client-side OCR, Canvas API for cabinet sketch covers.

## Global Constraints

- Project code must be created under `D:\Learning\home-food-map`.
- Product shape is a trial web page first, then possible WeChat mini-program; do not build a native App.
- Mobile-first UI with large text, large buttons, and short flows.
- Cabinet/location map only helps define and recognize storage locations; it must not auto-detect where an item belongs.
- Every food item must have an explicit storage location before it becomes active inventory.
- Every active food item must have an expiry date before it becomes active inventory.
- AI/OCR/voice recognition output must always enter a user confirmation screen before saving.
- First version uses in-app reminders only; WeChat subscription messages are out of scope.
- First version excludes receipt batch recognition, multi-product photo splitting, recipes, shopping lists, price statistics, nutrition analysis, native apps, and complex permission management.

---

## File Structure

Create the project at `D:\Learning\home-food-map`.

Core files and responsibilities:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `vitest.config.ts`: unit and component test configuration.
- `playwright.config.ts`: end-to-end test configuration.
- `prisma/schema.prisma`: database schema for families, members, locations, foods, operations, and reminders.
- `src/app/layout.tsx`: root layout and global metadata.
- `src/app/page.tsx`: redirect or render the default family dashboard.
- `src/app/f/[familyId]/page.tsx`: expiry dashboard.
- `src/app/f/[familyId]/locations/page.tsx`: location map.
- `src/app/f/[familyId]/locations/[locationId]/page.tsx`: location detail inventory.
- `src/app/f/[familyId]/add/page.tsx`: add food entry hub and confirmation flow.
- `src/app/f/[familyId]/records/page.tsx`: operation records.
- `src/app/f/[familyId]/family/page.tsx`: family members and invite entry.
- `src/app/api/upload/route.ts`: image upload endpoint for trial web.
- `src/components/navigation/BottomNav.tsx`: mobile navigation.
- `src/components/food/FoodCard.tsx`: food display and one-tap actions.
- `src/components/location/LocationCard.tsx`: cabinet/location card.
- `src/components/add/AddFoodConfirmForm.tsx`: shared confirmation form.
- `src/components/add/VoiceEntryPanel.tsx`: voice entry UI.
- `src/components/add/DatePhotoPanel.tsx`: photo date OCR UI.
- `src/components/add/ManualEntryPanel.tsx`: manual entry UI.
- `src/lib/db.ts`: Prisma client singleton.
- `src/lib/domain/types.ts`: shared TypeScript domain types.
- `src/lib/domain/expiry.ts`: expiry grouping and reminder rules.
- `src/lib/domain/voiceParser.ts`: Chinese voice text parsing.
- `src/lib/domain/dateParser.ts`: Chinese package date parsing and expiry calculation.
- `src/lib/domain/inventory.ts`: inventory state transitions.
- `src/lib/server/families.ts`: family/member server actions.
- `src/lib/server/locations.ts`: location server actions.
- `src/lib/server/foods.ts`: food server actions.
- `src/lib/server/operations.ts`: operation record server actions.
- `src/lib/adapters/speech.ts`: browser speech adapter.
- `src/lib/adapters/ocr.ts`: OCR adapter wrapping `tesseract.js`.
- `src/lib/adapters/sketchCover.ts`: photo-to-sketch cover generation with Canvas.
- `src/styles/globals.css`: global styles and mobile-first tokens.
- `tests/unit/expiry.test.ts`: reminder grouping tests.
- `tests/unit/voiceParser.test.ts`: voice parser tests.
- `tests/unit/dateParser.test.ts`: date parser tests.
- `tests/unit/inventory.test.ts`: action transition tests.
- `tests/e2e/mvp.spec.ts`: happy path for family, location, food, expiry, and operations.

---

### Task 1: Scaffold Trial Web Project

**Files:**
- Create: `D:\Learning\home-food-map\package.json`
- Create: `D:\Learning\home-food-map\next.config.ts`
- Create: `D:\Learning\home-food-map\tsconfig.json`
- Create: `D:\Learning\home-food-map\vitest.config.ts`
- Create: `D:\Learning\home-food-map\playwright.config.ts`
- Create: `D:\Learning\home-food-map\src\app\layout.tsx`
- Create: `D:\Learning\home-food-map\src\app\page.tsx`
- Create: `D:\Learning\home-food-map\src\styles\globals.css`

**Interfaces:**
- Produces: a runnable Next.js app with `npm run dev`, `npm run test`, `npm run test:e2e`, `npm run lint`, and `npm run build`.

- [ ] **Step 1: Create the project directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'D:\Learning\home-food-map'
Set-Location 'D:\Learning\home-food-map'
```

Expected: `D:\Learning\home-food-map` exists and is empty or contains only files from this project.

- [ ] **Step 2: Initialize Next.js**

Run:

```powershell
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Next.js project files are created under `D:\Learning\home-food-map`.

- [ ] **Step 3: Install required runtime and test dependencies**

Run:

```powershell
npm install @prisma/client prisma tesseract.js zod lucide-react clsx date-fns
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom playwright tsx
npx playwright install chromium
```

Expected: dependencies are added to `package.json` and install completes without errors.

- [ ] **Step 4: Replace `package.json` scripts**

Set `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

Keep all dependency versions that npm installed.

- [ ] **Step 5: Add Vitest config**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
```

- [ ] **Step 7: Add mobile-first root layout**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "家里还有啥",
  description: "家庭位置地图与食物到期提醒",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/f/demo");
}
```

- [ ] **Step 8: Add global mobile styles**

Create `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  --page: #f8faf8;
  --ink: #17211b;
  --muted: #66746b;
  --line: #dce5dd;
  --danger: #c43b3b;
  --warning: #b7791f;
  --ok: #2f7d46;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--page);
  color: var(--ink);
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

- [ ] **Step 9: Verify scaffold**

Run:

```powershell
npm run test
npm run build
```

Expected: both commands complete successfully.

- [ ] **Step 10: Commit**

Run:

```powershell
git add package.json package-lock.json next.config.ts tsconfig.json vitest.config.ts playwright.config.ts src tests
git commit -m "chore: scaffold home food map web app"
```

Expected: commit succeeds.

---

### Task 2: Domain Types, Expiry Rules, Voice Parsing, and Inventory Transitions

**Files:**
- Create: `D:\Learning\home-food-map\src\lib\domain\types.ts`
- Create: `D:\Learning\home-food-map\src\lib\domain\expiry.ts`
- Create: `D:\Learning\home-food-map\src\lib\domain\voiceParser.ts`
- Create: `D:\Learning\home-food-map\src\lib\domain\dateParser.ts`
- Create: `D:\Learning\home-food-map\src\lib\domain\inventory.ts`
- Create: `D:\Learning\home-food-map\tests\unit\expiry.test.ts`
- Create: `D:\Learning\home-food-map\tests\unit\voiceParser.test.ts`
- Create: `D:\Learning\home-food-map\tests\unit\dateParser.test.ts`
- Create: `D:\Learning\home-food-map\tests\unit\inventory.test.ts`

**Interfaces:**
- Produces: `groupExpiry(items, today)`, `parseVoiceEntry(text, knownLocations, baseDate)`, `parsePackageDate(text, baseDate)`, `applyInventoryAction(food, action)`.
- Consumes: no database or UI.

- [ ] **Step 1: Write failing expiry tests**

Create `tests/unit/expiry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { groupExpiry } from "@/lib/domain/expiry";

describe("groupExpiry", () => {
  it("groups active foods by urgency and ignores resolved foods", () => {
    const grouped = groupExpiry(
      [
        { id: "a", name: "牛奶", expiresAt: "2026-07-03", status: "active", locationId: "l1", quantity: 1, unit: "盒" },
        { id: "b", name: "蛋黄派", expiresAt: "2026-07-06", status: "active", locationId: "l2", quantity: 3, unit: "包" },
        { id: "c", name: "坚果", expiresAt: "2026-08-01", status: "active", locationId: "l2", quantity: 1, unit: "袋" },
        { id: "d", name: "饼干", expiresAt: "2026-07-01", status: "discarded", locationId: "l3", quantity: 1, unit: "盒" },
      ],
      new Date("2026-07-03T00:00:00+08:00"),
    );

    expect(grouped.today.map((item) => item.name)).toEqual(["牛奶"]);
    expect(grouped.within3Days.map((item) => item.name)).toEqual(["蛋黄派"]);
    expect(grouped.within30Days.map((item) => item.name)).toEqual(["坚果"]);
    expect(grouped.expired).toEqual([]);
  });
});
```

Run:

```powershell
npm run test -- tests/unit/expiry.test.ts
```

Expected: FAIL because `@/lib/domain/expiry` does not exist.

- [ ] **Step 2: Implement shared types and expiry rules**

Create `src/lib/domain/types.ts`:

```ts
export type FoodStatus = "active" | "taken" | "finished" | "discarded";

export type FoodSummary = {
  id: string;
  name: string;
  expiresAt: string;
  status: FoodStatus;
  locationId: string;
  quantity: number;
  unit: string;
};
```

Create `src/lib/domain/expiry.ts`:

```ts
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { FoodSummary } from "./types";

export type ExpiryGroups = {
  expired: FoodSummary[];
  today: FoodSummary[];
  within3Days: FoodSummary[];
  within7Days: FoodSummary[];
  within30Days: FoodSummary[];
  later: FoodSummary[];
};

export function daysUntilExpiry(expiresAt: string, today: Date): number {
  return differenceInCalendarDays(parseISO(expiresAt), today);
}

export function groupExpiry(items: FoodSummary[], today: Date): ExpiryGroups {
  const groups: ExpiryGroups = {
    expired: [],
    today: [],
    within3Days: [],
    within7Days: [],
    within30Days: [],
    later: [],
  };

  for (const item of items) {
    if (item.status !== "active") continue;
    const days = daysUntilExpiry(item.expiresAt, today);
    if (days < 0) groups.expired.push(item);
    else if (days === 0) groups.today.push(item);
    else if (days <= 3) groups.within3Days.push(item);
    else if (days <= 7) groups.within7Days.push(item);
    else if (days <= 30) groups.within30Days.push(item);
    else groups.later.push(item);
  }

  return groups;
}
```

- [ ] **Step 3: Run expiry tests**

Run:

```powershell
npm run test -- tests/unit/expiry.test.ts
```

Expected: PASS.

- [ ] **Step 4: Write failing parser and transition tests**

Create `tests/unit/voiceParser.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseVoiceEntry } from "@/lib/domain/voiceParser";

describe("parseVoiceEntry", () => {
  it("extracts location, quantity, unit, name, and date from Chinese voice text", () => {
    const parsed = parseVoiceEntry("零食柜有三包蛋黄派，8月20号到期", ["零食柜", "阳台囤货箱"], new Date("2026-07-03"));
    expect(parsed).toEqual({
      name: "蛋黄派",
      quantity: 3,
      unit: "包",
      locationName: "零食柜",
      expiresAt: "2026-08-20",
      missing: [],
    });
  });
});
```

Create `tests/unit/dateParser.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parsePackageDate } from "@/lib/domain/dateParser";

describe("parsePackageDate", () => {
  it("uses explicit expiry date when present", () => {
    expect(parsePackageDate("有效期至2026年8月20日", new Date("2026-07-03"))).toEqual({
      expiresAt: "2026-08-20",
      confidence: "high",
      source: "explicit-expiry",
    });
  });

  it("calculates expiry from production date and shelf life in months", () => {
    expect(parsePackageDate("生产日期2026年1月1日 保质期12个月", new Date("2026-07-03"))).toEqual({
      expiresAt: "2027-01-01",
      confidence: "medium",
      source: "production-plus-shelf-life",
    });
  });
});
```

Create `tests/unit/inventory.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { applyInventoryAction } from "@/lib/domain/inventory";

describe("applyInventoryAction", () => {
  it("reduces quantity when an item is taken", () => {
    const result = applyInventoryAction(
      { id: "f1", name: "蛋黄派", quantity: 3, unit: "包", status: "active" },
      { type: "take", quantity: 1 },
    );
    expect(result).toMatchObject({ quantity: 2, status: "active" });
  });

  it("marks item as finished when finishing all quantity", () => {
    const result = applyInventoryAction(
      { id: "f1", name: "牛奶", quantity: 1, unit: "箱", status: "active" },
      { type: "finish" },
    );
    expect(result).toMatchObject({ quantity: 0, status: "finished" });
  });
});
```

Run:

```powershell
npm run test -- tests/unit/voiceParser.test.ts tests/unit/dateParser.test.ts tests/unit/inventory.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 5: Implement parsers and inventory transitions**

Create `src/lib/domain/voiceParser.ts`:

```ts
import { format } from "date-fns";

const chineseNumbers: Record<string, number> = { 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

export type ParsedVoiceEntry = {
  name: string;
  quantity: number;
  unit: string;
  locationName: string;
  expiresAt: string;
  missing: Array<"name" | "quantity" | "location" | "expiresAt">;
};

export function parseVoiceEntry(text: string, knownLocations: string[], baseDate: Date): ParsedVoiceEntry {
  const locationName = knownLocations.find((location) => text.includes(location)) ?? "";
  const quantityMatch = text.match(/([一两二三四五六七八九十\d]+)\s*(包|袋|盒|箱|瓶|罐|个|斤)/);
  const dateMatch = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*(号|日)?/);
  const quantityText = quantityMatch?.[1] ?? "";
  const quantity = /^\d+$/.test(quantityText) ? Number(quantityText) : chineseNumbers[quantityText] ?? 1;
  const unit = quantityMatch?.[2] ?? "件";
  const expiresAt = dateMatch
    ? format(new Date(baseDate.getFullYear(), Number(dateMatch[1]) - 1, Number(dateMatch[2])), "yyyy-MM-dd")
    : "";
  const afterQuantity = quantityMatch ? text.slice((quantityMatch.index ?? 0) + quantityMatch[0].length) : text;
  const name = afterQuantity.replace(/[,，。.\s]/g, "").replace(/到期.*$/, "").replace(/前吃完.*$/, "") || "";

  const missing: ParsedVoiceEntry["missing"] = [];
  if (!name) missing.push("name");
  if (!quantity) missing.push("quantity");
  if (!locationName) missing.push("location");
  if (!expiresAt) missing.push("expiresAt");

  return { name, quantity, unit, locationName, expiresAt, missing };
}
```

Create `src/lib/domain/dateParser.ts`:

```ts
import { addMonths, format } from "date-fns";

export type ParsedPackageDate = {
  expiresAt: string;
  confidence: "high" | "medium" | "low";
  source: "explicit-expiry" | "production-plus-shelf-life" | "unknown";
};

function readChineseDate(text: string): Date | null {
  const match = text.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*(日|号)?/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function parsePackageDate(text: string, baseDate: Date): ParsedPackageDate {
  const normalized = text.replace(/\s+/g, "");
  if (/有效期至|保质期至|到期日/.test(normalized)) {
    const date = readChineseDate(normalized);
    if (date) return { expiresAt: format(date, "yyyy-MM-dd"), confidence: "high", source: "explicit-expiry" };
  }

  const productionDate = readChineseDate(normalized);
  const months = normalized.match(/保质期(\d{1,2})个月/);
  if (productionDate && months) {
    return {
      expiresAt: format(addMonths(productionDate, Number(months[1])), "yyyy-MM-dd"),
      confidence: "medium",
      source: "production-plus-shelf-life",
    };
  }

  return { expiresAt: format(baseDate, "yyyy-MM-dd"), confidence: "low", source: "unknown" };
}
```

Create `src/lib/domain/inventory.ts`:

```ts
export type InventoryFood = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: "active" | "taken" | "finished" | "discarded";
};

export type InventoryAction =
  | { type: "take"; quantity: number }
  | { type: "finish" }
  | { type: "discard" };

export function applyInventoryAction(food: InventoryFood, action: InventoryAction): InventoryFood {
  if (action.type === "take") {
    const nextQuantity = Math.max(0, food.quantity - action.quantity);
    return { ...food, quantity: nextQuantity, status: nextQuantity === 0 ? "taken" : "active" };
  }

  if (action.type === "finish") {
    return { ...food, quantity: 0, status: "finished" };
  }

  return { ...food, quantity: 0, status: "discarded" };
}
```

- [ ] **Step 6: Run all domain tests**

Run:

```powershell
npm run test -- tests/unit
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```powershell
git add src/lib/domain tests/unit
git commit -m "feat: add food inventory domain rules"
```

Expected: commit succeeds.

---

### Task 3: Database Schema, Seed Data, and Server Actions

**Files:**
- Create: `D:\Learning\home-food-map\prisma\schema.prisma`
- Create: `D:\Learning\home-food-map\prisma\seed.ts`
- Create: `D:\Learning\home-food-map\src\lib\db.ts`
- Create: `D:\Learning\home-food-map\src\lib\server\families.ts`
- Create: `D:\Learning\home-food-map\src\lib\server\locations.ts`
- Create: `D:\Learning\home-food-map\src\lib\server\foods.ts`
- Create: `D:\Learning\home-food-map\src\lib\server\operations.ts`

**Interfaces:**
- Consumes: domain status names from Task 2.
- Produces: `getDemoFamily()`, `listLocations(familyId)`, `createLocation(input)`, `listFoods(familyId, filters)`, `createFood(input)`, `performFoodAction(input)`, `listOperations(familyId)`.

- [ ] **Step 1: Define Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Family {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  members   Member[]
  locations Location[]
  foods     Food[]
}

model Member {
  id        String   @id @default(cuid())
  familyId  String
  nickname  String
  role      String   @default("member")
  avatarUrl String?
  createdAt DateTime @default(now())
  family    Family   @relation(fields: [familyId], references: [id])
}

model Location {
  id             String   @id @default(cuid())
  familyId       String
  name           String
  photoUrl       String?
  sketchCoverUrl String?
  tags           String   @default("[]")
  note           String?
  isFrequent     Boolean  @default(false)
  sortOrder      Int      @default(0)
  createdById    String?
  createdAt      DateTime @default(now())
  family         Family   @relation(fields: [familyId], references: [id])
  foods          Food[]
}

model Food {
  id             String    @id @default(cuid())
  familyId       String
  locationId     String
  name           String
  quantity       Float     @default(1)
  unit           String    @default("件")
  expiresAt      DateTime
  datePhotoUrl   String?
  status         String    @default("active")
  source         String    @default("manual")
  note           String?
  createdById    String?
  lastActorId    String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  family         Family    @relation(fields: [familyId], references: [id])
  location       Location  @relation(fields: [locationId], references: [id])
  operations     Operation[]
}

model Operation {
  id        String   @id @default(cuid())
  familyId  String
  foodId    String?
  actorId   String?
  type      String
  before    String?
  after     String?
  createdAt DateTime @default(now())
  food      Food?    @relation(fields: [foodId], references: [id])
}
```

- [ ] **Step 2: Add environment file**

Create `.env`:

```env
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 3: Add Prisma client singleton**

Create `src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Add seed data**

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const family = await prisma.family.upsert({
    where: { id: "demo" },
    update: {},
    create: { id: "demo", name: "我们家" },
  });

  const member = await prisma.member.create({
    data: { familyId: family.id, nickname: "妈妈", role: "admin" },
  });

  const snackCabinet = await prisma.location.create({
    data: {
      familyId: family.id,
      name: "妈妈零食柜",
      tags: JSON.stringify(["常温", "零食"]),
      isFrequent: true,
      sortOrder: 1,
      createdById: member.id,
    },
  });

  await prisma.food.create({
    data: {
      familyId: family.id,
      locationId: snackCabinet.id,
      name: "蛋黄派",
      quantity: 3,
      unit: "包",
      expiresAt: new Date("2026-08-20"),
      source: "manual",
      createdById: member.id,
      lastActorId: member.id,
    },
  });
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Step 5: Implement server actions**

Create `src/lib/server/families.ts`:

```ts
"use server";

import { db } from "@/lib/db";

export async function getDemoFamily() {
  return db.family.findUniqueOrThrow({
    where: { id: "demo" },
    include: { members: true },
  });
}
```

Create `src/lib/server/locations.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type CreateLocationInput = {
  familyId: string;
  name: string;
  photoUrl?: string;
  sketchCoverUrl?: string;
  tags: string[];
};

export async function listLocations(familyId: string) {
  return db.location.findMany({
    where: { familyId },
    include: { foods: { where: { status: "active" }, orderBy: { expiresAt: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createLocation(input: CreateLocationInput) {
  const location = await db.location.create({
    data: {
      familyId: input.familyId,
      name: input.name,
      photoUrl: input.photoUrl,
      sketchCoverUrl: input.sketchCoverUrl,
      tags: JSON.stringify(input.tags),
    },
  });
  revalidatePath(`/f/${input.familyId}/locations`);
  return location;
}
```

Create `src/lib/server/foods.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { applyInventoryAction } from "@/lib/domain/inventory";

export type CreateFoodInput = {
  familyId: string;
  locationId: string;
  name: string;
  quantity: number;
  unit: string;
  expiresAt: string;
  datePhotoUrl?: string;
  source: "manual" | "voice" | "date-photo";
};

export async function listFoods(familyId: string, filters?: { locationId?: string; status?: string }) {
  return db.food.findMany({
    where: {
      familyId,
      locationId: filters?.locationId,
      status: filters?.status ?? "active",
    },
    include: { location: true },
    orderBy: { expiresAt: "asc" },
  });
}

export async function createFood(input: CreateFoodInput) {
  if (!input.locationId) throw new Error("必须选择存放位置");
  if (!input.expiresAt) throw new Error("必须填写到期日");

  const food = await db.food.create({
    data: {
      familyId: input.familyId,
      locationId: input.locationId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      expiresAt: new Date(input.expiresAt),
      datePhotoUrl: input.datePhotoUrl,
      source: input.source,
    },
  });
  await db.operation.create({
    data: { familyId: input.familyId, foodId: food.id, type: "create", after: JSON.stringify(food) },
  });
  revalidatePath(`/f/${input.familyId}`);
  return food;
}

export async function performFoodAction(input: { familyId: string; foodId: string; type: "take" | "finish" | "discard"; quantity?: number }) {
  const food = await db.food.findUniqueOrThrow({ where: { id: input.foodId } });
  const next = applyInventoryAction(
    { id: food.id, name: food.name, quantity: food.quantity, unit: food.unit, status: food.status as "active" },
    input.type === "take" ? { type: "take", quantity: input.quantity ?? 1 } : { type: input.type },
  );
  const updated = await db.food.update({
    where: { id: food.id },
    data: { quantity: next.quantity, status: next.status },
  });
  await db.operation.create({
    data: {
      familyId: input.familyId,
      foodId: food.id,
      type: input.type,
      before: JSON.stringify(food),
      after: JSON.stringify(updated),
    },
  });
  revalidatePath(`/f/${input.familyId}`);
  return updated;
}
```

Create `src/lib/server/operations.ts`:

```ts
"use server";

import { db } from "@/lib/db";

export async function listOperations(familyId: string) {
  return db.operation.findMany({
    where: { familyId },
    include: { food: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
```

- [ ] **Step 6: Run migration and seed**

Run:

```powershell
npx prisma migrate dev --name init
npx prisma db seed
```

Expected: SQLite database is created and demo family data exists.

- [ ] **Step 7: Verify build**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```powershell
git add prisma .env src/lib/db.ts src/lib/server
git commit -m "feat: add household inventory data model"
```

Expected: commit succeeds.

---

### Task 4: Mobile Navigation, Dashboard, Location Map, and Food Cards

**Files:**
- Create: `D:\Learning\home-food-map\src\components\navigation\BottomNav.tsx`
- Create: `D:\Learning\home-food-map\src\components\food\FoodCard.tsx`
- Create: `D:\Learning\home-food-map\src\components\location\LocationCard.tsx`
- Create: `D:\Learning\home-food-map\src\app\f\[familyId]\page.tsx`
- Create: `D:\Learning\home-food-map\src\app\f\[familyId]\locations\page.tsx`
- Create: `D:\Learning\home-food-map\src\app\f\[familyId]\locations\[locationId]\page.tsx`

**Interfaces:**
- Consumes: `listFoods`, `listLocations`, `groupExpiry`, `performFoodAction`.
- Produces: mobile UI for default quick-expiry page and location map.

- [ ] **Step 1: Create reusable navigation**

Create `src/components/navigation/BottomNav.tsx`:

```tsx
import Link from "next/link";
import { Home, Map, PlusCircle, ScrollText, Users } from "lucide-react";

const items = [
  { label: "快到期", href: "", icon: Home },
  { label: "位置", href: "/locations", icon: Map },
  { label: "添加", href: "/add", icon: PlusCircle },
  { label: "记录", href: "/records", icon: ScrollText },
  { label: "家庭", href: "/family", icon: Users },
];

export function BottomNav({ familyId }: { familyId: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-slate-200 bg-white">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.label} href={`/f/${familyId}${item.href}`} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-slate-700">
            <Icon aria-hidden className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Create food card with one-tap action forms**

Create `src/components/food/FoodCard.tsx`:

```tsx
import { format } from "date-fns";
import { PackageCheck, Trash2, Utensils } from "lucide-react";
import { performFoodAction } from "@/lib/server/foods";

type FoodCardProps = {
  familyId: string;
  food: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiresAt: Date;
    location: { name: string };
  };
};

export function FoodCard({ familyId, food }: FoodCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{food.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{food.quantity}{food.unit} · {food.location.name}</p>
          <p className="mt-1 text-sm text-slate-600">到期：{format(food.expiresAt, "yyyy-MM-dd")}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <form action={async () => { "use server"; await performFoodAction({ familyId, foodId: food.id, type: "take", quantity: 1 }); }}>
          <button className="flex min-h-12 w-full items-center justify-center gap-1 rounded-md bg-emerald-50 text-sm font-semibold text-emerald-800">
            <PackageCheck className="h-4 w-4" /> 我拿了
          </button>
        </form>
        <form action={async () => { "use server"; await performFoodAction({ familyId, foodId: food.id, type: "finish" }); }}>
          <button className="flex min-h-12 w-full items-center justify-center gap-1 rounded-md bg-blue-50 text-sm font-semibold text-blue-800">
            <Utensils className="h-4 w-4" /> 吃完了
          </button>
        </form>
        <form action={async () => { "use server"; await performFoodAction({ familyId, foodId: food.id, type: "discard" }); }}>
          <button className="flex min-h-12 w-full items-center justify-center gap-1 rounded-md bg-rose-50 text-sm font-semibold text-rose-800">
            <Trash2 className="h-4 w-4" /> 丢弃
          </button>
        </form>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Create location card**

Create `src/components/location/LocationCard.tsx`:

```tsx
import Link from "next/link";

type LocationCardProps = {
  familyId: string;
  location: {
    id: string;
    name: string;
    sketchCoverUrl: string | null;
    photoUrl: string | null;
    foods: Array<{ name: string; expiresAt: Date }>;
  };
};

export function LocationCard({ familyId, location }: LocationCardProps) {
  const cover = location.sketchCoverUrl || location.photoUrl;
  const nextFood = location.foods[0];

  return (
    <Link href={`/f/${familyId}/locations/${location.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
        {cover ? <img src={cover} alt={location.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-500">未拍照</div>}
      </div>
      <h3 className="mt-3 text-lg font-bold">{location.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{location.foods.length} 件在库</p>
      <p className="mt-1 text-sm text-slate-600">最近到期：{nextFood ? nextFood.name : "暂无"}</p>
    </Link>
  );
}
```

- [ ] **Step 4: Implement pages**

Create dashboard and location pages using server actions:

```tsx
// src/app/f/[familyId]/page.tsx
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { groupExpiry } from "@/lib/domain/expiry";
import { listFoods } from "@/lib/server/foods";

export default async function FamilyDashboard({ params }: { params: { familyId: string } }) {
  const foods = await listFoods(params.familyId);
  const groups = groupExpiry(
    foods.map((food) => ({ ...food, expiresAt: food.expiresAt.toISOString().slice(0, 10), status: food.status as "active" })),
    new Date(),
  );
  const urgentIds = new Set([...groups.expired, ...groups.today, ...groups.within3Days, ...groups.within7Days, ...groups.within30Days].map((food) => food.id));
  const urgentFoods = foods.filter((food) => urgentIds.has(food.id));

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">快到期</h1>
      <p className="mt-1 text-slate-600">先处理最容易忘的东西</p>
      <section className="mt-5 space-y-3">
        {urgentFoods.map((food) => <FoodCard key={food.id} familyId={params.familyId} food={food} />)}
        {urgentFoods.length === 0 ? <p className="rounded-lg bg-white p-4 text-slate-600">目前没有 30 天内到期的食物。</p> : null}
      </section>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

Create `src/app/f/[familyId]/locations/page.tsx`:

```tsx
import Link from "next/link";
import { BottomNav } from "@/components/navigation/BottomNav";
import { LocationCard } from "@/components/location/LocationCard";
import { listLocations } from "@/lib/server/locations";

export default async function LocationsPage({ params }: { params: { familyId: string } }) {
  const locations = await listLocations(params.familyId);

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">位置地图</h1>
          <p className="mt-1 text-slate-600">按柜子、箱子和抽屉看库存</p>
        </div>
        <Link href={`/f/${params.familyId}/locations/new`} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white">
          添加
        </Link>
      </div>
      <section className="mt-5 grid gap-3">
        {locations.map((location) => <LocationCard key={location.id} familyId={params.familyId} location={location} />)}
      </section>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

Create `src/app/f/[familyId]/locations/[locationId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { listFoods } from "@/lib/server/foods";
import { listLocations } from "@/lib/server/locations";

export default async function LocationDetailPage({ params }: { params: { familyId: string; locationId: string } }) {
  const [locations, foods] = await Promise.all([
    listLocations(params.familyId),
    listFoods(params.familyId, { locationId: params.locationId }),
  ]);
  const location = locations.find((item) => item.id === params.locationId);
  if (!location) notFound();

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">{location.name}</h1>
      <p className="mt-1 text-slate-600">默认按到期时间排序</p>
      <section className="mt-5 space-y-3">
        {foods.map((food) => <FoodCard key={food.id} familyId={params.familyId} food={food} />)}
        {foods.length === 0 ? <p className="rounded-lg bg-white p-4 text-slate-600">这个位置暂时没有在库食物。</p> : null}
      </section>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

- [ ] **Step 5: Verify pages**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```powershell
git add src/app/f src/components
git commit -m "feat: add expiry dashboard and location map"
```

Expected: commit succeeds.

---

### Task 5: Add Food Flows, Confirmation Form, Voice Entry, and Date Photo OCR

**Files:**
- Create: `D:\Learning\home-food-map\src\app\f\[familyId]\add\page.tsx`
- Create: `D:\Learning\home-food-map\src\components\add\AddFoodConfirmForm.tsx`
- Create: `D:\Learning\home-food-map\src\components\add\VoiceEntryPanel.tsx`
- Create: `D:\Learning\home-food-map\src\components\add\DatePhotoPanel.tsx`
- Create: `D:\Learning\home-food-map\src\components\add\ManualEntryPanel.tsx`
- Create: `D:\Learning\home-food-map\src\lib\adapters\speech.ts`
- Create: `D:\Learning\home-food-map\src\lib\adapters\ocr.ts`

**Interfaces:**
- Consumes: `parseVoiceEntry`, `parsePackageDate`, `createFood`, `listLocations`.
- Produces: add flow that never saves AI/OCR/voice output without confirmation.

- [ ] **Step 1: Create speech adapter**

Create `src/lib/adapters/speech.ts`:

```ts
export type SpeechResult = { transcript: string };

export function supportsSpeechRecognition() {
  return typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
}

export function listenOnce(): Promise<SpeechResult> {
  return new Promise((resolve, reject) => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      reject(new Error("当前浏览器不支持语音识别"));
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => resolve({ transcript: event.results[0][0].transcript });
    recognition.onerror = () => reject(new Error("语音识别失败，请手动输入"));
    recognition.start();
  });
}
```

- [ ] **Step 2: Create OCR adapter**

Create `src/lib/adapters/ocr.ts`:

```ts
import { createWorker } from "tesseract.js";

export async function recognizeDateText(file: File): Promise<string> {
  const worker = await createWorker("chi_sim+eng");
  try {
    const result = await worker.recognize(file);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}
```

- [ ] **Step 3: Create confirmation form**

Create `src/components/add/AddFoodConfirmForm.tsx` with controlled fields:

```tsx
"use client";

import { useState } from "react";
import { createFood } from "@/lib/server/foods";

export type ConfirmDraft = {
  name: string;
  quantity: number;
  unit: string;
  locationId: string;
  expiresAt: string;
  source: "manual" | "voice" | "date-photo";
};

export function AddFoodConfirmForm({ familyId, locations, draft }: { familyId: string; locations: Array<{ id: string; name: string }>; draft: ConfirmDraft }) {
  const [form, setForm] = useState(draft);
  const [message, setMessage] = useState("");

  async function save() {
    if (!form.name || !form.locationId || !form.expiresAt) {
      setMessage("名称、位置、到期日都要确认后才能保存");
      return;
    }
    await createFood({ familyId, ...form });
    setMessage("已保存");
  }

  return (
    <div className="space-y-3 rounded-lg bg-white p-4">
      <input className="min-h-12 w-full rounded-md border p-3" value={form.name} placeholder="食物名称" onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className="min-h-12 rounded-md border p-3" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} />
        <input className="min-h-12 rounded-md border p-3" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
      </div>
      <select className="min-h-12 w-full rounded-md border p-3" value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })}>
        <option value="">选择放在哪里</option>
        {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
      </select>
      <input className="min-h-12 w-full rounded-md border p-3" type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
      <button className="min-h-12 w-full rounded-md bg-emerald-700 font-bold text-white" onClick={save}>确认保存</button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
```

- [ ] **Step 4: Create voice, date photo, and manual panels**

Create `src/components/add/ManualEntryPanel.tsx`:

```tsx
// src/components/add/ManualEntryPanel.tsx
"use client";

import { AddFoodConfirmForm } from "./AddFoodConfirmForm";

export function ManualEntryPanel({ familyId, locations }: { familyId: string; locations: Array<{ id: string; name: string }> }) {
  return (
    <AddFoodConfirmForm
      familyId={familyId}
      locations={locations}
      draft={{ name: "", quantity: 1, unit: "件", locationId: "", expiresAt: "", source: "manual" }}
    />
  );
}
```

Create `src/components/add/VoiceEntryPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { parseVoiceEntry } from "@/lib/domain/voiceParser";
import { listenOnce, supportsSpeechRecognition } from "@/lib/adapters/speech";
import { AddFoodConfirmForm, type ConfirmDraft } from "./AddFoodConfirmForm";

export function VoiceEntryPanel({ familyId, locations }: { familyId: string; locations: Array<{ id: string; name: string }> }) {
  const [draft, setDraft] = useState<ConfirmDraft | null>(null);
  const [message, setMessage] = useState("");

  async function startVoice() {
    if (!supportsSpeechRecognition()) {
      setMessage("当前浏览器不支持语音识别，请使用手动添加");
      return;
    }
    try {
      const result = await listenOnce();
      const parsed = parseVoiceEntry(result.transcript, locations.map((location) => location.name), new Date());
      const matchedLocation = locations.find((location) => location.name === parsed.locationName);
      setDraft({
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        locationId: matchedLocation?.id ?? "",
        expiresAt: parsed.expiresAt,
        source: "voice",
      });
      setMessage(`识别到：${result.transcript}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "语音识别失败");
    }
  }

  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-lg font-bold">说一句添加</h2>
      <button className="mt-3 min-h-12 w-full rounded-md bg-emerald-700 font-bold text-white" onClick={startVoice}>
        开始说话
      </button>
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
      {draft ? <div className="mt-4"><AddFoodConfirmForm familyId={familyId} locations={locations} draft={draft} /></div> : null}
    </section>
  );
}
```

Create `src/components/add/DatePhotoPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { parsePackageDate } from "@/lib/domain/dateParser";
import { recognizeDateText } from "@/lib/adapters/ocr";
import { AddFoodConfirmForm, type ConfirmDraft } from "./AddFoodConfirmForm";

export function DatePhotoPanel({ familyId, locations }: { familyId: string; locations: Array<{ id: string; name: string }> }) {
  const [draft, setDraft] = useState<ConfirmDraft | null>(null);
  const [message, setMessage] = useState("");

  async function handleFile(file: File | null) {
    if (!file) return;
    setMessage("正在识别日期...");
    try {
      const text = await recognizeDateText(file);
      const parsed = parsePackageDate(text, new Date());
      setDraft({
        name: "",
        quantity: 1,
        unit: "件",
        locationId: "",
        expiresAt: parsed.expiresAt,
        source: "date-photo",
      });
      setMessage(parsed.confidence === "low" ? "日期不太确定，请仔细确认" : "已识别日期，请确认后保存");
    } catch {
      setMessage("识别失败，请手动选择到期日");
      setDraft({ name: "", quantity: 1, unit: "件", locationId: "", expiresAt: "", source: "date-photo" });
    }
  }

  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-lg font-bold">拍日期添加</h2>
      <input className="mt-3 block w-full text-sm" type="file" accept="image/*" capture="environment" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
      {draft ? <div className="mt-4"><AddFoodConfirmForm familyId={familyId} locations={locations} draft={draft} /></div> : null}
    </section>
  );
}
```

- [ ] **Step 5: Create add page**

Create `src/app/f/[familyId]/add/page.tsx`:

```tsx
import { BottomNav } from "@/components/navigation/BottomNav";
import { DatePhotoPanel } from "@/components/add/DatePhotoPanel";
import { ManualEntryPanel } from "@/components/add/ManualEntryPanel";
import { VoiceEntryPanel } from "@/components/add/VoiceEntryPanel";
import { listLocations } from "@/lib/server/locations";

export default async function AddFoodPage({ params }: { params: { familyId: string } }) {
  const locations = await listLocations(params.familyId);
  const choices = locations.map((location) => ({ id: location.id, name: location.name }));

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">添加食物</h1>
      <div className="mt-5 space-y-5">
        <VoiceEntryPanel familyId={params.familyId} locations={choices} />
        <DatePhotoPanel familyId={params.familyId} locations={choices} />
        <ManualEntryPanel familyId={params.familyId} locations={choices} />
      </div>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

- [ ] **Step 6: Verify confirmation rule manually**

Run:

```powershell
npm run dev
```

Open `http://127.0.0.1:3000/f/demo/add`.

Expected:

- Voice output appears in editable fields before saving.
- OCR output appears in editable fields before saving.
- Saving without location or expiry shows the validation message.

- [ ] **Step 7: Commit**

Run:

```powershell
git add src/app/f/[familyId]/add src/components/add src/lib/adapters
git commit -m "feat: add confirmed food entry flows"
```

Expected: commit succeeds.

---

### Task 6: Location Creation, Photo Upload, and Sketch Cover Generation

**Files:**
- Create: `D:\Learning\home-food-map\src\app\f\[familyId]\locations\new\page.tsx`
- Create: `D:\Learning\home-food-map\src\components\location\CreateLocationForm.tsx`
- Create: `D:\Learning\home-food-map\src\app\api\upload\route.ts`
- Create: `D:\Learning\home-food-map\src\lib\adapters\sketchCover.ts`
- Modify: `D:\Learning\home-food-map\src\app\f\[familyId]\locations\page.tsx`

**Interfaces:**
- Consumes: `createLocation`.
- Produces: explicit, user-defined household locations with original photos and generated sketch covers.

- [ ] **Step 1: Implement upload route**

Create `src/app/api/upload/route.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "missing file" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, "-")}`;
  await writeFile(path.join(uploadDir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
```

- [ ] **Step 2: Implement sketch cover generator**

Create `src/lib/adapters/sketchCover.ts`:

```ts
export async function createSketchCover(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = Math.round((bitmap.height / bitmap.width) * 640);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法生成位置封面");
  ctx.filter = "grayscale(1) contrast(1.4) brightness(1.08)";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(255, 244, 214, 0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("封面生成失败"))), "image/jpeg", 0.86);
  });
}
```

- [ ] **Step 3: Create location form**

Create `src/components/location/CreateLocationForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { createLocation } from "@/lib/server/locations";
import { createSketchCover } from "@/lib/adapters/sketchCover";

async function uploadFile(file: File | Blob, filename: string) {
  const form = new FormData();
  form.append("file", file, filename);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  if (!response.ok) throw new Error("上传失败");
  return (await response.json()) as { url: string };
}

export function CreateLocationForm({ familyId }: { familyId: string }) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("常温");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function save() {
    if (!name.trim()) {
      setMessage("位置名称不能为空");
      return;
    }

    let photoUrl: string | undefined;
    let sketchCoverUrl: string | undefined;

    if (file) {
      const uploadedPhoto = await uploadFile(file, file.name);
      photoUrl = uploadedPhoto.url;
      try {
        const sketch = await createSketchCover(file);
        const uploadedSketch = await uploadFile(sketch, `sketch-${file.name}.jpg`);
        sketchCoverUrl = uploadedSketch.url;
      } catch {
        sketchCoverUrl = undefined;
      }
    }

    await createLocation({
      familyId,
      name: name.trim(),
      photoUrl,
      sketchCoverUrl,
      tags: tags.split(/[，,\s]+/).filter(Boolean),
    });
    setMessage("位置已保存");
  }

  return (
    <section className="space-y-3 rounded-lg bg-white p-4">
      <p className="text-sm text-slate-600">位置只用来帮助识别柜子、箱子或抽屉。食物放在哪里，需要添加食物时明确选择。</p>
      <input className="min-h-12 w-full rounded-md border p-3" value={name} placeholder="例如：妈妈零食柜" onChange={(event) => setName(event.target.value)} />
      <input className="min-h-12 w-full rounded-md border p-3" value={tags} placeholder="标签，例如：常温 零食" onChange={(event) => setTags(event.target.value)} />
      <input className="block w-full text-sm" type="file" accept="image/*" capture="environment" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <button className="min-h-12 w-full rounded-md bg-emerald-700 font-bold text-white" onClick={save}>保存位置</button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
```

- [ ] **Step 4: Add location creation page and link**

Create `src/app/f/[familyId]/locations/new/page.tsx`:

```tsx
import { BottomNav } from "@/components/navigation/BottomNav";
import { CreateLocationForm } from "@/components/location/CreateLocationForm";

export default function NewLocationPage({ params }: { params: { familyId: string } }) {
  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">添加位置</h1>
      <p className="mt-1 text-slate-600">给真实的柜子、箱子或抽屉取一个家里人认得的名字</p>
      <div className="mt-5">
        <CreateLocationForm familyId={params.familyId} />
      </div>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

Confirm `src/app/f/[familyId]/locations/page.tsx` already contains:

```tsx
<Link href={`/f/${params.familyId}/locations/new`} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white">
  添加
</Link>
```

- [ ] **Step 5: Verify build**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```powershell
git add src/app/api src/app/f/[familyId]/locations src/components/location src/lib/adapters/sketchCover.ts
git commit -m "feat: add custom household locations"
```

Expected: commit succeeds.

---

### Task 7: Records, Family Page, Filters, and End-to-End MVP Test

**Files:**
- Create: `D:\Learning\home-food-map\src\app\f\[familyId]\records\page.tsx`
- Create: `D:\Learning\home-food-map\src\app\f\[familyId]\family\page.tsx`
- Modify: `D:\Learning\home-food-map\src\app\f\[familyId]\page.tsx`
- Modify: `D:\Learning\home-food-map\src\app\f\[familyId]\locations\[locationId]\page.tsx`
- Create: `D:\Learning\home-food-map\tests\e2e\mvp.spec.ts`

**Interfaces:**
- Consumes: all prior UI and server actions.
- Produces: operation history, family member view, location filters, and an automated smoke test.

- [ ] **Step 1: Add records page**

Create `src/app/f/[familyId]/records/page.tsx`:

```tsx
import { BottomNav } from "@/components/navigation/BottomNav";
import { listOperations } from "@/lib/server/operations";

export default async function RecordsPage({ params }: { params: { familyId: string } }) {
  const operations = await listOperations(params.familyId);
  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">操作记录</h1>
      <section className="mt-5 space-y-3">
        {operations.map((operation) => (
          <article key={operation.id} className="rounded-lg bg-white p-4">
            <p className="font-semibold">{operation.type}</p>
            <p className="mt-1 text-sm text-slate-600">{operation.food?.name ?? "食物记录"} · {operation.createdAt.toLocaleString("zh-CN")}</p>
          </article>
        ))}
      </section>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

- [ ] **Step 2: Add family page**

Create `src/app/f/[familyId]/family/page.tsx`:

```tsx
import { BottomNav } from "@/components/navigation/BottomNav";
import { getDemoFamily } from "@/lib/server/families";

export default async function FamilyPage({ params }: { params: { familyId: string } }) {
  const family = await getDemoFamily();
  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">{family.name}</h1>
      <section className="mt-5 space-y-3">
        {family.members.map((member) => (
          <article key={member.id} className="rounded-lg bg-white p-4">
            <p className="font-semibold">{member.nickname}</p>
            <p className="mt-1 text-sm text-slate-600">{member.role === "admin" ? "管理员" : "成员"}</p>
          </article>
        ))}
      </section>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

- [ ] **Step 3: Add dashboard filters**

Modify `src/app/f/[familyId]/page.tsx` to accept `searchParams` and render a horizontal location filter row:

```tsx
import Link from "next/link";
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { groupExpiry } from "@/lib/domain/expiry";
import { listFoods } from "@/lib/server/foods";
import { listLocations } from "@/lib/server/locations";

export default async function FamilyDashboard({
  params,
  searchParams,
}: {
  params: { familyId: string };
  searchParams: { locationId?: string };
}) {
  const [foods, locations] = await Promise.all([
    listFoods(params.familyId, { locationId: searchParams.locationId }),
    listLocations(params.familyId),
  ]);
  const groups = groupExpiry(
    foods.map((food) => ({ ...food, expiresAt: food.expiresAt.toISOString().slice(0, 10), status: food.status as "active" })),
    new Date(),
  );
  const urgentIds = new Set([...groups.expired, ...groups.today, ...groups.within3Days, ...groups.within7Days, ...groups.within30Days].map((food) => food.id));
  const urgentFoods = foods.filter((food) => urgentIds.has(food.id));

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">快到期</h1>
      <p className="mt-1 text-slate-600">先处理最容易忘的东西</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <Link className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold" href={`/f/${params.familyId}`}>
          全部
        </Link>
        {locations.map((location) => (
          <Link key={location.id} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold" href={`/f/${params.familyId}?locationId=${location.id}`}>
            {location.name}
          </Link>
        ))}
      </div>
      <section className="mt-5 space-y-3">
        {urgentFoods.map((food) => <FoodCard key={food.id} familyId={params.familyId} food={food} />)}
        {urgentFoods.length === 0 ? <p className="rounded-lg bg-white p-4 text-slate-600">当前筛选下没有 30 天内到期的食物。</p> : null}
      </section>
      <BottomNav familyId={params.familyId} />
    </main>
  );
}
```

- [ ] **Step 4: Add E2E test**

Create `tests/e2e/mvp.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("demo family can view expiry dashboard and location map", async ({ page }) => {
  await page.goto("/f/demo");
  await expect(page.getByRole("heading", { name: "快到期" })).toBeVisible();
  await page.getByRole("link", { name: /位置/ }).click();
  await expect(page.getByRole("heading", { name: "位置地图" })).toBeVisible();
  await expect(page.getByText("妈妈零食柜")).toBeVisible();
});
```

- [ ] **Step 5: Run full verification**

Run:

```powershell
npm run test
npm run build
npm run test:e2e
```

Expected: all pass.

- [ ] **Step 6: Commit**

Run:

```powershell
git add src/app/f tests/e2e
git commit -m "feat: complete trial web mvp flow"
```

Expected: commit succeeds.

---

## Self-Review

Spec coverage:

- Family group and members: Task 3 and Task 7.
- Custom storage locations with photo and sketch cover: Task 3, Task 4, Task 6.
- Voice food entry: Task 2 and Task 5.
- Photo date recognition: Task 2 and Task 5.
- Manual correction before save: Task 5.
- Explicit food-to-location ownership: Task 3 and Task 5 validations.
- Expiry dashboard and in-app reminders: Task 2 and Task 4.
- Filter by location: Task 4 and Task 7.
- Location detail inventory: Task 4.
- One-tap take, finish, discard: Task 2, Task 3, Task 4.
- Operation records: Task 3 and Task 7.
- No native App: global constraint and stack selection.
- WeChat subscription messages deferred: global constraint and excluded scope.

Placeholder scan:

- No `TBD`, `TODO`, or unspecified "implement later" instructions remain.
- Deferred features are explicitly listed as out of first-version scope.

Type consistency:

- Food status uses `active`, `taken`, `finished`, `discarded` across domain, database, and server actions.
- Food creation source uses `manual`, `voice`, `date-photo` across confirmation form and server action.
- Location identity is always explicit via `locationId`; no task auto-detects food location from a photo.
