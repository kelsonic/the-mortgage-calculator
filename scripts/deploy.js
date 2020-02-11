// Dependencies
const fetch = require('isomorphic-fetch');
const ora = require('ora');
const readline = require('readline');
const { exec } = require('child_process');
// Externals
const deriveEnvVars = require('./deriveEnvVars');
const { name } = require('../package.json');

// Create our colors for the command line.
const greenify = (input) => `\x1b[1;92m${input}\x1b[0m`;
const reddify = (input) => `\x1b[91m${input}\x1b[0m`;

// Create the slack URL.
const SLACK_URL = '';

// Construct valid environments.
const ENVIRONMENTS = {
  production: 'mortgage-calculator-1e023',
};

// Construct the download links for each environment.
const DOWNLOAD_LINKS_LOOKUP = {
  production: 'https://mortgage-calculator-1e023.firebaseapp.com\nhttps://leanlooper.com',
};

// Construct valid version bump types.
const VERSION_BUMP_TYPES = {
  patch: 'patch',
  minor: 'minor',
  major: 'major',
};

// Create our interface to ask questions.
const myInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let env;
let versionBumpType;

// Determine the environment to deploy to.
myInterface.question(
  greenify('What environment would you like to deploy to? [ dev, staging, production ] '),
  (answer) => {
    // Derive if the environment is valid.
    const envValue = ENVIRONMENTS[answer];

    // Escape early if they did not choose a valid environment.
    if (!envValue) {
      console.log(reddify(`"${answer}" is not a valid environment. Please type either [ dev, staging, production ].`));
      myInterface.close();
      return;
    }

    // Assign our env.
    env = answer;

    // Check to see if we're on production, then ask the version bump type.
    if (env === 'production') {
      myInterface.question(greenify('What type of update is this? [ patch, minor, major ] '), (answer) => {
        // Derive the versionBumpType.
        versionBumpType = VERSION_BUMP_TYPES[answer];

        // Escape early if they did not choose a valid update type but still provided an answer.
        if (!versionBumpType && answer) {
          console.log(
            reddify(`"${answer}" is not a valid version bump type. Please type either [ patch, minor, major ].`),
          );
          myInterface.close();
        }

        // Start deploying.
        startDeploying();
      });
      return;
    }

    // Start deploying.
    startDeploying();
  },
);

// Start deploying function.
const startDeploying = () => {
  // Close the question.
  myInterface.close();

  // Now we start deploying.
  checkBranch(() => deploy(() => notify()));
};

// Check to see if they are on the right branch before deploying.
const checkBranch = (callback) => {
  exec('git branch | grep "*" | cut -d " " -f2', (err, branch) => {
    // Error running the command. OS issue?
    if (err) {
      console.error(err);
      return;
    }

    // Ensure they are on the correct branch before deploying to production.
    if (env === 'production' && branch !== 'production\n') {
      console.error(reddify('You must be on the production branch to deploy to production.'));
      return;
    }

    // Ensure they are on the correct branch before deploying to staging.
    if (env === 'staging' && branch !== 'staging\n') {
      console.error(reddify('You must be on the staging branch to deploy to staging.'));
      return;
    }

    // Ensure they are on the correct branch before deploying to dev.
    if (env === 'dev' && branch !== 'dev\n') {
      console.error(reddify('You must be on the dev branch to deploy to dev.'));
      return;
    }

    // Continue.
    callback();
  });
};

// Create our build with a bundler.
const deploy = (callback) => {
  // Show a spinner while we are deploying.
  const spinner = ora({
    spinner: 'pong',
    text: greenify(`Deploying ${name} to ${env}... Enjoy the ping pong while you wait.`),
  }).start();

  // Build.
  exec(`${deriveEnvVars(env)} yarn build`, (err, stdout, stderr) => {
    // Escape early if we failed to build.
    if (err) {
      spinner.fail();
      console.log(stdout);
      console.log(stderr);
      console.error(reddify('Error building.'), err);
      return;
    }

    // Derive the current environment.
    const environment = ENVIRONMENTS[env];

    // Deploy build folder to the server.
    exec(`firebase use --add ${environment} && firebase deploy`, (err, stdout, stderr) => {
      // Escape early if we failed to deploy to the desired environment.
      if (err) {
        spinner.fail();
        console.log(stdout);
        console.log(stderr);
        console.error(reddify('Error deploying to desired environment'), err);
        return;
      }

      // Continue.
      spinner.succeed();
      callback();
    });
  });
};

const notify = () => {
  const text = `Frontend has been deployed to *${env.toUpperCase()}*\n\`\`\`${DOWNLOAD_LINKS_LOOKUP[env]}\`\`\``;

  // Log that we're done in the console.
  console.log(greenify(text));

  // Notify slack via the webhook.
  if (SLACK_URL) {
    fetch(SLACK_URL, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
      .then(() => {
        console.log(greenify('✔ Slack notified'));
      })
      .catch((error) => {
        console.error('Error notifying Slack:', error);
      });
  }

  // Bump the version if they provided a versionBumpType.
  if (env === 'production' && versionBumpType) {
    console.log(greenify('Bumping version and creating new tag...'));
    exec(`yarn version-bump:${versionBumpType}`, (err, stdout, stderr) => {
      if (err) {
        console.log(stdout);
        console.log(stderr);
        console.error(reddify('Error bumping version.'), err);
        return;
      }
      console.log(greenify("Created new version tag successfully. You're all set!"));
    });
  }
};
