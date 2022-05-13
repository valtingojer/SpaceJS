  //selector base
  const h = (()=>{
    return {
      /*Verifu for null or undefined*/
      isNullOrUndefined: function(el) {
        return el === null || typeof el === "undefined" || el == "undefined";
      },
      /*Verifu for empty*/
      isEmpty: function(el) {
        return el == "" && el !== 0 && el !== false;
      },
      /*Verifu for zero value*/
      isZero: function(el) {
        return parseInt(el) == 0;
      },
      /*Verifu Null empty or undefined*/
      isNullEmptyOrUndefined: function(el) {
        return h.isNullOrUndefined(el) || h.isEmpty(el);
      },
      /*Verifu for null empty undefined or zero*/
      isNullEmptyUndefinedOrZero: function(el) {
        return h.isNullEmptyOrUndefined(el) || h.isZero(el);
      },
      /*Verifu for being object*/
      isObject: function(el) {
        return (
          (typeof el === "function" || typeof el === "object") &&
          !h.isNullEmptyUndefinedOrZero(el)
        );
      },
      /*Verifu for being function*/
      isFunction: function(el) {
        return (
          !!(el && el.constructor && el.call && el.apply) &&
          !h.isNullEmptyUndefinedOrZero(el)
        );
      },
      /*generate random int*/
      randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
      },
      /*get if number is between inclusive*/
      isBetweenInclusive: function(val, min, max) {
        return val >= min && val <= max;
      },
      /*get if number is between exclusive*/
      isBetweenExclusive: function(val, min, max) {
        return val > min && val < max;
      },
      /*get first of list or object it self*/
      firstOrDefault: function(el){
        return (_(el).length > 0) ? _(el)[0] : _(el);
      },
      /*convert array to unique values*/
      arrayUnique: function(value, index, self) {
        return self.indexOf(value) === index;
      },
      /*clamp string*/
      clampString: function(str, start, end){
        start = h.isNullEmptyOrUndefined(start) ? null : start;
        end = h.isNullEmptyOrUndefined(end) ? null : end;
        
        if(start === null  && end === null){
          return str;
        }else if(start === null && end !== null){
          return str.substring(0, end);
        }else if(start !== null && end === null){
          return str.substring(start, str.length);
        }else{
          return str.substring(start, end);
        }
      },
      /*Convert tag in element*/
      __GetElement: function(el) {
        if (h.isObject(el)) {
          return el;
        } else {
          obj = document.querySelectorAll(el);
          switch (obj.length) {
            case 0:
              console.log('! _selector_Alert: ' + el + ' Not Found');
              return false;
            case 1:
              return obj[0];
            default:
              return obj;
          }
        }
      }
    }
  })();

  const __core = (()=>{
    let _start = [];
    let _update = [];
    let _afterUpdate = [];

    let add = (target, func) => {
      if (h.isNullEmptyOrUndefined(func) || !h.isFunction(func)) {
        throw "Ready must have an function as parameter";
      } else {
        target.push(func);
      }
    };

    let clearUpdate = (func) => {
      if (h.isNullEmptyOrUndefined(func) || !h.isFunction(func)) {
        throw "Ready must have an function as parameter";
      } else {
        _update = _update.filter(f => f != func);
      }
    };

    let clearAfterUpdate = (func) => {
      if (h.isNullEmptyOrUndefined(func) || !h.isFunction(func)) {
        throw "Ready must have an function as parameter";
      } else {
        let n1 = _afterUpdate.length
        _afterUpdate = _afterUpdate.filter(f => f != func);
        let n2 = _afterUpdate.length
      }
    };

    let run = (v) => {
      v.forEach(function(childFunc) {
        try {
          return childFunc(); 
        } catch (error) {
          console.log(error);
        }
      });
    };

    let runAnimationAfterUpdateSync = () => {
      __core.runAfterUpdate();
      window.requestAnimationFrame(runAnimationUPdateSync);
    };
    let runAnimationAfterUpdateAsync = async () => {
      __core.runAfterUpdateAsync();
      window.requestAnimationFrame(runAnimationUPdateAsync);
    };


    let runAnimationUPdateSync = () => {
      __core.runUpdate();
      window.requestAnimationFrame(runAnimationAfterUpdateSync);
    };

    return {
      start: (func) => add(_start, func),
      update: (func) => add(_update, func),
      afterUpdate: (func) => add(_afterUpdate, func),

      updateClear: (func) => clearUpdate(func),
      afterUpdateClear: (func) => clearAfterUpdate(func),

      runStart: () => run(_start),
      runUpdate: () => run(_update),
      runAfterUpdate: () => run(_afterUpdate),
      runAnimationSync: () => window.requestAnimationFrame(runAnimationUPdateSync),
      runAnimationAsync: () => new Promise(resolve => window.requestAnimationFrame(runAnimationUPdateAsync)),

      getStack: ()=>{
        return {
          start: _start,
          update: _update,
          afterUpdate: _afterUpdate
        }
      },
      getStackCount: ()=>{
        return {
          start: _start.length,
          update: _update.length,
          afterUpdate: _afterUpdate.length
        }
      },

      trackMouse: () => {
        document.addEventListener('mousedown', function() { window["isMouseDown"] = true; });
        document.addEventListener('touchstart', function() { window["isMouseDown"] = true; });
        
        document.addEventListener('mouseup', function() {   window["isMouseDown"] = false; });
        document.addEventListener('touchend', function() {   window["isMouseDown"] = false; });

        document.addEventListener('touchmove', function(e) {
          let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
          let touch = evt.touches[0] || evt.changedTouches[0];
          window["pageX"] = touch.pageX;
          window["pageY"] = touch.pageY;
        });

        document.onmousemove = handleMouseMove;
        function handleMouseMove(event) {
            let eventDoc, doc, body;
    
            event = event || window.event; // IE-ism
    
            // If pageX/Y aren't available and clientX/Y are,
            // calculate pageX/Y - logic taken from jQuery.
            // (This is to support old IE)
            if (event.pageX == null && event.clientX != null) {
                eventDoc = (event.target && event.target.ownerDocument) || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
    
                event.pageX = event.clientX +
                  (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                  (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                  (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                  (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
    
            window["pageX"] = event.pageX;
            window["pageY"] = event.pageY;
    
            // Use event.pageX / event.pageY here
        }
      },


    }

  })();

  
const _ = function(el) {
  return h.__GetElement(el);
};
  

const _start = (f) => __core.start(f);
const _update = (f) => __core.update(f);
const _afterUpdate = (f) => __core.afterUpdate(f);


const _updateClear = (f) => __core.updateClear(f);
const _afterUpdateClear = (f) => __core.afterUpdateClear(f);

document.addEventListener("DOMContentLoaded", function(event){
  __core.runStart();
  __core.runAnimationSync();
  __core.trackMouse();
});

