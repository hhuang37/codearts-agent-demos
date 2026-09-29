from pathlib import Path
import matplotlib
matplotlib.use("Agg")
matplotlib.rcParams["svg.fonttype"] = "none"
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyArrowPatch, FancyBboxPatch

BASE = Path(__file__).resolve().parents[1]
OUT = BASE / "images"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1600, 900
C = {
    "bg": "#F4F7FA",
    "white": "#FFFFFF",
    "navy": "#18364F",
    "ink": "#172B3A",
    "muted": "#60778A",
    "subtle": "#8AA0B2",
    "line": "#A8BBC9",
    "border": "#D6E1E9",
    "teal": "#35A99A",
    "teal_dark": "#197B72",
    "teal_pale": "#E8F5F2",
    "teal_border": "#BBDCD5",
    "amber": "#D49A27",
    "amber_dark": "#93620A",
    "amber_pale": "#FFF7E7",
    "amber_border": "#E9D5A7",
    "slate_pale": "#EEF3F7",
    "slate_border": "#D5E0E8",
}

fig = plt.figure(figsize=(16, 9), dpi=100, facecolor=C["bg"])
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, W)
ax.set_ylim(H, 0)
ax.axis("off")
ax.set_facecolor(C["bg"])

def text(x, y, value, size=12, color=None, weight="normal", ha="left",
         va="center", rotation=0, **kwargs):
    ax.text(x, y, value, fontsize=size, color=color or C["ink"],
            fontweight=weight, fontfamily="DejaVu Sans",
            ha=ha, va=va, rotation=rotation, zorder=5, **kwargs)

def rounded(x, y, w, h, face, edge=None, lw=1.0, radius=14, z=2):
    patch = FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0,rounding_size={radius}",
        linewidth=lw, edgecolor=edge or face, facecolor=face, zorder=z
    )
    ax.add_patch(patch)
    return patch

def pill(x, y, label, face, ink, width=None, height=24, edge=None, size=8.5):
    if width is None:
        width = max(52, 18 + len(label) * 6.0)
    rounded(x, y, width, height, face, edge=edge or face, lw=0.8,
            radius=height / 2, z=4)
    text(x + width / 2, y + height / 2 + 0.5, label, size=size,
         color=ink, weight="bold", ha="center")
    return width

def arrow(x1, y1, x2, y2, color, lw=1.7, scale=12):
    p = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>",
                        mutation_scale=scale, linewidth=lw,
                        color=color, zorder=1, shrinkA=0, shrinkB=0)
    ax.add_patch(p)

# Header
text(82, 43, "CODEARTS CUSTOM AGENTS  /  DEEP RESEARCH", 10.5,
     C["teal_dark"], "bold")
text(82, 83, "Deep Research Workflow", 30, C["navy"], "bold")
text(82, 119,
     "A research question moves through four specialists before it becomes a report.",
     13, C["muted"])
pill(1326, 37, "SEQUENTIAL WORKFLOW", C["white"], C["navy"],
     width=188, height=30, edge=C["border"], size=8.6)
text(1326, 81, "PRIMARY-ORCHESTRATED", 9.2, C["subtle"], "bold")

# Sequential rail, with calls coordinated by the primary planner.
rail_x = 105
centers = [291, 414, 537, 660]
ax.plot([rail_x, rail_x], [180, 794], color=C["line"], linewidth=2.2, zorder=0)
# Input/output connectors
ax.plot([rail_x, 160], [180, 180], color=C["line"], linewidth=1.8, zorder=0)
ax.plot([rail_x, 160], [794, 794], color=C["line"], linewidth=1.8, zorder=0)
# Step nodes and arrows on the orchestration rail
for i, cy in enumerate(centers):
    if i < len(centers) - 1:
        arrow(rail_x, cy + 17, rail_x, centers[i + 1] - 17, C["line"], lw=1.6, scale=10)
    ax.add_patch(Circle((rail_x, cy), 16, facecolor=C["white"],
                        edgecolor=C["navy"] if i == 0 else C["line"],
                        linewidth=1.8, zorder=3))
    text(rail_x, cy + 0.5, f"{i+1:02d}", 7.7,
         C["navy"] if i == 0 else C["muted"], "bold", ha="center")
text(48, 490, "SEQUENTIAL TASK FLOW", 8.3, C["muted"], "bold",
     ha="center", rotation=270)

# Handoff explanation above the agent cards
text(160, 222,
     "Research Planner dispatches each sub-agent in order and carries results forward.",
     9.5, C["muted"])

