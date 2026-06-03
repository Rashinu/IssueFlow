const XLSX  = require('xlsx');
const axios = require('axios').default;

const BASE_URL = 'http://localhost:5174/api';
const XLSX_PATH = process.argv[2];
const EMAIL    = process.argv[3] || 'admin@issueflow.com';
const PASSWORD = process.argv[4] || '123456';

if (!XLSX_PATH) {
  console.error('Kullanım: node import.cjs "C:\\path\\to\\gun_sonu_destek_raporu.xlsx"');
  process.exit(1);
}

const api = axios.create({ baseURL: BASE_URL });

// ─── HELPERS ───────────────────────────────────────────────────────────────

async function login() {
  const { data } = await api.post('/auth/login', { email: EMAIL, password: PASSWORD });
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  console.log(`✓ Giriş: ${data.userName} (${data.role})`);
}

async function fetchHotels(hotelCache) {
  const { data } = await api.get('/hotels');
  for (const h of data) hotelCache.set(normalizeHotelName(h.name), h.id);
  console.log(`  Mevcut ${data.length} otel yüklendi`);
}

async function getOrCreateHotel(rawName, hotelCache) {
  const key = normalizeHotelName(rawName);
  if (hotelCache.has(key)) return hotelCache.get(key);
  const { data } = await api.post('/hotels', { name: rawName, address: 'İçe Aktarma' });
  const id = data.id ?? data;
  hotelCache.set(key, id);
  return id;
}

async function fetchUsers(userCache) {
  try {
    const { data } = await api.get('/users');
    for (const u of data) userCache.set(normalizeName(u.name), u.id);
    console.log(`  Mevcut ${data.length} kullanıcı yüklendi`);
  } catch (_) { /* users endpoint admin-only, skip if forbidden */ }
}

function normalizeHotelName(name) {
  return name.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[()[\]]/g, '')
    .trim();
}

function normalizeName(name) {
  return name.toLowerCase().trim();
}

function determinePriority(text) {
  const t = text.toLowerCase();
  if (t.includes('kritik') || t.includes('acil') || t.includes('genel sorun') || t.includes('çökmüş')) return 'Critical';
  if (t.includes('çalışmıyor') || t.includes('erişilemiyor') || t.includes('bağlanamıyor') ||
      t.includes('yavaşlık') || t.includes('kesinti')) return 'High';
  if (t.includes('hata') || t.includes('error') || t.includes('sorun') || t.includes('problem')) return 'Medium';
  return 'Low';
}

function determineStatus(text, resolvedCell) {
  // Çözülmüş işareti excel'de checkmark (boolean) veya metin olabilir
  const resolved = String(resolvedCell || '').trim();
  const isChecked = resolved === '1' || resolved === 'TRUE' || resolved.toLowerCase() === 'evet';
  if (isChecked) return 'Resolved';

  const t = text.toLowerCase();
  if (t.includes('sorun çözüldü') || t.includes('düzeldi') || t.includes('(ok)') ||
      t.includes('çözüme kavuşturuldu') || t.includes('çözüldü')) return 'Resolved';
  if (t.includes('bekleniyor') || t.includes('inceleniyor') || t.includes('takip')) return 'Investigating';
  return 'New';
}

/**
 * Notlar alanındaki metni satır bazlı parse eder.
 * Pattern: "OtelAdı: açıklama" veya "OtelAdı (Sistem): açıklama"
 * Her otel bloğu ayrı bir entry döndürür: { hotel, description }
 */
function parseHotelEntries(notes) {
  if (!notes || notes.length < 5) return [];

  // Otel adı pattern: 2-60 karakter arası, harf/rakam/boşluk/özel karakter, ardından ":"
  // Satır başında veya paragraf başında
  const lines = notes.split(/\n/);
  const entries = [];
  let currentHotel = null;
  let currentLines = [];

  const hotelLineRe = /^([A-ZÇĞİÖŞÜa-zçğışöü][^:\n]{1,60}):\s*(.*)$/;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const m = line.match(hotelLineRe);
    if (m) {
      // Kaydet öncekini
      if (currentHotel && currentLines.length > 0) {
        entries.push({ hotel: currentHotel, description: currentLines.join('\n').trim() });
      }
      currentHotel  = m[1].trim();
      currentLines  = m[2] ? [m[2].trim()] : [];
    } else {
      // Devam satırı
      if (currentHotel) currentLines.push(line);
    }
  }

  // Son entry
  if (currentHotel && currentLines.length > 0) {
    entries.push({ hotel: currentHotel, description: currentLines.join('\n').trim() });
  }

  // Geçersiz "otel isimleri" filtrele: çok uzun, sadece sayı, vb.
  return entries.filter(e =>
    e.hotel.length >= 2 &&
    e.hotel.length <= 70 &&
    e.description.length >= 5 &&
    !/^\d+$/.test(e.hotel)   // tamamen rakam değil
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  await login();

  const wb = XLSX.readFile(XLSX_PATH);

  const hotelCache = new Map();
  const userCache  = new Map();

  await fetchHotels(hotelCache);
  await fetchUsers(userCache);

  // Veri sayfaları (ay isimleri)
  const months = ['Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık','Ocak','Şubat'];
  const sheets = wb.SheetNames.filter(n => months.some(m => n.includes(m)));
  const targetSheets = sheets.length ? sheets : wb.SheetNames;

  console.log(`\n📄 Sayfalar: ${targetSheets.join(', ')}\n`);

  let total = 0, errors = 0, skipped = 0;

  for (const sheetName of targetSheets) {
    const ws   = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    // Başlık satırını bul
    let headerRow = -1;
    for (let i = 0; i < Math.min(rows.length, 8); i++) {
      if (rows[i].some(c => String(c).includes('Tarih'))) { headerRow = i; break; }
    }
    if (headerRow < 0) { console.log(`  ⚠ ${sheetName}: başlık yok`); continue; }

    const headers = rows[headerRow].map(h => String(h).trim());
    const col = {
      tarih:   headers.findIndex(h => h === 'Tarih'),
      kisi:    headers.findIndex(h => h.includes('Kişi') || h.includes('Kisi')),
      notlar:  headers.findIndex(h => h === 'Notlar'),
      link:    headers.findIndex(h => h.includes('Task') || h.includes('Link')),
      cozuldu: headers.findIndex(h => h.includes('züldü') || h.includes('zuldu')),
    };

    let sheetCount = 0;
    let fallbackHotelId = null; // "Genel Destek {sheetName}" per sheet

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row    = rows[i];
      const tarih  = String(row[col.tarih]   || '').trim();
      const kisi   = String(row[col.kisi]    || '').trim();
      const notlar = String(row[col.notlar]  || '').trim();
      const link   = String(row[col.link]    || '').trim();
      const coz    = row[col.cozuldu];

      if (!notlar || notlar.length < 10) { skipped++; continue; }

      const entries = parseHotelEntries(notlar);

      if (entries.length === 0) {
        // Parse edilemeyen satırlar: fallback otel ile tek issue
        skipped++;
        continue;
      }

      // Assigned user bul
      const assignedUserId = kisi ? (userCache.get(normalizeName(kisi)) || null) : null;

      for (const entry of entries) {
        try {
          const hotelId = await getOrCreateHotel(entry.hotel, hotelCache);

          const fullDesc = [
            entry.description,
            link ? `\n📎 Task: ${link}` : '',
            kisi ? `\n👤 Destek: ${kisi}` : '',
            tarih ? `\n📅 Tarih: ${tarih}` : '',
          ].filter(Boolean).join('');

          const priority = determinePriority(entry.description);
          const status   = determineStatus(entry.description, coz);

          // Title: ilk cümle max 120 karakter
          const firstSentence = entry.description.split(/[.!?\n]/)[0].trim();
          const title = firstSentence.length > 5
            ? firstSentence.substring(0, 120)
            : `${entry.hotel} - Destek`;

          await api.post('/issues', {
            title,
            description: fullDesc,
            hotelId,
            priority,
            assignedUserId,
          });

          total++;
          sheetCount++;
          if (total % 10 === 0) process.stdout.write(`\r  → ${total} issue...`);
        } catch (err) {
          errors++;
          if (errors <= 5) {
            console.error(`\n  ✗ [${entry.hotel}]: ${JSON.stringify(err.response?.data || err.message)}`);
          }
        }
      }
    }

    console.log(`\n  ✓ ${sheetName}: ${sheetCount} issue`);
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`✅ TAMAMLANDI`);
  console.log(`   Oluşturulan : ${total}`);
  console.log(`   Atlanan     : ${skipped}`);
  console.log(`   Hata        : ${errors}`);
  console.log(`   Toplam otel : ${hotelCache.size}`);
}

main().catch(err => { console.error('\nFatal:', err.message); process.exit(1); });
