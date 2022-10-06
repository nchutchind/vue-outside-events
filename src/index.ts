import type { ComponentPublicInstance as VueInstance, ComputedRef, Ref } from 'vue-demi'
import { App as Application, isVue3, unref, ObjectDirective } from 'vue-demi'
import { PascalCase } from 'type-fest'

//const INVALID_CUSTOM_EVENT_MSG = `[v-event-outside]: Custom events must be provided an object containing a "name" string and a "handler" function.`
const logError = console.error !== undefined ? console.error : console.log;
const TAG = '[vue-outside-events]';
const toPascalCase = (text: string) => text.replace(/(^\w|-\w)/g, (text: string) => text.replace(/-/, "").toUpperCase());

// Util types from VueUse
export type MaybeElement = HTMLElement | SVGElement | VueInstance | undefined | null;
export type MaybeRef<T> = T | Ref<T>;
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>;
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeComputedRef<T>
export type MaybeComputedRef<T> = (() => T) | ComputedRef<T> | MaybeRef<T>
export type RefElementReturn<T extends MaybeElement = MaybeElement> = T extends VueInstance ? Exclude<MaybeElement, VueInstance> : T | undefined
export function resolveUnref<T>(r: MaybeComputedRef<T>): T {
  return typeof r === 'function'
    ? (r as any)()
    : unref(r)
}
export function getElementForRef<T extends MaybeElement>(elRef: MaybeComputedElementRef<T>): RefElementReturn<T> {
  const plain = resolveUnref(elRef)
  return (plain as VueInstance)?.$el ?? plain
}
export const directiveHooks = {
  beforeMount: (isVue3 ?  'beforeMount' : 'bind') as 'beforeMount',
  unmounted: (isVue3 ? 'unmounted' : 'unbind') as 'unmounted',
}

// Custom Event parameters
export interface CustomEventOutsideOptions {
  // Custom events REQUIRE a name for the event to fire
  name: string;
  // No point in listening for an event if you aren't going to do anything with it
  handler: OnEventOutsideHandler;
  options?: OnEventOutsideOptions;
}

export interface OnEventOutsideOptions {
  // if the dev passes the event name in the extras, we'll try to make it work. top-level names win, though
  name?: string;
  // should Capture mode be used when listening?
  capture?: boolean;
  // should jQuery events be used instead of DOM events?
  jquery?: boolean;
  // Any extra data you want available when handling the event
  extras?: Record<string | number | symbol, unknown>;
}

// All handlers should expect the Event, the Element, and any extras
export type OnEventOutsideHandler = (e: Event, el: MaybeElementRef, extras?: OnEventOutsideOptions['extras'] ) => void;

function createEventListener<T extends OnEventOutsideOptions>( name: string | undefined, target: MaybeElementRef, handler: OnEventOutsideHandler | undefined, options: T = {} as T): undefined | (()=>void) {
  const { capture = false, jquery = false, extras } = options

  if ( !window ) return
  if ( !name || name.trim().length === 0 ) {
    logError(`${TAG}: No event name was provided.`)

    return;
  }
  if ( !handler ) {
    logError(`${TAG}: No event handler was provided.`)

    return;
  }
  
  if ( jquery && ( typeof ( window as any ).$ === 'undefined' && typeof ( window as any ).jQuery === 'undefined' )) {
    logError(`${TAG}: jQuery events were specified but jQuery is not present in window.`)

    return;
  }

  const listener = (event: Event) => {
    // determine if we need to call the handler
    const el = getElementForRef(target)

    if (!el || el === event.target ) {
      return;
    }
    if ( event.composed ) {
      if ( event.composedPath().includes(el)) {
        return
      }
    } else if (el.contains( event.target as Node )) {
      return
    }

    handler && handler( event, el, extras )
  }

  // listen for the event
  if (jquery) {
    ( window as any ).jQuery( document ).on( name, listener )
  } else {
    document.addEventListener( name, listener, { passive: true, capture })
  }

  // return a function that can be called to unregister the listener
  return () => {
    if ( !name ) return;
    if (jquery) {
      ( window as any ).jQuery( document ).off( name, listener )
    } else {
      document.removeEventListener( name, listener, { capture })
    }
  }
}

type OutsideEventDirective = ObjectDirective<HTMLElement, OnEventOutsideHandler | (string | ((evt: any) => void) | OnEventOutsideOptions)[] | CustomEventOutsideOptions>;

