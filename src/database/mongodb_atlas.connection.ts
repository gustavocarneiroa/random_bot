import { DataSource, DataSourceOptions, EntityTarget, MongoRepository } from "typeorm"
import { Command } from "../commands/command.entity"
import { GatewayConverter } from "../gateways/GatewayConverter.entity";


export default class ConnectionFactory {
    static getConnectionConfig(): DataSourceOptions {
        return {
            type: "mongodb",
            url: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            logging: true,
            entities: [Command, GatewayConverter]
        }
    }

    static connect() {
        const connectionConfig = ConnectionFactory.getConnectionConfig();
        const dataSource = new DataSource(connectionConfig);

        return dataSource.initialize();
    }

    static getMongoRepository<T>(entityClass: EntityTarget<T>, connection: DataSource) : MongoRepository<T> {
        return connection.getMongoRepository(entityClass)
    }
}