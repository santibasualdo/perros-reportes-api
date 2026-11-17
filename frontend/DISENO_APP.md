# Diseno de la aplicacion

## Objetivo

La aplicacion debe ser simple, funcional y facil de explicar durante la demo.
No usa animaciones complejas ni pantallas sobrecargadas. Cada pantalla debe tener
una accion principal clara.

## Estilo visual

- Fondo principal: `#FAFAF7`.
- Superficie: blanco (`#FFFFFF`).
- Color principal e icono activo: azul profundo (`#183B56`).
- Color de accion: coral (`#E9826B`) con texto azul oscuro (`#07182A`).
- Color de accion secundaria: azul profundo con borde y fondo blanco.
- Color para rechazar o mostrar errores: rojo (`#b3261e`).
- Color de texto principal: azul profundo (`#183B56`).
- Color de texto secundario e iconos inactivos: `#5A6E7C`.
- Etiqueta normal: fondo `#DCEAF0`, texto `#183B56`.
- Etiqueta fuerte: fondo `#183B56`, texto `#FFFFFF`.
- Bordes suaves: `#DCE3E6`.
- Tarjetas y botones: bordes redondeados de 10 a 12 pixeles.

## Estructura comun de las pantallas

1. Franja azul superior para respetar la barra de estado del celular.
2. Titulo de la pantalla sobre fondo blanco.
3. Contenido principal con espacio interno.
4. Barra de navegacion inferior en las pantallas principales.

Las pantallas de detalle usan un boton para volver en lugar de la barra de
navegacion inferior.

## Navegacion principal

- **Cerca tuyo**: mapa con reportes cercanos.
- **Coincidencias**: lista de reportes propios y sus coincidencias.
- **Crear reporte**: formulario por pasos.
- **Perfil**: datos de la cuenta y cierre de sesion.

## Pantallas actuales

### Inicio

Muestra el mapa centrado en Cordoba o en la ubicacion disponible del celular.
Los marcadores diferencian reportes perdidos y avistamientos.

### Crear reporte

El formulario se divide en cinco pasos: tipo, datos basicos, ubicacion,
caracteristicas y fotografias. Asi se evita mostrar muchos campos al mismo
tiempo.

### Detalle del reporte

Muestra fotos, datos, caracteristicas y ubicacion. Las fotos se pueden ampliar.
Si se llega desde una coincidencia pendiente, permite rechazar a la izquierda o
confirmar a la derecha.

### Coincidencias

Primero se elige un reporte propio. Luego se muestran sus coincidencias con
puntaje, distancia, estado, miniatura y acceso al reporte relacionado.

### Conversacion

Por ahora es una pantalla base accesible solo desde una coincidencia confirmada.
Luego mostrara los mensajes y el campo para enviar uno nuevo.

## Reglas de interaccion

- Una accion destructiva o negativa usa rojo y queda a la izquierda.
- Una accion principal usa el boton azul y queda a la derecha.
- Los mensajes de carga usan un indicador azul.
- Los errores se muestran con texto rojo y lenguaje simple.
- Cuando no hay datos, se muestra un mensaje explicativo en vez de una pantalla vacia.
- Las fotos usan `cover` en miniaturas y `contain` al ampliarse.

## Animaciones posibles

Por ahora la aplicacion no implementa animaciones. La idea es mantenerla simple
para la demo. Si mas adelante se quiere agregar una, se elegira solo si mejora
la comprension de una accion y no distrae.

Cuando se pida una animacion, se debe indicar su nombre, para que caso sirve y
como se aplicaria en esta app antes de programarla.

Posibilidades a considerar:

1. **Squash & stretch**: comprimir y estirar levemente un elemento al tocarlo.
2. **Anticipation wind-up**: pequeno movimiento previo antes de una accion.
3. **Staging the focus**: usar movimiento para dirigir la atencion a una zona.
4. **Pose to pose**: pasar entre posiciones definidas, por ejemplo abrir y cerrar un panel.
5. **Follow through**: una parte termina de moverse despues de la accion principal.
6. **Slow in & slow out**: empezar y terminar una animacion de forma suave.
7. **Moving in arcs**: mover elementos siguiendo una curva en vez de una linea recta.
8. **Secondary action**: agregar un movimiento pequeno que acompana la accion principal.
9. **Snappy timing**: movimientos rapidos para acciones cortas, como confirmar.
10. **Exaggerated feedback**: respuesta visual mas marcada despues de una accion importante.
11. **Solid drawing in 3D**: dar sensacion de volumen o profundidad.
12. **Overall appeal**: mejorar la sensacion general para que un elemento sea agradable y claro.
13. **Fitts's law**: hacer controles importantes faciles de alcanzar y tocar.
14. **Bigger hit areas**: aumentar el area tocable aunque el icono sea pequeno.
15. **Hick's law**: reducir opciones visibles para que decidir sea mas rapido.
16. **Miller's law**: agrupar informacion en bloques pequenos y faciles de recordar.
17. **Doherty threshold**: mostrar una respuesta visual rapida para que la app parezca fluida.
18. **Postel's law**: aceptar variaciones razonables en datos ingresados por la persona.
19. **Jakob's law**: usar patrones conocidos para que la app se sienta familiar.
20. **Frequency of use**: hacer mas accesibles las acciones que se usan con frecuencia.

