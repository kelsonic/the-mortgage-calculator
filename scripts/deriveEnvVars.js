// Dependencies
const map = require('lodash/map');
const join = require('lodash/join');

const ENVS = {
  production: {
    REACT_APP_API_KEY: '',
    REACT_APP_APP_ID: '',
    REACT_APP_AUTH_DOMAIN: '',
    REACT_APP_DATABASE_URL: '',
    REACT_APP_MESSAGING_SENDER_ID: '',
    REACT_APP_PROJECT_ID: '',
    REACT_APP_STORAGE_BUCKET: '',
  },
};

const deriveEnvVars = (env = 'dev') => {
  // Derive the envVars object.
  const envVarsLookup = ENVS[env];

  // Escape early if we were unable to find the env.
  if (!envVarsLookup) {
    return [];
  }

  // Convert the object to an array of strings. ["key=value", "key1=value1", ...]
  const envVarsList = map(envVarsLookup, (value, key) => `${key}=${value}`);

  // Convert the array to a string. "key=value key1=value1 ..."
  return join(envVarsList, ' ');
};

module.exports = deriveEnvVars;
