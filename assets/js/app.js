const CART_KEY = 'bw_artist_cart_v1';
const FAVORITES_KEY = 'bw_artist_favorites_v1';
const CUSTOM_PRODUCTS_KEY = 'bw_artist_custom_products_v1';
const DELETED_PUBLISHED_KEY = 'bw_artist_deleted_published_v1';
const PUBLISHED_DATES_KEY = 'bw_artist_published_dates_v1';
const SALES_KEY = 'bw_artist_sales_v1';
const THEME_KEY = 'bw_artist_theme_v1';
const MANAGE_SESSION_KEY = 'bw_artist_manage_access_v1';
const MANAGE_ACCESS_CODE_KEY = 'bw_artist_manage_access_code_v1';
const MANAGE_DEFAULT_ACCESS_CODE = 'atelier2026';
const A11Y_PREFS_KEY = 'bw_artist_a11y_prefs_v1';
const HOME_LAYOUT_KEY = 'bw_artist_home_layout_v1';

function normalizeImagePath(value) {
  const src = String(value || '').trim();
  if (!src) return '';
  if (src.includes('fakepath')) return '';
  if (/^[a-zA-Z]:\\/.test(src)) return '';
  if (src.startsWith('data:image')) return src;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return src;
  if (src.startsWith('../jpg/')) return src.replace('../jpg/', 'jpg/');
  if (src.startsWith('./jpg/')) return src.slice(2);
  if (src.startsWith('/jpg/')) return `jpg/${src.slice(5)}`;
  return src;
}

function imageSrcOrFallback(value) {
  const src = normalizeImagePath(value);
  return src || 'jpg/gedicht.jpeg';
}

function normalizeStoredListImages(key) {
  const value = loadData(key);
  if (!Array.isArray(value)) return;

  let changed = false;
  const normalized = value.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const normalizedImage = normalizeImagePath(item.image);
    if (normalizedImage === (item.image || '')) return item;
    changed = true;
    return { ...item, image: normalizedImage };
  });

  if (changed) saveData(key, normalized);
}

function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Storage save failed:', error);
    announce('Opslaan mislukt: browser-opslag is vol. Gebruik een kleinere foto.');
    return false;
  }
}

let liveRegion = null;

function ensureLiveRegion() {
  if (liveRegion) return liveRegion;
  const region = document.createElement('div');
  region.id = 'a11yLiveRegion';
  region.className = 'visually-hidden';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  document.body.appendChild(region);
  liveRegion = region;
  return liveRegion;
}

function announce(message) {
  const region = ensureLiveRegion();
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 20);
}

function getCart() {
  return loadData(CART_KEY).map((item) => ({ ...item, image: normalizeImagePath(item?.image) }));
}

function getFavorites() {
  return loadData(FAVORITES_KEY).map((item) => ({ ...item, image: normalizeImagePath(item?.image) }));
}

function getCustomProducts() {
  return loadData(CUSTOM_PRODUCTS_KEY).map((item) => ({ ...item, image: normalizeImagePath(item?.image) }));
}

function getSales() {
  const value = loadData(SALES_KEY);
  return Array.isArray(value) ? value : [];
}

function getDeletedPublishedProductIds() {
  const value = loadData(DELETED_PUBLISHED_KEY);
  return Array.isArray(value) ? value : [];
}

function saveDeletedPublishedProductIds(ids) {
  saveData(DELETED_PUBLISHED_KEY, ids);
}

function getPublishedDatesMap() {
  const value = loadData(PUBLISHED_DATES_KEY);
  if (!value || Array.isArray(value) || typeof value !== 'object') return {};
  return value;
}

function savePublishedDatesMap(map) {
  saveData(PUBLISHED_DATES_KEY, map);
}

function formatPublishedDate(value) {
  if (!value) return 'Onbekend';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Onbekend';
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getPublishedCatalog() {
  return [
    { id: 'guitar-noir-echo', type: 'Guitar', title: 'Noir Echo', image: 'jpg/tekening2.jpg' },
    { id: 'guitar-inkline', type: 'Guitar', title: 'Inkline', image: 'jpg/tekening4.jpg' },
    { id: 'guitar-shadow-cedar', type: 'Guitar', title: 'Shadow Cedar', image: 'jpg/tekening5.jpg' },
    { id: 'drawing-1', type: 'Drawing', title: 'Tekening I', image: 'jpg/tekening1.jpg' },
    { id: 'drawing-2', type: 'Drawing', title: 'Tekening II', image: 'jpg/tekening2.jpg' },
    { id: 'drawing-3', type: 'Drawing', title: 'Tekening III', image: 'jpg/tekening3.jpg' },
    { id: 'drawing-4', type: 'Drawing', title: 'Tekening IV', image: 'jpg/tekening4.jpg' },
    { id: 'drawing-5', type: 'Drawing', title: 'Tekening V', image: 'jpg/tekening5.jpg' },
    { id: 'poem-quiet-strings', type: 'Poem', title: 'Stille Snaren', image: 'jpg/gedicht.jpeg' },
    { id: 'poem-graphite-moon', type: 'Poem', title: 'Grafietmaan', image: 'jpg/gedicht.jpeg' },
    { id: 'poem-monochrome-prayer', type: 'Poem', title: 'Monochroom Gebed', image: 'jpg/gedicht.jpeg' }
  ];
}

function getHomepageDefaultLayout() {
  return {
    guitar: ['guitar-noir-echo', 'guitar-inkline', 'guitar-shadow-cedar'],
    poem: ['poem-quiet-strings', 'poem-graphite-moon', 'poem-monochrome-prayer'],
    drawing: ['drawing-1', 'drawing-2', 'drawing-3', 'drawing-4', 'drawing-5']
  };
}

function getHomepageLayout() {
  const defaults = getHomepageDefaultLayout();
  const value = loadData(HOME_LAYOUT_KEY);
  if (!value || Array.isArray(value) || typeof value !== 'object') return defaults;
  return {
    guitar: Array.isArray(value.guitar) ? value.guitar : defaults.guitar,
    poem: Array.isArray(value.poem) ? value.poem : defaults.poem,
    drawing: Array.isArray(value.drawing) ? value.drawing : defaults.drawing
  };
}

function saveHomepageLayout(layout) {
  saveData(HOME_LAYOUT_KEY, layout);
}

function getHomepageSourceItemsByType(type) {
  const normalized = String(type || '').toLowerCase();
  const deletedIds = new Set(getDeletedPublishedProductIds());
  const published = getPublishedCatalog()
    .filter((item) => !deletedIds.has(item.id))
    .map((item) => ({ ...item, link: `${getProductLinkByType(item.type)}#${item.id}` }));
  const custom = getCustomProducts()
    .filter((item) => String(item.type || '').toLowerCase() === normalized)
    .map((item) => ({ ...item, link: `${getProductLinkByType(item.type)}#${item.id}` }));
  const all = [...published, ...custom];
  return all.filter((item) => String(item.type || '').toLowerCase() === normalized);
}

function renderHomeFeaturedSection(type, containerId, maxItems, emptyText) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sourceItems = getHomepageSourceItemsByType(type);
  const sourceMap = new Map(sourceItems.map((item) => [item.id, item]));
  const layout = getHomepageLayout();
  const configuredIds = (layout[type] || []).filter((id, index, arr) => arr.indexOf(id) === index);

  const selected = configuredIds
    .map((id) => sourceMap.get(id))
    .filter(Boolean);

  const fill = sourceItems.filter((item) => !configuredIds.includes(item.id));
  const items = [...selected, ...fill].slice(0, maxItems);

  if (!items.length) {
    container.innerHTML = `<div class="col-12"><p class="text-muted mb-0">${emptyText}</p></div>`;
    return;
  }

  container.innerHTML = items.map((item) => `
    <div class="col">
      <a class="home-product-link" href="${item.link}">
        <article class="bw-card p-3 h-100">
          <img loading="lazy" decoding="async" src="${item.image || 'jpg/gedicht.jpeg'}" class="bw-thumb mb-3" alt="${item.title}" />
          <h3 class="h6 mb-1">${item.title}</h3>
          <p class="text-secondary mb-0">Bekijk product</p>
        </article>
      </a>
    </div>
  `).join('');
}

