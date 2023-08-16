// Utility functions and definitions.
// Nothing here is specific to asteroids.
// Everything is designed to be as reusable as possible in many different contexts.
export { Vec, flatMap, not, elem, except, attr, isNotNullOrUndefined, RNG, IMPLEMENT_THIS }
export type { IMPLEMENT_THIS_TYPE }

/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 */
abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;

    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed 
     * @returns a hash of the seed
     */
    public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

    /**
 h    * Takes hash value and scales it to the range [-1, 1]
     */
    public static scale = (hash: number) => (2 * hash) / (RNG.m - 1) - 1;
}

/**
 * A simple immutable vector class
 */
class Vec {
    constructor(public readonly x: number = 0, public readonly y: number = 0) { }
    add = (b: Vec) => new Vec(this.x + b.x, this.y + b.y)
    sub = (b: Vec) => this.add(b.scale(-1))
    len = () => Math.sqrt(this.x * this.x + this.y * this.y)
    scale = (s: number) => new Vec(this.x * s, this.y * s)
    ortho = () => new Vec(this.y, -this.x)
    rotate = (deg: number) =>
        (rad => (
            (cos, sin, { x, y }) => new Vec(x * cos - y * sin, x * sin + y * cos)
        )(Math.cos(rad), Math.sin(rad), this)
        )(Math.PI * deg / 180)

    static unitVecInDirection = (deg: number) => new Vec(0, -1).rotate(deg)
    static Zero = new Vec();
}

/**
 * apply f to every element of a and return the result in a flat array
 * @param a an array
 * @param f a function that produces an array
 */
function flatMap<T, U>(
    a: ReadonlyArray<T>,
    f: (a: T) => ReadonlyArray<U>
): ReadonlyArray<U> {
    return Array.prototype.concat(...a.map(f));
}

const
    /**
     * Composable not: invert boolean result of given function
     * @param f a function returning boolean
     * @param x the value that will be tested with f
     */
    not = <T>(f: (x: T) => boolean) => (x: T) => !f(x),
    /**
     * is e an element of a using the eq function to test equality?
     * @param eq equality test function for two Ts
     * @param a an array that will be searched
     * @param e an element to search a for
     */
    elem =
        <T>(eq: (_: T) => (_: T) => boolean) =>
            (a: ReadonlyArray<T>) =>
                (e: T) => a.findIndex(eq(e)) >= 0,
    /**
     * array a except anything in b
     * @param eq equality test function for two Ts
     * @param a array to be filtered
     * @param b array of elements to be filtered out of a
     */
    except =
        <T>(eq: (_: T) => (_: T) => boolean) =>
            (a: ReadonlyArray<T>) =>
                (b: ReadonlyArray<T>) => a.filter(not(elem(eq)(b))),
    /**
     * set a number of attributes on an Element at once
     * @param e the Element
     * @param o a property bag
     */
    attr = (e: Element, o: { [p: string]: unknown }) => { for (const k in o) e.setAttribute(k, String(o[k])) }
/**
 * Type guard for use in filters
 * @param input something that might be null or undefined
 */
function isNotNullOrUndefined<T extends object>(input: null | undefined | T): input is T {
    return input != null;
}

/**
 * used in exercises only!
 */
type IMPLEMENT_THIS_TYPE = any;
const IMPLEMENT_THIS: IMPLEMENT_THIS_TYPE = undefined;
