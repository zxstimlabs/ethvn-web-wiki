/**
 * Isometric projection helpers for the home hero scene.
 *
 * Objects are positioned by a ground anchor given in screen space, then drawn
 * as world-space boxes around it with the standard 30° isometric projection:
 *   sx = ax + (x − y)·cos30°,   sy = ay + (x + y)·½ − z
 * Because the projection is linear, moving a drawn object only needs a
 * screen-space translate, which is what the animation engine does.
 */

export const COS30 = Math.cos(Math.PI / 6);

export type Pt = readonly [number, number];

export interface BoxSpec {
  /** footprint along world x (faces screen right-down) */
  w: number;
  /** footprint along world y (faces screen left-down) */
  d: number;
  h: number;
  /** height of the box's base above the ground */
  z?: number;
}

export interface Faces {
  top: Pt[];
  left: Pt[];
  right: Pt[];
}

/** A face-local mapper: (u, v) in px on the face → screen point. */
export type FaceMap = (u: number, v: number) => Pt;

const round = (n: number) => Math.round(n * 100) / 100;

export function iso(ax: number, ay: number, x: number, y: number, z = 0): Pt {
  return [ax + (x - y) * COS30, ay + (x + y) * 0.5 - z];
}

export function toPoints(points: readonly Pt[]): string {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
}

export function toPath(points: readonly Pt[]): string {
  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`)
    .join(' ');
}

/** The three visible faces of a box centred on the ground anchor. */
export function boxFaces(ax: number, ay: number, { w, d, h, z = 0 }: BoxSpec): Faces {
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -d / 2;
  const y1 = d / 2;
  const z1 = z + h;
  const p = (x: number, y: number, zz: number) => iso(ax, ay, x, y, zz);
  return {
    top: [p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)],
    left: [p(x0, y1, z), p(x1, y1, z), p(x1, y1, z1), p(x0, y1, z1)],
    right: [p(x1, y0, z), p(x1, y1, z), p(x1, y1, z1), p(x1, y0, z1)],
  };
}

/** Left face (plane y = d/2). u runs from the left corner to the front corner, v runs up. */
export function leftFace(ax: number, ay: number, { w, d, z = 0 }: BoxSpec): FaceMap {
  return (u, v) => iso(ax, ay, -w / 2 + u, d / 2, z + v);
}

/** Right face (plane x = w/2). u runs from the front corner to the right corner, v runs up. */
export function rightFace(ax: number, ay: number, { w, d, z = 0 }: BoxSpec): FaceMap {
  return (u, v) => iso(ax, ay, w / 2, d / 2 - u, z + v);
}

/** Top face. u runs along world x, v along world y (back → front). */
export function topFace(ax: number, ay: number, { w, d, h, z = 0 }: BoxSpec): FaceMap {
  return (u, v) => iso(ax, ay, -w / 2 + u, -d / 2 + v, z + h);
}

/**
 * SVG transform that lays text flat on a box's left face, with its baseline
 * at face-local (u, v). Use with text-anchor to position along the face.
 */
export function leftFaceText(ax: number, ay: number, spec: BoxSpec, u: number, v: number): string {
  const [x, y] = leftFace(ax, ay, spec)(u, v);
  return `matrix(${COS30.toFixed(4)} 0.5 0 1 ${round(x)} ${round(y)})`;
}

/** A rectangle in face-local coordinates, as a screen polygon. */
export function rectOn(face: FaceMap, u: number, v: number, w: number, h: number): Pt[] {
  return [face(u, v), face(u + w, v), face(u + w, v + h), face(u, v + h)];
}

/** The visible edges of a box as one path (silhouette + the three edges meeting at the front-top corner). */
export function boxEdges(ax: number, ay: number, { w, d, h, z = 0 }: BoxSpec): string {
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -d / 2;
  const y1 = d / 2;
  const z1 = z + h;
  const p = (x: number, y: number, zz: number) => iso(ax, ay, x, y, zz);
  const outline = toPath([
    p(x0, y1, z),
    p(x1, y1, z),
    p(x1, y0, z),
    p(x1, y0, z1),
    p(x0, y0, z1),
    p(x0, y1, z1),
    p(x0, y1, z),
  ]);
  const corner = p(x1, y1, z1);
  const inner = [p(x0, y1, z1), p(x1, y0, z1), p(x1, y1, z)]
    .map((q) => toPath([corner, q]))
    .join(' ');
  return `${outline} ${inner}`;
}

/** Footprint polygon shifted on the ground, used as a soft drop shadow. */
export function shadow(ax: number, ay: number, { w, d }: BoxSpec, dx = 5, dy = 3): string {
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -d / 2;
  const y1 = d / 2;
  return toPoints(
    [iso(ax, ay, x0, y0), iso(ax, ay, x1, y0), iso(ax, ay, x1, y1), iso(ax, ay, x0, y1)].map(
      ([x, y]) => [x + dx, y + dy] as const,
    ),
  );
}
