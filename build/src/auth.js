"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthAPI = exports.LocalStorageStore = void 0;
var storage_1 = require("./storage");
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
var LocalStorageStore = /** @class */ (function () {
    function LocalStorageStore(name) {
        this.name = name;
    }
    LocalStorageStore.prototype.set = function (value) {
        (0, storage_1.setData)(this.name, JSON.stringify(value));
    };
    LocalStorageStore.prototype.get = function () {
        return (0, storage_1.getData)(this.name);
    };
    LocalStorageStore.prototype.clear = function () {
        return (0, storage_1.removeData)(this.name);
    };
    return LocalStorageStore;
}());
exports.LocalStorageStore = LocalStorageStore;
/**function isBrowser() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}**/
function getLocation(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return (match && {
        protocol: match[1],
        host: match[2]
    });
}
var AuthAPI = /** @class */ (function () {
    function AuthAPI(instance, options) {
        var _this = this;
        this.instance = instance;
        this.options = options;
        this.session_interval = null;
        this.listen = function (fn) {
            _this.on_auth_update = fn;
        };
        this.storage = new LocalStorageStore('___tensei__session___');
    }
    AuthAPI.prototype.loadExistingSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.usesRefreshTokens()) {
                            this.silentLogin();
                        }
                        if (!this.usesAccessTokens()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.me()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    AuthAPI.prototype.me = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session, response, errors_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.storage.get();
                        if (!session || !this.isSessionValid(session)) {
                            this.logout();
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.instance.get('me', {
                                headers: {
                                    Authorization: "Bearer ".concat(session.accessToken)
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        errors_1 = _a.sent();
                        this.logout();
                        throw errors_1;
                    case 4:
                        this.auth_response = {
                            accessToken: session.accessToken,
                            expiresIn: session.expiresIn
                        };
                        this.updateUser(response.data.data);
                        this.setAuthorizationHeader();
                        return [2 /*return*/, this.auth_response];
                }
            });
        });
    };
    AuthAPI.prototype.getUserKey = function () {
        return 'user';
    };
    AuthAPI.prototype.session = function () {
        return this.auth_response;
    };
    AuthAPI.prototype.login = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instance.post('login', payload.object)];
                    case 1:
                        response = _a.sent();
                        this.auth_response = response.data.data;
                        this.invokeAuthChange();
                        if (payload.skipAuthentication) {
                            return [2 /*return*/, response];
                        }
                        this.setAuthorizationHeader();
                        this.authenticateWithRefreshTokens();
                        this.authenticateWithAccessTokens();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AuthAPI.prototype.usesRefreshTokens = function () {
        var _a;
        return (_a = this.options) === null || _a === void 0 ? void 0 : _a.refreshTokens;
    };
    AuthAPI.prototype.usesAccessTokens = function () {
        var _a;
        return !((_a = this.options) === null || _a === void 0 ? void 0 : _a.refreshTokens);
    };
    AuthAPI.prototype.silentLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session, response, errors_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.storage.get();
                        if (!session || !this.isRefreshSessionValid(session)) {
                            return [2 /*return*/, this.logout()];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.refreshToken({ token: session.refreshToken })];
                    case 2:
                        response = _a.sent();
                        this.auth_response = response.data.data;
                        this.invokeAuthChange();
                        this.authenticateWithRefreshTokens();
                        this.authenticateWithAccessTokens();
                        return [3 /*break*/, 4];
                    case 3:
                        errors_2 = _a.sent();
                        this.logout();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthAPI.prototype.invokeAuthChange = function () {
        if (this.on_auth_update) {
            this.on_auth_update(this.auth_response);
        }
    };
    AuthAPI.prototype.setAuthorizationHeader = function () {
        var _a;
        this.instance.defaults.headers.common = {
            Authorization: "Bearer ".concat((_a = this.auth_response) === null || _a === void 0 ? void 0 : _a.accessToken)
        };
    };
    AuthAPI.prototype.authenticateWithAccessTokens = function () {
        this.setAuthorizationHeader();
        /**if (!isBrowser()) {
          return
        }**/
        if (!this.usesAccessTokens()) {
            return;
        }
        if (!this.auth_response) {
            return;
        }
        var token_expires_at = new Date();
        token_expires_at.setSeconds(token_expires_at.getSeconds() + this.auth_response.expiresIn);
        this.storage.set({
            currentTime: new Date().toISOString(),
            expiresIn: this.auth_response.expiresIn,
            accessToken: this.auth_response.accessToken,
            accessTokenExpiresAt: token_expires_at.toISOString()
        });
    };
    AuthAPI.prototype.authenticateWithRefreshTokens = function () {
        var _this = this;
        var _a, _b;
        this.setAuthorizationHeader();
        if (!this.usesRefreshTokens()) {
            return;
        }
        /**if (!isBrowser()) {
          return
        }**/
        // if refresh tokens are not turned on on the API:
        if (!((_a = this.auth_response) === null || _a === void 0 ? void 0 : _a.refreshToken) || !((_b = this.auth_response) === null || _b === void 0 ? void 0 : _b.accessToken)) {
            return;
        }
        var currentTime = new Date().toISOString();
        this.storage.set({
            currentTime: currentTime,
            refreshToken: this.auth_response.refreshToken,
            accessTokenExpiresIn: this.auth_response.expiresIn
        });
        if (this.session_interval) {
            return;
        }
        // Trigger a token refresh 10 seconds before the current access token expires.
        this.session_interval = setInterval(function () {
            _this.silentLogin();
        }, (this.auth_response.expiresIn - 10) * 1000);
    };
    AuthAPI.prototype.refreshToken = function (payload) {
        return this.instance.get('refresh-token', {
            headers: {
                'x-tensei-refresh-token': payload.token
            }
        });
    };
    AuthAPI.prototype.isSessionValid = function (session) {
        var token_expires_at = new Date(session.accessTokenExpiresAt);
        return token_expires_at > new Date();
    };
    AuthAPI.prototype.isRefreshSessionValid = function (session) {
        var token_created_at = new Date(session.currentTime);
        token_created_at.setSeconds(token_created_at.getSeconds() + session.accessTokenExpiresIn);
        return token_created_at > new Date();
    };
    AuthAPI.prototype.logout = function () {
        if (this.session_interval) {
            clearInterval(this.session_interval);
        }
        //if (isBrowser()) {
        this.storage.clear();
        //}
        this.auth_response = undefined;
        this.invokeAuthChange();
        delete this.instance.defaults.headers.common['Authorization'];
    };
    AuthAPI.prototype.register = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instance.post('register', payload.object)];
                    case 1:
                        response = _a.sent();
                        this.auth_response = response.data.data;
                        this.invokeAuthChange();
                        if (payload.skipAuthentication) {
                            return [2 /*return*/, response];
                        }
                        this.authenticateWithRefreshTokens();
                        this.authenticateWithAccessTokens();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AuthAPI.prototype.forgotPassword = function (payload) {
        return this.instance.post('passwords/email', payload.object);
    };
    AuthAPI.prototype.resetPassword = function (payload) {
        return this.instance.post('passwords/reset', payload.object);
    };
    AuthAPI.prototype.resendVerificationEmail = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.instance.post('emails/verification/resend')];
            });
        });
    };
    AuthAPI.prototype.confirmEmail = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instance.post('emails/verification/confirm', payload.object)];
                    case 1:
                        response = _a.sent();
                        this.updateUser(response.data.data);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AuthAPI.prototype.enableTwoFactor = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instance.post('two-factor/enable')];
                    case 1:
                        response = _a.sent();
                        this.updateUser(response.data.data);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AuthAPI.prototype.updateUser = function (user) {
        if (!this.auth_response) {
            return;
        }
        var key = this.getUserKey();
        this.auth_response[key] = user[key] ? user[key] : user;
        this.invokeAuthChange();
    };
    AuthAPI.prototype.confirmEnableTwoFactor = function (payload) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.instance.post('two-factor/confirm', {
                            token: (_a = payload === null || payload === void 0 ? void 0 : payload.object) === null || _a === void 0 ? void 0 : _a.token
                        })];
                    case 1:
                        response = _b.sent();
                        this.updateUser(response.data.data);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AuthAPI.prototype.disableTwoFactor = function (payload) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.instance.post('two-factor/disable', {
                            token: (_a = payload === null || payload === void 0 ? void 0 : payload.object) === null || _a === void 0 ? void 0 : _a.token
                        })];
                    case 1:
                        response = _b.sent();
                        this.updateUser(response.data.data);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AuthAPI.prototype.socialRedirectUrl = function (provider) {
        var _a = getLocation(this.instance.defaults.baseURL), protocol = _a.protocol, host = _a.host;
        return "".concat(protocol, "//").concat(host, "/connect/").concat(provider);
    };
    AuthAPI.prototype.handleSocial = function (type, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errors_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.instance.post("social/".concat(type), payload.object)];
                    case 1:
                        response = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        errors_3 = _a.sent();
                        this.logout();
                        throw errors_3;
                    case 3:
                        this.auth_response = response.data.data;
                        this.invokeAuthChange();
                        if (payload.skipAuthentication) {
                            return [2 /*return*/, response];
                        }
                        this.setAuthorizationHeader();
                        this.authenticateWithRefreshTokens();
                        this.authenticateWithAccessTokens();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AuthAPI.prototype.socialLogin = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handleSocial('login', this.getSocialPayload(payload))];
            });
        });
    };
    AuthAPI.prototype.socialRegister = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handleSocial('register', this.getSocialPayload(payload))];
            });
        });
    };
    AuthAPI.prototype.getSocialPayload = function (payload) {
        if (!(payload === null || payload === void 0 ? void 0 : payload.object)) {
            return __assign(__assign({}, (payload || {})), { object: {
                    accessToken: getUrlParameter('accessToken')
                } });
        }
        return payload;
    };
    AuthAPI.prototype.socialConfirm = function (payload) {
        try {
            return this.handleSocial('confirm', this.getSocialPayload(payload));
        }
        catch (errors) {
            this.logout();
            throw errors;
        }
    };
    return AuthAPI;
}());
exports.AuthAPI = AuthAPI;
