(function renderEvents() {
    const EVENTS_JSON_PATH = "./data/events.json";
    const CONTAINER_SELECTOR = "[data-events-container]";
    const EMPTY_SELECTOR = "[data-events-empty]";

    let events = [];
    let container;
    let emptyState;

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

    function createEventCard(event, language) {
        const detailUrl = event.slug
            ? `event.html?slug=${encodeURIComponent(event.slug)}`
            : event.id
                ? `event.html?id=${encodeURIComponent(event.id)}`
                : "event.html";

        const card = document.createElement("a");
        card.className = "event-card";
        card.href = detailUrl;
        const eventNameLabel = applyTextToString(
            language,
            event.nameKey,
            event.name,
            ""
        ).trim();
        const ariaLabel = eventNameLabel
            ? language === "sv"
                ? `Visa ${eventNameLabel}`
                : `View ${eventNameLabel}`
            : language === "sv"
                ? "Visa evenemang"
                : "View event";
        card.setAttribute("aria-label", ariaLabel);

        if (event.id) {
            card.dataset.eventId = event.id;
        }

        if (event.endDate) {
            card.dataset.eventEnd = event.endDate;
        }

        const body = document.createElement("div");
        body.className = "event-card__body";

        const title = document.createElement("h2");
        title.className = "event-name";
        applyText(title, language, event.nameKey, event.name);

        const date = document.createElement("p");
        date.className = "event-date";
        applyText(date, language, event.dateKey, event.date);

        const summaryContent = document.createElement("div");
        summaryContent.className = "event-summary";
        summaryContent.appendChild(title);
        summaryContent.appendChild(date);

        const footer = document.createElement("div");
        footer.className = "event-card__footer";

        const tag = document.createElement("span");
        tag.className = "event-pill";
        applyText(tag, language, event.tagKey, event.tagLabel);

        const tagsWrapper = document.createElement("div");
        tagsWrapper.className = "event-tags";
        tagsWrapper.appendChild(tag);

        footer.appendChild(tagsWrapper);

        body.appendChild(summaryContent);
        body.appendChild(footer);

        card.appendChild(body);
        return card;
    }

    function applyTextToString(language, key, fallback, defaultLabel) {
        if (!key) {
            return fallback || defaultLabel;
        }
        const translated = getTranslation(language, key, fallback);
        return translated || defaultLabel;
    }

    function clearExistingCards() {
        if (!container) {
            return;
        }

        const cards = container.querySelectorAll(".event-card");
        cards.forEach((card) => card.remove());
    }

    function setEmptyState(message, visible) {
        if (!emptyState) {
            return;
        }

        if (typeof message === "string") {
            emptyState.textContent = message;
        }

        if (visible) {
            emptyState.removeAttribute("hidden");
        } else {
            emptyState.setAttribute("hidden", "");
        }
    }

    function render(language) {
        if (!container) {
            return;
        }

        clearExistingCards();

        if (!events.length) {
            setEmptyState("No scheduled events right now.", true);
            return;
        }

        setEmptyState("", false);

        const fragment = document.createDocumentFragment();

        events.forEach((event) => {
            fragment.appendChild(createEventCard(event, language));
        });

        container.appendChild(fragment);

        window.dispatchEvent(new CustomEvent("eventsrendered", {
            detail: { language }
        }));
    }

    async function loadEvents() {
        const response = await fetch(EVENTS_JSON_PATH, { cache: "no-cache" });

        if (!response.ok) {
            throw new Error(`Failed to load events: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Events data is not an array.");
        }

        return data;
    }

    document.addEventListener("DOMContentLoaded", async () => {
        container = document.querySelector(CONTAINER_SELECTOR);
        if (!container) {
            return;
        }

        emptyState = container.querySelector(EMPTY_SELECTOR);

        try {
            events = await loadEvents();
            render(document.documentElement.lang || "en");
        } catch (error) {
            console.error(error);
            setEmptyState("Unable to load events right now.", true);
        }
    });

    window.addEventListener("languagechange", (event) => {
        if (!events.length || !container) {
            return;
        }

        const language = event.detail?.language || document.documentElement.lang || "en";
        render(language);
    });
})();
