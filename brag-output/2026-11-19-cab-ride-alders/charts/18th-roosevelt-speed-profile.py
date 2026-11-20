# Speed profile, 18th (Soldier Field) to Roosevelt: the longest station pair in the film.
#   uv run --python 3.12 --with matplotlib python charts/18th-roosevelt-speed-profile.py charts/18th-roosevelt-speed-profile.png
import math, sys
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
MPH=2.23694
D18=106.3                       # 18th station is this far before the film's alignment starts
L=1417.5+D18                    # to where the cab stops at Roosevelt
C0,C1,R,TRAIN=762+D18,1046+D18,140,75    # the curve under Roosevelt Rd (with its run-in and run-out), and a 4-car train's length
# 49 CFR 213.57(b): Vmax (mph) = sqrt((Ea + Eu) / (0.0007 D)), with Ea the outside rail's elevation and Eu the cant
# deficiency, both in inches, and D the degree of curvature. Eu = 3 in is what any vehicle may use without FRA approval.
EA,EU=6,3; DEG=5729.578/(R/0.3048)
VCURVE=math.sqrt((EA+EU)/(0.0007*DEG))/MPH
M=145e3*1.06; TE=200e3; P=2.6e6; AMAX=1.2; BR=1.0
def acc(v):
    f=min(TE,P/max(v,0.1)); r=2000+40*v+6.5*v*v
    return min(AMAX,(f-r)/M)
ds=0.25; n=int(L/ds)+1
x=[i*ds for i in range(n)]
cap=[VCURVE if C0<=xi<=C1+TRAIN else 99 for xi in x]
f=[0.0]*n; b=[0.0]*n
for i in range(1,n): f[i]=min(cap[i],math.sqrt(f[i-1]**2+2*acc(f[i-1])*ds))
for i in range(n-2,-1,-1): b[i]=min(cap[i],math.sqrt(b[i+1]**2+2*BR*ds))
v=[min(p,q) for p,q in zip(f,b)]
t=[0.0]
for i in range(1,n): t.append(t[-1]+ds/max((v[i]+v[i-1])/2,0.05))
at=lambda xx: min(range(n),key=lambda k:abs(x[k]-xx))
ip1=max(range(at(C0)),key=lambda i:v[i]); ip2=max(range(at(C1+TRAIN),n),key=lambda i:v[i])
# the film: it joins the train 6 m into its alignment, already at its cruising speed, and brakes over 28 s (7 s at 4x)
X0=D18+6; T_FILM=120*(L-X0)/L; tb=28; vc=(L-X0)/(T_FILM-tb/2)
sm=lambda u: u*u*(3-2*u)
fx=[X0]; fv=[vc]; dt=0.05; tt=0
while tt<T_FILM:
    tt+=dt; s=vc if tt<T_FILM-tb else vc*(1-sm(min((tt-(T_FILM-tb))/tb,1)))
    fx.append(fx[-1]+s*dt); fv.append(s)
INK="#1f2933"; MUTE="#66727d"; GRID="#e3e6e8"; A="#1C7ED6"; B="#D9480F"
plt.rcParams.update({"font.family":"Helvetica Neue","font.size":11})
fig,ax=plt.subplots(figsize=(11,6.2),dpi=160); fig.patch.set_facecolor("#fcfcfb"); ax.set_facecolor("#fcfcfb")
ax.axvspan(C0,C1+TRAIN,color="#eceeed",lw=0)
ax.text((C0+C1+TRAIN)/2,86.5,f"Curve under Roosevelt Rd\n{R} m radius: {VCURVE*MPH:.0f} mph limit\n(49 CFR 213.57)",ha="center",va="top",color=MUTE,fontsize=10)
ax.plot(x,[s*MPH for s in v],color=A,lw=2.2,solid_capstyle="round",label="Fastest possible (Stadler FLIRT at full power)")
ax.plot(fx,[s*MPH for s in fv],color=B,lw=2.2,solid_capstyle="round",label="As scheduled in the film (2 minutes)")
rate=lambda a: f"{a:.1f} m/s² ({a*MPH:.1f} mph per second)"
def on_line(text,i,xs,ys,color,dx,dy,ha="center"):
    ax.annotate(text,(xs[i],ys[i]*MPH),xytext=(dx,dy),textcoords="offset points",ha=ha,color=INK,fontsize=10,
                arrowprops=dict(arrowstyle="-",color=color,lw=1,shrinkA=2,shrinkB=3))
