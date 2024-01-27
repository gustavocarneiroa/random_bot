import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';
export interface PriorityOption {
  priority: number;
  message: string;
}

export interface JSCondition {
  jsFunction: string;
  positive: string;
  negative: string;
}

@Entity("command")
export class Command {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  channel: string;

  @Column()
  command: string;

  @Column()
  options?: string[] | PriorityOption[];

  @Column()
  type: string;

  @Column()
  messages: string[];

  @Column({ default: null })
  default_target?: string;

  @Column({ default: [] })
  blacklist?: string[];

  @Column({ default: null })
  blacklist_message?: string;

  @Column({ default: null })
  condition?: JSCondition;
}