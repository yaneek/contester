# Contester - hello world container

Container image tester - http server with diagnostics and metrics

## Build image

`docker-compose build`

## Configuration

* `$PORT` - server port - default 8080
* `$CONTESTER_MESSAGE` - custom message - default "hello world"

## Start contester container

`docker-compose up -d`

http server: http://localhost:8080



## Example output:
```
Contester say "some other message" from host 1853a0ecdb67

Request info
localAddress  ::ffff:192.168.96.2
localPort     8080
remoteAddress ::ffff:192.168.96.1
request       GET /
timestamp     2020-07-16T23:09:58.135Z

System info
hostname      1853a0ecdb67
load_01       0.0087890625
load_05       0.02197265625
load_15       0
memoryFree    224 mb
memoryTotal   1990 mb
platform      linux, 4.19.76-linuxkit, x64
systemUptime  74715 s

Metrics
count         21
mean          0.12 req/s
rate_01       0.24 req/s
rate_05       0.05 req/s
rate_15       0.02 req/s
uptime        168.64 s

Environment variables
CONTESTER_MESSAGE   some other message
HOME                /home/contest
HOSTNAME            1853a0ecdb67
INIT_CWD            /usr/src/app
...
```