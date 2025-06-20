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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../model/user.model"));
class UserController {
    addUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.default.create({ firstName: request.body.firstName, lastName: request.body.lastName, uid: 0, });
            response.json({ status: true, message: "User saved" });
        });
    }
    getUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const IUSer = yield user_model_1.default.find();
            console.log(IUSer[0].lastName);
            response.json({ status: true, data: IUSer });
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map