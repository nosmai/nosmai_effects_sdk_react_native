import type { ViewProps } from 'react-native';

export type CameraPosition = 'front' | 'back';

/** Still-photo flash preference. `auto` is exposure-driven. */
export type NosmaiFlashMode = 'off' | 'on' | 'auto';

/** Continuous preview illumination. */
export type NosmaiTorchMode = 'off' | 'on';

export type PackageType =
  'filter' | 'effect' | 'background' | 'beauty_effect' | 'game';

export type FilterLocation = 'local' | 'cloud';

export type LicenseStatus =
  'valid' | 'invalid' | 'expired' | 'unverified' | 'unknown';

export type ActiveEffectsMode =
  | 'idle'
  | 'effectsFilters'
  | 'filtersBackground'
  | 'beautyFilters'
  | 'beautyBackground'
  | 'unknown';

export type ActiveBackgroundSource =
  'none' | 'manual' | 'filter' | 'package' | 'effect' | 'unknown';

export interface CameraConfiguration {
  position: CameraPosition;
  sessionPreset?: string;
}

export interface NosmaiFilter {
  id: string;
  filterId?: string;
  backendId?: string;
  name: string;
  displayName: string;
  description: string;
  path: string;
  fileSize: number;
  location: FilterLocation;
  packageType: PackageType;
  isFree: boolean;
  isDownloaded: boolean;
  previewUrl?: string;
  category?: string;
  downloadCount: number;
  price: number;
  version?: string;
  author?: string;
  minSdkVersion?: string;
  created?: string;
  tags?: string[];
}

export type NosmaiCloudFilterVersion = '2.0.0';

export interface NosmaiCloudFilterQuery {
  /** Omit to request every package type. */
  packageType?: PackageType;
  /** The current SDK supports catalog version 2 only. */
  version?: NosmaiCloudFilterVersion;
  /** One-based page, up to 2147483647. Omit it for fetch-all behavior. */
  page?: number;
  /** Items per page, from 1 through 100. */
  limit?: number;
  /** Defaults to `true` when page is omitted and `false` otherwise. */
  fetchAllPages?: boolean;
}

export interface NosmaiPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Atomic cloud-catalog result; pagination never lives in shared JS state. */
export interface NosmaiCloudFilterPage {
  filters: NosmaiFilter[];
  pagination: NosmaiPaginationInfo;
}

export interface NosmaiCloudDownloadResult {
  filterId: string;
  /** Absolute local package path accepted by `applyEffect`. */
  path: string;
  alreadyDownloaded: boolean;
}

export type NosmaiEffectParameterType =
  'float' | 'int' | 'bool' | 'string' | 'vector' | 'enum' | 'unknown';

export type NosmaiEffectParameterValue =
  number | boolean | string | readonly number[] | null;

/** Metadata exposed by the currently active authored `.nosmai` package. */
export interface NosmaiEffectParameter {
  name: string;
  type: NosmaiEffectParameterType;
  displayName: string;
  description: string;
  currentValue: NosmaiEffectParameterValue;
  defaultValue: NosmaiEffectParameterValue;
  hasRange: boolean;
  minValue?: number;
  maxValue?: number;
  options: string[];
  /** Present only when the native SDK exposes a stable render-pass ID. */
  passId?: number;
}

export interface NosmaiDownloadProgressEvent {
  filterId: string;
  /** Normalized progress from 0 through 1. */
  progress: number;
}

/** JSON-safe event emitted by an active type="game" `.nosmai` package. */
export interface NosmaiGameEvent {
  event: string;
  game: string;
  sequence: number;
  data: Readonly<Record<string, unknown>>;
}

export interface NosmaiRgbColor {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}

export interface NosmaiRgbAdjustment {
  /** Channel multipliers; 1 is neutral and each value ranges from 0 to 2. */
  red: number;
  green: number;
  blue: number;
}

export type NosmaiMakeupType =
  'lipstick' | 'eyeshadow' | 'blusher' | 'eyelash' | 'eyebrow';

export type NosmaiLipstickStyle = 'classic' | 'matte' | 'natural';
export type NosmaiEyeshadowStyle = 'smokey' | 'shimmer' | 'natural';
export type NosmaiBlusherStyle = 'round' | 'contour' | 'natural';
export type NosmaiEyelashStyle = 'natural' | 'dramatic' | 'wispy';
export type NosmaiEyebrowStyle = 'natural' | 'bold' | 'arched';

type NosmaiColoredMakeupConfiguration<
  TType extends Exclude<NosmaiMakeupType, 'eyelash'>,
  TStyle extends string,
