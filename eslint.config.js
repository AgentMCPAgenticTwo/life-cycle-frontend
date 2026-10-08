import js from '@eslint/js';
import globals from 'globals';

// espree parses JSX fine (parserOptions.ecmaFeatures.jsx), but its JSXIdentifier nodes
// aren't visited by no-unused-vars' reference collector, so `<Foo />` doesn't count as a
// use of `Foo` without this. eslint-plugin-react normally ships this as jsx-uses-vars;
// it isn't in the dependency manifest, so it's reimplemented here as a tiny local rule
// instead of adding a dependency (see CLAUDE.md: use only what's already declared).
const jsxUsesVars = {
  rules: {
    'jsx-uses-vars': {
      meta: { type: 'problem' },
      create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        return {
          JSXOpeningElement(node) {
            let name = node.name;
            while (name.type === 'JSXMemberExpression') name = name.object;
            if (name.type === 'JSXIdentifier') sourceCode.markVariableAsUsed(name.name, node);
          },
        };
      },
    },
  },
};

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { local: jsxUsesVars },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021, ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'local/jsx-uses-vars': 'error',
    },
  },
];
