@echo off
cd /d "C:\Users\lalit\career-ops"
echo. >> "logs\scan-log.txt"
echo ===== %DATE% %TIME% ===== >> "logs\scan-log.txt"
"C:\Program Files\nodejs\node.exe" scan.mjs >> "logs\scan-log.txt" 2>&1
