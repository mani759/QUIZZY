const app = require("./src/app.js");
const http = require("http");
const httpServer = http.createServer(app);

httpServer.listen(3000, (req, res) => {
  console.log("Server is running on port http://localhost:3000");
});
