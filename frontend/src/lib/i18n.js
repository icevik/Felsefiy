import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('language');
    if (stored === 'tr' || stored === 'en') return stored;
  }
  return 'tr';
};

export const translations = {
  tr: {
    common: {
      appName: 'Felsefiy',
      appSubtitle: 'Red Team Platform',
      logout: 'Çıkış Yap',
      versionLabel: 'LLM Security Testing',
      language: 'Dil',
      turkish: 'Türkçe',
      english: 'İngilizce'
    },
    nav: {
      dashboard: 'Dashboard',
      projects: 'Projeler',
      strategies: 'Stratejiler'
    },
    status: {
      running: 'Çalışıyor',
      completed: 'Tamamlandı',
      failed: 'Başarısız',
      paused: 'Duraklatıldı',
      success: 'Başarılı',
      detected: 'Tespit Edildi',
      pending: 'Bekliyor'
    },
    login: {
      title: 'Felsefiy',
      subtitle: 'LLM Red Teaming kontrol paneline erişmek için giriş yapın',
      usernameLabel: 'Kullanıcı Adı',
      passwordLabel: 'Şifre',
      usernamePlaceholder: 'admin',
      passwordPlaceholder: '••••••••',
      submit: 'Giriş Yap',
      submitting: 'Giriş yapılıyor...',
      unexpectedResponse: 'Beklenmeyen cevap alındı',
      loginFailed: 'Giriş başarısız',
      footerNote: '',
      help: {
        title: 'Nasıl kullanılır?',
        step1: 'Sunucu tarafında tanımlı yönetici kullanıcı adı ve şifresini buraya girin.',
        step2: 'Giriş başarılı olursa otomatik olarak Dashboard ekranına yönlendirilirsiniz.',
        step3: 'Soldaki menüden projelere ve stratejilere geçebilir, alt kısımdaki dil menüsünden arayüz dilini değiştirebilirsiniz.',
        security: 'Giriş bilgileri yalnızca sunucu tarafındaki .env dosyasında saklanır; uygulama içinde kalıcı kullanıcı veritabanı bulunmaz.'
      }
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'LLM güvenlik testlerinizi izleyin ve yönetin',
      stats: {
        totalProjects: 'Toplam Proje',
        totalSessions: 'Toplam Oturum',
        successfulJailbreaks: 'Başarılı Jailbreak',
        activeSessions: 'Aktif Oturum'
      },
      help: {
        header: 'Dashboard, tüm projeler ve oturumlar için genel durumu gösteren ana kontrol panelidir.',
        stats: 'Üst kısımdaki kartlar; toplam proje, toplam oturum, başarılı jailbreak sayısı ve şu an çalışan oturum sayısını özetler.',
        recentProjects: 'Son eklenen projeleri gösterir. Her satırda proje adı, kısa açıklama ve oturum/başarı istatistikleri yer alır.',
        recentSessions: 'Son oturumları listeler. Her satırda proje adı, strateji, round bilgisi, durum ve sonuç rozeti bulunur.'
      },
      recentProjects: 'Son Projeler',
      allProjects: 'Tüm Projeler →',
      noProjectsTitle: 'Henüz proje yok',
      noProjectsBody: 'İlk projenizi oluşturarak başlayın',
      projectStatsSummary: '{{sessions}} oturum • {{success}} başarılı',
      recentSessions: 'Son Oturumlar',
      allSessions: 'Tümünü Gör →',
      noSessionsTitle: 'Henüz oturum yok',
      noSessionsCta: 'İlk projenizi oluşturun',
      unknownProject: 'Bilinmeyen Proje',
      noStrategy: 'Strateji yok',
      roundLabel: 'Round {{current}}/{{max}}'
    },
    projects: {
      title: 'Projeler',
      subtitle: 'Hedef sistemlerinizi yapılandırın ve test edin',
      newProject: 'Yeni Proje',
      emptyTitle: 'Henüz proje yok',
      emptyBody: 'İlk projenizi oluşturarak başlayın',
      emptyCta: 'Proje Oluştur',
      edit: 'Düzenle',
      delete: 'Sil',
      deleteConfirm: 'Bu projeyi silmek istediğinize emin misiniz?',
      sessionsLabel: 'Oturum',
      successLabel: 'Başarılı',
      rateLabel: 'Oran',
      startTest: 'Test Başlat',
      errors: {
        saveFailedPrefix: 'Proje kaydedilemedi: '
      },
      help: {
        header: 'Bu sayfada hedef API projelerinizi oluşturur, düzenler ve silersiniz. Her proje belirli bir hedef sistemi ve API yapılandırmasını temsil eder.',
        newProjectButton: 'Yeni bir güvenlik testi projesi oluşturur. Hedef API, kimlik bilgileri ve kullanılacak AI modellerini burada tanımlarsınız.',
        cardOverview: 'Her kart bir projeyi temsil eder. Üst kısımda proje adı ve hedef URL, ortada oturum ve başarı istatistikleri, altta ise test başlatma ve detaylara gitme butonları bulunur.',
        startTestButton: 'Bu proje için yeni bir güvenlik testi oturumu başlatır. Detaylı yapılandırma ve oturum yönetimi için proje detay sayfasına yönlendirilirsiniz.'
      }
    },
    projectForm: {
      editTitle: 'Projeyi Düzenle',
      createTitle: 'Yeni Proje',
      basicInfo: 'Temel Bilgiler',
      nameLabel: 'Proje Adı *',
      namePlaceholder: 'Örn: ChatGPT API Test',
      descriptionLabel: 'Açıklama',
      descriptionPlaceholder: 'Proje hakkında kısa açıklama...',
      targetConfig: 'Hedef API Yapılandırması',
      methodLabel: 'Method',
      urlLabel: 'URL *',
      urlPlaceholder: 'https://api.example.com/chat',
      headersLabel: 'Headers (JSON)',
      headersPlaceholder: '{"Authorization": "Bearer YOUR_KEY"}',
      bodyLabel: 'Body Template (JSON) - {{prompt}} kullanın',
      bodyPlaceholder: '{"question": "{{prompt}}"}',
      testButton: 'Bağlantıyı Test Et',
      testing: 'Test Ediliyor...',
      testSuccess: 'Bağlantı başarılı',
      testFail: 'Bağlantı başarısız',
      aiModels: 'AI Model Ayarları',
      modelsHint: 'OpenRouter model ID\'sini doğrudan yazabilirsiniz. Örn: google/gemini-2.5-flash',
      attackerModel: 'Saldırgan Model',
      moderatorModel: 'Denetleyici Model',
      cancel: 'İptal',
      update: 'Güncelle',
      create: 'Oluştur',
      errors: {
        nameRequired: 'Proje adı gerekli',
        urlRequired: 'Hedef URL gerekli',
        urlInvalid: 'Geçersiz URL formatı',
        headersInvalid: 'Geçersiz JSON formatı',
        bodyMissingPrompt: 'Body içinde {{prompt}} placeholder\'ı olmalı',
        testUrlRequired: 'Test için URL gerekli'
      }
    },
    strategies: {
      title: 'Saldırı Stratejileri',
      subtitle: 'Jailbreak ve adversarial attack tekniklerini yönetin',
      seedButton: 'Varsayılanları Yükle',
      newStrategy: 'Yeni Strateji',
      emptyTitle: 'Henüz strateji yok',
      emptyBody: 'Varsayılan stratejileri yükleyin veya yeni bir strateji oluşturun',
      emptySeedCta: 'Varsayılanları Yükle',
      edit: 'Düzenle',
      delete: 'Sil',
      deleteConfirm: 'Bu stratejiyi silmek istediğinize emin misiniz?',
      initialPromptLabel: 'Başlangıç Promptu:',
      formEditTitle: 'Stratejiyi Düzenle',
      formCreateTitle: 'Yeni Strateji',
      formNameLabel: 'Strateji Adı *',
      formNamePlaceholder: 'Örn: DAN Jailbreak',
      formDescriptionLabel: 'Açıklama',
      formDescriptionPlaceholder: 'Strateji hakkında kısa açıklama...',
      formSystemPromptLabel: 'Saldırgan System Prompt *',
      formSystemPromptPlaceholder: 'Saldırgan AI\'a verilecek system prompt...',
      formInitialPromptLabel: 'Başlangıç Promptu *',
      formInitialPromptPlaceholder: 'Hedefe gönderilecek ilk saldırı promptu...',
      formTagsLabel: 'Etiketler (virgülle ayırın)',
      formTagsPlaceholder: 'roleplay, social-engineering, classic',
      formCancel: 'İptal',
      formUpdate: 'Güncelle',
      formCreate: 'Oluştur',
      formValidation: 'Lütfen zorunlu alanları doldurun',
      errors: {
        saveFailedPrefix: 'Strateji kaydedilemedi: '
      },
      loading: 'Yükleniyor...',
      help: {
        header: 'Bu sayfada saldırı stratejilerini yönetirsiniz. Her strateji, saldırgan AI\'ın nasıl davranacağını tanımlar.',
        seedButton: 'Varsayılan olarak gelen örnek saldırı stratejilerini veritabanına yükler.',
        newStrategyButton: 'Tamamen yeni bir saldırı stratejisi oluşturmanızı sağlar. İsim, açıklama, system prompt ve ilk saldırı promptunu tanımlarsınız.'
      }
    },
    projectDetail: {
      notFound: 'Proje bulunamadı',
      header: {
        reportButton: 'Rapor Al',
        optimizerButton: 'Prompt Optimizer',
        batchButton: 'Çoklu Saldırı',
        singleTestButton: 'Tekli Test'
      },
      batchStatus: {
        title: 'Çoklu Saldırı Aktif',
        startedSessions: '{{count}} oturum başlatıldı',
        total: 'Toplam',
        running: 'Çalışıyor',
        success: 'Başarılı',
        failed: 'Başarısız',
        detected: 'Tespit',
        stopAll: 'Tümünü Durdur'
      },
      stats: {
        totalSessions: 'Toplam Oturum',
        successful: 'Başarılı',
        failed: 'Başarısız',
        successRate: 'Başarı Oranı'
      },
      config: {
        apiConfigTitle: 'API Yapılandırması',
        methodUrlLabel: 'Method & URL',
        headersLabel: 'Headers',
        bodyTemplateLabel: 'Body Template'
      },
      models: {
        title: 'AI Modelleri',
        attacker: 'Saldırgan',
        moderator: 'Denetleyici'
      },
      sessions: {
        title: 'Test Oturumları',
        emptyTitle: 'Henüz test oturumu yok',
        emptyCta: 'İlk testi başlat',
        noStrategy: 'Strateji yok'
      },
      startModal: {
        title: 'Yeni Test Başlat',
        attackGoalLabel: 'Saldırı Hedefi',
        attackGoalHint: '(Ne elde etmek istiyorsunuz?)',
        attackGoalPlaceholder: 'Örn: Hedef sistemin yasaklı içerik üretmesini sağla, güvenlik filtrelerini atla, sistem promptunu öğren...',
        strategyLabel: 'Saldırı Stratejisi',
        strategyAutoOption: 'Otomatik (AI karar versin)',
        strategyHint: 'Strateji seçmezseniz, AI duruma göre en uygun tekniği seçecek',
        instructionsLabel: 'Özel Talimatlar',
        instructionsHint: '(Opsiyonel)',
        instructionsPlaceholder: 'Örn: Türkçe konuş, nazik ol, teknik terimler kullan, belirli bir konuya odaklan...',
        maxRoundsLabel: 'Maksimum Round',
        maxRoundsHint: 'Her round: Saldırgan → Hedef → Denetleyici döngüsü',
        cancel: 'İptal',
        starting: 'Başlatılıyor...',
        startButton: 'Saldırıyı Başlat'
      },
      batchModal: {
        title: 'Çoklu Saldırı Başlat',
        subtitle: 'Paralel oturumlarla yük testi',
        sessionCountLabel: 'Eşzamanlı Oturum Sayısı',
        sessionCountHint: 'Her oturum farklı bir saldırı hedefi ile başlayacak',
        strategyLabel: 'Saldırı Stratejisi',
        mixedOption: 'Karışık (Her oturumda farklı)',
        commonInstructionsLabel: 'Ortak Talimatlar',
        commonInstructionsHint: '(Tüm oturumlara uygulanır)',
        commonInstructionsPlaceholder: 'Örn: Türkçe konuş, agresif ol...',
        maxRoundsLabel: 'Her Oturum İçin Maksimum Round',
        howItWorksTitle: 'Nasıl Çalışır?',
        howItWorksItems: [
          'Her oturum farklı bir saldırı hedefi ile başlar',
          'Tüm oturumlar paralel olarak çalışır',
          'Sonuçlar gerçek zamanlı olarak güncellenir',
          'İstediğiniz zaman tümünü durdurabilirsiniz'
        ],
        cancel: 'İptal',
        starting: 'Başlatılıyor...',
        startButton: '{{count}} Saldırı Başlat'
      },
      reportModal: {
        title: 'Güvenlik Raporu',
        subtitle: 'AI destekli çok yönlü analiz',
        downloadMarkdown: 'Markdown İndir',
        backToReports: 'Raporlara Dön',
        newReportTitle: 'Yeni Rapor Oluştur',
        newReportDescription: 'Tüm test oturumlarını AI ile analiz edip kapsamlı bir güvenlik raporu oluşturun.',
        newReportButton: 'Rapor Oluştur',
        newReportSessionsHint: 'Rapor oluşturmak için en az bir test oturumu gerekli',
        pastReportsTitle: 'Geçmiş Raporlar',
        pastReportsView: 'Görüntüle',
        pastReportsDelete: 'Sil',
        pastReportsStats: '{{tests}} test • {{success}} başarılı • %{{rate}} oran',
        loadingTitle: 'Rapor Oluşturuluyor...',
        loadingDescription: 'Tüm oturumlar analiz ediliyor, bu birkaç dakika sürebilir.',
        help: {
          title: 'Rapor ekranı nasıl kullanılır?',
          step1: 'Önce bu proje için en az bir test oturumunu tamamlayın.',
          step2: '"Rapor Oluştur" butonuna basarak tüm oturumları AI ile analiz ettirin.',
          step3: 'Oluşan raporları üst kısımdaki "Geçmiş Raporlar" listesinden açabilir, silebilir veya Markdown olarak indirebilirsiniz.',
          step4: 'Aşağıdaki bölümler; yönetici özeti, zafiyet analizi, saldırı kalıpları ve öneriler gibi farklı bakış açılarını içerir.'
        }
      },
      reportStats: {
        totalTests: 'Toplam Test',
        successful: 'Başarılı',
        failed: 'Başarısız',
        detected: 'Tespit',
        successRate: 'Başarı Oranı'
      },
      reportSections: {
        executiveSummary: 'Yönetici Özeti',
        vulnerabilityAnalysis: 'Güvenlik Açığı Analizi',
        attackPatterns: 'Saldırı Kalıpları',
        successfulTechniques: 'Başarılı Teknikler',
        riskAssessment: 'Risk Değerlendirmesi',
        recommendations: 'Öneriler'
      },
      strategyStats: {
        title: 'Strateji Performansı',
        success: '{{count}} başarılı',
        detected: '{{count}} tespit',
        total: '{{count}} toplam'
      },
      footer: {
        generatedAt: 'Oluşturulma: ',
        model: 'Model: '
      },
      errors: {
        startSessionFailed: 'Oturum başlatılamadı: ',
        startBatchFailed: 'Çoklu saldırı başlatılamadı: ',
        generateReportFailed: 'Rapor oluşturulamadı: ',
        loadReportFailed: 'Rapor yüklenemedi',
        deleteReportConfirm: 'Bu raporu silmek istediğinize emin misiniz?'
      },
      help: {
        header: 'Bu sayfada seçili proje için tüm güvenlik testi detaylarını görür ve yönetirsiniz: istatistikler, API yapılandırması, AI modelleri ve test oturumları.',
        stats: 'Proje bazında toplam oturum sayısını, başarılı jailbreak sayısını ve genel başarı oranını gösterir.',
        configCard: 'Hedef API için HTTP methodu, URL, header ve body şablonunu gösterir. Bu bilgiler tüm test oturumlarında kullanılır.',
        modelsCard: 'Saldırgan ve denetleyici AI modellerini gösterir. Saldırgan model saldırıları üretirken, denetleyici model tespit analizi yapar.',
        sessionsCard: 'Bu proje için açılmış tüm test oturumlarını listeler. Her satırda strateji, round sayısı, başlangıç zamanı ve sonuç durumu yer alır.',
        headerReportButton: 'Seçili proje için geçmiş oturumları analiz eden AI destekli bir güvenlik raporu oluşturur veya mevcut raporları görüntülemenizi sağlar.',
        headerOptimizerButton: 'Bu proje için Prompt Optimizer ekranını açar. Başarılı saldırı promptlarını kullanarak daha güçlü ve zor tespit edilen yeni promptlar üretmenizi sağlar.',
        headerBatchButton: 'Aynı proje için birden fazla test oturumunu paralel olarak başlatır. Yük testi ve farklı saldırı hedeflerini aynı anda denemek için kullanılır.',
        headerSingleTestButton: 'Bu proje için tek bir interaktif test oturumu başlatır. Saldırı hedefini, stratejiyi ve ek talimatları detaylı şekilde tanımlayabilirsiniz.'
      }
    },
    sessionView: {
      notFound: 'Oturum bulunamadı',
      waitingMessages: 'Mesaj bekleniyor...',
      scrollToBottom: 'En alta in',
      loopRunning: 'Saldırı döngüsü devam ediyor...',
      statusRunning: 'Çalışıyor',
      statusSuccess: 'Jailbreak Başarılı!',
      statusFailed: 'Başarısız',
      statusDetected: 'Saldırı Tespit Edildi',
      statusOther: '{{status}}',
      roundLabel: 'Round {{round}}',
      stop: 'Durdur',
      stopping: 'Durduruluyor...',
      role: {
        attacker: 'Saldırgan AI',
        target: 'Hedef Sistem',
        moderator: 'Denetleyici AI',
        system: 'Sistem'
      },
      showMore: 'Devamını göster',
      showLess: 'Daha az göster',
      analysis: {
        success: 'Başarı:',
        detected: 'Tespit:',
        confidence: 'Güven:',
        shouldContinue: 'Devam:',
        nextStrategy: 'Sonraki strateji:',
        yes: 'Evet',
        no: 'Hayır'
      },
      helpToggle: 'Nasıl çalışır?',
      help: {
        title: 'Oturum ekranı nasıl çalışır?',
        step1: 'Üst çubukta proje adını, kullanılan stratejiyi ve round bilgisini görürsünüz.',
        step2: 'Mesajlar zaman sırasıyla akar; renkler ve ikonlar rolleri gösterir (Saldırgan, Hedef, Denetleyici, Sistem).',
        step3: 'Oturum ÇALIŞIYOR durumundaysa sağ üstteki Durdur butonu ile saldırı döngüsünü durdurabilirsiniz.',
        step4: 'Uzun mesajları "Devamını göster" ile açabilir, moderatör analizinden başarı/detektion ve devam önerisini okuyabilirsiniz.',
        note: 'Sağ alttaki "En alta in" butonu, uzun loglarda en son mesaja hızlıca gitmenizi sağlar.'
      }
    },
    optimizer: {
      backToProject: 'Projeye Dön',
      title: 'Prompt Optimizer',
      subtitle: '{{project}} - AI destekli prompt iyileştirme',
      stats: {
        successfulAttacks: 'Başarılı Saldırı',
        optimized: 'Optimize Edilmiş',
        templates: 'Şablon',
        avgSuccess: 'Ort. Başarı'
      },
      tabs: {
        optimize: 'Optimize Et',
        analyze: 'Analiz Et',
        attacks: 'Başarılı Saldırılar',
        templates: 'Şablonlar',
        history: 'Geçmiş'
      },
      options: {
        ENHANCE: {
          label: 'Güçlendir',
          description: 'Mevcut promptu daha etkili hale getir'
        },
        COMBINE: {
          label: 'Birleştir',
          description: 'Başarılı promptları birleştir'
        },
        ADAPT: {
          label: 'Adapte Et',
          description: 'Farklı hedefe uyarla'
        },
        SIMPLIFY: {
          label: 'Sadeleştir',
          description: 'Daha basit ve etkili yap'
        },
        OBFUSCATE: {
          label: 'Gizle',
          description: 'Tespit edilmesi zor hale getir - Çok katmanlı ve sofistike'
        }
      },
      originalPrompt: 'Orijinal Prompt',
      originalPromptPlaceholder: 'İyileştirmek istediğiniz promptu buraya yazın...',
      optimizationType: 'Optimizasyon Tipi',
      optimizeButton: 'Optimize Et',
      optimizing: 'Optimize Ediliyor...',
      combineButton: 'Birleştir',
      combineTooltip: 'En az 2 başarılı saldırı gerekli',
      optimizedPromptTitle: 'Optimize Edilmiş Prompt',
      optimizedPromptEmptyTitle: 'Optimize edilmiş prompt burada görünecek',
      optimizedPromptEmptySubtitle: 'Bir prompt girin ve optimizasyon tipini seçin',
      comparison: {
        originalLabel: 'Orijinal',
        optimizedLabel: 'Optimize',
        changeLabel: 'Değişim',
        wordUnit: 'kelime'
      },
      improvementsTitle: 'Yapılan İyileştirmeler:',
      effectivenessLabel: 'Beklenen Etkililik',
      riskLabel: 'Tespit Riski',
      detectionRisk: {
        low: 'Düşük',
        medium: 'Orta',
        high: 'Yüksek'
      },
      reasoningTitle: 'Neden Bu Değişiklikler?',
      analyze: {
        title: 'Prompt Analizi',
        placeholder: 'Analiz etmek istediğiniz promptu buraya yazın...',
        analyzing: 'Analiz Ediliyor...',
        analyzeButton: 'Analiz Et',
        resultTitle: 'Analiz Sonucu',
        scoreLabel: 'Genel Skor',
        strengthsTitle: 'Güçlü Yönler',
        weaknessesTitle: 'Zayıf Yönler',
        suggestionsTitle: 'Öneriler',
        suggestionTypeAdd: 'Ekle',
        suggestionTypeRemove: 'Çıkar',
        suggestionTypeChange: 'Değiştir',
        useForOptimize: 'Bu Promptu Optimize Et',
        emptyState: 'Analiz sonucu burada görünecek'
      },
      attacks: {
        title: 'Başarılı Saldırılar',
        emptyTitle: 'Henüz başarılı saldırı yok',
        emptySubtitle: 'Başarılı saldırılar otomatik olarak kaydedilecek',
        unknownTechnique: 'Bilinmeyen teknik',
        attackPromptLabel: 'Saldırı Promptu:',
        targetResponseLabel: 'Hedef Yanıtı:',
        copy: 'Kopyala',
        optimize: 'Optimize Et'
      },
      templates: {
        title: 'Prompt Şablonları',
        seedButton: 'Varsayılanları Yükle',
        emptyTitle: 'Henüz şablon yok',
        emptySubtitle: '"Varsayılanları Yükle" butonuna tıklayın',
        use: 'Kullan →'
      },
      history: {
        title: 'Optimizasyon Geçmişi',
        emptyTitle: 'Henüz optimizasyon yapılmamış',
        successLabel: 'Başarı: ',
        deleteTitle: 'Sil',
        copy: 'Kopyala',
        reOptimize: 'Tekrar Optimize Et'
      },
      errors: {
        optimizeFailed: 'Optimizasyon başarısız: ',
        combineFailed: 'Birleştirme başarısız: ',
        analyzeFailed: 'Analiz başarısız: '
      },
      help: {
        header: 'Prompt Optimizer, başarılı saldırı örneklerinden yola çıkarak daha etkili ve tespiti zor yeni promptlar üretmenizi sağlar.',
        optimizeTab: 'Optimize sekmesi, tek bir promptu seçip farklı optimizasyon tipleriyle iyileştirmenize olanak tanır.',
        analyzeTab: 'Analiz sekmesi, verdiğiniz promptu güvenlik açısından değerlendirir ve güçlü/zayıf yönleriyle birlikte öneriler sunar.',
        attacksTab: 'Başarılı Saldırılar sekmesi, bu proje için kaydedilen başarılı saldırıları listeler. Buradan promptları optimize edebilir veya kopyalayabilirsiniz.',
        templatesTab: 'Şablonlar sekmesi, sık kullanılan saldırı prompt şablonlarını gösterir. Hazır şablonları seçip kendi senaryonuza uyarlayabilirsiniz.',
        historyTab: 'Geçmiş sekmesi, daha önce yapılmış optimizasyon denemelerini ve sonuçlarını listeler.'
      }
    }
  },
  en: {
    common: {
      appName: 'Felsefiy',
      appSubtitle: 'Red Team Platform',
      logout: 'Log Out',
      versionLabel: 'LLM Security Testing',
      language: 'Language',
      turkish: 'Turkish',
      english: 'English'
    },
    nav: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      strategies: 'Strategies'
    },
    status: {
      running: 'Running',
      completed: 'Completed',
      failed: 'Failed',
      paused: 'Paused',
      success: 'Success',
      detected: 'Detected',
      pending: 'Pending'
    },
    login: {
      title: 'Felsefiy',
      subtitle: 'Sign in to access the LLM Red Teaming control panel',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      usernamePlaceholder: 'admin',
      passwordPlaceholder: '••••••••',
      submit: 'Sign In',
      submitting: 'Signing in...',
      unexpectedResponse: 'Unexpected response received',
      loginFailed: 'Login failed',
      footerNote: '',
      help: {
        title: 'How to use this screen?',
        step1: 'Enter the admin username and password configured on the server.',
        step2: 'If login succeeds you will be redirected to the Dashboard automatically.',
        step3: 'From the left sidebar you can navigate to projects and strategies, and use the language menu to switch the UI language.',
        security: 'Credentials are stored only in the server .env file; there is no persistent user database inside this app.'
      }
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Monitor and manage your LLM security tests',
      stats: {
        totalProjects: 'Total Projects',
        totalSessions: 'Total Sessions',
        successfulJailbreaks: 'Successful Jailbreaks',
        activeSessions: 'Active Sessions'
      },
      recentProjects: 'Recent Projects',
      allProjects: 'View All Projects →',
      noProjectsTitle: 'No projects yet',
      noProjectsBody: 'Create your first project to get started',
      projectStatsSummary: '{{sessions}} sessions • {{success}} successful',
      recentSessions: 'Recent Sessions',
      allSessions: 'View All →',
      noSessionsTitle: 'No sessions yet',
      noSessionsCta: 'Create your first project',
      unknownProject: 'Unknown Project',
      noStrategy: 'No strategy',
      roundLabel: 'Round {{current}}/{{max}}'
    },
    projects: {
      title: 'Projects',
      subtitle: 'Configure and test your target systems',
      newProject: 'New Project',
      emptyTitle: 'No projects yet',
      emptyBody: 'Start by creating your first project',
      emptyCta: 'Create Project',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this project?',
      sessionsLabel: 'Sessions',
      successLabel: 'Successful',
      rateLabel: 'Rate',
      startTest: 'Start Test',
      errors: {
        saveFailedPrefix: 'Failed to save project: '
      },
      help: {
        header: 'On this page you create, edit and delete target API projects. Each project represents a specific target system and its API configuration.',
        newProjectButton: 'Creates a new security testing project. You will define the target API, credentials and AI models to be used.',
        cardOverview: 'Each card represents a project. The top shows the project name and target URL, the middle shows session and success statistics, and the bottom has buttons to start tests and open project details.',
        startTestButton: 'Starts a new security test session for this project. You will be redirected to the project detail page for full configuration and session management.'
      }
    },
    projectForm: {
      editTitle: 'Edit Project',
      createTitle: 'New Project',
      basicInfo: 'Basic Information',
      nameLabel: 'Project Name *',
      namePlaceholder: 'e.g. ChatGPT API Test',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Short description about the project...',
      targetConfig: 'Target API Configuration',
      methodLabel: 'Method',
      urlLabel: 'URL *',
      urlPlaceholder: 'https://api.example.com/chat',
      headersLabel: 'Headers (JSON)',
      headersPlaceholder: '{"Authorization": "Bearer YOUR_KEY"}',
      bodyLabel: 'Body Template (JSON) - use {{prompt}}',
      bodyPlaceholder: '{"question": "{{prompt}}"}',
      testButton: 'Test Connection',
      testing: 'Testing...',
      testSuccess: 'Connection successful',
      testFail: 'Connection failed',
      aiModels: 'AI Model Settings',
      modelsHint: 'You can directly use the OpenRouter model ID. Example: google/gemini-2.5-flash',
      attackerModel: 'Attacker Model',
      moderatorModel: 'Moderator Model',
      cancel: 'Cancel',
      update: 'Update',
      create: 'Create',
      errors: {
        nameRequired: 'Project name is required',
        urlRequired: 'Target URL is required',
        urlInvalid: 'Invalid URL format',
        headersInvalid: 'Invalid JSON format',
        bodyMissingPrompt: 'Body must contain the {{prompt}} placeholder',
        testUrlRequired: 'URL is required for testing'
      }
    },
    strategies: {
      title: 'Attack Strategies',
      subtitle: 'Manage jailbreak and adversarial attack techniques',
      seedButton: 'Load Defaults',
      newStrategy: 'New Strategy',
      emptyTitle: 'No strategies yet',
      emptyBody: 'Load default strategies or create a new one',
      emptySeedCta: 'Load Defaults',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this strategy?',
      initialPromptLabel: 'Initial Prompt:',
      formEditTitle: 'Edit Strategy',
      formCreateTitle: 'New Strategy',
      formNameLabel: 'Strategy Name *',
      formNamePlaceholder: 'e.g. DAN Jailbreak',
      formDescriptionLabel: 'Description',
      formDescriptionPlaceholder: 'Short description about the strategy...',
      formSystemPromptLabel: 'Attacker System Prompt *',
      formSystemPromptPlaceholder: 'System prompt for the attacker AI...',
      formInitialPromptLabel: 'Initial Prompt *',
      formInitialPromptPlaceholder: 'First attack prompt sent to the target...',
      formTagsLabel: 'Tags (comma separated)',
      formTagsPlaceholder: 'roleplay, social-engineering, classic',
      formCancel: 'Cancel',
      formUpdate: 'Update',
      formCreate: 'Create',
      formValidation: 'Please fill in all required fields',
      errors: {
        saveFailedPrefix: 'Failed to save strategy: '
      },
      loading: 'Loading...',
      help: {
        header: 'On this page you manage attack strategies. Each strategy defines how the attacker AI should behave.',
        seedButton: 'Loads the default example attack strategies into the database.',
        newStrategyButton: 'Lets you create a brand new attack strategy by defining its name, description, system prompt and initial attack prompt.'
      }
    },
    projectDetail: {
      notFound: 'Project not found',
      header: {
        reportButton: 'Generate Report',
        optimizerButton: 'Prompt Optimizer',
        batchButton: 'Batch Attack',
        singleTestButton: 'Single Test'
      },
      batchStatus: {
        title: 'Batch Attack Active',
        startedSessions: '{{count}} sessions started',
        total: 'Total',
        running: 'Running',
        success: 'Successful',
        failed: 'Failed',
        detected: 'Detected'
      },
      stats: {
        totalSessions: 'Total Sessions',
        successful: 'Successful',
        failed: 'Failed',
        successRate: 'Success Rate'
      },
      config: {
        apiConfigTitle: 'API Configuration',
        methodUrlLabel: 'Method & URL',
        headersLabel: 'Headers',
        bodyTemplateLabel: 'Body Template'
      },
      models: {
        title: 'AI Models',
        attacker: 'Attacker',
        moderator: 'Moderator'
      },
      sessions: {
        title: 'Test Sessions',
        emptyTitle: 'No test sessions yet',
        emptyCta: 'Start the first test',
        noStrategy: 'No strategy'
      },
      startModal: {
        title: 'Start New Test',
        attackGoalLabel: 'Attack Goal',
        attackGoalHint: '(What do you want to achieve?)',
        attackGoalPlaceholder: 'e.g. Make the target system generate prohibited content, bypass safety filters, extract system prompt...',
        strategyLabel: 'Attack Strategy',
        strategyAutoOption: 'Automatic (let AI decide)',
        strategyHint: 'If you do not select a strategy, the AI will choose the most suitable technique.',
        instructionsLabel: 'Custom Instructions',
        instructionsHint: '(Optional)',
        instructionsPlaceholder: 'e.g. Speak Turkish, be polite, use technical terms, focus on a specific topic...',
        maxRoundsLabel: 'Maximum Rounds',
        maxRoundsHint: 'Each round: Attacker → Target → Moderator loop',
        cancel: 'Cancel',
        starting: 'Starting...',
        startButton: 'Start Attack'
      },
      batchModal: {
        title: 'Start Batch Attack',
        subtitle: 'Load testing with parallel sessions',
        sessionCountLabel: 'Concurrent Session Count',
        sessionCountHint: 'Each session will start with a different attack goal',
        strategyLabel: 'Attack Strategy',
        mixedOption: 'Mixed (different in each session)',
        commonInstructionsLabel: 'Common Instructions',
        commonInstructionsHint: '(Applied to all sessions)',
        commonInstructionsPlaceholder: 'e.g. Speak Turkish, be aggressive...',
        maxRoundsLabel: 'Maximum Rounds Per Session',
        howItWorksTitle: 'How It Works',
        howItWorksItems: [
          'Each session starts with a different attack goal',
          'All sessions run in parallel',
          'Results are updated in real-time',
          'You can stop all sessions at any time'
        ],
        cancel: 'Cancel',
        starting: 'Starting...',
        startButton: 'Start {{count}} Attacks'
      },
      reportModal: {
        title: 'Security Report',
        subtitle: 'AI-powered multi-perspective analysis',
        downloadMarkdown: 'Download Markdown',
        backToReports: 'Back to Reports',
        newReportTitle: 'Generate New Report',
        newReportDescription: 'Analyze all test sessions with AI and generate a comprehensive security report.',
        newReportButton: 'Generate Report',
        newReportSessionsHint: 'At least one test session is required to generate a report',
        pastReportsTitle: 'Past Reports',
        pastReportsView: 'View',
        pastReportsDelete: 'Delete',
        pastReportsStats: '{{tests}} tests • {{success}} successful • {{rate}}% rate',
        loadingTitle: 'Generating Report...',
        loadingDescription: 'All sessions are being analyzed, this may take a few minutes.',
        help: {
          title: 'How to use the report screen?',
          step1: 'First, make sure there is at least one completed test session for this project.',
          step2: 'Click the "Generate Report" button to let the AI analyze all sessions.',
          step3: 'You can open, delete or download generated reports as Markdown from the "Past Reports" list above.',
          step4: 'The sections below provide different perspectives such as executive summary, vulnerability analysis, attack patterns and recommendations.'
        }
      },
      reportStats: {
        totalTests: 'Total Tests',
        successful: 'Successful',
        failed: 'Failed',
        detected: 'Detected',
        successRate: 'Success Rate'
      },
      reportSections: {
        executiveSummary: 'Executive Summary',
        vulnerabilityAnalysis: 'Vulnerability Analysis',
        attackPatterns: 'Attack Patterns',
        successfulTechniques: 'Successful Techniques',
        riskAssessment: 'Risk Assessment',
        recommendations: 'Recommendations'
      },
      strategyStats: {
        title: 'Strategy Performance',
        success: '{{count}} successful',
        detected: '{{count}} detected',
        total: '{{count}} total'
      },
      footer: {
        generatedAt: 'Generated at: ',
        model: 'Model: '
      },
      errors: {
        startSessionFailed: 'Failed to start session: ',
        startBatchFailed: 'Failed to start batch attack: ',
        generateReportFailed: 'Failed to generate report: ',
        loadReportFailed: 'Failed to load report',
        deleteReportConfirm: 'Are you sure you want to delete this report?'
      },
      help: {
        header: 'On this page you can see and manage all security testing details for the selected project: stats, API configuration, AI models and test sessions.',
        stats: 'Summarizes the total number of sessions, successful jailbreaks and overall success rate for this project.',
        configCard: 'Shows the HTTP method, URL, headers and body template for the target API. These settings are used for all test sessions.',
        modelsCard: 'Displays the attacker and moderator AI models. The attacker model generates attacks, while the moderator model performs detection analysis.',
        sessionsCard: 'Lists all test sessions created for this project. Each row shows the strategy, round count, start time and result status.',
        headerReportButton: 'Generates or opens an AI‑powered security report that analyzes past sessions for this project.',
        headerOptimizerButton: 'Opens the Prompt Optimizer screen for this project to generate stronger and harder‑to‑detect prompts from successful attacks.',
        headerBatchButton: 'Starts multiple test sessions in parallel for this project. Useful for load testing and trying different attack goals at the same time.',
        headerSingleTestButton: 'Starts a single interactive test session for this project where you can define the attack goal, strategy and additional instructions in detail.'
      }
    },
    sessionView: {
      notFound: 'Session not found',
      waitingMessages: 'Waiting for messages...',
      scrollToBottom: 'Scroll to bottom',
      loopRunning: 'Attack loop is running...',
      statusRunning: 'Running',
      statusSuccess: 'Jailbreak Successful!',
      statusFailed: 'Failed',
      statusDetected: 'Attack Detected',
      statusOther: '{{status}}',
      roundLabel: 'Round {{round}}',
      stop: 'Stop',
      stopping: 'Stopping...',
      role: {
        attacker: 'Attacker AI',
        target: 'Target System',
        moderator: 'Moderator AI',
        system: 'System'
      },
      showMore: 'Show more',
      showLess: 'Show less',
      analysis: {
        success: 'Success:',
        detected: 'Detected:',
        confidence: 'Confidence:',
        shouldContinue: 'Continue:',
        nextStrategy: 'Next strategy:',
        yes: 'Yes',
        no: 'No'
      },
      helpToggle: 'How it works?',
      help: {
        title: 'How does the session screen work?',
        step1: 'The top bar shows the project name, selected strategy and round information.',
        step2: 'Messages flow in chronological order; colors and icons indicate the roles (Attacker, Target, Moderator, System).',
        step3: 'When the session is RUNNING you can safely stop the attack loop using the Stop button on the top right.',
        step4: 'For long messages you can expand with "Show more" and read the moderator analysis for success/detection and continuation hints.',
        note: 'The "Scroll to bottom" button in the bottom-right helps you quickly jump to the latest message in long logs.'
      }
    },
    optimizer: {
      backToProject: 'Back to Project',
      title: 'Prompt Optimizer',
      subtitle: '{{project}} - AI-powered prompt optimization',
      stats: {
        successfulAttacks: 'Successful Attacks',
        optimized: 'Optimized',
        templates: 'Templates',
        avgSuccess: 'Avg. Success'
      },
      tabs: {
        optimize: 'Optimize',
        analyze: 'Analyze',
        attacks: 'Successful Attacks',
        templates: 'Templates',
        history: 'History'
      },
      options: {
        ENHANCE: {
          label: 'Enhance',
          description: 'Make the existing prompt more effective'
        },
        COMBINE: {
          label: 'Combine',
          description: 'Combine successful prompts'
        },
        ADAPT: {
          label: 'Adapt',
          description: 'Adapt to a different target'
        },
        SIMPLIFY: {
          label: 'Simplify',
          description: 'Make it simpler and more effective'
        },
        OBFUSCATE: {
          label: 'Obfuscate',
          description: 'Make it harder to detect - multi-layered and sophisticated'
        }
      },
      originalPrompt: 'Original Prompt',
      originalPromptPlaceholder: 'Write the prompt you want to improve here...',
      optimizationType: 'Optimization Type',
      optimizeButton: 'Optimize',
      optimizing: 'Optimizing...',
      combineButton: 'Combine',
      combineTooltip: 'At least 2 successful attacks are required',
      optimizedPromptTitle: 'Optimized Prompt',
      optimizedPromptEmptyTitle: 'Optimized prompt will appear here',
      optimizedPromptEmptySubtitle: 'Enter a prompt and select an optimization type',
      comparison: {
        originalLabel: 'Original',
        optimizedLabel: 'Optimized',
        changeLabel: 'Change',
        wordUnit: 'words'
      },
      improvementsTitle: 'Improvements:',
      effectivenessLabel: 'Expected Effectiveness',
      riskLabel: 'Detection Risk',
      detectionRisk: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      },
      reasoningTitle: 'Why These Changes?',
      analyze: {
        title: 'Prompt Analysis',
        placeholder: 'Write the prompt you want to analyze here...',
        analyzing: 'Analyzing...',
        analyzeButton: 'Analyze',
        resultTitle: 'Analysis Result',
        scoreLabel: 'Overall Score',
        strengthsTitle: 'Strengths',
        weaknessesTitle: 'Weaknesses',
        suggestionsTitle: 'Suggestions',
        suggestionTypeAdd: 'Add',
        suggestionTypeRemove: 'Remove',
        suggestionTypeChange: 'Change',
        useForOptimize: 'Optimize This Prompt',
        emptyState: 'Analysis result will appear here'
      },
      attacks: {
        title: 'Successful Attacks',
        emptyTitle: 'No successful attacks yet',
        emptySubtitle: 'Successful attacks will be saved automatically',
        unknownTechnique: 'Unknown technique',
        attackPromptLabel: 'Attack Prompt:',
        targetResponseLabel: 'Target Response:',
        copy: 'Copy',
        optimize: 'Optimize'
      },
      templates: {
        title: 'Prompt Templates',
        seedButton: 'Load Defaults',
        emptyTitle: 'No templates yet',
        emptySubtitle: 'Click "Load Defaults" button',
        use: 'Use →'
      },
      history: {
        title: 'Optimization History',
        emptyTitle: 'No optimizations yet',
        successLabel: 'Success: ',
        deleteTitle: 'Delete',
        copy: 'Copy',
        reOptimize: 'Re-optimize'
      },
      errors: {
        optimizeFailed: 'Optimization failed: ',
        combineFailed: 'Combine failed: ',
        analyzeFailed: 'Analysis failed: '
      },
      help: {
        header: 'Prompt Optimizer helps you generate more effective and harder-to-detect prompts from successful attack examples.',
        optimizeTab: 'The Optimize tab lets you take a single prompt and improve it using different optimization types.',
        analyzeTab: 'The Analyze tab evaluates a prompt from a security perspective and highlights strengths, weaknesses and recommendations.',
        attacksTab: 'The Successful Attacks tab lists saved successful attacks for this project. From here you can optimize or copy their prompts.',
        templatesTab: 'The Templates tab shows reusable attack prompt templates that you can adapt to your own scenario.',
        historyTab: 'The History tab shows previous optimization attempts and their results.'
      }
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', language);
    }
  }, [language]);

  const t = (key, vars) => {
    const keys = key.split('.');
    const dict = translations[language] || translations.tr;
    let value = dict;
    for (const k of keys) {
      if (value && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value === 'string') {
      if (vars && typeof vars === 'object') {
        return Object.keys(vars).reduce((acc, vKey) => {
          const token = `{{${vKey}}}`;
          return acc.split(token).join(String(vars[vKey]));
        }, value);
      }
      return value;
    }

    // Array değerleri de destekle
    if (Array.isArray(value)) {
      return value;
    }

    return key;
  };

  const value = { language, setLanguage, t };

  return React.createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
