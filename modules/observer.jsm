
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
YaripObserver.prototype.classDescription = "Yet Another Remove It Permanently - Observer";
YaripObserver.prototype.classID = Components.ID("{edbc2d9b-769c-45b4-9153-4559e6077ea8}");
YaripObserver.prototype.contractID = "@yarip.mozdev.org/observer;1";
YaripObserver.prototype._xpcom_categories = [];
YaripObserver.prototype.QueryInterface = XPCOMUtils.generateQI([
        Ci.nsISupports,
        Ci.nsIObserver,
        Ci.nsISupportsWeakReference
    ]);
YaripObserver.prototype.observe = function(subject, topic, data)
{
    if (!(subject instanceof Ci.nsIHttpChannel)) return;

    subject.QueryInterface(Ci.nsIChannel);
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

    var isPage = (LOAD_DOCUMENT_URI & channel.loadFlags) !== 0;
    var redObj = this.shouldRedirect(addressObj, location, channel, doc ? doc.defaultView : null, isPage);
    if (!redObj) return;

    switch (redObj.status) {
    case STATUS_UNKNOWN:
        if (!isPage) yarip.logContentLocation(STATUS_UNKNOWN, location, channel.URI, null, addressObj);
        break;
    case STATUS_WHITELISTED:
        if (!isPage) yarip.logContentLocation(STATUS_WHITELISTED, location, channel.URI, null, addressObj);
        break;
    case STATUS_BLACKLISTED:
        channel.cancel(Cr.NS_ERROR_ABORT);
        /*if (!isPage)*/ yarip.logContentLocation(STATUS_BLACKLISTED, location, channel.URI, null, addressObj);
        break;
    case STATUS_REDIRECTED:
        new YaripChannelReplace(channel, redObj.newURI, function(oldChannel, newChannel) {
                yarip.logContentLocation(STATUS_REDIRECTED, location, newChannel.URI, null, addressObj);
            });
        break;
    }
}
YaripObserver.prototype.shouldRedirect = function(addressObj, location, channel, defaultView, isPage)
{
    var statusObj = {
        status: STATUS_UNKNOWN,
        newURI: null
    };

    if (!addressObj.found) return statusObj;

    if (!isPage) {
        var contentLocation = yarip.getContentLocationFromContentLocation(channel.URI);
        statusObj.status = yarip.shouldBlacklist(addressObj, contentLocation.asciiSpec, defaultView);
        if (statusObj.status === STATUS_BLACKLISTED) {
            return statusObj;
        }
    }

    for (var pageName in addressObj.ext)
    {
        var extItem = addressObj.ext[pageName];

        /*
         * REQUEST HEADER
         */

        var list = isPage ? yarip.map.get(pageName).pageRequestHeaderList : yarip.map.get(pageName).contentRequestHeaderList;
        if (extItem.getDoHeaders() && list.length > 0)
        {
            for each (var item in list.obj)
            {
                if (!item.getRegExpObj().test(channel.URI.asciiSpec)) continue;

                var sandbox = new Cu.Sandbox(defaultView ? defaultView : channel.URI.asciiSpec);
                var headerValue = null;
                try { headerValue = channel.getRequestHeader(item.getHeaderName()) } catch (e) {}
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
                        Cu.reportError("Yarip: Function doesn't return a string!\nPage: " + pageName + " > "+ (isPage ? "Page" : "Content") + " > Header > Request: " + item.getHeaderName());
                        continue;
                    }

                    channel.setRequestHeader(item.getHeaderName(), headerValue, item.getMerge());

                    if (extItem.isSelf()) {
                        item.incrementLastFound();
                    }

                    if (defaultView) defaultView.yaripStatus = "found";
                } catch (e) {
                    Cu.reportError("Yarip: Couldn't set request-header!\nPage: " + pageName + " > "+ (isPage ? "Page" : "Content") + " > Header > Request: " + item.getHeaderName() + "\n*** e=" + e);
//                    CS.logMessage(message);
//                    CS.logStringMessage(message);
                }
            }
        }

        /*
         * REDIRECT
         */

        var list = isPage ? yarip.map.get(pageName).pageRedirectList : yarip.map.get(pageName).contentRedirectList;
        if (extItem.getDoRedirects() && list.length > 0)
        {
            for each (var item in list.obj)
            {
                if (!item.getRegExpObj().test(channel.URI.asciiSpec)) continue;

//                try
//                {
                    var newSpec = channel.URI.asciiSpec.replace(item.getRegExpObj(), item.getNewSubStr());
                    var newURI = IOS.newURI(newSpec, channel.URI.originCharset, null);

                    if (extItem.isSelf()) {
                        item.incrementLastFound();
                    }

                    if (defaultView) defaultView.yaripStatus = "found";

                    addressObj.itemObj = {
                        pageName: pageName,
                        ruleType: isPage ? TYPE_PAGE_REDIRECT : TYPE_CONTENT_REDIRECT,
                        itemKey: item.getKey()
                    };
                    statusObj.status = STATUS_REDIRECTED;
                    statusObj.newURI = newURI;
                    return statusObj;
//                } catch (e) {
//                    Cu.reportError("Yarip: Couldn't redirect!\n" + e + "\n" + pageName + ": " + newSpec);
////                    CS.logMessage(message);
////                    CS.logStringMessage(message);
//                }
            }
        }
    }

    if (isPage) {
        statusObj.status = STATUS_WHITELISTED;
        return statusObj;
    } else {
        return statusObj;
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

    yarip.updateContentType(null, location, channel.URI, channel.contentType, channel.responseStatus);

    if (!yarip.enabled) return;

    var addressObj = yarip.getAddressObjByLocation(location, true);
    if (!addressObj.found) return;

    var isPage = locObj.isPage;
    var isLinking = locObj.isLinking;

    if ([300, 301, 302, 303, 305, 307].indexOf(channel.responseStatus) > -1)
    {
        if (!isLinking || yarip.privateBrowsing)
        {
            /*
             * BLACKLIST (show link notification)
             */

            try
            {
                var locationHeader = channel.getResponseHeader("Location");
                if (locationHeader)
                {
                    var newURI = IOS.newURI(locationHeader, channel.URI.originCharset, null);
                    var contentLocation = yarip.getContentLocationFromContentLocation(newURI);

                    var status = yarip.shouldBlacklist(addressObj, contentLocation.asciiSpec, defaultView, isLinking ? 7 : 2 /* link or content */);
                    switch (status) {
                    case STATUS_BLACKLISTED:
                        channel.cancel(Cr.NS_ERROR_ABORT);
                        /*if (!isPage)*/ yarip.logContentLocation(STATUS_BLACKLISTED, location, contentLocation, null, addressObj);
                        if (addressObj.itemObj.ruleType != TYPE_CONTENT_BLACKLIST) { // not blacklisted-rule
                            /*if (isLinking)*/ yarip.showLinkNotification(doc, contentLocation);
                        }
                        return;
                    }
                }
            } catch (e) {
            }
        }
    }
    else
    {
        /*
         * PAGE SCRIPTING & STREAM REPLACING
         */

        // TODO Make this an user-preference!
//        if (/^(?:text\/.*|application\/(?:javascript|json|(?:\w+\+)?\bxml))$/.test(channel.contentType)) {
        if (isPage && /^(?:text\/.*|application\/(?:javascript|json|(?:\w+\+)?\bxml))$/.test(channel.contentType)) {
//        if (!fromCache && /^(?:text\/.*|application\/(?:javascript|json|(?:\w+\+)?\bxml))$/.test(channel.contentType)) {
//            new YaripResponseStreamListener(channel, addressObj, isLinking);
//            new YaripResponseStreamListener(channel, addressObj, isPage);
            new YaripResponseStreamListener(channel, addressObj);
        }
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
                    if (!item.getRegExpObj().test(channel.URI.asciiSpec)) continue;

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
                            Cu.reportError("Yarip: Function doesn't return a string!\nPage: " + pageName + " > "+ (isPage ? "Page" : "Content") + " > Header > Response: " + item.getHeaderName());
                            continue;
                        }

                        channel.setResponseHeader(item.getHeaderName(), headerValue, item.getMerge());

                        if (extItem.isSelf()) {
                            item.incrementLastFound();
                        }
                    } catch (e) {
                        Cu.reportError("Yarip: Couldn't set request-header!\nPage: " + pageName + " > "+ (isPage ? "Page" : "Content") + " > Header > Response: " + item.getHeaderName() + "\n*** e=" + e);
//                        CS.logMessage(message);
//                        CS.logStringMessage(message);
                    }
                }
            }
        }
    }
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

