# mini-google-sheetsのテスト

path = require("path")
util = require('util')
async = require('async')
Spreadsheet = require('./mini-google-sheets').Spreadsheet

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
infolog "testCase=#{testCase}"

async.series [
  # OAuth2.0認証のテスト
  (step) =>
    if testCase? and not (testCase is 'oauth2')
      step()
      return
    infolog "--- OAuth2.0認証のテスト"
    obj = new Spreadsheet
    obj.useOAuth2 oauth2ClientPath, readTokenPath, false, () =>
      accessToken = obj.oauth2Client.credentials.access_token
      console.log "credentials=#{util.inspect obj.oauth2Client.credentials}"
      obj.useSpreadsheet 'TryNodeJs_sample-spreadsheet', (response) =>
        console.log "response=#{util.inspect response}"
        step()

  # 入手済みアクセストークン使用のテスト
  , (step) =>
    if testCase? and not (testCase is 'access-token')
      step()
      return
    infolog "--- 入手済みアクセストークン使用のテスト"
    obj = new Spreadsheet
    obj.useAccessToken accessToken, () =>
      obj.useSpreadsheet 'TryNodeJs_sample-spreadsheet', (response) =>
        console.log "response=#{util.inspect response}"
        step()

  # Googleスプレッドシート読み込みのテスト
  , (step) =>
    if testCase? and not (testCase is 'read')
      step()
      return
    infolog "--- Googleスプレッドシート読み込みのテスト"
    obj = new Spreadsheet
    obj.useOAuth2 oauth2ClientPath, readTokenPath, false, () =>
      obj.useSpreadsheet 'TryNodeJs_sample-spreadsheet', (response) =>
        console.log "useSpreadsheet response=#{util.inspect response}"
        infolog "--- スプレッドシート情報の取得"
        obj.getProperties (response) =>
          console.log "getProperties response=#{util.inspect response}"
          infolog "--- セル値の読み込み"
          obj.getValues 'Sheet1', (response) =>
            console.log "getValues response=#{util.inspect response}"
            step()

  # Googleスプレッドシート書き込みのテスト
  , (step) =>
    if testCase? and not (testCase is 'write')
      step()
      return
    infolog "--- Googleスプレッドシート書き込みのテスト"
    obj = new Spreadsheet
    obj.useOAuth2 oauth2ClientPath, writeTokenPath, true, () =>
      obj.useSpreadsheet 'TryNodeJs_sample-spreadsheet', (response) =>
        infolog "--- セル値の更新"
        obj.updateValues 'Sheet1!A3:C3', [['test','update',timestamp]], (response) =>
          console.log "updateValues response=#{util.inspect response}"
          infolog "--- セル値の追記"
          obj.appendValues 'Sheet1', [['test','append',timestamp]], (response) =>
            console.log "appendValues response=#{util.inspect response}"
            step()

  # Googleスプレッドシート作成、シート追加のテスト
  , (step) =>
    if testCase? and not (testCase is 'create')
      step()
      return
    infolog "--- Googleスプレッドシート作成、シート追加のテスト"
    obj = new Spreadsheet
    obj.useOAuth2 oauth2ClientPath, writeTokenPath, true, () =>
      infolog "--- スプレッドシート作成"
      obj.createSpreadsheet "TryNodeJs_mini-google-sheets_#{timestamp}", (response) =>
        console.log "createSpreadsheet response=#{util.inspect response}"
        infolog "--- シート追加"
        obj.addSheet "Sheet_#{timestamp}", (response) =>
          console.log "addSheet response=#{util.inspect response}"
          step()

], (err) =>
  infolog err if err?
