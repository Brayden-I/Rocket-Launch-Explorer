import { Carousel } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";

const BASE_URL = "https://lldev.thespacedevs.com/2.3.0";

// Page elements

const carouselElement = document.getElementById("launchCarousel");
const slideContainer = carouselElement.querySelector(".carousel-inner");
const indicatorContainer = carouselElement.querySelector(".carousel-indicators");

const daySelector = document.getElementById("daySelector");
const clearDayButton = document.getElementById("clearDay");
const dayMessage = document.getElementById("dayMessage");
const missionDetails = document.getElementById("missionDetails");

// Shared Data
let allLaunches = []; // Full list from the API
let shownLaunches = []; // Launches that are directly in the carousel
let latestDetailsRequest = 0;

// REQUESTS
function getUpcomingLaunches() {
    showLoading();

    axios.get(BASE_URL + "/launches/upcoming/")
        .then(function (response) {
            clearStatus();
            handleLaunchList(response.data.results);
        })
        .catch(function (error) {
            console.error(error);
            showError("Sorry, the upcoming launches could not be loaded. Please try again later.");
        });
}

const statusMessage = document.getElementById("status");

function showLoading() {
    statusMessage.textContent = "Loading...";
    statusMessage.className = "loading text-center";
}

function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = "error text-center";
}

function clearStatus() {
    statusMessage.textContent = "";
    statusMessage.className = "text-center";
}

// Request the upcoming launches
function getLaunchDetails() {
    const requestNumber = ++latestDetailsRequest;
    showLoading();
    
    axios.get(BASE_URL + "/launches/" + launchId)
    .then(function (response) {
        if (requestNumber !== latestDetailsRequest) return;
        clearStatus();
        displayLaunchInfo(response.data);
    })
    .catch(function (error) {
        if (requestNumber !== latestDetailsRequest) return;
        console.error(error);
        missionDetails.textContent = "";
        showError("Sorry, the details could not be loaded. Please try again later.");
    })
}

function getImageUrl(launch) {
    if (launch.image && launch.image.image_url) {
        return launch.image.image_url;
    }
    const config = launch.rocket && launch.rocket.configuration;
    if (config && config.image && config.image.image_url) {
        return config.image.image_url;
    }
    return null;
}

function getLocalDay(net) {
    if (!net) return null;
    const date = new Date(net);
    if (isNaN(date)) return null;
    return date.toLocaleDateString("en-CA");
}

function populateCarousel(launches) {
    shownLaunches = launches;
    slideContainer.textContent = "";
    indicatorContainer.textContent = "";

    launches.forEach(function (launch, index) {
        // One slide: the launch name above the rocket image
        const slide = document.createElement("div");
        slide.className = "carousel-item" + (index === 0 ? " active" : "");

        const title = document.createElement("h3");
        title.className = "h5 text-center mb-2";
        title.textContent = launch.name;
        slide.appendChild(title);

        const imageUrl = getImageUrl(launch);
        if (imageUrl) {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "Rocket for " + launch.name;
            img.className = "d-block w-100 rounded-5";
            img.style.height = "240px";
            img.style.objectFit = "cover";
            slide.appendChild(img);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "bg-secondary text-white rounded-5 d-flex align-items-center justify-content-center";
            placeholder.style.height = "240px";
            placeholder.textContent = "No rocket image available";
            slide.appendChild(placeholder);
        }
        slideContainer.appendChild(slide);

        // One indicator dot per slide
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("data-bs-target", "#launchCarousel");
        dot.setAttribute("data-bs-slide-to", index);
        dot.setAttribute("aria-label", launch.name);
        if (index === 0) {
            dot.className = "active";
            dot.setAttribute("aria-current", "true");
        }
        indicatorContainer.appendChild(dot);
    });
    
    const oldCarousel = Carousel.getInstance(carouselElement);
    if (oldCarousel) {
        oldCarousel.dispose();
    }
    new Carousel(carouselElement);
}

function displayLaunchInfo(launch) {
    missionDetails.textContent = ""; // replace the previous launch, do not add to it

    // Some launches have no mission, so fall back to the launch name.
    const mission = launch.mission;
    const missionName = mission && mission.name ? mission.name : launch.name;

    const title = document.createElement("h2");
    title.className = "h4";
    title.textContent = "Mission: " + missionName;
    missionDetails.appendChild(title);

    if (launch.net) {
        const when = document.createElement("p");
        when.className = "text-body-secondary small mb-2";
        when.textContent = "Launch date: " + new Date(launch.net).toLocaleString();
        missionDetails.appendChild(when);
    }

    const description = document.createElement("p");
    if (mission && mission.description) {
        description.textContent = mission.description;
    } else {
        description.textContent = "No mission description is available for this launch.";
        description.className = "text-body-secondary fst-italic";
    }
    missionDetails.appendChild(description);
}

function loadLaunchAt(index) {
    const launch = shownLaunches[index];
    if (!launch) return;
    getLaunchDetails(launch.id)
}

carouselElement.addEventListener("slid.bs.carousel", function (event) {
    loadLaunchAt(event.to);
});

// Day selector: keep only the launches on the chosen local day.
daySelector.addEventListener("change", function () {
    const day = daySelector.value;
    if (!day) {
        showAllLaunches();
        return;
    }

    const matches = allLaunches.filter(function (launch) {
        return getLocalDay(launch.net) === day;
    });

    if (matches.length === 0) {
        dayMessage.textContent = "No launches on this day. Pick another day or choose All days.";
        return; // leave the carousel as it is
    }

    dayMessage.textContent = matches.length + (matches.length === 1 ? " launch" : " launches") + " on this day.";
    populateCarousel(matches);
    loadLaunchAt(0);
});

clearDayButton.addEventListener("click", showAllLaunches);

function showAllLaunches() {
    daySelector.value = "";
    dayMessage.textContent = "";
    populateCarousel(allLaunches);
    loadLaunchAt(0);
}

function handleLaunchList(launches) {
    allLaunches = launches;

    // Limit the date picker to days that actually have launches
    const days = launches.map(function (launch) {
        return getLocalDay(launch.net);
    }).filter(Boolean).sort();
    if (days.length > 0) {
        daySelector.min = days[0];
        daySelector.max = days[days.length - 1];
    }

    populateCarousel(launches);
    loadLaunchAt(0); // the page starts on the first launch
}

getUpcomingLaunches(handleLaunchList);