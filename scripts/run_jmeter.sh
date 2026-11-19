#!/usr/bin/env bash
# Uso: ./scripts/run_jmeter.sh <nombre> <usuarios> [duracion_seg] [rampup_seg]
# Ej:  ./scripts/run_jmeter.sh baja 10
set -e
NAME=${1:?nombre}; THREADS=${2:?usuarios}; DUR=${3:-60}; RAMP=${4:-5}
OUT=results/$NAME
rm -rf "$OUT" && mkdir -p "$OUT"
jmeter -n -t jmeter/orders-test-plan.jmx \
  -Jthreads=$THREADS -Jduration=$DUR -Jrampup=$RAMP \
  -l "$OUT/resultados.jtl" -e -o "$OUT/dashboard"
echo "Listo -> $OUT/dashboard/index.html (Statistics: Average, 95th pct, Throughput, Error %)"
