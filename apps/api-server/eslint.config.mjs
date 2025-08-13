import antfu from '@antfu/eslint-config'

export default antfu(
  {
    languageOptions: {
      parserOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    },
    rules: {
      'no-console': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'warn',
      'style/arrow-parens': ['error', 'always'],
      'style/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
      'jsdoc/multiline-blocks': [
        'error',
        {
          noZeroLineText: false,
        },
      ],
      'perfectionist/sort-exports': [
        'warn',
        {
          partitionByNewLine: true,
        },
      ],
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      'style/eol-last': 'off',
    },
  },
)
