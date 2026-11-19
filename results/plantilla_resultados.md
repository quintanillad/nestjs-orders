# Resultados individuales - NestJS (Node.js)

Stack: Node.js + NestJS, PostgreSQL 16, ambos en Docker. Herramienta de carga: JMeter (GUI).
Cada prueba: 60 s, ramp-up 5 s, sin tiempo de espera entre peticiones.

## Métricas por escenario

| Escenario | Usuarios | Muestras | Avg (ms) | P95 (ms) | Throughput (req/s) | % Error | Observaciones |
|---|---|---|---|---|---|---|---|
| Baja  | 10  | 30.372 | 18  | 36  | 506,1 | 0 % | Estable; la API ya trabaja cerca de un núcleo completo |
| Media | 50  | 32.126 | 89  | 172 | 535,2 | 0 % | Latencia 5 veces mayor que en baja; throughput casi igual |
| Alta  | 100 | 34.431 | 167 | 289 | 571,0 | 0 % | Máximo throughput de las cuatro pruebas; máx. 711 ms |
| Estrés | 160 | 33.565 | 277 | 442 | 543,1 | 0 % | Sin errores; latencia 15 veces la de baja y máx. 1.808 ms |

### Distribución de la latencia (ms)

| Escenario | Mediana | P90 | P95 | P99 | Mínimo | Máximo |
|---|---|---|---|---|---|---|
| Baja (10)    | 16  | 29  | 36  | 53  | 4  | 199   |
| Media (50)   | 76  | 130 | 172 | 277 | 19 | 469   |
| Alta (100)   | 146 | 237 | 289 | 401 | 5  | 711   |
| Estrés (160) | 250 | 367 | 442 | 582 | 12 | 1.808 |

## Consumo del sistema (docker stats)

CPU por núcleo (100 % = 1 núcleo). Se indica el rango observado durante la prueba y, entre paréntesis, el valor de la captura.

| Escenario | CPU API (%) | RAM API (MiB) | CPU DB (%) | RAM DB (MiB) | Observaciones |
|---|---|---|---|---|---|
| Baja (10)    | 85–95 (pico 92,8) | 65,7 | 50–65 (pico 65,0) | 65,0 | Sin errores |
| Media (50)   | 103,0 (captura) | 76,0 | 64,4 (captura) | 80,0 | Sin errores; rango no medido |
| Alta (100)   | 115–120 al inicio, luego 87–90 (captura 114,3) | 73,6 | 48–50 al inicio, luego 20–30 (captura 47,7) | 95,5 | Sin errores |
| Estrés (160) | 115–120 al inicio, luego 87–90 (captura 118,9) | 70,9 | 48–50 al inicio, luego 20–30 (captura 48,2) | 96,9 | Sin errores; latencia máx. 1.808 ms |

## Verificación de datos

| Escenario | Muestras JMeter | Pedidos en BD (orders) | Items en BD (order_items) |
|---|---|---|---|
| Baja (10)    | 30.372 | 30.372 | 60.744 |
| Media (50)   | 32.126 | 32.126 | 64.252 |
| Alta (100)   | 34.431 | 34.431 | 68.862 |
| Estrés (160) | 33.565 | 33.565 | 67.130 |

Con 0 % de error, cada muestra exitosa coincide con un pedido guardado y 2 items por pedido.

## Observaciones personales

- **Saturación:** el throughput apenas pasó de 506 a 571 req/s al multiplicar por 10 los usuarios, y la latencia creció casi en proporción (usuarios ÷ throughput: 160/543 ≈ 295 ms, medido 277 ms).
- **Cuello de botella en la API:** su CPU superó el 100 % (hasta ~119 %). Docker mide por núcleo y Node usa hilos extra (recolector de basura, driver de Postgres), pero el código JavaScript corre en un solo hilo.
- **La base de datos tuvo margen:** CPU de 48–65 % (20–30 % tras los primeros segundos en alta y estrés) mientras la API estaba al límite. RAM de ambos contenedores bajo 100 MiB.
- **Estrés:** a 160 usuarios no hubo errores ni timeouts, solo degradación de latencia. El throughput bajó 5 % frente a alta (571 a 543 req/s), señal de saturación.
- **Causa probable (hipótesis, no medida):** hilo único de Node, validación del JSON con class-validator y 4 consultas a Postgres por petición (BEGIN, 2 INSERT, COMMIT).

## Evidencias

- [✔] Summary Report (captura) por escenario
- [✔] Aggregate Report (captura) por escenario
- [✔] JMeter durante la carga (con el contador de hilos activo, ej. 100/100)
- [✔] `docker ps`
- [✔] `htop` (o Administrador de tareas) + `docker stats` por cada prueba

## Pendientes

- Estrés: solo se probó 160 usuarios. Si se pide la escalera de 20 en 20, faltan 120, 140, 180 y siguientes hasta que aparezcan errores o timeouts.
- Confirmar si el descenso de CPU de la BD (20–30 %) ocurrió durante la prueba o después de que JMeter terminó.
- Comparar con los otros tres stacks para las conclusiones del grupo.
