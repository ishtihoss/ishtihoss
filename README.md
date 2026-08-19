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

<img src="./assets/research.svg" alt="Tab Namer 77M readout: shipped FLAN-T5-small line; +4.17 versus Google base on 500 tasks; holdout means 7.59 and 7.55; open weights on Hugging Face." width="100%" />

**[Tab Namer 77M](https://huggingface.co/porkr/porkicoder-tab-namer-77m)** names [PorkiCoder](https://porkicoder.com) terminal tabs from a short task description. Tiny 12.7M and 35M from-scratch models could pick a real noun and still scramble English. This file starts from Google FLAN-T5-small, then a few hours of extra training on DigitalOcean Ada GPUs.

Weights: **[huggingface.co/porkr/porkicoder-tab-namer-77m](https://huggingface.co/porkr/porkicoder-tab-namer-77m)**. On 500 held-out tasks the trained model averaged **7.28** against Google's unchanged **3.12** (+4.17). Two later 1,000-task holdouts sit at **7.59** and **7.55**.

| Link | What |
|:--|:--|
| **[Open weights](https://huggingface.co/porkr/porkicoder-tab-namer-77m)** | 77M Title-SFT FLAN, raw greedy titles, 20 Google-vs-ours examples on the card |
| **[Session 11 ship note](https://porkicoder.com/research/session11_results.html)** | Continue-SFT on the leak-checked mix; holdout 1000 / 1000b |
| **[Research index](https://porkicoder.com/research/)** | Earlier campaign notes |

<img src="./assets/section-03-operations.svg" alt="03 · Active operations — shipped end to end" width="100%" />

Each of these is designed, built, deployed, and supported solo — models, product, backend, billing, releases.

| Operation | Class | Brief |
|:--|:--|:--|
| **[porkicoder](https://porkicoder.com)** | Agentic coding assistant | Desktop agent that reads code, edits files, runs commands, and coordinates parallel sub-agents. Ships the Title-SFT FLAN tab namer on-device. |
| **[resumehog](https://resumehog.com)** | Resume optimization | Tailors a resume to a specific role by matching what hiring teams actually screen for. |
| **[hogmatix](https://hogmatix.com)** | X automation | Schedules posts and operates multiple X accounts from one place. |

<img src="./assets/section-04-upstream.svg" alt="04 · Upstream — open source" width="100%" />

Patches sent upstream to MLX. The count below is live from the GitHub API.

[![PRs to MLX](https://img.shields.io/github/issues-search?query=repo%3Aml-explore%2Fmlx%20author%3Aishtihoss%20type%3Apr&style=flat-square&label=PRs%20to%20MLX&labelColor=0A1220&color=FF9E2C&logo=apple&logoColor=FF9E2C)](https://github.com/ml-explore/mlx/pulls?q=is%3Apr+author%3Aishtihoss)

<img src="./assets/section-05-loadout.svg" alt="05 · Loadout — technical range" width="100%" />

<img src="./assets/loadout.svg" alt="Models and training: PyTorch, Transformers, seq2seq T5, distillation, MLX, ONNX Runtime. Agents and product: JavaScript, Electron, Node.js, Claude Agent SDK, MCP, Python. Infrastructure and evaluation: AWS, Cloudflare, Linux, Supabase and Postgres, GPU fleets, LLM-judge evaluations." width="100%" />

<img src="./assets/section-06-telemetry.svg" alt="06 · Telemetry — GitHub activity" width="100%" />

<!-- Regenerated twice daily by .github/workflows/profile-graphics.yml from the GitHub GraphQL API. -->
<img src="https://raw.githubusercontent.com/ishtihoss/ishtihoss/output/telemetry.svg" alt="Contribution log: total contributions, current and longest streak, and the last 52 weeks of activity." width="100%" />

<div align="center">

<img height="170" alt="GitHub activity" src="https://ghstats.porkicoder.com/api?username=ishtihoss&show_icons=true&include_all_commits=true&count_private=true&hide_rank=true&hide_border=false&custom_title=Activity&title_color=FF9E2C&icon_color=FF9E2C&text_color=DCE6F0&bg_color=135,04070D,0F1B2E&border_color=2C4262&border_radius=4" />
<img height="170" alt="Most-used languages" src="https://ghstats.porkicoder.com/api/top-langs/?username=ishtihoss&layout=compact&langs_count=8&hide_progress=true&hide_border=false&custom_title=Languages&title_color=FF9E2C&text_color=DCE6F0&bg_color=135,04070D,0F1B2E&border_color=2C4262&border_radius=4" />

</div>

<img src="./assets/footer.svg" alt="End of dossier — Vancouver: models, products, infrastructure, support." width="100%" />
