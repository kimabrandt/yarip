
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

Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/uri.jsm");

function YaripPageDialog()
{
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
    this.userSelect = false;

    this.page = null;
    this.doReload = true;

    this.updateTab = function()
    {
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
//            case INDEX_CONTENT_STREAM: this.tab = "contentStreamList"; break;
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

    this.setUserSelect = function(value)
    {
        this.userSelect = value != false;
    }

    this.getPageByIndex = function(index)
    {
        index = index >= 0 ? index : this.treePages.currentIndex;
        if (index < 0) return null;

        return this.view.getPageByIndex(index);
    }

    this.getPageByName = function(pageName)
    {
        if (!pageName) return null;

        return yarip.map.get(pageName);
    }

    this.setValue = function(value)
    {
        if (this.treePages.currentIndex < 0) return;

        switch (this.tab) {
        case "elementScriptList":
        case "contentRequestHeaderList":
        case "contentResponseHeaderList":
        case "contentRedirectList":
//        case "contentStreamList":
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

    this.doCut = function()
    {
        if (this.treePages.currentIndex < 0) return;

        this.page = new YaripPage();
        var toList = null;
        switch (this.tab) {
        case "elementWhitelist":
            toList = this.page.elementWhitelist;
            break;
        case "elementBlacklist":
            toList = this.page.elementBlacklist;
            break;
        case "elementAttributeList":
            toList = this.page.elementAttributeList;
            break;
        case "elementScriptList":
            toList = this.page.elementScriptList;
            break;
        case "contentWhitelist":
            toList = this.page.contentWhitelist;
            break;
        case "contentBlacklist":
            toList = this.page.contentBlacklist;
            break;
        case "contentRequestHeaderList":
            toList = this.page.contentRequestHeaderList;
            break;
        case "contentResponseHeaderList":
            toList = this.page.contentResponseHeaderList;
            break;
        case "contentRedirectList":
            toList = this.page.contentRedirectList;
            break;
//        case "contentStreamList":
//            toList = this.page.contentStreamList;
//            break;
        case "pageStyleList":
            toList = this.page.pageStyleList;
            break;
        case "pageScriptList":
            toList = this.page.pageScriptList;
            break;
        case "pageRequestHeaderList":
            toList = this.page.pageRequestHeaderList;
            break;
        case "pageResponseHeaderList":
            toList = this.page.pageResponseHeaderList;
            break;
        case "pageRedirectList":
            toList = this.page.pageRedirectList;
            break;
        case "pageStreamList":
            toList = this.page.pageStreamList;
            break;
        case "pageExtensionList":
            toList = this.page.pageExtensionList;
            break;
        default:
            return;
        }

        var fromList = this.tabs[this.tab].list;
        var selection = this.tabs[this.tab].tree.view.selection;
        var rangeCount = selection.getRangeCount();
        var keys = {};
        for (var i = 0; i < rangeCount; i++)
        {
            var start = {};
            var end = {};
            selection.getRangeAt(i, start, end);
            for (var j = start.value; j <= end.value; j++) {
                var key = fromList.get(j, LIST_INDEX_KEY);
                keys[key] = true;
                toList.add(fromList.getByKey(key).clone(), null, true);
            }
        }
        for (var key in keys) fromList.removeByKey(key);
        this.refreshTab(this.tab, true);
        this.setUserSelect();
    }

    this.doCopy = function()
    {
        if (this.treePages.currentIndex < 0) return;

        this.page = new YaripPage();
        var toList = null;
        switch (this.tab) {
        case "elementWhitelist":
            toList = this.page.elementWhitelist;
            break;
        case "elementBlacklist":
            toList = this.page.elementBlacklist;
            break;
        case "elementAttributeList":
            toList = this.page.elementAttributeList;
            break;
        case "elementScriptList":
            toList = this.page.elementScriptList;
            break;
        case "contentWhitelist":
            toList = this.page.contentWhitelist;
            break;
        case "contentBlacklist":
            toList = this.page.contentBlacklist;
            break;
        case "contentRequestHeaderList":
            toList = this.page.contentRequestHeaderList;
            break;
        case "contentResponseHeaderList":
            toList = this.page.contentResponseHeaderList;
            break;
        case "contentRedirectList":
            toList = this.page.contentRedirectList;
            break;
//        case "contentStreamList":
//            toList = this.page.contentStreamList;
//            break;
        case "pageStyleList":
            toList = this.page.pageStyleList;
            break;
        case "pageScriptList":
            toList = this.page.pageScriptList;
            break;
        case "pageRequestHeaderList":
            toList = this.page.pageRequestHeaderList;
            break;
        case "pageResponseHeaderList":
            toList = this.page.pageResponseHeaderList;
            break;
        case "pageRedirectList":
            toList = this.page.pageRedirectList;
            break;
        case "pageStreamList":
            toList = this.page.pageStreamList;
            break;
        case "pageExtensionList":
            toList = this.page.pageExtensionList;
            break;
        default:
            return;
        }

        var fromList = this.tabs[this.tab].list;
        var selection = this.tabs[this.tab].tree.view.selection;
        var rangeCount = selection.getRangeCount();
        for (var i = 0; i < rangeCount; i++)
        {
            var start = {};
            var end = {};
            selection.getRangeAt(i, start, end);
            for (var j = start.value; j <= end.value; j++) {
                var key = fromList.get(j, LIST_INDEX_KEY);
                toList.add(fromList.getByKey(key).clone(), null, true);
            }
        }
        this.setUserSelect();
    }

    this.doPaste = function()
    {
        if (!this.page) return;

        var page = this.getPageByIndex();
        if (!page) return;

        page.merge(this.page);
        page.setTemporary(false);
        this.refreshTab(null, true);
    }

    this.gotoPage = function(event)
    {
        var currentIndex = this.tabs[this.tab].tree.currentIndex;
        if (currentIndex < 0) return;

        var pageName = this.tabs[this.tab].list.get(currentIndex, 0);
        this.reloadPage(pageName, false, true, true, true);

        switch (this.tab) {
        case "pageExtensionList":
            this.pageTabbox.selectedIndex = INDEX_PAGE_EXTENDED_BY;
            break;
        case "pageExtendedByList":
            this.pageTabbox.selectedIndex = INDEX_PAGE_EXTENSION;
            break;
        }
    }

    this.doSelectAll = function()
    {
        if (this.treePages.currentIndex < 0) return;

        this.tabs[this.tab].tree.focus();
        this.tabs[this.tab].tree.view.selection.selectAll();
    }

    this.add = function()
    {
        var page = this.getPageByIndex();
        if (!page) return;

        var obj = null;

        switch (this.tab) {
        case "elementWhitelist":
            obj = {
                item: new YaripElementWhitelistItem("//div[@class='useful']/descendant-or-self::*"),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/whitelistelementdialog.xul", "whitelistelementdialog", "chrome,modal,resizable", null, obj);
            if (!obj.item) return;

            page.elementWhitelist.add(obj.item);
            break;

        case "elementBlacklist":
            obj = {
                item: new YaripElementBlacklistItem("//iframe"),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/blacklistelementdialog.xul", "blacklistelementdialog", "chrome,modal,resizable", null, obj);
            if (!obj.item) return;

            page.elementBlacklist.add(obj.item);
            break;

        // TODO Create a better example, since this can be done with styles!
        case "elementAttributeList":
            obj = {
                item: new YaripElementAttributeItem("//div[@class='narrow']", "style", "width: auto;"),
                attrName: "style",
                attrValue: "width: auto;",
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/styledialog.xul", "styledialog", "chrome,modal,resizable", null, obj);
            if (!obj.item || !obj.attrName) return;

            obj.item.setName(obj.attrName);
            obj.item.setValue(obj.attrValue);
            page.elementAttributeList.add(obj.item);
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
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/scriptdialog.xul", "scriptdialog", "chrome,modal,resizable", null, obj);
            if (!obj.item) return;

            page.elementScriptList.add(obj.item);
            break;

        case "contentWhitelist":
            var re = yarip.getPageRegExp(page.getName(), null, true /* byUser */);
            obj = {
                item: new YaripContentWhitelistItem(re),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/whitelistcontentdialog.xul", "whitelistcontentdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

//            obj.item.setCreated(Date.now());
            page.contentWhitelist.add(obj.item);
            break;

        case "contentBlacklist":
            var re = yarip.getPageRegExp(page.getName(), null, true /* byUser */);
            obj = {
                item: new YaripContentBlacklistItem(re),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/blacklistcontentdialog.xul", "blacklistcontentdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.contentBlacklist.add(obj.item);
            break;

        case "contentRequestHeaderList":
            var re = yarip.getPageRegExp(page.getName(), null, true /* byUser */);
            obj = {
                item: new YaripHeaderItem(re, "Cookie",
                        "function (value) {\n" +
                        "    return \"\";\n" +
                        "}", false),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.contentRequestHeaderList.add(obj.item);
            break;

        case "contentResponseHeaderList":
            var re = yarip.getPageRegExp(page.getName(), null, true /* byUser */);
            obj = {
                item: new YaripHeaderItem(re, "Set-Cookie",
                        "function (value) {\n" +
                        "    return \"\";\n" +
                        "}", false),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.contentResponseHeaderList.add(obj.item);
            break;

        case "contentRedirectList":
            var reObj = yarip.getPageRegExpObj(page.getName(), null, true /* byUser */);
            obj = {
//                item: new YaripRedirectItem(reObj.regExp, reObj.newSubStr),
                item: new YaripRedirectItem(reObj.regExp,
                        "function (url) {\n" +
                        "    return unescape(url.replace(/.*?\\?url=(http[^&#]+).*/, \"$1\"));\n" +
                        "}"),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/redirectdialog.xul", "redirectdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.contentRedirectList.add(obj.item);
            break;

//        case "contentStreamList":
//            obj = {
//                item: new YaripStreamItem("", ""),
//                pageName: page.getName()
//            }
//            window.openDialog("chrome://yarip/content/replacedialog.xul", "replacedialog", "chrome,modal,resizable", obj);
//            if (!obj.item) return;

//            page.contentStreamList.add(obj.item);
//            break;

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
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/pagestyledialog.xul", "pagestyledialog", "chrome,modal,resizable", null, obj);
            if (!obj.item) return;

            page.pageStyleList.add(obj.item);
            break;

        case "pageScriptList":
            obj = {
                item: new YaripPageScriptItem("/html/body", "console.log(\"Insert script!\");"),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/scriptdialog.xul", "scriptdialog", "chrome,modal,resizable", null, obj);
            if (!obj.item) return;

            page.pageScriptList.add(obj.item);
            break;

        case "pageRequestHeaderList":
            var re = yarip.getPageRegExp(page.getName(), null, true /* byUser */);
            obj = {
                item: new YaripHeaderItem(re, "Cookie",
                        "function (value) {\n" +
                        "    return \"\";\n" +
                        "}", false),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.pageRequestHeaderList.add(obj.item);
            break;

        case "pageResponseHeaderList":
            var re = yarip.getPageRegExp(page.getName(), null, true /* byUser */);
            obj = {
                item: new YaripHeaderItem(re, "Set-Cookie",
                        "function (value) {\n" +
                        "    return \"\";\n" +
                        "}", false),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/headerdialog.xul", "headerdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.pageResponseHeaderList.add(obj.item);
            break;

        case "pageRedirectList":
            var reObj = yarip.getPageRegExpObj(page.getName(), null, true /* byUser */);
            obj = {
//                item: new YaripRedirectItem(reObj.regExp, reObj.newSubStr),
                item: new YaripRedirectItem(reObj.regExp,
                        "function (url) {\n" +
                        "    return unescape(url.replace(/.*?\\?url=(http[^&#]+).*/, \"$1\"));\n" +
                        "}"),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/redirectdialog.xul", "redirectdialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.pageRedirectList.add(obj.item);
            break;

        case "pageStreamList":
            obj = {
                item: new YaripStreamItem("<script\\b[^>]*>(.|\\s)*?</script>",
                        "function (matches) {\n" +
                        "    for (var i = 0; i < matches.length; i++) {\n" +
                        "        matches[i] = matches[i].replace(/foo/g, \"bar\");\n" +
                        "    }\n" +
                        "}"),
                pageName: page.getName()
            }
            window.openDialog("chrome://yarip/content/replacedialog.xul", "replacedialog", "chrome,modal,resizable", obj);
            if (!obj.item) return;

            page.pageStreamList.add(obj.item);
            break;
        }

        page.setTemporary(false);
        var key = obj && obj.item ? obj.item.getKey() : null;
        this.refreshTab(this.tab, true, null, key);
    }

    this.remove = function()
    {
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
//        case "contentStreamList":
        case "pageStyleList":
        case "pageScriptList":
        case "pageRequestHeaderList":
        case "pageResponseHeaderList":
        case "pageRedirectList":
        case "pageStreamList":
//        case "pageExtensionList":
//        case "pageExtendedByList":
            var keys = {};
            var selection = tab.tree.view.selection;
            var rangeCount = selection.getRangeCount();
            for (var i = 0; i < rangeCount; i++)
            {
                var start = {};
                var end = {};
                selection.getRangeAt(i, start, end);
                for (var j = start.value; j <= end.value; j++) keys[tab.list.get(j, LIST_INDEX_KEY)] = true;
            }
            for (var key in keys) tab.list.removeByKey(key);
            this.refreshTab(this.tab, true);
            break;
        case "pageExtensionList":
//        case "pageExtendedByList":
            var keys = {};
            var selection = tab.tree.view.selection;
            var rangeCount = selection.getRangeCount();
            for (var i = 0; i < rangeCount; i++)
            {
                var start = {};
                var end = {};
                selection.getRangeAt(i, start, end);
                for (var j = start.value; j <= end.value; j++) keys[tab.list.get(j, LIST_INDEX_KEY)] = true;
            }
            var page = this.getPageByIndex();
            for (var key in keys) {
                var item = page.pageExtensionList.getByKey(key);
                yarip.map.removeExtension(page, item);
            }
            this.refreshTab(this.tab, true);
            break;
        }
    }

    this.removeAll = function()
    {
        if (this.treePages.currentIndex < 0) return;

        var tab = this.tabs[this.tab];
        if (!tab.list || tab.list.isEmpty()) return;

        switch (this.tab) {
        case "pageExtensionList":
//        case "pageExtendedByList":
            var page = this.getPageByIndex();
            var list = page.pageExtensionList;
            for each (var item in list.obj) {
                yarip.map.removeExtension(page, item);
            }
            break;
        default:
            tab.list.reset();
            break;
        }

        this.refreshTab(this.tab, true);
//        this.refreshExtMenulist();
    }

    this.toggleExclusive = function()
    {
//        if (this.treePages.currentIndex < 0) return;
        var page = this.getPageByIndex();
        if (!page) return;

        switch (this.tab) {
        case "elementWhitelist":
        case "contentWhitelist":
            this.tabs[this.tab].list.setExclusive(this.tabs[this.tab].exclusiveMenulist.checked);
            page.setTemporary(false);
            break;
        }
    }

    this.addExtPage = function()
    {
        var page = this.getPageByIndex();
        if (!page) return;

        var item = this.tabs[this.tab].item;
        if (!item) return;

        var id = item.getId();
        if (id != "" && id != page.getId()) {
            var item = yarip.map.getById(id).createPageExtensionItem();
            this.tabs[this.tab].list.add(item);
            page.setTemporary(false);
            this.refreshTab(this.tab, true, null, item.getKey());
        }
    }

    this.copyPage = function()
    {
        var page = this.getPageByIndex();
        if (!page) return;

        this.renamePage(page);
    }

    this.checkPageName = function(pageName)
    {
        if (!pageName) return false;

        if (yarip.checkPageName(pageName)) {
            return true;
        } else {
            alert(this.sb.getString("ERR_INVALID_PAGE_NAME"));
            return false;
        }
    }

    this.selectTab = function(page, type, key)
    {
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
//                        if (page.contentStreamList.isEmpty()) {
                            this.contentTabbox.selectedIndex = INDEX_CONTENT_WHITELIST;
//                        } else {
//                            this.contentTabbox.selectedIndex = INDEX_CONTENT_STREAM;
//                            selectedIndex = INDEX_TABBOX_CONTENT;
//                        }
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

        if (typeof type === "number") {
            var tab = null;

            switch (type) {
            case TYPE_CONTENT_WHITELIST:
                tab = "contentWhitelist";
                this.contentTabbox.selectedIndex = INDEX_CONTENT_WHITELIST;
                selectedIndex = INDEX_TABBOX_CONTENT;
                if (!key) {
                    document.getElementById("elementWhitelist-exclusive").focus(); // TODO Does this work!?
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
                this.contentTabbox.selectedIndex = INDEX_PAGE_REDIRECT;
                selectedIndex = INDEX_TABBOX_PAGE;
                break;
            }

            this.tabbox.selectedIndex = selectedIndex; // before `tree.focus'!

            if (tab && key) {
                var list = this.tabs[tab].list;
                for (var i = 0; i < list.length; i++) {
                    if (key == list.get(i, LIST_INDEX_KEY)) {
                        var tree = this.tabs[tab].tree;
                        tree.currentIndex = i;
                        tree.view.selection.select(i);
//                        tree.view.treebox.ensureRowIsVisible(i);
                        tree.focus();
                        break;
                    }
                }
            }
        }
    }

    this.selectPageByIndex = function(index)
    {
        var rowCount = this.view.getRowCount();
        if (index >= rowCount) return;

        if (index < 0) {
            this.treePages.currentIndex = -1;
            this.view.selection.select(-1);
            this.view.treebox.ensureRowIsVisible(0);
        } else {
            this.treePages.currentIndex = index;
            this.view.selection.select(index);
            this.view.treebox.ensureRowIsVisible(index);
        }
    }

    this.selectPageByName = function(pageName, noResetFilter)
    {
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
            for (var i = 0; i < this.view.getRowCount(); i++)
            {
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

    this.renamePage = function(page)
    {
        var oldName = null;
        if (!page) {
            page = this.getPageByIndex();
            if (!page) return false;

            oldName = page.getName();
        }
        var pageName = prompt(this.sb.getString("enterNameOfPage"), page.getName());
        if (!this.checkPageName(pageName)) return false;
        if (oldName) {
            yarip.map.remove(page);
            page.setName(pageName, true);
        } else {
            page = page.clone(true, pageName);
        }
        yarip.map.add(page);
        page.setTemporary(false);

        this.refreshPages(true);
        this.selectPageByName(pageName);
        return true;
    }

    this.removePages = function()
    {
        var currentIndex = this.treePages.currentIndex;
        if (currentIndex < 0) return;

        var index = currentIndex;
        var pageNames = {};
        var selection = this.view.selection;
        var rangeCount = selection.getRangeCount();
        for (var i = 0; i < rangeCount; i++)
        {
            var start = {};
            var end = {};
            selection.getRangeAt(i, start, end);
            for (var j = start.value; j <= end.value; j++) {
                pageNames[this.getPageByIndex(j).getName()] = true;
            }
        }
        for (var pageName in pageNames) yarip.map.removeByName(pageName);
        this.refreshPages(true);
    }

    this.refreshPages = function(load, dontSelect)
    {
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
        this.tabs["elementWhitelist"].list = page.elementWhitelist;
        this.tabs["elementBlacklist"].list = page.elementBlacklist;
        this.tabs["elementAttributeList"].list = page.elementAttributeList;
        this.tabs["elementScriptList"].list = page.elementScriptList;
        this.tabs["contentWhitelist"].list = page.contentWhitelist;
        this.tabs["contentBlacklist"].list = page.contentBlacklist;
        this.tabs["contentRequestHeaderList"].list = page.contentRequestHeaderList;
        this.tabs["contentResponseHeaderList"].list = page.contentResponseHeaderList;
        this.tabs["contentRedirectList"].list = page.contentRedirectList;
//        this.tabs["contentStreamList"].list = page.contentStreamList;
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
//        this.tabs["contentStreamList"].tab.setAttribute("label", this.sb.getFormattedString("stream-tab", [this.tabs["contentStreamList"].list.length]));
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

        if (this.treePages.currentIndex >= 0)
        {
            var list = page.pageExtensionList;
            for each (var item in list.obj) {
                if (!item.getPage()) yarip.map.removeExtension(page, item);
            }
            list = page.pageExtendedByList;
            for each (var item in list.obj) {
                if (!item.getPage()) yarip.map.removeExtension(page, item);
            }
        }

        this.refreshTab(null, true);
        this.refreshExtMenulist(load);
    }

    this.importFiles = function()
    {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(window, this.sb.getString("importPages"), nsIFilePicker.modeOpenMultiple);
        fp.appendFilters(nsIFilePicker.filterXML);
        var res = fp.show();
        if (res != nsIFilePicker.returnOK) return;
        var files = fp.files;
        var pageName = null;
        var pName = null;
        while (files.hasMoreElements()) {
            pName = yarip.load(files.getNext(), true);
            if (pName) pageName = pName;
        }
//        if (pageName) {
            this.refreshPages(true);
        if (pageName) {
            var page = this.selectPageByName(pageName);
            this.selectTab(page);
        }
    }

    this.getDateString = function()
    {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1
        var day = now.getDate();
        return year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
    }

    this.exportPages = function()
    {
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

    this.exportAll = function()
    {
        var dateStr = this.getDateString();
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(window, this.sb.getString("exportPages"), nsIFilePicker.modeSave);
        fp.appendFilters(nsIFilePicker.filterXML);
        fp.defaultString = dateStr + "_yarip.xml";
        var res = fp.show();
        if (res === nsIFilePicker.returnOK || res === nsIFilePicker.returnReplace)
        {
            var map = yarip.map.clone();
            map.purge();
            var data = map.generateXml(true);
            yarip.saveToFile(data, fp.file);
        }
    }

    this.save = function()
    {
        yarip.save();
    }

    this.refreshTab = function(tab, load, update, key)
    {
        if (!tab)
        {
            this.refreshTab("elementWhitelist", load);
            this.refreshTab("elementBlacklist", load);
            this.refreshTab("elementAttributeList", load);
            this.refreshTab("elementScriptList", load);
            this.refreshTab("contentWhitelist", load);
            this.refreshTab("contentBlacklist", load);
            this.refreshTab("contentRequestHeaderList", load);
            this.refreshTab("contentResponseHeaderList", load);
            this.refreshTab("contentRedirectList", load);
//            this.refreshTab("contentStreamList", load);
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
            + this.tabs["contentRedirectList"].list.length;
//            + this.tabs["contentStreamList"].list.length;
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
//        case "contentStreamList":
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
//                case "contentStreamList": this.tabs[tab].item = new YaripStreamItem(); break;
                case "pageStyleList": this.tabs[tab].item = new YaripStyleItem(); break;
                case "pageScriptList": this.tabs[tab].item = new YaripPageScriptItem(); break;
                case "pageRedirectList": this.tabs[tab].item = new YaripRedirectItem(); break;
                case "pageStreamList": this.tabs[tab].item = new YaripStreamItem(); break;
                case "pageRequestHeaderList": this.tabs[tab].item = new YaripHeaderItem(); break;
                case "pageResponseHeaderList": this.tabs[tab].item = new YaripHeaderItem(); break;
                }
                if (!key) {
//                    tree.focus();
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
            }

            switch (tab) {
            case "elementScriptList":
            case "contentRequestHeaderList":
            case "contentResponseHeaderList":
            case "contentRedirectList":
//            case "contentStreamList":
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

        if (key && (load || update))
        {
            if (key) {
                for (var i = 0; i < list.length; i++) {
                    if (key == list.get(i, LIST_INDEX_KEY)) {
                        tree.currentIndex = i;
                        tree.view.selection.select(i);
//                        try{tree.view.treebox.ensureRowIsVisible(i);}catch(e){}
//                        tree.focus();
                        break;
                    }
                }
            }
        }
    }

    this.reloadPage = function(pageName, refreshPages, selectPage, selectTab, resetFilter, type, key)
    {
        var page = null;
        if (refreshPages) {
            if (!selectPage) {
                page = this.getPageByIndex();
                if (page) {
                    pageName = page.getName();
                    selectPage = true;
                }
            }
            this.refreshPages(true);
            this.refreshExtMenulist(true);
        }

        var tab = null;
        if (selectPage) {
            page = this.getPageByName(pageName);
            if (page) {
//                this.resetFilter();
//                tab = this.selectPageByName(pageName, !resetFilter);
                page = this.selectPageByName(pageName, !resetFilter);
            } else {
//                this.selectPageByName(); // unselect
                this.selectPageByIndex(0); // select first
                selectTab = true;
            }
        }

        if (selectTab) {
            if (type) {
                this.selectTab(page, type, key);
            } else {
                this.refreshTab(null, true);
            }
        }
    }

    this.handleEvent = function(event)
    {
        if (!event) return;

        switch(event.target.id) {
        case "yarip-edit-menupopup":
            switch (event.type) {
            case "popupshowing":
                var disabled = this.tabs[this.tab].tree.view.selection.getRangeCount() <= 0;
                var rowCount = this.tabs[this.tab].tree.view.rowCount;
                var gotoHidden = this.tab != "pageExtensionList" && this.tab != "pageExtendedByList";
                document.getElementById("cmd_cut").setAttribute("disabled", "" + (disabled || this.tab === "pageExtendedByList"));
                document.getElementById("cmd_copy").setAttribute("disabled", "" + (disabled || this.tab === "pageExtendedByList"));
                document.getElementById("cmd_paste").setAttribute("disabled", "" + !this.page);
                document.getElementById("yarip-goto-menuseparator").setAttribute("hidden", "" + gotoHidden);
                document.getElementById("yarip-goto-menuitem").setAttribute("hidden", "" + gotoHidden);
                document.getElementById("yarip-goto-menuitem").setAttribute("disabled", "" + disabled);
                document.getElementById("yarip-goto-menuitem").disabled = disabled;
                document.getElementById("cmd_goto").setAttribute("disabled", "" + disabled);
//                document.getElementById("cmd_selectall").setAttribute("disabled", "" + (rowCount > 0));
            }
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
//        case "contentRedirectList-tree":
//        case "pageRedirectList-tree":
        case "pageExtensionList-tree":
        case "pageExtendedByList-tree":
            this.refreshTab(this.tab);
            break;

        case "elementScriptList-tree":
        case "contentRequestHeaderList-tree":
        case "contentResponseHeaderList-tree":
        case "contentRedirectList-tree":
//        case "contentStreamList-tree":
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

    this.initTab = function(tab)
    {
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
//        case "contentStreamList":
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
        case "elementScriptList":
        case "contentRequestHeaderList":
        case "contentResponseHeaderList":
        case "contentRedirectList":
//        case "contentStreamList":
        case "pageStyleList":
        case "pageScriptList":
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

        case "pageExtensionList":
            this.tabs[tab].menulist = document.getElementById(tab + "-menulist");
            break;
        }
    }

    this.refreshExtMenulist = function(load)
    {
        if (load)
        {
            var menupopup = document.createElement("menupopup");
            yarip.map.tree.traverse(function(node) {
                var page = node.value;
                if (page) {
                    var menuitem = document.createElement("menuitem");
                    menuitem.setAttribute("label", page.getName());
                    menuitem.setAttribute("value", page.getId());
                    menupopup.appendChild(menuitem);
                }
            });
            this.tabs["pageExtensionList"].menulist.replaceChild(menupopup, this.tabs["pageExtensionList"].menulist.firstChild);
        }

        if (this.tabs["pageExtensionList"].menulist.firstChild.childNodes.length > 0) {
            if (this.tabs["pageExtensionList"].menulist.selectedIndex < 0) {
                this.tabs["pageExtensionList"].menulist.selectedIndex = 0;
            }
            this.tabs["pageExtensionList"].item.setId(this.tabs["pageExtensionList"].menulist.selectedItem.getAttribute("value"));
        }
    }

    this.load = function()
    {
        yarip.pageDialog = this;

        var pageName = null;
        var type = null;
        var key = null;
        if ("arguments" in window && window.arguments.length > 0) {
            pageName = window.arguments[0];
            type = window.arguments[1];
            key = window.arguments[2];
        }

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
//        this.initTab("contentStreamList");
        this.initTab("pageStyleList");
        this.initTab("pageScriptList");
        this.initTab("pageHeader");
        this.initTab("pageRequestHeaderList");
        this.initTab("pageResponseHeaderList");
        this.initTab("pageRedirectList");
        this.initTab("pageStreamList");
        this.initTab("pageExtensionList");
        this.initTab("pageExtendedByList");

        // Bug 708196: https://bugzilla.mozilla.org/show_bug.cgi?id=708196
        var fun = function (treeId) {
                document.getElementById(treeId).inputField.addEventListener("keypress", function (event) {
                        if (event.keyCode >= event.DOM_VK_PAGE_UP && event.keyCode <= event.DOM_VK_DOWN) {
                            event.stopPropagation();
                        }
                    }, false);
            };
        fun("tree-pages");
        fun("elementWhitelist-tree");
        fun("elementBlacklist-tree");
        fun("elementAttributeList-tree");
        fun("elementScriptList-tree");
        fun("contentWhitelist-tree");
        fun("contentBlacklist-tree");
        fun("contentRequestHeaderList-tree");
        fun("contentResponseHeaderList-tree");
        fun("contentRedirectList-tree");
        fun("pageStyleList-tree");
        fun("pageScriptList-tree");
        fun("pageRequestHeaderList-tree");
        fun("pageResponseHeaderList-tree");
        fun("pageRedirectList-tree");
        fun("pageStreamList-tree");
        fun("pageExtensionList-tree");
        fun("pageExtendedByList-tree");

        this.refreshPages(true);

        if (pageName) {
            var page = this.selectPageByName(pageName);
            this.selectTab(page, type, key);
        }
    }

    this.unload = function()
    {
        yarip.pageDialog = null;
        yarip.save();

        this.treePages.removeEventListener("select", this, false);
        this.tabs["elementWhitelist"].tree.removeEventListener("select", this, false);
        this.tabs["elementBlacklist"].tree.removeEventListener("select", this, false);
        this.tabs["elementAttributeList"].tree.removeEventListener("select", this, false);
        this.tabs["elementScriptList"].tree.removeEventListener("select", this, false);
        this.tabs["contentWhitelist"].tree.removeEventListener("select", this, false);
        this.tabs["contentBlacklist"].tree.removeEventListener("select", this, false);
        this.tabs["contentRequestHeaderList"].tree.removeEventListener("select", this, false);
        this.tabs["contentResponseHeaderList"].tree.removeEventListener("select", this, false);
        this.tabs["contentRedirectList"].tree.removeEventListener("select", this, false);
//        this.tabs["contentStreamList"].tree.removeEventListener("select", this, false);
        this.tabs["pageStyleList"].tree.removeEventListener("select", this, false);
        this.tabs["pageScriptList"].tree.removeEventListener("select", this, false);
        this.tabs["pageRequestHeaderList"].tree.removeEventListener("select", this, false);
        this.tabs["pageResponseHeaderList"].tree.removeEventListener("select", this, false);
        this.tabs["pageRedirectList"].tree.removeEventListener("select", this, false);
        this.tabs["pageStreamList"].tree.removeEventListener("select", this, false);
        this.editMenupopup.removeEventListener("popupshowing", this, false);
    }

    this.resetFilter = function()
    {
        this.filterString = null;
        document.getElementById("yarip-pageFilter-textbox").value = "";
        this.filterPages();
    }

    this.filterPages = function(event)
    {
        this.filterString = event ? event.target.value : this.filterString;
        this.view.applyFilterString(this.filterString, this.treePages.currentIndex);
        this.refreshTab(null, true);
    }
}

function YaripPageTreeView()
{
    this.treebox = null;
    this.visibleData = [];
    this.filterString = null;
    this.filterRegExp = null;
    this.filterError = false;
    this.rowCount = this.visibleData.length;

    this.getRowCount = function() { return this.visibleData.length; }

    this.cycleHeader = function(col) {}
    this.getCellProperties = function(row, col, props) {}
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
    this.getColumnProperties = function(colid, col, props) {}
    this.getImageSrc = function(row, col) { return null; }
    this.getLevel = function(row) { return 0; }
    this.getRowProperties = function(row, props) {}
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
        yarip.map.remove(page);
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
        dialog.selectPageByName(value, true);
    }
    this.setTree = function(treebox) { this.treebox = treebox; }

    this.getPageByIndex = function(index)
    {
        if (index < 0 || index >= this.visibleData.length) return null;

        return this.visibleData[index];
    }

    this.applyFilterString = function(value, currentIndex, treeView)
    {
        var tv = treeView ? treeView : this;
        var prevRowCount = tv.visibleData.length;
        var currentPage = currentIndex >= 0 ? tv.visibleData[currentIndex] : null;
        tv.filterString = value != "" ? value : null;
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

    this.allowPage = function(page, treeView)
    {
        var tv = treeView ? treeView : this;
        return !tv.filterError && (!tv.filterRegExp || tv.filterRegExp.test(page.getName()));
    }

    this.purge = function()
    {
        this.applyFilterString(null, -1);
    }
}

function YaripListTreeView(list)
{
    this.treebox = null;
    this.rowCount = list.length;
    this.getRowCount = function() { return this.rowCount; }
    this.cycleHeader = function(col) {}
    this.getCellProperties = function(row, col, props) {}
    this.getCellText = function(row, col) { return list.get(row, col.index); }
    this.getCellValue = function(row, col) { return list.get(row, col.index); }
    this.getColumnProperties = function(colid, col, props) {}
    this.getImageSrc = function(row, col) { return null; }
    this.getLevel = function(row) { return 0; }
    this.getRowProperties = function(row, props) {}
    this.isContainer = function(row) { return false; }
    this.isEditable = function(row, col) { return col.element.getAttribute("editable"); }
    this.isSeparator = function(row) { return false; }
    this.isSorted = function(row) { return false; }
    this.setCellText = function(row, col, value) { this.setCellValue(row, col, value); }
    this.setCellValue = function(row, col, value) {
        switch (list.getName()) {
        case "extension":
            var oldNew = list.set(row, col.index, value);
            if (oldNew) {
                var page = dialog.getPageByIndex();
                yarip.map.removeExtension(page, oldNew[0]);
                yarip.map.addExtension(page, oldNew[1]);
                this.treebox.invalidate();
                dialog.refreshTab(dialog.tab, null, true, oldNew[1].getKey());
            } else {
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
            break;
        }
    }
    this.setTree = function(treebox) { this.treebox = treebox; }
}

