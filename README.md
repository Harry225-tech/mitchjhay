# Mitch Jhay Auto & Rentals website

Static site (HTML, CSS, JavaScript). No build step, no dependencies.

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and visit http://localhost:8000.

## Deploy
- Netlify: drag this whole folder onto app.netlify.com/drop.
- Vercel: run `vercel` in this folder, or import the folder from the dashboard.

## Dark and light mode
The site has a light theme (the default look) and a dark theme. The light values live on `:root` in `css/styles.css`; the dark theme overrides the same variables on `:root[data-theme="dark"]`. Every colour in the stylesheet is a variable, so changing one attribute on `<html>` re-themes the whole page instantly — there are no transitions or animations.

How it works:
- `js/theme.js` is loaded in the `<head>` of every page **before** `css/styles.css`, so the correct theme is on `<html>` before the first paint (no flash of the wrong theme). It is an external file because the Content-Security-Policy blocks inline scripts.
- First visit: the theme follows the operating system setting (`prefers-color-scheme`) and keeps following it while the visitor has made no choice.
- Clicking the toggle (in the header or the mobile bar) saves the choice in `localStorage` under the key `mj-theme`. Reading and writing are wrapped in `try/catch`, so the site still works when storage is blocked or full.
- The toggle handler is delegated from `document` inside `js/theme.js`, so every page works without `main.js` or `sale.js`. It updates `aria-pressed`, its `aria-label` ("Switch to dark mode" / "Switch to light mode") and the `theme-color` meta tag (browser chrome colour).
- Every page also has `<meta name="color-scheme" content="light dark">`, so native controls (scrollbars, form fields, `date` pickers) match the theme.
- Icons are the Material Design `dark_mode` (moon) and `light_mode` (sun) glyphs; the moon shows in the light theme and the sun in the dark theme.

Key colour tokens (top of `css/styles.css`):
- Surfaces: `--bg`, `--bg-alt`, `--surface`, `--surface-alt`, `--surface-image`, `--surface-dark`, `--surface-dark-alt`, `--field`, `--field-inset`, `--panel-accent`.
- Text: `--text`, `--muted`, `--on-gold`, `--gold-text`, `--accent-panel-ink`, `--text-on-dark*`.
- Lines: `--line`, `--line-strong`, `--line-chip`, `--line-on-dark*`, `--focus-ring`.
- Brand: `--gold`, `--gold-deep`, `--gold-text`, `--gold-hover`, `--gold-soft`, `--gold-soft-strong`, `--hero-scrim`, `--hero-scrim-mobile`, `--hero-photo`, `--hero-text-shadow`.

The header, footer, mobile bar, hero panels, booking form and sale enquiry form stay dark in both themes on purpose, and the hero text stays white over the dark panel in both themes.

The hero photo is set in one place only, `--hero-photo` in the `:root` block at the top of `css/styles.css`. It is `none` by default, so every hero is a flat `#111111` panel drawn entirely in CSS.

