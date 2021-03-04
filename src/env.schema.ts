import Joi from 'joi';

export const ENV_SCHEMA = Joi.object({
  APP_JWT_TOKEN_SECRET: Joi.string().required(),
  APP_JWT_TOKEN_EXPIRY: Joi.number().required(),
  MONGO_INITDB_ROOT_USERNAME: Joi.string().required(),
  MONGO_INITDB_ROOT_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});

export default () => {
  const DB_USER = process.env.MONGO_INITDB_ROOT_USERNAME;
  const DB_PASS = process.env.MONGO_INITDB_ROOT_PASSWORD;
  const DB_HOST = process.env.DB_HOST;
  const DB_NAME = process.env.DB_NAME;
  return {
    DB_CONNECTION: `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&authSource=admin`,
  };
};
