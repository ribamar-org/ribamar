
![Ribamar](https://i.imgur.com/MNzMeoO.png)

Ribamar is an open source RESTful micro-service for managing user accounts, authentication, and authorization. Send confirmation e-mails; manage groups; store general user data etc...

- [Check the full docs](https://ribamar-org.gitlab.io/ribamar)
- [Docker Container](https://hub.docker.com/r/ribamarorg/ribamar/)
- [NPM Package](https://www.npmjs.com/package/ribamar)

## Quick Start
1. Ribamar requires the installation of [NodeJS](https://nodejs.org/en/download/current/) and [MongoDB Community Server](https://www.mongodb.com/download-center#community) to properly work.
2. Once Node is up, install Ribamar globally with: `npm i -g ribamar`.
3. Once MongoDB is up, start Ribamar Server with: `ribamar`.
4. In your browser, hit `http://localhost:6776`.
5. You have successfully started quickly!

## Or Start With Docker
Check the following list:
- Pull the container with `docker pull ribamarorg/ribamar`.
- There must be a running MongoDB instance (possibly in a container too).
- Ribamar container must be able to reach the database.
- Ribamar container will read a [configuration file](https://ribamar-org.gitlab.io/ribamar/settings/) if mounted in `/usr/src/ribamar/conf.yml`.

The following files may help you to `docker-compose up -d ribamar`:

```yml
# conf.yml
database:
  url: mongodb://database:27017
```

```yml
# docker-compose.yml
version: '3.7'
services:
  app:
    image: ribamarorg/ribamar
    ports:
      - "6776:6776"
    volumes:
      - "./conf.yml:/usr/src/ribamar/conf.yml"
    depends_on:
      - database
  database:
    image: mongo
```

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
