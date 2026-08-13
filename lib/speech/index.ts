/**
 * Listening to a child read, for any game that wants to.
 *
 * `useSpeechRecognition` is the whole surface: hand it the text she should
 * read and it tells you which words have landed, as they land, then whether
 * she got it. See the hook for why there is only one recogniser and why
 * matches are sticky.
 */
export { useSpeechRecognition } from "./useSpeechRecognition";
export type {
  SpeechRecognitionHandle,
  SpeechStatus,
  SpeechTarget,
  UseSpeechRecognitionOptions,
} from "./useSpeechRecognition";
export {
  alignTranscript,
  displayWords,
  mergeSticky,
  normalizeWord,
  tokenize,
  type AlignmentResult,
} from "./matching";
export { LANGUAGES, DEFAULT_LANGUAGE, type SpeechLanguage } from "./languages";
