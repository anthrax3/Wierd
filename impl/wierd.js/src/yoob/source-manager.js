/*
 * This file is part of yoob.js version 0.8-PRE
 * Available from https://github.com/catseye/yoob.js/
 * This file is in the public domain.  See http://unlicense.org/ for details.
 */
if (window.yoob === undefined) yoob = {};

/*
 * A SourceManager co-operates with a Controller and maybe a PresetManager.
 * It is for editing a program/configuration in some editing interface
 * which is mutually exclusive, UI-wise, with the run/animation interface.
 */
yoob.SourceManager = function() {
    this.editor = undefined;
    this.display = undefined;
    this.panel = undefined;

    /*
     * editor: an element (usually a textarea) which stores the source code
     * display: an element which contains the animation/controller
     */
    this.init = function(cfg) {
        this.editor = cfg.editor;
        this.display = cfg.display;
        this.panel = this.makePanel();
        return this;
    };

    this.makeEditButton = function(container) {
        var button = document.createElement('button');
        button.innerHTML = "Edit";
        button.style.width = "5em";
        if (container) {
            container.appendChild(button);
        }
        button.onclick = function(e) {
            // heck I dunno
            this.editor.style.display = 'block';
            this.display.style.display = 'none';
        };
        return button;
    };

    /*
     * Loads a source text into the editor element.
     * You may need to override if your editor is not a textarea.
     */
    this.loadSource = function(text) {
        this.editor.value = text;
        if (this.onload) this.onload(text);
    };

    /*
     * Loads a source text into the source element.
     * Assumes it comes from an element in the document, so it translates
     * the basic HTML escapes (but no others) to plain text.
     */
    this.loadSourceFromHTML = function(html) {
        var text = html;
        text = text.replace(/\&lt;/g, '<');
        text = text.replace(/\&gt;/g, '>');
        text = text.replace(/\&amp;/g, '&');
        this.loadSource(text);
    };

    /*
     * This is the basic idea, but not fleshed out yet.
     * - Should we cache the source somewhere?
     * - While we're waiting, should we disable the UI / show a spinny?
     */
    this.loadSourceFromURL = function(url, errorCallback) {
        var http = new XMLHttpRequest();
        var $this = this;
        if (!errorCallback) {
            errorCallback = function(http) {
                $this.loadSource(
                    "Error: could not load " + url + ": " + http.statusText
                );
            }
        }
        http.open("get", url, true);
        http.onload = function(e) {
            if (http.readyState === 4 && http.responseText) {
                if (http.status === 200) {
                    $this.loadSource(http.responseText);
                } else {
                    errorCallback(http);
                }
            }
        };
        http.send(null);
    };

    this.initLocalStorage = function() {
        var supportsLocalStorage = (
            window['localStorage'] !== undefined &&
            window['localStorage'] !== null
        );
        /* this is all just demo-y for now */
        if (supportsLocalStorage) {
            // you will only get this from OTHER windows/tabs.
            var onstorage = function(e) {
                if (!e) { e = window.event; }
                alert(e.key + ',' + e.oldValue + ',' + e.newValue + e.url);
            };
            if (window.addEventListener) {
              window.addEventListener("storage", onstorage, false);
            } else {
              window.attachEvent("onstorage", onstorage);
            }
        
            localStorage.setItem('foo', 'bar');
            //alert(localStorage.getItem('foo'));
            //alert(localStorage.length);
            localStorage.removeItem('foo');
            //alert(localStorage.length);
            localStorage.setItem('foo', 'bar');
            //alert(localStorage.key(0));
            localStorage.clear();
            //alert(localStorage.length);
        }
    };

    this.makeButtonPanel = function(container) {
        var buttonPanel = document.createElement('div');
        container.appendChild(buttonPanel);
        var $this = this;
        var makeButton = function(action) {
            var button = document.createElement('button');
            button.innerHTML = action; // TODO: capitalize
            button.style.width = "5em";
            buttonPanel.appendChild(button);
            button.onclick = $this._makeEventHandler(button, action);
            $this.controls[action] = button;
            return button;
        };
        var keys = ["start", "stop", "step", "load", "edit", "reset"];
        for (var i = 0; i < keys.length; i++) {
            makeButton(keys[i]);
        }
        return buttonPanel;
    };
};