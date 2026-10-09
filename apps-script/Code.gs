/**
 * ==========================================================================
 * BACKEND DU MUR DE MOTS (Google Apps Script)
 * Reçoit les mots des invités, les enregistre dans le Google Sheet,
 * et ne les renvoie qu'à celui qui fournit le bon mot de passe.
 *
 * Le mot de passe N'EST PAS dans ce fichier : il est stocké dans
 * Paramètres du projet > Propriétés du script > clé "UNLOCK_PASSWORD".
 * ==========================================================================
 */

const SHEET_NAME = 'Mots';
const MAX_AUTHOR = 60;
const MAX_MSG = 1000;

// Anti force brute : au-delà de MAX_FAILS échecs en LOCK_SECONDS, tout essai est refusé
const MAX_FAILS = 10;
const LOCK_SECONDS = 15 * 60;

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_request' });
  }

  if (data.action === 'add') return addEntry(data);
  if (data.action === 'read') return readEntries(data);
  return json({ ok: false, error: 'unknown_action' });
}

function addEntry(data) {
  const author = clean(data.author, MAX_AUTHOR);
  const msg = clean(data.msg, MAX_MSG);
  if (!author || !msg) return json({ ok: false, error: 'missing_fields' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet().appendRow([new Date(), safeCell(author), safeCell(msg)]);
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

function readEntries(data) {
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('fails') || 0);
  if (fails >= MAX_FAILS) return json({ ok: false, error: 'locked' });

  const expected = PropertiesService.getScriptProperties().getProperty('UNLOCK_PASSWORD');
  if (!expected || String(data.password || '') !== expected) {
    cache.put('fails', String(fails + 1), LOCK_SECONDS);
    Utilities.sleep(1000);
    return json({ ok: false, error: 'wrong_password' });
  }

  const rows = getSheet().getDataRange().getValues().slice(1);
  const entries = rows
    .filter((r) => r[1] && r[2])
    .map((r) => ({
      author: String(r[1]),
      msg: String(r[2]),
      date: r[0] instanceof Date ? r[0].toISOString() : String(r[0])
    }))
    .reverse();

  return json({ ok: true, entries });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Prénom', 'Message']);
  }
  return sheet;
}

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

// Empêche qu'un message commençant par = + - @ soit interprété comme une formule
function safeCell(str) {
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
