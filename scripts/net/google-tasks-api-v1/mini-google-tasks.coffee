# Google APIs Client for Node.js の Googleタスク を簡単に使えるようにラッピング
# Google Tasks API v1を使用。
#
# 事前準備
# npm install googleapis --save
# npm install google-auth-library --save
#
# 参考
# Node.js Quickstart | Tasks API | Google Developers https://developers.google.com/google-apps/tasks/quickstart/nodejs#step_3_set_up_the_sample
# google-api-nodejs-client/v1.ts at master · google/google-api-nodejs-client https://github.com/google/google-api-nodejs-client/blob/master/src/apis/tasks/v1.ts

assert = require('assert')
fs = require('fs')
path = require("path")
readline = require('readline')
util = require('util')
google = require('googleapis')
googleAuth = require('google-auth-library')

scriptDir = __dirname
scriptName = path.basename __filename
baseName = path.basename __filename, path.extname(__filename)
infolog = util.log
debuglog = util.debuglog baseName

###
# Googleタスク操作クラス
###
class GTasks
  @READ_ONLY_SCOPE: ['https://www.googleapis.com/auth/tasks.readonly']
  @READ_WRITE_SCOPE: ['https://www.googleapis.com/auth/tasks']
  @STATUS_NEEDS_ACTION: 'needsAction'
  @STATUS_COMPLETED: 'completed'

  constructor: ->
    @tasks = google.tasks 'v1'
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
      GTasks.READ_WRITE_SCOPE
    else
      GTasks.READ_ONLY_SCOPE
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

  ###
  # アクセストークンを更新する
  # 事前にuseOAuth2メソッドを呼び出しておくこと。
  # @param {function} callback  function(response)
  ###
  refreshAccessToken: (callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    assert.ok @oauth2Client, "エラー @oauth2Client=#{@oauth2Client}"
    @oauth2Client.refreshAccessToken (err, token) =>
      if err
        throw new Error "Error while trying to refresh access token #{err}"
      @oauth2Client.credentials = token
      callback token

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
  # タスクリストを検索
  # @param {string} title  検索するタスクリストのタイトル
  # @param {function} callback  function(response)
  ###
  findTasklists: (title, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @listTasklists (response) =>
      tasklists = response.items
      outTasklists = []
      for e in response.items
        if e.title is title
          outTasklists.push e
      callback {items: outTasklists}

  ###
  # タスクリスト一覧を取得
  # @param {function} callback  function(response)
  # responseの例：
  # {
  #   "kind": "tasks#taskLists",
  #   "etag": string,
  #   "nextPageToken": string,
  #   "items": [
  #     {
  #       "kind": "tasks#taskList",
  #       "id": string,
  #       "etag": string,
  #       "title": string,
  #       "updated": datetime,
  #       "selfLink": string
  #     }
  #   ]
  # }
  ###
  listTasklists: (callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @tasks.tasklists.list {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
    }, (err, response) =>
      if err
        throw new Error 'The API returned an error: ' + err
      callback response

  ###
  # タスクリストを追加
  # @param {string} title タスクリストのタイトル
  # @param {function} callback  function(response)
  # responseの例：
  # {
  #   "kind": "tasks#taskList",
  #   "id": string,
  #   "etag": string,
  #   "title": string,
  #   "updated": datetime,
  #   "selfLink": string
  # }
  ###
  insertTasklist: (title, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @tasks.tasklists.insert {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      resource:
        title: title
    }, (err, response) =>
      if err
        throw new Error 'The API returned an error: ' + err
      callback response

  ###
  # タスクリストを更新
  # @param {string} resource 更新するタスクリストの内容。insertTasklistメソッドのresponse参照。
  # @param {function} callback  function(response)
  ###
  updateTasklist: (resource, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @tasks.tasklists.update {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      tasklist: resource.id
      resource: resource
    }, (err, response) =>
      if err
        throw new Error 'The API returned an error: ' + err
      callback response

  ###
  # タスクを抽出
  # @param {string} tasklistId  タスクリストID
  # @param {string} title  抽出対象のタイトル
  # @param {object} params  listTasksメソッド参照
  # @param {function} callback  function(response)
  ###
  findTasks: (tasklistId, title, params, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @listTasks tasklistId, params, (response) =>
      tasks = response.items
      outTasks = []
      for e in tasks
        if e.title is title
          outTasks.push e
      callback {items: outTasks}

  ###
  # タスク一覧を取得
  # @param {string} tasklistId  タスクリストID
  # @param {object} params Parameters for request
  # @param {boolean} params.showCompleted Flag indicating whether completed tasks are returned in the result. Optional. The default is True.
  # @param {boolean} params.showDeleted Flag indicating whether deleted tasks are returned in the result. Optional. The default is False.
  # @param {boolean} params.showHidden Flag indicating whether hidden tasks are returned in the result. Optional. The default is False.
  # @param {function} callback  function(response)
  # responseの例：
  # {
  #   "kind": "tasks#tasks",
  #   "etag": string,
  #   "nextPageToken": string,
  #   "items": [
  #     {
  #       "kind": "tasks#task",
  #       "id": string,
  #       "etag": etag,
  #       "title": string,
  #       "updated": datetime,
  #       "selfLink": string,
  #       "parent": string,
  #       "position": string,
  #       "notes": string,
  #       "status": string,
  #       "due": datetime,
  #       "completed": datetime,
  #       "deleted": boolean,
  #       "hidden": boolean,
  #       "links": [
  #         {
  #           "type": string,
  #           "description": string,
  #           "link": string
  #         }
  #       ]
  #     }
  #   ]
  # }
  ###
  listTasks: (tasklistId, params, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    params2 = Object.assign {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      tasklist: tasklistId
    }, params
    @tasks.tasks.list params2, (err, response) =>
      if err
        throw new Error 'The API returned an error: ' + err
      callback response

  ###
  # タスクを追加
  # @param {string} tasklistId  タスクリストID
  # @param {object} resource  新規タスクの内容。指定したい属性のみ設定すればOK。
  # @param {function} callback  function(response)
  # resource,responseの例：
  # {
  #   "kind": "tasks#task",
  #   "id": string,
  #   "etag": etag,
  #   "title": string,
  #   "updated": datetime,
  #   "selfLink": string,
  #   "parent": string,
  #   "position": string,
  #   "notes": string,
  #   "status": string,
  #   "due": datetime,
  #   "completed": datetime,
  #   "deleted": boolean,
  #   "hidden": boolean,
  #   "links": [
  #     {
  #       "type": string,
  #       "description": string,
  #       "link": string
  #     }
  #   ]
  # }
  ###
  insertTask: (tasklistId, resource, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @tasks.tasks.insert {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      tasklist: tasklistId
      resource: resource
    }, (err, response) =>
      if err
        throw new Error 'The API returned an error: ' + err
      callback response

  ###
  # タスクのステータスを完了に更新
  # @param {string} tasklistId  タスクリストID
  # @param {object} resource  更新するタスクオブジェクト。（更新項目だけだとエラーになった。全項目が揃ってないとダメかも。）
  # @param {function} callback  function(response)
  ###
  updateTaskStatusToCompleted: (tasklistId, resource, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    resource2 = Object.assign {}, resource, {status: GTasks.STATUS_COMPLETED}
    @updateTask tasklistId, resource2, (response) =>
      callback response

  ###
  # タスクを更新
  # @param {string} tasklistId  タスクリストID
  # @param {object} resource  更新するタスクオブジェクト。（更新項目だけだとエラーになった。全項目が揃ってないとダメかも。）
  # @param {function} callback  function(response)
  ###
  updateTask: (tasklistId, resource, callback) ->
    assert.ok typeof callback is 'function', "引数エラー callback=#{callback}"
    @tasks.tasks.update {
      auth: @oauth2Client if @oauth2Client
      headers: if @accessToken
        Authorization: "Bearer #{@accessToken}"
      tasklist: tasklistId
      task: resource.id
      resource: resource
    }, (err, response) =>
      if err
        throw new Error 'The API returned an error: ' + err
      callback response

module.exports.GTasks = GTasks
