const carousel_track = document.querySelector(".carousel-track");
const slides = Array.from(carousel_track.children);
const nextButton = document.querySelector(".carousel-button--right");
const prevButton = document.querySelector(".carousel-button--left");
const navDots = document.querySelector(".carousel-navigator");
const dots = Array.from(navDots.children);

const slideWidth = slides[0].getBoundingClientRect().width;

// Spread out the images to be next to one another by using the width of the image
const setSlidePostion = (slide, index) => {
    slide.style.left = slideWidth * index + "px";
};
slides.forEach(setSlidePostion);

const moveToSlide = (carousel_track, currentSlide, targetSlide) => {
    // amt by which the image to move
    carousel_track.style.transform = "translateX(-" + targetSlide.style.left + ")";
    // change the current slide in the class list of the slide
    currentSlide.classList.remove("current-slide");
    targetSlide.classList.add("current-slide");
}

const updateNavDots = (currentDot, targetDot) => {
    currentDot.classList.remove("current-slide");
    targetDot.classList.add("current-slide");
}

const hideShowNavArrow = (slides, prevButton, nextButton, targetIndex) => {
    if (targetIndex === 0) {
        prevButton.classList.add("is-hidden");
        nextButton.classList.remove("is-hidden");
    } else if (targetIndex === slides.length -1 ) {
        prevButton.classList.remove("is-hidden");
        nextButton.classList.add("is-hidden");
    } else {
        prevButton.classList.remove("is-hidden");
        nextButton.classList.remove("is-hidden");
    }
}

// shows next image when right button clicked
nextButton.addEventListener("click", e => {
    // selects the slide withe the css class current-slide
    const currentSlide = carousel_track.querySelector(".current-slide");
    const nextSlide = currentSlide.nextElementSibling;
    const currentDot = navDots.querySelector(".current-slide");
    const nextDot = currentDot.nextElementSibling;
    const nextIndex = slides.findIndex(slide => slide === nextSlide);
    
    moveToSlide(carousel_track, currentSlide, nextSlide);

    updateNavDots(currentDot, nextDot);
    hideShowNavArrow(slides, prevButton, nextButton, nextIndex);
});

// shows prev image when left button cliecked
prevButton.addEventListener("click", e => {
    const currentSlide = carousel_track.querySelector(".current-slide");
    const prevSlide = currentSlide.previousElementSibling;
    const currentDot = navDots.querySelector(".current-slide");
    const prevDot = currentDot.previousElementSibling;
    const prevIndex = slides.findIndex(slide => slide === prevSlide);

    moveToSlide(carousel_track, currentSlide, prevSlide);
    updateNavDots(currentDot, prevDot);
    hideShowNavArrow(slides, prevButton, nextButton, prevIndex);
});

navDots.addEventListener("click", e => {
    const targetDot = e.target.closest("button");
    // stop listening if the selected in the navbar is not a dot 
    if(!targetDot) return;

    const currentSlide = carousel_track.querySelector(".current-slide");
    const currentDot = navDots.querySelector(".current-slide");

    // returns the corresponding index of the selected dot 
    const targetIndex = dots.findIndex(dot => dot === targetDot);

    // use the navigation dots to control the slide 
    const targetSlide = slides[targetIndex];
    moveToSlide(carousel_track, currentSlide, targetSlide);

    updateNavDots(currentDot, targetDot);
    hideShowNavArrow(slides, prevButton, nextButton, targetIndex);
})


// Swiping functionality
let startX;
let endX;

carousel_track.addEventListener("touchstart", e => {
    console.log(e.touches)
    startX = e.touches[0].clientX;
});

carousel_track.addEventListener("touchmove", e => {
    endX = e.touches[0].clientX;
});

carousel_track.addEventListener("touchend", () => {
    if (startX > endX + 50) {
        // Swipe left
        const currentSlide = carousel_track.querySelector(".current-slide");
        const nextSlide = currentSlide.nextElementSibling;
        if (nextSlide) {
            nextButton.click();
        }
    } else if (startX + 50 < endX) {
        // Swipe right
        const currentSlide = carousel_track.querySelector(".current-slide");
        const prevSlide = currentSlide.previousElementSibling;
        if (prevSlide) {
            prevButton.click();
        }
    }
});

class Project {
    constructor(title, date, imagePath, description) {
        this.title = title;
        this.date = date;
        this.imagePath = imagePath;
        this.description = description;
        this.github = null; // Placeholder for GitHub URL
    }
}

