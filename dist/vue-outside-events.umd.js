/**
 * vue-outside-events @ 2.0.0
 * A set of Vue 2.x/3.x directives to react to various events outside the specified element.
 * Copyright (c) 2017 Nicholas Hutchind <nicholas@hutchind.com>
 *
 * License: MIT
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
 */
var VueDemi = (function (VueDemi, Vue, VueCompositionAPI) {
  if (VueDemi.install) {
    return VueDemi
  }
  if (!Vue) {
    console.error('[vue-demi] no Vue instance found, please be sure to import `vue` before `vue-demi`.')
    return VueDemi
  }

  // Vue 2.7
  if (Vue.version.slice(0, 4) === '2.7.') {
    for (var key in Vue) {
      VueDemi[key] = Vue[key]
    }
    VueDemi.isVue2 = true
    VueDemi.isVue3 = false
    VueDemi.install = function () {}
    VueDemi.Vue = Vue
    VueDemi.Vue2 = Vue
    VueDemi.version = Vue.version
    VueDemi.warn = Vue.util.warn
    function createApp(rootComponent, rootProps) {
      var vm
      var provide = {}
      var app = {
        config: Vue.config,
        use: Vue.use.bind(Vue),
        mixin: Vue.mixin.bind(Vue),
        component: Vue.component.bind(Vue),
        provide: function (key, value) {
          provide[key] = value
          return this
        },
        directive: function (name, dir) {
          if (dir) {
            Vue.directive(name, dir)
            return app
          } else {
            return Vue.directive(name)
          }
        },
        mount: function (el, hydrating) {
          if (!vm) {
            vm = new Vue(Object.assign({ propsData: rootProps }, rootComponent, { provide: Object.assign(provide, rootComponent.provide) }))
            vm.$mount(el, hydrating)
            return vm
          } else {
            return vm
          }
        },
        unmount: function () {
          if (vm) {
            vm.$destroy()
            vm = undefined
          }
        },
      }
      return app
    }
    VueDemi.createApp = createApp
  }
  // Vue 2.6.x
  else if (Vue.version.slice(0, 2) === '2.') {
    if (VueCompositionAPI) {
      for (var key in VueCompositionAPI) {
        VueDemi[key] = VueCompositionAPI[key]
      }
      VueDemi.isVue2 = true
      VueDemi.isVue3 = false
      VueDemi.install = function () {}
      VueDemi.Vue = Vue
      VueDemi.Vue2 = Vue
      VueDemi.version = Vue.version
    } else {
      console.error('[vue-demi] no VueCompositionAPI instance found, please be sure to import `@vue/composition-api` before `vue-demi`.')
    }
  }
  // Vue 3
  else if (Vue.version.slice(0, 2) === '3.') {
    for (var key in Vue) {
      VueDemi[key] = Vue[key]
    }
    VueDemi.isVue2 = false
    VueDemi.isVue3 = true
    VueDemi.install = function () {}
    VueDemi.Vue = Vue
    VueDemi.Vue2 = undefined
    VueDemi.version = Vue.version
    VueDemi.set = function (target, key, val) {
      if (Array.isArray(target)) {
        target.length = Math.max(target.length, key)
        target.splice(key, 1, val)
        return val
      }
      target[key] = val
      return val
    }
    VueDemi.del = function (target, key) {
      if (Array.isArray(target)) {
        target.splice(key, 1)
        return
      }
      delete target[key]
    }
  } else {
    console.error('[vue-demi] Vue version ' + Vue.version + ' is unsupported.')
  }
  return VueDemi
})(
  (this.VueDemi = this.VueDemi || (typeof VueDemi !== 'undefined' ? VueDemi : {})),
  this.Vue || (typeof Vue !== 'undefined' ? Vue : undefined),
  this.VueCompositionAPI || (typeof VueCompositionAPI !== 'undefined' ? VueCompositionAPI : undefined)
);
;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue-demi')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue-demi'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.vueOutsideEvents = {}, global.VueDemi));
})(this, (function (exports, vueDemi) { 'use strict';

  const logError = console.error !== void 0 ? console.error : console.log;
  const TAG = "[vue-outside-events]";
  const toPascalCase = (text) => text.replace(/(^\w|-\w)/g, (text2) => text2.replace(/-/, "").toUpperCase());
  function resolveUnref(r) {
    return typeof r === "function" ? r() : vueDemi.unref(r);
  }
  function getElementForRef(elRef) {
    var _a;
    const plain = resolveUnref(elRef);
    return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
  }
  const directiveHooks = {
    beforeMount: vueDemi.isVue3 ? "beforeMount" : "bind",
    unmounted: vueDemi.isVue3 ? "unmounted" : "unbind"
  };
  function createEventListener(name, target, handler, options = {}) {
    const { capture = false, jquery = false, extras } = options;
    if (!window)
      return;
    if (!name || name.trim().length === 0) {
      logError(`${TAG}: No event name was provided.`);
      return;
    }
    if (!handler) {
      logError(`${TAG}: No event handler was provided.`);
      return;
    }
    if (jquery && (typeof window.$ === "undefined" && typeof window.jQuery === "undefined")) {
      logError(`${TAG}: jQuery events were specified but jQuery is not present in window.`);
      return;
    }
    const listener = (event) => {
      const el = getElementForRef(target);
      if (!el || el === event.target) {
        return;
      }
      if (event.composed) {
        if (event.composedPath().includes(el)) {
          return;
        }
      } else if (el.contains(event.target)) {
        return;
      }
      handler && handler(event, el, extras);
    };
    if (jquery) {
      window.jQuery(document).on(name, listener);
    } else {
      document.addEventListener(name, listener, { passive: true, capture });
    }
    return () => {
      if (!name)
        return;
      if (jquery) {
        window.jQuery(document).off(name, listener);
      } else {
        document.removeEventListener(name, listener, { capture });
      }
    };
  }
  function createDirective(eventName, directiveName) {
    const directiveDataName = `__vue${toPascalCase(directiveName)}__`;
    const directive = {
      [directiveHooks.beforeMount](el, binding) {
        var _a;
        const capture = binding.modifiers.capture;
        const jquery = binding.modifiers.jquery;
        let unregisterFn;
        if (typeof binding.value === "function") {
          unregisterFn = createEventListener(eventName, el, binding.value, { capture, jquery });
        } else if (typeof binding.value === "object") {
          let handler, options, name;
          if (Array.isArray(binding.value)) {
            name = binding.value.find((v) => typeof v === "string");
            handler = binding.value.find((v) => typeof v === "function");
            options = binding.value.find((v) => typeof v === "object" && !Array.isArray(v));
          } else {
            ({ handler, options, name } = binding.value);
          }
          name = (_a = name != null ? name : options == null ? void 0 : options.name) != null ? _a : eventName;
          unregisterFn = createEventListener(name, el, handler, Object.assign({ capture, jquery }, options));
        }
        el[directiveDataName] = unregisterFn;
      },
      [directiveHooks.unmounted](el) {
        var _a;
        (_a = el[directiveDataName]) == null ? void 0 : _a.call(el);
      }
    };
    return directive;
  }
  function createOutsideEvent(eventName, descriptor, directiveName) {
    if (!eventName && !descriptor)
      throw Error(`${TAG}: createOutsideEvent requires 1 or more parameters.`);
    const evListener = (nameOrTarget, targetOrHandler, handlerOrOptions = {}, optionalOptions = {}) => {
      let name, target, handler, options = {};
      if (typeof nameOrTarget === "string") {
        name = nameOrTarget != null ? nameOrTarget : eventName;
        target = targetOrHandler;
        handler = handlerOrOptions;
        options = optionalOptions;
      } else if (nameOrTarget) {
        target = nameOrTarget;
        handler = targetOrHandler;
        options = handlerOrOptions;
        name = (options == null ? void 0 : options.name) || eventName;
      }
      return createEventListener(name, target, handler, options);
    };
    const normalizedDescriptor = descriptor != null ? descriptor : eventName;
    const normalizedDirectiveName = directiveName != null ? directiveName : `${normalizedDescriptor.toLowerCase()}-outside`;
    const directive = createDirective(eventName, normalizedDirectiveName);
    return {
      [`${normalizedDescriptor.toLowerCase()}OutsideEventName`]: eventName,
      [`${normalizedDescriptor.toLowerCase()}OutsideName`]: normalizedDirectiveName,
      [`on${toPascalCase(normalizedDescriptor)}Outside`]: evListener,
      [`v${toPascalCase(normalizedDescriptor)}Outside`]: directive
    };
  }
  const { eventOutsideName, onEventOutside, vEventOutside } = createOutsideEvent(void 0, "event");
  const { clickOutsideEventName, clickOutsideName, onClickOutside, vClickOutside } = createOutsideEvent("click");
  const { blurOutsideEventName, blurOutsideName, onBlurOutside, vBlurOutside } = createOutsideEvent("focusout", "blur");
  const { changeOutsideEventName, changeOutsideName, onChangeOutside, vChangeOutside } = createOutsideEvent("change");
  const { dblclickOutsideEventName, dblclickOutsideName, onDblclickOutside, vDblclickOutside } = createOutsideEvent("dblclick");
  const { focusOutsideEventName, focusOutsideName, onFocusOutside, vFocusOutside } = createOutsideEvent("focusin", "focus");
  const { keydownOutsideEventName, keydownOutsideName, onKeydownOutside, vKeydownOutside } = createOutsideEvent("keydown");
  const { keypressOutsideEventName, keypressOutsideName, onKeypressOutside, vKeypressOutside } = createOutsideEvent("keypress");
  const { keyupOutsideEventName, keyupOutsideName, onKeyupOutside, vKeyupOutside } = createOutsideEvent("keyup");
  const { mousedownOutsideEventName, mousedownOutsideName, onMousedownOutside, vMousedownOutside } = createOutsideEvent("mousedown");
  const { mousemoveOutsideEventName, mousemoveOutsideName, onMousemoveOutside, vMousemoveOutside } = createOutsideEvent("mousemove");
  const { mouseoutOutsideEventName, mouseoutOutsideName, onMouseoutOutside, vMouseoutOutside } = createOutsideEvent("mouseout");
  const { mouseoverOutsideEventName, mouseoverOutsideName, onMouseoverOutside, vMouseoverOutside } = createOutsideEvent("mouseover");
  const { mouseupOutsideEventName, mouseupOutsideName, onMouseupOutside, vMouseupOutside } = createOutsideEvent("mouseup");
  const { selectOutsideEventName, selectOutsideName, onSelectOutside, vSelectOutside } = createOutsideEvent("select");
  const { submitOutsideEventName, submitOutsideName, onSubmitOutside, vSubmitOutside } = createOutsideEvent("submit");
  const plugin = {
    install: (app) => {
      app.directive(clickOutsideName, vClickOutside);
      app.directive(blurOutsideName, vBlurOutside);
      app.directive(changeOutsideName, vChangeOutside);
      app.directive(dblclickOutsideName, vDblclickOutside);
      app.directive(focusOutsideName, vFocusOutside);
      app.directive(keydownOutsideName, vKeydownOutside);
      app.directive(keypressOutsideName, vKeypressOutside);
      app.directive(keyupOutsideName, vKeyupOutside);
      app.directive(mousedownOutsideName, vMousedownOutside);
      app.directive(mousemoveOutsideName, vMousemoveOutside);
      app.directive(mouseoutOutsideName, vMouseoutOutside);
      app.directive(mouseoverOutsideName, vMouseoverOutside);
      app.directive(mouseupOutsideName, vMouseupOutside);
      app.directive(selectOutsideName, vSelectOutside);
      app.directive(submitOutsideName, vSubmitOutside);
      app.directive(eventOutsideName, vEventOutside);
    }
  };

  exports.blurOutsideEventName = blurOutsideEventName;
  exports.blurOutsideName = blurOutsideName;
  exports.changeOutsideEventName = changeOutsideEventName;
  exports.changeOutsideName = changeOutsideName;
  exports.clickOutsideEventName = clickOutsideEventName;
  exports.clickOutsideName = clickOutsideName;
  exports.createOutsideEvent = createOutsideEvent;
  exports.dblclickOutsideEventName = dblclickOutsideEventName;
  exports.dblclickOutsideName = dblclickOutsideName;
  exports["default"] = plugin;
  exports.directiveHooks = directiveHooks;
  exports.eventOutsideName = eventOutsideName;
  exports.focusOutsideEventName = focusOutsideEventName;
  exports.focusOutsideName = focusOutsideName;
  exports.getElementForRef = getElementForRef;
  exports.keydownOutsideEventName = keydownOutsideEventName;
  exports.keydownOutsideName = keydownOutsideName;
  exports.keypressOutsideEventName = keypressOutsideEventName;
  exports.keypressOutsideName = keypressOutsideName;
  exports.keyupOutsideEventName = keyupOutsideEventName;
  exports.keyupOutsideName = keyupOutsideName;
  exports.mousedownOutsideEventName = mousedownOutsideEventName;
  exports.mousedownOutsideName = mousedownOutsideName;
  exports.mousemoveOutsideEventName = mousemoveOutsideEventName;
  exports.mousemoveOutsideName = mousemoveOutsideName;
  exports.mouseoutOutsideEventName = mouseoutOutsideEventName;
  exports.mouseoutOutsideName = mouseoutOutsideName;
  exports.mouseoverOutsideEventName = mouseoverOutsideEventName;
  exports.mouseoverOutsideName = mouseoverOutsideName;
  exports.mouseupOutsideEventName = mouseupOutsideEventName;
  exports.mouseupOutsideName = mouseupOutsideName;
  exports.onBlurOutside = onBlurOutside;
  exports.onChangeOutside = onChangeOutside;
  exports.onClickOutside = onClickOutside;
  exports.onDblclickOutside = onDblclickOutside;
  exports.onEventOutside = onEventOutside;
  exports.onFocusOutside = onFocusOutside;
  exports.onKeydownOutside = onKeydownOutside;
  exports.onKeypressOutside = onKeypressOutside;
  exports.onKeyupOutside = onKeyupOutside;
  exports.onMousedownOutside = onMousedownOutside;
  exports.onMousemoveOutside = onMousemoveOutside;
  exports.onMouseoutOutside = onMouseoutOutside;
  exports.onMouseoverOutside = onMouseoverOutside;
  exports.onMouseupOutside = onMouseupOutside;
  exports.onSelectOutside = onSelectOutside;
  exports.onSubmitOutside = onSubmitOutside;
  exports.resolveUnref = resolveUnref;
  exports.selectOutsideEventName = selectOutsideEventName;
  exports.selectOutsideName = selectOutsideName;
  exports.submitOutsideEventName = submitOutsideEventName;
  exports.submitOutsideName = submitOutsideName;
  exports.vBlurOutside = vBlurOutside;
  exports.vChangeOutside = vChangeOutside;
  exports.vClickOutside = vClickOutside;
  exports.vDblclickOutside = vDblclickOutside;
  exports.vEventOutside = vEventOutside;
  exports.vFocusOutside = vFocusOutside;
  exports.vKeydownOutside = vKeydownOutside;
  exports.vKeypressOutside = vKeypressOutside;
  exports.vKeyupOutside = vKeyupOutside;
  exports.vMousedownOutside = vMousedownOutside;
  exports.vMousemoveOutside = vMousemoveOutside;
  exports.vMouseoutOutside = vMouseoutOutside;
  exports.vMouseoverOutside = vMouseoverOutside;
  exports.vMouseupOutside = vMouseupOutside;
  exports.vSelectOutside = vSelectOutside;
  exports.vSubmitOutside = vSubmitOutside;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
