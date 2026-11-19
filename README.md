# Taller Benchmarking de APIs - NestJS + PostgreSQL

## 1. Levantar el entorno
```bash
docker compose up -d --build
docker ps
```

## 2. Probar el endpoint
```bash
curl -i -X POST http://localhost:5001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"C123","items":[{"productId":"P1","quantity":2,"price":10.5},{"productId":"P2","quantity":1,"price":5.0}]}'
```
Respuesta esperada (201):
```json
{"orderId":"ORD-...","customerId":"C123","totalAmount":26,"itemsCount":2,"processedAt":"2026-..."}
```
Verificar en BD:
```bash
docker exec -it db-orders psql -U postgres -d orders_db -c "SELECT * FROM orders LIMIT 5;"
docker exec -it db-orders psql -U postgres -d orders_db -c "SELECT * FROM order_items LIMIT 5;"
```

## 3. JMeter
GUI: abrir `jmeter/orders-test-plan.jmx` (solo para capturas, con pocos usuarios).
CLI (recomendado para medir): 
```bash
./scripts/monitor.sh baja &        # en otra terminal: htop
./scripts/run_jmeter.sh baja 10
./scripts/run_jmeter.sh media 50
./scripts/run_jmeter.sh alta 100
./scripts/run_stress.sh 200
```
