/**
 * Autocompletado 
 * 
 * Muestra un listado de coincidencias encontradas en una fuente (array, base de datos) 
 * de acuerdo con lo que el usuario vaya escribiendo.
 * 
 * FORMA DE USO:
 * 
 * Autocomplete.go({
 *     source: Array o archivo (['Foo', 'Bar'] o 'buscar.php'),
 *     input: El <input> en el que se escribe,
 *     extraData: Datos extra a buscar en forma de query string
 *     show: Nombre de la variable cuyo valor será mostrado,
 *     select: Función de llamada de retorno en caso se seleccione una opción
 * });
 * 
 * NOTA: Si la fuente es una lista que proviene del servidor, el formato de dicha lista debe ser JSON
 * 
 * @author      Alexis López Espinoza
 * @version     6.0
 *  
 */
 

let Autocomplete = {
    go: options => {
        Autocomplete.options = options;
        Autocomplete.remove();
        Autocomplete.options.input.value.length && Autocomplete.init();
    },

    init: _ => {
        window.addEventListener("mouseover", Autocomplete.over, false);
        window.addEventListener("mouseout", Autocomplete.out, false);
        window.addEventListener("resize", Autocomplete.resize, false);
        window.addEventListener("click", Autocomplete.click, false);
        window.addEventListener("orientationchange", Autocomplete.resize, false);       
        window.addEventListener("keyup", (event) => {
            Autocomplete.container && Autocomplete.keys(event);
        }, false);
        window.addEventListener("keypress", (event) => {
            event.which == 13 && Autocomplete.container && event.preventDefault();
        }, false);

        if ({}.toString.call(Autocomplete.options.source) == "[object Array]"){
            if (Autocomplete.options.source.indexOf(Autocomplete.options.input.value) > -1){
                let data = Autocomplete.options.source.map((val) => {
                    if (val.indexOf(Autocomplete.options.input.value) > -1){
                        return val;
                    }
                });

                if (data.length) Autocomplete.list();
                else Autocomplete.remove();
            }
        }
        else{
            fetch(Autocomplete.options.source + "?" + new URLSearchParams({
                term: Autocomplete.options.input.value
            }) + (Autocomplete.options.extraData ? "&" + Autocomplete.options.extraData : ""))
                .then((data) => data.json())
                .then((response) => {
                    if (response.length) Autocomplete.list(response);
                    else Autocomplete.remove();
                })
                .catch((error) => console.log(error.message));              
        }
    },

    click: event => {
        let elem = event.target;

        if (elem.classList.contains("autocomplete-option")){
            if (Autocomplete.options.select && {}.toString.call(Autocomplete.options.select) == "[object Function]"){
                Autocomplete.options.input.value = elem.textContent;

                let obj = {};

                for (let prop in elem.dataset){
                    obj[prop] = elem.dataset[prop];
                }

                Autocomplete.options.select(obj);
            }
            else{
                Autocomplete.options.input.value = elem.textContent;
            }

            Autocomplete.remove();          
        }

        Autocomplete.remove();
    },

    keys: event => {
        const UP    = 38,
              DOWN  = 40,
              ESC   = 27,
              ENTER = 13;

        let childs = Autocomplete.container.querySelectorAll(".autocomplete-option"), 
            actual = document.querySelector(".current"), pos;

        if (Autocomplete.container){
            switch (event.keyCode){
                case UP:
                    if (actual){
                        pos = [].indexOf.call(childs, actual);

                        //Se retira el resaltado de la opción actual
                        actual.classList.contains("current") && actual.classList.remove("current");
                        actual.style.backgroundColor = actual.dataset.back;

                        //Si la opción actual es la primera, se resalta la última opción
                        if (pos - 1 < 0){                       
                            childs[childs.length - 1].classList.add("current");
                            childs[childs.length - 1].style.backgroundColor = "lightyellow";
                        }
                        //Caso contrario, se resalta la anterior opción
                        else{
                            actual.previousElementSibling.classList.add("current");
                            actual.previousElementSibling.style.backgroundColor = "lightyellow";
                        }
                    }
                    else{
                        childs[childs.length - 1].classList.add("current");
                        childs[childs.length - 1].style.backgroundColor = "lightyellow";    
                    }
                    
                    break;

                case DOWN:
                    if (actual){
                        pos = [].indexOf.call(childs, actual);              

                        //Se retira el resaltado de la opción actual
                        actual.classList.contains("current") && actual.classList.remove("current");
                        actual.style.backgroundColor = actual.dataset.back;

                        //Si la opción actual es la primera, se resalta la última opción
                        if (pos + 1 >= childs.length){                      
                            childs[0].classList.add("current");
                            childs[0].style.backgroundColor = "lightyellow";
                        }
                        //Caso contrario, se resalta la anterior opción
                        else{
                            actual.nextElementSibling.classList.add("current");
                            actual.nextElementSibling.style.backgroundColor = "lightyellow";
                        }
                    }
                    else{
                        childs[0].classList.add("current");
                        childs[0].style.backgroundColor = "lightyellow";
                    }
                    break;

                case ENTER:                 
                    if (actual && Autocomplete.options.select && {}.toString.call(Autocomplete.options.select) == "[object Function]"){
                        Autocomplete.options.input.value = actual.textContent;

                        let obj = {};

                        for (let prop in actual.dataset){
                            obj[prop] = actual.dataset[prop];
                        }

                        Autocomplete.options.select(obj);
                    }
                    else if (actual){
                        Autocomplete.options.input.value = actual.textContent;
                    }
                    
                    Autocomplete.remove();                  
                    break;

                case ESC:
                    Autocomplete.remove();
                    break;
            }

            event.stopImmediatePropagation();
        }
    },

    remove: _ => {
        [...document.querySelectorAll(".autocomplete-container")].forEach(container => container.remove());
        Autocomplete.repairScroll("auto");
    },

    list: datos => {
        Autocomplete.container = document.createElement("p");
        Autocomplete.container.classList.add("autocomplete-container");
        Autocomplete.container.style.zIndex = 9999;
        Autocomplete.container.style.position = "absolute";
        Autocomplete.container.style.border = "1px gray solid";
        Autocomplete.container.style.margin = 0;

        let opcion;

        const ODD = "#F5F5F5",
              EVEN = "#DCDCDC";

        datos.forEach((dato, i) => {
            opcion = document.createElement("b");
            opcion.classList.add("autocomplete-option");
            opcion.style.display = "block";
            opcion.style.textAlign = "center";
            opcion.style.cursor = "pointer";
            opcion.style.userSelect = "none";
            opcion.style.wordWrap = "break-word";
            opcion.style.backgroundColor = i % 2 == 0 ? EVEN : ODD;
            opcion.style.color = "#2F4F4F";
            opcion.style.opacity = 1;
            opcion.dataset.back = i % 2 == 0 ? EVEN : ODD;

            let obj = {};
              
            for (let prop in dato){
                opcion.setAttribute("data-" + prop, dato[prop]);
                obj[prop] = dato[prop];
            }

            opcion.innerHTML = dato[Autocomplete.options.show];
            Autocomplete.container.appendChild(opcion);         
        });

        Autocomplete.resize();
        document.body.append(Autocomplete.container);   

        Autocomplete.repairScroll("hidden");
    },

    repairScroll: prop => {
        if (Autocomplete.options.hideScroll){
            let elem = document.querySelector(Autocomplete.options.hideScroll);
            if (elem) elem.style.overflow = prop;
        }
    },

    resize: _ => {
        Autocomplete.container.style.width = Autocomplete.options.input.offsetWidth + "px";
        Autocomplete.container.style.top = (Autocomplete.options.input.offsetTop + Autocomplete.options.input.offsetHeight - (Autocomplete.options.hideScroll ? document.querySelector(Autocomplete.options.hideScroll).scrollTop : 0)) + "px";
        Autocomplete.container.style.left = Autocomplete.options.input.offsetLeft + "px";
        Autocomplete.container.style.maxHeight = window.innerHeight * .3 + "px";
        Autocomplete.container.style.overflowY = "auto";

        [...Autocomplete.container.querySelectorAll("b")].forEach(b => b.style.width = Autocomplete.options.input.offsetWidth + "px");
    },

    over: event => {
        let elem = event.target,
            actual = document.querySelector(".current");

        if (elem.classList.contains("autocomplete-option")){
            actual && actual.classList.remove("current");
            actual && (actual.style.backgroundColor = actual.dataset.back);

            elem.classList.add("current");
            elem.style.backgroundColor = "lightyellow";
        }
    },

    out: event => {
        let elem = event.target;

        if (elem.classList.contains("opt") && elem.classList.contains("current")){
            elem.classList.remove("current");
            elem.style.backgroundColor = elem.dataset.back;
        }
    }
};
