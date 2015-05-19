var autocomplete = {
    words: [], //Words to show
    span: null, //For each word
    elem: null, //The input
    id: null, //Options list's id
    xhr: null, //For XHR object
    back: null, //List's background color
    hover: null, //Span's background color on mouseover event
    source: null, //Words list or URLs list for search
    container: document.createElement("div"), //Options list
    cls: "highlight", //Class name for active's option
    load: function(obj){
        this.source = obj.words;
        this.id = obj.id || "dlContainer";
        this.container.id = this.id;
        this.container.style.display = "none";
        this.hover = obj.optionHover || "gold";
        this.back = obj.backList || "lightyellow";
        this.container.style.background = this.back || "lightyellow";
        this.container.style.border = obj.borderList || ".1rem peru solid";
        this.container.style.position = "absolute";
        this.container.style.zIndex = 9999;
        document.body.appendChild(this.container);
        this.apply(obj.target);
    },
    ajax: function(url, val){
        autocomplete.xhr = new XMLHttpRequest();
        autocomplete.xhr.open("GET", url + "?term=" + val, true);
        autocomplete.xhr.addEventListener("readystatechange", function(){
            if (autocomplete.xhr.readyState == 4 && autocomplete.xhr.status == 200){
                autocomplete.words = JSON.parse(autocomplete.xhr.responseText);
                autocomplete.show();
            }                    
        }, false);
        autocomplete.xhr.send();
    },
    show: function(){
        autocomplete.container.innerHTML = "";
        if (autocomplete.words.length){
            autocomplete.words.forEach(function(word){
                autocomplete.span = document.createElement("span");
                autocomplete.span.innerHTML = word;
                autocomplete.span.style.display = "block";
                autocomplete.span.style.textAlign = "center";
                autocomplete.span.style.cursor = "pointer";
                autocomplete.span.style.userSelect = "none";
                autocomplete.span.style.WebKitUserSelect = "none";
                autocomplete.span.style.MozUserSelect = "none";
                autocomplete.span.addEventListener("mouseover", function(){
                    this.style.background = autocomplete.hover || "gold";
                }, false);
                autocomplete.span.addEventListener("mouseout", function(){
                    this.style.background = autocomplete.back || "lightyellow";
                }, false);
                autocomplete.container.appendChild(autocomplete.span);
            });
            autocomplete.container.style.display = "block";
        }
    },
    position: function(){
    	if (autocomplete.elem){
	        autocomplete.container.style.width = autocomplete.elem.offsetWidth + "px";
	        autocomplete.container.style.left = autocomplete.elem.offsetLeft + "px";
	        autocomplete.container.style.top = autocomplete.elem.offsetTop + autocomplete.elem.offsetHeight + "px";
	    }
    },
    write: function(value){
        if (value.length){
        	autocomplete.elem = this;
        	autocomplete.position();

            if ({}.toString.call(autocomplete.source) == "[object Array]"){
                autocomplete.words = [];
                autocomplete.source.forEach(function(word){
                    if (word.toLowerCase().search(value.toLowerCase().trim()) > -1){
                        if (autocomplete.words.indexOf(word) == -1){
                            autocomplete.words.push(word);
                        }
                    }
                    autocomplete.show();                    
                });
            }
            else if (/(php|asp|jsp|aspx)/gi.test(autocomplete.source.substr(autocomplete.source.lastIndexOf(".") + 1))){
                autocomplete.ajax(autocomplete.source, value);
            }
            else{
                if (autocomplete.search.toLowerCase().search(value.toLowerCase().trim()) > -1){
                    autocomplete.words = [autocomplete.search];
                }
                else{
                    autocomplete.words = [];
                }
                autocomplete.show();
            }
        }
        
        if (!value.length || !autocomplete.words.length){
            autocomplete.container.style.display = "none";
        }
    },
    apply: function(identifier){
        var all, old, hov;

        window.addEventListener("keyup", function(event){
            if (!/(13|37|38|39|40)/gi.test(event.keyCode)){
                if (event.target.className == identifier || event.target.id == identifier){
                    autocomplete.write.call(event.target, event.target.value);
                }
            }
            else{
                all = [].slice.call(autocomplete.container.querySelectorAll("span"));

                //Up
                if (event.keyCode == 40){
                    if (autocomplete.container.offsetHeight){
                        if (!autocomplete.container.querySelectorAll("." + autocomplete.cls).length){
                            all[0].className = autocomplete.cls;
                            all[0].style.background = autocomplete.hover || "gold";
                        }
                        else{
                            old = autocomplete.container.querySelector("." + autocomplete.cls);
                            hov = all.indexOf(old) + 1 < all.length ? all[all.indexOf(old) + 1] : all[0];
                            hov.className = autocomplete.cls;
                            hov.style.background = autocomplete.hover || "gold"
                            old.className = "";
                            old.style.background = autocomplete.back || "lightyellow";
                        }
                    }
                    else if (event.target.value.length){
                        autocomplete.write.call(event.target, event.target.value);
                    }
                }
                
                //Down
                if (event.keyCode == 38){
                    if (autocomplete.container.offsetHeight){
                        if (!autocomplete.container.querySelectorAll("." + autocomplete.cls).length){
                            all[all.length - 1].className = autocomplete.cls;
                            all[all.length - 1].style.background = autocomplete.hover || "gold";
                        }
                        else{
                            old = autocomplete.container.querySelector("." + autocomplete.cls);
                            hov = all.indexOf(old) - 1 >= 0 ? all[all.indexOf(old) - 1] : all[all.length - 1];
                            hov.className = autocomplete.cls;
                            hov.style.background = autocomplete.hover || "gold"
                            old.className = "";
                            old.style.background = autocomplete.back || "lightyellow";
                        }
                    }
                }

                //ENTER
                if (event.keyCode == 13){
                    if (autocomplete.container.offsetHeight){
                        if (old = autocomplete.container.querySelector("." + autocomplete.cls)){
                            autocomplete.elem.value = old.innerHTML;
                            autocomplete.container.style.display = "none";
                        }
                        else{
                            autocomplete.container.style.display = "none";   
                        }
                    }
                }
            }
        }, false);
        
        window.addEventListener("click", function(){
            if (event.target.id != autocomplete.id && event.target.parentNode.id != autocomplete.id){
                autocomplete.container.style.display = "none";
            }
            
            if (event.target.parentNode.id == autocomplete.id){
                autocomplete.elem.value = event.target.innerHTML;
                autocomplete.container.style.display = "none";
            }
        }, false);

        window.addEventListener("resize", autocomplete.position, false);
    }
};
