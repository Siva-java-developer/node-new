"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const user_routes_1 = __importDefault(require("./routers/user.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
//Define Router
app.use('/v1/user', user_routes_1.default);
app.listen(config_1.default.server, () => {
    mongoose_1.default
        .connect(config_1.default.mongo.url, { retryWrites: true, w: 'majority' })
        .then(() => {
        console.log('Connected to mongoDB.');
    })
        .catch((error) => {
        console.log('Unable to connect.');
    });
});
//# sourceMappingURL=index.js.map