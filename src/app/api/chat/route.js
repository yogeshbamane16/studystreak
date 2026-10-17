import { NextResponse } from 'next/server';
import { resolveDoubtAnswer } from '@/lib/aiEngine';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      mode = 'doubt',
      prompt = '',
      examName = 'JEE Advanced',
      subject = 'Physics',
      topic = 'Mechanics',
      weakTopics = [],
      apiKey: clientApiKey,
      apiProvider: clientProvider,
      apiUrl: clientApiUrl,
    } = body;

    // Retrieve headers or env configuration
    const headerKey = req.headers.get('x-api-key');
    const headerProvider = req.headers.get('x-api-provider');
    const headerUrl = req.headers.get('x-api-url');

    const apiKey = clientApiKey || headerKey || process.env.BHARATCODE_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    const apiProvider = clientProvider || headerProvider || 'auto';
    const customApiUrl = clientApiUrl || headerUrl || process.env.BHARATCODE_API_URL;

    // Determine if key is a real custom key
    const isRealExternalKey = apiKey && 
      apiKey.trim().length > 10 && 
      apiKey !== 'your_bharatcode_api_key_here' && 
      apiKey !== 'demo_bharatcode_key';

    if (isRealExternalKey) {
      try {
        let systemPrompt = `You are BharatCode AI, an elite, high-precision AI tutor and tactical study companion for competitive exam aspirants (${examName}). Current subject: ${subject}. Provide clear, step-by-step pedagogical explanations. Highlight common student pitfalls ("Tactical Traps") and speed shortcuts.`;
        let userPrompt = prompt;

        if (mode === 'quiz') {
          systemPrompt += ` Generate 5 MCQs on "${topic}" for ${examName}. Output strictly JSON with schema: {"topic":"${topic}","questions":[{"id":1,"question":"...","options":["..."],"correctIndex":0,"explanation":"...","trapWarning":"..."}]}`;
          userPrompt = `Generate 5 challenging MCQs on "${topic}" for ${examName}. Return valid JSON.`;
        } else if (mode === 'planner') {
          systemPrompt += ` Generate a daily schedule of 4-5 tasks. Output strictly JSON with schema: {"summary":"...","tasks":[{"id":"task-1","title":"...","subject":"${subject}","priority":"high","timeEstimate":"60m","completed":false}]}`;
          userPrompt = `Build daily study plan for ${examName}. Return valid JSON.`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

        let endpoint = customApiUrl;
        if (endpoint && (endpoint.endsWith('/v1') || endpoint.endsWith('/v1/'))) {
          endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
        }

        let requestHeaders = { 'Content-Type': 'application/json' };
        let requestBody = null;

        // Auto-detect or route provider
        const isBharatCode =
          apiProvider === 'bharatcode' ||
          apiKey.startsWith('bc_live_') ||
          (endpoint && endpoint.includes('bharatcode.ai'));

        if (isBharatCode) {
          endpoint = endpoint || 'https://bharatcode.ai/api/model/v1/chat/completions';
          requestHeaders['Authorization'] = `Bearer ${apiKey}`;
          const selectedModel = body.model || process.env.BHARATCODE_MODEL || 'qwen-3.8-27b';
          requestBody = JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.6,
            max_tokens: 1500,
          });
        } else if (apiProvider === 'groq' || (!customApiUrl && apiKey.startsWith('gsk_'))) {
          endpoint = 'https://api.groq.com/openai/v1/chat/completions';
          requestHeaders['Authorization'] = `Bearer ${apiKey}`;
          requestBody = JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.6,
            max_tokens: 1500,
          });
        } else if (apiProvider === 'gemini' || (!customApiUrl && apiKey.startsWith('AIza'))) {
          endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          requestBody = JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nStudent Query: ${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 1500,
            }
          });
        } else {
          // Standard OpenAI or compatible endpoint
          endpoint = customApiUrl || 'https://api.openai.com/v1/chat/completions';
          requestHeaders['Authorization'] = `Bearer ${apiKey}`;
          requestBody = JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1500,
          });
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: requestHeaders,
          body: requestBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // Extract text based on API format
          let rawText = '';
          if (data.choices?.[0]?.message?.content) {
            rawText = data.choices[0].message.content;
          } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            rawText = data.candidates[0].content.parts[0].text;
          } else if (data.reply) {
            rawText = data.reply;
          }

          if (mode === 'quiz' || mode === 'planner') {
            try {
              const cleanJsonStr = rawText.replace(/```json\n?|\n?```/g, '').trim();
              const parsed = JSON.parse(cleanJsonStr);
              return NextResponse.json({ success: true, mode, source: 'ai-external', ...parsed });
            } catch (e) {
              console.warn('JSON parse fallback for external model response');
            }
          }

          if (rawText && rawText.trim().length > 0) {
            return NextResponse.json({ success: true, mode, source: isBharatCode ? 'bharatcode-live' : 'ai-external', text: rawText });
          }
        } else {
          const errText = await response.text().catch(() => '');
          console.warn(`External AI provider returned HTTP ${response.status}. Payload: ${errText.slice(0, 200)}`);
        }
      } catch (err) {
        console.warn('External AI call failed or timed out. Activating StudyStreak Tactical Knowledge Engine:', err.message);
      }
    }

    // ==========================================
    // STUDYSTREAK TACTICAL KNOWLEDGE ENGINE
    // ==========================================

    if (mode === 'quiz') {
      const topicToTest = topic || subject || 'Core Principles';
      return NextResponse.json({
        success: true,
        mode: 'quiz',
        source: 'bharatcode-engine',
        topic: topicToTest,
        questions: [
          {
            id: 1,
            question: `[${examName}] In the context of ${topicToTest}, which of the following statements represents the fundamental governing principle?`,
            options: [
              `The rate of change is proportional to the gradient along the boundary coordinates.`,
              `The net equilibrium flux remains zero independent of internal potential constraints.`,
              `The conservation parameter holds strictly under isotropic and reversible transitions.`,
              `The second-order perturbation collapses whenever symmetry is spontaneously broken.`,
            ],
            correctIndex: 2,
            explanation: `In standard ${examName} syllabus problems for ${topicToTest}, conservation laws hold strictly under isotropic and reversible transitions. Option A is an incomplete condition, and Option B overlooks internal entropy changes.`,
            trapWarning: `Common trap: Aspirants confuse irreversible localized fluctuations with global conservation criteria.`,
          },
          {
            id: 2,
            question: `Which constraint violation most frequently invalidates direct formula application for ${topicToTest}?`,
            options: [
              `Non-uniform thermal gradients or non-inertial reference frame acceleration`,
              `Arbitrary scalar scaling along the longitudinal boundary`,
              `Standard atmospheric pressure variations under $1\\%$`,
              `Constant velocity translation in a vacuum environment`,
            ],
            correctIndex: 0,
            explanation: `Standard formulas assume an inertial frame and isothermal/equilibrium states. Accelerating frames or temperature gradients introduce pseudo-forces or rate-constant shifts.`,
            trapWarning: `Always verify whether the problem frame is accelerating before applying canonical equations.`,
          },
          {
            id: 3,
            question: `When evaluating limiting boundary conditions for ${topicToTest}, what occurs as the primary variable approaches infinity ($x \\to \\infty$)?`,
            options: [
              `The response approaches an asymptotic steady-state limit governed by system capacity.`,
              `The system undergoes immediate divergent catastrophic resonance.`,
              `The fundamental eigenvalues invert polarity instantaneously.`,
              `All non-conservative dissipations reduce strictly to zero.`,
            ],
            correctIndex: 0,
            explanation: `Physical and mathematical systems in competitive examinations exhibit saturation or asymptotic stabilization as boundary variables expand to infinity.`,
            trapWarning: `Never assume linear continuation at extreme boundaries without checking capacity saturation.`,
          },
          {
            id: 4,
            question: `In high-yield competitive exam numericals on ${topicToTest}, the definitive condition for system stability is:`,
            options: [
              `All characteristic roots having strictly negative real components`,
              `Marginal divergence along the orthogonal tangent vector`,
              `Zero damping coefficient with periodic external forcing`,
              `Discontinuous phase boundaries under non-adiabatic conditions`,
            ],
            correctIndex: 0,
            explanation: `Strictly negative real components in characteristic roots guarantee exponentially decaying perturbation, establishing asymptotic stability for ${topicToTest}.`,
            trapWarning: `Marginal stability is not equivalent to asymptotic stability in rigorous exam grading.`,
          },
          {
            id: 5,
            question: `When optimizing problem-solving speed for ${topicToTest} in ${examName}, the recommended tactical shortcut is:`,
            options: [
              `Eliminating distractors via dimensional sanity checks and extreme boundary analysis ($x\\to 0, x\\to \\infty$)`,
              `Calculating complete 8-step derivations from scratch for every question`,
              `Ignoring question constraints and guessing based on length of options`,
              `Skipping graphical intuition and memorizing only numerical values`,
            ],
            correctIndex: 0,
            explanation: `Boundary-value checks and dimensional filtering can eliminate at least 2 incorrect distractors within 10 seconds, leaving high probability candidates.`,
            trapWarning: `Speed tactics must always be paired with conceptual sanity checks.`,
          },
        ],
      });
    }

    if (mode === 'planner') {
      const weakList = Array.isArray(weakTopics) && weakTopics.length > 0 
        ? weakTopics.map(t => typeof t === 'string' ? t : t.topic).join(', ') 
        : 'High-Yield Areas';
      
      return NextResponse.json({
        success: true,
        mode: 'planner',
        source: 'bharatcode-engine',
        summary: `AI Tactical Sortie Plan generated for ${examName}. Prioritizing weak areas: ${weakList}.`,
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            title: `Drill weak topic: ${weakTopics[0]?.topic || 'High-Yield Revision'} (Concept breakdown & 10 PYQs)`,
            subject: subject,
            priority: 'high',
            timeEstimate: '90m',
            completed: false,
          },
          {
            id: `task-${Date.now()}-2`,
            title: `Execute 5-MCQ precision air-strike quiz on ${topic || 'Key Formulas'}`,
            subject: subject,
            priority: 'high',
            timeEstimate: '20m',
            completed: false,
          },
          {
            id: `task-${Date.now()}-3`,
            title: `Active recall: Flashcards & error log review for previous test mistakes`,
            subject: 'Review',
            priority: 'med',
            timeEstimate: '45m',
            completed: false,
          },
          {
            id: `task-${Date.now()}-4`,
            title: `Speed drill: Timed practice session under strict exam conditions`,
            subject: subject,
            priority: 'high',
            timeEstimate: '60m',
            completed: false,
          },
          {
            id: `task-${Date.now()}-5`,
            title: `Nightly telemetry check: Update StudyStreak hours and review tomorrow's targets`,
            subject: 'Discipline',
            priority: 'low',
            timeEstimate: '15m',
            completed: false,
          },
        ],
      });
    }

    if (mode === 'motivation') {
      return NextResponse.json({
        success: true,
        mode: 'motivation',
        source: 'bharatcode-engine',
        quote: `You don't need luck when your daily prep is airtight. 3 hours of intense, distraction-free focus right now beats 10 hours of passive daydreaming. Lock in for ${examName}!`,
        author: 'BharatCode AI Sentinel',
        tag: 'RELENTLESS EXECUTION',
      });
    }

    // Default: Context-aware doubt clearing using master pedagogical resolver
    const detailedDoubtResponse = await resolveDoubtAnswer(prompt, examName, subject);

    return NextResponse.json({
      success: true,
      mode: 'doubt',
      source: 'bharatcode-engine',
      text: detailedDoubtResponse,
    });

  } catch (error) {
    console.error('Server error in /api/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error processing study request' },
      { status: 500 }
    );
  }
}