## Edit before launch
1. Fleet: `js/data.js` holds the `CARS` list of rental vehicles (`window.CARS`). Three cars are listed — Hyundai Elantra, Toyota Corolla (Sedan) and Toyota RAV4 (SUV) — with only the make, model and body type confirmed. Every car carries the full field template `price` (GHS per day), `seats`, `transmission`, `fuel`, `year`, `color` and `driverOption`, all empty on purpose. Add further cars here only when the owner confirms them. Leave a field as `null` or `''` when unconfirmed: the page then shows "Ask us" instead of a guess, disables price sorting, and sends a rate-confirmation request rather than an estimate. There is **no rental details view yet** — a rental card shows one photo (`image`), so the commented-out `photos: { exterior, interior }` example in `js/data.js` is not rendered. Interior photos are a sale-listing feature only, in `sale.js`.
2. Rental photos: `CARS[].image` points at the vehicle photo (WebP preferred, about 1200px wide, under 150 KB each, in `images/`). The three listed photos are the real cars above. A car whose `image` fails to load falls back to the SVG silhouette named by its `fallback` field (`car-sedan`, `car-suv`, `car-van`, `car-pickup`).
3. **Hero photo (optional):** by default there is no hero photo. The hero is a flat `#111111` panel with the brand logo and a CSS gold accent, and it is photo-free until you supply your own picture. To use one, save it as `images/hero.webp` and change a single line in `css/styles.css`:
   ```css
   /* near the top of css/styles.css, in the :root block */
   --hero-photo: none;
   ```
   becomes
   ```css
   --hero-photo: url("../images/hero.webp");
   ```
   Nothing else changes. The overlay that keeps the headline readable is already wired up: left-to-right on desktop, top-to-bottom under 720px. With `--hero-photo: none` that overlay is an exact no-op, because it is the same black as the panel.
   - 1600 x 900 pixels, WebP, under 200 KB.
   - Calm, empty space on the **left**, behind the headline: the overlay darkens the left more than the right.
   - Use only a photo you took yourself. Never present stock imagery as your own yard or your own cars.
   - Export at roughly 70-80% quality to stay under 200 KB.
4. Reviews: leave the `REVIEWS` list empty unless you have verified customer feedback to publish.
5. Legal pages: review `privacy.html`, `terms.html`, and `cancellation.html` before publishing.
6. Sale cars: open `js/data.js` and add only owner-confirmed vehicles to `FOR_SALE` (`window.FOR_SALE`). `js/sale.js` renders that list; add a listing there, not in `js/sale.js`. Each object uses `id`, `make`, `model`, `year`, `price` (GHS), `priceNegotiable`, `mileageKm`, `transmission`, `fuel`, `bodyType`, `color`, `engine`, `condition`, `location`, `shortDescription`, `keyFeatures`, `status`, `photos: { exterior, interior }`, and `documentsNote`. Use `status: "available"`, `"reserved"`, or `"sold"`; change `SHOW_SOLD` in `js/sale.js` to control whether sold cars appear. Leave unknown facts empty so the page displays "Ask us"; do not guess.
7. Sale photos: the rental photos are not sale photos. Do not reuse a rental vehicle's photo on a sale listing. Place the confirmed sale car's photos in `images/sale/<car-id>/` and list each `{ path, alt }` in the car's `photos.exterior` and `photos.interior` arrays. Take photos in daylight with a clean car. Exterior angles: front three-quarter, side, rear, and wheels or front. Interior angles: dashboard and steering wheel, front seats, back seats, and boot or luggage space. Use only photos you took yourself, blur number plates, export as WebP at 1200px wide, and keep each image under 150 KB. Read `images/sale/README.txt` for naming examples.
8. Sale terms: confirm every `[PLACEHOLDER: confirm with owner]` in `sales-terms.html` before launch.
9. Domain: `sitemap.xml` currently uses relative paths as requested. Replace them with absolute URLs when the production domain is known; then add canonical and OG URL metadata.
10. Driver's licence number (self-drive rentals): the booking form in `index.html` asks for a driver's licence number only when the visitor picks "Without driver". `js/main.js` puts it only in the WhatsApp or email message the visitor sends; it is never posted to `BOOKING_ENDPOINT`, never stored in the browser, never logged and never added to a URL. Confirm these points with the owner before launch:
    1. Whether a driver is actually offered: `[PLACEHOLDER: confirm with owner]`. The booking note in `index.html` and the `Driver: provided by Mitch Jhay Auto & Rentals` line in `js/main.js` both assume it is.
    2. Whether the licence is checked in person at pickup: `[PLACEHOLDER: confirm with owner]`. This is the hint shown under the licence field.
    3. How long a message containing a licence number is kept: `[PLACEHOLDER: confirm with owner]`. See `privacy.html`.
    4. `[PLACEHOLDER: confirm with a qualified person in Ghana how ID numbers must be handled and whether Data Protection Commission registration applies]`. See `privacy.html`.

## Before you launch

