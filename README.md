# Contester - hello world container

Container test image - simple http server with diagnostics and metrics

## Quick start

Usage: `docker run -d -p 8080:8080 yankeepl/contester:latest`

Check output: `curl http://localhost:8080`

## Configuration environment variables

* `PORT` - server port - default 8080
* `CONTESTER_MESSAGE` - custom message - default "hello world"

## Build your own image

```
docker-compose build
docker-compose up -d
```

http server: http://localhost:8080

## Example output:
```
--- [ CONTESTER SAYS "HELLO WORLD" FROM HOST TEST-DEPLOYMENT-CC7454988-XMFSF ] ---

--- [ DOCKER LEGACY LINKS ] ---
APP_SERVICE_NODE    tcp://10.0.9.221:80
KUBERNETES          tcp://10.0.0.1:443
TEST_SERVICE_NODE   tcp://10.0.13.97:80

--- [ KUBERNETES SERVICES ] ---
APP_SERVICE_NODE    10.0.9.221:80
KUBERNETES          10.0.0.1:443
TEST_SERVICE_NODE   10.0.13.97:80

--- [ REQUEST INFO ] ---
localAddress    ::ffff:10.64.3.50
localPort       8080
remoteAddress   ::ffff:10.132.0.7
request         GET /test/
timestamp       2020-07-17T13:07:45.324Z

--- [ SYSTEM INFO ] ---
hostname       test-deployment-cc7454988-xmfsf
load_01        1.07373046875
load_05        1.08447265625
load_15        1.08544921875
memoryFree     109 mb
memoryTotal    1694 mb
platform       linux, 4.14.138+, x64
systemUptime   1309433 s

--- [ METRICS ] ---
count     144
mean      0.52 req/s
rate_01   0.62 req/s
rate_05   0.35 req/s
rate_15   0.14 req/s
uptime    277.59 s

--- [ ENVIRONMENT VARIABLES ] ---
APP_SERVICE_NODE_PORT                 tcp://10.0.9.221:80
APP_SERVICE_NODE_PORT_80_TCP          tcp://10.0.9.221:80
APP_SERVICE_NODE_PORT_80_TCP_ADDR     10.0.9.221
APP_SERVICE_NODE_PORT_80_TCP_PORT     80
APP_SERVICE_NODE_PORT_80_TCP_PROTO    tcp
APP_SERVICE_NODE_SERVICE_HOST         10.0.9.221
APP_SERVICE_NODE_SERVICE_PORT         80
HOME                                  /home/contest
HOSTNAME                              test-deployment-cc7454988-xmfsf
INIT_CWD                              /usr/src/app
KUBERNETES_PORT                       tcp://10.0.0.1:443
KUBERNETES_PORT_443_TCP               tcp://10.0.0.1:443
KUBERNETES_PORT_443_TCP_ADDR          10.0.0.1
KUBERNETES_PORT_443_TCP_PORT          443
KUBERNETES_PORT_443_TCP_PROTO         tcp
KUBERNETES_SERVICE_HOST               10.0.0.1
KUBERNETES_SERVICE_PORT               443
KUBERNETES_SERVICE_PORT_HTTPS         443
PWD                                   /usr/src/app
TEST_SERVICE_NODE_PORT                tcp://10.0.13.97:80
TEST_SERVICE_NODE_PORT_80_TCP         tcp://10.0.13.97:80
TEST_SERVICE_NODE_PORT_80_TCP_ADDR    10.0.13.97
TEST_SERVICE_NODE_PORT_80_TCP_PORT    80
TEST_SERVICE_NODE_PORT_80_TCP_PROTO   tcp
TEST_SERVICE_NODE_SERVICE_HOST        10.0.13.97
TEST_SERVICE_NODE_SERVICE_PORT        80

--- [ HEADERS ] ---
accept                  */*
connection              Keep-Alive
host                    1.2.3.4
user-agent              curl/7.64.0
via                     1.1 google
```

## Server development

Nodejs pure http server (no express, hapi, etc). Start server with file watcher:
```
yarn install
yarn dev
```