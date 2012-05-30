
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

const EXPORTED_SYMBOLS = [
        "YaripList",
//        "YaripElementList",
        "YaripElementWhitelist",
        "YaripElementBlacklist",
        "YaripElementAttributeList",
        "YaripElementScriptList",
        "YaripContentWhitelist",
        "YaripContentBlacklist",
        "YaripStreamReplaceList",
        "YaripPageStyleList",
        "YaripPageScriptList",
        "YaripHeaderList",
        "YaripRedirectList",
        "YaripPageExtensionList",
        "YaripPageExtendedByList"
    ];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/object.jsm");
Cu.import("resource://yarip/item.jsm");

function YaripList(name, exclusive)
{
    this.name = "";
    this.obj = {};
    this.listLength = 0;
    this.exclusive = false;
    this.sorted = true;

    this.setName(name);
    this.setExclusive(exclusive);
}
YaripList.prototype = new YaripObject;
YaripList.prototype.constructor = YaripList;
YaripList.prototype.setName = function(value)
{
    if (value) this.name = "" + value;
}
YaripList.prototype.setExclusive = function(value)
{
    this.exclusive = "" + value == "true";
}
YaripList.prototype.getExclusive = function()
{
//        return this.listLength > 0 && this.exclusive;
    return !this.isEmpty() && this.exclusive;
}
YaripList.prototype.isEmpty = function()
{
    for (var k in this.obj) { return false; }
    return true;
}
YaripList.prototype.__defineGetter__("length", function() {
        return this.listLength;
    });
YaripList.prototype.add = function(o, purge)
{
    if (!o) return;
    var oldObj = this.obj[o.getKey()];
    if (oldObj) {
        oldObj.merge(o);
        if (purge) oldObj.purge();
    } else {
        if (purge) o.purge();
        this.obj[o.getKey()] = o;
        this.sorted = false;
        this.listLength++;
    }
}
YaripList.prototype.remove = function(o)
{
    if (!o) return;
    this.removeByKey(o.getKey());
}
YaripList.prototype.removeByKey = function(value)
{
    if (!value || !value in this.obj) return;
    delete this.obj[value];
    this.listLength--;
}
YaripList.prototype.contains = function(o)
{
    return o.getKey() in this.obj;
}
YaripList.prototype.reset = function()
{
//    for each (var o in this.obj) if (o) this.removeByKey(o.getKey());
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;
}
YaripList.prototype.sort = function(purge)
{
    if (this.sorted) return;
    var a = [];
    for each (var o in this.obj) a.push(o);
    a.sort(function(a, b) { return a.compare(b); });
    this.reset();
    for (var i = 0; i < a.length; i++) this.add(a[i], purge);
    this.sorted = true;
}
YaripList.prototype.purge = function()
{
    for each (var o in this.obj) if (o) o.purge();
}
YaripList.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.name, this.exclusive);
    for each (var o in this.obj) if (o) tmp.add(o.clone(purge));
    return tmp;
}
YaripList.prototype.merge = function(list)
{
    this.setExclusive(this.getExclusive() || list.getExclusive());
    for each (var o in list.obj) this.add(o.clone());
}
YaripList.prototype.subtract = function(list)
{
    this.setExclusive(this.getExclusive() && !list.getExclusive());
    for (var k in this.obj) if (k in list.obj) this.removeByKey(k);
}
YaripList.prototype.generateXml = function()
{
    var tmp = "";
    for each (var o in this.obj) if (o) tmp += o.generateXml();
    if (tmp != "") {
        return "\t\t\t" +
            "<" + this.name + (this.exclusive ? " exclusive=\"" + this.exclusive + "\"" : "") + ">\n" +
            tmp +
            "\t\t\t</" + this.name + ">\n";
    } else {
        return "";
    }
}
YaripList.prototype.generateCSS = function()
{
    var tmp = "";
    for each (var o in this.obj) if (o) tmp += o.generateCSS();
    if (tmp != "") {
//        return tmp.replace(/,\n$/, "") + " {\n\t\tdisplay: none !important;\n\t}\n\n";
        return tmp.replace(/,\n$/, "") + " {\n\tdisplay: none !important;\n}";
    } else {
        return "";
    }
}

//function YaripElementList(name)
//{
//    this.name = "";
//    this.obj = {};
//    this.listLength = 0;
//    this.sorted = true;

//    this.setName(name);
//}
//YaripElementList.prototype = new YaripList;
//YaripElementList.prototype.constructor = YaripElementList;

