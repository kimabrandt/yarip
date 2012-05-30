
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

function YaripContentDialog()
{
    this.sb = null;
    this.pageMenulist = null;
    this.regexpTextbox = null;
    this.obj = null;

    this.removeSubDomain = function()
    {
        if (!this.obj) return;
        var tld = TLD.replace(/\\./g, "\\\\\\.");
//        var re = new RegExp("(^\\^http(?:s\\??)?:\\/\\/)(?:[^/?#]+\\\\\\.)?([^/?#]+\\\\\\." + TLD + PORT + "(?:\\[\\/\\?#\\]|[/?#].*)?)$", "i");
//ok        var re = new RegExp("(^\\^http(?:s\\??)?:\\/\\/)(?:\\w+?\\\\\\.((?=" + tld + "\\\\\\.)|(?!" + tld + "\\b)))*(\\w+?\\\\\\." + tld + PORT + "(?:\\[\\/\\?#\\]|[/?#].*)?)$", "i");
//ok        var re = new RegExp("(^\\^http(?:s\\??)?:\\/\\/)(?:[^/?#]+?\\\\\\.(?:(?=" + tld + "\\\\\\.)|(?!" + tld + "\\b)))*([^/?#]+?\\\\\\." + tld + PORT + "(?:\\[\\/\\?#\\]|[/?#].*)?)$", "i");
        var re = new RegExp("(^\\^http(?:s\\??)?:\\/\\/)(?:(?!\\w+\\\\\\." + tld + PORT + "(?:\\[\\/\\?#\\]|[/?#$].*)?$)\\w+\\\\\\.)+(\\w+\\\\\\." + tld + PORT + "(?:\\[\\/\\?#\\]|[/?#$].*)?)$", "i");
        if (!re.test(this.regexpTextbox.value)) return;
//        var regExp = this.regexpTextbox.value.replace(re, "$1([^/?#]+\\.)?$2");
        var regExp = this.regexpTextbox.value.replace(re, "$1([^/?#]+\\.)?$4");
        this.regexpTextbox.value = regExp;
        this.obj.item.setRegExp(regExp);
    }

    this.removePath = function()
    {
        if (!this.obj) return;
//        var re = new RegExp("(^\\^http(?:s\\??)?:\\/\\/(?:(?:\\d+\\\\\\.){3}\\d+|(?:\\(\\[\\^/\\?#\\]\\+\\\\\\.\\)\\?)?(?:[^/?#]+\\\\\\.)*[^/?#]+\\\\\\." + TLD + ")" + PORT + ")[/?#].*$", "i");
        var re = new RegExp("(^\\^http(?:s\\??)?:\\/\\/(?:(?:\\d+\\\\\\.){3}\\d+|(?:\\(\\[\\^/\\?#\\]\\+\\\\\\.\\)\\?)?(?:[^/?#]+\\\\\\.)*[^/?#]+\\\\\\." + TLD.replace(/\\./g, "\\\\\\.") + ")" + PORT + ")[/?#].*$", "i");
        if (!re.test(this.regexpTextbox.value)) return;
        var regExp = this.regexpTextbox.value.replace(re, "$1[/?#]");
        this.regexpTextbox.value = regExp;
        this.obj.item.setRegExp(regExp);
    }

    this.removeQueryFragment = function()
    {
        if (!this.obj) return;
//        var re = new RegExp("^\\^http(?:s\\??)?:\\/\\/(?:(?:\\d+\\\\\\.){3}\\d+|(?:\\(\\[\\^/\\?#\\]\\+\\\\\\.\\)\\?)?(?:[^/?#]+\\\\\\.)*[^/?#]+\\\\\\." + TLD + ")" + PORT + "(?:[/?#].*)?(?!\\b)$", "i");
        var re = new RegExp("^\\^http(?:s\\??)?:\\/\\/(?:(?:\\d+\\\\\\.){3}\\d+|(?:\\(\\[\\^/\\?#\\]\\+\\\\\\.\\)\\?)?(?:[^/?#]+\\\\\\.)*[^/?#]+\\\\\\." + TLD.replace(/\\./g, "\\\\\\.") + ")" + PORT + "(?:[/?#].*)?(?!\\b)$", "i");
        if (!re.test(this.regexpTextbox.value)) return;
        var regExp = this.regexpTextbox.value.replace(/(?:(?:\\\?|#(?!\])).*)?\$?$/, "\\b");
        this.regexpTextbox.value = regExp;
        this.obj.item.setRegExp(regExp);
    }

    this.load = function()
    {
        if (!("arguments" in window) || window.arguments.length < 1) return;

        this.obj = window.arguments[0];
        if (!this.obj) return;

        this.sb = document.getElementById("stringbundle");
        this.pageMenulist = document.getElementById("page");
        this.regexpTextbox = document.getElementById("regExp");

        var pageName = this.obj.pageName;
        this.pageMenulist.value = pageName;
        this.regexpTextbox.value = this.obj.item.getRegExp();
        this.regexpTextbox.focus();
        this.regexpTextbox.select();

//        if (this.obj.buttonsDisabled) {
//            this.pageMenulist.disabled = true;
//            document.getElementById("noSubDomain").disabled = true;
//            document.getElementById("noQueryFragment").disabled = true;
//            return;
//        }

        var location = "itemLocation" in this.obj ? yarip.getLocationFromLocation(this.obj.itemLocation) : null;
        if (location) {
            var content = "itemContent" in this.obj ? yarip.getContentLocationFromContentLocation(this.obj.itemContent) : null;
//            var aMap = yarip.getAddressMap([location.asciiHref, content ? content.asciiSpec : null], true, { content: true });
            var aMap = yarip.getAddressMap(content ? [location.asciiHref, content.asciiSpec] : location.asciiHref, true, { content: true });
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_PAGE)));
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_FQDN)));
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_SLD)));
            var menupopup = document.getElementById("page-menupopup");
            var createMenuitem = this.createMenuitem;
            aMap.tree.traverse(function(node) { if (node.value) createMenuitem(menupopup, node.value.getName()); });
        } else {
            this.pageMenulist.disabled = true;
            return;
        }
    }

    this.createMenuitem = function(menupopup, address)
    {
        if (!address) return;

        var menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", address);
        menuitem.setAttribute("value", address);
        menupopup.appendChild(menuitem);
    }

    this.accept = function()
    {
        if (!this.obj) return;

        var msg = null;
        var pageName = this.pageMenulist.value;
        if (!yarip.checkPageName(pageName)) {
            this.pageMenulist.focus();
            this.pageMenulist.select();
            msg = this.sb.getString("ERR_INVALID_PAGE_NAME");
            alert(msg);
            throw new YaripException(msg);
        }

        var regExp = this.regexpTextbox.value;
        if (!yarip.checkRegExp(regExp)) {
            this.regexpTextbox.focus();
            this.regexpTextbox.select();
            msg = this.sb.getString("ERR_INVALID_REGEXP");
            alert(msg);
            throw new YaripException(msg);
        }

        this.obj.item.setRegExp(regExp);
        this.obj.pageName = pageName;
        FH.addEntry("regexp", regExp);
    }

    this.cancel = function()
    {
        if (this.obj) this.obj.item = null;
    }
}
