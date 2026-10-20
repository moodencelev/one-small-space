import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Generous limit for high-resolution base64 space photos
app.use(express.json({ limit: '25mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Integration Status Endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  const isKeyConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    ok: true,
    aiAvailable: isKeyConfigured,
    model: 'gemini-3.8-flash',
    features: {
      visionAnalysis: isKeyConfigured,
      textAnalysis: isKeyConfigured,
      smartBreakdown: isKeyConfigured,
      sortingHelper: isKeyConfigured,
      manualChecklistsAlwaysAvailable: true,
    },
    message: isKeyConfigured
      ? 'Gemini 3.8 Flash server-side integration active.'
      : 'Gemini API key is not set. The app will offer curated manual micro-checklists.',
  });
});

// 2. Space Analysis Endpoint
app.post('/api/analyze-space', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', description, room, energy = 'medium', durationMinutes = 5, userConsentedToAi } = req.body;

    if (imageBase64 && !userConsentedToAi) {
      return res.status(400).json({
        error: 'CONSENT_REQUIRED',
        message: 'Explicit user consent is required before transmitting space photos to AI.',
      });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'AI_UNAVAILABLE',
        message: 'Server Gemini API key is not configured. Manual curated checklist is recommended.',
      });
    }

    const energyDescriptions: Record<string, string> = {
      low: 'Very low physical or emotional energy. User needs an ultra-gentle, frictionless micro-step, zero heavy lifting.',
      medium: 'Steady pace, willing to clear a small surface or group a few things.',
      high: 'Good energy, ready to clear a defined small zone and do a light wipe-down.',
    };

    const promptText = `You are "One Small Space", a compassionate, warm, and practical decluttering companion.
The user is tackling clutter in the "${room || 'room'}".
User's current energy: ${energy} (${energyDescriptions[energy] || energyDescriptions.medium}).
Available session time: ${durationMinutes} minutes.
User's description: ${description ? `"${description}"` : 'See attached photo.'}

IMPORTANT GUIDELINES:
1. VOICE: Warm, brief, practical, never judgmental. Never mention words like "mess", "lazy", "ashamed", or "overdue".
2. SCOPE: Identify ONE single tiny micro-area (e.g. "Just the front 12 inches of the nightstand", "The magazine stack beside the couch", "Around the bathroom faucet"). Do NOT ask them to do the whole room.
3. STEPS: Provide 2 to 4 gentle, numbered sequential micro-actions that fit comfortably within ${durationMinutes} minutes. Each step must be so small that starting feels easy.
4. CLARIFYING QUESTION: If any item or pile looks uncertain, propose 1 short gentle clarifying question with 2-3 quick tap options. If clear, you may leave it empty.

Respond ONLY with valid JSON matching this schema:
{
  "microAreaTitle": "Name of the single small focus zone (under 8 words)",
  "warmInsight": "1 compassionate, encouraging sentence acknowledging their effort",
  "steps": [
    {
      "id": "step_1",
      "title": "Short verb-first title (under 6 words)",
      "instruction": "One clear, friendly action sentence",
      "suggestedSeconds": 45
    }
  ],
  "clarifyingQuestion": "Optional gentle question if something is ambiguous, else empty string",
  "clarifyingOptions": ["Option A", "Option B"],
  "suggestedNextStep": "One gentle finishing thought or next physical step (e.g. Drink a glass of water)"
}`;

    const contents: any[] = [];
    if (imageBase64) {
      // Strip base64 data prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }
    contents.push({ text: promptText });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse AI JSON response');
      }
    }

    // Format steps with completed flags
    const steps = (parsedData.steps || []).map((step: any, idx: number) => ({
      id: step.id || `ai_step_${idx + 1}`,
      title: step.title || `Action ${idx + 1}`,
      instruction: step.instruction || '',
      suggestedSeconds: step.suggestedSeconds || Math.floor((durationMinutes * 60) / (parsedData.steps.length || 3)),
      completed: false,
      skipped: false,
    }));

    return res.json({
      ok: true,
      microAreaTitle: parsedData.microAreaTitle || 'One Calm Clearing',
      warmInsight: parsedData.warmInsight || 'Every small space you clear creates a little more breathing room.',
      steps,
      clarifyingPrompt: parsedData.clarifyingQuestion
        ? {
            question: parsedData.clarifyingQuestion,
            options: parsedData.clarifyingOptions || ['Yes', 'Not right now'],
          }
        : null,
      suggestedNextStep: parsedData.suggestedNextStep || 'Rest your hands and take a deep breath.',
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Error analyzing space with Gemini:', error);
    return res.status(500).json({
      error: 'ANALYSIS_FAILED',
      message: error?.message || 'Could not analyze space. You can proceed with a gentle manual checklist.',
    });
  }
});

