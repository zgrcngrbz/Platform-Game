PLATFORM OYUNU
=========================

Bu proje, HTML5 Canvas ve saf JavaScript kullanılarak oluşturulmuş, Mario benzeri mekaniklere sahip klasik bir 2D platform oyunudur. Oyuncu, seviyeler arasında ilerlemek için engelleri aşmalı, düşmanları yenmeli, puanları toplamalı ve süre dolmadan bitiş noktasına ulaşmalıdır.


OYNANIŞ
--------

Oyunun temel amacı, her seviye için belirlenen hedef puana ulaşarak ve süre dolmadan kapıya (bitiş noktasına) varmaktır.

- Puanlar: Seviyedeki altınları (C) toplayarak ve düşmanların (E) üzerine zıplayarak puan kazanın.
- Süre: Her seviyenin tamamlanması için belirli bir süreniz vardır. Süre dolarsa bir can kaybedersiniz.
- Can: Düşmanlara yandan dokunursanız veya boşluğa düşerseniz bir can kaybedersiniz. Tüm canlarınız bittiğinde oyun sona erer.
- Seviye Geçme: Gerekli puana ulaştıktan sonra kapıya dokunarak bir sonraki seviyeye geçebilirsiniz.


ÖZELLİKLER
-----------

- Çoklu Seviye Sistemi: Oyun, script.js içinde tanımlanmış 5 farklı seviyeye sahiptir.
- Karakter Mekanikleri:
  - Yürüme ve koşma
  - Zıplama ve Çift Zıplama
  - Yerdeyken Eğilme
- Düşmanlar: Basit bir yapay zeka ile platformlar üzerinde devriye gezen ve üzerine zıplanarak etkisiz hale getirilebilen düşmanlar.
- Koleksiyon Öğeleri: Puan kazanmak için toplanabilen altınlar.
- Dinamik Kamera: Oyuncuyu takip eden ve oyun dünyasının sınırları içinde kalan akıcı bir kamera sistemi.
- Fizik Motoru: Yerçekimi ve sürtünme gibi temel fizik kurallarını simüle eder.
- UI (Kullanıcı Arayüzü): Skor, hedef skor, kalan can ve süre göstergeleri.
- Oyun Durumları: Duraklatma (Pause), Oyun Bitti (Game Over), Seviye Geçme ve Oyunu Kazanma durumları yönetimi.


KONTROLLER
------------

- Sol/Sağ Ok Tuşları veya A/D: Karakteri sola/sağa hareket ettirir.
- Yukarı Ok Tuşu veya W: Zıplama / Çift Zıplama.
- Aşağı Ok Tuşu veya S: Yerdeyken eğilme.
- P: Oyunu duraklatır ve devam ettirir.


NASIL ÇALIŞTIRILIR?
-------------------

Bu proje herhangi bir derleyici veya sunucuya ihtiyaç duymaz. Doğrudan tarayıcıda çalışır.

1.  Proje dosyalarını bilgisayarınıza indirin veya klonlayın.
2.  Tüm dosyaların (index.html, style.css, script.js) aynı klasörde olduğundan emin olun.
3.  index.html dosyasına çift tıklayarak favori web tarayıcınızda açın.

### Dosya Yapısı

#index.html       Ana HTML dosyası, oyun alanını ve UI'ı içerir

#style.css        Oyunun ve arayüzün stil dosyası

#script.js        Tüm oyun mantığını, seviyeleri ve kontrolleri içeren ana betik


TEKNİK DETAYLAR
---------------

- Frontend: Saf HTML, CSS ve JavaScript (ES6+).
- Grafik: Oyun, HTML5 Canvas API kullanılarak çizdirilmiştir.
- Tasarım: Seviyeler, script.js içindeki allLevels dizisinde karakter tabanlı haritalar olarak tasarlanmıştır. Bu, yeni seviyeler eklemeyi kolaylaştırır.
- Bağımlılıklar: Projenin hiçbir harici kütüphane veya framework bağımlılığı yoktur.


GELECEK GELİŞTİRMELER
----------------------

Bu projenin potansiyel olarak geliştirilebileceği bazı alanlar:

- Ses Efektleri ve Müzik: Zıplama, puan toplama, hasar alma ve arkaplan müziği eklemek.
- Daha Fazla Düşman Tipi: Uçan, ateş eden veya farklı hareket desenlerine sahip düşmanlar.
- Güçlendirmeler (Power-ups): Geçici yenilmezlik, daha yükseğe zıplama veya mermi atma gibi özellikler.
- Mobil Kontroller: Dokunmatik ekranlar için sanal joystick ve butonlar eklemek.
- Skor Tablosu: localStorage kullanarak en yüksek skorları kaydetmek.
- Seviye Editörü: Kullanıcıların kendi seviyelerini oluşturabileceği basit bir arayüz.
