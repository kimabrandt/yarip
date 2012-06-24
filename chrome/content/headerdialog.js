
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

function YaripHeaderDialog()
{
    this.sb = null;
    this.pageMenulist = null;
    this.regexpTextbox = null;
    this.headerNameTextbox = null;
    this.scriptTextbox = null;
    this.obj = null;

    this.setScript = function(value)
    {
        if (!this.obj) return;
        this.obj.item.setScript(value);
    }

    this.load = function()
    {
        if (!("arguments" in window) || window.arguments.length < 1) return;

        this.obj = window.arguments[0];
        if (!this.obj) return;

        this.sb = document.getElementById("stringbundle");
        this.pageMenulist = document.getElementById("page");
        this.regexpTextbox = document.getElementById("regExp");
        this.headerNameTextbox = document.getElementById("headerName");
        this.scriptTextbox = document.getElementById("script");

        var pageName = this.obj.pageName;
        this.pageMenulist.value = pageName;
        this.regexpTextbox.value = this.obj.item.getRegExp();
        this.regexpTextbox.focus();
        this.regexpTextbox.select();
        this.headerNameTextbox.value = this.obj.item.getHeaderName();
        this.scriptTextbox.value = this.obj.item.getScript();

        var location = "itemLocation" in this.obj ? yarip.getLocation(this.obj.itemLocation) : null;
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

        var regexp = this.regexpTextbox.value;
        if (!yarip.checkRegExp(regexp)) {
            this.regexpTextbox.focus();
            this.regexpTextbox.select();
            alert(this.sb.getString("ERR_INVALID_REGEXP"));
            throw new Error(this.sb.getFormattedString("ERR_INVALID_REGEXP1", [regexp]));
        }

        var headerName = this.headerNameTextbox.value;

        this.obj.item.setRegExp(regexp);
        this.obj.item.setHeaderName(headerName);
        this.obj.pageName = pageName;
        FH.addEntry("regexp", regexp);
        FH.addEntry("header_name", headerName);
    }

    this.cancel = function()
    {
        if (this.obj) this.obj.item = null;
    }
}
