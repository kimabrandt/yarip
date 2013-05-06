
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

function YaripMonitorDialog() {
    this.id = -1;
    this.hidden = true;
    this.stringbundle = null;
    this.tree = null;
    this.doScroll = true;
    this.knownContent = {};

    this.openLocation = function() {
        if (this.tree.currentIndex < 0) return;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        if (item.content) {
            yarip.openLocation(item.content.href);
        }
    }

    this.copyLocation = function() {
        if (this.tree.currentIndex < 0) return;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        if (item.content) CH.copyString(item.content.href);
    }

    this.whitelistContent = function() {
        if (this.tree.currentIndex < 0) return;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        var pageName = yarip.getFirstAddress(item.location.asciiHref, true);
        if (!pageName) {
            pageName = item.location.pageName;
            if (!pageName) return;
        }

        var regExp = yarip.generateRegExp(item.content.asciiHref);
        if (!regExp) return;

        var obj = {
            pageName: pageName,
            location: item.location,
            content: item.content,
            item: new YaripContentWhitelistItem(regExp)
        }

        window.openDialog("chrome://yarip/content/whitelistcontentdialog.xul", "whitelistcontentdialog", "chrome,modal,resizable", obj);

        if (!obj.pageName) return;
        if (!obj.item) return;

        yarip.whitelistContentItem(item.location, obj.pageName, obj.item);
    }

    this.blacklistContent = function() {
        if (this.tree.currentIndex < 0) return;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        var pageName = yarip.getFirstAddress(item.location.asciiHref, true);
        if (!pageName) {
            pageName = item.location.pageName;
            if (!pageName) return;
        }

        var regExp = yarip.generateRegExp(item.content.asciiHref);
        if (!regExp) return;

        var obj = {
            pageName: pageName,
            location: item.location,
            content: item.content,
            item: new YaripContentBlacklistItem(regExp)
        }

        window.openDialog("chrome://yarip/content/blacklistcontentdialog.xul", "blacklistcontentdialog", "chrome,modal,resizable", obj);

        if (!obj.pageName) return;
        if (!obj.item) return;

        yarip.blacklistContentItem(item.location, obj.pageName, obj.item);
    }

    this.extendPage = function() {
        if (this.tree.currentIndex < 0) return;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        var pageName = yarip.getFirstAddress(item.location.asciiHref, true);
        if (!pageName) {
            pageName = item.location.pageName;
            if (!pageName) return;
        }

        var contentAddress = yarip.getFirstAddress(item.content.asciiHref, true);
        if (!contentAddress) {
            contentAddress = yarip.getPageName(item.content);
            if (!contentAddress) return;
        }

        var pageExt = yarip.createPage(item.content, contentAddress, true /* privateBrowsing/temporary */, true /* byUser */);
        var extItem = yarip.createPageExtensionItem(pageExt);

        var obj = {
            pageName: pageName,
            location: item.location,
            content: item.content,
            contentAddress: contentAddress,
            extItem: extItem
        }

        window.openDialog("chrome://yarip/content/extendpagedialog.xul", "extendpagedialog", "chrome,modal,resizable", obj);

        if (!obj.pageName || !obj.contentAddress || !obj.extItem) {
            if (pageExt.getTemporary()) yarip.map.remove(pageExt);
        } else {
            yarip.extendPage(obj.location, obj.pageName, obj.content, obj.contentAddress, obj.extItem);
        }
    }

    this.createPage = function() {
        if (this.tree.currentIndex < 0) return;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        var pageName = yarip.getFirstAddress(item.location.asciiHref, true);
        if (!pageName) {
            pageName = item.location.pageName;
            if (!pageName) return;
        }

        var obj = {
            pageName: pageName,
            content: item.content,
            location: item.location
        }

        window.openDialog("chrome://yarip/content/createpagedialog.xul", "createpagedialog", "chrome,modal,resizable", obj);

        if (!obj.pageName) return;

        var page = yarip.createPage(obj.location, obj.pageName, null, true /* byUser */);
        yaripOverlay.managePages(page.getName());
    }

    this.getPageName = function() {
        if (this.tree.currentIndex < 0) return null;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        return yarip.getFirstAddress(item.location.asciiHref);
    }

    this.getContentPageName = function() {
        if (this.tree.currentIndex < 0) return null;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        if (item.itemObj && item.itemObj.pageName) {
            return item.itemObj.pageName;
        } else {
            return yarip.getFirstAddress(item.location.asciiHref);
        }
    }

    this.getType = function() {
        if (this.tree.currentIndex < 0) return null;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        if (item.itemObj) {
            return item.itemObj.ruleType;
        } else {
            return null;
        }
    }

    this.getKey = function() {
        if (this.tree.currentIndex < 0) return null;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        if (item.itemObj) {
            return item.itemObj.itemKey;
        } else {
            return null;
        }
    }

    this.copyRegExp = function() {
        if (this.tree.currentIndex < 0) return;

        var item = yaripMonitorTreeView.getItem(this.tree.currentIndex);
        var regExp = yarip.generateRegExp(item.content.asciiHref);
        if (regExp) CH.copyString(regExp);
    }

    this.logContent = function(status, location, content, date, contentType, itemObj) {
        if (!location || !content) return false;
        if (this.hidden && !yarip.logWhenClosed) return true;

        var key = location.pageName + " " + content.asciiHref;
        if (status === this.knownContent[key]) return false;

        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var item = {
            "location": location,
            "content": content,
            "time": (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (milliseconds < 10 ? "00" : (milliseconds < 100 ? "0" : "")) + milliseconds,
            "dateTime": date.getTime(),
            "itemObj": itemObj,
            "key": key,
            "status": status,
            "locationHref": location.href,
            "locationAsciiHref": location.asciiHref,
            "contentHref": content.href,
            "contentAsciiHref": content.asciiHref,
            "contentType": contentType ? "(guess) " + contentType : null
        };
        yaripMonitorTreeView.appendItem(item, this.doScroll, this.hidden);
        this.knownContent[key] = status;
        return true;
    }

    this.updateContentType = function(_status, location, content, contentType, statusCode) {
        if (!location || !content || !contentType && !statusCode) return;

        contentType = contentType !== "application/x-unknown-content-type" ? contentType : null;
        yaripMonitorTreeView.updateContentType(location, content, contentType, statusCode, this.hidden);
    }

    this.clear = function() {
        document.getElementById("yarip-filter-textbox").value = "";
        yaripMonitorTreeView.clearItems();
        this.knownContent = {};
        yarip.resetKnown();
    }

    this.handleEvent = function(event) {
        if (!event) return;

        switch(event.target.id) {
        case "yarip-monitor-menupopup":
            switch(event.type) {
            case "popupshowing":
                var hidden = String(!yaripMonitorTreeView.getItem(this.tree.currentIndex));
                document.getElementById("yarip-openLocation-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-copyLocation-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-copyLocation-menuseparator").setAttribute("hidden", hidden);
                document.getElementById("yarip-whitelistContent-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-blacklistContent-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-extendPage-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-copyRegExp-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-copyRegExp-menuseparator").setAttribute("hidden", hidden);
                document.getElementById("yarip-goto-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-copyRegExp-menuitem").setAttribute("hidden", hidden);
                document.getElementById("yarip-copyRegExp-menuseparator").setAttribute("hidden", hidden);
                break;
            }
            break;
        case "yarip-content-tree":
            this.doScroll = yaripMonitorTreeView.rowCount === this.tree.currentIndex + 1;
            yaripMonitorTreeView.getItem(this.tree.currentIndex, true); // updating dateTime
            break;
        }
    }

    this.load = function() {
        this.stringbundle = document.getElementById("monitor-dialog-stringbundle");
        this.tree = document.getElementById("yarip-content-tree");
        this.tree.view = yaripMonitorTreeView;
        this.tree.addEventListener("select", this, false);
        yarip.addMonitorDialog(this);
    }

    this.toggleShow = function() {
        if (this.hidden) {
            this.show();
        } else {
            this.hide();
        }
    }

    this.unload = function() {
        this.hide();
        this.tree.removeEventListener("select", this, false);
        yarip.removeMonitorDialog(this);
    }

    this.show = function() {
        if (this.hidden) {
            document.getElementById('yarip-monitor-splitter').hidden = false;
            document.getElementById('yarip-monitor').hidden = false;
            this.hidden = false;
        }
    }

    this.hide = function() {
        if (!this.hidden) {
            document.getElementById('yarip-monitor-splitter').hidden = true;
            document.getElementById('yarip-monitor').hidden = true;
            this.hidden = true;
        }
    }

    this.filterContent = function(event) {
        yaripMonitorTreeView.applyFilterString(event.target.value, this.tree.currentIndex);
    }

    this.filterStatus = function(status, event) {
        yaripMonitorTreeView.applyFilterStatus(status, this.tree.currentIndex, event.target.getAttribute("checked") === "true");
    }
}

var yaripMonitorTreeView = {
    treebox: null,
    childData: [],
    childDataObj: {},
    visibleData: [],
    whitelisted: Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService).getAtom("whitelisted"),
    blacklisted: Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService).getAtom("blacklisted"),
    redirected: Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService).getAtom("redirected"),
    filterString: null,
    filterRegExp: null,
    filterError: false,
    dateTime: null,

    get rowCount() { return this.visibleData.length; },

    cycleHeader: function(col) {},
    getCellProperties: function(row, col, properties) {
        if (col.id !== "status") return;
        if (row < 0 || row >= this.visibleData.length) return;

        switch (this.visibleData[row].status) {
        case STATUS_WHITELISTED:
            properties.AppendElement(this.whitelisted);
            break;
        case STATUS_BLACKLISTED:
            properties.AppendElement(this.blacklisted);
            break;
        case STATUS_REDIRECTED:
            properties.AppendElement(this.redirected);
            break;
        }
    },
    getCellText: function(row, col) {
        var colid = col.id;
        if (colid === "status") return "";
        if (row < 0 || row >= this.visibleData.length) return "";

        var cellText = this.visibleData[row][colid];
        if (cellText) {
            return cellText;
        } else {
            return null;
        }
    },
    canDrop: function(index, orientation) { return false; },
    cycleCell: function(row, col) {},
    drop: function(row, orientation) { return 0; },
    getCellValue: function(row, col) { return ""; },
    getColumnProperties: function(col, properties) {},
    getImageSrc: function(row, col) { return ""; },
    getLevel: function(index) { return 0; },
    getParentIndex: function(rowIndex) { return -1; },
    getProgressMode: function(row, col) { return false; },
    getRowProperties: function(index, properties) {},
    hasNextSibling: function(rowIndex, afterIndex) { return false; },
    isContainerEmpty: function(index) { return false; },
    isContainer: function(index) { return false; },
    isContainerOpen: function(index) { return false; },
    isEditable: function(row, col) { return false; },
    isSelectable: function(row, col) { return false; },
    isSeparator: function(index) { return false; },
    isSorted: function() { return false; },
    performAction: function(action) {},
    performActionOnCell: function(action, row, col) {},
    performActionOnRow: function(action, row) {},
    selectionChanged: function() {},
    setCellText: function(row, col, value) {},
    setCellValue: function(row, col, value) {},
    setTree: function(treebox) { this.treebox = treebox; },
    toggleOpenState: function(index) {},

    appendItem: function(item, doScroll, hidden) {
        if (this.childDataObj[item.key]) {
            this.childDataObj[item.key].push(item);
        } else {
            this.childDataObj[item.key] = [item];
        }

        this.childData.push(item);
        if (this.allowItem(item)) {
            this.visibleData.push(item);
            var index = this.visibleData.length - 1;
            item.index = index;
            if (this.treebox && !hidden) {
                this.treebox.rowCountChanged(index, 1);
                if (doScroll) this.treebox.ensureRowIsVisible(index);
                this.treebox.invalidateRow(item.index);
            }
        }
    },

    getItem: function(index, updateDateTime) {
        var item = this.visibleData[index];
        if (updateDateTime && item) this.dateTime = item.dateTime;
        return item;
    },

    updateContentType: function(location, content, contentType, statusCode, hidden) {
        var key = location.pageName + " " + content.asciiHref;
        var items = this.childDataObj[key];
        if (!items) return;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item.statusCode && item.status !== STATUS_BLACKLISTED && item.status !== STATUS_REDIRECTED) {
                if (contentType) item.contentType = contentType;
                if (statusCode) item.statusCode = statusCode;
                if (this.treebox && !hidden) {
                    this.treebox.invalidateRow(item.index);
                }
                return;
            }
        }
    },

    clearItems: function() {
        if (!this.treebox) return;

        var oldRows = this.rowCount;
        this.childData = [];
        this.visibleData = [];
        this.childDataObj = {};
        this.treebox.rowCountChanged(0, -oldRows);
        this.filterString = null;
        this.filterRegExp = null;
        this.filterError = false;
        this.dateTime = null;
    },

    applyFilterString: function(value, currentIndex, treeView) {
        var tv = treeView ? treeView : this;
        var prevRowCount = tv.rowCount;
        var currentItem = tv.visibleData[currentIndex];
        if (!tv.dateTime && currentItem) tv.dateTime = currentItem.dateTime;
        tv.filterString = value ? value : null;
        tv.filterRegExp = null;
        tv.filterError = false;
        tv.visibleData = [];
        if (tv.filterString) {
            try {
                tv.filterRegExp = new RegExp(tv.filterString, "i");
            } catch (e) {
                tv.filterError = true;
            }
        }
        var newIndex = -1;
        for (var i = 0; i < tv.childData.length; i++) {
            var item = tv.childData[i];
            if (tv.allowItem(item, tv)) {
                item.index = tv.visibleData.length;
                if (newIndex === -1 && item.dateTime >= tv.dateTime) {
                    newIndex = item.index;
                }
                tv.visibleData.push(item);
            } else {
                item.index = -1;
            }
        }
        tv.treebox.rowCountChanged(0, tv.rowCount - prevRowCount);
        if (newIndex === -1 && tv.dateTime && tv.visibleData.length > 0) {
            newIndex = tv.visibleData.length - 1;
        }
        if (newIndex > -1) {
            tv.selection.select(newIndex);
            tv.treebox.ensureRowIsVisible(newIndex);
        }
        tv.treebox.invalidate();
    },

    showWhitelisted: true,
    showBlacklisted: true,
    showOther: true,

    applyFilterStatus: function(status, currentIndex, show) {
        switch (status) {
        case 1: // whitelisted
            this.showWhitelisted = show;
            break;
        case 2: // blacklisted
            this.showBlacklisted = show;
            break;
        case 0: // other
            this.showOther = show;
            break;
        }
        this.applyFilterString(this.filterString, currentIndex);
    },

    allowItem: function(item, treeView) {
        var tv = treeView ? treeView : this;
        return !tv.filterError
            && (
                ((tv.showWhitelisted && item.status === STATUS_WHITELISTED)
                || (tv.showBlacklisted && item.status === STATUS_BLACKLISTED))
                || (tv.showOther && (item.status !== STATUS_WHITELISTED && item.status !== STATUS_BLACKLISTED))
            ) && (
                !tv.filterRegExp
                || tv.filterRegExp.test(item.time)
                || tv.filterRegExp.test(item.locationAsciiHref)
                || tv.filterRegExp.test(item.contentAsciiHref)
                || (item.contentType && tv.filterRegExp.test(item.contentType))
                || (item.statusCode && tv.filterRegExp.test(item.statusCode))
           );
    }
}