function renderHomepageFeaturedSections() {
  renderHomeFeaturedSection('guitar', 'homeFeaturedGuitars', 4, 'Nog geen gitaren geselecteerd.');
  renderHomeFeaturedSection('poem', 'homeFeaturedPoems', 3, 'Nog geen gedichten geselecteerd.');
  renderHomeFeaturedSection('drawing', 'homeFeaturedDrawings', 5, 'Nog geen tekeningen geselecteerd.');
}

function ensurePublishedTrackingDates() {
  const map = getPublishedDatesMap();
  const now = new Date().toISOString();
  let changed = false;

  getPublishedCatalog().forEach((item) => {
    if (!map[item.id]) {
      map[item.id] = now;
      changed = true;
    }
  });

  const customProducts = getCustomProducts();
  const normalizedCustomProducts = customProducts.map((item) => {
    if (item.publishedAt) {
      if (!map[item.id]) {
        map[item.id] = item.publishedAt;
        changed = true;
      }
      return item;
    }

    changed = true;
    const publishedAt = now;
    map[item.id] = publishedAt;
    return { ...item, publishedAt };
  });

  if (changed) {
    savePublishedDatesMap(map);
    saveData(CUSTOM_PRODUCTS_KEY, normalizedCustomProducts);
  }
}

function getProductLinkByType(type) {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'guitar') return 'guitars.html';
  if (normalized === 'drawing') return 'drawings.html';
  if (normalized === 'poem') return 'poems.html';
  return 'favorites.html';
}

