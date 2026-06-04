# IssueFlow — Kurumsal Dönüşüm Yol Haritası

## Mevcut Durum Analizi

Uygulama şu an temel bir CRUD sistemi. Veri girilebiliyor, listelenebiliyor — ama bir destek yöneticisinin günlük kararlarını verebilmesi için gereken **bağlam, görünürlük ve iş akışı** eksik.

---

## 1. Dashboard — Anlamsız Sayılardan Anlamlı Görünüme

### Şu an
- 4 sayaç (Toplam / Açık / Çözüldü / Kritik)
- Son issue'ların düz listesi
- Otel veya kişi bazında hiçbir şey yok

### Olması gereken

#### Üst Bant — Günlük Özet
| Kart | İçerik |
|------|--------|
| Bugün açılan | Kaç yeni issue geldi |
| Bu hafta çözülen | Kaç issue kapatıldı |
| SLA riski | 3+ gündür çözülemeyen issue sayısı |
| En yoğun otel | Bu hafta en çok issue gelen otel |

#### Orta Alan — Grafikler
- **Haftalık trend** — son 7 günde açılan vs. çözülen (çizgi grafik)
- **Otel bazlı dağılım** — hangi otel bu ay kaç issue üretmiş (bar veya pasta)
- **Durum dağılımı** — New / Investigating / Resolved oranları (halka grafik)
- **Öncelik dağılımı** — Critical / High / Medium / Low breakdown

#### Alt Alan — Aksiyon Gerektiren Liste
- 48 saatten fazla süredir açık issue'lar (kırmızı)
- Bugün atanan ama henüz işleme alınmamış issue'lar
- SLA'yı geçmiş issue'lar

---

## 2. Issue Formu — Kurumsal Kayıt Standartı

### Şu an
- Başlık, Açıklama, Otel, Öncelik

### Olması gereken
- **Kategori** — Teknik / Yazılım / Donanım / Kullanıcı Hatası / Talep
- **Etki Düzeyi** — Kaç kullanıcı/oda etkilendi
- **İlk Tespit** — Kim fark etti (sistem mi, otel mi, müşteri mi)
- **Kaynak** — Email / Telefon / Sistem Uyarısı / Excel İmport
- **Hedef Çözüm Tarihi (SLA)** — Önceliğe göre otomatik hesaplansın
  - Critical → 4 saat
  - High → 24 saat
  - Medium → 72 saat
  - Low → 1 hafta
- **İlişkili Issue** — Daha önce aynı sorun yaşandı mı (bağlantı)
- **Etiketler (Tags)** — Arama ve filtreleme için serbest etiket

---

## 3. Kullanıcı — Otel Eşleştirmesi

### Şu an
- Kullanıcı sisteme giriyor, tüm issue'ları görüyor
- Kim hangi otele bakıyor belli değil

### Olması gereken
- Her kullanıcıya bir veya birden fazla otel atanabilmeli
- Kullanıcı girişi yaptığında sadece kendi otellerinin issue'larını görmeli (veya tümünü görme yetkisi Admin'de olsun)
- **Rol bazlı erişim:**
  - `Admin` → Her şeyi görür, kullanıcı ve otel yönetir
  - `Manager` → Tüm otelleri görür, raporlara erişir
  - `Support` → Sadece atandığı otelleri görür
  - `ReadOnly` → Sadece okuyabilir, düzenleyemez

---

## 4. Otel Detay Sayfası

### Şu an
- Otel kartına tıklayınca hiçbir şey olmuyor

### Olması gereken
Her otel kartı bir detay sayfasına açılmalı:
- **Bu aya ait issue özeti** (açılan / çözülen / bekleyen)
- **Açık issue'ların listesi** (filtrelenmiş kanban veya tablo)
- **Otel bazlı trend grafiği** — son 3 ayın özeti
- **Sorumlu kişi** — bu otele atanmış destek personeli kimler
- **SLA performansı** — zamanında çözülen issue oranı

---

## 5. Raporlar — Gerçek Analizler

### Şu an
- Günlük / Haftalık / Aylık dönem seçimi var
- Sayılar var ama grafik yok, export yok

### Olması gereken
- **Görsel grafik** her rapor periyodu için (Recharts veya Chart.js)
- **Karşılaştırmalı görünüm** — "Bu ay vs. Geçen ay"
- **Personel performans raporu** — Kim kaç issue kapattı, ortalama çözüm süresi
- **Otel SLA raporu** — Hangi otel kaç kez SLA'yı aştı
- **Excel / PDF export** — Yöneticiye gönderilebilir format
- **Otomatik haftalık rapor** — Email ile (ilerleyen fazda)

---

## 6. Bildirim & Uyarı Sistemi

### Şu an
- Hiç bildirim yok

### Olması gereken
- **In-app bildirim** — "Sana yeni bir issue atandı"
- **Badge uyarısı** — Kanban kartında "⚠️ 48 saat" rozeti
- **SLA uyarısı** — Deadline yaklaşan issue'lar listesi
- **Email bildirimi** (ilerleyen fazda, SMTP kurulumu gerekir)

---

## 7. Issue Detay Sayfası — Zenginleştirme

### Şu an
- Başlık, açıklama, durum, yorum

### Olması gereken
- **Değişiklik Geçmişi sekmesi** (IssueHistory zaten backend'de var)
- **Dosya ekleri** (IssueAttachment entity mevcut, UI yok)
- **Durum timeline'ı** — "10:23 - Yeni → İnceleniyor (Ahmet K.)"
- **Çözüm özeti alanı** — Issue kapatılırken ne yapıldığı yazılsın
- **İlgili issue'lar** — Aynı otelin benzer sorunları

---

## Öncelik Sırası (Önerilen)

| Faz | Kapsam | Süre Tahmini |
|-----|--------|--------------|
| **Faz 1** | Dashboard grafikleri + Otel detay sayfası | 1 hafta |
| **Faz 2** | Issue formu zenginleştirme + SLA alanı | 1 hafta |
| **Faz 3** | Kullanıcı-Otel eşleştirmesi + Rol bazlı erişim | 1.5 hafta |
| **Faz 4** | Raporlar export + Personel performansı | 1 hafta |
| **Faz 5** | Bildirim sistemi + Email | 1 hafta |

---

## Teknik Notlar

- **Grafik kütüphanesi:** `recharts` — React ile uyumlu, hafif
- **SLA hesabı:** Backend'de `CreatedAt + önceliğe göre offset` → `DueAt` alanı
- **Kullanıcı-Otel eşleştirmesi:** `UserHotel` junction tablosu gerekir
- **Export:** `ExcelJS` (frontend) veya backend'de `ClosedXML`
