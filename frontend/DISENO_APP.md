# Diseno de la aplicacion

> Última actualización: 17 de noviembre de 2026.

## Objetivo

Nombre elegido para la identidad: **Huellas a Casa**. Queda pendiente comprobar
la disponibilidad del nombre en aplicaciones y marcas antes de adoptarlo
definitivamente; el cambio de nombre aun no se implemento en la app.

La aplicacion debe ser simple, funcional y facil de explicar durante la demo.
No usa animaciones complejas ni pantallas sobrecargadas. Cada pantalla debe tener
una accion principal clara.

## Estilo visual

### Direccion artistica elegida para el futuro rediseno

La app debe sentirse cercana, calida y esperanzadora, manteniendo una interfaz
clara. La referencia elegida combina fondos suaves, fotografias reales de perros,
formas redondeadas e ilustraciones delicadas de personas y perros. El mapa y el
chat deben conservar espacio suficiente para ser practicos.

Se eligio la direccion **A con ilustracion, formas suaves y tonos calidos**: una
base limpia con suficientes detalles humanos para no sentirse vacia o demasiado
tecnologica. La alternativa B se percibio sobrecargada y la C no gusto. Evitar
agregar informacion o decoraciones que compitan con la tarea principal; reservar
las ilustraciones para lugares donde aporten calidez, como el inicio de sesion o
los estados vacios.

- **Verde salvia claro**: verde apagado, ligeramente grisaceo, para explorar en
  fondos o detalles. Todavia no se eligio un codigo de color definitivo.
- **Tipografia**: explorar una serif con peso para nombres o titulos destacados,
  combinada con una sans serif legible para informacion y textos de interfaz.
  La imagen de referencia es generada y no identifica fuentes concretas; quedan
  pendientes la eleccion y la prueba de tipografias reales.
- **Iconos**: preferencia por trazos finos, contornos redondeados y pocos detalles.
  En la referencia, la opcion activa usa una figura rellena sobre un fondo suave;
  el boton central usa berenjena. Adaptar el estilo sin asumir cambios en las
  secciones o funciones actuales de la barra.
- **Tarjeta de reporte**: referencia con foto redondeada a la izquierda y, a la
  derecha, etiqueta del tipo, nombre destacado e informacion secundaria con
  iconos pequenos junto a la ubicacion y la fecha. Una flecha indica que se puede
  abrir el detalle. Mantener el texto legible y mostrar datos disponibles reales.

Estas decisiones son referencias para el rediseno; aun no reemplazan los estilos
implementados que se detallan a continuacion.

- Fondo principal: `#FAFAF7`.
- Superficie: blanco (`#FFFFFF`).
- Color principal e icono activo: azul profundo (`#183B56`).
- Color de accion: berenjena apagado (`#4F2A52`) con texto blanco.
- Acciones secundarias: azul profundo con borde y fondo blanco.
- Perdido: fondo rosa suave (`#FDE2E0`) y texto rojo terracota (`#B42318`).
- Avistamiento: fondo menta (`#E1F3E4`) y texto verde (`#2E7D32`).
- Puntaje alto: fondo verde claro (`#DCFCE7`) y texto verde oscuro (`#166534`).
- Puntaje medio: fondo amarillo suave (`#FFF1D6`) y texto ocre (`#7A4A00`).
- Los errores usan el rojo terracota para mantener consistencia con Perdido.
- Color de texto principal: azul profundo (`#183B56`).
- Color de texto secundario e iconos inactivos: `#5A6E7C`.
- Etiqueta normal: fondo `#DCEAF0`, texto `#183B56`.
- Etiqueta fuerte: fondo `#183B56`, texto `#FFFFFF`.
- Bordes suaves: `#DCE3E6`.
- Tarjetas y botones: bordes redondeados de 10 a 12 pixeles.
- Las tarjetas de reportes pueden usar una sombra suave para separarse del fondo;
  no agregar sombras fuertes ni degradados.

