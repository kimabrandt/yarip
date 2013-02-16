
/*
    Copyright 2007-2013 Kim A. Brandt <kimabrandt@gmx.de>

    This file is part of yarip.

    Yarip is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    Yarip is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with yarip.  If not, see <http://www.gnu.org/licenses/>.
*/

var EXPORTED_SYMBOLS = [
        "VERSION",
        "FILE",
        "STYLE",
        "CHARSET",

        "MODE_PAGE",
        "MODE_FQDN",
        "MODE_SLD",

        "TYPE_WHITELIST",
        "TYPE_BLACKLIST",
        "TYPE_ATTRIBUTE",
        "TYPE_CONTENT_WHITELIST",
        "TYPE_CONTENT_BLACKLIST",
        "TYPE_CONTENT_REDIRECT",
        "TYPE_PAGE_REDIRECT",
        "TYPE_PAGE_EXTENSION",
        "TYPE_PAGE_EXTENDED_BY",

        "DATA_TYPE_BOOLEAN",
        "DATA_TYPE_INTEGER",
        "DATA_TYPE_STRING",
        "DATA_TYPE_RESET",

        "INCREMENT_NOT_FOUND",
        "INCREMENT_IGNORED",
        "INCREMENT_FOUND",

        "STATUS_UNKNOWN",
        "STATUS_WHITELISTED",
        "STATUS_BLACKLISTED",
        "STATUS_REDIRECTED",

        "PAGE_TYPE_UNKNOWN",
        "PAGE_TYPE_SCHEME",
        "PAGE_TYPE_SIMPLE",
        "PAGE_TYPE_IP",
        "PAGE_TYPE_DOMAIN",

        "PREF_VERSION",
        "PREF_ENABLED",
        "PREF_FLICKER",
        "PREF_MODE",
        "PREF_ELEMENTS",
        "PREF_INDEX",
        "PREF_MATCH",
        "PREF_PRIVATE",
        "PREF_PURGE",
        "PREF_SCHEMES",
        "PREF_EXCLUSIVE",
        "PREF_TEMPLATES",
        "PREF_PAGES_MODIFIERS",
        "PREF_PAGES_KEY_CODE",
        "PREF_LOG_WHEN_CLOSED",
        "PREF_MONITOR_MODIFIERS",
        "PREF_MONITOR_KEY_CODE",

        "OUTLINE_RE",
        "OUTLINE_END_RE",

        "INDEX_TABBOX_ELEMENT",
        "INDEX_TABBOX_CONTENT",
        "INDEX_TABBOX_PAGE",

        "INDEX_ELEMENT_WHITELIST",
        "INDEX_ELEMENT_BLACKLIST",
        "INDEX_ELEMENT_ATTRIBUTE",
        "INDEX_ELEMENT_SCRIPT",

        "INDEX_CONTENT_WHITELIST",
        "INDEX_CONTENT_BLACKLIST",
        "INDEX_CONTENT_HEADER",
        "INDEX_CONTENT_REDIRECT",
        "INDEX_CONTENT_STREAM",

        "INDEX_HEADER_REQUEST",
        "INDEX_HEADER_RESPONSE",

        "INDEX_PAGE_STYLE",
        "INDEX_PAGE_SCRIPT",
        "INDEX_PAGE_HEADER",
        "INDEX_PAGE_REDIRECT",
        "INDEX_PAGE_STREAM",
        "INDEX_PAGE_EXTENSION",
        "INDEX_PAGE_EXTENDED_BY",

        "DO_ELEMENTS",
        "DO_CONTENTS",
        "DO_SCRIPTS",
        "DO_HEADERS",
        "DO_REDIRECTS",
        "DO_STREAMS",
        "DO_LINKS",

        "LIST_INDEX_KEY",

        "LOG_ERROR",
        "LOG_WARNING",

        "LOAD_FLAG_REPLACE",
        "LOAD_FLAG_RESPONSE",

        // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIChannel
        "LOAD_DOCUMENT_URI",
        "LOAD_INITIAL_DOCUMENT_URI",
        "LOAD_REPLACE",

        // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIContentPolicy
        "ACCEPT",
        "REJECT_OTHER",
        "TYPE_DOCUMENT",

        // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIDOMNode
        "DOCUMENT_NODE",

        // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIDOMXPathResult
        "ORDERED_NODE_ITERATOR_TYPE",
        "UNORDERED_NODE_SNAPSHOT_TYPE",

        "NOTIFY_STATE_DOCUMENT",
        "NOTIFY_STATE_REQUEST",

        // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIWebProgressListener
        "STATE_REDIRECTING",
        "STATE_START",
        "STATE_STOP",

        // https://developer.mozilla.org/en-US/DOM/Node.nodeType
        "ELEMENT_NODE",
        "ATTRIBUTE_NODE",
        "TEXT_NODE",

        // Services
        "CH",
        "CS",
        "FH",
        "IDNS",
        "IOS",
        "OS",
        "PB",
        "SB",
        "UUIDG",
        "WP"
    ];

