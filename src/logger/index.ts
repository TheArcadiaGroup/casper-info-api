import winston, { level, transport } from 'winston';

export const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'casper-info-api' },
  transports: [new winston.transports.File({ filename: './errors.json', level: 'error' })]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}
