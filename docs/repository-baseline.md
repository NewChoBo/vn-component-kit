# Shared repository baseline

The VN repositories use the same repository-level editing contract even though their established indentation differs.

## Shared rules

- UTF-8 text
- LF line endings in the Git index and working tree
- one final newline
- no trailing whitespace except intentional Markdown spacing
- `editorconfig-checker@6.1.1` with checker rules pinned to `v3.11.1`
- binary media classified explicitly in `.gitattributes`
- `npm run validate` starts with `npm run lint`

Each repository keeps a root `.editorconfig` because EditorConfig has no import or inheritance mechanism across repositories. Product repositories exclude generated `engine/` files from the checker. Repository-specific indentation sections preserve real authored conventions instead of reformatting unrelated source.

When this baseline changes, update the root files in `vn-component-kit`, `lily-vn`, and `ather-vn` together and validate each repository independently.
