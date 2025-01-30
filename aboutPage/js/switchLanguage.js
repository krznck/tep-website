// // Language translations
// console.log("JavaScript file is linked correctly and I'm here.");

// const translations = {
//   en: {
//       "member1-name": "Member 1",
//       "member1-info": "Program name, year of studies",
//       "member1-quote": "Here I am writing in English!",
//   },
//   sv: {
//       "member1-name": "Medlem 1",
//       "member1-info": "Programnamn, studieår",
//       "member1-quote": "Här skriver jag på svenska !!!",
//   },
// };

// // Function to change the language
// function changeLanguage(language) {
//   // Select all elements with a `data-lang` attribute
//   const elements = document.querySelectorAll("[data-lang]");

//   // Update the content of each element based on the selected language
//   elements.forEach((el) => {
//       const key = el.getAttribute("data-lang");
//       if (translations[language][key]) {
//           el.textContent = translations[language][key];
//       }
//   });
// }

// // Attach the language toggle to the "Projects" button
// document.getElementById("change-language").addEventListener("click", (e) => {
//   e.preventDefault(); // Prevent default link behavior
//   const currentLang = document.documentElement.lang || "en"; // Get current language
//   const newLang = currentLang === "en" ? "sv" : "en"; // Toggle between 'en' and 'sv'
//   document.documentElement.lang = newLang; // Update the HTML `lang` attribute
//   changeLanguage(newLang); // Call the function to update the language
// });
