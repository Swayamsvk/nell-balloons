
/**
 * @license RequireJS domReady 1.0.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint strict: false, plusplus: false */
/*global require: false, define: false, requirejs: false,
  window: false, clearInterval: false, document: false,
  self: false, setInterval: false */


define('domReady',[],function () {
    var isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [],
        readyLoaderCalls = [],
        //Bind to a specific implementation, but if not there, try a
        //a generic one under the "require" name.
        req = requirejs || require || {},
        oldResourcesReady = req.resourcesReady,
        scrollIntervalId;

    function runCallbacks(callbacks) {
        for (var i = 0, callback; (callback = callbacks[i]); i++) {
            callback(doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls,
            loaderCallbacks = readyLoaderCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }

            //Now handle DOM ready + loader ready callbacks.
            if (req.resourcesDone && loaderCallbacks.length) {
                readyLoaderCalls = [];
                runCallbacks(loaderCallbacks);
            }
        }
    }

    /**
     * Add a method to require to get callbacks if there are loader resources still
     * being loaded. If so, then hold off calling "withResources" callbacks.
     *
     * @param {Boolean} isReady: pass true if all resources have been loaded.
     */
    if ('resourcesReady' in req) {
        req.resourcesReady = function (isReady) {
            //Call the old function if it is around.
            if (oldResourcesReady) {
                oldResourcesReady(isReady);
            }

            if (isReady) {
                callReady();
            }
        };
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            //DOMContentLoaded approximation, as found by Diego Perini:
            //http://javascript.nwbox.com/IEContentLoaded/
            if (self === self.top) {
                scrollIntervalId = setInterval(function () {
                    try {
                        //From this ticket:
                        //http://bugs.dojotoolkit.org/ticket/11106,
                        //In IE HTML Application (HTA), such as in a selenium test,
                        //javascript in the iframe can't see anything outside
                        //of it, so self===self.top is true, but the iframe is
                        //not the top window and doScroll will be available
                        //before document.body is set. Test document.body
                        //before trying the doScroll trick.
                        if (document.body) {
                            document.documentElement.doScroll("left");
                            pageLoaded();
                        }
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners.
        if (document.readyState === "complete") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    /**
     * Callback that waits for DOM ready as well as any outstanding
     * loader resources. Useful when there are implicit dependencies.
     * This method should be avoided, and always use explicit
     * dependency resolution, with just regular DOM ready callbacks.
     * The callback passed to this method will be called immediately
     * if the DOM and loader are already ready.
     * @param {Function} callback
     */
    domReady.withResources = function (callback) {
        if (isPageLoaded && req.resourcesDone) {
            callback(doc);
        } else {
            readyLoaderCalls.push(callback);
        }
        return domReady;
    };

    domReady.version = '1.0.0';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});

// From http://baagoe.com/en/RandomMusings/javascript/
define('alea',[], function() {

// Johannes Baagøe <baagoe@baagoe.com>, 2010
function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  mash.version = 'Mash 0.9';
  return mash;
}

function Alea() {
  return (function(args) {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    if (args.length == 0) {
      args = [+new Date];
    }
    var mash = Mash();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(args[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(args[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;

    var random = function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
    random.uint32 = function() {
      return random() * 0x100000000; // 2^32
    };
    random.fract53 = function() {
      return random() + 
        (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
    };
    random.choice = function(list) {
        var i = Math.floor(random() * list.length);
        return list[i];
    };
    var _randomsign = function() { return random() - 0.5; };
    random.shuffle = function(list) {
        list.sort(_randomsign);
    };
    random.version = 'Alea 0.9';
    random.args = args;
    return random;

  } (Array.prototype.slice.call(arguments)));
};

    return { Random: Alea };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global
  define:true, console:false, require:false, module:false, window:false,
  Float64Array:false, Uint16Array:false
 */

// Compatibility thunks.  Hackity hackity.
define('compat',[], function() {
    // Because Safari 5.1 doesn't have Function.bind (sigh)
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP ? this :
                                     (oThis || window),
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
    // Android's embedded webkit doesn't have Object.freeze
    if (!Object.freeze) {
        Object.freeze = function(o) { return o; };
    }
    // Android non-Chrome doesn't have Web Workers
    var FakeWorker = function() {
        console.warn("Faking Web Worker creation.");
    };
    FakeWorker.prototype = {
        postMessage: function(msg) { },
        addEventListener: function(msg, func) { }
    };

    var Compat = {
        // Android non-Chrome browser doesn't have Web Workers
        Worker: typeof(Worker)==='undefined' ? FakeWorker : Worker,
        // Android Honeycomb doesn't have Uint8Array
        Uint8Array: typeof(Uint8Array)==='undefined' ? Array : Uint8Array,
        // iOS 5 doesn't have Float64Array
        Float64Array: typeof(Float64Array)==='undefined' ? Array : Float64Array
    };

    // robust poly fill for window.requestAnimationFrame
    if (typeof window !== 'undefined') {
        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            var x;
            for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame =
                    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                console.log("Using requestAnimationFrame fallback.");
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                               timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }

            Compat.requestAnimationFrame =
                window.requestAnimationFrame.bind(window);
            Compat.cancelAnimationFrame =
                window.cancelAnimationFrame.bind(window);
        })();
    }

    return Compat;
});

/**
 * Phonegap Web Intent plugin
 * Copyright (c) Boris Smus 2010
 *
 */
define('webintent',[], function() {
var Cordova = window.Cordova || { addConstructor: function() {} };
var WebIntent = function() { 

};

WebIntent.ACTION_SEND = "android.intent.action.SEND";
WebIntent.ACTION_VIEW= "android.intent.action.VIEW";
WebIntent.EXTRA_TEXT = "android.intent.extra.TEXT";
WebIntent.EXTRA_SUBJECT = "android.intent.extra.SUBJECT";
WebIntent.EXTRA_STREAM = "android.intent.extra.STREAM";
WebIntent.EXTRA_EMAIL = "android.intent.extra.EMAIL";

WebIntent.prototype.startActivity = function(params, success, fail) {
	return Cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'startActivity', [params]);
};

WebIntent.prototype.sendBroadcast = function(params, success, fail) {
    return Cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'sendBroadcast', [params]);
};

WebIntent.prototype.hasExtra = function(params, success, fail) {
	return Cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'hasExtra', [params]);
};

WebIntent.prototype.getUri = function(success, fail) {
	return Cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'getUri', []);
};

WebIntent.prototype.getExtra = function(params, success, fail) {
	return Cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'getExtra', [params]);
};


WebIntent.prototype.onNewIntent = function(callback) {
	return Cordova.exec(function(args) {
		callback(args);
    }, function(args) {
    }, 'WebIntent', 'onNewIntent', []);
};

Cordova.addConstructor(function() {
	Cordova.addPlugin('webintent', new WebIntent());
});

return WebIntent;
});

// encapsulate Funf functionality
define('funf',['./webintent'], function(WebIntent) {

    var FUNF_ACTION_RECORD = 'edu.mit.media.funf.RECORD';
    var FUNF_ACTION_ARCHIVE = 'edu.mit.media.funf.ARCHIVE';
    var FUNF_DATABASE_NAME = 'mainPipeline';

    var Funf = function(appName) {
        console.assert(appName.indexOf('-') < 0,
                       "funf doesn't like hyphens in the appName");
        this.appName = appName;
    };
    Funf.prototype = {};
    Funf.prototype.record = function(name, value) {
        console.log('CSA FUNF '+name+' / '+value);
    };
    Funf.prototype.archive = function() { /* ignore */ };
    // only define these methods if running on Android
    if (window &&
        window.Cordova && window.Cordova.exec &&
        window.device && window.device.platform==='Android') {
        Funf.prototype.record = function(name, value) {
            if (typeof value === 'object' /* includes arrays */) {
                // protect complex values from funf flattening
                value = JSON.stringify(value);
            }
            var wi = new WebIntent();
            var o = { name:name, value:value, millis: Date.now() };
            wi.sendBroadcast({
                action: FUNF_ACTION_RECORD,
                extras: {
                    DATABASE_NAME: FUNF_DATABASE_NAME,
                    TIMESTAMP: Math.floor(Date.now()/1000),
                    NAME: this.appName,
                    VALUE: JSON.stringify(o)
                }
            }, function(args) { /* success */ }, function(args) {
                console.error('Funf logging failed.');
            });
        };
        Funf.prototype.archive = function() {
            new WebIntent().sendBroadcast({
                action: FUNF_ACTION_ARCHIVE,
                extras: {
                    DATABASE_NAME: FUNF_DATABASE_NAME
                }
            }, function(){}, function(){});
        };
    }
    return Funf;
});

/**
 * Lawnchair!
 * --- 
 * clientside json store 
 *
 */
define('lawnchair/core',[], function() {
var Lawnchair = function (options, callback) {
    // ensure Lawnchair was called as a constructor
    if (!(this instanceof Lawnchair)) return new Lawnchair(options, callback);

    // lawnchair requires json 
    if (!JSON) throw 'JSON unavailable! Include http://www.json.org/json2.js to fix.'
    // options are optional; callback is not
    if (arguments.length <= 2 && arguments.length > 0) {
        callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1];
        options  = (typeof arguments[0] === 'function') ? {} : arguments[0];
    } else {
        throw 'Incorrect # of ctor args!'
    }
    // TODO perhaps allow for pub/sub instead?
    if (typeof callback !== 'function') throw 'No callback was provided';
    
    // default configuration 
    this.record = options.record || 'record'  // default for records
    this.name   = options.name   || 'records' // default name for underlying store
    
    // mixin first valid  adapter
    var adapter
    // if the adapter is passed in we try to load that only
    if (options.adapter) {
        for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
            if (Lawnchair.adapters[i].adapter === options.adapter) {
              adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined;
              break;
            }
        }
    // otherwise find the first valid adapter for this env
    } 
    else {
        for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
            adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined
            if (adapter) break 
        }
    } 
    
    // we have failed 
    if (!adapter) throw 'No valid adapter.' 
    
    // yay! mixin the adapter 
    for (var j in adapter)  
        this[j] = adapter[j]
    
    // call init for each mixed in plugin
    for (var i = 0, l = Lawnchair.plugins.length; i < l; i++) 
        Lawnchair.plugins[i].call(this)

    // init the adapter 
    this.init(options, callback)
}

Lawnchair.adapters = [] 

/** 
 * queues an adapter for mixin
 * ===
 * - ensures an adapter conforms to a specific interface
 *
 */
Lawnchair.adapter = function (id, obj) {
    // add the adapter id to the adapter obj
    // ugly here for a  cleaner dsl for implementing adapters
    obj['adapter'] = id
    // methods required to implement a lawnchair adapter 
    var implementing = 'adapter valid init keys save batch get exists all remove nuke'.split(' ')
    ,   indexOf = this.prototype.indexOf
    // mix in the adapter   
    for (var i in obj) {
        if (indexOf(implementing, i) === -1) throw 'Invalid adapter! Nonstandard method: ' + i
    }
    // if we made it this far the adapter interface is valid 
	// insert the new adapter as the preferred adapter
	Lawnchair.adapters.splice(0,0,obj)
}

Lawnchair.plugins = []

/**
 * generic shallow extension for plugins
 * ===
 * - if an init method is found it registers it to be called when the lawnchair is inited 
 * - yes we could use hasOwnProp but nobody here is an asshole
 */ 
Lawnchair.plugin = function (obj) {
    for (var i in obj) 
        i === 'init' ? Lawnchair.plugins.push(obj[i]) : this.prototype[i] = obj[i]
}

/**
 * helpers
 *
 */
Lawnchair.prototype = {

    isArray: Array.isArray || function(o) { return Object.prototype.toString.call(o) === '[object Array]' },
    
    /**
     * this code exists for ie8... for more background see:
     * http://www.flickr.com/photos/westcoastlogic/5955365742/in/photostream
     */
    indexOf: function(ary, item, i, l) {
        if (ary.indexOf) return ary.indexOf(item)
        for (i = 0, l = ary.length; i < l; i++) if (ary[i] === item) return i
        return -1
    },

    // awesome shorthand callbacks as strings. this is shameless theft from dojo.
    lambda: function (callback) {
        return this.fn(this.record, callback)
    },

    // first stab at named parameters for terse callbacks; dojo: first != best // ;D
    fn: function (name, callback) {
        return typeof callback == 'string' ? new Function(name, callback) : callback
    },

    // returns a unique identifier (by way of Backbone.localStorage.js)
    // TODO investigate smaller UUIDs to cut on storage cost
    uuid: function () {
        var S4 = function () {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },

    // a classic iterator
    each: function (callback) {
        var cb = this.lambda(callback)
        // iterate from chain
        if (this.__results) {
            for (var i = 0, l = this.__results.length; i < l; i++) cb.call(this, this.__results[i], i) 
        }  
        // otherwise iterate the entire collection 
        else {
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) cb.call(this, r[i], i)
            })
        }
        return this
    }
// --
};
    return Lawnchair;
});

