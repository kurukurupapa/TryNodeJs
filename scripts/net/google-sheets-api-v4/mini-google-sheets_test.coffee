# mini-google-sheetsのテスト

async = require('async')
path = require("path")
util = require('util')
GSheets = require('./mini-google-sheets').GSheets

scriptDir = __dirname
scriptName = path.basename __filename
baseName = path.basename __filename, path.extname(__filename)
d = new Date
dateStr = d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)
timeStr = ('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2)+('0'+d.getSeconds()).slice(-2)
timestamp = dateStr+'-'+timeStr
infolog = util.log
debuglog = util.debuglog baseName

credentialDir = (process.env.HOME or process.env.USERPROFILE) + '/.credentials/'
oauth2ClientPath = credentialDir + 'client_secret.json'
readTokenPath = credentialDir + 'sheets.googleapis.com-nodejs-mini-read.json'
writeTokenPath = credentialDir + 'sheets.googleapis.com-nodejs-mini-write.json'
accessToken = null

testCase = process.argv[2]
accessToken = process.argv[3]
infolog "testCase=#{testCase}"

async.series [
  # OAuth2.0認証のテスト
  (step) =>
    if testCase? and not (testCase is 'OAuth2')
      step()
      return
    infolog "--- OAuth2.0認証のテスト"
    obj = new GSheets
    obj.useOAuth2 oauth2ClientPath, readTokenPath, false, (response) =>
      accessToken = response.access_token
      console.log "useOAuth2 response=#{util.inspect response}"
      obj.listFilesByName 'TryNodeJs_sample-spreadsheet', null, (response) =>
        console.log "listFilesByName response.files.length=#{response.files.length}"
        step()

  # 入手済みアクセストークン使用のテスト
  , (step) =>
    if testCase? and not (testCase is 'AccessToken')
      step()
      return
    infolog "--- 入手済みアクセストークン使用のテスト"
    obj = new GSheets
    obj.useAccessToken accessToken, () =>
      obj.listFilesByName 'TryNodeJs_sample-spreadsheet', null, (response) =>
        console.log "listFilesByName response.files.length=#{response.files.length}"
        step()

  # Googleスプレッドシート読み込みのテスト
  , (step) =>
    if testCase? and not (testCase is 'Read')
      step()
      return
    infolog "--- Googleスプレッドシート読み込みのテスト"
    obj = new GSheets
    obj.useOAuth2 oauth2ClientPath, readTokenPath, false, () =>
      obj.listFilesByName 'TryNodeJs_sample-spreadsheet', null, (response) =>
        console.log "listFilesByName response=#{util.inspect response}"
        spreadsheetId = response.files[0].id

        infolog "--- スプレッドシート情報の取得"
        obj.getProperties spreadsheetId, (response) =>
          console.log "getProperties response=#{util.inspect response}"

          infolog "--- セル値の読み込み"
          obj.getValues spreadsheetId, 'Sheet1', (response) =>
            console.log "getValues response=#{util.inspect response}"
            step()

  # Googleスプレッドシート書き込みのテスト
  , (step) =>
    if testCase? and not (testCase is 'Write')
      step()
      return
    infolog "--- Googleスプレッドシート書き込みのテスト"
    obj = new GSheets
    obj.useOAuth2 oauth2ClientPath, writeTokenPath, true, () =>
      obj.listFilesByName 'TryNodeJs_sample-spreadsheet', null, (response) =>
        console.log "listFilesByName response=#{util.inspect response}"
        spreadsheetId = response.files[0].id

        infolog "--- セル値の更新"
        obj.updateValues spreadsheetId, 'Sheet1!A3:C3', [['test','update',timestamp]], (response) =>
          console.log "updateValues response=#{util.inspect response}"

          infolog "--- セル値の追記"
          obj.appendValues spreadsheetId, 'Sheet1', [['test','append',timestamp]], (response) =>
            console.log "appendValues response=#{util.inspect response}"
            step()

  # Googleスプレッドシート作成、シート追加のテスト
  , (step) =>
    if testCase? and not (testCase is 'Create')
      step()
      return
    infolog "--- Googleスプレッドシート作成、シート追加のテスト"
    obj = new GSheets
    obj.useOAuth2 oauth2ClientPath, writeTokenPath, true, () =>

      infolog "--- スプレッドシート作成"
      obj.createSpreadsheet "TryNodeJs_mini-google-sheets_#{timestamp}", (response) =>
        console.log "createSpreadsheet response=#{util.inspect response}"
        spreadsheetId = response.spreadsheetId

        infolog "--- シート追加"
        obj.addSheet spreadsheetId, "Sheet_#{timestamp}", (response) =>
          console.log "addSheet response=#{util.inspect response}"
          step()

], (err) =>
  infolog err if err?
