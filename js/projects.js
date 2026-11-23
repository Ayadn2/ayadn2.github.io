/**
 * Portfolio – projects.js
 * Etappe 2: Projekte live über die GitHub-API laden und als Karten anzeigen.
 *
 * Ablauf:
 *   1. Ladezustand anzeigen
 *   2. Eigene Repos UND ausgewählte Repos, an denen ich mitarbeite,
 *      parallel von der GitHub-REST-API holen (Promise.all)
 *   3. Beide Quellen kombinieren und aufbereiten
 *   4. Für jedes Repo eine Karte ins DOM einfügen
 *   5. Bei Fehlern eine Meldung mit "Erneut versuchen" anzeigen
 */

const GITHUB_USER = 'Ayadn2';
const API_BASE = 'https://api.github.com';

// Repos anderer Organisationen, an denen ich mitarbeite (Format: "owner/name")
const CONTRIBUTIONS = ['digital-sustainability/module-eoss-hs26-sandbox'];

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('project-list');
  if (list) loadProjects(list);
});

/* ---------- Daten laden ---------- */
async function loadProjects(list) {
  showLoading(list);

  try {
    // Beide Abfragen laufen gleichzeitig, nicht nacheinander
    const [ownRepos, contributions] = await Promise.all([
      fetchJson(`${API_BASE}/users/${GITHUB_USER}/repos?sort=updated&per_page=100`),
      fetchContributions(),
    ]);

    renderProjects(list, prepareRepos(ownRepos, contributions));
  } catch (error) {
    console.error('Projekte konnten nicht geladen werden:', error);
    showError(list);
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  // fetch() wirft bei 404/403 keinen Fehler – darum selbst prüfen
  if (!response.ok) {
    throw new Error(`GitHub-API antwortet mit Status ${response.status} (${url})`);
  }
  return response.json();
}

// Fehlt ein Fremd-Repo (z. B. privat geworden), wird nur dieses übersprungen
async function fetchContributions() {
  const results = await Promise.allSettled(
    CONTRIBUTIONS.map((fullName) => fetchJson(`${API_BASE}/repos/${fullName}`))
  );
  return results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}

/* ---------- Daten kombinieren und aufbereiten ---------- */
function prepareRepos(ownRepos, contributions) {
  const own = ownRepos
    .filter((repo) => !repo.fork && !repo.archived)
    .map((repo) => toProject(repo, false));

  const contributed = contributions.map((repo) => toProject(repo, true));

  // Zusammenführen und nach letzter Aktivität sortieren (neueste zuerst)
  return [...own, ...contributed].sort((a, b) => b.updated - a.updated);
}

function toProject(repo, isContribution) {
  return {
    name: repo.name,
    description: repo.description || 'Keine Beschreibung vorhanden.',
    language: repo.language,
    stars: repo.stargazers_count,
    updated: new Date(repo.pushed_at),
    url: repo.html_url,
    homepage: repo.homepage,
    owner: repo.owner.login,
    isContribution,
  };
}

/* ---------- Darstellung ---------- */
function renderProjects(list, projects) {
  list.replaceChildren(); // alten Inhalt (Ladezustand) entfernen
  list.setAttribute('aria-busy', 'false');

  if (projects.length === 0) {
    list.append(createMessage('Noch keine öffentlichen Projekte vorhanden.'));
    return;
  }

  projects.forEach((project) => list.append(createProjectCard(project)));
}

function createProjectCard(project) {
  const card = createElement('article', 'card project');

  const title = createElement('h3', 'card__title', formatName(project.name));
  const description = createElement('p', '', project.description);

  const meta = createElement('ul', 'tags');
  if (project.isContribution) {
    meta.append(createElement('li', 'tag tag--accent', `Mitarbeit · ${project.owner}`));
  }
  if (project.language) meta.append(createElement('li', 'tag', project.language));
  meta.append(createElement('li', 'tag tag--muted', `Aktualisiert ${formatDate(project.updated)}`));
  if (project.stars > 0) meta.append(createElement('li', 'tag tag--muted', `★ ${project.stars}`));

  const links = createElement('div', 'project__links');
  links.append(createLink(project.url, 'Code ansehen'));
  if (project.homepage) links.append(createLink(project.homepage, 'Live-Seite'));

  card.append(title, description, meta, links);
  return card;
}

function showLoading(list) {
  list.setAttribute('aria-busy', 'true');
  list.replaceChildren();
  // Drei Platzhalter-Karten ("Skeleton") während des Ladens
  for (let i = 0; i < 3; i++) {
    list.append(createElement('div', 'card project project--skeleton'));
  }
}

function showError(list) {
  list.setAttribute('aria-busy', 'false');
  list.replaceChildren();

  const message = createMessage('Die Projekte konnten gerade nicht von GitHub geladen werden.');
  const retry = createElement('button', 'btn btn--ghost', 'Erneut versuchen');
  retry.type = 'button';
  retry.addEventListener('click', () => loadProjects(list));
  message.append(retry);

  list.append(message);
}

/* ---------- Hilfsfunktionen ---------- */

// Elemente mit textContent erzeugen: sicher, weil Text nie als HTML interpretiert wird
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createLink(href, text) {
  const link = createElement('a', 'project__link', text);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener';
  return link;
}

function createMessage(text) {
  const box = createElement('div', 'card project project--placeholder');
  box.append(createElement('p', '', text));
  return box;
}

// "mein-cooles_projekt" -> "Mein cooles projekt", "*.github.io" -> "Portfolio-Webseite"
function formatName(name) {
  if (name.toLowerCase().endsWith('.github.io')) return 'Portfolio-Webseite';
  const text = name.replace(/[-_]/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const dateFormatter = new Intl.DateTimeFormat('de-CH', { month: 'short', year: 'numeric' });

function formatDate(date) {
  return dateFormatter.format(date);
}