for ip,dx,ha in ((ip1,10,"left"),(ip2,10,"left")):
    ax.scatter([x[ip]],[v[ip]*MPH],s=46,color=A,zorder=5,edgecolor="#fcfcfb",linewidth=2)
    ax.annotate(f"{v[ip]*MPH:.0f} mph ({v[ip]*3.6:.0f} km/h)\nat {t[ip]:.0f} s",(x[ip],v[ip]*MPH),xytext=(dx,3),textcoords="offset points",ha=ha,color=INK,fontsize=10.5)
ik=next(i for i in range(1,n) if acc(v[i])<AMAX-1e-6)
ax.scatter([x[ik]],[v[ik]*MPH],s=30,color=A,zorder=5,edgecolor="#fcfcfb",linewidth=2)
on_line(f"Accelerating at 1.2 m/s² (2.7 mph per second)\nup to {v[ik]*MPH:.0f} mph, then tapering",ik,x,v,A,24,-62,ha="left")
i2=at(380); ax.annotate("Down to "+rate(acc(v[i2]))+" here",(x[i2],v[i2]*MPH),xytext=(95,67),ha="left",color=INK,fontsize=10,arrowprops=dict(arrowstyle="-",color=A,lw=1,shrinkA=2,shrinkB=3))
i3=at((x[ip1]+C0)/2+40); on_line("Braking at "+rate(BR)+"\nfor the curve, and again into Roosevelt",i3,x,v,A,-24,-38,ha="right")
j=min(range(len(fx)),key=lambda k:abs(fv[k]-vc/2)); on_line("Braking at up to\n"+rate(1.5*vc/tb),j,fx,fv,B,-34,-6,ha="right")
ax.scatter([X0],[vc*MPH],s=30,color=B,zorder=5,edgecolor="#fcfcfb",linewidth=2)
ax.annotate(f"The film joins here, already cruising at {vc*MPH:.1f} mph",(X0,vc*MPH),xytext=(8,-17),textcoords="offset points",color=INK,fontsize=10)
for sec in (20,40,60,80):
    i=min(range(n),key=lambda k:abs(t[k]-sec))
    ax.plot([x[i]],[v[i]*MPH],marker="|",ms=9,color=A,mew=1.4)
    ax.annotate(f"{sec} s",(x[i],v[i]*MPH),xytext=(0,9),textcoords="offset points",ha="center",color=MUTE,fontsize=9)
ax.set_xlim(0,L); ax.set_ylim(0,90)
ax.set_xticks([0,200,400,600,800,1000,1200,L]); ax.set_xticklabels(["18th\n(Soldier Field)","200","400","600","800","1,000","1,200","Roosevelt"])
ax.set_ylabel("Speed (mph)",color=MUTE); ax.set_xlabel("Distance along the track (meters)",color=MUTE)
ax.grid(axis="y",color=GRID,lw=1); ax.set_axisbelow(True)
for s in ("top","right","left"): ax.spines[s].set_visible(False)
ax.get_xticklabels()[0].set_ha("left"); ax.get_xticklabels()[-1].set_ha("right")
ax.spines["bottom"].set_color(GRID); ax.tick_params(colors=MUTE,length=0)
ax.legend(loc="upper left",frameon=False,labelcolor=INK,bbox_to_anchor=(0,1.0))
fig.suptitle(f"18th to Roosevelt: {t[-1]:.0f} seconds at full power, 120 seconds in the schedule",x=0.065,ha="left",fontsize=15,fontweight="bold",color=INK,y=0.975)
fig.text(0.065,0.905,f"Speed of an X1 train over the {L:,.0f} m between the two stations, the longest gap in the film",color=MUTE,fontsize=11)
fig.text(0.065,0.012,f"Assumed 4-car FLIRT: 1.2 m/s² starting acceleration, 200 kN tractive effort, 2,600 kW at the wheel, 145 t loaded, 1.0 m/s² service braking. Level track.\nCurve limit from 49 CFR 213.57(b), Vmax = √((Ea + Eu) ÷ 0.0007D), with 6 in of elevation (Ea), 3 in of cant deficiency (Eu) and a {DEG:.1f}° curve (D); held until the tail of a 75 m train clears.",color=MUTE,fontsize=8.2)
fig.subplots_adjust(top=0.86,bottom=0.17,left=0.065,right=0.975)
fig.savefig(sys.argv[1]); print(L, t[-1], v[ip1]*MPH, t[ip1], v[ip2]*MPH, t[ip2], vc*MPH, T_FILM, fx[-1])
