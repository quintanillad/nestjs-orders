#!/usr/bin/env bash
# Guarda docker stats cada 2 s en CSV mientras corre la prueba.
# Uso: ./scripts/monitor.sh <nombre>   (Ctrl+C para detener)
NAME=${1:?nombre}
mkdir -p results/$NAME
echo "time,container,cpu,mem" > results/$NAME/docker_stats.csv
while true; do
  docker stats --no-stream --format "$(date +%T),{{.Name}},{{.CPUPerc}},{{.MemUsage}}" api-orders db-orders >> results/$NAME/docker_stats.csv
  sleep 2
done
