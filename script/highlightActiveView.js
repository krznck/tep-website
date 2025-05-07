// Function to highlight the active navigation link
function highlightActiveNav() {
    let currentPage = window.location.pathname.split("/").pop().split("?")[0].split("#")[0];
    let navLinks = document.querySelectorAll(".nav__item a");

    console.log("Current page:", currentPage);
    console.log("Found nav links:", navLinks.length);

    navLinks.forEach(link => {
        let href = link.getAttribute("href");
        if (!href) {
            return;
        }

        let linkPath = href.split("/").pop().split("?")[0].split("#")[0];
        console.log(`Comparing: ${linkPath} with ${currentPage}`);
        if (linkPath === currentPage) {
            link.classList.add("active");
            console.log(`Activated: ${link.href}`);
        } else {
            link.classList.remove("active");
        }
    });
}

highlightActiveNav();