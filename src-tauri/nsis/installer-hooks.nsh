; Override the .md/.markdown file type icon with the custom file icon.
; Tauri's APP_ASSOCIATE sets DefaultIcon to the app exe — we overwrite it here,
; since NSIS_HOOK_POSTINSTALL runs after all file associations are written.

!macro NSIS_HOOK_POSTINSTALL
  WriteRegStr SHELL_CONTEXT "Software\Classes\Markdown\DefaultIcon" "" "$INSTDIR\fileicon.ico,0"
  ; Notify Windows shell so Explorer picks up the new icon immediately
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend
