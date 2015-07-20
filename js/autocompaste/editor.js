/* ========================================================================
 * An implementation of AutoComPaste in HTML
 * ========================================================================
 * Copyright 2015 Wong Yong Jie and Tay Yang Shun
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

var AutoComPaste = AutoComPaste || { };

/**
 * Editor module.
 * This module turns a normal textarea into an AutoComPaste powered one.
 *
 * @class Editor
 */
AutoComPaste.Editor = (function () {

  /** Private variables */
  var privates = { };

  /**
   * The class constructor.
   *
   * @param {Object} textarea  The textarea to transform.
   */
  function Editor (textarea, engine) {
    /**
     * Sets the maximum width of the autocompletion list.
     *
     * @param {Number} width The maximum width of the autocompletion list
     */
    this.setCompletionListMaxWidth = function setCompletionListMaxWidth (width) {
      if (!isNaN (width)) {
        console.error ("Editor.setCompletionListMaxWidth: width must be a number");
        return;
      }

      if (width <= 0) {
        console.error ("Editor.setCompletionListMaxWidth: width cannot be <= 0");
        return;
      }

      privates.clist_max_width = width;
    };

    /**
     * Gets the maximum width of the autocompletion list.
     *
     * @return {Number}
     */
    this.getCompletionListMaxWidth = function getCompletionListMaxWidth () {
      return privates.clist_max_width;
    };

    /**
     * Sets the maximum height of the autocompletion list.
     *
     * @param {Number} height The maximum height of the autocompletion list
     */
    this.setCompletionListMaxHeight = function setCompletionListMaxHeight (height) {
     if (!isNaN (height)) {
       console.error ("Editor.setCompletionListMaxHeight: height must be a number");
       return;
     }

     if (height <= 0) {
       console.error ("Editor.setCompletionListMaxHeight: height cannot be <= 0");
       return;
     }

     privates.clist_max_height = height;
    };

    /**
     * Gets the maximum height of the autocompletion list.
     * 
     * @return {Number}
     */
    this.getCompletionListMaxHeight = function getCompletionListMaxHeight () {
     return privates.clist_max_height;
    };

    /** Internal functions */

    /**
     * Measures the length of the text in the textbox in pixels.
     *
     * This function was implemented because there was no way to obtain the
     * distance of the caret away from the edge of the box.
     *
     * It works as follows:
     *   1) Create a new hidden div with automatic width and height
     *   2) Copy the contents of the textarea into the div
     *   3) Measure the width of the div
     *
     * The width of the div measured is hence (approximately) the distance
     * from the caret to the edge of the textarea.
     *
     * @param {String} text Text to be measured.
     * @return {Number} The width of the text measured.
     */
    this._measureTextLengthInPixels = function _measureTextLengthInPixels (
        text) {
      // Create a div to measure the element in the DOM.
      var div = this._createMeasurementDiv ('text-length-in-pixels');
      $(div).css ({
        'height': 'auto',
        'width': 'auto'
      });

      div.innerHTML = text;

      // Measure the width of the box.
      var width = $(div).width ();

      return width;
    };

    /**
     * Measure the number of lines an actual line is wrapped over in a 
     * textarea. Line wraps in textareas are not represented by '\r\n' or any
     * other standard EOL characters, hence this function is required.
     *
     * It works as follows:
     *   1) Create a new hidden div with automatic height
     *   2) Set width of hidden div to the width of the textarea
     *   3) Measure the height of the div when it has only a single line
     *   4) Copy the contents of the textarea into the div
     *   5) Measure the height of the div
     *   6) Number of lines = height of div with contents of textarea divided
     *      by the height of div with only single line
     *
     * @param {String} text Text to be measured.
     * @return {Number} The number of lines occupied by the text.
     */
    this._measureNumWrappedLines = function _measureNumWrappedLines (text,
        with_scrollbars) {
      if (with_scrollbars === undefined) {
        with_scrollbars = false;
      }

      // Create a div to measure the element in the DOM.
      var div = this._createMeasurementDiv ('num-wrapped-lines');
      $(div).css ({
        'height': 'auto',
        'width': $(privates.textarea).innerWidth (),
        'overflow-y': with_scrollbars ? 'scroll' : 'hidden'
      });

      // Measure the height of the box for a single line.
      var single_height = this._getSingleLineHeight ();

      // Measure the height of the box with the text contents.
      div.innerHTML = text;
      var height = $(div).height ();

      // Compute the number of lines.
      var num_lines = Math.round (height / single_height);
      return num_lines;
    };

    this._getSingleLineHeight = function _getSingleLineHeight () {
      // Create a div to measure the element in the DOM.
      var div = this._createMeasurementDiv ('get-single-line-height');
      $(div).css ({
        'width': 'auto',
        'height': 'auto'
      });

      // Measure the height of the box for a single line.
      div.innerHTML = 'I';
      var height = $(div).height ();

      return height;
    };

    /**
     * Creates a div to be used for measurement.
     *
     * This copies all the styles from the textarea to the measurement div,
     * such that the div would like as identical as possible to the textarea.
     * Then we can use the div to guess the dimensions of the textarea.
     *
     * Creation of a measurement div is somewhat computationally intensive
     * because it requires 
     * To save resources, the creation of a named measurement div is possible.
     * Just specify the name of the named div. 
     *
     * @param {String} name The name of the measurement div to be created
     */
    this._createMeasurementDiv = function _createMeasurementDiv (name) {
      // If name is specified, and it exists in the DOM already, return that.
      var div_name = 'autocompaste-measure-' + name;
      if (name != undefined &&
          (typeof name == 'string' || name instanceof String) &&
          document.getElementById (div_name) != null) {
        $('#' + div_name).empty ();
        return document.getElementById (div_name);
      }

      // Create a div to measure the element in the DOM.
      var div = document.createElement ('div');
      $(div).css ({
        'position': 'absolute',
        'visibility': 'hidden',
        'word-wrap': 'break-word',
        'white-space': 'pre-wrap'
      });

      // Copy the textarea styles to the div.
      // TODO: getComputedStyle is SLOW as it forces layout. Could cache this
      // entry in the future.
      var computed_styles = getComputedStyle (privates.textarea);
      $(div).css ({
        'font': computed_styles.font,
        'letter-spacing': computed_styles.letterSpacing,
        'line-height': computed_styles.lineHeight,
        'padding': computed_styles.padding,
        'box-sizing': computed_styles.boxSizing
      });
      
      // For named divs: create an ID.
      if (name != undefined &&
          (typeof name == 'string' || name instanceof String)) {
        $(div).attr ('id', 'autocompaste-measure-' + name);
      }

      $(document.body).append (div);
      return div;
    };

    /**
     * Obtains the current caret x coordinate in the textarea in pixels.
     * The position is measured relative to the top-left corner of the textarea.
     *
     * @return {Object} An object containing the current caret position.
     */
    this._getCaretXPosition = function _getCaretXPosition () {
      // Locate the stuff before the caret.
      var textarea = privates.textarea;
      var text_before_caret = textarea.value.substring (
          0, textarea.selectionStart);
      var lines_before_caret = text_before_caret.split (/r?\n/);

      // Obtain the index of the current line.
      var curr_line_idx = textarea.value.lastIndexOf (
          '\n', textarea.selectionStart - 1);
      var curr_line = textarea.value.substring (curr_line_idx + 1,
          textarea.selectionStart);
     
      // Check if we have scrollbars, the measurements are different. 
      var with_scrollbars = false;
      if (textarea.clientHeight < textarea.scrollHeight) {
        with_scrollbars = true;
      }

      // Check if we have wrapped.
      // This works by removing all lines except the last one.
      for (var i = 0; i < curr_line.length; i++) {
        if (this._measureNumWrappedLines (curr_line.substring (0, i + 1), with_scrollbars) > 1) {
          var curr_wrapped_line = curr_line.substring (0, i);

          // Match possible breaking characters.
          var trim_index_space = curr_wrapped_line.lastIndexOf (' ');
          var trim_index_dash = curr_wrapped_line.lastIndexOf ('-');
          var trim_index = Math.max (trim_index_space, trim_index_dash);
          if (trim_index == -1) {
            trim_index = i;
          }

          // Trim the line.
          curr_wrapped_line = curr_wrapped_line.substring (0, trim_index);

          // Discard processed stuff.
          curr_line = curr_line.substring (trim_index + 1);
          i = 0;
        }
      }

      return this._measureTextLengthInPixels (curr_line);
    };

    /**
     * Obtains the current caret y coordinate in the textarea in pixels.
     * The position is measured relative to the top-left corner of the textarea.
     *
     * Scrolling is taken into account in this case. 
     *
     * @return {Object} An object containing the current caret position.
     */
    this._getCaretYPosition = function _getCaretYPosition () {
      // TODO: Improve performance of this.
      // Locate the stuff before the caret.
      var text_before_caret = privates.textarea.value.substring (
          0, privates.textarea.selectionStart);
      var lines_before_caret = text_before_caret.split (/\r?\n/);

      // Check if we have scrollbars, the measurements are different. 
      var with_scrollbars = false;
      if (textarea.clientHeight < textarea.scrollHeight) {
        with_scrollbars = true;
      }

      // Obtain the y-coordinate of the caret.
      var total_lines = lines_before_caret.length;
      for (var i = 0; i < lines_before_caret.length; i++) {
        var line = lines_before_caret[i];
        var num_wrapped_lines = this._measureNumWrappedLines (line, with_scrollbars);

        // _measureNumWrappedLines returns 0 for empty lines. So we account for
        // this here.
        if (line.length !== 0) {
          total_lines += num_wrapped_lines - 1;
        }
      }

      // TODO: This has some bug on empty lines (the cursor appears one line
      // lower. Not a huge issue, though.
      var scroll_top = privates.textarea.scrollTop;
      var position_abs = total_lines * this._getSingleLineHeight ();
      return position_abs - scroll_top;
    };

    /**
     * Obtains the current caret position in the textarea in pixels.
     * The position is measured relative to the top-left corner of the textarea.
     *
     * The returned value is an object containing two properties, x and y.
     *
     * @return {Object} An object containing the current caret position.
     */
    this._getCaretPosition = function _getCaretPosition () {
      // Initialize to invalid values.
      var caret_position = { x: -1, y: -1 };

      // Obtain the coordinates of the caret.
      caret_position.x = this._getCaretXPosition ();
      caret_position.y = this._getCaretYPosition ();

      return caret_position;
    };

    /**
     * Creates the element for the completion list.
     *
     * @return {HTMLUListElement}
     */
    this._createCompletionList = function _createCompletionList () {
      var completion_list = $(document.createElement ('div'))
          .attr ('id', 'autocompaste-completion')
          .addClass ('dropdown')
          .append ($(document.createElement ('ul'))
            .attr ('id', 'autocompaste-completion-list')
            .addClass ('dropdown-menu')
            .css ('max-height', privates.clist_max_height + 'px'));

      return completion_list[0];
    };

    /**
     * Gets the current sentence of where the caret is at.
     *
     * @return {String}
     */
    this._getCurrentSentence = function _getCurrentSentence () {
      var bounds = this._getCurrentSentenceBounds ();
      if (bounds == undefined) {
        return bounds;
      }

      return textarea.value.substring (bounds.start, bounds.end);
    };

    /**
     * Returns the bounds of the current sentence.
     *
     * The bounds returned are indices relative to the start of the value in 
     * the textarea. Sentences are identified by delimiters such as ".", "?"
     * and "!" (see full list in the code).
     *
     * @return {Object} An object containing the bounds
     */
    this._getCurrentSentenceBounds = function _getCurrentSentenceBounds () {
      var textarea = privates.textarea;
      var caret_position = textarea.selectionStart;
      var line_begin = textarea.value.lastIndexOf ('\n', caret_position - 1);
      var text_before_caret = textarea.value.substring (line_begin, caret_position);

      // Search for sentence terminators.
      var prev_fullstop = text_before_caret.lastIndexOf ('.');
      var prev_question = text_before_caret.lastIndexOf ('?');
      var prev_exclaim = text_before_caret.lastIndexOf ('!');
      var prev_position = Math.max (
          prev_fullstop + 1,
          prev_question + 1,
          prev_exclaim + 1
      );

      // Extract the sentence.
      var sentence = textarea.value.substring (
          prev_position + line_begin + 1,
          caret_position
      );

      // Find the bounds after trimming away spaces.
      var delta = sentence.length - sentence.replace (/^\s+/, "").length;

      // Compute the bounds.
      var bounds = {
        start: prev_position + line_begin + delta + 1,
        end: caret_position
      };

      if (bounds.end - bounds.start == 1) {
        return undefined;
      }

      return bounds;
    };

    /**
     * Fills up the completion list with suggestions obtained from the ACP
     * engine.
     *
     * If the suggestions list if empty, then the completion list will not be
     * shown. Otherwise, it is populated with the matched sentence.
     *
     * @param {Array} suggestions The list of suggestions
     */
    this._fillCompletionList = function _fillCompletionList (suggestions) {
      if (suggestions == undefined) {
        console.error ("Editor._fillCompletionList: The suggestions list is undefined");
        return;
      }

      if (typeof suggestions != 'object' || !(suggestions instanceof Array)) {
        console.error ("Editor._fillCompletionList: The suggestions list must be an array");
        return;
      }

      // Obtain the completion list.
      var clist = privates.clist;
      var clist_ul = document.getElementById ('autocompaste-completion-list');
      var editor = this;
      $(clist_ul).empty ();

      // Hide the suggestions list if it is empty.
      if (suggestions.length == 0) {
        this._hideCompletionList ();
        return;
      }

      // Insert the suggestions into the list.
      for (var i = 0; i < suggestions.length; i++) {
        var sentence = suggestions[i].sentence;

        // Sentence highlighter.        
        sentence = sentence.substring (0, suggestions[i].start) + 
            $(document.createElement ('strong')).append (
                sentence.substring (suggestions[i].start, suggestions[i].end)
            )[0].outerHTML +
            sentence.substring (suggestions[i].end);

        // Adds the item into the completion list.
        $(clist_ul)
          .append ($(document.createElement ('li'))
              .append ($(document.createElement ('a'))
                  .css ('max-width', privates.clist_max_width + 'px')
                  .append (sentence)
                  .on ('mousemove', function (mousemove_event) {
                    var items = $(privates.clist).find ('a');

                    for (var i = 0; i < items.length; i++) {
                      if (items[i] == mousemove_event.target) {
                        break;
                      }
                    }

                    editor._focusOnCompletionListItem (i);
                    mousemove_event.preventDefault ();
                  })
                  .on ('click', function (click_event) {
                    editor._completeWithFocusedItem ();
                    $(privates.textarea).focus ();
                  })));

        // Focus the appropriate item.
        var items = $(privates.clist).find ('a');
        $(items[privates.clist_focused_item]).addClass ('focused');
      }

      // Display the list.
      privates.clist_focused_item = 0;
      this._showCompletionList ();
    };

    /**
     * Hides the completion list.
     */
    this._hideCompletionList = function _hideCompletionList () {
      $(privates.clist).hide ();
      privates.clist_shown = false;
    };

    /**
     * Shows the completion list.
     */
    this._showCompletionList = function _showCompletionList () {
      $(privates.clist).show ();
      privates.clist_shown = true;
    };

    /**
     * Sets focus on a completion list item based on index.
     *
     * If the index is out of bounds, then it is co-erced to the closes value
     * that is within bounds. That is, if the index is negative, then the
     * focus will be set to the first item. If the index is >= the length of
     * the suggestion list, then the focus will be set to the last item.
     *
     * @param {Number} index The index to be focused
     */
    this._focusOnCompletionListItem = function _focusOnCompletionListItem (index) {
      var items = $(privates.clist).find ('a').removeClass ('focused');

      // Do some index checking.
      if (index >= items.length) {
        index = items.length - 1;
      }

      if (index < 0) {
        index = 0;
      }
      
      $(items[index]).addClass ('focused');
      privates.clist_focused_item = index;
    };

    /**
     * Returns true if the completion list is hidden.
     *
     * @return {Boolean}
     */
    this._isCompletionListHidden = function _isCompletionListHidden () {
      return privates.clist_shown;
    };

    /** Constructor */
    if (textarea == undefined) {
      console.error ("Editor: textarea must be given");
      return false;
    }

    if (textarea instanceof jQuery) {
      textarea = textarea[0];
    }

    if (!(textarea instanceof HTMLTextAreaElement)) {
      console.error ("Editor: textarea must be a HTML textarea or a " +
          "corresponding wrapped jQuery object.");
    }

    if (engine == undefined) {
      console.error ("Interface: engine must be given");
      return;
    }

    if (typeof engine != 'object' && !(engine instanceof AutoComPaste.Engine)) {
      console.error ("Interface: engine must be of type AutoComPaste.Engine");
      return;
    };

    this._completeWithFocusedItem = function _completeWithFocusedItem () {
      var bounds = this._getCurrentSentenceBounds();
      if (bounds == undefined) {
        console.error ("Sentence bounds is undefined! There may be an issue...");
        return;
      }

      var textarea_value = privates.textarea.value;
      var suggestion = privates.clist_suggestions[privates.clist_focused_item];
      var new_value = textarea_value.substring(0, bounds.start) +
        suggestion.sentence + ' ' +
        textarea_value.substring(bounds.end);
      privates.textarea.value = new_value;
      this._hideCompletionList();

      // Set the new caret position.
      var caret_position = bounds.start + suggestion.sentence.length + 1;
      privates.textarea.setSelectionRange(caret_position, caret_position);

      // Save the next item.
      var suggestion = privates.clist_suggestions[privates.clist_focused_item];
      var next_suggestion = privates.engine.getSentenceFromIndex(suggestion.id, suggestion.index + 1);
      privates.clist_next = next_suggestion;
    };

    /** Private variables */
    privates.textarea = textarea;
    privates.engine = engine;

    privates.clist_max_width = 300;
    privates.clist_max_height = 200;
    privates.clist_shown = false;
    privates.clist_focused_item = 0;
    privates.clist_suggestions = [];
    privates.clist_next = undefined;
    privates.clist_append_start = -1;
    privates.clist_append_stack = [];
    privates.clist = this._createCompletionList ();

    // Set up events for the textarea box.
    var editor = this;
    privates.textarea.addEventListener ('input', function (input_event) {
      // Identify the current sentence.
      var sentence = editor._getCurrentSentence ();
      if (sentence != undefined) {
        // Search for suggestions.
        privates.clist_suggestions = privates.engine.search (sentence.trim ());
        
        // Move the completion box to the correct location.
        var position = editor._getCaretPosition ();
        var offset = $(this).offset ();

        $('#autocompaste-completion').css ({
          'left': (position.x + offset.left) + 'px',
          'top': (position.y + offset.top) + 'px'
        });

        // Populate completion list with suggestions.
        editor._fillCompletionList (privates.clist_suggestions);

      } else {
        editor._hideCompletionList ();

      }

    }, false);

    privates.textarea.addEventListener ('keydown', function (keydown_event) {
      if (privates.clist_shown) {
        if (!/^(38|40|27|13|37|39|9)$/.test (keydown_event.keyCode)) {
          return;
        }

        // Escaping!
        if (keydown_event.keyCode == 27) {
          editor._hideCompletionList ();
          return;
        }

        // Enter is pressed...
        if (keydown_event.keyCode == 13) {
          editor._completeWithFocusedItem ();
        }

        // Going down!
        // Down, right and tab.
        if (/^(40|37)$/.test (keydown_event.keyCode) ||
            (keydown_event.keyCode == 9 && !keydown_event.shiftKey)) {
          editor._focusOnCompletionListItem (++privates.clist_focused_item);

          var clist_ul = $(privates.clist).find ('ul')[0];
          var items = $(privates.clist).find ('a');
          var item = items[privates.clist_focused_item];
          clist_ul.scrollTop = item.offsetTop - ($(clist_ul).height () / 2);
        }

        // Going up (or left)!
        if (/^(38|39)$/.test (keydown_event.keyCode) ||
            (keydown_event.keyCode == 9 && keydown_event.shiftKey)) {
          editor._focusOnCompletionListItem (--privates.clist_focused_item);
          
          var clist_ul = $(privates.clist).find ('ul')[0];
          var items = $(privates.clist).find ('a');
          var item = items[privates.clist_focused_item];
          clist_ul.scrollTop = item.offsetTop - ($(clist_ul).height () / 2);
        }

        // Don't move the textbox caret!
        keydown_event.preventDefault();

      } else {
        if (!/^(37|39)$/.test (keydown_event.keyCode)) {
          return;
        }

        // Pressing right when the list is not shown triggers sentence
        // completion mode.
        if (keydown_event.keyCode == 39 && privates.clist_next != undefined) {
          var textarea = privates.textarea;
          var caret_position = textarea.selectionStart;

          // Save current version to the insertion stack.
          privates.clist_append_start = textarea.value.length;
          privates.clist_append_stack.push ({
            'value': textarea.value,
            'caret_position': caret_position
          });

          // Append next sentence.
          var new_value = textarea.value.substring (0, caret_position) +
                            privates.clist_next.sentence + ' ' +
                            textarea.value.substring(caret_position);

          textarea.value = new_value;
          caret_position += privates.clist_next.sentence.length + 1; // +1 for the space
          textarea.setSelectionRange (caret_position, caret_position);

          // Look up the next sentence.
          privates.clist_next = privates.engine.getSentenceFromIndex(
            privates.clist_next.id,
            ++privates.clist_next.index
          );
          
          keydown_event.preventDefault();
        }

        // Pressing left when the list is not shown triggers sentence
        // completion undo mode.
        if (keydown_event.keyCode == 37) {
          if (privates.clist_append_stack.length > 0) {
            var textarea = privates.textarea;
            var append_info = privates.clist_append_stack.pop ();
            textarea.value = append_info.value;
            textarea.setSelectionRange (append_info.caret_position,
                append_info.caret_position);
            
            // Look up the previous sentence.
            privates.clist_next = privates.engine.getSentenceFromIndex (
                privates.clist_next.id,
                --privates.clist_next.index
            );

            keydown_event.preventDefault ();

          } else {
            privates.clist_next = undefined;
            privates.clist_append_start = -1;
          }
        }
      }
    });

    // Add the autocompletion box into the DOM.
    $(document.body).append (privates.clist);
  };

  return Editor;

}) ();

/* vim: set ts=2 sw=2 et: */
