const EventEmitter = {
    events: new Map(),
    listen: (topic, cb) => {
        topic = "!" + topic
        const oldEvents = EventEmitter.events.get(topic)
        if (EventEmitter.events.has(topic)) {
            return EventEmitter.events.set(topic, [ ...oldEvents, cb ])
        }
        return EventEmitter.events.set(topic, [ cb ])
    },
    emit: (topic, data) => {
        if(!topic.startsWith("!")) {
            topic = "!"+topic;
        }
        const myListeners = EventEmitter.events.get(topic)
        if (Array.isArray(myListeners) && myListeners.length) {
            myListeners.forEach(event => event.execute(data))
        }
    }
}

module.exports = EventEmitter;