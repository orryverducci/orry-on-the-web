import { dest, parallel, src } from 'gulp';
import ts from 'gulp-typescript';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rollup from '@rollup/stream';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import typescript from '@rollup/plugin-typescript';
import source from 'vinyl-source-stream';

const sass = gulpSass(dartSass);

function buildcss() {
    return src('./resources/css/app.scss')
        .pipe(sass({
            includePaths: ['node_modules']
        })
        .on('error', sass.logError))
        .pipe(dest('./public/css'));
}

function buildjs() {
    return rollup({
        input: './resources/js/app.ts',
        plugins: [
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
        ],
        output: {
            format: 'iife'
        }
    })
    .pipe(source('app.js'))
    .pipe(dest('./public/js'));
}

function copyfonts() {
    return src('./node_modules/@fontsource/montserrat/files/**')
        .pipe(dest('./public/fonts'));
}

exports.buildcss = buildcss;
exports.buildjs = buildjs;
exports.copyfonts = copyfonts;
exports.default = parallel(buildcss, buildjs, copyfonts);
