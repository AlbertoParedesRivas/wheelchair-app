let express = require("express");
let { MongoClient, ObjectId } = require("mongodb");
let sanitizeHTML = require("sanitize-html");

let app = express();
let db;
app.use(express.static("public"));

async function go() {
    let client = new MongoClient("mongodb://root:example@localhost:27017/");
    await client.connect();
    db = client.db("WheelChair");
    app.listen(3000);
}
go();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function passwordProtected(request, response, next) {
    response.set("WWW-Authenticate", "Basic realm='Simple TodoApp'");
    console.log(`header: ${request.headers.authorization}`);
    if(request.headers.authorization == "Basic SGVscDpNZQ=="){
        next();
    }else{
        response.status(401).send("Authentication required");
    }
}
app.use(passwordProtected)
app.get('/', function (request, response) {
    db.collection("items").find().toArray(function (err, items) {
        response.send(`<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple To-Do App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
      </head>
      <body>
        <div class="container">
          <h1 class="display-4 text-center py-1">To-Do App</h1>
          
          <div class="jumbotron p-3 shadow-sm">
            <form id="create-form" action="/create-item" method="POST">
              <div class="d-flex align-items-center">
                <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Item</button>
              </div>
            </form>
          </div>
          
          <ul class="list-group pb-5" id ="item-list">
          </ul>
          
        </div>
        <script>
            let items = ${JSON.stringify(items)}
        </script>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script src="/browser.js"></script>
      </body>
      </html>`);
    });
});

app.post("/create-item", function (request, response) {
    let safeText = sanitizeHTML(request.body.text, {allowedTags: [], allowedAttributes: {}});
    db.collection("items").insertOne({ text: safeText }, function (err, info) {
        console.log(`POST /create-text -> ${request.body.text}`);
        response.json({_id: info.insertedId, text: safeText});
    });
});

app.post("/update-item", function (request, response) {
    let safeText = sanitizeHTML(request.body.text, {allowedTags: [], allowedAttributes: {}});
    db.collection("items").findOneAndUpdate({ _id: new ObjectId(request.body.id) }, { $set: { text: safeText } }, function () {
        console.log(`POST /update-item -> ${request.body.text}`);
        response.send("Success");
    });
});

app.post("/delete-item", function (request, response) {
    db.collection("items").deleteOne({ _id: new ObjectId(request.body.id) }, function () {
        console.log(`POST /delete-item -> ${request.body.id}`);
        response.send("Success");
    });
});
