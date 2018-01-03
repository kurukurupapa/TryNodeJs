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
class GSheets
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

  ###
  # OAuth2.0認可を使用する
  # @param {string} credentialPath  Google Developers ConsoleからダウンロードしたOAuth2.0クライアントIDのJSONファイルパス
  # @param {string} tokenPath  OAuth2.0認可後のトークン情報を保存するファイルパス
  # @param {boolean} writeFlag  読み込みのみの場合false, 読み書きの場合true
  # @param {function} callback  function(response)
  ###
  useOAuth2: (credentialPath, tokenPath, writeFlag, callback) ->
    assert.ok credentialPath, "引数エラー credentialPath=#{credentialPath}"
    assert.ok tokenPath, "引数エラー tokenPath=#{tokenPath}"
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    scope = if writeFlag
      GSheets.READ_WRITE_SCOPE
    else
      GSheets.READ_ONLY_SCOPE
    fs.readFile credentialPath, (err, content) =>
      if err
        throw new Error "Error loading client secret file: #{err}"
      @_authorize JSON.parse(content), tokenPath, scope, callback

  ###
  # 別途入手済みのアクセストークンを使用する
  # @param {string} accessToken  アクセストークン
  # @param {function} callback  function()
  ###
  useAccessToken: (@accessToken, callback) ->
    assert.ok @accessToken, "引数エラー accessToken=#{@accessToken}"
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
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
        callback @oauth2Client.credentials

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
        callback token

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
  # Googleドライブから指定した名前のファイルを取得する
  # Google Drive API v3を使用
  # @param {string} name  ファイル名
  # @param {string} parentId  必要あればフォルダのID
  # @param {function} callback  function(response)
  # responseの主な内容：
  # {
  #   "kind": "drive#fileList",
  #   "nextPageToken": string,
  #   "incompleteSearch": boolean,
  #   "files": [
  #     {
  #       "kind": "drive#file",
  #       "id": string,
  #       "name": string,
  #       "mimeType": string,
  #       "description": string,
  #       "trashed": boolean,
  #       "parents": [
  #         string
  #       ],
  #       "createdTime": datetime,
  #       "modifiedTime": datetime
  #     }
  #   ]
  # }
  # 詳細は次を参照。
  # Files: list  |  Drive REST API  |  Google Developers https://developers.google.com/drive/v3/reference/files/list
  # Files  |  Drive REST API  |  Google Developers https://developers.google.com/drive/v3/reference/files
  ###
  listFilesByName: (name, parentId, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"

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
  # @param {string} name  スプレッドシート名
  # @param {function} callback  function(response)。responseの内容は、getPropertiesメソッド参照。
  ###
  createSpreadsheet: (name, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
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
      callback response

  ###
  # スプレッドシートの情報を取得する
  # @param {string} spreadsheetId  スプレッドシートID
  # @param {function} callback  function(response)
  # responseの主な内容：
  # {
  #   spreadsheetId: string,
  #   properties: {
  #     title: string
  #   },
  #   sheets: [
  #     {
  #       properties: {
  #         "sheetId": number,
  #         "title": string,
  #         "index": number,
  #         "sheetType": enum(SheetType),
  #         "gridProperties": {
  #           "rowCount": number,
  #           "columnCount": number,
  #           "frozenRowCount": number,
  #           "frozenColumnCount": number,
  #           "hideGridlines": boolean,
  #         },
  #         "hidden": boolean,
  #         "tabColor": {
  #           "red": number,
  #           "green": number,
  #           "blue": number,
  #           "alpha": number,
  #         },
  #         "rightToLeft": boolean
  #       }
  #     }
  #   ]
  # }
  # 詳細は次を参照。
  # REST Resource: spreadsheets | Sheets API | Google Developers https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets?hl=ja
  ###
  getProperties: (spreadsheetId, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @sheets.spreadsheets.get {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: spreadsheetId
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

  ###
  # シートの追加
  # @param {string} spreadsheetId  スプレッドシートID
  # @param {string} sheetName  シート名
  # @param {function} callback  function(response)
  # responseの主な内容：
  # {
  #   "spreadsheetId": string,
  #   "replies": [
  #     {
  #       "properties": {
  #         "sheetId": number,
  #         "title": string,
  #         "index": number,
  #         "sheetType": enum(SheetType),
  #         "gridProperties": {
  #           "rowCount": number,
  #           "columnCount": number,
  #           "frozenRowCount": number,
  #           "frozenColumnCount": number,
  #           "hideGridlines": boolean,
  #         },
  #         "hidden": boolean,
  #         "tabColor": {
  #           "red": number,
  #           "green": number,
  #           "blue": number,
  #           "alpha": number,
  #         },
  #         "rightToLeft": boolean
  #       },
  #     }
  #   ],
  # }
  ###
  addSheet: (spreadsheetId, sheetName, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @sheets.spreadsheets.batchUpdate {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: spreadsheetId
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
  # @param {string} spreadsheetId  スプレッドシートID
  # @param {string} sheetName  シート名
  # @param {function} callback  function(response)
  # responseの主な内容：
  # {
  #   "range": string,                    #例：'Sheet1!A1:Z1000'
  #   "majorDimension": enum(Dimension),  #例：'ROWS'
  #   "values": [array],                  #例：[['A1','B1'],['A2','B2']]
  # }
  # 詳細は次を参照。
  # REST Resource: spreadsheets.values  |  Sheets API  |  Google Developers https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values?hl=ja#ValueRange
  ###
  getValues: (spreadsheetId, sheetName, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @sheets.spreadsheets.values.get {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: spreadsheetId
      range: sheetName
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

  ###
  # 指定範囲の値を更新
  # @param {string} spreadsheetId  スプレッドシートID
  # @param {string} range  更新するセル範囲。例："Sheet1!A1:C3"
  # @param {object} values  更新する値の二次元配列。例：[['a','b','c'],[1,2,3]]
  # @param {function} callback  function(response)
  ###
  updateValues: (spreadsheetId, range, values, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @sheets.spreadsheets.values.batchUpdate {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: spreadsheetId
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
  # @param {string} spreadsheetId  スプレッドシートID
  # @param {string} sheetName  シート名
  # @param {object} values  追記する値の二次元配列。例：[['a','b','c'],[1,2,3]]
  # @param {function} callback  function(response)
  ###
  appendValues: (spreadsheetId, sheetName, values, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @sheets.spreadsheets.values.append {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      spreadsheetId: spreadsheetId
      range: sheetName
      valueInputOption: 'USER_ENTERED'
      resource:
        values: values
    }, (err, response) =>
      if err
        throw new Error "The API returned an error: #{err}"
      callback response

module.exports.GSheets = GSheets
