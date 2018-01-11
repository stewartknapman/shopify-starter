(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require('./utils/_lib.js');
var Liquid = require('liquidjs');

var Render = function () {
  this.engine = Liquid();
  this.templatesSelector = '[type="text/template"]';
  this.templates = {};
};

Render.prototype.init = function () {
  this._collectTemplates();
};

Render.prototype.renderTemplate = function (key, data) {
  var tmpl = this.templates[key];
  this.engine
    .render(tmpl.template, data)
    .then(function (html) {
      tmpl.target.innerHTML = html;
    });
};

// Private
Render.prototype._collectTemplates = function () {
  var _this = this,
    templates = document.querySelectorAll(this.templatesSelector);
  _.each(templates, function (tmpl) {
    _this._collectTemplate(tmpl);
  });
};

Render.prototype._collectTemplate = function (template) {
  var name = template.id;
  this.templates[name] = {
    name: name,
    template: this.engine.parse(template.innerHTML),
    target: document.querySelector(template.dataset.target)
  }
};

var render = new Render();
_.ready(function () {
  render.init();
});

window.go = function () {
  console.log('go');
  render.renderTemplate('test', { name: 'Liquid' });
};

},{"./utils/_lib.js":2,"liquidjs":8}],2:[function(require,module,exports){
module.exports = {
  /*
    Array Functions
  */
  // For each item in Array
  each: function (arr, callback, ctx) {
    for (var i = 0; i < arr.length; i++) {
      ctx = ctx || arr[i];
      callback.apply(ctx, [arr[i], i]);
    }
  },
  
  // For each item in Object
  eachIn: function (obj, callback, ctx) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        ctx = ctx || obj[k];
        callback.apply(ctx, [k, obj[k]]);
      }
    }
  },
  
  // Return true if item is in Array
  inArray: function (needle, haystack) {
    var found = false;
    this.each(haystack, function (hay) {
      if (needle === hay) found = true;
    });
    return found;
  },
  
  // return the last item in the array
  last: function (arr) {
    return arr[arr.length - 1];
  },
  
  
  /*
    String Functions
  */
  // Captialse the first char in String
  capitalise: function (str) {
    return str[0].toUpperCase() + str.slice(1);
  },
  
  // Turn 'my string' or 'my-string' into 'myString'
  camelCase: function (str) {
    return str.replace(/([\-\s]\w)/g, function (s) {
      return s[1].toUpperCase();
    });
  },
  
  
  /*
    Number Functions
  */
  isNumber: function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },
  
  /*
    DOM Functions
  */
  insertAfter: function (el, refNode) {
    refNode.parentNode.insertBefore(el, refNode.nextSibling);
  },
  
  /*
    Event Functions
  */
  // Run code when the page is ready
  ready: function (callback, ctx) {
    if (typeof callback !== 'function') return;
    
    if (document.readyState !== "loading") {
      callback.apply(ctx);
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        callback.apply(ctx);
      });
    }
  },
  
  // Make thing not happen until finished?
  // i.e. don't act on every window resize event, just the last one when we need it.
  debounce: function (callback, wait, ctx) {
    var timeout, timestamp, args;
    wait = wait || 100;
    
    var later = function() {
      var last = new Date().getTime() - timestamp;
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        callback.apply(ctx, args);
      }
    };
    
    return function () {
      ctx = ctx || this;
      args = arguments;
      timestamp = new Date().getTime();
      if (!timeout) timeout = setTimeout(later, wait);
    };
  },
  
  // Don't swamp us with events
  // good for things like scroll and resize
  throttle: function (callback, limit, ctx) {
    limit = limit || 200;
    var wait = false;
    return function () {
      if (!wait) {
        callback.apply(ctx, arguments);
        wait = true;
        setTimeout(function () {
          wait = false;
        }, limit);
      }
    }
  }
};
},{}],3:[function(require,module,exports){
module.exports = require('./register')().Promise

},{"./register":5}],4:[function(require,module,exports){
"use strict"
    // global key for user preferred registration
var REGISTRATION_KEY = '@@any-promise/REGISTRATION',
    // Prior registration (preferred or detected)
    registered = null

/**
 * Registers the given implementation.  An implementation must
 * be registered prior to any call to `require("any-promise")`,
 * typically on application load.
 *
 * If called with no arguments, will return registration in
 * following priority:
 *
 * For Node.js:
 *
 * 1. Previous registration
 * 2. global.Promise if node.js version >= 0.12
 * 3. Auto detected promise based on first sucessful require of
 *    known promise libraries. Note this is a last resort, as the
 *    loaded library is non-deterministic. node.js >= 0.12 will
 *    always use global.Promise over this priority list.
 * 4. Throws error.
 *
 * For Browser:
 *
 * 1. Previous registration
 * 2. window.Promise
 * 3. Throws error.
 *
 * Options:
 *
 * Promise: Desired Promise constructor
 * global: Boolean - Should the registration be cached in a global variable to
 * allow cross dependency/bundle registration?  (default true)
 */
module.exports = function(root, loadImplementation){
  return function register(implementation, opts){
    implementation = implementation || null
    opts = opts || {}
    // global registration unless explicitly  {global: false} in options (default true)
    var registerGlobal = opts.global !== false;

    // load any previous global registration
    if(registered === null && registerGlobal){
      registered = root[REGISTRATION_KEY] || null
    }

    if(registered !== null
        && implementation !== null
        && registered.implementation !== implementation){
      // Throw error if attempting to redefine implementation
      throw new Error('any-promise already defined as "'+registered.implementation+
        '".  You can only register an implementation before the first '+
        ' call to require("any-promise") and an implementation cannot be changed')
    }

    if(registered === null){
      // use provided implementation
      if(implementation !== null && typeof opts.Promise !== 'undefined'){
        registered = {
          Promise: opts.Promise,
          implementation: implementation
        }
      } else {
        // require implementation if implementation is specified but not provided
        registered = loadImplementation(implementation)
      }

      if(registerGlobal){
        // register preference globally in case multiple installations
        root[REGISTRATION_KEY] = registered
      }
    }

    return registered
  }
}

},{}],5:[function(require,module,exports){
"use strict";
module.exports = require('./loader')(window, loadImplementation)

/**
 * Browser specific loadImplementation.  Always uses `window.Promise`
 *
 * To register a custom implementation, must register with `Promise` option.
 */
function loadImplementation(){
  if(typeof window.Promise === 'undefined'){
    throw new Error("any-promise browser requires a polyfill or explicit registration"+
      " e.g: require('any-promise/register/bluebird')")
  }
  return {
    Promise: window.Promise,
    implementation: 'window.Promise'
  }
}

},{"./loader":4}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
const strftime = require('./src/util/strftime.js')
const _ = require('./src/util/underscore.js')
const isTruthy = require('./src/syntax.js').isTruthy

var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
}
var unescapeMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#34;': '"',
  '&#39;': "'"
}

var filters = {
  'abs': v => Math.abs(v),
  'append': (v, arg) => v + arg,
  'capitalize': str => stringify(str).charAt(0).toUpperCase() + str.slice(1),
  'ceil': v => Math.ceil(v),
  'concat': (v, arg) => Array.prototype.concat.call(v, arg),
  'date': (v, arg) => {
    var date = v
    if (v === 'now') {
      date = new Date()
    } else if (_.isString(v)) {
      date = new Date(v)
    }
    return isValidDate(date) ? strftime(date, arg) : v
  },
  'default': (v, arg) => isTruthy(v) ? v : arg,
  'divided_by': (v, arg) => Math.floor(v / arg),
  'downcase': v => v.toLowerCase(),
  'escape': escape,

  'escape_once': str => escape(unescape(str)),
  'first': v => v[0],
  'floor': v => Math.floor(v),
  'join': (v, arg) => v.join(arg),
  'last': v => v[v.length - 1],
  'lstrip': v => stringify(v).replace(/^\s+/, ''),
  'map': (arr, arg) => arr.map(v => v[arg]),
  'minus': bindFixed((v, arg) => v - arg),
  'modulo': bindFixed((v, arg) => v % arg),
  'newline_to_br': v => v.replace(/\n/g, '<br />'),
  'plus': bindFixed((v, arg) => Number(v) + Number(arg)),
  'prepend': (v, arg) => arg + v,
  'remove': (v, arg) => v.split(arg).join(''),
  'remove_first': (v, l) => v.replace(l, ''),
  'replace': (v, pattern, replacement) =>
    stringify(v).split(pattern).join(replacement),
  'replace_first': (v, arg1, arg2) => stringify(v).replace(arg1, arg2),
  'reverse': v => v.reverse(),
  'round': (v, arg) => {
    var amp = Math.pow(10, arg || 0)
    return Math.round(v * amp, arg) / amp
  },
  'rstrip': str => stringify(str).replace(/\s+$/, ''),
  'size': v => v.length,
  'slice': (v, begin, length) =>
    v.substr(begin, length === undefined ? 1 : length),
  'sort': (v, arg) => v.sort(arg),
  'split': (v, arg) => stringify(v).split(arg),
  'strip': (v) => stringify(v).trim(),
  'strip_html': v => stringify(v).replace(/<\/?\s*\w+\s*\/?>/g, ''),
  'strip_newlines': v => stringify(v).replace(/\n/g, ''),
  'times': (v, arg) => v * arg,
  'truncate': (v, l, o) => {
    v = stringify(v)
    o = (o === undefined) ? '...' : o
    l = l || 16
    if (v.length <= l) return v
    return v.substr(0, l - o.length) + o
  },
  'truncatewords': (v, l, o) => {
    if (o === undefined) o = '...'
    var arr = v.split(' ')
    var ret = arr.slice(0, l).join(' ')
    if (arr.length > l) ret += o
    return ret
  },
  'uniq': function (arr) {
    var u = {}
    return (arr || []).filter(val => {
      if (u.hasOwnProperty(val)) {
        return false
      }
      u[val] = true
      return true
    })
  },
  'upcase': str => stringify(str).toUpperCase(),
  'url_encode': encodeURIComponent
}

function escape (str) {
  return stringify(str).replace(/&|<|>|"|'/g, m => escapeMap[m])
}

function unescape (str) {
  return stringify(str).replace(/&(amp|lt|gt|#34|#39);/g, m => unescapeMap[m])
}

function getFixed (v) {
  var p = (v + '').split('.')
  return (p.length > 1) ? p[1].length : 0
}

function getMaxFixed (l, r) {
  return Math.max(getFixed(l), getFixed(r))
}

function stringify (obj) {
  return obj + ''
}

function bindFixed (cb) {
  return (l, r) => {
    var f = getMaxFixed(l, r)
    return cb(l, r).toFixed(f)
  }
}

function registerAll (liquid) {
  return _.forOwn(filters, (func, name) => liquid.registerFilter(name, func))
}

function isValidDate (date) {
  return date instanceof Date && !isNaN(date.getTime())
}

registerAll.filters = filters
module.exports = registerAll

},{"./src/syntax.js":15,"./src/util/strftime.js":22,"./src/util/underscore.js":23}],8:[function(require,module,exports){
const Scope = require('./src/scope')
const _ = require('./src/util/underscore.js')
const assert = require('./src/util/assert.js')
const tokenizer = require('./src/tokenizer.js')
const statFileAsync = require('./src/util/fs.js').statFileAsync
const readFileAsync = require('./src/util/fs.js').readFileAsync
const path = require('path')
const Render = require('./src/render.js')
const lexical = require('./src/lexical.js')
const Tag = require('./src/tag.js')
const Filter = require('./src/filter.js')
const Parser = require('./src/parser')
const Syntax = require('./src/syntax.js')
const tags = require('./tags')
const filters = require('./filters')
const Promise = require('any-promise')
const anySeries = require('./src/util/promise.js').anySeries
const Errors = require('./src/util/error.js')

var _engine = {
  init: function (tag, filter, options) {
    if (options.cache) {
      this.cache = {}
    }
    this.options = options
    this.tag = tag
    this.filter = filter
    this.parser = Parser(tag, filter)
    this.renderer = Render()

    tags(this)
    filters(this)

    return this
  },
  parse: function (html, filepath) {
    var tokens = tokenizer.parse(html, filepath, this.options)
    return this.parser.parse(tokens)
  },
  render: function (tpl, ctx, opts) {
    opts = _.assign({}, this.options, opts)
    var scope = Scope.factory(ctx, opts)
    return this.renderer.renderTemplates(tpl, scope)
  },
  parseAndRender: function (html, ctx, opts) {
    return Promise.resolve()
      .then(() => this.parse(html))
      .then(tpl => this.render(tpl, ctx, opts))
  },
  renderFile: function (filepath, ctx, opts) {
    opts = _.assign({}, opts)
    return this.getTemplate(filepath, opts.root)
      .then(templates => this.render(templates, ctx, opts))
  },
  evalValue: function (str, scope) {
    var tpl = this.parser.parseValue(str.trim())
    return this.renderer.evalValue(tpl, scope)
  },
  registerFilter: function (name, filter) {
    return this.filter.register(name, filter)
  },
  registerTag: function (name, tag) {
    return this.tag.register(name, tag)
  },
  lookup: function (filepath, root) {
    root = this.options.root.concat(root || [])
    root = _.uniq(root)
    var paths = root.map(root => path.resolve(root, filepath))
    return anySeries(paths, path => statFileAsync(path).then(() => path))
      .catch((e) => {
        e.message = `${e.code}: Failed to lookup ${filepath} in: ${root}`
        throw e
      })
  },
  getTemplate: function (filepath, root) {
    if (!path.extname(filepath)) {
      filepath += this.options.extname
    }
    return this
      .lookup(filepath, root)
      .then(filepath => {
        if (this.options.cache) {
          var tpl = this.cache[filepath]
          if (tpl) {
            return Promise.resolve(tpl)
          }
          return readFileAsync(filepath)
            .then(str => this.parse(str))
            .then(tpl => (this.cache[filepath] = tpl))
        } else {
          return readFileAsync(filepath).then(str => this.parse(str, filepath))
        }
      })
  },
  express: function (opts) {
    opts = opts || {}
    var self = this
    return function (filePath, ctx, callback) {
      assert(Array.isArray(this.root) || _.isString(this.root),
        'illegal views root, are you using express.js?')
      opts.root = this.root
      self.renderFile(filePath, ctx, opts)
        .then(html => callback(null, html))
        .catch(e => callback(e))
    }
  }
}

function factory (options) {
  options = _.assign({
    root: ['.'],
    cache: false,
    extname: '',
    dynamicPartials: true,
    trim_tag_right: false,
    trim_tag_left: false,
    trim_value_right: false,
    trim_value_left: false,
    greedy: true,
    strict_filters: false,
    strict_variables: false
  }, options)
  options.root = normalizeStringArray(options.root)

  var engine = Object.create(_engine)
  engine.init(Tag(), Filter(options), options)
  return engine
}

function normalizeStringArray (value) {
  if (Array.isArray(value)) return value
  if (_.isString(value)) return [value]
  return []
}

factory.lexical = lexical
factory.isTruthy = Syntax.isTruthy
factory.isFalsy = Syntax.isFalsy
factory.evalExp = Syntax.evalExp
factory.evalValue = Syntax.evalValue
factory.Types = {
  ParseError: Errors.ParseError,
  TokenizationEroor: Errors.TokenizationError,
  RenderBreakError: Errors.RenderBreakError,
  AssertionError: Errors.AssertionError
}

module.exports = factory

},{"./filters":7,"./src/filter.js":9,"./src/lexical.js":10,"./src/parser":12,"./src/render.js":13,"./src/scope":14,"./src/syntax.js":15,"./src/tag.js":16,"./src/tokenizer.js":17,"./src/util/assert.js":18,"./src/util/error.js":19,"./src/util/fs.js":20,"./src/util/promise.js":21,"./src/util/underscore.js":23,"./tags":35,"any-promise":3,"path":40}],9:[function(require,module,exports){
const lexical = require('./lexical.js')
const Syntax = require('./syntax.js')
const assert = require('./util/assert.js')
const _ = require('./util/underscore.js')

var valueRE = new RegExp(`${lexical.value.source}`, 'g')

module.exports = function (options) {
  options = _.assign({}, options)
  var filters = {}

  var _filterInstance = {
    render: function (output, scope) {
      var args = this.args.map(arg => Syntax.evalValue(arg, scope))
      args.unshift(output)
      return this.filter.apply(null, args)
    },
    parse: function (str) {
      var match = lexical.filterLine.exec(str)
      assert(match, 'illegal filter: ' + str)

      var name = match[1]
      var argList = match[2] || ''
      var filter = filters[name]
      if (typeof filter !== 'function') {
        if (options.strict_filters) {
          throw new TypeError(`undefined filter: ${name}`)
        }
        this.name = name
        this.filter = x => x
        this.args = []
        return this
      }

      var args = []
      while ((match = valueRE.exec(argList.trim()))) {
        var v = match[0]
        var re = new RegExp(`${v}\\s*:`, 'g')
        re.test(match.input) ? args.push(`'${v}'`) : args.push(v)
      }

      this.name = name
      this.filter = filter
      this.args = args

      return this
    }
  }

  function construct (str) {
    var instance = Object.create(_filterInstance)
    return instance.parse(str)
  }

  function register (name, filter) {
    filters[name] = filter
  }

  function clear () {
    filters = {}
  }

  return {
    construct, register, clear
  }
}

},{"./lexical.js":10,"./syntax.js":15,"./util/assert.js":18,"./util/underscore.js":23}],10:[function(require,module,exports){
// quote related
var singleQuoted = /'[^']*'/
var doubleQuoted = /"[^"]*"/
var quoted = new RegExp(`${singleQuoted.source}|${doubleQuoted.source}`)
var quoteBalanced = new RegExp(`(?:${quoted.source}|[^'"])*`)

// basic types
var integer = /-?\d+/
var number = /-?\d+\.?\d*|\.?\d+/
var bool = /true|false/

// peoperty access
var identifier = /[\w-]+/
var subscript = new RegExp(`\\[(?:${quoted.source}|[\\w-\\.]+)\\]`)
var literal = new RegExp(`(?:${quoted.source}|${bool.source}|${number.source})`)
var variable = new RegExp(`${identifier.source}(?:\\.${identifier.source}|${subscript.source})*`)

// range related
var rangeLimit = new RegExp(`(?:${variable.source}|${number.source})`)
var range = new RegExp(`\\(${rangeLimit.source}\\.\\.${rangeLimit.source}\\)`)
var rangeCapture = new RegExp(`\\((${rangeLimit.source})\\.\\.(${rangeLimit.source})\\)`)

var value = new RegExp(`(?:${variable.source}|${literal.source}|${range.source})`)

// hash related
var hash = new RegExp(`(?:${identifier.source})\\s*:\\s*(?:${value.source})`)
var hashCapture = new RegExp(`(${identifier.source})\\s*:\\s*(${value.source})`, 'g')

// full match
var tagLine = new RegExp(`^\\s*(${identifier.source})\\s*([\\s\\S]*)\\s*$`)
var literalLine = new RegExp(`^${literal.source}$`, 'i')
var variableLine = new RegExp(`^${variable.source}$`)
var numberLine = new RegExp(`^${number.source}$`)
var boolLine = new RegExp(`^${bool.source}$`, 'i')
var quotedLine = new RegExp(`^${quoted.source}$`)
var rangeLine = new RegExp(`^${rangeCapture.source}$`)
var integerLine = new RegExp(`^${integer.source}$`)

// filter related
var valueDeclaration = new RegExp(`(?:${identifier.source}\\s*:\\s*)?${value.source}`)
var valueList = new RegExp(`${valueDeclaration.source}(\\s*,\\s*${valueDeclaration.source})*`)
var filter = new RegExp(`${identifier.source}(?:\\s*:\\s*${valueList.source})?`, 'g')
var filterCapture = new RegExp(`(${identifier.source})(?:\\s*:\\s*(${valueList.source}))?`)
var filterLine = new RegExp(`^${filterCapture.source}$`)

var operators = [
  /\s+or\s+/,
  /\s+and\s+/,
  /==|!=|<=|>=|<|>|\s+contains\s+/
]

function isInteger (str) {
  return integerLine.test(str)
}

function isLiteral (str) {
  return literalLine.test(str)
}

function isRange (str) {
  return rangeLine.test(str)
}

function isVariable (str) {
  return variableLine.test(str)
}

function matchValue (str) {
  return value.exec(str)
}

function parseLiteral (str) {
  var res = str.match(numberLine)
  if (res) {
    return Number(str)
  }
  res = str.match(boolLine)
  if (res) {
    return str.toLowerCase() === 'true'
  }
  res = str.match(quotedLine)
  if (res) {
    return str.slice(1, -1)
  }
  throw new TypeError(`cannot parse '${str}' as literal`)
}

module.exports = {
  quoted,
  number,
  bool,
  literal,
  filter,
  integer,
  hash,
  hashCapture,
  range,
  rangeCapture,
  identifier,
  value,
  quoteBalanced,
  operators,
  quotedLine,
  numberLine,
  boolLine,
  rangeLine,
  literalLine,
  filterLine,
  tagLine,
  isLiteral,
  isVariable,
  parseLiteral,
  isRange,
  matchValue,
  isInteger
}

},{}],11:[function(require,module,exports){
module.exports = function (isTruthy) {
  return {
    '==': (l, r) => l === r,
    '!=': (l, r) => l !== r,
    '>': (l, r) => l !== null && r !== null && l > r,
    '<': (l, r) => l !== null && r !== null && l < r,
    '>=': (l, r) => l !== null && r !== null && l >= r,
    '<=': (l, r) => l !== null && r !== null && l <= r,
    'contains': (l, r) => {
      if (!l) return false
      if (typeof l.indexOf !== 'function') return false
      return l.indexOf(r) > -1
    },
    'and': (l, r) => isTruthy(l) && isTruthy(r),
    'or': (l, r) => isTruthy(l) || isTruthy(r)
  }
}

},{}],12:[function(require,module,exports){
const lexical = require('./lexical.js')
const ParseError = require('./util/error.js').ParseError
const assert = require('./util/assert.js')

module.exports = function (Tag, Filter) {
  var stream = {
    init: function (tokens) {
      this.tokens = tokens
      this.handlers = {}
      return this
    },
    on: function (name, cb) {
      this.handlers[name] = cb
      return this
    },
    trigger: function (event, arg) {
      var h = this.handlers[event]
      if (typeof h === 'function') {
        h(arg)
        return true
      }
    },
    start: function () {
      this.trigger('start')
      var token
      while (!this.stopRequested && (token = this.tokens.shift())) {
        if (this.trigger('token', token)) continue
        if (token.type === 'tag' &&
            this.trigger(`tag:${token.name}`, token)) {
          continue
        }
        var template = parseToken(token, this.tokens)
        this.trigger('template', template)
      }
      if (!this.stopRequested) this.trigger('end')
      return this
    },
    stop: function () {
      this.stopRequested = true
      return this
    }
  }

  function parse (tokens) {
    var token
    var templates = []
    while ((token = tokens.shift())) {
      templates.push(parseToken(token, tokens))
    }
    return templates
  }

  function parseToken (token, tokens) {
    try {
      var tpl = null
      if (token.type === 'tag') {
        tpl = parseTag(token, tokens)
      } else if (token.type === 'value') {
        tpl = parseValue(token.value)
      } else { // token.type === 'html'
        tpl = token
      }
      tpl.token = token
      return tpl
    } catch (e) {
      throw new ParseError(e, token)
    }
  }

  function parseTag (token, tokens) {
    if (token.name === 'continue' || token.name === 'break') return token
    return Tag.construct(token, tokens)
  }

  function parseValue (str) {
    var match = lexical.matchValue(str)
    assert(match, `illegal value string: ${str}`)

    var initial = match[0]
    str = str.substr(match.index + match[0].length)

    var filters = []
    while ((match = lexical.filter.exec(str))) {
      filters.push([match[0].trim()])
    }

    return {
      type: 'value',
      initial: initial,
      filters: filters.map(str => Filter.construct(str))
    }
  }

  function parseStream (tokens) {
    var s = Object.create(stream)
    return s.init(tokens)
  }

  return {
    parse,
    parseTag,
    parseStream,
    parseValue
  }
}

},{"./lexical.js":10,"./util/assert.js":18,"./util/error.js":19}],13:[function(require,module,exports){
const Syntax = require('./syntax.js')
const Promise = require('any-promise')
const mapSeries = require('./util/promise.js').mapSeries
const RenderBreakError = require('./util/error.js').RenderBreakError
const RenderError = require('./util/error.js').RenderError
const assert = require('./util/assert.js')

var render = {

  renderTemplates: function (templates, scope) {
    assert(scope, 'unable to evalTemplates: scope undefined')

    var html = ''
    return mapSeries(templates, (tpl) => {
      return renderTemplate.call(this, tpl)
        .then(partial => (html += partial))
        .catch(e => {
          if (e instanceof RenderBreakError) {
            e.resolvedHTML = html
            throw e
          }
          throw new RenderError(e, tpl)
        })
    }).then(() => html)

    function renderTemplate (template) {
      if (template.type === 'tag') {
        return this.renderTag(template, scope)
          .then(partial => partial === undefined ? '' : partial)
      } else if (template.type === 'value') {
        return Promise.resolve()
          .then(() => this.evalValue(template, scope))
          .then(partial => partial === undefined ? '' : stringify(partial))
      } else { // template.type === 'html'
        return Promise.resolve(template.value)
      }
    }
  },

  renderTag: function (template, scope) {
    if (template.name === 'continue') {
      return Promise.reject(new RenderBreakError('continue'))
    }
    if (template.name === 'break') {
      return Promise.reject(new RenderBreakError('break'))
    }
    return template.render(scope)
  },

  evalValue: function (template, scope) {
    assert(scope, 'unable to evalValue: scope undefined')
    return template.filters.reduce(
      (prev, filter) => filter.render(prev, scope),
      Syntax.evalExp(template.initial, scope))
  }
}

function factory () {
  var instance = Object.create(render)
  return instance
}

function stringify (val) {
  if (typeof val === 'string') return val
  return JSON.stringify(val)
}

module.exports = factory

},{"./syntax.js":15,"./util/assert.js":18,"./util/error.js":19,"./util/promise.js":21,"any-promise":3}],14:[function(require,module,exports){
const _ = require('./util/underscore.js')
const lexical = require('./lexical.js')
const assert = require('./util/assert.js')

var Scope = {
  getAll: function () {
    var ctx = {}
    for (var i = this.scopes.length - 1; i >= 0; i--) {
      _.assign(ctx, this.scopes[i])
    }
    return ctx
  },
  get: function (str) {
    try {
      return this.getPropertyByPath(this.scopes, str)
    } catch (e) {
      if (!/undefined variable/.test(e.message) || this.opts.strict_variables) {
        throw e
      }
    }
  },
  set: function (k, v) {
    var scope = this.findScopeFor(k)
    setPropertyByPath(scope, k, v)
    return this
  },
  push: function (ctx) {
    assert(ctx, `trying to push ${ctx} into scopes`)
    return this.scopes.push(ctx)
  },
  pop: function () {
    return this.scopes.pop()
  },
  findScopeFor: function (key) {
    var i = this.scopes.length - 1
    while (i >= 0 && !(key in this.scopes[i])) {
      i--
    }
    if (i < 0) {
      i = this.scopes.length - 1
    }
    return this.scopes[i]
  },
  unshift: function (ctx) {
    assert(ctx, `trying to push ${ctx} into scopes`)
    return this.scopes.unshift(ctx)
  },
  shift: function () {
    return this.scopes.shift()
  },

  getPropertyByPath: function (scopes, path) {
    var paths = this.propertyAccessSeq(path + '')
    if (!paths.length) {
      throw new TypeError('undefined variable: ' + path)
    }
    var key = paths.shift()
    var value = getValueFromScopes(key, scopes)
    return paths.reduce(
      (value, key) => {
        if (_.isNil(value)) {
          throw new TypeError('undefined variable: ' + key)
        }
        return getValueFromParent(key, value)
      },
      value
    )
  },

  /*
   * Parse property access sequence from access string
   * @example
   * accessSeq("foo.bar")            // ['foo', 'bar']
   * accessSeq("foo['bar']")      // ['foo', 'bar']
   * accessSeq("foo['b]r']")      // ['foo', 'b]r']
   * accessSeq("foo[bar.coo]")    // ['foo', 'bar'], for bar.coo == 'bar'
   */
  propertyAccessSeq: function (str) {
    var seq = []
    var name = ''
    var j
    var i = 0
    while (i < str.length) {
      switch (str[i]) {
        case '[':
          push()

          var delemiter = str[i + 1]
          if (/['"]/.test(delemiter)) { // foo["bar"]
            j = str.indexOf(delemiter, i + 2)
            assert(j !== -1, `unbalanced ${delemiter}: ${str}`)
            name = str.slice(i + 2, j)
            push()
            i = j + 2
          } else { // foo[bar.coo]
            j = matchRightBracket(str, i + 1)
            assert(j !== -1, `unbalanced []: ${str}`)
            name = str.slice(i + 1, j)
            if (!lexical.isInteger(name)) { // foo[bar] vs. foo[1]
              name = this.get(name)
            }
            push()
            i = j + 1
          }
          break
        case '.':// foo.bar, foo[0].bar
          push()
          i++
          break
        default:// foo.bar
          name += str[i]
          i++
      }
    }
    push()
    return seq

    function push () {
      if (name.length) seq.push(name)
      name = ''
    }
  }
}

function setPropertyByPath (obj, path, val) {
  var paths = (path + '').replace(/\[/g, '.').replace(/\]/g, '').split('.')
  for (var i = 0; i < paths.length; i++) {
    var key = paths[i]
    if (!_.isObject(obj)) {
      // cannot set property of non-object
      return
    }
    // for end point
    if (i === paths.length - 1) {
      return (obj[key] = val)
    }
    // if path not exist
    if (undefined === obj[key]) {
      obj[key] = {}
    }
    obj = obj[key]
  }
}

function getValueFromParent (key, value) {
  return (key === 'size' && (_.isArray(value) || _.isString(value)))
    ? value.length
    : value[key]
}

function getValueFromScopes (key, scopes) {
  for (var i = scopes.length - 1; i > -1; i--) {
    var scope = scopes[i]
    if (scope.hasOwnProperty(key)) {
      return scope[key]
    }
  }
  throw new TypeError('undefined variable: ' + key)
}

function matchRightBracket (str, begin) {
  var stack = 1 // count of '[' - count of ']'
  for (var i = begin; i < str.length; i++) {
    if (str[i] === '[') {
      stack++
    }
    if (str[i] === ']') {
      stack--
      if (stack === 0) {
        return i
      }
    }
  }
  return -1
}

exports.factory = function (ctx, opts) {
  var defaultOptions = {
    dynamicPartials: true,
    strict_variables: false,
    strict_filters: false,
    blocks: {},
    root: []
  }
  var scope = Object.create(Scope)
  scope.opts = _.assign(defaultOptions, opts)
  scope.scopes = [ctx || {}]
  return scope
}

},{"./lexical.js":10,"./util/assert.js":18,"./util/underscore.js":23}],15:[function(require,module,exports){
const operators = require('./operators.js')(isTruthy)
const lexical = require('./lexical.js')
const assert = require('../src/util/assert.js')

function evalExp (exp, scope) {
  assert(scope, 'unable to evalExp: scope undefined')
  var operatorREs = lexical.operators
  var match
  for (var i = 0; i < operatorREs.length; i++) {
    var operatorRE = operatorREs[i]
    var expRE = new RegExp(`^(${lexical.quoteBalanced.source})(${operatorRE.source})(${lexical.quoteBalanced.source})$`)
    if ((match = exp.match(expRE))) {
      var l = evalExp(match[1], scope)
      var op = operators[match[2].trim()]
      var r = evalExp(match[3], scope)
      return op(l, r)
    }
  }

  if ((match = exp.match(lexical.rangeLine))) {
    var low = evalValue(match[1], scope)
    var high = evalValue(match[2], scope)
    var range = []
    for (var j = low; j <= high; j++) {
      range.push(j)
    }
    return range
  }

  return evalValue(exp, scope)
}

function evalValue (str, scope) {
  str = str && str.trim()
  if (!str) return undefined

  if (lexical.isLiteral(str)) {
    return lexical.parseLiteral(str)
  }
  if (lexical.isVariable(str)) {
    return scope.get(str)
  }
  throw new TypeError(`cannot eval '${str}' as value`)
}

function isTruthy (val) {
  return !isFalsy(val)
}

function isFalsy (val) {
  return val === false || undefined === val || val === null
}

module.exports = {
  evalExp, evalValue, isTruthy, isFalsy
}

},{"../src/util/assert.js":18,"./lexical.js":10,"./operators.js":11}],16:[function(require,module,exports){
const lexical = require('./lexical.js')
const Promise = require('any-promise')
const Syntax = require('./syntax.js')
const assert = require('./util/assert.js')

function hash (markup, scope) {
  var obj = {}
  var match
  lexical.hashCapture.lastIndex = 0
  while ((match = lexical.hashCapture.exec(markup))) {
    var k = match[1]
    var v = match[2]
    obj[k] = Syntax.evalValue(v, scope)
  }
  return obj
}

module.exports = function () {
  var tagImpls = {}

  var _tagInstance = {
    render: function (scope) {
      var obj = hash(this.token.args, scope)
      var impl = this.tagImpl
      if (typeof impl.render !== 'function') {
        return Promise.resolve('')
      }
      return Promise.resolve().then(() => impl.render(scope, obj))
    },
    parse: function (token, tokens) {
      this.type = 'tag'
      this.token = token
      this.name = token.name

      var tagImpl = tagImpls[this.name]
      assert(tagImpl, `tag ${this.name} not found`)
      this.tagImpl = Object.create(tagImpl)
      if (this.tagImpl.parse) {
        this.tagImpl.parse(token, tokens)
      }
    }
  }

  function register (name, tag) {
    tagImpls[name] = tag
  }

  function construct (token, tokens) {
    var instance = Object.create(_tagInstance)
    instance.parse(token, tokens)
    return instance
  }

  function clear () {
    tagImpls = {}
  }

  return {
    construct,
    register,
    clear
  }
}

},{"./lexical.js":10,"./syntax.js":15,"./util/assert.js":18,"any-promise":3}],17:[function(require,module,exports){
const lexical = require('./lexical.js')
const TokenizationError = require('./util/error.js').TokenizationError
const _ = require('./util/underscore.js')
const whiteSpaceCtrl = require('./whitespace-ctrl.js')
const assert = require('./util/assert.js')

function parse (input, file, options) {
  assert(_.isString(input), 'illegal input')

  var rLiquid = /({%-?([\s\S]*?)-?%})|({{-?([\s\S]*?)-?}})/g
  var currIndent = 0
  var lineNumber = LineNumber(input)
  var lastMatchEnd = 0
  var tokens = []

  for (var match; (match = rLiquid.exec(input)); lastMatchEnd = rLiquid.lastIndex) {
    if (match.index > lastMatchEnd) {
      tokens.push(parseHTMLToken(lastMatchEnd, match.index))
    }
    tokens.push(match[1]
      ? parseTagToken(match[1], match[2].trim(), match.index)
      : parseValueToken(match[3], match[4].trim(), match.index))
  }
  if (input.length > lastMatchEnd) {
    tokens.push(parseHTMLToken(lastMatchEnd, input.length))
  }
  whiteSpaceCtrl(tokens, options)
  return tokens

  function parseTagToken (raw, value, pos) {
    var match = value.match(lexical.tagLine)
    var token = {
      type: 'tag',
      indent: currIndent,
      line: lineNumber.get(pos),
      trim_left: raw.slice(0, 3) === '{%-',
      trim_right: raw.slice(-3) === '-%}',
      raw,
      value,
      input,
      file
    }
    if (!match) {
      throw new TokenizationError(`illegal tag syntax`, token)
    }
    token.name = match[1]
    token.args = match[2]
    return token
  }

  function parseValueToken (raw, value, pos) {
    return {
      type: 'value',
      line: lineNumber.get(pos),
      trim_left: raw.slice(0, 3) === '{{-',
      trim_right: raw.slice(-3) === '-}}',
      raw,
      value,
      input,
      file
    }
  }

  function parseHTMLToken (begin, end) {
    var htmlFragment = input.slice(begin, end)
    currIndent = _.last((htmlFragment).split('\n')).length

    return {
      type: 'html',
      raw: htmlFragment,
      value: htmlFragment
    }
  }
}

function LineNumber (html) {
  var parsedLinesCount = 0
  var lastMatchBegin = -1

  return {
    get: function (pos) {
      var lines = html.slice(lastMatchBegin + 1, pos).split('\n')
      parsedLinesCount += lines.length - 1
      lastMatchBegin = pos
      return parsedLinesCount + 1
    }
  }
}

exports.parse = parse
exports.whiteSpaceCtrl = whiteSpaceCtrl

},{"./lexical.js":10,"./util/assert.js":18,"./util/error.js":19,"./util/underscore.js":23,"./whitespace-ctrl.js":24}],18:[function(require,module,exports){
const AssertionError = require('./error.js').AssertionError

function assert (predicate, message) {
  if (!predicate) {
    message = message || `expect ${predicate} to be true`
    throw new AssertionError(message)
  }
}

module.exports = assert

},{"./error.js":19}],19:[function(require,module,exports){
const _ = require('./underscore.js')

function initError () {
  this.name = this.constructor.name
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor)
  }
}

function initLiquidError (err, token) {
  initError.call(this)

  this.input = token.input
  this.line = token.line
  this.file = token.file

  var context = mkContext(token.input, token.line)
  this.message = mkMessage(err.message, token)
  this.stack = context +
    '\n' + (this.stack || this.message) +
      (err.stack ? '\nFrom ' + err.stack : '')
}

function TokenizationError (message, token) {
  initLiquidError.call(this, {message: message}, token)
}
TokenizationError.prototype = Object.create(Error.prototype)
TokenizationError.prototype.constructor = TokenizationError

function ParseError (e, token) {
  _.assign(this, e)
  this.originalError = e

  initLiquidError.call(this, e, token)
}
ParseError.prototype = Object.create(Error.prototype)
ParseError.prototype.constructor = ParseError

function RenderError (e, tpl) {
  // return the original render error
  if (e instanceof RenderError) {
    return e
  }
  _.assign(this, e)
  this.originalError = e

  initLiquidError.call(this, e, tpl.token)
}
RenderError.prototype = Object.create(Error.prototype)
RenderError.prototype.constructor = RenderError

function RenderBreakError (message) {
  initError.call(this)
  this.message = message + ''
}
RenderBreakError.prototype = Object.create(Error.prototype)
RenderBreakError.prototype.constructor = RenderBreakError

function AssertionError (message) {
  initError.call(this)
  this.message = message + ''
}
AssertionError.prototype = Object.create(Error.prototype)
AssertionError.prototype.constructor = AssertionError

function mkContext (input, line) {
  var lines = input.split('\n')
  var begin = Math.max(line - 2, 1)
  var end = Math.min(line + 3, lines.length)

  var context = _
    .range(begin, end + 1)
    .map(l => [
      (l === line) ? '>> ' : '   ',
      align(l, end),
      '| ',
      lines[l - 1]
    ].join(''))
    .join('\n')

  return context
}

function align (n, max) {
  var length = (max + '').length
  var str = n + ''
  var blank = Array(length - str.length).join(' ')
  return blank + str
}

function mkMessage (msg, token) {
  msg = msg || ''
  if (token.file) {
    msg += ', file:' + token.file
  }
  if (token.line) {
    msg += ', line:' + token.line
  }
  return msg
}

module.exports = {
  TokenizationError,
  ParseError,
  RenderBreakError,
  AssertionError,
  RenderError
}

},{"./underscore.js":23}],20:[function(require,module,exports){
const fs = require('fs')

function readFileAsync (filepath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filepath, 'utf8', function (err, content) {
      err ? reject(err) : resolve(content)
    })
  })
};

