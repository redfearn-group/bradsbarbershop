// Builds the HairSalon JSON-LD block from shop.json, so search engines get the same
// name, address, phone and hours the pages show. schema.org has no BarberShop type;
// HairSalon is the closest LocalBusiness subtype.
import { readFileSync } from "node:fs";

const shop = JSON.parse(readFileSync(new URL("./shop.json", import.meta.url), "utf8"));

const DAY_URL = {
  Su: "Sunday", Mo: "Monday", Tu: "Tuesday", We: "Wednesday",
  Th: "Thursday", Fr: "Friday", Sa: "Saturday",
};

// Days that share the same hours are grouped into one specification.
const groups = new Map();
for (const d of shop.hours.filter((h) => h.open)) {
  const key = `${d.open}-${d.close}`;
  if (!groups.has(key)) groups.set(key, { opens: d.open, closes: d.close, days: [] });
  groups.get(key).days.push(`https://schema.org/${DAY_URL[d.code]}`);
}

const schema = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "@id": `${shop.url}/#shop`,
  name: shop.name,
  description: shop.description,
  url: `${shop.url}/`,
  telephone: shop.phone.tel,
  foundingDate: String(shop.foundingYear),
  priceRange: "$",
  image: `${shop.url}${shop.gallery[0].src}`,
  logo: `${shop.url}/assets/seal.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: shop.address.street,
    addressLocality: shop.address.city,
    addressRegion: shop.address.region,
    postalCode: shop.address.postalCode,
    addressCountry: shop.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: shop.geo.lat,
    longitude: shop.geo.lng,
  },
  hasMap: shop.maps.directions,
  openingHoursSpecification: [...groups.values()].map((g) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: g.days,
    opens: g.opens,
    closes: g.closes,
  })),
};

const profiles = shop.social.filter((s) => s.name !== "Google").map((s) => s.url);
if (profiles.length) schema.sameAs = profiles;

export default schema;
