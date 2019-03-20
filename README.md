# studystates-server : Express using typescript

## Status

- dev branch : CircleCI [![CircleCI](https://circleci.com/gh/codestates/studystates-server/tree/dev.svg?style=svg&circle-token=e988f2482f1313e0473c65b8d610463eb55f5ea9)](https://circleci.com/gh/codestates/studystates-server/tree/dev)
- master branch : manual

## TL;DR

- 초기 Package 설치

https://github.com/codestates/studystates-server/wiki/%5BISSUE%5D-TypeScript-Node-Starter-%EC%B4%88%EA%B8%B0-%EC%84%A4%EC%A0%95

초기 package 설치 시에 `yarn` 이 아니라 `npm`으로 할 것.

```bash
npm install
```

- MongoDb 관련

향후에는 MainDB 는 MySQL/Sequelize 이용 예정임.

```bash
# create the db directory
sudo mkdir -p /data/db

# give the db correct read/write permissions
sudo chmod 777 /data/db

# Start your mongoDB server (you'll probably want another command prompt)
mongod
```

- Start server (http://localhost:3000)

```bash
$ yarn start

yarn run v1.13.0
$ npm run serve
npm WARN lifecycle The node binary used for scripts is /var/folders/72/pt4nsrn54197_zl_44tk_kv00000gn/T/yarn--1552876887809-0.05246111479187232/node but npm is using /Users/tkhwang/.nvm/versions/node/v10.14.1/bin/node itself. Use the `--scripts-prepend-node-path` option to include the path for the node binary npm was executed with.

> express-typescript-starter@0.1.0 serve /Users/tkhwang/_tkhwang/_repo/github/_codestates/3_hir/study/studystates-server
> node dist/server.js

debug: Logging initialized at debug level
debug: Using .env.example file to supply config environment variables
  App is running at http://localhost:3000 in development mode
  Press CTRL-C to stop
```

## Code base

[Microsoft/TypeScript-Node-Starter: A starter template for TypeScript and Node with a detailed README describing how to use the two together.](https://github.com/Microsoft/TypeScript-Node-Starter)
