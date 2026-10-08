const SALE_WHATSAPP = '233204092665';
const SALE_EMAIL = 'Mitchjnr21@gmail.com';
const SHOW_SOLD = false;

// Add only owner-confirmed listings and photos here. Empty photo lists render as a silhouette.
const FOR_SALE = [];

const saleState = { opener: null, photoIndex: 0, photoTab: 'exterior', selectedCar: null };
const saleDialog = document.getElementById('saleDialog');
const saleDialogContent = document.getElementById('saleDialogContent');
const saleDialogTitle = document.getElementById('saleDialogTitle');
const saleGrid = document.getElementById('saleGrid');
const saleEmpty = document.getElementById('saleEmpty');
const saleCount = document.getElementById('saleCount');

function saleEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
}

function saleValue(value) {
  return value === undefined || value === null || value === '' ? 'Ask us' : saleEscape(value);
}

function carTitle(car) {
  return [car.make, car.model, car.year].filter(Boolean).join(' ') || 'Car details';
}

function firstPhoto(car) {
  return car.photos && Array.isArray(car.photos.exterior)
    ? car.photos.exterior.find(function (photo) { return photo && photo.path; }) || null
    : null;
}

function optionValues(key) {
  return Array.from(new Set(FOR_SALE.map(function (car) {
    return car[key];
  }).filter(Boolean))).sort();
}

function setOptions(id, values, label) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">' + saleEscape(label) + '</option>' + values.map(function (value) {
    return '<option value="' + saleEscape(value) + '">' + saleEscape(value) + '</option>';
  }).join('');
}

function statusLabel(status) {
  if (status === 'sold') return 'Sold';
  if (status === 'reserved') return 'Reserved';
  if (status === 'available') return 'Available';
  return 'Ask us about availability';
}