No todas son animaciones tecnicas: varias son principios de diseno e interaccion.
Por ejemplo, para la app podrian servir especialmente **slow in & slow out**,
**snappy timing**, **bigger hit areas** y **Hick's law**.

### Paginas de inspiracion

- [React Bits](https://reactbits.dev/): referencia visual de componentes y
  animaciones para React web. Se puede usar para elegir una idea, pero su codigo
  no se copia directamente porque la app usa Expo y React Native. Si se elige
  una animacion de esta pagina, se analizara como recrearla con Reanimated.

### Herramientas futuras

- [Logo Design Skill](https://github.com/kaankiziltug/logo-design-skill): skill
  para definir el logo e icono de Perros Reportes cuando se decida crear la
  identidad visual definitiva. Permite proponer y probar disenos SVG, pero no
  se instalara ni usara hasta ese momento.

### Posibilidades tecnicas y de UX

Estas opciones tampoco se implementaran por defecto. Se evaluaran cuando una
pantalla las necesite y se explicara antes su efecto y forma de aplicacion.

1. **Skeleton loaders**: bloques temporales mientras se cargan datos.
2. **Optimistic updates**: actualizar la interfaz antes de que el backend confirme una accion.
3. **Command menu**: menu rapido de acciones, util sobre todo en aplicaciones grandes.
4. **Shortcut hints**: mostrar atajos disponibles, principalmente para web o teclado.
5. **Undo toasts**: aviso temporal que permite deshacer una accion.
6. **Stale-while-revalidate**: mostrar datos guardados y actualizarlos en segundo plano.
7. **Pre-rendering**: preparar una pantalla antes de mostrarla para que abra mas rapido.
8. **BlurHash placeholders**: vista borrosa temporal mientras carga una fotografia.
9. **View transitions**: transicion visual entre dos vistas relacionadas.
10. **Swipe-to-dismiss sheets**: cerrar una hoja o panel deslizando hacia abajo.
11. **Interruptible animations**: animaciones que se pueden interrumpir sin verse mal.
12. **Predictive back**: anticipar visualmente el regreso a la pantalla anterior en Android.
13. **Hit slop**: ampliar el area tocable de un control pequeno sin cambiar su tamano visible.
14. **Safe area insets**: respetar los bordes ocupados por camara, barra superior o navegacion.
15. **One-time code autofill**: completar automaticamente codigos recibidos por SMS o correo.
16. **Tabular numbers**: numeros de ancho fijo para que listas y contadores no salten visualmente.
17. **Balanced headlines**: distribuir mejor los saltos de linea de un titulo.
18. **Continuous corners**: esquinas redondeadas con una curva mas natural.
19. **Idempotency keys**: evitar duplicar una operacion si se reintenta una misma solicitud.
20. **Amazon safe triangle**: patron para evitar que menus desplegables se cierren al mover el cursor.

Para esta app podrian ser utiles en el futuro **skeleton loaders**, **BlurHash
placeholders**, **undo toasts**, **hit slop**, **tabular numbers** e
**idempotency keys**.

### Ideas visuales adicionales

Estas ideas se agregan como referencia. No se implementaran sin decidir antes
en que pantalla aportan algo.

1. **Concentric radius**: mostrar circulos de distancia en el mapa para indicar
   el radio aproximado de una busqueda o de un reporte.
2. **Alpha borders**: usar bordes con poca opacidad para separar tarjetas y
   campos sin que se vean pesados.
3. **Masked edges**: suavizar los extremos de un carrusel de fotos para sugerir
   que hay mas imagenes disponibles.
4. **Dark mode**: variante oscura para usar la app con menos brillo, si mas
   adelante se decide agregarla.

## Pendientes de diseno

- Lista real de mensajes.
- Campo para escribir y enviar mensajes.
- Indicador de mensajes no leidos.
- Ajustar los textos y espacios luego de probar la app completa en el celular.
