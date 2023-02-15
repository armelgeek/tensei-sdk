"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortQueryInput = exports.sdk = exports.Sdk = void 0;
require("proxy-polyfill");
var axios_1 = __importDefault(require("axios"));
var auth_1 = require("./auth");
var dashed = function (s) { return s.replace(/[A-Z]/g, '-$&').toLowerCase(); };
var BaseSdk = /** @class */ (function () {
    function BaseSdk(options) {
        var _a;
        this.options = options;
        this.instance =
            (options === null || options === void 0 ? void 0 : options.axiosInstance) ||
                axios_1.default.create(__assign({ baseURL: ((_a = this.options) === null || _a === void 0 ? void 0 : _a.url) || 'http://localhost:8810/api' }, ((options === null || options === void 0 ? void 0 : options.axiosRequestConfig) || {})));
        this.authInstance = new auth_1.AuthAPI(this.instance, this.options);
        this.instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    }
    BaseSdk.prototype.auth = function () {
        return this.authInstance;
    };
    return BaseSdk;
}());
function getSdk(instance, slug) {
    return function () {
        return {
            find: function (payload) {
                if (payload === void 0) { payload = {}; }
                return instance.get("".concat(slug, "/").concat(payload.id));
            },
            findMany: function (payload) {
                var _a, _b, _c, _d;
                if (payload === void 0) { payload = {}; }
                return instance.get(slug, {
                    params: {
                        populate: ((_a = payload === null || payload === void 0 ? void 0 : payload.populate) === null || _a === void 0 ? void 0 : _a.join(',')) || [],
                        perPage: (_b = payload === null || payload === void 0 ? void 0 : payload.pagination) === null || _b === void 0 ? void 0 : _b.perPage,
                        page: (_c = payload === null || payload === void 0 ? void 0 : payload.pagination) === null || _c === void 0 ? void 0 : _c.page,
                        fields: ((_d = payload === null || payload === void 0 ? void 0 : payload.fields) === null || _d === void 0 ? void 0 : _d.join(',')) || undefined,
                        where: payload === null || payload === void 0 ? void 0 : payload.where
                    }
                });
            },
            insert: function (payload) {
                return instance.post(slug, payload.object);
            },
            insertMany: function (payload) {
                return instance.post("".concat(slug, "/bulk"), payload);
            },
            update: function (payload) {
                return instance.patch("".concat(slug, "/").concat(payload.id), payload.object);
            },
            updateMany: function (payload) {
                return instance.patch("".concat(slug, "/bulk"), payload);
            },
            delete: function (payload) {
                return instance.delete("".concat(slug, "/").concat(payload.id));
            },
            deleteMany: function (payload) {
                return instance.delete(slug, {
                    params: {
                        where: payload.where
                    }
                });
            }
        };
    };
}
var Sdk = /** @class */ (function (_super) {
    __extends(Sdk, _super);
    function Sdk(options) {
        var _this = _super.call(this, options) || this;
        _this.options = options;
        var instance = _this.instance;
        return new Proxy(_this, {
            get: function (target, method) {
                if (target[method] === undefined) {
                    return getSdk(instance, dashed(method.toString()));
                }
                return target[method];
            }
        });
    }
    return Sdk;
}(BaseSdk));
exports.Sdk = Sdk;
var sdk = function (options) { return new Sdk(options); };
exports.sdk = sdk;
var SortQueryInput;
(function (SortQueryInput) {
    SortQueryInput["ASC"] = "asc";
    SortQueryInput["ASC_NULLS_LAST"] = "asc_nulls_last";
    SortQueryInput["ASC_NULLS_FIRST"] = "asc_nulls_first";
    SortQueryInput["DESC"] = "desc";
    SortQueryInput["DESC_NULLS_LAST"] = "desc_nulls_last";
    SortQueryInput["DESC_NULLS_FIRST"] = "desc_nulls_first";
})(SortQueryInput = exports.SortQueryInput || (exports.SortQueryInput = {}));