Work through this list top to bottom. Nothing on the site is wrong while a field is empty — each empty
`SITE` value simply removes its own block — but the site is only finished once the real values are in.

### 1. Fill in `window.SITE` in `js/data.js`
Every field is an empty string on purpose. `js/site.js` fills the matching `data-site` elements and
**removes** anything whose value is empty, so a visitor never sees an empty line or a placeholder.
Do not fill a field until the owner has confirmed it.

| Field | Appears as | Notes |
| --- | --- | --- |
| `hours` | top information bar, Contact section, footer | One line of plain text. While it is empty the whole information bar is removed. |
| `hoursNote` | under the hours in all three places | Optional second line, e.g. a note about replies outside opening hours. |
| `payments` | FAQ ("How can I pay?") and `terms.html` ("Deposit and payment") | Rendered as "Payment methods: …". Only list methods the business actually accepts. |
| `about` | "About us" section on `index.html` and its navigation link | Put a blank line between paragraphs; each becomes its own paragraph. Empty hides the section and the nav link. |
| `aboutPhoto` | image beside the About text | e.g. `'images/about.webp'`. Crop it to 4:3 (1200x900) to match the declared size. Empty shows no photo. |
| `social.facebook` / `.instagram` / `.tiktok` / `.x` / `.youtube` | footer icon row | Full profile URLs only. Only networks with a URL get an icon; the whole row is removed if none are set. |
| `googleReviewUrl` | "Leave a Google review" in the Contact section | Your Google review page link. Empty removes the link. |

### 2. Hero photo
- [ ] Optional. The hero is photo-free by default: a flat `#111111` panel, the brand logo and a CSS gold accent.
- [ ] If you want a photo: save it as `images/hero.webp` — 1600x900, WebP, under 200 KB, calm empty space on the left behind the headline, your own photo only.
- [ ] Set `--hero-photo: url("../images/hero.webp");` in the `:root` block at the top of `css/styles.css`. That one line is the whole change; the readable-text overlay is already in place.
- [ ] Check the headline in both themes at 360px, 768px and 1280px after switching it on.

### 3. Replace `YOUR-DOMAIN`
- [ ] `YOUR-DOMAIN` appears in the `canonical` and `og:url` tags of all seven HTML pages, in `sitemap.xml`, in `robots.txt` and in the JSON-LD in `index.html`. Replace all of them with the real domain, for example `https://mitchjhayautorentals.com`.
- [ ] After that, `sitemap.xml` can use absolute URLs again.

### 4. Replace the stock car photos with your own
- [ ] `images/cars/hyundai-elantra/exterior-1.webp` — currently a manufacturer-style image, not a photo of your own car.
- [ ] `images/cars/toyota-corolla/exterior-1.webp` — currently a manufacturer-style image.
- [ ] `images/cars/toyota-rav4/exterior-1.webp` — confirm this is your own vehicle.
- [ ] Update `image`, `width`, `height` and `focus` for each car in `js/data.js` to match the new photo. Never present a stock image as a vehicle you are renting out.

### 5. Decide the legal placeholders
The four legal pages still show `[PLACEHOLDER: confirm with owner]`. Each one is a decision only the owner (or, for the privacy one, a qualified adviser in Ghana) can make. Replace each one with the agreed wording, or delete the sentence. Nothing outside the legal pages has a placeholder left.
- [ ] `sales-terms.html` — 8 placeholders: reservation and deposit, payment methods, inspection and test drive, documents and ownership transfer, warranty, reservation cancellation and refunds, price validity, additional costs.
- [ ] `terms.html` — 5 placeholders: self-drive age requirement, whether the licence is checked in person at pickup, what happens when a driver is booked, deposit and payment terms, fuel and mileage terms.
- [ ] `cancellation.html` — 3 placeholders: cancellation notice period, deposit terms, refunds.
- [ ] `privacy.html` — 2 placeholders: how long a message containing a licence number is kept, and how ID numbers must be handled / whether Data Protection Commission registration applies.
- [ ] Also confirm the assumptions listed in item 10 above: whether a driver is offered, and whether the licence is checked in person at pickup.

