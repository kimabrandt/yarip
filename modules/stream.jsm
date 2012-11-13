
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

const stringBundle = SB.createBundle("chrome://yarip/locale/stream.properties");

function YaripRedirectStreamListener(channel, callback)
{
    if (!(channel instanceof Ci.nsITraceableChannel)) return;

    channel.QueryInterface(Ci.nsITraceableChannel);

    this.listener = channel.setNewListener(this);
    this.callback = callback;
    this.isCanceled = false;
}
YaripRedirectStreamListener.prototype = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIStreamListener])
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIRequestObserver#onStartRequest%28%29
YaripRedirectStreamListener.prototype.onStartRequest = function(request, context)
{
    try {
        if (this.callback()) {
            request.cancel(Cr.NS_BINDING_REDIRECTED);
            this.isCanceled = true;
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

//function YaripResponseStreamListener(addressObj, location, defaultView, channel, isPage)
function YaripResponseStreamListener(channel, addressObj, location, contentLocation, defaultView, isPage)
{
    if (!(channel instanceof Ci.nsITraceableChannel)) return;

    channel.QueryInterface(Ci.nsITraceableChannel);

    this.listener = channel.setNewListener(this);
    this.addressObj = addressObj;
    this.location = location;
    this.defaultView = defaultView;
    this.isPage = isPage;
    this.receivedData = [];
}
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

    try
    {
        request.QueryInterface(Ci.nsIChannel);

        /*
         * STREAM REPLACING
         */

        var arr = [];
        var tmp = [];
        var first = true;
        this.addressObj.root.traverse(function (item) {
//            if (item.isSelf() || item.getDoStreams()) arr.push(item);
            if (item.isSelf()) {
                if (first) {
                    arr.push(item);
                    first = false;
                } else {
                    tmp.push(item); // added to the end
                }
            } else if (item.getDoStreams()) {
                arr.push(item);
            }
        });
        arr = arr.concat(tmp);

        var searchIndex = null;

        for (var i = 0; i < arr.length; i++)
        {
            var extItem = arr[i];
            var page = extItem.getPage();
            var list = this.isPage ? page.pageStreamList : page.contentStreamList;
            if (list.length === 0) continue;

            for each (var item in list.obj)
            {
                try
                {
                    var tmp = null;
                    if (/^\s*function\b/.test(item.getScript()))
                    {
                        var sandbox = new Cu.Sandbox(this.defaultView ? this.defaultView : this.location.asciiHref);
                        if (/^\s*function\s*\(\s*matches\s*\)/.test(item.getScript())) // deprecated: script with matches-array as parameter
                        {
                            // XXX Deprecated
                            yarip.logMessage(LOG_WARNING, new Error(stringBundle.formatStringFromName("WARN_MATCHES_DEPRECATED", [], 0)));

                            var matches = responseSource.match(item.getAllStreamRegExpObj());
                            if (!matches) continue;

                            var isFun = false;
                            if (/^\s*function\b/.test(item.getScript())) {
                                sandbox.matches = matches;
                                Cu.evalInSandbox("(" + item.getScript() + ")(matches);", sandbox);
                                isFun = true;
                            }

//                                if (!(matches instanceof Array)) {
//                                    yarip.logMessage(LOG_WARNING, new Error(stringBundle.formatStringFromName("WARN_MATCHES_NOT_INSTANCEOF_ARRAY2", [page.getName(), item.getStreamRegExp()], 2)));
//                                    continue;
//                                }

                            var index = 0;
                            tmp = responseSource;
                            for (var j = 0; j < matches.length; j++)
                            {
                                if (typeof matches[j] != "string") {
                                    yarip.logMessage(LOG_WARNING, new Error(stringBundle.formatStringFromName("WARN_VALUE_NOT_A_STRING3", [page.getName(), item.getStreamRegExp(), j], 3)));
                                    continue;
                                }

                                searchIndex = tmp.substring(index).search(item.getFirstStreamRegExpObj());
                                if (searchIndex > 0) index += searchIndex;
                                var respBeg = tmp.substring(0, index);
                                var respEnd = tmp.substring(index);
                                var m = respEnd.match(item.getFirstStreamRegExpObj());
                                var matchLength = m[0].length;
                                var oldRespLength = tmp.length;
                                tmp = respBeg + respEnd.replace(item.getFirstStreamRegExpObj(), isFun ? matches[j] : item.getScript());
                                var newRespLength = tmp.length;
                                index += matchLength + newRespLength - oldRespLength;
                            }
                        }
                        else // replace() with function as parameter
                        {
                            sandbox.responseSource = responseSource;
                            sandbox.regexp = item.getStreamRegExpObj();
                            tmp = Cu.evalInSandbox("responseSource.replace(regexp, " + item.getScript() + "\n);", sandbox);

                            if (typeof tmp != "string") {
                                yarip.logMessage(LOG_WARNING, new Error(stringBundle.formatStringFromName("WARN_VALUE_NOT_A_STRING2", [page.getName(), item.getStreamRegExp()], 2)));
                                continue;
                            }
                        }
                    } else {
                        tmp = responseSource.replace(item.getStreamRegExpObj(), item.getScript());
                    }

                    if (responseSource != tmp) {
                        responseSource = tmp;

                        if (extItem.isSelf()) {
                            item.incrementLastFound();
                        }

                        if (this.defaultView) this.defaultView.yaripStatus = "found";
                    }
                } catch (e) {
                    yarip.logMessage(LOG_ERROR, e);
                }
            }
        }

        if (!this.isPage) return;

        /*
         * PAGE SCRIPTING AND STYLING
         */

        // HTML-begin
        var doctypeRegExp = /<!doctype\b[^>]*>/i;
        var htmlBegRegExp = /<\s*html\b[^>]*>/i;
        searchIndex = responseSource.search(htmlBegRegExp);
        if (searchIndex == -1) // no HTML-begin
        {
            searchIndex = responseSource.search(doctypeRegExp);
            if (searchIndex == -1) { // no DOCTYPE
                return;
            } else {
                searchIndex += responseSource.substring(searchIndex).match(doctypeRegExp)[0].length;
                responseSource = responseSource.substring(0, searchIndex) + "<html>" + responseSource.substring(searchIndex);
            }
        }

        var headStyles = "";
        var headScripts = "";
        var bodyStyles = "";
        var bodyScripts = "";

        arr = [];
        this.addressObj.root.traverse(function (item) {
            if (item.isSelf() || item.getDoElements() || item.getDoScripts()) arr.push(item);
        });

        // Iterating from end to beginning (dependencies).
        for (var i = arr.length - 1; i >= 0; i--)
        {
            var extItem = arr[i];
            var page = extItem.getPage();
            var pageName = page.getName();

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

        if (!headStyles && !headScripts && !bodyStyles && !bodyScripts) {
            return;
        }

        var headTopPart = ""; // head-top
        var headMidPart = ""; // head-middle
        var headBodPart = ""; // head-bottom/body-top
        var bodyMidPart = ""; // body-middle
        var bodyBotPart = ""; // body-bottom
        var tmpSource = responseSource.substring(searchIndex);
        var htmlBegIdx = searchIndex;

        // HEAD-begin
        var headBegRegExp = /<\s*head\b[^>]*>/i;
        searchIndex = tmpSource.search(headBegRegExp);
        if (searchIndex == -1) { // no HEAD-begin
            searchIndex = htmlBegIdx + tmpSource.match(htmlBegRegExp)[0].length;
            headTopPart = responseSource.substring(0, searchIndex) + "<head>";
        } else {
            searchIndex += htmlBegIdx + tmpSource.substring(searchIndex).match(headBegRegExp)[0].length;
            headTopPart = responseSource.substring(0, searchIndex);
        }

        tmpSource = responseSource.substring(searchIndex);

        // HEAD-end
        var headEndRegExp = /<\s*\/\s*head\b[^>]*>/i;
        searchIndex = tmpSource.search(headEndRegExp);
        if (searchIndex == -1) { // no HEAD-end
            tmpSource = "</head>" + tmpSource; // can be misplaced
        } else {
            headMidPart = tmpSource.substring(0, searchIndex);
            tmpSource = tmpSource.substring(searchIndex);
        }

        // BODY-begin
        var bodyBegRegExp = /<\s*(?:body|(frameset))\b[^>]*>/i;
        searchIndex = tmpSource.search(bodyBegRegExp);
        var isFrameset = false;
        if (searchIndex == -1) { // no BODY-begin
            searchIndex = tmpSource.match(headEndRegExp)[0].length;
            headBodPart = tmpSource.substring(0, searchIndex) + "<body>";
        } else {
            var matches = tmpSource.substring(searchIndex).match(bodyBegRegExp);
            isFrameset = !!matches[1];
            searchIndex += matches[0].length;
            headBodPart = tmpSource.substring(0, searchIndex);
        }

        tmpSource = tmpSource.substring(searchIndex);

        // BODY-end
        if (!isFrameset)
        {
            var bodyEndRegExp = /<\s*\/\s*body\b[^>]*>/i;
            searchIndex = tmpSource.search(bodyEndRegExp);
            if (searchIndex == -1) { // no BODY-end
                bodyBotPart = "</body>" + tmpSource; // FIXME Can be misplaced!
            } else {
                bodyMidPart = tmpSource.substring(0, searchIndex);
                bodyBotPart = tmpSource.substring(searchIndex);
            }
        } else {
            bodyBotPart = tmpSource;
        }

        if (headScripts || bodyScripts) {
            headScripts = "\n<script id=\"yarip-default-script\" type=\"text/javascript\" status=\"whitelisted\">" + yarip.getYaripScript() + "</script>" + headScripts;
        }

        if (!isFrameset) {
            responseSource = headTopPart + headStyles + headScripts + headMidPart + headBodPart + bodyMidPart + bodyStyles + bodyScripts + bodyBotPart;
        } else {
            responseSource = headTopPart + headStyles + headScripts + headMidPart + headBodPart + bodyMidPart + bodyBotPart;
        }
    } catch (e) {
        yarip.logMessage(LOG_ERROR, e);
    } finally {
//dump("responseSource:"+responseSource+"\n\n--------------------------------------------------------------------------------\n\n");
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

