import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, ChevronDown, Mail, Instagram, Twitter, Film, BookOpen, User, ArrowRight, Menu } from 'lucide-react';

// -----------------------------------------------------------------------------
// 组件：顶部导航菜单 (Navbar)
// -----------------------------------------------------------------------------
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' 
          : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <div 
          className={`font-serif font-bold text-xl text-stone-200 tracking-widest cursor-pointer transition-opacity duration-500 ${
            isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          MXT
        </div>

        <div className="flex items-center gap-8 md:gap-12">
          {['About', 'Works', 'Journal', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-[10px] md:text-xs font-sans font-medium tracking-[0.25em] text-stone-400 hover:text-white uppercase transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// -----------------------------------------------------------------------------
// 核心算法：生成 3D 城市建筑群 (无描边 + 银灰灯光)
// -----------------------------------------------------------------------------
const generate3DCity = (width, canvasHeight) => {
  const buildings = [];
  const centerX = width / 2;
  
  let currentX = -50;
  
  while (currentX < width + 50) {
    const w = 40 + Math.random() * 60;
    const h = 100 + Math.random() * 300;
    const depth = 10 + Math.random() * 30;
    
    const distToCenter = currentX + w/2 - centerX;
    const sideVisible = distToCenter < 0 ? 'right' : 'left'; 
    const perspectiveFactor = Math.abs(distToCenter) / (width / 2);
    const projectedSideWidth = depth * (0.2 + perspectiveFactor * 0.8);

    const winSize = 3;
    const gap = 4;
    const rows = Math.floor((h - 20) / (winSize + gap));
    
    const density = 0.85 + Math.random() * 0.1;
    
    const windows = [];
    const cols = Math.floor((w - 10) / (winSize + gap));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > density) { 
            windows.push({
              x: 5 + c * (winSize + gap),
              y: 10 + r * (winSize + gap),
              w: winSize, 
              h: winSize,
              opacity: 0.3 + Math.random() * 0.5 // 降低透明度，减少干扰
            });
        }
      }
    }

    const sideWindows = [];
    const sideCols = Math.floor((depth - 5) / (winSize + gap));

    if (sideCols > 0) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < sideCols; c++) {
          if (Math.random() > density) {
             sideWindows.push({
               relX: 2 + c * (winSize + gap),
               relY: 10 + r * (winSize + gap),
               w: winSize,
               h: winSize,
               opacity: 0.3 + Math.random() * 0.5
             });
          }
        }
      }
    }

    buildings.push({
      x: currentX,
      y: canvasHeight,
      w, h, depth, 
      sideVisible,
      projectedSideWidth,
      windows,
      sideWindows, 
      zIndex: Math.floor(h)
    });
    
    currentX += w + projectedSideWidth * 0.5 - 2;
  }
  
  return buildings;
};

// -----------------------------------------------------------------------------
// 组件：3D 城市天际线 (No Stroke - 纯色块渲染)
// -----------------------------------------------------------------------------
const CitySkyline3D = () => {
  const vbWidth = 1440;
  const vbHeight = 500;
  const buildings = useMemo(() => generate3DCity(vbWidth, vbHeight), []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-[55vh] pointer-events-none z-20 overflow-hidden select-none flex items-end">
      <svg 
        viewBox={`0 0 ${vbWidth} ${vbHeight}`} 
        preserveAspectRatio="none" 
        className="w-full h-full"
      >
        <defs>
          <filter id="winGlow">
             <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
             <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <rect x="0" y={vbHeight - 20} width={vbWidth} height="20" className="fill-black" />

        {buildings.map((b, i) => {
          const frontLeft = b.x;
          const frontRight = b.x + b.w;
          const topY = b.y - b.h;
          const bottomY = b.y;

          let sidePath = '';
          const perspectiveDrop = b.projectedSideWidth * 0.4;
          
          let sTopInner, sTopOuter, sBottomInner, sBottomOuter, sLeftX, sRightX;

          if (b.sideVisible === 'right') {
            sLeftX = frontRight;
            sRightX = frontRight + b.projectedSideWidth;
            sTopInner = topY;
            sTopOuter = topY + perspectiveDrop;
            sBottomInner = bottomY;
            sBottomOuter = bottomY;
            sidePath = `M${sLeftX},${sTopInner} L${sRightX},${sTopOuter} L${sRightX},${sBottomOuter} L${sLeftX},${sBottomInner} Z`;
          } else {
            sLeftX = b.x;
            sRightX = b.x + b.projectedSideWidth;
            sTopInner = topY;
            sTopOuter = topY + perspectiveDrop;
            sBottomInner = bottomY;
            sBottomOuter = bottomY;
            sidePath = `M${sLeftX},${sTopOuter} L${sRightX},${sTopInner} L${sRightX},${sBottomInner} L${sLeftX},${sBottomOuter} Z`;
          }

          const SideWindowsRender = b.sideWindows.map((win, j) => {
            const ratioStart = win.relX / b.depth;
            const ratioEnd = (win.relX + win.w) / b.depth;
            
            let x1, x2, y1_top, y2_top, y1_bottom, y2_bottom;

            if (b.sideVisible === 'right') {
              x1 = sLeftX + ratioStart * b.projectedSideWidth;
              x2 = sLeftX + ratioEnd * b.projectedSideWidth;
              const roofY1 = sTopInner + ratioStart * perspectiveDrop;
              const roofY2 = sTopInner + ratioEnd * perspectiveDrop;
              y1_top = roofY1 + win.relY;
              y2_top = roofY2 + win.relY;
              y1_bottom = y1_top + win.h;
              y2_bottom = y2_top + win.h;
            } else {
              x1 = sRightX - ratioStart * b.projectedSideWidth;
              x2 = sRightX - ratioEnd * b.projectedSideWidth;
              const roofY1 = sTopInner + ratioStart * perspectiveDrop;
              const roofY2 = sTopInner + ratioEnd * perspectiveDrop;
              y1_top = roofY1 + win.relY;
              y2_top = roofY2 + win.relY;
              y1_bottom = y1_top + win.h;
              y2_bottom = y2_top + win.h;
            }

            if (Math.max(y1_bottom, y2_bottom) > bottomY) return null;

            return (
              <path
                key={`side-win-${j}`}
                d={`M${x1},${y1_top} L${x2},${y2_top} L${x2},${y2_bottom} L${x1},${y1_bottom} Z`}
                fill="#e5e5e5" // 银灰色灯光
                fillOpacity={win.opacity} 
                filter="url(#winGlow)"
              />
            );
          });

          const renderSideFirst = b.sideVisible === 'left';
          const drawFrontX = b.sideVisible === 'left' ? sRightX : b.x;
          
          const SideShape = (
             <g>
               <path d={sidePath} fill="#181818" stroke="none" />
               {SideWindowsRender}
             </g>
          );

          const FrontShape = (
            <g>
              <rect 
                x={drawFrontX} y={topY} width={b.w} height={b.h} 
                fill="#000000" stroke="none"
              />
              {b.windows.map((win, j) => (
                <rect 
                  key={j}
                  x={drawFrontX + win.x} y={topY + win.y} 
                  width={win.w} height={win.h} 
                  fill="#e5e5e5" // 银灰色灯光
                  fillOpacity={win.opacity}
                  shapeRendering="crispEdges"
                  filter="url(#winGlow)"
                />
              ))}
            </g>
          );

          return (
            <g key={i}>
              {renderSideFirst ? SideShape : FrontShape}
              {renderSideFirst ? FrontShape : SideShape}
            </g>
          );
        })}
        
        <rect x="0" y={vbHeight - 150} width={vbWidth} height="150" fill="url(#cityFog)" pointerEvents="none" />
        <defs>
           <linearGradient id="cityFog" x1="0" x2="0" y1="0" y2="1">
             <stop offset="0%" stopColor="black" stopOpacity="0" />
             <stop offset="60%" stopColor="black" stopOpacity="0.8" />
             <stop offset="100%" stopColor="black" stopOpacity="1" />
           </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ... ProjectCard Component (unchanged) ...
const ProjectCard = ({ title, year, category, desc, color }) => (
  <div className="group relative w-full aspect-[3/4] md:aspect-[16/9] overflow-hidden bg-stone-900 border border-stone-800 transition-all duration-500 hover:border-stone-500">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    <div className="absolute inset-0 p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-stone-500 tracking-widest">{year}</span>
        <div className="p-2 bg-stone-800 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Play size={16} className="text-stone-300" />
        </div>
      </div>
      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <span className="text-xs font-serif text-stone-400 italic block mb-2">{category}</span>
        <h3 className="text-2xl md:text-3xl font-serif text-stone-200 mb-2">{title}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 group-hover:text-stone-400 transition-colors">
          {desc}
        </p>
      </div>
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// 主应用
// -----------------------------------------------------------------------------
export default function App() {
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const moonParallax = scrolled * 0.15; 
  const textParallax = scrolled * 0.3;

  return (
    <div className="bg-black min-h-screen text-stone-300 font-sans selection:bg-stone-700 selection:text-white overflow-x-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@400;700;900&display=swap');
        
        body { font-family: 'Noto Sans SC', sans-serif; }
        .font-serif { font-family: 'Noto Serif SC', serif !important; }
        .vertical-text { writing-mode: vertical-rl; text-orientation: upright; white-space: nowrap; }
        
        /* 核心混合模式：差值 */
        .blend-diff { mix-blend-mode: difference; }
      `}</style>

      <Navbar />

      {/* -----------------------------------------------------------------------
          Hero Section
         ----------------------------------------------------------------------- */}
      <header className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
        
        {/* 背景：纯黑 */}
        <div className="absolute inset-0 bg-black z-0"></div>

        {/* --- Layer 1: 月亮 (Z-10) --- */}
        <div 
          className="absolute z-10 w-64 h-64 md:w-96 md:h-96 rounded-full bg-[#e6e2d3]" 
          style={{ 
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translateY(${moonParallax}px)`,
          }}
        ></div>

        {/* --- Layer 2: 城市 (Z-20) --- */}
        {/* 城市层必须位于月亮之上，以实现遮挡效果 */}
        <div className="absolute inset-0 z-20 pointer-events-none">
           <CitySkyline3D />
        </div>

        {/* --- Layer 3: 文字主体 (Z-30) --- */}
        {/* 使用 mix-blend-mode: difference
            逻辑：
            1. 背景是黑 (Sky) -> White Text - Black BG = White Text.
            2. 背景是白 (Moon) -> White Text - White BG = Black Text.
            3. 背景是黑 (Building over Moon) -> White Text - Black BG = White Text.
            4. 背景是灰 (Light) -> White Text - Grey Light = Light Grey Text (近似白/黑，无色偏).
        */}
        <div 
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none blend-diff"
          style={{ transform: `translateY(${textParallax}px)` }}
        >
          <div className="relative w-full max-w-7xl h-96 flex items-center justify-center">
             {/* 名字：白色 */}
             <div className="vertical-text text-6xl md:text-8xl font-serif font-bold text-white tracking-[0.2em] leading-none select-none transform -translate-x-32 md:-translate-x-48 transition-transform duration-700">
               毛鑫涛
             </div>
             {/* Slogan: 白色 */}
             <div className="absolute left-1/2 ml-16 md:ml-32 top-1/2 -translate-y-1/2 flex flex-col items-start gap-6">
                <span className="text-xs tracking-[0.4em] uppercase text-white font-bold border-b border-white pb-2">
                  Documentary Director
                </span>
                <p className="font-serif text-white text-lg md:text-xl italic max-w-xs leading-relaxed">
                  "在这座钢铁森林里，<br/>仰望唯一的月亮。"
                </p>
             </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce text-stone-600">
          <ChevronDown size={24} />
        </div>
      </header>

      {/* -----------------------------------------------------------------------
          About Section
         ----------------------------------------------------------------------- */}
      <section id="about" className="relative z-20 bg-black pt-32 pb-20 px-6 md:px-12 border-t border-stone-900">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          <div className="w-full md:w-1/3">
            <h2 className="text-stone-600 text-xs tracking-widest uppercase mb-6 flex items-center gap-2">
              <User size={12} /> DIRECTOR
            </h2>
            <div className="w-full aspect-[3/4] bg-[#050505] border border-stone-900 relative group overflow-hidden">
               <img 
                 src="https://drive.google.com/thumbnail?id=15KXGjNKSerfKq2vbYFM8sn2qJUaj2EIS&sz=w1000" 
                 alt="Mao Xintao" 
                 referrerPolicy="no-referrer"
                 className="w-full h-full object-contain object-center opacity-80 group-hover:opacity-100 transition-all duration-700"
                 onError={(e) => {
                   e.target.onerror = null; 
                   e.target.src = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop";
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none"></div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 md:pt-4">
            <p className="text-xl md:text-2xl font-serif leading-relaxed text-stone-300 mb-8">
              "我与世界的关系是个巨大的问号"
            </p>
            <p className="text-stone-600 leading-loose mb-6 font-light">
              科班出身是我的荣幸，但野路子却是我的使命。<br/>我的镜头从不说谎，因为它不会说话，会说话的永远是镜头之外的事物。
              我的第一部短片叫《沉默年代》，它讲的是我们在某天突然失去了语言的故事，巧合的是，当我从象牙塔里出来之后，才发现真实的世界更令我无法言说。<br/>但幸运的是，我还能写作、拍摄，那些用血肉构建这个精密如齿轮般高效运作的社会，需要一个沉默的镜头——不在沉默中爆发，那便在沉默中灭亡。
            </p>
            
            <div className="mt-8 flex gap-3">
               {['Urban Anthropology', 'Social Observation', 'Independent Film'].map(tag => (
                 <span key={tag} className="px-3 py-1 border border-stone-900 text-stone-600 text-[10px] tracking-wider uppercase">
                   {tag}
                 </span>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ... works, journal, footer ... */}
      <section id="works" className="relative z-20 bg-[#050505] py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-16 border-b border-stone-900 pb-4">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-200">Selected Works</h2>
            <span className="text-stone-700 text-xs tracking-widest flex items-center gap-2">
              <Film size={12} /> 2021 — 2025
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProjectCard 
              title="Concrete Jungle" 
              year="2024" 
              category="Feature Documentary" 
              desc="The last three months of an urban village behind the CBD."
              color="from-stone-800"
            />
            <ProjectCard 
              title="Night Bus N98" 
              year="2023" 
              category="Short / Experimental" 
              desc="Dreams and fatigue on a 3 AM bus ride across the sleeping city."
              color="from-blue-900"
            />
            <ProjectCard 
              title="The Watchman" 
              year="2022" 
              category="Portrait" 
              desc="48 hours with a skyscraper security guard. Boundaries of duty and solitude."
              color="from-yellow-900"
            />
            <ProjectCard 
              title="Way Home II" 
              year="2021" 
              category="Social Observation" 
              desc="Micro-sociology inside a slow train during the Spring Festival travel rush."
              color="from-red-900"
            />
          </div>
          
          <div className="mt-16 text-center">
             <button className="text-stone-600 hover:text-stone-400 transition-colors text-xs tracking-widest flex items-center gap-2 mx-auto uppercase group">
              View Archive <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
        </div>
      </section>

      <section id="journal" className="relative z-20 bg-black py-24 px-6 md:px-12 border-t border-stone-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-stone-500 text-sm tracking-widest uppercase mb-12 flex items-center gap-2">
            <BookOpen size={14} /> 导演手记
          </h2>
          
          <div className="space-y-8">
            {[
              { date: "Oct 24, 2024", title: "当摄影机成为一种侵入", excerpt: "在昨天的拍摄中，我意识到镜头本身改变了场域的气氛。如何在在场与隐形之间找到平衡？这也许是纪录片导演永恒的课题..." },
              { date: "Sep 12, 2024", title: "剪辑台上的重构", excerpt: "素材是碎裂的时间尸体。剪辑就是招魂。今天把第三场戏的顺序完全颠倒了，突然发现了一种新的叙事逻辑..." },
              { date: "Aug 05, 2024", title: "寻找光线", excerpt: "凌晨四点等待日出。楼宇间的反光打在对面玻璃幕墙上。这种等待让我感到安心，因为你知道光终究会来。" }
            ].map((post, index) => (
              <div key={index} className="group cursor-pointer border-b border-stone-900 pb-8 hover:border-stone-700 transition-colors">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
                  <h3 className="text-xl text-stone-300 group-hover:text-stone-100 transition-colors font-serif">{post.title}</h3>
                  <span className="text-xs font-mono text-stone-600 mt-1 md:mt-0">{post.date}</span>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed max-w-2xl group-hover:text-stone-400 transition-colors">
                  {post.excerpt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="relative z-20 bg-black py-20 px-6 border-t border-stone-900">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-2xl font-serif text-stone-400 mb-8 italic">Let's create something real.</h2>
          
          <a href="mailto:contact@maoxintao.com" className="text-lg text-stone-300 hover:text-white transition-colors border-b border-stone-800 hover:border-white pb-1 mb-12 inline-block">
            contact@maoxintao.com
          </a>

          <div className="flex gap-8 mb-12">
            <a href="#" className="text-stone-700 hover:text-stone-500 transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-stone-700 hover:text-stone-500 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="text-stone-700 hover:text-stone-500 transition-colors"><Mail size={18} /></a>
          </div>
          
          <p className="text-[10px] text-stone-800 font-mono uppercase tracking-widest">
            &copy; 2025 Mao Xintao.
          </p>
        </div>
      </footer>
    </div>
  );
}