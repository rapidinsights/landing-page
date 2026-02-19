<script lang="ts">
  import {
    questions,
    MAX_SCORE,
    SCORED_QUESTION_COUNT,
    getScoreTier,
    getWeakestAreas,
    weakAreaLabels,
    getDollarImpactCopy,
    industryLanguage,
    dollarEstimates,
    type Industry,
    type RevenueBand,
    type ScoredQuestion,
    type QualifyingQuestion,
  } from '~/lib/scorecard-data';

  // State machine: intro -> questions -> score-reveal -> email-gate -> results
  type Phase = 'intro' | 'questions' | 'score-reveal' | 'email-gate' | 'results';

  let phase: Phase = $state('intro');
  let currentQuestionIndex = $state(0);
  let answers: Record<string, number> = $state({});
  let qualifyingAnswers: Record<string, string> = $state({});
  let email = $state('');
  let emailSubmitted = $state(false);
  let emailSkipped = $state(false);
  let isSubmitting = $state(false);
  let submitError = $state('');
  let animating = $state(false);

  // Computed
  let totalQuestions = $derived(questions.length);
  let currentQuestion = $derived(questions[currentQuestionIndex]);
  let score = $derived(Object.values(answers).reduce((sum, pts) => sum + pts, 0));
  let scoreTier = $derived(getScoreTier(score));
  let industry = $derived((qualifyingAnswers['industry'] as Industry) || 'other');
  let revenueBand = $derived((qualifyingAnswers['revenue'] as RevenueBand) || '2m-10m');
  let weakestAreas = $derived(getWeakestAreas(answers));

  // Progress: pre-fill at ~10%, fast-to-slow progression
  let progressPercent = $derived(() => {
    if (phase === 'intro') return 8; // Endowed progress effect
    if (phase === 'questions') {
      // Fast early, slow late: use square root for fast-to-slow feel
      const rawProgress = currentQuestionIndex / totalQuestions;
      const adjustedProgress = Math.sqrt(rawProgress);
      return 8 + adjustedProgress * 82; // 8% to 90%
    }
    if (phase === 'score-reveal' || phase === 'email-gate') return 92;
    return 100;
  });

  function startAssessment() {
    phase = 'questions';
    currentQuestionIndex = 0;
  }

  function selectAnswer(questionId: string, value: number | string, type: 'scored' | 'qualifying') {
    if (animating) return;

    if (type === 'scored') {
      answers = { ...answers, [questionId]: value as number };
    } else {
      qualifyingAnswers = { ...qualifyingAnswers, [questionId]: value as string };
    }

    // Animate transition to next question
    animating = true;
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
      } else {
        phase = 'score-reveal';
      }
      animating = false;
    }, 200);
  }

  function showEmailGate() {
    phase = 'email-gate';
  }

  function skipEmail() {
    emailSkipped = true;
    phase = 'results';
  }

  async function submitEmail() {
    if (!email || isSubmitting) return;
    isSubmitting = true;
    submitError = '';

    const payload = {
      email,
      score,
      industry,
      revenueBand,
      answers,
      weakestAreas,
    };

    try {
      // Submit to Netlify Function for email sending
      const emailResponse = await fetch('/.netlify/functions/scorecard-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!emailResponse.ok) {
        console.warn('Email send failed, continuing to results');
      }

      // Submit to Netlify Forms for dashboard capture
      const formData = new URLSearchParams();
      formData.append('form-name', 'scorecard');
      formData.append('email', email);
      formData.append('score', String(score));
      formData.append('industry', industry);
      formData.append('revenue', revenueBand);
      formData.append('weakest-areas', weakestAreas.join(', '));
      formData.append('tier', scoreTier.label);

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }).catch(() => {
        // Netlify Forms capture is best-effort
      });

      emailSubmitted = true;
      phase = 'results';
    } catch {
      submitError = 'Something went wrong. You can still see your results.';
      emailSubmitted = false;
      phase = 'results';
    } finally {
      isSubmitting = false;
    }
  }

  // Get button text based on position
  function getNextButtonText(index: number): string {
    if (index === SCORED_QUESTION_COUNT - 1) return 'Almost done →';
    if (index === totalQuestions - 1) return 'See my score';
    return 'Next →';
  }

  // Get label for question header
  function getQuestionHeader(index: number): string {
    if (index >= SCORED_QUESTION_COUNT) return 'So we can tailor your results';
    return '';
  }
