# GbR Steuerrücklagen-Rechner

Ein Tool zur Berechnung der notwendigen Steuerrücklagen für GbR-Partner basierend auf ihren individuellen steuerlichen Situationen.

## Features

- Eingabe der persönlichen Einkommensdaten für beide Partner
- Konfiguration der GbR-Gewinnprognose und Gewinnverteilung
- Automatische Berechnung der progressiven Steuersätze
- Berechnung der individuellen Steuerrücklagen pro Partner
- Automatisches Speichern der Eingaben im Browser
- Responsive Design für alle Geräte

## Technologien

- Next.js
- React
- TypeScript
- Tailwind CSS

## Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Projektstruktur

- `src/app/components/` - React-Komponenten
- `src/app/utils/` - Utility-Funktionen für Steuerberechnungen
- `src/app/types/` - TypeScript-Typdefinitionen

## Steuerliche Hinweise

Die Berechnung basiert auf einer vereinfachten Darstellung des deutschen Einkommensteuergesetzes und dient als Richtwert. Für eine genaue steuerliche Beratung wenden Sie sich bitte an einen Steuerberater.
