window.__ModuleLoader__.load({
  id: '@local/dsh-prompt-presets',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace shared by the panel page, the sidebar entry, and the composer chips. */
    const NS = 'promptPresets';
    /** Keyed `main` panel and `sidebar.panellist` entry share this id. */
    const PANEL_ID = 'prompt-presets';
    /** Browser-local storage slot; presets are per user and per browser profile. */
    const STORAGE_KEY = 'dsh.prompt-presets.v1';
    const MAX_NAME = 64;

    /** English copy (key-set source of truth). */
    const en = {
      panel: 'Prompt presets',
      'page.title': 'Prompt presets',
      'page.subtitle': 'Save reusable prompts, then insert them into the composer with one click.',
      'page.count': 'All presets ({count})',
      'action.new': 'New preset',
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.edit': 'Edit',
      'action.delete': 'Delete',
      'action.moveUp': 'Move up',
      'action.moveDown': 'Move down',
      'editor.newTitle': 'New prompt preset',
      'editor.editTitle': 'Edit prompt preset',
      'field.name': 'Name',
      'field.namePlaceholder': 'e.g. Code review checklist',
      'field.nameCounter': '{count}/{max}',
      'field.nameRequired': 'Enter a name for this preset.',
      'field.content': 'Prompt content',
      'field.contentPlaceholder': 'Write the text that should be inserted into the prompt input.',
      'field.contentRequired': 'Enter the prompt content.',
      'empty.title': 'No prompt presets yet',
      'empty.body': 'Create a preset to reuse instructions, context, or boilerplate without retyping it.',
      'empty.action': 'Create a preset',
      'delete.confirm': 'Delete “{name}”?',
      'composer.group': 'Prompt presets',
      'composer.insert': 'Insert “{name}” into the prompt'
    };

    /** Simplified Chinese copy, complete against the English key set. */
    const zh = {
      panel: 'Prompt 预设',
      'page.title': 'Prompt 预设',
      'page.subtitle': '保存可复用的 Prompt，并一键插入到输入框。',
      'page.count': '共 {count} 个预设',
      'action.new': '新建预设',
      'action.save': '保存',
      'action.cancel': '取消',
      'action.edit': '编辑',
      'action.delete': '删除',
      'action.moveUp': '上移',
      'action.moveDown': '下移',
      'editor.newTitle': '新建 Prompt 预设',
      'editor.editTitle': '编辑 Prompt 预设',
      'field.name': '名称',
      'field.namePlaceholder': '例如：代码审查清单',
      'field.nameCounter': '{count}/{max}',
      'field.nameRequired': '请输入预设名称。',
      'field.content': 'Prompt 内容',
      'field.contentPlaceholder': '填写要插入到输入框中的内容。',
      'field.contentRequired': '请输入 Prompt 内容。',
      'empty.title': '还没有 Prompt 预设',
      'empty.body': '创建预设后，可以重复使用指令、上下文或样板文字，无需重新输入。',
      'empty.action': '创建预设',
      'delete.confirm': '删除“{name}”？',
      'composer.group': 'Prompt 预设',
      'composer.insert': '将“{name}”插入到输入框'
    };

    /** One inline SVG geometry set, drawn with the surrounding text color. */
    function Glyph({ size = 16, children, className }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          className
        },
        children
      );
    }

    function IconPlus({ size = 16 }) {
      return h(Glyph, { size }, h('path', { d: 'M12 5v14M5 12h14' }));
    }

    function IconPencil({ size = 16 }) {
      return h(
        Glyph,
        { size },
        h('path', { d: 'M4.5 19.5H8l10-10a2.1 2.1 0 0 0-3-3l-10 10v3Z' }),
        h('path', { d: 'M13.5 7.5 16.5 10.5' })
      );
    }

    function IconTrash({ size = 16 }) {
      return h(
        Glyph,
        { size },
        h('path', { d: 'M4 7h16M9.5 4h5M6.5 7l.8 12a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9L17.5 7' }),
        h('path', { d: 'M10 11v5M14 11v5' })
      );
    }

    function IconArrowUp({ size = 16 }) {
      return h(Glyph, { size }, h('path', { d: 'M12 19V5M6 11l6-6 6 6' }));
    }

    function IconArrowDown({ size = 16 }) {
      return h(Glyph, { size }, h('path', { d: 'M12 5v14M6 13l6 6 6-6' }));
    }

    function IconCheck({ size = 16 }) {
      return h(Glyph, { size }, h('path', { d: 'm5 12.5 4.5 4.5L19 7.5' }));
    }

    function IconPrompt({ size = 18 }) {
      return h(
        Glyph,
        { size },
        h('path', { d: 'M4.5 5.5h15v10h-9l-6 4v-14Z' }),
        h('path', { d: 'M8.5 9h7M8.5 12h4.5' })
      );
    }

    /** Sidebar panel glyph; the sidebar owns the navigation button and its label. */
    function PresetPanelIcon({ size = 18 }) {
      return h(IconPrompt, { size });
    }

    function IconButton({ label, disabled, danger, onClick, children }) {
      return h(
        'button',
        {
          type: 'button',
          className: danger ? 'dsh-pp-iconBtn dsh-pp-iconBtnDanger' : 'dsh-pp-iconBtn',
          'aria-label': label,
          title: label,
          disabled,
          onClick
        },
        children
      );
    }

    /** Generate a preset id without depending on a secure-context-only API. */
    function createId() {
      try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return crypto.randomUUID();
        }
      } catch (error) {
        /* Fall through to the timestamp form. */
      }
      return 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    }

    /** Accept only well-formed stored rows, keeping their array order. */
    function normalizePresets(value) {
      if (!Array.isArray(value)) return [];
      const seen = new Set();
      const rows = [];
      for (const row of value) {
        if (row === null || typeof row !== 'object') continue;
        const name = typeof row.name === 'string' ? row.name.trim().slice(0, MAX_NAME) : '';
        const content = typeof row.content === 'string' ? row.content : '';
        if (name === '' || content === '') continue;
        let id = typeof row.id === 'string' && row.id !== '' ? row.id : createId();
        if (seen.has(id)) id = createId();
        seen.add(id);
        rows.push({ id, name, content });
      }
      return rows;
    }

    function readPresets() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return [];
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null || raw === '') return [];
        return normalizePresets(JSON.parse(raw));
      } catch (error) {
        console.error('[prompt-presets] could not read saved presets', error);
        return [];
      }
    }

    function writePresets(rows) {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
      } catch (error) {
        console.error('[prompt-presets] could not save presets', error);
      }
    }

    /** Minimal external store: one array snapshot and stable subscribe identity. */
    function createPresetStore(initial) {
      let rows = initial;
      const listeners = new Set();
      const emit = () => {
        for (const listener of listeners) {
          try {
            listener();
          } catch (error) {
            console.error('[prompt-presets] store listener failed', error);
          }
        }
      };
      return {
        getSnapshot: () => rows,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        replace(next, persist = true) {
          rows = next;
          if (persist) writePresets(rows);
          emit();
        },
        reload() {
          rows = readPresets();
          emit();
        }
      };
    }

    function usePresets(store) {
      return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    }

    /** Panel page: list, create, edit, reorder, and delete presets. */
    function PresetPage({ store, actions, t }) {
      const presets = usePresets(store);
      const [draft, setDraft] = React.useState(null);
      const [editorKey, setEditorKey] = React.useState(0);
      const [pendingDelete, setPendingDelete] = React.useState(null);
      const editorRef = React.useRef(null);

      React.useEffect(() => {
        const node = editorRef.current;
        if (draft !== null && node !== null) node.scrollIntoView({ block: 'nearest' });
      }, [draft]);

      const beginNew = () => {
        setPendingDelete(null);
        setEditorKey((value) => value + 1);
        setDraft({ id: null, name: '', content: '' });
      };
      const beginEdit = (preset) => {
        setPendingDelete(null);
        setEditorKey((value) => value + 1);
        setDraft({ id: preset.id, name: preset.name, content: preset.content });
      };
      const closeEditor = () => {
        setDraft(null);
      };
      const save = (values) => {
        if (draft !== null && draft.id !== null) actions.update(draft.id, values);
        else actions.create(values);
        setDraft(null);
      };
      const confirmDelete = (preset) => {
        actions.remove(preset.id);
        setPendingDelete(null);
        if (draft !== null && draft.id === preset.id) setDraft(null);
      };

      return h(
        'div',
        { className: 'dsh-pp-page' },
        h(
          'div',
          { className: 'dsh-pp-scroll' },
          h(
            'div',
            { className: 'dsh-pp-content' },
            h(
              'header',
              { className: 'dsh-pp-head' },
              h(
                'div',
                { className: 'dsh-pp-headText' },
                h('h1', { className: 'dsh-pp-title' }, t('page.title')),
                h('p', { className: 'dsh-pp-subtitle' }, t('page.subtitle'))
              ),
              h(
                'button',
                { type: 'button', className: 'dsh-pp-btn dsh-pp-btnPrimary', onClick: beginNew },
                h(IconPlus, { size: 16 }),
                t('action.new')
              )
            ),
            draft !== null &&
              h(PresetEditor, {
                key: editorKey,
                initial: draft,
                t,
                formRef: editorRef,
                onSave: save,
                onCancel: closeEditor
              }),
            presets.length === 0
              ? draft === null && h(EmptyState, { t, onCreate: beginNew })
              : h(
                  'section',
                  { 'aria-label': t('page.title') },
                  h(
                    'div',
                    { className: 'dsh-pp-listHeader' },
                    h('span', null, t('page.count', { count: presets.length }))
                  ),
                  h(
                    'ul',
                    { className: 'dsh-pp-list' },
                    presets.map((preset, index) =>
                      h(PresetRow, {
                        key: preset.id,
                        preset,
                        index,
                        total: presets.length,
                        t,
                        editing: draft !== null && draft.id === preset.id,
                        pendingDelete: pendingDelete === preset.id,
                        onEdit: () => beginEdit(preset),
                        onMove: (delta) => actions.move(preset.id, delta),
                        onRequestDelete: () => setPendingDelete(preset.id),
                        onCancelDelete: () => setPendingDelete(null),
                        onConfirmDelete: () => confirmDelete(preset)
                      })
                    )
                  )
                )
          )
        )
      );
    }

    function EmptyState({ t, onCreate }) {
      return h(
        'div',
        { className: 'dsh-pp-empty' },
        h('div', { className: 'dsh-pp-emptyIcon' }, h(IconPrompt, { size: 20 })),
        h('p', { className: 'dsh-pp-emptyTitle' }, t('empty.title')),
        h('p', { className: 'dsh-pp-emptyBody' }, t('empty.body')),
        h(
          'button',
          { type: 'button', className: 'dsh-pp-btn dsh-pp-btnOutline dsh-pp-emptyAction', onClick: onCreate },
          h(IconPlus, { size: 15 }),
          t('empty.action')
        )
      );
    }

    function PresetRow({
      preset,
      index,
      total,
      t,
      editing,
      pendingDelete,
      onEdit,
      onMove,
      onRequestDelete,
      onCancelDelete,
      onConfirmDelete
    }) {
      return h(
        'li',
        { className: editing ? 'dsh-pp-row dsh-pp-rowEditing' : 'dsh-pp-row' },
        h(
          'div',
          { className: 'dsh-pp-rowHead' },
          h('span', { className: 'dsh-pp-index', 'aria-hidden': 'true' }, String(index + 1)),
          h(
            'div',
            { className: 'dsh-pp-rowBody' },
            h('div', { className: 'dsh-pp-rowName' }, preset.name),
            preset.content !== '' && h('div', { className: 'dsh-pp-rowPreview' }, preset.content)
          ),
          h(
            'div',
            { className: 'dsh-pp-rowActions' },
            h(
              IconButton,
              { label: t('action.moveUp'), disabled: index === 0, onClick: () => onMove(-1) },
              h(IconArrowUp, { size: 16 })
            ),
            h(
              IconButton,
              { label: t('action.moveDown'), disabled: index === total - 1, onClick: () => onMove(1) },
              h(IconArrowDown, { size: 16 })
            ),
            h(IconButton, { label: t('action.edit'), onClick: onEdit }, h(IconPencil, { size: 16 })),
            h(
              IconButton,
              { label: t('action.delete'), danger: true, onClick: onRequestDelete },
              h(IconTrash, { size: 16 })
            )
          )
        ),
        pendingDelete &&
          h(
            'div',
            { className: 'dsh-pp-confirm' },
            h('span', { className: 'dsh-pp-confirmText' }, t('delete.confirm', { name: preset.name })),
            h(
              'div',
              { className: 'dsh-pp-confirmActions' },
              h(
                'button',
                { type: 'button', className: 'dsh-pp-btn dsh-pp-btnOutline', onClick: onCancelDelete },
                t('action.cancel')
              ),
              h(
                'button',
                { type: 'button', className: 'dsh-pp-btn dsh-pp-btnDanger', onClick: onConfirmDelete },
                t('action.delete')
              )
            )
          )
      );
    }

    /** Name and ten-row content editor used for both creation and modification. */
    function PresetEditor({ initial, t, formRef, onSave, onCancel }) {
      const [name, setName] = React.useState(initial.name);
      const [content, setContent] = React.useState(initial.content);
      const [error, setError] = React.useState('');
      const nameRef = React.useRef(null);

      React.useEffect(() => {
        const input = nameRef.current;
        if (input === null) return;
        input.focus();
        input.select();
      }, []);

      const submit = (event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (trimmed === '') {
          setError(t('field.nameRequired'));
          if (nameRef.current !== null) nameRef.current.focus();
          return;
        }
        if (trimmed.length > MAX_NAME) {
          setError(t('field.nameCounter', { count: trimmed.length, max: MAX_NAME }));
          if (nameRef.current !== null) nameRef.current.focus();
          return;
        }
        if (content.trim() === '') {
          setError(t('field.contentRequired'));
          return;
        }
        onSave({ name: trimmed, content });
      };

      return h(
        'form',
        { className: 'dsh-pp-editor', onSubmit: submit, noValidate: true, ref: formRef },
        h('h2', { className: 'dsh-pp-editorTitle' }, initial.id === null ? t('editor.newTitle') : t('editor.editTitle')),
        h(
          'div',
          { className: 'dsh-pp-field' },
          h(
            'div',
            { className: 'dsh-pp-labelRow' },
            h('label', { className: 'dsh-pp-label', htmlFor: 'dsh-pp-name' }, t('field.name')),
            h(
              'span',
              { className: 'dsh-pp-hint' },
              t('field.nameCounter', { count: name.length, max: MAX_NAME })
            )
          ),
          h('input', {
            ref: nameRef,
            id: 'dsh-pp-name',
            className: 'dsh-pp-input',
            type: 'text',
            value: name,
            maxLength: MAX_NAME,
            placeholder: t('field.namePlaceholder'),
            autoComplete: 'off',
            spellCheck: false,
            onChange: (event) => {
              setName(event.target.value);
              if (error !== '') setError('');
            }
          })
        ),
        h(
          'div',
          { className: 'dsh-pp-field' },
          h('label', { className: 'dsh-pp-label', htmlFor: 'dsh-pp-content' }, t('field.content')),
          h('textarea', {
            id: 'dsh-pp-content',
            className: 'dsh-pp-textarea',
            rows: 10,
            value: content,
            placeholder: t('field.contentPlaceholder'),
            onChange: (event) => {
              setContent(event.target.value);
              if (error !== '') setError('');
            }
          })
        ),
        error !== '' && h('p', { className: 'dsh-pp-error', role: 'alert' }, error),
        h(
          'div',
          { className: 'dsh-pp-editorActions' },
          h(
            'button',
            { type: 'button', className: 'dsh-pp-btn dsh-pp-btnOutline', onClick: onCancel },
            t('action.cancel')
          ),
          h(
            'button',
            { type: 'submit', className: 'dsh-pp-btn dsh-pp-btnPrimary' },
            h(IconCheck, { size: 15 }),
            t('action.save')
          )
        )
      );
    }

    /** Rounded tag row above the composer; a click inserts at the last caret. */
    function ComposerPresets({ store, focusComposer, useInput, inputActions, t }) {
      const presets = usePresets(store);
      const phase = useInput((state) => state.phase);
      if (presets.length === 0) return null;
      const disabled = phase !== 'plain';

      const insert = (preset) => {
        try {
          if (inputActions !== undefined) {
            const span = inputActions.captureInsertion();
            inputActions.insertText(preset.content, span);
          }
        } finally {
          focusComposer();
        }
      };

      return h(
        'div',
        { className: 'dsh-pp-dock', role: 'group', 'aria-label': t('composer.group') },
        presets.map((preset) =>
          h(
            'button',
            {
              key: preset.id,
              type: 'button',
              className: 'dsh-pp-chip',
              title: t('composer.insert', { name: preset.name }),
              'aria-label': t('composer.insert', { name: preset.name }),
              disabled,
              onMouseDown: (event) => {
                /* Keep the editor's caret while the pointer is over the chip. */
                event.preventDefault();
              },
              onClick: () => insert(preset)
            },
            h('span', { className: 'dsh-pp-chipLabel' }, preset.name)
          )
        )
      );
    }

    const CSS = `
.dsh-pp-page{box-sizing:border-box;width:100%;min-width:0;height:100%;min-height:0;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6}
.dsh-pp-scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable}
.dsh-pp-content{box-sizing:border-box;max-width:900px;margin:0 auto;padding:0 clamp(20px,4vw,48px) 56px}
.dsh-pp-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:16px;padding-top:28px;margin-bottom:22px}
[data-platform=darwin] .dsh-pp-head{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.dsh-pp-headText{flex:1 1 320px;min-width:0}
.dsh-pp-title{margin:0;font-size:20px;font-weight:500;line-height:28px}
.dsh-pp-subtitle{max-width:64ch;margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dsh-pp-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 14px;border:0.5px solid transparent;border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:500;line-height:1;white-space:nowrap;cursor:pointer;transition:background-color .15s,border-color .15s,color .15s}
.dsh-pp-btn:disabled{opacity:.5;cursor:default}
.dsh-pp-btn:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px}
.dsh-pp-btnPrimary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}
@media (hover:hover){.dsh-pp-btnPrimary:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-brand-primary) 88%,transparent)}}
.dsh-pp-btnOutline{border-color:var(--dsw-alias-border-l2)}
@media (hover:hover){.dsh-pp-btnOutline:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent)}}
.dsh-pp-btnDanger{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 55%,transparent);color:var(--dsw-alias-state-error-primary)}
@media (hover:hover){.dsh-pp-btnDanger:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,transparent)}}
.dsh-pp-editor{box-sizing:border-box;display:grid;gap:14px;margin-bottom:20px;padding:16px;border:0.5px solid var(--dsw-alias-border-l1);border-radius:16px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 3%,var(--dsw-alias-bg-base))}
.dsh-pp-editorTitle{margin:0;font-size:14px;font-weight:600;line-height:22px}
.dsh-pp-field{display:grid;gap:6px;min-width:0}
.dsh-pp-labelRow{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.dsh-pp-label{font-size:13px;font-weight:500;line-height:20px}
.dsh-pp-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}
.dsh-pp-input,.dsh-pp-textarea{box-sizing:border-box;width:100%;padding:7px 10px;border:0.5px solid var(--dsw-alias-border-l2);border-radius:10px;outline:none;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;transition:border-color .15s,box-shadow .15s}
.dsh-pp-input::placeholder,.dsh-pp-textarea::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7}
.dsh-pp-input:focus,.dsh-pp-textarea:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent)}
.dsh-pp-textarea{min-height:232px;padding:10px 12px;resize:vertical;line-height:24px;font-family:inherit}
.dsh-pp-error{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.dsh-pp-editorActions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}
.dsh-pp-listHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pp-list{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.dsh-pp-row{box-sizing:border-box;display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:0.5px solid var(--dsw-alias-border-l1);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 3%,var(--dsw-alias-bg-base));transition:border-color .15s}
@media (hover:hover){.dsh-pp-row:hover{border-color:var(--dsw-alias-border-l2)}}
.dsh-pp-rowEditing{border-color:var(--dsw-alias-brand-primary)}
.dsh-pp-rowHead{display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px}
.dsh-pp-index{flex:none;display:grid;place-items:center;width:22px;height:22px;margin-top:1px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;font-variant-numeric:tabular-nums}
.dsh-pp-rowBody{flex:1 1 200px;min-width:0}
.dsh-pp-rowName{font-size:14px;font-weight:500;line-height:22px;overflow-wrap:anywhere}
.dsh-pp-rowPreview{display:-webkit-box;overflow:hidden;margin-top:2px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;white-space:pre-wrap;overflow-wrap:anywhere;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dsh-pp-rowActions{display:flex;flex:none;align-items:center;gap:2px;margin-left:auto}
.dsh-pp-iconBtn{display:grid;place-items:center;width:28px;height:28px;padding:0;border:none;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color .15s,color .15s}
@media (hover:hover){.dsh-pp-iconBtn:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);color:var(--dsw-alias-label-primary)}}
.dsh-pp-iconBtn:disabled{opacity:.35;cursor:default}
.dsh-pp-iconBtn:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px}
.dsh-pp-iconBtnDanger{color:var(--dsw-alias-state-error-primary)}
@media (hover:hover){.dsh-pp-iconBtnDanger:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary)}}
.dsh-pp-confirm{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 12px;padding-top:8px;border-top:0.5px solid var(--dsw-alias-border-l1)}
.dsh-pp-confirmText{min-width:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;overflow-wrap:anywhere}
.dsh-pp-confirmActions{display:flex;flex:none;gap:8px}
.dsh-pp-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:44px 24px;border:0.5px dashed var(--dsw-alias-border-l2);border-radius:16px;color:var(--dsw-alias-label-secondary);text-align:center}
.dsh-pp-emptyIcon{display:grid;place-items:center;width:40px;height:40px;margin-bottom:4px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent);color:var(--dsw-alias-label-secondary)}
.dsh-pp-emptyTitle{margin:0;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}
.dsh-pp-emptyBody{max-width:46ch;margin:0;font-size:13px;line-height:20px}
.dsh-pp-emptyAction{margin-top:10px}
.dsh-pp-dock{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;gap:6px;width:calc(100% - var(--dsh-composer-side-clearance,16px) - var(--dsh-composer-side-clearance,16px));max-width:var(--dsh-composer-card-max-width,920px);margin:0 auto;padding:0 2px}
.dsh-pp-chip{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:min(100%,260px);height:28px;padding:0 12px;border:0.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1;white-space:nowrap;cursor:pointer;transition:background-color .15s,border-color .15s,color .15s}
@media (hover:hover){.dsh-pp-chip:hover:not(:disabled){border-color:var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 11%,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary)}}
.dsh-pp-chip:active:not(:disabled){transform:translateY(0.5px)}
.dsh-pp-chip:disabled{opacity:.5;cursor:default}
.dsh-pp-chip:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px}
.dsh-pp-chipLabel{min-width:0;overflow:hidden;text-overflow:ellipsis}
@media (max-width:640px){.dsh-pp-content{padding-bottom:40px}.dsh-pp-rowActions{margin-left:0}.dsh-pp-chip{max-width:min(100%,220px)}}
`;

    function installStyles(ctx) {
      ctx.effect(
        () => {
          if (typeof document === 'undefined') return;
          const tagId = '@local/dsh-prompt-presets/prompt-presets.css';
          const previous = document.querySelector('style[data-plugin-css="' + tagId + '"]');
          if (previous !== null) previous.remove();
          const tag = document.createElement('style');
          tag.dataset.plugin = '@local/dsh-prompt-presets';
          tag.dataset.pluginCss = tagId;
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        },
        'prompt-presets: styles'
      );
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'prompt-presets: dictionaries');
      const t = ctx.locale.bind(NS);
      installStyles(ctx);

      const store = createPresetStore(readPresets());

      /* Another tab editing the same browser profile republishes the list here. */
      ctx.effect(
        () => {
          if (typeof window === 'undefined') return;
          const onStorage = (event) => {
            if (event.key !== STORAGE_KEY) return;
            store.reload();
          };
          window.addEventListener('storage', onStorage);
          return () => {
            window.removeEventListener('storage', onStorage);
          };
        },
        'prompt-presets: cross-tab sync'
      );

      const actions = {
        create(values) {
          const rows = store.getSnapshot();
          store.replace([...rows, { id: createId(), name: values.name, content: values.content }]);
        },
        update(id, values) {
          const rows = store.getSnapshot();
          store.replace(
            rows.map((row) => (row.id === id ? { ...row, name: values.name, content: values.content } : row))
          );
        },
        remove(id) {
          const rows = store.getSnapshot();
          store.replace(rows.filter((row) => row.id !== id));
        },
        move(id, delta) {
          const rows = [...store.getSnapshot()];
          const index = rows.findIndex((row) => row.id === id);
          if (index < 0) return;
          const target = index + delta;
          if (target < 0 || target >= rows.length) return;
          const [row] = rows.splice(index, 1);
          rows.splice(target, 0, row);
          store.replace(rows);
        }
      };

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            inject: () => ({ store, actions })
          },
          PresetPage
        )
      );

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 20,
            locale: NS,
            label: () => t('panel')
          },
          PresetPanelIcon
        )
      );

      ctx.slots.inject('conversation.input.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.dock',
            id: PANEL_ID,
            order: 100,
            locale: NS,
            inject: (sessionId) => ({
              store,
              focusComposer: () => {
                try {
                  const actx = ctx.sessions.scope(sessionId);
                  if (actx === undefined) return;
                  const conversation = actx.get('conversation');
                  if (conversation === undefined) return;
                  conversation.input.for(actx).focus();
                } catch (error) {
                  console.error('[prompt-presets] could not focus the composer', error);
                }
              }
            })
          },
          ComposerPresets
        )
      );
    }

    return {
      inject: ['slots', 'locale', 'sessions'],
      apply
    };
  }
});
