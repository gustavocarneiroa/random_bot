const express = require('express');
const tmi = require('tmi.js');
const commandRepository = require('./repository/commands.repository');

require("dotenv").config();
const app = express();
app.use(express.json());
const { EventCommand } = require('./eventCommand');
const EventEmitter = require('./eventEmitter');
global.eventEmitter = EventEmitter

const opts = {
    options: { debug: true },
    identity: { username: process.env.BOT_USER, password: process.env.BOT_AUTH },
    channels: [ 'surfentynha' ]
};

const client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();
(async () => {
    try {
        console.log("Buscando comandos...")
        const commands = await commandRepository.get();
        for (const command of commands) {
            const props = JSON.parse(command.json_data)
            const event = new EventCommand({
                ...props,
                client: client,
            })
            global.eventEmitter.listen(props.command, event)
        }

        console.log(global.eventEmitter)
    } catch (e) {
        console.log(e)
    }

})();
function onMessageHandler(_, context, msg, self) {
    if (self) { return; } 
    if(!msg.startsWith("!")) { return; }
    const messageInfo = {
        username: context.username,
        target: null,
        command: null,
    }

    const regexMessageCorrespondence = msg.match(/!(\S+)\s*(.*)/);
    if (regexMessageCorrespondence) {
        [,messageInfo.command, messageInfo.target] = regexMessageCorrespondence;
    }

    global.eventEmitter.emit(messageInfo.command, {
        user: messageInfo.username,
        target: messageInfo.target,
    });
}

app.get("/", (req, res) => {
    console.log(global.eventEmitter);
    res.json(Array.from(global.eventEmitter.events.keys()))
})

app.get("/remove/:id", async (req, res) => {
    await commandRepository.remove(req.params.id);
    res.json({})
})

app.post("/:channel/:command", async (req, res) => {
    const props = {
        ...req.body,
        channel: req.params.channel,
        command: req.params.command,
        type: req.body.type,
    }
    const event = new EventCommand({
        ...props,
        client: client,
    })
    global.eventEmitter.listen(req.params.command, event)
    console.log(global.eventEmitter)
    await commandRepository.insert(props)
    res.json(props);
})
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

app.listen(5005, () => console.log(`Connected at 5005`))