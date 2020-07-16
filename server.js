const http = require("http");
const os = require("os");

const { MetricRegistry } = require("inspector-metrics");

const registry = new MetricRegistry();
const callCount = registry.newMeter("callCount");
const port = process.env.PORT || 8080;

function htmlEntities(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderFlatObject(obj, filterKeyCallback) {
  return `<dl class="row">` + Object.keys(obj)
    .filter( key => {
      return typeof filterKeyCallback === "function" ? filterKeyCallback(key) : true
    })
    .map((key) => {
      const value = obj[key];
      return `
          <dt class="col-sm-3">${key}</dt>
          <dd class="col-sm-9">${htmlEntities(value)}</dd>
        `;
    })
    .sort()
    .join("")
    + `</dl>`;
}

http
  .createServer((req, res) => {
    callCount.mark(1);
    const [load_01, load_05, load_15] = os.loadavg();
    res.write(`<html>
      <head>
        <title>Contester</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
      </head>
      <body>
        <div class="container">
        <h1>Contester say "${process.env.CONTESTER_MESSAGE || "hello world"}" <small class="text-muted">from host ${os.hostname()}</small></h1>
        <h2>Request info</h2>
        ${renderFlatObject({
          // host: req.host,
          // protocol: req.protocol,
          request: `${req.method} ${req.url}`,
          remoteAddress: req.connection.remoteAddress,
          localAddress: req.connection.localAddress,
          localPort: req.connection.localPort,
          timestamp: new Date().toISOString(),
        })}
        <h2>System info</h2>
        ${renderFlatObject({
          hostname: os.hostname(),
          load_01,
          load_05,
          load_15,
          platform: os.platform() + ", " + os.release() + ", " + os.arch(),
          systemUptime: os.uptime() + " s",
          memoryTotal: (os.totalmem() / (1024 * 1024)).toFixed(0) + " mb",
          memoryFree: (os.freemem() / (1024 * 1024)).toFixed(0) + " mb",
        })}
        <h2>Metrics</h2>
        ${renderFlatObject({
          count: callCount.getCount(),
          uptime: ((new Date().getTime() - callCount.startTime.milliseconds) / 1000).toFixed(2) + " s",
          rate_01: callCount.get1MinuteRate().toFixed(2) + " req/s",
          rate_05: callCount.get5MinuteRate().toFixed(2) + " req/s",
          rate_15: callCount.get15MinuteRate().toFixed(2) + " req/s",
          mean: callCount.getMeanRate().toFixed(2) + " req/s",
        })}
        <h2>Environment variables</h2>
        ${renderFlatObject(process.env, (key) => {
          const reNodeEnv = /(npm_|nvm_|yarn_).*/gmi;
          return !reNodeEnv.test(key);
        })}
        <h2>Headers</h2>
        ${renderFlatObject(req.headers)}
        </div>
      </body>
    </html>`);
    console.log(new Date().toISOString(), req.method, req.url);
    res.end();
  })
  .listen(port, () => {
    console.log(`Contester server started, port=${port}`);
  });
