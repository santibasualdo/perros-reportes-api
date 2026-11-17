# Contexto completo del proyecto: Perros Reportes API

> Documento de continuidad para otros chats o desarrolladores. Describe el objetivo, las decisiones tomadas, el código implementado y el punto exacto en el que quedó el desarrollo.
>
> Última actualización: 16 de noviembre de 2026.

## 1. Objetivo del TFG

El proyecto es una aplicación móvil para centralizar reportes de perros perdidos y perros avistados. Debe permitir:

- Registrar e iniciar sesión mediante Supabase Auth.
- Crear reportes de tipo `PERDIDO` o `AVISTAMIENTO`.
- Incorporar ubicación, características físicas y fotografías.
- Consultar listados y detalles completos de los reportes.
- Sugerir coincidencias entre un reporte perdido y uno de avistamiento.
- Permitir que los usuarios relacionados con una coincidencia se comuniquen.

La prioridad es conseguir una demo funcional del flujo principal. No se busca todavía una aplicación visualmente avanzada ni un algoritmo complejo.

## 2. Tecnologías y rutas

### Backend

- Spring Boot `4.1.2`.
- Java instalado: JDK 22.
- Versión de compilación del proyecto: Java 21.
- Maven global. Usar `mvn`; no usar `mvnw`, porque el wrapper ya produjo problemas de compatibilidad.
- API REST.
- Spring Web.
- Spring Data JPA / Hibernate.
- Bean Validation.
- Spring Security.
- OAuth2 Resource Server para validar JWT.
- Driver PostgreSQL.

Ruta local:

```text
E:\Proyectos\Tesis\App\perros-reportes-api
```

Paquete raíz:

```text
com.santiago.perrosreportes
```

Clase principal:

```text
src/main/java/com/santiago/perrosreportes/PerrosReportesApiApplication.java
```

### Frontend

- Expo / React Native con TypeScript y Expo Router.
- Ruta local: `E:\Proyectos\Tesis\App\perros-reportes-api\frontend`.
- Se inicia desde esa carpeta con `npm start`.
- Usa Supabase Auth en el cliente y el JWT para llamar al backend.
- Para la demo se prioriza un flujo funcional: pantallas simples, pocos botones,
  navegación directa y sin animaciones complejas.
- `DISENO_APP.md` guarda las decisiones visuales, ideas futuras y referencias de
  diseño. No implementa automáticamente sus sugerencias.

### Supabase

- Supabase Auth para registro, inicio de sesión y emisión de JWT.
- PostgreSQL administrado por Supabase.
- Supabase Storage para fotografías.
- Proyecto: `https://gyicoukweusknzpjluwy.supabase.co`.
- Bucket privado: `fotografias-reportes`.
- Tamaño máximo por fotografía: 5 MB.
- Formatos permitidos: JPEG, PNG y WebP.
- RLS está activado y el acceso directo a las tablas desde el cliente está bloqueado; el backend realiza las operaciones de base de datos.

Nunca se deben escribir en Git, mostrar en una respuesta o enviar al frontend:

- La contraseña de PostgreSQL.
- Una clave `service_role` o secret key.
- Tokens reales de usuarios.

## 3. Alcance de la demo

### Incluido

- Autenticación con Supabase.
- Creación del perfil interno del usuario.
- Creación y consulta de reportes.
- Ubicación.
- Características físicas.
- Subida y consulta de fotografías privadas.
- Generación básica de coincidencias mediante datos estructurados.
- Consulta, confirmación y descarte de coincidencias.
- Mensajería entre usuarios relacionados con una coincidencia.
- Frontend móvil para autenticación, reportes, mapa y coincidencias.

### Fuera de alcance por ahora

- IA visual.
- MegaDescriptor-T-224.
- `pgvector`.
- Recuperación de contraseña.
- Generación de carteles.
- Algoritmos avanzados de coincidencia.
- Animaciones o diseño complejo del frontend.

El campo `similitud_visual` ya existe en la entidad de coincidencia, pero debe permanecer en `null` durante esta primera demo.

## 4. Forma de trabajo acordada

- Avanzar en cambios pequeños.
- Explicar brevemente qué se modificará antes de editar archivos.
- Después de cada cambio, compilar o probar lo necesario.
- Explicar el código siguiendo sus líneas y el flujo de ejecución; el usuario prefiere esto antes que diagramas.
- No implementar varios módulos completos de una sola vez.
- No pegar archivos completos en las explicaciones salvo que se solicite.
- Mantener las explicaciones breves, claras y en español.
- El usuario necesita comprender el código para defenderlo en el TFG.
- En métodos y constructores, mantener el primer parámetro junto al paréntesis de apertura, por ejemplo:

```java
public Metodo(PrimerParametro primero,
        SegundoParametro segundo) {
}
```

## 5. Configuración local

El archivo `application.properties` referencia variables de entorno y no contiene secretos reales:

```properties
spring.datasource.url=${SUPABASE_DB_URL}
supabase.secret-key=${SUPABASE_SECRET_KEY}
```

Variables necesarias:

