import { createServer } from "node:http";

const server = createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");

  if (request.method === "GET" && request.url === "/health") {
    response.statusCode = 200;
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(9000, "127.0.0.1", () => {
  console.log("Backend running at http://127.0.0.1:9000");
});