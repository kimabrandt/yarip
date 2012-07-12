
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

const EXPORTED_SYMBOLS = ["YaripMap"];

const Cu = Components.utils;

const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/aatree.jsm");
Cu.import("resource://yarip/object.jsm");
Cu.import("resource://yarip/page.jsm");
Cu.import("resource://yarip/item.jsm");

function YaripMap()
{
    this.obj = {};
    this.objId = {};
    this.tree = new YaripAATree();
    this.length = 0;
}
YaripMap.prototype = new YaripObject;
YaripMap.prototype.constructor = YaripMap;
YaripMap.prototype.sb = SB.createBundle("chrome://yarip/locale/map.properties");
YaripMap.prototype.add = function(page)
{
    if (!page) return;

    var oldPage = this.obj[page.getName()];
    if (oldPage) {
        oldPage.merge(page);
    } else {
        if (page.getId() in this.objId) {
            yarip.logMessage(LOG_WARNING, new Error(this.sb.formatStringFromName("WARN_PAGE_EXISTS2", [page.getId(), page.getName()], 2)));
            return;
        }

        this.obj[page.getName()] = page;
        this.objId[page.getId()] = page;
        this.tree.add(page);

//        var list = page.pageExtensionList;
//        for each (var item in list.obj) {
//            this.addExtension(page, item);
//        }

        this.length++;
    }
    this.resetKnown();
}
YaripMap.prototype.remove = function(page)
{
    if (!page) return;

    if (page.getId()) {
        this.removeById(page.getId());
    } else {
        this.removeByName(page.getName());
    }
}
YaripMap.prototype.get = function(pageName)
{
    return pageName in this.obj ? this.obj[pageName] : null;
}
YaripMap.prototype.getById = function(id)
{
    return id in this.objId ? this.objId[id] : null;
}
YaripMap.prototype.removeById = function(id)
{
    if (!id || !this.objId[id]) return;

    var page = this.objId[id];
    this.tree.remove(page);
    delete this.obj[page.getName()];
    delete this.objId[id];
    this.length--;
    this.resetKnown();
}
YaripMap.prototype.removeByName = function(pageName)
{
    if (!pageName || !this.obj[pageName]) return;

    var page = this.obj[pageName];
    this.removeById(page.getId());
}
YaripMap.prototype.addExtension = function(page, item)
{
    if (!page || !item || page.getId() == item.getId()) return;

    var extPage = this.getById(item.getId());
    if (extPage) {
        page.pageExtensionList.add(item);
        extPage.pageExtendedByList.add(item.clone(page.getId()));
        this.resetKnown();
    }
}
YaripMap.prototype.removeExtension = function(page, item)
{
    if (!page || !item) return;

    page.pageExtensionList.remove(item);
    var extPage = this.getById(item.getId());
    if (extPage) {
        extPage.pageExtendedByList.removeById(page.getId());
        this.resetKnown();
    }
}
YaripMap.prototype.updateExtension = function(page, item)
{
    if (!page || !item) return;

    var extPage = this.getById(item.getId());
    if (extPage) {
        extPage.pageExtendedByList.update(item.clone(page.getId()));
        this.resetKnown();
    }
}
YaripMap.prototype.updateExtendedBy = function(page, item)
{
    if (!page || !item) return;

    var extPage = this.getById(item.getId());
    if (extPage) {
        extPage.pageExtensionList.update(item.clone(page.getId()));
        this.resetKnown();
    }
}
YaripMap.prototype.clone = function()
{
    var map = new this.constructor();
    for each (var page in this.obj) if (page) map.add(page.clone());
    return map;
}
YaripMap.prototype.replaceExtensionIds = function(map, oldPage, newId)
{
    if (!map || !oldPage || !newId) return;

    var arr = [];
    var oldId = oldPage.getId();
    for each (var page in map.obj)
    {
        var list = page.pageExtensionList;
        for each (var item in list.obj) {
            if (item.getId() == oldId) {
                map.removeExtension(page, item);
                arr.push([page, item.clone(newId)]);
            }
        }
        list = page.pageExtendedByList;
        for each (var item in list.obj) {
            if (item.getId() == oldId) {
                page.pageExtendedByList.remove(item);
            }
        }
    }

    map.remove(oldPage);
    var newPage = oldPage.clone(null, null, newId);
    map.add(newPage);

    for (var i = 0; i < arr.length; i++) {
        map.addExtension(arr[i][0], arr[i][1]);
    }
}
YaripMap.prototype.merge = function(map)
{
    if (!map) return;

    for (var pageName in map.obj)
    {
        var newPage = map.get(pageName);
        var oldPage = this.get(pageName);
        if (oldPage && newPage.getId() != oldPage.getId()) { // same name, different id
            this.replaceExtensionIds(map, newPage, oldPage.getId()); // replace with old id
            continue;
        }

        oldPage = this.getById(newPage.getId());
        if (oldPage && newPage.getName() != oldPage.getName()) { // same id, different name
            var newId = null;
            do {
                newId = this.newId(); // create new id
            } while (this.getById(newId) && map.getById(newId)); // while id exists
            this.replaceExtensionIds(map, newPage, newId); // replace with new id
        }
    }

    for each (var page in map.obj) {
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

