module.exports = {
  'extends': 'eslint:recommended',
  'env': {
    'browser': true,
    'es6': true,
    'node': true
  },
  'plugins': [
    'react'
  ],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 6,
    'ecmaFeatures': {
      'jsx': true
    }
  },
  'globals': {
    '$': false,
    'localStorage': false,
    'toastr': false
  },
  'rules': {
    // react
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    // enable additional rules
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
  }
};
