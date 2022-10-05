import { App as Application } from 'vue-demi';
import { createEventOutside } from '@/shared'

export type { OnEventOutsideOptions, OnEventOutsideHandler } from '@/shared'

const [ clickOutsideEventName, clickOutsideName ] = [ 'click', 'click-outside'];
const { composable: useClickOutside, directive: vClickOutside } = createEventOutside( clickOutsideEventName, clickOutsideName )

const [ blurOutsideEventName, blurOutsideName ] = [ 'focusout', 'blur-outside'];
const { composable: useBlurOutside, directive: vBlurOutside } = createEventOutside( blurOutsideEventName, blurOutsideName )

const [ changeOutsideEventName, changeOutsideName ] = [ 'change', 'change-outside'];
const { composable: useChangeOutside, directive: vChangeOutside } = createEventOutside( changeOutsideEventName, changeOutsideName )

const [ dblclickOutsideEventName, dblclickOutsideName ] = [ 'dblclick', 'dblclick-outside'];
const { composable: useDblclickOutside, directive: vDblclickOutside } = createEventOutside( dblclickOutsideEventName, dblclickOutsideName )

const [ focusOutsideEventName, focusOutsideName ] = [ 'focusin', 'focus-outside'];
const { composable: useFocusOutside, directive: vFocusOutside } = createEventOutside( focusOutsideEventName, focusOutsideName )

const [ keydownOutsideEventName, keydownOutsideName ] = [ 'keydown', 'keydown-outside'];
const { composable: useKeydownOutside, directive: vKeydownOutside } = createEventOutside( keydownOutsideEventName, keydownOutsideName )

const [ keypressOutsideEventName, keypressOutsideName ] = [ 'keypress', 'keypress-outside'];
const { composable: useKeypressOutside, directive: vKeypressOutside } = createEventOutside( keypressOutsideEventName, keypressOutsideName )

const [ keyupOutsideEventName, keyupOutsideName ] = [ 'keyup', 'keyup-outside'];
const { composable: useKeyupOutside, directive: vKeyupOutside } = createEventOutside( keyupOutsideEventName, keyupOutsideName )

const [ mousedownOutsideEventName, mousedownOutsideName ] = [ 'mousedown', 'mousedown-outside'];
const { composable: useMousedownOutside, directive: vMousedownOutside } = createEventOutside( mousedownOutsideEventName, mousedownOutsideName )

const [ mousemoveOutsideEventName, mousemoveOutsideName ] = [ 'mousemove', 'mousemove-outside'];
const { composable: useMousemoveOutside, directive: vMousemoveOutside } = createEventOutside( mousemoveOutsideEventName, mousemoveOutsideName )

const [ mouseoutOutsideEventName, mouseoutOutsideName ] = [ 'mouseout', 'mouseout-outside'];
const { composable: useMouseoutOutside, directive: vMouseoutOutside } = createEventOutside( mouseoutOutsideEventName, mouseoutOutsideName )

const [ mouseoverOutsideEventName, mouseoverOutsideName ] = [ 'mouseover', 'mouseover-outside'];
const { composable: useMouseoverOutside, directive: vMouseoverOutside } = createEventOutside( mouseoverOutsideEventName, mouseoverOutsideName )

const [ mouseupOutsideEventName, mouseupOutsideName ] = [ 'mouseup', 'mouseup-outside'];
const { composable: useMouseupOutside, directive: vMouseupOutside } = createEventOutside( mouseupOutsideEventName, mouseupOutsideName )

const [ selectOutsideEventName, selectOutsideName ] = [ 'select', 'select-outside'];
const { composable: useSelectOutside, directive: vSelectOutside } = createEventOutside( selectOutsideEventName, selectOutsideName )

const [ submitOutsideEventName, submitOutsideName ] = [ 'submit', 'submit-outside'];
const { composable: useSubmitOutside, directive: vSubmitOutside } = createEventOutside( submitOutsideEventName, submitOutsideName )

const [ customOutsideEventName, customOutsideName ] = [ 'custom', 'event-outside'];
const { composable: useCustomOutside, directive: vCustomOutside } = createEventOutside( customOutsideEventName, customOutsideName )


const plugin = {
  install: (app: Application) => {
    app.directive( clickOutsideName,      vClickOutside );
    app.directive( blurOutsideName,       vBlurOutside );
    app.directive( changeOutsideName,     vChangeOutside );
    app.directive( dblclickOutsideName,   vDblclickOutside );
    app.directive( focusOutsideName,      vFocusOutside );
    app.directive( keydownOutsideName,    vKeydownOutside );
    app.directive( keypressOutsideName,   vKeypressOutside );
    app.directive( keyupOutsideName,      vKeyupOutside );
    app.directive( mousedownOutsideName,  vMousedownOutside );
    app.directive( mousemoveOutsideName,  vMousemoveOutside );
    app.directive( mouseoutOutsideName,   vMouseoutOutside );
    app.directive( mouseoverOutsideName,  vMouseoverOutside );
    app.directive( mouseupOutsideName,    vMouseupOutside );
    app.directive( selectOutsideName,     vSelectOutside );
    app.directive( submitOutsideName,     vSubmitOutside );
    app.directive( customOutsideName,     vCustomOutside );
  }
}
export default plugin;

export {
  clickOutsideName,      useClickOutside,      vClickOutside,
  blurOutsideName,       useBlurOutside,       vBlurOutside,
  changeOutsideName,     useChangeOutside,     vChangeOutside,
  dblclickOutsideName,   useDblclickOutside,   vDblclickOutside,
  focusOutsideName,      useFocusOutside,      vFocusOutside,
  keydownOutsideName,    useKeydownOutside,    vKeydownOutside,
  keypressOutsideName,   useKeypressOutside,   vKeypressOutside,
  keyupOutsideName,      useKeyupOutside,      vKeyupOutside,
  mousedownOutsideName,  useMousedownOutside,  vMousedownOutside,
  mousemoveOutsideName,  useMousemoveOutside,  vMousemoveOutside,
  mouseoutOutsideName,   useMouseoutOutside,   vMouseoutOutside,
  mouseoverOutsideName,  useMouseoverOutside,  vMouseoverOutside,
  mouseupOutsideName,    useMouseupOutside,    vMouseupOutside,
  selectOutsideName,     useSelectOutside,     vSelectOutside,
  submitOutsideName,     useSubmitOutside,     vSubmitOutside,
  customOutsideName,     useCustomOutside,     vCustomOutside
}
