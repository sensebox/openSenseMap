module.exports = {
  env: {
    browser: true
  },
  globals: {
    "angular": 1,
    "L": 1,
    "moment": 1,
    "Promise": 1,
  },
  extends: [
    '@sensebox/eslint-config-sensebox',
    'plugin:angular/johnpapa'
  ],
  rules: {
    "angular/file-name": 0,
    "no-var": 0,
    "prefer-template": 0,
    "func-style": 0,
    "angular/function-type": 0,
    "wrap-iife": 0,
    "strict": ['error', 'function'],
    "no-console": 1,
    "no-warning-comments": 1
  }
};
