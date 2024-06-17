// Generated by CoffeeScript 1.12.7
(function() {
  var Dragster,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Dragster = (function() {
    function Dragster(el) {
      this.el = el;
      this.dragleave = bind(this.dragleave, this);
      this.dragenter = bind(this.dragenter, this);
      this.first = false;
      this.second = false;
      this.el.addEventListener("dragenter", this.dragenter, false);
      this.el.addEventListener("dragleave", this.dragleave, false);
      this.el.addEventListener("drop", this.dragleave, false);
    }

    Dragster.prototype.dragenter = function(event) {
      if (this.first) {
        return this.second = true;
      } else {
        this.first = true;
        this.customEvent = document.createEvent("CustomEvent");
        this.customEvent.initCustomEvent("dragster:enter", true, true, {
          dataTransfer: event.dataTransfer,
          sourceEvent: event
        });
        return this.el.dispatchEvent(this.customEvent);
      }
    };

    Dragster.prototype.dragleave = function(event) {
      if (this.second) {
        this.second = false;
      } else if (this.first) {
        this.first = false;
      }
      if (!this.first && !this.second) {
        this.customEvent = document.createEvent("CustomEvent");
        this.customEvent.initCustomEvent("dragster:leave", true, true, {
          dataTransfer: event.dataTransfer,
          sourceEvent: event
        });
        return this.el.dispatchEvent(this.customEvent);
      }
    };

    Dragster.prototype.removeListeners = function() {
      this.el.removeEventListener("dragenter", this.dragenter, false);
      this.el.removeEventListener("dragleave", this.dragleave, false);
      return this.el.removeEventListener("drop", this.dragleave, false);
    };

    Dragster.prototype.reset = function() {
      this.first = false;
      return this.second = false;
    };

    return Dragster;

  })();

  if (typeof module === 'undefined') {
    window.Dragster = Dragster;
  } else {
    module.exports = Dragster;
  }

}).call(this);