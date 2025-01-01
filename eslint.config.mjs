import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const config = [
    {
        ignores: [
            "**/\\{",
            '  "eslintIgnore": [".prettierrc.js", "dist/", "node_modules/", "public/", ".next/", "out/]',
            "**/}",
        ],
    },
    ...fixupConfigRules(
        compat.extends(
            "eslint:recommended",
            "plugin:react/recommended",
            "plugin:react-hooks/recommended",
            "plugin:prettier/recommended",
            "plugin:@typescript-eslint/eslint-recommended",
            "plugin:@typescript-eslint/recommended",
            "next/core-web-vitals",
            "next/typescript",
        ),
    ),
    {
        plugins: {
            react: fixupPluginRules(react),
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.node,
            },

            ecmaVersion: 12,
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "no-console": "warn",
            "dot-notation": "error",
            "no-else-return": "error",
            "no-floating-decimal": "error",
            "no-sequences": "error",
            "@typescript-eslint/no-var-requires": "warn",
            "array-bracket-spacing": "error",
            "computed-property-spacing": ["error", "never"],
            curly: "error",
            "no-lonely-if": "error",
            "no-unneeded-ternary": "error",
            "one-var-declaration-per-line": "error",

            quotes: [
                "error",
                "double",
                {
                    allowTemplateLiterals: false,
                    avoidEscape: true,
                },
            ],

            "array-callback-return": "off",
            "prefer-const": "error",
            "import/prefer-default-export": "off",

            "sort-imports": [
                "error",
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                },
            ],

            "no-unused-expressions": "off",
            "no-prototype-builtins": "off",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "jsx-a11y/href-no-hash": [0],
            "react/display-name": 0,
            "react/no-deprecated": "error",

            "react/no-unsafe": [
                "error",
                {
                    checkAliases: true,
                },
            ],

            "react/jsx-sort-props": [
                "error",
                {
                    ignoreCase: true,
                },
            ],

            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": 0,
            "react/state-in-constructor": 0,
            indent: 0,
            "linebreak-style": 0,
            "react/prop-types": 0,
            "jsx-a11y/click-events-have-key-events": 0,

            "react/jsx-filename-extension": [
                1,
                {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                },
            ],

            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "prettier/prettier": [
                "error",
                {
                    tabWidth: 4,
                    printWidth: 80,
                    endOfLine: "auto",
                    trailingComma: "all",
                    arrowParens: "avoid",
                    semi: true,
                    useTabs: false,
                    singleQuote: false,
                    bracketSpacing: true,
                },
            ],
        },
    },
];

export default config;