- `SUPABASE_DB_URL`: cadena JDBC completa. Debe comenzar con `jdbc:postgresql://`.
- `SUPABASE_SECRET_KEY`: clave exclusiva del backend para operar con el bucket privado. Nunca debe llegar a React Native.

Configuraciones no secretas existentes:

- Issuer JWT: `https://gyicoukweusknzpjluwy.supabase.co/auth/v1`.
- URL base de Supabase: `https://gyicoukweusknzpjluwy.supabase.co`.
- Bucket: `fotografias-reportes`.
- `spring.servlet.multipart.max-file-size=5MB`.
- `spring.servlet.multipart.max-request-size=6MB`.

El límite de 5 MB controla el archivo individual. El límite de 6 MB controla la petición multipart completa, incluyendo encabezados y demás información del formulario.

Archivos locales o sensibles ignorados por Git:

```text
.env
.env.*
application-local.properties
.idea
*.iml
*.ipr
```

## 6. Comandos importantes

Desde PowerShell:

```powershell
cd E:\Proyectos\Tesis\App\perros-reportes-api
mvn clean test
mvn spring-boot:run
```

Para una verificación rápida de compilación:

```powershell
mvn -q -DskipTests compile
```

Si IntelliJ vuelve a mostrar `release version 5 not supported`, primero verificar con Maven. Fue un error de configuración antigua de IntelliJ, no del código. No modificar módulos o carpetas fuente sin necesidad.

## 7. Arquitectura del backend

La estructura sigue una separación sencilla por dominio:

```text
com.santiago.perrosreportes
├── caracteristicas
├── coincidencia
├── config
├── conversacion
├── fotografia
├── reporte
├── security
├── ubicacion
└── usuario
```

Dentro de cada módulo se usan estas responsabilidades:

- `Controller`: asocia una URL y un método HTTP con un método Java. Spring recibe la petición, obtiene sus datos según las anotaciones y llama al controlador.
- `Request`: representa únicamente los datos que el cliente tiene permitido enviar.
- `Service`: contiene las reglas de negocio y coordina repositorios u otros servicios.
- `Repository`: interfaz que extiende `JpaRepository`. Spring Data JPA genera su implementación al iniciar.
- `Entity`: clase anotada con `@Entity` que representa una tabla de PostgreSQL.
- `Response`: objeto específico para devolver una respuesta controlada sin exponer relaciones o campos innecesarios.

Flujo general:

```text
Aplicación móvil → petición HTTP → Spring Security → Controller → Service → Repository → PostgreSQL
```

Para fotografías también interviene Supabase Storage:

```text
Controller → FotografiaService → SupabaseStorageService → Supabase Storage
                                  ↘ FotografiaRepository → PostgreSQL
```

## 8. Autenticación y seguridad

### Flujo de autenticación

1. La aplicación móvil envía correo y contraseña a Supabase Auth.
2. Supabase valida las credenciales y devuelve una sesión con un `access_token`.
3. El `access_token` es un JWT y contiene, entre otros datos, el ID del usuario en el claim `sub` y normalmente su correo en `email`.
4. En cada petición protegida, la app vuelve a enviar el token:

```http
Authorization: Bearer <access_token>
```

5. Spring Security intercepta la petición antes del controlador.
6. OAuth2 Resource Server lee el token Bearer y valida el JWT usando la configuración del issuer de Supabase.
7. Si es válido, Spring crea el contexto de autenticación y permite continuar.
8. `@AuthenticationPrincipal Jwt jwt` solicita que Spring inyecte el JWT ya validado en el parámetro del controlador.
9. `jwt.getSubject()` obtiene el claim `sub`, es decir, el UUID del usuario autenticado.

`Bearer` indica que el token funciona por posesión: quien lo posee puede presentarlo. Por eso debe protegerse y enviarse por HTTPS. JWT es el formato del token. OAuth2 Resource Server es el soporte que configura cómo Spring recibe y valida esos tokens de acceso.

### Reglas actuales de Spring Security

- `GET /api/salud` es público.
- Cualquier otra URL requiere un JWT válido.
- CSRF está desactivado porque la API es stateless y usa tokens Bearer.

La configuración central está en `security/SecurityConfig.java`:

```java
.requestMatchers("/api/salud").permitAll()
.anyRequest().authenticated()
.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
```

### Perfil de usuario interno

Supabase Auth crea al usuario en `auth.users`, pero los reportes tienen una FK hacia `public.usuario`. Por eso, después del registro/autenticación, la app debe llamar al backend para crear el perfil de dominio.

El backend toma del JWT:

- ID desde `sub`.
- Correo desde `email`.

El JSON solo aporta el nombre. La contraseña nunca llega al backend propio ni se guarda en `public.usuario`.

## 9. Modelo de datos

Tablas creadas en Supabase:

- `usuario`
- `reporte`
- `ubicacion`
- `caracteristicas_fisicas`
- `fotografia`
- `coincidencia`
- `conversacion`
- `participante_conversacion`
- `mensaje`

### Usuario

