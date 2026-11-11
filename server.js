/* cPanel "Setup Node.js App" startup file.
   Runs the pre-built Next.js site (the .next folder) in production mode.
   cPanel/Passenger provides the port; locally it falls back to 3000.
   CommonJS on purpose: Passenger loads the startup file with require(). */
/* eslint-disable @typescript-eslint/no-require-imports */

const { createServer } = require("node:http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`Spinning Top running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });
