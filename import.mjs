import * as XLSX from 'xlsx';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:5174/api';
const XLSX_PATH = process.argv[2];   // node import.mjs "C:\path\to\gun_sonu_destek_raporu.xlsx"

const EMAIL    = process.argv[3] || 'admin@issueflow.com';
const PASSWORD = process.argv[4] || '123456';
// ───────────────────────────────────────────────────────────────────────────

if (!XLSX_PATH) {
  console.error('Kullanım: node import.mjs "C:\\path\\to\\gun_sonu_destek_raporu.xlsx"');
  process.exit(1);
}

const api = axios.create({ baseURL: BASE_URL });

async function login() {
  const { data } = await api.post('/auth/login', { email: EMAIL, password: PASSWORD });
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  console.log(`✓ Giriş yapıldı: ${data.userName} (${data.role})`);
  return data;
}

async function getOrCreateHotel(name, hotelCache) {
  if (hotelCache.has(name)) return hotelCache.get(name);

  // Mevcut otelleri getir (ilk seferinde)
  if (hotelCache.size === 0) {
    const { data } = await api.get('/hotels');
    for (const h of data) hotelCache.set(h.name, h.id);
    if (hotelCache.has(name)) return hotelCache.get(name);
  }

  // Yoksa oluştur
  const { data } = await api.post('/hotels', { name, address: 'İçe Aktarma' });
  hotelCache.set(name, data.id);
  console.log(`  + Otel oluşturuldu: ${name}`);
  return data.id;
}

function determinePriority(notes) {
  const lower = (notes || '').toLowerCase();
  if (lower.includes('kritik') || lower.includes('critical') || lower.includes('acil')) return 'Critical';
  if (lower.includes('yavaş') || lower.includes('çöküş') || lower.includes('çalışmıyor')) return 'High';
  if (lower.includes('hata') || lower.includes('error')) return 'Medium';
  return 'Low';
}

function determineStatus(resolved) {
  if (resolved === true || resolved === 1 || resolved === '✓' || resolved === 'Evet') return 'Resolved';
  return 'New';
}

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') return XLSX.SSF.parse_date_code(val);
  const str = String(val).trim();
  // DD.MM.YYYY or DD/MM/YYYY
  const m = str.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (m) return new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`);
  return new Date(str);
}

async function main() {
  // 1. Login
  await login();

  // 2. Excel oku
  const wb = XLSX.readFile(XLSX_PATH);
  console.log(`\n📄 Sayfalar: ${wb.SheetNames.join(', ')}`);

  const hotelCache = new Map();
  let total = 0, errors = 0;

  // Destek raporu ana hoteli
  const defaultHotelId = await getOrCreateHotel('Genel Destek', hotelCache);

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    // Başlık satırını bul
    let headerRow = -1;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const row = rows[i];
      if (row.some(c => String(c).includes('Tarih') || String(c).includes('İlgili'))) {
        headerRow = i;
        break;
      }
    }
    if (headerRow < 0) continue;

    const headers = rows[headerRow].map(h => String(h).trim());
    const colIdx = {
      tarih:    headers.findIndex(h => h.includes('Tarih')),
      kisi:     headers.findIndex(h => h.includes('Kişi') || h.includes('Kisi')),
      notlar:   headers.findIndex(h => h.includes('Notlar') || h.includes('Not')),
      taskLink: headers.findIndex(h => h.includes('Task') || h.includes('Link')),
      cozuldu:  headers.findIndex(h => h.includes('Çözüldü') || h.includes('Cozuldu')),
    };

    console.log(`\n📋 Sayfa: ${sheetName} (${rows.length - headerRow - 1} satır)`);

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      const tarih   = row[colIdx.tarih]   || '';
      const kisi    = row[colIdx.kisi]    || '';
      const notlar  = row[colIdx.notlar]  || '';
      const taskLnk = row[colIdx.taskLink]|| '';
      const cozuldu = row[colIdx.cozuldu] || '';

      if (!notlar && !tarih) continue;  // Boş satır

      const dateStr = tarih ? String(tarih).trim() : '';
      const person  = kisi  ? String(kisi).trim()  : 'Bilinmiyor';
      const notes   = notlar? String(notlar).trim() : '';
      const link    = taskLnk? String(taskLnk).trim(): '';

      if (!notes || notes.length < 5) continue;

      // Başlık oluştur
      const title = `${dateStr ? dateStr + ' | ' : ''}${person} - Günlük Destek`;

      // Açıklama
      const description = link
        ? `${notes}\n\nTask/Link: ${link}`
        : notes;

      const priority = determinePriority(notes);
      const status   = determineStatus(cozuldu);

      try {
        await api.post('/issues', {
          title,
          description,
          hotelId: defaultHotelId,
          priority,
          status,          // backend bunu CreateIssueCommand'a henüz desteklemiyor, atlanır
        });
        total++;
        if (total % 10 === 0) process.stdout.write(`\r  → ${total} issue oluşturuldu...`);
      } catch (err) {
        errors++;
        if (errors <= 3) console.error(`\n  ✗ Hata (satır ${i}): ${err.response?.data || err.message}`);
      }
    }
  }

  console.log(`\n\n✅ Tamamlandı: ${total} issue oluşturuldu, ${errors} hata`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
