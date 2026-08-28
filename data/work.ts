import type { L10n } from "@/lib/i18n";

export type WorkKind = "research" | "ai" | "backend";

/** 수치 비교 한 줄. before가 있으면 "이전 → 이후"로 렌더링된다. */
export interface Metric {
  label: L10n;
  before?: string;
  after: string;
  note?: L10n;
}

export interface CaseStudy {
  /** 상세 페이지 최상단 한 문단 */
  lead: L10n;
  problem: L10n<string[]>;
  /** 팀 프로젝트에서 내가 실제로 맡은 범위 — 팀 성과와 섞어 쓰지 않는다 */
  role: L10n<string[]>;
  approach: L10n<string[]>;
  metrics?: Metric[];
  /** metrics 표 아래에 붙는 해설 */
  result?: L10n<string[]>;
  retrospective?: L10n<string[]>;
}

export interface WorkItem {
  slug: string;
  title: L10n;
  /** 목록 카드에 쓰는 한 줄 요약 */
  summary: L10n;
  period: string;
  ongoing: boolean;
  kind: WorkKind;
  /** 팀 규모. 없으면 개인 프로젝트로 표시 */
  team?: number;
  tech: string[];
  links: { label: string; href: string }[];
  /** 상세 기록 — metrics는 타임라인 카드의 전후 차트에 쓰인다 */
  study?: CaseStudy;
}

