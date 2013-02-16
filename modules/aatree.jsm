
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

const EXPORTED_SYMBOLS = ["YaripAATree"];

// http://en.wikipedia.org/wiki/AA_tree
function YaripAATree()
{
    this.root = null;
}
YaripAATree.prototype.add = function (value)
{
    if (!value) return;

    this.root = this.fun_insert(this.root, value);
}
YaripAATree.prototype.remove = function(value)
{
    this.root = this.fun_delete(this.root, value);
}
YaripAATree.prototype.toArray = function()
{
    var tmp = [];
    this.traverse(function(node) { tmp.push(node.value); });
    return tmp;
}
YaripAATree.prototype.traverse = function(fun)
{
    var last = null;
    function inOrder(node) {
        if (node) {
            if (node.left) inOrder(node.left);
            fun.call(this, node);
            if (node.right) inOrder(node.right);
        }
    }
    inOrder(this.root);
}
YaripAATree.prototype.fun_insert = function(T, X)
{
    if (!T) {
        return {
            value: X,
            level: 1,
            left: null,
            right: null
        };
    }

    var res = X.compare(T.value);
    if (res < 0) {
        T.left = this.fun_insert(T.left, X);
    } else if (res > 0) {
        T.right = this.fun_insert(T.right, X);
    } else {
        T.value.merge(X);
    }

    T = this.fun_skew(T);
    T = this.fun_split(T);
    return T;
}
YaripAATree.prototype.fun_delete = function(T, X)
{
    if (!T) return null;

    var res = X.compare(T.value);
    if (res < 0) {
        T.left = this.fun_delete(T.left, X);
    } else if (res > 0) {
        T.right = this.fun_delete(T.right, X);
    } else {
        if (!T.left && !T.right) return null;

        if (!T.left) {
            var L = this.successor(T);
            T.right = this.fun_delete(T.right, L);
            T.value = L;
        } else {
            var L = this.predecessor(T);
            T.left = this.fun_delete(T.left, L);
            T.value = L;
        }
    }

    T = this.decrease_level(T);
    T = this.fun_skew(T);
    T.right = this.fun_skew(T.right);
    if (T.right) T.right.right = this.fun_skew(T.right.right);
    T = this.fun_split(T);
    T.right = this.fun_split(T.right);
    return T;
}
YaripAATree.prototype.fun_skew = function(T)
{
    if (!T) return null;

    if (T.level === this.level(T.left)) {
        var L = T.left;
        T.left = L.right;
        L.right = T;
        return L;
    } else {
        return T;
    }
}
YaripAATree.prototype.fun_split = function(T)
{
    if (!T) return null;

    if (T.right && T.level === this.level(T.right.right)) {
        var R = T.right;
        T.right = R.left;
        R.left = T;
        R.level += 1;
        return R;
    } else {
        return T;
    }
}
YaripAATree.prototype.decrease_level = function(T)
{
    var should_be = Math.min(this.level(T.left), this.level(T.right)) + 1;
    if (should_be < T.level) {
        T.level = should_be;
        if (should_be < this.level(T.right)) {
            this.level(T.right, should_be);
        }
    }
    return T;
}
YaripAATree.prototype.level = function(T, new_level)
{
    if (!T) return 0;

    if (new_level !== undefined) T.level = new_level;
    return T.level;
}
YaripAATree.prototype.predecessor = function(T)
{
    var P = T.left;
    while (P.right) P = P.right;
    return P.value;
}
YaripAATree.prototype.successor = function(T)
{
    var S = T.right;
    while (S.left) S = S.left;
    return S.value;
}

