
/*
    Copyright 2007-2013 Kim A. Brandt <kimabrandt@gmx.de>

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

function YaripOverlay()
{
    this.enabledObserver = null;
    this.flickerObserver = null;
    this.modeObserver = null;
    this.useIndexObserver = null;
    this.elementsInContextObserver = null;
    this.purgeInnerHTMLObserver = null;
    this.exclusiveOnCreationObserver = null;
    this.templatesObserver = null;
    this.schemesObserver = null;
    this.matchObserver = null;
    this.privateObserver = null;
    this.monitorObserver = null;
    this.pagesObserver = null;
    this.logWhenClosedObserver = null;

    this.appcontent = null;
    this.gBrowser = null;
    this.contextMenu = null;
    this.yaripMenupopup = null;
    this.yaripMonitorMenupopup = null;
    this.tabContainer = null;
    this.stringbundle = null;

    this.doc = null;
    this.loader = null;
    this.handler = null;

    this.active = false;

    this.statusTimeout = null;

    this.getAppcontent = null;
    this.getBrowser = null;
    this.getContextMenu = null;
    this.getContextMenuId = null;
    this.getTabContainer = null;

    this.start = function(event)
    {
        if (event.button !== 0) return;

        var doc = content.document;
        if (this.active) {
            this.stop(doc, false);
            return;
        }

        if (!yarip.enabled) {
            this.toggleEnabled(true);
            return;
        }

        if (!doc) return;

        if (!this.handler.start(doc)) {
            this.stop(doc, false);
            return;
        }

        this.active = true;
        this.doc = doc;
        this.setYaripStatus(doc, "started");
    }

    this.stop = function(doc, noStateChange, noSort)
    {
        if (!this.active || !this.handler) return false;

        this.hideStatus();

        doc = doc ? doc : this.doc;
        if (this.handler.stop()) {
            if (doc) {
                var location = yarip.getLocation(doc.location);
                var pageName = yarip.getPageName(location);
                yarip.reloadPage(pageName);
            }
        }
        this.active = false;

        if (!doc) return true;

        if (!noStateChange) this.setYaripStatus(doc, "stopped");
        this.doc = null;

        return true;
    }

    this.whitelistElement = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref, true);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xpath = yarip.createXPath(node);
        if (!xpath) return;

        var obj = {
            pageName: pageName,
            item: new YaripElementWhitelistItem(xpath + "/descendant-or-self::*")
        }

        window.openDialog("chrome://yarip/content/whitelistelementdialog.xul", "whitelistelementdialog", "chrome,modal,resizable", doc, obj);
        if (!obj.pageName || !obj.item) return;

        yarip.whitelistElementItem(doc, obj.pageName, obj.item, true, true);
    }

    this.blacklistElement = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref, true);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xpath = yarip.createXPath(node);
        if (!xpath) return;

        var obj = {
            pageName: pageName,
            item: new YaripElementBlacklistItem(xpath)
        }

        window.openDialog("chrome://yarip/content/blacklistelementdialog.xul", "blacklistelementdialog", "chrome,modal,resizable", doc, obj);
        if (!obj.pageName || !obj.item) return;

        yarip.blacklistElementItem(doc, obj.pageName, obj.item, true, true);
    }

    this.whitelistTemporarily = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var xpath = yarip.createXPath(node);
        if (!xpath) return;

        yarip.whitelistElementItem(doc, null, new YaripElementWhitelistItem(xpath));
        yarip.removeAllExceptWhitelisted(doc);
    }

    this.removeTemporarily = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var xpath = yarip.createXPath(node);
        if (!xpath) return;

        yarip.blacklistElementItem(doc, null, new YaripElementBlacklistItem(xpath, null, null, true));
    }

    this.styleElement = function(doc, node, attrName)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref, true);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xpath = yarip.createXPath(node);
        if (!xpath) return;

        var attrValue = "";
        if (attrName)
        {
            attrValue = node.getAttribute(attrName);
            if (attrName === "style") attrValue = attrValue.replace(OUTLINE_END_RE, "");
        }

        var obj = {
            pageName: pageName,
            item: new YaripElementAttributeItem(xpath),
            attrName: attrName ? attrName : "",
            attrValue: attrValue,
            node: node
        }

        window.openDialog("chrome://yarip/content/styledialog.xul", "styledialog", "chrome,modal,resizable", doc, obj);
        if (!obj.pageName || !obj.item || !obj.attrName) return;

        obj.item.setName(obj.attrName);
        obj.item.setValue(obj.attrValue);

        yarip.styleElementItem(doc, obj.pageName, obj.item, true, true);
    }

    this.stylePage = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref, true);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var cssSelector = yarip.createCssSelector(node);
        if (!cssSelector) return;

        var obj = {
            item: new YaripStyleItem("/html/head",
                        cssSelector + " {\n" +
                        "}"),
            pageName: pageName
        }

        window.openDialog("chrome://yarip/content/pagestyledialog.xul", "pagestyledialog", "chrome,modal,resizable", doc, obj);
        if (!obj.pageName || !obj.item) return;

        yarip.stylePage(doc, obj.pageName, obj.item, true);
    }

    this.scriptElement = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref, true);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xpath = yarip.createXPath(node);
        if (!xpath) return;

        var obj = {
            item: new YaripScriptItem(xpath,
                "function (array) {\n" +
                "    for (var i = 0; i < array.length; i++) {\n" +
                "        var element = array[i];\n" +
                "        console.debug(\"Found element:\", element);\n" +
                "    }\n" +
                "}"),
            pageName: pageName
        }

        window.openDialog("chrome://yarip/content/scriptdialog.xul", "scriptdialog", "chrome,modal,resizable", doc, obj);
        if (!obj.pageName || !obj.item) return;

        yarip.scriptElementItem(doc, obj.pageName, obj.item, true);
    }

    this.copyXPath = function(node)
    {
        if (!node) return;

        var xpath = yarip.createXPath(node);
        if (xpath) CH.copyString(xpath);
    }

    this.copyCssSelector = function(node)
    {
        if (!node) return;

        var cssSelector = yarip.createCssSelector(node);
        if (cssSelector) CH.copyString(cssSelector);
    }

    this.startHighlighting = function(node)
    {
        if (!node) return;

        this.stopHighlighting();
        this.handler.doc = node.ownerDocument;
        this.handler.element = node;
        this.handler.select();
    }

    this.stopHighlighting = function()
    {
        this.handler.doc = null;
        this.handler.reset();
    }

    this.createPage = function(location)
    {
        this.stop();

        yarip.resetUndo();

        location = yarip.getLocation(location ? location : content.document.location);
        var pageName = yarip.getFirstAddress(location.asciiHref, true);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var obj = {
            pageName: pageName,
            location: location
        }

        window.openDialog("chrome://yarip/content/createpagedialog.xul", "createpagedialog", "chrome,modal,resizable", obj);
        if (!obj.pageName) return;

        var page = yarip.createPage(obj.location, obj.pageName);
        this.managePages(page.getName());
    }

    this.monitorContent = function()
    {
        this.stop();
        yaripMonitor.show();
    }

    this.managePreferences = function()
    {
        this.stop();

        window.openDialog("chrome://yarip/content/options.xul", "optionsdialog", "chrome,modal,resizable");
    }

    this.managePages = function(pageName, type, key)
    {
        this.stop();

        yarip.resetUndo();

        if (!pageName) {
            var location = yarip.getLocation(content.document.location);
            pageName = yarip.getFirstAddress(location.asciiHref);
        }

        var win = Services.wm.getMostRecentWindow("yarip:pages");
        if (win) {
            yarip.reloadPage(pageName, true /* selectItem */, true /* selectTab */, true /* resetFilter */, type, key);
        } else {
//            win = window.open("chrome://yarip/content/pagedialog.xul?page=" + escape(pageName) + (type ? "&type=" + escape(type) : "") + (key ? "&key=" + escape(key) : ""), "_blank", "chrome,resizable");
            win = window.open("chrome://yarip/content/pagedialog.xul?page=" + escape(pageName) + (type ? "&type=" + escape(type) : "") + (key ? "&key=" + escape(key) : ""), "page-dialog", "chrome,resizable");
        }
        win.focus();
    }

    this.toggleEnabled = function(enabled, force)
    {
        this.stop();
        this.enabledObserver.disable();
        var enabledChanged = yarip.toggleEnabled(enabled) || force;
        this.enabledObserver.enable();
        if (enabledChanged) {
            document.getElementById("yarip-enabled-menuitem").setAttribute("checked", String(yarip.enabled));
            this.setYaripStatus(content.document, yarip.enabled ? "enabled" : "disabled");
        }
    }

    this.updateEnabled = function()
    {
        this.toggleEnabled(yarip.getValue(PREF_ENABLED, true, DATA_TYPE_BOOLEAN), true);
    }

    this.toggleNoFlicker = function(noFlicker, force)
    {
        this.flickerObserver.disable();
        if (!yarip.toggleNoFlicker(noFlicker) && !force)
        {
            this.flickerObserver.enable();
            return;
        }
        this.flickerObserver.enable();

        document.getElementById("yarip-flicker-menuitem").setAttribute("checked", String(yarip.noFlicker));
    }

    this.updateNoFlicker = function()
    {
        this.toggleNoFlicker(yarip.getValue(PREF_FLICKER, false, DATA_TYPE_BOOLEAN), true);
    }

    this.toggleLogWhenClosed = function(logWhenClosed, force)
    {
        this.logWhenClosedObserver.disable();
        if (!yarip.toggleLogWhenClosed(logWhenClosed) && !force) {
            this.logWhenClosedObserver.enable();
            return;
        }

        this.logWhenClosedObserver.enable();
        document.getElementById("yarip-logWhenClosed-checkbox").setAttribute("checked", String(yarip.logWhenClosed));
    }

    this.updateLogWhenClosed = function()
    {
        this.toggleLogWhenClosed(yarip.getValue(PREF_LOG_WHEN_CLOSED, false, DATA_TYPE_BOOLEAN), true);
    }

    this.updateNoFlicker = function()
    {
        this.toggleNoFlicker(yarip.getValue(PREF_FLICKER, false, DATA_TYPE_BOOLEAN), true);
    }

    this.setMode = function(mode, clear, force, update)
    {
        this.modeObserver.disable();

        if (!update) {
            if (!yarip.setMode(mode) && !force) {
                this.modeObserver.enable();
                return;
            }
            this.modeObserver.enable();
        } else {
            this.modeObserver.enable();
        }

        if (clear) {
            document.getElementById("yarip-page-menuitem").setAttribute("checked", "false");
            document.getElementById("yarip-fqdn-menuitem").setAttribute("checked", "false");
            document.getElementById("yarip-sld-menuitem").setAttribute("checked", "false");
        }

        this.stop();

        switch (mode) {
        case MODE_PAGE:
            document.getElementById("yarip-page-menuitem").setAttribute("checked", "true");
            break;
        case MODE_FQDN:
            document.getElementById("yarip-fqdn-menuitem").setAttribute("checked", "true");
            break;
        case MODE_SLD:
            document.getElementById("yarip-sld-menuitem").setAttribute("checked", "true");
            break;
        default:
            this.setMode(MODE_FQDN, true);
        }
    }

    this.updateMode = function()
    {
        this.setMode(yarip.getValue(PREF_MODE, MODE_FQDN, DATA_TYPE_INTEGER), true, true, true);
    }

    this.updateKey = function(id, modifiers, key, command)
    {
        if (!/^((accel|access|alt|any|control|meta|shift)(\s+(accel|access|alt|any|control|meta|shift))*)+$/.test(modifiers)) return;
//        if (!/^[\x20-\x7e]$/.test(key) && !/^(VK_[0-9]|VK_[A-Z]|VK_ADD|VK_ALT|VK_BACK|VK_BACK_QUOTE|VK_BACK_SLASH|VK_CANCEL|VK_CAPS_LOCK|VK_CLEAR|VK_CLOSE_BRACKET|VK_COMMA|VK_CONTROL|VK_DECIMAL|VK_DELETE|VK_DIVIDE|VK_DOWN|VK_END|VK_ENTER|VK_EQUALS|VK_ESCAPE|VK_F[1-9]|VK_F1[0-9]|VK_F2[0-4]|VK_HELP|VK_HOME|VK_INSERT|VK_LEFT|VK_MULTIPLY|VK_NUM_LOCK|VK_NUMPAD[0-9]|VK_OPEN_BRACKET|VK_PAGE_DOWN|VK_PAGE_UP|VK_PAUSE|VK_PERIOD|VK_PRINTSCREEN|VK_QUOTE|VK_RETURN|VK_RIGHT|VK_SCROLL_LOCK|VK_SEMICOLON|VK_SEPARATOR|VK_SHIFT|VK_SLASH|VK_SPACE|VK_SUBTRACT|VK_TAB|VK_UP)$/.test(key)) return;

        if (/^[\x20-\x7e]$/.test(key)) {
            // Updating the key.
//            var keyset = document.getElementById("mainKeyset") ? document.getElementById("mainKeyset") : document.getElementById("mailKeys");
//            keyset.removeChild(document.getElementById(id));
            var oldKey = document.getElementById(id);
            var keyset = oldKey.parentNode;
            keyset.removeChild(oldKey);
            var newKey = document.createElement("key");
            newKey.setAttribute("id", id);
            newKey.setAttribute("modifiers", modifiers);
            newKey.setAttribute("key", key);
            newKey.setAttribute("command", command);
            keyset.appendChild(newKey);
            keyset.parentNode.appendChild(keyset);
        } else if (/^(VK_[0-9]|VK_[A-Z]|VK_ADD|VK_ALT|VK_BACK|VK_BACK_QUOTE|VK_BACK_SLASH|VK_CANCEL|VK_CAPS_LOCK|VK_CLEAR|VK_CLOSE_BRACKET|VK_COMMA|VK_CONTROL|VK_DECIMAL|VK_DELETE|VK_DIVIDE|VK_DOWN|VK_END|VK_ENTER|VK_EQUALS|VK_ESCAPE|VK_F[1-9]|VK_F1[0-9]|VK_F2[0-4]|VK_HELP|VK_HOME|VK_INSERT|VK_LEFT|VK_MULTIPLY|VK_NUM_LOCK|VK_NUMPAD[0-9]|VK_OPEN_BRACKET|VK_PAGE_DOWN|VK_PAGE_UP|VK_PAUSE|VK_PERIOD|VK_PRINTSCREEN|VK_QUOTE|VK_RETURN|VK_RIGHT|VK_SCROLL_LOCK|VK_SEMICOLON|VK_SEPARATOR|VK_SHIFT|VK_SLASH|VK_SPACE|VK_SUBTRACT|VK_TAB|VK_UP)$/.test(key)) {
            // Updating the keycode.
            var oldKeycode = document.getElementById(id);
            var keyset = oldKeycode.parentNode;
            keyset.removeChild(oldKeycode);
            var newKeycode = document.createElement("key");
            newKeycode.setAttribute("id", id);
            newKeycode.setAttribute("modifiers", modifiers);
            newKeycode.setAttribute("keycode", key);
            newKeycode.setAttribute("command", command);
            keyset.appendChild(newKeycode);
            keyset.parentNode.appendChild(keyset);
        } else {
            return;
        }

        // Updating the tools-menupopup.
        var menupopup = document.getElementById("yarip-tools-menupopup");
        var children = menupopup.childNodes;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var k = child.getAttribute("key");
            if (k) {
                child.removeAttribute("key");
                child.setAttribute("key", k);
            } else {
                k = child.getAttribute("keycode");
                if (k) {
                    child.removeAttribute("keycode");
                    child.setAttribute("keycode", k);
                }
            }
        }
    }

    this.handleEvent = function(event)
    {
        var ref = this;

        switch(event.type) {
        case "load":
            yaripMonitor.load();

            this.loader = new YaripLoader();
            this.handler = new YaripHandler(null, function() { yaripOverlay.stop(); }, function(status) { yaripOverlay.setStatus(status); });

            this.enabledObserver = new YaripPreferenceObserver(
                PREF_ENABLED,
                function() { yaripOverlay.updateEnabled(); }
            );
            this.flickerObserver = new YaripPreferenceObserver(
                PREF_FLICKER,
                function() { yaripOverlay.updateNoFlicker(); }
            );
            this.modeObserver = new YaripPreferenceObserver(
                PREF_MODE,
                function() { yaripOverlay.updateMode(); }
            );
            this.useIndexObserver = new YaripPreferenceObserver(
                PREF_INDEX,
                function() {
                    yarip.setUseIndex(yarip.getValue(PREF_INDEX, 1, DATA_TYPE_INTEGER));
                }
            );
            this.elementsInContextObserver = new YaripPreferenceObserver(
                PREF_ELEMENTS,
                function() {
                    yarip.setElementsInContext(yarip.getValue(PREF_ELEMENTS, 4, DATA_TYPE_INTEGER));
                }
            );
            this.purgeInnerHTMLObserver = new YaripPreferenceObserver(
                PREF_PURGE,
                function() {
                    yarip.setPurgeInnerHTML(yarip.getValue(PREF_PURGE, false, DATA_TYPE_BOOLEAN));
                }
            );
            this.exclusiveOnCreationObserver = new YaripPreferenceObserver(
                PREF_EXCLUSIVE,
                function() {
                    yarip.setExclusiveOnCreation(yarip.getValue(PREF_EXCLUSIVE, false, DATA_TYPE_BOOLEAN));
                }
            );
            this.templatesObserver = new YaripPreferenceObserver(
                PREF_TEMPLATES,
                function() {
                    yarip.setTemplates(yarip.getValue(PREF_TEMPLATES, "", DATA_TYPE_STRING));
                }
            );
            this.schemesObserver = new YaripPreferenceObserver(
                PREF_SCHEMES,
                function() {
                    yarip.setSchemes(yarip.getValue(PREF_SCHEMES, "", DATA_TYPE_STRING));
                }
            );
            this.matchObserver = new YaripPreferenceObserver(
                PREF_MATCH,
                function() {
                    yarip.setMatchAuthorityPort(yarip.getValue(PREF_MATCH, true, DATA_TYPE_BOOLEAN));
                }
            );
            this.privateObserver = new YaripPreferenceObserver(
                PREF_PRIVATE,
                function() {
                    yarip.setPrivateBrowsing(yarip.getValue(PREF_PRIVATE, false, DATA_TYPE_BOOLEAN));
                }
            );
            this.monitorObserver = new YaripPreferenceObserver(
                [PREF_MONITOR_MODIFIERS, PREF_MONITOR_KEY_CODE],
                function() {
                    var modifiers = yarip.getValue(PREF_MONITOR_MODIFIERS, "accel", DATA_TYPE_STRING);
                    var key = yarip.getValue(PREF_MONITOR_KEY_CODE, "m", DATA_TYPE_STRING);
                    yaripOverlay.updateKey("key_yaripToggleShow", modifiers, key, "cmd_yaripToggleShow");
                }
            );
            this.monitorObserver.observe(null, null, "value"); // trigger once
            this.pagesObserver = new YaripPreferenceObserver(
                [PREF_PAGES_MODIFIERS, PREF_PAGES_KEY_CODE],
                function() {
                    var modifiers = yarip.getValue(PREF_PAGES_MODIFIERS, "accel alt", DATA_TYPE_STRING);
                    var key = yarip.getValue(PREF_PAGES_KEY_CODE, "m", DATA_TYPE_STRING);
                    yaripOverlay.updateKey("key_yaripManagePages", modifiers, key, "cmd_yaripManagePages");
                }
            );
            this.pagesObserver.observe(null, null, "value"); // trigger once
            this.logWhenClosedObserver = new YaripPreferenceObserver(
                PREF_LOG_WHEN_CLOSED,
                function() { yaripOverlay.updateLogWhenClosed(); }
            );

            var appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
            switch (appInfo.ID) {
            case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}": // Firefox
                this.getAppcontent = function() { return document.getElementById("appcontent"); };
                this.getBrowser = function() { return gBrowser; };
                this.getContextMenuId = function() { return "contentAreaContextMenu"; };
                this.getContextMenu = function() { return document.getElementById("contentAreaContextMenu"); };
                this.getTabContainer = function() { return gBrowser.tabContainer; };
                break;
            case "{3550f703-e582-4d05-9a08-453d09bdfdc6}": // Thunderbird
                this.getAppcontent = function() { return document; };
                this.getBrowser = function() { return "getBrowser" in window ? getBrowser() : messageContent; };
                this.getContextMenuId = function() { return "mailContext"; };
                this.getContextMenu = function() { return document.getElementById("mailContext"); };
                this.getTabContainer = function() { return document.getElementById("tabmail").tabContainer; };
                break;
//            case "{a23983c0-fd0e-11dc-95ff-0800200c9a66}": // Mobile
//                break;
//            case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}": // SeaMonkey
//                break;
            }

            this.appcontent = this.getAppcontent();
            this.gBrowser = this.getBrowser();
            this.contextMenu = this.getContextMenu();
            this.contextMenuId = this.getContextMenuId();
            this.yaripMenupopup = document.getElementById("yarip-menupopup");
            this.yaripMonitorMenupopup = document.getElementById("yarip-monitor-menupopup");
            this.tabContainer = this.getTabContainer();

            this.stringbundle = document.getElementById("yarip-overlay-stringbundle");
            this.updateEnabled();
            this.updateNoFlicker();
            this.updateMode();
            this.updateLogWhenClosed();

            yarip.injectCSS("chrome://yarip/skin/blacklist.css", true);

            if (this.appcontent) this.appcontent.addEventListener("DOMContentLoaded", this, false);
            if (this.contextMenu) this.contextMenu.addEventListener("popupshowing", this, false);
            if (this.yaripMonitorMenupopup) this.yaripMonitorMenupopup.addEventListener("popupshowing", yaripMonitor, false);
            if (this.tabContainer) this.tabContainer.addEventListener("select", this, false);
            window.removeEventListener("load", this, false);
            break;

        case "unload":
            this.enabledObserver.unregister();
            this.flickerObserver.unregister();
            this.modeObserver.unregister();
            this.useIndexObserver.unregister();
            this.elementsInContextObserver.unregister();
            this.purgeInnerHTMLObserver.unregister();
            this.exclusiveOnCreationObserver.unregister();
            this.templatesObserver.unregister();
            this.schemesObserver.unregister();
            this.matchObserver.unregister();
            this.privateObserver.unregister();
            this.logWhenClosedObserver.unregister();

            yaripMonitor.unload();

            if (this.appcontent) this.appcontent.removeEventListener("DOMContentLoaded", this, false);
            if (this.contextMenu) this.contextMenu.removeEventListener("popupshowing", this, false);
            if (this.tabContainer) this.tabContainer.removeEventListener("select", this, false);
            window.removeEventListener("unload", this, false);
            break;

        case "DOMContentLoaded":
            this.stop();
            yarip.resetUndo();

            var doc = event.originalTarget;
            if (!doc || !doc.body || !doc.defaultView) break;
            if (!yarip.schemesRegExp.test(doc.location.protocol.replace(/:$/, ""))) break;

            doc.defaultView.yaripMutationObserver = new MutationObserver(function(mutations) {
                if (!yarip.enabled) return;
                if (!doc || !doc.defaultView || doc.defaultView.yaripMutationObserverTimeout) return;

                mutations.forEach(function(mutation) {
                    if (!yarip.enabled) return;
                    if (!doc || !doc.defaultView || doc.defaultView.yaripMutationObserverTimeout) return;

                    for (var i = 0, n = mutation.addedNodes.length; i < n; i++) {
                        var node = mutation.addedNodes[i];
                        if ("getAttribute" in node) {
                            if (!node.parentNode) continue;
                            if (/^(firebug|yarip)/.test(node.getAttribute("class"))) continue;
                            if (/\b(blacklisted|highlighted|whitelisted)\b/.test(node.getAttribute("status"))) continue;

                            doc.defaultView.yaripMutationObserverTimeout = setTimeout(function() { ref.domContentLoaded(doc, ref, true); }, 1000);
                            return;
                        }
                    }
                });
            });
            doc.defaultView.yaripMutationObserver.observe(doc.body, {
                subtree: true,
                attributes: false,
                childList: true,
                characterData: false
            });
//            doc.defaultView.yaripMutationObserver.disconnect();

            this.domContentLoaded(doc, this);

            /*if (yarip.noFlicker)*/ doc.body.setAttribute("status", "whitelisted");
            break;

        case "DOMMenuItemActive":
            var menu = event.target;
            this.startHighlighting(menu.attribute ? menu.attribute : menu.node);
            break;

        case "DOMMenuItemInactive":
            this.stopHighlighting();
            this.hideStatusAfterTimeout();
            break;

        case "popupshowing":
            this.stop();
            if (event.target.getAttribute("id") !== this.contextMenuId) return;

            // YARIP-MENU
            var menu = this.yaripMenupopup.firstChild;
            while (menu && menu.getAttribute("id") !== "yarip-undo-menu-sep")
            {
                var next = menu.nextSibling;
                menu.removeEventListener("DOMMenuItemActive", this, false);
                menu.removeEventListener("DOMMenuItemInactive", this, false);
                this.yaripMenupopup.removeChild(menu);
                menu = next;
            }
            var node = document.popupNode;
            var doc = node.ownerDocument;
            var hasMenus = false;
            var location = yarip.getLocation(doc.location);
            if (yarip.getPageName(location))
            {
                var undoMenuSep = document.getElementById("yarip-undo-menu-sep");
                var undoMenu = document.getElementById("yarip-undo-menupopup");
                undoMenuSep.hidden = false;

                // ELEMENT-MENUES
                var tmpNode = node;
                for (var i = 0; i < yarip.elementsInContext && tmpNode && tmpNode.localName && !/^(html|body|frameset|frame)$/i.test(tmpNode.localName); i++)
                {
                    menu = this.createMenu(tmpNode);
                    if (menu) {
                        this.yaripMenupopup.insertBefore(menu, undoMenuSep);
                        hasMenus = true;
                    }
                    tmpNode = tmpNode.parentNode;
                }

                // FRAME-MENU
                var inFrame = gContextMenu && gContextMenu.inFrame || false;
                if (inFrame)
                {
                    var frame = node.ownerDocument.defaultView.frameElement;
                    var frameMenu = this.createMenu(frame, true);
                    if (!yarip.getPageName(frame.ownerDocument.location)) frameMenu.setAttribute("disabled", true);
                    this.yaripMenupopup.insertBefore(frameMenu, undoMenuSep);
                }
                hasMenus = hasMenus || inFrame;

                // UNDO-MENU
                var menuitem = undoMenu.firstChild;
                while (menuitem && menuitem.localName !== "menuseparator")
                {
                    var next = menuitem.nextSibling;
                    undoMenu.removeChild(menuitem);
                    menuitem = next;
                }
                var found = false;
                for each (var obj in yarip.undoObj) {
                    if (!obj || obj.document !== doc) continue;

                    var menuitem = document.createElement("menuitem");
                    menuitem.setAttribute("label", this.stringbundle.getFormattedString("undo-" + obj.type, [obj.text]));
                    menuitem.doc = doc;
                    menuitem.key = obj.type + " " + obj.key;
//                    menuitem.addEventListener("command", function() { ref.undo(obj); }, false);
                    menuitem.addEventListener("command", function() { ref.undoOne(this.doc, this.key); }, false);
                    menuitem.setAttribute("crop", "center");
                    undoMenu.insertBefore(menuitem, undoMenu.firstChild);
                    found = true;
                }
                document.getElementById("yarip-undo-menu-sep").hidden = !hasMenus;
                document.getElementById("yarip-undo-menu").hidden = !found;
            } else {
                document.getElementById("yarip-undo-menu-sep").hidden = true;
            }
            break;

        case "select":
            if (this.gBrowser) {
                this.setYaripStatus(this.gBrowser.contentWindow.document);
            }
            break;

        case "keypress":
            if (event.keyCode === KeyEvent.DOM_VK_ESCAPE)
            {
                var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
                var browserEnum = wm.getEnumerator("navigator:browser");
                while (browserEnum.hasMoreElements()) {
                    var browserWin = browserEnum.getNext();
                    var tabBrowser = browserWin.gBrowser;
                    var index = tabBrowser.getBrowserIndexForDocument(this.gBrowser.contentWindow.document);
                    if (index >= 0) {
                        var browser = tabBrowser.getBrowserAtIndex(index);
                        var nb = tabBrowser.getNotificationBox(browser);
                        nb.removeAllNotifications(true);
                        break;
                    }
                }

                yarip.resetKnown();
            }
            break;
        }
    }

    this.resetCount = function (doc)
    {
        if (doc && doc.defaultView && doc.defaultView.yarip) {
            doc.defaultView.yarip.resetTimeout = null;
            doc.defaultView.yarip.count = null;
        }
    }

    this.domContentLoaded = function(doc, overlay, noIncrement)
    {
        if (!doc || !doc.defaultView) return;

        doc.defaultView.yaripMutationObserverTimeout = null;

        if (!yarip.enabled) return;

        if (overlay.loader.load(doc, !noIncrement)) {
            overlay.setYaripStatus(doc, "found");
        } else {
            overlay.setYaripStatus(doc);
        }
    }

    this.createMenu = function(node, isFrame)
    {
        var menu = document.createElement("menu");
        menu.node = node;
        menu.setAttribute("label", node.localName.toUpperCase());
        menu.addEventListener("DOMMenuItemActive", this, false);
        menu.addEventListener("DOMMenuItemInactive", this, false);
        var menupopup = document.createElement("menupopup");

        var ref = this;
        var item = null;

        // WHITELIST ELEMENT
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemElementWhitelist"));
        item.addEventListener("command", function() { ref.whitelistElement(node.ownerDocument, node); }, false);
        item.setAttribute("class", "whitelist");
        menupopup.appendChild(item);

        // BLACKLIST ELEMENT
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemElementBlacklist"));
        item.addEventListener("command", function() { ref.blacklistElement(node.ownerDocument, node); }, false);
        item.setAttribute("class", "blacklist");
        menupopup.appendChild(item);

        var tmpMenu = null;
        var tmpMenupopup = null;

        // BLACKLIST ATTRIBUTE
        if (node.hasAttributes())
        {
            var found = false;
            tmpMenu = document.createElement("menu");
            tmpMenu.setAttribute("label", this.stringbundle.getString("menuAttributeBlacklist"));
            tmpMenupopup = document.createElement("menupopup");
            if (node.hasAttributes())
            {
                for (var i = 0; i < node.attributes.length; i++)
                {
                    var attribute = node.attributes[i];
                    if (!attribute || !attribute.value) continue;

                    switch (attribute.name) {
                    case "status": if (/^(whitelisted|blacklisted)$/.test(attribute.value)) continue;
                    case "style": if (OUTLINE_RE.test(attribute.value)) continue;
                    }

                    item = document.createElement("menuitem");
                    item.attribute = attribute;
                    item.setAttribute("label", attribute.name.toLowerCase());
                    if (isFrame) item.addEventListener("command", function() { ref.blacklistElement(node.ownerDocument.defaultView.frameElement.ownerDocument, attribute); }, false);
                    else item.addEventListener("command", function(e) { ref.blacklistElement(node.ownerDocument, e.target.attribute); }, false);
                    tmpMenupopup.appendChild(item);
                    found = true;
                }
            }

            if (found) {
                tmpMenu.appendChild(tmpMenupopup);
                menupopup.appendChild(tmpMenu);
            }
        }

        // STYLE ELEMENT
        tmpMenu = document.createElement("menu");
        tmpMenu.setAttribute("label", this.stringbundle.getString("menuitemStyleElement"));
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemUserDefined"));
        if (isFrame) item.addEventListener("command", function() { ref.styleElement(node.ownerDocument.defaultView.frameElement.ownerDocument, node); }, false);
        else item.addEventListener("command", function() { ref.styleElement(node.ownerDocument, node); }, false);
        tmpMenupopup = document.createElement("menupopup");
        tmpMenupopup.appendChild(item);
        if (node.hasAttributes()) {
            var seMenuseparator = document.createElement("menuseparator");
            tmpMenupopup.insertBefore(seMenuseparator, item);
            for (var i = 0; i < node.attributes.length; i++)
            {
                var attribute = node.attributes[i];
                if (!attribute || !attribute.value) continue;

                switch (attribute.name) {
                case "status": if (/^(whitelisted|blacklisted)$/.test(attribute.value)) continue;
                case "style": if (OUTLINE_RE.test(attribute.value)) continue;
                }

                item = document.createElement("menuitem");
                item.attribute = attribute;
                item.setAttribute("label", attribute.name.toLowerCase());
                if (isFrame) item.addEventListener("command", function() { ref.styleElement(node.ownerDocument.defaultView.frameElement.ownerDocument, node, attribute.name.toLowerCase()); }, false);
                else item.addEventListener("command", function(e) { ref.styleElement(node.ownerDocument, node, e.target.attribute.name.toLowerCase()); }, false);
                tmpMenupopup.insertBefore(item, seMenuseparator);
            }
        }
        tmpMenu.appendChild(tmpMenupopup);
        menupopup.appendChild(tmpMenu);

        // SCRIPT ELEMENT
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemScriptElement"));
        item.addEventListener("command", function() { ref.scriptElement(node.ownerDocument, node); }, false);
        menupopup.appendChild(item);

        // TEMPORARILY WHITELIST
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemKeepTemporarily"));
        item.addEventListener("command", function() { ref.whitelistTemporarily(node.ownerDocument, node); }, false);
        item.setAttribute("class", "whitelist temporary");
        menupopup.appendChild(item);

        // TEMPORARILY BLACKLIST
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemRemoveTemporarily"));
        item.addEventListener("command", function() { ref.removeTemporarily(node.ownerDocument, node); }, false);
        item.setAttribute("class", "blacklist temporary");
        menupopup.appendChild(item);

        // STYLE PAGE
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemStylePage"));
        item.addEventListener("command", function() { ref.stylePage(node.ownerDocument, node); }, false);
        menupopup.appendChild(item);

        // ADD TO HISTORY
        if (node.localName == "a") {
            item = document.createElement("menuitem");
            item.setAttribute("label", this.stringbundle.getString("menuitemAddToHistory"));
            item.addEventListener("command", function() {
                var loc = node.ownerDocument.location.href;
                var href = node.getAttribute("href");
                if (!/^\w+:\/+/.test(href)) {
                    var path = node.ownerDocument.location.pathname;
                    href = loc.substring(0, loc.indexOf(path)) + (!/^\//.test(href) ? "/" : "") + href;
                }
                GH.addURI(IOS.newURI(href, null, null), false, true, IOS.newURI(loc, null, null));
            }, false);
            menupopup.appendChild(item);
        }

        // COPY XPATH
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemCopyXPath"));
        item.addEventListener("command", function() { ref.copyXPath(node); }, false);
        item.setAttribute("class", "copyXPath");
        menupopup.appendChild(item);

        // COPY CSS SELECTOR
        item = document.createElement("menuitem");
        item.setAttribute("label", this.stringbundle.getString("menuitemCopyCssSelector"));
        item.addEventListener("command", function() { ref.copyCssSelector(node); }, false);
        item.setAttribute("class", "copyCssSelector");
        menupopup.appendChild(item);

        menu.appendChild(menupopup);
        return menu;
    }

    this.undoOne = function(doc, key)
    {
        if (!doc) return;

        var obj = yarip.undoObj[key];
        if (obj && obj.document === doc) {
            this.undo(obj, true);
            yarip.reloadPage(obj.pageName);
        }
    }

    this.undoAll = function(doc)
    {
        if (!doc) return;

        var obj = null;
        for each (obj in yarip.undoObj) {
            if (obj && obj.document === doc) this.undo(obj, true);
        }

        if (obj) yarip.reloadPage(obj.pageName);
    }

    this.undo = function(obj, noReload)
    {
        if (!obj) return;

        yarip.resetOnAddress(obj);
        if (!noReload) yarip.reloadPage(obj.pageName);
    }

    this.setStatus = function(status)
    {
        clearTimeout(this.statusTimeout);
        document.getElementById("yarip-status-label").value = status;
        document.getElementById("yarip-status").hidden = false;
    }

    this.hideStatus = function()
    {
        document.getElementById("yarip-status").hidden = true;
    }

    this.hideStatusAfterTimeout = function()
    {
        clearTimeout(this.statusTimeout);
        var ref = this;
        this.statusTimeout = setTimeout(function() { ref.hideStatus(); }, 100);
    }

    this.setYaripStatus = function(doc, status)
    {
        if (!doc) return;

        if (yarip.enabled) {
            if (!status) {
                try {
                    status = doc.defaultView && doc.defaultView.yaripStatus ? doc.defaultView.yaripStatus : null;
                } catch(e) {}
                switch (status) {
                case "enabled":
                case "stopped":
                case "found":
                    break;
                case "disabled":
                case "started":
                    if (this.active) break;
                default:
                    status = "enabled";
                }
            }
        } else {
            status = "disabled";
        }

        try {
            if (doc.defaultView) {
                doc.defaultView.yaripStatus = status;
            }

            if (doc === this.gBrowser.contentWindow.document) {
                var toolbarbutton = document.getElementById("yarip-toolbarbutton");
                if (toolbarbutton) {
                    toolbarbutton.setAttribute("status", status);
                    toolbarbutton.setAttribute("tooltiptext", this.stringbundle.getString("status-" + status));
                }
            }
        } catch(e) {}
    }
}
