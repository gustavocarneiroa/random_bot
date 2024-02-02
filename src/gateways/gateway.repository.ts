
import ConnectionFactory from "../database/mongodb_atlas.connection";
import { GatewayConverter } from "./GatewayConverter.entity";


export class GatewayRepository {
    static async get(options: Partial<GatewayConverter>) : Promise<GatewayConverter> {
        const connection = await ConnectionFactory.connect();
        try {
            const gatewayRepository = await connection.getMongoRepository(GatewayConverter);
            const gateway = await gatewayRepository.findOne({
                where: options
            });

            return gateway;
        }
        catch (err) {
            console.error(err)
        }
        finally {
            await connection.destroy()
        }
    }

    static async insert(gateway: Partial<GatewayConverter>) {
        const connection = await ConnectionFactory.connect();
        try {
            const gatewayRepository = await connection.getMongoRepository(GatewayConverter);
            const newGatewayConnection = await gatewayRepository.create(gateway);
            await gatewayRepository.save(newGatewayConnection);

            return newGatewayConnection;
        }
        catch (err) {
            console.error(err)
        }
        finally {
            await connection.destroy()
        }
    }
}