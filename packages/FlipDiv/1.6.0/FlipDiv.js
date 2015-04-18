/*!
 * FlipDiv 1.5
 * https://github.com/kireerik/FlipDiv
 * MIT licensed
 *
 * Created by Erik Engi (@kireerik)
 * Originally created by Hakim El Hattab (http://hakim.se, @hakimel)
 */

(function(root, factory) {
	if (typeof define === 'function' && define.amd)
		define(factory) // AMD module
	else
		root.FlipDiv = factory() // Browser global
}(this, function () {

	// Date.now polyfill
	if (typeof Date.now !== 'function') Date.now = function() { return new Date().getTime(); }

	var FlipDiv = {

		// Creates a new instance of FlipDiv
		create: function(options) {
			return (function(){

				// Make sure the required arguments are defined
				if (!options || !options.menuElement || !options.contentsElement)
					throw 'You need to specify which menu and contents elements to use.'

				// Make sure the menu and contents have the same parent
				if (options.menuElement.parentNode !== options.contentsElement.parentNode)
					throw 'The menu and contents elements must have the same parent.'

				// Constants
				var POSITION_T = 'top'
				, POSITION_R = 'right'
				, POSITION_B = 'bottom'
				, POSITION_L = 'left'

				// Feature detection for 3D transforms
				, supports3DTransforms = 'WebkitPerspective' in document.body.style
										|| 'MozPerspective' in document.body.style
										|| 'msPerspective' in document.body.style
										|| 'OPerspective' in document.body.style
										|| 'perspective' in document.body.style

				// Default options, gets extended by passed in arguments
				, config = {
					width: 300
					, height: 300
					, position: POSITION_L
					, threshold: 5
					, swipeThreshold: 40
					, touchAreaThreshold: 40
					, swipeCancelTimeout: 200
					, angle: 30
					, overlap: 6
					, transitionDuration: '0.5s'
					, transitionEasing: 'ease'
					, gradient: 'rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.65) 100%)'
					, mouse: true
					, touch: true
				}

				// Cache references to DOM elements
				, dom = {
					menu: options.menuElement
					, contents: options.contentsElement
					, wrapper: options.menuElement.parentNode
					, cover: null
				}

				// State and input
				, indentX = dom.wrapper.offsetLeft
				, indentY = dom.wrapper.offsetTop
				, touchStartX = null
				, touchStartY = null
				, touchMoveX = null
				, touchMoveY = null
				, swipeMethod = null
				, swipeStartedTime
				, isOpen = false
				, isMouseDown = false

				// Precalculated transform and style states
				, menuTransformOrigin
				, menuTransformClosed
				, menuTransformOpened
				, menuStyleClosed
				, menuStyleOpened

				, contentsTransformOrigin
				, contentsTransformClosed
				, contentsTransformOpened
				, contentsStyleClosed
				, contentsStyleOpened

				, originalStyles = {}
				, addedEventListeners = []

				// Ongoing animations (for fallback mode)
				, menuAnimation
				, contentsAnimation
				, coverAnimation

				configure(options)

				/**
				 * Initializes FlipDiv with the specified user options,
				 * may be called multiple times as configuration changes.
				 */
				function configure(o) {
					// Extend the default config object with the passed in
					// options
					FlipDiv.extend(config, o)

					setupPositions()
					setupWrapper()
					setupCover()
					setupMenu()
					setupContents()

					bindEvents()
				}

				/**
				 * Prepares the transforms for the current positioning
				 * settings.
				 */
				function setupPositions() {
					menuTransformOpened = ''
					contentsTransformClosed = ''
					menuAngle = config.angle
					contentsAngle = config.angle / -2

					switch(config.position) {
						case POSITION_T:
							// Primary transform:
							menuTransformOrigin = '50% 0%'
							menuTransformClosed = 'rotateX(' + menuAngle + 'deg) translateY(-100%) translateY('+ config.overlap +'px)'
							contentsTransformOrigin = '50% 0'
							contentsTransformOpened = 'translateY('+ config.height +'px) rotateX(' + contentsAngle + 'deg)'

							// Position fallback:
							menuStyleClosed = { top: '-' + (config.height-config.overlap) + 'px' }
							menuStyleOpened = { top: '0px' }
							contentsStyleClosed = { top: '0px' }
							contentsStyleOpened = { top: config.height + 'px' }
							break

						case POSITION_R:
							// Primary transform:
							menuTransformOrigin = '100% 50%'
							menuTransformClosed = 'rotateY(' + menuAngle + 'deg) translateX(100%) translateX(-2px) scale(1.01)'
							contentsTransformOrigin = '100% 50%'
							contentsTransformOpened = 'translateX(-'+ config.width +'px) rotateY(' + contentsAngle + 'deg)'

							// Position fallback:
							menuStyleClosed = { right: '-' + (config.width-config.overlap) + 'px' }
							menuStyleOpened = { right: '0px' }
							contentsStyleClosed = { left: '0px' }
							contentsStyleOpened = { left: '-' + config.width + 'px' }
							break

						case POSITION_B:
							// Primary transform:
							menuTransformOrigin = '50% 100%'
							menuTransformClosed = 'rotateX(' + -menuAngle + 'deg) translateY(100%) translateY(-'+ config.overlap +'px)'
							contentsTransformOrigin = '50% 100%'
							contentsTransformOpened = 'translateY(-'+ config.height +'px) rotateX(' + -contentsAngle + 'deg)'

							// Position fallback:
							menuStyleClosed = { bottom: '-' + (config.height-config.overlap) + 'px' }
							menuStyleOpened = { bottom: '0px' }
							contentsStyleClosed = { top: '0px' }
							contentsStyleOpened = { top: '-' + config.height + 'px' }
							break

						default:
							// Primary transform:
							menuTransformOrigin = '100% 50%'
							menuTransformClosed = 'translateX(-100%) translateX('+ config.overlap +'px) scale(1.01) rotateY(' + -menuAngle + 'deg)'
							contentsTransformOrigin = '0 50%'
							contentsTransformOpened = 'translateX('+ config.width +'px) rotateY(' + -contentsAngle + 'deg)'

							// Position fallback:
							menuStyleClosed = { left: '-' + (config.width-config.overlap) + 'px' }
							menuStyleOpened = { left: '0px' }
							contentsStyleClosed = { left: '0px' }
							contentsStyleOpened = { left: config.width + 'px' }
							break
					}
				}

				/**
				 * The wrapper element holds the menu and contents.
				 */
				function setupWrapper() {
					// Add a class to allow for custom styles based on
					// position
					if (!FlipDiv.hasClass(dom.wrapper, 'flipDiv-' + config.position))
						FlipDiv.addClass(dom.wrapper, 'flipDiv-' + config.position)

					originalStyles.wrapper = dom.wrapper.style.cssText

					dom.wrapper.style[ FlipDiv.prefix('perspective') ] = '800px'
					dom.wrapper.style[ FlipDiv.prefix('perspectiveOrigin') ] = contentsTransformOrigin
				}

				/**
				 * The cover is used to obfuscate the contents while
				 * FlipDiv is open.
				 */
				function setupCover() {
					if (dom.cover)
						dom.cover.parentNode.removeChild(dom.cover)

					dom.cover = document.createElement('div')

					// Disabled until a falback fade in animation is added
					dom.cover.style.position = 'absolute'
					dom.cover.style.display = 'block'
					dom.cover.style.width = '100%'
					dom.cover.style.height = '100%'
					dom.cover.style.left = 0
					dom.cover.style.top = 0
					dom.cover.style.zIndex = 1000
					dom.cover.style.visibility = 'hidden'
					dom.cover.style.opacity = 0

					// Silence unimportant errors in IE8
					try {
						dom.cover.style.background = 'rgba(0, 0, 0, 0.4)'
						dom.cover.style.background = '-ms-linear-gradient('+ config.position +','+ config.gradient
						dom.cover.style.background = '-moz-linear-gradient('+ config.position +','+ config.gradient
						dom.cover.style.background = '-webkit-linear-gradient('+ config.position +','+ config.gradient
					} catch(e) {}

					if (supports3DTransforms)
						dom.cover.style[ FlipDiv.prefix('transition') ] = 'all ' + config.transitionDuration +' '+ config.transitionEasing

					dom.contents.appendChild(dom.cover)
				}

				/**
				 * The FlipDiv element that folds out upon activation.
				 */
				function setupMenu() {
					// Shorthand
					var style = dom.menu.style

					switch(config.position) {
						case POSITION_T:
							style.width = '100%'
							style.height = config.height + 'px'
						break

						case POSITION_R:
							style.right = '0'
							style.width = config.width + 'px'
							style.height = '100%'
						break

						case POSITION_B:
							style.bottom = '0'
							style.width = '100%'
							style.height = config.height + 'px'
						break

						case POSITION_L:
							style.width = config.width + 'px'
							style.height = '100%'
						break
					}

					originalStyles.menu = style.cssText

					style.position = 'fixed'
					style.display = 'block'

					if (supports3DTransforms) {
						style[ FlipDiv.prefix('transform') ] = menuTransformClosed
						style[ FlipDiv.prefix('transformOrigin') ] = menuTransformOrigin
						style[ FlipDiv.prefix('transition') ] = 'all ' + config.transitionDuration +' '+ config.transitionEasing
					} else
						FlipDiv.extend(style, menuStyleClosed)
				}

				/**
				 * The contents element which gets pushed aside while
				 * FlipDiv is open.
				 */
				function setupContents() {
					// Shorthand
					var style = dom.contents.style

					originalStyles.contents = style.cssText

					if (supports3DTransforms) {
						style[ FlipDiv.prefix('transform') ] = contentsTransformClosed
						style[ FlipDiv.prefix('transformOrigin') ] = contentsTransformOrigin
						style[ FlipDiv.prefix('transition') ] = 'all ' + config.transitionDuration +' '+ config.transitionEasing
					} else {
						style.position = style.position.match(/relative|absolute|fixed/gi) ? style.position : 'relative'
						FlipDiv.extend(style, contentsStyleClosed)
					}
				}

				/**
				 * Attaches all input event listeners.
				 */
				function bindEvents() {

					if ('ontouchstart' in window)
						if (config.touch.enabled || config.touch === true) {
							FlipDiv.bindEvent(document, 'touchstart', onTouchStart)
							FlipDiv.bindEvent(document, 'touchend', onTouchEnd)
						} else {
							FlipDiv.unbindEvent(document, 'touchstart', onTouchStart)
							FlipDiv.unbindEvent(document, 'touchend', onTouchEnd)
						}

					if (config.mouse) {
						FlipDiv.bindEvent(document, 'mousedown', onMouseDown)
						FlipDiv.bindEvent(document, 'mouseup', onMouseUp)
						FlipDiv.bindEvent(document, 'mousemove', onMouseMove)
					} else {
						FlipDiv.unbindEvent(document, 'mousedown', onMouseDown)
						FlipDiv.unbindEvent(document, 'mouseup', onMouseUp)
						FlipDiv.unbindEvent(document, 'mousemove', onMouseMove)
					}
				}

				/**
				 * Expands the menu.
				 */
				function open() {
					if (!isOpen) {
						isOpen = true

						FlipDiv.addClass(dom.wrapper, 'flipDiv-active')

						dom.cover.style.visibility = 'visible'

						// Use transforms and transitions if available...
						if (supports3DTransforms) {
							// 'webkitAnimationEnd oanimationend msAnimationEnd animationend transitionend'
							FlipDiv.bindEventOnce(dom.wrapper, 'transitionend', function() {
								FlipDiv.dispatchEvent(dom.menu, 'opened')
							})

							dom.cover.style.opacity = 1

							dom.contents.style[ FlipDiv.prefix('transform') ] = contentsTransformOpened
							dom.menu.style[ FlipDiv.prefix('transform') ] = menuTransformOpened
						} else {
							// ...fall back on JS animation
							menuAnimation && menuAnimation.stop()
							menuAnimation = FlipDiv.animate(dom.menu, menuStyleOpened, 500)
							contentsAnimation && contentsAnimation.stop()
							contentsAnimation = FlipDiv.animate(dom.contents, contentsStyleOpened, 500)
							coverAnimation && coverAnimation.stop()
							coverAnimation = FlipDiv.animate(dom.cover, { opacity: 1 }, 500)
						}

						FlipDiv.dispatchEvent(dom.menu, 'open')
					}
				}

				/**
				 * Collapses the menu.
				 */
				function close() {
					if (isOpen) {
						isOpen = false

						FlipDiv.removeClass(dom.wrapper, 'flipDiv-active')

						// Use transforms and transitions if available...
						if (supports3DTransforms) {
							// 'webkitAnimationEnd oanimationend msAnimationEnd animationend transitionend'
							FlipDiv.bindEventOnce(dom.wrapper, 'transitionend', function() {
								FlipDiv.dispatchEvent(dom.menu, 'closed')
							})

							dom.cover.style.visibility = 'hidden'
							dom.cover.style.opacity = 0

							dom.contents.style[ FlipDiv.prefix('transform') ] = contentsTransformClosed
							dom.menu.style[ FlipDiv.prefix('transform') ] = menuTransformClosed
						} else {
							// ...fall back on JS animation
							menuAnimation && menuAnimation.stop()
							menuAnimation = FlipDiv.animate(dom.menu, menuStyleClosed, 500)
							contentsAnimation && contentsAnimation.stop()
							contentsAnimation = FlipDiv.animate(dom.contents, contentsStyleClosed, 500)
							coverAnimation && coverAnimation.stop()
							coverAnimation = FlipDiv.animate(dom.cover, { opacity: 0 }, 500, function() {
								dom.cover.style.visibility = 'hidden'
								FlipDiv.dispatchEvent(dom.menu, 'closed')
							})
						}
						FlipDiv.dispatchEvent(dom.menu, 'close')
					}
				}

				/**
				 * Unbinds FlipDiv and resets the DOM to the state it
				 * was at before FlipDiv was initialized.
				 */
				function destroy() {
					dom.wrapper.style.cssText = originalStyles.wrapper
					dom.menu.style.cssText = originalStyles.menu
					dom.contents.style.cssText = originalStyles.contents

					if (dom.cover && dom.cover.parentNode)
						dom.cover.parentNode.removeChild(dom.cover)

					FlipDiv.unbindEvent(document, 'touchstart', onTouchStart)
					FlipDiv.unbindEvent(document, 'touchend', onTouchEnd)
					FlipDiv.unbindEvent(document, 'mousedown', onMouseDown)
					FlipDiv.unbindEvent(document, 'mouseup', onMouseUp)
					FlipDiv.unbindEvent(document, 'mousemove', onMouseMove)

					for (var i in addedEventListeners)
						this.removeEventListener(addedEventListeners[i][0], addedEventListeners[i][1])

					addedEventListeners = []
				}


				/// INPUT: /////////////////////////////////

				function onMouseDown(event) {
					isMouseDown = true
				}

				function onMouseMove(event) {
					// Prevent opening/closing when mouse is down since
					// the user may be selecting text
					if (!isMouseDown) {
						var x = event.clientX - indentX
						, y = event.clientY - indentY

						switch(config.position) {
							case POSITION_T:
								if (y > config.height)
									close()
								else if (y < config.threshold)
									open()
							break

							case POSITION_R:
								var w = dom.wrapper.offsetWidth
								if (x < w - config.width)
									close()
								else if (x > w - config.threshold)
									open()
							break

							case POSITION_B:
								var h = dom.wrapper.offsetHeight
								if (y < h - config.height)
									close()
								else if (y > h - config.threshold)
									open()
							break

							case POSITION_L:
								if (x > config.width)
									close()
								else if (x < config.threshold)
									open()
							break
						}
					}
				}

				function onMouseUp(event) {
					isMouseDown = false
				}

				function onTouchStart(event) {
					touchStartX = event.touches[0].clientX - indentX
					touchStartY = event.touches[0].clientY - indentY
					touchMoveX = null
					touchMoveY = null
					swipeStartedTime = new Date().getTime()

					FlipDiv.bindEvent(document, 'touchmove', onTouchMove)
				}

				function onTouchMove(event) {
					touchMoveX = event.touches[0].clientX - indentX
					touchMoveY = event.touches[0].clientY - indentY

					swipeMethod = null
					var edgeOnlyTouch = (config.touch === true || config.touch.edgeOnly === true) && !isOpen

					// Check for swipe gestures in any direction

					if (Math.abs(touchMoveY - touchStartY) < Math.abs(touchMoveX - touchStartX)) {
						if (config.swipeThreshold < touchStartX - touchMoveX && (dom.wrapper.offsetWidth - config.touchAreaThreshold < touchStartX || !edgeOnlyTouch))
							swipeMethod = onSwipeRight
						else if (config.swipeThreshold < touchMoveX - touchStartX && (touchStartX < config.touchAreaThreshold || !edgeOnlyTouch))
							swipeMethod = onSwipeLeft
					} else {
						if (config.swipeThreshold < touchStartY - touchMoveY && (dom.wrapper.offsetHeight - config.touchAreaThreshold < touchStartY || !edgeOnlyTouch))
							swipeMethod = onSwipeDown
						else if (config.swipeThreshold < touchMoveY - touchStartY && (touchStartY < config.touchAreaThreshold || !edgeOnlyTouch))
							swipeMethod = onSwipeUp
					}

					if (new Date().getTime() < swipeStartedTime + config.swipeCancelTimeout && swipeMethod && swipeMethod())
						event.preventDefault()
				}

				function onTouchEnd(event) {
					FlipDiv.unbindEvent(document, 'touchmove', onTouchMove)

					// If there was no movement this was a tap
					if (touchMoveX === null && touchMoveY === null && swipeMethod === null)
						onTap()
				}

				function onTap() {
					var isOverContent = (config.position === POSITION_T && touchStartY > config.height) ||
										(config.position === POSITION_R && touchStartX < dom.wrapper.offsetWidth - config.width) ||
										(config.position === POSITION_B && touchStartY < dom.wrapper.offsetHeight - config.height) ||
										(config.position === POSITION_L && touchStartX > config.width)

					if (isOverContent)
						close()
				}

				function onSwipeLeft() {
					if (config.position === POSITION_R && isOpen) {
						close()
						return true
					} else if (config.position === POSITION_L && !isOpen) {
						open()
						return true
					}
				}

				function onSwipeRight() {
					if (config.position === POSITION_R && !isOpen) {
						open()
						return true
					} else if (config.position === POSITION_L && isOpen) {
						close()
						return true
					}
				}

				function onSwipeUp() {
					if (config.position === POSITION_B && isOpen) {
						close()
						return true
					} else if (config.position === POSITION_T && !isOpen) {
						open()
						return true
					}
				}

				function onSwipeDown() {
					if (config.position === POSITION_B && !isOpen) {
						open()
						return true
					} else if (config.position === POSITION_T && isOpen) {
						close()
						return true
					}
				}


				/// API: ///////////////////////////////////

				return {
					configure: configure

					, open: open
					, close: close
					, destroy: destroy

					, isOpen: function() {
						return isOpen
					}

					/**
					 * Forward event binding to the menu DOM element.
					 */
					, addEventListener: function(type, listener) {
						addedEventListeners.push([type, listener])
						dom.menu && FlipDiv.bindEvent(dom.menu, type, listener)
					}
					, removeEventListener: function(type, listener) {
						dom.menu && FlipDiv.unbindEvent(dom.menu, type, listener)
					}
				}

			})()
		}

		/**
		 * Helper method, changes an element style over time.
		 */
		, animate: function(element, properties, duration, callback) {
			return (function() {
				// Will hold start/end values for all properties
				var interpolations = {}

				// Format properties
				for (var p in properties)
					interpolations[p] = {
						start: parseFloat(element.style[p]) || 0
						, end: parseFloat(properties[p])
						, unit: (typeof properties[p] === 'string' && properties[p].match(/px|em|%/gi)) ? properties[p].match(/px|em|%/gi)[0] : ''
					}

				var animationStartTime = Date.now()
				, animationTimeout

				// Takes one step forward in the animation
				function step() {
					// Ease out
					var progress = 1 - Math.pow(1 - ((Date.now() - animationStartTime) / duration), 5)

					// Set style to interpolated value
					for (var p in interpolations) {
						var property = interpolations[p]
						element.style[p] = property.start + ((property.end - property.start) * progress) + property.unit
					}

					// Continue as long as we're not done
					if (progress < 1)
						animationTimeout = setTimeout(step, 1000 / 60)
					else {
						callback && callback()
						stop()
					}
				}

				// Cancels the animation
				function stop() {
					clearTimeout(animationTimeout)
				}

				// Starts the animation
				step()


				/// API: ///////////////////////////////////

				return {
					stop: stop
				}
			})()
		}

		/**
		 * Extend object a with the properties of object b.
		 * If there's a conflict, object b takes precedence.
		 */
		, extend: function(a, b) {
			for (var i in b)
				a[ i ] = b[ i ]
		}

		/**
		 * Prefixes a style property with the correct vendor.
		 */
		, prefix: function(property, el) {
			var propertyUC = property.slice(0, 1).toUpperCase() + property.slice(1)
			, vendors = [ 'Webkit', 'Moz', 'O', 'ms' ]

			for (var i = 0, len = vendors.length; i < len; i++) {
				var vendor = vendors[i]

				if (typeof (el || document.body).style[ vendor + propertyUC ] !== 'undefined')
					return vendor + propertyUC
			}

			return property
		}

		/**
		 * Checks wether the target element has a class.
		 */
		, hasClass: function(element, name) {
			return element.className.search(name) != -1
		}

		/**
		 * Adds a class to the target element.
		 */
		, addClass: function(element, name) {
			element.className = element.className.replace(/\s+$/gi, '') + ' ' + name
		}

		/**
		 * Removes a class from the target element.
		 */
		, removeClass: function(element, name) {
			element.className = element.className.replace(name, '')
		}

		/**
		 * Adds an event listener in a browser safe way.
		 */
		, bindEvent: function(element, ev, fn) {
			if (element.addEventListener)
				element.addEventListener(ev, fn, false)
			else
				element.attachEvent('on' + ev, fn)
		}

		/**
		 * Removes an event listener in a browser safe way.
		 */
		, unbindEvent: function(element, ev, fn) {
			if (element.removeEventListener)
				element.removeEventListener(ev, fn, false)
			else
				element.detachEvent('on' + ev, fn)
		}

		, bindEventOnce: function (element, ev, fn) {
			var me = this
			var listener = function() {
				me.unbindEvent(element, ev, listener)
				fn.apply(this, arguments)
			}
			this.bindEvent(element, ev, listener)
		}

		/**
		 * Dispatches an event of the specified type from the
		 * menu DOM element.
		 */
		, dispatchEvent: function(element, type, properties) {
			if (element) {
				var event = document.createEvent('HTMLEvents', 1, 2)
				event.initEvent(type, true, true)
				FlipDiv.extend(event, properties)
				element.dispatchEvent(event)
			}
		}

		/**
		 * Retrieves query string as a key/value hash.
		 */
		, getQuery: function() {
			var query = {}

			location.search.replace(/[A-Z0-9]+?=([\w|:|\/\.]*)/gi, function(a) {
				query[ a.split('=').shift() ] = a.split('=').pop()
			})

			return query
		}

	}

	return FlipDiv

}));