const listOfProjects = [
    new Project("WebXR4 – Interactive 3D Force Graph in VR", "Ongoing", "/assets/projects/project1.jpeg", 
        `This project integrates a 3D force-directed graph into a custom WebXR + THREE.js scene. It uses the 3d-force-graph library to enable dynamic, interactive node-link visualizations that can be experienced in immersive VR.`,
        "https://github.com/Danial-Gholamian/webxr4"
    ),
    new Project("ZigzagNetVis", "Ongoing", "/assets/projects/project2.jpg", 
        `A research project that focuses on developing an interactive web-based tool for visualizing temporal graphs`
    ),
    new Project("Work project (currently still unnamed)", "Ongoing", "/assets/projects/project2.jpg", 
        `I'm currently working on a research project that integrates with the Tobii Pro Spark eye-tracker to streamline the collection and analysis of gaze data. The main objective is to develop user-friendly software that enables the creation of gaze heatmaps in a way that's both highly configurable and easily traceable. This tool aims to support and improve the transparency and reproducibility of gaze-based research.`
    ),
    new Project("CopyFlyouts", "October, 2024", "/assets/projects/project4.png", 
        `CopyFlyouts is a customizable Windows utility that provides visual and optional audio feedback for copy operations. It was developed to address a common frustration: not knowing whether a copy action was actually successful.
        When activated, CopyFlyouts displays a flyout showing the current clipboard contents, helping users confirm successful copies and detect redundant or failed copy attempts. It works with text, files, and images, and it supports both keyboard and mouse-initiated copy events, as well as clipboard changes from external programs.
        Designed with customization in mind, CopyFlyouts offers light/dark themes, startup options, tray minimization, and high configurability through a settings panel. It’s also portable, retaining preferences across devices. Though originally created as a summer project, it’s a genuinely useful tool aimed at enhancing the everyday copy-paste workflow on Windows.`,
        "https://github.com/krznck/CopyFlyouts"
        
    ),
    new Project("DyNetVis2", "Ongoing", "/assets/projects/project5.png", 
        `A Simple data visualization project using Flask and D3.js and structured as MVC.
        Working on a research project that focuses on the visualization of dynamic networks. The goal is to impove an existing interactive web-based tool that allows users to explore and analyze temporal graphs, with a particular emphasis on the visualization of temporal changes in network structure and dynamics.`
    ),
    new Project("Vulnerability Website Scanner", "December 2024", "/assets/projects/project6.png", 
        `Built a Go-based vulnerability scanning tool
        designed to detect common web application
        security vulnerabilitie. The tool currently
        supports automated scanning for SQL
        injections, Cross-Site Scripting, Cross-Site
        Request Forgery and Directory Traversal.`
    ),
];


function createProjectEntries() {
    const container = document.getElementById("project-container");
    container.innerHTML = "";

    listOfProjects.forEach(pitem => {
        const projectEntry = document.createElement("div");
        projectEntry.className = "project-entry";

        // Create the project container
        projectEntry.innerHTML = `
            <div class="project-img-cont">
                <img src="${pitem.imagePath}" alt="${pitem.title}" class="project-img">
            </div>
            <div class="project-text-wrapper">
                <p class="date">${pitem.date}</p>
                <h3 class="project-header">${pitem.title}</h3>
                <p class="p-description">
                    ${pitem.description}
                    <a href="${pitem.github}" class="popup-github" id="popup-github" target="_blank">View on GitHub</a>  
                </p>     
                <img src="/assets/projects/rightArrow.svg" alt="link to project page" class="arrow-button">         
            </div>
        `;

        // Append the project entry to the project container
        container.appendChild(projectEntry);
    });
}

// // Get the latest # project
function getProject(projectNumber) {
    if (listOfProjects.length >= 2) {
        // Using index-projectNumber based on the assumption that the latest project is at the top
        return listOfProjects[projectNumber];
    }
    return null;
};


function createCarouselItem(project) {
    const carouselItem = document.createElement("div");
    carouselItem.className = "item-img-container";

    // Create a carousel item
    carouselItem.innerHTML =  `
            <img src="${project.imagePath}" alt="${project.title}" class="item-img">
    `;

    return carouselItem;
};

function loadProjects() {
    // Add a check to make sure that the carousel is not shown when there are less than 3 projects
    const carouselSlide = document.getElementById("carousel-slide");
    carouselSlide.innerHTML = "";
    let carouselItems = [];
    // Creates a list of the carousel items
    for (let i = 0; i < 3; i++) {
        p = getProject(i);
        carouselItems.push(createCarouselItem(p)); 
        
        carouselSlide.appendChild(createCarouselItem(p));
    }
    const buttonBox = document.createElement("div");
    buttonBox.className = "button-box";
    buttonBox.innerHTML = `
        <div class="navigation">
            <button class="nav-left" type="button" onclick="changeProjectToLeft()"> < </button>
            <button class="nav-right" type="button" onclick="changeProjectToRight()"> > </button>
        </div>
    `;
    // carouselSlide.appendChild(buttonBox);  
};

// Popup functionality
document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("project-popup");
    const popupTitle = document.getElementById("popup-title");
    const popupDescription = document.getElementById("popup-description");
    const popupImages = document.getElementById("popup-images");
    const popupGithub = document.getElementById("popup-github");
    const popupClose = document.getElementById("popup-close");

    // Event listener for when an arrow button (to view project details) is clicked
    document.body.addEventListener("click", function (e) {
        if (e.target.classList.contains("arrow-button")) {
            const projectEl = e.target.closest(".project-entry");
            const title = projectEl.querySelector(".project-header").textContent;
            const project = listOfProjects.find(p => p.title === title);

            if (project) {
                // Update the popup with project details
                popupTitle.textContent = project.title;
                popupDescription.textContent = project.description;
                popupImages.innerHTML = `<img src="${project.imagePath}" alt="${project.title}">`;

                // Set the GitHub link dynamically
                // popupGithub.href = project.github ? project.github : "#"; // Fallback to "#" if GitHub URL is not provided
                // popupGithub.textContent = project.github ? "View on GitHub" : "GitHub link unavailable";

                popup.classList.remove("hidden"); // Show the popup
            }
        }
    });

    // Close the popup when the close button is clicked
    popupClose.addEventListener("click", () => {
        popup.classList.add("hidden");
    });

    // Close the popup when clicking outside the popup
    popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.classList.add("hidden");
    });
});


// loadProjects();
createProjectEntries();
