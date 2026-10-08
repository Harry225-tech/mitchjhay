# Mitch Jhay Auto & Rentals website

Static site (HTML, CSS, JavaScript). No build step, no dependencies.

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and visit http://localhost:8000.

## Deploy
- Netlify: drag this whole folder onto app.netlify.com/drop.
- Vercel: run `vercel` in this folder, or import the folder from the dashboard.

## Edit before launch
1. Fleet: `js/main.js` holds the `CARS` list of rental vehicles. Three cars are listed — Hyundai Elantra, Toyota Corolla (Sedan) and Toyota RAV4 (SUV) — with only the make, model and body type confirmed. Add further cars here only when the owner confirms them. Leave `price`, `seats`, `transmission` or `fuel` as `null`/`''` when unconfirmed: the page then shows "Ask us" instead of a guess, disables price sorting, and sends a rate-confirmation request rather than an estimate.
2. Rental photos: `CARS[].image` points at the vehicle photo (WebP preferred, about 1200px wide, under 150 KB each, in `images/`). The three listed photos are the real cars above. A car whose `image` fails to load falls back to the SVG silhouette named by its `fallback` field (`car-sedan`, `car-suv`, `car-van`, `car-pickup`).
3. Hero background: replace `images/hero-background.webp` with your chosen background image, keeping the same filename, or update the `url(...)` in the `.hero-bg` rule in `css/styles.css` (it is also repeated in the `max-width: 720px` media query). The dark overlay helps keep the hero text readable.
4. Reviews: leave the `REVIEWS` list empty unless you have verified customer feedback to publish.
5. Legal pages: review `privacy.html`, `terms.html`, and `cancellation.html` before publishing.
6. Sale cars: open `js/sale.js` and add only owner-confirmed vehicles to `FOR_SALE`. Each object uses `id`, `make`, `model`, `year`, `price` (GHS), `priceNegotiable`, `mileageKm`, `transmission`, `fuel`, `bodyType`, `color`, `engine`, `condition`, `location`, `shortDescription`, `keyFeatures`, `status`, `photos: { exterior, interior }`, and `documentsNote`. Use `status: "available"`, `"reserved"`, or `"sold"`; change `SHOW_SOLD` to control whether sold cars appear. Leave unknown facts empty so the page displays "Ask us"; do not guess.
7. Sale photos: the rental photos are not sale photos. Do not reuse a rental vehicle's photo on a sale listing. Place the confirmed sale car's photos in `images/sale/<car-id>/` and list each `{ path, alt }` in the car's `photos.exterior` and `photos.interior` arrays. Take photos in daylight with a clean car. Exterior angles: front three-quarter, side, rear, and wheels or front. Interior angles: dashboard and steering wheel, front seats, back seats, and boot or luggage space. Use only photos you took yourself, blur number plates, export as WebP at 1200px wide, and keep each image under 150 KB. Read `images/sale/README.txt` for naming examples.
8. Sale terms: confirm every `[PLACEHOLDER: confirm with owner]` in `sales-terms.html` before launch.
9. Domain: `sitemap.xml` currently uses relative paths as requested. Replace them with absolute URLs when the production domain is known; then add canonical and OG URL metadata.
10. Driver's licence number (self-drive rentals): the booking form in `index.html` asks for a driver's licence number only when the visitor picks "Without driver". `js/main.js` puts it only in the WhatsApp or email message the visitor sends; it is never posted to `BOOKING_ENDPOINT`, never stored in the browser, never logged and never added to a URL. Confirm these points with the owner before launch:
    1. Whether a driver is actually offered: `[PLACEHOLDER: confirm with owner]`. The booking note in `index.html` and the `Driver: provided by Mitch Jhay Auto & Rentals` line in `js/main.js` both assume it is.
    2. Whether the licence is checked in person at pickup: `[PLACEHOLDER: confirm with owner]`. This is the hint shown under the licence field.
    3. How long a message containing a licence number is kept: `[PLACEHOLDER: confirm with owner]`. See `privacy.html`.
    4. `[PLACEHOLDER: confirm with a qualified person in Ghana how ID numbers must be handled and whether Data Protection Commission registration applies]`. See `privacy.html`.

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

## Before you launch (new placeholders)
- Replace every `YOUR-DOMAIN` in the HTML head tags, `sitemap.xml`, `robots.txt` and the JSON-LD in `index.html`.
- Replace the Toyota Corolla photo with a photo of your own car (the current one looks like a manufacturer image).
- Fill in price, seats, transmission and fuel for each car in `js/main.js`.
