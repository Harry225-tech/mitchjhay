const WA = '233204092665';
const MAIL = 'Mitchjnr21@gmail.com';
const BOOKING_ENDPOINT = '';

// Driver's licence: asked for only on self-drive ("Without driver") bookings. The value is
// used only in the WhatsApp or email message the visitor chooses to send. This script never
// posts it, never stores it in the browser, never logs it and never adds it to a URL.
// [PLACEHOLDER: confirm with owner that a driver is offered.]
const DRIVER_WITHOUT = 'Without driver';
const DRIVER_WITH = 'With driver';
const LICENCE_PATTERN = /^[A-Z0-9\-\/ ]{5,20}$/;
const LICENCE_REQUIRED_NOTICE = "Driver's licence number is required when renting without a driver";
const LICENCE_ERROR_TEXT = "Enter your driver's licence number exactly as it appears on your licence.";

// Confirmed rental vehicles. Add a car here only once the owner confirms it is available.
// Leave price, seats, transmission or fuel empty when not confirmed; the page then shows "Ask us"
// instead of guessing. `fallback` names the silhouette symbol in the hidden SVG sprite.
const CARS = [
  {
    name: 'Hyundai Elantra',
    type: 'Sedan',
    seats: '',
    transmission: '',
    fuel: '',
    price: null,
    image: 'images/cars/hyundai-elantra/exterior-1.webp',
    width: 736,
    height: 552,
    focus: '50% 55%',
    fallback: 'car-sedan'
  },
  {
    name: 'Toyota Corolla',
    type: 'Sedan',
    seats: '',
    transmission: '',
    fuel: '',
    price: null,
    image: 'images/cars/toyota-corolla/exterior-1.webp',
    width: 1000,
    height: 750,
    focus: '50% 55%',
    fallback: 'car-sedan'
  },
  {
    name: 'Toyota RAV4',
    type: 'SUV',
    seats: '',
    transmission: '',
    fuel: '',
    price: null,
    image: 'images/cars/toyota-rav4/exterior-1.webp',
    width: 1200,
    height: 900,
    focus: '50% 50%',
    fallback: 'car-suv'
  }
];

const REVIEWS = [];
const state = { filter: 'all', search: '', sort: 'price-asc' };

const form = document.getElementById('bookingForm');
const vehicleSelect = document.getElementById('vehicleSelect');
const bookingEstimate = document.getElementById('bookingEstimate');
const bookingError = document.getElementById('bookingError');
const bookingSuccess = document.getElementById('bookingSuccess');
const fleetGrid = document.getElementById('fleetGrid');
const fleetSearch = document.getElementById('fleetSearch');
const fleetSort = document.getElementById('fleetSort');
const fallbackLink = document.getElementById('fallbackLink');
const reviewsSection = document.getElementById('reviews');
const reviewsList = document.getElementById('reviewsList');
const fleetTools = document.querySelector('.fleet-tools');
const fleetEmpty = document.getElementById('fleetEmpty');
const pickupDate = form.querySelector('[name="pickupDate"]');
const dropoffDate = form.querySelector('[name="dropoffDate"]');
const driverChoice = form.querySelector('[name="driver"]');
const licenceField = document.getElementById('licenceField');
const licenceInput = document.getElementById('licenceNumber');
const licenceError = document.getElementById('licenceError');
const licenceLiveNotice = document.getElementById('licenceLiveNotice');

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, function (char) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char] || char;
  });
}

function hasPrice(car) {
  return car.price != null && car.price !== '' && Number.isFinite(Number(car.price));
}

function carMeta(car) {
  const parts = [];
  if (car.type) parts.push(esc(car.type));
  if (car.seats) parts.push(esc(car.seats) + ' seats');
  if (car.transmission) parts.push(esc(car.transmission));
  if (car.fuel) parts.push(esc(car.fuel));
  return parts.length ? parts.join(' &middot; ') : 'Ask us for the full details';
}