function renderCards() {
  const search = document.getElementById('saleSearch').value.trim().toLowerCase();
  const bodyType = document.getElementById('saleBodyType').value;
  const make = document.getElementById('saleMake').value;
  const transmission = document.getElementById('saleTransmission').value;
  const fuel = document.getElementById('saleFuel').value;
  const minPrice = Number(document.getElementById('saleMinPrice').value);
  const maxPrice = Number(document.getElementById('saleMaxPrice').value);
  const minYear = Number(document.getElementById('saleMinYear').value);
  const maxYear = Number(document.getElementById('saleMaxYear').value);
  const sort = document.getElementById('saleSort').value;

  const cars = FOR_SALE.filter(function (car) {
    if (!SHOW_SOLD && car.status === 'sold') return false;
    const searchable = [car.make, car.model, car.year, car.bodyType, car.transmission, car.fuel, car.color, car.location].join(' ').toLowerCase();
    return (!search || searchable.includes(search))
      && (!bodyType || car.bodyType === bodyType)
      && (!make || car.make === make)
      && (!transmission || car.transmission === transmission)
      && (!fuel || car.fuel === fuel)
      && (!minPrice || (Number.isFinite(Number(car.price)) && Number(car.price) >= minPrice))
      && (!maxPrice || (Number.isFinite(Number(car.price)) && Number(car.price) <= maxPrice))
      && (!minYear || (Number.isFinite(Number(car.year)) && Number(car.year) >= minYear))
      && (!maxYear || (Number.isFinite(Number(car.year)) && Number(car.year) <= maxYear));
  });

  cars.sort(function (a, b) {
    const statusPriority = { available: 0, reserved: 1, sold: 2 };
    const priorityDifference = (statusPriority[a.status] == null ? 3 : statusPriority[a.status])
      - (statusPriority[b.status] == null ? 3 : statusPriority[b.status]);
    if (priorityDifference) return priorityDifference;
    if (sort === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
    if (sort === 'newest') return Number(b.year || 0) - Number(a.year || 0);
    if (sort === 'mileage') return Number(a.mileageKm || Infinity) - Number(b.mileageKm || Infinity);
    return Number(a.price || 0) - Number(b.price || 0);
  });

  saleCount.textContent = cars.length + (cars.length === 1 ? ' car found' : ' cars found');
  saleEmpty.hidden = cars.length > 0;
  saleEmpty.querySelector('h3').textContent = FOR_SALE.length
    ? 'No cars match these filters right now.'
    : 'No cars for sale are listed right now.';
  saleEmpty.querySelector('p').textContent = FOR_SALE.length
    ? 'Tell us what you are looking for and we can respond to your enquiry.'
    : 'Tell us what you are looking for and we can let you know if a suitable car becomes available.';
  saleGrid.innerHTML = cars.map(function (car) {
    const photo = firstPhoto(car);
    const photoMarkup = photo
      ? '<img src="' + saleEscape(photo.path) + '" alt="' + saleEscape(photo.alt || (carTitle(car) + ', exterior photo')) + '" loading="lazy" width="1200" height="900">'
      : '<div class="sale-silhouette" aria-label="No car photo available yet"><svg viewBox="0 0 120 50" aria-hidden="true"><use href="#car-sedan"></use></svg><span>Photos coming soon</span></div>';
    const similarLabel = car.status === 'sold' ? 'Ask about similar cars' : 'Ask about this car';
    return '<article class="sale-card">'
      + '<div class="sale-card-photo">' + photoMarkup + '</div>'
      + '<div class="sale-card-body">'
      + '<p class="sale-status sale-status-' + saleEscape(car.status || 'ask-us') + '">' + saleEscape(statusLabel(car.status)) + '</p>'
      + '<h3>' + saleEscape(car.make) + ' ' + saleEscape(car.model) + '</h3>'
      + '<p class="sale-card-price">' + (car.price == null ? 'Ask us<span class="sale-card-price-note">for the price</span>' : 'GHS ' + saleEscape(car.price)) + '</p>'
      + '<p class="sale-card-meta">' + saleValue(car.year) + ' · ' + (car.mileageKm == null ? 'Ask us for mileage' : saleEscape(car.mileageKm) + ' km') + ' · ' + saleValue(car.transmission) + ' · ' + saleValue(car.fuel) + '</p>'
      + '<p class="sale-card-meta">' + saleValue(car.location) + '</p>'
      + '<div class="sale-card-actions"><a class="btn btn-secondary dark" href="#' + saleEscape(car.id) + '" data-sale-open="' + saleEscape(car.id) + '">View details</a>'
      + '<button class="btn btn-primary" type="button" data-sale-ask="' + saleEscape(car.id) + '">' + similarLabel + '</button></div>'
      + '</div></article>';
  }).join('');
}

function allPhotos(car, tab) {
  const photos = car.photos && Array.isArray(car.photos[tab]) ? car.photos[tab] : [];
  return photos.filter(function (photo) { return photo && photo.path; });
}

function currentPhotos() {
  return allPhotos(saleState.selectedCar, saleState.photoTab);
}

function updateGallery() {
  const photos = currentPhotos();
  const selected = photos[saleState.photoIndex];
  const main = saleDialogContent.querySelector('[data-gallery-main]');
  const thumbs = saleDialogContent.querySelector('[data-gallery-thumbs]');
  const counter = saleDialogContent.querySelector('[data-gallery-counter]');
  if (selected) {
    main.innerHTML = '<img src="' + saleEscape(selected.path) + '" alt="' + saleEscape(selected.alt || (carTitle(saleState.selectedCar) + ', ' + saleState.photoTab + ' photo')) + '" width="1200" height="900">';
    counter.textContent = (saleState.photoIndex + 1) + ' of ' + photos.length;
  } else {
    main.innerHTML = '<div class="sale-silhouette" aria-label="No ' + saleEscape(saleState.photoTab) + ' photos available"><svg viewBox="0 0 120 50" aria-hidden="true"><use href="#car-sedan"></use></svg><span>No ' + saleEscape(saleState.photoTab) + ' photos available</span></div>';
    counter.textContent = '0 of 0';
  }
  thumbs.innerHTML = photos.map(function (photo, index) {
    return '<button class="sale-thumbnail' + (index === saleState.photoIndex ? ' is-selected' : '') + '" type="button" data-photo-index="' + index + '" aria-label="Show photo ' + (index + 1) + '">'
      + '<img src="' + saleEscape(photo.path) + '" alt="' + saleEscape(photo.alt || (carTitle(saleState.selectedCar) + ', photo ' + (index + 1))) + '" width="120" height="80"></button>';
  }).join('');
  saleDialogContent.querySelector('[data-gallery-prev]').disabled = photos.length < 2;
  saleDialogContent.querySelector('[data-gallery-next]').disabled = photos.length < 2;
}

function openCar(car, opener) {
  saleState.selectedCar = car;
  saleState.opener = opener || document.activeElement;
  saleState.photoTab = 'exterior';
  saleState.photoIndex = 0;
  saleDialogTitle.textContent = carTitle(car);
  const detailTitle = carTitle(car) + ' for Sale | Mitch Jhay Auto & Rentals';
  const detailDescription = 'Ask about ' + carTitle(car) + ' for sale in Accra with Mitch Jhay Auto & Rentals, or arrange a viewing.';
  document.title = detailTitle;
  document.getElementById('saleMetaDescription').content = detailDescription;
  document.getElementById('saleOgTitle').content = detailTitle;
  document.getElementById('saleOgDescription').content = detailDescription;
  const specRows = [
    ['Year', car.year], ['Mileage', car.mileageKm == null ? null : car.mileageKm + ' km'],
    ['Engine', car.engine], ['Transmission', car.transmission], ['Fuel', car.fuel],
    ['Body type', car.bodyType], ['Color', car.color], ['Condition', car.condition],
    ['Location', car.location], ['Documents', car.documentsNote]
  ];
  const whatsappText = encodeURIComponent('Hello Mitch Jhay Auto & Rentals, I would like to ask about ' + carTitle(car) + '. Price: ' + (car.price == null ? 'please confirm' : 'GHS ' + car.price) + '.');
  const features = Array.isArray(car.keyFeatures) && car.keyFeatures.length
    ? '<ul class="sale-feature-list">' + car.keyFeatures.map(function (feature) { return '<li>' + saleEscape(feature) + '</li>'; }).join('') + '</ul>'
    : '<p>Ask us about the car features.</p>';

  saleDialogContent.innerHTML = '<div class="sale-detail-layout">'
    + '<div class="sale-gallery">'
    + '<div class="sale-photo-tabs" role="tablist" aria-label="Car photo category">'
    + '<button type="button" role="tab" aria-selected="true" data-photo-tab="exterior">Body</button>'
    + '<button type="button" role="tab" aria-selected="false" data-photo-tab="interior">Interior</button></div>'
    + '<div class="sale-gallery-main" data-gallery-main></div>'
    + '<div class="sale-gallery-controls"><button type="button" data-gallery-prev aria-label="Previous photo">Previous</button><span data-gallery-counter aria-live="polite"></span><button type="button" data-gallery-next aria-label="Next photo">Next</button></div>'
    + '<div class="sale-thumbnails" data-gallery-thumbs></div></div>'
    + '<div class="sale-detail-info"><p class="sale-status sale-status-' + saleEscape(car.status || 'ask-us') + '">' + saleEscape(statusLabel(car.status)) + '</p>'
    + '<p class="sale-detail-price">' + (car.price == null ? 'Ask us for price' : 'GHS ' + saleEscape(car.price)) + (car.priceNegotiable === true ? ' · Negotiable' : car.priceNegotiable === false ? ' · Price not marked negotiable' : ' · Ask about price') + '</p>'
    + '<p>' + saleValue(car.shortDescription) + '</p>'
    + '<table class="sale-spec-table"><tbody>' + specRows.map(function (row) {
      return '<tr><th scope="row">' + saleEscape(row[0]) + '</th><td>' + saleValue(row[1]) + '</td></tr>';
    }).join('') + '</tbody></table>'
    + '<h3>Key features</h3>' + features
    + '<p><a href="sales-terms.html">Read the terms of sale</a></p>'
    + '<div class="sale-detail-actions"><a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="https://wa.me/' + SALE_WHATSAPP + '?text=' + whatsappText + '">Ask on WhatsApp</a>'
    + '<a class="btn btn-secondary dark" href="tel:+233204092665">Call us</a>'
    + '<button class="btn btn-secondary dark" type="button" data-book-viewing="' + saleEscape(car.id) + '">Book a viewing</button></div>'
    + '<form class="sale-enquiry-form sale-dialog-form" data-sale-form novalidate>'
    + '<h3>Ask or request a viewing</h3>'
    + '<label><span>Name</span><input type="text" name="name" autocomplete="name"></label>'
    + '<label><span>Phone</span><input type="tel" name="phone" autocomplete="tel" placeholder="e.g. 024 123 4567"></label>'
    + '<label><span>Car</span><input type="text" name="car" value="' + saleEscape(carTitle(car)) + ' — GHS ' + saleEscape(car.price == null ? 'Ask us' : car.price) + '" readonly></label>'
    + '<label><span>Preferred viewing date</span><input type="date" name="viewDate"></label>'
    + '<label><span>Preferred viewing time</span><input type="time" name="viewTime"></label>'
    + '<label><span>Message (optional)</span><textarea name="message" rows="3"></textarea></label>'
    + '<div class="sale-consent"><label><input type="checkbox" name="consent"><span>I agree to be contacted and have read the <a href="privacy.html">Privacy Policy</a>.</span></label></div>'
    + '<div class="sale-honeypot" aria-hidden="true"><label>Leave this blank<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>'
    + '<p class="sale-form-error" role="alert" aria-live="polite"></p><p class="sale-form-success" role="status" aria-live="polite"></p>'
    + '<div class="sale-form-actions"><button class="btn btn-primary" type="submit" data-channel="whatsapp">Send on WhatsApp</button><button class="btn btn-secondary dark" type="submit" data-channel="email">Send by email</button></div></form></div></div>';
  updateGallery();
  saleDialog.showModal();
  const firstFocusable = saleDialog.querySelector('[data-close-dialog]');
  if (firstFocusable) firstFocusable.focus();
}

function closeDialog() {
  if (saleDialog.open) saleDialog.close();
}

function setSaleStatus(form, message, type) {
  form.querySelector('.sale-form-error').textContent = type === 'error' ? message : '';
  form.querySelector('.sale-form-success').textContent = type === 'success' ? message : '';
}

function openSaleWhatsApp(url) {
  const popup = window.open(url, '_blank');
  if (!popup) return false;
  popup.opener = null;
  return true;
}

function processEnquiry(form, channel) {
  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();
  const car = form.elements.car.value.trim();
  const viewDate = form.elements.viewDate.value;
  const viewTime = form.elements.viewTime.value;
  const message = form.elements.message.value.trim();
  if (form.elements.website.value.trim()) {
    setSaleStatus(form, 'Your message was blocked as spam.', 'error');
    return;
  }
  if (!name) {
    setSaleStatus(form, 'Please enter your name.', 'error');
    form.elements.name.focus();
    return;
  }
  if (!/^\+?[0-9\s()\-]{7,}$/.test(phone)) {
    setSaleStatus(form, 'Please enter a valid phone number.', 'error');
    form.elements.phone.focus();
    return;
  }
  if (viewDate) {
    const date = new Date(viewDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(date.getTime()) || date < today) {
      setSaleStatus(form, 'Please choose today or a future viewing date.', 'error');
      form.elements.viewDate.focus();
      return;
    }
  }
  if (!form.elements.consent.checked) {
    setSaleStatus(form, 'Please agree to be contacted about this enquiry.', 'error');
    form.elements.consent.focus();
    return;
  }
  const lines = [
    'Hello Mitch Jhay Auto & Rentals, I have a car sales enquiry.',
    'Name: ' + name,
    'Phone: ' + phone,
    'Car or request: ' + (car || 'Please advise'),
    'Preferred viewing: ' + (viewDate || 'Not specified') + (viewTime ? ' at ' + viewTime : '')
  ];
  if (message) lines.push('Message: ' + message);
  const body = lines.join('\n');
  setSaleStatus(form, '', '');
  if (channel === 'email') {
    window.location.href = 'mailto:' + SALE_EMAIL + '?subject=' + encodeURIComponent('Car sales enquiry') + '&body=' + encodeURIComponent(body);
    setSaleStatus(form, 'Your email draft is ready. Please review and send it to complete your enquiry.', 'success');
    return;
  }
  const opened = openSaleWhatsApp('https://wa.me/' + SALE_WHATSAPP + '?text=' + encodeURIComponent(body));
  if (!opened) {
    setSaleStatus(form, 'Your browser blocked the WhatsApp window. Please call us or send your enquiry by email.', 'error');
    return;
  }
  setSaleStatus(form, 'Your enquiry is ready on WhatsApp. Please send it to complete your request.', 'success');
}

function saleJsonLd() {
  const items = FOR_SALE.filter(function (car) {
    return car.status !== 'sold' || SHOW_SOLD;
  }).map(function (car, index) {
    const photos = (car.photos && Array.isArray(car.photos.exterior) ? car.photos.exterior : [])
      .concat(car.photos && Array.isArray(car.photos.interior) ? car.photos.interior : []);
    const item = {
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Car',
        name: carTitle(car),
        url: window.location.href.split('#')[0] + '#' + encodeURIComponent(car.id)
      }
    };
    const vehicle = item.item;
    if (car.make) vehicle.brand = { '@type': 'Brand', name: car.make };
    if (car.model) vehicle.model = car.model;
    if (car.year) vehicle.vehicleModelDate = String(car.year);
    if (car.mileageKm != null) vehicle.mileageFromOdometer = { '@type': 'QuantitativeValue', value: car.mileageKm, unitCode: 'KMT' };
    if (car.fuel) vehicle.fuelType = car.fuel;
    if (car.transmission) vehicle.vehicleTransmission = car.transmission;
    if (car.color) vehicle.color = car.color;
    if (photos.length) vehicle.image = photos.map(function (photo) { return new URL(photo.path, window.location.href).href; });
    if (car.price != null) {
      const availability = car.status === 'sold' ? 'https://schema.org/OutOfStock' : car.status === 'reserved' ? 'https://schema.org/Reserved' : car.status === 'available' ? 'https://schema.org/InStock' : null;
      vehicle.offers = { '@type': 'Offer', price: car.price, priceCurrency: 'GHS' };
      if (availability) vehicle.offers.availability = availability;
    }
    return item;
  });
  document.getElementById('saleStructuredData').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items
  });
}

function openFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const car = FOR_SALE.find(function (entry) { return entry.id === id; });
  if (car && (SHOW_SOLD || car.status !== 'sold') && !saleDialog.open) {
    const opener = Array.from(saleGrid.querySelectorAll('[data-sale-open]')).find(function (button) {
      return button.dataset.saleOpen === car.id;
    });
    openCar(car, opener);
  }
}

setOptions('saleBodyType', optionValues('bodyType'), 'All body types');
setOptions('saleMake', optionValues('make'), 'All makes');
setOptions('saleTransmission', optionValues('transmission'), 'Any transmission');
setOptions('saleFuel', optionValues('fuel'), 'Any fuel');
document.querySelectorAll('#saleFilters input, #saleFilters select').forEach(function (control) {
  control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', renderCards);
});
document.getElementById('saleFilters').addEventListener('submit', function (event) {
  event.preventDefault();
});
renderCards();
saleJsonLd();

saleGrid.addEventListener('click', function (event) {
  const openButton = event.target.closest('[data-sale-open]');
  if (openButton) {
    const car = FOR_SALE.find(function (entry) { return entry.id === openButton.dataset.saleOpen; });
    if (car) {
      saleState.opener = openButton;
      if (window.location.hash !== '#' + encodeURIComponent(car.id)) window.location.hash = car.id;
      openCar(car, openButton);
    }
    return;
  }
  const askButton = event.target.closest('[data-sale-ask]');
  if (askButton) {
    const car = FOR_SALE.find(function (entry) { return entry.id === askButton.dataset.saleAsk; });
    if (car) {
      const request = car.status === 'sold'
        ? 'I am looking for a car similar to the ' + carTitle(car) + '. Please let me know what you have available.'
        : 'I am interested in ' + carTitle(car) + ', listed at ' + (car.price == null ? 'a price to confirm' : 'GHS ' + car.price) + '. Please let me know its current availability.';
      const message = encodeURIComponent('Hello Mitch Jhay Auto & Rentals, ' + request);
      openSaleWhatsApp('https://wa.me/' + SALE_WHATSAPP + '?text=' + message);
    }
  }
});

