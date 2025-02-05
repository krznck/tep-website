document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".project-button");
  const overlay = document.getElementById("overlay");
  const popup = document.getElementById("popup");
  const popupClose = document.getElementById("popupclose");
  const popupContent = document.querySelector(".popupcontent");

  buttons.forEach(button => {
      button.addEventListener("click", function (event) {
          event.preventDefault();
          const memberKey = button.getAttribute("data-member") + "-projects";
          const language = document.documentElement.lang || "en";
          const projects = translations[language][memberKey] || [];

          // Update popup content
          let popupHTML = `<h1>${translations[language][button.getAttribute("data-member") + "-name"]}’s Projects:</h1>`;
          if (projects.length > 0) {
              projects.forEach(project => {
                  popupHTML += `<p class="project-name"><a href="${project.link}" target="_blank">${project.name}</a></p>`;
              });
          } else {
              popupHTML += `<p>No projects available.</p>`;
          }

          popupContent.innerHTML = popupHTML;

          // Show popup and disable page scroll
          overlay.style.display = "block";
          popup.style.display = "block";
          document.body.style.overflow = "hidden";
      });
  });

  // Close popup event (Close button)
  popupClose.addEventListener("click", closePopup);

  // Close popup when clicking outside (overlay)
  overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
          closePopup();
      }
  });

  function closePopup() {
      overlay.style.display = "none";
      popup.style.display = "none";
      document.body.style.overflow = "auto"; // Re-enable page scroll
  }
});
