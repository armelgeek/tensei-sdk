'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('proxy-polyfill');
const Axios = require('axios');
const AsyncStorage = require('@react-native-async-storage/async-storage');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

const Axios__default = /*#__PURE__*/_interopDefaultLegacy(Axios);
const AsyncStorage__default = /*#__PURE__*/_interopDefaultLegacy(AsyncStorage);

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
class LocalStorageStore {
  constructor(name, os) {
    this.name = name;
    this.os = os;
    this.target = os == "android" ? AsyncStorage__default["default"] : localStorage;
  }
  set(value) {
    this.target.setItem(this.name, JSON.stringify(value));
  }
  get() {
    try {
      return JSON.parse(this.target.getItem(this.name) || "");
    } catch (error) {
      return null;
    }
  }
  clear() {
    return this.target.removeItem(this.name);
  }
}
function isBrowser() {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}
function getLocation(href) {
  var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
  return match && {
    protocol: match[1],
    host: match[2]
  };
}
class AuthAPI {
  constructor(instance, options) {
    this.instance = instance;
    this.options = options;
    this.session_interval = null;
    this.listen = (fn) => {
      this.on_auth_update = fn;
    };
    this.storage = new LocalStorageStore("___tensei__session___");
  }
  async loadExistingSession() {
    if (this.usesRefreshTokens()) {
      this.silentLogin();
    }
    if (this.usesAccessTokens()) {
      await this.me();
    }
  }
  async me() {
    const session = this.storage.get();
    if (!session || !this.isSessionValid(session)) {
      this.logout();
      return null;
    }
    let response;
    try {
      response = await this.instance.get("me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });
    } catch (errors) {
      this.logout();
      throw errors;
    }
    this.auth_response = {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn
    };
    this.updateUser(response.data.data);
    this.setAuthorizationHeader();
    return this.auth_response;
  }
  getUserKey() {
    return "user";
  }
  session() {
    return this.auth_response;
  }
  async login(payload) {
    const response = await this.instance.post("login", payload.object);
    this.auth_response = response.data.data;
    this.invokeAuthChange();
    if (payload.skipAuthentication) {
      return response;
    }
    this.setAuthorizationHeader();
    this.authenticateWithRefreshTokens();
    this.authenticateWithAccessTokens();
    return response;
  }
  usesRefreshTokens() {
    var _a;
    return (_a = this.options) == null ? void 0 : _a.refreshTokens;
  }
  usesAccessTokens() {
    var _a;
    return !((_a = this.options) == null ? void 0 : _a.refreshTokens);
  }
  async silentLogin() {
    if (!isBrowser()) {
      return;
    }
    const session = this.storage.get();
    if (!session || !this.isRefreshSessionValid(session)) {
      return this.logout();
    }
    try {
      const response = await this.refreshToken({ token: session.refreshToken });
      this.auth_response = response.data.data;
      this.invokeAuthChange();
      this.authenticateWithRefreshTokens();
      this.authenticateWithAccessTokens();
    } catch (errors) {
      this.logout();
    }
  }
  invokeAuthChange() {
    if (this.on_auth_update) {
      this.on_auth_update(this.auth_response);
    }
  }
  setAuthorizationHeader() {
    var _a;
    this.instance.defaults.headers.common = {
      Authorization: `Bearer ${(_a = this.auth_response) == null ? void 0 : _a.accessToken}`
    };
  }
  authenticateWithAccessTokens() {
    this.setAuthorizationHeader();
    if (!isBrowser()) {
      return;
    }
    if (!this.usesAccessTokens()) {
      return;
    }
    if (!this.auth_response) {
      return;
    }
    const token_expires_at = new Date();
    token_expires_at.setSeconds(token_expires_at.getSeconds() + this.auth_response.expiresIn);
    this.storage.set({
      currentTime: new Date().toISOString(),
      expiresIn: this.auth_response.expiresIn,
      accessToken: this.auth_response.accessToken,
      accessTokenExpiresAt: token_expires_at.toISOString()
    });
  }
  authenticateWithRefreshTokens() {
    var _a, _b;
    this.setAuthorizationHeader();
    if (!this.usesRefreshTokens()) {
      return;
    }
    if (!isBrowser()) {
      return;
    }
    if (!((_a = this.auth_response) == null ? void 0 : _a.refreshToken) || !((_b = this.auth_response) == null ? void 0 : _b.accessToken)) {
      return;
    }
    const currentTime = new Date().toISOString();
    this.storage.set({
      currentTime,
      refreshToken: this.auth_response.refreshToken,
      accessTokenExpiresIn: this.auth_response.expiresIn
    });
    if (this.session_interval) {
      return;
    }
    this.session_interval = setInterval(() => {
      this.silentLogin();
    }, (this.auth_response.expiresIn - 10) * 1e3);
  }
  refreshToken(payload) {
    return this.instance.get("refresh-token", {
      headers: {
        "x-tensei-refresh-token": payload.token
      }
    });
  }
  isSessionValid(session) {
    const token_expires_at = new Date(session.accessTokenExpiresAt);
    return token_expires_at > new Date();
  }
  isRefreshSessionValid(session) {
    const token_created_at = new Date(session.currentTime);
    token_created_at.setSeconds(token_created_at.getSeconds() + session.accessTokenExpiresIn);
    return token_created_at > new Date();
  }
  logout() {
    if (this.session_interval) {
      clearInterval(this.session_interval);
    }
    if (isBrowser()) {
      this.storage.clear();
    }
    this.auth_response = void 0;
    this.invokeAuthChange();
    delete this.instance.defaults.headers.common["Authorization"];
  }
  async register(payload) {
    const response = await this.instance.post("register", payload.object);
    this.auth_response = response.data.data;
    this.invokeAuthChange();
    if (payload.skipAuthentication) {
      return response;
    }
    this.authenticateWithRefreshTokens();
    this.authenticateWithAccessTokens();
    return response;
  }
  forgotPassword(payload) {
    return this.instance.post("passwords/email", payload.object);
  }
  resetPassword(payload) {
    return this.instance.post("passwords/reset", payload.object);
  }
  async resendVerificationEmail() {
    return this.instance.post("emails/verification/resend");
  }
  async confirmEmail(payload) {
    const response = await this.instance.post("emails/verification/confirm", payload.object);
    this.updateUser(response.data.data);
    return response;
  }
  async enableTwoFactor() {
    const response = await this.instance.post("two-factor/enable");
    this.updateUser(response.data.data);
    return response;
  }
  updateUser(user) {
    if (!this.auth_response) {
      return;
    }
    const key = this.getUserKey();
    this.auth_response[key] = user[key] ? user[key] : user;
    this.invokeAuthChange();
  }
  async confirmEnableTwoFactor(payload) {
    var _a;
    const response = await this.instance.post("two-factor/confirm", {
      token: (_a = payload == null ? void 0 : payload.object) == null ? void 0 : _a.token
    });
    this.updateUser(response.data.data);
    return response;
  }
  async disableTwoFactor(payload) {
    var _a;
    const response = await this.instance.post("two-factor/disable", {
      token: (_a = payload == null ? void 0 : payload.object) == null ? void 0 : _a.token
    });
    this.updateUser(response.data.data);
    return response;
  }
  socialRedirectUrl(provider) {
    const { protocol, host } = getLocation(this.instance.defaults.baseURL);
    return `${protocol}//${host}/connect/${provider}`;
  }
  async handleSocial(type, payload) {
    let response;
    try {
      response = await this.instance.post(`social/${type}`, payload.object);
    } catch (errors) {
      this.logout();
      throw errors;
    }
    this.auth_response = response.data.data;
    this.invokeAuthChange();
    if (payload.skipAuthentication) {
      return response;
    }
    this.setAuthorizationHeader();
    this.authenticateWithRefreshTokens();
    this.authenticateWithAccessTokens();
    return response;
  }
  async socialLogin(payload) {
    return this.handleSocial("login", this.getSocialPayload(payload));
  }
  async socialRegister(payload) {
    return this.handleSocial("register", this.getSocialPayload(payload));
  }
  getSocialPayload(payload) {
    if (!(payload == null ? void 0 : payload.object)) {
      return {
        ...payload || {},
        object: {
          accessToken: getUrlParameter("accessToken")
        }
      };
    }
    return payload;
  }
  socialConfirm(payload) {
    try {
      return this.handleSocial("confirm", this.getSocialPayload(payload));
    } catch (errors) {
      this.logout();
      throw errors;
    }
  }
}

let dashed = (s) => s.replace(/[A-Z]/g, "-$&").toLowerCase();
class BaseSdk {
  constructor(options) {
    this.options = options;
    var _a;
    this.instance = (options == null ? void 0 : options.axiosInstance) || Axios__default["default"].create({
      baseURL: ((_a = this.options) == null ? void 0 : _a.url) || "http://localhost:8810/api",
      ...(options == null ? void 0 : options.axiosRequestConfig) || {}
    });
    this.authInstance = new AuthAPI(this.instance, this.options);
    this.instance.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
  }
  auth() {
    return this.authInstance;
  }
}
function getSdk(instance, slug) {
  return function() {
    return {
      find(payload = {}) {
        return instance.get(`${slug}/${payload.id}`);
      },
      findMany(payload = {}) {
        var _a, _b, _c, _d;
        return instance.get(slug, {
          params: {
            populate: ((_a = payload == null ? void 0 : payload.populate) == null ? void 0 : _a.join(",")) || [],
            perPage: (_b = payload == null ? void 0 : payload.pagination) == null ? void 0 : _b.perPage,
            page: (_c = payload == null ? void 0 : payload.pagination) == null ? void 0 : _c.page,
            fields: ((_d = payload == null ? void 0 : payload.fields) == null ? void 0 : _d.join(",")) || void 0,
            where: payload == null ? void 0 : payload.where
          }
        });
      },
      insert(payload) {
        return instance.post(slug, payload.object);
      },
      insertMany(payload) {
        return instance.post(`${slug}/bulk`, payload);
      },
      update(payload) {
        return instance.patch(`${slug}/${payload.id}`, payload.object);
      },
      updateMany(payload) {
        return instance.patch(`${slug}/bulk`, payload);
      },
      delete(payload) {
        return instance.delete(`${slug}/${payload.id}`);
      },
      deleteMany(payload) {
        return instance.delete(slug, {
          params: {
            where: payload.where
          }
        });
      }
    };
  };
}
class Sdk extends BaseSdk {
  constructor(options) {
    super(options);
    this.options = options;
    const { instance } = this;
    return new Proxy(this, {
      get(target, method) {
        if (target[method] === void 0) {
          return getSdk(instance, dashed(method.toString()));
        }
        return target[method];
      }
    });
  }
}
const sdk = (options) => new Sdk(options);
exports.SortQueryInput = void 0;
(function(SortQueryInput2) {
  SortQueryInput2["ASC"] = "asc";
  SortQueryInput2["ASC_NULLS_LAST"] = "asc_nulls_last";
  SortQueryInput2["ASC_NULLS_FIRST"] = "asc_nulls_first";
  SortQueryInput2["DESC"] = "desc";
  SortQueryInput2["DESC_NULLS_LAST"] = "desc_nulls_last";
  SortQueryInput2["DESC_NULLS_FIRST"] = "desc_nulls_first";
})(exports.SortQueryInput || (exports.SortQueryInput = {}));

exports.Sdk = Sdk;
exports.sdk = sdk;