function YaripElementWhitelist(name, exclusive)
{
    this.name = "whitelist";
    this.obj = {};
    this.listLength = 0;
    this.exclusive = false;
    this.sorted = true;

    this.setName(name);
    this.setExclusive(exclusive);
}
//YaripElementWhitelist.prototype = new YaripElementList;
YaripElementWhitelist.prototype = new YaripList;
YaripElementWhitelist.prototype.constructor = YaripElementWhitelist;
YaripElementWhitelist.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkXPath(value)) return false;

            var c = o.clone();
            c.setXPath(value);
            if (this.contains(c)) return false;

            FH.removeEntry("xpath", o.getXPath());
            this.remove(o);

            this.add(c);
            FH.addEntry("xpath", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 2:
            o.setForce(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripElementWhitelist.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getXPath();
        case 1: return o.getPriority();
        case 2: return o.getForce();
        case 3:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 4:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 5: return o.getFound();
        case 6: return o.getNotFound();
        case 7: return o.getIgnored();
        default: return "";
        }
    }
    return "";
}
YaripElementWhitelist.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    this.setExclusive(obj.exclusive);
    for each (var itemObj in obj.obj) {
        var item = new YaripElementWhitelistItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripElementBlacklist(name)
{
    this.name = "blacklist";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
//YaripElementBlacklist.prototype = new YaripElementList;
YaripElementBlacklist.prototype = new YaripList;
YaripElementBlacklist.prototype.constructor = YaripElementBlacklist;
YaripElementBlacklist.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkXPath(value)) return false;

            var c = o.clone();
            c.setXPath(value);
            if (this.contains(c)) return false;

            FH.removeEntry("xpath", o.getXPath());
            this.remove(o);

            this.add(c);
            FH.addEntry("xpath", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 2:
            o.setForce(value);
            return false;
        case 3:
            o.setPlaceholder(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripElementBlacklist.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getXPath();
        case 1: return o.getPriority();
        case 2: return o.getForce();
        case 3: return o.getPlaceholder();
        case 4:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 5:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 6: return o.getFound();
        case 7: return o.getNotFound();
        case 8: return o.getIgnored();
        default: return "";
        }
    }
    return "";
}
YaripElementBlacklist.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripElementBlacklistItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripElementAttributeList(name)
{
    this.name = "attribute";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripElementAttributeList.prototype = new YaripList;
YaripElementAttributeList.prototype.constructor = YaripElementAttributeList;
YaripElementAttributeList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkXPath(value)) return false;

            var c = o.clone();
            c.setXPath(value);
            if (this.contains(c)) return false;

            FH.removeEntry("xpath", o.getXPath());
            this.remove(o);

            this.add(c);
            FH.addEntry("xpath", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setName(value);
            if (this.contains(c)) return false;

//            FH.removeEntry("attribute_name", o.getName());
            this.remove(o);

            this.add(c);
            FH.addEntry("attribute_name", value);
            return c.getKey();
        case 2:
//            FH.removeEntry("attribute_value", o.getValue());

            o.setValue(value);
            FH.addEntry("attribute_value", value);
            return false;
        case 3:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        default:
            return false;
        }
    }
    return false;
}
YaripElementAttributeList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getXPath();
        case 1: return o.getName();
        case 2: return o.getValue();
        case 3: return o.getPriority();
        case 4:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 5:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 6: return o.getFound();
        case 7: return o.getNotFound();
        default: return "";
        }
    }
    return "";
}
YaripElementAttributeList.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripElementAttributeItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripElementScriptList(name)
{
    this.name = "script";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
//YaripElementScriptList.prototype = new YaripElementList;
YaripElementScriptList.prototype = new YaripList;
YaripElementScriptList.prototype.constructor = YaripElementScriptList;
YaripElementScriptList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkXPath(value)) return false;

            var c = o.clone();
            c.setXPath(value);
            if (this.contains(c)) return false;

            FH.removeEntry("xpath", o.getXPath());
            this.remove(o);

            this.add(c);
            FH.addEntry("xpath", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 99:
            o.setScript(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripElementScriptList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getXPath();
        case 1: return o.getPriority();
        case 2:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 3:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 4: return o.getFound();
        case 5: return o.getNotFound();
        case 99: return o.getScript();
        default: return "";
        }
    }
    return "";
}
YaripElementScriptList.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripElementScriptItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripContentWhitelist(name, exclusive)
{
    this.name = "whitelist";
    this.obj = {};
    this.listLength = 0;
    this.exclusive = false;
    this.sorted = true;

    this.setName(name);
    this.setExclusive(exclusive);
}
YaripContentWhitelist.prototype = new YaripList;
YaripContentWhitelist.prototype.constructor = YaripContentWhitelist;
YaripContentWhitelist.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkRegExp(value)) return false;

            var c = o.clone();
            c.setRegExp(value);
            if (this.contains(c)) return false;

            FH.removeEntry("regexp", o.getRegExp());
            this.remove(o);

            this.add(c);
            FH.addEntry("regexp", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 2:
            o.setForce(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripContentWhitelist.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getRegExp();
        case 1: return o.getPriority();
        case 2: return o.getForce();
        case 3:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 4:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        default: return "";
        }
    }
    return "";
}
YaripContentWhitelist.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    this.setExclusive(obj.exclusive);
    for each (var itemObj in obj.obj) {
        var item = new YaripContentWhitelistItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripContentBlacklist(name)
{
    this.name = "blacklist";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripContentBlacklist.prototype = new YaripList;
YaripContentBlacklist.prototype.constructor = YaripContentBlacklist;
YaripContentBlacklist.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkRegExp(value)) return false;

            var c = o.clone();
            c.setRegExp(value);
            if (this.contains(c)) return false;

            FH.removeEntry("regexp", o.getRegExp());
            this.remove(o);

            this.add(c);
            FH.addEntry("regexp", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 2:
            o.setForce(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripContentBlacklist.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getRegExp();
        case 1: return o.getPriority();
        case 2: return o.getForce();
        case 3:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 4:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 5: return o.getIgnored();
        default: return "";
        }
    }
    return "";
}
YaripContentBlacklist.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripContentBlacklistItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripStreamReplaceList(name)
{
    this.name = "replace";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripStreamReplaceList.prototype = new YaripList;
YaripStreamReplaceList.prototype.constructor = YaripStreamReplaceList;
YaripStreamReplaceList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkRegExp(value)) return false;

            var c = o.clone();
            c.setRegExp(value);
            if (this.contains(c)) return false;

            FH.removeEntry("stream-regexp", o.getRegExp());
            this.remove(o);

            this.add(c);
            FH.addEntry("stream-regexp", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 99:
            o.setScript(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripStreamReplaceList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getRegExp();
        case 1: return o.getPriority();
        case 2:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 3:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 99: return o.getScript();
        default: return "";
        }
    }
    return "";
}
YaripStreamReplaceList.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripStreamItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripPageStyleList(name)
{
    this.name = "style";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripPageStyleList.prototype = new YaripList;
YaripPageStyleList.prototype.constructor = YaripPageStyleList;
YaripPageStyleList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkXPath(value)) return false;

            var c = o.clone();
            c.setXPath(value);
            if (this.contains(c)) return false;

            FH.removeEntry("xpath", o.getXPath());
            this.remove(o);

            this.add(c);
            FH.addEntry("xpath", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 99:
            o.setStyle(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripPageStyleList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getXPath();
        case 1: return o.getPriority();
        case 2:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 3:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 4: return o.getFound();
        case 5: return o.getNotFound();
        case 99: return o.getStyle();
        default: return "";
        }
    }
    return "";
}
//YaripPageStyleList.prototype.generateCSS = function()
//{
//    var tmp = "";
//    for each (var o in this.obj) if (o) tmp += o.generateCSS();
//    if (tmp != "") {
//        return tmp + "\n";
//    } else {
//        return "";
//    }
//}
YaripPageStyleList.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripStyleItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripPageScriptList(name)
{
    this.name = "script";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripPageScriptList.prototype = new YaripList;
YaripPageScriptList.prototype.constructor = YaripPageScriptList;
YaripPageScriptList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkXPath(value)) return false;

            var c = o.clone();
            c.setXPath(value);
            if (this.contains(c)) return false;

            FH.removeEntry("xpath", o.getXPath());
            this.remove(o);

            this.add(c);
            FH.addEntry("xpath", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 99:
            o.setScript(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripPageScriptList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getXPath();
        case 1: return o.getPriority();
        case 2:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 3:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 4: return o.getFound();
        case 5: return o.getNotFound();
        case 99: return o.getScript();
        default: return "";
        }
    }
    return "";
}
YaripPageScriptList.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripPageScriptItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripHeaderList(name)
{
    this.name = "header";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripHeaderList.prototype = new YaripList;
YaripHeaderList.prototype.constructor = YaripHeaderList;
YaripHeaderList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkRegExp(value)) return false;

            var c = o.clone();
            c.setRegExp(value);
            if (this.contains(c)) return false;

            FH.removeEntry("regexp", o.getRegExp());
            this.remove(o);

            this.add(c);
            FH.addEntry("regexp", value);
            return c.getKey();
        case 1:
            var c = o.clone();
            c.setHeaderName(value);
            if (this.contains(c)) return false;

