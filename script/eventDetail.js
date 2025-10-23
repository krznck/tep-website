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

    function resolveTextContent(language, item, fallback) {
        if (typeof item === "string") {
            return item;
        }

        if (item && typeof item === "object") {
            if (item.key) {
                return getTranslation(language, item.key, item.text || fallback || "");
            }
            if (item.text) {
                return item.text;
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
        renderHighlights(selectedEvent, language);
        renderDescription(selectedEvent, language);
        renderQuickInfo(selectedEvent, language);
        renderExtras(selectedEvent, language);
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

        const heroImageData = event.heroImage && event.heroImage.src ? event.heroImage : null;
        const images = Array.isArray(event.images) ? event.images : [];
        const firstImage = images.find(Boolean);

        let src = HERO_PLACEHOLDER;
        let alt = language === "sv"
            ? `Platsbild för ${safeTitle}`
            : `Placeholder visual for ${safeTitle}`;

        if (heroImageData) {
            src = heroImageData.src;
            if (heroImageData.alt) {
                alt = heroImageData.alt;
            } else {
                alt = language === "sv"
                    ? `Illustration av ${safeTitle}`
                    : `Illustration of ${safeTitle}`;
            }
        } else if (firstImage) {
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

    function renderHighlights(event, language) {
        const list = document.getElementById("event-highlights");
        if (!list) {
            return;
        }

        const heading = document.getElementById("event-highlights-heading");
        if (heading && event.highlightsHeading) {
            heading.textContent = resolveTextContent(language, event.highlightsHeading, "Highlights");
        }

        list.innerHTML = "";

        const highlights = Array.isArray(event.highlights) ? event.highlights : [];

        highlights.forEach((item) => {
            const text = resolveTextContent(language, item, "");
            if (!text) {
                return;
            }
            const li = document.createElement("li");
            li.textContent = text;
            list.appendChild(li);
        });

        if (!list.children.length) {
            const li = document.createElement("li");
            li.textContent = "Text goes here.";
            list.appendChild(li);
        }
    }

    function renderDescription(event, language) {
        const overviewHeading = document.getElementById("event-overview-heading");
        const overviewContainer = document.getElementById("event-overview");
        const expectationsHeading = document.getElementById("event-expectations-heading");
        const expectationsContainer = document.getElementById("event-expectations");

        if (overviewHeading && event.overviewHeading) {
            overviewHeading.textContent = resolveTextContent(language, event.overviewHeading, "Overview");
        }

        if (expectationsHeading && event.expectationsHeading) {
            expectationsHeading.textContent = resolveTextContent(language, event.expectationsHeading, "What to expect");
        }

        fillTextBlock(overviewContainer, event.overview, language, ["Text goes here."]);
        fillTextBlock(expectationsContainer, event.expectations, language, ["More text goes here."]);
    }

    function renderQuickInfo(event, language) {
        const quickInfo = document.getElementById("event-quick-info");
        if (!quickInfo) {
            return;
        }

        quickInfo.innerHTML = "";

        const items = Array.isArray(event.details) ? event.details.filter(Boolean).slice(0, 3) : [];

        if (items.length) {
            items.forEach((detail) => {
                const badge = document.createElement("li");
                applyText(badge, language, detail.key, detail.text || "");
                if (!badge.textContent.trim()) {
                    badge.textContent = language === "sv" ? "Info kommer snart" : "Details coming soon";
                }
                quickInfo.appendChild(badge);
            });
            return;
        }

        const fallback = document.createElement("li");
        fallback.textContent = language === "sv" ? "Info kommer snart" : "Details coming soon";
        quickInfo.appendChild(fallback);
    }

    function renderExtras(event, language) {
        const scheduleHeading = document.getElementById("event-schedule-heading");
        const scheduleContainer = document.getElementById("event-schedule");
        const participationHeading = document.getElementById("event-participation-heading");
        const participationContainer = document.getElementById("event-participation");

        if (scheduleHeading && event.scheduleHeading) {
            scheduleHeading.textContent = resolveTextContent(language, event.scheduleHeading, "Schedule");
        }

        if (participationHeading && event.participationHeading) {
            participationHeading.textContent = resolveTextContent(language, event.participationHeading, "Participation");
        }

        fillListBlock(scheduleContainer, event.schedule, language, ["Details coming soon."]);
        fillListBlock(participationContainer, event.participation, language, ["Text goes here."]);
    }

    function fillTextBlock(container, content, language, fallbackItems) {
        if (!container) {
            return;
        }

        container.innerHTML = "";

        const items = normalizeContentArray(content, language);
        const fallback = Array.isArray(fallbackItems) ? fallbackItems : ["Text goes here."];

        if (items.length) {
            items.forEach((text) => {
                if (!text) {
                    return;
                }
                const paragraph = document.createElement("p");
                paragraph.textContent = text;
                container.appendChild(paragraph);
            });
            return;
        }

        fallback.forEach((text) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = text;
            container.appendChild(paragraph);
        });
    }

    function fillListBlock(container, content, language, fallbackItems) {
        if (!container) {
            return;
        }

        container.innerHTML = "";

        const items = normalizeContentArray(content, language);
        const source = items.length ? items : (Array.isArray(fallbackItems) ? fallbackItems : ["Text goes here."]);

        source.forEach((text) => {
            const item = document.createElement("li");
            item.textContent = text;
            container.appendChild(item);
        });
    }

    function normalizeContentArray(content, language) {
        if (!content) {
            return [];
        }

        const source = Array.isArray(content) ? content : [content];

        return source
            .map((item) => resolveTextContent(language, item, ""))
            .map((text) => (typeof text === "string" ? enhanceInlineSpacing(text.trim()) : ""))
            .filter((text) => text.length > 0);
    }

    function enhanceInlineSpacing(value) {
        if (typeof value !== "string") {
            return "";
        }

        return value.replace(/(\d)\s([ap]m)\b/gi, "$1\u00a0$2");
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
