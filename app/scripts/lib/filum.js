class FilumAnalytics {
  constructor() {
    !(function () {
      var t = window.filumanalytics || []
      if (0 === t.length) {
        ;(t.methods = [
          'load',
          'track',
          'identify',
          'ready',
          'reset',
          'getAnonymousId',
          'setAnonymousId'
        ]),
          (t.factory = function (e) {
            return function () {
              var a = Array.prototype.slice.call(arguments)
              return a.unshift(e), t.push(a), t
            }
          })
        for (var e = 0; e < t.methods.length; e++) {
          var a = t.methods[e]
          t[a] = t.factory(a)
        }
        ;(t.loadJS = function (t, e) {
          var a = document.createElement('script')
          ;(a.type = 'text/javascript'),
            (a.async = !0),
            (a.src =
              'https://filum-assets.sgp1.digitaloceanspaces.com/sdk/filum-analytics.min.js')
          var n = document.getElementsByTagName('script')[0]
          n.parentNode.insertBefore(a, n)
        }),
          t.loadJS(),
          (window.filumanalytics = t)
      }
    })()
  }
  init = () => {
    window.filumanalytics.load(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOjI0OH0.5nBwo5y5dRRPIHYSGWj2BoGj25E04yF6R9g_CkV_HjY',
      'https://event.filum.ai/events'
    )
  }
  track = (name, properties) => {
    window.filumanalytics.track(name, properties);
  }
  reset = () => {
    window.filumanalytics.reset();
  }
  identify = (address) => {
    window.filumanalytics.identify(address, {
      address: address
    });
  }
}

let filumAnalytics;

export const initFilum = () => {
  if (filumAnalytics) return
  console.log('init')
  filumAnalytics = new FilumAnalytics();
  filumAnalytics.init();
}

export const filumReset = async () => {
  if (!filumAnalytics) return
  filumAnalytics.reset()
};

export const filumIdentify = async (address) => {
  if (!filumAnalytics) return
  return filumAnalytics.identify(address,);
};

export default new FilumAnalytics()