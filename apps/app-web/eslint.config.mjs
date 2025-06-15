import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Enforce single quotes (as warning to match Prettier)
      quotes: ['warn', 'single', { avoidEscape: true }],
      // Warn on unused variables
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'warn',
      // Allow any type with warning
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unescaped entities with warning
      'react/no-unescaped-entities': 'warn',
      // Enforce exhaustive dependencies - this prevents runtime bugs
      'react-hooks/exhaustive-deps': 'error',
    },
  },
];

export default eslintConfig;