function chunkItems(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function renderHomeFavoritesCarousel() {
  const container = document.getElementById('homeFavoritesCarouselContainer');
  if (!container) return;

  const deletedIds = new Set(getDeletedPublishedProductIds());
  const favorites = getFavorites().filter((item) => !deletedIds.has(item.id)).slice(0, 10);
  if (!favorites.length) {
    container.innerHTML = `
      <div class="metric-box p-4">
        <p class="mb-2">Nog geen favorieten geselecteerd.</p>
        <p class="text-muted mb-3">Voeg favorieten toe op de Gitaar-, Gedichten- of Tekeningenpagina om hier je persoonlijke carousel te zien.</p>
        <a class="btn btn-bw btn-sm" href="guitars.html">Bekijk producten</a>
      </div>
    `;
    return;
  }

  const slides = chunkItems(favorites, 4);
  const carouselId = 'homeFavoritesCarousel';

  container.innerHTML = `
    <div id="${carouselId}" class="carousel slide home-products-carousel" data-bs-ride="false">
      <div class="carousel-inner">
        ${slides.map((slideItems, slideIndex) => `
          <div class="carousel-item ${slideIndex === 0 ? 'active' : ''}">
            <div class="row g-3">
              ${slideItems.map((item) => `
                <div class="col-12 col-md-6 col-lg-3">
                  <a class="home-product-link" href="${getProductLinkByType(item.type)}">
                    <article class="bw-card p-3 home-product-card">
                      <img loading="lazy" decoding="async" src="${item.image || 'jpg/gedicht.jpeg'}" alt="${item.title}" class="bw-thumb mb-3">
                      <p class="mono-title mb-1">${item.type || 'Item'}</p>
                      <h3 class="h6 mb-1">${item.title}</h3>
                      <p class="mb-0 fw-semibold">${item.price > 0 ? euro(item.price) : 'Op aanvraag'}</p>
                    </article>
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <button class="carousel-control-prev ${slides.length < 2 ? 'd-none' : ''}" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Vorige</span>
      </button>
      <button class="carousel-control-next ${slides.length < 2 ? 'd-none' : ''}" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Volgende</span>
      </button>
    </div>
  `;
}

function renderPublishedProductsManager() {
  const container = document.getElementById('publishedProductList');
  if (!container) return;

  const deletedIds = new Set(getDeletedPublishedProductIds());
  const items = getPublishedCatalog();
  const publishedDatumsMap = getPublishedDatesMap();

  container.innerHTML = items.map((item) => `
    <div class="d-flex justify-content-between align-items-center border-bottom py-3 gap-3">
      <div class="d-flex align-items-center gap-3">
        <img src="${imageSrcOrFallback(item.image)}" onerror="this.onerror=null;this.src='jpg/gedicht.jpeg';" alt="${item.title}" class="manage-thumb" />
        <div>
          <p class="mono-title mb-1">${item.type}</p>
          <p class="fw-semibold mb-0">${item.title}</p>
          <p class="text-muted small mb-0">Gepubliceerd: ${formatPublishedDate(publishedDatumsMap[item.id])}</p>
        </div>
      </div>
      ${deletedIds.has(item.id)
        ? `<button class="btn btn-outline-bw btn-sm js-published-restore" data-id="${item.id}">Herstellen</button>`
        : `<button class="btn btn-outline-bw btn-sm js-published-delete" data-id="${item.id}">Verwijderen</button>`}
    </div>
  `).join('');
}

function applyPublishedProductVisibility() {
  const deletedIds = new Set(getDeletedPublishedProductIds());
  const selectors = '[data-add-cart], [data-add-favorite], .js-favorite-add-to-cart';

  document.querySelectorAll(selectors).forEach((button) => {
    const id = button.dataset.id;
    if (!id) return;

    const wrapper = button.closest('.col-sm-6, .col-md-6, .col-lg-4, .col-lg-3, li, article') || button;
    if (deletedIds.has(id)) {
      wrapper.classList.add('d-none');
    } else {
      wrapper.classList.remove('d-none');
    }
  });
}

function updateBadges() {
  const cartCount = getCart().length;
  const favoritesCount = getFavorites().length;

  document.querySelectorAll('.js-cart-count').forEach((el) => {
    el.textContent = cartCount;
  });

  document.querySelectorAll('.js-favorites-count').forEach((el) => {
    el.textContent = favoritesCount;
  });
}

function readItemFromDataset(button) {
  return {
    id: button.dataset.id,
    type: button.dataset.type,
    title: button.dataset.title,
    price: Number(button.dataset.price || 0),
    image: button.dataset.image || '',
    description: button.dataset.description || ''
  };
}

function addToCart(item) {
  const cart = getCart();
  cart.push(item);
  if (saveData(CART_KEY, cart)) {
    updateBadges();
  }
}

function addToFavorites(item) {
  const favorites = getFavorites();
  const exists = favorites.some((fav) => fav.id === item.id);
  if (!exists) {
    favorites.push(item);
    if (saveData(FAVORITES_KEY, favorites)) {
      updateBadges();
      renderHomeFavoritesCarousel();
    }
  }
}

function addCustomProduct(product) {
  const list = getCustomProducts();
  list.push(product);
  return saveData(CUSTOM_PRODUCTS_KEY, list);
}

function removeCustomProduct(id) {
  const filtered = getCustomProducts().filter((item) => item.id !== id);
  saveData(CUSTOM_PRODUCTS_KEY, filtered);
}

function removeFavorite(id) {
  const favorites = getFavorites().filter((item) => item.id !== id);
  saveData(FAVORITES_KEY, favorites);
  updateBadges();
  renderFavoritesPage();
  renderHomeFavoritesCarousel();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveData(CART_KEY, cart);
  updateBadges();
  renderCartPage();
}

function euro(amount) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function renderProductCards(products) {
  return products.map((item) => `
    <div class="col-md-6 col-lg-4">
      <article id="${item.id}" class="bw-card p-3">
        <img src="${item.image || 'jpg/gedicht.jpeg'}" class="bw-thumb mb-3" alt="${item.title}">
        <h2 class="h5">${item.title}</h2>
        <p class="text-secondary">${item.description || 'Handgemaakt zwart-wit kunstwerk.'}</p>
        <p class="fw-bold">${item.price > 0 ? euro(item.price) : 'Prijs op aanvraag'}</p>
        <div class="d-flex gap-2">
          <button class="btn btn-bw btn-sm" data-add-cart data-id="${item.id}" data-type="${item.type}" data-title="${item.title}" data-price="${item.price}" data-image="${item.image || ''}" data-description="${item.description || ''}">In winkelwagen</button>
          <button class="btn btn-outline-bw btn-sm" data-add-favorite data-id="${item.id}" data-type="${item.type}" data-title="${item.title}" data-price="${item.price}" data-image="${item.image || ''}" data-description="${item.description || ''}">Favoriet</button>
        </div>
      </article>
    </div>
  `).join('');
}

function renderCustomProductsOnShopPages() {
  const custom = getCustomProducts();

  const guitarContainer = document.getElementById('customGuitarList');
  if (guitarContainer) {
    const guitars = custom.filter((item) => item.type.toLowerCase() === 'guitar');
    guitarContainer.innerHTML = guitars.length ? renderProductCards(guitars) : '<p class="text-muted">Nog geen aangepaste gitaren. Voeg er een toe in Beheer.</p>';
  }

  const drawingContainer = document.getElementById('customDrawingList');
  if (drawingContainer) {
    const drawings = custom.filter((item) => item.type.toLowerCase() === 'drawing');
    drawingContainer.innerHTML = drawings.length ? renderProductCards(drawings) : '<p class="text-muted">Nog geen aangepaste tekeningen. Voeg er een toe in Beheer.</p>';
  }
}

function renderManageProducts() {
  const container = document.getElementById('manageProductList');
  if (!container) return;

  const products = getCustomProducts();
  if (!products.length) {
    container.innerHTML = '<p class="text-muted">Nog geen beheerde producten.</p>';
    return;
  }

  container.innerHTML = products.map((item) => `
    <div class="d-flex justify-content-between align-items-center border-bottom py-3 gap-3">
      <div class="d-flex align-items-center gap-3">
        <img src="${imageSrcOrFallback(item.image)}" onerror="this.onerror=null;this.src='jpg/gedicht.jpeg';" alt="${item.title}" class="manage-thumb" />
        <div>
          <p class="mono-title mb-1">${item.type}</p>
          <p class="fw-semibold mb-1">${item.title}</p>
          <p class="mb-0 text-muted">${item.price > 0 ? euro(item.price) : 'Prijs op aanvraag'}</p>
          <p class="text-muted small mb-0">Gepubliceerd: ${formatPublishedDate(item.publishedAt)}</p>
        </div>
      </div>
      <button class="btn btn-outline-bw btn-sm js-product-delete" data-id="${item.id}">Verwijderen</button>
    </div>
  `).join('');
}

function addSaleFromCart(items) {
  if (!items || !items.length) return;

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const sale = {
    id: `sale-${Date.now()}`,
    createdAt: new Date().toISOString(),
    total,
    items: items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      price: Number(item.price || 0),
      quantity: 1
    }))
  };

  const sales = getSales();
  sales.unshift(sale);
  saveData(SALES_KEY, sales);
}