- PK: `id_usuario` UUID.
- Coincide con el UUID generado por Supabase Auth.
- Campos implementados: `nombre`, `correo_electronico`, `creado_en`.
- `creado_en` lo completa PostgreSQL mediante su valor por defecto.

### Reporte

- PK: `id_reporte` UUID generado por JPA.
- FK: `id_usuario` hacia `usuario`.
- `tipo`: enum Java `PERDIDO` o `AVISTAMIENTO`.
- `nombre`: opcional, útil principalmente para perros perdidos.
- `descripcion`.
- `fecha_hora`.
- `estado`: actualmente se crea como texto `ACTIVO`.
- `creado_en`: generado por PostgreSQL.

### Ubicación

- `id_reporte` es a la vez PK y FK hacia `reporte`.
- Relación uno a uno con `Reporte`.
- Usa `@MapsId`: al guardar la ubicación asociada a un reporte, JPA copia el ID del reporte como ID de la ubicación.
- Campos: `latitud`, `longitud`, `direccion`.
- Esto garantiza como máximo una ubicación por reporte.

### Características físicas

- `id_reporte` es a la vez PK y FK hacia `reporte`.
- Relación uno a uno con `Reporte` mediante `@MapsId`.
- Campos: `tamano`, `color`, `raza`, `sexo`, `senas_particulares`.
- `sexo` usa `SexoPerro`: `MACHO`, `HEMBRA`, `DESCONOCIDO`.
- Esto garantiza como máximo un conjunto de características por reporte.

### Fotografía

- PK propia: `id_fotografia` UUID.
- FK: `id_reporte` hacia `reporte`.
- Relación muchos a uno: un reporte puede tener varias fotografías.
- La columna `url` guarda la ruta permanente dentro del bucket, no una URL pública.
- `creado_en` lo completa PostgreSQL.

Ejemplo conceptual de ruta almacenada:

```text
<idReporte>/<uuidAleatorio>.jpg
```

### Coincidencia

- PK: `id_coincidencia` UUID.
- FK `id_reporte_perdido` hacia `reporte`.
- FK `id_reporte_avistamiento` hacia `reporte`.
- Ambas relaciones son `@ManyToOne`: un mismo reporte puede participar en varias coincidencias.
- Campos: `similitud_caracteristicas`, `distancia`, `puntaje_total`, `estado`, `creado_en`, `similitud_visual`.
- Estados: `PENDIENTE`, `CONFIRMADA`, `DESCARTADA`.
- `similitud_visual` es nullable y no debe calcularse todavía.

Una coincidencia siempre debe vincular un reporte `PERDIDO` con otro `AVISTAMIENTO`. Los dos IDs apuntan a la misma tabla `reporte`, pero cumplen roles distintos.

### Conversaciones y mensajes

- `conversacion` tiene PK `id_conversacion`, FK única `id_coincidencia`, `activa` y `fecha_creacion`.
- La relación entre `Conversacion` y `Coincidencia` es `@OneToOne`: una coincidencia puede tener una sola conversación.
- La conversación se crea automáticamente cuando uno de los propietarios envía el primer mensaje; no existe un endpoint para crearla manualmente.
- Solo se permite mensajería cuando la coincidencia está `CONFIRMADA`.
- `participante_conversacion` usa una PK compuesta por `id_conversacion` e `id_usuario`.
- `ParticipanteConversacionId` representa esa PK mediante `@Embeddable`; `@MapsId` reutiliza las mismas columnas como PK y FK.
- Los participantes son siempre los propietarios de los reportes perdido y de avistamiento.
- `mensaje` tiene PK `id_mensaje`, FK `id_conversacion`, FK `id_emisor`, `contenido`, `fecha_hora` y `leido`.
- La propiedad Java del emisor se llama `usuario`, pero se mapea a la columna real `id_emisor`.
- El contenido recibido por `EnviarMensajeRequest` es obligatorio y admite como máximo 200 caracteres.
- Los mensajes nuevos se guardan con la hora UTC del backend y `leido = false`.
- `@Transactional` garantiza que conversación, participantes y mensaje se guarden juntos o se reviertan juntos si ocurre un error.

## 10. Endpoints implementados

Salvo `/api/salud`, todos requieren:

```http
Authorization: Bearer <JWT válido de Supabase>
```

### Salud

#### `GET /api/salud`

Público. Responde:

```json
{
  "estado": "funcionando"
}
```

### Usuarios

#### `POST /api/usuarios`

Crea el perfil interno después de autenticarse en Supabase.

```json
{
  "nombre": "Santiago"
}
```

- El ID y el correo se obtienen del JWT.
- Devuelve `201 Created`.
- Devuelve `409 Conflict` si el perfil ya existe.
- Devuelve `400 Bad Request` si el JWT no contiene correo.

#### `GET /api/usuarios/yo`

Actualmente responde solamente el ID del usuario autenticado:

```json
{
  "usuarioId": "<uuid>"
}
```

### Reportes

#### `POST /api/reportes`

```json
{
  "tipo": "PERDIDO",
  "nombre": "Firulais",
  "descripcion": "Perro marrón de tamaño mediano",
  "fechaHora": "2026-11-02T21:30:00Z"
}
```

