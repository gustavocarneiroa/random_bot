import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import * as tmi from "tmi.js"
import { EventCommand } from "./eventCommand";
import { EventEmitter } from "./eventEmitter";
import * as commandRepository from "./repository/commands.repository";
const app = express();
app.use(express.json());

const opts = {
    options: { debug: true },
    identity: { username: process.env.BOT_USER, password: process.env.BOT_AUTH },
    channels: [ 'surfentynha' ]
};

const client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
console.log("Teste")
client.connect();
(async () => {
    try {
        const commands = await commandRepository.get();
        for (const command of commands) {
            const props = JSON.parse(command.json_data)
            const event = new EventCommand({
                ...props,
                client: client,
            })
            EventEmitter.listen(props.command, event)
        }

        console.log(EventEmitter)
    } catch (e) {
        console.log(e)
    }

})();
function onMessageHandler(target: string, context: any, msg: string, self: boolean) {
    if (self) { return; } 
    if(!msg.startsWith("!")) { return; }
    const messageInfo = {
        username: context.username,
        target: '',
        command: '',
    }

    const regexMessageCorrespondence = msg.match(/!(\S+)\s*(.*)/);
    if (regexMessageCorrespondence) {
        [,messageInfo.command, messageInfo.target] = regexMessageCorrespondence ?? [];
    }

    EventEmitter.emit(messageInfo.command, {
        origin: target,
        user: messageInfo.username,
        target: messageInfo.target,
    });
}

app.get("/", (req, res) => {
    console.log(EventEmitter);
    res.json(Array.from(EventEmitter.events.keys()))
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
    EventEmitter.listen(req.params.command, event)
    console.log(EventEmitter)
    await commandRepository.insert(props)
    res.json(props);
})
function onConnectedHandler(addr: string, port: number) {
    console.log(`* Connected to ${addr}:${port}`);
}

app.listen(5005, () => console.log(`Connected at 5005`))