> = {
  type: TType;
  style: TStyle;
  /** Omit to restore the native finish default. Alpha is ignored. */
  color?: NosmaiRgbColor;
  /** Lipstick/blusher 0..2; other makeup 0..1. */
  intensity?: number;
};

export type NosmaiMakeupConfiguration =
  | NosmaiColoredMakeupConfiguration<'lipstick', NosmaiLipstickStyle>
  | NosmaiColoredMakeupConfiguration<'eyeshadow', NosmaiEyeshadowStyle>
  | NosmaiColoredMakeupConfiguration<'blusher', NosmaiBlusherStyle>
  | NosmaiColoredMakeupConfiguration<'eyebrow', NosmaiEyebrowStyle>
  | {
      type: 'eyelash';
      style: NosmaiEyelashStyle;
      intensity?: number;
    };

export interface NosmaiMakeupColor extends NosmaiRgbColor {
  name: string;
}

export type NosmaiFoundationShade =
  'ivory' | 'beige' | 'sand' | 'honey' | 'caramel' | 'mocha' | 'deep';

export interface NosmaiFoundationConfiguration {
  shade?: NosmaiFoundationShade;
  /** Overrides the preset shade; alpha is ignored. */
  color?: NosmaiRgbColor;
  /** Coverage 0..1; defaults to 0.5. */
  coverage?: number;
}

export interface NosmaiContourHighlighterConfiguration {
  /** Independent 0..2 strengths; omitted controls default to zero. */
  contour?: number;
  highlighter?: number;
}

/** Stable IDs shared by Android and iOS native mesh-warp engines. */
export type NosmaiReshapeType =
  | 'lip'
  | 'faceSlim'
  | 'eye'
  | 'nose'
  | 'chin'
  | 'brow'
  | 'browThickness'
  | 'jaw'
  | 'mouthWidth'
  | 'forehead';

export interface NosmaiWhiteBalance {
  temperature: number;
  tint: number;
}

/**
 * Landmark a face sticker is measured from. Every value is a tracked point,
 * so a `leftEye` sticker lands on the eye of a wide face and a narrow face
 * alike. Left and right are the SUBJECT's. The landmark indices behind these
 * names live inside the native engine.
 */
export type NosmaiFaceStickerAnchor =
  | 'center'
  | 'forehead'
  | 'aboveHead'
  | 'leftEye'
  | 'rightEye'
  | 'eyes'
  | 'nose'
  | 'mouth'
  | 'chin';

/**
 * Where the live sticker sits. Offsets are fractions of face width/height
 * measured from the anchor (positive `offsetY` is toward the forehead), so
 * they scale with the face. `scale` is the sticker width as a multiple of face
 * width; `0` (the default) uses the anchor's own default size.
 */
export interface NosmaiFaceStickerPlacement {
  /** Pass the anchor the sticker was applied with; the offset is measured from it. */
  anchor: NosmaiFaceStickerAnchor;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  rotationDeg?: number;
  opacity?: number;
}

export interface NosmaiFaceStickerConfiguration extends Omit<
  NosmaiFaceStickerPlacement,
  'anchor'
> {
  /** Absolute local `file://` URI of a PNG, JPEG or GIF; a GIF animates. */
  uri: string;
  /** Defaults to `center`. */
  anchor?: NosmaiFaceStickerAnchor;
}

export interface NosmaiHsbAdjustment {
  hue: number;
  saturation: number;
  brightness: number;
}

export type NosmaiBackgroundConfiguration =
  | { mode: 'blur'; blurStrength: number }
  | { mode: 'color'; color: NosmaiRgbColor }
  | { mode: 'image'; uri: string }
  | { mode: 'video'; uri: string };

export interface NosmaiActiveEffects {
  mode: number;
  modeName: ActiveEffectsMode;
  activeFilterPath?: string;
  activeEffectPath?: string;
  activeBackgroundPath?: string;
  hasBackground: boolean;
  backgroundSource: number;
  backgroundSourceName: ActiveBackgroundSource;
  hasBeautyEffect: boolean;
  hasBuiltInBeauty: boolean;
  hasManualBackground: boolean;
  /**
   * True while a built-in face sticker occupies the AR slot. The sticker
   * leaves `activeEffectPath` undefined even though the slot is taken, so
   * check this flag rather than the path.
   */
  isFaceStickerActive: boolean;
  /**
   * True while built-in hair colouring is enabled. A beauty effect: it rides
   * the built-in beauty chain and never touches the AR slot.
   */
  isHairColorActive: boolean;
  activeFilter?: NosmaiFilter;
  activeEffect?: NosmaiFilter;
}

