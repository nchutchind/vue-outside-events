import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'

const pkg = require('./package.json')
const license = require('rollup-plugin-license')

const banner = `/**
 * ${pkg.name} @ ${pkg.version}
 * ${pkg.author}
 *
 * Vue directive to react to various events outside the current element
 *
 * License: ${pkg.license}
 */`

export default {
  entry: 'src/index.js',
  dest: 'dist/vue-outside-events.min.js',
  format: 'umd',
  moduleId: 'vue-outside-events',
  moduleName: 'vue-outside-events',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    babel({
      babelrc: false,
      presets: ['es2015-rollup']
    }),
    uglify(),
    filesize(),
    license({
      banner
    })
  ]
}
