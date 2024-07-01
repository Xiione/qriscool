import type { Version } from "jsqr-es6/dist/decoder/version";
import type { Point } from "jsqr-es6/dist/locator";
import { buildFunctionPatternMask } from "jsqr-es6/dist/decoder/decoder";

const dy = [+1, -1, +0, +0];
const dx = [+0, +0, -1, +1];
const endpointOffsets = [[[-1, 0], [1, 0]], [[0, -1], [0, 1]]];

export interface ModuleMask {
  version: Version;
  mask: number[][];
  groups: Point[][];
  codewordStartId: number;
}

function setMaskRegion(
  mask: number[][],
  left: number,
  top: number,
  width: number,
  height: number,
  v: number,
  filter: (x: number, y: number) => boolean = () => true,
): Point[] {
  const modules: Point[] = [];
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) {
      if (filter(x, y)) {
        mask[y][x] = v;
        modules.push({ x, y });
      }
    }
  }
  return modules;
}

export function buildGroupOutline(
  mask: number[][],
  modules: Point[],
  scale: number,
) {
  const path = new Path2D();
  const n = mask.length;

  const k = mask[modules[0].y][modules[0].x];
  for (const { x, y } of modules) {
    for (let d = 0; d < 4; d++) {
      const y_nei = y + dy[d];
      const x_nei = x + dx[d];

      if (
        y_nei < 0 ||
        y_nei >= n ||
        x_nei < 0 ||
        x_nei >= n ||
        mask[y_nei][x_nei] !== k
      ) {
        // prettier-ignore
        const [s, e] = [
            [{x, y: y + 1}, {x: x + 1, y: y + 1}],
            [{x, y}, {x: x + 1, y}],
            [{x, y}, {x, y: y + 1}],
            [{x: x + 1, y}, {x: x + 1, y: y + 1}],
          ][d];

        // slight offset to make strokes draw fully inside groups
        // const [xO, yO] = [
        //   [0, +0.5],
        //   [0, -0.5],
        //   [+0.5, 0],
        //   [-0.5, 0],
        // ][d];
        // slight lengthening to fill corners
        const [[xOs, yOs], [xOe, yOe]] = endpointOffsets[Math.trunc(d / 2)];

        // path.moveTo(s.x * scale, s.y * scale);
        // path.lineTo(e.x * scale, e.y * scale);
        path.moveTo(s.x * scale + xOs, s.y * scale + yOs);
        path.lineTo(e.x * scale + xOe, e.y * scale + yOe);
      }
    }
  }
  return path;
}

