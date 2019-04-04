# studystates-server : Express using typescript

## Server

| `NODE_ENV`  | SERVER                                                           | CLIENT                                                   | `REACT_APP_` |
| ----------- | ---------------------------------------------------------------- | -------------------------------------------------------- | ------------ |
| local       | http://localhost:5000                                            | http://localhost:3000                                    |              |
| development | [http://api-dev.studystates.net](http://api-dev.studystates.net) | [http://dev.studystates.net](http://dev.studystates.net) |              |


## Status

- dev branch : CircleCI [![CircleCI](https://circleci.com/gh/codestates/studystates-server/tree/dev.svg?style=svg&circle-token=e988f2482f1313e0473c65b8d610463eb55f5ea9)](https://circleci.com/gh/codestates/studystates-server/tree/dev)
- master branch : manual

## TL;DR

#### 초기 Package 설치 (주의 !!)

```bash
npm install
```

https://github.com/codestates/studystates-server/wiki/%5BISSUE%5D-TypeScript-Node-Starter-%EC%B4%88%EA%B8%B0-%EC%84%A4%EC%A0%95

초기 package 설치 시에 `yarn` 이 아니라 `npm`으로 할 것.

```bash
npm install
```

#### Launch Server 

```bash
yarn build
yarn start   // yarn local과 동일
```

#### 로컬에서 서버 개발 시 

```bash
yarn watch
```

#### `dev:cd` 서버에서 서버 실행 시 

```bash
yarn development
//
pm2 start npm --name "studystates-server" -- run development
```


## Code base

[Microsoft/TypeScript-Node-Starter: A starter template for TypeScript and Node with a detailed README describing how to use the two together.](https://github.com/Microsoft/TypeScript-Node-Starter)