export interface NosmaiNativeError {
  code: string;
  message: string;
  details?: Readonly<Record<string, unknown>>;
}

export type GalleryMediaType = 'photo' | 'video';

/** A processed JPEG written to the application's temporary storage. */
export interface NosmaiPhotoResult {
  uri: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  mimeType: 'image/jpeg';
}

/** A finalized processed MP4 written to the application's temporary storage. */
export interface NosmaiRecordingResult {
  uri: string;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: 'video/mp4';
  hasAudio: boolean;
}

/** A persistent media-library identifier returned after a gallery save. */
export interface NosmaiGallerySaveResult {
  uri: string;
  mediaType: GalleryMediaType;
}

/** Best-effort elapsed recording time. The stop result is authoritative. */
export interface NosmaiRecordingProgressEvent {
  durationSeconds: number;
}

export type NosmaiRawFrameFormat = 'i420' | 'rgba8888' | 'bgra8888' | 'nv12';

export type NosmaiRawFrameColorRange = 'full' | 'video' | 'unknown';

/** One plane inside the decoded `dataBase64` byte sequence. */
export interface NosmaiRawFramePlane {
  offset: number;
  byteLength: number;
  bytesPerRow: number;
  width: number;
  height: number;
}

export interface NosmaiFrameMetadata {
  /** Monotonically increasing within one frame-stream lifecycle. */
  sequence: number;
  timestampSeconds: number;
  width: number;
  height: number;
  format: NosmaiRawFrameFormat;
  colorRange: NosmaiRawFrameColorRange;
  byteLength: number;
  planes: NosmaiRawFramePlane[];
  /** Frames rate-limited or overwritten before JavaScript consumed them. */
  droppedFrames: number;
}

export interface NosmaiRawFrame extends NosmaiFrameMetadata {
  /** Base64 for exactly `byteLength` bytes; decode according to `planes`. */
  dataBase64: string;
}

export interface NosmaiFrameStreamOptions {
  /** Integer from 1 through 5. Defaults to 2. */
  maxFramesPerSecond?: number;
}

export interface NosmaiCameraReadyEvent {
  platform: 'android' | 'ios';
}

/** A tap resolved inside the visible camera preview. */
export interface NosmaiGameTapDetails {
  normalizedX: number;
  normalizedY: number;
  locationX: number;
  locationY: number;
  previewWidth: number;
  previewHeight: number;
}

export interface NosmaiCameraViewProps extends ViewProps {
  cameraPosition?: CameraPosition;
  mirror?: boolean;
  /** Automatically forwards preview taps to an active game. Defaults to true. */
  enableGameTapHandling?: boolean;
  /** Overrides automatic forwarding when supplied. */
  onGameTap?: (tap: NosmaiGameTapDetails) => void | Promise<void>;
  onReady?: (event: NosmaiCameraReadyEvent) => void;
  onError?: (error: NosmaiNativeError) => void;
}

export interface NosmaiEventSubscription {
  remove(): void;
}

export interface NosmaiCameraApi {
  /**
   * Starts native initialization. Listen for license-status events for the
   * final asynchronous verification result. `true` means native
   * initialization was accepted; it is not a license-validity verdict.
   */
  initialize(licenseKey: string): Promise<boolean>;
  configureCamera(configuration: CameraConfiguration): Promise<void>;
  startProcessing(): Promise<void>;
  stopProcessing(): Promise<void>;
  /** Resolves `true` when the paused state is reached; invalid state rejects. */
  pauseCamera(): Promise<boolean>;
  /** Resolves `true` when the resumed state is reached; invalid state rejects. */
  resumeCamera(): Promise<boolean>;
  /**
   * Resolves `true` when a switch is accepted and `false` only when a rapid or
   * concurrent request is safely skipped. Operational failures reject.
   */
  switchCamera(): Promise<boolean>;
  hasFlash(): Promise<boolean>;
  hasTorch(): Promise<boolean>;
  /** Returns false when the selected camera cannot provide the requested mode. */
  setFlashMode(mode: NosmaiFlashMode): Promise<boolean>;
  /** Returns false when the selected camera has no torch unit. */
  setTorchMode(mode: NosmaiTorchMode): Promise<boolean>;
  getFlashMode(): Promise<NosmaiFlashMode>;
  getTorchMode(): Promise<NosmaiTorchMode>;
  cleanup(): Promise<void>;

