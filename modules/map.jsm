
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

const EXPORTED_SYMBOLS = ["YaripMap"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/aatree.jsm");
Cu.import("resource://yarip/object.jsm");
Cu.import("resource://yarip/page.jsm");

function YaripMap()
{
    this.obj = {};
    this.objId = {};
    this.tree = new YaripAATree();
    this.length = 0;
}
YaripMap.prototype = new YaripObject;
YaripMap.prototype.constructor = YaripMap;
YaripMap.prototype.loadFromObject = function(obj)
{
    var tree = new YaripAATree();
    tree.root = obj.tree.root;
    var ref = this;
    tree.traverse(function(node) {
            if (node.value) {
                var page = new YaripPage();
                page.loadFromObject(node.value);
                ref.add(page);
            }
        });
}
YaripMap.prototype.add = function(page)
{
    if (!page) return;

    var oldPage = this.obj[page.getName()];
    if (oldPage) {
        oldPage.merge(page);
    } else {
        this.obj[page.getName()] = page;
        this.objId[page.getId()] = page;
        this.tree.add(page);
        this.length++;
    }
    this.resetKnown();
}
YaripMap.prototype.remove = function(page)
{
    if (!page) return;

    var pageId = page.getId();
    if (pageId) {
        this.removeById(page.getId());
    } else {
        this.removeByName(page.getName());
    }
}
YaripMap.prototype.get = function(pageName)
{
    return pageName in this.obj ? this.obj[pageName] : null;
//    return this.obj[pageName];
}
YaripMap.prototype.getById = function(value)
{
    return value in this.objId ? this.objId[value] : null;
//    return this.objId[value];
}
YaripMap.prototype.removeById = function(id)
{
    if (!id || !this.objId[id]) return;
    var page = this.objId[id];
    this.tree.remove(page);
    delete this.obj[page.getName()];
    delete this.objId[id];
//    page.destroy();
    this.length--;
    this.resetKnown();
}
YaripMap.prototype.removeByName = function(pageName)
{
    if (!pageName || !this.obj[pageName]) return;
    var page = this.obj[pageName];
    this.tree.remove(page);
    delete this.objId[page.getId()];
    delete this.obj[pageName];
//    page.destroy();
    this.length--;
    this.resetKnown();
}
YaripMap.prototype.clone = function()
{
    var map = new this.constructor();
    for each (var page in this.obj) if (page) map.add(page.clone());
    return map;
}
//YaripMap.prototype.replaceExtensionIds = function(map, newId, oldId)
//{
//    if (!map || !newId || !oldId) return;
//    var mapObj = map.obj;
//    for each (var page in mapObj)
//    {
//        var list = page.pageExtensionList;
//        var listObj = list.obj;
//        for each (var oldItem in listObj)
//        {
//            if (oldItem.getValue() == oldId)
//            {
//                var newItem = oldItem.clone();
//                newItem.setValue(newId);
//                list.remove(oldItem);
//                list.add(newItem);
//            }
//        }
//    }
//}
YaripMap.prototype.replaceExtensionIds = function(map, oldPage, newId)
{
    if (!map || !oldPage || !newId) return;

    map.remove(oldPage);
    var newPage = oldPage.clone(null, null, newId);
    map.add(newPage);
}
YaripMap.prototype.merge = function(map)
{
    if (!map) return;
    var mapObj = map.obj;
    for (var p in mapObj)
    {
        var page = map.obj[p];
        if (this.obj[p]) { // same name
            this.replaceExtensionIds(map, page, this.obj[p].getId()); // use existing id
        } else if (this.objId[page.getId()]) { // same id
            var newId = null;
            do {
                newId = this.newId();
            } while(this.getById(newId) != undefined && this.getById(newId) != null
                    && map.getById(newId) != undefined && map.getById(newId) != null);
            this.replaceExtensionIds(map, page, newId); // use new id
        }
    }
    for each (var page in mapObj) {
        this.add(page);
    }
}
YaripMap.prototype.purge = function()
{
    for each (var page in this.obj) if (page) page.purge();
}
YaripMap.prototype.generateXml = function(exporting)
{
    var r = "<?xml version=\"1.0\" encoding=\"" + CHARSET + "\"?>\n";
    if (!exporting) {
        r += "\n<!--\nDo not edit this file.\n\nIf you make changes to this file while the application is running,\nthe changes will be overwritten when the application exits.\n-->\n\n";
    }
    r += "<yarip version=\"" + VERSION + "\">\n";
    this.tree.traverse(function(node) { if (node.value) r += node.value.generateXml(); });
    r += "</yarip>";
    return r;
}
//YaripMap.prototype.generateCSS = function()
//{
//    var r = "\n/* Do not edit this file.\n *\n * If you make changes to this file while the application is running,\n * the changes will be overwritten when the application exits.\n */\n\n";
////    for each (var page in this.obj) if (page) r += page.generateCSS();
//    this.tree.traverse(function(node) { if (node.value) r += node.value.generateCSS(); });
//    return r;
//}

//var wrappedJSObject = new YaripMap();

