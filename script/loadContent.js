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
    "team-title": "Our Team",
    "team-description": "Our team consists of students from around the world studying various programs at LNU."
},
sv: {
    "member1-name": "Medlem 1",
    "member1-info": "Programnamn, studieår",
    "member1-quote": "Här skriver jag på svenska !!!",
    "about-title": "Om Oss",
    "about-description": "Vi är en grupp studenter som deltar i olika projekt på universitetet. Vi hjälper andra studenter som handledare i labbsessioner, bidrar till den pågående forskningen på universitetet och stödjer samhällsarbetet som görs för att intressera fler för datavetenskap och programmering.",
    "header-projects": "Projekt",
    "header-aboutUs": "Om Oss",
    "header-contact": "Kontakta Oss",
    "header-english": "Svenska",
    "header-swedish": "Engelska",
    "TEP-description": "Det pedagogiska handledningsprogrammet är utformat för att erbjuda studenter möjligheten att arbeta med universitetet som handledare, att få erfarenhet av forskning och att delta i samhällsarbete.",
    "event-section-title": "Vad händer?",
    "event1-title": "Projekt 1",
    "event1-description": "Id voluptate praesentium voluptatum fugiat quod porro quasi dignissimos aspernatur amet rem nobis eos odio molestias, sequi cupiditate quos, nihil suscipit officiis repellat.",
    "event2-title": "Forskning",
    "event2-description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi facilis saepe cupiditate impedit autem repellat sint velit inventore ipsam nihil?",
    "event3-title": "Samhällsarbete",
    "event3-description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia deleniti accusantium eligendi eius ipsam officia ad magnam similique minus rem iusto velit placeat, repellat veritatis?",
    "team-title": "Vår Team",
    "team-description": "Vårt team består av studenter från hela världen som studerar olika program vid LNU."
}
};

// Load the saved language as early as possible
function loadSavedLanguage() {
    const savedLanguage = getCookie("selectedLanguage") || "en";
    document.documentElement.lang = savedLanguage; // Set language at document level immediately
}

// Apply language before DOM is fully loaded
loadSavedLanguage();

document.addEventListener("DOMContentLoaded", function () {
    loadHTML('./header.html', 'header-section', () => {
        initializeMenu(); // Ensure menu works after loading
        attachLanguageToggle(); // Attach language toggle after header is loaded
        changeLanguage(document.documentElement.lang); // Apply translations after header loads
    });

    loadHTML('./footer.html', 'footer-row');
});

// Function to get a cookie
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

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

// Function to change language
function changeLanguage(language) {
    document.documentElement.lang = language;
    setCookie("selectedLanguage", language, 30); // Save language preference

    const elements = document.querySelectorAll("[data-lang]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-lang");
        if (translations[language][key]) {
            el.textContent = translations[language][key];
        }
    });
}

// Attach language toggle event
function attachLanguageToggle() {
    const button = document.getElementById("change-language");
    const menu = document.getElementById("menu");
    const listContainer = document.getElementsByClassName("nav__items-con")[0];
    const body = document.querySelector("body");

    if (button) {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const currentLang = document.documentElement.lang || "en";
            const newLang = currentLang === "en" ? "sv" : "en";
            changeLanguage(newLang);

            // Close menu if open
            if (menu.classList.contains("openmenu")) {
                menu.classList.remove("openmenu");
                listContainer.style.display = "none";
                body.style.overflow = "scroll";
            }
        });
    } else {
        console.error("Language toggle button not found.");
    }
}

// Function to initialize the hamburger menu after loading
function initializeMenu() {
    const menu = document.getElementById("menu");
    const listContainer = document.getElementsByClassName("nav__items-con")[0];
    const body = document.querySelector("body");

    menu.onclick = function () {
        menu.classList.toggle("openmenu");
        if (menu.classList.contains("openmenu")) {
            listContainer.style.display = "block";
            body.style.overflow = "hidden";
        } else {
            listContainer.style.display = "none";
            body.style.overflow = "scroll";
        }
    };

    // Ensure menu resets properly when resizing screen
    window.addEventListener("resize", () => {
        if (window.innerWidth > 750) { 
            // Reset menu for larger screens
            menu.classList.remove("openmenu");
            listContainer.style.display = "";
            body.style.overflow = "scroll"; 
        } else {
            // On small screens, hide menu if not open
            if (!menu.classList.contains("openmenu")) {
                listContainer.style.display = "none";
            }
        }
    });
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
                
                changeLanguage(document.documentElement.lang || 'en');

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

// document.addEventListener("DOMContentLoaded", function () {
//     loadHTML('./header.html', 'header-section', () => {
//         initializeMenu(); // Ensure menu works after loading
//         attachLanguageToggle(); // Attach language toggle after header is loaded
//         loadSavedLanguage(); // Load the saved language after everything is ready
//     });

//     loadHTML('./footer.html', 'footer-row');
// });