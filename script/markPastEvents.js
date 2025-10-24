(function markPastEvents() {
    const STATUS_KEY = "event-status-completed";

    function getTranslation(language, key, fallback) {
        if (typeof translations === "undefined") {
            return fallback;
        }

        const languageSet = translations[language];
        return languageSet && languageSet[key] ? languageSet[key] : fallback;
    }

    function parseEventEnd(value) {
        if (!value) {
            return null;
        }

        const parts = value.split("-").map((segment) => parseInt(segment, 10));

        if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
            return null;
        }

        const [year, month, day] = parts;
        return new Date(year, month - 1, day, 23, 59, 59, 999);
    }

    function ensureTagGroup(card) {

        let group = card.querySelector(".event-tags");

        if (group) {
            return group;
        }

        const footer = card.querySelector(".event-card__footer") || card.querySelector(".event-card__body") || card;

        group = document.createElement("div");
        group.className = "event-tags";
        footer.appendChild(group);

        return group;
    }

    function ensureCompletedStatus(card, label) {
        const group = ensureTagGroup(card);
        if (!group) {
            return;
        }

        let status = card.querySelector(".event-status--completed");

        if (!status) {
            status = document.createElement("span");
            status.className = "event-status event-status--completed";
            status.setAttribute("data-lang", STATUS_KEY);
            group.appendChild(status);
        }

        status.textContent = label;
    }

    function removeCompletedStatus(card) {
        const status = card.querySelector(".event-status--completed");
        if (status) {
            status.remove();
        }
    }

    function refreshStatuses(language) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const label = getTranslation(language, STATUS_KEY, "Completed");

        document.querySelectorAll(".event-card[data-event-end]").forEach((card) => {
            const endDate = parseEventEnd(card.dataset.eventEnd);

            if (!endDate) {
                return;
            }

            if (endDate.getTime() < today.getTime()) {
                card.classList.add("event-card--past");
                ensureCompletedStatus(card, label);
            } else {
                card.classList.remove("event-card--past");
                removeCompletedStatus(card);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const currentLanguage = document.documentElement.lang || "en";
        document.querySelectorAll(".event-card").forEach((card) => ensureTagGroup(card));
        refreshStatuses(currentLanguage);
    });

    window.addEventListener("languagechange", (event) => {
        const language = event.detail?.language || document.documentElement.lang || "en";
        refreshStatuses(language);
    });

    window.addEventListener("eventsrendered", (event) => {
        const language = event.detail?.language || document.documentElement.lang || "en";
        document.querySelectorAll(".event-card").forEach((card) => ensureTagGroup(card));
        refreshStatuses(language);
    });
})();