- `tipo` y `fechaHora` son obligatorios.
- El enum rechaza valores diferentes de `PERDIDO` y `AVISTAMIENTO`.
- El ID del usuario se toma del JWT.
- El estado se establece en `ACTIVO`.
- Devuelve `201 Created`.
- El usuario debe existir antes en `public.usuario`; de lo contrario PostgreSQL rechaza la FK.

#### `GET /api/reportes`

Devuelve todos los reportes. Actualmente no filtra por propietario, tipo, estado ni distancia.

#### `GET /api/reportes/mapa`

- Devuelve los datos mínimos que necesita el mapa para mostrar reportes activos.
- La pantalla inicial de la app lo usa para crear marcadores.

#### `GET /api/reportes/mios`

- Devuelve únicamente los reportes del usuario autenticado.
- La pantalla de coincidencias lo usa para que la persona elija sobre qué reporte
  quiere consultar coincidencias.

#### `GET /api/reportes/{idReporte}`

Devuelve `ReporteDetalleResponse`, que combina:

- Datos básicos del reporte.
- Ubicación o `null`.
- Características físicas o `null`.
- Lista de fotografías con URLs firmadas temporales.

Devuelve `404 Not Found` si el reporte no existe.

### Ubicación

#### `POST /api/reportes/{idReporte}/ubicacion`

```json
{
  "latitud": -27.4514,
  "longitud": -58.9867,
  "direccion": "Plaza central"
}
```

- Latitud y longitud son obligatorias.
- Solo el propietario del reporte puede crearla.
- Devuelve `409 Conflict` si el reporte ya tiene ubicación.
- Devuelve `404` si el reporte no existe.
- Devuelve `403` si pertenece a otro usuario.

#### `GET /api/reportes/{idReporte}/ubicacion`

Devuelve la entidad `Ubicacion`. Devuelve `404` si no existe.

### Características físicas

#### `POST /api/reportes/{idReporte}/caracteristicas`

```json
{
  "tamano": "MEDIANO",
  "color": "MARRON",
  "raza": "Mestizo",
  "sexo": "MACHO",
  "senasParticulares": "Mancha blanca en el pecho"
}
```

- `tamano` y `color` no pueden ser nulos, vacíos ni espacios.
- `sexo` debe coincidir con el enum si se envía.
- Solo el propietario puede crear las características.
- Devuelve `409` si ya existen, `404` si el reporte no existe y `403` si es de otro usuario.

#### `GET /api/reportes/{idReporte}/caracteristicas`

Devuelve `CaracteristicasFisicasResponse`, sin repetir el reporte completo. Devuelve `404` si no existen características para ese reporte.

### Fotografías

#### `POST /api/reportes/{idReporte}/fotografias`

Petición `multipart/form-data`. La parte del formulario debe llamarse `archivo`:

```text
archivo = <imagen JPEG, PNG o WebP>
```

El parámetro del controlador es:

```java
@RequestParam("archivo") MultipartFile archivo
```

- Solo el propietario puede subir fotografías al reporte.
- El archivo no puede estar vacío.
- Máximo 5 MB.
- Tipos aceptados: `image/jpeg`, `image/png`, `image/webp`.
- El backend crea una ruta con el ID del reporte y un UUID aleatorio.
- Sube los bytes a Supabase Storage.
- Guarda únicamente la ruta en PostgreSQL.
- Devuelve `201 Created`.

#### `GET /api/reportes/{idReporte}/fotografias`

- Comprueba que el reporte exista.
- Busca todas las fotografías por `idReporte`.
- Solicita a Supabase una URL firmada por cada fotografía.
- Cada URL dura 600 segundos, es decir, 10 minutos.
- Devuelve una lista de `FotografiaResponse` con ID, URL firmada y fecha de creación.
- Una lista vacía es válida si el reporte no tiene fotografías.

La app usa la URL firmada para descargar la imagen directamente desde Supabase. La clave secreta permanece en el backend.

### Coincidencias

#### `POST /api/reportes/{idReporte}/coincidencias`

- Solo el propietario del reporte puede generar sus coincidencias.
- El reporte debe existir y estar `ACTIVO`.
- No recibe cuerpo JSON; obtiene el usuario desde el JWT.
- Busca reportes activos del tipo contrario y descarta los del mismo usuario.
- Compara características, distancia geográfica y diferencia temporal.
- Guarda únicamente coincidencias nuevas con puntaje total igual o superior a 60.
- Devuelve las coincidencias creadas; `[]` es válido si no hubo candidatos suficientes o todos ya existían.

#### `GET /api/reportes/{idReporte}/coincidencias`

- Comprueba que el reporte exista.
- Solo el propietario del reporte puede consultar sus coincidencias.
- Busca coincidencias donde el reporte aparezca como perdido o como avistamiento.
- Devuelve una lista; `[]` es una respuesta válida cuando no hay coincidencias.

#### `PATCH /api/coincidencias/{idCoincidencia}/confirmar`

- Solo puede usarlo el usuario que creó el reporte `PERDIDO`.
- Cambia el estado a `CONFIRMADA`.
- Devuelve `404` si la coincidencia no existe y `403` si el usuario no es el creador del reporte perdido.

