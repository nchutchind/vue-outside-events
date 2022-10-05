import type { ComponentPublicInstance as VueInstance, ComputedRef, Ref } from 'vue-demi'
import { isVue3, unref, ObjectDirective } from 'vue-demi'

export type MaybeElement = HTMLElement | SVGElement | VueInstance | undefined | null;
export type MaybeRef<T> = T | Ref<T>;
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>;
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeComputedRef<T>
export type MaybeReadonlyRef<T> = (() => T) | ComputedRef<T>
export type MaybeComputedRef<T> = MaybeReadonlyRef<T> | MaybeRef<T>
export type RefElementReturn<T extends MaybeElement = MaybeElement> = T extends VueInstance ? Exclude<MaybeElement, VueInstance> : T | undefined

export function resolveUnref<T>(r: MaybeComputedRef<T>): T {
  return typeof r === 'function'
    ? (r as any)()
    : unref(r)
}

const INVALID_CUSTOM_EVENT_MSG = `[v-event-outside]: Custom events must be provided an object containing a "name" string and a "handler" function.`

const logError = console.error !== undefined ? console.error : console.log;

export function getElementForRef<T extends MaybeElement>(elRef: MaybeComputedElementRef<T>): RefElementReturn<T> {
  const plain = resolveUnref(elRef)
  return (plain as VueInstance)?.$el ?? plain
}

export const directiveHooks = {
  beforeMount: (isVue3 ?  'beforeMount' : 'bind') as 'beforeMount',
  unmounted: (isVue3 ? 'unmounted' : 'unbind') as 'unmounted',
}

function toPascalCase(text: string) {
  return text.replace(/(^\w|-\w)/g, (text: string) => text.replace(/-/, "").toUpperCase());
}

export interface CustomEventOutsideOptions {
  name: string;
  handler: OnEventOutsideHandler;
  options?: OnEventOutsideOptions;
}

export interface OnEventOutsideOptions {
  name?: string;
  capture?: boolean;
  jquery?: boolean;
  extras?: Record<string | number | symbol, unknown>;
}

export type OnEventOutsideHandler = (e: Event, el: MaybeElementRef, extras?: OnEventOutsideOptions['extras'] ) => void;

export function createEventOutside(
  eventName: string,
  directiveName: string
) {
  const isCustom = eventName === 'custom';

  const composable = <T extends OnEventOutsideOptions>(
    target:  MaybeElementRef,
    handler: OnEventOutsideHandler,
    options: T = {} as T,
  ) => {
    const { name: evName, capture = false, jquery = false, extras } = options

    if (!window) return
    if (jquery && (typeof (window as any).$ === 'undefined' && typeof (window as any).jQuery === 'undefined')) {
      logError(`[v-event-outside]: jQuery events were specified but jQuery is not present in window.`)

      return
    }
    if ( isCustom && ( !evName || evName.trim() === '' )) {
      logError( INVALID_CUSTOM_EVENT_MSG )
    }

    const listener = (event: Event) => {
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
      
      handler( event, el, extras )
    }

    if (jquery) {
      ( window as any ).jQuery( document ).on( evName, listener )
    } else {
      document.addEventListener(evName ?? eventName, listener, { passive: true, capture })
    }

    return () => {
      if (jquery) {
        ( window as any ).jQuery( document ).off( evName, listener )
      } else {
        document.removeEventListener(evName ?? eventName, listener, { capture })
      }
    }
  }

  const directiveDataNameTmpl = `__vueXXX__`
  let evName = eventName, directiveDataName = directiveDataNameTmpl.replace('XXX', toPascalCase(directiveName));

  const directive: ObjectDirective<HTMLElement, OnEventOutsideHandler | [(evt: any) => void, OnEventOutsideOptions] | CustomEventOutsideOptions > = {
    [directiveHooks.beforeMount](el, binding) {
      const capture = binding.modifiers.capture;
      const jquery = binding.modifiers.jquery;

      if ( isCustom ) {
        if (
          // object is required for custom events
          (typeof binding.value !== 'object' || Array.isArray(binding.value)) ||
          // { name:string, handler: Function } is required
          (binding.value.name === undefined || typeof binding.value.name !== 'string') ||
          (binding.value.handler === undefined || typeof binding.value.handler !== 'function')
        ) {
          logError( INVALID_CUSTOM_EVENT_MSG );

          return
        }
        evName = binding.value.name;
        directiveDataName = directiveDataNameTmpl.replace('XXX', `Custom${ toPascalCase(evName)}`)
      }

      if (typeof binding.value === 'function') {
        (el as any)[directiveDataName] = composable(el, binding.value, { capture, jquery, name: evName })
      } else if (typeof binding.value === 'object' ) {
        let handler, options;
        
        if ( Array.isArray( binding.value )) {
          [ handler, options ] = binding.value;
        } else {
          ({ handler, options } = binding.value);
        }
        
        (el as any)[directiveDataName] = composable(el, handler, Object.assign({ capture, jquery, name: evName }, options))
      }
    },
    [directiveHooks.unmounted](el) {
      let directiveDataName = directiveDataNameTmpl.replace('XXX', isCustom ? `Custom${ toPascalCase(evName)}` : toPascalCase(directiveName));
      (el as any)[directiveDataName]?.();
    }
  }

  return {
    composable,
    directive
  }
}
