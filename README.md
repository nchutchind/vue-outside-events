# vue-outside-events

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Vue 2.x directive to react on events outside of an element without stopping the event's propagation.

Works well for handling clicks outside of menus and popups. Can handle any DOM event or CustomEvent. Also able to capture jQuery events.

## Install
```js
npm install --save vue-outside-events
```

## Demos
Check out the highly contrived demos here: [https://nchutchind.github.io/vue-outside-events/docs/index.html](https://nchutchind.github.io/vue-outside-events/docs/index.html)

## Use

### Modular
```js
import Vue from 'vue'
import vOutsideEvents from 'vue-outside-events'

Vue.use(vOutsideEvents)
```

```html
<script>
  export default {
    methods: {
      onClickOutside (e, el) {
        console.log('onClickOutside');
        console.log('click heard outside element: ', el);
        console.log('element clicked: '. e.target);
        console.log('event: ', e);
      },
      onMouseOutside (e, el) {
        console.log('onMouseOutside');
        console.log('mouse moved outside element: ', el);
        console.log('element mouse moved over: '. e.target);
        console.log('event: ', e);
      }
    }
  };
</script>

<template>
  <div v-click-outside="onClickOutside"></div>
  <div v-mousemove-outside="onMouseOutside"></div>
</template>
```

### Scripts
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.6/vue.min.js" type="text/javascript"></script>
<script src="js/v-outside-events.min.js" type="text/javascript"></script>

<div id="app">
  <div v-click-outside="onClickOutside"></div>
  <div v-mousemove-outside="onMouseOutside"></div>
</div>

<script>
	new Vue({
		el: '#app',
		methods: {
			onClickOutside (e, el) {
				console.log('onClickOutside');
				console.log('click heard outside element: ', el);
				console.log('element clicked: '. e.target);
				console.log('event: ', e);
			},
			onMouseOutside (e, el) {
				console.log('onMouseOutside');
				console.log('mouse moved outside element: ', el);
				console.log('element mouse moved over: '. e.target);
				console.log('event: ', e);
			}
		}
	});
</script>
```

## Events
| Event              | Event Name  | Directive            | Binding                                        |
| ------------------ | ----------- | -------------------- | ---------------------------------------------- |
| Click              | click       | v-click-outside      | ="handlerName"                                 |
| Double-Click       | dblclick    | v-dblclick-outside   | ="handlerName"                                 |
| Focus              | focusin     | v-focus-outside      | ="handlerName"                                 |
| Blur               | focusout    | v-blur-outside       | ="handlerName"                                 |
| Mouse Over / Enter | mouseover   | v-mouseover-outside  | ="handlerName"                                 |
| Mouse Move         | mousemove   | v-mousemove-outside  | ="handlerName"                                 |
| Mouse Up           | mouseup     | v-mouseup-outside    | ="handlerName"                                 |
| Mouse Down         | mousedown   | v-mousedown-outside  | ="handlerName"                                 |
| Mouse Out          | mouseout    | v-mouseout-outside   | ="handlerName"                                 |
| Key Down           | keydown     | v-keydown-outside    | ="handlerName"                                 |
| Key Up             | keyup       | v-keyup-outside      | ="handlerName"                                 |
| Key Press          | keypress    | v-keypress-outside   | ="handlerName"                                 |
| Change             | change      | v-change-outside     | ="handlerName"                                 |
| Select             | select      | v-select-outside     | ="handlerName"                                 |
| Submit             | submit      | v-submit-outside     | ="handlerName"                                 |
| Custom             | "eventName" | v-event-outside      | ="{ name: 'eventName', handler: handlerName }" |

## Modifiers
Add the `jquery` modifier to allow the directive to handle jQuery triggering of custom events. jQuery must be present in the window for this to work.

```html
<div id="myDiv1" v-event-outside="{ name: 'onFoo', handler: onFooOutside }"></div>
<div id="myDiv2" v-event-outside.jquery="{ name: 'onFoo', handler: onFooOutside }"></div>

<script>
	$(document).trigger("onFoo"); // onFooOutside will be called for #myDiv2, but not #myDiv1

	var event = document.createEvent('Event');
	event.initEvent('onFoo', true, true);
	document.dispatchEvent(event); // onFooOutside will be called for #myDiv1 and #myDiv2
</script>
```

## License
[MIT License](https://github.com/nchutchind/vue-outside-events/blob/master/LICENSE)

## Style
[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
