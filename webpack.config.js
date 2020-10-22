// Imports
let path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

// Exports
module.exports = {
    entry: "./src/client/index.ts",
    output: {
        path: path.resolve(__dirname, "dist/public/js"),
        filename: "build.js"
    },
    module: {
        rules: [{
                test: /\.vue$/,
                include: path.resolve(__dirname, "src/client/components"),
                use: "vue-loader"
            }, {
                test: /\.scss$/,
                use: ['vue-style-loader', { loader: 'css-loader', options: { esModule: false }}]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.common.js'
        }
    }
};