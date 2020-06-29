//import { config } from 'dotenv'
import { connect } from 'mqtt'
import serialPort from 'serialport'
const Readline = require('@serialport/parser-readline')
import { exec } from 'child_process'

//config()
exec('sudo wvdial')

/*const { username, password, host, port, reconnectPeriod } = JSON.parse(
    process.env.MQTT_CONFIG
)*/

const username = 'rmydskjv'
const password = 'HeEapqQBfdJ7'
const host = 'mqtt://m10.cloudmqtt.com'
const port = 11897

const client = connect(host, {
    username,
    password,
    port,
    clean: true,
    keepalive: 1,
})

client.on('connect', () => {
    client.publish('gateway', 'connected')
    console.log('MQTT: CONNECTED\n')
})

client.on('error', err => {
    console.log(`MQTT: ERROR CONNECTING: ${err.message}`)
})

client.on('close', () => {
    console.log('MQTT: DISCONNECTED')
})

client.on('reconnect', () => {
    console.log('MQTT: TRYING TO RECONNET')
})

exec('sudo chmod 666 /dev/ttyS0')

const serialport = new serialPort('/dev/ttyS0', {
    baudRate: 9600,
    autoOpen: false,
})

serialport.open(err => {
    console.log(err)
})

serialport.on('open', () => {
    console.log('\nRADIO: SERIAL PORT OPEN\n')
})

const parser = serialport.pipe(new Readline({ delimiter: '\n' }))

parser.on('data', data => {
    try {
        const dataObject = JSON.parse(data)
        const { id } = dataObject
        delete dataObject.id
        const rtc = new Date.now()

        dataObject.rtc = rtc

        const payload = JSON.stringify(dataObject)
        console.log(payload)

        client.publish(id, payload)
    } catch (err) {
        console.log(err.message)
    }
})