function renderManageSales() {
  const list = document.getElementById('manageSalesList');
  const stats = document.getElementById('manageSalesStats');
  const pie = document.getElementById('manageSalesPie');
  const legend = document.getElementById('manageSalesLegend');
  const productsList = document.getElementById('manageSalesProducts');
  if (!list || !stats || !pie || !legend || !productsList) return;

  const sales = getSales();
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const soldItems = sales.reduce((sum, sale) => sum + sale.items.length, 0);

  stats.innerHTML = `
    <div class="row g-3 mb-3">
      <div class="col-md-4"><div class="metric-box p-3"><p class="mono-title mb-1">Bestellingen</p><p class="h5 mb-0">${sales.length}</p></div></div>
      <div class="col-md-4"><div class="metric-box p-3"><p class="mono-title mb-1">Verkochte items</p><p class="h5 mb-0">${soldItems}</p></div></div>
      <div class="col-md-4"><div class="metric-box p-3"><p class="mono-title mb-1">Omzet</p><p class="h5 mb-0">${euro(revenue)}</p></div></div>
    </div>
  `;

  if (!sales.length) {
    pie.style.background = '#efefef';
    legend.innerHTML = '<p class="text-muted mb-0">Nog geen verkoopgegevens.</p>';
    productsList.innerHTML = '<p class="text-muted mb-0">Nog geen verkochte producten.</p>';
    list.innerHTML = '<p class="text-muted mb-0">Nog geen verkoop. Voltooide bestellingen verschijnen hier.</p>';
    return;
  }

  const flatProducts = sales.flatMap((sale) =>
    sale.items.map((item) => ({
      ...item,
      saleDatum: sale.createdAt,
      orderId: sale.id
    }))
  );

  const typeMap = flatProducts.reduce((acc, item) => {
    const type = item.type || 'Overig';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const palette = ['#111111', '#4b4b4b', '#7a7a7a', '#a0a0a0', '#c7c7c7'];
  const typeEntries = Object.entries(typeMap);
  const totalTypeCount = typeEntries.reduce((sum, [, count]) => sum + count, 0);
  let current = 0;
  const slices = typeEntries.map(([type, count], index) => {
    const from = (current / totalTypeCount) * 360;
    current += count;
    const to = (current / totalTypeCount) * 360;
    return {
      type,
      count,
      color: palette[index % palette.length],
      from,
      to
    };
  });

  pie.style.background = `conic-gradient(${slices.map((s) => `${s.color} ${s.from}deg ${s.to}deg`).join(', ')})`;
  legend.innerHTML = slices.map((slice) => `
    <div class="d-flex align-items-center justify-content-between border-bottom py-2">
      <div class="d-flex align-items-center gap-2">
        <span style="display:inline-block;width:12px;height:12px;background:${slice.color};"></span>
        <span>${slice.type}</span>
      </div>
      <span class="text-muted small">${slice.count}</span>
    </div>
  `).join('');

  productsList.innerHTML = `
    <div class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Product</th>
            <th>Type</th>
            <th>Prijs</th>
            <th>Bestelling</th>
          </tr>
        </thead>
        <tbody>
          ${flatProducts.map((item) => `
            <tr>
              <td>${formatPublishedDate(item.saleDatum)}</td>
              <td>${item.title}</td>
              <td>${item.type}</td>
              <td>${euro(item.price || 0)}</td>
              <td class="text-muted small">${item.orderId}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  list.innerHTML = sales.map((sale) => `
    <div class="border-bottom py-3">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <p class="mono-title mb-1">Bestelling ${sale.id}</p>
          <p class="mb-1"><strong>Gepubliceerd:</strong> ${formatPublishedDate(sale.createdAt)}</p>
          <p class="mb-0 text-muted small">${sale.items.map((item) => `${item.title} (${item.type})`).join(', ')}</p>
        </div>
        <p class="fw-semibold mb-0">${euro(sale.total)}</p>
      </div>
    </div>
  `).join('');
}

function renderManageHomeTypeBlock(typeKey, listId, poolId, maxItems) {
  const listContainer = document.getElementById(listId);
  const poolContainer = document.getElementById(poolId);
  if (!listContainer || !poolContainer) return;

  const source = getHomepageSourceItemsByType(typeKey);
  const sourceMap = new Map(source.map((item) => [item.id, item]));
  const layout = getHomepageLayout();
  const selectedIds = (layout[typeKey] || []).filter((id, index, arr) => arr.indexOf(id) === index);
  const selectedItems = selectedIds.map((id) => sourceMap.get(id)).filter(Boolean);

  listContainer.innerHTML = selectedItems.length
    ? selectedItems.map((item, index) => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2 gap-2">
        <div class="d-flex align-items-center gap-2">
          <img src="${imageSrcOrFallback(item.image)}" alt="${item.title}" class="manage-thumb" />
          <span>${item.title}</span>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-outline-bw btn-sm js-home-up" data-type="${typeKey}" data-id="${item.id}" ${index === 0 ? 'disabled' : ''}>Omhoog</button>
          <button class="btn btn-outline-bw btn-sm js-home-down" data-type="${typeKey}" data-id="${item.id}" ${index === selectedItems.length - 1 ? 'disabled' : ''}>Omlaag</button>
          <button class="btn btn-outline-bw btn-sm js-home-remove" data-type="${typeKey}" data-id="${item.id}">Verwijderen</button>
        </div>
      </div>
    `).join('')
    : '<p class="text-muted mb-2">Nog geen geselecteerde items.</p>';

  const selectable = source.filter((item) => !selectedIds.includes(item.id));
  poolContainer.innerHTML = selectable.length
    ? selectable.map((item) => `
      <button class="btn btn-outline-bw btn-sm me-2 mb-2 js-home-add" data-type="${typeKey}" data-id="${item.id}" ${selectedItems.length >= maxItems ? 'disabled' : ''}>
        + ${item.title}
      </button>
    `).join('')
    : '<p class="text-muted mb-0">Geen extra items beschikbaar.</p>';
}

function renderManageHomepageOrganizer() {
  if (!document.getElementById('manageHomeGuitarList')) return;
  renderManageHomeTypeBlock('guitar', 'manageHomeGuitarList', 'manageHomeGuitarPool', 4);
  renderManageHomeTypeBlock('poem', 'manageHomePoemList', 'manageHomePoemPool', 3);
  renderManageHomeTypeBlock('drawing', 'manageHomeDrawingList', 'manageHomeDrawingPool', 5);
}

function renderFavoritesPage() {
  const container = document.getElementById('favoritesList');
  if (!container) return;

  const favorites = getFavorites();
  if (!favorites.length) {
    container.innerHTML = '<p class="text-muted">Nog geen favorieten. Voeg werk toe op de Gitaren-, Gedichten- of Tekeningenpagina.</p>';
    return;
  }

  container.innerHTML = favorites.map((item) => `
    <div class="col-md-6 col-lg-4">
      <div class="bw-card p-3">
        <img src="${item.image || 'jpg/gedicht.jpeg'}" alt="${item.title}" class="bw-thumb mb-3" />
        <p class="mono-title mb-1">${item.type}</p>
        <h3 class="h5">${item.title}</h3>
        <p class="text-muted small">${item.description || 'Favoriet werk van de artiest.'}</p>
        ${item.price > 0 ? `<p class="fw-bold mb-3">${euro(item.price)}</p>` : ''}
        <div class="d-flex gap-2">
          <button class="btn btn-bw btn-sm js-favorite-add-to-cart" data-id="${item.id}">In winkelwagen</button>
          <button class="btn btn-outline-bw btn-sm js-favorite-remove" data-id="${item.id}">Verwijderen</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCartPage() {
  const container = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotal');
  if (!container || !totalEl) return;

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = '<p class="text-muted">Je winkelwagen is leeg.</p>';
    totalEl.textContent = euro(0);
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="d-flex justify-content-between align-items-center border-bottom py-3">
      <div>
        <p class="mono-title mb-1">${item.type}</p>
        <p class="fw-semibold mb-1">${item.title}</p>
        <p class="text-muted mb-0">${item.price > 0 ? euro(item.price) : 'Prijs op aanvraag'}</p>
      </div>
      <button class="btn btn-outline-bw btn-sm js-cart-remove" data-index="${index}">Verwijderen</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  totalEl.textContent = euro(total);
}

function bindActionButtons() {
  document.addEventListener('click', (event) => {
    const addCartButton = event.target.closest('button[data-add-cart]');
    if (addCartButton) {
      addToCart(readItemFromDataset(addCartButton));
      announce('Toegevoegd aan winkelwagen');
      return;
    }

    const addFavorietButton = event.target.closest('button[data-add-favorite]');
    if (addFavorietButton) {
      addToFavorites(readItemFromDataset(addFavorietButton));
      announce('Toegevoegd aan favorieten');
      return;
    }

    const removeFavoriteButton = event.target.closest('.js-favorite-remove');
    if (removeFavoriteButton) {
      removeFavorite(removeFavoriteButton.dataset.id);
      return;
    }

    const moveFavorietButton = event.target.closest('.js-favorite-add-to-cart');
    if (moveFavorietButton) {
      const item = getFavorites().find((fav) => fav.id === moveFavorietButton.dataset.id);
      if (item) {
        addToCart(item);
        announce('Toegevoegd aan winkelwagen');
      }
      return;
    }

    const removeCartButton = event.target.closest('.js-cart-remove');
    if (removeCartButton) {
      removeCartItem(Number(removeCartButton.dataset.index));
      return;
    }

    const deleteProductButton = event.target.closest('.js-product-delete');
    if (deleteProductButton) {
      removeCustomProduct(deleteProductButton.dataset.id);
      renderManageProducts();
      renderCustomProductsOnShopPages();
      renderHomepageFeaturedSections();
      renderManageHomepageOrganizer();
      return;
    }

    const deletePublishedButton = event.target.closest('.js-published-delete');
    if (deletePublishedButton) {
      const ids = getDeletedPublishedProductIds();
      if (!ids.includes(deletePublishedButton.dataset.id)) {
        ids.push(deletePublishedButton.dataset.id);
        saveDeletedPublishedProductIds(ids);
      }
      renderPublishedProductsManager();
      applyPublishedProductVisibility();
      renderHomeFavoritesCarousel();
      renderHomepageFeaturedSections();
      renderManageHomepageOrganizer();
      return;
    }

    const restorePublishedButton = event.target.closest('.js-published-restore');
    if (restorePublishedButton) {
      const ids = getDeletedPublishedProductIds().filter((id) => id !== restorePublishedButton.dataset.id);
      saveDeletedPublishedProductIds(ids);
      renderPublishedProductsManager();
      applyPublishedProductVisibility();
      renderHomeFavoritesCarousel();
      renderHomepageFeaturedSections();
      renderManageHomepageOrganizer();
      return;
    }

    const homeActionButton = event.target.closest('.js-home-up, .js-home-down, .js-home-remove, .js-home-add');
    if (homeActionButton) {
      const type = homeActionButton.dataset.type;
      const id = homeActionButton.dataset.id;
      if (!type || !id) return;

      const maxByType = { guitar: 4, poem: 3, drawing: 5 };
      const max = maxByType[type] || 4;
      const layout = getHomepageLayout();
      const current = Array.isArray(layout[type]) ? [...layout[type]] : [];
      const index = current.indexOf(id);

      if (homeActionButton.classList.contains('js-home-add')) {
        if (index !== -1) return;
        if (current.length >= max) {
          announce(`Maximaal ${max} items toegestaan voor deze rij.`);
          return;
        }
        current.push(id);
      } else if (homeActionButton.classList.contains('js-home-remove')) {
        if (index === -1) return;
        current.splice(index, 1);
      } else if (homeActionButton.classList.contains('js-home-up')) {
        if (index <= 0) return;
        [current[index - 1], current[index]] = [current[index], current[index - 1]];
      } else if (homeActionButton.classList.contains('js-home-down')) {
        if (index === -1 || index >= current.length - 1) return;
        [current[index + 1], current[index]] = [current[index], current[index + 1]];
      }

      layout[type] = current;
      saveHomepageLayout(layout);
      renderManageHomepageOrganizer();
      renderHomepageFeaturedSections();
      announce('Homepage-indeling bijgewerkt.');
    }
  });
}

function bindManageImageUpload() {
  const dropZone = document.getElementById('productImageDropZone');
  const fileInput = document.getElementById('productImageFile');
  const imageInput = document.getElementById('productImage');
  const preview = document.getElementById('productImagePreview');
  if (!dropZone || !fileInput || !imageInput || !preview) return;

  function setPreview(src) {
    if (!src) {
      preview.classList.add('d-none');
      preview.removeAttribute('src');
      return;
    }
    preview.src = src;
    preview.classList.remove('d-none');
  }

  function readFile(file) {
    if (!file) return;
    const lowerName = String(file.name || '').toLowerCase();
    const allowedByMime = String(file.type || '').startsWith('image/');
    const allowedByExt = /\.(jpg|jpeg|png|gif|webp|bmp|svg|tif|tiff|avif|heic|heif)$/i.test(lowerName);
    if (!allowedByMime && !allowedByExt) return;

    // SVG is usually compact enough; keep original data URL.
    if (lowerName.endsWith('.svg') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = String(event.target?.result || '');
        imageInput.value = src;
        setPreview(src);
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = String(event.target?.result || '');
      const img = new Image();
      img.onload = () => {
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to keep localStorage usage manageable.
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        imageInput.value = compressed;
        setPreview(compressed);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => readFile(fileInput.files?.[0]));

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('is-drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('is-drag-over');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-drag-over');
    const file = event.dataTransfer?.files?.[0];
    readFile(file);
  });

  imageInput.addEventListener('input', () => {
    const value = imageInput.value.trim();
    if (!value) {
      setPreview('');
      return;
    }
    if (
      value.startsWith('http') ||
      value.startsWith('../') ||
      value.startsWith('./') ||
      value.startsWith('/jpg/') ||
      value.startsWith('jpg/') ||
      value.startsWith('data:image')
    ) {
      setPreview(value);
    }
  });
}

function bindManageForm() {
  const form = document.getElementById('manageProductForm');
  if (!form) return;
  const imageInput = document.getElementById('productImage');
  const imageFileInput = document.getElementById('productImageFile');
  const imagePreview = document.getElementById('productImagePreview');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const type = document.getElementById('productType').value;
    const title = document.getElementById('productTitle').value.trim();
    const price = Number(document.getElementById('productPrice').value || 0);
    const image = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const ok = addCustomProduct({
      id: `${type.toLowerCase()}-${slug}-${Date.now()}`,
      type,
      title,
      price,
      image,
      description,
      publishedAt: new Date().toISOString()
    });

    if (!ok) return;

    form.reset();
    if (imageFileInput) imageFileInput.value = '';
    if (imagePreview) {
      imagePreview.classList.add('d-none');
      imagePreview.removeAttribute('src');
    }
    if (imageInput) imageInput.dispatchEvent(new Event('input'));
    renderManageProducts();
    renderCustomProductsOnShopPages();
    renderManageHomepageOrganizer();
    renderHomepageFeaturedSections();
    announce('Product toegevoegd');
  });
}

function bindCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!getCart().length) {
      announce('Je winkelwagen is leeg. Voeg eerst iets toe.');
      return;
    }

    const currentCart = getCart();
    addSaleFromCart(currentCart);
    localStorage.removeItem(CART_KEY);
    updateBadges();
    form.reset();
    const msg = document.getElementById('checkoutMessage');
    msg.classList.remove('d-none');
    renderCartPage();
    renderManageSales();
    announce('Betaling ontvangen. Bedankt voor je bestelling.');
  });
}

