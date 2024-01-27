import { EventCommand } from "./eventCommand.entity"

export const EventEmitter = {
    events: new Map<string, EventCommand[]>(),
    subscribe: (topic: string, cb: EventCommand) => {
        topic = validatedStringStart(topic, "!");
        const oldEvents = EventEmitter.events.get(topic) ?? []
        return EventEmitter.events.set(topic, [...oldEvents, cb])
    },
    unsubscribe: (topic: string, channel: string) => {
        topic = validatedStringStart(topic, "!");
        const events = EventEmitter.events.get(topic) ?? [];
        const filteredEvents = events.filter( event => event.channel !== channel);
        return EventEmitter.events.set(topic, filteredEvents)
    },
    emit: (topic: string, data: any) => {
        topic = validatedStringStart(topic, "!");
        const topicListeners = EventEmitter.events.get(topic) ?? [];
        const channelListeners = topicListeners.filter( event => data.origin === validatedStringStart(event.channel, "#"));
        for (const event of channelListeners) {
            event.execute(data);
        } 
    },
    update: (topic: string, channel: string, command: EventCommand) => {
        topic = validatedStringStart(topic, "!");
        const events = EventEmitter.events.get(topic);
        for (const [index, event] of events.entries()) {
            if(event.channel == channel) {
                events[index] = command;
            }   	
        }
        EventEmitter.events.set(topic, events);
    }
}


function validatedStringStart(text: string, startsWith: string): string {
    if (!text.startsWith(startsWith)) {
        text = `${startsWith}${text}`;
    }

    return text
}