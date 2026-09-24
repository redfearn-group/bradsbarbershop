# Brad's Barber Shop

The website for [Brad's Barber Shop](https://bradsbarbershop.com), a barber shop on Main Street in Spanish Fork, Utah, since 1979.

It's a small static site built with [Eleventy](https://www.11ty.dev/) and published by GitHub Pages. There's no database, no booking system and no contact form: customers call or walk in. Every push to `main` rebuilds and publishes the site automatically, usually within two minutes.

Moving the domain from WordPress.com to GitHub Pages is a one-time job, covered step by step in [SETUP.md](SETUP.md).

## Changing hours, prices or contact details

Everything the shop might change lives in one file: [`src/_data/shop.json`](src/_data/shop.json). Every page, the footer, the "Open now" line and the details Google reads all come from it. Edit that file and nothing else.

The easiest way is on GitHub itself: open the file, click the pencil icon, make the change, and click **Commit changes**. The site updates on its own.

| To change | Edit in `shop.json` |
| :--- | :--- |
| Opening hours | `hours`: one entry per day, in 24-hour time, such as `"08:00"` and `"18:00"`. Use `null` for both on a closed day. |
| Prices | `services`: each has a `name`, a `price` (a whole number, no dollar sign) and a short `description`. Add or remove entries freely. |
| Phone number | `phone`: `display` is what people see, and `tel` is the dial string, in the form `+18017982629`. Change both. |
| Address | `address` and `geo`. If the shop ever moves, update `maps` too. |
| Rating | `rating.value`, when the Google rating changes. |
| Awards | `awards`: a `title` and a `detail` for each. |
| Barbers | `barbers` is empty on purpose, so no barbers section appears. Adding entries with a `name` (and an optional `bio`) makes the section show up on the About page. |

Times are always written in the shop's own time zone (Mountain). The site works out "Open now" and "Closed now" in that time zone, whatever the visitor's device says.

## Adding photos

1. Put the photo in `src/assets/photos/`. JPEG, about 1600 pixels on the long side, under 300 KB is plenty.
2. Add an entry to `gallery` in `shop.json`:

   ```json
   {
     "src": "/assets/photos/storefront.jpg",
     "width": 1600,
     "height": 1200,
     "alt": "What the photo shows, for people using screen readers",
     "caption": "Optional line under the photo."
   }
   ```

   `width` and `height` are the photo's real pixel size. They stop the page from jumping as it loads.
3. Commit. New photos appear on the About page. The first photo in the list is the one on the home page.

The rest of the artwork on the site is illustration (`src/_includes/art/`), drawn in the shop's three colors, so it stays consistent in light and dark mode.

## Logo files

In `src/assets/`:

| File | Use |
| :--- | :--- |
| `logo-razor.svg` | Main logo, for light backgrounds. |
| `logo-razor-dark.svg` | Main logo, for dark backgrounds. |
| `seal.svg`, `seal.png` | The round seal: profile photos on Google, Facebook and Yelp, stickers, the shop window. |
| `favicon.*`, `apple-touch-icon.png`, `icon-*.png` | The B icon: browser tabs, bookmarks and phone home screens. |
| `og-image.png` | The preview image that shows when someone shares the link. |

Only one logo appears in any one view: the seal where a space is round or square, and the razor everywhere else.

## Colors

Three colors, with light and dark modes: blue `#0A1128`, red `#BF1E2E` and cream `#F7F4EF`. They live at the top of [`src/css/main.css`](src/css/main.css). Red on the dark blue is too low in contrast for text, so in dark mode red is used only for buttons, stripes and the razor handle, and all text is cream.

## Working on it locally

Needs [Node.js](https://nodejs.org/) 20 or later.

```powershell
npm ci
npm run serve
```

Then open http://localhost:8080. `npm run build` writes the finished site to `_site/`, which is the same check GitHub runs on every pull request.

## How it's put together

```
src/
  _data/shop.json        every fact about the shop
  _data/schema.js        turns shop.json into the details search engines read
  _includes/layouts/     the page frame: header, footer, call button
  _includes/partials/    the price list and hours table
  _includes/art/         illustrations
  css/main.css           all styling
  index.njk              home
  services/  about/  contact/   the other pages
  404.njk                page-not-found
  CNAME                  bradsbarbershop.com
```