### 6. Google Search Console
- [ ] Deploy the site, then add the property in Google Search Console using a DNS TXT record (recommended) or an HTML-tag verification file.
- [ ] Submit `sitemap.xml` once `YOUR-DOMAIN` has been replaced.
- [ ] Run the URL Inspection tool on `/` and `/index.html` and request indexing of both.
- [ ] Fix anything reported under "Enhancements" (mobile usability, HTTPS, structured data — the Car and LocalBusiness JSON-LD should validate).
- [ ] Confirm in the Page Indexing report that `404.html` is being used for missing pages (Netlify and Vercel serve `404.html` automatically), so soft 404s are not indexed.

### 7. Final pass
- [ ] Load every page in both themes at 360px, 768px and 1280px.
- [ ] Search for a car from the header search box, and check the `See all results` hand-off to `buy.html`.
- [ ] Send a test booking request on WhatsApp and one by email, and check both messages arrive with the driver's licence number present only for "Without driver".
- [ ] Check the browser console is clean on every page.

## Site facts in one place
- `js/data.js` — `window.SITE` (business facts), `window.CARS` (rentals), `window.FOR_SALE` (cars for sale).
- `js/site.js` — reads `window.SITE` and fills or removes the `data-site` elements in the HTML. Never invents a value.
- `js/main.js` — `window.REVIEWS` (empty), rental cards, the booking form and its WhatsApp/email message.
- `js/sale.js` — sale listing cards, filters, the details dialog and its gallery.
- `js/search.js` — the header search box on every page.
- `js/theme.js` — runs in the `<head>`, sets the theme before the first paint.

## Contact details used
- WhatsApp/phone: 020 409 2665 (wa.me/233204092665), 024 402 8905 (wa.me/233244028905)
- Email: Mitchjnr21@gmail.com
- Location: GA-469-5802, Accra, Ghana

## Security notes
- No cookies or trackers are enabled by default.
- Keep `.env` files out of version control.
- If analytics or cookies are later added, review your consent and disclosure requirements before launch.
- Car sale enquiries do not collect ID or licence numbers, and the site does not take online payments or deposits.
- Rental bookings ask for a driver's licence number only for self-drive rentals. The number is never stored in the browser, logged, added to a URL or posted to the optional booking endpoint; it only appears in the WhatsApp or email message the visitor sends. See item 10 above.

## Latest fixes (pre-launch cleanup)
- Repaired the headers of buy, privacy, terms, cancellation and sales-terms pages.
- Hero overlay lightened so the background photo is clearly visible; text stays readable.
- Car photos are optimized 4:3 WebP files in `images/cars/<car>/exterior-1.webp`. Originals are in `images/original/`.
- New sharp logo and icons, social image (`images/og-image.png`), `404.html`, canonical and social tags, business JSON-LD.
- Security headers (including a Content-Security-Policy) in `netlify.toml` and `vercel.json`.
- Retired `images/hero-background.webp` (a US-style dealership with flags and edited signs, not this business). It now lives in `images/original/` and is no longer referenced. The hero photo is defined in one place, `--hero-photo` in `css/styles.css`, and is empty until the owner supplies their own photo.
- All hero panels (home page, cars-for-sale, the four legal pages and 404) now share the same photo-free design: flat `#111111`, the brand logo shown large, and a CSS gold accent.
- Added `window.SITE` in `js/data.js` and `js/site.js` so business facts are edited in one file and nothing unconfirmed is ever displayed.
- Removed every `[PLACEHOLDER]` from the live pages. They remain only on the four legal pages, for the owner to decide.
- Fixed a horizontal overflow in the site header between 721px and 1000px.

## Retired files
- `images/original/hero-background.webp` and `images/original/hero-background.png` — the old hero background. Not used by the site; kept only as the original download.
#   m i t c h j h a y  
 