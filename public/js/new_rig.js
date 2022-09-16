const rigTasks = document.querySelectorAll(".rig-task");
const stagingArea = document.querySelector("#create-rig-staging-area");
const myGenres = [];
let currentRigTask;

// Set Next Rig Task
function nextRigTask() {
  currentRigTask = currentRigTask + 1;
  localStorage.setItem("currentRigTask", currentRigTask);
  clearStagingArea();
  showNextRigTask(currentRigTask);
  setupStagingArea(currentRigTask);
}

//Clear stagingArea
function clearStagingArea() {
  stagingArea.innerHTML = "";
}

// Display Next Rig Task and cross off the previous one
function showNextRigTask(index) {
  if (index === 0) {
    rigTasks[index].classList.replace("invisible", "visible");
  } else if (index >= 0) {
    for (let i = 0; i < rigTasks.length; i++)
      if (i < index) {
        rigTasks[i].classList.add("text-decoration-line-through");
        rigTasks[i].classList.replace("invisible", "visible");
      }
    rigTasks[index].classList.replace("invisible", "visible");
  }
}

// Create and return a Bootstrap formatted card
function createCard(name, desc, picture, type, useBudget, budget) {
  let cardDiv = document.createElement("div");
  let cardImage = document.createElement("img");
  let cardBodyDiv = document.createElement("div");
  let cardTitle = document.createElement("h5");
  let cardText = document.createElement("p");
  let selectButton = document.createElement("a");
  let cardBudget = document.createElement("p");

  selectButton.id = "select-btn";
  cardBodyDiv.id = name;

  cardDiv.classList.add("card", "staging-card", "mx-4", "my-4");
  cardImage.classList.add("card-img-top");
  cardBodyDiv.classList.add(
    "card-body",
    "d-flex",
    "flex-column",
    "align-items-center",
    "text-light",
    "bg-dark",
    "justify-content-between",
    "text-center"
  );

  cardTitle.classList.add("card-title", "fs-2");
  cardText.classList.add("card-text", "fs-6");
  selectButton.classList.add("btn", "btn-primary", "fs-2");

  cardImage.setAttribute("src", picture);
  cardTitle.textContent = name;
  cardText.textContent = desc;
  selectButton.textContent = "Select this " + type;

  cardDiv.appendChild(cardImage);
  cardBodyDiv.appendChild(cardTitle);
  cardBodyDiv.appendChild(cardText);
  if (useBudget) {
    cardBudget.classList.add("card-budget", "card-text", "fs-1");
    cardBudget.textContent = budget;
    cardBodyDiv.appendChild(cardBudget);
  }
  cardBodyDiv.appendChild(selectButton);
  cardDiv.appendChild(cardBodyDiv);
  return cardDiv;
}

// Add Genres to Staging Area Element
function addGenres() {
  let genreContainer = document.createElement("div");
  genreContainer.classList.add(
    "container-fluid",
    "d-flex",
    "flex-wrap",
    "justify-content-center"
  );
  let genreImages = [
    "/images/genres-01.svg",
    "/images/genres-07.svg",
    "/images/genres-02.svg",
    "/images/genres-03.svg",
    "/images/genres-04.svg",
    "/images/genres-05.svg",
    "/images/genres-06.svg",
  ];
  fetch("/api/genres").then((response) =>
    response.json().then((allGenres) => {
      for (let i = 0; i < allGenres.length; i++) {
        myGenres.push(allGenres[i].genre);
        genreContainer.appendChild(
          createCard(
            allGenres[i].genre,
            allGenres[i].description,
            genreImages[i],
            "Genre",
            false
          )
        );
      }
      stagingArea.appendChild(genreContainer);
    })
  );
}

// Add Instrument Category to Staging Area Element
function addInstrumentCategory() {
  let instrumentContainer = document.createElement("div");
  instrumentContainer.classList.add(
    "container-fluid",
    "d-flex",
    "flex-wrap",
    "justify-content-center"
  );
  let instrumentTypeImages = [
    "/images/instrument_types-01.svg",
    "/images/instrument_types-02.svg",
    "/images/instrument_types-03.svg",
  ];

  fetch("/api/instruments/types")
    .then((response) => response.json())
    .then((types) => {
      for (let i = 0; i < types.length; i++) {
        instrumentContainer.appendChild(
          createCard(types[i], "", instrumentTypeImages[i], "Category", false)
        );
      }
      stagingArea.appendChild(instrumentContainer);
    });
}

// return the Category ID when supplied with a Category name
function getCategoryId(category) {
  let categories = ["Electric Guitar", "Bass Guitar", "Drums"];
  for (let i = 0; i < categories.length; i++) {
    if (category === categories[i]) {
      return i;
    }
  }
}

// Add instrument model to Staging Area Element
function addInstrumentModel() {
  let instrumentContainer = document.createElement("div");
  instrumentContainer.classList.add(
    "container-fluid",
    "d-flex",
    "flex-wrap",
    "justify-content-center"
  );
  let instrumentType = localStorage.getItem("rig-category");
  let selectedGenre = localStorage.getItem("rig-genre");
  fetch("/api/genres").then((response) =>
    response.json().then((allGenres) => {
      for (genre of allGenres) {
        if (genre.genre === selectedGenre) {
          fetch("/api/instgenre/byGenre:" + genre.id)
            .then((response) => response.json())
            .then((instrumentsByGenre) => {
              let instruments = [];
              for (instrument of instrumentsByGenre) {
                instruments.push(instrument.instrument_id);
              }
              fetch("/api/instruments/bulkGetById", {
                method: "POST",
                body: JSON.stringify({ instruments, instrumentType }),
                headers: { "Content-Type": "application/json" },
              })
                .then((response) => response.json())
                .then((allInstruments) => {
                  console.log(allInstruments);
                  for (let i = 0; i < allInstruments.length; i++) {
                    instrumentContainer.appendChild(
                      createCard(
                        allInstruments[i].model,
                        allInstruments[i].description,
                        allInstruments[i].image,
                        "Model",
                        true,
                        allInstruments[i].budget
                      )
                    );
                  }
                  stagingArea.appendChild(instrumentContainer);
                });
            });
        }
      }
    })
  );
}

