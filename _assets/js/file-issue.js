// This file is forked from https://github.com/whatwg/whatwg.org/blob/master/resources.whatwg.org/file-issue.js
// which is CC0 per https://github.com/whatwg/whatwg.org/blob/master/resources.whatwg.org/README.md

(function () {
  'use strict';

  let originalFilingURL = getOriginalFilingURL();

  const specURL = getSpecURL();

  const fileLink = document.createElement('a');
  fileLink.href = originalFilingURL;
  fileLink.accessKey = '1';
  fileLink.className = 'selected-text-file-an-issue';
  // https://octicons.github.com/icon/issue-opened/
  fileLink.innerHTML = '<svg height="32" class="octicon octicon-issue-opened" viewBox="0 0 14 16" width="28" aria-label="Feedback" role="img"><path fill-rule="evenodd" d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path></svg>';
  fileLink.title = 'Send feedback about the selected text'
  fileLink.onclick = e => {
    fileLink.href = getFilingURL(originalFilingURL, window.getSelection());
  };

  document.body.append(fileLink);

  function getOriginalFilingURL() {
    const dataAttr = document.currentScript.getAttribute("data-file-issue-url");
    if (dataAttr) {
      return dataAttr;
    }
  }

  function getSpecURL() {
    return window.location.href;
  }

  function getFilingURL(originalFilingURL, selection) {
    const bugData = getBugData(selection);
    return originalFilingURL + '?body=' +
           encodeURIComponent(bugData.body);
  }

  function getBugData(selection) {
    const selectionText = selection.toString();
    const url = getURLToReport(selection);

    return {
      body: getBody(url, selectionText)
    };
  }

  function escapeGFM(text) {
    return text.replace(/&/g, '&amp;') // HTML
               .replace(/</g, '&lt;') // HTML
               .replace(/>/g, '&gt;') // blockquote
               .replace(/([:@=])/g, '$1\u200b') // emoji, @mention, headings
               .replace(/([\\`\*_\{\}\[\]\(\)#\+\-\.!\~\|])/g, '\\$1'); // other formatting
  }

  function getBody(url, selectionText) {
    let quotedText = selectionText;
    if (quotedText.length > 1000) {
      quotedText = quotedText.substring(0, 997) + '...';
    }

    quotedText = escapeGFM(quotedText).replace(/\r/g, '').replace(/\n/g, '\n> ');
    if (quotedText.length > 0) {
      quotedText = '> ' + quotedText;
    }

    return url + '\n\n' + quotedText;
  }

  function getURLToReport(selection) {
    let url = specURL;

    const node = getBestNodeToReport(selection);
    if (node) {
      url = url.split('#')[0] + '#' + node.id;
    }

    return url;
  }

  function getBestNodeToReport(selection) {
    let node = null;

    if (selection.anchorNode) {
      node = selection.anchorNode;

      if (selection.focusNode && selection.focusNode.compareDocumentPosition) {
        const compare = selection.focusNode.compareDocumentPosition(selection.anchorNode);
        if (compare & Node.DOCUMENT_POSITION_FOLLOWING || compare & Node.DOCUMENT_POSITION_CONTAINED_BY) {
          node = selection.focusNode;
        }
      }
    }

    while (node && !node.id) {
      node = node.previousSibling || node.parentNode;
    }

    return node;
  }
}());
