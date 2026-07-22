/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 1.0
 * @assets assets/audios/de/
 */

import "../styles/main.scss";
import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

import { setupExperiment } from "./utils/startup";
import { SessionManager } from "./utils/session_manager";
import { registerParticipant } from "./utils/database";
import { getGermanStimulusList } from "./data/accent_stimuli";

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import { RunOptions, LinguisticTestData } from "./types/interfaces";

import { createPreloadTimeline } from "./timelines/shared/preload";
import { createWelcomeTimeline } from "./timelines/shared/welcome";
import { createStudyIntroTimeline } from "./timelines/linguistic/study_intro";
import { createAccentRatingTimeline } from "./timelines/linguistic/accent_rating_phase";
import { createSaveTimeline } from "./timelines/shared/save";
import { createCompletionTimeline } from "./timelines/shared/completion";
import { createDemographicsTimeline } from "./timelines/shared/demographics";
import { createLanguageSelectionTimeline } from "./timelines/shared/language_selection";
import { getExperimentContext } from "./utils/experiment_loader";
import {
  ExperimentType,
  Language,
  ParticipantGroup, 
  Phase,
} from "./types/enums";
import { createInvalidPathTimeline } from "./timelines/shared/error_screens";

import {
  GLOBAL_CONFIG,
  DATAPIPE_IDS,
} from "./config/constants"; 

const EXP_TYPE = ExperimentType.LINGUISTIC;

export async function run(_options: RunOptions) {
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  const context = getExperimentContext<LinguisticTestData>(EXP_TYPE);
  if (!context.isValid) {
    await jsPsych.run([createInvalidPathTimeline()]);
    return jsPsych;
  }

  const { group, subject_id, savedSession: loadedSession } = context;

  let sessionToUse = loadedSession; 

  jsPsych.data.addProperties({
    subject_id,
    experiment_type: EXP_TYPE,
    participant_group: group,
    version: GLOBAL_CONFIG.EXPERIMENT_VERSION,
  });

  if (
    GLOBAL_CONFIG.CHECK_PREVIOUS_PARTICIPATION &&
    SessionManager.isCompleted(EXP_TYPE)
  ) {
    await jsPsych.run([
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: `<p>${i18next.t("feedback.already_participated")}</p>`,
        choices: "NO_KEYS",
      },
    ]);
    return jsPsych;
  }

  let finalLang = context.lang;

  if (!sessionToUse) {
    if (group !== ParticipantGroup.HERITAGE) {
      await jsPsych.run([createLanguageSelectionTimeline(jsPsych)]);
      const lastTrialData = jsPsych.data.get().last(1).values()[0];
      finalLang = lastTrialData.lang as Language;
      if (!finalLang) throw new Error("Language selection failed.");
    }

    await i18next.changeLanguage(finalLang);

    const displayElement = jsPsych.getDisplayElement();
    if (displayElement) {
      displayElement.innerHTML = `
        <div class="spinner-container">
          <div class="spinner"></div>
          <p style="margin-top:20px;">${i18next.t("setup.preparing")}</p>
        </div>
      `;
    }

    try {
      const participantNumber = await registerParticipant(
        finalLang,
        subject_id,
        EXP_TYPE,
        group!
      );
      jsPsych.data.addProperties({
        lang: finalLang,
        participant_number: participantNumber,
      });

      const accentStimuli = getGermanStimulusList(participantNumber);

      sessionToUse = {
        accentStimuli,
        trialIndex: -1,
        trialData: [],
        participantNumber: participantNumber,
        lang: finalLang,
        group: group!,
      } as any; 

      SessionManager.save(EXP_TYPE, subject_id, sessionToUse);
    } catch (error) {
      if (displayElement) {
        displayElement.innerHTML = `<p style='color:red;'>${i18next.t(
          "setup.error"
        )}: ${error}</p>`;
      }
      return jsPsych;
    }
  } else {
    if (sessionToUse.trialData?.length > 0) {
      sessionToUse.trialData.forEach((d: any) => {
        jsPsych.data.get().push({
          ...d,
          subject_id,
          experiment_type: EXP_TYPE,
          participant_group: group,
          lang: sessionToUse!.lang,
          participant_number: sessionToUse!.participantNumber,
          version: GLOBAL_CONFIG.EXPERIMENT_VERSION,
        });
      });
    }
    await i18next.changeLanguage(sessionToUse.lang);
    jsPsych.data.addProperties({
      lang: sessionToUse.lang,
      participant_number: sessionToUse.participantNumber,
    });
    finalLang = sessionToUse.lang;
  }

  const activeDataPipeId =
    group === ParticipantGroup.HERITAGE
      ? (DATAPIPE_IDS[EXP_TYPE] as any).heritage
      : (DATAPIPE_IDS[EXP_TYPE] as any)[finalLang];

  const finalDisplay = jsPsych.getDisplayElement();
  if (finalDisplay) finalDisplay.innerHTML = "";

  const mainTimeline = buildLinguisticTimeline(
    jsPsych,
    sessionToUse!,
    subject_id,
    group!,
    activeDataPipeId
  );

  const startIndex = 0;

  const timelineToRun = mainTimeline.slice(startIndex); 

  await jsPsych.run(timelineToRun);
  return jsPsych;
} 

