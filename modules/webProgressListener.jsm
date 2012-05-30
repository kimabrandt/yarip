
/*
Copyright 2007-2012 Kim A. Brandt <kimabrandt@gmx.de>

This file is part of yarip.

Yarip is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

Yarip is distributed in the hope that it will be useful;
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with yarip; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

const EXPORTED_SYMBOLS = ["YaripWebProgressListener"];

const Cc = Components.classes;
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
        Ci.nsISupports,
        Ci.nsIWebProgressListener,
        Ci.nsISupportsWeakReference
    ]),

    /*
     * nsIWebProgressListener
     */

    onStateChange: function(webProgress, request, stateFlags, status)
    {
        if (!yarip.enabled) return;
        if (!webProgress.isLoadingDocument) return;
        if (!(request instanceof Ci.nsIHttpChannel)) return;
        if ((STATE_STOP & stateFlags) === STATE_STOP) return;

        request.QueryInterface(Ci.nsIHttpChannel);
        if (!yarip.schemesRegExp.test(request.URI.scheme)) return;

        var doc = webProgress.DOMWindow.document;
        if (!yarip.schemesRegExp.test(doc.location.protocol.replace(/:$/, ""))) return;

        var isLinking = (LOAD_INITIAL_DOCUMENT_URI & request.loadFlags) === LOAD_INITIAL_DOCUMENT_URI || (STATE_REDIRECTING & stateFlags) === STATE_REDIRECTING;
        if (isLinking && !yarip.privateBrowsing) return;

        var location = yarip.getLocationFromLocation(doc.location);
        var contentLocation = yarip.getContentLocationFromContentLocation(request.URI);

        var addressObj = yarip.getAddressObjByLocation(location, true);
        if (!addressObj.found) {
            yarip.logContentLocation(STATUS_UNKNOWN, location, contentLocation);
            return;
        }

        var status = yarip.shouldBlacklist(addressObj, contentLocation.asciiSpec, doc.defaultView, isLinking ? 7 : 2 /* link or content */);
        var isPage = (LOAD_DOCUMENT_URI & request.loadFlags) === LOAD_DOCUMENT_URI;
        switch (status) {
        case STATUS_UNKNOWN:
            if (!isPage) yarip.logContentLocation(STATUS_UNKNOWN, location, contentLocation);
            break;
        case STATUS_WHITELISTED:
            if (!isPage) yarip.logContentLocation(STATUS_WHITELISTED, location, contentLocation, null, addressObj);
            break;
        case STATUS_BLACKLISTED:
            request.cancel(Cr.NS_ERROR_ABORT);
            /*if (!isPage)*/ yarip.logContentLocation(STATUS_BLACKLISTED, location, contentLocation, null, addressObj);
//            if (isLinking) yarip.showLinkNotification(doc, contentLocation);
            if (addressObj.itemObj.ruleType != TYPE_CONTENT_BLACKLIST) { // not blacklisted-rule
                /*if (isLinking)*/ yarip.showLinkNotification(doc, contentLocation);
            }
            break;
        }
    }
}

var wrappedJSObject = new YaripWebProgressListener();