const Cc = Components.classes;
const Ci = Components.interfaces;

const VERSION = "0.3.4";
const FILE = "yarip.xml";
const CHARSET = "UTF-8";

const MODE_PAGE = 0;
const MODE_FQDN = 1;
const MODE_SLD = 2;

const TYPE_WHITELIST = 0;
const TYPE_BLACKLIST = 1;
const TYPE_ATTRIBUTE = 2;
const TYPE_CONTENT_WHITELIST = 3;
const TYPE_CONTENT_BLACKLIST = 4;
const TYPE_CONTENT_REDIRECT = 5;
const TYPE_PAGE_REDIRECT = 6;
const TYPE_PAGE_EXTENSION = 7;
const TYPE_PAGE_EXTENDED_BY = 8;

const DATA_TYPE_BOOLEAN = 0;
const DATA_TYPE_INTEGER = 1;
const DATA_TYPE_STRING = 2;
const DATA_TYPE_RESET = 3;

const INCREMENT_NOT_FOUND = 0;
const INCREMENT_IGNORED = 1;
const INCREMENT_FOUND = 2;

const STATUS_UNKNOWN = 0;
const STATUS_WHITELISTED = 1;
const STATUS_BLACKLISTED = 2;
const STATUS_REDIRECTED = 3;

const PAGE_TYPE_UNKNOWN = 0;
const PAGE_TYPE_SCHEME = 1;
const PAGE_TYPE_SIMPLE = 2;
const PAGE_TYPE_IP = 3;
const PAGE_TYPE_DOMAIN = 4;

const PREF_VERSION = "extensions.yarip.version";
const PREF_ENABLED = "extensions.yarip.enabled.value";
const PREF_FLICKER = "extensions.yarip.noFlicker.value";
const PREF_MODE = "extensions.yarip.mode.value";
const PREF_ELEMENTS = "extensions.yarip.elementsInContext.value";
const PREF_INDEX = "extensions.yarip.useIndex.value";
const PREF_MATCH = "extensions.yarip.matchAuthorityPort.value";
const PREF_PRIVATE = "extensions.yarip.privateBrowsing.value";
const PREF_PURGE = "extensions.yarip.purgeInnerHTML.value";
const PREF_SCHEMES = "extensions.yarip.schemesRegExp.value";
const PREF_EXCLUSIVE = "extensions.yarip.exclusiveOnCreation.value";
const PREF_TEMPLATES = "extensions.yarip.templatesList.value";
const PREF_PAGES_MODIFIERS = "extensions.yarip.managePagesModifiersList.value";
const PREF_PAGES_KEY_CODE = "extensions.yarip.managePagesKeyCode.value";
const PREF_LOG_WHEN_CLOSED = "extensions.yarip.logWhenClosed.value";
const PREF_MONITOR_MODIFIERS = "extensions.yarip.monitorContentModifiersList.value";
const PREF_MONITOR_KEY_CODE = "extensions.yarip.monitorContentKeyCode.value";

const OUTLINE_RE = /^outline-color:\ rgb\((0|153),\ 0,\ (0|153)\);\ outline-style:\ solid;\ outline-width:\ 3px;$/;
const OUTLINE_END_RE = /outline-color:\ rgb\((0|153),\ 0,\ (0|153)\);\ outline-style:\ solid;\ outline-width:\ 3px;$/;

