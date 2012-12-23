
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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");

function YaripAppStartupService() {
}
YaripAppStartupService.prototype = {
    classDescription: "Yet Another Remove It Permanently - App Startup Service",
    classID: Components.ID("{0f73e21b-fa4a-4e57-b991-200d6b0a52d0}"),
    contractID: "@yarip.mozdev.org/app-startup-service;1",
    _xpcom_categories: [{ category: "app-startup", service: true }],
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver])
}
// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIObserver#observe%28%29
YaripAppStartupService.prototype.observe = function(subject, topic, data)
{
    switch (topic) {
    case "app-startup":
        OS.addObserver(this, "profile-after-change", true);
        break;
    case "profile-after-change":
        var appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
        var isMobile = appInfo.ID === "{a23983c0-fd0e-11dc-95ff-0800200c9a66}";
//        if (!isMobile) {
            OS.addObserver(yarip, "quit-application", true);
            yarip.setMobile(isMobile);
            yarip.init();
//        }

        var observer = Cu.import("resource://yarip/observer.jsm", null).wrappedJSObject;
        observer.init();

        var webProgressListener = Cu.import("resource://yarip/webProgressListener.jsm", null).wrappedJSObject;
        WP.addProgressListener(webProgressListener, NOTIFY_STATE_DOCUMENT | NOTIFY_STATE_REQUEST);
        break;
    }
}

// https://developer.mozilla.org/en/JavaScript_code_modules/XPCOMUtils.jsm#generateNSGetFactory%28%29
const NSGetFactory = XPCOMUtils.generateNSGetFactory([YaripAppStartupService]);

