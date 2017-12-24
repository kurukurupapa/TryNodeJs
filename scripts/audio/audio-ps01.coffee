# WAVファイルを再生する。
# ※音がでるので注意
# ※PowerShellを使う。
#
# Usage
# coffee xxx.coffee
#
# 参考
# Nativeモジュール非依存な音声再生nodeモジュールを作った - Qiita https://qiita.com/maxmellon/items/afe7497ef3b4976ee87d
# コマンドラインで .wav ファイルを再生する | Windowsのかゆいとこ http://kayuitoko.blog129.fc2.com/blog-entry-37.html

# hello.wavは、「こんにちは」という音声データ。
path = require('path')
wavpath = path.join path.dirname(__filename), 'data', 'hello.wav'
exec = require('child_process').exec

command = "powershell.exe (New-Object System.Media.SoundPlayer #{wavpath}).PlaySync()"
# →再生されたけど、最初の文字が発音されていない気がする。

#command = "powershell -Command \"$a=New-Object Media.SoundPlayer #{wavpath}; $a.Play(); $a.Stop(); $a.PlaySync()\""
# →実装が変だけど、非同期再生した直後に停止（多分これで再生準備だけした状態になる）、それから同期再生する。
# 　これで上手く再生できることもあるけどダメなこともある。
# 　オーディオデバイスの準備ができているかどうかがポイントかも。

exec command, (error, stdout, stderr) ->
  console.log "error=[#{error}]" if error
  console.log "stdout=[#{stdout}]" if stdout
  console.log "stderr=[#{stderr}]" if stderr
