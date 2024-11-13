/*



Se quiere desarrollar una web con las siguientes funcionalidades:

Listado de Pokémon Arrastrables:
    - Muestra una lista de los 151 Pokémon de la primera generación.
    - Cada Pokémon debe estar representado por su imagen y debe ser posible arrastrarlo.
    - Al pasar el cursor sobre cada imagen de Pokémon, el usuario debe poder seleccionarla y
        arrastrarla a una zona específica de la interfaz llamada "Zona de información".

Zona de Información del Pokémon: 
    - Al arrastrar un Pokémon a la "Zona de información" y soltarlo ahí, la aplicación debe obtener y mostrar datos adicionales del Pokémon seleccionado.
    - La información mostrada debe incluir:
        - Nombre del Pokémon.
        - Imagen ampliada del Pokémon.
        - Lista de Evoluciones (si existen), con una imagen de cada etapa evolutiva.

En caso de que al arrastrar un pokemon a la zona de información ya haya otro pokemon tiene que volver a la posición inicial para poder ver su info más adelante.
¿Cómo sacar las evoluciones de cualquier pokemon?
    cualquier pokemon -> species -> evolution_chain -> Todas las evoluciones de ese pokemon, desde la 1º a la última.
Por si os sirve -> usar función recursiva sencilla para recuperar todas las evoluciones


*/

var contendor_pokemones = document.querySelector(".contenedor-pokemones")
var pantalla_pokemon = document.querySelector(".pokemon")
var pantalla_evoluciones = document.querySelector(".evoluciones")
listaURL = []
var imagenPokemon = null

//Función para cargar las imagenes de los pokemones
function cargarPokemones () {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151&offset=0")
    .then((item)=>{
        return item.json()
    }).then((item)=>{
        cargarPokemonesAux(item.results)
        
        listaURL.forEach(url =>{
            fetch(url)
            .then((item)=>{
                return item.json()
            }).then((pokemon)=>{
                
                añadirPokemon(pokemon)
            })
            
        })
    })
    .catch((error)=>{
        console.log("Ha habido un error: " + error)
    })
}

//Función auxiliar para rellenar la lista de URL para hacer fetch en la función cargarPokemones()
function cargarPokemonesAux(listaPokemones){
    listaPokemones.forEach(pokemon => {
        listaURL.push(pokemon.url)
    });
    return listaURL
}

//Función auxiliar para añadir una imagen de un pokemon al div correspondiente
function añadirPokemon(pokemon){
    var imagen ="<img src='"+ pokemon.sprites.front_default+"' class='imagenMovil' ondragstart='dragStart(this)' draggable urlEvolucion='"+ pokemon.species.url+"'>"
    contendor_pokemones.innerHTML +=  imagen
}

//Llamada para cargar los pokemones
cargarPokemones()


//Eventos para arrastrar la imagen a la pantalla
function dragStart (htmlElement){
    imagenPokemon = htmlElement
}

function drop (event){
    //Cuando arrastramos una imagen movemos la anterior al contenedor de los pokemones
    if(imagenPokemon){
        var imagenAntigua = event.target.innerHTML
        event.target.innerHTML=""
        pantalla_evoluciones.innerHTML =""
        event.target.appendChild(imagenPokemon) 
        contendor_pokemones.innerHTML += imagenAntigua
        mostrarEvoluciones(imagenPokemon)
    }
}

function dragOver (event){
    event.preventDefault()
}


//Función para mostrar las evoluciones de los pokemon
function mostrarEvoluciones(pokemonIMG){
    fetch(imagenPokemon.getAttribute("urlEvolucion"))
    .then((item)=>{
        return item.json()
    }).then((item)=>{
        fetch(item.evolution_chain.url)
        .then((item)=>{
            return item.json()
        }).then((item)=>{
            //Llamada a función recursiva
            imprimirEvoluciones(item.chain)
        }).catch((error)=>{
            console.log("Ha habido un error: " + error)
        })
    })
    .catch((error)=>{
        console.log("Ha habido un error: " + error)
    })
}

//Función recursiva para obtener el nombre e imagen de cada uno de las evoluciones de un pokemon
function imprimirEvoluciones(listaEvoluciones) {
    var nombrePok = listaEvoluciones.species.name

    fetch("https://pokeapi.co/api/v2/pokemon/"+nombrePok)
    .then((item)=>{
        return item.json()
    }).then((item)=>{
        pantalla_evoluciones.innerHTML += `<div class='evolucion'>
                                                <p>`+ nombrePok +`</p>
                                                <img src=`+ item.sprites.other.showdown.front_default+ ` >
                                            </div>`
        
    })
    .catch((error)=>{
        console.log("Ha habido un error: " + error)
    })

    if (listaEvoluciones.evolves_to.length >0){
        listaEvoluciones.evolves_to.forEach(nextEvolution => imprimirEvoluciones(nextEvolution))
    }
    
}


//Asignación de eventos drag & drop
pantalla_pokemon.addEventListener("drop", drop)
pantalla_pokemon.addEventListener("dragover", dragOver)



