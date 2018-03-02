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
  input : 'src/index.js',
  output: {
    name  : 'vue-outside-events',
    format: 'umd',
    file  : 'dist/vue-outside-events.min.js'
  },
  plugins: [
    resolve({
      jsnext : true,
      main   : true,
      browser: true
    }),
    babel({
      babelrc: true,
    }),
    uglify(),
    filesize(),
    license({
      banner
    })
  ]
}
