// Function to initialize the hamburger menu after loading
function initializeMenu() {
    const menu = document.getElementById("menu");
    const listContainer = document.getElementsByClassName("nav__items-con")[0];
    const body = document.querySelector("body");
    
    if (menu) {
        menu.onclick = function () {
            menu.classList.toggle("openmenu");
            if (menu.classList.contains("openmenu")) {
                listContainer.style.display = "block";
                body.style.overflow = "hidden";
            } else {
                listContainer.style.display = "none";
                body.style.overflow = "scroll";
            }
        }
    } else {
        console.error("Menu not found.");
    }

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

    // Ensure the change language button closes menu if it's open
    const button = document.getElementById("change-language");
    if (button) {
        button.addEventListener("click", (e) => {
            if (menu.classList.contains("openmenu")) {
                menu.classList.remove("openmenu");
                listContainer.style.display = "none";
                body.style.overflow = "scroll";
            }
        });
    } else {
        console.error("Language toggle button not found.");
    }
};

initializeMenu();