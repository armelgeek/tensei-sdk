"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAll = exports.removeDataMultiple = exports.setDataMultiple = exports.getDataMultiple = exports.getAllKeys = exports.removeData = exports.getData = exports.setData = void 0;
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var partKeyPrefix = '@___PART___';
var partKeyPrefixRxp = /^@___PART___/;
var keySplit = ',';
var limit = 500000;
var buildData = function (key, value, datas) {
    var valueStr = JSON.stringify(value);
    if (valueStr.length <= limit)
        return datas.push([key, valueStr]);
    var partKeys = [];
    for (var i = 0, len = Math.floor(valueStr.length / limit); i <= len; i++) {
        var partKey = "".concat(partKeyPrefix).concat(key).concat(i);
        partKeys.push(partKey);
        datas.push([partKey, valueStr.substring(i * limit, (i + 1) * limit)]);
    }
    datas.push([key, "".concat(partKeyPrefix).concat(partKeys.join(keySplit))]);
    return datas;
};
var handleGetData = function (partKeys) {
    partKeys = partKeys.replace(partKeyPrefixRxp, '').split(keySplit);
    return async_storage_1.default.multiGet(partKeys).then(function (datas) {
        return JSON.parse(datas.map(function (data) { return data[1]; }).join(''));
    });
};
var setData = function (key, value) { return __awaiter(void 0, void 0, void 0, function () {
    var datas, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                datas = [];
                buildData(key, value, datas);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, async_storage_1.default.multiSet(datas)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                // saving error
                console.log(e_1.message);
                throw e_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.setData = setData;
var getData = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    var value, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.getItem(key)];
            case 1:
                value = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                // error reading value
                console.log(e_2.message);
                throw e_2;
            case 3:
                if (partKeyPrefixRxp.test(value)) {
                    return [2 /*return*/, handleGetData(value)];
                }
                else if (value)
                    value = JSON.parse(value);
                return [2 /*return*/, value];
        }
    });
}); };
exports.getData = getData;
var removeData = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    var value, e_3, partKeys, e_4, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.getItem(key)];
            case 1:
                value = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_3 = _a.sent();
                // error reading value
                console.log(e_3.message);
                throw e_3;
            case 3:
                if (!partKeyPrefixRxp.test(value)) return [3 /*break*/, 8];
                partKeys = value.replace(partKeyPrefixRxp, '').split(keySplit);
                partKeys.push(key);
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, async_storage_1.default.multiRemove(partKeys)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                e_4 = _a.sent();
                // remove error
                console.log(e_4.message);
                throw e_4;
            case 7: return [3 /*break*/, 11];
            case 8:
                _a.trys.push([8, 10, , 11]);
                return [4 /*yield*/, async_storage_1.default.removeItem(key)];
            case 9:
                _a.sent();
                return [3 /*break*/, 11];
            case 10:
                e_5 = _a.sent();
                // remove error
                console.log(e_5.message);
                throw e_5;
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.removeData = removeData;
var getAllKeys = function () { return __awaiter(void 0, void 0, void 0, function () {
    var keys, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.getAllKeys()];
            case 1:
                keys = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_6 = _a.sent();
                // read key error
                console.log(e_6.message);
                throw e_6;
            case 3: return [2 /*return*/, keys];
        }
    });
}); };
exports.getAllKeys = getAllKeys;
var getDataMultiple = function (keys) { return __awaiter(void 0, void 0, void 0, function () {
    var datas, e_7, promises, _i, datas_1, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.multiGet(keys)];
            case 1:
                datas = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_7 = _a.sent();
                // read error
                console.log(e_7.message);
                throw e_7;
            case 3:
                promises = [];
                for (_i = 0, datas_1 = datas; _i < datas_1.length; _i++) {
                    data = datas_1[_i];
                    if (partKeyPrefixRxp.test(data[1])) {
                        promises.push(handleGetData(data[1]));
                    }
                    else {
                        promises.push(Promise.resolve(data[1] ? JSON.parse(data[1]) : data[1]));
                    }
                }
                return [2 /*return*/, Promise.all(promises).then(function (values) {
                        return datas.map(function (_a, index) {
                            var key = _a[0];
                            return ({ key: key, value: values[index] });
                        });
                    })];
        }
    });
}); };
exports.getDataMultiple = getDataMultiple;
var setDataMultiple = function (datas) { return __awaiter(void 0, void 0, void 0, function () {
    var allData, _i, datas_2, _a, key, value, e_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                allData = [];
                for (_i = 0, datas_2 = datas; _i < datas_2.length; _i++) {
                    _a = datas_2[_i], key = _a.key, value = _a.value;
                    buildData(key, value, allData);
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, async_storage_1.default.multiSet(allData)];
            case 2:
                _b.sent();
                return [3 /*break*/, 4];
            case 3:
                e_8 = _b.sent();
                // save error
                console.log(e_8.message);
                throw e_8;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.setDataMultiple = setDataMultiple;
var removeDataMultiple = function (keys) { return __awaiter(void 0, void 0, void 0, function () {
    var datas, allKeys, _i, datas_3, _a, key, value, e_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!keys.length)
                    return [2 /*return*/];
                return [4 /*yield*/, async_storage_1.default.multiGet(keys)];
            case 1:
                datas = _b.sent();
                allKeys = [];
                for (_i = 0, datas_3 = datas; _i < datas_3.length; _i++) {
                    _a = datas_3[_i], key = _a[0], value = _a[1];
                    allKeys.push(key);
                    if (partKeyPrefixRxp.test(value)) {
                        allKeys.push.apply(allKeys, value.replace(partKeyPrefixRxp, '').split(keySplit));
                    }
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, async_storage_1.default.multiRemove(allKeys)];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                e_9 = _b.sent();
                // remove error
                console.log(e_9.message);
                throw e_9;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.removeDataMultiple = removeDataMultiple;
var clearAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.clear()];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_10 = _a.sent();
                // clear error
                console.log(e_10.message);
                throw e_10;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.clearAll = clearAll;
