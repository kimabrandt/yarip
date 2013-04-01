
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

function YaripCreatePageDialog()
{
    this.sb = null;
    this.pageMenulist = null;
    this.obj = null;

    this.load = function()
    {
        if (!("arguments" in window) || window.arguments.length < 1) return;

        this.obj = window.arguments[0];
        if (!this.obj) return;

        this.sb = document.getElementById("stringbundle");
        this.pageMenulist = document.getElementById("page");

        var pageName = this.obj.pageName;
        this.pageMenulist.value = pageName;

        var location = "location" in this.obj ? yarip.getLocation(this.obj.location) : null;
        if (location) {
            var content = "content" in this.obj ? yarip.getLocation(this.obj.content) : null;
            var aMap = yarip.getAddressMap([location.asciiHref, content ? content.asciiHref : null]);
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_PAGE)));
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_FQDN)));
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_SLD)));
            if (content) {
                aMap.add(new YaripPage(null, yarip.getPageName(content, MODE_PAGE)));
                aMap.add(new YaripPage(null, yarip.getPageName(content, MODE_FQDN)));
                aMap.add(new YaripPage(null, yarip.getPageName(content, MODE_SLD)));
            }
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
        this.obj.pageName = pageName;
    }

    this.cancel = function()
    {
        if (this.obj) this.obj.pageName = null;
    }
}
