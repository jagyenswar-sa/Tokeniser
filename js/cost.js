/**
 * LLM Token Explorer - Cost & Efficiency Estimator
 * Real-time API pricing rates (per 1M tokens) across top industry LLMs
 */

export const PRICING_MODELS = [
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputPer1M: 2.50,
    outputPer1M: 10.00,
    contextWindow: '128k',
    isFlagship: true,
    badgeColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o-mini',
    provider: 'OpenAI',
    inputPer1M: 0.15,
    outputPer1M: 0.60,
    contextWindow: '128k',
    isFlagship: false,
    badgeColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    contextWindow: '200k',
    isFlagship: true,
    badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputPer1M: 0.80,
    outputPer1M: 4.00,
    contextWindow: '200k',
    isFlagship: false,
    badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google',
    inputPer1M: 1.25,
    outputPer1M: 5.00,
    contextWindow: '2M',
    isFlagship: true,
    badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Google Gemini 1.5 Flash',
    provider: 'Google',
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    contextWindow: '1M',
    isFlagship: false,
    badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
  },
  {
    id: 'llama-3-1-70b',
    name: 'Meta Llama 3.1 70B',
    provider: 'Meta / Hosted',
    inputPer1M: 0.59,
    outputPer1M: 0.79,
    contextWindow: '128k',
    isFlagship: false,
    badgeColor: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
  },
  {
    id: 'llama-3-1-8b',
    name: 'Meta Llama 3.1 8B',
    provider: 'Meta / Hosted',
    inputPer1M: 0.05,
    outputPer1M: 0.08,
    contextWindow: '128k',
    isFlagship: false,
    badgeColor: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
  }
];

/**
 * Calculates estimated cost for input tokens and simulated output tokens
 */
export function calculateModelCosts(inputTokens, outputTokens = 500, requestVolume = 1000) {
  const safeInput = Math.max(0, inputTokens);
  const safeOutput = Math.max(0, outputTokens);
  const safeVolume = Math.max(1, requestVolume);

  return PRICING_MODELS.map(model => {
    const inputCost = (safeInput / 1_000_000) * model.inputPer1M;
    const outputCost = (safeOutput / 1_000_000) * model.outputPer1M;
    const singleRequestCost = inputCost + outputCost;
    const monthlyCost = singleRequestCost * safeVolume;

    return {
      ...model,
      inputCost,
      outputCost,
      singleRequestCost,
      monthlyCost,
      formattedSingle: formatCurrency(singleRequestCost),
      formattedMonthly: formatCurrency(monthlyCost)
    };
  });
}

function formatCurrency(val) {
  if (val === 0) return '$0.00';
  if (val < 0.000001) return '< $0.000001';
  if (val < 0.001) return '$' + val.toFixed(6);
  if (val < 0.01) return '$' + val.toFixed(4);
  if (val < 100) return '$' + val.toFixed(2);
  return '$' + Math.round(val).toLocaleString();
}
