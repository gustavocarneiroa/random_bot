import { Command } from "./command.entity";
import ConnectionFactory from "../database/mongodb_atlas.connection";
import { FindOneOptions } from "typeorm";


export class CommandRepository {
  static async insert(command: Partial<Command>) {
    const connection = await ConnectionFactory.connect();
    try {
      const commandRepository = await connection.getMongoRepository(Command);
      const newCommand = commandRepository.create(command);
      await commandRepository.save(newCommand);
  
      return newCommand;
    }
    catch (err) {
      console.error(err)
    }
    finally {
      await connection.destroy()
    }
  }

  static async findAll(options?: FindOneOptions<Command>) {
    const connection = await ConnectionFactory.connect();
    try {
      const commandRepository = await connection.getMongoRepository(Command);
      const commands = await commandRepository.find(options);
  
      return commands;
    }
    catch (err) {
      console.error(err)
    }
    finally {
      await connection.destroy()
    }
  }

  static async channels() {
    const connection = await ConnectionFactory.connect();
    try {
      const commandRepository = await connection.getMongoRepository(Command);
      const command = await commandRepository.distinct("channel", {});
  
      return command;
    }
    catch (err) {
      console.error(err)
    }
    finally {
      await connection.destroy()
    }
  }

  static async remove(commandName: string, channel: string) {
    const connection = await ConnectionFactory.connect();
    try {
      const commandRepository = await connection.getMongoRepository(Command);
      const command = await commandRepository.delete({
        channel: channel,
        command: commandName.startsWith("!") ? commandName : ` !${commandName}`
      });
  
      return command;
    }
    catch (err) {
      console.error(err)
    }
    finally {
      await connection.destroy()
    }
  }
}