
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

const EXPORTED_SYMBOLS = ["YaripWebProgressListener"];

const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");

function YaripWebProgressListener() {
}
YaripWebProgressListener.prototype = {
    classDescription: "Yet Another Remove It Permanently - Web Progress Listener",
    classID: Components.ID("{c5daa563-cf8a-4ffe-a64a-82e137e11a74}"),
    contractID: "@yarip.mozdev.org/web-progress-listener;1",
    _xpcom_categories: [],
    QueryInterface: XPCOMUtils.generateQI([
            Ci.nsIWebProgressListener,
            Ci.nsISupportsWeakReference])
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIWebProgressListener#onStateChange%28%29
YaripWebProgressListener.prototype.onStateChange = function(webProgress, request, stateFlags, status)
{
    if (!yarip.enabled) return;
    if (!webProgress.isLoadingDocument) return;
    if (!(request instanceof Ci.nsIHttpChannel)) return;
    if ((STATE_START & stateFlags) !== STATE_START && (STATE_REDIRECTING & stateFlags) !== STATE_REDIRECTING) return;

    request.QueryInterface(Ci.nsIHttpChannel);

    if (!yarip.schemesRegExp.test(request.URI.scheme)) return;

    var doc = webProgress.DOMWindow.document;
    if (!yarip.schemesRegExp.test(doc.location.protocol.replace(/:$/, ""))) return;

    var location = yarip.getLocation(doc.location, request, doc);
    if (!location) return;

    var isPage = location.isPage;
    var isLink = location.isLink;
//    var isLink = location.isLink || (STATE_REDIRECTING & stateFlags) === STATE_REDIRECTING;
    if (isLink && !yarip.privateBrowsing) return;

    var contentLocation = yarip.getLocation(request.URI);
    var addressObj = yarip.getAddressObjByLocation(location, true);
    if (!addressObj.found) {
       yarip.logContentLocation(STATUS_UNKNOWN, location, contentLocation);
       return;
    }

    var statusObj = yarip.shouldBlacklist(addressObj, contentLocation.asciiHref, doc.defaultView, isLink ? DO_LINKS : DO_CONTENTS);
    switch (statusObj.status) {
    case STATUS_UNKNOWN:
        if (!isPage && (STATE_REDIRECTING & stateFlags) === STATE_REDIRECTING) {
            yarip.logContentLocation(STATUS_UNKNOWN, location, contentLocation);
        }
        break;
    case STATUS_WHITELISTED:
        if (!isPage && (STATE_REDIRECTING & stateFlags) === STATE_REDIRECTING) {
            yarip.logContentLocation(STATUS_WHITELISTED, location, contentLocation, null, statusObj.itemObj);
        }
        break;
    case STATUS_BLACKLISTED:
        request.cancel(Cr.NS_ERROR_ABORT);
        var newLog = yarip.logContentLocation(STATUS_BLACKLISTED, location, contentLocation, null, statusObj.itemObj);
        if (newLog && statusObj.itemObj.ruleType != TYPE_CONTENT_BLACKLIST) { // not blacklisted-rule
            yarip.showLinkNotification(doc, location, contentLocation, isLink);
        }
        break;
    }
}

var wrappedJSObject = new YaripWebProgressListener();

