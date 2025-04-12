module.exports = {
  root: true,
  extends: ['expo', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', { semi: false }],
    semi: ['error', 'never'],
  },
}
