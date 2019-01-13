[![Build Status](https://semaphoreci.com/api/v1/projects/101d46e8-3e3c-4c32-8949-a3758fcf9d01/2441692/badge.svg)](https://semaphoreci.com/vdom25d-devs/vdom25d)

# VDOM 2.5D

## Goal

Create a html5 game (even a framework ?) written in functional & reactive way (a lot of buzzwords, I know, sorry),
in opposition to the more imperative and traditionnal way of doing in the game industry.

Static typing rules and the browsers uses JS, so this project is written entirely with TS.

It use BabylonJS as the high-level graphic engine and MatterJS as the physics engine.
The first is 3D, the second is 2D making this a 2.5D game (hence the name of the project).

Inspiration comes from [CycleJS](https://cycle.js.org/getting-started.html) (for it use of reactive stream), [React-Three-Renderer](https://github.com/toxicFork/react-three-renderer) (goalwise) and [Deku](https://github.com/anthonyshort/deku/tree/master/src) (for the implementation details of the VDOM).

## API

TBD

## Get started

To install run :

```
yarn install
```

To play :

```
yarn start
```

To run test suites locally :

```
yarn test
```

## Contributing

CI is hosted at [Semaphore](https://semaphoreci.com/vdom25d-devs/vdom25d)

Run prettier before commiting (easiest way not to forget -> [VSCode + Prettier Plugin + Format On Save](https://scottsauber.com/2017/06/10/prettier-format-on-save-never-worry-about-formatting-javascript-again/))

If people join this project, we should try to use a Gitflow-like workflow (master/develop/feature/hotfix branches), and [Semantic Git Message](https://seesparkbox.com/foundry/semantic_commit_messages).
