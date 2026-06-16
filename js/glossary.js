/* glossary.js — glossary dataset + live filter-as-you-type search.
   Depends on course.js. Data is embedded (no fetch under file://). */

(function () {
  "use strict";

  var Course = (window.Course = window.Course || {});
  var Glossary = (Course.Glossary = Course.Glossary || {});

  Glossary.terms = [
    {
      term: "Agent",
      def: "A system where an LLM plans and takes multiple steps or actions — often by calling tools — to accomplish a goal, instead of producing a single answer."
    },
    {
      term: "Alignment",
      def: "Techniques (such as RLHF) used to steer a model's behavior toward being helpful, honest, and safe according to human preferences."
    },
    {
      term: "API (Application Programming Interface)",
      def: "A defined way for software to talk to a service. AI APIs let developers send prompts to a model and receive responses programmatically."
    },
    {
      term: "Bias",
      def: "Systematic skew in a model's outputs, often reflecting patterns (including societal biases) present in its training data."
    },
    {
      term: "Context window",
      def: "The maximum amount of text, measured in tokens, that a model can consider at once — including the prompt and the recent conversation."
    },
    {
      term: "Deep learning",
      def: "A subset of machine learning that uses neural networks with many layers, which learn useful features from data automatically."
    },
    {
      term: "Embedding",
      def: "A list of numbers (a vector) representing the meaning of text, arranged so that similar meanings are close together in vector space."
    },
    {
      term: "Fine-tuning",
      def: "Further training a pretrained model on narrower data to specialize its behavior, tone, or knowledge for a particular task or domain."
    },
    {
      term: "Function calling / Tool use",
      def: "A capability that lets a model request an external action — like a calculation, lookup, or API call — and use the result in its answer."
    },
    {
      term: "Generative AI",
      def: "AI that produces new content such as text, images, code, or audio, rather than only classifying or scoring existing inputs."
    },
    {
      term: "GPU (Graphics Processing Unit)",
      def: "A chip good at performing many similar math operations in parallel, which makes it well suited to training and running neural networks."
    },
    {
      term: "Hallucination",
      def: "When a model states something false or fabricated as if it were true. A key reliability risk to watch for."
    },
    {
      term: "Inference",
      def: "Running a trained model to produce an answer for a new input. This is the phase end users interact with (as opposed to training)."
    },
    {
      term: "Knowledge cutoff",
      def: "The point in time up to which a model's training data extends. Without external tools, the model may not know about later events."
    },
    {
      term: "Large Language Model (LLM)",
      def: "A model trained on vast amounts of text that generates language by repeatedly predicting the next token."
    },
    {
      term: "Machine learning (ML)",
      def: "An approach to AI in which systems learn patterns from data rather than following only hand-written rules."
    },
    {
      term: "Model",
      def: "A set of parameters (weights) learned from data that maps inputs to outputs. In short, the learned 'brain' that does the work at inference time."
    },
    {
      term: "Next-token prediction",
      def: "The core mechanism of an LLM: given the text so far, predict the most likely next token, append it, and repeat."
    },
    {
      term: "Non-determinism",
      def: "The property that the same prompt can yield different outputs, because generation often samples randomly among likely tokens."
    },
    {
      term: "Overfitting",
      def: "When a model memorizes quirks of its training data instead of learning general patterns, causing poor performance on new data."
    },
    {
      term: "Parameter (weight)",
      def: "One of the many internal numbers a model adjusts during training. Collectively, parameters encode what the model has learned."
    },
    {
      term: "Pretraining",
      def: "The initial training phase where a model learns broad language patterns and world knowledge from a very large body of text."
    },
    {
      term: "Prompt",
      def: "The input text you give a model — your question, instruction, or context — that guides its response."
    },
    {
      term: "Prompt engineering",
      def: "The practice of crafting prompts (clear context, desired format, examples) to get better, more reliable model outputs."
    },
    {
      term: "Prompt injection",
      def: "An attack where malicious or hidden instructions in content the model reads attempt to hijack or override its intended behavior."
    },
    {
      term: "RAG (Retrieval-Augmented Generation)",
      def: "An approach that retrieves relevant documents and supplies them to the model as context, grounding answers in specific or current information."
    },
    {
      term: "RLHF (Reinforcement Learning from Human Feedback)",
      def: "An alignment technique that uses human preference judgments to train a model toward responses people find more helpful and appropriate."
    },
    {
      term: "Sampling",
      def: "Choosing the next token from a probability distribution rather than always taking the most likely one, which introduces variety."
    },
    {
      term: "Self-hosted / Local model",
      def: "Running a model on your own hardware so data stays in-house, trading external convenience for more control and infrastructure responsibility."
    },
    {
      term: "Semantic search",
      def: "Searching by meaning using embeddings, so related phrasing matches even without shared keywords — unlike traditional keyword search."
    },
    {
      term: "Shadow IT",
      def: "Employees adopting tools (including AI services) without IT's knowledge or approval, bypassing security and governance."
    },
    {
      term: "System instruction (system prompt)",
      def: "Setup text that defines an assistant's role, rules, and behavior before the user's messages are processed."
    },
    {
      term: "Temperature",
      def: "A setting that controls randomness in generation. Lower values make output more focused and repeatable; higher values make it more varied."
    },
    {
      term: "Token",
      def: "A chunk of text — often a word or part of a word — that a model reads and predicts. Usage and context limits are measured in tokens."
    },
    {
      term: "Tokenization",
      def: "The process of splitting text into tokens using a learned vocabulary so a model can process it."
    },
    {
      term: "Training",
      def: "The phase where a model learns patterns by adjusting its parameters based on data. It is computationally expensive and done before inference."
    },
    {
      term: "Vector database",
      def: "A database specialized for storing embeddings and quickly finding the most similar ones to a query (nearest-neighbor search)."
    }
  ];

  Glossary.init = function () {
    var listHost = document.getElementById("glossary-list");
    var input = document.getElementById("glossary-search");
    var count = document.getElementById("glossary-count");
    var empty = document.getElementById("glossary-empty");
    if (!listHost) return;

    var sorted = Glossary.terms.slice().sort(function (a, b) {
      return a.term.toLowerCase().localeCompare(b.term.toLowerCase());
    });

    function render(filter) {
      var f = (filter || "").trim().toLowerCase();
      listHost.innerHTML = "";
      var shown = 0;
      sorted.forEach(function (item) {
        var hay = (item.term + " " + item.def).toLowerCase();
        if (f && hay.indexOf(f) === -1) return;
        shown++;
        var dt = Course.el("dt", { class: "glossary-term", text: item.term });
        var dd = Course.el("dd", { class: "glossary-def", text: item.def });
        listHost.appendChild(dt);
        listHost.appendChild(dd);
      });
      if (count) {
        count.textContent = shown + " of " + sorted.length + " terms";
      }
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render("");
  };
})();
