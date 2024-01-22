import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity("command")
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string;

  @Column()
  email: string;
}