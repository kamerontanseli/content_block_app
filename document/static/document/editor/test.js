// Model Tests

var expect = chai.expect;

function setConfirm() {
    var realConfirm=window.confirm;
    window.confirm=function(){
      window.confirm=realConfirm;
      return true;
    };
}

describe("Models", function () {
    describe("Base Model", function () {
        var server;
        beforeEach(function () {
            server = sinon.fakeServer.create();
        });
        afterEach(function () {
            server.restore();
        });
        it("should append a slash on every url", function () {
            var model = new Page.Models.BaseModel({});
            model.urlRoot = '/test/url';

            model.fetch();
            model.save()
            model.set("id", 2);
            model.save()
            model.destroy()
            server.respond();

            server.requests.forEach(function (req) {
                expect(req.url.slice(-1) === "/").to.be.true;
            });
        });
    });
    describe("Document", function () {
        var model;
        beforeEach(function () {
            model = new Page.Models.Document({});
        });
        afterEach(function () {
            model.destroy();
            model = undefined;
        });
        it("should have the author as the model's author", function () {
            expect(model.get("author")).to.be.equal(Page.Defaults.USER);
        });
        it("should have a blank default title", function () {
            expect(model.get("title")).to.be.equal("");
        });
    });
    describe("ContentBlock", function () {
        var model;
        beforeEach(function () {
            model = new Page.Models.ContentBlock({});
        });
        afterEach(function () {
            model.destroy();
            model = undefined;
        });
        it("should have the correct foriegnkey to the page's document", function () {
            expect(model.get("document")).to.be.equal(Page.Defaults.DOCUMENT);
        });
        it("should have a default column greater than 0", function () {
            expect(model.get("column")).to.be.gt(0);
        });
        it("should have a default order of 0", function () {
            expect(model.get("order")).to.be.equal(0);
        });
        it("should have a blank default content", function () {
            expect(model.get("content")).to.be.equal("");
        });
        it("should have a blank default content_delta", function () {
            expect(model.get("content_delta")).to.be.equal("");
        });
        it("should stringify content_delta when toJSON is called", function () {
            model.set("content_delta", {
                test: 2
            });
            var resp = model.toJSON();
            expect(resp.content_delta).to.be.a("string");
            expect(JSON.parse(resp.content_delta).test).to.be.equal(2);
        });
        it("it should parse the content_delta when parse is called", function () {
            var reqData = model.toJSON();
            reqData.content_delta = JSON.stringify({'test': 2});
            var respData = model.parse(reqData);
            expect(respData.content_delta).to.be.a("object");
        });
    });
    describe("BaseCollection", function () {
        var collection;
        beforeEach(function () {
            collection = new Page.Models.BaseCollection();
        });
        it("should set hasNext to the result of response.next", function () {
            collection.parse({
                next: "/some/url/"
            });
            expect(collection.hasNext).to.be.true;
            collection.parse({
                next: null
            });
            expect(collection.hasNext).to.be.false;
        });
        afterEach(function () {
            collection = undefined;
        });
    });
    describe("Documents", function () {
        var collection;
        beforeEach(function () {
            collection = new Page.Models.Documents();
        });
        it("should have the Document as its model", function () {
            var model = new collection.model();
            expect(model instanceof Page.Models.Document).to.be.true;
        });
        afterEach(function () {
            collection = undefined;
        });
    });
    describe("ContentBlocks", function () {
        var collection;
        var server;
        beforeEach(function () {
            server = sinon.fakeServer.create();
            collection = new Page.Models.ContentBlocks();
        });
        afterEach(function () {
            collection = undefined;
            server.restore();
        });
        it("should have the ContentBlock as its model", function () {
            var model = new collection.model();
            expect(model instanceof Page.Models.ContentBlock).to.be.true;
        });
        it("should append the GET query 'document' to the fetch request", function () {
            collection.fetch();
            expect(
                server.requests[0].url.indexOf(`document=${Page.Defaults.DOCUMENT}`)
            ).to.be.gt(-1);
        });
    });
});

