(function eventDetailPage() {
    const EVENTS_JSON_PATH = "./data/events.json";
    const HERO_PLACEHOLDER = "assets/events/placeholders/event-hero-placeholder.svg";

    let eventsCache = null;
    let selectedEvent = null;

    function getTranslation(language, key, fallback) {
        if (!key) {
            return fallback || "";
        }

        if (typeof translations !== "undefined") {
            const languageSet = translations[language];
            if (languageSet && typeof languageSet[key] === "string") {
                return languageSet[key];
            }
        }

        return fallback || "";
    }

    function applyText(element, language, key, fallback) {
        if (!element) {
            return;
        }
        if (key) {
            element.setAttribute("data-lang", key);
        }
        element.textContent = getTranslation(language, key, fallback);
    }

    async function loadEvents() {
        if (eventsCache) {
            return eventsCache;
        }

        const response = await fetch(EVENTS_JSON_PATH, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Failed to load events: ${response.status}`);
        }

        const payload = await response.json();
        if (!Array.isArray(payload)) {
            throw new Error("Events payload must be an array.");
        }

        eventsCache = payload;
        return eventsCache;
    }

    function findEvent(events, params) {
        const { slug, id } = params;

        if (slug) {
            const normalized = slug.toLowerCase();
            const bySlug = events.find((event) => event.slug && event.slug.toLowerCase() === normalized);
            if (bySlug) {
                return bySlug;
            }
        }

        if (id) {
            return events.find((event) => String(event.id) === String(id));
        }

        return undefined;
    }

    function toggleMissingState(showMissing) {
        const missing = document.getElementById("event-missing");
        const content = document.querySelector("[data-event-content]");

        if (!missing || !content) {
            return;
        }

        if (showMissing) {
            missing.removeAttribute("hidden");
            content.setAttribute("hidden", "");
        } else {
            missing.setAttribute("hidden", "");
            content.removeAttribute("hidden");
        }
    }

    function renderEvent(language) {
        if (!selectedEvent) {
            toggleMissingState(true);
            return;
        }

        toggleMissingState(false);

        const localizedTitle = getTranslation(language, selectedEvent.nameKey, selectedEvent.name);
        const localizedDate = getTranslation(language, selectedEvent.dateKey, selectedEvent.date);
        const localizedTag = getTranslation(language, selectedEvent.tagKey, selectedEvent.tagLabel);

        const titleEl = document.getElementById("event-title");
        const dateEl = document.getElementById("event-date");
        const tagEl = document.getElementById("event-tag");

        applyText(titleEl, language, selectedEvent.nameKey, selectedEvent.name || "Event title");
        applyText(dateEl, language, selectedEvent.dateKey, selectedEvent.date || "");
        applyText(tagEl, language, selectedEvent.tagKey, selectedEvent.tagLabel || "");

        const baseTitle = localizedTitle || "Event Overview";
        document.title = `${baseTitle} | TEP`;

        renderHeroImage(selectedEvent, language, baseTitle);
        renderDetails(selectedEvent, language);
        renderGallery(selectedEvent);
    }

    function renderHeroImage(event, language, title) {
        const heroImage = document.getElementById("event-hero-image");
        if (!heroImage) {
            return;
        }

        const baseTitle = title || getTranslation(language, event.nameKey, event.name || "Event");
        const safeTitle = baseTitle && baseTitle.trim().length
            ? baseTitle
            : language === "sv"
                ? "evenemanget"
                : "the event";

        const images = Array.isArray(event.images) ? event.images : [];
        const firstImage = images.find(Boolean);

        let src = HERO_PLACEHOLDER;
        let alt = language === "sv"
            ? `Platsbild för ${safeTitle}`
            : `Placeholder visual for ${safeTitle}`;

        if (firstImage) {
            if (typeof firstImage === "string") {
                src = firstImage;
                alt = baseTitle && baseTitle.trim().length ? baseTitle : alt;
            } else if (firstImage.src) {
                src = firstImage.src;
                if (firstImage.alt) {
                    alt = firstImage.alt;
                } else if (baseTitle && baseTitle.trim().length) {
                    alt = language === "sv"
                        ? `Illustration av ${baseTitle}`
                        : `Illustration of ${baseTitle}`;
                }
            }
        }

        heroImage.src = src;
        heroImage.alt = alt || (language === "sv" ? "Evenemangsbild" : "Event image placeholder");
    }

    function renderDetails(event, language) {
        const detailsList = document.getElementById("event-details");
        if (!detailsList) {
            return;
        }

        detailsList.innerHTML = "";

        if (Array.isArray(event.details) && event.details.length) {
            event.details.forEach((detail) => {
                if (!detail) {
                    return;
                }
                const item = document.createElement("li");
                applyText(item, language, detail.key, detail.text || "Text goes here.");
                detailsList.appendChild(item);
            });
            return;
        }

        ["Text goes here.", "More text goes here."].forEach((placeholder) => {
            const item = document.createElement("li");
            item.textContent = placeholder;
            detailsList.appendChild(item);
        });
    }

    function renderGallery(event) {
        const gallerySection = document.querySelector("[data-event-gallery]");
        const galleryContainer = document.getElementById("event-gallery");

        if (!gallerySection || !galleryContainer) {
            return;
        }

        galleryContainer.innerHTML = "";

        const images = Array.isArray(event.images) ? event.images : [];

        if (!images.length) {
            gallerySection.setAttribute("hidden", "");
            return;
        }

        images.forEach((entry) => {
            if (!entry) {
                return;
            }

            const src = typeof entry === "string" ? entry : entry.src;
            if (!src) {
                return;
            }

            const figure = document.createElement("figure");
            figure.className = "event-gallery-item";

            const img = document.createElement("img");
            img.src = src;
            img.alt = (typeof entry === "object" && entry.alt) ? entry.alt : "Event photo placeholder";
            figure.appendChild(img);

            if (typeof entry === "object" && entry.caption) {
                const caption = document.createElement("figcaption");
                caption.textContent = entry.caption;
                figure.appendChild(caption);
            }

            galleryContainer.appendChild(figure);
        });

        gallerySection.removeAttribute("hidden");
    }

    async function initialize() {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get("slug");
        const id = params.get("id");

        try {
            const events = await loadEvents();
            selectedEvent = findEvent(events, { slug, id });
            const language = window.getCurrentLanguage ? window.getCurrentLanguage() : (document.documentElement.lang || "en");
            renderEvent(language);
        } catch (error) {
            console.error("Unable to load event detail:", error);
            toggleMissingState(true);
        }
    }

    document.addEventListener("DOMContentLoaded", initialize);

    window.addEventListener("languagechange", (event) => {
        const language = event.detail?.language || document.documentElement.lang || "en";
        renderEvent(language);
    });
})();