// Return Accessory path
function returnAccessory(category, accNum) {
  switch (accNum) {
    case 1:
      switch (category) {
        case "Electric Guitar":
          return "gamp";
        case "Bass Guitar":
          return "bamp";
        case "Drums":
          return "dpeds";
        default:
          console.log("Something went wrong in the Acc1 Category Switch");
      }
      break;
    case 2:
      switch (category) {
        case "Electric Guitar":
          return "gfx";
        case "Bass Guitar":
          return "bfx";
        case "Drums":
          return "dcymb";
        default:
          console.log("Something went wrong in the Acc2 Category Switch");
      }
    default:
      console.log("Something went wrong in the AccNum Switch");
  }
}

// Add First Accessory Set to Staging Area Element
function addAccessory(accNum) {
  let accOneContainer = document.createElement("div");
  accOneContainer.classList.add(
    "container-fluid",
    "d-flex",
    "flex-wrap",
    "justify-content-center"
  );
  let category = localStorage.getItem("rig-category");
  let selectedGenre = localStorage.getItem("rig-genre");
  let accArray = [];
  let accName = returnAccessory(category, accNum);
  let accIdName = `accessory.${accName}_id`;
  fetch("/api/genres")
    .then((response) => response.json())
    .then((genres) => {
      let genreId;
      for (genre of genres) {
        if (selectedGenre === genre.genre) {
          genreId = genre.id;
        }
      }
      fetch("/api/" + accName + "/genreId/" + genreId)
        .then((response) => response.json())
        .then((accessories) => {
          for (accessory of accessories) {
            accArray.push(eval(accIdName));
          }
          fetch("/api/accessories/bulkGampById", {
            method: "POST",
            body: JSON.stringify({ accArray }),
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.json())
            .then((accData) => {
              for (acc of accData) {
                accOneContainer.appendChild(
                  createCard(
                    acc.model,
                    acc.description,
                    acc.image,
                    "Accessory",
                    true,
                    acc.budget
                  )
                );
              }
              stagingArea.appendChild(accOneContainer);
            });
        });
    });
}

// Add Second Accessory Set to Staging Area Element
function addSecondAccessory() {}

// Set up Staging Area
function setupStagingArea(currentTask) {
  switch (currentTask) {
    case 0:
      addGenres();
      setEventDelegateForGenre();
      break;
    case 1:
      addInstrumentCategory();
      setEventDelegateForCategory();
      break;
    case 2:
      addInstrumentModel();
      setEventDelegateForModel();
      break;
    case 3:
      addAccessory(1);
      setEventDelegateForAcc1();
      break;
    case 4:
      addAccessory(2);
      setEventDelegateForAcc2();
    default:
      console.log(currentTask);
      console.log("Something weird happened...");
  }
}

// Check for existing local storage
function verifyLocalStorageExists() {
  if (localStorage.getItem("currentRigTask") === null) {
    return false;
  } else {
    return true;
  }
}

// Check if currentRigTask exists in Local Storage
function getCurrentRigTask() {
  if (verifyLocalStorageExists()) {
    currentRigTask = localStorage.getItem("currentRigTask");
    showNextRigTask(currentRigTask);
    setupStagingArea(currentRigTask);
  } else {
    currentRigTask = 0;
    showNextRigTask(currentRigTask);
    setupStagingArea(currentRigTask);
  }
}

// Call getCurrentRigTask() when page loads
getCurrentRigTask();

// Setup event Delegates for Genre
function setEventDelegateForGenre() {
  stagingArea.onclick = function (event) {
    let myButton = event.target;

    if (myButton.id === "select-btn") {
      localStorage.setItem("rig-genre", myButton.parentElement.id);
      nextRigTask();
    }
  };
}

// Setup event Delegates for Category
function setEventDelegateForCategory() {
  stagingArea.onclick = function (event) {
    let myButton = event.target;

    if (myButton.id === "select-btn") {
      localStorage.setItem("rig-category", myButton.parentElement.id);
      console.log(myButton.parentElement.id);
      nextRigTask();
    }
  };
}

// Setup event Delegates for Model
function setEventDelegateForModel() {
  stagingArea.onclick = function (event) {
    let myButton = event.target;

    if (myButton.id === "select-btn") {
      localStorage.setItem("rig-model", myButton.parentElement.id);
      console.log(myButton.parentElement.id);
      nextRigTask();
    }
  };
}

// Setup event Delegates for Accessory 1
function setEventDelegateForAcc1() {
  stagingArea.onclick = function (event) {
    let myButton = event.target;

    if (myButton.id === "select-btn") {
      localStorage.setItem("rig-acc1", myButton.parentElement.id);
      console.log(myButton.parentElement.id);
      nextRigTask();
    }
  };
}

// Setup event Delegates for Accessory 2
function setEventDelegateForAcc2() {
  stagingArea.onclick = function (event) {
    let myButton = event.target;

    if (myButton.id === "select-btn") {
      localStorage.setItem("rig-acc2", myButton.parentElement.id);
      console.log(myButton.parentElement.id);
      console.log("All Done, Please Save!");
    }
  };
}
