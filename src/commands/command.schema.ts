import { z } from "zod";

export const baseUpdatableSchema = z.object({
    messages: z.string().array().nonempty().max(3),
    default_target: z.string().optional(),
    blacklist: z.string().array().optional(),
    blacklist_message: z.string().optional(),
})

const inputSchema = z.object({
    channel: z.string({
        required_error: "Channel is required",
        invalid_type_error: "Channel must be a string",
    }),
    command: z.string({
        required_error: "Command is required",
        invalid_type_error: "Command must be a string",
    }),
    type: z.string({
        required_error: "Type is required",
        invalid_type_error: "Type must be a string",
    }),
})
export const baseCommandSchema = inputSchema.merge(baseUpdatableSchema)
export const updatableSchema = baseUpdatableSchema.merge(
    z.object({
        options: z.union([z.string().array(), z.array(
            z.object({
                priority: z.number().min(-1).max(1).int(),
                message: z.string()
            })
        )])
    })).partial()
export const commandSchemasByType = {
    random: z.object({
        options: z.string().array().nonempty()
    }),
    by_priority: z.object({
        options: z.array(
            z.object({
                priority: z.number().min(-1).max(1).int(),
                message: z.string()
            })
        )
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