## Estructura comun de las pantallas

1. Franja azul superior para respetar la barra de estado del celular.
2. Titulo de la pantalla sobre el mismo fondo general para que encabezado,
   contenido y barra inferior se perciban como una sola interfaz.
3. Contenido principal con espacio interno.
4. Barra de navegacion inferior en las pantallas principales.

Las pantallas de detalle usan un boton para volver en lugar de la barra de
navegacion inferior.

## Navegacion principal

- **Cerca tuyo**: mapa con reportes cercanos.
- **Coincidencias**: lista de reportes propios y sus coincidencias.
- **Crear reporte**: formulario por pasos.
- **Mensajes**: lista de conversaciones y acceso a cada chat.
- **Perfil**: datos de la cuenta y cierre de sesion.

## Pantallas actuales

### Login: direccion para el rediseno

Mensaje principal elegido: **«Ayudemos a que vuelvan a casa»**. Acompanar con
una ilustracion suave de una persona y un perro, manteniendo accesibles los campos
de correo y contrasena, el inicio de sesion y el acceso al registro. La disposicion
y el texto secundario todavia estan por definir.

Se eligio la variante **Centrado** del prototipo de login. El logo elegido es la
referencia de una persona y un perro formando un corazon, en azul y berenjena;
el simbolo usado en el prototipo actual es una ilustracion provisional diferente.
El fondo salvia del recuadro del prototipo es `#DCE7D6`; queda por confirmar si
ese tono se adopta como color definitivo de la app.

### Inicio

Muestra el mapa centrado en Cordoba o en la ubicacion disponible del celular.
Los marcadores nativos diferencian reportes perdidos y avistamientos con los
mismos colores semanticos de sus etiquetas. El mapa ocupa casi todo el espacio
entre header y navegacion.

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
puntaje, distancia, fecha, miniatura y acceso al reporte relacionado. La
estructura es una lista clara: foto redondeada, etiqueta del tipo, nombre del
perro y CTA berenjena `Ver reporte`. Ninguna coincidencia debe competir con
demasiados colores o barras repetidas.

### Conversacion

Es accesible solo desde una coincidencia confirmada. Tiene cabecera compacta con
el otro participante, mensajes propios y recibidos, campo de texto y un boton
circular con avion de papel. Cada mensaje muestra `Enviado - hora` o `Leido - hora`.
La lista de conversaciones usa filas de ancho completo, no tarjetas aisladas.

## Reglas de interaccion

- Una accion destructiva o negativa usa rojo y queda a la izquierda.
- Una accion principal usa berenjena y queda a la derecha.
- Los mensajes de carga usan un indicador azul.
- Los errores se muestran con texto rojo y lenguaje simple.
- Cuando no hay datos, se muestra un mensaje explicativo en vez de una pantalla vacia.
- Las fotos usan `cover` en miniaturas y `contain` al ampliarse.
- La barra inferior ocupa todo el ancho. El icono activo tiene un circulo azul
  profundo; el boton `+` sobresale poco, usa berenjena y se vuelve azul en crear
  reporte. No muestra etiquetas de texto debajo de los iconos.

## Animaciones posibles

La app ya usa microanimaciones funcionales en la barra inferior: el indicador
activo se desplaza y el icono reduce levemente su escala al tocarlo. No se deben
agregar animaciones decorativas por defecto. Si mas adelante se quiere agregar
otra, se elegira solo si mejora la comprension de una accion y no distrae.

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

- Ajustar la percepcion de centrado del circulo activo de la barra inferior en
  todos los iconos a partir de una prueba real en celular.
- Evitar el parpadeo al cambiar secciones principales con una estructura de
  navegacion persistente, si se decide asumir ese cambio tecnico.
- Ajustar los textos y espacios luego de probar la app completa en el celular.
- Agregar estados visuales completos de carga, vacio y error donde todavia falten.
