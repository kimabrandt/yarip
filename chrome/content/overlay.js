
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

function YaripOverlay()
{
    this.enabledObserver = null;
    this.flickerObserver = null;
    this.modeObserver = null;
//    this.alwaysUseIndexObserver = null;
    this.useIndexObserver = null;
    this.elementsInContextObserver = null;
    this.purgeInnerHTMLObserver = null;
    this.exclusiveOnCreationObserver = null;
    this.templatesObserver = null;
    this.schemesObserver = null;
    this.privateObserver = null;
    this.recurrenceObserver = null;
//    this.monitorModifiersObserver = null;
//    this.monitorKeyCodeObserver = null;
    this.monitorObserver = null;
//    this.pagesModifiersObserver = null;
//    this.pagesKeyCodeObserver = null;
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
        if (event.button != 0) return;

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
                var location = yarip.getLocationFromLocation(doc.location);
                yarip.reloadPage(yarip.getPageName(location));
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

        var location = yarip.getLocationFromLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xValue = yarip.createXPath(node);
        if (!xValue) return;

        var obj = {
            pageName: pageName,
            item: new YaripElementWhitelistItem(xValue + "/descendant-or-self::*")
        }

        window.openDialog("chrome://yarip/content/whitelistelementdialog.xul", "whitelistelementdialog", "chrome,modal,resizable", doc, obj);

        if (!obj.pageName || obj.pageName === "") return;
        if (!obj.item) return;

        yarip.whitelistElementItem(doc, obj.pageName, obj.item, true, true);
    }

    this.blacklistElement = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocationFromLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xValue = yarip.createXPath(node);
        if (!xValue) return;

        var obj = {
            pageName: pageName,
            item: new YaripElementBlacklistItem(xValue)
        }

        window.openDialog("chrome://yarip/content/blacklistelementdialog.xul", "blacklistelementdialog", "chrome,modal,resizable", doc, obj);

        if (!obj.item) return;
        if (!obj.pageName || obj.pageName === "") return;

        yarip.blacklistElementItem(doc, obj.pageName, obj.item, true, true);
    }

    this.whitelistTemporarily = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var xValue = yarip.createXPath(node);
        if (!xValue) return;

        yarip.whitelistElementItem(doc, null, new YaripElementWhitelistItem(xValue));
        yarip.removeAllExceptWhitelisted(doc);
    }

    this.removeTemporarily = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var xValue = yarip.createXPath(node);
        if (!xValue) return;

        yarip.blacklistElementItem(doc, null, new YaripElementBlacklistItem(xValue, null, null, true));
    }

    this.styleElement = function(doc, node, attrName)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocationFromLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xValue = yarip.createXPath(node);
        if (!xValue) return;

        var attrValue = "";
        if (attrName)
        {
            attrValue = node.getAttribute(attrName);
            if (attrName === "style") attrValue = attrValue.replace(OUTLINE_END_RE, "");
        }

        var obj = {
            pageName: pageName,
            item: new YaripElementAttributeItem(xValue),
            attrName: attrName ? attrName : "",
            attrValue: attrValue,
            node: node
        }

        window.openDialog("chrome://yarip/content/styledialog.xul", "styledialog", "chrome,modal,resizable", doc, obj);

        if (!obj.pageName || obj.pageName === "") return;
        if (!obj.item) return;
        if (!obj.attrName || obj.attrName === "") return;

        obj.item.setName(obj.attrName);
        obj.item.setValue(obj.attrValue);

        yarip.styleElementItem(doc, obj.pageName, obj.item, true, true);
    }

    this.scriptElement = function(doc, node)
    {
        this.toggleEnabled(true);

        if (!doc || !node) return;

        var location = yarip.getLocationFromLocation(doc.location);
        var pageName = yarip.getFirstAddress(location.asciiHref);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var xValue = yarip.createXPath(node);
        if (!xValue) return;

        var obj = {
            item: new YaripScriptItem(xValue,
                "function (array) {\n" +
//                "    // Do something useful with the elements in the array!\n" +
                "    for (var i = 0; i < array.length; i++) {\n" +
                "        var element = array[i];\n" +
                "        console.debug(\"Found element:\", element);\n" +
                "    }\n" +
                "}"),
            pageName: pageName
        }

        window.openDialog("chrome://yarip/content/scriptdialog.xul", "scriptdialog", "chrome,modal,resizable", doc, obj);

        if (!obj.pageName || obj.pageName === "") return;
        if (!obj.item) return;

        yarip.scriptElementItem(doc, obj.pageName, obj.item, true);
    }

    this.copyXPath = function(node)
    {
        if (!node) return;

        var xValue = yarip.createXPath(node);
        if (xValue) CH.copyString(xValue);
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

        location = yarip.getLocationFromLocation(location ? location : content.document.location);
        var pageName = yarip.getFirstAddress(location.asciiHref);
        if (!pageName) {
            pageName = yarip.getPageName(location);
            if (!pageName) return;
        }

        var obj = {
            pageName: pageName,
            pageLocation: location
//            contentLocation: null
        }

        window.openDialog("chrome://yarip/content/createpagedialog.xul", "createpagedialog", "chrome,modal,resizable", obj);

        if (!obj.pageName) return;

        var page = yarip.createPage(obj.pageLocation, obj.pageName);
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

    this.manageContent = function(pageName, type, key)
    {
        this.stop();

        yarip.resetUndo();

        if (!pageName) {
            var location = yarip.getLocationFromLocation(content.document.location);
            pageName = yarip.getFirstAddress(location.asciiHref);
        }

//        if (!yarip.reloadPage(pageName, true /* selectItem */, true /* selectTab */, true /* resetFilter */)) {
        if (!yarip.reloadPage(pageName, true /* selectItem */, true /* selectTab */, true /* resetFilter */, type, key)) {
            window.openDialog("chrome://yarip/content/pagedialog.xul", "pagedialog", "chrome,resizable", pageName, type, key);
        }
    }

    this.managePages = function(pageName)
    {
        this.stop();

        yarip.resetUndo();

        if (!pageName) {
            var location = yarip.getLocationFromLocation(content.document.location);
            pageName = yarip.getFirstAddress(location.asciiHref);
        }

        if (!yarip.reloadPage(pageName, true /* selectItem */, true /* selectTab */, true /* reset */)) {
            window.openDialog("chrome://yarip/content/pagedialog.xul", "pagedialog", "chrome,resizable", pageName);
        }
    }

    this.toggleEnabled = function(enabled, force)
    {
        this.stop();
        this.enabledObserver.disable();
        var enabledChanged = yarip.toggleEnabled(enabled) || force;
        this.enabledObserver.enable();
        if (enabledChanged) {
            document.getElementById("yarip-enabled-menuitem").setAttribute("checked", "" + yarip.enabled);
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

        document.getElementById("yarip-flicker-menuitem").setAttribute("checked", "" + yarip.noFlicker);
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
        document.getElementById("yarip-logWhenClosed-checkbox").setAttribute("checked", "" + yarip.logWhenClosed);
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
    //        var keyset = document.getElementById("mainKeyset") ? document.getElementById("mainKeyset") : document.getElementById("mailKeys");
    //        keyset.removeChild(document.getElementById(id));
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
        switch(event.type) {
        case "load":
            yaripMonitor.load();

            this.loader = new YaripLoader();
            this.handler = new YaripHandler(null, function() { yaripOverlay.stop(); }, function(status) { yaripOverlay.setStatus(status); });

            this.enabledObserver = new YaripObserver(
                PREF_ENABLED,
                function() { yaripOverlay.updateEnabled(); }
            );
            this.flickerObserver = new YaripObserver(
                PREF_FLICKER,
                function() { yaripOverlay.updateNoFlicker(); }
            );
            this.modeObserver = new YaripObserver(
                PREF_MODE,
                function() { yaripOverlay.updateMode(); }
            );
//            this.alwaysUseIndexObserver = new YaripObserver(
//                PREF_INDEX,
//                function() {
//                    yarip.setAlwaysUseIndex(yarip.getValue(PREF_INDEX, false, DATA_TYPE_BOOLEAN));
//                }
//            );
            this.useIndexObserver = new YaripObserver(
                PREF_INDEX,
                function() {
                    yarip.setUseIndex(yarip.getValue(PREF_INDEX, 1, DATA_TYPE_INTEGER));
                }
            );
            this.elementsInContextObserver = new YaripObserver(
                PREF_ELEMENTS,
                function() {
                    yarip.setElementsInContext(yarip.getValue(PREF_ELEMENTS, 4, DATA_TYPE_INTEGER));
                }
            );
            this.purgeInnerHTMLObserver = new YaripObserver(
                PREF_PURGE,
                function() {
                    yarip.setPurgeInnerHTML(yarip.getValue(PREF_PURGE, false, DATA_TYPE_BOOLEAN));
                }
            );
            this.exclusiveOnCreationObserver = new YaripObserver(
                PREF_EXCLUSIVE,
                function() {
                    yarip.setExclusiveOnCreation(yarip.getValue(PREF_EXCLUSIVE, false, DATA_TYPE_BOOLEAN));
                }
            );
            this.templatesObserver = new YaripObserver(
                PREF_TEMPLATES,
                function() {
                    yarip.setTemplates(yarip.getValue(PREF_TEMPLATES, "", DATA_TYPE_STRING));
                }
            );
            this.schemesObserver = new YaripObserver(
                PREF_SCHEMES,
                function() {
                    yarip.setSchemes(yarip.getValue(PREF_SCHEMES, "", DATA_TYPE_STRING));
                }
            );
            this.privateObserver = new YaripObserver(
                PREF_PRIVATE,
                function() {
                    yarip.setPrivateBrowsing(yarip.getValue(PREF_PRIVATE, false, DATA_TYPE_BOOLEAN));
                }
            );
            this.recurrenceObserver = new YaripObserver(
                PREF_RECURRENCE,
                function() {
                    yarip.setContentRecurrence(yarip.getValue(PREF_RECURRENCE, false, DATA_TYPE_BOOLEAN));
                }
            );
            this.monitorObserver = new YaripObserver(
                [PREF_MONITOR_MODIFIERS, PREF_MONITOR_KEY_CODE],
                function() {
                    var modifiers = yarip.getValue(PREF_MONITOR_MODIFIERS, "accel", DATA_TYPE_STRING);
                    var key = yarip.getValue(PREF_MONITOR_KEY_CODE, "m", DATA_TYPE_STRING);
                    yaripOverlay.updateKey("key_yaripToggleShow", modifiers, key, "cmd_yaripToggleShow");
                }
            );
            this.monitorObserver.observe(null, null, "value"); // trigger once
            this.pagesObserver = new YaripObserver(
                [PREF_PAGES_MODIFIERS, PREF_PAGES_KEY_CODE],
                function() {
                    var modifiers = yarip.getValue(PREF_PAGES_MODIFIERS, "accel shift", DATA_TYPE_STRING);
                    var key = yarip.getValue(PREF_PAGES_KEY_CODE, "m", DATA_TYPE_STRING);
                    yaripOverlay.updateKey("key_yaripManagePages", modifiers, key, "cmd_yaripManagePages");
                }
            );
            this.pagesObserver.observe(null, null, "value"); // trigger once
            this.logWhenClosedObserver = new YaripObserver(
                PREF_LOG_WHEN_CLOSED,
                function() { yaripOverlay.updateLogWhenClosed(); }
            );

            var y = document.getElementById("yarip");
            this.getAppcontent = function() new Function(y.getAttribute("getAppcontent")).call(window);
            this.getBrowser = function() new Function(y.getAttribute("getBrowser")).call(window);
            this.getContextMenuId = function() new Function(y.getAttribute("getContextMenuId")).call(window);
            this.getContextMenu = function() new Function(y.getAttribute("getContextMenu")).call(window);
            this.getTabContainer = function() new Function(y.getAttribute("getTabContainer")).call(window);

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
//            if (this.tabContainer) this.tabContainer.addEventListener("TabSelect", this, false);
            window.removeEventListener("load", this, false);
            break;

        case "unload":
            this.enabledObserver.unregister();
            this.flickerObserver.unregister();
            this.modeObserver.unregister();
//            this.alwaysUseIndexObserver.unregister();
            this.useIndexObserver.unregister();
            this.elementsInContextObserver.unregister();
            this.purgeInnerHTMLObserver.unregister();
            this.exclusiveOnCreationObserver.unregister();
            this.templatesObserver.unregister();
            this.schemesObserver.unregister();
            this.privateObserver.unregister();
            this.recurrenceObserver.unregister();
            this.logWhenClosedObserver.unregister();

            yaripMonitor.unload();

            if (this.appcontent) this.appcontent.removeEventListener("DOMContentLoaded", this, false);
            if (this.contextMenu) this.contextMenu.removeEventListener("popupshowing", this, false);
            if (this.tabContainer) this.tabContainer.removeEventListener("select", this, false);
//            if (this.tabContainer) this.tabContainer.removeEventListener("TabSelect", this, false);
            window.removeEventListener("unload", this, false);
            break;

        case "DOMContentLoaded":
            this.stop();
            yarip.resetUndo();

            var doc = event.originalTarget;
            if (!doc || !doc.body || !doc.defaultView) break;

            var dv = doc.defaultView;
            if (!dv.yarip) {
                dv.yarip = {};
            } else {
                if (doc.DOMContentLoaded) return;
                else doc.DOMContentLoaded = true;
            }
            this.doDOMContentLoaded(doc, this);
            doc.body.addEventListener("DOMNodeInserted", this, false);
//            doc.body.addEventListener("DOMAttrModified", this, false);
            if (yarip.noFlicker) {
                if (!dv.yarip) dv.yarip = {}; // needed!?
                dv.yarip.whitelistTimeout = setTimeout(this.whitelistElement, 100, doc.body);
            } else {
                doc.body.setAttribute("status", "whitelisted");
            }
            break;

        case "DOMNodeInserted":
            if (!yarip.enabled) break;

            var element = event.originalTarget;
            var doc = element.ownerDocument;
            if (!doc || !doc.body || !doc.defaultView) break;

            var dv = doc.defaultView;
            if (dv.yarip && dv.yarip.loadTimeout) break;
            if ("getAttribute" in element && /firebugLayoutBox|firebugHighlight/.test(element.getAttribute("class"))) break;

            // TODO Make numNodeInserted and timeouts customizable!
            var numNodeInserted = 10;
            var count = dv.yarip.count;
            if (!count) dv.yarip.count = count = 1;
            if (yarip.noFlicker) {
                if (count <= 3) {
                    clearTimeout(dv.yarip.whitelistTimeout);
                    this.doDOMContentLoaded(doc, this, true);
                    dv.yarip.whitelistTimeout = setTimeout(this.whitelistElement, 100, doc.body);
                    dv.yarip.count++;
                } else {
                    dv.yarip.loadTimeout = setTimeout(this.doDOMContentLoaded, 100 * count /* max-default: 1 sec */, doc, this, true);
                    if (count < numNodeInserted) dv.yarip.count++;
                }
                if (!dv.yarip.resetTimeout) {
                    dv.yarip.resetTimeout = setTimeout(this.resetCount, 500 * numNodeInserted /* default: 5 sec */, doc);
                }
            } else {
                dv.yarip.loadTimeout = setTimeout(this.doDOMContentLoaded, 100 * numNodeInserted /* default: 1 sec */, doc, this, true);
            }
            break;

//        case "DOMAttrModified":
//            var element = event.originalTarget;
//            if (!/\b(whitelisted|blacklisted|placeholder)\b/.test(element.getAttribute("status"))) break;

//dump("event.originalTarget="+element+"\n");
//dump("event.attrChange="+event.attrChange+"\n");
//            //  MODIFICATION = 1;
//            //  ADDITION = 2;
//            //  REMOVAL = 3;
//            break;

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
            if (event.target.getAttribute("id") != this.contextMenuId) return;

            // YARIP-MENU
            var menu = this.yaripMenupopup.firstChild;
            while (menu && menu.getAttribute("id") != "yarip-undo-menu-sep")
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
            var location = yarip.getLocationFromLocation(doc.location);
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
                var inFrame = gContextMenu.inFrame;
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
                while (menuitem && menuitem.localName != "menuseparator")
                {
                    var next = menuitem.nextSibling;
                    undoMenu.removeChild(menuitem);
                    menuitem = next;
                }
                var found = false;
                for each (var obj in yarip.undoObj)
                {
                    if (!obj || obj.document != doc) continue;

                    var menuitem = document.createElement("menuitem");
                    menuitem.setAttribute("label", this.stringbundle.getFormattedString("undo-" + obj.type, [obj.text]));
                    menuitem.obj = obj;
                    menuitem.setAttribute("oncommand", "yaripOverlay.undo(this.obj);");
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

//        case "TabSelect":
//            var browser = gBrowser.selectedBrowser;
//            yaripMonitor.tabSelect(browser);
//            break;

//        case "keypress":
////            javascript:alert('y'.charCodeAt())
//            if (event.ctrlKey && event.keyCode === 0) {
////            if (event.ctrlKey) {
////                if (event.altKey || event.shiftKey) {
////                    switch (event.charCode) {
////                    case 109: // <Ctrl> + <Alt> + <m> or <Ctrl> + <Shift> + <m>
////                        this.managePages();
////                        event.stopPropagation();
////                        break;
////                    }
////                } else {
//                    switch (event.charCode) {
//                    case 121: // <Ctrl> + <y>
//                        yaripMonitor.toggleShow();
////                        event.stopPropagation();
//                        event.preventDefault();
//                        break;
//                    }
////                }
//            }
//            break;
        }
    }

    this.whitelistElement = function (element)
    {
        if (!element) return;

        if (element && element.getAttribute("status") != "whitelisted") {
            element.setAttribute("status", "whitelisted");
        }
    }

    this.resetCount = function (doc)
    {
        if (doc && doc.defaultView && doc.defaultView.yarip) {
            doc.defaultView.yarip.resetTimeout = null;
            doc.defaultView.yarip.count = null;
        }
    }

    this.doDOMContentLoaded = function(doc, overlay, noIncrement)
    {
        if (!doc) return;

        if (doc.defaultView && doc.defaultView.yarip) doc.defaultView.yarip.loadTimeout = null;

        if (!yarip.enabled) return;
        if (/*!doc ||*/ !doc.body || !doc.location) return;
        if (!/^https?:$/.test(doc.location.protocol)) return;
        if (!/^(text\/html|application\/xhtml\+xml)$/.test(doc.contentType)) return;

        if (overlay.loader.load(doc, !noIncrement)) {
            overlay.setYaripStatus(doc, "found");
            return true;
        } else {
            overlay.setYaripStatus(doc);
            return false;
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

//        if (!isFrame)
//        {
            // WHITELIST ELEMENT
            var weMenuitem = document.createElement("menuitem");
            weMenuitem.node = node;
            weMenuitem.setAttribute("label", this.stringbundle.getString("menuitemElementWhitelist"));
            weMenuitem.setAttribute("oncommand", "yaripOverlay.whitelistElement(this.node.ownerDocument, this.node);");
            weMenuitem.setAttribute("class", "whitelist");
            menupopup.appendChild(weMenuitem);

            // BLACKLIST ELEMENT
            var beMenuitem = document.createElement("menuitem");
            beMenuitem.node = node;
            beMenuitem.setAttribute("label", this.stringbundle.getString("menuitemElementBlacklist"));
            beMenuitem.setAttribute("oncommand", "yaripOverlay.blacklistElement(this.node.ownerDocument, this.node);");
            beMenuitem.setAttribute("class", "blacklist");
            menupopup.appendChild(beMenuitem);
//        }

        // BLACKLIST ATTRIBUTE
        if (node.hasAttributes())
        {
            var found = false;
            var baMenu = document.createElement("menu");
            baMenu.setAttribute("label", this.stringbundle.getString("menuAttributeBlacklist"));
            var baMenupopup = document.createElement("menupopup");
            if (node.hasAttributes()) {
                for (var i = 0; i < node.attributes.length; i++)
                {
                    var attribute = node.attributes[i];
                    if (!attribute || attribute.value === "") continue;

                    switch (attribute.name)
                    {
                        case "status":
                            if (/^(whitelisted|blacklisted)$/.test(attribute.value)) continue;

                        case "style":
                            if (OUTLINE_RE.test(attribute.value)) continue;
                    }

                    var baMenuitem = document.createElement("menuitem");
                    baMenuitem.node = node;
                    baMenuitem.setAttribute("label", attribute.name.toLowerCase());
                    baMenuitem.attribute = attribute;
                    if (isFrame) baMenuitem.setAttribute("oncommand", "yaripOverlay.blacklistElement(this.node.ownerDocument.defaultView.frameElement.ownerDocument, this.attribute);");
                    else baMenuitem.setAttribute("oncommand", "yaripOverlay.blacklistElement(this.node.ownerDocument, this.attribute);");
                    baMenupopup.appendChild(baMenuitem);
                    found = true;
                }
            }

            if (found) {
                baMenu.appendChild(baMenupopup);
                menupopup.appendChild(baMenu);
            }
        }

        // STYLE ELEMENT
        var seMenu = document.createElement("menu");
        seMenu.setAttribute("label", this.stringbundle.getString("menuitemStyleElement"));
        var seMenuitem = document.createElement("menuitem");
        seMenuitem.node = node;
        seMenuitem.setAttribute("label", this.stringbundle.getString("menuitemUserDefined"));
        if (isFrame) seMenuitem.setAttribute("oncommand", "yaripOverlay.styleElement(this.node.ownerDocument.defaultView.frameElement.ownerDocument, this.node);");
        else seMenuitem.setAttribute("oncommand", "yaripOverlay.styleElement(this.node.ownerDocument, this.node);");
        var seMenupopup = document.createElement("menupopup");
        seMenupopup.appendChild(seMenuitem);
        if (node.hasAttributes()) {
            var seMenuseparator = document.createElement("menuseparator");
            seMenupopup.insertBefore(seMenuseparator, seMenuitem);
            for (var i = 0; i < node.attributes.length; i++)
            {
                var attribute = node.attributes[i];
                if (!attribute || attribute.value === "") continue;

                switch (attribute.name) {
                    case "status": if (/^(whitelisted|blacklisted)$/.test(attribute.value)) continue;
                    case "style": if (OUTLINE_RE.test(attribute.value)) continue;
                }

                var seMenuitem = document.createElement("menuitem");
                seMenuitem.node = node;
                seMenuitem.setAttribute("label", attribute.name.toLowerCase());
                seMenuitem.attribute = attribute;
                if (isFrame) seMenuitem.setAttribute("oncommand", "yaripOverlay.styleElement(this.node.ownerDocument.defaultView.frameElement.ownerDocument, this.node, '" + attribute.name.toLowerCase() + "');");
                else seMenuitem.setAttribute("oncommand", "yaripOverlay.styleElement(this.node.ownerDocument, this.node, '" + attribute.name.toLowerCase() + "');");
                seMenupopup.insertBefore(seMenuitem, seMenuseparator);
            }
        }
        seMenu.appendChild(seMenupopup);
        menupopup.appendChild(seMenu);

        // SCRIPT ELEMENT
        var sceMenuitem = document.createElement("menuitem");
        sceMenuitem.node = node;
        sceMenuitem.setAttribute("label", this.stringbundle.getString("menuitemScriptElement"));
        sceMenuitem.setAttribute("oncommand", "yaripOverlay.scriptElement(this.node.ownerDocument, this.node);");
//        sceMenuitem.setAttribute("class", "script");
        menupopup.appendChild(sceMenuitem);

//        if (!isFrame)
//        {
            // TEMPORARILY WHITELIST
            var wtMenuitem = document.createElement("menuitem");
            wtMenuitem.node = node;
            wtMenuitem.setAttribute("label", this.stringbundle.getString("menuitemKeepTemporarily"));
            wtMenuitem.setAttribute("oncommand", "yaripOverlay.whitelistTemporarily(this.node.ownerDocument, this.node);");
            wtMenuitem.setAttribute("class", "whitelist temporary");
            menupopup.appendChild(wtMenuitem);

            // TEMPORARILY BLACKLIST
            var rtMenuitem = document.createElement("menuitem");
            rtMenuitem.node = node;
            rtMenuitem.setAttribute("label", this.stringbundle.getString("menuitemRemoveTemporarily"));
            rtMenuitem.setAttribute("oncommand", "yaripOverlay.removeTemporarily(this.node.ownerDocument, this.node);");
            rtMenuitem.setAttribute("class", "blacklist temporary");
            menupopup.appendChild(rtMenuitem);
//        }

        // COPY XPATH
        var cxMenuitem = document.createElement("menuitem");
        cxMenuitem.node = node;
        cxMenuitem.setAttribute("label", this.stringbundle.getString("menuitemCopyXPath"));
        cxMenuitem.setAttribute("oncommand", "yaripOverlay.copyXPath(this.node);");
        cxMenuitem.setAttribute("class", "copyXPath");
        menupopup.appendChild(cxMenuitem);

        menu.appendChild(menupopup);
        return menu;
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
        this.statusTimeout = setTimeout(this.hideStatus, 100);
    }

    this.setYaripStatus = function(doc, status)
    {
        if (!doc) return;

        if (yarip.enabled)
        {
            if (!status)
            {
                status = doc.defaultView && doc.defaultView.yaripStatus ? doc.defaultView.yaripStatus : null;
                switch (status)
                {
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

        if (doc.defaultView) {
            doc.defaultView.yaripStatus = status;
        }

        if (doc === this.gBrowser.contentWindow.document)
        {
            var toolbarbutton = document.getElementById("yarip-toolbarbutton");
            if (toolbarbutton) {
                document.getElementById("yarip-toolbarbutton").setAttribute("status", status);
                document.getElementById("yarip-toolbarbutton").setAttribute("tooltiptext", this.stringbundle.getString("status-" + status));
            }
        }
    }
}
