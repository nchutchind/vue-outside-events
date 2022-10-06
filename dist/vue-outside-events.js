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
import { unref, isVue3 } from 'vue-demi';

const logError = console.error !== void 0 ? console.error : console.log;
const TAG = "[vue-outside-events]";
const toPascalCase = (text) => text.replace(/(^\w|-\w)/g, (text2) => text2.replace(/-/, "").toUpperCase());
function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function getElementForRef(elRef) {
  var _a;
  const plain = resolveUnref(elRef);
  return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
}
const directiveHooks = {
  beforeMount: isVue3 ? "beforeMount" : "bind",
  unmounted: isVue3 ? "unmounted" : "unbind"
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

export { blurOutsideEventName, blurOutsideName, changeOutsideEventName, changeOutsideName, clickOutsideEventName, clickOutsideName, createOutsideEvent, dblclickOutsideEventName, dblclickOutsideName, plugin as default, directiveHooks, eventOutsideName, focusOutsideEventName, focusOutsideName, getElementForRef, keydownOutsideEventName, keydownOutsideName, keypressOutsideEventName, keypressOutsideName, keyupOutsideEventName, keyupOutsideName, mousedownOutsideEventName, mousedownOutsideName, mousemoveOutsideEventName, mousemoveOutsideName, mouseoutOutsideEventName, mouseoutOutsideName, mouseoverOutsideEventName, mouseoverOutsideName, mouseupOutsideEventName, mouseupOutsideName, onBlurOutside, onChangeOutside, onClickOutside, onDblclickOutside, onEventOutside, onFocusOutside, onKeydownOutside, onKeypressOutside, onKeyupOutside, onMousedownOutside, onMousemoveOutside, onMouseoutOutside, onMouseoverOutside, onMouseupOutside, onSelectOutside, onSubmitOutside, resolveUnref, selectOutsideEventName, selectOutsideName, submitOutsideEventName, submitOutsideName, vBlurOutside, vChangeOutside, vClickOutside, vDblclickOutside, vEventOutside, vFocusOutside, vKeydownOutside, vKeypressOutside, vKeyupOutside, vMousedownOutside, vMousemoveOutside, vMouseoutOutside, vMouseoverOutside, vMouseupOutside, vSelectOutside, vSubmitOutside };
