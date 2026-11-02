# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['C:/Users/PC/AntigravityProject/statistical_calculator/desktop_app.py'],
    pathex=[],
    binaries=[],
    datas=[('C:/Users/PC/AntigravityProject/statistical_calculator/index.html', '.'), ('C:/Users/PC/AntigravityProject/statistical_calculator/style.css', '.'), ('C:/Users/PC/AntigravityProject/statistical_calculator/manifest.json', '.'), ('C:/Users/PC/AntigravityProject/statistical_calculator/sw.js', '.'), ('C:/Users/PC/AntigravityProject/statistical_calculator/assets', 'assets'), ('C:/Users/PC/AntigravityProject/statistical_calculator/js', 'js'), ('C:/Users/PC/AntigravityProject/statistical_calculator/vendor', 'vendor'), ('C:/Users/PC/AntigravityProject/statistical_calculator/sample_data', 'sample_data')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='StatCalc_Pro',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['C:/Users/PC/AntigravityProject/statistical_calculator/assets/icon.ico'],
)
