module.exports = {
  root: true,
  extends: ['expo', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      { semi: false, singleQuote: true, trailingComma: 'es5', printWidth: 100 },
    ],
    semi: ['error', 'never'],
  },
}
