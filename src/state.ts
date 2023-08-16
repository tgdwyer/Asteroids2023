// Functions and definitions of game state objects and state management.
// The only exports are the `initialState` object and the function `reduceState`.
export { initialState, reduceState }

// Game state is modelled in one main object of type State, which contains collections of the game elements, each
// of which has type Body, each being a "body" participating in our simple physics system.

import { ViewType, ObjectId, Circle, Body, Constants, State, Rotate, Shoot, Tick, Thrust } from "./types"
import { Vec, except, not } from "./util"

// Rocks and Bullets are both just Circles, and a Circle is a Body which participates in our physics system
const createCircle = (viewType: ViewType) => (oid: ObjectId) => (circ: Circle) => (vel: Vec): Body => ({
    ...oid,
    ...circ,
    vel: vel,
    acc: Vec.Zero,
    angle: 0, rotation: 0, torque: 0,
    id: viewType + oid.id,
    viewType: viewType
})
const createRock = createCircle('rock')
const createBullet = createCircle('bullet')

/**
 * A ship is also a Body which participates in our physics system
 * @returns 
 */
function createShip(): Body {
    return {
        id: 'ship',
        viewType: 'ship',
        pos: new Vec(Constants.CanvasSize / 2, Constants.CanvasSize / 2),
        vel: Vec.Zero,
        acc: Vec.Zero,
        angle: 0,
        rotation: 0,
        torque: 0,
        radius: 20,
        createTime: 0
    }
}


/////////////// INITIAL STATE ////////////////////
const
    // note: Math.random() is impure and non-deterministic (by design) it takes its seed from external state.
    // if we wanted to use randomness inside the Observable streams below, it would be better to create a
    // pseudo-random number sequence Observable that we have complete control over.
    initialRocksDirections = [...Array(Constants.StartRocksCount)]
        .map(() => new Vec(0.5 - Math.random(), 0.5 - Math.random())),

    startRocks = [...Array(Constants.StartRocksCount)]
        .map((_, i) => createRock({ id: String(i), createTime: Constants.StartTime })
            ({ pos: Vec.Zero, radius: Constants.StartRockRadius })
            (initialRocksDirections[i])),

    initialState: State = {
        time: 0,
        ship: createShip(),
        bullets: [],
        rocks: startRocks,
        exit: [],
        objCount: Constants.StartRocksCount,
        gameOver: false
    };

//////////////// STATE UPDATES //////////////////////
const
    /**
     * wrap a positions around edges of the screen as determined by Constants.CanvasSize
     * @param delta Vec
     */
    torusWrap = ({ x, y }: Vec) => {
        const s = Constants.CanvasSize,
            wrap = (v: number) => v < 0 ? v + s : v > s ? v - s : v;
        return new Vec(wrap(x), wrap(y))
    },

    /** 
     * all movement comes through this function
     * @param o a Body to move
     * @returns the moved Body
     */
    moveBody = (o: Body): Body => ({
        ...o,
        rotation: o.rotation + o.torque,
        angle: o.angle + o.rotation,
        pos: torusWrap(o.pos.add(o.vel)),
        vel: o.vel.add(o.acc)
    }),

    /** 
     * check a State for collisions:
     * bullets destroy rocks spawning smaller ones
     * ship colliding with rock ends game
     * @param s Game State
     * @returns a new State
     */
    handleCollisions = (s: State): State => {
        const
            bodiesCollided = ([a, b]: [Body, Body]) => a.pos.sub(b.pos).len() < a.radius + b.radius,
            shipCollided = s.rocks.filter(r => bodiesCollided([s.ship, r])).length > 0,
            allBulletsAndRocks = s.bullets.flatMap(b => s.rocks.map<[Body, Body]>(r => ([b, r]))),
            collidedBulletsAndRocks = allBulletsAndRocks.filter(bodiesCollided),
            collidedBullets = collidedBulletsAndRocks.map(([bullet, _]) => bullet),
            collidedRocks = collidedBulletsAndRocks.map(([_, rock]) => rock),

            // spawn two children for each collided rock above a certain size
            child = (r: Body, dir: number) => ({
                radius: r.radius / 2,
                pos: r.pos,
                vel: r.vel.ortho().scale(dir)
            }),
            spawnChildren = (r: Body) =>
                r.radius >= Constants.StartRockRadius / 4
                    ? [child(r, 1), child(r, -1)] : [],
            newRocks = collidedRocks.flatMap(spawnChildren)
                .map((r, i) => createRock({ id: String(s.objCount + i), createTime: s.time })
                    ({ pos: r.pos, radius: r.radius })(r.vel)),
            cut = except((a: Body) => (b: Body) => a.id === b.id)

        return {
            ...s,
            bullets: cut(s.bullets)(collidedBullets),
            rocks: cut(s.rocks)(collidedRocks).concat(newRocks),
            exit: s.exit.concat(collidedBullets, collidedRocks),
            objCount: s.objCount + newRocks.length,
            gameOver: shipCollided
        }
    },

    /** 
     * interval tick: bodies move, bullets expire
     * @param s old State
     * @param tick object with elapsed time
     * @returns new State
     */
    tick = (s: State, t: Tick): State => {
        const
            expired = (b: Body) => (t.elapsed - b.createTime) > 100,
            expiredBullets: Body[] = s.bullets.filter(expired),
            activeBullets = s.bullets.filter(not(expired));
        return handleCollisions({
            ...s,
            ship: moveBody(s.ship),
            bullets: activeBullets.map(moveBody),
            rocks: s.rocks.map(moveBody),
            exit: expiredBullets,
            time: t.elapsed
        })
    },

    /**
     * state transducer
     * @param s input State
     * @param action type of action to apply to the State
     * @returns a new State 
     */
    reduceState = (s: State, action: Rotate | Thrust | Shoot | Tick) =>
        action instanceof Rotate ? {
            ...s,
            ship: { ...s.ship, torque: action.direction }
        }
        : action instanceof Thrust ? {
            ...s,
            ship: { ...s.ship, acc: action.on ? Vec.unitVecInDirection(s.ship.angle).scale(Constants.ThrustAcc) : Vec.Zero }
        }
        : action instanceof Shoot ? {
            ...s,
            bullets: s.bullets.concat([
                ((unitVec: Vec) =>
                    createBullet({ id: String(s.objCount), createTime: s.time })
                        ({ radius: Constants.BulletRadius, pos: s.ship.pos.add(unitVec.scale(s.ship.radius)) })
                        (s.ship.vel.add(unitVec.scale(Constants.BulletVelocity)))
                )(Vec.unitVecInDirection(s.ship.angle))]),
            objCount: s.objCount + 1
        }
        : tick(s, action);