const INDEX_TABBOX_ELEMENT = 0;
const INDEX_TABBOX_CONTENT = 1;
const INDEX_TABBOX_PAGE = 2;

const INDEX_ELEMENT_WHITELIST = 0;
const INDEX_ELEMENT_BLACKLIST = 1;
const INDEX_ELEMENT_ATTRIBUTE = 2;
const INDEX_ELEMENT_SCRIPT = 3;

const INDEX_CONTENT_WHITELIST = 0;
const INDEX_CONTENT_BLACKLIST = 1;
const INDEX_CONTENT_HEADER = 2;
const INDEX_CONTENT_REDIRECT = 3;
const INDEX_CONTENT_STREAM = 4;

const INDEX_HEADER_REQUEST = 0;
const INDEX_HEADER_RESPONSE = 1;

const INDEX_PAGE_STYLE = 0;
const INDEX_PAGE_SCRIPT = 1;
const INDEX_PAGE_HEADER = 2;
const INDEX_PAGE_REDIRECT = 3;
const INDEX_PAGE_STREAM = 4;
const INDEX_PAGE_EXTENSION = 5;
const INDEX_PAGE_EXTENDED_BY = 6;

const DO_ELEMENTS = 1;
const DO_CONTENTS = 2;
const DO_SCRIPTS = 3;
const DO_HEADERS = 4;
const DO_REDIRECTS = 5;
const DO_STREAMS = 6;
const DO_LINKS = 7;

const LIST_INDEX_KEY = -1;

const LOG_ERROR = Ci.nsIScriptError.errorFlag;
const LOG_WARNING = Ci.nsIScriptError.warningFlag;

// FIXME
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIChannel#Constants
const LOAD_FLAG_REPLACE = 1 << 29;
const LOAD_FLAG_RESPONSE = 1 << 30;

// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIChannel
const LOAD_DOCUMENT_URI = Ci.nsIChannel.LOAD_DOCUMENT_URI;
const LOAD_INITIAL_DOCUMENT_URI = Ci.nsIChannel.LOAD_INITIAL_DOCUMENT_URI;
const LOAD_REPLACE = Ci.nsIChannel.LOAD_REPLACE;

// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIContentPolicy
const ACCEPT = Ci.nsIContentPolicy.ACCEPT;
const REJECT_OTHER = Ci.nsIContentPolicy.REJECT_OTHER;
const TYPE_DOCUMENT = Ci.nsIContentPolicy.TYPE_DOCUMENT;

// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIDOMNode
const DOCUMENT_NODE = Ci.nsIDOMNode.DOCUMENT_NODE;

// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIDOMXPathResult
const ORDERED_NODE_ITERATOR_TYPE = Ci.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE;
const UNORDERED_NODE_SNAPSHOT_TYPE = Ci.nsIDOMXPathResult.UNORDERED_NODE_SNAPSHOT_TYPE;

// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIWebProgress
const NOTIFY_STATE_DOCUMENT = Ci.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const NOTIFY_STATE_REQUEST = Ci.nsIWebProgress.NOTIFY_STATE_REQUEST;

// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIWebProgressListener
const STATE_REDIRECTING = Ci.nsIWebProgressListener.STATE_REDIRECTING;
const STATE_START = Ci.nsIWebProgressListener.STATE_START;
const STATE_STOP = Ci.nsIWebProgressListener.STATE_STOP;

// https://developer.mozilla.org/en-US/DOM/Node.nodeType
const ELEMENT_NODE = 1;
const ATTRIBUTE_NODE = 2;
const TEXT_NODE = 3;

// Services
const CH = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
const CS = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
const FH = Cc["@mozilla.org/satchel/form-history;1"].getService(Ci.nsIFormHistory2);
const IDNS = Cc["@mozilla.org/network/idn-service;1"].getService(Ci.nsIIDNService);
const IOS = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
const OS = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
const PB = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
const SB = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
const UUIDG = Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator);
const WP = Cc['@mozilla.org/docloaderservice;1'].getService(Ci.nsIWebProgress);