function statFileAsync (path) {
  return new Promise(function (resolve, reject) {
    fs.stat(path, (err, stat) => err ? reject(err) : resolve(stat))
  })
};

module.exports = {
  readFileAsync,
  statFileAsync
}

},{"fs":6}],21:[function(require,module,exports){
const Promise = require('any-promise')

/*
 * Call functions in serial until someone resolved.
 * @param {Array} iterable the array to iterate with.
 * @param {Array} iteratee returns a new promise.
 * The iteratee is invoked with three arguments: (value, index, iterable).
 */
function anySeries (iterable, iteratee) {
  var ret = Promise.reject(new Error('init'))
  iterable.forEach(function (item, idx) {
    ret = ret.catch(e => iteratee(item, idx, iterable))
  })
  return ret
}

/*
 * Call functions in serial until someone rejected.
 * @param {Array} iterable the array to iterate with.
 * @param {Array} iteratee returns a new promise.
 * The iteratee is invoked with three arguments: (value, index, iterable).
 */
function mapSeries (iterable, iteratee) {
  var ret = Promise.resolve('init')
  var result = []
  iterable.forEach(function (item, idx) {
    ret = ret
      .then(() => iteratee(item, idx, iterable))
      .then(x => result.push(x))
  })
  return ret.then(() => result)
}

exports.anySeries = anySeries
exports.mapSeries = mapSeries

},{"any-promise":3}],22:[function(require,module,exports){
var monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
]
var monthNamesShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
  'Nov', 'Dec'
]
var dayNames = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]
var dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
var suffixes = {
  1: 'st',
  2: 'nd',
  3: 'rd',
  'default': 'th'
}

// prototype extensions
var _date = {
  daysInMonth: function (d) {
    var feb = _date.isLeapYear(d) ? 29 : 28
    return [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  },

  getDayOfYear: function (d) {
    var num = 0
    for (var i = 0; i < d.getMonth(); ++i) {
      num += _date.daysInMonth(d)[i]
    }
    return num + d.getDate()
  },

  // Startday is an integer of which day to start the week measuring from
  // TODO: that comment was retarted. fix it.
  getWeekOfYear: function (d, startDay) {
    // Skip to startDay of this week
    var now = this.getDayOfYear(d) + (startDay - d.getDay())
    // Find the first startDay of the year
    var jan1 = new Date(d.getFullYear(), 0, 1)
    var then = (7 - jan1.getDay() + startDay)
    return _number.pad(Math.floor((now - then) / 7) + 1, 2)
  },

  isLeapYear: function (d) {
    var year = d.getFullYear()
    return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)))
  },

  getSuffix: function (d) {
    var str = d.getDate().toString()
    var index = parseInt(str.slice(-1))
    return suffixes[index] || suffixes['default']
  },

  century: function (d) {
    return parseInt(d.getFullYear().toString().substring(0, 2), 10)
  }
}

var _number = {
  pad: function (value, size, ch) {
    if (!ch) ch = '0'
    var result = value.toString()
    var pad = size - result.length

    while (pad-- > 0) {
      result = ch + result
    }

    return result
  }
}

var formatCodes = {
  a: function (d) {
    return dayNamesShort[d.getDay()]
  },
  A: function (d) {
    return dayNames[d.getDay()]
  },
  b: function (d) {
    return monthNamesShort[d.getMonth()]
  },
  B: function (d) {
    return monthNames[d.getMonth()]
  },
  c: function (d) {
    return d.toLocaleString()
  },
  C: function (d) {
    return _date.century(d)
  },
  d: function (d) {
    return _number.pad(d.getDate(), 2)
  },
  e: function (d) {
    return _number.pad(d.getDate(), 2, ' ')
  },
  H: function (d) {
    return _number.pad(d.getHours(), 2)
  },
  I: function (d) {
    return _number.pad(d.getHours() % 12 || 12, 2)
  },
  j: function (d) {
    return _number.pad(_date.getDayOfYear(d), 3)
  },
  k: function (d) {
    return _number.pad(d.getHours(), 2, ' ')
  },
  l: function (d) {
    return _number.pad(d.getHours() % 12 || 12, 2, ' ')
  },
  L: function (d) {
    return _number.pad(d.getMilliseconds(), 3)
  },
  m: function (d) {
    return _number.pad(d.getMonth() + 1, 2)
  },
  M: function (d) {
    return _number.pad(d.getMinutes(), 2)
  },
  p: function (d) {
    return (d.getHours() < 12 ? 'AM' : 'PM')
  },
  P: function (d) {
    return (d.getHours() < 12 ? 'am' : 'pm')
  },
  q: function (d) {
    return _date.getSuffix(d)
  },
  s: function (d) {
    return Math.round(d.valueOf() / 1000)
  },
  S: function (d) {
    return _number.pad(d.getSeconds(), 2)
  },
  u: function (d) {
    return d.getDay() || 7
  },
  U: function (d) {
    return _date.getWeekOfYear(d, 0)
  },
  w: function (d) {
    return d.getDay()
  },
  W: function (d) {
    return _date.getWeekOfYear(d, 1)
  },
  x: function (d) {
    return d.toLocaleDateString()
  },
  X: function (d) {
    return d.toLocaleTimeString()
  },
  y: function (d) {
    return d.getFullYear().toString().substring(2, 4)
  },
  Y: function (d) {
    return d.getFullYear()
  },
  z: function (d) {
    var tz = d.getTimezoneOffset() / 60 * 100
    return (tz > 0 ? '-' : '+') + _number.pad(Math.abs(tz), 4)
  },
  '%': function () {
    return '%'
  }
}
formatCodes.h = formatCodes.b
formatCodes.N = formatCodes.L

var strftime = function (d, format) {
  var output = ''
  var remaining = format

  while (true) {
    var r = /%./g
    var results = r.exec(remaining)

    // No more format codes. Add the remaining text and return
    if (!results) {
      return output + remaining
    }

    // Add the preceding text
    output += remaining.slice(0, r.lastIndex - 2)
    remaining = remaining.slice(r.lastIndex)

    // Add the format code
    var ch = results[0].charAt(1)
    var func = formatCodes[ch]
    output += func ? func.call(this, d) : '%' + ch
  }
}