//            FH.removeEntry("header_name", o.getHeaderName());
            this.remove(o);

            this.add(c);
            FH.addEntry("header_name", value);
            return c.getKey();
        case 2:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 3:
            o.setMerge(value);
            return false;
        case 99:
            o.setScript(value);
            return false;
        default:
            return false;
        }
    }
    return false;
}
YaripHeaderList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getRegExp();
        case 1: return o.getHeaderName();
        case 2: return o.getPriority();
        case 3: return o.getMerge();
        case 4:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 5:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 99: return o.getScript();
        default: return "";
        }
    }
    return "";
}
YaripHeaderList.prototype.generateXml = function()
{
    var tmp = "";
    for each (var o in this.obj) if (o) tmp += o.generateXml();
    if (tmp != "") {
        return "\t\t\t\t" +
            "<" + this.name + ">\n" +
            tmp +
            "\t\t\t\t</" + this.name + ">\n";
    } else {
        return "";
    }
}
YaripHeaderList.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripHeaderItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripRedirectList(name)
{
    this.name = "redirect";
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripRedirectList.prototype = new YaripList;
YaripRedirectList.prototype.constructor = YaripRedirectList;
YaripRedirectList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case 0:
            if (!this.checkRegExp(value)) return false;

            var c = o.clone();
            c.setRegExp(value);
            if (this.contains(c)) return false;

            FH.removeEntry("regexp", o.getRegExp());
            this.remove(o);

            this.add(c);
            FH.addEntry("regexp", value);
            return c.getKey();
        case 1:
            FH.removeEntry("newsubstr", o.getRegExp());

            o.setNewSubStr(value);
            FH.addEntry("newsubstr", value);
            return false;
        case 2:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        default:
            return false;
        }
    }
    return false;
}
YaripRedirectList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getRegExp();
        case 1: return o.getNewSubStr();
        case 2: return o.getPriority();
        case 3:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        case 4:
            var ms = o.getLastFound();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        default: return "";
        }
    }
    return "";
}
YaripRedirectList.prototype.loadFromObject = function(obj)
{
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripRedirectItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripPageExtensionList(name)
{
    this.id = null;
    this.name = "extension";
    this.obj = {};
//    this.listLength = 0;
    this.sorted = true;

    this.setName(name);
}
YaripPageExtensionList.prototype = new YaripList;
YaripPageExtensionList.prototype.constructor = YaripPageExtensionList;
YaripPageExtensionList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        this.resetKnown();

        switch (col) {
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 2:
            o.setDoElements(value);
            break;
        case 3:
            o.setDoContents(value);
            break;
        case 4:
            o.setDoScripts(value);
            break;
        case 5:
            o.setDoHeaders(value);
            break;
        case 6:
            o.setDoRedirects(value);
            break;
        case 7:
            o.setDoStreams(value);
            break;
        case 8:
            o.setDoLinks(value);
            break;
        default:
            break;
        }

        break;
    }
    return false;
}
YaripPageExtensionList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        switch (col) {
        case -1: return o.getKey();
        case 0: return o.getPage().getName();
        case 1: return o.getPriority();
        case 2: return o.getDoElements();
        case 3: return o.getDoContents();
        case 4: return o.getDoScripts();
        case 5: return o.getDoHeaders();
        case 6: return o.getDoRedirects();
        case 7: return o.getDoStreams();
        case 8: return o.getDoLinks();
        case 9:
            var ms = o.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        default: return "";
        }
    }
    return "";
}
YaripPageExtensionList.prototype.__defineGetter__("length", function() {
//        return this.listLength;
        var l = 0;
        for (var k in this.obj) { l++; }
        return l;
    });
