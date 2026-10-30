import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowDownRight, ArrowRight, Award, ExternalLink, Menu, X } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const navItems = [
    { href: '#about', label: '소개' },
    { href: '#work', label: '작은 프로젝트' },
    { href: '#journey', label: '배움의 기록' },
    { href: '#contact', label: '연결하기' },
  ];

  return (
    <div className="portfolio-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand-mark" href="#top" aria-label="김민준 포트폴리오 맨 위로" data-testid="link-home">
            <span className="brand-dot" /> MINJUN.KIM
          </a>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            aria-controls="portfolio-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="button-menu-toggle"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <nav id="portfolio-navigation" className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="페이지 메뉴">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu} data-testid={`link-nav-${item.href.slice(1)}`}>
                {item.label}
              </a>
            ))}
            <a className="nav-contact" href="https://github.com/olin70633-cell" target="_blank" rel="noreferrer" data-testid="link-nav-github">
              GitHub <ExternalLink size={13} />
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">A FRONTEND LEARNER, IN PROGRESS</div>
            <h1 className="hero-title" id="hero-title">
              안녕하세요,<br />
              김민준<span className="accent">입니다.</span>
            </h1>
            <p className="hero-subtitle">
              하나씩 배우고, 막히면 질문하며 앞으로 나아가는<br className="desktop-break" />
              <strong>프론트엔드 개발자 지망생</strong>입니다.
            </p>
            <div className="hero-actions">
              <a className="button-primary" href="#work" data-testid="link-view-work">
                작은 프로젝트 보기 <ArrowDownRight size={16} />
              </a>
              <a className="button-quiet" href="https://github.com/olin70633-cell" target="_blank" rel="noreferrer" data-testid="link-github">
                GitHub 방문 <ExternalLink size={14} />
              </a>
            </div>
            <div className="hero-note"><span /> 배우는 과정을 솔직하게 기록합니다</div>
          </div>

          <div className="hero-art" aria-label="코드 에디터에서 영감을 받은 장식" role="img">
            <div className="hero-grid" />
            <div className="orbit" />
            <div className="floating-tag tag-one">learning / 01</div>
            <div className="floating-tag tag-two">HTML · CSS</div>
            <div className="editor-window">
              <div className="editor-topbar">
                <span className="editor-lights"><i /><i /><i /></span>
                <span className="editor-title">learning-notes</span>
              </div>
              <div className="editor-content" aria-hidden="true">
                <div className="code-line"><span className="line-number">01</span><span><span className="code-muted">&lt;!-- 오늘도 한 줄씩 --&gt;</span></span></div>
                <div className="code-line"><span className="line-number">02</span><span><span className="code-blue">&lt;section</span> <span className="code-gold">class</span>=<span className="code-mint">"learning"</span><span className="code-blue">&gt;</span></span></div>
                <div className="code-line"><span className="line-number">03</span><span>  <span className="code-blue">&lt;h1&gt;</span>배우는 중<span className="code-blue">&lt;/h1&gt;</span></span></div>
                <div className="code-line"><span className="line-number">04</span><span>  <span className="code-blue">&lt;a</span> <span className="code-gold">href</span>=<span className="code-mint">"#next"</span><span className="code-blue">&gt;</span></span></div>
                <div className="code-line"><span className="line-number">05</span><span>    다음으로 <span className="code-blue">&lt;/a&gt;</span></span></div>
                <div className="code-line"><span className="line-number">06</span><span><span className="code-blue">&lt;/section&gt;</span></span></div>
              </div>
              <div className="editor-status"><span>HTML · CSS</span><span>계속 배우는 중</span></div>
            </div>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-heading">
          <div className="section-wrap about-grid">
            <div>
              <div className="section-kicker">01 / ABOUT ME</div>
              <h2 className="section-heading" id="about-heading">천천히, 꼼꼼하게<br />내 것으로 만드는 중</h2>
              <div className="quote-card">
                <div className="quote-label">MY OWN DESCRIPTION</div>
                <div className="quote-main">“진흙으로 만든 보석”</div>
                <p className="quote-caption">아직 다듬어 가는 중인 저를 표현하는 말입니다.</p>
              </div>
            </div>
            <div className="about-copy">
              <p>처음 개발을 생각한 이유는 <strong>생계를 이어갈 수 있는 선택지처럼 보였기 때문</strong>입니다. 배우기 시작하고 나서는, 내가 쓴 코드로 화면이 만들어지는 일이 신기하고 재미있었습니다.</p>
              <p>아직은 기초를 익히는 단계입니다. 모르는 부분을 그냥 넘기기보다 살펴보고, 필요할 때 질문하는 <strong>신중함</strong>을 제 강점으로 삼아 차근차근 실력을 쌓고 있습니다.</p>
              <p>잘 아는 척하기보다 지금 할 수 있는 것과 아직 배워야 할 것을 분명히 말하는 개발자가 되고 싶습니다.</p>
              <div className="trait-row" aria-label="키워드">
                <span className="trait-chip">신중함</span>
                <span className="trait-chip">기초부터 차근차근</span>
                <span className="trait-chip">질문하며 배우기</span>
              </div>
            </div>
          </div>
        </section>

        <section className="work-section" id="work" aria-labelledby="work-heading">
          <div className="section-wrap">
            <div className="work-top">
              <div>
                <div className="section-kicker">02 / HTML + CSS</div>
                <h2 className="section-heading" id="work-heading">HTML·CSS로 만든<br />웹 페이지</h2>
                <p className="section-intro">큰 결과보다, 직접 부딪히며 배운 과정을 먼저 소개합니다.</p>
              </div>
              <div className="work-index">PROJECT NOTE&nbsp;&nbsp;—&nbsp;&nbsp;01</div>
            </div>
            <article className="project-card" aria-label="HTML과 CSS를 사용한 웹 페이지 제작 연습">
              <div className="project-visual" aria-hidden="true">
                <div className="browser-card">
                  <div className="browser-head"><i /><i /><i /><span className="browser-address" /></div>
                  <div className="browser-body">
                    <div className="browser-label">HTML / CSS PRACTICE</div>
                    <div className="browser-headline">배운 것을<br />화면으로 연결하기</div>
                    <div className="browser-line" /><div className="browser-line short" />
                    <div className="browser-button" />
                  </div>
                </div>
                <div className="project-caption">HTML / CSS · 링크 연결 연습</div>
              </div>
              <div className="project-info">
                <div className="project-number">01 — LEARNING BY DOING</div>
                <h3 className="project-title">HTML · CSS 웹 페이지</h3>
                <p className="project-desc">혼자 전체 진행을 맡아 HTML과 CSS로 웹 페이지를 만들어 본 경험입니다. 요소를 배치하고 링크를 연결하면서 웹 페이지가 만들어지는 과정을 익혔습니다.</p>
                <div className="project-meta">
                  <span className="meta-pill">HTML</span><span className="meta-pill">CSS</span><span className="meta-pill">링크 연결</span>
                </div>
                <div className="project-learning">
                  <strong>막힘을 배움으로 바꾸기</strong>
                  링크 연결과 div 활용이 어려워 선생님께 도움을 요청했습니다. 질문을 통해 방법을 배우며, 웹사이트를 이렇게 만들 수 있다는 점을 알게 됐습니다.
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="journey-section" id="journey" aria-labelledby="journey-heading">
          <div className="section-wrap">
            <div className="section-kicker">03 / LEARNING LOG</div>
            <h2 className="section-heading" id="journey-heading">배움은 지금도<br />진행 중입니다.</h2>
            <p className="section-intro">기초를 쌓고, 관심을 넓히며, 다음 목표를 준비하고 있습니다.</p>
            <div className="journey-grid">
              <div>
                <div className="journey-label">LEARNING</div>
                <div className="learning-list">
                  <div className="learning-item">
                    <span className="learning-num">01</span>
                    <div><h3>JavaScript와 C언어 기초</h3><p>프로그래밍의 기본 개념을 배우고 있습니다.</p></div>
                  </div>
                  <div className="learning-item">
                    <span className="learning-num">02</span>
                    <div><h3>멀티미디어콘텐츠제작</h3><p>콘텐츠 제작 과정을 함께 익혔습니다.</p></div>
                  </div>
                  <div className="learning-item">
                    <span className="learning-num">03</span>
                    <div><h3>AI 사용법</h3><p>AI 도구를 올바르게 활용하는 방법을 배우고 있습니다.</p></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="journey-label">ACTIVITIES & NEXT STEP</div>
                <div className="learning-list">
                  <div className="learning-item">
                    <span className="learning-num">A</span>
                    <div><h3>프로그래밍 취업반</h3><p>프로그래밍을 배우며 진로를 준비하고 있습니다.</p></div>
                  </div>
                  <div className="learning-item">
                    <span className="learning-num">B</span>
                    <div><h3>멀티미디어콘텐츠제작전문가반</h3><p>멀티미디어 콘텐츠 제작을 배웠습니다.</p></div>
                  </div>
                </div>
                <div className="path-card">
                  <span className="path-label">UP NEXT / LEARNING GOAL</span>
                  <h3>프로그래밍 기능사</h3>
                  <p>앞으로 준비해 보고 싶은 다음 학습 목표입니다.</p>
                  <span className="path-arrow">기초를 더 단단하게 <ArrowRight size={13} /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="credential-section" aria-labelledby="credential-heading">
          <div className="section-wrap credential-row">
            <div>
              <div className="section-kicker">04 / CERTIFICATE</div>
              <h2 className="section-heading" id="credential-heading">배운 것을<br />하나씩 확인합니다.</h2>
              <div className="certificate-box">
                <span className="certificate-icon"><Award size={21} /></span>
                <span><small>CERTIFICATE</small><strong>ITQ 엑셀</strong></span>
              </div>
            </div>
            <div className="credential-side">
              <span>A NOTE TO MY FUTURE SELF</span>
              <p>급하게 앞서가기보다,<br />배운 것을 제 것으로.</p>
              <small>오늘의 배움이 내일의 기초가 되도록.</small>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="section-wrap">
            <div className="contact-panel">
              <div className="contact-copy">
                <div className="section-kicker">LET'S CONNECT</div>
                <h2 className="section-heading" id="contact-heading">배우는 기록을<br />계속 이어갑니다.</h2>
                <p>현재의 학습 과정을 더 보고 싶다면 GitHub에서 만나 보세요.</p>
              </div>
              <a className="contact-link" href="https://github.com/olin70633-cell" target="_blank" rel="noreferrer" data-testid="link-contact-github">
                김민준의 GitHub <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand-mark" href="#top" data-testid="link-footer-home"><span className="brand-dot" /> MINJUN.KIM</a>
        <span>김민준 · 프론트엔드 개발자 지망생</span>
        <span>계속 배우고 있습니다.</span>
      </footer>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
