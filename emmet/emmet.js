/**
 A simplistic DOM Manipulation JavaScript library.
 @param string = " div#id.class>a[href=#]>span{text}^section*2 ";
 emmet.parse(string).append()
 @result <div id="id" class="class">
           <a href="#">
		      <span>text</span>
		   </a>
		   <section></section>
		   <section></section>
		 </div>
 @returns the parent HTML element.
 This library is heavily inspired by emmet.io.
 Created by Atanas Iliev <the_wayfarer@abv.bg>
*/

var emmet = (function () {

    var first = null;
    var current = null;
    var clonedNodes = [];

    var Node = function (element) {
        this.parent = null;
        this.html = document.createElement(element);
        this.clones = null;
    }

    Node.prototype = {
        append: function () {
            this.parent.html.appendChild(this.html);
        },
        id: function (id) {
            this.html.id = id;
        },
        addClass: function (className) {
            this.html.classList.add(className);
        },
        setAttr: function (attr) {
            this.html.setAttribute(attr.name, attr.value);
        },
        text: function (text) {
		    var text = document.createTextNode(text);
            this.html.appendChild(text);
        }
    };

    var create = function (element) {
        first = new Node(element);
        var parentNode = new Node();
        parentNode.html = document.createDocumentFragment();
        first.parent = parentNode;
        first.append();
        current = first;
    }

    var child = function (element) {
        var node = new Node(element);
        node.parent = current;
        node.append();
        current = node;
    }

    var end = function () {
        current = current.parent || first.parent;
    }

    var id = function (id) {
        current.id(id);
    }

    var addClass = function (className) {
        current.addClass(className);
    }

    var text = function (text) {
        current.text(text);
    }

    var addAttr = function (attr) {
        current.setAttr(attr);
    }

    var getAttr = function (str) {
        var attributes = [];
        var attr = /\[([\w#-=\s]+)/.exec(str);
        while (attr != null) {
            attributes.push(attr[1]);
            str = str.replace(attr[0],"");
            attr = /\[([\w#-=\s]+)/.exec(str);
        }
        return attributes;
    };

    var getNode = function (str) {
        var element = /([\w-]+)/.exec(str);
        if (!element) {
            throw "Invalid HTML tag!";
        }
        var id = /#([\w-]+)/.exec(str);
        var addClass = /\.([\w-.]+)/.exec(str);
        var text = /\{([^}]+)/.exec(str);
        var attributes = getAttr(str);
        var clones = /(\*)(\d)+/.exec(str);
        var node = {
            element: element[1],
            property: {}
        };
        id && (node.property.id = id[1]);
        addClass && (node.property.addClass = addClass[1]);
        text && (node.property.text = text[1]);
        attributes.length && (node.property.attr = attributes);
        clones && (node.property.clones = clones[0].substr(1));
        return node;
    }

    var cloneNode = function (node) {
        var cln = null;
        for (var i = 0; i < node.clones - 1; i++) {
            cln = node.html.cloneNode(true);
            node.parent.html.insertBefore(cln, node.html);
        }
    }

    var parseNode = function (element, isFirst) {
        var node = getNode(element);
        isFirst ? create(node.element) : child(node.element);
        for (var p in node.property) {
            switch (p) {
                case "id":
                    id(node.property[p]);
                    break;
                case "addClass":
                    var array = node.property[p].split(".");
                    for (var i in array) {
                        addClass(array[i]);
                    }
                    break;
                case "text":
                    text(node.property[p])
                    break;
                case "attr":
                    var listAttrubutes = node.property[p];
                    for (var i in listAttrubutes) {
                        var attribute = listAttrubutes[i];
                        var attr = attribute.split("=");
                        addAttr({ name: attr[0], value: attr[1] });
                    }
                    break;
                case "clones":
                    current.clones = node.property[p];
                    clonedNodes.push(current);
                    break;
            }
        }
    }

    var parseRelation = function (sign) {
        switch (sign) {
            case "+":
                end();
                break;
            case "^":
                end();
                end();
                break;
        }
    }

    var parseHtml = function (str) {
        var re = /[>+^]/g;
        var result = re.exec(str.trim());
        if (result == null && str.length > 0) {
            parseNode(str, true);
        }
        var index = 0;
        while (result != null) {
            var current = RegExp.leftContext;
            var element = current.substring(index, current.length);
            var relation = RegExp.lastMatch;
            parseNode(element, !index);
            parseRelation(relation);
            var index = result.index;
            result = re.exec(str);
            if (result == null) {
                var lastElement = str.substring(index + 1, str.length);
                parseNode(lastElement, !index);
            }
        }
    }

    var render = function (str) {
        try {
            parseHtml(str);
        } catch (e) {
            throw "an invalid string";
        }
        if (clonedNodes.length) {
            while (clonedNodes.length) {
                cloneNode(clonedNodes.pop());
            }
        }
        return this;
    }
	
	var append = function () {
        document.body.appendChild(first.parent.html);
        return first.html;
    }

    var appendTo = function (element) {
	    if (!element) {
            throw "HTMLElement is required!";
        }
        element.appendChild(first.parent.html);
        return first.html;
    }
    var appendBefore = function (element) {
        if (!element) {
            throw "HTMLElement is required!";
        }
        element.parentElement.insertBefore(first.parent.html, element)
        return first.html;
    }

    return {
        render: render,
		append: append,
        appendTo: appendTo,
        appendBefore: appendBefore,
    }
}());












