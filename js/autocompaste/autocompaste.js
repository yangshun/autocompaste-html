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

(function () {
  /**
   * AutoComPaste jQuery Plugin
   * To use this plugin, run $('#my-text-field').autocompaste().
   */
  $.fn.autocompaste = function (engine) {
    var editor = new AutoComPaste.Editor(this, engine);
    return this;
  }
} ());
