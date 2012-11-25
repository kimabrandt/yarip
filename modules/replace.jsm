
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

const EXPORTED_SYMBOLS = ["YaripChannelReplace"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/stream.jsm");

const stringBundle = SB.createBundle("chrome://yarip/locale/replace.properties");

function YaripChannelReplace(oldChannel, newURI, callback)
{
    if (!(oldChannel instanceof Ci.nsITraceableChannel)) return;

    this.oldChannel = oldChannel;
    this.newChannel = IOS.newChannelFromURI(newURI);
    this.callback = callback;
    var ref = this;

    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/NsIRequest
    if (this.oldChannel instanceof Ci.nsIRequest && this.newChannel instanceof Ci.nsIRequest) {
        var loadFlags = this.oldChannel.loadFlags;
        if (loadFlags & LOAD_FLAG_REPLACE) return; // FIXME

//        loadFlags |= Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI;
//        loadFlags |= LOAD_REPLACE;
        loadFlags |= LOAD_FLAG_REPLACE; // FIXME
        if (this.oldChannel.URI.schemeIs("https")) {
            loadFlags &= ~Ci.nsIRequest.INHIBIT_PERSISTENT_CACHING;
        }
        this.newChannel.loadFlags = loadFlags;
//        this.newChannel.loadGroup = this.oldChannel.loadGroup;
        this.loadGroup = this.oldChannel.loadGroup;
    }

    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIChannel
    if (this.oldChannel instanceof Ci.nsIChannel && this.newChannel instanceof Ci.nsIChannel) {
//        var loadFlags = this.newChannel.loadFlags;
        var loadFlags = this.oldChannel.loadFlags;
        if (loadFlags & LOAD_FLAG_REPLACE) return; // FIXME

        loadFlags |= Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI;
        loadFlags |= LOAD_REPLACE;
        loadFlags |= LOAD_FLAG_REPLACE; // FIXME
        this.newChannel.loadFlags = loadFlags;
//        this.newChannel.contentCharset = this.oldChannel.contentCharset;
//        this.newChannel.contentLength = this.oldChannel.contentLength;
//        this.newChannel.contentType = this.oldChannel.contentType;
        this.newChannel.notificationCallbacks = this.oldChannel.notificationCallbacks;
        this.newChannel.originalURI = this.oldChannel.originalURI;
        this.newChannel.owner = this.oldChannel.owner;
    }

    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIHttpChannel
    if (this.oldChannel instanceof Ci.nsIHttpChannel && this.newChannel instanceof Ci.nsIHttpChannel) {
        if (this.oldChannel.redirectionLimit <= 0) {
            yarip.logMessage(LOG_WARNING, new Error(stringBundle.formatStringFromName("WARN_REDIRECTION_LIMIT2", [this.oldChannel.URI.spec, this.newChannel.URI.spec], 2)));
            return;
        }
        this.newChannel.allowPipelining = this.oldChannel.allowPipelining;
//        this.newChannel.redirectionLimit = this.oldChannel.redirectionLimit;
        this.newChannel.redirectionLimit = this.oldChannel.redirectionLimit - 1;
        if (this.oldChannel.referrer) {
            this.newChannel.referrer = this.oldChannel.referrer;
        }
        this.newChannel.requestMethod = this.oldChannel.requestMethod;
        if (this.newChannel.URI.host == this.oldChannel.URI.host) {
            this.oldChannel.visitRequestHeaders({
                visitHeader: function(key, value) {
//                    if (!/^(Authorization|Cookie|Host)$|Cache|^If-/.test(key)) {
                        ref.newChannel.setRequestHeader(key, value, false);
//                    }
                }
            });
        }
    }

    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIHttpChannelInternal
    if (this.oldChannel instanceof Ci.nsIHttpChannelInternal && this.newChannel instanceof Ci.nsIHttpChannelInternal) {
//        this.oldChannel.channelIsForDownload = this.newChannel.channelIsForDownload;
        if (this.oldChannel.URI == this.oldChannel.documentURI) {
            this.newChannel.documentURI = newURI;
        } else {
            this.newChannel.documentURI = this.oldChannel.documentURI;
        }
        this.oldChannel.forceAllowThirdPartyCookie = this.newChannel.forceAllowThirdPartyCookie;
    }

    // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIEncodedChannel
//    if (this.oldChannel instanceof Ci.nsIEncodedChannel && this.newChannel instanceof Ci.nsIEncodedChannel) {
//        this.newChannel.applyConversion = this.oldChannel.applyConversion;
//    }

    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/NsIApplicationCacheChannel
    if ("nsIApplicationCacheChannel" in Ci && this.oldChannel instanceof Ci.nsIApplicationCacheChannel && this.newChannel instanceof Ci.nsIApplicationCacheChannel) {
//        this.newChannel.chooseApplicationCache = this.oldChannel.chooseApplicationCache;
        this.newChannel.inheritApplicationCache = this.oldChannel.inheritApplicationCache;
    }

    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/NsIPropertyBag
    if (this.oldChannel instanceof Ci.nsIPropertyBag && this.newChannel instanceof Ci.nsIWritablePropertyBag) {
        var enumerator = this.oldChannel.enumerator;
        while (enumerator.hasMoreElements()) {
            var property = enumerator.getNext();
            this.newChannel.setProperty(property.name, property.value);
//            if (property.name) {
//                this.newChannel.setProperty(property.name, property.value);
//            }
        }
    }

    this.runWhenPending(this.oldChannel, function()
    {
        new YaripRedirectStreamListener(ref.oldChannel, function() {
            try
            {
                var flags = Ci.nsIChannelEventSink.REDIRECT_INTERNAL;

                var ces = Cc["@mozilla.org/netwerk/global-channel-event-sink;1"].getService(Ci.nsIChannelEventSink);
                ref.redirectChannel(ces, ref.oldChannel, ref.newChannel, flags);

                ces = yarip.getInterface(ref.oldChannel, Ci.nsIChannelEventSink);
                if (ces) {
                    ref.redirectChannel(ces, ref.oldChannel, ref.newChannel, flags);
                }

                ref.newChannel.asyncOpen(this.listener, null);
                if (ref.callback) {
                    ref.callback(ref.oldChannel, ref.newChannel);
                }

                return true;
            } catch (e) {
                return false;
            }
        });
    });
}
YaripChannelReplace.prototype.runWhenPending = function(request, callback)
{
    if (request.isPending()) {
        callback();
    } else {
        new YaripLoadGroup(request, callback);
    }
}
YaripChannelReplace.prototype.redirectChannel = function(channelEventSink, oldChannel, newChannel, flags)
{
    if (!(channelEventSink instanceof Ci.nsIChannelEventSink)) return;

    channelEventSink.QueryInterface(Ci.nsIChannelEventSink);
    channelEventSink.asyncOnChannelRedirect(oldChannel, newChannel, flags, this.verifyRedirectCallback);
}
YaripChannelReplace.prototype.verifyRedirectCallback = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIAsyncVerifyRedirectCallback]),
    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIAsyncVerifyRedirectCallback#onRedirectVerifyCallback%28%29
    onRedirectVerifyCallback: function(result) {
    }
}

