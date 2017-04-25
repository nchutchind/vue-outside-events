import {
  ClickOutside,
  DblClickOutside,
  FocusOutside,
  BlurOutside,
  MouseMoveOutside,
  MouseDownOutside,
  MouseUpOutside,
  MouseOverOutside,
  MouseOutOutside,
  ChangeOutside,
  SelectOutside,
  SubmitOutside,
  KeyDownOutside,
  KeyPressOutside,
  KeyUpOutside,
  CustomEventOutside
} from './v-outside-events';

const plugin = {
  install (Vue) {
    Vue.directive(ClickOutside.directiveName, ClickOutside);
    Vue.directive(DblClickOutside.directiveName, DblClickOutside);
    Vue.directive(FocusOutside.directiveName, FocusOutside);
    Vue.directive(BlurOutside.directiveName, BlurOutside);
    Vue.directive(MouseMoveOutside.directiveName, MouseMoveOutside);
    Vue.directive(MouseDownOutside.directiveName, MouseDownOutside);
    Vue.directive(MouseUpOutside.directiveName, MouseUpOutside);
    Vue.directive(MouseOverOutside.directiveName, MouseOverOutside);
    Vue.directive(MouseOutOutside.directiveName, MouseOutOutside);
    Vue.directive(ChangeOutside.directiveName, ChangeOutside);
    Vue.directive(SelectOutside.directiveName, SelectOutside);
    Vue.directive(SubmitOutside.directiveName, SubmitOutside);
    Vue.directive(KeyDownOutside.directiveName, KeyDownOutside);
    Vue.directive(KeyPressOutside.directiveName, KeyPressOutside);
    Vue.directive(KeyPressOutside.directiveName, KeyPressOutside);
    Vue.directive(KeyUpOutside.directiveName, KeyUpOutside);
    Vue.directive("event-outside", CustomEventOutside);
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