#### `PATCH /api/coincidencias/{idCoincidencia}/descartar`

- Solo puede usarlo el usuario que creó el reporte `PERDIDO`.
- Cambia el estado a `DESCARTADA`.

### Conversaciones y mensajes

#### `POST /api/coincidencias/{idCoincidencia}/mensajes`

```json
{
  "contenido": "Hola, ¿en qué zona lo viste?"
}
```

- Solo acepta coincidencias `CONFIRMADA`.
- Solo los propietarios de los dos reportes pueden enviar mensajes.
- En el primer envío crea una conversación activa y registra automáticamente a ambos propietarios como participantes.
- En envíos posteriores reutiliza la conversación existente.
- Rechaza conversaciones inactivas.
- El contenido es obligatorio y tiene un máximo de 200 caracteres.
- Devuelve `201 Created` con `MensajeResponse`.

#### `GET /api/coincidencias/{idCoincidencia}/mensajes`

- Solo permite consultar a propietarios que sean participantes.
- No crea una conversación al consultar.
- Devuelve `[]` si todavía no existe conversación.
- Devuelve los mensajes ordenados desde el más antiguo al más reciente.

#### `PATCH /api/coincidencias/{idCoincidencia}/mensajes/leidos`

- Marca como leídos únicamente los mensajes enviados por el otro participante.
- Excluye los mensajes propios mediante una consulta por emisor diferente y `leido = false`.
- Devuelve `204 No Content`.
- Si no existe conversación o no hay mensajes pendientes, no modifica datos.

## 11. Funcionamiento de Supabase Storage

`SupabaseStorageConfig` crea un bean `RestClient` reutilizable con:

- URL base: `<supabase.url>/storage/v1`.
- Encabezado `apikey`.
- Encabezado `Authorization: Bearer <clave-backend>`.

`RestClient` no representa una petición concreta: es un cliente configurado para construir y enviar varias peticiones a Supabase Storage.

### Subida

`SupabaseStorageService.subir(ruta, archivo)`:

1. Valida que exista el archivo, su tamaño y su tipo MIME.
2. Envía un `POST` a `/object/{bucket}/{ruta}`.
3. Usa como `Content-Type` el tipo MIME del archivo.
4. Envía los bytes como cuerpo.
5. Devuelve la ruta permanente para guardarla en PostgreSQL.

### URL firmada

`SupabaseStorageService.generarUrlFirmada(ruta)`:

1. Envía un `POST` a `/object/sign/{bucket}/{ruta}`.
2. El JSON del cuerpo contiene `expiresIn: 600`.
3. Supabase responde con `signedURL`.
4. El backend completa la URL con la URL base de Supabase.
5. La respuesta al cliente incluye esa URL temporal.

El doble uso de `.body(...)` en `RestClient` cumple dos funciones distintas:

- El primer `.body(objeto)` establece el cuerpo enviado.
- El segundo `.body(Clase.class)`, después de `.retrieve()`, convierte el JSON recibido a un objeto Java.

## 12. Estado actual del módulo de coincidencias

### Ya implementado

- Entidad `Coincidencia`.
- Enum `EstadoCoincidencia`.
- `CoincidenciaRepository`.
- `CoincidenciaResponse`.
- Listado de coincidencias por reporte.
- Confirmación.
- Descarte.
- Consulta disponible para los propietarios involucrados; confirmar y descartar están reservados al creador del reporte `PERDIDO`.
- Método privado `buscarCandidatos(Reporte reporteOrigen)`.
- Generación automática de coincidencias mediante `generarCoincidencias`.
- Cálculo de puntajes por características, distancia y fecha.
- Prevención de duplicados antes de guardar.
- Persistencia con estado inicial `PENDIENTE` y `similitudVisual = null`.
- Endpoint `POST /api/reportes/{idReporte}/coincidencias`.
- La respuesta incluye, cuando existe, la URL firmada temporal de la primera
  fotografía de cada reporte para mostrar una miniatura en la app.

### Qué hace `buscarCandidatos`

1. Recibe el reporte de origen.
2. Si es `PERDIDO`, define como tipo candidato `AVISTAMIENTO`.
3. Si es `AVISTAMIENTO`, define como tipo candidato `PERDIDO`.
4. Consulta mediante `findByTipoAndEstado(tipoCandidato, "ACTIVO")` todos los reportes activos del tipo contrario.
5. Recorre los resultados.
6. Excluye los reportes pertenecientes al mismo usuario que creó el reporte de origen.
7. Devuelve la lista restante.

Este método solamente realiza el filtro inicial. Las comparaciones y el guardado se realizan después dentro de `generarCoincidencias`.

### Métodos derivados importantes de Spring Data JPA

```java
List<Reporte> findByTipoAndEstado(TipoReporte tipo, String estado);
```

Busca todos los reportes que coincidan simultáneamente con el tipo y el estado.

```java
boolean existsByReportePerdido_IdReporteAndReporteAvistamiento_IdReporte(
        UUID idReportePerdido,
        UUID idReporteAvistamiento);
```