// adapted from jsQR decoder's buildFunctionPatternMask and readCodewords
export function buildCodewordMask(version: Version): ModuleMask {
  const dimension = 17 + 4 * version.versionNumber;
  const mask: number[][] = Array.from(Array(dimension), () =>
    new Array(dimension).fill(9),
  );

  // TODO better system
  // function pattern mask
  let id = 0;
  const groups: Point[][] = [];
  groups.push(setMaskRegion(mask, 0, 0, 7, 7, id++)); // Top left finder pattern
  groups.push([
    ...setMaskRegion(mask, 0, 8, 9, 1, id, (x, y) => x !== 6), // Format horiz
    ...setMaskRegion(mask, 8, 0, 1, 8, id++, (x, y) => y !== 6), // Format vert
  ]);

  groups.push(setMaskRegion(mask, dimension - 7, 0, 7, 7, id++)); // Top right finder pattern
  groups.push(setMaskRegion(mask, dimension - 8, 8, 8, 1, id++)); // Format

  groups.push(setMaskRegion(mask, 0, dimension - 7, 7, 7, id++)); // Bottom left finder pattern
  groups.push(setMaskRegion(mask, 8, dimension - 8, 1, 8, id++)); // Format

  // Alignment patterns
  for (const x of version.alignmentPatternCenters) {
    for (const y of version.alignmentPatternCenters) {
      if (
        !(
          (x === 6 && y === 6) ||
          (x === 6 && y === dimension - 7) ||
          (x === dimension - 7 && y === 6)
        )
      ) {
        groups.push(setMaskRegion(mask, x - 2, y - 2, 5, 5, id++));
      }
    }
  }

  groups.push(
    setMaskRegion(mask, 6, 8, 1, dimension - 16, id++, (x, y) => {
      if (6 - y < 3 || y - (dimension - 7) < 3) {
        return true;
      }
      for (const c of version.alignmentPatternCenters) {
        if (Math.abs(y - c) < 3) {
          return false;
        }
      }
      return true;
    }),
  ); // Vertical timing pattern

  groups.push(
    setMaskRegion(mask, 8, 6, dimension - 16, 1, id++, (x, y) => {
      if (6 - x < 3 || x - (dimension - 7) < 3) {
        return true;
      }
      for (const c of version.alignmentPatternCenters) {
        if (Math.abs(x - c) < 3) {
          return false;
        }
      }
      return true;
    }),
  ); // Horizontal timing pattern

  if (version.versionNumber > 6) {
    groups.push(setMaskRegion(mask, dimension - 11, 0, 3, 6, id++)); // Version info, top right
    groups.push(setMaskRegion(mask, 0, dimension - 11, 6, 3, id++)); // Version info, bottom left
  }

  // codeword chunks
  // Read columns in pairs, from right to left
  const codewordStartId = id;

  let readingUp = true;
  let bitsRead = 0;
  let currentByte: Point[] = [];
  const functionPatternMask = buildFunctionPatternMask(version);
  for (let columnIndex = dimension - 1; columnIndex > 0; columnIndex -= 2) {
    if (columnIndex === 6) {
      // Skip whole column with vertical alignment pattern;
      columnIndex--;
    }
    for (let i = 0; i < dimension; i++) {
      const y = readingUp ? dimension - 1 - i : i;
      for (let columnOffset = 0; columnOffset < 2; columnOffset++) {
        const x = columnIndex - columnOffset;
        if (!functionPatternMask.get(x, y)) {
          bitsRead++;
          mask[y][x] = id;
          currentByte.push({ x, y });
          if (bitsRead === 8) {
            bitsRead = 0;
            groups.push(currentByte);
            currentByte = [];
            id++;
          }
        }
      }
    }
    readingUp = !readingUp;
  }

  return { version, mask, groups, codewordStartId };
}

export function buildBlockMask(
  codewordMask: ModuleMask,
  ecLevel: number,
): ModuleMask {
  const version = codewordMask.version;
  const dimension = 17 + 4 * version.versionNumber;
  const mask: number[][] = Array.from(Array(dimension), () =>
    new Array(dimension).fill(-1),
  );

  let wordNum = codewordMask.codewordStartId;
  const groups: Point[][] = [];

  const ecInfo = version.errorCorrectionLevels[ecLevel];

  for (const block of ecInfo.ecBlocks) {
    for (let i = 0; i < block.numBlocks; i++) {
      groups.push([]);
    }
  }

  const shortBlockSize = ecInfo.ecBlocks[0].dataCodewordsPerBlock;
  // Pull codewords to fill the blocks up to the minimum size
  for (let i = 0; i < shortBlockSize; i++) {
    groups.forEach((group, index) => {
      groups[index] = [...group, ...codewordMask.groups[wordNum++]];
    });
  }

  // If there are any large blocks, pull codewords to fill the last element of those
  if (ecInfo.ecBlocks.length > 1) {
    const smallBlockCount = ecInfo.ecBlocks[0].numBlocks;
    const largeBlockCount = ecInfo.ecBlocks[1].numBlocks;
    for (let i = 0; i < largeBlockCount; i++) {
      groups[smallBlockCount + i] = [
        ...groups[smallBlockCount + i],
        ...codewordMask.groups[wordNum++],
      ];
    }
  }

  // Add the rest of the codewords to the blocks. These are the error correction codewords.
  while (wordNum < codewordMask.groups.length) {
    groups.forEach((group, index) => {
      groups[index] = [...group, ...codewordMask.groups[wordNum++]];
    });
  }

  groups.forEach((group, index) => {
    for (const { x, y } of group) {
      mask[y][x] = index;
    }
  });

  return { version, mask, groups, codewordStartId: 0 };
}