module.exports = strftime

},{}],23:[function(require,module,exports){
const toStr = Object.prototype.toString

/*
 * Checks if value is classified as a String primitive or object.
 * @param {any} value The value to check.
 * @return {Boolean} Returns true if value is a string, else false.
 */
function isString (value) {
  return value instanceof String || typeof value === 'string'
}

function isNil (value) {
  return value === null || value === undefined
}

function isArray (value) {
  // be compatible with IE 8
  return toStr.call(value) === '[object Array]'
}

function isError (value) {
  var signature = Object.prototype.toString.call(value)
  // [object XXXError]
  return signature.substr(-6, 5) === 'Error' ||
        (typeof value.message === 'string' && typeof value.name === 'string')
}

/*
 * Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
 * The iteratee is invoked with three arguments: (value, key, object).
 * Iteratee functions may exit iteration early by explicitly returning false.
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @return {Object} Returns object.
 */
function forOwn (object, iteratee) {
  object = object || {}
  for (var k in object) {
    if (object.hasOwnProperty(k)) {
      if (iteratee(object[k], k, object) === false) break
    }
  }
  return object
}

/*
 * Assigns own enumerable string keyed properties of source objects to the destination object.
 * Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * Note: This method mutates object and is loosely based on Object.assign.
 *
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @return {Object} Returns object.
 */
function assign (object) {
  object = isObject(object) ? object : {}
  var srcs = Array.prototype.slice.call(arguments, 1)
  srcs.forEach(function (src) {
    _assignBinary(object, src)
  })
  return object
}

function _assignBinary (dst, src) {
  forOwn(src, function (v, k) {
    dst[k] = v
  })
  return dst
}

function last (arr) {
  return arr[arr.length - 1]
}

function uniq (arr) {
  var u = {}
  var a = []
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (u.hasOwnProperty(arr[i])) {
      continue
    }
    a.push(arr[i])
    u[arr[i]] = 1
  }
  return a
}

/*
 * Checks if value is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, new Number(0), and new String(''))
 * @param {any} value The value to check.
 * @return {Boolean} Returns true if value is an object, else false.
 */
function isObject (value) {
  var type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

/*
 * A function to create flexibly-numbered lists of integers,
 * handy for each and map loops. start, if omitted, defaults to 0; step defaults to 1.
 * Returns a list of integers from start (inclusive) to stop (exclusive),
 * incremented (or decremented) by step, exclusive.
 * Note that ranges that stop before they start are considered to be zero-length instead of
 * negative — if you'd like a negative range, use a negative step.
 */
function range (start, stop, step) {
  if (arguments.length === 1) {
    stop = start
    start = 0
  }
  step = step || 1

  var arr = []
  for (var i = start; i < stop; i += step) {
    arr.push(i)
  }
  return arr
}

// lang
exports.isString = isString
exports.isObject = isObject
exports.isArray = isArray
exports.isNil = isNil
exports.isError = isError

// array
exports.range = range
exports.last = last

// object
exports.forOwn = forOwn
exports.assign = assign
exports.uniq = uniq

},{}],24:[function(require,module,exports){
const _ = require('./util/underscore.js')

function whiteSpaceCtrl (tokens, options) {
  options = _.assign({ greedy: true }, options)
  var inRaw = false

  tokens.forEach((token, i) => {
    if (shouldTrimLeft(token, inRaw, options)) {
      trimLeft(tokens[i - 1], options.greedy)
    }

    if (token.type === 'tag' && token.name === 'raw') inRaw = true
    if (token.type === 'tag' && token.name === 'endraw') inRaw = false

    if (shouldTrimRight(token, inRaw, options)) {
      trimRight(tokens[i + 1], options.greedy)
    }
  })
}

function shouldTrimLeft (token, inRaw, options) {
  if (inRaw) return false
  if (token.type === 'tag') return token.trim_left || options.trim_tag_left
  if (token.type === 'value') return token.trim_left || options.trim_value_left
}

function shouldTrimRight (token, inRaw, options) {
  if (inRaw) return false
  if (token.type === 'tag') return token.trim_right || options.trim_tag_right
  if (token.type === 'value') return token.trim_right || options.trim_value_right
}

function trimLeft (token, greedy) {
  if (!token || token.type !== 'html') return

  var rLeft = greedy ? /\s+$/g : /[\t\r ]*$/g
  token.value = token.value.replace(rLeft, '')
}

function trimRight (token, greedy) {
  if (!token || token.type !== 'html') return

  var rRight = greedy ? /^\s+/g : /^[\t\r ]*\n?/g
  token.value = token.value.replace(rRight, '')
}

module.exports = whiteSpaceCtrl

},{"./util/underscore.js":23}],25:[function(require,module,exports){
const Liquid = require('..')
const lexical = Liquid.lexical
const Promise = require('any-promise')
const re = new RegExp(`(${lexical.identifier.source})\\s*=(.*)`)
const assert = require('../src/util/assert.js')

module.exports = function (liquid) {
  liquid.registerTag('assign', {
    parse: function (token) {
      var match = token.args.match(re)
      assert(match, `illegal token ${token.raw}`)
      this.key = match[1]
      this.value = match[2]
    },
    render: function (scope) {
      scope.set(this.key, liquid.evalValue(this.value, scope))
      return Promise.resolve('')
    }
  })
}

},{"..":8,"../src/util/assert.js":18,"any-promise":3}],26:[function(require,module,exports){
const Liquid = require('..');
const lexical = Liquid.lexical;
const re = new RegExp(`(${lexical.identifier.source})`);
const assert = require('../src/util/assert.js');

module.exports = function(liquid) {

    liquid.registerTag('capture', {
        parse: function(tagToken, remainTokens) {
            var match = tagToken.args.match(re);
            assert(match, `${tagToken.args} not valid identifier`);

            this.variable = match[1];
            this.templates = [];

            var stream = liquid.parser.parseStream(remainTokens);
            stream.on('tag:endcapture', token => stream.stop())
                .on('template', tpl => this.templates.push(tpl))
                .on('end', x => {
                    throw new Error(`tag ${tagToken.raw} not closed`);
                });
            stream.start();
        },
        render: function(scope, hash) {
            return liquid.renderer.renderTemplates(this.templates, scope)
                .then((html) => {
                    scope.set(this.variable, html);
                });
        }
    });

};

},{"..":8,"../src/util/assert.js":18}],27:[function(require,module,exports){
const Liquid = require('..')

module.exports = function (liquid) {
  liquid.registerTag('case', {

    parse: function (tagToken, remainTokens) {
      this.cond = tagToken.args
      this.cases = []
      this.elseTemplates = []

      var p = []
      var stream = liquid.parser.parseStream(remainTokens)
        .on('tag:when', token => {
          this.cases.push({
            val: token.args,
            templates: p = []
          })
        })
        .on('tag:else', () => (p = this.elseTemplates))
        .on('tag:endcase', token => stream.stop())
        .on('template', tpl => p.push(tpl))
        .on('end', x => {
          throw new Error(`tag ${tagToken.raw} not closed`)
        })

      stream.start()
    },

    render: function (scope, hash) {
      for (var i = 0; i < this.cases.length; i++) {
        var branch = this.cases[i]
        var val = Liquid.evalExp(branch.val, scope)
        var cond = Liquid.evalExp(this.cond, scope)
        if (val === cond) {
          return liquid.renderer.renderTemplates(branch.templates, scope)
        }
      }
      return liquid.renderer.renderTemplates(this.elseTemplates, scope)
    }
  })
}

},{"..":8}],28:[function(require,module,exports){
module.exports = function(liquid) {

    liquid.registerTag('comment', {
        parse: function(tagToken, remainTokens) {
            var stream = liquid.parser.parseStream(remainTokens);
            stream
                .on('token', token => {
                    if(token.name === 'endcomment') stream.stop();
                })
                .on('end', x => {
                    throw new Error(`tag ${tagToken.raw} not closed`);
                });
            stream.start();
        }
    });

};

},{}],29:[function(require,module,exports){
const Liquid = require('..')
const Promise = require('any-promise')
const lexical = Liquid.lexical
const groupRE = new RegExp(`^(?:(${lexical.value.source})\\s*:\\s*)?(.*)$`)
const candidatesRE = new RegExp(lexical.value.source, 'g')
const assert = require('../src/util/assert.js')

module.exports = function (liquid) {
  liquid.registerTag('cycle', {

    parse: function (tagToken, remainTokens) {
      var match = groupRE.exec(tagToken.args)
      assert(match, `illegal tag: ${tagToken.raw}`)

      this.group = match[1] || ''
      var candidates = match[2]

      this.candidates = []

      while ((match = candidatesRE.exec(candidates))) {
        this.candidates.push(match[0])
      }
      assert(this.candidates.length, `empty candidates: ${tagToken.raw}`)
    },

    render: function (scope, hash) {
      var group = Liquid.evalValue(this.group, scope)
      var fingerprint = `cycle:${group}:` + this.candidates.join(',')

      var groups = scope.opts.groups = scope.opts.groups || {}
      var idx = groups[fingerprint]

      if (idx === undefined) {
        idx = groups[fingerprint] = 0
      }

      var candidate = this.candidates[idx]
      idx = (idx + 1) % this.candidates.length
      groups[fingerprint] = idx

      return Promise.resolve(Liquid.evalValue(candidate, scope))
    }
  })
}

},{"..":8,"../src/util/assert.js":18,"any-promise":3}],30:[function(require,module,exports){
const Liquid = require('..');
const lexical = Liquid.lexical;
const assert = require('../src/util/assert.js');

module.exports = function(liquid) {

    liquid.registerTag('decrement', {
        parse: function(token) {
            var match = token.args.match(lexical.identifier);
            assert(match, `illegal identifier ${token.args}`);
            this.variable = match[0];
        },
        render: function(scope, hash) {
            var v = scope.get(this.variable);
            if (typeof v !== 'number') v = 0;
            scope.set(this.variable, v - 1);
        }
    });

};

},{"..":8,"../src/util/assert.js":18}],31:[function(require,module,exports){
const Liquid = require('..')
const lexical = Liquid.lexical
const mapSeries = require('../src/util/promise.js').mapSeries
const _ = require('../src/util/underscore.js')
const RenderBreakError = Liquid.Types.RenderBreakError
const assert = require('../src/util/assert.js')
const re = new RegExp(`^(${lexical.identifier.source})\\s+in\\s+` +
    `(${lexical.value.source})` +
    `(?:\\s+${lexical.hash.source})*` +
    `(?:\\s+(reversed))?` +
    `(?:\\s+${lexical.hash.source})*$`)

module.exports = function (liquid) {
  liquid.registerTag('for', {

    parse: function (tagToken, remainTokens) {
      var match = re.exec(tagToken.args)
      assert(match, `illegal tag: ${tagToken.raw}`)
      this.variable = match[1]
      this.collection = match[2]
      this.reversed = !!match[3]

      this.templates = []
      this.elseTemplates = []

      var p
      var stream = liquid.parser.parseStream(remainTokens)
        .on('start', () => (p = this.templates))
        .on('tag:else', () => (p = this.elseTemplates))
        .on('tag:endfor', () => stream.stop())
        .on('template', tpl => p.push(tpl))
        .on('end', () => {
          throw new Error(`tag ${tagToken.raw} not closed`)
        })

      stream.start()
    },

    render: function (scope, hash) {
      var collection = Liquid.evalExp(this.collection, scope)

      if (!Array.isArray(collection)) {
        if (_.isString(collection) && collection.length > 0) {
          collection = [collection]
        } else if (_.isObject(collection)) {
          collection = Object.keys(collection).map((key) => [key, collection[key]])
        }
      }
      if (!Array.isArray(collection) || !collection.length) {
        return liquid.renderer.renderTemplates(this.elseTemplates, scope)
      }

      var length = collection.length
      var offset = hash.offset || 0
      var limit = (hash.limit === undefined) ? collection.length : hash.limit

      collection = collection.slice(offset, offset + limit)
      if (this.reversed) collection.reverse()

      var contexts = collection.map((item, i) => {
        var ctx = {}
        ctx[this.variable] = item
        ctx.forloop = {
          first: i === 0,
          index: i + 1,
          index0: i,
          last: i === length - 1,
          length: length,
          rindex: length - i,
          rindex0: length - i - 1
        }
        return ctx
      })

      var html = ''
      return mapSeries(contexts, (context) => {
        return Promise.resolve()
          .then(() => scope.push(context))
          .then(() => liquid.renderer.renderTemplates(this.templates, scope))
          .then(partial => (html += partial))
          .catch(e => {
            if (e instanceof RenderBreakError) {
              html += e.resolvedHTML
              if (e.message === 'continue') return
            }
            throw e
          })
          .then(() => scope.pop())
      }).catch((e) => {
        if (e instanceof RenderBreakError && e.message === 'break') {
          return
        }
        throw e
      }).then(() => html)
    }
  })
}

},{"..":8,"../src/util/assert.js":18,"../src/util/promise.js":21,"../src/util/underscore.js":23}],32:[function(require,module,exports){
const Liquid = require('..')

module.exports = function (liquid) {
  liquid.registerTag('if', {

    parse: function (tagToken, remainTokens) {
      this.branches = []
      this.elseTemplates = []

      var p
      var stream = liquid.parser.parseStream(remainTokens)
        .on('start', () => this.branches.push({
          cond: tagToken.args,
          templates: (p = [])
        }))
        .on('tag:elsif', token => {
          this.branches.push({
            cond: token.args,
            templates: p = []
          })
        })
        .on('tag:else', () => (p = this.elseTemplates))
        .on('tag:endif', token => stream.stop())
        .on('template', tpl => p.push(tpl))
        .on('end', x => {
          throw new Error(`tag ${tagToken.raw} not closed`)
        })

      stream.start()
    },

    render: function (scope, hash) {
      for (var i = 0; i < this.branches.length; i++) {
        var branch = this.branches[i]
        var cond = Liquid.evalExp(branch.cond, scope)
        if (Liquid.isTruthy(cond)) {
          return liquid.renderer.renderTemplates(branch.templates, scope)
        }
      }
      return liquid.renderer.renderTemplates(this.elseTemplates, scope)
    }
  })
}

},{"..":8}],33:[function(require,module,exports){
const Liquid = require('..')
const lexical = Liquid.lexical
const withRE = new RegExp(`with\\s+(${lexical.value.source})`)
const assert = require('../src/util/assert.js')

module.exports = function (liquid) {
  liquid.registerTag('include', {
    parse: function (token) {
      var match = lexical.value.exec(token.args)
      assert(match, `illegal token ${token.raw}`)
      this.value = match[0]

      match = withRE.exec(token.args)
      if (match) {
        this.with = match[1]
      }
    },
    render: function (scope, hash) {
      var filepath = this.value
      if (scope.opts.dynamicPartials) {
        filepath = Liquid.evalValue(this.value, scope)
      }

      var originBlocks = scope.opts.blocks
      var originBlockMode = scope.opts.blockMode
      scope.opts.blocks = {}
      scope.opts.blockMode = 'output'

      if (this.with) {
        hash[filepath] = Liquid.evalValue(this.with, scope)
      }
      return liquid.getTemplate(filepath, scope.opts.root)
        .then((templates) => {
          scope.push(hash)
          return liquid.renderer.renderTemplates(templates, scope)
        })
        .then((html) => {
          scope.pop()
          scope.opts.blocks = originBlocks
          scope.opts.blockMode = originBlockMode
          return html
        })
    }
  })
}

},{"..":8,"../src/util/assert.js":18}],34:[function(require,module,exports){
const Liquid = require('..');
const assert = require('../src/util/assert.js');
const lexical = Liquid.lexical;

module.exports = function(liquid) {

    liquid.registerTag('increment', {
        parse: function(token) {
            var match = token.args.match(lexical.identifier);
            assert(match, `illegal identifier ${token.args}`);
            this.variable = match[0];
        },
        render: function(scope, hash) {
            var v = scope.get(this.variable);
            if (typeof v !== 'number') v = 0;
            scope.set(this.variable, v + 1);
        }
    });

};

},{"..":8,"../src/util/assert.js":18}],35:[function(require,module,exports){
module.exports = function (engine) {
  require('./assign.js')(engine)
  require('./capture.js')(engine)
  require('./case.js')(engine)
  require('./comment.js')(engine)
  require('./cycle.js')(engine)
  require('./decrement.js')(engine)
  require('./for.js')(engine)
  require('./if.js')(engine)
  require('./include.js')(engine)
  require('./increment.js')(engine)
  require('./layout.js')(engine)
  require('./raw.js')(engine)
  require('./tablerow.js')(engine)
  require('./unless.js')(engine)
}

},{"./assign.js":25,"./capture.js":26,"./case.js":27,"./comment.js":28,"./cycle.js":29,"./decrement.js":30,"./for.js":31,"./if.js":32,"./include.js":33,"./increment.js":34,"./layout.js":36,"./raw.js":37,"./tablerow.js":38,"./unless.js":39}],36:[function(require,module,exports){
const Liquid = require('..')
const Promise = require('any-promise')
const lexical = Liquid.lexical
const assert = require('../src/util/assert.js')

/*
 * blockMode:
 * * "store": store rendered html into blocks
 * * "output": output rendered html
 */

module.exports = function (liquid) {
  liquid.registerTag('layout', {
    parse: function (token, remainTokens) {
      var match = lexical.value.exec(token.args)
      assert(match, `illegal token ${token.raw}`)

      this.layout = match[0]
      this.tpls = liquid.parser.parse(remainTokens)
    },
    render: function (scope, hash) {
      var layout = scope.opts.dynamicPartials ? Liquid.evalValue(this.layout, scope) : this.layout

      // render the remaining tokens immediately
      scope.opts.blockMode = 'store'
      return liquid.renderer.renderTemplates(this.tpls, scope)
        .then(html => {
          if (scope.opts.blocks[''] === undefined) {
            scope.opts.blocks[''] = html
          }
          return liquid.getTemplate(layout, scope.opts.root)
        })
        .then(templates => {
          // push the hash
          scope.push(hash)
          scope.opts.blockMode = 'output'
          return liquid.renderer.renderTemplates(templates, scope)
        })
        // pop the hash
        .then(partial => {
          scope.pop()
          return partial
        })
    }
  })

  liquid.registerTag('block', {
    parse: function (token, remainTokens) {
      var match = /\w+/.exec(token.args)
      this.block = match ? match[0] : ''

      this.tpls = []
      var stream = liquid.parser.parseStream(remainTokens)
        .on('tag:endblock', () => stream.stop())
        .on('template', tpl => this.tpls.push(tpl))
        .on('end', () => {
          throw new Error(`tag ${token.raw} not closed`)
        })
      stream.start()
    },
    render: function (scope) {
      return Promise.resolve(scope.opts.blocks[this.block])
        .then(html => html === undefined
          // render default block
          ? liquid.renderer.renderTemplates(this.tpls, scope)
          // use child-defined block
          : html)
        .then(html => {
          if (scope.opts.blockMode === 'store') {
            scope.opts.blocks[this.block] = html
            return ''
          }
          return html
        })
    }
  })
}

},{"..":8,"../src/util/assert.js":18,"any-promise":3}],37:[function(require,module,exports){
const Promise = require('any-promise')

module.exports = function (liquid) {
  liquid.registerTag('raw', {
    parse: function (tagToken, remainTokens) {
      this.tokens = []

      var stream = liquid.parser.parseStream(remainTokens)
      stream
        .on('token', token => {
          if (token.name === 'endraw') stream.stop()
          else this.tokens.push(token)
        })
        .on('end', x => {
          throw new Error(`tag ${tagToken.raw} not closed`)
        })
      stream.start()
    },
    render: function (scope, hash) {
      var tokens = this.tokens.map(token => token.raw).join('')
      return Promise.resolve(tokens)
    }
  })
}

},{"any-promise":3}],38:[function(require,module,exports){
const Liquid = require('..')
const mapSeries = require('../src/util/promise.js').mapSeries
const lexical = Liquid.lexical
const assert = require('../src/util/assert.js')
const re = new RegExp(`^(${lexical.identifier.source})\\s+in\\s+` +
  `(${lexical.value.source})` +
  `(?:\\s+${lexical.hash.source})*$`)

module.exports = function (liquid) {
  liquid.registerTag('tablerow', {

    parse: function (tagToken, remainTokens) {
      var match = re.exec(tagToken.args)
      assert(match, `illegal tag: ${tagToken.raw}`)

      this.variable = match[1]
      this.collection = match[2]
      this.templates = []

      var p
      var stream = liquid.parser.parseStream(remainTokens)
        .on('start', () => (p = this.templates))
        .on('tag:endtablerow', token => stream.stop())
        .on('template', tpl => p.push(tpl))
        .on('end', () => {
          throw new Error(`tag ${tagToken.raw} not closed`)
        })

      stream.start()
    },

    render: function (scope, hash) {
      var collection = Liquid.evalExp(this.collection, scope) || []

      var html = '<table>'
      var offset = hash.offset || 0
      var limit = (hash.limit === undefined) ? collection.length : hash.limit

      var cols = hash.cols
      var row
      var col
      if (!cols) throw new Error(`illegal cols: ${cols}`)

      // build array of arguments to pass to sequential promises...
      collection = collection.slice(offset, offset + limit)
      var contexts = []
      collection.some((item, i) => {
        var ctx = {}
        ctx[this.variable] = item
        contexts.push(ctx)
      })

      return mapSeries(contexts,
        (context, idx) => {
          row = Math.floor(idx / cols) + 1
          col = (idx % cols) + 1
          if (col === 1) {
            if (row !== 1) {
              html += '</tr>'
            }
            html += `<tr class="row${row}">`
          }

          html += `<td class="col${col}">`
          scope.push(context)
          return liquid.renderer
            .renderTemplates(this.templates, scope)
            .then((partial) => {
              scope.pop(context)
              html += partial
              html += '</td>'
              return html
            })
        })
        .then(() => {
          if (row > 0) {
            html += '</tr>'
          }
          html += '</table>'
          return html
        })
    }
  })
}

},{"..":8,"../src/util/assert.js":18,"../src/util/promise.js":21}],39:[function(require,module,exports){
const Liquid = require('..');

module.exports = function(liquid) {
    liquid.registerTag('unless', {
        parse: function(tagToken, remainTokens) {
            this.templates = [];
            this.elseTemplates = [];
            var p, stream = liquid.parser.parseStream(remainTokens)
                .on('start', x => {
                    p = this.templates;
                    this.cond = tagToken.args;
                })
                .on('tag:else', token => p = this.elseTemplates)
                .on('tag:endunless', token => stream.stop())
                .on('template', tpl => p.push(tpl))
                .on('end', x => {
                    throw new Error(`tag ${tagToken.raw} not closed`);
                });

            stream.start();
        },

        render: function(scope, hash) {
            var cond = Liquid.evalExp(this.cond, scope);
            return Liquid.isFalsy(cond) ?
                liquid.renderer.renderTemplates(this.templates, scope) :
                liquid.renderer.renderTemplates(this.elseTemplates, scope);
        }
    });
};

},{"..":8}],40:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":41}],41:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL3JlbmRlci5qcyIsIl9zcmMvanMvdXRpbHMvX2xpYi5qcyIsIm5vZGVfbW9kdWxlcy9hbnktcHJvbWlzZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hbnktcHJvbWlzZS9sb2FkZXIuanMiLCJub2RlX21vZHVsZXMvYW55LXByb21pc2UvcmVnaXN0ZXItc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvZmlsdGVycy5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy9zcmMvZmlsdGVyLmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3NyYy9sZXhpY2FsLmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3NyYy9vcGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvc3JjL3BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy9zcmMvcmVuZGVyLmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3NyYy9zY29wZS5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy9zcmMvc3ludGF4LmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3NyYy90YWcuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvc3JjL3Rva2VuaXplci5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy9zcmMvdXRpbC9hc3NlcnQuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvc3JjL3V0aWwvZXJyb3IuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvc3JjL3V0aWwvZnMuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvc3JjL3V0aWwvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy9zcmMvdXRpbC9zdHJmdGltZS5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy9zcmMvdXRpbC91bmRlcnNjb3JlLmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3NyYy93aGl0ZXNwYWNlLWN0cmwuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvdGFncy9hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvdGFncy9jYXB0dXJlLmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3RhZ3MvY2FzZS5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy90YWdzL2NvbW1lbnQuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvdGFncy9jeWNsZS5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy90YWdzL2RlY3JlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy90YWdzL2Zvci5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy90YWdzL2lmLmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3RhZ3MvaW5jbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy90YWdzL2luY3JlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9saXF1aWRqcy90YWdzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3RhZ3MvbGF5b3V0LmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3RhZ3MvcmF3LmpzIiwibm9kZV9tb2R1bGVzL2xpcXVpZGpzL3RhZ3MvdGFibGVyb3cuanMiLCJub2RlX21vZHVsZXMvbGlxdWlkanMvdGFncy91bmxlc3MuanMiLCJub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbHMvX2xpYi5qcycpO1xudmFyIExpcXVpZCA9IHJlcXVpcmUoJ2xpcXVpZGpzJyk7XG5cbnZhciBSZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZW5naW5lID0gTGlxdWlkKCk7XG4gIHRoaXMudGVtcGxhdGVzU2VsZWN0b3IgPSAnW3R5cGU9XCJ0ZXh0L3RlbXBsYXRlXCJdJztcbiAgdGhpcy50ZW1wbGF0ZXMgPSB7fTtcbn07XG5cblJlbmRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fY29sbGVjdFRlbXBsYXRlcygpO1xufTtcblxuUmVuZGVyLnByb3RvdHlwZS5yZW5kZXJUZW1wbGF0ZSA9IGZ1bmN0aW9uIChrZXksIGRhdGEpIHtcbiAgdmFyIHRtcGwgPSB0aGlzLnRlbXBsYXRlc1trZXldO1xuICB0aGlzLmVuZ2luZVxuICAgIC5yZW5kZXIodG1wbC50ZW1wbGF0ZSwgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgdG1wbC50YXJnZXQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICB9KTtcbn07XG5cbi8vIFByaXZhdGVcblJlbmRlci5wcm90b3R5cGUuX2NvbGxlY3RUZW1wbGF0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgdGVtcGxhdGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnRlbXBsYXRlc1NlbGVjdG9yKTtcbiAgXy5lYWNoKHRlbXBsYXRlcywgZnVuY3Rpb24gKHRtcGwpIHtcbiAgICBfdGhpcy5fY29sbGVjdFRlbXBsYXRlKHRtcGwpO1xuICB9KTtcbn07XG5cblJlbmRlci5wcm90b3R5cGUuX2NvbGxlY3RUZW1wbGF0ZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSkge1xuICB2YXIgbmFtZSA9IHRlbXBsYXRlLmlkO1xuICB0aGlzLnRlbXBsYXRlc1tuYW1lXSA9IHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIHRlbXBsYXRlOiB0aGlzLmVuZ2luZS5wYXJzZSh0ZW1wbGF0ZS5pbm5lckhUTUwpLFxuICAgIHRhcmdldDogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZS5kYXRhc2V0LnRhcmdldClcbiAgfVxufTtcblxudmFyIHJlbmRlciA9IG5ldyBSZW5kZXIoKTtcbl8ucmVhZHkoZnVuY3Rpb24gKCkge1xuICByZW5kZXIuaW5pdCgpO1xufSk7XG5cbndpbmRvdy5nbyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ2dvJyk7XG4gIHJlbmRlci5yZW5kZXJUZW1wbGF0ZSgndGVzdCcsIHsgbmFtZTogJ0xpcXVpZCcgfSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qXG4gICAgQXJyYXkgRnVuY3Rpb25zXG4gICovXG4gIC8vIEZvciBlYWNoIGl0ZW0gaW4gQXJyYXlcbiAgZWFjaDogZnVuY3Rpb24gKGFyciwgY2FsbGJhY2ssIGN0eCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjdHggPSBjdHggfHwgYXJyW2ldO1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBbYXJyW2ldLCBpXSk7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gRm9yIGVhY2ggaXRlbSBpbiBPYmplY3RcbiAgZWFjaEluOiBmdW5jdGlvbiAob2JqLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgY3R4ID0gY3R4IHx8IG9ialtrXTtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBbaywgb2JqW2tdXSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcbiAgLy8gUmV0dXJuIHRydWUgaWYgaXRlbSBpcyBpbiBBcnJheVxuICBpbkFycmF5OiBmdW5jdGlvbiAobmVlZGxlLCBoYXlzdGFjaykge1xuICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgIHRoaXMuZWFjaChoYXlzdGFjaywgZnVuY3Rpb24gKGhheSkge1xuICAgICAgaWYgKG5lZWRsZSA9PT0gaGF5KSBmb3VuZCA9IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZvdW5kO1xuICB9LFxuICBcbiAgLy8gcmV0dXJuIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGFycmF5XG4gIGxhc3Q6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXTtcbiAgfSxcbiAgXG4gIFxuICAvKlxuICAgIFN0cmluZyBGdW5jdGlvbnNcbiAgKi9cbiAgLy8gQ2FwdGlhbHNlIHRoZSBmaXJzdCBjaGFyIGluIFN0cmluZ1xuICBjYXBpdGFsaXNlOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0clswXS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xuICB9LFxuICBcbiAgLy8gVHVybiAnbXkgc3RyaW5nJyBvciAnbXktc3RyaW5nJyBpbnRvICdteVN0cmluZydcbiAgY2FtZWxDYXNlOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW1xcLVxcc11cXHcpL2csIGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gc1sxXS50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xuICB9LFxuICBcbiAgXG4gIC8qXG4gICAgTnVtYmVyIEZ1bmN0aW9uc1xuICAqL1xuICBpc051bWJlcjogZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xuICB9LFxuICBcbiAgLypcbiAgICBET00gRnVuY3Rpb25zXG4gICovXG4gIGluc2VydEFmdGVyOiBmdW5jdGlvbiAoZWwsIHJlZk5vZGUpIHtcbiAgICByZWZOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLCByZWZOb2RlLm5leHRTaWJsaW5nKTtcbiAgfSxcbiAgXG4gIC8qXG4gICAgRXZlbnQgRnVuY3Rpb25zXG4gICovXG4gIC8vIFJ1biBjb2RlIHdoZW4gdGhlIHBhZ2UgaXMgcmVhZHlcbiAgcmVhZHk6IGZ1bmN0aW9uIChjYWxsYmFjaywgY3R4KSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgIFxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIikge1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gTWFrZSB0aGluZyBub3QgaGFwcGVuIHVudGlsIGZpbmlzaGVkP1xuICAvLyBpLmUuIGRvbid0IGFjdCBvbiBldmVyeSB3aW5kb3cgcmVzaXplIGV2ZW50LCBqdXN0IHRoZSBsYXN0IG9uZSB3aGVuIHdlIG5lZWQgaXQuXG4gIGRlYm91bmNlOiBmdW5jdGlvbiAoY2FsbGJhY2ssIHdhaXQsIGN0eCkge1xuICAgIHZhciB0aW1lb3V0LCB0aW1lc3RhbXAsIGFyZ3M7XG4gICAgd2FpdCA9IHdhaXQgfHwgMTAwO1xuICAgIFxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRpbWVzdGFtcDtcbiAgICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID49IDApIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3MpO1xuICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGN0eCA9IGN0eCB8fCB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgaWYgKCF0aW1lb3V0KSB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgfTtcbiAgfSxcbiAgXG4gIC8vIERvbid0IHN3YW1wIHVzIHdpdGggZXZlbnRzXG4gIC8vIGdvb2QgZm9yIHRoaW5ncyBsaWtlIHNjcm9sbCBhbmQgcmVzaXplXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoY2FsbGJhY2ssIGxpbWl0LCBjdHgpIHtcbiAgICBsaW1pdCA9IGxpbWl0IHx8IDIwMDtcbiAgICB2YXIgd2FpdCA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXdhaXQpIHtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB3YWl0ID0gdHJ1ZTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgd2FpdCA9IGZhbHNlO1xuICAgICAgICB9LCBsaW1pdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9yZWdpc3RlcicpKCkuUHJvbWlzZVxuIiwiXCJ1c2Ugc3RyaWN0XCJcbiAgICAvLyBnbG9iYWwga2V5IGZvciB1c2VyIHByZWZlcnJlZCByZWdpc3RyYXRpb25cbnZhciBSRUdJU1RSQVRJT05fS0VZID0gJ0BAYW55LXByb21pc2UvUkVHSVNUUkFUSU9OJyxcbiAgICAvLyBQcmlvciByZWdpc3RyYXRpb24gKHByZWZlcnJlZCBvciBkZXRlY3RlZClcbiAgICByZWdpc3RlcmVkID0gbnVsbFxuXG4vKipcbiAqIFJlZ2lzdGVycyB0aGUgZ2l2ZW4gaW1wbGVtZW50YXRpb24uICBBbiBpbXBsZW1lbnRhdGlvbiBtdXN0XG4gKiBiZSByZWdpc3RlcmVkIHByaW9yIHRvIGFueSBjYWxsIHRvIGByZXF1aXJlKFwiYW55LXByb21pc2VcIilgLFxuICogdHlwaWNhbGx5IG9uIGFwcGxpY2F0aW9uIGxvYWQuXG4gKlxuICogSWYgY2FsbGVkIHdpdGggbm8gYXJndW1lbnRzLCB3aWxsIHJldHVybiByZWdpc3RyYXRpb24gaW5cbiAqIGZvbGxvd2luZyBwcmlvcml0eTpcbiAqXG4gKiBGb3IgTm9kZS5qczpcbiAqXG4gKiAxLiBQcmV2aW91cyByZWdpc3RyYXRpb25cbiAqIDIuIGdsb2JhbC5Qcm9taXNlIGlmIG5vZGUuanMgdmVyc2lvbiA+PSAwLjEyXG4gKiAzLiBBdXRvIGRldGVjdGVkIHByb21pc2UgYmFzZWQgb24gZmlyc3Qgc3VjZXNzZnVsIHJlcXVpcmUgb2ZcbiAqICAgIGtub3duIHByb21pc2UgbGlicmFyaWVzLiBOb3RlIHRoaXMgaXMgYSBsYXN0IHJlc29ydCwgYXMgdGhlXG4gKiAgICBsb2FkZWQgbGlicmFyeSBpcyBub24tZGV0ZXJtaW5pc3RpYy4gbm9kZS5qcyA+PSAwLjEyIHdpbGxcbiAqICAgIGFsd2F5cyB1c2UgZ2xvYmFsLlByb21pc2Ugb3ZlciB0aGlzIHByaW9yaXR5IGxpc3QuXG4gKiA0LiBUaHJvd3MgZXJyb3IuXG4gKlxuICogRm9yIEJyb3dzZXI6XG4gKlxuICogMS4gUHJldmlvdXMgcmVnaXN0cmF0aW9uXG4gKiAyLiB3aW5kb3cuUHJvbWlzZVxuICogMy4gVGhyb3dzIGVycm9yLlxuICpcbiAqIE9wdGlvbnM6XG4gKlxuICogUHJvbWlzZTogRGVzaXJlZCBQcm9taXNlIGNvbnN0cnVjdG9yXG4gKiBnbG9iYWw6IEJvb2xlYW4gLSBTaG91bGQgdGhlIHJlZ2lzdHJhdGlvbiBiZSBjYWNoZWQgaW4gYSBnbG9iYWwgdmFyaWFibGUgdG9cbiAqIGFsbG93IGNyb3NzIGRlcGVuZGVuY3kvYnVuZGxlIHJlZ2lzdHJhdGlvbj8gIChkZWZhdWx0IHRydWUpXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocm9vdCwgbG9hZEltcGxlbWVudGF0aW9uKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlZ2lzdGVyKGltcGxlbWVudGF0aW9uLCBvcHRzKXtcbiAgICBpbXBsZW1lbnRhdGlvbiA9IGltcGxlbWVudGF0aW9uIHx8IG51bGxcbiAgICBvcHRzID0gb3B0cyB8fCB7fVxuICAgIC8vIGdsb2JhbCByZWdpc3RyYXRpb24gdW5sZXNzIGV4cGxpY2l0bHkgIHtnbG9iYWw6IGZhbHNlfSBpbiBvcHRpb25zIChkZWZhdWx0IHRydWUpXG4gICAgdmFyIHJlZ2lzdGVyR2xvYmFsID0gb3B0cy5nbG9iYWwgIT09IGZhbHNlO1xuXG4gICAgLy8gbG9hZCBhbnkgcHJldmlvdXMgZ2xvYmFsIHJlZ2lzdHJhdGlvblxuICAgIGlmKHJlZ2lzdGVyZWQgPT09IG51bGwgJiYgcmVnaXN0ZXJHbG9iYWwpe1xuICAgICAgcmVnaXN0ZXJlZCA9IHJvb3RbUkVHSVNUUkFUSU9OX0tFWV0gfHwgbnVsbFxuICAgIH1cblxuICAgIGlmKHJlZ2lzdGVyZWQgIT09IG51bGxcbiAgICAgICAgJiYgaW1wbGVtZW50YXRpb24gIT09IG51bGxcbiAgICAgICAgJiYgcmVnaXN0ZXJlZC5pbXBsZW1lbnRhdGlvbiAhPT0gaW1wbGVtZW50YXRpb24pe1xuICAgICAgLy8gVGhyb3cgZXJyb3IgaWYgYXR0ZW1wdGluZyB0byByZWRlZmluZSBpbXBsZW1lbnRhdGlvblxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhbnktcHJvbWlzZSBhbHJlYWR5IGRlZmluZWQgYXMgXCInK3JlZ2lzdGVyZWQuaW1wbGVtZW50YXRpb24rXG4gICAgICAgICdcIi4gIFlvdSBjYW4gb25seSByZWdpc3RlciBhbiBpbXBsZW1lbnRhdGlvbiBiZWZvcmUgdGhlIGZpcnN0ICcrXG4gICAgICAgICcgY2FsbCB0byByZXF1aXJlKFwiYW55LXByb21pc2VcIikgYW5kIGFuIGltcGxlbWVudGF0aW9uIGNhbm5vdCBiZSBjaGFuZ2VkJylcbiAgICB9XG5cbiAgICBpZihyZWdpc3RlcmVkID09PSBudWxsKXtcbiAgICAgIC8vIHVzZSBwcm92aWRlZCBpbXBsZW1lbnRhdGlvblxuICAgICAgaWYoaW1wbGVtZW50YXRpb24gIT09IG51bGwgJiYgdHlwZW9mIG9wdHMuUHJvbWlzZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZWdpc3RlcmVkID0ge1xuICAgICAgICAgIFByb21pc2U6IG9wdHMuUHJvbWlzZSxcbiAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogaW1wbGVtZW50YXRpb25cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVxdWlyZSBpbXBsZW1lbnRhdGlvbiBpZiBpbXBsZW1lbnRhdGlvbiBpcyBzcGVjaWZpZWQgYnV0IG5vdCBwcm92aWRlZFxuICAgICAgICByZWdpc3RlcmVkID0gbG9hZEltcGxlbWVudGF0aW9uKGltcGxlbWVudGF0aW9uKVxuICAgICAgfVxuXG4gICAgICBpZihyZWdpc3Rlckdsb2JhbCl7XG4gICAgICAgIC8vIHJlZ2lzdGVyIHByZWZlcmVuY2UgZ2xvYmFsbHkgaW4gY2FzZSBtdWx0aXBsZSBpbnN0YWxsYXRpb25zXG4gICAgICAgIHJvb3RbUkVHSVNUUkFUSU9OX0tFWV0gPSByZWdpc3RlcmVkXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZ2lzdGVyZWRcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbG9hZGVyJykod2luZG93LCBsb2FkSW1wbGVtZW50YXRpb24pXG5cbi8qKlxuICogQnJvd3NlciBzcGVjaWZpYyBsb2FkSW1wbGVtZW50YXRpb24uICBBbHdheXMgdXNlcyBgd2luZG93LlByb21pc2VgXG4gKlxuICogVG8gcmVnaXN0ZXIgYSBjdXN0b20gaW1wbGVtZW50YXRpb24sIG11c3QgcmVnaXN0ZXIgd2l0aCBgUHJvbWlzZWAgb3B0aW9uLlxuICovXG5mdW5jdGlvbiBsb2FkSW1wbGVtZW50YXRpb24oKXtcbiAgaWYodHlwZW9mIHdpbmRvdy5Qcm9taXNlID09PSAndW5kZWZpbmVkJyl7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiYW55LXByb21pc2UgYnJvd3NlciByZXF1aXJlcyBhIHBvbHlmaWxsIG9yIGV4cGxpY2l0IHJlZ2lzdHJhdGlvblwiK1xuICAgICAgXCIgZS5nOiByZXF1aXJlKCdhbnktcHJvbWlzZS9yZWdpc3Rlci9ibHVlYmlyZCcpXCIpXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBQcm9taXNlOiB3aW5kb3cuUHJvbWlzZSxcbiAgICBpbXBsZW1lbnRhdGlvbjogJ3dpbmRvdy5Qcm9taXNlJ1xuICB9XG59XG4iLCIiLCJjb25zdCBzdHJmdGltZSA9IHJlcXVpcmUoJy4vc3JjL3V0aWwvc3RyZnRpbWUuanMnKVxuY29uc3QgXyA9IHJlcXVpcmUoJy4vc3JjL3V0aWwvdW5kZXJzY29yZS5qcycpXG5jb25zdCBpc1RydXRoeSA9IHJlcXVpcmUoJy4vc3JjL3N5bnRheC5qcycpLmlzVHJ1dGh5XG5cbnZhciBlc2NhcGVNYXAgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJiMzNDsnLFxuICBcIidcIjogJyYjMzk7J1xufVxudmFyIHVuZXNjYXBlTWFwID0ge1xuICAnJmFtcDsnOiAnJicsXG4gICcmbHQ7JzogJzwnLFxuICAnJmd0Oyc6ICc+JyxcbiAgJyYjMzQ7JzogJ1wiJyxcbiAgJyYjMzk7JzogXCInXCJcbn1cblxudmFyIGZpbHRlcnMgPSB7XG4gICdhYnMnOiB2ID0+IE1hdGguYWJzKHYpLFxuICAnYXBwZW5kJzogKHYsIGFyZykgPT4gdiArIGFyZyxcbiAgJ2NhcGl0YWxpemUnOiBzdHIgPT4gc3RyaW5naWZ5KHN0cikuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSksXG4gICdjZWlsJzogdiA9PiBNYXRoLmNlaWwodiksXG4gICdjb25jYXQnOiAodiwgYXJnKSA9PiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmNhbGwodiwgYXJnKSxcbiAgJ2RhdGUnOiAodiwgYXJnKSA9PiB7XG4gICAgdmFyIGRhdGUgPSB2XG4gICAgaWYgKHYgPT09ICdub3cnKSB7XG4gICAgICBkYXRlID0gbmV3IERhdGUoKVxuICAgIH0gZWxzZSBpZiAoXy5pc1N0cmluZyh2KSkge1xuICAgICAgZGF0ZSA9IG5ldyBEYXRlKHYpXG4gICAgfVxuICAgIHJldHVybiBpc1ZhbGlkRGF0ZShkYXRlKSA/IHN0cmZ0aW1lKGRhdGUsIGFyZykgOiB2XG4gIH0sXG4gICdkZWZhdWx0JzogKHYsIGFyZykgPT4gaXNUcnV0aHkodikgPyB2IDogYXJnLFxuICAnZGl2aWRlZF9ieSc6ICh2LCBhcmcpID0+IE1hdGguZmxvb3IodiAvIGFyZyksXG4gICdkb3duY2FzZSc6IHYgPT4gdi50b0xvd2VyQ2FzZSgpLFxuICAnZXNjYXBlJzogZXNjYXBlLFxuXG4gICdlc2NhcGVfb25jZSc6IHN0ciA9PiBlc2NhcGUodW5lc2NhcGUoc3RyKSksXG4gICdmaXJzdCc6IHYgPT4gdlswXSxcbiAgJ2Zsb29yJzogdiA9PiBNYXRoLmZsb29yKHYpLFxuICAnam9pbic6ICh2LCBhcmcpID0+IHYuam9pbihhcmcpLFxuICAnbGFzdCc6IHYgPT4gdlt2Lmxlbmd0aCAtIDFdLFxuICAnbHN0cmlwJzogdiA9PiBzdHJpbmdpZnkodikucmVwbGFjZSgvXlxccysvLCAnJyksXG4gICdtYXAnOiAoYXJyLCBhcmcpID0+IGFyci5tYXAodiA9PiB2W2FyZ10pLFxuICAnbWludXMnOiBiaW5kRml4ZWQoKHYsIGFyZykgPT4gdiAtIGFyZyksXG4gICdtb2R1bG8nOiBiaW5kRml4ZWQoKHYsIGFyZykgPT4gdiAlIGFyZyksXG4gICduZXdsaW5lX3RvX2JyJzogdiA9PiB2LnJlcGxhY2UoL1xcbi9nLCAnPGJyIC8+JyksXG4gICdwbHVzJzogYmluZEZpeGVkKCh2LCBhcmcpID0+IE51bWJlcih2KSArIE51bWJlcihhcmcpKSxcbiAgJ3ByZXBlbmQnOiAodiwgYXJnKSA9PiBhcmcgKyB2LFxuICAncmVtb3ZlJzogKHYsIGFyZykgPT4gdi5zcGxpdChhcmcpLmpvaW4oJycpLFxuICAncmVtb3ZlX2ZpcnN0JzogKHYsIGwpID0+IHYucmVwbGFjZShsLCAnJyksXG4gICdyZXBsYWNlJzogKHYsIHBhdHRlcm4sIHJlcGxhY2VtZW50KSA9PlxuICAgIHN0cmluZ2lmeSh2KS5zcGxpdChwYXR0ZXJuKS5qb2luKHJlcGxhY2VtZW50KSxcbiAgJ3JlcGxhY2VfZmlyc3QnOiAodiwgYXJnMSwgYXJnMikgPT4gc3RyaW5naWZ5KHYpLnJlcGxhY2UoYXJnMSwgYXJnMiksXG4gICdyZXZlcnNlJzogdiA9PiB2LnJldmVyc2UoKSxcbiAgJ3JvdW5kJzogKHYsIGFyZykgPT4ge1xuICAgIHZhciBhbXAgPSBNYXRoLnBvdygxMCwgYXJnIHx8IDApXG4gICAgcmV0dXJuIE1hdGgucm91bmQodiAqIGFtcCwgYXJnKSAvIGFtcFxuICB9LFxuICAncnN0cmlwJzogc3RyID0+IHN0cmluZ2lmeShzdHIpLnJlcGxhY2UoL1xccyskLywgJycpLFxuICAnc2l6ZSc6IHYgPT4gdi5sZW5ndGgsXG4gICdzbGljZSc6ICh2LCBiZWdpbiwgbGVuZ3RoKSA9PlxuICAgIHYuc3Vic3RyKGJlZ2luLCBsZW5ndGggPT09IHVuZGVmaW5lZCA/IDEgOiBsZW5ndGgpLFxuICAnc29ydCc6ICh2LCBhcmcpID0+IHYuc29ydChhcmcpLFxuICAnc3BsaXQnOiAodiwgYXJnKSA9PiBzdHJpbmdpZnkodikuc3BsaXQoYXJnKSxcbiAgJ3N0cmlwJzogKHYpID0+IHN0cmluZ2lmeSh2KS50cmltKCksXG4gICdzdHJpcF9odG1sJzogdiA9PiBzdHJpbmdpZnkodikucmVwbGFjZSgvPFxcLz9cXHMqXFx3K1xccypcXC8/Pi9nLCAnJyksXG4gICdzdHJpcF9uZXdsaW5lcyc6IHYgPT4gc3RyaW5naWZ5KHYpLnJlcGxhY2UoL1xcbi9nLCAnJyksXG4gICd0aW1lcyc6ICh2LCBhcmcpID0+IHYgKiBhcmcsXG4gICd0cnVuY2F0ZSc6ICh2LCBsLCBvKSA9PiB7XG4gICAgdiA9IHN0cmluZ2lmeSh2KVxuICAgIG8gPSAobyA9PT0gdW5kZWZpbmVkKSA/ICcuLi4nIDogb1xuICAgIGwgPSBsIHx8IDE2XG4gICAgaWYgKHYubGVuZ3RoIDw9IGwpIHJldHVybiB2XG4gICAgcmV0dXJuIHYuc3Vic3RyKDAsIGwgLSBvLmxlbmd0aCkgKyBvXG4gIH0sXG4gICd0cnVuY2F0ZXdvcmRzJzogKHYsIGwsIG8pID0+IHtcbiAgICBpZiAobyA9PT0gdW5kZWZpbmVkKSBvID0gJy4uLidcbiAgICB2YXIgYXJyID0gdi5zcGxpdCgnICcpXG4gICAgdmFyIHJldCA9IGFyci5zbGljZSgwLCBsKS5qb2luKCcgJylcbiAgICBpZiAoYXJyLmxlbmd0aCA+IGwpIHJldCArPSBvXG4gICAgcmV0dXJuIHJldFxuICB9LFxuICAndW5pcSc6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICB2YXIgdSA9IHt9XG4gICAgcmV0dXJuIChhcnIgfHwgW10pLmZpbHRlcih2YWwgPT4ge1xuICAgICAgaWYgKHUuaGFzT3duUHJvcGVydHkodmFsKSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHVbdmFsXSA9IHRydWVcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgfSxcbiAgJ3VwY2FzZSc6IHN0ciA9PiBzdHJpbmdpZnkoc3RyKS50b1VwcGVyQ2FzZSgpLFxuICAndXJsX2VuY29kZSc6IGVuY29kZVVSSUNvbXBvbmVudFxufVxuXG5mdW5jdGlvbiBlc2NhcGUgKHN0cikge1xuICByZXR1cm4gc3RyaW5naWZ5KHN0cikucmVwbGFjZSgvJnw8fD58XCJ8Jy9nLCBtID0+IGVzY2FwZU1hcFttXSlcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUgKHN0cikge1xuICByZXR1cm4gc3RyaW5naWZ5KHN0cikucmVwbGFjZSgvJihhbXB8bHR8Z3R8IzM0fCMzOSk7L2csIG0gPT4gdW5lc2NhcGVNYXBbbV0pXG59XG5cbmZ1bmN0aW9uIGdldEZpeGVkICh2KSB7XG4gIHZhciBwID0gKHYgKyAnJykuc3BsaXQoJy4nKVxuICByZXR1cm4gKHAubGVuZ3RoID4gMSkgPyBwWzFdLmxlbmd0aCA6IDBcbn1cblxuZnVuY3Rpb24gZ2V0TWF4Rml4ZWQgKGwsIHIpIHtcbiAgcmV0dXJuIE1hdGgubWF4KGdldEZpeGVkKGwpLCBnZXRGaXhlZChyKSlcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5IChvYmopIHtcbiAgcmV0dXJuIG9iaiArICcnXG59XG5cbmZ1bmN0aW9uIGJpbmRGaXhlZCAoY2IpIHtcbiAgcmV0dXJuIChsLCByKSA9PiB7XG4gICAgdmFyIGYgPSBnZXRNYXhGaXhlZChsLCByKVxuICAgIHJldHVybiBjYihsLCByKS50b0ZpeGVkKGYpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJBbGwgKGxpcXVpZCkge1xuICByZXR1cm4gXy5mb3JPd24oZmlsdGVycywgKGZ1bmMsIG5hbWUpID0+IGxpcXVpZC5yZWdpc3RlckZpbHRlcihuYW1lLCBmdW5jKSlcbn1cblxuZnVuY3Rpb24gaXNWYWxpZERhdGUgKGRhdGUpIHtcbiAgcmV0dXJuIGRhdGUgaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTihkYXRlLmdldFRpbWUoKSlcbn1cblxucmVnaXN0ZXJBbGwuZmlsdGVycyA9IGZpbHRlcnNcbm1vZHVsZS5leHBvcnRzID0gcmVnaXN0ZXJBbGxcbiIsImNvbnN0IFNjb3BlID0gcmVxdWlyZSgnLi9zcmMvc2NvcGUnKVxuY29uc3QgXyA9IHJlcXVpcmUoJy4vc3JjL3V0aWwvdW5kZXJzY29yZS5qcycpXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCcuL3NyYy91dGlsL2Fzc2VydC5qcycpXG5jb25zdCB0b2tlbml6ZXIgPSByZXF1aXJlKCcuL3NyYy90b2tlbml6ZXIuanMnKVxuY29uc3Qgc3RhdEZpbGVBc3luYyA9IHJlcXVpcmUoJy4vc3JjL3V0aWwvZnMuanMnKS5zdGF0RmlsZUFzeW5jXG5jb25zdCByZWFkRmlsZUFzeW5jID0gcmVxdWlyZSgnLi9zcmMvdXRpbC9mcy5qcycpLnJlYWRGaWxlQXN5bmNcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IFJlbmRlciA9IHJlcXVpcmUoJy4vc3JjL3JlbmRlci5qcycpXG5jb25zdCBsZXhpY2FsID0gcmVxdWlyZSgnLi9zcmMvbGV4aWNhbC5qcycpXG5jb25zdCBUYWcgPSByZXF1aXJlKCcuL3NyYy90YWcuanMnKVxuY29uc3QgRmlsdGVyID0gcmVxdWlyZSgnLi9zcmMvZmlsdGVyLmpzJylcbmNvbnN0IFBhcnNlciA9IHJlcXVpcmUoJy4vc3JjL3BhcnNlcicpXG5jb25zdCBTeW50YXggPSByZXF1aXJlKCcuL3NyYy9zeW50YXguanMnKVxuY29uc3QgdGFncyA9IHJlcXVpcmUoJy4vdGFncycpXG5jb25zdCBmaWx0ZXJzID0gcmVxdWlyZSgnLi9maWx0ZXJzJylcbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdhbnktcHJvbWlzZScpXG5jb25zdCBhbnlTZXJpZXMgPSByZXF1aXJlKCcuL3NyYy91dGlsL3Byb21pc2UuanMnKS5hbnlTZXJpZXNcbmNvbnN0IEVycm9ycyA9IHJlcXVpcmUoJy4vc3JjL3V0aWwvZXJyb3IuanMnKVxuXG52YXIgX2VuZ2luZSA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKHRhZywgZmlsdGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuY2FjaGUpIHtcbiAgICAgIHRoaXMuY2FjaGUgPSB7fVxuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy50YWcgPSB0YWdcbiAgICB0aGlzLmZpbHRlciA9IGZpbHRlclxuICAgIHRoaXMucGFyc2VyID0gUGFyc2VyKHRhZywgZmlsdGVyKVxuICAgIHRoaXMucmVuZGVyZXIgPSBSZW5kZXIoKVxuXG4gICAgdGFncyh0aGlzKVxuICAgIGZpbHRlcnModGhpcylcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIHBhcnNlOiBmdW5jdGlvbiAoaHRtbCwgZmlsZXBhdGgpIHtcbiAgICB2YXIgdG9rZW5zID0gdG9rZW5pemVyLnBhcnNlKGh0bWwsIGZpbGVwYXRoLCB0aGlzLm9wdGlvbnMpXG4gICAgcmV0dXJuIHRoaXMucGFyc2VyLnBhcnNlKHRva2VucylcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAodHBsLCBjdHgsIG9wdHMpIHtcbiAgICBvcHRzID0gXy5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0cylcbiAgICB2YXIgc2NvcGUgPSBTY29wZS5mYWN0b3J5KGN0eCwgb3B0cylcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5yZW5kZXJUZW1wbGF0ZXModHBsLCBzY29wZSlcbiAgfSxcbiAgcGFyc2VBbmRSZW5kZXI6IGZ1bmN0aW9uIChodG1sLCBjdHgsIG9wdHMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMucGFyc2UoaHRtbCkpXG4gICAgICAudGhlbih0cGwgPT4gdGhpcy5yZW5kZXIodHBsLCBjdHgsIG9wdHMpKVxuICB9LFxuICByZW5kZXJGaWxlOiBmdW5jdGlvbiAoZmlsZXBhdGgsIGN0eCwgb3B0cykge1xuICAgIG9wdHMgPSBfLmFzc2lnbih7fSwgb3B0cylcbiAgICByZXR1cm4gdGhpcy5nZXRUZW1wbGF0ZShmaWxlcGF0aCwgb3B0cy5yb290KVxuICAgICAgLnRoZW4odGVtcGxhdGVzID0+IHRoaXMucmVuZGVyKHRlbXBsYXRlcywgY3R4LCBvcHRzKSlcbiAgfSxcbiAgZXZhbFZhbHVlOiBmdW5jdGlvbiAoc3RyLCBzY29wZSkge1xuICAgIHZhciB0cGwgPSB0aGlzLnBhcnNlci5wYXJzZVZhbHVlKHN0ci50cmltKCkpXG4gICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuZXZhbFZhbHVlKHRwbCwgc2NvcGUpXG4gIH0sXG4gIHJlZ2lzdGVyRmlsdGVyOiBmdW5jdGlvbiAobmFtZSwgZmlsdGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyLnJlZ2lzdGVyKG5hbWUsIGZpbHRlcilcbiAgfSxcbiAgcmVnaXN0ZXJUYWc6IGZ1bmN0aW9uIChuYW1lLCB0YWcpIHtcbiAgICByZXR1cm4gdGhpcy50YWcucmVnaXN0ZXIobmFtZSwgdGFnKVxuICB9LFxuICBsb29rdXA6IGZ1bmN0aW9uIChmaWxlcGF0aCwgcm9vdCkge1xuICAgIHJvb3QgPSB0aGlzLm9wdGlvbnMucm9vdC5jb25jYXQocm9vdCB8fCBbXSlcbiAgICByb290ID0gXy51bmlxKHJvb3QpXG4gICAgdmFyIHBhdGhzID0gcm9vdC5tYXAocm9vdCA9PiBwYXRoLnJlc29sdmUocm9vdCwgZmlsZXBhdGgpKVxuICAgIHJldHVybiBhbnlTZXJpZXMocGF0aHMsIHBhdGggPT4gc3RhdEZpbGVBc3luYyhwYXRoKS50aGVuKCgpID0+IHBhdGgpKVxuICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIGUubWVzc2FnZSA9IGAke2UuY29kZX06IEZhaWxlZCB0byBsb29rdXAgJHtmaWxlcGF0aH0gaW46ICR7cm9vdH1gXG4gICAgICAgIHRocm93IGVcbiAgICAgIH0pXG4gIH0sXG4gIGdldFRlbXBsYXRlOiBmdW5jdGlvbiAoZmlsZXBhdGgsIHJvb3QpIHtcbiAgICBpZiAoIXBhdGguZXh0bmFtZShmaWxlcGF0aCkpIHtcbiAgICAgIGZpbGVwYXRoICs9IHRoaXMub3B0aW9ucy5leHRuYW1lXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gICAgICAubG9va3VwKGZpbGVwYXRoLCByb290KVxuICAgICAgLnRoZW4oZmlsZXBhdGggPT4ge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNhY2hlKSB7XG4gICAgICAgICAgdmFyIHRwbCA9IHRoaXMuY2FjaGVbZmlsZXBhdGhdXG4gICAgICAgICAgaWYgKHRwbCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cGwpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZWFkRmlsZUFzeW5jKGZpbGVwYXRoKVxuICAgICAgICAgICAgLnRoZW4oc3RyID0+IHRoaXMucGFyc2Uoc3RyKSlcbiAgICAgICAgICAgIC50aGVuKHRwbCA9PiAodGhpcy5jYWNoZVtmaWxlcGF0aF0gPSB0cGwpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZWFkRmlsZUFzeW5jKGZpbGVwYXRoKS50aGVuKHN0ciA9PiB0aGlzLnBhcnNlKHN0ciwgZmlsZXBhdGgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICB9LFxuICBleHByZXNzOiBmdW5jdGlvbiAob3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChmaWxlUGF0aCwgY3R4LCBjYWxsYmFjaykge1xuICAgICAgYXNzZXJ0KEFycmF5LmlzQXJyYXkodGhpcy5yb290KSB8fCBfLmlzU3RyaW5nKHRoaXMucm9vdCksXG4gICAgICAgICdpbGxlZ2FsIHZpZXdzIHJvb3QsIGFyZSB5b3UgdXNpbmcgZXhwcmVzcy5qcz8nKVxuICAgICAgb3B0cy5yb290ID0gdGhpcy5yb290XG4gICAgICBzZWxmLnJlbmRlckZpbGUoZmlsZVBhdGgsIGN0eCwgb3B0cylcbiAgICAgICAgLnRoZW4oaHRtbCA9PiBjYWxsYmFjayhudWxsLCBodG1sKSlcbiAgICAgICAgLmNhdGNoKGUgPT4gY2FsbGJhY2soZSkpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZhY3RvcnkgKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IF8uYXNzaWduKHtcbiAgICByb290OiBbJy4nXSxcbiAgICBjYWNoZTogZmFsc2UsXG4gICAgZXh0bmFtZTogJycsXG4gICAgZHluYW1pY1BhcnRpYWxzOiB0cnVlLFxuICAgIHRyaW1fdGFnX3JpZ2h0OiBmYWxzZSxcbiAgICB0cmltX3RhZ19sZWZ0OiBmYWxzZSxcbiAgICB0cmltX3ZhbHVlX3JpZ2h0OiBmYWxzZSxcbiAgICB0cmltX3ZhbHVlX2xlZnQ6IGZhbHNlLFxuICAgIGdyZWVkeTogdHJ1ZSxcbiAgICBzdHJpY3RfZmlsdGVyczogZmFsc2UsXG4gICAgc3RyaWN0X3ZhcmlhYmxlczogZmFsc2VcbiAgfSwgb3B0aW9ucylcbiAgb3B0aW9ucy5yb290ID0gbm9ybWFsaXplU3RyaW5nQXJyYXkob3B0aW9ucy5yb290KVxuXG4gIHZhciBlbmdpbmUgPSBPYmplY3QuY3JlYXRlKF9lbmdpbmUpXG4gIGVuZ2luZS5pbml0KFRhZygpLCBGaWx0ZXIob3B0aW9ucyksIG9wdGlvbnMpXG4gIHJldHVybiBlbmdpbmVcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplU3RyaW5nQXJyYXkgKHZhbHVlKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlXG4gIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkgcmV0dXJuIFt2YWx1ZV1cbiAgcmV0dXJuIFtdXG59XG5cbmZhY3RvcnkubGV4aWNhbCA9IGxleGljYWxcbmZhY3RvcnkuaXNUcnV0aHkgPSBTeW50YXguaXNUcnV0aHlcbmZhY3RvcnkuaXNGYWxzeSA9IFN5bnRheC5pc0ZhbHN5XG5mYWN0b3J5LmV2YWxFeHAgPSBTeW50YXguZXZhbEV4cFxuZmFjdG9yeS5ldmFsVmFsdWUgPSBTeW50YXguZXZhbFZhbHVlXG5mYWN0b3J5LlR5cGVzID0ge1xuICBQYXJzZUVycm9yOiBFcnJvcnMuUGFyc2VFcnJvcixcbiAgVG9rZW5pemF0aW9uRXJvb3I6IEVycm9ycy5Ub2tlbml6YXRpb25FcnJvcixcbiAgUmVuZGVyQnJlYWtFcnJvcjogRXJyb3JzLlJlbmRlckJyZWFrRXJyb3IsXG4gIEFzc2VydGlvbkVycm9yOiBFcnJvcnMuQXNzZXJ0aW9uRXJyb3Jcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5XG4iLCJjb25zdCBsZXhpY2FsID0gcmVxdWlyZSgnLi9sZXhpY2FsLmpzJylcbmNvbnN0IFN5bnRheCA9IHJlcXVpcmUoJy4vc3ludGF4LmpzJylcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4vdXRpbC9hc3NlcnQuanMnKVxuY29uc3QgXyA9IHJlcXVpcmUoJy4vdXRpbC91bmRlcnNjb3JlLmpzJylcblxudmFyIHZhbHVlUkUgPSBuZXcgUmVnRXhwKGAke2xleGljYWwudmFsdWUuc291cmNlfWAsICdnJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zID0gXy5hc3NpZ24oe30sIG9wdGlvbnMpXG4gIHZhciBmaWx0ZXJzID0ge31cblxuICB2YXIgX2ZpbHRlckluc3RhbmNlID0ge1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKG91dHB1dCwgc2NvcGUpIHtcbiAgICAgIHZhciBhcmdzID0gdGhpcy5hcmdzLm1hcChhcmcgPT4gU3ludGF4LmV2YWxWYWx1ZShhcmcsIHNjb3BlKSlcbiAgICAgIGFyZ3MudW5zaGlmdChvdXRwdXQpXG4gICAgICByZXR1cm4gdGhpcy5maWx0ZXIuYXBwbHkobnVsbCwgYXJncylcbiAgICB9LFxuICAgIHBhcnNlOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICB2YXIgbWF0Y2ggPSBsZXhpY2FsLmZpbHRlckxpbmUuZXhlYyhzdHIpXG4gICAgICBhc3NlcnQobWF0Y2gsICdpbGxlZ2FsIGZpbHRlcjogJyArIHN0cilcblxuICAgICAgdmFyIG5hbWUgPSBtYXRjaFsxXVxuICAgICAgdmFyIGFyZ0xpc3QgPSBtYXRjaFsyXSB8fCAnJ1xuICAgICAgdmFyIGZpbHRlciA9IGZpbHRlcnNbbmFtZV1cbiAgICAgIGlmICh0eXBlb2YgZmlsdGVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnN0cmljdF9maWx0ZXJzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdW5kZWZpbmVkIGZpbHRlcjogJHtuYW1lfWApXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZVxuICAgICAgICB0aGlzLmZpbHRlciA9IHggPT4geFxuICAgICAgICB0aGlzLmFyZ3MgPSBbXVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuXG4gICAgICB2YXIgYXJncyA9IFtdXG4gICAgICB3aGlsZSAoKG1hdGNoID0gdmFsdWVSRS5leGVjKGFyZ0xpc3QudHJpbSgpKSkpIHtcbiAgICAgICAgdmFyIHYgPSBtYXRjaFswXVxuICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKGAke3Z9XFxcXHMqOmAsICdnJylcbiAgICAgICAgcmUudGVzdChtYXRjaC5pbnB1dCkgPyBhcmdzLnB1c2goYCcke3Z9J2ApIDogYXJncy5wdXNoKHYpXG4gICAgICB9XG5cbiAgICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyXG4gICAgICB0aGlzLmFyZ3MgPSBhcmdzXG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29uc3RydWN0IChzdHIpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBPYmplY3QuY3JlYXRlKF9maWx0ZXJJbnN0YW5jZSlcbiAgICByZXR1cm4gaW5zdGFuY2UucGFyc2Uoc3RyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIgKG5hbWUsIGZpbHRlcikge1xuICAgIGZpbHRlcnNbbmFtZV0gPSBmaWx0ZXJcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyICgpIHtcbiAgICBmaWx0ZXJzID0ge31cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29uc3RydWN0LCByZWdpc3RlciwgY2xlYXJcbiAgfVxufVxuIiwiLy8gcXVvdGUgcmVsYXRlZFxudmFyIHNpbmdsZVF1b3RlZCA9IC8nW14nXSonL1xudmFyIGRvdWJsZVF1b3RlZCA9IC9cIlteXCJdKlwiL1xudmFyIHF1b3RlZCA9IG5ldyBSZWdFeHAoYCR7c2luZ2xlUXVvdGVkLnNvdXJjZX18JHtkb3VibGVRdW90ZWQuc291cmNlfWApXG52YXIgcXVvdGVCYWxhbmNlZCA9IG5ldyBSZWdFeHAoYCg/OiR7cXVvdGVkLnNvdXJjZX18W14nXCJdKSpgKVxuXG4vLyBiYXNpYyB0eXBlc1xudmFyIGludGVnZXIgPSAvLT9cXGQrL1xudmFyIG51bWJlciA9IC8tP1xcZCtcXC4/XFxkKnxcXC4/XFxkKy9cbnZhciBib29sID0gL3RydWV8ZmFsc2UvXG5cbi8vIHBlb3BlcnR5IGFjY2Vzc1xudmFyIGlkZW50aWZpZXIgPSAvW1xcdy1dKy9cbnZhciBzdWJzY3JpcHQgPSBuZXcgUmVnRXhwKGBcXFxcWyg/OiR7cXVvdGVkLnNvdXJjZX18W1xcXFx3LVxcXFwuXSspXFxcXF1gKVxudmFyIGxpdGVyYWwgPSBuZXcgUmVnRXhwKGAoPzoke3F1b3RlZC5zb3VyY2V9fCR7Ym9vbC5zb3VyY2V9fCR7bnVtYmVyLnNvdXJjZX0pYClcbnZhciB2YXJpYWJsZSA9IG5ldyBSZWdFeHAoYCR7aWRlbnRpZmllci5zb3VyY2V9KD86XFxcXC4ke2lkZW50aWZpZXIuc291cmNlfXwke3N1YnNjcmlwdC5zb3VyY2V9KSpgKVxuXG4vLyByYW5nZSByZWxhdGVkXG52YXIgcmFuZ2VMaW1pdCA9IG5ldyBSZWdFeHAoYCg/OiR7dmFyaWFibGUuc291cmNlfXwke251bWJlci5zb3VyY2V9KWApXG52YXIgcmFuZ2UgPSBuZXcgUmVnRXhwKGBcXFxcKCR7cmFuZ2VMaW1pdC5zb3VyY2V9XFxcXC5cXFxcLiR7cmFuZ2VMaW1pdC5zb3VyY2V9XFxcXClgKVxudmFyIHJhbmdlQ2FwdHVyZSA9IG5ldyBSZWdFeHAoYFxcXFwoKCR7cmFuZ2VMaW1pdC5zb3VyY2V9KVxcXFwuXFxcXC4oJHtyYW5nZUxpbWl0LnNvdXJjZX0pXFxcXClgKVxuXG52YXIgdmFsdWUgPSBuZXcgUmVnRXhwKGAoPzoke3ZhcmlhYmxlLnNvdXJjZX18JHtsaXRlcmFsLnNvdXJjZX18JHtyYW5nZS5zb3VyY2V9KWApXG5cbi8vIGhhc2ggcmVsYXRlZFxudmFyIGhhc2ggPSBuZXcgUmVnRXhwKGAoPzoke2lkZW50aWZpZXIuc291cmNlfSlcXFxccyo6XFxcXHMqKD86JHt2YWx1ZS5zb3VyY2V9KWApXG52YXIgaGFzaENhcHR1cmUgPSBuZXcgUmVnRXhwKGAoJHtpZGVudGlmaWVyLnNvdXJjZX0pXFxcXHMqOlxcXFxzKigke3ZhbHVlLnNvdXJjZX0pYCwgJ2cnKVxuXG4vLyBmdWxsIG1hdGNoXG52YXIgdGFnTGluZSA9IG5ldyBSZWdFeHAoYF5cXFxccyooJHtpZGVudGlmaWVyLnNvdXJjZX0pXFxcXHMqKFtcXFxcc1xcXFxTXSopXFxcXHMqJGApXG52YXIgbGl0ZXJhbExpbmUgPSBuZXcgUmVnRXhwKGBeJHtsaXRlcmFsLnNvdXJjZX0kYCwgJ2knKVxudmFyIHZhcmlhYmxlTGluZSA9IG5ldyBSZWdFeHAoYF4ke3ZhcmlhYmxlLnNvdXJjZX0kYClcbnZhciBudW1iZXJMaW5lID0gbmV3IFJlZ0V4cChgXiR7bnVtYmVyLnNvdXJjZX0kYClcbnZhciBib29sTGluZSA9IG5ldyBSZWdFeHAoYF4ke2Jvb2wuc291cmNlfSRgLCAnaScpXG52YXIgcXVvdGVkTGluZSA9IG5ldyBSZWdFeHAoYF4ke3F1b3RlZC5zb3VyY2V9JGApXG52YXIgcmFuZ2VMaW5lID0gbmV3IFJlZ0V4cChgXiR7cmFuZ2VDYXB0dXJlLnNvdXJjZX0kYClcbnZhciBpbnRlZ2VyTGluZSA9IG5ldyBSZWdFeHAoYF4ke2ludGVnZXIuc291cmNlfSRgKVxuXG4vLyBmaWx0ZXIgcmVsYXRlZFxudmFyIHZhbHVlRGVjbGFyYXRpb24gPSBuZXcgUmVnRXhwKGAoPzoke2lkZW50aWZpZXIuc291cmNlfVxcXFxzKjpcXFxccyopPyR7dmFsdWUuc291cmNlfWApXG52YXIgdmFsdWVMaXN0ID0gbmV3IFJlZ0V4cChgJHt2YWx1ZURlY2xhcmF0aW9uLnNvdXJjZX0oXFxcXHMqLFxcXFxzKiR7dmFsdWVEZWNsYXJhdGlvbi5zb3VyY2V9KSpgKVxudmFyIGZpbHRlciA9IG5ldyBSZWdFeHAoYCR7aWRlbnRpZmllci5zb3VyY2V9KD86XFxcXHMqOlxcXFxzKiR7dmFsdWVMaXN0LnNvdXJjZX0pP2AsICdnJylcbnZhciBmaWx0ZXJDYXB0dXJlID0gbmV3IFJlZ0V4cChgKCR7aWRlbnRpZmllci5zb3VyY2V9KSg/OlxcXFxzKjpcXFxccyooJHt2YWx1ZUxpc3Quc291cmNlfSkpP2ApXG52YXIgZmlsdGVyTGluZSA9IG5ldyBSZWdFeHAoYF4ke2ZpbHRlckNhcHR1cmUuc291cmNlfSRgKVxuXG52YXIgb3BlcmF0b3JzID0gW1xuICAvXFxzK29yXFxzKy8sXG4gIC9cXHMrYW5kXFxzKy8sXG4gIC89PXwhPXw8PXw+PXw8fD58XFxzK2NvbnRhaW5zXFxzKy9cbl1cblxuZnVuY3Rpb24gaXNJbnRlZ2VyIChzdHIpIHtcbiAgcmV0dXJuIGludGVnZXJMaW5lLnRlc3Qoc3RyKVxufVxuXG5mdW5jdGlvbiBpc0xpdGVyYWwgKHN0cikge1xuICByZXR1cm4gbGl0ZXJhbExpbmUudGVzdChzdHIpXG59XG5cbmZ1bmN0aW9uIGlzUmFuZ2UgKHN0cikge1xuICByZXR1cm4gcmFuZ2VMaW5lLnRlc3Qoc3RyKVxufVxuXG5mdW5jdGlvbiBpc1ZhcmlhYmxlIChzdHIpIHtcbiAgcmV0dXJuIHZhcmlhYmxlTGluZS50ZXN0KHN0cilcbn1cblxuZnVuY3Rpb24gbWF0Y2hWYWx1ZSAoc3RyKSB7XG4gIHJldHVybiB2YWx1ZS5leGVjKHN0cilcbn1cblxuZnVuY3Rpb24gcGFyc2VMaXRlcmFsIChzdHIpIHtcbiAgdmFyIHJlcyA9IHN0ci5tYXRjaChudW1iZXJMaW5lKVxuICBpZiAocmVzKSB7XG4gICAgcmV0dXJuIE51bWJlcihzdHIpXG4gIH1cbiAgcmVzID0gc3RyLm1hdGNoKGJvb2xMaW5lKVxuICBpZiAocmVzKSB7XG4gICAgcmV0dXJuIHN0ci50b0xvd2VyQ2FzZSgpID09PSAndHJ1ZSdcbiAgfVxuICByZXMgPSBzdHIubWF0Y2gocXVvdGVkTGluZSlcbiAgaWYgKHJlcykge1xuICAgIHJldHVybiBzdHIuc2xpY2UoMSwgLTEpXG4gIH1cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihgY2Fubm90IHBhcnNlICcke3N0cn0nIGFzIGxpdGVyYWxgKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcXVvdGVkLFxuICBudW1iZXIsXG4gIGJvb2wsXG4gIGxpdGVyYWwsXG4gIGZpbHRlcixcbiAgaW50ZWdlcixcbiAgaGFzaCxcbiAgaGFzaENhcHR1cmUsXG4gIHJhbmdlLFxuICByYW5nZUNhcHR1cmUsXG4gIGlkZW50aWZpZXIsXG4gIHZhbHVlLFxuICBxdW90ZUJhbGFuY2VkLFxuICBvcGVyYXRvcnMsXG4gIHF1b3RlZExpbmUsXG4gIG51bWJlckxpbmUsXG4gIGJvb2xMaW5lLFxuICByYW5nZUxpbmUsXG4gIGxpdGVyYWxMaW5lLFxuICBmaWx0ZXJMaW5lLFxuICB0YWdMaW5lLFxuICBpc0xpdGVyYWwsXG4gIGlzVmFyaWFibGUsXG4gIHBhcnNlTGl0ZXJhbCxcbiAgaXNSYW5nZSxcbiAgbWF0Y2hWYWx1ZSxcbiAgaXNJbnRlZ2VyXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpc1RydXRoeSkge1xuICByZXR1cm4ge1xuICAgICc9PSc6IChsLCByKSA9PiBsID09PSByLFxuICAgICchPSc6IChsLCByKSA9PiBsICE9PSByLFxuICAgICc+JzogKGwsIHIpID0+IGwgIT09IG51bGwgJiYgciAhPT0gbnVsbCAmJiBsID4gcixcbiAgICAnPCc6IChsLCByKSA9PiBsICE9PSBudWxsICYmIHIgIT09IG51bGwgJiYgbCA8IHIsXG4gICAgJz49JzogKGwsIHIpID0+IGwgIT09IG51bGwgJiYgciAhPT0gbnVsbCAmJiBsID49IHIsXG4gICAgJzw9JzogKGwsIHIpID0+IGwgIT09IG51bGwgJiYgciAhPT0gbnVsbCAmJiBsIDw9IHIsXG4gICAgJ2NvbnRhaW5zJzogKGwsIHIpID0+IHtcbiAgICAgIGlmICghbCkgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAodHlwZW9mIGwuaW5kZXhPZiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gbC5pbmRleE9mKHIpID4gLTFcbiAgICB9LFxuICAgICdhbmQnOiAobCwgcikgPT4gaXNUcnV0aHkobCkgJiYgaXNUcnV0aHkociksXG4gICAgJ29yJzogKGwsIHIpID0+IGlzVHJ1dGh5KGwpIHx8IGlzVHJ1dGh5KHIpXG4gIH1cbn1cbiIsImNvbnN0IGxleGljYWwgPSByZXF1aXJlKCcuL2xleGljYWwuanMnKVxuY29uc3QgUGFyc2VFcnJvciA9IHJlcXVpcmUoJy4vdXRpbC9lcnJvci5qcycpLlBhcnNlRXJyb3JcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4vdXRpbC9hc3NlcnQuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUYWcsIEZpbHRlcikge1xuICB2YXIgc3RyZWFtID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgICAgIHRoaXMudG9rZW5zID0gdG9rZW5zXG4gICAgICB0aGlzLmhhbmRsZXJzID0ge31cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcbiAgICBvbjogZnVuY3Rpb24gKG5hbWUsIGNiKSB7XG4gICAgICB0aGlzLmhhbmRsZXJzW25hbWVdID0gY2JcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcbiAgICB0cmlnZ2VyOiBmdW5jdGlvbiAoZXZlbnQsIGFyZykge1xuICAgICAgdmFyIGggPSB0aGlzLmhhbmRsZXJzW2V2ZW50XVxuICAgICAgaWYgKHR5cGVvZiBoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGgoYXJnKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignc3RhcnQnKVxuICAgICAgdmFyIHRva2VuXG4gICAgICB3aGlsZSAoIXRoaXMuc3RvcFJlcXVlc3RlZCAmJiAodG9rZW4gPSB0aGlzLnRva2Vucy5zaGlmdCgpKSkge1xuICAgICAgICBpZiAodGhpcy50cmlnZ2VyKCd0b2tlbicsIHRva2VuKSkgY29udGludWVcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICd0YWcnICYmXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoYHRhZzoke3Rva2VuLm5hbWV9YCwgdG9rZW4pKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBwYXJzZVRva2VuKHRva2VuLCB0aGlzLnRva2VucylcbiAgICAgICAgdGhpcy50cmlnZ2VyKCd0ZW1wbGF0ZScsIHRlbXBsYXRlKVxuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnN0b3BSZXF1ZXN0ZWQpIHRoaXMudHJpZ2dlcignZW5kJylcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnN0b3BSZXF1ZXN0ZWQgPSB0cnVlXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlICh0b2tlbnMpIHtcbiAgICB2YXIgdG9rZW5cbiAgICB2YXIgdGVtcGxhdGVzID0gW11cbiAgICB3aGlsZSAoKHRva2VuID0gdG9rZW5zLnNoaWZ0KCkpKSB7XG4gICAgICB0ZW1wbGF0ZXMucHVzaChwYXJzZVRva2VuKHRva2VuLCB0b2tlbnMpKVxuICAgIH1cbiAgICByZXR1cm4gdGVtcGxhdGVzXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVRva2VuICh0b2tlbiwgdG9rZW5zKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0cGwgPSBudWxsXG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgdHBsID0gcGFyc2VUYWcodG9rZW4sIHRva2VucylcbiAgICAgIH0gZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gJ3ZhbHVlJykge1xuICAgICAgICB0cGwgPSBwYXJzZVZhbHVlKHRva2VuLnZhbHVlKVxuICAgICAgfSBlbHNlIHsgLy8gdG9rZW4udHlwZSA9PT0gJ2h0bWwnXG4gICAgICAgIHRwbCA9IHRva2VuXG4gICAgICB9XG4gICAgICB0cGwudG9rZW4gPSB0b2tlblxuICAgICAgcmV0dXJuIHRwbFxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBQYXJzZUVycm9yKGUsIHRva2VuKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlVGFnICh0b2tlbiwgdG9rZW5zKSB7XG4gICAgaWYgKHRva2VuLm5hbWUgPT09ICdjb250aW51ZScgfHwgdG9rZW4ubmFtZSA9PT0gJ2JyZWFrJykgcmV0dXJuIHRva2VuXG4gICAgcmV0dXJuIFRhZy5jb25zdHJ1Y3QodG9rZW4sIHRva2VucylcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlVmFsdWUgKHN0cikge1xuICAgIHZhciBtYXRjaCA9IGxleGljYWwubWF0Y2hWYWx1ZShzdHIpXG4gICAgYXNzZXJ0KG1hdGNoLCBgaWxsZWdhbCB2YWx1ZSBzdHJpbmc6ICR7c3RyfWApXG5cbiAgICB2YXIgaW5pdGlhbCA9IG1hdGNoWzBdXG4gICAgc3RyID0gc3RyLnN1YnN0cihtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aClcblxuICAgIHZhciBmaWx0ZXJzID0gW11cbiAgICB3aGlsZSAoKG1hdGNoID0gbGV4aWNhbC5maWx0ZXIuZXhlYyhzdHIpKSkge1xuICAgICAgZmlsdGVycy5wdXNoKFttYXRjaFswXS50cmltKCldKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAndmFsdWUnLFxuICAgICAgaW5pdGlhbDogaW5pdGlhbCxcbiAgICAgIGZpbHRlcnM6IGZpbHRlcnMubWFwKHN0ciA9PiBGaWx0ZXIuY29uc3RydWN0KHN0cikpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTdHJlYW0gKHRva2Vucykge1xuICAgIHZhciBzID0gT2JqZWN0LmNyZWF0ZShzdHJlYW0pXG4gICAgcmV0dXJuIHMuaW5pdCh0b2tlbnMpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhcnNlLFxuICAgIHBhcnNlVGFnLFxuICAgIHBhcnNlU3RyZWFtLFxuICAgIHBhcnNlVmFsdWVcbiAgfVxufVxuIiwiY29uc3QgU3ludGF4ID0gcmVxdWlyZSgnLi9zeW50YXguanMnKVxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2FueS1wcm9taXNlJylcbmNvbnN0IG1hcFNlcmllcyA9IHJlcXVpcmUoJy4vdXRpbC9wcm9taXNlLmpzJykubWFwU2VyaWVzXG5jb25zdCBSZW5kZXJCcmVha0Vycm9yID0gcmVxdWlyZSgnLi91dGlsL2Vycm9yLmpzJykuUmVuZGVyQnJlYWtFcnJvclxuY29uc3QgUmVuZGVyRXJyb3IgPSByZXF1aXJlKCcuL3V0aWwvZXJyb3IuanMnKS5SZW5kZXJFcnJvclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSgnLi91dGlsL2Fzc2VydC5qcycpXG5cbnZhciByZW5kZXIgPSB7XG5cbiAgcmVuZGVyVGVtcGxhdGVzOiBmdW5jdGlvbiAodGVtcGxhdGVzLCBzY29wZSkge1xuICAgIGFzc2VydChzY29wZSwgJ3VuYWJsZSB0byBldmFsVGVtcGxhdGVzOiBzY29wZSB1bmRlZmluZWQnKVxuXG4gICAgdmFyIGh0bWwgPSAnJ1xuICAgIHJldHVybiBtYXBTZXJpZXModGVtcGxhdGVzLCAodHBsKSA9PiB7XG4gICAgICByZXR1cm4gcmVuZGVyVGVtcGxhdGUuY2FsbCh0aGlzLCB0cGwpXG4gICAgICAgIC50aGVuKHBhcnRpYWwgPT4gKGh0bWwgKz0gcGFydGlhbCkpXG4gICAgICAgIC5jYXRjaChlID0+IHtcbiAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFJlbmRlckJyZWFrRXJyb3IpIHtcbiAgICAgICAgICAgIGUucmVzb2x2ZWRIVE1MID0gaHRtbFxuICAgICAgICAgICAgdGhyb3cgZVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgUmVuZGVyRXJyb3IoZSwgdHBsKVxuICAgICAgICB9KVxuICAgIH0pLnRoZW4oKCkgPT4gaHRtbClcblxuICAgIGZ1bmN0aW9uIHJlbmRlclRlbXBsYXRlICh0ZW1wbGF0ZSkge1xuICAgICAgaWYgKHRlbXBsYXRlLnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclRhZyh0ZW1wbGF0ZSwgc2NvcGUpXG4gICAgICAgICAgLnRoZW4ocGFydGlhbCA9PiBwYXJ0aWFsID09PSB1bmRlZmluZWQgPyAnJyA6IHBhcnRpYWwpXG4gICAgICB9IGVsc2UgaWYgKHRlbXBsYXRlLnR5cGUgPT09ICd2YWx1ZScpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5ldmFsVmFsdWUodGVtcGxhdGUsIHNjb3BlKSlcbiAgICAgICAgICAudGhlbihwYXJ0aWFsID0+IHBhcnRpYWwgPT09IHVuZGVmaW5lZCA/ICcnIDogc3RyaW5naWZ5KHBhcnRpYWwpKVxuICAgICAgfSBlbHNlIHsgLy8gdGVtcGxhdGUudHlwZSA9PT0gJ2h0bWwnXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGVtcGxhdGUudmFsdWUpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlclRhZzogZnVuY3Rpb24gKHRlbXBsYXRlLCBzY29wZSkge1xuICAgIGlmICh0ZW1wbGF0ZS5uYW1lID09PSAnY29udGludWUnKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFJlbmRlckJyZWFrRXJyb3IoJ2NvbnRpbnVlJykpXG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZS5uYW1lID09PSAnYnJlYWsnKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFJlbmRlckJyZWFrRXJyb3IoJ2JyZWFrJykpXG4gICAgfVxuICAgIHJldHVybiB0ZW1wbGF0ZS5yZW5kZXIoc2NvcGUpXG4gIH0sXG5cbiAgZXZhbFZhbHVlOiBmdW5jdGlvbiAodGVtcGxhdGUsIHNjb3BlKSB7XG4gICAgYXNzZXJ0KHNjb3BlLCAndW5hYmxlIHRvIGV2YWxWYWx1ZTogc2NvcGUgdW5kZWZpbmVkJylcbiAgICByZXR1cm4gdGVtcGxhdGUuZmlsdGVycy5yZWR1Y2UoXG4gICAgICAocHJldiwgZmlsdGVyKSA9PiBmaWx0ZXIucmVuZGVyKHByZXYsIHNjb3BlKSxcbiAgICAgIFN5bnRheC5ldmFsRXhwKHRlbXBsYXRlLmluaXRpYWwsIHNjb3BlKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBmYWN0b3J5ICgpIHtcbiAgdmFyIGluc3RhbmNlID0gT2JqZWN0LmNyZWF0ZShyZW5kZXIpXG4gIHJldHVybiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkgKHZhbCkge1xuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHJldHVybiB2YWxcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5XG4iLCJjb25zdCBfID0gcmVxdWlyZSgnLi91dGlsL3VuZGVyc2NvcmUuanMnKVxuY29uc3QgbGV4aWNhbCA9IHJlcXVpcmUoJy4vbGV4aWNhbC5qcycpXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCcuL3V0aWwvYXNzZXJ0LmpzJylcblxudmFyIFNjb3BlID0ge1xuICBnZXRBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3R4ID0ge31cbiAgICBmb3IgKHZhciBpID0gdGhpcy5zY29wZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIF8uYXNzaWduKGN0eCwgdGhpcy5zY29wZXNbaV0pXG4gICAgfVxuICAgIHJldHVybiBjdHhcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5QnlQYXRoKHRoaXMuc2NvcGVzLCBzdHIpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCEvdW5kZWZpbmVkIHZhcmlhYmxlLy50ZXN0KGUubWVzc2FnZSkgfHwgdGhpcy5vcHRzLnN0cmljdF92YXJpYWJsZXMpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2V0OiBmdW5jdGlvbiAoaywgdikge1xuICAgIHZhciBzY29wZSA9IHRoaXMuZmluZFNjb3BlRm9yKGspXG4gICAgc2V0UHJvcGVydHlCeVBhdGgoc2NvcGUsIGssIHYpXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgcHVzaDogZnVuY3Rpb24gKGN0eCkge1xuICAgIGFzc2VydChjdHgsIGB0cnlpbmcgdG8gcHVzaCAke2N0eH0gaW50byBzY29wZXNgKVxuICAgIHJldHVybiB0aGlzLnNjb3Blcy5wdXNoKGN0eClcbiAgfSxcbiAgcG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NvcGVzLnBvcCgpXG4gIH0sXG4gIGZpbmRTY29wZUZvcjogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBpID0gdGhpcy5zY29wZXMubGVuZ3RoIC0gMVxuICAgIHdoaWxlIChpID49IDAgJiYgIShrZXkgaW4gdGhpcy5zY29wZXNbaV0pKSB7XG4gICAgICBpLS1cbiAgICB9XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICBpID0gdGhpcy5zY29wZXMubGVuZ3RoIC0gMVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zY29wZXNbaV1cbiAgfSxcbiAgdW5zaGlmdDogZnVuY3Rpb24gKGN0eCkge1xuICAgIGFzc2VydChjdHgsIGB0cnlpbmcgdG8gcHVzaCAke2N0eH0gaW50byBzY29wZXNgKVxuICAgIHJldHVybiB0aGlzLnNjb3Blcy51bnNoaWZ0KGN0eClcbiAgfSxcbiAgc2hpZnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zY29wZXMuc2hpZnQoKVxuICB9LFxuXG4gIGdldFByb3BlcnR5QnlQYXRoOiBmdW5jdGlvbiAoc2NvcGVzLCBwYXRoKSB7XG4gICAgdmFyIHBhdGhzID0gdGhpcy5wcm9wZXJ0eUFjY2Vzc1NlcShwYXRoICsgJycpXG4gICAgaWYgKCFwYXRocy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3VuZGVmaW5lZCB2YXJpYWJsZTogJyArIHBhdGgpXG4gICAgfVxuICAgIHZhciBrZXkgPSBwYXRocy5zaGlmdCgpXG4gICAgdmFyIHZhbHVlID0gZ2V0VmFsdWVGcm9tU2NvcGVzKGtleSwgc2NvcGVzKVxuICAgIHJldHVybiBwYXRocy5yZWR1Y2UoXG4gICAgICAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICBpZiAoXy5pc05pbCh2YWx1ZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bmRlZmluZWQgdmFyaWFibGU6ICcgKyBrZXkpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldFZhbHVlRnJvbVBhcmVudChrZXksIHZhbHVlKVxuICAgICAgfSxcbiAgICAgIHZhbHVlXG4gICAgKVxuICB9LFxuXG4gIC8qXG4gICAqIFBhcnNlIHByb3BlcnR5IGFjY2VzcyBzZXF1ZW5jZSBmcm9tIGFjY2VzcyBzdHJpbmdcbiAgICogQGV4YW1wbGVcbiAgICogYWNjZXNzU2VxKFwiZm9vLmJhclwiKSAgICAgICAgICAgIC8vIFsnZm9vJywgJ2JhciddXG4gICAqIGFjY2Vzc1NlcShcImZvb1snYmFyJ11cIikgICAgICAvLyBbJ2ZvbycsICdiYXInXVxuICAgKiBhY2Nlc3NTZXEoXCJmb29bJ2JdciddXCIpICAgICAgLy8gWydmb28nLCAnYl1yJ11cbiAgICogYWNjZXNzU2VxKFwiZm9vW2Jhci5jb29dXCIpICAgIC8vIFsnZm9vJywgJ2JhciddLCBmb3IgYmFyLmNvbyA9PSAnYmFyJ1xuICAgKi9cbiAgcHJvcGVydHlBY2Nlc3NTZXE6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICB2YXIgc2VxID0gW11cbiAgICB2YXIgbmFtZSA9ICcnXG4gICAgdmFyIGpcbiAgICB2YXIgaSA9IDBcbiAgICB3aGlsZSAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgIHN3aXRjaCAoc3RyW2ldKSB7XG4gICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgIHB1c2goKVxuXG4gICAgICAgICAgdmFyIGRlbGVtaXRlciA9IHN0cltpICsgMV1cbiAgICAgICAgICBpZiAoL1snXCJdLy50ZXN0KGRlbGVtaXRlcikpIHsgLy8gZm9vW1wiYmFyXCJdXG4gICAgICAgICAgICBqID0gc3RyLmluZGV4T2YoZGVsZW1pdGVyLCBpICsgMilcbiAgICAgICAgICAgIGFzc2VydChqICE9PSAtMSwgYHVuYmFsYW5jZWQgJHtkZWxlbWl0ZXJ9OiAke3N0cn1gKVxuICAgICAgICAgICAgbmFtZSA9IHN0ci5zbGljZShpICsgMiwgailcbiAgICAgICAgICAgIHB1c2goKVxuICAgICAgICAgICAgaSA9IGogKyAyXG4gICAgICAgICAgfSBlbHNlIHsgLy8gZm9vW2Jhci5jb29dXG4gICAgICAgICAgICBqID0gbWF0Y2hSaWdodEJyYWNrZXQoc3RyLCBpICsgMSlcbiAgICAgICAgICAgIGFzc2VydChqICE9PSAtMSwgYHVuYmFsYW5jZWQgW106ICR7c3RyfWApXG4gICAgICAgICAgICBuYW1lID0gc3RyLnNsaWNlKGkgKyAxLCBqKVxuICAgICAgICAgICAgaWYgKCFsZXhpY2FsLmlzSW50ZWdlcihuYW1lKSkgeyAvLyBmb29bYmFyXSB2cy4gZm9vWzFdXG4gICAgICAgICAgICAgIG5hbWUgPSB0aGlzLmdldChuYW1lKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHVzaCgpXG4gICAgICAgICAgICBpID0gaiArIDFcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnLic6Ly8gZm9vLmJhciwgZm9vWzBdLmJhclxuICAgICAgICAgIHB1c2goKVxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6Ly8gZm9vLmJhclxuICAgICAgICAgIG5hbWUgKz0gc3RyW2ldXG4gICAgICAgICAgaSsrXG4gICAgICB9XG4gICAgfVxuICAgIHB1c2goKVxuICAgIHJldHVybiBzZXFcblxuICAgIGZ1bmN0aW9uIHB1c2ggKCkge1xuICAgICAgaWYgKG5hbWUubGVuZ3RoKSBzZXEucHVzaChuYW1lKVxuICAgICAgbmFtZSA9ICcnXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByb3BlcnR5QnlQYXRoIChvYmosIHBhdGgsIHZhbCkge1xuICB2YXIgcGF0aHMgPSAocGF0aCArICcnKS5yZXBsYWNlKC9cXFsvZywgJy4nKS5yZXBsYWNlKC9cXF0vZywgJycpLnNwbGl0KCcuJylcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBwYXRoc1tpXVxuICAgIGlmICghXy5pc09iamVjdChvYmopKSB7XG4gICAgICAvLyBjYW5ub3Qgc2V0IHByb3BlcnR5IG9mIG5vbi1vYmplY3RcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBmb3IgZW5kIHBvaW50XG4gICAgaWYgKGkgPT09IHBhdGhzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiAob2JqW2tleV0gPSB2YWwpXG4gICAgfVxuICAgIC8vIGlmIHBhdGggbm90IGV4aXN0XG4gICAgaWYgKHVuZGVmaW5lZCA9PT0gb2JqW2tleV0pIHtcbiAgICAgIG9ialtrZXldID0ge31cbiAgICB9XG4gICAgb2JqID0gb2JqW2tleV1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUZyb21QYXJlbnQgKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIChrZXkgPT09ICdzaXplJyAmJiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzU3RyaW5nKHZhbHVlKSkpXG4gICAgPyB2YWx1ZS5sZW5ndGhcbiAgICA6IHZhbHVlW2tleV1cbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVGcm9tU2NvcGVzIChrZXksIHNjb3Blcykge1xuICBmb3IgKHZhciBpID0gc2NvcGVzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgdmFyIHNjb3BlID0gc2NvcGVzW2ldXG4gICAgaWYgKHNjb3BlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybiBzY29wZVtrZXldXG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3VuZGVmaW5lZCB2YXJpYWJsZTogJyArIGtleSlcbn1cblxuZnVuY3Rpb24gbWF0Y2hSaWdodEJyYWNrZXQgKHN0ciwgYmVnaW4pIHtcbiAgdmFyIHN0YWNrID0gMSAvLyBjb3VudCBvZiAnWycgLSBjb3VudCBvZiAnXSdcbiAgZm9yICh2YXIgaSA9IGJlZ2luOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0cltpXSA9PT0gJ1snKSB7XG4gICAgICBzdGFjaysrXG4gICAgfVxuICAgIGlmIChzdHJbaV0gPT09ICddJykge1xuICAgICAgc3RhY2stLVxuICAgICAgaWYgKHN0YWNrID09PSAwKSB7XG4gICAgICAgIHJldHVybiBpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMVxufVxuXG5leHBvcnRzLmZhY3RvcnkgPSBmdW5jdGlvbiAoY3R4LCBvcHRzKSB7XG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBkeW5hbWljUGFydGlhbHM6IHRydWUsXG4gICAgc3RyaWN0X3ZhcmlhYmxlczogZmFsc2UsXG4gICAgc3RyaWN0X2ZpbHRlcnM6IGZhbHNlLFxuICAgIGJsb2Nrczoge30sXG4gICAgcm9vdDogW11cbiAgfVxuICB2YXIgc2NvcGUgPSBPYmplY3QuY3JlYXRlKFNjb3BlKVxuICBzY29wZS5vcHRzID0gXy5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIG9wdHMpXG4gIHNjb3BlLnNjb3BlcyA9IFtjdHggfHwge31dXG4gIHJldHVybiBzY29wZVxufVxuIiwiY29uc3Qgb3BlcmF0b3JzID0gcmVxdWlyZSgnLi9vcGVyYXRvcnMuanMnKShpc1RydXRoeSlcbmNvbnN0IGxleGljYWwgPSByZXF1aXJlKCcuL2xleGljYWwuanMnKVxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSgnLi4vc3JjL3V0aWwvYXNzZXJ0LmpzJylcblxuZnVuY3Rpb24gZXZhbEV4cCAoZXhwLCBzY29wZSkge1xuICBhc3NlcnQoc2NvcGUsICd1bmFibGUgdG8gZXZhbEV4cDogc2NvcGUgdW5kZWZpbmVkJylcbiAgdmFyIG9wZXJhdG9yUkVzID0gbGV4aWNhbC5vcGVyYXRvcnNcbiAgdmFyIG1hdGNoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlcmF0b3JSRXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgb3BlcmF0b3JSRSA9IG9wZXJhdG9yUkVzW2ldXG4gICAgdmFyIGV4cFJFID0gbmV3IFJlZ0V4cChgXigke2xleGljYWwucXVvdGVCYWxhbmNlZC5zb3VyY2V9KSgke29wZXJhdG9yUkUuc291cmNlfSkoJHtsZXhpY2FsLnF1b3RlQmFsYW5jZWQuc291cmNlfSkkYClcbiAgICBpZiAoKG1hdGNoID0gZXhwLm1hdGNoKGV4cFJFKSkpIHtcbiAgICAgIHZhciBsID0gZXZhbEV4cChtYXRjaFsxXSwgc2NvcGUpXG4gICAgICB2YXIgb3AgPSBvcGVyYXRvcnNbbWF0Y2hbMl0udHJpbSgpXVxuICAgICAgdmFyIHIgPSBldmFsRXhwKG1hdGNoWzNdLCBzY29wZSlcbiAgICAgIHJldHVybiBvcChsLCByKVxuICAgIH1cbiAgfVxuXG4gIGlmICgobWF0Y2ggPSBleHAubWF0Y2gobGV4aWNhbC5yYW5nZUxpbmUpKSkge1xuICAgIHZhciBsb3cgPSBldmFsVmFsdWUobWF0Y2hbMV0sIHNjb3BlKVxuICAgIHZhciBoaWdoID0gZXZhbFZhbHVlKG1hdGNoWzJdLCBzY29wZSlcbiAgICB2YXIgcmFuZ2UgPSBbXVxuICAgIGZvciAodmFyIGogPSBsb3c7IGogPD0gaGlnaDsgaisrKSB7XG4gICAgICByYW5nZS5wdXNoKGopXG4gICAgfVxuICAgIHJldHVybiByYW5nZVxuICB9XG5cbiAgcmV0dXJuIGV2YWxWYWx1ZShleHAsIHNjb3BlKVxufVxuXG5mdW5jdGlvbiBldmFsVmFsdWUgKHN0ciwgc2NvcGUpIHtcbiAgc3RyID0gc3RyICYmIHN0ci50cmltKClcbiAgaWYgKCFzdHIpIHJldHVybiB1bmRlZmluZWRcblxuICBpZiAobGV4aWNhbC5pc0xpdGVyYWwoc3RyKSkge1xuICAgIHJldHVybiBsZXhpY2FsLnBhcnNlTGl0ZXJhbChzdHIpXG4gIH1cbiAgaWYgKGxleGljYWwuaXNWYXJpYWJsZShzdHIpKSB7XG4gICAgcmV0dXJuIHNjb3BlLmdldChzdHIpXG4gIH1cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihgY2Fubm90IGV2YWwgJyR7c3RyfScgYXMgdmFsdWVgKVxufVxuXG5mdW5jdGlvbiBpc1RydXRoeSAodmFsKSB7XG4gIHJldHVybiAhaXNGYWxzeSh2YWwpXG59XG5cbmZ1bmN0aW9uIGlzRmFsc3kgKHZhbCkge1xuICByZXR1cm4gdmFsID09PSBmYWxzZSB8fCB1bmRlZmluZWQgPT09IHZhbCB8fCB2YWwgPT09IG51bGxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGV2YWxFeHAsIGV2YWxWYWx1ZSwgaXNUcnV0aHksIGlzRmFsc3lcbn1cbiIsImNvbnN0IGxleGljYWwgPSByZXF1aXJlKCcuL2xleGljYWwuanMnKVxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2FueS1wcm9taXNlJylcbmNvbnN0IFN5bnRheCA9IHJlcXVpcmUoJy4vc3ludGF4LmpzJylcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4vdXRpbC9hc3NlcnQuanMnKVxuXG5mdW5jdGlvbiBoYXNoIChtYXJrdXAsIHNjb3BlKSB7XG4gIHZhciBvYmogPSB7fVxuICB2YXIgbWF0Y2hcbiAgbGV4aWNhbC5oYXNoQ2FwdHVyZS5sYXN0SW5kZXggPSAwXG4gIHdoaWxlICgobWF0Y2ggPSBsZXhpY2FsLmhhc2hDYXB0dXJlLmV4ZWMobWFya3VwKSkpIHtcbiAgICB2YXIgayA9IG1hdGNoWzFdXG4gICAgdmFyIHYgPSBtYXRjaFsyXVxuICAgIG9ialtrXSA9IFN5bnRheC5ldmFsVmFsdWUodiwgc2NvcGUpXG4gIH1cbiAgcmV0dXJuIG9ialxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRhZ0ltcGxzID0ge31cblxuICB2YXIgX3RhZ0luc3RhbmNlID0ge1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICB2YXIgb2JqID0gaGFzaCh0aGlzLnRva2VuLmFyZ3MsIHNjb3BlKVxuICAgICAgdmFyIGltcGwgPSB0aGlzLnRhZ0ltcGxcbiAgICAgIGlmICh0eXBlb2YgaW1wbC5yZW5kZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgnJylcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IGltcGwucmVuZGVyKHNjb3BlLCBvYmopKVxuICAgIH0sXG4gICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbiwgdG9rZW5zKSB7XG4gICAgICB0aGlzLnR5cGUgPSAndGFnJ1xuICAgICAgdGhpcy50b2tlbiA9IHRva2VuXG4gICAgICB0aGlzLm5hbWUgPSB0b2tlbi5uYW1lXG5cbiAgICAgIHZhciB0YWdJbXBsID0gdGFnSW1wbHNbdGhpcy5uYW1lXVxuICAgICAgYXNzZXJ0KHRhZ0ltcGwsIGB0YWcgJHt0aGlzLm5hbWV9IG5vdCBmb3VuZGApXG4gICAgICB0aGlzLnRhZ0ltcGwgPSBPYmplY3QuY3JlYXRlKHRhZ0ltcGwpXG4gICAgICBpZiAodGhpcy50YWdJbXBsLnBhcnNlKSB7XG4gICAgICAgIHRoaXMudGFnSW1wbC5wYXJzZSh0b2tlbiwgdG9rZW5zKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyIChuYW1lLCB0YWcpIHtcbiAgICB0YWdJbXBsc1tuYW1lXSA9IHRhZ1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3RydWN0ICh0b2tlbiwgdG9rZW5zKSB7XG4gICAgdmFyIGluc3RhbmNlID0gT2JqZWN0LmNyZWF0ZShfdGFnSW5zdGFuY2UpXG4gICAgaW5zdGFuY2UucGFyc2UodG9rZW4sIHRva2VucylcbiAgICByZXR1cm4gaW5zdGFuY2VcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyICgpIHtcbiAgICB0YWdJbXBscyA9IHt9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNvbnN0cnVjdCxcbiAgICByZWdpc3RlcixcbiAgICBjbGVhclxuICB9XG59XG4iLCJjb25zdCBsZXhpY2FsID0gcmVxdWlyZSgnLi9sZXhpY2FsLmpzJylcbmNvbnN0IFRva2VuaXphdGlvbkVycm9yID0gcmVxdWlyZSgnLi91dGlsL2Vycm9yLmpzJykuVG9rZW5pemF0aW9uRXJyb3JcbmNvbnN0IF8gPSByZXF1aXJlKCcuL3V0aWwvdW5kZXJzY29yZS5qcycpXG5jb25zdCB3aGl0ZVNwYWNlQ3RybCA9IHJlcXVpcmUoJy4vd2hpdGVzcGFjZS1jdHJsLmpzJylcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4vdXRpbC9hc3NlcnQuanMnKVxuXG5mdW5jdGlvbiBwYXJzZSAoaW5wdXQsIGZpbGUsIG9wdGlvbnMpIHtcbiAgYXNzZXJ0KF8uaXNTdHJpbmcoaW5wdXQpLCAnaWxsZWdhbCBpbnB1dCcpXG5cbiAgdmFyIHJMaXF1aWQgPSAvKHslLT8oW1xcc1xcU10qPyktPyV9KXwoe3stPyhbXFxzXFxTXSo/KS0/fX0pL2dcbiAgdmFyIGN1cnJJbmRlbnQgPSAwXG4gIHZhciBsaW5lTnVtYmVyID0gTGluZU51bWJlcihpbnB1dClcbiAgdmFyIGxhc3RNYXRjaEVuZCA9IDBcbiAgdmFyIHRva2VucyA9IFtdXG5cbiAgZm9yICh2YXIgbWF0Y2g7IChtYXRjaCA9IHJMaXF1aWQuZXhlYyhpbnB1dCkpOyBsYXN0TWF0Y2hFbmQgPSByTGlxdWlkLmxhc3RJbmRleCkge1xuICAgIGlmIChtYXRjaC5pbmRleCA+IGxhc3RNYXRjaEVuZCkge1xuICAgICAgdG9rZW5zLnB1c2gocGFyc2VIVE1MVG9rZW4obGFzdE1hdGNoRW5kLCBtYXRjaC5pbmRleCkpXG4gICAgfVxuICAgIHRva2Vucy5wdXNoKG1hdGNoWzFdXG4gICAgICA/IHBhcnNlVGFnVG9rZW4obWF0Y2hbMV0sIG1hdGNoWzJdLnRyaW0oKSwgbWF0Y2guaW5kZXgpXG4gICAgICA6IHBhcnNlVmFsdWVUb2tlbihtYXRjaFszXSwgbWF0Y2hbNF0udHJpbSgpLCBtYXRjaC5pbmRleCkpXG4gIH1cbiAgaWYgKGlucHV0Lmxlbmd0aCA+IGxhc3RNYXRjaEVuZCkge1xuICAgIHRva2Vucy5wdXNoKHBhcnNlSFRNTFRva2VuKGxhc3RNYXRjaEVuZCwgaW5wdXQubGVuZ3RoKSlcbiAgfVxuICB3aGl0ZVNwYWNlQ3RybCh0b2tlbnMsIG9wdGlvbnMpXG4gIHJldHVybiB0b2tlbnNcblxuICBmdW5jdGlvbiBwYXJzZVRhZ1Rva2VuIChyYXcsIHZhbHVlLCBwb3MpIHtcbiAgICB2YXIgbWF0Y2ggPSB2YWx1ZS5tYXRjaChsZXhpY2FsLnRhZ0xpbmUpXG4gICAgdmFyIHRva2VuID0ge1xuICAgICAgdHlwZTogJ3RhZycsXG4gICAgICBpbmRlbnQ6IGN1cnJJbmRlbnQsXG4gICAgICBsaW5lOiBsaW5lTnVtYmVyLmdldChwb3MpLFxuICAgICAgdHJpbV9sZWZ0OiByYXcuc2xpY2UoMCwgMykgPT09ICd7JS0nLFxuICAgICAgdHJpbV9yaWdodDogcmF3LnNsaWNlKC0zKSA9PT0gJy0lfScsXG4gICAgICByYXcsXG4gICAgICB2YWx1ZSxcbiAgICAgIGlucHV0LFxuICAgICAgZmlsZVxuICAgIH1cbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICB0aHJvdyBuZXcgVG9rZW5pemF0aW9uRXJyb3IoYGlsbGVnYWwgdGFnIHN5bnRheGAsIHRva2VuKVxuICAgIH1cbiAgICB0b2tlbi5uYW1lID0gbWF0Y2hbMV1cbiAgICB0b2tlbi5hcmdzID0gbWF0Y2hbMl1cbiAgICByZXR1cm4gdG9rZW5cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlVmFsdWVUb2tlbiAocmF3LCB2YWx1ZSwgcG9zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICd2YWx1ZScsXG4gICAgICBsaW5lOiBsaW5lTnVtYmVyLmdldChwb3MpLFxuICAgICAgdHJpbV9sZWZ0OiByYXcuc2xpY2UoMCwgMykgPT09ICd7ey0nLFxuICAgICAgdHJpbV9yaWdodDogcmF3LnNsaWNlKC0zKSA9PT0gJy19fScsXG4gICAgICByYXcsXG4gICAgICB2YWx1ZSxcbiAgICAgIGlucHV0LFxuICAgICAgZmlsZVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlSFRNTFRva2VuIChiZWdpbiwgZW5kKSB7XG4gICAgdmFyIGh0bWxGcmFnbWVudCA9IGlucHV0LnNsaWNlKGJlZ2luLCBlbmQpXG4gICAgY3VyckluZGVudCA9IF8ubGFzdCgoaHRtbEZyYWdtZW50KS5zcGxpdCgnXFxuJykpLmxlbmd0aFxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgIHJhdzogaHRtbEZyYWdtZW50LFxuICAgICAgdmFsdWU6IGh0bWxGcmFnbWVudFxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBMaW5lTnVtYmVyIChodG1sKSB7XG4gIHZhciBwYXJzZWRMaW5lc0NvdW50ID0gMFxuICB2YXIgbGFzdE1hdGNoQmVnaW4gPSAtMVxuXG4gIHJldHVybiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICB2YXIgbGluZXMgPSBodG1sLnNsaWNlKGxhc3RNYXRjaEJlZ2luICsgMSwgcG9zKS5zcGxpdCgnXFxuJylcbiAgICAgIHBhcnNlZExpbmVzQ291bnQgKz0gbGluZXMubGVuZ3RoIC0gMVxuICAgICAgbGFzdE1hdGNoQmVnaW4gPSBwb3NcbiAgICAgIHJldHVybiBwYXJzZWRMaW5lc0NvdW50ICsgMVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLnBhcnNlID0gcGFyc2VcbmV4cG9ydHMud2hpdGVTcGFjZUN0cmwgPSB3aGl0ZVNwYWNlQ3RybFxuIiwiY29uc3QgQXNzZXJ0aW9uRXJyb3IgPSByZXF1aXJlKCcuL2Vycm9yLmpzJykuQXNzZXJ0aW9uRXJyb3JcblxuZnVuY3Rpb24gYXNzZXJ0IChwcmVkaWNhdGUsIG1lc3NhZ2UpIHtcbiAgaWYgKCFwcmVkaWNhdGUpIHtcbiAgICBtZXNzYWdlID0gbWVzc2FnZSB8fCBgZXhwZWN0ICR7cHJlZGljYXRlfSB0byBiZSB0cnVlYFxuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtZXNzYWdlKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzZXJ0XG4iLCJjb25zdCBfID0gcmVxdWlyZSgnLi91bmRlcnNjb3JlLmpzJylcblxuZnVuY3Rpb24gaW5pdEVycm9yICgpIHtcbiAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lXG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHRoaXMuY29uc3RydWN0b3IpXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdExpcXVpZEVycm9yIChlcnIsIHRva2VuKSB7XG4gIGluaXRFcnJvci5jYWxsKHRoaXMpXG5cbiAgdGhpcy5pbnB1dCA9IHRva2VuLmlucHV0XG4gIHRoaXMubGluZSA9IHRva2VuLmxpbmVcbiAgdGhpcy5maWxlID0gdG9rZW4uZmlsZVxuXG4gIHZhciBjb250ZXh0ID0gbWtDb250ZXh0KHRva2VuLmlucHV0LCB0b2tlbi5saW5lKVxuICB0aGlzLm1lc3NhZ2UgPSBta01lc3NhZ2UoZXJyLm1lc3NhZ2UsIHRva2VuKVxuICB0aGlzLnN0YWNrID0gY29udGV4dCArXG4gICAgJ1xcbicgKyAodGhpcy5zdGFjayB8fCB0aGlzLm1lc3NhZ2UpICtcbiAgICAgIChlcnIuc3RhY2sgPyAnXFxuRnJvbSAnICsgZXJyLnN0YWNrIDogJycpXG59XG5cbmZ1bmN0aW9uIFRva2VuaXphdGlvbkVycm9yIChtZXNzYWdlLCB0b2tlbikge1xuICBpbml0TGlxdWlkRXJyb3IuY2FsbCh0aGlzLCB7bWVzc2FnZTogbWVzc2FnZX0sIHRva2VuKVxufVxuVG9rZW5pemF0aW9uRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpXG5Ub2tlbml6YXRpb25FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbml6YXRpb25FcnJvclxuXG5mdW5jdGlvbiBQYXJzZUVycm9yIChlLCB0b2tlbikge1xuICBfLmFzc2lnbih0aGlzLCBlKVxuICB0aGlzLm9yaWdpbmFsRXJyb3IgPSBlXG5cbiAgaW5pdExpcXVpZEVycm9yLmNhbGwodGhpcywgZSwgdG9rZW4pXG59XG5QYXJzZUVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuUGFyc2VFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQYXJzZUVycm9yXG5cbmZ1bmN0aW9uIFJlbmRlckVycm9yIChlLCB0cGwpIHtcbiAgLy8gcmV0dXJuIHRoZSBvcmlnaW5hbCByZW5kZXIgZXJyb3JcbiAgaWYgKGUgaW5zdGFuY2VvZiBSZW5kZXJFcnJvcikge1xuICAgIHJldHVybiBlXG4gIH1cbiAgXy5hc3NpZ24odGhpcywgZSlcbiAgdGhpcy5vcmlnaW5hbEVycm9yID0gZVxuXG4gIGluaXRMaXF1aWRFcnJvci5jYWxsKHRoaXMsIGUsIHRwbC50b2tlbilcbn1cblJlbmRlckVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuUmVuZGVyRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVuZGVyRXJyb3JcblxuZnVuY3Rpb24gUmVuZGVyQnJlYWtFcnJvciAobWVzc2FnZSkge1xuICBpbml0RXJyb3IuY2FsbCh0aGlzKVxuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlICsgJydcbn1cblJlbmRlckJyZWFrRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpXG5SZW5kZXJCcmVha0Vycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbmRlckJyZWFrRXJyb3JcblxuZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3IgKG1lc3NhZ2UpIHtcbiAgaW5pdEVycm9yLmNhbGwodGhpcylcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZSArICcnXG59XG5Bc3NlcnRpb25FcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSlcbkFzc2VydGlvbkVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFzc2VydGlvbkVycm9yXG5cbmZ1bmN0aW9uIG1rQ29udGV4dCAoaW5wdXQsIGxpbmUpIHtcbiAgdmFyIGxpbmVzID0gaW5wdXQuc3BsaXQoJ1xcbicpXG4gIHZhciBiZWdpbiA9IE1hdGgubWF4KGxpbmUgLSAyLCAxKVxuICB2YXIgZW5kID0gTWF0aC5taW4obGluZSArIDMsIGxpbmVzLmxlbmd0aClcblxuICB2YXIgY29udGV4dCA9IF9cbiAgICAucmFuZ2UoYmVnaW4sIGVuZCArIDEpXG4gICAgLm1hcChsID0+IFtcbiAgICAgIChsID09PSBsaW5lKSA/ICc+PiAnIDogJyAgICcsXG4gICAgICBhbGlnbihsLCBlbmQpLFxuICAgICAgJ3wgJyxcbiAgICAgIGxpbmVzW2wgLSAxXVxuICAgIF0uam9pbignJykpXG4gICAgLmpvaW4oJ1xcbicpXG5cbiAgcmV0dXJuIGNvbnRleHRcbn1cblxuZnVuY3Rpb24gYWxpZ24gKG4sIG1heCkge1xuICB2YXIgbGVuZ3RoID0gKG1heCArICcnKS5sZW5ndGhcbiAgdmFyIHN0ciA9IG4gKyAnJ1xuICB2YXIgYmxhbmsgPSBBcnJheShsZW5ndGggLSBzdHIubGVuZ3RoKS5qb2luKCcgJylcbiAgcmV0dXJuIGJsYW5rICsgc3RyXG59XG5cbmZ1bmN0aW9uIG1rTWVzc2FnZSAobXNnLCB0b2tlbikge1xuICBtc2cgPSBtc2cgfHwgJydcbiAgaWYgKHRva2VuLmZpbGUpIHtcbiAgICBtc2cgKz0gJywgZmlsZTonICsgdG9rZW4uZmlsZVxuICB9XG4gIGlmICh0b2tlbi5saW5lKSB7XG4gICAgbXNnICs9ICcsIGxpbmU6JyArIHRva2VuLmxpbmVcbiAgfVxuICByZXR1cm4gbXNnXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUb2tlbml6YXRpb25FcnJvcixcbiAgUGFyc2VFcnJvcixcbiAgUmVuZGVyQnJlYWtFcnJvcixcbiAgQXNzZXJ0aW9uRXJyb3IsXG4gIFJlbmRlckVycm9yXG59XG4iLCJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuZnVuY3Rpb24gcmVhZEZpbGVBc3luYyAoZmlsZXBhdGgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBmcy5yZWFkRmlsZShmaWxlcGF0aCwgJ3V0ZjgnLCBmdW5jdGlvbiAoZXJyLCBjb250ZW50KSB7XG4gICAgICBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUoY29udGVudClcbiAgICB9KVxuICB9KVxufTtcblxuZnVuY3Rpb24gc3RhdEZpbGVBc3luYyAocGF0aCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGZzLnN0YXQocGF0aCwgKGVyciwgc3RhdCkgPT4gZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHN0YXQpKVxuICB9KVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlYWRGaWxlQXN5bmMsXG4gIHN0YXRGaWxlQXN5bmNcbn1cbiIsImNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdhbnktcHJvbWlzZScpXG5cbi8qXG4gKiBDYWxsIGZ1bmN0aW9ucyBpbiBzZXJpYWwgdW50aWwgc29tZW9uZSByZXNvbHZlZC5cbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZXJhYmxlIHRoZSBhcnJheSB0byBpdGVyYXRlIHdpdGguXG4gKiBAcGFyYW0ge0FycmF5fSBpdGVyYXRlZSByZXR1cm5zIGEgbmV3IHByb21pc2UuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleCwgaXRlcmFibGUpLlxuICovXG5mdW5jdGlvbiBhbnlTZXJpZXMgKGl0ZXJhYmxlLCBpdGVyYXRlZSkge1xuICB2YXIgcmV0ID0gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdpbml0JykpXG4gIGl0ZXJhYmxlLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGlkeCkge1xuICAgIHJldCA9IHJldC5jYXRjaChlID0+IGl0ZXJhdGVlKGl0ZW0sIGlkeCwgaXRlcmFibGUpKVxuICB9KVxuICByZXR1cm4gcmV0XG59XG5cbi8qXG4gKiBDYWxsIGZ1bmN0aW9ucyBpbiBzZXJpYWwgdW50aWwgc29tZW9uZSByZWplY3RlZC5cbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZXJhYmxlIHRoZSBhcnJheSB0byBpdGVyYXRlIHdpdGguXG4gKiBAcGFyYW0ge0FycmF5fSBpdGVyYXRlZSByZXR1cm5zIGEgbmV3IHByb21pc2UuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleCwgaXRlcmFibGUpLlxuICovXG5mdW5jdGlvbiBtYXBTZXJpZXMgKGl0ZXJhYmxlLCBpdGVyYXRlZSkge1xuICB2YXIgcmV0ID0gUHJvbWlzZS5yZXNvbHZlKCdpbml0JylcbiAgdmFyIHJlc3VsdCA9IFtdXG4gIGl0ZXJhYmxlLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGlkeCkge1xuICAgIHJldCA9IHJldFxuICAgICAgLnRoZW4oKCkgPT4gaXRlcmF0ZWUoaXRlbSwgaWR4LCBpdGVyYWJsZSkpXG4gICAgICAudGhlbih4ID0+IHJlc3VsdC5wdXNoKHgpKVxuICB9KVxuICByZXR1cm4gcmV0LnRoZW4oKCkgPT4gcmVzdWx0KVxufVxuXG5leHBvcnRzLmFueVNlcmllcyA9IGFueVNlcmllc1xuZXhwb3J0cy5tYXBTZXJpZXMgPSBtYXBTZXJpZXNcbiIsInZhciBtb250aE5hbWVzID0gW1xuICAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsXG4gICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlcidcbl1cbnZhciBtb250aE5hbWVzU2hvcnQgPSBbXG4gICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLFxuICAnTm92JywgJ0RlYydcbl1cbnZhciBkYXlOYW1lcyA9IFtcbiAgJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J1xuXVxudmFyIGRheU5hbWVzU2hvcnQgPSBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddXG52YXIgc3VmZml4ZXMgPSB7XG4gIDE6ICdzdCcsXG4gIDI6ICduZCcsXG4gIDM6ICdyZCcsXG4gICdkZWZhdWx0JzogJ3RoJ1xufVxuXG4vLyBwcm90b3R5cGUgZXh0ZW5zaW9uc1xudmFyIF9kYXRlID0ge1xuICBkYXlzSW5Nb250aDogZnVuY3Rpb24gKGQpIHtcbiAgICB2YXIgZmViID0gX2RhdGUuaXNMZWFwWWVhcihkKSA/IDI5IDogMjhcbiAgICByZXR1cm4gWzMxLCBmZWIsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXVxuICB9LFxuXG4gIGdldERheU9mWWVhcjogZnVuY3Rpb24gKGQpIHtcbiAgICB2YXIgbnVtID0gMFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZC5nZXRNb250aCgpOyArK2kpIHtcbiAgICAgIG51bSArPSBfZGF0ZS5kYXlzSW5Nb250aChkKVtpXVxuICAgIH1cbiAgICByZXR1cm4gbnVtICsgZC5nZXREYXRlKClcbiAgfSxcblxuICAvLyBTdGFydGRheSBpcyBhbiBpbnRlZ2VyIG9mIHdoaWNoIGRheSB0byBzdGFydCB0aGUgd2VlayBtZWFzdXJpbmcgZnJvbVxuICAvLyBUT0RPOiB0aGF0IGNvbW1lbnQgd2FzIHJldGFydGVkLiBmaXggaXQuXG4gIGdldFdlZWtPZlllYXI6IGZ1bmN0aW9uIChkLCBzdGFydERheSkge1xuICAgIC8vIFNraXAgdG8gc3RhcnREYXkgb2YgdGhpcyB3ZWVrXG4gICAgdmFyIG5vdyA9IHRoaXMuZ2V0RGF5T2ZZZWFyKGQpICsgKHN0YXJ0RGF5IC0gZC5nZXREYXkoKSlcbiAgICAvLyBGaW5kIHRoZSBmaXJzdCBzdGFydERheSBvZiB0aGUgeWVhclxuICAgIHZhciBqYW4xID0gbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCAwLCAxKVxuICAgIHZhciB0aGVuID0gKDcgLSBqYW4xLmdldERheSgpICsgc3RhcnREYXkpXG4gICAgcmV0dXJuIF9udW1iZXIucGFkKE1hdGguZmxvb3IoKG5vdyAtIHRoZW4pIC8gNykgKyAxLCAyKVxuICB9LFxuXG4gIGlzTGVhcFllYXI6IGZ1bmN0aW9uIChkKSB7XG4gICAgdmFyIHllYXIgPSBkLmdldEZ1bGxZZWFyKClcbiAgICByZXR1cm4gISEoKHllYXIgJiAzKSA9PT0gMCAmJiAoeWVhciAlIDEwMCB8fCAoeWVhciAlIDQwMCA9PT0gMCAmJiB5ZWFyKSkpXG4gIH0sXG5cbiAgZ2V0U3VmZml4OiBmdW5jdGlvbiAoZCkge1xuICAgIHZhciBzdHIgPSBkLmdldERhdGUoKS50b1N0cmluZygpXG4gICAgdmFyIGluZGV4ID0gcGFyc2VJbnQoc3RyLnNsaWNlKC0xKSlcbiAgICByZXR1cm4gc3VmZml4ZXNbaW5kZXhdIHx8IHN1ZmZpeGVzWydkZWZhdWx0J11cbiAgfSxcblxuICBjZW50dXJ5OiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBwYXJzZUludChkLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMiksIDEwKVxuICB9XG59XG5cbnZhciBfbnVtYmVyID0ge1xuICBwYWQ6IGZ1bmN0aW9uICh2YWx1ZSwgc2l6ZSwgY2gpIHtcbiAgICBpZiAoIWNoKSBjaCA9ICcwJ1xuICAgIHZhciByZXN1bHQgPSB2YWx1ZS50b1N0cmluZygpXG4gICAgdmFyIHBhZCA9IHNpemUgLSByZXN1bHQubGVuZ3RoXG5cbiAgICB3aGlsZSAocGFkLS0gPiAwKSB7XG4gICAgICByZXN1bHQgPSBjaCArIHJlc3VsdFxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG52YXIgZm9ybWF0Q29kZXMgPSB7XG4gIGE6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGRheU5hbWVzU2hvcnRbZC5nZXREYXkoKV1cbiAgfSxcbiAgQTogZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZGF5TmFtZXNbZC5nZXREYXkoKV1cbiAgfSxcbiAgYjogZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gbW9udGhOYW1lc1Nob3J0W2QuZ2V0TW9udGgoKV1cbiAgfSxcbiAgQjogZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gbW9udGhOYW1lc1tkLmdldE1vbnRoKCldXG4gIH0sXG4gIGM6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGQudG9Mb2NhbGVTdHJpbmcoKVxuICB9LFxuICBDOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfZGF0ZS5jZW50dXJ5KGQpXG4gIH0sXG4gIGQ6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIF9udW1iZXIucGFkKGQuZ2V0RGF0ZSgpLCAyKVxuICB9LFxuICBlOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfbnVtYmVyLnBhZChkLmdldERhdGUoKSwgMiwgJyAnKVxuICB9LFxuICBIOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfbnVtYmVyLnBhZChkLmdldEhvdXJzKCksIDIpXG4gIH0sXG4gIEk6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIF9udW1iZXIucGFkKGQuZ2V0SG91cnMoKSAlIDEyIHx8IDEyLCAyKVxuICB9LFxuICBqOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfbnVtYmVyLnBhZChfZGF0ZS5nZXREYXlPZlllYXIoZCksIDMpXG4gIH0sXG4gIGs6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIF9udW1iZXIucGFkKGQuZ2V0SG91cnMoKSwgMiwgJyAnKVxuICB9LFxuICBsOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfbnVtYmVyLnBhZChkLmdldEhvdXJzKCkgJSAxMiB8fCAxMiwgMiwgJyAnKVxuICB9LFxuICBMOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfbnVtYmVyLnBhZChkLmdldE1pbGxpc2Vjb25kcygpLCAzKVxuICB9LFxuICBtOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfbnVtYmVyLnBhZChkLmdldE1vbnRoKCkgKyAxLCAyKVxuICB9LFxuICBNOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfbnVtYmVyLnBhZChkLmdldE1pbnV0ZXMoKSwgMilcbiAgfSxcbiAgcDogZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gKGQuZ2V0SG91cnMoKSA8IDEyID8gJ0FNJyA6ICdQTScpXG4gIH0sXG4gIFA6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIChkLmdldEhvdXJzKCkgPCAxMiA/ICdhbScgOiAncG0nKVxuICB9LFxuICBxOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBfZGF0ZS5nZXRTdWZmaXgoZClcbiAgfSxcbiAgczogZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChkLnZhbHVlT2YoKSAvIDEwMDApXG4gIH0sXG4gIFM6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIF9udW1iZXIucGFkKGQuZ2V0U2Vjb25kcygpLCAyKVxuICB9LFxuICB1OiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkLmdldERheSgpIHx8IDdcbiAgfSxcbiAgVTogZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gX2RhdGUuZ2V0V2Vla09mWWVhcihkLCAwKVxuICB9LFxuICB3OiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkLmdldERheSgpXG4gIH0sXG4gIFc6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIF9kYXRlLmdldFdlZWtPZlllYXIoZCwgMSlcbiAgfSxcbiAgeDogZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZC50b0xvY2FsZURhdGVTdHJpbmcoKVxuICB9LFxuICBYOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkLnRvTG9jYWxlVGltZVN0cmluZygpXG4gIH0sXG4gIHk6IGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGQuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpLnN1YnN0cmluZygyLCA0KVxuICB9LFxuICBZOiBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkLmdldEZ1bGxZZWFyKClcbiAgfSxcbiAgejogZnVuY3Rpb24gKGQpIHtcbiAgICB2YXIgdHogPSBkLmdldFRpbWV6b25lT2Zmc2V0KCkgLyA2MCAqIDEwMFxuICAgIHJldHVybiAodHogPiAwID8gJy0nIDogJysnKSArIF9udW1iZXIucGFkKE1hdGguYWJzKHR6KSwgNClcbiAgfSxcbiAgJyUnOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICclJ1xuICB9XG59XG5mb3JtYXRDb2Rlcy5oID0gZm9ybWF0Q29kZXMuYlxuZm9ybWF0Q29kZXMuTiA9IGZvcm1hdENvZGVzLkxcblxudmFyIHN0cmZ0aW1lID0gZnVuY3Rpb24gKGQsIGZvcm1hdCkge1xuICB2YXIgb3V0cHV0ID0gJydcbiAgdmFyIHJlbWFpbmluZyA9IGZvcm1hdFxuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdmFyIHIgPSAvJS4vZ1xuICAgIHZhciByZXN1bHRzID0gci5leGVjKHJlbWFpbmluZylcblxuICAgIC8vIE5vIG1vcmUgZm9ybWF0IGNvZGVzLiBBZGQgdGhlIHJlbWFpbmluZyB0ZXh0IGFuZCByZXR1cm5cbiAgICBpZiAoIXJlc3VsdHMpIHtcbiAgICAgIHJldHVybiBvdXRwdXQgKyByZW1haW5pbmdcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIHByZWNlZGluZyB0ZXh0XG4gICAgb3V0cHV0ICs9IHJlbWFpbmluZy5zbGljZSgwLCByLmxhc3RJbmRleCAtIDIpXG4gICAgcmVtYWluaW5nID0gcmVtYWluaW5nLnNsaWNlKHIubGFzdEluZGV4KVxuXG4gICAgLy8gQWRkIHRoZSBmb3JtYXQgY29kZVxuICAgIHZhciBjaCA9IHJlc3VsdHNbMF0uY2hhckF0KDEpXG4gICAgdmFyIGZ1bmMgPSBmb3JtYXRDb2Rlc1tjaF1cbiAgICBvdXRwdXQgKz0gZnVuYyA/IGZ1bmMuY2FsbCh0aGlzLCBkKSA6ICclJyArIGNoXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHJmdGltZVxuIiwiY29uc3QgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbi8qXG4gKiBDaGVja3MgaWYgdmFsdWUgaXMgY2xhc3NpZmllZCBhcyBhIFN0cmluZyBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB2YWx1ZSBpcyBhIHN0cmluZywgZWxzZSBmYWxzZS5cbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcgKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXG59XG5cbmZ1bmN0aW9uIGlzTmlsICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBpc0FycmF5ICh2YWx1ZSkge1xuICAvLyBiZSBjb21wYXRpYmxlIHdpdGggSUUgOFxuICByZXR1cm4gdG9TdHIuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSdcbn1cblxuZnVuY3Rpb24gaXNFcnJvciAodmFsdWUpIHtcbiAgdmFyIHNpZ25hdHVyZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSlcbiAgLy8gW29iamVjdCBYWFhFcnJvcl1cbiAgcmV0dXJuIHNpZ25hdHVyZS5zdWJzdHIoLTYsIDUpID09PSAnRXJyb3InIHx8XG4gICAgICAgICh0eXBlb2YgdmFsdWUubWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlLm5hbWUgPT09ICdzdHJpbmcnKVxufVxuXG4vKlxuICogSXRlcmF0ZXMgb3ZlciBvd24gZW51bWVyYWJsZSBzdHJpbmcga2V5ZWQgcHJvcGVydGllcyBvZiBhbiBvYmplY3QgYW5kIGludm9rZXMgaXRlcmF0ZWUgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBrZXksIG9iamVjdCkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGZhbHNlLlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBmb3JPd24gKG9iamVjdCwgaXRlcmF0ZWUpIHtcbiAgb2JqZWN0ID0gb2JqZWN0IHx8IHt9XG4gIGZvciAodmFyIGsgaW4gb2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgaWYgKGl0ZXJhdGVlKG9iamVjdFtrXSwgaywgb2JqZWN0KSA9PT0gZmFsc2UpIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Rcbn1cblxuLypcbiAqIEFzc2lnbnMgb3duIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdHMgdG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIFNvdXJjZSBvYmplY3RzIGFyZSBhcHBsaWVkIGZyb20gbGVmdCB0byByaWdodC5cbiAqIFN1YnNlcXVlbnQgc291cmNlcyBvdmVyd3JpdGUgcHJvcGVydHkgYXNzaWdubWVudHMgb2YgcHJldmlvdXMgc291cmNlcy5cbiAqXG4gKiBOb3RlOiBUaGlzIG1ldGhvZCBtdXRhdGVzIG9iamVjdCBhbmQgaXMgbG9vc2VseSBiYXNlZCBvbiBPYmplY3QuYXNzaWduLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBzb3VyY2VzIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGFzc2lnbiAob2JqZWN0KSB7XG4gIG9iamVjdCA9IGlzT2JqZWN0KG9iamVjdCkgPyBvYmplY3QgOiB7fVxuICB2YXIgc3JjcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgc3Jjcy5mb3JFYWNoKGZ1bmN0aW9uIChzcmMpIHtcbiAgICBfYXNzaWduQmluYXJ5KG9iamVjdCwgc3JjKVxuICB9KVxuICByZXR1cm4gb2JqZWN0XG59XG5cbmZ1bmN0aW9uIF9hc3NpZ25CaW5hcnkgKGRzdCwgc3JjKSB7XG4gIGZvck93bihzcmMsIGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgZHN0W2tdID0gdlxuICB9KVxuICByZXR1cm4gZHN0XG59XG5cbmZ1bmN0aW9uIGxhc3QgKGFycikge1xuICByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXVxufVxuXG5mdW5jdGlvbiB1bmlxIChhcnIpIHtcbiAgdmFyIHUgPSB7fVxuICB2YXIgYSA9IFtdXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmICh1Lmhhc093blByb3BlcnR5KGFycltpXSkpIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGEucHVzaChhcnJbaV0pXG4gICAgdVthcnJbaV1dID0gMVxuICB9XG4gIHJldHVybiBhXG59XG5cbi8qXG4gKiBDaGVja3MgaWYgdmFsdWUgaXMgdGhlIGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0LlxuICogKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIG5ldyBOdW1iZXIoMCksIGFuZCBuZXcgU3RyaW5nKCcnKSlcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgdmFsdWUgaXMgYW4gb2JqZWN0LCBlbHNlIGZhbHNlLlxuICovXG5mdW5jdGlvbiBpc09iamVjdCAodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWVcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT09ICdvYmplY3QnIHx8IHR5cGUgPT09ICdmdW5jdGlvbicpXG59XG5cbi8qXG4gKiBBIGZ1bmN0aW9uIHRvIGNyZWF0ZSBmbGV4aWJseS1udW1iZXJlZCBsaXN0cyBvZiBpbnRlZ2VycyxcbiAqIGhhbmR5IGZvciBlYWNoIGFuZCBtYXAgbG9vcHMuIHN0YXJ0LCBpZiBvbWl0dGVkLCBkZWZhdWx0cyB0byAwOyBzdGVwIGRlZmF1bHRzIHRvIDEuXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiBpbnRlZ2VycyBmcm9tIHN0YXJ0IChpbmNsdXNpdmUpIHRvIHN0b3AgKGV4Y2x1c2l2ZSksXG4gKiBpbmNyZW1lbnRlZCAob3IgZGVjcmVtZW50ZWQpIGJ5IHN0ZXAsIGV4Y2x1c2l2ZS5cbiAqIE5vdGUgdGhhdCByYW5nZXMgdGhhdCBzdG9wIGJlZm9yZSB0aGV5IHN0YXJ0IGFyZSBjb25zaWRlcmVkIHRvIGJlIHplcm8tbGVuZ3RoIGluc3RlYWQgb2ZcbiAqIG5lZ2F0aXZlIOKAlCBpZiB5b3UnZCBsaWtlIGEgbmVnYXRpdmUgcmFuZ2UsIHVzZSBhIG5lZ2F0aXZlIHN0ZXAuXG4gKi9cbmZ1bmN0aW9uIHJhbmdlIChzdGFydCwgc3RvcCwgc3RlcCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHN0b3AgPSBzdGFydFxuICAgIHN0YXJ0ID0gMFxuICB9XG4gIHN0ZXAgPSBzdGVwIHx8IDFcblxuICB2YXIgYXJyID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgc3RvcDsgaSArPSBzdGVwKSB7XG4gICAgYXJyLnB1c2goaSlcbiAgfVxuICByZXR1cm4gYXJyXG59XG5cbi8vIGxhbmdcbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZ1xuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5XG5leHBvcnRzLmlzTmlsID0gaXNOaWxcbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3JcblxuLy8gYXJyYXlcbmV4cG9ydHMucmFuZ2UgPSByYW5nZVxuZXhwb3J0cy5sYXN0ID0gbGFzdFxuXG4vLyBvYmplY3RcbmV4cG9ydHMuZm9yT3duID0gZm9yT3duXG5leHBvcnRzLmFzc2lnbiA9IGFzc2lnblxuZXhwb3J0cy51bmlxID0gdW5pcVxuIiwiY29uc3QgXyA9IHJlcXVpcmUoJy4vdXRpbC91bmRlcnNjb3JlLmpzJylcblxuZnVuY3Rpb24gd2hpdGVTcGFjZUN0cmwgKHRva2Vucywgb3B0aW9ucykge1xuICBvcHRpb25zID0gXy5hc3NpZ24oeyBncmVlZHk6IHRydWUgfSwgb3B0aW9ucylcbiAgdmFyIGluUmF3ID0gZmFsc2VcblxuICB0b2tlbnMuZm9yRWFjaCgodG9rZW4sIGkpID0+IHtcbiAgICBpZiAoc2hvdWxkVHJpbUxlZnQodG9rZW4sIGluUmF3LCBvcHRpb25zKSkge1xuICAgICAgdHJpbUxlZnQodG9rZW5zW2kgLSAxXSwgb3B0aW9ucy5ncmVlZHkpXG4gICAgfVxuXG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICd0YWcnICYmIHRva2VuLm5hbWUgPT09ICdyYXcnKSBpblJhdyA9IHRydWVcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycgJiYgdG9rZW4ubmFtZSA9PT0gJ2VuZHJhdycpIGluUmF3ID0gZmFsc2VcblxuICAgIGlmIChzaG91bGRUcmltUmlnaHQodG9rZW4sIGluUmF3LCBvcHRpb25zKSkge1xuICAgICAgdHJpbVJpZ2h0KHRva2Vuc1tpICsgMV0sIG9wdGlvbnMuZ3JlZWR5KVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gc2hvdWxkVHJpbUxlZnQgKHRva2VuLCBpblJhdywgb3B0aW9ucykge1xuICBpZiAoaW5SYXcpIHJldHVybiBmYWxzZVxuICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHJldHVybiB0b2tlbi50cmltX2xlZnQgfHwgb3B0aW9ucy50cmltX3RhZ19sZWZ0XG4gIGlmICh0b2tlbi50eXBlID09PSAndmFsdWUnKSByZXR1cm4gdG9rZW4udHJpbV9sZWZ0IHx8IG9wdGlvbnMudHJpbV92YWx1ZV9sZWZ0XG59XG5cbmZ1bmN0aW9uIHNob3VsZFRyaW1SaWdodCAodG9rZW4sIGluUmF3LCBvcHRpb25zKSB7XG4gIGlmIChpblJhdykgcmV0dXJuIGZhbHNlXG4gIGlmICh0b2tlbi50eXBlID09PSAndGFnJykgcmV0dXJuIHRva2VuLnRyaW1fcmlnaHQgfHwgb3B0aW9ucy50cmltX3RhZ19yaWdodFxuICBpZiAodG9rZW4udHlwZSA9PT0gJ3ZhbHVlJykgcmV0dXJuIHRva2VuLnRyaW1fcmlnaHQgfHwgb3B0aW9ucy50cmltX3ZhbHVlX3JpZ2h0XG59XG5cbmZ1bmN0aW9uIHRyaW1MZWZ0ICh0b2tlbiwgZ3JlZWR5KSB7XG4gIGlmICghdG9rZW4gfHwgdG9rZW4udHlwZSAhPT0gJ2h0bWwnKSByZXR1cm5cblxuICB2YXIgckxlZnQgPSBncmVlZHkgPyAvXFxzKyQvZyA6IC9bXFx0XFxyIF0qJC9nXG4gIHRva2VuLnZhbHVlID0gdG9rZW4udmFsdWUucmVwbGFjZShyTGVmdCwgJycpXG59XG5cbmZ1bmN0aW9uIHRyaW1SaWdodCAodG9rZW4sIGdyZWVkeSkge1xuICBpZiAoIXRva2VuIHx8IHRva2VuLnR5cGUgIT09ICdodG1sJykgcmV0dXJuXG5cbiAgdmFyIHJSaWdodCA9IGdyZWVkeSA/IC9eXFxzKy9nIDogL15bXFx0XFxyIF0qXFxuPy9nXG4gIHRva2VuLnZhbHVlID0gdG9rZW4udmFsdWUucmVwbGFjZShyUmlnaHQsICcnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdoaXRlU3BhY2VDdHJsXG4iLCJjb25zdCBMaXF1aWQgPSByZXF1aXJlKCcuLicpXG5jb25zdCBsZXhpY2FsID0gTGlxdWlkLmxleGljYWxcbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdhbnktcHJvbWlzZScpXG5jb25zdCByZSA9IG5ldyBSZWdFeHAoYCgke2xleGljYWwuaWRlbnRpZmllci5zb3VyY2V9KVxcXFxzKj0oLiopYClcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4uL3NyYy91dGlsL2Fzc2VydC5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpcXVpZCkge1xuICBsaXF1aWQucmVnaXN0ZXJUYWcoJ2Fzc2lnbicsIHtcbiAgICBwYXJzZTogZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICB2YXIgbWF0Y2ggPSB0b2tlbi5hcmdzLm1hdGNoKHJlKVxuICAgICAgYXNzZXJ0KG1hdGNoLCBgaWxsZWdhbCB0b2tlbiAke3Rva2VuLnJhd31gKVxuICAgICAgdGhpcy5rZXkgPSBtYXRjaFsxXVxuICAgICAgdGhpcy52YWx1ZSA9IG1hdGNoWzJdXG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgc2NvcGUuc2V0KHRoaXMua2V5LCBsaXF1aWQuZXZhbFZhbHVlKHRoaXMudmFsdWUsIHNjb3BlKSlcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoJycpXG4gICAgfVxuICB9KVxufVxuIiwiY29uc3QgTGlxdWlkID0gcmVxdWlyZSgnLi4nKTtcbmNvbnN0IGxleGljYWwgPSBMaXF1aWQubGV4aWNhbDtcbmNvbnN0IHJlID0gbmV3IFJlZ0V4cChgKCR7bGV4aWNhbC5pZGVudGlmaWVyLnNvdXJjZX0pYCk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCcuLi9zcmMvdXRpbC9hc3NlcnQuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXF1aWQpIHtcblxuICAgIGxpcXVpZC5yZWdpc3RlclRhZygnY2FwdHVyZScsIHtcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uKHRhZ1Rva2VuLCByZW1haW5Ub2tlbnMpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IHRhZ1Rva2VuLmFyZ3MubWF0Y2gocmUpO1xuICAgICAgICAgICAgYXNzZXJ0KG1hdGNoLCBgJHt0YWdUb2tlbi5hcmdzfSBub3QgdmFsaWQgaWRlbnRpZmllcmApO1xuXG4gICAgICAgICAgICB0aGlzLnZhcmlhYmxlID0gbWF0Y2hbMV07XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlcyA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgc3RyZWFtID0gbGlxdWlkLnBhcnNlci5wYXJzZVN0cmVhbShyZW1haW5Ub2tlbnMpO1xuICAgICAgICAgICAgc3RyZWFtLm9uKCd0YWc6ZW5kY2FwdHVyZScsIHRva2VuID0+IHN0cmVhbS5zdG9wKCkpXG4gICAgICAgICAgICAgICAgLm9uKCd0ZW1wbGF0ZScsIHRwbCA9PiB0aGlzLnRlbXBsYXRlcy5wdXNoKHRwbCkpXG4gICAgICAgICAgICAgICAgLm9uKCdlbmQnLCB4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0YWcgJHt0YWdUb2tlbi5yYXd9IG5vdCBjbG9zZWRgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0cmVhbS5zdGFydCgpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKHNjb3BlLCBoYXNoKSB7XG4gICAgICAgICAgICByZXR1cm4gbGlxdWlkLnJlbmRlcmVyLnJlbmRlclRlbXBsYXRlcyh0aGlzLnRlbXBsYXRlcywgc2NvcGUpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGh0bWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuc2V0KHRoaXMudmFyaWFibGUsIGh0bWwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn07XG4iLCJjb25zdCBMaXF1aWQgPSByZXF1aXJlKCcuLicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpcXVpZCkge1xuICBsaXF1aWQucmVnaXN0ZXJUYWcoJ2Nhc2UnLCB7XG5cbiAgICBwYXJzZTogZnVuY3Rpb24gKHRhZ1Rva2VuLCByZW1haW5Ub2tlbnMpIHtcbiAgICAgIHRoaXMuY29uZCA9IHRhZ1Rva2VuLmFyZ3NcbiAgICAgIHRoaXMuY2FzZXMgPSBbXVxuICAgICAgdGhpcy5lbHNlVGVtcGxhdGVzID0gW11cblxuICAgICAgdmFyIHAgPSBbXVxuICAgICAgdmFyIHN0cmVhbSA9IGxpcXVpZC5wYXJzZXIucGFyc2VTdHJlYW0ocmVtYWluVG9rZW5zKVxuICAgICAgICAub24oJ3RhZzp3aGVuJywgdG9rZW4gPT4ge1xuICAgICAgICAgIHRoaXMuY2FzZXMucHVzaCh7XG4gICAgICAgICAgICB2YWw6IHRva2VuLmFyZ3MsXG4gICAgICAgICAgICB0ZW1wbGF0ZXM6IHAgPSBbXVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIC5vbigndGFnOmVsc2UnLCAoKSA9PiAocCA9IHRoaXMuZWxzZVRlbXBsYXRlcykpXG4gICAgICAgIC5vbigndGFnOmVuZGNhc2UnLCB0b2tlbiA9PiBzdHJlYW0uc3RvcCgpKVxuICAgICAgICAub24oJ3RlbXBsYXRlJywgdHBsID0+IHAucHVzaCh0cGwpKVxuICAgICAgICAub24oJ2VuZCcsIHggPT4ge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGFnICR7dGFnVG9rZW4ucmF3fSBub3QgY2xvc2VkYClcbiAgICAgICAgfSlcblxuICAgICAgc3RyZWFtLnN0YXJ0KClcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoc2NvcGUsIGhhc2gpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jYXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYnJhbmNoID0gdGhpcy5jYXNlc1tpXVxuICAgICAgICB2YXIgdmFsID0gTGlxdWlkLmV2YWxFeHAoYnJhbmNoLnZhbCwgc2NvcGUpXG4gICAgICAgIHZhciBjb25kID0gTGlxdWlkLmV2YWxFeHAodGhpcy5jb25kLCBzY29wZSlcbiAgICAgICAgaWYgKHZhbCA9PT0gY29uZCkge1xuICAgICAgICAgIHJldHVybiBsaXF1aWQucmVuZGVyZXIucmVuZGVyVGVtcGxhdGVzKGJyYW5jaC50ZW1wbGF0ZXMsIHNjb3BlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbGlxdWlkLnJlbmRlcmVyLnJlbmRlclRlbXBsYXRlcyh0aGlzLmVsc2VUZW1wbGF0ZXMsIHNjb3BlKVxuICAgIH1cbiAgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlxdWlkKSB7XG5cbiAgICBsaXF1aWQucmVnaXN0ZXJUYWcoJ2NvbW1lbnQnLCB7XG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbih0YWdUb2tlbiwgcmVtYWluVG9rZW5zKSB7XG4gICAgICAgICAgICB2YXIgc3RyZWFtID0gbGlxdWlkLnBhcnNlci5wYXJzZVN0cmVhbShyZW1haW5Ub2tlbnMpO1xuICAgICAgICAgICAgc3RyZWFtXG4gICAgICAgICAgICAgICAgLm9uKCd0b2tlbicsIHRva2VuID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYodG9rZW4ubmFtZSA9PT0gJ2VuZGNvbW1lbnQnKSBzdHJlYW0uc3RvcCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uKCdlbmQnLCB4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0YWcgJHt0YWdUb2tlbi5yYXd9IG5vdCBjbG9zZWRgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0cmVhbS5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn07XG4iLCJjb25zdCBMaXF1aWQgPSByZXF1aXJlKCcuLicpXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYW55LXByb21pc2UnKVxuY29uc3QgbGV4aWNhbCA9IExpcXVpZC5sZXhpY2FsXG5jb25zdCBncm91cFJFID0gbmV3IFJlZ0V4cChgXig/Oigke2xleGljYWwudmFsdWUuc291cmNlfSlcXFxccyo6XFxcXHMqKT8oLiopJGApXG5jb25zdCBjYW5kaWRhdGVzUkUgPSBuZXcgUmVnRXhwKGxleGljYWwudmFsdWUuc291cmNlLCAnZycpXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCcuLi9zcmMvdXRpbC9hc3NlcnQuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXF1aWQpIHtcbiAgbGlxdWlkLnJlZ2lzdGVyVGFnKCdjeWNsZScsIHtcblxuICAgIHBhcnNlOiBmdW5jdGlvbiAodGFnVG9rZW4sIHJlbWFpblRva2Vucykge1xuICAgICAgdmFyIG1hdGNoID0gZ3JvdXBSRS5leGVjKHRhZ1Rva2VuLmFyZ3MpXG4gICAgICBhc3NlcnQobWF0Y2gsIGBpbGxlZ2FsIHRhZzogJHt0YWdUb2tlbi5yYXd9YClcblxuICAgICAgdGhpcy5ncm91cCA9IG1hdGNoWzFdIHx8ICcnXG4gICAgICB2YXIgY2FuZGlkYXRlcyA9IG1hdGNoWzJdXG5cbiAgICAgIHRoaXMuY2FuZGlkYXRlcyA9IFtdXG5cbiAgICAgIHdoaWxlICgobWF0Y2ggPSBjYW5kaWRhdGVzUkUuZXhlYyhjYW5kaWRhdGVzKSkpIHtcbiAgICAgICAgdGhpcy5jYW5kaWRhdGVzLnB1c2gobWF0Y2hbMF0pXG4gICAgICB9XG4gICAgICBhc3NlcnQodGhpcy5jYW5kaWRhdGVzLmxlbmd0aCwgYGVtcHR5IGNhbmRpZGF0ZXM6ICR7dGFnVG9rZW4ucmF3fWApXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKHNjb3BlLCBoYXNoKSB7XG4gICAgICB2YXIgZ3JvdXAgPSBMaXF1aWQuZXZhbFZhbHVlKHRoaXMuZ3JvdXAsIHNjb3BlKVxuICAgICAgdmFyIGZpbmdlcnByaW50ID0gYGN5Y2xlOiR7Z3JvdXB9OmAgKyB0aGlzLmNhbmRpZGF0ZXMuam9pbignLCcpXG5cbiAgICAgIHZhciBncm91cHMgPSBzY29wZS5vcHRzLmdyb3VwcyA9IHNjb3BlLm9wdHMuZ3JvdXBzIHx8IHt9XG4gICAgICB2YXIgaWR4ID0gZ3JvdXBzW2ZpbmdlcnByaW50XVxuXG4gICAgICBpZiAoaWR4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWR4ID0gZ3JvdXBzW2ZpbmdlcnByaW50XSA9IDBcbiAgICAgIH1cblxuICAgICAgdmFyIGNhbmRpZGF0ZSA9IHRoaXMuY2FuZGlkYXRlc1tpZHhdXG4gICAgICBpZHggPSAoaWR4ICsgMSkgJSB0aGlzLmNhbmRpZGF0ZXMubGVuZ3RoXG4gICAgICBncm91cHNbZmluZ2VycHJpbnRdID0gaWR4XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoTGlxdWlkLmV2YWxWYWx1ZShjYW5kaWRhdGUsIHNjb3BlKSlcbiAgICB9XG4gIH0pXG59XG4iLCJjb25zdCBMaXF1aWQgPSByZXF1aXJlKCcuLicpO1xuY29uc3QgbGV4aWNhbCA9IExpcXVpZC5sZXhpY2FsO1xuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSgnLi4vc3JjL3V0aWwvYXNzZXJ0LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlxdWlkKSB7XG5cbiAgICBsaXF1aWQucmVnaXN0ZXJUYWcoJ2RlY3JlbWVudCcsIHtcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSB0b2tlbi5hcmdzLm1hdGNoKGxleGljYWwuaWRlbnRpZmllcik7XG4gICAgICAgICAgICBhc3NlcnQobWF0Y2gsIGBpbGxlZ2FsIGlkZW50aWZpZXIgJHt0b2tlbi5hcmdzfWApO1xuICAgICAgICAgICAgdGhpcy52YXJpYWJsZSA9IG1hdGNoWzBdO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKHNjb3BlLCBoYXNoKSB7XG4gICAgICAgICAgICB2YXIgdiA9IHNjb3BlLmdldCh0aGlzLnZhcmlhYmxlKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiAhPT0gJ251bWJlcicpIHYgPSAwO1xuICAgICAgICAgICAgc2NvcGUuc2V0KHRoaXMudmFyaWFibGUsIHYgLSAxKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59O1xuIiwiY29uc3QgTGlxdWlkID0gcmVxdWlyZSgnLi4nKVxuY29uc3QgbGV4aWNhbCA9IExpcXVpZC5sZXhpY2FsXG5jb25zdCBtYXBTZXJpZXMgPSByZXF1aXJlKCcuLi9zcmMvdXRpbC9wcm9taXNlLmpzJykubWFwU2VyaWVzXG5jb25zdCBfID0gcmVxdWlyZSgnLi4vc3JjL3V0aWwvdW5kZXJzY29yZS5qcycpXG5jb25zdCBSZW5kZXJCcmVha0Vycm9yID0gTGlxdWlkLlR5cGVzLlJlbmRlckJyZWFrRXJyb3JcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4uL3NyYy91dGlsL2Fzc2VydC5qcycpXG5jb25zdCByZSA9IG5ldyBSZWdFeHAoYF4oJHtsZXhpY2FsLmlkZW50aWZpZXIuc291cmNlfSlcXFxccytpblxcXFxzK2AgK1xuICAgIGAoJHtsZXhpY2FsLnZhbHVlLnNvdXJjZX0pYCArXG4gICAgYCg/OlxcXFxzKyR7bGV4aWNhbC5oYXNoLnNvdXJjZX0pKmAgK1xuICAgIGAoPzpcXFxccysocmV2ZXJzZWQpKT9gICtcbiAgICBgKD86XFxcXHMrJHtsZXhpY2FsLmhhc2guc291cmNlfSkqJGApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpcXVpZCkge1xuICBsaXF1aWQucmVnaXN0ZXJUYWcoJ2ZvcicsIHtcblxuICAgIHBhcnNlOiBmdW5jdGlvbiAodGFnVG9rZW4sIHJlbWFpblRva2Vucykge1xuICAgICAgdmFyIG1hdGNoID0gcmUuZXhlYyh0YWdUb2tlbi5hcmdzKVxuICAgICAgYXNzZXJ0KG1hdGNoLCBgaWxsZWdhbCB0YWc6ICR7dGFnVG9rZW4ucmF3fWApXG4gICAgICB0aGlzLnZhcmlhYmxlID0gbWF0Y2hbMV1cbiAgICAgIHRoaXMuY29sbGVjdGlvbiA9IG1hdGNoWzJdXG4gICAgICB0aGlzLnJldmVyc2VkID0gISFtYXRjaFszXVxuXG4gICAgICB0aGlzLnRlbXBsYXRlcyA9IFtdXG4gICAgICB0aGlzLmVsc2VUZW1wbGF0ZXMgPSBbXVxuXG4gICAgICB2YXIgcFxuICAgICAgdmFyIHN0cmVhbSA9IGxpcXVpZC5wYXJzZXIucGFyc2VTdHJlYW0ocmVtYWluVG9rZW5zKVxuICAgICAgICAub24oJ3N0YXJ0JywgKCkgPT4gKHAgPSB0aGlzLnRlbXBsYXRlcykpXG4gICAgICAgIC5vbigndGFnOmVsc2UnLCAoKSA9PiAocCA9IHRoaXMuZWxzZVRlbXBsYXRlcykpXG4gICAgICAgIC5vbigndGFnOmVuZGZvcicsICgpID0+IHN0cmVhbS5zdG9wKCkpXG4gICAgICAgIC5vbigndGVtcGxhdGUnLCB0cGwgPT4gcC5wdXNoKHRwbCkpXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGFnICR7dGFnVG9rZW4ucmF3fSBub3QgY2xvc2VkYClcbiAgICAgICAgfSlcblxuICAgICAgc3RyZWFtLnN0YXJ0KClcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoc2NvcGUsIGhhc2gpIHtcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gTGlxdWlkLmV2YWxFeHAodGhpcy5jb2xsZWN0aW9uLCBzY29wZSlcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbGxlY3Rpb24pKSB7XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGNvbGxlY3Rpb24pICYmIGNvbGxlY3Rpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbGxlY3Rpb24gPSBbY29sbGVjdGlvbl1cbiAgICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgY29sbGVjdGlvbiA9IE9iamVjdC5rZXlzKGNvbGxlY3Rpb24pLm1hcCgoa2V5KSA9PiBba2V5LCBjb2xsZWN0aW9uW2tleV1dKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29sbGVjdGlvbikgfHwgIWNvbGxlY3Rpb24ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBsaXF1aWQucmVuZGVyZXIucmVuZGVyVGVtcGxhdGVzKHRoaXMuZWxzZVRlbXBsYXRlcywgc2NvcGUpXG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aFxuICAgICAgdmFyIG9mZnNldCA9IGhhc2gub2Zmc2V0IHx8IDBcbiAgICAgIHZhciBsaW1pdCA9IChoYXNoLmxpbWl0ID09PSB1bmRlZmluZWQpID8gY29sbGVjdGlvbi5sZW5ndGggOiBoYXNoLmxpbWl0XG5cbiAgICAgIGNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGltaXQpXG4gICAgICBpZiAodGhpcy5yZXZlcnNlZCkgY29sbGVjdGlvbi5yZXZlcnNlKClcblxuICAgICAgdmFyIGNvbnRleHRzID0gY29sbGVjdGlvbi5tYXAoKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgdmFyIGN0eCA9IHt9XG4gICAgICAgIGN0eFt0aGlzLnZhcmlhYmxlXSA9IGl0ZW1cbiAgICAgICAgY3R4LmZvcmxvb3AgPSB7XG4gICAgICAgICAgZmlyc3Q6IGkgPT09IDAsXG4gICAgICAgICAgaW5kZXg6IGkgKyAxLFxuICAgICAgICAgIGluZGV4MDogaSxcbiAgICAgICAgICBsYXN0OiBpID09PSBsZW5ndGggLSAxLFxuICAgICAgICAgIGxlbmd0aDogbGVuZ3RoLFxuICAgICAgICAgIHJpbmRleDogbGVuZ3RoIC0gaSxcbiAgICAgICAgICByaW5kZXgwOiBsZW5ndGggLSBpIC0gMVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHhcbiAgICAgIH0pXG5cbiAgICAgIHZhciBodG1sID0gJydcbiAgICAgIHJldHVybiBtYXBTZXJpZXMoY29udGV4dHMsIChjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgIC50aGVuKCgpID0+IHNjb3BlLnB1c2goY29udGV4dCkpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gbGlxdWlkLnJlbmRlcmVyLnJlbmRlclRlbXBsYXRlcyh0aGlzLnRlbXBsYXRlcywgc2NvcGUpKVxuICAgICAgICAgIC50aGVuKHBhcnRpYWwgPT4gKGh0bWwgKz0gcGFydGlhbCkpXG4gICAgICAgICAgLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBSZW5kZXJCcmVha0Vycm9yKSB7XG4gICAgICAgICAgICAgIGh0bWwgKz0gZS5yZXNvbHZlZEhUTUxcbiAgICAgICAgICAgICAgaWYgKGUubWVzc2FnZSA9PT0gJ2NvbnRpbnVlJykgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbigoKSA9PiBzY29wZS5wb3AoKSlcbiAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgUmVuZGVyQnJlYWtFcnJvciAmJiBlLm1lc3NhZ2UgPT09ICdicmVhaycpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlXG4gICAgICB9KS50aGVuKCgpID0+IGh0bWwpXG4gICAgfVxuICB9KVxufVxuIiwiY29uc3QgTGlxdWlkID0gcmVxdWlyZSgnLi4nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXF1aWQpIHtcbiAgbGlxdWlkLnJlZ2lzdGVyVGFnKCdpZicsIHtcblxuICAgIHBhcnNlOiBmdW5jdGlvbiAodGFnVG9rZW4sIHJlbWFpblRva2Vucykge1xuICAgICAgdGhpcy5icmFuY2hlcyA9IFtdXG4gICAgICB0aGlzLmVsc2VUZW1wbGF0ZXMgPSBbXVxuXG4gICAgICB2YXIgcFxuICAgICAgdmFyIHN0cmVhbSA9IGxpcXVpZC5wYXJzZXIucGFyc2VTdHJlYW0ocmVtYWluVG9rZW5zKVxuICAgICAgICAub24oJ3N0YXJ0JywgKCkgPT4gdGhpcy5icmFuY2hlcy5wdXNoKHtcbiAgICAgICAgICBjb25kOiB0YWdUb2tlbi5hcmdzLFxuICAgICAgICAgIHRlbXBsYXRlczogKHAgPSBbXSlcbiAgICAgICAgfSkpXG4gICAgICAgIC5vbigndGFnOmVsc2lmJywgdG9rZW4gPT4ge1xuICAgICAgICAgIHRoaXMuYnJhbmNoZXMucHVzaCh7XG4gICAgICAgICAgICBjb25kOiB0b2tlbi5hcmdzLFxuICAgICAgICAgICAgdGVtcGxhdGVzOiBwID0gW11cbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICAub24oJ3RhZzplbHNlJywgKCkgPT4gKHAgPSB0aGlzLmVsc2VUZW1wbGF0ZXMpKVxuICAgICAgICAub24oJ3RhZzplbmRpZicsIHRva2VuID0+IHN0cmVhbS5zdG9wKCkpXG4gICAgICAgIC5vbigndGVtcGxhdGUnLCB0cGwgPT4gcC5wdXNoKHRwbCkpXG4gICAgICAgIC5vbignZW5kJywgeCA9PiB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0YWcgJHt0YWdUb2tlbi5yYXd9IG5vdCBjbG9zZWRgKVxuICAgICAgICB9KVxuXG4gICAgICBzdHJlYW0uc3RhcnQoKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIChzY29wZSwgaGFzaCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJyYW5jaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBicmFuY2ggPSB0aGlzLmJyYW5jaGVzW2ldXG4gICAgICAgIHZhciBjb25kID0gTGlxdWlkLmV2YWxFeHAoYnJhbmNoLmNvbmQsIHNjb3BlKVxuICAgICAgICBpZiAoTGlxdWlkLmlzVHJ1dGh5KGNvbmQpKSB7XG4gICAgICAgICAgcmV0dXJuIGxpcXVpZC5yZW5kZXJlci5yZW5kZXJUZW1wbGF0ZXMoYnJhbmNoLnRlbXBsYXRlcywgc2NvcGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBsaXF1aWQucmVuZGVyZXIucmVuZGVyVGVtcGxhdGVzKHRoaXMuZWxzZVRlbXBsYXRlcywgc2NvcGUpXG4gICAgfVxuICB9KVxufVxuIiwiY29uc3QgTGlxdWlkID0gcmVxdWlyZSgnLi4nKVxuY29uc3QgbGV4aWNhbCA9IExpcXVpZC5sZXhpY2FsXG5jb25zdCB3aXRoUkUgPSBuZXcgUmVnRXhwKGB3aXRoXFxcXHMrKCR7bGV4aWNhbC52YWx1ZS5zb3VyY2V9KWApXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCcuLi9zcmMvdXRpbC9hc3NlcnQuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXF1aWQpIHtcbiAgbGlxdWlkLnJlZ2lzdGVyVGFnKCdpbmNsdWRlJywge1xuICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgIHZhciBtYXRjaCA9IGxleGljYWwudmFsdWUuZXhlYyh0b2tlbi5hcmdzKVxuICAgICAgYXNzZXJ0KG1hdGNoLCBgaWxsZWdhbCB0b2tlbiAke3Rva2VuLnJhd31gKVxuICAgICAgdGhpcy52YWx1ZSA9IG1hdGNoWzBdXG5cbiAgICAgIG1hdGNoID0gd2l0aFJFLmV4ZWModG9rZW4uYXJncylcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICB0aGlzLndpdGggPSBtYXRjaFsxXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoc2NvcGUsIGhhc2gpIHtcbiAgICAgIHZhciBmaWxlcGF0aCA9IHRoaXMudmFsdWVcbiAgICAgIGlmIChzY29wZS5vcHRzLmR5bmFtaWNQYXJ0aWFscykge1xuICAgICAgICBmaWxlcGF0aCA9IExpcXVpZC5ldmFsVmFsdWUodGhpcy52YWx1ZSwgc2NvcGUpXG4gICAgICB9XG5cbiAgICAgIHZhciBvcmlnaW5CbG9ja3MgPSBzY29wZS5vcHRzLmJsb2Nrc1xuICAgICAgdmFyIG9yaWdpbkJsb2NrTW9kZSA9IHNjb3BlLm9wdHMuYmxvY2tNb2RlXG4gICAgICBzY29wZS5vcHRzLmJsb2NrcyA9IHt9XG4gICAgICBzY29wZS5vcHRzLmJsb2NrTW9kZSA9ICdvdXRwdXQnXG5cbiAgICAgIGlmICh0aGlzLndpdGgpIHtcbiAgICAgICAgaGFzaFtmaWxlcGF0aF0gPSBMaXF1aWQuZXZhbFZhbHVlKHRoaXMud2l0aCwgc2NvcGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbGlxdWlkLmdldFRlbXBsYXRlKGZpbGVwYXRoLCBzY29wZS5vcHRzLnJvb3QpXG4gICAgICAgIC50aGVuKCh0ZW1wbGF0ZXMpID0+IHtcbiAgICAgICAgICBzY29wZS5wdXNoKGhhc2gpXG4gICAgICAgICAgcmV0dXJuIGxpcXVpZC5yZW5kZXJlci5yZW5kZXJUZW1wbGF0ZXModGVtcGxhdGVzLCBzY29wZSlcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKGh0bWwpID0+IHtcbiAgICAgICAgICBzY29wZS5wb3AoKVxuICAgICAgICAgIHNjb3BlLm9wdHMuYmxvY2tzID0gb3JpZ2luQmxvY2tzXG4gICAgICAgICAgc2NvcGUub3B0cy5ibG9ja01vZGUgPSBvcmlnaW5CbG9ja01vZGVcbiAgICAgICAgICByZXR1cm4gaHRtbFxuICAgICAgICB9KVxuICAgIH1cbiAgfSlcbn1cbiIsImNvbnN0IExpcXVpZCA9IHJlcXVpcmUoJy4uJyk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCcuLi9zcmMvdXRpbC9hc3NlcnQuanMnKTtcbmNvbnN0IGxleGljYWwgPSBMaXF1aWQubGV4aWNhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXF1aWQpIHtcblxuICAgIGxpcXVpZC5yZWdpc3RlclRhZygnaW5jcmVtZW50Jywge1xuICAgICAgICBwYXJzZTogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IHRva2VuLmFyZ3MubWF0Y2gobGV4aWNhbC5pZGVudGlmaWVyKTtcbiAgICAgICAgICAgIGFzc2VydChtYXRjaCwgYGlsbGVnYWwgaWRlbnRpZmllciAke3Rva2VuLmFyZ3N9YCk7XG4gICAgICAgICAgICB0aGlzLnZhcmlhYmxlID0gbWF0Y2hbMF07XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oc2NvcGUsIGhhc2gpIHtcbiAgICAgICAgICAgIHZhciB2ID0gc2NvcGUuZ2V0KHRoaXMudmFyaWFibGUpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2ICE9PSAnbnVtYmVyJykgdiA9IDA7XG4gICAgICAgICAgICBzY29wZS5zZXQodGhpcy52YXJpYWJsZSwgdiArIDEpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgcmVxdWlyZSgnLi9hc3NpZ24uanMnKShlbmdpbmUpXG4gIHJlcXVpcmUoJy4vY2FwdHVyZS5qcycpKGVuZ2luZSlcbiAgcmVxdWlyZSgnLi9jYXNlLmpzJykoZW5naW5lKVxuICByZXF1aXJlKCcuL2NvbW1lbnQuanMnKShlbmdpbmUpXG4gIHJlcXVpcmUoJy4vY3ljbGUuanMnKShlbmdpbmUpXG4gIHJlcXVpcmUoJy4vZGVjcmVtZW50LmpzJykoZW5naW5lKVxuICByZXF1aXJlKCcuL2Zvci5qcycpKGVuZ2luZSlcbiAgcmVxdWlyZSgnLi9pZi5qcycpKGVuZ2luZSlcbiAgcmVxdWlyZSgnLi9pbmNsdWRlLmpzJykoZW5naW5lKVxuICByZXF1aXJlKCcuL2luY3JlbWVudC5qcycpKGVuZ2luZSlcbiAgcmVxdWlyZSgnLi9sYXlvdXQuanMnKShlbmdpbmUpXG4gIHJlcXVpcmUoJy4vcmF3LmpzJykoZW5naW5lKVxuICByZXF1aXJlKCcuL3RhYmxlcm93LmpzJykoZW5naW5lKVxuICByZXF1aXJlKCcuL3VubGVzcy5qcycpKGVuZ2luZSlcbn1cbiIsImNvbnN0IExpcXVpZCA9IHJlcXVpcmUoJy4uJylcbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdhbnktcHJvbWlzZScpXG5jb25zdCBsZXhpY2FsID0gTGlxdWlkLmxleGljYWxcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4uL3NyYy91dGlsL2Fzc2VydC5qcycpXG5cbi8qXG4gKiBibG9ja01vZGU6XG4gKiAqIFwic3RvcmVcIjogc3RvcmUgcmVuZGVyZWQgaHRtbCBpbnRvIGJsb2Nrc1xuICogKiBcIm91dHB1dFwiOiBvdXRwdXQgcmVuZGVyZWQgaHRtbFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpcXVpZCkge1xuICBsaXF1aWQucmVnaXN0ZXJUYWcoJ2xheW91dCcsIHtcbiAgICBwYXJzZTogZnVuY3Rpb24gKHRva2VuLCByZW1haW5Ub2tlbnMpIHtcbiAgICAgIHZhciBtYXRjaCA9IGxleGljYWwudmFsdWUuZXhlYyh0b2tlbi5hcmdzKVxuICAgICAgYXNzZXJ0KG1hdGNoLCBgaWxsZWdhbCB0b2tlbiAke3Rva2VuLnJhd31gKVxuXG4gICAgICB0aGlzLmxheW91dCA9IG1hdGNoWzBdXG4gICAgICB0aGlzLnRwbHMgPSBsaXF1aWQucGFyc2VyLnBhcnNlKHJlbWFpblRva2VucylcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKHNjb3BlLCBoYXNoKSB7XG4gICAgICB2YXIgbGF5b3V0ID0gc2NvcGUub3B0cy5keW5hbWljUGFydGlhbHMgPyBMaXF1aWQuZXZhbFZhbHVlKHRoaXMubGF5b3V0LCBzY29wZSkgOiB0aGlzLmxheW91dFxuXG4gICAgICAvLyByZW5kZXIgdGhlIHJlbWFpbmluZyB0b2tlbnMgaW1tZWRpYXRlbHlcbiAgICAgIHNjb3BlLm9wdHMuYmxvY2tNb2RlID0gJ3N0b3JlJ1xuICAgICAgcmV0dXJuIGxpcXVpZC5yZW5kZXJlci5yZW5kZXJUZW1wbGF0ZXModGhpcy50cGxzLCBzY29wZSlcbiAgICAgICAgLnRoZW4oaHRtbCA9PiB7XG4gICAgICAgICAgaWYgKHNjb3BlLm9wdHMuYmxvY2tzWycnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzY29wZS5vcHRzLmJsb2Nrc1snJ10gPSBodG1sXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBsaXF1aWQuZ2V0VGVtcGxhdGUobGF5b3V0LCBzY29wZS5vcHRzLnJvb3QpXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKHRlbXBsYXRlcyA9PiB7XG4gICAgICAgICAgLy8gcHVzaCB0aGUgaGFzaFxuICAgICAgICAgIHNjb3BlLnB1c2goaGFzaClcbiAgICAgICAgICBzY29wZS5vcHRzLmJsb2NrTW9kZSA9ICdvdXRwdXQnXG4gICAgICAgICAgcmV0dXJuIGxpcXVpZC5yZW5kZXJlci5yZW5kZXJUZW1wbGF0ZXModGVtcGxhdGVzLCBzY29wZSlcbiAgICAgICAgfSlcbiAgICAgICAgLy8gcG9wIHRoZSBoYXNoXG4gICAgICAgIC50aGVuKHBhcnRpYWwgPT4ge1xuICAgICAgICAgIHNjb3BlLnBvcCgpXG4gICAgICAgICAgcmV0dXJuIHBhcnRpYWxcbiAgICAgICAgfSlcbiAgICB9XG4gIH0pXG5cbiAgbGlxdWlkLnJlZ2lzdGVyVGFnKCdibG9jaycsIHtcbiAgICBwYXJzZTogZnVuY3Rpb24gKHRva2VuLCByZW1haW5Ub2tlbnMpIHtcbiAgICAgIHZhciBtYXRjaCA9IC9cXHcrLy5leGVjKHRva2VuLmFyZ3MpXG4gICAgICB0aGlzLmJsb2NrID0gbWF0Y2ggPyBtYXRjaFswXSA6ICcnXG5cbiAgICAgIHRoaXMudHBscyA9IFtdXG4gICAgICB2YXIgc3RyZWFtID0gbGlxdWlkLnBhcnNlci5wYXJzZVN0cmVhbShyZW1haW5Ub2tlbnMpXG4gICAgICAgIC5vbigndGFnOmVuZGJsb2NrJywgKCkgPT4gc3RyZWFtLnN0b3AoKSlcbiAgICAgICAgLm9uKCd0ZW1wbGF0ZScsIHRwbCA9PiB0aGlzLnRwbHMucHVzaCh0cGwpKVxuICAgICAgICAub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRhZyAke3Rva2VuLnJhd30gbm90IGNsb3NlZGApXG4gICAgICAgIH0pXG4gICAgICBzdHJlYW0uc3RhcnQoKVxuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc2NvcGUub3B0cy5ibG9ja3NbdGhpcy5ibG9ja10pXG4gICAgICAgIC50aGVuKGh0bWwgPT4gaHRtbCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgLy8gcmVuZGVyIGRlZmF1bHQgYmxvY2tcbiAgICAgICAgICA/IGxpcXVpZC5yZW5kZXJlci5yZW5kZXJUZW1wbGF0ZXModGhpcy50cGxzLCBzY29wZSlcbiAgICAgICAgICAvLyB1c2UgY2hpbGQtZGVmaW5lZCBibG9ja1xuICAgICAgICAgIDogaHRtbClcbiAgICAgICAgLnRoZW4oaHRtbCA9PiB7XG4gICAgICAgICAgaWYgKHNjb3BlLm9wdHMuYmxvY2tNb2RlID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICBzY29wZS5vcHRzLmJsb2Nrc1t0aGlzLmJsb2NrXSA9IGh0bWxcbiAgICAgICAgICAgIHJldHVybiAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaHRtbFxuICAgICAgICB9KVxuICAgIH1cbiAgfSlcbn1cbiIsImNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdhbnktcHJvbWlzZScpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpcXVpZCkge1xuICBsaXF1aWQucmVnaXN0ZXJUYWcoJ3JhdycsIHtcbiAgICBwYXJzZTogZnVuY3Rpb24gKHRhZ1Rva2VuLCByZW1haW5Ub2tlbnMpIHtcbiAgICAgIHRoaXMudG9rZW5zID0gW11cblxuICAgICAgdmFyIHN0cmVhbSA9IGxpcXVpZC5wYXJzZXIucGFyc2VTdHJlYW0ocmVtYWluVG9rZW5zKVxuICAgICAgc3RyZWFtXG4gICAgICAgIC5vbigndG9rZW4nLCB0b2tlbiA9PiB7XG4gICAgICAgICAgaWYgKHRva2VuLm5hbWUgPT09ICdlbmRyYXcnKSBzdHJlYW0uc3RvcCgpXG4gICAgICAgICAgZWxzZSB0aGlzLnRva2Vucy5wdXNoKHRva2VuKVxuICAgICAgICB9KVxuICAgICAgICAub24oJ2VuZCcsIHggPT4ge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGFnICR7dGFnVG9rZW4ucmF3fSBub3QgY2xvc2VkYClcbiAgICAgICAgfSlcbiAgICAgIHN0cmVhbS5zdGFydCgpXG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIChzY29wZSwgaGFzaCkge1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMudG9rZW5zLm1hcCh0b2tlbiA9PiB0b2tlbi5yYXcpLmpvaW4oJycpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRva2VucylcbiAgICB9XG4gIH0pXG59XG4iLCJjb25zdCBMaXF1aWQgPSByZXF1aXJlKCcuLicpXG5jb25zdCBtYXBTZXJpZXMgPSByZXF1aXJlKCcuLi9zcmMvdXRpbC9wcm9taXNlLmpzJykubWFwU2VyaWVzXG5jb25zdCBsZXhpY2FsID0gTGlxdWlkLmxleGljYWxcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJy4uL3NyYy91dGlsL2Fzc2VydC5qcycpXG5jb25zdCByZSA9IG5ldyBSZWdFeHAoYF4oJHtsZXhpY2FsLmlkZW50aWZpZXIuc291cmNlfSlcXFxccytpblxcXFxzK2AgK1xuICBgKCR7bGV4aWNhbC52YWx1ZS5zb3VyY2V9KWAgK1xuICBgKD86XFxcXHMrJHtsZXhpY2FsLmhhc2guc291cmNlfSkqJGApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpcXVpZCkge1xuICBsaXF1aWQucmVnaXN0ZXJUYWcoJ3RhYmxlcm93Jywge1xuXG4gICAgcGFyc2U6IGZ1bmN0aW9uICh0YWdUb2tlbiwgcmVtYWluVG9rZW5zKSB7XG4gICAgICB2YXIgbWF0Y2ggPSByZS5leGVjKHRhZ1Rva2VuLmFyZ3MpXG4gICAgICBhc3NlcnQobWF0Y2gsIGBpbGxlZ2FsIHRhZzogJHt0YWdUb2tlbi5yYXd9YClcblxuICAgICAgdGhpcy52YXJpYWJsZSA9IG1hdGNoWzFdXG4gICAgICB0aGlzLmNvbGxlY3Rpb24gPSBtYXRjaFsyXVxuICAgICAgdGhpcy50ZW1wbGF0ZXMgPSBbXVxuXG4gICAgICB2YXIgcFxuICAgICAgdmFyIHN0cmVhbSA9IGxpcXVpZC5wYXJzZXIucGFyc2VTdHJlYW0ocmVtYWluVG9rZW5zKVxuICAgICAgICAub24oJ3N0YXJ0JywgKCkgPT4gKHAgPSB0aGlzLnRlbXBsYXRlcykpXG4gICAgICAgIC5vbigndGFnOmVuZHRhYmxlcm93JywgdG9rZW4gPT4gc3RyZWFtLnN0b3AoKSlcbiAgICAgICAgLm9uKCd0ZW1wbGF0ZScsIHRwbCA9PiBwLnB1c2godHBsKSlcbiAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0YWcgJHt0YWdUb2tlbi5yYXd9IG5vdCBjbG9zZWRgKVxuICAgICAgICB9KVxuXG4gICAgICBzdHJlYW0uc3RhcnQoKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIChzY29wZSwgaGFzaCkge1xuICAgICAgdmFyIGNvbGxlY3Rpb24gPSBMaXF1aWQuZXZhbEV4cCh0aGlzLmNvbGxlY3Rpb24sIHNjb3BlKSB8fCBbXVxuXG4gICAgICB2YXIgaHRtbCA9ICc8dGFibGU+J1xuICAgICAgdmFyIG9mZnNldCA9IGhhc2gub2Zmc2V0IHx8IDBcbiAgICAgIHZhciBsaW1pdCA9IChoYXNoLmxpbWl0ID09PSB1bmRlZmluZWQpID8gY29sbGVjdGlvbi5sZW5ndGggOiBoYXNoLmxpbWl0XG5cbiAgICAgIHZhciBjb2xzID0gaGFzaC5jb2xzXG4gICAgICB2YXIgcm93XG4gICAgICB2YXIgY29sXG4gICAgICBpZiAoIWNvbHMpIHRocm93IG5ldyBFcnJvcihgaWxsZWdhbCBjb2xzOiAke2NvbHN9YClcblxuICAgICAgLy8gYnVpbGQgYXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdG8gc2VxdWVudGlhbCBwcm9taXNlcy4uLlxuICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb24uc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBsaW1pdClcbiAgICAgIHZhciBjb250ZXh0cyA9IFtdXG4gICAgICBjb2xsZWN0aW9uLnNvbWUoKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgdmFyIGN0eCA9IHt9XG4gICAgICAgIGN0eFt0aGlzLnZhcmlhYmxlXSA9IGl0ZW1cbiAgICAgICAgY29udGV4dHMucHVzaChjdHgpXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gbWFwU2VyaWVzKGNvbnRleHRzLFxuICAgICAgICAoY29udGV4dCwgaWR4KSA9PiB7XG4gICAgICAgICAgcm93ID0gTWF0aC5mbG9vcihpZHggLyBjb2xzKSArIDFcbiAgICAgICAgICBjb2wgPSAoaWR4ICUgY29scykgKyAxXG4gICAgICAgICAgaWYgKGNvbCA9PT0gMSkge1xuICAgICAgICAgICAgaWYgKHJvdyAhPT0gMSkge1xuICAgICAgICAgICAgICBodG1sICs9ICc8L3RyPidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgKz0gYDx0ciBjbGFzcz1cInJvdyR7cm93fVwiPmBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBodG1sICs9IGA8dGQgY2xhc3M9XCJjb2wke2NvbH1cIj5gXG4gICAgICAgICAgc2NvcGUucHVzaChjb250ZXh0KVxuICAgICAgICAgIHJldHVybiBsaXF1aWQucmVuZGVyZXJcbiAgICAgICAgICAgIC5yZW5kZXJUZW1wbGF0ZXModGhpcy50ZW1wbGF0ZXMsIHNjb3BlKVxuICAgICAgICAgICAgLnRoZW4oKHBhcnRpYWwpID0+IHtcbiAgICAgICAgICAgICAgc2NvcGUucG9wKGNvbnRleHQpXG4gICAgICAgICAgICAgIGh0bWwgKz0gcGFydGlhbFxuICAgICAgICAgICAgICBodG1sICs9ICc8L3RkPidcbiAgICAgICAgICAgICAgcmV0dXJuIGh0bWxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocm93ID4gMCkge1xuICAgICAgICAgICAgaHRtbCArPSAnPC90cj4nXG4gICAgICAgICAgfVxuICAgICAgICAgIGh0bWwgKz0gJzwvdGFibGU+J1xuICAgICAgICAgIHJldHVybiBodG1sXG4gICAgICAgIH0pXG4gICAgfVxuICB9KVxufVxuIiwiY29uc3QgTGlxdWlkID0gcmVxdWlyZSgnLi4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXF1aWQpIHtcbiAgICBsaXF1aWQucmVnaXN0ZXJUYWcoJ3VubGVzcycsIHtcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uKHRhZ1Rva2VuLCByZW1haW5Ub2tlbnMpIHtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVzID0gW107XG4gICAgICAgICAgICB0aGlzLmVsc2VUZW1wbGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIHZhciBwLCBzdHJlYW0gPSBsaXF1aWQucGFyc2VyLnBhcnNlU3RyZWFtKHJlbWFpblRva2VucylcbiAgICAgICAgICAgICAgICAub24oJ3N0YXJ0JywgeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSB0aGlzLnRlbXBsYXRlcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25kID0gdGFnVG9rZW4uYXJncztcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbigndGFnOmVsc2UnLCB0b2tlbiA9PiBwID0gdGhpcy5lbHNlVGVtcGxhdGVzKVxuICAgICAgICAgICAgICAgIC5vbigndGFnOmVuZHVubGVzcycsIHRva2VuID0+IHN0cmVhbS5zdG9wKCkpXG4gICAgICAgICAgICAgICAgLm9uKCd0ZW1wbGF0ZScsIHRwbCA9PiBwLnB1c2godHBsKSlcbiAgICAgICAgICAgICAgICAub24oJ2VuZCcsIHggPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRhZyAke3RhZ1Rva2VuLnJhd30gbm90IGNsb3NlZGApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzdHJlYW0uc3RhcnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKHNjb3BlLCBoYXNoKSB7XG4gICAgICAgICAgICB2YXIgY29uZCA9IExpcXVpZC5ldmFsRXhwKHRoaXMuY29uZCwgc2NvcGUpO1xuICAgICAgICAgICAgcmV0dXJuIExpcXVpZC5pc0ZhbHN5KGNvbmQpID9cbiAgICAgICAgICAgICAgICBsaXF1aWQucmVuZGVyZXIucmVuZGVyVGVtcGxhdGVzKHRoaXMudGVtcGxhdGVzLCBzY29wZSkgOlxuICAgICAgICAgICAgICAgIGxpcXVpZC5yZW5kZXJlci5yZW5kZXJUZW1wbGF0ZXModGhpcy5lbHNlVGVtcGxhdGVzLCBzY29wZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iXX0=
