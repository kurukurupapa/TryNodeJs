# Node.jsからGoogleスプレッドシートを読み込む。
# ・Google Sheets API v4のquickstart.jsを改修した。
# ・Actions on Google の Acount Linkingを想定し、アクセストークン取得済みであることを前提にする。
# ・Googleのクライアントライブラリを使わずに、直にHTTPリクエスト/レスポンスを書いた。
#
# 元ネタ
# Node.js Quickstart  |  Sheets API  |  Google Developers
# https://developers.google.com/sheets/quickstart/nodejs?hl=ja
#
# 事前準備
# Google Developers Consoleからclient_secret.jsonをダウンロードしておく。
# npm install googleapis --save
# npm install google-auth-library --save
#
# Usage
# coffee quickstart_access-token_http.coffee スプレッドシートID シート名 アクセストークン
#
# 2017/12/05 Google Sheets API v4のquickstart.jsをサイト"http://js2.coffee/"でCoffeeスクリプトに変換し、改修した。
# 2017/12/14 アクセストークン取得済みを前提に処理を書き直してみる。

# fs = require('fs')
# readline = require('readline')
# google = require('googleapis')
# googleAuth = require('google-auth-library')
util = require 'util'

###
# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
SCOPES = [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ]
TOKEN_DIR = (process.env.HOME or process.env.HOMEPATH or process.env.USERPROFILE) + '/.credentials/'
TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json'
CLIENT_SECRET_PATH = TOKEN_DIR + 'client_secret.json'
###

# スプレッドシートID、シート名
# 初期値はGoogleが公開しているサンプルスプレッドシート
spreadsheetId = null
range = null
endCallback = null
accessToken = null

###*
# Load client secrets from a local file.
# ※client_secret.jsonの読み込み場所を変更しました。
###

run = ->
  ###
  fs.readFile CLIENT_SECRET_PATH, (err, content) ->
    if err
      console.log 'Error loading client secret file: ' + err
      endCallback err, null
      return
    # Authorize a client with the loaded credentials, then call the
    # Google Sheets API.
    authorize JSON.parse(content), listMajors
    return
  ###
  listMajors accessToken
  return

###*
# Create an OAuth2 client with the given credentials, and then execute the
# given callback function.
#
# @param {Object} credentials The authorization client credentials.
# @param {function} callback The callback to call with the authorized client.
###
###
authorize = (credentials, callback) ->
  clientSecret = credentials.installed.client_secret
  clientId = credentials.installed.client_id
  redirectUrl = credentials.installed.redirect_uris[0]
  auth = new googleAuth
  oauth2Client = new (auth.OAuth2)(clientId, clientSecret, redirectUrl)
  # Check if we have previously stored a token.
  fs.readFile TOKEN_PATH, (err, token) ->
    if err
      getNewToken oauth2Client, callback
    else
      oauth2Client.credentials = JSON.parse(token)
      callback oauth2Client
    return
  return
###

###*
# Get and store new token after prompting for user authorization, and then
# execute the given callback with the authorized OAuth2 client.
#
# @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
# @param {getEventsCallback} callback The callback to call with the authorized
#     client.
###
###
getNewToken = (oauth2Client, callback) ->
  authUrl = oauth2Client.generateAuthUrl(
    access_type: 'offline'
    scope: SCOPES)
  console.log 'Authorize this app by visiting this url: ', authUrl
  rl = readline.createInterface(
    input: process.stdin
    output: process.stdout)
  rl.question 'Enter the code from that page here: ', (code) ->
    rl.close()
    oauth2Client.getToken code, (err, token) ->
      if err
        console.log 'Error while trying to retrieve access token', err
        return
      oauth2Client.credentials = token
      storeToken token
      callback oauth2Client
      return
    return
  return
###

###*
# Store token to disk be used in later program executions.
#
# @param {Object} token The token to store to disk.
###
###
storeToken = (token) ->
  try
    fs.mkdirSync TOKEN_DIR
  catch err
    if err.code != 'EEXIST'
      throw err
  fs.writeFile TOKEN_PATH, JSON.stringify(token)
  console.log 'Token stored to ' + TOKEN_PATH
  return
###

###*
# Print the names and majors of students in a sample spreadsheet:
# https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
###

# listMajors = (auth) ->
listMajors = (accessToken) ->
  ###
  sheets = google.sheets('v4')
  sheets.spreadsheets.values.get {
    auth: auth
    spreadsheetId: spreadsheetId
    range: range
  }, (err, response) ->
    if err
      console.log 'The API returned an error: ' + err
  ###
  request = require 'request'
  request.get
    url: "https://sheets.googleapis.com/v4/spreadsheets/#{spreadsheetId}/values/#{range}"
    headers:
      Authorization: "Bearer #{accessToken}"
      Accept: 'application/json'
  , (err, res, body) =>
    if res?.statusCode != 200
      console.error "ERROR: Response err=#{err}"
      console.error "ERROR: Response statusCode=#{res?.statusCode}"
      console.error "ERROR: Response body=#{body}"
      endCallback err, null
      return
    endCallback err, (JSON.parse body)
    return
  return

if process.argv[1] == __filename
  spreadsheetId = process.argv[2]
  range = process.argv[3]
  accessToken = process.argv[4]
  endCallback = (err, response) ->
    if err?
      console.error "ERROR #{err}"
      return
    rows = response.values
    if rows.length == 0
      console.log 'No data found.'
    else
      console.log "行数=#{rows.length}, 列数=#{rows[0].length}"
      i = 0
      while i < rows.length
        line = rows[i].join(', ')
        console.log "#{i+1}: #{line}"
        i++
  run()
