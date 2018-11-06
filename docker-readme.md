![Ribamar](https://i.imgur.com/MNzMeoO.png)

Ribamar is an open source RESTful micro-service for managing user accounts, authentication, and authorization. Send confirmation e-mails; manage groups; store general user data etc...

## Quick Start
1. The Ribamar container requires a running instance of [MongoDB](https://hub.docker.com/_/mongo/) to properly work.
2. Once MongoDB is up, start Ribamar container with: `docker run -d -p 6776:6776 --name ribamar --link db ribamar:latest`.
3. In your browser, hit `http://localhost:6776`.
4. You have successfully started quickly!

### Settings File
Ribamar container expects the default configuration file to be in `/usr/src/ribamar/conf.yml` you should mount it in with `-v` when running or `volumes:` in docker-compose.

## Reporting Bugs
If you have found any problems with Ribamar, please:

1. [Open an issue](https://gitlab.com/ribamar-org/ribamar/issues/new).
2. Describe what happened and how.
3. Also in the issue text, reference the label `~bug`.

We will make sure to take a look when time allows us.

## Proposing Features
If you wish to have that awesome feature or have any advice for us, please:
1. [Open an issue](https://gitlab.com/ribamar-org/ribamar/issues/new).
2. Describe your ideas.
3. Also in the issue text, reference the label `~proposal`.

## Contributing
If you have spotted any enhancements to be made and is willing to get your hands dirty about it, fork us and [submit your merge request](https://gitlab.com/ribamar-org/ribamar/merge_requests/new) so we can collaborate effectively.

Be always sure to follow our cool [guidelines for delightful contribution](https://ribamar-org.gitlab.io/ribamar/contribution/guidelines/).

If you are somewhat unfamiliar with the common community workflow, you may head to our [step-by-step contributing guide](https://ribamar-org.gitlab.io/ribamar/contribution/step-by-step/).

## Supporting
We have no formal way to receive any donation or alike, so if you happen to feel caring about us, we would be delighted to hear about you directly in [our inboxes](#contact-us).

## Contact Us
- gcsboss@gmail.com
