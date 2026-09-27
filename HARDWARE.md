# Benchmark-Hardware

## Referenzsystem

Sofern ein Benchmark-Run nicht ausdrücklich eine andere Maschine dokumentiert, gelten für lokale MLX/oMLX-Runs folgende Hardwaredaten:

- **Gerät:** MacBook Pro 14" (2021)
- **SoC:** Apple M1 Max
- **GPU:** 24-Core GPU
- **Unified Memory:** 64 GB
- **Speicherbandbreite:** 400 GB/s

## Vergleich mit externen Benchmarks

Externe Benchmarks auf einem M1 Max mit **32-Core GPU** sind nicht 1:1 mit den eigenen Messungen vergleichbar. Solche Werte werden nur als Referenz herangezogen; für direkte Performancevergleiche müssen GPU-Ausbau, RAM-Konfiguration, Runtime, Modell/Quantisierung, Kontextlänge und Beschleunigungsoptionen berücksichtigt werden.

## Run-spezifische Abweichungen

Falls ein Run auf anderer Hardware ausgeführt wird, muss die abweichende Hardware beim jeweiligen Run dokumentiert werden. Run-spezifische Angaben haben Vorrang vor dieser Referenzdefinition.
