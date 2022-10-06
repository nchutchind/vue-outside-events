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
import { ComponentPublicInstance, Ref, ComputedRef, App, ObjectDirective } from 'vue-demi';
import { PascalCase } from 'type-fest';

declare type MaybeElement = HTMLElement | SVGElement | ComponentPublicInstance | undefined | null;
declare type MaybeRef<T> = T | Ref<T>;
declare type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>;
declare type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeComputedRef<T>;
declare type MaybeComputedRef<T> = (() => T) | ComputedRef<T> | MaybeRef<T>;
declare type RefElementReturn<T extends MaybeElement = MaybeElement> = T extends ComponentPublicInstance ? Exclude<MaybeElement, ComponentPublicInstance> : T | undefined;
declare function resolveUnref<T>(r: MaybeComputedRef<T>): T;
declare function getElementForRef<T extends MaybeElement>(elRef: MaybeComputedElementRef<T>): RefElementReturn<T>;
declare const directiveHooks: {
    beforeMount: "beforeMount";
    unmounted: "unmounted";
};
interface CustomEventOutsideOptions {
    name: string;
    handler: OnEventOutsideHandler;
    options?: OnEventOutsideOptions;
}
interface OnEventOutsideOptions {
    name?: string;
    capture?: boolean;
    jquery?: boolean;
    extras?: Record<string | number | symbol, unknown>;
}
declare type OnEventOutsideHandler = (e: Event, el: MaybeElementRef, extras?: OnEventOutsideOptions['extras']) => void;
declare type OutsideEventDirective = ObjectDirective<HTMLElement, OnEventOutsideHandler | (string | ((evt: any) => void) | OnEventOutsideOptions)[] | CustomEventOutsideOptions>;
declare type OnEventOutsideListener<T extends OnEventOutsideOptions = OnEventOutsideOptions> = {
    (name: string | undefined, target: MaybeElementRef, handler?: OnEventOutsideHandler, options?: T): undefined | (() => void);
    (target: MaybeElementRef, handler?: OnEventOutsideHandler, options?: T): undefined | (() => void);
};
declare type CreateEventOutsideReturn<EN extends string | undefined, D extends string> = ({
    [K in keyof {
        x: any;
    } as (`${Lowercase<D>}OutsideEventName`)]: EN extends string ? string : undefined;
} & {
    [K in keyof {
        x: any;
    } as (`${Lowercase<D>}OutsideName`)]: string;
} & {
    [K in keyof {
        x: any;
    } as (`on${PascalCase<D>}Outside`)]: OnEventOutsideListener<OnEventOutsideOptions>;
} & {
    [K in keyof {
        x: any;
    } as (`v${PascalCase<D>}Outside`)]: OutsideEventDirective;
});
declare function createOutsideEvent<EN extends string>(eventName: EN): CreateEventOutsideReturn<EN, EN>;
declare function createOutsideEvent<EN extends undefined, D extends string>(eventName: EN, descriptor: D): CreateEventOutsideReturn<EN, D>;
declare function createOutsideEvent<EN extends undefined, D extends string>(eventName: EN, descriptor: D, directiveName?: string): CreateEventOutsideReturn<EN, D>;
declare function createOutsideEvent<EN extends string, D extends string>(eventName: EN, descriptor: D, directiveName?: string): CreateEventOutsideReturn<EN, D>;
declare const eventOutsideName: string;
declare const onEventOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vEventOutside: OutsideEventDirective;
declare const clickOutsideEventName: string;
declare const clickOutsideName: string;
declare const onClickOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vClickOutside: OutsideEventDirective;
declare const blurOutsideEventName: string;
declare const blurOutsideName: string;
declare const onBlurOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vBlurOutside: OutsideEventDirective;
declare const changeOutsideEventName: string;
declare const changeOutsideName: string;
declare const onChangeOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vChangeOutside: OutsideEventDirective;
declare const dblclickOutsideEventName: string;
declare const dblclickOutsideName: string;
declare const onDblclickOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vDblclickOutside: OutsideEventDirective;
declare const focusOutsideEventName: string;
declare const focusOutsideName: string;
declare const onFocusOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vFocusOutside: OutsideEventDirective;
declare const keydownOutsideEventName: string;
declare const keydownOutsideName: string;
declare const onKeydownOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vKeydownOutside: OutsideEventDirective;
declare const keypressOutsideEventName: string;
declare const keypressOutsideName: string;
declare const onKeypressOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vKeypressOutside: OutsideEventDirective;
declare const keyupOutsideEventName: string;
declare const keyupOutsideName: string;
declare const onKeyupOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vKeyupOutside: OutsideEventDirective;
declare const mousedownOutsideEventName: string;
declare const mousedownOutsideName: string;
declare const onMousedownOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vMousedownOutside: OutsideEventDirective;
declare const mousemoveOutsideEventName: string;
declare const mousemoveOutsideName: string;
declare const onMousemoveOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vMousemoveOutside: OutsideEventDirective;
declare const mouseoutOutsideEventName: string;
declare const mouseoutOutsideName: string;
declare const onMouseoutOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vMouseoutOutside: OutsideEventDirective;
declare const mouseoverOutsideEventName: string;
declare const mouseoverOutsideName: string;
declare const onMouseoverOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vMouseoverOutside: OutsideEventDirective;
declare const mouseupOutsideEventName: string;
declare const mouseupOutsideName: string;
declare const onMouseupOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vMouseupOutside: OutsideEventDirective;
declare const selectOutsideEventName: string;
declare const selectOutsideName: string;
declare const onSelectOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vSelectOutside: OutsideEventDirective;
declare const submitOutsideEventName: string;
declare const submitOutsideName: string;
declare const onSubmitOutside: OnEventOutsideListener<OnEventOutsideOptions>;
declare const vSubmitOutside: OutsideEventDirective;
declare const plugin: {
    install: (app: App) => void;
};