function carPrice(car) {
  return hasPrice(car)
    ? '<strong>GHS ' + esc(car.price) + '</strong><span class="car-price-note">/ day</span>'
    : '<strong>Ask us</strong><span class="car-price-note">for the daily rate</span>';
}

function normaliseLicence(value) {
  return String(value || '').trim().toUpperCase();
}

function setLicenceError(message) {
  licenceError.textContent = message || '';
}

// Shows the licence field only for self-drive ("Without driver") bookings. Any other choice
// hides the wrapper, disables the input so it cannot be focused or submitted, clears the
// value immediately and clears any error.
function updateLicenceField() {
  if (driverChoice.value === DRIVER_WITHOUT) {
    licenceField.hidden = false;
    licenceInput.disabled = false;
    licenceInput.required = true;
    // The field always starts empty when it appears so a licence number is never put back
    // on screen after the visitor has sent it.
    licenceInput.value = '';
    setLicenceError('');
    licenceLiveNotice.textContent = LICENCE_REQUIRED_NOTICE;
    return;
  }

  licenceField.hidden = true;
  licenceInput.disabled = true;
  licenceInput.required = false;
  licenceInput.value = '';
  setLicenceError('');
  licenceLiveNotice.textContent = '';
}

// The licence number is only ever placed in the message the visitor sends, so it is cleared
// from the page after a successful send and never shown back on screen.
function clearLicenceAfterSend() {
  licenceInput.value = '';
  setLicenceError('');
}

function populateVehicleOptions() {
  if (CARS.length === 0) {
    vehicleSelect.innerHTML = '<option value="ask">Ask about available rental cars</option>';
    vehicleSelect.value = 'ask';
    return;
  }
  vehicleSelect.innerHTML = '<option value="">Choose a vehicle</option>' + CARS.map(function (car) {
    return '<option value="' + esc(car.name) + '">' + esc(car.name) + (car.type ? ' (' + esc(car.type) + ')' : '') + '</option>';
  }).join('');
  vehicleSelect.value = CARS[0].name;
}

function getSelectedCar() {
  const selectedName = vehicleSelect.value;
  return CARS.find(function (car) {
    return car.name === selectedName;
  }) || null;
}

function updateEstimate() {
  const selectedCar = getSelectedCar();
  const pickup = pickupDate.value;
  const dropoff = dropoffDate.value;

  if (!selectedCar) {
    bookingEstimate.textContent = 'Please contact us to confirm available rental cars and current rates.';
    return;
  }

  if (!pickup || !dropoff) {
    bookingEstimate.textContent = 'Select a vehicle and dates to see a live estimate.';
    return;
  }

  if (!hasPrice(selectedCar)) {
    bookingEstimate.textContent = 'Send us your dates and we will confirm the daily rate for the ' + selectedCar.name + '.';
    return;
  }

  const pickupAt = new Date(pickup + 'T00:00:00');
  const dropoffAt = new Date(dropoff + 'T00:00:00');
  const dayCount = Math.max(1, Math.round((dropoffAt - pickupAt) / 86400000));

  if (isNaN(dayCount) || dayCount <= 0) {
    bookingEstimate.textContent = 'Drop-off date must be after the pickup date.';
    return;
  }

  const total = dayCount * selectedCar.price;
  bookingEstimate.textContent = dayCount + ' days x GHS ' + selectedCar.price + ' = GHS ' + total + ' (final price confirmed on WhatsApp)';
}

function compareByPrice(a, b, descending) {
  if (hasPrice(a) && !hasPrice(b)) return -1;
  if (!hasPrice(a) && hasPrice(b)) return 1;
  if (!hasPrice(a) && !hasPrice(b)) return 0;
  const difference = Number(a.price) - Number(b.price);
  return descending ? -difference : difference;
}

