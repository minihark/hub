import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadChangelog() {
  const jsonPath = path.resolve(__dirname, 'src/data/changelog.json');
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load changelog.json:', err.message);
    return [];
  }
}

export function getChangelog() {
  return loadChangelog();
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateRssXml() {
  const entries = loadChangelog();
  const now = new Date().toUTCString();

  const itemsXml = entries.map((entry) => {
    const pubDate = new Date(`${entry.date}T10:00:00Z`).toUTCString();
    const link = entry.appUrl;
    const permalink = `https://hub.apps.harkco.se/#changelog-${entry.id}`;

    const highlightsHtml = entry.highlights && entry.highlights.length > 0
      ? `<ul>${entry.highlights.map((h) => `<li>${escapeXml(h)}</li>`).join('')}</ul>`
      : '';

    const bodyHtml = `
      <p><strong>${escapeXml(entry.title)}</strong> (${escapeXml(entry.version)})</p>
      <p>${escapeXml(entry.summary)}</p>
      ${highlightsHtml}
      <p><a href="${link}">Öppna ${escapeXml(entry.appName)} i webbläsaren &rarr;</a></p>
    `.trim();

    return `    <item>
      <title>${escapeXml(entry.title)} [${escapeXml(entry.version)}]</title>
      <link>${link}</link>
      <guid isPermaLink="false">${permalink}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(entry.category)}</category>
      <author>studio@harkco.se (${escapeXml(entry.author)})</author>
      <description><![CDATA[${bodyHtml}]]></description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Harkco Atelier — App Releases &amp; Studio Changelog</title>
    <link>https://hub.apps.harkco.se</link>
    <description>Officiellt RSS-flöde för Harkco Daily Apps och mjukvarulabbet i Göteborg. Nya releaser, arkitektur-uppdateringar och milstolpar.</description>
    <language>sv-SE</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://hub.apps.harkco.se/feed.xml" rel="self" type="application/rss+xml"/>
    <copyright>Copyright (c) 2026 Harkco Software Lab</copyright>
    <webMaster>viktor@harkco.se (Viktor Holmqvist)</webMaster>
${itemsXml}
  </channel>
</rss>`.trim();
}