/**
 * indexed db adapter
 * === 
 * - originally authored by Vivian Li
 *
 */
define('lawnchair/adapters/indexed-db.js',[], function() { return function(Lawnchair) {

Lawnchair.adapter('indexed-db', (function(){

  function fail(e, i) { console.error('error in indexed-db adapter!', e, i); }

  var STORE_NAME = 'lawnchair';

  // update the STORE_VERSION when the schema used by this adapter changes
  // (for example, if you change the STORE_NAME above)
  var STORE_VERSION = 2;

  var getIDB = function() {
    // XXX firefox is timing out trying to open the db after you clear local
    // storage, without firing onblocked or anything. =(
    return window.indexedDB || window.webkitIndexedDB ||
          /*window.mozIndexedDB || */ window.oIndexedDB ||
          window.msIndexedDB;
  };
  var getIDBTransaction = function() {
      return window.IDBTransaction || window.webkitIDBTransaction ||
          window.mozIDBTransaction || window.oIDBTransaction ||
          window.msIDBTransaction;
  };
  var getIDBKeyRange = function() {
      return window.IDBKeyRange || window.webkitIDBKeyRange ||
          window.mozIDBKeyRange || window.oIDBKeyRange ||
          window.msIDBKeyRange;
  };
  var getIDBDatabaseException = function() {
      return window.IDBDatabaseException || window.webkitIDBDatabaseException ||
          window.mozIDBDatabaseException || window.oIDBDatabaseException ||
          window.msIDBDatabaseException;
  };

  // see https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-html5/OhsoAQLj7kc
  var READ_WRITE = (getIDBTransaction() &&
                    'READ_WRITE' in getIDBTransaction()) ?
    getIDBTransaction().READ_WRITE : 'readwrite';

  return {
    
    valid: function() { return !!getIDB(); },
    
    init:function(options, callback) {
        this.idb = getIDB();
        this.waiting = [];
        var request = this.idb.open(this.name, STORE_VERSION);
        var self = this;
        var cb = self.fn(self.name, callback);
        var win = function() {
            // manually clean up event handlers on request; this helps on chrome
            request.onupgradeneeded = request.onsuccess = request.error = null;
            return cb.call(self, self);
        };
        
        var upgrade = function(from, to) {
            // don't try to migrate dbs, just recreate
            try {
                self.db.deleteObjectStore('teststore'); // old adapter
            } catch (e1) { /* ignore */ }
            try {
                self.db.deleteObjectStore(STORE_NAME);
            } catch (e2) { /* ignore */ }

            // ok, create object store.
            self.db.createObjectStore(STORE_NAME/*, { autoIncrement: true}*/);
            self.store = true;
        };
        request.onupgradeneeded = function(event) {
            self.db = request.result;
            self.transaction = request.transaction;
            upgrade(event.oldVersion, event.newVersion);
            // will end up in onsuccess callback
        };
        request.onsuccess = function(event) {
           self.db = request.result; 
            
            if (self.db.version != (''+STORE_VERSION)) {
              // DEPRECATED API: modern implementations will fire the
              // upgradeneeded event instead.
              var oldVersion = self.db.version;
              var setVrequest = self.db.setVersion(''+STORE_VERSION);
              // onsuccess is the only place we can create Object Stores
              setVrequest.onsuccess = function(event) {
                  var transaction = setVrequest.result;
                  setVrequest.onsuccess = setVrequest.onerror = null;
                  // can't upgrade w/o versionchange transaction.
                  upgrade(oldVersion, STORE_VERSION);
                  transaction.oncomplete = function() {
                      for (var i = 0; i < self.waiting.length; i++) {
                          self.waiting[i].call(self);
                      }
                      self.waiting = [];
                      win();
                  };
              };
              setVrequest.onerror = function(e) {
                  setVrequest.onsuccess = setVrequest.onerror = null;
                  console.log("Failed to create objectstore " + e);
                  fail(e);
              };
            } else {
                self.store = true;
                for (var i = 0; i < self.waiting.length; i++) {
                      self.waiting[i].call(self);
                }
                self.waiting = [];
                win();
            }
        }
        request.onblocked = function(ev) {
            console.log('onblocked!'); // XXX
        };
        request.onerror = function(ev) {
            if (request.errorCode === getIDBDatabaseException().VERSION_ERR) {
                // xxx blow it away
                self.idb.deleteDatabase(self.name);
                // try it again.
                return self.init(options, callback);
            }
            console.error('Failed to open database');
        };
    },

    save:function(obj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.save(obj, callback);
            });
            return;
         }
         
         var self = this, request;
         var win  = function (e) {
             // manually clean up event handlers; helps free memory on chrome.
             request.onsuccess = request.onerror = null;
             if (callback) { obj.key = e.target.result; self.lambda(callback).call(self, obj) }
         };

         var trans = this.db.transaction(STORE_NAME, READ_WRITE);
         var store = trans.objectStore(STORE_NAME);
         request = obj.key ? store.put(obj, obj.key) : store.put(obj);
         
         request.onsuccess = win;
         request.onerror = fail;
         
         return this;
    },
    
    // FIXME this should be a batch insert / just getting the test to pass...
    batch: function (objs, cb) {
        
        var results = []
        ,   done = false
        ,   self = this

        var updateProgress = function(obj) {
            results.push(obj)
            done = results.length === objs.length
        }

        var checkProgress = setInterval(function() {
            if (done) {
                if (cb) self.lambda(cb).call(self, results)
                clearInterval(checkProgress)
            }
        }, 200)

        for (var i = 0, l = objs.length; i < l; i++) 
            this.save(objs[i], updateProgress)
        
        return this
    },
    

    get:function(key, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.get(key, callback);
            });
            return;
        }
        
        
        var self = this;
        var win  = function (e) { if (callback) { self.lambda(callback).call(self, e.target.result) }};
        
        if (!this.isArray(key)){
            var req = this.db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);

            req.onsuccess = function(event) {
                req.onsuccess = req.onerror = null;
                win(event);
            };
            req.onerror = function(event) {
                console.log("Failed to find " + key);
                req.onsuccess = req.onerror = null;
                fail(event);
            };
        
        // FIXME: again the setInterval solution to async callbacks..    
        } else {

            // note: these are hosted.
            var results = []
            ,   done = false
            ,   keys = key

            var updateProgress = function(obj) {
                results.push(obj)
                done = results.length === keys.length
                if (done) {
                    self.lambda(callback).call(self, results);
                }
            }

            for (var i = 0, l = keys.length; i < l; i++) 
                this.get(keys[i], updateProgress)
            
        }

        return this;
    },

    exists:function(key, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.exists(key, callback);
            });
            return;
        }

        var self = this;

        var req = this.db.transaction(STORE_NAME).objectStore(STORE_NAME).openCursor(getIDBKeyRange().only(key));

        req.onsuccess = function(event) {
            req.onsuccess = req.onerror = null;
            // exists iff req.result is not null
            // XXX but firefox returns undefined instead, sigh XXX
            var undef;
            self.lambda(callback).call(self, event.target.result !== null &&
                                             event.target.result !== undef);
        };
        req.onerror = function(event) {
            req.onsuccess = req.onerror = null;
            console.log("Failed to test for " + key);
            fail(event);
        };

        return this;
    },

    all:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.all(callback);
            });
            return;
        }
        var cb = this.fn(this.name, callback) || undefined;
        var self = this;
        var objectStore = this.db.transaction(STORE_NAME).objectStore(STORE_NAME);
        var toReturn = [];
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
               toReturn.push(cursor.value);
               cursor['continue']();
          }
          else {
              if (cb) cb.call(self, toReturn);
          }
        };
        return this;
    },

    remove:function(keyOrObj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.remove(keyOrObj, callback);
            });
            return;
        }
        if (typeof keyOrObj == "object") {
            keyOrObj = keyOrObj.key;
        }
        var self = this, request;
        var win  = function () {
            request.onsuccess = request.onerror = null;
            if (callback) self.lambda(callback).call(self)
        };
        
        request = this.db.transaction(STORE_NAME, READ_WRITE).objectStore(STORE_NAME)['delete'](keyOrObj);
        request.onsuccess = win;
        request.onerror = fail;
        return this;
    },

    nuke:function(callback, optDeleteOutright) {
        if(!this.store) {
            this.waiting.push(function() {
                this.nuke(callback, optDeleteOutright);
            });
            return;
        }
        
        var self = this
        ,   win  = callback ? function() { self.lambda(callback).call(self) } : function(){};
        
        if (optDeleteOutright) {
            // can't use this lawnchair for anything after this completes
            if (this.waiting.length) fail();
            this.idb.deleteDatabase(this.name);
            delete this.store;
            delete this.waiting;
            win();
            return;
        }

        try {
            this.db
                .transaction(STORE_NAME, READ_WRITE)
                .objectStore(STORE_NAME).clear().onsuccess = win;
            
        } catch(e) {
            fail();
        }
        return this;
    }
    
  };
  
})());

};
});

/**
 * dom storage adapter 
 * === 
 * - originally authored by Joseph Pecoraro
 *
 */ 
//
// TODO does it make sense to be chainable all over the place?
// chainable: nuke, remove, all, get, save, all    
// not chainable: valid, keys
//
define('lawnchair/adapters/dom.js',[], function() { return function(Lawnchair) {

Lawnchair.adapter('dom', (function() {
    var storage = window.localStorage
    // the indexer is an encapsulation of the helpers needed to keep an ordered index of the keys
    var indexer = function(name) {
        return {
            // the key
            key: name + '._index_',
            // returns the index
            all: function() {
				var a  = storage.getItem(this.key)
				if (a) {
					a = JSON.parse(a)
				}
                if (a === null) storage.setItem(this.key, JSON.stringify([])) // lazy init
                return JSON.parse(storage.getItem(this.key))
            },
            // adds a key to the index
            add: function (key) {
                var a = this.all()
                a.push(key)
                storage.setItem(this.key, JSON.stringify(a))
            },
            // deletes a key from the index
            del: function (key) {
                var a = this.all(), r = []
                // FIXME this is crazy inefficient but I'm in a strata meeting and half concentrating
                for (var i = 0, l = a.length; i < l; i++) {
                    if (a[i] != key) r.push(a[i])
                }
                storage.setItem(this.key, JSON.stringify(r))
            },
            // returns index for a key
            find: function (key) {
                var a = this.all()
                for (var i = 0, l = a.length; i < l; i++) {
                    if (key === a[i]) return i 
                }
                return false
            }
        }
    }
    
    // adapter api 
    return {
    
        // ensure we are in an env with localStorage 
        valid: function () {
            return !!storage 
        },

        init: function (options, callback) {
            this.indexer = indexer(this.name)
            if (callback) this.fn(this.name, callback).call(this, this)  
        },
        
        save: function (obj, callback) {
            var key = obj.key ? this.name + '.' + obj.key : this.name + '.' + this.uuid()
            // if the key is not in the index push it on
            if (this.indexer.find(key) === false) this.indexer.add(key)
            // now we kil the key and use it in the store colleciton    
            delete obj.key;
            storage.setItem(key, JSON.stringify(obj))
            obj.key = key.slice(this.name.length + 1)
            if (callback) {
                this.lambda(callback).call(this, obj)
            }
            return this
        },

        batch: function (ary, callback) {
            var saved = []
            // not particularily efficient but this is more for sqlite situations
            for (var i = 0, l = ary.length; i < l; i++) {
                this.save(ary[i], function(r){
                    saved.push(r)
                })
            }
            if (callback) this.lambda(callback).call(this, saved)
            return this
        },
       
        // accepts [options], callback
        keys: function(callback) {
            if (callback) { 
                var name = this.name
                ,   keys = this.indexer.all().map(function(r){ return r.replace(name + '.', '') })
                this.fn('keys', callback).call(this, keys)
            }
            return this // TODO options for limit/offset, return promise
        },
        
        get: function (key, callback) {
            if (this.isArray(key)) {
                var r = []
                for (var i = 0, l = key.length; i < l; i++) {
                    var k = this.name + '.' + key[i]
                    var obj = storage.getItem(k)
                    if (obj) {
						obj = JSON.parse(obj)
                        obj.key = key[i]
                        r.push(obj)
                    } 
                }
                if (callback) this.lambda(callback).call(this, r)
            } else {
                var k = this.name + '.' + key
                var  obj = storage.getItem(k)
                if (obj) {
					obj = JSON.parse(obj)
					obj.key = key
				}
                if (callback) this.lambda(callback).call(this, obj)
            }
            return this
        },

        exists: function (key, cb) {
            var exists = this.indexer.find(this.name+'.'+key) === false ? false : true ;
            this.lambda(cb).call(this, exists);
            return this;
        },
        // NOTE adapters cannot set this.__results but plugins do
        // this probably should be reviewed
        all: function (callback) {
            var idx = this.indexer.all()
            ,   r   = []
            ,   o
            ,   k
            for (var i = 0, l = idx.length; i < l; i++) {
                k     = idx[i] //v
                o     = JSON.parse(storage.getItem(k))
                o.key = k.replace(this.name + '.', '')
                r.push(o)
            }
            if (callback) this.fn(this.name, callback).call(this, r)
            return this
        },
        
        remove: function (keyOrObj, callback) {
            var key = this.name + '.' + ((keyOrObj.key) ? keyOrObj.key : keyOrObj)
            this.indexer.del(key)
            storage.removeItem(key)
            if (callback) this.lambda(callback).call(this)
            return this
        },
        
        nuke: function (callback) {
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) {
                    this.remove(r[i]);
                }
                if (callback) this.lambda(callback).call(this)
            })
            return this 
        }
}})());

};
});

// window.name code courtesy Remy Sharp: http://24ways.org/2009/breaking-out-the-edges-of-the-browser
define('lawnchair/adapters/window-name.js',[], function() { return function(Lawnchair) {

Lawnchair.adapter('window-name', (function(index, store) {
    if (typeof window==='undefined') {
        window = { top: { } }; // node/optimizer compatibility
    }

    var data = window.top.name ? JSON.parse(window.top.name) : {}

    return {

        valid: function () {
            return typeof window.top.name != 'undefined' 
        },

        init: function (options, callback) {
            data[this.name] = data[this.name] || {index:[],store:{}}
            index = data[this.name].index
            store = data[this.name].store
            this.fn(this.name, callback).call(this, this)
        },

        keys: function (callback) {
            this.fn('keys', callback).call(this, index)
            return this
        },

        save: function (obj, cb) {
            // data[key] = value + ''; // force to string
            // window.top.name = JSON.stringify(data);
            var key = obj.key || this.uuid()
            this.exists(key, function(exists) {
                if (!exists) {
                    if (obj.key) delete obj.key
                    index.push(key)
                }
                store[key] = obj
                window.top.name = JSON.stringify(data) // TODO wow, this is the only diff from the memory adapter
                if (cb) {
                    obj.key = key
                    this.lambda(cb).call(this, obj)
                }
            })
            return this
        },

        batch: function (objs, cb) {
            var r = []
            for (var i = 0, l = objs.length; i < l; i++) {
                this.save(objs[i], function(record) {
                    r.push(record)
                })
            }
            if (cb) this.lambda(cb).call(this, r)
            return this
        },
        
        get: function (keyOrArray, cb) {
            var r;
            if (this.isArray(keyOrArray)) {
                r = []
                for (var i = 0, l = keyOrArray.length; i < l; i++) {
                    r.push(store[keyOrArray[i]]) 
                }
            } else {
                r = store[keyOrArray]
                if (r) r.key = keyOrArray
            }
            if (cb) this.lambda(cb).call(this, r)
            return this 
        },
        
        exists: function (key, cb) {
            this.lambda(cb).call(this, !!(store[key]))
            return this
        },

        all: function (cb) {
            var r = []
            for (var i = 0, l = index.length; i < l; i++) {
                var obj = store[index[i]]
                obj.key = index[i]
                r.push(obj)
            }
            this.fn(this.name, cb).call(this, r)
            return this
        },
        
        remove: function (keyOrArray, cb) {
            var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
            for (var i = 0, l = del.length; i < l; i++) {
                delete store[del[i]]
                index.splice(this.indexOf(index, del[i]), 1)
            }
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this
        },

        nuke: function (cb) {
            store = {}
            index = []
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this 
        }
    }
/////
})())

};
});

// Load lawnchair core and appropriate adapters.
define('lawnchair/lawnchair',['./core',
        // use these adapters, in this order (prefer the first)
        './adapters/indexed-db.js',
        './adapters/dom.js',
        './adapters/window-name.js'], function(Lawnchair) {

            // go through arguments from last to first
            for (var i=arguments.length-1; i>0; i--) {
                arguments[i](Lawnchair);
            }

            // return the Lawnchair interface
            return Lawnchair;
        });

// use the requirejs plugin interface so that we can delay startup until the
// lawnchair has loaded.
define('nell',['./alea', './lawnchair/lawnchair'], function(Alea, Lawnchair) {
    var NELL_COLORS = [ 'n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8',
                        'n9', 'n10' ];
    var random = Alea.Random();

    var getDefault = function(lawnchair, key, defaultValue, callback) {
        lawnchair.exists(key, function(exists) {
            if (exists) {
                lawnchair.get(key, callback);
            } else {
                callback(defaultValue);
            }
        });
    };

    var Nell = function(lawnchair, color) {
        this.lawnchair = lawnchair;
        if (color) {
            this.setColor(color);
        } else {
            this.setColor(random.choice(NELL_COLORS));
            this.saveColor();
        }
    };
    Nell.prototype = {};
    Nell.prototype.setColor = function(color) {
        document.body.classList.remove(this.color||'n0');
        this.color = color;
        document.body.classList.add(this.color);
    };
    Nell.prototype.saveColor = function() {
        this.lawnchair.save({ key:'color', value: this.color,
                              timestamp: Date.now() }, function(){});
    };
    Nell.prototype.switchColor = function() {
        var otherColors = NELL_COLORS.filter(function(c) {
            return c !== this.color;
        }.bind(this));
        this.setColor(random.choice(otherColors));
        this.saveColor();
        if (this.funf) {
            this.funf.record('colorchange', this.color);
        }
    };

    var makeNellAsync = function(callback) {
        var withLawnchair = function(lawnchair) {
            getDefault(lawnchair, 'color', null, function(color) {
                callback(new Nell(lawnchair, color && color.value));
            });
        };
        Lawnchair({name:'nell'}, function() { withLawnchair(this); });
    };

    return {
        load: function(name, req, onLoad, config) {
            if (config.isBuild || typeof document==='undefined') {
                // indicate that this plugin can't be inlined
                onLoad(null);
            } else {
                makeNellAsync(onLoad);
            }
        }
    };
});

// use the requirejs plugin interface so that we can delay startup until the
// lawnchair has loaded.
define('score',['./lawnchair/lawnchair'], function(Lawnchair) {

    var getDefault = function(lawnchair, key, defaultValue, callback) {
        lawnchair.exists(key, function(exists) {
            if (exists) {
                lawnchair.get(key, callback);
            } else {
                callback(defaultValue);
            }
        });
    };

    var Score = function(lawnchair, unlocked) {
        this.lawnchair = lawnchair;
        this.unlocked = unlocked || {};
    };
    Score.prototype = {};
    Score.prototype._get = function(level, altitude, create) {
        if (!this.unlocked[level]) {
            if (!create) { return {}; }
            this.unlocked[level] = {};
        }
        if (!this.unlocked[level][altitude]) {
            if (!create) { return {}; }
            this.unlocked[level][altitude] = {};
        }
        return this.unlocked[level][altitude];
    };
    Score.prototype.isCompleted = function(level, altitude) {
        return !!(this._get(level, altitude).firstCompleted);
    };
    Score.prototype.numStars = function(level, altitude) {
        return this._get(level, altitude).numStars || 0;
    };
    Score.prototype.setCompleted = function(level, altitude, numStars) {
        var info = this._get(level, altitude, true/*create*/);
        var prevStars = (info.numStars || 0);
        var isNew = (!info.firstCompleted) || (numStars > prevStars);
        if (!isNew) { return; }
        // new high score / not previously unlocked
        if (!info.firstCompleted) { info.firstCompleted = Date.now(); }
        info.lastCompleted = Date.now();
        info.numStars = numStars;
        if (this.funf) {
            this.funf.record('unlocked', {
                level:level,
                altitude:altitude,
                numStars: numStars,
                firstCompleted: info.firstCompleted
            });
        }
        this.save();
    };
    Score.prototype.save = function() {
        this.lawnchair.save({key: 'unlocked', value: this.unlocked});
    };

    var makeScoreAsync = function(callback) {
        var withLawnchair = function(lawnchair) {
            getDefault(lawnchair, 'unlocked', {}, function(unlocked) {
                callback(new Score(lawnchair, unlocked.value));
            });
        };
        Lawnchair({name:'score'}, function() { withLawnchair(this); });
    };

    return {
        load: function(name, req, onLoad, config) {
            if (config.isBuild || typeof document==='undefined') {
                // indicate that this plugin can't be inlined
                onLoad(null);
            } else {
                makeScoreAsync(onLoad);
            }
        }
    };
});

/*jshint white: false, onevar: false, strict: false, plusplus: false,
  nomen: false */
/*global define: false, window: false, document: false */