export const work: WorkItem[] = [
  {
    slug: "shorts-pipeline",
    title: {
      ko: "유튜브 쇼츠 제작 자동화 파이프라인",
      en: "YouTube Shorts Production Pipeline",
    },
    summary: {
      ko: "매 정각 AI가 주제를 조사해 대본을 쌓고, 폰에서 한 편을 고르면 말투 교정 → 목소리 → 이미지 → 영상 → 자막 합성을 로컬 PC의 GPU에서 로컬 모델로 끝내 검수용 쇼츠를 만듭니다. API 토큰 비용은 없고, 컷 하나만 고치면 그 컷만 다시 만듭니다.",
      en: "Every hour an AI researches a topic and stacks a script; pick one from your phone and local models on the local PC's GPU handle the voice edit, narration, images, video and captions, delivering a Short ready for review. No API token costs — and fix one cut and only that cut is rebuilt.",
    },
    period: "2026.08",
    ongoing: true,
    kind: "ai",
    tech: [
      "Python",
      "FastAPI",
      "SwiftUI",
      "ComfyUI",
      "Qwen3-TTS",
      "Qwen3-8B QLoRA",
      "MoviePy",
    ],
    links: [],
    study: {
      lead: {
        ko: "쇼츠 한 편을 만들려면 조사·대본·녹음·비주얼·편집을 전부 따로 해야 합니다. 이 프로젝트는 그 과정을 프로그램 하나로 묶고, 사람은 '고르기·검수·수락'만 하게 만든 개인 프로젝트입니다. 말투 교정·목소리·이미지·영상 생성이 전부 로컬 PC의 GPU에서 로컬 모델로 돌기 때문에 API 토큰 비용이 들지 않고, 아이폰 앱으로 밖에서 진행 상황을 보고 고칩니다. 아래 이미지는 이 파이프라인이 실제로 만든 쇼츠의 장면입니다.",
        en: "Making one Short means doing research, script, recording, visuals and editing separately. This solo project ties that whole process into one program and leaves people with three jobs: pick, review, approve. Voice editing, narration, image and video generation all run as local models on the local PC's GPU, so there are no API token costs, and an iPhone app lets me watch and fix things from anywhere. The frames below are from Shorts this pipeline actually produced.",
      },
      problem: {
        ko: [
          "한 편에 3시간 — 대본을 쓰고, 읽고, 그림을 찾고, 자르고 붙이는 일을 매번 손으로 해야 합니다.",
          "생성 AI를 하나씩 쓰는 건 쉽지만, 단계 사이를 사람이 이어 붙이는 순간 자동화가 아니게 됩니다.",
          "영상 생성만 편당 한 시간이 넘어 PC 앞에 붙어 있을 수 없습니다. 밖에서 확인하고, 마음에 안 드는 컷 하나만 고칠 수 있어야 했습니다.",
        ],
        en: [
          "Three hours per Short — writing the script, reading it, finding visuals, cutting and joining, all by hand every time.",
          "Using generative AI one tool at a time is easy; the moment a person has to stitch the steps together, it stops being automation.",
          "Video generation alone takes over an hour per episode, so I can't sit at the PC. I needed to check from outside and fix just the one cut I didn't like.",
        ],
      },
      role: {
        ko: [
          "개인 프로젝트 — 설계·구현·운영 전부.",
          "파이프라인(교정·음성·이미지·영상·합성), 백엔드, 아이폰 앱, 말투 교정 모델 학습.",
        ],
        en: [
          "Solo project — design, implementation and operations.",
          "The pipeline (correction, narration, image, video, render), the backend, the iPhone app, and training the voice-style model.",
        ],
      },
      approach: {
        ko: [
          "**주제 조사 · 대본** — Claude Cowork이 매 정각 무인으로 주제 하나를 조사하고, 출처를 붙여 대본 명세를 스택에 쌓습니다. 사람은 스택에서 만들 편을 고르기만 합니다.",
          "**말투 교정** — 대본을 채널 말투(해요체 구어)로 고칩니다. 직접 만든 교정 데이터로 로컬 모델을 학습시켜, 사실과 숫자는 그대로 두고 말투만 바꿉니다.",
          "**목소리** — 채널 목소리 하나를 복제해 모든 컷을 같은 목소리로 읽고, 음성 인식으로 다시 들어 문장 끝이 잘리면 자동으로 다시 만듭니다.",
          "**이미지 · 영상** — 컷마다 이미지를 만들고 그 이미지를 움직이는 영상으로 바꿉니다(ComfyUI, 로컬 GPU). 영상 길이는 음성 길이에 맞춥니다.",
          "**합성** — 영상·음성·자막(말하는 문장 그대로)을 1080×1920 쇼츠로 합쳐 검수 폴더에 넣습니다.",
          "**아이폰 앱** — 스택 검색과 여러 편 대기열, 단계별 진행률과 GPU 상태, 완성 영상 바로 재생, 수락/반려. 컷 하나의 문장이나 이미지 프롬프트를 고치면 그 컷만 다시 만들고, '컷 3 더 쉽게 풀어 줘'처럼 대화로 수정 제안을 받아 고른 것만 적용합니다.",
          "**이어서 만들기** — 모든 단계가 결과를 캐시하므로 실패하거나 고쳐도 바뀐 부분만 다시 만듭니다. 맥북이 옆에 있으면 GPU가 필요 없는 단계를 가져가고, 없으면 PC 혼자 끝냅니다.",
        ],
        en: [
          "**Research & script** — Every hour, Claude Cowork researches one topic unattended, attaches sources and stacks a script spec. People only pick which one to make.",
          "**Voice edit** — The script is rewritten in the channel's voice (casual spoken Korean). A local model trained on my own correction data changes only the tone, never the facts or figures.",
          "**Narration** — One channel voice is cloned so every cut sounds the same; each line is transcribed back by speech recognition and regenerated automatically if the ending got clipped.",
          "**Image & video** — An image is generated for every cut, then animated into a clip (ComfyUI on the local GPU). Clip length follows the narration.",
          "**Render** — Video, voice and captions (the spoken sentence, verbatim) are combined into a 1080×1920 Short and placed in the review folder.",
          "**iPhone app** — Search the stack, queue several episodes, watch per-stage progress and GPU status, play the finished video, approve or reject. Edit one cut's sentence or image prompt and only that cut is rebuilt; ask in chat — 'make cut 3 simpler' — and pick from the proposed edits.",
          "**Resume, don't restart** — Every stage caches its output, so a failure or an edit only rebuilds what changed. When the MacBook is nearby it takes the GPU-free stages; when it isn't, the PC finishes alone.",
        ],
      },
      result: {
        ko: [
          "대본 명세 하나를 큐에 넣으면 사람 개입 없이 검수용 쇼츠(50~60초)가 나옵니다. 편당 80~105분, 지금까지 검수까지 6편.",
          "컷 하나 고친 뒤 다시 만드는 데는 3~4분 — 전체를 다시 만들 필요가 없습니다.",
          "말투 교정·목소리·이미지·영상 생성이 전부 로컬 모델이라 API 토큰 비용이 0입니다.",
        ],
        en: [
          "Queue one script spec and a review-ready Short (50–60 s) comes out with no human involvement. 80–105 minutes per episode; 6 episodes have reached review so far.",
          "Rebuilding after a one-cut edit takes 3–4 minutes — no need to redo the whole episode.",
          "Voice editing, narration, image and video generation are all local models — zero API token cost.",
        ],
      },
      retrospective: {
        ko: [
          "업로드는 다음 단계입니다. 지금은 검수용 mp4에서 끝나고, 폰에서 '수락'하면 유튜브에 올라가고 조회수·시청 유지율을 모아 다음 대본 지침에 반영하는 루프가 남았습니다.",
          "전자동이 목표가 아니었습니다. 사람이 잡는 지점(고르기·검수·수락)을 먼저 정하니 나머지 설계가 단순해졌습니다.",
        ],
        en: [
          "Upload is the next step. The pipeline currently ends at a review-ready mp4; what remains is the loop where tapping 'approve' on the phone publishes to YouTube and views and retention feed back into the next script brief.",
          "Full automation was never the goal. Fixing the human checkpoints first — pick, review, approve — made the rest of the design simple.",
        ],
      },
    },
  },
  {
    slug: "goldenlink-ocr",
    title: {
      ko: "골든링크 — 서류 인식 · 통화 음성 인식 파이프라인",
      en: "GoldenLink — Document & Call-Audio Recognition Pipelines",
    },
    summary: {
      ko: "응급이송 지원 플랫폼의 문서 인식·통화 음성 인식 모듈. 문서는 영역별 라우팅으로 재현율 68% → 88%(VRAM 1/4), 통화는 정확 일치 사전으로 오교정 없이 STT를 보정.",
      en: "Document and call-audio recognition modules for an emergency transport platform. Region-level routing lifted document recall from 68% to 88% at a quarter of the VRAM; call transcripts are corrected with an exact-match dictionary that can't mis-correct by construction.",
    },
    period: "2026.07",
    ongoing: true,
    kind: "ai",
    team: 6,
    tech: [
      "Python",
      "ONNX Runtime",
      "PaddleOCR-VL",
      "DocLayout-YOLO",
      "faster-whisper",
      "Ollama · Qwen3",
      "Hugging Face",
    ],
    links: [
      {
        label: "GitHub (OCR)",
        href: "https://github.com/podongchip-stack/AIRookie/tree/feature/info/ocr",
      },
      {
        label: "GitHub (Voice)",
        href: "https://github.com/podongchip-stack/AIRookie/tree/feature/voice/voice",
      },
      {
        label: "Hugging Face",
        href: "https://huggingface.co/podongchip/DocLayout-YOLO-DocStructBench-ONNX",
      },
    ],
    study: {
      lead: {
        ko: "2026 AI ROOKIE 대회 출품작 '골든링크'는 응급이송 과정의 정보를 자동으로 구조화해 병원 수용 판단을 돕는 플랫폼입니다. 저는 6인 팀에서 두 갈래를 맡았습니다 — 병원 서류 이미지를 텍스트·필드로 바꾸는 온프레미스 OCR 모듈(feature/info)과, 구급대-병원 통화를 받아써 오인식을 보정하고 SBAR로 구조화하는 음성 파이프라인(feature/voice)입니다.",
        en: "GoldenLink, our entry for the 2026 AI ROOKIE competition, structures information during emergency transport so hospitals can decide faster. On a team of six I owned two tracks: the on-premise OCR module (feature/info) that turns hospital document images into text and fields, and the voice pipeline (feature/voice) that transcribes ambulance-to-hospital calls, corrects misrecognitions, and structures them as SBAR.",
      },
      problem: {
        ko: [
          "구급대원이 병원에 순차적으로 전화를 돌리는 이른바 '뺑뺑이' 때문에 골든타임이 새어 나갑니다. 골든링크는 첫 통화 내용을 구조화해 존(Zone) 내 후보 병원 전체에 동시에 전달하는 것으로 이 문제를 풉니다.",
          "그러려면 병원이 발급하는 서류 이미지를 기계가 읽을 수 있어야 합니다. 다만 환자 정보를 다루므로 외부 상용 API로 데이터를 내보낼 수 없고, 모든 처리가 로컬에서 끝나야 한다는 제약이 있었습니다.",
          "처음에는 페이지 전체를 인식 모델에 한 번에 넣었습니다. 재현율이 68%에 그쳤고, 팩스로 들어온 저품질 문서에서는 5%까지 떨어졌습니다. VRAM은 8GB를 넘겼고 같은 문장을 무한히 반복 생성하는 루프도 잦았습니다.",
          "구급대-병원 통화도 마찬가지로 기계가 이해할 수 있는 형태로 바뀌어야 합니다. 하지만 Whisper 같은 STT 모델은 '심정지가 왔었습니다'를 '심정도 너무 왔었습니다'로 듣는 것처럼 의료 용어를 오인식하는 경우가 실측으로 확인됐고, 통화 한 건이 곧 응급실 수용 판단으로 이어지므로 이 오류를 그대로 넘길 수 없었습니다.",
          "기존에는 발화를 의료/비의료로 분류해 잡담을 걸러내는 임베딩 유사도 필터(threshold ≥ 0.4)가 있었지만, 이 threshold는 실제 통화 데이터로 검증된 적이 없었고 애초에 '단어 오인식'이라는 문제 자체는 고치지 못했습니다.",
        ],
        en: [
          "Paramedics call hospitals one after another, and the golden hour drains away in the process. GoldenLink attacks this by structuring the first call and broadcasting it to every candidate hospital in the zone at once.",
          "That requires machine-readable hospital documents. Because the data is patient information, nothing may leave for a commercial API — every step has to finish locally.",
          "My first attempt pushed the whole page through the recognition model in one prompt. Recall stalled at 68%, and on low-quality faxed documents it collapsed to 5%. VRAM peaked above 8GB and the model frequently fell into infinite repetition loops.",
          "Ambulance-to-hospital calls need the same machine-readable treatment. But Whisper-class STT models measurably mis-hear medical terms — \"cardiac arrest occurred\" was transcribed as a near-homophone nonsense phrase — and a single call directly feeds a hospital's admission decision, so that error couldn't just be passed along.",
          "We used to filter chit-chat out of the transcript with an embedding-similarity classifier (threshold ≥ 0.4), but that threshold was never validated against real call data, and it never addressed word-level misrecognition in the first place.",
        ],
      },
      role: {
        ko: [
          "OCR 모듈 전체 설계와 구현 (레이아웃 검출 · 라우팅 · 인식 · 검증 · 필드 추출 · 근거 대조).",
          "라이선스 검토와 ONNX 변환본 재배포.",
          "한글 실물 문서 15장(핵심 문자열 268개)으로 정답지를 만들고 성능을 측정.",
          "음성 파이프라인의 오인식 교정 단계를 새로 설계해 실운영에 이식 — 임베딩 유사도 필터를 정확 일치 사전 교정으로 교체.",
          "Windows GPU 환경의 CUDA DLL 크래시 수정, 장치 자동 폴백(auto → cpu) 정리.",
          "OCR·음성 두 파이프라인의 시연용 GUI 제작. 음성 쪽은 시연 화면이 실운영 모듈을 그대로 import하도록 구조를 정리해 시연 결과와 실제 결과가 갈릴 수 없게 함.",
          "저장소 초기 구조와 브랜치 전략 수립.",
          "E-Gen 공개 API 연동, 병원 신뢰도 진단, 매칭 엔진, 대시보드는 다른 팀원이 맡았고, 아래 수치는 제가 담당한 OCR·음성 모듈에 한정된 것입니다.",
        ],
        en: [
          "Designed and implemented the whole OCR module — layout detection, routing, recognition, validation, field extraction, evidence grounding.",
          "Reviewed licensing and republished an ONNX conversion of the layout model.",
          "Built the ground truth set (15 real Korean documents, 268 key strings) and measured against it.",
          "Redesigned the voice pipeline's correction stage and shipped it to production — replaced the embedding-similarity filter with exact-match dictionary correction.",
          "Fixed a CUDA DLL crash on Windows GPU rigs and cleaned up the automatic device fallback (auto → cpu).",
          "Built the demo GUIs for both the OCR and voice pipelines. For voice, restructured the demo to import the production modules directly, so the demo can't diverge from what actually runs.",
          "Set up the repository structure and branching strategy.",
          "The E-Gen API integration, hospital reliability scoring, matching engine and dashboard were owned by teammates; every number below is scoped to the OCR and voice modules I owned.",
        ],
      },
      approach: {
        ko: [
          "페이지를 통째로 넘기는 대신 네 단계로 쪼갰습니다. ① 레이아웃 검출(AI)로 영역 위치와 종류 10종을 분류하고, ② 규칙 기반으로 중복을 제거해 읽기 순서를 잡은 뒤 종류별 태스크를 배분하고, ③ 영역별로 인식(AI)하되 표는 표 모드, 본문은 OCR 모드로 프롬프트를 나누고, ④ 반복 생성이나 토큰 한도 도달을 규칙으로 잡아 needs_review 플래그를 답니다.",
          "인식 모델은 그대로 두고 입력 방식만 바꾼 것이 핵심입니다. 잘라낸 조각이 작아지니 VRAM이 오히려 크게 줄었고, 페이지 전체를 하나의 프롬프트로 밀어 넣을 때 생기던 무한 반복도 사라졌습니다.",
          "텍스트에서 병원 정보 필드를 뽑는 추출 단계도 새로 만들었습니다. 서류 기본정보 · 야간 당직 · 진료과·인력 · 시술·장비 4개 그룹으로 나눠 문서 1장당 4회 호출하고, JSON Schema로 형식을 제약합니다. 다만 형식이 맞아도 내용이 지어낸 것일 수 있어(워터마크 문서에서 라벨은 읽고 값은 비우는 사례처럼) LLM이 낸 값마다 원문 근거를 같이 받아 (1) 근거가 원문에 있는가 (2) 값이 근거 안에 있는가 (3) 근거가 값을 뒷받침하는가, 세 겹으로 대조합니다. 걸린 값은 결과에서 빼되 왜 뺐는지를 evidence에 남깁니다.",
          "팀 원칙상 어떤 단계가 AI 처리이고 어떤 단계가 규칙 기반인지 구분되어야 해서, 결과 JSON에도 단계별로 source 필드를 남깁니다. 매칭 판단이 설명 가능해야 하기 때문입니다.",
          "음성 쪽은 발화를 임베딩 유사도로 거르던 필터를 걷어내고, 오인식 사전과 정확히 일치하는 구간만 치환하는 방식으로 바꿨습니다. 등록하지 않은 말은 손대지 않으므로 오교정이 구조적으로 생길 수 없고, 유사도 임계값처럼 튜닝할 대상 자체가 없습니다. 대신 등록한 만큼만 잡힌다는 트레이드오프가 있어, 통화에서 새 오인식을 발견할 때마다 사전에 한 줄씩 추가하는 것을 운영 방법으로 삼았습니다. 원문은 항상 별도로 저장해 교정 결과(filtered_text)와 분리해두었습니다.",
          "CUDA 크래시의 근본 원인은 'cublas64_12.dll을 못 찾는다'였는데, pip으로 깐 nvidia 패키지의 DLL이 기본 검색 경로 밖에 있었던 것이 원인이었습니다. faster_whisper를 import하기 전에 그 경로를 등록하는 모듈을 따로 분리했고, 실패가 세그먼트 순회 시점에 터지는 것도 확인해 제너레이터를 미리 list로 소진시켜 자동으로 CPU 폴백이 걸리게 했습니다.",
          "장애 대응도 위치마다 다르게 설계했습니다. 상시 서버(app.py)가 통화를 처리하는 동안 교정 사전이 깨지거나 hub가 죽어 있어도 처리 자체는 멈추지 않게 하고, 반대로 LLM 응답 파싱처럼 데이터 품질에 직결되는 실패는 그 통화만 중단시키되 이미 저장된 원문(STT 텍스트)은 남깁니다.",
        ],
        en: [
          "Instead of one pass over the page, I split it into four stages: (1) an AI layout detector locates regions and classifies them into ten types; (2) a rule-based pass removes duplicates, fixes reading order and routes each region to a task; (3) an AI recognizer reads each region — tables in table mode, body text in OCR mode; (4) rules catch runaway repetition and token-limit hits and flag them as needs_review.",
          "The recognition model never changed — only how it is fed. Smaller crops cut VRAM sharply, and the infinite repetition that came from stuffing a whole page into one prompt disappeared.",
          "I also built the extraction stage that pulls hospital-info fields out of the text: four calls per document across four groups (basic info, night duty, department staffing, procedures/equipment), each constrained by a JSON Schema. But a well-formed value can still be a fabrication — I saw watermarked documents where the label was read but the value was invented — so every value comes back with its source quote, and rules cross-check (1) the quote exists in the source, (2) the value is inside that quote, and (3) the quote actually supports the value. A value that fails is dropped, with the reason recorded in evidence.",
          "Our team rule is that every step must declare whether it is AI or deterministic, so the output JSON carries a source field per stage. Matching decisions have to stay explainable.",
          "For voice, I removed the embedding-similarity filter and replaced it with substitution against a dictionary of exact matches only. Anything not in the dictionary is left untouched, so mis-correction can't happen structurally, and there's no similarity threshold to tune. The trade-off is coverage — only registered misrecognitions get caught — so the operating model is to add a line to the dictionary every time a new one turns up in a call. The raw transcript is always saved separately from the corrected text (filtered_text).",
          "The CUDA crash traced back to a missing cublas64_12.dll — the pip-installed nvidia package's DLLs sat outside the default search path. I split out a module that registers that path before faster_whisper is imported, and since the failure could also surface mid-iteration over segments, I made the generator fully materialize into a list so the CPU fallback reliably kicks in.",
          "Failure handling differs by where it sits. In the always-on server (app.py), a broken correction dictionary or a dead hub shouldn't stop call processing — but a failure that touches data quality, like failing to parse the LLM's response, aborts just that call while keeping the transcript that was already saved.",
        ],
      },
      metrics: [
        {
          label: {
            ko: "핵심 문자열 재현율",
            en: "Key-string recall",
          },
          before: "68%",
          after: "88%",
          note: {
            ko: "한글 실물 문서 15장 · 핵심 문자열 268개 기준",
            en: "Measured on 15 real Korean documents, 268 key strings",
          },
        },
        {
          label: { ko: "VRAM 피크", en: "Peak VRAM" },
          before: "8,312MB",
          after: "2,078MB",
          note: {
            ko: "영역을 나누자 조각이 작아져 4분의 1로 감소",
            en: "Smaller crops brought it down to a quarter",
          },
        },
        {
          label: {
            ko: "저품질(팩스) 문서 재현율",
            en: "Recall on low-quality faxes",
          },
          before: "5%",
          after: "68%",
        },
        {
          label: {
            ko: "ONNX 전환 후 재현율",
            en: "Recall after the ONNX switch",
          },
          before: "87%",
          after: "88%",
          note: {
            ko: "라이선스 회피를 위한 전환이었지만 정확도 손실은 없었음",
            en: "The switch was for licensing, and it cost no accuracy",
          },
        },
      ],
      result: {
        ko: [
          "성능만큼 중요했던 건 라이선스 판단이었습니다. 레이아웃 검출에 쓰려던 DocLayout-YOLO는 가중치가 Apache-2.0인데 실행 패키지는 AGPL-3.0이었습니다. 패키지를 그대로 쓰면 AGPL이 전염되어, 서버로 서비스할 때 우리 소스까지 공개해야 합니다.",
          "그래서 Apache-2.0인 가중치만 ONNX로 변환해 onnxruntime(MIT)으로 실행하도록 바꿨습니다. 저장소에 AGPL 코드도, 그에 의존하는 스크립트도 남기지 않았습니다. 변환본은 원본 출처와 변경 사항, 라이선스를 명시해 Hugging Face에 재배포했습니다.",
          "재현성을 위해 모델 가중치는 저장소에 커밋하지 않고, 저장소 ID와 커밋 SHA를 configs/models.yaml에 고정한 뒤 스크립트로 내려받습니다. 원본이 갱신되어도 같은 결과가 나옵니다.",
          "시연용 GUI를 만들면서 가장 신경 쓴 건 '시연 결과가 실제 운영 결과와 다를 수 있다'는 위험이었습니다. 초기 시뮬레이터는 STT·LLM 호출 로직을 195줄 가까이 복제해 갖고 있었는데, 이를 지우고 실운영 모듈(voice/)을 그대로 import하도록 바꿔 같은 오디오를 넣었을 때 raw_text · filtered_text · 전송 포맷이 글자 단위로 일치하는 것까지 확인했습니다.",
          "오인식 교정은 편집거리·유사도 기반 매칭 대신 정확 일치를 선택했습니다. 대한의사협회 의학용어집처럼 5만 표제어급 사전에 편집거리를 걸면 정상 발화를 오히려 틀리게 고칠 위험이 커지는데, 응급실-구급차 통화는 어휘가 한정적이라 실제로 틀린 것만 정확히 등록하는 편이 안전하고 검증도 쉬웠습니다.",
        ],
        en: [
          "The licensing call mattered as much as the numbers. DocLayout-YOLO ships Apache-2.0 weights inside an AGPL-3.0 runtime package. Using the package as-is would make AGPL infectious — serving it would force us to open our own source.",
          "So I converted only the Apache-2.0 weights to ONNX and ran them through onnxruntime (MIT). No AGPL code, and nothing depending on it, remains in the repository. I republished the conversion on Hugging Face with the original source, the changes and the license spelled out.",
          "For reproducibility the weights are never committed. configs/models.yaml pins the repository ID and commit SHA, and a script fetches them — so the result stays identical even if upstream moves.",
          "Building the demo GUI, the risk I cared about most was the demo diverging from production. The original simulator duplicated close to 195 lines of STT/LLM call logic; I deleted that and had it import the production module (voice/) directly, then confirmed that raw_text, filtered_text, and the outbound payload matched byte-for-byte on the same audio.",
          "I chose exact-match over edit-distance or similarity-based correction. Running edit distance against a dictionary the size of a medical glossary (tens of thousands of terms) risks mis-correcting normal speech; ER-to-ambulance calls use a narrow enough vocabulary that registering only confirmed errors, exactly, was safer and easier to verify.",
        ],
      },
      retrospective: {
        ko: [
          "모델을 바꾸기 전에 입력을 의심하는 편이 빨랐습니다. 같은 모델인데 입력 단위만 바꿔 재현율이 20%p 올랐고, 흔히 트레이드오프라고 여기는 정확도와 메모리가 이번엔 같은 방향으로 움직였습니다.",
          "이후 텍스트 → 필드 추출 단계(근거 대조 · 어휘 검증 포함)도 구현을 마쳤습니다. 다만 지금까지의 실측(합성 서류 53건, 근거 통과율 72.4%)은 전부 진짜 병원 서류가 아닌 합성 서류 기준이라, 실제 서류에서의 재현율·통과율은 아직 측정 전입니다 — 사람이 정답지를 채워야 잴 수 있는 값입니다.",
          "음성 쪽에서는 '정확도를 얼마나 올리는가'보다 '틀렸을 때 어느 방향으로 틀리는가'를 먼저 따졌습니다. 유사도 기반 필터는 잘못 걸리면 중요한 문장을 조용히 지워버리지만, 정확 일치 교정은 최악의 경우에도 '못 고친 채로 넘어가는' 정도입니다. 상시 서버 안에서 실패 지점마다 계속할지 멈출지를 다르게 설계한 것도 같은 맥락이었습니다.",
          "두 파이프라인이 뽑아낸 결과(DocumentFields, 교정된 통화 텍스트)를 병원 실시간 정보와 합치는 단계는 아직 없습니다. 서류는 정적이라 좌표·실시간 병상 수는 건드리지 않고 당직·인력처럼 공개 API가 못 채우는 부분만 덮어야 하는데, 그 병합 설계는 남은 작업입니다.",
        ],
        en: [
          "Suspecting the input before the model was the faster path. The same model gained 20 percentage points of recall purely from a change in input granularity, and accuracy and memory — usually a trade-off — moved together.",
          "I later finished the text-to-field extraction stage, evidence grounding and vocabulary checks included. But every measurement so far (53 synthetic documents, 72.4% evidence pass rate) is on synthetic documents, not real hospital paperwork — recall and pass rate on real documents are still unmeasured, and someone has to hand-fill the ground truth to measure them.",
          "For voice, I weighed which direction a failure fails in before I weighed how much accuracy improved. A similarity-based filter can silently drop an important sentence when it misfires; exact-match correction, in the worst case, just leaves an error uncorrected. The same logic shaped which failures the always-on server continues past and which it stops for.",
          "There's no stage yet that merges what these two pipelines produce — DocumentFields, corrected call text — into the hospital's live data. Documents are static, so coordinates and live bed counts shouldn't be touched by them; only what the public API can't fill, like night-duty staffing, should be overlaid. That merge is still unbuilt.",
        ],
      },
    },
  },
  {
    slug: "bms-soc-soh",
    title: {
      ko: "ESS 배터리 SoC · SoH 예측 연구",
      en: "SoC / SoH Prediction for ESS Batteries",
    },
    summary: {
      ko: "EDCL 랩에서 진행 중인 배터리 상태 추정 연구. 시계열 모델로 충전 상태와 수명을 예측합니다.",
      en: "Ongoing battery state estimation research at EDCL Lab, predicting charge state and health with sequence models.",
    },
    period: "2026.03",
    ongoing: true,
    kind: "research",
    tech: ["LSTM", "Transformer", "Ansys", "MATLAB"],
    links: [{ label: "EDCL Lab", href: "https://edcl-page.vercel.app/" }],
  },
  {
    slug: "stock-agent",
    title: {
      ko: "Stock Agent — 주식 분석 에이전트",
      en: "Stock Agent — Stock Analysis Agents",
    },
    summary: {
      ko: "FastAPI 추론 서버와 React 콘솔로 만든 주식 에이전트. 뉴스 감성·재무·차트·공시 에이전트가 매일 데이터를 쌓고 모의투자까지 실행합니다.",
      en: "A FastAPI inference server with a React console — news-sentiment, financials, chart and disclosure agents accumulate data daily and run simulated trading.",
    },
    period: "2025.12",
    ongoing: true,
    kind: "ai",
    tech: ["Python", "FastAPI", "React", "Gemini", "DART · KIS API"],
    links: [
      {
        label: "Dataset",
        href: "https://huggingface.co/datasets/podongchip/kospi-daily-stock-features-2021-2026",
      },
    ],
  },
  {
    slug: "llm-prompt-routing",
    title: {
      ko: "LLM 파인튜닝 · 프롬프트 라우팅",
      en: "LLM Fine-tuning and Prompt Routing",
    },
    summary: {
      ko: "직접 구성한 데이터셋으로 모델을 학습시키고, 사용자 입력을 생성형 AI별 강점에 맞게 다시 쓰는 실험.",
      en: "Fine-tuning on a self-built dataset, then rewriting user input to match the strengths of each generative model.",
    },
    period: "2026.01 – 2026.05",
    ongoing: false,
    kind: "ai",
    tech: ["Python", "Ollama", "Qwen 2.5"],
    links: [
      {
        label: "Dataset",
        href: "https://huggingface.co/datasets/podongchip/korean-ai-prompt-style-dataset",
      },
    ],
  },
  {
    slug: "lab-website",
    title: {
      ko: "연구실 웹사이트 개발 · 운영",
      en: "Lab Website — Development and Operations",
    },
    summary: {
      ko: "EDCL 연구실 웹사이트를 Firebase와 연동해 개발하고 유지보수하고 있습니다.",
      en: "Building and maintaining the EDCL lab website, wired up to Firebase.",
    },
    period: "2026.04",
    ongoing: true,
    kind: "backend",
    tech: ["HTML", "CSS", "JavaScript", "Firebase"],
    links: [{ label: "Website", href: "https://edcl-page.vercel.app/" }],
  },
];

export const workBySlug = new Map(work.map((w) => [w.slug, w]));
