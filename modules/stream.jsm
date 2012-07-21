
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

const EXPORTED_SYMBOLS = [
        "YaripRedirectStreamListener",
        "YaripResponseStreamListener"
    ];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");

function YaripRedirectStreamListener(channel, callback)
{
    if (!(channel instanceof Ci.nsITraceableChannel)) return;

    channel.QueryInterface(Ci.nsITraceableChannel);

    this.listener = channel.setNewListener(this);
    this.callback = callback;
    this.isCanceled = false;
}
YaripRedirectStreamListener.prototype.sb = SB.createBundle("chrome://yarip/locale/stream.properties");
YaripRedirectStreamListener.prototype = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIStreamListener])
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIRequestObserver#onStartRequest%28%29
YaripRedirectStreamListener.prototype.onStartRequest = function(request, context)
{
    try {
        if (this.callback()) {
            this.isCanceled = true;
            request.cancel(Cr.NS_BINDING_REDIRECTED);
        }

        this.listener.onStartRequest(request, context);
    } catch (e) {
        yarip.logMessage(LOG_ERROR, e);
    }
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIRequestObserver#onStopRequest%28%29
YaripRedirectStreamListener.prototype.onStopRequest = function(request, context, statusCode)
{
    if (!this.isCanceled) {
        this.listener.onStopRequest(request, context, statusCode);
    }
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIStreamListener#onDataAvailable%28%29
YaripRedirectStreamListener.prototype.onDataAvailable = function(request, context, inputStream, offset, count)
{
    var bis = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
    bis.setInputStream(inputStream);
    var data = bis.readBytes(count);
    var ss = Cc["@mozilla.org/storagestream;1"].createInstance(Ci.nsIStorageStream);
    var bos = Cc["@mozilla.org/binaryoutputstream;1"].createInstance(Ci.nsIBinaryOutputStream);
    ss.init(8192, count, null);
    bos.setOutputStream(ss.getOutputStream(0));
    bos.writeBytes(data, count);
    this.listener.onDataAvailable(request, context, ss.newInputStream(0), offset, count);
}

function YaripResponseStreamListener(channel, addressObj)
{
    if (!(channel instanceof Ci.nsITraceableChannel)) return;

    channel.QueryInterface(Ci.nsITraceableChannel);

    this.listener = channel.setNewListener(this);
    this.addressObj = addressObj;
    this.receivedData = [];
}
YaripResponseStreamListener.prototype.sb = SB.createBundle("chrome://yarip/locale/stream.properties");
YaripResponseStreamListener.prototype = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIStreamListener])
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIRequestObserver#onStartRequest%28%29
YaripResponseStreamListener.prototype.onStartRequest = function(request, context)
{
    try {
        this.listener.onStartRequest(request, context);
    } catch (e) {
        yarip.logMessage(LOG_ERROR, e);
    }
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIRequestObserver#onStopRequest%28%29
YaripResponseStreamListener.prototype.onStopRequest = function(request, context, statusCode)
{
    var responseSource = this.receivedData.join("");

    try {
        request.QueryInterface(Ci.nsIChannel);

        /*
         * PAGE STREAM REPLACING
         */

        var arr = [];
        this.addressObj.root.traverse(function (item) {
            if (item.isSelf() || item.getDoStreams()) arr.push(item);
        });

        for (var i = 0; i < arr.length; i++)
        {
            var extItem = arr[i];
            var page = yarip.map.get(extItem.getId());
            var list = page.pageStreamList;
            if (list && list.length > 0)
            {
                for each (var item in list.obj)
                {
                    try {
                        var script = item.getScript();
                        var matches = responseSource.match(item.getRegExpObj());
                        if (matches) {
                            if (extItem.isSelf()) {
                                item.incrementLastFound();
                            }

                            var isFun = false;
                            if (/^\s*function\b/.test(script)) {
                                var sandbox = new Cu.Sandbox(request.URI.asciiSpec);
                                sandbox.matches = matches;
                                Cu.evalInSandbox("(" + item.getScript() + ")(matches);", sandbox);
                                isFun = true;
                            }

                            var index = 0;
                            for (var j = 0; j < matches.length; j++) {
                                var searchIndex = responseSource.substring(index).search(item.getFirstRegExpObj());
                                if (searchIndex > 0) index += searchIndex;
                                var respBeg = responseSource.substring(0, index);
                                var respEnd = responseSource.substring(index);
                                var m = respEnd.match(item.getFirstRegExpObj());
                                var matchLength = m[0].length;
                                var oldRespLength = responseSource.length;
                                responseSource = respBeg + respEnd.replace(item.getFirstRegExpObj(), isFun ? matches[j] : script);
                                var newRespLength = responseSource.length;
                                index += matchLength + newRespLength - oldRespLength;
                            }
                        }
                    } catch (e) {
                        yarip.logMessage(LOG_ERROR, e);
                    }
                }
            }
        }

        /*
         * PAGE SCRIPTING AND STYLING
         */

        var headTopPart = ""; // head-top
        var headMidPart = ""; // head-middle
        var headBodPart = ""; // head-bottom/body-top
        var bodyMidPart = ""; // body-middle
        var bodyBotPart = ""; // body-bottom

        // search HTML
        var htmlRe = /<\s*html[^>]*>/i;
        var htmlBeg = responseSource.search(htmlRe);
        if (htmlBeg == -1) {
            this.onDataAvailable0(request, context, responseSource, 0, responseSource.length);
            this.listener.onStopRequest(request, context, statusCode);
            return;
        }

        var tmpSource = "";

        // search HEAD
        var headRe = /<\s*head[^>]*>/i;
        var headEndRe = /<\s*\/\s*head[^>]*>/i;
        var headBeg = responseSource.substring(htmlBeg).search(headRe);
        var headEnd = null;
        if (headBeg == -1) { // no head-begin
            // insert HEAD
            var headBeg = htmlBeg + responseSource.substring(htmlBeg).match(htmlRe)[0].length;
            headTopPart = responseSource.substring(0, headBeg) + "<head>";
            tmpSource = "</head>" + responseSource.substring(headBeg);
            headBeg += "<head>".length;
            headEnd = headBeg;
        } else {
            headBeg += htmlBeg;
            headBeg += responseSource.substring(headBeg).match(headRe)[0].length;
            var searchIndex = responseSource.substring(headBeg).search(headEndRe);
            if (searchIndex == -1) { // no head-end
                this.onDataAvailable0(request, context, responseSource, 0, responseSource.length);
                this.listener.onStopRequest(request, context, statusCode);
                return;
            } else {
                headEnd = headBeg + searchIndex;
                headTopPart = responseSource.substring(0, headBeg);
                headMidPart = responseSource.substring(headBeg, headEnd);
                tmpSource = responseSource.substring(headEnd);
            }
        }

        // search BODY
        var bodyRe = /<\s*body[^>]*>/i;
        var bodyEndRe = /<\s*\/\s*body[^>]*>/i;
        var bodyBeg = tmpSource.search(bodyRe);
        var bodyEnd = null;
        if (bodyBeg == -1) { // no body-begin
            // insert BODY
            var bodyBeg = tmpSource.match(headEndRe)[0].length;
            headBodPart = tmpSource.substring(0, bodyBeg) + "<body>";
            bodyBotPart = "</body>" + tmpSource.substring(bodyBeg);
            bodyBeg += "<body>".length;
            bodyEnd = bodyBeg;
        } else {
            bodyBeg += tmpSource.substring(bodyBeg).match(bodyRe)[0].length;
            var searchIndex = tmpSource.substring(bodyBeg).search(bodyEndRe);
            if (searchIndex == -1) { // no body-end
                this.onDataAvailable0(request, context, tmpSource, 0, tmpSource.length);
                this.listener.onStopRequest(request, context, statusCode);
                return;
            } else {
                bodyEnd = bodyBeg + searchIndex;
                headBodPart = tmpSource.substring(0, bodyBeg);
                bodyMidPart = tmpSource.substring(bodyBeg, bodyEnd);
                bodyBotPart = tmpSource.substring(bodyEnd);
            }
        }

        arr = [];
        this.addressObj.root.traverse(function (item) {
            if (item.isSelf() || item.getDoElements() || item.getDoScripts()) arr.push(item);
        });

        var headStyles = "";
        var headScripts = "";
        var bodyStyles = "";
        var bodyScripts = "";

        // Iterating from end to beginning (dependencies).
        for (var i = arr.length - 1; i >= 0; i--)
        {
            var extItem = arr[i];
            var pageName = extItem.getId();
            var page = yarip.map.get(pageName);

            // element-blacklist styling
            var tmp = page.elementBlacklist.generateCSS();
            if (tmp) {
                headStyles += "\n<style id=\"yarip-page-style_" + pageName.replace(/\W/g, "-") + "\" type=\"text/css\" status=\"whitelisted\">" + tmp + "</style>";
            }

            // page styling
            if (extItem.getDoElements())
            {
                var list = page.pageStyleList;
                if (list.length > 0)
                {
                    var idPrefix = "yarip-page-style_" + pageName.replace(/\W/g, "-") + "_";
                    var counter = 0;
                    for each (var item in list.obj)
                    {
                        var value = item.getStyle();
                        if (!value) continue;

                        var id = idPrefix + counter++;
                        switch (item.getXPath()) {
                        case "/html/head":
                            headStyles += "\n<style id=\"" + id + "\" type=\"text/css\" status=\"whitelisted\">" + value + "</style>";
                            break;
                        case "/html/body":
                            bodyStyles += "<style id=\"" + id + "\" type=\"text/css\" status=\"whitelisted\">" + value + "</style>\n";
                            break;
                        default:
                            continue;
                        }

                        if (extItem.isSelf()) {
                            item.incrementFound();
                        }
                    }
                }
            }

            // page scripting
            if (extItem.getDoScripts())
            {
                var list = page.pageScriptList;
                if (list.length > 0)
                {
                    var idPrefix = "yarip-page-script_" + pageName.replace(/\W/g, "-") + "_";
                    var counter = 0;
                    for each (var item in list.obj)
                    {
                        var value = item.getScript();
                        if (!value) continue;

                        var id = idPrefix + counter++;
                        switch (item.getXPath()) {
                        case "/html/head":
                            headScripts += "\n<script id=\"" + id + "\" type=\"text/javascript\" status=\"whitelisted\">" + value + "</script>";
                            break;
                        case "/html/body":
                            bodyScripts += "<script id=\"" + id + "\" type=\"text/javascript\" status=\"whitelisted\">" + value + "</script>\n";
                            break;
                        default:
                            continue;
                        }

                        if (extItem.isSelf()) {
                            item.incrementFound();
                        }
                    }
                }
            }
        }

        if (headScripts || bodyScripts) {
            headScripts = "\n<script id=\"yarip-default-script\" type=\"text/javascript\" status=\"whitelisted\">" + yarip.getYaripScript() + "</script>" + headScripts;
        }

        if (headStyles || headScripts || bodyStyles || bodyScripts) {
            responseSource = headTopPart + headStyles + headScripts + headMidPart + headBodPart + bodyMidPart + bodyStyles + bodyScripts + bodyBotPart;
        }
    } catch (e) {
        yarip.logMessage(LOG_ERROR, e);
    } finally {
        this.onDataAvailable0(request, context, responseSource, 0, responseSource.length);
        this.listener.onStopRequest(request, context, statusCode);
    }
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIStreamListener#onDataAvailable%28%29
YaripResponseStreamListener.prototype.onDataAvailable = function(request, context, inputStream, offset, count)
{
    var bis = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
    bis.setInputStream(inputStream);
    this.receivedData.push(bis.readBytes(count));
}
YaripResponseStreamListener.prototype.onDataAvailable0 = function(request, context, data, offset, count)
{
    try
    {
        var beg = 0;
//        var end = 8191; // 8 kb
        var end = 98304 - 12; // ~96 kb
        var tmpData = data.substring(beg, end);
        while (tmpData != "")
        {
            var ss = Cc["@mozilla.org/storagestream;1"].createInstance(Ci.nsIStorageStream);
            var bos = Cc["@mozilla.org/binaryoutputstream;1"].createInstance(Ci.nsIBinaryOutputStream);
            count = tmpData.length;
            ss.init(8192, count, null);
            bos.setOutputStream(ss.getOutputStream(0));
            bos.writeBytes(tmpData, count);
            this.listener.onDataAvailable(request, context, ss.newInputStream(0), offset, count);
            offset += count;
            beg = end;
            end += 8192;
            tmpData = data.substring(beg, end);
        }
    } catch (e) {
        yarip.logMessage(LOG_ERROR, e);
    }
}

