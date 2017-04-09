window.Page = window.Page || {};

window.Page.Blocks = (function() {

    /**
     * The view which handes a single block
     * @type {function}
     * @extends Backbone.View
     */
    var BlockView = Backbone.View.extend({
        template: _.template(`
                <div data-cid="<%= model.cid %>" class="panel panel-default">
                  <div class="text-right panel-heading">
                    <select id="column">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                    <button class="btn btn-sm btn-danger" id="remove">&cross;</button>
                  </div>
                  <div class="panel-body" id="content"></div>
                </div>
        `),
        /**
         * Sets the column of the block and adds the correct classes to render it
         * @param  {Number} column The new column number
         */
        setColumn: function(column) {
            this.$el.removeClass("col-md-" + (12 / this.model.get("column")));
            this.$el.addClass("col-md-" + (12 / column));
            this.model.set("column", column);
        },
        events: {
            "click #remove": function() {
                if (confirm("Are you sure?")) {
                    this.model.set("delete", true);
                    this.remove();
                }
            },
            "change #column": function(e) {
                var column = e.currentTarget.value;
                this.setColumn(column);
            }
        },
        /**
         * Sets the contents of the quill editor
         * @param  {Quill} quill The Quill editor
         */
        setContents: function(quill) {
            var content = this.model.get("content_delta");
            if (content !== '') {
                if (typeof content === "string") {
                    content = JSON.parse(content);
                }
                quill.setContents(content);
            }
        },
        /**
         * Initializes the editor and sets the change events
         */
        initEditor: function() {
            this.quill = new Quill(this.$('#content').get(0), {
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
                        ['blockquote', 'code-block'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'script': 'sub' }, { 'script': 'super' }], // superscript/subscript
                        [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'align': [] }],
                        ['image', 'video']
                    ],
                },
                theme: "snow"
            });

            this.setContents(this.quill);

            this.quill.on('editor-change', (old, newD, source) => {
                this.model.set("content_delta", JSON.stringify(this.quill.getContents()));
                this.model.set("content", this.quill.container.firstChild.innerHTML);
            });
        },
        render: function() {
            this.setColumn(this.model.get("column"));

            this.$el.html(this.template({
                model: this.model
            }));

            this.initEditor();

            this.$("#column").val(this.model.get("column"));

            return this.$el;
        }
    });

    return {
        BlockView: BlockView
    };
})();
