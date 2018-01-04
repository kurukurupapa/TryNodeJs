# Aterm WF300HPのクイック設定Webを操作する。
# できること
# ・Atermからpingを実行します。
# ・Atermを再起動します。
# ・Atermのログを表示します。
#
# Notes:
###
疎通確認
set ATERM_USER=dummy
set ATERM_PASS=dummy
coffee aterm_wf300hp.coffee
###

path = require 'path'
util = require 'util'
request = require 'request'
cheerio = require 'cheerio'
iconv = require 'iconv-lite'

scriptDir = __dirname
scriptName = path.basename __filename
baseName = path.basename __filename, path.extname(__filename)
infolog = util.log
debuglog = util.debuglog baseName

class Aterm
  @PING_ADDR: 'www.npmjs.com'

  # トップ画面操作
  runTop: (callback) ->
    # 初期表示
    @requestGet2 '', ($) =>
      callback()

  # ホーム画面（？）操作
  runHome: (callback) ->
    # 初期表示
    @requestGet2 'index.cgi/index_contents', ($) =>
      @sessionId = $('#SESSION_ID').attr('value')
      debuglog "sessionId=#{@sessionId}"
      name = $('#main_form tr:nth-child(1) > td:nth-child(2)').text()
      mode = $('#main_form tr:nth-child(2) > td:nth-child(2)').text()
      status = $('#main_form tr:nth-child(3) > td:nth-child(2)').text()
      console.log "Result: #{name},#{mode},#{status}"
      callback()

  # PINGテスト画面操作
  runPing: (callback) ->
    # 初期表示
    @requestGet2 'index.cgi/ping_main', ($) =>
      # console.log "html=#{$.html()}"
      @sessionId = $('#SESSION_ID').attr('value')
      debuglog "sessionId=#{@sessionId}"

      # PINGテスト実行
      form =
        ADDR: Aterm.PING_ADDR
        DISABLED_CHECKBOX: ''
        CHECK_ACTION_MODE: '1'
        SESSION_ID: @sessionId
      @requestPost2 'index.cgi/ping_main_set', form, ($) =>
        # console.log "html=#{$.html()}"
        @result = $('#ping_main td.ping_result pre').text()
        console.log "result=\n#{@result}\n"
        callback()

  # 再起動画面操作
  runReboot: (callback) ->
    # 初期表示
    @requestGet2 'index.cgi/reboot_main', ($) =>
      # console.log "html=#{$.html()}"
      @sessionId = $('#SESSION_ID').attr('value')
      debuglog "sessionId=#{@sessionId}"

      # 再起動の実行
      form =
        DUMMY: ''
        DISABLED_CHECKBOX: ''
        CHECK_ACTION_MODE: '1'
        SESSION_ID: @sessionId
      @requestPost2 'index.cgi/reboot_main_set', form, ($) =>
        # console.log "html=#{$.html()}"
        console.log "再起動開始（約50秒かかる）"
        callback()

  # 通信情報ログ画面操作
  runLog: (callback) ->
    # 初期表示
    @requestGet2 'index.cgi/log_main', ($) =>
      # console.log "html=#{$.html()}"
      @sessionId = $('#SESSION_ID').attr('value')
      debuglog "sessionId=#{@sessionId}"

      # 一般ログ
      @generalLog = $('html body div.contents div.log_area pre').text()
      console.log "generalLog=\n#{@generalLog}\n"

      # セキュリティログ
      form =
        LOG_SAVE_SELECT: '1'
        DISABLED_CHECKBOX: ''
        CHECK_ACTION_MODE: '1'
        SESSION_ID: @sessionId
      @requestPost2 'index.cgi/log_main_show', form, ($) =>
        @securityLog = $('html body div.contents div.log_area pre').text()
        console.log "securityLog=\n#{@securityLog}\n"

        callback()

  requestGet2: (path, callback) ->
    @requestGet path, (err, res, body) =>
      if not (res?.statusCode is 200)
        throw new Error "HTTP通信失敗 err=#{err},statusCode=#{res?.statusCode},body=#{body}"
      $ = cheerio.load body
      callback $

  requestPost2: (path, form, callback) ->
    @requestPost path, form, (err, res, body) =>
      if not (res?.statusCode is 200)
        throw new Error "HTTP通信失敗 err=#{err},statusCode=#{res?.statusCode},body=#{body}"
      $ = cheerio.load body
      callback $

  requestGet: (path, callback) ->
    debuglog "HTTP通信 START"
    request.get
      url: "http://#{process.env.ATERM_USER}:#{process.env.ATERM_PASS}@aterm.me/#{path}"
      encoding: null
    , (err, res, body) =>
      debuglog "HTTP通信 END"
      debuglog "err=#{err}"
      debuglog "res.statusCode=#{res?.statusCode}"
      body = iconv.decode body, 'EUC-JP'
      # console.log "body=#{body}"
      callback err, res, body

  requestPost: (path, form, callback) ->
    infolog "HTTP通信 START"
    request.post
      url: "http://#{process.env.ATERM_USER}:#{process.env.ATERM_PASS}@aterm.me/#{path}"
      form: form
      encoding: null
    , (err, res, body) =>
      debuglog "HTTP通信 END"
      debuglog "err=#{err}"
      debuglog "res.statusCode=#{res?.statusCode}"
      body = iconv.decode body, 'EUC-JP'
      # console.log "body=#{body}"
      callback err, res, body

if process.argv[1] is __filename
  cmd = process.argv[2]
  obj = new Aterm
  switch cmd
    when 'home'
      obj.runHome () =>
        console.log "END"
    when 'ping'
      obj.runPing () =>
        console.log "END"
    when 'reboot'
      obj.runReboot () =>
        console.log "END"
    when 'log'
      obj.runLog () =>
        console.log "END"
    else
      console.log "Usage: coffee #{scriptName} (home|ping|log|reboot)"
