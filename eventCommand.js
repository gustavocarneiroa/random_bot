const { getRandomIndex, getResponse } = require("./utils");

class EventCommand {
    constructor(props) {
        this.client = props.client;
        this.channel = props.channel;
        this.command = `!${props.command}`;
        this.options = props.options;
        this.hasOptions = !!props.options;
        this.type = props.type;
        this.messages = props.messages;
        this.default_target = props.default_target;
        this.blacklist = props.blacklist ?? [];
        this.blacklist_message = props.blacklist_message;
        this.condition = props.condition;
    }

    execute({ user, target }) {
        const types = {
            random: this.random,
            by_priority: this.by_priority,
            direct_messages: this.direct_messages,
            response: this.response,
        }
        const result = this.type && types[this.type] ? types[this.type](target) : "";
        const messages = this.executeMessages(user, target, result);

        for(const message of messages) {
            this.client.say(this.channel, message)
        }
    }

    random() {
        const options = this.options;
        const randomIndex = getRandomIndex(0, options.length - 1);
        return options[randomIndex];
    }

    by_priority() {
        const weight = this.options.map((option) => 2 ** option.priority);
        const weightReduced = weight.reduce((acc, w) => acc + w, 0);
        let randomChoice = Math.random() * weightReduced;
        for (let i = 0; i < this.options.length; i++) {
          randomChoice -= weight[i];
      
          if (randomChoice <= 0) {
            return this.options[i].message;
          }
        }

        return this.options[0].message;
    }

    direct_messages() {
        return ""
    }

    response(target) {
        const result = Math.random() < 0.5
        const responses =  getResponse(target);

        return result ? responses.positive : responses.negative
    }

    getConditionalMessage() {
        const conditionFunction = eval(this.condition.jsFunction);
        const { raw_result, condition } = conditionFunction();

        return {
            result: raw_result,
            message: condition ? 
               this.condition.positive :
               this.condition.negative,

        }
    }

    executeMessages(user, target, result) {
        return this.messages.map( message => {
            const inBlacklist = this.blacklist.some( list => target.includes(list));
            if(inBlacklist) {
                message =  this.blacklist_message ?? "";
            }

            if(message == "{{CONDITION}}") {
                const results = this.getConditionalMessage();
                result = results.result
                message = results.message
            }

            const replacedResult = message.replace(/{{RESULT}}/g, result);
            const replacedUser = replacedResult.replace(/{{USER}}/g, user ? "@" + user : "" );
            const replacedTarget = replacedUser.replace(/{{TARGET}}/g, target ? target : this.default_target || "");
            const replaceRandom = replacedTarget.replace(/{{RANDOM_PERCENTAGE}}/g, getRandomIndex(0, 100));
            
            return replaceRandom;
        })
    }
}


module.exports = {
    EventCommand
}