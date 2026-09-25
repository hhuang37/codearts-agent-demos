module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    'wx-miniprogram': true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'off',
    'no-debugger': 'warn',
    'prefer-const': 'warn',
  },
  ignorePatterns: [
    'miniprogram_npm/**',
    'node_modules/**',
    'cloudfunctions/**/node_modules/**',
  ],
};