# 音声合成してしゃべる。（拡張版）
# ・音がでるので注意
# ・PowerShellを使う。
# ・.NET Framework 3.0 以降が必要らしい。
#
# Usage
# coffee xxx.coffee
#
# 参考
# PowerShellはWavファイルを作成するためのツールだった | $m0t0k1x2["code"].content
# http://m0t0k1x2.tumblr.com/post/98308199429/powershell%E3%81%AFwav%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E4%BD%9C%E6%88%90%E3%81%99%E3%82%8B%E3%81%9F%E3%82%81%E3%81%AE%E3%83%84%E3%83%BC%E3%83%AB%E3%81%A0%E3%81%A3%E3%81%9F

text = '音声合成が出来ました。'
# text = 'CoffeeShellからPowerShellを呼んで音声合成が出来ました。'
path = require 'path'
wav = path.join process.env.TMP, 'tmp.wav'
execSync = require('child_process').execSync

# インストールされている音声エンジンを列挙
execSync "powershell -Command \"Add-Type -AssemblyName System.Speech; (New-Object -typename System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() | %{ $_.VoiceInfo }"

# デフォルト設定でしゃべる
# console.log 'Default'
# execSync "powershell -Command \"Add-Type -AssemblyName System.Speech; (New-Object -typename System.Speech.Synthesis.SpeechSynthesizer).speak(\'#{text}\')\""

# 音声 Microsoft Haruka Desktop
console.log 'Microsoft Haruka Desktop'
execSync "powershell -Command \"Add-Type -AssemblyName System.Speech; $a=New-Object -typename System.Speech.Synthesis.SpeechSynthesizer; $a.SelectVoice('Microsoft Haruka Desktop'); $a.speak(\'#{text}\')\""

# 音声 Microsoft Zira Desktop
console.log 'Microsoft Zira Desktop'
execSync "powershell -Command \"Add-Type -AssemblyName System.Speech; $a=New-Object -typename System.Speech.Synthesis.SpeechSynthesizer; $a.SelectVoice('Microsoft Zira Desktop'); $a.speak(\'#{text}\')\""

# 音声ファイル出力
console.log '音声ファイル出力'
execSync "powershell -Command \"Add-Type -AssemblyName System.Speech; $a=New-Object -typename System.Speech.Synthesis.SpeechSynthesizer; $a.SetOutputToWaveFile('#{wav}'); $a.speak('#{text}')\""
