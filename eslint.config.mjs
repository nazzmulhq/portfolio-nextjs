import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

const config = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "dist/**",
            "public/**",
            "out/**",
            ".prettierrc.js",
            "next-env.d.ts",
        ],
    },
    ...nextConfig,
    prettierConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.node,
            },
        },
        rules: {
            "no-console": "warn",
            "dot-notation": "error",
            "no-else-return": "error",
            "prefer-const": "error",
            "@typescript-eslint/no-explicit-any": "off",
            "react/react-in-jsx-scope": "off",
            "react/display-name": "off",
            "react/no-unescaped-entities": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/refs": "warn",
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/purity": "warn",
            "react-hooks/static-components": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/immutability": "warn",
        },
    },
];

export default config;