let revealObserver = null;
let mutationObserver = null;
let activeTiltCard = null;
let interactiveRefreshTimer = null;
let productLichtbox = null;
let manageFeaturesInitialized = false;

function initManageFeatures() {
  if (manageFeaturesInitialized) return;
  renderPublishedProductsManager();
  renderManageProducts();
  renderManageSales();
  renderManageHomepageOrganizer();
  bindManageImageUpload();
  bindManageForm();
  bindManageSecurityForm();
  manageFeaturesInitialized = true;
}

function getManageAccessCode() {
  try {
    const stored = localStorage.getItem(MANAGE_ACCESS_CODE_KEY);
    return stored && stored.trim() ? stored : MANAGE_DEFAULT_ACCESS_CODE;
  } catch (error) {
    return MANAGE_DEFAULT_ACCESS_CODE;
  }
}

function setManageAccessCode(code) {
  const normalized = String(code || '').trim();
  if (!normalized) return false;
  try {
    localStorage.setItem(MANAGE_ACCESS_CODE_KEY, normalized);
    return true;
  } catch (error) {
    return false;
  }
}

function enhanceInteractiveElements() {
  const revealTargets = document.querySelectorAll(
    'section, .bw-card, .checkout-panel, .contact-panel, .metric-box, .home-products-carousel, .table-responsive'
  );

  revealTargets.forEach((el) => {
    if (!el.classList.contains('reveal-item')) {
      el.classList.add('reveal-item');
    }
    if (revealObserver && !el.dataset.revealObserved) {
      el.dataset.revealObserved = '1';
      revealObserver.observe(el);
    }
  });

  document.querySelectorAll('.bw-card').forEach((card) => {
    card.classList.add('interactive-card');
  });

  document.querySelectorAll('.bw-card').forEach((card) => {
    const hasProductActions = card.querySelector('[data-add-cart], [data-add-favorite], .js-favorite-add-to-cart');
    if (!hasProductActions) return;
    const image = card.querySelector('.bw-thumb');
    if (image) {
      image.classList.add('product-photo');
    }
  });
}

