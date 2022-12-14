module.exports = {
    extends: [require.resolve('@rimac-technology/style-guide/eslint/core')],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    ignorePatterns: ['**/*.json', '**/*.yml'],
}