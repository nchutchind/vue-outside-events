import fs from 'fs'
import { terser } from 'rollup-plugin-terser'
import typescript from "@rollup/plugin-typescript";
import filesize from 'rollup-plugin-filesize'
const { nodeResolve } = require('@rollup/plugin-node-resolve')

const pkg = require('./package.json')
const license = require('rollup-plugin-license')

const banner = `/**
 * ${pkg.name} @ ${pkg.version}
 * A set of Vue 2.x/3.x directives to react to various events outside the specified element.
 * Copyright (c) 2017 ${pkg.author}
 *
 * License: ${pkg.license}
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT 
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */`

const external = [
  'vue',
  '@vue/composition-api',
  'vue-demi',
]
const globals = {
  'vue': 'Vue',
  'vue-demi': 'VueDemi'
}

const VUE_DEMI_IIFE = fs.readFileSync(require.resolve('vue-demi/lib/index.iife.js'), 'utf-8')
const injectVueDemi = () => ({
  name: 'inject-vue-demi',
  renderChunk(code) {
    return `${VUE_DEMI_IIFE};\n;${code}`
  },
})

export default {
  input : 'src/index.ts',
  output: [
    {
      name   : 'vueOutsideEvents',
      format : 'umd',
      file   : 'dist/vue-outside-events.min.js',
      exports: 'named',
      globals,
    },
  ],
  external,
  
  plugins: [
    injectVueDemi(),
    typescript(),
    nodeResolve(),
    //terser(),
    filesize(),
    license({
      banner
    })
  ]
}