function bindScrollReveal() {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -40px 0px'
  });
}

function resetTilt(card) {
  if (!card) return;
  card.classList.remove('is-tilting');
  card.style.transform = '';
}

function bindCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('pointermove', (event) => {
    const card = event.target.closest('.interactive-card');
    if (!card) {
      if (activeTiltCard) {
        resetTilt(activeTiltCard);
        activeTiltCard = null;
      }
      return;
    }

    if (activeTiltCard && activeTiltCard !== card) {
      resetTilt(activeTiltCard);
    }
    activeTiltCard = card;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = (0.5 - (y / rect.height)) * 8;

    card.classList.add('is-tilting');
    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
  });

  document.addEventListener('pointerout', (event) => {
    const card = event.target.closest('.interactive-card');
    if (!card) return;
    if (card.contains(event.relatedTarget)) return;
    resetTilt(card);
    if (activeTiltCard === card) activeTiltCard = null;
  });
}

function bindButtonPressFeedback() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.btn-bw, .btn-outline-bw');
    if (!button) return;
    button.classList.add('is-pressed');
    setTimeout(() => button.classList.remove('is-pressed'), 160);
  });
}

function ensureProductLichtbox() {
  if (productLichtbox) return productLichtbox;

  const wrapper = document.createElement('div');
  wrapper.className = 'product-lightbox';
  wrapper.innerHTML = `
    <button type="button" class="product-lightbox-close" aria-label="Sluit afbeelding">Sluiten</button>
    <img class="product-lightbox-image" alt="Vergrote productafbeelding" />
    <p class="product-lightbox-caption mb-0"></p>
  `;
  document.body.appendChild(wrapper);
  productLichtbox = wrapper;

  wrapper.addEventListener('click', (event) => {
    if (
      event.target === wrapper ||
      event.target.closest('.product-lightbox-close')
    ) {
      wrapper.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      wrapper.classList.remove('is-open');
    }
  });

  return wrapper;
}

