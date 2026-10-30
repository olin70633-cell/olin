import { useEffect, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import {
  ArrowUpRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Grid3X3,
  MapPin,
  Mic,
  RefreshCw,
  Search,
  Sun,
  Wind,
} from 'lucide-react';

const queryClient = new QueryClient();

type WeatherData = {
  place: string;
  temperature: number;
  feelsLike?: number;
  high?: number;
  low?: number;
  code: number;
  wind?: number;
};

type Story = {
  id: number;
  title: string;
  by: string;
  time: number;
  url?: string;
};

const GOOGLE_SERVICES = [
  { label: 'Google 검색', initial: 'G', href: 'https://www.google.com' },
  { label: 'Gmail', initial: 'M', href: 'https://mail.google.com' },
  { label: '지도', initial: '지', href: 'https://maps.google.com' },
  { label: 'YouTube', initial: '▶', href: 'https://www.youtube.com' },
  { label: '뉴스', initial: 'N', href: 'https://news.google.com' },
  { label: 'Drive', initial: '▲', href: 'https://drive.google.com' },
  { label: '캘린더', initial: '31', href: 'https://calendar.google.com' },
  { label: '사진', initial: 'P', href: 'https://photos.google.com' },
  { label: '번역', initial: '文', href: 'https://translate.google.com' },
];

function greetingFor(hour: number) {
  if (hour < 6) return '깊은 밤이네요';
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
}

function weatherLabel(code: number) {
  if (code === 0) return '맑음';
  if (code === 1 || code === 2) return '대체로 맑음';
  if (code === 3) return '흐림';
  if (code === 45 || code === 48) return '안개';
  if (code >= 51 && code <= 57) return '이슬비';
  if (code >= 61 && code <= 67) return '비';
  if (code >= 71 && code <= 77) return '눈';
  if (code >= 80 && code <= 82) return '소나기';
  if (code >= 85 && code <= 86) return '눈 소나기';
  if (code >= 95) return '뇌우';
  return '날씨 정보';
}

function WeatherIcon({ code }: { code: number }) {
  if (code === 0) return <Sun className="weather-icon" aria-hidden="true" />;
  if (code <= 2) return <CloudSun className="weather-icon" aria-hidden="true" />;
  if (code === 3) return <Cloud className="weather-icon" aria-hidden="true" />;
  if (code === 45 || code === 48) return <CloudFog className="weather-icon" aria-hidden="true" />;
  if (code >= 51 && code <= 57) return <CloudDrizzle className="weather-icon" aria-hidden="true" />;
  if (code >= 61 && code <= 67) return <CloudRain className="weather-icon" aria-hidden="true" />;
  if (code >= 95) return <CloudLightning className="weather-icon" aria-hidden="true" />;
  return <CloudSun className="weather-icon" aria-hidden="true" />;
}

function storyAge(timestamp: number) {
  const elapsed = Math.max(0, Math.floor(Date.now() / 1000 - timestamp));
  if (elapsed < 3600) return `${Math.max(1, Math.floor(elapsed / 60))}분 전`;
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}시간 전`;
  return `${Math.floor(elapsed / 86400)}일 전`;
}

function storySource(url?: string) {
  if (!url) return 'Hacker News';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Hacker News';
  }
}

function googleSearchUrl(query: string, lucky = false) {
  const params = new URLSearchParams({ q: query, hl: 'ko', gl: 'kr' });
  if (lucky) params.set('btnI', '1');
  return `https://www.google.com/search?${params.toString()}`;
}