function YaripLoadGroup(request, callback)
{
    this.request = request;
    this.callback = callback;
    this.loadGroup = request.loadGroup;
    request.loadGroup = this;
}
YaripLoadGroup.prototype = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsILoadGroup]),

    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsILoadGroup#Attributes
    get activeCount() { return this.loadGroup ? this.loadGroup.activeCount : 0; },
    set defaultLoadRequest(value) { return this.loadGroup ? this.loadGroup.defaultLoadRequest = value : value; },
    get defaultLoadRequest() { return this.loadGroup ? this.loadGroup.defaultLoadRequest : null; },
    set groupObserver(value) { return this.loadGroup ? this.loadGroup.groupObserver = value : value; },
    get groupObserver() { return this.loadGroup ? this.loadGroup.groupObserver : null; },
    set notificationCallbacks(value) { return this.loadGroup ? this.loadGroup.notificationCallbacks = value : value; },
    get notificationCallbacks() { return this.loadGroup ? this.loadGroup.notificationCallbacks : null; },
    get requests() { return this.loadGroup ? this.loadGroup.requests : {
            QueryInterface: XPCOMUtils.generateQI([Ci.nsISimpleEnumerator]),
            // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsISimpleEnumerator#getNext%28%29
            getNext: function() {
                return null;
            },
            // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsISimpleEnumerator#hasMoreElements%28%29
            hasMoreElements: function() {
                return false;
            }
        }
    }
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsILoadGroup#addRequest%28%29
YaripLoadGroup.prototype.addRequest = function(request, context)
{
    if (this.callback) {
        try {
            this.callback();
        } catch (e) {
        }
    }
    if (this.loadGroup) {
        this.loadGroup.addRequest(request, context);
    }
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsILoadGroup#removeRequest%28%29
YaripLoadGroup.prototype.removeRequest = function(request, context, status)
{
    if (this.loadGroup) {
        this.loadGroup.removeRequest(request, context, status);
    }
}

