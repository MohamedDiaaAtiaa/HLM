"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Stats animation
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [statYears, setStatYears] = useState(0);
  const [statCases, setStatCases] = useState(0);
  const [statClients, setStatClients] = useState(0);

  // Form State
  const [formStatus, setFormStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

  useEffect(() => {
    // Apply lang to document
    if (lang === 'en') {
      document.documentElement.setAttribute('lang', 'en');
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.classList.add('ltr');
      document.title = 'HLM Law Advocates & Legal Consultants | H.L.M';
    } else {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.classList.remove('ltr');
      document.title = 'H.L.M للاستشارات القانونية | HLM Law Advocates & Legal Consultants';
    }
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Simple parallax
      const heroContent = document.querySelector('.hero-content') as HTMLElement;
      if (heroContent && window.scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${window.scrollY * 0.15}px)`;
        heroContent.style.opacity = `${1 - (window.scrollY / (window.innerHeight * 0.8))}`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Intersection Observer for Reveal
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal-section').forEach(el => revealObserver.observe(el));

    // Stats observer
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          animateValue(setStatYears, 15, 2000);
          animateValue(setStatCases, 500, 2000);
          animateValue(setStatClients, 200, 2000);
        }
      });
    }, { threshold: 0.5 });
    
    const statsContainer = document.querySelector('.about-stats');
    if (statsContainer) statsObserver.observe(statsContainer);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
      statsObserver.disconnect();
    };
  }, [statsAnimated]);

  const animateValue = (setter: any, target: number, duration: number) => {
    const startTime = performance.now();
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const target = document.getElementById(targetId);
    if (target) {
      const navHeight = 80; // approximate
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      service: formData.get('service'),
      message: formData.get('message'),
      lang: lang
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setFormStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      setFormStatus('error');
    }

    setTimeout(() => {
      setFormStatus('idle');
    }, 7000);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-container">
          <Link href="#" className="nav-logo" onClick={(e) => handleNavClick(e, 'hero')}>
            <Image src="/images/Logo.png" alt="HLM Logo" width={42} height={42} className="nav-logo-img" loading="eager" priority />
            <div className="nav-logo-text">
              <span className="logo-text">H.L.M</span>
              <span className="logo-sub">
                {lang === 'ar' ? 'محامون ومستشارون قانونيون' : 'Law Advocates & Legal Consultants'}
              </span>
            </div>
          </Link>

          <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`} id="nav-links">
            <li><a href="#hero" onClick={e => handleNavClick(e, 'hero')}>{lang === 'ar' ? 'الرئيسية' : 'Home'}</a></li>
            <li><a href="#about" onClick={e => handleNavClick(e, 'about')}>{lang === 'ar' ? 'من نحن' : 'About Us'}</a></li>
            <li><a href="#services" onClick={e => handleNavClick(e, 'services')}>{lang === 'ar' ? 'خدماتنا' : 'Services'}</a></li>
            <li><a href="#why-us" onClick={e => handleNavClick(e, 'why-us')}>{lang === 'ar' ? 'لماذا نحن' : 'Why Us'}</a></li>
            <li><a href="#vision" onClick={e => handleNavClick(e, 'vision')}>{lang === 'ar' ? 'رؤيتنا' : 'Vision'}</a></li>
            <li><a href="#contact" onClick={e => handleNavClick(e, 'contact')}>{lang === 'ar' ? 'تواصل معنا' : 'Contact'}</a></li>
          </ul>

          <div className="nav-actions">
            <button className="lang-toggle" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
              <span className={lang === 'ar' ? 'lang-active' : 'lang-inactive'}>AR</span>
              <span className="lang-separator">|</span>
              <span className={lang === 'en' ? 'lang-active' : 'lang-inactive'}>EN</span>
            </button>
            <button className={`nav-menu-btn ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="menu-line"></span>
              <span className="menu-line"></span>
              <span className="menu-line"></span>
            </button>
          </div>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-gradient-overlay"></div>
        <div className="hero-watermark">
          <Image src="/images/Logo.png" alt="HLM Law Firm Watermark" width={500} height={500} />
        </div>
        <div className="hero-split">
          <div className="hero-content">
            <div className="hero-badge">
              {lang === 'ar' ? 'محامون ومستشارون قانونيون' : 'Law Advocates & Legal Consultants'}
            </div>
            {lang === 'ar' ? (
              <h1 className="hero-title">شريكك القانوني لحماية<br/>أعمالك واستثماراتك</h1>
            ) : (
              <h1 className="hero-title">Your Legal Partner to Protect Your Business & Investments</h1>
            )}
            <p className="hero-subtitle">
              {lang === 'ar' ? 'حلول قانونية متكاملة في الشركات، العقود، والمنازعات داخل مصر وخارجها' 
                : 'Comprehensive legal solutions in corporate, contracts, and disputes across Egypt and beyond'}
            </p>
            <div className="hero-cta">
              <a href="#contact" onClick={e => handleNavClick(e, 'contact')} className="btn btn-primary">{lang === 'ar' ? 'احجز استشارة' : 'Book a Consultation'}</a>
              <a href="#about" onClick={e => handleNavClick(e, 'about')} className="btn btn-outline">{lang === 'ar' ? 'تعرف علينا' : 'About Us'}</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-banner-frame">
              <Image src="/images/Banner - Hero.png" alt="Hero Banner" width={520} height={700} className="hero-banner-img" style={{ width: 'auto', height: '100%', objectFit: 'cover' }} priority />
              <div className="hero-banner-border"></div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-line"></div>
        </div>
      </section>

      <section className="section about" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content reveal-section">
              <span className="section-label">{lang === 'ar' ? 'من نحن' : 'About Us'}</span>
              {lang === 'ar' ? (
                <h2 className="section-title">خبرة قانونية راسخة<br/>في خدمة أعمالك</h2>
              ) : (
                <h2 className="section-title">Deep Legal Expertise at the Service of Your Business</h2>
              )}
              <p className="about-text">
                {lang === 'ar' ? 
                  'H.L.M للاستشارات القانونية هو مكتب محاماة متخصص يقدم حلولاً قانونية استراتيجية في القانون التجاري، هيكلة الشركات، النزاعات العقارية، والتحكيم الدولي. نعمل مع مؤسسات ومستثمرين يسعون لحماية مصالحهم بأعلى معايير الاحترافية.' :
                  'H.L.M Legal Consultants is a specialized law firm delivering strategic legal solutions in commercial law, corporate structuring, real estate disputes, and international arbitration. We serve institutions and investors seeking to protect their interests with the highest standards of professionalism.'
                }
              </p>
              <p className="about-text">
                {lang === 'ar' ?
                  'نؤمن بأن القانون ليس مجرد نصوص، بل أداة استراتيجية لحماية المصالح وتحقيق الأهداف التجارية. لذلك نقدم لعملائنا رؤية قانونية شاملة تجمع بين العمق الأكاديمي والخبرة العملية.' :
                  'We believe that law is not merely text — it is a strategic instrument for protecting interests and achieving business objectives. That\'s why we provide our clients with a comprehensive legal perspective combining academic depth with practical experience.'
                }
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-number">{statYears}+</span>
                  <span className="stat-label">{lang === 'ar' ? 'سنوات خبرة' : 'Years Experience'}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">{statCases}+</span>
                  <span className="stat-label">{lang === 'ar' ? 'قضية ناجحة' : 'Successful Cases'}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">{statClients}+</span>
                  <span className="stat-label">{lang === 'ar' ? 'عميل مؤسسي' : 'Corporate Clients'}</span>
                </div>
              </div>
            </div>
            <div className="about-visual reveal-section">
              <div className="about-visual-inner">
                <div className="visual-frame"></div>
                <div className="visual-accent"></div>
                <Image src="/images/Logo.png" alt="HLM Monogram" width={200} height={200} className="about-logo-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section services" id="services">
        <div className="container">
          <div className="section-header reveal-section">
            <span className="section-label">{lang === 'ar' ? 'خدماتنا' : 'Our Services'}</span>
            <h2 className="section-title">{lang === 'ar' ? 'حلول قانونية شاملة ومتخصصة' : 'Comprehensive & Specialized Legal Solutions'}</h2>
          </div>

          <div className="services-grid">
            <div className="service-card reveal-section">
              <div className="service-icon">
                {/* SVG 1 */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4L40 12V20C40 31.05 33.18 41.22 24 44C14.82 41.22 8 31.05 8 20V12L24 4Z" stroke="#C6A85C" strokeWidth="1.5" />
                  <path d="M18 24L22 28L30 20" stroke="#C6A85C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="service-title">{lang === 'ar' ? 'القانون التجاري والشركات' : 'Commercial & Corporate Law'}</h3>
              <p className="service-desc">{lang === 'ar' ? 'تأسيس الشركات، صياغة العقود التجارية، الاندماج والاستحواذ، وحوكمة الشركات بما يتوافق مع القوانين المصرية والدولية.' : 'Company formation, commercial contract drafting, mergers & acquisitions, and corporate governance in compliance with Egyptian and international laws.'}</p>
              <div className="service-line"></div>
            </div>

            <div className="service-card reveal-section">
              <div className="service-icon">
                {/* SVG 2 */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="18" stroke="#C6A85C" strokeWidth="1.5"/>
                  <path d="M24 6V24L34 34" stroke="#C6A85C" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="service-title">{lang === 'ar' ? 'المنازعات التجارية والمدنية' : 'Commercial & Civil Disputes'}</h3>
              <p className="service-desc">{lang === 'ar' ? 'تمثيل قانوني احترافي في النزاعات التجارية والمدنية أمام جميع درجات المحاكم والجهات القضائية المختصة.' : 'Professional legal representation in commercial and civil disputes before all court levels and competent judicial authorities.'}</p>
              <div className="service-line"></div>
            </div>

            <div className="service-card reveal-section">
              <div className="service-icon">
                {/* SVG 3 */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 42V20L24 6L40 20V42H8Z" stroke="#C6A85C" strokeWidth="1.5"/>
                  <path d="M18 42V30H30V42" stroke="#C6A85C" strokeWidth="1.5"/>
                  <line x1="24" y1="20" x2="24" y2="26" stroke="#C6A85C" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 className="service-title">{lang === 'ar' ? 'القضايا العقارية والأراضي' : 'Real Estate & Land Disputes'}</h3>
              <p className="service-desc">{lang === 'ar' ? 'معالجة النزاعات العقارية، قضايا الملكية والحيازة، وتسجيل العقارات والأراضي وفقاً للإطار القانوني المصري.' : 'Handling real estate disputes, ownership and possession cases, and property registration within the Egyptian legal framework.'}</p>
              <div className="service-line"></div>
            </div>

            <div className="service-card reveal-section">
              <div className="service-icon">
                {/* SVG 4 */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 6L6 18V42H18V30H30V42H42V18L24 6Z" stroke="#C6A85C" strokeWidth="1.5"/>
                  <line x1="6" y1="42" x2="42" y2="42" stroke="#C6A85C" strokeWidth="1.5"/>
                  <line x1="24" y1="18" x2="24" y2="6" stroke="#C6A85C" strokeWidth="1.5"/>
                  <circle cx="24" cy="22" r="4" stroke="#C6A85C" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 className="service-title">{lang === 'ar' ? 'التحكيم وتسوية المنازعات' : 'Arbitration & Dispute Resolution'}</h3>
              <p className="service-desc">{lang === 'ar' ? 'إدارة إجراءات التحكيم المحلي والدولي، والوساطة وتسوية النزاعات بالطرق البديلة لتحقيق أفضل النتائج.' : 'Managing local and international arbitration proceedings, mediation, and alternative dispute resolution to achieve optimal outcomes.'}</p>
              <div className="service-line"></div>
            </div>

            <div className="service-card reveal-section">
              <div className="service-icon">
                 {/* SVG 5 */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="32" height="24" rx="2" stroke="#C6A85C" strokeWidth="1.5"/>
                  <line x1="8" y1="32" x2="40" y2="32" stroke="#C6A85C" strokeWidth="1.5"/>
                  <line x1="20" y1="32" x2="20" y2="40" stroke="#C6A85C" strokeWidth="1.5"/>
                  <line x1="28" y1="32" x2="28" y2="40" stroke="#C6A85C" strokeWidth="1.5"/>
                  <line x1="16" y1="40" x2="32" y2="40" stroke="#C6A85C" strokeWidth="1.5"/>
                  <circle cx="24" cy="20" r="6" stroke="#C6A85C" strokeWidth="1.5"/>
                  <path d="M24 17V20L26 22" stroke="#C6A85C" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="service-title">{lang === 'ar' ? 'الاستشارات القانونية أونلاين' : 'Online Legal Consultations'}</h3>
              <p className="service-desc">{lang === 'ar' ? 'خدمة استشارات قانونية عن بُعد لعملائنا في مصر والخليج، مع ضمان نفس مستوى الجودة والسرية والاحترافية.' : 'Remote legal consultation services for our clients in Egypt and the Gulf, ensuring the same level of quality, confidentiality, and professionalism.'}</p>
              <div className="service-line"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section why-us" id="why-us">
        <div className="container">
          <div className="section-header reveal-section">
            <span className="section-label">{lang === 'ar' ? 'لماذا نحن' : 'Why Choose Us'}</span>
            <h2 className="section-title">{lang === 'ar' ? 'ما يميزنا عن غيرنا' : 'What Sets Us Apart'}</h2>
          </div>
          <div className="why-grid">
            <div className="why-item reveal-section">
              <div className="why-number">01</div>
              <h3 className="why-title">{lang === 'ar' ? 'خبرة عملية في القضايا المعقدة' : 'Practical Experience in Complex Cases'}</h3>
              <p className="why-desc">{lang === 'ar' ? 'تعاملنا مع مئات القضايا المعقدة يمنحنا رؤية قانونية عميقة ونهجاً استراتيجياً فريداً في كل ملف نتولاه.' : 'Our handling of hundreds of complex cases gives us deep legal insight and a unique strategic approach to every file we undertake.'}</p>
            </div>
            <div className="why-item reveal-section">
              <div className="why-number">02</div>
              <h3 className="why-title">{lang === 'ar' ? 'فهم السوق المصري والخليجي' : 'Deep Understanding of Egyptian & Gulf Markets'}</h3>
              <p className="why-desc">{lang === 'ar' ? 'نفهم تعقيدات البيئة القانونية والتجارية في مصر ودول الخليج، مما يتيح لنا تقديم مشورة قانونية دقيقة وفعالة.' : 'We understand the complexities of the legal and business environment in Egypt and the Gulf, enabling us to provide precise and effective counsel.'}</p>
            </div>
            <div className="why-item reveal-section">
              <div className="why-number">03</div>
              <h3 className="why-title">{lang === 'ar' ? 'حلول قانونية عملية' : 'Practical Legal Solutions'}</h3>
              <p className="why-desc">{lang === 'ar' ? 'لا نقدم نصوصاً قانونية جامدة. نصمم حلولاً قانونية عملية قابلة للتنفيذ تحقق أهداف عملائنا بأقل التكاليف والمخاطر.' : 'We don\'t offer rigid legal texts. We design actionable legal solutions that achieve our clients\' goals with minimal costs and risks.'}</p>
            </div>
            <div className="why-item reveal-section">
              <div className="why-number">04</div>
              <h3 className="why-title">{lang === 'ar' ? 'سرعة الاستجابة' : 'Rapid Response'}</h3>
              <p className="why-desc">{lang === 'ar' ? 'نؤمن بأن الوقت عامل حاسم في القضايا القانونية. لذلك نلتزم بأسرع وقت استجابة ممكن لجميع عملائنا.' : 'We believe time is a critical factor in legal matters. That\'s why we commit to the fastest possible response time for all our clients.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section vision" id="vision">
        <div className="container">
          <div className="vision-content reveal-section">
            <div className="vision-line-top"></div>
            <span className="section-label">{lang === 'ar' ? 'رؤيتنا' : 'Our Vision'}</span>
            <blockquote className="vision-quote">
              {lang === 'ar' ? 'أن نصبح من المكاتب القانونية الرائدة في مصر والخليج، وأن نكون الخيار الأول للمؤسسات والمستثمرين الباحثين عن شريك قانوني يتميز بالخبرة والاحترافية والنزاهة.' : 'To become one of the leading law firms in Egypt and the Gulf, and to be the first choice for institutions and investors seeking a legal partner distinguished by expertise, professionalism, and integrity.'}
            </blockquote>
            <div className="vision-line-bottom"></div>
          </div>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="container">
          <div className="contact-wrapper reveal-section">
            <div className="contact-info">
              <span className="section-label">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</span>
              <h2 className="section-title">{lang === 'ar' ? 'ابدأ الآن بحماية أعمالك واستثماراتك' : 'Start Protecting Your Business & Investments Today'}</h2>
              <p className="contact-text">{lang === 'ar' ? 'فريقنا من المحامين والمستشارين جاهز للرد على استفساراتك وتقديم الدعم القانوني الذي تحتاجه.' : 'Our team of advocates and consultants is ready to answer your inquiries and provide the legal support you need.'}</p>
              
              <ul className="contact-details">
                <li>
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="contact-detail-content">
                    <strong>{lang === 'ar' ? 'المقر الرئيسي' : 'Headquarters'}</strong>
                    <a href="https://www.google.com/maps/search/?api=1&query=30.093348,31.318370" target="_blank" className="location-link" rel="noreferrer">
                      <span>{lang === 'ar' ? 'بجوار الخطوط السعودية - سكاي تيم' : 'Near Saudia SkyTeam Airlines'}</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div className="contact-detail-content">
                    <strong>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</strong>
                    <a href="mailto:info@hlm-legal.com">info@hlm-legal.com</a>
                  </div>
                </li>
                <li>
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"></path>
                    </svg>
                  </div>
                  <div className="contact-detail-content">
                    <strong>{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</strong>
                    <a href="tel:+201005580242" dir="ltr">01005580242</a>
                    <a href="https://wa.me/201005580242" className="whatsapp-inline" target="_blank" rel="noreferrer">
                      <svg className="whatsapp-icon-inline" width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                      </svg>
                      <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                    </a>
                  </div>
                </li>
              </ul>

              <div className="location-box">
                <h4 className="location-header">{lang === 'ar' ? 'موقعنا على الخريطة' : 'Visit Our Office'}</h4>
                <div className="map-frame">
                  <iframe 
                    src="https://maps.google.com/maps?q=30.093348,31.318370&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=30.093348,31.318370" target="_blank" className="map-direct-link" rel="noreferrer">
                  <span>{lang === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="contact-form-container">
              <form className="contact-form" onSubmit={submitForm}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                    <input type="text" id="name" name="name" className="form-control" required placeholder=" " />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                    <input type="tel" id="phone" name="phone" className="form-control" required placeholder=" " />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input type="email" id="email" name="email" className="form-control" required placeholder=" " />
                </div>
                <div className="form-group">
                  <label htmlFor="service">{lang === 'ar' ? 'نوع الاستشارة' : 'Consultation Type'}</label>
                  <select id="service" name="service" className="form-control" required defaultValue="">
                    <option value="" disabled>{lang === 'ar' ? 'اختر الخدمة المطلوبة' : 'Select required service'}</option>
                    <option value="commercial">{lang === 'ar' ? 'القانون التجاري والشركات' : 'Commercial & Corporate Law'}</option>
                    <option value="disputes">{lang === 'ar' ? 'المنازعات التجارية والمدنية' : 'Commercial & Civil Disputes'}</option>
                    <option value="realestate">{lang === 'ar' ? 'القضايا العقارية والأراضي' : 'Real Estate & Land Disputes'}</option>
                    <option value="arbitration">{lang === 'ar' ? 'التحكيم وتسوية المنازعات' : 'Arbitration & Dispute Resolution'}</option>
                    <option value="other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="message">{lang === 'ar' ? 'تفاصيل الاستشارة' : 'Consultation Details'}</label>
                  <textarea id="message" name="message" className="form-control" rows={4} required placeholder=" "></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-submit" disabled={formStatus === 'sending'}>
                  <span>{formStatus === 'sending' ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال الطلب' : 'Send Request')}</span>
                </button>
                <div className={`form-status ${formStatus === 'success' ? 'success' : formStatus === 'error' ? 'error' : ''}`}>
                  {formStatus === 'success' && (lang === 'ar' ? '✓ تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.' : '✓ Your message was sent successfully. We will be in touch soon.')}
                  {formStatus === 'error' && (lang === 'ar' ? '⚠ حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.' : '⚠ Something went wrong. Please try again or contact us directly.')}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="footer-border"></div>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <Image src="/images/Logo.png" alt="HLM Logo" width={42} height={42} className="footer-logo-img" />
                <div className="footer-logo-text">
                  <span className="logo-text">H.L.M</span>
                  <span className="logo-sub">{lang === 'ar' ? 'محامون ومستشارون قانونيون' : 'Law Advocates & Legal Consultants'}</span>
                </div>
              </div>
              <p className="footer-tagline">{lang === 'ar' ? 'شريكك القانوني لحماية أعمالك واستثماراتك' : 'Your Legal Partner to Protect Your Business & Investments'}</p>
            </div>
            <div className="footer-contact">
              <h4 className="footer-heading">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</h4>
              <ul className="footer-contact-list">
                <li><span>01005580242</span></li>
                <li><span>info@hlm-legal.com</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{lang === 'ar' ? '© 2026 حسن ولقمان ومراد — محامون ومستشارون قانونيون. جميع الحقوق محفوظة.' : '© 2026 Hassan, Loqman & Mourad — Law Advocates & Legal Consultants. All rights reserved.'}</p>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/201005580242" className="whatsapp-float" target="_blank" aria-label="Chat on WhatsApp" rel="noreferrer">
        <svg className="whatsapp-icon-svg" viewBox="0 0 448 512" fill="currentColor">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>
    </>
  );
}
