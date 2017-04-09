window.Page = window.Page || {};

window.Page.Main = (function () {
    /**
     * Main Page view manages the ContentBlock lifecycles and the document model
     * @type {function}
     * @extends Backbone.View
     * @example
     * new MainView({
     *  model: new Page.Models.Document(),
     *  collection: new Page.Models.ContentBlocks()
     * });
     */
    var MainView = Backbone.View.extend({
        el: ".container",
        initialize: function () {
            this.listenTo(this.collection, "update reset", ()=> {
                this.render();
            });
            /**
             * An array which stores all the Block views
             * @type {Array}
             * @private
             */
            this._views = [];
        },
        /**
         * Sets the order of the content based off of its DOM position
         */
        setOrderingOfBlocks: function () {
            this.$("[data-cid]").each((i, element)=> {
                var model = this.collection.get($(element).attr("data-cid"));
                if (model) {
                    model.set("order", i);
                }
            });
        },
        /**
         * Saves and delete the blocks
         */
        saveBlocks: function () {
            var models = this.collection.models.filter(m => m);
            var count = models.length;

            function on_resp() {
                count -= 1;
                if (count === 0) {
                    alert("Saved!");
                }
            }

            models.forEach(function (m) {
                if (m.get("delete")) {
                    m.destroy({}, {
                        success: on_resp
                    });
                } else {
                    m.save({}, {
                        success: on_resp
                    });
                }
            });
        },
        /**
         * Adds the amount of blocks to the collection based off of what divider is passed
         * @param  {Number} column The number of columns
         */
        addBlocksForColumn: function (column) {
            var container = [];
            for (var i = 1; i <= column; i += 1) {
                container.push(new this.collection.model({
                    column: column
                }));
            }
            this.collection.add(container);
        },
        events: {
            "keyup #title": function (e) {
                this.model.set("title", e.currentTarget.value);
            },
            "click #addBlock a": function (e) {
                e.preventDefault();
                var column = +$(e.currentTarget).attr("data-col");
                this.addBlocksForColumn(column);
            },
            "click #save": function (e) {
                this.setOrderingOfBlocks();
                this.saveBlocks();
                this.model.save();
            },
            "click #delete": function (e) {
                if (confirm("Are you sure?")) {
                    this.model.destroy({
                        success: function () {
                            window.location.pathname = "/document/";
                        }
                    });
                }
            }
        },
        render: function () {
            this._views.forEach(v => v.remove());
            this._views = [];
            this.collection.each((m)=> {
                var view = new Page.Blocks.BlockView({
                    model: m
                });
                this._views.push(view);
                this.$(".blocks").append(view.render());
            });
            this.setOrderingOfBlocks();
        }
    });

    return {
        MainView: MainView
    };
})();


var model = new Page.Models.Document({
    id: Page.Defaults.DOCUMENT
});
model.fetch();

var collection = new Page.Models.ContentBlocks();
collection.fetch();

var main = new Page.Main.MainView({
    model: model,
    collection: collection
});

main.render();
