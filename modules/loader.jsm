
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

const EXPORTED_SYMBOLS = ["YaripLoader"];

const Cu = Components.utils;

const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");

function YaripLoader()
{
    this.hasWhitelist = false;
    this.hasBlacklist = false;
    this.hasStyles = false;
    this.hasScripts = false;
}
YaripLoader.prototype.load = function(doc, increment)
{
    if (!doc) return false;

    var pageName = yarip.getPageName(doc.location, MODE_PAGE);
    if (!pageName) return false;

    var addressObj = yarip.getAddressObj(pageName, true);
    if (!addressObj.found) return false;

    this.doWhitelisting(doc, addressObj, increment);
    this.doBlacklisting(doc, addressObj, increment);
    this.doStyling(doc, addressObj, increment);
    this.doScripting(doc, addressObj, increment);

    if (addressObj.elementExclusive || this.hasWhitelist && !this.hasBlacklist) {
        if (increment) yarip.removeAllExceptWhitelisted(doc, pageName);
    }

    try {
        return this.hasWhitelist || this.hasBlacklist || this.hasStyles || this.hasScripts;
    } finally {
        this.reset();
    }
}
YaripLoader.prototype.reset = function()
{
    this.hasWhitelist = false;
    this.hasBlacklist = false;
    this.hasStyles = false;
    this.hasScripts = false;
}
YaripLoader.prototype.doWhitelisting = function(doc, addressObj, increment)
{
    addressObj.root.traverse(function (eItem) {
        if (!eItem.getDoElements()) return;

        var page = eItem.getPage();
        var list = page.elementWhitelist;
        if (list.length === 0) return;

        var pageName = page.getName();
        var isSelf = eItem.isSelf();
        for each (var item in list.obj) {
            if (yarip.whitelistElementItem(doc, pageName, item, false, isSelf && increment)) {
                this.hasWhitelist = true;
            }
        }
    });
}
YaripLoader.prototype.doBlacklisting = function(doc, addressObj, increment)
{
    addressObj.root.traverse(function (eItem) {
        if (!eItem.getDoElements()) return;

        var page = eItem.getPage();
        var list = page.elementBlacklist;
        if (list.length === 0) return;

        var pageName = page.getName();
        var isSelf = eItem.isSelf();
        for each (var item in list.obj) {
            if (yarip.blacklistElementItem(doc, pageName, item, false, isSelf && increment)) {
                this.hasBlacklist = true;
            }
        }
    });
}
YaripLoader.prototype.doStyling = function(doc, addressObj, increment)
{
    addressObj.root.traverse(function (eItem) {
        if (!eItem.getDoElements()) return;

        var page = eItem.getPage();
        var pageName = page.getName();
        var isSelf = eItem.isSelf();

        var list = page.pageStyleList;
        if (list.length > 0)
        {
            var idPrefix = "yarip-page-style_" + pageName.replace(/\W/g, "-") + "_";
            var counter = 0;

            // page styling
            for each (var item in list.obj)
            {
                var s = item.getStyle();
                if (!s) continue;

                var id = idPrefix + counter++;
                var style = doc.getElementById(id);
                if (style) continue;

                var elements = yarip.getNodesByXPath(doc, item.getXPath(), ELEMENT_NODE);
                if (elements.length > 0) {
                    var element = elements[0];
                    this.injectCascadingStyleSheet(doc, id, s, element);
                    if (increment && isSelf) {
                        item.incrementFound();
                    }
                } else {
                    if (increment && isSelf) {
                        item.incrementNotFound();
                    }
                }
            }
        }

        list = page.elementAttributeList;
        if (list.length > 0) {
            // element styling
            for each (var item in list.obj) {
                if (yarip.styleElementItem(doc, pageName, item, null, isSelf && increment)) {
                    this.hasStyles = true;
                }
            }
        }
    });
}
YaripLoader.prototype.doScripting = function(doc, addressObj, increment)
{
    var arr = [];
    addressObj.root.traverse(function (eItem) {
        if (eItem.isSelf() || eItem.getDoScripts()) arr.push(eItem);
    });

    var tmp = [];
    var found = false;

    // page scripting
    for (var i = arr.length - 1; i >= 0; i--)
    {
        var extItem = arr[i];
        var page = extItem.getPage();
        var list = page.pageScriptList;
        if (list.length === 0) continue;

        var pageName = page.getName();
        var isSelf = extItem.isSelf();
        var idPrefix = "yarip-page-script_" + pageName.replace(/\W/g, "-") + "_";
        var counter = 0;

        for each (var item in list.obj)
        {
            var s = item.getScript();
            if (!s) continue;

            var id = idPrefix + counter++;
            var script = doc.getElementById(id);
            if (script && !item.getReinject()) continue;

            var elements = yarip.getNodesByXPath(doc, item.getXPath(), ELEMENT_NODE);
            if (elements.length > 0) {
                var element = elements[0];
                tmp.push({
                    id: id,
                    script: s,
                    element: element,
                    reinject: item.getReinject()
                });
                if (increment && isSelf) {
                    item.incrementFound();
                }
                found = true;
            } else {
                if (increment && isSelf) {
                    item.incrementNotFound();
                }
            }
        }
    }

    // element scripting
    for (var i = arr.length - 1; i >= 0; i--)
    {
        var extItem = arr[i];
        var page = extItem.getPage();
        var list = page.elementScriptList;
        if (list.length === 0) continue;

        var pageName = page.getName();
        var isSelf = extItem.isSelf();
        var idPrefix = "yarip-element-script_" + pageName.replace(/\W/g, "-") + "_";
        var counter = 0;

        for each (var item in list.obj)
        {
            var s = item.getScript();
            if (!s) continue;

            var id = idPrefix + counter++;
            var script = doc.getElementById(id);
            if (script && !item.getReinject()) continue;

            if (increment && isSelf) {
                var elements = yarip.getNodesByXPath(doc, item.getXPath(), ELEMENT_NODE);
                if (elements.length > 0) {
                    item.incrementFound();
                } else {
                    item.incrementNotFound();
                    continue;
                }
            }

            tmp.push({
                id: id,
                script: "yarip.run(" + s + ", " + JSON.stringify(item.getXPath()) + ");\n",
                element: null, // /html/body
                reinject: item.getReinject()
            });
            found = true;
        }
    }

    if (found) {
        this.injectJavaScript(doc, "yarip-default-script", yarip.getYaripScript());
        for (var i = 0; i < tmp.length; i++) {
            var obj = tmp[i];
            this.injectJavaScript(doc, obj.id, obj.script, obj.element, obj.reinject);
        }
    }
}
YaripLoader.prototype.injectCascadingStyleSheet = function(doc, id, css, parent)
{
    var element = doc.getElementById(id);
    if (element) {
        if (element.getAttribute("status") != "whitelisted") {
            element.parentNode.removeChild(element);
        } else {
            return;
        }
    }
    var style = doc.createElement("style");
    style.type = "text/css";
    style.setAttribute("id", id);
    style.setAttribute("status", "whitelisted");
    style.appendChild(doc.createTextNode(css));
    if (parent) {
        parent.appendChild(style);
    } else {
        doc.getElementsByTagName("head")[0].appendChild(style);
    }
    this.hasStyles = true;
}
YaripLoader.prototype.injectJavaScript = function(doc, id, js, parent, reinject)
{
    var element = doc.getElementById(id);
    if (element) {
        if (reinject || element.getAttribute("status") != "whitelisted") {
            element.parentNode.removeChild(element);
        } else {
            return;
        }
    }
    var script = doc.createElement("script");
    script.type = "text/javascript";
    script.setAttribute("id", id);
    script.setAttribute("status", "whitelisted");
    script.appendChild(doc.createTextNode(js));
    if (parent) {
        parent.appendChild(script);
    } else {
        doc.getElementsByTagName("body")[0].appendChild(script);
    }
    this.hasScripts = true;
}

