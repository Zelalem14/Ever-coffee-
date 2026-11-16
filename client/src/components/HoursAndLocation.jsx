import React from 'react';
import { Clock, MapPin, Phone, Send, Compass } from 'lucide-react';

export default function HoursAndLocation() {
  const schedule = [
    { day: "Monday – Friday", hours: "6:30 AM – 10:30 PM", note: "Early Buna Roast & Bakery" },
    { day: "Saturday", hours: "7:00 AM – 11:00 PM", note: "Weekend Ceremonies & Lounge" },
    { day: "Sunday", hours: "7:00 AM – 11:00 PM", note: "Family & Community Rituals" },
    { day: "National Holidays", hours: "7:00 AM – 10:00 PM", note: "Always Brewing" }
  ];

  return (
    <section id="hours" className="py-20 bg-zinc-50/80 text-zinc-900 border-t border-zinc-200/80 relative overflow-hidden">
      
      {/* Subtle light aura */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Visit Us In Addis Ababa</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight">
            Opening Hours & Coffee House Location
          </h2>

          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            We are ready to welcome you with the aroma of freshly roasted beans and warm Ethiopian hospitality seven days a week.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Card: Opening Hours */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-zinc-950">Opening Hours</h3>
                  <p className="text-xs text-zinc-500">Addis Ababa Local Time (EAT, UTC+3)</p>
                </div>
              </div>

              <div className="space-y-3">
                {schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-amber-300 transition-colors gap-1 sm:gap-4"
                  >
                    <div>
                      <span className="font-semibold text-sm text-zinc-900 block">
                        {item.day}
                      </span>
                      <span className="text-[11px] text-amber-700 font-medium">
                        {item.note}
                      </span>
                    </div>

                    <span className="font-serif text-sm sm:text-base font-bold text-amber-800">
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Open Status Indicator */}
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-3 text-xs text-zinc-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>We are currently <strong>OPEN</strong> today. Fresh Jebena coffee is brewing!</span>
            </div>
          </div>

          {/* Right Card: Contact & Location */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-zinc-950">Location & Reach</h3>
                  <p className="text-xs text-zinc-500">Heart of the Capital, Addis Ababa</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Physical Address */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <MapPin className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Address</h4>
                    <p className="text-sm text-zinc-900 font-medium mt-0.5">
                      Bole Medhanialem Road, Opposite Atlas Plaza, Kazanchis / Bole District, Addis Ababa, Ethiopia
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <Phone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Phone Numbers</h4>
                    <p className="text-sm text-zinc-900 font-medium mt-0.5">
                      +251 911 234 567 / +251 116 789 012
                    </p>
                  </div>
                </div>

                {/* Email & Telegram */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <Send className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Digital Contact</h4>
                    <p className="text-sm text-zinc-900 font-medium mt-0.5">
                      Telegram: @KeffaBunnaCoffee • Email: info@keffabunna.et
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Digital Menu Notice */}
            <div className="mt-6 pt-4 border-t border-zinc-100 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950">
              <strong className="text-amber-900 font-bold block mb-1">
                Digital Menu Experience Notice:
              </strong>
              This website serves as our live digital menu to browse all fresh coffee, tea, juices, and snacks with transparent prices in ETB. Visit us in person to place orders and immerse yourself in our aromatic atmosphere.
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