function bindProductPhotoInteractions() {
  document.addEventListener('pointermove', (event) => {
    const image = event.target.closest('.product-photo');
    if (!image) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const rect = image.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    image.classList.add('is-hover');
  });

  document.addEventListener('pointerout', (event) => {
    const image = event.target.closest('.product-photo');
    if (!image) return;
    if (image.contains(event.relatedTarget)) return;
    image.classList.remove('is-hover');
    image.style.transformOrigin = '50% 50%';
  });

  document.addEventListener('click', (event) => {
    const image = event.target.closest('.product-photo');
    if (!image) return;

    const lightbox = ensureProductLichtbox();
    const lightboxImage = lightbox.querySelector('.product-lightbox-image');
    const lightboxCaption = lightbox.querySelector('.product-lightbox-caption');

    lightboxImage.src = image.currentSrc || image.src;
    const title = image.closest('.bw-card')?.querySelector('h2, h3')?.textContent?.trim();
    lightboxCaption.textContent = title || '';
    lightbox.classList.add('is-open');
  });
}

function bindInteractiveUI() {
  bindScrollReveal();
  bindCardTilt();
  bindButtonPressFeedback();
  bindProductPhotoInteractions();
  enhanceInteractiveElements();

  mutationObserver = new MutationObserver(() => {
    clearTimeout(interactiveRefreshTimer);
    interactiveRefreshTimer = setTimeout(() => {
      enhanceInteractiveElements();
    }, 70);
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Ignore theme persistence errors.
  }
}

function resolveTheme() {
  const stored = getStoredTheme();
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const isDonker = theme === 'dark';
  document.body.classList.toggle('theme-dark', isDonker);
  document.querySelectorAll('.js-theme-toggle').forEach((input) => {
    input.checked = isDonker;
    input.setAttribute('aria-label', isDonker ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus');
  });
  document.querySelectorAll('.js-theme-toggle-text').forEach((label) => {
    label.textContent = isDonker ? 'Donker' : 'Licht';
  });
}

function injectThemeToggleButton() {
  const navList = document.querySelector('.navbar .navbar-nav');
  if (!navList) return;
  if (navList.querySelector('.js-theme-toggle')) return;

  const item = document.createElement('li');
  item.className = 'nav-item nav-theme-item';
  item.innerHTML = `
    <label class="theme-switch" title="Schakel donkere modus">
      <input type="checkbox" class="js-theme-toggle" />
      <span class="theme-switch-track"><span class="theme-switch-knob"></span></span>
      <span class="theme-switch-text js-theme-toggle-text">Licht</span>
    </label>
  `;
  const manageItem = navList.querySelector('a[href="manage.html"]')?.closest('li');
  if (manageItem) {
    if (manageItem.classList.contains('nav-utility-start')) {
      manageItem.classList.remove('nav-utility-start');
      item.classList.add('nav-utility-start');
    }
    navList.insertBefore(item, manageItem);
  } else {
    navList.appendChild(item);
  }
}

function bindThemeToggle() {
  injectThemeToggleButton();
  const theme = resolveTheme();
  applyTheme(theme);

  document.addEventListener('change', (event) => {
    const toggle = event.target.closest('.js-theme-toggle');
    if (!toggle) return;
    const next = toggle.checked ? 'dark' : 'light';
    applyTheme(next);
    saveTheme(next);
  });
}

function bindManageLogout() {
  const logoutButton = document.getElementById('manageLogoutBtn');
  if (!logoutButton || logoutButton.dataset.bound === '1') return;
  logoutButton.dataset.bound = '1';
  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem(MANAGE_SESSION_KEY);
    window.location.reload();
  });
}

function bindManageSecurityForm() {
  const form = document.getElementById('manageSecurityForm');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  const currentInput = document.getElementById('manageCurrentCode');
  const newInput = document.getElementById('manageNewCode');
  const confirmInput = document.getElementById('manageConfirmCode');
  const message = document.getElementById('manageSecurityMessage');

  function setMessage(text, isError) {
    message.textContent = text;
    message.classList.remove('d-none', 'text-danger', 'text-success');
    message.classList.add(isError ? 'text-danger' : 'text-success');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentCode = currentInput.value.trim();
    const newCode = newInput.value.trim();
    const confirmCode = confirmInput.value.trim();

    if (currentCode !== getManageAccessCode()) {
      setMessage('Huidige code is onjuist.', true);
      return;
    }
    if (newCode.length < 4) {
      setMessage('Nieuwe code moet minimaal 4 tekens hebben.', true);
      return;
    }
    if (newCode !== confirmCode) {
      setMessage('Nieuwe code en bevestiging komen niet overeen.', true);
      return;
    }

    if (!setManageAccessCode(newCode)) {
      setMessage('Opslaan mislukt. Probeer opnieuw.', true);
      return;
    }

    form.reset();
    setMessage('Logincode succesvol bijgewerkt.', false);
  });
}

