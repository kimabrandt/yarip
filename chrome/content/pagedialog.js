
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

Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/uri.jsm");

function YaripPageDialog() {
    this.sb = null;
    this.treePages = null;
    this.view = null;
    this.dialogheaderPage = null;
    this.tabbox = null;
    this.elementTabbox = null;
    this.contentTabbox = null;
    this.pageTabbox = null;
    this.editMenupopup = null;
    this.filterString = null;

    this.tab = null;
    this.tabs = null;

    this.page = null;
    this.tmpPage = null;
    this.doReload = true;

    this.updateTab = function() {
        if (!this.tabbox) return;

        switch (this.tabbox.selectedIndex) {
            case INDEX_TABBOX_ELEMENT:
                switch (this.elementTabbox.selectedIndex) {
                    case INDEX_ELEMENT_WHITELIST: this.tab = "elementWhitelist"; break;
                    case INDEX_ELEMENT_BLACKLIST: this.tab = "elementBlacklist"; break;
                    case INDEX_ELEMENT_ATTRIBUTE: this.tab = "elementAttributeList"; break;
                    case INDEX_ELEMENT_SCRIPT: this.tab = "elementScriptList"; break;
                }
                break;
            case INDEX_TABBOX_CONTENT:
                switch (this.contentTabbox.selectedIndex) {
                    case INDEX_CONTENT_WHITELIST: this.tab = "contentWhitelist"; break;
                    case INDEX_CONTENT_BLACKLIST: this.tab = "contentBlacklist"; break;
                    case INDEX_CONTENT_HEADER:
                        switch (this.contentHeaderTabbox.selectedIndex) {
                            case INDEX_HEADER_REQUEST: this.tab = "contentRequestHeaderList"; break;
                            case INDEX_HEADER_RESPONSE: this.tab = "contentResponseHeaderList"; break;
                        }
                        break;
                    case INDEX_CONTENT_REDIRECT: this.tab = "contentRedirectList"; break;
                    case INDEX_CONTENT_STREAM: this.tab = "contentStreamList"; break;
                }
                break;
            case INDEX_TABBOX_PAGE:
                switch (this.pageTabbox.selectedIndex) {
                    case INDEX_PAGE_STYLE: this.tab = "pageStyleList"; break;
                    case INDEX_PAGE_SCRIPT: this.tab = "pageScriptList"; break;
                    case INDEX_PAGE_HEADER:
                        switch (this.pageHeaderTabbox.selectedIndex) {
                            case INDEX_HEADER_REQUEST: this.tab = "pageRequestHeaderList"; break;
                            case INDEX_HEADER_RESPONSE: this.tab = "pageResponseHeaderList"; break;
                        }
                        break;
                    case INDEX_PAGE_REDIRECT: this.tab = "pageRedirectList"; break;
                    case INDEX_PAGE_STREAM: this.tab = "pageStreamList"; break;
                    case INDEX_PAGE_EXTENSION: this.tab = "pageExtensionList"; break;
                    case INDEX_PAGE_EXTENDED_BY: this.tab = "pageExtendedByList"; break;
                }
                break;
        }
    }

    this.getPageByIndex = function(index) {
        index = index >= 0 ? index : this.treePages.currentIndex;
        if (index < 0) return null;

        return this.view.getPageByIndex(index);
    }

    this.getPageByName = function(pageName) {
        if (!pageName) return null;

        return yarip.map.get(pageName);
    }

    this.setValue = function(value) {
        if (this.treePages.currentIndex < 0) return;

        switch (this.tab) {
            case "elementScriptList":
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
            case "contentStreamList":
            case "pageRequestHeaderList":
            case "pageResponseHeaderList":
            case "pageScriptList":
            case "contentRedirectList":
            case "pageRedirectList":
            case "pageStreamList":
                this.tabs[this.tab].item.setScript(value);
                this.tabs[this.tab].list.set(this.tabs[this.tab].tree.currentIndex, 99, value);
                break;
            case "pageStyleList":
                this.tabs[this.tab].item.setStyle(value);
                this.tabs[this.tab].list.set(this.tabs[this.tab].tree.currentIndex, 99, value);
                break;
            case "pageExtensionList":
                this.tabs[this.tab].item.setId(value);
                break;
        }
    }

    this.doCut = function() {
        if (this.treePages.currentIndex < 0) return;

        switch (this.tab) {
            case "elementWhitelist":
            case "elementBlacklist":
            case "elementAttributeList":
            case "elementScriptList":
            case "contentWhitelist":
            case "contentBlacklist":
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
            case "contentStreamList":
            case "pageStyleList":
            case "pageScriptList":
            case "pageRequestHeaderList":
            case "pageResponseHeaderList":
            case "pageRedirectList":
            case "pageStreamList":
            case "pageExtensionList":
                var fromList = this.tabs[this.tab].list;
                this.tmpPage = new YaripPage();
                var toList = this.tmpPage[this.tab];
                var selection = this.tabs[this.tab].tree.view.selection;
                var rangeCount = selection.getRangeCount();
                var keys = {};
                var purge = this.tab !== "pageExtensionList" ? true : undefined;
                for (var i = 0; i < rangeCount; i++) {
                    var start = {};
                    var end = {};
                    selection.getRangeAt(i, start, end);
                    for (var j = start.value; j <= end.value; j++) {
                        var key = fromList.get(j, LIST_INDEX_KEY);
                        keys[key] = true;
                        toList.add(fromList.getByKey(key).clone(purge));
                    }
                }
                if (this.tab !== "pageExtensionList") {
                    for (var key in keys) fromList.removeByKey(key);
                } else {
//                    var page = this.getPageByIndex();
                    for (var key in keys) {
                        var item = this.page.pageExtensionList.getByKey(key);
                        yarip.map.removeExtension(this.page, item);
                    }
                }
                this.refreshTab(this.tab, true);
                break;
            default:
                return;
        }
    }

    this.doCopy = function() {
        if (this.treePages.currentIndex < 0) return;

        switch (this.tab) {
            case "elementWhitelist":
            case "elementBlacklist":
            case "elementAttributeList":
            case "elementScriptList":
            case "contentWhitelist":
            case "contentBlacklist":
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
            case "contentStreamList":
            case "pageStyleList":
            case "pageScriptList":
            case "pageRequestHeaderList":
            case "pageResponseHeaderList":
            case "pageRedirectList":
            case "pageStreamList":
            case "pageExtensionList":
                var fromList = this.tabs[this.tab].list;
                this.tmpPage = new YaripPage();
                var toList = this.tmpPage[this.tab];
                var selection = this.tabs[this.tab].tree.view.selection;
                var rangeCount = selection.getRangeCount();
                var purge = this.tab !== "pageExtensionList" ? true : undefined;
                for (var i = 0; i < rangeCount; i++) {
                    var start = {};
                    var end = {};
                    selection.getRangeAt(i, start, end);
                    for (var j = start.value; j <= end.value; j++) {
                        var key = fromList.get(j, LIST_INDEX_KEY);
                        toList.add(fromList.getByKey(key).clone(purge));
                    }
                }
            default:
                return;
        }
    }

    this.doPaste = function() {
        if (!this.page) return;
        if (!this.tmpPage) return;

//        var page = this.getPageByIndex();
//        if (!page) return;

        var list = this.tmpPage.pageExtensionList;
        for each (var item in list.obj) {
            yarip.map.addExtension(this.page, item);
        }

        this.page.merge(this.tmpPage, true);
        this.refreshTab(null, true);
        if (this.page.setTemporary(false)) this.refreshExtMenulist(true);
//        this.selectTab(this.page);
//        this.selectTab(this.page, type, key); // TODO Pass the type and key!
    }

    this.gotoPage = function(event) {
        var currentIndex = this.tabs[this.tab].tree.currentIndex;
        if (currentIndex < 0) return;

        var oldTab = this.tab;
        var toPageName = this.tabs[this.tab].list.get(currentIndex, 0);

        switch (oldTab) {
            case "pageExtensionList":
                var key = this.getPageByName(toPageName).pageExtendedByList.getById(this.getPageByIndex().getId()).getKey();
                this.reloadPage(toPageName, false, true, true, true, TYPE_PAGE_EXTENDED_BY, key);
                break;
            case "pageExtendedByList":
                var key = this.getPageByName(toPageName).pageExtensionList.getById(this.getPageByIndex().getId()).getKey();
                this.reloadPage(toPageName, false, true, true, true, TYPE_PAGE_EXTENSION, key);
                break;
        }
    }

    this.doSelectAll = function() {
        if (this.treePages.currentIndex < 0) return;

        this.tabs[this.tab].tree.focus();
        this.tabs[this.tab].tree.view.selection.selectAll();
    }

    this.add = function() {
//        var page = this.getPageByIndex();
        if (!this.page) return;

        var obj = null;

        switch (this.tab) {
            case "elementWhitelist":
                obj = {
                    item: new YaripElementWhitelistItem("//div[@class='useful']/descendant-or-self::*"),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/whitelistelementdialog.xul", "whitelistelementdialog", "chrome,modal,resizable", null, obj);
                if (!obj.item) return;

                this.page.elementWhitelist.add(obj.item);
                break;

            case "elementBlacklist":
                obj = {
                    item: new YaripElementBlacklistItem("//iframe"),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/blacklistelementdialog.xul", "blacklistelementdialog", "chrome,modal,resizable", null, obj);
                if (!obj.item) return;

                this.page.elementBlacklist.add(obj.item);
                break;

            // TODO Create a better example, since this can be done with styles!
            case "elementAttributeList":
                obj = {
                    item: new YaripElementAttributeItem("//div[@class='narrow']", "style", "width: auto;"),
                    attrName: "style",
                    attrValue: "width: auto;",
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/styledialog.xul", "styledialog", "chrome,modal,resizable", null, obj);
                if (!obj.item || !obj.attrName) return;

                obj.item.setName(obj.attrName);
                obj.item.setValue(obj.attrValue);
                this.page.elementAttributeList.add(obj.item);
                break;

            case "elementScriptList":
                obj = {
                    item: new YaripScriptItem("//input[translate(@autocomplete,'FO','fo')='off']",
                            "function (array) {\n" +
                            "    for (var i = 0; i < array.length; i++) {\n" +
                            "        var element = array[i];\n" +
                            "        element.setAttribute(\"autocomplete\", \"on\");\n" +
                            "        console.debug(\"Found element:\", element);\n" +
                            "    }\n" +
                            "}"),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/scriptdialog.xul", "scriptdialog", "chrome,modal,resizable", null, obj);
                if (!obj.item) return;

                this.page.elementScriptList.add(obj.item);
                break;

            case "contentWhitelist":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripContentWhitelistItem(re),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/whitelistcontentdialog.xul", "whitelistcontentdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.contentWhitelist.add(obj.item);
                break;

            case "contentBlacklist":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripContentBlacklistItem(re),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/blacklistcontentdialog.xul", "blacklistcontentdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.contentBlacklist.add(obj.item);
                break;

            case "contentRequestHeaderList":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripHeaderItem(re, null, "Cookie",
                            "function (value) {\n" +
                            "    return \"\";\n" +
                            "}", false),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.contentRequestHeaderList.add(obj.item);
                break;

            case "contentResponseHeaderList":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripHeaderItem(re, null, "Set-Cookie",
                            "function (value) {\n" +
                            "    return \"\";\n" +
                            "}", false),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.contentResponseHeaderList.add(obj.item);
                break;

            case "contentRedirectList":
                var reObj = yarip.getPageRegExpObj(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripRedirectItem(reObj.regExp, null, reObj.script),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/redirectdialog.xul", "redirectdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.contentRedirectList.add(obj.item);
                break;

            case "contentStreamList":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    // TODO Change the example!
                    item: new YaripStreamItem(re, null, "<script\\b[^>]*>(.|\\s)*?</script>", null,
                            "function (match, p1, offset, string) {\n" +
                            "    return \"\";\n" +
                            "}"),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/replacedialog.xul", "replacedialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.contentStreamList.add(obj.item);
                break;

            case "pageStyleList":
                obj = {
                    item: new YaripStyleItem("/html/head",
                            "a:visited,\n" +
                            "a:visited span {\n" +
                            "    color: -moz-visitedhyperlinktext !important;\n" +
                            "}\n" +
                            "\n" +
                            "a:link img {\n" +
                            "    outline: 4px solid -moz-nativehyperlinktext !important;\n" +
                            "}\n" +
                            "\n" +
                            "a:visited img {\n" +
                            "    outline-color: -moz-visitedhyperlinktext !important;\n" +
                            "}"),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/pagestyledialog.xul", "pagestyledialog", "chrome,modal,resizable", null, obj);
                if (!obj.item) return;

                this.page.pageStyleList.add(obj.item);
                break;

            case "pageScriptList":
                obj = {
                    item: new YaripPageScriptItem("/html/body", "console.log(\"Insert script!\");"),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/scriptdialog.xul", "scriptdialog", "chrome,modal,resizable", null, obj);
                if (!obj.item) return;

                this.page.pageScriptList.add(obj.item);
                break;

            case "pageRequestHeaderList":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripHeaderItem(re, null, "Cookie",
                            "function (value) {\n" +
                            "    return \"\";\n" +
                            "}", false),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.pageRequestHeaderList.add(obj.item);
                break;

            case "pageResponseHeaderList":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripHeaderItem(re, null, "Set-Cookie",
                            "function (value) {\n" +
                            "    return \"\";\n" +
                            "}", false),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.pageResponseHeaderList.add(obj.item);
                break;

            case "pageRedirectList":
                var reObj = yarip.getPageRegExpObj(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripRedirectItem(reObj.regExp, null, reObj.script),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/redirectdialog.xul", "redirectdialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.pageRedirectList.add(obj.item);
                break;

            case "pageStreamList":
                var re = yarip.getPageRegExp(this.page.getName(), null, true /* byUser */);
                obj = {
                    item: new YaripStreamItem(re, null, "<script\\b[^>]*>(.|\\s)*?</script>", null,
                            "function (match, p1, offset, string) {\n" +
                            "    return \"\";\n" +
                            "}"),
                    pageName: this.page.getName()
                }
                window.openDialog("chrome://yarip/content/replacedialog.xul", "replacedialog", "chrome,modal,resizable", obj);
                if (!obj.item) return;

                this.page.pageStreamList.add(obj.item);
                break;
        }

        var key = obj && obj.item ? obj.item.getKey() : null;
        this.refreshTab(this.tab, true, null, key);
        if (this.page.setTemporary(false)) this.refreshExtMenulist(true);
    }

    this.remove = function() {
        var tab = this.tabs[this.tab];
        if (tab.tree.currentIndex < 0) return;

        switch (this.tab) {
            case "elementWhitelist":
            case "elementBlacklist":
            case "elementAttributeList":
            case "elementScriptList":
            case "contentWhitelist":
            case "contentBlacklist":
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
            case "contentStreamList":
            case "pageStyleList":
            case "pageScriptList":
            case "pageRequestHeaderList":
            case "pageResponseHeaderList":
            case "pageRedirectList":
            case "pageStreamList":
                var keys = {};
                var selection = tab.tree.view.selection;
                var rangeCount = selection.getRangeCount();
                for (var i = 0; i < rangeCount; i++) {
                    var start = {};
                    var end = {};
                    selection.getRangeAt(i, start, end);
                    for (var j = start.value; j <= end.value; j++) keys[tab.list.get(j, LIST_INDEX_KEY)] = true;
                }
                for (var key in keys) tab.list.removeByKey(key);
                this.refreshTab(this.tab, true);
                break;
            case "pageExtensionList":
//            case "pageExtendedByList":
                var keys = {};
                var selection = tab.tree.view.selection;
                var rangeCount = selection.getRangeCount();
                for (var i = 0; i < rangeCount; i++) {
                    var start = {};
                    var end = {};
                    selection.getRangeAt(i, start, end);
                    for (var j = start.value; j <= end.value; j++) keys[tab.list.get(j, LIST_INDEX_KEY)] = true;
                }
//                var page = this.getPageByIndex();
                for (var key in keys) {
                    var item = this.page.pageExtensionList.getByKey(key);
                    yarip.map.removeExtension(this.page, item);
                }
                this.refreshTab(this.tab, true);
                break;
        }
    }

    this.removeAll = function() {
        if (this.treePages.currentIndex < 0) return;

        var tab = this.tabs[this.tab];
        if (!tab.list || tab.list.isEmpty()) return;

        switch (this.tab) {
            case "pageExtensionList":
//            case "pageExtendedByList":
//                var page = this.getPageByIndex();
                var list = this.page.pageExtensionList;
                for each (var item in list.obj) {
                    yarip.map.removeExtension(this.page, item);
                }
                break;
            default:
                tab.list.reset();
                break;
        }

        this.refreshTab(this.tab, true);
//        this.refreshExtMenulist();
    }

    this.toggleExclusive = function() {
//        if (this.treePages.currentIndex < 0) return;
//        var page = this.getPageByIndex();
        if (!this.page) return;

        switch (this.tab) {
            case "elementWhitelist":
            case "contentWhitelist":
                this.tabs[this.tab].list.setExclusive(this.tabs[this.tab].exclusiveMenulist.checked);
                if (this.page.setTemporary(false)) this.refreshExtMenulist(true);
                break;
        }
    }

    this.toggleAllowScript = function() {
//        var page = this.getPageByIndex();
        if (!this.page) return;

        this.page.setAllowScript(this.allowScript.checked);
        this.page.setTemporary(false);
        this.refreshTab("elementScriptList");
        this.refreshTab("pageScriptList");
    }

    this.addExtPage = function() {
//        var page = this.getPageByIndex();
        if (!this.page) return;

        var item = this.tabs[this.tab].item;
        if (!item) return;

        var id = item.getId();
        if (id && id !== this.page.getId()) {
            var item = yarip.createPageExtensionItem(yarip.map.getById(id));
            yarip.map.addExtension(this.page, item);
            this.refreshTab(this.tab, true, null, item.getKey());
            if (this.page.setTemporary(false)) this.refreshExtMenulist(true);
        }
    }

    this.copyPage = function() {
//        var page = this.getPageByIndex();
        if (!this.page) return;

        this.renamePage(this.page);
    }

    this.checkPageName = function(pageName) {
        if (!pageName) return false;

        if (yarip.checkPageName(pageName)) {
            return true;
        } else {
            alert(this.sb.getString("ERR_INVALID_PAGE_NAME"));
            return false;
        }
    }

    this.selectTab = function(page, type, key) {
        if (!page) return;

        var selectedIndex = 0;

        // page tabbox
        if (page.pageStyleList.isEmpty()) {
            if (page.pageScriptList.isEmpty()) {
                if (page.pageRequestHeaderList.isEmpty() && page.pageResponseHeaderList.isEmpty()) {
                    if (page.pageRedirectList.isEmpty()) {
                        if (page.pageStreamList.isEmpty()) {
                            if (page.pageExtensionList.isEmpty()) {
                                if (page.pageExtendedByList.isEmpty()) {
                                    this.pageTabbox.selectedIndex = INDEX_PAGE_STYLE;
                                } else {
                                    this.pageTabbox.selectedIndex = INDEX_PAGE_EXTENDED_BY;
                                    selectedIndex = INDEX_TABBOX_PAGE;
                                }
                            } else {
                                this.pageTabbox.selectedIndex = INDEX_PAGE_EXTENSION;
                                selectedIndex = INDEX_TABBOX_PAGE;
                            }
                        } else {
                            this.pageTabbox.selectedIndex = INDEX_PAGE_STREAM;
                            selectedIndex = INDEX_TABBOX_PAGE;
                        }
                    } else {
                        this.pageTabbox.selectedIndex = INDEX_PAGE_REDIRECT;
                        selectedIndex = INDEX_TABBOX_PAGE;
                    }
                } else {
                    this.pageTabbox.selectedIndex = INDEX_PAGE_HEADER;
                    selectedIndex = INDEX_TABBOX_PAGE;
                }
            } else {
                this.pageTabbox.selectedIndex = INDEX_PAGE_SCRIPT;
                selectedIndex = INDEX_TABBOX_PAGE;
            }
        } else {
            this.pageTabbox.selectedIndex = INDEX_PAGE_STYLE;
            selectedIndex = INDEX_TABBOX_PAGE;
        }

        // content tabbox
        if (page.contentWhitelist.isEmpty()) {
            if (page.contentBlacklist.isEmpty()) {
                if (page.contentRequestHeaderList.isEmpty() && page.contentResponseHeaderList.isEmpty()) {
                    if (page.contentRedirectList.isEmpty()) {
                        if (page.contentStreamList.isEmpty()) {
                            this.contentTabbox.selectedIndex = INDEX_CONTENT_WHITELIST;
                        } else {
                            this.contentTabbox.selectedIndex = INDEX_CONTENT_STREAM;
                            selectedIndex = INDEX_TABBOX_CONTENT;
                        }
                    } else {
                        this.contentTabbox.selectedIndex = INDEX_CONTENT_REDIRECT;
                        selectedIndex = INDEX_TABBOX_CONTENT;
                    }
                } else {
                    this.contentTabbox.selectedIndex = INDEX_CONTENT_HEADER;
                    selectedIndex = INDEX_TABBOX_CONTENT;
                }
            } else {
                this.contentTabbox.selectedIndex = INDEX_CONTENT_BLACKLIST;
                selectedIndex = INDEX_TABBOX_CONTENT;
            }
        } else {
            this.contentTabbox.selectedIndex = INDEX_CONTENT_WHITELIST;
            selectedIndex = INDEX_TABBOX_CONTENT;
        }

        // element tabbox
        if (page.elementWhitelist.isEmpty()) {
            if (page.elementBlacklist.isEmpty()) {
                if (page.elementAttributeList.isEmpty()) {
                    if (page.elementScriptList.isEmpty()) {
                        this.elementTabbox.selectedIndex = INDEX_ELEMENT_WHITELIST;
                    } else {
                        this.elementTabbox.selectedIndex = INDEX_ELEMENT_SCRIPT;
                        selectedIndex = INDEX_TABBOX_ELEMENT;
                    }
                } else {
                    this.elementTabbox.selectedIndex = INDEX_ELEMENT_ATTRIBUTE;
                    selectedIndex = INDEX_TABBOX_ELEMENT;
                }
            } else {
                this.elementTabbox.selectedIndex = INDEX_ELEMENT_BLACKLIST;
                selectedIndex = INDEX_TABBOX_ELEMENT;
            }
        } else {
            this.elementTabbox.selectedIndex = INDEX_ELEMENT_WHITELIST;
            selectedIndex = INDEX_TABBOX_ELEMENT;
        }

        this.contentHeaderTabbox.selectedIndex = 0;
        this.pageHeaderTabbox.selectedIndex = 0;

        if (typeof type !== "number") {
            this.tabbox.selectedIndex = selectedIndex;
            return;
        }

        var tab = null;

        switch (type) {
            case TYPE_CONTENT_WHITELIST:
                tab = "contentWhitelist";
                this.contentTabbox.selectedIndex = INDEX_CONTENT_WHITELIST;
                selectedIndex = INDEX_TABBOX_CONTENT;
                if (!key) {
                    var tree = this.tabs[tab].tree;
                    tree.view.selection.clearSelection();
                    document.getElementById("contentWhitelist-exclusive").focus();
                }
                break;
            case TYPE_CONTENT_BLACKLIST:
                tab = "contentBlacklist";
                this.contentTabbox.selectedIndex = INDEX_CONTENT_BLACKLIST;
                selectedIndex = INDEX_TABBOX_CONTENT;
                break;
            case TYPE_CONTENT_REDIRECT:
                tab = "contentRedirectList";
                this.contentTabbox.selectedIndex = INDEX_CONTENT_REDIRECT;
                selectedIndex = INDEX_TABBOX_CONTENT;
                break;
            case TYPE_PAGE_REDIRECT:
                tab = "pageRedirectList";
                this.pageTabbox.selectedIndex = INDEX_PAGE_REDIRECT;
                selectedIndex = INDEX_TABBOX_PAGE;
                break;
            case TYPE_PAGE_EXTENSION:
                tab = "pageExtensionList";
                this.pageTabbox.selectedIndex = INDEX_PAGE_EXTENSION;
                selectedIndex = INDEX_TABBOX_PAGE;
                break;
            case TYPE_PAGE_EXTENDED_BY:
                tab = "pageExtendedByList";
                this.pageTabbox.selectedIndex = INDEX_PAGE_EXTENDED_BY;
                selectedIndex = INDEX_TABBOX_PAGE;
                break;
        }

        this.tabbox.selectedIndex = selectedIndex;

        if (tab && key) {
            var list = this.tabs[tab].list;
            for (var i = 0; i < list.length; i++) {
                if (key === list.get(i, LIST_INDEX_KEY)) {
                    var tree = this.tabs[tab].tree;
                    tree.currentIndex = i;
                    tree.view.selection.select(i);
                    tree.boxObject.ensureRowIsVisible(i);
                    tree.focus();
                    break;
                }
            }
        }
    }

    this.selectPageByIndex = function(index) {
        var rowCount = this.view.getRowCount();
        if (index >= rowCount) return null;

        if (index < 0) {
            this.treePages.currentIndex = -1;
            this.view.selection.select(-1);
            this.view.treebox.ensureRowIsVisible(0);
        } else {
            this.treePages.currentIndex = index;
            this.view.selection.select(index);
            this.view.treebox.ensureRowIsVisible(index);
        }

        return this.view.getPageByIndex(this.treePages.currentIndex);
    }

    this.selectPageByName = function(pageName, noResetFilter) {
        if (noResetFilter) {
            this.filterPages();
        } else {
            this.resetFilter();
        }

        this.treePages.currentIndex = -1;
        this.view.selection.select(-1);
        if (!pageName) {
            this.view.treebox.ensureRowIsVisible(0);
        } else {
            for (var i = 0; i < this.view.getRowCount(); i++) {
                var page = this.view.getPageByIndex(i);
                if (page.getName() === pageName) {
                    this.treePages.currentIndex = i;
                    this.view.selection.select(i);
                    this.view.treebox.ensureRowIsVisible(i);
                    return page;
                }
            }
        }

        return null;
    }

    this.renamePage = function(page) {
        var oldName = null;
        if (!page) {
            page = this.getPageByIndex();
            if (!page) return false;

            oldName = page.getName();
        }
        var pageName = prompt(this.sb.getString("enterNameOfPage"), page.getName());
        if (!this.checkPageName(pageName)) return false;
        if (oldName) {
            yarip.map.remove(page, true /* notExtension */);
            page.setName(pageName, true);
        } else {
            page = page.clone(true, pageName);
        }
        yarip.map.add(page);

        this.refreshPages(true);
        this.selectPageByName(pageName);
        if (page.setTemporary(false)) this.refreshExtMenulist(true);
        return true;
    }

    this.removePages = function() {
        var currentIndex = this.treePages.currentIndex;
        if (currentIndex < 0) return;

        var index = currentIndex;
        var pageNames = {};
        var selection = this.view.selection;
        var rangeCount = selection.getRangeCount();
        for (var i = 0; i < rangeCount; i++) {
            var start = {};
            var end = {};
            selection.getRangeAt(i, start, end);
            for (var j = start.value; j <= end.value; j++) {
                yarip.map.removeByName(this.getPageByIndex(j).getName());
            }
        }

        this.refreshPages(true);
    }

    this.refreshPages = function(load, dontSelect) {
        if (load) {
            if (!this.view) {
                this.view = new YaripPageTreeView();
                this.treePages.view = this.view;
            } else {
                this.view.purge();
            }
            this.view.applyFilterString(this.filterString, -1);
        }
        var page = null;
        var currentIndex = this.treePages.currentIndex;
        if (load || currentIndex < 0) {
            if (currentIndex >= 0) {
                page = this.view.getPageByIndex(currentIndex);
            } else {
                currentIndex = 0;
                page = this.view.getPageByIndex(currentIndex);
                if (!page) page = new YaripPage("0"); // empty page
            }
        } else {
            page = this.view.getPageByIndex(currentIndex);
        }
        if (!dontSelect) this.selectPageByIndex(currentIndex);

        this.dialogheaderPage.setAttribute("title", page.getName());
        this.page = page;
        this.tabs["elementWhitelist"].list = page.elementWhitelist;
        this.tabs["elementBlacklist"].list = page.elementBlacklist;
        this.tabs["elementAttributeList"].list = page.elementAttributeList;
        this.tabs["elementScriptList"].list = page.elementScriptList;
        this.tabs["contentWhitelist"].list = page.contentWhitelist;
        this.tabs["contentBlacklist"].list = page.contentBlacklist;
        this.tabs["contentRequestHeaderList"].list = page.contentRequestHeaderList;
        this.tabs["contentResponseHeaderList"].list = page.contentResponseHeaderList;
        this.tabs["contentRedirectList"].list = page.contentRedirectList;
        this.tabs["contentStreamList"].list = page.contentStreamList;
        this.tabs["pageStyleList"].list = page.pageStyleList;
        this.tabs["pageScriptList"].list = page.pageScriptList;
        this.tabs["pageRequestHeaderList"].list = page.pageRequestHeaderList;
        this.tabs["pageResponseHeaderList"].list = page.pageResponseHeaderList;
        this.tabs["pageRedirectList"].list = page.pageRedirectList;
        this.tabs["pageStreamList"].list = page.pageStreamList;
        this.tabs["pageExtensionList"].list = page.pageExtensionList;
        this.tabs["pageExtendedByList"].list = page.pageExtendedByList;
        this.tabs["elementWhitelist"].tab.setAttribute("label", this.sb.getFormattedString("whitelist-tab", [this.tabs["elementWhitelist"].list.length]));
        this.tabs["elementBlacklist"].tab.setAttribute("label", this.sb.getFormattedString("blacklist-tab", [this.tabs["elementBlacklist"].list.length]));
        this.tabs["elementAttributeList"].tab.setAttribute("label", this.sb.getFormattedString("elementAttributeList-tab", [this.tabs["elementAttributeList"].list.length]));
        this.tabs["elementScriptList"].tab.setAttribute("label", this.sb.getFormattedString("elementScriptList-tab", [this.tabs["elementScriptList"].list.length]));
        this.tabs["contentWhitelist"].tab.setAttribute("label", this.sb.getFormattedString("whitelist-tab", [this.tabs["contentWhitelist"].list.length]));
        this.tabs["contentBlacklist"].tab.setAttribute("label", this.sb.getFormattedString("blacklist-tab", [this.tabs["contentBlacklist"].list.length]));
        this.tabs["contentHeader"].tab.setAttribute("label", this.sb.getFormattedString("header-tab", [this.tabs["contentRequestHeaderList"].list.length + this.tabs["contentResponseHeaderList"].list.length]));
        this.tabs["contentRequestHeaderList"].tab.setAttribute("label", this.sb.getFormattedString("request-tab", [this.tabs["contentRequestHeaderList"].list.length]));
        this.tabs["contentResponseHeaderList"].tab.setAttribute("label", this.sb.getFormattedString("response-tab", [this.tabs["contentResponseHeaderList"].list.length]));
        this.tabs["contentRedirectList"].tab.setAttribute("label", this.sb.getFormattedString("redirect-tab", [this.tabs["contentRedirectList"].list.length]));
        this.tabs["contentStreamList"].tab.setAttribute("label", this.sb.getFormattedString("stream-tab", [this.tabs["contentStreamList"].list.length]));
        this.tabs["pageStyleList"].tab.setAttribute("label", this.sb.getFormattedString("pageStyleList-tab", [this.tabs["pageStyleList"].list.length]));
        this.tabs["pageScriptList"].tab.setAttribute("label", this.sb.getFormattedString("pageScriptList-tab", [this.tabs["pageScriptList"].list.length]));
        this.tabs["pageHeader"].tab.setAttribute("label", this.sb.getFormattedString("header-tab", [this.tabs["pageRequestHeaderList"].list.length + this.tabs["pageResponseHeaderList"].list.length]));
        this.tabs["pageRequestHeaderList"].tab.setAttribute("label", this.sb.getFormattedString("request-tab", [this.tabs["pageRequestHeaderList"].list.length]));
        this.tabs["pageResponseHeaderList"].tab.setAttribute("label", this.sb.getFormattedString("response-tab", [this.tabs["pageResponseHeaderList"].list.length]));
        this.tabs["pageRedirectList"].tab.setAttribute("label", this.sb.getFormattedString("redirect-tab", [this.tabs["pageRedirectList"].list.length]));
        this.tabs["pageStreamList"].tab.setAttribute("label", this.sb.getFormattedString("stream-tab", [this.tabs["pageStreamList"].list.length]));
        this.tabs["pageExtensionList"].tab.setAttribute("label", this.sb.getFormattedString("pageExtensionList-tab", [this.tabs["pageExtensionList"].list.length]));
        this.tabs["pageExtendedByList"].tab.setAttribute("label", this.sb.getFormattedString("pageExtendedByList-tab", [this.tabs["pageExtendedByList"].list.length]));

        if (load) {
            this.tabs["pageExtensionList"].item = new YaripExtensionItem();
        }

        this.allowScript.checked = page.getAllowScript();

        this.refreshTab(null, true);
        this.refreshExtMenulist(load);
    }

    this.importFiles = function() {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(window, this.sb.getString("importPages"), nsIFilePicker.modeOpenMultiple);
        fp.appendFilters(nsIFilePicker.filterXML);
        var res = fp.show();
        if (res !== nsIFilePicker.returnOK) return;
        var files = fp.files;
        var pageName = null;
        var pName = null;
        while (files.hasMoreElements()) {
            pName = yarip.load(files.getNext(), true);
            if (pName) pageName = pName;
        }
        this.refreshPages(true);
        if (pageName) {
            var page = this.selectPageByName(pageName);
            this.selectTab(page);
        }
    }

    this.getDateString = function() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1
        var day = now.getDate();
        return year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
    }

    this.exportPages = function() {
        if (this.treePages.currentIndex < 0) return;

        var addressObj = {
            ext: {},
            exclusivePageName: null,
            elementExclusive: false,
            exclusive: false,
            found: false
        }
        var pages = [];
        var selection = this.view.selection;
        var rangeCount = selection.getRangeCount();
        for (var i = 0; i < rangeCount; i++) {
            var start = {};
            var end = {};
            selection.getRangeAt(i, start, end);
            for (var j = start.value; j <= end.value; j++) {
                var page = this.getPageByIndex(j);
                pages.push(page);
            }
        }
        if (pages.length <= 0) return;

        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            addressObj.ext[page.getName()] = new YaripExtensionItem(page.getId(), null, true, true, true, true, true, true, true, null, true);
        }
        var map = new YaripMap();
        yarip.getExtensionAddressObj(addressObj);
        for (var pageName in addressObj.ext) map.add(this.getPageByName(pageName).clone());
        var dateStr = this.getDateString();
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(window, this.sb.getString("exportPages"), nsIFilePicker.modeSave);
        fp.appendFilters(nsIFilePicker.filterXML);
        if (pages.length === 1) {
            fp.defaultString = dateStr + "_" + pages[0].getName().replace(/\/+$/, "").replace(/\//g, "_") + ".xml";
        } else {
            fp.defaultString = fp.defaultString = dateStr + "_yarip-pages.xml";
        }
        var res = fp.show();
        if (res === nsIFilePicker.returnOK || res === nsIFilePicker.returnReplace) {
            map.purge();
            var data = map.generateXml(true);
            yarip.saveToFile(data, fp.file);
        }
    }

    this.exportAll = function() {
        var dateStr = this.getDateString();
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(window, this.sb.getString("exportPages"), nsIFilePicker.modeSave);
        fp.appendFilters(nsIFilePicker.filterXML);
        fp.defaultString = dateStr + "_yarip.xml";
        var res = fp.show();
        if (res === nsIFilePicker.returnOK || res === nsIFilePicker.returnReplace) {
            var map = yarip.map.clone();
            map.purge();
            var data = map.generateXml(true);
            yarip.saveToFile(data, fp.file);
        }
    }

    this.save = function() {
        yarip.save();
    }

    this.refreshTab = function(tab, load, update, key) {
        if (!tab) {
            this.refreshTab("elementWhitelist", load);
            this.refreshTab("elementBlacklist", load);
            this.refreshTab("elementAttributeList", load);
            this.refreshTab("elementScriptList", load);
            this.refreshTab("contentWhitelist", load);
            this.refreshTab("contentBlacklist", load);
            this.refreshTab("contentRequestHeaderList", load);
            this.refreshTab("contentResponseHeaderList", load);
            this.refreshTab("contentRedirectList", load);
            this.refreshTab("contentStreamList", load);
            this.refreshTab("pageStyleList", load);
            this.refreshTab("pageScriptList", load);
            this.refreshTab("pageRequestHeaderList", load);
            this.refreshTab("pageResponseHeaderList", load);
            this.refreshTab("pageRedirectList", load);
            this.refreshTab("pageStreamList", load);
            this.refreshTab("pageExtensionList", load);
            this.refreshTab("pageExtendedByList", load);
            return;
        }

        var elementCount = this.tabs["elementWhitelist"].list.length
            + this.tabs["elementBlacklist"].list.length
            + this.tabs["elementAttributeList"].list.length
            + this.tabs["elementScriptList"].list.length;
        var contentCount = this.tabs["contentWhitelist"].list.length
            + this.tabs["contentBlacklist"].list.length
            + this.tabs["contentRequestHeaderList"].list.length
            + this.tabs["contentResponseHeaderList"].list.length
            + this.tabs["contentRedirectList"].list.length
            + this.tabs["contentStreamList"].list.length;
        var contentHeaderCount = this.tabs["contentRequestHeaderList"].list.length
            + this.tabs["contentResponseHeaderList"].list.length;
        var pageCount = this.tabs["pageStyleList"].list.length
            + this.tabs["pageScriptList"].list.length
            + this.tabs["pageRequestHeaderList"].list.length
            + this.tabs["pageResponseHeaderList"].list.length
            + this.tabs["pageRedirectList"].list.length
            + this.tabs["pageStreamList"].list.length
            + this.tabs["pageExtensionList"].list.length
            + this.tabs["pageExtendedByList"].list.length;
        var pageHeaderCount = this.tabs["pageRequestHeaderList"].list.length
            + this.tabs["pageResponseHeaderList"].list.length;
        var elementTab = document.getElementById("element-tab");
        var contentTab = document.getElementById("content-tab");
        var contentHeaderTab = document.getElementById("contentHeader-tab");
        var pageTab = document.getElementById("page-tab");
        var pageHeaderTab = document.getElementById("pageHeader-tab");
        elementTab.setAttribute("label", this.sb.getFormattedString("element-tab", [elementCount]));
        contentTab.setAttribute("label", this.sb.getFormattedString("content-tab", [contentCount]));
        contentHeaderTab.setAttribute("label", this.sb.getFormattedString("header-tab", [contentHeaderCount]));
        pageTab.setAttribute("label", this.sb.getFormattedString("page-tab", [pageCount]));

        pageHeaderTab.setAttribute("label", this.sb.getFormattedString("header-tab", [pageHeaderCount]));

        var tree = this.tabs[tab].tree;
        var list = this.tabs[tab].list;

        switch (tab) {
            case "elementWhitelist":
            case "elementBlacklist":
            case "elementAttributeList":
            case "elementScriptList":
            case "contentWhitelist":
            case "contentBlacklist":
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
            case "contentStreamList":
            case "pageStyleList":
            case "pageScriptList":
            case "pageRequestHeaderList":
            case "pageResponseHeaderList":
            case "pageRedirectList":
            case "pageStreamList":
                if (load) {
                    tree.view = new YaripListTreeView(list);
                }
                if (load || tree.currentIndex < 0) {
                    switch (tab) {
                        case "elementWhitelist": this.tabs[tab].item = new YaripElementWhitelistItem(); break;
                        case "elementBlacklist": this.tabs[tab].item = new YaripElementBlacklistItem(); break;
                        case "elementAttributeList": this.tabs[tab].item = new YaripElementAttributeItem(); break;
                        case "elementScriptList": this.tabs[tab].item = new YaripScriptItem(); break;
                        case "contentWhitelist": this.tabs[tab].item = new YaripContentWhitelistItem(); break;
                        case "contentBlacklist": this.tabs[tab].item = new YaripContentBlacklistItem(); break;
                        case "contentRequestHeaderList": this.tabs[tab].item = new YaripHeaderItem(); break;
                        case "contentResponseHeaderList": this.tabs[tab].item = new YaripHeaderItem(); break;
                        case "contentRedirectList": this.tabs[tab].item = new YaripRedirectItem(); break;
                        case "contentStreamList": this.tabs[tab].item = new YaripStreamItem(); break;
                        case "pageStyleList": this.tabs[tab].item = new YaripStyleItem(); break;
                        case "pageScriptList": this.tabs[tab].item = new YaripPageScriptItem(); break;
                        case "pageRedirectList": this.tabs[tab].item = new YaripRedirectItem(); break;
                        case "pageStreamList": this.tabs[tab].item = new YaripStreamItem(); break;
                        case "pageRequestHeaderList": this.tabs[tab].item = new YaripHeaderItem(); break;
                        case "pageResponseHeaderList": this.tabs[tab].item = new YaripHeaderItem(); break;
                    }
                    if (!key) {
                        tree.currentIndex = 0;
                        tree.view.selection.select(0);
                    }
                    update = true;
                } else {
                    var tmpKey = list.get(tree.currentIndex, LIST_INDEX_KEY);
                    if (tmpKey) this.tabs[tab].item = list.getByKey(tmpKey).clone();
                }

                this.tabs[tab].tab.setAttribute("label", this.sb.getFormattedString(tab + "-tab", [list.length]));

                switch (tab) {
                    case "elementWhitelist":
                    case "contentWhitelist":
                        this.tabs[tab].exclusiveMenulist.checked = list.getExclusive();
                        break;
                    case "elementScriptList":
                        var allow = this.page.getAllowScript();
                        tree.disabled = !allow;
                        this.tabs[tab].textbox.disabled = !allow;
                        this.tabs[tab].addButton.disabled = !allow;
                        this.tabs[tab].removeButton.disabled = !allow;
                        this.tabs[tab].clearButton.disabled = !allow;
                        break;
                    case "pageScriptList":
                        var allow = this.page.getAllowScript();
                        tree.disabled = !allow;
                        this.tabs[tab].textbox.disabled = !allow;
                        this.tabs[tab].addButton.disabled = !allow;
                        this.tabs[tab].removeButton.disabled = !allow;
                        this.tabs[tab].clearButton.disabled = !allow;
                        break;
                }

                switch (tab) {
                    case "elementScriptList":
                    case "contentRequestHeaderList":
                    case "contentResponseHeaderList":
                    case "contentRedirectList":
                    case "contentStreamList":
                    case "pageStyleList":
                    case "pageScriptList":
                    case "pageRequestHeaderList":
                    case "pageResponseHeaderList":
                    case "pageRedirectList":
                    case "pageStreamList":
                        if (load || update) {
                            this.tabs[tab].textbox.value = list.get(tree.currentIndex, 99);
                        }
                        break;
                }
                break;
            case "pageExtensionList":
            case "pageExtendedByList":
                if (load) {
                    tree.view = new YaripListTreeView(list);
                }

                this.tabs[tab].tab.setAttribute("label", this.sb.getFormattedString(tab + "-tab", [list.length]));
                break;
        }

        if (key && (load || update)) {
            for (var i = 0; i < list.length; i++) {
                if (key === list.get(i, LIST_INDEX_KEY)) {
                    tree.currentIndex = i;
                    tree.view.selection.select(i);
                    tree.boxObject.ensureRowIsVisible(i);
                    tree.focus();
                    break;
                }
            }
        }
    }

    this.reloadPage = function(pageName, refreshPages, selectPage, selectTab, resetFilter, type, key) {
//        var page = this.getPageByIndex();
        var oldPageName = this.page ? this.page.getName() : null;
        if (refreshPages) {
            if (!selectPage && oldPageName) {
                pageName = oldPageName;
                selectPage = true;
            }
            this.refreshPages(true);
        }

        var diffPages = false;
        if (selectPage) {
            if (this.getPageByName(pageName)) {
                this.selectPageByName(pageName, !resetFilter);
                if (pageName !== oldPageName) {
                    selectTab = true;
                    diffPages = true;
                }
            } else {
                this.selectPageByIndex(0); // select first
                selectTab = true;
            }
        }

        if (selectTab) {
            if (type || diffPages) {
                this.selectTab(this.getPageByName(pageName), type, key);
            } else {
                this.refreshTab(null, true);
            }
        }
    }

    this.handleEvent = function(event) {
        if (!event) return;

        switch(event.target.id) {
            case "yarip-edit-menupopup":
                switch (event.type) {
                    case "popupshowing":
                        var disabled = this.tabs[this.tab].list.length === 0;
                        var listDisabled = String(disabled);
                        var editDisabled = String(disabled || this.tab === "pageExtendedByList");
                        var gotoHidden = String(this.tab !== "pageExtensionList" && this.tab !== "pageExtendedByList");
                        var pageDisabled = String(!this.tmpPage);
                        document.getElementById("cmd_cut").setAttribute("disabled", editDisabled);
                        document.getElementById("cmd_copy").setAttribute("disabled", editDisabled);
                        document.getElementById("cmd_paste").setAttribute("disabled", pageDisabled);
                        document.getElementById("cmd_goto").setAttribute("disabled", listDisabled);
                        document.getElementById("yarip-cut-menuitem").setAttribute("disabled", editDisabled);
                        document.getElementById("yarip-copy-menuitem").setAttribute("disabled", editDisabled);
                        document.getElementById("yarip-paste-menuitem").setAttribute("disabled", pageDisabled);
                        document.getElementById("yarip-goto-menuseparator").setAttribute("hidden", gotoHidden);
                        document.getElementById("yarip-goto-menuitem").setAttribute("hidden", gotoHidden);
                        document.getElementById("yarip-goto-menuitem").setAttribute("disabled", listDisabled);
                        break;
                }
                break;

            case "popuphiding":
                var editEnabled = String(false);
                document.getElementById("cmd_cut").setAttribute("disabled", editEnabled);
                document.getElementById("cmd_copy").setAttribute("disabled", editEnabled);
                document.getElementById("cmd_paste").setAttribute("disabled", editEnabled);
                document.getElementById("cmd_goto").setAttribute("disabled", editEnabled);
                break;

            case "tree-pages":
                if (this.tabs[this.tab].tree) {
                    this.tabs[this.tab].tree.stopEditing(false);
                }
                this.refreshPages(null, true);
                break;

            case "elementWhitelist-tree":
            case "elementBlacklist-tree":
            case "elementAttributeList-tree":
            case "contentWhitelist-tree":
            case "contentBlacklist-tree":
            case "pageExtensionList-tree":
            case "pageExtendedByList-tree":
                this.refreshTab(this.tab);
                break;

            case "elementScriptList-tree":
            case "contentRequestHeaderList-tree":
            case "contentResponseHeaderList-tree":
            case "contentRedirectList-tree":
            case "contentStreamList-tree":
            case "pageStyleList-tree":
            case "pageScriptList-tree":
            case "pageRequestHeaderList-tree":
            case "pageResponseHeaderList-tree":
            case "pageRedirectList-tree":
            case "pageStreamList-tree":
                this.refreshTab(this.tab, null, true);
                break;
        }
    }

    this.initTab = function(tab) {
        if (!tab) return;

        switch (tab) {
            case "contentHeader":
            case "pageHeader":
                this.tabs[tab] = {};
                this.tabs[tab].tab = document.getElementById(tab + "-tab");
                break;
            case "elementWhitelist":
            case "elementBlacklist":
            case "elementAttributeList":
            case "elementScriptList":
            case "contentWhitelist":
            case "contentBlacklist":
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
            case "contentStreamList":
            case "pageStyleList":
            case "pageScriptList":
            case "pageRequestHeaderList":
            case "pageResponseHeaderList":
            case "pageRedirectList":
            case "pageStreamList":
            case "pageExtensionList":
            case "pageExtendedByList":
                this.tabs[tab] = {};
                this.tabs[tab].tab = document.getElementById(tab + "-tab");
                this.tabs[tab].tree = document.getElementById(tab + "-tree");
                this.tabs[tab].tree.addEventListener("select", this, false);
                break;
        }

        switch (tab) {
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
            case "contentStreamList":
            case "pageStyleList":
            case "pageRequestHeaderList":
            case "pageResponseHeaderList":
            case "pageRedirectList":
            case "pageStreamList":
                this.tabs[tab].textbox = document.getElementById(tab + "-textbox");
                break;
            case "elementWhitelist":
            case "contentWhitelist":
                this.tabs[tab].exclusiveMenulist = document.getElementById(tab + "-exclusive");
                break;
            case "elementScriptList":
                this.tabs[tab].textbox = document.getElementById(tab + "-textbox");
                this.tabs[tab].addButton = document.getElementById(tab + "-add");
                this.tabs[tab].removeButton = document.getElementById(tab + "-remove");
                this.tabs[tab].clearButton = document.getElementById(tab + "-clear");
                break;
            case "pageScriptList":
                this.tabs[tab].textbox = document.getElementById(tab + "-textbox");
                this.tabs[tab].addButton = document.getElementById(tab + "-add");
                this.tabs[tab].removeButton = document.getElementById(tab + "-remove");
                this.tabs[tab].clearButton = document.getElementById(tab + "-clear");
                break;
            case "pageExtensionList":
                this.tabs[tab].menulist = document.getElementById(tab + "-menulist");
                break;
        }
    }

    this.refreshExtMenulist = function(load) {
        var oldPageName = null;
        var childNodes = this.tabs["pageExtensionList"].menulist.firstChild.childNodes;
        if (childNodes.length > 0) {
            oldPageName = childNodes[this.tabs["pageExtensionList"].menulist.selectedIndex].getAttribute("label");
        }

        if (load) {
            var menupopup = document.createElement("menupopup");
            yarip.map.tree.traverse(function(node) {
                var page = node.value;
                if (page && !page.getTemporary()) {
                    var menuitem = document.createElement("menuitem");
                    menuitem.setAttribute("label", page.getName());
                    menuitem.setAttribute("value", page.getId());
                    menupopup.appendChild(menuitem);
                }
            });
            this.tabs["pageExtensionList"].menulist.replaceChild(menupopup, this.tabs["pageExtensionList"].menulist.firstChild);
        }

        childNodes = this.tabs["pageExtensionList"].menulist.firstChild.childNodes;
        if (childNodes.length > 0) {
            if (oldPageName) {
                for (var i = 0, l = childNodes.length; i < l; i++) {
                    var menuItem = childNodes[i];
                    if (menuItem.getAttribute("label") === oldPageName) {
                        this.tabs["pageExtensionList"].menulist.selectedIndex = i;
                        break;
                    }
                }
            }

            if (this.tabs["pageExtensionList"].menulist.selectedIndex < 0) {
                this.tabs["pageExtensionList"].menulist.selectedIndex = 0;
            }
            this.tabs["pageExtensionList"].item.setId(this.tabs["pageExtensionList"].menulist.selectedItem.getAttribute("value"));
        }
    }

    this.load = function() {
        yarip.pageDialog.dialog = this;

//        var pageName = null;
//        var type = null;
//        var key = null;
//        var query = location.search.substring(1);
//        var params = query.split('&');
//        for (var i = 0; i < params.length; i++) {
//            var nameValue = params[i].split('=');
//            switch (decodeURIComponent(nameValue[0])) {
//                case "page": pageName = decodeURIComponent(nameValue[1]); break;
//                case "type": type = decodeURIComponent(nameValue[1]); break;
//                case "key": key = decodeURIComponent(nameValue[1]); break;
//            }
//        }
        var params = yarip.pageDialog.params;
        var pageName = params.page;
        var type = params.type;
        var key = params.key;

        this.sb = document.getElementById("page-dialog-stringbundle");
        this.treePages = document.getElementById("tree-pages");
        this.dialogheaderPage = document.getElementById("dialogheader-page");
        this.tabbox = document.getElementById("tabbox");
        this.elementTabbox = document.getElementById("element-tabbox");
        this.contentTabbox = document.getElementById("content-tabbox");
        this.contentHeaderTabbox = document.getElementById("content-header-tabbox");
        this.pageTabbox = document.getElementById("page-tabbox");
        this.pageHeaderTabbox = document.getElementById("page-header-tabbox");
        this.editMenupopup = document.getElementById("yarip-edit-menupopup");
        this.allowScript = document.getElementById("page-allow-script");

        this.treePages.addEventListener("select", this, false);
        this.editMenupopup.addEventListener("popupshowing", this, false);

        this.tab = "elementWhitelist";
        this.tabs = {};
        this.initTab("elementWhitelist");
        this.initTab("elementBlacklist");
        this.initTab("elementAttributeList");
        this.initTab("elementScriptList");
        this.initTab("contentWhitelist");
        this.initTab("contentBlacklist");
        this.initTab("contentHeader");
        this.initTab("contentRequestHeaderList");
        this.initTab("contentResponseHeaderList");
        this.initTab("contentRedirectList");
        this.initTab("contentStreamList");
        this.initTab("pageStyleList");
        this.initTab("pageScriptList");
        this.initTab("pageHeader");
        this.initTab("pageRequestHeaderList");
        this.initTab("pageResponseHeaderList");
        this.initTab("pageRedirectList");
        this.initTab("pageStreamList");
        this.initTab("pageExtensionList");
        this.initTab("pageExtendedByList");

//        // Bug 708196: https://bugzilla.mozilla.org/show_bug.cgi?id=708196
//        var fun = function (treeId) {
//                document.getElementById(treeId).inputField.addEventListener("keypress", function (event) {
//                        if (event.keyCode >= event.DOM_VK_PAGE_UP && event.keyCode <= event.DOM_VK_DOWN) {
//                            event.stopPropagation();
//                        }
//                    }, false);
//            };
//        fun("tree-pages");
//        fun("elementWhitelist-tree");
//        fun("elementBlacklist-tree");
//        fun("elementAttributeList-tree");
//        fun("elementScriptList-tree");
//        fun("contentWhitelist-tree");
//        fun("contentBlacklist-tree");
//        fun("contentRequestHeaderList-tree");
//        fun("contentResponseHeaderList-tree");
//        fun("contentRedirectList-tree");
//        fun("contentStreamList-tree");
//        fun("pageStyleList-tree");
//        fun("pageScriptList-tree");
//        fun("pageRequestHeaderList-tree");
//        fun("pageResponseHeaderList-tree");
//        fun("pageRedirectList-tree");
//        fun("pageStreamList-tree");
//        fun("pageExtensionList-tree");
//        fun("pageExtendedByList-tree");

        this.refreshPages(true);

        if (pageName) {
            var page = this.selectPageByName(pageName);
            if (page) {
                this.selectTab(page, type, key);
            } else {
                this.selectTab(this.selectPageByIndex(0));
            }
        } else {
            this.selectTab(this.selectPageByIndex(0));
        }
    }

    this.resetFilter = function() {
        this.filterString = null;
        document.getElementById("yarip-pageFilter-textbox").value = "";
        this.filterPages();
    }

    this.filterPages = function(event) {
        this.filterString = event ? event.target.value : this.filterString;
        this.view.applyFilterString(this.filterString, this.treePages.currentIndex);
        this.refreshTab(null, true);
    }
}

function YaripPageTreeView() {
    this.treebox = null;
    this.visibleData = [];
    this.filterString = null;
    this.filterRegExp = null;
    this.filterError = false;
    this.rowCount = this.visibleData.length;

    this.getRowCount = function() { return this.visibleData.length; }

    this.cycleHeader = function(col) {}
    this.getCellProperties = function(row, col) {}
    this.getCellText = function(row, col) {
        if (row < 0 || row >= this.visibleData.length) return "";

        var cellText = this.visibleData[row].getName();
        return cellText ? cellText : null;
    }
    this.getCellValue = function(row, col) {
        if (row < 0 || row >= this.visibleData.length) return "";

        var cellText = this.visibleData[row].getName();
        return cellText ? cellText : null;
    }
    this.getColumnProperties = function(colid, col) {}
    this.getImageSrc = function(row, col) { return null; }
    this.getLevel = function(row) { return 0; }
    this.getRowProperties = function(row) {}
    this.isContainer = function(row) { return false; }
    this.isEditable = function(row, col) { return col.element.getAttribute("editable"); }
    this.isSeparator = function(row) { return false; }
    this.isSorted = function(row) { return false; }
    this.getParentIndex = function(rowIndex) { return -1; }
    this.setCellText = function(row, col, value) { this.setCellValue(row, col, value); }
    this.setCellValue = function(row, col, value) {
        if (!yarip.checkPageName(value)) return;

        var pageName = this.visibleData[row].getName();
        var page = yarip.map.get(pageName);
        yarip.map.remove(page, true /* notExtension */);
        page.setName(value, true);
        yarip.map.add(page);
        var list = page.pageExtendedByList;
        for each (var item in list.obj) {
            var itemPage = item.getPage();
            if (itemPage) itemPage.pageExtendedByList.sorted = false;
        }
        dialog.treePages.stopEditing(false);
        if (dialog.tabs[dialog.tab].tree) {
            dialog.tabs[dialog.tab].tree.stopEditing(false);
        }
        dialog.view.purge();
        dialog.refreshExtMenulist(true);
        dialog.selectPageByName(value, true);
    }
    this.setTree = function(treebox) { this.treebox = treebox; }

    this.getPageByIndex = function(index) {
        if (index < 0 || index >= this.visibleData.length) return null;

        return this.visibleData[index];
    }

    this.applyFilterString = function(value, currentIndex, treeView) {
        var tv = treeView ? treeView : this;
        var prevRowCount = tv.visibleData.length;
        var currentPage = currentIndex >= 0 ? tv.visibleData[currentIndex] : null;
        tv.filterString = value ? value : null;
        tv.filterRegExp = null;
        tv.filterError = false;
        tv.visibleData = [];
        if (tv.filterString) {
            try {
                tv.filterRegExp = new RegExp(tv.filterString, "i");
            } catch (e) {
                tv.filterError = true;
            }
        }
        var arr = yarip.map.tree.toArray();
        for (var i = 0; i < arr.length; i++) {
            var page = arr[i];
            if (tv.allowPage(page, tv)) {
                tv.visibleData.push(page);
                page.index = tv.visibleData.length - 1;
            } else {
                page.index = -1;
            }
        }
        tv.rowCount = tv.visibleData.length;
        if (tv.treebox) {
            tv.treebox.rowCountChanged(0, tv.rowCount - prevRowCount);
            if (currentPage) {
                for (var i = currentPage.index; i < tv.rowCount; i++) {
                    if (tv.visibleData[i] && tv.visibleData[i].index > -1) {
                        tv.selection.select(tv.visibleData[i].index);
                        tv.treebox.ensureRowIsVisible(tv.visibleData[i].index);
                        break;
                    }
                }
            }
            tv.treebox.invalidate();
        }
    }

    this.allowPage = function(page, treeView) {
        var tv = treeView ? treeView : this;
        return !tv.filterError && (!tv.filterRegExp || tv.filterRegExp.test(page.getName()));
    }

    this.purge = function() {
        this.applyFilterString(null, -1);
    }
}

function YaripListTreeView(list) {
    this.treebox = null;
    this.rowCount = list.length;
    this.getRowCount = function() { return this.rowCount; }
    this.cycleHeader = function(col) {}
    this.getCellProperties = function(row, col) {}
    this.getCellText = function(row, col) { return list.get(row, col.index); }
    this.getCellValue = function(row, col) { return list.get(row, col.index); }
    this.getColumnProperties = function(colid, col) {}
    this.getImageSrc = function(row, col) { return null; }
    this.getLevel = function(row) { return 0; }
    this.getRowProperties = function(row) {}
    this.isContainer = function(row) { return false; }
    this.isEditable = function(row, col) { return col.element.getAttribute("editable"); }
    this.isSeparator = function(row) { return false; }
    this.isSorted = function(row) { return false; }
    this.setCellText = function(row, col, value) { this.setCellValue(row, col, value); }
    this.setCellValue = function(row, col, value) {
        var page = dialog.getPageByIndex();
        switch (list.getName()) {
            case "extension":
                var obj = list.set(row, col.index, value);
                if (obj.isNew) {
                    yarip.map.removeExtension(page, obj.oldItem);
                    yarip.map.addExtension(page, obj.newItem);
                    this.treebox.invalidate();
                    dialog.refreshTab(dialog.tab, null, true, obj.newItem.getKey());
                    if (page.setTemporary(false)) dialog.refreshExtMenulist(true);
                } else if (obj.item) {
                    if (obj.isExtendedBy) {
                        yarip.map.updateExtendedBy(page, obj.item);
                        if (obj.item.getPage().setTemporary(false)) dialog.refreshExtMenulist(true);
                    } else {
                        yarip.map.updateExtension(page, obj.item);
                        if (page.setTemporary(false)) dialog.refreshExtMenulist(true);
                    }
                    this.treebox.invalidateCell(row, col);
                }
                break;
            default:
                var key = list.set(row, col.index, value);
                if (key) {
                    this.treebox.invalidate();
                    dialog.refreshTab(dialog.tab, null, true, key);
                } else {
                    this.treebox.invalidateCell(row, col);
                }
                if (page.setTemporary(false)) dialog.refreshExtMenulist(true);
                break;
        }
    }
    this.setTree = function(treebox) { this.treebox = treebox; }
}

