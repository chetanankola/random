/*global YUI */
/*jslint nomen:true, indent: 4, regexp: true*/

YUI.add('navigation', function (Y, NAME) {
    'use strict';

    var Navigation = Y.namespace('Navigation-Assist'),

        ARROW_RIGHT_CHAR_CODE = 39,
        ARROW_LEFT_CHAR_CODE = 37,
        ARROW_DOWN_CHAR_CODE = 40,
        ARROW_UP_CHAR_CODE = 38,
        RETURN_CHAR_CODE = 13,
        ESCAPE_CHAR_CODE = 27,
        MENUUP = false,
        MENUDOWN = true,
        DEFAULT_MAX_ROW_ITEMS = 4,

        CLASS_MENU_ITEM_SELECTED = 'menu-item-selected',
        CLASS_CONTENT_ITEM_SELECTED = 'content-item-selected',
        CLASS_ITEM_IN_FOCUS = 'item-in-focus',
        DEFAULT_KEY_TYPE = 'keydown';

    Navigation = function (config) {
        Navigation.superclass.constructor.apply(this, arguments);
    };

    Navigation.NAME = "Navigation";

    Navigation.ATTRS = {

        keyType: {
            value: DEFAULT_KEY_TYPE
        },
        menuSelector: {
            setter: function (selector) {
                return Y.one(selector);
            }
        },
        contentSelector: {
            setter: function (selector) {
                return Y.one(selector);
            }
        },
        // define how many items you want in a row
        // based on which the the containers width is set
        maxRowItems: {
            setter: function (num) {
                num = num || DEFAULT_MAX_ROW_ITEMS;
                this._setContentAreaWidth(num);
                return num;
            }
        }
    };


    Y.Navigation = Y.extend(Navigation, Y.Base, {


        menu: {
            indexSelected: -1,
            nodes: []
        },

        content: {
            indexSelected: -1,
            nodes: []
        },

        _setContentAreaWidth: function (num) {
            var listItemWidth = this.getRowItemWidth();
            console.log('listItemWidth:' + listItemWidth);
            this.get('contentSelector').setStyle('width', (listItemWidth * num) + 'px');
            return num;
        },
        getSelectedContentItem: function () {
            return Y.one('.' + CLASS_CONTENT_ITEM_SELECTED);
        },
        getSelectedMenuItem: function () {
            return Y.one('.' + CLASS_MENU_ITEM_SELECTED);
        },

        getCurrentItemInFocus: function () {
            return Y.one('.' + CLASS_ITEM_IN_FOCUS);
        },


        resetContent: function () {
            this.content.indexSelected = -1;
            this.content.nodes = [];
        },


        resetMenu: function () {
            this.menu.indexSelected = -1;
            this.menu.nodes = [];
        },

        // Will reset and reindex the contents of this.menu and remove any highlights
        indexMenu: function () {
            this.resetMenu();

            var children = [],
                menu = this.menu,
                menuItems = Y.one(this.get('menuSelector')).all('> *');
            console.log('indexing menu items');
            menuItems.each(function (child, i, parent) {
                children[i] = child;
                console.log(child);
            });

            menu.indexSelected = -1;
            menu.nodes = children;
        },

        resetAll: function () {
            this.indexMenu();
            this.indexContent();
            this.clearAllSelections();
        },

        switchFocusBackToMenu: function () {
            var menu = this.menu,
                index = this.menu.indexSelected,
                nodes = this.menu.nodes;

            this.resetContent();
            this.clearAllItemFocus();
            this.clearAllContentSelection();


            nodes[index].addClass(CLASS_ITEM_IN_FOCUS).focus();
            console.log('menu item"' + nodes[index].getAttribute('data') + '" is back into focus');

        },


        getRowWidth: function () {
            var item = Y.one('.content-data ul');
            if (item) {
                return item.get('clientWidth');
            }
            return null;
        },

        getRowItemWidth: function () {
            var item = Y.one('.content-data li');

            function convertPxToInt(px) {
                var pxInt = 0;
                if (px && px.length > 1) {
                    px = px.substr(0, px.length - 2);//remove 'px' from value
                    pxInt = parseInt(px, 10);//convert to integer
                }
                return pxInt;
            }

            if (item) {
                return item.get('clientWidth') + convertPxToInt(item.getStyle('margin-right')) + (2 * convertPxToInt(item.getStyle('borderRightWidth')));
            }
            return null;
        },

        //returns total number of content items in a row
        getNumOfItemsInContentRow: function () {
            var containerWidth = this.getRowWidth(),
                itemWidth = this.getRowItemWidth(),
                numOfItemsInRow = Math.floor(containerWidth / itemWidth);

            console.log('container width:' + containerWidth);
            console.log('itemWidth: ' + itemWidth);
            console.log('numOfItemsInRow:' + numOfItemsInRow);
            return numOfItemsInRow;
        },

        clearAllItemFocus: function () {
            var focusItem = this.getCurrentItemInFocus();
            if (focusItem) {
                focusItem.removeClass(CLASS_ITEM_IN_FOCUS).blur();
            }
        },
        clearAllContentSelection: function () {
            var contentItemSelected = this.getSelectedContentItem();
            if (contentItemSelected) {
                contentItemSelected.removeClass(CLASS_CONTENT_ITEM_SELECTED);
            }
        },
        clearAllMenuItemSelection: function () {
            var menuItemSelected = this.getSelectedMenuItem();
            if (menuItemSelected) {
                menuItemSelected.removeClass(CLASS_MENU_ITEM_SELECTED);
            }
        },

        clearAllSelections: function () {
            this.clearAllMenuItemSelection();
            this.clearAllContentSelection();
            this.clearAllItemFocus();
        },

        actionOnContentItem: function (action) {
            var content =  this.content,
                nodes = content.nodes,
                indexSelected = content.indexSelected;

            if (action === RETURN_CHAR_CODE) {
                console.log(nodes[indexSelected].getAttribute('data'));
                console.log(nodes[indexSelected].getAttribute('parentid'));
                alert(nodes[indexSelected].getAttribute('data'));
            }
        },


        indexContent: function () {
            this.resetContent();
            var children = [],
                content = this.content,
                contentItems = Y.one(this.get('contentSelector')).all('> *');
                //document.querySelectorAll('.content-data ul > *')//first level

            console.log('indexing content-data items');
            contentItems.each(function (child, i, parent) {
                children[i] = child;
                console.log(child);
            });

            content.indexSelected = -1;
            content.nodes = children;
        },

        selectContentItem: function (direction) {
            if (!this.content || !this.content.nodes.length) {
                Y.log('no content exists', 'error');
                return;
            }
            var nodes = this.content.nodes,
                n,
                indexSelected = this.content.indexSelected,
                newIndex;

            this.clearAllItemFocus();





            // selecting for the first time
            if (indexSelected === -1) {
                //choose first item as index
                newIndex = 0;
            } else {
                //selecting the direction or previous content item
                newIndex = this.getNextIndexOnContentArea(indexSelected, direction);
                nodes[indexSelected].removeClass(CLASS_CONTENT_ITEM_SELECTED).removeClass(CLASS_ITEM_IN_FOCUS);
            }

            n = nodes[newIndex];

            //since scroll is disabled make sure teh elements are scrolled into view port
            //if(!this.inViewPort(n.getDOMNode())) {
            if (!Y.DOM.inViewportRegion(Y.Node.getDOMNode(n), true, null)) {
                n.getDOMNode().scrollIntoView(true);
            }

            n.addClass(CLASS_CONTENT_ITEM_SELECTED).addClass(CLASS_ITEM_IN_FOCUS);
            n.focus();
            this.content.indexSelected = newIndex;
            console.log(n.getAttribute('data'));
        },

        getNumOfContentRows: function (itemsInRow, numOfContentItems) {
            return Math.ceil(numOfContentItems / itemsInRow);
        },
        selectMenuItem: function (next) {
            if (!this.menu) {
                Y.log('no menu exists', 'error');
                return;
            }
            var nodes = this.menu.nodes,
                length = nodes.length,
                indexSelected = this.menu.indexSelected,
                newIndex,
                id,
                n,
                self = this;

            this.clearAllItemFocus();
            // selecting for the first time
            if (indexSelected === -1) {
                //choose first item as index
                newIndex = 0;
            } else {
                //selecting the next or previous menu item
                if (next) {
                    //select next menu item
                    newIndex = (indexSelected + 1) % length;
                } else {
                    //select previous
                    newIndex = (indexSelected - 1) % length;
                    if (newIndex === -1) {
                        newIndex = length - 1;
                    }
                }
                nodes[indexSelected].removeClass(CLASS_MENU_ITEM_SELECTED).removeClass(CLASS_ITEM_IN_FOCUS);
            }

            n = nodes[newIndex];
            //if menu item is not in view port bring it to viewport since scroll is disabled
            if (!Y.DOM.inViewportRegion(Y.Node.getDOMNode(n), true, null)) {
                n.getDOMNode().scrollIntoView(true);
            }
            n.addClass(CLASS_MENU_ITEM_SELECTED).addClass(CLASS_ITEM_IN_FOCUS);
            n.focus();
            this.menu.indexSelected = newIndex;


            //send request to backend for the given menuid
            id = nodes[newIndex].getAttribute('id');
            this.getContent(id, function (json) {
                self.updateContentMarkup(nodes[newIndex], json);
            });

        },

        updateContentMarkup: function (menuNode, json) {
            var menuId,
                data,
                dataId,
                i,
                imgUrl,
                contentContainer = this.get('contentSelector'),
                contentTitle = Y.one('.content-title'),
                markup = '',
                titleData,
                name;

            if (!json) {
                contentTitle.setHTML('<h1>No data For You!</h1>');
                contentContainer.setHTML('');
                return;
            }
            menuId = menuNode.getAttribute('id');
            data = json.data;
            dataId = json.parentId;
            titleData = json.contenttitle;

            console.log('received data for id: ' + menuId);
            console.log('received data for id: ' + dataId);
            console.log(json);

            for (i = 0; i < data.length; i += 1) {

                console.log(data[i]);
                imgUrl = data[i].imgUrl;
                name = data[i].name;

                markup = markup + '<li parentid="' + dataId + '" data="' + name + '"><div><img src="' + imgUrl + '" width="120"  /> </div>';
            }

            contentContainer.setHTML(markup);
            contentTitle.setHTML('<h1>' + titleData + '</h1');


        },
        getContent: function (menuId, cb) {




            var requestUrl,
                self = this;

            function jsonPSuccess(response) {
                return cb(response);
            }
            function jsonPFailure(err) {
                console.log(err);
                return cb(null);
            }
            requestUrl = 'http://abc.com?menuId=' + menuId;

            Y.jsonp(requestUrl, {
                on:  {
                    success: jsonPSuccess,
                    failure: jsonPFailure
                }
            });
        },

        isContentItemOnLeftBorder: function () {
            var content = this.content,
                currentIndex = content.indexSelected,
                totalItemsInRow = this.getNumOfItemsInContentRow(),
                border = currentIndex % totalItemsInRow;

            console.log('totalitems in row:' + totalItemsInRow);
            console.log('current Content Index' + currentIndex);
            console.log('border' + border);
            if (currentIndex === -1) {
                throw Y.error('no item in content is selected');
            }

            // 0 1 2 3 4 5 6 7 8
            // here 0 and 5 are on border if there are 4 items in a row

            if (border === 0) {
                return true;
            }

            return false;
        },

        isFocusOnMenuItem: function () {
            var itemInFocus = this.getCurrentItemInFocus();

            if (itemInFocus) {
                return itemInFocus.hasClass(CLASS_MENU_ITEM_SELECTED);
            }
            return false;
        },

        isFocusOnContentItem: function () {
            var itemInFocus = this.getCurrentItemInFocus();
            if (itemInFocus) {
                return itemInFocus.hasClass(CLASS_CONTENT_ITEM_SELECTED);
            }
            return false;
        },

        destroyNav: function () {
            this.deregisterEvents();
            this.clearAllSelections();
        },

        deregisterEvents: function () {
            var subscriptions = this._subscriptions,
                subscription;

            if (subscriptions) {
                for (subscription in subscriptions) {
                    if (subscriptions.hasOwnProperty(subscription)) {
                        subscriptions[subscription].detach();
                    }
                }
                this._subscriptions = null;
            }

        },

        switchToContent: function (direction) {

            // always right arrow should take you to content area
            // make sure the right content is indexed if you are entering for the first time
            if (this.isFocusOnMenuItem()) {
                this.indexContent();
            }

            switch (direction) {
            case ARROW_RIGHT_CHAR_CODE:
                console.log('selecting next content item');
                this.selectContentItem(ARROW_RIGHT_CHAR_CODE);
                break;
            case ARROW_LEFT_CHAR_CODE:
                //find if the current item in focus is the leftmost item
                if (this.isContentItemOnLeftBorder()) {
                    this.switchFocusBackToMenu();
                    return;
                }
                this.selectContentItem(ARROW_LEFT_CHAR_CODE);
                break;
            case ARROW_DOWN_CHAR_CODE:
                this.selectContentItem(ARROW_DOWN_CHAR_CODE);
                break;
            case ARROW_UP_CHAR_CODE:
                this.selectContentItem(ARROW_UP_CHAR_CODE);
                break;
            default:
                console.log('false direction');
            }

        },



        getRowNum: function (index) {
            var itemsInRow = this.getNumOfItemsInContentRow(),
                rowNum = Math.floor(index / itemsInRow);

            console.log('row number:' + rowNum);
            return rowNum;
        },

        getNextIndexOnContentArea: function (curIndexSelected, direction) {
            var newIndex = 0,
                nodes = this.content.nodes,
                length = nodes.length,
                totalRows,
                rowNum,
                itemsInRow;

            switch (direction) {
            case ARROW_RIGHT_CHAR_CODE:
                newIndex = (curIndexSelected + 1) % length;
                break;
            case ARROW_LEFT_CHAR_CODE:
                newIndex = (curIndexSelected - 1) % length;
                if (newIndex === -1) {
                    newIndex = length - 1;
                }
                break;
            case ARROW_DOWN_CHAR_CODE:
                itemsInRow = this.getNumOfItemsInContentRow();
                totalRows = this.getNumOfContentRows(itemsInRow, length);
                rowNum = this.getRowNum(curIndexSelected);
                newIndex = curIndexSelected + itemsInRow;

                if (newIndex >= length) {

                    // if its last row go to the item above
                    if (rowNum === totalRows - 1) {
                        newIndex = (curIndexSelected + itemsInRow) % itemsInRow;
                    } else {
                        // if its not the last row then go to next row first element
                        newIndex = (totalRows - 1) * itemsInRow;
                    }
                }
                console.log('on down, newIndex:' + newIndex);
                break;
            case ARROW_UP_CHAR_CODE:
                itemsInRow = this.getNumOfItemsInContentRow();
                newIndex = curIndexSelected - itemsInRow;
                if (newIndex < 0) {

                    totalRows = this.getNumOfContentRows(itemsInRow, length);
                    console.log(curIndexSelected);

                    //go to last row and corresponding col
                    //works only for a perfect square matrix
                    newIndex = ((totalRows - 1) * itemsInRow) + curIndexSelected;

                    // if there is a gap in teh matrix, try going one more row up and add current Index selected
                    if (newIndex >= length) {
                        //newIndex = ((totalRows - 1) * itemsInRow) - 1 - (itemsInRow - (curIndexSelected + 1));
                        newIndex = ((totalRows - 2) * itemsInRow) + curIndexSelected;
                    }
                }
                console.log('on up, newIndex:' + newIndex);
                break;
            default:
                console.log('invalid direction');
            }
            return newIndex;
        },

        registerEvents: function () {
            var self = this;

            if (!this._subscriptions) {
                this._subscriptions = {};
            }

            this._subscriptions.bodyKeyType = Y.one('body').on(self.get('keyType'), function (e) {
                // e.preventDefault(); //will prevent scrolling of page and
                // then you can set custom focus
                console.log(e.charCode);

                switch (e.charCode) {
                case ARROW_RIGHT_CHAR_CODE:
                    console.log('arrow right');
                    self.switchToContent(ARROW_RIGHT_CHAR_CODE);
                    break;
                case ARROW_LEFT_CHAR_CODE:
                    console.log('arrow left');

                    //if on nav menu there should be no effect
                    if (self.isFocusOnMenuItem()) {
                        console.log('no effect on left arrow key for menu item');
                        return;
                    }
                    if (self.isFocusOnContentItem()) {
                        self.switchToContent(ARROW_LEFT_CHAR_CODE);
                    }

                    break;
                case ARROW_UP_CHAR_CODE:
                    e.preventDefault(); // prevent scroll
                    console.log('arrow up');
                    if (self.isFocusOnMenuItem()) {
                        self.selectMenuItem(MENUUP);
                        return;
                    }
                    if (self.isFocusOnContentItem()) {
                        self.selectContentItem(ARROW_UP_CHAR_CODE);
                        return;
                    }
                    break;
                case ARROW_DOWN_CHAR_CODE:
                    e.preventDefault(); // prevent scroll
                    console.log('arrow down');
                    if (self.isFocusOnMenuItem()) {
                        self.selectMenuItem(MENUDOWN);
                        return;
                    }
                    if (self.isFocusOnContentItem()) {
                        self.selectContentItem(ARROW_DOWN_CHAR_CODE);
                        return;
                    }

                    break;

                case RETURN_CHAR_CODE:
                    console.log('return key pressed');
                    if (self.isFocusOnMenuItem()) {
                        self.switchToContent(ARROW_RIGHT_CHAR_CODE);
                        return;
                    }
                    if (self.isFocusOnContentItem()) {
                        self.actionOnContentItem(RETURN_CHAR_CODE);
                        return;
                    }
                    break;
                case ESCAPE_CHAR_CODE:
                    self.resetAll();
                    break;
                default:
                    console.log('not a navigation key');
                }
            });
        },


        initNav: function () {
            this._subscriptions = {};
            this.registerEvents();
            this.indexMenu();
            this.indexContent();
            this.selectMenuItem(MENUDOWN);
            this._setContentAreaWidth(this.get('maxRowItems'));
        },

        /**
         * Design
         * =======
         *  1. At any point in time one should be able to find out which left menu item is currently selected (menu-item-selected)
         *  2. At any point in time one should be able to find out which content-item is selected. (content-item-selected)
         *  3. At any point in time only one item (either navigation menu item or content area item) has focus not both. (item-in-focus)
         *  4. Whenever a navigation item receives focus, the content area should refresh (rather pull data for the corresponding nav menu item)
         *  5. At any stage only one item will have CLASS_ITEM_IN_FOCUS, and this will be used to identify if its
         *     on the menu or on the content
        */
        initializer: function (cfg) {
            var self = this;
            console.log(this.get('keyType'));
        }
    });
}, '0.0.1', {
    requires: ['node', 'base', 'jsonp', 'jsonp-url']
});
