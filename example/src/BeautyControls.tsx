import { useEffect, useRef, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { NosmaiCameraSdk } from '@nosmai/react-native-effects-sdk';
import type {
  NosmaiFoundationShade,
  NosmaiMakeupColor,
  NosmaiMakeupConfiguration,
  NosmaiMakeupType,
  NosmaiReshapeType,
} from '@nosmai/react-native-effects-sdk';

const MAKEUP = {
  lipstick: ['classic', 'matte', 'natural'],
  eyeshadow: ['smokey', 'shimmer', 'natural'],
  blusher: ['round', 'contour', 'natural'],
  eyelash: ['natural', 'dramatic', 'wispy'],
  eyebrow: ['natural', 'bold', 'arched'],
} as const;
const SHADES: NosmaiFoundationShade[] = [
  'ivory',
  'beige',
  'sand',
  'honey',
  'caramel',
  'mocha',
  'deep',
];
const RESHAPES: NosmaiReshapeType[] = [
  'lip',
  'faceSlim',
  'eye',
  'nose',
  'chin',
  'brow',
  'browThickness',
  'jaw',
  'mouthWidth',
  'forehead',
];

/** Native values are committed on release to avoid flooding the visual queue. */
function BeautySlider({
  label,
  value,
  max = 1,
  min = 0,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  max?: number;
  min?: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value);
  const current = useRef(value);
  const width = useRef(1);
  useEffect(() => {
    setDraft(value);
    current.current = value;
  }, [value]);
  const move = (x: number) => {
    current.current =
      Math.round(
        (min + Math.max(0, Math.min(1, x / width.current)) * (max - min)) * 100
      ) / 100;
    setDraft(current.current);
  };
  return (
    <View style={styles.sliderRow}>
      <Text style={styles.text}>
        {label}: {draft.toFixed(2)}
      </Text>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        accessibilityValue={{ min, max, now: draft }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (disabled) return;
          onChange(
            Math.max(
              min,
              Math.min(
                max,
                draft + (nativeEvent.actionName === 'increment' ? 0.1 : -0.1)
              )
            )
          );
        }}
        onLayout={({ nativeEvent }) => {
          width.current = nativeEvent.layout.width;
        }}
        onStartShouldSetResponder={() => !disabled}
        onResponderGrant={({ nativeEvent }) => move(nativeEvent.locationX)}
        onResponderMove={({ nativeEvent }) => move(nativeEvent.locationX)}
        onResponderRelease={() => onChange(current.current)}
        onResponderTerminate={() => {
          current.current = value;
          setDraft(value);
        }}
        style={styles.track}
      >
        <View
          pointerEvents="none"
          style={[
            styles.fill,
            { width: `${(100 * (draft - min)) / (max - min)}%` },
          ]}
        />
      </View>
    </View>
  );
}

