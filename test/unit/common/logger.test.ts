import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock pino to control transport configuration
const pinoMock = jest.fn((config) => ({
  level: config.level,
  transport: config.transport,
}));

jest.mock('pino', () => pinoMock);

describe('Logger', () => {
  const originalEnv = process.env;
  const originalConsoleDebug = console.debug;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    pinoMock.mockClear();
    console.debug = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.debug = originalConsoleDebug;
    jest.clearAllMocks();
  });

  it('should use info level by default', () => {
    const logger = require('../../../src/common/logger').default;
    expect(logger.level).toBe('info');
  });

  it('should use custom level when AXAR_LOG_LEVEL is set', () => {
    process.env.AXAR_LOG_LEVEL = 'debug';
    const logger = require('../../../src/common/logger').default;
    expect(logger.level).toBe('debug');
  });

  describe('with pino-pretty available', () => {
    beforeEach(() => {
      // Mock successful require of pino-pretty
      jest.mock('pino-pretty', () => ({}));
    });

    it('should use pino-pretty transport in non-production', () => {
      process.env.NODE_ENV = 'development';
      const logger = require('../../../src/common/logger').default;
      expect(logger.transport).toEqual({
        target: 'pino-pretty',
        options: { colorize: true },
      });
    });

    it('should not use pino-pretty transport in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = require('../../../src/common/logger').default;
      expect(logger.transport).toBeUndefined();
    });
  });

  describe('without pino-pretty available', () => {
    beforeEach(() => {
      // Mock failed require of pino-pretty
      jest.doMock('pino-pretty', () => {
        throw new Error('Cannot find module "pino-pretty"');
      });
    });

    it('should fallback to default transport when pino-pretty is not available', () => {
      process.env.NODE_ENV = 'development';
      const logger = require('../../../src/common/logger').default;
      expect(logger.transport).toBeUndefined();
      expect(console.debug).toHaveBeenCalledWith(
        'pino-pretty not available, falling back to default transport',
      );
    });
  });
});
