
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

function YaripHandler(doc, stopCallback, statusCallback)
{
    this.doc = doc ? doc : null;
    this.stopCallback = stopCallback ? stopCallback : function() {};
    this.statusCallback = statusCallback ? statusCallback : function(status) {};

    this.element = null;
    this.timeout = null;
    this.outline = null;
    this.xpath = null;
    this.pageName = null;
    this.handlers = [];
    this.active = false;
    this.changesMade = false;
    this.hasWhitelist = false;
    this.hasBlacklist = false;
    this.selectStack = null;

    this.start = function(doc)
    {
        if (doc) this.doc = doc;

        this.pageName = yarip.getPageName(this.doc.location);
        this.active = false;
        this.changesMade = false;
        this.hasWhitelist = false;
        this.hasBlacklist = false;

        if (this.doc && this.doc.nodeName === "#document" && this.pageName)
        {
            this.doc.addEventListener("mouseover", this, false);
            this.doc.addEventListener("mouseout", this, false);
            this.doc.addEventListener("mousedown", this, false);
            window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                .getInterface(Components.interfaces.nsIWebNavigation)
                .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                .rootTreeItem
                .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                .getInterface(Components.interfaces.nsIDOMWindow).addEventListener("keypress", this, false);
            this.active = true;
        }

        var frames = this.doc.defaultView.frames;
        if (frames) {
            for (var i = 0; i < frames.length; i++) {
                this.addHandler(new YaripHandler(frames[i].document, this.stopCallback, this.statusCallback));
            }
        }

        if (this.handlers.length > 0) {
            for (var i = 0; i < this.handlers.length; i++) {
                if (this.handlers[i].start(null)) this.active = true;
            }
        }

        if (this.doc.defaultView) this.doc.defaultView.focus();

        return this.active;
    }

    this.stop = function()
    {
        if (!this.active || !this.doc) return false;

        try {
            this.doc.removeEventListener("mouseover", this, false);
            this.doc.removeEventListener("mouseout", this, false);
            this.doc.removeEventListener("mousedown", this, false);
        } catch (e) {}

        if (this.handlers.length > 0) for (var i = 0; i < this.handlers.length; i++) if (this.handlers[i].stop()) this.changesMade = true;
        this.handlers = [];

        if (this.hasWhitelist && !this.hasBlacklist) yarip.removeAllExceptWhitelisted(this.doc, this.pageName);

        this.reset();
        this.doc = null;
        this.active = false;

        return this.changesMade;
    }

    this.addHandler = function(handler)
    {
        if (!handler) return;

        this.handlers[this.handlers.length] = handler;
    }

    this.handleEvent = function(event)
    {
        if (!event.target.localName || /^(frameset|i?frame)$/i.test(event.target.localName)) return; // ignore elements

        switch (event.type) {
        case "mouseover":
            if (/^(html|body)$/i.test(event.target.localName)) return;
            if (this.element) this.reset();
            this.element = event.target;
            if (!this.element.href) this.switchWithAnchorAncestor();
            this.selectStack = [];
            var ref = this;
            this.timeout = setTimeout(function() { ref.select(ref); }, 100);
            event.stopPropagation();
            break;

        case "mouseout":
            if (!this.element) break;
            this.reset();
            event.stopPropagation();
            break;

        case "mousedown":
            switch (event.button) {
            case 0: // left (blacklist)
                this.doBlacklisting();
                break;

            case 1: // middle (blacklist temporarily)
                this.doBlacklisting(true);
                break;
            }
            event.stopPropagation();
            break;

        case "keypress":
            switch (event.keyCode) {
            case 27: // escape
                this.stopCallback();
                event.preventDefault();
                break;

            case 0: // character
                switch (event.charCode) {
                case 119: // `w' (whitelist)
                    this.doWhitelisting();
                    event.stopPropagation();
                    break;

                case 107: // `k' (keep, whitelist temporarily)
                    this.doWhitelisting(true);
                    event.stopPropagation();
                    break;

                case 98: // `b' (blacklist)
                    this.doBlacklisting();
                    event.stopPropagation();
                    break;

                case 99: // `c' (child select)
                    if (!this.element) return;
                    var child = this.selectStack.pop();
                    if (!child) return;
                    this.reset();
                    this.element = child;
                    this.select(this);
                    event.stopPropagation();
                    break;

                case 112: // `p' (parent select)
                    if (!this.element) return;
                    var parent = this.element.parentNode;
                    if (!parent || /^(html|body)$/i.test(parent.localName)) return;
                    this.selectStack.push(this.element);
                    this.reset();
                    this.element = parent;
                    if (!this.element.href) this.switchWithAnchorAncestor();
                    this.select(this);
                    event.stopPropagation();
                    break;

                case 114: // `r' (remove, blacklist temporarily)
                case 116: // `t' (remove, blacklist temporarily)
                    this.doBlacklisting(true);
                    event.stopPropagation();
                    break;
                }
            }
            break;
        }
    }

    this.switchWithAnchorAncestor = function()
    {
        if (!/^(abbr|acronym|b|basefont|bdo|big|br|button|cite|code|del|dfn|em|font|i|img|ins|kbd|label|map|q|samp|select|small|span|strong|sub|sup|textarea|tt|u|var)$/i.test(this.element.localName)) return; // lagal children of anchors

        var xpath = yarip.createXPath(this.element, true);
        var expr = xpath.match(/^.*?\/a\b[^/]*/);
        if (!expr) return;

        var elements = yarip.getNodesByXPath(this.doc, expr[0], ELEMENT_NODE);
        if (elements.length === 0) return;

        this.element = elements[0];
        this.xpath = yarip.createXPath(this.element);
    }

    this.select = function(handler, noBackup)
    {
        if (!handler) handler = this;
        if (!handler.element) return;

        if (handler.element.nodeType !== 2) {
            if (!noBackup) handler.outline = handler.element.style.outline;
            if (/^whitelisted\b/.test(handler.element.getAttribute("status"))) handler.element.style.outline = "3px solid #990000";
            else handler.element.style.outline = "3px solid #000099";
        }

        if (!handler.xpath) handler.xpath = yarip.createXPath(handler.element);
        handler.statusCallback(handler.xpath);
    }

    this.doWhitelisting = function(temporarily)
    {
        if (!this.element) return;

        if (!this.xpath) this.xpath = yarip.createXPath(this.element);
        var item = new YaripElementWhitelistItem(this.xpath + "/descendant-or-self::*");
        if (temporarily) {
            if (yarip.whitelistElementItem(this.doc, this.pageName, item)) {
                this.hasWhitelist = true;
                this.select(null, true);
            }
        } else if (yarip.whitelistElementItem(this.doc, this.pageName, item, true, true)) {
            this.hasBlacklist = true; // don't removeAllExceptWhitelisted!
            this.changesMade = true;
            this.select(null, true);
        }
    }

    this.doBlacklisting = function(temporarily)
    {
        if (!this.element) return;

        if (!this.xpath) this.xpath = yarip.createXPath(this.element);
        var item = new YaripElementBlacklistItem(this.xpath);
        if (temporarily) {
            this.hasBlacklist = yarip.blacklistElementItem(this.doc, this.pageName, item);
        } else if (yarip.blacklistElementItem(this.doc, this.pageName, item, true, true)) {
            this.hasBlacklist = true; // don't removeAllExceptWhitelisted!
            this.changesMade = true;
        }

        this.reset();
    }

    this.reset = function()
    {
        clearTimeout(this.timeout);

        try {
            if (this.element && this.element.nodeType !== 2) {
                this.element.style.outline = this.outline;
                if (this.element.getAttribute("style") === "") {
                    this.element.removeAttribute("style");
                }
            }
        } catch(e) {}

        this.element = null;
        this.xpath = null;
        this.outline = null;
    }
}
