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
          : 'bg-transparent py-6 md:py-8'
      }`}
    >
      {/* 手机端 px-5, 电脑端 px-12 */}
      <div className="max-w-7xl mx-auto px-5 md:px-12 flex justify-between items-center">
        <div 
          className={`font-serif font-bold text-xl text-stone-200 tracking-widest cursor-pointer transition-opacity duration-500 ${
            isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          MXT
        </div>

        {/* 手机端间距 gap-4, 电脑端 gap-12 */}
        <div className="flex items-center gap-4 md:gap-12">
          {['About', 'Works', 'Journal', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              // 手机端字号略微缩小防止换行
              className="text-[10px] md:text-xs font-sans font-medium tracking-[0.15em] md:tracking-[0.25em] text-stone-400 hover:text-white uppercase transition-colors relative group"
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
              // 添加动画随机参数
              animDuration: 2 + Math.random() * 4 + 's',
              animDelay: Math.random() * 5 + 's'
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
               // 添加动画随机参数
               animDuration: 2 + Math.random() * 4 + 's',
               animDelay: Math.random() * 5 + 's'
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
// 组件：3D 城市天际线 (No Stroke - 纯色块渲染 + 流星)
// -----------------------------------------------------------------------------
const CitySkyline3D = () => {
  const vbWidth = 1440;
  const vbHeight = 500;
  const buildings = useMemo(() => generate3DCity(vbWidth, vbHeight), []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-[55vh] pointer-events-none z-20 overflow-hidden select-none flex items-end">
      <svg 
        viewBox={`0 0 ${vbWidth} ${vbHeight}`} 
        // 手机适配关键：使用 xMidYMax slice
        // 这意味着在手机竖屏时，SVG会保持比例，裁剪掉左右两边，
        // 只显示中间最繁华的城市部分，避免建筑被拉伸变形。
        preserveAspectRatio="xMidYMax slice" 
        className="w-full h-full"
      >
        <defs>
          <filter id="winGlow">
             <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
             <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* 流星尾巴渐变 */}
          <linearGradient id="star-tail" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* --- 流星层 (在建筑之后，背景之上) --- */}
        {/* 偶尔划过的几颗流星，设置不同的延迟和超长周期来实现稀疏感 */}
        <g className="shooting-stars-layer">
           <rect x="800" y="50" width="120" height="2" fill="url(#star-tail)" className="shooting-star" style={{animationDelay: '2s', animationDuration: '18s'}} />
           <rect x="1100" y="120" width="150" height="2" fill="url(#star-tail)" className="shooting-star" style={{animationDelay: '12s', animationDuration: '25s'}} />
           <rect x="600" y="20" width="100" height="1" fill="url(#star-tail)" className="shooting-star" style={{animationDelay: '25s', animationDuration: '32s'}} />
        </g>


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
                filter="url(#winGlow)"
                className="city-window-anim"
                style={{
                  animationDuration: win.animDuration,
                  animationDelay: win.animDelay
                }}
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
                  shapeRendering="crispEdges"
                  filter="url(#winGlow)"
                  className="city-window-anim"
                  style={{
                    animationDuration: win.animDuration,
                    animationDelay: win.animDelay
                  }}
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

// -----------------------------------------------------------------------------
// 组件：项目卡片
// -----------------------------------------------------------------------------
const ProjectCard = ({ title, year, category, desc, color, image }) => (
  <div className="group relative w-full aspect-[3/4] md:aspect-[16/9] overflow-hidden bg-stone-900 border border-stone-800 transition-all duration-500 hover:border-stone-500">
    
    {image && (
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
        referrerPolicy="no-referrer"
      />
    )}

    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

    {/* 添加了 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] 来制造强烈的柔和黑色阴影 */}
    <div className="absolute inset-0 p-6 flex flex-col justify-between drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-stone-300 tracking-widest font-bold">{year}</span>
        <div className="p-2 bg-stone-800 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Play size={16} className="text-stone-300" />
        </div>
      </div>
      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        {/* 去掉了 italic 类 */}
        <span className="text-xs font-serif text-stone-300 block mb-2 font-bold">{category}</span>
        <h3 className="text-2xl md:text-3xl font-serif text-stone-100 mb-2">{title}</h3>
        <p className="text-sm text-stone-300 line-clamp-2 group-hover:text-stone-200 transition-colors font-medium">
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

        /* 万家灯火闪烁动画 */
        @keyframes window-flicker {
          0%, 100% { fill-opacity: 0.3; }
          50% { fill-opacity: 0.9; }
        }
        .city-window-anim {
          animation-name: window-flicker;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        /* 流星划过动画 */
        /* 周期设置得很长(比如20s)，但只在前5%的时间内划过，剩下时间隐藏，制造稀疏感 */
        @keyframes shooting-star-cycle {
          0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 1; }
          5% { transform: translateX(-400px) translateY(250px) rotate(-35deg); opacity: 0; }
          100% { transform: translateX(-400px) translateY(250px) rotate(-35deg); opacity: 0; }
        }

        .shooting-star {
          opacity: 0; /* 初始不可见 */
          transform-origin: left center;
          animation-name: shooting-star-cycle;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }
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
        {/* 使用 mix-blend-mode: difference */}
        <div 
          className="absolute inset-0 z-30 flex items-center w-full max-w-7xl mx-auto px-6 md:px-12 pointer-events-none blend-diff"
          style={{ transform: `translateY(${textParallax}px)` }}
        >
          {/* 大容器：Flex 布局，左右分居 */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-end h-full py-32 md:py-0 select-none">
             
             {/* [LEFT] 左侧标题组：横向排版，稳重平衡 */}
             <div className="flex flex-col items-center md:items-start gap-3 md:gap-5 mb-12 md:mb-48 transform transition-transform duration-700">
               {/* 顶部引导：小字 */}
               <div className="flex items-center gap-3 opacity-80">
                 <div className="w-4 md:w-8 h-[1px] bg-stone-400"></div>
                 <span className="text-[10px] md:text-xs font-sans tracking-[0.2em] text-stone-300 uppercase">Welcome to</span>
               </div>

               {/* 主标题：大字，横向 */}
               <div className="relative">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-widest leading-tight drop-shadow-2xl">
                    毛鑫涛的世界
                  </h1>
                  
                  {/* 已移除装饰印章 */}
               </div>
             </div>

             {/* [RIGHT] 右侧副标题与引言：衔接月与夜 */}
             <div className="flex flex-col items-center md:items-end gap-4 md:gap-6 opacity-90 mb-24 md:mb-48 text-center md:text-right">
                <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-stone-300 font-bold border-b border-white/30 pb-2">
                  Documentary Director
                </span>
                
                <p className="font-serif text-white text-sm md:text-lg italic tracking-widest leading-loose">
                  "我们虽囿于永夜，<br/>却也偶有微光。"
                </p>
                
                {/* 装饰线条，指向夜空 */}
                <div className="hidden md:block w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent mt-2"></div>
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
            
            <div className="mt-8 flex gap-3 flex-wrap">
               {/* 修改了标签以匹配您的作品集：纪录片、剧情片、商业片 */}
               {['Documentary Film', 'Narrative Fiction', 'Commercial Video'].map(tag => (
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
              title="再见 沉默年代" 
              year="2021" 
              category="剧情短片 " 
              desc="多年以后，张筱雨想起了那段所有人都无法说话的日子。"
              color="from-stone-800"
              image="https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEMWW5pNuvkVXBodp-T47SzhzYEnoCjmgACqSAAAjH4uFUNgYPmuuuI9jYE.png"
            />
            <ProjectCard 
              title="远山" 
              year="2023" 
              category="纪录片" 
              desc="凉山深处，一位放羊的音乐家决定走出大山。"
              color="from-blue-900"
              image="https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEMWXtpNu0SlHri6jmzi4lZGOBnCKllDAACtyAAAjH4uFWnH7zwt2L7tDYE.png"
            />
            <ProjectCard 
              title="深圳赤湾火灾应急演练" 
              year="2024" 
              category="大型活动/政企宣传片" 
              desc="突如其来的大火打破了深圳湾的宁静。"
              color="from-yellow-900"
              image="https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEMWcBpNvNB-BszAAHH864zOQzvPTqe5REAAgohAAIx-LhVd-9R-g37xFc2BA.jpeg"
            />
            <ProjectCard 
              title="灰色星球在下雨" 
              year="2023" 
              category="纪录片" 
              desc="面对性侵她们未曾退缩，于是变成了光。"
              color="from-gray-900"
              image="https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEMYDZpN87CGdDTb4zUQfQ9uQU3zQnwAQAC9xwAApKDwFWfvjMrPeKZEzYE.png"
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
          
          <a href="mailto:maoxintao98@outlook.com" className="text-lg text-stone-300 hover:text-white transition-colors border-b border-stone-800 hover:border-white pb-1 mb-12 inline-block">
            maoxintao98@outlook.com
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