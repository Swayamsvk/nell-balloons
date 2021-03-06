/*jshint white: false, onevar: false, strict: false, plusplus: false,
  nomen: false */
/*global define: false, window: false, document: false */

// Cross-platform sound pool.  Heavily hacked from the MIT licensed code in
// https://github.com/gladiusjs/gladius-core/blob/develop/src/sound/default.js
define([], function() {

    // Default number of audio instances to clone
    var DEFAULT_INSTANCES = 4;

    var AUDIO_TYPES = {
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg',
        'wav': 'audio/wav',
        'aac': 'audio/aac',
        'webm': 'audio/webm',
        'm4a': 'audio/x-m4a'
    };

    // cache audio elements, rather than rely on garbage collection; this
    // seems to help on Android since gc is not prompt
    var AudioElementPool = (function() {
        var pool = [];
        // Cross-browser Audio() constructor
        var Audio = (function() {
            return ('Audio' in window) ?
                window.Audio :
                function() {
                    return document.createElement('audio');
                };
        }());
        return {
            pop: function() {
                return pool.length ? pool.pop() : new Audio();
            },
            push: function(audio) {
                // we could recycle audio elements here, but
                // firefox doesn't change the associated sound resources
                // (and chrome crashes even if we recycle elements)
                //pool.push(audio);
            }
        };
    })();

    function nop(){}

    var AudioPool = function( url, formats, instances, callback, errback ) {
        var audio = AudioElementPool.pop(),
        cloningDone = false, // work around https://bugzilla.mozilla.org/show_bug.cgi?id=675986
        clones = [];

        // XXXhumph do we want to have this be configurable for late load?
        audio.autobuffer = true;
        audio.preload = 'auto';

        // XXXhumph do we want to keep some kind of state to know if things worked?
        var onError = function() {
            audio.removeEventListener(audio, onError, false);
            errback(audio.error);
        };
        audio.addEventListener('error', onError, false);
        var onPlayThrough = function() {
            audio.removeEventListener('canplaythrough', onPlayThrough, false);
            if (cloningDone) {
                return;
            }
            while ( instances-- ) {
                clones.push( audio.cloneNode( true ) );
            }
            cloningDone = true;
            callback();
        };
        audio.addEventListener('canplaythrough', onPlayThrough, false);

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
            try {
                audio.currentTime = 0;
            } catch (e) {
                console.log("AUDIO PROBLEM: "+e);
            }
        };
        this.release = function() {
            this.unloop();
            // remove event listeners
            audio.removeEventListener('canplaythrough', onPlayThrough, false);
            audio.removeEventListener('error', onError, false);
            // free clones
            clones = null;
            // remove <source> elements
            while (audio.firstChild) {
                audio.removeChild(audio.firstChild);
            }
            // remove attributes
            audio.removeAttribute('preload');
            audio.removeAttribute('autobuffer');
            // push back into pool
            AudioElementPool.push(audio);
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
            this.release = function() {
                this.unloop();
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
        this.release = function() { pool.release(); };
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
