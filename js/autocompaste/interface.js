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
 * Interface module.
 *
 * @class Interface
 */
AutoComPaste.Interface = (function () {

  /** Private variables */
  var privates = { };

  /**
   * The class constructor.
   */
  function Interface (wm, engine, texts_json) {
    /** Internal functions */
    this._showError = function _showerror() {
      document.getElementById('error-overlay').style.display = 'block';
    };

    this._fetchTexts = function _fetchTexts () {
      $.ajax (privates.texts_json, {
        dataType: 'json',
        error: this._fetchTextsError,
        success: this._fetchTextsSuccess
      });
    };

    this._fetchTextsError = function _fetchTextserror(jqxhr, text_status, error_thrown) {
      iface._showerror();
      console.error("Interface._fetchTextsError: Unable to parse text sources: " + text_status);
      console.error("Interface._fetchTextsError: Additional info: " + error_thrown);
    };

    this._fetchTextsSuccess = function _fetchTextsSuccess (data, text_status, jqxhr) {
      // Check the sanity of data.
      if (!Array.isArray (data)) {
        iface._showerror();
        console.error("Interface._fetchTextsSuccess: Unable to parse text sources: data is not an array");
        return;
      }

      // Fetch each text and process.
      privates.texts_available = data.length;
      for (var i = 0; i < data.length; i++) {
        iface._fetchText (data[i]);
      }
    };

    this._fetchText = function _fetchText (text_source) {
      // Verify if the text_text_source object has all the required properties.
      if (typeof text_source != 'object') {
        console.error("Interface._fetchText: Unable to process text source. Additional info: ");
        console.error(text_source);
        return;
      }

      if (!text_source.hasOwnProperty('title')) {
        console.error("Interface._fetchText: Source must have a title. Additional info: ");
        console.error(text_source);
        return;
      }

      if (!text_source.hasOwnProperty('url')) {
        console.error("Interface._fetchText: Source must have a url. Additional info: ");
        console.error(text_source);
        return;
      }

      var iface = this;
      $.ajax(text_source.url, {
        complete: function (jqxhr, text_status) {
          return iface._fetchTextComplete (jqxhr, text_status, iface);
        },
        dataType: 'text',
        error: this._fetchTextError,
        success: function (data, text_status, jqxhr) {
          return iface._fetchTextSuccess (data, text_status, jqxhr, text_source);
        }
      });
    };

    this._fetchTextComplete = function _fetchTextComplete (jqxhr, text_status, iface) {
      privates.texts_returned++;
      if (privates.texts_returned == privates.texts_available) {
        // At this point, we have all the texts already.
        // Begin constructing the UI.
        //
        // For every text that we find, we create a new window for it.
        console.log("Interface._fetchTextComplete: Finished fetching all texts");

        for (var text_title in privates.texts) {
          if (privates.texts.hasOwnProperty(text_title)) {
            console.log("Interface._fetchTextComplete: Creating window for text \"" + text_title + "\"");
            iface._createWindowForText(text_title);
          }
        }

        // Create a text editor window.
        var acp_textarea = $(document.createElement('textarea'))
                            .addClass('autocompaste-textarea')
                            .attr({
                              rows: 10,
                              cols: 40
                            });

        //  For ACP mode, engine is passed into the interface. 
        //  Initialize the interface with the engine.
        if (privates.engine) {
          for (var text_title in privates.texts) {
            if (privates.texts.hasOwnProperty(text_title)) {
              console.log("Interface._fetchTextComplete: Adding text \"" + text_title + "\" to ACP engine");
              privates.engine.addToIndex(text_title, privates.texts[text_title]);
            }
          }
          acp_textarea.autocompaste(privates.engine);
        }

        privates.wm.createWindow("text_editor");
        privates.wm.setWindowTitle("text_editor", "Text Editor");
        privates.wm.setWindowContent('text_editor', acp_textarea);
        acp_textarea.focus();

        // Dispatch an event.
        iface.dispatchEvent('loaded');
      }
    };

    this._fetchTextError = function _fetchTexterror (jqxhr, text_status, error_thrown) {
      iface._showerror();
      console.error("Interface._fetchTextError: Unable to retrieve source: " + this.url);
    };

    this._fetchTextSuccess = function _fetchTextsSuccess (data, text_status, jqxhr, text_source) {
      console.log("Interface._fetchTextSuccess: Retrieved source: " + text_source.url);
      privates.texts[text_source.title] = data;
    };

    this._createWindowForText = function _createWindowForText (text_title) {
      
      privates.wm.createWindow(text_title, 500, 400);
      privates.wm.setWindowTitle(text_title, text_title);
      privates.wm.setWindowContent(text_title,
        $(document.createElement('pre'))
          .append(privates.texts[text_title])
          .css('white-space', 'pre-word')
      );

      // Position the window randomly.
      //
      // safety_bounds ensures that the window is at least some pixels within 
      // the boundaries of the display.
      var safety_bounds = 50;
      privates.wm.moveWindowTo(text_title,
        Math.random() * (privates.wm.getDisplayWidth() - safety_bounds) + (safety_bounds / 2),
        Math.random() * (privates.wm.getDisplayHeight() - safety_bounds) + (safety_bounds / 2)
      );
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
        privates.events[name].splice(index, 1);
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
   
    /** Constructor */
    if (wm == undefined) {
      console.error("Interface: wm must be given");
      return;
    }

    if (typeof wm != 'object' && !(wm instanceof AutoComPaste.WindowManager)) {
      console.error("Interface: wm must be of type AutoComPaste.WindowManager");
      return;
    }

    if (texts_json == undefined) {
      console.error("Interface: texts_json must be given");
      return;
    }

    if (typeof texts_json != 'string' && !(texts_json instanceof String)) {
      console.error("Interface: texts_json must be of type String");
      return;
    }
    
    console.log("Interface: starting using data url: " + texts_json);

    // Define private variables.
    var iface = this;

    privates.texts = { };
    privates.texts_json = texts_json;
    privates.texts_available = 0;
    privates.texts_returned = 0;
    privates.events = { };
    privates.engine = engine;
    privates.wm = wm;
    
    // Fetch all the texts.
    this._fetchTexts();
  }

  return Interface;

}) (); 
