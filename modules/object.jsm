
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

const EXPORTED_SYMBOLS = ["YaripObject"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const yarip = Cu.import("resource://yarip/yarip.jsm", null).wrappedJSObject;
Cu.import("resource://yarip/constants.jsm");
Cu.import("resource://yarip/uri.jsm");

function YaripObject() {
}
YaripObject.prototype.newId = function()
{
    return yarip.getId();
}
YaripObject.prototype.getPageById = function(id)
{
    return yarip.map.getById(id);
}
YaripObject.prototype.checkXPath = function(value)
{
    return yarip.checkXPath(value);
}
YaripObject.prototype.checkRegExp = function(value, allowEmpty)
{
    return yarip.checkRegExp(value, allowEmpty);
}
YaripObject.prototype.resetKnown = function()
{
    return yarip.resetKnown();
}

