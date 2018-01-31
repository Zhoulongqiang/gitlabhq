/* eslint-disable func-names, wrap-iife, consistent-return,
  no-return-assign, no-param-reassign, one-var-declaration-per-line, no-unused-vars,
  prefer-template, object-shorthand, prefer-arrow-callback */

import { pluralize } from './lib/utils/text_utility';
import { localTimeAgo } from './lib/utils/datetime_utility';
import Pager from './pager';
import axios from './lib/utils/axios_utils';

export default (function () {
  const CommitsList = {};

  CommitsList.timer = null;

  CommitsList.init = function (limit) {
    this.$contentList = $('.content_list');

    $('body').on('click', '.day-commits-table li.commit', function (e) {
      if (e.target.nodeName !== 'A') {
        location.href = $(this).attr('url');
        e.stopPropagation();
        return false;
      }
    });

    Pager.init(parseInt(limit, 10), false, false, this.processCommits);

    this.content = $('#commits-list');
    this.searchField = $('#commits-search');
    this.lastSearch = this.searchField.val();
    return this.initSearch();
  };

  CommitsList.initSearch = function () {
    this.timer = null;
    return this.searchField.keyup((function (_this) {
      return function () {
        clearTimeout(_this.timer);
        return _this.timer = setTimeout(_this.filterResults, 500);
      };
    })(this));
  };

  CommitsList.filterResults = function () {
    const form = $('.commits-search-form');
    const search = CommitsList.searchField.val();
    if (search === CommitsList.lastSearch) return Promise.resolve();
    const commitsUrl = form.attr('action') + '?' + form.serialize();
    CommitsList.content.fadeTo('fast', 0.5);
    const params = form.serializeArray().reduce((acc, obj) => Object.assign(acc, {
      [obj.name]: obj.value,
    }), {});

    return axios.get(form.attr('action'), {
      params,
    })
      .then(({ data }) => {
        CommitsList.lastSearch = search;
        CommitsList.content.html(data.html);
        CommitsList.content.fadeTo('fast', 1.0);

        // Change url so if user reload a page - search results are saved
        history.replaceState({
          page: commitsUrl,
        }, document.title, commitsUrl);
      })
      .catch(() => {
        CommitsList.content.fadeTo('fast', 1.0);
        CommitsList.lastSearch = null;
      });
  };

  // Prepare loaded data.
  CommitsList.processCommits = (data) => {
    let processedData = data;
    const $processedData = $(processedData);
    const $commitsHeadersLast = CommitsList.$contentList.find('li.js-commit-header').last();
    const lastShownDay = $commitsHeadersLast.data('day');
    const $loadedCommitsHeadersFirst = $processedData.filter('li.js-commit-header').first();
    const loadedShownDayFirst = $loadedCommitsHeadersFirst.data('day');
    let commitsCount;

    // If commits headers show the same date,
    // remove the last header and change the previous one.
    if (lastShownDay === loadedShownDayFirst) {
      // Last shown commits count under the last commits header.
      commitsCount = $commitsHeadersLast.nextUntil('li.js-commit-header').find('li.commit').length;

      // Remove duplicate of commits header.
      processedData = $processedData.not(`li.js-commit-header[data-day='${loadedShownDayFirst}']`);

      // Update commits count in the previous commits header.
      commitsCount += Number($(processedData).nextUntil('li.js-commit-header').first().find('li.commit').length);
      $commitsHeadersLast.find('span.commits-count').text(`${commitsCount} ${pluralize('commit', commitsCount)}`);
    }

    localTimeAgo($processedData.find('.js-timeago'));

    return processedData;
  };

  return CommitsList;
})();