// Cross-platform sound pool.  Heavily hacked from the MIT licensed code in
// https://github.com/gladiusjs/gladius-core/blob/develop/src/sound/default.js
define('sound',[], function() {

    // Default number of audio instances to clone
    var DEFAULT_INSTANCES = 4;

    var AUDIO_TYPES = {
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg',
        'wav': 'audio/wav',
        'aac': 'audio/aac',
        'm4a': 'audio/x-m4a'
    };

    // Cross-browser Audio() constructor
    var Audio = (function() {
        return ('Audio' in window) ?
            window.Audio :
            function() {
                return document.createElement('audio');
            };
    }());

    function nop(){}

    var AudioPool = function( url, formats, instances, callback, errback ) {
        var audio = new Audio(),
        cloningDone = false, // work around https://bugzilla.mozilla.org/show_bug.cgi?id=675986
        clones = [];

        // XXXhumph do we want to have this be configurable for late load?
        audio.autobuffer = true;
        audio.preload = 'auto';

        // XXXhumph do we want to keep some kind of state to know if things worked?
        audio.addEventListener('error', function() {
            errback(audio.error);
        }, false);
        audio.addEventListener('canplaythrough', function() {
            if (cloningDone) {
                return;
            }
            while ( instances-- ) {
                clones.push( audio.cloneNode( true ) );
            }
            cloningDone = true;
            callback();
        }, false);

        var getExt = function(filename) {
            return filename.split('.').pop();
        };

        var addSource = function(src) {
            var source = document.createElement('source');
            source.src = src;
            if (AUDIO_TYPES[ getExt(src) ]) {
                source.type = AUDIO_TYPES[ getExt(src) ];
            }
            audio.appendChild(source);
        };

        if (formats && formats.length > 0) {
            formats.forEach(function(f) {
                addSource(url + '.' + f);
            });
        } else {
            addSource(url);
        }

        this.getInstance = function() {
            var clone,
            count,
            i;

            for ( i = 0, count = clones.length; i < count; i++) {
                clone = clones[i];

                if ( clone.paused || clone.ended ) {
                    if ( clone.ended ) {
                        clone.currentTime = 0;
                    }
                    return clone;
                }
            }

            // Rewind first one if none are available
            if (clones.length===0) {
                return null;
            }
            clone = clones[0];
            clone.pause();
            clone.currentTime = 0;

            return clone;
        };
        // hackity hackity; this is a leak in our API
        var loopFunc = function() {
            audio.currentTime = 0;
            audio.play();
        };
        this.loop = function() {
            audio.loop = true;
            audio.addEventListener('ended', loopFunc, false);
            audio.play();
        };
        this.unloop = function() {
            if (!audio.loop) { return; /* only unloop once */ }
            audio.pause();
            audio.removeAttribute('loop');
            audio.removeEventListener('ended', loopFunc, false);
            audio.currentTime = 0;
        };
    };
    if (window.cordovaDetect) {
        // use PhoneGap Media class.
        AudioPool = function( url, formats, instances, callback, errback ) {
            var clones = [], ready = [];
            url = '/android_asset/www/'+url;
            if (formats && formats.length > 0) {
                url += '.' + formats[0];
            }
            this.getInstance = function() {
                var clone, count, i;

                for ( i = 0, count = clones.length; i < count; i++) {
                    clone = clones[i];
                    if (ready[i]) {
                        clone.seekTo(0);
                        ready[i] = false;
                        return clone;
                    }
                }
                if (count < instances) {
                    // make a new clone
                    clones[count] = clone = new Media(url, function() {
                        ready[count] = true;
                    });
                    ready[count] = false;
                    return clone;
                }
                // Rewind first one if none are available
                if (clones.length===0) {
                    return null;
                }
                clone = clones[0];
                clone.seekTo(0);

                return clone;
            };
            var loop = null;
            this.loop = function() {
                var nloop; // local scoped var
                if (loop) { this.unloop(); } // abnormal
                var completeFunc = function() {
                    if (loop===null || loop.id !== nloop.id) {
                        return; /* stop */
                    }
                    nloop.seekTo(0);
                    nloop.play();
                };
                loop = nloop = new Media(url, completeFunc);
                loop.play();
            };
            this.unloop = function() {
                var oloop = loop;
                loop = null;
                if (oloop) {
                    oloop.stop();
                    oloop.release();
                }
            };
            callback();
        };
    }


    function load( Type, options ) {
        var snd = new Type({
            url: options.url,
            instances: options.instances,
            callback: options.callback,
            errback: options.errback
        });
    }

    function Effect( options ) {
        var url = options.url;
        if ( !url ) {
            throw "you must pass a URL to Effect.";
        }

        var pool = new AudioPool(
            url,
            options.formats || [],
            options.instances || DEFAULT_INSTANCES,
            options.callback ?
                (function( track, callback ) {
                    return function() {
                        callback( track );
                    };
                }( this, options.callback )) : nop,
            options.errback || nop
        );

        this.__defineGetter__( 'audio', function() {
            return pool.getInstance();
        });

        this.__defineGetter__( 'url', function() {
            return url;
        });
        this.play = function() {
            var audio = this.audio;
            // handle case where sound is not yet loaded.
            if (!audio) { return null; }
            audio.play();
            return audio;
        };
        this.loop = function() { pool.loop(); };
        this.unloop = function() { pool.unloop(); };
    }
    Effect.load = function( options ) {
        load( Effect, options );
    };

    /**
     * A special-case Effect with only one audio instance (no clones).
     */
    function Track( options ) {
        // Force a single audio
        options.instances = 1;
        Effect.call( this, options );
    }
    Track.load = function( options ) {
        load( Track, options );
    };

    return {
        Effect: Effect,
        Track: Track
    };
});

define('version',[], function() {
    // the version of the nell-balloons source code.
    return "6";
});

