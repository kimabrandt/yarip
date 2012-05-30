
/*
Copyright 2007-2012 Kim A. Brandt <kimabrandt@gmx.de>

This file is part of yarip.

Yarip is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

Yarip is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with yarip; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
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

function YaripChannelReplace(oldChannel, newURI, callback)
{
    if (!(oldChannel instanceof Ci.nsITraceableChannel)) {
        return;
    }
    this.oldChannel = oldChannel;
    this.newChannel = IOS.newChannelFromURI(newURI);
    this.callback = callback;
    var ref = this;

    // nsIRequest
    if (this.oldChannel instanceof Ci.nsIRequest && this.newChannel instanceof Ci.nsIRequest) {
        var loadFlags = this.oldChannel.loadFlags;
//        loadFlags |= Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI;
//        loadFlags |= LOAD_REPLACE;
        if (this.oldChannel.URI.schemeIs("https")) {
            loadFlags &= ~Ci.nsIRequest.INHIBIT_PERSISTENT_CACHING;
        }
        this.newChannel.loadFlags = loadFlags;
//        this.newChannel.loadGroup = this.oldChannel.loadGroup;
        this.loadGroup = this.oldChannel.loadGroup;
    }

    // nsIChannel
    if (this.oldChannel instanceof Ci.nsIChannel && this.newChannel instanceof Ci.nsIChannel) {
        var loadFlags = this.newChannel.loadFlags;
        loadFlags |= Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI;
        loadFlags |= LOAD_REPLACE;
        this.newChannel.loadFlags = loadFlags;
//        this.newChannel.contentCharset = this.oldChannel.contentCharset;
//        this.newChannel.contentLength = this.oldChannel.contentLength;
//        this.newChannel.contentType = this.oldChannel.contentType;
        this.newChannel.notificationCallbacks = this.oldChannel.notificationCallbacks;
        this.newChannel.originalURI = this.oldChannel.originalURI;
        this.newChannel.owner = this.oldChannel.owner;
    }

    // nsIHttpChannel
    if (this.oldChannel instanceof Ci.nsIHttpChannel && this.newChannel instanceof Ci.nsIHttpChannel) {
        this.newChannel.allowPipelining = this.oldChannel.allowPipelining;
        this.newChannel.redirectionLimit = this.oldChannel.redirectionLimit;
        if (this.oldChannel.referrer) {
            this.newChannel.referrer = this.oldChannel.referrer;
        }
        this.newChannel.requestMethod = this.oldChannel.requestMethod;
        this.oldChannel.visitRequestHeaders({
            visitHeader: function(key, value) {
                if (!/^(Authorization|Cookie|Host)$|Cache|^If-/.test(key)) {
                    ref.newChannel.setRequestHeader(key, value, false);
                }
            }
        });
    }

    // nsIHttpChannelInternal
    if (this.oldChannel instanceof Ci.nsIHttpChannelInternal && this.newChannel instanceof Ci.nsIHttpChannelInternal) {
//        this.oldChannel.channelIsForDownload = this.newChannel.channelIsForDownload;
        if (this.oldChannel.URI == this.oldChannel.documentURI) {
            this.newChannel.documentURI = newURI;
        } else {
            this.newChannel.documentURI = this.oldChannel.documentURI;
        }
        this.oldChannel.forceAllowThirdPartyCookie = this.newChannel.forceAllowThirdPartyCookie;
    }

    // nsIEncodedChannel
    if (this.oldChannel instanceof Ci.nsIEncodedChannel && this.newChannel instanceof Ci.nsIEncodedChannel) {
        this.newChannel.applyConversion = this.oldChannel.applyConversion;
    }

    // nsIApplicationCacheChannel
    if ("nsIApplicationCacheChannel" in Ci && this.oldChannel instanceof Ci.nsIApplicationCacheChannel && this.newChannel instanceof Ci.nsIApplicationCacheChannel) {
//        this.newChannel.chooseApplicationCache = this.oldChannel.chooseApplicationCache;
        this.newChannel.inheritApplicationCache = this.oldChannel.inheritApplicationCache;
    }

    // nsIPropertyBag
    if (this.oldChannel instanceof Ci.nsIPropertyBag && this.newChannel instanceof Ci.nsIWritablePropertyBag) {
        var enumerator = this.oldChannel.enumerator;
        while (enumerator.hasMoreElements()) {
            var property = enumerator.getNext();
            this.newChannel.setProperty(property.name, property.value);
//            if (property.name) this.newChannel.setProperty(property.name, property.value);
        }
    }

//    this.oldChannel.cancel(Cr.NS_BINDING_REDIRECTED);

    this.runWhenPending(this.oldChannel, function() {
//        ref.oldChannel.cancel(Cr.NS_BINDING_REDIRECTED);
        new YaripRedirectStreamListener(ref.oldChannel, function() {
            var success = true;
            try {
                var flags = Ci.nsIChannelEventSink.REDIRECT_INTERNAL;

                var ces = Cc["@mozilla.org/netwerk/global-channel-event-sink;1"].getService(Ci.nsIChannelEventSink);
                ref.redirectChannel(ces, ref.oldChannel, ref.newChannel, flags);

//                var enumerator = Cc['@mozilla.org/categorymanager;1'].getService(Ci.nsICategoryManager).enumerateCategory("net-channel-event-sinks");
//                while (enumerator.hasMoreElements()) {
//                    ces = enumerator.getNext();
//                    if (ces instanceof Ci.nsIChannelEventSink) {
//                        ref.redirectChannel(ces, ref.oldChannel, ref.newChannel, flags);
//                    }
//                }

                ces = yarip.getInterface(ref.oldChannel, Ci.nsIChannelEventSink);
                if (ces) {
                    ref.redirectChannel(ces, ref.oldChannel, ref.newChannel, flags);
                }

//                ces = yarip.getInterface(ref.oldChannel, Ci.nsIHttpEventSink);
//                if (ces) {
//                    ces.onRedirect(ref.oldChannel, ref.newChannel);
//                }

                ref.newChannel.asyncOpen(this.listener, null);
                if (ref.callback) ref.callback(ref.oldChannel, ref.newChannel);
            } catch (e) {
                success = false;
//            } finally {
//                if (ref.loadGroup) {
//                    ref.loadGroup.removeRequest(ref.oldChannel, null, Cr.NS_BINDING_REDIRECTED);
//                }
            }
            return success;
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
    QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports, Ci.nsIAsyncVerifyRedirectCallback]),
    onRedirectVerifyCallback: function(result) {}
}

function YaripLoadGroup(request, callback)
{
    this.request = request;
    this.callback = callback;
    this.loadGroup = request.loadGroup;
    request.loadGroup = this;
}
YaripLoadGroup.prototype = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports, Ci.nsILoadGroup]),

    get activeCount() { return this.loadGroup ? this.loadGroup.activeCount : 0; },
    set defaultLoadRequest(value) { return this.loadGroup ? this.loadGroup.defaultLoadRequest = value : value; },
    get defaultLoadRequest() { return this.loadGroup ? this.loadGroup.defaultLoadRequest : null; },
    set groupObserver(value) { return this.loadGroup ? this.loadGroup.groupObserver = value : value; },
    get groupObserver() { return this.loadGroup ? this.loadGroup.groupObserver : null; },
    set notificationCallbacks(value) { return this.loadGroup ? this.loadGroup.notificationCallbacks = value : value; },
    get notificationCallbacks() { return this.loadGroup ? this.loadGroup.notificationCallbacks : null; },
    get requests() { return this.loadGroup ? this.loadGroup.requests : {
            QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports, Ci.nsISimpleEnumerator]),
            getNext: function() { return null; },
            hasMoreElements: function() { return false; }
        }
    },

    addRequest: function(request, context)
    {
        if (this.callback) {
            try {
                this.callback();
            } catch (e) {
            }
        }
        if (this.loadGroup) this.loadGroup.addRequest(request, context);
    },

    removeRequest: function(request, context, status)
    {
        if (this.loadGroup) this.loadGroup.removeRequest(request, context, status);
    }
}

