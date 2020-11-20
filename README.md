# webex-webhook-bridge

## Description
This application is a simple node.js app that registers for events in Webex Teams via websocket and forwards them to a specified host:port or to sends them to Kafka topic.

## Environment variable requirements
**WEBEX_TOKEN**: Webex Teams application access token

Webhook forward:<br/>
* **WEBEX_WEBHOOK_HOST**: The hostname to forward webhook to.<br/>
* **WEBEX_WEBHOOK_PORT**: A port number to forward webhook to.<br/>

Kafka topic producer:<br/>
* **WEBEX_KAFKA_BROKERS**: The list of Kafka brokers delimited with semicolon (e.g. "localhost:9092;192.168.11.10:9092")<br/>
* **WEBEX_KAFKA_CLIENT**: Kafka client Id<br/>
* **WEBEX_KAFKA_TOPIC**: Kafka topic for a producer<br/>


## Install and run

* clone the repo
* ```npm install```
* ```node app.js```