define('index',['domReady!', './alea', './compat', './funf', 'nell!', 'score!', 'sound', './version'], function(document, Alea, Compat, Funf, nell, score, Sound, version) {
    var DOCUMENT_TITLE = document.title = "Nell's Balloons";
    var MUSIC_URL = 'sounds/barrios_gavota';
    var COLORS = [ 'black', 'lilac', 'orange', 'yellow' ]; // also 'white'
    var MIN_BALLOON_SPEED_Y =   50 / 1000; /* pixels per ms */
    var MAX_BALLOON_SPEED_Y =  800 / 1000; /* pixels per ms */
    var X_SPEED_FRACTION = 0.25; // fraction of y speed
    var BALLOON_SEPARATION_MS = 1000;

    var initialBalloonSpeedY = MIN_BALLOON_SPEED_Y; /* pixels per ms */

    var NUM_BALLOONS = 2;
    var ENABLE_ACCEL = false;
    var DEBUG_AWARD_OFTEN = false;
    var HTML5_HISTORY = history.pushState && history.replaceState;
    var random = Alea.Random();
    var gameElement = document.getElementById('game');
    var buttonsElement = document.getElementById('buttons');
    var balloonsElement = document.getElementById('balloons');
    var funf = nell.funf = score.funf = new Funf('NellBalloons'+version);
    var buttons, handleButtonPress;
    var refresh;
    var SPROUTS;

    var ALTITUDES = ['ground', 'troposphere', 'stratosphere', 'mesosphere'];
    // make reverse mapping as well.
    ALTITUDES.forEach(function(a, i) { ALTITUDES[a] = i; });
    ALTITUDES.toNum = function(a) { return ALTITUDES[a]; };

    var AWARDS = [['a1', 1/2+1/2],
                  ['a2', 1/4+1/4],
                  ['a3', 1/8+1/6],
                  ['a4', 1/16+1/8],
                  ['a5', 1/32+1/10],
                  ['a6', 1/64+1/12]];

    var elForEach = function(elementList, func) {
        var i;
        for (i=0; i<elementList.length; i++) {
            func(elementList[i], i);
        }
    };

    var awardCounter = 0;
    var pickAward = function() {
        // every N awards, choose from only unwon awards
        awardCounter = (awardCounter+1) % 6;
        var i, sprout;
        for (i=0, sum=0; i<AWARDS.length; i++) {
            if (!awardCounter) {
                sprout = SPROUTS[AWARDS[i][0]];
                if (sprout.size >=0) { continue; }
            }
            sum += AWARDS[i][1];
        }
        var v = random() * sum;
        for (i=0, sum=0; i<AWARDS.length; i++) {
            if (!awardCounter) {
                sprout = SPROUTS[AWARDS[i][0]];
                if (sprout.size >=0) { continue; }
            }
            sum += AWARDS[i][1];
            if (v < sum) { return AWARDS[i][0]; }
        }
        // should never get here
        return AWARDS[AWARDS.length-1][0];
    };
    var loseAward = function() {
        var i;
        for (i=0; i<AWARDS.length; i++) {
            var sprout = SPROUTS[AWARDS[i][0]];
            if (sprout.size >= 0) {
                sprout.shrink();
                if (sprout.size < 0) {
                    var elem = document.querySelector('#awards .award.'+AWARDS[i][0]);
                    elem.classList.remove('show');
                }
                return;
            }
        }
    };
    var checkForFinishedLevel = function() {
        for (i=0; i<AWARDS.length; i++) {
            var sprout = SPROUTS[AWARDS[i][0]];
            if (sprout.size < 0) {
                return; // level not done yet!
            }
        }
        // ok, level done!
        if (GameMode.currentMode !== GameMode.Playing) {
            return; /* we're already transitioning */
        }
        // record sprouts sizes
        var sproutsizes = AWARDS.map(function(a) {
            return SPROUTS[a[0]].size;
        });
        // tell funf about completion
        funf.record('mode', {
            name: 'playing',
            type: 'levelcomplete',
            stars: Ruler.stars,
            streak: Ruler.streak,
            smoothedHeight: Ruler.smoothedHeight,
            sprouts: sproutsizes,
            level: GameMode.Playing.currentLevel.num,
            altitude: ALTITUDES.toNum(GameMode.Playing.currentAltitude)
        });
        // unlock next level
        score.setCompleted(GameMode.Playing.currentLevel.levelClass,
                           GameMode.Playing.currentAltitude,
                           Ruler.stars);
        // play congratulatory sound!
        stopMusic();
        LEVEL_SOUNDS[0].play();
        //  award stars!
        GameMode.StarThrob.push();
    };

    var ColoredElement = function(element, color) {
        this.domElement = element;
        this.domElement.classList.add(color);
        this.color = color;
    };
    ColoredElement.prototype = {};
    ColoredElement.prototype.reset = function(color) {
        this.domElement.classList.remove(this.color);
        this.domElement.classList.add(color);
        this.color = color;
    };
    ColoredElement.prototype.attach = function(parent) {
        parent.appendChild(this.domElement);
    };
    ColoredElement.prototype.detach = function() {
        this.domElement.parentElement.removeChild(this.domElement);
    };

    var ClickableElement = function(color) {
        ColoredElement.call(this, document.createElement('a'), color);
        this.domElement.href='#';
        // android sometimes delivers events like:
        // touchstart, <dom mutation> touchcancel, mousedown mouseup
        // that results in double taps, which is bad.  ignore all mouse*
        // events on android as a hacky workaround.
        var isAndroid = !!window.cordovaDetect;
        ['mousedown', 'touchstart'].forEach(function(evname) {
            if (isAndroid && evname[0]==='m') { return; }
            this.domElement.addEventListener(evname,this.highlight.bind(this), false);
        }.bind(this));
        ['mouseup','mouseout','touchcancel','touchend'].forEach(function(evname){
            if (isAndroid && evname[0]==='m') { return; }
            this.domElement.addEventListener(evname, this.unhighlight.bind(this), false);
        }.bind(this));
        this.domElement.addEventListener('click', function(event) {
            // suppress 'click' event, which would change the history.
            event.preventDefault();
        }, false);
        this.ignoreMouse = false;
    };
    ClickableElement.prototype = Object.create(ColoredElement.prototype);
    ClickableElement.prototype.highlight = function(event) {
        switch (event.type) {
        case 'touchstart': this.ignoreMouse = true; break;
        case 'mousedown': if (this.ignoreMouse) { return; } break;
        }
        this.domElement.classList.add('hover');
        event.preventDefault();
        if (this.fast && this.ignoreMouse) { this.handleClick(); }
    };
    ClickableElement.prototype.unhighlight = function(event) {
        switch (event.type) {
        case 'mouseup':
        case 'mouseout':
            if (this.ignoreMouse) { return; } break;
        }
        this.domElement.classList.remove('hover');
        event.preventDefault();
        if (event.type !== 'touchcancel' &&
            event.type !== 'mouseout' &&
            !(this.fast && this.ignoreMouse)) {
            this.handleClick();
        }
        this.ignoreMouse = false;
    };

    var Button = function(color) {
        ClickableElement.call(this, color);
        this.attach(buttonsElement);
        this.fast = true; // fast button response
    };
    Button.prototype = Object.create(ClickableElement.prototype);
    Button.prototype.handleClick = function() {
        if (GameMode.currentMode !== GameMode.Playing) { return; }
        handleButtonPress(this.color);
    };

    var MenuTag = function(altitude) {
        ClickableElement.call(this, 'tag');
        this.altitude = altitude;
    };
    MenuTag.prototype = Object.create(ClickableElement.prototype);
    MenuTag.prototype.handleClick = function() {
        this.altitudeClicked(this.altitude);
    };

    var Balloon = function(color) {
        color = color || random.choice(buttons).color;
        ColoredElement.call(this, document.createElement('div'), color);
        this.balloon = document.createElement('div');
        this.balloon.classList.add('balloon');
        this.payload = document.createElement('div');
        this.payload.classList.add('payload');
        this.domElement.appendChild(this.payload); /* payload in back */
        this.domElement.appendChild(this.balloon); /* balloon in front */
        this.attach(balloonsElement);
        // starting x, y, and speed
        // pick a random x position
        this.reset(this.color); // set random bits.
        this.refresh();
    };
    Balloon.prototype = Object.create(ColoredElement.prototype);
    Balloon.prototype.doBirth = function() {
        this.born = true;
        this.bornTime = Date.now();
        this.pauseTime = 0;

        // just in case element sizes change
        this.height = this.domElement.offsetHeight;
        this.maxx = balloonsElement.offsetWidth - this.domElement.offsetWidth;
        // now reset properties
        this.x = Math.floor(random() * this.maxx);
        this.y = balloonsElement.offsetHeight;
        this.fastY = this.y - this.height;
        // speeds are in pixels / second.
        this.speedy = (0.9+0.2*random()) * initialBalloonSpeedY;
        this.speedx = (2*random()-1) * this.speedy * X_SPEED_FRACTION;

        funf.record('born', this.color);
    };
    Balloon.prototype.reset = function(color) {
        color = color || random.choice(buttons).color;
        if (color !== this.color) {
            ColoredElement.prototype.reset.call(this, color);
        }
        this.born = false; this.bornTime = this.pauseTime = 0;
        this.bornTimeout = 0; // born immediately by default
        this.popped = this.popDone = false;
        this.domElement.classList.remove('popped');
        this.domElement.classList.remove('squirt');
        this.domElement.classList.remove('payload-dropped');
        this.award = null;
        // ensure that unborn balloon is invisible
        this.x = 0;
        this.y = balloonsElement.offsetHeight;
    };
    Balloon.prototype.refresh = function() {
        if (this.popped) { return; }
        var transform = Math.round(this.x)+'px,'+Math.round(this.y)+'px';
        // the '3d' is actually very important here: it enables
        // GPU acceleration of this transform on webkit
        this.domElement.style.WebkitTransform =
            'translate3d('+transform+',0)';
        this.domElement.style.MozTransform =
            this.domElement.style.transform =
            'translate('+transform;+')';
    };
    Balloon.prototype.update = function(dt /* milliseconds */) {
        if (!this.born) {
            // don't move until it's born
            this.bornTimeout -= dt;
            if (this.bornTimeout < 0) {
                this.doBirth();
            }
            return;
        }
        if (this.popped) {
            // don't move after it's popped.
            this.popTimeout -= dt;
            if (this.popTimeout < 0) {
                this.popDone = true;
                if (this.domElement.classList.contains('squirt')) {
                    random.choice(BURST_SOUNDS).play();
                }
                if (this.award) {
                    var elem = document.querySelector(
                        '#awards .award.'+this.award);
                    var sprout = SPROUTS[this.award];
                    if (sprout.size >= 0) {
                        // deal w/ race -- maybe we lost this one already!
                        elem.classList.add('show');
                    }
                    elem.style.WebkitTransform =
                        elem.style.MozTransform =
                        elem.style.transform = '';
                    var flex = document.querySelector('#awards .award.flex');
                    flex.style.display = 'none';

                    checkForFinishedLevel();
                }
            }
            return;
        }
        // faster until we get past the grass at the bottom.
        if (this.y > this.fastY) {
            // amount of time taken to get above fastY pixels at
            // MAX_BALLOON_SPEED_Y;
            var fastT = (this.y - this.fastY) / MAX_BALLOON_SPEED_Y;
            if (fastT > dt) {
                this.y -= dt * MAX_BALLOON_SPEED_Y;
            } else {
                this.y = this.fastY - (dt-fastT) * this.speedy;
            }
        } else {
            this.y -= dt * this.speedy;
        }
        this.x += dt * this.speedx;
        if (this.x < 0) {
            this.x = 0; this.speedx = 0;
        }
        if (this.x > this.maxx) {
            this.x = this.maxx; this.speedx = 0;
        }
        // XXX drift x left and right?
    };
    Balloon.prototype.isGone = function() {
        if (!this.born) { return false; }
        // returns true if balloon has floated past top of screen
        return (this.y < -this.height) || this.popDone;
    };
    Balloon.prototype.pop = function() {
        this.popped = true;
        // chance of award
        var isAward = (random() < (1/3.5)); // 1-in-4 chance of an award
        // XXX: switch to "every 4th balloon is an award?"
        if (DEBUG_AWARD_OFTEN) { isAward = true; } // award always, for testing
        // run popping animation & sound effect
        var isSquirt = (random() < (1/15)); // 1-in-15 chance of a squirt
        // play balloon burst sound
        var sounds = isAward ? AWARD_SOUNDS : isSquirt ? SQUIRT_SOUNDS :
            BURST_SOUNDS;
        random.choice(sounds).play();
        this.domElement.classList.add('payload-dropped');

        if (isAward) {
            this.domElement.classList.add('popped');
            this.popTimeout = 250;
            // move an award up here.
            this.award = pickAward();
            var elem= document.querySelector('#awards .award.'+this.award);
            var sprout = SPROUTS[this.award];
            // do we already have this award?
            if (sprout.size >= 0) {
                // force the flex badge to fill in.
                var flex = document.querySelector('#awards .award.flex');
                flex.style.top = elem.offsetTop+'px';
                flex.style.left = elem.offsetLeft+'px';
                flex.style.display = 'block';
                flex.className = 'award flex '+this.award;
                elem = flex;
                this.popTimeout = 750;
            }
            var offsetY = elem.offsetTop + elem.offsetParent.offsetTop;
            var offsetX = elem.offsetLeft + elem.offsetParent.offsetLeft;
            var x = Math.round(this.x - offsetX + 23 /* center on balloon */);
            var y = Math.round(this.y - offsetY + 20 /* center on balloon */);
            var transform = x+'px,'+y+'px';
            elem.style.WebkitTransform=
                'translate3d('+transform+',0)';
            elem.style.MozTransform=
                elem.style.transform=
                'translate('+transform+')';
            sprout.grow();
            saveScore();
        } else if (isSquirt) {
            this.domElement.classList.add('squirt');
            this.popTimeout = 2000; // ms
        } else {
            this.domElement.classList.add('popped');
            this.popTimeout = 250; // ms
        }
    };

    var SPROUT_SCALES = (function() {
        var scales = [
            [0.143, 0.078] // smallest  (34x69)
        ];
        var stepsTo = function(n, end) {
            var i, sx, sy;
            var start = scales[scales.length-1];
            for (i=1; i<=n; i++) {
                sx = (end[0] - start[0]) * i / n;
                sy = (end[1] - start[1]) * i / n;
                scales.push([start[0] + sx, start[1] + sy]);
            }
        };
        // fill out table
        stepsTo(1, [0.215, 0.118]); // small     (51x104)
        stepsTo(1, [0.287, 0.156]); // orig size (68x138)
        stepsTo(5, [0.857, 0.469]); // 3x size   (203x415) (~25px per step)
        stepsTo(16,[1.000, 1.000]); // large               (~25px per step)
        Object.freeze(scales);
        return scales;
    })();

    var Sprout = function(awardClass) {
        this.awardClass = awardClass;
        this.domElement = document.querySelector('#sprouts .award.'+awardClass);
        this.setSize(-1);
    };
    Sprout.prototype = {};
    Sprout.prototype.grow = function() { this.setSize(this.size+1); };
    Sprout.prototype.shrink = function() { this.setSize(this.size-1); };
    Sprout.prototype.setSize = function(nsize) {
        var transform, wktransform, scale;
        nsize = Math.max(-1, Math.min(nsize, SPROUT_SCALES.length-1));
        nsize = Math.round(nsize); // must be an integer
        if (this.size === nsize) { return; /* no change */ }
        this.size = nsize;
        if (nsize < 0) {
            this.domElement.classList.remove('show');
            transform = wktransform = '';
        } else {
            this.domElement.classList.add('show');
            scale = SPROUT_SCALES[nsize];
            transform = 'scale('+scale[0]+','+scale[1]+')';
            wktransform = 'translate3d(0,0,0) ' + transform;
        }
        this.domElement.style.WebkitTransform = wktransform;
        this.domElement.style.MozTransform =
            this.domElement.style.transform = transform;
        this.setTime();
    };
    Sprout.prototype.setTime = function(time, delay) {
        this.domElement.style.webkitTransitionDuration=
            this.domElement.style.mozTransitionDuration=
            this.domElement.style.transitionDuration=(time || '');
        this.domElement.style.webkitTransitionDelay=
            this.domElement.style.mozTransitionDelay=
            this.domElement.style.transitionDelay=(delay || '');
    };
    SPROUTS = {};
    AWARDS.forEach(function(a) {
        SPROUTS[a[0]] = new Sprout(a[0]);
    });
    Object.freeze(SPROUTS);

    // load recent score
    var loadScore = function() {
        if (!(score.recent && score.recent.length >= AWARDS.length)) {
            return;
        }
        AWARDS.forEach(function(a, i) {
            var sprout = SPROUTS[a[0]];
            sprout.setSize(score.recent[i]);
            if (sprout.size >= 0) {
                var elem = document.querySelector('#awards .award.'+a[0]);
                elem.classList.add('show');
            }
        });
    };
    var saveScore = function() {
        var nscore = AWARDS.map(function(a) {
            return SPROUTS[a[0]].size;
        });
        score.save(nscore);
    };
    //loadScore();

    buttons = [];
    var createButtons = function() {
        // remove any existing buttons
        while (buttons.length > 0) {
            b = buttons.pop();
            b.detach();
            // XXX remove event handlers?
        }
        // now create four new buttons
        var c = COLORS.slice(0); // make a copy
        random.shuffle(c);
        c.forEach(function(color) {
            var b = new Button(color);
            buttons.push(b);
            // add event handlers
        });
    };
    createButtons();
    // multitouch hack
    var handleMultitouch = function(event) {
        var changedTouches = event.changedTouches, i, j;
        for (i=0; i<changedTouches.length; i++) {
            var touch = changedTouches[i];
            for (j=0; j<buttons.length; j++) {
                var button = buttons[j];
                if (touch.target === button.domElement) {
                    if (event.type==='touchstart') {
                        button.domElement.classList.add('hover');
                        button.handleClick();
                    } else {
                        button.domElement.classList.remove('hover');
                    }
                }
            }
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    };
    ['touchstart', 'touchend', 'touchcancel'].forEach(function(evname) {
        document.getElementById('buttons').addEventListener(evname,
                                                            handleMultitouch,
                                                            true);
    });

    altitudeStars = [];
    var createMenuTags = function() {
        ALTITUDES.forEach(function(altitude) {
            var s = new MenuTag(altitude);
            s.attach(document.querySelector('#menu .awards > .'+altitude));
            altitudeStars.push(s);
        });
    };
    createMenuTags();


    var balloons = [];
    while (balloons.length < NUM_BALLOONS) {
        balloons.push(new Balloon());
        // xxx spread out y starting locations
    }

    // let accelerometer influence drift
    var accelID = null;
    var startAccelerometer = function() { return null; };
    var stopAccelerometer = function() { };
    var updateAcceleration = function(a) {
        if (a.y < -4) {
            balloons.forEach(function(b) { b.speedx -= 50; });
        } else if (a.y > 4) {
            balloons.forEach(function(b) { b.speedx += 50; });
        }
    };
    if (navigator.accelerometer) {
        startAccelerometer = function() {
            return navigator.accelerometer.watchAcceleration(updateAcceleration,
                                                             function() {},
                                                             { frequency: 80 });
        };
        stopAccelerometer = function(id) {
            navigator.accelerometer.clearWatch(id);
        };
    }

    var music;
    var playMusic = function(src) {
        if (music && music.origSrc !== src) {
            stopMusic();
            music = null;
        }
        if (!music) {
            music = new Sound.Track({ url: src, formats: ['ogg','mp3'] });
            music.origSrc = src;
        }
        music.loop();
    };
    var stopMusic = function() {
        if (music) {
            music.unloop();
        }
    };

    var loadSounds = function(sounds) {
        return sounds.map(function(url) {
            return new Sound.Effect({url: url, instances: 2,
                                     formats: ['ogg','mp3'] });
        });
    };

    var BURST_SOUNDS = loadSounds(['sounds/burst1',
                                   'sounds/burst2',
                                   'sounds/burst3',
                                   'sounds/burst4',
                                   'sounds/burst5',
                                   'sounds/burst6',
                                   'sounds/burst7']);
    var SQUIRT_SOUNDS = loadSounds(['sounds/deflate1',
                                    'sounds/deflate2']);
    var WRONG_SOUNDS = loadSounds(['sounds/wrong1']);
    var ESCAPE_SOUNDS = loadSounds(['sounds/wrong2']);
    var AWARD_SOUNDS = loadSounds(['sounds/award']);
    var LEVEL_SOUNDS = loadSounds(['sounds/levelwin',
                                   'sounds/levellose']);

    // utility method
    var _switchClass = function(elem, from, to, optProp) {
        var f = optProp ? (from && from[optProp]) : from;
        var t = optProp ? to[optProp] : to;
        if (f) { elem.classList.remove(f); }
        elem.classList.add(t);
        return to;
    };

    // ------------ game modes ---------------
    var GameMode = function(bodyClass) {
        this.bodyClass = bodyClass;
        this.active = false;
    };
    GameMode.prototype = {};
    GameMode.prototype.enter = function() {
        this.resume();
        document.body.classList.add(this.bodyClass);
        this.active = true;
    };
    GameMode.prototype.leave = function() {
        this.pause();
        document.body.classList.remove(this.bodyClass);
        this.active = false;
    };
    GameMode.prototype.pause = function() {
        document.body.classList.add('paused');
    };
    GameMode.prototype.resume = function() {
        document.body.classList.remove('paused');
    };
    GameMode.prototype.toJSON = function() {
        return { mode: this.bodyClass };
    };
    // static properties
    GameMode.currentMode = null;
    GameMode.switchTo = function(mode) {
        if (GameMode.currentMode) {
            GameMode.currentMode.leave();
        }
        GameMode.currentMode = mode;
        GameMode.currentMode.enter();
    };

    GameMode.Menu = new GameMode('menu');
    GameMode.Menu.toJSON = function() {
        return { mode: 'Menu', level: this.currentLevel.num };
    };
    GameMode.Menu.enter = (function(superEnter) {
        return function() {
            superEnter.call(this);
            funf.record('mode', { name: 'menu' });
            // sync the exposed altitudes from the current score object
            this.syncExposed();
        };
    })(GameMode.Menu.enter);
    GameMode.Menu.start = function(altitude) {
        // allow resuming the current level w/o reset
        if (GameMode.Playing.currentLevel !== this.currentLevel ||
            GameMode.Playing.currentAltitude !== altitude) {
            GameMode.Playing.switchLevel(this.currentLevel);
            GameMode.Playing.switchAltitude(altitude);
            GameMode.Playing.reset();
        }
        if (HTML5_HISTORY) { // update current menu level
            history.replaceState(GameMode.currentMode.toJSON(),
                                 DOCUMENT_TITLE+' | Menu', '#menu');
        }
        GameMode.switchTo(GameMode.Playing);
        if (HTML5_HISTORY) { // Android/Honeycomb doesn't support this
            history.pushState(GameMode.currentMode.toJSON(),
                              DOCUMENT_TITLE + ' | Play!',
                              '#play');
        }
        funf.record('mode', {
            name: 'playing',
            type: 'levelstart',
            level: GameMode.Playing.currentLevel.num,
            altitude: ALTITUDES.toNum(GameMode.Playing.currentAltitude)
        });
    };
    GameMode.Menu.switchLevel = function(level) {
        var levelElem = document.querySelector('#menu .level');
        this.currentLevel = _switchClass(levelElem, this.currentLevel, level,
                                         'levelClass');
        var dot = document.querySelector('#menu .levelnav .dot.on');
        if (dot) { dot.classList.remove('on'); }
        level.dot.classList.add('on');

        var prev = document.querySelector('#menu .levelnav .prev');
        prev.classList.remove('hidden');
        if (!level.prevLevel) { prev.classList.add('hidden'); }

        var next = document.querySelector('#menu .levelnav .next');
        next.classList.remove('hidden');
        if (!level.nextLevel) { next.classList.add('hidden'); }
        // sync the exposed altitudes from the current score object
        this.syncExposed();
    };
    GameMode.Menu.syncExposed = function() {
        this.setExposed('none', 0);
        if (this.currentLevel.prevLevel &&
            !score.isCompleted(this.currentLevel.prevLevel.levelClass,
                               ALTITUDES[ALTITUDES.length-1])) {
            // this level isn't unlocked yet. hide everything.
            return;
        }
        for (i=0; i < ALTITUDES.length; i++) {
            var numStars =
                score.numStars(this.currentLevel.levelClass, ALTITUDES[i]);
            this.setExposed(ALTITUDES[i], numStars);
            if (!score.isCompleted(this.currentLevel.levelClass, ALTITUDES[i])){
                break;
            }
        }
    };
    GameMode.Menu.setExposed = function(altitude, stars) {
        var shadeElem = document.querySelector('#menu .level');
        var old = this.currentExposed && ('exposed-'+this.currentExposed);
        _switchClass(shadeElem, old, 'exposed-'+altitude);
        this.currentExposed = altitude;
        if (altitude === 'none') { return; }
        // set the # of stars
        var starsElem = document.querySelector('#menu .awards > .'+altitude+' > .stars');
        ['zero','one','two','three'].forEach(function(name, num) {
            if (stars===num) {
                starsElem.classList.add(name);
            } else {
                starsElem.classList.remove(name);
            }
        });
    };
    GameMode.Menu.prevClicked = function() {
        if (!this.currentLevel.prevLevel) { return; }
        this.switchLevel(this.currentLevel.prevLevel);
    };
    GameMode.Menu.nextClicked = function() {
        if (!this.currentLevel.nextLevel) { return; }
        this.switchLevel(this.currentLevel.nextLevel);
    };
    ['prev', 'next'].forEach(function(arrow) {
        var e = new ClickableElement(arrow);
        e.attach(document.querySelector('#menu .levelnav .inner'));
        e.handleClick = GameMode.Menu[arrow+'Clicked'].bind(GameMode.Menu);
        GameMode.Menu[arrow+'Arrow'] = e;
    });
    MenuTag.prototype.altitudeClicked =
        GameMode.Menu.start.bind(GameMode.Menu);

    GameMode.OverlayMode = function(bodyClass) {
        GameMode.call(this, bodyClass);
        this.underMode = null;
    };
    GameMode.OverlayMode.prototype = Object.create(GameMode.prototype);
    GameMode.OverlayMode.prototype.setUnderMode = function(underMode) {
        this.underMode = this.active ?
            _switchClass(document.body, this.underMode, underMode, 'bodyClass'):
            underMode;
    };
    GameMode.OverlayMode.prototype.push = function() {
        this.lastMode = GameMode.currentMode;
        this.setUnderMode(GameMode.currentMode.underMode ||
                          GameMode.currentMode);
        GameMode.switchTo(this);
    };
    GameMode.OverlayMode.prototype.pop = function() {
        console.assert(GameMode.currentMode === this);
        GameMode.switchTo(this.lastMode);
    };
    GameMode.OverlayMode.prototype.enter = (function(superEnter) {
        return function() {
            superEnter.call(this);
            if (this.underMode)
                document.body.classList.add(this.underMode.bodyClass);
        };
    })(GameMode.OverlayMode.prototype.enter);
    GameMode.OverlayMode.prototype.leave = (function(superLeave) {
        return function() {
            superLeave.call(this);
            if (this.underMode)
                document.body.classList.remove(this.underMode.bodyClass);
        };
    })(GameMode.OverlayMode.prototype.leave);

    GameMode.TransitionOverlayMode = function(bodyClass, delayMs) {
        GameMode.OverlayMode.call(this, bodyClass);
        this.delayMs = delayMs;
        this.switchId = null;
    };
    GameMode.TransitionOverlayMode.prototype =
        Object.create(GameMode.OverlayMode.prototype);
    GameMode.TransitionOverlayMode.prototype.nextMode = function() { };
    GameMode.TransitionOverlayMode.prototype.enter = (function(superEnter) {
        return function() {
            superEnter.call(this);
            // in 5s, move to the next overlay
            var isAndroid = window.device &&
                (window.device.platform==='Android');

            var dt = this.delayMs;
            this.switchTime = Date.now() + dt;
            this.switchId = setTimeout(this.switchMode.bind(this),
                                       /* android's setTimeout takes its sweet
                                        * time, so hack around it */
                                       isAndroid && dt ? 250 : dt);
        };
    })(GameMode.TransitionOverlayMode.prototype.enter);
    GameMode.TransitionOverlayMode.prototype.leave = (function(superLeave) {
        return function() {
            superLeave.call(this);
            if (this.switchId === null) { return; }
            clearTimeout(this.switchId);
            this.switchId = null;
        };
    })(GameMode.TransitionOverlayMode.prototype.leave);
    GameMode.TransitionOverlayMode.prototype.switchMode = function() {
        // handle late-or-premature invocation on Android (sigh)
        if (Date.now () < this.switchTime) {
            this.switchId = setTimeout(this.switchMode.bind(this), 10);
            return;
        }
        this.switchId = null;
        // give subclass a chance to transition
        if (!this.nextMode()) { this.pop(); }
    };

    GameMode.StarThrob = new GameMode.TransitionOverlayMode('starthrob', 5000);
    GameMode.StarThrob.enter = (function(superEnter) {
        return function() {
            // tweak the timing if there are no stars to flash
            this.delayMs = (Ruler.stars===0) ? 0 : 5000;
            superEnter.call(this);
        };
    })(GameMode.StarThrob.enter);
    GameMode.StarThrob.nextMode = function() {
        // android massacres this animation, sigh.
        var isAndroid = !!window.cordovaDetect;
        // grow sprouts up to next level
        AWARDS.forEach(function(a) {
            var sprout = SPROUTS[a[0]];
            if (sprout.size >= 0) {
                if (!isAndroid) {
                    sprout.setSize(SPROUT_SCALES.length);
                    sprout.setTime('3s');
                } else {
                    sprout.setSize(-1);
                }
            }
        });
        if (isAndroid) { GameMode.SproutsGrow.delayMs = 0; }
        GameMode.SproutsGrow.push(); // delay while sprouts grow
        return true; // did my own transition
    };

    GameMode.SproutsGrow = new GameMode.TransitionOverlayMode('sproutsgrow',
                                                              3000);
    GameMode.SproutsGrow.nextMode = function() {
        GameMode.Video.push();
        return true;
    };

    GameMode.Video = new GameMode.OverlayMode('video');
    GameMode.Video.enter = (function(superEnter) {
        return function() {
            superEnter.call(this);
            this.maybeUnloadVideo();
            // load the appropriate video and wait until ready to play
            var level = GameMode.Playing.currentLevel;
            var altitude = GameMode.Playing.currentAltitude;
            var inner = document.querySelector('#video > .inner');
            this.videoElement = document.createElement('video');
            this.videoElement.preload = 'auto';
            this.videoElement.volume = 1;
            this.videoElement.muted = false; // xxx?
            this.videoElement.addEventListener('canplay',
                                               this.canPlay.bind(this), false);
            // XXX something's wrong with mp4 rendering on webkit.
            [/*'mp4',*/ 'webm'].forEach(function(videotype) {
                var source = document.createElement('source');
                source.type = 'video/' + videotype;
                source.src = level.videoFor(altitude, videotype);
                this.videoElement.appendChild(source);
            }.bind(this));
            inner.insertBefore(this.videoElement, inner.firstChild);
            this.videoElement.load();
        };
    })(GameMode.Video.enter);
    GameMode.Video.canPlay = function() {
        // ready to play, let's do it!
        this.videoElement.addEventListener('ended',
                                           this.playEnded.bind(this), false);
        this.videoElement.play();
        document.querySelector('#video').classList.add('playing');
    };
    GameMode.Video.playEnded = function() {
        document.querySelector('#video').classList.remove('playing');
    };
    GameMode.Video.maybeUnloadVideo = function() {
        if (this.videoElement) {
            this.videoElement.parentElement.removeChild(this.videoElement);
            this.videoElement = null;
        }
        document.querySelector('#video').classList.remove('playing');
    };
    GameMode.Video.leave = (function(superLeave) {
        return function() {
            this.maybeUnloadVideo();
            superLeave.call(this);
        };
    })(GameMode.Video.leave);
    GameMode.Video.arrow = new ClickableElement('arrow');
    GameMode.Video.arrow.attach(document.querySelector('#video > .inner'));
    GameMode.Video.arrow.handleClick = function() {
        GameMode.LevelDone.push();
    };

    GameMode.LevelDone = new GameMode.TransitionOverlayMode('leveldone', 0);
    GameMode.LevelDone.nextMode = function() {
        if (GameMode.Playing.nextAltitude()) {
            GameMode.Playing.reset();
            AWARDS.forEach(function(a) {
                var sprout = SPROUTS[a[0]];
                sprout.setTime('0s', '1s');
            });
            // reset sound to match new level
            return false;
        } else if (HTML5_HISTORY) {
            this.currentLevel = GameMode.Playing.currentLevel;
            history.back();
            return true; // ???
        } else {
            GameMode.Menu.switchLevel(GameMode.Playing.currentLevel);
            GameMode.switchTo(GameMode.Menu);
            return true;
        }
    };

    GameMode.Rotate = new GameMode.OverlayMode('rotate');

    GameMode.Install = new GameMode.OverlayMode('install');
    document.querySelector('#install .yes').addEventListener('click',function(){
        GameMode.Install.maybeInstall(true);
    }, false);
    document.querySelector('#install .no').addEventListener('click',function(){
        GameMode.Install.maybeInstall(false);
    }, false);
    GameMode.Install.maybeInstall = function(doInstall) {
        var cb = function() { GameMode.Install.pop(); };
        if (doInstall) {
            GameMode.Install.doInstall(cb);
        } else {
            cb();
        }
    };

    GameMode.Playing = new GameMode('game');
    GameMode.Playing.toJSON = function() {
        return {
            mode: 'Playing',
            level: this.currentLevel.num,
            altitude: this.currentAltitude
        };
    };
    GameMode.Playing.reset = function() {
        initialBalloonSpeedY = MIN_BALLOON_SPEED_Y;
        balloons.forEach(function(b, i) {
            b.reset();
            b.bornTimeout = 1000 + (i*BALLOON_SEPARATION_MS);
            // race here with sizing of balloonselement, sigh.
            // i hope balloons are never more than a thousand pixels big
            b.x = balloonsElement.offsetWidth || -1000;
            b.y = balloonsElement.offsetHeight || -1000;
            b.refresh();
        });
        AWARDS.forEach(function(a) {
            var sprout = SPROUTS[a[0]];
            sprout.setSize(-1);
            sprout.setTime('0s');
        });
        elForEach(document.querySelectorAll('#awards .award'), function(a) {
            a.classList.remove('show');
            a.style.WebkitTransform =
                a.style.MozTransform =
                a.style.transform = '';
        });
        var flex = document.querySelector('#awards .award.flex');
        flex.style.display = 'none';

        Ruler.reset();
    };
    GameMode.Playing.switchLevel = function(level) {
        var levelElem = document.querySelector('#game #level');
        this.currentLevel = _switchClass(levelElem, this.currentLevel, level,
                                         'levelClass');
    };
    GameMode.Playing.switchAltitude = function(altitude) {
        var levelElem = document.querySelector('#game #level');
        this.currentAltitude = _switchClass(levelElem,
                                            this.currentAltitude, altitude);
    };
    GameMode.Playing.nextAltitude = function() {
        var a = (ALTITUDES.toNum(this.currentAltitude) + 1) % ALTITUDES.length;
        if (a === 0) {
            var l = this.currentLevel.nextLevel;
            if (l===null) {
                return false; // no more levels.
            }
            this.switchLevel(l);
        }
        this.switchAltitude(ALTITUDES[a]);
        return true;
    };
    GameMode.Playing.pause = (function(superPause) {
        return function() {
            superPause.call(this);
            this.pauseTime = Date.now();
            funf.record('status', 'pause');
            stopMusic();
            if (refresh.id !== null) {
                Compat.cancelAnimationFrame(refresh.id);
                refresh.id = null;
            }
            if (accelID !== null) {
                stopAccelerometer();
                accelID = null;
            }
            saveScore();
            funf.archive();
        };
    })(GameMode.Playing.pause);
    GameMode.Playing.resume = (function(superResume) {
        return function() {
            superResume.call(this);
            var timePaused = this.pauseTime - Date.now();
            funf.record('status', 'resume');
            playMusic(this.currentLevel.audioUrl());
            refresh.lastFrame = Date.now();
            if (refresh.id === null) {
                refresh.id = Compat.requestAnimationFrame(refresh);
            }
            if (accelID === null && ENABLE_ACCEL) {
                accelID = startAccelerometer();
            }
            balloons.forEach(function(b) {
                b.pauseTime += timePaused;
            });
        };
    })(GameMode.Playing.resume);
    GameMode.Playing.pauseTime = Date.now();

    // ------------ game levels --------------
    var GameLevel = function(levelClass) {
        this.levelClass = levelClass;
    };
    GameLevel.prototype = {};
    GameLevel.prototype.audioUrl = function() {
        var base = 'sounds/';
        switch (this.num) {
        default:
        case 0: base += 'barrios_gavota'; break;
        case 1: base += 'letting-go'; break;
        }
        return base;
    };
    GameLevel.prototype.videoFor = function(altitude, format) {
        var url = "video/SpaceBalloon"+(1+this.num)+"-"+(1+ALTITUDES.toNum(altitude));
        if (format==='mp4') {
            return url + "-400k128-2pass.mp4";
        } else {
            return url + "-200k64.webm";
        }
    };

    var LEVELS = [ new GameLevel('grass')/*, new GameLevel('sand')*/ ]; // XXX
    LEVELS.forEach(function(l, i) {
        l.num = i;
        l.prevLevel = LEVELS[i-1] || null;
        l.nextLevel = LEVELS[i+1] || null;
        l.dot = document.createElement('div');
        l.dot.classList.add('dot');
        document.querySelector('#menu .levelnav .inner').appendChild(l.dot);
    });


    // smoothing factor -- closer to 0 means more weight on present
    var CORRECT_SMOOTHING = 0.8;
    // number of correct answers as fraction of total (weighted average)
    var correctFraction = 0;
    // milliseconds per correct answer (weighted average)
    var correctTime = 10000;

    var adjustSpeeds = function(correctTime, correctFraction) {
        // try to adjust speed such that:
        // (a) correctFraction is about 80%
        // (b) the balloon travels 90% up the screen in 'correctTime' ms.
        var aspeed = Math.max(correctFraction/0.8, 0.8) * initialBalloonSpeedY;
        var bspeed = (balloonsElement.offsetHeight * 0.9) / correctTime;
        var avg = (aspeed + bspeed) / 2;
        // only allow it to speed up/slow down by factor of 1.2 each time
        var ADJ_FACTOR = 1.2;
        var minnew = Math.max(initialBalloonSpeedY / ADJ_FACTOR,
                              MIN_BALLOON_SPEED_Y);
        var maxnew = Math.min(initialBalloonSpeedY * ADJ_FACTOR,
                              MAX_BALLOON_SPEED_Y);
        initialBalloonSpeedY = Math.max(minnew, Math.min(maxnew, avg));
    };

    var Ruler = {
        SMOOTHING: 0.85,
        domElement: document.querySelector('#ruler .foreground'),
        reset: function() {
            this.smoothedHeight = 1;
            this.height = 1;
            this.stars = 0;
            this.streak = 0;
            elForEach(document.querySelectorAll('#ruler .stars'), function(s) {
                s.classList.remove('highlight');
            });
            this.domElement.style.height = '100%';
        },
        adjust: function(isCorrect, height /* 0-1 fraction */) {
            var altitude = GameMode.Playing.currentAltitude;
            var e;
            // correct answer bonus
            if (isCorrect) {
                height -= 0.1;
                this.streak++;
            } else {
                this.streak = 0;
                height = 1;
            }
            // reflect current % on the ruler element
            this.smoothedHeight =
                Math.max(0, Math.min(1, Ruler.SMOOTHING * this.smoothedHeight +
                                     (1 - Ruler.SMOOTHING) * height));
            this.height = this.smoothedHeight *
                Math.max(0.28, Math.pow(0.98, this.streak));

            var pct = 25 * (this.height + ALTITUDES.toNum(altitude));
            this.domElement.style.height = pct+'%';
            // light up one, two, or three stars
            var nStars = (this.height < 0.28) ? 3 :
                (this.height < 0.54) ? 2 :
                (this.height < 0.79) ? 1 : 0;

            var efors = function(s) {
                return document.querySelector('#ruler .'+altitude+' .stars.' +
                                              ['zero','one','two','three'][s]);
            };
            if (nStars !== this.stars) {
                e = efors(this.stars);
                if (e) { e.classList.remove('highlight'); }
                this.stars = nStars;
                e = efors(this.stars);
                if (e) { e.classList.add('highlight'); }
            }
        }
    };
    Ruler.reset();

    var correctAnswer = function(color, balloonTime, balloonHeight) {
        funf.record('correct', { color: color, time: balloonTime });
        // maintain weighted averages
        correctTime = CORRECT_SMOOTHING * correctTime +
            (1-CORRECT_SMOOTHING) * balloonTime;
        correctFraction = CORRECT_SMOOTHING * correctFraction +
            (1-CORRECT_SMOOTHING);
        // adjust speeds based on new fractions
        adjustSpeeds(correctTime, correctFraction);
        Ruler.adjust(true, balloonHeight);
    };
    var incorrectAnswer = function(how, balloonTime) {
        funf.record('incorrect', { type: how, time: balloonTime });

        // maintain weighted averages
        // since this answer is incorrect, use the time only if it
        // is greater than the current correctTime estimate.
        var correctTimeCopy = correctTime;
        if (balloonTime > correctTime) {
            correctTimeCopy = CORRECT_SMOOTHING * correctTime +
                (1 - CORRECT_SMOOTHING) * balloonTime;
        }
        correctFraction = CORRECT_SMOOTHING * correctFraction;

        // adjust speeds based on new fractions
        adjustSpeeds(correctTimeCopy, correctFraction);
        Ruler.adjust(false, 1);
    };

    var wrongLockoutID = null;
    var doubleTapLockoutID = null, doubleTapColor;
    handleButtonPress = function(color) {
        // remove the highest balloon of that color
        var i, b, best=null;
        for (i=0; i<balloons.length; i++) {
            b = balloons[i];
            if (b.color === color && b.born && !(b.isGone() || b.popped)) {
                if (best===null || b.y < best.y) {
                    best = b;
                }
            }
        }
        if (best===null) {
            // prevent double taps from being registered as wrong answers
            if (doubleTapLockoutID !== null && color == doubleTapColor) {
                return; /* ignore */
            }
            // prevent too many wrong answers from being recorded close together
            if (wrongLockoutID !== null) { return; }
            // ok, process the wrong answer
            random.choice(WRONG_SOUNDS).play();
            incorrectAnswer('click.'+color, /* XXX use the escape time */
                            Math.round(balloonsElement.offsetHeight /
                                       initialBalloonSpeedY));
            // lose an award (sigh)
            loseAward(); saveScore();
            wrongLockoutID = window.setTimeout(function() {
                wrongLockoutID = null;
            }, 500); // 0.5s time out after wrong answer
        } else {
            best.pop();
            correctAnswer(color, (Date.now() - best.bornTime) - best.pauseTime,
                          1-Math.max(0, best.y / balloonsElement.offsetHeight));
            // try to prevent a double tap being registered as a wrong answer.
            doubleTapColor = color;
            if (doubleTapLockoutID) {
                window.clearTimeout(doubleTapLockoutID);
            }
            doubleTapLockoutID = window.setTimeout(function() {
                doubleTapLockoutID = null;
            }, 500); // 0.5s double-tap lockout
        }
    };

    var onPause = function() { GameMode.currentMode.pause(); };
    var onResume = function() { GameMode.currentMode.resume(); };
    // Set the name of the hidden property and the change event for visibility
    var hidden="hidden", visibilityChange="visibilitychange";
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    var onVisibilityChange = function() {
        var wasHidden = true;
        return function(e) {
            var isHidden = document[hidden] || false;
            if (wasHidden === isHidden) { return; }
            wasHidden = isHidden;
            if (isHidden) { onPause(); } else { onResume(); }
        };
    }();
    document.addEventListener(visibilityChange, onVisibilityChange,
                              false);

    refresh = function() {
        refresh.id = null;
        var now = Date.now();
        var isBorn = false, isEscape = false;
        var i, b;
        var dt = Math.max(0, Math.min(now - refresh.lastFrame, 100));
        for (i=0; i<balloons.length; i++) {
            b = balloons[i];
            b.update(dt);
            if (b.isGone()) {
                if (!b.popped) {
                    isEscape = true;
                    incorrectAnswer('escape.'+b.color,
                                    (now - b.bornTime) - b.pauseTime);
                }
                isBorn = true;
                b.reset();
                // enforce separation between balloons
                if ((now - refresh.lastBorn) < BALLOON_SEPARATION_MS) {
                    b.bornTimeout = BALLOON_SEPARATION_MS -
                        (now - refresh.lastBorn);
                    refresh.lastBorn += BALLOON_SEPARATION_MS;
                } else {
                    refresh.lastBorn = now;
                }
            }
            b.refresh();
        }
        // play sounds down here so we only start one per frame.
        if (isEscape) {
            random.choice(ESCAPE_SOUNDS).play();
        }
        if (isBorn) {
            // XXX inflation sound here was very noisy =(
        }
        refresh.lastFrame = now;
        // keep playing (if we haven't changed modes)
        if (GameMode.currentMode===GameMode.Playing) {
            refresh.id = Compat.requestAnimationFrame(refresh);
        }
    };
    refresh.id = null;
    refresh.lastFrame = Date.now();
    refresh.lastBorn = 0;

    var handleNellTouch = function(ev) {
        if (ev.type === 'touchstart') {
            // prevent duplicate events
            ev.target.removeEventListener('mousedown', handleNellTouch, false);
        }
        ev.preventDefault();
        nell.switchColor();
    };
    ['mousedown','touchstart'].forEach(function(evname) {
        // hacky workaround for android: removeEventListener('mousedown')
        // doesn't work on android (sigh) so don't register it to begin with
        var isAndroid = !!window.cordovaDetect;
        if (isAndroid && evname[0]==='m') { return; }

        elForEach(document.querySelectorAll('.nells > div > div'),
                  function(nellElem) {
                      nellElem.addEventListener(evname, handleNellTouch, false);
                  });
    });

    var onPopState = function(event) {
        var State = event.state;
        if (!State) { return; }
        if (!State.mode) { return; }
        switch (State.mode) {
        case 'Playing':
            GameMode.Playing.switchLevel(LEVELS[State.level]);
            GameMode.Playing.switchAltitude(LEVELS[State.altitude]);
            GameMode.switchTo(GameMode.Playing);
            break;
        case 'Menu':
            if (GameMode.currentMode.currentLevel) {
                GameMode.Menu.switchLevel(GameMode.currentMode.currentLevel);
            } else {
                GameMode.Menu.switchLevel(LEVELS[State.level]);
            }
            GameMode.switchTo(GameMode.Menu);
            break;
        }
    };

    var processOrientation = function(isPortrait) {
        if (!isPortrait) {
            if (GameMode.currentMode !== GameMode.Rotate) {
                GameMode.Rotate.push();
                funf.record('orientation', 'landscape');
            }
        } else {
            if (GameMode.currentMode === GameMode.Rotate) {
                GameMode.Rotate.pop();
                funf.record('orientation', 'portrait');
            }
        }
    };
    var onOrientationChange = function(event) {
        // XXX this is xoom specific, we should really look at width/height
        var isXoom = (window.device &&
                      window.device.platform==='Android' &&
                      window.device.name==='tervigon');
        if (!isXoom) { return; }

        var isPortrait = !(window.orientation === 0 ||
                           window.orientation === 180);
        // Android sometimes gives bogus values on startup, so if this is the
        // first call to onOrientationChange, use document body size instead
        // (but note that document.body size is generally changed *after*
        // the orientationchange event is fired)
        if (!event) {
            isPortrait = (window.outerHeight >= window.outerWidth);
        }
        processOrientation(isPortrait);
    };

    function onDeviceReady() {
        funf.record('startColor', nell.color);
        funf.record('startVersion', version);

        // scale viewport width to be at least 800px
        var onResize = function() {
            var body = document.body;
            var width = body.parentElement.offsetWidth;
            if (width >= 800) {
                body.style.width =
                    body.style.height =
                    body.style.WebkitTransform =
                    body.style.MozTransform =
                    body.style.transform = '';
            } else {
                var scale = width / 800;
                body.style.width = '800px';
                body.style.height = (100/scale)+'%';
                var transform = 'scale('+scale+')';
                body.style.WebkitTransform = 'translate3d(0,0,0) '+transform;
                body.style.MozTransform = body.style.transform = transform;
            }
        };
        window.addEventListener('resize', onResize, false);
        onResize();

        // start in menu screen
        window.GameMode = GameMode;
        GameMode.Menu.switchLevel(LEVELS[0]);
        GameMode.switchTo(GameMode.Menu);
        if (HTML5_HISTORY) {
            history.replaceState(GameMode.currentMode.toJSON(),
                                 DOCUMENT_TITLE+' | Menu', '#menu');
            window.addEventListener('popstate', onPopState, false);
        }
        // install webapp?
        if (window && window.navigator &&
            window.navigator.mozApps &&
            window.navigator.mozApps.getSelf &&
            window.navigator.mozApps.install) {
            var request = window.navigator.mozApps.getSelf();
            request.onsuccess = function() {
                if (request.result) {
                    /* we're already installed, do nothing */
                    funf.record('installed', 'yes');
                } else {
                    /* not installed, prompt to install */
                    funf.record('installed', 'no');
                    GameMode.Install.doInstall = function(cb) {
                        var request = window.navigator.mozApps.install(
                            // XXX prefix not strictly required?
                            'http://nell-balloons.github.cscott.net/'+
                            'manifest.webapp');
                        request.onsuccess = function() {
                            funf.record('installed', 'success');
                            cb(true);
                        };
                        request.onerror = function() {
                            funf.record('installerror', this.error.name);
                            cb(false);
                        };
                    };
                    GameMode.Install.push();
                }
            };
            request.onerror = function() {
                funf.record('installerror', this.error.name);
                console.log('Error checking installation status: ' +
                            this.error.name);
            };
        }

        // orientation
        var isMobile = false;
        if (window.cordovaDetect) { isMobile = true; }
        else if (window.navigator) {
            // Hacky!  Why isn't there a simple method to tell whether
            // device orientation can change? (not portrait/landscape, but
            // orientation)
            var platform = window.navigator.platform.toLowerCase();
            var userAgent = window.navigator.userAgent.toLowerCase();
            if (platform.indexOf("android") >= 0 ||
                userAgent.indexOf("android;") >= 0 ||
                userAgent.indexOf("tablet;") >= 0 ||
                userAgent.indexOf("fennec") >= 0) {
                isMobile = true;
            }
            console.log('CSA: platform: '+platform);
            console.log('CSA: userAgent: '+userAgent);
        }
        console.log('CSA: isMobile: '+isMobile);
        if (isMobile) {
            // don't prompt to rotate screen on desktop browsers!
            if (window.matchMedia) { // most reliable method
                // (not supported by Honeycomb)
                var mql = window.matchMedia(
                    "screen and (orientation: landscape)");
                var queryListener = function(m) {
                    var isPortrait = !(m.matches);
                    processOrientation(isPortrait);
                };
                mql.addListener(queryListener);
                queryListener(mql);
            } else if ('orientation' in window) { // works on xoom
                window.addEventListener('orientationchange',
                                        onOrientationChange, false);
                onOrientationChange();
            }
        }

        // phonegap
        document.addEventListener("backbutton", function() {
            if (HTML5_HISTORY) {
                history.back();
            } else { // hack!
                if (GameMode.currentMode === GameMode.Playing) {
                    GameMode.switchTo(GameMode.Menu);
                }
            }
        }, false);
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        onVisibilityChange();
        // add top-level "anim" class unless we're on xoom/honeycomb/phonegap
        var isXoom = window.cordovaDetect && window.device &&
            (window.device.platform==='Android') &&
            //(window.device.version==='3.2.1') &&
            (window.device.name==='tervigon');
        if (!isXoom) { document.body.classList.add('anim'); }
    }
    if (window.cordovaDetect) {
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        console.log('not on phonegap');
        onDeviceReady();
    }
});