Permite comprobar si ya existe una coincidencia entre ese perdido y ese avistamiento, evitando duplicados.

```java
List<Coincidencia> findByReportePerdido_IdReporteOrReporteAvistamiento_IdReporte(
        UUID idReportePerdido,
        UUID idReporteAvistamiento);
```

Cuando se llama con el mismo ID en ambos parámetros, busca todas las coincidencias donde ese reporte esté en cualquiera de los dos roles.

## 13. Generación y puntaje de coincidencias

`generarCoincidencias(idReporte, idUsuario)` realiza este flujo:

1. Busca el reporte de origen o devuelve `404`.
2. Verifica que pertenezca al usuario autenticado o devuelve `403`.
3. Comprueba que esté `ACTIVO` o devuelve `409`.
4. Busca candidatos activos del tipo contrario y de otro usuario.
5. Omite candidatos sin características o ubicación.
6. Orienta los reportes como perdido y avistamiento, aunque el origen sea cualquiera de los dos.
7. Descarta avistamientos anteriores a la pérdida.
8. Calcula puntajes y omite resultados con total menor a 60.
9. Evita duplicados mediante `existsBy...`.
10. Guarda la coincidencia como `PENDIENTE` y devuelve su `CoincidenciaResponse`.

### Fórmula actual de la demo

- Características: color, tamaño, raza y sexo aportan 25 puntos cada uno cuando coinciden exactamente, ignorando mayúsculas y espacios externos cuando corresponde.
- Distancia: se calcula en kilómetros con la fórmula de Haversine. Otorga 100 puntos hasta 1,5 km; 70 hasta 5 km; 40 hasta 8 km; 20 hasta 15 km; y 5 para distancias mayores.
- Fecha: otorga 100 puntos hasta 1 día; 80 hasta 3 días; 60 hasta 7 días; 40 hasta 14 días; 20 hasta 30 días; y 5 después de 30 días.
- Puntaje total: 50 % características, 30 % distancia y 20 % fecha.
- Umbral de guardado: 60 puntos.
- `similitudVisual` permanece en `null` porque la IA visual todavía no está implementada.

## 13.1. Estado actual de conversaciones y mensajes

- Entidades `Conversacion`, `ParticipanteConversacion`, `ParticipanteConversacionId` y `Mensaje` implementadas.
- Repositorios y consultas derivadas implementados.
- `EnviarMensajeRequest` y `MensajeResponse` implementados.
- `MensajeService` implementa envío, creación automática de conversación y participantes, listado y marcado como leído.
- `MensajeController` expone `POST`, `GET` y `PATCH`.
- La autorización usa el UUID del JWT y comprueba propiedad y participación.
- El envío y la creación relacionada se ejecutan dentro de una transacción.

## 13.2. Estado actual del frontend

- Registro e inicio de sesión con Supabase implementados.
- `AuthProvider` conserva la sesión y protege las pantallas que requieren inicio
  de sesión.
- `SafeAreaProvider` y `useSafeAreaInsets()` evitan que el contenido quede bajo
  la barra superior o los controles de navegación del teléfono.
- La pantalla inicial muestra un mapa de Córdoba, usa la última ubicación conocida
  cuando está disponible y carga marcadores desde `GET /api/reportes/mapa`.
- Se puede crear un reporte por pasos: tipo, datos básicos, ubicación,
  características y fotografías.
- El detalle muestra fotos en carrusel, permite ampliarlas y muestra datos,
  características y ubicación. El botón de ubicación vuelve al mapa centrado en
  ese reporte.
- La pantalla de coincidencias lista los reportes propios, permite elegir uno y
  luego muestra sus coincidencias con puntaje, distancia, estado, miniatura y
  acceso al reporte relacionado.
- Desde el detalle de una coincidencia pendiente, el propietario del reporte
  perdido puede rechazar a la izquierda o confirmar a la derecha. Si está
  confirmada, ambos participantes ven el botón `Abrir chat`.
- Ya existe la ruta `conversaciones/[idCoincidencia]` y una pantalla base de
  conversación. Todavía no carga ni envía mensajes reales.

## 13.3. Próximo paso exacto

Conectar la pantalla de conversación al backend de a un cambio pequeño: primero
hacer el `GET /api/coincidencias/{idCoincidencia}/mensajes` y mostrar la lista.
Después se agregará el campo para enviar con el `POST`. No implementar todavía
tiempo real, IA visual, `pgvector` ni animaciones complejas.

## 14. Validaciones y códigos HTTP usados

- `200 OK`: consultas y cambios exitosos.
- `201 Created`: creación de usuario, reporte, ubicación, características, fotografía o mensaje.
- `204 No Content`: mensajes marcados como leídos correctamente.
- `400 Bad Request`: JSON inválido, datos obligatorios ausentes, enum inválido, archivo vacío, mensaje vacío o mensaje mayor a 200 caracteres.
- `401 Unauthorized`: falta el token, está vencido o no es válido.
- `403 Forbidden`: el usuario autenticado intenta operar sobre un recurso ajeno o una conversación en la que no participa.
- `404 Not Found`: el recurso solicitado no existe.
- `409 Conflict`: se intenta crear un recurso único ya existente, usar una coincidencia no confirmada o enviar en una conversación inactiva.
- `413 Payload Too Large`: fotografía mayor a 5 MB.
- `415 Unsupported Media Type`: fotografía con un tipo no permitido.

