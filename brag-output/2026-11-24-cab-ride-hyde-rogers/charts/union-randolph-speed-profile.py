import math, sys
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
MPH=2.23694; L=743.5
M=145e3*1.06; TE=200e3; P=2.6e6; AMAX=1.2; BR=1.0
def acc(v):
    f=min(TE,P/max(v,0.1)); r=2000+40*v+6.5*v*v
    return min(AMAX,(f-r)/M)
ds=0.25; n=int(L/ds)+1
f=[0.0]*n; b=[0.0]*n
for i in range(1,n): f[i]=math.sqrt(f[i-1]**2+2*acc(f[i-1])*ds)
for i in range(n-2,-1,-1): b[i]=math.sqrt(b[i+1]**2+2*BR*ds)
v=[min(x,y) for x,y in zip(f,b)]
x=[i*ds for i in range(n)]
t=[0.0]
for i in range(1,n): t.append(t[-1]+ds/max((v[i]+v[i-1])/2,0.05))
ip=max(range(n),key=lambda i:v[i])
# where traction becomes power-limited
ik=next(i for i in range(1,n) if acc(v[i])<AMAX-1e-6)
# the film's timetable run: 28 s dwell, then smoothstep away over 20 s, cruise, brake over 28 s
run=120-28; ta,tb=20,28; vc=L/(run-ta/2-tb/2)
sm=lambda u: u*u*(3-2*u)
fx=[0.0]; fv=[0.0]; dt=0.05; tt=0
while tt<run:
    tt+=dt
    s=vc*sm(min(tt/ta,1)) if tt<run-tb else vc*(1-sm(min((tt-(run-tb))/tb,1)))
    fx.append(fx[-1]+s*dt); fv.append(s)
INK="#1f2933"; MUTE="#66727d"; GRID="#e3e6e8"; A="#1C7ED6"; B="#D9480F"
plt.rcParams.update({"font.family":"Helvetica Neue","font.size":11})
fig,ax=plt.subplots(figsize=(11,6.2),dpi=160); fig.patch.set_facecolor("#fcfcfb"); ax.set_facecolor("#fcfcfb")
ax.plot(x,[s*MPH for s in v],color=A,lw=2.2,solid_capstyle="round",label="Fastest possible (Stadler FLIRT at full power)")
ax.plot(fx,[s*MPH for s in fv],color=B,lw=2.2,solid_capstyle="round",label="As scheduled in the film (2 minutes, 28 s dwell)")
ax.scatter([x[ip]],[v[ip]*MPH],s=46,color=A,zorder=5,edgecolor="#fcfcfb",linewidth=2)
ax.annotate(f"Peak {v[ip]*MPH:.0f} mph ({v[ip]*3.6:.0f} km/h)\n{t[ip]:.0f} s after leaving, then brake",(x[ip],v[ip]*MPH),xytext=(x[ip]+14,v[ip]*MPH+3.5),ha="left",color=INK,fontsize=10.5)
ax.scatter([x[ik]],[v[ik]*MPH],s=30,color=A,zorder=5,edgecolor="#fcfcfb",linewidth=2)
ax.annotate(f"Accelerating at 1.2 m/s² (2.7 mph per second) up to {v[ik]*MPH:.0f} mph, then tapering",(x[ik],v[ik]*MPH),xytext=(x[ik]+14,v[ik]*MPH-3.2),color=INK,fontsize=10)
ax.annotate(f"Cruises at {vc*MPH:.1f} mph",(L/2,vc*MPH),xytext=(L/2,vc*MPH-5),ha="center",color=INK,fontsize=10.5)
rate=lambda a: f"{a:.1f} m/s² ({a*MPH:.1f} mph per second)"
def on_line(text,i,xs,ys,color,dy,ha="center"):
    ax.annotate(text,(xs[i],ys[i]*MPH),xytext=(0,dy),textcoords="offset points",ha=ha,color=INK,fontsize=10,
                arrowprops=dict(arrowstyle="-",color=color,lw=1,shrinkA=2,shrinkB=3))
i1=min(range(n),key=lambda k:abs(x[k]-30)); i2=min(range(n),key=lambda k:abs(x[k]-300)); i3=min(range(n),key=lambda k:abs(x[k]-560))
on_line("Down to "+rate(acc(v[i2]))+" here",i2,x,v,A,-34,ha="left")
on_line("Braking at "+rate(BR),i3,x,v,A,30,ha="left")
j1=min(range(len(fx)),key=lambda k:abs(fv[k]-vc/2) if k*dt<ta else 9); j2=min(range(len(fx)),key=lambda k:abs(fv[k]-vc/2) if k*dt>run-tb else 9)
on_line("Accelerating at up to "+rate(1.5*vc/ta),j1,fx,fv,B,-34,ha="left")
on_line("Braking at up to "+rate(1.5*vc/tb),j2,fx,fv,B,-30,ha="right")
for sec in (10,20,30,40):
    i=min(range(n),key=lambda k:abs(t[k]-sec))
    ax.plot([x[i]],[v[i]*MPH],marker="|",ms=9,color=A,mew=1.4)
    ax.annotate(f"{sec} s",(x[i],v[i]*MPH),xytext=((-30,5) if sec==10 else (7,-14)) if sec<t[ip] else (7,3),textcoords="offset points",color=MUTE,fontsize=9)
ax.set_xlim(0,L); ax.set_ylim(0,80)
ax.set_xticks([0,100,200,300,400,500,600,L]); ax.set_xticklabels(["Union\nStation","100","200","300","400","500","600","Randolph/\nClinton"])
ax.set_ylabel("Speed (mph)",color=MUTE); ax.set_xlabel("Distance along the track (meters)",color=MUTE)
ax.grid(axis="y",color=GRID,lw=1); ax.set_axisbelow(True)
for s in ("top","right","left"): ax.spines[s].set_visible(False)
ax.get_xticklabels()[0].set_ha("left"); ax.get_xticklabels()[-1].set_ha("right")
ax.spines["bottom"].set_color(GRID); ax.tick_params(colors=MUTE,length=0)
ax.legend(loc="upper left",frameon=False,labelcolor=INK,bbox_to_anchor=(0,1.0))
fig.suptitle(f"Union Station to Randolph/Clinton: {t[-1]:.0f} seconds at full power, 92 seconds in the schedule",x=0.065,ha="left",fontsize=15,fontweight="bold",color=INK,y=0.975)
fig.text(0.065,0.905,f"Speed of an X1 train over the {L:.0f} m between the two platforms",color=MUTE,fontsize=11)
fig.text(0.065,0.015,"Assumed 4-car FLIRT: 1.2 m/s² starting acceleration, 200 kN tractive effort, 2,600 kW at the wheel, 145 t loaded, 1.0 m/s² service braking. Straight, level track.",color=MUTE,fontsize=8.2)
fig.subplots_adjust(top=0.86,bottom=0.15,left=0.065,right=0.975)
fig.savefig(sys.argv[1]); print(v[ip]*MPH, x[ip], t[ip], t[-1], v[ik]*MPH, x[ik], vc*MPH, fx[-1])
