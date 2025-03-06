import type { Config } from 'jest';

const config: Config = {
    // Use ts-jest to transform TypeScript files
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',  // Use ts-jest for TypeScript files
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],  // Specify file extensions Jest should recognize
    globals: {
        'ts-jest': {
            useESM: true,  // Enable ESM support in ts-jest (if using ES modules)
        },
    },
    testEnvironment: 'node',  // Use Node environment for testing
};

export default config;
