import pino from 'pino'

export const logger = pino ({
    transports :{
        options: { colorize: true },
        target: 'pino-pretty',
    },
    level: process.env.GO_LEVEL || 'info',
})
