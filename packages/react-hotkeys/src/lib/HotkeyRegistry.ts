import { KeyMap } from "./definitions/KeyMap";
import type { KeyValueType } from "./hooks/useHotkey";
import type { HotKeyChordDef } from "./types/hotkey/HotKeyChordDef";
import type { HotKeySequenceDef } from "./types/hotkey/HotKeySequenceDef";
import type { SequenceTree } from "./types/hotkey/sequence/SequenceTree";
import type { KeyDescription } from "./types/key/KeyDescription";
import type { ModifierKeyCode } from "./types/key/ModifierKeyCode";
import { checkModifierPressed } from "./util/checkModifierPressed";
import { isModifierKeyboardEvent } from "./util/isModifierKeyboardEvent";
import { wrongModifierPressed } from "./util/wrongModifierPressed";

export class HotkeyRegistry {
  sequenceTimeout: number;
  chordTimeout: number;

  chords: Record<string, HotKeyChordDef> = {};

  // Sorted from most to least modifiers to prefer more accurate hotkeys (e.g. prefer Shift+Alt+G against Alt+G)
  sortedChords: HotKeyChordDef[] = [];

  sequence: Record<string, HotKeySequenceDef> = {};
  sequenceTree: SequenceTree | undefined;

  incompleteChord?: HotKeyChordDef;
  incompleteChordMissingModifier?: ModifierKeyCode[];
  incompleteChordTimeoutId?: number;

  waitingSequenceNodes: Record<number, SequenceTree> = {};

  constructor(sequenceTimeout?: number, chordTimeout?: number) {
    this.sequenceTimeout = sequenceTimeout ?? 400;
    this.chordTimeout = chordTimeout ?? 100;
  }

  private updateSortedChords() {
    this.sortedChords = Object.values(this.chords).sort(
      (c1, c2) =>
        Object.values(c2.modifier).filter((v) => v).length -
        Object.values(c1.modifier).filter((v) => v).length,
    );
  }

  public addChordHotkey(hotkey: HotKeyChordDef) {
    this.chords[hotkey.id] = hotkey;
    this.updateSortedChords();
  }

  public addSequenceHotkey(hotkey: HotKeySequenceDef) {
    this.sequence[hotkey.id] = hotkey;

    if (this.sequenceTree == null)
      this.sequenceTree = { hotkey: [], keyBased: {}, codeBased: {} };

    let treeNode: SequenceTree = this.sequenceTree;

    for (let i = 0; i < hotkey.keys.length; i++) {
      const k = KeyMap[hotkey.keys[i]];
      const subtree = k.on === "key" ? treeNode.keyBased : treeNode.codeBased;
      const key = k.value;

      if (subtree[key] == null)
        subtree[key] = {
          hotkey: [],
          keyBased: {},
          codeBased: {},
        };
      if (i === hotkey.keys.length - 1) subtree[key].hotkey.push(hotkey);
      treeNode = subtree[key];
    }
  }

  public removeChordHotkey(id: string) {
    Reflect.deleteProperty(this.chords, id);
    this.updateSortedChords();
  }

  public removeSequenceHotkey(id: string) {
    const hotkey = this.sequence[id];

    const clearTree = (
      node: SequenceTree,
      leftKeys: KeyDescription<KeyValueType>[],
    ) => {
      if (leftKeys.length == 0) {
        node.hotkey = node.hotkey.filter((hk) => hk.id !== hotkey.id);
        return;
      }

      const [cur, ...other] = leftKeys;
      const key = cur.value;
      const subtree = cur.on === "key" ? node.keyBased : node.codeBased;
      const nextNode = subtree[key];
      if (nextNode != null) {
        clearTree(nextNode, other);
        if (
          nextNode.hotkey.length === 0 &&
          Object.keys(nextNode.codeBased).length == 0 &&
          Object.keys(nextNode.keyBased).length == 0
        )
          Reflect.deleteProperty(subtree, key);
      }
    };

    if (this.sequenceTree != null)
      clearTree(
        this.sequenceTree,
        hotkey.keys.map((k) => KeyMap[k]),
      );

    Reflect.deleteProperty(this.chords, id);
  }

