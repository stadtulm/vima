module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'standard'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'no-empty': 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    'vue/no-deprecated-v-bind-sync': 'off',
    'vue/no-v-for-template-key-on-child': 'off',
    'vue/no-deprecated-v-on-native-modifier': 'off'
  }
}