// 3. Make Step Easier Endpoint (Adaptive breakdown)
app.post('/api/make-easier', async (req: Request, res: Response) => {
  const { currentStepTitle, currentStepInstruction, room, energy } = req.body;

  if (!aiClient) {
    // High quality deterministic micro-breakdown if AI is offline
    return res.json({
      ok: true,
      simplifiedStep: {
        title: `Just 1 item: ${currentStepTitle.slice(0, 30)}`,
        instruction: `Instead of doing all of it, just pick up ONE single item from this spot and move it. That is 100% enough for this minute.`,
        suggestedSeconds: 30,
      },
    });
  }

  try {
    const prompt = `The user is decluttering in the ${room || 'room'} with ${energy || 'low'} energy.
They are feeling overwhelmed by this current step:
Title: "${currentStepTitle}"
Instruction: "${currentStepInstruction}"

Make this step SIGNIFICANTLY easier and lower-friction.
Break it into just ONE tiny micro-movement (e.g. "Instead of putting all cups away, just pick up ONE cup and set it near the door", or "Just touch one paper and decide yes or no").
Voice: compassionate, ultra-gentle, practical.

Return JSON:
{
  "title": "Super short new title (under 5 words)",
  "instruction": "1 single low-effort micro-sentence",
  "suggestedSeconds": 30
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ok: true,
      simplifiedStep: {
        title: parsed.title || 'Just 1 tiny item',
        instruction: parsed.instruction || 'Just pick up one single object. You can stop after that.',
        suggestedSeconds: parsed.suggestedSeconds || 30,
      },
    });
  } catch (error) {
    console.error('Error simplifying step:', error);
    return res.json({
      ok: true,
      simplifiedStep: {
        title: `Just 1 item from this step`,
        instruction: `Don't worry about finishing everything. Pick up just ONE piece and place it. You did great.`,
        suggestedSeconds: 30,
      },
    });
  }
});

// 4. Stuck on Item Helper Endpoint (Sorting Counselor)
app.post('/api/item-helper', async (req: Request, res: Response) => {
  const { itemName, reasonForHesitation = 'unsure' } = req.body;

  if (!aiClient) {
    return res.json({
      ok: true,
      reflectiveQuestions: [
        'Have you used, worn, or smiled at this in the last 6 months?',
        'If this broke or disappeared today, would you buy it again with your own money?',
        'Does keeping this item bring you genuine peace, or a feeling of guilt / obligation?',
      ],
      gentleGuidance:
        'Remember: you are not getting rid of the memory or the person who gave it to you. You are just choosing what takes up physical space in your home.',
      suggestedCategory: 'decide_later',
      categoryReason: 'Place it in a "Thinking Box" for 48 hours. If you don\'t miss it, letting go will feel easier.',
    });
  }

  try {
    const prompt = `The user is decluttering and is stuck on a difficult item:
Item name: "${itemName}"
Hesitation reason: "${reasonForHesitation}" (e.g. sentimental, spent money on it, "might need it one day", guilt).

Provide:
1. Three gentle, compassionate reflective questions to help them unstick their thinking (no pressure, no guilt).
2. A warm 1-2 sentence guiding reflection reminding them that their peace of mind is worth more than unused physical bulk.
3. A suggested gentle category ("keep", "donate", "recycle", "discard", or "decide_later").

Return JSON:
{
  "reflectiveQuestions": ["Question 1", "Question 2", "Question 3"],
  "gentleGuidance": "Compassionate reflection sentence",
  "suggestedCategory": "donate",
  "categoryReason": "Brief reason for this gentle suggestion"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ok: true,
      reflectiveQuestions: parsed.reflectiveQuestions || [
        'Does this item serve your present life, or a past version of you?',
        'Would someone else in your community genuinely delight in having this?',
        'Could you take a quick photo of it to preserve the memory without storing the object?',
      ],
      gentleGuidance: parsed.gentleGuidance || 'Your home is for living in right now, not for storing unlived expectations.',
      suggestedCategory: parsed.suggestedCategory || 'decide_later',
      categoryReason: parsed.categoryReason || 'Putting it in the Thinking Box gives you emotional distance without panic.',
    });
  } catch (error) {
    console.error('Error helping with item:', error);
    return res.json({
      ok: true,
      reflectiveQuestions: [
        'Have you used this in the last 6 months?',
        'Does keeping this bring relief or subtle guilt?',
        'Could a photo keep the memory intact?',
      ],
      gentleGuidance: 'You have permission to let go of things that no longer serve your everyday peace.',
      suggestedCategory: 'decide_later',
      categoryReason: 'When in doubt, use Decide Later to preserve your decision energy.',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`One Small Space server running on port ${PORT}`);
  });
}

startServer();
