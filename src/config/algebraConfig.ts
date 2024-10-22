export const level1Config = {
  moves: 10,
  targetOutput: 25, // Default target output for level 1
  operations: [
    { id: 1, name: 'X^2', operation: (x: number) => Math.pow(x, 2) },
    { id: 2, name: 'X^X', operation: (x: number) => Math.pow(x, x) },
    { id: 3, name: 'X / 2', operation: (x: number) => x / 2 },
    { id: 4, name: '√X', operation: (x: number) => Math.sqrt(x) },
    { id: 5, name: 'X + 5', operation: (x: number) => x + 5 },
    { id: 6, name: 'X - 3', operation: (x: number) => x - 3 },
  ],
};

export const level2Config = {
  moves: 8,
  targetOutput: 16, // Default target output for level 2
  operations: [
    { id: 1, name: 'X^3', operation: (x: number) => Math.pow(x, 3) },
    { id: 2, name: 'X * 2', operation: (x: number) => x * 2 },
    { id: 3, name: 'X - 1', operation: (x: number) => x - 1 },
    { id: 4, name: 'X / 4', operation: (x: number) => x / 4 },
  ],
};

export const level3Config = {
  moves: 6,
  targetOutput: 81, // Default target output for level 3
  operations: [
    { id: 1, name: 'X * 3', operation: (x: number) => x * 3 },
    { id: 2, name: 'X - 5', operation: (x: number) => x - 5 },
    { id: 3, name: 'X / 3', operation: (x: number) => x / 3 },
    { id: 4, name: '√X', operation: (x: number) => Math.sqrt(x) },
  ],
};

export const level4Config = {
  moves: 5,
  targetOutput: 32, // Default target output for level 4
  operations: [
    { id: 1, name: 'X * 4', operation: (x: number) => x * 4 },
    { id: 2, name: 'X + 10', operation: (x: number) => x + 10 },
    { id: 3, name: 'X - 2', operation: (x: number) => x - 2 },
  ],
};

export const level5Config = {
  moves: 4,
  targetOutput: 100, // Default target output for level 5
  operations: [
    { id: 1, name: 'X * X', operation: (x: number) => x * x },
    { id: 2, name: 'X / 5', operation: (x: number) => x / 5 },
    { id: 3, name: 'X + 7', operation: (x: number) => x + 7 },
  ],
};
