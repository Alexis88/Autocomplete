/**
 * Autocomplete module
 *
 * @author   Alexis López Espinoza
 * @version 2.0
 */

"use strict";

var autocomplete = function(){
    return this;
};
    
autocomplete.prototype = {
    load: function(obj){
        /**
          * Load the data into Autocomplete's module
          * 
          * @param   object          obj
          * @param   array|string    obj.words
          * @param   string          obj.id
          * @param   string          obj.optionHover
          * @param   string          obj.backList
          * @param   string          obj.borderList
          * @param   string          obj.target
          */
        
        var self = this;

        this.words = null; //Words to show
        this.span = null; //For each word
        this.elem = null; //The input
        this.xhr = null; //For XHR object
        this.aux = null; //Auxiliary variable
        this.cls = "highlight"; //Class name for active option
        this.container = document.createElement("div"); //Options list
        this.source = obj.words; //Words list or URLs list for search
        this.id = obj.id || "dlContainer"; //Options list's id
        this.container.id = this.id;
        this.container.style.display = "none";
        this.hover = obj.optionHover || "gold"; //Span's background on mouseover event
        this.back = obj.backList || "lightyellow"; //List's background color
        this.container.style.background = this.back || "lightyellow";
        this.container.style.border = obj.borderList || ".1rem peru solid";
        this.container.style.position = "absolute";
        this.container.style.zIndex = 9999;
        this.select = obj.select; //The callback
        this.value = obj.value; //Value will shows on the options list
        this.data = null; //Extra data will saved
        document.addEventListener("DOMContentLoaded", function(){            
            self.ready(obj.target);
        }, false);
    },
    ready: function(target){
        /**
          * When DOM's content load has finished
          */

        document.body.appendChild(this.container);
        this.apply(target);
    },
    ajax: function(url, val){
        /**
          * Asynchronously search of matches in a database with the sent word/s
          * 
          * @param   string  url
          * @param   string  val
          */

        var self = this;
            
        self.xhr = new XMLHttpRequest();
        self.xhr.open("GET", url + "?term=" + val, true);
        self.xhr.addEventListener("readystatechange", function(){
            if (this.readyState == 4 && this.status == 200){
                self.words = JSON.parse(this.responseText);
                self.show(self);
            }                    
        }, false);
        self.xhr.send();
    },
    show: function(self){
        /**
          * Build and shows the options list
          * 
          * @return  Option's list
          */

        self.container.innerHTML = "";
        if (self.words.length){
            self.words.forEach(function(word){
                self.span = document.createElement("span");
                self.span.innerHTML = typeof word != "object" ? word : (function(){
                	self.data = word;
                	return word[self.value];
                })();
                self.span.style.display = "block";
                self.span.style.textAlign = "center";
                self.span.style.cursor = "pointer";
                self.span.style.userSelect = "none";
                self.span.style.WebKitUserSelect = "none";
                self.span.style.MozUserSelect = "none";
                self.span.addEventListener("mouseover", function(){
                    if ((self.aux = self.container.querySelectorAll("." + self.cls)).length){
                        self.aux[0].style.background = self.back || "lightyellow";
                        self.aux[0].className = "";
                    }
                    this.style.background = self.hover || "gold";
                }, false);
                self.span.addEventListener("mouseout", function(){
                    this.style.background = self.back || "lightyellow";
                }, false);
                self.container.appendChild(self.span);
            });
            self.container.style.display = "block";
        }
    },
    position: function(self){
        /**
          * Sets the width for the options list and positions it
          */
            
        if (self.elem){
            self.container.style.width = self.elem.offsetWidth + "px";
            self.container.style.left = self.elem.offsetLeft + "px";
            self.container.style.top = self.elem.offsetTop + self.elem.offsetHeight + "px";
        }
    },
    write: function(value, self){
        /**
          * When user press a key
          * 
          * @param   string  value
          */

        if (value.length){
            self.elem = this;
            self.position(self);

            if ({}.toString.call(self.source) == "[object Array]"){
                self.words = [];
                self.source.forEach(function(word){
                    if (word.toLowerCase().search(value.toLowerCase().trim()) > -1){
                        if (self.words.indexOf(word) == -1){
                            self.words.push(word);
                        }
                    }
                    self.show(self);                    
                });
            }
            else if (/(php|asp|jsp|aspx)/gi.test(self.source.substr(self.source.lastIndexOf(".") + 1))){
                self.ajax(self.source, value);
            }
            else{
                self.words = self.search.toLowerCase().search(value.toLowerCase().trim()) > -1 ? [self.search] : [];
                self.show(self);
            }
        }

        if (!value.length || (self.words && !self.words.length)){
            self.container.style.display = "none";
        }
    },
    apply: function(identifier){
        /**
          * Applies the Autocomplete module on the target field
          * 
          * @param   string  identifier
         */
           
        var all, old, hov, self = this;

        window.addEventListener("keyup", function(event){
            if ([13, 37, 38, 39, 40].indexOf(event.keyCode) == -1){
                if (event.target.className == identifier || event.target.id == identifier){
                    self.write.call(event.target, event.target.value, self);
                }
            }
            else{
                all = [].slice.call(self.container.querySelectorAll("span"));

                //Down
                if (event.keyCode == 40){
                    if (self.container.offsetHeight){
                        if (!self.container.querySelectorAll("." + self.cls).length){
                            all[0].className = self.cls;
                            all[0].style.background = self.hover || "gold";
                        }
                        else{
                            old = self.container.querySelector("." + self.cls);
                            hov = all.indexOf(old) + 1 < all.length ? all[all.indexOf(old) + 1] : all[0];
                            hov.className = self.cls;
                            hov.style.background = self.hover || "gold"
                            old.className = "";
                            old.style.background = self.back || "lightyellow";
                        }
                    }
                    else if (event.target.value.length && getComputedStyle(self.container) == "none"){
                        self.write.call(event.target, event.target.value, self);
                    }
                }
                    
                //Up
                if (event.keyCode == 38){
                    if (self.container.offsetHeight){
                        if (!self.container.querySelectorAll("." + self.cls).length){
                            all[all.length - 1].className = self.cls;
                            all[all.length - 1].style.background = self.hover || "gold";
                        }
                        else{
                            old = self.container.querySelector("." + self.cls);
                            hov = all.indexOf(old) - 1 >= 0 ? all[all.indexOf(old) - 1] : all[all.length - 1];
                            hov.className = self.cls;
                            hov.style.background = self.hover || "gold"
                            old.className = "";
                            old.style.background = self.back || "lightyellow";
                        }
                    }
                }

                //ENTER
                if (event.keyCode == 13){
                    if (self.container.offsetHeight){
                        if (old = self.container.querySelector("." + self.cls)){
                            self.elem.value = old.innerHTML;
                            self.container.style.display = "none";
                        }
                        else{
                            self.container.style.display = "none";   
                        }
                    }
                }
            }
        }, false);
            
        window.addEventListener("click", function(){
            if (event.target.id != self.id && event.target.parentNode.id != self.id){
                self.container.style.display = "none";
            }
                
            if (event.target.parentNode.id == self.id){
                self.elem.value = event.target.innerHTML;
                self.container.style.display = "none";
                if (self.select){
                    self.select(event.target);
                }
            }
        }, false);

        window.addEventListener("resize", self.position, false);
    }
};
