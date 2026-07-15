const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/proctoring-event", (req, res) => {
  console.log("Received:", req.body);
  res.sendStatus(200);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});