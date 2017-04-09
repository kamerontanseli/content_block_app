window.Page = window.Page || {};

window.Page.Models = (function () {

    /**
     * Base model which all models inherit from
     * @type {Function}
     * @extends Backbone.Model
     */
    var BaseModel = Backbone.Model.extend({
        /**
         * Appends a slash to the end of the URL
         * @return {String} The appended URL
         */
        url: function() {
            var origUrl = Backbone.Model.prototype.url.call(this);
            return origUrl + (origUrl.charAt(origUrl.length - 1) == '/' ? '' : '/');
        }
    });

    /**
     * The Document Model
     * @type {Function}
     * @extends BaseModel
     */
    var Document = BaseModel.extend({
        defaults: {
            title: "",
            author: window.Page.Defaults.USER
        },
        urlRoot: '/api/documents/'
    });

    /**
     * The ContentBlock Model
     * @type {Function}
     * @extends BaseModel
     */
    var ContentBlock = BaseModel.extend({
        defaults: {
            order: 0,
            column: 1,
            "document": window.Page.Defaults.DOCUMENT,
            content: "",
            content_delta: ""
        },
        /**
         * stringifies the content_delta for saving
         * @see BaseModel.prototype.toJSON
         * @return {Object} The JSON to send off to the server
         */
        toJSON: function () {
            var obj = BaseModel.prototype.toJSON.apply(this, arguments);
            obj.content_delta = JSON.stringify(obj.content_delta);
            return obj;
        },
        /**
         * Tries to parse the content_delta
         * @see BaseModel.prototype.parse
         * @param  {Object} resp Server response
         * @return {Object}      The object to merge with the model attributes
         */
        parse: function (resp) {
            try {
                resp.content_delta = JSON.parse(resp.content_delta);
            } catch (e) {
                console.log(e);
            }
            return BaseModel.prototype.parse.call(this, resp);
        }
    });

    /**
     * Base Collection in which all Collections inherit from
     * @type {Function}
     * @extends Backbone.Collection
     */
    var BaseCollection = Backbone.Collection.extend({
        /**
         * Checks whether there is a next page and returns the results array
         * @param  {Object} resp The server response
         * @return {Array<Object>}      The model data
         */
        parse: function (resp) {
            this.hasNext = resp.next !== null;
            return resp.results;
        }
    });

    /**
     * The Documents Collection
     * @type {Function}
     * @extends BaseCollection
     */
    var Documents = BaseCollection.extend({
        model: Document,
        url: '/api/documents/'
    });

    /**
     * The ContentBlocks Collection
     * @type {Function}
     * @extends BaseCollection
     */
    var ContentBlocks = BaseCollection.extend({
        model: ContentBlock,
        url: '/api/content_blocks/',
        /**
         * Appends the document to the fetch URL
         * @see BaseCollection.prototype.fetch
         * @param  {Object} options The extra options passed into the request
         * @return {Promise}   An XHR request
         */
        fetch: function (options) {
            options = options || {};
            _.extend(options, {
                data: {
                    document: Page.Defaults.DOCUMENT
                }
            });
            return BaseCollection.prototype.fetch.call(this, options);
        }
    });

    return {
        BaseModel: BaseModel,
        BaseCollection: BaseCollection,
        Document: Document,
        Documents: Documents,
        ContentBlocks: ContentBlocks,
        ContentBlock: ContentBlock
    };
})();
