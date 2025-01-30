// Language translations
const translations = {
  en: {
    "member1-name": "Member 1",
    "member1-info": "Program name, year of studies",
    "member1-quote": "Here I am writing in English!",
    "about-title": "About Us",
    "about-description": "We are a group of students who take part in different projects at the university. We help other students as Teaching Assistants in Lab Sessions, we contribute to the current research going on at the university, and support the community work that is done to interest more people in computer science and programming."
},
sv: {
    "member1-name": "Medlem 1",
    "member1-info": "Programnamn, studieår",
    "member1-quote": "Här skriver jag på svenska !!!",
    "about-title": "Om Oss",
    "about-description": "Vi är en grupp studenter som deltar i olika projekt på universitetet. Vi hjälper andra studenter som handledare i labbsessioner, bidrar till den pågående forskningen på universitetet och stödjer samhällsarbetet som görs för att intressera fler för datavetenskap och programmering."
}
};
// Function to change the language
function changeLanguage(language) {
  const elements = document.querySelectorAll("[data-lang]");
  elements.forEach((el) => {
      const key = el.getAttribute("data-lang");
      if (translations[language][key]) {
          el.textContent = translations[language][key];
      }
  });
}

// Function to attach the event listener to the button
function attachLanguageToggle() {
  const button = document.getElementById("change-language");
  if (button) {
      button.addEventListener("click", (e) => {
          e.preventDefault(); // Prevent scrolling to the top
          const currentLang = document.documentElement.lang || "en";
          const newLang = currentLang === "en" ? "sv" : "en";
          document.documentElement.lang = newLang; // Update the HTML `lang` attribute
          changeLanguage(newLang); // Update the text
      });
  } else {
      console.error("Language toggle button not found.");
  }
}



// Function to load content dynamically
function loadHTML(filePath, targetElementId) {
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
              attachLanguageToggle();
          } else {
              console.error(`Target element with ID '${targetElementId}' not found.`);
          }
      })
      .catch((error) => {
          console.error("Error loading HTML file:", error);
      });
}

// Load the "About Us" section
loadHTML('./aboutPage/aboutUs.html', 'about-us-section');

// Load the "Our Team" section
loadHTML('./aboutPage/ourTeam.html', 'our-team-section');
loadHTML('./aboutPage/footer.html', 'footer-row')
// Attach the initial language toggle for any pre-existing content
attachLanguageToggle();
