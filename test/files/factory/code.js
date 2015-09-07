var extend = require('./utils.js').extend,
    Context = require('./context.js'),
    LAZY_FN_TOKEN = require('./constants.js').LAZY_FN_TOKEN;

function Factory(fn) {
    if (this instanceof Factory) {
        this.obj = fn.call(new Context());
        return;
    }
    return new Factory(fn);
}

Factory.prototype.create = function(attributes) {
    var result = extend({}, this.obj, attributes);

    for (var attribute in result) {
        if (result[attribute][LAZY_FN_TOKEN]) {
            result[attribute] = result[attribute]();
        }
    }
    return result;
};

Factory.prototype.createMany = function(n) {
    var result = [],
        i;

    for (i = 0; i < n; i++) {
        result.push(this.create());
    }
    return result;
};

module.exports = Factory;
