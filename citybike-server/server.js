const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const citybikeurl = "http://api.citybik.es/v2/networks/decobike-miami-beach"



const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();


app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!
let interval;
let clientsConnected = 0;

io.on("connection", socket => {
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  fetchData();
  if (clientsConnected == 0){
    interval = setInterval(fetchData, 10*1000); //Cada 10 segundos
  }
  clientsConnected++;
  console.log('New connection ' + socketId + ' from ' + clientIp + ' connections: ' + clientsConnected);

  socket.on("disconnect", () => {
    clientsConnected--;
    console.log("Client disconnected " + "Connections: " + clientsConnected);
    if (clientsConnected == 0){
      console.log("Waiting for connections...");
      clearInterval(interval);
    }
  });
});

function fetchData(){
  http.get(citybikeurl,(res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      try {
        let json = JSON.parse(body);
        io.emit('refreshChannel', json.network.stations);
      } catch (error) {
        console.error(error.message);
      };
    });
  }).on("error", (error) => {
    console.error(error.message);
  });
}

server.listen(port, () => console.log(`Listening on port ${port}`));



