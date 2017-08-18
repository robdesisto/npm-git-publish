import publish from './lib/publish';

const packageDir = __dirname;
const gitRemoteUrl = 'git@github.com:chaosfinity/npm-git-publish.git';

publish(packageDir, gitRemoteUrl, { branchName: 'release' })
  .then(result => {
    if (result.conclusion === publish.PUSHED) {
      console.log(`Status: PUBLISHED`);
    } else if (result.conclusion === publish.SKIPPED) {
      console.log(`Status: SKIPPED`);
    } else if (result.conclusion === publish.CANCELLED) {
      console.error(`Status: CANCELLED`);
    }
  })
;
