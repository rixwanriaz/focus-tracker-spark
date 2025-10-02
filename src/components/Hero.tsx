import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="w-full min-h-screen bg-gradient-bg pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Where <span className="text-primary italic">teams</span> and time
            <br />
            tracking <span className="text-primary italic">data</span> meet
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto">
            The only time tracking software that builds custom reports from your team's
            time data to maximize productivity and revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="hero" size="lg" className="rounded-full text-base px-8 py-6">
              Start tracking for free
            </Button>
            <Button variant="heroSecondary" size="lg" className="rounded-full text-base px-8 py-6">
              <Play className="w-5 h-5" />
              See how it works
            </Button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-2 gap-6">
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-4">Weekly project report</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  Billable
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-muted"></span>
                  Non-billable
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 h-48">
                {[8, 10, 6, 8, 8, 6, 4].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col justify-end gap-1">
                    <div className="w-full bg-primary rounded-t" style={{ height: `${height * 10}%` }}></div>
                    <div className="w-full bg-muted rounded-b h-8"></div>
                    <span className="text-xs text-muted-foreground mt-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-4">Team Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">MOST ACTIVE OVER LAST 7 DAYS</p>
            <div className="space-y-3">
              {[
                { name: 'Joanna', time: '25:29:45', color: 'bg-primary' },
                { name: 'Bobby', time: '23:10:00', color: 'bg-accent' },
                { name: 'Annie', time: '23:00:00', color: 'bg-secondary' }
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-sm font-semibold`}>
                      {member.name[0]}
                    </div>
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <span className="text-muted-foreground">{member.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">TEAM MEMBER • DESCRIPTION • DURATION</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold">
                      A
                    </div>
                    <span>Alana</span>
                  </div>
                  <span className="text-muted-foreground">Documentation</span>
                  <span>3:00:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
