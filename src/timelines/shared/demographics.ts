import jsPsychSurvey from "@jspsych/plugin-survey";
import i18next from "i18next";
import { ParticipantGroup, Language } from "../../types/enums";
import { DEMOGRAPHICS_DATA } from "../../data/demographics_data";
import { Model } from "survey-core";
import { DefaultLight, DefaultDark } from "survey-core/themes";
const COUNTRY_CODES = [
  "AF", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT",
  "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BT",
  "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "CV", "KH",
  "CM", "CA", "CF", "TD", "CL", "CN", "CO", "KM", "CG", "CD",
  "CR", "CI", "HR", "CU", "CY", "CZ", "DK", "DJ", "DM", "DO",
  "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FJ", "FI",
  "FR", "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN",
  "GW", "GY", "HT", "HN", "HU", "IS", "IN", "ID", "IR", "IQ",
  "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI", "KP",
  "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI",
  "LT", "LU", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MR",
  "MU", "MX", "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "MM",
  "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "MK", "NO",
  "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PL",
  "PT", "QA", "RO", "RU", "RW", "KN", "LC", "VC", "WS", "SM",
  "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB",
  "SO", "ZA", "SS", "ES", "LK", "SD", "SR", "SE", "CH", "SY",
  "TW", "TJ", "TZ", "TH", "TL", "TG", "TO", "TT", "TN", "TR",
  "TM", "TV", "UG", "UA", "AE", "GB", "US", "UY", "UZ", "VU",
  "VA", "VE", "VN", "YE", "ZM", "ZW",
]; 
export function createDemographicsTimeline(
  jsPsych: any,
  group: ParticipantGroup,
  updateSession: any,
  startIdx: number,
  expType: string,
  subject_id: string
) {
  const lang = (i18next.language.split("-")[0] as Language) || Language.TR;
  const content = (DEMOGRAPHICS_DATA as any)[lang];
  const isHeritage = group === ParticipantGroup.HERITAGE;
  const countryLocale = lang === Language.TR ? "tr" : "de";
// @ts-ignore
const countryDisplayNames = new Intl.DisplayNames([countryLocale], {
  type: "region",
}); 

const countryChoices = COUNTRY_CODES
  .map((code) => ({
    value: code,
    text: countryDisplayNames.of(code) || code,
  }))
  .sort((a, b) =>
    a.text.localeCompare(b.text, countryLocale, { sensitivity: "base" })
  );
  const DATA_KEY = `survey_data_${expType}_${subject_id}`;
  const STATE_KEY = `survey_state_${expType}_${subject_id}`;

  const naChoice = i18next.t("demographics.questions.not_applicable");

  const survey_json: any = {
    showQuestionNumbers: "off",
    pageNextText: i18next.t("buttons.next"),
    pagePrevText: i18next.t("buttons.previous"),
    completeText: i18next.t("buttons.confirm"),

    pages: [
      {
        name: "consent_page",
        elements: [
          {
            type: "html",
            name: "consent_text",
            html: `<div class="consent-text-wrapper">${content.consent[group]}</div>`,
          },
          {
            type: "checkbox",
            name: "consent_agreement",
            title: content.consent.checkbox,
            isRequired: true,
            choices: [{ value: "agreed", text: i18next.t("buttons.confirm") }],
          },
        ],
      },
      {
        name: "basic_demographics",
        elements: [
          {
    type: "text",
    name: "initials",
    title: content.questions.initials,
    isRequired: true,
  },
          {
            type: "text",
            name: "birth_date",
            title: content.questions.age,
            inputType: "date",
            isRequired: true, 
            
          },
          {
            type: "radiogroup",
            name: "gender",
            title: content.questions.gender.title,
            choices: content.questions.gender.options,
            showOtherItem: true,
            otherText: i18next.t("demographics.questions.other_text"),
            otherPlaceholder: i18next.t(
              "demographics.questions.other_placeholder"
            ),
            isRequired: true,
          },
          {
            type: "radiogroup",
            name: "mother_tongue",
            title: content.questions.mother_tongue,
            choices: [
              {
                value: "yes",
                text: content.answers.yes,
              },
              {
                value: "no",
                text: content.answers.no,
              },
            ],
            isRequired: true,
          },
          {
            type: "radiogroup",
            name: "other_native_languages",
            title: content.questions.other_native_languages,
            visibleIf: "{mother_tongue} = 'yes'", 
            choices: [
              {
                value: "yes",
                text: content.answers.yes,
              },
              {
                value: "no",
                text: content.answers.no,
              },
            ],
            isRequired: true,
          },
          {
            type: "text",
            name: "other_native_languages_text",
            title: content.questions.other_native_languages_text,
            visibleIf: "{other_native_languages} = 'yes'",
            isRequired: true,
          },
          {
            type: "radiogroup",
            name: "additional_languages",
            title: content.questions.additional_languages,
            choices: [
              {
                value: "yes",
                text: content.answers.yes,
              },
              {
                value: "no",
                text: content.answers.no,
              },
            ],
            isRequired: true,
          },
          { 
            type: "matrixdynamic",
            name: "list_languages",
            title: content.questions.list_languages.title,
            visibleIf: "{additional_languages} = 'yes'", 
            columns: [
              {
                name: "language",
                title: content.questions.list_languages.language,
                cellType: "text",
                isRequired: true,
              },
              {
                name: "proficiency",
                title: content.questions.list_languages.proficiency,
                cellType: "dropdown",
                choices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                isRequired: true,
              },
            ],
              rowCount: 1,
              minRowCount: 1,
              addRowText: content.questions.list_languages.add_language,
              removeRowText: content.questions.list_languages.remove_language,
              isRequired: true,
            }, 
          {
            type: "dropdown",
            name: "birth_country",
            title: content.questions.birth_country,
            choices: countryChoices,
            isRequired: true, 
          }, 
          {
            type: "text",
            name: "birth_city",
            title: content.questions.birth_city,
            visibleIf: "{birth_country} notempty",
            isRequired: true,
          }, 
          {
            type: "radiogroup",
            name: "lived_abroad_long",
            title: content.questions.lived_abroad_long,
            choices: [
              {
                value: "yes",
                text: content.answers.yes,
              },
              {
                value: "no",
                text: content.answers.no,
              },
            ],
            isRequired: true,
          },
          {
            type: "text",
            name: "lived_abroad_country",
            title: content.questions.lived_abroad_country,
            visibleIf: "{lived_abroad_long} = 'yes'",
            isRequired: true,
          },
          {
            type: "text",
            name: "current_country",
            title: content.questions.current_country,
            isRequired: true,
          },
          {
            type: "radiogroup",
            name: "regional_variety_familiarity",
            title: content.questions.regional_variety_familiarity,
            choices: [
              {
                value: "yes",
                text: content.answers.yes,
              },
              {
                value: "no",
                text: content.answers.no,
              },
            ],
            isRequired: true,
          },
          {
            type: "text",
            name: "regional_varieties_text",
            title: content.questions.regional_varieties_text,
            visibleIf: "{regional_variety_familiarity} = 'yes'",
            isRequired: true,
          }, 
          {
            type: "radiogroup",
            name: "education",
            title: content.questions.education.title,
            choices: content.questions.education.options,
            showOtherItem: true,
            otherText: i18next.t("demographics.questions.other_text"),
            isRequired: true,
          },
          {
            type: "text",
            name: "department",
            title: content.questions.department,
            isRequired: true,
          },
        ],
      },
    ],
  };

  if (isHeritage && content.heritage_specific) {
    const h = content.heritage_specific;
    survey_json.pages.push({
      name: "heritage_section",
      elements: [
        {
          type: "radiogroup",
          name: "born_germany",
          title: h.born_germany,
          choices: h.born_germany_choices,
          isRequired: true,
        },
        {
          type: "text",
          name: "move_year",
          title: h.move_year,
          visibleIf: `{born_germany} == '${h.born_germany_choices[1]}'`,
          inputType: "number",
          validators: [
            {
              type: "numeric",
              minValue: 1900,
              maxValue: new Date().getFullYear(),
              text: i18next.t("demographics.validation.invalid_year"),
            },
          ],
        },
        {
          type: "text",
          name: "parents_lang",
          title: h.parents_lang,
          isRequired: true,
        },
        {
          type: "matrix",
          name: "helex_proficiency",
          title: h.helex_proficiency_title,
          columns: h.helex_options,
          rows: h.helex_questions.map((q: string, i: number) => ({
            value: `prof_${i}`,
            text: q,
          })),
          isRequired: true,
          isAllRowRequired: true,
        },
        {
          type: "matrix",
          name: "helex_frequency",
          title: h.frequency_title,
          columns: [...h.frequency_options, naChoice],
          rows: h.frequency_questions.map((q: string, i: number) => ({
            value: `freq_${i}`,
            text: q,
          })),
          isRequired: true,
          isAllRowRequired: true,
        },
        {
          type: "radiogroup",
          name: "identity",
          title: h.identity_statement,
          choices: h.identity_options,
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "visit_count",
          title: h.visit_count_title,
          choices: [...h.visit_count_options, naChoice],
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "visit_duration",
          title: h.visit_duration_title,
          choices: [...h.visit_duration_options, naChoice],
          isRequired: true,
        },
      ],
    });
  }

  return {
    type: jsPsychSurvey,
    survey_json: survey_json,
    on_start: () => {
      const display = jsPsych.getDisplayElement();
      if (display) display.innerHTML = "";
    },
    survey_function: (survey: Model) => {
      const prevData = localStorage.getItem(DATA_KEY);
      if (prevData) survey.data = JSON.parse(prevData);

      const prevState = localStorage.getItem(STATE_KEY);
      if (prevState) {
        const state = JSON.parse(prevState);
        if (state.currentPageNo !== undefined) {
          survey.currentPageNo = state.currentPageNo;
        }
      }

      survey.onValueChanged.add((sender) =>
        localStorage.setItem(DATA_KEY, JSON.stringify(sender.data))
      );

      survey.onCurrentPageChanged.add((sender) =>
        localStorage.setItem(
          STATE_KEY,
          JSON.stringify({ currentPageNo: sender.currentPageNo })
        )
      );

      setTimeout(() => {
        survey.applyTheme(
          document.body.classList.contains("dark-mode")
            ? DefaultDark
            : DefaultLight
        );
      }, 0);
    },
    on_finish: (data: any) => {
  localStorage.removeItem(DATA_KEY);
  localStorage.removeItem(STATE_KEY);

  const responses = data.response;

  const requiredBirthCountry =
    lang === Language.TR ? "TR" : "DE";

  const failsBasicEligibility =
    responses.birth_country !== requiredBirthCountry ||
    responses.mother_tongue !== "yes" ||
    responses.other_native_languages !== "no" ||
    responses.lived_abroad_long !== "no";

  const hasHighAdditionalLanguageProficiency =
    responses.additional_languages === "yes" &&
    Array.isArray(responses.list_languages) &&
    responses.list_languages.some(
      (language: any) => Number(language.proficiency) > 5
    );

  responses.is_eligible =
    !failsBasicEligibility &&
    !hasHighAdditionalLanguageProficiency;

  updateSession(startIdx, responses);
},
  };
} 