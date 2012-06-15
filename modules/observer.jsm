
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

    var doc = null;
    try { doc = yarip.getInterface(channel, Ci.nsIDOMWindow).document; } catch(e) {}
    if (!doc) try { doc = yarip.getInterface(channel, Ci.nsIWebNavigation).document; } catch(e) {}
    var locObj = yarip.getLocation(channel, doc);
    if (!locObj) return;

    var location = locObj.location;
    if (!yarip.schemesRegExp.test(location.protocol.replace(/:$/, ""))) return;

    var addressObj = yarip.getAddressObjByLocation(location, true);
    if (!addressObj.found) return;

    var isPage = locObj.isPage;
    var isLinking = locObj.isLinking;
    var defaultView = doc ? doc.defaultView : null;
    var contentLocation = yarip.getContentLocationFromContentLocation(channel.URI);
    var statusObj = this.shouldRedirect(addressObj, location, contentLocation, defaultView, isPage, isLinking ? DO_LINKS : DO_CONTENTS);
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
        yarip.logContentLocation(STATUS_BLACKLISTED, location, contentLocation, null, itemObj);
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

    var asciiSpec = contentLocation.asciiSpec;
    for (var pageName in addressObj.ext)
    {
        var list = isPage ? yarip.map.get(pageName).pageRequestHeaderList : yarip.map.get(pageName).contentRequestHeaderList;
        var extItem = addressObj.ext[pageName];
        if (extItem.getDoHeaders() && list.length > 0)
        {
            for each (var item in list.obj)
            {
                if (!item.getRegExpObj().test(asciiSpec)) continue;

                var headerValue = null;
                try {
                    var sandbox = new Cu.Sandbox(defaultView ? defaultView : asciiSpec);
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
                        Cu.reportError("YaripObserver.modifyRequest: `headerValue' is not a string!\npageName: " + pageName + "\nregex=" + item.getRegExp() + "\nheaderName=" + item.getHeaderName() + "\nheaderValue=" + headerValue);
                        continue;
                    }

                    channel.setRequestHeader(item.getHeaderName(), headerValue, item.getMerge());

                    if (extItem.isSelf()) {
                        item.incrementLastFound();
                    }

                    if (defaultView) defaultView.yaripStatus = "found";
                } catch (error) {
                    Cu.reportError("YaripObserver.modifyRequest: Couldn't set the request-header!\npageName: " + pageName + "\nheaderName=" + item.getHeaderName() + "\nheaderValue=" + headerValue + "\nerror=" + error);
                }
            }
        }
    }
}
YaripObserver.prototype.examineResponse = function(channel)
{
    if (!yarip.schemesRegExp.test(channel.URI.scheme)) return;

    var win = null;
    var doc = null;
    var defaultView = null;
    try {
        win = yarip.getInterface(channel, Ci.nsIDOMWindow);
        doc = win.document;
        defaultView = doc.defaultView;
    } catch(e) {}
    var locObj = yarip.getLocation(channel, doc);
    if (!locObj) return;

    var location = locObj.location;
    if (!yarip.schemesRegExp.test(location.protocol.replace(/:$/, ""))) return;

    var contentLocation = yarip.getContentLocationFromContentLocation(channel.URI);
    yarip.updateContentType(null, location, contentLocation, channel.contentType, channel.responseStatus);

    if (!yarip.enabled) return;

    var addressObj = yarip.getAddressObjByLocation(location, true);
    if (!addressObj.found) return;

    var isPage = locObj.isPage;
    var isLinking = locObj.isLinking;

    if ([300, 301, 302, 303, 305, 307].indexOf(channel.responseStatus) > -1)
    {
        if (!isLinking || yarip.privateBrowsing)
        {
            var locationHeader = null;
            try { locationHeader = channel.getResponseHeader("Location"); } catch (error) {}
            try
            {
                if (locationHeader)
                {
                    var newURI = IOS.newURI(locationHeader, contentLocation.originCharset, null);
                    var newContentLocation = yarip.getContentLocationFromContentLocation(newURI);
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
                        yarip.logContentLocation(STATUS_BLACKLISTED, location, newContentLocation, null, itemObj);
                        if (itemObj.ruleType != TYPE_CONTENT_BLACKLIST) { // not blacklisted-rule
                            yarip.showLinkNotification(doc, newContentLocation);
                        }
                        return;
                    case STATUS_REDIRECTED:
                        channel.setResponseHeader("Location", statusObj.newURI.spec, false);
                        yarip.logContentLocation(STATUS_REDIRECTED, location, statusObj.newURI, null, itemObj);
                        return;
                    }
                }
            } catch (error) {
                Cu.reportError("YaripObserver.examineResponse: Couldn't redirect!\nerror=" + error);
//                Cu.reportError("YaripObserver.examineResponse: Couldn't redirect!\npageName: " + pageName + "\nregex=" + item.getRegExp() + "\nasciiSpec=" + asciiSpec + "\nnewSpec=" + newSpec + "\nerror=" + error);
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
                    if (!item.getRegExpObj().test(contentLocation.asciiSpec)) continue;

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
                            Cu.reportError("YaripObserver.examineResponse: `headerValue' is not a string!\npageName: " + pageName + "\nregex=" + item.getRegExp() + "\nheaderName" + item.getHeaderName() + "\nheaderValue=" + headerValue);
                            continue;
                        }

                        channel.setResponseHeader(item.getHeaderName(), headerValue, item.getMerge());

                        if (extItem.isSelf()) {
                            item.incrementLastFound();
                        }
                    } catch (error) {
                        Cu.reportError("YaripObserver.examineResponse: Couldn't set the request-header!\npageName: " + pageName + "\nregex=" + item.getRegExp() + "\nheaderName" + item.getHeaderName() + "\nheaderValue=" + headerValue + "\nerror=" + error);
                    }
                }
            }
        }
    }
}
YaripObserver.prototype.shouldRedirect = function(addressObj, location, contentLocation, defaultView, isPage, doFlag)
{
    var statusObj = {
        status: STATUS_UNKNOWN,
        newURI: null
    };

    var asciiSpec = contentLocation.asciiSpec;
    if (!addressObj.found) return statusObj;

    for (var pageName in addressObj.ext)
    {
        var list = isPage ? yarip.map.get(pageName).pageRedirectList : yarip.map.get(pageName).contentRedirectList;
        var extItem = addressObj.ext[pageName];
        if (extItem.getDoRedirects() && list.length > 0)
        {
            for each (var item in list.obj)
            {
                if (!item.getRegExpObj().test(asciiSpec)) continue;

                var newSpec = null;
                try
                {
                    if (/^\s*function\b/.test(item.getScript())) {
                        var sandbox = new Cu.Sandbox(defaultView ? defaultView : asciiSpec);
                        sandbox.asciiSpec = asciiSpec;
                        newSpec = Cu.evalInSandbox("(" + item.getScript() + ")(asciiSpec);", sandbox);
                    } else {
                        newSpec = asciiSpec.replace(item.getRegExpObj(), item.getScript());
                    }

                    if (typeof newSpec != "string") {
                        Cu.reportError("YaripObserver.shouldRedirect: `newSpec' is not a string!\npageName: " + pageName + "\nregex=" + item.getRegExp() + "\nasciiSpec=" + asciiSpec + "\nnewSpec=" + newSpec);
                        continue;
                    }

                    if (newSpec == asciiSpec) continue; // prevent loop

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
                } catch (error) {
                    Cu.reportError("YaripObserver.shouldRedirect: Couldn't redirect!\npageName: " + pageName + "\nregex=" + item.getRegExp() + "\nasciiSpec=" + asciiSpec + "\nnewSpec=" + newSpec + "\nerror=" + error);
                }
            }
        }
    }

    statusObj = yarip.shouldBlacklist(addressObj, asciiSpec, defaultView, doFlag);
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

