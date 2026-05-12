const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let hands = {};

io.on("connection", (socket) => {
  console.log("接続:", socket.id);

  players[socket.id] = true;

  io.emit("status", Object.keys(players).length);

  socket.on("janken", (hand) => {
    hands[socket.id] = hand;

    const ids = Object.keys(players);

    if (ids.length === 2 && Object.keys(hands).length === 2) {
      const p1 = ids[0];
      const p2 = ids[1];

      const h1 = hands[p1];
      const h2 = hands[p2];

      let result1 = judge(h1, h2);
      let result2 = judge(h2, h1);

      io.to(p1).emit("result", {
        yourHand: h1,
        opponentHand: h2,
        result: result1
      });

      io.to(p2).emit("result", {
        yourHand: h2,
        opponentHand: h1,
        result: result2
      });

      hands = {};
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    delete hands[socket.id];
    io.emit("status", Object.keys(players).length);
  });
});

function judge(a, b) {
  if (a === b) return "あいこ";
  if (
    a === "グー" && b === "チョキ" ||
    a === "チョキ" && b === "パー" ||
    a === "パー" && b === "グー"
  ) {
    return "勝ち";
  }
  return "負け";
}

server.listen(3000, () => {
  console.log("http://localhost:3000 で起動中");
});