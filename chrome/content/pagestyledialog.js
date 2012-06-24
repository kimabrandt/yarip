
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

function YaripPageStyleDialog()
{
    this.sb = null;
    this.pageMenulist = null;
    this.xpathTextbox = null;
    this.styleTextbox = null;
    this.doc = null;
    this.obj = null;
    this.xpath = null;

    this.setXPath = function(value)
    {
        if (!this.obj) return;
        this.obj.item.setXPath(value);
    }

    this.setStyle = function(value)
    {
        if (!this.obj) return;
        this.obj.item.setStyle(value);
    }

    this.highlight = function()
    {
        if (!this.doc) return;

        if (this.xpath) this.unHighlight(this.doc, this.xpath);
        this.xpath = null;
        var xpath = this.obj.item.getXPath();
        if (!yarip.highlight(this.doc, xpath)) {
            alert(this.sb.getString("ERR_INVALID_XPATH"));
            throw new Error(this.sb.getFormattedString("ERR_INVALID_XPATH1", [xpath]));
        }
        this.xpath = xpath;
    }

    this.unHighlight = function(doc, xpath)
    {
        yarip.unHighlight(doc, xpath);
    }

    this.removeIndexes = function()
    {
        var xpath = this.xpathTextbox.value.replace(/\[\d+\]/g, "");
        this.xpathTextbox.value = xpath;
        this.setXPath(xpath);
    }

    this.load = function()
    {
        if (!("arguments" in window) || window.arguments.length < 2) return;

        this.doc = window.arguments[0];
        this.obj = window.arguments[1];
        if (!this.obj) return;

        this.sb = document.getElementById("stringbundle");
        this.pageMenulist = document.getElementById("page");
        this.xpathTextbox = document.getElementById("xpath");
        this.styleTextbox = document.getElementById("style");

        var pageName = this.obj.pageName;
        this.pageMenulist.value = pageName;
        this.xpathTextbox.value = this.obj.item.getXPath();
        this.xpathTextbox.focus();
        this.xpathTextbox.select();
        this.styleTextbox.value = this.obj.item.getStyle();

        if (!this.doc) {
            this.pageMenulist.disabled = true;
            document.getElementById("highlight").disabled = true;
            return;
        }

        var location = yarip.getLocation(this.doc.location);
        if (location) {
            var aMap = yarip.getAddressMap(location.asciiHref);
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
        var xpath = null;
        if (this.doc) {
            this.unHighlight(this.doc, this.xpath);
            if (!this.obj) return;

            var pageName = this.pageMenulist.value;
            if (!yarip.checkPageName(pageName)) {
                this.pageMenulist.focus();
                this.pageMenulist.select();
                alert(this.sb.getString("ERR_INVALID_PAGE_NAME"));
                throw new Error(this.sb.getFormattedString("ERR_INVALID_PAGE_NAME2", [this.doc.location, xpath]));
            }

            xpath = this.obj.item.getXPath();
            if (!yarip.checkXPath(xpath)) {
                this.xpathTextbox.focus();
                this.xpathTextbox.select();
                alert(this.sb.getString("ERR_INVALID_XPATH"));
                throw new Error(this.sb.getFormattedString("ERR_INVALID_XPATH1", [xpath]));
            }

            var elements = yarip.getElements(this.doc, xpath);
            if (!elements || elements.snapshotLength === 0) {
                this.xpathTextbox.focus();
                this.xpathTextbox.select();
                alert(this.sb.getString("ERR_NO_ELEMENTS_FOUND"));
                throw new Error(this.sb.getFormattedString("ERR_NO_ELEMENTS_FOUND2", [this.doc.location, xpath]));
            }

            this.obj.pageName = pageName;
        } else {
            if (!this.obj) return;

            xpath = this.obj.item.getXPath();
            if (!yarip.checkXPath(xpath)) {
                this.xpathTextbox.focus();
                this.xpathTextbox.select();
                alert(this.sb.getString("ERR_INVALID_XPATH"));
                throw new Error(this.sb.getFormattedString("ERR_INVALID_XPATH1", [xpath]));
            }
        }

        FH.addEntry("xpath", xpath);
    }

    this.cancel = function()
    {
        if (this.doc) this.unHighlight(this.doc, this.xpath);
        if (this.obj) this.obj.item = null;
    }
}