  private resolveSequenceTreeNode(
    treeNode: SequenceTree,
    event: KeyboardEvent,
  ) {
    const sequenceNodeCodeBased = treeNode.codeBased[event.code];
    const sequenceNodeKeyBased = treeNode.keyBased[event.key];

    if (sequenceNodeCodeBased != null) {
      if (
        sequenceNodeCodeBased.hotkey.length > 0 &&
        Object.keys(sequenceNodeCodeBased.codeBased).length === 0 &&
        Object.keys(sequenceNodeCodeBased.keyBased).length === 0
      ) {
        sequenceNodeCodeBased.hotkey.forEach((hk) => hk.callback());
        this.waitingSequenceNodes = {};
      } else {
        const id = setTimeout(() => {
          Reflect.deleteProperty(this.waitingSequenceNodes, id);
        }, this.sequenceTimeout);
        this.waitingSequenceNodes[id] = sequenceNodeCodeBased;
      }
    }

    if (sequenceNodeKeyBased != null) {
      if (
        sequenceNodeKeyBased.hotkey.length > 0 &&
        Object.keys(sequenceNodeKeyBased.codeBased).length === 0 &&
        Object.keys(sequenceNodeKeyBased.keyBased).length === 0
      ) {
        sequenceNodeKeyBased.hotkey.forEach((hk) => hk.callback());
        this.waitingSequenceNodes = {};
      } else {
        const id = setTimeout(() => {
          Reflect.deleteProperty(this.waitingSequenceNodes, id);
        }, this.sequenceTimeout);
        this.waitingSequenceNodes[id] = sequenceNodeKeyBased;
      }
    }
  }

  clearIncompleteChord() {
    clearTimeout(this.incompleteChordTimeoutId);
    this.incompleteChord = undefined;
    this.incompleteChordMissingModifier = undefined;
    this.incompleteChordTimeoutId = undefined;
  }

  handleModifierKeydown(event: KeyboardEvent) {
    if (this.incompleteChord == null) {
      return;
    }

    if (checkModifierPressed(this.incompleteChord, event)) {
      this.handleChordHotkeyPressSuccess(this.incompleteChord, event);
      this.clearIncompleteChord();
    } else if (wrongModifierPressed(this.incompleteChord, event)) {
      this.clearIncompleteChord();
    }
  }

  handleChordHotkeyPressSuccess(chord: HotKeyChordDef, event: KeyboardEvent) {
    // TODO: make an option to
    if ((event.target as HTMLElement).isContentEditable) {
      return;
    }
    if (chord.options.preventDefault) event.preventDefault();
    chord.callback();

    // clear partial sequence hotkeys
    this.waitingSequenceNodes = {};
  }

  public handleKeydown(event: KeyboardEvent) {
    if (isModifierKeyboardEvent(event)) {
      this.handleModifierKeydown(event);
      return;
    } else if (this.incompleteChordTimeoutId) {
      this.clearIncompleteChord();
    }

    for (const chord of this.sortedChords) {
      if (
        chord.resolve === "key"
          ? event.key.toLowerCase() === chord.primaryValue.toLowerCase()
          : event.code === chord.primaryValue
      ) {
        if (checkModifierPressed(chord, event)) {
          this.handleChordHotkeyPressSuccess(chord, event);
          return; // TODO: same chord keys should trigger together, not only the first one...
        } else {
          this.incompleteChord = chord; // TODO: same chord keys should trigger together, not only the first one...
          this.incompleteChordTimeoutId = setTimeout(() => {
            this.incompleteChord = undefined;
          }, this.chordTimeout);
        }
      }
    }

    if (this.sequenceTree) {
      if (Object.keys(this.waitingSequenceNodes).length === 0) {
        this.resolveSequenceTreeNode(this.sequenceTree, event);
      } else {
        const nodes = { ...this.waitingSequenceNodes };
        this.waitingSequenceNodes = {};

        Object.values(nodes).forEach((node) =>
          this.resolveSequenceTreeNode(node, event),
        );
      }
    }
  }
}