Actualmente Spring puede responder con su JSON estándar de error, que suele incluir `timestamp`, `status`, `error` y `path`. El texto de `ResponseStatusException` puede no aparecer en esa respuesta según la configuración de inclusión de mensajes.

## 15. Decisiones técnicas importantes

- Se usan UUID porque Supabase Auth ya identifica usuarios con UUID y porque evitan IDs secuenciales predecibles.
- `@GeneratedValue(strategy = GenerationType.UUID)` genera el UUID al persistir una entidad nueva.
- `insertable = false, updatable = false` en `creado_en` hace que JPA omita esa columna en `INSERT` y `UPDATE`, permitiendo que PostgreSQL aplique su `DEFAULT now()`.
- Se usan clases Request para impedir que el cliente envíe campos controlados por el servidor como `idUsuario`, `estado` o `idReporte`.
- Se usan clases Response cuando devolver la entidad expondría relaciones completas o generaría información repetida.
- Las relaciones uno a uno de ubicación y características usan una PK compartida porque solo puede existir un registro de cada tipo por reporte.
- Fotografía usa PK propia porque un reporte puede tener muchas fotos.
- Las fotos permanecen privadas; solo se entregan URLs firmadas temporales.
- Las reglas de propiedad se verifican en los servicios usando el UUID tomado del JWT, nunca aceptando el ID de usuario desde el JSON del cliente.
- En coincidencias, se considera propietario del perro al usuario que creó el reporte `PERDIDO`; solamente ese usuario puede confirmar o descartar la coincidencia.
- Para mensajes, la aplicación solo envía `contenido`; el backend determina emisor, conversación, fecha y estado de lectura.
- La tabla intermedia de participantes usa una clave compuesta para impedir que el mismo usuario se repita en la misma conversación.
- El `GET` consulta sin modificar; la app debe llamar luego al `PATCH /leidos` al abrir una conversación.

## 16. Limitaciones actuales conocidas

- No existe IA visual.
- El puntaje de características usa coincidencias exactas; todavía no interpreta colores o razas parecidos como equivalentes.
- `GET /api/reportes` devuelve todos los reportes sin filtros ni paginación.
- El endpoint individual de ubicación devuelve la entidad completa, que incluye la relación con reporte; todavía no usa `UbicacionResponse` en el controlador.
- Los POST de ubicación, características y fotografía también devuelven entidades, no respuestas específicas.
- No hay un manejador global de errores con mensajes personalizados uniformes.
- Las validaciones iniciales de `CoincidenciaService` tienen pruebas unitarias locales, pero todavía falta una prueba automatizada del caso exitoso de generación.
- El test de contexto necesita las variables de conexión reales para iniciar JPA; si faltan, puede fallar aunque la compilación sea correcta.
- No hay paginación.
- Los mensajes no tienen paginación ni actualización en tiempo real; la app deberá refrescar mediante HTTP.
- No existe todavía un endpoint para cerrar o reactivar conversaciones.
- No hay endpoint para actualizar o cerrar un reporte.
- No se elimina de Storage una fotografía si posteriormente falla el guardado de su fila en PostgreSQL.
- No hay todavía una comprobación explícita de cantidad máxima de fotografías por reporte.
- La pantalla de conversación del frontend todavía es una base visual: faltan la
  carga, envío y actualización de mensajes leídos.

Estas limitaciones no deben corregirse todas juntas. Se prioriza completar el flujo principal de la demo paso a paso.

## 17. Pruebas manuales ya realizadas

Se verificó manualmente, principalmente con Postman:

- Inicio correcto del backend con Maven y variables configuradas.
- Endpoint público de salud.
- Validación de un JWT real de Supabase.
- Lectura del `sub` mediante `/api/usuarios/yo`.
- Creación de perfil interno.
- Creación de reportes.
- Listado y detalle de reportes.
- Respuestas `404` para IDs inexistentes.
- Validación del enum de tipo de reporte.
- Creación y consulta de ubicación.
- Casos `400`, `401`, `403`, `404` y `409` de ubicación.
- Creación y consulta de características.
- Subida real de una fotografía al bucket privado.
- Consulta de fotografías con URL firmada.
- Detalle agregado del reporte con ubicación, características y fotos.
- Generación real de una coincidencia entre usuarios diferentes.
- Cálculo correcto de características, distancia y puntaje total.
- Consulta de la coincidencia guardada con su fecha de creación.
- Prevención de duplicados: repetir el `POST` devuelve `[]` y no crea otra fila.
- Confirmación de una coincidencia, cambiando su estado de `PENDIENTE` a `CONFIRMADA`.
- Creación automática de una conversación al enviar el primer mensaje.
- Creación automática de los dos propietarios como participantes.
- Envío de mensajes por ambos participantes.
- Reutilización de una única conversación sin duplicar participantes.
- Listado cronológico de mensajes.
- Rechazo con `403` para un tercer usuario.
- Rechazo con `400` para contenido vacío o mayor a 200 caracteres.
- Rechazo con `409` cuando la coincidencia no está confirmada.
- Marcado como leído únicamente de los mensajes enviados por el otro participante.
- Registro, inicio de sesión y creación del perfil interno desde un celular físico.
- Mapa, ubicación, creación de reportes, fotografías, selección y consulta de
  coincidencias desde el frontend.
