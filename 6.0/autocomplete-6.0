/**
 * Autocompletado 
 * 
 * Muestra un listado de coincidencias encontradas en una fuente (array, base de datos) 
 * de acuerdo con lo que el usuario vaya escribiendo.
 * 
 * FORMA DE USO:
 * 
 * Autocomplete({
 *     source: Array o archivo (['Foo', 'Bar'] o 'buscar.php'),
 * 	   input: El <input> en el que se escribe,
 * 	   show: Nombre de la variable cuyo valor será mostrado,
 * 	   select: Función de llamada de retorno en caso se seleccione una opción
 * });
 * 
 * NOTA: Si la fuente es una lista que proviene del servidor, el formato de dicha lista debe ser JSON
 * 
 * @author		Alexis López Espinoza
 * @version		6.0
 *  
 */
 

let Autocomplete = {
	go: (options) => {
		Autocomplete.options = options;
		Autocomplete.options.input.addEventListener("input", _ => {
			Autocomplete.container && Autocomplete.container.remove();
			if (Autocomplete.options.input.value.length){
				Autocomplete.init();
			}
		}, false);	
		Autocomplete.options.input.addEventListener("blur", _ => !Autocomplete.options.input.value.length && Autocomplete.container && Autocomplete.container.remove(), false);
	},

	init: () => {
		window.addEventListener("mouseover", Autocomplete.over, false);
		window.addEventListener("mouseout", Autocomplete.out, false);
		window.addEventListener("resize", Autocomplete.resize, false);
		window.addEventListener("orientationchange", Autocomplete.resize, false);
		window.addEventListener("click", Autocomplete.click, false);
		window.addEventListener("keyup", (event) => {
			Autocomplete.container && Autocomplete.keys(event);
		}, false);

		if ({}.toString.call(Autocomplete.options.source) == "[object Array]"){
			if (Autocomplete.options.source.indexOf(Autocomplete.options.input.value) > -1){
				let data = Autocomplete.options.source.map((val) => {
					if (val.indexOf(Autocomplete.options.input.value) > -1){
						return val;
					}
				});

				if (data.length) Autocomplete.list();
				else Autocomplete.container && Autocomplete.container.remove();
			}
		}
		else{
			fetch(Autocomplete.options.source + "?" + new URLSearchParams({term: Autocomplete.options.input.value}))
				.then((data) => data.json())
				.then((response) => {
					if (response.length) Autocomplete.list(response);
					else Autocomplete.container && Autocomplete.container.remove();
				})
				.catch((error) => console.log(error.message));				
		}
	},

	click: (event) => {
		let elem = event.target;

		if (elem.hasAttribute("data-list")){
			if (Autocomplete.options.callback && {}.toString.call(Autocomplete.options.callback) == "[object Function]"){
				Autocomplete.options.input.value = elem.textContent;
				Autocomplete.options.callback(elem);
			}
			else{
				Autocomplete.options.input.value = elem.textContent;
			}

			Autocomplete.container && Autocomplete.container.remove();			
		}

		!Autocomplete.options.input.value.length && Autocomplete.container && Autocomplete.container.remove();
	},

	keys: (event) => {
		const UP 	= 38,
			  DOWN 	= 40,
			  ESC 	= 27,
			  ENTER = 13;

		let childs = Autocomplete.container.querySelectorAll("[data-list]"), 
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
					if (actual && Autocomplete.options.callback && {}.toString.call(Autocomplete.options.callback) == "[object Function]"){
						Autocomplete.options.input.value = actual.textContent;
						Autocomplete.options.callback(actual);
					}
					else if (actual){
						Autocomplete.options.input.value = actual.textContent;
					}

					event.preventDefault();
					Autocomplete.container.remove();
					break;

				case ESC:
					Autocomplete.container.remove();
					break;
			}

			event.stopImmediatePropagation();
		}
	},

	list: (datos) => {
		Autocomplete.container = document.createElement("div");
		Autocomplete.container.style.zIndex = 9999;
		Autocomplete.container.style.position = "fixed";
		Autocomplete.container.style.border = "1px gray solid";

		const ODD = "#F5F5F5",
			  EVEN = "#DCDCDC";

		if (Autocomplete.options.callback && {}.toString.call(Autocomplete.options.callback) == "[object Function]"){
			Autocomplete.options.callback(datos);
		}
		else{
			datos.forEach((dato, i) => {
				opcion = document.createElement("span");
				opcion.style.display = "block";
		        opcion.style.textAlign = "center";
		        opcion.style.cursor = "pointer";
		        opcion.style.userSelect = "none";
		        opcion.style.wordWrap = "break-word";
		        opcion.style.backgroundColor = i % 2 == 0 ? EVEN : ODD;
		        opcion.dataset.back = i % 2 == 0 ? EVEN : ODD;
		        
		        for (let prop in dato){
		        	opcion.setAttribute("data-" + prop, dato[prop]);
		        }

		        opcion.dataset.list = "";
		        opcion.innerHTML = dato[Autocomplete.options.show];

		        Autocomplete.container.appendChild(opcion);
		        document.body.append(Autocomplete.container);
		    });
		}

		Autocomplete.resize();
	},

	resize: () => {
		Autocomplete.container.style.width = Autocomplete.options.input.offsetWidth + "px";
		Autocomplete.container.style.top = Autocomplete.options.input.offsetTop + Autocomplete.options.input.offsetHeight + "px";
		Autocomplete.container.style.left = Autocomplete.options.input.offsetLeft + "px";
		Autocomplete.container.style.maxHeight = window.innerHeight * .3 + "px";
		Autocomplete.container.style.overflowY = "auto";
	},

	over: (event) => {
		let elem = event.target,
			actual = document.querySelector(".current");

		if (elem.hasAttribute("data-list")){
			actual && actual.classList.remove("current");
			actual && (actual.style.backgroundColor = actual.dataset.back);

			elem.classList.add("current");
			elem.style.backgroundColor = "lightyellow";
		}
	},

	out: (event) => {
		let elem = event.target;

		if (elem.hasAttribute("data-list") && elem.classList.contains("current")){
			elem.classList.remove("current");
			elem.style.backgroundColor = elem.dataset.back;
		}
	}
};
