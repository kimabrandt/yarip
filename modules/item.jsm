
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
        "YaripItem",
        "YaripElementWhitelistItem",
        "YaripElementBlacklistItem",
        "YaripElementAttributeItem",
        "YaripScriptItem",
        "YaripContentItem",
        "YaripContentWhitelistItem",
        "YaripContentBlacklistItem",
        "YaripStreamItem",
        "YaripStyleItem",
        "YaripPageScriptItem",
        "YaripHeaderItem",
        "YaripRedirectItem",
        "YaripExtensionItem"
    ];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/object.jsm");

function YaripItem(xpath, style, script, priority, force, placeholder, created, lastFound, found, notFound, ignored)
{
    this.xpath = "";
    this.regExp = "";
    this.regexpobj = null;
    this.style = null;
    this.script = "";
    this.priority = 0;
    this.force = true;
    this.placeholder = false;
    this.created = -1;
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;
    this.ignored = 0;

    this.setXPath(xpath);
    this.setStyle(style);
    this.setScript(script);
    this.setPriority(priority);
    this.setForce(force);
    this.setPlaceholder(placeholder);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setFound(found);
    this.setNotFound(notFound);
    this.setIgnored(ignored);
}
YaripItem.prototype = new YaripObject;
YaripItem.prototype.constructor = YaripItem;
YaripItem.prototype.sb = SB.createBundle("chrome://yarip/locale/item.properties");
YaripItem.prototype.getId = function()
{
    return this.getXPath();
}
YaripItem.prototype.getKey = function()
{
    return this.getPriority() + " " + this.getId();
}
YaripItem.prototype.setXPath = function(value)
{
    if (!value) return;
    this.xpath = "" + value;
    this.setCreated(Date.now());
}
YaripItem.prototype.getXPath = function()
{
    return this.xpath;
}
YaripItem.prototype.setRegExp = function(value)
{
    if (!value) return;
    this.regExp = value;
    this.setCreated(Date.now());
}
YaripItem.prototype.getRegExp = function()
{
    return this.regExp;
}
YaripItem.prototype.getRegExpObj = function()
{
    if (!this.regexpobj) {
        try {
            this.regexpobj = new RegExp(this.regExp);
        } catch (e) {
            this.regexpobj = null;
            yarip.logMessage(LOG_WARNING, new Error(this.sb.formatStringFromName("WARN_CREATE_REGEXP1", [this.regExp], 1)));
        }
    }
    return this.regexpobj;
}
YaripItem.prototype.setStyle = function(value)
{
    if (!value && value != "") return;
    this.style = value;
}
YaripItem.prototype.getStyle = function()
{
    return this.style;
}
YaripItem.prototype.setScript = function(value)
{
    if (!value && value != "") return;
    this.script = value;
}
YaripItem.prototype.getScript = function()
{
    return this.script;
}
YaripItem.prototype.setPriority = function(value)
{
    if (!value && value !== 0 || ("" + value).length > 13) return;

    value = Number(value);
    if (!isNaN(value)) {
        this.priority = value;
    }
}
YaripItem.prototype.getPriority = function()
{
    return this.priority;
}
YaripItem.prototype.setForce = function(value)
{
    this.force = "" + value != "false";
    if (!this.force) this.style = null;
}
YaripItem.prototype.getForce = function()
{
    return this.force;
}
YaripItem.prototype.setPlaceholder = function(value)
{
    this.placeholder = "" + value == "true";
}
YaripItem.prototype.getPlaceholder = function()
{
    return this.placeholder;
}
YaripItem.prototype.setCreated = function(value)
{
    if (!value) return;

    value = Number(value);
    if (!isNaN(value)) {
        this.created = value;
    }
}
YaripItem.prototype.getCreated = function()
{
    return this.created;
}
YaripItem.prototype.setLastFound = function(value)
{
    if (!value) return;

    value = Number(value);
    if (!isNaN(value)) {
        this.lastFound = value;
    }
}
YaripItem.prototype.getLastFound = function()
{
    return this.lastFound;
}
YaripItem.prototype.incrementLastFound = function()
{
    this.lastFound = Date.now();
}
YaripItem.prototype.setFound = function(value)
{
    if (!value) return;

    value = Number(value);
    if (!isNaN(value)) {
        this.found = value;
    }
}
YaripItem.prototype.getFound = function()
{
    return this.found;
}
YaripItem.prototype.incrementFound = function()
{
    this.found++;
    this.lastFound = Date.now();
}
YaripItem.prototype.setNotFound = function(value)
{
    if (!value) return;

    value = Number(value);
    if (!isNaN(value)) {
        this.notFound = value;
    }
}
YaripItem.prototype.getNotFound = function()
{
    return this.notFound;
}
YaripItem.prototype.incrementNotFound = function()
{
    this.notFound++;
}
YaripItem.prototype.setIgnored = function(value)
{
    if (!value) return;

    value = Number(value);
    if (!isNaN(value)) {
        this.ignored = value;
    }
}
YaripItem.prototype.getIgnored = function()
{
    return this.ignored;
}
YaripItem.prototype.incrementIgnored = function()
{
    this.ignored++;
}
YaripItem.prototype.purge = function()
{
    this.created = Date.now();
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;
    this.ignored = 0;
}
YaripItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.xpath, this.style, this.script, this.priority, this.force, this.placeholder, this.created, this.lastFound, this.found, this.notFound, this.ignored);
    if (purge) tmp.purge();
    return tmp;
}
YaripItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    this.setForce(item.getForce() && this.getForce());
    this.setPlaceholder(item.getPlaceholder() || this.getPlaceholder());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripItem.prototype.compare = function(item)
{
    if (this.getPriority() < item.getPriority()) return -1;
    if (this.getPriority() > item.getPriority()) return 1;
    var aKey = this.getKey();
    var bKey = item.getKey();
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
}
YaripItem.prototype.generateXml = function()
{
    if (!this.xpath) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            " force=\"" + this.force + "\"" +
            " placeholder=\"" + this.placeholder + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.found > 0 ? " found=\"" + this.found + "\"" : "") +
            (this.notFound > 0 ? " notFound=\"" + this.notFound + "\"" : "") +
            (this.ignored > 0 ? " ignored=\"" + this.ignored + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<xpath><![CDATA[" + this.xpath + "]]></xpath>\n" +
        (this.style ? "\t\t\t\t\t<style><![CDATA[" + this.style + "]]></style>\n" : "") +
        (this.script ? "\t\t\t\t\t<script><![CDATA[" + this.script + "]]></script>\n" : "") +
        "\t\t\t\t</item>\n";
}
YaripItem.prototype.createStyle = function(force)
{
    if (this.force) {
//        if ((force || !this.style) && /^\/?(\/([a-z][\w]*|\*)(\[@[a-z][\w]*='[^']*'\])*)+$/i.test(this.xpath)) {
        if ((force || !this.style) && /^\/?(\/([a-z]\w*|\*)(\[(@[a-z]\w*='[^']*'|\d+)\])*)+$/i.test(this.xpath)) {
//            this.style = this.xpath.replace(/^\/+/, "").replace(/(([a-z][\w]*|\*)(\[@[a-z][\w]*='[^']*'\])*)\//gi, "$1 > ").replace(/\[@/g, "\[");
            this.style = this.xpath.
                    replace(/^\/+/, "").
                    replace(/((?:[a-z]\w*|\*)(?:\[(@[a-z]\w*='[^']*'|\d+)\])*)\//gi, "$1 > ").
                    replace(/\[@/g, "\[").
                    replace(/\[(\d+)\]/g, ":nth-of-type($1)");
        } else if (force) {
            this.style = null;
        }
    } else {
        this.style = null;
    }
}
YaripItem.prototype.generateCSS = function()
{
    if (this.force && this.style) {
        return this.style + ",\n";
    } else {
        return "";
    }
}
YaripItem.prototype.loadFromObject = function(obj)
{
    this.setXPath(obj.xpath);
    this.setStyle(obj.style);
    this.setScript(obj.script);
    this.setPriority(obj.priority);
    this.setForce(obj.force);
    this.setPlaceholder(obj.placeholder);
    this.setCreated(obj.created);
    this.setLastFound(obj.lastFound);
    this.setFound(obj.found);
    this.setNotFound(obj.notFound);
    this.setIgnored(obj.ignored);
}

function YaripElementWhitelistItem(xpath, priority, force, created, lastFound, found, notFound, ignored)
{
    this.xpath = "";
    this.priority = 0;
    this.force = false;
    this.created = -1;
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;
    this.ignored = 0;

    this.setXPath(xpath);
    this.setPriority(priority);
    this.setForce(force);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setFound(found);
    this.setNotFound(notFound);
    this.setIgnored(ignored);
}
YaripElementWhitelistItem.prototype = new YaripItem;
YaripElementWhitelistItem.prototype.constructor = YaripElementWhitelistItem;
YaripElementWhitelistItem.prototype.setForce = function(value)
{
    this.force = "" + value == "true";
}
YaripElementWhitelistItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.xpath, this.priority, this.force, this.created, this.lastFound, this.found, this.notFound, this.ignored);
    if (purge) tmp.purge();
    return tmp;
}
YaripElementWhitelistItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    this.setForce(item.getForce() || this.getForce());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripElementWhitelistItem.prototype.generateXml = function()
{
    if (!this.xpath) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            " force=\"" + this.force + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.found > 0 ? " found=\"" + this.found + "\"" : "") +
            (this.notFound > 0 ? " notFound=\"" + this.notFound + "\"" : "") +
            (this.ignored > 0 ? " ignored=\"" + this.ignored + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<xpath><![CDATA[" + this.xpath + "]]></xpath>\n" +
        "\t\t\t\t</item>\n";
}

function YaripElementBlacklistItem(xpath, style, priority, force, placeholder, created, lastFound, found, notFound, ignored)
{
    this.xpath = "";
    this.style = null;
    this.priority = 0;
    this.force = true;
    this.placeholder = false;
    this.created = -1;
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;
    this.ignored = 0;

    this.setXPath(xpath, true); // no style creation
    this.setStyle(style);
    this.setPriority(priority);
    this.setForce(force);
    this.setPlaceholder(placeholder);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setFound(found);
    this.setNotFound(notFound);
    this.setIgnored(ignored);

    this.createStyle(); // create style if null
}
YaripElementBlacklistItem.prototype = new YaripItem;
YaripElementBlacklistItem.prototype.constructor = YaripElementBlacklistItem;
YaripElementBlacklistItem.prototype.setXPath = function(value, noCreateStyle)
{
    if (!value) return;
    this.xpath = "" + value;
    this.setCreated(Date.now());
    if (!noCreateStyle) this.createStyle(true);
}
YaripElementBlacklistItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.xpath, this.style, this.priority, this.force, this.placeholder, this.created, this.lastFound, this.found, this.notFound, this.ignored);
    if (purge) tmp.purge();
    return tmp;
}
YaripElementBlacklistItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    this.setForce(item.getForce() && this.getForce());
    this.setPlaceholder(item.getPlaceholder() || this.getPlaceholder());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
    this.createStyle(); // reset style if not forced
}
YaripElementBlacklistItem.prototype.generateXml = function()
{
    if (!this.xpath) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            " force=\"" + this.force + "\"" +
            " placeholder=\"" + this.placeholder + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.found > 0 ? " found=\"" + this.found + "\"" : "") +
            (this.notFound > 0 ? " notFound=\"" + this.notFound + "\"" : "") +
            (this.ignored > 0 ? " ignored=\"" + this.ignored + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<xpath><![CDATA[" + this.xpath + "]]></xpath>\n" +
        (this.style ? "\t\t\t\t\t<style><![CDATA[" + this.style + "]]></style>\n" : "") +
        "\t\t\t\t</item>\n";
}

function YaripElementAttributeItem(xpath, name, value, priority, created, lastFound, found, notFound)
{
    this.xpath = "";
    this.name = "";
    this.value = "";
    this.priority = 0;
    this.created = -1;
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;

    this.setXPath(xpath);
    this.setName(name);
    this.setValue(value);
    this.setPriority(priority);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setFound(found);
    this.setNotFound(notFound);
}
YaripElementAttributeItem.prototype = new YaripItem;
YaripElementAttributeItem.prototype.constructor = YaripElementAttributeItem;
YaripElementAttributeItem.prototype.getId = function()
{
    return this.getXPath() + " " + this.getName();
}
YaripElementAttributeItem.prototype.setName = function(value)
{
    if (!value) return;
    this.name = value;
    this.setCreated(Date.now());
}
YaripElementAttributeItem.prototype.getName = function()
{
    return this.name;
}
YaripElementAttributeItem.prototype.setValue = function(value)
{
    if (value) this.value = value;
}
YaripElementAttributeItem.prototype.getValue = function()
{
    return this.value;
}
YaripElementAttributeItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.xpath, this.name, this.value, this.priority, this.created, this.lastFound, this.found, this.notFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripElementAttributeItem.prototype.merge = function(item)
{
    if (!item) return;
    this.setValue(item.getValue() || this.getValue());
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripElementAttributeItem.prototype.generateXml = function()
{
    if (!this.xpath || !this.name || !this.value) return "";
    var tmp = "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.found > 0 ? " found=\"" + this.found + "\"" : "") +
            (this.notFound > 0 ? " notFound=\"" + this.notFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<xpath><![CDATA[" + this.xpath + "]]></xpath>\n" +
        "\t\t\t\t\t<name><![CDATA[" + this.name + "]]></name>\n" +
        "\t\t\t\t\t<value><![CDATA[" + this.value + "]]></value>\n" +
        "\t\t\t\t</item>\n";
    return tmp;
}
YaripElementAttributeItem.prototype.loadFromObject = function(obj)
{
    this.setXPath(obj.xpath);
    this.setName(obj.name);
    this.setValue(obj.value);
    this.setPriority(obj.priority);
    this.setCreated(obj.created);
    this.setLastFound(obj.lastFound);
    this.setFound(obj.found);
    this.setNotFound(obj.notFound);
}

function YaripScriptItem(xpath, script, priority, created, lastFound, found, notFound)
{
    this.xpath = "";
    this.script = "";
    this.priority = 0;
    this.created = -1;
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;

    this.setXPath(xpath);
    this.setScript(script);
    this.setPriority(priority);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setFound(found);
    this.setNotFound(notFound);
}
YaripScriptItem.prototype = new YaripItem;
YaripScriptItem.prototype.constructor = YaripScriptItem;
YaripScriptItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.xpath, this.script, this.priority, this.created, this.lastFound, this.found, this.notFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripScriptItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripScriptItem.prototype.generateXml = function()
{
    if (!this.xpath) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.found > 0 ? " found=\"" + this.found + "\"" : "") +
            (this.notFound > 0 ? " notFound=\"" + this.notFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<xpath><![CDATA[" + this.xpath + "]]></xpath>\n" +
        "\t\t\t\t\t<script><![CDATA[" + this.script + "]]></script>\n" +
        "\t\t\t\t</item>\n";
}

function YaripPageScriptItem(xpath, script, priority, created, lastFound, found, notFound)
{
    this.xpath = "";
    this.script = "";
    this.priority = 0;
    this.created = -1;
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;

    this.setXPath(xpath);
    this.setPriority(priority);
    this.setScript(script);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setFound(found);
    this.setNotFound(notFound);
}
YaripPageScriptItem.prototype = new YaripScriptItem;
YaripPageScriptItem.prototype.constructor = YaripPageScriptItem;
YaripPageScriptItem.prototype.getId = function()
{
    return this.getCreated() + " " + this.getXPath();
}
YaripPageScriptItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.xpath, this.script, this.priority, this.created, this.lastFound, this.found, this.notFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripPageScriptItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripPageScriptItem.prototype.generateXml = function()
{
    if (!this.xpath) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.found > 0 ? " found=\"" + this.found + "\"" : "") +
            (this.notFound > 0 ? " notFound=\"" + this.notFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<xpath><![CDATA[" + this.xpath + "]]></xpath>\n" +
        "\t\t\t\t\t<script><![CDATA[" + this.script + "]]></script>\n" +
        "\t\t\t\t</item>\n";
}

function YaripContentItem(regExp, priority, force, created, lastFound, ignored)
{
    this.regExp = "";
    this.regexpobj = null;
    this.priority = 0;
    this.force = true;
    this.created = -1;
    this.lastFound = -1;
    this.ignored = 0;

    this.setRegExp(regExp);
    this.setPriority(priority);
    this.setForce(force);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setIgnored(ignored);
}
YaripContentItem.prototype = new YaripItem;
YaripContentItem.prototype.constructor = YaripContentItem;
YaripContentItem.prototype.getId = function()
{
    return this.getRegExp();
}
YaripContentItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.regExp, this.priority, this.force, this.created, this.lastFound, this.ignored);
    if (purge) tmp.purge();
    return tmp;
}
YaripContentItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    this.setForce(item.getForce() && this.getForce());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripContentItem.prototype.generateXml = function()
{
    if (!this.regExp) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            " force=\"" + this.force + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.ignored > 0 ? " ignored=\"" + this.ignored + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<regexp><![CDATA[" + this.regExp + "]]></regexp>\n" +
        "\t\t\t\t</item>\n";
}
YaripContentItem.prototype.loadFromObject = function(obj)
{
    this.setRegExp(obj.regExp);
    this.setPriority(obj.priority);
    this.setForce(obj.force);
    this.setCreated(obj.created);
    this.setLastFound(obj.lastFound);
    this.setIgnored(obj.ignored);
}

function YaripContentWhitelistItem(regExp, priority, force, created, lastFound)
{
    this.regExp = "";
    this.regexpobj = null;
    this.priority = 0;
    this.force = false;
    this.created = -1;
    this.lastFound = -1;

    this.setRegExp(regExp);
    this.setPriority(priority);
    this.setForce(force);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
}
YaripContentWhitelistItem.prototype = new YaripContentItem;
YaripContentWhitelistItem.prototype.constructor = YaripContentWhitelistItem;
YaripContentWhitelistItem.prototype.setForce = function(value)
{
    this.force = "" + value == "true";
}
YaripContentWhitelistItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.regExp, this.priority, this.force, this.created, this.lastFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripContentWhitelistItem.prototype.generateXml = function()
{
    if (!this.regExp) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            " force=\"" + this.force + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<regexp><![CDATA[" + this.regExp + "]]></regexp>\n" +
        "\t\t\t\t</item>\n";
}

function YaripContentBlacklistItem(regExp, priority, force, created, lastFound, ignored)
{
    this.regExp = "";
    this.regexpobj = null;
    this.firstRegExpObj = null;
    this.priority = 0;
    this.force = true;
    this.created = -1;
    this.lastFound = -1;
    this.ignored = 0;

    this.setRegExp(regExp);
    this.setPriority(priority);
    this.setForce(force);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setIgnored(ignored);
}
YaripContentBlacklistItem.prototype = new YaripContentItem;
YaripContentBlacklistItem.prototype.constructor = YaripContentBlacklistItem;

function YaripStreamItem(regExp, script, priority, created, lastFound)
{
    this.regExp = "";
    this.regexpobj = null;
    this.script = "";
    this.priority = 0;
    this.created = -1;
    this.lastFound = -1;

    this.setRegExp(regExp);
    this.setScript(script);
    this.setPriority(priority);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
}
YaripStreamItem.prototype = new YaripItem;
YaripStreamItem.prototype.constructor = YaripStreamItem;
YaripStreamItem.prototype.getId = function()
{
    return this.getRegExp();
}
YaripStreamItem.prototype.getRegExpObj = function()
{
    if (!this.regexpobj) {
        try {
            this.regexpobj = new RegExp(this.regExp, "gm");
        } catch (e) {
            yarip.logMessage(LOG_WARNING, new Error(this.sb.formatStringFromName("WARN_CREATE_REGEXP1", [this.regExp], 1)));
        }
    }
    return this.regexpobj;
}
YaripStreamItem.prototype.getFirstRegExpObj = function()
{
    if (!this.firstRegExpObj) {
        try {
            this.firstRegExpObj = new RegExp(this.regExp, "m");
        } catch (e) {
            yarip.logMessage(LOG_WARNING, new Error(this.sb.formatStringFromName("WARN_CREATE_REGEXP1", [this.firstRegExpObj], 1)));
        }
    }
    return this.firstRegExpObj;
}
YaripStreamItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.regExp, this.script, this.priority, this.created, this.lastFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripStreamItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripStreamItem.prototype.generateXml = function()
{
    if (!this.regExp) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<regexp><![CDATA[" + this.regExp + "]]></regexp>\n" +
        "\t\t\t\t\t<script><![CDATA[" + this.script + "]]></script>\n" +
        "\t\t\t\t</item>\n";
}
YaripStreamItem.prototype.loadFromObject = function(obj)
{
    this.setRegExp(obj.regExp);
    this.setScript(obj.script);
    this.setPriority(obj.priority);
    this.setCreated(obj.created);
    this.setLastFound(obj.lastFound);
}

function YaripStyleItem(xpath, style, priority, created, lastFound, found, notFound)
{
    this.xpath = "";
    this.style = "";
    this.priority = 0;
    this.created = -1;
    this.lastFound = -1;
    this.found = 0;
    this.notFound = 0;

    this.setXPath(xpath);
    this.setStyle(style);
    this.setPriority(priority);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
    this.setFound(found);
    this.setNotFound(notFound);
}
YaripStyleItem.prototype = new YaripItem;
YaripStyleItem.prototype.constructor = YaripStyleItem;
YaripStyleItem.prototype.getId = function()
{
    return this.getCreated() + " " + this.getXPath();
}
YaripStyleItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.xpath, this.style, this.priority, this.created, this.lastFound, this.found, this.notFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripStyleItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripStyleItem.prototype.generateXml = function()
{
    if (!this.xpath) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
            (this.found > 0 ? " found=\"" + this.found + "\"" : "") +
            (this.notFound > 0 ? " notFound=\"" + this.notFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<xpath><![CDATA[" + this.xpath + "]]></xpath>\n" +
        "\t\t\t\t\t<style><![CDATA[" + this.style + "]]></style>\n" +
        "\t\t\t\t</item>\n";
}

function YaripHeaderItem(regExp, headerName, script, priority, merge, created, lastFound)
{
    this.regExp = "";
    this.regexpobj = null;
    this.headerName = null;
    this.script = "";
    this.priority = 0;
    this._merge = false;
    this.created = -1;
    this.lastFound = -1;

    this.setRegExp(regExp);
    this.setHeaderName(headerName);
    this.setScript(script);
    this.setPriority(priority);
    this.setMerge(merge);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
}
YaripHeaderItem.prototype = new YaripItem;
YaripHeaderItem.prototype.constructor = YaripHeaderItem;
YaripHeaderItem.prototype.getId = function()
{
    return this.getRegExp() + " " + this.getHeaderName();
}
YaripHeaderItem.prototype.setHeaderName = function(value)
{
    if (!value && value != "") return;

    this.headerName = value;
    this.setCreated(Date.now());
}
YaripHeaderItem.prototype.getHeaderName = function()
{
    return this.headerName;
}
YaripHeaderItem.prototype.setMerge = function(value)
{
    this._merge = "" + value == "true";
}
YaripHeaderItem.prototype.getMerge = function()
{
    return this._merge;
}
YaripHeaderItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.regExp, this.headerName, this.script, this.priority, this._merge, this.created, this.lastFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripHeaderItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    this.setMerge(item.getMerge() || this.getMerge());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripHeaderItem.prototype.generateXml = function()
{
    if (!this.regExp || !this.getHeaderName()) return "";
    return "\t\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            (this._merge ? " merge=\"" + this._merge + "\"" : "") +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t\t<regexp><![CDATA[" + this.regExp + "]]></regexp>\n" +
        "\t\t\t\t\t\t<name><![CDATA[" + this.headerName + "]]></name>\n" +
        "\t\t\t\t\t\t<script><![CDATA[" + this.script + "]]></script>\n" +
        "\t\t\t\t\t</item>\n";
}
YaripHeaderItem.prototype.loadFromObject = function(obj)
{
    this.setRegExp(obj.regExp);
    this.setHeaderName(obj.headerName);
    this.setPriority(obj.priority);
    this.setScript(obj.script);
    this.setMerge(obj.merge);
    this.setCreated(obj.created);
    this.setLastFound(obj.lastFound);
}

function YaripRedirectItem(regExp, newsubstr, priority, created, lastFound)
{
    this.regExp = "";
    this.regexpobj = null;
    this.newsubstr = "";
    this.priority = 0;
    this.created = -1;
    this.lastFound = -1;

    this.setRegExp(regExp);
    this.setScript(newsubstr);
    this.setPriority(priority);
    this.setCreated(created ? created : Date.now());
    this.setLastFound(lastFound);
}
YaripRedirectItem.prototype = new YaripItem;
YaripRedirectItem.prototype.constructor = YaripRedirectItem;
YaripRedirectItem.prototype.getId = function()
{
    return this.getRegExp();
}
YaripRedirectItem.prototype.setScript = function(value)
{
    if (!value && value != "") return;

    this.newsubstr = value;
}
YaripRedirectItem.prototype.getScript = function()
{
    return this.newsubstr;
}
YaripRedirectItem.prototype.clone = function(purge)
{
    var tmp = new this.constructor(this.regExp, this.newsubstr, this.priority, this.created, this.lastFound);
    if (purge) tmp.purge();
    return tmp;
}
YaripRedirectItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripRedirectItem.prototype.generateXml = function()
{
    if (!this.regExp) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
            (this.lastFound > -1 ? " lastFound=\"" + this.lastFound + "\"" : "") +
        ">\n" +
        "\t\t\t\t\t<regexp><![CDATA[" + this.regExp + "]]></regexp>\n" +
        (this.newsubstr ? "\t\t\t\t\t<newsubstr><![CDATA[" + this.newsubstr + "]]></newsubstr>\n" : "") +
        "\t\t\t\t</item>\n";
}
YaripRedirectItem.prototype.loadFromObject = function(obj)
{
    this.setRegExp(obj.regExp);
    this.setScript(obj.newsubstr);
    this.setPriority(obj.priority);
    this.setCreated(obj.created);
    this.setLastFound(obj.lastFound);
}

function YaripExtensionItem(id, priority, doElements, doContents, doScripts, doHeaders, doRedirects, doStreams, doLinks, created, isSelf)
{
    this.id = "";
    this.priority = 0;
    this.doElements = false;
    this.doContents = false;
    this.doScripts = false;
    this.doHeaders = false;
    this.doRedirects = false;
    this.doStreams = false;
    this.doLinks = false;
    this.created = -1;
    this._isSelf = false;
    this.toObj = null;
    this.fromObj = null;

    this.setId(id);
    this.setPriority(priority);
    this.setDoElements(doElements);
    this.setDoContents(doContents);
    this.setDoScripts(doScripts);
    this.setDoHeaders(doHeaders);
    this.setDoRedirects(doRedirects);
    this.setDoStreams(doStreams);
    this.setDoLinks(doLinks);
    this.setCreated(created ? created : Date.now());
    this.setIsSelf(isSelf);
}
YaripExtensionItem.prototype = new YaripItem;
YaripExtensionItem.prototype.constructor = YaripExtensionItem;
YaripExtensionItem.prototype.getId = function()
{
    return this.id;
}
YaripExtensionItem.prototype.setId = function(id)
{
    if (!id) return;

    this.id = "" + id;
    this.setCreated(Date.now());
}
//YaripExtensionItem.prototype.setValue = function(value)
//{
//    if (!value) return;

//    this.id = "" + value;
//    this.setCreated(Date.now());
//}
YaripExtensionItem.prototype.setDoElements = function(value)
{
    this.doElements = "" + value == "true";
}
YaripExtensionItem.prototype.getDoElements = function()
{
    return this.doElements;
}
YaripExtensionItem.prototype.setDoContents = function(value)
{
    this.doContents = "" + value == "true";
}
YaripExtensionItem.prototype.getDoContents = function()
{
    return this.doContents;
}
YaripExtensionItem.prototype.setDoScripts = function(value)
{
    this.doScripts = "" + value == "true";
}
YaripExtensionItem.prototype.getDoScripts = function()
{
    return this.doScripts;
}
YaripExtensionItem.prototype.setDoHeaders = function(value)
{
    this.doHeaders = "" + value == "true";
}
YaripExtensionItem.prototype.getDoHeaders = function()
{
    return this.doHeaders;
}
YaripExtensionItem.prototype.setDoRedirects = function(value)
{
    this.doRedirects = "" + value == "true";
}
YaripExtensionItem.prototype.getDoRedirects = function()
{
    return this.doRedirects;
}
YaripExtensionItem.prototype.setDoStreams = function(value)
{
    this.doStreams = "" + value == "true";
}
YaripExtensionItem.prototype.getDoStreams = function()
{
    return this.doStreams;
}
YaripExtensionItem.prototype.setDoLinks = function(value)
{
    this.doLinks = "" + value == "true";
}
YaripExtensionItem.prototype.getDoLinks = function()
{
    return this.doLinks;
}
YaripExtensionItem.prototype.doesSomething = function()
{
    return this.getDoElements() ||
            this.getDoContents() ||
            this.getDoScripts() ||
            this.getDoHeaders() ||
            this.getDoRedirects() ||
            this.getDoStreams() ||
            this.getDoLinks();
}
YaripExtensionItem.prototype.does = function(flag)
{
    switch (flag) {
    case DO_ELEMENTS: return this.getDoElements();
    case DO_CONTENTS: return this.getDoContents();
    case DO_SCRIPTS: return this.getDoScripts();
    case DO_HEADERS: return this.getDoHeaders();
    case DO_REDIRECTS: return this.getDoRedirects();
    case DO_STREAMS: return this.getDoStreams();
    case DO_LINKS: return this.getDoLinks();
    }
}
YaripExtensionItem.prototype.updateDo = function(maskItem, extItem, matchObj)
{
    if (!matchObj) {
        if (maskItem.getDoElements() && extItem.getDoElements()) this.setDoElements(true);
        if (maskItem.getDoContents() && extItem.getDoContents()) this.setDoContents(true);
        if (maskItem.getDoScripts() && extItem.getDoScripts()) this.setDoScripts(true);
        if (maskItem.getDoHeaders() && extItem.getDoHeaders()) this.setDoHeaders(true);
        if (maskItem.getDoRedirects() && extItem.getDoRedirects()) this.setDoRedirects(true);
        if (maskItem.getDoStreams() && extItem.getDoStreams()) this.setDoStreams(true);
        if (maskItem.getDoLinks() && extItem.getDoLinks()) this.setDoLinks(true);
    } else {
        if (matchObj.element && maskItem.getDoElements() && extItem.getDoElements()) this.setDoElements(true);
        if (matchObj.content && maskItem.getDoContents() && extItem.getDoContents()) this.setDoContents(true);
        if (matchObj.script && maskItem.getDoScripts() && extItem.getDoScripts()) this.setDoScripts(true);
        if (matchObj.header && maskItem.getDoHeaders() && extItem.getDoHeaders()) this.setDoHeaders(true);
        if (matchObj.redirect && maskItem.getDoRedirects() && extItem.getDoRedirects()) this.setDoRedirects(true);
        if (matchObj.stream && maskItem.getDoStreams() && extItem.getDoStreams()) this.setDoStreams(true);
        if (matchObj.link && maskItem.getDoLinks() && extItem.getDoLinks()) this.setDoLinks(true);
    }
}
YaripExtensionItem.prototype.setIsSelf = function(value)
{
    this._isSelf = "" + value == "true";
}
YaripExtensionItem.prototype.isSelf = function()
{
    return this._isSelf;
}
YaripExtensionItem.prototype.addTo = function(childItem)
{
    if (!this.toObj) this.toObj = {};
    if (!this.isChildOf(childItem)) {
        this.toObj[childItem.getId()] = childItem;
        return true;
    } else {
        return false;
    }
}
YaripExtensionItem.prototype.addFrom = function(parentItem)
{
    if (!this.fromObj) this.fromObj = {};
    this.fromObj[parentItem.getId()] = parentItem;
}
YaripExtensionItem.prototype.isChildOf = function(parentItem)
{
    if (!this.fromObj) {
        return false;
    } else if (parentItem.getId() in this.fromObj) {
        return true;
    } else {
        for each (var item in this.fromObj) {
            if (item.isChildOf(parentItem)) return true;
        }
        return false;
    }
}
YaripExtensionItem.prototype.traverse = function(fun)
{
    var obj = {};
    function inOrder(node) {
        if (node && !obj[node.getId()]) {
            obj[node.getId()] = true;
            // adding dependents
            for each (var item in node.fromObj) {
                if (!obj[item.getId()]) {
                    inOrder(item);
                }
            }
            // adding self; if not root
            if (node.getId()) fun.call(this, node);
            // adding dependencies
            for each (var item in node.toObj) {
                inOrder(item);
            }
        }
    }
    inOrder(this);
}
YaripExtensionItem.prototype.clone = function(id)
{
    return new this.constructor(id ? id : this.id, this.priority, this.doElements, this.doContents, this.doScripts, this.doHeaders, this.doRedirects, this.doStreams, this.doLinks, this.created);
}
YaripExtensionItem.prototype.merge = function(item)
{
    if (!item) return;
    if (item.getPriority() < this.getPriority()) this.setPriority(item.getPriority());
    this.setDoElements(item.getDoElements() || this.getDoElements());
    this.setDoContents(item.getDoContents() || this.getDoContents());
    this.setDoScripts(item.getDoScripts() || this.getDoScripts());
    this.setDoHeaders(item.getDoHeaders() || this.getDoHeaders());
    this.setDoRedirects(item.getDoRedirects() || this.getDoRedirects());
    this.setDoStreams(item.getDoStreams() || this.getDoStreams());
    this.setDoLinks(item.getDoLinks() || this.getDoLinks());
    if (this.getCreated() == -1 || item.getCreated() < this.getCreated()) this.setCreated(item.getCreated());
}
YaripExtensionItem.prototype.getPage = function()
{
    return this.getPageById(this.id);
}
YaripExtensionItem.prototype.compare = function(item)
{
    if (this.getPriority() < item.getPriority()) return -1;
    if (this.getPriority() > item.getPriority()) return 1;
    return this.getPage().compare(item.getPage());
}
YaripExtensionItem.prototype.generateXml = function()
{
    if (!this.id) return "";
    return "\t\t\t\t" +
        "<item" +
            " priority=\"" + this.priority + "\"" +
            " doElements=\"" + this.doElements + "\"" +
            " doContents=\"" + this.doContents + "\"" +
            " doScripts=\"" + this.doScripts + "\"" +
            " doHeaders=\"" + this.doHeaders + "\"" +
            " doRedirects=\"" + this.doRedirects + "\"" +
            " doStreams=\"" + this.doStreams + "\"" +
            " doLinks=\"" + this.doLinks + "\"" +
            (this.created > -1 ? " created=\"" + this.created + "\"" : "") +
        ">" + this.id + "</item>\n";
}
YaripExtensionItem.prototype.loadFromObject = function(obj)
{
    this.setId(obj.value);
    this.setPriority(obj.priority);
    this.setDoElements(obj.doElements);
    this.setDoContents(obj.doContents);
    this.setDoScripts(obj.doScripts);
    this.setDoHeaders(obj.doHeaders);
    this.setDoRedirects(obj.doRedirects);
    this.setDoStreams(obj.doStreams);
    this.setDoLinks(obj.doLinks);
    this.setCreated(obj.created);
}

