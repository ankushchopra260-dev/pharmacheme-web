# BFD tool: testing and launch

Page: /exclusive/bfd-tool/ (catalog item `app-bfd-tool` in _data/exclusive.yml, `hidden: true`).
The tool itself lives only in the database (Firestore items/app-bfd-tool, gzip + base64), not in this public repo.

While hidden: not on the Exclusive page, not in search or the sitemap, noindex, and everyone except accounts with access sees "This tool is not open yet."
The owner (admin) account opens it automatically after Google sign-in.

To update the tool: build a new JSON like app-bfd-tool.json (items: [{id: 'app-bfd-tool', type: 'app', title, gz, rawBytes}]) and upload it in Sales admin.

To launch (paid):
1. Replace the company defaults inside the tool: company name on the CS sheet (2 places: `company:` default and the 'company' parameter) and check the other default rates, salaries and role names. Re-upload.
2. In _data/exclusive.yml: delete the `hidden: true` line, set the real price.
3. python3 tools/build_exclusive_pages.py, then revert unrelated regenerated pages (git checkout) and keep exclusive/bfd-tool/.
4. Run tools/build_guide_index.py so it enters site search, commit, push.
