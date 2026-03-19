# AbiturSN – Produktions-Deployment

## Voraussetzungen
- Node.js 18+
- MongoDB 6+
- npm oder yarn

## Installation

```bash
# Dependencies installieren
npm install

# Umgebungsvariablen setzen
cp .env.example .env
# .env bearbeiten mit deinen Werten

# MongoDB starten
mongod

# Server starten
npm run dev

# Frontend (separat)
npm run client