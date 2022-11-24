// https://dev.to/asjadanis/parsing-env-with-typescript-3jjm

import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  DB_USER: string | undefined;
  DB_PASS: string | undefined;
  DB_HOST: string | undefined;
  DB_PORT: string | undefined;
  DB_NAME: string | undefined;
  NODE_ENV: string | undefined;
  SITE_PATH: string | undefined;
  DRAFTS_PATH: string | undefined;
  PUBLISH_PATH: string | undefined;
}

interface Config {
  DB_USER: string | undefined;
  DB_PASS: string | undefined;
  DB_HOST: string | undefined;
  DB_PORT: string | undefined;
  DB_NAME: string | undefined;
  NODE_ENV: string | undefined;
  SITE_PATH: string | undefined;
  DRAFTS_PATH: string | undefined;
  PUBLISH_PATH: string | undefined;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    DB_PORT: process.env.DB_PORT, // ? Number(process.env.PORT) : undefined,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV,
    SITE_PATH: process.env.SITE_PATH,
    DRAFTS_PATH: process.env.DRAFTS_PATH,
    PUBLISH_PATH: process.env.PUBLISH_PATH,
  };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
