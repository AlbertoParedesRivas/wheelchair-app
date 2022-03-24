document.addEventListener("click", function (e) {
    // Update feature
    if(e.target.classList.contains("edit-me")){
        let userInput = prompt("Edit entry", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML);
        if(userInput){
            axios.post("/update-item", {id: e.target.getAttribute("data-id"), text: userInput}).then(function () {
                e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput;
            }).catch(function(){
                console.log("Try again in a moment");
            });
        }
    }
    // Delete feature
    if(e.target.classList.contains("delete-me")){
        if(confirm("Delete this item permanently?")){
            axios.post("/delete-item", {id: e.target.getAttribute("data-id")}).then(function () {
                e.target.parentElement.parentElement.remove();
            }).catch(function () {
                console.log("Try again in a moment.");
            });
            
        }
    }
});

// Create feature
document.getElementById("create-form").addEventListener("submit", function (e) {
    e.preventDefault();
    let userInput = document.getElementById("create-field")
    axios.post("/create-item", {text: userInput.value}).then(function (response) {
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data));
        userInput.value = "";
        userInput.focus();
    }).catch(function () {
        console.log("Try again in a moment.");
    });
});

function itemTemplate(item) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
      <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`;
}

// Rendering list
let listHTML = items.map(function (item) {
    return itemTemplate(item);
}).join("");
document.getElementById("item-list").insertAdjacentHTML("beforeend", listHTML);