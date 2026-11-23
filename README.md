# Portfolio – Nivethan Ayadurai

Persönliche Portfolio-Seite, entstanden als Einzelarbeit im Modul **Web Engineering (BFH)**.

## Technologien
- HTML5 (semantische Struktur, Barrierefreiheit)
- CSS3 (Custom Properties, Flexbox, Grid, Media Queries, helles/dunkles Theme)
- JavaScript (ES6+, ohne Framework)

## Struktur
```
index.html
css/style.css
js/main.js       Navigation, Theme, aktiver Menüpunkt
js/projects.js   Projekte über die GitHub-API
```

## Lokal starten
Mit der Live-Server-Erweiterung in VS Code oder im Terminal:
```
npx http-serve
```

## Roadmap
- [x] Grundgerüst, responsive Navigation, Theme-Toggle
- [x] Persönliche Inhalte und Werdegang als Zeitleiste
- [x] Projekte dynamisch über die GitHub-API laden (eigene Repos + Mitarbeit kombiniert)
- [ ] Caching, Filter und Pagination
- [ ] Skill-Diagramm (Chart.js)
- [ ] Kontaktformular mit Validierung
