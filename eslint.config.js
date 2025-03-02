// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        files: ['**/*.{js,jsx,ts,tsx}', 'module/**/*.{js,jsx,ts,tsx}'],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        settings: {
            'import/resolver': {
                node: {
                    paths: ['module'],
                },
            },
        },
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'error',

            // General rules
            'no-console': 'warn',
            'no-debugger': 'warn',
            'prefer-const': 'error',
            'no-unused-vars': 'off', // Turned off in favor of TypeScript's rule

            // React/JSX rules
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',

            // Modern JavaScript
            'arrow-body-style': ['error', 'as-needed'],
            'no-var': 'error',
            'object-shorthand': 'error',
        },
        ignores: [
            'node_modules',
            'dist',
            'module copy',
            'tailwind.config.js',
            '.prettierrc.js',
            'rome.json',
        ], // Adicione suas regras de ignore aqui
    },
);
