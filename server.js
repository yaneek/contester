const http = require("http");
const os = require("os");
const { MetricRegistry } = require("inspector-metrics");

const registry = new MetricRegistry();
const callCount = registry.newMeter("callCount");

function htmlEntities(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderFlatObject(obj) {
  return Object.keys(obj)
    .map((key) => {
      const value = obj[key];
      return `<b>${key}</b>: ${htmlEntities(value)}`;
    })
    .sort()
    .join("<br />");
}

http
  .createServer((req, res) => {
    callCount.mark(1);
    const [load_01, load_05, load_15] = os.loadavg();
    res.write(`<html>
      <head>
        <title>Container tester</title>
      </head>
      <body>
        <h1>Container tester @ ${os.hostname()}</h1>
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
          // memoryFree: (os.() / (1024 * 1024)).toFixed(0) + " mb",
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
        ${renderFlatObject(process.env)}
        <h2>Headers</h2>
        ${renderFlatObject(req.headers)}
      </body>
    </html>`);
    console.log(new Date().toISOString(), req.method, req.url);
    res.end();
  })
  .listen(process.env.PORT || 8080, () => {
    console.log("Container tester started");
  });
