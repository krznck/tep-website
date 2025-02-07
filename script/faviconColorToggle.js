const yellowURI = "assets/logo/Logomark, yellow";
const blackURI = "assets/logo/Logomark, black";

function updateFavicon() {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const favicons = document.querySelectorAll('.favicon');

    favicons.forEach(favicon => {
        if (darkMode) {
            favicon.href = favicon.type === "image/svg+xml" ? (yellowURI + ".svg") : (yellowURI + ".png");
        } else {
            favicon.href = favicon.type === "image/svg+xml" ? (blackURI + ".svg") : (blackURI + ".png");
        }
    });
}

updateFavicon();
// event listener to change the favicon on the fly if the browser changes its theme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);
