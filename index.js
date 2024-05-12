const express = require("express");
const fileupload = require("express-fileupload");
const  Vertex = require("./vertex").Vertex;
const app = express();

app.use(fileupload());

const port = parseInt(process.env.PORT) || 4051;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.raw({ type: 'application/octet-stream' }))

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", async (req, res) => {
  console.log(`File received of size `+ req.files.file.size );
  console.log(`Original Dimensions received `+req.body.dimensions)
  const dimensions = JSON.parse(req.body.dimensions);
  const vertex = new Vertex();
  result = await vertex.generateContent(req.files.file.data, dimensions);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
