
/*
Copyright 2007-2012 Kim A. Brandt <kimabrandt@gmx.de>

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

const EXPORTED_SYMBOLS = ["YaripContentPolicy"];

const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");

function YaripContentPolicy() {
}
YaripContentPolicy.prototype = {
    classDescription: "Yet Another Remove It Permanently - Content Policy",
    classID: Components.ID("{d5c0ebbd-cc48-46f7-b2db-e80aee358b7b}"),
    contractID: "@yarip.mozdev.org/content-policy;1",
    _xpcom_categories: [{ category: "content-policy" }],
    QueryInterface: XPCOMUtils.generateQI([
            Ci.nsIContentPolicy,
            Ci.nsIFactory])
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIContentPolicy#shouldLoad%28%29
YaripContentPolicy.prototype.shouldLoad = function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra)
{
    if (!yarip.schemesRegExp) return ACCEPT;
    if (!context || !contentLocation || !requestOrigin) return ACCEPT;
    if (!yarip.schemesRegExp.test(contentLocation.scheme)) return ACCEPT;
    if (!yarip.schemesRegExp.test(requestOrigin.scheme)) return ACCEPT;

    if (context.nodeType != DOCUMENT_NODE) context = context.ownerDocument;
    var defaultView = context && context.nodeType == DOCUMENT_NODE ? context.defaultView : null;
    var doc = defaultView ? defaultView.document : null;
    var location = doc ? doc.location : null;
    if (!location || !yarip.schemesRegExp.test(location.protocol.replace(/:$/, ""))) return ACCEPT;

    location = yarip.getLocation(location);
    contentLocation = yarip.getLocation(contentLocation);

    if (!yarip.enabled) {
        yarip.logContentLocation(STATUS_UNKNOWN, location, contentLocation, mimeTypeGuess);
        return ACCEPT;
    }

    var addressObj = yarip.getAddressObjByLocation(location, true);
    if (!addressObj.found) {
        yarip.logContentLocation(STATUS_UNKNOWN, location, contentLocation, mimeTypeGuess);
        return ACCEPT;
    }

    var statusObj = yarip.shouldBlacklist(addressObj, contentLocation.asciiHref, defaultView);
    yarip.logContentLocation(statusObj.status, location, contentLocation, mimeTypeGuess, statusObj.itemObj);
    switch (statusObj.status) {
    case STATUS_UNKNOWN:
        return ACCEPT;
    case STATUS_WHITELISTED:
        return ACCEPT;
    case STATUS_BLACKLISTED:
        return REJECT_SERVER;
    }
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIContentPolicy#shouldProcess%28%29
YaripContentPolicy.prototype.shouldProcess = function(contentType, contentLocation, requestOrigin, context, mimeType, extra)
{
    return ACCEPT;
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIFactory#createInstance%28%29
YaripContentPolicy.prototype.createInstance = function(outer, iid)
{
    return this;
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIFactory#lockFactory%28%29
YaripContentPolicy.prototype.lockFactory = function(lock)
{
}

var wrappedJSObject = new YaripContentPolicy();