  /** Starts latest-only processed CPU-frame delivery for the active preview. */
  startFrameStream(options?: NosmaiFrameStreamOptions): Promise<void>;
  /** Idempotently stops delivery and clears the retained native frame slot. */
  stopFrameStream(): Promise<void>;
  /** Atomically consumes the slot, or returns undefined while it is empty. */
  getLatestFrame(): Promise<NosmaiRawFrame | undefined>;
  isFrameStreamActive(): Promise<boolean>;

  /** Captures the current processed frame to a temporary JPEG file. */
  capturePhoto(): Promise<NosmaiPhotoResult>;
  /** Starts processed MP4 recording. Operational failures reject. */
  startRecording(): Promise<void>;
  /** Stops and finalizes the active recording. */
  stopRecording(): Promise<NosmaiRecordingResult>;
  /** Returns native recording activity, including start/stop transitions. */
  isRecording(): Promise<boolean>;
  /** Returns elapsed recording time in seconds, or zero while idle. */
  getCurrentRecordingDuration(): Promise<number>;
  /** Copies a local captured JPEG into the platform media library. */
  saveImageToGallery(
    imageUri: string,
    name?: string | null
  ): Promise<NosmaiGallerySaveResult>;
  /** Copies a local finalized MP4 into the platform media library. */
  saveVideoToGallery(
    videoUri: string,
    name?: string | null
  ): Promise<NosmaiGallerySaveResult>;

  /** Resolves `true` after application; invalid/refused packages reject. */
  applyEffect(packagePath: string): Promise<boolean>;
  /** @deprecated Use applyEffect. */
  applyFilter(packagePath: string): Promise<boolean>;
  getActiveEffects(): Promise<NosmaiActiveEffects>;
  getActiveFilterInfo(): Promise<NosmaiFilter | undefined>;
  getActiveEffectInfo(): Promise<NosmaiFilter | undefined>;
  /** Returns an empty list when no authored parameter surface is active. */
  getEffectParameters(): Promise<NosmaiEffectParameter[]>;
  /** Reads a numeric scalar parameter; string/vector values are read via metadata. */
  getEffectParameterValue(parameterName: string): Promise<number>;
  setEffectParameter(parameterName: string, value: number): Promise<boolean>;
  setEffectParameterString(
    parameterName: string,
    value: string
  ): Promise<boolean>;
  isGameReady(): Promise<boolean>;
  /** Coordinates use preview space: top-left is 0,0 and bottom-right is 1,1. */
  sendGameTap(normalizedX: number, normalizedY: number): Promise<boolean>;
  sendGameInput(
    name: string,
    normalizedX: number,
    normalizedY: number,
    value?: number
  ): Promise<boolean>;
  pauseGame(): Promise<void>;
  resumeGame(): Promise<void>;
  restartGame(): Promise<void>;
  /**
   * Returns the installed production package catalog. Omitting packageType
   * returns every supported package type.
   */
  getLocalFilters(packageType?: PackageType): Promise<NosmaiFilter[]>;
  isCloudFilterEnabled(): Promise<boolean>;
  getCloudFilters(
    query?: NosmaiCloudFilterQuery
  ): Promise<NosmaiCloudFilterPage>;
  downloadCloudFilter(
    filter: NosmaiFilter | string
  ): Promise<NosmaiCloudDownloadResult>;
  removeCloudFilter(filter: NosmaiFilter | string): Promise<boolean>;
  /**
   * Resolves `true` when the matching active package is removed and `false`
   * when the path is valid but is not active. Operational failures reject.
   */
  removeEffect(effect: NosmaiFilter | string): Promise<boolean>;
  clearFilter(): Promise<void>;
  clearAREffect(): Promise<void>;
  clearAll(): Promise<void>;