- Confirmación o descarte de una coincidencia y navegación a la pantalla base de
  conversación desde el frontend.

La compilación Maven pasa. También pasan cinco pruebas unitarias locales de `MensajeService`: conversación existente, creación inicial, coincidencia no confirmada, tercero no autorizado y marcado como leído.

## 18. Git

- Rama principal: `main`.
- Repositorio remoto configurado con el alias `origin`.
- `origin` es el nombre local que Git usa para referirse al repositorio remoto de GitHub; no es una carpeta.
- Las pruebas locales de coincidencias y conversaciones están excluidas mediante `.git/info/exclude`, por lo que no aparecen en `git status` ni se suben con `git add .`.
- La prueba local de mensajes se ejecuta con `mvn -q -Dtest=MensajeServiceTest test`.

Comandos habituales:

```powershell
git status
git add .
git commit -m "Descripción breve"
git push origin main
```

No usar comandos destructivos como `git reset --hard` para resolver problemas sin revisar antes el estado del repositorio.

## 19. Conceptos que el usuario ya estuvo estudiando

Cuando otro chat explique código, puede apoyarse en estos conceptos, pero conviene repasarlos de forma concreta cuando vuelvan a aparecer:

- Diferencia entre entidad, request y response.
- Controller, Service y Repository.
- Inyección por constructor y atributos `final`.
- Implementaciones automáticas de `JpaRepository`.
- Métodos derivados a partir del nombre en Spring Data JPA.
- `Optional`, `orElseThrow`, lambdas y `Supplier`.
- `ResponseStatusException`.
- `@RequestBody`, `@RequestParam`, `@PathVariable` y `@AuthenticationPrincipal`.
- JSON, `Content-Type`, multipart/form-data y `MultipartFile`.
- JWT, OAuth2 Resource Server, encabezado `Authorization` y esquema `Bearer`.
- Claims `sub` y `email`.
- `@Entity`, `@Table`, `@Id`, `@Column`, `@GeneratedValue` y `@Enumerated`.
- `@OneToOne`, `@ManyToOne`, `@JoinColumn` y `@MapsId`.
- Diferencia entre `@OneToOne` y `@ManyToOne`: una conversación debe relacionarse uno a uno con una coincidencia porque `id_coincidencia` es único.
- Uso de `optional = false`, `nullable = false` y `unique = true` en las relaciones JPA.
- Claves primarias y foráneas.
- Uso de `existsBy...` para evitar coincidencias duplicadas.
- Funcionamiento de `continue` dentro de un `for` y por qué una lista sin elementos se devuelve como `[]`.
- Diferencia entre la entidad `Coincidencia` y `CoincidenciaResponse`.
- Orientación de los reportes como perdido y avistamiento, independientemente del reporte que inició la búsqueda.
- Cálculo del puntaje de coincidencia mediante características, distancia y fecha.
- Fórmula de Haversine para obtener la distancia aproximada entre coordenadas.
- Autorización por propiedad: comparar el `idUsuario` del JWT con el creador del reporte `PERDIDO` antes de confirmar o descartar.
- URL base, ruta del bucket y URL firmada.
- `RestClient` como cliente configurado para enviar peticiones desde el backend.
- `SafeAreaProvider` obtiene y comparte los bordes seguros del dispositivo; `useSafeAreaInsets()` lee esos valores desde los componentes ubicados dentro del provider.

El usuario prefiere que los flujos se expliquen recorriendo el código línea por línea y traduciendo cada condición o llamada a una oración sencilla.

### Sesión

Una **sesión** es la información que permite que una aplicación recuerde que un usuario ya inició sesión y pueda reconocerlo mientras utiliza la aplicación, sin tener que pedirle sus credenciales cada vez que realiza una acción.

### Automatic Batching

React puede agrupar varias actualizaciones de estado, como `setError()` y `setEnviando(false)`, y realizar un único renderizado con ambos valores actualizados. Esto se conoce como **Automatic Batching**. React 18 y versiones posteriores lo hacen automáticamente, incluso con actualizaciones que ocurren después de un `await` en entornos compatibles, como React Native moderno.

## 20. Regla principal para continuar

No asumir que una clase existente implica que el módulo está terminado. Antes de agregar código:

1. Revisar el estado real del repositorio.
2. Explicar el cambio pequeño que se realizará.
3. Implementarlo.
4. Compilar con Maven.
5. Explicar el flujo siguiendo el código.
6. Proponer una prueba concreta y esperar su resultado antes del siguiente cambio importante.
