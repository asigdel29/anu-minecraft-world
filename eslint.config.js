import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // `public/` holds vendored, pre-minified assets (e.g. the Basis transcoder)
  // and `dist/` is build output; neither should be linted as project source.
  { ignores: ['dist', 'public/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // This is a plain-JavaScript app; runtime prop-type validation is not used.
      'react/prop-types': 'off',
      // React Three Fiber renders custom JSX elements (mesh, group, geometry,
      // material, ...) whose attributes are not standard DOM properties, so the
      // DOM-oriented unknown-property check produces false positives here.
      'react/no-unknown-property': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
