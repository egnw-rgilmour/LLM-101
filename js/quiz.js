/* quiz.js — reusable, keyboard-accessible quiz engine plus the embedded
   question bank for every module. Depends on course.js and progress.js.

   Question shape:
     { q: "question text",
       options: ["a", "b", "c", "d"],
       answer: 2,                       // index of the correct option
       explain: "why this is the answer" }

   The whole bank lives here as plain JS objects (no fetch under file://). */

(function () {
  "use strict";

  var Course = (window.Course = window.Course || {});
  var Quiz = (Course.Quiz = Course.Quiz || {});

  var PASS_RATIO = 0.75; // need 75% to mark a module complete

  /* ---- Question bank ----------------------------------------------------- */
  Quiz.data = {
    "01": [
      {
        q: "Which statement best describes the relationship between AI, machine learning, and deep learning?",
        options: [
          "They are three unrelated fields that happen to share marketing terms.",
          "Deep learning contains machine learning, which contains AI.",
          "AI is the broad goal; machine learning is one approach to it; deep learning is one kind of machine learning.",
          "They all mean exactly the same thing."
        ],
        answer: 2,
        explain:
          "Think of nested circles: AI is the broadest idea (machines doing tasks that seem intelligent), machine learning is a subset that learns from data, and deep learning is a subset of machine learning that uses many-layered neural networks."
      },
      {
        q: "What makes generative AI different from older, classic AI like a spam filter?",
        options: [
          "Generative AI produces new content (text, images, code) rather than only classifying or scoring inputs.",
          "Generative AI never makes mistakes.",
          "Generative AI does not use any data.",
          "Generative AI only works on numbers, not text."
        ],
        answer: 0,
        explain:
          "A spam filter labels existing input. Generative AI creates new output that did not exist before. Both can be useful, but generation is the defining trait of the newer wave of tools."
      },
      {
        q: "A vendor says their product 'uses AI.' What is the most reasonable first reaction?",
        options: [
          "Assume it is fully autonomous and infallible.",
          "Ask what it actually does, since 'AI' is a broad umbrella term that needs clarifying.",
          "Reject it because all AI is the same.",
          "Assume it must be a large language model."
        ],
        answer: 1,
        explain:
          "'AI' covers everything from a simple rules engine to a large language model. The useful question is always: what specific capability does it provide, and how?"
      },
      {
        q: "Which of these is the best everyday analogy for 'a model' in machine learning?",
        options: [
          "A fashion runway model.",
          "A learned set of patterns that maps inputs to outputs, a bit like a very large lookup of tendencies built from examples.",
          "A physical 3D printer.",
          "A single if/else rule written by a developer."
        ],
        answer: 1,
        explain:
          "A model is a set of learned parameters that captures patterns from training data, then applies them to new inputs. It is built from examples rather than hand-written rules."
      },
      {
        q: "True or false: 'generative AI' and 'AI' are interchangeable terms.",
        options: ["True", "False"],
        answer: 1,
        explain:
          "False. Generative AI is one recent, high-profile branch of AI. Plenty of AI (recommendation, fraud detection, forecasting) is not generative."
      }
    ],
    "02": [
      {
        q: "What is the difference between training and inference?",
        options: [
          "Training is when the model learns patterns from data; inference is when the finished model answers a new request.",
          "Training happens on your laptop; inference happens in the cloud.",
          "They are two names for the same step.",
          "Inference happens before training."
        ],
        answer: 0,
        explain:
          "Training is the expensive, one-time-ish learning phase. Inference is running the trained model to get an answer — the part end users actually interact with."
      },
      {
        q: "In IT terms, the 'parameters' (weights) of a trained model are most like…",
        options: [
          "The configuration values learned during training that determine the model's behavior.",
          "The user's password.",
          "The network's firewall rules.",
          "The amount of RAM in the server."
        ],
        answer: 0,
        explain:
          "Parameters are the internal numbers the model adjusted during training. They encode what it learned, similar to a huge set of tuned configuration values."
      },
      {
        q: "Why do GPUs matter so much for deep learning?",
        options: [
          "They store more files than CPUs.",
          "They are good at doing many similar math operations in parallel, which is exactly what neural networks need.",
          "They are the only chips that can run JavaScript.",
          "They replace the need for any training data."
        ],
        answer: 1,
        explain:
          "Neural networks involve enormous amounts of parallel matrix math. GPUs (and similar accelerators) are built for massively parallel arithmetic, making them far faster than CPUs for this work."
      },
      {
        q: "What primarily distinguishes deep learning from other machine learning?",
        options: [
          "It never needs data.",
          "It uses neural networks with many layers that learn features automatically, instead of relying on hand-engineered features.",
          "It only runs on quantum computers.",
          "It is always more accurate for every task."
        ],
        answer: 1,
        explain:
          "Deep learning stacks many layers so the model learns useful representations on its own. Classic ML often needs humans to hand-pick the input features."
      },
      {
        q: "A model performs great in testing but poorly on real-world data. This is most likely…",
        options: [
          "Overfitting — it memorized the training data instead of learning general patterns.",
          "A hardware failure.",
          "Proof the model has become conscious.",
          "A sign it needs a faster GPU."
        ],
        answer: 0,
        explain:
          "Overfitting means the model learned quirks of the training set rather than patterns that generalize. It is a core reason models are tested on data they did not train on."
      }
    ],
    "03": [
      {
        q: "At its core, what is a large language model doing when it generates text?",
        options: [
          "Looking up answers in a database.",
          "Repeatedly predicting the next token (word piece) given everything so far.",
          "Running a web search for each sentence.",
          "Executing hand-written grammar rules."
        ],
        answer: 1,
        explain:
          "An LLM is fundamentally a next-token predictor. It picks a likely next chunk of text, appends it, and repeats — which is enough to produce fluent paragraphs."
      },
      {
        q: "Why can an LLM sound confident and fluent yet still be wrong?",
        options: [
          "It is deliberately lying.",
          "It optimizes for plausible-sounding text, not verified truth, so fluent and correct are not the same thing.",
          "It always copies from Wikipedia.",
          "It only fails when the internet is down."
        ],
        answer: 1,
        explain:
          "Fluency comes from predicting likely wording. The model has no built-in fact-checker, so confident phrasing can accompany incorrect content."
      },
      {
        q: "What does 'model size' (e.g., number of parameters) roughly indicate?",
        options: [
          "The physical weight of the server.",
          "The capacity of the model to capture patterns — bigger often helps, but is not a guarantee of quality.",
          "The exact number of facts it has memorized.",
          "How many users can log in at once."
        ],
        answer: 1,
        explain:
          "Parameter count is a rough measure of capacity. Larger models often perform better, but training data, tuning, and task fit matter just as much."
      },
      {
        q: "An LLM gives a different answer each time you ask the same question. Why?",
        options: [
          "It is broken.",
          "Generation can involve randomness (sampling), so outputs vary unless settings force determinism.",
          "Someone edited the model between requests.",
          "It remembers and avoids repeating itself across users."
        ],
        answer: 1,
        explain:
          "LLMs usually sample from a probability distribution over next tokens, so results can vary run to run. This is a feature for creativity but a challenge for repeatability."
      },
      {
        q: "Which is the safest mental model of an LLM for IT staff?",
        options: [
          "A search engine that returns verified facts.",
          "A very capable autocomplete that is often helpful but must be verified for anything important.",
          "A database of your company's records.",
          "A person who understands consequences."
        ],
        answer: 1,
        explain:
          "Treating an LLM as powerful autocomplete sets the right expectations: useful drafts and explanations, but verify before relying on it."
      }
    ],
    "04": [
      {
        q: "What is a 'token' in the context of an LLM?",
        options: [
          "A security credential.",
          "A chunk of text — often a word or part of a word — that the model reads and predicts.",
          "A single letter, always.",
          "One complete sentence."
        ],
        answer: 1,
        explain:
          "Tokens are the pieces text is broken into. A token is frequently a word or sub-word fragment, not necessarily a whole word or a single character."
      },
      {
        q: "Why does tokenization matter for cost and limits?",
        options: [
          "It does not; pricing is per question.",
          "Usage and context limits are measured in tokens, so longer or unusual text uses more of both.",
          "Tokens only affect image models.",
          "Tokens are only relevant during training."
        ],
        answer: 1,
        explain:
          "Providers typically bill per token and cap the context window in tokens. More tokens means more cost and a higher chance of hitting the limit."
      },
      {
        q: "Roughly how do tokens relate to English words?",
        options: [
          "One token always equals one word.",
          "On average, a token is a bit less than a word — common short words may be one token, long or rare words may split into several.",
          "Ten words equal one token.",
          "Tokens have nothing to do with words."
        ],
        answer: 1,
        explain:
          "A common rough guide is that a token averages around three-quarters of a word in English. Rare or long words split into multiple tokens."
      },
      {
        q: "Why is the tokenizer demo on this page described as an 'approximation'?",
        options: [
          "Because it secretly calls a real model.",
          "Because real tokenizers use learned vocabularies; the demo uses a simple, transparent heuristic to convey the idea.",
          "Because tokens are random.",
          "Because it only works in dark mode."
        ],
        answer: 1,
        explain:
          "Production tokenizers rely on learned sub-word vocabularies. The demo uses a simple rule so you can see the concept, not exact production counts."
      },
      {
        q: "A user pastes a very long document and the tool says it is 'over the context limit.' The most likely cause is…",
        options: [
          "The document has too many tokens for the model's context window.",
          "The user's password expired.",
          "The GPU is full of other files.",
          "The document is in the wrong font."
        ],
        answer: 0,
        explain:
          "Context windows are measured in tokens. A long document can exceed the model's token budget, which is why chunking or summarizing is often needed."
      }
    ],
    "05": [
      {
        q: "What happens during 'pretraining'?",
        options: [
          "The model is taught your company's internal policies.",
          "The model learns general language patterns from a very large body of text.",
          "The model is connected to the live internet permanently.",
          "Users rate answers to improve the model."
        ],
        answer: 1,
        explain:
          "Pretraining exposes the model to massive amounts of text so it learns broad language patterns and world knowledge before any specialization."
      },
      {
        q: "What is fine-tuning?",
        options: [
          "Adjusting the screen brightness.",
          "Further training a pretrained model on narrower data to specialize its behavior or style.",
          "Deleting the model and starting over.",
          "Encrypting the model's weights."
        ],
        answer: 1,
        explain:
          "Fine-tuning continues training on a smaller, targeted dataset so the model adapts to a specific domain, tone, or task."
      },
      {
        q: "What is the main goal of alignment techniques such as RLHF (reinforcement learning from human feedback)?",
        options: [
          "To make the model larger.",
          "To make outputs more helpful, honest, and safe by training on human preferences.",
          "To remove the need for any training data.",
          "To make the model run on phones."
        ],
        answer: 1,
        explain:
          "Alignment methods like RLHF use human preference signals to steer the model toward responses people find helpful and appropriate."
      },
      {
        q: "What does a 'knowledge cutoff' mean?",
        options: [
          "The model stops working after a certain date.",
          "The model's training data only goes up to a certain point in time, so it may not know newer events.",
          "The maximum number of questions per day.",
          "A limit on how long an answer can be."
        ],
        answer: 1,
        explain:
          "A knowledge cutoff is the point after which the model has not seen training data. Without external tools, it can be unaware of more recent developments."
      },
      {
        q: "Why does the knowledge cutoff matter to IT?",
        options: [
          "It controls the model's password policy.",
          "Answers about recent products, patches, or events may be outdated unless the tool can retrieve current information.",
          "It determines screen resolution.",
          "It has no practical impact."
        ],
        answer: 1,
        explain:
          "For fast-moving topics, a model may give stale answers. Retrieval or web access can supplement it, but the base model alone can be out of date."
      }
    ],
    "06": [
      {
        q: "What is a 'context window'?",
        options: [
          "A pop-up help menu.",
          "The amount of text (in tokens) the model can consider at once, including your prompt and the conversation.",
          "The time of day the model works best.",
          "A browser setting."
        ],
        answer: 1,
        explain:
          "The context window is the model's working memory for a single request, measured in tokens. Everything it should consider must fit inside it."
      },
      {
        q: "Why does a chatbot sometimes seem to 'forget' earlier parts of a long conversation?",
        options: [
          "It is offended.",
          "Older messages can fall outside the context window, so the model no longer sees them.",
          "It saves memory by deleting your account.",
          "Forgetting only happens in dark mode."
        ],
        answer: 1,
        explain:
          "Once a conversation grows beyond the context window, earlier content is dropped from what the model can see, so it effectively forgets it."
      },
      {
        q: "What does a 'system instruction' (system prompt) typically do?",
        options: [
          "Sets overall behavior, role, and rules for the assistant before the user's messages.",
          "Reboots the server.",
          "Encrypts the conversation.",
          "Counts the tokens."
        ],
        answer: 0,
        explain:
          "A system instruction establishes the assistant's persona, constraints, and goals, shaping how it responds to the user's prompts."
      },
      {
        q: "In the temperature demo, raising the temperature makes the model…",
        options: [
          "Always pick the single most likely next word.",
          "More likely to pick less-probable words, increasing variety and randomness.",
          "Run faster.",
          "Use fewer tokens."
        ],
        answer: 1,
        explain:
          "Higher temperature flattens the probabilities so lower-ranked options get chosen more often, producing more varied (and less predictable) output."
      },
      {
        q: "Which is a sound prompt-engineering tip?",
        options: [
          "Be as vague as possible.",
          "Give clear context, specify the desired format, and provide an example when possible.",
          "Always demand a one-word answer.",
          "Never tell the model who the audience is."
        ],
        answer: 1,
        explain:
          "Clear context, an explicit output format, and examples reliably improve results. Specificity helps the model match your intent."
      },
      {
        q: "For tasks needing consistent, repeatable answers, you would generally want…",
        options: [
          "A high temperature.",
          "A low temperature (closer to deterministic).",
          "No prompt at all.",
          "A larger font."
        ],
        answer: 1,
        explain:
          "Low temperature makes the model favor the most likely tokens, giving more consistent and predictable output — useful for structured or factual tasks."
      }
    ],
    "07": [
      {
        q: "What is an 'embedding'?",
        options: [
          "A list of numbers (a vector) that represents the meaning of text so similar meanings sit close together.",
          "A compressed ZIP file.",
          "A type of database index for filenames.",
          "An HTML tag."
        ],
        answer: 0,
        explain:
          "An embedding maps text to a vector of numbers positioned so that semantically similar items are near each other in that space."
      },
      {
        q: "How does semantic (vector) search differ from keyword search?",
        options: [
          "It only matches exact words.",
          "It matches by meaning, so 'car trouble' can find 'vehicle won't start' even without shared keywords.",
          "It is always slower and worse.",
          "It cannot handle synonyms."
        ],
        answer: 1,
        explain:
          "Keyword search matches literal terms. Semantic search compares meaning via embeddings, so related phrasing matches even without identical words."
      },
      {
        q: "What is a vector database used for?",
        options: [
          "Storing video files.",
          "Storing embeddings and quickly finding the nearest (most similar) ones to a query.",
          "Replacing all relational databases.",
          "Running the model's training."
        ],
        answer: 1,
        explain:
          "A vector database specializes in storing embeddings and performing fast nearest-neighbor lookups to find semantically similar items."
      },
      {
        q: "In the similarity demo, why do some phrases score as 'more similar' than others?",
        options: [
          "They share more letters.",
          "Their precomputed illustrative scores reflect closer meaning, mimicking how embeddings group related ideas.",
          "They are alphabetically closer.",
          "They were typed faster."
        ],
        answer: 1,
        explain:
          "The demo uses illustrative similarity scores to convey that embeddings cluster related meanings — phrases about the same topic score higher."
      },
      {
        q: "A good IT use case for embeddings is…",
        options: [
          "Encrypting passwords.",
          "Letting employees search an internal knowledge base by meaning, not just exact keywords.",
          "Speeding up the network switch.",
          "Formatting spreadsheets."
        ],
        answer: 1,
        explain:
          "Semantic search over internal docs is a common, high-value use: users find relevant answers even when they phrase questions differently from the source text."
      }
    ],
    "08": [
      {
        q: "What problem does Retrieval-Augmented Generation (RAG) primarily solve?",
        options: [
          "Making the model train faster.",
          "Grounding answers in specific, up-to-date, or private documents the base model never trained on.",
          "Removing the need for prompts.",
          "Encrypting the model."
        ],
        answer: 1,
        explain:
          "RAG fetches relevant documents and supplies them to the model at answer time, so responses can reflect your own or current information."
      },
      {
        q: "What is the basic RAG flow?",
        options: [
          "Generate, then delete.",
          "Retrieve relevant documents, then generate an answer using them as context.",
          "Train, then forget.",
          "Encrypt, then send."
        ],
        answer: 1,
        explain:
          "RAG is retrieve-then-generate: find relevant material (often via vector search), then have the model answer using that material as context."
      },
      {
        q: "Why might a company prefer RAG over fine-tuning for keeping answers current?",
        options: [
          "RAG can use freshly updated documents without retraining the model.",
          "RAG never makes mistakes.",
          "Fine-tuning is illegal.",
          "RAG removes the need for any model."
        ],
        answer: 0,
        explain:
          "You can update the document store anytime and the system retrieves the latest content, avoiding the cost and lag of retraining."
      },
      {
        q: "Even with RAG, why should answers still be verified?",
        options: [
          "Because the model may misread, miss, or misattribute the retrieved text, or the source itself may be wrong.",
          "Because RAG disables spell-check.",
          "Because retrieval always returns nothing useful.",
          "There is no need; RAG is always correct."
        ],
        answer: 0,
        explain:
          "RAG reduces but does not eliminate errors. Retrieval can surface the wrong passage, and the model can still misuse correct sources, so verification matters."
      },
      {
        q: "A good sign that RAG is working well is…",
        options: [
          "It cites or points to the specific source passages behind its answer.",
          "It refuses to answer anything.",
          "It always answers in one word.",
          "It never uses your documents."
        ],
        answer: 0,
        explain:
          "Source citations let users check the grounding. Traceable answers are a hallmark of a well-built RAG system."
      }
    ],
    "09": [
      {
        q: "What does 'tool use' or 'function calling' let an LLM do?",
        options: [
          "Nothing new.",
          "Request that an external action be run — like a calculation, a lookup, or an API call — and use the result.",
          "Physically build hardware.",
          "Replace the entire operating system."
        ],
        answer: 1,
        explain:
          "Tool use lets the model invoke defined functions or APIs (search, calculators, ticketing systems) and incorporate the results into its response."
      },
      {
        q: "What is an 'agent' in this context?",
        options: [
          "A help-desk employee.",
          "A system where an LLM plans and takes multiple steps or actions, often using tools, to accomplish a goal.",
          "A type of antivirus.",
          "A network router."
        ],
        answer: 1,
        explain:
          "An agent loops: it reasons, chooses an action or tool, observes the result, and repeats — chaining steps toward a goal rather than answering once."
      },
      {
        q: "Why do agents that take real actions raise extra safety concerns?",
        options: [
          "They use more electricity only.",
          "Mistakes can have real-world side effects (sending emails, changing records), so guardrails and human review matter more.",
          "They cannot be logged.",
          "They are always offline."
        ],
        answer: 1,
        explain:
          "When a model can act, errors are not just wrong text — they can change systems. That is why permissions, approvals, and logging are critical."
      },
      {
        q: "A sensible safeguard when letting an agent act on company systems is…",
        options: [
          "Give it full admin access immediately.",
          "Apply least-privilege access, require approval for risky actions, and log everything.",
          "Disable all logging for speed.",
          "Let it run unattended on production."
        ],
        answer: 1,
        explain:
          "Standard IT controls apply: least privilege, human approval for high-impact actions, and thorough logging keep agent behavior accountable."
      },
      {
        q: "Why is reliability a particular challenge for multi-step agents?",
        options: [
          "Each step can introduce errors that compound, so a small early mistake can derail the whole task.",
          "Agents never make mistakes.",
          "They only run once a year.",
          "They cannot use tools."
        ],
        answer: 0,
        explain:
          "Errors accumulate across steps. A wrong assumption early can cascade, which is why agent reliability is harder than a single answer."
      }
    ],
    "10": [
      {
        q: "What is a 'hallucination' in LLM terms?",
        options: [
          "A visual glitch on screen.",
          "When the model states something false or fabricated as if it were true.",
          "A type of virus.",
          "A successful answer."
        ],
        answer: 1,
        explain:
          "A hallucination is confidently presented but incorrect or invented content. It is one of the most important risks to watch for."
      },
      {
        q: "What is 'prompt injection'?",
        options: [
          "A way to speed up the model.",
          "Malicious or hidden instructions in content the model reads, designed to hijack its behavior.",
          "A SQL command.",
          "A keyboard shortcut."
        ],
        answer: 1,
        explain:
          "Prompt injection hides adversarial instructions in data the model processes (a web page, a document), attempting to override its intended behavior."
      },
      {
        q: "Why can the same prompt give different answers (non-determinism)?",
        options: [
          "The model is broken.",
          "Generation often samples randomly among likely tokens, so results vary unless settings force consistency.",
          "Your internet changed the model.",
          "It depends on the screen size."
        ],
        answer: 1,
        explain:
          "Sampling introduces randomness. Without deterministic settings, repeated prompts can yield different (though often similar) outputs."
      },
      {
        q: "What is a reliable way to sanity-check important AI output?",
        options: [
          "Trust it because it sounds confident.",
          "Verify claims against authoritative sources and treat the output as a draft, not a final authority.",
          "Ask the model if it is sure.",
          "Assume longer answers are more correct."
        ],
        answer: 1,
        explain:
          "Independent verification against trusted sources is the dependable check. Confidence, length, and the model's self-assurance are not evidence of accuracy."
      },
      {
        q: "Why is bias a concern in LLM output?",
        options: [
          "Models learn from human-created data, which can contain biases the model then reflects or amplifies.",
          "Models are intentionally programmed to be unfair.",
          "Bias only affects images.",
          "Bias disappears at high temperature."
        ],
        answer: 0,
        explain:
          "Because models learn statistical patterns from human data, they can reproduce societal biases present in that data, requiring care in sensitive use cases."
      }
    ],
    "11": [
      {
        q: "What is the core data risk when employees paste sensitive information into a third-party AI tool?",
        options: [
          "It slows the network.",
          "The data may be stored, logged, or used by the provider, potentially exposing confidential or regulated information.",
          "It changes the font.",
          "There is no risk if the tool is popular."
        ],
        answer: 1,
        explain:
          "Once data leaves your control, it may be retained or processed under the vendor's terms. Treat external tools as you would any third-party data sharing."
      },
      {
        q: "What is 'shadow IT' in the context of AI tools?",
        options: [
          "A dark-mode setting.",
          "Employees adopting AI tools without IT's knowledge or approval, bypassing governance.",
          "A backup server.",
          "An approved enterprise tool."
        ],
        answer: 1,
        explain:
          "Shadow IT is unsanctioned tool use. With free AI tools everywhere, it is easy for staff to route sensitive data through unvetted services."
      },
      {
        q: "What is a key trade-off between cloud-API models and self-hosted/local models?",
        options: [
          "Local models are always better in every way.",
          "Cloud APIs offer convenience and scale but send data externally; local/self-hosted keeps data in-house but needs more infrastructure and expertise.",
          "Cloud APIs never cost anything.",
          "Local models cannot be governed."
        ],
        answer: 1,
        explain:
          "Cloud APIs are easy and powerful but involve sending data out. Self-hosting keeps data internal at the cost of running and maintaining the infrastructure."
      },
      {
        q: "When evaluating an AI vendor, which question is most important for governance?",
        options: [
          "Does the logo look modern?",
          "How is our data handled, stored, retained, and is it used to train their models — and what compliance commitments exist?",
          "Does it have a dark mode?",
          "How many emojis are in the docs?"
        ],
        answer: 1,
        explain:
          "Data handling, retention, training-use, and compliance posture are the governance questions that determine whether a tool is safe for your data."
      },
      {
        q: "Why does retention/logging policy matter for AI tools?",
        options: [
          "It controls screen brightness.",
          "Retained prompts and outputs may contain sensitive data and become subject to breaches, discovery, or compliance obligations.",
          "It only affects billing.",
          "Logs are never sensitive."
        ],
        answer: 1,
        explain:
          "If prompts and responses are logged, that store can include confidential data, creating breach exposure and compliance scope you must account for."
      },
      {
        q: "A practical first governance step for an organization adopting AI is…",
        options: [
          "Ban all computers.",
          "Publish a clear acceptable-use policy stating what data may and may not be shared with which tools.",
          "Let everyone use anything silently.",
          "Disable all logging."
        ],
        answer: 1,
        explain:
          "A clear, communicated acceptable-use policy gives employees the guardrails to use AI productively without exposing sensitive data."
      }
    ],
    "12": [
      {
        q: "Which of these is a common category of AI tools?",
        options: [
          "Chat assistants, coding assistants, search/RAG products, and image/audio generators.",
          "Only spreadsheets.",
          "Only antivirus software.",
          "Only operating systems."
        ],
        answer: 0,
        explain:
          "The landscape spans chat assistants, coding helpers, retrieval/search products, and media (image/audio) generators, among others."
      },
      {
        q: "What is the practical difference between an 'API', an 'app', and a 'local' AI offering?",
        options: [
          "They are identical.",
          "An API is a building block for developers, an app is a ready-to-use product, and local runs on your own hardware without sending data out.",
          "APIs are always free.",
          "Local tools cannot work offline."
        ],
        answer: 1,
        explain:
          "APIs are integration points for builders, apps are finished user-facing products, and local deployments keep processing (and data) on your own machines."
      },
      {
        q: "When a new AI tool 'lands on IT's desk,' a vendor-neutral evaluation should start with…",
        options: [
          "The brand name and hype.",
          "What problem it solves, what data it touches, how that data is handled, and what it costs to run and maintain.",
          "How many celebrities endorse it.",
          "Whether competitors use it."
        ],
        answer: 1,
        explain:
          "Focus on the job to be done, the data involved and its handling, and total cost — not marketing. That keeps evaluation objective and vendor-neutral."
      },
      {
        q: "Why is a vendor-neutral framework useful for IT?",
        options: [
          "It guarantees the cheapest price.",
          "It lets you compare tools consistently on capability, data handling, cost, and fit, rather than on marketing claims.",
          "It removes the need to test anything.",
          "It only works for one vendor."
        ],
        answer: 1,
        explain:
          "A consistent framework makes apples-to-apples comparisons possible and protects decisions from hype and lock-in pressure."
      },
      {
        q: "Which factor is most relevant when judging whether an AI tool fits a specific task?",
        options: [
          "Whether it has the most parameters.",
          "Whether it actually solves the real problem reliably within your data, cost, and compliance constraints.",
          "Whether it is the newest release.",
          "Whether it has the flashiest demo."
        ],
        answer: 1,
        explain:
          "Fit is about reliably solving the real problem within your constraints. Size, novelty, and demos do not guarantee suitability."
      }
    ]
  };

  /* ---- Engine ------------------------------------------------------------ */

  function buildQuestion(q, qIndex, name) {
    var fs = Course.el("fieldset", { class: "quiz-question" });
    var legend = Course.el("legend", { text: qIndex + 1 + ". " + q.q });
    fs.appendChild(legend);

    var optList = Course.el("div", { class: "quiz-options", role: "radiogroup" });
    q.options.forEach(function (opt, oIndex) {
      var id = name + "-o" + oIndex;
      var label = Course.el("label", { class: "quiz-option", for: id });
      var input = Course.el("input", {
        type: "radio",
        name: name,
        id: id,
        value: String(oIndex)
      });
      var text = Course.el("span", { class: "quiz-option-text", text: opt });
      label.appendChild(input);
      label.appendChild(text);
      optList.appendChild(label);
    });
    fs.appendChild(optList);

    var fb = Course.el("p", { class: "quiz-feedback", id: name + "-fb", hidden: "hidden", role: "status" });
    fs.appendChild(fb);
    return fs;
  }

  Quiz.render = function (containerId, questions, moduleNum) {
    var host = document.getElementById(containerId);
    if (!host || !questions || !questions.length) return;

    host.innerHTML = "";
    host.classList.add("quiz");

    var form = Course.el("form", { class: "quiz-form", novalidate: "novalidate" });
    questions.forEach(function (q, i) {
      form.appendChild(buildQuestion(q, i, "q" + moduleNum + "-" + i));
    });

    var actions = Course.el("div", { class: "quiz-actions" });
    var submit = Course.el("button", { type: "submit", class: "btn btn-primary", text: "Check answers" });
    var retry = Course.el("button", { type: "button", class: "btn btn-secondary", text: "Try again", hidden: "hidden" });
    actions.appendChild(submit);
    actions.appendChild(retry);
    form.appendChild(actions);

    var result = Course.el("div", { class: "quiz-result", role: "status", "aria-live": "polite", hidden: "hidden" });
    form.appendChild(result);

    host.appendChild(form);

    function reset() {
      questions.forEach(function (q, i) {
        var name = "q" + moduleNum + "-" + i;
        var fb = document.getElementById(name + "-fb");
        if (fb) {
          fb.hidden = true;
          fb.textContent = "";
          fb.className = "quiz-feedback";
        }
        var fs = fb ? fb.parentNode : null;
        if (fs) fs.classList.remove("answered-correct", "answered-wrong");
        var inputs = form.querySelectorAll('input[name="' + name + '"]');
        for (var j = 0; j < inputs.length; j++) inputs[j].checked = false;
      });
      result.hidden = true;
      result.textContent = "";
      result.className = "quiz-result";
      retry.hidden = true;
      submit.hidden = false;
    }

    function grade(e) {
      e.preventDefault();
      var correct = 0;
      var unanswered = 0;
      questions.forEach(function (q, i) {
        var name = "q" + moduleNum + "-" + i;
        var chosen = form.querySelector('input[name="' + name + '"]:checked');
        var fb = document.getElementById(name + "-fb");
        var fs = fb ? fb.parentNode : null;
        var isCorrect = chosen && parseInt(chosen.value, 10) === q.answer;
        if (!chosen) unanswered++;
        if (isCorrect) correct++;
        if (fb) {
          fb.hidden = false;
          fb.className = "quiz-feedback " + (isCorrect ? "correct" : "incorrect");
          var prefix = !chosen ? "No answer selected. " : isCorrect ? "Correct. " : "Not quite. ";
          fb.textContent = prefix + q.explain;
        }
        if (fs) {
          fs.classList.remove("answered-correct", "answered-wrong");
          fs.classList.add(isCorrect ? "answered-correct" : "answered-wrong");
        }
      });

      var total = questions.length;
      var pct = Math.round((correct / total) * 100);
      var passed = correct / total >= PASS_RATIO;

      result.hidden = false;
      result.className = "quiz-result " + (passed ? "passed" : "failed");
      var msg = "You scored " + correct + " / " + total + " (" + pct + "%). ";
      if (unanswered) msg += unanswered + " question(s) had no answer. ";
      msg += passed
        ? "You passed — this module is marked complete."
        : "You need " + Math.ceil(total * PASS_RATIO) + " correct to pass. Review the explanations and try again.";
      result.textContent = msg;

      if (passed && Course.Progress) {
        Course.Progress.setComplete(moduleNum, true);
      }

      submit.hidden = true;
      retry.hidden = false;
      result.setAttribute("tabindex", "-1");
      result.focus();
    }

    form.addEventListener("submit", grade);
    retry.addEventListener("click", reset);
  };

  /* Called by Course.initPage on module pages. Renders into #quiz if data
     exists for the module. */
  Quiz.autoInit = function (moduleNum) {
    if (!document.getElementById("quiz")) return;
    var qs = Quiz.data[moduleNum];
    if (qs) Quiz.render("quiz", qs, moduleNum);
  };
})();
