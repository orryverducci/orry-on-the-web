import { dest, parallel, src } from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import rollup from "@rollup/stream";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import source from "vinyl-source-stream";
import merge from "merge-stream";
import sourcemaps from "gulp-sourcemaps";
import buffer from "vinyl-buffer";

const sass = gulpSass(dartSass);

function buildcss() {
    let style = process.env.NODE_ENV == "production" ? "compressed" as const : "expanded" as const;

    return src("./resources/css/app.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ["node_modules"],
            outputStyle: style
        })
        .on("error", sass.logError))
        .pipe(sourcemaps.write("."))
        .pipe(dest("./public/css"));
}

function buildjs() {
    let rollupPlugins = [
        typescript({
            compilerOptions: {
                lib: ["es5", "es6", "dom"],
                moduleResolution: "node",
                target: "es6"
            }
        }),
        commonjs(),
        nodePolyfills(),
        nodeResolve()
    ];

    if (process.env.NODE_ENV == "production") {
        rollupPlugins.push(terser());
    }

    return rollup({
        input: "./resources/js/app.ts",
        plugins: rollupPlugins,
        output: {
            format: "iife",
            sourcemap: true,
            sourcemapPathTransform: (relativeSourcePath) => {
                if (relativeSourcePath.startsWith("resources/js/")) {
                    return relativeSourcePath.split("/").slice(2).join("/");
                } else {
                    return relativeSourcePath;
                }
            }
        }
    })
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({
        loadMaps: true
    }))
    .pipe(sourcemaps.write("."))
    .pipe(dest("./public/js"));
}

function copyfonts() {
    let montserrat = src("./node_modules/@fontsource/montserrat/files/**")
        .pipe(dest("./public/fonts"));

    let fonts = src("./resources/fonts/**")
        .pipe(dest("./public/fonts"));

    return merge(montserrat, fonts);
}

function copyimages() {
    let icons = src("./node_modules/bootstrap-icons/bootstrap-icons.svg")
        .pipe(dest("./public/images"));

    let images = src("./resources/images/**")
        .pipe(dest("./public/images"));
    
    return merge(icons, images);
}

exports.buildcss = buildcss;
exports.buildjs = buildjs;
exports.copyfonts = copyfonts;
exports.default = parallel(buildcss, buildjs, copyfonts, copyimages);
