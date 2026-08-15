<!-- ishtihoss/ishtihoss · GitHub profile README -->
<!-- Aesthetic: deep-space holo UI. Amber + cyan on navy, chamfered panels, dossier framing. -->
<!-- Static graphics: `npm run build` → tools/build-assets.mjs → assets/*.svg -->
<!-- Live telemetry: .github/workflows/profile-graphics.yml → tools/fetch-telemetry.mjs + tools/build-telemetry.mjs → `output` branch -->

<div align="center">

<a href="https://ishti.dev">
  <img src="./assets/profile-header.svg" alt="Ishtiaque Hossain — AI engineer and ML researcher in Vancouver. Trains small models, ships the products around them. Status: online." width="100%" />
</a>

[![Uplink](https://img.shields.io/badge/UPLINK-ishti.dev-FF9E2C?style=flat-square&labelColor=0A1220&logo=googlechrome&logoColor=FF9E2C)](https://ishti.dev) [![LinkedIn](https://img.shields.io/badge/LINKEDIN-ishtihoss-FF9E2C?style=flat-square&labelColor=0A1220&logo=linkedin&logoColor=FF9E2C)](https://linkedin.com/in/ishtihoss/) [![X](https://img.shields.io/badge/X-hornswoggle567-FF9E2C?style=flat-square&labelColor=0A1220&logo=x&logoColor=FF9E2C)](https://x.com/hornswoggle567)

</div>

<img src="./assets/section-01-dossier.svg" alt="01 · Dossier — personnel file" width="100%" />

I'm an AI engineer and ML researcher in Vancouver. I train small models and ship the products around them — as one person, end to end: research question, training runs, evaluation, product design, backend, infrastructure, releases, and support.

Current focus: sub-100M-parameter models that run locally inside my own products, held to preregistered, blinded evaluation against strong baselines. I also contribute upstream to **[MLX](https://github.com/ml-explore/mlx)**, Apple's machine-learning framework for Apple silicon.

<img src="./assets/section-02-research.svg" alt="02 · Research — latest work: Tab Namer" width="100%" />

<img src="./assets/research.svg" alt="Tab Namer readout: 35M parameters versus FLAN-T5-small at 77M; +0.75 sealed paired margin with a blinded judge on 1,000 samples; 4.86 million body-to-title training pairs from scratch; 31 matched control runs in The Sniff Test." width="100%" />

**Tab Namer** is a 35M-parameter local model that names [PorkiCoder](https://porkicoder.com) terminal tabs from a bounded task description — trained from scratch, distilled from frontier teachers, and shipped on-device. The write-ups, published with reproducible payloads and SHA-256 manifests:

| Paper | Finding |
|:--|:--|
| **[Four beams, no new weights](https://porkicoder.com/research/tab-namer-four-beams.html)** | Same 35M checkpoint, beam-4 over visible page-word pairs. Beat the title-tuned FLAN-T5-small (77M) stack on the preregistered sealed 1,000: 6.20 vs 5.45, paired +0.752 (95% CI 0.61–0.89) — while honestly reporting that the conjunctive usefulness gate did not clear. |
| **[Mid-pack GSG](https://porkicoder.com/research/tab-namer-mid-gsg.html)** | A new 35M trained from scratch on 4.86M body→title pairs catches the previous locked stack and ties raw FLAN on a blinded four-way packet, at half FLAN's size. |
| **[The Sniff Test](https://porkicoder.com/research/the-sniff-test.html)** | A 12.7M model *seemed* to stop repeating words after reading Jules Verne. 31 matched control runs showed it was a seed lottery, not a mechanism — one run is not evidence. |

<img src="./assets/section-03-operations.svg" alt="03 · Active operations — shipped end to end" width="100%" />

Each of these is designed, built, deployed, and supported solo — models, product, backend, billing, releases.

| Operation | Class | Brief |
|:--|:--|:--|
| **[porkicoder](https://porkicoder.com)** | Agentic coding assistant | Desktop agent that reads code, edits files, runs commands, and coordinates parallel sub-agents. Ships local models (Tab Namer) on-device. |
| **[resumehog](https://resumehog.com)** | Resume optimization | Tailors a resume to a specific role by matching what hiring teams actually screen for. |
| **[hogmatix](https://hogmatix.com)** | X automation | Schedules posts and operates multiple X accounts from one place. |

<img src="./assets/section-04-upstream.svg" alt="04 · Upstream — open source" width="100%" />

Patches sent upstream to MLX. The count below is live from the GitHub API.

[![PRs to MLX](https://img.shields.io/github/issues-search?query=repo%3Aml-explore%2Fmlx%20author%3Aishtihoss%20type%3Apr&style=flat-square&label=PRs%20to%20MLX&labelColor=0A1220&color=FF9E2C&logo=apple&logoColor=FF9E2C)](https://github.com/ml-explore/mlx/pulls?q=is%3Apr+author%3Aishtihoss)

<img src="./assets/section-05-loadout.svg" alt="05 · Loadout — technical range" width="100%" />

<img src="./assets/loadout.svg" alt="Models and training: PyTorch, Transformers, seq2seq T5, distillation, MLX, ONNX Runtime. Agents and product: TypeScript, Electron, Node.js, Claude Agent SDK, MCP, Python. Infrastructure and evaluation: AWS, Cloudflare, Linux, Supabase and Postgres, GPU fleets, LLM-judge evaluations." width="100%" />

<img src="./assets/section-06-telemetry.svg" alt="06 · Telemetry — GitHub activity" width="100%" />

<!-- Regenerated twice daily by .github/workflows/profile-graphics.yml from the GitHub GraphQL API. -->
<img src="https://raw.githubusercontent.com/ishtihoss/ishtihoss/output/telemetry.svg" alt="Contribution log: total contributions, current and longest streak, and the last 52 weeks of activity." width="100%" />

<div align="center">

<img height="170" alt="GitHub activity" src="https://ghstats.porkicoder.com/api?username=ishtihoss&show_icons=true&include_all_commits=true&count_private=true&hide_rank=true&hide_border=false&custom_title=Activity&title_color=FF9E2C&icon_color=FF9E2C&text_color=DCE6F0&bg_color=135,04070D,0F1B2E&border_color=2C4262&border_radius=4" />
<img height="170" alt="Most-used languages" src="https://ghstats.porkicoder.com/api/top-langs/?username=ishtihoss&layout=compact&langs_count=8&hide_progress=true&hide_border=false&custom_title=Languages&title_color=FF9E2C&text_color=DCE6F0&bg_color=135,04070D,0F1B2E&border_color=2C4262&border_radius=4" />

</div>

<img src="./assets/footer.svg" alt="End of dossier — Vancouver: models, products, infrastructure, support." width="100%" />
