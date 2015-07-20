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
 * AutoComPaste module.
 * This module initializes the AutoComPaste implementation.
 */
AutoComPaste.Engine = (function () {

  /** Private variables */
  var privates = { };

  /**
   * The class constructor.
   */
  function Engine () {
    /**
     * Adds the specified text into the index.
     *
     * This method tokenizes and parses the text into three granularities:
     * paragraphs, sentences and words.
     *
     * Paragraphs are identified by two consecutive end-of-line characters.
     *
     * Sentences are tokenized using the full-stop character. However, some
     * cases such as ellipses are also taken into consideration during the
     * tokenizing stage.
     *
     * Words are tokenized using spaces.
     *
     * @param {String} id
     * @param {String} text
     */
    this.addToIndex = function addToIndex (id, text) {
      // Easiest case would be paragraphs.
      privates.paragraphs[id] = text.split (/\r?\n\r?\n/);

      // Sentences are broken down using sentence delimiters such as ".", "?"
      // and "!". There may be more that we have missed out.
      var sentences = text.split (/(\r|\n|\?|\.|!)/)
        .filter (function (sentence) {
          return !/\r|\n/.test (sentence);
        })
        .filter (function (sentence) {
          return sentence;
        });

      // This is required because the sentences do not include punctuation.
      // Ideally we should include them so that the user does not need to type
      // those in.
      var real_sentence_idx = -1;
      for (var i = 0; i < sentences.length; i++) {
        if (!/\?|\.|!/.test (sentences[i])) {
          real_sentence_idx = i;
        }

        if (real_sentence_idx != -1) {
          if (real_sentence_idx != i) {
            // Merge with previous real sentence.
            sentences[real_sentence_idx] =
              sentences[real_sentence_idx].concat (sentences[i]);
            sentences[i] = "";
          }
        }
      }

      // Remove empty elements.
      sentences = sentences.filter (function (sentence) {
        return sentence;
      }).map (function (sentence) {
        return sentence.trim();
      });

      privates.sentences[id] = sentences;
    };

    /**
     * Searches for the specified terms in the index.
     * This function is used to generate the autocompletion list.
     *
     * @param {String} query
     */
    this.search = function search (query) {
      // Query must be a string.
      if (typeof query != 'string' || query instanceof String) {
        console.error ("Engine.search: query must be a string");
        return;
      }

      // Return results only for queries over length 2.
      if (query.length <= 2) {
        return [];
      }

      // Search within sentences.
      var results = [];
      for (var id in privates.sentences) {
        var sentences = privates.sentences[id];
        for (var i = 0; i < sentences.length; i++) {
          var sentence = sentences[i];
          var search_result = sentence
            .toLowerCase()
            .indexOf(query.toLowerCase());

          if (search_result != -1) {
            var result = {
              "sentence": sentence,
              "start": search_result,
              "end": search_result + query.length,
              "id": id,
              "index": i
            };

            results.push (result);
          }
        }
      }

      return results;
    };

    /**
     * Obtains a specific sentence from the index.
     * TODO: Do some checking
     *
     * @param {String} id
     * @param {Number} index
     *
     * @return {String}
     */
    this.getSentenceFromIndex = function (id, index) {
      // Check the ID.
      if (id == undefined) {
        console.error ("Engine.getSentenceFromIndex: id must be given");
        return;
      }

      if (typeof id != 'string' && !(id instanceof String)) {
        console.error ("Engine.getSentenceFromIndex: id must be a string");
        return;
      }

      // Check the index.
      if (isNaN (index)) {
        console.error ("Engine.getSentenceFromIndex: index must be a number");
        return;
      }

      if (index < 0) {
        console.error ("Engine.getSentenceFromIndex: index cannot be negative");
        return;
      }
     
      // ID does not exist.
      if (!privates.sentences.hasOwnProperty (id)) {
        return undefined;
      }
      var sentences = privates.sentences[id];

      // Index does not exist.
      if (index >= sentences.length || index < 0) {
        return undefined;
      }

      return {
        "sentence": sentences[index],
        "id": id,
        "index": index
      };
    };

    /** Internal functions */

    /** Private variables */
    privates.paragraphs = { };
    privates.sentences = { };
    privates.words = { };
  }

  return Engine;

}) ();

/* vim: set sw=2 ts=2 et: */
