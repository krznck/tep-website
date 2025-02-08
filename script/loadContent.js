// Language translations
const translations = {
  en: {
    "member1-name": "Member 1",
    "member1-info": "Program name, year of studies",
    "member1-quote": "Here I am writing in English!",
    "about-title": "About Us",
    "about-description": "We are a group of students who take part in different projects at the university. We help other students as Teaching Assistants in Lab Sessions, we contribute to the current research going on at the university, and support the community work that is done to interest more people in computer science and programming.",
    "header-projects": "Projects",
    "header-aboutUs": "About",
    "header-contact": "Contact",
    "header-english": "English",
    "header-swedish": "Swedish",
    "TEP-description": "The Tutorial Educational Program is designed to offer students the possibility to work with the university as a Teaching Assistant, to gain some experience with research and to take part in community outreach.",
    "event-section-title": "What's happening?",
    "event1-title": "Project 1",
    "event1-description": "Id voluptate praesentium voluptatum fugiat quod porro quasi dignissimos aspernatur amet rem nobis eos odio molestias, sequi cupiditate quos, nihil suscipit officiis repellat.",
    "event2-title": "Research",
    "event2-description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi facilis saepe cupiditate impedit autem repellat sint velit inventore ipsam nihil?",
    "event3-title": "Community Outreach",
    "event3-description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia deleniti accusantium eligendi eius ipsam officia ad magnam similique minus rem iusto velit placeat, repellat veritatis?",
    "team-title": "Our Team"
},
sv: {
    "member1-name": "Medlem 1",
    "member1-info": "Program, år",
    "member1-quote": "Här skriver jag på svenska !!!",
    "about-title": "Om Oss",
    "about-description": "Vi är en grupp studenter som deltar i olika projekt på universitet. Vi hjälper andra studenter genom vårt arbete som amanuens i olika kurser, deltar i pågående forskningsprojekt på universitetet och bidrar med samhällsuppsökande verksamhet som har som mål att intressera fler i datavetenskap och programmering.",
    "header-projects": "Projekt",
    "header-aboutUs": "Om Oss",
    "header-contact": "Kontakta Oss",
    "header-english": "Svenska",
    "header-swedish": "Engelska",
    "TEP-description": "Tutorial Educational Programmet är tänkt att ge en möjlighet för studenter att genom arbete på universitetet få erfarenhet av att jobba som amanuens, få bidra till pågående forskning och delta i samhällsuppsökande verksamhet.",
    "event-section-title": "Pågående",
    "event1-title": "Projekt 1",
    "event1-description": "Id voluptate praesentium voluptatum fugiat quod porro quasi dignissimos aspernatur amet rem nobis eos odio molestias, sequi cupiditate quos, nihil suscipit officiis repellat.",
    "event2-title": "Forskning",
    "event2-description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi facilis saepe cupiditate impedit autem repellat sint velit inventore ipsam nihil?",
    "event3-title": "Samhällsarbete",
    "event3-description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia deleniti accusantium eligendi eius ipsam officia ad magnam similique minus rem iusto velit placeat, repellat veritatis?",
    "team-title": "Vårt Team"
}
};

// Sets a cookie, ostensibly to remember the chosen language
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // calculates when the cookie should expire based on the days parameter
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

// Gets a cookie, ostensibly to check on load what language to use
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return value;
        }
    }
    return null;
}

// Changes the language, and stores the change inside a cookie
function changeLanguage(language) {
    document.documentElement.lang = language;
    setCookie("selectedLanguage", language, 30); // we set expiry to 30 days

    const elements = document.querySelectorAll("[data-lang]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-lang");
        if (translations[language][key]) {
            el.textContent = translations[language][key];
        }
    });
}

// Makes the button for changing language call the changeLanguage function
function attachLanguageToggle() {
    const button = document.getElementById("change-language");
    if (button) {
        button.addEventListener("click", (e) => {
            e.preventDefault(); // prevents scrolling to the top
            const currentLang = document.documentElement.lang || "en";
            const newLang = currentLang === "en" ? "sv" : "en";
            changeLanguage(newLang); // we toggled the language, so we want to change nad remember that change
        });
    } else {
        console.error("Language toggle button not found.");
    }
}

// Loads the language from a cookie, and defaults to English
function loadSavedLanguage() {
    const savedLanguage = getCookie("selectedLanguage") || "en";
    changeLanguage(savedLanguage);
}

// Function to load content dynamically
function loadHTML(filePath, targetElementId, callback = null) {
    console.log(`Attempting to load ${filePath} into #${targetElementId}`);
    
    fetch(filePath)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            return response.text();
        })
        .then((htmlContent) => {
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = htmlContent;
                console.log(`Successfully loaded ${filePath} into #${targetElementId}`);
                
                // the dynamically-added content also needs to be given the appropriate language
                changeLanguage(document.documentElement.lang || 'en');

                // needed to attach the language toggling after the header has loaded
                if (callback) {
                    callback();
                }
            } else {
                console.error(`Target element with ID '${targetElementId}' not found.`);
            }
        })
        .catch((error) => {
            console.error(`Error loading ${filePath}:`, error);
        });
}

document.addEventListener("DOMContentLoaded", loadSavedLanguage);
loadHTML('../header.html', 'header-section', attachLanguageToggle); // header is given the language button
loadHTML('../footer.html', 'footer-row');