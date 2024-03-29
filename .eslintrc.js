module.exports = {
    extends: ["plugin:prettier/recommended"],
    plugins: ["prettier"],
    env: {
        browser: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        indent: ["error", 4],
        semi: ["error", "always"],
        "no-trailing-spaces": 0,
        "keyword-spacing": 0,
        "no-unused-vars": 1,
        "no-multiple-empty-lines": 0,
        "space-before-function-paren": 0,
        "eol-last": 0,
    },
};
