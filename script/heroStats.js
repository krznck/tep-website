// Populate hero stats with live counts from JSON data sources.
(function initializeHeroStats() {
    const projectCountEl = document.getElementById("hero-project-count");
    const eventCountEl = document.getElementById("hero-event-count");
    const nextEventNameEl = document.getElementById("hero-next-event-name");
    const nextEventDateEl = document.getElementById("hero-next-event-date");

    if (!projectCountEl && !eventCountEl && !nextEventNameEl) {
        return;
    }

    const state = {
        nextEvent: null
    };

    function setFallbackValues() {
        if (projectCountEl) projectCountEl.textContent = "—";
        if (eventCountEl) eventCountEl.textContent = "—";
        if (nextEventNameEl) nextEventNameEl.textContent = "—";
        if (nextEventDateEl) nextEventDateEl.textContent = "";
    }

    function resolveTranslation(key, lang) {
        if (!key) {
            return null;
        }

        let dictionaries = null;
        if (window.translations) {
            dictionaries = window.translations;
        } else if (typeof translations !== "undefined") {
            dictionaries = translations;
        }

        if (!dictionaries) {
            return null;
        }

        const dictionary = dictionaries[lang];
        if (!dictionary) {
            return null;
        }
        return dictionary[key] || null;
    }

    function updateNextEventCopy(lang) {
        if (!nextEventNameEl || !state.nextEvent) {
            return;
        }

        const { name, nameKey, date, dateKey } = state.nextEvent;
        const translatedName = resolveTranslation(nameKey, lang) || name || "—";
        const translatedDate = resolveTranslation(dateKey, lang) || date || "";

        nextEventNameEl.textContent = translatedName;
        nextEventDateEl.textContent = translatedDate;
    }

    function getComparableDate(event) {
        if (event && event.endDate) {
            const parsed = Date.parse(event.endDate);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return Number.MAX_SAFE_INTEGER;
    }

    async function loadHeroStats() {
        try {
            const [projects, events] = await Promise.all([
                fetch("./data/projects.json").then((res) => {
                    if (!res.ok) throw new Error("Project data failed");
                    return res.json();
                }),
                fetch("./data/events.json").then((res) => {
                    if (!res.ok) throw new Error("Event data failed");
                    return res.json();
                })
            ]);

            if (Array.isArray(projects) && projectCountEl) {
                projectCountEl.textContent = projects.length.toString();
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let upcomingEvents = [];

            if (Array.isArray(events)) {
                upcomingEvents = events.filter((event) => {
                    const compareDate = getComparableDate(event);
                    return compareDate === Number.MAX_SAFE_INTEGER || compareDate >= today.getTime();
                });

                if (eventCountEl) {
                    eventCountEl.textContent = upcomingEvents.length.toString();
                }

                upcomingEvents.sort((a, b) => getComparableDate(a) - getComparableDate(b));
                state.nextEvent = upcomingEvents[0] || events[0] || null;
                updateNextEventCopy(document.documentElement.lang || "en");
            }
        } catch (error) {
            console.error("Failed to load hero stats", error);
            setFallbackValues();
        }
    }

    loadHeroStats();
    window.addEventListener("languagechange", (event) => {
        const lang = (event && event.detail && event.detail.language) || document.documentElement.lang || "en";
        updateNextEventCopy(lang);
    });
})();
