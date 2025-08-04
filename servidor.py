#!/usr/bin/env python3
import http.server
import ssl
import socketserver
import os

# Cambiar al directorio del archivo
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8443
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    # Crear certificado temporal para desarrollo
    context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    
    # Generar certificado autofirmado temporal
    try:
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        print(f"Servidor ejecutándose en https://localhost:{PORT}")
        print("IMPORTANTE: Acepta el certificado autofirmado en tu navegador")
        print("En móvil: usa la IP de tu PC (ej: https://192.168.1.100:8443)")
        httpd.serve_forever()
    except Exception as e:
        print(f"Error al crear HTTPS: {e}")
        print("Ejecutando en HTTP (no funcionará la cámara en móvil):")
        print(f"http://localhost:{PORT}")
        httpd.serve_forever()