YaripPageExtensionList.prototype.add = function(o, purge, tmp)
{
    if (!o) return;

    var page = o.getPage();
    if (!page) return;

    var oldObj = this.obj[o.getKey()];
    if (oldObj) {
        oldObj.merge(o);
        if (purge) oldObj.purge();
    } else {
        if (purge) o.purge();
        this.obj[o.getKey()] = o;
        this.sorted = false;
//        this.listLength++;
    }

    if (!tmp) page.pageExtendedByList.add(new YaripExtensionItem(this.id, o.getPriority()));
    this.resetKnown();
}
YaripPageExtensionList.prototype.setId = function(id)
{
    this.id = id;
}
YaripPageExtensionList.prototype.removeByKey = function(value)
{
    if (!value || !value in this.obj) return;
    var o = this.obj[value];
    delete this.obj[value];
    if (o) {
        var page = o.getPage();
//        this.listLength--;
//        var page = this.getPageById(value);
//        if (page) page.pageExtendedByList.removeByKey(this.id);
        if (page) {
            page.pageExtendedByList.remove(new YaripExtensionItem(this.id, o.getPriority()));
        }
        this.resetKnown();
    }
}
YaripPageExtensionList.prototype.reset = function()
{
    this.obj = {};
    this.listLength = 0;
    this.sorted = true;
    this.resetKnown();
}
YaripPageExtensionList.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.name);
    tmp.id = this.id;
    for each (var o in this.obj) if (o) tmp.add(o.clone(purge));
    return tmp;
}
YaripPageExtensionList.prototype.merge = function(list)
{
    for each (var o in list.obj) {
        var page = o.getPage();
        if (page) {
            if (page.getId() != this.id) { // not same page
                page.pageExtendedByList.add(new YaripExtensionItem(this.id, o.getPriority()));
                this.add(o.clone());
            }
        }
    }
}
YaripPageExtensionList.prototype.loadFromObject = function(obj)
{
    this.setId(obj.id);
    this.setName(obj.name);
    for each (var itemObj in obj.obj) {
        var item = new YaripExtensionItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

function YaripPageExtendedByList()
{
    this.id = null;
    this.obj = {};
//    this.listLength = 0;
    this.sorted = true;
}
YaripPageExtendedByList.prototype = new YaripList;
YaripPageExtendedByList.prototype.constructor = YaripPageExtendedByList;
YaripPageExtendedByList.prototype.set = function(row, col, value)
{
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        var page = o.getPage();
//        var o2 = page.pageExtensionList.obj[this.id];
        var o2 = page.pageExtensionList.obj[new YaripExtensionItem(this.id, o.getPriority()).getKey()];

        this.resetKnown();

        switch (col) {
        case 1:
            var c = o.clone();
            c.setPriority(value);
            if (!this.contains(c)) {
                this.remove(o);
                this.add(c);
                return c.getKey();
            } else {
                return false;
            }
        case 2:
            o2.setDoElements(value);
            break;
        case 3:
            o2.setDoContents(value);
            break;
        case 4:
            o2.setDoScripts(value);
            break;
        case 5:
            o2.setDoHeaders(value);
            break;
        case 6:
            o2.setDoRedirects(value);
            break;
        case 7:
            o2.setDoStreams(value);
            break;
        case 8:
            o2.setDoLinks(value);
            break;
        default:
            break;
        }

        break;
    }
    return false;
}
YaripPageExtendedByList.prototype.get = function(row, col)
{
    if (!this.sorted) this.sort();
    var i = 0;
    for each (var o in this.obj)
    {
        if (i++ != row) continue;

        var page = o.getPage();
//        var o2 = page.pageExtensionList.obj[this.id];
        // FIXME When changing priority o2 is undefined!?
        var o2 = page.pageExtensionList.obj[new YaripExtensionItem(this.id, o.getPriority()).getKey()];
        if (!o2) return;

        switch (col) {
        case -1: return o.getKey();
        case 0: return page.getName();
        case 1: return o.getPriority();
        case 2: return o2.getDoElements();
        case 3: return o2.getDoContents();
        case 4: return o2.getDoScripts();
        case 5: return o2.getDoHeaders();
        case 6: return o2.getDoRedirects();
        case 7: return o2.getDoStreams();
        case 8: return o2.getDoLinks();
        case 9:
            var ms = o2.getCreated();
            if (ms > -1) {
                var date = new Date(ms);
                return date.toDateString() + " " + date.toLocaleTimeString();
            } else {
                return "";
            }
        default: return "";
        }
    }
    return "";
}
YaripPageExtendedByList.prototype.__defineGetter__("length", function() {
//        return this.listLength;
        var l = 0;
        for (var k in this.obj) { l++; }
        return l;
    });
YaripPageExtendedByList.prototype.setId = function(id)
{
    this.id = id;
}
YaripPageExtendedByList.prototype.clone = function(purge)
{
    var tmp = new this.constructor();
    tmp.id = this.id;
    for each (var o in this.obj) if (o) tmp.add(o.clone(purge));
    return tmp;
}
YaripPageExtendedByList.prototype.merge = function(list)
{
    for each (var o in list.obj) {
        var page = o.getPage();
        if (page) {
            if (page.getId() != this.id) { // not same page
                page.pageExtensionList.add(new YaripExtensionItem(this.id, o.getPriority()));
                this.add(o.clone());
            }
        }
    }
}
YaripPageExtendedByList.prototype.loadFromObject = function(obj)
{
    this.setId(obj.id);
    for each (var itemObj in obj.obj) {
        var item = new YaripExtensionItem();
        item.loadFromObject(itemObj);
        this.add(item);
    }
}