function createDirective( eventName: string | undefined, directiveName: string ): OutsideEventDirective {
  const directiveDataName = `__vue${ toPascalCase( directiveName )}__`;

  const directive: OutsideEventDirective = {
    // Vue2 => bind, Vue3 => beforeMount
    [directiveHooks.beforeMount](el, binding) {
      const capture = binding.modifiers.capture;
      const jquery = binding.modifiers.jquery;
      let unregisterFn;

      if (typeof binding.value === 'function') {
        unregisterFn = createEventListener(eventName, el, binding.value, { capture, jquery })
      } else if (typeof binding.value === 'object' ) {
        let handler, options, name;
        
        if ( Array.isArray( binding.value )) {
          // v-outside-event="[ 'click', onOutsideEvent, { extras: { foo: 'bar' }}]"
          name = binding.value.find( v => typeof v === 'string' ) as string | undefined;
          handler = binding.value.find( v => typeof v === 'function' ) as OnEventOutsideHandler | undefined
          options = binding.value.find( v => typeof v === 'object' && !Array.isArray( v )) as OnEventOutsideOptions | undefined;
        } else {
          // v-outside-event="{ name: 'click', handler: onOutsideEvent, options: { extras: { foo: 'bar' }}}"
          ({ handler, options, name } = binding.value);
        }
        name = name ?? options?.name ?? eventName!;
        // store the unregister function on the element
        unregisterFn = createEventListener(name, el, handler, Object.assign({ capture, jquery }, options))
      }

      (el as any)[directiveDataName] = unregisterFn;
    },
    // Vue2 => unbind, Vue3 => unmounted
    [directiveHooks.unmounted](el) {
      // call the unregister function if it exists
      (el as any)[directiveDataName]?.();
    }
  }

  return directive;
}

export type OnEventOutsideListener<T extends OnEventOutsideOptions = OnEventOutsideOptions> = {
  ( name: string | undefined, target:  MaybeElementRef, handler?: OnEventOutsideHandler, options?: T ): undefined | (()=>void);
  ( target:  MaybeElementRef, handler?: OnEventOutsideHandler, options?: T): undefined | (()=>void);
}

type CreateEventOutsideReturn<EN extends string | undefined, D extends string> = (
  { [K in keyof { x: any } as ( `${Lowercase<D>}OutsideEventName` )]: EN extends string ? string : undefined } &
  { [K in keyof { x: any } as ( `${Lowercase<D>}OutsideName` )]: string } &
  { [K in keyof { x: any } as ( `on${PascalCase<D>}Outside` )]: OnEventOutsideListener<OnEventOutsideOptions> } &
  { [K in keyof { x: any } as ( `v${PascalCase<D>}Outside` )]: OutsideEventDirective }
)

export function createOutsideEvent<EN extends string>( eventName: EN ): CreateEventOutsideReturn<EN,EN>;
export function createOutsideEvent<EN extends undefined, D extends string>( eventName: EN, descriptor: D ): CreateEventOutsideReturn<EN,D>;
export function createOutsideEvent<EN extends undefined, D extends string>( eventName: EN, descriptor: D, directiveName?: string ): CreateEventOutsideReturn<EN,D>;
export function createOutsideEvent<EN extends string, D extends string>( eventName: EN, descriptor: D, directiveName?: string ): CreateEventOutsideReturn<EN,D>;
export function createOutsideEvent<EN extends string, D extends string>( eventName?: EN, descriptor?: D, directiveName?: string ): CreateEventOutsideReturn<EN, D extends string ? D : EN extends string ? EN : never> {
  
  if ( !eventName && !descriptor ) throw Error(`${TAG}: createOutsideEvent requires 1 or more parameters.`);
  
  const evListener: OnEventOutsideListener = <T extends OnEventOutsideOptions>( nameOrTarget: string | MaybeElementRef, targetOrHandler: MaybeElementRef | OnEventOutsideHandler, handlerOrOptions: OnEventOutsideHandler | T = {} as T, optionalOptions: undefined | T = {} as T): undefined | (()=>void) => {
    let name: string | undefined, target: MaybeElementRef, handler: OnEventOutsideHandler | undefined, options: T = {} as T;
    
    if ( typeof nameOrTarget === 'string' ) {
      name = nameOrTarget ?? eventName;
      target = targetOrHandler as MaybeElementRef;
      handler = handlerOrOptions as OnEventOutsideHandler;
      options = optionalOptions;
    } else if ( nameOrTarget ) {
      target = nameOrTarget;
      handler = targetOrHandler as OnEventOutsideHandler;
      options = handlerOrOptions as T;
      name = options?.name || eventName;
    }

    return createEventListener( name, target, handler, options )
  }
  const normalizedDescriptor = (descriptor ?? eventName!) as string;
  const normalizedDirectiveName = directiveName ?? `${ normalizedDescriptor.toLowerCase()}-outside`

  const directive = createDirective( eventName, normalizedDirectiveName );

  return {
    [ `${normalizedDescriptor.toLowerCase()}OutsideEventName` ]: eventName,
    [ `${normalizedDescriptor.toLowerCase()}OutsideName` ]: normalizedDirectiveName,
    [ `on${ toPascalCase(normalizedDescriptor)}Outside` ]: evListener!,
    [ `v${ toPascalCase(normalizedDescriptor)}Outside` ]: directive!
  }
}

// Event Type Definitions

