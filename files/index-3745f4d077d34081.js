(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [818],
  {
    8312: function (e, t, a) {
      (window.__NEXT_P = window.__NEXT_P || []).push([
        "/",
        function () {
          return a(7211);
        },
      ]);
    },
    7604: function (e, t, a) {
      "use strict";
      a.d(t, {
        Z: function () {
          return n;
        },
      });
      var s = a(5893),
        r = a(1365);
      function n(e) {
        let {
            title: t,
            url: a,
            label: n = "",
            className: i = "",
            fill: l,
            small: o,
          } = e,
          c = t.trim().split(" "),
          d = c.pop(),
          m = c.join(" ");
        return (0, s.jsxs)("a", {
          className:
            "inline-flex items-baseline font-medium leading-tight text-slate-200 "
              .concat(i, " group/link ")
              .concat(o ? "text-sm" : "text-base"),
          href: a,
          target: "_blank",
          rel: "noreferrer noopener",
          "aria-label": "".concat(n || t, " (opens in a new tab)"),
          children: [
            l &&
              (0, s.jsx)("span", {
                className:
                  "absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block",
              }),
            (0, s.jsxs)("span", {
              children: [
                m,
                " ",
                (0, s.jsxs)("span", {
                  className: "inline-block",
                  children: [
                    d,
                    (0, s.jsx)(r.Z, {
                      use: "arrow-external",
                      className:
                        "inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none ".concat(
                          o ? "ml-0.5" : "ml-1 translate-y-px",
                        ),
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
    },
    1365: function (e, t, a) {
      "use strict";
      a.d(t, {
        Z: function () {
          return r;
        },
      });
      var s = a(5893);
      function r(e) {
        let { use: t, className: a = "h-4 w-4" } = e;
        switch (t) {
          case "github":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 16 16",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z",
              }),
            });
          case "instagram":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 1000 1000",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                d: "M295.42,6c-53.2,2.51-89.53,11-121.29,23.48-32.87,12.81-60.73,30-88.45,57.82S40.89,143,28.17,175.92c-12.31,31.83-20.65,68.19-23,121.42S2.3,367.68,2.56,503.46,3.42,656.26,6,709.6c2.54,53.19,11,89.51,23.48,121.28,12.83,32.87,30,60.72,57.83,88.45S143,964.09,176,976.83c31.8,12.29,68.17,20.67,121.39,23s70.35,2.87,206.09,2.61,152.83-.86,206.16-3.39S799.1,988,830.88,975.58c32.87-12.86,60.74-30,88.45-57.84S964.1,862,976.81,829.06c12.32-31.8,20.69-68.17,23-121.35,2.33-53.37,2.88-70.41,2.62-206.17s-.87-152.78-3.4-206.1-11-89.53-23.47-121.32c-12.85-32.87-30-60.7-57.82-88.45S862,40.87,829.07,28.19c-31.82-12.31-68.17-20.7-121.39-23S637.33,2.3,501.54,2.56,348.75,3.4,295.42,6m5.84,903.88c-48.75-2.12-75.22-10.22-92.86-17-23.36-9-40-19.88-57.58-37.29s-28.38-34.11-37.5-57.42c-6.85-17.64-15.1-44.08-17.38-92.83-2.48-52.69-3-68.51-3.29-202s.22-149.29,2.53-202c2.08-48.71,10.23-75.21,17-92.84,9-23.39,19.84-40,37.29-57.57s34.1-28.39,57.43-37.51c17.62-6.88,44.06-15.06,92.79-17.38,52.73-2.5,68.53-3,202-3.29s149.31.21,202.06,2.53c48.71,2.12,75.22,10.19,92.83,17,23.37,9,40,19.81,57.57,37.29s28.4,34.07,37.52,57.45c6.89,17.57,15.07,44,17.37,92.76,2.51,52.73,3.08,68.54,3.32,202s-.23,149.31-2.54,202c-2.13,48.75-10.21,75.23-17,92.89-9,23.35-19.85,40-37.31,57.56s-34.09,28.38-57.43,37.5c-17.6,6.87-44.07,15.07-92.76,17.39-52.73,2.48-68.53,3-202.05,3.29s-149.27-.25-202-2.53m407.6-674.61a60,60,0,1,0,59.88-60.1,60,60,0,0,0-59.88,60.1M245.77,503c.28,141.8,115.44,256.49,257.21,256.22S759.52,643.8,759.25,502,643.79,245.48,502,245.76,245.5,361.22,245.77,503m90.06-.18a166.67,166.67,0,1,1,167,166.34,166.65,166.65,0,0,1-167-166.34",
              }),
            });
          case "twitter":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 248 204",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                id: "white_background",
                d: "M221.95,51.29c0.15,2.17,0.15,4.34,0.15,6.53c0,66.73-50.8,143.69-143.69,143.69v-0.04   C50.97,201.51,24.1,193.65,1,178.83c3.99,0.48,8,0.72,12.02,0.73c22.74,0.02,44.83-7.61,62.72-21.66   c-21.61-0.41-40.56-14.5-47.18-35.07c7.57,1.46,15.37,1.16,22.8-0.87C27.8,117.2,10.85,96.5,10.85,72.46c0-0.22,0-0.43,0-0.64   c7.02,3.91,14.88,6.08,22.92,6.32C11.58,63.31,4.74,33.79,18.14,10.71c25.64,31.55,63.47,50.73,104.08,52.76   c-4.07-17.54,1.49-35.92,14.61-48.25c20.34-19.12,52.33-18.14,71.45,2.19c11.31-2.23,22.15-6.38,32.07-12.26   c-3.77,11.69-11.66,21.62-22.2,27.93c10.01-1.18,19.79-3.86,29-7.95C240.37,35.29,231.83,44.14,221.95,51.29z",
              }),
            });
          case "twitter-x":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 1200 1227",
              fill: "none",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                d: "M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z",
                fill: "currentColor",
              }),
            });
          case "linkedin":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                d: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z",
              }),
            });
          case "goodreads":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 1024 1024",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                d: "M663.8 382.4c10.2 74.6-9.4 158-71.8 201.4-44.6 31-105.6 28.2-141.6 11.4-74.2-34.6-99-117.2-93.6-194.4 8.6-121.8 81.8-175.8 150.6-175 93.8-0.4 143.6 63.6 156.4 156.6zM960 176v672c0 61.8-50.2 112-112 112H176c-61.8 0-112-50.2-112-112V176c0-61.8 50.2-112 112-112h672c61.8 0 112 50.2 112 112zM724 626.4s-0.2-68-0.2-434.6h-58v80.6c-1.6 0.6-2.4-1-3.2-2.4-19.2-41.4-71.8-92.6-152-92-103.8 0.8-174.4 62.4-201.2 155.6-8.6 29.8-11.6 60.2-11 91.2 3.4 155.8 90.2 235.6 224.8 230.4 57.8-2.2 109-34 138-90.4 1-2 2.2-3.8 3.4-5.8 0.4 0.2 0.8 0.2 1.2 0.4 0.6 7.6 0.4 61.4 0.2 69-0.4 29.6-4 59-14.4 87-15.6 42-44.6 69.4-89 79-35.6 7.8-71.2 7.6-106.4-2.4-43-12.2-73-38-82.2-83.6-0.6-3.2-2.6-2.6-4.6-2.6h-53.6c1.6 21.2 6.4 40.6 17 58.4 48.4 81 165.4 97 256.4 74.8 99.8-24.6 134.6-109.8 134.8-212.6z",
                fill: "",
              }),
            });
          case "facebook":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                d: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
              }),
            });
          case "codepen":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 64 64",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                d: "M3.06 41.732L32 60.932l28.94-19.2V22.268L32 3.068l-28.94 19.2zm57.878 0L32 22.268 3.06 41.732m0-19.463L32 41.47l28.94-19.2M32 3.068v19.2m0 19.463v19.2",
                strokeWidth: "5",
              }),
            });
          case "arrow-external":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                fillRule: "evenodd",
                d: "M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z",
                clipRule: "evenodd",
              }),
            });
          case "arrow-internal":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                fillRule: "evenodd",
                d: "M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z",
                clipRule: "evenodd",
              }),
            });
          case "star":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                fillRule: "evenodd",
                d: "M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z",
                clipRule: "evenodd",
              }),
            });
          case "download":
            return (0, s.jsxs)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: [
                (0, s.jsx)("path", {
                  d: "M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z",
                }),
                (0, s.jsx)("path", {
                  d: "M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z",
                }),
              ],
            });
          case "close":
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                fillRule: "evenodd",
                d: "M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z",
                clipRule: "evenodd",
              }),
            });
          case "link":
            return (0, s.jsxs)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              className: a,
              "aria-hidden": "true",
              children: [
                (0, s.jsx)("path", {
                  d: "M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z",
                }),
                (0, s.jsx)("path", {
                  d: "M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z",
                }),
              ],
            });
          default:
            return (0, s.jsx)("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              className: a,
              fill: "none",
              stroke: "currentColor",
              "aria-hidden": "true",
              children: (0, s.jsx)("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M4 6h16M4 12h16M4 18h7",
              }),
            });
        }
      }
    },
    4533: function (e, t, a) {
      "use strict";
      a.d(t, {
        Z: function () {
          return r;
        },
      });
      var s = a(5893);
      function r(e) {
        let { text: t, className: a = "" } = e;
        return (0, s.jsx)("div", {
          className:
            "flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 ".concat(
              a,
            ),
          children: t,
        });
      }
    },
    8425: function (e, t, a) {
      "use strict";
      a.d(t, {
        Z: function () {
          return null; //l;
        },
      });
      var s = a(5893),
        r = a(7294),
        n = a(9008),
        i = a.n(n);
      function l(e) {
        let { title: t, pathname: a } = e,
          n = "Salim Murshed",
          l =
            "Salim Murshed is a software engineer who builds accessible, inclusive products and digital experiences for the web.",
          o = "https://salimmurshed.vercel.app/",
          c = "".concat(o, "/og.png"),
          d = "@salimmurshed",
          m = n;
        return (
          t !== n && (m = "".concat(t, " | ").concat(n)),
          (0, s.jsxs)(i(), {
            children: [
              (0, s.jsx)("title", { children: m }),
              (0, s.jsx)(
                "meta",
                { name: "description", content: l },
                "description",
              ),
              (0, s.jsx)("meta", { name: "image", content: c }),
              (0, s.jsx)(
                "meta",
                { property: "og:locale", content: "en_US" },
                "og:locale",
              ),
              (0, s.jsx)(
                "meta",
                { property: "og:site_name", content: n },
                "og:site_name",
              ),
              (0, s.jsx)(
                "meta",
                { property: "og:type", content: "website" },
                "og:type",
              ),
              (0, s.jsx)(
                "meta",
                { property: "twitter:card", content: "summary_large_image" },
                "twitter:card",
              ),
              (0, s.jsx)("link", {
                rel: "preconnect",
                href: "https://fonts.googleapis.com",
              }),
              (0, s.jsx)("link", {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossOrigin: "anonymous",
              }),
              (0, s.jsx)("link", {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Big+Shoulders+Inline:opsz,wght@10..72,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Roboto+Slab:wght@100..900&display=swap",
              }),
              (0, s.jsx)(
                "meta",
                { property: "twitter:creator", content: d },
                "twitter:creator",
              ),
              (0, s.jsx)(
                "meta",
                { property: "twitter:site", content: d },
                "twitter:site",
              ),
              ["og", "twitter"].map((e) =>
                (0, s.jsxs)(
                  r.Fragment,
                  {
                    children: [
                      (0, s.jsx)(
                        "meta",
                        { property: "".concat(e, ":title"), content: m },
                        "".concat(e, ":title"),
                      ),
                      (0, s.jsx)(
                        "meta",
                        { property: "".concat(e, ":description"), content: l },
                        "".concat(e, ":description"),
                      ),
                      (0, s.jsx)(
                        "meta",
                        { property: "".concat(e, ":url"), content: o + a },
                        "".concat(e, ":url"),
                      ),
                      (0, s.jsx)(
                        "meta",
                        { property: "".concat(e, ":image"), content: c },
                        "".concat(e, ":image"),
                      ),
                    ],
                  },
                  e,
                ),
              ),
              (0, s.jsx)("link", {
                rel: "icon",
                // type: "image/svg+xml",
                sizes: "any",
                href: "./files/images/favicon.ico",
              }),
              (0, s.jsx)("link", {
                rel: "icon",
                type: "image/png",
                sizes: "192x192",
                href: "./files/images/salim.png",
              }),
              (0, s.jsx)("link", {
                rel: "apple-touch-icon",
                sizes: "180x180",
                href: "./files/images/salim.png",
              }),
              (0, s.jsx)("link", {
                rel: "icon",
                type: "image/png",
                sizes: "32x32",
                href: "./files/images/salim.png",
              }),
              (0, s.jsx)("link", {
                rel: "icon",
                type: "image/png",
                sizes: "16x16",
                href: "./files/images/salim.png",
              }),
              (0, s.jsx)("link", {
                rel: "manifest",
                href: "./site.webmanifest",
              }),
              (0, s.jsx)("meta", {
                name: "msapplication-TileColor",
                content: "#0f172a",
              }),
              (0, s.jsx)("meta", { name: "theme-color", content: "#0f172a" }),
              (0, s.jsx)("meta", {
                name: "google-site-verification",
                content: "DCl7VAf9tcz6eD9gb67NfkNnJ1PKRNcg8qQiwpbx9Lk",
              }),
            ],
          })
        );
      }
    },
    7211: function (e, t, a) {
      "use strict";
      (a.r(t),
        a.d(t, {
          default: function () {
            return k;
          },
        }));
      var s = a(5893),
        r = a(7294);
      function n() {
        return (0, s.jsx)("section", {
          id: "about",
          className: "mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24",
          "aria-label": "About me",
          children: (0, s.jsxs)("div", {
            children: [
              // (0, s.jsx)("div", {
              //   className:
              //     "sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:mx-auto lg:w-full lg:px-0 lg:py-0",
              //   children: (0, s.jsx)("h2", {
              //     className:
              //       "text-sm font-bold uppercase tracking-widest text-slate-200",
              //     children: "About",
              //   }),
              // }),
              (0, s.jsxs)("div", {
                //./files/images/salim.png
                children: [
                  (0, s.jsx)("img", {
                    src: "./files/images/profile.png",
                    alt: "Executive Profile",
                    className: "mb-4 w-full",
                    style: {
                      height: "400px",
                      width: "300px",
                      clipPath: "inset(0px 0px 50px 0px)",
                    },
                  }),

                  (0, s.jsx)("p", {
                    className: "mb-4 text-2xl font-bold",
                    children: "Executive Profile",
                  }),
                  (0, s.jsx)("p", {
                    className: "mb-4",
                    children:
                      "Hi there! I'm Salim. Results-driven Senior Software Engineer specializing in cross-platform mobile app development with over 7 years of dedicated experience in Flutter and hands-on expertise in backend systems using Laravel. Proven track record of architecting, building, and deploying 50+ production-ready mobile applications across global markets, including clients and agencies in Germany and India.",
                  }),
                  (0, s.jsx)("p", {
                    className: "mb-4 text-2xl font-bold",
                    children: "Experiences",
                  }),
                  (0, s.jsx)("p", {
                    className: "mb-4",
                    children:
                      "Over the course of more than six years in software engineering, I have driven end-to-end development across international firms and freelance projects. At Vitec Visual (Germany) for 2 years and 6 months, Sensussoft Software Private Limited (Germany/India) for 6 months, MetaDesign Services Limited (Germany) for 10 months, Borak Services Limited for 10 months, and through 2 years of independent client projects, I consistently architected, built, and maintained complex cross-platform and backend software systems.",
                  }),
                  (0, s.jsx)("p", {
                    className: "mb-4 text-2xl font-bold",
                    children: "Highlights",
                  }),
                  (0, s.jsx)("div", {
                    className: "mb-4",
                    children: (0, s.jsxs)("ul", {
                      style: { listStyleType: "disc" },
                      className: "list-none pl-0 space-y-1",
                      children: [
                        (0, s.jsx)("li", {
                          children:
                            "Design and develop advanced Flutter applications for cross-platform use.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Implement HTTP / DIO CRUD operations for seamless data handling.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Integrate Firebase services such as Authentication, Firestore, and others.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Work with backend APIs, ensuring smooth communication between app and server.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Fix bugs, optimize performance, and improve overall app stability.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Collaborate effectively in a team environment, following proper version control practices.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Manage and work with Google Play Console and App Store Connect.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Build and generate app bundles (AAB / IPA).",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Test applications in live environments and handle app publishing on the Play Store and App Store.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Convert Figma designs into fully functional Flutter applications.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Integrate third-party services such as Google Maps, Firebase, and other APIs.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Troubleshoot and fix issues in existing applications to enhance stability and performance.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Fix issues in live and server-connected Flutter applications.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Manage and track reports related to app bugs, server responses, and live fixes.",
                        }),
                        (0, s.jsx)("li", {
                          children: "Dio CRUD request handling.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "AWS Amplify DataStore, Storage, and Auth integration.",
                        }),
                        (0, s.jsx)("li", {
                          children: "Connect with related 3rd party APIs.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Finish ongoing Flutter app projects and fix HTTP issues.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Manage client communication and technical requirements.",
                        }),
                        (0, s.jsx)("li", {
                          children:
                            "Build Flutter applications and Laravel backend systems.",
                        }),
                        (0, s.jsx)("li", {
                          children: "Create custom Laravel REST APIs.",
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
        });
      }
      var i = a(7604);
      function l() {
        return (0, s.jsx)("div", {
          className:
            "absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg",
        });
      }
      var o = a(1365),
        c = a(4533);
      function d() {
        return (0, s.jsxs)("div", {
          children: [
            (0, s.jsx)("ol", {
              className: "group/list",
              children: [
                {
                  date: "2 years 6 months",
                  company: { name: "Vitec Visual", link: "#" },
                  positions: ["Sr. Software Engineer"],
                  desc: "Designed and developed advanced cross-platform Flutter applications. Converted Figma designs into functional code, handled HTTP/DIO CRUD operations, integrated Firebase services and 3rd-party APIs like Google Maps, and managed Play Store/App Store deployments (AAB/IPA).",
                  tech: [
                    "Flutter",
                    "Dart",
                    "Firebase",
                    "REST API",
                    "Dio",
                    "HTTP",
                    "Git",
                    "Figma",
                    "Google Maps",
                  ],
                },
                {
                  date: "6 months",
                  company: {
                    name: "Sensussoft Software Private Limited",
                    link: "#",
                  },
                  positions: ["Sr. Software Engineer"],
                  desc: "Fixed issues and optimized live, server-connected Flutter apps. Integrated backend APIs, managed Firebase Authentication/Firestore, resolved server-response bugs, and generated app bundles for store deployment.",
                  tech: [
                    "Flutter",
                    "Dart",
                    "Firebase",
                    "Firestore",
                    "HTTP",
                    "REST API",
                    "App Store Connect",
                    "Play Console",
                  ],
                },
                {
                  date: "10 months",
                  company: { name: "MetaDesign Services Limited", link: "#" },
                  positions: ["Software Engineer"],
                  desc: "Built cross-platform Flutter medical service applications. Implemented Dio CRUD requests, integrated AWS Amplify (DataStore, Storage, Auth), and integrated dynamic 3rd-party backend APIs.",
                  tech: [
                    "Flutter",
                    "Dart",
                    "AWS Amplify",
                    "Dio",
                    "REST API",
                    "Google Console",
                  ],
                },
                {
                  date: "10 months",
                  company: { name: "Borak Services Limited", link: "#" },
                  positions: ["Senior Mobile App Developer"],
                  desc: "Completed ongoing Flutter projects (including the 'Two It' social app). Managed HTTP and Firebase authentication fixes, resolved backend API issues, and led client issue resolutions.",
                  tech: [
                    "Flutter",
                    "Dart",
                    "Firebase",
                    "HTTP",
                    "Git",
                    "Google Console",
                  ],
                },
                {
                  date: "2 years",
                  company: { name: "Freelance & Local Clients", link: "#" },
                  positions: ["Freelance Software Engineer"],
                  desc: "Built end-to-end Flutter mobile applications and custom Laravel backends. Created and integrated REST APIs, developed database structures, and delivered full-stack mobile solutions.",
                  tech: [
                    "Flutter",
                    "Laravel",
                    "PHP",
                    "REST API",
                    "Firebase",
                    "MySQL",
                  ],
                },
              ].map((e, t) =>
                (0, s.jsx)(
                  "li",
                  {
                    className: "mb-12",
                    children: (0, s.jsxs)("div", {
                      className:
                        "group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50",
                      children: [
                        (0, s.jsx)(l, {}),
                        (0, s.jsx)("header", {
                          className:
                            "z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2",
                          "aria-label": e.date
                            .replace("—", "to")
                            .replace("Dec", "December"),
                          children: e.date || "",
                        }),
                        (0, s.jsxs)("div", {
                          className: "z-10 sm:col-span-6",
                          children: [
                            (0, s.jsx)("h3", {
                              className:
                                "font-medium leading-snug text-slate-200",
                              children: e.positions.map((t, a) =>
                                (0, s.jsx)(
                                  "div",
                                  {
                                    children:
                                      0 === a
                                        ? (0, s.jsx)(i.Z, {
                                            title: ""
                                              .concat(t, " \xb7 ")
                                              .concat(e.company.name),
                                            label: ""
                                              .concat(t, " at ")
                                              .concat(e.company.name),
                                            url: e.company.link,
                                            fill: !0,
                                          })
                                        : (0, s.jsx)("div", {
                                            className: "text-slate-500",
                                            "aria-hidden": "true",
                                            children: t,
                                          }),
                                  },
                                  a,
                                ),
                              ),
                            }),
                            (0, s.jsx)("p", {
                              className: "mt-2 text-sm leading-normal",
                              children: e.desc,
                            }),
                            e.links &&
                              (0, s.jsx)("ul", {
                                className: "mt-2 flex flex-wrap",
                                "aria-label": "Related links",
                                children: e.links.map((e, t) =>
                                  (0, s.jsx)(
                                    "li",
                                    {
                                      className: "mr-4",
                                      children: (0, s.jsxs)("a", {
                                        className:
                                          "relative mt-2 inline-flex items-center text-sm font-medium text-slate-300",
                                        href: e.url,
                                        target: "_blank",
                                        rel: "noreferrer noopener",
                                        "aria-label": "".concat(
                                          e.title,
                                          " (opens in a new tab)",
                                        ),
                                        children: [
                                          (0, s.jsx)(o.Z, {
                                            use: "link",
                                            className: "mr-1 h-3 w-3",
                                          }),
                                          (0, s.jsx)("span", {
                                            children: e.title,
                                          }),
                                        ],
                                      }),
                                    },
                                    t,
                                  ),
                                ),
                              }),
                            e.tech &&
                              (0, s.jsx)("ul", {
                                className: "mt-2 flex flex-wrap",
                                "aria-label": "Technologies used",
                                children: e.tech.map((e, t) =>
                                  (0, s.jsx)(
                                    "li",
                                    {
                                      className: "mr-1.5 mt-2",
                                      children: (0, s.jsx)(c.Z, { text: e }),
                                    },
                                    t,
                                  ),
                                ),
                              }),
                          ],
                        }),
                      ],
                    }),
                  },
                  t,
                ),
              ),
            }),
            (0, s.jsx)("div", {
              className: "mt-12",
              children: (0, s.jsx)(i.Z, {
                title: "View Full R\xe9sum\xe9",
                url: "/resume.pdf",
                className: "font-semibold text-slate-200",
              }),
            }),
          ],
        });
      }
      function m() {
        let e = "font-medium text-slate-400";
        return (0, s.jsx)("footer", {
          className: "max-w-md pb-16 text-sm text-slate-500 sm:pb-0",
          children: (0, s.jsxs)("p", {
            children: [
              "Flutter 7+ year experience",
              ", ",
              "laravel and fast api backend",
              ", ",

              "can build flutter android and ios app",
              ", ",

              "and",
              " ",

              "working as a freelancer as well",

              ". All reserver  © Salim Murshed",
            ],
          }),
        });
      }
      var p = a(1664),
        h = a.n(p);
      function u(e) {
        let { sections: t } = e;
        return (0, s.jsxs)("header", {
          className:
            "lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[48%] lg:flex-col lg:justify-between lg:py-24",
          children: [
            (0, s.jsxs)("div", {
              children: [
                (0, s.jsx)("h1", {
                  className:
                    "text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl",
                  children: (0, s.jsx)(h(), {
                    href: "/",
                    children: "Salim Murshed",
                  }),
                }),
                (0, s.jsx)("h2", {
                  className:
                    "mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl",
                  children: "Frontend Engineer",
                }),
                (0, s.jsx)("p", {
                  className: "mt-4 max-w-xs leading-normal",
                  children:
                    "Senior Software Engineer (Flutter) | Mobile & Backend Architecture",
                }),
                (0, s.jsx)("nav", {
                  className: "nav hidden lg:block",
                  "aria-label": "In-page jump links",
                  children: (0, s.jsx)("ul", {
                    className: "mt-16 w-max",
                    children: t.map((e, t) =>
                      e.hideFromNav
                        ? null
                        : (0, s.jsx)(
                            "li",
                            {
                              children: (0, s.jsxs)("a", {
                                className:
                                  "group flex items-center py-3 ".concat(
                                    0 === t ? "active" : "",
                                  ),
                                href: "#".concat(e.heading.toLowerCase()),
                                children: [
                                  (0, s.jsx)("span", {
                                    className:
                                      "nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none",
                                  }),
                                  (0, s.jsx)("span", {
                                    className:
                                      "nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200",
                                    children: e.heading,
                                  }),
                                ],
                              }),
                            },
                            t,
                          ),
                    ),
                  }),
                }),
              ],
            }),
            (0, s.jsx)("ul", {
              className: "ml-1 mt-8 flex items-center",
              "aria-label": "Social media",
              children: [
                {
                  title: "GitHub",
                  url: "https://github.com/salimmurshed/",
                  icon: "github",
                },
                {
                  title: "LinkedIn",
                  url: "https://www.linkedin.com/in/salim-murshed/",
                  icon: "linkedin",
                },
                {
                  title: "Facebook",
                  url: "https://www.facebook.com/salim.murshed.2024",
                  icon: "facebook",
                },
                {
                  title: "Instagram",
                  url: "https://instagram.com/",
                  icon: "instagram",
                },
                {
                  title: "Goodreads",
                  url: "mailto:salimmurshed12@gmail.com",
                  icon: "goodreads",
                },
              ].map((e, t) =>
                (0, s.jsx)(
                  "li",
                  {
                    className: "mr-5 shrink-0 text-xs",
                    children: (0, s.jsxs)("a", {
                      className: "block",
                      href: e.url,
                      target: "_blank",
                      rel: "noreferrer noopener",
                      "aria-label": "".concat(e.title, " (opens in a new tab)"),
                      title: e.title,
                      children: [
                        (0, s.jsx)("span", {
                          className: "sr-only",
                          children: e.title,
                        }),
                        (0, s.jsx)(o.Z, {
                          use: e.icon,
                          className:
                            "twitter-x" === e.icon ? "h-5 w-5" : "h-6 w-6",
                        }),
                      ],
                    }),
                  },
                  t,
                ),
              ),
            }),
          ],
        });
      }
      var g = a(5675),
        x = a.n(g);
      function f(e) {
        let { title: t, url: a, className: r, border: n = !0 } = e,
          i = t.trim().split(" "),
          l = i.pop(),
          c = i.join(" "),
          d = n ? "pb-px transition motion-reduce:transition-none" : "";
        return (0, s.jsx)(h(), {
          className:
            "inline-flex items-center font-medium leading-tight text-slate-200 ".concat(
              r,
              " group",
            ),
          href: a,
          "aria-label": t,
          children: (0, s.jsxs)("span", {
            children: [
              (0, s.jsxs)("span", { className: d, children: [c, " "] }),
              (0, s.jsxs)("span", {
                className: "whitespace-nowrap",
                children: [
                  (0, s.jsx)("span", { className: d, children: l }),
                  (0, s.jsx)(o.Z, {
                    use: "arrow-internal",
                    className:
                      "ml-1 inline-block h-4 w-4 shrink-0 -translate-y-px transition-transform group-hover:translate-x-2 group-focus-visible:translate-x-2 motion-reduce:transition-none",
                  }),
                ],
              }),
            ],
          }),
        });
      }
      function gtxx() {
        let [n, u] = (0, r.useState)(null);
        let [items, setItems] = (0, r.useState)([]);

        (0, r.useEffect)(() => {
          setItems([
            {
              src: "./files/images/gallery/1.png",
              alt: "Gallery 1",
              caption: "Caption 1",
            },
            {
              src: "./files/images/gallery/2.png",
              alt: "Gallery 2",
              caption: "Caption 2",
            },
            {
              src: "./files/images/gallery/3.png",
              alt: "Gallery 3",
              caption: "Caption 3",
            },
            {
              src: "./files/images/gallery/4.png",
              alt: "Gallery 4",
              caption: "Caption 4",
            },
            {
              src: "./files/images/gallery/5.png",
              alt: "Gallery 5",
              caption: "Caption 5",
            },
            {
              src: "./files/images/gallery/6.png",
              alt: "Gallery 6",
              caption: "Caption 6",
            },
            {
              src: "./files/images/gallery/7.png",
              alt: "Gallery 7",
              caption: "Caption 7",
            },
            {
              src: "./files/images/gallery/8.png",
              alt: "Gallery 8",
              caption: "Caption 8",
            },
            {
              src: "./files/images/gallery/9.png",
              alt: "Gallery 9",
              caption: "Caption 9",
            },
            {
              src: "./files/images/gallery/10.png",
              alt: "Gallery 10",
              caption: "Caption 10",
            },
            {
              src: "./files/images/gallery/11.png",
              alt: "Gallery 11",
              caption: "Caption 11",
            },
            {
              src: "./files/images/gallery/12.png",
              alt: "Gallery 12",
              caption: "Caption 12",
            },
            {
              src: "./files/images/gallery/13.png",
              alt: "Gallery 13",
              caption: "Caption 13",
            },
            {
              src: "./files/images/gallery/14.png",
              alt: "Gallery 14",
              caption: "Caption 14",
            },
            {
              src: "./files/images/gallery/15.png",
              alt: "Gallery 15",
              caption: "Caption 15",
            },
            {
              src: "./files/images/gallery/16.png",
              alt: "Gallery 16",
              caption: "Caption 16",
            },
            {
              src: "./files/images/gallery/17.png",
              alt: "Gallery 17",
              caption: "Caption 17",
            },
            {
              src: "./files/images/gallery/18.png",
              alt: "Gallery 18",
              caption: "Caption 18",
            },
          ]);
        }, []);

        (0, r.useEffect)(() => {
          if (n === null || items.length === 0) return;
          let e = (e) => {
            if (e.key === "Escape") u(null);
            if (e.key === "ArrowRight") u((n + 1) % items.length);
            if (e.key === "ArrowLeft") u((n - 1 + items.length) % items.length);
          };
          window.addEventListener("keydown", e);
          return () => window.removeEventListener("keydown", e);
        }, [n, items.length]);

        return (0, s.jsxs)("div", {
          children: [
            (0, s.jsx)("ul", {
              // flex-wrap lets images wrap into rows naturally
              className: "flex flex-wrap gap-4",
              "aria-label": "Image gallery",
              children: items.map((e, t) =>
                (0, s.jsx)(
                  "li",
                  {
                    // calc(33.333% - 11px) guarantees exactly 3 images per row accounting for gap-4 (16px)
                    style: { width: "calc(33.333% - 11px)" },
                    className: "shrink-0",
                    children: (0, s.jsx)("button", {
                      type: "button",
                      className:
                        "group relative block w-full overflow-hidden rounded border-2 border-slate-200/10 transition hover:border-slate-200/30",
                      onClick: () => u(t),
                      "aria-label": "Open image: ".concat(e.caption || ""),
                      children: (0, s.jsx)("img", {
                        className:
                          "aspect-square w-full object-cover transition duration-200 group-hover:scale-105",
                        src: e.src,
                        alt: e.alt || "",
                        loading: "lazy",
                      }),
                    }),
                  },
                  t,
                ),
              ),
            }),
            n !== null &&
              items[n] &&
              (0, s.jsx)("div", {
                className:
                  "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4",
                role: "dialog",
                "aria-modal": "true",
                onClick: () => u(null),
                children: (0, s.jsxs)("div", {
                  className: "relative max-h-full max-w-3xl",
                  onClick: (e) => e.stopPropagation(),
                  children: [
                    (0, s.jsx)("img", {
                      className: "max-h-[80vh] w-auto rounded",
                      src: items[n].src,
                      alt: items[n].alt || "",
                    }),
                    (0, s.jsx)("p", {
                      className: "mt-2 text-center text-sm text-slate-300",
                      children: items[n].caption || "",
                    }),
                    (0, s.jsx)("button", {
                      type: "button",
                      className:
                        "absolute -top-10 right-0 text-sm font-medium text-slate-300 hover:text-slate-100",
                      onClick: () => u(null),
                      "aria-label": "Close",
                      children: (0, s.jsx)(o.Z, {
                        use: "x",
                        className: "h-5 w-5",
                      }),
                    }),
                    (0, s.jsx)("button", {
                      type: "button",
                      className:
                        "absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-100",
                      onClick: () => u((n - 1 + items.length) % items.length),
                      "aria-label": "Previous image",
                      children: (0, s.jsx)(o.Z, {
                        use: "chevron-left",
                        className: "h-6 w-6",
                      }),
                    }),
                    (0, s.jsx)("button", {
                      type: "button",
                      className:
                        "absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-100",
                      onClick: () => u((n + 1) % items.length),
                      "aria-label": "Next image",
                      children: (0, s.jsx)(o.Z, {
                        use: "chevron-right",
                        className: "h-6 w-6",
                      }),
                    }),
                  ],
                }),
              }),
          ],
        });
      }
      function b() {
        let e = (e) => {
          let { repoUrl: t } = e,
            [a, n] = (0, r.useState)(null);
          return ((0, r.useEffect)(() => {
            let e = t.split("/")[4];
            fetch("https://api.github.com/repos/salimmurshed/".concat(e))
              .then((e) => e.json())
              .then((e) => {
                let { stargazers_count: t } = e;
                n(t);
              })
              .catch((e) => console.error(e));
          }, [t]),
          a)
            ? (0, s.jsxs)("a", {
                className:
                  "relative mt-2 inline-flex items-center text-sm font-medium text-slate-300",
                href: t,
                target: "_blank",
                rel: "noreferrer noopener",
                "aria-label": "".concat(
                  a,
                  " stars on GitHub (opens in a new tab)",
                ),
                children: [
                  (0, s.jsx)(o.Z, { use: "star", className: "mr-1 h-3 w-3" }),
                  (0, s.jsx)("span", {
                    children: Number(a).toLocaleString("en", {
                      useGrouping: !0,
                    }),
                  }),
                ],
              })
            : null;
        };
        return (0, s.jsxs)("div", {
          children: [
            (0, s.jsx)("ul", {
              className: "group/list",
              children: [
                {
                  title: "Wholesale & Retailer app",
                  link: "https://github.com/salimmurshed/bingo_business",
                  image: "./files/images/bingo.png",
                  alt: "",
                  desc: "Spanish powerful wholesaler and retailer credit system purchase app under any financial institute money supervision.",

                  tech: ["Flutter", "Rest Api", "Firebase"],
                  github: "https://github.com/salimmurshed/bingo_business",
                },
                {
                  title: "MMA fight tournament organizer",
                  link: "",
                  image: "./files/images/rmn.png",
                  alt: "",
                  desc: "World wide MMA fight organizer, organize and call all fighter to play match in different venue.",

                  tech: ["Flutter", "Rest Api", "Firebase"],
                  github: "https://github.com/salimmurshed/rmn",
                },
                {
                  title: "Party song playlist creator on spotify",
                  link: "",
                  image: "./files/images/spot.png",
                  alt: "",
                  desc: "Create playlist on spotify for various type of party songs for different customs.",
                  download: "https://github.com/salimmurshed/spotParty",
                  tech: ["Flutter", "Rest Api", "Spotify API", "Firebase"],
                },
                {
                  title: "Date making app",
                  link: "",
                  image: "./files/images/twoit.png",
                  alt: "",
                  desc: "Date maker app, swipe to find new connection worldwide.",
                  tech: ["Gatsby", "Styled Components", "Netlify"],
                  github: "https://github.com/salimmurshed/two-it-app",
                  tech: ["Flutter", "Rest Api", "Firebase"],
                },
              ].map((t, a) =>
                (0, s.jsx)(
                  "li",
                  {
                    className: "mb-12",
                    children: (0, s.jsxs)("div", {
                      className:
                        "group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50",
                      children: [
                        (0, s.jsx)(l, {}),
                        (0, s.jsxs)("div", {
                          className: "z-10 sm:order-2 sm:col-span-6",
                          children: [
                            (0, s.jsx)("h3", {
                              children: (0, s.jsx)(i.Z, {
                                title: t.title,
                                url: t.github,
                                fill: !0,
                              }),
                            }),
                            (0, s.jsx)("p", {
                              className: "mt-2 text-sm leading-normal",
                              children: t.desc,
                            }),
                            t.github && (0, s.jsx)(e, { repoUrl: t.github }),
                            t.download &&
                              (0, s.jsxs)("a", {
                                className:
                                  "relative mt-2 inline-flex items-center text-sm font-medium text-slate-300",
                                href: t.download,
                                target: "_blank",
                                rel: "",
                                "aria-label":
                                  "Over 100,000 installs on Visual Studio Code Marketplace (opens in a new tab)",
                                children: [
                                  (0, s.jsx)(o.Z, {
                                    use: "download",
                                    className: "mr-1 h-4 w-4",
                                  }),
                                  (0, s.jsx)("span", {
                                    children: "100k+ Installs",
                                  }),
                                ],
                              }),
                            t.tech &&
                              (0, s.jsx)("ul", {
                                className: "mt-2 flex flex-wrap",
                                "aria-label": "Technologies used:",
                                children: t.tech.map((e, t) =>
                                  (0, s.jsx)(
                                    "li",
                                    {
                                      className: "mr-1.5 mt-2",
                                      children: (0, s.jsx)(c.Z, { text: e }),
                                    },
                                    t,
                                  ),
                                ),
                              }),
                          ],
                        }),
                        (0, s.jsx)("img", {
                          className:
                            "aspect-video bg-white object-cover rounded border-2 border-slate-200/10 transition group-hover:border-slate-200/30 sm:order-1 sm:col-span-2 sm:translate-y-1",
                          src: t.image,
                          alt: t.alt,
                          width: 200,
                          height: 48,
                        }),
                      ],
                    }),
                  },
                  a,
                ),
              ),
            }),
            (0, s.jsx)("div", {
              className: "mt-12",
              children: (0, s.jsx)(f, {
                title: "View Full Project Archive",
                url: "https://github.com/salimmurshed?tab=repositories",
                target: "_blank",
                className: "font-semibold text-slate-200",
              }),
            }),
          ],
        });
      }
      var w = a(8425),
        v = a(4910);
      function j() {
        let [e, t] = (0, r.useState)(null);
        return (0, s.jsx)("div", {
          ref: t,
          className: "absolute bottom-0 right-0",
          children: (0, s.jsxs)(v.fC, {
            children: [
              (0, s.jsx)(v.xz, {
                asChild: !0,
                children: (0, s.jsxs)("button", {
                  className:
                    "hover:-text-teal-300 inline-flex items-center px-2 py-4 font-medium text-slate-400 hover:-translate-y-2",
                  children: [
                    (0, s.jsx)("span", {
                      className: "sr-only",
                      children: "Click to time travel",
                    }),
                    (0, s.jsx)(x(), {
                      src: "./files/rotate.gif",
                      alt: "Spinning Tardis from Doctor Who",
                      width: 100,
                      height: 86,
                    }),
                  ],
                }),
              }),
              (0, s.jsxs)(v.h_, {
                container: e,
                children: [
                  (0, s.jsx)(v.aV, {
                    className:
                      "DialogOverlay portal fixed left-0 top-0 z-40 h-screen w-screen bg-slate-900/10 backdrop-blur transition",
                    children: (0, s.jsxs)("div", {
                      className: "portal-inner",
                      children: [
                        (0, s.jsx)("div", {}),
                        (0, s.jsx)("div", {}),
                        (0, s.jsx)("div", {}),
                        (0, s.jsx)("div", {}),
                        (0, s.jsx)("div", {}),
                      ],
                    }),
                  }),
                  (0, s.jsxs)(v.VY, {
                    className:
                      "DialogContent fixed left-1/2 top-1/2 z-40 flex h-full w-full -translate-x-1/2 -translate-y-1/2 justify-center rounded sm:items-center",
                    children: [
                      (0, s.jsx)(v.x8, {
                        asChild: !0,
                        className: "absolute right-0 top-0",
                        children: (0, s.jsx)("button", {
                          className:
                            "p-4 hover:text-slate-200 focus-visible:text-slate-200",
                          "aria-label": "Close",
                          children: (0, s.jsx)(o.Z, {
                            use: "close",
                            className: "h-7 w-7",
                          }),
                        }),
                      }),
                      (0, s.jsx)("div", {
                        style: { perspective: "400px" },
                        children: (0, s.jsxs)("div", {
                          className: "star-wars-skew",
                          children: [
                            (0, s.jsx)(v.Dx, {
                              className:
                                "mx-auto mb-12 max-w-xs text-center text-2xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-3xl lg:max-w-md lg:text-4xl",
                              children:
                                "Looking for a different site? Go back in time...",
                            }),
                            (0, s.jsx)("div", {
                              className: "flex justify-center",
                              children: (0, s.jsx)("ul", {
                                className:
                                  "inline-grid grid-cols-1 gap-2 md:grid-cols-2",
                                "aria-label":
                                  "Previous iterations of salimmurshed.vercel.app/",
                                children: [
                                  {
                                    title: "v1",
                                    label: "version 1",
                                    url: "https://v1.salimmurshed.vercel.app/",
                                    image: "/images/old/v1.png",
                                  },
                                  {
                                    title: "v2",
                                    label: "version 2",
                                    url: "https://v2.salimmurshed.vercel.app/",
                                    image: "/images/old/v2.png",
                                  },
                                  {
                                    title: "v3",
                                    label: "version 3",
                                    url: "https://v3.salimmurshed.vercel.app/",
                                    image: "/images/old/v3.png",
                                  },
                                  {
                                    title: "v4",
                                    label: "version 4",
                                    url: "https://v4.salimmurshed.vercel.app/",
                                    image: "/images/old/v4.png",
                                  },
                                ].map((e, t) =>
                                  (0, s.jsx)(
                                    "li",
                                    {
                                      children: (0, s.jsxs)("a", {
                                        className:
                                          "group relative block transition-all",
                                        href: e.url,
                                        "aria-label":
                                          "salimmurshed.vercel.app/ ".concat(
                                            e.label,
                                          ),
                                        children: [
                                          (0, s.jsx)(x(), {
                                            className:
                                              "mx-auto rounded border-2 border-zinc-900/30 drop-shadow-md group-hover:drop-shadow-xl",
                                            src: e.image,
                                            alt: "Screenshot of salimmurshed.vercel.app/ ".concat(
                                              e.label,
                                            ),
                                            width: 180,
                                            height: 48,
                                          }),
                                          (0, s.jsx)("div", {
                                            className:
                                              "absolute left-0 top-0 hidden h-full w-full items-center justify-center rounded border-4 border-teal-400/0 bg-zinc-900/30 align-middle opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:flex",
                                            children: (0, s.jsx)("h3", {
                                              className:
                                                "not-sr-only text-xl font-semibold text-white",
                                              children: e.title,
                                            }),
                                          }),
                                        ],
                                      }),
                                    },
                                    t,
                                  ),
                                ),
                              }),
                            }),
                          ],
                        }),
                      }),
                      (0, s.jsx)("a", {
                        className:
                          "absolute inset-x-0 bottom-0 z-40 block p-8 text-center text-xs text-slate-500 underline hover:text-slate-200 focus-visible:text-slate-200 sm:left-auto md:p-4",
                        href: "https://codepen.io/jasesmith/pen/qqgvZe",
                        target: "_blank",
                        rel: "noreferrer noopener",
                        "aria-label":
                          "Credit: A Portal to Tomorrow by @jasesmith (opens CodePen in a new tab)",
                        children: "A Portal to Tomorrow by @jasesmith",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        });
      }
      function y() {
        return (0, s.jsx)("div", {
          children: (0, s.jsx)("ul", {
            className: "group/list",
            children: [
              {
                title:
                  "signing Configs create jks/keystore file & storeFile dynamic",
                date: "2026",
                url: "https://medium.com/@salimmurshed12/signing-configs-create-jks-keystore-file-storefile-dynamic-96fb7b9bd7c1?source=user_profile_page---------3-------------379c024dcaaa----------------------",
                image: {
                  src: "./files/images/sign.png",
                  alt: "",
                },
              },
              {
                title:
                  "Flutter Project Structure with MVVM + Stacked Architecture folder naming",
                date: "2024",
                url: "https://medium.com/@salimmurshed12/signing-configs-create-jks-keystore-file-storefile-dynamic-96fb7b9bd7c1?source=user_profile_page---------3-------------379c024dcaaa----------------------",
                image: {
                  src: "./files/images/mvvm.png",
                  alt: "",
                },
              },
              {
                title: "How to center a container vertically in flutter?",
                date: "2020",
                url: "https://stackoverflow.com/questions/63804546/how-to-center-a-container-vertically-in-flutter/63804901#63804901",
                image: {
                  src: "./files/images/center.png",
                  alt: "",
                },
              },
              {
                title: "Flutter : Unable to load image asset",
                date: "2024",
                url: "https://stackoverflow.com/questions/64158543/flutter-unable-to-load-image-asset/64160483#64160483",
                image: {
                  src: "./files/images/assets.png",
                  alt: "",
                },
              },
              {
                title:
                  "Flutter: My Listview.builder disappears under my Fixed bottom Container",
                date: "2024",
                url: "https://stackoverflow.com/questions/63954580/flutter-my-listview-builder-disappears-under-my-fixed-bottom-container/63957325#63957325",
                image: {
                  src: "./files/images/list.png",
                  alt: "",
                },
              },
            ].map((e, t) =>
              (0, s.jsx)(
                "li",
                {
                  className: "mb-12",
                  children: (0, s.jsxs)("div", {
                    className:
                      "group relative grid grid-cols-8 gap-4 transition-all sm:items-center sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50",
                    children: [
                      (0, s.jsx)(l, {}),
                      (0, s.jsx)("img", {
                        className:
                          "z-10 col-span-2 aspect-video rounded border-2 border-slate-200/10 object-cover transition group-hover:border-slate-200/30 sm:col-span-2",
                        src: e.image.src,
                        alt: e.image.alt,
                        width: 200,
                        height: 48,
                      }),
                      (0, s.jsxs)("div", {
                        className: "z-10 col-span-6",
                        children: [
                          (0, s.jsx)("p", {
                            className: "-mt-1 text-sm font-semibold leading-6",
                            children: e.date,
                          }),
                          (0, s.jsx)("h3", {
                            className: "-mt-1",
                            children: (0, s.jsx)(i.Z, {
                              title: e.title,
                              url: e.url,
                              fill: !0,
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                },
                t,
              ),
            ),
          }),
        });
      }
      function k() {
        let e = (0, r.useRef)([]);
        (0, r.useEffect)(() => {
          let t = document.querySelector(".nav");
          if (!t || window.innerWidth < 1024) return;
          let a = "active",
            s = new IntersectionObserver(
              (e) => {
                e.forEach((e) => {
                  if (e.isIntersecting) {
                    let s = t.querySelector("a[href].".concat(a));
                    null == s || s.classList.remove(a);
                    let r = t.querySelector(
                      'a[href="#'.concat(e.target.id, '"]'),
                    );
                    null == r || r.classList.add(a);
                  }
                });
              },
              { rootMargin: "0% 0% -".concat(70, "% 0%"), threshold: 0 },
            );
          e.current.forEach((e) => {
            e && s.observe(e);
          });
        }, []);
        let t = [
          { heading: "About", label: "About me", component: (0, s.jsx)(n, {}) },
          {
            heading: "Experience",
            label: "Work experience",
            component: (0, s.jsx)(d, {}),
          },
          {
            heading: "Projects",
            label: "Selected projects",
            component: (0, s.jsx)(b, {}),
          },
          {
            heading: "Writing",
            label: "Blog posts",
            component: (0, s.jsx)(y, {}),
            // hideFromNav: !0,
          },
          {
            heading: "Gallery",
            label: "Image gallery",
            component: (0, s.jsx)(gtxx, {}),
          },
        ];
        return (0, s.jsxs)("div", {
          className: "lg:flex lg:justify-between lg:gap-4",
          children: [
            (0, s.jsx)(w.Z, { pathname: "/", title: "Salim Murshed" }),
            (0, s.jsx)(u, { sections: t }),
            (0, s.jsxs)("main", {
              id: "content",
              className: "pt-24 lg:w-[52%] lg:py-24",
              children: [
                t.map((t, a) =>
                  (0, s.jsxs)(
                    "section",
                    {
                      id: t.heading ? t.heading.toLowerCase() : `section-${a}`,
                      className: "mb-16 scroll-mt-16 md:mb-24 lg:scroll-mt-24",
                      "aria-label": t.label || t.heading,
                      ref: (el) => (e.current[a] = el),
                      children: [
                        (0, s.jsx)("div", {
                          className:
                            "sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:mx-auto lg:w-full lg:px-0 lg:py-0",
                          children: (0, s.jsx)("h2", {
                            className:
                              "text-2xl font-bold uppercase tracking-widest text-slate-200",
                            style: {
                              fontFamily: "'Big Shoulders Inline', display",
                            },
                            children: t.heading || "Default Title",
                          }),
                        }),
                        t.component || null,
                      ],
                    },
                    a,
                  ),
                ),
                (0, s.jsx)(m, {}),
              ],
            }),
            (0, s.jsx)(j, {}),
          ],
        });
      }
    },
  },
  function (e) {
    (e.O(0, [664, 506, 774, 888, 179], function () {
      return e((e.s = 8312));
    }),
      (_N_E = e.O()));
  },
]);
