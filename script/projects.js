
const project1 = {name: "Project A", description: "Here is a really interesting description of project 1", image: "/assets/projectImg.png"}
const project2 = {name: "Project B", description: "Here is something for projekt 2", image: "/assets/projectImg.png" }
const project3 = {name: "Project C", description: "And here is project3. If I make it longer it goes left Why?", image: "/assets/projectImg.png"}

const listOfProjects = [project1, project2, project3]

let currentProject = 0;

function getProject(projectNumber) {
    if (projectNumber >= 0 && projectNumber < listOfProjects.length) {
        return listOfProjects[projectNumber];
    }
    return null;
};

function loadProjectCarousel() {
    p = getProject(currentProject);
    if (p != null) {
        document.getElementsByClassName("project-header-carousel")[0].innerText = p.name;
        document.getElementsByClassName("p-description-carousel")[0].innerText = p.description;
        document.getElementsByClassName("project-img-carousel")[0].src = p.image;
    }
    pLeft = getProject(currentProject-1);
    if (pLeft != null) {
        document.getElementsByClassName("project-header-left")[0].innerText = pLeft.name;
        document.getElementsByClassName("project-image-left")[0].src = pLeft.image;
    } else {
        document.getElementsByClassName("project-header-left")[0].innerText = "";
        document.getElementsByClassName("project-image-left")[0].src = "";
    }
    pRight = getProject(currentProject+1);
    if (pRight != null) {
        document.getElementsByClassName("project-header-right")[0].innerText = pRight.name;
        document.getElementsByClassName("project-image-right")[0].src = pRight.image;
    } else {
        document.getElementsByClassName("project-header-right")[0].innerText = "";
        document.getElementsByClassName("project-image-right")[0].src = "";
    }
};

function loadProjects() {
    for (let i = 0; i < listOfProjects.length; i++) {
        p = getProject(i);
        projectNumber = i+1;
        const searchName = "project-header" + projectNumber;
        const searchDesc = "p-description" + projectNumber;
        const searchImage = "project-img" + projectNumber;
        document.getElementsByClassName(searchName)[0].innerText = p.name;
        document.getElementsByClassName(searchDesc)[0].innerText = p.description;
        document.getElementsByClassName(searchImage)[0].src = p.image;
    
    }
};

function changeProjectToLeft() {
    if (currentProject > 0) {
        currentProject -= 1;
        loadProjectCarousel();
    }
}

function changeProjectToRight() {
    if (currentProject < listOfProjects.length-1) {
        currentProject += 1;
        loadProjectCarousel();
    }
}

loadProjectCarousel();
loadProjects();