/* ========================================================================
 * An implementation of AutoComPaste in HTML
 * ========================================================================
 * Copyright 2013 Wong Yong Jie
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

"use strict";

/**
 * Window manager module.
 * This module creates HTML-based draggable windows with textual content.
 *
 * The following is a usage example:
 *   var wm = new WindowManager();
 *   wm.createWindow('myWindow', 500); // Creates a window 500 pixels wide
 *   wm.setWindowTitle('myWindow', 'Hello world!'); // Sets the title to 'Hello world!'
 *   wm.moveWindowTo('myWindow', 50, 150); // Moves the window to coordinates (50, 150)
 *
 * @class WindowManager
 */
var WindowManager = (function () {

  /** Private variables */
  var privates = { };

  /**
   * The class constructor.
   *
   * Creates an instance of WindowManager on the display given by the
   * parameter display.
   *
   * A WindowManager "display" is analogous to a physical screen, except that
   * it exists within a specific container in the DOM. In other words, it's
   * like a virtual screen.
   *
   * In most cases, the display would be a CSS ID that identifies the element
   * to be used to create and draw all the windows. You can create multiple
   * instances of WindowManager, all acting on different displays as if they
   * were different screens.
   *
   * @param {String} display  The display to be used.
   */
  function WindowManager (display) {
    /** Member functions */

    /**
     * Creates a named window.
     * This places the named window into the display.
     *
     * The name of the window must be unique. If an existing window with the
     * same name exists, then this function returns false.
     *
     * The width and height of the window is optional. If not specified, then
     * the height will be determined by the contents of the window.
     *
     * @param {String} name   The name of the window
     * @param {Number} width  The width of the window, in pixels
     * @param {Number} height The height of the window, in pixels
     */
    this.createWindow = function createWindow (name, width, height) {
      if (name == undefined) {
        console.error("WindowManager.createWindow: name must be given");
        return false;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.createWindow: name must be a string");
        return false;
      }

      if (privates.windows[name] != undefined) {
        console.error("WindowManager.createWindow: window name is already used");
        return false;
      }

      // Width is optional, if not given, if fits the content.
      if (width != undefined) {
        if (isNaN (width)) {
          console.error("WindowManager.createWindow: width must be a number");
          return false;
        }

        if (width <= 0) {
          console.error("WindowManager.createWindow: width cannot be <= 0");
          return false;
        }
      }

      // Height is optional, if not given, it fits the content.
      if (height != undefined) {
        if (isNaN (height)) {
          console.error("WindowManager.createWindow: height must be a number");
          return false;
        }

        if (height <= 0) {
          console.error("WindowManager.createWindow: width cannot be <= 0");
          return false;
        }
      }
      
      // Create the new structure for the window.
      var win_struct = this._createWindowStruct ();
      privates.windows[name] = {
        struct: win_struct
      };

      // Set the position to 0, 0. Since we are using CSS transforms for 
      // window positions, this is not used in the end. But we need a reference
      // point.
      var wm = this;
      wm.moveWindowTo (name, 0, 0);
      $(win_struct).css({
        'top': 0,
        'left': 0
      });

      // Set the dimensions.
      if (width != undefined) {
        $(win_struct).css({
          'min-width': width + 'px',
          'width': width + 'px' 
        });
      }

      if (height != undefined) {
        var title_height = $(win_struct).find('.modal-header').height ();
        $(win_struct)
          .find('.modal-body')
          .css('height', (height - title_height) + 'px');
      }

      // Set window to focus on mouse down.
      $(win_struct).mousedown(function () {
        wm.setFocus(name);
      });

      // Create an event that allows windows to be dragged.
      $(win_struct).find('.modal-header')
        .mousedown(function (mousedown_event) {
          // Obtain the absolute coordinates of the display.
          var display_coords = $(privates.display_element).offset();
            
          // Compute the offset of the cursor from the top left corner of the
          // window.
          var cursor_rel_coords = $(privates.windows[name].struct).offset();
          cursor_rel_coords.left = mousedown_event.pageX - cursor_rel_coords.left;
          cursor_rel_coords.top = mousedown_event.pageY - cursor_rel_coords.top;

          // Drag move commences.
          $(window).mousemove(function (mousemove_event) {
            var win_x = mousemove_event.pageX - display_coords.left - cursor_rel_coords.left;
            var win_y = mousemove_event.pageY - display_coords.top - cursor_rel_coords.top - 30;
            wm.moveWindowTo(name, win_x, win_y);

            // Set dragging state.
            privates.dragging_active = true;
            $(privates.display_element).addClass('dragging-active');
          });

          // Prevent cursor from turning into a text selection cursor while
          // dragging.
          mousedown_event.originalEvent.preventDefault();
        })
        .mouseup(function () {
          var was_dragging = privates.dragging_active;
          $(window).unbind('mousemove');
          
          privates.dragging_active = false;
          $(privates.display_element).removeClass('dragging-active');
        });

      // Fire all registered events.
      this.dispatchEvent('windowcreated', {
        window: privates.windows[name],
        name: name
      });
      
      // Set the new window to be focused.
      wm.setFocus(name);
      return true;
    };

    /**
     * Sets the title of a window identified by name.
     *
     * All parameters are required. If the window does not exist, or if any of
     * the parameters are not valid, then this function returns false.
     *
     * @param {String} name  The name of the window
     * @param {String} title The title to be set
     *
     * @return {Boolean} Returns true on success.
     */
    this.setWindowTitle = function setWindowTitle (name, title) {
      // Check for name.
      if (name == undefined) {
        console.error("WindowManager.setWindowTitle: name must be given");
        return false;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.setWindowTitle: name must be a string");
        return false;
      }

      // Check for title.
      if (title == undefined) {
        console.error("WindowManager.setWindowTitle: title must be given");
        return false;
      }

      if (typeof title != 'string' && !(title instanceof String)) {
        console.error("WindowManager.setWindowTitle: title must be a string");
        return false;
      }

      if (!privates.windows[name]) {
        console.error("WindowManager.setWindowTitle: Window does not exist");
        return false;
      }

      // Fetch the window structure and set the title.
      var win_struct = privates.windows[name].struct;
      $(win_struct)
        .find('.modal-title')
        .empty()
        .append(title);

      return true;
    };

    /**
     * Moves a window specified by name to the specified position.
     *
     * All parameters are required. If the window does not exist, or if any of
     * the parameters are not valid, then this function returns false.
     *
     * It is possible to specify a position that is beyond the bounds of the
     * display. However, this function will detect this and constrain the
     * window to the bounds.
     *
     * Internal note: This does not actually alter the position of the window
     * (left, top) in the CSS. To maximize performance, the translate CSS3
     * property is used instead.
     *
     * @param {String} name The name of the window
     * @param {Number} x    The x position to move the window to
     * @param {Number} y    The y position to move the window to
     *
     * @return {Boolean} Returns true on success
     */
    this.moveWindowTo = function moveWindowTo (name, x, y) {
      // Check for name.
      if (name == undefined) {
        console.error("WindowManager.moveWindowTo: name must be given");
        return false;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.moveWindowTo: name must be a string");
        return false;
      }

      // Check for x and y.
      if (x == undefined || isNaN (x)) {
        console.error("WindowManager.moveWindowTo: x must be a number");
        return false;
      }

      if (y == undefined || isNaN (y)) {
        console.error("WindowManager.moveWindowTo: y must be a number");
        return false;
      }

      if (!privates.windows[name]) {
        console.error("WindowManager.moveWindowTo: Window does not exist");
        return false;
      }

      // Clip movement to the display bounds.
      var display_height = this.getDisplayHeight();
      var display_width = this.getDisplayWidth();
      var window_height = $(privates.windows[name].struct).height();
      var window_width = $(privates.windows[name].struct).width();
      var title_height = $(privates.windows[name].struct).find('.modal-header').height();

      // We keep the bounds 20 pixels smaller than the actual bounds, because
      // there needs to be space to keep the draggable region.
      var overflow_allowance = 20;
      var repositioned = false;

      // Right edge.
      if (x > display_width - overflow_allowance) {
        x = display_width - overflow_allowance;
        repositioned = true;
      }

      // Left edge.
      if (x < 0 - window_width + overflow_allowance) {
        x = 0 - window_width + overflow_allowance;
        repositioned = true;
      }

      // Bottom edge.
      if (y > display_height - title_height) {
        y = display_height - title_height;
        repositioned = true;
      }

      // Top edge.
      // This case is special, because we don't want the title to go out of 
      // bounds and become undraggable.
      if (y < 0 - title_height) {
        y = 0 - title_height;
        repositioned = true;
      }

      // Move the specified window.
      privates.windows[name].x = x;
      privates.windows[name].y = y;

      // Mark window as damaged.
      privates.damaged_windows.push(name);
      return true;
    };

    /**
     * Gets the position of a window specified by name.
     */
    this.getWindowPosition = function getWindowPosition (name) {
      if (name == undefined) {
        console.error("WindowManager.getWindowPosition: name must be given");
        return;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.getWindowPosition: name must be a string");
        return;
      }

      if (!privates.windows[name]) {
        console.error("WindowManager.getWindowPosition: Window does not exist");
        return;
      }

      // Read the transform property.
      var win_struct = privates.windows[name].struct;
      var transform_mat = $(win_struct).css('transform');
      if (transform_mat == 'none') {
        return;
      }
    
      transform_mat = transform_mat
        .replace(/^\w+\(/, "[")
        .replace(/\)$/, "]");
      transform_mat = JSON.parse(transform_mat);

      // The 5th and 6th elements of the matrix are the x and y coordinates
      // respectively.
      return {
        x: transform_mat[4],
        y: transform_mat[5]
      };
    };

    /**
     * Sets the content of a window specified by name.
     *
     * All parameters are required. If the window does not exist, or if any of
     * the parameters are not valid, then this function returns false.
     *
     * Content can be any type that can be appended, i.e. can be used with
     * $.append (). 
     *
     * @param {String} name    The name of the window
     * @param {Object} content The content to be set
     */
    this.setWindowContent = function setWindowContent (name, content) {
      if (name == undefined) {
        console.error("WindowManager.setWindowContent: name must be given");
        return;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.setWindowContent: name must be a string");
        return;
      }

      // Check content.
      if (content == undefined) {
        console.error("WindowManager.setWindowContent: content must be given");
      }

      if (!privates.windows[name]) {
        console.error("WindowManager.setWindowContent: Window does not exist");
        return;
      }

      // Set the content.
      $(privates.windows[name].struct)
        .find('.modal-body')
        .append(content);
    };

    /**
     * Gets the content of a window specified by name.
     *
     * @param {String} name   The name of the window
     * @return {Object} The window content
     */
    this.getWindowContent = function getWindowContent (name) {
      if (name == undefined) {
        console.error("WindowManager.getWindowContent: name must be given");
        return;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.getWindowContent: name must be a string");
        return;
      }

      if (!privates.windows[name]) {
        console.error("WindowManager.getWindowContent: Window does not exist");
        return;
      }

      return $(privates.windows[name].struct).find('.modal-body')[0];
    };

    /**
     * Retrieves the list of windows.
     *
     * @return {Array} An array containing the names of windows.
     */
    this.getWindowList = function getWindowList () {
      var windows = [];
      for (var window_name in privates.windows) {
        if (privates.windows.hasOwnProperty(window_name)) {
          windows.push(window_name);
        }
      }

      return windows;
    };

    /**
     * Sets the specified window to focus.
     *
     * All parameters are required. If the window does not exist, or if any of
     * the parameters are not valid, then this function returns false.
     *
     * Once set in focus, the window visually displays on top of all other
     * windows.
     *
     * @param {String} name The name of the window
     */
    this.setFocus = function setFocus (name) {
      if (name == undefined) {
        console.error("WindowManager.setFocus: name must be given");
        return;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.setFocus: name must be a string");
        return;
      }

      if (!privates.windows[name]) {
        console.error("WindowManager.setFocus: Window does not exist");
        return;
      }

      // Unfocus everything else.
      for (var window_name in privates.windows) {
        if (privates.windows.hasOwnProperty (window_name)) {
          $(privates.windows[window_name].struct).removeClass('wm-window-focused');
        }
      }

      // Obtain the window structure.
      var win_struct = privates.windows[name].struct;
      $(win_struct)
        .css('z-index', privates.z_index_next)
        .addClass('wm-window-focused');
      privates.z_index_next++;

      this.dispatchEvent('windowfocus', {
        name: name
      });
    };

    /**
     * Destroys the specified window.
     *
     * All parameters are required. If the window does not exist, or if any of
     * the parameters are not valid, then this function returns false.
     *
     * The window is removed from the control of WindowManager and no longer
     * exists on screen if this function is successful.
     *
     * @param {String} name The name of the window
     *
     * @return {Boolean} Returns true on success
     */
    this.destroyWindow = function destroyWindow (name) {
      if (name == undefined) {
        console.error("WindowManager.destroyWindow: name must be given");
        return false;
      }

      if (typeof name != 'string' && !(name instanceof String)) {
        console.error("WindowManager.destroyWindow: name must be a string");
        return false;
      }

      if (!privates.windows[name]) {
        console.error("WindowManager.destroyWindow: Window does not exist");
        return false;
      }

      // Remove window structure from DOM.
      var win_struct = privates.windows[name].struct;
      $(win_struct).remove();

      // Remove from our tracking table.
      delete privates.windows[name];
      this.dispatchEvent('windowdestroyed', {
        name: name
      });

      return true;
    };

    /**
     * Destroys all windows on screen.
     *
     * All parameters are required. If the window does not exist, or if any of
     * the parameters are not valid, then this function returns false.
     *
     * The window is removed from the control of WindowManager and no longer
     * exists on screen if this function is successful.
     *
     * @param {String} name The name of the window
     *
     * @return {Boolean} Returns true on success
     */
    this.destroyAllWindows = function destroyAllWindows () {
      for (var name in privates.windows) {
        this.destroyWindow(name); 
      }
    };

    /**
     * Gets the number of active windows.
     * This number excludes windows that have been destroyed (hence 'inactive').
     *
     * @return {Number} Returns the number of active windows.
     */
    this.getNumWindows = function getNumWindows () {
      var count = 0;
      for (var win in privates.windows) {
        if (privates.windows.hasOwnProperty(win)) {
          count++;
        }
      }
      
      return count;
    };

    /**
     * Gets the height of the display.
     *
     * @return {Number} Returns the height of the display
     */
    this.getDisplayHeight = function getDisplayHeight () {
      return $(privates.display_element).height();
    };

    /**
     * Gets the width of the display.
     *
     * @return {Number} Returns the width of the display
     */
    this.getDisplayWidth = function getDisplayWidth () {
      return $(privates.display_element).width();
    };

    this.addEventListener = function addEventListener (name, handler) {
      if (privates.events.hasOwnProperty(name)) {
        privates.events[name].push(handler);
      } else {
        privates.events[name] = [handler];
      }
    };

    this.removeEventListener = function removeEventListener (name, handler) {
      if (!privates.events.hasOwnProperty(name)) {
        return;
      }

      var index = privates.events[name].indexOf(handler);
      if (index != -1) {
        privates.events[name].splice (index, 1);
      }
    };

    this.dispatchEvent = function dispatchEvent (name, event_data) {
      if (!privates.events.hasOwnProperty(name)) {
        return;
      }

      var evs = privates.events[name];
      for (var i = 0; i < evs.length; i++) {
        evs[i].apply(null, [event_data]);
      }
    };

    /** Internal functions */
    this._render = function _render () {
      // Check if render region was resized.
      var curr_actual_width = $(privates.display_element).width();
      var curr_actual_height = $(privates.display_element).height();

      if (privates.display_width != curr_actual_width ||
          privates.display_height != curr_actual_height) {
        // Update the height and width.
        privates.display_width = curr_actual_width;
        privates.display_height = curr_actual_height;
        this._handleResizeEvent(curr_actual_width, curr_actual_height);
      }
      
      // Figure out which windows are damaged and re-render.
      for (var i = 0; i < privates.damaged_windows.length; i++) {
        var window_name = privates.damaged_windows[i];
        var wd = privates.windows[window_name];
        if (wd) {
          var x = wd.x;
          var y = wd.y;
          $(privates.windows[window_name].struct).css(
            "transform", "translate(" + x + "px, " + y + "px)"
          );
        }
      }
    };

    this._createWindowStruct = function _createWindowStruct () {
      var win = $(document.createElement('div'))
        .addClass('modal-dialog')
        .addClass('wm-window')
        .append($(document.createElement('div'))
          .addClass('modal-content')
          .append($(document.createElement('div'))
              .addClass('modal-header')
              .append($(document.createElement('h4'))
                  .addClass('modal-title')))
          .append($(document.createElement('div'))
              .addClass('modal-body')));

      $(privates.display_element).append(win);
      return win[0];
    };

    this._getWindowCSSId = function _getWindowCSSId (name) {
      return privates.display + '-' + name;
    };

    this._handleResizeEvent = function _handleResizeEvent () {
      // During a resize, a window may be moved outside the render region.
      // To fix this, we apply a simple fix. For all windows, move the window
      // to its current position.
      for (var name in privates.windows) {
        if (privates.windows.hasOwnProperty(name)) {
          var win_pos = this.getWindowPosition(name);
          if (win_pos != undefined) {
            this.moveWindowTo(name, win_pos.x, win_pos.y);
          }
        }
      }
    };

    /** Constructor */
    if (display == undefined) {
      console.error("WindowManager: display must be given");
      return false;
    }

    if (typeof display != 'string' && !(name instanceof String)) {
      console.error("WindowManager: display must be a string");
      return false;
    }

    // Initialize private variables.
    privates.display = display;
    privates.windows = { };
    privates.damaged_windows = [ ];
    privates.dragging_active = false;
    privates.z_index_next = 1;
    privates.events = { };
    privates.switcher_windows = { };

    // Locate the div to display our windows in.
    privates.display_element = document.getElementById(display);
    if (!privates.display_element) {
      console.error("WindowManager: failed to open display \"" + display + "\"");
      return;
    }

    privates.display_height = $(privates.display_element).height();
    privates.display_width = $(privates.display_element).width();

    // Set up the CSS of the display element.
    // This ensures that windows won't overflow outside the display.
    $(privates.display_element).css({
      'position': 'relative',
      'overflow': 'hidden'
    });

    // Begin the 60 fps render loop.
    setInterval(this._render.bind(this), 16);
  }

  return WindowManager;

})();

/* vim: set ts=2 sw=2 et: */
