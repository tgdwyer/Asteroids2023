/**
# Introduction
[See full documentation](https://tgdwyer.github.io/asteroids/)

Observables allow us to capture asynchronous actions like user interface events in streams.  These allow us to "linearise" the flow of control, avoid deeply nested loops, and process the stream with pure, referentially transparent functions.

As an example we will build a little "Asteroids" game using Observables.  We're going to use [rxjs](https://rxjs-dev.firebaseapp.com/) as our Observable implementation, and we are going to render it in HTML using SVG.
We're also going to take some pains to make pure functional code (and lots of beautiful curried lambda (arrow) functions). We'll use [typescript type annotations](https://www.typescriptlang.org/) to help us ensure that our data is indeed immutable and to guide us in plugging everything together without type errors.
 */
import { fromEvent, interval, Subscription, Observable, merge } from 'rxjs';
import { map, filter, scan } from 'rxjs/operators';
import { Key, Event, Action, State } from './types'
import { Tick, Rotate, Thrust, Shoot, reduceState, initialState } from './state';
import { updateView } from './view';

/////////////////////////////////////////////////////////////////
//
// Exercise 1:
// Implement the missing main game Observable stream.  See comment below.
// 
// Exercise 2:
// Keep track of the score: starting score = 0, 1 pt for each bullet that hits an asteroid.
// Show the score in the "score" element by setting its innerHTML property.
// You'll need to:
//  - add a score property to the game State in state.ts
//  - update the score html element in view.ts
// 
// Exercise 3:
// Add a Teleport action triggered by the 'Enter' key.
// Have the ship jump 200 pixels in the direction it is travelling on Teleport.
// You'll need to:
//  - add new Action and input Key types in types.ts
//  - handle the action in state.ts
// 
// Exercise 4:
// Use RNG (import from util.ts) to create a stream of random numbers.
// Integrate the RNG stream with the Teleport action
// so that the ship teleports to any location on the canvas.
//
// Further work (would be necessary for HD in assignment):
//  - have the levels reset and get harder when asteroids are cleared
//  - restart on "Space" rather than reload to play again
////////////////////////////////////////////////////////////////////

/**
 * Main game function.  Initialises all Observable streams.
 */
function asteroids() {
  const
    tick$ = interval(10)
      .pipe(map(elapsed => new Tick(elapsed))),

    key$ = (e: Event, k: Key) =>
      fromEvent<KeyboardEvent>(document, e)
        .pipe(
          filter(({ code }) => code === k),
          filter(({ repeat }) => !repeat)),

    startLeftRotate$ = key$('keydown', 'ArrowLeft').pipe(map(_ => new Rotate(-.1))),
    startRightRotate$ = key$('keydown', 'ArrowRight').pipe(map(_ => new Rotate(.1))),
    stopLeftRotate$ = key$('keyup', 'ArrowLeft').pipe(map(_ => new Rotate(0))),
    stopRightRotate$ = key$('keyup', 'ArrowRight').pipe(map(_ => new Rotate(0))),
    startThrust$ = key$('keydown', 'ArrowUp').pipe(map(_ => new Thrust(true))),
    stopThrust$ = key$('keyup', 'ArrowUp').pipe(map(_ => new Thrust(false))),
    shoot$ = key$('keydown', 'Space').pipe(map(_ => new Shoot()))

  /**
   * Exercise 1: Implement the main game stream pipeline - add imports above as necessary.
   * We have the following incoming Action streams: tick$, startLeftRotate$, startRightRotate$, stopLeftRotate$, stopRightRotate$, startThrust$, stopThrust$, shoot$.
   * We need to do something with initialState and reduceState (see state.ts), 
   * and then finally we'll somewhere need to call our effectful updateView function
   */
  const action$: Observable<Action> = merge(tick$, startLeftRotate$, stopLeftRotate$, startRightRotate$, stopRightRotate$, startThrust$, stopThrust$, shoot$);
  const state$: Observable<State> = action$.pipe(scan(reduceState, initialState));
  const subscription: Subscription = state$.subscribe(updateView(()=>subscription.unsubscribe()));
}

/**
 * Display key mapping with live highlighting of the currently depressed key
 */
function showKeys() {
  function showKey(k: Key) {
    const arrowKey = document.getElementById(k)
    // getElement might be null, in this case return without doing anything
    if (!arrowKey) return
    const o = (e: Event) => fromEvent<KeyboardEvent>(document, e).pipe(
      filter(({ code }) => code === k))
    o('keydown').subscribe(e => arrowKey.classList.add("highlight"))
    o('keyup').subscribe(_ => arrowKey.classList.remove("highlight"))
  }
  showKey('ArrowLeft');
  showKey('ArrowRight');
  showKey('ArrowUp');
  showKey('Space');
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = function () {
    asteroids();
    showKeys();
  };
}