#!/usr/bin/env bash
# Escenario de estrés: sube de 20 en 20 usuarios hasta MAX (default 200).
# Detenerse manualmente cuando el % de error o la latencia se disparen.
MAX=${1:-200}
for U in $(seq 20 20 $MAX); do
  echo "=== Estrés: $U usuarios ==="
  ./scripts/run_jmeter.sh estres_$U $U 60 10
  sleep 15   # enfriamiento entre pruebas
done
