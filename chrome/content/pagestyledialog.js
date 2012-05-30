
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
    this.xValue = null;

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

        if (this.xValue) this.unHighlight(this.doc, this.xValue);
        this.xValue = null;
        var xValue = this.obj.item.getXPath();
        if (!yarip.highlight(this.doc, xValue))
        {
            var msg = this.sb.getString("ERR_INVALID_XPATH");
            alert(msg);
            throw new YaripException(msg);
        }
        this.xValue = xValue;
    }

    this.unHighlight = function(doc, xValue)
    {
        yarip.unHighlight(doc, xValue);
    }

    this.removeIndexes = function()
    {
        var xValue = this.xpathTextbox.value.replace(/\[\d+\]/g, "");
        this.xpathTextbox.value = xValue;
        this.setXPath(xValue);
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

        var location = yarip.getLocationFromLocation(this.doc.location);
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
        var xPath = null;
        if (this.doc) {
            this.unHighlight(this.doc, this.xValue);
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

            xPath = this.obj.item.getXPath();
            if (!yarip.checkXPath(xPath))
            {
                this.xpathTextbox.focus();
                this.xpathTextbox.select();
                msg = this.sb.getString("ERR_INVALID_XPATH");
                alert(msg);
                throw new YaripException(msg);
            }

            var elements = yarip.getElements(this.doc, xPath);
            if (!elements || elements.snapshotLength === 0)
            {
                this.xpathTextbox.focus();
                this.xpathTextbox.select();
                msg = this.sb.getString("ERR_NO_ELEMENTS_FOUND");
                alert(msg);
                throw new YaripException(msg);
            }

            this.obj.pageName = pageName;
        } else {
            if (!this.obj) return;

            xPath = this.obj.item.getXPath();
            if (!yarip.checkXPath(xPath))
            {
                var msg = this.sb.getString("ERR_INVALID_XPATH");
                this.xpathTextbox.focus();
                this.xpathTextbox.select();
                alert(msg);
                throw new YaripException(msg);
            }
        }

        FH.addEntry("xpath", xPath);
    }

    this.cancel = function()
    {
        if (this.doc) this.unHighlight(this.doc, this.xValue);
        if (this.obj) this.obj.item = null;
    }
}
