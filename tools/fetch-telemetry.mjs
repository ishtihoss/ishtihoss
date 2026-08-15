#!/usr/bin/env node
// Pulls the contribution calendar for a user via the GitHub GraphQL API and
// prints a compact JSON summary (streaks, totals, last 52 weeks) to stdout.
//
//   GITHUB_TOKEN=... node tools/fetch-telemetry.mjs ishtihoss > dist/telemetry.json
//
// Streak semantics match the common "streak stats" cards: a day with zero
// contributions today does not break the current streak (it may still be
// filled in), but a zero yesterday does.

const login = process.argv[2] || process.env.GH_LOGIN || "ishtihoss";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const tz = process.env.TZ_NAME || "America/Vancouver";
if (!token) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

async function gql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "ishtihoss-profile" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GraphQL: ${res.status} ${JSON.stringify(json.errors || json)}`);
  return json.data;
}

// Today's date in the user's timezone (YYYY-MM-DD).
const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const yearsData = await gql(
  `query($login: String!) { user(login: $login) { createdAt contributionsCollection { contributionYears } } }`,
  { login },
);
const years = yearsData.user.contributionsCollection.contributionYears.sort((a, b) => a - b);

const days = new Map(); // date -> { count, level }
let total = 0;
for (const y of years) {
  const d = await gql(
    `query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) { contributionsCollection(from: $from, to: $to) {
        contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`,
    { login, from: `${y}-01-01T00:00:00Z`, to: `${y}-12-31T23:59:59Z` },
  );
  const cal = d.user.contributionsCollection.contributionCalendar;
  total += cal.totalContributions;
  for (const w of cal.weeks) for (const c of w.contributionDays) days.set(c.date, { count: c.contributionCount, level: c.contributionLevel });
}

const dates = [...days.keys()].filter((d) => d <= today).sort();
const addDays = (iso, n) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

// Longest streak
let longest = { length: 0, start: null, end: null };
let run = 0, runStart = null;
for (const d of dates) {
  if ((days.get(d)?.count ?? 0) > 0) {
    if (run === 0) runStart = d;
    run++;
    if (run > longest.length) longest = { length: run, start: runStart, end: d };
  } else run = 0;
}

// Current streak: walk back from today (today may be empty).
let cursor = today;
if ((days.get(cursor)?.count ?? 0) === 0) cursor = addDays(cursor, -1);
let current = { length: 0, start: null, end: null };
while ((days.get(cursor)?.count ?? 0) > 0) {
  if (!current.end) current.end = cursor;
  current.start = cursor;
  current.length++;
  cursor = addDays(cursor, -1);
}

const firstDate = dates.find((d) => (days.get(d)?.count ?? 0) > 0) ?? null;

// Last 52 full weeks + the current partial week, as columns of 7 (Sun..Sat).
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const todayDow = new Date(`${today}T00:00:00Z`).getUTCDay();
const gridStart = addDays(today, -(todayDow + 52 * 7));
const weeks = [];
for (let w = 0; w < 53; w++) {
  const col = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(gridStart, w * 7 + i);
    if (d > today) { col.push(null); continue; }
    const e = days.get(d);
    col.push(e ? { d, c: e.count, l: LEVEL[e.level] ?? 0 } : { d, c: 0, l: 0 });
  }
  weeks.push(col);
}
const yearTotal = weeks.flat().reduce((s, c) => s + (c?.c ?? 0), 0);

process.stdout.write(
  JSON.stringify({ login, generatedAt: new Date().toISOString(), today, timezone: tz, total, firstDate, current, longest, yearTotal, weeks }) + "\n",
);
