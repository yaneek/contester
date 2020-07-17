const http = require("http");
const os = require("os");

const accepts = require("accepts");
const htmlToText = require("html-to-text");
const { MetricRegistry } = require("inspector-metrics");

const registry = new MetricRegistry();
const callCount = registry.newMeter("callCount");
const port = process.env.PORT || 8080;

function htmlEntities(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderFlatObject(caption, obj, filterKeyCallback) {
  const keys = Object.keys(obj).filter((key) => {
    return typeof filterKeyCallback === "function"
      ? filterKeyCallback(key)
      : true;
  });
  if (!keys.length) return "";
  return `<h2>${caption}</h2>
    <table class="table">${keys
      .map((key) => {
        return `<tr>
          <td style="width: 200px; font-weight: bold;">${key}</td>
          <td>${htmlEntities(obj[key])}</td>
        </tr>`;
      })
      .sort()
      .join("")}</table>`;
}

function getHtml(req) {
  const dockerLegacyLinks = {};
  const kubernetesServices = {};
  Object.keys(process.env).forEach((key) => {
    const reDockerLink = /([A-Z_]+)_PORT_[0-9]+_(TCP|UDP)(_ADDR|_PORT|_PROTO)?/;
    const foundDockerLink = key.match(reDockerLink);
    if (foundDockerLink) {
      const serviceName = foundDockerLink[1];
      dockerLegacyLinks[serviceName] = process.env[serviceName + "_PORT"];
    }

    const reKubernetesService = /([A-Z_]+)_SERVICE_(HOST|PORT)(_HTTP|_HTTPS)?/;
    const foundKubernetesService = key.match(reKubernetesService);
    if (foundKubernetesService) {
      const serviceName = foundKubernetesService[1];
      kubernetesServices[serviceName] = `${
        process.env[serviceName + "_SERVICE_HOST"]
      }:${process.env[serviceName + "_SERVICE_PORT"]}`;
    }
  });

  const [load_01, load_05, load_15] = os.loadavg();
  return `<html>
    <head>
      <title>Contester ${req.url}</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
      <h1>Contester says "${
        process.env.CONTESTER_MESSAGE || "hello world"
      }"<br><small class="text-muted">from host ${os.hostname()}</small></h1>
      ${renderFlatObject("Docker legacy links", dockerLegacyLinks)}      
      ${renderFlatObject("Kubernetes services", kubernetesServices)}      
      ${renderFlatObject("Request info", {
        // host: req.host,
        // protocol: req.protocol,
        request: `${req.method} ${req.url}`,
        remoteAddress: req.connection.remoteAddress,
        localAddress: req.connection.localAddress,
        localPort: req.connection.localPort,
        timestamp: new Date().toISOString(),
      })}   
      ${renderFlatObject("System info", {
        hostname: os.hostname(),
        load_01,
        load_05,
        load_15,
        platform: os.platform() + ", " + os.release() + ", " + os.arch(),
        systemUptime: os.uptime() + " s",
        memoryTotal: (os.totalmem() / (1024 * 1024)).toFixed(0) + " mb",
        memoryFree: (os.freemem() / (1024 * 1024)).toFixed(0) + " mb",
      })}
      ${renderFlatObject("Metrics", {
        count: callCount.getCount(),
        uptime:
          (
            (new Date().getTime() - callCount.startTime.milliseconds) /
            1000
          ).toFixed(2) + " s",
        rate_01: callCount.get1MinuteRate().toFixed(2) + " req/s",
        rate_05: callCount.get5MinuteRate().toFixed(2) + " req/s",
        rate_15: callCount.get15MinuteRate().toFixed(2) + " req/s",
        mean: callCount.getMeanRate().toFixed(2) + " req/s",
      })}
      ${renderFlatObject("Environment variables", process.env, (key) => {
        const reNodeEnv = /(npm_|nvm_|yarn_).*/gim;
        return !reNodeEnv.test(key);
      })}
      ${renderFlatObject("Headers", req.headers)}
      </div>
    </body>
  </html>`;
}

http
  .createServer((req, res) => {
    callCount.mark(1);
    const accept = accepts(req);
    const content = getHtml(req);
    switch (accept.type(["text", "html"])) {
      case "html":
        res.write(content);
        break;
      case "text":
      default:
        res.write(
          htmlToText
            .fromString(content, {
              wordwrap: 120,
              longWordSplit: {
                wrapCharacters: [" ", "/", "\n", "\t"],
              },
              tables: [".table"],
              format: {
                heading: function (elem, fn, options) {
                  var h = fn(elem.children, options);
                  return (
                    "\n--- [ " + h.toUpperCase().replace("\n", " ") + " ] ---\n"
                  );
                },
              },
            })
            .trim()
        );
        break;
    }
    console.log(new Date().toISOString(), req.method, req.url);
    res.end();
  })
  .listen(port, () => {
    console.log(`Contester server started, port=${port}`);
  });
