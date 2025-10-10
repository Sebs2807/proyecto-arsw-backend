# Crear carpeta "certs" si no existe
if (-not (Test-Path "certs")) {
    Write-Host "Creando carpeta 'certs'..."
    New-Item -ItemType Directory -Path "certs" | Out-Null
}

Set-Location "certs"

if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
    Write-Host "mkcert no está instalado. Instálalo con 'choco install mkcert' o 'scoop install mkcert'."
    exit 1
}

if (-not ((Test-Path "synapse+1-key.pem") -and (Test-Path "synapse+1.pem"))) {
    Write-Host "Generando certificados para synapse y localhost..."
    mkcert synapse localhost
} else {
    Write-Host "Certificados ya existen, omitiendo generación."
}

Set-Location ..

Write-Host "Proceso completado. Certificados listos en la carpeta 'certs'."
