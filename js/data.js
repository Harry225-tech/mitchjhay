/*
 * Shared data for the whole site.
 *
 * This file is loaded (with `defer`) before js/site.js, js/main.js, js/sale.js and js/search.js,
 * so all of them read the same values. Add a fact here, in this one file, and it appears
 * everywhere it is used.
 *
 *   window.SITE     facts about the business (read by js/site.js)
 *   window.CARS     confirmed rental vehicles   (read by js/main.js and js/search.js)
 *   window.FOR_SALE confirmed cars for sale     (read by js/sale.js and js/search.js)
 *
 * Rules for the data:
 * - Every fact is EMPTY here on purpose. Nothing has been confirmed by the owner yet, and a
 *   guessed price, seat count, hour or payment method is worse than no information at all.
 * - js/site.js removes any block whose value is empty, so a visitor never sees an empty line,
 *   an empty section or a placeholder.
 * - `id` is the URL-safe fragment used for links from the search. It must be unique.
 * - Rental photos: `image` points at the WebP photo. `fallback` names the silhouette symbol in the
 *   hidden SVG sprite (`car-sedan`, `car-suv`, `car-van`, `car-pickup`).
 * - Sale photos: `photos.exterior` / `photos.interior` arrays of `{ path, alt }`. Empty lists
 *   render as a silhouette.
 */

/*
 * Business facts. Fill in a field ONLY once the owner has confirmed it, then save the file.
 * Strings only. Leave a field as '' to keep it off the site.
 */
window.SITE = {
  // Opening hours, written as one line of plain text. Shown in the top information bar, in the
  // Contact section and in the footer. Leave '' and none of the three appear.
  hours: '',
  // Short second line under the opening hours, e.g. a note about replies outside those hours.
  hoursNote: '',
  // The payment methods the business actually accepts, as one short sentence. Shown as a line in
  // the FAQ on index.html and in terms.html. Never list a method the business does not take.
  payments: '',
  // About us text for the "About us" section on index.html. Put a blank line between paragraphs.
  // Leave '' and the section and its navigation link are removed.
  about: '',
  // Optional photo for the "About us" section, e.g. 'images/about.webp'. Crop it to 4:3 so the
  // width and height attributes match the picture. Leave '' and no photo is shown.
  aboutPhoto: '',
  // Full profile URLs only. Any network left as '' is never shown, and the footer icon block is
  // removed when every one of them is empty.
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    x: '',
    youtube: ''
  },
  // Link to the page where customers can leave a Google review. Leave '' and the
  // "Leave a Google review" link is removed.
  googleReviewUrl: ''
};

/*
 * Rental vehicles. Copy the whole block, change the values and leave anything unconfirmed
 * empty: the card then shows "Ask us" instead of a guess.
 */
window.CARS = [
  {
    id: 'hyundai-elantra',
    name: 'Hyundai Elantra',
    type: 'Sedan',
    price: null, // Daily rate as a number in GHS, e.g. 0. null or '' shows "Ask us".
    seats: '', // Number of seats. '' leaves it out and the card shows "Ask us".
    transmission: '', // e.g. 'Automatic'. '' leaves it out.
    fuel: '', // e.g. 'Petrol'. '' leaves it out.
    year: '', // Model year as a number, e.g. 0. '' leaves it out.
    color: '', // Body colour. '' leaves it out.
    driverOption: '', // 'With driver', 'Without driver' or 'Both'. '' leaves it out.
    image: 'images/cars/hyundai-elantra/exterior-1.webp',
    width: 736,
    height: 552,
    focus: '50% 55%',
    fallback: 'car-sedan',
    /*
     * Optional photo lists for when a rental car details view is built. There is no rental
     * details dialog on the site yet: the cards show the single `image` above, so a `photos`
     * block here is not rendered. It is kept as the shape to copy when one is added.
     *
     * photos: {
     *   exterior: [
     *     { path: 'images/cars/hyundai-elantra/exterior-1.webp', alt: 'Hyundai Elantra, front and side view' }
     *   ],
     *   interior: [
     *     { path: 'images/cars/hyundai-elantra/interior-1.webp', alt: 'Hyundai Elantra, front seats and dashboard' }
     *   ]
     * }
     */
  },
  {
    id: 'toyota-corolla',
    name: 'Toyota Corolla',
    type: 'Sedan',
    price: null, // Daily rate as a number in GHS, e.g. 0. null or '' shows "Ask us".
    seats: '', // Number of seats. '' leaves it out and the card shows "Ask us".
    transmission: '', // e.g. 'Automatic'. '' leaves it out.
    fuel: '', // e.g. 'Petrol'. '' leaves it out.
    year: '', // Model year as a number, e.g. 0. '' leaves it out.
    color: '', // Body colour. '' leaves it out.
    driverOption: '', // 'With driver', 'Without driver' or 'Both'. '' leaves it out.
    image: 'images/cars/toyota-corolla/exterior-1.webp',
    width: 1000,
    height: 750,
    focus: '50% 55%',
    fallback: 'car-sedan'
  },
  {
    id: 'toyota-rav4',
    name: 'Toyota RAV4',
    type: 'SUV',
    price: null, // Daily rate as a number in GHS, e.g. 0. null or '' shows "Ask us".
    seats: '', // Number of seats. '' leaves it out and the card shows "Ask us".
    transmission: '', // e.g. 'Automatic'. '' leaves it out.
    fuel: '', // e.g. 'Petrol'. '' leaves it out.
    year: '', // Model year as a number, e.g. 0. '' leaves it out.
    color: '', // Body colour. '' leaves it out.
    driverOption: '', // 'With driver', 'Without driver' or 'Both'. '' leaves it out.
    image: 'images/cars/toyota-rav4/exterior-1.webp',
    width: 1200,
    height: 900,
    focus: '50% 50%',
    fallback: 'car-suv'
  }
];

// Add only owner-confirmed listings here. `status` is "available", "reserved" or "sold".
window.FOR_SALE = [];