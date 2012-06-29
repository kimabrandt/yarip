
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

const EXPORTED_SYMBOLS = ["YaripObserver"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/replace.jsm");
Cu.import("resource://yarip/stream.jsm");

function YaripObserver() {
}
YaripObserver.prototype = {
    classDescription: "Yet Another Remove It Permanently - Observer",
    classID: Components.ID("{edbc2d9b-769c-45b4-9153-4559e6077ea8}"),
    contractID: "@yarip.mozdev.org/observer;1",
    _xpcom_categories: [],
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver])
}
YaripObserver.prototype.sb = SB.createBundle("chrome://yarip/locale/observer.properties");
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIObserver#observe%28%29
YaripObserver.prototype.observe = function(subject, topic, data)
{
    if (!(subject instanceof Ci.nsIHttpChannel)) return;

    subject.QueryInterface(Ci.nsIHttpChannel);

    switch (topic) {
    case "http-on-modify-request":
        this.modifyRequest(subject);
        break;
    case "http-on-examine-response":
    case "http-on-examine-cached-response":
    case "http-on-examine-merged-response":
        this.examineResponse(subject);
        break;
    }
}
YaripObserver.prototype.modifyRequest = function(channel)
{
    if (!yarip.enabled) return;
    if (!yarip.schemesRegExp.test(channel.URI.scheme)) return;

    try
    {
        var doc = null;
        try { doc = yarip.getInterface(channel, Ci.nsIDOMWindow).document; } catch(e) {}
        if (!doc) try { doc = yarip.getInterface(channel, Ci.nsIWebNavigation).document; } catch(e) {}
        var location = yarip.getLocation(null, channel, doc);
        if (!location) return;
        if (!yarip.schemesRegExp.test(location.scheme)) return;

        var addressObj = yarip.getAddressObjByLocation(location, true);
        if (!addressObj.found) return;

        var isPage = location.isPage;
        var isLink = location.isLink;
        var defaultView = doc ? doc.defaultView : null;
        var contentLocation = yarip.getLocation(channel.URI);
        var statusObj = this.shouldRedirect(addressObj, location, contentLocation, defaultView, isPage, isLink ? DO_LINKS : DO_CONTENTS);
        var itemObj = statusObj.itemObj;
        switch (statusObj.status) {
        case STATUS_UNKNOWN:
            if (!isPage) yarip.logContentLocation(STATUS_UNKNOWN, location, contentLocation, null, itemObj);
            break;
        case STATUS_WHITELISTED:
            if (!isPage) yarip.logContentLocation(STATUS_WHITELISTED, location, contentLocation, null, itemObj);
            break;
        case STATUS_BLACKLISTED:
            channel.cancel(Cr.NS_ERROR_ABORT);
            var newLog = yarip.logContentLocation(STATUS_BLACKLISTED, location, contentLocation, null, itemObj);
            if (newLog && itemObj.ruleType != TYPE_CONTENT_BLACKLIST) { // not blacklisted-rule
                yarip.showLinkNotification(doc, location, contentLocation);
            }
            return;
        case STATUS_REDIRECTED:
            new YaripChannelReplace(channel, statusObj.newURI, function(oldChannel, newChannel) {
                    yarip.logContentLocation(STATUS_REDIRECTED, location, newChannel.URI, null, itemObj);
                });
            return;
        }

        /*
         * REQUEST HEADER
         */

        var asciiHref = contentLocation.asciiHref;
        for (var pageName in addressObj.ext)
        {
            var list = isPage ? yarip.map.get(pageName).pageRequestHeaderList : yarip.map.get(pageName).contentRequestHeaderList;
            var extItem = addressObj.ext[pageName];
            if (extItem.getDoHeaders() && list.length > 0)
            {
                for each (var item in list.obj)
                {
                    if (!item.getRegExpObj().test(asciiHref)) continue;

                    var headerValue = null;
                    try {
                        var sandbox = new Cu.Sandbox(defaultView ? defaultView : asciiHref);
                        try { headerValue = channel.getRequestHeader(item.getHeaderName()) } catch (e) {}
                        if (typeof headerValue === "string") {
                            if (/^\s*function\b/.test(item.getScript())) {
                                sandbox.headerValue = headerValue;
                                headerValue = Cu.evalInSandbox("(" + item.getScript() + ")(headerValue);", sandbox);
                            } else {
                                headerValue = item.getScript();
                            }
                        } else {
                            if (/^\s*function\b/.test(item.getScript())) {
                                headerValue = Cu.evalInSandbox("(" + item.getScript() + ")();", sandbox);
                            } else {
                                headerValue = item.getScript();
                            }
                        }

                        if (typeof headerValue != "string") {
                            yarip.logMessage(LOG_WARNING, new Error(this.sb.formatStringFromName("WARN_HEADER_NOT_A_STRING3", [pageName, item.getHeaderName(), headerValue], 3)));
                            continue;
                        }

                        channel.setRequestHeader(item.getHeaderName(), headerValue, item.getMerge());

                        if (extItem.isSelf()) {
                            item.incrementLastFound();
                        }

                        if (defaultView) defaultView.yaripStatus = "found";
                    } catch (e) {
                        yarip.logMessage(LOG_ERROR, new Error(this.sb.formatStringFromName("ERR_SET_HEADER3", [pageName, item.getHeaderName(), headerValue], 3)));
                        yarip.logMessage(LOG_ERROR, e);
                    }
                }
            }
        }
    } catch (e) {
        yarip.logMessage(LOG_ERROR, e);
    }
}
YaripObserver.prototype.examineResponse = function(channel)
{
    if (!yarip.schemesRegExp.test(channel.URI.scheme)) return;

    try
    {
        var win = null;
        var doc = null;
        var defaultView = null;
        try {
            win = yarip.getInterface(channel, Ci.nsIDOMWindow);
            doc = win.document;
            defaultView = doc.defaultView;
        } catch(e) {
        }
        var location = yarip.getLocation(null, channel, doc);
        if (!location) return;
        if (!yarip.schemesRegExp.test(location.scheme)) return;

        var contentLocation = yarip.getLocation(channel.URI);
        yarip.updateContentType(null, location, contentLocation, channel.contentType, channel.responseStatus);

        if (!yarip.enabled) return;

        var addressObj = yarip.getAddressObjByLocation(location, true);
        if (!addressObj.found) return;

        var isPage = location.isPage;
        var isLink = location.isLink;

        if ([300, 301, 302, 303, 305, 307].indexOf(channel.responseStatus) > -1)
        {
            if (!isLink || yarip.privateBrowsing)
            {
                var locationHeader = null;
                try { locationHeader = channel.getResponseHeader("Location").replace(/^\s+|\s+$/g, "").match(URL_RE)[0]; } catch (e) {}
                try
                {
                    if (locationHeader)
                    {
                        var newURI = IOS.newURI(locationHeader, contentLocation.originCharset, null);
                        var newContentLocation = yarip.getLocation(newURI);
                        var statusObj = this.shouldRedirect(addressObj, location, newContentLocation, defaultView ? defaultView : win, isPage, DO_LINKS);
                        var itemObj = statusObj.itemObj;
                        switch (statusObj.status) {
                        case STATUS_UNKNOWN:
                            yarip.logContentLocation(STATUS_UNKNOWN, location, newContentLocation, null, itemObj);
                            break;
                        case STATUS_WHITELISTED:
                            yarip.logContentLocation(STATUS_WHITELISTED, location, newContentLocation, null, itemObj);
                            break;
                        case STATUS_BLACKLISTED:
                            channel.setResponseHeader("Pragma", "no-cache", true); // prevent caching
                            channel.setResponseHeader("Cache-Control", "no-cache, no-store, must-revalidate", true);
                            channel.setResponseHeader("Expires", "0", true);
                            channel.cancel(Cr.NS_ERROR_ABORT);
                            var newLog = yarip.logContentLocation(STATUS_BLACKLISTED, location, newContentLocation, null, itemObj);
                            if (newLog && itemObj.ruleType != TYPE_CONTENT_BLACKLIST) { // not blacklisted-rule
                                yarip.showLinkNotification(doc, location, newContentLocation);
                            }
                            return;
                        case STATUS_REDIRECTED:
                            channel.setResponseHeader("Location", statusObj.newURI.spec, false);
                            yarip.logContentLocation(STATUS_REDIRECTED, location, statusObj.newURI, null, itemObj);
                            return;
                        }
                    }
                } catch (e) {
                    yarip.logMessage(LOG_ERROR, e);
                }
            }
        }

        /*
         * PAGE SCRIPTING & STREAM REPLACING
         */

        // TODO Make this an user-preference!
        if (isPage && /^(?:text\/.*|application\/(?:javascript|json|(?:\w+\+)?\bxml))$/.test(channel.contentType)) {
            new YaripResponseStreamListener(channel, addressObj);
        }

        /*
         * RESPONSE HEADER
         */

        for (var pageName in addressObj.ext)
        {
            var extItem = addressObj.ext[pageName];
            if (extItem.getDoHeaders())
            {
                var page = yarip.map.get(pageName);
                var list = isPage ? page.pageResponseHeaderList : page.contentResponseHeaderList;
                if (list.length > 0)
                {
                    for each (var item in list.obj)
                    {
                        if (!item.getRegExpObj().test(contentLocation.asciiHref)) continue;

                        var sandbox = new Cu.Sandbox(win ? win : location.asciiHref);
                        var headerValue = null; // object
                        try { headerValue = channel.getResponseHeader(item.getHeaderName()); } catch (e) {}
                        try {
                            if (typeof headerValue === "string") {
                                if (/^\s*function\b/.test(item.getScript())) {
                                    sandbox.headerValue = headerValue;
                                    headerValue = Cu.evalInSandbox("(" + item.getScript() + ")(headerValue);", sandbox);
                                } else {
                                    headerValue = item.getScript();
                                }
                            } else {
                                if (/^\s*function\b/.test(item.getScript())) {
                                    headerValue = Cu.evalInSandbox("(" + item.getScript() + ")();", sandbox);
                                } else {
                                    headerValue = item.getScript();
                                }
                            }

                            if (typeof headerValue != "string") {
                                yarip.logMessage(LOG_WARNING, new Error(this.sb.formatStringFromName("WARN_HEADER_NOT_A_STRING3", [pageName, item.getHeaderName(), headerValue], 3)));
                                continue;
                            }

                            channel.setResponseHeader(item.getHeaderName(), headerValue, item.getMerge());

                            if (extItem.isSelf()) {
                                item.incrementLastFound();
                            }
                        } catch (e) {
                            yarip.logMessage(LOG_ERROR, new Error(this.sb.formatStringFromName("ERR_SET_HEADER3", [pageName, item.getHeaderName(), headerValue], 3)));
                            yarip.logMessage(LOG_ERROR, e);
                        }
                    }
                }
            }
        }
    } catch (e) {
        yarip.logMessage(LOG_ERROR, e);
    }
}
YaripObserver.prototype.shouldRedirect = function(addressObj, location, contentLocation, defaultView, isPage, doFlag)
{
    var statusObj = {
        status: STATUS_UNKNOWN,
        newURI: null
    };

    var asciiHref = contentLocation.asciiHref;
    if (!addressObj.found) return statusObj;

    for (var pageName in addressObj.ext)
    {
        var list = isPage ? yarip.map.get(pageName).pageRedirectList : yarip.map.get(pageName).contentRedirectList;
        var extItem = addressObj.ext[pageName];
        if (extItem.getDoRedirects() && list.length > 0)
        {
            for each (var item in list.obj)
            {
                if (!item.getRegExpObj().test(asciiHref)) continue;

                var newSpec = null;
                try
                {
                    if (/^\s*function\b/.test(item.getScript())) {
                        var sandbox = new Cu.Sandbox(defaultView ? defaultView : asciiHref);
                        sandbox.asciiHref = asciiHref;
                        newSpec = Cu.evalInSandbox("(" + item.getScript() + ")(asciiHref);", sandbox);
                    } else {
                        newSpec = asciiHref.replace(item.getRegExpObj(), item.getScript());
                    }

                    if (typeof newSpec != "string") {
                        yarip.logMessage(LOG_WARNING, new Error(this.sb.formatStringFromName("WARN_REDIRECT_NOT_A_STRING4", [pageName, item.getRegExp(), asciiHref, newSpec], 4)));
                        continue;
                    }

                    if (newSpec == asciiHref) continue; // prevent loop

                    var newURI = IOS.newURI(newSpec, contentLocation.originCharset, null);

                    if (extItem.isSelf()) {
                        item.incrementLastFound();
                    }

                    if (defaultView) defaultView.yaripStatus = "found";

                    statusObj.itemObj = {
                        pageName: pageName,
                        ruleType: isPage ? TYPE_PAGE_REDIRECT : TYPE_CONTENT_REDIRECT,
                        itemKey: item.getKey()
                    };

                    statusObj.status = STATUS_REDIRECTED;
                    statusObj.newURI = newURI;
                    return statusObj;
                } catch (e) {
                    yarip.logMessage(LOG_ERROR, new Error(this.sb.formatStringFromName("ERR_REDIRECT4", [pageName, item.getRegExp(), asciiHref, newSpec], 4)));
                    yarip.logMessage(LOG_ERROR, e);
                }
            }
        }
    }

    statusObj = yarip.shouldBlacklist(addressObj, asciiHref, defaultView, doFlag);
    return statusObj;
}
YaripObserver.prototype.init = function()
{
    var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    os.addObserver(this, "http-on-modify-request", false);
    os.addObserver(this, "http-on-examine-response", false);
    os.addObserver(this, "http-on-examine-cached-response", false);
    os.addObserver(this, "http-on-examine-merged-response", false);
}

var wrappedJSObject = new YaripObserver();

