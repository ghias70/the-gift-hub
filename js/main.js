const pageLoader = document.querySelector("#page-loader");

if (pageLoader) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const minTime = reduceMotion ? 250 : 1200;
  const started = performance.now();
  let closed = false;

  const heroImage = document.querySelector(".hero-photo");
  const heroReady = !heroImage || heroImage.complete
    ? Promise.resolve()
    : new Promise((resolve) => {
        heroImage.addEventListener("load", resolve, { once: true });
        heroImage.addEventListener("error", resolve, { once: true });
      });

  const finishLoader = () => {
    if (closed) return;
    closed = true;
    const wait = Math.max(0, minTime - (performance.now() - started));
    window.setTimeout(() => {
      pageLoader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      window.setTimeout(() => pageLoader.remove(), 480);
    }, wait);
  };

  Promise.race([
    heroReady,
    new Promise((resolve) => window.setTimeout(resolve, 1800))
  ]).then(finishLoader);
}

const categoryLabels = {
  all: "all products",
  toys: "kids' toys",
  electronics: "electronics",
  gifts: "gift items",
  new: "new arrivals"
};

const categoryNames = {
  toys: "Kids' Toys",
  electronics: "Electronics",
  gifts: "Gift Items"
};

const searchToggle = document.querySelector("#search-toggle");
const searchPanel = document.querySelector("#search-panel");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#product-search");
const searchClear = document.querySelector("#search-clear");
const menuToggle = document.querySelector("#menu-toggle");
const nav = document.querySelector("#site-nav");
const status = document.querySelector("#product-status");
const emptyNote = document.querySelector("#empty-note");
const clearFilters = document.querySelector("#clear-filters");
const cards = [...document.querySelectorAll(".product-card")];
const categoryLinks = [...document.querySelectorAll("[data-category]")];
const dialog = document.querySelector("#product-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogKicker = document.querySelector("#dialog-kicker");
const dialogTitle = document.querySelector("#dialog-title");
const dialogPrice = document.querySelector("#dialog-price");
const dialogBlurb = document.querySelector("#dialog-blurb");
const dialogClose = document.querySelector("#dialog-close");
const dialogVisit = document.querySelector("#dialog-visit");

let category = "all";
let query = "";

function haystack(card) {
  return `${card.dataset.name} ${card.dataset.category}`.toLowerCase();
}

function applyFilters() {
  const needle = query.trim().toLowerCase();
  let visible = 0;

  cards.forEach((card) => {
    const matchesCategory =
      category === "all" ||
      card.dataset.category === category ||
      (category === "new" && card.dataset.new === "true");
    const matchesQuery = !needle || haystack(card).includes(needle);
    const show = matchesCategory && matchesQuery;
    card.hidden = !show;
    if (show) visible += 1;
  });

  const label = categoryLabels[category] || "products";
  if (!visible) {
    status.textContent = needle ? `No matches for “${query.trim()}”` : `No ${label} to show`;
  } else if (needle) {
    status.textContent = `Showing ${visible} match${visible === 1 ? "" : "es"} for “${query.trim()}” in ${label}`;
  } else if (category === "all") {
    status.textContent = `Showing all ${visible} products`;
  } else {
    status.textContent = `Showing ${visible} ${label}`;
  }
  emptyNote.hidden = visible !== 0;
  clearFilters.hidden = category === "all" && !needle;

  document.querySelectorAll(".category-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.category === category);
  });

  document.querySelectorAll(".nav a").forEach((link) => {
    const match = link.dataset.category && link.dataset.category === category;
    if (match) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function closeMenu() {
  nav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.querySelector(".visually-hidden").textContent = "Open menu";
  document.body.classList.remove("nav-open");
}

function openSearch() {
  searchPanel.hidden = false;
  searchToggle.setAttribute("aria-expanded", "true");
  searchInput.focus();
}

function closeSearch() {
  searchPanel.hidden = true;
  searchToggle.setAttribute("aria-expanded", "false");
}

searchToggle.addEventListener("click", () => {
  closeMenu();
  if (searchPanel.hidden) openSearch();
  else closeSearch();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  query = searchInput.value;
  applyFilters();
  document.querySelector("#picks").scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", () => {
  query = searchInput.value;
  applyFilters();
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  query = "";
  applyFilters();
  searchInput.focus();
});

menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  if (open) {
    closeMenu();
    return;
  }
  closeSearch();
  nav.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.querySelector(".visually-hidden").textContent = "Close menu";
  document.body.classList.add("nav-open");
});

categoryLinks.forEach((link) => {
  link.addEventListener("click", () => {
    category = link.dataset.category;
    applyFilters();
    closeMenu();
  });
});

document.querySelectorAll('a[href="#visit"]').forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
    if (!link.closest(".nav")) return;
    document.querySelectorAll(".nav a").forEach((item) => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");
  });
});

clearFilters.addEventListener("click", () => {
  category = "all";
  query = "";
  searchInput.value = "";
  applyFilters();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeSearch();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) closeMenu();
});

cards.forEach((card) => {
  card.querySelector(".details-btn").addEventListener("click", () => {
    const image = card.querySelector("img");
    dialogImage.src = image.src;
    dialogImage.alt = image.alt;
    const bits = [categoryNames[card.dataset.category]];
    if (card.dataset.new === "true") bits.push("New");
    dialogKicker.textContent = bits.join(" · ");
    dialogTitle.textContent = card.dataset.name;
    dialogPrice.textContent = card.dataset.price;
    dialogBlurb.textContent = card.dataset.blurb;
    dialog.showModal();
  });
});

dialogClose.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialogVisit.addEventListener("click", () => dialog.close());

applyFilters();