function Home() {
  const [now, setNow] = useState(() => new Date());
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const [appsOpen, setAppsOpen] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [voiceError, setVoiceError] = useState(false);
  const appsRef = useRef<HTMLDivElement>(null);
  const selectedLocation = useRef<{ latitude: number; longitude: number; place: string } | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) setAppsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setAppsOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const loadWeather = async (coords?: { latitude: number; longitude: number; place: string }) => {
    setWeatherLoading(true);
    setWeatherError('');
    if (coords) selectedLocation.current = coords;
    try {
      let latitude = coords?.latitude ?? 37.5665;
      let longitude = coords?.longitude ?? 126.978;
      let place = coords?.place ?? '서울';
      if (!coords) {
        try {
          const geo = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=Seoul&count=1&language=ko&format=json');
          if (geo.ok) {
            const geoData = await geo.json();
            const result = geoData.results?.[0];
            if (result) {
              latitude = result.latitude;
              longitude = result.longitude;
              place = result.name || '서울';
            }
          }
        } catch {
          // Keep Seoul's known coordinates as a graceful geocoding fallback.
        }
      }
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone: 'Asia/Seoul',
        forecast_days: '1',
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!response.ok) throw new Error('날씨를 불러오지 못했어요.');
      const data = await response.json();
      setWeather({
        place,
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        high: Math.round(data.daily.temperature_2m_max?.[0]),
        low: Math.round(data.daily.temperature_2m_min?.[0]),
        code: data.current.weather_code,
        wind: Math.round(data.current.wind_speed_10m),
      });
    } catch {
      setWeatherError('날씨 정보를 가져오지 못했어요.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadNews = async () => {
    setNewsLoading(true);
    setNewsError('');
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');
      if (!response.ok) throw new Error('뉴스를 가져오지 못했어요.');
      const ids: number[] = await response.json();
      const items = await Promise.all(ids.slice(0, 14).map(async (id) => {
        const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!itemResponse.ok) return null;
        return itemResponse.json() as Promise<Story>;
      }));
      const available = items.filter((item): item is Story => Boolean(item?.title && item.by && item.time));
      setStories(available.slice(0, 5));
      if (!available.length) setNewsError('새로운 헤드라인이 아직 없어요.');
    } catch {
      setNewsError('헤드라인을 불러오지 못했어요.');
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    void loadWeather();
    void loadNews();
  }, []);

  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false,
  }).format(now));
  const timeText = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(now);
  const dateText = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(now);

  const submitSearch = (lucky = false) => {
    if (!query.trim()) return;
    window.location.assign(googleSearchUrl(query.trim(), lucky));
  };
  const refreshWeather = () => {
    if (selectedLocation.current) void loadWeather(selectedLocation.current);
    else void loadWeather();
  };

  const startVoiceSearch = () => {
    type SpeechResultEvent = Event & { results: { [index: number]: { [index: number]: { transcript: string } } } };
    type SpeechRecognitionInstance = {
      lang: string;
      interimResults: boolean;
      onresult: ((event: SpeechResultEvent) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    type SpeechWindow = Window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionAPI = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setVoiceError(true);
      setVoiceMessage('이 브라우저에서는 음성 검색을 지원하지 않아요.');
      return;
    }
    setVoiceError(false);
    setVoiceMessage('듣고 있어요…');
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setVoiceMessage('');
      window.location.assign(googleSearchUrl(transcript));
    };
    recognition.onerror = () => {
      setVoiceError(true);
      setVoiceMessage('음성을 인식하지 못했어요. 다시 시도해 주세요.');
    };
    recognition.onend = () => {
      setVoiceMessage((message) => message === '듣고 있어요…' ? '' : message);
    };
    try {
      recognition.start();
    } catch {
      setVoiceError(true);
      setVoiceMessage('마이크에 접근할 수 없어요. 권한을 확인해 주세요.');
    }
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setWeatherError('이 브라우저에서는 위치 기능을 사용할 수 없어요.');
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void loadWeather({
        latitude: coords.latitude,
        longitude: coords.longitude,
        place: '현재 위치',
      }),
      () => {
        setWeatherLoading(false);
        setWeatherError('위치 권한을 확인해 주세요. 서울 날씨는 계속 표시돼요.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <div className="page-shell">
      <header className="topbar" aria-label="Google 서비스">
        <a className="top-link" href="https://mail.google.com" target="_blank" rel="noreferrer">Gmail</a>
        <a className="top-link" href="https://www.google.com/imghp?hl=ko&gl=kr" target="_blank" rel="noreferrer">Images</a>
        <div className="apps-wrap" ref={appsRef}>
          <button className="apps-button" type="button" aria-label="Google 앱" aria-expanded={appsOpen} aria-haspopup="true" data-testid="button-google-apps" onClick={() => setAppsOpen((open) => !open)}>
            <Grid3X3 size={22} strokeWidth={1.8} />
          </button>
          {appsOpen && (
            <div className="apps-menu" role="menu" aria-label="Google 앱 목록">
              {GOOGLE_SERVICES.map((service) => (
                <a className="app-tile" key={service.label} href={service.href} target="_blank" rel="noreferrer" role="menuitem" onClick={() => setAppsOpen(false)}>
                  <span className="app-mark" aria-hidden="true">{service.initial}</span>
                  <span>{service.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="launch-area" aria-label="검색과 오늘">
          <div className="google-wordmark" role="img" aria-label="Google">
            <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
          </div>
          <p className="greeting" data-testid="text-greeting">{greetingFor(hour)}</p>
          <p className="clock" data-testid="text-seoul-clock" aria-label={`서울 시각 ${timeText}`}>{timeText}</p>
          <p className="date-line" data-testid="text-seoul-date">{dateText}</p>

          <form className="search-form" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch(); }} data-testid="form-google-search">
            <Search size={20} className="search-icon" aria-hidden="true" />
            <label className="sr-only" htmlFor="google-search">Google 검색</label>
            <input id="google-search" className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Google 검색 또는 URL 입력" autoComplete="off" data-testid="input-google-search" />
            <button className="icon-button voice" type="button" aria-label="음성 검색" title="음성 검색" onClick={startVoiceSearch} data-testid="button-voice-search">
              <Mic size={20} />
            </button>
          </form>
          <div className="search-actions">
            <button className="search-action" type="button" onClick={() => submitSearch()} data-testid="button-google-search">Google 검색</button>
            <button className="search-action" type="button" onClick={() => submitSearch(true)} data-testid="button-feeling-lucky">I'm Feeling Lucky</button>
          </div>
          <p className={`voice-note${voiceError ? ' error' : ''}`} aria-live="polite" data-testid="status-voice-search">{voiceMessage}</p>
        </section>

        <section className="dashboard" aria-label="오늘의 정보">
          <article className="widget weather-card" aria-label="현재 날씨">
            <div className="widget-heading">
              <span className="weather-place"><MapPin size={15} aria-hidden="true" />{weather?.place ?? '서울'} 날씨</span>
              <button className="subtle-button" type="button" aria-label="날씨 새로고침" title="날씨 새로고침" onClick={refreshWeather} data-testid="button-refresh-weather">
                <RefreshCw size={16} />
              </button>
            </div>
            {weatherLoading ? (
              <div className="news-status" role="status"><span className="skeleton-line" /> <span className="sr-only">날씨 불러오는 중</span></div>
            ) : weather ? (
              <>
                <div className="weather-main" data-testid="display-current-weather">
                  <WeatherIcon code={weather.code} />
                  <div>
                    <div className="temperature">{weather.temperature}<span className="temp-unit">°</span></div>
                    <div className="weather-condition">{weatherLabel(weather.code)}</div>
                  </div>
                </div>
                <div className="weather-meta">
                  {weather.feelsLike !== undefined && <span>체감 <strong>{weather.feelsLike}°</strong></span>}
                  {weather.high !== undefined && <span>최고 <strong>{weather.high}°</strong></span>}
                  {weather.low !== undefined && <span>최저 <strong>{weather.low}°</strong></span>}
                </div>
                <div className="weather-foot">
                  <span><Wind size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> 바람 {weather.wind ?? '—'} km/h</span>
                  <button className="location-action" type="button" onClick={refreshLocation} data-testid="button-current-location">현재 위치 <MapPin size={13} /></button>
                </div>
              </>
            ) : (
              <div className="news-status" role="status">
                <span>{weatherError || '날씨를 불러오지 못했어요.'}</span>
                <button className="retry-button" type="button" onClick={() => void loadWeather()} data-testid="button-retry-weather">다시 시도</button>
              </div>
            )}
            {weatherError && weather && <p className="news-meta" role="status">{weatherError}</p>}
          </article>

          <article className="widget news-card" aria-label="최신 기술 소식">
            <div className="news-heading">
              <h2 className="news-title">최신 기술 소식</h2>
              <span className="news-live"><span className="live-dot" /> Hacker News</span>
            </div>
            {newsLoading ? (
              <div role="status" aria-label="헤드라인 불러오는 중">
                {[0, 1, 2].map((index) => <div className="skeleton-row" key={index}><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}
              </div>
            ) : newsError ? (
              <div className="news-status" role="status">
                <span>{newsError}</span>
                <button className="retry-button" type="button" onClick={() => void loadNews()} data-testid="button-retry-news">다시 시도</button>
              </div>
            ) : stories.length === 0 ? (
              <div className="news-status">표시할 헤드라인이 없어요.</div>
            ) : stories.map((story, index) => (
              <a className="news-row" key={story.id} href={googleSearchUrl(story.title)} target="_blank" rel="noreferrer" data-testid={`link-news-story-${story.id}`}>
                <span className="news-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="news-copy">
                  <span className="headline">{story.title}</span>
                  <span className="news-meta">
                    <span>{storySource(story.url)}</span><span className="meta-dot">·</span>
                    <span>{story.by}</span><span className="meta-dot">·</span>
                    <time dateTime={new Date(story.time * 1000).toISOString()}>{storyAge(story.time)}</time>
                  </span>
                </span>
                <ArrowUpRight className="news-external" size={15} aria-hidden="true" />
              </a>
            ))}
          </article>
        </section>
      </main>
      <footer className="footer"><span className="footer-mark">Google</span><span>오늘을 여는 나만의 페이지</span></footer>
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
