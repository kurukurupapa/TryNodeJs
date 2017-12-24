# 音声合成してしゃべる。
# ※音がでるので注意
# ※PowerShellを使う。
#
# Usage
# coffee xxx.coffee
#
# 参考
# PowerShellはWavファイルを作成するためのツールだった | $m0t0k1x2["code"].content
# http://m0t0k1x2.tumblr.com/post/98308199429/powershell%E3%81%AFwav%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E4%BD%9C%E6%88%90%E3%81%99%E3%82%8B%E3%81%9F%E3%82%81%E3%81%AE%E3%83%84%E3%83%BC%E3%83%AB%E3%81%A0%E3%81%A3%E3%81%9F

text = '音声合成が出来ました。'
exec = require('child_process').exec
command = "powershell -Command \"Add-Type -AssemblyName System.Speech; (New-Object -typename System.Speech.Synthesis.SpeechSynthesizer).speak(\'#{text}\')\""
exec command, (error, stdout, stderr) ->
  console.log "error=[#{error}]" if error
  console.log "stdout=[#{stdout}]" if stdout
  console.log "stderr=[#{stderr}]" if stderr
