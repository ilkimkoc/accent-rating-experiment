import jsPsychSurvey from "@jspsych/plugin-survey";
import i18next from "i18next";
import { Language } from "../../types/enums";

export function createForeignFollowupTimeline(
  jsPsych: any,
  updateSession: (idx: number, data: any) => void,
  startIdx: number
) {
  let selectedTrials: any[] | null = null;

  const isTurkish = () => i18next.language === Language.TR;

  const shuffle = (items: any[]) => { 
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i], 
      ];
    }

    return shuffled;
  };

  const selectForeignTrials = (): any[] => {
    if (selectedTrials !== null) {
      return selectedTrials;
    }

    const allTrials = jsPsych.data.get().values();

    const foreignTrials = allTrials.filter((trial: any) => {
      const accentTypes = trial.response?.accent_types;

      return (
        trial.stimulus_id &&
        trial.audio_file &&
        Array.isArray(accentTypes) &&
        accentTypes.indexOf("foreign") !== -1
      );
    });

    if (foreignTrials.length <= 1) {
      selectedTrials = foreignTrials;
      return foreignTrials;
    }

    const trialsByRating = new Map<number, any[]>();

    foreignTrials.forEach((trial: any) => {
      const rating = Number(trial.response?.accent_rating);

      if (!Number.isFinite(rating)) {
        return;
      }

      const trialsWithSameRating = trialsByRating.get(rating) ?? [];
      trialsWithSameRating.push(trial);
      trialsByRating.set(rating, trialsWithSameRating);
    });

    const ratingsFromHighestToLowest = [...trialsByRating.keys()].sort(
      (a, b) => b - a
    );

    const rankedTrials: any[] = [];

    ratingsFromHighestToLowest.forEach((rating) => {
      const tiedTrials = trialsByRating.get(rating) ?? [];

      rankedTrials.push(...shuffle(tiedTrials));
    });

    selectedTrials = rankedTrials.slice(0, 2);

    return selectedTrials;
  };

  const noForeignTrial = {
    type: jsPsychSurvey,

    survey_json: () => ({
      showQuestionNumbers: "off",
      completeText: isTurkish() ? "Devam" : "Weiter",

      elements: [
        {
          type: "comment",
          name: "no_foreign_explanation",
          title: isTurkish()
            ? "Ses kayıtlarının hiçbirini yabancı aksanlı olarak değerlendirmediniz. Lütfen kayıtların hiçbirinin size neden yabancı aksanlı gelmediğini kısaca açıklayınız."
            : "Sie haben keine der Aufnahmen als fremdsprachig akzentuiert bewertet. Bitte erläutern Sie kurz, warum keine der Aufnahmen für Sie fremdsprachig akzentuiert klang.",
          isRequired: true,
          rows: 5,
          requiredErrorText: isTurkish()
            ? "Lütfen kısa bir açıklama yazınız."
            : "Bitte geben Sie eine kurze Erklärung ein.",
        },
      ],
    }),

    on_finish: (data: any) => {
      data.followup_type = "no_foreign_explanation";

      updateSession(startIdx, data);
    },
  };

  const createReplayTrial = (selectedIndex: number) => ({
    type: jsPsychSurvey,

    survey_json: () => {
      const trials = selectForeignTrials();
      const selectedTrial = trials[selectedIndex];
      const selectedCount = trials.length;

      const introduction =
        selectedIndex === 0
          ? isTurkish()
            ? selectedCount === 1
              ? `
                <p>
                  Bu ses kaydını yabancı aksanlı olarak değerlendirdiniz.
                  Şimdi bu kaydı yeniden dinlemenizi rica ediyoruz.
                </p>
              `
              : `
                <p>
                  Bu iki ses kaydını yabancı aksanın en belirgin olduğu kayıtlar
                  olarak değerlendirdiniz. Şimdi bu iki kaydı yeniden dinlemenizi
                  rica ediyoruz.
                </p>
              `
            : selectedCount === 1
              ? `
                <p>
                  Sie haben diese Aufnahme als fremdsprachig akzentuiert
                  bewertet. Wir möchten Sie nun bitten, die Aufnahme noch
                  einmal anzuhören.
                </p>
              `
              : `
                <p>
                  Sie haben diese beiden Aufnahmen als am stärksten
                  fremdsprachig akzentuiert bewertet. Wir möchten Sie nun
                  bitten, beide Aufnahmen noch einmal anzuhören.
                </p>
              `
          : "";

      return {
        showQuestionNumbers: "off",
        completeText: isTurkish() ? "Devam" : "Weiter",

        elements: [
          {
            type: "html",
            name: `foreign_followup_audio_${selectedIndex + 1}`,
            html: `
              <div style="
                max-width: 800px;
                margin: 10px auto 30px auto;
                line-height: 1.6;
              ">
                ${introduction}

                <p>
                  ${
                    isTurkish()
                      ? "Lütfen kaydı yeniden dinleyiniz."
                      : "Bitte hören Sie sich die Aufnahme noch einmal an."
                  }
                </p>

                <div style="
                  display: flex;
                  justify-content: center;
                  margin-top: 22px;
                ">
                  <audio
                    controls
                    controlsList="nodownload"
                  >
                    <source
                      src="${selectedTrial?.audio_file}"
                      type="audio/wav"
                    >
                    ${
                      isTurkish()
                        ? "Tarayıcınız ses oynatmayı desteklemiyor."
                        : "Ihr Browser unterstützt die Audiowiedergabe nicht."
                    }
                  </audio>
                </div>
              </div>
            `,
          },

          {
            type: "comment",
            name: "foreign_accent_explanation",
            title: isTurkish()
              ? "Bu konuşmanın size neden yabancı aksanlı geldiğini kısaca açıklayınız. Değerlendirmenizi etkileyen özellikleri mümkün olduğunca açık bir şekilde belirtiniz. Örneğin telaffuz, tonlama, ritim, belirli sesler veya diğer dilsel özelliklerden söz edebilirsiniz. Doğru veya yanlış cevap yoktur; kişisel izleniminizle ilgileniyoruz."
              : "Bitte erklären Sie kurz, warum diese Aufnahme für Sie fremdsprachig akzentuiert klang. Beschreiben Sie möglichst konkret, welche Merkmale Ihre Einschätzung beeinflusst haben, zum Beispiel Aussprache, Intonation, Rhythmus, einzelne Laute oder andere sprachliche Merkmale. Es gibt keine richtigen oder falschen Antworten; uns interessiert Ihr persönlicher Eindruck.",
            isRequired: true,
            rows: 6,
            requiredErrorText: isTurkish()
              ? "Lütfen kısa bir açıklama yazınız."
              : "Bitte geben Sie eine kurze Erklärung ein.",
          },
        ],
      };
    },

    on_finish: (data: any) => {
      const selectedTrial = selectForeignTrials()[selectedIndex];

      data.followup_type = "foreign_audio_explanation";
      data.followup_position = selectedIndex + 1;

      data.original_stimulus_id = selectedTrial?.stimulus_id;
      data.original_audio_file = selectedTrial?.audio_file;
      data.original_accent_rating =
        selectedTrial?.response?.accent_rating;
      data.original_accent_types =
        selectedTrial?.response?.accent_types;
      data.original_trial_index = selectedTrial?.trial_index;

      updateSession(startIdx + selectedIndex + 1, data);
    },
  });

  return [
  {
    timeline: [noForeignTrial],
    conditional_function: () => selectForeignTrials().length === 0,
  },

  {
    timeline: [createReplayTrial(0)],
    conditional_function: () => selectForeignTrials().length >= 1,
  },

  {
    timeline: [createReplayTrial(1)],
    conditional_function: () => selectForeignTrials().length >= 2,
  },
];
} 