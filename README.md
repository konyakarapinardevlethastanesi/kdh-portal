# KDH Entegre Portal

| Yol | İçerik |
|---|---|
| `/index.html` | Ana portal (tema seçimi burada) |
| `/zimmet/` | Demirbaş & Zimmet (index.html yönetici, mobil.html QR) |
| `/devriye/` | Devriye (index.html yönetici, guvenlik.html personel) |
| `/anket/` | Çalışan Memnuniyet Anketi (index.html yönetici, anket.html katılım). Yönetici panelinde: Genel Özet (Excel puanları), Anket Sonuçları, **Raporlama** (2 sayfalık PDF tutanağı + imza alanı) ve **Raporlarım** (kayıtlı raporlar, tüm yöneticiler görür) |
| `/anket2/` | Birim & Hizmet Anketi (hazırlanıyor) |
| `/kdh-theme.js` | Ortak tema: portaldaki `kdh_theme` seçimini giriş ekranlarına uygular |
| `/_apps_script/` | Apps Script kodlarının yedeği (siteye etkisi yok) |


## Raporlama notu
`_apps_script/anket_Code.gs` içine `Raporlar` sayfası için kod eklendi. Raporların tüm yöneticilerde görünmesi için bu kodu Apps Script'e yapıştırıp **Dağıt > Dağıtımları yönet > Yeni sürüm** ile yayınlayın (yeni dağıtım oluşturmayın; API linki aynı kalır).
