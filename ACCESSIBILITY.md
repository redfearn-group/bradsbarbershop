# Accessibility

**Target:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA.

**Status, 24 SEP 2026:** the site meets WCAG 2.2 AA on every page that was tested (Home, Prices, About, Visit and the 404 page), with one exception outside our control, explained under [Third-party content](#third-party-content).

## How it was tested

| Check | What was done | Result |
| :--- | :--- | :--- |
| Automated scan | [axe-core](https://github.com/dequelabs/axe-core) 4.13, run with its WCAG 2.0, 2.1 and 2.2 A and AA rules plus its best-practice rules. It covered every page at phone (375 px) and desktop (1280 px) widths, in both light and dark mode: 20 page views. | 0 violations |
| Keyboard | Tabbed through every page at phone and desktop widths. Every link can be reached, the tab order matches the order the page reads on screen at every width, and every stop shows a visible focus ring. Focus inside the Google map gets a ring around the map. | Pass |
| Focus not hidden (2.4.11) | At each tab stop, checked that the focused link is actually visible on screen and not covered by the sticky header or the phone call bar. | Pass |
| Target size (2.5.8) | AA needs 24 x 24 px. Every link and button on the site is at least 44 px tall, which also meets the stricter AAA guideline. | Pass |
| Reflow (1.4.10) | No sideways scrolling at 320 px wide, or at 640 px, which is desktop at 200% zoom. | Pass |
| Text spacing (1.4.12) | Increased line, letter, word and paragraph spacing to the WCAG test values. No text was cut off and nothing scrolled sideways. | Pass |
| Color contrast (1.4.3, 1.4.11) | Every text and background pair, in both modes (table below). | Pass |
| Forced colors | Checked in Windows High Contrast emulation. Buttons keep their outlines, the logo switches to the system text color, and the current page stays marked in the menu. | Pass |
| Screen reader structure | Reviewed the accessibility tree for each page, which is what a screen reader reads out: landmarks, headings, link names, the hours table, and image descriptions. | Pass |
| Criterion-by-criterion review | A separate review of the templates and CSS against every WCAG 2.2 A and AA success criterion. It found one issue, the header's tab order on phones, which is now fixed. | Pass |

**Not yet done:** a person listening with a real screen reader (NVDA or JAWS on Windows, or VoiceOver on an iPhone). The structure is right, but a five-minute listen on a phone is the one check the tools can't replace.

## Color contrast

WCAG AA needs 4.5:1 for normal text, and 3:1 for large text, focus rings and the edges of buttons.

| Pair | Ratio |
| :--- | :--- |
| Body text, light mode (blue on cream) | 17.0:1 |
| Body text on white cards, light mode | 18.7:1 |
| Secondary text, light mode (slate on cream) | 6.9:1 |
| Red labels and prices, light mode (red on cream) | 5.6:1 |
| Button text, both modes (cream on red) | 5.6:1 |
| Body text, dark mode (cream on blue) | 17.0:1 |
| Secondary text, dark mode (grey on blue) | 12.7:1 |
| Focus ring, light mode (red on cream) | 5.6:1 |
| Focus ring on dark areas (cream on blue) | 17.0:1 |
| Red button edge on the dark page | 3.1:1 |

Red on the dark blue is 3.1:1. That's enough for a button edge but not for text, so in dark mode red is never used for text.

## What makes it work

- **Landmarks and headings.** Each page has a banner, a main menu, main content and a footer, plus one H1 with H2s below it and no skipped levels. A "Skip to content" link appears on the first press of Tab.
- **Phones.** Calling is always one tap away in the bar fixed to the bottom of the screen, and a focused link never scrolls in underneath that bar or the header.
- **Link names.** Buttons say what they do: "Call to book, (801) 798-2629". Directions links add "in Google Maps", which is read aloud but not shown, so people know they're leaving the site.
- **Hours.** Hours use a real table with a row heading for each day. Day names are written out in full, because a screen reader reads "Tue" as a word. The "Today" marker is real text, so it's read as "Thursday, Today".
- **Images.** The shop photo has a description. The logo link is named "Brad's Barber Shop, home". Every illustration is decorative and hidden from screen readers.
- **No color-only meaning.** The open and closed dot always has its words next to it. Links in text are underlined.
- **Motion and zoom.** Smooth scrolling is turned off for people who ask their device for reduced motion. The page can be zoomed and rotated freely.

## Third-party content

The **Google Map** on the Visit page is Google's own embedded page. We gave it a descriptive title, but we can't test or fix what's inside it. Everything the map shows (the address, a directions link and the phone number) is also in plain text right next to it.

## Keeping it accessible

- **New photos** need a real `alt` description in `shop.json` that says what the photo shows, as explained in the README.
- **Change hours and prices only in `shop.json`.** The table, footer and open or closed line all come from it.
- **Don't put text on top of photos,** and don't add colors outside the three in `main.css` without checking contrast.
- **New illustrations** go in `src/_includes/art/` and are added with `{% art "name" %}`. That keeps them hidden from screen readers and gives any ids inside them unique names.
