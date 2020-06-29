"use strict";

var _mqtt = require("mqtt");

var _serialport = _interopRequireDefault(require("serialport"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { config } from 'dotenv'
const Readline = require('@serialport/parser-readline');

//config()
(0, _child_process.exec)('sudo wvdial');
/*const { username, password, host, port, reconnectPeriod } = JSON.parse(
    process.env.MQTT_CONFIG
)*/

const username = 'rmydskjv';
const password = 'HeEapqQBfdJ7';
const host = 'mqtt://m10.cloudmqtt.com';
const port = 11897;
const client = (0, _mqtt.connect)(host, {
  username,
  password,
  port,
  clean: true,
  keepalive: 1
});
client.on('connect', () => {
  client.publish('gateway', 'connected');
  console.log('MQTT: CONNECTED\n');
});
client.on('error', err => {
  console.log(`MQTT: ERROR CONNECTING: ${err.message}`);
});
client.on('close', () => {
  console.log('MQTT: DISCONNECTED');
});
client.on('reconnect', () => {
  console.log('MQTT: TRYING TO RECONNET');
});
(0, _child_process.exec)('sudo chmod 666 /dev/ttyS0');
const serialport = new _serialport.default('/dev/ttyS0', {
  baudRate: 9600,
  autoOpen: false
});
serialport.open(err => {
  console.log(err);
});
serialport.on('open', () => {
  console.log('\nRADIO: SERIAL PORT OPEN\n');
});
const parser = serialport.pipe(new Readline({
  delimiter: '\n'
}));
parser.on('data', data => {
  try {
    const dataObject = JSON.parse(data);
    const {
      id
    } = dataObject;
    delete dataObject.id;
    const date = new Date.now();
    const timestamp = date.getUTC();
    const payload = JSON.stringify(dataObject);
    console.log(payload);
    client.publish(id, payload);
  } catch (err) {
    console.log(err.message);
  }
});