rows = [
    {
        "y": 236, "role": "RESEARCH PLANNER", "mode": "PRIMARY · COORDINATOR",
        "task": "Define scope and frame key research questions",
        "output": "RESEARCH PLAN",
        "accent": C["teal"], "fill": C["white"], "edge": C["border"],
        "pills": [("LLM", C["navy"], C["white"], 50),
                  ("TASK", C["teal_pale"], C["teal_dark"], 58)],
    },
    {
        "y": 359, "role": "INTERNET RESEARCHER", "mode": "SUBAGENT",
        "task": "Find source-backed evidence for each question",
        "output": "EVIDENCE DOSSIER",
        "accent": C["teal"], "fill": C["white"], "edge": C["border"],
        "pills": [("LLM", C["navy"], C["white"], 50),
                  ("WEB SEARCH", C["slate_pale"], C["navy"], 90),
                  ("WEB FETCH", C["slate_pale"], C["navy"], 84)],
    },
    {
        "y": 482, "role": "FACT CHECKER", "mode": "SUBAGENT · QUALITY GATE",
        "task": "Validate key claims, dates and figures",
        "output": "VERIFICATION LOG",
        "accent": C["amber"], "fill": C["amber_pale"], "edge": C["amber_border"],
        "pills": [("LLM", C["navy"], C["white"], 50),
                  ("WEB SEARCH", C["white"], C["amber_dark"], 90),
                  ("WEB FETCH", C["white"], C["amber_dark"], 84)],
    },
    {
        "y": 605, "role": "REPORT WRITER", "mode": "SUBAGENT",
        "task": "Synthesize verified findings into a report",
        "output": "FINAL REPORT",
        "accent": C["teal_dark"], "fill": C["white"], "edge": C["border"],
        "pills": [("LLM", C["navy"], C["white"], 50),
                  ("NO WEB TOOLS", C["slate_pale"], C["muted"], 104)],
    },
]

card_x, card_w, card_h = 160, 1350, 110
for row in rows:
    y = row["y"]
    cy = y + card_h / 2
    # Agent card and restrained accent bar
    rounded(card_x, y, card_w, card_h, row["fill"], row["edge"], lw=1.0, radius=15)
    rounded(card_x, y + 2, 5, card_h - 4, row["accent"], row["accent"], lw=0, radius=2)
    ax.plot([rail_x + 16, card_x], [cy, cy], color=C["line"], linewidth=1.4, zorder=1)

    # Role column
    text(190, y + 31, row["role"], 15.2, C["navy"], "bold")
    mode_color = C["amber_dark"] if "QUALITY" in row["mode"] else C["muted"]
    text(190, y + 63, row["mode"], 8.2, mode_color, "bold")

    # Task and handoff column
    text(560, y + 25, "TASK", 8.0, C["subtle"], "bold")
    text(560, y + 47, row["task"], 10.7, C["ink"], "normal")
    text(560, y + 76, "HANDOFF", 7.6, C["subtle"], "bold")
    output_face = C["amber"] if "VERIFICATION" in row["output"] else C["teal_pale"]
    output_ink = C["white"] if "VERIFICATION" in row["output"] else C["teal_dark"]
    pill(625, y + 64, row["output"], output_face, output_ink,
         width=154 if "EVIDENCE" in row["output"] else (164 if "VERIFICATION" in row["output"] else 132),
         height=23, edge=row["accent"], size=7.8)

    # Model and tool capability column
    text(1112, y + 25, "CAPABILITIES", 7.8, C["subtle"], "bold")
    px = 1112
    for label, face, ink, width in row["pills"]:
        pill(px, y + 42, label, face, ink, width=width, height=25,
             edge=C["border"] if face in (C["white"], C["slate_pale"]) else face,
             size=7.5)
        px += width + 7

# Input and final report cards
# Place these over the connector line edges so the nodes read as clear endpoints.
rounded(160, 153, 1350, 54, C["teal_pale"], C["teal_border"], lw=1.2, radius=14)
pill(180, 168, "INPUT", C["teal"], C["white"], width=62, height=24, size=8.7)
text(260, 174, "RESEARCH QUESTION", 12.3, C["navy"], "bold")
text(260, 192, "Topic, scope and desired depth", 9.7, C["muted"])
text(1477, 180, "START", 8.8, C["teal_dark"], "bold", ha="right")

rounded(160, 767, 1350, 54, C["navy"], C["navy"], lw=1.0, radius=14)
pill(180, 782, "OUTPUT", C["teal"], C["white"], width=70, height=24, size=8.4)
text(270, 794, "RESEARCH REPORT", 12, C["white"], "bold")
text(1477, 794, "SOURCE-LINKED · VERIFIED CLAIMS", 8.4, "#C9D8E4", "bold", ha="right")

# Model note
pill(160, 846, "MODEL ROUTING", C["teal_pale"], C["teal_dark"],
     width=118, height=26, edge=C["teal_border"], size=7.8)
text(294, 859,
     "Sub-agents inherit the primary model by default; per-agent overrides are available.",
     9.2, C["muted"])
text(1510, 859, "CODEARTS CUSTOM AGENTS", 8.2, C["subtle"], "bold", ha="right")

fig.savefig(OUT / "deep-research-workflow.png", dpi=100,
            facecolor=C["bg"], metadata={"Title": "CodeArts Deep Research Workflow"})
fig.savefig(OUT / "deep-research-workflow.svg",
            facecolor=C["bg"], metadata={"Title": "CodeArts Deep Research Workflow"})
plt.close(fig)