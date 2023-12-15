module.exports = {
  plugins: [
    '@stylistic',
  ],
  extends: [
    'eslint:recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'commonjs',
  },
  overrides: [
    {
      files: ['test/**/*.mjs'],
      env: {
        node: true,
        es6: true,
      },
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
      plugins: [
        'ava',
        'import',
      ],
      extends: [
        'plugin:ava/recommended',
      ],
      rules: {
        // 'class-methods-use-this': 'off',
        'no-unused-vars': 'off',
        // 'func-names': 'off',
        // 'no-useless-constructor': 'off',
        // 'no-empty-function': 'off',
      },
    },
  ],
};