function buildLinguisticTimeline(
  jsPsych: any,
  session: any,
  subject_id: string,
  group: any,
  activeDataPipeId: any
): any[] {
  const updateSetupSession = (idx: number, data: any) => {
    data.phase = Phase.SETUP;
    SessionManager.updateProgress(EXP_TYPE, subject_id, session, idx, data);
  };

  const updateSession = (idx: number, data: any) =>
    SessionManager.updateProgress(EXP_TYPE, subject_id, session, idx, data);

  const baseTrial = {
    on_start: () => (jsPsych.getDisplayElement().innerHTML = ""),
  };

  let currentIdx = 0;

  const preload = createPreloadTimeline([]);
  currentIdx++;

  const demographics = createDemographicsTimeline(
    jsPsych,
    group,
    updateSetupSession,
    currentIdx++,
    EXP_TYPE,
    subject_id
  );
  const exclusionScreen = {
  timeline: [
    {
      type: HtmlKeyboardResponsePlugin,
      stimulus: () =>
        i18next.language === Language.TR
          ? `
            <div style="max-width: 700px; margin: 80px auto; text-align: center;">
            <p style="font-size: 1.25rem; line-height: 1.7;">
            Verdiğiniz yanıtlar doğrultusunda bu çalışmanın katılım kriterlerini
            karşılamıyorsunuz. İlginiz için teşekkür ederiz.
            </p>
            </div> 
          `
          : `
            <div style="max-width: 700px; margin: 80px auto; text-align: center;">
            <p style="font-size: 1.25rem; line-height: 1.7;">
            Auf Grundlage Ihrer Antworten erfüllen Sie die Teilnahmekriterien
            für diese Studie nicht. Vielen Dank für Ihr Interesse.
            </p>
            </div>
          `, 
      choices: "NO_KEYS",
    },
  ],
  conditional_function: () => {
    const trials = jsPsych.data.get().values();

    const demographicsTrial = [...trials]
      .reverse()
      .find(
        (trial: any) =>
          trial.response &&
          typeof trial.response.is_eligible === "boolean"
      );

    return (
  group === ParticipantGroup.STANDARD &&
  demographicsTrial?.response?.is_eligible === false
);
  },
};
currentIdx++; 
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSetupSession,
    currentIdx++,
    session
  );
  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSetupSession,
    currentIdx++,
    session
  );

  const ratingTrials = createAccentRatingTimeline(
  session.accentStimuli,
  updateSession,
  currentIdx
);
currentIdx += session.accentStimuli.length;

  const save = createSaveTimeline(
    subject_id,
    jsPsych,
    EXP_TYPE,
    activeDataPipeId
  );
  const completion = createCompletionTimeline(baseTrial, EXP_TYPE, subject_id);

return [
  preload,
  demographics,
  exclusionScreen,
  welcome,
  studyIntro,
  ...ratingTrials,
  save,
  completion,
];
} 
