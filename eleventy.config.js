import { readFileSync } from "node:fs";

// Hours are stored as "HH:MM" strings in shop.json and formatted here, never through
// new Date(), so a build machine in another time zone can't shift them.
// Day names are written out in full: screen readers read "Tue" as a word, not a day.
const DAY = { Su: "Sunday", Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday" };
const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function timeLabel(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  // A no-break space keeps "8 AM" together when a narrow screen wraps "8 AM to 6 PM".
  return m ? `${h12}:${String(m).padStart(2, "0")}\u00A0${suffix}` : `${h12}\u00A0${suffix}`;
}

// Collapses the week into lines like "Tuesday to Friday: 8 AM to 6 PM" plus one "Closed ..." line.
function hoursSummary(hours) {
  const byCode = Object.fromEntries(hours.map((d) => [d.code, d]));
  const lines = [];
  const closed = [];
  let run = null;
  for (const code of WEEK) {
    const d = byCode[code];
    if (!d || !d.open) {
      closed.push(DAY[code]);
      run = null;
      continue;
    }
    const span = `${timeLabel(d.open)} to ${timeLabel(d.close)}`;
    if (run && run.span === span) {
      run.last = code;
    } else {
      run = { first: code, last: code, span };
      lines.push(run);
    }
  }
  const out = lines.map((r) => ({
    days: r.first === r.last ? DAY[r.first] : `${DAY[r.first]} to ${DAY[r.last]}`,
    time: r.span,
  }));
  if (closed.length) {
    // Sunday-first reads naturally for closed days: "Sunday and Monday", not "Monday and Sunday".
    const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    closed.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const days = closed.length > 1 ? `${closed.slice(0, -1).join(", ")} and ${closed.at(-1)}` : closed[0];
    out.push({ days, time: "Closed" });
  }
  return out;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");

  eleventyConfig.addFilter("timeLabel", timeLabel);
  eleventyConfig.addFilter("hoursSummary", hoursSummary);
  // Rotates the week so it starts on the first open day after a closed stretch
  // (Tuesday for this shop), leaving the closed days at the end. Keeps each day's
  // 0-6 index so the "today" script can still find it.
  eleventyConfig.addFilter("weekForDisplay", (hours) => {
    const n = hours.length;
    const start = hours.findIndex((d, i) => d.open && !hours[(i + n - 1) % n].open);
    const from = start < 0 ? 0 : start;
    return Array.from({ length: n }, (_, k) => ({ ...hours[(from + k) % n], index: (from + k) % n }));
  });
  eleventyConfig.addFilter("money", (n) => `$${n}`);
  eleventyConfig.addFilter("hourNumber", (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Inlines an illustration from src/_includes/art/. Each use gets its own suffix on
  // any id inside the SVG, so the same drawing can appear twice on a page without
  // duplicate ids breaking the second copy's clip paths or patterns.
  let artUses = 0;
  eleventyConfig.addShortcode("art", (name) => {
    const n = ++artUses;
    return readFileSync(`src/_includes/art/${name}.svg`, "utf8")
      .replace(/id="([^"]+)"/g, `id="$1-${n}"`)
      .replace(/url(#([^)]+))/g, `url(#$1-${n})`)
      .replace(/href="#([^"]+)"/g, `href="#$1-${n}"`);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
