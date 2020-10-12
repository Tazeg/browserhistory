// ------------------------------------------------------------------------------
// Twitter : @JeffProd
// Web     : https://jeffprod.com
// ------------------------------------------------------------------------------

const fs = require('fs')
const path = require('path')
const initSqlJs = require('sql.js/dist/sql-wasm')
const electron = require('electron')
const remote = electron.remote
const dialog = remote.dialog
const shell = electron.shell

/*eslint-disable */
new Vue({ /* eslint-enable */
  el: '#app',

  template: `
  <div class="layout">
    <Layout style="minHeight: 100vh;">
      <Layout>
        <Content :style="{margin: '20px'}">

          <!-- Path to load -->
          <div v-if="!areDbLoaded">
            <Form :model="formTop" label-position="top" :disabled="formTop.disabled">
              <FormItem label="User path">
                <i-input readonly v-model="formTop.dirPath">
                  <Button slot="append" icon="md-folder" @click="loadDir(formTop.dirPath)"></Button>
                </i-input>
              </FormItem>
            </Form>
            <Icon type="logo-windows" /> <Icon type="logo-chrome" /> /Users/&lt;user&gt;/AppData/Local/Google/Chrome/User Data/Default<br>
            <Icon type="logo-tux" /> <Icon type="logo-chrome" /> /home/&lt;user&gt;/.config/chromium/Default
          </div>

          <!-- Databases are loaded -->
          <div v-else>
            <a href="#" @click="goHome()"><Icon type="md-arrow-back" /></a> {{ formTop.dirPath }}<br><br>

            <h2>Visited web sites ({{ dataTopSitesFiltered.length }}/{{ dataTopSites.length }})</h2>
            <Input v-model="filterTxtTopSites" placeholder="Filter by domain..." clearable @on-keyup="filtrerTopSites" @on-clear="filtrerTopSites" /><br>
            <Table height="500" border :columns="columnsTopSites" :data="dataTopSitesFiltered" @on-row-click="showDomainUrls"></Table><br>

            <div v-if="dataUrls.length>0">
              <h2>Domain {{ gDomain }} ({{ dataUrlsFiltered.length }}/{{ dataUrls.length }})</h2>
              <Input v-model="filterTxtUrls" placeholder="Filter by url or title..." clearable @on-keyup="filtrerUrls" @on-clear="filtrerUrls" /><br>
              <Table :loading="domainloading" height="500" border :columns="columnsUrls" :data="dataUrlsFiltered"></Table><br>
            </div>

            <div v-if="dataLogin.length>0">
              <h2>Logins ({{ dataLogin.length }})</h2>
              <Table height="500" border :columns="columnsLogin" :data="dataLogin"></Table><br>
            </div>

            <h2>Key words ({{ dataKeywordsFiltered.length }}/{{ dataKeywords.length }})</h2>
            <Input v-model="filterTxtKeywords" placeholder="Filter..." clearable @on-keyup="filtrerKeywords" @on-clear="filtrerKeywords" /><br>
            <Table height="500" border :columns="columnsKeywords" :data="dataKeywordsFiltered"></Table><br>

            <h2>Downloaded files ({{ dataDownloadFiltered.length }}/{{ dataDownload.length }})</h2>
            <Input v-model="filterTxtDownloads" placeholder="Filtrer..." clearable @on-keyup="filtrerDownloads" @on-clear="filtrerDownloads" /><br>
            <Table height="500" border :columns="columnsDownload" :data="dataDownloadFiltered"></Table><br>

            <div v-if="dataBookmarks.length>0">
              <h2>Bookmarks</h2>
              <Tree :data="dataBookmarks"></Tree>
            </div>

          </div>
        </Content>

        <Footer style="text-align: center; background: #CFD8DC;">
          {{ appname }} v{{ appversion }} - 
          Contact: <a href="javascript:;" @click="openBrowser('mailto:jeffprod@protonmail.com')">jeffprod@protonmail.com</a> - 
          Twitter: <a href="javascript:;" @click="openBrowser('https://twitter.com/jeffprod')">@JeffProd</a>
        </Footer>

      </Layout>
    </Layout>
  </div>
    `,

  data: {
    areDbLoaded: false,
    domainloading: false,
    filterTxtTopSites: '',
    filterTxtUrls: '',
    filterTxtKeywords: '',
    filterTxtDownloads: '',
    formTop: {
      dirPath: '',
      disabled: false
    },
    columnsTopSites: [
      {
        type: 'index',
        width: 80,
        align: 'center'
      },
      {
        title: 'Domain',
        key: 'domain',
        sortable: true,
        resizable: true,
        width: 300
      },
      {
        title: 'Visits',
        key: 'count',
        sortable: true,
        sortType: 'desc'
      }
    ],
    columnsUrls: [
      {
        type: 'index',
        width: 80,
        align: 'center'
      },
      {
        title: 'URL',
        key: 'url',
        sortable: true,
        resizable: true,
        width: 600
      },
      {
        title: 'Title',
        key: 'title',
        sortable: true,
        resizable: true,
        width: 300
      },
      {
        title: 'Last visit',
        key: 'last_visit',
        sortable: true,
        sortType: 'desc'
      }
    ],
    columnsKeywords: [
      {
        type: 'index',
        width: 80,
        align: 'center'
      },
      {
        title: 'Keywords',
        key: 'keywords',
        sortable: true,
        resizable: true,
        width: 600
      },
      {
        title: 'Site',
        key: 'url',
        sortable: true,
        resizable: true,
        width: 300
      },
      {
        title: 'Last visit',
        key: 'last_visit',
        sortable: true,
        sortType: 'desc'
      }
    ],
    columnsDownload: [
      {
        type: 'index',
        width: 80,
        align: 'center'
      },
      {
        title: 'File',
        key: 'path',
        sortable: true,
        resizable: true
      },
      {
        title: 'Start',
        key: 'starttime',
        sortable: true,
        resizable: true,
        width: 200
      },
      {
        title: 'End',
        key: 'endtime',
        sortable: true,
        resizable: true,
        sortType: 'desc',
        width: 200
      },
      {
        title: 'Mime',
        key: 'mimetype',
        sortable: true,
        resizable: true,
        width: 200
      }
    ],
    columnsLogin: [
      {
        type: 'index',
        width: 80,
        align: 'center'
      },
      {
        title: 'URL',
        key: 'action_url',
        sortable: true,
        resizable: true,
        width: 600
      },
      {
        title: 'User name',
        key: 'username_value',
        sortable: true,
        resizable: true,
        sortType: 'asc',
        width: 300
      },
      {
        title: 'Created',
        key: 'datecreated',
        sortable: true
      }
    ],
    dbHistory: null, // object db sql.js
    dbLoginData: null,
    dataTopSites: [], // cf topSites
    dataTopSitesFiltered: [],
    dataUrls: [],
    dataUrlsFiltered: [],
    dataKeywords: [],
    dataKeywordsFiltered: [],
    dataDownload: [],
    dataDownloadFiltered: [],
    dataLogin: [],
    dataBookmarks: [],
    gDomain: ''
  }, // data

  computed: {
    appname () {
      return remote.app.getName().charAt(0).toUpperCase() + remote.app.getName().slice(1)
    },
    appversion () {
      return remote.app.getVersion()
    }
  },

  methods: {
    loadDir: function () {
      const title = 'User browser path'
      // @returns String[] | undefined
      const outDir = dialog.showOpenDialogSync({ // https://electronjs.org/docs/api/dialog
        title: title,
        message: title,
        defaultPath: remote.app.getPath('home'),
        properties: ['openDirectory']
      })
      if (!Array.isArray(outDir)) { return }
      if (outDir.length < 1) { return }
      this.formTop.dirPath = outDir[0]
      this.go()
    },

    goHome () {
      this.areDbLoaded = false
      this.dataTopSites = []
      this.dataTopSitesFiltered = []
      this.dataUrls = []
      this.dataUrlsFiltered = []
      this.formTop.disabled = false
      this.dataKeywords = []
      this.dataKeywordsFiltered = []
      this.dataDownload = []
      this.dataDownloadFiltered = []
      this.dataLogin = []
      this.dataBookmarks = []
      this.gDomain = ''
    },

    // process path this.formTop.dirPath
    go () {
      if (!this.formTop.dirPath) {
        this.$Message.warning({
          content: 'Please select a path',
          duration: 5
        })
        return
      }

      // file db History exists ?
      const fileHistory = path.join(this.formTop.dirPath, 'History')
      if (!fs.existsSync(fileHistory)) {
        this.$Message.error({
          content: 'File not found: ' + fileHistory,
          duration: 5
        })
        return
      }

      // file db 'Login Data' ?
      const fileLoginData = path.join(this.formTop.dirPath, 'Login Data')
      if (!fs.existsSync(fileLoginData)) {
        this.$Message.error({
          content: 'File not found: ' + fileLoginData,
          duration: 5
        })
        return
      }

      // bookmarks, non blocking if absent
      const fileBookmarks = path.join(this.formTop.dirPath, 'Bookmarks')

      this.formTop.disabled = true
      this.$Spin.show()
      setTimeout(() => { // let time to the spin to display
        this.traiteDbs(fileHistory, fileLoginData, fileBookmarks)
      }, 200)
    }, // go

    /**
     * Process SQlite/JSON files
     * @param {string} fileHistory "/home/user/.config/chromium/Default/History" (sqlite3)
     * @param {string} fileLoginData "/home/user/.config/chromium/Default/Login Data" (sqlite3)
     * @param {string} fileBookmarks "/home/user/.config/chromium/Bookmarks" (json)
     */
    traiteDbs (fileHistory, fileLoginData, fileBookmarks) {
      const bufHistory = fs.readFileSync(fileHistory)
      const bufLogin = fs.readFileSync(fileLoginData)
      initSqlJs().then((SQL) => {
        this.dbHistory = new SQL.Database(bufHistory) // Load the db
        this.dbLoginData = new SQL.Database(bufLogin) // Load the db
        this.dbHistory.create_function('getDomainFromURL', this.getDomainFromURL)
        this.dataTopSites = this.topSites()
        this.dataTopSitesFiltered = this.dataTopSites.slice(0)
        this.dataKeywords = this.motcles()
        this.dataKeywordsFiltered = this.dataKeywords.slice(0)
        this.dataDownload = this.downloads()
        this.dataDownloadFiltered = this.dataDownload.slice(0)
        this.dataLogin = this.logins()
        if (fs.existsSync(fileBookmarks)) {
          this.dataBookmarks = this.bookmarks(fileBookmarks)
        } else {
          this.$Message.warning({
            content: 'Missing bookmarks file : ' + fileBookmarks,
            duration: 5
          })
        }
        this.areDbLoaded = true
        this.$Spin.hide()
      }) // initSqlJs
    }, // traiteDbs

    /**
   * Returns the domain from a URL
   * @param {string} strUrl 'https://www.toto.com/titi.html'
   * @returns {string} 'toto.com'
   */
    getDomainFromURL (strUrl) {
      const url = new URL(strUrl)
      return url.hostname
    }, // getDomainFromURL

    /**
     * Returns most visited domains from the urls in the db History
     * @returns {Array} [ { domain: 'toto.fr', count: 22 }, ...]
     */
    topSites () {
      const domains = {} // count['google.fr] = 5
      const stmt = this.dbHistory.prepare('SELECT url FROM urls') // Prepare an sql statement
      stmt.bind({})
      while (stmt.step()) { // foreach row
        const row = stmt.getAsObject() // {url: "https://test.example.fr/"}
        const domain = this.getDomainFromURL(row.url) !== '' ? this.getDomainFromURL(row.url) : row.url
        if (!(domain in domains)) {
          domains[domain] = 0
        }
        domains[domain]++
        // console.log(this.getDomainFromURL(row.url))
      }
      // console.log(domains)
      stmt.free()

      const result = []
      for (const domain in domains) {
        result.push({ domain, count: domains[domain] })
      }
      return result
    }, // topSites

    /**
     * Filters the TopSites listing with the typed text filterTxtTopSites
     */
    filtrerTopSites () {
      const pattern = this.filterTxtTopSites.toLowerCase()

      // console.log(`Filtre sur "${pattern}"`)
      // console.log(this.data)

      this.dataTopSitesFiltered = this.dataTopSites.filter((row) => {
        return row.domain.toLowerCase().includes(pattern)
      })
    }, // filtrerTopSItes

    /**
     * Returns the searched keywords
     * @returns {Array} [ { term, url, last_visit }, ...]
     */
    motcles () {
      const stmt = this.dbHistory.prepare('SELECT DISTINCT term,getDomainFromURL(url) AS url,datetime((last_visit_time/1000000)-11644473600, "unixepoch", "localtime") AS last_visit from keyword_search_terms,urls WHERE urls.id=keyword_search_terms.url_id ORDER BY last_visit DESC')
      stmt.bind({})
      const result = []
      while (stmt.step()) { // foreach row
        const row = stmt.getAsObject() // { term, url, last_visit }
        result.push({ keywords: row.term, url: row.url, last_visit: row.last_visit })
      }
      stmt.free()
      return result
    }, // motcles

    /**
     * Retourne les fichiers téléchargés
     * @returns {Array} [ { path, starttime, endtime, mimetype }, ...]
     */
    downloads () {
      const stmt = this.dbHistory.prepare(`
      SELECT 
        target_path as path,
        datetime((start_time/1000000)-11644473600, "unixepoch", "localtime") AS starttime,
        datetime((end_time/1000000)-11644473600, "unixepoch", "localtime") AS endtime,
        original_mime_type AS mimetype
      FROM downloads
      WHERE received_bytes>0
      `)
      stmt.bind({})
      const result = []
      while (stmt.step()) { // foreach row
        const row = stmt.getAsObject()
        result.push({ path: row.path, starttime: row.starttime, endtime: row.endtime, mimetype: row.mimetype })
      }
      stmt.free()
      return result
    }, // downloads

    /**
     * Returns logins
     * @returns {Array} [ { action_url, username_value, datecreated }, ...]
     */
    logins () {
      const stmt = this.dbLoginData.prepare(`
      SELECT
        action_url,
        username_value,
        datetime((date_created/1000000)-11644473600, "unixepoch", "localtime") as datecreated 
      FROM
        logins
      WHERE
        action_url <> '' AND username_value <> ''
      ORDER BY
        username_value
      `)
      stmt.bind({})
      const result = []
      while (stmt.step()) { // foreach row
        const row = stmt.getAsObject()
        result.push({ action_url: row.action_url, username_value: row.username_value, datecreated: row.datecreated })
      }
      stmt.free()
      return result
    }, // logins

    /**
     * On click on a domain name in the iview table, we load related urls
     * @param {object} tablerow row iview
     * @param {number} tableindex index row table iview
     */
    showDomainUrls (tablerow) { //, tableindex) {
      // console.log(tablerow, tableindex)
      this.gDomain = tablerow.domain
      this.domainloading = true
      setTimeout(() => {
        const stmt = this.dbHistory.prepare(`
        SELECT 
          url,
          title,
          datetime((last_visit_time/1000000)-11644473600, "unixepoch", "localtime") AS last_visit
        FROM
          urls
        WHERE
          url LIKE "http://` + tablerow.domain + `%" OR
          url LIKE "https://` + tablerow.domain + `%"
        ORDER BY
          last_visit DESC
        `) // Prepare an sql statement
        stmt.bind({})
        this.dataUrls = []
        while (stmt.step()) { // foreach row
          const row = stmt.getAsObject()
          const last = row.last_visit === '1601-01-01 01:00:00' ? '' : row.last_visit
          this.dataUrls.push({ url: row.url, title: row.title, last_visit: last })
        }
        stmt.free()
        this.dataUrlsFiltered = this.dataUrls.slice(0)
        this.domainloading = false
      }, 200) // let time for the spin to display
    },

    /**
     * Filter URLS with this.filterTxtUrls
     */
    filtrerUrls () {
      const pattern = this.filterTxtUrls.toLowerCase()
      this.dataUrlsFiltered = this.dataUrls.filter((row) => {
        return row.url.toLowerCase().includes(pattern) || row.title.toLowerCase().includes(pattern)
      })
    },

    /**
     * Filter keywords with this.filterTxtKeywords
     */
    filtrerKeywords () {
      const pattern = this.filterTxtKeywords.toLowerCase()
      this.dataKeywordsFiltered = this.dataKeywords.filter((row) => {
        return row.keywords.toLowerCase().includes(pattern)
      })
    },

    /**
     * Filter downloads with this.filterTxtDownloads
     */
    filtrerDownloads () {
      const pattern = this.filterTxtDownloads.toLowerCase()
      this.dataDownloadFiltered = this.dataDownload.filter((row) => {
        return row.path.toLowerCase().includes(pattern)
      })
    },

    /**
     * Process the JSON bookmarks
     * @param {string} fileBookmarks "/home/user/.config/chromium/Bookmarks" (json)
     * @returns {Array} https://www.iviewui.com/components/tree-en
     */
    bookmarks (fileBookmarks) {
      const contentStr = fs.readFileSync(fileBookmarks, 'utf8')
      const obj = JSON.parse(contentStr).roots

      // Object.keys(obj).forEach((k) => {
      //   console.log(k + ' - ' + obj[k])
      // })
      // => bookmark_bar, other, synced

      let result = []
      if ('bookmark_bar' in obj) {
        result = this.traiteBookmark(obj.bookmark_bar)
      }
      return result
    },

    /**
     * @param {Array} bar
     */
    traiteBookmark (bar) {
      const result = []

      if ('children' in bar) {
        bar.children.forEach((c) => {
          if (c.type === 'folder') {
            // console.log(c.name)
            result.push({
              title: c.name,
              // expand: true,
              children: this.traiteBookmark(c)
            })
            return
          }
          result.push({
            title: c.name + ' (' + c.url + ')'
            // expand: true
          })
        })
      }

      return result
    }, // traiteBookmark

    openBrowser (url) {
      shell.openExternal(url)
    }

  } // methods
}) // Vue
