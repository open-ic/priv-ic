// svelte.config.js
const sveltePreprocess = require("svelte-preprocess");
const path = require("path");

const mixins = path.join(__dirname, "src", "styles", "mixins.scss");

// this file is only used by the svelte language server so don't worry about it too much

const preprocessOptions = {
    sourceMaps: true,
    defaults: {
        script: "typescript",
        style: "scss",
    },
    scss: {
        prependData: `@import '${mixins}';`,
    },
};
module.exports = {
    preprocess: sveltePreprocess(preprocessOptions),
};
