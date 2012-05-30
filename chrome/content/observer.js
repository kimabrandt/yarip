
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

function YaripObserver(prefs, callback)
{
    this.register(prefs, callback);
}
YaripObserver.prototype = {
    observables: [],
    enabled: true,
    values: {},

    register: function(prefs, callback)
    {
        if (!prefs || prefs.length === 0 || !callback) return;

        this.callback = callback;
        if (typeof prefs === "string") prefs = [prefs];
        for (var i = 0; i < prefs.length; i++) {
            var index = prefs[i].lastIndexOf(".");
            var root = prefs[i].substring(0, index + 1);
            this.values[prefs[i].substring(index + 1)] = true;

            var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            var observable = prefService.getBranch(root);
            observable.QueryInterface(Components.interfaces.nsIPrefBranch2);
            observable.addObserver("", this, false);
            this.observables.push(observable);
        }
    },

    unregister: function()
    {
        var observable = null;
        while (observable = this.observables.pop()) {
            if (observable) observable.removeObserver("", this);
        }
    },

    observe: function(subject, topic, data)
    {
        if (!this.enabled || !this.values[data]) return;

        this.disable();
        this.callback();
        this.enable();
    },

    enable: function()
    {
        this.enabled = true;
    },

    disable: function()
    {
        this.enabled = false;
    }
}