saleGrid.addEventListener('error', function (event) {
  if (event.target.matches('img')) {
    event.target.outerHTML = '<div class="sale-silhouette" aria-label="Car photo unavailable"><svg viewBox="0 0 120 50" aria-hidden="true"><use href="#car-sedan"></use></svg><span>Photo unavailable</span></div>';
  }
}, true);

saleDialogContent.addEventListener('error', function (event) {
  if (!event.target.matches('img')) return;
  const wrapper = event.target.closest('[data-gallery-main]');
  if (wrapper) {
    wrapper.innerHTML = '<div class="sale-silhouette" aria-label="Car photo unavailable"><svg viewBox="0 0 120 50" aria-hidden="true"><use href="#car-sedan"></use></svg><span>Photo unavailable</span></div>';
    return;
  }
  const thumbnail = event.target.closest('[data-photo-index]');
  if (thumbnail) thumbnail.remove();
}, true);

document.querySelector('[data-close-dialog]').addEventListener('click', closeDialog);
saleDialog.addEventListener('close', function () {
  document.title = 'Cars for Sale in Accra | Mitch Jhay Auto & Rentals';
  const listingDescription = 'Browse cars currently offered for sale by Mitch Jhay Auto & Rentals in Accra, Ghana. Ask about a car or arrange a viewing.';
  document.getElementById('saleMetaDescription').content = listingDescription;
  document.getElementById('saleOgTitle').content = 'Cars for Sale | Mitch Jhay Auto & Rentals';
  document.getElementById('saleOgDescription').content = listingDescription;
  if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
  if (saleState.opener && saleState.opener.isConnected) saleState.opener.focus();
});
saleDialog.addEventListener('click', function (event) {
  if (event.target === saleDialog) closeDialog();
  const tab = event.target.closest('[data-photo-tab]');
  if (tab) {
    saleState.photoTab = tab.dataset.photoTab;
    saleState.photoIndex = 0;
    saleDialogContent.querySelectorAll('[data-photo-tab]').forEach(function (button) {
      button.setAttribute('aria-selected', String(button === tab));
    });
    updateGallery();
  }
  const thumbnail = event.target.closest('[data-photo-index]');
  if (thumbnail) {
    saleState.photoIndex = Number(thumbnail.dataset.photoIndex);
    updateGallery();
  }
  if (event.target.closest('[data-gallery-prev]')) {
    const count = currentPhotos().length;
    if (count) saleState.photoIndex = (saleState.photoIndex - 1 + count) % count;
    updateGallery();
  }
  if (event.target.closest('[data-gallery-next]')) {
    const count = currentPhotos().length;
    if (count) saleState.photoIndex = (saleState.photoIndex + 1) % count;
    updateGallery();
  }
  const bookButton = event.target.closest('[data-book-viewing]');
  if (bookButton) {
    const form = saleDialogContent.querySelector('[data-sale-form]');
    form.scrollIntoView({ block: 'start' });
    form.elements.name.focus();
  }
});
saleDialogContent.addEventListener('keydown', function (event) {
  if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  const currentTab = saleDialogContent.querySelector('[data-photo-tab][aria-selected="true"]');
  if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight')
      && currentTab && (event.target === currentTab || event.target.getAttribute('role') === 'tab')) {
    event.preventDefault();
    const tabs = Array.from(saleDialogContent.querySelectorAll('[data-photo-tab]'));
    const nextIndex = (tabs.indexOf(currentTab) + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
    return;
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const count = currentPhotos().length;
    if (!count) return;
    event.preventDefault();
    saleState.photoIndex = event.key === 'ArrowRight'
      ? (saleState.photoIndex + 1) % count
      : (saleState.photoIndex - 1 + count) % count;
    updateGallery();
  }
});
saleDialogContent.addEventListener('submit', function (event) {
  const form = event.target.closest('[data-sale-form]');
  if (!form) return;
  event.preventDefault();
  processEnquiry(form, event.submitter ? event.submitter.dataset.channel : 'whatsapp');
});
document.querySelectorAll('[data-sale-form]').forEach(function (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    processEnquiry(form, event.submitter ? event.submitter.dataset.channel : 'whatsapp');
  });
});
window.addEventListener('hashchange', openFromHash);
openFromHash();