function renderFleet() {
  fleetTools.hidden = CARS.length === 0;
  fleetSort.disabled = CARS.filter(hasPrice).length < 2;
  const query = state.search.trim().toLowerCase();
  const filtered = CARS.filter(function (car) {
    const matchesFilter = state.filter === 'all' || car.type === state.filter;
    const searchable = [car.name, car.type, car.transmission, car.fuel, car.seats].filter(Boolean).join(' ').toLowerCase();
    return matchesFilter && (!query || searchable.includes(query));
  }).sort(function (a, b) {
    return compareByPrice(a, b, state.sort === 'price-desc');
  });

  fleetEmpty.hidden = filtered.length > 0;
  if (filtered.length === 0) {
    fleetEmpty.querySelector('h3').textContent = CARS.length
      ? 'No rental cars match your filters.'
      : 'No rental cars are listed right now.';
    fleetEmpty.querySelector('p').textContent = CARS.length
      ? 'Try a different search, or contact us to ask about current availability.'
      : 'Contact us to ask about current rental availability and rates.';
    fleetGrid.innerHTML = '';
    return;
  }

  fleetGrid.innerHTML = filtered.map(function (car) {
    return '<article class="car-card">'
      + '<div class="car-image">'
      + '<img src="' + esc(car.image) + '" alt="' + esc(car.name) + ', front and side view" loading="lazy" width="' + (car.width || 1200) + '" height="' + (car.height || 900) + '" data-focus="' + esc(car.focus || '50% 60%') + '" data-fallback="' + esc(car.fallback || 'car-sedan') + '">'
      + '</div>'
      + '<div class="car-body">'
      + '<h3 class="car-title">' + esc(car.name) + '</h3>'
      + '<div class="car-meta">' + carMeta(car) + '</div>'
      + '<div class="car-price">' + carPrice(car) + '</div>'
      + '<button class="btn reserve-btn" type="button" data-car-name="' + esc(car.name) + '">Reserve</button>'
      + '</div>'
      + '</article>';
  }).join('');

  fleetGrid.querySelectorAll('img').forEach(function (img) {
    if (img.dataset.focus) { img.style.objectPosition = img.dataset.focus; }
    img.addEventListener('error', function () {
      const wrapper = img.parentElement;
      wrapper.innerHTML = '<svg viewBox="0 0 120 50" aria-hidden="true" focusable="false"><use href="#' + (img.dataset.fallback || 'car-sedan') + '"></use></svg>';
    });
  });
}

function setStatus(message, type) {
  bookingError.textContent = type === 'error' ? message : '';
  bookingSuccess.textContent = type === 'success' ? message : '';
}

