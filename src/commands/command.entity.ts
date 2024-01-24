import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';
import { z } from "zod";
export interface PriorityOption {
  priority: number;
  message: string;
}

export interface JSCondition {
  jsFunction: string;
  positive: string;
  negative: string;
}

export const baseCommandSchema = z.object({
  channel: z.string({
    required_error: "Channel is required",
    invalid_type_error: "Channel must be a string",
  }),
  command: z.string({
    required_error: "Command is required",
    invalid_type_error: "Command must be a string",
  }),
  messages: z.string().array().nonempty().max(3),
  default_target: z.string().optional(),
  blacklist: z.string().array().optional(),
  blacklist_message: z.string().optional(),
})

export const commandSchemasByType = {
  random: z.object({
    options: z.string().array().nonempty()
  }),
  by_priority: z.object({
    options: z.object({
      priority: z.number().min(-1).max(1).int(),
      message: z.string()
    })
  }),
  direct_messages: z.object({
    options: z.union([z.null(), z.undefined()])
  }),
  response: z.object({
    options: z.union([z.null(), z.undefined()])
  }),
  condition: z.object({
    options: z.union([z.null(), z.undefined()]),
    condition: z.object({
      jsFunction: z.string().startsWith("() =>", "Must start with \"() =>\""),
      positive: z.string(),
      negative: z.string(),
    })
  }),
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