</script>

<!-- Progress dots (bottom of viewport) -->
{#if phase === 'questions'}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
    {#each questions as _, i}
      <div
        class="rounded-full transition-all duration-200 {i < currentQuestionIndex
          ? 'w-2 h-2 bg-primary'
          : i === currentQuestionIndex
            ? 'w-3 h-3 bg-primary'
            : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'}"
      ></div>
    {/each}
  </div>
{/if}

<!-- INTRO PHASE -->
{#if phase === 'intro'}
  <div class="text-center space-y-6 animate-fade-in">
    <h1 class="text-3xl md:text-4xl font-bold text-default leading-tight">
      How well can you actually see your own business?
    </h1>
    <p class="text-lg text-muted max-w-lg mx-auto">
      Most owners of growing businesses can't answer basic questions about their own operation — which
      jobs are profitable, where time is being wasted, what's about to break — without calling someone,
      opening a spreadsheet, or guessing.
    </p>
    <p class="text-base text-muted">
      This takes 2 minutes. You'll get a score and a clear picture of where your blind spots are.
    </p>
    <button
      onclick={startAssessment}
      class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg cursor-pointer"
    >
      Start the assessment
    </button>
    <p class="text-sm text-muted/60">No fluff. No sales pitch. Just an honest read on where you stand.</p>
  </div>

<!-- QUESTIONS PHASE -->
{:else if phase === 'questions'}
  <div class="space-y-6 {animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'} transition-all duration-200">
    {#if getQuestionHeader(currentQuestionIndex)}
      <p class="text-sm text-muted text-center">{getQuestionHeader(currentQuestionIndex)}</p>
    {/if}

    <h2 class="text-xl md:text-2xl font-bold text-default leading-snug text-center">
      {currentQuestion.question}
    </h2>

    <div class="space-y-3 mt-8">
      {#if currentQuestion.type === 'scored'}
        {#each (currentQuestion as ScoredQuestion).options as option, optIndex}
          <button
            onclick={() => selectAnswer(currentQuestion.id, option.points, 'scored')}
            class="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-150 cursor-pointer min-h-[56px] flex items-center gap-3 group"
          >
            <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-primary flex items-center justify-center text-sm font-medium text-muted group-hover:text-primary transition-colors">
              {String.fromCharCode(65 + optIndex)}
            </span>
            <span class="text-base text-default">{option.text}</span>
          </button>
        {/each}
      {:else}
        {#each (currentQuestion as QualifyingQuestion).options as option, optIndex}
          <button
            onclick={() => selectAnswer(currentQuestion.id, option.value, 'qualifying')}
            class="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-150 cursor-pointer min-h-[56px] flex items-center gap-3 group"
          >
            <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-primary flex items-center justify-center text-sm font-medium text-muted group-hover:text-primary transition-colors">
              {String.fromCharCode(65 + optIndex)}
            </span>
            <span class="text-base text-default">{option.text}</span>
          </button>
        {/each}
      {/if}
    </div>
  </div>

<!-- SCORE REVEAL PHASE -->
{:else if phase === 'score-reveal'}
  <div class="text-center space-y-6 animate-fade-in">
    <div class="inline-flex items-center justify-center w-28 h-28 rounded-full bg-primary/10 mb-2">
      <span class="text-4xl font-bold text-primary">{score}<span class="text-lg text-muted">/{MAX_SCORE}</span></span>
    </div>
    <h2 class="text-2xl md:text-3xl font-bold text-default leading-snug">
      {scoreTier.label}
    </h2>
    <p class="text-lg text-muted max-w-md mx-auto">
      {scoreTier.summary}
    </p>
    <button
      onclick={showEmailGate}
      class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg cursor-pointer"
    >
      See what it means →
    </button>
  </div>

<!-- EMAIL GATE PHASE -->
{:else if phase === 'email-gate'}
  <div class="text-center space-y-6 animate-fade-in">
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
      <span class="text-2xl font-bold text-primary">{score}<span class="text-sm text-muted">/{MAX_SCORE}</span></span>
    </div>
    <h2 class="text-2xl font-bold text-default">
      Your Visibility Report is ready.
    </h2>
    <p class="text-base text-muted max-w-md mx-auto">
      Your weak spots, what they're costing you, and one thing to check this week.
    </p>

    <div class="max-w-sm mx-auto space-y-3">
      <input
        type="email"
        bind:value={email}
        placeholder="you@company.com"
        class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none text-base text-center"
        onkeydown={(e) => e.key === 'Enter' && submitEmail()}
      />
      <button
        onclick={submitEmail}
        disabled={!email || isSubmitting}
        class="w-full px-6 py-3 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? 'Sending...' : 'Send my report'}
      </button>
      {#if submitError}
        <p class="text-sm text-red-600">{submitError}</p>
      {/if}
      <p class="text-xs text-muted/60">One email with your results. No spam. We never share your information.</p>
    </div>

    <button
      onclick={skipEmail}
      class="text-sm text-muted hover:text-default underline underline-offset-2 transition-colors cursor-pointer"
    >
      Skip — see basic results
    </button>
  </div>

<!-- RESULTS PHASE -->
{:else if phase === 'results'}
  <div class="space-y-8 animate-fade-in">
    <!-- Score header -->
    <div class="text-center space-y-3">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <span class="text-2xl font-bold text-primary">{score}<span class="text-sm text-muted">/{MAX_SCORE}</span></span>
      </div>
      <h2 class="text-2xl font-bold text-default">{scoreTier.label}</h2>
    </div>

    <!-- Results body -->
    <div class="bg-gray-50 rounded-2xl p-6 md:p-8 space-y-6">
      {#if emailSubmitted || emailSkipped}
        <p class="text-base text-default leading-relaxed">
          {#if emailSubmitted && !emailSkipped}
            {scoreTier.fullResult(industry, revenueBand)}
          {:else}
            {scoreTier.basicResult}
          {/if}
        </p>
      {/if}

      <!-- Weak areas (only for email path) -->
      {#if emailSubmitted && !emailSkipped && weakestAreas.length > 0}
        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-default">Your biggest blind spots</h3>
          {#each weakestAreas as areaId}
            {#if weakAreaLabels[areaId]}
              <div class="space-y-1">
                <p class="font-medium text-default">{weakAreaLabels[areaId].label}</p>
                <p class="text-sm text-muted">{weakAreaLabels[areaId].actionItem}</p>
              </div>
            {/if}
          {/each}
        </div>
      {/if}

      <!-- Dollar impact (only for email path) -->
      {#if emailSubmitted && !emailSkipped && score < 20}
        <div class="pt-4 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-default mb-2">What this is likely costing you</h3>
          <p class="text-base text-default leading-relaxed">
            {getDollarImpactCopy(industry, revenueBand, score)}
          </p>
        </div>
      {/if}

      <!-- Email confirmation -->
      {#if emailSubmitted && !emailSkipped}
        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm text-muted">
            We've sent your full Visibility Report to <strong>{email}</strong>. It includes everything above plus specific next steps.
          </p>
        </div>
      {/if}

      <!-- Re-prompt for skippers -->
      {#if emailSkipped && !emailSubmitted}
        <div class="pt-4 border-t border-gray-200 text-center space-y-3">
          <p class="text-sm text-muted">
            Your full report includes your weak spots, dollar impact, and specific action items.
          </p>
          <button
            onclick={() => { emailSkipped = false; phase = 'email-gate'; }}
            class="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Get your full report →
          </button>
        </div>
      {/if}
    </div>

    <!-- CTA -->
    {#if scoreTier.showBookCall}
      <div class="text-center space-y-3">
        <a
          href="#"
          class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
        >
          Book a 20-minute call
        </a>
        <p class="text-sm text-muted">Let's look at what you're not seeing.</p>
      </div>
    {/if}

    <!-- Back to home -->
    <div class="text-center pt-4">
      <a href="/" class="text-sm text-muted hover:text-default underline underline-offset-2 transition-colors">
        ← Back to Rapid Insights
      </a>
    </div>
  </div>
{/if}

<style>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
