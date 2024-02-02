import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity("gateway")
export class GatewayConverter {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  twitch_channel: string;

  @Column()
  discord_server: string;
}