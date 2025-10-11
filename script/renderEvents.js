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

    function createDetailParagraph(detail, language) {
        const paragraph = document.createElement("p");
        applyText(paragraph, language, detail.key, detail.text);
        return paragraph;
    }

    function createEventCard(event, language) {
        const detailsElement = document.createElement("details");
        detailsElement.className = "event-card";

        if (event.id) {
            detailsElement.dataset.eventId = event.id;
        }

        if (event.endDate) {
            detailsElement.dataset.eventEnd = event.endDate;
        }

        const summary = document.createElement("summary");

        const summaryContent = document.createElement("div");
        summaryContent.className = "event-summary";

        const title = document.createElement("h2");
        title.className = "event-name";
        applyText(title, language, event.nameKey, event.name);

        const date = document.createElement("p");
        date.className = "event-date";
        applyText(date, language, event.dateKey, event.date);

        summaryContent.appendChild(title);
        summaryContent.appendChild(date);

        const tagGroup = document.createElement("div");
        tagGroup.className = "event-tags";

        const tag = document.createElement("span");
        tag.className = "event-pill";
        applyText(tag, language, event.tagKey, event.tagLabel);
        tagGroup.appendChild(tag);

        summary.appendChild(summaryContent);
        summary.appendChild(tagGroup);

        const detailsContainer = document.createElement("div");
        detailsContainer.className = "event-details";

        if (Array.isArray(event.details)) {
            event.details.forEach((detail) => {
                if (!detail) {
                    return;
                }

                detailsContainer.appendChild(createDetailParagraph(detail, language));
            });
        }

        detailsElement.appendChild(summary);
        detailsElement.appendChild(detailsContainer);

        return detailsElement;
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