export function BeautyControls({
  disabled,
  ready,
  run,
}: {
  disabled: boolean;
  ready: boolean;
  run: (label: string, operation: () => Promise<unknown>) => Promise<void>;
}) {
  const [type, setType] = useState<NosmaiMakeupType>('lipstick');
  const [palettes, setPalettes] = useState<
    Partial<Record<NosmaiMakeupType, NosmaiMakeupColor[]>>
  >({});
  const [selection, setSelection] = useState<
    Record<
      NosmaiMakeupType,
      { style: string; intensity: number; color?: NosmaiMakeupColor }
    >
  >({
    lipstick: { style: 'classic', intensity: 1 },
    eyeshadow: { style: 'smokey', intensity: 1 },
    blusher: { style: 'round', intensity: 1 },
    eyelash: { style: 'natural', intensity: 1 },
    eyebrow: { style: 'natural', intensity: 1 },
  });
  const [values, setValues] = useState({
    smoothing: 0,
    whitening: 0,
    teeth: 0,
    freckles: 0,
    darkCircle: 0,
    contour: 0,
    highlighter: 0,
    coverage: 0,
  });
  const [shade, setShade] = useState<NosmaiFoundationShade>('honey');
  const [reshape, setReshape] = useState<NosmaiReshapeType>('faceSlim');
  const [reshapes, setReshapes] = useState<
    Partial<Record<NosmaiReshapeType, number>>
  >({});
  const selected = selection[type];

  const loadPalettes = () =>
    run('Load makeup colours', async () => {
      const [lipstick, eyeshadow, blusher, eyebrow] = await Promise.all([
        NosmaiCameraSdk.getLipstickColors(),
        NosmaiCameraSdk.getEyeshadowColors(),
        NosmaiCameraSdk.getBlusherColors(),
        NosmaiCameraSdk.getEyebrowColors(),
      ]);
      setPalettes({ lipstick, eyeshadow, blusher, eyebrow });
    });
  const apply = (next = selected) =>
    run(`Apply ${type}`, async () => {
      await NosmaiCameraSdk.applyMakeup({
        type,
        ...next,
      } as NosmaiMakeupConfiguration);
      setSelection((old) => ({ ...old, [type]: next }));
    });
  const change = (
    key: keyof typeof values,
    next: number,
    operation: () => Promise<void>
  ) =>
    run(key, async () => {
      await operation();
      setValues((old) => ({ ...old, [key]: next }));
    });

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Production beauty controls</Text>
      <BeautySlider
        label="Skin smoothing"
        value={values.smoothing}
        disabled={disabled}
        onChange={(v) =>
          change('smoothing', v, () => NosmaiCameraSdk.setSkinSmoothing(v))
        }
      />
      <BeautySlider
        label="Skin whitening"
        value={values.whitening}
        disabled={disabled}
        onChange={(v) =>
          change('whitening', v, () => NosmaiCameraSdk.setSkinWhitening(v))
        }
      />
      <BeautySlider
        label="Teeth whitening"
        value={values.teeth}
        disabled={disabled}
        onChange={(v) =>
          change('teeth', v, () => NosmaiCameraSdk.setTeethWhitening(v))
        }
      />
      <BeautySlider
        label="Freckles quantity"
        value={values.freckles}
        disabled={disabled}
        onChange={(v) =>
          change('freckles', v, () => NosmaiCameraSdk.applyFreckles(v))
        }
      />
      <BeautySlider
        label="Dark-circle correction"
        value={values.darkCircle}
        disabled={disabled}
        onChange={(v) =>
          change('darkCircle', v, () =>
            NosmaiCameraSdk.applyDarkCircleCorrector(v)
          )
        }
      />
      <BeautySlider
        label="Contour"
        value={values.contour}
        max={2}
        disabled={disabled}
        onChange={(v) =>
          change('contour', v, () =>
            NosmaiCameraSdk.applyContourHighlighter({
              contour: v,
              highlighter: values.highlighter,
            })
          )
        }
      />
      <BeautySlider
        label="Highlighter"
        value={values.highlighter}
        max={2}
        disabled={disabled}
        onChange={(v) =>
          change('highlighter', v, () =>
            NosmaiCameraSdk.applyContourHighlighter({
              contour: values.contour,
              highlighter: v,
            })
          )
        }
      />
      <Text style={styles.heading}>Foundation shade</Text>
      <View style={styles.row}>
        {SHADES.map((name) => (
          <Pressable
            key={name}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: name === shade }}
            style={[styles.chip, name === shade && styles.selected]}
            onPress={() =>
              run('Foundation shade', async () => {
                await NosmaiCameraSdk.applyFoundation({
                  shade: name,
                  coverage: values.coverage || 0.5,
                });
                setShade(name);
                setValues((old) => ({ ...old, coverage: old.coverage || 0.5 }));
              })
            }
          >
            <Text style={styles.text}>{name}</Text>
          </Pressable>
        ))}
      </View>
      <BeautySlider
        label="Foundation coverage"
        value={values.coverage}
        disabled={disabled}
        onChange={(v) =>
          change('coverage', v, () =>
            NosmaiCameraSdk.applyFoundation({ shade, coverage: v })
          )
        }
      />
      <Text style={styles.heading}>Layered makeup</Text>
      <View style={styles.row}>
        {(Object.keys(MAKEUP) as NosmaiMakeupType[]).map((layer) => (
          <Pressable
            key={layer}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: layer === type }}
            style={[styles.chip, layer === type && styles.selected]}
            onPress={() => setType(layer)}
          >
            <Text style={styles.text}>{layer}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        {MAKEUP[type].map((style) => (
          <Pressable
            key={style}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: style === selected.style }}
            style={[styles.chip, style === selected.style && styles.selected]}
            onPress={() => apply({ ...selected, style })}
          >
            <Text style={styles.text}>{style}</Text>
          </Pressable>
        ))}
      </View>
      {type !== 'eyelash' && (
        <>
          <Button
            title="Load native colour palettes"
            disabled={disabled || !ready}
            onPress={loadPalettes}
          />
          <View style={styles.row}>
            <Pressable
              disabled={disabled}
              accessibilityRole="button"
              style={styles.chip}
              onPress={() =>
                apply({ style: selected.style, intensity: selected.intensity })
              }
            >
              <Text style={styles.text}>Default colour</Text>
            </Pressable>
            {palettes[type]?.map((color) => (
              <Pressable
                key={color.name}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={color.name}
                accessibilityState={{
                  selected: selected.color?.name === color.name,
                }}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: `rgb(${Math.round(color.red * 255)},${Math.round(color.green * 255)},${Math.round(color.blue * 255)})`,
                  },
                  selected.color?.name === color.name && styles.selected,
                ]}
                onPress={() => apply({ ...selected, color })}
              >
                <Text style={styles.swatchLabel}>{color.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      <BeautySlider
        label={`${type} strength`}
        value={selected.intensity}
        max={type === 'lipstick' || type === 'blusher' ? 2 : 1}
        disabled={disabled}
        onChange={(intensity) => apply({ ...selected, intensity })}
      />
      <View style={styles.row}>
        <Button
          title="Apply layer"
          disabled={disabled}
          onPress={() => apply()}
        />
        <Button
          title="Remove layer"
          disabled={disabled}
          onPress={() =>
            run(`Remove ${type}`, () => NosmaiCameraSdk.removeMakeup(type))
          }
        />
      </View>
      <Text style={styles.heading}>Signed face reshape</Text>
      <View style={styles.row}>
        {RESHAPES.map((name) => (
          <Pressable
            key={name}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: name === reshape }}
            style={[styles.chip, name === reshape && styles.selected]}
            onPress={() => setReshape(name)}
          >
            <Text style={styles.text}>{name}</Text>
          </Pressable>
        ))}
      </View>
      <BeautySlider
        label={reshape}
        value={reshapes[reshape] ?? 0}
        min={-1}
        max={1}
        disabled={disabled}
        onChange={(v) =>
          run(`Reshape ${reshape}`, async () => {
            await NosmaiCameraSdk.setReshape(reshape, v);
            setReshapes((old) => ({ ...old, [reshape]: v }));
          })
        }
      />
      <Text style={styles.text}>
        Zero removes only that complexion layer. Hide/Show keeps your
        selections.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 8, marginVertical: 12 },
  heading: { color: '#fff', fontSize: 16, fontWeight: '600' },
  text: { color: '#ddd', fontSize: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#303644',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: { borderColor: '#66d9b3' },
  sliderRow: { gap: 5, paddingVertical: 4 },
  track: {
    height: 30,
    borderRadius: 12,
    backgroundColor: '#303644',
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#447866' },
  swatch: {
    minWidth: 64,
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'flex-end',
  },
  swatchLabel: {
    color: '#fff',
    backgroundColor: '#0008',
    fontSize: 10,
    padding: 3,
  },
});
