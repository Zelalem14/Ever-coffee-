import React from 'react';
import { Coffee, ArrowDown, Sparkles, Flame } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export default function Hero() {
  const { setActiveCategory } = useMenu();

  const scrollToMenu = (category = 'all') => {
    setActiveCategory(category);
    const element = document.querySelector('#menu');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-white via-zinc-50/60 to-white text-zinc-900">
      
      {/* Impressive subtle background aura */}
      <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-12 right-1/3 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline and Story */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ethiopia • The Birthplace of Coffee</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.12]">
              Your Perfect Coffee, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">
                Your Perfect Moment.
              </span>
            </h1>

            {/* Welcoming Introduction */}
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              Welcome to <strong className="text-zinc-900 font-semibold">Keffa & Bunna</strong>, where Ethiopia's centuries-old coffee ceremony meets contemporary artisanal craftsmanship. From steaming clay Jebena brews and velvety Ethiopian macchiatos to exotic layered Spris juices, warm pastries, and savory snacks — explore our curated digital menu.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => scrollToMenu('all')}
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white bg-amber-700 hover:bg-amber-800 shadow-lg shadow-amber-700/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Our Menu</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollToMenu('coffee')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-medium text-sm text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs hover:border-amber-300 transition-all duration-300"
              >
                <Coffee className="w-4 h-4 text-amber-600" />
                <span>Traditional Buna</span>
              </button>

              <button
                onClick={() => scrollToMenu('cold-drinks')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-medium text-sm text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs hover:border-amber-300 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Layered Spris Juice</span>
              </button>
            </div>

            {/* Key Quality Pillars */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-zinc-200/80 max-w-xl">
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-amber-700">100%</span>
                <span className="text-xs text-zinc-500 font-medium">Single-Origin Arabica</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-amber-700">Jebena</span>
                <span className="text-xs text-zinc-500 font-medium">Ceremony & Frankincense</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-amber-700">60+</span>
                <span className="text-xs text-zinc-500 font-medium">Curated Menu Delights</span>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Visual Presentation Card in Pure White */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Soft decorative shadow backdrop */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-200/40 via-zinc-200/40 to-amber-100/50 blur-xl" />
              
              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden border border-zinc-200/90 bg-white shadow-xl shadow-zinc-200/60 p-3.5">
                <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-zinc-100">
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80"
                    alt="Ethiopian Traditional Buna Jebena Coffee"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-zinc-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-zinc-900">House Specialty</span>
                  </div>

                  {/* Card Bottom Details */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300">
                      Signature Ceremony
                    </span>
                    <h3 className="font-serif text-xl font-bold text-white">
                      Traditional Jebena Buna
                    </h3>
                    <p className="text-xs text-zinc-200 mt-1 line-clamp-2">
                      Hand-roasted Ethiopian highland coffee brewed in clay Jebena, served with smoking frankincense and fresh hot popcorn.
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-serif font-bold text-amber-300">
                        65 ETB
                      </span>
                      <button
                        onClick={() => scrollToMenu('coffee')}
                        className="text-xs font-semibold text-white bg-amber-700 hover:bg-amber-600 px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
                      >
                        View in Menu
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub Card / Quick Feature Pill */}
                <div className="mt-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                      <img
                        src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=200&q=80"
                        alt="Spris Juice"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">Layered Spris Juice</h4>
                      <p className="text-[11px] text-zinc-500">Avocado, Mango & Papaya</p>
                    </div>
                  </div>
                  <span className="font-serif text-sm font-bold text-amber-800">110 ETB</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
