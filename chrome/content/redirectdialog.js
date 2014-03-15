
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

function YaripRedirectDialog()
{
    this.sb = null;
    this.pageMenulist = null;
    this.regExpTextbox = null;
    this.newsubstrTextbox = null;
    this.obj = null;

    var tld = TLD.replace(/\\./g, "\\\\.");
    var subDomainRE = new RegExp("(^\\^http(?:s\\??)?:\\/\\/)(?:(?!" + SIMPLE + "\\\\." + tld + PORT + "(?:(?:\\(:\\\\d\\+\\)\\?)?\\[\\/\\?#\\]|[/?#$].*)?$)" + SIMPLE + "\\\\.)*(" + SIMPLE + "\\\\." + tld + PORT + "(?:(?:\\(:\\\\d\\+\\)\\?)?\\[\\/\\?#\\]|[/?#$].*)?)$", "i");
    var pathRE = new RegExp("(^\\^http(?:s\\??)?:\\/\\/(?:(?:\\d+\\\\.){3}\\d+|(?:\\(\\[\\^/\\?#\\]\\+(?:\\[\\.@\\]|\\\\.)\\)\\?)?(?:[^/?#]+[.@])*[^/?#]+\\." + TLD.replace(/\\./g, "\\\\.") + ")" + PORT + ")[/?#].*$", "i");
    var queryFragmentRE = new RegExp("^\\^http(?:s\\??)?:\\/\\/(?:(?:\\d+\\\\.){3}\\d+|(?:\\(\\[\\^/\\?#\\]\\+(?:\\[\\.@\\]|\\\\.)\\)\\?)?(?:[^/?#]+[.@])*[^/?#]+\\." + TLD.replace(/\\./g, "\\\\.") + ")" + PORT + "(?:[/?#].*)?(?!\\b)$", "i");

    this.removeSubDomain = function()
    {
        if (!this.obj) return;
        if (!subDomainRE.test(this.regExpTextbox.value)) return;

        var regExp = this.regExpTextbox.value.replace(subDomainRE, "$1([^/?#]+" + (yarip.matchAuthorityPort ? "[.@]" : "\\.") + ")?$6");
        this.regExpTextbox.value = regExp;
        this.obj.item.setRegExp(regExp);
    }

    var URI_INDEX = 1;
//    var TLD_INDEX = 2;
    var PORT_INDEX = 3;

    this.removePath = function()
    {
        if (!this.obj) return;
        if (!pathRE.test(this.regExpTextbox.value)) return;

        var matches = this.regExpTextbox.value.match(pathRE);
        var regExp = matches[URI_INDEX].replace(/:\d+$/, "") + (matches[PORT_INDEX] && yarip.matchAuthorityPort ? "(:\\d+)?" : "") + "[/?#]";
        this.regExpTextbox.value = regExp;
        this.obj.item.setRegExp(regExp);
    }

    this.removeQueryFragment = function()
    {
        if (!this.obj) return;
        if (!queryFragmentRE.test(this.regExpTextbox.value)) return;

        var regExp = this.regExpTextbox.value.replace(/(?:(?:\\\?|#(?!\])).*)?\$?$/, "\\b");
        this.regExpTextbox.value = regExp;
        this.obj.item.setRegExp(regExp);
    }

    this.load = function()
    {
        if (!("arguments" in window) || window.arguments.length < 1) return;

        this.obj = window.arguments[0];
        if (!this.obj) return;

        this.sb = document.getElementById("stringbundle");
        this.pageMenulist = document.getElementById("page");
        this.regExpTextbox = document.getElementById("regExp");
        this.newsubstrTextbox = document.getElementById("newsubstr");

        var pageName = this.obj.pageName;
        this.pageMenulist.value = pageName;
        this.regExpTextbox.value = this.obj.item.getRegExp();
        this.regExpTextbox.focus();
        this.regExpTextbox.select();
        this.newsubstrTextbox.value = this.obj.item.getScript();

        var location = "location" in this.obj ? yarip.getLocation(this.obj.location) : null;
        if (location) {
            var aMap = yarip.getAddressMap(location.asciiHref, true, { content: true });
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

        var pageName = this.pageMenulist.value;
        if (!yarip.checkPageName(pageName)) {
            this.pageMenulist.focus();
            this.pageMenulist.select();
            alert(this.sb.getString("ERR_INVALID_PAGE_NAME"));
            throw new Error(this.sb.getFormattedString("ERR_INVALID_PAGE_NAME1", [pageName]));
        }

        var regExp = this.regExpTextbox.value;
        if (!yarip.checkRegExp(regExp)) {
            this.regExpTextbox.focus();
            this.regExpTextbox.select();
            alert(this.sb.getString("ERR_INVALID_REGEXP"));
            throw new Error(this.sb.getFormattedString("ERR_INVALID_REGEXP1", [regExp]));
        }

        var newSubStr = this.newsubstrTextbox.value;

        this.obj.item.setRegExp(regExp);
        this.obj.item.setScript(newSubStr);
        this.obj.pageName = pageName;

        FH.update({ "op": "add", fieldname: "regexp", "value": regExp }, null);
    }

    this.cancel = function()
    {
        if (this.obj) this.obj.item = null;
    }
}