export { CustomEventOutsideOptions, MaybeComputedElementRef, MaybeComputedRef, MaybeElement, MaybeElementRef, MaybeRef, OnEventOutsideHandler, OnEventOutsideListener, OnEventOutsideOptions, RefElementReturn, blurOutsideEventName, blurOutsideName, changeOutsideEventName, changeOutsideName, clickOutsideEventName, clickOutsideName, createOutsideEvent, dblclickOutsideEventName, dblclickOutsideName, plugin as default, directiveHooks, eventOutsideName, focusOutsideEventName, focusOutsideName, getElementForRef, keydownOutsideEventName, keydownOutsideName, keypressOutsideEventName, keypressOutsideName, keyupOutsideEventName, keyupOutsideName, mousedownOutsideEventName, mousedownOutsideName, mousemoveOutsideEventName, mousemoveOutsideName, mouseoutOutsideEventName, mouseoutOutsideName, mouseoverOutsideEventName, mouseoverOutsideName, mouseupOutsideEventName, mouseupOutsideName, onBlurOutside, onChangeOutside, onClickOutside, onDblclickOutside, onEventOutside, onFocusOutside, onKeydownOutside, onKeypressOutside, onKeyupOutside, onMousedownOutside, onMousemoveOutside, onMouseoutOutside, onMouseoverOutside, onMouseupOutside, onSelectOutside, onSubmitOutside, resolveUnref, selectOutsideEventName, selectOutsideName, submitOutsideEventName, submitOutsideName, vBlurOutside, vChangeOutside, vClickOutside, vDblclickOutside, vEventOutside, vFocusOutside, vKeydownOutside, vKeypressOutside, vKeyupOutside, vMousedownOutside, vMousemoveOutside, vMouseoutOutside, vMouseoverOutside, vMouseupOutside, vSelectOutside, vSubmitOutside };
