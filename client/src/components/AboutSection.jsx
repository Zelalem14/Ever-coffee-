import React from 'react';
import { Coffee, Flame, Heart, Sparkles, MapPin } from 'lucide-react';

export default function AboutSection() {
  const heritagePoints = [
    {
      title: "The Birthplace of Arabica",
      description: "Centuries ago in the ancient highland forests of Keffa, wild coffee cherries were first discovered. Today, Ethiopia produces the world's most fragrant and nuanced single-origin heirloom beans.",
      icon: MapPin
    },
    {
      title: "The Sacred Jebena Ceremony",
      description: "Coffee in Ethiopia is not just a drink; it is community. We honor the traditional ceremony: washing raw beans, pan-roasting over charcoal, grinding fresh, and brewing in the handcrafted black clay Jebena.",
      icon: Flame
    },
    {
      title: "Legendary Addis Macchiato",
      description: "Ethiopia boasts an extraordinary coffee shop culture where Italian espresso tradition fused with Ethiopian rich beans to birth the legendary Ethiopian layered Macchiato.",
      icon: Coffee
    },
    {
      title: "Pure & Natural Ingredients",
      description: "Every item on our menu — from our spiced herbal teas (Shai) and thick layered tropical Spris juices to fresh bakery treats — is crafted daily from organic local harvests.",
      icon: Sparkles
    }
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden border-t border-zinc-200/80 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Grid: Story & Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Collage with Impressive White Styling */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Photo: Clay Jebena and Traditional Setup */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/80 border-4 border-white aspect-[4/3] bg-zinc-100">
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                  alt="Ethiopian Buna Ceremony Clay Jebena"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    Artisanal Tradition
                  </span>
                  <p className="font-serif text-lg font-bold">Black Clay Jebena Pot & Sini Cups</p>
                </div>
              </div>

              {/* Overlapping Small Photo: Roasting Coffee Beans */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-44 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-square bg-zinc-100">
                <img
                  src="https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=500&q=80"
                  alt="Freshly Roasted Ethiopian Coffee Beans"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Stamp */}
              <div className="absolute -top-6 -left-4 bg-gradient-to-br from-amber-600 to-amber-700 text-white p-4 rounded-2xl shadow-lg shadow-amber-600/20 flex flex-col items-center justify-center text-center">
                <Coffee className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-widest">Keffa</span>
                <span className="text-xs font-serif font-bold">Origin</span>
              </div>

            </div>
          </div>

          {/* Right Column: Narrative Story */}
          <div className="lg:col-span-6 space-y-6 pt-6 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-amber-600" />
              <span>Our Roots & Passion</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              Honoring Ethiopia's Timeless Coffee Legacy
            </h2>

            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed font-light">
              In Ethiopia, coffee is much more than caffeine — it is a ritual of blessing, hospitality, and profound connection. <strong className="font-semibold text-zinc-900">Keffa & Bunna</strong> was founded to honor this sacred heritage while delivering modern coffee house elegance.
            </p>

            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
              We source directly from smallholder farmers across Sidama, Yirgacheffe, Guji, and Keffa. Whether you come for our time-honored Buna ceremony with smoking frankincense and popcorn, a silky triple-layer macchiato, a spiced lemon ginger tea, or freshly squeezed tropical Spris — you are part of our family.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <a
                href="#menu"
                className="px-6 py-3.5 rounded-2xl font-semibold text-sm text-white bg-zinc-900 hover:bg-zinc-800 shadow-sm transition-all duration-200"
              >
                Browse Our Complete Menu
              </a>
            </div>

          </div>

        </div>

        {/* Bottom Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-20">
          {heritagePoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200/80">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-zinc-950">
                  {point.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
