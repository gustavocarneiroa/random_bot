import { getRandomIndex, getResponse } from "../common/utils";
import { Command, JSCondition, PriorityOption } from "../commands/command.entity"
import { TwitchClient } from "../clients/twitch.client";

export class EventCommand {
    public channel: string;
    public command: string;
    private options: string[] | PriorityOption[];
    private type: string;
    public messages: string[];
    private default_target?: string;
    private blacklist: string[];
    private blacklist_message?: string;
    private condition?: JSCondition;

    constructor(props: Command) {
        this.channel = props.channel;
        this.command = `!${props.command}`;
        this.options = props.options;
        this.type = props.type;
        this.messages = props.messages;
        this.default_target = props.default_target;
        this.blacklist = props.blacklist ?? [];
        this.blacklist_message = props.blacklist_message;
        this.condition = props.condition;
    }

    public execute({ user, target }: { user: string; target: string }): void {
        const result = this[this.type] ? this[this.type](target) : "";
        const messages = this.executeMessages(user, target, result);

        for (const message of messages) {
            TwitchClient.say(this.channel, message);
        }
    }

    private random(): string {
        const options = this.options as string[];
        const randomIndex = getRandomIndex(0, options.length - 1);
        return options[randomIndex];
    }

    private by_priority(): string {
        const options = this.options as PriorityOption[];
        const weight = options.map((option) => {
            return 2 ** option.priority
        });
        const weightReduced = weight.reduce((acc, w) => acc + w, 0);
        let randomChoice = Math.random() * weightReduced;

        for (let i = 0; i < options.length; i++) {
            randomChoice -= weight[i];

            if (randomChoice <= 0) {
                return options[i].message;
            }
        }

        return options[0].message;
    }

    private direct_messages(): string {
        return "";
    }

    private response(target: string): string {
        const result = Math.random() < 0.5;
        console.log(target)
        const responses = getResponse(target);

        return result ? responses.positive : responses.negative;
    }

    private getConditionalMessage(): { result: boolean; message: string } {
        const conditionFunction = eval(this.condition?.jsFunction || "false");
        const { raw_result, condition } = conditionFunction();

        return {
            result: raw_result,
            message: condition ? this.condition?.positive || "" : this.condition?.negative || "",
        };
    }

    private executeMessages(user: string, target: string, result: string): string[] {
        return this.messages.map((message) => {
            let modifiedMessage = message;

            const inBlacklist = this.blacklist.some((list) => target?.includes(list) || false);
            if (inBlacklist) {
                modifiedMessage = this.blacklist_message ?? "";
            }

            if (modifiedMessage === "{{CONDITION}}") {
                const results = this.getConditionalMessage();
                result = results.result.toString();
                modifiedMessage = results.message;
            }

            const replacedResult = modifiedMessage.replace(/{{RESULT}}/g, result);
            const replacedUser = replacedResult.replace(/{{USER}}/g, user ? `@${user}` : "");
            const replacedTarget = replacedUser.replace(/{{TARGET}}/g, target ? target : this.default_target || "");
            const replaceRandom = replacedTarget.replace(/{{RANDOM_PERCENTAGE}}/g, getRandomIndex(0, 100).toString());

            return replaceRandom;
        });
    }
}