import React, { useEffect, useMemo } from "react";
import { Box, Divider, IconButton, Paper, Tooltip, useTheme } from "@mui/material";
import {
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import type { EditorProps } from "../models/EditorModel";
import cn from "../utils/cn";

type ToolbarAction = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeEditorContent = (value: string) => {
  const nextValue = value || "";
  const trimmed = nextValue.trim();

  if (!trimmed) {
    return "";
  }

  // Preserve rich content when value already contains html tags.
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    return nextValue;
  }

  return `<p>${escapeHtml(nextValue).replaceAll("\n", "<br />")}</p>`;
};

const Editor = ({
  value = "",
  onChange,
  editable = true,
  minHeight = 200,
  showToolbar = true,
  placeholder = "Write something...",
  disabled = false,
  readOnly = false,
  className,
}: EditorProps) => {
  const theme = useTheme();
  const canEdit = editable && !disabled && !readOnly;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: normalizeEditorContent(value || ""),
    editable: canEdit,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      if (onChange) {
        onChange(editorInstance.getHTML());
      }
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      isBold: currentEditor.isActive("bold"),
      isItalic: currentEditor.isActive("italic"),
      isStrike: currentEditor.isActive("strike"),
      isCode: currentEditor.isActive("code"),
      isLink: currentEditor.isActive("link"),
      isBulletList: currentEditor.isActive("bulletList"),
      isOrderedList: currentEditor.isActive("orderedList"),
      canBold: currentEditor.can().chain().focus().toggleBold().run(),
      canItalic: currentEditor.can().chain().focus().toggleItalic().run(),
      canStrike: currentEditor.can().chain().focus().toggleStrike().run(),
      canCode: currentEditor.can().chain().focus().toggleCode().run(),
      canSetLink: currentEditor.can().chain().focus().setLink({ href: "https://example.com" }).run(),
      canBulletList: currentEditor.can().chain().focus().toggleBulletList().run(),
      canOrderedList: currentEditor.can().chain().focus().toggleOrderedList().run(),
      canUndo: currentEditor.can().chain().focus().undo().run(),
      canRedo: currentEditor.can().chain().focus().redo().run(),
    }),
  });

  const handleSetLink = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Enter URL", previousUrl || "https://");

    if (input === null) {
      return;
    }

    const url = input.trim();

    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(canEdit);
  }, [editor, canEdit]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = normalizeEditorContent(value || "");

    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  const actions = useMemo<ToolbarAction[]>(() => {
    if (!editor) {
      return [];
    }

    return [
      {
        label: "Bold",
        icon: <BoldOutlined />,
        isActive: Boolean(editorState?.isBold),
        isDisabled: !editorState?.canBold,
        onClick: () => editor.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        icon: <ItalicOutlined />,
        isActive: Boolean(editorState?.isItalic),
        isDisabled: !editorState?.canItalic,
        onClick: () => editor.chain().focus().toggleItalic().run(),
      },
      {
        label: "Strikethrough",
        icon: <StrikethroughOutlined />,
        isActive: Boolean(editorState?.isStrike),
        isDisabled: !editorState?.canStrike,
        onClick: () => editor.chain().focus().toggleStrike().run(),
      },
      {
        label: "Code",
        icon: <CodeOutlined />,
        isActive: Boolean(editorState?.isCode),
        isDisabled: !editorState?.canCode,
        onClick: () => editor.chain().focus().toggleCode().run(),
      },
      {
        label: "Link",
        icon: <LinkOutlined />,
        isActive: Boolean(editorState?.isLink),
        isDisabled: !editorState?.canSetLink,
        onClick: handleSetLink,
      },
      {
        label: "Bullet list",
        icon: <UnorderedListOutlined />,
        isActive: Boolean(editorState?.isBulletList),
        isDisabled: !editorState?.canBulletList,
        onClick: () => editor.chain().focus().toggleBulletList().run(),
      },
      {
        label: "Ordered list",
        icon: <OrderedListOutlined />,
        isActive: Boolean(editorState?.isOrderedList),
        isDisabled: !editorState?.canOrderedList,
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        label: "Undo",
        icon: <UndoOutlined />,
        isActive: false,
        isDisabled: !editorState?.canUndo,
        onClick: () => editor.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: <RedoOutlined />,
        isActive: false,
        isDisabled: !editorState?.canRedo,
        onClick: () => editor.chain().focus().redo().run(),
      },
    ];
  }, [editor, editorState]);

  return (
    <React.Fragment>
      <Paper
        variant="outlined"
        className={cn("w-full", className)}
        sx={{
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper,
        }}
      >
        {showToolbar && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              p: 1,
              bgcolor: theme.palette.background.default,
            }}
          >
            {actions.map((action) => (
              <Tooltip key={action.label} title={action.label} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={action.onClick}
                    disabled={action.isDisabled || !canEdit}
                    sx={{
                      borderRadius: 1,
                      bgcolor: action.isActive ? theme.palette.action.selected : "transparent",
                      "&:hover": {
                        bgcolor: action.isActive
                          ? theme.palette.action.selected
                          : theme.palette.action.hover,
                      },
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </span>
              </Tooltip>
            ))}
          </Box>
        )}

        <Divider />

        <Box
          sx={{
            "& .tiptap": {
              minHeight,
              padding: "12px 14px",
              outline: "none",
              fontSize: theme.typography.body1.fontSize,
              lineHeight: 1.6,
            },
            "& .tiptap p": {
              margin: 0,
              marginBottom: "0.75em",
            },
            "& .tiptap p:last-of-type": {
              marginBottom: 0,
            },
            "& .tiptap ul": {
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
            },
            "& .tiptap ol": {
              listStyleType: "decimal",
              paddingLeft: "1.5rem",
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
            },
            "& .tiptap li": {
              marginBottom: "0.25rem",
            },
            "& .tiptap li p": {
              marginBottom: 0,
            },
            "& .tiptap p.is-editor-empty:first-of-type::before": {
              color: theme.palette.text.disabled,
              content: 'attr(data-placeholder)',
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
            "& .tiptap a": {
              color: theme.palette.primary.main,
              textDecoration: "underline",
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
    </React.Fragment>
  );
};

export default Editor;
