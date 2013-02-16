
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

//var as = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);

function YaripOverlay()
{
    this.toggleEnabled = function(enabled)
    {
        this.enabledObserver.disable();
        yarip.toggleEnabled(enabled);
        this.enabledObserver.enable();
    }

    this.updateEnabled = function()
    {
        this.toggleEnabled(yarip.getValue(PREF_ENABLED, true, DATA_TYPE_BOOLEAN), true);
    }

    this.handleEvent = function(event)
    {
        switch(event.type) {
        case "load":
            this.enabledObserver = new YaripPreferenceObserver(
                PREF_ENABLED,
                function() { yaripOverlay.updateEnabled(); }
            );
            this.schemesObserver = new YaripPreferenceObserver(
                PREF_SCHEMES,
                function() {
                    yarip.setSchemes(yarip.getValue(PREF_SCHEMES, "", DATA_TYPE_STRING));
                }
            );

            yarip.injectCSS("chrome://yarip/skin/blacklist.css", true);

            window.messageManager.addMessageListener("Yarip:Loader:Request", this);
            window.messageManager.loadFrameScript("chrome://yarip/content/mobileFrameScript.js", true);
            window.removeEventListener("unload", this, false);
            break;
        case "unload":
            this.enabledObserver.unregister();
            this.schemesObserver.unregister();

            window.removeEventListener("unload", this, false);
            break;
        }
    }

    // message = {
    //         name:    %message name%,
    //         target:  %the target of the message%,
    //         sync:    %true or false%,
    //         json:    %json object or null%,
    //         objects: %an array of objects sent using sendSyncMessage% (NOTE, DO NOT USE THIS. .objects will change!)
    //     }
    this.receiveMessage = function(message)
    {
        if (!/^Yarip:/.test(message.name)) return;

        switch(message.name) {
        case "Yarip:Loader:Request":
//dump("mobileOverlay.js:receiveMessage:`" + message.name + "'\n");
            var browser = message.target;
            var location = message.json.location;
            if (yarip.enabled) {
                var pageName = yarip.getPageName(location, MODE_PAGE);
                var addressObj = yarip.getAddressObj(pageName, true);
                browser.messageManager.sendAsyncMessage("Yarip:Loader:Response", {
                        "enabled": true,
                        "pageName": pageName,
                        "addressObj": addressObj,
                        "map": message.json.needMap ? yarip.map : null // FIXME
                    });
            } else {
                browser.messageManager.sendAsyncMessage("Yarip:Loader:Response", {
                        "enabled": false
                    });
            }
            break;
        }

//        as.showAlertNotification(null, "Yarip", message.name + " - " + location.href, false, "", null);
    }
}