function validateForm() {
  const formData = new FormData(form);
  const name = (formData.get('name') || '').trim();
  const phone = (formData.get('phone') || '').trim();
  const pickup = (formData.get('pickupDate') || '').trim();
  const dropoff = (formData.get('dropoffDate') || '').trim();
  const pickupLocation = (formData.get('pickupLocation') || '').trim();
  const dropoffLocation = (formData.get('dropoffLocation') || '').trim();
  const vehicle = (formData.get('vehicle') || '').trim();
  const driver = (formData.get('driver') || '').trim();
  const consent = form.querySelector('[name="consent"]').checked;
  const honeypot = (formData.get('website') || '').trim();

  if (honeypot) {
    setStatus('Your message was blocked as spam.', 'error');
    return false;
  }

  setLicenceError('');

  if (!name) {
    setStatus('Please enter your name.', 'error');
    return false;
  }

  if (!phone) {
    setStatus('Please enter your phone number.', 'error');
    return false;
  }

  if (!/^\+?[0-9\s()\-]{7,}$/.test(phone)) {
    setStatus('Please enter a valid phone number.', 'error');
    return false;
  }

  if (!pickup) {
    setStatus('Please choose a pickup date.', 'error');
    return false;
  }

  if (!dropoff) {
    setStatus('Please choose a drop-off date.', 'error');
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pickupDateValue = new Date(pickup + 'T00:00:00');
  const dropoffDateValue = new Date(dropoff + 'T00:00:00');

  if (pickupDateValue < today) {
    setStatus('Pickup date cannot be in the past.', 'error');
    return false;
  }

  if (dropoffDateValue <= pickupDateValue) {
    setStatus('Drop-off date must be after the pickup date.', 'error');
    return false;
  }

  if (!pickupLocation) {
    setStatus('Please enter a pickup location.', 'error');
    return false;
  }

  if (!dropoffLocation) {
    setStatus('Please enter a drop-off location.', 'error');
    return false;
  }

  if (!vehicle) {
    setStatus('Please choose a vehicle.', 'error');
    return false;
  }

  if (!driver) {
    setStatus('Please tell us whether you need a driver.', 'error');
    return false;
  }

  if (driver === DRIVER_WITHOUT && !LICENCE_PATTERN.test(normaliseLicence(formData.get('licenceNumber')))) {
    setLicenceError(LICENCE_ERROR_TEXT);
    setStatus(LICENCE_ERROR_TEXT, 'error');
    licenceInput.focus();
    return false;
  }

  if (!consent) {
    setStatus('Please agree to be contacted about this booking.', 'error');
    return false;
  }

  setStatus('', '');
  return true;
}

function buildBookingMessage() {
  const formData = new FormData(form);
  const selectedCar = CARS.find(function (car) {
    return car.name === formData.get('vehicle');
  }) || getSelectedCar();
  const data = {
    name: (formData.get('name') || '').trim(),
    phone: (formData.get('phone') || '').trim(),
    pickupDate: (formData.get('pickupDate') || '').trim(),
    dropoffDate: (formData.get('dropoffDate') || '').trim(),
    pickupLocation: (formData.get('pickupLocation') || '').trim(),
    dropoffLocation: (formData.get('dropoffLocation') || '').trim(),
    driver: (formData.get('driver') || '').trim(),
    // Read the licence number only for self-drive bookings, and only to place it in the
    // message the visitor chooses to send.
    licence: formData.get('driver') === DRIVER_WITHOUT ? normaliseLicence(formData.get('licenceNumber')) : '',
    message: (formData.get('message') || '').trim()
  };

  const lines = [
    'Hello Mitch Jhay Auto & Rentals, I would like to book a car.',
    'Name: ' + data.name,
    'Phone: ' + data.phone,
    'Vehicle: ' + (selectedCar ? selectedCar.name + ' (' + selectedCar.type + ')' : 'Please recommend an available rental car'),
    // [PLACEHOLDER: confirm with owner that a driver is offered.]
    data.driver === DRIVER_WITH ? 'Driver: provided by Mitch Jhay Auto & Rentals' : 'Driver: ' + (data.driver || '-')
  ];

  if (data.driver === DRIVER_WITHOUT && data.licence) {
    lines.push("Driver's licence: " + data.licence);
  }

  lines.push(
    'Pickup date: ' + (data.pickupDate || '-'),
    'Pickup location: ' + (data.pickupLocation || '-'),
    'Drop-off date: ' + (data.dropoffDate || '-'),
    'Drop-off location: ' + (data.dropoffLocation || '-')
  );

  if (data.message) {
    lines.push('Message: ' + data.message);
  }

  return lines.join('\n');
}

function sendToEndpoint(payload) {
  if (!BOOKING_ENDPOINT) {
    return Promise.resolve();
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(function () {
    controller.abort();
  }, 8000);

  return fetch(BOOKING_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors',
    credentials: 'omit',
    signal: controller.signal
  }).finally(function () {
    window.clearTimeout(timeoutId);
  });
}

function prepareFallbackLink(message) {
  fallbackLink.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message);
  fallbackLink.hidden = false;
}

