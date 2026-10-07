/*
 * Site-wide car search for Mitch Jhay Auto & Rentals.
 *
 * Loaded on every page with `defer`, after js/data.js, so window.CARS and window.FOR_SALE exist.
 * It only reads that data; it never changes it and never touches js/main.js or js/sale.js.
 *
 * - The header button opens a full-width bar directly under the header on every screen size.
 * - The bar is opened and closed with the `hidden` attribute: no animation, no transitions.
 * - Results appear about 150 ms after typing stops.
 * - Every piece of car data is written with esc(), so a car name can never inject markup.
 * - No inline scripts and no style="" attributes are used (the Content-Security-Policy blocks
 *   both). Object-position is set through element.style from JavaScript, which is allowed.
 */
(function () {
  'use strict';

  var WA = '233204092665';
  var MAX_RESULTS = 6;
  var TYPING_DELAY = 150;

  var toggle = document.querySelector('[data-car-search-toggle]');
  var panel = document.getElementById('carSearchPanel');
  var input = document.getElementById('carSearchInput');
  var closeButton = document.getElementById('carSearchClose');
  var list = document.getElementById('carSearchResults');
  var countText = document.getElementById('carSearchCount');
  var seeAll = document.getElementById('carSearchSeeAll');

  if (!toggle || !panel || !input || !list || !countText) {
    return;
  }

  var rentals = Array.isArray(window.CARS) ? window.CARS : [];
  var sales = Array.isArray(window.FOR_SALE) ? window.FOR_SALE : [];
  var entries = buildEntries();

  var options = [];
  var activeIndex = -1;
  var isOpen = false;
  var timer = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  // Lower-case, keep only letters and digits, and turn everything else into single spaces.
  function normalise(value) {
    return String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function rentalHaystack(car) {
    return ['rent', car.name, car.type, car.year, car.color, car.seats, car.transmission, car.fuel]
      .filter(Boolean).join(' ');
  }

  function saleHaystack(car) {
    return ['buy', car.make, car.model, car.year, car.bodyType, car.color, car.transmission, car.fuel, car.location]
      .filter(Boolean).join(' ');
  }

  function makeEntry(kind, car, haystack) {
    var spaced = normalise(haystack);
    return { kind: kind, car: car, spaced: spaced, squashed: spaced.replace(/ /g, '') };
  }

  function buildEntries() {
    return rentals.map(function (car) {
      return makeEntry('rent', car, rentalHaystack(car));
    }).concat(sales.map(function (car) {
      return makeEntry('sale', car, saleHaystack(car));
    }));
  }

  // Every word in the query must appear, either in the spaced text or in the squashed text, so
  // "land cruiser" and "landcruiser" both match.
  function matches(entry, tokens) {
    return tokens.every(function (token) {
      return entry.spaced.indexOf(token) !== -1 || entry.squashed.indexOf(token) !== -1;
    });
  }

  function saleStatus(status) {
    if (status === 'sold') return 'Sold';
    if (status === 'reserved') return 'Reserved';
    if (status === 'available') return 'Available';
    return 'Ask us about availability';
  }

  function saleTitle(car) {
    return [car.make, car.model].filter(Boolean).join(' ');
  }

  function firstPhoto(car) {
    return car.photos && Array.isArray(car.photos.exterior)
      ? car.photos.exterior.find(function (photo) { return photo && photo.path; }) || null
      : null;
  }

  function priceLabel(car, perDay) {
    return car.price == null || car.price === '' ? 'Ask us' : 'GHS ' + car.price + (perDay ? ' / day' : '');
  }

  function thumbnail(src, alt, focus) {
    if (src) {
      return '<span class="car-search-thumb"><img src="' + esc(src) + '" alt="' + esc(alt)
        + '" loading="lazy" width="144" height="108" data-focus="' + esc(focus || '') + '"></span>';
    }
    return '<span class="car-search-thumb car-search-thumb-empty" aria-hidden="true">'
      + '<svg viewBox="0 0 120 50" aria-hidden="true" focusable="false"><use href="#car-sedan"></use></svg></span>';
  }

  function rentalOption(entry, index) {
    var car = entry.car;
    var meta = [];
    if (car.year) meta.push(car.year);
    meta.push(priceLabel(car, true));
    return '<a class="car-search-option" role="option" id="carSearchOpt' + index + '" aria-selected="false"'
      + ' href="index.html?car=' + encodeURIComponent(car.id || car.name) + '#fleet">'
      + thumbnail(car.image, car.name + ' rental car', car.focus)
      + '<span class="car-search-info">'
      + '<span class="car-search-name">' + esc(car.name) + '</span>'
      + '<span class="car-search-meta">' + esc(meta.join(' · ')) + '</span>'
      + '<span class="car-search-status">Availability on request</span>'
      + '</span></a>';
  }

  function saleOption(entry, index) {
    var car = entry.car;
    var photo = firstPhoto(car);
    var meta = [];
    if (car.year) meta.push(car.year);
    meta.push(priceLabel(car, false));
    return '<a class="car-search-option" role="option" id="carSearchOpt' + index + '" aria-selected="false"'
      + ' href="buy.html#' + encodeURIComponent(car.id || '') + '">'
      + thumbnail(photo ? photo.path : '', saleTitle(car) + ' for sale', '')
      + '<span class="car-search-info">'
      + '<span class="car-search-name">' + esc(saleTitle(car)) + '</span>'
      + '<span class="car-search-meta">' + esc(meta.join(' · ')) + '</span>'
      + '<span class="car-search-status">' + esc(saleStatus(car.status)) + '</span>'
      + '</span></a>';
  }

  function emptyMarkup() {
    var message = encodeURIComponent("Hello Mitch Jhay Auto & Rentals, I'm looking for a car. Please let me know what you have available.");
    return '<div class="car-search-empty"><p>No cars found</p>'
      + '<a href="https://wa.me/' + WA + '?text=' + message + '" target="_blank" rel="noopener noreferrer">'
      + "Tell us what you're looking for</a></div>";
  }

  function render(query) {
    var tokens = normalise(query).split(' ').filter(Boolean);

    if (!tokens.length) {
      list.innerHTML = '';
      countText.textContent = '';
      options = [];
      activeIndex = -1;
      input.removeAttribute('aria-activedescendant');
      if (seeAll) {
        seeAll.hidden = true;
        seeAll.textContent = '';
      }
      return;
    }

    var rentMatches = entries.filter(function (entry) {
      return entry.kind === 'rent' && matches(entry, tokens);
    });
    var saleMatches = entries.filter(function (entry) {
      return entry.kind === 'sale' && matches(entry, tokens);
    });

    var rentShown = rentMatches.slice(0, MAX_RESULTS);
    var saleShown = saleMatches.slice(0, Math.max(0, MAX_RESULTS - rentShown.length));
    var html = '';
    var index = 0;

    if (rentShown.length) {
      html += '<div class="car-search-group" role="group" aria-label="For rent">'
        + '<p class="car-search-group-title" role="presentation">For rent</p>'
        + rentShown.map(function (entry) { return rentalOption(entry, index); index += 1; }).join('')
        + '</div>';
    }

    if (saleShown.length) {
      html += '<div class="car-search-group" role="group" aria-label="For sale">'
        + '<p class="car-search-group-title" role="presentation">For sale</p>'
        + saleShown.map(function (entry) { return saleOption(entry, index); index += 1; }).join('')
        + '</div>';
    }

    var total = rentMatches.length + saleMatches.length;
    if (!total) {
      html = emptyMarkup();
    }

    list.innerHTML = html;
    options = Array.prototype.slice.call(list.querySelectorAll('[role="option"]'));
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');

    Array.prototype.forEach.call(list.querySelectorAll('img[data-focus]'), function (img) {
      var focus = img.getAttribute('data-focus');
      if (focus) {
        img.style.objectPosition = focus;
      }
    });

    countText.textContent = total === 0 ? 'No cars found' : total + (total === 1 ? ' result' : ' results');

    if (seeAll) {
      if (total > MAX_RESULTS) {
        var href = rentMatches.length
          ? 'index.html?q=' + encodeURIComponent(query) + '#fleet'
          : 'buy.html?q=' + encodeURIComponent(query) + '#saleSearch';
        seeAll.innerHTML = '<a href="' + href + '">See all results</a>';
        seeAll.hidden = false;
      } else {
        seeAll.hidden = true;
        seeAll.textContent = '';
      }
    }
  }

  function setActive(next) {
    activeIndex = next;
    for (var i = 0; i < options.length; i += 1) {
      var isActive = i === next;
      options[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
      options[i].classList.toggle('is-active', isActive);
    }
    if (options[next]) {
      input.setAttribute('aria-activedescendant', options[next].id);
      options[next].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function move(step) {
    if (!options.length) {
      return;
    }
    var next;
    if (activeIndex === -1) {
      next = step > 0 ? 0 : options.length - 1;
    } else {
      next = activeIndex + step;
      if (next < 0) next = 0;
      if (next > options.length - 1) next = options.length - 1;
    }
    setActive(next);
  }

  function openPanel() {
    if (isOpen) {
      return;
    }
    isOpen = true;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  function closePanel(returnFocus) {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    window.clearTimeout(timer);
    if (returnFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', function () {
    if (isOpen) {
      closePanel(true);
    } else {
      openPanel();
    }
  });

  if (closeButton) {
    closeButton.addEventListener('click', function () {
      closePanel(true);
    });
  }

  input.addEventListener('input', function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      render(input.value);
    }, TYPING_DELAY);
  });

  panel.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel(true);
      return;
    }
    if (!options.length) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === 'Enter' && activeIndex > -1 && options[activeIndex]) {
      event.preventDefault();
      options[activeIndex].click();
    }
  });

  list.addEventListener('click', function (event) {
    if (event.target.closest('[role="option"]')) {
      closePanel(false);
    }
  });

  // If a thumbnail fails to load, fall back to the silhouette in the shared SVG sprite.
  list.addEventListener('error', function (event) {
    var img = event.target;
    if (!img || img.tagName !== 'IMG') {
      return;
    }
    var thumb = img.parentNode;
    if (thumb && thumb.classList.contains('car-search-thumb')) {
      thumb.classList.add('car-search-thumb-empty');
      thumb.innerHTML = '<svg viewBox="0 0 120 50" aria-hidden="true" focusable="false"><use href="#car-sedan"></use></svg>';
    }
  }, true);

  document.addEventListener('click', function (event) {
    if (!isOpen) {
      return;
    }
    if (panel.contains(event.target) || toggle.contains(event.target)) {
      return;
    }
    closePanel(false);
  });
})();