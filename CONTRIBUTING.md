# Contributing
Help us make of Ribamar a tool for you.
We would appreciate very much if you all join your heads to ours.

If you have spot any enhancements to be made and is willing to dirt your hands about it, fork us and [submit your merge request](https://gitlab.com/ribamar-org/ribamar/merge_requests/new) so we can collaborate effectively.

If you are somewhat unfamiliar with the common community workflow, you may head to our [step-by-step contributing guide](#setp-by-step).

## Step-by-Step
1. Install the [recommended development toolchain](#toolchain).
2. [Fork ribamar in gitlab](https://gitlab.com/ribamar-org/ribamar/forks/new).
3. Create a branch in the forked repo for your code.
4. Code your most awesome ideas.
5. Ensure your code follow our [cool code styling](#code-style).
6. [Add full test coverage to your code and debug it](#testing).
7. Ensure it passes on all pipelines.
8. [Submit a Merge Request](https://gitlab.com/ribamar-org/ribamar/merge_requests/new) of your branch targeting our `master` or the related protected branch.
9. [Be cool!](#community-sense)
10. In the Merge Request, help us to review and fine tune your contribution.

If all goes well, your fingerprints will soon be all over Ribamar.

> We may eventualy find the need to edit your commits' order or messages, but we will always keep your name on it.

## Toolchain
The recommended tools for contributing to Ribamar are as follow:

- [Atom Text Editor](https://atom.io/) and the following community packages:
  - file-icons
  - linter
  - linter-eslint
  - minimap
  - selection-highlight
- [MongoDB Community Server](https://www.mongodb.com/download-center#community)
- [SmartGit](https://www.syntevo.com/smartgit/download/)
- [NodeJS Latest Version](https://nodejs.org/en/download/current/) and the following global packages:
  - mocha
  - nyc

## Testing
We use [Mocha](https://mochajs.org/) for unit-testing our JS, and [NYC](https://istanbul.js.org/) for test coverage reports.

All code in Ribamar must be unit-tested from the start, so try your best to include you work in the `test/spec.js` file. Our team will also be at your aid in MRs to help you with testing.

Be sure to check other modules' test cases to inspire your own.

In order to find bugs and test your code, you must simply `cd` to the project's directory nd run: `nyc npm t`. This command will run the unit tests and output the coverage report.

## Guidelines
Below we present you our cool guideline for how to make **delightful contribution**. Be sure to adhere so we all can embrace your work as quickly as possible.

### Code Style
1. Comment *all* section of code. Group your code in little blocks and tag them with brief single-line comments.

```

// Do some cool stuff
code code code...
code code code...
code code code...

```
2. Implement all suggestions (warnings) ESLint gives you. Our main code style is setup in `.eslintrc.yml`.
3. **Bonus Tip:** Be sure to check some files already in the poroject to get a grasp of our style.

### Community Sense
1. Be respectful and polite in all communication channels.
2. Consider all suggestions and ideas other may present you the same way you expect others to consider your contributions.
3. Be open to constructive criticism.
