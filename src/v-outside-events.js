const createOutsideEvent = (directiveName, eventName) => {
  const outsideEvent = {};

  outsideEvent.directiveName = directiveName;
  outsideEvent.eventName = eventName;

  outsideEvent.bind = function (el, binding, vNode) {
    if (typeof binding.value !== 'function') {
      const compName = vNode.context.name
      let warn = `[${directiveName}:] provided expression '${binding.expression}' must be a function, but is not`
      if (compName) {
        warn += `Found in component '${compName}'`
      }
      console.warn(warn)
    }

    const handler = (e) => {
      if (!el.contains(e.target) && el !== e.target) {
        binding.value(e, el)
      }
    }

    el.__vueEventOutside__ = handler
    document.addEventListener(eventName, handler)
  };

  outsideEvent.unbind = function (el, binding) {
    document.removeEventListener(eventName, el.__vueEventOutside__)
    el.__vueEventOutside__ = null
  };

  return outsideEvent;
};

export const CustomEventOutside = {
  bind: function (el, binding, vNode) {
    if (typeof binding.value !== 'object' || (binding.value.name == undefined || typeof binding.value.name != 'string') || (binding.value.handler == undefined || typeof binding.value.handler != 'function') ) {
      const compName = vNode.context.name
      let warn = `[v-event-outside:] provided expression '${binding.expression}' must be an object containing a "name" string and a "handler" function`
      if (compName) {
        warn += `Found in component '${compName}'`
      }
      console.warn(warn)
    }

    const handler = (e) => {
      if (!el.contains(e.target) && el !== e.target) {
        binding.value.handler(e, el)
      }
    }
    el.__vueEventOutside__ = handler
    document.addEventListener(binding.value.name, handler)
  },

  unbind: function (el, binding) {
    document.removeEventListener(binding.value.name, el.__vueEventOutside__)
    el.__vueEventOutside__ = null
  }
}


export const ClickOutside = createOutsideEvent('click-outside', 'click');
export const DblClickOutside = createOutsideEvent('dblclick-outside', 'dblclick');
export const FocusOutside = createOutsideEvent('focus-outside', 'focusin');
export const BlurOutside = createOutsideEvent('blur-outside', 'focusout');
export const MouseMoveOutside = createOutsideEvent('mousemove-outside', 'mousemove');
export const MouseDownOutside = createOutsideEvent('mousedown-outside', 'mousedown');
export const MouseUpOutside = createOutsideEvent('mouseup-outside', 'mouseup');
export const MouseOverOutside = createOutsideEvent('mouseover-outside', 'mouseover');
export const MouseOutOutside = createOutsideEvent('mouseout-outside', 'mouseout');
export const ChangeOutside = createOutsideEvent('change-outside', 'change');
export const SelectOutside = createOutsideEvent('select-outside', 'select');
export const SubmitOutside = createOutsideEvent('submit-outside', 'submit');
export const KeyDownOutside = createOutsideEvent('keydown-outside', 'keydown');
export const KeyPressOutside = createOutsideEvent('keypress-outside', 'keypress');
export const KeyUpOutside = createOutsideEvent('keyup-outside', 'keyup');