  isBeautyEffectEnabled(): Promise<boolean>;
  isAdvancedFiltersEnabled(): Promise<boolean>;
  setSkinSmoothing(level: number): Promise<void>;
  setSkinWhitening(level: number): Promise<void>;
  /** Compatibility control: sets contour and highlighter together, 0..1. */
  setContourHighlighter(level: number): Promise<void>;
  /** Compatibility alias for applyDarkCircleCorrector, 0..1. */
  setDarkCircleCorrector(level: number): Promise<void>;
  setTeethWhitening(level: number): Promise<void>;
  /** Warm shared renderer resources without applying effects; call after onReady.
   * Android also waits for model setup/fallback; iOS model warm-up stays async. */
  prepareBeautyFilters(): Promise<boolean>;
  /** Last successful preparation in the current session; false during/reset/failure. */
  isBeautyPrepared(): Promise<boolean>;
  /** Hide/show built-in beauty, retaining settings and AR/background packages. */
  setBeautyVisible(visible: boolean): Promise<void>;
  isBeautyVisible(): Promise<boolean>;
  applyContourHighlighter(
    configuration?: NosmaiContourHighlighterConfiguration
  ): Promise<void>;
  /** Approved XYZ marks; quantity 0..1 changes count, retaining mark opacity. */
  applyFreckles(quantity: number): Promise<void>;
  removeFreckles(): Promise<void>;
  applyFoundation(configuration?: NosmaiFoundationConfiguration): Promise<void>;
  removeFoundation(): Promise<void>;
  applyDarkCircleCorrector(intensity: number): Promise<void>;
  removeDarkCircleCorrector(): Promise<void>;
  getLipstickColors(): Promise<NosmaiMakeupColor[]>;
  getEyeshadowColors(): Promise<NosmaiMakeupColor[]>;
  getBlusherColors(): Promise<NosmaiMakeupColor[]>;
  getEyebrowColors(): Promise<NosmaiMakeupColor[]>;
  /** Clears skin, complexion, makeup, reshaping, eye and hair color; retains color controls/packages. */
  clearBeauty(): Promise<void>;
  applyMakeup(configuration: NosmaiMakeupConfiguration): Promise<void>;
  setMakeupIntensity(
    makeupType: NosmaiMakeupType,
    intensity: number
  ): Promise<void>;
  removeMakeup(makeupType: NosmaiMakeupType): Promise<void>;
  isMakeupActive(makeupType: NosmaiMakeupType): Promise<boolean>;
  clearMakeup(): Promise<void>;
  setReshape(type: NosmaiReshapeType, value: number): Promise<void>;
  clearReshaping(): Promise<void>;
  setEyeColor(color: NosmaiRgbColor, intensity?: number): Promise<void>;
  setEyeColorIntensity(intensity: number): Promise<void>;
  removeEyeColor(): Promise<void>;
  isEyeColorActive(): Promise<boolean>;
  setHairColor(color: NosmaiRgbColor, intensity?: number): Promise<void>;
  setHairColorIntensity(intensity: number): Promise<void>;
  removeHairColor(): Promise<void>;
  isHairColorActive(): Promise<boolean>;

  setBrightness(brightness: number): Promise<void>;
  setContrast(contrast: number): Promise<void>;
  setRgbAdjustment(adjustment: NosmaiRgbAdjustment): Promise<void>;
  setSharpening(level: number): Promise<void>;
  setGrayscale(enabled: boolean): Promise<void>;
  setHue(degrees: number): Promise<void>;
  setWhiteBalance(configuration: NosmaiWhiteBalance): Promise<void>;
  setHsb(adjustment: NosmaiHsbAdjustment): Promise<void>;
  resetColorAdjustments(): Promise<void>;

  setBackground(configuration: NosmaiBackgroundConfiguration): Promise<void>;
  clearBackground(): Promise<void>;

  /**
   * Pins an image or animated GIF file to the tracked face. Shares the AR slot
   * with `.nosmai` effects: applying one replaces the other, and built-in
   * beauty is cleared as it is for an authored AR package.
   */
  setFaceSticker(
    configuration: NosmaiFaceStickerConfiguration
  ): Promise<boolean>;
  /** Moves, resizes, rotates or fades the live sticker; never re-reads the file. */
  setFaceStickerPlacement(placement: NosmaiFaceStickerPlacement): Promise<void>;
  /** Removes the face sticker; resolves when no sticker is active. */
  clearFaceSticker(): Promise<void>;
  isFaceStickerActive(): Promise<boolean>;

  addActiveEffectsChangedListener(
    listener: (state: NosmaiActiveEffects) => void
  ): NosmaiEventSubscription;
  addLicenseStatusChangedListener(
    listener: (status: LicenseStatus) => void
  ): NosmaiEventSubscription;
  addErrorListener(
    listener: (error: NosmaiNativeError) => void
  ): NosmaiEventSubscription;
  addRecordingProgressListener(
    listener: (progress: NosmaiRecordingProgressEvent) => void
  ): NosmaiEventSubscription;
  addDownloadProgressListener(
    listener: (progress: NosmaiDownloadProgressEvent) => void
  ): NosmaiEventSubscription;
  addGameEventListener(
    listener: (event: NosmaiGameEvent) => void
  ): NosmaiEventSubscription;
  addFrameAvailableListener(
    listener: (metadata: NosmaiFrameMetadata) => void
  ): NosmaiEventSubscription;
}
