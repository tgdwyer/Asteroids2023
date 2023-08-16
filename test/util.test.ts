import { describe, expect, it } from 'vitest';
import { Vec, RNG } from '../src/util';

describe('Vec', () => {

  it('adds vectors correctly', () => {
    const v1 = new Vec(1, 2);
    const v2 = new Vec(2, 3);
    const result = v1.add(v2);
    expect(result.x).toBe(3);
    expect(result.y).toBe(5);
  });

  it('subtracts vectors correctly', () => {
    const v1 = new Vec(4, 6);
    const v2 = new Vec(1, 2);
    const result = v1.sub(v2);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });

  it('calculates length correctly', () => {
    const v1 = new Vec(3, 4);
    const result = v1.len();
    expect(result).toBe(5);  // sqrt(3^2 + 4^2)
  });

  it('scales vector correctly', () => {
    const v1 = new Vec(1, 2);
    const s = 2;
    const result = v1.scale(s);
    expect(result.x).toBe(2);
    expect(result.y).toBe(4);
  });

  it('calculates orthogonal vector correctly', () => {
    const v1 = new Vec(1, 2);
    const result = v1.ortho();
    expect(result.x).toBe(2);
    expect(result.y).toBe(-1);
  });

  it('rotates vector correctly', () => {
    const v1 = new Vec(1, 0);
    const result = v1.rotate(90);  // Rotate vector by 90 degrees counter-clockwise
    expect(Math.round(result.x)).toBeCloseTo(0);  // Due to floating point precision
    expect(Math.round(result.y)).toBeCloseTo(1);  // Due to floating point precision
  });

  it('creates unit vector in specified direction', () => {
    const e = [[0,-1],[1,0],[0,1],[-1,0]];
    [0,90,180,270].map(Vec.unitVecInDirection)
       .forEach((r,i)=>{
          const [ex,ey] = e[i];
          expect(r.x).toBeCloseTo(ex);
          expect(r.y).toBeCloseTo(ey);
    })
  });

  it('provides zero vector correctly', () => {
    const zeroVec = Vec.Zero;
    expect(zeroVec.x).toBe(0);
    expect(zeroVec.y).toBe(0);
  });
});

describe('RNG', ()=>{
  it('stream', function() {
    // take 10 numbers in the sequence.
    // assert they are all in the range [-1,1] and that they are all different
    const {a} = Array(10).fill(null).reduce(s=>({h:RNG.hash(s.h),a:[...s.a,RNG.scale(s.h)]}),{a:[],h:123})
    const allUnique = arr => arr.length === new Set(arr).size;
    expect(allUnique(a)).true
    a.forEach(r=>{
      expect(r).toBeLessThanOrEqual(1);
      expect(r).toBeGreaterThanOrEqual(-1);
    })
    expect(allUnique(a)).true
  })
})