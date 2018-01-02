# Google APIs Client for Node.js を簡単に使えるようにラッピング
# Google Drive API v3を使用。
# Google Sheets API v4を使用。
#
# 事前準備
# npm install googleapis --save
# npm install google-auth-library --save
#
# 参考
# Node.js Quickstart | Sheets API | Google Developers https://developers.google.com/sheets/quickstart/nodejs?hl=ja

assert = require('assert')
fs = require('fs')
path = require("path")
util = require('util')
readline = require('readline')
google = require('googleapis')
googleAuth = require('google-auth-library')

scriptDir = __dirname
scriptName = path.basename __filename
baseName = path.basename __filename, path.extname(__filename)
infolog = util.log
debuglog = util.debuglog baseName

###
# Googleスプレッドシート操作クラス
###
class Spreadsheet
  @READ_ONLY_SCOPE: [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly']
  @READ_WRITE_SCOPE: [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/spreadsheets']

  constructor: ->
    @drive = google.drive 'v3'
    @sheets = google.sheets 'v4'
    @oauth2Client = null
    @accessToken = null
    @spreadsheetId = null

  ###
  # OAuth2.0認可を使用する
  # credentialPath - Google Developers ConsoleからダウンロードしたOAuth2.0クライアントIDのJSONファイルパス
  # tokenPath - OAuth2.0認可後のトークン情報を保存するファイルパス
  # writeFlag - 読み込みのみの場合false, 読み書きの場合true
  ###
  useOAuth2: (credentialPath, tokenPath, writeFlag, callback) ->
    assert.ok credentialPath
    assert.ok tokenPath
    assert.ok callback
    scope = if writeFlag
      Spreadsheet.READ_WRITE_SCOPE
    else
      Spreadsheet.READ_ONLY_SCOPE
    fs.readFile credentialPath, (err, content) =>
      if err?
        throw new Error "Error loading client secret file: #{err}"
      @_authorize JSON.parse(content), tokenPath, scope, callback

  ###
  # 別途入手済みのアクセストークンを使用する
  # accessToken - アクセストークン
  ###
  useAccessToken: (@accessToken, callback) ->
    assert.ok @accessToken
    assert.ok callback
    callback()

  ###*
  # Create an OAuth2 client with the given credentials, and then execute the
  # given callback function.
  #
  # @param {Object} credentials The authorization client credentials.
  # @param {function} callback The callback to call with the authorized client.
  ###
  _authorize: (credentials, tokenPath, scope, callback) ->
    clientSecret = credentials.installed.client_secret
    clientId = credentials.installed.client_id
    redirectUrl = credentials.installed.redirect_uris[0]
    auth = new googleAuth
    oauth2Client = new (auth.OAuth2)(clientId, clientSecret, redirectUrl)
    # Check if we have previously stored a token.
    fs.readFile tokenPath, (err, token) =>
      if err
        @_getNewToken oauth2Client, tokenPath, scope, callback
      else
        oauth2Client.credentials = JSON.parse(token)
        @oauth2Client = oauth2Client
        callback()

  ###*
  # Get and store new token after prompting for user authorization, and then
  # execute the given callback with the authorized OAuth2 client.
  #
  # @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
  # @param {getEventsCallback} callback The callback to call with the authorized
  #     client.
  ###
  _getNewToken: (oauth2Client, tokenPath, scope, callback) ->
    authUrl = oauth2Client.generateAuthUrl(
      access_type: 'offline'
      scope: scope)
    console.log "Authorize this app by visiting this url: #{authUrl}"
    rl = readline.createInterface(
      input: process.stdin
      output: process.stdout)
    rl.question 'Enter the code from that page here: ', (code) =>
      rl.close()
      oauth2Client.getToken code, (err, token) =>
        if err
          throw new Error "Error while trying to retrieve access token #{err}"
        oauth2Client.credentials = token
        @_storeToken token, tokenPath
        @oauth2Client = oauth2Client
        callback()

  ###*
  # Store token to disk be used in later program executions.
  #
  # @param {Object} token The token to store to disk.
  ###
  _storeToken: (token, tokenPath) ->
    tokenDir = path.dirname tokenPath
    try
      fs.mkdirSync tokenDir
    catch err
      if err.code != 'EEXIST'
        throw err
    fs.writeFile tokenPath, JSON.stringify(token)
    infolog "Token stored to #{tokenPath}"

  ###
  # 使用するスプレッドシートを準備
  # name - スプレッドシートの名前
  ###
  useSpreadsheet: (name, callback) ->
    @_listFilesByName name, null, (response) =>
      if response.files.length != 1
        throw new Error "ファイル名が一意ではありません。name=#{name},response=#{util.inspect response}"
      @spreadsheetId = response.files[0].id
      callback response

  ###
  # Googleドライブから指定した名前のファイルを取得する
  # Google Drive API v3を使用
  # name - ファイル名
  # parentId - 必要あればフォルダのID
  ###
  _listFilesByName: (name, parentId, callback) ->
    # 検索条件の組み立て
    q = "name=\"#{name}\""
    q += " and \"#{parentId}\" in parents" if parentId
    # ゴミ箱を対象外にする
    q += ' and trashed=false'

    # API呼び出し
    @drive.files.list {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      q: q
      spaces: 'drive'
      fields: "files(id,name)"
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

  ###
  # スプレッドシートの作成
  # マイドライブ直下に作成される。
  # name - スプレッドシート名
  ###
  createSpreadsheet: (name, callback) ->
    @sheets.spreadsheets.create {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      resource:
        properties:
          title: name
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      @spreadsheetId = response.spreadsheetId
      callback response

  ###
  # スプレッドシートの情報を取得する
  ###
  getProperties: (callback) ->
    @sheets.spreadsheets.get {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: @spreadsheetId
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

  ###
  # シートの追加
  # sheetName - シート名
  ###
  addSheet: (sheetName, callback) ->
    @sheets.spreadsheets.batchUpdate {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: @spreadsheetId
      resource:
        requests: [
          addSheet:
            properties:
              title: sheetName
        ]
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

  ###
  # シートの値を取得
  # sheetName - シート名
  ###
  getValues: (sheetName, callback) ->
    @sheets.spreadsheets.values.get {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: @spreadsheetId
      range: sheetName
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

  ###
  # 指定範囲の値を更新
  # range - 更新するセル範囲。例："Sheet1!A1:C3"
  # values - 更新する値の二次元配列。例：[['a','b','c'],[1,2,3]]
  ###
  updateValues: (range, values, callback) ->
    @sheets.spreadsheets.values.batchUpdate {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: @spreadsheetId
      resource:
        valueInputOption: 'USER_ENTERED'
        data: [{
          range: range
          values: values
        }]
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

  ###
  # 指定シートの最終行に追記
  # sheetName - シート名
  # values - 追記する値の二次元配列。例：[['a','b','c'],[1,2,3]]
  ###
  appendValues: (sheetName, values, callback) ->
    @sheets.spreadsheets.values.append {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: @spreadsheetId
      range: sheetName
      valueInputOption: 'USER_ENTERED'
      resource:
        values: values
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

module.exports.Spreadsheet = Spreadsheet
