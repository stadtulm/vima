module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'vue/multi-word-component-names': 'off',
    'no-empty': 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    'vue/no-deprecated-v-bind-sync': 'off',
    'vue/no-v-for-template-key-on-child': 'off',
    'vue/no-deprecated-v-on-native-modifier': 'off'
  }
}
