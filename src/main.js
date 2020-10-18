import { connect } from 'mqtt'
import serialPort from 'serialport'
import Readline from '@serialport/parser-readline'
import { exec } from 'child_process'
import fs from 'fs'
import { config } from 'dotenv'

config()
// exec('sudo wvdial')

fs.appendFile('data.txt', 'STORAGE_BEGIN\n', err => {
    console.log(`CREATE FILE ERROR: ${err?.message}`)
})

const { username, password, host, port } = JSON.parse(process.env.MQTT_CONFIG)

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
        dataObject.rtc = new Date()

        const payload = JSON.stringify(dataObject)
        console.log(payload)

        client.publish(id, payload)

        fs.appendFile('data.txt', `${payload}\n`, err => {
            console.log(`APPEND FILE ERROR: ${err?.message}`)
        })
    } catch (err) {
        console.log(err.message)
    }
})
