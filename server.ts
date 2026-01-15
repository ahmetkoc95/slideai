import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketServer } from "./src/lib/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Check if Socket.io should be enabled (disabled for Vercel serverless)
const enableSocket = process.env.ENABLE_SOCKET !== "false";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io only if enabled (not for Vercel serverless deployment)
  if (enableSocket) {
    initSocketServer(httpServer);
    console.log("> Socket.io server initialized");
  } else {
    console.log("> Socket.io disabled (ENABLE_SOCKET=false)");
  }

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