describe("Blocks", function () {
    var view;
    beforeEach(function () {
        view = new Page.Blocks.BlockView({
            model: new Page.Models.ContentBlock()
        });
    });
    afterEach(function () {
        view.remove();
        view = undefined;
    });
    it('should add grid column classes when setColumn is called', function () {
        for (var i = 1; i <= 4; i++) {
            view.setColumn(i);
            expect(view.$el.hasClass(`col-md-${12 / i}`)).to.be.true;
            expect(view.model.get("column")).to.be.equal(i);
        }
    });
    it("should set delete to true when #remove is click", function () {
        var $el = view.render();
        setConfirm();
        $el.find("#remove").click();
        expect(view.model.get("delete")).to.be.true;
    });
    it("should change the column when #column is changed", function () {
        var $el = view.render();
        var setColumn = sinon.spy();
        view.setColumn = setColumn;

        $el.find("#column").val(3).trigger("change");
        expect(setColumn.called).to.be.true;
    });
    it("should set the editors html and changes when the editor changes", function () {
        view.render();
        view.quill.setText('Hello');
        view.$(".ql-editor").trigger("input keyup keydown change");
        expect(view.model.get("content").indexOf("Hello")).to.be.gt(-1);
        expect(JSON.parse(view.model.get("content_delta").length)).to.be.gt(-1);
    });
    it("should call initEditor on render and set #column to model value", function () {
        var initEditor = sinon.spy();
        view.initEditor = initEditor;
        view.render();
        expect(initEditor.called).to.be.true;
        expect(+view.$("#column").val()).to.be.equal(view.model.get("column"));
    });
});

describe("Page", function () {
    var view;
    beforeEach(function () {
        view = new Page.Main.MainView({
            el: $("<div/>").html($(".container").html()),
            model: new Page.Models.Document({}),
            collection: new Page.Models.ContentBlocks()
        });
    });
    afterEach(function () {
        view.remove();
        view = undefined;
    });

    it("should call render when the collection is updated or reset", function () {
        var render = sinon.spy();
        view.render = render;
        view.collection.trigger("update");
        expect(render.called).to.be.true;

        view.collection.trigger("reset");
        expect(render.called).to.be.true;
    });

    it("should add x amount of blocks based on the column passed in addBlocksForColumn", function () {
        var checkIfAdded = sinon.spy();
        view.listenTo(view.collection, "add", checkIfAdded);
        view.addBlocksForColumn(2);
        expect(checkIfAdded.called).to.be.true;

        var isAllColumnTwo = view.collection.models
            .map(m => m.get("column"))
            .every(m => m === 2);

        expect(isAllColumnTwo).to.be.true;
    });

    it("should set the document title when #title changes", function () {
        view.$("#title").val("Something").trigger("keyup");
        expect(view.model.get("title")).to.be.equal("Something");
    });

    it("should call addBlocksForColumn with the column from the link element", function () {
        view.$("#addBlock").find("[data-col]").each(function () {
            var addBlocksForColumn = sinon.spy();
            view.addBlocksForColumn = addBlocksForColumn;

            var $a = $(this);
            $a.click();

            expect(addBlocksForColumn.calledWith(+$a.attr("data-col"))).to.be.true;
        });
    });

    it("should call setOrderingOfBlocks and all saves when #save is clicked", function () {
        var setOrderingOfBlocks = sinon.spy();
        var saveBlocks = sinon.spy();
        var save = sinon.spy();

        view.setOrderingOfBlocks = setOrderingOfBlocks;
        view.saveBlocks = saveBlocks;
        view.model.save = save;

        view.$("#save").click();

        expect(setOrderingOfBlocks.called).to.be.true;
        expect(saveBlocks.called).to.be.true;
        expect(save.called).to.be.true;
    });

    it("should call destroy on the model when #delete is clicked", function () {
        setConfirm();
        var destroy = sinon.spy();
        view.model.destroy = destroy;
        view.$("#delete").click();
        expect(destroy.called).to.be.true;
    });

    it("should append a view to _views for every model in this.collection", function () {
        view.addBlocksForColumn(4);
        view.render();
        expect(view._views.length).to.be.equal(4);
    });

    it("should call delete in saveBlocks if model.delete is true", function () {
        view.addBlocksForColumn(2);
        view.collection.models[0].set("delete", true);
        view.collection.models[1].set("delete", false);
        view.collection.models[0].destroy = sinon.spy();
        view.collection.models[1].destroy = sinon.spy();
        view.collection.models[0].save = sinon.spy();
        view.collection.models[1].save = sinon.spy();

        view.saveBlocks();

        expect(view.collection.models[0].destroy.called).to.be.true;
        expect(view.collection.models[0].save.called).to.be.false;

        expect(view.collection.models[1].destroy.called).to.be.false;
        expect(view.collection.models[1].save.called).to.be.true;
    });

});
