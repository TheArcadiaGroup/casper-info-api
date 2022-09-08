import winston, { level, transport } from 'winston';

export const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { time: Date.now() },
  transports: [
    new winston.transports.File({ filename: '../logs/error.json', level: 'error' }),
    new winston.transports.File({ filename: '../logs/debug.json', level: 'debug' }),
    new winston.transports.File({ filename: '../logs/info.json', level: 'info' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}
