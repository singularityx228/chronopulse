# TimerX – ChronoPulse

Dünyanın en hassas online kronometresi ve canlı 1v1 yarışma platformu.

## Ne Yapar?

TimerX, milisaniye hassasiyetinde çalışan profesyonel bir online kronometre ve geri sayım uygulamasıdır. Sadece zaman ölçmekle kalmaz, gerçek zamanlı olarak başka oyuncularla 1v1 yarışmanıza da olanak tanır.

## Özellikler

- **Milisaniye Hassasiyeti** – Saniyenin binde birine kadar kesin ölçüm yapar. Egzersiz, oyun, deney veya herhangi bir zamanlama ihtiyacı için mükemmeldir.
- **Canlı Türkiye Saati** – Ekranınızda her saniye güncellenen gerçek Türkiye saatini görebilirsiniz.
- **1v1 VS Arena** – Arkadaşlarınızı davet edin veya rastgele rakiplerle eşleşin. Gerçek zamanlı olarak kim daha hızlı durduruyor görün.
- **TİMİ Yapay Zekâ Botu** – Gerçek bir rakip bulamadığınızda TİMİ botuna karşı oynayabilirsiniz. Farklı zorluk seviyeleri mevcuttur.
- **Liderlik Tablosu** – En iyi skorlar anlık olarak güncellenir. Dünyada en iyiler arasına girin.
- **Birden Fazla Oyun Modu** – Normal, Ultra, Tahmin, Aşım ve daha fazlası. Her mod farklı bir meydan okumadır.
- **Çoklu Dil Desteği** – Türkçe, İngilizce ve İspanyolca arayüz seçenekleri.
- **Grafik Ayarları** – Ultra Düşük, Düşük, Normal ve Ultra grafik seviyeleri arasından seçim yaparak cihazınıza en uygun deneyimi elde edin.
- **PWA Desteği** – Tarayıcınızdan masaüstü uygulaması gibi kurabilirsiniz. İnternet bağlantısı olmadan bile çalışır.
- **Tamamen Ücretsiz** – Hiçbir ödeme veya abonelik gerektirmez. Reklamsız, temiz bir deneyim.

## Neden TimerX?

İnternetteki çoğu kronometre basit ve sıkıcıdır. TimerX ise kronometreyi bir oyuna dönüştürür. Arkadaşlarınızla yarışabilir, kendinizi geliştirebilir ve liderlik tablosunda yerinizi alabilirsiniz.

- Akıcı ve göze hoş gelen modern bir arayüz.
- Telefon, tablet ve bilgisayarda kusursuz çalışır.
- Hızlı açılır, hızlı çalışır, kaynak tüketmez.
- Gerçek zamanlı eşleşme ve skor paylaşımı.
- Kişisel en iyi skorlarınızı takip edebilirsiniz.

## Nasıl Kullanılır?

Siteyi ziyaret edin, kronometreyi başlatın veya 1v1 moduna girerek bir rakip bulun. Hepsi bu kadar basit!

**https://singularityx228.github.io/chronopulse/**

---

## Bağlantı Mimarisi (v2.0 – Evrensel Çevrimiçi Motor)

1v1 ve liderlik tablosu tek bir üçüncü taraf servise bağlı değildir. Tarayıcı,
ulaşabildiği tüm kanalları aynı anda kullanır ve aralarında otomatik geçiş yapar:

- **MQTT mesh (ana kanal):** 5 herkese açık broker; 443 portundan çalışanlar
  önce denenir. MQTT istemcisi bu projede sıfırdan yazılmıştır, bu yüzden CDN
  engellense bile çalışır.
- **ntfy yedeği:** 4 bağımsız ntfy sunucusu. Sadece MQTT tümüyle düşerse devreye
  girer; günlük mesaj kotasını (250/IP) aşmamak için istekler bütçelenir.
- **Yerel kanal:** BroadcastChannel + localStorage (aynı tarayıcıdaki sekmeler).
- **Kritik mesaj garantisi:** Davet, mod seçimi ve maç sonucu mesajları ACK
  gelene kadar aynı mesaj kimliğiyle yeniden gönderilir; alıcı tekrar edenleri
  yok sayar. Yani mesaj kaybı maçı kilitlemez.

### Sorun giderme

Adresin sonuna `#netcheck` ekleyin (örn. `.../chronopulse/#netcheck`). Sayfa,
her MQTT sunucusunu ve ntfy sunucusunu tek tek test edip ekranda rapor verir:

- `SONUC: 5 MQTT sunucusu calisiyor` → her şey normal.
- `MQTT portlari kapali, ntfy yedegi calisiyor` → ağ 8084/8081 gibi portları
  engelliyor; oyun çalışır ama birkaç saniye gecikme olabilir.
- `Hicbir kanal acilamadi` → ağ WebSocket/HTTPS trafiğini engelliyor.

`#syncdebug` eklerseniz sağ altta canlı bağlantı sayacı görünür.

Kendi ntfy sunucunuz varsa `#relay=https://sunucunuz` ile ek kanal tanımlayabilir,
`#relay=off` ile kaldırabilirsiniz.

---

*TimerX – Zamanla yarış, rakiplerini yen, en iyi ol!*

