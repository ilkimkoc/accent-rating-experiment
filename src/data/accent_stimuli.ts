import { shuffleArray } from "../utils/helpers";
export type AccentStimulus = {
  id: string;
  audio: string;
  speakerGroup: "HS" | "Ret";
  block: number;
};

function createStimulus(id: string, block: number): AccentStimulus {
  const speakerGroup: AccentStimulus["speakerGroup"] =
    id.startsWith("HS_") ? "HS" : "Ret";

  return {
    id,
    audio: `assets/audios/de/${id}.wav`,  
    speakerGroup,
    block,
  };
}

export const GERMAN_LIST_1 = [
  [
    "HS_GR_1",
    "HS_GR_2",
    "Ret_GR_1",
    "Ret_GR_2",
  ].map((id) => createStimulus(id, 1)),

  [
    "HS_GR_7",
    "HS_GR_8",
    "Ret_GR_7",
    "Ret_GR_8",
  ].map((id) => createStimulus(id, 2)),

  [
    "HS_GR_13",
    "HS_GR_14",
    "Ret_GR_13",
    "Ret_GR_14",
  ].map((id) => createStimulus(id, 3)),

  [
    "HS_GR_19",
    "HS_GR_20",
    "Ret_GR_19",
    "Ret_GR_20",
  ].map((id) => createStimulus(id, 4)),

  [
    "HS_GR_25",
    "HS_GR_26",
    "Ret_GR_25",
    "Ret_GR_26",
  ].map((id) => createStimulus(id, 5)),
];

export const GERMAN_LIST_2 = [
  [
    "HS_GR_5",
    "HS_GR_6",
    "Ret_GR_5",
    "Ret_GR_6",
  ].map((id) => createStimulus(id, 1)),

  [
    "HS_GR_11",
    "HS_GR_12",
    "Ret_GR_11",
    "Ret_GR_12",
  ].map((id) => createStimulus(id, 2)),

  [
    "HS_GR_17",
    "HS_GR_18",
    "Ret_GR_17",
    "Ret_GR_18",
  ].map((id) => createStimulus(id, 3)),

  [
    "HS_GR_23",
    "HS_GR_24",
    "Ret_GR_23",
    "Ret_GR_24",
  ].map((id) => createStimulus(id, 4)),

  [
    "HS_GR_29",
    "Ret_GR_29",
    "Ret_GR_30",
  ].map((id) => createStimulus(id, 5)),
];

export const GERMAN_LIST_3 = [
  [
    "HS_GR_3",
    "HS_GR_4",
    "Ret_GR_3",
    "Ret_GR_4",
  ].map((id) => createStimulus(id, 1)),

  [
    "HS_GR_9",
    "HS_GR_10",
    "Ret_GR_9",
    "Ret_GR_10",
  ].map((id) => createStimulus(id, 2)),

  [
    "HS_GR_15",
    "HS_GR_16",
    "Ret_GR_15",
    "Ret_GR_16",
  ].map((id) => createStimulus(id, 3)),

  [
    "HS_GR_21",
    "HS_GR_22",
    "Ret_GR_21",
    "Ret_GR_22",
  ].map((id) => createStimulus(id, 4)),

  [
    "HS_GR_27",
    "HS_GR_28",
    "Ret_GR_27",
    "Ret_GR_28",
  ].map((id) => createStimulus(id, 5)),
];

export const GERMAN_STIMULUS_LISTS = [
  GERMAN_LIST_1,
  GERMAN_LIST_2,
  GERMAN_LIST_3,
]; 
export function getGermanStimulusList(
  participantNumber: number
): AccentStimulus[] {
  const listIndex =
    (participantNumber - 1) % GERMAN_STIMULUS_LISTS.length;

  const selectedList = GERMAN_STIMULUS_LISTS[listIndex];

  return selectedList.reduce(
    (allStimuli: AccentStimulus[], block: AccentStimulus[]) => [
      ...allStimuli,
      ...shuffleArray([...block]),
    ],
    []
  );
} 