function handleBooking(type) {
  if (!validateForm()) {
    return;
  }

  const message = buildBookingMessage();
  const whatsappUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message);
  // The driver's licence number is deliberately left out of this payload so it is never
  // posted to BOOKING_ENDPOINT or to any logging service.
  const payload = {
    name: form.querySelector('[name="name"]').value.trim(),
    phone: form.querySelector('[name="phone"]').value.trim(),
    pickupDate: form.querySelector('[name="pickupDate"]').value,
    dropoffDate: form.querySelector('[name="dropoffDate"]').value,
    pickupLocation: form.querySelector('[name="pickupLocation"]').value.trim(),
    dropoffLocation: form.querySelector('[name="dropoffLocation"]').value.trim(),
    vehicle: form.querySelector('[name="vehicle"]').value,
    driver: form.querySelector('[name="driver"]').value,
    message: form.querySelector('[name="message"]').value.trim(),
    createdAt: new Date().toISOString()
  };

  if (BOOKING_ENDPOINT) {
    sendToEndpoint(payload)
      .then(function () {
        setStatus('Booking saved to the configured endpoint.', 'success');
      })
      .catch(function () {
        setStatus('Booking saved locally, but the logging endpoint did not respond. Please continue with WhatsApp or email.', 'error');
      });
  }

  if (type === 'whatsapp') {
    const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    prepareFallbackLink(message);
    if (!opened) {
      setStatus('Your browser blocked the WhatsApp popup. Please use the fallback link below or call us directly.', 'error');
      return;
    }
    setStatus('Your booking request is ready on WhatsApp. We will confirm your booking shortly.', 'success');
    clearLicenceAfterSend();
    return;
  }

  const mailLink = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Car booking request') + '&body=' + encodeURIComponent(message);
  window.location.href = mailLink;
  setStatus('Your booking request is ready to send by email. We will confirm availability soon.', 'success');
  clearLicenceAfterSend();
}

function renderReviews() {
  if (!REVIEWS || REVIEWS.length === 0) {
    reviewsSection.hidden = true;
    return;
  }

  reviewsSection.hidden = false;
  reviewsList.innerHTML = REVIEWS.map(function (review) {
    return '<article class="review-card">'
      + '<div class="stars" aria-label="5 star review">★★★★★</div>'
      + '<p>' + esc(review.text) + '</p>'
      + '<footer>' + esc(review.author) + '</footer>'
      + '</article>';
  }).join('');
}

fleetSearch.addEventListener('input', function (event) {
  state.search = event.target.value;
  renderFleet();
});

fleetSort.addEventListener('change', function (event) {
  state.sort = event.target.value;
  renderFleet();
});

document.querySelectorAll('.chip[data-filter]').forEach(function (button) {
  button.addEventListener('click', function () {
    state.filter = button.getAttribute('data-filter');
    document.querySelectorAll('.chip[data-filter]').forEach(function (chip) {
      const active = chip === button;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    renderFleet();
  });
});

fleetGrid.addEventListener('click', function (event) {
  const button = event.target.closest('[data-car-name]');
  if (!button) {
    return;
  }

  const selected = button.getAttribute('data-car-name');
  if (!selected) {
    return;
  }

  vehicleSelect.value = selected;
  updateEstimate();
  document.getElementById('book').scrollIntoView();
});

pickupDate.addEventListener('change', updateEstimate);
dropoffDate.addEventListener('change', updateEstimate);
vehicleSelect.addEventListener('change', updateEstimate);

driverChoice.addEventListener('change', updateLicenceField);

licenceInput.addEventListener('input', function () {
  if (licenceError.textContent) {
    setLicenceError('');
  }
});

document.getElementById('sendWhatsApp').addEventListener('click', function () {
  handleBooking('whatsapp');
});

document.getElementById('sendEmail').addEventListener('click', function () {
  handleBooking('email');
});

populateVehicleOptions();
renderFleet();
renderReviews();
updateEstimate();
updateLicenceField();
