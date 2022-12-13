var Kl = Object.defineProperty;
var ec = (t, e, n) => e in t ? Kl(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var Se = (t, e, n) => (ec(t, typeof e != "symbol" ? e + "" : e, n), n);
import { ref as tc, proxyRefs as Oi, openBlock as M, createElementBlock as L, Fragment as Nt, createElementVNode as F, createCommentVNode as re, toDisplayString as _e, normalizeClass as zn, pushScopeId as ms, popScopeId as gs, resolveComponent as ir, renderList as Bn, normalizeStyle as nc, createBlock as or, createTextVNode as Hn } from "vue";
/**
  * vue-class-component v8.0.0-rc.1
  * (c) 2015-present Evan You
  * @license MIT
  */
function Ei(t, e) {
  if (!(t instanceof e))
    throw new TypeError("Cannot call a class as a function");
}
function Ai(t, e) {
  for (var n = 0; n < e.length; n++) {
    var s = e[n];
    s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(t, s.key, s);
  }
}
function sc(t, e, n) {
  return e && Ai(t.prototype, e), n && Ai(t, n), t;
}
function rc(t, e, n) {
  return e in t ? Object.defineProperty(t, e, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = n, t;
}
function Ci(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t);
    e && (s = s.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function Ws(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ci(Object(n), !0).forEach(function(s) {
      rc(t, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ci(Object(n)).forEach(function(s) {
      Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return t;
}
function ic(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), e && ar(t, e);
}
function Kn(t) {
  return Kn = Object.setPrototypeOf ? Object.getPrototypeOf : function(n) {
    return n.__proto__ || Object.getPrototypeOf(n);
  }, Kn(t);
}
function ar(t, e) {
  return ar = Object.setPrototypeOf || function(s, r) {
    return s.__proto__ = r, s;
  }, ar(t, e);
}
function oc() {
  if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham)
    return !1;
  if (typeof Proxy == "function")
    return !0;
  try {
    return Date.prototype.toString.call(Reflect.construct(Date, [], function() {
    })), !0;
  } catch {
    return !1;
  }
}
function ac(t) {
  if (t === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return t;
}
function lc(t, e) {
  return e && (typeof e == "object" || typeof e == "function") ? e : ac(t);
}
function cc(t) {
  var e = oc();
  return function() {
    var s = Kn(t), r;
    if (e) {
      var i = Kn(this).constructor;
      r = Reflect.construct(s, arguments, i);
    } else
      r = s.apply(this, arguments);
    return lc(this, r);
  };
}
function uc(t) {
  return fc(t) || hc(t) || dc(t) || pc();
}
function fc(t) {
  if (Array.isArray(t))
    return lr(t);
}
function hc(t) {
  if (typeof Symbol < "u" && Symbol.iterator in Object(t))
    return Array.from(t);
}
function dc(t, e) {
  if (!!t) {
    if (typeof t == "string")
      return lr(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set")
      return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return lr(t, e);
  }
}
function lr(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, s = new Array(e); n < e; n++)
    s[n] = t[n];
  return s;
}
function pc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function En(t, e, n) {
  Object.defineProperty(t, e, {
    get: n,
    enumerable: !1,
    configurable: !0
  });
}
function mc(t, e, n) {
  Object.defineProperty(t, e, {
    get: function() {
      return n[e].value;
    },
    set: function(r) {
      n[e].value = r;
    },
    enumerable: !0,
    configurable: !0
  });
}
function gc(t) {
  var e = Object.getPrototypeOf(t.prototype);
  if (!!e)
    return e.constructor;
}
function An(t, e) {
  return t.hasOwnProperty(e) ? t[e] : void 0;
}
var Do = /* @__PURE__ */ function() {
  function t(e, n) {
    var s = this;
    Ei(this, t), En(this, "$props", function() {
      return e;
    }), En(this, "$attrs", function() {
      return n.attrs;
    }), En(this, "$slots", function() {
      return n.slots;
    }), En(this, "$emit", function() {
      return n.emit;
    }), Object.keys(e).forEach(function(r) {
      Object.defineProperty(s, r, {
        enumerable: !1,
        configurable: !0,
        writable: !0,
        value: e[r]
      });
    });
  }
  return sc(t, null, [{
    key: "registerHooks",
    value: function(n) {
      var s;
      (s = this.__h).push.apply(s, uc(n));
    }
  }, {
    key: "with",
    value: function(n) {
      var s = new n(), r = {};
      Object.keys(s).forEach(function(o) {
        var a = s[o];
        r[o] = a != null ? a : null;
      });
      var i = /* @__PURE__ */ function(o) {
        ic(l, o);
        var a = cc(l);
        function l() {
          return Ei(this, l), a.apply(this, arguments);
        }
        return l;
      }(this);
      return i.__b = {
        props: r
      }, i;
    }
  }, {
    key: "__vccOpts",
    get: function() {
      if (this === yn)
        return {};
      var n = this, s = An(n, "__c");
      if (s)
        return s;
      var r = Ws({}, An(n, "__o"));
      n.__c = r;
      var i = gc(n);
      i && (r.extends = i.__vccOpts);
      var o = An(n, "__b");
      o && (r.mixins = r.mixins || [], r.mixins.unshift(o)), r.methods = Ws({}, r.methods), r.computed = Ws({}, r.computed);
      var a = n.prototype;
      Object.getOwnPropertyNames(a).forEach(function(u) {
        if (u !== "constructor") {
          if (n.__h.indexOf(u) > -1) {
            r[u] = a[u];
            return;
          }
          var f = Object.getOwnPropertyDescriptor(a, u);
          if (typeof f.value == "function") {
            r.methods[u] = f.value;
            return;
          }
          if (f.get || f.set) {
            r.computed[u] = {
              get: f.get,
              set: f.set
            };
            return;
          }
        }
      }), r.setup = function(u, f) {
        var d, h = new n(u, f), y = Object.keys(h), b = {}, m = null;
        return y.forEach(function(k) {
          h[k] === void 0 || h[k] && h[k].__s || (b[k] = tc(h[k]), mc(h, k, b));
        }), y.forEach(function(k) {
          if (h[k] && h[k].__s) {
            var P = h[k].__s();
            P instanceof Promise ? (m || (m = Promise.resolve(b)), m = m.then(function() {
              return P.then(function(te) {
                return b[k] = Oi(te), b;
              });
            })) : b[k] = Oi(P);
          }
        }), (d = m) !== null && d !== void 0 ? d : b;
      };
      var l = An(n, "__d");
      l && l.forEach(function(u) {
        return u(r);
      });
      var c = ["render", "ssrRender", "__file", "__cssModules", "__scopeId", "__hmrId"];
      return c.forEach(function(u) {
        n[u] && (r[u] = n[u]);
      }), r;
    }
  }]), t;
}();
Do.__h = ["data", "beforeCreate", "created", "beforeMount", "mounted", "beforeUnmount", "unmounted", "beforeUpdate", "updated", "activated", "deactivated", "render", "errorCaptured", "serverPrefetch"];
var yn = Do;
function ys(t) {
  return function(e) {
    return e.__o = t, e;
  };
}
function Lr(t) {
  return function(e, n, s) {
    var r = typeof e == "function" ? e : e.constructor;
    r.__d || (r.__d = []), typeof s != "number" && (s = void 0), r.__d.push(function(i) {
      return t(i, n, s);
    });
  };
}
//! moment.js
//! version : 2.29.4
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
var Oo;
function w() {
  return Oo.apply(null, arguments);
}
function yc(t) {
  Oo = t;
}
function Ne(t) {
  return t instanceof Array || Object.prototype.toString.call(t) === "[object Array]";
}
function kt(t) {
  return t != null && Object.prototype.toString.call(t) === "[object Object]";
}
function I(t, e) {
  return Object.prototype.hasOwnProperty.call(t, e);
}
function Nr(t) {
  if (Object.getOwnPropertyNames)
    return Object.getOwnPropertyNames(t).length === 0;
  var e;
  for (e in t)
    if (I(t, e))
      return !1;
  return !0;
}
function be(t) {
  return t === void 0;
}
function it(t) {
  return typeof t == "number" || Object.prototype.toString.call(t) === "[object Number]";
}
function bn(t) {
  return t instanceof Date || Object.prototype.toString.call(t) === "[object Date]";
}
function Eo(t, e) {
  var n = [], s, r = t.length;
  for (s = 0; s < r; ++s)
    n.push(e(t[s], s));
  return n;
}
function dt(t, e) {
  for (var n in e)
    I(e, n) && (t[n] = e[n]);
  return I(e, "toString") && (t.toString = e.toString), I(e, "valueOf") && (t.valueOf = e.valueOf), t;
}
function Ge(t, e, n, s) {
  return Xo(t, e, n, s, !0).utc();
}
function bc() {
  return {
    empty: !1,
    unusedTokens: [],
    unusedInput: [],
    overflow: -2,
    charsLeftOver: 0,
    nullInput: !1,
    invalidEra: null,
    invalidMonth: null,
    invalidFormat: !1,
    userInvalidated: !1,
    iso: !1,
    parsedDateParts: [],
    era: null,
    meridiem: null,
    rfc2822: !1,
    weekdayMismatch: !1
  };
}
function A(t) {
  return t._pf == null && (t._pf = bc()), t._pf;
}
var cr;
Array.prototype.some ? cr = Array.prototype.some : cr = function(t) {
  var e = Object(this), n = e.length >>> 0, s;
  for (s = 0; s < n; s++)
    if (s in e && t.call(this, e[s], s, e))
      return !0;
  return !1;
};
function qr(t) {
  if (t._isValid == null) {
    var e = A(t), n = cr.call(e.parsedDateParts, function(r) {
      return r != null;
    }), s = !isNaN(t._d.getTime()) && e.overflow < 0 && !e.empty && !e.invalidEra && !e.invalidMonth && !e.invalidWeekday && !e.weekdayMismatch && !e.nullInput && !e.invalidFormat && !e.userInvalidated && (!e.meridiem || e.meridiem && n);
    if (t._strict && (s = s && e.charsLeftOver === 0 && e.unusedTokens.length === 0 && e.bigHour === void 0), Object.isFrozen == null || !Object.isFrozen(t))
      t._isValid = s;
    else
      return s;
  }
  return t._isValid;
}
function bs(t) {
  var e = Ge(NaN);
  return t != null ? dt(A(e), t) : A(e).userInvalidated = !0, e;
}
var Mi = w.momentProperties = [], Gs = !1;
function Ir(t, e) {
  var n, s, r, i = Mi.length;
  if (be(e._isAMomentObject) || (t._isAMomentObject = e._isAMomentObject), be(e._i) || (t._i = e._i), be(e._f) || (t._f = e._f), be(e._l) || (t._l = e._l), be(e._strict) || (t._strict = e._strict), be(e._tzm) || (t._tzm = e._tzm), be(e._isUTC) || (t._isUTC = e._isUTC), be(e._offset) || (t._offset = e._offset), be(e._pf) || (t._pf = A(e)), be(e._locale) || (t._locale = e._locale), i > 0)
    for (n = 0; n < i; n++)
      s = Mi[n], r = e[s], be(r) || (t[s] = r);
  return t;
}
function wn(t) {
  Ir(this, t), this._d = new Date(t._d != null ? t._d.getTime() : NaN), this.isValid() || (this._d = new Date(NaN)), Gs === !1 && (Gs = !0, w.updateOffset(this), Gs = !1);
}
function qe(t) {
  return t instanceof wn || t != null && t._isAMomentObject != null;
}
function Ao(t) {
  w.suppressDeprecationWarnings === !1 && typeof console < "u" && console.warn && console.warn("Deprecation warning: " + t);
}
function Me(t, e) {
  var n = !0;
  return dt(function() {
    if (w.deprecationHandler != null && w.deprecationHandler(null, t), n) {
      var s = [], r, i, o, a = arguments.length;
      for (i = 0; i < a; i++) {
        if (r = "", typeof arguments[i] == "object") {
          r += `
[` + i + "] ";
          for (o in arguments[0])
            I(arguments[0], o) && (r += o + ": " + arguments[0][o] + ", ");
          r = r.slice(0, -2);
        } else
          r = arguments[i];
        s.push(r);
      }
      Ao(
        t + `
Arguments: ` + Array.prototype.slice.call(s).join("") + `
` + new Error().stack
      ), n = !1;
    }
    return e.apply(this, arguments);
  }, e);
}
var Pi = {};
function Co(t, e) {
  w.deprecationHandler != null && w.deprecationHandler(t, e), Pi[t] || (Ao(e), Pi[t] = !0);
}
w.suppressDeprecationWarnings = !1;
w.deprecationHandler = null;
function Ze(t) {
  return typeof Function < "u" && t instanceof Function || Object.prototype.toString.call(t) === "[object Function]";
}
function wc(t) {
  var e, n;
  for (n in t)
    I(t, n) && (e = t[n], Ze(e) ? this[n] = e : this["_" + n] = e);
  this._config = t, this._dayOfMonthOrdinalParseLenient = new RegExp(
    (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source
  );
}
function ur(t, e) {
  var n = dt({}, t), s;
  for (s in e)
    I(e, s) && (kt(t[s]) && kt(e[s]) ? (n[s] = {}, dt(n[s], t[s]), dt(n[s], e[s])) : e[s] != null ? n[s] = e[s] : delete n[s]);
  for (s in t)
    I(t, s) && !I(e, s) && kt(t[s]) && (n[s] = dt({}, n[s]));
  return n;
}
function Ur(t) {
  t != null && this.set(t);
}
var fr;
Object.keys ? fr = Object.keys : fr = function(t) {
  var e, n = [];
  for (e in t)
    I(t, e) && n.push(e);
  return n;
};
var vc = {
  sameDay: "[Today at] LT",
  nextDay: "[Tomorrow at] LT",
  nextWeek: "dddd [at] LT",
  lastDay: "[Yesterday at] LT",
  lastWeek: "[Last] dddd [at] LT",
  sameElse: "L"
};
function _c(t, e, n) {
  var s = this._calendar[t] || this._calendar.sameElse;
  return Ze(s) ? s.call(e, n) : s;
}
function We(t, e, n) {
  var s = "" + Math.abs(t), r = e - s.length, i = t >= 0;
  return (i ? n ? "+" : "" : "-") + Math.pow(10, Math.max(0, r)).toString().substr(1) + s;
}
var jr = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, Cn = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, Zs = {}, qt = {};
function T(t, e, n, s) {
  var r = s;
  typeof s == "string" && (r = function() {
    return this[s]();
  }), t && (qt[t] = r), e && (qt[e[0]] = function() {
    return We(r.apply(this, arguments), e[1], e[2]);
  }), n && (qt[n] = function() {
    return this.localeData().ordinal(
      r.apply(this, arguments),
      t
    );
  });
}
function xc(t) {
  return t.match(/\[[\s\S]/) ? t.replace(/^\[|\]$/g, "") : t.replace(/\\/g, "");
}
function Sc(t) {
  var e = t.match(jr), n, s;
  for (n = 0, s = e.length; n < s; n++)
    qt[e[n]] ? e[n] = qt[e[n]] : e[n] = xc(e[n]);
  return function(r) {
    var i = "", o;
    for (o = 0; o < s; o++)
      i += Ze(e[o]) ? e[o].call(r, t) : e[o];
    return i;
  };
}
function Vn(t, e) {
  return t.isValid() ? (e = Mo(e, t.localeData()), Zs[e] = Zs[e] || Sc(e), Zs[e](t)) : t.localeData().invalidDate();
}
function Mo(t, e) {
  var n = 5;
  function s(r) {
    return e.longDateFormat(r) || r;
  }
  for (Cn.lastIndex = 0; n >= 0 && Cn.test(t); )
    t = t.replace(
      Cn,
      s
    ), Cn.lastIndex = 0, n -= 1;
  return t;
}
var kc = {
  LTS: "h:mm:ss A",
  LT: "h:mm A",
  L: "MM/DD/YYYY",
  LL: "MMMM D, YYYY",
  LLL: "MMMM D, YYYY h:mm A",
  LLLL: "dddd, MMMM D, YYYY h:mm A"
};
function Tc(t) {
  var e = this._longDateFormat[t], n = this._longDateFormat[t.toUpperCase()];
  return e || !n ? e : (this._longDateFormat[t] = n.match(jr).map(function(s) {
    return s === "MMMM" || s === "MM" || s === "DD" || s === "dddd" ? s.slice(1) : s;
  }).join(""), this._longDateFormat[t]);
}
var Dc = "Invalid date";
function Oc() {
  return this._invalidDate;
}
var Ec = "%d", Ac = /\d{1,2}/;
function Cc(t) {
  return this._ordinal.replace("%d", t);
}
var Mc = {
  future: "in %s",
  past: "%s ago",
  s: "a few seconds",
  ss: "%d seconds",
  m: "a minute",
  mm: "%d minutes",
  h: "an hour",
  hh: "%d hours",
  d: "a day",
  dd: "%d days",
  w: "a week",
  ww: "%d weeks",
  M: "a month",
  MM: "%d months",
  y: "a year",
  yy: "%d years"
};
function Pc(t, e, n, s) {
  var r = this._relativeTime[n];
  return Ze(r) ? r(t, e, n, s) : r.replace(/%d/i, t);
}
function Rc(t, e) {
  var n = this._relativeTime[t > 0 ? "future" : "past"];
  return Ze(n) ? n(e) : n.replace(/%s/i, e);
}
var tn = {};
function he(t, e) {
  var n = t.toLowerCase();
  tn[n] = tn[n + "s"] = tn[e] = t;
}
function Pe(t) {
  return typeof t == "string" ? tn[t] || tn[t.toLowerCase()] : void 0;
}
function Yr(t) {
  var e = {}, n, s;
  for (s in t)
    I(t, s) && (n = Pe(s), n && (e[n] = t[s]));
  return e;
}
var Po = {};
function de(t, e) {
  Po[t] = e;
}
function $c(t) {
  var e = [], n;
  for (n in t)
    I(t, n) && e.push({ unit: n, priority: Po[n] });
  return e.sort(function(s, r) {
    return s.priority - r.priority;
  }), e;
}
function ws(t) {
  return t % 4 === 0 && t % 100 !== 0 || t % 400 === 0;
}
function Ce(t) {
  return t < 0 ? Math.ceil(t) || 0 : Math.floor(t);
}
function C(t) {
  var e = +t, n = 0;
  return e !== 0 && isFinite(e) && (n = Ce(e)), n;
}
function Ht(t, e) {
  return function(n) {
    return n != null ? (Ro(this, t, n), w.updateOffset(this, e), this) : es(this, t);
  };
}
function es(t, e) {
  return t.isValid() ? t._d["get" + (t._isUTC ? "UTC" : "") + e]() : NaN;
}
function Ro(t, e, n) {
  t.isValid() && !isNaN(n) && (e === "FullYear" && ws(t.year()) && t.month() === 1 && t.date() === 29 ? (n = C(n), t._d["set" + (t._isUTC ? "UTC" : "") + e](
    n,
    t.month(),
    Ts(n, t.month())
  )) : t._d["set" + (t._isUTC ? "UTC" : "") + e](n));
}
function Lc(t) {
  return t = Pe(t), Ze(this[t]) ? this[t]() : this;
}
function Nc(t, e) {
  if (typeof t == "object") {
    t = Yr(t);
    var n = $c(t), s, r = n.length;
    for (s = 0; s < r; s++)
      this[n[s].unit](t[n[s].unit]);
  } else if (t = Pe(t), Ze(this[t]))
    return this[t](e);
  return this;
}
var $o = /\d/, Ae = /\d\d/, Lo = /\d{3}/, Fr = /\d{4}/, vs = /[+-]?\d{6}/, Z = /\d\d?/, No = /\d\d\d\d?/, qo = /\d\d\d\d\d\d?/, _s = /\d{1,3}/, zr = /\d{1,4}/, xs = /[+-]?\d{1,6}/, Vt = /\d+/, Ss = /[+-]?\d+/, qc = /Z|[+-]\d\d:?\d\d/gi, ks = /Z|[+-]\d\d(?::?\d\d)?/gi, Ic = /[+-]?\d+(\.\d{1,3})?/, vn = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i, ts;
ts = {};
function x(t, e, n) {
  ts[t] = Ze(e) ? e : function(s, r) {
    return s && n ? n : e;
  };
}
function Uc(t, e) {
  return I(ts, t) ? ts[t](e._strict, e._locale) : new RegExp(jc(t));
}
function jc(t) {
  return Te(
    t.replace("\\", "").replace(
      /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
      function(e, n, s, r, i) {
        return n || s || r || i;
      }
    )
  );
}
function Te(t) {
  return t.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
var hr = {};
function H(t, e) {
  var n, s = e, r;
  for (typeof t == "string" && (t = [t]), it(e) && (s = function(i, o) {
    o[e] = C(i);
  }), r = t.length, n = 0; n < r; n++)
    hr[t[n]] = s;
}
function _n(t, e) {
  H(t, function(n, s, r, i) {
    r._w = r._w || {}, e(n, r._w, r, i);
  });
}
function Yc(t, e, n) {
  e != null && I(hr, t) && hr[t](e, n._a, n, t);
}
var fe = 0, tt = 1, Be = 2, ae = 3, Le = 4, nt = 5, xt = 6, Fc = 7, zc = 8;
function Bc(t, e) {
  return (t % e + e) % e;
}
var se;
Array.prototype.indexOf ? se = Array.prototype.indexOf : se = function(t) {
  var e;
  for (e = 0; e < this.length; ++e)
    if (this[e] === t)
      return e;
  return -1;
};
function Ts(t, e) {
  if (isNaN(t) || isNaN(e))
    return NaN;
  var n = Bc(e, 12);
  return t += (e - n) / 12, n === 1 ? ws(t) ? 29 : 28 : 31 - n % 7 % 2;
}
T("M", ["MM", 2], "Mo", function() {
  return this.month() + 1;
});
T("MMM", 0, 0, function(t) {
  return this.localeData().monthsShort(this, t);
});
T("MMMM", 0, 0, function(t) {
  return this.localeData().months(this, t);
});
he("month", "M");
de("month", 8);
x("M", Z);
x("MM", Z, Ae);
x("MMM", function(t, e) {
  return e.monthsShortRegex(t);
});
x("MMMM", function(t, e) {
  return e.monthsRegex(t);
});
H(["M", "MM"], function(t, e) {
  e[tt] = C(t) - 1;
});
H(["MMM", "MMMM"], function(t, e, n, s) {
  var r = n._locale.monthsParse(t, s, n._strict);
  r != null ? e[tt] = r : A(n).invalidMonth = t;
});
var Hc = "January_February_March_April_May_June_July_August_September_October_November_December".split(
  "_"
), Io = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), Uo = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, Vc = vn, Wc = vn;
function Gc(t, e) {
  return t ? Ne(this._months) ? this._months[t.month()] : this._months[(this._months.isFormat || Uo).test(e) ? "format" : "standalone"][t.month()] : Ne(this._months) ? this._months : this._months.standalone;
}
function Zc(t, e) {
  return t ? Ne(this._monthsShort) ? this._monthsShort[t.month()] : this._monthsShort[Uo.test(e) ? "format" : "standalone"][t.month()] : Ne(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone;
}
function Qc(t, e, n) {
  var s, r, i, o = t.toLocaleLowerCase();
  if (!this._monthsParse)
    for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], s = 0; s < 12; ++s)
      i = Ge([2e3, s]), this._shortMonthsParse[s] = this.monthsShort(
        i,
        ""
      ).toLocaleLowerCase(), this._longMonthsParse[s] = this.months(i, "").toLocaleLowerCase();
  return n ? e === "MMM" ? (r = se.call(this._shortMonthsParse, o), r !== -1 ? r : null) : (r = se.call(this._longMonthsParse, o), r !== -1 ? r : null) : e === "MMM" ? (r = se.call(this._shortMonthsParse, o), r !== -1 ? r : (r = se.call(this._longMonthsParse, o), r !== -1 ? r : null)) : (r = se.call(this._longMonthsParse, o), r !== -1 ? r : (r = se.call(this._shortMonthsParse, o), r !== -1 ? r : null));
}
function Jc(t, e, n) {
  var s, r, i;
  if (this._monthsParseExact)
    return Qc.call(this, t, e, n);
  for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), s = 0; s < 12; s++) {
    if (r = Ge([2e3, s]), n && !this._longMonthsParse[s] && (this._longMonthsParse[s] = new RegExp(
      "^" + this.months(r, "").replace(".", "") + "$",
      "i"
    ), this._shortMonthsParse[s] = new RegExp(
      "^" + this.monthsShort(r, "").replace(".", "") + "$",
      "i"
    )), !n && !this._monthsParse[s] && (i = "^" + this.months(r, "") + "|^" + this.monthsShort(r, ""), this._monthsParse[s] = new RegExp(i.replace(".", ""), "i")), n && e === "MMMM" && this._longMonthsParse[s].test(t))
      return s;
    if (n && e === "MMM" && this._shortMonthsParse[s].test(t))
      return s;
    if (!n && this._monthsParse[s].test(t))
      return s;
  }
}
function jo(t, e) {
  var n;
  if (!t.isValid())
    return t;
  if (typeof e == "string") {
    if (/^\d+$/.test(e))
      e = C(e);
    else if (e = t.localeData().monthsParse(e), !it(e))
      return t;
  }
  return n = Math.min(t.date(), Ts(t.year(), e)), t._d["set" + (t._isUTC ? "UTC" : "") + "Month"](e, n), t;
}
function Yo(t) {
  return t != null ? (jo(this, t), w.updateOffset(this, !0), this) : es(this, "Month");
}
function Xc() {
  return Ts(this.year(), this.month());
}
function Kc(t) {
  return this._monthsParseExact ? (I(this, "_monthsRegex") || Fo.call(this), t ? this._monthsShortStrictRegex : this._monthsShortRegex) : (I(this, "_monthsShortRegex") || (this._monthsShortRegex = Vc), this._monthsShortStrictRegex && t ? this._monthsShortStrictRegex : this._monthsShortRegex);
}
function eu(t) {
  return this._monthsParseExact ? (I(this, "_monthsRegex") || Fo.call(this), t ? this._monthsStrictRegex : this._monthsRegex) : (I(this, "_monthsRegex") || (this._monthsRegex = Wc), this._monthsStrictRegex && t ? this._monthsStrictRegex : this._monthsRegex);
}
function Fo() {
  function t(o, a) {
    return a.length - o.length;
  }
  var e = [], n = [], s = [], r, i;
  for (r = 0; r < 12; r++)
    i = Ge([2e3, r]), e.push(this.monthsShort(i, "")), n.push(this.months(i, "")), s.push(this.months(i, "")), s.push(this.monthsShort(i, ""));
  for (e.sort(t), n.sort(t), s.sort(t), r = 0; r < 12; r++)
    e[r] = Te(e[r]), n[r] = Te(n[r]);
  for (r = 0; r < 24; r++)
    s[r] = Te(s[r]);
  this._monthsRegex = new RegExp("^(" + s.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp(
    "^(" + n.join("|") + ")",
    "i"
  ), this._monthsShortStrictRegex = new RegExp(
    "^(" + e.join("|") + ")",
    "i"
  );
}
T("Y", 0, 0, function() {
  var t = this.year();
  return t <= 9999 ? We(t, 4) : "+" + t;
});
T(0, ["YY", 2], 0, function() {
  return this.year() % 100;
});
T(0, ["YYYY", 4], 0, "year");
T(0, ["YYYYY", 5], 0, "year");
T(0, ["YYYYYY", 6, !0], 0, "year");
he("year", "y");
de("year", 1);
x("Y", Ss);
x("YY", Z, Ae);
x("YYYY", zr, Fr);
x("YYYYY", xs, vs);
x("YYYYYY", xs, vs);
H(["YYYYY", "YYYYYY"], fe);
H("YYYY", function(t, e) {
  e[fe] = t.length === 2 ? w.parseTwoDigitYear(t) : C(t);
});
H("YY", function(t, e) {
  e[fe] = w.parseTwoDigitYear(t);
});
H("Y", function(t, e) {
  e[fe] = parseInt(t, 10);
});
function nn(t) {
  return ws(t) ? 366 : 365;
}
w.parseTwoDigitYear = function(t) {
  return C(t) + (C(t) > 68 ? 1900 : 2e3);
};
var zo = Ht("FullYear", !0);
function tu() {
  return ws(this.year());
}
function nu(t, e, n, s, r, i, o) {
  var a;
  return t < 100 && t >= 0 ? (a = new Date(t + 400, e, n, s, r, i, o), isFinite(a.getFullYear()) && a.setFullYear(t)) : a = new Date(t, e, n, s, r, i, o), a;
}
function rn(t) {
  var e, n;
  return t < 100 && t >= 0 ? (n = Array.prototype.slice.call(arguments), n[0] = t + 400, e = new Date(Date.UTC.apply(null, n)), isFinite(e.getUTCFullYear()) && e.setUTCFullYear(t)) : e = new Date(Date.UTC.apply(null, arguments)), e;
}
function ns(t, e, n) {
  var s = 7 + e - n, r = (7 + rn(t, 0, s).getUTCDay() - e) % 7;
  return -r + s - 1;
}
function Bo(t, e, n, s, r) {
  var i = (7 + n - s) % 7, o = ns(t, s, r), a = 1 + 7 * (e - 1) + i + o, l, c;
  return a <= 0 ? (l = t - 1, c = nn(l) + a) : a > nn(t) ? (l = t + 1, c = a - nn(t)) : (l = t, c = a), {
    year: l,
    dayOfYear: c
  };
}
function on(t, e, n) {
  var s = ns(t.year(), e, n), r = Math.floor((t.dayOfYear() - s - 1) / 7) + 1, i, o;
  return r < 1 ? (o = t.year() - 1, i = r + st(o, e, n)) : r > st(t.year(), e, n) ? (i = r - st(t.year(), e, n), o = t.year() + 1) : (o = t.year(), i = r), {
    week: i,
    year: o
  };
}
function st(t, e, n) {
  var s = ns(t, e, n), r = ns(t + 1, e, n);
  return (nn(t) - s + r) / 7;
}
T("w", ["ww", 2], "wo", "week");
T("W", ["WW", 2], "Wo", "isoWeek");
he("week", "w");
he("isoWeek", "W");
de("week", 5);
de("isoWeek", 5);
x("w", Z);
x("ww", Z, Ae);
x("W", Z);
x("WW", Z, Ae);
_n(
  ["w", "ww", "W", "WW"],
  function(t, e, n, s) {
    e[s.substr(0, 1)] = C(t);
  }
);
function su(t) {
  return on(t, this._week.dow, this._week.doy).week;
}
var ru = {
  dow: 0,
  doy: 6
};
function iu() {
  return this._week.dow;
}
function ou() {
  return this._week.doy;
}
function au(t) {
  var e = this.localeData().week(this);
  return t == null ? e : this.add((t - e) * 7, "d");
}
function lu(t) {
  var e = on(this, 1, 4).week;
  return t == null ? e : this.add((t - e) * 7, "d");
}
T("d", 0, "do", "day");
T("dd", 0, 0, function(t) {
  return this.localeData().weekdaysMin(this, t);
});
T("ddd", 0, 0, function(t) {
  return this.localeData().weekdaysShort(this, t);
});
T("dddd", 0, 0, function(t) {
  return this.localeData().weekdays(this, t);
});
T("e", 0, 0, "weekday");
T("E", 0, 0, "isoWeekday");
he("day", "d");
he("weekday", "e");
he("isoWeekday", "E");
de("day", 11);
de("weekday", 11);
de("isoWeekday", 11);
x("d", Z);
x("e", Z);
x("E", Z);
x("dd", function(t, e) {
  return e.weekdaysMinRegex(t);
});
x("ddd", function(t, e) {
  return e.weekdaysShortRegex(t);
});
x("dddd", function(t, e) {
  return e.weekdaysRegex(t);
});
_n(["dd", "ddd", "dddd"], function(t, e, n, s) {
  var r = n._locale.weekdaysParse(t, s, n._strict);
  r != null ? e.d = r : A(n).invalidWeekday = t;
});
_n(["d", "e", "E"], function(t, e, n, s) {
  e[s] = C(t);
});
function cu(t, e) {
  return typeof t != "string" ? t : isNaN(t) ? (t = e.weekdaysParse(t), typeof t == "number" ? t : null) : parseInt(t, 10);
}
function uu(t, e) {
  return typeof t == "string" ? e.weekdaysParse(t) % 7 || 7 : isNaN(t) ? null : t;
}
function Br(t, e) {
  return t.slice(e, 7).concat(t.slice(0, e));
}
var fu = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), Ho = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), hu = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), du = vn, pu = vn, mu = vn;
function gu(t, e) {
  var n = Ne(this._weekdays) ? this._weekdays : this._weekdays[t && t !== !0 && this._weekdays.isFormat.test(e) ? "format" : "standalone"];
  return t === !0 ? Br(n, this._week.dow) : t ? n[t.day()] : n;
}
function yu(t) {
  return t === !0 ? Br(this._weekdaysShort, this._week.dow) : t ? this._weekdaysShort[t.day()] : this._weekdaysShort;
}
function bu(t) {
  return t === !0 ? Br(this._weekdaysMin, this._week.dow) : t ? this._weekdaysMin[t.day()] : this._weekdaysMin;
}
function wu(t, e, n) {
  var s, r, i, o = t.toLocaleLowerCase();
  if (!this._weekdaysParse)
    for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], s = 0; s < 7; ++s)
      i = Ge([2e3, 1]).day(s), this._minWeekdaysParse[s] = this.weekdaysMin(
        i,
        ""
      ).toLocaleLowerCase(), this._shortWeekdaysParse[s] = this.weekdaysShort(
        i,
        ""
      ).toLocaleLowerCase(), this._weekdaysParse[s] = this.weekdays(i, "").toLocaleLowerCase();
  return n ? e === "dddd" ? (r = se.call(this._weekdaysParse, o), r !== -1 ? r : null) : e === "ddd" ? (r = se.call(this._shortWeekdaysParse, o), r !== -1 ? r : null) : (r = se.call(this._minWeekdaysParse, o), r !== -1 ? r : null) : e === "dddd" ? (r = se.call(this._weekdaysParse, o), r !== -1 || (r = se.call(this._shortWeekdaysParse, o), r !== -1) ? r : (r = se.call(this._minWeekdaysParse, o), r !== -1 ? r : null)) : e === "ddd" ? (r = se.call(this._shortWeekdaysParse, o), r !== -1 || (r = se.call(this._weekdaysParse, o), r !== -1) ? r : (r = se.call(this._minWeekdaysParse, o), r !== -1 ? r : null)) : (r = se.call(this._minWeekdaysParse, o), r !== -1 || (r = se.call(this._weekdaysParse, o), r !== -1) ? r : (r = se.call(this._shortWeekdaysParse, o), r !== -1 ? r : null));
}
function vu(t, e, n) {
  var s, r, i;
  if (this._weekdaysParseExact)
    return wu.call(this, t, e, n);
  for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), s = 0; s < 7; s++) {
    if (r = Ge([2e3, 1]).day(s), n && !this._fullWeekdaysParse[s] && (this._fullWeekdaysParse[s] = new RegExp(
      "^" + this.weekdays(r, "").replace(".", "\\.?") + "$",
      "i"
    ), this._shortWeekdaysParse[s] = new RegExp(
      "^" + this.weekdaysShort(r, "").replace(".", "\\.?") + "$",
      "i"
    ), this._minWeekdaysParse[s] = new RegExp(
      "^" + this.weekdaysMin(r, "").replace(".", "\\.?") + "$",
      "i"
    )), this._weekdaysParse[s] || (i = "^" + this.weekdays(r, "") + "|^" + this.weekdaysShort(r, "") + "|^" + this.weekdaysMin(r, ""), this._weekdaysParse[s] = new RegExp(i.replace(".", ""), "i")), n && e === "dddd" && this._fullWeekdaysParse[s].test(t))
      return s;
    if (n && e === "ddd" && this._shortWeekdaysParse[s].test(t))
      return s;
    if (n && e === "dd" && this._minWeekdaysParse[s].test(t))
      return s;
    if (!n && this._weekdaysParse[s].test(t))
      return s;
  }
}
function _u(t) {
  if (!this.isValid())
    return t != null ? this : NaN;
  var e = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
  return t != null ? (t = cu(t, this.localeData()), this.add(t - e, "d")) : e;
}
function xu(t) {
  if (!this.isValid())
    return t != null ? this : NaN;
  var e = (this.day() + 7 - this.localeData()._week.dow) % 7;
  return t == null ? e : this.add(t - e, "d");
}
function Su(t) {
  if (!this.isValid())
    return t != null ? this : NaN;
  if (t != null) {
    var e = uu(t, this.localeData());
    return this.day(this.day() % 7 ? e : e - 7);
  } else
    return this.day() || 7;
}
function ku(t) {
  return this._weekdaysParseExact ? (I(this, "_weekdaysRegex") || Hr.call(this), t ? this._weekdaysStrictRegex : this._weekdaysRegex) : (I(this, "_weekdaysRegex") || (this._weekdaysRegex = du), this._weekdaysStrictRegex && t ? this._weekdaysStrictRegex : this._weekdaysRegex);
}
function Tu(t) {
  return this._weekdaysParseExact ? (I(this, "_weekdaysRegex") || Hr.call(this), t ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (I(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = pu), this._weekdaysShortStrictRegex && t ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex);
}
function Du(t) {
  return this._weekdaysParseExact ? (I(this, "_weekdaysRegex") || Hr.call(this), t ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (I(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = mu), this._weekdaysMinStrictRegex && t ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex);
}
function Hr() {
  function t(u, f) {
    return f.length - u.length;
  }
  var e = [], n = [], s = [], r = [], i, o, a, l, c;
  for (i = 0; i < 7; i++)
    o = Ge([2e3, 1]).day(i), a = Te(this.weekdaysMin(o, "")), l = Te(this.weekdaysShort(o, "")), c = Te(this.weekdays(o, "")), e.push(a), n.push(l), s.push(c), r.push(a), r.push(l), r.push(c);
  e.sort(t), n.sort(t), s.sort(t), r.sort(t), this._weekdaysRegex = new RegExp("^(" + r.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp(
    "^(" + s.join("|") + ")",
    "i"
  ), this._weekdaysShortStrictRegex = new RegExp(
    "^(" + n.join("|") + ")",
    "i"
  ), this._weekdaysMinStrictRegex = new RegExp(
    "^(" + e.join("|") + ")",
    "i"
  );
}
function Vr() {
  return this.hours() % 12 || 12;
}
function Ou() {
  return this.hours() || 24;
}
T("H", ["HH", 2], 0, "hour");
T("h", ["hh", 2], 0, Vr);
T("k", ["kk", 2], 0, Ou);
T("hmm", 0, 0, function() {
  return "" + Vr.apply(this) + We(this.minutes(), 2);
});
T("hmmss", 0, 0, function() {
  return "" + Vr.apply(this) + We(this.minutes(), 2) + We(this.seconds(), 2);
});
T("Hmm", 0, 0, function() {
  return "" + this.hours() + We(this.minutes(), 2);
});
T("Hmmss", 0, 0, function() {
  return "" + this.hours() + We(this.minutes(), 2) + We(this.seconds(), 2);
});
function Vo(t, e) {
  T(t, 0, 0, function() {
    return this.localeData().meridiem(
      this.hours(),
      this.minutes(),
      e
    );
  });
}
Vo("a", !0);
Vo("A", !1);
he("hour", "h");
de("hour", 13);
function Wo(t, e) {
  return e._meridiemParse;
}
x("a", Wo);
x("A", Wo);
x("H", Z);
x("h", Z);
x("k", Z);
x("HH", Z, Ae);
x("hh", Z, Ae);
x("kk", Z, Ae);
x("hmm", No);
x("hmmss", qo);
x("Hmm", No);
x("Hmmss", qo);
H(["H", "HH"], ae);
H(["k", "kk"], function(t, e, n) {
  var s = C(t);
  e[ae] = s === 24 ? 0 : s;
});
H(["a", "A"], function(t, e, n) {
  n._isPm = n._locale.isPM(t), n._meridiem = t;
});
H(["h", "hh"], function(t, e, n) {
  e[ae] = C(t), A(n).bigHour = !0;
});
H("hmm", function(t, e, n) {
  var s = t.length - 2;
  e[ae] = C(t.substr(0, s)), e[Le] = C(t.substr(s)), A(n).bigHour = !0;
});
H("hmmss", function(t, e, n) {
  var s = t.length - 4, r = t.length - 2;
  e[ae] = C(t.substr(0, s)), e[Le] = C(t.substr(s, 2)), e[nt] = C(t.substr(r)), A(n).bigHour = !0;
});
H("Hmm", function(t, e, n) {
  var s = t.length - 2;
  e[ae] = C(t.substr(0, s)), e[Le] = C(t.substr(s));
});
H("Hmmss", function(t, e, n) {
  var s = t.length - 4, r = t.length - 2;
  e[ae] = C(t.substr(0, s)), e[Le] = C(t.substr(s, 2)), e[nt] = C(t.substr(r));
});
function Eu(t) {
  return (t + "").toLowerCase().charAt(0) === "p";
}
var Au = /[ap]\.?m?\.?/i, Cu = Ht("Hours", !0);
function Mu(t, e, n) {
  return t > 11 ? n ? "pm" : "PM" : n ? "am" : "AM";
}
var Go = {
  calendar: vc,
  longDateFormat: kc,
  invalidDate: Dc,
  ordinal: Ec,
  dayOfMonthOrdinalParse: Ac,
  relativeTime: Mc,
  months: Hc,
  monthsShort: Io,
  week: ru,
  weekdays: fu,
  weekdaysMin: hu,
  weekdaysShort: Ho,
  meridiemParse: Au
}, K = {}, Qt = {}, an;
function Pu(t, e) {
  var n, s = Math.min(t.length, e.length);
  for (n = 0; n < s; n += 1)
    if (t[n] !== e[n])
      return n;
  return s;
}
function Ri(t) {
  return t && t.toLowerCase().replace("_", "-");
}
function Ru(t) {
  for (var e = 0, n, s, r, i; e < t.length; ) {
    for (i = Ri(t[e]).split("-"), n = i.length, s = Ri(t[e + 1]), s = s ? s.split("-") : null; n > 0; ) {
      if (r = Ds(i.slice(0, n).join("-")), r)
        return r;
      if (s && s.length >= n && Pu(i, s) >= n - 1)
        break;
      n--;
    }
    e++;
  }
  return an;
}
function $u(t) {
  return t.match("^[^/\\\\]*$") != null;
}
function Ds(t) {
  var e = null, n;
  if (K[t] === void 0 && typeof module < "u" && module && module.exports && $u(t))
    try {
      e = an._abbr, n = require, n("./locale/" + t), mt(e);
    } catch {
      K[t] = null;
    }
  return K[t];
}
function mt(t, e) {
  var n;
  return t && (be(e) ? n = lt(t) : n = Wr(t, e), n ? an = n : typeof console < "u" && console.warn && console.warn(
    "Locale " + t + " not found. Did you forget to load it?"
  )), an._abbr;
}
function Wr(t, e) {
  if (e !== null) {
    var n, s = Go;
    if (e.abbr = t, K[t] != null)
      Co(
        "defineLocaleOverride",
        "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."
      ), s = K[t]._config;
    else if (e.parentLocale != null)
      if (K[e.parentLocale] != null)
        s = K[e.parentLocale]._config;
      else if (n = Ds(e.parentLocale), n != null)
        s = n._config;
      else
        return Qt[e.parentLocale] || (Qt[e.parentLocale] = []), Qt[e.parentLocale].push({
          name: t,
          config: e
        }), null;
    return K[t] = new Ur(ur(s, e)), Qt[t] && Qt[t].forEach(function(r) {
      Wr(r.name, r.config);
    }), mt(t), K[t];
  } else
    return delete K[t], null;
}
function Lu(t, e) {
  if (e != null) {
    var n, s, r = Go;
    K[t] != null && K[t].parentLocale != null ? K[t].set(ur(K[t]._config, e)) : (s = Ds(t), s != null && (r = s._config), e = ur(r, e), s == null && (e.abbr = t), n = new Ur(e), n.parentLocale = K[t], K[t] = n), mt(t);
  } else
    K[t] != null && (K[t].parentLocale != null ? (K[t] = K[t].parentLocale, t === mt() && mt(t)) : K[t] != null && delete K[t]);
  return K[t];
}
function lt(t) {
  var e;
  if (t && t._locale && t._locale._abbr && (t = t._locale._abbr), !t)
    return an;
  if (!Ne(t)) {
    if (e = Ds(t), e)
      return e;
    t = [t];
  }
  return Ru(t);
}
function Nu() {
  return fr(K);
}
function Gr(t) {
  var e, n = t._a;
  return n && A(t).overflow === -2 && (e = n[tt] < 0 || n[tt] > 11 ? tt : n[Be] < 1 || n[Be] > Ts(n[fe], n[tt]) ? Be : n[ae] < 0 || n[ae] > 24 || n[ae] === 24 && (n[Le] !== 0 || n[nt] !== 0 || n[xt] !== 0) ? ae : n[Le] < 0 || n[Le] > 59 ? Le : n[nt] < 0 || n[nt] > 59 ? nt : n[xt] < 0 || n[xt] > 999 ? xt : -1, A(t)._overflowDayOfYear && (e < fe || e > Be) && (e = Be), A(t)._overflowWeeks && e === -1 && (e = Fc), A(t)._overflowWeekday && e === -1 && (e = zc), A(t).overflow = e), t;
}
var qu = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Iu = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Uu = /Z|[+-]\d\d(?::?\d\d)?/, Mn = [
  ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
  ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
  ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
  ["GGGG-[W]WW", /\d{4}-W\d\d/, !1],
  ["YYYY-DDD", /\d{4}-\d{3}/],
  ["YYYY-MM", /\d{4}-\d\d/, !1],
  ["YYYYYYMMDD", /[+-]\d{10}/],
  ["YYYYMMDD", /\d{8}/],
  ["GGGG[W]WWE", /\d{4}W\d{3}/],
  ["GGGG[W]WW", /\d{4}W\d{2}/, !1],
  ["YYYYDDD", /\d{7}/],
  ["YYYYMM", /\d{6}/, !1],
  ["YYYY", /\d{4}/, !1]
], Qs = [
  ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
  ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
  ["HH:mm:ss", /\d\d:\d\d:\d\d/],
  ["HH:mm", /\d\d:\d\d/],
  ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
  ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
  ["HHmmss", /\d\d\d\d\d\d/],
  ["HHmm", /\d\d\d\d/],
  ["HH", /\d\d/]
], ju = /^\/?Date\((-?\d+)/i, Yu = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/, Fu = {
  UT: 0,
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function Zo(t) {
  var e, n, s = t._i, r = qu.exec(s) || Iu.exec(s), i, o, a, l, c = Mn.length, u = Qs.length;
  if (r) {
    for (A(t).iso = !0, e = 0, n = c; e < n; e++)
      if (Mn[e][1].exec(r[1])) {
        o = Mn[e][0], i = Mn[e][2] !== !1;
        break;
      }
    if (o == null) {
      t._isValid = !1;
      return;
    }
    if (r[3]) {
      for (e = 0, n = u; e < n; e++)
        if (Qs[e][1].exec(r[3])) {
          a = (r[2] || " ") + Qs[e][0];
          break;
        }
      if (a == null) {
        t._isValid = !1;
        return;
      }
    }
    if (!i && a != null) {
      t._isValid = !1;
      return;
    }
    if (r[4])
      if (Uu.exec(r[4]))
        l = "Z";
      else {
        t._isValid = !1;
        return;
      }
    t._f = o + (a || "") + (l || ""), Qr(t);
  } else
    t._isValid = !1;
}
function zu(t, e, n, s, r, i) {
  var o = [
    Bu(t),
    Io.indexOf(e),
    parseInt(n, 10),
    parseInt(s, 10),
    parseInt(r, 10)
  ];
  return i && o.push(parseInt(i, 10)), o;
}
function Bu(t) {
  var e = parseInt(t, 10);
  return e <= 49 ? 2e3 + e : e <= 999 ? 1900 + e : e;
}
function Hu(t) {
  return t.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
}
function Vu(t, e, n) {
  if (t) {
    var s = Ho.indexOf(t), r = new Date(
      e[0],
      e[1],
      e[2]
    ).getDay();
    if (s !== r)
      return A(n).weekdayMismatch = !0, n._isValid = !1, !1;
  }
  return !0;
}
function Wu(t, e, n) {
  if (t)
    return Fu[t];
  if (e)
    return 0;
  var s = parseInt(n, 10), r = s % 100, i = (s - r) / 100;
  return i * 60 + r;
}
function Qo(t) {
  var e = Yu.exec(Hu(t._i)), n;
  if (e) {
    if (n = zu(
      e[4],
      e[3],
      e[2],
      e[5],
      e[6],
      e[7]
    ), !Vu(e[1], n, t))
      return;
    t._a = n, t._tzm = Wu(e[8], e[9], e[10]), t._d = rn.apply(null, t._a), t._d.setUTCMinutes(t._d.getUTCMinutes() - t._tzm), A(t).rfc2822 = !0;
  } else
    t._isValid = !1;
}
function Gu(t) {
  var e = ju.exec(t._i);
  if (e !== null) {
    t._d = new Date(+e[1]);
    return;
  }
  if (Zo(t), t._isValid === !1)
    delete t._isValid;
  else
    return;
  if (Qo(t), t._isValid === !1)
    delete t._isValid;
  else
    return;
  t._strict ? t._isValid = !1 : w.createFromInputFallback(t);
}
w.createFromInputFallback = Me(
  "value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",
  function(t) {
    t._d = new Date(t._i + (t._useUTC ? " UTC" : ""));
  }
);
function Rt(t, e, n) {
  return t != null ? t : e != null ? e : n;
}
function Zu(t) {
  var e = new Date(w.now());
  return t._useUTC ? [
    e.getUTCFullYear(),
    e.getUTCMonth(),
    e.getUTCDate()
  ] : [e.getFullYear(), e.getMonth(), e.getDate()];
}
function Zr(t) {
  var e, n, s = [], r, i, o;
  if (!t._d) {
    for (r = Zu(t), t._w && t._a[Be] == null && t._a[tt] == null && Qu(t), t._dayOfYear != null && (o = Rt(t._a[fe], r[fe]), (t._dayOfYear > nn(o) || t._dayOfYear === 0) && (A(t)._overflowDayOfYear = !0), n = rn(o, 0, t._dayOfYear), t._a[tt] = n.getUTCMonth(), t._a[Be] = n.getUTCDate()), e = 0; e < 3 && t._a[e] == null; ++e)
      t._a[e] = s[e] = r[e];
    for (; e < 7; e++)
      t._a[e] = s[e] = t._a[e] == null ? e === 2 ? 1 : 0 : t._a[e];
    t._a[ae] === 24 && t._a[Le] === 0 && t._a[nt] === 0 && t._a[xt] === 0 && (t._nextDay = !0, t._a[ae] = 0), t._d = (t._useUTC ? rn : nu).apply(
      null,
      s
    ), i = t._useUTC ? t._d.getUTCDay() : t._d.getDay(), t._tzm != null && t._d.setUTCMinutes(t._d.getUTCMinutes() - t._tzm), t._nextDay && (t._a[ae] = 24), t._w && typeof t._w.d < "u" && t._w.d !== i && (A(t).weekdayMismatch = !0);
  }
}
function Qu(t) {
  var e, n, s, r, i, o, a, l, c;
  e = t._w, e.GG != null || e.W != null || e.E != null ? (i = 1, o = 4, n = Rt(
    e.GG,
    t._a[fe],
    on(G(), 1, 4).year
  ), s = Rt(e.W, 1), r = Rt(e.E, 1), (r < 1 || r > 7) && (l = !0)) : (i = t._locale._week.dow, o = t._locale._week.doy, c = on(G(), i, o), n = Rt(e.gg, t._a[fe], c.year), s = Rt(e.w, c.week), e.d != null ? (r = e.d, (r < 0 || r > 6) && (l = !0)) : e.e != null ? (r = e.e + i, (e.e < 0 || e.e > 6) && (l = !0)) : r = i), s < 1 || s > st(n, i, o) ? A(t)._overflowWeeks = !0 : l != null ? A(t)._overflowWeekday = !0 : (a = Bo(n, s, r, i, o), t._a[fe] = a.year, t._dayOfYear = a.dayOfYear);
}
w.ISO_8601 = function() {
};
w.RFC_2822 = function() {
};
function Qr(t) {
  if (t._f === w.ISO_8601) {
    Zo(t);
    return;
  }
  if (t._f === w.RFC_2822) {
    Qo(t);
    return;
  }
  t._a = [], A(t).empty = !0;
  var e = "" + t._i, n, s, r, i, o, a = e.length, l = 0, c, u;
  for (r = Mo(t._f, t._locale).match(jr) || [], u = r.length, n = 0; n < u; n++)
    i = r[n], s = (e.match(Uc(i, t)) || [])[0], s && (o = e.substr(0, e.indexOf(s)), o.length > 0 && A(t).unusedInput.push(o), e = e.slice(
      e.indexOf(s) + s.length
    ), l += s.length), qt[i] ? (s ? A(t).empty = !1 : A(t).unusedTokens.push(i), Yc(i, s, t)) : t._strict && !s && A(t).unusedTokens.push(i);
  A(t).charsLeftOver = a - l, e.length > 0 && A(t).unusedInput.push(e), t._a[ae] <= 12 && A(t).bigHour === !0 && t._a[ae] > 0 && (A(t).bigHour = void 0), A(t).parsedDateParts = t._a.slice(0), A(t).meridiem = t._meridiem, t._a[ae] = Ju(
    t._locale,
    t._a[ae],
    t._meridiem
  ), c = A(t).era, c !== null && (t._a[fe] = t._locale.erasConvertYear(c, t._a[fe])), Zr(t), Gr(t);
}
function Ju(t, e, n) {
  var s;
  return n == null ? e : t.meridiemHour != null ? t.meridiemHour(e, n) : (t.isPM != null && (s = t.isPM(n), s && e < 12 && (e += 12), !s && e === 12 && (e = 0)), e);
}
function Xu(t) {
  var e, n, s, r, i, o, a = !1, l = t._f.length;
  if (l === 0) {
    A(t).invalidFormat = !0, t._d = new Date(NaN);
    return;
  }
  for (r = 0; r < l; r++)
    i = 0, o = !1, e = Ir({}, t), t._useUTC != null && (e._useUTC = t._useUTC), e._f = t._f[r], Qr(e), qr(e) && (o = !0), i += A(e).charsLeftOver, i += A(e).unusedTokens.length * 10, A(e).score = i, a ? i < s && (s = i, n = e) : (s == null || i < s || o) && (s = i, n = e, o && (a = !0));
  dt(t, n || e);
}
function Ku(t) {
  if (!t._d) {
    var e = Yr(t._i), n = e.day === void 0 ? e.date : e.day;
    t._a = Eo(
      [e.year, e.month, n, e.hour, e.minute, e.second, e.millisecond],
      function(s) {
        return s && parseInt(s, 10);
      }
    ), Zr(t);
  }
}
function ef(t) {
  var e = new wn(Gr(Jo(t)));
  return e._nextDay && (e.add(1, "d"), e._nextDay = void 0), e;
}
function Jo(t) {
  var e = t._i, n = t._f;
  return t._locale = t._locale || lt(t._l), e === null || n === void 0 && e === "" ? bs({ nullInput: !0 }) : (typeof e == "string" && (t._i = e = t._locale.preparse(e)), qe(e) ? new wn(Gr(e)) : (bn(e) ? t._d = e : Ne(n) ? Xu(t) : n ? Qr(t) : tf(t), qr(t) || (t._d = null), t));
}
function tf(t) {
  var e = t._i;
  be(e) ? t._d = new Date(w.now()) : bn(e) ? t._d = new Date(e.valueOf()) : typeof e == "string" ? Gu(t) : Ne(e) ? (t._a = Eo(e.slice(0), function(n) {
    return parseInt(n, 10);
  }), Zr(t)) : kt(e) ? Ku(t) : it(e) ? t._d = new Date(e) : w.createFromInputFallback(t);
}
function Xo(t, e, n, s, r) {
  var i = {};
  return (e === !0 || e === !1) && (s = e, e = void 0), (n === !0 || n === !1) && (s = n, n = void 0), (kt(t) && Nr(t) || Ne(t) && t.length === 0) && (t = void 0), i._isAMomentObject = !0, i._useUTC = i._isUTC = r, i._l = n, i._i = t, i._f = e, i._strict = s, ef(i);
}
function G(t, e, n, s) {
  return Xo(t, e, n, s, !1);
}
var nf = Me(
  "moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",
  function() {
    var t = G.apply(null, arguments);
    return this.isValid() && t.isValid() ? t < this ? this : t : bs();
  }
), sf = Me(
  "moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",
  function() {
    var t = G.apply(null, arguments);
    return this.isValid() && t.isValid() ? t > this ? this : t : bs();
  }
);
function Ko(t, e) {
  var n, s;
  if (e.length === 1 && Ne(e[0]) && (e = e[0]), !e.length)
    return G();
  for (n = e[0], s = 1; s < e.length; ++s)
    (!e[s].isValid() || e[s][t](n)) && (n = e[s]);
  return n;
}
function rf() {
  var t = [].slice.call(arguments, 0);
  return Ko("isBefore", t);
}
function of() {
  var t = [].slice.call(arguments, 0);
  return Ko("isAfter", t);
}
var af = function() {
  return Date.now ? Date.now() : +new Date();
}, Jt = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond"
];
function lf(t) {
  var e, n = !1, s, r = Jt.length;
  for (e in t)
    if (I(t, e) && !(se.call(Jt, e) !== -1 && (t[e] == null || !isNaN(t[e]))))
      return !1;
  for (s = 0; s < r; ++s)
    if (t[Jt[s]]) {
      if (n)
        return !1;
      parseFloat(t[Jt[s]]) !== C(t[Jt[s]]) && (n = !0);
    }
  return !0;
}
function cf() {
  return this._isValid;
}
function uf() {
  return Ue(NaN);
}
function Os(t) {
  var e = Yr(t), n = e.year || 0, s = e.quarter || 0, r = e.month || 0, i = e.week || e.isoWeek || 0, o = e.day || 0, a = e.hour || 0, l = e.minute || 0, c = e.second || 0, u = e.millisecond || 0;
  this._isValid = lf(e), this._milliseconds = +u + c * 1e3 + l * 6e4 + a * 1e3 * 60 * 60, this._days = +o + i * 7, this._months = +r + s * 3 + n * 12, this._data = {}, this._locale = lt(), this._bubble();
}
function Wn(t) {
  return t instanceof Os;
}
function dr(t) {
  return t < 0 ? Math.round(-1 * t) * -1 : Math.round(t);
}
function ff(t, e, n) {
  var s = Math.min(t.length, e.length), r = Math.abs(t.length - e.length), i = 0, o;
  for (o = 0; o < s; o++)
    (n && t[o] !== e[o] || !n && C(t[o]) !== C(e[o])) && i++;
  return i + r;
}
function ea(t, e) {
  T(t, 0, 0, function() {
    var n = this.utcOffset(), s = "+";
    return n < 0 && (n = -n, s = "-"), s + We(~~(n / 60), 2) + e + We(~~n % 60, 2);
  });
}
ea("Z", ":");
ea("ZZ", "");
x("Z", ks);
x("ZZ", ks);
H(["Z", "ZZ"], function(t, e, n) {
  n._useUTC = !0, n._tzm = Jr(ks, t);
});
var hf = /([\+\-]|\d\d)/gi;
function Jr(t, e) {
  var n = (e || "").match(t), s, r, i;
  return n === null ? null : (s = n[n.length - 1] || [], r = (s + "").match(hf) || ["-", 0, 0], i = +(r[1] * 60) + C(r[2]), i === 0 ? 0 : r[0] === "+" ? i : -i);
}
function Xr(t, e) {
  var n, s;
  return e._isUTC ? (n = e.clone(), s = (qe(t) || bn(t) ? t.valueOf() : G(t).valueOf()) - n.valueOf(), n._d.setTime(n._d.valueOf() + s), w.updateOffset(n, !1), n) : G(t).local();
}
function pr(t) {
  return -Math.round(t._d.getTimezoneOffset());
}
w.updateOffset = function() {
};
function df(t, e, n) {
  var s = this._offset || 0, r;
  if (!this.isValid())
    return t != null ? this : NaN;
  if (t != null) {
    if (typeof t == "string") {
      if (t = Jr(ks, t), t === null)
        return this;
    } else
      Math.abs(t) < 16 && !n && (t = t * 60);
    return !this._isUTC && e && (r = pr(this)), this._offset = t, this._isUTC = !0, r != null && this.add(r, "m"), s !== t && (!e || this._changeInProgress ? sa(
      this,
      Ue(t - s, "m"),
      1,
      !1
    ) : this._changeInProgress || (this._changeInProgress = !0, w.updateOffset(this, !0), this._changeInProgress = null)), this;
  } else
    return this._isUTC ? s : pr(this);
}
function pf(t, e) {
  return t != null ? (typeof t != "string" && (t = -t), this.utcOffset(t, e), this) : -this.utcOffset();
}
function mf(t) {
  return this.utcOffset(0, t);
}
function gf(t) {
  return this._isUTC && (this.utcOffset(0, t), this._isUTC = !1, t && this.subtract(pr(this), "m")), this;
}
function yf() {
  if (this._tzm != null)
    this.utcOffset(this._tzm, !1, !0);
  else if (typeof this._i == "string") {
    var t = Jr(qc, this._i);
    t != null ? this.utcOffset(t) : this.utcOffset(0, !0);
  }
  return this;
}
function bf(t) {
  return this.isValid() ? (t = t ? G(t).utcOffset() : 0, (this.utcOffset() - t) % 60 === 0) : !1;
}
function wf() {
  return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
}
function vf() {
  if (!be(this._isDSTShifted))
    return this._isDSTShifted;
  var t = {}, e;
  return Ir(t, this), t = Jo(t), t._a ? (e = t._isUTC ? Ge(t._a) : G(t._a), this._isDSTShifted = this.isValid() && ff(t._a, e.toArray()) > 0) : this._isDSTShifted = !1, this._isDSTShifted;
}
function _f() {
  return this.isValid() ? !this._isUTC : !1;
}
function xf() {
  return this.isValid() ? this._isUTC : !1;
}
function ta() {
  return this.isValid() ? this._isUTC && this._offset === 0 : !1;
}
var Sf = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/, kf = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
function Ue(t, e) {
  var n = t, s = null, r, i, o;
  return Wn(t) ? n = {
    ms: t._milliseconds,
    d: t._days,
    M: t._months
  } : it(t) || !isNaN(+t) ? (n = {}, e ? n[e] = +t : n.milliseconds = +t) : (s = Sf.exec(t)) ? (r = s[1] === "-" ? -1 : 1, n = {
    y: 0,
    d: C(s[Be]) * r,
    h: C(s[ae]) * r,
    m: C(s[Le]) * r,
    s: C(s[nt]) * r,
    ms: C(dr(s[xt] * 1e3)) * r
  }) : (s = kf.exec(t)) ? (r = s[1] === "-" ? -1 : 1, n = {
    y: wt(s[2], r),
    M: wt(s[3], r),
    w: wt(s[4], r),
    d: wt(s[5], r),
    h: wt(s[6], r),
    m: wt(s[7], r),
    s: wt(s[8], r)
  }) : n == null ? n = {} : typeof n == "object" && ("from" in n || "to" in n) && (o = Tf(
    G(n.from),
    G(n.to)
  ), n = {}, n.ms = o.milliseconds, n.M = o.months), i = new Os(n), Wn(t) && I(t, "_locale") && (i._locale = t._locale), Wn(t) && I(t, "_isValid") && (i._isValid = t._isValid), i;
}
Ue.fn = Os.prototype;
Ue.invalid = uf;
function wt(t, e) {
  var n = t && parseFloat(t.replace(",", "."));
  return (isNaN(n) ? 0 : n) * e;
}
function $i(t, e) {
  var n = {};
  return n.months = e.month() - t.month() + (e.year() - t.year()) * 12, t.clone().add(n.months, "M").isAfter(e) && --n.months, n.milliseconds = +e - +t.clone().add(n.months, "M"), n;
}
function Tf(t, e) {
  var n;
  return t.isValid() && e.isValid() ? (e = Xr(e, t), t.isBefore(e) ? n = $i(t, e) : (n = $i(e, t), n.milliseconds = -n.milliseconds, n.months = -n.months), n) : { milliseconds: 0, months: 0 };
}
function na(t, e) {
  return function(n, s) {
    var r, i;
    return s !== null && !isNaN(+s) && (Co(
      e,
      "moment()." + e + "(period, number) is deprecated. Please use moment()." + e + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."
    ), i = n, n = s, s = i), r = Ue(n, s), sa(this, r, t), this;
  };
}
function sa(t, e, n, s) {
  var r = e._milliseconds, i = dr(e._days), o = dr(e._months);
  !t.isValid() || (s = s == null ? !0 : s, o && jo(t, es(t, "Month") + o * n), i && Ro(t, "Date", es(t, "Date") + i * n), r && t._d.setTime(t._d.valueOf() + r * n), s && w.updateOffset(t, i || o));
}
var Df = na(1, "add"), Of = na(-1, "subtract");
function ra(t) {
  return typeof t == "string" || t instanceof String;
}
function Ef(t) {
  return qe(t) || bn(t) || ra(t) || it(t) || Cf(t) || Af(t) || t === null || t === void 0;
}
function Af(t) {
  var e = kt(t) && !Nr(t), n = !1, s = [
    "years",
    "year",
    "y",
    "months",
    "month",
    "M",
    "days",
    "day",
    "d",
    "dates",
    "date",
    "D",
    "hours",
    "hour",
    "h",
    "minutes",
    "minute",
    "m",
    "seconds",
    "second",
    "s",
    "milliseconds",
    "millisecond",
    "ms"
  ], r, i, o = s.length;
  for (r = 0; r < o; r += 1)
    i = s[r], n = n || I(t, i);
  return e && n;
}
function Cf(t) {
  var e = Ne(t), n = !1;
  return e && (n = t.filter(function(s) {
    return !it(s) && ra(t);
  }).length === 0), e && n;
}
function Mf(t) {
  var e = kt(t) && !Nr(t), n = !1, s = [
    "sameDay",
    "nextDay",
    "lastDay",
    "nextWeek",
    "lastWeek",
    "sameElse"
  ], r, i;
  for (r = 0; r < s.length; r += 1)
    i = s[r], n = n || I(t, i);
  return e && n;
}
function Pf(t, e) {
  var n = t.diff(e, "days", !0);
  return n < -6 ? "sameElse" : n < -1 ? "lastWeek" : n < 0 ? "lastDay" : n < 1 ? "sameDay" : n < 2 ? "nextDay" : n < 7 ? "nextWeek" : "sameElse";
}
function Rf(t, e) {
  arguments.length === 1 && (arguments[0] ? Ef(arguments[0]) ? (t = arguments[0], e = void 0) : Mf(arguments[0]) && (e = arguments[0], t = void 0) : (t = void 0, e = void 0));
  var n = t || G(), s = Xr(n, this).startOf("day"), r = w.calendarFormat(this, s) || "sameElse", i = e && (Ze(e[r]) ? e[r].call(this, n) : e[r]);
  return this.format(
    i || this.localeData().calendar(r, this, G(n))
  );
}
function $f() {
  return new wn(this);
}
function Lf(t, e) {
  var n = qe(t) ? t : G(t);
  return this.isValid() && n.isValid() ? (e = Pe(e) || "millisecond", e === "millisecond" ? this.valueOf() > n.valueOf() : n.valueOf() < this.clone().startOf(e).valueOf()) : !1;
}
function Nf(t, e) {
  var n = qe(t) ? t : G(t);
  return this.isValid() && n.isValid() ? (e = Pe(e) || "millisecond", e === "millisecond" ? this.valueOf() < n.valueOf() : this.clone().endOf(e).valueOf() < n.valueOf()) : !1;
}
function qf(t, e, n, s) {
  var r = qe(t) ? t : G(t), i = qe(e) ? e : G(e);
  return this.isValid() && r.isValid() && i.isValid() ? (s = s || "()", (s[0] === "(" ? this.isAfter(r, n) : !this.isBefore(r, n)) && (s[1] === ")" ? this.isBefore(i, n) : !this.isAfter(i, n))) : !1;
}
function If(t, e) {
  var n = qe(t) ? t : G(t), s;
  return this.isValid() && n.isValid() ? (e = Pe(e) || "millisecond", e === "millisecond" ? this.valueOf() === n.valueOf() : (s = n.valueOf(), this.clone().startOf(e).valueOf() <= s && s <= this.clone().endOf(e).valueOf())) : !1;
}
function Uf(t, e) {
  return this.isSame(t, e) || this.isAfter(t, e);
}
function jf(t, e) {
  return this.isSame(t, e) || this.isBefore(t, e);
}
function Yf(t, e, n) {
  var s, r, i;
  if (!this.isValid())
    return NaN;
  if (s = Xr(t, this), !s.isValid())
    return NaN;
  switch (r = (s.utcOffset() - this.utcOffset()) * 6e4, e = Pe(e), e) {
    case "year":
      i = Gn(this, s) / 12;
      break;
    case "month":
      i = Gn(this, s);
      break;
    case "quarter":
      i = Gn(this, s) / 3;
      break;
    case "second":
      i = (this - s) / 1e3;
      break;
    case "minute":
      i = (this - s) / 6e4;
      break;
    case "hour":
      i = (this - s) / 36e5;
      break;
    case "day":
      i = (this - s - r) / 864e5;
      break;
    case "week":
      i = (this - s - r) / 6048e5;
      break;
    default:
      i = this - s;
  }
  return n ? i : Ce(i);
}
function Gn(t, e) {
  if (t.date() < e.date())
    return -Gn(e, t);
  var n = (e.year() - t.year()) * 12 + (e.month() - t.month()), s = t.clone().add(n, "months"), r, i;
  return e - s < 0 ? (r = t.clone().add(n - 1, "months"), i = (e - s) / (s - r)) : (r = t.clone().add(n + 1, "months"), i = (e - s) / (r - s)), -(n + i) || 0;
}
w.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
w.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
function Ff() {
  return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
}
function zf(t) {
  if (!this.isValid())
    return null;
  var e = t !== !0, n = e ? this.clone().utc() : this;
  return n.year() < 0 || n.year() > 9999 ? Vn(
    n,
    e ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"
  ) : Ze(Date.prototype.toISOString) ? e ? this.toDate().toISOString() : new Date(this.valueOf() + this.utcOffset() * 60 * 1e3).toISOString().replace("Z", Vn(n, "Z")) : Vn(
    n,
    e ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
  );
}
function Bf() {
  if (!this.isValid())
    return "moment.invalid(/* " + this._i + " */)";
  var t = "moment", e = "", n, s, r, i;
  return this.isLocal() || (t = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone", e = "Z"), n = "[" + t + '("]', s = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY", r = "-MM-DD[T]HH:mm:ss.SSS", i = e + '[")]', this.format(n + s + r + i);
}
function Hf(t) {
  t || (t = this.isUtc() ? w.defaultFormatUtc : w.defaultFormat);
  var e = Vn(this, t);
  return this.localeData().postformat(e);
}
function Vf(t, e) {
  return this.isValid() && (qe(t) && t.isValid() || G(t).isValid()) ? Ue({ to: this, from: t }).locale(this.locale()).humanize(!e) : this.localeData().invalidDate();
}
function Wf(t) {
  return this.from(G(), t);
}
function Gf(t, e) {
  return this.isValid() && (qe(t) && t.isValid() || G(t).isValid()) ? Ue({ from: this, to: t }).locale(this.locale()).humanize(!e) : this.localeData().invalidDate();
}
function Zf(t) {
  return this.to(G(), t);
}
function ia(t) {
  var e;
  return t === void 0 ? this._locale._abbr : (e = lt(t), e != null && (this._locale = e), this);
}
var oa = Me(
  "moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",
  function(t) {
    return t === void 0 ? this.localeData() : this.locale(t);
  }
);
function aa() {
  return this._locale;
}
var ss = 1e3, It = 60 * ss, rs = 60 * It, la = (365 * 400 + 97) * 24 * rs;
function Ut(t, e) {
  return (t % e + e) % e;
}
function ca(t, e, n) {
  return t < 100 && t >= 0 ? new Date(t + 400, e, n) - la : new Date(t, e, n).valueOf();
}
function ua(t, e, n) {
  return t < 100 && t >= 0 ? Date.UTC(t + 400, e, n) - la : Date.UTC(t, e, n);
}
function Qf(t) {
  var e, n;
  if (t = Pe(t), t === void 0 || t === "millisecond" || !this.isValid())
    return this;
  switch (n = this._isUTC ? ua : ca, t) {
    case "year":
      e = n(this.year(), 0, 1);
      break;
    case "quarter":
      e = n(
        this.year(),
        this.month() - this.month() % 3,
        1
      );
      break;
    case "month":
      e = n(this.year(), this.month(), 1);
      break;
    case "week":
      e = n(
        this.year(),
        this.month(),
        this.date() - this.weekday()
      );
      break;
    case "isoWeek":
      e = n(
        this.year(),
        this.month(),
        this.date() - (this.isoWeekday() - 1)
      );
      break;
    case "day":
    case "date":
      e = n(this.year(), this.month(), this.date());
      break;
    case "hour":
      e = this._d.valueOf(), e -= Ut(
        e + (this._isUTC ? 0 : this.utcOffset() * It),
        rs
      );
      break;
    case "minute":
      e = this._d.valueOf(), e -= Ut(e, It);
      break;
    case "second":
      e = this._d.valueOf(), e -= Ut(e, ss);
      break;
  }
  return this._d.setTime(e), w.updateOffset(this, !0), this;
}
function Jf(t) {
  var e, n;
  if (t = Pe(t), t === void 0 || t === "millisecond" || !this.isValid())
    return this;
  switch (n = this._isUTC ? ua : ca, t) {
    case "year":
      e = n(this.year() + 1, 0, 1) - 1;
      break;
    case "quarter":
      e = n(
        this.year(),
        this.month() - this.month() % 3 + 3,
        1
      ) - 1;
      break;
    case "month":
      e = n(this.year(), this.month() + 1, 1) - 1;
      break;
    case "week":
      e = n(
        this.year(),
        this.month(),
        this.date() - this.weekday() + 7
      ) - 1;
      break;
    case "isoWeek":
      e = n(
        this.year(),
        this.month(),
        this.date() - (this.isoWeekday() - 1) + 7
      ) - 1;
      break;
    case "day":
    case "date":
      e = n(this.year(), this.month(), this.date() + 1) - 1;
      break;
    case "hour":
      e = this._d.valueOf(), e += rs - Ut(
        e + (this._isUTC ? 0 : this.utcOffset() * It),
        rs
      ) - 1;
      break;
    case "minute":
      e = this._d.valueOf(), e += It - Ut(e, It) - 1;
      break;
    case "second":
      e = this._d.valueOf(), e += ss - Ut(e, ss) - 1;
      break;
  }
  return this._d.setTime(e), w.updateOffset(this, !0), this;
}
function Xf() {
  return this._d.valueOf() - (this._offset || 0) * 6e4;
}
function Kf() {
  return Math.floor(this.valueOf() / 1e3);
}
function eh() {
  return new Date(this.valueOf());
}
function th() {
  var t = this;
  return [
    t.year(),
    t.month(),
    t.date(),
    t.hour(),
    t.minute(),
    t.second(),
    t.millisecond()
  ];
}
function nh() {
  var t = this;
  return {
    years: t.year(),
    months: t.month(),
    date: t.date(),
    hours: t.hours(),
    minutes: t.minutes(),
    seconds: t.seconds(),
    milliseconds: t.milliseconds()
  };
}
function sh() {
  return this.isValid() ? this.toISOString() : null;
}
function rh() {
  return qr(this);
}
function ih() {
  return dt({}, A(this));
}
function oh() {
  return A(this).overflow;
}
function ah() {
  return {
    input: this._i,
    format: this._f,
    locale: this._locale,
    isUTC: this._isUTC,
    strict: this._strict
  };
}
T("N", 0, 0, "eraAbbr");
T("NN", 0, 0, "eraAbbr");
T("NNN", 0, 0, "eraAbbr");
T("NNNN", 0, 0, "eraName");
T("NNNNN", 0, 0, "eraNarrow");
T("y", ["y", 1], "yo", "eraYear");
T("y", ["yy", 2], 0, "eraYear");
T("y", ["yyy", 3], 0, "eraYear");
T("y", ["yyyy", 4], 0, "eraYear");
x("N", Kr);
x("NN", Kr);
x("NNN", Kr);
x("NNNN", bh);
x("NNNNN", wh);
H(
  ["N", "NN", "NNN", "NNNN", "NNNNN"],
  function(t, e, n, s) {
    var r = n._locale.erasParse(t, s, n._strict);
    r ? A(n).era = r : A(n).invalidEra = t;
  }
);
x("y", Vt);
x("yy", Vt);
x("yyy", Vt);
x("yyyy", Vt);
x("yo", vh);
H(["y", "yy", "yyy", "yyyy"], fe);
H(["yo"], function(t, e, n, s) {
  var r;
  n._locale._eraYearOrdinalRegex && (r = t.match(n._locale._eraYearOrdinalRegex)), n._locale.eraYearOrdinalParse ? e[fe] = n._locale.eraYearOrdinalParse(t, r) : e[fe] = parseInt(t, 10);
});
function lh(t, e) {
  var n, s, r, i = this._eras || lt("en")._eras;
  for (n = 0, s = i.length; n < s; ++n) {
    switch (typeof i[n].since) {
      case "string":
        r = w(i[n].since).startOf("day"), i[n].since = r.valueOf();
        break;
    }
    switch (typeof i[n].until) {
      case "undefined":
        i[n].until = 1 / 0;
        break;
      case "string":
        r = w(i[n].until).startOf("day").valueOf(), i[n].until = r.valueOf();
        break;
    }
  }
  return i;
}
function ch(t, e, n) {
  var s, r, i = this.eras(), o, a, l;
  for (t = t.toUpperCase(), s = 0, r = i.length; s < r; ++s)
    if (o = i[s].name.toUpperCase(), a = i[s].abbr.toUpperCase(), l = i[s].narrow.toUpperCase(), n)
      switch (e) {
        case "N":
        case "NN":
        case "NNN":
          if (a === t)
            return i[s];
          break;
        case "NNNN":
          if (o === t)
            return i[s];
          break;
        case "NNNNN":
          if (l === t)
            return i[s];
          break;
      }
    else if ([o, a, l].indexOf(t) >= 0)
      return i[s];
}
function uh(t, e) {
  var n = t.since <= t.until ? 1 : -1;
  return e === void 0 ? w(t.since).year() : w(t.since).year() + (e - t.offset) * n;
}
function fh() {
  var t, e, n, s = this.localeData().eras();
  for (t = 0, e = s.length; t < e; ++t)
    if (n = this.clone().startOf("day").valueOf(), s[t].since <= n && n <= s[t].until || s[t].until <= n && n <= s[t].since)
      return s[t].name;
  return "";
}
function hh() {
  var t, e, n, s = this.localeData().eras();
  for (t = 0, e = s.length; t < e; ++t)
    if (n = this.clone().startOf("day").valueOf(), s[t].since <= n && n <= s[t].until || s[t].until <= n && n <= s[t].since)
      return s[t].narrow;
  return "";
}
function dh() {
  var t, e, n, s = this.localeData().eras();
  for (t = 0, e = s.length; t < e; ++t)
    if (n = this.clone().startOf("day").valueOf(), s[t].since <= n && n <= s[t].until || s[t].until <= n && n <= s[t].since)
      return s[t].abbr;
  return "";
}
function ph() {
  var t, e, n, s, r = this.localeData().eras();
  for (t = 0, e = r.length; t < e; ++t)
    if (n = r[t].since <= r[t].until ? 1 : -1, s = this.clone().startOf("day").valueOf(), r[t].since <= s && s <= r[t].until || r[t].until <= s && s <= r[t].since)
      return (this.year() - w(r[t].since).year()) * n + r[t].offset;
  return this.year();
}
function mh(t) {
  return I(this, "_erasNameRegex") || ei.call(this), t ? this._erasNameRegex : this._erasRegex;
}
function gh(t) {
  return I(this, "_erasAbbrRegex") || ei.call(this), t ? this._erasAbbrRegex : this._erasRegex;
}
function yh(t) {
  return I(this, "_erasNarrowRegex") || ei.call(this), t ? this._erasNarrowRegex : this._erasRegex;
}
function Kr(t, e) {
  return e.erasAbbrRegex(t);
}
function bh(t, e) {
  return e.erasNameRegex(t);
}
function wh(t, e) {
  return e.erasNarrowRegex(t);
}
function vh(t, e) {
  return e._eraYearOrdinalRegex || Vt;
}
function ei() {
  var t = [], e = [], n = [], s = [], r, i, o = this.eras();
  for (r = 0, i = o.length; r < i; ++r)
    e.push(Te(o[r].name)), t.push(Te(o[r].abbr)), n.push(Te(o[r].narrow)), s.push(Te(o[r].name)), s.push(Te(o[r].abbr)), s.push(Te(o[r].narrow));
  this._erasRegex = new RegExp("^(" + s.join("|") + ")", "i"), this._erasNameRegex = new RegExp("^(" + e.join("|") + ")", "i"), this._erasAbbrRegex = new RegExp("^(" + t.join("|") + ")", "i"), this._erasNarrowRegex = new RegExp(
    "^(" + n.join("|") + ")",
    "i"
  );
}
T(0, ["gg", 2], 0, function() {
  return this.weekYear() % 100;
});
T(0, ["GG", 2], 0, function() {
  return this.isoWeekYear() % 100;
});
function Es(t, e) {
  T(0, [t, t.length], 0, e);
}
Es("gggg", "weekYear");
Es("ggggg", "weekYear");
Es("GGGG", "isoWeekYear");
Es("GGGGG", "isoWeekYear");
he("weekYear", "gg");
he("isoWeekYear", "GG");
de("weekYear", 1);
de("isoWeekYear", 1);
x("G", Ss);
x("g", Ss);
x("GG", Z, Ae);
x("gg", Z, Ae);
x("GGGG", zr, Fr);
x("gggg", zr, Fr);
x("GGGGG", xs, vs);
x("ggggg", xs, vs);
_n(
  ["gggg", "ggggg", "GGGG", "GGGGG"],
  function(t, e, n, s) {
    e[s.substr(0, 2)] = C(t);
  }
);
_n(["gg", "GG"], function(t, e, n, s) {
  e[s] = w.parseTwoDigitYear(t);
});
function _h(t) {
  return fa.call(
    this,
    t,
    this.week(),
    this.weekday(),
    this.localeData()._week.dow,
    this.localeData()._week.doy
  );
}
function xh(t) {
  return fa.call(
    this,
    t,
    this.isoWeek(),
    this.isoWeekday(),
    1,
    4
  );
}
function Sh() {
  return st(this.year(), 1, 4);
}
function kh() {
  return st(this.isoWeekYear(), 1, 4);
}
function Th() {
  var t = this.localeData()._week;
  return st(this.year(), t.dow, t.doy);
}
function Dh() {
  var t = this.localeData()._week;
  return st(this.weekYear(), t.dow, t.doy);
}
function fa(t, e, n, s, r) {
  var i;
  return t == null ? on(this, s, r).year : (i = st(t, s, r), e > i && (e = i), Oh.call(this, t, e, n, s, r));
}
function Oh(t, e, n, s, r) {
  var i = Bo(t, e, n, s, r), o = rn(i.year, 0, i.dayOfYear);
  return this.year(o.getUTCFullYear()), this.month(o.getUTCMonth()), this.date(o.getUTCDate()), this;
}
T("Q", 0, "Qo", "quarter");
he("quarter", "Q");
de("quarter", 7);
x("Q", $o);
H("Q", function(t, e) {
  e[tt] = (C(t) - 1) * 3;
});
function Eh(t) {
  return t == null ? Math.ceil((this.month() + 1) / 3) : this.month((t - 1) * 3 + this.month() % 3);
}
T("D", ["DD", 2], "Do", "date");
he("date", "D");
de("date", 9);
x("D", Z);
x("DD", Z, Ae);
x("Do", function(t, e) {
  return t ? e._dayOfMonthOrdinalParse || e._ordinalParse : e._dayOfMonthOrdinalParseLenient;
});
H(["D", "DD"], Be);
H("Do", function(t, e) {
  e[Be] = C(t.match(Z)[0]);
});
var ha = Ht("Date", !0);
T("DDD", ["DDDD", 3], "DDDo", "dayOfYear");
he("dayOfYear", "DDD");
de("dayOfYear", 4);
x("DDD", _s);
x("DDDD", Lo);
H(["DDD", "DDDD"], function(t, e, n) {
  n._dayOfYear = C(t);
});
function Ah(t) {
  var e = Math.round(
    (this.clone().startOf("day") - this.clone().startOf("year")) / 864e5
  ) + 1;
  return t == null ? e : this.add(t - e, "d");
}
T("m", ["mm", 2], 0, "minute");
he("minute", "m");
de("minute", 14);
x("m", Z);
x("mm", Z, Ae);
H(["m", "mm"], Le);
var Ch = Ht("Minutes", !1);
T("s", ["ss", 2], 0, "second");
he("second", "s");
de("second", 15);
x("s", Z);
x("ss", Z, Ae);
H(["s", "ss"], nt);
var Mh = Ht("Seconds", !1);
T("S", 0, 0, function() {
  return ~~(this.millisecond() / 100);
});
T(0, ["SS", 2], 0, function() {
  return ~~(this.millisecond() / 10);
});
T(0, ["SSS", 3], 0, "millisecond");
T(0, ["SSSS", 4], 0, function() {
  return this.millisecond() * 10;
});
T(0, ["SSSSS", 5], 0, function() {
  return this.millisecond() * 100;
});
T(0, ["SSSSSS", 6], 0, function() {
  return this.millisecond() * 1e3;
});
T(0, ["SSSSSSS", 7], 0, function() {
  return this.millisecond() * 1e4;
});
T(0, ["SSSSSSSS", 8], 0, function() {
  return this.millisecond() * 1e5;
});
T(0, ["SSSSSSSSS", 9], 0, function() {
  return this.millisecond() * 1e6;
});
he("millisecond", "ms");
de("millisecond", 16);
x("S", _s, $o);
x("SS", _s, Ae);
x("SSS", _s, Lo);
var pt, da;
for (pt = "SSSS"; pt.length <= 9; pt += "S")
  x(pt, Vt);
function Ph(t, e) {
  e[xt] = C(("0." + t) * 1e3);
}
for (pt = "S"; pt.length <= 9; pt += "S")
  H(pt, Ph);
da = Ht("Milliseconds", !1);
T("z", 0, 0, "zoneAbbr");
T("zz", 0, 0, "zoneName");
function Rh() {
  return this._isUTC ? "UTC" : "";
}
function $h() {
  return this._isUTC ? "Coordinated Universal Time" : "";
}
var g = wn.prototype;
g.add = Df;
g.calendar = Rf;
g.clone = $f;
g.diff = Yf;
g.endOf = Jf;
g.format = Hf;
g.from = Vf;
g.fromNow = Wf;
g.to = Gf;
g.toNow = Zf;
g.get = Lc;
g.invalidAt = oh;
g.isAfter = Lf;
g.isBefore = Nf;
g.isBetween = qf;
g.isSame = If;
g.isSameOrAfter = Uf;
g.isSameOrBefore = jf;
g.isValid = rh;
g.lang = oa;
g.locale = ia;
g.localeData = aa;
g.max = sf;
g.min = nf;
g.parsingFlags = ih;
g.set = Nc;
g.startOf = Qf;
g.subtract = Of;
g.toArray = th;
g.toObject = nh;
g.toDate = eh;
g.toISOString = zf;
g.inspect = Bf;
typeof Symbol < "u" && Symbol.for != null && (g[Symbol.for("nodejs.util.inspect.custom")] = function() {
  return "Moment<" + this.format() + ">";
});
g.toJSON = sh;
g.toString = Ff;
g.unix = Kf;
g.valueOf = Xf;
g.creationData = ah;
g.eraName = fh;
g.eraNarrow = hh;
g.eraAbbr = dh;
g.eraYear = ph;
g.year = zo;
g.isLeapYear = tu;
g.weekYear = _h;
g.isoWeekYear = xh;
g.quarter = g.quarters = Eh;
g.month = Yo;
g.daysInMonth = Xc;
g.week = g.weeks = au;
g.isoWeek = g.isoWeeks = lu;
g.weeksInYear = Th;
g.weeksInWeekYear = Dh;
g.isoWeeksInYear = Sh;
g.isoWeeksInISOWeekYear = kh;
g.date = ha;
g.day = g.days = _u;
g.weekday = xu;
g.isoWeekday = Su;
g.dayOfYear = Ah;
g.hour = g.hours = Cu;
g.minute = g.minutes = Ch;
g.second = g.seconds = Mh;
g.millisecond = g.milliseconds = da;
g.utcOffset = df;
g.utc = mf;
g.local = gf;
g.parseZone = yf;
g.hasAlignedHourOffset = bf;
g.isDST = wf;
g.isLocal = _f;
g.isUtcOffset = xf;
g.isUtc = ta;
g.isUTC = ta;
g.zoneAbbr = Rh;
g.zoneName = $h;
g.dates = Me(
  "dates accessor is deprecated. Use date instead.",
  ha
);
g.months = Me(
  "months accessor is deprecated. Use month instead",
  Yo
);
g.years = Me(
  "years accessor is deprecated. Use year instead",
  zo
);
g.zone = Me(
  "moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",
  pf
);
g.isDSTShifted = Me(
  "isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",
  vf
);
function Lh(t) {
  return G(t * 1e3);
}
function Nh() {
  return G.apply(null, arguments).parseZone();
}
function pa(t) {
  return t;
}
var U = Ur.prototype;
U.calendar = _c;
U.longDateFormat = Tc;
U.invalidDate = Oc;
U.ordinal = Cc;
U.preparse = pa;
U.postformat = pa;
U.relativeTime = Pc;
U.pastFuture = Rc;
U.set = wc;
U.eras = lh;
U.erasParse = ch;
U.erasConvertYear = uh;
U.erasAbbrRegex = gh;
U.erasNameRegex = mh;
U.erasNarrowRegex = yh;
U.months = Gc;
U.monthsShort = Zc;
U.monthsParse = Jc;
U.monthsRegex = eu;
U.monthsShortRegex = Kc;
U.week = su;
U.firstDayOfYear = ou;
U.firstDayOfWeek = iu;
U.weekdays = gu;
U.weekdaysMin = bu;
U.weekdaysShort = yu;
U.weekdaysParse = vu;
U.weekdaysRegex = ku;
U.weekdaysShortRegex = Tu;
U.weekdaysMinRegex = Du;
U.isPM = Eu;
U.meridiem = Mu;
function is(t, e, n, s) {
  var r = lt(), i = Ge().set(s, e);
  return r[n](i, t);
}
function ma(t, e, n) {
  if (it(t) && (e = t, t = void 0), t = t || "", e != null)
    return is(t, e, n, "month");
  var s, r = [];
  for (s = 0; s < 12; s++)
    r[s] = is(t, s, n, "month");
  return r;
}
function ti(t, e, n, s) {
  typeof t == "boolean" ? (it(e) && (n = e, e = void 0), e = e || "") : (e = t, n = e, t = !1, it(e) && (n = e, e = void 0), e = e || "");
  var r = lt(), i = t ? r._week.dow : 0, o, a = [];
  if (n != null)
    return is(e, (n + i) % 7, s, "day");
  for (o = 0; o < 7; o++)
    a[o] = is(e, (o + i) % 7, s, "day");
  return a;
}
function qh(t, e) {
  return ma(t, e, "months");
}
function Ih(t, e) {
  return ma(t, e, "monthsShort");
}
function Uh(t, e, n) {
  return ti(t, e, n, "weekdays");
}
function jh(t, e, n) {
  return ti(t, e, n, "weekdaysShort");
}
function Yh(t, e, n) {
  return ti(t, e, n, "weekdaysMin");
}
mt("en", {
  eras: [
    {
      since: "0001-01-01",
      until: 1 / 0,
      offset: 1,
      name: "Anno Domini",
      narrow: "AD",
      abbr: "AD"
    },
    {
      since: "0000-12-31",
      until: -1 / 0,
      offset: 1,
      name: "Before Christ",
      narrow: "BC",
      abbr: "BC"
    }
  ],
  dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
  ordinal: function(t) {
    var e = t % 10, n = C(t % 100 / 10) === 1 ? "th" : e === 1 ? "st" : e === 2 ? "nd" : e === 3 ? "rd" : "th";
    return t + n;
  }
});
w.lang = Me(
  "moment.lang is deprecated. Use moment.locale instead.",
  mt
);
w.langData = Me(
  "moment.langData is deprecated. Use moment.localeData instead.",
  lt
);
var Je = Math.abs;
function Fh() {
  var t = this._data;
  return this._milliseconds = Je(this._milliseconds), this._days = Je(this._days), this._months = Je(this._months), t.milliseconds = Je(t.milliseconds), t.seconds = Je(t.seconds), t.minutes = Je(t.minutes), t.hours = Je(t.hours), t.months = Je(t.months), t.years = Je(t.years), this;
}
function ga(t, e, n, s) {
  var r = Ue(e, n);
  return t._milliseconds += s * r._milliseconds, t._days += s * r._days, t._months += s * r._months, t._bubble();
}
function zh(t, e) {
  return ga(this, t, e, 1);
}
function Bh(t, e) {
  return ga(this, t, e, -1);
}
function Li(t) {
  return t < 0 ? Math.floor(t) : Math.ceil(t);
}
function Hh() {
  var t = this._milliseconds, e = this._days, n = this._months, s = this._data, r, i, o, a, l;
  return t >= 0 && e >= 0 && n >= 0 || t <= 0 && e <= 0 && n <= 0 || (t += Li(mr(n) + e) * 864e5, e = 0, n = 0), s.milliseconds = t % 1e3, r = Ce(t / 1e3), s.seconds = r % 60, i = Ce(r / 60), s.minutes = i % 60, o = Ce(i / 60), s.hours = o % 24, e += Ce(o / 24), l = Ce(ya(e)), n += l, e -= Li(mr(l)), a = Ce(n / 12), n %= 12, s.days = e, s.months = n, s.years = a, this;
}
function ya(t) {
  return t * 4800 / 146097;
}
function mr(t) {
  return t * 146097 / 4800;
}
function Vh(t) {
  if (!this.isValid())
    return NaN;
  var e, n, s = this._milliseconds;
  if (t = Pe(t), t === "month" || t === "quarter" || t === "year")
    switch (e = this._days + s / 864e5, n = this._months + ya(e), t) {
      case "month":
        return n;
      case "quarter":
        return n / 3;
      case "year":
        return n / 12;
    }
  else
    switch (e = this._days + Math.round(mr(this._months)), t) {
      case "week":
        return e / 7 + s / 6048e5;
      case "day":
        return e + s / 864e5;
      case "hour":
        return e * 24 + s / 36e5;
      case "minute":
        return e * 1440 + s / 6e4;
      case "second":
        return e * 86400 + s / 1e3;
      case "millisecond":
        return Math.floor(e * 864e5) + s;
      default:
        throw new Error("Unknown unit " + t);
    }
}
function Wh() {
  return this.isValid() ? this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + C(this._months / 12) * 31536e6 : NaN;
}
function ct(t) {
  return function() {
    return this.as(t);
  };
}
var Gh = ct("ms"), Zh = ct("s"), Qh = ct("m"), Jh = ct("h"), Xh = ct("d"), Kh = ct("w"), ed = ct("M"), td = ct("Q"), nd = ct("y");
function sd() {
  return Ue(this);
}
function rd(t) {
  return t = Pe(t), this.isValid() ? this[t + "s"]() : NaN;
}
function Dt(t) {
  return function() {
    return this.isValid() ? this._data[t] : NaN;
  };
}
var id = Dt("milliseconds"), od = Dt("seconds"), ad = Dt("minutes"), ld = Dt("hours"), cd = Dt("days"), ud = Dt("months"), fd = Dt("years");
function hd() {
  return Ce(this.days() / 7);
}
var et = Math.round, $t = {
  ss: 44,
  s: 45,
  m: 45,
  h: 22,
  d: 26,
  w: null,
  M: 11
};
function dd(t, e, n, s, r) {
  return r.relativeTime(e || 1, !!n, t, s);
}
function pd(t, e, n, s) {
  var r = Ue(t).abs(), i = et(r.as("s")), o = et(r.as("m")), a = et(r.as("h")), l = et(r.as("d")), c = et(r.as("M")), u = et(r.as("w")), f = et(r.as("y")), d = i <= n.ss && ["s", i] || i < n.s && ["ss", i] || o <= 1 && ["m"] || o < n.m && ["mm", o] || a <= 1 && ["h"] || a < n.h && ["hh", a] || l <= 1 && ["d"] || l < n.d && ["dd", l];
  return n.w != null && (d = d || u <= 1 && ["w"] || u < n.w && ["ww", u]), d = d || c <= 1 && ["M"] || c < n.M && ["MM", c] || f <= 1 && ["y"] || ["yy", f], d[2] = e, d[3] = +t > 0, d[4] = s, dd.apply(null, d);
}
function md(t) {
  return t === void 0 ? et : typeof t == "function" ? (et = t, !0) : !1;
}
function gd(t, e) {
  return $t[t] === void 0 ? !1 : e === void 0 ? $t[t] : ($t[t] = e, t === "s" && ($t.ss = e - 1), !0);
}
function yd(t, e) {
  if (!this.isValid())
    return this.localeData().invalidDate();
  var n = !1, s = $t, r, i;
  return typeof t == "object" && (e = t, t = !1), typeof t == "boolean" && (n = t), typeof e == "object" && (s = Object.assign({}, $t, e), e.s != null && e.ss == null && (s.ss = e.s - 1)), r = this.localeData(), i = pd(this, !n, s, r), n && (i = r.pastFuture(+this, i)), r.postformat(i);
}
var Js = Math.abs;
function Mt(t) {
  return (t > 0) - (t < 0) || +t;
}
function As() {
  if (!this.isValid())
    return this.localeData().invalidDate();
  var t = Js(this._milliseconds) / 1e3, e = Js(this._days), n = Js(this._months), s, r, i, o, a = this.asSeconds(), l, c, u, f;
  return a ? (s = Ce(t / 60), r = Ce(s / 60), t %= 60, s %= 60, i = Ce(n / 12), n %= 12, o = t ? t.toFixed(3).replace(/\.?0+$/, "") : "", l = a < 0 ? "-" : "", c = Mt(this._months) !== Mt(a) ? "-" : "", u = Mt(this._days) !== Mt(a) ? "-" : "", f = Mt(this._milliseconds) !== Mt(a) ? "-" : "", l + "P" + (i ? c + i + "Y" : "") + (n ? c + n + "M" : "") + (e ? u + e + "D" : "") + (r || s || t ? "T" : "") + (r ? f + r + "H" : "") + (s ? f + s + "M" : "") + (t ? f + o + "S" : "")) : "P0D";
}
var N = Os.prototype;
N.isValid = cf;
N.abs = Fh;
N.add = zh;
N.subtract = Bh;
N.as = Vh;
N.asMilliseconds = Gh;
N.asSeconds = Zh;
N.asMinutes = Qh;
N.asHours = Jh;
N.asDays = Xh;
N.asWeeks = Kh;
N.asMonths = ed;
N.asQuarters = td;
N.asYears = nd;
N.valueOf = Wh;
N._bubble = Hh;
N.clone = sd;
N.get = rd;
N.milliseconds = id;
N.seconds = od;
N.minutes = ad;
N.hours = ld;
N.days = cd;
N.weeks = hd;
N.months = ud;
N.years = fd;
N.humanize = yd;
N.toISOString = As;
N.toString = As;
N.toJSON = As;
N.locale = ia;
N.localeData = aa;
N.toIsoString = Me(
  "toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",
  As
);
N.lang = oa;
T("X", 0, 0, "unix");
T("x", 0, 0, "valueOf");
x("x", Ss);
x("X", Ic);
H("X", function(t, e, n) {
  n._d = new Date(parseFloat(t) * 1e3);
});
H("x", function(t, e, n) {
  n._d = new Date(C(t));
});
//! moment.js
w.version = "2.29.4";
yc(G);
w.fn = g;
w.min = rf;
w.max = of;
w.now = af;
w.utc = Ge;
w.unix = Lh;
w.months = qh;
w.isDate = bn;
w.locale = mt;
w.invalid = bs;
w.duration = Ue;
w.isMoment = qe;
w.weekdays = Uh;
w.parseZone = Nh;
w.localeData = lt;
w.isDuration = Wn;
w.monthsShort = Ih;
w.weekdaysMin = Yh;
w.defineLocale = Wr;
w.updateLocale = Lu;
w.locales = Nu;
w.weekdaysShort = jh;
w.normalizeUnits = Pe;
w.relativeTimeRounding = md;
w.relativeTimeThreshold = gd;
w.calendarFormat = Pf;
w.prototype = g;
w.HTML5_FMT = {
  DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
  DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
  DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
  DATE: "YYYY-MM-DD",
  TIME: "HH:mm",
  TIME_SECONDS: "HH:mm:ss",
  TIME_MS: "HH:mm:ss.SSS",
  WEEK: "GGGG-[W]WW",
  MONTH: "YYYY-MM"
};
const bd = /\B([A-Z])/g, wd = (t) => t.replace(bd, "-$1").toLowerCase();
function xn(t) {
  return Lr((e, n) => {
    const s = t || wd(n);
    e.emits || (e.emits = []), e.emits.push(s);
    const r = e.methods[n];
    e.methods[n] = function(...o) {
      const a = (c) => {
        c === void 0 ? o.length === 0 ? this.$emit(s) : o.length === 1 ? this.$emit(s, o[0]) : this.$emit(s, ...o) : (o.unshift(c), this.$emit(s, ...o));
      }, l = r.apply(this, o);
      return vd(l) ? l.then(a) : a(l), l;
    };
  });
}
function vd(t) {
  return t instanceof Promise || t && typeof t.then == "function";
}
function Wt(t) {
  return Lr((e, n) => {
    e.props || (e.props = /* @__PURE__ */ Object.create(null)), e.props[n] = t;
  });
}
function _d(t, e) {
  return Lr((n, s) => {
    n.watch || (n.watch = /* @__PURE__ */ Object.create(null));
    const r = n.watch;
    typeof r[t] == "object" && !Array.isArray(r[t]) ? r[t] = [r[t]] : typeof r[t] > "u" && (r[t] = []), r[t].push(Object.assign({ handler: s }, e));
  });
}
function ba() {
  return {
    async: !1,
    baseUrl: null,
    breaks: !1,
    extensions: null,
    gfm: !0,
    headerIds: !0,
    headerPrefix: "",
    highlight: null,
    langPrefix: "language-",
    mangle: !0,
    pedantic: !1,
    renderer: null,
    sanitize: !1,
    sanitizer: null,
    silent: !1,
    smartypants: !1,
    tokenizer: null,
    walkTokens: null,
    xhtml: !1
  };
}
let Gt = ba();
function xd(t) {
  Gt = t;
}
const wa = /[&<>"']/, Sd = new RegExp(wa.source, "g"), va = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, kd = new RegExp(va.source, "g"), Td = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Ni = (t) => Td[t];
function ue(t, e) {
  if (e) {
    if (wa.test(t))
      return t.replace(Sd, Ni);
  } else if (va.test(t))
    return t.replace(kd, Ni);
  return t;
}
const Dd = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
function _a(t) {
  return t.replace(Dd, (e, n) => (n = n.toLowerCase(), n === "colon" ? ":" : n.charAt(0) === "#" ? n.charAt(1) === "x" ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1)) : ""));
}
const Od = /(^|[^\[])\^/g;
function V(t, e) {
  t = typeof t == "string" ? t : t.source, e = e || "";
  const n = {
    replace: (s, r) => (r = r.source || r, r = r.replace(Od, "$1"), t = t.replace(s, r), n),
    getRegex: () => new RegExp(t, e)
  };
  return n;
}
const Ed = /[^\w:]/g, Ad = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
function qi(t, e, n) {
  if (t) {
    let s;
    try {
      s = decodeURIComponent(_a(n)).replace(Ed, "").toLowerCase();
    } catch {
      return null;
    }
    if (s.indexOf("javascript:") === 0 || s.indexOf("vbscript:") === 0 || s.indexOf("data:") === 0)
      return null;
  }
  e && !Ad.test(n) && (n = Rd(e, n));
  try {
    n = encodeURI(n).replace(/%25/g, "%");
  } catch {
    return null;
  }
  return n;
}
const Pn = {}, Cd = /^[^:]+:\/*[^/]*$/, Md = /^([^:]+:)[\s\S]*$/, Pd = /^([^:]+:\/*[^/]*)[\s\S]*$/;
function Rd(t, e) {
  Pn[" " + t] || (Cd.test(t) ? Pn[" " + t] = t + "/" : Pn[" " + t] = Zn(t, "/", !0)), t = Pn[" " + t];
  const n = t.indexOf(":") === -1;
  return e.substring(0, 2) === "//" ? n ? e : t.replace(Md, "$1") + e : e.charAt(0) === "/" ? n ? e : t.replace(Pd, "$1") + e : t + e;
}
const os = { exec: function() {
} };
function je(t) {
  let e = 1, n, s;
  for (; e < arguments.length; e++) {
    n = arguments[e];
    for (s in n)
      Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
  }
  return t;
}
function Ii(t, e) {
  const n = t.replace(/\|/g, (i, o, a) => {
    let l = !1, c = o;
    for (; --c >= 0 && a[c] === "\\"; )
      l = !l;
    return l ? "|" : " |";
  }), s = n.split(/ \|/);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !s[s.length - 1].trim() && s.pop(), s.length > e)
    s.splice(e);
  else
    for (; s.length < e; )
      s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(/\\\|/g, "|");
  return s;
}
function Zn(t, e, n) {
  const s = t.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s; ) {
    const i = t.charAt(s - r - 1);
    if (i === e && !n)
      r++;
    else if (i !== e && n)
      r++;
    else
      break;
  }
  return t.slice(0, s - r);
}
function $d(t, e) {
  if (t.indexOf(e[1]) === -1)
    return -1;
  const n = t.length;
  let s = 0, r = 0;
  for (; r < n; r++)
    if (t[r] === "\\")
      r++;
    else if (t[r] === e[0])
      s++;
    else if (t[r] === e[1] && (s--, s < 0))
      return r;
  return -1;
}
function xa(t) {
  t && t.sanitize && !t.silent && console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");
}
function Ui(t, e) {
  if (e < 1)
    return "";
  let n = "";
  for (; e > 1; )
    e & 1 && (n += t), e >>= 1, t += t;
  return n + t;
}
function ji(t, e, n, s) {
  const r = e.href, i = e.title ? ue(e.title) : null, o = t[1].replace(/\\([\[\]])/g, "$1");
  if (t[0].charAt(0) !== "!") {
    s.state.inLink = !0;
    const a = {
      type: "link",
      raw: n,
      href: r,
      title: i,
      text: o,
      tokens: s.inlineTokens(o)
    };
    return s.state.inLink = !1, a;
  }
  return {
    type: "image",
    raw: n,
    href: r,
    title: i,
    text: ue(o)
  };
}
function Ld(t, e) {
  const n = t.match(/^(\s+)(?:```)/);
  if (n === null)
    return e;
  const s = n[1];
  return e.split(`
`).map((r) => {
    const i = r.match(/^\s+/);
    if (i === null)
      return r;
    const [o] = i;
    return o.length >= s.length ? r.slice(s.length) : r;
  }).join(`
`);
}
class ni {
  constructor(e) {
    this.options = e || Gt;
  }
  space(e) {
    const n = this.rules.block.newline.exec(e);
    if (n && n[0].length > 0)
      return {
        type: "space",
        raw: n[0]
      };
  }
  code(e) {
    const n = this.rules.block.code.exec(e);
    if (n) {
      const s = n[0].replace(/^ {1,4}/gm, "");
      return {
        type: "code",
        raw: n[0],
        codeBlockStyle: "indented",
        text: this.options.pedantic ? s : Zn(s, `
`)
      };
    }
  }
  fences(e) {
    const n = this.rules.block.fences.exec(e);
    if (n) {
      const s = n[0], r = Ld(s, n[3] || "");
      return {
        type: "code",
        raw: s,
        lang: n[2] ? n[2].trim().replace(this.rules.inline._escapes, "$1") : n[2],
        text: r
      };
    }
  }
  heading(e) {
    const n = this.rules.block.heading.exec(e);
    if (n) {
      let s = n[2].trim();
      if (/#$/.test(s)) {
        const r = Zn(s, "#");
        (this.options.pedantic || !r || / $/.test(r)) && (s = r.trim());
      }
      return {
        type: "heading",
        raw: n[0],
        depth: n[1].length,
        text: s,
        tokens: this.lexer.inline(s)
      };
    }
  }
  hr(e) {
    const n = this.rules.block.hr.exec(e);
    if (n)
      return {
        type: "hr",
        raw: n[0]
      };
  }
  blockquote(e) {
    const n = this.rules.block.blockquote.exec(e);
    if (n) {
      const s = n[0].replace(/^ *>[ \t]?/gm, "");
      return {
        type: "blockquote",
        raw: n[0],
        tokens: this.lexer.blockTokens(s, []),
        text: s
      };
    }
  }
  list(e) {
    let n = this.rules.block.list.exec(e);
    if (n) {
      let s, r, i, o, a, l, c, u, f, d, h, y, b = n[1].trim();
      const m = b.length > 1, k = {
        type: "list",
        raw: "",
        ordered: m,
        start: m ? +b.slice(0, -1) : "",
        loose: !1,
        items: []
      };
      b = m ? `\\d{1,9}\\${b.slice(-1)}` : `\\${b}`, this.options.pedantic && (b = m ? b : "[*+-]");
      const P = new RegExp(`^( {0,3}${b})((?:[	 ][^\\n]*)?(?:\\n|$))`);
      for (; e && (y = !1, !(!(n = P.exec(e)) || this.rules.block.hr.test(e))); ) {
        if (s = n[0], e = e.substring(s.length), u = n[2].split(`
`, 1)[0], f = e.split(`
`, 1)[0], this.options.pedantic ? (o = 2, h = u.trimLeft()) : (o = n[2].search(/[^ ]/), o = o > 4 ? 1 : o, h = u.slice(o), o += n[1].length), l = !1, !u && /^ *$/.test(f) && (s += f + `
`, e = e.substring(f.length + 1), y = !0), !y) {
          const q = new RegExp(`^ {0,${Math.min(3, o - 1)}}(?:[*+-]|\\d{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))`), Q = new RegExp(`^ {0,${Math.min(3, o - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), J = new RegExp(`^ {0,${Math.min(3, o - 1)}}(?:\`\`\`|~~~)`), ie = new RegExp(`^ {0,${Math.min(3, o - 1)}}#`);
          for (; e && (d = e.split(`
`, 1)[0], u = d, this.options.pedantic && (u = u.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ")), !(J.test(u) || ie.test(u) || q.test(u) || Q.test(e))); ) {
            if (u.search(/[^ ]/) >= o || !u.trim())
              h += `
` + u.slice(o);
            else if (!l)
              h += `
` + u;
            else
              break;
            !l && !u.trim() && (l = !0), s += d + `
`, e = e.substring(d.length + 1);
          }
        }
        k.loose || (c ? k.loose = !0 : /\n *\n *$/.test(s) && (c = !0)), this.options.gfm && (r = /^\[[ xX]\] /.exec(h), r && (i = r[0] !== "[ ] ", h = h.replace(/^\[[ xX]\] +/, ""))), k.items.push({
          type: "list_item",
          raw: s,
          task: !!r,
          checked: i,
          loose: !1,
          text: h
        }), k.raw += s;
      }
      k.items[k.items.length - 1].raw = s.trimRight(), k.items[k.items.length - 1].text = h.trimRight(), k.raw = k.raw.trimRight();
      const te = k.items.length;
      for (a = 0; a < te; a++) {
        this.lexer.state.top = !1, k.items[a].tokens = this.lexer.blockTokens(k.items[a].text, []);
        const q = k.items[a].tokens.filter((J) => J.type === "space"), Q = q.every((J) => {
          const ie = J.raw.split("");
          let oe = 0;
          for (const ge of ie)
            if (ge === `
` && (oe += 1), oe > 1)
              return !0;
          return !1;
        });
        !k.loose && q.length && Q && (k.loose = !0, k.items[a].loose = !0);
      }
      return k;
    }
  }
  html(e) {
    const n = this.rules.block.html.exec(e);
    if (n) {
      const s = {
        type: "html",
        raw: n[0],
        pre: !this.options.sanitizer && (n[1] === "pre" || n[1] === "script" || n[1] === "style"),
        text: n[0]
      };
      if (this.options.sanitize) {
        const r = this.options.sanitizer ? this.options.sanitizer(n[0]) : ue(n[0]);
        s.type = "paragraph", s.text = r, s.tokens = this.lexer.inline(r);
      }
      return s;
    }
  }
  def(e) {
    const n = this.rules.block.def.exec(e);
    if (n) {
      const s = n[1].toLowerCase().replace(/\s+/g, " "), r = n[2] ? n[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline._escapes, "$1") : "", i = n[3] ? n[3].substring(1, n[3].length - 1).replace(this.rules.inline._escapes, "$1") : n[3];
      return {
        type: "def",
        tag: s,
        raw: n[0],
        href: r,
        title: i
      };
    }
  }
  table(e) {
    const n = this.rules.block.table.exec(e);
    if (n) {
      const s = {
        type: "table",
        header: Ii(n[1]).map((r) => ({ text: r })),
        align: n[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
        rows: n[3] && n[3].trim() ? n[3].replace(/\n[ \t]*$/, "").split(`
`) : []
      };
      if (s.header.length === s.align.length) {
        s.raw = n[0];
        let r = s.align.length, i, o, a, l;
        for (i = 0; i < r; i++)
          /^ *-+: *$/.test(s.align[i]) ? s.align[i] = "right" : /^ *:-+: *$/.test(s.align[i]) ? s.align[i] = "center" : /^ *:-+ *$/.test(s.align[i]) ? s.align[i] = "left" : s.align[i] = null;
        for (r = s.rows.length, i = 0; i < r; i++)
          s.rows[i] = Ii(s.rows[i], s.header.length).map((c) => ({ text: c }));
        for (r = s.header.length, o = 0; o < r; o++)
          s.header[o].tokens = this.lexer.inline(s.header[o].text);
        for (r = s.rows.length, o = 0; o < r; o++)
          for (l = s.rows[o], a = 0; a < l.length; a++)
            l[a].tokens = this.lexer.inline(l[a].text);
        return s;
      }
    }
  }
  lheading(e) {
    const n = this.rules.block.lheading.exec(e);
    if (n)
      return {
        type: "heading",
        raw: n[0],
        depth: n[2].charAt(0) === "=" ? 1 : 2,
        text: n[1],
        tokens: this.lexer.inline(n[1])
      };
  }
  paragraph(e) {
    const n = this.rules.block.paragraph.exec(e);
    if (n) {
      const s = n[1].charAt(n[1].length - 1) === `
` ? n[1].slice(0, -1) : n[1];
      return {
        type: "paragraph",
        raw: n[0],
        text: s,
        tokens: this.lexer.inline(s)
      };
    }
  }
  text(e) {
    const n = this.rules.block.text.exec(e);
    if (n)
      return {
        type: "text",
        raw: n[0],
        text: n[0],
        tokens: this.lexer.inline(n[0])
      };
  }
  escape(e) {
    const n = this.rules.inline.escape.exec(e);
    if (n)
      return {
        type: "escape",
        raw: n[0],
        text: ue(n[1])
      };
  }
  tag(e) {
    const n = this.rules.inline.tag.exec(e);
    if (n)
      return !this.lexer.state.inLink && /^<a /i.test(n[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && /^<\/a>/i.test(n[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(n[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(n[0]) && (this.lexer.state.inRawBlock = !1), {
        type: this.options.sanitize ? "text" : "html",
        raw: n[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(n[0]) : ue(n[0]) : n[0]
      };
  }
  link(e) {
    const n = this.rules.inline.link.exec(e);
    if (n) {
      const s = n[2].trim();
      if (!this.options.pedantic && /^</.test(s)) {
        if (!/>$/.test(s))
          return;
        const o = Zn(s.slice(0, -1), "\\");
        if ((s.length - o.length) % 2 === 0)
          return;
      } else {
        const o = $d(n[2], "()");
        if (o > -1) {
          const l = (n[0].indexOf("!") === 0 ? 5 : 4) + n[1].length + o;
          n[2] = n[2].substring(0, o), n[0] = n[0].substring(0, l).trim(), n[3] = "";
        }
      }
      let r = n[2], i = "";
      if (this.options.pedantic) {
        const o = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(r);
        o && (r = o[1], i = o[3]);
      } else
        i = n[3] ? n[3].slice(1, -1) : "";
      return r = r.trim(), /^</.test(r) && (this.options.pedantic && !/>$/.test(s) ? r = r.slice(1) : r = r.slice(1, -1)), ji(n, {
        href: r && r.replace(this.rules.inline._escapes, "$1"),
        title: i && i.replace(this.rules.inline._escapes, "$1")
      }, n[0], this.lexer);
    }
  }
  reflink(e, n) {
    let s;
    if ((s = this.rules.inline.reflink.exec(e)) || (s = this.rules.inline.nolink.exec(e))) {
      let r = (s[2] || s[1]).replace(/\s+/g, " ");
      if (r = n[r.toLowerCase()], !r) {
        const i = s[0].charAt(0);
        return {
          type: "text",
          raw: i,
          text: i
        };
      }
      return ji(s, r, s[0], this.lexer);
    }
  }
  emStrong(e, n, s = "") {
    let r = this.rules.inline.emStrong.lDelim.exec(e);
    if (!r || r[3] && s.match(/[\p{L}\p{N}]/u))
      return;
    const i = r[1] || r[2] || "";
    if (!i || i && (s === "" || this.rules.inline.punctuation.exec(s))) {
      const o = r[0].length - 1;
      let a, l, c = o, u = 0;
      const f = r[0][0] === "*" ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
      for (f.lastIndex = 0, n = n.slice(-1 * e.length + o); (r = f.exec(n)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a)
          continue;
        if (l = a.length, r[3] || r[4]) {
          c += l;
          continue;
        } else if ((r[5] || r[6]) && o % 3 && !((o + l) % 3)) {
          u += l;
          continue;
        }
        if (c -= l, c > 0)
          continue;
        l = Math.min(l, l + c + u);
        const d = e.slice(0, o + r.index + (r[0].length - a.length) + l);
        if (Math.min(o, l) % 2) {
          const y = d.slice(1, -1);
          return {
            type: "em",
            raw: d,
            text: y,
            tokens: this.lexer.inlineTokens(y)
          };
        }
        const h = d.slice(2, -2);
        return {
          type: "strong",
          raw: d,
          text: h,
          tokens: this.lexer.inlineTokens(h)
        };
      }
    }
  }
  codespan(e) {
    const n = this.rules.inline.code.exec(e);
    if (n) {
      let s = n[2].replace(/\n/g, " ");
      const r = /[^ ]/.test(s), i = /^ /.test(s) && / $/.test(s);
      return r && i && (s = s.substring(1, s.length - 1)), s = ue(s, !0), {
        type: "codespan",
        raw: n[0],
        text: s
      };
    }
  }
  br(e) {
    const n = this.rules.inline.br.exec(e);
    if (n)
      return {
        type: "br",
        raw: n[0]
      };
  }
  del(e) {
    const n = this.rules.inline.del.exec(e);
    if (n)
      return {
        type: "del",
        raw: n[0],
        text: n[2],
        tokens: this.lexer.inlineTokens(n[2])
      };
  }
  autolink(e, n) {
    const s = this.rules.inline.autolink.exec(e);
    if (s) {
      let r, i;
      return s[2] === "@" ? (r = ue(this.options.mangle ? n(s[1]) : s[1]), i = "mailto:" + r) : (r = ue(s[1]), i = r), {
        type: "link",
        raw: s[0],
        text: r,
        href: i,
        tokens: [
          {
            type: "text",
            raw: r,
            text: r
          }
        ]
      };
    }
  }
  url(e, n) {
    let s;
    if (s = this.rules.inline.url.exec(e)) {
      let r, i;
      if (s[2] === "@")
        r = ue(this.options.mangle ? n(s[0]) : s[0]), i = "mailto:" + r;
      else {
        let o;
        do
          o = s[0], s[0] = this.rules.inline._backpedal.exec(s[0])[0];
        while (o !== s[0]);
        r = ue(s[0]), s[1] === "www." ? i = "http://" + r : i = r;
      }
      return {
        type: "link",
        raw: s[0],
        text: r,
        href: i,
        tokens: [
          {
            type: "text",
            raw: r,
            text: r
          }
        ]
      };
    }
  }
  inlineText(e, n) {
    const s = this.rules.inline.text.exec(e);
    if (s) {
      let r;
      return this.lexer.state.inRawBlock ? r = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(s[0]) : ue(s[0]) : s[0] : r = ue(this.options.smartypants ? n(s[0]) : s[0]), {
        type: "text",
        raw: s[0],
        text: r
      };
    }
  }
}
const O = {
  newline: /^(?: *(?:\n|$))+/,
  code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
  fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
  hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
  heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
  html: "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",
  def: /^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
  table: os,
  lheading: /^((?:.|\n(?!\n))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
  text: /^[^\n]+/
};
O._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
O._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
O.def = V(O.def).replace("label", O._label).replace("title", O._title).getRegex();
O.bullet = /(?:[*+-]|\d{1,9}[.)])/;
O.listItemStart = V(/^( *)(bull) */).replace("bull", O.bullet).getRegex();
O.list = V(O.list).replace(/bull/g, O.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + O.def.source + ")").getRegex();
O._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
O._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
O.html = V(O.html, "i").replace("comment", O._comment).replace("tag", O._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
O.paragraph = V(O._paragraph).replace("hr", O.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", O._tag).getRegex();
O.blockquote = V(O.blockquote).replace("paragraph", O.paragraph).getRegex();
O.normal = je({}, O);
O.gfm = je({}, O.normal, {
  table: "^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
});
O.gfm.table = V(O.gfm.table).replace("hr", O.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", O._tag).getRegex();
O.gfm.paragraph = V(O._paragraph).replace("hr", O.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("table", O.gfm.table).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", O._tag).getRegex();
O.pedantic = je({}, O.normal, {
  html: V(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", O._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: os,
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: V(O.normal._paragraph).replace("hr", O.hr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", O.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
});
const S = {
  escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  url: os,
  tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
  link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
  reflink: /^!?\[(label)\]\[(ref)\]/,
  nolink: /^!?\[(ref)\](?:\[\])?/,
  reflinkSearch: "reflink|nolink(?!\\()",
  emStrong: {
    lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
    rDelimAst: /^(?:[^_*\\]|\\.)*?\_\_(?:[^_*\\]|\\.)*?\*(?:[^_*\\]|\\.)*?(?=\_\_)|(?:[^*\\]|\\.)+(?=[^*])|[punct_](\*+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|(?:[^punct*_\s\\]|\\.)(\*+)(?=[^punct*_\s])/,
    rDelimUnd: /^(?:[^_*\\]|\\.)*?\*\*(?:[^_*\\]|\\.)*?\_(?:[^_*\\]|\\.)*?(?=\*\*)|(?:[^_\\]|\\.)+(?=[^_])|[punct*](\_+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/
  },
  code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  br: /^( {2,}|\\)\n(?!\s*$)/,
  del: os,
  text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
  punctuation: /^([\spunctuation])/
};
S._punctuation = "!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~";
S.punctuation = V(S.punctuation).replace(/punctuation/g, S._punctuation).getRegex();
S.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
S.escapedEmSt = /(?:^|[^\\])(?:\\\\)*\\[*_]/g;
S._comment = V(O._comment).replace("(?:-->|$)", "-->").getRegex();
S.emStrong.lDelim = V(S.emStrong.lDelim).replace(/punct/g, S._punctuation).getRegex();
S.emStrong.rDelimAst = V(S.emStrong.rDelimAst, "g").replace(/punct/g, S._punctuation).getRegex();
S.emStrong.rDelimUnd = V(S.emStrong.rDelimUnd, "g").replace(/punct/g, S._punctuation).getRegex();
S._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
S._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
S._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
S.autolink = V(S.autolink).replace("scheme", S._scheme).replace("email", S._email).getRegex();
S._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
S.tag = V(S.tag).replace("comment", S._comment).replace("attribute", S._attribute).getRegex();
S._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
S._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
S._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
S.link = V(S.link).replace("label", S._label).replace("href", S._href).replace("title", S._title).getRegex();
S.reflink = V(S.reflink).replace("label", S._label).replace("ref", O._label).getRegex();
S.nolink = V(S.nolink).replace("ref", O._label).getRegex();
S.reflinkSearch = V(S.reflinkSearch, "g").replace("reflink", S.reflink).replace("nolink", S.nolink).getRegex();
S.normal = je({}, S);
S.pedantic = je({}, S.normal, {
  strong: {
    start: /^__|\*\*/,
    middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    endAst: /\*\*(?!\*)/g,
    endUnd: /__(?!_)/g
  },
  em: {
    start: /^_|\*/,
    middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
    endAst: /\*(?!\*)/g,
    endUnd: /_(?!_)/g
  },
  link: V(/^!?\[(label)\]\((.*?)\)/).replace("label", S._label).getRegex(),
  reflink: V(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", S._label).getRegex()
});
S.gfm = je({}, S.normal, {
  escape: V(S.escape).replace("])", "~|])").getRegex(),
  _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
  url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
  _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
});
S.gfm.url = V(S.gfm.url, "i").replace("email", S.gfm._extended_email).getRegex();
S.breaks = je({}, S.gfm, {
  br: V(S.br).replace("{2,}", "*").getRegex(),
  text: V(S.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
});
function Nd(t) {
  return t.replace(/---/g, "\u2014").replace(/--/g, "\u2013").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018").replace(/'/g, "\u2019").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C").replace(/"/g, "\u201D").replace(/\.{3}/g, "\u2026");
}
function Yi(t) {
  let e = "", n, s;
  const r = t.length;
  for (n = 0; n < r; n++)
    s = t.charCodeAt(n), Math.random() > 0.5 && (s = "x" + s.toString(16)), e += "&#" + s + ";";
  return e;
}
class ot {
  constructor(e) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || Gt, this.options.tokenizer = this.options.tokenizer || new ni(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      block: O.normal,
      inline: S.normal
    };
    this.options.pedantic ? (n.block = O.pedantic, n.inline = S.pedantic) : this.options.gfm && (n.block = O.gfm, this.options.breaks ? n.inline = S.breaks : n.inline = S.gfm), this.tokenizer.rules = n;
  }
  static get rules() {
    return {
      block: O,
      inline: S
    };
  }
  static lex(e, n) {
    return new ot(n).lex(e);
  }
  static lexInline(e, n) {
    return new ot(n).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(/\r\n|\r/g, `
`), this.blockTokens(e, this.tokens);
    let n;
    for (; n = this.inlineQueue.shift(); )
      this.inlineTokens(n.src, n.tokens);
    return this.tokens;
  }
  blockTokens(e, n = []) {
    this.options.pedantic ? e = e.replace(/\t/g, "    ").replace(/^ +$/gm, "") : e = e.replace(/^( *)(\t+)/gm, (a, l, c) => l + "    ".repeat(c.length));
    let s, r, i, o;
    for (; e; )
      if (!(this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((a) => (s = a.call({ lexer: this }, e, n)) ? (e = e.substring(s.raw.length), n.push(s), !0) : !1))) {
        if (s = this.tokenizer.space(e)) {
          e = e.substring(s.raw.length), s.raw.length === 1 && n.length > 0 ? n[n.length - 1].raw += `
` : n.push(s);
          continue;
        }
        if (s = this.tokenizer.code(e)) {
          e = e.substring(s.raw.length), r = n[n.length - 1], r && (r.type === "paragraph" || r.type === "text") ? (r.raw += `
` + s.raw, r.text += `
` + s.text, this.inlineQueue[this.inlineQueue.length - 1].src = r.text) : n.push(s);
          continue;
        }
        if (s = this.tokenizer.fences(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.heading(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.hr(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.blockquote(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.list(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.html(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.def(e)) {
          e = e.substring(s.raw.length), r = n[n.length - 1], r && (r.type === "paragraph" || r.type === "text") ? (r.raw += `
` + s.raw, r.text += `
` + s.raw, this.inlineQueue[this.inlineQueue.length - 1].src = r.text) : this.tokens.links[s.tag] || (this.tokens.links[s.tag] = {
            href: s.href,
            title: s.title
          });
          continue;
        }
        if (s = this.tokenizer.table(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.lheading(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (i = e, this.options.extensions && this.options.extensions.startBlock) {
          let a = 1 / 0;
          const l = e.slice(1);
          let c;
          this.options.extensions.startBlock.forEach(function(u) {
            c = u.call({ lexer: this }, l), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
          }), a < 1 / 0 && a >= 0 && (i = e.substring(0, a + 1));
        }
        if (this.state.top && (s = this.tokenizer.paragraph(i))) {
          r = n[n.length - 1], o && r.type === "paragraph" ? (r.raw += `
` + s.raw, r.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue[this.inlineQueue.length - 1].src = r.text) : n.push(s), o = i.length !== e.length, e = e.substring(s.raw.length);
          continue;
        }
        if (s = this.tokenizer.text(e)) {
          e = e.substring(s.raw.length), r = n[n.length - 1], r && r.type === "text" ? (r.raw += `
` + s.raw, r.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue[this.inlineQueue.length - 1].src = r.text) : n.push(s);
          continue;
        }
        if (e) {
          const a = "Infinite loop on byte: " + e.charCodeAt(0);
          if (this.options.silent) {
            console.error(a);
            break;
          } else
            throw new Error(a);
        }
      }
    return this.state.top = !0, n;
  }
  inline(e, n = []) {
    return this.inlineQueue.push({ src: e, tokens: n }), n;
  }
  inlineTokens(e, n = []) {
    let s, r, i, o = e, a, l, c;
    if (this.tokens.links) {
      const u = Object.keys(this.tokens.links);
      if (u.length > 0)
        for (; (a = this.tokenizer.rules.inline.reflinkSearch.exec(o)) != null; )
          u.includes(a[0].slice(a[0].lastIndexOf("[") + 1, -1)) && (o = o.slice(0, a.index) + "[" + Ui("a", a[0].length - 2) + "]" + o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (a = this.tokenizer.rules.inline.blockSkip.exec(o)) != null; )
      o = o.slice(0, a.index) + "[" + Ui("a", a[0].length - 2) + "]" + o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    for (; (a = this.tokenizer.rules.inline.escapedEmSt.exec(o)) != null; )
      o = o.slice(0, a.index + a[0].length - 2) + "++" + o.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex), this.tokenizer.rules.inline.escapedEmSt.lastIndex--;
    for (; e; )
      if (l || (c = ""), l = !1, !(this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((u) => (s = u.call({ lexer: this }, e, n)) ? (e = e.substring(s.raw.length), n.push(s), !0) : !1))) {
        if (s = this.tokenizer.escape(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.tag(e)) {
          e = e.substring(s.raw.length), r = n[n.length - 1], r && s.type === "text" && r.type === "text" ? (r.raw += s.raw, r.text += s.text) : n.push(s);
          continue;
        }
        if (s = this.tokenizer.link(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.reflink(e, this.tokens.links)) {
          e = e.substring(s.raw.length), r = n[n.length - 1], r && s.type === "text" && r.type === "text" ? (r.raw += s.raw, r.text += s.text) : n.push(s);
          continue;
        }
        if (s = this.tokenizer.emStrong(e, o, c)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.codespan(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.br(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.del(e)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (s = this.tokenizer.autolink(e, Yi)) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (!this.state.inLink && (s = this.tokenizer.url(e, Yi))) {
          e = e.substring(s.raw.length), n.push(s);
          continue;
        }
        if (i = e, this.options.extensions && this.options.extensions.startInline) {
          let u = 1 / 0;
          const f = e.slice(1);
          let d;
          this.options.extensions.startInline.forEach(function(h) {
            d = h.call({ lexer: this }, f), typeof d == "number" && d >= 0 && (u = Math.min(u, d));
          }), u < 1 / 0 && u >= 0 && (i = e.substring(0, u + 1));
        }
        if (s = this.tokenizer.inlineText(i, Nd)) {
          e = e.substring(s.raw.length), s.raw.slice(-1) !== "_" && (c = s.raw.slice(-1)), l = !0, r = n[n.length - 1], r && r.type === "text" ? (r.raw += s.raw, r.text += s.text) : n.push(s);
          continue;
        }
        if (e) {
          const u = "Infinite loop on byte: " + e.charCodeAt(0);
          if (this.options.silent) {
            console.error(u);
            break;
          } else
            throw new Error(u);
        }
      }
    return n;
  }
}
class si {
  constructor(e) {
    this.options = e || Gt;
  }
  code(e, n, s) {
    const r = (n || "").match(/\S*/)[0];
    if (this.options.highlight) {
      const i = this.options.highlight(e, r);
      i != null && i !== e && (s = !0, e = i);
    }
    return e = e.replace(/\n$/, "") + `
`, r ? '<pre><code class="' + this.options.langPrefix + ue(r) + '">' + (s ? e : ue(e, !0)) + `</code></pre>
` : "<pre><code>" + (s ? e : ue(e, !0)) + `</code></pre>
`;
  }
  blockquote(e) {
    return `<blockquote>
${e}</blockquote>
`;
  }
  html(e) {
    return e;
  }
  heading(e, n, s, r) {
    if (this.options.headerIds) {
      const i = this.options.headerPrefix + r.slug(s);
      return `<h${n} id="${i}">${e}</h${n}>
`;
    }
    return `<h${n}>${e}</h${n}>
`;
  }
  hr() {
    return this.options.xhtml ? `<hr/>
` : `<hr>
`;
  }
  list(e, n, s) {
    const r = n ? "ol" : "ul", i = n && s !== 1 ? ' start="' + s + '"' : "";
    return "<" + r + i + `>
` + e + "</" + r + `>
`;
  }
  listitem(e) {
    return `<li>${e}</li>
`;
  }
  checkbox(e) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"' + (this.options.xhtml ? " /" : "") + "> ";
  }
  paragraph(e) {
    return `<p>${e}</p>
`;
  }
  table(e, n) {
    return n && (n = `<tbody>${n}</tbody>`), `<table>
<thead>
` + e + `</thead>
` + n + `</table>
`;
  }
  tablerow(e) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e, n) {
    const s = n.header ? "th" : "td";
    return (n.align ? `<${s} align="${n.align}">` : `<${s}>`) + e + `</${s}>
`;
  }
  strong(e) {
    return `<strong>${e}</strong>`;
  }
  em(e) {
    return `<em>${e}</em>`;
  }
  codespan(e) {
    return `<code>${e}</code>`;
  }
  br() {
    return this.options.xhtml ? "<br/>" : "<br>";
  }
  del(e) {
    return `<del>${e}</del>`;
  }
  link(e, n, s) {
    if (e = qi(this.options.sanitize, this.options.baseUrl, e), e === null)
      return s;
    let r = '<a href="' + e + '"';
    return n && (r += ' title="' + n + '"'), r += ">" + s + "</a>", r;
  }
  image(e, n, s) {
    if (e = qi(this.options.sanitize, this.options.baseUrl, e), e === null)
      return s;
    let r = `<img src="${e}" alt="${s}"`;
    return n && (r += ` title="${n}"`), r += this.options.xhtml ? "/>" : ">", r;
  }
  text(e) {
    return e;
  }
}
class Sa {
  strong(e) {
    return e;
  }
  em(e) {
    return e;
  }
  codespan(e) {
    return e;
  }
  del(e) {
    return e;
  }
  html(e) {
    return e;
  }
  text(e) {
    return e;
  }
  link(e, n, s) {
    return "" + s;
  }
  image(e, n, s) {
    return "" + s;
  }
  br() {
    return "";
  }
}
class ka {
  constructor() {
    this.seen = {};
  }
  serialize(e) {
    return e.toLowerCase().trim().replace(/<[!\/a-z].*?>/ig, "").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, "").replace(/\s/g, "-");
  }
  getNextSafeSlug(e, n) {
    let s = e, r = 0;
    if (this.seen.hasOwnProperty(s)) {
      r = this.seen[e];
      do
        r++, s = e + "-" + r;
      while (this.seen.hasOwnProperty(s));
    }
    return n || (this.seen[e] = r, this.seen[s] = 0), s;
  }
  slug(e, n = {}) {
    const s = this.serialize(e);
    return this.getNextSafeSlug(s, n.dryrun);
  }
}
class He {
  constructor(e) {
    this.options = e || Gt, this.options.renderer = this.options.renderer || new si(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.textRenderer = new Sa(), this.slugger = new ka();
  }
  static parse(e, n) {
    return new He(n).parse(e);
  }
  static parseInline(e, n) {
    return new He(n).parseInline(e);
  }
  parse(e, n = !0) {
    let s = "", r, i, o, a, l, c, u, f, d, h, y, b, m, k, P, te, q, Q, J;
    const ie = e.length;
    for (r = 0; r < ie; r++) {
      if (h = e[r], this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[h.type] && (J = this.options.extensions.renderers[h.type].call({ parser: this }, h), J !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(h.type))) {
        s += J || "";
        continue;
      }
      switch (h.type) {
        case "space":
          continue;
        case "hr": {
          s += this.renderer.hr();
          continue;
        }
        case "heading": {
          s += this.renderer.heading(
            this.parseInline(h.tokens),
            h.depth,
            _a(this.parseInline(h.tokens, this.textRenderer)),
            this.slugger
          );
          continue;
        }
        case "code": {
          s += this.renderer.code(
            h.text,
            h.lang,
            h.escaped
          );
          continue;
        }
        case "table": {
          for (f = "", u = "", a = h.header.length, i = 0; i < a; i++)
            u += this.renderer.tablecell(
              this.parseInline(h.header[i].tokens),
              { header: !0, align: h.align[i] }
            );
          for (f += this.renderer.tablerow(u), d = "", a = h.rows.length, i = 0; i < a; i++) {
            for (c = h.rows[i], u = "", l = c.length, o = 0; o < l; o++)
              u += this.renderer.tablecell(
                this.parseInline(c[o].tokens),
                { header: !1, align: h.align[o] }
              );
            d += this.renderer.tablerow(u);
          }
          s += this.renderer.table(f, d);
          continue;
        }
        case "blockquote": {
          d = this.parse(h.tokens), s += this.renderer.blockquote(d);
          continue;
        }
        case "list": {
          for (y = h.ordered, b = h.start, m = h.loose, a = h.items.length, d = "", i = 0; i < a; i++)
            P = h.items[i], te = P.checked, q = P.task, k = "", P.task && (Q = this.renderer.checkbox(te), m ? P.tokens.length > 0 && P.tokens[0].type === "paragraph" ? (P.tokens[0].text = Q + " " + P.tokens[0].text, P.tokens[0].tokens && P.tokens[0].tokens.length > 0 && P.tokens[0].tokens[0].type === "text" && (P.tokens[0].tokens[0].text = Q + " " + P.tokens[0].tokens[0].text)) : P.tokens.unshift({
              type: "text",
              text: Q
            }) : k += Q), k += this.parse(P.tokens, m), d += this.renderer.listitem(k, q, te);
          s += this.renderer.list(d, y, b);
          continue;
        }
        case "html": {
          s += this.renderer.html(h.text);
          continue;
        }
        case "paragraph": {
          s += this.renderer.paragraph(this.parseInline(h.tokens));
          continue;
        }
        case "text": {
          for (d = h.tokens ? this.parseInline(h.tokens) : h.text; r + 1 < ie && e[r + 1].type === "text"; )
            h = e[++r], d += `
` + (h.tokens ? this.parseInline(h.tokens) : h.text);
          s += n ? this.renderer.paragraph(d) : d;
          continue;
        }
        default: {
          const oe = 'Token with "' + h.type + '" type was not found.';
          if (this.options.silent) {
            console.error(oe);
            return;
          } else
            throw new Error(oe);
        }
      }
    }
    return s;
  }
  parseInline(e, n) {
    n = n || this.renderer;
    let s = "", r, i, o;
    const a = e.length;
    for (r = 0; r < a; r++) {
      if (i = e[r], this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[i.type] && (o = this.options.extensions.renderers[i.type].call({ parser: this }, i), o !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(i.type))) {
        s += o || "";
        continue;
      }
      switch (i.type) {
        case "escape": {
          s += n.text(i.text);
          break;
        }
        case "html": {
          s += n.html(i.text);
          break;
        }
        case "link": {
          s += n.link(i.href, i.title, this.parseInline(i.tokens, n));
          break;
        }
        case "image": {
          s += n.image(i.href, i.title, i.text);
          break;
        }
        case "strong": {
          s += n.strong(this.parseInline(i.tokens, n));
          break;
        }
        case "em": {
          s += n.em(this.parseInline(i.tokens, n));
          break;
        }
        case "codespan": {
          s += n.codespan(i.text);
          break;
        }
        case "br": {
          s += n.br();
          break;
        }
        case "del": {
          s += n.del(this.parseInline(i.tokens, n));
          break;
        }
        case "text": {
          s += n.text(i.text);
          break;
        }
        default: {
          const l = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent) {
            console.error(l);
            return;
          } else
            throw new Error(l);
        }
      }
    }
    return s;
  }
}
function E(t, e, n) {
  if (typeof t > "u" || t === null)
    throw new Error("marked(): input parameter is undefined or null");
  if (typeof t != "string")
    throw new Error("marked(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected");
  if (typeof e == "function" && (n = e, e = null), e = je({}, E.defaults, e || {}), xa(e), n) {
    const r = e.highlight;
    let i;
    try {
      i = ot.lex(t, e);
    } catch (l) {
      return n(l);
    }
    const o = function(l) {
      let c;
      if (!l)
        try {
          e.walkTokens && E.walkTokens(i, e.walkTokens), c = He.parse(i, e);
        } catch (u) {
          l = u;
        }
      return e.highlight = r, l ? n(l) : n(null, c);
    };
    if (!r || r.length < 3 || (delete e.highlight, !i.length))
      return o();
    let a = 0;
    E.walkTokens(i, function(l) {
      l.type === "code" && (a++, setTimeout(() => {
        r(l.text, l.lang, function(c, u) {
          if (c)
            return o(c);
          u != null && u !== l.text && (l.text = u, l.escaped = !0), a--, a === 0 && o();
        });
      }, 0));
    }), a === 0 && o();
    return;
  }
  function s(r) {
    if (r.message += `
Please report this to https://github.com/markedjs/marked.`, e.silent)
      return "<p>An error occurred:</p><pre>" + ue(r.message + "", !0) + "</pre>";
    throw r;
  }
  try {
    const r = ot.lex(t, e);
    if (e.walkTokens) {
      if (e.async)
        return Promise.all(E.walkTokens(r, e.walkTokens)).then(() => He.parse(r, e)).catch(s);
      E.walkTokens(r, e.walkTokens);
    }
    return He.parse(r, e);
  } catch (r) {
    s(r);
  }
}
E.options = E.setOptions = function(t) {
  return je(E.defaults, t), xd(E.defaults), E;
};
E.getDefaults = ba;
E.defaults = Gt;
E.use = function(...t) {
  const e = E.defaults.extensions || { renderers: {}, childTokens: {} };
  t.forEach((n) => {
    const s = je({}, n);
    if (s.async = E.defaults.async || s.async, n.extensions && (n.extensions.forEach((r) => {
      if (!r.name)
        throw new Error("extension name required");
      if (r.renderer) {
        const i = e.renderers[r.name];
        i ? e.renderers[r.name] = function(...o) {
          let a = r.renderer.apply(this, o);
          return a === !1 && (a = i.apply(this, o)), a;
        } : e.renderers[r.name] = r.renderer;
      }
      if (r.tokenizer) {
        if (!r.level || r.level !== "block" && r.level !== "inline")
          throw new Error("extension level must be 'block' or 'inline'");
        e[r.level] ? e[r.level].unshift(r.tokenizer) : e[r.level] = [r.tokenizer], r.start && (r.level === "block" ? e.startBlock ? e.startBlock.push(r.start) : e.startBlock = [r.start] : r.level === "inline" && (e.startInline ? e.startInline.push(r.start) : e.startInline = [r.start]));
      }
      r.childTokens && (e.childTokens[r.name] = r.childTokens);
    }), s.extensions = e), n.renderer) {
      const r = E.defaults.renderer || new si();
      for (const i in n.renderer) {
        const o = r[i];
        r[i] = (...a) => {
          let l = n.renderer[i].apply(r, a);
          return l === !1 && (l = o.apply(r, a)), l;
        };
      }
      s.renderer = r;
    }
    if (n.tokenizer) {
      const r = E.defaults.tokenizer || new ni();
      for (const i in n.tokenizer) {
        const o = r[i];
        r[i] = (...a) => {
          let l = n.tokenizer[i].apply(r, a);
          return l === !1 && (l = o.apply(r, a)), l;
        };
      }
      s.tokenizer = r;
    }
    if (n.walkTokens) {
      const r = E.defaults.walkTokens;
      s.walkTokens = function(i) {
        let o = [];
        return o.push(n.walkTokens.call(this, i)), r && (o = o.concat(r.call(this, i))), o;
      };
    }
    E.setOptions(s);
  });
};
E.walkTokens = function(t, e) {
  let n = [];
  for (const s of t)
    switch (n = n.concat(e.call(E, s)), s.type) {
      case "table": {
        for (const r of s.header)
          n = n.concat(E.walkTokens(r.tokens, e));
        for (const r of s.rows)
          for (const i of r)
            n = n.concat(E.walkTokens(i.tokens, e));
        break;
      }
      case "list": {
        n = n.concat(E.walkTokens(s.items, e));
        break;
      }
      default:
        E.defaults.extensions && E.defaults.extensions.childTokens && E.defaults.extensions.childTokens[s.type] ? E.defaults.extensions.childTokens[s.type].forEach(function(r) {
          n = n.concat(E.walkTokens(s[r], e));
        }) : s.tokens && (n = n.concat(E.walkTokens(s.tokens, e)));
    }
  return n;
};
E.parseInline = function(t, e) {
  if (typeof t > "u" || t === null)
    throw new Error("marked.parseInline(): input parameter is undefined or null");
  if (typeof t != "string")
    throw new Error("marked.parseInline(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected");
  e = je({}, E.defaults, e || {}), xa(e);
  try {
    const n = ot.lexInline(t, e);
    return e.walkTokens && E.walkTokens(n, e.walkTokens), He.parseInline(n, e);
  } catch (n) {
    if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e.silent)
      return "<p>An error occurred:</p><pre>" + ue(n.message + "", !0) + "</pre>";
    throw n;
  }
};
E.Parser = He;
E.parser = He.parse;
E.Renderer = si;
E.TextRenderer = Sa;
E.Lexer = ot;
E.lexer = ot.lex;
E.Tokenizer = ni;
E.Slugger = ka;
E.parse = E;
E.options;
E.setOptions;
E.use;
E.walkTokens;
E.parseInline;
He.parse;
ot.lex;
var D = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ta(t) {
  var e = t.default;
  if (typeof e == "function") {
    var n = function() {
      return e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else
    n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(s) {
    var r = Object.getOwnPropertyDescriptor(t, s);
    Object.defineProperty(n, s, r.get ? r : {
      enumerable: !0,
      get: function() {
        return t[s];
      }
    });
  }), n;
}
var Da = {}, Sn = {}, Cs = {}, Ms = {};
const qd = {
  0: 65533,
  128: 8364,
  130: 8218,
  131: 402,
  132: 8222,
  133: 8230,
  134: 8224,
  135: 8225,
  136: 710,
  137: 8240,
  138: 352,
  139: 8249,
  140: 338,
  142: 381,
  145: 8216,
  146: 8217,
  147: 8220,
  148: 8221,
  149: 8226,
  150: 8211,
  151: 8212,
  152: 732,
  153: 8482,
  154: 353,
  155: 8250,
  156: 339,
  158: 382,
  159: 376
};
var Id = D && D.__importDefault || function(t) {
  return t && t.__esModule ? t : { default: t };
};
Object.defineProperty(Ms, "__esModule", { value: !0 });
var Fi = Id(qd), Ud = String.fromCodePoint || function(t) {
  var e = "";
  return t > 65535 && (t -= 65536, e += String.fromCharCode(t >>> 10 & 1023 | 55296), t = 56320 | t & 1023), e += String.fromCharCode(t), e;
};
function jd(t) {
  return t >= 55296 && t <= 57343 || t > 1114111 ? "\uFFFD" : (t in Fi.default && (t = Fi.default[t]), Ud(t));
}
Ms.default = jd;
const Yd = "\xC1", Fd = "\xE1", zd = "\u0102", Bd = "\u0103", Hd = "\u223E", Vd = "\u223F", Wd = "\u223E\u0333", Gd = "\xC2", Zd = "\xE2", Qd = "\xB4", Jd = "\u0410", Xd = "\u0430", Kd = "\xC6", ep = "\xE6", tp = "\u2061", np = "\u{1D504}", sp = "\u{1D51E}", rp = "\xC0", ip = "\xE0", op = "\u2135", ap = "\u2135", lp = "\u0391", cp = "\u03B1", up = "\u0100", fp = "\u0101", hp = "\u2A3F", dp = "&", pp = "&", mp = "\u2A55", gp = "\u2A53", yp = "\u2227", bp = "\u2A5C", wp = "\u2A58", vp = "\u2A5A", _p = "\u2220", xp = "\u29A4", Sp = "\u2220", kp = "\u29A8", Tp = "\u29A9", Dp = "\u29AA", Op = "\u29AB", Ep = "\u29AC", Ap = "\u29AD", Cp = "\u29AE", Mp = "\u29AF", Pp = "\u2221", Rp = "\u221F", $p = "\u22BE", Lp = "\u299D", Np = "\u2222", qp = "\xC5", Ip = "\u237C", Up = "\u0104", jp = "\u0105", Yp = "\u{1D538}", Fp = "\u{1D552}", zp = "\u2A6F", Bp = "\u2248", Hp = "\u2A70", Vp = "\u224A", Wp = "\u224B", Gp = "'", Zp = "\u2061", Qp = "\u2248", Jp = "\u224A", Xp = "\xC5", Kp = "\xE5", em = "\u{1D49C}", tm = "\u{1D4B6}", nm = "\u2254", sm = "*", rm = "\u2248", im = "\u224D", om = "\xC3", am = "\xE3", lm = "\xC4", cm = "\xE4", um = "\u2233", fm = "\u2A11", hm = "\u224C", dm = "\u03F6", pm = "\u2035", mm = "\u223D", gm = "\u22CD", ym = "\u2216", bm = "\u2AE7", wm = "\u22BD", vm = "\u2305", _m = "\u2306", xm = "\u2305", Sm = "\u23B5", km = "\u23B6", Tm = "\u224C", Dm = "\u0411", Om = "\u0431", Em = "\u201E", Am = "\u2235", Cm = "\u2235", Mm = "\u2235", Pm = "\u29B0", Rm = "\u03F6", $m = "\u212C", Lm = "\u212C", Nm = "\u0392", qm = "\u03B2", Im = "\u2136", Um = "\u226C", jm = "\u{1D505}", Ym = "\u{1D51F}", Fm = "\u22C2", zm = "\u25EF", Bm = "\u22C3", Hm = "\u2A00", Vm = "\u2A01", Wm = "\u2A02", Gm = "\u2A06", Zm = "\u2605", Qm = "\u25BD", Jm = "\u25B3", Xm = "\u2A04", Km = "\u22C1", eg = "\u22C0", tg = "\u290D", ng = "\u29EB", sg = "\u25AA", rg = "\u25B4", ig = "\u25BE", og = "\u25C2", ag = "\u25B8", lg = "\u2423", cg = "\u2592", ug = "\u2591", fg = "\u2593", hg = "\u2588", dg = "=\u20E5", pg = "\u2261\u20E5", mg = "\u2AED", gg = "\u2310", yg = "\u{1D539}", bg = "\u{1D553}", wg = "\u22A5", vg = "\u22A5", _g = "\u22C8", xg = "\u29C9", Sg = "\u2510", kg = "\u2555", Tg = "\u2556", Dg = "\u2557", Og = "\u250C", Eg = "\u2552", Ag = "\u2553", Cg = "\u2554", Mg = "\u2500", Pg = "\u2550", Rg = "\u252C", $g = "\u2564", Lg = "\u2565", Ng = "\u2566", qg = "\u2534", Ig = "\u2567", Ug = "\u2568", jg = "\u2569", Yg = "\u229F", Fg = "\u229E", zg = "\u22A0", Bg = "\u2518", Hg = "\u255B", Vg = "\u255C", Wg = "\u255D", Gg = "\u2514", Zg = "\u2558", Qg = "\u2559", Jg = "\u255A", Xg = "\u2502", Kg = "\u2551", ey = "\u253C", ty = "\u256A", ny = "\u256B", sy = "\u256C", ry = "\u2524", iy = "\u2561", oy = "\u2562", ay = "\u2563", ly = "\u251C", cy = "\u255E", uy = "\u255F", fy = "\u2560", hy = "\u2035", dy = "\u02D8", py = "\u02D8", my = "\xA6", gy = "\u{1D4B7}", yy = "\u212C", by = "\u204F", wy = "\u223D", vy = "\u22CD", _y = "\u29C5", xy = "\\", Sy = "\u27C8", ky = "\u2022", Ty = "\u2022", Dy = "\u224E", Oy = "\u2AAE", Ey = "\u224F", Ay = "\u224E", Cy = "\u224F", My = "\u0106", Py = "\u0107", Ry = "\u2A44", $y = "\u2A49", Ly = "\u2A4B", Ny = "\u2229", qy = "\u22D2", Iy = "\u2A47", Uy = "\u2A40", jy = "\u2145", Yy = "\u2229\uFE00", Fy = "\u2041", zy = "\u02C7", By = "\u212D", Hy = "\u2A4D", Vy = "\u010C", Wy = "\u010D", Gy = "\xC7", Zy = "\xE7", Qy = "\u0108", Jy = "\u0109", Xy = "\u2230", Ky = "\u2A4C", eb = "\u2A50", tb = "\u010A", nb = "\u010B", sb = "\xB8", rb = "\xB8", ib = "\u29B2", ob = "\xA2", ab = "\xB7", lb = "\xB7", cb = "\u{1D520}", ub = "\u212D", fb = "\u0427", hb = "\u0447", db = "\u2713", pb = "\u2713", mb = "\u03A7", gb = "\u03C7", yb = "\u02C6", bb = "\u2257", wb = "\u21BA", vb = "\u21BB", _b = "\u229B", xb = "\u229A", Sb = "\u229D", kb = "\u2299", Tb = "\xAE", Db = "\u24C8", Ob = "\u2296", Eb = "\u2295", Ab = "\u2297", Cb = "\u25CB", Mb = "\u29C3", Pb = "\u2257", Rb = "\u2A10", $b = "\u2AEF", Lb = "\u29C2", Nb = "\u2232", qb = "\u201D", Ib = "\u2019", Ub = "\u2663", jb = "\u2663", Yb = ":", Fb = "\u2237", zb = "\u2A74", Bb = "\u2254", Hb = "\u2254", Vb = ",", Wb = "@", Gb = "\u2201", Zb = "\u2218", Qb = "\u2201", Jb = "\u2102", Xb = "\u2245", Kb = "\u2A6D", ew = "\u2261", tw = "\u222E", nw = "\u222F", sw = "\u222E", rw = "\u{1D554}", iw = "\u2102", ow = "\u2210", aw = "\u2210", lw = "\xA9", cw = "\xA9", uw = "\u2117", fw = "\u2233", hw = "\u21B5", dw = "\u2717", pw = "\u2A2F", mw = "\u{1D49E}", gw = "\u{1D4B8}", yw = "\u2ACF", bw = "\u2AD1", ww = "\u2AD0", vw = "\u2AD2", _w = "\u22EF", xw = "\u2938", Sw = "\u2935", kw = "\u22DE", Tw = "\u22DF", Dw = "\u21B6", Ow = "\u293D", Ew = "\u2A48", Aw = "\u2A46", Cw = "\u224D", Mw = "\u222A", Pw = "\u22D3", Rw = "\u2A4A", $w = "\u228D", Lw = "\u2A45", Nw = "\u222A\uFE00", qw = "\u21B7", Iw = "\u293C", Uw = "\u22DE", jw = "\u22DF", Yw = "\u22CE", Fw = "\u22CF", zw = "\xA4", Bw = "\u21B6", Hw = "\u21B7", Vw = "\u22CE", Ww = "\u22CF", Gw = "\u2232", Zw = "\u2231", Qw = "\u232D", Jw = "\u2020", Xw = "\u2021", Kw = "\u2138", ev = "\u2193", tv = "\u21A1", nv = "\u21D3", sv = "\u2010", rv = "\u2AE4", iv = "\u22A3", ov = "\u290F", av = "\u02DD", lv = "\u010E", cv = "\u010F", uv = "\u0414", fv = "\u0434", hv = "\u2021", dv = "\u21CA", pv = "\u2145", mv = "\u2146", gv = "\u2911", yv = "\u2A77", bv = "\xB0", wv = "\u2207", vv = "\u0394", _v = "\u03B4", xv = "\u29B1", Sv = "\u297F", kv = "\u{1D507}", Tv = "\u{1D521}", Dv = "\u2965", Ov = "\u21C3", Ev = "\u21C2", Av = "\xB4", Cv = "\u02D9", Mv = "\u02DD", Pv = "`", Rv = "\u02DC", $v = "\u22C4", Lv = "\u22C4", Nv = "\u22C4", qv = "\u2666", Iv = "\u2666", Uv = "\xA8", jv = "\u2146", Yv = "\u03DD", Fv = "\u22F2", zv = "\xF7", Bv = "\xF7", Hv = "\u22C7", Vv = "\u22C7", Wv = "\u0402", Gv = "\u0452", Zv = "\u231E", Qv = "\u230D", Jv = "$", Xv = "\u{1D53B}", Kv = "\u{1D555}", e_ = "\xA8", t_ = "\u02D9", n_ = "\u20DC", s_ = "\u2250", r_ = "\u2251", i_ = "\u2250", o_ = "\u2238", a_ = "\u2214", l_ = "\u22A1", c_ = "\u2306", u_ = "\u222F", f_ = "\xA8", h_ = "\u21D3", d_ = "\u21D0", p_ = "\u21D4", m_ = "\u2AE4", g_ = "\u27F8", y_ = "\u27FA", b_ = "\u27F9", w_ = "\u21D2", v_ = "\u22A8", __ = "\u21D1", x_ = "\u21D5", S_ = "\u2225", k_ = "\u2913", T_ = "\u2193", D_ = "\u2193", O_ = "\u21D3", E_ = "\u21F5", A_ = "\u0311", C_ = "\u21CA", M_ = "\u21C3", P_ = "\u21C2", R_ = "\u2950", $_ = "\u295E", L_ = "\u2956", N_ = "\u21BD", q_ = "\u295F", I_ = "\u2957", U_ = "\u21C1", j_ = "\u21A7", Y_ = "\u22A4", F_ = "\u2910", z_ = "\u231F", B_ = "\u230C", H_ = "\u{1D49F}", V_ = "\u{1D4B9}", W_ = "\u0405", G_ = "\u0455", Z_ = "\u29F6", Q_ = "\u0110", J_ = "\u0111", X_ = "\u22F1", K_ = "\u25BF", e0 = "\u25BE", t0 = "\u21F5", n0 = "\u296F", s0 = "\u29A6", r0 = "\u040F", i0 = "\u045F", o0 = "\u27FF", a0 = "\xC9", l0 = "\xE9", c0 = "\u2A6E", u0 = "\u011A", f0 = "\u011B", h0 = "\xCA", d0 = "\xEA", p0 = "\u2256", m0 = "\u2255", g0 = "\u042D", y0 = "\u044D", b0 = "\u2A77", w0 = "\u0116", v0 = "\u0117", _0 = "\u2251", x0 = "\u2147", S0 = "\u2252", k0 = "\u{1D508}", T0 = "\u{1D522}", D0 = "\u2A9A", O0 = "\xC8", E0 = "\xE8", A0 = "\u2A96", C0 = "\u2A98", M0 = "\u2A99", P0 = "\u2208", R0 = "\u23E7", $0 = "\u2113", L0 = "\u2A95", N0 = "\u2A97", q0 = "\u0112", I0 = "\u0113", U0 = "\u2205", j0 = "\u2205", Y0 = "\u25FB", F0 = "\u2205", z0 = "\u25AB", B0 = "\u2004", H0 = "\u2005", V0 = "\u2003", W0 = "\u014A", G0 = "\u014B", Z0 = "\u2002", Q0 = "\u0118", J0 = "\u0119", X0 = "\u{1D53C}", K0 = "\u{1D556}", e1 = "\u22D5", t1 = "\u29E3", n1 = "\u2A71", s1 = "\u03B5", r1 = "\u0395", i1 = "\u03B5", o1 = "\u03F5", a1 = "\u2256", l1 = "\u2255", c1 = "\u2242", u1 = "\u2A96", f1 = "\u2A95", h1 = "\u2A75", d1 = "=", p1 = "\u2242", m1 = "\u225F", g1 = "\u21CC", y1 = "\u2261", b1 = "\u2A78", w1 = "\u29E5", v1 = "\u2971", _1 = "\u2253", x1 = "\u212F", S1 = "\u2130", k1 = "\u2250", T1 = "\u2A73", D1 = "\u2242", O1 = "\u0397", E1 = "\u03B7", A1 = "\xD0", C1 = "\xF0", M1 = "\xCB", P1 = "\xEB", R1 = "\u20AC", $1 = "!", L1 = "\u2203", N1 = "\u2203", q1 = "\u2130", I1 = "\u2147", U1 = "\u2147", j1 = "\u2252", Y1 = "\u0424", F1 = "\u0444", z1 = "\u2640", B1 = "\uFB03", H1 = "\uFB00", V1 = "\uFB04", W1 = "\u{1D509}", G1 = "\u{1D523}", Z1 = "\uFB01", Q1 = "\u25FC", J1 = "\u25AA", X1 = "fj", K1 = "\u266D", ex = "\uFB02", tx = "\u25B1", nx = "\u0192", sx = "\u{1D53D}", rx = "\u{1D557}", ix = "\u2200", ox = "\u2200", ax = "\u22D4", lx = "\u2AD9", cx = "\u2131", ux = "\u2A0D", fx = "\xBD", hx = "\u2153", dx = "\xBC", px = "\u2155", mx = "\u2159", gx = "\u215B", yx = "\u2154", bx = "\u2156", wx = "\xBE", vx = "\u2157", _x = "\u215C", xx = "\u2158", Sx = "\u215A", kx = "\u215D", Tx = "\u215E", Dx = "\u2044", Ox = "\u2322", Ex = "\u{1D4BB}", Ax = "\u2131", Cx = "\u01F5", Mx = "\u0393", Px = "\u03B3", Rx = "\u03DC", $x = "\u03DD", Lx = "\u2A86", Nx = "\u011E", qx = "\u011F", Ix = "\u0122", Ux = "\u011C", jx = "\u011D", Yx = "\u0413", Fx = "\u0433", zx = "\u0120", Bx = "\u0121", Hx = "\u2265", Vx = "\u2267", Wx = "\u2A8C", Gx = "\u22DB", Zx = "\u2265", Qx = "\u2267", Jx = "\u2A7E", Xx = "\u2AA9", Kx = "\u2A7E", eS = "\u2A80", tS = "\u2A82", nS = "\u2A84", sS = "\u22DB\uFE00", rS = "\u2A94", iS = "\u{1D50A}", oS = "\u{1D524}", aS = "\u226B", lS = "\u22D9", cS = "\u22D9", uS = "\u2137", fS = "\u0403", hS = "\u0453", dS = "\u2AA5", pS = "\u2277", mS = "\u2A92", gS = "\u2AA4", yS = "\u2A8A", bS = "\u2A8A", wS = "\u2A88", vS = "\u2269", _S = "\u2A88", xS = "\u2269", SS = "\u22E7", kS = "\u{1D53E}", TS = "\u{1D558}", DS = "`", OS = "\u2265", ES = "\u22DB", AS = "\u2267", CS = "\u2AA2", MS = "\u2277", PS = "\u2A7E", RS = "\u2273", $S = "\u{1D4A2}", LS = "\u210A", NS = "\u2273", qS = "\u2A8E", IS = "\u2A90", US = "\u2AA7", jS = "\u2A7A", YS = ">", FS = ">", zS = "\u226B", BS = "\u22D7", HS = "\u2995", VS = "\u2A7C", WS = "\u2A86", GS = "\u2978", ZS = "\u22D7", QS = "\u22DB", JS = "\u2A8C", XS = "\u2277", KS = "\u2273", ek = "\u2269\uFE00", tk = "\u2269\uFE00", nk = "\u02C7", sk = "\u200A", rk = "\xBD", ik = "\u210B", ok = "\u042A", ak = "\u044A", lk = "\u2948", ck = "\u2194", uk = "\u21D4", fk = "\u21AD", hk = "^", dk = "\u210F", pk = "\u0124", mk = "\u0125", gk = "\u2665", yk = "\u2665", bk = "\u2026", wk = "\u22B9", vk = "\u{1D525}", _k = "\u210C", xk = "\u210B", Sk = "\u2925", kk = "\u2926", Tk = "\u21FF", Dk = "\u223B", Ok = "\u21A9", Ek = "\u21AA", Ak = "\u{1D559}", Ck = "\u210D", Mk = "\u2015", Pk = "\u2500", Rk = "\u{1D4BD}", $k = "\u210B", Lk = "\u210F", Nk = "\u0126", qk = "\u0127", Ik = "\u224E", Uk = "\u224F", jk = "\u2043", Yk = "\u2010", Fk = "\xCD", zk = "\xED", Bk = "\u2063", Hk = "\xCE", Vk = "\xEE", Wk = "\u0418", Gk = "\u0438", Zk = "\u0130", Qk = "\u0415", Jk = "\u0435", Xk = "\xA1", Kk = "\u21D4", eT = "\u{1D526}", tT = "\u2111", nT = "\xCC", sT = "\xEC", rT = "\u2148", iT = "\u2A0C", oT = "\u222D", aT = "\u29DC", lT = "\u2129", cT = "\u0132", uT = "\u0133", fT = "\u012A", hT = "\u012B", dT = "\u2111", pT = "\u2148", mT = "\u2110", gT = "\u2111", yT = "\u0131", bT = "\u2111", wT = "\u22B7", vT = "\u01B5", _T = "\u21D2", xT = "\u2105", ST = "\u221E", kT = "\u29DD", TT = "\u0131", DT = "\u22BA", OT = "\u222B", ET = "\u222C", AT = "\u2124", CT = "\u222B", MT = "\u22BA", PT = "\u22C2", RT = "\u2A17", $T = "\u2A3C", LT = "\u2063", NT = "\u2062", qT = "\u0401", IT = "\u0451", UT = "\u012E", jT = "\u012F", YT = "\u{1D540}", FT = "\u{1D55A}", zT = "\u0399", BT = "\u03B9", HT = "\u2A3C", VT = "\xBF", WT = "\u{1D4BE}", GT = "\u2110", ZT = "\u2208", QT = "\u22F5", JT = "\u22F9", XT = "\u22F4", KT = "\u22F3", eD = "\u2208", tD = "\u2062", nD = "\u0128", sD = "\u0129", rD = "\u0406", iD = "\u0456", oD = "\xCF", aD = "\xEF", lD = "\u0134", cD = "\u0135", uD = "\u0419", fD = "\u0439", hD = "\u{1D50D}", dD = "\u{1D527}", pD = "\u0237", mD = "\u{1D541}", gD = "\u{1D55B}", yD = "\u{1D4A5}", bD = "\u{1D4BF}", wD = "\u0408", vD = "\u0458", _D = "\u0404", xD = "\u0454", SD = "\u039A", kD = "\u03BA", TD = "\u03F0", DD = "\u0136", OD = "\u0137", ED = "\u041A", AD = "\u043A", CD = "\u{1D50E}", MD = "\u{1D528}", PD = "\u0138", RD = "\u0425", $D = "\u0445", LD = "\u040C", ND = "\u045C", qD = "\u{1D542}", ID = "\u{1D55C}", UD = "\u{1D4A6}", jD = "\u{1D4C0}", YD = "\u21DA", FD = "\u0139", zD = "\u013A", BD = "\u29B4", HD = "\u2112", VD = "\u039B", WD = "\u03BB", GD = "\u27E8", ZD = "\u27EA", QD = "\u2991", JD = "\u27E8", XD = "\u2A85", KD = "\u2112", eO = "\xAB", tO = "\u21E4", nO = "\u291F", sO = "\u2190", rO = "\u219E", iO = "\u21D0", oO = "\u291D", aO = "\u21A9", lO = "\u21AB", cO = "\u2939", uO = "\u2973", fO = "\u21A2", hO = "\u2919", dO = "\u291B", pO = "\u2AAB", mO = "\u2AAD", gO = "\u2AAD\uFE00", yO = "\u290C", bO = "\u290E", wO = "\u2772", vO = "{", _O = "[", xO = "\u298B", SO = "\u298F", kO = "\u298D", TO = "\u013D", DO = "\u013E", OO = "\u013B", EO = "\u013C", AO = "\u2308", CO = "{", MO = "\u041B", PO = "\u043B", RO = "\u2936", $O = "\u201C", LO = "\u201E", NO = "\u2967", qO = "\u294B", IO = "\u21B2", UO = "\u2264", jO = "\u2266", YO = "\u27E8", FO = "\u21E4", zO = "\u2190", BO = "\u2190", HO = "\u21D0", VO = "\u21C6", WO = "\u21A2", GO = "\u2308", ZO = "\u27E6", QO = "\u2961", JO = "\u2959", XO = "\u21C3", KO = "\u230A", eE = "\u21BD", tE = "\u21BC", nE = "\u21C7", sE = "\u2194", rE = "\u2194", iE = "\u21D4", oE = "\u21C6", aE = "\u21CB", lE = "\u21AD", cE = "\u294E", uE = "\u21A4", fE = "\u22A3", hE = "\u295A", dE = "\u22CB", pE = "\u29CF", mE = "\u22B2", gE = "\u22B4", yE = "\u2951", bE = "\u2960", wE = "\u2958", vE = "\u21BF", _E = "\u2952", xE = "\u21BC", SE = "\u2A8B", kE = "\u22DA", TE = "\u2264", DE = "\u2266", OE = "\u2A7D", EE = "\u2AA8", AE = "\u2A7D", CE = "\u2A7F", ME = "\u2A81", PE = "\u2A83", RE = "\u22DA\uFE00", $E = "\u2A93", LE = "\u2A85", NE = "\u22D6", qE = "\u22DA", IE = "\u2A8B", UE = "\u22DA", jE = "\u2266", YE = "\u2276", FE = "\u2276", zE = "\u2AA1", BE = "\u2272", HE = "\u2A7D", VE = "\u2272", WE = "\u297C", GE = "\u230A", ZE = "\u{1D50F}", QE = "\u{1D529}", JE = "\u2276", XE = "\u2A91", KE = "\u2962", eA = "\u21BD", tA = "\u21BC", nA = "\u296A", sA = "\u2584", rA = "\u0409", iA = "\u0459", oA = "\u21C7", aA = "\u226A", lA = "\u22D8", cA = "\u231E", uA = "\u21DA", fA = "\u296B", hA = "\u25FA", dA = "\u013F", pA = "\u0140", mA = "\u23B0", gA = "\u23B0", yA = "\u2A89", bA = "\u2A89", wA = "\u2A87", vA = "\u2268", _A = "\u2A87", xA = "\u2268", SA = "\u22E6", kA = "\u27EC", TA = "\u21FD", DA = "\u27E6", OA = "\u27F5", EA = "\u27F5", AA = "\u27F8", CA = "\u27F7", MA = "\u27F7", PA = "\u27FA", RA = "\u27FC", $A = "\u27F6", LA = "\u27F6", NA = "\u27F9", qA = "\u21AB", IA = "\u21AC", UA = "\u2985", jA = "\u{1D543}", YA = "\u{1D55D}", FA = "\u2A2D", zA = "\u2A34", BA = "\u2217", HA = "_", VA = "\u2199", WA = "\u2198", GA = "\u25CA", ZA = "\u25CA", QA = "\u29EB", JA = "(", XA = "\u2993", KA = "\u21C6", eC = "\u231F", tC = "\u21CB", nC = "\u296D", sC = "\u200E", rC = "\u22BF", iC = "\u2039", oC = "\u{1D4C1}", aC = "\u2112", lC = "\u21B0", cC = "\u21B0", uC = "\u2272", fC = "\u2A8D", hC = "\u2A8F", dC = "[", pC = "\u2018", mC = "\u201A", gC = "\u0141", yC = "\u0142", bC = "\u2AA6", wC = "\u2A79", vC = "<", _C = "<", xC = "\u226A", SC = "\u22D6", kC = "\u22CB", TC = "\u22C9", DC = "\u2976", OC = "\u2A7B", EC = "\u25C3", AC = "\u22B4", CC = "\u25C2", MC = "\u2996", PC = "\u294A", RC = "\u2966", $C = "\u2268\uFE00", LC = "\u2268\uFE00", NC = "\xAF", qC = "\u2642", IC = "\u2720", UC = "\u2720", jC = "\u21A6", YC = "\u21A6", FC = "\u21A7", zC = "\u21A4", BC = "\u21A5", HC = "\u25AE", VC = "\u2A29", WC = "\u041C", GC = "\u043C", ZC = "\u2014", QC = "\u223A", JC = "\u2221", XC = "\u205F", KC = "\u2133", eM = "\u{1D510}", tM = "\u{1D52A}", nM = "\u2127", sM = "\xB5", rM = "*", iM = "\u2AF0", oM = "\u2223", aM = "\xB7", lM = "\u229F", cM = "\u2212", uM = "\u2238", fM = "\u2A2A", hM = "\u2213", dM = "\u2ADB", pM = "\u2026", mM = "\u2213", gM = "\u22A7", yM = "\u{1D544}", bM = "\u{1D55E}", wM = "\u2213", vM = "\u{1D4C2}", _M = "\u2133", xM = "\u223E", SM = "\u039C", kM = "\u03BC", TM = "\u22B8", DM = "\u22B8", OM = "\u2207", EM = "\u0143", AM = "\u0144", CM = "\u2220\u20D2", MM = "\u2249", PM = "\u2A70\u0338", RM = "\u224B\u0338", $M = "\u0149", LM = "\u2249", NM = "\u266E", qM = "\u2115", IM = "\u266E", UM = "\xA0", jM = "\u224E\u0338", YM = "\u224F\u0338", FM = "\u2A43", zM = "\u0147", BM = "\u0148", HM = "\u0145", VM = "\u0146", WM = "\u2247", GM = "\u2A6D\u0338", ZM = "\u2A42", QM = "\u041D", JM = "\u043D", XM = "\u2013", KM = "\u2924", eP = "\u2197", tP = "\u21D7", nP = "\u2197", sP = "\u2260", rP = "\u2250\u0338", iP = "\u200B", oP = "\u200B", aP = "\u200B", lP = "\u200B", cP = "\u2262", uP = "\u2928", fP = "\u2242\u0338", hP = "\u226B", dP = "\u226A", pP = `
`, mP = "\u2204", gP = "\u2204", yP = "\u{1D511}", bP = "\u{1D52B}", wP = "\u2267\u0338", vP = "\u2271", _P = "\u2271", xP = "\u2267\u0338", SP = "\u2A7E\u0338", kP = "\u2A7E\u0338", TP = "\u22D9\u0338", DP = "\u2275", OP = "\u226B\u20D2", EP = "\u226F", AP = "\u226F", CP = "\u226B\u0338", MP = "\u21AE", PP = "\u21CE", RP = "\u2AF2", $P = "\u220B", LP = "\u22FC", NP = "\u22FA", qP = "\u220B", IP = "\u040A", UP = "\u045A", jP = "\u219A", YP = "\u21CD", FP = "\u2025", zP = "\u2266\u0338", BP = "\u2270", HP = "\u219A", VP = "\u21CD", WP = "\u21AE", GP = "\u21CE", ZP = "\u2270", QP = "\u2266\u0338", JP = "\u2A7D\u0338", XP = "\u2A7D\u0338", KP = "\u226E", eR = "\u22D8\u0338", tR = "\u2274", nR = "\u226A\u20D2", sR = "\u226E", rR = "\u22EA", iR = "\u22EC", oR = "\u226A\u0338", aR = "\u2224", lR = "\u2060", cR = "\xA0", uR = "\u{1D55F}", fR = "\u2115", hR = "\u2AEC", dR = "\xAC", pR = "\u2262", mR = "\u226D", gR = "\u2226", yR = "\u2209", bR = "\u2260", wR = "\u2242\u0338", vR = "\u2204", _R = "\u226F", xR = "\u2271", SR = "\u2267\u0338", kR = "\u226B\u0338", TR = "\u2279", DR = "\u2A7E\u0338", OR = "\u2275", ER = "\u224E\u0338", AR = "\u224F\u0338", CR = "\u2209", MR = "\u22F5\u0338", PR = "\u22F9\u0338", RR = "\u2209", $R = "\u22F7", LR = "\u22F6", NR = "\u29CF\u0338", qR = "\u22EA", IR = "\u22EC", UR = "\u226E", jR = "\u2270", YR = "\u2278", FR = "\u226A\u0338", zR = "\u2A7D\u0338", BR = "\u2274", HR = "\u2AA2\u0338", VR = "\u2AA1\u0338", WR = "\u220C", GR = "\u220C", ZR = "\u22FE", QR = "\u22FD", JR = "\u2280", XR = "\u2AAF\u0338", KR = "\u22E0", e$ = "\u220C", t$ = "\u29D0\u0338", n$ = "\u22EB", s$ = "\u22ED", r$ = "\u228F\u0338", i$ = "\u22E2", o$ = "\u2290\u0338", a$ = "\u22E3", l$ = "\u2282\u20D2", c$ = "\u2288", u$ = "\u2281", f$ = "\u2AB0\u0338", h$ = "\u22E1", d$ = "\u227F\u0338", p$ = "\u2283\u20D2", m$ = "\u2289", g$ = "\u2241", y$ = "\u2244", b$ = "\u2247", w$ = "\u2249", v$ = "\u2224", _$ = "\u2226", x$ = "\u2226", S$ = "\u2AFD\u20E5", k$ = "\u2202\u0338", T$ = "\u2A14", D$ = "\u2280", O$ = "\u22E0", E$ = "\u2280", A$ = "\u2AAF\u0338", C$ = "\u2AAF\u0338", M$ = "\u2933\u0338", P$ = "\u219B", R$ = "\u21CF", $$ = "\u219D\u0338", L$ = "\u219B", N$ = "\u21CF", q$ = "\u22EB", I$ = "\u22ED", U$ = "\u2281", j$ = "\u22E1", Y$ = "\u2AB0\u0338", F$ = "\u{1D4A9}", z$ = "\u{1D4C3}", B$ = "\u2224", H$ = "\u2226", V$ = "\u2241", W$ = "\u2244", G$ = "\u2244", Z$ = "\u2224", Q$ = "\u2226", J$ = "\u22E2", X$ = "\u22E3", K$ = "\u2284", eL = "\u2AC5\u0338", tL = "\u2288", nL = "\u2282\u20D2", sL = "\u2288", rL = "\u2AC5\u0338", iL = "\u2281", oL = "\u2AB0\u0338", aL = "\u2285", lL = "\u2AC6\u0338", cL = "\u2289", uL = "\u2283\u20D2", fL = "\u2289", hL = "\u2AC6\u0338", dL = "\u2279", pL = "\xD1", mL = "\xF1", gL = "\u2278", yL = "\u22EA", bL = "\u22EC", wL = "\u22EB", vL = "\u22ED", _L = "\u039D", xL = "\u03BD", SL = "#", kL = "\u2116", TL = "\u2007", DL = "\u224D\u20D2", OL = "\u22AC", EL = "\u22AD", AL = "\u22AE", CL = "\u22AF", ML = "\u2265\u20D2", PL = ">\u20D2", RL = "\u2904", $L = "\u29DE", LL = "\u2902", NL = "\u2264\u20D2", qL = "<\u20D2", IL = "\u22B4\u20D2", UL = "\u2903", jL = "\u22B5\u20D2", YL = "\u223C\u20D2", FL = "\u2923", zL = "\u2196", BL = "\u21D6", HL = "\u2196", VL = "\u2927", WL = "\xD3", GL = "\xF3", ZL = "\u229B", QL = "\xD4", JL = "\xF4", XL = "\u229A", KL = "\u041E", eN = "\u043E", tN = "\u229D", nN = "\u0150", sN = "\u0151", rN = "\u2A38", iN = "\u2299", oN = "\u29BC", aN = "\u0152", lN = "\u0153", cN = "\u29BF", uN = "\u{1D512}", fN = "\u{1D52C}", hN = "\u02DB", dN = "\xD2", pN = "\xF2", mN = "\u29C1", gN = "\u29B5", yN = "\u03A9", bN = "\u222E", wN = "\u21BA", vN = "\u29BE", _N = "\u29BB", xN = "\u203E", SN = "\u29C0", kN = "\u014C", TN = "\u014D", DN = "\u03A9", ON = "\u03C9", EN = "\u039F", AN = "\u03BF", CN = "\u29B6", MN = "\u2296", PN = "\u{1D546}", RN = "\u{1D560}", $N = "\u29B7", LN = "\u201C", NN = "\u2018", qN = "\u29B9", IN = "\u2295", UN = "\u21BB", jN = "\u2A54", YN = "\u2228", FN = "\u2A5D", zN = "\u2134", BN = "\u2134", HN = "\xAA", VN = "\xBA", WN = "\u22B6", GN = "\u2A56", ZN = "\u2A57", QN = "\u2A5B", JN = "\u24C8", XN = "\u{1D4AA}", KN = "\u2134", eq = "\xD8", tq = "\xF8", nq = "\u2298", sq = "\xD5", rq = "\xF5", iq = "\u2A36", oq = "\u2A37", aq = "\u2297", lq = "\xD6", cq = "\xF6", uq = "\u233D", fq = "\u203E", hq = "\u23DE", dq = "\u23B4", pq = "\u23DC", mq = "\xB6", gq = "\u2225", yq = "\u2225", bq = "\u2AF3", wq = "\u2AFD", vq = "\u2202", _q = "\u2202", xq = "\u041F", Sq = "\u043F", kq = "%", Tq = ".", Dq = "\u2030", Oq = "\u22A5", Eq = "\u2031", Aq = "\u{1D513}", Cq = "\u{1D52D}", Mq = "\u03A6", Pq = "\u03C6", Rq = "\u03D5", $q = "\u2133", Lq = "\u260E", Nq = "\u03A0", qq = "\u03C0", Iq = "\u22D4", Uq = "\u03D6", jq = "\u210F", Yq = "\u210E", Fq = "\u210F", zq = "\u2A23", Bq = "\u229E", Hq = "\u2A22", Vq = "+", Wq = "\u2214", Gq = "\u2A25", Zq = "\u2A72", Qq = "\xB1", Jq = "\xB1", Xq = "\u2A26", Kq = "\u2A27", eI = "\xB1", tI = "\u210C", nI = "\u2A15", sI = "\u{1D561}", rI = "\u2119", iI = "\xA3", oI = "\u2AB7", aI = "\u2ABB", lI = "\u227A", cI = "\u227C", uI = "\u2AB7", fI = "\u227A", hI = "\u227C", dI = "\u227A", pI = "\u2AAF", mI = "\u227C", gI = "\u227E", yI = "\u2AAF", bI = "\u2AB9", wI = "\u2AB5", vI = "\u22E8", _I = "\u2AAF", xI = "\u2AB3", SI = "\u227E", kI = "\u2032", TI = "\u2033", DI = "\u2119", OI = "\u2AB9", EI = "\u2AB5", AI = "\u22E8", CI = "\u220F", MI = "\u220F", PI = "\u232E", RI = "\u2312", $I = "\u2313", LI = "\u221D", NI = "\u221D", qI = "\u2237", II = "\u221D", UI = "\u227E", jI = "\u22B0", YI = "\u{1D4AB}", FI = "\u{1D4C5}", zI = "\u03A8", BI = "\u03C8", HI = "\u2008", VI = "\u{1D514}", WI = "\u{1D52E}", GI = "\u2A0C", ZI = "\u{1D562}", QI = "\u211A", JI = "\u2057", XI = "\u{1D4AC}", KI = "\u{1D4C6}", e2 = "\u210D", t2 = "\u2A16", n2 = "?", s2 = "\u225F", r2 = '"', i2 = '"', o2 = "\u21DB", a2 = "\u223D\u0331", l2 = "\u0154", c2 = "\u0155", u2 = "\u221A", f2 = "\u29B3", h2 = "\u27E9", d2 = "\u27EB", p2 = "\u2992", m2 = "\u29A5", g2 = "\u27E9", y2 = "\xBB", b2 = "\u2975", w2 = "\u21E5", v2 = "\u2920", _2 = "\u2933", x2 = "\u2192", S2 = "\u21A0", k2 = "\u21D2", T2 = "\u291E", D2 = "\u21AA", O2 = "\u21AC", E2 = "\u2945", A2 = "\u2974", C2 = "\u2916", M2 = "\u21A3", P2 = "\u219D", R2 = "\u291A", $2 = "\u291C", L2 = "\u2236", N2 = "\u211A", q2 = "\u290D", I2 = "\u290F", U2 = "\u2910", j2 = "\u2773", Y2 = "}", F2 = "]", z2 = "\u298C", B2 = "\u298E", H2 = "\u2990", V2 = "\u0158", W2 = "\u0159", G2 = "\u0156", Z2 = "\u0157", Q2 = "\u2309", J2 = "}", X2 = "\u0420", K2 = "\u0440", eU = "\u2937", tU = "\u2969", nU = "\u201D", sU = "\u201D", rU = "\u21B3", iU = "\u211C", oU = "\u211B", aU = "\u211C", lU = "\u211D", cU = "\u211C", uU = "\u25AD", fU = "\xAE", hU = "\xAE", dU = "\u220B", pU = "\u21CB", mU = "\u296F", gU = "\u297D", yU = "\u230B", bU = "\u{1D52F}", wU = "\u211C", vU = "\u2964", _U = "\u21C1", xU = "\u21C0", SU = "\u296C", kU = "\u03A1", TU = "\u03C1", DU = "\u03F1", OU = "\u27E9", EU = "\u21E5", AU = "\u2192", CU = "\u2192", MU = "\u21D2", PU = "\u21C4", RU = "\u21A3", $U = "\u2309", LU = "\u27E7", NU = "\u295D", qU = "\u2955", IU = "\u21C2", UU = "\u230B", jU = "\u21C1", YU = "\u21C0", FU = "\u21C4", zU = "\u21CC", BU = "\u21C9", HU = "\u219D", VU = "\u21A6", WU = "\u22A2", GU = "\u295B", ZU = "\u22CC", QU = "\u29D0", JU = "\u22B3", XU = "\u22B5", KU = "\u294F", ej = "\u295C", tj = "\u2954", nj = "\u21BE", sj = "\u2953", rj = "\u21C0", ij = "\u02DA", oj = "\u2253", aj = "\u21C4", lj = "\u21CC", cj = "\u200F", uj = "\u23B1", fj = "\u23B1", hj = "\u2AEE", dj = "\u27ED", pj = "\u21FE", mj = "\u27E7", gj = "\u2986", yj = "\u{1D563}", bj = "\u211D", wj = "\u2A2E", vj = "\u2A35", _j = "\u2970", xj = ")", Sj = "\u2994", kj = "\u2A12", Tj = "\u21C9", Dj = "\u21DB", Oj = "\u203A", Ej = "\u{1D4C7}", Aj = "\u211B", Cj = "\u21B1", Mj = "\u21B1", Pj = "]", Rj = "\u2019", $j = "\u2019", Lj = "\u22CC", Nj = "\u22CA", qj = "\u25B9", Ij = "\u22B5", Uj = "\u25B8", jj = "\u29CE", Yj = "\u29F4", Fj = "\u2968", zj = "\u211E", Bj = "\u015A", Hj = "\u015B", Vj = "\u201A", Wj = "\u2AB8", Gj = "\u0160", Zj = "\u0161", Qj = "\u2ABC", Jj = "\u227B", Xj = "\u227D", Kj = "\u2AB0", eY = "\u2AB4", tY = "\u015E", nY = "\u015F", sY = "\u015C", rY = "\u015D", iY = "\u2ABA", oY = "\u2AB6", aY = "\u22E9", lY = "\u2A13", cY = "\u227F", uY = "\u0421", fY = "\u0441", hY = "\u22A1", dY = "\u22C5", pY = "\u2A66", mY = "\u2925", gY = "\u2198", yY = "\u21D8", bY = "\u2198", wY = "\xA7", vY = ";", _Y = "\u2929", xY = "\u2216", SY = "\u2216", kY = "\u2736", TY = "\u{1D516}", DY = "\u{1D530}", OY = "\u2322", EY = "\u266F", AY = "\u0429", CY = "\u0449", MY = "\u0428", PY = "\u0448", RY = "\u2193", $Y = "\u2190", LY = "\u2223", NY = "\u2225", qY = "\u2192", IY = "\u2191", UY = "\xAD", jY = "\u03A3", YY = "\u03C3", FY = "\u03C2", zY = "\u03C2", BY = "\u223C", HY = "\u2A6A", VY = "\u2243", WY = "\u2243", GY = "\u2A9E", ZY = "\u2AA0", QY = "\u2A9D", JY = "\u2A9F", XY = "\u2246", KY = "\u2A24", eF = "\u2972", tF = "\u2190", nF = "\u2218", sF = "\u2216", rF = "\u2A33", iF = "\u29E4", oF = "\u2223", aF = "\u2323", lF = "\u2AAA", cF = "\u2AAC", uF = "\u2AAC\uFE00", fF = "\u042C", hF = "\u044C", dF = "\u233F", pF = "\u29C4", mF = "/", gF = "\u{1D54A}", yF = "\u{1D564}", bF = "\u2660", wF = "\u2660", vF = "\u2225", _F = "\u2293", xF = "\u2293\uFE00", SF = "\u2294", kF = "\u2294\uFE00", TF = "\u221A", DF = "\u228F", OF = "\u2291", EF = "\u228F", AF = "\u2291", CF = "\u2290", MF = "\u2292", PF = "\u2290", RF = "\u2292", $F = "\u25A1", LF = "\u25A1", NF = "\u2293", qF = "\u228F", IF = "\u2291", UF = "\u2290", jF = "\u2292", YF = "\u2294", FF = "\u25AA", zF = "\u25A1", BF = "\u25AA", HF = "\u2192", VF = "\u{1D4AE}", WF = "\u{1D4C8}", GF = "\u2216", ZF = "\u2323", QF = "\u22C6", JF = "\u22C6", XF = "\u2606", KF = "\u2605", ez = "\u03F5", tz = "\u03D5", nz = "\xAF", sz = "\u2282", rz = "\u22D0", iz = "\u2ABD", oz = "\u2AC5", az = "\u2286", lz = "\u2AC3", cz = "\u2AC1", uz = "\u2ACB", fz = "\u228A", hz = "\u2ABF", dz = "\u2979", pz = "\u2282", mz = "\u22D0", gz = "\u2286", yz = "\u2AC5", bz = "\u2286", wz = "\u228A", vz = "\u2ACB", _z = "\u2AC7", xz = "\u2AD5", Sz = "\u2AD3", kz = "\u2AB8", Tz = "\u227B", Dz = "\u227D", Oz = "\u227B", Ez = "\u2AB0", Az = "\u227D", Cz = "\u227F", Mz = "\u2AB0", Pz = "\u2ABA", Rz = "\u2AB6", $z = "\u22E9", Lz = "\u227F", Nz = "\u220B", qz = "\u2211", Iz = "\u2211", Uz = "\u266A", jz = "\xB9", Yz = "\xB2", Fz = "\xB3", zz = "\u2283", Bz = "\u22D1", Hz = "\u2ABE", Vz = "\u2AD8", Wz = "\u2AC6", Gz = "\u2287", Zz = "\u2AC4", Qz = "\u2283", Jz = "\u2287", Xz = "\u27C9", Kz = "\u2AD7", eB = "\u297B", tB = "\u2AC2", nB = "\u2ACC", sB = "\u228B", rB = "\u2AC0", iB = "\u2283", oB = "\u22D1", aB = "\u2287", lB = "\u2AC6", cB = "\u228B", uB = "\u2ACC", fB = "\u2AC8", hB = "\u2AD4", dB = "\u2AD6", pB = "\u2926", mB = "\u2199", gB = "\u21D9", yB = "\u2199", bB = "\u292A", wB = "\xDF", vB = "	", _B = "\u2316", xB = "\u03A4", SB = "\u03C4", kB = "\u23B4", TB = "\u0164", DB = "\u0165", OB = "\u0162", EB = "\u0163", AB = "\u0422", CB = "\u0442", MB = "\u20DB", PB = "\u2315", RB = "\u{1D517}", $B = "\u{1D531}", LB = "\u2234", NB = "\u2234", qB = "\u2234", IB = "\u0398", UB = "\u03B8", jB = "\u03D1", YB = "\u03D1", FB = "\u2248", zB = "\u223C", BB = "\u205F\u200A", HB = "\u2009", VB = "\u2009", WB = "\u2248", GB = "\u223C", ZB = "\xDE", QB = "\xFE", JB = "\u02DC", XB = "\u223C", KB = "\u2243", eH = "\u2245", tH = "\u2248", nH = "\u2A31", sH = "\u22A0", rH = "\xD7", iH = "\u2A30", oH = "\u222D", aH = "\u2928", lH = "\u2336", cH = "\u2AF1", uH = "\u22A4", fH = "\u{1D54B}", hH = "\u{1D565}", dH = "\u2ADA", pH = "\u2929", mH = "\u2034", gH = "\u2122", yH = "\u2122", bH = "\u25B5", wH = "\u25BF", vH = "\u25C3", _H = "\u22B4", xH = "\u225C", SH = "\u25B9", kH = "\u22B5", TH = "\u25EC", DH = "\u225C", OH = "\u2A3A", EH = "\u20DB", AH = "\u2A39", CH = "\u29CD", MH = "\u2A3B", PH = "\u23E2", RH = "\u{1D4AF}", $H = "\u{1D4C9}", LH = "\u0426", NH = "\u0446", qH = "\u040B", IH = "\u045B", UH = "\u0166", jH = "\u0167", YH = "\u226C", FH = "\u219E", zH = "\u21A0", BH = "\xDA", HH = "\xFA", VH = "\u2191", WH = "\u219F", GH = "\u21D1", ZH = "\u2949", QH = "\u040E", JH = "\u045E", XH = "\u016C", KH = "\u016D", e3 = "\xDB", t3 = "\xFB", n3 = "\u0423", s3 = "\u0443", r3 = "\u21C5", i3 = "\u0170", o3 = "\u0171", a3 = "\u296E", l3 = "\u297E", c3 = "\u{1D518}", u3 = "\u{1D532}", f3 = "\xD9", h3 = "\xF9", d3 = "\u2963", p3 = "\u21BF", m3 = "\u21BE", g3 = "\u2580", y3 = "\u231C", b3 = "\u231C", w3 = "\u230F", v3 = "\u25F8", _3 = "\u016A", x3 = "\u016B", S3 = "\xA8", k3 = "_", T3 = "\u23DF", D3 = "\u23B5", O3 = "\u23DD", E3 = "\u22C3", A3 = "\u228E", C3 = "\u0172", M3 = "\u0173", P3 = "\u{1D54C}", R3 = "\u{1D566}", $3 = "\u2912", L3 = "\u2191", N3 = "\u2191", q3 = "\u21D1", I3 = "\u21C5", U3 = "\u2195", j3 = "\u2195", Y3 = "\u21D5", F3 = "\u296E", z3 = "\u21BF", B3 = "\u21BE", H3 = "\u228E", V3 = "\u2196", W3 = "\u2197", G3 = "\u03C5", Z3 = "\u03D2", Q3 = "\u03D2", J3 = "\u03A5", X3 = "\u03C5", K3 = "\u21A5", eV = "\u22A5", tV = "\u21C8", nV = "\u231D", sV = "\u231D", rV = "\u230E", iV = "\u016E", oV = "\u016F", aV = "\u25F9", lV = "\u{1D4B0}", cV = "\u{1D4CA}", uV = "\u22F0", fV = "\u0168", hV = "\u0169", dV = "\u25B5", pV = "\u25B4", mV = "\u21C8", gV = "\xDC", yV = "\xFC", bV = "\u29A7", wV = "\u299C", vV = "\u03F5", _V = "\u03F0", xV = "\u2205", SV = "\u03D5", kV = "\u03D6", TV = "\u221D", DV = "\u2195", OV = "\u21D5", EV = "\u03F1", AV = "\u03C2", CV = "\u228A\uFE00", MV = "\u2ACB\uFE00", PV = "\u228B\uFE00", RV = "\u2ACC\uFE00", $V = "\u03D1", LV = "\u22B2", NV = "\u22B3", qV = "\u2AE8", IV = "\u2AEB", UV = "\u2AE9", jV = "\u0412", YV = "\u0432", FV = "\u22A2", zV = "\u22A8", BV = "\u22A9", HV = "\u22AB", VV = "\u2AE6", WV = "\u22BB", GV = "\u2228", ZV = "\u22C1", QV = "\u225A", JV = "\u22EE", XV = "|", KV = "\u2016", e4 = "|", t4 = "\u2016", n4 = "\u2223", s4 = "|", r4 = "\u2758", i4 = "\u2240", o4 = "\u200A", a4 = "\u{1D519}", l4 = "\u{1D533}", c4 = "\u22B2", u4 = "\u2282\u20D2", f4 = "\u2283\u20D2", h4 = "\u{1D54D}", d4 = "\u{1D567}", p4 = "\u221D", m4 = "\u22B3", g4 = "\u{1D4B1}", y4 = "\u{1D4CB}", b4 = "\u2ACB\uFE00", w4 = "\u228A\uFE00", v4 = "\u2ACC\uFE00", _4 = "\u228B\uFE00", x4 = "\u22AA", S4 = "\u299A", k4 = "\u0174", T4 = "\u0175", D4 = "\u2A5F", O4 = "\u2227", E4 = "\u22C0", A4 = "\u2259", C4 = "\u2118", M4 = "\u{1D51A}", P4 = "\u{1D534}", R4 = "\u{1D54E}", $4 = "\u{1D568}", L4 = "\u2118", N4 = "\u2240", q4 = "\u2240", I4 = "\u{1D4B2}", U4 = "\u{1D4CC}", j4 = "\u22C2", Y4 = "\u25EF", F4 = "\u22C3", z4 = "\u25BD", B4 = "\u{1D51B}", H4 = "\u{1D535}", V4 = "\u27F7", W4 = "\u27FA", G4 = "\u039E", Z4 = "\u03BE", Q4 = "\u27F5", J4 = "\u27F8", X4 = "\u27FC", K4 = "\u22FB", eW = "\u2A00", tW = "\u{1D54F}", nW = "\u{1D569}", sW = "\u2A01", rW = "\u2A02", iW = "\u27F6", oW = "\u27F9", aW = "\u{1D4B3}", lW = "\u{1D4CD}", cW = "\u2A06", uW = "\u2A04", fW = "\u25B3", hW = "\u22C1", dW = "\u22C0", pW = "\xDD", mW = "\xFD", gW = "\u042F", yW = "\u044F", bW = "\u0176", wW = "\u0177", vW = "\u042B", _W = "\u044B", xW = "\xA5", SW = "\u{1D51C}", kW = "\u{1D536}", TW = "\u0407", DW = "\u0457", OW = "\u{1D550}", EW = "\u{1D56A}", AW = "\u{1D4B4}", CW = "\u{1D4CE}", MW = "\u042E", PW = "\u044E", RW = "\xFF", $W = "\u0178", LW = "\u0179", NW = "\u017A", qW = "\u017D", IW = "\u017E", UW = "\u0417", jW = "\u0437", YW = "\u017B", FW = "\u017C", zW = "\u2128", BW = "\u200B", HW = "\u0396", VW = "\u03B6", WW = "\u{1D537}", GW = "\u2128", ZW = "\u0416", QW = "\u0436", JW = "\u21DD", XW = "\u{1D56B}", KW = "\u2124", e6 = "\u{1D4B5}", t6 = "\u{1D4CF}", n6 = "\u200D", s6 = "\u200C", ri = {
  Aacute: Yd,
  aacute: Fd,
  Abreve: zd,
  abreve: Bd,
  ac: Hd,
  acd: Vd,
  acE: Wd,
  Acirc: Gd,
  acirc: Zd,
  acute: Qd,
  Acy: Jd,
  acy: Xd,
  AElig: Kd,
  aelig: ep,
  af: tp,
  Afr: np,
  afr: sp,
  Agrave: rp,
  agrave: ip,
  alefsym: op,
  aleph: ap,
  Alpha: lp,
  alpha: cp,
  Amacr: up,
  amacr: fp,
  amalg: hp,
  amp: dp,
  AMP: pp,
  andand: mp,
  And: gp,
  and: yp,
  andd: bp,
  andslope: wp,
  andv: vp,
  ang: _p,
  ange: xp,
  angle: Sp,
  angmsdaa: kp,
  angmsdab: Tp,
  angmsdac: Dp,
  angmsdad: Op,
  angmsdae: Ep,
  angmsdaf: Ap,
  angmsdag: Cp,
  angmsdah: Mp,
  angmsd: Pp,
  angrt: Rp,
  angrtvb: $p,
  angrtvbd: Lp,
  angsph: Np,
  angst: qp,
  angzarr: Ip,
  Aogon: Up,
  aogon: jp,
  Aopf: Yp,
  aopf: Fp,
  apacir: zp,
  ap: Bp,
  apE: Hp,
  ape: Vp,
  apid: Wp,
  apos: Gp,
  ApplyFunction: Zp,
  approx: Qp,
  approxeq: Jp,
  Aring: Xp,
  aring: Kp,
  Ascr: em,
  ascr: tm,
  Assign: nm,
  ast: sm,
  asymp: rm,
  asympeq: im,
  Atilde: om,
  atilde: am,
  Auml: lm,
  auml: cm,
  awconint: um,
  awint: fm,
  backcong: hm,
  backepsilon: dm,
  backprime: pm,
  backsim: mm,
  backsimeq: gm,
  Backslash: ym,
  Barv: bm,
  barvee: wm,
  barwed: vm,
  Barwed: _m,
  barwedge: xm,
  bbrk: Sm,
  bbrktbrk: km,
  bcong: Tm,
  Bcy: Dm,
  bcy: Om,
  bdquo: Em,
  becaus: Am,
  because: Cm,
  Because: Mm,
  bemptyv: Pm,
  bepsi: Rm,
  bernou: $m,
  Bernoullis: Lm,
  Beta: Nm,
  beta: qm,
  beth: Im,
  between: Um,
  Bfr: jm,
  bfr: Ym,
  bigcap: Fm,
  bigcirc: zm,
  bigcup: Bm,
  bigodot: Hm,
  bigoplus: Vm,
  bigotimes: Wm,
  bigsqcup: Gm,
  bigstar: Zm,
  bigtriangledown: Qm,
  bigtriangleup: Jm,
  biguplus: Xm,
  bigvee: Km,
  bigwedge: eg,
  bkarow: tg,
  blacklozenge: ng,
  blacksquare: sg,
  blacktriangle: rg,
  blacktriangledown: ig,
  blacktriangleleft: og,
  blacktriangleright: ag,
  blank: lg,
  blk12: cg,
  blk14: ug,
  blk34: fg,
  block: hg,
  bne: dg,
  bnequiv: pg,
  bNot: mg,
  bnot: gg,
  Bopf: yg,
  bopf: bg,
  bot: wg,
  bottom: vg,
  bowtie: _g,
  boxbox: xg,
  boxdl: Sg,
  boxdL: kg,
  boxDl: Tg,
  boxDL: Dg,
  boxdr: Og,
  boxdR: Eg,
  boxDr: Ag,
  boxDR: Cg,
  boxh: Mg,
  boxH: Pg,
  boxhd: Rg,
  boxHd: $g,
  boxhD: Lg,
  boxHD: Ng,
  boxhu: qg,
  boxHu: Ig,
  boxhU: Ug,
  boxHU: jg,
  boxminus: Yg,
  boxplus: Fg,
  boxtimes: zg,
  boxul: Bg,
  boxuL: Hg,
  boxUl: Vg,
  boxUL: Wg,
  boxur: Gg,
  boxuR: Zg,
  boxUr: Qg,
  boxUR: Jg,
  boxv: Xg,
  boxV: Kg,
  boxvh: ey,
  boxvH: ty,
  boxVh: ny,
  boxVH: sy,
  boxvl: ry,
  boxvL: iy,
  boxVl: oy,
  boxVL: ay,
  boxvr: ly,
  boxvR: cy,
  boxVr: uy,
  boxVR: fy,
  bprime: hy,
  breve: dy,
  Breve: py,
  brvbar: my,
  bscr: gy,
  Bscr: yy,
  bsemi: by,
  bsim: wy,
  bsime: vy,
  bsolb: _y,
  bsol: xy,
  bsolhsub: Sy,
  bull: ky,
  bullet: Ty,
  bump: Dy,
  bumpE: Oy,
  bumpe: Ey,
  Bumpeq: Ay,
  bumpeq: Cy,
  Cacute: My,
  cacute: Py,
  capand: Ry,
  capbrcup: $y,
  capcap: Ly,
  cap: Ny,
  Cap: qy,
  capcup: Iy,
  capdot: Uy,
  CapitalDifferentialD: jy,
  caps: Yy,
  caret: Fy,
  caron: zy,
  Cayleys: By,
  ccaps: Hy,
  Ccaron: Vy,
  ccaron: Wy,
  Ccedil: Gy,
  ccedil: Zy,
  Ccirc: Qy,
  ccirc: Jy,
  Cconint: Xy,
  ccups: Ky,
  ccupssm: eb,
  Cdot: tb,
  cdot: nb,
  cedil: sb,
  Cedilla: rb,
  cemptyv: ib,
  cent: ob,
  centerdot: ab,
  CenterDot: lb,
  cfr: cb,
  Cfr: ub,
  CHcy: fb,
  chcy: hb,
  check: db,
  checkmark: pb,
  Chi: mb,
  chi: gb,
  circ: yb,
  circeq: bb,
  circlearrowleft: wb,
  circlearrowright: vb,
  circledast: _b,
  circledcirc: xb,
  circleddash: Sb,
  CircleDot: kb,
  circledR: Tb,
  circledS: Db,
  CircleMinus: Ob,
  CirclePlus: Eb,
  CircleTimes: Ab,
  cir: Cb,
  cirE: Mb,
  cire: Pb,
  cirfnint: Rb,
  cirmid: $b,
  cirscir: Lb,
  ClockwiseContourIntegral: Nb,
  CloseCurlyDoubleQuote: qb,
  CloseCurlyQuote: Ib,
  clubs: Ub,
  clubsuit: jb,
  colon: Yb,
  Colon: Fb,
  Colone: zb,
  colone: Bb,
  coloneq: Hb,
  comma: Vb,
  commat: Wb,
  comp: Gb,
  compfn: Zb,
  complement: Qb,
  complexes: Jb,
  cong: Xb,
  congdot: Kb,
  Congruent: ew,
  conint: tw,
  Conint: nw,
  ContourIntegral: sw,
  copf: rw,
  Copf: iw,
  coprod: ow,
  Coproduct: aw,
  copy: lw,
  COPY: cw,
  copysr: uw,
  CounterClockwiseContourIntegral: fw,
  crarr: hw,
  cross: dw,
  Cross: pw,
  Cscr: mw,
  cscr: gw,
  csub: yw,
  csube: bw,
  csup: ww,
  csupe: vw,
  ctdot: _w,
  cudarrl: xw,
  cudarrr: Sw,
  cuepr: kw,
  cuesc: Tw,
  cularr: Dw,
  cularrp: Ow,
  cupbrcap: Ew,
  cupcap: Aw,
  CupCap: Cw,
  cup: Mw,
  Cup: Pw,
  cupcup: Rw,
  cupdot: $w,
  cupor: Lw,
  cups: Nw,
  curarr: qw,
  curarrm: Iw,
  curlyeqprec: Uw,
  curlyeqsucc: jw,
  curlyvee: Yw,
  curlywedge: Fw,
  curren: zw,
  curvearrowleft: Bw,
  curvearrowright: Hw,
  cuvee: Vw,
  cuwed: Ww,
  cwconint: Gw,
  cwint: Zw,
  cylcty: Qw,
  dagger: Jw,
  Dagger: Xw,
  daleth: Kw,
  darr: ev,
  Darr: tv,
  dArr: nv,
  dash: sv,
  Dashv: rv,
  dashv: iv,
  dbkarow: ov,
  dblac: av,
  Dcaron: lv,
  dcaron: cv,
  Dcy: uv,
  dcy: fv,
  ddagger: hv,
  ddarr: dv,
  DD: pv,
  dd: mv,
  DDotrahd: gv,
  ddotseq: yv,
  deg: bv,
  Del: wv,
  Delta: vv,
  delta: _v,
  demptyv: xv,
  dfisht: Sv,
  Dfr: kv,
  dfr: Tv,
  dHar: Dv,
  dharl: Ov,
  dharr: Ev,
  DiacriticalAcute: Av,
  DiacriticalDot: Cv,
  DiacriticalDoubleAcute: Mv,
  DiacriticalGrave: Pv,
  DiacriticalTilde: Rv,
  diam: $v,
  diamond: Lv,
  Diamond: Nv,
  diamondsuit: qv,
  diams: Iv,
  die: Uv,
  DifferentialD: jv,
  digamma: Yv,
  disin: Fv,
  div: zv,
  divide: Bv,
  divideontimes: Hv,
  divonx: Vv,
  DJcy: Wv,
  djcy: Gv,
  dlcorn: Zv,
  dlcrop: Qv,
  dollar: Jv,
  Dopf: Xv,
  dopf: Kv,
  Dot: e_,
  dot: t_,
  DotDot: n_,
  doteq: s_,
  doteqdot: r_,
  DotEqual: i_,
  dotminus: o_,
  dotplus: a_,
  dotsquare: l_,
  doublebarwedge: c_,
  DoubleContourIntegral: u_,
  DoubleDot: f_,
  DoubleDownArrow: h_,
  DoubleLeftArrow: d_,
  DoubleLeftRightArrow: p_,
  DoubleLeftTee: m_,
  DoubleLongLeftArrow: g_,
  DoubleLongLeftRightArrow: y_,
  DoubleLongRightArrow: b_,
  DoubleRightArrow: w_,
  DoubleRightTee: v_,
  DoubleUpArrow: __,
  DoubleUpDownArrow: x_,
  DoubleVerticalBar: S_,
  DownArrowBar: k_,
  downarrow: T_,
  DownArrow: D_,
  Downarrow: O_,
  DownArrowUpArrow: E_,
  DownBreve: A_,
  downdownarrows: C_,
  downharpoonleft: M_,
  downharpoonright: P_,
  DownLeftRightVector: R_,
  DownLeftTeeVector: $_,
  DownLeftVectorBar: L_,
  DownLeftVector: N_,
  DownRightTeeVector: q_,
  DownRightVectorBar: I_,
  DownRightVector: U_,
  DownTeeArrow: j_,
  DownTee: Y_,
  drbkarow: F_,
  drcorn: z_,
  drcrop: B_,
  Dscr: H_,
  dscr: V_,
  DScy: W_,
  dscy: G_,
  dsol: Z_,
  Dstrok: Q_,
  dstrok: J_,
  dtdot: X_,
  dtri: K_,
  dtrif: e0,
  duarr: t0,
  duhar: n0,
  dwangle: s0,
  DZcy: r0,
  dzcy: i0,
  dzigrarr: o0,
  Eacute: a0,
  eacute: l0,
  easter: c0,
  Ecaron: u0,
  ecaron: f0,
  Ecirc: h0,
  ecirc: d0,
  ecir: p0,
  ecolon: m0,
  Ecy: g0,
  ecy: y0,
  eDDot: b0,
  Edot: w0,
  edot: v0,
  eDot: _0,
  ee: x0,
  efDot: S0,
  Efr: k0,
  efr: T0,
  eg: D0,
  Egrave: O0,
  egrave: E0,
  egs: A0,
  egsdot: C0,
  el: M0,
  Element: P0,
  elinters: R0,
  ell: $0,
  els: L0,
  elsdot: N0,
  Emacr: q0,
  emacr: I0,
  empty: U0,
  emptyset: j0,
  EmptySmallSquare: Y0,
  emptyv: F0,
  EmptyVerySmallSquare: z0,
  emsp13: B0,
  emsp14: H0,
  emsp: V0,
  ENG: W0,
  eng: G0,
  ensp: Z0,
  Eogon: Q0,
  eogon: J0,
  Eopf: X0,
  eopf: K0,
  epar: e1,
  eparsl: t1,
  eplus: n1,
  epsi: s1,
  Epsilon: r1,
  epsilon: i1,
  epsiv: o1,
  eqcirc: a1,
  eqcolon: l1,
  eqsim: c1,
  eqslantgtr: u1,
  eqslantless: f1,
  Equal: h1,
  equals: d1,
  EqualTilde: p1,
  equest: m1,
  Equilibrium: g1,
  equiv: y1,
  equivDD: b1,
  eqvparsl: w1,
  erarr: v1,
  erDot: _1,
  escr: x1,
  Escr: S1,
  esdot: k1,
  Esim: T1,
  esim: D1,
  Eta: O1,
  eta: E1,
  ETH: A1,
  eth: C1,
  Euml: M1,
  euml: P1,
  euro: R1,
  excl: $1,
  exist: L1,
  Exists: N1,
  expectation: q1,
  exponentiale: I1,
  ExponentialE: U1,
  fallingdotseq: j1,
  Fcy: Y1,
  fcy: F1,
  female: z1,
  ffilig: B1,
  fflig: H1,
  ffllig: V1,
  Ffr: W1,
  ffr: G1,
  filig: Z1,
  FilledSmallSquare: Q1,
  FilledVerySmallSquare: J1,
  fjlig: X1,
  flat: K1,
  fllig: ex,
  fltns: tx,
  fnof: nx,
  Fopf: sx,
  fopf: rx,
  forall: ix,
  ForAll: ox,
  fork: ax,
  forkv: lx,
  Fouriertrf: cx,
  fpartint: ux,
  frac12: fx,
  frac13: hx,
  frac14: dx,
  frac15: px,
  frac16: mx,
  frac18: gx,
  frac23: yx,
  frac25: bx,
  frac34: wx,
  frac35: vx,
  frac38: _x,
  frac45: xx,
  frac56: Sx,
  frac58: kx,
  frac78: Tx,
  frasl: Dx,
  frown: Ox,
  fscr: Ex,
  Fscr: Ax,
  gacute: Cx,
  Gamma: Mx,
  gamma: Px,
  Gammad: Rx,
  gammad: $x,
  gap: Lx,
  Gbreve: Nx,
  gbreve: qx,
  Gcedil: Ix,
  Gcirc: Ux,
  gcirc: jx,
  Gcy: Yx,
  gcy: Fx,
  Gdot: zx,
  gdot: Bx,
  ge: Hx,
  gE: Vx,
  gEl: Wx,
  gel: Gx,
  geq: Zx,
  geqq: Qx,
  geqslant: Jx,
  gescc: Xx,
  ges: Kx,
  gesdot: eS,
  gesdoto: tS,
  gesdotol: nS,
  gesl: sS,
  gesles: rS,
  Gfr: iS,
  gfr: oS,
  gg: aS,
  Gg: lS,
  ggg: cS,
  gimel: uS,
  GJcy: fS,
  gjcy: hS,
  gla: dS,
  gl: pS,
  glE: mS,
  glj: gS,
  gnap: yS,
  gnapprox: bS,
  gne: wS,
  gnE: vS,
  gneq: _S,
  gneqq: xS,
  gnsim: SS,
  Gopf: kS,
  gopf: TS,
  grave: DS,
  GreaterEqual: OS,
  GreaterEqualLess: ES,
  GreaterFullEqual: AS,
  GreaterGreater: CS,
  GreaterLess: MS,
  GreaterSlantEqual: PS,
  GreaterTilde: RS,
  Gscr: $S,
  gscr: LS,
  gsim: NS,
  gsime: qS,
  gsiml: IS,
  gtcc: US,
  gtcir: jS,
  gt: YS,
  GT: FS,
  Gt: zS,
  gtdot: BS,
  gtlPar: HS,
  gtquest: VS,
  gtrapprox: WS,
  gtrarr: GS,
  gtrdot: ZS,
  gtreqless: QS,
  gtreqqless: JS,
  gtrless: XS,
  gtrsim: KS,
  gvertneqq: ek,
  gvnE: tk,
  Hacek: nk,
  hairsp: sk,
  half: rk,
  hamilt: ik,
  HARDcy: ok,
  hardcy: ak,
  harrcir: lk,
  harr: ck,
  hArr: uk,
  harrw: fk,
  Hat: hk,
  hbar: dk,
  Hcirc: pk,
  hcirc: mk,
  hearts: gk,
  heartsuit: yk,
  hellip: bk,
  hercon: wk,
  hfr: vk,
  Hfr: _k,
  HilbertSpace: xk,
  hksearow: Sk,
  hkswarow: kk,
  hoarr: Tk,
  homtht: Dk,
  hookleftarrow: Ok,
  hookrightarrow: Ek,
  hopf: Ak,
  Hopf: Ck,
  horbar: Mk,
  HorizontalLine: Pk,
  hscr: Rk,
  Hscr: $k,
  hslash: Lk,
  Hstrok: Nk,
  hstrok: qk,
  HumpDownHump: Ik,
  HumpEqual: Uk,
  hybull: jk,
  hyphen: Yk,
  Iacute: Fk,
  iacute: zk,
  ic: Bk,
  Icirc: Hk,
  icirc: Vk,
  Icy: Wk,
  icy: Gk,
  Idot: Zk,
  IEcy: Qk,
  iecy: Jk,
  iexcl: Xk,
  iff: Kk,
  ifr: eT,
  Ifr: tT,
  Igrave: nT,
  igrave: sT,
  ii: rT,
  iiiint: iT,
  iiint: oT,
  iinfin: aT,
  iiota: lT,
  IJlig: cT,
  ijlig: uT,
  Imacr: fT,
  imacr: hT,
  image: dT,
  ImaginaryI: pT,
  imagline: mT,
  imagpart: gT,
  imath: yT,
  Im: bT,
  imof: wT,
  imped: vT,
  Implies: _T,
  incare: xT,
  in: "\u2208",
  infin: ST,
  infintie: kT,
  inodot: TT,
  intcal: DT,
  int: OT,
  Int: ET,
  integers: AT,
  Integral: CT,
  intercal: MT,
  Intersection: PT,
  intlarhk: RT,
  intprod: $T,
  InvisibleComma: LT,
  InvisibleTimes: NT,
  IOcy: qT,
  iocy: IT,
  Iogon: UT,
  iogon: jT,
  Iopf: YT,
  iopf: FT,
  Iota: zT,
  iota: BT,
  iprod: HT,
  iquest: VT,
  iscr: WT,
  Iscr: GT,
  isin: ZT,
  isindot: QT,
  isinE: JT,
  isins: XT,
  isinsv: KT,
  isinv: eD,
  it: tD,
  Itilde: nD,
  itilde: sD,
  Iukcy: rD,
  iukcy: iD,
  Iuml: oD,
  iuml: aD,
  Jcirc: lD,
  jcirc: cD,
  Jcy: uD,
  jcy: fD,
  Jfr: hD,
  jfr: dD,
  jmath: pD,
  Jopf: mD,
  jopf: gD,
  Jscr: yD,
  jscr: bD,
  Jsercy: wD,
  jsercy: vD,
  Jukcy: _D,
  jukcy: xD,
  Kappa: SD,
  kappa: kD,
  kappav: TD,
  Kcedil: DD,
  kcedil: OD,
  Kcy: ED,
  kcy: AD,
  Kfr: CD,
  kfr: MD,
  kgreen: PD,
  KHcy: RD,
  khcy: $D,
  KJcy: LD,
  kjcy: ND,
  Kopf: qD,
  kopf: ID,
  Kscr: UD,
  kscr: jD,
  lAarr: YD,
  Lacute: FD,
  lacute: zD,
  laemptyv: BD,
  lagran: HD,
  Lambda: VD,
  lambda: WD,
  lang: GD,
  Lang: ZD,
  langd: QD,
  langle: JD,
  lap: XD,
  Laplacetrf: KD,
  laquo: eO,
  larrb: tO,
  larrbfs: nO,
  larr: sO,
  Larr: rO,
  lArr: iO,
  larrfs: oO,
  larrhk: aO,
  larrlp: lO,
  larrpl: cO,
  larrsim: uO,
  larrtl: fO,
  latail: hO,
  lAtail: dO,
  lat: pO,
  late: mO,
  lates: gO,
  lbarr: yO,
  lBarr: bO,
  lbbrk: wO,
  lbrace: vO,
  lbrack: _O,
  lbrke: xO,
  lbrksld: SO,
  lbrkslu: kO,
  Lcaron: TO,
  lcaron: DO,
  Lcedil: OO,
  lcedil: EO,
  lceil: AO,
  lcub: CO,
  Lcy: MO,
  lcy: PO,
  ldca: RO,
  ldquo: $O,
  ldquor: LO,
  ldrdhar: NO,
  ldrushar: qO,
  ldsh: IO,
  le: UO,
  lE: jO,
  LeftAngleBracket: YO,
  LeftArrowBar: FO,
  leftarrow: zO,
  LeftArrow: BO,
  Leftarrow: HO,
  LeftArrowRightArrow: VO,
  leftarrowtail: WO,
  LeftCeiling: GO,
  LeftDoubleBracket: ZO,
  LeftDownTeeVector: QO,
  LeftDownVectorBar: JO,
  LeftDownVector: XO,
  LeftFloor: KO,
  leftharpoondown: eE,
  leftharpoonup: tE,
  leftleftarrows: nE,
  leftrightarrow: sE,
  LeftRightArrow: rE,
  Leftrightarrow: iE,
  leftrightarrows: oE,
  leftrightharpoons: aE,
  leftrightsquigarrow: lE,
  LeftRightVector: cE,
  LeftTeeArrow: uE,
  LeftTee: fE,
  LeftTeeVector: hE,
  leftthreetimes: dE,
  LeftTriangleBar: pE,
  LeftTriangle: mE,
  LeftTriangleEqual: gE,
  LeftUpDownVector: yE,
  LeftUpTeeVector: bE,
  LeftUpVectorBar: wE,
  LeftUpVector: vE,
  LeftVectorBar: _E,
  LeftVector: xE,
  lEg: SE,
  leg: kE,
  leq: TE,
  leqq: DE,
  leqslant: OE,
  lescc: EE,
  les: AE,
  lesdot: CE,
  lesdoto: ME,
  lesdotor: PE,
  lesg: RE,
  lesges: $E,
  lessapprox: LE,
  lessdot: NE,
  lesseqgtr: qE,
  lesseqqgtr: IE,
  LessEqualGreater: UE,
  LessFullEqual: jE,
  LessGreater: YE,
  lessgtr: FE,
  LessLess: zE,
  lesssim: BE,
  LessSlantEqual: HE,
  LessTilde: VE,
  lfisht: WE,
  lfloor: GE,
  Lfr: ZE,
  lfr: QE,
  lg: JE,
  lgE: XE,
  lHar: KE,
  lhard: eA,
  lharu: tA,
  lharul: nA,
  lhblk: sA,
  LJcy: rA,
  ljcy: iA,
  llarr: oA,
  ll: aA,
  Ll: lA,
  llcorner: cA,
  Lleftarrow: uA,
  llhard: fA,
  lltri: hA,
  Lmidot: dA,
  lmidot: pA,
  lmoustache: mA,
  lmoust: gA,
  lnap: yA,
  lnapprox: bA,
  lne: wA,
  lnE: vA,
  lneq: _A,
  lneqq: xA,
  lnsim: SA,
  loang: kA,
  loarr: TA,
  lobrk: DA,
  longleftarrow: OA,
  LongLeftArrow: EA,
  Longleftarrow: AA,
  longleftrightarrow: CA,
  LongLeftRightArrow: MA,
  Longleftrightarrow: PA,
  longmapsto: RA,
  longrightarrow: $A,
  LongRightArrow: LA,
  Longrightarrow: NA,
  looparrowleft: qA,
  looparrowright: IA,
  lopar: UA,
  Lopf: jA,
  lopf: YA,
  loplus: FA,
  lotimes: zA,
  lowast: BA,
  lowbar: HA,
  LowerLeftArrow: VA,
  LowerRightArrow: WA,
  loz: GA,
  lozenge: ZA,
  lozf: QA,
  lpar: JA,
  lparlt: XA,
  lrarr: KA,
  lrcorner: eC,
  lrhar: tC,
  lrhard: nC,
  lrm: sC,
  lrtri: rC,
  lsaquo: iC,
  lscr: oC,
  Lscr: aC,
  lsh: lC,
  Lsh: cC,
  lsim: uC,
  lsime: fC,
  lsimg: hC,
  lsqb: dC,
  lsquo: pC,
  lsquor: mC,
  Lstrok: gC,
  lstrok: yC,
  ltcc: bC,
  ltcir: wC,
  lt: vC,
  LT: _C,
  Lt: xC,
  ltdot: SC,
  lthree: kC,
  ltimes: TC,
  ltlarr: DC,
  ltquest: OC,
  ltri: EC,
  ltrie: AC,
  ltrif: CC,
  ltrPar: MC,
  lurdshar: PC,
  luruhar: RC,
  lvertneqq: $C,
  lvnE: LC,
  macr: NC,
  male: qC,
  malt: IC,
  maltese: UC,
  Map: "\u2905",
  map: jC,
  mapsto: YC,
  mapstodown: FC,
  mapstoleft: zC,
  mapstoup: BC,
  marker: HC,
  mcomma: VC,
  Mcy: WC,
  mcy: GC,
  mdash: ZC,
  mDDot: QC,
  measuredangle: JC,
  MediumSpace: XC,
  Mellintrf: KC,
  Mfr: eM,
  mfr: tM,
  mho: nM,
  micro: sM,
  midast: rM,
  midcir: iM,
  mid: oM,
  middot: aM,
  minusb: lM,
  minus: cM,
  minusd: uM,
  minusdu: fM,
  MinusPlus: hM,
  mlcp: dM,
  mldr: pM,
  mnplus: mM,
  models: gM,
  Mopf: yM,
  mopf: bM,
  mp: wM,
  mscr: vM,
  Mscr: _M,
  mstpos: xM,
  Mu: SM,
  mu: kM,
  multimap: TM,
  mumap: DM,
  nabla: OM,
  Nacute: EM,
  nacute: AM,
  nang: CM,
  nap: MM,
  napE: PM,
  napid: RM,
  napos: $M,
  napprox: LM,
  natural: NM,
  naturals: qM,
  natur: IM,
  nbsp: UM,
  nbump: jM,
  nbumpe: YM,
  ncap: FM,
  Ncaron: zM,
  ncaron: BM,
  Ncedil: HM,
  ncedil: VM,
  ncong: WM,
  ncongdot: GM,
  ncup: ZM,
  Ncy: QM,
  ncy: JM,
  ndash: XM,
  nearhk: KM,
  nearr: eP,
  neArr: tP,
  nearrow: nP,
  ne: sP,
  nedot: rP,
  NegativeMediumSpace: iP,
  NegativeThickSpace: oP,
  NegativeThinSpace: aP,
  NegativeVeryThinSpace: lP,
  nequiv: cP,
  nesear: uP,
  nesim: fP,
  NestedGreaterGreater: hP,
  NestedLessLess: dP,
  NewLine: pP,
  nexist: mP,
  nexists: gP,
  Nfr: yP,
  nfr: bP,
  ngE: wP,
  nge: vP,
  ngeq: _P,
  ngeqq: xP,
  ngeqslant: SP,
  nges: kP,
  nGg: TP,
  ngsim: DP,
  nGt: OP,
  ngt: EP,
  ngtr: AP,
  nGtv: CP,
  nharr: MP,
  nhArr: PP,
  nhpar: RP,
  ni: $P,
  nis: LP,
  nisd: NP,
  niv: qP,
  NJcy: IP,
  njcy: UP,
  nlarr: jP,
  nlArr: YP,
  nldr: FP,
  nlE: zP,
  nle: BP,
  nleftarrow: HP,
  nLeftarrow: VP,
  nleftrightarrow: WP,
  nLeftrightarrow: GP,
  nleq: ZP,
  nleqq: QP,
  nleqslant: JP,
  nles: XP,
  nless: KP,
  nLl: eR,
  nlsim: tR,
  nLt: nR,
  nlt: sR,
  nltri: rR,
  nltrie: iR,
  nLtv: oR,
  nmid: aR,
  NoBreak: lR,
  NonBreakingSpace: cR,
  nopf: uR,
  Nopf: fR,
  Not: hR,
  not: dR,
  NotCongruent: pR,
  NotCupCap: mR,
  NotDoubleVerticalBar: gR,
  NotElement: yR,
  NotEqual: bR,
  NotEqualTilde: wR,
  NotExists: vR,
  NotGreater: _R,
  NotGreaterEqual: xR,
  NotGreaterFullEqual: SR,
  NotGreaterGreater: kR,
  NotGreaterLess: TR,
  NotGreaterSlantEqual: DR,
  NotGreaterTilde: OR,
  NotHumpDownHump: ER,
  NotHumpEqual: AR,
  notin: CR,
  notindot: MR,
  notinE: PR,
  notinva: RR,
  notinvb: $R,
  notinvc: LR,
  NotLeftTriangleBar: NR,
  NotLeftTriangle: qR,
  NotLeftTriangleEqual: IR,
  NotLess: UR,
  NotLessEqual: jR,
  NotLessGreater: YR,
  NotLessLess: FR,
  NotLessSlantEqual: zR,
  NotLessTilde: BR,
  NotNestedGreaterGreater: HR,
  NotNestedLessLess: VR,
  notni: WR,
  notniva: GR,
  notnivb: ZR,
  notnivc: QR,
  NotPrecedes: JR,
  NotPrecedesEqual: XR,
  NotPrecedesSlantEqual: KR,
  NotReverseElement: e$,
  NotRightTriangleBar: t$,
  NotRightTriangle: n$,
  NotRightTriangleEqual: s$,
  NotSquareSubset: r$,
  NotSquareSubsetEqual: i$,
  NotSquareSuperset: o$,
  NotSquareSupersetEqual: a$,
  NotSubset: l$,
  NotSubsetEqual: c$,
  NotSucceeds: u$,
  NotSucceedsEqual: f$,
  NotSucceedsSlantEqual: h$,
  NotSucceedsTilde: d$,
  NotSuperset: p$,
  NotSupersetEqual: m$,
  NotTilde: g$,
  NotTildeEqual: y$,
  NotTildeFullEqual: b$,
  NotTildeTilde: w$,
  NotVerticalBar: v$,
  nparallel: _$,
  npar: x$,
  nparsl: S$,
  npart: k$,
  npolint: T$,
  npr: D$,
  nprcue: O$,
  nprec: E$,
  npreceq: A$,
  npre: C$,
  nrarrc: M$,
  nrarr: P$,
  nrArr: R$,
  nrarrw: $$,
  nrightarrow: L$,
  nRightarrow: N$,
  nrtri: q$,
  nrtrie: I$,
  nsc: U$,
  nsccue: j$,
  nsce: Y$,
  Nscr: F$,
  nscr: z$,
  nshortmid: B$,
  nshortparallel: H$,
  nsim: V$,
  nsime: W$,
  nsimeq: G$,
  nsmid: Z$,
  nspar: Q$,
  nsqsube: J$,
  nsqsupe: X$,
  nsub: K$,
  nsubE: eL,
  nsube: tL,
  nsubset: nL,
  nsubseteq: sL,
  nsubseteqq: rL,
  nsucc: iL,
  nsucceq: oL,
  nsup: aL,
  nsupE: lL,
  nsupe: cL,
  nsupset: uL,
  nsupseteq: fL,
  nsupseteqq: hL,
  ntgl: dL,
  Ntilde: pL,
  ntilde: mL,
  ntlg: gL,
  ntriangleleft: yL,
  ntrianglelefteq: bL,
  ntriangleright: wL,
  ntrianglerighteq: vL,
  Nu: _L,
  nu: xL,
  num: SL,
  numero: kL,
  numsp: TL,
  nvap: DL,
  nvdash: OL,
  nvDash: EL,
  nVdash: AL,
  nVDash: CL,
  nvge: ML,
  nvgt: PL,
  nvHarr: RL,
  nvinfin: $L,
  nvlArr: LL,
  nvle: NL,
  nvlt: qL,
  nvltrie: IL,
  nvrArr: UL,
  nvrtrie: jL,
  nvsim: YL,
  nwarhk: FL,
  nwarr: zL,
  nwArr: BL,
  nwarrow: HL,
  nwnear: VL,
  Oacute: WL,
  oacute: GL,
  oast: ZL,
  Ocirc: QL,
  ocirc: JL,
  ocir: XL,
  Ocy: KL,
  ocy: eN,
  odash: tN,
  Odblac: nN,
  odblac: sN,
  odiv: rN,
  odot: iN,
  odsold: oN,
  OElig: aN,
  oelig: lN,
  ofcir: cN,
  Ofr: uN,
  ofr: fN,
  ogon: hN,
  Ograve: dN,
  ograve: pN,
  ogt: mN,
  ohbar: gN,
  ohm: yN,
  oint: bN,
  olarr: wN,
  olcir: vN,
  olcross: _N,
  oline: xN,
  olt: SN,
  Omacr: kN,
  omacr: TN,
  Omega: DN,
  omega: ON,
  Omicron: EN,
  omicron: AN,
  omid: CN,
  ominus: MN,
  Oopf: PN,
  oopf: RN,
  opar: $N,
  OpenCurlyDoubleQuote: LN,
  OpenCurlyQuote: NN,
  operp: qN,
  oplus: IN,
  orarr: UN,
  Or: jN,
  or: YN,
  ord: FN,
  order: zN,
  orderof: BN,
  ordf: HN,
  ordm: VN,
  origof: WN,
  oror: GN,
  orslope: ZN,
  orv: QN,
  oS: JN,
  Oscr: XN,
  oscr: KN,
  Oslash: eq,
  oslash: tq,
  osol: nq,
  Otilde: sq,
  otilde: rq,
  otimesas: iq,
  Otimes: oq,
  otimes: aq,
  Ouml: lq,
  ouml: cq,
  ovbar: uq,
  OverBar: fq,
  OverBrace: hq,
  OverBracket: dq,
  OverParenthesis: pq,
  para: mq,
  parallel: gq,
  par: yq,
  parsim: bq,
  parsl: wq,
  part: vq,
  PartialD: _q,
  Pcy: xq,
  pcy: Sq,
  percnt: kq,
  period: Tq,
  permil: Dq,
  perp: Oq,
  pertenk: Eq,
  Pfr: Aq,
  pfr: Cq,
  Phi: Mq,
  phi: Pq,
  phiv: Rq,
  phmmat: $q,
  phone: Lq,
  Pi: Nq,
  pi: qq,
  pitchfork: Iq,
  piv: Uq,
  planck: jq,
  planckh: Yq,
  plankv: Fq,
  plusacir: zq,
  plusb: Bq,
  pluscir: Hq,
  plus: Vq,
  plusdo: Wq,
  plusdu: Gq,
  pluse: Zq,
  PlusMinus: Qq,
  plusmn: Jq,
  plussim: Xq,
  plustwo: Kq,
  pm: eI,
  Poincareplane: tI,
  pointint: nI,
  popf: sI,
  Popf: rI,
  pound: iI,
  prap: oI,
  Pr: aI,
  pr: lI,
  prcue: cI,
  precapprox: uI,
  prec: fI,
  preccurlyeq: hI,
  Precedes: dI,
  PrecedesEqual: pI,
  PrecedesSlantEqual: mI,
  PrecedesTilde: gI,
  preceq: yI,
  precnapprox: bI,
  precneqq: wI,
  precnsim: vI,
  pre: _I,
  prE: xI,
  precsim: SI,
  prime: kI,
  Prime: TI,
  primes: DI,
  prnap: OI,
  prnE: EI,
  prnsim: AI,
  prod: CI,
  Product: MI,
  profalar: PI,
  profline: RI,
  profsurf: $I,
  prop: LI,
  Proportional: NI,
  Proportion: qI,
  propto: II,
  prsim: UI,
  prurel: jI,
  Pscr: YI,
  pscr: FI,
  Psi: zI,
  psi: BI,
  puncsp: HI,
  Qfr: VI,
  qfr: WI,
  qint: GI,
  qopf: ZI,
  Qopf: QI,
  qprime: JI,
  Qscr: XI,
  qscr: KI,
  quaternions: e2,
  quatint: t2,
  quest: n2,
  questeq: s2,
  quot: r2,
  QUOT: i2,
  rAarr: o2,
  race: a2,
  Racute: l2,
  racute: c2,
  radic: u2,
  raemptyv: f2,
  rang: h2,
  Rang: d2,
  rangd: p2,
  range: m2,
  rangle: g2,
  raquo: y2,
  rarrap: b2,
  rarrb: w2,
  rarrbfs: v2,
  rarrc: _2,
  rarr: x2,
  Rarr: S2,
  rArr: k2,
  rarrfs: T2,
  rarrhk: D2,
  rarrlp: O2,
  rarrpl: E2,
  rarrsim: A2,
  Rarrtl: C2,
  rarrtl: M2,
  rarrw: P2,
  ratail: R2,
  rAtail: $2,
  ratio: L2,
  rationals: N2,
  rbarr: q2,
  rBarr: I2,
  RBarr: U2,
  rbbrk: j2,
  rbrace: Y2,
  rbrack: F2,
  rbrke: z2,
  rbrksld: B2,
  rbrkslu: H2,
  Rcaron: V2,
  rcaron: W2,
  Rcedil: G2,
  rcedil: Z2,
  rceil: Q2,
  rcub: J2,
  Rcy: X2,
  rcy: K2,
  rdca: eU,
  rdldhar: tU,
  rdquo: nU,
  rdquor: sU,
  rdsh: rU,
  real: iU,
  realine: oU,
  realpart: aU,
  reals: lU,
  Re: cU,
  rect: uU,
  reg: fU,
  REG: hU,
  ReverseElement: dU,
  ReverseEquilibrium: pU,
  ReverseUpEquilibrium: mU,
  rfisht: gU,
  rfloor: yU,
  rfr: bU,
  Rfr: wU,
  rHar: vU,
  rhard: _U,
  rharu: xU,
  rharul: SU,
  Rho: kU,
  rho: TU,
  rhov: DU,
  RightAngleBracket: OU,
  RightArrowBar: EU,
  rightarrow: AU,
  RightArrow: CU,
  Rightarrow: MU,
  RightArrowLeftArrow: PU,
  rightarrowtail: RU,
  RightCeiling: $U,
  RightDoubleBracket: LU,
  RightDownTeeVector: NU,
  RightDownVectorBar: qU,
  RightDownVector: IU,
  RightFloor: UU,
  rightharpoondown: jU,
  rightharpoonup: YU,
  rightleftarrows: FU,
  rightleftharpoons: zU,
  rightrightarrows: BU,
  rightsquigarrow: HU,
  RightTeeArrow: VU,
  RightTee: WU,
  RightTeeVector: GU,
  rightthreetimes: ZU,
  RightTriangleBar: QU,
  RightTriangle: JU,
  RightTriangleEqual: XU,
  RightUpDownVector: KU,
  RightUpTeeVector: ej,
  RightUpVectorBar: tj,
  RightUpVector: nj,
  RightVectorBar: sj,
  RightVector: rj,
  ring: ij,
  risingdotseq: oj,
  rlarr: aj,
  rlhar: lj,
  rlm: cj,
  rmoustache: uj,
  rmoust: fj,
  rnmid: hj,
  roang: dj,
  roarr: pj,
  robrk: mj,
  ropar: gj,
  ropf: yj,
  Ropf: bj,
  roplus: wj,
  rotimes: vj,
  RoundImplies: _j,
  rpar: xj,
  rpargt: Sj,
  rppolint: kj,
  rrarr: Tj,
  Rrightarrow: Dj,
  rsaquo: Oj,
  rscr: Ej,
  Rscr: Aj,
  rsh: Cj,
  Rsh: Mj,
  rsqb: Pj,
  rsquo: Rj,
  rsquor: $j,
  rthree: Lj,
  rtimes: Nj,
  rtri: qj,
  rtrie: Ij,
  rtrif: Uj,
  rtriltri: jj,
  RuleDelayed: Yj,
  ruluhar: Fj,
  rx: zj,
  Sacute: Bj,
  sacute: Hj,
  sbquo: Vj,
  scap: Wj,
  Scaron: Gj,
  scaron: Zj,
  Sc: Qj,
  sc: Jj,
  sccue: Xj,
  sce: Kj,
  scE: eY,
  Scedil: tY,
  scedil: nY,
  Scirc: sY,
  scirc: rY,
  scnap: iY,
  scnE: oY,
  scnsim: aY,
  scpolint: lY,
  scsim: cY,
  Scy: uY,
  scy: fY,
  sdotb: hY,
  sdot: dY,
  sdote: pY,
  searhk: mY,
  searr: gY,
  seArr: yY,
  searrow: bY,
  sect: wY,
  semi: vY,
  seswar: _Y,
  setminus: xY,
  setmn: SY,
  sext: kY,
  Sfr: TY,
  sfr: DY,
  sfrown: OY,
  sharp: EY,
  SHCHcy: AY,
  shchcy: CY,
  SHcy: MY,
  shcy: PY,
  ShortDownArrow: RY,
  ShortLeftArrow: $Y,
  shortmid: LY,
  shortparallel: NY,
  ShortRightArrow: qY,
  ShortUpArrow: IY,
  shy: UY,
  Sigma: jY,
  sigma: YY,
  sigmaf: FY,
  sigmav: zY,
  sim: BY,
  simdot: HY,
  sime: VY,
  simeq: WY,
  simg: GY,
  simgE: ZY,
  siml: QY,
  simlE: JY,
  simne: XY,
  simplus: KY,
  simrarr: eF,
  slarr: tF,
  SmallCircle: nF,
  smallsetminus: sF,
  smashp: rF,
  smeparsl: iF,
  smid: oF,
  smile: aF,
  smt: lF,
  smte: cF,
  smtes: uF,
  SOFTcy: fF,
  softcy: hF,
  solbar: dF,
  solb: pF,
  sol: mF,
  Sopf: gF,
  sopf: yF,
  spades: bF,
  spadesuit: wF,
  spar: vF,
  sqcap: _F,
  sqcaps: xF,
  sqcup: SF,
  sqcups: kF,
  Sqrt: TF,
  sqsub: DF,
  sqsube: OF,
  sqsubset: EF,
  sqsubseteq: AF,
  sqsup: CF,
  sqsupe: MF,
  sqsupset: PF,
  sqsupseteq: RF,
  square: $F,
  Square: LF,
  SquareIntersection: NF,
  SquareSubset: qF,
  SquareSubsetEqual: IF,
  SquareSuperset: UF,
  SquareSupersetEqual: jF,
  SquareUnion: YF,
  squarf: FF,
  squ: zF,
  squf: BF,
  srarr: HF,
  Sscr: VF,
  sscr: WF,
  ssetmn: GF,
  ssmile: ZF,
  sstarf: QF,
  Star: JF,
  star: XF,
  starf: KF,
  straightepsilon: ez,
  straightphi: tz,
  strns: nz,
  sub: sz,
  Sub: rz,
  subdot: iz,
  subE: oz,
  sube: az,
  subedot: lz,
  submult: cz,
  subnE: uz,
  subne: fz,
  subplus: hz,
  subrarr: dz,
  subset: pz,
  Subset: mz,
  subseteq: gz,
  subseteqq: yz,
  SubsetEqual: bz,
  subsetneq: wz,
  subsetneqq: vz,
  subsim: _z,
  subsub: xz,
  subsup: Sz,
  succapprox: kz,
  succ: Tz,
  succcurlyeq: Dz,
  Succeeds: Oz,
  SucceedsEqual: Ez,
  SucceedsSlantEqual: Az,
  SucceedsTilde: Cz,
  succeq: Mz,
  succnapprox: Pz,
  succneqq: Rz,
  succnsim: $z,
  succsim: Lz,
  SuchThat: Nz,
  sum: qz,
  Sum: Iz,
  sung: Uz,
  sup1: jz,
  sup2: Yz,
  sup3: Fz,
  sup: zz,
  Sup: Bz,
  supdot: Hz,
  supdsub: Vz,
  supE: Wz,
  supe: Gz,
  supedot: Zz,
  Superset: Qz,
  SupersetEqual: Jz,
  suphsol: Xz,
  suphsub: Kz,
  suplarr: eB,
  supmult: tB,
  supnE: nB,
  supne: sB,
  supplus: rB,
  supset: iB,
  Supset: oB,
  supseteq: aB,
  supseteqq: lB,
  supsetneq: cB,
  supsetneqq: uB,
  supsim: fB,
  supsub: hB,
  supsup: dB,
  swarhk: pB,
  swarr: mB,
  swArr: gB,
  swarrow: yB,
  swnwar: bB,
  szlig: wB,
  Tab: vB,
  target: _B,
  Tau: xB,
  tau: SB,
  tbrk: kB,
  Tcaron: TB,
  tcaron: DB,
  Tcedil: OB,
  tcedil: EB,
  Tcy: AB,
  tcy: CB,
  tdot: MB,
  telrec: PB,
  Tfr: RB,
  tfr: $B,
  there4: LB,
  therefore: NB,
  Therefore: qB,
  Theta: IB,
  theta: UB,
  thetasym: jB,
  thetav: YB,
  thickapprox: FB,
  thicksim: zB,
  ThickSpace: BB,
  ThinSpace: HB,
  thinsp: VB,
  thkap: WB,
  thksim: GB,
  THORN: ZB,
  thorn: QB,
  tilde: JB,
  Tilde: XB,
  TildeEqual: KB,
  TildeFullEqual: eH,
  TildeTilde: tH,
  timesbar: nH,
  timesb: sH,
  times: rH,
  timesd: iH,
  tint: oH,
  toea: aH,
  topbot: lH,
  topcir: cH,
  top: uH,
  Topf: fH,
  topf: hH,
  topfork: dH,
  tosa: pH,
  tprime: mH,
  trade: gH,
  TRADE: yH,
  triangle: bH,
  triangledown: wH,
  triangleleft: vH,
  trianglelefteq: _H,
  triangleq: xH,
  triangleright: SH,
  trianglerighteq: kH,
  tridot: TH,
  trie: DH,
  triminus: OH,
  TripleDot: EH,
  triplus: AH,
  trisb: CH,
  tritime: MH,
  trpezium: PH,
  Tscr: RH,
  tscr: $H,
  TScy: LH,
  tscy: NH,
  TSHcy: qH,
  tshcy: IH,
  Tstrok: UH,
  tstrok: jH,
  twixt: YH,
  twoheadleftarrow: FH,
  twoheadrightarrow: zH,
  Uacute: BH,
  uacute: HH,
  uarr: VH,
  Uarr: WH,
  uArr: GH,
  Uarrocir: ZH,
  Ubrcy: QH,
  ubrcy: JH,
  Ubreve: XH,
  ubreve: KH,
  Ucirc: e3,
  ucirc: t3,
  Ucy: n3,
  ucy: s3,
  udarr: r3,
  Udblac: i3,
  udblac: o3,
  udhar: a3,
  ufisht: l3,
  Ufr: c3,
  ufr: u3,
  Ugrave: f3,
  ugrave: h3,
  uHar: d3,
  uharl: p3,
  uharr: m3,
  uhblk: g3,
  ulcorn: y3,
  ulcorner: b3,
  ulcrop: w3,
  ultri: v3,
  Umacr: _3,
  umacr: x3,
  uml: S3,
  UnderBar: k3,
  UnderBrace: T3,
  UnderBracket: D3,
  UnderParenthesis: O3,
  Union: E3,
  UnionPlus: A3,
  Uogon: C3,
  uogon: M3,
  Uopf: P3,
  uopf: R3,
  UpArrowBar: $3,
  uparrow: L3,
  UpArrow: N3,
  Uparrow: q3,
  UpArrowDownArrow: I3,
  updownarrow: U3,
  UpDownArrow: j3,
  Updownarrow: Y3,
  UpEquilibrium: F3,
  upharpoonleft: z3,
  upharpoonright: B3,
  uplus: H3,
  UpperLeftArrow: V3,
  UpperRightArrow: W3,
  upsi: G3,
  Upsi: Z3,
  upsih: Q3,
  Upsilon: J3,
  upsilon: X3,
  UpTeeArrow: K3,
  UpTee: eV,
  upuparrows: tV,
  urcorn: nV,
  urcorner: sV,
  urcrop: rV,
  Uring: iV,
  uring: oV,
  urtri: aV,
  Uscr: lV,
  uscr: cV,
  utdot: uV,
  Utilde: fV,
  utilde: hV,
  utri: dV,
  utrif: pV,
  uuarr: mV,
  Uuml: gV,
  uuml: yV,
  uwangle: bV,
  vangrt: wV,
  varepsilon: vV,
  varkappa: _V,
  varnothing: xV,
  varphi: SV,
  varpi: kV,
  varpropto: TV,
  varr: DV,
  vArr: OV,
  varrho: EV,
  varsigma: AV,
  varsubsetneq: CV,
  varsubsetneqq: MV,
  varsupsetneq: PV,
  varsupsetneqq: RV,
  vartheta: $V,
  vartriangleleft: LV,
  vartriangleright: NV,
  vBar: qV,
  Vbar: IV,
  vBarv: UV,
  Vcy: jV,
  vcy: YV,
  vdash: FV,
  vDash: zV,
  Vdash: BV,
  VDash: HV,
  Vdashl: VV,
  veebar: WV,
  vee: GV,
  Vee: ZV,
  veeeq: QV,
  vellip: JV,
  verbar: XV,
  Verbar: KV,
  vert: e4,
  Vert: t4,
  VerticalBar: n4,
  VerticalLine: s4,
  VerticalSeparator: r4,
  VerticalTilde: i4,
  VeryThinSpace: o4,
  Vfr: a4,
  vfr: l4,
  vltri: c4,
  vnsub: u4,
  vnsup: f4,
  Vopf: h4,
  vopf: d4,
  vprop: p4,
  vrtri: m4,
  Vscr: g4,
  vscr: y4,
  vsubnE: b4,
  vsubne: w4,
  vsupnE: v4,
  vsupne: _4,
  Vvdash: x4,
  vzigzag: S4,
  Wcirc: k4,
  wcirc: T4,
  wedbar: D4,
  wedge: O4,
  Wedge: E4,
  wedgeq: A4,
  weierp: C4,
  Wfr: M4,
  wfr: P4,
  Wopf: R4,
  wopf: $4,
  wp: L4,
  wr: N4,
  wreath: q4,
  Wscr: I4,
  wscr: U4,
  xcap: j4,
  xcirc: Y4,
  xcup: F4,
  xdtri: z4,
  Xfr: B4,
  xfr: H4,
  xharr: V4,
  xhArr: W4,
  Xi: G4,
  xi: Z4,
  xlarr: Q4,
  xlArr: J4,
  xmap: X4,
  xnis: K4,
  xodot: eW,
  Xopf: tW,
  xopf: nW,
  xoplus: sW,
  xotime: rW,
  xrarr: iW,
  xrArr: oW,
  Xscr: aW,
  xscr: lW,
  xsqcup: cW,
  xuplus: uW,
  xutri: fW,
  xvee: hW,
  xwedge: dW,
  Yacute: pW,
  yacute: mW,
  YAcy: gW,
  yacy: yW,
  Ycirc: bW,
  ycirc: wW,
  Ycy: vW,
  ycy: _W,
  yen: xW,
  Yfr: SW,
  yfr: kW,
  YIcy: TW,
  yicy: DW,
  Yopf: OW,
  yopf: EW,
  Yscr: AW,
  yscr: CW,
  YUcy: MW,
  yucy: PW,
  yuml: RW,
  Yuml: $W,
  Zacute: LW,
  zacute: NW,
  Zcaron: qW,
  zcaron: IW,
  Zcy: UW,
  zcy: jW,
  Zdot: YW,
  zdot: FW,
  zeetrf: zW,
  ZeroWidthSpace: BW,
  Zeta: HW,
  zeta: VW,
  zfr: WW,
  Zfr: GW,
  ZHcy: ZW,
  zhcy: QW,
  zigrarr: JW,
  zopf: XW,
  Zopf: KW,
  Zscr: e6,
  zscr: t6,
  zwj: n6,
  zwnj: s6
}, r6 = "\xC1", i6 = "\xE1", o6 = "\xC2", a6 = "\xE2", l6 = "\xB4", c6 = "\xC6", u6 = "\xE6", f6 = "\xC0", h6 = "\xE0", d6 = "&", p6 = "&", m6 = "\xC5", g6 = "\xE5", y6 = "\xC3", b6 = "\xE3", w6 = "\xC4", v6 = "\xE4", _6 = "\xA6", x6 = "\xC7", S6 = "\xE7", k6 = "\xB8", T6 = "\xA2", D6 = "\xA9", O6 = "\xA9", E6 = "\xA4", A6 = "\xB0", C6 = "\xF7", M6 = "\xC9", P6 = "\xE9", R6 = "\xCA", $6 = "\xEA", L6 = "\xC8", N6 = "\xE8", q6 = "\xD0", I6 = "\xF0", U6 = "\xCB", j6 = "\xEB", Y6 = "\xBD", F6 = "\xBC", z6 = "\xBE", B6 = ">", H6 = ">", V6 = "\xCD", W6 = "\xED", G6 = "\xCE", Z6 = "\xEE", Q6 = "\xA1", J6 = "\xCC", X6 = "\xEC", K6 = "\xBF", eG = "\xCF", tG = "\xEF", nG = "\xAB", sG = "<", rG = "<", iG = "\xAF", oG = "\xB5", aG = "\xB7", lG = "\xA0", cG = "\xAC", uG = "\xD1", fG = "\xF1", hG = "\xD3", dG = "\xF3", pG = "\xD4", mG = "\xF4", gG = "\xD2", yG = "\xF2", bG = "\xAA", wG = "\xBA", vG = "\xD8", _G = "\xF8", xG = "\xD5", SG = "\xF5", kG = "\xD6", TG = "\xF6", DG = "\xB6", OG = "\xB1", EG = "\xA3", AG = '"', CG = '"', MG = "\xBB", PG = "\xAE", RG = "\xAE", $G = "\xA7", LG = "\xAD", NG = "\xB9", qG = "\xB2", IG = "\xB3", UG = "\xDF", jG = "\xDE", YG = "\xFE", FG = "\xD7", zG = "\xDA", BG = "\xFA", HG = "\xDB", VG = "\xFB", WG = "\xD9", GG = "\xF9", ZG = "\xA8", QG = "\xDC", JG = "\xFC", XG = "\xDD", KG = "\xFD", e5 = "\xA5", t5 = "\xFF", Oa = {
  Aacute: r6,
  aacute: i6,
  Acirc: o6,
  acirc: a6,
  acute: l6,
  AElig: c6,
  aelig: u6,
  Agrave: f6,
  agrave: h6,
  amp: d6,
  AMP: p6,
  Aring: m6,
  aring: g6,
  Atilde: y6,
  atilde: b6,
  Auml: w6,
  auml: v6,
  brvbar: _6,
  Ccedil: x6,
  ccedil: S6,
  cedil: k6,
  cent: T6,
  copy: D6,
  COPY: O6,
  curren: E6,
  deg: A6,
  divide: C6,
  Eacute: M6,
  eacute: P6,
  Ecirc: R6,
  ecirc: $6,
  Egrave: L6,
  egrave: N6,
  ETH: q6,
  eth: I6,
  Euml: U6,
  euml: j6,
  frac12: Y6,
  frac14: F6,
  frac34: z6,
  gt: B6,
  GT: H6,
  Iacute: V6,
  iacute: W6,
  Icirc: G6,
  icirc: Z6,
  iexcl: Q6,
  Igrave: J6,
  igrave: X6,
  iquest: K6,
  Iuml: eG,
  iuml: tG,
  laquo: nG,
  lt: sG,
  LT: rG,
  macr: iG,
  micro: oG,
  middot: aG,
  nbsp: lG,
  not: cG,
  Ntilde: uG,
  ntilde: fG,
  Oacute: hG,
  oacute: dG,
  Ocirc: pG,
  ocirc: mG,
  Ograve: gG,
  ograve: yG,
  ordf: bG,
  ordm: wG,
  Oslash: vG,
  oslash: _G,
  Otilde: xG,
  otilde: SG,
  Ouml: kG,
  ouml: TG,
  para: DG,
  plusmn: OG,
  pound: EG,
  quot: AG,
  QUOT: CG,
  raquo: MG,
  reg: PG,
  REG: RG,
  sect: $G,
  shy: LG,
  sup1: NG,
  sup2: qG,
  sup3: IG,
  szlig: UG,
  THORN: jG,
  thorn: YG,
  times: FG,
  Uacute: zG,
  uacute: BG,
  Ucirc: HG,
  ucirc: VG,
  Ugrave: WG,
  ugrave: GG,
  uml: ZG,
  Uuml: QG,
  uuml: JG,
  Yacute: XG,
  yacute: KG,
  yen: e5,
  yuml: t5
}, n5 = "&", s5 = "'", r5 = ">", i5 = "<", o5 = '"', ii = {
  amp: n5,
  apos: s5,
  gt: r5,
  lt: i5,
  quot: o5
};
var Ps = D && D.__importDefault || function(t) {
  return t && t.__esModule ? t : { default: t };
};
Object.defineProperty(Cs, "__esModule", { value: !0 });
var a5 = Ps(Ms), l5 = Ps(ri), Xs = Ps(Oa), c5 = Ps(ii);
function ke(t) {
  return t === " " || t === `
` || t === "	" || t === "\f" || t === "\r";
}
function zi(t) {
  return t >= "a" && t <= "z" || t >= "A" && t <= "Z";
}
function ce(t, e, n) {
  var s = t.toLowerCase();
  return t === s ? function(r, i) {
    i === s ? r._state = e : (r._state = n, r._index--);
  } : function(r, i) {
    i === s || i === t ? r._state = e : (r._state = n, r._index--);
  };
}
function Ye(t, e) {
  var n = t.toLowerCase();
  return function(s, r) {
    r === n || r === t ? s._state = e : (s._state = 3, s._index--);
  };
}
var u5 = ce("C", 24, 16), f5 = ce("D", 25, 16), h5 = ce("A", 26, 16), d5 = ce("T", 27, 16), p5 = ce("A", 28, 16), m5 = Ye("R", 35), g5 = Ye("I", 36), y5 = Ye("P", 37), b5 = Ye("T", 38), w5 = ce("R", 40, 1), v5 = ce("I", 41, 1), _5 = ce("P", 42, 1), x5 = ce("T", 43, 1), S5 = Ye("Y", 45), k5 = Ye("L", 46), T5 = Ye("E", 47), D5 = ce("Y", 49, 1), O5 = ce("L", 50, 1), E5 = ce("E", 51, 1), A5 = Ye("I", 54), C5 = Ye("T", 55), M5 = Ye("L", 56), P5 = Ye("E", 57), R5 = ce("I", 58, 1), $5 = ce("T", 59, 1), L5 = ce("L", 60, 1), N5 = ce("E", 61, 1), q5 = ce("#", 63, 64), I5 = ce("X", 66, 65), U5 = function() {
  function t(e, n) {
    var s;
    this._state = 1, this.buffer = "", this.sectionStart = 0, this._index = 0, this.bufferOffset = 0, this.baseState = 1, this.special = 1, this.running = !0, this.ended = !1, this.cbs = n, this.xmlMode = !!(e != null && e.xmlMode), this.decodeEntities = (s = e == null ? void 0 : e.decodeEntities) !== null && s !== void 0 ? s : !0;
  }
  return t.prototype.reset = function() {
    this._state = 1, this.buffer = "", this.sectionStart = 0, this._index = 0, this.bufferOffset = 0, this.baseState = 1, this.special = 1, this.running = !0, this.ended = !1;
  }, t.prototype.write = function(e) {
    this.ended && this.cbs.onerror(Error(".write() after done!")), this.buffer += e, this.parse();
  }, t.prototype.end = function(e) {
    this.ended && this.cbs.onerror(Error(".end() after done!")), e && this.write(e), this.ended = !0, this.running && this.finish();
  }, t.prototype.pause = function() {
    this.running = !1;
  }, t.prototype.resume = function() {
    this.running = !0, this._index < this.buffer.length && this.parse(), this.ended && this.finish();
  }, t.prototype.getAbsoluteIndex = function() {
    return this.bufferOffset + this._index;
  }, t.prototype.stateText = function(e) {
    e === "<" ? (this._index > this.sectionStart && this.cbs.ontext(this.getSection()), this._state = 2, this.sectionStart = this._index) : this.decodeEntities && e === "&" && (this.special === 1 || this.special === 4) && (this._index > this.sectionStart && this.cbs.ontext(this.getSection()), this.baseState = 1, this._state = 62, this.sectionStart = this._index);
  }, t.prototype.isTagStartChar = function(e) {
    return zi(e) || this.xmlMode && !ke(e) && e !== "/" && e !== ">";
  }, t.prototype.stateBeforeTagName = function(e) {
    e === "/" ? this._state = 5 : e === "<" ? (this.cbs.ontext(this.getSection()), this.sectionStart = this._index) : e === ">" || this.special !== 1 || ke(e) ? this._state = 1 : e === "!" ? (this._state = 15, this.sectionStart = this._index + 1) : e === "?" ? (this._state = 17, this.sectionStart = this._index + 1) : this.isTagStartChar(e) ? (this._state = !this.xmlMode && (e === "s" || e === "S") ? 32 : !this.xmlMode && (e === "t" || e === "T") ? 52 : 3, this.sectionStart = this._index) : this._state = 1;
  }, t.prototype.stateInTagName = function(e) {
    (e === "/" || e === ">" || ke(e)) && (this.emitToken("onopentagname"), this._state = 8, this._index--);
  }, t.prototype.stateBeforeClosingTagName = function(e) {
    ke(e) || (e === ">" ? this._state = 1 : this.special !== 1 ? this.special !== 4 && (e === "s" || e === "S") ? this._state = 33 : this.special === 4 && (e === "t" || e === "T") ? this._state = 53 : (this._state = 1, this._index--) : this.isTagStartChar(e) ? (this._state = 6, this.sectionStart = this._index) : (this._state = 20, this.sectionStart = this._index));
  }, t.prototype.stateInClosingTagName = function(e) {
    (e === ">" || ke(e)) && (this.emitToken("onclosetag"), this._state = 7, this._index--);
  }, t.prototype.stateAfterClosingTagName = function(e) {
    e === ">" && (this._state = 1, this.sectionStart = this._index + 1);
  }, t.prototype.stateBeforeAttributeName = function(e) {
    e === ">" ? (this.cbs.onopentagend(), this._state = 1, this.sectionStart = this._index + 1) : e === "/" ? this._state = 4 : ke(e) || (this._state = 9, this.sectionStart = this._index);
  }, t.prototype.stateInSelfClosingTag = function(e) {
    e === ">" ? (this.cbs.onselfclosingtag(), this._state = 1, this.sectionStart = this._index + 1, this.special = 1) : ke(e) || (this._state = 8, this._index--);
  }, t.prototype.stateInAttributeName = function(e) {
    (e === "=" || e === "/" || e === ">" || ke(e)) && (this.cbs.onattribname(this.getSection()), this.sectionStart = -1, this._state = 10, this._index--);
  }, t.prototype.stateAfterAttributeName = function(e) {
    e === "=" ? this._state = 11 : e === "/" || e === ">" ? (this.cbs.onattribend(void 0), this._state = 8, this._index--) : ke(e) || (this.cbs.onattribend(void 0), this._state = 9, this.sectionStart = this._index);
  }, t.prototype.stateBeforeAttributeValue = function(e) {
    e === '"' ? (this._state = 12, this.sectionStart = this._index + 1) : e === "'" ? (this._state = 13, this.sectionStart = this._index + 1) : ke(e) || (this._state = 14, this.sectionStart = this._index, this._index--);
  }, t.prototype.handleInAttributeValue = function(e, n) {
    e === n ? (this.emitToken("onattribdata"), this.cbs.onattribend(n), this._state = 8) : this.decodeEntities && e === "&" && (this.emitToken("onattribdata"), this.baseState = this._state, this._state = 62, this.sectionStart = this._index);
  }, t.prototype.stateInAttributeValueDoubleQuotes = function(e) {
    this.handleInAttributeValue(e, '"');
  }, t.prototype.stateInAttributeValueSingleQuotes = function(e) {
    this.handleInAttributeValue(e, "'");
  }, t.prototype.stateInAttributeValueNoQuotes = function(e) {
    ke(e) || e === ">" ? (this.emitToken("onattribdata"), this.cbs.onattribend(null), this._state = 8, this._index--) : this.decodeEntities && e === "&" && (this.emitToken("onattribdata"), this.baseState = this._state, this._state = 62, this.sectionStart = this._index);
  }, t.prototype.stateBeforeDeclaration = function(e) {
    this._state = e === "[" ? 23 : e === "-" ? 18 : 16;
  }, t.prototype.stateInDeclaration = function(e) {
    e === ">" && (this.cbs.ondeclaration(this.getSection()), this._state = 1, this.sectionStart = this._index + 1);
  }, t.prototype.stateInProcessingInstruction = function(e) {
    e === ">" && (this.cbs.onprocessinginstruction(this.getSection()), this._state = 1, this.sectionStart = this._index + 1);
  }, t.prototype.stateBeforeComment = function(e) {
    e === "-" ? (this._state = 19, this.sectionStart = this._index + 1) : this._state = 16;
  }, t.prototype.stateInComment = function(e) {
    e === "-" && (this._state = 21);
  }, t.prototype.stateInSpecialComment = function(e) {
    e === ">" && (this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index)), this._state = 1, this.sectionStart = this._index + 1);
  }, t.prototype.stateAfterComment1 = function(e) {
    e === "-" ? this._state = 22 : this._state = 19;
  }, t.prototype.stateAfterComment2 = function(e) {
    e === ">" ? (this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index - 2)), this._state = 1, this.sectionStart = this._index + 1) : e !== "-" && (this._state = 19);
  }, t.prototype.stateBeforeCdata6 = function(e) {
    e === "[" ? (this._state = 29, this.sectionStart = this._index + 1) : (this._state = 16, this._index--);
  }, t.prototype.stateInCdata = function(e) {
    e === "]" && (this._state = 30);
  }, t.prototype.stateAfterCdata1 = function(e) {
    e === "]" ? this._state = 31 : this._state = 29;
  }, t.prototype.stateAfterCdata2 = function(e) {
    e === ">" ? (this.cbs.oncdata(this.buffer.substring(this.sectionStart, this._index - 2)), this._state = 1, this.sectionStart = this._index + 1) : e !== "]" && (this._state = 29);
  }, t.prototype.stateBeforeSpecialS = function(e) {
    e === "c" || e === "C" ? this._state = 34 : e === "t" || e === "T" ? this._state = 44 : (this._state = 3, this._index--);
  }, t.prototype.stateBeforeSpecialSEnd = function(e) {
    this.special === 2 && (e === "c" || e === "C") ? this._state = 39 : this.special === 3 && (e === "t" || e === "T") ? this._state = 48 : this._state = 1;
  }, t.prototype.stateBeforeSpecialLast = function(e, n) {
    (e === "/" || e === ">" || ke(e)) && (this.special = n), this._state = 3, this._index--;
  }, t.prototype.stateAfterSpecialLast = function(e, n) {
    e === ">" || ke(e) ? (this.special = 1, this._state = 6, this.sectionStart = this._index - n, this._index--) : this._state = 1;
  }, t.prototype.parseFixedEntity = function(e) {
    if (e === void 0 && (e = this.xmlMode ? c5.default : l5.default), this.sectionStart + 1 < this._index) {
      var n = this.buffer.substring(this.sectionStart + 1, this._index);
      Object.prototype.hasOwnProperty.call(e, n) && (this.emitPartial(e[n]), this.sectionStart = this._index + 1);
    }
  }, t.prototype.parseLegacyEntity = function() {
    for (var e = this.sectionStart + 1, n = Math.min(this._index - e, 6); n >= 2; ) {
      var s = this.buffer.substr(e, n);
      if (Object.prototype.hasOwnProperty.call(Xs.default, s)) {
        this.emitPartial(Xs.default[s]), this.sectionStart += n + 1;
        return;
      }
      n--;
    }
  }, t.prototype.stateInNamedEntity = function(e) {
    e === ";" ? (this.parseFixedEntity(), this.baseState === 1 && this.sectionStart + 1 < this._index && !this.xmlMode && this.parseLegacyEntity(), this._state = this.baseState) : (e < "0" || e > "9") && !zi(e) && (this.xmlMode || this.sectionStart + 1 === this._index || (this.baseState !== 1 ? e !== "=" && this.parseFixedEntity(Xs.default) : this.parseLegacyEntity()), this._state = this.baseState, this._index--);
  }, t.prototype.decodeNumericEntity = function(e, n, s) {
    var r = this.sectionStart + e;
    if (r !== this._index) {
      var i = this.buffer.substring(r, this._index), o = parseInt(i, n);
      this.emitPartial(a5.default(o)), this.sectionStart = s ? this._index + 1 : this._index;
    }
    this._state = this.baseState;
  }, t.prototype.stateInNumericEntity = function(e) {
    e === ";" ? this.decodeNumericEntity(2, 10, !0) : (e < "0" || e > "9") && (this.xmlMode ? this._state = this.baseState : this.decodeNumericEntity(2, 10, !1), this._index--);
  }, t.prototype.stateInHexEntity = function(e) {
    e === ";" ? this.decodeNumericEntity(3, 16, !0) : (e < "a" || e > "f") && (e < "A" || e > "F") && (e < "0" || e > "9") && (this.xmlMode ? this._state = this.baseState : this.decodeNumericEntity(3, 16, !1), this._index--);
  }, t.prototype.cleanup = function() {
    this.sectionStart < 0 ? (this.buffer = "", this.bufferOffset += this._index, this._index = 0) : this.running && (this._state === 1 ? (this.sectionStart !== this._index && this.cbs.ontext(this.buffer.substr(this.sectionStart)), this.buffer = "", this.bufferOffset += this._index, this._index = 0) : this.sectionStart === this._index ? (this.buffer = "", this.bufferOffset += this._index, this._index = 0) : (this.buffer = this.buffer.substr(this.sectionStart), this._index -= this.sectionStart, this.bufferOffset += this.sectionStart), this.sectionStart = 0);
  }, t.prototype.parse = function() {
    for (; this._index < this.buffer.length && this.running; ) {
      var e = this.buffer.charAt(this._index);
      this._state === 1 ? this.stateText(e) : this._state === 12 ? this.stateInAttributeValueDoubleQuotes(e) : this._state === 9 ? this.stateInAttributeName(e) : this._state === 19 ? this.stateInComment(e) : this._state === 20 ? this.stateInSpecialComment(e) : this._state === 8 ? this.stateBeforeAttributeName(e) : this._state === 3 ? this.stateInTagName(e) : this._state === 6 ? this.stateInClosingTagName(e) : this._state === 2 ? this.stateBeforeTagName(e) : this._state === 10 ? this.stateAfterAttributeName(e) : this._state === 13 ? this.stateInAttributeValueSingleQuotes(e) : this._state === 11 ? this.stateBeforeAttributeValue(e) : this._state === 5 ? this.stateBeforeClosingTagName(e) : this._state === 7 ? this.stateAfterClosingTagName(e) : this._state === 32 ? this.stateBeforeSpecialS(e) : this._state === 21 ? this.stateAfterComment1(e) : this._state === 14 ? this.stateInAttributeValueNoQuotes(e) : this._state === 4 ? this.stateInSelfClosingTag(e) : this._state === 16 ? this.stateInDeclaration(e) : this._state === 15 ? this.stateBeforeDeclaration(e) : this._state === 22 ? this.stateAfterComment2(e) : this._state === 18 ? this.stateBeforeComment(e) : this._state === 33 ? this.stateBeforeSpecialSEnd(e) : this._state === 53 ? R5(this, e) : this._state === 39 ? w5(this, e) : this._state === 40 ? v5(this, e) : this._state === 41 ? _5(this, e) : this._state === 34 ? m5(this, e) : this._state === 35 ? g5(this, e) : this._state === 36 ? y5(this, e) : this._state === 37 ? b5(this, e) : this._state === 38 ? this.stateBeforeSpecialLast(e, 2) : this._state === 42 ? x5(this, e) : this._state === 43 ? this.stateAfterSpecialLast(e, 6) : this._state === 44 ? S5(this, e) : this._state === 29 ? this.stateInCdata(e) : this._state === 45 ? k5(this, e) : this._state === 46 ? T5(this, e) : this._state === 47 ? this.stateBeforeSpecialLast(e, 3) : this._state === 48 ? D5(this, e) : this._state === 49 ? O5(this, e) : this._state === 50 ? E5(this, e) : this._state === 51 ? this.stateAfterSpecialLast(e, 5) : this._state === 52 ? A5(this, e) : this._state === 54 ? C5(this, e) : this._state === 55 ? M5(this, e) : this._state === 56 ? P5(this, e) : this._state === 57 ? this.stateBeforeSpecialLast(e, 4) : this._state === 58 ? $5(this, e) : this._state === 59 ? L5(this, e) : this._state === 60 ? N5(this, e) : this._state === 61 ? this.stateAfterSpecialLast(e, 5) : this._state === 17 ? this.stateInProcessingInstruction(e) : this._state === 64 ? this.stateInNamedEntity(e) : this._state === 23 ? u5(this, e) : this._state === 62 ? q5(this, e) : this._state === 24 ? f5(this, e) : this._state === 25 ? h5(this, e) : this._state === 30 ? this.stateAfterCdata1(e) : this._state === 31 ? this.stateAfterCdata2(e) : this._state === 26 ? d5(this, e) : this._state === 27 ? p5(this, e) : this._state === 28 ? this.stateBeforeCdata6(e) : this._state === 66 ? this.stateInHexEntity(e) : this._state === 65 ? this.stateInNumericEntity(e) : this._state === 63 ? I5(this, e) : this.cbs.onerror(Error("unknown _state"), this._state), this._index++;
    }
    this.cleanup();
  }, t.prototype.finish = function() {
    this.sectionStart < this._index && this.handleTrailingData(), this.cbs.onend();
  }, t.prototype.handleTrailingData = function() {
    var e = this.buffer.substr(this.sectionStart);
    this._state === 29 || this._state === 30 || this._state === 31 ? this.cbs.oncdata(e) : this._state === 19 || this._state === 21 || this._state === 22 ? this.cbs.oncomment(e) : this._state === 64 && !this.xmlMode ? (this.parseLegacyEntity(), this.sectionStart < this._index && (this._state = this.baseState, this.handleTrailingData())) : this._state === 65 && !this.xmlMode ? (this.decodeNumericEntity(2, 10, !1), this.sectionStart < this._index && (this._state = this.baseState, this.handleTrailingData())) : this._state === 66 && !this.xmlMode ? (this.decodeNumericEntity(3, 16, !1), this.sectionStart < this._index && (this._state = this.baseState, this.handleTrailingData())) : this._state !== 3 && this._state !== 8 && this._state !== 11 && this._state !== 10 && this._state !== 9 && this._state !== 13 && this._state !== 12 && this._state !== 14 && this._state !== 6 && this.cbs.ontext(e);
  }, t.prototype.getSection = function() {
    return this.buffer.substring(this.sectionStart, this._index);
  }, t.prototype.emitToken = function(e) {
    this.cbs[e](this.getSection()), this.sectionStart = -1;
  }, t.prototype.emitPartial = function(e) {
    this.baseState !== 1 ? this.cbs.onattribdata(e) : this.cbs.ontext(e);
  }, t;
}();
Cs.default = U5;
var j5 = D && D.__importDefault || function(t) {
  return t && t.__esModule ? t : { default: t };
};
Object.defineProperty(Sn, "__esModule", { value: !0 });
Sn.Parser = void 0;
var Y5 = j5(Cs), Pt = /* @__PURE__ */ new Set([
  "input",
  "option",
  "optgroup",
  "select",
  "button",
  "datalist",
  "textarea"
]), B = /* @__PURE__ */ new Set(["p"]), Bi = {
  tr: /* @__PURE__ */ new Set(["tr", "th", "td"]),
  th: /* @__PURE__ */ new Set(["th"]),
  td: /* @__PURE__ */ new Set(["thead", "th", "td"]),
  body: /* @__PURE__ */ new Set(["head", "link", "script"]),
  li: /* @__PURE__ */ new Set(["li"]),
  p: B,
  h1: B,
  h2: B,
  h3: B,
  h4: B,
  h5: B,
  h6: B,
  select: Pt,
  input: Pt,
  output: Pt,
  button: Pt,
  datalist: Pt,
  textarea: Pt,
  option: /* @__PURE__ */ new Set(["option"]),
  optgroup: /* @__PURE__ */ new Set(["optgroup", "option"]),
  dd: /* @__PURE__ */ new Set(["dt", "dd"]),
  dt: /* @__PURE__ */ new Set(["dt", "dd"]),
  address: B,
  article: B,
  aside: B,
  blockquote: B,
  details: B,
  div: B,
  dl: B,
  fieldset: B,
  figcaption: B,
  figure: B,
  footer: B,
  form: B,
  header: B,
  hr: B,
  main: B,
  nav: B,
  ol: B,
  pre: B,
  section: B,
  table: B,
  ul: B,
  rt: /* @__PURE__ */ new Set(["rt", "rp"]),
  rp: /* @__PURE__ */ new Set(["rt", "rp"]),
  tbody: /* @__PURE__ */ new Set(["thead", "tbody"]),
  tfoot: /* @__PURE__ */ new Set(["thead", "tbody"])
}, Ks = /* @__PURE__ */ new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]), Hi = /* @__PURE__ */ new Set(["math", "svg"]), Vi = /* @__PURE__ */ new Set([
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "annotation-xml",
  "foreignObject",
  "desc",
  "title"
]), F5 = /\s|\//, z5 = function() {
  function t(e, n) {
    n === void 0 && (n = {});
    var s, r, i, o, a;
    this.startIndex = 0, this.endIndex = null, this.tagname = "", this.attribname = "", this.attribvalue = "", this.attribs = null, this.stack = [], this.foreignContext = [], this.options = n, this.cbs = e != null ? e : {}, this.lowerCaseTagNames = (s = n.lowerCaseTags) !== null && s !== void 0 ? s : !n.xmlMode, this.lowerCaseAttributeNames = (r = n.lowerCaseAttributeNames) !== null && r !== void 0 ? r : !n.xmlMode, this.tokenizer = new ((i = n.Tokenizer) !== null && i !== void 0 ? i : Y5.default)(this.options, this), (a = (o = this.cbs).onparserinit) === null || a === void 0 || a.call(o, this);
  }
  return t.prototype.updatePosition = function(e) {
    this.endIndex === null ? this.tokenizer.sectionStart <= e ? this.startIndex = 0 : this.startIndex = this.tokenizer.sectionStart - e : this.startIndex = this.endIndex + 1, this.endIndex = this.tokenizer.getAbsoluteIndex();
  }, t.prototype.ontext = function(e) {
    var n, s;
    this.updatePosition(1), this.endIndex--, (s = (n = this.cbs).ontext) === null || s === void 0 || s.call(n, e);
  }, t.prototype.onopentagname = function(e) {
    var n, s;
    if (this.lowerCaseTagNames && (e = e.toLowerCase()), this.tagname = e, !this.options.xmlMode && Object.prototype.hasOwnProperty.call(Bi, e))
      for (var r = void 0; this.stack.length > 0 && Bi[e].has(r = this.stack[this.stack.length - 1]); )
        this.onclosetag(r);
    (this.options.xmlMode || !Ks.has(e)) && (this.stack.push(e), Hi.has(e) ? this.foreignContext.push(!0) : Vi.has(e) && this.foreignContext.push(!1)), (s = (n = this.cbs).onopentagname) === null || s === void 0 || s.call(n, e), this.cbs.onopentag && (this.attribs = {});
  }, t.prototype.onopentagend = function() {
    var e, n;
    this.updatePosition(1), this.attribs && ((n = (e = this.cbs).onopentag) === null || n === void 0 || n.call(e, this.tagname, this.attribs), this.attribs = null), !this.options.xmlMode && this.cbs.onclosetag && Ks.has(this.tagname) && this.cbs.onclosetag(this.tagname), this.tagname = "";
  }, t.prototype.onclosetag = function(e) {
    if (this.updatePosition(1), this.lowerCaseTagNames && (e = e.toLowerCase()), (Hi.has(e) || Vi.has(e)) && this.foreignContext.pop(), this.stack.length && (this.options.xmlMode || !Ks.has(e))) {
      var n = this.stack.lastIndexOf(e);
      if (n !== -1)
        if (this.cbs.onclosetag)
          for (n = this.stack.length - n; n--; )
            this.cbs.onclosetag(this.stack.pop());
        else
          this.stack.length = n;
      else
        e === "p" && !this.options.xmlMode && (this.onopentagname(e), this.closeCurrentTag());
    } else
      !this.options.xmlMode && (e === "br" || e === "p") && (this.onopentagname(e), this.closeCurrentTag());
  }, t.prototype.onselfclosingtag = function() {
    this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1] ? this.closeCurrentTag() : this.onopentagend();
  }, t.prototype.closeCurrentTag = function() {
    var e, n, s = this.tagname;
    this.onopentagend(), this.stack[this.stack.length - 1] === s && ((n = (e = this.cbs).onclosetag) === null || n === void 0 || n.call(e, s), this.stack.pop());
  }, t.prototype.onattribname = function(e) {
    this.lowerCaseAttributeNames && (e = e.toLowerCase()), this.attribname = e;
  }, t.prototype.onattribdata = function(e) {
    this.attribvalue += e;
  }, t.prototype.onattribend = function(e) {
    var n, s;
    (s = (n = this.cbs).onattribute) === null || s === void 0 || s.call(n, this.attribname, this.attribvalue, e), this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname) && (this.attribs[this.attribname] = this.attribvalue), this.attribname = "", this.attribvalue = "";
  }, t.prototype.getInstructionName = function(e) {
    var n = e.search(F5), s = n < 0 ? e : e.substr(0, n);
    return this.lowerCaseTagNames && (s = s.toLowerCase()), s;
  }, t.prototype.ondeclaration = function(e) {
    if (this.cbs.onprocessinginstruction) {
      var n = this.getInstructionName(e);
      this.cbs.onprocessinginstruction("!" + n, "!" + e);
    }
  }, t.prototype.onprocessinginstruction = function(e) {
    if (this.cbs.onprocessinginstruction) {
      var n = this.getInstructionName(e);
      this.cbs.onprocessinginstruction("?" + n, "?" + e);
    }
  }, t.prototype.oncomment = function(e) {
    var n, s, r, i;
    this.updatePosition(4), (s = (n = this.cbs).oncomment) === null || s === void 0 || s.call(n, e), (i = (r = this.cbs).oncommentend) === null || i === void 0 || i.call(r);
  }, t.prototype.oncdata = function(e) {
    var n, s, r, i, o, a;
    this.updatePosition(1), this.options.xmlMode || this.options.recognizeCDATA ? ((s = (n = this.cbs).oncdatastart) === null || s === void 0 || s.call(n), (i = (r = this.cbs).ontext) === null || i === void 0 || i.call(r, e), (a = (o = this.cbs).oncdataend) === null || a === void 0 || a.call(o)) : this.oncomment("[CDATA[" + e + "]]");
  }, t.prototype.onerror = function(e) {
    var n, s;
    (s = (n = this.cbs).onerror) === null || s === void 0 || s.call(n, e);
  }, t.prototype.onend = function() {
    var e, n;
    if (this.cbs.onclosetag)
      for (var s = this.stack.length; s > 0; this.cbs.onclosetag(this.stack[--s]))
        ;
    (n = (e = this.cbs).onend) === null || n === void 0 || n.call(e);
  }, t.prototype.reset = function() {
    var e, n, s, r;
    (n = (e = this.cbs).onreset) === null || n === void 0 || n.call(e), this.tokenizer.reset(), this.tagname = "", this.attribname = "", this.attribs = null, this.stack = [], (r = (s = this.cbs).onparserinit) === null || r === void 0 || r.call(s, this);
  }, t.prototype.parseComplete = function(e) {
    this.reset(), this.end(e);
  }, t.prototype.write = function(e) {
    this.tokenizer.write(e);
  }, t.prototype.end = function(e) {
    this.tokenizer.end(e);
  }, t.prototype.pause = function() {
    this.tokenizer.pause();
  }, t.prototype.resume = function() {
    this.tokenizer.resume();
  }, t.prototype.parseChunk = function(e) {
    this.write(e);
  }, t.prototype.done = function(e) {
    this.end(e);
  }, t;
}();
Sn.Parser = z5;
var ut = {}, Zt = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.Doctype = t.CDATA = t.Tag = t.Style = t.Script = t.Comment = t.Directive = t.Text = t.Root = t.isTag = t.ElementType = void 0;
  var e;
  (function(s) {
    s.Root = "root", s.Text = "text", s.Directive = "directive", s.Comment = "comment", s.Script = "script", s.Style = "style", s.Tag = "tag", s.CDATA = "cdata", s.Doctype = "doctype";
  })(e = t.ElementType || (t.ElementType = {}));
  function n(s) {
    return s.type === e.Tag || s.type === e.Script || s.type === e.Style;
  }
  t.isTag = n, t.Root = e.Root, t.Text = e.Text, t.Directive = e.Directive, t.Comment = e.Comment, t.Script = e.Script, t.Style = e.Style, t.Tag = e.Tag, t.CDATA = e.CDATA, t.Doctype = e.Doctype;
})(Zt);
var $ = {}, Ot = D && D.__extends || function() {
  var t = function(e, n) {
    return t = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(s, r) {
      s.__proto__ = r;
    } || function(s, r) {
      for (var i in r)
        Object.prototype.hasOwnProperty.call(r, i) && (s[i] = r[i]);
    }, t(e, n);
  };
  return function(e, n) {
    if (typeof n != "function" && n !== null)
      throw new TypeError("Class extends value " + String(n) + " is not a constructor or null");
    t(e, n);
    function s() {
      this.constructor = e;
    }
    e.prototype = n === null ? Object.create(n) : (s.prototype = n.prototype, new s());
  };
}(), sn = D && D.__assign || function() {
  return sn = Object.assign || function(t) {
    for (var e, n = 1, s = arguments.length; n < s; n++) {
      e = arguments[n];
      for (var r in e)
        Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    }
    return t;
  }, sn.apply(this, arguments);
};
Object.defineProperty($, "__esModule", { value: !0 });
$.cloneNode = $.hasChildren = $.isDocument = $.isDirective = $.isComment = $.isText = $.isCDATA = $.isTag = $.Element = $.Document = $.NodeWithChildren = $.ProcessingInstruction = $.Comment = $.Text = $.DataNode = $.Node = void 0;
var ee = Zt, B5 = /* @__PURE__ */ new Map([
  [ee.ElementType.Tag, 1],
  [ee.ElementType.Script, 1],
  [ee.ElementType.Style, 1],
  [ee.ElementType.Directive, 1],
  [ee.ElementType.Text, 3],
  [ee.ElementType.CDATA, 4],
  [ee.ElementType.Comment, 8],
  [ee.ElementType.Root, 9]
]), oi = function() {
  function t(e) {
    this.type = e, this.parent = null, this.prev = null, this.next = null, this.startIndex = null, this.endIndex = null;
  }
  return Object.defineProperty(t.prototype, "nodeType", {
    get: function() {
      var e;
      return (e = B5.get(this.type)) !== null && e !== void 0 ? e : 1;
    },
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(t.prototype, "parentNode", {
    get: function() {
      return this.parent;
    },
    set: function(e) {
      this.parent = e;
    },
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(t.prototype, "previousSibling", {
    get: function() {
      return this.prev;
    },
    set: function(e) {
      this.prev = e;
    },
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(t.prototype, "nextSibling", {
    get: function() {
      return this.next;
    },
    set: function(e) {
      this.next = e;
    },
    enumerable: !1,
    configurable: !0
  }), t.prototype.cloneNode = function(e) {
    return e === void 0 && (e = !1), ai(this, e);
  }, t;
}();
$.Node = oi;
var Rs = function(t) {
  Ot(e, t);
  function e(n, s) {
    var r = t.call(this, n) || this;
    return r.data = s, r;
  }
  return Object.defineProperty(e.prototype, "nodeValue", {
    get: function() {
      return this.data;
    },
    set: function(n) {
      this.data = n;
    },
    enumerable: !1,
    configurable: !0
  }), e;
}(oi);
$.DataNode = Rs;
var Ea = function(t) {
  Ot(e, t);
  function e(n) {
    return t.call(this, ee.ElementType.Text, n) || this;
  }
  return e;
}(Rs);
$.Text = Ea;
var Aa = function(t) {
  Ot(e, t);
  function e(n) {
    return t.call(this, ee.ElementType.Comment, n) || this;
  }
  return e;
}(Rs);
$.Comment = Aa;
var Ca = function(t) {
  Ot(e, t);
  function e(n, s) {
    var r = t.call(this, ee.ElementType.Directive, s) || this;
    return r.name = n, r;
  }
  return e;
}(Rs);
$.ProcessingInstruction = Ca;
var $s = function(t) {
  Ot(e, t);
  function e(n, s) {
    var r = t.call(this, n) || this;
    return r.children = s, r;
  }
  return Object.defineProperty(e.prototype, "firstChild", {
    get: function() {
      var n;
      return (n = this.children[0]) !== null && n !== void 0 ? n : null;
    },
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e.prototype, "lastChild", {
    get: function() {
      return this.children.length > 0 ? this.children[this.children.length - 1] : null;
    },
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e.prototype, "childNodes", {
    get: function() {
      return this.children;
    },
    set: function(n) {
      this.children = n;
    },
    enumerable: !1,
    configurable: !0
  }), e;
}(oi);
$.NodeWithChildren = $s;
var Ma = function(t) {
  Ot(e, t);
  function e(n) {
    return t.call(this, ee.ElementType.Root, n) || this;
  }
  return e;
}($s);
$.Document = Ma;
var Pa = function(t) {
  Ot(e, t);
  function e(n, s, r, i) {
    r === void 0 && (r = []), i === void 0 && (i = n === "script" ? ee.ElementType.Script : n === "style" ? ee.ElementType.Style : ee.ElementType.Tag);
    var o = t.call(this, i, r) || this;
    return o.name = n, o.attribs = s, o;
  }
  return Object.defineProperty(e.prototype, "tagName", {
    get: function() {
      return this.name;
    },
    set: function(n) {
      this.name = n;
    },
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e.prototype, "attributes", {
    get: function() {
      var n = this;
      return Object.keys(this.attribs).map(function(s) {
        var r, i;
        return {
          name: s,
          value: n.attribs[s],
          namespace: (r = n["x-attribsNamespace"]) === null || r === void 0 ? void 0 : r[s],
          prefix: (i = n["x-attribsPrefix"]) === null || i === void 0 ? void 0 : i[s]
        };
      });
    },
    enumerable: !1,
    configurable: !0
  }), e;
}($s);
$.Element = Pa;
function Ra(t) {
  return (0, ee.isTag)(t);
}
$.isTag = Ra;
function $a(t) {
  return t.type === ee.ElementType.CDATA;
}
$.isCDATA = $a;
function La(t) {
  return t.type === ee.ElementType.Text;
}
$.isText = La;
function Na(t) {
  return t.type === ee.ElementType.Comment;
}
$.isComment = Na;
function qa(t) {
  return t.type === ee.ElementType.Directive;
}
$.isDirective = qa;
function Ia(t) {
  return t.type === ee.ElementType.Root;
}
$.isDocument = Ia;
function H5(t) {
  return Object.prototype.hasOwnProperty.call(t, "children");
}
$.hasChildren = H5;
function ai(t, e) {
  e === void 0 && (e = !1);
  var n;
  if (La(t))
    n = new Ea(t.data);
  else if (Na(t))
    n = new Aa(t.data);
  else if (Ra(t)) {
    var s = e ? er(t.children) : [], r = new Pa(t.name, sn({}, t.attribs), s);
    s.forEach(function(l) {
      return l.parent = r;
    }), t.namespace != null && (r.namespace = t.namespace), t["x-attribsNamespace"] && (r["x-attribsNamespace"] = sn({}, t["x-attribsNamespace"])), t["x-attribsPrefix"] && (r["x-attribsPrefix"] = sn({}, t["x-attribsPrefix"])), n = r;
  } else if ($a(t)) {
    var s = e ? er(t.children) : [], i = new $s(ee.ElementType.CDATA, s);
    s.forEach(function(c) {
      return c.parent = i;
    }), n = i;
  } else if (Ia(t)) {
    var s = e ? er(t.children) : [], o = new Ma(s);
    s.forEach(function(c) {
      return c.parent = o;
    }), t["x-mode"] && (o["x-mode"] = t["x-mode"]), n = o;
  } else if (qa(t)) {
    var a = new Ca(t.name, t.data);
    t["x-name"] != null && (a["x-name"] = t["x-name"], a["x-publicId"] = t["x-publicId"], a["x-systemId"] = t["x-systemId"]), n = a;
  } else
    throw new Error("Not implemented yet: ".concat(t.type));
  return n.startIndex = t.startIndex, n.endIndex = t.endIndex, t.sourceCodeLocation != null && (n.sourceCodeLocation = t.sourceCodeLocation), n;
}
$.cloneNode = ai;
function er(t) {
  for (var e = t.map(function(s) {
    return ai(s, !0);
  }), n = 1; n < e.length; n++)
    e[n].prev = e[n - 1], e[n - 1].next = e[n];
  return e;
}
(function(t) {
  var e = D && D.__createBinding || (Object.create ? function(l, c, u, f) {
    f === void 0 && (f = u);
    var d = Object.getOwnPropertyDescriptor(c, u);
    (!d || ("get" in d ? !c.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return c[u];
    } }), Object.defineProperty(l, f, d);
  } : function(l, c, u, f) {
    f === void 0 && (f = u), l[f] = c[u];
  }), n = D && D.__exportStar || function(l, c) {
    for (var u in l)
      u !== "default" && !Object.prototype.hasOwnProperty.call(c, u) && e(c, l, u);
  };
  Object.defineProperty(t, "__esModule", { value: !0 }), t.DomHandler = void 0;
  var s = Zt, r = $;
  n($, t);
  var i = /\s+/g, o = {
    normalizeWhitespace: !1,
    withStartIndices: !1,
    withEndIndices: !1,
    xmlMode: !1
  }, a = function() {
    function l(c, u, f) {
      this.dom = [], this.root = new r.Document(this.dom), this.done = !1, this.tagStack = [this.root], this.lastNode = null, this.parser = null, typeof u == "function" && (f = u, u = o), typeof c == "object" && (u = c, c = void 0), this.callback = c != null ? c : null, this.options = u != null ? u : o, this.elementCB = f != null ? f : null;
    }
    return l.prototype.onparserinit = function(c) {
      this.parser = c;
    }, l.prototype.onreset = function() {
      this.dom = [], this.root = new r.Document(this.dom), this.done = !1, this.tagStack = [this.root], this.lastNode = null, this.parser = null;
    }, l.prototype.onend = function() {
      this.done || (this.done = !0, this.parser = null, this.handleCallback(null));
    }, l.prototype.onerror = function(c) {
      this.handleCallback(c);
    }, l.prototype.onclosetag = function() {
      this.lastNode = null;
      var c = this.tagStack.pop();
      this.options.withEndIndices && (c.endIndex = this.parser.endIndex), this.elementCB && this.elementCB(c);
    }, l.prototype.onopentag = function(c, u) {
      var f = this.options.xmlMode ? s.ElementType.Tag : void 0, d = new r.Element(c, u, void 0, f);
      this.addNode(d), this.tagStack.push(d);
    }, l.prototype.ontext = function(c) {
      var u = this.options.normalizeWhitespace, f = this.lastNode;
      if (f && f.type === s.ElementType.Text)
        u ? f.data = (f.data + c).replace(i, " ") : f.data += c, this.options.withEndIndices && (f.endIndex = this.parser.endIndex);
      else {
        u && (c = c.replace(i, " "));
        var d = new r.Text(c);
        this.addNode(d), this.lastNode = d;
      }
    }, l.prototype.oncomment = function(c) {
      if (this.lastNode && this.lastNode.type === s.ElementType.Comment) {
        this.lastNode.data += c;
        return;
      }
      var u = new r.Comment(c);
      this.addNode(u), this.lastNode = u;
    }, l.prototype.oncommentend = function() {
      this.lastNode = null;
    }, l.prototype.oncdatastart = function() {
      var c = new r.Text(""), u = new r.NodeWithChildren(s.ElementType.CDATA, [c]);
      this.addNode(u), c.parent = u, this.lastNode = c;
    }, l.prototype.oncdataend = function() {
      this.lastNode = null;
    }, l.prototype.onprocessinginstruction = function(c, u) {
      var f = new r.ProcessingInstruction(c, u);
      this.addNode(f);
    }, l.prototype.handleCallback = function(c) {
      if (typeof this.callback == "function")
        this.callback(c, this.dom);
      else if (c)
        throw c;
    }, l.prototype.addNode = function(c) {
      var u = this.tagStack[this.tagStack.length - 1], f = u.children[u.children.length - 1];
      this.options.withStartIndices && (c.startIndex = this.parser.startIndex), this.options.withEndIndices && (c.endIndex = this.parser.endIndex), u.children.push(c), f && (c.prev = f, f.next = c), c.parent = u, this.lastNode = null;
    }, l;
  }();
  t.DomHandler = a, t.default = a;
})(ut);
var Tt = {}, li = {}, De = {}, ci = {}, Ua = {}, rt = {}, Ls = D && D.__importDefault || function(t) {
  return t && t.__esModule ? t : { default: t };
};
Object.defineProperty(rt, "__esModule", { value: !0 });
rt.decodeHTML = rt.decodeHTMLStrict = rt.decodeXML = void 0;
var gr = Ls(ri), V5 = Ls(Oa), W5 = Ls(ii), Wi = Ls(Ms), G5 = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
rt.decodeXML = ja(W5.default);
rt.decodeHTMLStrict = ja(gr.default);
function ja(t) {
  var e = Ya(t);
  return function(n) {
    return String(n).replace(G5, e);
  };
}
var Gi = function(t, e) {
  return t < e ? 1 : -1;
};
rt.decodeHTML = function() {
  for (var t = Object.keys(V5.default).sort(Gi), e = Object.keys(gr.default).sort(Gi), n = 0, s = 0; n < e.length; n++)
    t[s] === e[n] ? (e[n] += ";?", s++) : e[n] += ";";
  var r = new RegExp("&(?:" + e.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g"), i = Ya(gr.default);
  function o(a) {
    return a.substr(-1) !== ";" && (a += ";"), i(a);
  }
  return function(a) {
    return String(a).replace(r, o);
  };
}();
function Ya(t) {
  return function(n) {
    if (n.charAt(1) === "#") {
      var s = n.charAt(2);
      return s === "X" || s === "x" ? Wi.default(parseInt(n.substr(3), 16)) : Wi.default(parseInt(n.substr(2), 10));
    }
    return t[n.slice(1, -1)] || n;
  };
}
var Oe = {}, Fa = D && D.__importDefault || function(t) {
  return t && t.__esModule ? t : { default: t };
};
Object.defineProperty(Oe, "__esModule", { value: !0 });
Oe.escapeUTF8 = Oe.escape = Oe.encodeNonAsciiHTML = Oe.encodeHTML = Oe.encodeXML = void 0;
var Z5 = Fa(ii), za = Ha(Z5.default), Ba = Va(za);
Oe.encodeXML = Za(za);
var Q5 = Fa(ri), ui = Ha(Q5.default), J5 = Va(ui);
Oe.encodeHTML = K5(ui, J5);
Oe.encodeNonAsciiHTML = Za(ui);
function Ha(t) {
  return Object.keys(t).sort().reduce(function(e, n) {
    return e[t[n]] = "&" + n + ";", e;
  }, {});
}
function Va(t) {
  for (var e = [], n = [], s = 0, r = Object.keys(t); s < r.length; s++) {
    var i = r[s];
    i.length === 1 ? e.push("\\" + i) : n.push(i);
  }
  e.sort();
  for (var o = 0; o < e.length - 1; o++) {
    for (var a = o; a < e.length - 1 && e[a].charCodeAt(1) + 1 === e[a + 1].charCodeAt(1); )
      a += 1;
    var l = 1 + a - o;
    l < 3 || e.splice(o, l, e[o] + "-" + e[a]);
  }
  return n.unshift("[" + e.join("") + "]"), new RegExp(n.join("|"), "g");
}
var Wa = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, X5 = String.prototype.codePointAt != null ? function(t) {
  return t.codePointAt(0);
} : function(t) {
  return (t.charCodeAt(0) - 55296) * 1024 + t.charCodeAt(1) - 56320 + 65536;
};
function Ns(t) {
  return "&#x" + (t.length > 1 ? X5(t) : t.charCodeAt(0)).toString(16).toUpperCase() + ";";
}
function K5(t, e) {
  return function(n) {
    return n.replace(e, function(s) {
      return t[s];
    }).replace(Wa, Ns);
  };
}
var Ga = new RegExp(Ba.source + "|" + Wa.source, "g");
function e8(t) {
  return t.replace(Ga, Ns);
}
Oe.escape = e8;
function t8(t) {
  return t.replace(Ba, Ns);
}
Oe.escapeUTF8 = t8;
function Za(t) {
  return function(e) {
    return e.replace(Ga, function(n) {
      return t[n] || Ns(n);
    });
  };
}
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.decodeXMLStrict = t.decodeHTML5Strict = t.decodeHTML4Strict = t.decodeHTML5 = t.decodeHTML4 = t.decodeHTMLStrict = t.decodeHTML = t.decodeXML = t.encodeHTML5 = t.encodeHTML4 = t.escapeUTF8 = t.escape = t.encodeNonAsciiHTML = t.encodeHTML = t.encodeXML = t.encode = t.decodeStrict = t.decode = void 0;
  var e = rt, n = Oe;
  function s(l, c) {
    return (!c || c <= 0 ? e.decodeXML : e.decodeHTML)(l);
  }
  t.decode = s;
  function r(l, c) {
    return (!c || c <= 0 ? e.decodeXML : e.decodeHTMLStrict)(l);
  }
  t.decodeStrict = r;
  function i(l, c) {
    return (!c || c <= 0 ? n.encodeXML : n.encodeHTML)(l);
  }
  t.encode = i;
  var o = Oe;
  Object.defineProperty(t, "encodeXML", { enumerable: !0, get: function() {
    return o.encodeXML;
  } }), Object.defineProperty(t, "encodeHTML", { enumerable: !0, get: function() {
    return o.encodeHTML;
  } }), Object.defineProperty(t, "encodeNonAsciiHTML", { enumerable: !0, get: function() {
    return o.encodeNonAsciiHTML;
  } }), Object.defineProperty(t, "escape", { enumerable: !0, get: function() {
    return o.escape;
  } }), Object.defineProperty(t, "escapeUTF8", { enumerable: !0, get: function() {
    return o.escapeUTF8;
  } }), Object.defineProperty(t, "encodeHTML4", { enumerable: !0, get: function() {
    return o.encodeHTML;
  } }), Object.defineProperty(t, "encodeHTML5", { enumerable: !0, get: function() {
    return o.encodeHTML;
  } });
  var a = rt;
  Object.defineProperty(t, "decodeXML", { enumerable: !0, get: function() {
    return a.decodeXML;
  } }), Object.defineProperty(t, "decodeHTML", { enumerable: !0, get: function() {
    return a.decodeHTML;
  } }), Object.defineProperty(t, "decodeHTMLStrict", { enumerable: !0, get: function() {
    return a.decodeHTMLStrict;
  } }), Object.defineProperty(t, "decodeHTML4", { enumerable: !0, get: function() {
    return a.decodeHTML;
  } }), Object.defineProperty(t, "decodeHTML5", { enumerable: !0, get: function() {
    return a.decodeHTML;
  } }), Object.defineProperty(t, "decodeHTML4Strict", { enumerable: !0, get: function() {
    return a.decodeHTMLStrict;
  } }), Object.defineProperty(t, "decodeHTML5Strict", { enumerable: !0, get: function() {
    return a.decodeHTMLStrict;
  } }), Object.defineProperty(t, "decodeXMLStrict", { enumerable: !0, get: function() {
    return a.decodeXML;
  } });
})(Ua);
var jt = {};
Object.defineProperty(jt, "__esModule", { value: !0 });
jt.attributeNames = jt.elementNames = void 0;
jt.elementNames = /* @__PURE__ */ new Map([
  ["altglyph", "altGlyph"],
  ["altglyphdef", "altGlyphDef"],
  ["altglyphitem", "altGlyphItem"],
  ["animatecolor", "animateColor"],
  ["animatemotion", "animateMotion"],
  ["animatetransform", "animateTransform"],
  ["clippath", "clipPath"],
  ["feblend", "feBlend"],
  ["fecolormatrix", "feColorMatrix"],
  ["fecomponenttransfer", "feComponentTransfer"],
  ["fecomposite", "feComposite"],
  ["feconvolvematrix", "feConvolveMatrix"],
  ["fediffuselighting", "feDiffuseLighting"],
  ["fedisplacementmap", "feDisplacementMap"],
  ["fedistantlight", "feDistantLight"],
  ["fedropshadow", "feDropShadow"],
  ["feflood", "feFlood"],
  ["fefunca", "feFuncA"],
  ["fefuncb", "feFuncB"],
  ["fefuncg", "feFuncG"],
  ["fefuncr", "feFuncR"],
  ["fegaussianblur", "feGaussianBlur"],
  ["feimage", "feImage"],
  ["femerge", "feMerge"],
  ["femergenode", "feMergeNode"],
  ["femorphology", "feMorphology"],
  ["feoffset", "feOffset"],
  ["fepointlight", "fePointLight"],
  ["fespecularlighting", "feSpecularLighting"],
  ["fespotlight", "feSpotLight"],
  ["fetile", "feTile"],
  ["feturbulence", "feTurbulence"],
  ["foreignobject", "foreignObject"],
  ["glyphref", "glyphRef"],
  ["lineargradient", "linearGradient"],
  ["radialgradient", "radialGradient"],
  ["textpath", "textPath"]
]);
jt.attributeNames = /* @__PURE__ */ new Map([
  ["definitionurl", "definitionURL"],
  ["attributename", "attributeName"],
  ["attributetype", "attributeType"],
  ["basefrequency", "baseFrequency"],
  ["baseprofile", "baseProfile"],
  ["calcmode", "calcMode"],
  ["clippathunits", "clipPathUnits"],
  ["diffuseconstant", "diffuseConstant"],
  ["edgemode", "edgeMode"],
  ["filterunits", "filterUnits"],
  ["glyphref", "glyphRef"],
  ["gradienttransform", "gradientTransform"],
  ["gradientunits", "gradientUnits"],
  ["kernelmatrix", "kernelMatrix"],
  ["kernelunitlength", "kernelUnitLength"],
  ["keypoints", "keyPoints"],
  ["keysplines", "keySplines"],
  ["keytimes", "keyTimes"],
  ["lengthadjust", "lengthAdjust"],
  ["limitingconeangle", "limitingConeAngle"],
  ["markerheight", "markerHeight"],
  ["markerunits", "markerUnits"],
  ["markerwidth", "markerWidth"],
  ["maskcontentunits", "maskContentUnits"],
  ["maskunits", "maskUnits"],
  ["numoctaves", "numOctaves"],
  ["pathlength", "pathLength"],
  ["patterncontentunits", "patternContentUnits"],
  ["patterntransform", "patternTransform"],
  ["patternunits", "patternUnits"],
  ["pointsatx", "pointsAtX"],
  ["pointsaty", "pointsAtY"],
  ["pointsatz", "pointsAtZ"],
  ["preservealpha", "preserveAlpha"],
  ["preserveaspectratio", "preserveAspectRatio"],
  ["primitiveunits", "primitiveUnits"],
  ["refx", "refX"],
  ["refy", "refY"],
  ["repeatcount", "repeatCount"],
  ["repeatdur", "repeatDur"],
  ["requiredextensions", "requiredExtensions"],
  ["requiredfeatures", "requiredFeatures"],
  ["specularconstant", "specularConstant"],
  ["specularexponent", "specularExponent"],
  ["spreadmethod", "spreadMethod"],
  ["startoffset", "startOffset"],
  ["stddeviation", "stdDeviation"],
  ["stitchtiles", "stitchTiles"],
  ["surfacescale", "surfaceScale"],
  ["systemlanguage", "systemLanguage"],
  ["tablevalues", "tableValues"],
  ["targetx", "targetX"],
  ["targety", "targetY"],
  ["textlength", "textLength"],
  ["viewbox", "viewBox"],
  ["viewtarget", "viewTarget"],
  ["xchannelselector", "xChannelSelector"],
  ["ychannelselector", "yChannelSelector"],
  ["zoomandpan", "zoomAndPan"]
]);
var Lt = D && D.__assign || function() {
  return Lt = Object.assign || function(t) {
    for (var e, n = 1, s = arguments.length; n < s; n++) {
      e = arguments[n];
      for (var r in e)
        Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    }
    return t;
  }, Lt.apply(this, arguments);
}, n8 = D && D.__createBinding || (Object.create ? function(t, e, n, s) {
  s === void 0 && (s = n), Object.defineProperty(t, s, { enumerable: !0, get: function() {
    return e[n];
  } });
} : function(t, e, n, s) {
  s === void 0 && (s = n), t[s] = e[n];
}), s8 = D && D.__setModuleDefault || (Object.create ? function(t, e) {
  Object.defineProperty(t, "default", { enumerable: !0, value: e });
} : function(t, e) {
  t.default = e;
}), r8 = D && D.__importStar || function(t) {
  if (t && t.__esModule)
    return t;
  var e = {};
  if (t != null)
    for (var n in t)
      n !== "default" && Object.prototype.hasOwnProperty.call(t, n) && n8(e, t, n);
  return s8(e, t), e;
};
Object.defineProperty(ci, "__esModule", { value: !0 });
var Xe = r8(Zt), Qa = Ua, Ja = jt, i8 = /* @__PURE__ */ new Set([
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript"
]);
function o8(t, e) {
  if (!!t)
    return Object.keys(t).map(function(n) {
      var s, r, i = (s = t[n]) !== null && s !== void 0 ? s : "";
      return e.xmlMode === "foreign" && (n = (r = Ja.attributeNames.get(n)) !== null && r !== void 0 ? r : n), !e.emptyAttrs && !e.xmlMode && i === "" ? n : n + '="' + (e.decodeEntities !== !1 ? Qa.encodeXML(i) : i.replace(/"/g, "&quot;")) + '"';
    }).join(" ");
}
var Zi = /* @__PURE__ */ new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function fi(t, e) {
  e === void 0 && (e = {});
  for (var n = ("length" in t) ? t : [t], s = "", r = 0; r < n.length; r++)
    s += a8(n[r], e);
  return s;
}
ci.default = fi;
function a8(t, e) {
  switch (t.type) {
    case Xe.Root:
      return fi(t.children, e);
    case Xe.Directive:
    case Xe.Doctype:
      return f8(t);
    case Xe.Comment:
      return p8(t);
    case Xe.CDATA:
      return d8(t);
    case Xe.Script:
    case Xe.Style:
    case Xe.Tag:
      return u8(t, e);
    case Xe.Text:
      return h8(t, e);
  }
}
var l8 = /* @__PURE__ */ new Set([
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "annotation-xml",
  "foreignObject",
  "desc",
  "title"
]), c8 = /* @__PURE__ */ new Set(["svg", "math"]);
function u8(t, e) {
  var n;
  e.xmlMode === "foreign" && (t.name = (n = Ja.elementNames.get(t.name)) !== null && n !== void 0 ? n : t.name, t.parent && l8.has(t.parent.name) && (e = Lt(Lt({}, e), { xmlMode: !1 }))), !e.xmlMode && c8.has(t.name) && (e = Lt(Lt({}, e), { xmlMode: "foreign" }));
  var s = "<" + t.name, r = o8(t.attribs, e);
  return r && (s += " " + r), t.children.length === 0 && (e.xmlMode ? e.selfClosingTags !== !1 : e.selfClosingTags && Zi.has(t.name)) ? (e.xmlMode || (s += " "), s += "/>") : (s += ">", t.children.length > 0 && (s += fi(t.children, e)), (e.xmlMode || !Zi.has(t.name)) && (s += "</" + t.name + ">")), s;
}
function f8(t) {
  return "<" + t.data + ">";
}
function h8(t, e) {
  var n = t.data || "";
  return e.decodeEntities !== !1 && !(!e.xmlMode && t.parent && i8.has(t.parent.name)) && (n = Qa.encodeXML(n)), n;
}
function d8(t) {
  return "<![CDATA[" + t.children[0].data + "]]>";
}
function p8(t) {
  return "<!--" + t.data + "-->";
}
var m8 = D && D.__importDefault || function(t) {
  return t && t.__esModule ? t : { default: t };
};
Object.defineProperty(De, "__esModule", { value: !0 });
De.innerText = De.textContent = De.getText = De.getInnerHTML = De.getOuterHTML = void 0;
var Ve = ut, g8 = m8(ci), y8 = Zt;
function Xa(t, e) {
  return (0, g8.default)(t, e);
}
De.getOuterHTML = Xa;
function b8(t, e) {
  return (0, Ve.hasChildren)(t) ? t.children.map(function(n) {
    return Xa(n, e);
  }).join("") : "";
}
De.getInnerHTML = b8;
function Qn(t) {
  return Array.isArray(t) ? t.map(Qn).join("") : (0, Ve.isTag)(t) ? t.name === "br" ? `
` : Qn(t.children) : (0, Ve.isCDATA)(t) ? Qn(t.children) : (0, Ve.isText)(t) ? t.data : "";
}
De.getText = Qn;
function yr(t) {
  return Array.isArray(t) ? t.map(yr).join("") : (0, Ve.hasChildren)(t) && !(0, Ve.isComment)(t) ? yr(t.children) : (0, Ve.isText)(t) ? t.data : "";
}
De.textContent = yr;
function br(t) {
  return Array.isArray(t) ? t.map(br).join("") : (0, Ve.hasChildren)(t) && (t.type === y8.ElementType.Tag || (0, Ve.isCDATA)(t)) ? br(t.children) : (0, Ve.isText)(t) ? t.data : "";
}
De.innerText = br;
var le = {};
Object.defineProperty(le, "__esModule", { value: !0 });
le.prevElementSibling = le.nextElementSibling = le.getName = le.hasAttrib = le.getAttributeValue = le.getSiblings = le.getParent = le.getChildren = void 0;
var Ka = ut, w8 = [];
function el(t) {
  var e;
  return (e = t.children) !== null && e !== void 0 ? e : w8;
}
le.getChildren = el;
function tl(t) {
  return t.parent || null;
}
le.getParent = tl;
function v8(t) {
  var e, n, s = tl(t);
  if (s != null)
    return el(s);
  for (var r = [t], i = t.prev, o = t.next; i != null; )
    r.unshift(i), e = i, i = e.prev;
  for (; o != null; )
    r.push(o), n = o, o = n.next;
  return r;
}
le.getSiblings = v8;
function _8(t, e) {
  var n;
  return (n = t.attribs) === null || n === void 0 ? void 0 : n[e];
}
le.getAttributeValue = _8;
function x8(t, e) {
  return t.attribs != null && Object.prototype.hasOwnProperty.call(t.attribs, e) && t.attribs[e] != null;
}
le.hasAttrib = x8;
function S8(t) {
  return t.name;
}
le.getName = S8;
function k8(t) {
  for (var e, n = t.next; n !== null && !(0, Ka.isTag)(n); )
    e = n, n = e.next;
  return n;
}
le.nextElementSibling = k8;
function T8(t) {
  for (var e, n = t.prev; n !== null && !(0, Ka.isTag)(n); )
    e = n, n = e.prev;
  return n;
}
le.prevElementSibling = T8;
var ve = {};
Object.defineProperty(ve, "__esModule", { value: !0 });
ve.prepend = ve.prependChild = ve.append = ve.appendChild = ve.replaceElement = ve.removeElement = void 0;
function kn(t) {
  if (t.prev && (t.prev.next = t.next), t.next && (t.next.prev = t.prev), t.parent) {
    var e = t.parent.children;
    e.splice(e.lastIndexOf(t), 1);
  }
}
ve.removeElement = kn;
function D8(t, e) {
  var n = e.prev = t.prev;
  n && (n.next = e);
  var s = e.next = t.next;
  s && (s.prev = e);
  var r = e.parent = t.parent;
  if (r) {
    var i = r.children;
    i[i.lastIndexOf(t)] = e;
  }
}
ve.replaceElement = D8;
function O8(t, e) {
  if (kn(e), e.next = null, e.parent = t, t.children.push(e) > 1) {
    var n = t.children[t.children.length - 2];
    n.next = e, e.prev = n;
  } else
    e.prev = null;
}
ve.appendChild = O8;
function E8(t, e) {
  kn(e);
  var n = t.parent, s = t.next;
  if (e.next = s, e.prev = t, t.next = e, e.parent = n, s) {
    if (s.prev = e, n) {
      var r = n.children;
      r.splice(r.lastIndexOf(s), 0, e);
    }
  } else
    n && n.children.push(e);
}
ve.append = E8;
function A8(t, e) {
  if (kn(e), e.parent = t, e.prev = null, t.children.unshift(e) !== 1) {
    var n = t.children[1];
    n.prev = e, e.next = n;
  } else
    e.next = null;
}
ve.prependChild = A8;
function C8(t, e) {
  kn(e);
  var n = t.parent;
  if (n) {
    var s = n.children;
    s.splice(s.indexOf(t), 0, e);
  }
  t.prev && (t.prev.next = e), e.parent = n, e.prev = t.prev, e.next = t, t.prev = e;
}
ve.prepend = C8;
var me = {};
Object.defineProperty(me, "__esModule", { value: !0 });
me.findAll = me.existsOne = me.findOne = me.findOneChild = me.find = me.filter = void 0;
var ln = ut;
function M8(t, e, n, s) {
  return n === void 0 && (n = !0), s === void 0 && (s = 1 / 0), Array.isArray(e) || (e = [e]), hi(t, e, n, s);
}
me.filter = M8;
function hi(t, e, n, s) {
  for (var r = [], i = 0, o = e; i < o.length; i++) {
    var a = o[i];
    if (t(a) && (r.push(a), --s <= 0))
      break;
    if (n && (0, ln.hasChildren)(a) && a.children.length > 0) {
      var l = hi(t, a.children, n, s);
      if (r.push.apply(r, l), s -= l.length, s <= 0)
        break;
    }
  }
  return r;
}
me.find = hi;
function P8(t, e) {
  return e.find(t);
}
me.findOneChild = P8;
function nl(t, e, n) {
  n === void 0 && (n = !0);
  for (var s = null, r = 0; r < e.length && !s; r++) {
    var i = e[r];
    if ((0, ln.isTag)(i))
      t(i) ? s = i : n && i.children.length > 0 && (s = nl(t, i.children));
    else
      continue;
  }
  return s;
}
me.findOne = nl;
function sl(t, e) {
  return e.some(function(n) {
    return (0, ln.isTag)(n) && (t(n) || n.children.length > 0 && sl(t, n.children));
  });
}
me.existsOne = sl;
function R8(t, e) {
  for (var n, s = [], r = e.filter(ln.isTag), i; i = r.shift(); ) {
    var o = (n = i.children) === null || n === void 0 ? void 0 : n.filter(ln.isTag);
    o && o.length > 0 && r.unshift.apply(r, o), t(i) && s.push(i);
  }
  return s;
}
me.findAll = R8;
var Ee = {};
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.getElementsByTagType = Ee.getElementsByTagName = Ee.getElementById = Ee.getElements = Ee.testElement = void 0;
var _t = ut, qs = me, as = {
  tag_name: function(t) {
    return typeof t == "function" ? function(e) {
      return (0, _t.isTag)(e) && t(e.name);
    } : t === "*" ? _t.isTag : function(e) {
      return (0, _t.isTag)(e) && e.name === t;
    };
  },
  tag_type: function(t) {
    return typeof t == "function" ? function(e) {
      return t(e.type);
    } : function(e) {
      return e.type === t;
    };
  },
  tag_contains: function(t) {
    return typeof t == "function" ? function(e) {
      return (0, _t.isText)(e) && t(e.data);
    } : function(e) {
      return (0, _t.isText)(e) && e.data === t;
    };
  }
};
function rl(t, e) {
  return typeof e == "function" ? function(n) {
    return (0, _t.isTag)(n) && e(n.attribs[t]);
  } : function(n) {
    return (0, _t.isTag)(n) && n.attribs[t] === e;
  };
}
function $8(t, e) {
  return function(n) {
    return t(n) || e(n);
  };
}
function il(t) {
  var e = Object.keys(t).map(function(n) {
    var s = t[n];
    return Object.prototype.hasOwnProperty.call(as, n) ? as[n](s) : rl(n, s);
  });
  return e.length === 0 ? null : e.reduce($8);
}
function L8(t, e) {
  var n = il(t);
  return n ? n(e) : !0;
}
Ee.testElement = L8;
function N8(t, e, n, s) {
  s === void 0 && (s = 1 / 0);
  var r = il(t);
  return r ? (0, qs.filter)(r, e, n, s) : [];
}
Ee.getElements = N8;
function q8(t, e, n) {
  return n === void 0 && (n = !0), Array.isArray(e) || (e = [e]), (0, qs.findOne)(rl("id", t), e, n);
}
Ee.getElementById = q8;
function I8(t, e, n, s) {
  return n === void 0 && (n = !0), s === void 0 && (s = 1 / 0), (0, qs.filter)(as.tag_name(t), e, n, s);
}
Ee.getElementsByTagName = I8;
function U8(t, e, n, s) {
  return n === void 0 && (n = !0), s === void 0 && (s = 1 / 0), (0, qs.filter)(as.tag_type(t), e, n, s);
}
Ee.getElementsByTagType = U8;
var gt = {};
Object.defineProperty(gt, "__esModule", { value: !0 });
gt.uniqueSort = gt.compareDocumentPosition = gt.removeSubsets = void 0;
var Qi = ut;
function j8(t) {
  for (var e = t.length; --e >= 0; ) {
    var n = t[e];
    if (e > 0 && t.lastIndexOf(n, e - 1) >= 0) {
      t.splice(e, 1);
      continue;
    }
    for (var s = n.parent; s; s = s.parent)
      if (t.includes(s)) {
        t.splice(e, 1);
        break;
      }
  }
  return t;
}
gt.removeSubsets = j8;
function ol(t, e) {
  var n = [], s = [];
  if (t === e)
    return 0;
  for (var r = (0, Qi.hasChildren)(t) ? t : t.parent; r; )
    n.unshift(r), r = r.parent;
  for (r = (0, Qi.hasChildren)(e) ? e : e.parent; r; )
    s.unshift(r), r = r.parent;
  for (var i = Math.min(n.length, s.length), o = 0; o < i && n[o] === s[o]; )
    o++;
  if (o === 0)
    return 1;
  var a = n[o - 1], l = a.children, c = n[o], u = s[o];
  return l.indexOf(c) > l.indexOf(u) ? a === e ? 20 : 4 : a === t ? 10 : 2;
}
gt.compareDocumentPosition = ol;
function Y8(t) {
  return t = t.filter(function(e, n, s) {
    return !s.includes(e, n + 1);
  }), t.sort(function(e, n) {
    var s = ol(e, n);
    return s & 2 ? -1 : s & 4 ? 1 : 0;
  }), t;
}
gt.uniqueSort = Y8;
var Is = {};
Object.defineProperty(Is, "__esModule", { value: !0 });
Is.getFeed = void 0;
var F8 = De, Tn = Ee;
function z8(t) {
  var e = ls(G8, t);
  return e ? e.name === "feed" ? B8(e) : H8(e) : null;
}
Is.getFeed = z8;
function B8(t) {
  var e, n = t.children, s = {
    type: "atom",
    items: (0, Tn.getElementsByTagName)("entry", n).map(function(o) {
      var a, l = o.children, c = { media: al(l) };
      we(c, "id", "id", l), we(c, "title", "title", l);
      var u = (a = ls("link", l)) === null || a === void 0 ? void 0 : a.attribs.href;
      u && (c.link = u);
      var f = St("summary", l) || St("content", l);
      f && (c.description = f);
      var d = St("updated", l);
      return d && (c.pubDate = new Date(d)), c;
    })
  };
  we(s, "id", "id", n), we(s, "title", "title", n);
  var r = (e = ls("link", n)) === null || e === void 0 ? void 0 : e.attribs.href;
  r && (s.link = r), we(s, "description", "subtitle", n);
  var i = St("updated", n);
  return i && (s.updated = new Date(i)), we(s, "author", "email", n, !0), s;
}
function H8(t) {
  var e, n, s = (n = (e = ls("channel", t.children)) === null || e === void 0 ? void 0 : e.children) !== null && n !== void 0 ? n : [], r = {
    type: t.name.substr(0, 3),
    id: "",
    items: (0, Tn.getElementsByTagName)("item", t.children).map(function(o) {
      var a = o.children, l = { media: al(a) };
      we(l, "id", "guid", a), we(l, "title", "title", a), we(l, "link", "link", a), we(l, "description", "description", a);
      var c = St("pubDate", a);
      return c && (l.pubDate = new Date(c)), l;
    })
  };
  we(r, "title", "title", s), we(r, "link", "link", s), we(r, "description", "description", s);
  var i = St("lastBuildDate", s);
  return i && (r.updated = new Date(i)), we(r, "author", "managingEditor", s, !0), r;
}
var V8 = ["url", "type", "lang"], W8 = [
  "fileSize",
  "bitrate",
  "framerate",
  "samplingrate",
  "channels",
  "duration",
  "height",
  "width"
];
function al(t) {
  return (0, Tn.getElementsByTagName)("media:content", t).map(function(e) {
    for (var n = e.attribs, s = {
      medium: n.medium,
      isDefault: !!n.isDefault
    }, r = 0, i = V8; r < i.length; r++) {
      var o = i[r];
      n[o] && (s[o] = n[o]);
    }
    for (var a = 0, l = W8; a < l.length; a++) {
      var o = l[a];
      n[o] && (s[o] = parseInt(n[o], 10));
    }
    return n.expression && (s.expression = n.expression), s;
  });
}
function ls(t, e) {
  return (0, Tn.getElementsByTagName)(t, e, !0, 1)[0];
}
function St(t, e, n) {
  return n === void 0 && (n = !1), (0, F8.textContent)((0, Tn.getElementsByTagName)(t, e, n, 1)).trim();
}
function we(t, e, n, s, r) {
  r === void 0 && (r = !1);
  var i = St(n, s, r);
  i && (t[e] = i);
}
function G8(t) {
  return t === "rss" || t === "feed" || t === "rdf:RDF";
}
(function(t) {
  var e = D && D.__createBinding || (Object.create ? function(r, i, o, a) {
    a === void 0 && (a = o), Object.defineProperty(r, a, { enumerable: !0, get: function() {
      return i[o];
    } });
  } : function(r, i, o, a) {
    a === void 0 && (a = o), r[a] = i[o];
  }), n = D && D.__exportStar || function(r, i) {
    for (var o in r)
      o !== "default" && !Object.prototype.hasOwnProperty.call(i, o) && e(i, r, o);
  };
  Object.defineProperty(t, "__esModule", { value: !0 }), t.hasChildren = t.isDocument = t.isComment = t.isText = t.isCDATA = t.isTag = void 0, n(De, t), n(le, t), n(ve, t), n(me, t), n(Ee, t), n(gt, t), n(Is, t);
  var s = ut;
  Object.defineProperty(t, "isTag", { enumerable: !0, get: function() {
    return s.isTag;
  } }), Object.defineProperty(t, "isCDATA", { enumerable: !0, get: function() {
    return s.isCDATA;
  } }), Object.defineProperty(t, "isText", { enumerable: !0, get: function() {
    return s.isText;
  } }), Object.defineProperty(t, "isComment", { enumerable: !0, get: function() {
    return s.isComment;
  } }), Object.defineProperty(t, "isDocument", { enumerable: !0, get: function() {
    return s.isDocument;
  } }), Object.defineProperty(t, "hasChildren", { enumerable: !0, get: function() {
    return s.hasChildren;
  } });
})(li);
var Z8 = D && D.__extends || function() {
  var t = function(e, n) {
    return t = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(s, r) {
      s.__proto__ = r;
    } || function(s, r) {
      for (var i in r)
        Object.prototype.hasOwnProperty.call(r, i) && (s[i] = r[i]);
    }, t(e, n);
  };
  return function(e, n) {
    if (typeof n != "function" && n !== null)
      throw new TypeError("Class extends value " + String(n) + " is not a constructor or null");
    t(e, n);
    function s() {
      this.constructor = e;
    }
    e.prototype = n === null ? Object.create(n) : (s.prototype = n.prototype, new s());
  };
}(), Q8 = D && D.__createBinding || (Object.create ? function(t, e, n, s) {
  s === void 0 && (s = n), Object.defineProperty(t, s, { enumerable: !0, get: function() {
    return e[n];
  } });
} : function(t, e, n, s) {
  s === void 0 && (s = n), t[s] = e[n];
}), J8 = D && D.__setModuleDefault || (Object.create ? function(t, e) {
  Object.defineProperty(t, "default", { enumerable: !0, value: e });
} : function(t, e) {
  t.default = e;
}), X8 = D && D.__importStar || function(t) {
  if (t && t.__esModule)
    return t;
  var e = {};
  if (t != null)
    for (var n in t)
      n !== "default" && Object.prototype.hasOwnProperty.call(t, n) && Q8(e, t, n);
  return J8(e, t), e;
}, K8 = D && D.__importDefault || function(t) {
  return t && t.__esModule ? t : { default: t };
};
Object.defineProperty(Tt, "__esModule", { value: !0 });
Tt.parseFeed = Tt.FeedHandler = void 0;
var e9 = K8(ut), cs = X8(li), t9 = Sn, Ji;
(function(t) {
  t[t.image = 0] = "image", t[t.audio = 1] = "audio", t[t.video = 2] = "video", t[t.document = 3] = "document", t[t.executable = 4] = "executable";
})(Ji || (Ji = {}));
var Xi;
(function(t) {
  t[t.sample = 0] = "sample", t[t.full = 1] = "full", t[t.nonstop = 2] = "nonstop";
})(Xi || (Xi = {}));
var ll = function(t) {
  Z8(e, t);
  function e(n, s) {
    var r = this;
    return typeof n == "object" && (n = void 0, s = n), r = t.call(this, n, s) || this, r;
  }
  return e.prototype.onend = function() {
    var n, s, r = Rn(n9, this.dom);
    if (!r) {
      this.handleCallback(new Error("couldn't find root of feed"));
      return;
    }
    var i = {};
    if (r.name === "feed") {
      var o = r.children;
      i.type = "atom", ye(i, "id", "id", o), ye(i, "title", "title", o);
      var a = eo("href", Rn("link", o));
      a && (i.link = a), ye(i, "description", "subtitle", o);
      var l = vt("updated", o);
      l && (i.updated = new Date(l)), ye(i, "author", "email", o, !0), i.items = wr("entry", o).map(function(c) {
        var u = {}, f = c.children;
        ye(u, "id", "id", f), ye(u, "title", "title", f);
        var d = eo("href", Rn("link", f));
        d && (u.link = d);
        var h = vt("summary", f) || vt("content", f);
        h && (u.description = h);
        var y = vt("updated", f);
        return y && (u.pubDate = new Date(y)), u.media = Ki(f), u;
      });
    } else {
      var o = (s = (n = Rn("channel", r.children)) === null || n === void 0 ? void 0 : n.children) !== null && s !== void 0 ? s : [];
      i.type = r.name.substr(0, 3), i.id = "", ye(i, "title", "title", o), ye(i, "link", "link", o), ye(i, "description", "description", o);
      var l = vt("lastBuildDate", o);
      l && (i.updated = new Date(l)), ye(i, "author", "managingEditor", o, !0), i.items = wr("item", r.children).map(function(f) {
        var d = {}, h = f.children;
        ye(d, "id", "guid", h), ye(d, "title", "title", h), ye(d, "link", "link", h), ye(d, "description", "description", h);
        var y = vt("pubDate", h);
        return y && (d.pubDate = new Date(y)), d.media = Ki(h), d;
      });
    }
    this.feed = i, this.handleCallback(null);
  }, e;
}(e9.default);
Tt.FeedHandler = ll;
function Ki(t) {
  return wr("media:content", t).map(function(e) {
    var n = {
      medium: e.attribs.medium,
      isDefault: !!e.attribs.isDefault
    };
    return e.attribs.url && (n.url = e.attribs.url), e.attribs.fileSize && (n.fileSize = parseInt(e.attribs.fileSize, 10)), e.attribs.type && (n.type = e.attribs.type), e.attribs.expression && (n.expression = e.attribs.expression), e.attribs.bitrate && (n.bitrate = parseInt(e.attribs.bitrate, 10)), e.attribs.framerate && (n.framerate = parseInt(e.attribs.framerate, 10)), e.attribs.samplingrate && (n.samplingrate = parseInt(e.attribs.samplingrate, 10)), e.attribs.channels && (n.channels = parseInt(e.attribs.channels, 10)), e.attribs.duration && (n.duration = parseInt(e.attribs.duration, 10)), e.attribs.height && (n.height = parseInt(e.attribs.height, 10)), e.attribs.width && (n.width = parseInt(e.attribs.width, 10)), e.attribs.lang && (n.lang = e.attribs.lang), n;
  });
}
function wr(t, e) {
  return cs.getElementsByTagName(t, e, !0);
}
function Rn(t, e) {
  return cs.getElementsByTagName(t, e, !0, 1)[0];
}
function vt(t, e, n) {
  return n === void 0 && (n = !1), cs.getText(cs.getElementsByTagName(t, e, n, 1)).trim();
}
function eo(t, e) {
  if (!e)
    return null;
  var n = e.attribs;
  return n[t];
}
function ye(t, e, n, s, r) {
  r === void 0 && (r = !1);
  var i = vt(n, s, r);
  i && (t[e] = i);
}
function n9(t) {
  return t === "rss" || t === "feed" || t === "rdf:RDF";
}
function s9(t, e) {
  e === void 0 && (e = { xmlMode: !0 });
  var n = new ll(e);
  return new t9.Parser(n, e).end(t), n.feed;
}
Tt.parseFeed = s9;
(function(t) {
  var e = D && D.__createBinding || (Object.create ? function(y, b, m, k) {
    k === void 0 && (k = m), Object.defineProperty(y, k, { enumerable: !0, get: function() {
      return b[m];
    } });
  } : function(y, b, m, k) {
    k === void 0 && (k = m), y[k] = b[m];
  }), n = D && D.__setModuleDefault || (Object.create ? function(y, b) {
    Object.defineProperty(y, "default", { enumerable: !0, value: b });
  } : function(y, b) {
    y.default = b;
  }), s = D && D.__importStar || function(y) {
    if (y && y.__esModule)
      return y;
    var b = {};
    if (y != null)
      for (var m in y)
        m !== "default" && Object.prototype.hasOwnProperty.call(y, m) && e(b, y, m);
    return n(b, y), b;
  }, r = D && D.__exportStar || function(y, b) {
    for (var m in y)
      m !== "default" && !Object.prototype.hasOwnProperty.call(b, m) && e(b, y, m);
  }, i = D && D.__importDefault || function(y) {
    return y && y.__esModule ? y : { default: y };
  };
  Object.defineProperty(t, "__esModule", { value: !0 }), t.RssHandler = t.DefaultHandler = t.DomUtils = t.ElementType = t.Tokenizer = t.createDomStream = t.parseDOM = t.parseDocument = t.DomHandler = t.Parser = void 0;
  var o = Sn;
  Object.defineProperty(t, "Parser", { enumerable: !0, get: function() {
    return o.Parser;
  } });
  var a = ut;
  Object.defineProperty(t, "DomHandler", { enumerable: !0, get: function() {
    return a.DomHandler;
  } }), Object.defineProperty(t, "DefaultHandler", { enumerable: !0, get: function() {
    return a.DomHandler;
  } });
  function l(y, b) {
    var m = new a.DomHandler(void 0, b);
    return new o.Parser(m, b).end(y), m.root;
  }
  t.parseDocument = l;
  function c(y, b) {
    return l(y, b).children;
  }
  t.parseDOM = c;
  function u(y, b, m) {
    var k = new a.DomHandler(y, b, m);
    return new o.Parser(k, b);
  }
  t.createDomStream = u;
  var f = Cs;
  Object.defineProperty(t, "Tokenizer", { enumerable: !0, get: function() {
    return i(f).default;
  } });
  var d = s(Zt);
  t.ElementType = d, r(Tt, t), t.DomUtils = s(li);
  var h = Tt;
  Object.defineProperty(t, "RssHandler", { enumerable: !0, get: function() {
    return h.FeedHandler;
  } });
})(Da);
var r9 = (t) => {
  if (typeof t != "string")
    throw new TypeError("Expected a string");
  return t.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}, di = {};
Object.defineProperty(di, "__esModule", { value: !0 });
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
function to(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
function i9(t) {
  var e, n;
  return to(t) === !1 ? !1 : (e = t.constructor, e === void 0 ? !0 : (n = e.prototype, !(to(n) === !1 || n.hasOwnProperty("isPrototypeOf") === !1)));
}
di.isPlainObject = i9;
var o9 = function(e) {
  return a9(e) && !l9(e);
};
function a9(t) {
  return !!t && typeof t == "object";
}
function l9(t) {
  var e = Object.prototype.toString.call(t);
  return e === "[object RegExp]" || e === "[object Date]" || f9(t);
}
var c9 = typeof Symbol == "function" && Symbol.for, u9 = c9 ? Symbol.for("react.element") : 60103;
function f9(t) {
  return t.$$typeof === u9;
}
function h9(t) {
  return Array.isArray(t) ? [] : {};
}
function cn(t, e) {
  return e.clone !== !1 && e.isMergeableObject(t) ? Yt(h9(t), t, e) : t;
}
function d9(t, e, n) {
  return t.concat(e).map(function(s) {
    return cn(s, n);
  });
}
function p9(t, e) {
  if (!e.customMerge)
    return Yt;
  var n = e.customMerge(t);
  return typeof n == "function" ? n : Yt;
}
function m9(t) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(e) {
    return t.propertyIsEnumerable(e);
  }) : [];
}
function no(t) {
  return Object.keys(t).concat(m9(t));
}
function cl(t, e) {
  try {
    return e in t;
  } catch {
    return !1;
  }
}
function g9(t, e) {
  return cl(t, e) && !(Object.hasOwnProperty.call(t, e) && Object.propertyIsEnumerable.call(t, e));
}
function y9(t, e, n) {
  var s = {};
  return n.isMergeableObject(t) && no(t).forEach(function(r) {
    s[r] = cn(t[r], n);
  }), no(e).forEach(function(r) {
    g9(t, r) || (cl(t, r) && n.isMergeableObject(e[r]) ? s[r] = p9(r, n)(t[r], e[r], n) : s[r] = cn(e[r], n));
  }), s;
}
function Yt(t, e, n) {
  n = n || {}, n.arrayMerge = n.arrayMerge || d9, n.isMergeableObject = n.isMergeableObject || o9, n.cloneUnlessOtherwiseSpecified = cn;
  var s = Array.isArray(e), r = Array.isArray(t), i = s === r;
  return i ? s ? n.arrayMerge(t, e, n) : y9(t, e, n) : cn(e, n);
}
Yt.all = function(e, n) {
  if (!Array.isArray(e))
    throw new Error("first argument should be an array");
  return e.reduce(function(s, r) {
    return Yt(s, r, n);
  }, {});
};
var b9 = Yt, w9 = b9, ul = { exports: {} };
(function(t) {
  (function(e, n) {
    t.exports ? t.exports = n() : e.parseSrcset = n();
  })(D, function() {
    return function(e) {
      function n(q) {
        return q === " " || q === "	" || q === `
` || q === "\f" || q === "\r";
      }
      function s(q) {
        var Q, J = q.exec(e.substring(m));
        if (J)
          return Q = J[0], m += Q.length, Q;
      }
      for (var r = e.length, i = /^[ \t\n\r\u000c]+/, o = /^[, \t\n\r\u000c]+/, a = /^[^ \t\n\r\u000c]+/, l = /[,]+$/, c = /^\d+$/, u = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/, f, d, h, y, b, m = 0, k = []; ; ) {
        if (s(o), m >= r)
          return k;
        f = s(a), d = [], f.slice(-1) === "," ? (f = f.replace(l, ""), te()) : P();
      }
      function P() {
        for (s(i), h = "", y = "in descriptor"; ; ) {
          if (b = e.charAt(m), y === "in descriptor")
            if (n(b))
              h && (d.push(h), h = "", y = "after descriptor");
            else if (b === ",") {
              m += 1, h && d.push(h), te();
              return;
            } else if (b === "(")
              h = h + b, y = "in parens";
            else if (b === "") {
              h && d.push(h), te();
              return;
            } else
              h = h + b;
          else if (y === "in parens")
            if (b === ")")
              h = h + b, y = "in descriptor";
            else if (b === "") {
              d.push(h), te();
              return;
            } else
              h = h + b;
          else if (y === "after descriptor" && !n(b))
            if (b === "") {
              te();
              return;
            } else
              y = "in descriptor", m -= 1;
          m += 1;
        }
      }
      function te() {
        var q = !1, Q, J, ie, oe, ge = {}, Re, Ct, ft, ht, p;
        for (oe = 0; oe < d.length; oe++)
          Re = d[oe], Ct = Re[Re.length - 1], ft = Re.substring(0, Re.length - 1), ht = parseInt(ft, 10), p = parseFloat(ft), c.test(ft) && Ct === "w" ? ((Q || J) && (q = !0), ht === 0 ? q = !0 : Q = ht) : u.test(ft) && Ct === "x" ? ((Q || J || ie) && (q = !0), p < 0 ? q = !0 : J = p) : c.test(ft) && Ct === "h" ? ((ie || J) && (q = !0), ht === 0 ? q = !0 : ie = ht) : q = !0;
        q ? console && console.log && console.log("Invalid srcset descriptor found in '" + e + "' at '" + Re + "'.") : (ge.url = f, Q && (ge.w = Q), J && (ge.d = J), ie && (ge.h = ie), k.push(ge));
      }
    };
  });
})(ul);
var pi = { exports: {} }, W = String, fl = function() {
  return { isColorSupported: !1, reset: W, bold: W, dim: W, italic: W, underline: W, inverse: W, hidden: W, strikethrough: W, black: W, red: W, green: W, yellow: W, blue: W, magenta: W, cyan: W, white: W, gray: W, bgBlack: W, bgRed: W, bgGreen: W, bgYellow: W, bgBlue: W, bgMagenta: W, bgCyan: W, bgWhite: W };
};
pi.exports = fl();
pi.exports.createColors = fl;
const v9 = {}, _9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: v9
}, Symbol.toStringTag, { value: "Module" })), Fe = /* @__PURE__ */ Ta(_9);
let so = pi.exports, ro = Fe;
class un extends Error {
  constructor(e, n, s, r, i, o) {
    super(e), this.name = "CssSyntaxError", this.reason = e, i && (this.file = i), r && (this.source = r), o && (this.plugin = o), typeof n < "u" && typeof s < "u" && (typeof n == "number" ? (this.line = n, this.column = s) : (this.line = n.line, this.column = n.column, this.endLine = s.line, this.endColumn = s.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, un);
  }
  setMessage() {
    this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
  }
  showSourceCode(e) {
    if (!this.source)
      return "";
    let n = this.source;
    e == null && (e = so.isColorSupported), ro && e && (n = ro(n));
    let s = n.split(/\r?\n/), r = Math.max(this.line - 3, 0), i = Math.min(this.line + 2, s.length), o = String(i).length, a, l;
    if (e) {
      let { bold: c, red: u, gray: f } = so.createColors(!0);
      a = (d) => c(u(d)), l = (d) => f(d);
    } else
      a = l = (c) => c;
    return s.slice(r, i).map((c, u) => {
      let f = r + 1 + u, d = " " + (" " + f).slice(-o) + " | ";
      if (f === this.line) {
        let h = l(d.replace(/\d/g, " ")) + c.slice(0, this.column - 1).replace(/[^\t]/g, " ");
        return a(">") + l(d) + c + `
 ` + h + a("^");
      }
      return " " + l(d) + c;
    }).join(`
`);
  }
  toString() {
    let e = this.showSourceCode();
    return e && (e = `

` + e + `
`), this.name + ": " + this.message + e;
  }
}
var mi = un;
un.default = un;
var Dn = {};
Dn.isClean = Symbol("isClean");
Dn.my = Symbol("my");
const io = {
  colon: ": ",
  indent: "    ",
  beforeDecl: `
`,
  beforeRule: `
`,
  beforeOpen: " ",
  beforeClose: `
`,
  beforeComment: `
`,
  after: `
`,
  emptyBody: "",
  commentLeft: " ",
  commentRight: " ",
  semicolon: !1
};
function x9(t) {
  return t[0].toUpperCase() + t.slice(1);
}
class vr {
  constructor(e) {
    this.builder = e;
  }
  stringify(e, n) {
    if (!this[e.type])
      throw new Error(
        "Unknown AST node type " + e.type + ". Maybe you need to change PostCSS stringifier."
      );
    this[e.type](e, n);
  }
  document(e) {
    this.body(e);
  }
  root(e) {
    this.body(e), e.raws.after && this.builder(e.raws.after);
  }
  comment(e) {
    let n = this.raw(e, "left", "commentLeft"), s = this.raw(e, "right", "commentRight");
    this.builder("/*" + n + e.text + s + "*/", e);
  }
  decl(e, n) {
    let s = this.raw(e, "between", "colon"), r = e.prop + s + this.rawValue(e, "value");
    e.important && (r += e.raws.important || " !important"), n && (r += ";"), this.builder(r, e);
  }
  rule(e) {
    this.block(e, this.rawValue(e, "selector")), e.raws.ownSemicolon && this.builder(e.raws.ownSemicolon, e, "end");
  }
  atrule(e, n) {
    let s = "@" + e.name, r = e.params ? this.rawValue(e, "params") : "";
    if (typeof e.raws.afterName < "u" ? s += e.raws.afterName : r && (s += " "), e.nodes)
      this.block(e, s + r);
    else {
      let i = (e.raws.between || "") + (n ? ";" : "");
      this.builder(s + r + i, e);
    }
  }
  body(e) {
    let n = e.nodes.length - 1;
    for (; n > 0 && e.nodes[n].type === "comment"; )
      n -= 1;
    let s = this.raw(e, "semicolon");
    for (let r = 0; r < e.nodes.length; r++) {
      let i = e.nodes[r], o = this.raw(i, "before");
      o && this.builder(o), this.stringify(i, n !== r || s);
    }
  }
  block(e, n) {
    let s = this.raw(e, "between", "beforeOpen");
    this.builder(n + s + "{", e, "start");
    let r;
    e.nodes && e.nodes.length ? (this.body(e), r = this.raw(e, "after")) : r = this.raw(e, "after", "emptyBody"), r && this.builder(r), this.builder("}", e, "end");
  }
  raw(e, n, s) {
    let r;
    if (s || (s = n), n && (r = e.raws[n], typeof r < "u"))
      return r;
    let i = e.parent;
    if (s === "before" && (!i || i.type === "root" && i.first === e || i && i.type === "document"))
      return "";
    if (!i)
      return io[s];
    let o = e.root();
    if (o.rawCache || (o.rawCache = {}), typeof o.rawCache[s] < "u")
      return o.rawCache[s];
    if (s === "before" || s === "after")
      return this.beforeAfter(e, s);
    {
      let a = "raw" + x9(s);
      this[a] ? r = this[a](o, e) : o.walk((l) => {
        if (r = l.raws[n], typeof r < "u")
          return !1;
      });
    }
    return typeof r > "u" && (r = io[s]), o.rawCache[s] = r, r;
  }
  rawSemicolon(e) {
    let n;
    return e.walk((s) => {
      if (s.nodes && s.nodes.length && s.last.type === "decl" && (n = s.raws.semicolon, typeof n < "u"))
        return !1;
    }), n;
  }
  rawEmptyBody(e) {
    let n;
    return e.walk((s) => {
      if (s.nodes && s.nodes.length === 0 && (n = s.raws.after, typeof n < "u"))
        return !1;
    }), n;
  }
  rawIndent(e) {
    if (e.raws.indent)
      return e.raws.indent;
    let n;
    return e.walk((s) => {
      let r = s.parent;
      if (r && r !== e && r.parent && r.parent === e && typeof s.raws.before < "u") {
        let i = s.raws.before.split(`
`);
        return n = i[i.length - 1], n = n.replace(/\S/g, ""), !1;
      }
    }), n;
  }
  rawBeforeComment(e, n) {
    let s;
    return e.walkComments((r) => {
      if (typeof r.raws.before < "u")
        return s = r.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
    }), typeof s > "u" ? s = this.raw(n, null, "beforeDecl") : s && (s = s.replace(/\S/g, "")), s;
  }
  rawBeforeDecl(e, n) {
    let s;
    return e.walkDecls((r) => {
      if (typeof r.raws.before < "u")
        return s = r.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
    }), typeof s > "u" ? s = this.raw(n, null, "beforeRule") : s && (s = s.replace(/\S/g, "")), s;
  }
  rawBeforeRule(e) {
    let n;
    return e.walk((s) => {
      if (s.nodes && (s.parent !== e || e.first !== s) && typeof s.raws.before < "u")
        return n = s.raws.before, n.includes(`
`) && (n = n.replace(/[^\n]+$/, "")), !1;
    }), n && (n = n.replace(/\S/g, "")), n;
  }
  rawBeforeClose(e) {
    let n;
    return e.walk((s) => {
      if (s.nodes && s.nodes.length > 0 && typeof s.raws.after < "u")
        return n = s.raws.after, n.includes(`
`) && (n = n.replace(/[^\n]+$/, "")), !1;
    }), n && (n = n.replace(/\S/g, "")), n;
  }
  rawBeforeOpen(e) {
    let n;
    return e.walk((s) => {
      if (s.type !== "decl" && (n = s.raws.between, typeof n < "u"))
        return !1;
    }), n;
  }
  rawColon(e) {
    let n;
    return e.walkDecls((s) => {
      if (typeof s.raws.between < "u")
        return n = s.raws.between.replace(/[^\s:]/g, ""), !1;
    }), n;
  }
  beforeAfter(e, n) {
    let s;
    e.type === "decl" ? s = this.raw(e, null, "beforeDecl") : e.type === "comment" ? s = this.raw(e, null, "beforeComment") : n === "before" ? s = this.raw(e, null, "beforeRule") : s = this.raw(e, null, "beforeClose");
    let r = e.parent, i = 0;
    for (; r && r.type !== "root"; )
      i += 1, r = r.parent;
    if (s.includes(`
`)) {
      let o = this.raw(e, null, "indent");
      if (o.length)
        for (let a = 0; a < i; a++)
          s += o;
    }
    return s;
  }
  rawValue(e, n) {
    let s = e[n], r = e.raws[n];
    return r && r.value === s ? r.raw : s;
  }
}
var hl = vr;
vr.default = vr;
let S9 = hl;
function _r(t, e) {
  new S9(e).stringify(t);
}
var Us = _r;
_r.default = _r;
let { isClean: $n, my: k9 } = Dn, T9 = mi, D9 = hl, O9 = Us;
function xr(t, e) {
  let n = new t.constructor();
  for (let s in t) {
    if (!Object.prototype.hasOwnProperty.call(t, s) || s === "proxyCache")
      continue;
    let r = t[s], i = typeof r;
    s === "parent" && i === "object" ? e && (n[s] = e) : s === "source" ? n[s] = r : Array.isArray(r) ? n[s] = r.map((o) => xr(o, n)) : (i === "object" && r !== null && (r = xr(r)), n[s] = r);
  }
  return n;
}
class Sr {
  constructor(e = {}) {
    this.raws = {}, this[$n] = !1, this[k9] = !0;
    for (let n in e)
      if (n === "nodes") {
        this.nodes = [];
        for (let s of e[n])
          typeof s.clone == "function" ? this.append(s.clone()) : this.append(s);
      } else
        this[n] = e[n];
  }
  error(e, n = {}) {
    if (this.source) {
      let { start: s, end: r } = this.rangeBy(n);
      return this.source.input.error(
        e,
        { line: s.line, column: s.column },
        { line: r.line, column: r.column },
        n
      );
    }
    return new T9(e);
  }
  warn(e, n, s) {
    let r = { node: this };
    for (let i in s)
      r[i] = s[i];
    return e.warn(n, r);
  }
  remove() {
    return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
  }
  toString(e = O9) {
    e.stringify && (e = e.stringify);
    let n = "";
    return e(this, (s) => {
      n += s;
    }), n;
  }
  assign(e = {}) {
    for (let n in e)
      this[n] = e[n];
    return this;
  }
  clone(e = {}) {
    let n = xr(this);
    for (let s in e)
      n[s] = e[s];
    return n;
  }
  cloneBefore(e = {}) {
    let n = this.clone(e);
    return this.parent.insertBefore(this, n), n;
  }
  cloneAfter(e = {}) {
    let n = this.clone(e);
    return this.parent.insertAfter(this, n), n;
  }
  replaceWith(...e) {
    if (this.parent) {
      let n = this, s = !1;
      for (let r of e)
        r === this ? s = !0 : s ? (this.parent.insertAfter(n, r), n = r) : this.parent.insertBefore(n, r);
      s || this.remove();
    }
    return this;
  }
  next() {
    if (!this.parent)
      return;
    let e = this.parent.index(this);
    return this.parent.nodes[e + 1];
  }
  prev() {
    if (!this.parent)
      return;
    let e = this.parent.index(this);
    return this.parent.nodes[e - 1];
  }
  before(e) {
    return this.parent.insertBefore(this, e), this;
  }
  after(e) {
    return this.parent.insertAfter(this, e), this;
  }
  root() {
    let e = this;
    for (; e.parent && e.parent.type !== "document"; )
      e = e.parent;
    return e;
  }
  raw(e, n) {
    return new D9().raw(this, e, n);
  }
  cleanRaws(e) {
    delete this.raws.before, delete this.raws.after, e || delete this.raws.between;
  }
  toJSON(e, n) {
    let s = {}, r = n == null;
    n = n || /* @__PURE__ */ new Map();
    let i = 0;
    for (let o in this) {
      if (!Object.prototype.hasOwnProperty.call(this, o) || o === "parent" || o === "proxyCache")
        continue;
      let a = this[o];
      if (Array.isArray(a))
        s[o] = a.map((l) => typeof l == "object" && l.toJSON ? l.toJSON(null, n) : l);
      else if (typeof a == "object" && a.toJSON)
        s[o] = a.toJSON(null, n);
      else if (o === "source") {
        let l = n.get(a.input);
        l == null && (l = i, n.set(a.input, i), i++), s[o] = {
          inputId: l,
          start: a.start,
          end: a.end
        };
      } else
        s[o] = a;
    }
    return r && (s.inputs = [...n.keys()].map((o) => o.toJSON())), s;
  }
  positionInside(e) {
    let n = this.toString(), s = this.source.start.column, r = this.source.start.line;
    for (let i = 0; i < e; i++)
      n[i] === `
` ? (s = 1, r += 1) : s += 1;
    return { line: r, column: s };
  }
  positionBy(e) {
    let n = this.source.start;
    if (e.index)
      n = this.positionInside(e.index);
    else if (e.word) {
      let s = this.toString().indexOf(e.word);
      s !== -1 && (n = this.positionInside(s));
    }
    return n;
  }
  rangeBy(e) {
    let n = {
      line: this.source.start.line,
      column: this.source.start.column
    }, s = this.source.end ? {
      line: this.source.end.line,
      column: this.source.end.column + 1
    } : {
      line: n.line,
      column: n.column + 1
    };
    if (e.word) {
      let r = this.toString().indexOf(e.word);
      r !== -1 && (n = this.positionInside(r), s = this.positionInside(r + e.word.length));
    } else
      e.start ? n = {
        line: e.start.line,
        column: e.start.column
      } : e.index && (n = this.positionInside(e.index)), e.end ? s = {
        line: e.end.line,
        column: e.end.column
      } : e.endIndex ? s = this.positionInside(e.endIndex) : e.index && (s = this.positionInside(e.index + 1));
    return (s.line < n.line || s.line === n.line && s.column <= n.column) && (s = { line: n.line, column: n.column + 1 }), { start: n, end: s };
  }
  getProxyProcessor() {
    return {
      set(e, n, s) {
        return e[n] === s || (e[n] = s, (n === "prop" || n === "value" || n === "name" || n === "params" || n === "important" || n === "text") && e.markDirty()), !0;
      },
      get(e, n) {
        return n === "proxyOf" ? e : n === "root" ? () => e.root().toProxy() : e[n];
      }
    };
  }
  toProxy() {
    return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
  }
  addToError(e) {
    if (e.postcssNode = this, e.stack && this.source && /\n\s{4}at /.test(e.stack)) {
      let n = this.source;
      e.stack = e.stack.replace(
        /\n\s{4}at /,
        `$&${n.input.from}:${n.start.line}:${n.start.column}$&`
      );
    }
    return e;
  }
  markDirty() {
    if (this[$n]) {
      this[$n] = !1;
      let e = this;
      for (; e = e.parent; )
        e[$n] = !1;
    }
  }
  get proxyOf() {
    return this;
  }
}
var js = Sr;
Sr.default = Sr;
let E9 = js;
class kr extends E9 {
  constructor(e) {
    e && typeof e.value < "u" && typeof e.value != "string" && (e = { ...e, value: String(e.value) }), super(e), this.type = "decl";
  }
  get variable() {
    return this.prop.startsWith("--") || this.prop[0] === "$";
  }
}
var Ys = kr;
kr.default = kr;
let A9 = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict", C9 = (t, e = 21) => (n = e) => {
  let s = "", r = n;
  for (; r--; )
    s += t[Math.random() * t.length | 0];
  return s;
}, M9 = (t = 21) => {
  let e = "", n = t;
  for (; n--; )
    e += A9[Math.random() * 64 | 0];
  return e;
};
const P9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  nanoid: M9,
  customAlphabet: C9
}, Symbol.toStringTag, { value: "Module" })), R9 = /* @__PURE__ */ Ta(P9);
let { SourceMapConsumer: oo, SourceMapGenerator: ao } = Fe, { existsSync: $9, readFileSync: L9 } = Fe, { dirname: tr, join: N9 } = Fe;
function q9(t) {
  return Buffer ? Buffer.from(t, "base64").toString() : window.atob(t);
}
class Tr {
  constructor(e, n) {
    if (n.map === !1)
      return;
    this.loadAnnotation(e), this.inline = this.startWith(this.annotation, "data:");
    let s = n.map ? n.map.prev : void 0, r = this.loadMap(n.from, s);
    !this.mapFile && n.from && (this.mapFile = n.from), this.mapFile && (this.root = tr(this.mapFile)), r && (this.text = r);
  }
  consumer() {
    return this.consumerCache || (this.consumerCache = new oo(this.text)), this.consumerCache;
  }
  withContent() {
    return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
  }
  startWith(e, n) {
    return e ? e.substr(0, n.length) === n : !1;
  }
  getAnnotationURL(e) {
    return e.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
  }
  loadAnnotation(e) {
    let n = e.match(/\/\*\s*# sourceMappingURL=/gm);
    if (!n)
      return;
    let s = e.lastIndexOf(n.pop()), r = e.indexOf("*/", s);
    s > -1 && r > -1 && (this.annotation = this.getAnnotationURL(e.substring(s, r)));
  }
  decodeInline(e) {
    let n = /^data:application\/json;charset=utf-?8;base64,/, s = /^data:application\/json;base64,/, r = /^data:application\/json;charset=utf-?8,/, i = /^data:application\/json,/;
    if (r.test(e) || i.test(e))
      return decodeURIComponent(e.substr(RegExp.lastMatch.length));
    if (n.test(e) || s.test(e))
      return q9(e.substr(RegExp.lastMatch.length));
    let o = e.match(/data:application\/json;([^,]+),/)[1];
    throw new Error("Unsupported source map encoding " + o);
  }
  loadFile(e) {
    if (this.root = tr(e), $9(e))
      return this.mapFile = e, L9(e, "utf-8").toString().trim();
  }
  loadMap(e, n) {
    if (n === !1)
      return !1;
    if (n) {
      if (typeof n == "string")
        return n;
      if (typeof n == "function") {
        let s = n(e);
        if (s) {
          let r = this.loadFile(s);
          if (!r)
            throw new Error(
              "Unable to load previous source map: " + s.toString()
            );
          return r;
        }
      } else {
        if (n instanceof oo)
          return ao.fromSourceMap(n).toString();
        if (n instanceof ao)
          return n.toString();
        if (this.isMap(n))
          return JSON.stringify(n);
        throw new Error(
          "Unsupported previous source map format: " + n.toString()
        );
      }
    } else {
      if (this.inline)
        return this.decodeInline(this.annotation);
      if (this.annotation) {
        let s = this.annotation;
        return e && (s = N9(tr(e), s)), this.loadFile(s);
      }
    }
  }
  isMap(e) {
    return typeof e != "object" ? !1 : typeof e.mappings == "string" || typeof e._mappings == "string" || Array.isArray(e.sections);
  }
}
var dl = Tr;
Tr.default = Tr;
let { SourceMapConsumer: I9, SourceMapGenerator: U9 } = Fe, { fileURLToPath: lo, pathToFileURL: Ln } = Fe, { resolve: Dr, isAbsolute: Or } = Fe, { nanoid: j9 } = R9, nr = Fe, co = mi, Y9 = dl, sr = Symbol("fromOffsetCache"), F9 = Boolean(I9 && U9), uo = Boolean(Dr && Or);
class us {
  constructor(e, n = {}) {
    if (e === null || typeof e > "u" || typeof e == "object" && !e.toString)
      throw new Error(`PostCSS received ${e} instead of CSS string`);
    if (this.css = e.toString(), this.css[0] === "\uFEFF" || this.css[0] === "\uFFFE" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, n.from && (!uo || /^\w+:\/\//.test(n.from) || Or(n.from) ? this.file = n.from : this.file = Dr(n.from)), uo && F9) {
      let s = new Y9(this.css, n);
      if (s.text) {
        this.map = s;
        let r = s.consumer().file;
        !this.file && r && (this.file = this.mapResolve(r));
      }
    }
    this.file || (this.id = "<input css " + j9(6) + ">"), this.map && (this.map.file = this.from);
  }
  fromOffset(e) {
    let n, s;
    if (this[sr])
      s = this[sr];
    else {
      let i = this.css.split(`
`);
      s = new Array(i.length);
      let o = 0;
      for (let a = 0, l = i.length; a < l; a++)
        s[a] = o, o += i[a].length + 1;
      this[sr] = s;
    }
    n = s[s.length - 1];
    let r = 0;
    if (e >= n)
      r = s.length - 1;
    else {
      let i = s.length - 2, o;
      for (; r < i; )
        if (o = r + (i - r >> 1), e < s[o])
          i = o - 1;
        else if (e >= s[o + 1])
          r = o + 1;
        else {
          r = o;
          break;
        }
    }
    return {
      line: r + 1,
      col: e - s[r] + 1
    };
  }
  error(e, n, s, r = {}) {
    let i, o, a;
    if (n && typeof n == "object") {
      let c = n, u = s;
      if (typeof n.offset == "number") {
        let f = this.fromOffset(c.offset);
        n = f.line, s = f.col;
      } else
        n = c.line, s = c.column;
      if (typeof u.offset == "number") {
        let f = this.fromOffset(u.offset);
        o = f.line, a = f.col;
      } else
        o = u.line, a = u.column;
    } else if (!s) {
      let c = this.fromOffset(n);
      n = c.line, s = c.col;
    }
    let l = this.origin(n, s, o, a);
    return l ? i = new co(
      e,
      l.endLine === void 0 ? l.line : { line: l.line, column: l.column },
      l.endLine === void 0 ? l.column : { line: l.endLine, column: l.endColumn },
      l.source,
      l.file,
      r.plugin
    ) : i = new co(
      e,
      o === void 0 ? n : { line: n, column: s },
      o === void 0 ? s : { line: o, column: a },
      this.css,
      this.file,
      r.plugin
    ), i.input = { line: n, column: s, endLine: o, endColumn: a, source: this.css }, this.file && (Ln && (i.input.url = Ln(this.file).toString()), i.input.file = this.file), i;
  }
  origin(e, n, s, r) {
    if (!this.map)
      return !1;
    let i = this.map.consumer(), o = i.originalPositionFor({ line: e, column: n });
    if (!o.source)
      return !1;
    let a;
    typeof s == "number" && (a = i.originalPositionFor({ line: s, column: r }));
    let l;
    Or(o.source) ? l = Ln(o.source) : l = new URL(
      o.source,
      this.map.consumer().sourceRoot || Ln(this.map.mapFile)
    );
    let c = {
      url: l.toString(),
      line: o.line,
      column: o.column,
      endLine: a && a.line,
      endColumn: a && a.column
    };
    if (l.protocol === "file:")
      if (lo)
        c.file = lo(l);
      else
        throw new Error("file: protocol is not available in this PostCSS build");
    let u = i.sourceContentFor(o.source);
    return u && (c.source = u), c;
  }
  mapResolve(e) {
    return /^\w+:\/\//.test(e) ? e : Dr(this.map.consumer().sourceRoot || this.map.root || ".", e);
  }
  get from() {
    return this.file || this.id;
  }
  toJSON() {
    let e = {};
    for (let n of ["hasBOM", "css", "file", "id"])
      this[n] != null && (e[n] = this[n]);
    return this.map && (e.map = { ...this.map }, e.map.consumerCache && (e.map.consumerCache = void 0)), e;
  }
}
var Fs = us;
us.default = us;
nr && nr.registerInput && nr.registerInput(us);
let { SourceMapConsumer: pl, SourceMapGenerator: Jn } = Fe, { dirname: Xn, resolve: ml, relative: gl, sep: yl } = Fe, { pathToFileURL: fo } = Fe, z9 = Fs, B9 = Boolean(pl && Jn), H9 = Boolean(Xn && ml && gl && yl);
class V9 {
  constructor(e, n, s, r) {
    this.stringify = e, this.mapOpts = s.map || {}, this.root = n, this.opts = s, this.css = r, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
  }
  isMap() {
    return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
  }
  previous() {
    if (!this.previousMaps)
      if (this.previousMaps = [], this.root)
        this.root.walk((e) => {
          if (e.source && e.source.input.map) {
            let n = e.source.input.map;
            this.previousMaps.includes(n) || this.previousMaps.push(n);
          }
        });
      else {
        let e = new z9(this.css, this.opts);
        e.map && this.previousMaps.push(e.map);
      }
    return this.previousMaps;
  }
  isInline() {
    if (typeof this.mapOpts.inline < "u")
      return this.mapOpts.inline;
    let e = this.mapOpts.annotation;
    return typeof e < "u" && e !== !0 ? !1 : this.previous().length ? this.previous().some((n) => n.inline) : !0;
  }
  isSourcesContent() {
    return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((e) => e.withContent()) : !0;
  }
  clearAnnotation() {
    if (this.mapOpts.annotation !== !1)
      if (this.root) {
        let e;
        for (let n = this.root.nodes.length - 1; n >= 0; n--)
          e = this.root.nodes[n], e.type === "comment" && e.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(n);
      } else
        this.css && (this.css = this.css.replace(/(\n)?\/\*#[\S\s]*?\*\/$/gm, ""));
  }
  setSourcesContent() {
    let e = {};
    if (this.root)
      this.root.walk((n) => {
        if (n.source) {
          let s = n.source.input.from;
          if (s && !e[s]) {
            e[s] = !0;
            let r = this.usesFileUrls ? this.toFileUrl(s) : this.toUrl(this.path(s));
            this.map.setSourceContent(r, n.source.input.css);
          }
        }
      });
    else if (this.css) {
      let n = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
      this.map.setSourceContent(n, this.css);
    }
  }
  applyPrevMaps() {
    for (let e of this.previous()) {
      let n = this.toUrl(this.path(e.file)), s = e.root || Xn(e.file), r;
      this.mapOpts.sourcesContent === !1 ? (r = new pl(e.text), r.sourcesContent && (r.sourcesContent = r.sourcesContent.map(() => null))) : r = e.consumer(), this.map.applySourceMap(r, n, this.toUrl(this.path(s)));
    }
  }
  isAnnotation() {
    return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((e) => e.annotation) : !0;
  }
  toBase64(e) {
    return Buffer ? Buffer.from(e).toString("base64") : window.btoa(unescape(encodeURIComponent(e)));
  }
  addAnnotation() {
    let e;
    this.isInline() ? e = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? e = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? e = this.mapOpts.annotation(this.opts.to, this.root) : e = this.outputFile() + ".map";
    let n = `
`;
    this.css.includes(`\r
`) && (n = `\r
`), this.css += n + "/*# sourceMappingURL=" + e + " */";
  }
  outputFile() {
    return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
  }
  generateMap() {
    if (this.root)
      this.generateString();
    else if (this.previous().length === 1) {
      let e = this.previous()[0].consumer();
      e.file = this.outputFile(), this.map = Jn.fromSourceMap(e);
    } else
      this.map = new Jn({ file: this.outputFile() }), this.map.addMapping({
        source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>",
        generated: { line: 1, column: 0 },
        original: { line: 1, column: 0 }
      });
    return this.isSourcesContent() && this.setSourcesContent(), this.root && this.previous().length > 0 && this.applyPrevMaps(), this.isAnnotation() && this.addAnnotation(), this.isInline() ? [this.css] : [this.css, this.map];
  }
  path(e) {
    if (e.indexOf("<") === 0 || /^\w+:\/\//.test(e) || this.mapOpts.absolute)
      return e;
    let n = this.opts.to ? Xn(this.opts.to) : ".";
    return typeof this.mapOpts.annotation == "string" && (n = Xn(ml(n, this.mapOpts.annotation))), e = gl(n, e), e;
  }
  toUrl(e) {
    return yl === "\\" && (e = e.replace(/\\/g, "/")), encodeURI(e).replace(/[#?]/g, encodeURIComponent);
  }
  toFileUrl(e) {
    if (fo)
      return fo(e).toString();
    throw new Error(
      "`map.absolute` option is not available in this PostCSS build"
    );
  }
  sourcePath(e) {
    return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(e.source.input.from) : this.toUrl(this.path(e.source.input.from));
  }
  generateString() {
    this.css = "", this.map = new Jn({ file: this.outputFile() });
    let e = 1, n = 1, s = "<no source>", r = {
      source: "",
      generated: { line: 0, column: 0 },
      original: { line: 0, column: 0 }
    }, i, o;
    this.stringify(this.root, (a, l, c) => {
      if (this.css += a, l && c !== "end" && (r.generated.line = e, r.generated.column = n - 1, l.source && l.source.start ? (r.source = this.sourcePath(l), r.original.line = l.source.start.line, r.original.column = l.source.start.column - 1, this.map.addMapping(r)) : (r.source = s, r.original.line = 1, r.original.column = 0, this.map.addMapping(r))), i = a.match(/\n/g), i ? (e += i.length, o = a.lastIndexOf(`
`), n = a.length - o) : n += a.length, l && c !== "start") {
        let u = l.parent || { raws: {} };
        (l.type !== "decl" || l !== u.last || u.raws.semicolon) && (l.source && l.source.end ? (r.source = this.sourcePath(l), r.original.line = l.source.end.line, r.original.column = l.source.end.column - 1, r.generated.line = e, r.generated.column = n - 2, this.map.addMapping(r)) : (r.source = s, r.original.line = 1, r.original.column = 0, r.generated.line = e, r.generated.column = n - 1, this.map.addMapping(r)));
      }
    });
  }
  generate() {
    if (this.clearAnnotation(), H9 && B9 && this.isMap())
      return this.generateMap();
    {
      let e = "";
      return this.stringify(this.root, (n) => {
        e += n;
      }), [e];
    }
  }
}
var bl = V9;
let W9 = js;
class Er extends W9 {
  constructor(e) {
    super(e), this.type = "comment";
  }
}
var zs = Er;
Er.default = Er;
let { isClean: wl, my: vl } = Dn, _l = Ys, xl = zs, G9 = js, Sl, gi, yi, kl;
function Tl(t) {
  return t.map((e) => (e.nodes && (e.nodes = Tl(e.nodes)), delete e.source, e));
}
function Dl(t) {
  if (t[wl] = !1, t.proxyOf.nodes)
    for (let e of t.proxyOf.nodes)
      Dl(e);
}
class Ie extends G9 {
  push(e) {
    return e.parent = this, this.proxyOf.nodes.push(e), this;
  }
  each(e) {
    if (!this.proxyOf.nodes)
      return;
    let n = this.getIterator(), s, r;
    for (; this.indexes[n] < this.proxyOf.nodes.length && (s = this.indexes[n], r = e(this.proxyOf.nodes[s], s), r !== !1); )
      this.indexes[n] += 1;
    return delete this.indexes[n], r;
  }
  walk(e) {
    return this.each((n, s) => {
      let r;
      try {
        r = e(n, s);
      } catch (i) {
        throw n.addToError(i);
      }
      return r !== !1 && n.walk && (r = n.walk(e)), r;
    });
  }
  walkDecls(e, n) {
    return n ? e instanceof RegExp ? this.walk((s, r) => {
      if (s.type === "decl" && e.test(s.prop))
        return n(s, r);
    }) : this.walk((s, r) => {
      if (s.type === "decl" && s.prop === e)
        return n(s, r);
    }) : (n = e, this.walk((s, r) => {
      if (s.type === "decl")
        return n(s, r);
    }));
  }
  walkRules(e, n) {
    return n ? e instanceof RegExp ? this.walk((s, r) => {
      if (s.type === "rule" && e.test(s.selector))
        return n(s, r);
    }) : this.walk((s, r) => {
      if (s.type === "rule" && s.selector === e)
        return n(s, r);
    }) : (n = e, this.walk((s, r) => {
      if (s.type === "rule")
        return n(s, r);
    }));
  }
  walkAtRules(e, n) {
    return n ? e instanceof RegExp ? this.walk((s, r) => {
      if (s.type === "atrule" && e.test(s.name))
        return n(s, r);
    }) : this.walk((s, r) => {
      if (s.type === "atrule" && s.name === e)
        return n(s, r);
    }) : (n = e, this.walk((s, r) => {
      if (s.type === "atrule")
        return n(s, r);
    }));
  }
  walkComments(e) {
    return this.walk((n, s) => {
      if (n.type === "comment")
        return e(n, s);
    });
  }
  append(...e) {
    for (let n of e) {
      let s = this.normalize(n, this.last);
      for (let r of s)
        this.proxyOf.nodes.push(r);
    }
    return this.markDirty(), this;
  }
  prepend(...e) {
    e = e.reverse();
    for (let n of e) {
      let s = this.normalize(n, this.first, "prepend").reverse();
      for (let r of s)
        this.proxyOf.nodes.unshift(r);
      for (let r in this.indexes)
        this.indexes[r] = this.indexes[r] + s.length;
    }
    return this.markDirty(), this;
  }
  cleanRaws(e) {
    if (super.cleanRaws(e), this.nodes)
      for (let n of this.nodes)
        n.cleanRaws(e);
  }
  insertBefore(e, n) {
    let s = this.index(e), r = s === 0 ? "prepend" : !1, i = this.normalize(n, this.proxyOf.nodes[s], r).reverse();
    s = this.index(e);
    for (let a of i)
      this.proxyOf.nodes.splice(s, 0, a);
    let o;
    for (let a in this.indexes)
      o = this.indexes[a], s <= o && (this.indexes[a] = o + i.length);
    return this.markDirty(), this;
  }
  insertAfter(e, n) {
    let s = this.index(e), r = this.normalize(n, this.proxyOf.nodes[s]).reverse();
    s = this.index(e);
    for (let o of r)
      this.proxyOf.nodes.splice(s + 1, 0, o);
    let i;
    for (let o in this.indexes)
      i = this.indexes[o], s < i && (this.indexes[o] = i + r.length);
    return this.markDirty(), this;
  }
  removeChild(e) {
    e = this.index(e), this.proxyOf.nodes[e].parent = void 0, this.proxyOf.nodes.splice(e, 1);
    let n;
    for (let s in this.indexes)
      n = this.indexes[s], n >= e && (this.indexes[s] = n - 1);
    return this.markDirty(), this;
  }
  removeAll() {
    for (let e of this.proxyOf.nodes)
      e.parent = void 0;
    return this.proxyOf.nodes = [], this.markDirty(), this;
  }
  replaceValues(e, n, s) {
    return s || (s = n, n = {}), this.walkDecls((r) => {
      n.props && !n.props.includes(r.prop) || n.fast && !r.value.includes(n.fast) || (r.value = r.value.replace(e, s));
    }), this.markDirty(), this;
  }
  every(e) {
    return this.nodes.every(e);
  }
  some(e) {
    return this.nodes.some(e);
  }
  index(e) {
    return typeof e == "number" ? e : (e.proxyOf && (e = e.proxyOf), this.proxyOf.nodes.indexOf(e));
  }
  get first() {
    if (!!this.proxyOf.nodes)
      return this.proxyOf.nodes[0];
  }
  get last() {
    if (!!this.proxyOf.nodes)
      return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
  }
  normalize(e, n) {
    if (typeof e == "string")
      e = Tl(Sl(e).nodes);
    else if (Array.isArray(e)) {
      e = e.slice(0);
      for (let r of e)
        r.parent && r.parent.removeChild(r, "ignore");
    } else if (e.type === "root" && this.type !== "document") {
      e = e.nodes.slice(0);
      for (let r of e)
        r.parent && r.parent.removeChild(r, "ignore");
    } else if (e.type)
      e = [e];
    else if (e.prop) {
      if (typeof e.value > "u")
        throw new Error("Value field is missed in node creation");
      typeof e.value != "string" && (e.value = String(e.value)), e = [new _l(e)];
    } else if (e.selector)
      e = [new gi(e)];
    else if (e.name)
      e = [new yi(e)];
    else if (e.text)
      e = [new xl(e)];
    else
      throw new Error("Unknown node type in node creation");
    return e.map((r) => (r[vl] || Ie.rebuild(r), r = r.proxyOf, r.parent && r.parent.removeChild(r), r[wl] && Dl(r), typeof r.raws.before > "u" && n && typeof n.raws.before < "u" && (r.raws.before = n.raws.before.replace(/\S/g, "")), r.parent = this.proxyOf, r));
  }
  getProxyProcessor() {
    return {
      set(e, n, s) {
        return e[n] === s || (e[n] = s, (n === "name" || n === "params" || n === "selector") && e.markDirty()), !0;
      },
      get(e, n) {
        return n === "proxyOf" ? e : e[n] ? n === "each" || typeof n == "string" && n.startsWith("walk") ? (...s) => e[n](
          ...s.map((r) => typeof r == "function" ? (i, o) => r(i.toProxy(), o) : r)
        ) : n === "every" || n === "some" ? (s) => e[n](
          (r, ...i) => s(r.toProxy(), ...i)
        ) : n === "root" ? () => e.root().toProxy() : n === "nodes" ? e.nodes.map((s) => s.toProxy()) : n === "first" || n === "last" ? e[n].toProxy() : e[n] : e[n];
      }
    };
  }
  getIterator() {
    this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
    let e = this.lastEach;
    return this.indexes[e] = 0, e;
  }
}
Ie.registerParse = (t) => {
  Sl = t;
};
Ie.registerRule = (t) => {
  gi = t;
};
Ie.registerAtRule = (t) => {
  yi = t;
};
Ie.registerRoot = (t) => {
  kl = t;
};
var Et = Ie;
Ie.default = Ie;
Ie.rebuild = (t) => {
  t.type === "atrule" ? Object.setPrototypeOf(t, yi.prototype) : t.type === "rule" ? Object.setPrototypeOf(t, gi.prototype) : t.type === "decl" ? Object.setPrototypeOf(t, _l.prototype) : t.type === "comment" ? Object.setPrototypeOf(t, xl.prototype) : t.type === "root" && Object.setPrototypeOf(t, kl.prototype), t[vl] = !0, t.nodes && t.nodes.forEach((e) => {
    Ie.rebuild(e);
  });
};
let Z9 = Et, Ol, El;
class fn extends Z9 {
  constructor(e) {
    super({ type: "document", ...e }), this.nodes || (this.nodes = []);
  }
  toResult(e = {}) {
    return new Ol(new El(), this, e).stringify();
  }
}
fn.registerLazyResult = (t) => {
  Ol = t;
};
fn.registerProcessor = (t) => {
  El = t;
};
var bi = fn;
fn.default = fn;
let ho = {};
var Al = function(e) {
  ho[e] || (ho[e] = !0, typeof console < "u" && console.warn && console.warn(e));
};
class Ar {
  constructor(e, n = {}) {
    if (this.type = "warning", this.text = e, n.node && n.node.source) {
      let s = n.node.rangeBy(n);
      this.line = s.start.line, this.column = s.start.column, this.endLine = s.end.line, this.endColumn = s.end.column;
    }
    for (let s in n)
      this[s] = n[s];
  }
  toString() {
    return this.node ? this.node.error(this.text, {
      plugin: this.plugin,
      index: this.index,
      word: this.word
    }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
  }
}
var Cl = Ar;
Ar.default = Ar;
let Q9 = Cl;
class Cr {
  constructor(e, n, s) {
    this.processor = e, this.messages = [], this.root = n, this.opts = s, this.css = void 0, this.map = void 0;
  }
  toString() {
    return this.css;
  }
  warn(e, n = {}) {
    n.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (n.plugin = this.lastPlugin.postcssPlugin);
    let s = new Q9(e, n);
    return this.messages.push(s), s;
  }
  warnings() {
    return this.messages.filter((e) => e.type === "warning");
  }
  get content() {
    return this.css;
  }
}
var wi = Cr;
Cr.default = Cr;
const rr = "'".charCodeAt(0), po = '"'.charCodeAt(0), Nn = "\\".charCodeAt(0), mo = "/".charCodeAt(0), qn = `
`.charCodeAt(0), Xt = " ".charCodeAt(0), In = "\f".charCodeAt(0), Un = "	".charCodeAt(0), jn = "\r".charCodeAt(0), J9 = "[".charCodeAt(0), X9 = "]".charCodeAt(0), K9 = "(".charCodeAt(0), eZ = ")".charCodeAt(0), tZ = "{".charCodeAt(0), nZ = "}".charCodeAt(0), sZ = ";".charCodeAt(0), rZ = "*".charCodeAt(0), iZ = ":".charCodeAt(0), oZ = "@".charCodeAt(0), Yn = /[\t\n\f\r "#'()/;[\\\]{}]/g, Fn = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, aZ = /.[\n"'(/\\]/, go = /[\da-f]/i;
var lZ = function(e, n = {}) {
  let s = e.css.valueOf(), r = n.ignoreErrors, i, o, a, l, c, u, f, d, h, y, b = s.length, m = 0, k = [], P = [];
  function te() {
    return m;
  }
  function q(oe) {
    throw e.error("Unclosed " + oe, m);
  }
  function Q() {
    return P.length === 0 && m >= b;
  }
  function J(oe) {
    if (P.length)
      return P.pop();
    if (m >= b)
      return;
    let ge = oe ? oe.ignoreUnclosed : !1;
    switch (i = s.charCodeAt(m), i) {
      case qn:
      case Xt:
      case Un:
      case jn:
      case In: {
        o = m;
        do
          o += 1, i = s.charCodeAt(o);
        while (i === Xt || i === qn || i === Un || i === jn || i === In);
        y = ["space", s.slice(m, o)], m = o - 1;
        break;
      }
      case J9:
      case X9:
      case tZ:
      case nZ:
      case iZ:
      case sZ:
      case eZ: {
        let Re = String.fromCharCode(i);
        y = [Re, Re, m];
        break;
      }
      case K9: {
        if (d = k.length ? k.pop()[1] : "", h = s.charCodeAt(m + 1), d === "url" && h !== rr && h !== po && h !== Xt && h !== qn && h !== Un && h !== In && h !== jn) {
          o = m;
          do {
            if (u = !1, o = s.indexOf(")", o + 1), o === -1)
              if (r || ge) {
                o = m;
                break;
              } else
                q("bracket");
            for (f = o; s.charCodeAt(f - 1) === Nn; )
              f -= 1, u = !u;
          } while (u);
          y = ["brackets", s.slice(m, o + 1), m, o], m = o;
        } else
          o = s.indexOf(")", m + 1), l = s.slice(m, o + 1), o === -1 || aZ.test(l) ? y = ["(", "(", m] : (y = ["brackets", l, m, o], m = o);
        break;
      }
      case rr:
      case po: {
        a = i === rr ? "'" : '"', o = m;
        do {
          if (u = !1, o = s.indexOf(a, o + 1), o === -1)
            if (r || ge) {
              o = m + 1;
              break;
            } else
              q("string");
          for (f = o; s.charCodeAt(f - 1) === Nn; )
            f -= 1, u = !u;
        } while (u);
        y = ["string", s.slice(m, o + 1), m, o], m = o;
        break;
      }
      case oZ: {
        Yn.lastIndex = m + 1, Yn.test(s), Yn.lastIndex === 0 ? o = s.length - 1 : o = Yn.lastIndex - 2, y = ["at-word", s.slice(m, o + 1), m, o], m = o;
        break;
      }
      case Nn: {
        for (o = m, c = !0; s.charCodeAt(o + 1) === Nn; )
          o += 1, c = !c;
        if (i = s.charCodeAt(o + 1), c && i !== mo && i !== Xt && i !== qn && i !== Un && i !== jn && i !== In && (o += 1, go.test(s.charAt(o)))) {
          for (; go.test(s.charAt(o + 1)); )
            o += 1;
          s.charCodeAt(o + 1) === Xt && (o += 1);
        }
        y = ["word", s.slice(m, o + 1), m, o], m = o;
        break;
      }
      default: {
        i === mo && s.charCodeAt(m + 1) === rZ ? (o = s.indexOf("*/", m + 2) + 1, o === 0 && (r || ge ? o = s.length : q("comment")), y = ["comment", s.slice(m, o + 1), m, o], m = o) : (Fn.lastIndex = m + 1, Fn.test(s), Fn.lastIndex === 0 ? o = s.length - 1 : o = Fn.lastIndex - 2, y = ["word", s.slice(m, o + 1), m, o], k.push(y), m = o);
        break;
      }
    }
    return m++, y;
  }
  function ie(oe) {
    P.push(oe);
  }
  return {
    back: ie,
    nextToken: J,
    endOfFile: Q,
    position: te
  };
};
let Ml = Et;
class fs extends Ml {
  constructor(e) {
    super(e), this.type = "atrule";
  }
  append(...e) {
    return this.proxyOf.nodes || (this.nodes = []), super.append(...e);
  }
  prepend(...e) {
    return this.proxyOf.nodes || (this.nodes = []), super.prepend(...e);
  }
}
var vi = fs;
fs.default = fs;
Ml.registerAtRule(fs);
let Pl = Et, Rl, $l;
class Ft extends Pl {
  constructor(e) {
    super(e), this.type = "root", this.nodes || (this.nodes = []);
  }
  removeChild(e, n) {
    let s = this.index(e);
    return !n && s === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[s].raws.before), super.removeChild(e);
  }
  normalize(e, n, s) {
    let r = super.normalize(e);
    if (n) {
      if (s === "prepend")
        this.nodes.length > 1 ? n.raws.before = this.nodes[1].raws.before : delete n.raws.before;
      else if (this.first !== n)
        for (let i of r)
          i.raws.before = n.raws.before;
    }
    return r;
  }
  toResult(e = {}) {
    return new Rl(new $l(), this, e).stringify();
  }
}
Ft.registerLazyResult = (t) => {
  Rl = t;
};
Ft.registerProcessor = (t) => {
  $l = t;
};
var On = Ft;
Ft.default = Ft;
Pl.registerRoot(Ft);
let hn = {
  split(t, e, n) {
    let s = [], r = "", i = !1, o = 0, a = !1, l = "", c = !1;
    for (let u of t)
      c ? c = !1 : u === "\\" ? c = !0 : a ? u === l && (a = !1) : u === '"' || u === "'" ? (a = !0, l = u) : u === "(" ? o += 1 : u === ")" ? o > 0 && (o -= 1) : o === 0 && e.includes(u) && (i = !0), i ? (r !== "" && s.push(r.trim()), r = "", i = !1) : r += u;
    return (n || r !== "") && s.push(r.trim()), s;
  },
  space(t) {
    let e = [" ", `
`, "	"];
    return hn.split(t, e);
  },
  comma(t) {
    return hn.split(t, [","], !0);
  }
};
var Ll = hn;
hn.default = hn;
let Nl = Et, cZ = Ll;
class hs extends Nl {
  constructor(e) {
    super(e), this.type = "rule", this.nodes || (this.nodes = []);
  }
  get selectors() {
    return cZ.comma(this.selector);
  }
  set selectors(e) {
    let n = this.selector ? this.selector.match(/,\s*/) : null, s = n ? n[0] : "," + this.raw("between", "beforeOpen");
    this.selector = e.join(s);
  }
}
var _i = hs;
hs.default = hs;
Nl.registerRule(hs);
let uZ = Ys, fZ = lZ, hZ = zs, dZ = vi, pZ = On, yo = _i;
const bo = {
  empty: !0,
  space: !0
};
function mZ(t) {
  for (let e = t.length - 1; e >= 0; e--) {
    let n = t[e], s = n[3] || n[2];
    if (s)
      return s;
  }
}
class gZ {
  constructor(e) {
    this.input = e, this.root = new pZ(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.customProperty = !1, this.createTokenizer(), this.root.source = { input: e, start: { offset: 0, line: 1, column: 1 } };
  }
  createTokenizer() {
    this.tokenizer = fZ(this.input);
  }
  parse() {
    let e;
    for (; !this.tokenizer.endOfFile(); )
      switch (e = this.tokenizer.nextToken(), e[0]) {
        case "space":
          this.spaces += e[1];
          break;
        case ";":
          this.freeSemicolon(e);
          break;
        case "}":
          this.end(e);
          break;
        case "comment":
          this.comment(e);
          break;
        case "at-word":
          this.atrule(e);
          break;
        case "{":
          this.emptyRule(e);
          break;
        default:
          this.other(e);
          break;
      }
    this.endFile();
  }
  comment(e) {
    let n = new hZ();
    this.init(n, e[2]), n.source.end = this.getPosition(e[3] || e[2]);
    let s = e[1].slice(2, -2);
    if (/^\s*$/.test(s))
      n.text = "", n.raws.left = s, n.raws.right = "";
    else {
      let r = s.match(/^(\s*)([^]*\S)(\s*)$/);
      n.text = r[2], n.raws.left = r[1], n.raws.right = r[3];
    }
  }
  emptyRule(e) {
    let n = new yo();
    this.init(n, e[2]), n.selector = "", n.raws.between = "", this.current = n;
  }
  other(e) {
    let n = !1, s = null, r = !1, i = null, o = [], a = e[1].startsWith("--"), l = [], c = e;
    for (; c; ) {
      if (s = c[0], l.push(c), s === "(" || s === "[")
        i || (i = c), o.push(s === "(" ? ")" : "]");
      else if (a && r && s === "{")
        i || (i = c), o.push("}");
      else if (o.length === 0)
        if (s === ";")
          if (r) {
            this.decl(l, a);
            return;
          } else
            break;
        else if (s === "{") {
          this.rule(l);
          return;
        } else if (s === "}") {
          this.tokenizer.back(l.pop()), n = !0;
          break;
        } else
          s === ":" && (r = !0);
      else
        s === o[o.length - 1] && (o.pop(), o.length === 0 && (i = null));
      c = this.tokenizer.nextToken();
    }
    if (this.tokenizer.endOfFile() && (n = !0), o.length > 0 && this.unclosedBracket(i), n && r) {
      if (!a)
        for (; l.length && (c = l[l.length - 1][0], !(c !== "space" && c !== "comment")); )
          this.tokenizer.back(l.pop());
      this.decl(l, a);
    } else
      this.unknownWord(l);
  }
  rule(e) {
    e.pop();
    let n = new yo();
    this.init(n, e[0][2]), n.raws.between = this.spacesAndCommentsFromEnd(e), this.raw(n, "selector", e), this.current = n;
  }
  decl(e, n) {
    let s = new uZ();
    this.init(s, e[0][2]);
    let r = e[e.length - 1];
    for (r[0] === ";" && (this.semicolon = !0, e.pop()), s.source.end = this.getPosition(
      r[3] || r[2] || mZ(e)
    ); e[0][0] !== "word"; )
      e.length === 1 && this.unknownWord(e), s.raws.before += e.shift()[1];
    for (s.source.start = this.getPosition(e[0][2]), s.prop = ""; e.length; ) {
      let c = e[0][0];
      if (c === ":" || c === "space" || c === "comment")
        break;
      s.prop += e.shift()[1];
    }
    s.raws.between = "";
    let i;
    for (; e.length; )
      if (i = e.shift(), i[0] === ":") {
        s.raws.between += i[1];
        break;
      } else
        i[0] === "word" && /\w/.test(i[1]) && this.unknownWord([i]), s.raws.between += i[1];
    (s.prop[0] === "_" || s.prop[0] === "*") && (s.raws.before += s.prop[0], s.prop = s.prop.slice(1));
    let o = [], a;
    for (; e.length && (a = e[0][0], !(a !== "space" && a !== "comment")); )
      o.push(e.shift());
    this.precheckMissedSemicolon(e);
    for (let c = e.length - 1; c >= 0; c--) {
      if (i = e[c], i[1].toLowerCase() === "!important") {
        s.important = !0;
        let u = this.stringFrom(e, c);
        u = this.spacesFromEnd(e) + u, u !== " !important" && (s.raws.important = u);
        break;
      } else if (i[1].toLowerCase() === "important") {
        let u = e.slice(0), f = "";
        for (let d = c; d > 0; d--) {
          let h = u[d][0];
          if (f.trim().indexOf("!") === 0 && h !== "space")
            break;
          f = u.pop()[1] + f;
        }
        f.trim().indexOf("!") === 0 && (s.important = !0, s.raws.important = f, e = u);
      }
      if (i[0] !== "space" && i[0] !== "comment")
        break;
    }
    e.some((c) => c[0] !== "space" && c[0] !== "comment") && (s.raws.between += o.map((c) => c[1]).join(""), o = []), this.raw(s, "value", o.concat(e), n), s.value.includes(":") && !n && this.checkMissedSemicolon(e);
  }
  atrule(e) {
    let n = new dZ();
    n.name = e[1].slice(1), n.name === "" && this.unnamedAtrule(n, e), this.init(n, e[2]);
    let s, r, i, o = !1, a = !1, l = [], c = [];
    for (; !this.tokenizer.endOfFile(); ) {
      if (e = this.tokenizer.nextToken(), s = e[0], s === "(" || s === "[" ? c.push(s === "(" ? ")" : "]") : s === "{" && c.length > 0 ? c.push("}") : s === c[c.length - 1] && c.pop(), c.length === 0)
        if (s === ";") {
          n.source.end = this.getPosition(e[2]), this.semicolon = !0;
          break;
        } else if (s === "{") {
          a = !0;
          break;
        } else if (s === "}") {
          if (l.length > 0) {
            for (i = l.length - 1, r = l[i]; r && r[0] === "space"; )
              r = l[--i];
            r && (n.source.end = this.getPosition(r[3] || r[2]));
          }
          this.end(e);
          break;
        } else
          l.push(e);
      else
        l.push(e);
      if (this.tokenizer.endOfFile()) {
        o = !0;
        break;
      }
    }
    n.raws.between = this.spacesAndCommentsFromEnd(l), l.length ? (n.raws.afterName = this.spacesAndCommentsFromStart(l), this.raw(n, "params", l), o && (e = l[l.length - 1], n.source.end = this.getPosition(e[3] || e[2]), this.spaces = n.raws.between, n.raws.between = "")) : (n.raws.afterName = "", n.params = ""), a && (n.nodes = [], this.current = n);
  }
  end(e) {
    this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(e[2]), this.current = this.current.parent) : this.unexpectedClose(e);
  }
  endFile() {
    this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces;
  }
  freeSemicolon(e) {
    if (this.spaces += e[1], this.current.nodes) {
      let n = this.current.nodes[this.current.nodes.length - 1];
      n && n.type === "rule" && !n.raws.ownSemicolon && (n.raws.ownSemicolon = this.spaces, this.spaces = "");
    }
  }
  getPosition(e) {
    let n = this.input.fromOffset(e);
    return {
      offset: e,
      line: n.line,
      column: n.col
    };
  }
  init(e, n) {
    this.current.push(e), e.source = {
      start: this.getPosition(n),
      input: this.input
    }, e.raws.before = this.spaces, this.spaces = "", e.type !== "comment" && (this.semicolon = !1);
  }
  raw(e, n, s, r) {
    let i, o, a = s.length, l = "", c = !0, u, f;
    for (let d = 0; d < a; d += 1)
      i = s[d], o = i[0], o === "space" && d === a - 1 && !r ? c = !1 : o === "comment" ? (f = s[d - 1] ? s[d - 1][0] : "empty", u = s[d + 1] ? s[d + 1][0] : "empty", !bo[f] && !bo[u] ? l.slice(-1) === "," ? c = !1 : l += i[1] : c = !1) : l += i[1];
    if (!c) {
      let d = s.reduce((h, y) => h + y[1], "");
      e.raws[n] = { value: l, raw: d };
    }
    e[n] = l;
  }
  spacesAndCommentsFromEnd(e) {
    let n, s = "";
    for (; e.length && (n = e[e.length - 1][0], !(n !== "space" && n !== "comment")); )
      s = e.pop()[1] + s;
    return s;
  }
  spacesAndCommentsFromStart(e) {
    let n, s = "";
    for (; e.length && (n = e[0][0], !(n !== "space" && n !== "comment")); )
      s += e.shift()[1];
    return s;
  }
  spacesFromEnd(e) {
    let n, s = "";
    for (; e.length && (n = e[e.length - 1][0], n === "space"); )
      s = e.pop()[1] + s;
    return s;
  }
  stringFrom(e, n) {
    let s = "";
    for (let r = n; r < e.length; r++)
      s += e[r][1];
    return e.splice(n, e.length - n), s;
  }
  colon(e) {
    let n = 0, s, r, i;
    for (let [o, a] of e.entries()) {
      if (s = a, r = s[0], r === "(" && (n += 1), r === ")" && (n -= 1), n === 0 && r === ":")
        if (!i)
          this.doubleColon(s);
        else {
          if (i[0] === "word" && i[1] === "progid")
            continue;
          return o;
        }
      i = s;
    }
    return !1;
  }
  unclosedBracket(e) {
    throw this.input.error(
      "Unclosed bracket",
      { offset: e[2] },
      { offset: e[2] + 1 }
    );
  }
  unknownWord(e) {
    throw this.input.error(
      "Unknown word",
      { offset: e[0][2] },
      { offset: e[0][2] + e[0][1].length }
    );
  }
  unexpectedClose(e) {
    throw this.input.error(
      "Unexpected }",
      { offset: e[2] },
      { offset: e[2] + 1 }
    );
  }
  unclosedBlock() {
    let e = this.current.source.start;
    throw this.input.error("Unclosed block", e.line, e.column);
  }
  doubleColon(e) {
    throw this.input.error(
      "Double colon",
      { offset: e[2] },
      { offset: e[2] + e[1].length }
    );
  }
  unnamedAtrule(e, n) {
    throw this.input.error(
      "At-rule without name",
      { offset: n[2] },
      { offset: n[2] + n[1].length }
    );
  }
  precheckMissedSemicolon() {
  }
  checkMissedSemicolon(e) {
    let n = this.colon(e);
    if (n === !1)
      return;
    let s = 0, r;
    for (let i = n - 1; i >= 0 && (r = e[i], !(r[0] !== "space" && (s += 1, s === 2))); i--)
      ;
    throw this.input.error(
      "Missed semicolon",
      r[0] === "word" ? r[3] + 1 : r[2]
    );
  }
}
var yZ = gZ;
let bZ = Et, wZ = yZ, vZ = Fs;
function ds(t, e) {
  let n = new vZ(t, e), s = new wZ(n);
  try {
    s.parse();
  } catch (r) {
    throw process.env.NODE_ENV !== "production" && r.name === "CssSyntaxError" && e && e.from && (/\.scss$/i.test(e.from) ? r.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(e.from) ? r.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(e.from) && (r.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), r;
  }
  return s.root;
}
var xi = ds;
ds.default = ds;
bZ.registerParse(ds);
let { isClean: ze, my: _Z } = Dn, xZ = bl, SZ = Us, kZ = Et, TZ = bi, DZ = Al, wo = wi, OZ = xi, EZ = On;
const AZ = {
  document: "Document",
  root: "Root",
  atrule: "AtRule",
  rule: "Rule",
  decl: "Declaration",
  comment: "Comment"
}, CZ = {
  postcssPlugin: !0,
  prepare: !0,
  Once: !0,
  Document: !0,
  Root: !0,
  Declaration: !0,
  Rule: !0,
  AtRule: !0,
  Comment: !0,
  DeclarationExit: !0,
  RuleExit: !0,
  AtRuleExit: !0,
  CommentExit: !0,
  RootExit: !0,
  DocumentExit: !0,
  OnceExit: !0
}, MZ = {
  postcssPlugin: !0,
  prepare: !0,
  Once: !0
}, zt = 0;
function Kt(t) {
  return typeof t == "object" && typeof t.then == "function";
}
function ql(t) {
  let e = !1, n = AZ[t.type];
  return t.type === "decl" ? e = t.prop.toLowerCase() : t.type === "atrule" && (e = t.name.toLowerCase()), e && t.append ? [
    n,
    n + "-" + e,
    zt,
    n + "Exit",
    n + "Exit-" + e
  ] : e ? [n, n + "-" + e, n + "Exit", n + "Exit-" + e] : t.append ? [n, zt, n + "Exit"] : [n, n + "Exit"];
}
function vo(t) {
  let e;
  return t.type === "document" ? e = ["Document", zt, "DocumentExit"] : t.type === "root" ? e = ["Root", zt, "RootExit"] : e = ql(t), {
    node: t,
    events: e,
    eventIndex: 0,
    visitors: [],
    visitorIndex: 0,
    iterator: 0
  };
}
function Mr(t) {
  return t[ze] = !1, t.nodes && t.nodes.forEach((e) => Mr(e)), t;
}
let Pr = {};
class yt {
  constructor(e, n, s) {
    this.stringified = !1, this.processed = !1;
    let r;
    if (typeof n == "object" && n !== null && (n.type === "root" || n.type === "document"))
      r = Mr(n);
    else if (n instanceof yt || n instanceof wo)
      r = Mr(n.root), n.map && (typeof s.map > "u" && (s.map = {}), s.map.inline || (s.map.inline = !1), s.map.prev = n.map);
    else {
      let i = OZ;
      s.syntax && (i = s.syntax.parse), s.parser && (i = s.parser), i.parse && (i = i.parse);
      try {
        r = i(n, s);
      } catch (o) {
        this.processed = !0, this.error = o;
      }
      r && !r[_Z] && kZ.rebuild(r);
    }
    this.result = new wo(e, r, s), this.helpers = { ...Pr, result: this.result, postcss: Pr }, this.plugins = this.processor.plugins.map((i) => typeof i == "object" && i.prepare ? { ...i, ...i.prepare(this.result) } : i);
  }
  get [Symbol.toStringTag]() {
    return "LazyResult";
  }
  get processor() {
    return this.result.processor;
  }
  get opts() {
    return this.result.opts;
  }
  get css() {
    return this.stringify().css;
  }
  get content() {
    return this.stringify().content;
  }
  get map() {
    return this.stringify().map;
  }
  get root() {
    return this.sync().root;
  }
  get messages() {
    return this.sync().messages;
  }
  warnings() {
    return this.sync().warnings();
  }
  toString() {
    return this.css;
  }
  then(e, n) {
    return process.env.NODE_ENV !== "production" && ("from" in this.opts || DZ(
      "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
    )), this.async().then(e, n);
  }
  catch(e) {
    return this.async().catch(e);
  }
  finally(e) {
    return this.async().then(e, e);
  }
  async() {
    return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
  }
  sync() {
    if (this.error)
      throw this.error;
    if (this.processed)
      return this.result;
    if (this.processed = !0, this.processing)
      throw this.getAsyncError();
    for (let e of this.plugins) {
      let n = this.runOnRoot(e);
      if (Kt(n))
        throw this.getAsyncError();
    }
    if (this.prepareVisitors(), this.hasListener) {
      let e = this.result.root;
      for (; !e[ze]; )
        e[ze] = !0, this.walkSync(e);
      if (this.listeners.OnceExit)
        if (e.type === "document")
          for (let n of e.nodes)
            this.visitSync(this.listeners.OnceExit, n);
        else
          this.visitSync(this.listeners.OnceExit, e);
    }
    return this.result;
  }
  stringify() {
    if (this.error)
      throw this.error;
    if (this.stringified)
      return this.result;
    this.stringified = !0, this.sync();
    let e = this.result.opts, n = SZ;
    e.syntax && (n = e.syntax.stringify), e.stringifier && (n = e.stringifier), n.stringify && (n = n.stringify);
    let r = new xZ(n, this.result.root, this.result.opts).generate();
    return this.result.css = r[0], this.result.map = r[1], this.result;
  }
  walkSync(e) {
    e[ze] = !0;
    let n = ql(e);
    for (let s of n)
      if (s === zt)
        e.nodes && e.each((r) => {
          r[ze] || this.walkSync(r);
        });
      else {
        let r = this.listeners[s];
        if (r && this.visitSync(r, e.toProxy()))
          return;
      }
  }
  visitSync(e, n) {
    for (let [s, r] of e) {
      this.result.lastPlugin = s;
      let i;
      try {
        i = r(n, this.helpers);
      } catch (o) {
        throw this.handleError(o, n.proxyOf);
      }
      if (n.type !== "root" && n.type !== "document" && !n.parent)
        return !0;
      if (Kt(i))
        throw this.getAsyncError();
    }
  }
  runOnRoot(e) {
    this.result.lastPlugin = e;
    try {
      if (typeof e == "object" && e.Once) {
        if (this.result.root.type === "document") {
          let n = this.result.root.nodes.map(
            (s) => e.Once(s, this.helpers)
          );
          return Kt(n[0]) ? Promise.all(n) : n;
        }
        return e.Once(this.result.root, this.helpers);
      } else if (typeof e == "function")
        return e(this.result.root, this.result);
    } catch (n) {
      throw this.handleError(n);
    }
  }
  getAsyncError() {
    throw new Error("Use process(css).then(cb) to work with async plugins");
  }
  handleError(e, n) {
    let s = this.result.lastPlugin;
    try {
      if (n && n.addToError(e), this.error = e, e.name === "CssSyntaxError" && !e.plugin)
        e.plugin = s.postcssPlugin, e.setMessage();
      else if (s.postcssVersion && process.env.NODE_ENV !== "production") {
        let r = s.postcssPlugin, i = s.postcssVersion, o = this.result.processor.version, a = i.split("."), l = o.split(".");
        (a[0] !== l[0] || parseInt(a[1]) > parseInt(l[1])) && console.error(
          "Unknown error from PostCSS plugin. Your current PostCSS version is " + o + ", but " + r + " uses " + i + ". Perhaps this is the source of the error below."
        );
      }
    } catch (r) {
      console && console.error && console.error(r);
    }
    return e;
  }
  async runAsync() {
    this.plugin = 0;
    for (let e = 0; e < this.plugins.length; e++) {
      let n = this.plugins[e], s = this.runOnRoot(n);
      if (Kt(s))
        try {
          await s;
        } catch (r) {
          throw this.handleError(r);
        }
    }
    if (this.prepareVisitors(), this.hasListener) {
      let e = this.result.root;
      for (; !e[ze]; ) {
        e[ze] = !0;
        let n = [vo(e)];
        for (; n.length > 0; ) {
          let s = this.visitTick(n);
          if (Kt(s))
            try {
              await s;
            } catch (r) {
              let i = n[n.length - 1].node;
              throw this.handleError(r, i);
            }
        }
      }
      if (this.listeners.OnceExit)
        for (let [n, s] of this.listeners.OnceExit) {
          this.result.lastPlugin = n;
          try {
            if (e.type === "document") {
              let r = e.nodes.map(
                (i) => s(i, this.helpers)
              );
              await Promise.all(r);
            } else
              await s(e, this.helpers);
          } catch (r) {
            throw this.handleError(r);
          }
        }
    }
    return this.processed = !0, this.stringify();
  }
  prepareVisitors() {
    this.listeners = {};
    let e = (n, s, r) => {
      this.listeners[s] || (this.listeners[s] = []), this.listeners[s].push([n, r]);
    };
    for (let n of this.plugins)
      if (typeof n == "object")
        for (let s in n) {
          if (!CZ[s] && /^[A-Z]/.test(s))
            throw new Error(
              `Unknown event ${s} in ${n.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
            );
          if (!MZ[s])
            if (typeof n[s] == "object")
              for (let r in n[s])
                r === "*" ? e(n, s, n[s][r]) : e(
                  n,
                  s + "-" + r.toLowerCase(),
                  n[s][r]
                );
            else
              typeof n[s] == "function" && e(n, s, n[s]);
        }
    this.hasListener = Object.keys(this.listeners).length > 0;
  }
  visitTick(e) {
    let n = e[e.length - 1], { node: s, visitors: r } = n;
    if (s.type !== "root" && s.type !== "document" && !s.parent) {
      e.pop();
      return;
    }
    if (r.length > 0 && n.visitorIndex < r.length) {
      let [o, a] = r[n.visitorIndex];
      n.visitorIndex += 1, n.visitorIndex === r.length && (n.visitors = [], n.visitorIndex = 0), this.result.lastPlugin = o;
      try {
        return a(s.toProxy(), this.helpers);
      } catch (l) {
        throw this.handleError(l, s);
      }
    }
    if (n.iterator !== 0) {
      let o = n.iterator, a;
      for (; a = s.nodes[s.indexes[o]]; )
        if (s.indexes[o] += 1, !a[ze]) {
          a[ze] = !0, e.push(vo(a));
          return;
        }
      n.iterator = 0, delete s.indexes[o];
    }
    let i = n.events;
    for (; n.eventIndex < i.length; ) {
      let o = i[n.eventIndex];
      if (n.eventIndex += 1, o === zt) {
        s.nodes && s.nodes.length && (s[ze] = !0, n.iterator = s.getIterator());
        return;
      } else if (this.listeners[o]) {
        n.visitors = this.listeners[o];
        return;
      }
    }
    e.pop();
  }
}
yt.registerPostcss = (t) => {
  Pr = t;
};
var Il = yt;
yt.default = yt;
EZ.registerLazyResult(yt);
TZ.registerLazyResult(yt);
let PZ = bl, RZ = Us, $Z = Al, LZ = xi;
const NZ = wi;
class Rr {
  constructor(e, n, s) {
    n = n.toString(), this.stringified = !1, this._processor = e, this._css = n, this._opts = s, this._map = void 0;
    let r, i = RZ;
    this.result = new NZ(this._processor, r, this._opts), this.result.css = n;
    let o = this;
    Object.defineProperty(this.result, "root", {
      get() {
        return o.root;
      }
    });
    let a = new PZ(i, r, this._opts, n);
    if (a.isMap()) {
      let [l, c] = a.generate();
      l && (this.result.css = l), c && (this.result.map = c);
    }
  }
  get [Symbol.toStringTag]() {
    return "NoWorkResult";
  }
  get processor() {
    return this.result.processor;
  }
  get opts() {
    return this.result.opts;
  }
  get css() {
    return this.result.css;
  }
  get content() {
    return this.result.css;
  }
  get map() {
    return this.result.map;
  }
  get root() {
    if (this._root)
      return this._root;
    let e, n = LZ;
    try {
      e = n(this._css, this._opts);
    } catch (s) {
      this.error = s;
    }
    if (this.error)
      throw this.error;
    return this._root = e, e;
  }
  get messages() {
    return [];
  }
  warnings() {
    return [];
  }
  toString() {
    return this._css;
  }
  then(e, n) {
    return process.env.NODE_ENV !== "production" && ("from" in this._opts || $Z(
      "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
    )), this.async().then(e, n);
  }
  catch(e) {
    return this.async().catch(e);
  }
  finally(e) {
    return this.async().then(e, e);
  }
  async() {
    return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
  }
  sync() {
    if (this.error)
      throw this.error;
    return this.result;
  }
}
var qZ = Rr;
Rr.default = Rr;
let IZ = qZ, UZ = Il, jZ = bi, YZ = On;
class dn {
  constructor(e = []) {
    this.version = "8.4.19", this.plugins = this.normalize(e);
  }
  use(e) {
    return this.plugins = this.plugins.concat(this.normalize([e])), this;
  }
  process(e, n = {}) {
    return this.plugins.length === 0 && typeof n.parser > "u" && typeof n.stringifier > "u" && typeof n.syntax > "u" ? new IZ(this, e, n) : new UZ(this, e, n);
  }
  normalize(e) {
    let n = [];
    for (let s of e)
      if (s.postcss === !0 ? s = s() : s.postcss && (s = s.postcss), typeof s == "object" && Array.isArray(s.plugins))
        n = n.concat(s.plugins);
      else if (typeof s == "object" && s.postcssPlugin)
        n.push(s);
      else if (typeof s == "function")
        n.push(s);
      else if (typeof s == "object" && (s.parse || s.stringify)) {
        if (process.env.NODE_ENV !== "production")
          throw new Error(
            "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
          );
      } else
        throw new Error(s + " is not a PostCSS plugin");
    return n;
  }
}
var FZ = dn;
dn.default = dn;
YZ.registerProcessor(dn);
jZ.registerProcessor(dn);
let zZ = Ys, BZ = dl, HZ = zs, VZ = vi, WZ = Fs, GZ = On, ZZ = _i;
function pn(t, e) {
  if (Array.isArray(t))
    return t.map((r) => pn(r));
  let { inputs: n, ...s } = t;
  if (n) {
    e = [];
    for (let r of n) {
      let i = { ...r, __proto__: WZ.prototype };
      i.map && (i.map = {
        ...i.map,
        __proto__: BZ.prototype
      }), e.push(i);
    }
  }
  if (s.nodes && (s.nodes = t.nodes.map((r) => pn(r, e))), s.source) {
    let { inputId: r, ...i } = s.source;
    s.source = i, r != null && (s.source.input = e[r]);
  }
  if (s.type === "root")
    return new GZ(s);
  if (s.type === "decl")
    return new zZ(s);
  if (s.type === "rule")
    return new ZZ(s);
  if (s.type === "comment")
    return new HZ(s);
  if (s.type === "atrule")
    return new VZ(s);
  throw new Error("Unknown node type: " + t.type);
}
var QZ = pn;
pn.default = pn;
let JZ = mi, Ul = Ys, XZ = Il, KZ = Et, Si = FZ, e7 = Us, t7 = QZ, jl = bi, n7 = Cl, Yl = zs, Fl = vi, s7 = wi, r7 = Fs, i7 = xi, o7 = Ll, zl = _i, Bl = On, a7 = js;
function z(...t) {
  return t.length === 1 && Array.isArray(t[0]) && (t = t[0]), new Si(t);
}
z.plugin = function(e, n) {
  let s = !1;
  function r(...o) {
    console && console.warn && !s && (s = !0, console.warn(
      e + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
    ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
      e + `: \u91CC\u9762 postcss.plugin \u88AB\u5F03\u7528. \u8FC1\u79FB\u6307\u5357:
https://www.w3ctech.com/topic/2226`
    ));
    let a = n(...o);
    return a.postcssPlugin = e, a.postcssVersion = new Si().version, a;
  }
  let i;
  return Object.defineProperty(r, "postcss", {
    get() {
      return i || (i = r()), i;
    }
  }), r.process = function(o, a, l) {
    return z([r(l)]).process(o, a);
  }, r;
};
z.stringify = e7;
z.parse = i7;
z.fromJSON = t7;
z.list = o7;
z.comment = (t) => new Yl(t);
z.atRule = (t) => new Fl(t);
z.decl = (t) => new Ul(t);
z.rule = (t) => new zl(t);
z.root = (t) => new Bl(t);
z.document = (t) => new jl(t);
z.CssSyntaxError = JZ;
z.Declaration = Ul;
z.Container = KZ;
z.Processor = Si;
z.Document = jl;
z.Comment = Yl;
z.Warning = n7;
z.AtRule = Fl;
z.Result = s7;
z.Input = r7;
z.Rule = zl;
z.Root = Bl;
z.Node = a7;
XZ.registerPostcss(z);
var l7 = z;
z.default = z;
const c7 = Da, _o = r9, { isPlainObject: u7 } = di, xo = w9, f7 = ul.exports, { parse: h7 } = l7, d7 = [
  "img",
  "audio",
  "video",
  "picture",
  "svg",
  "object",
  "map",
  "iframe",
  "embed"
], p7 = ["script", "style"];
function en(t, e) {
  t && Object.keys(t).forEach(function(n) {
    e(t[n], n);
  });
}
function Ke(t, e) {
  return {}.hasOwnProperty.call(t, e);
}
function So(t, e) {
  const n = [];
  return en(t, function(s) {
    e(s) && n.push(s);
  }), n;
}
function m7(t) {
  for (const e in t)
    if (Ke(t, e))
      return !1;
  return !0;
}
function g7(t) {
  return t.map(function(e) {
    if (!e.url)
      throw new Error("URL missing");
    return e.url + (e.w ? ` ${e.w}w` : "") + (e.h ? ` ${e.h}h` : "") + (e.d ? ` ${e.d}x` : "");
  }).join(", ");
}
var y7 = mn;
const b7 = /^[^\0\t\n\f\r /<=>]+$/;
function mn(t, e, n) {
  if (t == null)
    return "";
  let s = "", r = "";
  function i(p, v) {
    const _ = this;
    this.tag = p, this.attribs = v || {}, this.tagPosition = s.length, this.text = "", this.mediaChildren = [], this.updateParentNodeText = function() {
      if (b.length) {
        const R = b[b.length - 1];
        R.text += _.text;
      }
    }, this.updateParentNodeMediaChildren = function() {
      b.length && d7.includes(this.tag) && b[b.length - 1].mediaChildren.push(this.tag);
    };
  }
  e = Object.assign({}, mn.defaults, e), e.parser = Object.assign({}, w7, e.parser), p7.forEach(function(p) {
    e.allowedTags !== !1 && (e.allowedTags || []).indexOf(p) > -1 && !e.allowVulnerableTags && console.warn(`

\u26A0\uFE0F Your \`allowedTags\` option includes, \`${p}\`, which is inherently
vulnerable to XSS attacks. Please remove it from \`allowedTags\`.
Or, to disable this warning, add the \`allowVulnerableTags\` option
and ensure you are accounting for this risk.

`);
  });
  const o = e.nonTextTags || [
    "script",
    "style",
    "textarea",
    "option"
  ];
  let a, l;
  e.allowedAttributes && (a = {}, l = {}, en(e.allowedAttributes, function(p, v) {
    a[v] = [];
    const _ = [];
    p.forEach(function(R) {
      typeof R == "string" && R.indexOf("*") >= 0 ? _.push(_o(R).replace(/\\\*/g, ".*")) : a[v].push(R);
    }), _.length && (l[v] = new RegExp("^(" + _.join("|") + ")$"));
  }));
  const c = {}, u = {}, f = {};
  en(e.allowedClasses, function(p, v) {
    a && (Ke(a, v) || (a[v] = []), a[v].push("class")), c[v] = [], f[v] = [];
    const _ = [];
    p.forEach(function(R) {
      typeof R == "string" && R.indexOf("*") >= 0 ? _.push(_o(R).replace(/\\\*/g, ".*")) : R instanceof RegExp ? f[v].push(R) : c[v].push(R);
    }), _.length && (u[v] = new RegExp("^(" + _.join("|") + ")$"));
  });
  const d = {};
  let h;
  en(e.transformTags, function(p, v) {
    let _;
    typeof p == "function" ? _ = p : typeof p == "string" && (_ = mn.simpleTransform(p)), v === "*" ? h = _ : d[v] = _;
  });
  let y, b, m, k, P, te, q = !1;
  J();
  const Q = new c7.Parser({
    onopentag: function(p, v) {
      if (e.enforceHtmlBoundary && p === "html" && J(), P) {
        te++;
        return;
      }
      const _ = new i(p, v);
      b.push(_);
      let R = !1;
      const xe = !!_.text;
      let pe;
      if (Ke(d, p) && (pe = d[p](p, v), _.attribs = v = pe.attribs, pe.text !== void 0 && (_.innerText = pe.text), p !== pe.tagName && (_.name = p = pe.tagName, k[y] = pe.tagName)), h && (pe = h(p, v), _.attribs = v = pe.attribs, p !== pe.tagName && (_.name = p = pe.tagName, k[y] = pe.tagName)), (e.allowedTags !== !1 && (e.allowedTags || []).indexOf(p) === -1 || e.disallowedTagsMode === "recursiveEscape" && !m7(m) || e.nestingLimit != null && y >= e.nestingLimit) && (R = !0, m[y] = !0, e.disallowedTagsMode === "discard" && o.indexOf(p) !== -1 && (P = !0, te = 1), m[y] = !0), y++, R) {
        if (e.disallowedTagsMode === "discard")
          return;
        r = s, s = "";
      }
      s += "<" + p, p === "script" && (e.allowedScriptHostnames || e.allowedScriptDomains) && (_.innerText = ""), (!a || Ke(a, p) || a["*"]) && en(v, function(ne, X) {
        if (!b7.test(X)) {
          delete _.attribs[X];
          return;
        }
        let Vs = !1;
        if (!a || Ke(a, p) && a[p].indexOf(X) !== -1 || a["*"] && a["*"].indexOf(X) !== -1 || Ke(l, p) && l[p].test(X) || l["*"] && l["*"].test(X))
          Vs = !0;
        else if (a && a[p]) {
          for (const j of a[p])
            if (u7(j) && j.name && j.name === X) {
              Vs = !0;
              let Y = "";
              if (j.multiple === !0) {
                const bt = ne.split(" ");
                for (const Qe of bt)
                  j.values.indexOf(Qe) !== -1 && (Y === "" ? Y = Qe : Y += " " + Qe);
              } else
                j.values.indexOf(ne) >= 0 && (Y = ne);
              ne = Y;
            }
        }
        if (Vs) {
          if (e.allowedSchemesAppliedToAttributes.indexOf(X) !== -1 && oe(p, ne)) {
            delete _.attribs[X];
            return;
          }
          if (p === "script" && X === "src") {
            let j = !0;
            try {
              const Y = ge(ne);
              if (e.allowedScriptHostnames || e.allowedScriptDomains) {
                const bt = (e.allowedScriptHostnames || []).find(function($e) {
                  return $e === Y.url.hostname;
                }), Qe = (e.allowedScriptDomains || []).find(function($e) {
                  return Y.url.hostname === $e || Y.url.hostname.endsWith(`.${$e}`);
                });
                j = bt || Qe;
              }
            } catch {
              j = !1;
            }
            if (!j) {
              delete _.attribs[X];
              return;
            }
          }
          if (p === "iframe" && X === "src") {
            let j = !0;
            try {
              const Y = ge(ne);
              if (Y.isRelativeUrl)
                j = Ke(e, "allowIframeRelativeUrls") ? e.allowIframeRelativeUrls : !e.allowedIframeHostnames && !e.allowedIframeDomains;
              else if (e.allowedIframeHostnames || e.allowedIframeDomains) {
                const bt = (e.allowedIframeHostnames || []).find(function($e) {
                  return $e === Y.url.hostname;
                }), Qe = (e.allowedIframeDomains || []).find(function($e) {
                  return Y.url.hostname === $e || Y.url.hostname.endsWith(`.${$e}`);
                });
                j = bt || Qe;
              }
            } catch {
              j = !1;
            }
            if (!j) {
              delete _.attribs[X];
              return;
            }
          }
          if (X === "srcset")
            try {
              let j = f7(ne);
              if (j.forEach(function(Y) {
                oe("srcset", Y.url) && (Y.evil = !0);
              }), j = So(j, function(Y) {
                return !Y.evil;
              }), j.length)
                ne = g7(So(j, function(Y) {
                  return !Y.evil;
                })), _.attribs[X] = ne;
              else {
                delete _.attribs[X];
                return;
              }
            } catch {
              delete _.attribs[X];
              return;
            }
          if (X === "class") {
            const j = c[p], Y = c["*"], bt = u[p], Qe = f[p], $e = u["*"], Di = [
              bt,
              $e
            ].concat(Qe).filter(function(Xl) {
              return Xl;
            });
            if (j && Y ? ne = ht(ne, xo(j, Y), Di) : ne = ht(ne, j || Y, Di), !ne.length) {
              delete _.attribs[X];
              return;
            }
          }
          if (X === "style")
            try {
              const j = h7(p + " {" + ne + "}"), Y = Re(j, e.allowedStyles);
              if (ne = Ct(Y), ne.length === 0) {
                delete _.attribs[X];
                return;
              }
            } catch {
              delete _.attribs[X];
              return;
            }
          s += " " + X, ne && ne.length && (s += '="' + ie(ne, !0) + '"');
        } else
          delete _.attribs[X];
      }), e.selfClosing.indexOf(p) !== -1 ? s += " />" : (s += ">", _.innerText && !xe && !e.textFilter && (s += ie(_.innerText), q = !0)), R && (s = r + ie(s), r = "");
    },
    ontext: function(p) {
      if (P)
        return;
      const v = b[b.length - 1];
      let _;
      if (v && (_ = v.tag, p = v.innerText !== void 0 ? v.innerText : p), e.disallowedTagsMode === "discard" && (_ === "script" || _ === "style"))
        s += p;
      else {
        const R = ie(p, !1);
        e.textFilter && !q ? s += e.textFilter(R, _) : q || (s += R);
      }
      if (b.length) {
        const R = b[b.length - 1];
        R.text += p;
      }
    },
    onclosetag: function(p) {
      if (P)
        if (te--, !te)
          P = !1;
        else
          return;
      const v = b.pop();
      if (!v)
        return;
      if (v.tag !== p) {
        b.push(v);
        return;
      }
      P = e.enforceHtmlBoundary ? p === "html" : !1, y--;
      const _ = m[y];
      if (_) {
        if (delete m[y], e.disallowedTagsMode === "discard") {
          v.updateParentNodeText();
          return;
        }
        r = s, s = "";
      }
      if (k[y] && (p = k[y], delete k[y]), e.exclusiveFilter && e.exclusiveFilter(v)) {
        s = s.substr(0, v.tagPosition);
        return;
      }
      if (v.updateParentNodeMediaChildren(), v.updateParentNodeText(), e.selfClosing.indexOf(p) !== -1) {
        _ && (s = r, r = "");
        return;
      }
      s += "</" + p + ">", _ && (s = r + ie(s), r = ""), q = !1;
    }
  }, e.parser);
  return Q.write(t), Q.end(), s;
  function J() {
    s = "", y = 0, b = [], m = {}, k = {}, P = !1, te = 0;
  }
  function ie(p, v) {
    return typeof p != "string" && (p = p + ""), e.parser.decodeEntities && (p = p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), v && (p = p.replace(/"/g, "&quot;"))), p = p.replace(/&(?![a-zA-Z0-9#]{1,20};)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), v && (p = p.replace(/"/g, "&quot;")), p;
  }
  function oe(p, v) {
    for (v = v.replace(/[\x00-\x20]+/g, ""); ; ) {
      const xe = v.indexOf("<!--");
      if (xe === -1)
        break;
      const pe = v.indexOf("-->", xe + 4);
      if (pe === -1)
        break;
      v = v.substring(0, xe) + v.substring(pe + 3);
    }
    const _ = v.match(/^([a-zA-Z][a-zA-Z0-9.\-+]*):/);
    if (!_)
      return v.match(/^[/\\]{2}/) ? !e.allowProtocolRelative : !1;
    const R = _[1].toLowerCase();
    return Ke(e.allowedSchemesByTag, p) ? e.allowedSchemesByTag[p].indexOf(R) === -1 : !e.allowedSchemes || e.allowedSchemes.indexOf(R) === -1;
  }
  function ge(p) {
    if (p = p.replace(/^(\w+:)?\s*[\\/]\s*[\\/]/, "$1//"), p.startsWith("relative:"))
      throw new Error("relative: exploit attempt");
    let v = "relative://relative-site";
    for (let xe = 0; xe < 100; xe++)
      v += `/${xe}`;
    const _ = new URL(p, v);
    return {
      isRelativeUrl: _ && _.hostname === "relative-site" && _.protocol === "relative:",
      url: _
    };
  }
  function Re(p, v) {
    if (!v)
      return p;
    const _ = p.nodes[0];
    let R;
    return v[_.selector] && v["*"] ? R = xo(
      v[_.selector],
      v["*"]
    ) : R = v[_.selector] || v["*"], R && (p.nodes[0].nodes = _.nodes.reduce(ft(R), [])), p;
  }
  function Ct(p) {
    return p.nodes[0].nodes.reduce(function(v, _) {
      return v.push(
        `${_.prop}:${_.value}${_.important ? " !important" : ""}`
      ), v;
    }, []).join(";");
  }
  function ft(p) {
    return function(v, _) {
      return Ke(p, _.prop) && p[_.prop].some(function(xe) {
        return xe.test(_.value);
      }) && v.push(_), v;
    };
  }
  function ht(p, v, _) {
    return v ? (p = p.split(/\s+/), p.filter(function(R) {
      return v.indexOf(R) !== -1 || _.some(function(xe) {
        return xe.test(R);
      });
    }).join(" ")) : p;
  }
}
const w7 = {
  decodeEntities: !0
};
mn.defaults = {
  allowedTags: [
    "address",
    "article",
    "aside",
    "footer",
    "header",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hgroup",
    "main",
    "nav",
    "section",
    "blockquote",
    "dd",
    "div",
    "dl",
    "dt",
    "figcaption",
    "figure",
    "hr",
    "li",
    "main",
    "ol",
    "p",
    "pre",
    "ul",
    "a",
    "abbr",
    "b",
    "bdi",
    "bdo",
    "br",
    "cite",
    "code",
    "data",
    "dfn",
    "em",
    "i",
    "kbd",
    "mark",
    "q",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "time",
    "u",
    "var",
    "wbr",
    "caption",
    "col",
    "colgroup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr"
  ],
  disallowedTagsMode: "discard",
  allowedAttributes: {
    a: ["href", "name", "target"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"]
  },
  selfClosing: ["img", "br", "hr", "area", "base", "basefont", "input", "link", "meta"],
  allowedSchemes: ["http", "https", "ftp", "mailto", "tel"],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowProtocolRelative: !0,
  enforceHtmlBoundary: !1
};
mn.simpleTransform = function(t, e, n) {
  return n = n === void 0 ? !0 : n, e = e || {}, function(s, r) {
    let i;
    if (n)
      for (i in e)
        r[i] = e[i];
    else
      r = e;
    return {
      tagName: t,
      attribs: r
    };
  };
};
const v7 = y7;
function ko() {
  const t = document.querySelectorAll(".spoiler");
  console.log("Spoilers initialized."), t.forEach((e) => {
    e.classList.contains("spoiler-init") || (e.classList.add("spoiler-init"), e.addEventListener("click", () => {
      e.classList.toggle("spoiler-visible"), console.log(`Spoiler clicked: ${e}`);
    }));
  });
}
const _7 = {
  name: "spoiler",
  level: "inline",
  start(t) {
    var e;
    return (e = t.match(/\|\|(?!\s)/)) == null ? void 0 : e.index;
  },
  tokenizer(t) {
    const n = /^\|\|(?!\s)([^\n]+)(?!\s)\|\|/.exec(t);
    if (n)
      return { type: "spoiler", raw: n[0], inner: this.lexer.inlineTokens(n[1].trim()) };
  },
  renderer(t) {
    return `<span class="spoiler"><span>${this.parser.parseInline(t.inner)}</span></span>`;
  }
};
E.use({ extensions: [_7] });
const x7 = {
  allowedTags: [
    "address",
    "article",
    "aside",
    "footer",
    "header",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hgroup",
    "main",
    "nav",
    "section",
    "blockquote",
    "dd",
    "div",
    "dl",
    "dt",
    "figcaption",
    "figure",
    "hr",
    "li",
    "main",
    "ol",
    "p",
    "pre",
    "ul",
    "a",
    "abbr",
    "b",
    "bdi",
    "bdo",
    "br",
    "cite",
    "code",
    "data",
    "dfn",
    "em",
    "i",
    "kbd",
    "mark",
    "q",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "time",
    "u",
    "var",
    "wbr",
    "caption",
    "col",
    "colgroup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "img",
    "del"
  ],
  disallowedTagsMode: "discard",
  allowedAttributes: {
    a: ["href", "name", "target"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    i: ["emoji-src", "emoji-orig"]
  },
  allowedClasses: {
    span: ["spoiler"],
    i: ["custom-emoji"]
  },
  selfClosing: ["img", "br", "hr", "area", "base", "basefont", "input", "link", "meta"],
  allowedSchemes: ["http", "https", "ftp", "mailto", "tel"],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowProtocolRelative: !0,
  enforceHtmlBoundary: !1
};
function Hl(t) {
  return v7(t, x7);
}
function S7(t) {
  return Hl(E.parseInline(t));
}
function $Q(t) {
  return Hl(E.parse(t));
}
function $r(t) {
  return w.utc(w.duration(t, "seconds").asMilliseconds()).format("mm:ss");
}
function k7(t) {
  for (const e of ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]) {
    if (Math.abs(t) < 1024)
      return `${t.toFixed(1)} ${e}`;
    t /= 1024;
  }
  return "> 1024 PiB";
}
var T7 = Object.defineProperty, D7 = Object.getOwnPropertyDescriptor, Bs = (t, e, n, s) => {
  for (var r = s > 1 ? void 0 : s ? D7(e, n) : e, i = t.length - 1, o; i >= 0; i--)
    (o = t[i]) && (r = (s ? o(e, n, r) : o(r)) || r);
  return s && r && T7(e, n, r), r;
};
function O7(t, e) {
  const n = document.createElement("a");
  n.setAttribute("download", e), n.setAttribute("target", "_blank"), n.setAttribute("rel", "noopener noreferrer"), n.href = t, document.body.appendChild(n), n.click(), n.remove();
}
let Bt = class extends yn {
  constructor() {
    super(...arguments);
    Se(this, "f");
    Se(this, "hasHead");
  }
  fileThumbClick() {
    if (!this.f.media_type)
      return O7(this.f.url, this.f.url.split("/").slice(-1)[0]);
    this.play();
  }
  play() {
    return this.f;
  }
  get shouldDisplayDetail() {
    return !this.f.media_type || this.isAudioOrVoice;
  }
  get isAudioOrVoice() {
    return this.f.media_type == "audio_file" || this.f.media_type == "voice_message";
  }
  get fileTitle() {
    const e = this.f;
    if (!e.media_type)
      return e.url.split("/").slice(-1)[0];
    if (e.media_type == "voice_message")
      return "Voice Message";
    if (e.media_type == "audio_file") {
      let n = "";
      return e.performer && (n += e.performer + " - "), e.title && (n += e.title), n;
    }
  }
  get duration() {
    return $r(this.f.duration);
  }
  get size() {
    return k7(this.f.size);
  }
};
Bs([
  Wt({ required: !0 })
], Bt.prototype, "f", 2);
Bs([
  Wt({ required: !0 })
], Bt.prototype, "hasHead", 2);
Bs([
  xn("play")
], Bt.prototype, "play", 1);
Bt = Bs([
  ys({ components: {} })
], Bt);
const Hs = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [s, r] of e)
    n[s] = r;
  return n;
}, Vl = (t) => (ms("data-v-3db234f5"), t = t(), gs(), t), E7 = {
  key: 0,
  class: "file"
}, A7 = ["src"], C7 = {
  key: 0,
  class: "icon fbox-center"
}, M7 = /* @__PURE__ */ Vl(() => /* @__PURE__ */ F("i", { class: "fa-solid fa-play" }, null, -1)), P7 = [
  M7
], R7 = {
  key: 1,
  class: "icon fbox-center"
}, $7 = /* @__PURE__ */ Vl(() => /* @__PURE__ */ F("i", { class: "fa-solid fa-download" }, null, -1)), L7 = [
  $7
], N7 = { class: "detail fbox-vcenter" }, q7 = {
  key: 0,
  class: "title"
}, I7 = { class: "file-detail" }, U7 = {
  key: 0,
  class: "duration"
}, j7 = {
  key: 1,
  class: "size"
}, Y7 = {
  key: 1,
  class: "sticker"
}, F7 = ["src"], z7 = ["src"], B7 = ["src"], H7 = ["src"], V7 = ["src"];
function W7(t, e, n, s, r, i) {
  var o;
  return M(), L(Nt, null, [
    t.shouldDisplayDetail ? (M(), L("div", E7, [
      F("div", {
        class: "thumb clickable",
        onClick: e[0] || (e[0] = (...a) => t.fileThumbClick && t.fileThumbClick(...a))
      }, [
        F("img", {
          src: (o = t.f.thumb) != null ? o : "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
          alt: ""
        }, null, 8, A7),
        t.isAudioOrVoice ? (M(), L("div", C7, P7)) : re("", !0),
        t.f.media_type ? re("", !0) : (M(), L("div", R7, L7))
      ]),
      F("div", N7, [
        t.fileTitle ? (M(), L("div", q7, _e(t.fileTitle), 1)) : re("", !0),
        F("div", I7, [
          t.f.duration ? (M(), L("span", U7, _e(t.duration), 1)) : re("", !0),
          t.f.size ? (M(), L("span", j7, _e(t.size), 1)) : re("", !0)
        ])
      ])
    ])) : re("", !0),
    t.f.media_type === "sticker" ? (M(), L("div", Y7, [
      t.f.url.toLowerCase().endsWith("webm") ? (M(), L("video", {
        key: 0,
        src: t.f.url,
        preload: "auto",
        muted: "",
        autoplay: "",
        loop: "",
        playsinline: "",
        disablepictureinpicture: ""
      }, [
        t.f.thumb ? (M(), L("img", {
          key: 0,
          src: t.f.thumb,
          alt: ""
        }, null, 8, z7)) : re("", !0)
      ], 8, F7)) : (M(), L("img", {
        key: 1,
        src: t.f.url,
        alt: ""
      }, null, 8, B7))
    ])) : re("", !0),
    t.f.media_type === "video_file" || t.f.media_type === "animation" ? (M(), L("div", {
      key: 2,
      class: zn(["video", { "has-head": t.hasHead }])
    }, [
      F("video", {
        src: t.f.url,
        preload: "auto",
        muted: "",
        autoplay: "",
        loop: "",
        playsinline: "",
        disablepictureinpicture: ""
      }, [
        t.f.thumb ? (M(), L("img", {
          key: 0,
          src: t.f.thumb,
          alt: ""
        }, null, 8, V7)) : re("", !0)
      ], 8, H7)
    ], 2)) : re("", !0)
  ], 64);
}
const Wl = /* @__PURE__ */ Hs(Bt, [["render", W7], ["__scopeId", "data-v-3db234f5"]]);
var G7 = Object.defineProperty, Z7 = Object.getOwnPropertyDescriptor, ki = (t, e, n, s) => {
  for (var r = s > 1 ? void 0 : s ? Z7(e, n) : e, i = t.length - 1, o; i >= 0; i--)
    (o = t[i]) && (r = (s ? o(e, n, r) : o(r)) || r);
  return s && r && G7(e, n, r), r;
};
let gn = class extends yn {
  constructor() {
    super(...arguments);
    Se(this, "p");
    Se(this, "postsUrl");
  }
  get text() {
    if (!!this.p.text)
      return S7(this.p.text);
  }
  getImageStyle(e, n) {
    return {};
  }
  clickReply() {
    document.getElementById(`message-${this.p.reply.id}`).scrollIntoView({ behavior: "smooth", block: "end" });
  }
  mounted() {
    this.initEmoji();
  }
  replaceUrl(e) {
    return new URL(e, this.postsUrl).toString();
  }
  initEmoji() {
    document.querySelectorAll("i.custom-emoji:not(.init)").forEach((e) => {
      const n = this.replaceUrl(e.getAttribute("emoji-src"));
      e.classList.add("init"), n.endsWith("webm") ? e.innerHTML = `<video src="${n}" preload="auto" muted autoplay loop playsinline disablepictureinpicture></video>` : e.innerHTML = `<img src="${n}" alt="">`;
    });
  }
};
ki([
  Wt({ required: !0 })
], gn.prototype, "p", 2);
ki([
  Wt({ required: !0 })
], gn.prototype, "postsUrl", 2);
gn = ki([
  ys({ components: { FileView: Wl } })
], gn);
const Ti = (t) => (ms("data-v-5830bbb5"), t = t(), gs(), t), Q7 = ["id"], J7 = { class: "head unselectable" }, X7 = {
  key: 0,
  class: "forward"
}, K7 = ["src"], eQ = { class: "mtext" }, tQ = /* @__PURE__ */ Ti(() => /* @__PURE__ */ F("div", { class: "reply-to" }, "Reply to:", -1)), nQ = ["innerHTML"], sQ = ["src"], rQ = {
  key: 3,
  class: "files"
}, iQ = ["innerHTML"], oQ = { class: "info font-code unselectable" }, aQ = { class: "id" }, lQ = /* @__PURE__ */ Ti(() => /* @__PURE__ */ F("div", { class: "f-grow1" }, null, -1)), cQ = {
  key: 0,
  class: "author"
}, uQ = { class: "date" }, fQ = {
  key: 1,
  class: "views"
}, hQ = /* @__PURE__ */ Ti(() => /* @__PURE__ */ F("i", { class: "fas fa-eye" }, null, -1));
function dQ(t, e, n, s, r, i) {
  const o = ir("FileView");
  return M(), L("div", {
    class: zn(["post tgb-card", { service: t.p.type === "service" }]),
    id: `message-${t.p.id}`
  }, [
    F("div", J7, [
      t.p.forwarded_from ? (M(), L("div", X7, "Forwarded from: " + _e(t.p.forwarded_from), 1)) : re("", !0)
    ]),
    t.p.reply ? (M(), L("div", {
      key: 0,
      class: "reply undraggable clickable",
      onClick: e[0] || (e[0] = (...a) => t.clickReply && t.clickReply(...a))
    }, [
      t.p.reply.thumb ? (M(), L("img", {
        key: 0,
        class: "thumb",
        src: t.p.reply.thumb,
        alt: ""
      }, null, 8, K7)) : re("", !0),
      F("div", eQ, [
        tQ,
        F("span", {
          innerHTML: t.p.reply.text
        }, null, 8, nQ)
      ])
    ])) : re("", !0),
    t.p.images && t.p.images.length === 1 ? (M(), L("div", {
      key: 1,
      class: zn(["images", { "has-head": t.p.reply || t.p.forwarded_from }])
    }, [
      (M(!0), L(Nt, null, Bn(t.p.images, (a) => (M(), L("img", {
        key: a.url,
        src: a.url,
        alt: "image"
      }, null, 8, sQ))), 128))
    ], 2)) : re("", !0),
    t.p.images && t.p.images.length !== 1 ? (M(), L("div", {
      key: 2,
      class: zn(["images", { "has-head": t.p.reply || t.p.forwarded_from }])
    }, [
      (M(!0), L(Nt, null, Bn(t.p.images, (a) => (M(), L("div", {
        class: "img",
        key: a[0],
        style: nc({ "background-image": `url(${a.url})`, ...t.getImageStyle(t.p, a) })
      }, null, 4))), 128))
    ], 2)) : re("", !0),
    t.p.files ? (M(), L("div", rQ, [
      (M(!0), L(Nt, null, Bn(t.p.files, (a) => (M(), or(o, {
        f: a,
        "has-head": !!(t.p.reply || t.p.forwarded_from || t.p.images),
        onPlay: e[1] || (e[1] = (l) => t.$emit("play", l))
      }, null, 8, ["f", "has-head"]))), 256))
    ])) : re("", !0),
    F("div", {
      class: "text",
      innerHTML: t.text
    }, null, 8, iQ),
    F("div", oQ, [
      F("div", aQ, "#" + _e(t.p.id), 1),
      lQ,
      t.p.author ? (M(), L("div", cQ, _e(t.p.author), 1)) : re("", !0),
      F("div", uQ, _e(t.p.date), 1),
      t.p.views ? (M(), L("div", fQ, [
        Hn(_e(t.p.views), 1),
        hQ
      ])) : re("", !0)
    ])
  ], 10, Q7);
}
const Gl = /* @__PURE__ */ Hs(gn, [["render", dQ], ["__scopeId", "data-v-5830bbb5"]]);
var pQ = Object.defineProperty, mQ = Object.getOwnPropertyDescriptor, At = (t, e, n, s) => {
  for (var r = s > 1 ? void 0 : s ? mQ(e, n) : e, i = t.length - 1, o; i >= 0; i--)
    (o = t[i]) && (r = (s ? o(e, n, r) : o(r)) || r);
  return s && r && pQ(e, n, r), r;
};
let at = class extends yn {
  constructor() {
    super(...arguments);
    Se(this, "audio");
    Se(this, "playing", null);
    Se(this, "duration", "00:00");
    Se(this, "time", "00:00");
  }
  mounted() {
    this.init();
  }
  pause() {
    this.playing.pause(), this.$forceUpdate();
  }
  play() {
    this.playing.play(), this.$forceUpdate();
  }
  next() {
  }
  prev() {
  }
  unmounted() {
    this.playing && this.playing.pause();
  }
  init() {
    this.playing && !this.playing.paused && this.playing.pause(), this.playing = new Audio(), this.playing.src = this.audio.url, this.playing.onloadedmetadata = () => {
      this.duration = $r(this.playing.duration);
    }, this.playing.ontimeupdate = () => {
      this.time = $r(this.playing.currentTime);
    }, this.playing.onended = () => {
      this.$forceUpdate(), this.next();
    }, this.playing.play();
  }
};
At([
  Wt({ required: !0 })
], at.prototype, "audio", 2);
At([
  xn("pause")
], at.prototype, "pause", 1);
At([
  xn("play")
], at.prototype, "play", 1);
At([
  xn("next")
], at.prototype, "next", 1);
At([
  xn("prev")
], at.prototype, "prev", 1);
At([
  _d("audio")
], at.prototype, "init", 1);
at = At([
  ys({ components: {} })
], at);
const Zl = (t) => (ms("data-v-6f59b972"), t = t(), gs(), t), gQ = { id: "AudioPlayer" }, yQ = { class: "wrap" }, bQ = { class: "unselectable" }, wQ = { class: "control" }, vQ = /* @__PURE__ */ Zl(() => /* @__PURE__ */ F("span", { class: "f-grow1" }, null, -1)), _Q = { class: "play-button clickable" }, xQ = /* @__PURE__ */ Zl(() => /* @__PURE__ */ F("span", { class: "f-grow1" }, null, -1));
function SQ(t, e, n, s, r, i) {
  var o;
  return M(), L("div", gQ, [
    F("div", yQ, [
      F("div", bQ, _e(t.audio.performer) + " - " + _e(t.audio.title), 1),
      F("div", wQ, [
        F("span", null, _e(this.time), 1),
        vQ,
        F("i", {
          class: "fas fa-backward clickable",
          onClick: e[0] || (e[0] = (...a) => t.prev && t.prev(...a))
        }),
        F("span", _Q, [
          (o = t.playing) != null && o.paused ? (M(), L("i", {
            key: 0,
            class: "fas fa-play",
            onClick: e[1] || (e[1] = (...a) => t.play && t.play(...a))
          })) : (M(), L("i", {
            key: 1,
            class: "fas fa-pause",
            onClick: e[2] || (e[2] = (...a) => t.pause && t.pause(...a))
          }))
        ]),
        F("i", {
          class: "fas fa-forward clickable",
          onClick: e[3] || (e[3] = (...a) => t.next && t.next(...a))
        }),
        xQ,
        F("span", null, _e(this.duration), 1)
      ])
    ])
  ]);
}
const Ql = /* @__PURE__ */ Hs(at, [["render", SQ], ["__scopeId", "data-v-6f59b972"]]);
var kQ = Object.defineProperty, TQ = Object.getOwnPropertyDescriptor, Jl = (t, e, n, s) => {
  for (var r = s > 1 ? void 0 : s ? TQ(e, n) : e, i = t.length - 1, o; i >= 0; i--)
    (o = t[i]) && (r = (s ? o(e, n, r) : o(r)) || r);
  return s && r && kQ(e, n, r), r;
};
let ps = class extends yn {
  constructor() {
    super(...arguments);
    Se(this, "posts", []);
    Se(this, "postsUrl");
    Se(this, "audio", null);
    Se(this, "fail", null);
  }
  get audios() {
    return this.posts.filter((e) => {
      var n, s;
      return ((s = (n = e.files) == null ? void 0 : n.at(0)) == null ? void 0 : s.media_type) == "audio_file";
    }).flatMap((e) => e.files);
  }
  audioNext(e) {
    this.audio = this.audios.at(this.audios.indexOf(this.audio) + e);
  }
  replaceUrl(e) {
    return new URL(e, this.postsUrl).toString();
  }
  created() {
    fetch(this.postsUrl).then((e) => e.json()).then((e) => {
      this.posts = e, this.posts.forEach((n) => n.date = w(n.date).format("YYYY-MM-DD h:mm")), this.posts.reverse(), this.posts = this.posts.filter((n) => n.type !== "service"), this.posts.forEach((n) => {
        var s, r, i;
        (s = n.images) == null || s.forEach((o) => o.url = this.replaceUrl(o.url)), (r = n.reply) != null && r.thumb && (n.reply.thumb = this.replaceUrl(n.reply.thumb)), (i = n.files) == null || i.forEach((o) => {
          o.url = this.replaceUrl(o.url), o.thumb && (o.thumb = this.replaceUrl(o.thumb));
        });
      }), console.log(e), setTimeout(() => ko(), 100);
    }).catch((e) => {
      this.fail = e;
    });
  }
  updated() {
    ko();
  }
};
Jl([
  Wt({ required: !0 })
], ps.prototype, "postsUrl", 2);
ps = Jl([
  ys({ components: { AudioPlayer: Ql, PostView: Gl } })
], ps);
const DQ = (t) => (ms("data-v-09c90e73"), t = t(), gs(), t), OQ = {
  key: 0,
  class: "error tgb-card"
}, EQ = /* @__PURE__ */ DQ(() => /* @__PURE__ */ F("br", null, null, -1)), AQ = {
  key: 1,
  id: "Life"
};
function CQ(t, e, n, s, r, i) {
  const o = ir("PostView"), a = ir("AudioPlayer");
  return M(), L(Nt, null, [
    t.fail ? (M(), L("div", OQ, [
      F("h2", null, [
        Hn("Failed loading posts from: "),
        EQ,
        Hn(_e(t.postsUrl), 1)
      ]),
      Hn(" " + _e(t.fail), 1)
    ])) : re("", !0),
    t.posts.length !== 0 ? (M(), L("div", AQ, [
      (M(!0), L(Nt, null, Bn(t.posts, (l) => (M(), or(o, {
        p: l,
        postsUrl: t.postsUrl,
        key: l.id,
        onPlay: e[0] || (e[0] = (c) => t.audio = c)
      }, null, 8, ["p", "postsUrl"]))), 128)),
      t.audio ? (M(), or(a, {
        key: 0,
        audio: t.audio,
        onPrev: e[1] || (e[1] = (l) => t.audioNext(-1)),
        onNext: e[2] || (e[2] = (l) => t.audioNext(1))
      }, null, 8, ["audio"])) : re("", !0)
    ])) : re("", !0)
  ], 64);
}
const MQ = /* @__PURE__ */ Hs(ps, [["render", CQ], ["__scopeId", "data-v-09c90e73"]]), To = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TgBlog: MQ,
  AudioPlayer: Ql,
  FileView: Wl,
  PostView: Gl
}, Symbol.toStringTag, { value: "Module" }));
function LQ(t) {
  for (const e in To)
    t.component(e, To[e]);
}
export {
  Ql as AudioPlayer,
  Wl as FileView,
  Gl as PostView,
  MQ as TgBlog,
  LQ as default,
  $r as durationFmt,
  ko as initSpoilers,
  $Q as mdParse,
  S7 as mdParseInline,
  Hl as sanitize,
  k7 as sizeFmt
};
