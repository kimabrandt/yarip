
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

function YaripPageExtendDialog()
{

    this.pageMenulist = null;
    this.contentMenulist = null;
    this.obj = null;

    this.load = function()
    {
        if (!("arguments" in window) || window.arguments.length < 1) return;

        this.obj = window.arguments[0];
        if (!this.obj) return;

        this.stringbundle = document.getElementById("pageExtendDialog-dialog-stringbundle");
        this.pageMenulist = document.getElementById("page");
        this.contentMenulist = document.getElementById("content");

        this.pageMenulist.value = this.obj.pageName;
        this.contentMenulist.value = this.obj.contentAddress;
        document.getElementById("element-checkbox").checked = this.obj.extItem.getDoElements();
        document.getElementById("content-checkbox").checked = this.obj.extItem.getDoContents();
        document.getElementById("script-checkbox").checked = this.obj.extItem.getDoScripts();
        document.getElementById("header-checkbox").checked = this.obj.extItem.getDoHeaders();
        document.getElementById("redirect-checkbox").checked = this.obj.extItem.getDoRedirects();
        document.getElementById("stream-checkbox").checked = this.obj.extItem.getDoStreams();
        document.getElementById("link-checkbox").checked = this.obj.extItem.getDoLinks();

        var location = yarip.getLocation(this.obj.location);
        if (location) {
//            var aMap = yarip.getAddressMap(location.asciiHref);
            var aMap = yarip.getAddressMap(location.asciiHref, true, { content: true });
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_PAGE)));
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_FQDN)));
            aMap.add(new YaripPage(null, yarip.getPageName(location, MODE_SLD)));
            var menupopup = document.getElementById("page-menupopup");
            var createMenuitem = this.createMenuitem;
            aMap.tree.traverse(function(node) { if (node.value) createMenuitem(menupopup, node.value.getName()); });
        }
        var content = yarip.getLocation(this.obj.content);
        if (content) {
            var aMap = yarip.getAddressMap(content.asciiHref, true, { content: true }, true /* reverse */);
            aMap.add(new YaripPage(null, yarip.getPageName(content, MODE_PAGE)));
            aMap.add(new YaripPage(null, yarip.getPageName(content, MODE_FQDN)));
            aMap.add(new YaripPage(null, yarip.getPageName(content, MODE_SLD)));
            var menupopup = document.getElementById("content-menupopup");
            var createMenuitem = this.createMenuitem;
            aMap.tree.traverse(function(node) { if (node.value) createMenuitem(menupopup, node.value.getName()); });
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

        this.obj.pageName = this.pageMenulist.value;
        this.obj.contentAddress = this.contentMenulist.value;
        this.obj.extItem.setDoElements(document.getElementById("element-checkbox").checked);
        this.obj.extItem.setDoContents(document.getElementById("content-checkbox").checked);
        this.obj.extItem.setDoScripts(document.getElementById("script-checkbox").checked);
        this.obj.extItem.setDoHeaders(document.getElementById("header-checkbox").checked);
        this.obj.extItem.setDoRedirects(document.getElementById("redirect-checkbox").checked);
        this.obj.extItem.setDoStreams(document.getElementById("stream-checkbox").checked);
        this.obj.extItem.setDoLinks(document.getElementById("link-checkbox").checked);
    }

    this.cancel = function()
    {
        this.obj.pageName = null;
        this.obj.contentAddress = null;
        this.obj.extItem = null;
    }
}