function showManageGate() {
  const manageApp = document.getElementById('manageApp');
  if (!manageApp) return;

  manageApp.classList.add('d-none');

  const gate = document.createElement('section');
  gate.className = 'container page-shell';
  gate.id = 'manageAccessGate';
  gate.innerHTML = `
    <div class="manage-gate-panel p-4 p-md-5">
      <p class="mono-title">Beveiligde omgeving</p>
      <h1 class="section-title">Beheer login</h1>
      <p class="text-secondary mb-4">Voer je toegangscode in om de beheerpagina te openen.</p>
      <form id="manageAccessForm" class="row g-3">
        <div class="col-12">
          <label for="manageAccessCode" class="form-label">Toegangscode</label>
          <input id="manageAccessCode" class="form-control" type="password" required autocomplete="off" />
        </div>
        <div class="col-12 d-flex gap-2">
          <button class="btn btn-bw" type="submit">Inloggen</button>
        </div>
        <div class="col-12">
          <p id="manageAccessError" class="small text-danger mb-0 d-none">Onjuiste code. Probeer opnieuw.</p>
        </div>
      </form>
    </div>
  `;
  document.body.insertBefore(gate, manageApp);

  const form = gate.querySelector('#manageAccessForm');
  const codeInput = gate.querySelector('#manageAccessCode');
  const error = gate.querySelector('#manageAccessError');
  codeInput.focus();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = codeInput.value.trim();
    if (code !== getManageAccessCode()) {
      error.classList.remove('d-none');
      return;
    }

    sessionStorage.setItem(MANAGE_SESSION_KEY, '1');
    gate.remove();
    manageApp.classList.remove('d-none');
    initManageFeatures();
    bindManageLogout();
  });
}

function protectManagePage() {
  const manageApp = document.getElementById('manageApp');
  if (!manageApp) return;

  if (sessionStorage.getItem(MANAGE_SESSION_KEY) === '1') {
    initManageFeatures();
    bindManageLogout();
    return;
  }

  showManageGate();
}

function getA11yPrefs() {
  try {
    const raw = localStorage.getItem(A11Y_PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      largeText: Boolean(parsed?.largeText),
      highContrast: Boolean(parsed?.highContrast)
    };
  } catch (error) {
    return { largeText: false, highContrast: false };
  }
}

function saveA11yPrefs(prefs) {
  try {
    localStorage.setItem(A11Y_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    // Ignore preference save errors.
  }
}

function applyA11yPrefs(prefs) {
  document.body.classList.toggle('a11y-large-text', Boolean(prefs.largeText));
  document.body.classList.toggle('a11y-high-contrast', Boolean(prefs.highContrast));
  document.querySelectorAll('.js-a11y-text').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(Boolean(prefs.largeText)));
  });
  document.querySelectorAll('.js-a11y-contrast').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(Boolean(prefs.highContrast)));
  });
}

function injectSkipLink() {
  if (document.querySelector('.skip-link')) return;
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.id) main.id = 'mainContent';
  const skip = document.createElement('a');
  skip.href = `#${main.id}`;
  skip.className = 'skip-link';
  skip.textContent = 'Ga direct naar de inhoud';
  document.body.insertBefore(skip, document.body.firstChild);
}

function injectA11yWidget() {
  if (document.getElementById('a11yWidget')) return;
  const widget = document.createElement('div');
  widget.id = 'a11yWidget';
  widget.className = 'a11y-widget';
  widget.innerHTML = `
    <p class="a11y-title mb-2">Toegankelijkheid</p>
    <div class="d-flex gap-2 flex-wrap">
      <button type="button" class="btn btn-outline-bw btn-sm js-a11y-text" aria-pressed="false">Grotere tekst</button>
      <button type="button" class="btn btn-outline-bw btn-sm js-a11y-contrast" aria-pressed="false">Hoog contrast</button>
    </div>
  `;
  document.body.appendChild(widget);
}

function bindAccessibilityFeatures() {
  injectSkipLink();
  injectA11yWidget();
  ensureLiveRegion();

  const prefs = getA11yPrefs();
  applyA11yPrefs(prefs);

  document.addEventListener('click', (event) => {
    const textBtn = event.target.closest('.js-a11y-text');
    if (textBtn) {
      const next = { ...getA11yPrefs(), largeText: !document.body.classList.contains('a11y-large-text') };
      applyA11yPrefs(next);
      saveA11yPrefs(next);
      announce(next.largeText ? 'Grotere tekst ingeschakeld.' : 'Grotere tekst uitgeschakeld.');
      return;
    }

    const contrastBtn = event.target.closest('.js-a11y-contrast');
    if (contrastBtn) {
      const next = { ...getA11yPrefs(), highContrast: !document.body.classList.contains('a11y-high-contrast') };
      applyA11yPrefs(next);
      saveA11yPrefs(next);
      announce(next.highContrast ? 'Hoog contrast ingeschakeld.' : 'Hoog contrast uitgeschakeld.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  normalizeStoredListImages(CART_KEY);
  normalizeStoredListImages(FAVORITES_KEY);
  normalizeStoredListImages(CUSTOM_PRODUCTS_KEY);

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (target.dataset.fallbackApplied === '1') return;
    target.dataset.fallbackApplied = '1';
    target.src = 'jpg/gedicht.jpeg';
  }, true);

  ensurePublishedTrackingDates();
  updateBadges();
  renderHomeFavoritesCarousel();
  renderHomepageFeaturedSections();
  renderCustomProductsOnShopPages();
  renderFavoritesPage();
  renderCartPage();
  applyPublishedProductVisibility();
  bindActionButtons();
  bindCheckoutForm();
  bindInteractiveUI();
  bindThemeToggle();
  bindAccessibilityFeatures();
  protectManagePage();
});
