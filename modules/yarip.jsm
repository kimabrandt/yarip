
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

const EXPORTED_SYMBOLS = ["Yarip"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/uri.jsm");

function Yarip() {
    this.mode = null;
    this.enabled = null;
    this.noFlicker = null;

    this.monitorDialogues = [];
    this.pageDialog = null;

    this.useIndex = 1; // when needed
    this.elementsInContext = 4;
    this.exclusiveOnCreation = false;
    this.templates = [];
    this.privateBrowsing = false;
    this.purgeInnerHTML = false;
    this.schemesRegExp = null;
    this.contentRecurrence = false;
    this.logWhenClosed = false;
    this.isMobile = false;

    this.map = null;
    this.undoObj = {};
    this.pageCreated = false;
    this.knownAddressObj = {};
}
Yarip.prototype = {
    classDescription: "Yet Another Remove It Permanently",
    classID: Components.ID("{46d09504-6a0b-40c8-8ce8-d07cf370d25e}"),
    contractID: "@yarip.mozdev.org;1",
    _xpcom_categories: [],
    QueryInterface: XPCOMUtils.generateQI([
            Ci.nsIObserver,
            Ci.nsIWebProgressListener,
            Ci.nsISupportsWeakReference])
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIObserver#observe%28%29
Yarip.prototype.observe = function(subject, topic, data)
{
    switch (topic) {
    case "quit-application":
        this.save();
        break;
    }
}
Yarip.prototype.getLocation = function(obj, channel, doc)
{
    if (!obj && !channel && !doc) return null;
    if (obj && obj.isLocation) return obj;

    var isPage = null;
    var isLink = null;
    if (channel) {
        isPage = (LOAD_DOCUMENT_URI & channel.loadFlags) === LOAD_DOCUMENT_URI;
        isLink = isPage || (LOAD_INITIAL_DOCUMENT_URI & channel.loadFlags) === LOAD_INITIAL_DOCUMENT_URI;

        if (!obj) {
            try {
                obj = IOS.newURI(channel.loadGroup.defaultLoadRequest.name, channel.URI.originCharset, null);
            } catch (e) {
                obj = doc && !isPage ? doc.location : channel.URI;
            }
        }
    }

    var scheme = "";
    var protocol = "";
    var host = "";
    var port = -1;
    var href = "";
    var pathname = "";
    var asciiHost = "";
    var asciiHref = "";
    var pageName = "";

    if ("assign" in obj) { // https://developer.mozilla.org/en/DOM/window.location
        try { host = obj.host.replace(/\.+(:\d+)?$/, "$1"); } catch(e) {}
        try { pathname = obj.pathname; } catch(e) {}
        try { port = obj.port; } catch(e) {}
        try { protocol = obj.protocol; } catch(e) {}
        try { scheme = obj.protocol.replace(/:$/, ""); } catch(e) {}
        try { href = protocol + "//" + host + pathname + obj.search + obj.hash; } catch(e) {}
        try { asciiHost = IDNS.convertUTF8toACE(host).replace(/\.+(:\d+)?$/, "$1"); } catch(e) {}
        try { pageName = protocol + "//" + asciiHost + pathname; } catch(e) {}
        try { asciiHref = pageName + obj.search + obj.hash; } catch(e) {}
    } else { // https://developer.mozilla.org/en/nsIURI
        try { scheme = obj.scheme; } catch (e) {}
        try { host = obj.hostPort.replace(/\.+(:\d+)?$/, "$1"); } catch (e) {}
//        try { host = obj.host.replace(/\.+$/, ""); } catch (e) {}
        try { href = obj.spec; } catch (e) {}
        try { pathname = obj.path.replace(/[?&#].*$/, ""); } catch(e) {}
        try { port = obj.port; } catch (e) {}
        try { protocol = obj.scheme + ":"; } catch(e) {}
        try { asciiHost = obj.asciiHost.replace(/\.+$/, "") + (port > -1 && port != 80 ? ":" + port : ""); } catch (e) {}
//        try { asciiHost = obj.asciiHost.replace(/\.+$/, ""); } catch (e) {}
        try { asciiHref = obj.asciiSpec; } catch (e) {}
        try { pageName = protocol + "//" + asciiHost + pathname; } catch (e) {}
    }

    return {
        scheme: scheme,
        protocol: protocol,
        host: host,
        port: port,
        href: href,
        pathname: pathname,
        asciiHost: asciiHost,
        asciiHref: asciiHref,
        pageName: pageName.replace(/[/]*$/, ""),
        isPage: isPage,
        isLink: isLink,
        isLocation: true
    }
}
Yarip.prototype.getPageName = function(location, mode)
{
    if (!location || !this.schemesRegExp.test(location.protocol.replace(/:$/, ""))) return null;

    var mode = Number(mode);
    if (isNaN(mode)) mode = this.mode;

    location = this.getLocation(location);
    try {
        switch (mode) {
        case MODE_PAGE: return location.pageName;
        case MODE_FQDN: return location.asciiHost;
        case MODE_SLD:
            var sld = location.asciiHost.match(FIND_SLD_RE);
            return sld ? sld[0] : null;
        }
    } catch (e) {
        return null;
    }
}
Yarip.prototype.init = function()
{
    Cu.import("resource://yarip/map.jsm");
    Cu.import("resource://yarip/page.jsm");
    Cu.import("resource://yarip/list.jsm");
    Cu.import("resource://yarip/item.jsm");
    Cu.import("resource://yarip/replace.jsm");

    this.map = new YaripMap();
    var file = this.getFile(FILE);
    this.load(file);
    this.check();

    this.initPreferences();
    if (!this.isMobile) this.initContentPolicy();
}
Yarip.prototype.initMobile = function()
{
    this.isMobile = true;

    Cu.import("resource://yarip/map.jsm");
    Cu.import("resource://yarip/page.jsm");
    Cu.import("resource://yarip/list.jsm");
    Cu.import("resource://yarip/item.jsm");
    Cu.import("resource://yarip/replace.jsm");
//        Cu.import("resource://yarip/stream.jsm");

    this.map = new YaripMap();

    this.initPreferences();
    this.initContentPolicy();
}
Yarip.prototype.initPreferences = function()
{
    this.toggleEnabled(this.getValue(PREF_ENABLED, true, DATA_TYPE_BOOLEAN));
    this.setMode(this.getValue(PREF_MODE, MODE_FQDN, DATA_TYPE_INTEGER));
    this.setUseIndex(this.getValue(PREF_INDEX, 1, DATA_TYPE_INTEGER));
    this.setElementsInContext(this.getValue(PREF_ELEMENTS, 4, DATA_TYPE_INTEGER));
    this.setPurgeInnerHTML(this.getValue(PREF_PURGE, false, DATA_TYPE_BOOLEAN));
    this.setExclusiveOnCreation(this.getValue(PREF_EXCLUSIVE, false, DATA_TYPE_BOOLEAN));
    this.setTemplates(this.getValue(PREF_TEMPLATES, "", DATA_TYPE_STRING));
    this.setSchemes(this.getValue(PREF_SCHEMES, "^https?$", DATA_TYPE_STRING));
    this.setPrivateBrowsing(this.getValue(PREF_PRIVATE, false, DATA_TYPE_BOOLEAN));
    this.setContentRecurrence(this.getValue(PREF_RECURRENCE, false, DATA_TYPE_BOOLEAN));
    this.toggleLogWhenClosed(this.getValue(PREF_LOG_WHEN_CLOSED, false, DATA_TYPE_BOOLEAN));
}
Yarip.prototype.initContentPolicy = function()
{
    const yaripContentPolicy = Cu.import("resource://yarip/contentPolicy.jsm", null).wrappedJSObject;
    const componentRegistrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
    if (componentRegistrar.isContractIDRegistered(yaripContentPolicy.contractID)) return;

    try {
        componentRegistrar.registerFactory(yaripContentPolicy.classID, yaripContentPolicy.classDescription, yaripContentPolicy.contractID, yaripContentPolicy);
    } catch (e) {
        Cu.reportError(e);
    }
    const categoryManager = XPCOMUtils.categoryManager;
    categoryManager.addCategoryEntry("content-policy", yaripContentPolicy.classDescription, yaripContentPolicy.contractID, false, true);
}
Yarip.prototype.toggleEnabled = function(enabled)
{
    if (enabled == this.enabled) return false;

    if (enabled != true && enabled != false) enabled = !this.enabled;
    this.enabled = enabled;

    if (enabled) this.toggleNoFlicker(this.getValue(PREF_FLICKER, false, DATA_TYPE_BOOLEAN), null, true);
    else this.toggleNoFlicker(false, true, true);

    this.setValue(PREF_ENABLED, enabled, DATA_TYPE_BOOLEAN); // notify
    return true;
}
Yarip.prototype.toggleNoFlicker = function(noFlicker, dontNotify, force)
{
    if (noFlicker == this.noFlicker && !force) return false;

    if (noFlicker != true && noFlicker != false) noFlicker = !this.getValue(PREF_FLICKER, false, DATA_TYPE_BOOLEAN);
    this.noFlicker = noFlicker;

    this.injectCSS("chrome://yarip/skin/noflicker.css", this.noFlicker && this.enabled);
    if (!dontNotify) this.setValue(PREF_FLICKER, this.noFlicker, DATA_TYPE_BOOLEAN); // notify
    return true;
}
Yarip.prototype.setMode = function(mode)
{
    mode = Number(mode);
    if (!isNaN(mode)) {
        this.mode = mode;
        this.setValue(PREF_MODE, mode, DATA_TYPE_INTEGER); // notify
        return true;
    } else {
        return false;
    }
}
Yarip.prototype.setUseIndex = function(value)
{
    value = Number(value);
    if (!isNaN(value) && [0, 1, 2].indexOf(value) > -1) {
        this.useIndex = value;
    }
}
Yarip.prototype.setElementsInContext = function(value)
{
    var value = Number(value);
    if (!isNaN(value) && value > 0 && value <= 20) {
        this.elementsInContext = value;
    }
}
Yarip.prototype.setPurgeInnerHTML = function(value)
{
    if (value == true || value == false) this.purgeInnerHTML = value;
}
Yarip.prototype.setExclusiveOnCreation = function(value)
{
    if (value == true || value == false) this.exclusiveOnCreation = value;
}
Yarip.prototype.setTemplates = function(value)
{
    this.templates = [];
    if (!value) return;

    this.templates = value.split(" ", 50); // 50 = max templates
}
Yarip.prototype.setSchemes = function(value)
{
    try {
        this.schemesRegExp = new RegExp(value);
    } catch (e) {}
}
Yarip.prototype.setPrivateBrowsing = function(value)
{
    if (value == true || value == false) this.privateBrowsing = value;
}
Yarip.prototype.setContentRecurrence = function(value)
{
    if (value == true || value == false) this.contentRecurrence = value;
}
Yarip.prototype.toggleLogWhenClosed = function(logWhenClosed)
{
    if (logWhenClosed == this.logWhenClosed) return false;
    if (logWhenClosed != true && logWhenClosed != false) {
        logWhenClosed = !this.getValue(PREF_LOG_WHEN_CLOSED, false, DATA_TYPE_BOOLEAN);
    }
    this.logWhenClosed = logWhenClosed;

    /*if (!dontNotify)*/ this.setValue(PREF_LOG_WHEN_CLOSED, this.logWhenClosed, DATA_TYPE_BOOLEAN); // notify
    return true;
}
Yarip.prototype.getPageRegExp = function(pageName, protocol, byUser)
{
    if (!pageName) return "^https?://([^/?#]+[@.])?example\\.net[/?#]";

    // TODO Use the protocol from the pageName!
    protocol = !protocol || /^https?:$/.test(protocol) ? "https?:" : protocol;
    var domain = pageName.replace(/^(([^:/?#]+):\/+)?|[/?#].*$/g, "").match(DOMAIN_RE);
    if (domain) {
        var domainNoPort = domain[DOMAIN_RE_INDEX];
        if (!byUser) domainNoPort = domainNoPort.match(FIND_SLD_RE)[0];
        var useWildcardExpr = !domain[DOMAIN_RE_IP_INDEX]; // notIP
        if (byUser && useWildcardExpr) {
            var uld = domain[DOMAIN_RE_ULD_INDEX];
            if (uld) {
                useWildcardExpr = uld.indexOf(".", uld.indexOf(".") + 1) == -1; // no more than one dot
            }
        }
        var port = domain[DOMAIN_RE_PORT_INDEX] ? ":" + domain[DOMAIN_RE_PORT_INDEX] : "";
        return "^" + protocol + "//" + (useWildcardExpr ? "([^/?#]+[@.])?" : "") + domainNoPort.replace(/([.*+?|()\[\]{}\\])/g, "\\$1") + port + "[/?#]";
    } else {
        return "^https?://([^/?#]+[@.])?example\\.net[/?#]";
    }
}
Yarip.prototype.getPageRegExpObj = function(pageName, protocol, byUser)
{
    if (!pageName) {
        return {
            regExp: "^http://([^/?#]+[@.])?example.net([/?#].*)",
            newSubStr: "https://$1example.net$2"
        };
    }

    var domain = pageName.replace(/^(([^:/?#]+):\/+)?|[/?#].*$/g, "").match(DOMAIN_RE);
    if (domain) {
        var domainNoPort = domain[DOMAIN_RE_INDEX];
        if (!byUser) domainNoPort = domainNoPort.match(FIND_SLD_RE)[0];
        var useWildcardExpr = !domain[DOMAIN_RE_IP_INDEX]; // notIP
        if (byUser && useWildcardExpr) {
            var uld = domain[DOMAIN_RE_ULD_INDEX];
            if (uld) {
                var index = uld.indexOf(".");
                useWildcardExpr = uld.indexOf(".", index + 1) == -1; // no more than one dot
            }
        }
        var port = domain[DOMAIN_RE_PORT_INDEX] ? ":" + domain[DOMAIN_RE_PORT_INDEX] : "";
        return {
            regExp: "^http://" + (useWildcardExpr ? "([^/?#]+[@.])?" : "") + domainNoPort.replace(/([.*+?|()\[\]{}\\])/g, "\\$1") + port + "([/?#].*)",
            newSubStr: "https://" + (useWildcardExpr ? "$1" : "") + domainNoPort + port + (useWildcardExpr ? "$2" : "$1")
        };
    } else {
        return {
            regExp: "^http://([^/?#]+[@.])?example.net([/?#].*)",
            newSubStr: "https://$1example.net$2"
        };
    }
}
Yarip.prototype.createPage = function(location, pageName, privateBrowsing, byUser)
{
    if (!location) return null;

    location = this.getLocation(location);
    if (!pageName) pageName = this.getPageName(location, this.mode);

    // Creating the page.
    var page = this.map.get(pageName);
    if (page) {
        page.setTemporary(false);
        return page;
    } else {
        page = new YaripPage(this.getId(), pageName);
        if (privateBrowsing) page.setTemporary(true);
    }

    // Adding the default WhitelistContent.
    if (this.exclusiveOnCreation || privateBrowsing) {
        var re = this.getPageRegExp(pageName, location.protocol, byUser);
        var content = new YaripContentWhitelistItem(re);
        page.contentWhitelist.add(content);
        page.contentWhitelist.setExclusive(true);
    }

    // Merging with templates.
    var addressObj = this.getAddressObj(pageName, false);
    if (!addressObj.found && this.templates.length > 0) {
        for (var i = 0; i < this.templates.length; i++) {
            page.merge(this.map.get(this.templates[i]));
        }
    }

    this.map.add(page);
    this.pageCreated = true;
    return page;
}
Yarip.prototype.hasAddress = function(reduceDomain)
{
    return this.getFirstAddress(reduceDomain) != null;
}
Yarip.prototype.getAddressObjByLocation = function(location, follow)
{
    var pageName = location ? location.pageName : null;
    if (!pageName) {
        return {
            obj: {},
            elementExclusive: false,
            exclusive: false,
            found: false,
            pageName: null
        };
    }

    var addressObj = this.getAddressObj(pageName, follow);
    if (!addressObj.found && this.privateBrowsing) {
        var page = this.createPage(location, null, true);
        this.reloadPage(page.getName());
        addressObj = this.getAddressObj(pageName, follow);
    }

    addressObj.pageName = pageName;
    return addressObj;
}
Yarip.prototype.getFirstAddress = function(reduceDomain)
{
    if (!reduceDomain) return null;

    reduceDomain = reduceDomain.replace(/[?&#].*$/, "");
    var tmpDomain = null;
    while (reduceDomain != tmpDomain)
    {
        var reducePath = reduceDomain;
        var tmpPath = null;
        while (reducePath != tmpPath)
        {
            var page = this.map.get(reducePath);
            if (page) return reducePath;

            tmpPath = reducePath;
            reducePath = reducePath.replace(/(\/|[^/]+)$/, "");
        }
        tmpDomain = reduceDomain;
        reduceDomain = reduceDomain.replace(/^(^[^/?#:]+:\/\/(?!$)|(?=([\w-~!$&'()*+,;=:@]+\.){2})[\w-~!$&'()*+,;=:@]+\.)|(?!^):\d+$/, "");
    }

    return null;
}
Yarip.prototype.getAddressMap = function(reduceDomain, follow, matchObj)
{
    var map = new YaripMap();
    if (typeof reduceDomain == "string") {
        var addressObj = this.getAddressObj(reduceDomain, follow, matchObj);
        for (var pageName in addressObj.ext) {
            map.add(this.map.get(pageName).clone());
        }
    } else { // instanceof Array
        for (var i = 0; i < reduceDomain.length; i++) {
            var addressObj = this.getAddressObj(reduceDomain[i], follow, matchObj);
            for (var pageName in addressObj.ext) {
                map.add(this.map.get(pageName).clone());
            }
        }
    }
    return map;
}
Yarip.prototype.getAddressObj = function(origReduceDomain, follow, matchObj)
{
    var addressObj = {
        ext: {},
        root: new YaripExtensionItem(null, null, true, true, true, true, true, true, true, null, true),
        exclusivePageName: null,
        elementExclusive: false,
        exclusive: false,
        found: false
    }
    if (!origReduceDomain) return addressObj;

    var key = null;
    var reduceDomain = origReduceDomain.replace(/[?&#].*$/, "");
    var tmpDomain = null;
    do
    {
        var reducePath = reduceDomain;
        var tmpPath = null;
        do
        {
            var page = this.map.get(reducePath);
            if (page) {
                var pageName = page.getName(); // same as reducePath
                if (!addressObj.found && !matchObj) { // first-/entry-page
                    key = !!follow + " " + pageName;
                    var knownObj = this.knownAddressObj[key];
                    if (knownObj) return knownObj;
                }
                var childItem = new YaripExtensionItem(pageName, null, true, true, true, true, true, true, true, null, true);
                addressObj.ext[pageName] = childItem;
                addressObj.root.addTo(childItem);
                childItem.addFrom(addressObj.root);
                addressObj.found = true;
                if (!addressObj.elementExclusive && page.elementWhitelist.getExclusive()) {
                    addressObj.elementExclusive = true;
                }
                if (!addressObj.exclusive && page.contentWhitelist.getExclusive()) {
                    addressObj.exclusive = true;
                    addressObj.exclusivePageName = page.getName();
                }
            }
            tmpPath = reducePath;
            reducePath = reducePath.replace(/(\/|[^/]+)$/, "");
        } while (reducePath.length !== tmpPath.length);
        tmpDomain = reduceDomain;
        reduceDomain = reduceDomain.replace(/^(^[^/?#:]+:\/\/(?!$)|(?=([\w-~!$&'()*+,;=:@]+\.){2})[\w-~!$&'()*+,;=:@]+\.)|(?!^):\d+$/, "");
    } while (reduceDomain.length !== tmpDomain.length);

    if (follow) {
        this.getExtensionAddressObj(addressObj, matchObj);
    }

    if (addressObj.found && key) {
        this.knownAddressObj[key] = addressObj;
    }

    return addressObj;
}
Yarip.prototype.getExtensionAddressObj = function(addressObj, matchObj)
{
    if (!addressObj) return false;

    var obj = {};
    for (var pageName in addressObj.ext) {
        obj[pageName] = true;
    }
    for (var pageName in obj) {
        var parentItem = addressObj.root ? addressObj.root : addressObj.ext[pageName];
        this.getRecursiveAddressArray(pageName, addressObj, parentItem, matchObj);
    }
}
Yarip.prototype.getRecursiveAddressArray = function(pageName, addressObj, parentItem, matchObj)
{
    if (!parentItem.doesSomething()) return;

    var obj = {};
    var reduceDomain = pageName.replace(/[?&#].*$/, "");
    var tmpDomain = null;
    do
    {
        var reducePath = reduceDomain;
        var tmpPath = null;
        do
        {
            var page = this.map.get(reducePath);
            if (page)
            {
                var list = page.pageExtensionList;
                for each (var item in list.obj)
                {
                    var extPage = item.getPage();
                    if (extPage)
                    {
                        var extPageName = extPage.getName();
                        if (extPageName in addressObj.ext) // already added
                        {
                            var childItem = addressObj.ext[extPageName];
                            if (childItem.isSelf()) continue; // ignore self

                            if (item.doesSomething()) {
                                childItem.updateDo(parentItem, item);
                                if (parentItem.addTo(childItem)) {
                                    childItem.addFrom(parentItem);
                                }
                            }
                        }
                        else // not yet added
                        {
                            var childItem = new YaripExtensionItem(extPageName);
                            childItem.updateDo(parentItem, item, matchObj);
                            if (item.doesSomething())
                            {
                                addressObj.ext[extPageName] = childItem;
                                if (parentItem.addTo(childItem)) {
                                    childItem.addFrom(parentItem);
                                }
                                if (!addressObj.elementExclusive && extPage.elementWhitelist.getExclusive()) {
                                    addressObj.elementExclusive = true;
                                }
                                if (!addressObj.exclusive && extPage.contentWhitelist.getExclusive()) {
                                    addressObj.exclusive = true;
                                    addressObj.exclusivePageName = extPage.getName();
                                }
                                if (extPage.pageExtensionList.length > 0) {
                                    obj[extPageName] = true;
                                }
                            }
                        }
                    } else {
                        this.map.removeExtension(page, item);
                    }
                }
            }

            tmpPath = reducePath;
            reducePath = reducePath.replace(/(\/|[^/]+)$/, "");
        } while (reducePath.length !== tmpPath.length);

        tmpDomain = reduceDomain;
        reduceDomain = reduceDomain.replace(/^(^[^/?#:]+:\/\/(?!$)|(?=([\w-~!$&'()*+,;=:@]+\.){2})[\w-~!$&'()*+,;=:@]+\.)|(?!^):\d+$/, "");
    } while (reduceDomain.length !== tmpDomain.length);

    for (var extPageName in obj) {
        this.getRecursiveAddressArray(extPageName, addressObj, addressObj.ext[extPageName], matchObj);
    }
}
Yarip.prototype.resetUndo = function()
{
    this.undoObj = {};
}
Yarip.prototype.resetOnAddress = function(obj)
{
    if (!obj) return false;

    var list = null;

    switch (obj.type) {
    case TYPE_WHITELIST:
        list = this.map.get(obj.pageName) ? this.map.get(obj.pageName).elementWhitelist : null;
        break;
    case TYPE_BLACKLIST:
        list = this.map.get(obj.pageName) ? this.map.get(obj.pageName).elementBlacklist : null;
        break;
    case TYPE_ATTRIBUTE:
        list = this.map.get(obj.pageName) ? this.map.get(obj.pageName).elementAttributeList : null;
        break;
    }

    switch (obj.type) {
    case TYPE_WHITELIST:
    case TYPE_BLACKLIST:
        var elements = this.getElementsByXPath(obj.document, obj.xpath);
        if (elements)
        {
            for (var i = 0; i < elements.snapshotLength; i++)
            {
                var element = elements.snapshotItem(i);
                if (element.nodeType != 1) continue;

                switch (element.getAttribute("status")) {
                case "whitelisted":
                case "whitelisted forced":
                case "blacklisted":
                case "placeholder blacklisted":
                case "placeholder":
                    element.removeAttribute("status");
                    break;
                }
            }
        }
        break;
    }

    if (list) {
        list.removeByKey(obj.key);
        this.reloadPage(obj.pageName, false, true);
    }
    delete this.undoObj[obj.type + " " + obj.key];
    return true;
}
Yarip.prototype.getIncrement = function(newIncrement, oldIncrement)
{
    return newIncrement > oldIncrement ? newIncrement : oldIncrement;
}
Yarip.prototype.resetKnown = function()
{
    this.knownAddressObj = {};
}
Yarip.prototype.reloadPage = function(pageName, selectItem, selectTab, resetFilter, type, key)
{
    if (this.pageDialog && pageName) {
        this.pageDialog.reloadPage(pageName, this.pageCreated, selectItem, selectTab, resetFilter, type, key);
        this.pageCreated = false;
        return true;
    } else {
        return false;
    }
}
Yarip.prototype.removeAllExceptWhitelisted = function(doc)
{
    this.whitelistElementItem(doc, null, new YaripElementWhitelistItem("/html/head/descendant-or-self::*[not(@status='blacklisted')]")); // whitelist head and descendants
    this.blacklistElementItem(doc, null, new YaripElementBlacklistItem("//*[not(@status='whitelisted') and not(@status='whitelisted forced')]")); // all except whitelisted
}
Yarip.prototype.whitelistElementItem = function(doc, pageName, item, isNew, increment)
{
    if (!doc || !item) return false;

    var elements = this.getElementsByXPath(doc, item.getXPath());
    if (!elements) return false;

    var found = false;
    var incrementType = INCREMENT_NOT_FOUND;

    for (var i = 0; i < elements.snapshotLength; i++)
    {
        var element = elements.snapshotItem(i);

        switch (element.nodeType) {
        case 1: // ELEMENT
            switch (element.getAttribute("status")) {
            case "whitelisted":
            case "whitelisted forced":
            case "blacklisted":
//            case "placeholder blacklisted":
            case "placeholder":
                incrementType = this.getIncrement(INCREMENT_IGNORED, incrementType);
                continue;
            }

            if (isNew) {
                element.setAttribute("status", item.getForce() ? "whitelisted forced" : "whitelisted");
            } else {
//                while (element && element.nodeType == 1 && element.getAttribute("status") != "whitelisted" && element.getAttribute("status") != "whitelisted forced") {
                while (element && element.nodeType == 1 && !/^whitelisted(\s+forced)?$/.test(element.getAttribute("status"))) {
                    element.setAttribute("status", item.getForce() ? "whitelisted forced" : "whitelisted");
                    element = element.parentNode;
                }
            }
            break;
        default:
            continue;
        }

        incrementType = INCREMENT_FOUND;
        found = true;
    }

    if (!pageName) return found;

    if (increment)
    {
        switch (incrementType) {
        case INCREMENT_FOUND:
            item.incrementFound();
            break;
        case INCREMENT_NOT_FOUND:
            item.incrementNotFound();
            break;
        case INCREMENT_IGNORED:
            item.incrementIgnored();
            break;
        }
    }

    if (isNew && found)
    {
        var page = this.map.get(pageName);
        if (page) {
            page.setTemporary(false);
        } else {
            page = this.createPage(doc.location, pageName);
        }
        page.elementWhitelist.add(item);
        this.reloadPage(pageName, false, true);

        var obj = {};
        obj.document = doc;
        obj.pageName = pageName;
        obj.xpath = item.getXPath();
        obj.key = item.getKey();
        obj.type = TYPE_WHITELIST;
        obj.text = item.getXPath();
        this.undoObj[obj.type + " " + obj.key] = obj;
    }

    return found;
}
Yarip.prototype.blacklistElementItem = function(doc, pageName, item, isNew, increment)
{
    if (!doc || !item) return false;

    var elements = this.getElementsByXPath(doc, item.getXPath());
    if (!elements) return false;

    var found = false;
    var incrementType = INCREMENT_NOT_FOUND;
    var useForce = true;

    for (var i = 0; i < elements.snapshotLength; i++)
    {
        var element = elements.snapshotItem(i);
        switch (element.nodeType) {
        case 1: // ELEMENT
            switch (element.getAttribute("status")) {
            case "whitelisted":
                if (item.getForce()) {
                  useForce = false; // don't force removal
                  break;
                } else {
                  incrementType = this.getIncrement(INCREMENT_IGNORED, incrementType);
                  continue;
                }
            case "blacklisted":
            case "placeholder":
            case "whitelisted forced":
              incrementType = this.getIncrement(INCREMENT_IGNORED, incrementType);
              continue;
//            case "placeholder blacklisted":
////                if (placeholder) continue;
//                if ((!item.getForce() || increment) /* not temporary */ && placeholder) continue;
//                break;
            }

            switch (element.localName) {
            case "html":
            case "body":
            case "frameset":
                continue;
            case "head":
                element.innerHTML =
                    "<style rel='stylesheet' type='text/css'>\n" +
                        "\t* {\n" +
                            "\t\tmargin: 0 !important;\n" +
                            "\t\tpadding: 0 !important;\n" +
                        "\t}\n" +
                        "\tdiv {\n" +
                            "\t\theight: auto !important;\n" +
                        "\t}\n" +
                        "\ttable {\n" +
                            "\t\tborder-spacing: 0 0 !important;\n" +
                            "\t\theight: auto !important;\n" +
                            "\t\twidth: 0 !important;\n" +
                        "\t}\n" +
                    "</style>";
                break;
            case "script":
                element.removeAttribute("src");
                element.innerHTML = "";
                break;
            case "frame":
                if (element.parentNode.localName == "FRAMESET") {
                    continue;
                } else {
                    element.setAttribute("src", "");
                    element.setAttribute("status", "blacklisted");
                }
                break;
            case "br":
                element.setAttribute("status", "blacklisted");
                break;
            case "audio":
            case "embed":
            case "iframe":
            case "video":
//                if (placeholder) {
                if ((!item.getForce() || increment) /* not temporary */ && item.getPlaceholder()) {
                    element.setAttribute("status", "placeholder");
                } else {
                    element.setAttribute("src", "");
                    element.setAttribute("status", "blacklisted");
                }
                break;
            default:
//                element.setAttribute("status", item.getPlaceholder() ? "placeholder" : "blacklisted");
//                if (this.purgeInnerHTML && !isNew && !item.getPlaceholder()) {
//                    element.innerHTML = "";
//                }
//                if (item.getPlaceholder()) {
                if ((!item.getForce() || increment) /* not temporary */ && item.getPlaceholder()) {
                    element.setAttribute("status", "placeholder");
                } else {
                    element.setAttribute("status", "blacklisted");
                    if (this.purgeInnerHTML && !isNew) {
                        element.innerHTML = "";
                    }
                }
                break;
            }
            break;
        case 2: // ATTRIBUTE
            if (element.ownerElement) element.ownerElement.removeAttribute(element.name);
            break;
        case 3: // TEXT
            if (element.parentNode) element.parentNode.removeChild(element);
            break;
        default:
            continue;
        }

        incrementType = INCREMENT_FOUND;
        found = true;
    }

    if (!pageName) return found;

    if (increment)
    {
        switch (incrementType) {
        case INCREMENT_FOUND:
            item.incrementFound();
            break;
        case INCREMENT_NOT_FOUND:
            item.incrementNotFound();
            break;
        case INCREMENT_IGNORED:
            item.incrementIgnored();
            break;
        }
    }

    if (isNew && found)
    {
        var page = this.map.get(pageName);
        if (page) {
            page.setTemporary(false);
        } else {
            page = this.createPage(doc.location, pageName);
        }
        item.setForce(useForce);
        page.elementBlacklist.add(item);
        this.reloadPage(pageName, false, true);

        var obj = {};
        obj.document = doc;
        obj.pageName = pageName;
        obj.xpath = item.getXPath();
        obj.key = item.getKey();
        obj.type = TYPE_BLACKLIST;
        obj.text = item.getXPath();
        this.undoObj[obj.type + " " + obj.key] = obj;
    }

    return found;
}
Yarip.prototype.whitelistContentItem = function(location, pageName, item)
{
    if (!pageName || !item) return false;

    var page = this.map.get(pageName);
    if (page) {
        page.setTemporary(false);
    } else {
        page = this.createPage(location, pageName);
    }
    page.contentWhitelist.add(item);
    this.reloadPage(pageName, false, true);
    return true;
}
Yarip.prototype.blacklistContentItem = function(location, pageName, item)
{
    if (!pageName || !item) return false;

    var page = this.map.get(pageName);
    if (page) {
        page.setTemporary(false);
    } else {
        page = this.createPage(location, pageName);
    }
    page.contentBlacklist.add(item);
    this.reloadPage(pageName, false, true);
    return true;
}
Yarip.prototype.extendPage = function(pageLocation, pageName, contentLocation, contentAddress, item)
{
    if (!pageName || !contentAddress) return false;

    var pageOwn = this.createPage(pageLocation, pageName);
    var pageExt = this.createPage(contentLocation, contentAddress);
    if (item) {
        item.setId(pageExt.getId());
    } else {
        item = pageExt.createPageExtensionItem();
    }
    this.map.addExtension(pageOwn, item);
    pageOwn.setTemporary(false);
    this.reloadPage(pageExt.getName());
    this.reloadPage(pageOwn.getName());
    return true;
}
Yarip.prototype.styleElementItem = function(doc, pageName, item, isNew, increment)
{
    if (!doc || !pageName) return false;

    var elements = this.getElementsByXPath(doc, item.getXPath());
    if (!elements) return false;

    var found = false;
    var incrementType = INCREMENT_NOT_FOUND;

    for (var i = 0; i < elements.snapshotLength; i++)
    {
        var element = elements.snapshotItem(i);
        switch (element.nodeType) {
        case 1: // ELEMENT
            switch (item.getName()) {
            case "style":
                var style = element.getAttribute(item.getName());
                if (style) {
                    if (style.indexOf(item.getValue()) === -1) {
                        element.setAttribute(item.getName(), style + item.getValue());
                    }
                } else {
                    element.setAttribute(item.getName(), item.getValue());
                }
                break;
            default:
                element.setAttribute(item.getName(), item.getValue());
                break;
            }
            break;
        default:
            continue;
        }

        incrementType = INCREMENT_FOUND;
        found = true;
    }

    if (!pageName) return found;

    if (increment)
    {
        switch (incrementType) {
        case INCREMENT_FOUND:
            item.incrementFound();
            break;
        case INCREMENT_NOT_FOUND:
            item.incrementNotFound();
            break;
        }
    }

    if (isNew && found)
    {
        var page = this.map.get(pageName);
        if (page) {
            page.setTemporary(false);
        } else {
            page = this.createPage(doc.location, pageName);
        }
        page.elementAttributeList.add(item);
        this.reloadPage(pageName, false, true);

        var obj = {};
        obj.document = doc;
        obj.pageName = pageName;
        obj.key = item.getKey();
        obj.type = TYPE_ATTRIBUTE;
        obj.text = item.getName() + ": " + item.getValue();
        this.undoObj[obj.type + " " + obj.key] = obj;
    }

    return found;
}
Yarip.prototype.scriptElementItem = function(doc, pageName, item, isNew)
{
    if (!doc || !pageName) return false;

    var elements = this.getElementsByXPath(doc, item.getXPath());
    if (!elements) return false;

    if (isNew)
    {
        var page = this.map.get(pageName);
        if (page) {
            page.setTemporary(false);
        } else {
            page = this.createPage(doc.location, pageName);
        }
        page.elementScriptList.add(item);
        this.reloadPage(pageName, false, true);
    }

    return true;
}
Yarip.prototype.createXPath = function(element, fullPath)
{
    if (!element || !element.localName) return null;

    if (element.nodeType == 2) {
        return this.createXPath(element.ownerElement, fullPath) + "/@" + element.localName; // attribute
    }

    var xpath = "";
    do
    {
        var attributes = "";
        if (element.getAttribute("id"))
        {
            // ID
            attributes += "[@id='" + element.getAttribute("id") + "']";
            if (!fullPath) {
                return "//" + element.localName + attributes + xpath; // shortest xpath
            }
        }
        else
        {
            // ATTRIBUTES
            if (element.getAttribute("name")) attributes += "@name='" + element.getAttribute("name") + "' and ";
            if (element.getAttribute("class")) attributes += "@class='" + element.getAttribute("class") + "' and ";
            if (attributes != "") attributes = "[" + attributes.substring(0, attributes.length - 5) + "]";

            // INDEX
            if (!/^(html|head|title|body|thead|tbody|tfoot|frameset)$/i.test(element.localName))
            {
                var index = 1;
                var sibling = element.previousSibling;
                while (sibling) {
                    if (sibling.localName == element.localName) ++index;
                    sibling = sibling.previousSibling;
                }

                var found = false;
                sibling = element.nextSibling;
                while (!found && sibling) {
                    if (sibling.localName == element.localName) found = true;
                    else sibling = sibling.nextSibling;
                }
                if (this.useIndex !== 2 /* never */ && (this.useIndex === 0 /* always */ || found || index > 1)) {
                    attributes = "[" + index + "]" + attributes;
                }
            }
        }
        xpath = "/" + element.localName + attributes + xpath;
        element = element.parentNode;
    } while (element && element.nodeType == 1);

    return xpath != "" ? xpath : null;
}
Yarip.prototype.getElementsByXPath = function(doc, xpath)
{
    try {
        return doc.evaluate(xpath, doc.body, null, UNORDERED_NODE_SNAPSHOT_TYPE, null);
    } catch (e) {
        this.logMessage(LOG_ERROR, e);
        return null;
    }
}
Yarip.prototype.generateRegExp = function(value)
{
    if (!value) return null;
//    return "^" + value.replace(/([/.*+?|()\[\]{}\\])/g, "\\$1") + "$";
    return "^" + value.replace(/([.*+?|()\[\]{}\\])/g, "\\$1") + "$";
}
Yarip.prototype.checkPageName = function(value)
{
    return URI_SIMPLE_RE.test(value);
}
Yarip.prototype.checkXPath = function(xpath)
{
    if (!xpath) return false;
    try {
        var dp = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
        var doc = dp.parseFromString("<yarip></yarip>", "text/xml");
        doc.evaluate(xpath, doc, null, UNORDERED_NODE_SNAPSHOT_TYPE, null);
    } catch (e) {
        return false;
    }
    return true;
}
Yarip.prototype.checkRegExp = function(reValue)
{
    if (!reValue) return false;
    try {
        new RegExp(reValue).test("");
    } catch (e) {
        return false;
    }
    return true;
}
Yarip.prototype.getElements = function(doc, xpath)
{
    var elements = null;
    try {
        elements = doc.evaluate(xpath, doc, null, UNORDERED_NODE_SNAPSHOT_TYPE, null);
    } catch (e) {
    }
    return elements;
}
Yarip.prototype.highlight = function(doc, xpath)
{
    if (!doc || !xpath) return false;
    var elements = this.getElements(doc, xpath);
    if (!elements) return false;
    if (elements.snapshotLength > 0) {
        for (var i = 0; i < elements.snapshotLength; i++) {
            var element = elements.snapshotItem(i);
            if (element.nodeType == 2 /* ATTRIBUTE */) element = element.ownerElement;
            if (element && element.getAttribute) {
                var status = element.getAttribute("status");
                if (!status) {
                    element.setAttribute("status", "highlighted");
                } else if (!/\bhighlighted\b/.test(status)) {
                    element.setAttribute("status", status + " highlighted");
                }
            }
        }
    }
    return true;
}
Yarip.prototype.unHighlight = function(doc, xpath)
{
    if (!doc || !xpath) return;
    var elements = this.getElements(doc, xpath);
    if (elements && elements.snapshotLength > 0) {
        for (var i = 0; i < elements.snapshotLength; i++) {
            var element = elements.snapshotItem(i);
            if (element.nodeType == 2 /* ATTRIBUTE */) element = element.ownerElement;
            if (element && element.getAttribute) {
                var status = element.getAttribute("status");
                if (status && /\bhighlighted\b/.test(status)) {
                    var newStatus = status.replace(/\s*highlighted\b/, "");
//                    if (newStatus == "") {
                    if (!newStatus) {
                        element.removeAttribute("status");
                    } else {
                        element.setAttribute("status", newStatus);
                    }
                }
            }

        }
    }
}
Yarip.prototype.save = function()
{
    var file = this.getFile(FILE);
    var data = this.map.generateXml();
    this.saveToFile(data, file);
}
Yarip.prototype.getValue = function(preference, defaultValue, type)
{
    try {
        switch (type) {
        case DATA_TYPE_BOOLEAN:
            return PB.getBoolPref(preference);
        case DATA_TYPE_INTEGER:
            return PB.getIntPref(preference);
        case DATA_TYPE_STRING:
            return PB.getCharPref(preference);
        }
    } catch (e) {
        if (defaultValue !== false && (typeof defaultValue != "number" || isNaN(defaultValue)) && !defaultValue) {
            return null;
        }
        this.setValue(preference, defaultValue, type);
    }
    return this.getValue(preference, null, type);
}
Yarip.prototype.setValue = function(preference, value, type)
{
    try {
        switch (type) {
        case DATA_TYPE_BOOLEAN:
            PB.setBoolPref(preference, "" + value == "true");
            break;
        case DATA_TYPE_INTEGER:
            PB.setIntPref(preference, value);
            break;
        case DATA_TYPE_STRING:
            PB.setCharPref(preference, value);
            break;
        case DATA_TYPE_RESET:
            PB.clearUserPref(preference);
            break;
        }
    } catch (e) {
    }
}
Yarip.prototype.deleteBranch = function(branch)
{
    if (!branch) return;

    PB.deleteBranch(branch);
}
Yarip.prototype.injectCSS = function(uri, value)
{
    if (!uri) return;

    var uri = IOS.newURI(uri, CHARSET, null); // uri, charset, baseuri
    var sss = Cc["@mozilla.org/content/style-sheet-service;1"].
        getService(Ci.nsIStyleSheetService);
    if (value) { if (!sss.sheetRegistered(uri, sss.USER_SHEET)) sss.loadAndRegisterSheet(uri, sss.USER_SHEET); }
    else { if (sss.sheetRegistered(uri, sss.USER_SHEET)) sss.unregisterSheet(uri, sss.USER_SHEET); }
}
Yarip.prototype.check = function()
{
    var previous = this.getValue(PREF_VERSION, "", DATA_TYPE_STRING);
    if (previous && previous != VERSION)
    {
        this.setValue(PREF_VERSION, VERSION, DATA_TYPE_STRING);

        if (/^(0\.1\.[2-9]|0\.2(\.1)?)$/.test(previous) && !/^(0\.1\.[2-9]|0\.2(\.1)?)$/.test(VERSION)) {
            // CHANGED NOFLICKER FEATURE
            this.setValue("content.notify.ontimer", null, DATA_TYPE_RESET);
            this.setValue("content.notify.backoffcount", null, DATA_TYPE_RESET);
            this.setValue("nglayout.initialpaint.delay", null, DATA_TYPE_RESET);
        }

        if (/^0\.2(\.[1-3])?$/.test(previous) && !/^0\.2(\.[1-3])?$/.test(VERSION)) {
            // CHANGED STYLE/ATTRIBUTE FEATURE
            FH.removeEntriesForName("style");
        }

        if (/^0\.2\.4$/.test(previous) && !/^0\.2\.4$/.test(VERSION)) {
            // CHANGED ALLOWED-SCHEMES OPTION
            this.setSchemes(this.getValue("extensions.yarip.schemesList.value", "^https?$", DATA_TYPE_STRING));
        }

        if (/^(0\.[12](\.\d)*|0\.3\.1)$/.test(previous) && !/^(0\.[12](\.\d)*|0\.3\.1)$/.test(VERSION)) {
            // RE-INTRODUCED STYLES FOR XPATHS
            for (var p in this.map.obj) {
                for (var x in this.map.get(p).elementBlacklist.obj) {
                    this.map.get(p).elementBlacklist.obj[x].createStyle(true);
                }
            }

            // CHANGED INDEX-IN-XPATH OPTION
            var alwaysUseIndex = this.getValue("extensions.yarip.alwaysUseIndex", false, DATA_TYPE_BOOLEAN);
            if (alwaysUseIndex) this.setUseIndex(0); // always

            // REMOVED STYLE-FILE
            var tmp = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);
            tmp.append("extensions");
            tmp.append("yarip@mozdev.org");
            if (tmp.exists() && tmp.isDirectory()) {
                tmp.append("style.css");
                if (tmp.isFile()) tmp.remove(true);
            }
        }

        this.deleteBranch("extensions.yarip.changeType"); // deleted in v0.1.7
        this.deleteBranch("extensions.yarip.flickerType"); // deleted in v0.1.7
        this.deleteBranch("extensions.yarip.loggingEnabled"); // deleted in v0.2.1
        this.deleteBranch("extensions.yarip.deep"); // deleted in v0.2.2
        this.deleteBranch("extensions.yarip.profile"); // deleted in v0.2.2
        this.deleteBranch("extensions.yarip.reload"); // deleted in v0.2.2
        this.deleteBranch("extensions.yarip.firstrun"); // deleted in v0.2.4
        this.deleteBranch("extensions.yarip.schemesList"); // deleted in v0.2.5.2
        this.deleteBranch("extensions.yarip.alwaysUseIndex"); // deleted in v0.3.2
        this.deleteBranch("extensions.yarip.contentRepeatThreshold"); // deleted in v0.3.2
    }
}
Yarip.prototype.getId = function()
{
    var id = Date.now();
    while (this.map.getById(id)) id++;
    return "" + id;
}
Yarip.prototype.addMonitorDialog = function(monitorDialog)
{
    monitorDialog.id = Date.now();
    while ("" + monitorDialog.id in this.monitorDialogues) monitorDialog.id++;
    this.monitorDialogues["" + monitorDialog.id] = monitorDialog;
}
Yarip.prototype.removeMonitorDialog = function(monitorDialog)
{
    delete this.monitorDialogues["" + monitorDialog.id];
    monitorDialog.id = -1;
}
Yarip.prototype.load = function(file, imported)
{
    var doc = this.getDoc(file);
    if (!doc) {
        if (!imported) this.save();
        return null;
    } else if (doc.documentElement.nodeName == "parsererror") {
        return null;
    }

    var pageName = null;
    var map = new YaripMap();

    var iYarip = doc.evaluate("./yarip", doc, null, ORDERED_NODE_ITERATOR_TYPE, null);
    var nYarip = iYarip.iterateNext();
    if (!nYarip) return null;

    var version = nYarip.getAttribute("version");
    if (!version)
    {
        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);
            if (!page) page = new YaripPage(pageId ? pageId : this.getId(), pageName);

            // XPATH WHITELIST
            var iWhitelist = doc.evaluate("./whitelist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nWhitelist = iWhitelist.iterateNext();
            if (nWhitelist)
            {
                var iXPath = doc.evaluate("./xpath", nWhitelist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nXPath = iXPath.iterateNext();
                while (nXPath)
                {
                    page.elementWhitelist.add(new YaripElementWhitelistItem(
                        nXPath.getAttribute("value"),
                        null, // priority
                        null, // force
                        pageId, // created
                        null, // lastFound
                        nXPath.getAttribute("found"),
                        nXPath.getAttribute("notFound"),
                        nXPath.getAttribute("whitelisted")));
                    nXPath = iXPath.iterateNext();
                }
            }

            // XPATH BLACKLIST
            var iBlacklist = doc.evaluate("./blacklist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nBlacklist = iBlacklist.iterateNext();
            if (nBlacklist)
            {
                var iXPath = doc.evaluate("./xpath", nBlacklist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nXPath = iXPath.iterateNext();
                while (nXPath)
                {
                    page.elementBlacklist.add(new YaripElementBlacklistItem(
                        nXPath.getAttribute("value"),
                        nXPath.getAttribute("style"),
                        null, // priority
                        nXPath.getAttribute("force") == "true",
                        null, // placeholder
                        pageId, // created
                        null, // lastFound
                        nXPath.getAttribute("found"),
                        nXPath.getAttribute("notFound"),
                        nXPath.getAttribute("whitelisted")));
                    nXPath = iXPath.iterateNext();
                }
            }

            map.add(page);
            nPage = iPage.iterateNext();
        }
    }
    else if (/^0\.2(\.[1-3])?$/.test(version))
    {
        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);
            if (!page) page = new YaripPage(pageId ? pageId : this.getId(), pageName);

            // ELEMENT BLACKLIST
            var iElementBlacklist = doc.evaluate("./elementBlacklist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nElementBlacklist = iElementBlacklist.iterateNext();
            if (nElementBlacklist)
            {
                var iElement = doc.evaluate("./element", nElementBlacklist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElement = iElement.iterateNext();
                while (nElement)
                {
                    var element = new YaripElementBlacklistItem(
                        nElement.getAttribute("xpath"),
                        nElement.getAttribute("style"),
                        null, // priority
                        nElement.getAttribute("force") == "true",
                        null, // placeholder
                        pageId, // created
                        null, // lastFound
                        nElement.getAttribute("found"),
                        nElement.getAttribute("notFound"),
                        nElement.getAttribute("ignored"));
                    page.elementBlacklist.add(element);
                    nElement = iElement.iterateNext();
                }
            }

            // CONTENT BLACKLIST
            var iContentBlacklist = doc.evaluate("./contentBlacklist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nContent = iContentBlacklist.iterateNext();
            if (nContent)
            {
                var iContent = doc.evaluate("./content", nContent, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContent = iContent.iterateNext();
                while (nContent)
                {
                    page.contentBlacklist.add(new YaripContentBlacklistItem(
                        nContent.getAttribute("regexp"),
                        null, // priority
                        nContent.getAttribute("force") == "true",
                        pageId, // created
                        null, // lastFound
                        nContent.getAttribute("ignored")));
                    nContent = iContent.iterateNext();
                }
            }

            map.add(page);
            nPage = iPage.iterateNext();
        }

        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);
            if (!page) page = new YaripPage(pageId ? pageId : this.getId(), pageName);

            // ELEMENT WHITELIST
            var iElementWhitelist = doc.evaluate("./elementWhitelist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nElementWhitelist = iElementWhitelist.iterateNext();
            if (nElementWhitelist)
            {
                var iElement = doc.evaluate("./element", nElementWhitelist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElement = iElement.iterateNext();
                while (nElement)
                {
                    page.elementWhitelist.add(new YaripElementWhitelistItem(
                        nElement.getAttribute("xpath"),
                        null, // priority
                        null, // force
                        pageId, // created
                        null, // lastFound
                        nElement.getAttribute("found"),
                        nElement.getAttribute("notFound"),
                        nElement.getAttribute("ignored")));
                    nElement = iElement.iterateNext();
                }
            }

            // CONTENT WHITELIST
            var iContentWhitelist = doc.evaluate("./contentWhitelist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nContent = iContentWhitelist.iterateNext();
            if (nContent)
            {
                page.contentWhitelist.setExclusive(nContent.getAttribute("exclusive"));
                var iContent = doc.evaluate("./content", nContent, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContent = iContent.iterateNext();
                while (nContent)
                {
                    page.contentWhitelist.add(new YaripContentWhitelistItem(
                        nContent.getAttribute("regexp"),
                        null, // priority
                        null, // force
                        pageId, // created
                        null)); // lastFound
                    nContent = iContent.iterateNext();
                }
            }

            // STYLES
            var iStyles = doc.evaluate("./styles", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nStyles = iStyles.iterateNext();
            if (nStyles)
            {
                var iElement = doc.evaluate("./element", nStyles, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElement = iElement.iterateNext();
                while (nElement)
                {
                    page.elementAttributeList.add(new YaripElementAttributeItem(
                        nElement.getAttribute("xpath"),
                        "style",
                        nElement.getAttribute("style"),
                        null, // priority
                        pageId, // created
                        null, // lastFound
                        nElement.getAttribute("found"),
                        nElement.getAttribute("notFound")));
                    nElement = iElement.iterateNext();
                }
            }

            // TODO Remove this, since it was a temporary change!
            // ATTRIBUTES
            var iAttributes = doc.evaluate("./attributes", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nAttributes = iAttributes.iterateNext();
            if (nAttributes)
            {
                var iElement = doc.evaluate("./element", nAttributes, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElement = iElement.iterateNext();
                while (nElement)
                {
                    page.elementAttributeList.add(new YaripElementAttributeItem(
                        nElement.getAttribute("xpath"),
                        nElement.getAttribute("name"),
                        nElement.getAttribute("value"),
                        null, // priority
                        pageId, // created
                        nElement.getAttribute("lastFound"),
                        nElement.getAttribute("found"),
                        nElement.getAttribute("notFound")));
                    nElement = iElement.iterateNext();
                }
            }

            map.add(page);
            nPage = iPage.iterateNext();
        }

        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);

            // EXTENSION
            var iExtension = doc.evaluate("./extension", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nExtension = iExtension.iterateNext();
            if (nExtension)
            {
                var iItem = doc.evaluate("./item", nExtension, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nItem = iItem.iterateNext();
                while (nItem)
                {
                    var value = nItem.getAttribute("value");
                    if (value != page.getId()) {
                        map.addExtension(page, new YaripExtensionItem(
                            nItem.getAttribute("value"),
                            null, // priority
                            nItem.getAttribute("doElements"),
                            nItem.getAttribute("doContents"),
                            nItem.getAttribute("doScripts"),
                            null, // headers
                            null, // redirects
                            null, // streams
                            nItem.getAttribute("doContents"), // links
                            pageId)); // created
                    }
                    nItem = iItem.iterateNext();
                }
            }

            nPage = iPage.iterateNext();
        }
    }
    else if (/^0\.2\.4$/.test(version))
    {
        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);
            if (!page) page = new YaripPage(pageId ? pageId : this.getId(), pageName);

            // ELEMENT WHITELIST
            var iElementWhitelist = doc.evaluate("./elementWhitelist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nElementWhitelist = iElementWhitelist.iterateNext();
            if (nElementWhitelist)
            {
                var iElement = doc.evaluate("./element", nElementWhitelist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElement = iElement.iterateNext();
                while (nElement)
                {
                    var iXPath = doc.evaluate("./xpath", nElement, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nXPath = iXPath.iterateNext();
                    if (nXPath) {
                        var created = nElement.getAttribute("created");
                        page.elementWhitelist.add(new YaripElementWhitelistItem(
                            nXPath.textContent,
                            null, // priority
                            null, // force
                            created ? created : pageId,
                            nElement.getAttribute("lastFound"),
                            nElement.getAttribute("found"),
                            nElement.getAttribute("notFound"),
                            nElement.getAttribute("ignored")));
                    }
                    nElement = iElement.iterateNext();
                }
            }

            // ELEMENT BLACKLIST
            var iElementBlacklist = doc.evaluate("./elementBlacklist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nElementBlacklist = iElementBlacklist.iterateNext();
            if (nElementBlacklist)
            {
                var iElement = doc.evaluate("./element", nElementBlacklist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElement = iElement.iterateNext();
                while (nElement)
                {
                    var iXPath = doc.evaluate("./xpath", nElement, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nXPath = iXPath.iterateNext();
                    var iStyle = doc.evaluate("./style", nElement, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nStyle = iStyle.iterateNext();
                    if (nXPath) {
                        var created = nElement.getAttribute("created");
                        page.elementBlacklist.add(new YaripElementBlacklistItem(
                            nXPath.textContent,
                            nStyle ? nStyle.textContent : null,
                            null, // priority
                            nElement.getAttribute("force"),
                            null, // placeholder
                            created ? created : pageId,
                            nElement.getAttribute("lastFound"),
                            nElement.getAttribute("found"),
                            nElement.getAttribute("notFound"),
                            nElement.getAttribute("ignored")));
                    }
                    nElement = iElement.iterateNext();
                }
            }

            // CONTENT WHITELIST
            var iContentWhitelist = doc.evaluate("./contentWhitelist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nContent = iContentWhitelist.iterateNext();
            if (nContent)
            {
                page.contentWhitelist.setExclusive(nContent.getAttribute("exclusive"));
                var iContent = doc.evaluate("./content", nContent, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContent = iContent.iterateNext();
                while (nContent)
                {
                    var iRegexp = doc.evaluate("./regexp", nContent, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nRegexp = iRegexp.iterateNext();
                    if (nRegexp) {
                        var created = nContent.getAttribute("created");
                        page.contentWhitelist.add(new YaripContentWhitelistItem(
                            nRegexp.textContent,
                            null, // priority
                            null, // force
                            created ? created : pageId,
                            nContent.getAttribute("lastFound")));
                    }
                    nContent = iContent.iterateNext();
                }
            }

            // CONTENT BLACKLIST
            var iContentBlacklist = doc.evaluate("./contentBlacklist", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nContent = iContentBlacklist.iterateNext();
            if (nContent)
            {
                var iContent = doc.evaluate("./content", nContent, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContent = iContent.iterateNext();
                while (nContent)
                {
                    var iRegexp = doc.evaluate("./regexp", nContent, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nRegexp = iRegexp.iterateNext();
                    if (nRegexp) {
                        var created = nContent.getAttribute("created");
                        page.contentBlacklist.add(new YaripContentBlacklistItem(
                            nRegexp.textContent,
                            null, // priority
                            nContent.getAttribute("force"),
                            created ? created : pageId,
                            nContent.getAttribute("lastFound"),
                            nContent.getAttribute("ignored")));
                    }
                    nContent = iContent.iterateNext();
                }
            }

            // ATTRIBUTES
            var iAttributes = doc.evaluate("./attributes", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nAttributes = iAttributes.iterateNext();
            if (nAttributes)
            {
                var iElement = doc.evaluate("./element", nAttributes, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElement = iElement.iterateNext();
                while (nElement)
                {
                    var iXPath = doc.evaluate("./xpath", nElement, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nXPath = iXPath.iterateNext();
                    var iName = doc.evaluate("./name", nElement, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nName = iName.iterateNext();
                    var iValue = doc.evaluate("./value", nElement, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nValue = iValue.iterateNext();
                    if (nXPath && nName && nValue) {
                        var created = nElement.getAttribute("created");
                        page.elementAttributeList.add(new YaripElementAttributeItem(
                            nXPath.textContent,
                            nName.textContent,
                            nValue.textContent,
                            null, // priority
                            created ? created : pageId,
                            nElement.getAttribute("lastFound"),
                            nElement.getAttribute("found"),
                            nElement.getAttribute("notFound")));
                    }
                    nElement = iElement.iterateNext();
                }
            }

            // SCRIPT
            var iScript = doc.evaluate("./script", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nScript = iScript.iterateNext();
            if (nScript) {
                  page.pageScriptList.add(new YaripPageScriptItem(
                      "/html/body",
                      nScript.textContent,
                      null, // priority
                      nScript.getAttribute("lastChanged")));
            }

            map.add(page);
            nPage = iPage.iterateNext();
        }

        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);

            // EXTENSION
            var iExtension = doc.evaluate("./extension", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nExtension = iExtension.iterateNext();
            if (nExtension)
            {
                var iPageRef = doc.evaluate("./pageReference", nExtension, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageRef = iPageRef.iterateNext();
                while (nPageRef)
                {
                    var pageExtId = nPageRef.textContent;
                    if (pageExtId && pageExtId != page.getId()) {
                        var created = nPageRef.getAttribute("created");
                        map.addExtension(page, new YaripExtensionItem(
                            pageExtId,
                            null, // priority
                            nPageRef.getAttribute("doElements"),
                            nPageRef.getAttribute("doContents"),
                            nPageRef.getAttribute("doScripts"),
                            nPageRef.getAttribute("doHeaders"),
                            nPageRef.getAttribute("doRedirects"),
                            null, // streams
                            nPageRef.getAttribute("doLinks"),
                            created ? created : pageId));
                    }
                    nPageRef = iPageRef.iterateNext();
                }
            }

            nPage = iPage.iterateNext();
        }
    }
    else // if (/^(0\.2\.[5-6](\.\d+)?)|(0\.3\.[1-3])$/.test(version))
    {
        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);
            if (!page) page = new YaripPage(pageId ? pageId : this.getId(), pageName);

            var iElementChild = doc.evaluate("./element", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nElementChild = iElementChild.iterateNext();
            if (nElementChild)
            {
                // ELEMENT WHITELIST
                var iElementWhitelist = doc.evaluate("./whitelist", nElementChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElementWhitelist = iElementWhitelist.iterateNext();
                if (nElementWhitelist)
                {
                    page.elementWhitelist.setExclusive(nElementWhitelist.getAttribute("exclusive"));
                    var iItem = doc.evaluate("./item", nElementWhitelist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iXPath = doc.evaluate("./xpath", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nXPath = iXPath.iterateNext();
                        if (nXPath) {
                            var created = nItem.getAttribute("created");
                            page.elementWhitelist.add(new YaripElementWhitelistItem(
                                nXPath.textContent,
                                nItem.getAttribute("priority"),
                                nItem.getAttribute("force"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound"),
                                nItem.getAttribute("found"),
                                nItem.getAttribute("notFound"),
                                nItem.getAttribute("ignored")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                // ELEMENT BLACKLIST
                var iElementBlacklist = doc.evaluate("./blacklist", nElementChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElementBlacklist = iElementBlacklist.iterateNext();
                if (nElementBlacklist)
                {
                    var iItem = doc.evaluate("./item", nElementBlacklist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iXPath = doc.evaluate("./xpath", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nXPath = iXPath.iterateNext();
                        var iStyle = doc.evaluate("./style", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nStyle = iStyle.iterateNext();
                        if (nXPath) {
                            var created = nItem.getAttribute("created");
                            var element = new YaripElementBlacklistItem(
                                nXPath.textContent,
                                nStyle ? nStyle.textContent : null,
                                nItem.getAttribute("priority"),
                                nItem.getAttribute("force"),
                                nItem.getAttribute("placeholder"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound"),
                                nItem.getAttribute("found"),
                                nItem.getAttribute("notFound"),
                                nItem.getAttribute("ignored"));
                            page.elementBlacklist.add(element);
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                // ELEMENT ATTRIBUTE
                var iElementAttribute = doc.evaluate("./attribute", nElementChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElementAttribute = iElementAttribute.iterateNext();
                if (nElementAttribute)
                {
                    var iItem = doc.evaluate("./item", nElementAttribute, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iXPath = doc.evaluate("./xpath", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nXPath = iXPath.iterateNext();
                        var iName = doc.evaluate("./name", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nName = iName.iterateNext();
                        var iValue = doc.evaluate("./value", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nValue = iValue.iterateNext();
                        if (nXPath && nName && nValue) {
                            var created = nItem.getAttribute("created");
                            page.elementAttributeList.add(new YaripElementAttributeItem(
                                nXPath.textContent,
                                nName.textContent,
                                nValue.textContent,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound"),
                                nItem.getAttribute("found"),
                                nItem.getAttribute("notFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                // ELEMENT SCRIPT
                var iElementScript = doc.evaluate("./script", nElementChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nElementScript = iElementScript.iterateNext();
                if (nElementScript)
                {
                    var iItem = doc.evaluate("./item", nElementScript, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iXPath = doc.evaluate("./xpath", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nXPath = iXPath.iterateNext();
                        var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nScript = iScript.iterateNext();
                        if (nXPath) {
                            var created = nItem.getAttribute("created");
                            page.elementScriptList.add(new YaripScriptItem(
                                nXPath.textContent,
                                nScript ? nScript.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound"),
                                nItem.getAttribute("found"),
                                nItem.getAttribute("notFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }
            }

            var iContentChild = doc.evaluate("./content", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nContentChild = iContentChild.iterateNext();
            if (nContentChild)
            {
                // CONTENT WHITELIST
                var iContentWhitelist = doc.evaluate("./whitelist", nContentChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContentWhitelist = iContentWhitelist.iterateNext();
                if (nContentWhitelist)
                {
                    page.contentWhitelist.setExclusive(nContentWhitelist.getAttribute("exclusive"));
                    var iItem = doc.evaluate("./item", nContentWhitelist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nRegexp = iRegexp.iterateNext();
                        if (nRegexp) {
                            var created = nItem.getAttribute("created");
                            page.contentWhitelist.add(new YaripContentWhitelistItem(
                                nRegexp.textContent,
                                nItem.getAttribute("priority"),
                                nItem.getAttribute("force"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                // CONTENT BLACKLIST
                var iContentBlacklist = doc.evaluate("./blacklist", nContentChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContentBlacklist = iContentBlacklist.iterateNext();
                if (nContentBlacklist)
                {
                    var iItem = doc.evaluate("./item", nContentBlacklist, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nRegexp = iRegexp.iterateNext();
                        if (nRegexp) {
                            var created = nItem.getAttribute("created");
                            page.contentBlacklist.add(new YaripContentBlacklistItem(
                                nRegexp.textContent,
                                nItem.getAttribute("priority"),
                                nItem.getAttribute("force"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound"),
                                nItem.getAttribute("ignored")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                var iContentHeader = doc.evaluate("./header", nContentChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContentHeader = iContentHeader.iterateNext();
                if (nContentHeader)
                {
                    // CONTENT REQUEST HEADER
                    var iContentRequestHeader = doc.evaluate("./request", nContentHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nContentRequestHeader = iContentRequestHeader.iterateNext();
                    if (nContentRequestHeader)
                    {
                        var iItem = doc.evaluate("./item", nContentRequestHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nItem = iItem.iterateNext();
                        while (nItem)
                        {
                            var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nRegexp = iRegexp.iterateNext();
                            var iName = doc.evaluate("./name", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nName = iName.iterateNext();
                            var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nScript = iScript.iterateNext();
                            if (nRegexp) {
                                var created = nItem.getAttribute("created");
                                page.contentRequestHeaderList.add(new YaripHeaderItem(
                                    nRegexp.textContent,
                                    nName.textContent,
                                    nScript ? nScript.textContent : null,
                                    nItem.getAttribute("priority"),
                                    nItem.getAttribute("merge"),
                                    created ? created : pageId,
                                    nItem.getAttribute("lastFound")));
                            }
                            nItem = iItem.iterateNext();
                        }
                    }

                    // CONTENT RESPONSE HEADER
                    var iContentResponseHeader = doc.evaluate("./response", nContentHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nContentResponseHeader = iContentResponseHeader.iterateNext();
                    if (nContentResponseHeader)
                    {
                        var iItem = doc.evaluate("./item", nContentResponseHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nItem = iItem.iterateNext();
                        while (nItem)
                        {
                            var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nRegexp = iRegexp.iterateNext();
                            var iName = doc.evaluate("./name", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nName = iName.iterateNext();
                            var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nScript = iScript.iterateNext();
                            if (nRegexp) {
                                var created = nItem.getAttribute("created");
                                page.contentResponseHeaderList.add(new YaripHeaderItem(
                                    nRegexp.textContent,
                                    nName.textContent,
                                    nScript ? nScript.textContent : null,
                                    nItem.getAttribute("priority"),
                                    nItem.getAttribute("merge"),
                                    created ? created : pageId,
                                    nItem.getAttribute("lastFound")));
                            }
                            nItem = iItem.iterateNext();
                        }
                    }
                }

                // CONTENT REDIRECT
                var iContentRedirect = doc.evaluate("./redirect", nContentChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContentRedirect = iContentRedirect.iterateNext();
                if (nContentRedirect)
                {
                    var iItem = doc.evaluate("./item", nContentRedirect, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nRegexp = iRegexp.iterateNext();
                        var iNewSubStr = doc.evaluate("./newsubstr", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nNewSubStr = iNewSubStr.iterateNext();
                        if (nRegexp) {
                            var created = nItem.getAttribute("created");
                            page.contentRedirectList.add(new YaripRedirectItem(
                                nRegexp.textContent,
                                nNewSubStr ? nNewSubStr.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                // CONTENT STREAM
                var iContentStream = doc.evaluate("./stream", nContentChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nContentStream = iContentStream.iterateNext();
                if (nContentStream)
                {
                    var iItem = doc.evaluate("./item", nContentStream, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nRegexp = iRegexp.iterateNext();
                        var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nScript = iScript.iterateNext();
                        if (nRegexp) {
                            var created = nItem.getAttribute("created");
                            page.contentStreamList.add(new YaripStreamItem(
                                nRegexp.textContent,
                                nScript ? nScript.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }
            }

            // TODO Remove!
            var iStreamChild = doc.evaluate("./stream", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nStreamChild = iStreamChild.iterateNext();
            if (nStreamChild)
            {
                // STREAM REPLACE
                var iStreamReplace = doc.evaluate("./replace", nStreamChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nStreamReplace = iStreamReplace.iterateNext();
                if (nStreamReplace)
                {
                    var iItem = doc.evaluate("./item", nStreamReplace, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nRegexp = iRegexp.iterateNext();
                        var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nScript = iScript.iterateNext();
                        if (nRegexp) {
                            var created = nItem.getAttribute("created");
                            page.pageStreamList.add(new YaripStreamItem(
                                nRegexp.textContent,
                                nScript ? nScript.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }
            }

            var iPageChild = doc.evaluate("./page", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nPageChild = iPageChild.iterateNext();
            if (nPageChild)
            {
if (/^(0\.2\.[5-6](\.\d+)?)|(0\.3\.1)$/.test(version))
{
                // PAGE STYLE
                var iPageStyle = doc.evaluate("./style", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageStyle = iPageStyle.iterateNext();
                if (nPageStyle) {
                    page.pageStyleList.add(new YaripStyleItem(
                        "/html/head",
                        nPageStyle.textContent,
                        nPageStyle.getAttribute("lastChanged"), // priority
                        nPageStyle.getAttribute("lastChanged")));
                }

                // PAGE SCRIPT
                var iPageScript = doc.evaluate("./script", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageScript = iPageScript.iterateNext();
                if (nPageScript) {
                    page.pageScriptList.add(new YaripPageScriptItem(
                        "/html/body",
                        nPageScript.textContent,
                        nPageScript.getAttribute("lastChanged"), // priority
                        nPageScript.getAttribute("lastChanged")));
                }
}
else // if (/^0\.3\.2$/.test(version))
{
                // PAGE STYLE
                var iPageStyle = doc.evaluate("./style", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageStyle = iPageStyle.iterateNext();
                if (nPageStyle)
                {
                    var iItem = doc.evaluate("./item", nPageStyle, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iXPath = doc.evaluate("./xpath", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nXPath = iXPath.iterateNext();
                        var iStyle = doc.evaluate("./style", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nStyle = iStyle.iterateNext();
                        if (nXPath) {
                            var created = nItem.getAttribute("created");
                            page.pageStyleList.add(new YaripStyleItem(
                                nXPath.textContent,
                                nStyle ? nStyle.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound"),
                                nItem.getAttribute("found"),
                                nItem.getAttribute("notFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                // PAGE SCRIPT
                var iPageScript = doc.evaluate("./script", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageScript = iPageScript.iterateNext();
                if (nPageScript)
                {
                    var iItem = doc.evaluate("./item", nPageScript, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iXPath = doc.evaluate("./xpath", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nXPath = iXPath.iterateNext();
                        var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nScript = iScript.iterateNext();
                        if (nXPath) {
                            var created = nItem.getAttribute("created");
                            page.pageScriptList.add(new YaripPageScriptItem(
                                nXPath.textContent,
                                nScript ? nScript.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound"),
                                nItem.getAttribute("found"),
                                nItem.getAttribute("notFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }
}

                var iPageHeader = doc.evaluate("./header", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageHeader = iPageHeader.iterateNext();
                if (nPageHeader)
                {
                    // PAGE REQUEST HEADER
                    var iPageRequestHeader = doc.evaluate("./request", nPageHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nPageRequestHeader = iPageRequestHeader.iterateNext();
                    if (nPageRequestHeader)
                    {
                        var iItem = doc.evaluate("./item", nPageRequestHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nItem = iItem.iterateNext();
                        while (nItem)
                        {
                            var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nRegexp = iRegexp.iterateNext();
                            var iName = doc.evaluate("./name", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nName = iName.iterateNext();
                            var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nScript = iScript.iterateNext();
                            if (nRegexp) {
                                var created = nItem.getAttribute("created");
                                page.pageRequestHeaderList.add(new YaripHeaderItem(
                                    nRegexp.textContent,
                                    nName.textContent,
                                    nScript ? nScript.textContent : null,
                                    nItem.getAttribute("priority"),
                                    nItem.getAttribute("merge"),
                                    created ? created : pageId,
                                    nItem.getAttribute("lastFound")));
                            }
                            nItem = iItem.iterateNext();
                        }
                    }

                    // PAGE RESPONSE HEADER
                    var iPageResponseHeader = doc.evaluate("./response", nPageHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nPageResponseHeader = iPageResponseHeader.iterateNext();
                    if (nPageResponseHeader)
                    {
                        var iItem = doc.evaluate("./item", nPageResponseHeader, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nItem = iItem.iterateNext();
                        while (nItem)
                        {
                            var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nRegexp = iRegexp.iterateNext();
                            var iName = doc.evaluate("./name", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nName = iName.iterateNext();
                            var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                            var nScript = iScript.iterateNext();
                            if (nRegexp) {
                                var created = nItem.getAttribute("created");
                                page.pageResponseHeaderList.add(new YaripHeaderItem(
                                    nRegexp.textContent,
                                    nName.textContent,
                                    nScript ? nScript.textContent : null,
                                    nItem.getAttribute("priority"),
                                    nItem.getAttribute("merge"),
                                    created ? created : pageId,
                                    nItem.getAttribute("lastFound")));
                            }
                            nItem = iItem.iterateNext();
                        }
                    }
                }

                // PAGE STREAM
                var iPageStream = doc.evaluate("./stream", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageStream = iPageStream.iterateNext();
                if (nPageStream)
                {
                    var iItem = doc.evaluate("./item", nPageStream, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nRegexp = iRegexp.iterateNext();
                        var iScript = doc.evaluate("./script", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nScript = iScript.iterateNext();
                        if (nRegexp) {
                            var created = nItem.getAttribute("created");
                            page.pageStreamList.add(new YaripStreamItem(
                                nRegexp.textContent,
                                nScript ? nScript.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }

                // PAGE REDIRECT
                var iPageRedirect = doc.evaluate("./redirect", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nPageRedirect = iPageRedirect.iterateNext();
                if (nPageRedirect)
                {
                    var iItem = doc.evaluate("./item", nPageRedirect, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var iRegexp = doc.evaluate("./regexp", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nRegexp = iRegexp.iterateNext();
                        var iNewSubStr = doc.evaluate("./newsubstr", nItem, null, ORDERED_NODE_ITERATOR_TYPE, null);
                        var nNewSubStr = iNewSubStr.iterateNext();
                        if (nRegexp) {
                            var created = nItem.getAttribute("created");
                            page.pageRedirectList.add(new YaripRedirectItem(
                                nRegexp.textContent,
                                nNewSubStr ? nNewSubStr.textContent : null,
                                nItem.getAttribute("priority"),
                                created ? created : pageId,
                                nItem.getAttribute("lastFound")));
                        }
                        nItem = iItem.iterateNext();
                    }
                }
            }

            map.add(page);
            nPage = iPage.iterateNext();
        }

        var iPage = doc.evaluate("./page", nYarip, null, ORDERED_NODE_ITERATOR_TYPE, null);
        var nPage = iPage.iterateNext();
        while (nPage)
        {
            pageName = nPage.getAttribute("name");
            var pageId = nPage.getAttribute("id");
            var page = map.get(pageName);

            var iPageChild = doc.evaluate("./page", nPage, null, ORDERED_NODE_ITERATOR_TYPE, null);
            var nPageChild = iPageChild.iterateNext();
            if (nPageChild)
            {
                // PAGE EXTENSION
                var iExtension = doc.evaluate("./extension", nPageChild, null, ORDERED_NODE_ITERATOR_TYPE, null);
                var nExtension = iExtension.iterateNext();
                if (nExtension)
                {
                    var iItem = doc.evaluate("./item", nExtension, null, ORDERED_NODE_ITERATOR_TYPE, null);
                    var nItem = iItem.iterateNext();
                    while (nItem)
                    {
                        var pageExtId = nItem.textContent;
                        if (pageExtId && pageExtId != page.getId())
                        {
                            var created = nItem.getAttribute("created");
                            map.addExtension(page, new YaripExtensionItem(
                                pageExtId,
                                nItem.getAttribute("priority"),
                                nItem.getAttribute("doElements"),
                                nItem.getAttribute("doContents"),
                                nItem.getAttribute("doScripts"),
                                nItem.getAttribute("doHeaders"),
                                nItem.getAttribute("doRedirects"),
                                nItem.getAttribute("doStreams"),
                                nItem.getAttribute("doLinks"),
                                created ? created : pageId));
                        }
                        nItem = iItem.iterateNext();
                    }
                }
            }

            nPage = iPage.iterateNext();
        }
    }

    if (imported) {
        this.map.merge(map);
    } else {
        this.map = map;
    }

    return pageName;
}
Yarip.prototype.getDoc = function(file)
{
    if (!file) return null;

    var data = this.getData(file);
    if (!data) return null;

    var dp = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
    return dp.parseFromString(data, "text/xml");
}
Yarip.prototype.getData = function(file)
{
    if (!file) return "";

    var fis = null;
    var sis = null;
    var data = null;
    try {
        fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
//        fis.init(file, 0x01, 0004, null);
        fis.init(file, -1, -1, null); // just reading
        sis = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
        sis.init(fis);
        data = sis.read(sis.available());
        var suc = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
        suc.charset = CHARSET;
        var data = suc.ConvertToUnicode(data);
    } catch (e) {
    } finally {
        if (sis) try { sis.close(); } catch (e) {}
        if (fis) try { fis.close(); } catch (e) {}
    }
    return data ? data : "";
}
Yarip.prototype.getFile = function(path)
{
    if (!path) return null;

    var file = Cc["@mozilla.org/file/directory_service;1"].
        getService(Ci.nsIProperties).
        get("ProfD", Ci.nsIFile);
    var aPath = path.split(/\/|\\/);
    for (var i = 0; i < aPath.length; i++) {
        file.append(aPath[i]);
    }
    if (!file.exists()) {
        file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0600);
    }
    if (file.isFile()) {
        return file;
    } else {
        return null;
    }
}
Yarip.prototype.saveToFile = function(data, file)
{
    if (data != "" && !data || !file) return;

    var fos = null;
    var os = null;
    try {
        fos = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
        fos.init(file, 0x02 | 0x08 | 0x20, 0600, 0);
        os = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
        os.init(fos, CHARSET, 0, 0);
        os.writeString(data);
    } catch (e) {
    } finally {
        if (fos) try { fos.close(); } catch (e) {}
        if (os) try { os.close(); } catch (e) {}
    }
}
Yarip.prototype.logMessage = function(flags, e)
{
    if (!e) return;

    var scriptError = Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);
    scriptError.init("Yarip: " + e.message, e.fileName, e.lineNumber, e.lineNumber, e.columnNumber, flags, "chrome javascript");
    CS.logMessage(scriptError);
}
Yarip.prototype.logContentLocation = function(status, location, contentLocation, mimeTypeGuess, itemObj)
{
    var date = new Date();
    location = this.getLocation(location);
    contentLocation = this.getLocation(contentLocation);
    if (!this.isMobile) {
        var newLog = false;
        for each (var monitor in this.monitorDialogues) {
            if (monitor.logContentLocation(status, location, contentLocation, date, mimeTypeGuess, itemObj)) {
                newLog = true;
            }
        }
        return newLog;
    } else {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var time = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (milliseconds < 10 ? "00" : (milliseconds < 100 ? "0" : "")) + milliseconds;
        var state = "  ";
        switch (status) {
        case STATUS_WHITELISTED: state = "\u263A "; break; // whitelisted
//        case STATUS_BLACKLISTED: state = "\u2639 "; break; // blacklisted
        case STATUS_BLACKLISTED: state = "\u263B "; break; // blacklisted
        case STATUS_REDIRECTED: state = status + " "; break; // redirected
        default: state = status + " "; break;
        }
        var page = location.href;
        var content = contentLocation.href;
        dump("yarip: " + time + " " + state + " " + page + " " + content + "\n");
        return true;
    }
}
Yarip.prototype.updateContentType = function(status, location, contentLocation, contentType, responseStatus)
{
    for each (var monitor in this.monitorDialogues) {
        monitor.updateContentType(status, location, contentLocation, contentType, responseStatus);
    }
}
Yarip.prototype.shouldBlacklist = function(addressObj, url, defaultView, doFlag)
{
    if (!doFlag) doFlag = DO_CONTENTS;
    var whitelisted = false;
    var statusObj = {
        status: STATUS_UNKNOWN,
        newURI: null
    };

    // WHITELIST
    for (var pageName in addressObj.ext)
    {
        if (whitelisted) break;

        var extPage = addressObj.ext[pageName];
        if (!extPage.does(doFlag)) continue; // not doFlag

        var list = this.map.get(pageName).contentWhitelist;
        if (list.length === 0) continue;

        for each (var item in list.obj)
        {
            if (!item.getRegExpObj().test(url)) continue;

            if (extPage.isSelf()) {
                item.incrementLastFound();
            }
            if (defaultView) {
                defaultView.yaripStatus = "found";
            }
            statusObj.itemObj = {
                pageName: pageName,
                ruleType: TYPE_CONTENT_WHITELIST,
                itemKey: item.getKey()
            };
            statusObj.status = STATUS_WHITELISTED;
            if (item.getForce()) {
                return statusObj;
            } else {
                whitelisted = true;
                break;
            }
        }
    }

    // BLACKLIST
    for (var pageName in addressObj.ext)
    {
        var extPage = addressObj.ext[pageName];
        if (!extPage.does(doFlag)) continue; // not doFlag

        var list = this.map.get(pageName).contentBlacklist;
        if (list.length === 0) continue;

        for each (var item in list.obj)
        {
            if (!item.getRegExpObj().test(url)) continue;
            if (whitelisted && !item.getForce()) {
                if (extPage.isSelf()) {
                    item.incrementIgnored();
                }
                continue;
            }

            if (extPage.isSelf()) {
                item.incrementLastFound();
            }
            if (defaultView) {
                defaultView.yaripStatus = "found";
            }
            statusObj.itemObj = {
                pageName: pageName,
                ruleType: TYPE_CONTENT_BLACKLIST,
                itemKey: item.getKey()
            };
            statusObj.status = STATUS_BLACKLISTED;
            return statusObj;
        }
    }

    if (!whitelisted && addressObj.exclusive) {
        statusObj.itemObj = {
            pageName: addressObj.exclusivePageName,
            ruleType: TYPE_CONTENT_WHITELIST // `exclusive'-checkbox
        };
        statusObj.status = STATUS_BLACKLISTED;
    }

    return statusObj;
}
Yarip.prototype.openLocation = function(url)
{
    try {
        var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
            getService(Ci.nsIWindowMediator);
        var gBrowser = wm.getMostRecentWindow("navigator:browser").gBrowser;
        gBrowser.selectedTab = gBrowser.addTab(url);
    } catch (e) {
        var uri = IOS.newURI(url, CHARSET, null);
        var eps = Cc["@mozilla.org/uriloader/external-protocol-service;1"].
            getService(Ci.nsIExternalProtocolService);
        eps.loadURI(uri);
    }
}

Yarip.prototype.getInterface = function(channel, iid)
{
    if (!channel) return null;

    if (channel.notificationCallbacks) {
        try {
            return channel.notificationCallbacks.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(iid);
        } catch(e) {
        }
    }

    if (channel.loadGroup) {
        if (channel.loadGroup.notificationCallbacks) {
            try {
                return channel.loadGroup.notificationCallbacks.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(iid);
            } catch(e) {
            }
        }
        if (channel.loadGroup.groupObserver) {
            try {
                return channel.loadGroup.groupObserver.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(iid);
            } catch(e) {
            }
        }
    }

    return null;
}
Yarip.prototype.getYaripScript = function()
{
    return "" +
        "var yarip = {\n" +
        "    $: function(x) {\n" +
        "        var arr = [];\n" +
        "        var xr = document.evaluate(x, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);\n" +
        "        if (xr) for (var i = 0; i < xr.snapshotLength; i++) arr.push(xr.snapshotItem(i));\n" +
        "        return arr;\n" +
        "    },\n" +
        "    run: function(fun, x) {\n" +
        "        fun.call(this, this.$(x));\n" +
        "    }\n" +
        "}";
}
Yarip.prototype.showLinkNotification = function(doc, location, contentLocation)
{
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var browserEnum = wm.getEnumerator("navigator:browser");
    while (browserEnum.hasMoreElements())
    {
        var browserWin = browserEnum.getNext();
        var tabBrowser = browserWin.gBrowser;
        var index = tabBrowser.getBrowserIndexForDocument(doc);
        if (index >= 0)
        {
            var browser = tabBrowser.getBrowserAtIndex(index);
            location = this.getLocation(location ? location : doc.location);
            contentLocation = this.getLocation(contentLocation);
            var message = "Open link `" + (contentLocation.href.length <= 100 ? contentLocation.href : contentLocation.href.substring(0, 97) + "...") + "'?";
            var nb = tabBrowser.getNotificationBox(browser);
            var openLocation = this.openLocation;
            var yarip = this;
            var buttons = [{
                    accessKey: "w",
                    callback: function() {
                        var pageName = yarip.getFirstAddress(location.asciiHref);
                        if (!pageName) {
                            pageName = location.pageName;
                            if (!pageName) return;
                        }

                        var regExp = yarip.generateRegExp(contentLocation.asciiHref);
                        if (!regExp) return;

                        var obj = {
                            pageName: pageName,
                            itemLocation: location,
                            item: new YaripContentWhitelistItem(regExp),
                            itemContent: contentLocation
                        }

                        browserWin.openDialog("chrome://yarip/content/whitelistcontentdialog.xul", "whitelistcontentdialog", "chrome,modal,resizable", obj);

                        if (!obj.pageName) return;
                        if (!obj.item) return;

//                        yarip.whitelistContentItem(obj.pageName, null, obj.item, location);
                        yarip.whitelistContentItem(location, obj.pageName, obj.item);
                    },
                    label: "Whitelist",
                    popup: null
                },
                {
                    accessKey: "b",
                    callback: function() {
                        var pageName = yarip.getFirstAddress(location.asciiHref);
                        if (!pageName) {
                            pageName = location.pageName;
                            if (!pageName) return;
                        }

                        var regExp = yarip.generateRegExp(contentLocation.asciiHref);
                        if (!regExp) return;

                        var obj = {
                            pageName: pageName,
                            itemLocation: location,
                            item: new YaripContentBlacklistItem(regExp),
                            itemContent: contentLocation
                        }

                        browserWin.openDialog("chrome://yarip/content/blacklistcontentdialog.xul", "blacklistcontentdialog", "chrome,modal,resizable", obj);

                        if (!obj.pageName) return;
                        if (!obj.item) return;

                        yarip.blacklistContentItem(location, obj.pageName, obj.item);
                    },
                    label: "Blacklist",
                    popup: null
                },
                {
                    accessKey: "e",
                    callback: function() {
                        var pageName = yarip.getFirstAddress(location.asciiHref);
                        if (!pageName) {
                            pageName = location.pageName;
                            if (!pageName) return;
                        }

//                        var regExp = yarip.generateRegExp(contentLocation.asciiHref);
//                        if (!regExp) return;

//                        var obj = {
//                            pageName: pageName,
//                            itemLocation: location,
//                            item: new YaripContentBlacklistItem(regExp),
//                            itemContent: contentLocation
//                        }

                        var contentAddress = yarip.getFirstAddress(contentLocation.asciiHref);
                        if (!contentAddress) {
                            contentAddress = yarip.getPageName(contentLocation);
                            if (!contentAddress) return;
                        }

                        var pageExt = yarip.createPage(contentLocation, contentAddress, true /* privateBrowsing/temporary */);
                        var extItem = pageExt.createPageExtensionItem();

                        var obj = {
                            pageName: pageName,
                            pageLocation: location,
                            contentAddress: contentAddress,
                            contentLocation: contentLocation,
                            extItem: extItem
                        }

                        browserWin.openDialog("chrome://yarip/content/extendpagedialog.xul", "extendpagedialog", "chrome,modal,resizable", obj);

                        if (!obj.pageName || !obj.contentAddress || !obj.extItem) {
                            if (pageExt.getTemporary()) yarip.map.remove(pageExt);
                        } else {
                            yarip.extendPage(obj.pageLocation, obj.pageName, obj.contentLocation, obj.contentAddress, obj.extItem);
                        }
                    },
                    label: "Extend",
                    popup: null
                },
                {
                    accessKey: "o",
                    callback: function() { openLocation(contentLocation.href); },
//                    callback: function() { doc.location = contentLocation.href; },
                    label: "Open",
                    popup: null
                }];
//            nb.removeAllNotifications(true);
            nb.appendNotification(message, "yarip-open-link", "chrome://browser/skin/Info.png", nb.PRIORITY_INFO_HIGH, buttons);
            return;
        }
    }
}

var wrappedJSObject = new Yarip();

