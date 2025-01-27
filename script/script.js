// Menu opener
const menu = document.getElementById("menu");
const listContainer = document.getElementsByClassName("nav__items-con")[0];
const body = document.querySelector("body");
let clickCount = 0;

menu.onclick = function() {
    clickCount++;
    menu.classList.toggle("openmenu");
    if (clickCount % 2 === 0) {
        listContainer.style.display = "none";
        body.style.overflow = "scroll";
    } else {
        listContainer.style.display = "block";
        body.style.overflow = "hidden";
    }
};