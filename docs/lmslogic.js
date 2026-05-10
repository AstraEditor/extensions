// Name: Logic Operations
// ID: lmslogic
// Description: Provides various logic gates, boolean operations, and bitwise operations.
// By: fhy-action  <https://github.com/fhy-action>
// License: CC BY-NC-SA 4.0

(function() {
  'use strict';

  class LogicOps {
    getInfo() {
      return {
        id: 'lmslogic',
        name: 'Logic Operations',
        color1: '#332C2B',
        color2: '#4A403F',
        color3: '#1F1A19',
        blocks: [
          {
            opcode: 'trueConst',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '真（true）',
            arguments: {}
          },
          {
            opcode: 'falseConst',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '假（false）',
            arguments: {}
          },
          {
            opcode: 'and',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[A] 与 [B]（and）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN },
              B: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'or',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[A] 或 [B]（or）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN },
              B: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'not',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '非 [A]（not）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'xor',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[A] 异或 [B]（xor）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN },
              B: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'xnor',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[A] 同或 [B]（xnor）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN },
              B: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'nand',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[A] 与非 [B]（nand）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN },
              B: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'nor',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[A] 或非 [B]（nor）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN },
              B: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'implies',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[A] → [B]（implies）',
            arguments: {
              A: { type: Scratch.ArgumentType.BOOLEAN },
              B: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'bitwiseAnd',
            blockType: Scratch.BlockType.REPORTER,
            text: '[A] 按位与 [B]（&）',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: 'bitwiseOr',
            blockType: Scratch.BlockType.REPORTER,
            text: '[A] 按位或 [B]（|）',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: 'bitwiseXor',
            blockType: Scratch.BlockType.REPORTER,
            text: '[A] 按位异或 [B]（^）',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: 'bitwiseNot',
            blockType: Scratch.BlockType.REPORTER,
            text: '按位非 [A]（~）',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          {
            opcode: 'leftShift',
            blockType: Scratch.BlockType.REPORTER,
            text: '[A] 左移 [B]（<<）',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'rightShift',
            blockType: Scratch.BlockType.REPORTER,
            text: '[A] 右移 [B]（>>）',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'unsignedRightShift',
            blockType: Scratch.BlockType.REPORTER,
            text: '[A] 无符号右移 [B]（>>>）',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: -8 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'boolToNum',
            blockType: Scratch.BlockType.REPORTER,
            text: '布尔值 [BOOL] 转数字（to number）',
            arguments: {
              BOOL: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },
          {
            opcode: 'numToBool',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '数字 [NUM] 转布尔值（to boolean）',
            arguments: {
              NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'ifElse',
            blockType: Scratch.BlockType.REPORTER,
            text: '如果 [COND] 则 [TRUE] 否则 [FALSE]（if else）',
            arguments: {
              COND: { type: Scratch.ArgumentType.BOOLEAN },
              TRUE: { type: Scratch.ArgumentType.ANY },
              FALSE: { type: Scratch.ArgumentType.ANY }
            }
          }
        ],
        menus: {}
      };
    }

    trueConst() { return true; }
    falseConst() { return false; }

    and(args) { return args.A && args.B; }
    or(args) { return args.A || args.B; }
    not(args) { return !args.A; }
    xor(args) { return (args.A && !args.B) || (!args.A && args.B); }
    xnor(args) { return args.A === args.B; }
    nand(args) { return !(args.A && args.B); }
    nor(args) { return !(args.A || args.B); }
    implies(args) { return !args.A || args.B; }

    bitwiseAnd(args) { return Number(args.A) & Number(args.B); }
    bitwiseOr(args) { return Number(args.A) | Number(args.B); }
    bitwiseXor(args) { return Number(args.A) ^ Number(args.B); }
    bitwiseNot(args) { return ~Number(args.A); }
    leftShift(args) { return Number(args.A) << Number(args.B); }
    rightShift(args) { return Number(args.A) >> Number(args.B); }
    unsignedRightShift(args) { return Number(args.A) >>> Number(args.B); }

    boolToNum(args) { return args.BOOL ? 1 : 0; }
    numToBool(args) { return Number(args.NUM) !== 0; }

    ifElse(args) { return args.COND ? args.TRUE : args.FALSE; }
  }

  Scratch.extensions.register(new LogicOps());
})();