const { /* no def custom event */   eventOutsideName,       onEventOutside,       vEventOutside     } = createOutsideEvent( undefined,    'event' );
const { clickOutsideEventName,      clickOutsideName,       onClickOutside,       vClickOutside     } = createOutsideEvent( 'click' );
const { blurOutsideEventName,       blurOutsideName,        onBlurOutside,        vBlurOutside      } = createOutsideEvent( 'focusout',   'blur' );
const { changeOutsideEventName,     changeOutsideName,      onChangeOutside,      vChangeOutside    } = createOutsideEvent( 'change' )
const { dblclickOutsideEventName,   dblclickOutsideName,    onDblclickOutside,    vDblclickOutside  } = createOutsideEvent( 'dblclick' )
const { focusOutsideEventName,      focusOutsideName,       onFocusOutside,       vFocusOutside     } = createOutsideEvent( 'focusin',    'focus' )
const { keydownOutsideEventName,    keydownOutsideName,     onKeydownOutside,     vKeydownOutside   } = createOutsideEvent( 'keydown' )
const { keypressOutsideEventName,   keypressOutsideName,    onKeypressOutside,    vKeypressOutside  } = createOutsideEvent( 'keypress' )
const { keyupOutsideEventName,      keyupOutsideName,       onKeyupOutside,       vKeyupOutside     } = createOutsideEvent( 'keyup' )
const { mousedownOutsideEventName,  mousedownOutsideName,   onMousedownOutside,   vMousedownOutside } = createOutsideEvent( 'mousedown' )
const { mousemoveOutsideEventName,  mousemoveOutsideName,   onMousemoveOutside,   vMousemoveOutside } = createOutsideEvent( 'mousemove' )
const { mouseoutOutsideEventName,   mouseoutOutsideName,    onMouseoutOutside,    vMouseoutOutside  } = createOutsideEvent( 'mouseout' )
const { mouseoverOutsideEventName,  mouseoverOutsideName,   onMouseoverOutside,   vMouseoverOutside } = createOutsideEvent( 'mouseover' )
const { mouseupOutsideEventName,    mouseupOutsideName,     onMouseupOutside,     vMouseupOutside   } = createOutsideEvent( 'mouseup' )
const { selectOutsideEventName,     selectOutsideName,      onSelectOutside,      vSelectOutside    } = createOutsideEvent( 'select' )
const { submitOutsideEventName,     submitOutsideName,      onSubmitOutside,      vSubmitOutside    } = createOutsideEvent( 'submit' )

/**
 * Other UI events that could be listened for:
 * 
 * abort
 * animationend
 * animationiteration
 * animationend
 * canplay
 * canplaythrough
 * contextmenu
 * copy
 * cut
 * dragend
 * dragenter
 * dragleave
 * dragover
 * dragstart
 * drop
 * durationchange
 * ended
 * error
 * input
 * invalid
 * loadeddata
 * loadedmetadata
 * loadstart
 * mouseenter
 * mouseleave // mouseleave is fired when the pointer has exited the element and all of its descendants, whereas mouseout is fired when the pointer leaves the element or leaves one of the element's descendants (even if the pointer is still within the element)
 * paste
 * pause
 * play
 * playing
 * progress
 * ratechange
 * reset
 * scroll
 * search
 * seeked
 * seeking
 * timeupdate
 * toggle
 * touchcancel
 * touchend
 * touchmove
 * touchstart
 * transitionend
 * volumechange
 * waiting
 * wheel
 */

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
    app.directive( eventOutsideName,      vEventOutside );
  }
}
export default plugin;

export {
  clickOutsideEventName,      clickOutsideName,      onClickOutside,      vClickOutside,
  blurOutsideEventName,       blurOutsideName,       onBlurOutside,       vBlurOutside,
  changeOutsideEventName,     changeOutsideName,     onChangeOutside,     vChangeOutside,
  dblclickOutsideEventName,   dblclickOutsideName,   onDblclickOutside,   vDblclickOutside,
  focusOutsideEventName,      focusOutsideName,      onFocusOutside,      vFocusOutside,
  keydownOutsideEventName,    keydownOutsideName,    onKeydownOutside,    vKeydownOutside,
  keypressOutsideEventName,   keypressOutsideName,   onKeypressOutside,   vKeypressOutside,
  keyupOutsideEventName,      keyupOutsideName,      onKeyupOutside,      vKeyupOutside,
  mousedownOutsideEventName,  mousedownOutsideName,  onMousedownOutside,  vMousedownOutside,
  mousemoveOutsideEventName,  mousemoveOutsideName,  onMousemoveOutside,  vMousemoveOutside,
  mouseoutOutsideEventName,   mouseoutOutsideName,   onMouseoutOutside,   vMouseoutOutside,
  mouseoverOutsideEventName,  mouseoverOutsideName,  onMouseoverOutside,  vMouseoverOutside,
  mouseupOutsideEventName,    mouseupOutsideName,    onMouseupOutside,    vMouseupOutside,
  selectOutsideEventName,     selectOutsideName,     onSelectOutside,     vSelectOutside,
  submitOutsideEventName,     submitOutsideName,     onSubmitOutside,     vSubmitOutside,
  /* no def custom event */   eventOutsideName,      onEventOutside,      vEventOutside
}
