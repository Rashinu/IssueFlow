# IssueFlow — Yapılacaklar & Eksikler

## 🔴 Kritik / Eksik Alan

### 1. Issue Detay Sayfasında "Atanan" Bilgisi Eksik
- Issue oluşturulurken `assignedUserId` alanı var ama detay sayfasında kim tarafından açıldığı görünmüyor
- "Oluşturan" (created by) alanı hiç yok — hangi destek personeli açtı?
- "Atanan kişi" gösteriliyor ama kullacı listesinden seçim yapılamıyor (dropdown yok)
- **Çözüm:** Issue kartında ve detay sayfasında atanan + oluşturan kişi gösterilmeli

---

## 🟡 Önemli / İyileştirme

### 2. Açıklama (Description) Formatlaması
- Import edilen issue'lardaki açıklama ham metin:
  ```
  ...sorun devam ediyor. 📎 Task: https://app.clickup.com/t/xxx
  👤 Destek: Onur Durusoy  📅 Tarih: 11.04.2026
  ```
- Task linki tıklanabilir olmalı
- 👤 Destek kişisi ve 📅 Tarih ayrı alanlar olarak gösterilmeli
- **Çözüm:** `IssueDetailPage.tsx`'te description parse edilip yapılandırılmış gösterim

### 3. Çözülemeyen Issue Bildirimi
- X gün geçmiş `New` veya `Investigating` issue'lar için uyarı yok
- **Seçenek A:** Kanban kartında görsel badge (⚠️ 7+ gün)
- **Seçenek B:** Email bildirimi (SMTP kurulumu gerekir)
- **Önerilen:** Önce görsel badge, sonra email

### 4. Issue Listesinde Otel Filtresi Çalışması
- Kanban'da otel dropdown'u var ama 162 otel var — arama olmadan bulunması zor
- **Çözüm:** Dropdown yerine searchable select (yazarak filtrele)

### 5. IssueHistory Görünümü
- Backend'de history kaydediliyor (status/priority/title değişince) ama frontend'de gösterilmiyor
- **Çözüm:** Issue detay sayfasına "Değişiklik Geçmişi" sekmesi ekle

---

## 🟢 Gelişme / Nice-to-have

### 6. Dashboard Gerçek Verilerle Dolmalı
- Dashboard şu an tüm issue'ları çekiyor ama otel bazlı breakdown yok
- Son 7 günde açılan vs çözülen karşılaştırması eksik

### 7. Kullanıcı Yönetimi
- Admin kullanıcı silebilmeli / rolünü değiştirebilmeli
- UsersPage sadece listele var, düzenleme yok

### 8. Hotel Detay Sayfası
- Bir otele tıklayınca o otele ait issue'lar filtrelenmiş gelmeli
- Şu an Hotels sayfasında kart var ama tıklanınca hiçbir şey olmuyor

### 9. Mobil Uyum
- Kanban board yatay scroll yapıyor ama mobilde kullanışsız
- Başlık + filtre alanı dar ekranlarda üst üste biniyor

---

## ✅ Tamamlananlar

- [x] Auth (Login / Register)
- [x] Issues CRUD (Create / Update / Delete)
- [x] Kanban Board + Arama / Filtre
- [x] Hotel CRUD
- [x] Kullanıcı listesi
- [x] Yorum ekleme (IssueDetail)
- [x] Raporlar (Günlük / Haftalık / Aylık)
- [x] Excel import (gun_sonu_destek_raporu.xlsx)
- [x] Global Exception Middleware (404/401/400)
- [x] FluentValidation
- [x] IssueHistory tracking (backend)
- [x] EnsureDeletedAsync kaldırıldı (DB restart'ta silinmiyor)
