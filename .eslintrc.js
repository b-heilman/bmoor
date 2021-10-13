module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es2021": true,
        "mocha": true
    },
    "extends": [
        "eslint:recommended",
        // "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "plugins": ["@typescript-eslint"],
    "rules": {
    },
    "overrides": [{
        "files": "**/*.ts",
        "extends": [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:prettier/recommended"
        ]
    }]
};
