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
    }
}

const listOfProjects = [
    new Project("Project A", "October 16, 2024", "/assets/projects/projectImg.png", 
        `Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
        Hic quo dolore repellendus illum tenetur? Harum laborum
        tenetur ut sunt rem perferendis libero, fugiat, consequuntur 
        minus repellat nisi illo reiciendis consequatur.`
    ),
    new Project("Project B", "August 6, 2023", "/assets/projects/projectImg.png", 
        `Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
        Hic quo dolore repellendus illum tenetur? Harum laborum
        tenetur ut sunt rem perferendis libero, fugiat, consequuntur 
        minus repellat nisi illo reiciendis consequatur.`
    ),
    new Project("Project D", "January 9, 2025", "/assets/projects/projectImg.png", 
        `Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
        Hic quo dolore repellendus illum tenetur? Harum laborum
        tenetur ut sunt rem perferendis libero, fugiat, consequuntur 
        minus repellat nisi illo reiciendis consequatur.`
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

// loadProjects();
createProjectEntries();
