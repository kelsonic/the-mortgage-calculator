// Dependencies
const { exec } = require('child_process');
// Externals
const deriveEnvVars = require('./deriveEnvVars');

// Derive the command to run.
const command = `${deriveEnvVars()} react-scripts start`;

// Execute the command.
exec(command);
