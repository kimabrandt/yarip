
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

const yarip = Components.utils.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Components.utils.import("resource://yarip/constants.jsm");
Components.utils.import("resource://yarip/loader.jsm");
Components.utils.import("resource://yarip/map.jsm");
Components.utils.import("resource://yarip/page.jsm");
Components.utils.import("resource://yarip/list.jsm");
Components.utils.import("resource://yarip/item.jsm");

yarip.initMobile();
yarip.injectCSS("chrome://yarip/skin/blacklist.css", true);
var loader = new YaripLoader();
var needMap = true;

//function YaripFrame()
//{
//    this.loader = new YaripLoader();
//    this.needMap = true;
//}
//YaripFrame.prototype = {
//    handleEvent: function(event)
//    {
////        switch(event.type) {
////        case "DOMContentLoaded":
////dump("mobileFrameScript.js:handleDOMContentLoaded:`" + event.type + "'\n");
//            var location = yarip.getLocation(content.document.location);
//            sendAsyncMessage("Yarip:Loader:Request", {
//                    "location": location,
//                    "needMap": needMap
//                });
////            break;
////        }
//    },

//    receiveMessage: function(message)
//    {
//dump("receiveMessage:message:"+message+"\n");
////        switch(message.name) {
////        case "Yarip:Loader:Response":
////dump("mobileFrameScript.js:receiveLoaderMessage:`" + message.name + "'\n");
//            var json = message.json;
//            if (json.map) { // FIXME
//                yarip.map.loadFromObject(json.map);
//                needMap = false;
//            }
//            if (!json.enabled) return;
//            if (!json.pageName || !json.addressObj) return;

//            var doc = content.document;
//            var pageName = json.pageName;
//            var addressObj = json.addressObj;
//            if (!doc || !doc.body || !doc.location) return;
//            if (!/^https?:$/.test(doc.location.protocol)) return;
//            if (!/^(text\/html|application\/xhtml\+xml)$/.test(doc.contentType)) return;

//            loader.load(doc);
////            break;
////        }
//    }
//}

//var yaripFrame = new YaripFrame();

function handleDOMContentLoaded(event) {
//    switch(event.type) {
//    case "DOMContentLoaded":
//dump("mobileFrameScript.js:handleDOMContentLoaded:`" + event.type + "'\n");
        var location = yarip.getLocation(content.document.location);
        sendAsyncMessage("Yarip:Loader:Request", {
                "location": location,
                "needMap": needMap
            });
//        break;
//    }
}

// message = {
//         name:    %message name%,
//         target:  %the target of the message%,
//         sync:    %true or false%,
//         json:    %json object or null%,
//         objects: %an array of objects sent using sendSyncMessage% (NOTE, DO NOT USE THIS. .objects will change!)
//     }
function receiveLoaderMessage(message) {
//    switch(message.name) {
//    case "Yarip:Loader:Response":
//dump("mobileFrameScript.js:receiveLoaderMessage:`" + message.name + "'\n");
        var json = message.json;
        if (json.map) { // FIXME
            yarip.map.loadFromObject(json.map);
            needMap = false;
        }
        if (!json.enabled) return;
        if (!json.pageName || !json.addressObj) return;

        var doc = content.document;
        var pageName = json.pageName;
        var addressObj = json.addressObj;
        if (!doc || !doc.body || !doc.location) return;
        if (!/^https?:$/.test(doc.location.protocol)) return;
        if (!/^(text\/html|application\/xhtml\+xml)$/.test(doc.contentType)) return;

        loader.load(doc);
//        break;
//    }
}

addEventListener("DOMContentLoaded", handleDOMContentLoaded, false);
addMessageListener("Yarip:Loader:Response", receiveLoaderMessage);
//addEventListener("DOMContentLoaded", yaripFrame, false);
//addMessageListener("Yarip:Loader:Response", yaripFrame);

