
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

function YaripAttributeDialog()
{
    this.sb = null;
    this.pageMenulist = null;
    this.xpathTextbox = null;
    this.attrNameTextbox = null;
    this.attrValueTextbox = null;
    this.doc = null;
    this.obj = null;
    this.xpath = null;

    this.setXPath = function(value)
    {
        if (!this.obj) return;
        this.obj.item.setXPath(value);
    }

    this.setAttrName = function(value)
    {
        if (!this.obj || !value) return;
        this.obj.attrName = value;
        if (this.obj.node) this.setAttrValue(this.obj.node.getAttribute(value), true);
    }

    this.setAttrValue = function(value, update)
    {
        if (!this.obj || typeof value !== "string") return; // allow null
        this.obj.attrValue = value;
        if (update) this.attrValueTextbox.value = value;
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

        this.sb = document.getElementById("style-dialog-stringbundle");
        this.pageMenulist = document.getElementById("page");
        this.xpathTextbox = document.getElementById("xpath");
        this.attrNameTextbox = document.getElementById("attrName");
        this.attrValueTextbox = document.getElementById("attrValue");

        this.pageMenulist.value = this.obj.pageName;
        this.xpathTextbox.value = this.obj.item.getXPath();
        this.xpathTextbox.focus();
        this.xpathTextbox.select();
        this.attrNameTextbox.value = this.obj.attrName;
        this.attrValueTextbox.value = this.obj.attrValue;

        if (!this.doc) {
            this.pageMenulist.disabled = true;
            document.getElementById("highlight").disabled = true;
            return;
        }

        var location = yarip.getLocation(this.doc.location);
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
        if (this.doc) {
            this.unHighlight(this.doc, this.xpath);
            if (!this.obj || !this.obj.attrName) return;

            this.obj.pageName = this.pageMenulist.value;

            if (this.obj.item.getXPath()) {
                var elements = yarip.getElements(this.doc, this.obj.item.getXPath());
                if (!elements) {
                    alert(this.sb.getString("ERR_INVALID_XPATH"));
                    throw new Error(this.sb.getFormattedString("ERR_INVALID_XPATH1", [xpath]));
                }
            }
        } else {
            if (!this.obj) return;
            if (!yarip.checkXPath(this.obj.item.getXPath(), true)) {
                alert(this.sb.getString("ERR_INVALID_XPATH"));
                throw new Error(this.sb.getFormattedString("ERR_INVALID_XPATH1", [xpath]));
            }
        }

        if (this.obj.item.getXPath()) FH.addEntry("xpath", this.obj.item.getXPath());
        FH.addEntry("attribute_name", this.obj.attrName);
        FH.addEntry("attribute_value", this.obj.attrValue);

        return;
    }

    this.cancel = function()
    {
        if (this.doc) this.unHighlight(this.doc, this.xpath);
        if (this.obj) this.obj.item = null;
    }
}
