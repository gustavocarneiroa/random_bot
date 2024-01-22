import { EventCommand } from "../src/eventCommand"

export const EventEmitter = {
    events: new Map<string, EventCommand[]>(),
    listen: (topic: string, cb: EventCommand) => {
        topic = "!" + topic
        const oldEvents = EventEmitter.events.get(topic) ?? []
        if (EventEmitter.events.has(topic)) {
            return EventEmitter.events.set(topic, [...oldEvents, cb])
        }
        return EventEmitter.events.set(topic, [cb])
    },
    emit: (topic: string, data: any) => {
        if (!topic.startsWith("!")) {
            topic = "!" + topic;
        }
        const myListeners = EventEmitter.events.get(topic) ?? [];
        if (myListeners.length) {
            myListeners.forEach(event => {
                if (data.origin === event.channel)
                    event.execute(data)
            })
        }
    }
}