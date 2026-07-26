import jsPsychSurvey from "@jspsych/plugin-survey";
import { AccentStimulus } from "../../data/accent_stimuli";

export function createAccentRatingTimeline(
  stimuli: AccentStimulus[],
  updateSession: (idx: number, data: any) => void,
  startIdx: number
) {
  return stimuli.map((stimulus, index) => {
    let accentRating = 1;

    return {
      type: jsPsychSurvey,

      survey_json: {
        showQuestionNumbers: "off",
        completeText: "Weiter",

        elements: [
          {
            type: "html",
            name: "audio_player", 
            html: `
              <div style="
                display: flex;
                justify-content: center;
                margin: 10px 0 35px 0;
              ">
                <audio 
                id="${stimulus.id}"
                controls
                controlsList="nodownload"
                >
                  <source src="${stimulus.audio}" type="audio/wav">
                  Ihr Browser unterstützt die Audiowiedergabe nicht.
                </audio>
              </div>
            `,
          },

          {
            type: "checkbox",
            name: "accent_types",
            title:
              "Welche Art von Akzent(en) hören Sie? Wählen Sie alle zutreffenden Antworten aus.",
            choices: [
              {
                value: "standard",
                text: "Standardakzent",
              },
              {
                value: "regional",
                text: "Regionaler Akzent",
              },
              {
                value: "foreign",
                text: "Fremdakzent",
              },
            ],
            isRequired: true,
            colCount: 1,
          },

          {
            type: "html",
            name: "accent_slider_heading",
            visibleIf: "{accent_types} contains 'foreign'",
            html: `
            <div style="margin-top: 30px;">
            <p style="
            font-size: 1.15rem;
            font-weight: 600;
            margin-bottom: 14px; 
            ">
            Bewerten Sie den Akzent der sprechenden Person.
            </p>
            
            <div style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            ">
            <span>Eindeutig muttersprachlich</span>
            <span>Eindeutig fremdsprachig</span>
            </div>
            </div>
            `,
        }, 
        {
            type: "slider",
            name: "accent_rating",
            title: "Akzentbewertung",
            titleLocation: "hidden",
            visibleIf: "{accent_types} contains 'foreign'",
            min: 1,
            max: 6,
            step: 1,
            customLabels: [1, 2, 3, 4, 5, 6],
            showLabels: true,
            isRequired: true,
            requiredErrorText:
            "Bitte bewegen Sie den Schieberegler und wählen Sie eine Bewertung aus.",
        },
        {
  type: "html",
  name: "speaker_description_scale",
  html: `
    <div style="
      width: 100%;
      max-width: 900px;
      margin: 30px auto 10px auto;
      box-sizing: border-box;
    ">
      <p style="
        font-size: 1.15rem;
        font-weight: 600;
        margin-bottom: 28px;
      ">
        Wie würden Sie die sprechende Person anhand des Gehörten beschreiben?
      </p>

      <div style="
        display: grid;
        grid-template-columns:
          minmax(125px, 1fr)
          repeat(6, minmax(34px, 48px))
          minmax(125px, 1fr);
        column-gap: 8px;
        row-gap: 22px;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
      ">
        <div></div>
        <div style="text-align:center;">1</div>
        <div style="text-align:center;">2</div>
        <div style="text-align:center;">3</div>
        <div style="text-align:center;">4</div>
        <div style="text-align:center;">5</div>
        <div style="text-align:center;">6</div>
        <div></div>

        <div style="text-align:right;">Vertrauenswürdig</div>
        ${[1, 2, 3, 4, 5, 6]
          .map(
            (value) => `
              <label style="display:flex; justify-content:center;">
                <input
                  type="radio"
                  name="speaker-trustworthiness"
                  value="${value}"
                  style="width:20px; height:20px;"
                />
              </label>
            `
          )
          .join("")}
        <div>Nicht vertrauenswürdig</div>

        <div style="text-align:right;">Hoch gebildet</div> 
        ${[1, 2, 3, 4, 5, 6]
          .map(
            (value) => `
              <label style="display:flex; justify-content:center;">
                <input
                  type="radio"
                  name="speaker-education"
                  value="${value}"
                  style="width:20px; height:20px;"
                />
              </label>
            `
          )
          .join("")}
        <div>Ungebildet</div>

        <div style="text-align:right;">Städtisch</div>
        ${[1, 2, 3, 4, 5, 6]
          .map(
            (value) => `
              <label style="display:flex; justify-content:center;">
                <input
                  type="radio"
                  name="speaker-urbanity"
                  value="${value}"
                  style="width:20px; height:20px;"
                />
              </label>
            `
          )
          .join("")}
        <div>Nicht städtisch</div>

        <div style="text-align:right;">Wohlhabend</div>
        ${[1, 2, 3, 4, 5, 6]
          .map(
            (value) => `
              <label style="display:flex; justify-content:center;">
                <input
                  type="radio"
                  name="speaker-wealth"
                  value="${value}"
                  style="width:20px; height:20px;"
                />
              </label>
            `
          )
          .join("")}
        <div>Arm</div>
      </div>

      <div
        id="speaker-description-error"
        style="
          display: none;
          margin-top: 18px;
          color: #d32f2f;
          font-weight: 600;
        "
      >
        Bitte beantworten Sie alle vier Bewertungen.
      </div>
    </div>
  `,
}, 
        ],
      }, 

      on_load: () => {
        const slider = document.getElementById(
          "accent-rating-slider"
        ) as HTMLInputElement | null;

        if (slider) {
          accentRating = Number(slider.value);

          slider.addEventListener("input", () => {
            accentRating = Number(slider.value);
          });
        }
        const audio = document.getElementById(
          stimulus.id
        ) as HTMLAudioElement | null;

        if (audio) {
          let completedPlayCount = 0;
          
          audio.addEventListener("ended", () => {
            completedPlayCount += 1;

            if (completedPlayCount >= 2) {
              audio.controls = false;
            }
          });
        }
      },

      on_finish: (data: any) => {
        data.response = {
          ...data.response,
          accent_rating: accentRating,
        };

        data.stimulus_id = stimulus.id;
        data.audio_file = stimulus.audio;
        data.speaker_group = stimulus.speakerGroup;
        data.block = stimulus.block;

        updateSession(startIdx + index, data);
      },
    };
  });
} 