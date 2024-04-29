/**
 * AUTOCOMPLETE 
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
 *     complete: Función de llamada de retorno para tratar la respuesta
 *     error: Función de llamada de retorno para tratar el error producido
 *     select: Función de llamada de retorno en caso se seleccione una opción
 * });
 * 
 * NOTA: Si la fuente es una lista que proviene del servidor, el formato de dicha lista debe ser JSON
 * 
 * @author      Alexis López Espinoza
 * @version     6.0
 */
 

const Autocomplete = {
    go: options => {
        Autocomplete.options = options;
        Autocomplete.remove();
        Autocomplete.options.input.value.length && Autocomplete.init();
    },

    init: _ => {
        window.addEventListener("mouseover", Autocomplete.over, false);
        window.addEventListener("mouseout", Autocomplete.out, false);
        window.addEventListener("resize", _ => Autocomplete.container && Autocomplete.resize(), false);
        window.addEventListener("orientationchange", _ => Autocomplete.container && Autocomplete.resize(), false);
        window.addEventListener("click", Autocomplete.click, false);        
        document.addEventListener("keyup", event => Autocomplete.keys(event), false);
        document.addEventListener("keypress", event => {
            event.which == 13 && Autocomplete.container && event.preventDefault();
        }, false);

        if ({}.toString.call(Autocomplete.options.source) == "[object Array]"){
            const data = Autocomplete.options.source.filter(val => {
                if (val.indexOf(Autocomplete.options.input.value) > -1){
                    return val;
                }
            });

            if (data.length) Autocomplete.list(data);
            else Autocomplete.remove();
        }
        else{
            fetch(Autocomplete.options.source + "?" + new URLSearchParams({
                term: Autocomplete.options.input.value
            }) + (Autocomplete.options.extraData ? "&" + Autocomplete.options.extraData : ""))
                .then(data => data.json())
                .then(response => {
                    if (response.length) Autocomplete.list(response);
                    else Autocomplete.remove();
                    if (Autocomplete.options.complete && {}.toString.call(Autocomplete.options.complete) == "[object Function]"){
                        Autocomplete.options.complete(response);
                    }
                })
                .catch(error => {
                    if (Autocomplete.options.error && {}.toString.call(Autocomplete.options.error) == "[object Function]"){
                        Autocomplete.options.error(error);
                    }
                    console.log(error);
                });         
        }
    },

    click: event => {
        const elem = event.target;

        if (elem.classList.contains("autocomplete-option")){
            if (Autocomplete.options.select && {}.toString.call(Autocomplete.options.select) == "[object Function]"){
                Autocomplete.options.input.value = elem.textContent;

                const obj = {};

                for (const prop in elem.dataset){
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

        if (Autocomplete.container){
            let childs = Autocomplete.container.querySelectorAll(".autocomplete-option"), 
                actual = document.querySelector(".current"), pos;

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

                        const obj = {};

                        for (const prop in actual.dataset){
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
        document.querySelectorAll(".autocomplete-container").forEach(container => container.remove());
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

            const obj = {};
              
            for (const prop in dato){
                opcion.setAttribute("data-" + prop, dato[prop]);
                obj[prop] = dato[prop];
            }

            opcion.innerHTML = "show" in Autocomplete.options ? dato[Autocomplete.options.show] : dato;
            Autocomplete.container.appendChild(opcion);         
        });

        Autocomplete.resize();
        document.body.append(Autocomplete.container);   

        Autocomplete.repairScroll("hidden");
    },

    repairScroll: prop => {
        if (Autocomplete.options.hideScroll){
            const elem = document.querySelector(Autocomplete.options.hideScroll);
            if (elem) elem.style.overflow = prop;
        }
    },

    resize: _ => {
        const rect = Autocomplete.options.input.getBoundingClientRect();

        Autocomplete.container.style.width = `${rect.width}px`;
        Autocomplete.container.style.top = `${rect.bottom}px`;
        Autocomplete.container.style.left = `${rect.left}px`;
        Autocomplete.container.style.maxHeight = `${window.innerHeight * .3}px`;
        Autocomplete.container.style.overflowY = "auto";

        Autocomplete.container.querySelectorAll("b").forEach(b => b.style.width = `${rect.width}px`);
    },

    over: event => {
        const 
            elem = event.target,
            actual = document.querySelector(".current");

        if (elem.classList.contains("autocomplete-option")){
            actual && actual.classList.remove("current");
            actual && (actual.style.backgroundColor = actual.dataset.back);

            elem.classList.add("current");
            elem.style.backgroundColor = "lightyellow";
        }
    },

    out: event => {
        const elem = event.target;

        if (elem.classList.contains("opt") && elem.classList.contains("current")){
            elem.classList.remove("current");
            elem.style.backgroundColor = elem.dataset.back;
        }
    }
};
