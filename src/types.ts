// Common Asteroids type definitions
export { Constants }
export type { Circle, ObjectId, Body, State, ViewType, Key, Event, Action }

import { Vec } from './util'

const
  Constants = {
    CanvasSize: 600,
    BulletExpirationTime: 5000,
    BulletRadius: 3,
    BulletVelocity: 2,
    StartRockRadius: 30,
    StartRocksCount: 5,
    RotationAcc: 0.1,
    ThrustAcc: 0.1,
    StartTime: 0
  } as const

/**
 * a string literal type for each key used in game control
 */
type Key = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'Space'

/**
 * only input events are keydown and up
 */
type Event = 'keydown' | 'keyup'

/**
 * our game has the following view element types
 */
type ViewType = 'ship' | 'rock' | 'bullet'

type Circle = Readonly<{ pos: Vec, radius: number }>

/**
 * ObjectIds help us identify objects and manage objects which timeout (such as bullets)
 */
type ObjectId = Readonly<{ id: string, createTime: number }>

/**
 * Every object that participates in physics is a Body
 */
type Body = Circle & ObjectId & Readonly<{
  viewType: ViewType,
  vel: Vec,
  acc: Vec,
  angle: number,
  rotation: number,
  torque: number
}>

/**
 * Game state
 */
type State = Readonly<{
  time: number,
  ship: Body,
  bullets: ReadonlyArray<Body>,
  rocks: ReadonlyArray<Body>,
  exit: ReadonlyArray<Body>,
  objCount: number,
  gameOver: boolean
}>

/**
 * Actions modify state
 */
interface Action {
  apply(s: State): State;
}
